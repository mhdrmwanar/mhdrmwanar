import { Request, Response } from 'express';
import { AppDataSource } from '../config/db';
import { User, UserRole, UserStatus } from '../models/userModel';
import { Transaction, TransactionStatus } from '../models/transactionModel';

// Extend Request type untuk include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    phone?: string;
}

interface UpdateUserRequest {
    username?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
    firstName?: string;
    lastName?: string;
    phone?: string;
}

class AdminController {
    /**
     * Dashboard admin - statistik umum
     */
    async getDashboard(req: Request, res: Response): Promise<void> {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const transactionRepo = AppDataSource.getRepository(Transaction);

            // Statistik users
            const totalUsers = await userRepo.count();
            const activeUsers = await userRepo.count({ where: { status: UserStatus.ACTIVE } });
            const adminUsers = await userRepo.count({ where: { role: UserRole.ADMIN } });

            // Statistik transactions
            const totalTransactions = await transactionRepo.count();
            const successTransactions = await transactionRepo.count({ where: { status: TransactionStatus.SUCCESS } });
            const pendingTransactions = await transactionRepo.count({ where: { status: TransactionStatus.PENDING } });
            const failedTransactions = await transactionRepo.count({ where: { status: TransactionStatus.FAILED } });

            // Total amount
            const totalAmountResult = await transactionRepo
                .createQueryBuilder('transaction')
                .select('SUM(transaction.amount)', 'total')
                .where('transaction.status = :status', { status: TransactionStatus.SUCCESS })
                .getRawOne();

            const totalAmount = totalAmountResult.total || 0;

            // Recent transactions
            const recentTransactions = await transactionRepo.find({
                relations: ['user'],
                order: { createdAt: 'DESC' },
                take: 10
            });

            // Recent users
            const recentUsers = await userRepo.find({
                order: { createdAt: 'DESC' },
                take: 10,
                select: ['id', 'username', 'email', 'role', 'status', 'createdAt']
            });

            res.status(200).json({
                success: true,
                data: {
                    statistics: {
                        users: {
                            total: totalUsers,
                            active: activeUsers,
                            admins: adminUsers,
                            inactive: totalUsers - activeUsers
                        },
                        transactions: {
                            total: totalTransactions,
                            success: successTransactions,
                            pending: pendingTransactions,
                            failed: failedTransactions,
                            totalAmount: totalAmount
                        }
                    },
                    recentTransactions: recentTransactions.map(t => ({
                        id: t.id,
                        transactionReference: t.transactionReference,
                        amount: t.amount,
                        currency: t.currency,
                        status: t.status,
                        createdAt: t.createdAt,
                        user: {
                            id: t.user.id,
                            username: t.user.username,
                            email: t.user.email
                        }
                    })),
                    recentUsers: recentUsers
                }
            });

        } catch (error) {
            console.error('Admin dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving dashboard data',
                error: error instanceof Error ? error.message : error
            });
            return;
            return;
        }
    }

    /**
     * Mendapatkan daftar semua users
     */
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const { page = 1, limit = 10, role, status, search } = req.query;

            const queryBuilder = userRepo.createQueryBuilder('user');

            // Filter by role
            if (role) {
                queryBuilder.andWhere('user.role = :role', { role });
            }

            // Filter by status
            if (status) {
                queryBuilder.andWhere('user.status = :status', { status });
            }

            // Search by username or email
            if (search) {
                queryBuilder.andWhere(
                    '(user.username LIKE :search OR user.email LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            // Pagination
            const skip = (Number(page) - 1) * Number(limit);
            queryBuilder.skip(skip).take(Number(limit));

            // Order by creation date
            queryBuilder.orderBy('user.createdAt', 'DESC');

            const [users, total] = await queryBuilder.getManyAndCount();

            // Remove password from response
            const safeUsers = users.map(user => {
                const { password, ...safeUser } = user;
                return safeUser;
            });

            res.status(200).json({
                success: true,
                data: {
                    users: safeUsers,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: total,
                        totalPages: Math.ceil(total / Number(limit))
                    }
                }
            });

        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving users',
                error: error instanceof Error ? error.message : error
            });
            return;
            return;
        }
    }

    /**
     * Mendapatkan detail user berdasarkan ID
     */
    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const transactionRepo = AppDataSource.getRepository(Transaction);
            const { userId } = req.params;

            const user = await userRepo.findOne({
                where: { id: parseInt(userId) }
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            return;
            return;
            }

            // Get user's transactions
            const transactions = await transactionRepo.find({
                where: { userId: parseInt(userId) },
                order: { createdAt: 'DESC' },
                take: 20
            });

            // Remove password from response
            const { password, ...safeUser } = user;

            res.status(200).json({
                success: true,
                data: {
                    user: safeUser,
                    transactions: transactions.map(t => ({
                        id: t.id,
                        transactionReference: t.transactionReference,
                        amount: t.amount,
                        currency: t.currency,
                        status: t.status,
                        paymentMethod: t.paymentMethod,
                        createdAt: t.createdAt,
                        processedAt: t.processedAt
                    }))
                }
            });

        } catch (error) {
            console.error('Get user by id error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving user',
                error: error instanceof Error ? error.message : error
            });
            return;
            return;
        }
    }

    /**
     * Membuat user baru (admin only)
     */
    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const {
                username,
                email,
                password,
                role = UserRole.USER,
                firstName,
                lastName,
                phone
            }: CreateUserRequest = req.body;

            // Validasi input
            if (!username || !email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username, email, and password are required'
                });
            return;
            return;
            }

            // Cek apakah user sudah ada
            const existingUser = await userRepo.findOne({
                where: [
                    { username },
                    { email }
                ]
            });

            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'User already exists'
                });
            return;
            return;
            }

            // Buat user baru
            const user = new User();
            user.username = username;
            user.email = email;
            user.password = password;
            user.role = role;
            user.firstName = firstName || '';
            user.lastName = lastName || '';
            user.phone = phone || '';

            // Validasi email
            if (!user.isEmailValid()) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            return;
            return;
            }

            // Hash password
            await user.hashPassword();

            // Simpan user
            const savedUser = await userRepo.save(user);

            // Remove password from response
            const { password: _, ...safeUser } = savedUser;

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    user: safeUser
                }
            });

        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating user',
                error: error instanceof Error ? error.message : error
            });
            return;
            return;
        }
    }

    /**
     * Update user (admin only)
     */
    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const { userId } = req.params;
            const updateData: UpdateUserRequest = req.body;

            const user = await userRepo.findOne({
                where: { id: parseInt(userId) }
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            return;
            return;
            }

            // Update fields
            if (updateData.username) user.username = updateData.username;
            if (updateData.email) user.email = updateData.email;
            if (updateData.role) user.role = updateData.role;
            if (updateData.status) user.status = updateData.status;
            if (updateData.firstName !== undefined) user.firstName = updateData.firstName;
            if (updateData.lastName !== undefined) user.lastName = updateData.lastName;
            if (updateData.phone !== undefined) user.phone = updateData.phone;

            // Validasi email jika diubah
            if (updateData.email && !user.isEmailValid()) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            return;
            return;
            }

            // Simpan perubahan
            const updatedUser = await userRepo.save(user);

            // Remove password from response
            const { password, ...safeUser } = updatedUser;

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: {
                    user: safeUser
                }
            });

        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating user',
                error: error instanceof Error ? error.message : error
            });
            return;
            return;
        }
    }

    /**
     * Delete user by ID (hard delete, not soft delete)
     */
    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const { userId } = req.params;

            const user = await userRepo.findOne({
                where: { id: parseInt(userId) }
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Prevent deleting admin users
            if (user.role === UserRole.ADMIN) {
                res.status(400).json({
                    success: false,
                    message: 'Cannot delete admin users'
                });
                return;
            }

            // Delete user
            await userRepo.remove(user);

            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });

        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting user',
                error: error instanceof Error ? error.message : error
            });
        }
    }

    /**
     * Delete user by ID
     */
    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userRepo = AppDataSource.getRepository(User);

            // Check if user exists
            const user = await userRepo.findOne({ where: { id: parseInt(id) } });
            if (!user) {
    }           relations: ['user'] 
            });
            
            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
                return;
            }

            // Delete transaction
            await transactionRepo.remove(transaction);

            res.status(200).json({
                success: true,
                message: 'Transaction deleted successfully'
            });

        } catch (error) {
            console.error('Delete transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting transaction',
                error: error instanceof Error ? error.message : error
            });
        }
    }

    /**
     * Mendapatkan semua transaksi (admin only)
     */
    async getAllTransactions(req: Request, res: Response): Promise<void> {
        try {
            const transactionRepo = AppDataSource.getRepository(Transaction);
            const { page = 1, limit = 10, status, userId, dateFrom, dateTo } = req.query;

            const queryBuilder = transactionRepo.createQueryBuilder('transaction')
                .leftJoinAndSelect('transaction.user', 'user');

            // Filter by status
            if (status) {
                queryBuilder.andWhere('transaction.status = :status', { status });
            }

            // Filter by user ID
            if (userId) {
                queryBuilder.andWhere('transaction.userId = :userId', { userId });
            }

            // Filter by date range
            if (dateFrom) {
                queryBuilder.andWhere('transaction.createdAt >= :dateFrom', { dateFrom });
            }
            if (dateTo) {
                queryBuilder.andWhere('transaction.createdAt <= :dateTo', { dateTo });
            }

            // Pagination
            const skip = (Number(page) - 1) * Number(limit);
            queryBuilder.skip(skip).take(Number(limit));

            // Order by creation date
            queryBuilder.orderBy('transaction.createdAt', 'DESC');

            const [transactions, total] = await queryBuilder.getManyAndCount();

            // Safe transaction data
            const safeTransactions = transactions.map(transaction => ({
                id: transaction.id,
                transactionReference: transaction.transactionReference,
                amount: transaction.amount,
                currency: transaction.currency,
                paymentMethod: transaction.paymentMethod,
                status: transaction.status,
                description: transaction.description,
                createdAt: transaction.createdAt,
                processedAt: transaction.processedAt,
                failureReason: transaction.failureReason,
                user: {
                    id: transaction.user.id,
                    username: transaction.user.username,
                    email: transaction.user.email
                }
            }));

            res.status(200).json({
                success: true,
                data: {
                    transactions: safeTransactions,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: total,
                        totalPages: Math.ceil(total / Number(limit))
                    }
                }
            });

        } catch (error) {
            console.error('Get all transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving transactions',
                error: error instanceof Error ? error.message : error
            });
            return;
            return;
        }
    }
}

export default new AdminController();

import { Request, Response } from 'express';
import { AppDataSource } from '../config/db';
import { User } from '../models/userModel';

// Extend Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

class UserController {
    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { username, email } = req.body;

            if (!username && !email) {
                return res.status(400).json({ 
                    error: 'At least one field (username or email) is required' 
                });
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if username or email already exists (excluding current user)
            if (username && username !== user.username) {
                const existingUser = await userRepository.findOne({
                    where: { username }
                });
                if (existingUser) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                user.username = username;
            }

            if (email && email !== user.email) {
                const existingUser = await userRepository.findOne({
                    where: { email }
                });
                if (existingUser) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                user.email = email;
            }

            await userRepository.save(user);

            res.json({
                message: 'Profile updated successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    updatedAt: user.updatedAt
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find({
                select: ['id', 'username', 'email', 'createdAt', 'updatedAt']
            });

            res.json({
                users: users.map((user: User) => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }))
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new UserController();
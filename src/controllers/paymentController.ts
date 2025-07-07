import { Request, Response } from 'express';
import { AppDataSource } from '../config/db';
import { Payment, PaymentStatus, PaymentMethod } from '../models/paymentModel';
import { Transaction, TransactionStatus, TransactionType } from '../models/transactionModel';
import { User } from '../models/userModel';
import EncryptionService from '../services/encryptionService';

// Extend Request interface untuk user authentication
declare global {
    namespace Express {
        interface Request {
            user?: any;
            clientIp?: string;
        }
    }
}

interface PaymentRequest {
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    merchantId: string;
    merchantOrderId?: string;
    description?: string;
    cardNumber?: string;
    cardHolderName?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvv?: string;
    billingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}

class PaymentController {
    private encryptionService: EncryptionService;

    constructor() {
        this.encryptionService = new EncryptionService();
    }

    /**
     * Create new payment with end-to-end encryption
     */
    async createPayment(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const paymentData: PaymentRequest = req.body;
            const { amount, currency, paymentMethod, merchantId, merchantOrderId, description } = paymentData;

            // Validate required fields
            if (!amount || !currency || !paymentMethod || !merchantId) {
                return res.status(400).json({ 
                    error: 'Amount, currency, payment method, and merchant ID are required' 
                });
            }

            // Validate amount
            if (amount <= 0) {
                return res.status(400).json({ error: 'Amount must be greater than zero' });
            }

            // Get user information
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: userId } });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Prepare sensitive payment data for encryption
            const sensitiveData = {
                cardNumber: paymentData.cardNumber,
                cardHolderName: paymentData.cardHolderName,
                expiryMonth: paymentData.expiryMonth,
                expiryYear: paymentData.expiryYear,
                cvv: paymentData.cvv,
                billingAddress: paymentData.billingAddress,
                userId: userId,
                userEmail: user.email,
                timestamp: Date.now(),
                ipAddress: req.clientIp || req.ip,
                userAgent: req.get('User-Agent')
            };

            // Encrypt payment data using user-specific key
            const encryptedPayment = this.encryptionService.encryptPaymentData(
                sensitiveData,
                userId,
                user.email
            );

            // Generate payment token
            const transactionId = this.encryptionService.generateTransactionId();
            const paymentToken = this.encryptionService.generatePaymentToken(userId, transactionId);

            // Create payment record
            const paymentRepository = AppDataSource.getRepository(Payment);
            const payment = new Payment();
            payment.userId = userId;
            payment.amount = amount;
            payment.currency = currency.toUpperCase();
            payment.paymentMethod = paymentMethod;
            payment.status = PaymentStatus.PENDING;
            payment.encryptedPaymentData = encryptedPayment.encryptedData;
            payment.keyHash = encryptedPayment.keyHash;
            payment.merchantId = merchantId;
            if (merchantOrderId) payment.merchantOrderId = merchantOrderId;
            if (description) payment.description = description;
            payment.paymentToken = paymentToken;
            payment.tokenTimestamp = Date.now();
            payment.expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

            await paymentRepository.save(payment);

            // Create initial transaction
            const transactionRepository = AppDataSource.getRepository(Transaction);
            const transaction = new Transaction();
            transaction.id = transactionId;
            transaction.userId = userId;
            transaction.paymentId = payment.id;
            transaction.type = TransactionType.AUTHORIZATION;
            transaction.status = TransactionStatus.PENDING;
            transaction.amount = amount;
            transaction.currency = currency.toUpperCase();
            transaction.encryptedTransactionData = encryptedPayment.encryptedData;
            transaction.keyHash = encryptedPayment.keyHash;
            if (description) transaction.description = description;
            const clientIp = req.clientIp || req.ip;
            if (clientIp) transaction.ipAddress = clientIp;
            const userAgent = req.get('User-Agent');
            if (userAgent) transaction.userAgent = userAgent;
            transaction.expiredAt = new Date(Date.now() + 15 * 60 * 1000);

            await transactionRepository.save(transaction);

            // Return safe response (no sensitive data)
            res.status(201).json({
                message: 'Payment created successfully',
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    currency: payment.currency,
                    paymentMethod: payment.paymentMethod,
                    status: payment.status,
                    merchantId: payment.merchantId,
                    merchantOrderId: payment.merchantOrderId,
                    description: payment.description,
                    paymentToken: paymentToken,
                    expiresAt: payment.expiredAt,
                    createdAt: payment.createdAt
                },
                transaction: {
                    id: transaction.id,
                    type: transaction.type,
                    status: transaction.status,
                    createdAt: transaction.createdAt
                }
            });
        } catch (error) {
            console.error('Create payment error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Process payment with encrypted data
     */
    async processPayment(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { paymentId, paymentToken } = req.body;

            if (!paymentId || !paymentToken) {
                return res.status(400).json({ error: 'Payment ID and token are required' });
            }

            // Verify payment token
            const tokenPayload = this.encryptionService.verifyPaymentToken(paymentToken);
            if (tokenPayload.userId !== userId) {
                return res.status(403).json({ error: 'Invalid payment token' });
            }

            // Get payment
            const paymentRepository = AppDataSource.getRepository(Payment);
            const payment = await paymentRepository.findOne({
                where: { id: paymentId, userId: userId }
            });

            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            if (payment.status !== PaymentStatus.PENDING) {
                return res.status(400).json({ error: 'Payment is not in pending status' });
            }

            if (payment.isExpired) {
                return res.status(400).json({ error: 'Payment has expired' });
            }

            // Get user information
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: userId } });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Decrypt payment data
            const decryptedData = this.encryptionService.decryptPaymentData(
                {
                    encryptedData: payment.encryptedPaymentData,
                    keyHash: payment.keyHash,
                    timestamp: payment.tokenTimestamp,
                    userId: userId
                },
                userId,
                user.email
            );

            // Simulate payment processing
            payment.status = PaymentStatus.PROCESSING;
            await paymentRepository.save(payment);

            // Create processing transaction
            const transactionRepository = AppDataSource.getRepository(Transaction);
            const transaction = new Transaction();
            transaction.userId = userId;
            transaction.paymentId = payment.id;
            transaction.type = TransactionType.CHARGE;
            transaction.status = TransactionStatus.PROCESSING;
            transaction.amount = payment.amount;
            transaction.currency = payment.currency;
            transaction.encryptedTransactionData = payment.encryptedPaymentData;
            transaction.keyHash = payment.keyHash;
            transaction.description = payment.description;
            transaction.ipAddress = (req.clientIp || req.ip) || 'Unknown';
            transaction.userAgent = req.get('User-Agent') || 'Unknown';
            transaction.externalTransactionId = `EXT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await transactionRepository.save(transaction);

            // Simulate processing delay and random success/failure
            setTimeout(async () => {
                try {
                    const isSuccess = Math.random() > 0.1; // 90% success rate
                    
                    if (isSuccess) {
                        payment.status = PaymentStatus.COMPLETED;
                        payment.completedAt = new Date();
                        transaction.status = TransactionStatus.COMPLETED;
                        transaction.processedAt = new Date();
                        transaction.authorizationCode = `AUTH_${Date.now()}`;
                        transaction.processorResponse = 'SUCCESS';
                    } else {
                        payment.status = PaymentStatus.FAILED;
                        payment.failureReason = 'Card declined';
                        transaction.status = TransactionStatus.FAILED;
                        transaction.failureReason = 'Card declined';
                        transaction.processorResponse = 'DECLINED';
                    }

                    await paymentRepository.save(payment);
                    await transactionRepository.save(transaction);
                } catch (error) {
                    console.error('Payment processing error:', error);
                }
            }, 2000); // 2 seconds processing time

            res.json({
                message: 'Payment is being processed',
                payment: {
                    id: payment.id,
                    status: payment.status,
                    amount: payment.amount,
                    currency: payment.currency
                },
                transaction: {
                    id: transaction.id,
                    status: transaction.status,
                    externalTransactionId: transaction.externalTransactionId
                }
            });
        } catch (error) {
            console.error('Process payment error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { paymentId } = req.params;

            const paymentRepository = AppDataSource.getRepository(Payment);
            const payment = await paymentRepository.findOne({
                where: { id: paymentId, userId: userId }
            });

            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            // Get related transactions
            const transactionRepository = AppDataSource.getRepository(Transaction);
            const transactions = await transactionRepository.find({
                where: { paymentId: paymentId },
                order: { createdAt: 'DESC' }
            });

            res.json({
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    currency: payment.currency,
                    paymentMethod: payment.paymentMethod,
                    status: payment.status,
                    merchantId: payment.merchantId,
                    merchantOrderId: payment.merchantOrderId,
                    description: payment.description,
                    failureReason: payment.failureReason,
                    createdAt: payment.createdAt,
                    completedAt: payment.completedAt,
                    expiredAt: payment.expiredAt,
                    isExpired: payment.isExpired,
                    isActive: payment.isActive
                },
                transactions: transactions.map(t => ({
                    id: t.id,
                    type: t.type,
                    status: t.status,
                    amount: t.amount,
                    currency: t.currency,
                    externalTransactionId: t.externalTransactionId,
                    authorizationCode: t.authorizationCode,
                    processorResponse: t.processorResponse,
                    failureReason: t.failureReason,
                    createdAt: t.createdAt,
                    processedAt: t.processedAt
                }))
            });
        } catch (error) {
            console.error('Get payment status error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Get user's payment history
     */
    async getPaymentHistory(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const paymentRepository = AppDataSource.getRepository(Payment);
            const [payments, total] = await paymentRepository.findAndCount({
                where: { userId: userId },
                order: { createdAt: 'DESC' },
                skip: skip,
                take: Number(limit)
            });

            res.json({
                payments: payments.map(p => ({
                    id: p.id,
                    amount: p.amount,
                    currency: p.currency,
                    paymentMethod: p.paymentMethod,
                    status: p.status,
                    merchantId: p.merchantId,
                    merchantOrderId: p.merchantOrderId,
                    description: p.description,
                    createdAt: p.createdAt,
                    completedAt: p.completedAt,
                    isExpired: p.isExpired
                })),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Get payment history error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Refund payment
     */
    async refundPayment(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { paymentId } = req.params;
            const { amount, reason } = req.body;

            const paymentRepository = AppDataSource.getRepository(Payment);
            const payment = await paymentRepository.findOne({
                where: { id: paymentId, userId: userId }
            });

            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            if (payment.status !== PaymentStatus.COMPLETED) {
                return res.status(400).json({ error: 'Only completed payments can be refunded' });
            }

            const refundAmount = amount || payment.amount;
            if (refundAmount > payment.amount) {
                return res.status(400).json({ error: 'Refund amount cannot exceed payment amount' });
            }

            // Create refund transaction
            const transactionRepository = AppDataSource.getRepository(Transaction);
            const refundTransaction = new Transaction();
            refundTransaction.userId = userId;
            refundTransaction.paymentId = payment.id;
            refundTransaction.type = refundAmount === payment.amount ? TransactionType.REFUND : TransactionType.PARTIAL_REFUND;
            refundTransaction.status = TransactionStatus.COMPLETED;
            refundTransaction.amount = refundAmount;
            refundTransaction.currency = payment.currency;
            refundTransaction.encryptedTransactionData = payment.encryptedPaymentData;
            refundTransaction.keyHash = payment.keyHash;
            refundTransaction.description = reason || 'Refund requested';
            refundTransaction.processedAt = new Date();
            refundTransaction.externalTransactionId = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await transactionRepository.save(refundTransaction);

            res.json({
                message: 'Refund processed successfully',
                refund: {
                    id: refundTransaction.id,
                    amount: refundTransaction.amount,
                    currency: refundTransaction.currency,
                    type: refundTransaction.type,
                    status: refundTransaction.status,
                    externalTransactionId: refundTransaction.externalTransactionId,
                    processedAt: refundTransaction.processedAt
                }
            });
        } catch (error) {
            console.error('Refund payment error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new PaymentController();

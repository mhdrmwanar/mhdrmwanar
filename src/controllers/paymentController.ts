import { Request, Response } from 'express';
import { AppDataSource } from '../config/db';
import { Transaction, TransactionStatus, PaymentMethod } from '../models/transactionModel';
import { User } from '../models/userModel';
import AESService from '../services/aesService';

// Extend Request type untuk include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

interface PaymentData {
    cardNumber: string;
    cardHolder: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
}

interface CreateTransactionRequest {
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    paymentData: PaymentData;
    description?: string;
    merchantId?: string;
}

class PaymentController {
    /**
     * Membuat transaksi baru dengan enkripsi AES end-to-end
     */
    async createTransaction(req: Request, res: Response) {
        try {
            const transactionRepo = AppDataSource.getRepository(Transaction);
            const userId = req.user.id;
            
            const {
                amount,
                currency = 'IDR',
                paymentMethod,
                paymentData,
                description,
                merchantId
            }: CreateTransactionRequest = req.body;

            // Validasi input
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid amount'
                });
            }

            if (!paymentData || !paymentData.cardNumber || !paymentData.cvv) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment data is required'
                });
            }

            // Enkripsi data payment dengan AES menggunakan kunci pribadi user
            const encryptedPaymentData = AESService.encryptPaymentData(paymentData, userId);

            // Buat transaksi baru
            const transaction = new Transaction();
            transaction.userId = userId;
            transaction.amount = amount;
            transaction.currency = currency;
            transaction.paymentMethod = paymentMethod || PaymentMethod.CREDIT_CARD;
            transaction.status = TransactionStatus.PENDING;
            transaction.encryptedPaymentData = encryptedPaymentData;
            transaction.description = description || '';
            transaction.merchantId = merchantId || '';
            transaction.transactionReference = PaymentController.generateTransactionReference();

            // Validasi amount
            if (!transaction.isValidAmount()) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be between 1 and 999,999.99'
                });
            }

            // Simpan ke database
            const savedTransaction = await transactionRepo.save(transaction);

            // Response tanpa data sensitif
            return res.status(201).json({
                success: true,
                message: 'Transaction created successfully',
                data: {
                    transactionId: savedTransaction.id,
                    transactionReference: savedTransaction.transactionReference,
                    amount: savedTransaction.amount,
                    currency: savedTransaction.currency,
                    status: savedTransaction.status,
                    paymentMethod: savedTransaction.paymentMethod,
                    createdAt: savedTransaction.createdAt,
                    // Data payment tidak dikembalikan untuk keamanan
                    encryptionInfo: {
                        algorithm: 'AES-256-CBC',
                        keyBased: 'User Unique Identifier',
                        encrypted: true
                    }
                }
            });

        } catch (error) {
            console.error('Create transaction error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating transaction',
                error: error instanceof Error ? error.message : error
            });
        }
    }

    /**
     * Proses pembayaran (simulasi payment gateway)
     */
    async processPayment(req: Request, res: Response) {
        try {
            const transactionRepo = AppDataSource.getRepository(Transaction);
            const { transactionId } = req.params;
            const userId = req.user.id;

            // Cari transaksi
            const transaction = await transactionRepo.findOne({
                where: { 
                    id: parseInt(transactionId),
                    userId: userId 
                }
            });

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            if (!transaction.canBeProcessed()) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction cannot be processed'
                });
            }

            // Update status ke processing
            transaction.status = TransactionStatus.PROCESSING;
            await transactionRepo.save(transaction);

            // Dekripsi data payment untuk processing
            const decryptedPaymentData = AESService.decryptPaymentData(
                transaction.encryptedPaymentData, 
                userId
            );

            // Simulasi pemrosesan payment gateway
            const paymentResult = await PaymentController.simulatePaymentGateway(
                transaction, 
                decryptedPaymentData
            );

            // Update transaksi berdasarkan hasil
            transaction.status = paymentResult.success ? 
                TransactionStatus.SUCCESS : 
                TransactionStatus.FAILED;
            
            transaction.processedAt = new Date();
            
            if (!paymentResult.success) {
                transaction.failureReason = paymentResult.error || 'Unknown error';
            }

            // Enkripsi response data dari payment gateway
            if (paymentResult.responseData) {
                transaction.encryptedResponseData = AESService.encryptPaymentData(
                    paymentResult.responseData, 
                    userId
                );
            }

            await transactionRepo.save(transaction);

            return res.status(200).json({
                success: paymentResult.success,
                message: paymentResult.success ? 
                    'Payment processed successfully' : 
                    'Payment failed',
                data: {
                    transactionId: transaction.id,
                    transactionReference: transaction.transactionReference,
                    status: transaction.status,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    processedAt: transaction.processedAt,
                    ...(paymentResult.success ? {} : { 
                        failureReason: transaction.failureReason 
                    })
                }
            });

        } catch (error) {
            console.error('Process payment error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error processing payment',
                error: error instanceof Error ? error.message : error
            });
        }
    }

    /**
     * Mendapatkan riwayat transaksi user
     */
    async getTransactionHistory(req: Request, res: Response) {
        try {
            const transactionRepo = AppDataSource.getRepository(Transaction);
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;

            const [transactions, total] = await transactionRepo.findAndCount({
                where: { userId: userId },
                order: { createdAt: 'DESC' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit)
            });

            // Return data tanpa informasi sensitif
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
                // Data terenkripsi tidak dikembalikan
                isEncrypted: !!transaction.encryptedPaymentData
            }));

            return res.status(200).json({
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
            console.error('Get transaction history error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error retrieving transaction history',
                error: error instanceof Error ? error.message : error
            });
        }
    }

    /**
     * Mendapatkan detail transaksi dengan dekripsi (untuk admin/debugging)
     */
    async getTransactionDetail(req: Request, res: Response) {
        try {
            const transactionRepo = AppDataSource.getRepository(Transaction);
            const { transactionId } = req.params;
            const userId = req.user.id;

            const transaction = await transactionRepo.findOne({
                where: { 
                    id: parseInt(transactionId),
                    userId: userId 
                },
                relations: ['user']
            });

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            // Dekripsi data untuk tampilan detail (hanya untuk debugging)
            let decryptedPaymentData = null;
            let decryptedResponseData = null;

            try {
                if (transaction.encryptedPaymentData) {
                    decryptedPaymentData = AESService.decryptPaymentData(
                        transaction.encryptedPaymentData, 
                        userId
                    );
                    // Mask sensitive data
                    if (decryptedPaymentData.cardNumber) {
                        decryptedPaymentData.cardNumber = 
                            decryptedPaymentData.cardNumber.substring(0, 4) + 
                            '****' + 
                            decryptedPaymentData.cardNumber.substring(-4);
                    }
                    if (decryptedPaymentData.cvv) {
                        decryptedPaymentData.cvv = '***';
                    }
                }

                if (transaction.encryptedResponseData) {
                    decryptedResponseData = AESService.decryptPaymentData(
                        transaction.encryptedResponseData, 
                        userId
                    );
                }
            } catch (decryptError) {
                console.error('Decryption error:', decryptError);
            }

            return res.status(200).json({
                success: true,
                data: {
                    transaction: {
                        id: transaction.id,
                        transactionReference: transaction.transactionReference,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        paymentMethod: transaction.paymentMethod,
                        status: transaction.status,
                        description: transaction.description,
                        merchantId: transaction.merchantId,
                        createdAt: transaction.createdAt,
                        updatedAt: transaction.updatedAt,
                        processedAt: transaction.processedAt,
                        failureReason: transaction.failureReason,
                        user: {
                            id: transaction.user.id,
                            username: transaction.user.username,
                            email: transaction.user.email
                        }
                    },
                    encryption: {
                        algorithm: 'AES-256-CBC',
                        keyBased: 'User Unique Identifier',
                        paymentDataEncrypted: !!transaction.encryptedPaymentData,
                        responseDataEncrypted: !!transaction.encryptedResponseData,
                        // Hanya tampilkan data yang sudah di-mask untuk keamanan
                        maskedPaymentData: decryptedPaymentData,
                        responseData: decryptedResponseData
                    }
                }
            });

        } catch (error) {
            console.error('Get transaction detail error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error retrieving transaction detail',
                error: error instanceof Error ? error.message : error
            });
        }
    }

    /**
     * Generate unique transaction reference
     */
    static generateTransactionReference(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `TXN-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Simulasi payment gateway processing
     */
    static async simulatePaymentGateway(
        transaction: Transaction, 
        paymentData: PaymentData
    ): Promise<{ success: boolean; error?: string; responseData?: any }> {
        
        // Simulasi delay processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulasi validasi kartu kredit sederhana
        if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
            return {
                success: false,
                error: 'Invalid card number'
            };
        }

        if (!paymentData.cvv || paymentData.cvv.length < 3) {
            return {
                success: false,
                error: 'Invalid CVV'
            };
        }

        // Simulasi random success/failure (90% success rate)
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            return {
                success: true,
                responseData: {
                    gatewayTransactionId: `GW-${Date.now()}`,
                    authCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    processedAt: new Date().toISOString(),
                    gateway: 'Simulated Payment Gateway',
                    cardMask: paymentData.cardNumber.substring(0, 4) + '****' + paymentData.cardNumber.substring(-4)
                }
            };
        } else {
            return {
                success: false,
                error: 'Transaction declined by bank'
            };
        }
    }
}

export default new PaymentController();

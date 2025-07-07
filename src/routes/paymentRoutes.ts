import { Application } from 'express';
import PaymentController from '../controllers/paymentController';
import authMiddleware from '../middleware/authMiddleware';

export function setPaymentRoutes(app: any) {
    // Semua payment routes memerlukan authentication
    app.post('/payment/create', authMiddleware, PaymentController.createTransaction);
    app.post('/payment/process/:transactionId', authMiddleware, PaymentController.processPayment);
    app.get('/payment/history', authMiddleware, PaymentController.getTransactionHistory);
    app.get('/payment/detail/:transactionId', authMiddleware, PaymentController.getTransactionDetail);
}

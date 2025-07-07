import { Router } from 'express';
import PaymentController from '../controllers/paymentController';
import authenticateJWT from '../middleware/authMiddleware';

const router = Router();

// Payment routes (semua protected)
router.post('/create', authenticateJWT, PaymentController.createPayment.bind(PaymentController));
router.post('/process', authenticateJWT, PaymentController.processPayment.bind(PaymentController));
router.get('/status/:paymentId', authenticateJWT, PaymentController.getPaymentStatus.bind(PaymentController));
router.get('/history', authenticateJWT, PaymentController.getPaymentHistory.bind(PaymentController));
router.post('/refund/:paymentId', authenticateJWT, PaymentController.refundPayment.bind(PaymentController));

export default router;

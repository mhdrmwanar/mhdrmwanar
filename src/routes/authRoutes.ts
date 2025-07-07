import { Router } from 'express';
import AuthController from '../controllers/authController';

const router = Router();

// Auth routes
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));
router.post('/logout', AuthController.logout.bind(AuthController));

export default router;
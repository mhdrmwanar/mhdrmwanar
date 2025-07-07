import { Router } from 'express';
import UserController from '../controllers/userController';
import authenticateJWT from '../middleware/authMiddleware';

const router = Router();

// User routes (protected)
router.get('/profile', authenticateJWT, UserController.getProfile.bind(UserController));
router.put('/profile', authenticateJWT, UserController.updateProfile.bind(UserController));
router.get('/', authenticateJWT, UserController.getAllUsers.bind(UserController));

export default router;
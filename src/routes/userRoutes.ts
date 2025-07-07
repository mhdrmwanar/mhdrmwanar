import { Application } from 'express';
import UserController from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';

export function setUserRoutes(app: any) {
    app.get('/users/profile', authMiddleware, UserController.getProfile);
    app.put('/users/profile', authMiddleware, UserController.updateProfile);
}
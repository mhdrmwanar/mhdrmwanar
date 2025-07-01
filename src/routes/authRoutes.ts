import { Router } from 'express';
import AuthController from '../controllers/authController';

const router = Router();
const authController = new AuthController();

export function setAuthRoutes(app: Router) {
    app.post('/register', authController.register.bind(authController));
    app.post('/login', authController.login.bind(authController));
}
import { Application } from 'express';
import AuthController from '../controllers/authController';

export function setAuthRoutes(app: any) {
    app.post('/auth/register', AuthController.register);
    app.post('/auth/login', AuthController.login);
}
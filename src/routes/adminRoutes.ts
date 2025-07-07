import { Application } from 'express';
import AdminController from '../controllers/adminController';
import authMiddleware from '../middleware/authMiddleware';
import { adminMiddleware, adminOrOwnerMiddleware, roleMiddleware } from '../middleware/adminMiddleware';
import { UserRole } from '../models/userModel';

export function setAdminRoutes(app: Application) {
    // Admin Dashboard
    app.get('/admin/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
        await AdminController.getDashboard(req, res);
    });

    // User Management
    app.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
        await AdminController.getUsers(req, res);
    });
    
    app.get('/admin/users/:userId', authMiddleware, adminOrOwnerMiddleware, async (req, res) => {
        await AdminController.getUserById(req, res);
    });
    
    app.post('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
        await AdminController.createUser(req, res);
    });
    
    app.put('/admin/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
        await AdminController.updateUser(req, res);
    });
    
    app.delete('/admin/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
        await AdminController.deleteUser(req, res);
    });

    // Transaction Management
    app.get('/admin/transactions', authMiddleware, adminMiddleware, async (req, res) => {
        await AdminController.getAllTransactions(req, res);
    });

    app.delete('/admin/transactions/:id', authMiddleware, adminMiddleware, async (req, res) => {
        await AdminController.deleteTransaction(req, res);
    });

    // Role-based routes (contoh)
    app.get('/admin/reports', authMiddleware, roleMiddleware([UserRole.ADMIN]), (req, res) => {
        res.json({
            success: true,
            message: 'Endpoint laporan admin',
            data: {
                message: 'Ini adalah endpoint khusus admin untuk laporan'
            }
        });
    });
}

import { Request, Response, NextFunction } from 'express';
import { UserRole, UserStatus } from '../models/userModel';

// Extend Request type untuk include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

/**
 * Middleware untuk memastikan user adalah admin
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        // Check if user is admin
        if (req.user.role !== UserRole.ADMIN) {
            res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
            return;
        }

        // Check if user is active
        if (req.user.status !== UserStatus.ACTIVE) {
            res.status(403).json({
                success: false,
                message: 'Account is not active'
            });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error in admin middleware',
            error: error instanceof Error ? error.message : error
        });
    }
};

/**
 * Middleware untuk memastikan user adalah admin atau owner dari resource
 */
export const adminOrOwnerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        // Check if user is active
        if (req.user.status !== UserStatus.ACTIVE) {
            res.status(403).json({
                success: false,
                message: 'Account is not active'
            });
            return;
        }

        // Allow if user is admin
        if (req.user.role === UserRole.ADMIN) {
            next();
            return;
        }

        // Allow if user is owner (check userId parameter)
        const { userId } = req.params;
        if (userId && parseInt(userId) === req.user.id) {
            next();
            return;
        }

        res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error in admin/owner middleware',
            error: error instanceof Error ? error.message : error
        });
    }
};

/**
 * Middleware untuk role-based access control
 */
export const roleMiddleware = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // Check if user is active
            if (req.user.status !== UserStatus.ACTIVE) {
                res.status(403).json({
                    success: false,
                    message: 'Account is not active'
                });
                return;
            }

            // Check if user role is allowed
            if (!allowedRoles.includes(req.user.role)) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error in role middleware',
                error: error instanceof Error ? error.message : error
            });
        }
    };
};

export default {
    adminMiddleware,
    adminOrOwnerMiddleware,
    roleMiddleware
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/db';
import { User } from '../models/userModel';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token required'
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        
        // Fetch user from database to get latest role and status
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: decoded.id },
            select: ['id', 'username', 'email', 'role', 'status', 'firstName', 'lastName']
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
            return;
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: error instanceof Error ? error.message : error
        });
    }
};

export default authenticateJWT;
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.split(' ')[1];
    console.log('Token:', token);
    
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET as string;
    console.log('Middleware JWT_SECRET:', secret);

    jwt.verify(token, secret, (err: any, user: any) => {
        if (err) {
            console.log('Token verification error:', err);
            return res.status(403).json({ error: 'Invalid token' });
        }
        console.log('Token verified, user:', user);
        req.user = user;
        next();
    });
};

export default authenticateJWT;
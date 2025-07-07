import { Request, Response } from 'express';
import { AppDataSource } from '../config/db';
import { User } from '../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

class UserController {
    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOneBy({ id: userId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Don't return password
            const { password, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOneBy({ id: userId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            const { username, email } = req.body;
            if (username) user.username = username;
            if (email) user.email = email;
            
            await userRepo.save(user);
            const { password, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    async getUser(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOneBy({ id: userId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const updatedData = req.body;
            const userRepo = AppDataSource.getRepository(User);
            let user = await userRepo.findOneBy({ id: userId });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user = Object.assign(user, updatedData);
            if (user) {
                await userRepo.save(user);
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }
}

export default new UserController();
import { Request, Response } from 'express';
import { AppDataSource } from '../config/db';
import { User } from '../models/userModel';
import JwtService from '../services/jwtService';

class AuthController {
    private jwtService: JwtService;

    constructor() {
        this.jwtService = new JwtService();
    }

    async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;

            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({ 
                    error: 'Username, email, and password are required' 
                });
            }

            // Check if user already exists
            const userRepository = AppDataSource.getRepository(User);
            const existingUser = await userRepository.findOne({
                where: [
                    { username },
                    { email }
                ]
            });

            if (existingUser) {
                return res.status(400).json({ 
                    error: 'Username or email already exists' 
                });
            }

            // Create new user
            const user = new User();
            user.username = username;
            user.email = email;
            user.password = password;

            // Hash password before saving
            await user.hashPassword();

            // Save user to database
            await userRepository.save(user);

            // Generate JWT token
            const token = this.jwtService.signToken(user);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({ 
                    error: 'Username and password are required' 
                });
            }

            // Find user by username or email
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: [
                    { username },
                    { email: username } // Allow login with email
                ]
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Validate password
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = this.jwtService.signToken(user);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async logout(req: Request, res: Response) {
        // For JWT, logout is handled client-side by removing the token
        res.json({ message: 'Logout successful' });
    }
}

export default new AuthController();
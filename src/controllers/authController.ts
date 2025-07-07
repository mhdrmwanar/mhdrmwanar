import { Request, Response } from 'express';
import { User } from '../models/userModel';
import { AppDataSource } from '../config/db';
import JwtService from '../services/jwtService';

class AuthController {
    async register(req: Request, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const { username, email, password } = req.body;

            // Validate required fields
            if (!username || !email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username, email and password are required' 
                });
            }

            // Check if user already exists
            const existingUser = await userRepository.findOne({ 
                where: [
                    { username: username },
                    { email: email }
                ]
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }

            // Create new user
            const user = new User();
            user.username = username;
            user.email = email;
            user.password = password;

            // Validate email format
            if (!user.isEmailValid()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Hash password before saving
            await user.hashPassword();

            // Save user to database
            const savedUser = await userRepository.save(user);

            // Generate JWT token
            const jwtService = new JwtService();
            const token = jwtService.signToken(savedUser);

            // Return success response with token
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: savedUser.id,
                    username: savedUser.username,
                    email: savedUser.email,
                    role: savedUser.role,
                    status: savedUser.status
                }
            });

        } catch (error) {
            console.error('Registration error:', error instanceof Error ? error.stack : error);
            return res.status(500).json({
                success: false,
                message: 'Error registering user',
                error: error instanceof Error ? error.message : error
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const { username, password } = req.body;

            // Validate required fields
            if (!username || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username and password are required' 
                });
            }

            // Find user by username
            const user = await userRepository.findOne({ 
                where: { username: username }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check if user is active
            if (!user.isActive()) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is not active'
                });
            }

            // Validate password
            const isPasswordValid = await user.validatePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Update last login
            user.updateLastLogin();
            await userRepository.save(user);

            // Generate JWT token
            const jwtService = new JwtService();
            const token = jwtService.signToken(user);

            // Return success response with token
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    lastLoginAt: user.lastLoginAt
                }
            });

        } catch (error) {
            console.error('Login error:', error instanceof Error ? error.stack : error);
            return res.status(500).json({
                success: false,
                message: 'Error during login',
                error: error instanceof Error ? error.message : error
            });
        }
    }
}

export default new AuthController();
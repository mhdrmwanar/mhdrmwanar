import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Client IP middleware
app.use((req, res, next) => {
    req.clientIp = req.headers['x-forwarded-for'] as string || 
                   req.headers['x-real-ip'] as string ||
                   req.connection.remoteAddress ||
                   req.socket.remoteAddress ||
                   req.ip;
    next();
});

// Serve static files (HTML views)
app.use(express.static(path.join(__dirname, 'views')));

// Database connection
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/payments', paymentRoutes);

// Default route - redirect to payment page
app.get('/', (req, res) => {
    res.redirect('/payment.html');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Secure Payment Gateway'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Secure Payment Gateway Server is running on http://localhost:${PORT}`);
    console.log(`📱 Login: http://localhost:${PORT}/login.html`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});
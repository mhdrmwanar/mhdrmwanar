import express from 'express';
import { connectDB } from './config/db';
import { setAuthRoutes } from './routes/authRoutes';
import { setUserRoutes } from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
setAuthRoutes(app);
setUserRoutes(app);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
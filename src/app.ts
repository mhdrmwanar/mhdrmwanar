import 'dotenv/config';
import express from 'express';
import connectDB from './config/db';
import { setAuthRoutes } from './routes/authRoutes';
import { setUserRoutes } from './routes/userRoutes';
import { setPaymentRoutes } from './routes/paymentRoutes';
import { setAdminRoutes } from './routes/adminRoutes';
import path from 'path';

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
setPaymentRoutes(app);
setAdminRoutes(app);

// Serve static HTML files from views
app.use(express.static(path.join(__dirname, 'views')));

// Redirect root to index page
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const { heal } = require('./utils/dbDoctor');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Top Level)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/authRoutes');
const centerRoutes = require('./routes/centerRoutes');
const courseRoutes = require('./routes/courseRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/syllabus', require('./routes/syllabusRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Simple health check (No DB)
app.get('/api/health-check', (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.VERCEL ? 'vercel' : 'local' });
});

// Vercel Database Initialization Route
app.get('/api/init-db', async (req, res) => {
    try {
        await sequelize.authenticate();
        await heal(sequelize);
        await sequelize.sync({ force: false });
        res.status(200).json({ message: 'Database initialized and synced successfully!' });
    } catch (err) {
        console.error('Init DB Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Final Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Initialize and listen if we are not in Vercel Serverless environment
        if (!process.env.VERCEL) {
            // Step 1: Manual Schema Check (Heal)
            await heal(sequelize);

            // Step 2: Standard Sync (Safe for existing tables)
            await sequelize.sync({ force: false });
            console.log('Models synced.');

            // Listen on default interface
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
                console.log(`- Local: http://localhost:${PORT}`);
                console.log(`- Network: http://0.0.0.0:${PORT}`);
            });
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        if (!process.env.VERCEL) {
            process.exit(1); // Exit if DB fails natively
        }
    }
};

// Global Error Handlers
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

startServer();

// Export the app for Vercel Serverless Functions
module.exports = app;

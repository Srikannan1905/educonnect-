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

// app.use(cors({
//     origin: true, // Allow all origins for debugging
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
// }));
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

        // Step 1: Manual Schema Check (Heal)
        // This is a permanent fix for SQLite schema desync errors
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

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // Exit if DB fails
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

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Register User
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, parentName, parentPhone } = req.body;

        // Security: Prevent creating 'admin' via public registration
        if (role === 'admin') {
            return res.status(403).json({ message: 'Admin registration is restricted.' });
        }

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // Strong Password Validation
        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one special character (!@#$%^&*)' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student', // Default to student
            parentName,
            parentPhone
        });

        // Create token
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Register Staff
exports.registerStaff = async (req, res) => {
    try {
        const { name, email, password, phone, qualification } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        // Strong Password Validation
        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one special character (!@#$%^&*)' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'staff',
            status: 'pending',
            phone,
            qualification
        });

        res.status(201).json({ message: 'Registration successful! Please wait for Admin approval.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Check status
        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Your account is pending approval by Admin.' });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ message: 'Your account has been rejected. Contact Admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get User Data
exports.getUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Forgot Password (Simulated)
exports.forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;

        let user;
        if (email) {
            user = await User.findOne({ where: { email } });
        } else if (phone) {
            // Find by phone (check both phone and parentPhone)
            const { Op } = require('sequelize');
            user = await User.findOne({
                where: {
                    [Op.or]: [{ phone: phone }, { parentPhone: phone }]
                }
            });
        }

        if (!user) {
            // For security, do not reveal if user does not exist
            return res.json({ message: 'If a user with this email/phone exists, a reset link has been sent.' });
        }

        // Simulation
        const contact = email || phone;
        console.log(`[SIMULATION] Password reset requested for: ${contact}. Link sent to user ID: ${user.id}`);
        res.json({ message: `Reset instructions sent to ${email ? 'email' : 'phone'}.` });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

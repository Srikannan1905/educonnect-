const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');

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
            status: (role === 'staff') ? 'pending' : 'active', // Staff must be pending, students active
            parentName,
            parentPhone
        });

        // Create token
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                registrationId: newUser.registrationId,
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

        // Check status for Staff
        if (user.role === 'staff') {
            // We allow 'pending' users to login so they can see the 'PendingApproval' status page
            if (user.status === 'rejected') {
                return res.status(403).json({ message: 'Your staff account request has been rejected. Please contact Admin.' });
            }
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
                registrationId: user.registrationId,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            },
        });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
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

// Forgot Password (Legacy or alternative entry)
exports.forgotPassword = async (req, res) => {
    // keeping this as a stub just in case
    res.status(400).json({ message: 'Please use the phone verification method.' });
};

// Step 1: Verify Phone User and return Security Question
exports.verifyPhoneUser = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // Search in phone or parentPhone
        const user = await User.findOne({
            where: {
                [Op.or]: [{ phone: phone }, { parentPhone: phone }]
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'No account found with that phone number.' });
        }

        // Determine security question based on role and available data
        let questionType = 'email';
        let questionText = 'What is your registered email address?';

        // Alternate questions can be implemented here if needed.

        res.json({
            message: 'User found',
            userId: user.id,
            questionType,
            questionText
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Step 2: Verify Security Answer and Generate Reset Token
exports.verifySecurityAnswer = async (req, res) => {
    try {
        const { userId, questionType, answer } = req.body;

        if (!userId || !answer) {
            return res.status(400).json({ message: 'Missing required field.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        let isCorrect = false;

        // Verify based on questionType
        if (questionType === 'email') {
            // Case insensitive exact comparison
            if (user.email.toLowerCase() === answer.toLowerCase().trim()) {
                isCorrect = true;
            }
        }
        // Add other checks here if needed (e.g., questionType === 'registrationId')

        if (!isCorrect) {
            return res.status(400).json({ message: 'Incorrect security answer.' });
        }

        // Generate reset token directly
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire: 10 mins
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Return token directly to frontend to proceed with reset
        res.json({
            message: 'Identity verified successfully.',
            resetToken: resetToken
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken,
                resetPasswordExpire: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;

        await user.save();

        res.json({ message: 'Password updated successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

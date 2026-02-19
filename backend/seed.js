const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const { User, Company, Course, Gallery } = require('./models');
require('dotenv').config();

const seed = async () => {
    try {
        // Create Default Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminEmail = 'admin@educonnect.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            });
            console.log('Admin user created: admin@educonnect.com / admin123');
        } else {
            console.log('Admin user already exists.');
        }

        // Create Default Company Settings
        const company = await Company.findOne();
        if (!company) {
            await Company.create({
                name: 'EduConnect',
                email: 'contact@educonnect.com',
                phone: '+91 98765 43210',
                instagramUrl: 'https://instagram.com/educonnect',
                whatsappNumber: '919876543210',
            });
            console.log('Default Company settings created.');
        }

        console.log('Seeding complete.');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();

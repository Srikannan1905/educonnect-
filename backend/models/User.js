const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('student', 'staff', 'admin', 'user'),
        defaultValue: 'student',
    },
    status: {
        type: DataTypes.ENUM('active', 'pending', 'rejected'),
        defaultValue: 'pending',
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    qualification: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    parentName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    parentPhone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true, // URL path to the uploaded image
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    projectPdf: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    educationPdf: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    subjects: {
        type: DataTypes.STRING,
        allowNull: true, // Comma separated subjects e.g. "Computer, Mathematics"
    },
}, {
    timestamps: true,
});

module.exports = User;

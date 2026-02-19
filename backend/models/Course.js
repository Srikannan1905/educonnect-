const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    board: {
        type: DataTypes.ENUM('CBSE', 'TN', 'ICSE', 'Other'),
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mode: {
        type: DataTypes.ENUM('online', 'offline'),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER, // Duration in minutes. Null = Lifetime
        allowNull: true,
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // centerId will be added via association, but can be defined here if strictly needed, otherwise association handles it.
    // We'll let associations handle the FK constraint.
}, {
    timestamps: true,
});

module.exports = Course;

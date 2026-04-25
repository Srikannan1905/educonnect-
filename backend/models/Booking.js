const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('demo', 'course', 'visit', 'hourly'), // Added hourly
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE, // Changed from bookingDate
        defaultValue: DataTypes.NOW,
    },
    startTime: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true, // Null means lifetime access (or handled elsewhere)
    },
    meetingLink: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        defaultValue: 'pending',
    },
    staffId: {
        type: DataTypes.UUID,
        allowNull: true, // Link to the tutor/staff
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isFree: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
});

module.exports = Booking;

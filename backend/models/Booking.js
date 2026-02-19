const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('demo', 'course', 'visit'), // Changed from bookingType
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE, // Changed from bookingDate
        defaultValue: DataTypes.NOW,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true, // Null means lifetime access (or handled elsewhere)
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        defaultValue: 'pending',
    },
}, {
    timestamps: true,
});

module.exports = Booking;

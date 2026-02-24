const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false, // The person who performed the action or the subject of the action
    },
    action: {
        type: DataTypes.STRING, // e.g., 'booking_created', 'session_started', 'session_ended'
        allowNull: false,
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    userRole: {
        type: DataTypes.ENUM('student', 'staff', 'admin'),
        allowNull: false,
    }
}, {
    timestamps: true,
});

module.exports = ActivityLog;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.STRING, // Store as string for easier formatting or use TIME if DB supports
        allowNull: false,
    },
    meetingLink: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    platform: {
        type: DataTypes.ENUM('zoom', 'google_meet', 'other'),
        defaultValue: 'zoom',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'scheduled',
    }
}, {
    timestamps: true,
});

module.exports = Session;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseRequest = sequelize.define('CourseRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    board: {
        type: DataTypes.ENUM('CBSE', 'TN', 'ICSE', 'Other'),
        allowNull: false,
    },
    mode: {
        type: DataTypes.ENUM('online', 'offline'),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
    staffId: {
        type: DataTypes.UUID,
        allowNull: false,
    }
}, {
    timestamps: true,
});

module.exports = CourseRequest;

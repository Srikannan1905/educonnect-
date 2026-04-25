const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    staffId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    timeLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 30, // 30 minutes
    },
    passPercentage: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true,
});

module.exports = Quiz;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assessment = sequelize.define('Assessment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    quizId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    passed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    completedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: true,
});

module.exports = Assessment;

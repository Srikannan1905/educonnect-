const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    quizId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    options: {
        type: DataTypes.TEXT, // Store as JSON string stringified array
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('options');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('options', JSON.stringify(value));
        }
    },
    correctAnswer: {
        type: DataTypes.INTEGER, // Index of correct option
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    }
}, {
    timestamps: true,
});

module.exports = Question;

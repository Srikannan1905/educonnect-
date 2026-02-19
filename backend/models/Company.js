const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'EduConnect',
    },
    email: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    instagramUrl: {
        type: DataTypes.STRING,
    },
    whatsappNumber: {
        type: DataTypes.STRING,
    },
    address: {
        type: DataTypes.TEXT,
    },
    twitterUrl: {
        type: DataTypes.STRING,
    },
    googleMapEmbedUrl: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

module.exports = Company;

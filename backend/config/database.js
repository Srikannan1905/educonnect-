const { Sequelize } = require('sequelize');
const pg = require('pg');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
    console.log('Connecting to Neon PostgreSQL database...');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            // Mandatory for Neon/Supabase Pooler
            prepareThreshold: 0
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false,
    });
} else {
    console.log('Connecting to local SQLite database...');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'database.sqlite'),
        logging: false,
    });
}

module.exports = sequelize;

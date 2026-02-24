const sequelize = require('./config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
    try {
        const queryInterface = sequelize.getQueryInterface();

        console.log('Adding twitterUrl...');
        await queryInterface.addColumn('Companies', 'twitterUrl', {
            type: DataTypes.STRING,
            allowNull: true
        }).catch(err => console.log('twitterUrl might already exist:', err.message));

        console.log('Adding googleMapEmbedUrl...');
        await queryInterface.addColumn('Companies', 'googleMapEmbedUrl', {
            type: DataTypes.TEXT,
            allowNull: true
        }).catch(err => console.log('googleMapEmbedUrl might already exist:', err.message));

        console.log('Migration Complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
}

migrate();

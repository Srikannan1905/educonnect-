const sequelize = require('./config/database');

async function migrate() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('Users', 'address', {
            type: require('sequelize').DataTypes.TEXT,
            allowNull: true
        });
        console.log('Migrated: Added address column to Users table');
        process.exit(0);
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('Column address already exists');
            process.exit(0);
        }
        console.error('Migration Error:', error);
        process.exit(1);
    }
}

migrate();

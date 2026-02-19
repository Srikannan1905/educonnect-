const { sequelize } = require('./models');

const updateSchema = async () => {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Attempting to add missing column "duration" to Courses table...');
        try {
            await sequelize.query("ALTER TABLE Courses ADD COLUMN duration INTEGER;");
            console.log('Column "duration" added successfully.');
        } catch (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column "duration" already exists.');
            } else {
                throw err;
            }
        }

    } catch (error) {
        console.error('Schema Update Failed:', error);
    } finally {
        await sequelize.close();
    }
};

updateSchema();

const { sequelize } = require('./models');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Add columns to Users
        const userColumns = ['specialization', 'projectPdf', 'educationPdf'];
        for (const col of userColumns) {
            try {
                await sequelize.query(`ALTER TABLE Users ADD COLUMN ${col} TEXT`);
                console.log(`Added ${col} to Users`);
            } catch (e) {
                console.log(`Column ${col} might already exist or failed: ${e.message}`);
            }
        }

        // Add columns to Courses
        try {
            await sequelize.query(`ALTER TABLE Courses ADD COLUMN staffId CHAR(36)`);
            console.log(`Added staffId to Courses`);
        } catch (e) {
            console.log(`Column staffId in Courses might already exist or failed: ${e.message}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();

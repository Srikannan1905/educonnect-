const { sequelize } = require('./models');

async function checkSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Users)");
        console.log("Columns in Users table:");
        results.forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();

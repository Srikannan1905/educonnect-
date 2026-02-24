const sequelize = require('./config/database');

async function checkSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Companies);");
        console.log('--- Companies Table Schema ---');
        results.forEach(col => console.log(`${col.name} (${col.type})`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();

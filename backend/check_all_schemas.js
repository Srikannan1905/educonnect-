const { sequelize, User, Center, Course, Booking, Company, Gallery, Payment, Notification, Session } = require('./models');

async function checkAll() {
    try {
        const tables = ['Users', 'Centers', 'Courses', 'Bookings', 'Companies', 'Galleries', 'Payments', 'Notifications', 'Sessions'];
        for (const table of tables) {
            const [results] = await sequelize.query(`PRAGMA table_info(${table})`);
            console.log(`\nTable: ${table}`);
            results.forEach(col => {
                console.log(`- ${col.name} (${col.type})`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAll();

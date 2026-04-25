const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./database.sqlite');
db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='Bookings'", (err, row) => {
    if (err) {
        console.error(err);
    } else {
        fs.writeFileSync('schema_dump.txt', row ? row.sql : 'NOT FOUND');
        console.log("Dumped to schema_dump.txt");
    }
    db.close();
});

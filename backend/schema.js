const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='Bookings'", (err, row) => {
    if (err) console.error(err);
    else console.log(row ? row.sql : 'Table not found');
    db.close();
});

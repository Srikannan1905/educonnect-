const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const migrations = [
    "ALTER TABLE Users ADD COLUMN profileImage TEXT;",
    "ALTER TABLE Courses ADD COLUMN thumbnail TEXT;",
    "ALTER TABLE Galleries ADD COLUMN category TEXT DEFAULT 'miscellaneous';"
];

db.serialize(() => {
    migrations.forEach(query => {
        db.run(query, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`Skipped (already exists): ${query}`);
                } else {
                    console.error(`Error running query: ${query}`, err.message);
                }
            } else {
                console.log(`Success: ${query}`);
            }
        });
    });
});

db.close();

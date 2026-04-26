const { Sequelize } = require('sequelize');

/**
 * dbDoctor ensures that the SQLite database schema matches the Sequelize models
 * by adding missing columns using raw SQL. This is much more reliable than 
 * sequelize.sync({ alter: true }) for SQLite.
 */
async function heal(sequelize) {
    console.log('--- Schema Guardian: Starting Audit ---');
    
    // Skip audit for non-SQLite databases (Postgres handles sync better)
    if (sequelize.getDialect() !== 'sqlite') {
        console.log('[Schema Guardian] Non-SQLite database detected. Skipping PRAGMA audit.');
        console.log('--- Schema Guardian: Audit Complete ---');
        return;
    }

    const models = sequelize.models;

    for (const modelName in models) {
        const model = models[modelName];
        const tableName = model.getTableName();
        const attributes = model.getAttributes();

        try {
            // Get current columns in the table
            const [results] = await sequelize.query(`PRAGMA table_info(${tableName})`);
            const existingColumns = results.map(col => col.name);

            // Check for missing columns
            for (const attributeName in attributes) {
                const column = attributes[attributeName];
                const columnName = column.field || attributeName;

                if (!existingColumns.includes(columnName)) {
                    console.log(`[Schema Guardian] Table '${tableName}' is missing column '${columnName}'. Healing...`);

                    let type = 'TEXT'; // Default for SQLite
                    const seqType = column.type.toString().toUpperCase();

                    if (seqType.includes('INTEGER')) type = 'INTEGER';
                    if (seqType.includes('BOOLEAN') || seqType.includes('TINYINT')) type = 'TINYINT';
                    if (seqType.includes('DECIMAL') || seqType.includes('FLOAT') || seqType.includes('DOUBLE')) type = 'NUMERIC';
                    if (seqType.includes('DATE')) type = 'DATETIME';
                    if (seqType.includes('UUID')) type = 'CHAR(36)';

                    try {
                        await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${type}`);
                        console.log(`[Schema Guardian] Successfully added '${columnName}' to '${tableName}'.`);
                    } catch (alterError) {
                        console.error(`[Schema Guardian] Failed to add '${columnName}' to '${tableName}':`, alterError.message);
                    }
                }
            }
        } catch (error) {
            if (error.message.includes('no such table')) {
                console.log(`[Schema Guardian] Table '${tableName}' does not exist yet. Sequelize sync will create it.`);
            } else {
                console.error(`[Schema Guardian] Error auditing table '${tableName}':`, error.message);
            }
        }
    }
    console.log('--- Schema Guardian: Audit Complete ---');
}

module.exports = { heal };

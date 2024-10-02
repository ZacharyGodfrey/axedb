import { database } from '../../lib/database.js';
import { recordJsonData } from '../app.js';

// Start Up

console.log('Starting up...');

const start = Date.now();
const db = database('data');

// Write JSON

console.log('Writing JSON files...');

recordJsonData(db);

console.log('Done.');

// Database Report

console.log('Database Report:');

console.log(JSON.stringify({
    images: db.row(`SELECT COUNT(*) AS count FROM images`).count,
    profiles: db.row(`SELECT COUNT(*) AS count FROM profiles`).count,
    seasons: db.row(`SELECT COUNT(*) AS count FROM seasons`).count,
    matches: db.row(`SELECT COUNT(*) AS count FROM matches`).count,
    throws: db.row(`SELECT COUNT(*) AS count FROM throws`).count,
}, null, 2));

console.table(db.rows(`SELECT * FROM profiles`));

console.log('Done.');

// Tear Down

console.log('Tearing down...');

db.close();

console.log('Done.');
console.log(`Total Runtime: ${Date.now() - start}ms`);
import { database } from '../../lib/database.js';
import { recordImageData } from '../app.js';

// Start Up

console.log('Starting up...');

const start = Date.now();
const db = database('data');

// Record Images

console.log('Recording image data...');

await recordImageData(db);

console.log('Done.');

// Tear Down

console.log('Tearing down...');

db.shrink();
db.close();

console.log('Done.');
console.log(`Total Runtime: ${Date.now() - start}ms`);
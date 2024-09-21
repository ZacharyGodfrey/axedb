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
console.log(`Total Runtime: ${Date.now() - start}ms`);
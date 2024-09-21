import Database from 'better-sqlite3';

import { createFolder } from './file.js'

const buildTables = (db) => {
  db.prepare(`CREATE TABLE IF NOT EXISTS profiles (
    profileId INTEGER NOT NULL,

    name TEXT NOT NULL DEFAULT 'Unknown',
    image TEXT,
    fetch INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (profileId)
  ) WITHOUT ROWID;`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS seasons (
    seasonId INTEGER NOT NULL,

    name TEXT NOT NULL,
    year INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (seasonId)
  ) WITHOUT ROWID;`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS matches (
    profileId INTEGER NOT NULL,
    seasonId INTEGER NOT NULL,
    weekId INTEGER NOT NULL,
    matchId INTEGER NOT NULL,
    opponentId INTEGER NOT NULL DEFAULT 0,
    processed INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (profileId, matchId)
  ) WITHOUT ROWID;`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS throws (
    profileId INTEGER NOT NULL,
    seasonId INTEGER NOT NULL,
    weekId INTEGER NOT NULL,
    matchId INTEGER NOT NULL,
    opponentId INTEGER NOT NULL,
    roundId INTEGER NOT NULL,
    throwId INTEGER NOT NULL,
    tool TEXT NOT NULL,
    target TEXT NOT NULL,
    score INTEGER NOT NULL,

    PRIMARY KEY (profileId, matchId, roundId, throwId)
  ) WITHOUT ROWID;`).run();
};

const dbInterface = (db) => ({
  shrink: () => db.prepare('VACUUM').run(),
  run: (sql, params = []) => db.prepare(sql).run(params),
  row: (sql, params = []) => db.prepare(sql).get(params),
  rows: (sql, params = []) => db.prepare(sql).all(params),
  insert: (table, data) => {
    const keys = Object.keys(data).join(', ');
    const values = Object.keys(data).map(k => `:${k}`).join(', ');
    const sql = `INSERT INTO ${table} (${keys}) VALUES (${values})`;

    return db.prepare(sql).run(data);
  },
  insertOrIgnore: (table, data) => {
    const keys = Object.keys(data).join(', ');
    const values = Object.keys(data).map(k => `:${k}`).join(', ');
    const sql = `INSERT OR IGNORE INTO ${table} (${keys}) VALUES (${values})`;

    return db.prepare(sql).run(data);
  },
  insertOrUpdate: (table, create, conflict, update) => {
    const createKeys = Object.keys(create).join(', ');
    const createValues = Object.keys(create).map(_ => '?').join(', ');
    const conflictKeys = Object.keys(conflict).join(', ');
    const updatePairs = Object.keys(update).map(k => `${k} = ?`).join(', ');
    const conflictPairs = Object.keys(conflict).map(k => `${k} = ?`).join(' AND ');

    return db.prepare(`
      INSERT INTO ${table} (${createKeys}) VALUES (${createValues})
      ON CONFLICT (${conflictKeys}) DO UPDATE SET ${updatePairs}
      WHERE ${conflictPairs}
    `).run([
      ...Object.values(create),
      ...Object.values(update),
      ...Object.values(conflict)
    ]);
  },
});

export const database = (dataDirectory, options = {}) => {
  createFolder(dataDirectory);

  const db = new Database(`${dataDirectory}/data.db`, options);

  db.pragma('journal_mode = WAL');

  buildTables(db);

  return dbInterface(db);
};
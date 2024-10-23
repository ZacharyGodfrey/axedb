import Database from 'better-sqlite3';

import { createFolder } from './file.js';

export const enums = {
  matchStatus: {
    new: 0, // discovered, not analyzed yet
    unplayed: 1, // no throw data available yet
    invalid: 2, // incorrect throw count, may be fixed in the future
    processed: 3, // successfully analyzed
  }
};

const dbInterface = (db) => ({
  run: (sql, params = []) => db.prepare(sql).run(params),
  row: (sql, params = []) => db.prepare(sql).get(params),
  rows: (sql, params = []) => db.prepare(sql).all(params),
  close: () => {
    db.prepare('VACUUM').run();
    db.close();
  }
});

export const main = (options = {}) => {
  createFolder('data');

  const db = new Database('data/main.db', options);

  db.pragma('journal_mode = WAL');

  db.prepare(`CREATE TABLE IF NOT EXISTS profiles (
    profileId INTEGER NOT NULL,
    name TEXT NOT NULL DEFAULT 'Unknown',
    fetch INTEGER NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL DEFAULT 0,
    scorePerAxe REAL NOT NULL DEFAULT 0,

    PRIMARY KEY (profileId)
  ) WITHOUT ROWID;`).run();

  return dbInterface(db);
};

export const profile = (profileId, options = {}) => {
  createFolder('data');

  const db = new Database(`data/profile-${profileId}.db`, options);

  db.pragma('journal_mode = WAL');

  db.prepare(`CREATE TABLE IF NOT EXISTS seasons (
    seasonId INTEGER NOT NULL,
    name TEXT NOT NULL,
    year INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (seasonId)
  ) WITHOUT ROWID;`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS matches (
    seasonId INTEGER NOT NULL,
    weekId INTEGER NOT NULL,
    matchId INTEGER NOT NULL,
    opponentId INTEGER NOT NULL DEFAULT 0,
    status INTEGER NOT NULL DEFAULT ${enums.matchStatus.new},

    PRIMARY KEY (matchId)
  ) WITHOUT ROWID;`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS throws (
    matchId INTEGER NOT NULL,
    roundId INTEGER NOT NULL,
    throwId INTEGER NOT NULL,
    tool TEXT NOT NULL,
    target TEXT NOT NULL,
    score INTEGER NOT NULL,

    PRIMARY KEY (matchId, roundId, throwId)
  ) WITHOUT ROWID;`).run();

  return dbInterface(db);
};

export const database = { main, profile, enums };
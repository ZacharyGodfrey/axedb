import Database from 'better-sqlite3';

import { createFolder } from './file.js';

const config = {
  directory: 'data',
  files: [
    {
      name: 'profiles',
      sql: [`CREATE TABLE IF NOT EXISTS profiles (
        profileId INTEGER NOT NULL,
        name TEXT NOT NULL DEFAULT 'Unknown',
        fetch INTEGER NOT NULL DEFAULT 0,
        rank INTEGER,
        scorePerAxe REAL,

        PRIMARY KEY (profileId)
      ) WITHOUT ROWID;`]
    },
    {
      name: 'images',
      sql: [`CREATE TABLE IF NOT EXISTS images (
        profileId INTEGER NOT NULL,
        image BLOB,
        PRIMARY KEY (profileId)
      ) WITHOUT ROWID;`]
    },
    {
      name: 'seasons',
      sql: [`CREATE TABLE IF NOT EXISTS seasons (
        seasonId INTEGER NOT NULL,
        name TEXT NOT NULL,
        year INTEGER NOT NULL DEFAULT 0,

        PRIMARY KEY (seasonId)
      ) WITHOUT ROWID;`]
    },
    {
      name: 'matches',
      sql: [`CREATE TABLE IF NOT EXISTS matches (
        profileId INTEGER NOT NULL,
        seasonId INTEGER NOT NULL,
        weekId INTEGER NOT NULL,
        matchId INTEGER NOT NULL,
        opponentId INTEGER NOT NULL DEFAULT 0,
        processed INTEGER NOT NULL DEFAULT 0,

        PRIMARY KEY (profileId, matchId)
      ) WITHOUT ROWID;`]
    },
    {
      name: 'throws',
      sql: [`CREATE TABLE IF NOT EXISTS throws (
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
      ) WITHOUT ROWID;`]
    },
  ],
  options: {}
};

export const database = () => {
  const { directory = 'data', files = [], options = {} } = config;

  createFolder(directory);

  for (const { name, sql } of files) {
    const db = new Database(`${directory}/${name}.db`, options);

    for (const query of sql) {
      db.prepare(query).run();
    }

    db.close();
  }

  const db = new Database(`${directory}/${files[0].name}.db`, options);

  db.pragma('journal_mode = WAL');

  for (const { name } of file.slice(1)) {
    db.prepare(`ATTACH DATABASE '${directory}/${name}.db' AS ${name}`).run();
  }

  return {
    run: (sql, params = []) => db.prepare(sql).run(params),
    row: (sql, params = []) => db.prepare(sql).get(params),
    rows: (sql, params = []) => db.prepare(sql).all(params),
    close: () => db.close(),
    shrink: () => {
      db.prepare('VACUUM').run();

      for (const { name } of file.slice(1)) {
        db.prepare(`VACUUM ${name}`).run();
      }
    }
  };
};
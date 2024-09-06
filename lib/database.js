import Database from 'better-sqlite3';

const enums = {
  entities: {
    profile: 'profile',
    season: 'season',
    match: 'match',
  }
};

const insert = (db, table, create) => {
  const keys = Object.keys(create).join(', ');
  const values = Object.values(create).map(_ => '?').join(', ');

  return db.prepare(`
    INSERT INTO ${table} (${keys})
    VALUES (${values})
  `).run(Object.values(create));
};

const insertOrIgnore = (db, table, create) => {
  const keys = Object.keys(create).join(', ');
  const values = Object.values(create).map(_ => '?').join(', ');

  return db.prepare(`
    INSERT OR IGNORE INTO ${table} (${keys})
    VALUES (${values})
  `).run(Object.values(create));
};

const upsert = (db, table, create, conflict, update) => {
  const createKeys = Object.keys(create).join(',\n');
  const createValues = Object.keys(create).map(_ => '?').join(', ');
  const conflictKeys = Object.keys(conflict).join(', ');
  const updatePairs = Object.keys(update).map(k => `${k} = ?`).join(',\n');
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
};

export const database = (fileName) => {
  const _db = new Database(fileName, {});

  _db.pragma('journal_mode = WAL');

  _db.prepare(`CREATE TABLE IF NOT EXISTS profiles (
    profileId INTEGER NOT NULL,

    fetch INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL DEFAULT 'Unknown',
    image TEXT,

    PRIMARY KEY (profileId)
  ) WITHOUT ROWID;`).run();

  _db.prepare(`CREATE TABLE IF NOT EXISTS seasons (
    seasonId INTEGER NOT NULL,

    name TEXT NOT NULL,
    year INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (seasonId)
  ) WITHOUT ROWID;`).run();

  _db.prepare(`CREATE TABLE IF NOT EXISTS matches (
    entityId INTEGER PRIMARY KEY,

    profileId INTEGER NOT NULL,
    seasonId INTEGER NOT NULL,
    week INTEGER NOT NULL,
    matchId INTEGER NOT NULL,
    opponentId INTEGER NOT NULL DEFAULT 0,
    processed INTEGER NOT NULL DEFAULT 0,

    UNIQUE (profileId, matchId)
  );`).run();

  _db.prepare(`CREATE TABLE IF NOT EXISTS throws (
    entityId INTEGER PRIMARY KEY,

    profileId INTEGER NOT NULL,
    matchId INTEGER NOT NULL,
    round INTEGER NOT NULL,
    throw INTEGER NOT NULL,
    tool TEXT NOT NULL,
    target TEXT NOT NULL,
    score INTEGER NOT NULL,

    UNIQUE (profileId, matchId, round, throw)
  );`).run();

  _db.prepare(`CREATE TABLE IF NOT EXISTS stats (
    entity TEXT NOT NULL,
    entityId INTEGER NOT NULL,
    hatchetBullseyeHitPercent REAL NOT NULL DEFAULT 0,
    hatchetBullseyeScorePerAxe REAL NOT NULL DEFAULT 0,
    hatchetClutchHitPercent REAL NOT NULL DEFAULT 0,
    hatchetClutchScorePerAxe REAL NOT NULL DEFAULT 0,
    hatchetClutchFiveHitPercent REAL NOT NULL DEFAULT 0,
    hatchetClutchSevenHitPercent REAL NOT NULL DEFAULT 0,
    bigAxeBullseyeHitPercent REAL NOT NULL DEFAULT 0,
    bigAxeBullseyeScorePerAxe REAL NOT NULL DEFAULT 0,
    bigAxeClutchHitPercent REAL NOT NULL DEFAULT 0,
    bigAxeClutchScorePerAxe REAL NOT NULL DEFAULT 0,
    bigAxeClutchFiveHitPercent REAL NOT NULL DEFAULT 0,
    bigAxeClutchSevenHitPercent REAL NOT NULL DEFAULT 0,

    PRIMARY KEY (entity, entityId)
  );`).run();

  return {
    enums,
    run: (sql, params = []) => _db.prepare(sql).run(params),
    row: (sql, params = []) => _db.prepare(sql).get(params),
    rows: (sql, params = []) => _db.prepare(sql).all(params),
    insert: (table, create) => insert(_db, table, create),
    insertOrIgnore: (table, create) => insertOrIgnore(_db, table, create),
    upsert: (table, create, conflict, update) => upsert(_db, table, create, conflict, update),
  };
};
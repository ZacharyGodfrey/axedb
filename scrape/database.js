import Database from 'better-sqlite3';

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

  _db.prepare(`CREATE TABLE IF NOT EXISTS matches (
    matchId INTEGER NOT NULL,
    seasonId INTEGER NOT NULL,
    week INTEGER NOT NULL,
    processed INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (matchId)
  ) WITHOUT ROWID;`).run();

  _db.prepare(`CREATE TABLE IF NOT EXISTS throws (
    seasonId INTEGER NOT NULL,
    week INTEGER NOT NULL,
    opponentId INTEGER NOT NULL,
    matchId INTEGER NOT NULL,
    round INTEGER NOT NULL,
    throw INTEGER NOT NULL,
    tool TEXT NOT NULL,
    target TEXT NOT NULL,
    score INTEGER NOT NULL,

    PRIMARY KEY (matchId, round, throw)
  ) WITHOUT ROWID;`).run();

  _db.prepare(`CREATE TABLE IF NOT EXISTS aggregations (
    name TEXT NOT NULL,
    level TEXT NOT NULL,
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

    UNIQUE(name, level)
  );`).run();

  return {
    run: (sql, params = []) => _db.prepare(sql).run(params),
    row: (sql, params = []) => _db.prepare(sql).get(params),
    rows: (sql, params = []) => _db.prepare(sql).all(params),
    upsert: (table, create, conflict, update) => upsert(_db, table, create, conflict, update),
  };
};
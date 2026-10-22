import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { dbPath, retentionDays } from './config.mjs';
import { classification, fingerprint } from './forms.mjs';

let singleton;
export function database(path = dbPath) {
  if (path === dbPath && singleton) return singleton;
  const full = resolve(path);
  mkdirSync(dirname(full), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(full);
  chmodSync(full, 0o600);
  db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=DELETE;
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, request_id TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL,
      created_at INTEGER NOT NULL, data TEXT NOT NULL, classification TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new', consent_version TEXT NOT NULL,
      mail_state TEXT NOT NULL DEFAULT 'pending', mail_attempts INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS limits (key TEXT NOT NULL, at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS limits_key ON limits(key,at);
  `);
  if (path === dbPath) singleton = db;
  return db;
}
export function cleanup(db = database(), now = Date.now()) {
  db.prepare('DELETE FROM leads WHERE created_at < ?').run(now - retentionDays * 86400000);
  db.prepare('DELETE FROM limits WHERE at < ?').run(now - 600000);
}
export function allowedRate(key, db = database(), now = Date.now()) {
  db.prepare('DELETE FROM limits WHERE at < ?').run(now - 600000);
  db.exec('BEGIN IMMEDIATE');
  try {
    const { n } = db.prepare('SELECT count(*) AS n FROM limits WHERE key=? AND at>=?').get(key, now - 600000);
    const allowed = n < 12;
    if (allowed) db.prepare('INSERT INTO limits(key,at) VALUES (?,?)').run(key, now);
    db.exec('COMMIT');
    return allowed;
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}
export function saveLead(data, db = database()) {
  const hash = fingerprint(data);
  const id = randomUUID();
  db.prepare(`INSERT OR IGNORE INTO leads (id,request_id,fingerprint,created_at,data,classification,consent_version)
    VALUES (?,?,?,?,?,?,?)`).run(id, data.requestId, hash, Date.now(), JSON.stringify(data), JSON.stringify(classification(data)), '2026-10-22-v1');
  const row = db.prepare('SELECT id,fingerprint,mail_state FROM leads WHERE request_id=?').get(data.requestId);
  if (row.fingerprint !== hash) throw new Error('IDEMPOTENCY_CONFLICT');
  return { id: row.id, created: row.id === id, mailState: row.mail_state };
}

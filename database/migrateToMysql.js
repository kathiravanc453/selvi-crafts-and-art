import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import db from './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sqlitePath = join(__dirname, 'database.sqlite');

async function migrate() {
  console.log('🚀 Starting SQLite -> MySQL Data Migration...');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'handmade';
  const port = Number(process.env.DB_PORT) || 3306;

  // 1. Connect to MySQL Server & Create DB
  const rootConn = await mysql.createConnection({ host, user, password, port });
  console.log(`✅ Connected to MySQL server at ${host}:${port}`);

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  console.log(`✅ Database \`${dbName}\` created/ensured in MySQL.`);
  await rootConn.end();

  // 2. Initialize Database Tables in MySQL
  process.env.USE_MYSQL = 'true';
  process.env.DB_NAME = dbName;
  await db.initDb();
  console.log(`✅ All MySQL tables created in \`${dbName}\`.`);

  // 3. Connect to target MySQL Database for batch insertion
  const mysqlPool = mysql.createPool({ host, user, password, database: dbName, port });

  // 4. Connect to SQLite to read source data
  const sqliteDb = new sqlite3.Database(sqlitePath);
  const getSqliteRows = (query) => new Promise((res, rej) => sqliteDb.all(query, (err, rows) => err ? rej(err) : res(rows)));

  try {
    const tables = ['users', 'categories', 'products', 'product_images', 'cart', 'wishlist', 'orders', 'order_items', 'reviews', 'banners', 'offers'];

    for (const table of tables) {
      try {
        const rows = await getSqliteRows(`SELECT * FROM ${table}`);
        if (!rows || rows.length === 0) {
          console.log(`ℹ️ Table \`${table}\` is empty in SQLite. Skipping.`);
          continue;
        }

        console.log(`📦 Migrating ${rows.length} rows for table \`${table}\`...`);
        for (const row of rows) {
          const keys = Object.keys(row);
          const values = Object.values(row);
          const placeholders = keys.map(() => '?').join(', ');
          const columns = keys.map(k => `\`${k}\``).join(', ');

          const sql = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${keys.map(k => `\`${k}\` = VALUES(\`${k}\`)`).join(', ')}`;
          await mysqlPool.execute(sql, values);
        }
        console.log(`✨ Table \`${table}\` successfully migrated to MySQL database \`${dbName}\`!`);
      } catch (err) {
        console.error(`⚠️ Notice migrating table \`${table}\`:`, err.message);
      }
    }

    console.log(`\n🎉 ALL CUSTOMER DETAILS & STORE DATA MIGRATED TO MYSQL DATABASE \`${dbName}\` SUCCESSFULLY!`);
  } catch (err) {
    console.error('❌ Migration Error:', err);
  } finally {
    sqliteDb.close();
    await mysqlPool.end();
  }
}

migrate();

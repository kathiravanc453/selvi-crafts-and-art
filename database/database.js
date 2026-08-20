import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');

import pg from 'pg';

const isNeonPg = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const useMysql = !isNeonPg && (process.env.USE_MYSQL === 'true' || Boolean(process.env.DB_HOST || process.env.MYSQL_URL));

let pgPool = null;
let mysqlPool = null;
let sqliteDb = null;

if (isNeonPg) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  console.log('Connecting to Neon DB (Cloud PostgreSQL)...');
  pgPool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
} else if (useMysql) {
  console.log(`Connecting to MySQL database \`${process.env.DB_NAME || 'handmade'}\`...`);
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'handmade',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
  });
} else {
  try {
    const sqlite3Module = await import('sqlite3');
    const sqlite3 = sqlite3Module.default;
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening SQLite database:', err.message);
      } else {
        console.log('Connected to SQLite database at:', dbPath);
        sqliteDb.run('PRAGMA foreign_keys = ON;');
      }
    });
  } catch (err) {
    console.warn('SQLite3 driver not loaded (using MySQL mode).');
  }
}

// Helper to convert '?' placeholders to '$1, $2, $3' for PostgreSQL / Neon DB
const convertSqlForPg = (sql) => {
  let paramCount = 0;
  return sql.replace(/\?/g, () => {
    paramCount++;
    return `$${paramCount}`;
  });
};

// Promise-based query helpers for async/await
export const query = async (sql, params = []) => {
  if (isNeonPg) {
    const pgSql = convertSqlForPg(sql);
    const res = await pgPool.query(pgSql, params);
    return res.rows || [];
  } else if (useMysql) {
    const [rows] = await mysqlPool.execute(sql, params);
    return Array.isArray(rows) ? rows : [];
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(Array.isArray(rows) ? rows : []);
      });
    });
  }
};

export const queryOne = async (sql, params = []) => {
  if (isNeonPg) {
    const pgSql = convertSqlForPg(sql);
    const res = await pgPool.query(pgSql, params);
    return res.rows && res.rows.length > 0 ? res.rows[0] : null;
  } else if (useMysql) {
    const [rows] = await mysqlPool.execute(sql, params);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
};

export const run = async (sql, params = []) => {
  if (isNeonPg) {
    let pgSql = convertSqlForPg(sql);
    // Append RETURNING id for INSERT queries if not present
    if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
      pgSql += ' RETURNING id';
    }
    const res = await pgPool.query(pgSql, params);
    const insertId = res.rows && res.rows.length > 0 ? res.rows[0].id : null;
    return { id: insertId, changes: res.rowCount };
  } else if (useMysql) {
    const [result] = await mysqlPool.execute(sql, params);
    return { id: result.insertId, changes: result.affectedRows };
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

// Database Initialisation Function
export const initDb = async () => {
  console.log(`Initializing ${isNeonPg ? 'Neon DB (PostgreSQL)' : (useMysql ? 'MySQL' : 'SQLite')} database tables...`);

  const idCol = isNeonPg ? 'SERIAL PRIMARY KEY' : (useMysql ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT');
  const textType = isNeonPg ? 'VARCHAR(255)' : (useMysql ? 'VARCHAR(255)' : 'TEXT');
  const longTextType = 'TEXT';
  const boolType = isNeonPg ? 'BOOLEAN DEFAULT TRUE' : (useMysql ? 'TINYINT DEFAULT 1' : 'INTEGER DEFAULT 1');
  const dtType = isNeonPg ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP';

  // Users Table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id ${idCol},
      name ${textType} NOT NULL,
      email ${textType} UNIQUE NOT NULL,
      password_hash ${textType} NOT NULL,
      role ${textType} DEFAULT 'customer',
      avatar_url ${longTextType},
      phone ${textType},
      address_line1 ${longTextType},
      address_line2 ${longTextType},
      city ${textType},
      state ${textType},
      zip ${textType},
      created_at ${dtType}
    )
  `);

  // Column migration for existing tables
  const userCols = ['avatar_url', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'zip'];
  for (const col of userCols) {
    try {
      if (useMysql) {
        await run(`ALTER TABLE users ADD COLUMN ${col} TEXT;`);
      } else if (sqliteDb) {
        await run(`ALTER TABLE users ADD COLUMN ${col} TEXT;`);
      }
    } catch (e) {
      // Column already exists
    }
  }

  // Categories Table
  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id ${idCol},
      name ${textType} NOT NULL,
      slug ${textType} UNIQUE NOT NULL,
      description ${longTextType},
      image_url ${longTextType}
    )
  `);

  // Products Table
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id ${idCol},
      name ${textType} NOT NULL,
      slug ${textType} UNIQUE NOT NULL,
      description ${longTextType},
      price DECIMAL(10,2) NOT NULL,
      offer_price DECIMAL(10,2),
      category_id INT,
      stock INT DEFAULT 0,
      is_active ${boolType},
      rating DECIMAL(3,1) DEFAULT 5.0,
      created_at ${dtType},
      updated_at ${dtType}
    )
  `);

  // Product Images Table
  await run(`
    CREATE TABLE IF NOT EXISTS product_images (
      id ${idCol},
      product_id INT,
      image_url ${longTextType} NOT NULL,
      is_primary ${useMysql ? 'TINYINT DEFAULT 0' : 'INTEGER DEFAULT 0'}
    )
  `);

  // Cart Table
  await run(`
    CREATE TABLE IF NOT EXISTS cart (
      id ${idCol},
      user_id INT,
      product_id INT,
      quantity INT DEFAULT 1,
      created_at ${dtType}
    )
  `);

  // Wishlist Table
  await run(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id ${idCol},
      user_id INT,
      product_id INT,
      created_at ${dtType}
    )
  `);

  // Orders Table
  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id ${idCol},
      user_id INT,
      status ${textType} DEFAULT 'pending',
      total_amount DECIMAL(10,2) NOT NULL,
      shipping_fee DECIMAL(10,2) DEFAULT 0.0,
      discount_amount DECIMAL(10,2) DEFAULT 0.0,
      coupon_code ${textType},
      payment_method ${textType} NOT NULL,
      payment_status ${textType} DEFAULT 'pending',
      shipping_name ${textType} NOT NULL,
      shipping_email ${textType} NOT NULL,
      shipping_phone ${textType} NOT NULL,
      shipping_address_line1 ${longTextType} NOT NULL,
      shipping_address_line2 ${longTextType},
      shipping_city ${textType} NOT NULL,
      shipping_state ${textType} NOT NULL,
      shipping_zip ${textType} NOT NULL,
      created_at ${dtType}
    )
  `);

  // Order Items Table
  await run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id ${idCol},
      order_id INT,
      product_id INT,
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL
    )
  `);

  // Reviews Table
  await run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id ${idCol},
      user_id INT,
      product_id INT,
      rating INT NOT NULL,
      comment ${longTextType},
      image_url ${longTextType},
      created_at ${dtType}
    )
  `);

  try {
    await run(`ALTER TABLE reviews ADD COLUMN image_url TEXT;`);
  } catch (e) {
    // Column already exists
  }

  // Banners Table
  await run(`
    CREATE TABLE IF NOT EXISTS banners (
      id ${idCol},
      image_url ${longTextType} NOT NULL,
      title ${textType},
      subtitle ${textType},
      link ${textType},
      is_active ${boolType},
      display_order INT DEFAULT 0
    )
  `);

  // Offers Table
  await run(`
    CREATE TABLE IF NOT EXISTS offers (
      id ${idCol},
      code ${textType} UNIQUE NOT NULL,
      discount_type ${textType} NOT NULL,
      discount_value DECIMAL(10,2) NOT NULL,
      min_order_amount DECIMAL(10,2) DEFAULT 0.0,
      is_active ${boolType},
      start_date ${dtType},
      end_date ${dtType}
    )
  `);

  console.log(`Database tables successfully initialized (${useMysql ? 'MySQL' : 'SQLite'}).`);
};

// Initialize DB on module load
initDb().catch(console.error);

export default { query, queryOne, run, initDb };

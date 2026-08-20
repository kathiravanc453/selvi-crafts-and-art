# Selvi's Arts & Craft (Handemade) - Full Stack E-Commerce

This project is organized into 3 modular directories: `frontend`, `backend`, and `database`.

---

## 📂 Directory Structure

```
Handemade/
├── frontend/
│   ├── client/           # Customer E-Commerce Store (React 19 + Vite)
│   └── admin/            # Admin Management Portal (React + Vite)
├── backend/              # Node.js / Express REST API Server
│   ├── index.js          # Main API Server Entrypoint
│   ├── .env              # Environment Variables (MySQL Credentials & Port)
│   └── uploads/          # Uploaded Product & Banner Images
└── database/             # Database Management Module
    ├── database.js       # Dual MySQL & SQLite Driver
    ├── schema.sql        # MySQL Table Schema SQL Script
    ├── seed.js           # Default Database Seeder
    ├── migrateToMysql.js # One-Click SQLite -> MySQL Migrator
    └── database.sqlite   # SQLite Local Backup File
```

---

## 🚀 Quick Start

### Run All Services Concurrently
From the root directory, run:
```bash
npm run dev
```
This automatically launches:
* 🛍️ **Customer Store**: `http://localhost:5175`
* 🛠️ **Admin Management Portal**: `http://localhost:5176`
* ⚙️ **Backend API Server**: `http://localhost:5000`

---

## 🗄️ MySQL Database Setup

1. Open your MySQL server (XAMPP / MySQL Workbench / Cloud MySQL).
2. Configure credentials in `backend/.env`:
   ```env
   USE_MYSQL=true
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=Kathir@143
   DB_NAME=handmade
   ```
3. Run the database migration script:
   ```bash
   npm run migrate:mysql
   ```

---

## 🔑 Login Credentials

* **Admin Portal (`http://localhost:5176`)**:
  * Email: `admin@selviarts.com`
  * Password: `adminpassword`

* **Customer Store (`http://localhost:5175`)**:
  * Email: `customer@gmail.com`
  * Password: `customerpassword`

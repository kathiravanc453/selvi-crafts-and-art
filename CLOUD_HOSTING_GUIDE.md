# 🚀 Production Cloud Hosting Guide for Handemade

This guide provides step-by-step instructions to deploy your **Customer Store**, **Admin Portal**, **Express Backend Server**, and **Database** to the cloud (FREE Tiers available on Vercel, Render, Aiven/Railway, and Cloudinary).

---

## 🛠️ Summary of Cloud Architecture

* 🛒 **Customer Store (Frontend)** → **Vercel** (`frontend/client`)
* ⚙️ **Admin Management Portal** → **Vercel** (`frontend/admin`)
* ⚡ **Backend API Server** → **Render** or **Railway** (`backend`)
* 🗄️ **Database (MySQL)** → **Aiven** / **Railway** / **Clever Cloud**
* ☁️ **Media / Photos Storage** → **Cloudinary CDN** (`dm1cwbbfg`)

---

## Step 1: Push Project to GitHub

1. Initialize Git repository and commit all files:
   ```bash
   git init
   git add .
   git commit -m "Deploy Handemade e-commerce application"
   ```
2. Create a new repository on [GitHub.com](https://github.com/new).
3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/handemade.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy Database (Cloud MySQL)

### Option A: Aiven (Free MySQL Cloud Database)
1. Go to [Aiven.io](https://aiven.io) and create a free MySQL service.
2. Note your database credentials:
   - `Host`: `mysql-xxxx.aivencloud.com`
   - `Port`: `12345`
   - `User`: `avnadmin`
   - `Password`: `your_aiven_password`
   - `Database Name`: `handmade`
3. Run the schema script using your local MySQL client or Workbench:
   ```bash
   mysql -h mysql-xxxx.aivencloud.com -P 12345 -u avnadmin -p handmade < database/schema.sql
   ```

---

## Step 3: Deploy Backend Server to Render

1. Go to [Render.com](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository `handemade`.
3. Configure Web Service settings:
   - **Name**: `handemade-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add **Environment Variables** in Render Dashboard:
   | Key | Value |
   | :--- | :--- |
   | `PORT` | `5000` |
   | `USE_MYSQL` | `true` |
   | `DB_HOST` | `mysql-xxxx.aivencloud.com` |
   | `DB_PORT` | `12345` |
   | `DB_USER` | `avnadmin` |
   | `DB_PASSWORD` | `your_aiven_password` |
   | `DB_NAME` | `handmade` |
   | `JWT_SECRET` | `super-secret-key-for-selvi-arts` |
   | `CLOUDINARY_CLOUD_NAME` | `dm1cwbbfg` |
   | `CLOUDINARY_API_KEY` | `826146287578677` |
   | `CLOUDINARY_API_SECRET` | `4-ikegUAAqYDlvqAAJKqwuIAQDk` |
5. Click **Create Web Service**.
6. Copy your live backend URL (e.g. `https://handemade-backend.onrender.com`).

---

## Step 4: Deploy Customer Store to Vercel

1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository `handemade`.
3. Configure Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend/client`
4. Open `frontend/client/vercel.json` and replace `https://YOUR-BACKEND-URL.onrender.com` with your live Render backend URL:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://handemade-backend.onrender.com/api/$1" },
       { "source": "/uploads/(.*)", "destination": "https://handemade-backend.onrender.com/uploads/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. Click **Deploy**.
6. Your customer store is now live at: `https://handemade-store.vercel.app`! 🛍️

---

## Step 5: Deploy Admin Portal to Vercel

1. Click **Add New Project** in Vercel again.
2. Import your GitHub repository `handemade`.
3. Configure Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend/admin`
4. Open `frontend/admin/vercel.json` and set your backend URL:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://handemade-backend.onrender.com/api/$1" },
       { "source": "/uploads/(.*)", "destination": "https://handemade-backend.onrender.com/uploads/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. Click **Deploy**.
6. Your admin portal is now live at: `https://handemade-admin.vercel.app`! 🛠️

---

### 🎉 Congratulations!
Your entire e-commerce application is now live on the public cloud with global HTTPS, automatic Cloudinary image hosting, and MySQL cloud database storage!

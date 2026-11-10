# TUYEL ELECTRICALS – Free Hosting & Deployment Guide

This guide explains how to host the **TUYEL ELECTRICALS** full-stack website (Frontend + Backend + MySQL Database) for **100% FREE** with **zero hosting costs**.

---

## Architecture Overview

| Component       | Technology              | Free Host Platform          | Cost      |
| :-------------- | :---------------------- | :-------------------------- | :-------- |
| **Frontend**    | React (Vite) + Tailwind | **Vercel** or **Netlify**   | Free ($0) |
| **Backend API** | Node.js + Express       | **Render.com**              | Free ($0) |
| **Database**    | MySQL 8 Relational DB   | **TiDB Cloud** or **Aiven** | Free ($0) |

---

## Step 1: Free MySQL Database (TiDB Cloud Serverless)

1. Go to [https://tidbcloud.com](https://tidbcloud.com) and create a free account (sign in with Google/GitHub, no credit card required).
2. Click **Create Cluster** and select **Serverless (Free)**.
3. Choose your region (e.g., `ap-southeast-1` or closest to India).
4. Once created, click **Connect**:
   - Connection Type: **General**
   - Note down:
     - `Host`: (e.g. `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
     - `Port`: `4000`
     - `User`: (e.g. `xxxxxx.root`)
     - `Password`: (your generated password)
     - `Database`: `tuyel_electricals`
5. Click **SQL Editor** in TiDB Cloud:
   - Copy the contents of `database.sql` and click **Run** to seed all 17 tables and sample products.

---

## Step 2: Push Your Project to GitHub

If you haven't already pushed your code to GitHub:

```bash
git init
git add .
git commit -m "Tuyel Electricals complete platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tuyel-electricals.git
git push -u origin main
```

---

## Step 3: Deploy Backend on Render.com (Free)

1. Sign up at [https://render.com](https://render.com) (free, sign in with GitHub).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `tuyel-electricals`.
4. Configure service:
   - **Name**: `tuyel-electricals-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add **Environment Variables** in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DB_HOST`: _(your TiDB host)_
   - `DB_PORT`: `4000`
   - `DB_USER`: _(your TiDB username)_
   - `DB_PASSWORD`: _(your TiDB password)_
   - `DB_NAME`: `tuyel_electricals`
   - `DB_SSL`: `true`
   - `JWT_SECRET`: `your_random_secret_key_12345`
   - `ADMIN_EMAIL`: `admin@tuyel.com`
   - `ADMIN_PASSWORD`: `Admin@123`
   - `WHATSAPP_NUMBER`: `916294156854`
6. Click **Create Web Service**.
   - Render will build and deploy your API. Once finished, you will get a URL like:
     `https://tuyel-electricals-api.onrender.com`

---

## Step 4: Deploy Frontend on Vercel (Free)

1. Sign up at [https://vercel.com](https://vercel.com) (sign in with GitHub).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `tuyel-electricals`.
4. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and choose `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   - `VITE_API_URL`: `https://tuyel-electricals-api.onrender.com/api/v1`
     _(replace with your Render backend URL from Step 3)_
6. Click **Deploy**.

---

## Step 5: Test Your Live Website!

- **Public Website**: `https://your-project.vercel.app`
- **Shop & Services**: View products, test cart, and service bookings.
- **Admin Panel**: `https://your-project.vercel.app/admin/login`
  - Email: `admin@tuyel.com`
  - Password: `Admin@123`

# Deployment Guide (Netlify + Render)

This guide explains how to deploy your project using Netlify for the frontend and Render for the backend.

## 1. Database Setup (MongoDB Atlas)

Before deploying the code, you need a live database:
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (free M0 tier).
3. **Network Access**: Add `0.0.0.0/0` (allow access from anywhere).
4. **Database Access**: Create a user and password.
5. Get your **Connection String** (URL).

## 2. Backend Deployment (Render)

1. Sign in to [Render](https://render.com/).
2. Click **"New +"** -> **"Web Service"**.
3. Select your `NeoConnect` repository.
4. **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas URL.
   - `JWT_SECRET`: `ozN4dLvT+EXGPu28ByWWPjeKED/NVO1eqXOqePO+0BE=` (or any secure string).
6. **Save**: Once deployed, Render will give you a URL (e.g., `https://neoconnect-backend.onrender.com`).

## 3. Frontend Deployment (Netlify)

1. Sign in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Select **GitHub** and pick the `NeoConnect` repository.
4. **Site Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL`: Paste your **Render Backend URL** here.
6. Click **"Deploy site"**.

## Why this split?
- **Next.js on Netlify**: Netlify is the gold standard for Next.js apps, providing faster loads and easy scaling.
- **Express on Render**: Render provides a stable "always-on" environment for your Express server and the daily escalation cron jobs.

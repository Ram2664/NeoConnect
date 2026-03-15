# Deployment Plan (Netlify & Backend)

This plan outlines how to deploy the **NeoConnect** project. Since the project consists of a Next.js frontend and an Express backend, we need a dual-platform strategy or a specific Netlify configuration.

## User Review Required

> [!IMPORTANT]
> Netlify is optimized for the **frontend (Next.js)**. The **backend (Express)** requires a server environment.
> - **Option A (Recommended):** Deploy Frontend on Netlify and Backend on **Render/Railway/Vercel**.
> - **Option B:** Re-architect the backend to use **Netlify Functions** (requires code changes).

## Why can't I deploy the Backend on Netlify?

Netlify is a **Serverless** platform. Your Express backend is a **Traditional Server** that:
1.  Stays "awake" 24/7 to listen for requests (`app.listen`).
2.  Runs scheduled tasks in the background (`node-cron`).

Netlify "sleeps" when no one is using it and only wakes up to serve files or run quick functions. For your backend to work correctly (especially the **Daily Escalation Job**), it needs a platform that provides a persistent environment.

## Recommended Strategy

### 1. Frontend (Netlify)
- Connect the GitHub repository to Netlify.
- Set the base directory to `frontend`.
- Build command: `npm run build`.
- Publish directory: `frontend/.next` (Netlify handles this automatically for Next.js).
- Configure environment variables (`NEXT_PUBLIC_API_URL`).

### 2. Backend (Render / Railway)
- Connect the GitHub repository.
- Set the base directory to `backend`.
- Build command: `npm install`.
- Start command: `node src/server.js`.
- Configure environment variables (`MONGO_URI`, `JWT_SECRET`, etc.).

## Steps for Netlify Deployment (Frontend)

1. Sign in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Select **GitHub** and pick the `NeoConnect` repository.
4. **Site Settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next` (or leave as default for Next.js)
5. **Environment Variables:**
   - Add `NEXT_PUBLIC_API_URL` pointing to your deployed backend URL.
6. Click **"Deploy site"**.

## Steps for Database (MongoDB Atlas)

Since you are using MongoDB, you'll need a cloud database for your live site:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (pick the free M0 tier).
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so Render/Netlify can connect.
4. Under **Database Access**, create a user and password.
5. Click **Connect** -> **Drivers** to get your connection string.
6. **Save this URL**: You will need it for your `MONGO_URI` environment variable.

## Steps for Backend Deployment (e.g., Render)

1. Create a new **Web Service** on [Render](https://render.com/).
2. Select the `NeoConnect` repository.
3. **Settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. **Environment Variables:**
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A long random string.
   - `PORT`: 5000 (Render handles this, but good to have).

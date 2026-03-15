# Full Render Deployment Guide (Recommended)

This guide explains how to deploy both the **NeoConnect** frontend and backend on Render using a single configuration file.

## 1. Database Setup (MongoDB Atlas)

Before deploying the code, you need a live database:
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (pick the free M0 tier).
3. **Network Access**: Add `0.0.0.0/0` (allow access from anywhere).
4. **Database Access**: Create a user and password.
5. Get your **Connection String** (URL).

## 2. Deploy on Render (One-Click Setup)

1. Sign in to [Render](https://render.com/).
2. Click **"New +"** -> **"Blueprint"**.
3. Select your `NeoConnect` repository.
4. Render will detect the `render.yaml` file and show two services:
   - `neoconnect-backend`
   - `neoconnect-frontend`
5. **Fill in the Environment Variables**:
   - For **Backend**:
     - `MONGO_URI`: Your MongoDB Atlas URL.
     - `JWT_SECRET`: Any long random string.
   - For **Frontend**:
     - `NEXT_PUBLIC_API_URL`: The URL of your backend (Render will show this once it's created).

6. Click **"Apply"**.

## Why this is better?
- **Unified Management**: Both your site and server are in one dashboard on Render.
- **Easy Scaling**: If you need more power later, you can upgrade both in the same place.
- **Pre-configured**: I've already set the correct build commands and root directories for you.

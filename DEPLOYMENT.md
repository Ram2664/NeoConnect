# NEO Complaint Management System - Deployment Guide

## 🚀 Deployment Architecture

- **Frontend**: Netlify (Next.js)
- **Backend**: Render (Node.js/Express)
- **Database**: MongoDB Atlas

---

## 📋 Prerequisites

1. GitHub account with your code pushed
2. Netlify account (https://netlify.com)
3. Render account (https://render.com)
4. MongoDB Atlas account (https://mongodb.com/cloud/atlas)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to https://mongodb.com/cloud/atlas
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your database password
6. Add `/neoconnect` at the end: `mongodb+srv://username:password@cluster.mongodb.net/neoconnect`
7. In "Network Access", add `0.0.0.0/0` to allow connections from anywhere

---

## 🔧 Step 2: Deploy Backend to Render

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `neo-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your-mongodb-connection-string-from-step-1
   JWT_SECRET=your-super-secret-random-string-here
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-app-name.netlify.app
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://neo-backend.onrender.com`)

---

## 🌐 Step 3: Deploy Frontend to Netlify

1. Go to https://netlify.com and sign in
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select your repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

6. Add Environment Variables (Site settings → Environment variables):
   ```
   NEXT_PUBLIC_API_URL=https://neo-backend.onrender.com
   ```
   (Use your actual Render backend URL from Step 2)

7. Click "Deploy site"
8. Wait for deployment (3-5 minutes)
9. Copy your frontend URL (e.g., `https://your-app-name.netlify.app`)

---

## 🔄 Step 4: Update CORS Settings

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` with your actual Netlify URL:
   ```
   FRONTEND_URL=https://your-actual-app-name.netlify.app
   ```
5. Save changes (this will redeploy your backend)

---

## 👤 Step 5: Create Initial Admin User

1. Open your backend URL in browser: `https://neo-backend.onrender.com`
2. You should see: `{"message":"NeoConnect API is running"}`
3. Use a tool like Postman or curl to create admin user:

```bash
curl -X POST https://neo-backend.onrender.com/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin@123",
    "role": "Admin",
    "department": "Administration"
  }'
```

---

## ✅ Step 6: Test Your Deployment

1. Visit your Netlify URL: `https://your-app-name.netlify.app`
2. Click "Login"
3. Use the admin credentials you created
4. Test all features:
   - Submit a complaint
   - Create a poll
   - Assign cases
   - View analytics

---

## 🔧 Troubleshooting

### Backend Issues:
- Check Render logs: Dashboard → Your Service → Logs
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend Issues:
- Check Netlify deploy logs
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check browser console for errors

### CORS Errors:
- Ensure `FRONTEND_URL` in Render matches your Netlify URL exactly
- No trailing slash in URLs

---

## 📝 Important Notes

1. **Free Tier Limitations**:
   - Render: Backend sleeps after 15 minutes of inactivity (first request may be slow)
   - MongoDB Atlas: 512MB storage limit
   - Netlify: 100GB bandwidth/month

2. **Security**:
   - Change default admin password immediately
   - Use strong JWT_SECRET
   - Never commit `.env` files

3. **Custom Domain** (Optional):
   - Netlify: Site settings → Domain management
   - Render: Settings → Custom domain

---

## 🎉 You're Done!

Your NEO Complaint Management System is now live!

- Frontend: https://your-app-name.netlify.app
- Backend: https://neo-backend.onrender.com
- Database: MongoDB Atlas

---

## 📞 Support

If you encounter issues:
1. Check the logs on Render and Netlify
2. Verify all environment variables
3. Ensure MongoDB Atlas allows connections from anywhere
4. Check that URLs don't have trailing slashes

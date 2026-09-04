# 🚀 Quick Deploy Guide

Deploy Chesticals in 10 minutes for FREE!

## Prerequisites

- [x] GitHub account
- [x] Unsplash API key ([get here](https://unsplash.com/oauth/applications))

## Step-by-Step

### 1️⃣ Push to GitHub (5 min)

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Chesticals"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/chesticals.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy Backend to Render (2 min)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your `chesticals` repository
5. Configure:
   - **Name:** `chesticals-server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`
6. Click **"Create Web Service"**
7. Wait for deployment (~2 min)
8. **Copy your server URL:** `https://chesticals-server-XXXXX.onrender.com`

### 3️⃣ Deploy Frontend to Vercel (3 min)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login (opens browser)
vercel login

# Deploy
vercel
```

**Follow prompts:**
- Link to existing project? **N**
- What's your project's name? **chesticals**
- In which directory is your code located? **./  (Enter)**
- Want to override settings? **N**

✅ Deployment complete! Note the URL.

### 4️⃣ Add Environment Variables (1 min)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `chesticals` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   **Variable 1:**
   - **Name:** `NEXT_PUBLIC_SOCKET_URL`
   - **Value:** `https://chesticals-server-XXXXX.onrender.com` (your Render URL)
   - **Environment:** All

   **Variable 2:**
   - **Name:** `UNSPLASH_ACCESS_KEY`
   - **Value:** `your_unsplash_api_key`
   - **Environment:** All

5. Click **"Save"**

### 5️⃣ Redeploy Frontend

```bash
# Redeploy with new environment variables
vercel --prod
```

## 🎉 Done!

Your app is now live at:
- **Frontend:** `https://chesticals.vercel.app`
- **Backend:** `https://chesticals-server-XXXXX.onrender.com`

## 🎮 Test It

1. Open your Vercel URL in two browsers
2. Create a room in Browser 1
3. Copy the room code
4. Join with Browser 2
5. Play chess with your friend! ♟️

## 📱 Share with Friends

Just send them your Vercel URL:
```
https://chesticals.vercel.app
```

## ⚠️ Important Notes

### Backend Cold Starts
Render's free tier spins down after 15 minutes of inactivity. The first connection after inactivity takes ~30 seconds to wake up.

**Solution:** Use [UptimeRobot](https://uptimerobot.com) (free) to ping your server every 14 minutes:
1. Sign up at uptimerobot.com
2. Add monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://chesticals-server-XXXXX.onrender.com/health`
   - **Interval:** 14 minutes

### Custom Domain (Optional)

Both Vercel and Render support custom domains for free:
- Vercel: Settings → Domains → Add
- Render: Dashboard → Custom Domain → Add

## 🐛 Troubleshooting

### "Cannot connect to server"

**Check:**
1. Render service is running (Dashboard → Service)
2. CORS is configured correctly in `server.js`
3. Environment variable `NEXT_PUBLIC_SOCKET_URL` is set
4. Redeploy frontend after adding env vars

**Test backend:**
```bash
curl https://your-server.onrender.com/health
# Should return: {"status":"ok",...}
```

### "Theme not working"

**Check:**
1. `UNSPLASH_ACCESS_KEY` is added to Vercel
2. API key is valid
3. Redeploy after adding env var

### "Room not connecting"

**Check:**
1. Both players using same app URL
2. Backend is awake (check Render logs)
3. Socket.io connection status in browser console

## 📊 Monitor Your App

### Render Dashboard
- View logs: Dashboard → Service → Logs
- Check uptime: Dashboard → Service → Metrics

### Vercel Dashboard  
- View deployments: Dashboard → Deployments
- Check analytics: Dashboard → Analytics
- View logs: Deployments → Function logs

## 💰 Free Tier Limits

**Vercel:**
- ✅ Unlimited projects
- ✅ 100 GB bandwidth/month
- ✅ Global CDN

**Render:**
- ✅ 750 hours/month (31+ days)
- ✅ 512 MB RAM
- ⚠️ Spins down after 15 min inactivity

**Total cost:** $0/month 🎉

## 🚀 Next Steps

1. Add custom domain
2. Set up UptimeRobot for keep-alive
3. Invite friends to play
4. Customize themes
5. Have fun! ♟️

## 📞 Support

Need help?
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- Check Render logs for backend issues
- Check Vercel logs for frontend issues
- Verify environment variables are set

---

**Congratulations! Your chess app is live! 🎉**

Share the link and start playing:
```
https://your-app.vercel.app
```

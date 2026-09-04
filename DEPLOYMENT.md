# Deployment Guide - Free Hosting

Deploy Chesticals for free using Vercel (frontend) and Render (backend).

## Architecture

```
┌─────────────────────────────────────────┐
│  chesticals.vercel.app (Frontend)       │
│  • Next.js App                          │
│  • Static Assets                        │
│  • API Routes (theme endpoint)          │
└─────────────────┬───────────────────────┘
                  │
                  │ Socket.io Connection
                  ▼
┌─────────────────────────────────────────┐
│  chesticals-server.onrender.com         │
│  • Express Server                       │
│  • Socket.io Server                     │
│  • Room Management                      │
└─────────────────────────────────────────┘
```

## Option 1: Vercel + Render (Recommended) ⭐

**Why this combo:**
- ✅ Both have generous free tiers
- ✅ Zero cold starts for frontend
- ✅ Easy deployment from GitHub
- ✅ Custom domains supported
- ✅ Automatic HTTPS

### Step 1: Prepare the Backend for Render

Create `render.yaml`:
```yaml
services:
  - type: web
    name: chesticals-server
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: PORT
        value: 10000
```

Update `server.js` port configuration:
```javascript
const PORT = process.env.PORT || 3001;
```

### Step 2: Deploy Backend to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: `chesticals-server`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Plan**: `Free`

3. **Get Your Server URL**
   - After deployment, copy URL: `https://chesticals-server.onrender.com`

### Step 3: Update Frontend Configuration

Update `.env.local`:
```env
# Production backend URL
NEXT_PUBLIC_SOCKET_URL=https://chesticals-server.onrender.com

# Unsplash API
UNSPLASH_ACCESS_KEY=your_key_here
```

Update `src/hooks/useMultiplayer.ts`:
```typescript
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
```

### Step 4: Update CORS in server.js

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://chesticals.vercel.app',
      'https://*.vercel.app', // For preview deployments
    ],
    methods: ['GET', 'POST'],
  },
});
```

### Step 5: Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow prompts
   - Set up project
   - Deploy!

4. **Add Environment Variables in Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_SOCKET_URL`
     - `UNSPLASH_ACCESS_KEY`

5. **Redeploy**
   ```bash
   vercel --prod
   ```

Your app is now live! 🎉

**Access URLs:**
- Frontend: `https://chesticals.vercel.app`
- Backend: `https://chesticals-server.onrender.com`

---

## Option 2: Railway (All-in-One)

**Simpler but backend has cold starts after inactivity.**

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Create Project

```bash
railway init
```

### Step 4: Deploy Backend

```bash
# From project root
railway up
```

### Step 5: Get Backend URL

```bash
railway domain
# Generates: chesticals-server.railway.app
```

### Step 6: Deploy Frontend to Vercel

Follow same steps as Option 1, but use Railway URL:
```env
NEXT_PUBLIC_SOCKET_URL=https://chesticals-server.railway.app
```

---

## Option 3: Fly.io (Backend) + Vercel (Frontend)

### Step 1: Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Create fly.toml

```toml
app = "chesticals-server"

[build]
  [build.env]
    NODE_VERSION = "18"

[env]
  PORT = "8080"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

### Step 3: Deploy to Fly.io

```bash
fly auth login
fly launch
fly deploy
```

Your backend URL: `https://chesticals-server.fly.dev`

---

## Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited bandwidth
- ✅ 100 GB-hours/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ⚠️ Serverless functions: 10s timeout
- ⚠️ No WebSockets on serverless

### Render (Backend) ⭐ Recommended
- ✅ 750 hours/month (31 days)
- ✅ 512 MB RAM
- ✅ Automatic HTTPS
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start: ~30 seconds

### Railway (All-in-One)
- ✅ $5 free credit/month
- ✅ ~500 hours runtime
- ✅ No cold starts on hobby plan
- ⚠️ Credit runs out if high usage

### Fly.io (Backend)
- ✅ 3 VMs free
- ✅ 256 MB RAM each
- ✅ 160 GB bandwidth/month
- ⚠️ More complex setup

---

## Recommended Setup for Friends

**Best Free Option:** Vercel + Render

**Pros:**
- Free forever
- Easy deployment
- Automatic HTTPS
- No credit card needed
- Good performance

**Cons:**
- Backend cold starts (30s) after inactivity
- First player to connect wakes it up

**Quick Deploy Commands:**

```bash
# 1. Deploy backend to Render (via GitHub)
# → Push code to GitHub
# → Connect repo in Render dashboard
# → Done!

# 2. Deploy frontend to Vercel
vercel login
vercel
# → Follow prompts
# → Add environment variables
# → Done!
```

---

## Keeping Backend Alive (Free Trick)

Render spins down after 15 minutes of inactivity. Keep it awake:

### Option A: Cron Job (External)

Use a free service like UptimeRobot or Cron-job.org:

1. Go to https://uptimerobot.com (free)
2. Create monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://chesticals-server.onrender.com/health`
   - **Interval**: 14 minutes
3. This pings your server to keep it warm

### Option B: Self-Ping (In Server)

Add to `server.js`:

```javascript
// Self-ping to prevent cold starts (optional)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    fetch(`https://chesticals-server.onrender.com/health`)
      .then(() => console.log('Keep-alive ping'))
      .catch(() => console.log('Keep-alive ping failed'));
  }, 14 * 60 * 1000); // Every 14 minutes
}
```

---

## Testing Your Deployment

### 1. Test Backend
```bash
curl https://chesticals-server.onrender.com/health
# Should return: {"status":"ok",...}
```

### 2. Test Frontend
Open: `https://chesticals.vercel.app`

### 3. Test Multiplayer
1. Open app in two browsers
2. Create room in Browser 1
3. Copy room code
4. Join room in Browser 2
5. Play chess!

---

## Troubleshooting

### Backend Connection Failed

**Check CORS:**
```javascript
// server.js
cors: {
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://*.vercel.app',
  ],
}
```

### WebSocket Connection Error

**Use wss:// in production:**
```typescript
// useMultiplayer.ts
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

const newSocket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  secure: true, // Important for HTTPS
});
```

### Theme Not Working

**Add Unsplash API key in Vercel:**
1. Vercel Dashboard → Project → Settings
2. Environment Variables
3. Add `UNSPLASH_ACCESS_KEY`
4. Redeploy

---

## GitHub Actions Auto-Deploy (Bonus)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Cost Summary

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **Vercel** | Unlimited | Frontend ⭐ |
| **Render** | 750h/month | Backend ⭐ |
| **Railway** | $5 credit | All-in-one |
| **Fly.io** | 3 VMs | Advanced users |
| **UptimeRobot** | 50 monitors | Keep-alive |

**Total Cost:** $0/month 🎉

---

## Quick Start (TL;DR)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/chesticals.git
   git push -u origin main
   ```

2. **Deploy Backend** (Render)
   - Visit render.com
   - New Web Service → Connect GitHub
   - Auto-deploy from repo
   - Copy URL

3. **Deploy Frontend** (Vercel)
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```
   - Add env vars in dashboard
   - Redeploy with `vercel --prod`

4. **Play!**
   - Share link with friends
   - Create room
   - Have fun! ♟️

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Service → Logs
2. Check Vercel logs: Dashboard → Deployments → Logs
3. Test Socket.io: https://chesticals-server.onrender.com
4. Verify CORS settings
5. Check environment variables

**Pro Tip:** Add `/health` endpoint check to your frontend to show server status!

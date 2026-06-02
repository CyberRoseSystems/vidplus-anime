# Deploy VidPlus Anime Streaming to Railway

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up (free, no credit card needed)
3. Click "New Project"

## Step 2: Deploy Backend

### Option A: Connect GitHub (Easiest)
1. In Railway, click "Deploy from GitHub"
2. Connect your GitHub account
3. Select `CyberRoseSystems/vidplus-anime` repository
4. Select branch `main`
5. Click "Deploy"
6. Wait for deployment to complete
7. Copy your Railway URL (e.g., `https://vidplus-production.up.railway.app`)

### Option B: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# In your vidplus-anime folder
railway init

# Deploy
railway up
```

## Step 3: Update Frontend URL

After Railway deployment, update this line in `index.html`:

```javascript
// Change this to your Railway backend URL
const BACKEND_URL = 'https://your-railway-url.up.railway.app';
```

Example:
```javascript
const BACKEND_URL = 'https://vidplus-production.up.railway.app';
```

## Step 4: Test Locally (Optional)

```bash
# Install dependencies
npm install

# Start server
npm start

# Open http://localhost:5000/index.html in browser
```

## Step 5: Deploy Frontend to GitHub Pages

1. Go to repo Settings → Pages
2. Select "main" branch as source
3. Site will be live at `https://CyberRoseSystems.github.io/vidplus-anime/`

## Step 6: Test

1. Open your GitHub Pages URL
2. Search for an anime (e.g., "Naruto")
3. Select anime
4. Choose episode
5. Click "Play"
6. Enjoy! 🎬

## Troubleshooting

**CORS Error?**
- Make sure BACKEND_URL is correct in index.html
- Check Railway deployment is running

**No Episodes Found?**
- API might be down, try searching different anime
- Check console for error messages

**Video Won't Play?**
- Make sure video source URL is accessible
- Try a different episode
- Check browser console for errors

## Notes

- Railway free tier has limits (~5GB/month bandwidth)
- Keep index.html updated with correct backend URL
- Backend needs `Node.js 18+` (Railway provides this)

---

**Questions?** Check Railway docs: https://docs.railway.app
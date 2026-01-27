# Quick Start Guide

Get SearchApp running in 5 minutes!

## Prerequisites
- .NET 8.0 SDK ([Download](https://dotnet.microsoft.com/download))
- Node.js v16+ ([Download](https://nodejs.org/))
- Text editor (VS Code, Notepad++, etc.)

---

## Step 1: Get Your FREE SerpAPI Key

**Why?** SearchApp uses SerpAPI to search Google, Bing, Yahoo, etc. You need an API key.

**How to get it:**

1. Visit [https://serpapi.com/](https://serpapi.com/)
2. Click "Register" (top right corner)
3. Sign up with:
   - Email and password, OR
   - "Sign in with Google" (faster!)
4. After signing in, you'll see your dashboard
5. Go to [https://serpapi.com/manage-api-key](https://serpapi.com/manage-api-key)
6. **Copy your API key** (it's a long string like `a1b2c3d4e5f6...`)
7. Keep this browser tab open - you'll need it!

**Free Tier:** 100 searches per month (plenty for testing!)

---

## Step 2: Create Configuration File

**You need to create a file with your API key.**

### Windows:

1. Open PowerShell or Command Prompt
2. Navigate to the project:
   ```powershell
   cd c:\code\SearchApp\SearchApi
   ```
3. Create the file:
   ```powershell
   New-Item -Path "appsettings.Development.json" -ItemType File -Force
   ```
4. Open the file:
   ```powershell
   notepad appsettings.Development.json
   ```

### macOS/Linux:

1. Open Terminal
2. Navigate to the project:
   ```bash
   cd /path/to/SearchApp/SearchApi
   ```
3. Create and open the file:
   ```bash
   nano appsettings.Development.json
   ```

### Paste This Content:

Copy and paste this into the file:

```json
{
  "SerpApi": {
    "ApiKey": "YOUR_KEY_HERE"
  }
}
```

**Replace `YOUR_KEY_HERE` with your actual API key from Step 1!**

**Complete Example:**
```json
{
  "SerpApi": {
    "ApiKey": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
  }
}
```

**Save the file:**
- Notepad: Ctrl+S
- Nano: Ctrl+X, then Y, then Enter

✅ Done! This file stays on YOUR computer only (not uploaded to GitHub).

---

## Step 3: Start Backend API

Open a terminal/command prompt:

**Windows PowerShell:**
```powershell
cd c:\code\SearchApp\SearchApi
dotnet restore
dotnet run
```

**macOS/Linux Terminal:**
```bash
cd /path/to/SearchApp/SearchApi
dotnet restore
dotnet run
```

**Wait for this message:**
```
Now listening on: http://localhost:5000
```

✅ API is running on `http://localhost:5000`  
✅ **Database (`searchapp.db`) automatically created on first run**  
✅ **Keep this terminal open!**

---

## Step 4: Start Frontend

Open a **NEW** terminal (keep the backend running!):

**Windows PowerShell:**
```powershell
cd c:\code\SearchApp\SearchAppClient
npm install
npm start
```

**macOS/Linux Terminal:**
```bash
cd /path/to/SearchApp/SearchAppClient
npm install
npm start
```

**First run:** `npm install` takes 1-2 minutes (downloads dependencies).

✅ Browser automatically opens at `http://localhost:3000`  
✅ **Keep this terminal open too!**

If browser doesn't open, manually go to: [http://localhost:3000](http://localhost:3000)

---

## Step 5: Register & Start Searching!

### Create Your Account:

1. Click **"Register here"** on the login page
2. Fill in the form:
   - **Username:** `testuser` (3+ characters, letters/numbers/underscore)
   - **Email:** `test@example.com` (valid email format)
   - **Password:** `Test123456` (6+ characters, must have letters AND numbers)
3. Click **"Register"**
4. You're automatically logged in! 🎉

### Try Your First Search:

1. Enter a query: `artificial intelligence`
2. All 6 search engines are selected by default
3. Click **"Search"**
4. Watch the loading animation with estimated time
5. See results from all engines in 5-7 seconds!

**What it does:**
- Searches "artificial" on all engines
- Searches "intelligence" on all engines  
- Sums the totals per engine
- Shows you the combined results

---

## Troubleshooting

### ❌ "SerpApi:ApiKey not found"

**Fix:** You didn't create `appsettings.Development.json` or it's in the wrong place.

1. Make sure you're in the `SearchApi` folder
2. Create the file again (see Step 2)
3. Check the file contains your API key
4. Restart the backend (`dotnet run`)

### ❌ Port 5000 or 3000 Already in Use

**Fix:** Kill existing processes:

**Windows:**
```powershell
Get-Process -Name node | Stop-Process -Force
Get-Process -Name dotnet | Stop-Process -Force
```

**macOS/Linux:**
```bash
killall node
killall dotnet
```

### ❌ "npm install" Fails

**Fix:** Clear cache and try again:
```bash
cd SearchAppClient
rm -rf node_modules
npm cache clean --force
npm install
```

### ❌ Database Errors

**Fix:** Delete database and let it recreate:

**Windows:**
```powershell
cd SearchApi
Remove-Item searchapp.db
dotnet run
```

**macOS/Linux:**
```bash
cd SearchApi
rm searchapp.db
dotnet run
```

---

## What's Next?

### Test Different Searches:

✅ **Single word:** `Python`  
✅ **Multiple words:** `machine learning algorithms`  
✅ **Questions:** `how to learn programming`  
✅ **Different engines:** Uncheck some engines to compare results

### Try the Tests:

**Backend Unit Tests (34 tests):**
```bash
cd SearchApi.Tests
dotnet test
```

**Frontend E2E Tests (13 tests):**
```bash
cd SearchAppClient
npm run cy:run
```

### Explore the Code:

- **Backend:** `SearchApi/Controllers/` - API endpoints
- **Frontend:** `SearchAppClient/src/components/` - React UI
- **Security:** `SearchApi/Validators/` - Input validation
- **Search Logic:** `SearchApi/Services/SerpApiService.cs`

---

## Quick Reference

| What | Command | Where |
|------|---------|-------|
| Start Backend | `dotnet run` | `SearchApi/` |
| Start Frontend | `npm start` | `SearchAppClient/` |
| Run Backend Tests | `dotnet test` | `SearchApi.Tests/` |
| Run Frontend Tests | `npm run cy:run` | `SearchAppClient/` |
| Stop Everything | Ctrl+C in both terminals | Both |

**API Key Location:** `SearchApi/appsettings.Development.json`

**API URL:** http://localhost:5000  
**Frontend URL:** http://localhost:3000

---

## Need Help?

- 📖 Full documentation: [IMPLEMENTATION.md](./IMPLEMENTATION.md)
- 🐛 Found a bug? [Create an issue](https://github.com/andersbranderud/SearchApp/issues)
- 💡 Questions? Check the [README.md](./README.md)

Happy searching! 🔍

## API Endpoints

### Public
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token

### Protected (requires JWT token)
- `POST /api/search` - Search query
- `GET /api/search/engines` - Available engines

## Environment
- **Backend**: .NET 8.0, SQLite, JWT
- **Frontend**: React 18, TypeScript
- **API**: SerpAPI (Google, Bing, Yelp, DuckDuckGo)

## Support Files
- `IMPLEMENTATION.md` - Detailed implementation guide
- `COMPLETION_SUMMARY.md` - Complete feature summary
- `README.md` - Project overview

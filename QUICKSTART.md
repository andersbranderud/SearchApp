# Quick Start Guide

## Prerequisites
- .NET 8.0 SDK
- Node.js (v16+)
- Git (optional)

## Step 1: Start Backend API
Open a PowerShell terminal:
```powershell
cd c:\code\SearchApp\SearchApi
dotnet run
```
✅ API will start on `http://localhost:5000`

## Step 2: Start Frontend
Open a **new** PowerShell terminal:
```powershell
cd c:\code\SearchApp\SearchAppClient
npm start
```
✅ Browser will open at `http://localhost:3000`

## Step 3: Register & Login
1. Click "Register here"
2. Create account:
   - Username: `testuser` (3+ chars, alphanumeric)
   - Email: `test@example.com`
   - Password: `password123` (6+ chars, letters + numbers)
3. Automatically logged in!

## Step 4: Search
1. Enter query: `Hello world`
2. Select search engines (all selected by default)
3. Click "Search"
4. View results showing total hits per engine

## Step 5: Run Tests (Optional)

### Backend Unit Tests (28 tests)
```powershell
cd c:\code\SearchApp\SearchApi.Tests
dotnet test
```

### Frontend E2E Tests
```powershell
cd c:\code\SearchApp\SearchAppClient
npm run cy:open  # Interactive mode
```

## Troubleshooting

### Port Already in Use
```powershell
# Kill existing processes
Get-Process -Name node | Stop-Process -Force
Get-Process -Name dotnet | Where-Object {$_.MainWindowTitle -like "*SearchApi*"} | Stop-Process -Force
```

### Database Issues
Delete `searchapp.db` and restart the API - it will recreate automatically.

### Frontend Build Errors
```powershell
cd c:\code\SearchApp\SearchAppClient
Remove-Item -Recurse -Force node_modules
npm install
```

## Testing the Features

### 1. Multi-Word Search
Try: `artificial intelligence`
- Searches "artificial" → Gets count
- Searches "intelligence" → Gets count  
- Shows combined total per engine

### 2. Security Validation
Try these (they should be blocked):
- SQL: `SELECT * FROM users` ❌
- XSS: `<script>alert('xss')</script>` ❌
- Too long: Query > 500 chars ❌

### 3. Authentication
- Try accessing `/search` without login → Redirected to `/login` ✅
- Logout and login again ✅
- Invalid credentials → Error message ✅

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

# SearchApp - Multi-Engine Search Application

A secure, full-stack search application that performs multi-word searches across multiple search engines (Google, Bing, Yahoo, DuckDuckGo, Baidu, Yandex) using SerpAPI.

## Features

### 🔐 Security
- JWT-based authentication
- BCrypt password hashing
- SQL injection protection
- XSS (Cross-Site Scripting) protection
- CSRF token support
- Comprehensive input validation

### 🔍 Search Capabilities
- **Multi-Word Search**: Searches each word separately and sums results
- **6 Search Engines**: Google, Bing, Yahoo, DuckDuckGo, Baidu, Yandex
- **Parallel Processing**: All searches run concurrently for maximum speed (70% faster)
- **Real-time Progress**: Loading banner with estimated time and progress bar

### 👤 User Management
- User registration with validation
- Secure login with JWT tokens
- Protected routes
- SQLite database with Entity Framework Core

### ⚡ Performance
- Parallelized API calls (searches all engines and words simultaneously)
- Optimized from 18-20s to 5-7s for typical searches
- Real-time progress tracking with elapsed/estimated time

## Tech Stack

### Backend
- ASP.NET Core 8.0
- Entity Framework Core 8.0
- SQLite
- JWT Authentication
- BCrypt.Net-Next 4.0.3
- SerpAPI Integration
- xUnit + Moq (Testing)

### Frontend
- React 18.2.0
- TypeScript 4.9.5
- React Router DOM 6.20.0
- Axios 1.6.0
- Cypress 13.17.0 (E2E Testing)

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js (v14 or higher)
- SerpAPI Account ([Get Free API Key](https://serpapi.com/))

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/andersbranderud/SearchApp.git
   cd SearchApp
   ```

2. **Get Your SerpAPI Key (Required)**
   
   SerpAPI provides search engine results. Free tier includes 100 searches/month.
   
   **Step-by-step:**
   - Go to [https://serpapi.com/](https://serpapi.com/)
   - Click "Register" (top right)
   - Sign up with email or Google account
   - After login, go to [https://serpapi.com/manage-api-key](https://serpapi.com/manage-api-key)
   - Copy your API key (looks like: `a1b2c3d4e5f6...`)
   - Keep this key - you'll need it in the next step!

3. **Configure Your API Key**
   
   You need to create a configuration file with your API key.
   
   **Windows (PowerShell):**
   ```powershell
   cd SearchApi
   New-Item -Path "appsettings.Development.json" -ItemType File
   ```
   
   **macOS/Linux (Terminal):**
   ```bash
   cd SearchApi
   touch appsettings.Development.json
   ```
   
   **Then open the file** in any text editor and paste this:
   ```json
   {
     "SerpApi": {
       "ApiKey": "PASTE_YOUR_API_KEY_HERE"
     }
   }
   ```
   
   Replace `PASTE_YOUR_API_KEY_HERE` with your actual key from step 2.
   
   **Example:**
   ```json
   {
     "SerpApi": {
       "ApiKey": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
     }
   }
   ```
   
   ⚠️ **Important:** This file is git-ignored and won't be uploaded to GitHub.

4. **Run Backend API**
   
   Open a terminal/command prompt:
   ```bash
   cd SearchApi
   dotnet restore
   dotnet run
   ```
   
   **You should see:**
   ```
   Building...
   info: Microsoft.Hosting.Lifetime[14]
         Now listening on: http://localhost:5000
   ```
   
   ✅ Backend is running on `http://localhost:5000`  
   ✅ **Database (`searchapp.db`) will be automatically created on first run**  
   ✅ Keep this terminal window open!

5. **Run Frontend** (Open a NEW terminal)
   
   ```bash
   cd SearchAppClient
   npm install
   npm start
   ```
   
   **First time only:** `npm install` will take 1-2 minutes to download dependencies.
   
   ✅ Browser will automatically open at `http://localhost:3000`  
   ✅ Keep this terminal window open too!

6. **Create Your Account & Start Searching!**
   
   - Click "Register here" on the login page
   - Fill in:
     - **Username:** 3+ characters (letters, numbers, underscore)
     - **Email:** Valid email format
     - **Password:** 6+ characters (must include letters AND numbers)
   - Click "Register"
   - You'll be automatically logged in!
   - Enter a search query (e.g., "artificial intelligence")
   - Select search engines (all selected by default)
   - Click "Search" and watch the results!

## Testing

### Backend Unit Tests (34 tests)
```bash
cd SearchApi.Tests
dotnet test
```

Tests cover:
- Input validation (SQL injection, XSS, CSRF protection)
- Email validation (8 comprehensive scenarios)
- Authentication service (registration, login, JWT)

### Frontend E2E Tests (13 tests)
```bash
cd SearchAppClient
npm run cy:run
```

Tests cover:
- Authentication flow (register, login, logout)
- Search functionality with real API calls
- Engine selection and validation
- Results display

## Project Structure

```
SearchApp/
├── SearchApi/                 # Backend API
│   ├── Controllers/          # API endpoints
│   ├── Services/            # Business logic & SerpAPI integration
│   ├── Validators/          # Security validation
│   ├── Models/              # Data models
│   └── Data/                # Database context
├── SearchApi.Tests/          # Backend unit tests
├── SearchAppClient/          # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API integration
│   │   └── types/           # TypeScript types
│   └── cypress/             # E2E tests
└── Documentation/
    ├── IMPLEMENTATION.md     # Technical details
    ├── COMPLETION_SUMMARY.md # Feature summary
    ├── PERFORMANCE_IMPROVEMENTS.md
    └── QUICKSTART.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Search (Protected)
- `POST /api/search` - Perform multi-engine search
- `GET /api/search/engines` - Get available search engines

## Architecture Highlights

### SOLID Principles
- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Extensible through interfaces
- **Liskov Substitution**: Interface-based design
- **Interface Segregation**: Focused interfaces
- **Dependency Injection**: Full DI throughout

### Security Features
- Password requirements: 6+ chars, letters + numbers
- Username: 3-100 chars, alphanumeric + underscore
- Email validation: Comprehensive edge case handling
- Search query: Max 500 chars, filtered for SQL/XSS
- Engine validation: Whitelist-based

## Performance Metrics

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| 4 engines, 2 words | 16-24s | 5-7s | **70% faster** |
| 4 engines, 1 word | 8-12s | 2-3s | **75% faster** |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [SerpAPI](https://serpapi.com/) for search engine API
- ASP.NET Core team for the excellent framework
- React team for the powerful UI library

## Support

For issues and questions:
- Create an [Issue](https://github.com/andersbranderud/SearchApp/issues)
- Check [Documentation](./IMPLEMENTATION.md)

---

**Note**: This application requires a valid SerpAPI key. Free tier includes 100 searches/month.

# Search App - Implementation Summary

## Overview
A secure, full-stack multi-engine search application integrated with SerpAPI, featuring user authentication, comprehensive validation, and following SOLID principles.

## Features Implemented

### Backend (SearchApi)
1. **SerpAPI Integration**
   - Generic service implementation (not tied to specific API)
   - Supports Google, Bing, Yelp, and DuckDuckGo
   - Multi-word search: searches each word separately and sums results
   - Follows SOLID principles and dependency injection

2. **User Authentication & Authorization**
   - SQLite database with Entity Framework Core
   - User registration with password hashing (BCrypt)
   - JWT-based authentication
   - Protected API endpoints requiring valid tokens

3. **Security & Validation**
   - Input validation class with multiple security checks:
     - SQL injection protection
     - XSS (Cross-Site Scripting) protection
     - CSRF (Cross-Site Request Forgery) protection
     - Search engine whitelist validation
     - Length and character restrictions
   - Server-side and client-side validation
   - Secure password requirements

4. **Unit Tests**
   - Validator tests covering all security scenarios
   - Authentication service tests
   - In-memory database testing

### Frontend (SearchAppClient)
1. **Authentication Pages**
   - Registration page with client-side validation
   - Login page
   - Protected routes requiring authentication
   - Logout functionality

2. **Search Interface**
   - Multi-word search support with explanatory hints
   - Search engine selection (Google, Bing, Yelp, DuckDuckGo)
   - Results display showing total hit counts per engine
   - Number formatting (K for thousands, M for millions)

3. **End-to-End Tests**
   - Cypress tests for authentication flow
   - Search functionality tests
   - Integration tests with live API

## Architecture & Design Principles

### SOLID Principles Applied
- **Single Responsibility**: Each service has one clear purpose
- **Open/Closed**: Services extensible through interfaces
- **Liskov Substitution**: All implementations follow interface contracts
- **Interface Segregation**: Focused interfaces (IAuthService, IExternalSearchService, IInputValidator)
- **Dependency Injection**: All dependencies injected through constructors

### Security Features
- JWT token authentication
- BCrypt password hashing
- Input sanitization and validation
- CORS configuration
- Anti-forgery token support
- Protected API endpoints

## Setup Instructions

### Prerequisites
- .NET 8.0 SDK
- Node.js (v16+)
- npm or yarn

### Backend Setup

1. **Restore NuGet packages:**
   ```powershell
   cd SearchApi
   dotnet restore
   ```

2. **Run the API:**
   ```powershell
   dotnet run
   ```
   
   The API will start on `http://localhost:5000` and `https://localhost:5001`

3. **Run Unit Tests:**
   ```powershell
   cd ..\SearchApi.Tests
   dotnet test
   ```

### Frontend Setup

1. **Install dependencies:**
   ```powershell
   cd SearchAppClient
   npm install
   ```

2. **Start the development server:**
   ```powershell
   npm start
   ```
   
   The app will open at `http://localhost:3000`

3. **Run Cypress tests:**
   ```powershell
   # For interactive mode
   npm run cy:open
   
   # For headless mode
   npm run cy:run
   ```

## Configuration

### Backend Configuration (appsettings.json)
The SerpAPI key is already configured:
```json
{
  "SerpApi": {
    "ApiKey": "d15e52770c73192ec8c0e9c755272ea096889edc16d126367f0b6b5d64f06842"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "SearchApi",
    "Audience": "SearchAppClient"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=searchapp.db"
  }
}
```

### Database
- SQLite database (`searchapp.db`) is automatically created on first run
- Entity Framework migrations are applied automatically

## Usage Flow

1. **Register a New User**
   - Navigate to `/register`
   - Provide username (3+ chars, alphanumeric + underscore)
   - Provide valid email
   - Password must be 6+ chars with letters and numbers
   - Passwords must match

2. **Login**
   - Use username or email
   - Enter password
   - JWT token stored in localStorage

3. **Perform Search**
   - Enter search query (e.g., "Hello world")
   - Select desired search engines
   - Click Search
   - View total results from each engine

4. **Search Behavior**
   - Multi-word queries are split into individual words
   - Each word is searched separately on each selected engine
   - Results are summed per engine
   - Example: "Hello world" → searches "Hello" + "world" and shows combined totals

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

### Search (Protected)
- `POST /api/search` - Perform search (requires JWT token)
- `GET /api/search/engines` - Get available engines (requires JWT token)

## Testing

### Backend Tests
Located in `SearchApi.Tests`:
- `InputValidatorTests` - Security and validation tests
- `AuthServiceTests` - Authentication flow tests

### Frontend Tests
Located in `cypress/e2e`:
- Authentication flow tests
- Registration validation tests
- Search functionality tests
- Protected route tests

## Security Validations

### Input Validation
- SQL injection pattern detection
- XSS attack prevention
- Length restrictions
- Character whitelisting
- Search engine validation against allowed list

### Password Requirements
- Minimum 6 characters
- Must contain letters and numbers
- Hashed using BCrypt before storage

### API Protection
- All search endpoints require valid JWT token
- Token includes user ID, username, and email claims
- 7-day token expiration

## Technologies Used

### Backend
- ASP.NET Core 8.0
- Entity Framework Core (SQLite)
- JWT Authentication
- BCrypt.Net for password hashing
- xUnit for testing
- Moq for mocking

### Frontend
- React 18
- TypeScript
- React Router for navigation
- Axios for HTTP requests
- Cypress for E2E testing

## Notes

- The application follows REST API best practices
- All user inputs are validated both client-side and server-side
- The architecture is designed to be testable and maintainable
- SerpAPI integration is abstracted through interfaces for easy replacement
- The search controller and services are generic (not named after specific APIs)

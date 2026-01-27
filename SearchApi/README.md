# SearchApi Quick Start Guide

## Run the API

### Option 1: Using .NET CLI
```bash
cd SearchApi
dotnet run
```

### Option 2: Using Visual Studio
1. Open `SearchApi.csproj` in Visual Studio 2022
2. Press F5 or click "Start Debugging"

### Option 3: Using VS Code
1. Open the `SearchApi` folder in VS Code
2. Press F5 to run with debugging (requires C# extension)

## Test the API

Once running, open your browser to:
- Swagger UI: http://localhost:5000/swagger
- API Base: http://localhost:5000/api

### Test with curl:

**Get available engines:**
```bash
curl http://localhost:5000/api/search/engines
```

**Perform a search:**
```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "React hooks tutorial",
    "searchEngines": ["Google", "Bing"]
  }'
```

## API Configuration

### Port Configuration
Default ports are set in `Properties/launchSettings.json`:
- HTTP: 5000
- HTTPS: 5001

### CORS Configuration
Configured in `Program.cs` to allow requests from:
- http://localhost:3000 (React default)
- http://localhost:5173 (Vite)

### ChatGPT Configuration
Add your OpenAI API key in `appsettings.json`:
```json
{
  "OpenAI": {
    "ApiKey": "sk-your-key-here"
  }
}
```

## Project Structure

```
SearchApi/
??? Controllers/
?   ??? SearchController.cs      # REST endpoints
??? Models/
?   ??? SearchRequest.cs         # Request DTOs
?   ??? SearchResult.cs          # Response DTOs
??? Services/
?   ??? ISearchService.cs        # Search abstraction
?   ??? SearchService.cs         # Search implementation
?   ??? IChatGptService.cs       # ChatGPT abstraction
?   ??? ChatGptService.cs        # ChatGPT implementation
??? Properties/
?   ??? launchSettings.json      # Launch configuration
??? Program.cs                    # App configuration
??? appsettings.json             # Configuration
??? SearchApi.csproj             # Project file
```

## Dependency Injection

Services are registered in `Program.cs`:
- `IHttpClientFactory` - For making HTTP requests
- `IChatGptService` - ChatGPT integration
- `ISearchService` - Search orchestration

## Troubleshooting

### Port already in use
Change ports in `Properties/launchSettings.json`

### CORS errors
Add your frontend URL to the CORS policy in `Program.cs`

### Build errors
```bash
cd SearchApi
dotnet clean
dotnet restore
dotnet build
```

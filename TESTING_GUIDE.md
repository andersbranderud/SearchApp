# Testing Guide

This document explains the testing setup for the SearchApp project, including how mocked services are used to avoid making actual API calls during testing.

## Overview

The application uses a clever dependency injection pattern that allows for seamless switching between real and mocked services without modifying production code.

## Backend Testing Setup

### Mock Service Implementation

**File**: `SearchApi/Services/MockExternalSearchService.cs`

The `MockExternalSearchService` implements the same `IExternalSearchService` interface as the production `SerpApiService`, but returns deterministic, pre-calculated results without making external API calls.

**Features**:
- Returns consistent, deterministic results based on query hash
- Simulates realistic result counts per engine
- Adds artificial delay to simulate network latency
- No external dependencies or API keys required

### Configuration-Based Service Injection

**File**: `SearchApi/Program.cs`

The application checks the `Testing:UseMockSearchService` configuration setting to determine which implementation to use:

```csharp
var useMockSearchService = builder.Configuration.GetValue<bool>("Testing:UseMockSearchService");
if (useMockSearchService)
{
    builder.Services.AddScoped<IExternalSearchService, MockExternalSearchService>();
}
else
{
    builder.Services.AddScoped<IExternalSearchService, SerpApiService>();
}
```

### Test Configuration File

**File**: `SearchApi/appsettings.Test.json`

Contains test-specific settings:
- `Testing:UseMockSearchService: true` - Enables mock service
- Test JWT secret key
- Test database configuration

### Running Backend with Mock Service

To run the backend with mocked search services:

```bash
cd SearchApi
dotnet run --environment Test
```

Or set the environment variable:

```bash
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet run
```

## Frontend Testing Setup

### Unit Tests (Jest)

**Fixed Issue**: Missing `@types/jest` package caused TypeScript compilation errors.

**Solution**: Installed `@types/jest` to provide proper type definitions.

```bash
cd SearchAppClient
npm install --save-dev @types/jest
npm test
```

### E2E Tests (Cypress)

#### Mock Data Module

**File**: `cypress/support/mockData.ts`

Contains:
- Mock search engine list
- Function to generate deterministic mock search results
- Mock user credentials
- Mock authentication responses

#### Custom Cypress Commands

**File**: `cypress/support/commands.ts`

Provides custom commands:
- `cy.mockApiCalls()` - Sets up all API intercepts with mocked responses
- `cy.loginWithMock(username, password)` - Logs in using mocked authentication

#### Improved E2E Tests

**File**: `cypress/e2e/search.cy.ts`

**Key Improvements**:
1. **No Real API Calls**: All HTTP requests are intercepted by Cypress and return mock data
2. **Faster Execution**: Tests complete in seconds instead of waiting for actual API responses
3. **Deterministic Results**: Same inputs always produce same outputs
4. **No External Dependencies**: No need for SerpAPI keys or internet connection
5. **Request Validation**: Can inspect and assert on request payloads

**Example Test**:
```typescript
it('should perform search with only selected engines', () => {
  cy.get('[data-testid="engine-yahoo"]').uncheck();
  cy.get('[data-testid="search-input"]').type('Test query');
  cy.get('[data-testid="search-button"]').click();
  
  cy.wait('@search').then((interception) => {
    // Verify the request payload
    expect(interception.request.body.searchEngines).to.include('Google');
  });
});
```

### Running Cypress Tests

```bash
cd SearchAppClient

# Interactive mode with UI
npm run cy:open

# Headless mode
npm run cy:run
```

## Architecture Benefits

### 1. No Production Code Modification
- Production classes (`SerpApiService`, `AuthService`) remain unchanged
- No test-specific code in production files

### 2. Separation of Concerns
- Mock implementations are in separate files
- Test configuration is isolated in `appsettings.Test.json`

### 3. Easy Switching
- Single configuration change switches between real/mock services
- Can run both modes without code changes

### 4. Realistic Testing
- Mock services implement the same interfaces
- Behavior matches production services
- Tests verify actual application logic

### 5. Fast and Reliable
- No network dependencies
- Consistent results every run
- Tests complete in seconds

## Testing Workflow

### For Developers

**Daily Development**:
1. Run unit tests with `npm test`
2. Run Cypress tests with `npm run cy:run` (uses mocks)
3. All tests complete quickly without external dependencies

**Integration Testing**:
1. Set `Testing:UseMockSearchService: false` in configuration
2. Provide real SerpAPI key
3. Run backend: `dotnet run`
4. Run frontend against real backend to verify integration

**Production Deployment**:
- Default configuration uses real `SerpApiService`
- No test code is deployed or executed

### For CI/CD

```yaml
# Example CI configuration
test:
  - npm install
  - npm test
  - npm run cy:run  # Uses mocked APIs
  
integration:
  - export ASPNETCORE_ENVIRONMENT=Test
  - dotnet run &  # Runs with mock service
  - npm run cy:run
```

## Mock Data Logic

The mock service generates deterministic results using a simple algorithm:

```csharp
// Base multiplier per engine
baseCount = { google: 1000000, bing: 750000, ... }

// Hash the query word
queryHash = Math.Abs(query.GetHashCode())

// Add variation
variation = queryHash % 100000

// Result
result = baseCount + variation
```

For multi-word queries, results are summed:
```
"Hello world" → GetCount("Hello") + GetCount("world")
```

This ensures:
- Same query always returns same results
- Different queries return different results
- Results are realistic (within expected ranges)

## Troubleshooting

### Unit Tests Not Running
```bash
# Ensure types are installed
npm install --save-dev @types/jest @types/node
```

### Cypress Tests Timing Out
- Check that `cy.mockApiCalls()` is called in `beforeEach`
- Verify imports in `commands.ts`

### Backend Using Wrong Service
- Check `ASPNETCORE_ENVIRONMENT` environment variable
- Verify `appsettings.Test.json` exists
- Check logs for service registration confirmation

## Future Enhancements

1. **Mock Service Variations**: Add different mock scenarios (errors, delays, empty results)
2. **Configurable Responses**: Allow tests to customize mock responses per test
3. **Recording Mode**: Record real API responses and replay them in tests
4. **Performance Benchmarks**: Compare mock vs real service performance

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using SearchApi.Models;
using Xunit;

namespace SearchApi.IntegrationTests
{
    public class SearchIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public SearchIntegrationTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        private async Task<string> GetAuthTokenAsync()
        {
            // Register and login to get a valid token
            var username = $"searchuser_{Guid.NewGuid():N}";
            var email = $"search_{Guid.NewGuid():N}@example.com";
            var password = "ValidPassword123!";

            var registerRequest = new RegisterRequest
            {
                Username = username,
                Email = email,
                Password = password
            };

            var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
            var authResponse = await registerResponse.Content.ReadFromJsonAsync<AuthResponse>();
            
            return authResponse?.Token ?? throw new InvalidOperationException("Failed to get auth token");
        }

        [Fact]
        public async Task GetAvailableEngines_ReturnsEngineList()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/search/engines");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var engines = await response.Content.ReadFromJsonAsync<List<string>>();
            Assert.NotNull(engines);
            Assert.Contains("Google", engines);
            Assert.Contains("Bing", engines);
            Assert.Contains("DuckDuckGo", engines);
            Assert.Equal(6, engines.Count);
        }

        [Fact]
        public async Task GetAvailableEngines_WithoutAuth_ReturnsUnauthorized()
        {
            // Act - Don't set authorization header
            var response = await _client.GetAsync("/api/search/engines");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Search_WithValidQuery_ReturnsMockedResults()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var searchRequest = new SearchRequest
            {
                Query = "test query",
                SearchEngines = new List<string> { "Google", "Bing" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var result = await response.Content.ReadFromJsonAsync<SearchResult>();
            Assert.NotNull(result);
            Assert.Equal("test query", result.Query);
            Assert.Equal(2, result.SearchEngines.Count);
            Assert.Equal(2, result.EngineTotals.Count);
            
            // Verify that mock service returned results
            Assert.True(result.EngineTotals["Google"] > 0);
            Assert.True(result.EngineTotals["Bing"] > 0);
        }

        [Fact]
        public async Task Search_WithSingleWord_ReturnsMockedResults()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var searchRequest = new SearchRequest
            {
                Query = "hello",
                SearchEngines = new List<string> { "Google" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var result = await response.Content.ReadFromJsonAsync<SearchResult>();
            Assert.NotNull(result);
            Assert.Equal("hello", result.Query);
            Assert.Single(result.EngineTotals);
            Assert.True(result.EngineTotals["Google"] > 0);
        }

        [Fact]
        public async Task Search_WithMultipleWords_SumsResults()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var searchRequest = new SearchRequest
            {
                Query = "hello world",
                SearchEngines = new List<string> { "Google" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var result = await response.Content.ReadFromJsonAsync<SearchResult>();
            Assert.NotNull(result);
            
            // With mock service, results should be sum of individual words
            // This verifies that the mock service is working correctly
            Assert.True(result.EngineTotals["Google"] > 1000000);
        }

        [Fact]
        public async Task Search_WithAllEngines_ReturnsDeterministicResults()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var searchRequest = new SearchRequest
            {
                Query = "test",
                SearchEngines = new List<string> { "Google", "Bing", "Yahoo", "DuckDuckGo", "Baidu", "Yandex" }
            };

            // Act - Search twice with same query
            var response1 = await _client.PostAsJsonAsync("/api/search", searchRequest);
            var result1 = await response1.Content.ReadFromJsonAsync<SearchResult>();

            var response2 = await _client.PostAsJsonAsync("/api/search", searchRequest);
            var result2 = await response2.Content.ReadFromJsonAsync<SearchResult>();

            // Assert - Mock service should return deterministic results
            Assert.NotNull(result1);
            Assert.NotNull(result2);
            Assert.Equal(result1.EngineTotals["Google"], result2.EngineTotals["Google"]);
            Assert.Equal(result1.EngineTotals["Bing"], result2.EngineTotals["Bing"]);
            Assert.Equal(result1.EngineTotals["Yahoo"], result2.EngineTotals["Yahoo"]);
            Assert.Equal(result1.EngineTotals["DuckDuckGo"], result2.EngineTotals["DuckDuckGo"]);
            Assert.Equal(result1.EngineTotals["Baidu"], result2.EngineTotals["Baidu"]);
            Assert.Equal(result1.EngineTotals["Yandex"], result2.EngineTotals["Yandex"]);
        }

        [Fact]
        public async Task Search_WithEmptyQuery_ReturnsBadRequest()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var searchRequest = new SearchRequest
            {
                Query = "",
                SearchEngines = new List<string> { "Google" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Search_WithWhitespaceQuery_ReturnsBadRequest()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var searchRequest = new SearchRequest
            {
                Query = "   ",
                SearchEngines = new List<string> { "Google" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Search_WithNoEngines_ReturnsBadRequest()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var searchRequest = new SearchRequest
            {
                Query = "test query",
                SearchEngines = new List<string>()
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Search_WithInvalidEngine_ReturnsBadRequest()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var searchRequest = new SearchRequest
            {
                Query = "test query",
                SearchEngines = new List<string> { "InvalidEngine" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Search_WithoutAuth_ReturnsUnauthorized()
        {
            // Arrange - Don't set authorization header
            var searchRequest = new SearchRequest
            {
                Query = "test query",
                SearchEngines = new List<string> { "Google" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Search_WithLongQuery_ReturnsResults()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var longQuery = new string('a', 500); // Max length allowed
            var searchRequest = new SearchRequest
            {
                Query = longQuery,
                SearchEngines = new List<string> { "Google" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task Search_WithQueryTooLong_ReturnsBadRequest()
        {
            // Arrange
            var token = await GetAuthTokenAsync();
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var tooLongQuery = new string('a', 501); // Exceeds max length
            var searchRequest = new SearchRequest
            {
                Query = tooLongQuery,
                SearchEngines = new List<string> { "Google" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/search", searchRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}


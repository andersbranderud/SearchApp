using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using SearchApi.Models;
using Xunit;

namespace SearchApi.IntegrationTests
{
    public class AuthIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public AuthIntegrationTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Register_WithValidData_ReturnsSuccess()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Username = $"testuser_{Guid.NewGuid():N}",
                Email = $"test_{Guid.NewGuid():N}@example.com",
                Password = "ValidPassword123!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
            Assert.NotNull(authResponse);
            Assert.NotNull(authResponse.Token);
            Assert.Equal(registerRequest.Username, authResponse.Username);
        }

        [Fact]
        public async Task Register_WithShortUsername_ReturnsBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Username = "ab",
                Email = "test@example.com",
                Password = "ValidPassword123!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Register_WithInvalidEmail_ReturnsBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Username = "testuser",
                Email = "invalid-email",
                Password = "ValidPassword123!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        // Note: This test is commented out because the RegisterRequest model
        // doesn't have a ConfirmPassword field. Password confirmation should be
        // handled on the frontend before submission.
        /*
        [Fact]
        public async Task Register_WithMismatchedPasswords_ReturnsBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "ValidPassword123!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
        */

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsSuccess()
        {
            // Arrange - First register a user
            var username = $"loginuser_{Guid.NewGuid():N}";
            var email = $"login_{Guid.NewGuid():N}@example.com";
            var password = "ValidPassword123!";

            var registerRequest = new RegisterRequest
            {
                Username = username,
                Email = email,
                Password = password
            };

            await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Act - Now try to login
            var loginRequest = new LoginRequest
            {
                EmailOrUsername = username,
                Password = password
            };

            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
            Assert.NotNull(authResponse);
            Assert.NotNull(authResponse.Token);
            Assert.Equal(username, authResponse.Username);
        }

        [Fact]
        public async Task Login_WithEmail_ReturnsSuccess()
        {
            // Arrange - Register a user
            var username = $"emailuser_{Guid.NewGuid():N}";
            var email = $"email_{Guid.NewGuid():N}@example.com";
            var password = "ValidPassword123!";

            var registerRequest = new RegisterRequest
            {
                Username = username,
                Email = email,
                Password = password
            };

            await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

            // Act - Login with email instead of username
            var loginRequest = new LoginRequest
            {
                EmailOrUsername = email,
                Password = password
            };

            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                EmailOrUsername = "nonexistent@example.com",
                Password = "WrongPassword123!"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Register_WithDuplicateUsername_ReturnsBadRequest()
        {
            // Arrange - Register first user
            var username = $"duplicate_{Guid.NewGuid():N}";
            var registerRequest1 = new RegisterRequest
            {
                Username = username,
                Email = $"first_{Guid.NewGuid():N}@example.com",
                Password = "ValidPassword123!"
            };

            await _client.PostAsJsonAsync("/api/auth/register", registerRequest1);

            // Act - Try to register with same username
            var registerRequest2 = new RegisterRequest
            {
                Username = username,
                Email = $"second_{Guid.NewGuid():N}@example.com",
                Password = "ValidPassword123!"
            };

            var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest2);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}


using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using SearchApi.Data;
using SearchApi.Models;
using SearchApi.Services;
using Xunit;

namespace SearchApi.Tests.Services
{
    public class AuthServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private IConfiguration GetConfiguration()
        {
            var inMemorySettings = new Dictionary<string, string>
            {
                {"JwtSettings:SecretKey", "TestSecretKeyThatIsAtLeast32CharactersLong!"},
                {"JwtSettings:Issuer", "TestIssuer"},
                {"JwtSettings:Audience", "TestAudience"}
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();
        }

        [Fact]
        public async Task RegisterAsync_WithValidData_CreatesUser()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var config = GetConfiguration();
            var service = new AuthService(context, config);

            var request = new RegisterRequest
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "password123"
            };

            // Act
            var result = await service.RegisterAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("testuser", result.Username);
            Assert.Equal("test@example.com", result.Email);
            Assert.NotEmpty(result.Token);
        }

        [Fact]
        public async Task RegisterAsync_WithDuplicateUsername_ReturnsNull()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var config = GetConfiguration();
            var service = new AuthService(context, config);

            var request1 = new RegisterRequest
            {
                Username = "testuser",
                Email = "test1@example.com",
                Password = "password123"
            };

            var request2 = new RegisterRequest
            {
                Username = "testuser",
                Email = "test2@example.com",
                Password = "password456"
            };

            // Act
            await service.RegisterAsync(request1);
            var result = await service.RegisterAsync(request2);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task LoginAsync_WithValidCredentials_ReturnsToken()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var config = GetConfiguration();
            var service = new AuthService(context, config);

            var registerRequest = new RegisterRequest
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "password123"
            };

            await service.RegisterAsync(registerRequest);

            var loginRequest = new LoginRequest
            {
                EmailOrUsername = "testuser",
                Password = "password123"
            };

            // Act
            var result = await service.LoginAsync(loginRequest);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("testuser", result.Username);
            Assert.NotEmpty(result.Token);
        }

        [Fact]
        public async Task LoginAsync_WithInvalidPassword_ReturnsNull()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var config = GetConfiguration();
            var service = new AuthService(context, config);

            var registerRequest = new RegisterRequest
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "password123"
            };

            await service.RegisterAsync(registerRequest);

            var loginRequest = new LoginRequest
            {
                EmailOrUsername = "testuser",
                Password = "wrongpassword"
            };

            // Act
            var result = await service.LoginAsync(loginRequest);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task LoginAsync_WithNonExistentUser_ReturnsNull()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var config = GetConfiguration();
            var service = new AuthService(context, config);

            var loginRequest = new LoginRequest
            {
                EmailOrUsername = "nonexistent",
                Password = "password123"
            };

            // Act
            var result = await service.LoginAsync(loginRequest);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void GenerateJwtToken_ReturnsValidToken()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var config = GetConfiguration();
            var service = new AuthService(context, config);

            var user = new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = "hash"
            };

            // Act
            var token = service.GenerateJwtToken(user);

            // Assert
            Assert.NotEmpty(token);
            Assert.Contains(".", token); // JWT tokens have dots
        }
    }
}

using SearchApi.Validators;
using Xunit;

namespace SearchApi.Tests.Validators
{
    /// <summary>
    /// Legacy tests - kept for backward compatibility verification
    /// These tests ensure the deprecated IInputValidator interface still works
    /// </summary>
    public class InputValidatorTests
    {
        private readonly UserValidator _validator;

        public InputValidatorTests()
        {
            _validator = new UserValidator();
        }

        [Fact]
        public void ValidateSearchQuery_WithValidQuery_ReturnsSuccess()
        {
            // Arrange
            var query = "Hello world";

            // Act
            var result = _validator.ValidateSearchQuery(query);

            // Assert
            Assert.True(result.IsValid);
        }

        [Fact]
        public void ValidateSearchQuery_WithEmptyQuery_ReturnsFailure()
        {
            // Arrange
            var query = "";

            // Act
            var result = _validator.ValidateSearchQuery(query);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("cannot be empty", result.ErrorMessage);
        }

        [Theory]
        [InlineData("SELECT * FROM users")]
        [InlineData("DROP TABLE users")]
        [InlineData("' OR '1'='1")]
        public void ValidateSearchQuery_WithSqlInjection_ReturnsFailure(string query)
        {
            // Act
            var result = _validator.ValidateSearchQuery(query);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Invalid characters", result.ErrorMessage);
        }

        [Theory]
        [InlineData("<script>alert('xss')</script>")]
        [InlineData("javascript:alert(1)")]
        [InlineData("<iframe src='evil.com'>")]
        public void ValidateSearchQuery_WithXssAttempt_ReturnsFailure(string query)
        {
            // Act
            var result = _validator.ValidateSearchQuery(query);

            // Assert
            Assert.False(result.IsValid);
        }

        [Fact]
        public void ValidateSearchEngines_WithValidEngines_ReturnsSuccess()
        {
            // Arrange
            var engines = new List<string> { "Google", "Bing", "Yahoo", "Baidu" };

            // Act
            var result = _validator.ValidateSearchEngines(engines);

            // Assert
            Assert.True(result.IsValid);
        }

        [Fact]
        public void ValidateSearchEngines_WithInvalidEngine_ReturnsFailure()
        {
            // Arrange
            var engines = new List<string> { "Google", "InvalidEngine" };

            // Act
            var result = _validator.ValidateSearchEngines(engines);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains("Invalid search engine", result.ErrorMessage);
        }

        [Fact]
        public void ValidateUsername_WithValidUsername_ReturnsSuccess()
        {
            // Arrange
            var username = "testuser123";

            // Act
            var result = _validator.ValidateUsername(username);

            // Assert
            Assert.True(result.IsValid);
        }

        [Theory]
        [InlineData("ab")]
        [InlineData("user<script>")]
        [InlineData("user@name")]
        public void ValidateUsername_WithInvalidUsername_ReturnsFailure(string username)
        {
            // Act
            var result = _validator.ValidateUsername(username);

            // Assert
            Assert.False(result.IsValid);
        }

        [Fact]
        public void ValidateEmail_WithValidEmail_ReturnsSuccess()
        {
            // Arrange
            var email = "test@example.com";

            // Act
            var result = _validator.ValidateEmail(email);

            // Assert
            Assert.True(result.IsValid);
        }

        [Theory]
        [InlineData("notanemail")]
        [InlineData("test@")]
        [InlineData("@example.com")]
        [InlineData("test..user@example.com")]  // Consecutive dots
        [InlineData(".test@example.com")]  // Starts with dot
        [InlineData("test.@example.com")]  // Ends with dot before @
        [InlineData("test@.example.com")]  // Domain starts with dot
        [InlineData("test@example.com.")]  // Domain ends with dot
        [InlineData("test@-example.com")]  // Domain starts with dash
        public void ValidateEmail_WithInvalidEmail_ReturnsFailure(string email)
        {
            // Act
            var result = _validator.ValidateEmail(email);

            // Assert
            Assert.False(result.IsValid);
        }

        [Fact]
        public void ValidatePassword_WithValidPassword_ReturnsSuccess()
        {
            // Arrange
            var password = "password123";

            // Act
            var result = _validator.ValidatePassword(password);

            // Assert
            Assert.True(result.IsValid);
        }

        [Theory]
        [InlineData("short")]
        [InlineData("nodigits")]
        [InlineData("123456")]
        public void ValidatePassword_WithInvalidPassword_ReturnsFailure(string password)
        {
            // Act
            var result = _validator.ValidatePassword(password);

            // Assert
            Assert.False(result.IsValid);
        }
    }
}

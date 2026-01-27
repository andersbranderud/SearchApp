using SearchApi.Validators;
using Xunit;

namespace SearchApi.Tests.Validators
{
    public class AuthValidatorTests
    {
        private readonly AuthValidator _validator;

        public AuthValidatorTests()
        {
            _validator = new AuthValidator();
        }

        #region Username Tests

        [Fact]
        public void ValidateUsername_WithValidUsername_ReturnsSuccess()
        {
            var result = _validator.ValidateUsername("testuser123");
            Assert.True(result.IsValid);
        }

        [Fact]
        public void ValidateUsername_WithEmptyUsername_ReturnsFailure()
        {
            var result = _validator.ValidateUsername("");
            Assert.False(result.IsValid);
            Assert.Contains("cannot be empty", result.ErrorMessage);
        }

        [Fact]
        public void ValidateUsername_TooShort_ReturnsFailure()
        {
            var result = _validator.ValidateUsername("ab");
            Assert.False(result.IsValid);
            Assert.Contains("between 3 and 100", result.ErrorMessage);
        }

        [Fact]
        public void ValidateUsername_WithSpecialCharacters_ReturnsFailure()
        {
            var result = _validator.ValidateUsername("user@name");
            Assert.False(result.IsValid);
            Assert.Contains("letters, numbers, and underscores", result.ErrorMessage);
        }

        [Fact]
        public void ValidateUsername_WithXssPattern_ReturnsFailure()
        {
            var result = _validator.ValidateUsername("<script>alert('xss')</script>");
            Assert.False(result.IsValid);
        }

        #endregion

        #region Email Tests

        [Theory]
        [InlineData("user@example.com")]
        [InlineData("test.user@domain.co.uk")]
        [InlineData("user+tag@example.com")]
        public void ValidateEmail_WithValidEmail_ReturnsSuccess(string email)
        {
            var result = _validator.ValidateEmail(email);
            Assert.True(result.IsValid);
        }

        [Fact]
        public void ValidateEmail_WithEmptyEmail_ReturnsFailure()
        {
            var result = _validator.ValidateEmail("");
            Assert.False(result.IsValid);
            Assert.Contains("cannot be empty", result.ErrorMessage);
        }

        [Theory]
        [InlineData("notanemail")]
        [InlineData("@example.com")]
        [InlineData("user@")]
        [InlineData("user @example.com")]
        public void ValidateEmail_WithInvalidFormat_ReturnsFailure(string email)
        {
            var result = _validator.ValidateEmail(email);
            Assert.False(result.IsValid);
        }

        [Fact]
        public void ValidateEmail_WithConsecutiveDots_ReturnsFailure()
        {
            var result = _validator.ValidateEmail("user..name@example.com");
            Assert.False(result.IsValid);
            Assert.Contains("consecutive dots", result.ErrorMessage);
        }

        [Fact]
        public void ValidateEmail_StartingWithDot_ReturnsFailure()
        {
            var result = _validator.ValidateEmail(".user@example.com");
            Assert.False(result.IsValid);
            Assert.Contains("cannot start or end with a dot", result.ErrorMessage);
        }

        [Fact]
        public void ValidateEmail_EndingWithDot_ReturnsFailure()
        {
            var result = _validator.ValidateEmail("user.@example.com");
            Assert.False(result.IsValid);
            Assert.Contains("cannot start or end with a dot", result.ErrorMessage);
        }

        [Fact]
        public void ValidateEmail_DomainStartingWithDot_ReturnsFailure()
        {
            var result = _validator.ValidateEmail("user@.example.com");
            Assert.False(result.IsValid);
            Assert.Contains("Invalid email domain", result.ErrorMessage);
        }

        [Fact]
        public void ValidateEmail_DomainEndingWithDot_ReturnsFailure()
        {
            var result = _validator.ValidateEmail("user@example.com.");
            Assert.False(result.IsValid);
            Assert.Contains("Invalid email format", result.ErrorMessage);
        }

        [Fact]
        public void ValidateEmail_MultipleAtSymbols_ReturnsFailure()
        {
            var result = _validator.ValidateEmail("user@name@example.com");
            Assert.False(result.IsValid);
        }

        #endregion

        #region Password Tests

        [Theory]
        [InlineData("Test123")]
        [InlineData("Pass123456")]
        [InlineData("MyP4ssw0rd")]
        public void ValidatePassword_WithValidPassword_ReturnsSuccess(string password)
        {
            var result = _validator.ValidatePassword(password);
            Assert.True(result.IsValid);
        }

        [Fact]
        public void ValidatePassword_WithEmptyPassword_ReturnsFailure()
        {
            var result = _validator.ValidatePassword("");
            Assert.False(result.IsValid);
            Assert.Contains("cannot be empty", result.ErrorMessage);
        }

        [Fact]
        public void ValidatePassword_TooShort_ReturnsFailure()
        {
            var result = _validator.ValidatePassword("P4ss");
            Assert.False(result.IsValid);
            Assert.Contains("at least 6 characters", result.ErrorMessage);
        }

        [Fact]
        public void ValidatePassword_WithoutLetters_ReturnsFailure()
        {
            var result = _validator.ValidatePassword("123456");
            Assert.False(result.IsValid);
            Assert.Contains("at least one letter and one number", result.ErrorMessage);
        }

        [Fact]
        public void ValidatePassword_WithoutNumbers_ReturnsFailure()
        {
            var result = _validator.ValidatePassword("Password");
            Assert.False(result.IsValid);
            Assert.Contains("at least one letter and one number", result.ErrorMessage);
        }

        #endregion
    }
}

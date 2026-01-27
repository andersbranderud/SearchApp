using SearchApi.Validators;
using Xunit;

namespace SearchApi.Tests.Validators
{
    public class SearchValidatorTests
    {
        private readonly SearchValidator _validator;

        public SearchValidatorTests()
        {
            _validator = new SearchValidator();
        }

        #region Search Query Tests

        [Fact]
        public void ValidateSearchQuery_WithValidQuery_ReturnsSuccess()
        {
            var result = _validator.ValidateSearchQuery("Hello world");
            Assert.True(result.IsValid);
        }

        [Fact]
        public void ValidateSearchQuery_WithEmptyQuery_ReturnsFailure()
        {
            var result = _validator.ValidateSearchQuery("");
            Assert.False(result.IsValid);
            Assert.Contains("cannot be empty", result.ErrorMessage);
        }

        [Theory]
        [InlineData("SELECT * FROM users")]
        [InlineData("DROP TABLE users")]
        [InlineData("' OR '1'='1")]
        public void ValidateSearchQuery_WithSqlInjection_ReturnsFailure(string query)
        {
            var result = _validator.ValidateSearchQuery(query);
            Assert.False(result.IsValid);
            Assert.Contains("Invalid characters", result.ErrorMessage);
        }

        [Theory]
        [InlineData("<script>alert('xss')</script>")]
        [InlineData("javascript:alert('xss')")]
        [InlineData("<img onerror='alert(1)'>")]
        public void ValidateSearchQuery_WithXssPattern_ReturnsFailure(string query)
        {
            var result = _validator.ValidateSearchQuery(query);
            Assert.False(result.IsValid);
        }

        [Fact]
        public void ValidateSearchQuery_TooLong_ReturnsFailure()
        {
            var longQuery = new string('a', 501);
            var result = _validator.ValidateSearchQuery(longQuery);
            Assert.False(result.IsValid);
            Assert.Contains("too long", result.ErrorMessage);
        }

        [Fact]
        public void ValidateSearchQuery_WithPunctuation_ReturnsSuccess()
        {
            var result = _validator.ValidateSearchQuery("How to learn C#? It's great!");
            Assert.True(result.IsValid);
        }

        #endregion

        #region Search Engines Tests

        [Fact]
        public void ValidateSearchEngines_WithValidEngines_ReturnsSuccess()
        {
            var engines = new List<string> { "google", "bing", "yahoo" };
            var result = _validator.ValidateSearchEngines(engines);
            Assert.True(result.IsValid);
        }

        [Fact]
        public void ValidateSearchEngines_WithEmptyList_ReturnsFailure()
        {
            var engines = new List<string>();
            var result = _validator.ValidateSearchEngines(engines);
            Assert.False(result.IsValid);
            Assert.Contains("At least one", result.ErrorMessage);
        }

        [Fact]
        public void ValidateSearchEngines_WithNullList_ReturnsFailure()
        {
            var result = _validator.ValidateSearchEngines(null);
            Assert.False(result.IsValid);
        }

        [Fact]
        public void ValidateSearchEngines_WithInvalidEngine_ReturnsFailure()
        {
            var engines = new List<string> { "google", "invalidengine" };
            var result = _validator.ValidateSearchEngines(engines);
            Assert.False(result.IsValid);
            Assert.Contains("Invalid search engine", result.ErrorMessage);
        }

        [Fact]
        public void ValidateSearchEngines_TooManyEngines_ReturnsFailure()
        {
            var engines = new List<string> 
            { 
                "google", "bing", "yahoo", "duckduckgo", 
                "baidu", "yandex", "extra1" // 7 engines, but only 6 allowed
            };
            var result = _validator.ValidateSearchEngines(engines);
            Assert.False(result.IsValid);
            Assert.Contains("Too many", result.ErrorMessage);
        }

        [Fact]
        public void ValidateSearchEngines_WithAllAllowedEngines_ReturnsSuccess()
        {
            var engines = new List<string> 
            { 
                "google", "bing", "yahoo", "duckduckgo", "baidu", "yandex" 
            };
            var result = _validator.ValidateSearchEngines(engines);
            Assert.True(result.IsValid);
        }

        [Fact]
        public void ValidateSearchEngines_CaseInsensitive_ReturnsSuccess()
        {
            var engines = new List<string> { "Google", "BING", "YaHoO" };
            var result = _validator.ValidateSearchEngines(engines);
            Assert.True(result.IsValid);
        }

        #endregion
    }
}

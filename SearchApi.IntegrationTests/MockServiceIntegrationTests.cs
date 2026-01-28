using System.Collections.Generic;
using System.Threading.Tasks;
using SearchApi.Services;
using Xunit;

namespace SearchApi.IntegrationTests
{
    /// <summary>
    /// Tests specifically for the MockExternalSearchService to ensure it works correctly
    /// </summary>
    public class MockServiceIntegrationTests
    {
        private readonly MockExternalSearchService _mockService;

        public MockServiceIntegrationTests()
        {
            _mockService = new MockExternalSearchService();
        }

        [Fact]
        public async Task GetSearchResultCountAsync_ReturnsDeterministicResults()
        {
            // Arrange
            var query = "test";
            var engine = "Google";

            // Act
            var result1 = await _mockService.GetSearchResultCountAsync(query, engine);
            var result2 = await _mockService.GetSearchResultCountAsync(query, engine);

            // Assert
            Assert.Equal(result1, result2); // Should be deterministic
            Assert.True(result1 > 0);
        }

        [Fact]
        public async Task GetSearchResultCountAsync_DifferentQueriesReturnDifferentResults()
        {
            // Arrange
            var engine = "Google";

            // Act
            var result1 = await _mockService.GetSearchResultCountAsync("hello", engine);
            var result2 = await _mockService.GetSearchResultCountAsync("world", engine);

            // Assert
            Assert.NotEqual(result1, result2); // Different queries should give different results
        }

        [Fact]
        public async Task GetSearchResultCountAsync_DifferentEnginesReturnDifferentResults()
        {
            // Arrange
            var query = "test";

            // Act
            var googleResult = await _mockService.GetSearchResultCountAsync(query, "Google");
            var bingResult = await _mockService.GetSearchResultCountAsync(query, "Bing");
            var duckduckgoResult = await _mockService.GetSearchResultCountAsync(query, "DuckDuckGo");

            // Assert
            Assert.NotEqual(googleResult, bingResult);
            Assert.NotEqual(googleResult, duckduckgoResult);
            Assert.NotEqual(bingResult, duckduckgoResult);
            
            // Google should have highest base multiplier
            Assert.True(googleResult > bingResult);
            Assert.True(googleResult > duckduckgoResult);
        }

        [Fact]
        public async Task GetSearchResultCountAsync_UnsupportedEngine_ReturnsZero()
        {
            // Arrange
            var query = "test";
            var engine = "UnsupportedEngine";

            // Act
            var result = await _mockService.GetSearchResultCountAsync(query, engine);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public async Task SearchMultipleWordsAsync_SumsIndividualWordCounts()
        {
            // Arrange
            var query = "hello world";
            var engines = new List<string> { "Google" };

            // Act
            var result = await _mockService.SearchMultipleWordsAsync(query, engines);
            
            // Get individual word counts
            var helloCount = await _mockService.GetSearchResultCountAsync("hello", "Google");
            var worldCount = await _mockService.GetSearchResultCountAsync("world", "Google");
            var expectedTotal = helloCount + worldCount;

            // Assert
            Assert.Equal(expectedTotal, result["Google"]);
        }

        [Fact]
        public async Task SearchMultipleWordsAsync_WithMultipleEngines_ReturnsAllResults()
        {
            // Arrange
            var query = "test";
            var engines = new List<string> { "Google", "Bing", "Yahoo" };

            // Act
            var result = await _mockService.SearchMultipleWordsAsync(query, engines);

            // Assert
            Assert.Equal(3, result.Count);
            Assert.Contains("Google", result.Keys);
            Assert.Contains("Bing", result.Keys);
            Assert.Contains("Yahoo", result.Keys);
            Assert.True(result["Google"] > 0);
            Assert.True(result["Bing"] > 0);
            Assert.True(result["Yahoo"] > 0);
        }

        [Fact]
        public async Task SearchMultipleWordsAsync_WithThreeWords_SumsCorrectly()
        {
            // Arrange
            var query = "one two three";
            var engines = new List<string> { "Google" };

            // Act
            var result = await _mockService.SearchMultipleWordsAsync(query, engines);
            
            // Calculate expected sum
            var oneCount = await _mockService.GetSearchResultCountAsync("one", "Google");
            var twoCount = await _mockService.GetSearchResultCountAsync("two", "Google");
            var threeCount = await _mockService.GetSearchResultCountAsync("three", "Google");
            var expectedTotal = oneCount + twoCount + threeCount;

            // Assert
            Assert.Equal(expectedTotal, result["Google"]);
        }

        [Fact]
        public async Task SearchMultipleWordsAsync_IsDeterministic()
        {
            // Arrange
            var query = "deterministic test";
            var engines = new List<string> { "Google", "Bing" };

            // Act
            var result1 = await _mockService.SearchMultipleWordsAsync(query, engines);
            var result2 = await _mockService.SearchMultipleWordsAsync(query, engines);

            // Assert
            Assert.Equal(result1["Google"], result2["Google"]);
            Assert.Equal(result1["Bing"], result2["Bing"]);
        }

        [Theory]
        [InlineData("Google")]
        [InlineData("Bing")]
        [InlineData("Yahoo")]
        [InlineData("DuckDuckGo")]
        [InlineData("Baidu")]
        [InlineData("Yandex")]
        public async Task GetSearchResultCountAsync_AllSupportedEngines_ReturnResults(string engine)
        {
            // Arrange
            var query = "test";

            // Act
            var result = await _mockService.GetSearchResultCountAsync(query, engine);

            // Assert
            Assert.True(result > 0);
        }

        [Fact]
        public async Task SearchMultipleWordsAsync_WithEmptyQuery_HandlesGracefully()
        {
            // Arrange
            var query = "";
            var engines = new List<string> { "Google" };

            // Act
            var result = await _mockService.SearchMultipleWordsAsync(query, engines);

            // Assert
            Assert.Equal(0, result["Google"]);
        }

        [Fact]
        public async Task SearchMultipleWordsAsync_WithWhitespaceOnly_HandlesGracefully()
        {
            // Arrange
            var query = "   ";
            var engines = new List<string> { "Google" };

            // Act
            var result = await _mockService.SearchMultipleWordsAsync(query, engines);

            // Assert
            Assert.Equal(0, result["Google"]);
        }
    }
}

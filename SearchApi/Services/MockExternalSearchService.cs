namespace SearchApi.Services
{
    /// <summary>
    /// Mock implementation of IExternalSearchService for testing purposes.
    /// Returns deterministic results without making actual API calls.
    /// </summary>
    public class MockExternalSearchService : IExternalSearchService
    {
        private readonly Dictionary<string, long> _baseMultipliers = new()
        {
            { "google", 1000000 },
            { "bing", 750000 },
            { "yahoo", 500000 },
            { "duckduckgo", 250000 },
            { "baidu", 800000 },
            { "yandex", 600000 }
        };

        public Task<long> GetSearchResultCountAsync(string query, string searchEngine)
        {
            // Return deterministic results based on query and engine
            var engineKey = searchEngine.ToLower();
            
            if (!_baseMultipliers.TryGetValue(engineKey, out var baseCount))
            {
                return Task.FromResult(0L);
            }

            // Calculate a deterministic result based on query
            var queryHash = Math.Abs(query.GetHashCode());
            var variation = queryHash % 100000;
            var result = baseCount + variation;

            return Task.FromResult(result);
        }

        public async Task<Dictionary<string, long>> SearchMultipleWordsAsync(string query, List<string> searchEngines)
        {
            // Split query into individual words
            var words = query.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            
            var engineTotals = new Dictionary<string, long>();

            // For each search engine, sum up results for all words
            foreach (var engine in searchEngines)
            {
                long totalCount = 0;
                
                foreach (var word in words)
                {
                    var count = await GetSearchResultCountAsync(word, engine);
                    totalCount += count;
                }

                engineTotals[engine] = totalCount;
            }

            // Simulate network delay
            await Task.Delay(100);

            return engineTotals;
        }
    }
}

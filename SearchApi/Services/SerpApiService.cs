using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SearchApi.Services
{
    public class SerpApiService : IExternalSearchService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly string _apiKey;
        private readonly SearchResultExtractor _resultExtractor;

        // Configuration for each search engine
        private static readonly Dictionary<string, SearchEngineConfig> EngineConfigs = new()
        {
            { "google", new SearchEngineConfig("google", "q", 100000) },
            { "bing", new SearchEngineConfig("bing", "q", 50000) },
            { "yahoo", new SearchEngineConfig("yahoo", "p", 50000) },
            { "duckduckgo", new SearchEngineConfig("duckduckgo", "q", 25000) },
            { "baidu", new SearchEngineConfig("baidu", "q", 30000) },
            { "yandex", new SearchEngineConfig("yandex", "text", 40000) }
        };

        public SerpApiService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _apiKey = _configuration["SerpApi:ApiKey"] ?? string.Empty;
            _resultExtractor = new SearchResultExtractor();
        }

        public async Task<long> GetSearchResultCountAsync(string query, string searchEngine)
        {
            try
            {
                var url = BuildSearchUrl(query, searchEngine);
                var json = await FetchSearchResultsAsync(url, searchEngine);
                
                if (json == null)
                {
                    return 0;
                }

                return ExtractResultCount(json, searchEngine);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching results from {searchEngine}: {ex.Message}");
                return 0;
            }
        }

        private string BuildSearchUrl(string query, string searchEngine)
        {
            var encodedQuery = Uri.EscapeDataString(query);
            var engineKey = searchEngine.ToLower();

            if (!EngineConfigs.TryGetValue(engineKey, out var config))
            {
                throw new ArgumentException($"Unsupported search engine: {searchEngine}");
            }

            return $"https://serpapi.com/search.json?engine={config.EngineName}&{config.QueryParameter}={encodedQuery}&api_key={_apiKey}";
        }

        private async Task<JObject?> FetchSearchResultsAsync(string url, string searchEngine)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Error from {searchEngine}: Status {response.StatusCode}, Response: {errorContent}");
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            return JObject.Parse(content);
        }

        private long ExtractResultCount(JObject json, string searchEngine)
        {
            var engineKey = searchEngine.ToLower();
            
            if (!EngineConfigs.TryGetValue(engineKey, out var config))
            {
                return 0;
            }

            // Use helper class to extract result count with fallback strategies
            return _resultExtractor.ExtractResultCount(json, config.EstimateMultiplier);
        }

        public async Task<Dictionary<string, long>> SearchMultipleWordsAsync(string query, List<string> searchEngines)
        {
            // Split query into individual words
            var words = query.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            
            var engineTotals = new Dictionary<string, long>();

            // Parallelize all API calls for better performance
            var tasks = new List<Task<(string engine, long count)>>();

            foreach (var engine in searchEngines)
            {
                tasks.Add(Task.Run(async () =>
                {
                    long totalCount = 0;

                    // Search all words in parallel for this engine
                    var wordTasks = words.Select(word => GetSearchResultCountAsync(word, engine)).ToArray();
                    var wordCounts = await Task.WhenAll(wordTasks);
                    totalCount = wordCounts.Sum();

                    return (engine, totalCount);
                }));
            }

            // Wait for all engines to complete
            var results = await Task.WhenAll(tasks);

            // Build the result dictionary
            foreach (var (engine, count) in results)
            {
                engineTotals[engine] = count;
            }

            return engineTotals;
        }

        // Configuration class for search engines
        private class SearchEngineConfig
        {
            public string EngineName { get; }
            public string QueryParameter { get; }
            public int EstimateMultiplier { get; }

            public SearchEngineConfig(string engineName, string queryParameter, int estimateMultiplier)
            {
                EngineName = engineName;
                QueryParameter = queryParameter;
                EstimateMultiplier = estimateMultiplier;
            }
        }
    }
}

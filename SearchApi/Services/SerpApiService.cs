using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SearchApi.Services
{
    public class SerpApiService : IExternalSearchService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly string _apiKey;

        public SerpApiService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _apiKey = _configuration["SerpApi:ApiKey"] ?? string.Empty;
        }

        public async Task<long> GetSearchResultCountAsync(string query, string searchEngine)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var encodedQuery = Uri.EscapeDataString(query);
                
                string url = searchEngine.ToLower() switch
                {
                    "google" => $"https://serpapi.com/search.json?engine=google&q={encodedQuery}&api_key={_apiKey}",
                    "bing" => $"https://serpapi.com/search.json?engine=bing&q={encodedQuery}&api_key={_apiKey}",
                    "yahoo" => $"https://serpapi.com/search.json?engine=yahoo&p={encodedQuery}&api_key={_apiKey}",
                    "duckduckgo" => $"https://serpapi.com/search.json?engine=duckduckgo&q={encodedQuery}&api_key={_apiKey}",
                    "baidu" => $"https://serpapi.com/search.json?engine=baidu&q={encodedQuery}&api_key={_apiKey}",
                    "yandex" => $"https://serpapi.com/search.json?engine=yandex&text={encodedQuery}&api_key={_apiKey}",
                    _ => throw new ArgumentException($"Unsupported search engine: {searchEngine}")
                };

                var response = await httpClient.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error from {searchEngine}: Status {response.StatusCode}, Response: {errorContent}");
                    return 0;
                }

                var content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);

                // Extract result count based on search engine
                long resultCount = searchEngine.ToLower() switch
                {
                    "google" => ExtractGoogleResultCount(json),
                    "bing" => ExtractBingResultCount(json),
                    "yahoo" => ExtractYahooResultCount(json),
                    "duckduckgo" => ExtractDuckDuckGoResultCount(json),
                    "baidu" => ExtractBaiduResultCount(json),
                    "yandex" => ExtractYandexResultCount(json),
                    _ => 0
                };

                return resultCount;
            }
            catch (Exception ex)
            {
                // Log error in production
                Console.WriteLine($"Error fetching results from {searchEngine}: {ex.Message}");
                return 0;
            }
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

        private long ExtractGoogleResultCount(JObject json)
        {
            try
            {
                // Try to get from search_information
                var searchInfo = json["search_information"];
                if (searchInfo != null && searchInfo["total_results"] != null)
                {
                    var totalResultsStr = searchInfo["total_results"]?.ToString() ?? "0";
                    if (long.TryParse(totalResultsStr, out long result))
                    {
                        return result;
                    }
                }

                // Fallback: count organic results
                var organicResults = json["organic_results"];
                if (organicResults != null && organicResults is JArray arr)
                {
                    // If we have organic results but no total, estimate (very rough)
                    return arr.Count * 100000; // Rough estimate
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long ExtractBingResultCount(JObject json)
        {
            try
            {
                // Check for total results in Bing response
                var searchInfo = json["search_information"];
                if (searchInfo != null && searchInfo["total_results"] != null)
                {
                    var totalResultsStr = searchInfo["total_results"]?.ToString() ?? "0";
                    if (long.TryParse(totalResultsStr, out long result))
                    {
                        return result;
                    }
                }

                // Fallback: count organic results
                var organicResults = json["organic_results"];
                if (organicResults != null && organicResults is JArray arr)
                {
                    return arr.Count * 50000; // Rough estimate
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long ExtractYelpResultCount(JObject json)
        {
            try
            {
                // Try to get total results from search_information
                var searchInfo = json["search_information"];
                if (searchInfo != null && searchInfo["total_results"] != null)
                {
                    var totalResultsStr = searchInfo["total_results"]?.ToString() ?? "0";
                    if (long.TryParse(totalResultsStr, out long result))
                    {
                        return result;
                    }
                }

                // Fallback: count organic results and estimate
                var organicResults = json["organic_results"];
                if (organicResults != null && organicResults is JArray arr && arr.Count > 0)
                {
                    // Yelp returns local results, use actual count if available
                    return arr.Count * 10; // Rough estimate
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long ExtractDuckDuckGoResultCount(JObject json)
        {
            try
            {
                // DuckDuckGo doesn't provide total counts, so we estimate
                var organicResults = json["organic_results"];
                if (organicResults != null && organicResults is JArray arr)
                {
                    return arr.Count * 25000; // Rough estimate
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long ExtractYahooResultCount(JObject json)
        {
            try
            {
                // Yahoo provides total results
                var searchInfo = json["search_information"];
                if (searchInfo != null && searchInfo["total_results"] != null)
                {
                    var totalResultsStr = searchInfo["total_results"]?.ToString() ?? "0";
                    if (long.TryParse(totalResultsStr, out long result))
                    {
                        return result;
                    }
                }

                // Fallback: count organic results
                var organicResults = json["organic_results"];
                if (organicResults != null && organicResults is JArray arr)
                {
                    return arr.Count * 50000;
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long ExtractTwitterResultCount(JObject json)
        {
            try
            {
                // Twitter returns tweets, count them
                var tweets = json["results"];
                if (tweets != null && tweets is JArray arr)
                {
                    // Twitter search returns recent tweets, estimate total
                    return arr.Count * 1000; // Conservative estimate
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long ExtractBaiduResultCount(JObject json)
        {
            try
            {
                // Baidu structure
                var searchInfo = json["search_information"];
                if (searchInfo != null && searchInfo["total_results"] != null)
                {
                    var totalResultsStr = searchInfo["total_results"]?.ToString() ?? "0";
                    if (long.TryParse(totalResultsStr, out long result))
                    {
                        return result;
                    }
                }

                var organicResults = json["organic_results"];
                if (organicResults != null && organicResults is JArray arr)
                {
                    return arr.Count * 30000;
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long ExtractYandexResultCount(JObject json)
        {
            try
            {
                // Yandex structure
                var searchInfo = json["search_information"];
                if (searchInfo != null && searchInfo["total_results"] != null)
                {
                    var totalResultsStr = searchInfo["total_results"]?.ToString() ?? "0";
                    if (long.TryParse(totalResultsStr, out long result))
                    {
                        return result;
                    }
                }

                var organicResults = json["organic_results"];
                if (organicResults != null && organicResults is JArray arr)
                {
                    return arr.Count * 40000;
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long ExtractNaverResultCount(JObject json)
        {
            try
            {
                // Naver (Korean search engine)
                var searchInfo = json["search_information"];
                if (searchInfo != null && searchInfo["total_results"] != null)
                {
                    var totalResultsStr = searchInfo["total_results"]?.ToString() ?? "0";
                    if (long.TryParse(totalResultsStr, out long result))
                    {
                        return result;
                    }
                }

                var organicResults = json["organic_results"];
                if (organicResults != null && organicResults is JArray arr)
                {
                    return arr.Count * 20000;
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private long ExtractYahooFinanceResultCount(JObject json)
        {
            try
            {
                // Yahoo Finance returns stock/financial data
                var organicResults = json["organic_results"];
                if (organicResults != null && organicResults is JArray arr)
                {
                    // Financial results are more specific
                    return arr.Count * 50;
                }

                return 0;
            }
            catch
            {
                return 0;
            }
        }
    }
}

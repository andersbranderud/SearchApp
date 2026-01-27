using Newtonsoft.Json.Linq;

namespace SearchApi.Services
{
    /// <summary>
    /// Helper class for extracting and parsing search result counts from SerpAPI responses
    /// </summary>
    public class SearchResultExtractor
    {
        /// <summary>
        /// Tries to extract result count from search_information section of the JSON response
        /// </summary>
        /// <param name="json">The JSON response from SerpAPI</param>
        /// <returns>Result count if found, 0 otherwise</returns>
        public long TryExtractFromSearchInformation(JObject? json)
        {
            if (json == null)
            {
                return 0;
            }

            try
            {
                var searchInfo = json["search_information"];
                if (searchInfo?["total_results"] != null)
                {
                    var totalResultsStr = searchInfo["total_results"]?.ToString() ?? "0";
                    
                    // Handle both string and numeric formats
                    if (long.TryParse(totalResultsStr.Replace(",", ""), out long result))
                    {
                        return result;
                    }
                }
            }
            catch
            {
                // Ignore parsing errors and return 0
            }

            return 0;
        }

        /// <summary>
        /// Estimates result count based on organic results array length and a multiplier
        /// </summary>
        /// <param name="json">The JSON response from SerpAPI</param>
        /// <param name="multiplier">Multiplier to estimate total results from sample size</param>
        /// <returns>Estimated result count</returns>
        public long EstimateFromOrganicResults(JObject? json, int multiplier)
        {
            if (json == null || multiplier <= 0)
            {
                return 0;
            }

            try
            {
                var organicResults = json["organic_results"];
                if (organicResults is JArray arr && arr.Count > 0)
                {
                    return arr.Count * multiplier;
                }
            }
            catch
            {
                // Ignore parsing errors
            }

            return 0;
        }

        /// <summary>
        /// Tries to extract result count from answer_box section (for specific queries)
        /// </summary>
        /// <param name="json">The JSON response from SerpAPI</param>
        /// <returns>Result count if found, 0 otherwise</returns>
        public long TryExtractFromAnswerBox(JObject? json)
        {
            if (json == null)
            {
                return 0;
            }

            try
            {
                var answerBox = json["answer_box"];
                if (answerBox?["result"] != null)
                {
                    var resultStr = answerBox["result"]?.ToString() ?? "0";
                    
                    // Remove common formatting (commas, spaces)
                    var cleaned = resultStr.Replace(",", "").Replace(" ", "").Trim();
                    
                    if (long.TryParse(cleaned, out long result))
                    {
                        return result;
                    }
                }
            }
            catch
            {
                // Ignore parsing errors
            }

            return 0;
        }

        /// <summary>
        /// Attempts multiple extraction strategies in priority order
        /// </summary>
        /// <param name="json">The JSON response from SerpAPI</param>
        /// <param name="estimateMultiplier">Multiplier for organic results estimation</param>
        /// <returns>The first successfully extracted count, or 0 if all fail</returns>
        public long ExtractResultCount(JObject? json, int estimateMultiplier)
        {
            if (json == null)
            {
                return 0;
            }

            // Strategy 1: Try search_information (most reliable)
            var count = TryExtractFromSearchInformation(json);
            if (count > 0)
            {
                return count;
            }

            // Strategy 2: Try answer_box (for specific queries)
            count = TryExtractFromAnswerBox(json);
            if (count > 0)
            {
                return count;
            }

            // Strategy 3: Estimate from organic_results (fallback)
            return EstimateFromOrganicResults(json, estimateMultiplier);
        }
    }
}

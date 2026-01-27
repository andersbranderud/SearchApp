using System.Text.RegularExpressions;

namespace SearchApi.Validators
{
    public class SearchValidator : ISearchValidator
    {
        private static readonly string[] AllowedSearchEngines = { 
            "google", "bing", "yahoo", "duckduckgo", "baidu", "yandex" 
        };
        
        // SQL Injection patterns to detect and block
        private static readonly string[] SqlInjectionPatterns = 
        {
            @"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE|CAST)\b)",
            @"(--|;|\/\*|\*\/|xp_|sp_)",
            @"('(\s|%20)*(or|OR)(\s|%20)*')",
            @"(\bor\b.*=.*)",
        };

        public ValidationResult ValidateSearchQuery(string query)
        {
            // Check if empty or null
            if (string.IsNullOrWhiteSpace(query))
            {
                return ValidationResult.Failure("Search query cannot be empty.");
            }

            // Length validation
            if (query.Length > 500)
            {
                return ValidationResult.Failure("Search query is too long. Maximum 500 characters allowed.");
            }

            // Check for SQL injection patterns
            foreach (var pattern in SqlInjectionPatterns)
            {
                if (Regex.IsMatch(query, pattern, RegexOptions.IgnoreCase))
                {
                    return ValidationResult.Failure("Invalid characters detected in search query.");
                }
            }

            // Check for script tags and potential XSS
            if (SecurityHelper.ContainsXssPatterns(query))
            {
                return ValidationResult.Failure("Invalid characters detected in search query.");
            }

            // Only allow alphanumeric characters, spaces, and common punctuation
            if (!Regex.IsMatch(query, @"^[a-zA-Z0-9\s\.,!?'\-#]+$"))
            {
                return ValidationResult.Failure("Search query contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed.");
            }

            return ValidationResult.Success();
        }

        public ValidationResult ValidateSearchEngines(List<string> searchEngines)
        {
            if (searchEngines == null || searchEngines.Count == 0)
            {
                return ValidationResult.Failure("At least one search engine must be selected.");
            }

            if (searchEngines.Count > AllowedSearchEngines.Length)
            {
                return ValidationResult.Failure($"Too many search engines selected. Maximum {AllowedSearchEngines.Length} allowed.");
            }

            // Validate each search engine
            foreach (var engine in searchEngines)
            {
                if (string.IsNullOrWhiteSpace(engine))
                {
                    return ValidationResult.Failure("Search engine name cannot be empty.");
                }

                if (!AllowedSearchEngines.Contains(engine.ToLower()))
                {
                    return ValidationResult.Failure($"Invalid search engine: {engine}. Allowed engines are: {string.Join(", ", AllowedSearchEngines)}");
                }
            }

            return ValidationResult.Success();
        }
    }
}

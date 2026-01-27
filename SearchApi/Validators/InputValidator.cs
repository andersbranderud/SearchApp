using System.Text.RegularExpressions;
using System.Web;

namespace SearchApi.Validators
{
    public class InputValidator : IInputValidator
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
            if (ContainsXssPatterns(query))
            {
                return ValidationResult.Failure("Invalid characters detected in search query.");
            }

            // Only allow alphanumeric characters, spaces, and common punctuation
            if (!Regex.IsMatch(query, @"^[a-zA-Z0-9\s\.,!?'\-]+$"))
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

            if (searchEngines.Count > 10)
            {
                return ValidationResult.Failure("Too many search engines selected. Maximum 10 allowed.");
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

        public ValidationResult ValidateUsername(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                return ValidationResult.Failure("Username cannot be empty.");
            }

            if (username.Length < 3 || username.Length > 100)
            {
                return ValidationResult.Failure("Username must be between 3 and 100 characters.");
            }

            // Only allow alphanumeric and underscores
            if (!Regex.IsMatch(username, @"^[a-zA-Z0-9_]+$"))
            {
                return ValidationResult.Failure("Username can only contain letters, numbers, and underscores.");
            }

            // Check for XSS patterns
            if (ContainsXssPatterns(username))
            {
                return ValidationResult.Failure("Username contains invalid characters.");
            }

            return ValidationResult.Success();
        }

        public ValidationResult ValidateEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return ValidationResult.Failure("Email cannot be empty.");
            }

            if (email.Length > 200)
            {
                return ValidationResult.Failure("Email is too long. Maximum 200 characters allowed.");
            }

            // Improved email validation with stricter rules
            var emailRegex = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            if (!Regex.IsMatch(email, emailRegex))
            {
                return ValidationResult.Failure("Invalid email format. Please use format: user@example.com");
            }

            // Check for consecutive dots
            if (email.Contains(".."))
            {
                return ValidationResult.Failure("Email address contains invalid consecutive dots.");
            }

            // Check if starts or ends with dot (before @)
            var parts = email.Split('@');
            if (parts.Length != 2)
            {
                return ValidationResult.Failure("Invalid email format.");
            }

            if (parts[0].StartsWith(".") || parts[0].EndsWith("."))
            {
                return ValidationResult.Failure("Email username cannot start or end with a dot.");
            }

            // Check domain part
            if (parts[1].StartsWith(".") || parts[1].EndsWith(".") || parts[1].StartsWith("-") || parts[1].EndsWith("-"))
            {
                return ValidationResult.Failure("Invalid email domain format.");
            }

            // Check for XSS patterns
            if (ContainsXssPatterns(email))
            {
                return ValidationResult.Failure("Email contains invalid characters.");
            }

            return ValidationResult.Success();
        }

        public ValidationResult ValidatePassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                return ValidationResult.Failure("Password cannot be empty.");
            }

            if (password.Length < 6)
            {
                return ValidationResult.Failure("Password must be at least 6 characters long.");
            }

            if (password.Length > 100)
            {
                return ValidationResult.Failure("Password is too long. Maximum 100 characters allowed.");
            }

            // Password should contain at least one letter and one number
            if (!Regex.IsMatch(password, @"[a-zA-Z]") || !Regex.IsMatch(password, @"\d"))
            {
                return ValidationResult.Failure("Password must contain at least one letter and one number.");
            }

            return ValidationResult.Success();
        }

        private bool ContainsXssPatterns(string input)
        {
            var xssPatterns = new[]
            {
                @"<script",
                @"javascript:",
                @"onerror",
                @"onload",
                @"onclick",
                @"<iframe",
                @"<embed",
                @"<object",
                @"eval\s*\(",
                @"expression\s*\(",
            };

            foreach (var pattern in xssPatterns)
            {
                if (Regex.IsMatch(input, pattern, RegexOptions.IgnoreCase))
                {
                    return true;
                }
            }

            return false;
        }
    }
}

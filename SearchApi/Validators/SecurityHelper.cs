using System.Text.RegularExpressions;

namespace SearchApi.Validators
{
    public static class SecurityHelper
    {
        private static readonly string[] XssPatterns = 
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

        public static bool ContainsXssPatterns(string input)
        {
            foreach (var pattern in XssPatterns)
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

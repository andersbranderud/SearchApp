using System.Text.RegularExpressions;

namespace SearchApi.Validators
{
    /// <summary>
    /// Interface for user-related validation (authentication inputs)
    /// </summary>
    public interface IUserValidator
    {
        ValidationResult ValidateUsername(string username);
        ValidationResult ValidateEmail(string email);
        ValidationResult ValidatePassword(string password);
    }
    
    /// <summary>
    /// Legacy interface for backward compatibility - DO NOT USE in new code
    /// </summary>
    [Obsolete("Use IUserValidator for user validation and ISearchValidator for search validation instead")]
    public interface IInputValidator
    {
        ValidationResult ValidateSearchQuery(string query);
        ValidationResult ValidateSearchEngines(List<string> searchEngines);
        ValidationResult ValidateUsername(string username);
        ValidationResult ValidateEmail(string email);
        ValidationResult ValidatePassword(string password);
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;

        public static ValidationResult Success() => new ValidationResult { IsValid = true };
        public static ValidationResult Failure(string message) => new ValidationResult { IsValid = false, ErrorMessage = message };
    }
}

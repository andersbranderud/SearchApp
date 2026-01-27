using System.Text.RegularExpressions;

namespace SearchApi.Validators
{
    public class AuthValidator : IAuthValidator
    {
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
            if (SecurityHelper.ContainsXssPatterns(username))
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
            if (SecurityHelper.ContainsXssPatterns(email))
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
    }
}

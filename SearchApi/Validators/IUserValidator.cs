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
}

namespace SearchApi.Validators
{
    public interface IAuthValidator
    {
        ValidationResult ValidateUsername(string username);
        ValidationResult ValidateEmail(string email);
        ValidationResult ValidatePassword(string password);
    }
}

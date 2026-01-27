using SearchApi.Models;

namespace SearchApi.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> RegisterAsync(RegisterRequest request);
        Task<AuthResponse?> LoginAsync(LoginRequest request);
        Task<User?> GetUserByIdAsync(int userId);
        string GenerateJwtToken(User user);
    }
}

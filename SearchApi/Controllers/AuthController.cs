using Microsoft.AspNetCore.Mvc;
using SearchApi.Models;
using SearchApi.Services;
using SearchApi.Validators;

namespace SearchApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IAuthValidator _validator;

        public AuthController(IAuthService authService, IAuthValidator validator)
        {
            _authService = authService;
            _validator = validator;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            // Validate username
            var usernameValidation = _validator.ValidateUsername(request.Username);
            if (!usernameValidation.IsValid)
            {
                return BadRequest(new { message = usernameValidation.ErrorMessage });
            }

            // Validate email
            var emailValidation = _validator.ValidateEmail(request.Email);
            if (!emailValidation.IsValid)
            {
                return BadRequest(new { message = emailValidation.ErrorMessage });
            }

            // Validate password
            var passwordValidation = _validator.ValidatePassword(request.Password);
            if (!passwordValidation.IsValid)
            {
                return BadRequest(new { message = passwordValidation.ErrorMessage });
            }

            var result = await _authService.RegisterAsync(request);

            if (result == null)
            {
                return BadRequest(new { message = "Username or email already exists." });
            }

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.EmailOrUsername))
            {
                return BadRequest(new { message = "Email or username is required." });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Password is required." });
            }

            var result = await _authService.LoginAsync(request);

            if (result == null)
            {
                return Unauthorized(new { message = "Invalid credentials." });
            }

            return Ok(result);
        }
    }
}

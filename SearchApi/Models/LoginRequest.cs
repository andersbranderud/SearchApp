using System.ComponentModel.DataAnnotations;

namespace SearchApi.Models
{
    public class LoginRequest
    {
        [Required]
        [StringLength(200)]
        public string EmailOrUsername { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}

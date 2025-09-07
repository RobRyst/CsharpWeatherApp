using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public sealed class LoginRequest
    {
        [Required] public string UsernameOrEmail { get; init; } = string.Empty;
        [Required] public string Password { get; init; } = string.Empty;
    }
}
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public sealed class CreateUserRequest
    {
        [Required, MinLength(3), MaxLength(64)]
        public string Username { get; init; } = string.Empty;

        [Required, EmailAddress, MaxLength(256)]
        public string Email { get; init; } = string.Empty;

        [Required, MinLength(6), MaxLength(128)]
        public string Password { get; init; } = string.Empty;

        [MaxLength(32)]
        public string Role { get; init; } = "User";
    }
}
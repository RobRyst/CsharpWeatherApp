using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public sealed class UpdateUserDto
    {
        [MinLength(3), MaxLength(64)]
        public string? Username { get; init; }

        [EmailAddress, MaxLength(256)]
        public string? Email { get; init; }

        [MinLength(6), MaxLength(128)]
        public string? Password { get; init; }
        [MaxLength(32)] public string? Role { get; init; }
    }
}

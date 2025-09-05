using System.ComponentModel.DataAnnotations;

namespace backend.Domains.Entities
{
    public class User
    {
        public int Id { get; set; }

        [MaxLength(64)]
        public required string Username { get; set; }

        [MaxLength(256)]
        public required string Email { get; set; }

        [MaxLength(256)]
        public required string PasswordHash { get; set; }

        [MaxLength(32)]
        public string Role { get; set; } = "User";

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}

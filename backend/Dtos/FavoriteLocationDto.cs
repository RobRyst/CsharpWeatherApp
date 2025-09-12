using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public sealed class FavoriteDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string CountryCode { get; init; } = string.Empty;
        public string? State { get; init; }
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public DateTimeOffset CreatedAt { get; init; }
    }

    public sealed class CreateFavoriteRequest
    {
        [Required] public string Name { get; init; } = string.Empty;
        [Required] public string CountryCode { get; init; } = string.Empty;
        public string? State { get; init; }
        [Required] public double Latitude { get; init; }
        [Required] public double Longitude { get; init; }
    }
}

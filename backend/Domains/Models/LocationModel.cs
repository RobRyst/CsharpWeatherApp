namespace backend.Domains.Models
{
    public sealed class LocationModel
    {
        public int Id { get; init; }
        public string Name { get; init; } = null!;
        public string CountryCode { get; init; } = null!;
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string? Timezone { get; init; }
        public string? OpenWeatherCityId { get; init; }
    }
}

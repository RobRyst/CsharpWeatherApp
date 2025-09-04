namespace backend.Dtos
{
    public sealed class WeatherDto
    {
        // Utility Variables
        public int Id { get; init; }
        public int LocationId { get; init; }
        public string Description { get; init; } = null!;
        public string Icon { get; init; } = null!;

        //Temperature Variables
        public int Temperature { get; init; }
        public int FeelsLikeTemperature { get; init; }
        public int MaxTemperature { get; init; }
        public int MinTemperature { get; init; }
        public double Humidity { get; init; }
        public double WindSpeed { get; init; }

        // Time Variables
        public DateTimeOffset ObservedAt { get; init; }
        public DateTimeOffset? Sunrise { get; init; }
        public DateTimeOffset? Sunset { get; init; }

        //Location variables
        public string LocationName { get; init; } = null!;
        public string CountryCode { get; init; } = null!;
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string? Timezone { get; init; }
        public string? OpenWeatherCityId { get; init; }
    }
}
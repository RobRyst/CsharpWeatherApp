namespace backend.Domains.Models
{
    public sealed class WeatherModel
    {
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

        // Location Variables
        public LocationModel Location { get; init; } = null!;

        //Utility Variables
        public int Id { get; init; }
        public string Description { get; init; } = null!;
        public string Icon { get; init; } = null!;
    }
}

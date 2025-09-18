namespace backend.Dtos
{
    public sealed class HourlyForecastDto
    {
        public DateTimeOffset Time { get; init; }
        public double Temperature { get; init; }
        public double FeelsLike { get; init; }
        public double Humidity { get; init; }
        public double WindSpeed { get; init; }
        public double? PrecipitationProbability { get; init; }
        public string Description { get; init; } = string.Empty;
        public string Icon { get; init; } = string.Empty;
        public int TimezoneOffsetSeconds { get; init; }
    }
}

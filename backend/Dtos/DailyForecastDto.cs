namespace backend.Dtos
{
    public sealed class DailyForecastDto
    {
        public DateTimeOffset Date { get; init; }
        public double MinTemperature { get; init; }
        public double MaxTemperature { get; init; }
        public double Humidity { get; init; }
        public double WindSpeed { get; init; }
        public double? PrecipitationProbability { get; init; }
        public DateTimeOffset? Sunrise { get; init; }
        public DateTimeOffset? Sunset { get; init; }
        public string Description { get; init; } = string.Empty;
        public string Icon { get; init; } = string.Empty;
        public int TimezoneOffsetSeconds { get; init; }
    }
}

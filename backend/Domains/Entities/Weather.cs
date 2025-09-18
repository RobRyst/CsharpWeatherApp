namespace backend.Domains.Entities
{
    public class Weather
    {
        public int LocationId { get; set; }
        public Location Location { get; set; } = null!;
        public int Temperature { get; set; }
        public int FeelsLikeTemperature { get; set; }
        public int MaxTemperature { get; set; }
        public int MinTemperature { get; set; }
        public double Humidity { get; set; }
        public double WindSpeed { get; set; }
        public DateTimeOffset ObservedAt { get; set; }
        public DateTimeOffset? Sunrise { get; set; }
        public DateTimeOffset? Sunset { get; set; }
        public int Id { get; set; }
        public required string Description { get; set; }
        public string Icon { get; set; } = null!;


    }
}
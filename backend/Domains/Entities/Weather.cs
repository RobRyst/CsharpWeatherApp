namespace backend.Domains.Entities
{
    public class Weather
    {
        public int Id { get; set; }

        //Location variables
        public int LocationId { get; set; }
        public Location Location { get; set; } = null!;

        //Temperature Variables
        public int Temperature { get; set; }
        public int FeelsLikeTemperature { get; set; }
        public int MaxTemperature { get; set; }
        public int MinTemperature { get; set; }

        // Time Variables
        public DateTimeOffset ObservedAt { get; set; }
        public DateTimeOffset? Sunrise { get; set; }
        public DateTimeOffset? Sunset { get; set; }

        //Utility Variables
        public string Description { get; set; }
        public string Icon { get; set; } = null!;


    }
}
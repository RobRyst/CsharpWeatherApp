namespace backend.Domains.Entities
{
    public class Location
    {
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string CountryCode { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Timezone { get; set; }
    public string? OpenWeatherCityId { get; set; }
    public ICollection<Weather> Observations { get; } = new List<Weather>();
    }
}
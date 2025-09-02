using backend.Domains.Interfaces;

namespace backend.Services
{
    public class WeatherService(
        HttpClient httpClient,
        ILogger<WeatherService> logger) : IWeatherService
    {
        private readonly HttpClient _httpClient = httpClient;
        private readonly ILogger _logger = logger;
    }
}
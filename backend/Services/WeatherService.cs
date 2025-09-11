using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Domains.Interfaces;
using backend.Domains.Models;
using backend.Dtos;
using Microsoft.Extensions.Configuration;

namespace backend.Services
{
    public class WeatherService : IWeatherService
    {
        private readonly HttpClient _http;
        private readonly ILogger<WeatherService> _logger;
        private readonly string _apiKey;

        public WeatherService(HttpClient httpClient, ILogger<WeatherService> logger, IConfiguration config)
        {
            _http = httpClient;
            _logger = logger;
            _apiKey = config["OpenWeather:ApiKey"]
                   ?? config["OPENWEATHER_API_KEY"]
                   ?? throw new Exception("OpenWeather API key not configured");

            if (_http.BaseAddress is null)
                _http.BaseAddress = new Uri("https://api.openweathermap.org/");
        }

        public Task<IEnumerable<WeatherModel>> GetAllWeatherAsync()
            => Task.FromResult(Enumerable.Empty<WeatherModel>());

        public async Task<IEnumerable<HourlyForecastItemDto>> GetHourlyForecastAsync(
            double lat, double lon, int hours = 24, string units = "metric", string lang = "en")
        {
            var url = $"data/2.5/forecast?lat={lat}&lon={lon}&units={units}&lang={lang}&appid={_apiKey}";
            using var resp = await _http.GetAsync(url);
            var body = await resp.Content.ReadAsStringAsync();
            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogWarning("OpenWeather /forecast hourly error {Status}: {Body}", (int)resp.StatusCode, body);
                resp.EnsureSuccessStatusCode();
            }

            var forecast = JsonSerializer.Deserialize<ForecastResponse>(body);
            if (forecast?.List is null || forecast.List.Count == 0)
                return Enumerable.Empty<HourlyForecastItemDto>();

            var steps = Math.Max(1, (int)Math.Ceiling(hours / 3.0));

            return forecast.List
                .OrderBy(x => x.Dt)
                .Take(steps)
                .Select(x => new HourlyForecastItemDto
                {
                    Time = FromUnix(x.Dt),
                    Temperature = x.Main?.Temp ?? 0,
                    FeelsLike = x.Main?.Feels_like ?? x.Main?.Temp ?? 0,
                    Humidity = x.Main?.Humidity ?? 0,
                    WindSpeed = x.Wind?.Speed ?? 0,
                    PrecipitationProbability = x.Pop,
                    Description = x.Weather?.FirstOrDefault()?.Description ?? string.Empty,
                    Icon = x.Weather?.FirstOrDefault()?.Icon ?? string.Empty
                })
                .ToList();
        }
        public async Task<IEnumerable<DailyForecastItemDto>> GetWeeklyForecastAsync(
            double lat, double lon, int days = 7, string units = "metric", string lang = "en")
        {
            var url = $"data/2.5/forecast?lat={lat}&lon={lon}&units={units}&lang={lang}&appid={_apiKey}";

            using var resp = await _http.GetAsync(url);
            var body = await resp.Content.ReadAsStringAsync();
            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogWarning("OpenWeather /forecast daily error {Status}: {Body}", (int)resp.StatusCode, body);
                resp.EnsureSuccessStatusCode();
            }

            var forecast = JsonSerializer.Deserialize<ForecastResponse>(body);
            if (forecast?.List is null || forecast.List.Count == 0)
                return Enumerable.Empty<DailyForecastItemDto>();

            var grouped = forecast.List.GroupBy(x => FromUnix(x.Dt).UtcDateTime.Date);

            var daily = grouped.Select(g =>
            {
                var min = g.Min(i => i.Main?.Temp_min ?? i.Main?.Temp ?? 0);
                var max = g.Max(i => i.Main?.Temp_max ?? i.Main?.Temp ?? 0);
                var humidity = g.Average(i => (double)(i.Main?.Humidity ?? 0));
                var wind = g.Average(i => (double)(i.Wind?.Speed ?? 0));
                var pop = g.Max(i => i.Pop ?? 0);

                var pick = g.OrderBy(i => Math.Abs(FromUnix(i.Dt).Hour - 12)).FirstOrDefault();
                var desc = pick?.Weather?.FirstOrDefault()?.Description ?? string.Empty;
                var icon = pick?.Weather?.FirstOrDefault()?.Icon ?? string.Empty;

                return new DailyForecastItemDto
                {
                    Date = new DateTimeOffset(g.Key, TimeSpan.Zero),
                    MinTemperature = min,
                    MaxTemperature = max,
                    Humidity = humidity,
                    WindSpeed = wind,
                    PrecipitationProbability = pop,
                    Sunrise = null,
                    Sunset = null,
                    Description = desc,
                    Icon = icon
                };
            })
            .OrderBy(d => d.Date)
            .Take(Math.Clamp(days, 1, 5))
            .ToList();

            return daily;
        }

        private static DateTimeOffset FromUnix(long seconds) =>
            DateTimeOffset.FromUnixTimeSeconds(seconds).ToUniversalTime();

        private sealed class ForecastResponse
        {
            [JsonPropertyName("list")] public List<ForecastItem>? List { get; set; }
            [JsonPropertyName("city")] public ForecastCity? City { get; set; }
        }

        private sealed class ForecastCity
        {
            [JsonPropertyName("timezone")] public int Timezone { get; set; }
        }

        private sealed class ForecastItem
        {
            [JsonPropertyName("dt")] public long Dt { get; set; }
            [JsonPropertyName("main")] public ForecastMain? Main { get; set; }
            [JsonPropertyName("weather")] public List<WeatherIcon>? Weather { get; set; }
            [JsonPropertyName("wind")] public ForecastWind? Wind { get; set; }
            [JsonPropertyName("pop")] public double? Pop { get; set; } // 0..1
        }

        private sealed class ForecastMain
        {
            [JsonPropertyName("temp")] public double Temp { get; set; }
            [JsonPropertyName("feels_like")] public double Feels_like { get; set; }
            [JsonPropertyName("temp_min")] public double Temp_min { get; set; }
            [JsonPropertyName("temp_max")] public double Temp_max { get; set; }
            [JsonPropertyName("humidity")] public double Humidity { get; set; }
        }

        private sealed class ForecastWind
        {
            [JsonPropertyName("speed")] public double Speed { get; set; }
        }

        private sealed class WeatherIcon
        {
            [JsonPropertyName("description")] public string? Description { get; set; }
            [JsonPropertyName("icon")] public string? Icon { get; set; }
        }
    }
}

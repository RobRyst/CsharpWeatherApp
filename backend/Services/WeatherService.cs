using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Domains.Interfaces;
using backend.Dtos;
using Microsoft.Extensions.Configuration;

namespace backend.Services
{
    public class WeatherService : IWeatherService
    {
        private readonly HttpClient _http;
        private readonly ILogger<WeatherService> _logger;
        private readonly string _apiKey;

        public WeatherService(IHttpClientFactory httpFactory, ILogger<WeatherService> logger, IConfiguration config)
        {
            _http = httpFactory.CreateClient("openweather");
            _logger = logger;
            _apiKey = config["OpenWeather:ApiKey"] ?? config["OPENWEATHER_API_KEY"]
                      ?? throw new Exception("OpenWeather API key not configured");
        }

        public Task<IEnumerable<backend.Domains.Models.WeatherModel>> GetAllWeatherAsync()
            => Task.FromResult(Enumerable.Empty<backend.Domains.Models.WeatherModel>());

        public async Task<IEnumerable<HourlyForecastDto>> GetHourlyForecastAsync(
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
                return Enumerable.Empty<HourlyForecastDto>();

            var timezone = forecast.City?.Timezone ?? 0;
            var steps = Math.Max(1, (int)Math.Ceiling(hours / 3.0));

            return forecast.List
                .OrderBy(x => x.Dt)
                .Take(steps)
                .Select(x => new HourlyForecastDto
                {
                    Time = FromUnixUtc(x.Dt),
                    Temperature = x.Main?.Temp ?? 0,
                    FeelsLike = x.Main?.Feels_like ?? x.Main?.Temp ?? 0,
                    Humidity = x.Main?.Humidity ?? 0,
                    WindSpeed = x.Wind?.Speed ?? 0,
                    PrecipitationProbability = x.Pop,
                    Description = x.Weather?.FirstOrDefault()?.Description ?? string.Empty,
                    Icon = x.Weather?.FirstOrDefault()?.Icon ?? string.Empty,
                    TimezoneOffsetSeconds = timezone
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

            var tz = forecast.City?.Timezone ?? 0;
            DateTimeOffset ToLocal(long unix) =>
                DateTimeOffset.FromUnixTimeSeconds(unix).ToOffset(TimeSpan.FromSeconds(tz));

            var grouped = forecast.List.GroupBy(x => ToLocal(x.Dt).Date);

            var daily = grouped.Select(g =>
            {
                var min = g.Min(item => item.Main?.Temp_min ?? item.Main?.Temp ?? 0);
                var max = g.Max(item => item.Main?.Temp_max ?? item.Main?.Temp ?? 0);
                var humidity = g.Average(item => (double)(item.Main?.Humidity ?? 0));
                var wind = g.Average(item => (double)(item.Wind?.Speed ?? 0));
                var pop = g.Max(item => item.Pop ?? 0);

                var pick = g.OrderBy(item => Math.Abs(ToLocal(item.Dt).Hour - 12)).FirstOrDefault();
                var desc = pick?.Weather?.FirstOrDefault()?.Description ?? string.Empty;
                var icon = pick?.Weather?.FirstOrDefault()?.Icon ?? string.Empty;

                var localMidnight = new DateTimeOffset(g.Key, TimeSpan.FromSeconds(tz));

                return new DailyForecastItemDto
                {
                    Date = localMidnight,
                    MinTemperature = min,
                    MaxTemperature = max,
                    Humidity = humidity,
                    WindSpeed = wind,
                    PrecipitationProbability = pop,
                    Sunrise = null,
                    Sunset = null,
                    Description = desc,
                    Icon = icon,
                    TimezoneOffsetSeconds = tz
                };
            })
            .OrderBy(date => date.Date)
            .Take(Math.Clamp(days, 1, 5))
            .ToList();

            return daily;
        }

        private static DateTimeOffset FromUnixUtc(long seconds)
            => DateTimeOffset.FromUnixTimeSeconds(seconds).ToUniversalTime();

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
            [JsonPropertyName("pop")] public double? Pop { get; set; }

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

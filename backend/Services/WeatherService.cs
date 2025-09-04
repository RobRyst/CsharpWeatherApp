// backend/Services/WeatherService.cs
using System.Net.Http.Json;
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
            var url = $"data/3.0/onecall?lat={lat}&lon={lon}&units={units}&lang={lang}&exclude=minutely,alerts,current,daily&appid={_apiKey}";
            var resp = await _http.GetFromJsonAsync<OneCallResponse>(url);

            if (resp?.Hourly is null)
                return Enumerable.Empty<HourlyForecastItemDto>();

            return resp.Hourly
                .Take(Math.Max(1, hours))
                .Select(hours => new HourlyForecastItemDto
                {
                    Time = FromUnix(hours.Dt),
                    Temperature = hours.Temp,
                    FeelsLike = hours.Feels_like,
                    Humidity = hours.Humidity,
                    WindSpeed = hours.Wind_speed,
                    PrecipitationProbability = hours.Pop,
                    Description = hours.Weather?.FirstOrDefault()?.Description ?? string.Empty,
                    Icon = hours.Weather?.FirstOrDefault()?.Icon ?? string.Empty
                })
                .ToList();
        }

        public async Task<IEnumerable<DailyForecastItemDto>> GetWeeklyForecastAsync(
            double lat, double lon, int days = 7, string units = "metric", string lang = "en")
        {
            var url = $"data/3.0/onecall?lat={lat}&lon={lon}&units={units}&lang={lang}&exclude=minutely,alerts,current,hourly&appid={_apiKey}";
            var resp = await _http.GetFromJsonAsync<OneCallResponse>(url);

            if (resp?.Daily is null)
                return Enumerable.Empty<DailyForecastItemDto>();

            return resp.Daily
                .Take(Math.Clamp(days, 1, 7))
                .Select(daily => new DailyForecastItemDto
                {
                    Date = FromUnix(daily.Dt),
                    MinTemperature = daily.Temp?.Min ?? 0,
                    MaxTemperature = daily.Temp?.Max ?? 0,
                    Humidity = daily.Humidity,
                    WindSpeed = daily.Wind_speed,
                    PrecipitationProbability = daily.Pop,
                    Sunrise = daily.Sunrise.HasValue ? FromUnix(daily.Sunrise.Value) : null,
                    Sunset = daily.Sunset.HasValue ? FromUnix(daily.Sunset.Value) : null,
                    Description = daily.Weather?.FirstOrDefault()?.Description ?? string.Empty,
                    Icon = daily.Weather?.FirstOrDefault()?.Icon ?? string.Empty
                })
                .ToList();
        }

        private static DateTimeOffset FromUnix(long seconds) =>
            DateTimeOffset.FromUnixTimeSeconds(seconds).ToUniversalTime();

        private sealed class OneCallResponse
        {
            [JsonPropertyName("hourly")] public List<Hourly>? Hourly { get; set; }
            [JsonPropertyName("daily")] public List<Daily>? Daily { get; set; }
        }

        private sealed class WeatherIcon
        {
            [JsonPropertyName("description")] public string? Description { get; set; }
            [JsonPropertyName("icon")] public string? Icon { get; set; }
        }

        private sealed class Hourly
        {
            [JsonPropertyName("dt")] public long Dt { get; set; }
            [JsonPropertyName("temp")] public double Temp { get; set; }
            [JsonPropertyName("feels_like")] public double Feels_like { get; set; }
            [JsonPropertyName("humidity")] public double Humidity { get; set; }
            [JsonPropertyName("wind_speed")] public double Wind_speed { get; set; }
            [JsonPropertyName("pop")] public double? Pop { get; set; }
            [JsonPropertyName("weather")] public List<WeatherIcon>? Weather { get; set; }
        }

        private sealed class Daily
        {
            [JsonPropertyName("dt")] public long Dt { get; set; }
            [JsonPropertyName("sunrise")] public long? Sunrise { get; set; }
            [JsonPropertyName("sunset")] public long? Sunset { get; set; }
            [JsonPropertyName("humidity")] public double Humidity { get; set; }
            [JsonPropertyName("wind_speed")] public double Wind_speed { get; set; }
            [JsonPropertyName("pop")] public double? Pop { get; set; }
            [JsonPropertyName("temp")] public DailyTemp? Temp { get; set; }
            [JsonPropertyName("weather")] public List<WeatherIcon>? Weather { get; set; }
        }

        private sealed class DailyTemp
        {
            [JsonPropertyName("min")] public double Min { get; set; }
            [JsonPropertyName("max")] public double Max { get; set; }
        }
    }
}

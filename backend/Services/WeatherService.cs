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
            var oneCallUrl = $"data/2.5/onecall?lat={lat}&lon={lon}" +
                             $"&units={units}&lang={lang}&exclude=current,minutely,daily,alerts&appid={_apiKey}";

            using (var resp = await _http.GetAsync(oneCallUrl))
            {
                var body = await resp.Content.ReadAsStringAsync();

                if (resp.IsSuccessStatusCode)
                {
                    var oc = JsonSerializer.Deserialize<OneCallResponse>(body);
                    if (oc?.Hourly is { Count: > 0 })
                    {
                        var tz = oc.Timezone_offset;
                        var take = Math.Clamp(hours, 1, Math.Min(48, oc.Hourly.Count));
                        return oc.Hourly
                            .OrderBy(h => h.Dt)
                            .Take(take)
                            .Select(h => new HourlyForecastDto
                            {
                                Time = DateTimeOffset.FromUnixTimeSeconds(h.Dt).ToUniversalTime(),
                                Temperature = h.Temp,
                                FeelsLike = h.Feels_like,
                                Humidity = h.Humidity,
                                WindSpeed = h.Wind_speed,
                                PrecipitationProbability = h.Pop,
                                Description = h.Weather?.FirstOrDefault()?.Description ?? string.Empty,
                                Icon = h.Weather?.FirstOrDefault()?.Icon ?? string.Empty,
                                TimezoneOffsetSeconds = tz
                            })
                            .ToList();
                    }
                }
                else if (resp.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    _logger.LogWarning("One Call 2.5 hourly unauthorized. Falling back to /data/2.5/forecast. Body: {Body}", body);
                }
                else
                {
                    _logger.LogWarning("OpenWeather onecall hourly error {Status}: {Body}", (int)resp.StatusCode, body);
                }
            }

            var url = $"data/2.5/forecast?lat={lat}&lon={lon}&units={units}&lang={lang}&appid={_apiKey}";
            using var resp2 = await _http.GetAsync(url);
            var body2 = await resp2.Content.ReadAsStringAsync();

            if (!resp2.IsSuccessStatusCode)
            {
                _logger.LogWarning("OpenWeather /forecast hourly fallback error {Status}: {Body}", (int)resp2.StatusCode, body2);
                resp2.EnsureSuccessStatusCode();
            }

            var forecast = JsonSerializer.Deserialize<ForecastResponse>(body2);
            if (forecast?.List is null || forecast.List.Count == 0)
                return Enumerable.Empty<HourlyForecastDto>();

            var timezone = forecast.City?.Timezone ?? 0;
            var expanded = new List<HourlyForecastDto>();

            foreach (var x in forecast.List.OrderBy(i => i.Dt))
            {
                var baseUtc = DateTimeOffset.FromUnixTimeSeconds(x.Dt).ToUniversalTime();
                for (var k = 0; k < 3; k++)
                {
                    expanded.Add(new HourlyForecastDto
                    {
                        Time = baseUtc.AddHours(k),
                        Temperature = x.Main?.Temp ?? 0,
                        FeelsLike = x.Main?.Feels_like ?? x.Main?.Temp ?? 0,
                        Humidity = x.Main?.Humidity ?? 0,
                        WindSpeed = x.Wind?.Speed ?? 0,
                        PrecipitationProbability = x.Pop,
                        Description = x.Weather?.FirstOrDefault()?.Description ?? string.Empty,
                        Icon = x.Weather?.FirstOrDefault()?.Icon ?? string.Empty,
                        TimezoneOffsetSeconds = timezone
                    });
                }
            }

            return expanded
                .OrderBy(h => h.Time)
                .Take(Math.Clamp(hours, 1, expanded.Count))
                .ToList();
        }

        public async Task<IEnumerable<DailyForecastDto>> GetWeeklyForecastAsync(
            double lat, double lon, int days = 7, string units = "metric", string lang = "en")
        {
            var oneCallUrl = $"data/2.5/onecall?lat={lat}&lon={lon}" +
                             $"&units={units}&lang={lang}&exclude=current,minutely,hourly,alerts&appid={_apiKey}";

            using (var resp = await _http.GetAsync(oneCallUrl))
            {
                var body = await resp.Content.ReadAsStringAsync();

                if (resp.IsSuccessStatusCode)
                {
                    var oc = JsonSerializer.Deserialize<OneCallResponse>(body);
                    if (oc?.Daily is { Count: > 0 })
                    {
                        var tz = oc.Timezone_offset;
                        var take = Math.Clamp(days, 1, Math.Min(7, oc.Daily.Count));
                        return oc.Daily
                            .OrderBy(d => d.Dt)
                            .Take(take)
                            .Select(d => new DailyForecastDto
                            {
                                Date = DateTimeOffset.FromUnixTimeSeconds(d.Dt).ToOffset(TimeSpan.FromSeconds(tz)),
                                MinTemperature = d.Temp?.Min ?? 0,
                                MaxTemperature = d.Temp?.Max ?? 0,
                                Humidity = d.Humidity,
                                WindSpeed = d.Wind_speed,
                                PrecipitationProbability = d.Pop,
                                Sunrise = d.Sunrise > 0
                                    ? DateTimeOffset.FromUnixTimeSeconds(d.Sunrise).ToOffset(TimeSpan.FromSeconds(tz))
                                    : (DateTimeOffset?)null,
                                Sunset = d.Sunset > 0
                                    ? DateTimeOffset.FromUnixTimeSeconds(d.Sunset).ToOffset(TimeSpan.FromSeconds(tz))
                                    : (DateTimeOffset?)null,
                                Description = d.Weather?.FirstOrDefault()?.Description ?? string.Empty,
                                Icon = d.Weather?.FirstOrDefault()?.Icon ?? string.Empty,
                                TimezoneOffsetSeconds = tz
                            })
                            .ToList();
                    }
                }
                else if (resp.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    _logger.LogWarning("One Call 2.5 daily unauthorized. Falling back to /data/2.5/forecast. Body: {Body}", body);
                }
                else
                {
                    _logger.LogWarning("OpenWeather onecall daily error {Status}: {Body}", (int)resp.StatusCode, body);
                }
            }

            var url = $"data/2.5/forecast?lat={lat}&lon={lon}&units={units}&lang={lang}&appid={_apiKey}";
            using var resp2 = await _http.GetAsync(url);
            var body2 = await resp2.Content.ReadAsStringAsync();

            if (!resp2.IsSuccessStatusCode)
            {
                _logger.LogWarning("OpenWeather /forecast daily fallback error {Status}: {Body}", (int)resp2.StatusCode, body2);
                resp2.EnsureSuccessStatusCode();
            }

            var forecast = JsonSerializer.Deserialize<ForecastResponse>(body2);
            if (forecast?.List is null || forecast.List.Count == 0)
                return Enumerable.Empty<DailyForecastDto>();

            var tzOffset = forecast.City?.Timezone ?? 0;
            DateTimeOffset ToLocal(long unix) =>
                DateTimeOffset.FromUnixTimeSeconds(unix).ToOffset(TimeSpan.FromSeconds(tzOffset));

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
                var localMidnight = new DateTimeOffset(g.Key, TimeSpan.FromSeconds(tzOffset));

                return new DailyForecastDto
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
                    TimezoneOffsetSeconds = tzOffset
                };
            })
            .OrderBy(d => d.Date)
            .Take(Math.Clamp(days, 1, 8))
            .ToList();

            return daily;
        }

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

        private sealed class OneCallResponse
        {
            [JsonPropertyName("timezone_offset")] public int Timezone_offset { get; set; }
            [JsonPropertyName("hourly")] public List<OneCallHourly>? Hourly { get; set; }
            [JsonPropertyName("daily")] public List<OneCallDaily>? Daily { get; set; }
        }
        private sealed class OneCallHourly
        {
            [JsonPropertyName("dt")] public long Dt { get; set; }
            [JsonPropertyName("temp")] public double Temp { get; set; }
            [JsonPropertyName("feels_like")] public double Feels_like { get; set; }
            [JsonPropertyName("humidity")] public double Humidity { get; set; }
            [JsonPropertyName("wind_speed")] public double Wind_speed { get; set; }
            [JsonPropertyName("pop")] public double Pop { get; set; }
            [JsonPropertyName("weather")] public List<WeatherIcon>? Weather { get; set; }
        }
        private sealed class OneCallDaily
        {
            [JsonPropertyName("dt")] public long Dt { get; set; }
            [JsonPropertyName("sunrise")] public long Sunrise { get; set; }
            [JsonPropertyName("sunset")] public long Sunset { get; set; }
            [JsonPropertyName("temp")] public OneCallDailyTemp? Temp { get; set; }
            [JsonPropertyName("humidity")] public double Humidity { get; set; }
            [JsonPropertyName("wind_speed")] public double Wind_speed { get; set; }
            [JsonPropertyName("pop")] public double? Pop { get; set; }
            [JsonPropertyName("weather")] public List<WeatherIcon>? Weather { get; set; }
        }
        private sealed class OneCallDailyTemp
        {
            [JsonPropertyName("min")] public double Min { get; set; }
            [JsonPropertyName("max")] public double Max { get; set; }
        }
    }
}

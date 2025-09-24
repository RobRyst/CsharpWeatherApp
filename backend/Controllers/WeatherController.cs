using Microsoft.AspNetCore.Mvc;
using backend.Domains.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class WeatherController : ControllerBase
    {
        private readonly ILogger<WeatherController> _logger;
        private readonly IWeatherService _weatherService;

        public WeatherController(ILogger<WeatherController> logger, IWeatherService weatherService)
        {
            _weatherService = weatherService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetWeather()
        {
            try
            {
                var weather = await _weatherService.GetAllWeatherAsync();
                return Ok(weather);
            }
            catch (HttpRequestException hex) when (hex.StatusCode.HasValue)
            {
                _logger.LogWarning(hex, "Upstream OpenWeather error (GetWeather)");
                return StatusCode((int)hex.StatusCode.Value, new { error = "openweather_error", detail = hex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error getting weather information from DB");
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [HttpGet("hourly")]
        public async Task<IActionResult> GetHourly(
            [FromQuery] double lat,
            [FromQuery] double lon,
            [FromQuery] int hours = 24,
            [FromQuery] string units = "metric",
            [FromQuery] string lang = "en")
        {
            if (lat == 0 && lon == 0)
                return BadRequest(new { error = "lat and lon are required" });

            try
            {
                var data = await _weatherService.GetHourlyForecastAsync(lat, lon, hours, units, lang);
                return Ok(data);
            }
            catch (HttpRequestException hex) when (hex.StatusCode.HasValue)
            {
                _logger.LogWarning(hex, "Upstream OpenWeather error (hourly)");
                return StatusCode((int)hex.StatusCode.Value, new { error = "openweather_error", detail = hex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error fetching hourly forecast");
                return StatusCode(500, new { error = "internal server error" });
            }
        }

        [HttpGet("weekly")]
        public async Task<IActionResult> GetWeekly(
            [FromQuery] double lat,
            [FromQuery] double lon,
            [FromQuery] int days = 7,
            [FromQuery] string units = "metric",
            [FromQuery] string lang = "en")
        {
            if (lat == 0 && lon == 0)
                return BadRequest(new { error = "lat and lon are required" });

            try
            {
                var data = await _weatherService.GetWeeklyForecastAsync(lat, lon, days, units, lang);
                return Ok(data);
            }
            catch (HttpRequestException hex) when (hex.StatusCode.HasValue)
            {
                _logger.LogWarning(hex, "Upstream OpenWeather error (weekly)");
                return StatusCode((int)hex.StatusCode.Value, new { error = "openweather_error", detail = hex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error fetching weekly forecast");
                return StatusCode(500, new { error = "internal server error" });
            }
        }
    }
}

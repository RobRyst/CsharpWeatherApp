using Microsoft.AspNetCore.Mvc;
using backend.Domains.Interfaces;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting weather information from Database");
                return StatusCode(500, new { error = "internal server error" });
            }
        }
    }
}

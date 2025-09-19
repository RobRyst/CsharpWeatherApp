using backend.Domains.Models;
using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface IWeatherService
    {
        Task<IEnumerable<WeatherModel>> GetAllWeatherAsync();

        Task<IEnumerable<HourlyForecastDto>> GetHourlyForecastAsync(
            double lat, double lon, int hours = 24, string units = "metric", string lang = "en");

        Task<IEnumerable<DailyForecastDto>> GetWeeklyForecastAsync(
            double lat, double lon, int days = 7, string units = "metric", string lang = "en");
    }
}
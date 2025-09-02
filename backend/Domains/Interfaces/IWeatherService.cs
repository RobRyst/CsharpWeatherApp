using backend.Domains.Models;

namespace backend.Domains.Interfaces
{
    public interface IWeatherService
    {
        Task<IEnumerable<WeatherModel>> GetAllWeatherAsync();
    }
}
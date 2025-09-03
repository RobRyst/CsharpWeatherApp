// backend/Services/WeatherService.cs
using backend.Domains.Interfaces;
using backend.Domains.Models;
using backend.Domains.Mapping;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class WeatherService : IWeatherService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<WeatherService> _logger;

        public WeatherService(AppDbContext db, ILogger<WeatherService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<IEnumerable<WeatherModel>> GetAllWeatherAsync()
        {
            try
            {
                var entities = await _db.Weather
                    .AsNoTracking()
                    .Include(weather => weather.Location)
                    .OrderByDescending(weather => weather.ObservedAt)
                    .ToListAsync();

                return entities.Select(entity => entity.ToModel());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load weather rows from database");
                throw;
            }
        }
    }
}

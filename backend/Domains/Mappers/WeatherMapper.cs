using backend.Domains.Entities;
using backend.Domains.Models;
using backend.Dtos;

namespace backend.Domains.Mapping
{
    public static class WeatherMapper
    {
        public static WeatherModel ToModel(this Weather weather) =>
            new WeatherModel
            {
                Id = weather.Id,
                Description = weather.Description,
                Icon = weather.Icon,
                Temperature = weather.Temperature,
                FeelsLikeTemperature = weather.FeelsLikeTemperature,
                MaxTemperature = weather.MaxTemperature,
                MinTemperature = weather.MinTemperature,
                Humidity = weather.Humidity,
                WindSpeed = weather.WindSpeed,
                ObservedAt = weather.ObservedAt,
                Sunrise = weather.Sunrise,
                Sunset = weather.Sunset,
                Location = new LocationModel
                {
                    Id = weather.Location.Id,
                    Name = weather.Location.Name,
                    CountryCode = weather.Location.CountryCode,
                    Latitude = weather.Location.Latitude,
                    Longitude = weather.Location.Longitude,
                    Timezone = weather.Location.Timezone,
                    OpenWeatherCityId = weather.Location.OpenWeatherCityId
                }
            };

        public static WeatherDto ToDto(this WeatherModel model) =>
            new WeatherDto
            {
                Id = model.Id,
                LocationId = model.Location.Id,
                Description = model.Description,
                Icon = model.Icon,
                Temperature = model.Temperature,
                FeelsLikeTemperature = model.FeelsLikeTemperature,
                MaxTemperature = model.MaxTemperature,
                MinTemperature = model.MinTemperature,
                Humidity = model.Humidity,
                WindSpeed = model.WindSpeed,
                ObservedAt = model.ObservedAt,
                Sunrise = model.Sunrise,
                Sunset = model.Sunset,
                LocationName = model.Location.Name,
                CountryCode = model.Location.CountryCode,
                Latitude = model.Location.Latitude,
                Longitude = model.Location.Longitude,
                Timezone = model.Location.Timezone,
                OpenWeatherCityId = model.Location.OpenWeatherCityId
            };
    }
}

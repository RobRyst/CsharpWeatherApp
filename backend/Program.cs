
using System;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

// ----------------- API ---------------------
var openWeatherKey = builder.Configuration["dad23e35b200f69a69c7df5efa05bf0f"];
if (string.IsNullOrWhiteSpace(openWeatherKey))
    throw new Exception("API KEY NOT WORKING");

builder.Services.AddHttpClient("openWeahter", c =>
{
    c.BaseAddress = new Uri("https://api.openweathermap.org/");
});
builder.Services.AddMemoryCache();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddLogging();
var app = builder.Build();
app.MapGet("/api/geocode", async (string query, IHttpClientFactory http, IMemoryCache cache) =>
{
    var cachekey = $"geo:{query}";
    if (!cache.TryGetValue(cachekey, out object? result))
    {
        var url = $"geo/1.0/direct?q={Uri.EscapeDataString(query)}&limit=5&appid={openWeatherKey}";
        result = await http.CreateClient("openWeather").GetStringAsync(url);
    }
});

app.MapGet("/api/weather", async (double lat, double lon, string units, string lang,
    IHttpClientFactory http, IMemoryCache cache) =>
{
    var unit = string.IsNullOrWhiteSpace(units) ? "metric" : units;
    var language = string.IsNullOrWhiteSpace(lang) ? "en" : lang;

    var cacheKey = $"wx:{lat:F4},{lon:F4}:{unit}:{language}";
    if (!cache.TryGetValue(cacheKey, out object? result))
    {
        var url = $"data/2.5/weather?lat={lat}&lon={lon}&units={unit}&lang={language}&appid={openWeatherKey}";
        using var resp = await http.CreateClient("owm").GetAsync(url);
        if (!resp.IsSuccessStatusCode)
            return Results.Problem($"OpenWeather returned {(int)resp.StatusCode}: {await resp.Content.ReadAsStringAsync()}");

        result = await resp.Content.ReadAsStringAsync();
        cache.Set(cacheKey, result!, TimeSpan.FromSeconds(60));
    }
    return Results.Content((string)result!, "application/json");
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
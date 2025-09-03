using System;
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);

// ---- Config ----
var apiKey = builder.Configuration["OpenWeather:ApiKey"]
          ?? builder.Configuration["OPENWEATHER_API_KEY"];
if (string.IsNullOrWhiteSpace(apiKey))
    throw new Exception("API KEY NOT WORKING: set OpenWeather:ApiKey or OPENWEATHER_API_KEY");

// ---- Services ----
builder.Services.AddHttpClient("openweather", c =>
{
    c.BaseAddress = new Uri("https://api.openweathermap.org/");
});
builder.Services.AddMemoryCache();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/openweather/geocode", async (string query, IHttpClientFactory http, IMemoryCache cache) =>
{
    if (string.IsNullOrWhiteSpace(query))
        return Results.BadRequest(new { error = "query is required" });

    var cacheKey = $"geo:{query}";
    if (!cache.TryGetValue(cacheKey, out string? result))
    {
        var url = $"geo/1.0/direct?q={Uri.EscapeDataString(query)}&limit=5&appid={apiKey}";
        using var resp = await http.CreateClient("openweather").GetAsync(url);

        if (!resp.IsSuccessStatusCode)
        {
            var body = await resp.Content.ReadAsStringAsync();
            return Results.Problem(
                detail: $"OpenWeather returned {(int)resp.StatusCode}: {body}",
                statusCode: (int)resp.StatusCode,
                title: "OpenWeather error");
        }

        result = await resp.Content.ReadAsStringAsync();
        cache.Set(cacheKey, result, TimeSpan.FromSeconds(60));
    }
    return Results.Content(result!, "application/json");
})
.WithName("OpenWeatherGeocode")
.WithTags("OpenWeather");

app.MapGet("/api/openweather/current", async (double lat, double lon, string? units, string? lang,
    IHttpClientFactory http, IMemoryCache cache) =>
{
    var unit = string.IsNullOrWhiteSpace(units) ? "metric" : units!;
    var language = string.IsNullOrWhiteSpace(lang) ? "en" : lang!;

    var cacheKey = $"wx:{lat:F4},{lon:F4}:{unit}:{language}";
    if (!cache.TryGetValue(cacheKey, out string? result))
    {
        var url = $"data/2.5/weather?lat={lat}&lon={lon}&units={unit}&lang={language}&appid={apiKey}";
        using var resp = await http.CreateClient("openweather").GetAsync(url);

        if (!resp.IsSuccessStatusCode)
        {
            var body = await resp.Content.ReadAsStringAsync();
            return Results.Problem(
                detail: $"OpenWeather returned {(int)resp.StatusCode}: {body}",
                statusCode: (int)resp.StatusCode,
                title: "OpenWeather error");
        }

        result = await resp.Content.ReadAsStringAsync();
        cache.Set(cacheKey, result, TimeSpan.FromSeconds(60));
    }
    return Results.Content(result!, "application/json");
})
.WithName("OpenWeatherCurrent")
.WithTags("OpenWeather");
// ---------------------------------------------------------

app.MapControllers();
app.Run();

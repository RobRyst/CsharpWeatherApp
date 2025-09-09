using System.Text;
using backend.Auth;
using backend.Domains.Interfaces;
using backend.Infrastructure.Data;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ✅ Load OpenWeather API key
var apiKey = builder.Configuration["OpenWeather:ApiKey"]
          ?? builder.Configuration["OPENWEATHER_API_KEY"];
if (string.IsNullOrWhiteSpace(apiKey))
    throw new Exception("API KEY NOT WORKING: set OpenWeather:ApiKey or OPENWEATHER_API_KEY");

// ✅ Configure JWT
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new Exception("Jwt:Key not configured");
var jwtIssuer = jwtSection["Issuer"] ?? "CSharpWeather";
var jwtAudience = jwtSection["Audience"] ?? "CSharpWeatherClient";

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.IncludeErrorDetails = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// ✅ Add HttpClient + cache
builder.Services.AddHttpClient("openweather", c =>
{
    c.BaseAddress = new Uri("https://api.openweathermap.org/");
});
builder.Services.AddMemoryCache();

// ✅ EF Core MySQL
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("Default")
             ?? throw new InvalidOperationException("Missing ConnectionStrings:Default");
    opt.UseMySql(cs, ServerVersion.AutoDetect(cs));
});

// ✅ Dependency injection
builder.Services.AddScoped<IWeatherService, WeatherService>();
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ✅ Swagger
builder.Services.AddSwaggerGen(c =>
{
    var scheme = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Paste the JWT token only (no 'Bearer ' prefix)."
    };

    c.AddSecurityDefinition("Bearer", scheme);
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ✅ CORS (allow Expo Web + LAN access)
var allowedOrigins = new[]
{
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://192.168.10.116:8081" // your LAN IP for physical device testing
};

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ✅ Development setup
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ✅ Apply CORS before auth
app.UseCors("DevCors");

app.UseAuthentication();
app.UseAuthorization();

// ✅ Minimal API endpoints
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
.RequireAuthorization()
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
.RequireAuthorization()
.WithName("OpenWeatherCurrent")
.WithTags("OpenWeather");

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { ok = true, time = DateTimeOffset.UtcNow }));

app.Run();

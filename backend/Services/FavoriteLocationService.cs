using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Dtos;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class FavoriteLocationService(AppDbContext db, ILogger<FavoriteLocationService> logger) : IFavoriteLocationService
    {
        private readonly AppDbContext _db = db;

        public async Task<IEnumerable<FavoriteDto>> GetMineAsync(int userId, CancellationToken ct)
        {
            return await _db.Favorites
                .AsNoTracking()
                .Where(favorite => favorite.UserId == userId)
                .OrderByDescending(favorite => favorite.CreatedAt)
                .Select(favorite => new FavoriteDto
                {
                    Id = favorite.Id,
                    Name = favorite.Name,
                    CountryCode = favorite.CountryCode,
                    State = favorite.State,
                    Latitude = favorite.Latitude,
                    Longitude = favorite.Longitude,
                    IsDefault = favorite.IsDefault,
                    CreatedAt = favorite.CreatedAt
                })
                .ToListAsync(ct);
        }

        public async Task<FavoriteDto> CreateAsync(int userId, CreateFavoriteRequest req, CancellationToken ct)
        {
            var lat = Math.Round(req.Latitude, 4);
            var lon = Math.Round(req.Longitude, 4);

            var exists = await _db.Favorites.AnyAsync(f =>
                f.UserId == userId && Math.Abs(f.Latitude - lat) < 1e-4 && Math.Abs(f.Longitude - lon) < 1e-4, ct);
            if (exists) throw new InvalidOperationException("Location already in favorites");

            var fav = new FavoriteLocation
            {
                UserId = userId,
                Name = req.Name,
                CountryCode = req.CountryCode,
                State = string.IsNullOrWhiteSpace(req.State) ? null : req.State,
                Latitude = lat,
                Longitude = lon
            };
            _db.Favorites.Add(fav);
            await _db.SaveChangesAsync(ct);

            return new FavoriteDto
            {
                Id = fav.Id,
                Name = fav.Name,
                CountryCode = fav.CountryCode,
                State = fav.State,
                Latitude = fav.Latitude,
                Longitude = fav.Longitude,
                CreatedAt = fav.CreatedAt
            };
        }

        public async Task<bool> DeleteAsync(int userId, int favoriteId, CancellationToken ct)
        {
            var fav = await _db.Favorites.FirstOrDefaultAsync(f => f.Id == favoriteId && f.UserId == userId, ct);
            if (fav is null) return false;
            _db.Favorites.Remove(fav);
            await _db.SaveChangesAsync(ct);
            return true;
        }
        public async Task<bool> SetDefaultAsync(int userId, int favoriteId, CancellationToken ct)
        {
            var favorite = await _db.Favorites.FirstOrDefaultAsync(favorite => favorite.Id == favoriteId && favorite.UserId == userId, ct);
            if (favorite == null) return false;

            await _db.Favorites.Where(favorite => favorite.UserId == userId && favorite.IsDefault).ExecuteUpdateAsync(
                s => s.SetProperty(favorite => favorite.IsDefault, false), ct);

            favorite.IsDefault = true;
            await _db.SaveChangesAsync(ct);
            return true;
        }
    }
}

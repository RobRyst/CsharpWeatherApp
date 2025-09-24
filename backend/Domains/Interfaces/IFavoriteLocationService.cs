using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface IFavoriteLocationService
    {
        Task<IEnumerable<FavoriteLocationDto>> GetMineAsync(int userId, CancellationToken ct);
        Task<FavoriteLocationDto> CreateAsync(int userId, CreateFavoriteRequest req, CancellationToken ct);
        Task<bool> DeleteAsync(int userId, int favoriteId, CancellationToken ct);
        Task<bool> SetDefaultAsync(int userId, int favoriteId, CancellationToken ct);
    }
}

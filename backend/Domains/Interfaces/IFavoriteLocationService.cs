using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface IFavoriteLocationService
    {
        Task<IEnumerable<FavoriteDto>> GetMineAsync(int userId, CancellationToken ct);
        Task<FavoriteDto> CreateAsync(int userId, CreateFavoriteRequest req, CancellationToken ct);
        Task<bool> DeleteAsync(int userId, int favoriteId, CancellationToken ct);
        Task<bool> SetDefaultAsync(int userId, int favoriteId, CancellationToken ct);
    }
}

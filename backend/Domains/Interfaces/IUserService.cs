using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> CreateAsync(CreateUserRequest req, CancellationToken ct);
        Task<UserDto?> GetByIdAsync(int id, CancellationToken ct);
        Task<(bool ok, UserDto? user, string? role)> ValidateCredentialsAsync(
            string usernameOrEmail, string password, CancellationToken ct);
        Task<UserDto?> UpdateAsync(int id, UpdateUserRequest req, CancellationToken ct);
        Task<bool> DeleteAsync(int id, CancellationToken ct);
        Task<PagedResult<UserDto>> GetUsersAsync(int page, int pageSize, CancellationToken ct);
    }
}

using backend.Dtos;

namespace backend.Domains.Interfaces
{
    public interface IUserService
    {
        Task<UserDto?> GetByIdAsync(int id, CancellationToken ct);
        Task<UserDto> CreateAsync(CreateUserRequest req, CancellationToken ct);
        Task<UserDto?> UpdateAsync(int id, UpdateUserRequest req, CancellationToken ct);
        Task<bool> DeleteAsync(int id, CancellationToken ct);
    }
}
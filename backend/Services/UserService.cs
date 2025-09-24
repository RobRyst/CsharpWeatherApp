using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Dtos;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UserService(AppDbContext db, ILogger<UserService> logger) : IUserService
    {
        private readonly AppDbContext _db = db;
        private readonly ILogger<UserService> _logger = logger;

        public async Task<UserDto> CreateAsync(CreateUserDto req, CancellationToken ct)
        {
            if (await _db.Users.AnyAsync(user => user.Username == req.Username, ct))
                throw new InvalidOperationException("Username already exists");
            if (await _db.Users.AnyAsync(user => user.Email == req.Email, ct))
                throw new InvalidOperationException("Email already exists");

            var user = new User
            {
                Username = req.Username,
                Email = req.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = string.IsNullOrWhiteSpace(req.Role) ? "User" : req.Role
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);
            return ToDto(user);
        }

        public async Task<UserDto?> GetByIdAsync(int id, CancellationToken ct)
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
            return user is null ? null : ToDto(user);
        }

        public async Task<(bool ok, UserDto? user, string? role)> ValidateCredentialsAsync(
            string usernameOrEmail, string password, CancellationToken ct)
        {
            var user = await _db.Users.FirstOrDefaultAsync(
                x => x.Username == usernameOrEmail || x.Email == usernameOrEmail, ct);

            if (user is null) return (false, null, null);

            var ok = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            if (!ok) return (false, null, null);

            return (true, ToDto(user), user.Role);
        }

        public async Task<UserDto?> UpdateAsync(int id, UpdateUserDto req, CancellationToken ct)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (user is null) return null;

            if (!string.IsNullOrWhiteSpace(req.Username) && req.Username != user.Username)
            {
                if (await _db.Users.AnyAsync(x => x.Username == req.Username, ct))
                    throw new InvalidOperationException("Username already exists");
                user.Username = req.Username;
            }
            if (!string.IsNullOrWhiteSpace(req.Email) && req.Email != user.Email)
            {
                if (await _db.Users.AnyAsync(x => x.Email == req.Email, ct))
                    throw new InvalidOperationException("Email already exists");
                user.Email = req.Email;
            }
            if (!string.IsNullOrWhiteSpace(req.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);
            }
            if (!string.IsNullOrWhiteSpace(req.Role))
            {
                user.Role = req.Role!;
            }
            user.UpdatedAt = DateTimeOffset.UtcNow;

            await _db.SaveChangesAsync(ct);
            return ToDto(user);
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken ct)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (user is null) return false;
            _db.Users.Remove(user);
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<PagedResultDto<UserDto>> GetUsersAsync(int page, int pageSize, CancellationToken ct)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _db.Users.AsNoTracking().OrderBy(x => x.Id);
            var total = await query.CountAsync(ct);
            var items = await query.Skip((page - 1) * pageSize)
                               .Take(pageSize)
                               .Select(user => ToDto(user))
                               .ToListAsync(ct);

            return new PagedResultDto<UserDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = total
            };
        }

        private static UserDto ToDto(User user) => new()
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}

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

        public async Task<UserDto> CreateAsync(CreateUserRequest req, CancellationToken ct)
        {
            if (await _db.Users.AnyAsync(u => u.Username == req.Username, ct))
                throw new InvalidOperationException("Username already exists");
            if (await _db.Users.AnyAsync(u => u.Email == req.Email, ct))
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
            var u = await _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
            return u is null ? null : ToDto(u);
        }

        public async Task<(bool ok, UserDto? user, string? role)> ValidateCredentialsAsync(
            string usernameOrEmail, string password, CancellationToken ct)
        {
            var u = await _db.Users.FirstOrDefaultAsync(
                x => x.Username == usernameOrEmail || x.Email == usernameOrEmail, ct);

            if (u is null) return (false, null, null);

            var ok = BCrypt.Net.BCrypt.Verify(password, u.PasswordHash);
            if (!ok) return (false, null, null);

            return (true, ToDto(u), u.Role);
        }

        public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest req, CancellationToken ct)
        {
            var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (u is null) return null;

            if (!string.IsNullOrWhiteSpace(req.Username) && req.Username != u.Username)
            {
                if (await _db.Users.AnyAsync(x => x.Username == req.Username, ct))
                    throw new InvalidOperationException("Username already exists");
                u.Username = req.Username;
            }
            if (!string.IsNullOrWhiteSpace(req.Email) && req.Email != u.Email)
            {
                if (await _db.Users.AnyAsync(x => x.Email == req.Email, ct))
                    throw new InvalidOperationException("Email already exists");
                u.Email = req.Email;
            }
            if (!string.IsNullOrWhiteSpace(req.Password))
            {
                u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);
            }
            if (!string.IsNullOrWhiteSpace(req.Role))
            {
                u.Role = req.Role!;
            }
            u.UpdatedAt = DateTimeOffset.UtcNow;

            await _db.SaveChangesAsync(ct);
            return ToDto(u);
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken ct)
        {
            var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (u is null) return false;
            _db.Users.Remove(u);
            await _db.SaveChangesAsync(ct);
            return true;
        }

        public async Task<PagedResult<UserDto>> GetUsersAsync(int page, int pageSize, CancellationToken ct)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var q = _db.Users.AsNoTracking().OrderBy(x => x.Id);
            var total = await q.CountAsync(ct);
            var items = await q.Skip((page - 1) * pageSize)
                               .Take(pageSize)
                               .Select(u => ToDto(u))
                               .ToListAsync(ct);

            return new PagedResult<UserDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = total
            };
        }

        private static UserDto ToDto(User u) => new()
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt
        };
    }
}

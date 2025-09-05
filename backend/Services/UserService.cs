using backend.Domains.Entities;
using backend.Domains.Interfaces;
using backend.Dtos;
using backend.Infrastructure.Data;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UserService(AppDbContext db, ILogger<UserService> logger) : IUserService
    {
        private readonly AppDbContext _db = db;
        private readonly ILogger<UserService> _logger = logger;

        public async Task<UserDto?> GetByIdAsync(int id, CancellationToken ct)
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
            return user is null ? null : ToDto(user);
        }

        public async Task<UserDto> CreateAsync(CreateUserRequest req, CancellationToken ct)
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

        public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest req, CancellationToken ct)
        {
            var user = await _db.Users.FirstOrDefaultAsync(user => user.Id == id, ct);
            if (user is null) return null;

            if (!string.IsNullOrWhiteSpace(req.Username) && req.Username != user.Username)
            {
                if (await _db.Users.AnyAsync(user => user.Username == req.Username, ct))
                    throw new InvalidOperationException("Username already exists");
                user.Username = req.Username;
            }
            if (!string.IsNullOrWhiteSpace(req.Email) && req.Email != user.Email)
            {
                if (await _db.Users.AnyAsync(user => user.Email == req.Email, ct))
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
            var user = await _db.Users.FirstOrDefaultAsync(user => user.Id == id, ct);
            if (user is null) return false;
            _db.Users.Remove(user);
            await _db.SaveChangesAsync(ct);
            return true;
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
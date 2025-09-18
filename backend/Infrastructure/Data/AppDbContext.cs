using backend.Domains;
using backend.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Location> Locations => Set<Location>();
        public DbSet<Weather> Weather => Set<Weather>();
        public DbSet<User> Users => Set<User>();
        public DbSet<FavoriteLocation> Favorites => Set<FavoriteLocation>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(user => user.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(user => user.Email)
                .IsUnique();

            modelBuilder.Entity<Weather>()
                .HasOne(weather => weather.Location)
                .WithMany(location => location.Observations)
                .HasForeignKey(weather => weather.LocationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FavoriteLocation>(builder =>
            {
                builder.HasKey(favorite => favorite.Id);
                builder.HasOne(favorite => favorite.User)
                    .WithMany()
                    .HasForeignKey(favorite => favorite.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                builder.HasIndex(favorite => new { favorite.UserId, favorite.Latitude, favorite.Longitude })
                    .IsUnique();
            });
        }
    }
}

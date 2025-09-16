using backend.Domains;
using backend.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Location> Locations => Set<Location>();
        public DbSet<Weather> Weather => Set<Weather>();
        public DbSet<User> Users => Set<User>();
        public DbSet<FavoriteLocation> Favorites => Set<FavoriteLocation>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Users
            modelBuilder.Entity<User>()
                .HasIndex(user => user.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(user => user.Email)
                .IsUnique();

            // Weather / Location
            modelBuilder.Entity<Weather>()
                .HasOne(weather => weather.Location)
                .WithMany(location => location.Observations)
                .HasForeignKey(weather => weather.LocationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Favorites
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

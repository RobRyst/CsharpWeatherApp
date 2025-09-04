using backend.Domains.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Location> Locations => Set<Location>();
        public DbSet<Weather> Weather => Set<Weather>();
    }
}

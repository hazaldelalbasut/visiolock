using Microsoft.EntityFrameworkCore;
using VisioLockApi.Models;

namespace VisioLockApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<PasswordRecord> PasswordRecords { get; set; }
    public DbSet<User> Users { get; set; }
}

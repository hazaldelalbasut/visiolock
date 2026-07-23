using Microsoft.EntityFrameworkCore;
using VisioLockApi.Models;

namespace VisioLockApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<SifreKaydi> SifreKayitlari { get; set; }
    public DbSet<Kullanici> Kullanicilar { get; set; }
}
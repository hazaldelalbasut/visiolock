using Microsoft.EntityFrameworkCore;
using VisioLockApi.Data;
using VisioLockApi.Models;
using BCrypt.Net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtSecretKey = builder.Configuration["Jwt:SecretKey"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey!))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapPost("/api/auth/register", async (RegisterIstek istek, AppDbContext db) =>
{
    var mevcutKullanici = await db.Kullanicilar
        .FirstOrDefaultAsync(k => k.Email == istek.Email);

    if (mevcutKullanici != null)
    {
        return Results.BadRequest(new { hata = "Bu email zaten kayıtlı" });
    }

    var yeniKullanici = new Kullanici
    {
        Email = istek.Email,
        SifreHash = BCrypt.Net.BCrypt.HashPassword(istek.Sifre),
        OlusturmaTarihi = DateTime.UtcNow
    };

    db.Kullanicilar.Add(yeniKullanici);
    await db.SaveChangesAsync();

    return Results.Created($"/api/auth/register/{yeniKullanici.Id}", new
    {
        id = yeniKullanici.Id,
        email = yeniKullanici.Email
    });
});

app.MapPost("/api/sifreler", async (SifreKaydi yeniKayit, AppDbContext db) =>
{
    yeniKayit.OlusturmaTarihi = DateTime.UtcNow;
    db.SifreKayitlari.Add(yeniKayit);
    await db.SaveChangesAsync();
    return Results.Created($"/api/sifreler/{yeniKayit.Id}", yeniKayit);
});
app.MapGet("/api/sifreler/{kullaniciId}", async (int kullaniciId, AppDbContext db) =>
{
    var kayitlar = await db.SifreKayitlari
        .Where(k => k.KullaniciId == kullaniciId)
        .Select(k => new {
            k.Id, k.HizmetAdi, k.KullaniciAdiHizmette,
            k.MatrixBoyutu, k.EntropiBit, k.OlusturmaTarihi
        })
        .ToListAsync();
    return Results.Ok(kayitlar);
});
app.MapGet("/api/sifreler/kayit/{id}", async (int id, AppDbContext db) =>
{
    var kayit = await db.SifreKayitlari.FindAsync(id);
    if (kayit == null) return Results.NotFound();

    return Results.Ok(new {
        kayit.Id, kayit.HizmetAdi, kayit.KullaniciAdiHizmette,
        kayit.MatrixBoyutu, kayit.OlusturmaTarihi
    });
});

app.MapPost("/api/sifreler/{id}/dogrula", async (int id, DogrulamaIstek istek, AppDbContext db) =>
{
    var kayit = await db.SifreKayitlari.FindAsync(id);

    if (kayit == null)
    {
        return Results.NotFound();
    }

    bool eslesiyor = kayit.DogrulamaHash == istek.HesaplananHash;
    return Results.Ok(new { basarili = eslesiyor });
});

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

record DogrulamaIstek(string HesaplananHash);
record RegisterIstek(string Email, string Sifre);
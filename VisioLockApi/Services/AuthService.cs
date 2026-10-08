using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VisioLockApi.Models;
using VisioLockApi.Repositories;

namespace VisioLockApi.Services;

public class AuthService
{
    private readonly UserRepository _repository;
    private readonly IConfiguration _config;

    public AuthService(UserRepository repository, IConfiguration config)
    {
        _repository = repository;
        _config = config;
    }

    public async Task<(bool success, string errorMessage, bool emailAlreadyRegistered, User? user)> Register(string fullName, string email, string password)
    {
        if (string.IsNullOrWhiteSpace(fullName))
        {
            return (false, "Ad Soyad alanı boş bırakılamaz.", false, null);
        }

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return (false, "Email ve şifre alanları boş bırakılamaz.", false, null);
        }

        if (!email.Contains("@") || !email.Contains("."))
        {
            return (false, "Lütfen geçerli bir email adresi giriniz.", false, null);
        }

        if (password.Length < 6)
        {
            return (false, "Şifre en az 6 karakter olmalıdır.", false, null);
        }

        var existingUser = await _repository.GetByEmail(email);
        if (existingUser != null)
        {
            return (false, "Bu email zaten kayıtlı", true, null);
        }

        var newUser = new User
        {
            FullName = fullName,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt = DateTime.UtcNow
        };

        await _repository.Add(newUser);
        return (true, string.Empty, false, newUser);
    }

    public async Task<(bool success, string errorMessage, string token, int userId)> Login(string email, string password)
    {
        var user = await _repository.GetByEmail(email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return (false, "Email veya şifre hatalı", string.Empty, 0);
        }

        var token = GenerateToken(user.Id);
        return (true, string.Empty, token, user.Id);
    }

    private string GenerateToken(int userId)
    {
        var jwtSecretKey = _config["Jwt:SecretKey"];
        var jwtIssuer = _config["Jwt:Issuer"];
        var jwtAudience = _config["Jwt:Audience"];

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(jwtSecretKey!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("userId", userId.ToString())
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = jwtIssuer,
            Audience = jwtAudience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

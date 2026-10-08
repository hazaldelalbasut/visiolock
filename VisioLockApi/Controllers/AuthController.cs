using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using VisioLockApi.Services;

namespace VisioLockApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (request == null)
            return BadRequest(new { error = "Geçersiz istek verisi." });

        if (string.IsNullOrWhiteSpace(request.FullName))
            return BadRequest(new { error = "Ad Soyad alanı boş bırakılamaz." });

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { error = "Email alanı boş bırakılamaz." });

        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Şifre alanı boş bırakılamaz." });

        if (!request.Email.Contains("@") || !request.Email.Contains("."))
            return BadRequest(new { error = "Lütfen geçerli bir email adresi giriniz." });

        if (request.Password.Length < 6)
            return BadRequest(new { error = "Şifre en az 6 karakter olmalıdır." });

        var (success, errorMessage, emailAlreadyRegistered, user) =
            await _authService.Register(request.FullName, request.Email, request.Password);

        if (!success)
        {
            if (emailAlreadyRegistered)
            {
                return Conflict(new { error = errorMessage });
            }
            return BadRequest(new { error = errorMessage });
        }

        return Created($"/api/auth/register/{user!.Id}", new
        {
            id = user.Id,
            fullName = user.FullName,
            email = user.Email
        });
    }

    [HttpPost("login")]
    [EnableRateLimiting("LoginProtection")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Email ve şifre alanları boş bırakılamaz." });
        }

        var (success, errorMessage, token, userId) =
            await _authService.Login(request.Email, request.Password);

        if (!success)
        {
            return BadRequest(new { error = errorMessage });
        }

        return Ok(new { token, userId });
    }
}

public record RegisterRequest(string FullName, string Email, string Password);
public record LoginRequest(string Email, string Password);

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VisioLockApi.Models;
using VisioLockApi.Repositories;

namespace VisioLockApi.Controllers
{
    [ApiController]
    [Route("api/passwords")]
    [Authorize]
    public class PasswordsController : ControllerBase
    {
        private readonly PasswordRepository _passwordRepository;

        public PasswordsController(PasswordRepository passwordRepository)
        {
            _passwordRepository = passwordRepository;
        }

        private int GetUserIdFromToken()
        {
            var userIdStr = User.FindFirst("userId")?.Value;
            return int.Parse(userIdStr!);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserIdFromToken();
            var records = await _passwordRepository.GetAll(userId);
            return Ok(records);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await _passwordRepository.GetById(id);
            if (record == null) return NotFound();
            return Ok(record);
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] PasswordRecord newRecord)
        {
            if (newRecord == null)
                return BadRequest(new { error = "Şifre kaydı verisi boş olamaz." });

            if (string.IsNullOrWhiteSpace(newRecord.ServiceName))
                return BadRequest(new { error = "Hizmet adı alanı boş bırakılamaz." });

            if (string.IsNullOrWhiteSpace(newRecord.VerificationHash))
                return BadRequest(new { error = "Doğrulama hash verisi eksik." });

            newRecord.UserId = GetUserIdFromToken();
            newRecord.CreatedAt = DateTime.UtcNow;

            await _passwordRepository.Add(newRecord);
            return Created($"/api/passwords/{newRecord.Id}", newRecord);
        }

        [HttpPost("{id}/verify")]
        public async Task<IActionResult> VerifyPattern(int id, [FromBody] VerifyRequest request)
        {
            var record = await _passwordRepository.GetById(id);
            if (record == null) return NotFound();

            bool success = record.VerificationHash == request.ComputedHash;
            return Ok(new { success });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var record = await _passwordRepository.GetById(id);
            if (record == null) return NotFound();

            await _passwordRepository.Delete(record);
            return NoContent();
        }
    }

    public record VerifyRequest(string ComputedHash);
}

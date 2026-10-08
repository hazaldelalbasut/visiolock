using Microsoft.EntityFrameworkCore;
using VisioLockApi.Data;
using VisioLockApi.Models;

namespace VisioLockApi.Repositories;

public class PasswordRepository
{
    private readonly AppDbContext _context;

    public PasswordRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<PasswordRecord>> GetAll(int userId)
    {
        return await _context.PasswordRecords
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<PasswordRecord?> GetById(int id)
    {
        return await _context.PasswordRecords.FindAsync(id);
    }

    public async Task Add(PasswordRecord newRecord)
    {
        _context.PasswordRecords.Add(newRecord);
        await _context.SaveChangesAsync();
    }

    public async Task Delete(PasswordRecord record)
    {
        _context.PasswordRecords.Remove(record);
        await _context.SaveChangesAsync();
    }
}

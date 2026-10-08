using Microsoft.EntityFrameworkCore;
using VisioLockApi.Data;
using VisioLockApi.Models;

namespace VisioLockApi.Repositories;

public class UserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmail(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task Add(User newUser)
    {
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();
    }
}

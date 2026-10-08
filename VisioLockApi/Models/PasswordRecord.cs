namespace VisioLockApi.Models;

public class PasswordRecord
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string ServiceUsername { get; set; } = string.Empty;
    public int MatrixSize { get; set; }
    public int EntropyBits { get; set; }
    public string VerificationHash { get; set; } = string.Empty;
    public string Hint { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

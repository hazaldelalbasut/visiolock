namespace VisioLockApi.Models;

public class Kullanici
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string SifreHash { get; set; } = string.Empty;
    public DateTime OlusturmaTarihi { get; set; }
    public List<SifreKaydi> SifreKayitlari { get; set; } = new();
}
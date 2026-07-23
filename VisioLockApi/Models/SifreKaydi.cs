namespace VisioLockApi.Models;

public class SifreKaydi
{
    public int Id { get; set; }
    public int KullaniciId { get; set; }
    public Kullanici? Kullanici { get; set; }
    public string HizmetAdi { get; set; } = string.Empty;
    public string KullaniciAdiHizmette { get; set; } = string.Empty;
    public int MatrixBoyutu { get; set; }
    public int EntropiBit { get; set; }
    public string DogrulamaHash { get; set; } = string.Empty;
    public DateTime OlusturmaTarihi { get; set; }
}
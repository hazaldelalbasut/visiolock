import { useState, useEffect } from 'react'
import './KriptoSifreCard.css'
import { cizimdenSifreUret, sha256Hesapla } from '../utils/kripto'

function KriptoSifreCard({ hizmetAdi = '', kullaniciAdi = '', cizimYolu = [], matrixSize = 4, onSifreKaydet }) {
  const [sifreGizli, setSifreGizli] = useState(true)
  const [kopyalandi, setKopyalandi] = useState(false)
  const [uretilenSifre, setUretilenSifre] = useState('')
  const [entropi, setEntropi] = useState(0)

  // Gerçek entropi hesabı: kaç farklı sırayla nokta seçilebilir, onun log2'si
  function entropiHesapla(toplamNoktaSayisi, secilenNoktaSayisi) {
    let olasiKombinasyon = 1
    for (let i = 0; i < secilenNoktaSayisi; i++) {
      olasiKombinasyon *= (toplamNoktaSayisi - i)
    }
    if (olasiKombinasyon <= 0) return 0
    return Math.round(Math.log2(olasiKombinasyon))
  }

  useEffect(() => {
    if (!hizmetAdi || cizimYolu.length === 0) {
      setUretilenSifre('')
      setEntropi(0)
      return
    }

    async function sifreUret() {
      const sifre = await cizimdenSifreUret(hizmetAdi, cizimYolu, matrixSize)
      setUretilenSifre(sifre)
    }
    sifreUret()

    const toplamNokta = matrixSize * matrixSize
    setEntropi(entropiHesapla(toplamNokta, cizimYolu.length))
  }, [hizmetAdi, cizimYolu, matrixSize])

  function handleKopyala() {
    if (!uretilenSifre) return
    navigator.clipboard.writeText(uretilenSifre)
    setKopyalandi(true)
    setTimeout(() => setKopyalandi(false), 2000)
  }

  async function handleKaydet() {
    if (!uretilenSifre) return
    const dogrulamaHash = await sha256Hesapla(uretilenSifre)

    onSifreKaydet({
      hizmetAdi: hizmetAdi,
      kullaniciAdiHizmette: kullaniciAdi,
      matrixSize: matrixSize,
      entropiBit: entropi,
      dogrulamaHash: dogrulamaHash
    })
  }

  const hizmetEksik = !hizmetAdi
  const cizimEksik = cizimYolu.length === 0

  return (
    <div className="kripto-kart">
      <div className="kripto-header">
        <div className="kripto-baslik-sol">
          <span className="kripto-kilit-ikon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ffcc" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </span>
          <h3>Üretilen Kriptografik Şifre</h3>
        </div>
        <div className={`kripto-durum-badge ${hizmetEksik ? 'eksik' : 'aktif'}`}>
          {hizmetEksik ? 'HİZMET EKSİK' : cizimEksik ? 'DESEN BEKLENİYOR' : 'ŞİFRE HAZIR'}
        </div>
      </div>

      <div className="kripto-ekran">
        <div className="scanline"></div>
        <div className="sifre-gosterim-alani">
          {hizmetEksik ? (
            <span className="kripto-placeholder">HİZMET ADI GİRİN</span>
          ) : cizimEksik ? (
            <span className="kripto-placeholder">DESEN ÇİZMEYE BAŞLAYIN</span>
          ) : (
            <span className="kripto-uretilmis-sifre">
              {sifreGizli ? '••••••••••••••••' : uretilenSifre}
            </span>
          )}
        </div>

        <div className="kripto-aksiyonlar">
          <button
            className="kripto-ekran-btn"
            onClick={() => setSifreGizli(!sifreGizli)}
            disabled={hizmetEksik || cizimEksik}
          >
            {sifreGizli ? '👁' : '🔒'}
          </button>

          <button
            className={`kripto-kopyala-btn ${uretilenSifre ? 'aktif' : ''}`}
            onClick={handleKopyala}
            disabled={hizmetEksik || cizimEksik}
          >
            {kopyalandi ? 'Kopyalandı!' : 'Kopyala'}
            <span className="kopyala-daire"></span>
          </button>
        </div>
      </div>

      <div className="kripto-detaylar">
        <div className="kripto-detay-kutu">
          <span className="detay-etiket">BİLGİ ENTROPİSİ</span>
          <span className="detay-ana-deger">
            {entropi > 0 ? `${entropi} bits` : '0 bits'}
          </span>
          <span className="detay-alt-yorum">
            {entropi === 0 ? 'Girdi bekleniyor' : entropi < 30 ? 'Zayıf Güvenlik' : 'Güçlü Kripto'}
          </span>
        </div>

        <div className="kripto-detay-kutu">
          <span className="detay-etiket">VERİ SIZINTISI ANALİZİ</span>
          <span className="detay-ana-deger">Backend Bağlantısı Bekleniyor</span>
          <span className="detay-alt-yorum">Pwned API entegrasyonu Hafta 4'te eklenecek</span>
        </div>
      </div>

      <button
        className="kripto-kaydet-btn"
        onClick={handleKaydet}
        disabled={hizmetEksik || cizimEksik}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          background: (hizmetEksik || cizimEksik) ? 'rgba(255, 255, 255, 0.02)' : 'linear-gradient(135deg, #00ffcc 0%, #00b3ff 100%)',
          color: (hizmetEksik || cizimEksik) ? '#4a4959' : '#06050b',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '700',
          cursor: (hizmetEksik || cizimEksik) ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.2s',
          fontSize: '14px',
          letterSpacing: '0.5px',
        }}
      >
        Şifrelerime Kaydet
      </button>
    </div>
  )
}

export default KriptoSifreCard
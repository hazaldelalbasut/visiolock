import { useState, useEffect } from 'react'
import CizimMatrisi from '../components/CizimMatrisi'
import { cizimdenSifreUret, sha256Hesapla } from '../utils/kripto'
import './SifreDetay.css'

function SifreDetay({ seciliSifreId, matrixSize, setAktifSayfa }) {
  const [kayit, setKayit] = useState(null)
  const [cizimYolu, setCizimYolu] = useState([])
  const [gosterilenSifre, setGosterilenSifre] = useState(null)
  const [hataMesaji, setHataMesaji] = useState('')
  const [dogrulaniyor, setDogrulaniyor] = useState(false)
  const [kopyalandi, setKopyalandi] = useState(false)

  useEffect(() => {
    async function kaydiGetir() {
      try {
        const response = await fetch(`http://localhost:5184/api/sifreler/kayit/${seciliSifreId}`)
        const veri = await response.json()
        setKayit(veri)
      } catch (hata) {
        console.error('Kayıt alınamadı:', hata)
      }
    }
    if (seciliSifreId) kaydiGetir()
  }, [seciliSifreId])

  async function cizimiDogrula() {
    if (cizimYolu.length === 0 || !kayit) return
    setDogrulaniyor(true)
    setHataMesaji('')

    const olasiSifre = await cizimdenSifreUret(kayit.hizmetAdi, cizimYolu, kayit.matrixBoyutu)
    const dogrulamaHash = await sha256Hesapla(olasiSifre)

    try {
      const response = await fetch(`http://localhost:5184/api/sifreler/${kayit.id}/dogrula`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hesaplananHash: dogrulamaHash })
      })
      const sonuc = await response.json()

      if (sonuc.basarili) {
        setGosterilenSifre(olasiSifre)
      } else {
        setHataMesaji('Çizim eşleşmedi, tekrar deneyin')
        setGosterilenSifre(null)
      }
    } catch (hata) {
      setHataMesaji('Doğrulama sırasında bir hata oluştu')
    } finally {
      setDogrulaniyor(false)
    }
  }

  function kopyala() {
    if (!gosterilenSifre) return
    navigator.clipboard.writeText(gosterilenSifre)
    setKopyalandi(true)
    setTimeout(() => setKopyalandi(false), 30000)
  }

  if (!kayit) {
    return <div className="sifre-detay-sayfa">Yükleniyor...</div>
  }

  return (
    <div className="sifre-detay-sayfa">
      <button className="geri-btn" onClick={() => setAktifSayfa('sifrelerim')}>
        ← Şifrelerim'e dön
      </button>
      <h1>{kayit.hizmetAdi}</h1>
      <p className="detay-alt">{kayit.kullaniciAdiHizmette}</p>

      {!gosterilenSifre && (
        <>
          <p className="detay-alt">Şifreyi görmek için çizimini tekrar yap:</p>
          <CizimMatrisi matrixSize={kayit.matrixBoyutu} onCizimDegisti={setCizimYolu} />
          {hataMesaji && <p className="hata-mesaji">{hataMesaji}</p>}
          <button className="birincil-btn" onClick={cizimiDogrula} disabled={dogrulaniyor}>
            {dogrulaniyor ? 'Doğrulanıyor...' : 'Doğrula'}
          </button>
        </>
      )}

      {gosterilenSifre && (
        <>
          <div className="sifre-kutusu">
            <span className="sifre-metni">{gosterilenSifre}</span>
          </div>
          <button className="birincil-btn" onClick={kopyala}>
            {kopyalandi ? 'Kopyalandı! (30 sn sonra pano temizlenir)' : 'Kopyala'}
          </button>
        </>
      )}
    </div>
  )
}

export default SifreDetay
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Giris from './pages/Giris'
import Sifrelerim from './pages/Sifrelerim'
import SifreDetay from './pages/SifreDetay'
import Ayarlar from './pages/Ayarlar'
import './App.css'

function App() {
  const [aktifSayfa, setAktifSayfa] = useState('login')
  const [matrixSize, setMatrixSize] = useState(4)
  const [seciliSifreId, setSeciliSifreId] = useState(null)
  const [bildirim, setBildirim] = useState(null)

  // Kaydedilen şifreler artık backend'den gelecek, boş başlıyor
  const [kaydedilenSifreler, setKaydedilenSifreler] = useState([])

  // Sayfa açıldığında backend'den listeyi çek
  useEffect(() => {
    async function listeyiGetir() {
      try {
        const response = await fetch('http://localhost:5184/api/sifreler/1')
        const veri = await response.json()
        setKaydedilenSifreler(veri)
      } catch (hata) {
        console.error('Liste alınamadı:', hata)
      }
    }
    listeyiGetir()
  }, [])

  // Yeni şifre kaydetme fonksiyonu — artık gerçek backend'e gönderiyor
  async function sifreKaydet(veri) {
    try {
      const response = await fetch('http://localhost:5184/api/sifreler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kullaniciId: 1,
          hizmetAdi: veri.hizmetAdi,
          kullaniciAdiHizmette: veri.kullaniciAdiHizmette,
          matrixBoyutu: veri.matrixSize,
          entropiBit: veri.entropiBit,
          dogrulamaHash: veri.dogrulamaHash
        })
      })

      if (!response.ok) throw new Error('Kayıt başarısız')

      const kaydedilenVeri = await response.json()
      setKaydedilenSifreler([...kaydedilenSifreler, kaydedilenVeri])
      setBildirim('Şifre başarıyla kasanıza kaydedildi!')
      setTimeout(() => setBildirim(null), 2500)
      setAktifSayfa('sifrelerim')
    } catch (hata) {
      setBildirim('Hata: ' + hata.message)
      setTimeout(() => setBildirim(null), 3000)
    }
  }

  function sifreDetayinaGit(id) {
    setSeciliSifreId(id)
    setAktifSayfa('sifreDetay')
  }

  return (
    <div className="app">
      {bildirim && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: '#0d0b14',
          border: '1px solid #00ffcc',
          color: '#00ffcc',
          padding: '14px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 0 20px rgba(0, 255, 204, 0.2)',
          zIndex: 9999
        }}>
          {bildirim}
        </div>
      )}
      {aktifSayfa !== 'login' && (
        <Sidebar aktifSayfa={aktifSayfa} setAktifSayfa={setAktifSayfa} />
      )}

      <div className="content">
        {aktifSayfa === 'login' && (
          <Login setAktifSayfa={setAktifSayfa} />
        )}

        {/* Giris bileşenine şifre kaydetme yeteneği verdik */}
        {aktifSayfa === 'giris' && (
          <Giris
            matrixSize={matrixSize}
            sifreKaydet={sifreKaydet}
          />
        )}

        {/* Şifrelerim bileşenine backend'den gelen şifre listesini gönderdik */}
        {aktifSayfa === 'sifrelerim' && (
          <Sifrelerim
            sifrelerimListesi={kaydedilenSifreler}
            sifreDetayinaGit={sifreDetayinaGit}
          />
        )}

        {aktifSayfa === 'sifreDetay' && (
          <SifreDetay
            seciliSifreId={seciliSifreId}
            matrixSize={matrixSize}
            setAktifSayfa={setAktifSayfa}
          />
        )}

        {aktifSayfa === 'ayarlar' && (
          <Ayarlar matrixSize={matrixSize} setMatrixSize={setMatrixSize} />
        )}
      </div>
    </div>
  )
}

export default App
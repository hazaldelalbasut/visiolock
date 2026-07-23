import { useState } from 'react'
import './Sifrelerim.css'

function Sifrelerim({ sifrelerimListesi, sifreDetayinaGit }) {
  const [aramaMetni, setAramaMetni] = useState('')

  const filtrelenmis = sifrelerimListesi.filter((sifre) =>
    sifre.hizmetAdi.toLowerCase().includes(aramaMetni.toLowerCase()) ||
    sifre.kullaniciAdiHizmette.toLowerCase().includes(aramaMetni.toLowerCase())
  )

  return (
    <div className="sifrelerim-sayfa">
      <h1>Şifrelerim</h1>
      <input
        type="text"
        className="arama-kutusu"
        placeholder="Platform veya kullanıcı adı ara..."
        value={aramaMetni}
        onChange={(e) => setAramaMetni(e.target.value)}
      />
      <div className="sifre-listesi">
        {filtrelenmis.length === 0 && (
          <p className="bos-mesaj">Sonuç bulunamadı.</p>
        )}
        {filtrelenmis.map((sifre) => (
          <div
            key={sifre.id}
            className="sifre-karti"
            onClick={() => sifreDetayinaGit(sifre.id)}
          >
            <div className="sifre-karti-baslik">{sifre.hizmetAdi}</div>
            <div className="sifre-karti-alt">{sifre.kullaniciAdiHizmette}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sifrelerim
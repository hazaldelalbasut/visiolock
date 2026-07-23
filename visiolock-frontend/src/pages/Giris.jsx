import { useState } from 'react'
import CizimMatrisi from '../components/CizimMatrisi'
import KriptoSifreCard from '../components/KriptoSifreCard'
import './Giris.css'

function Giris({ matrixSize, sifreKaydet }) {
  const [secilenNoktalar, setSecilenNoktalar] = useState([])
  const [hizmetAdi, setHizmetAdi] = useState('')
const [kullaniciAdi, setKullaniciAdi] = useState('')
  return (
    <div className="matris-kapsayici">
      <div className="matris-sol-kolon">
        <div className="matris-kart">
          <div className="matris-header">
            <div className="matris-baslik-sol">
              <span className="matris-logo-ikon">🔐</span>
              <h2>Bilişsel Çizim Matrisi</h2>
            </div>
            <div className="matris-boyut-etiket">
              {matrixSize}X{matrixSize} NOKTA
            </div>
          </div>

          <div className="hizmet-input-alan">
            <input
              type="text"
              placeholder="Hizmet adı girin (Örn: Instagram, Gmail)"
              value={hizmetAdi}
              onChange={(e) => setHizmetAdi(e.target.value)}
            />
            <input
              type="text"
              placeholder="O hizmetteki kullanıcı adınız"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
            />
          </div>
          <div className="matris-icerik">
            <CizimMatrisi matrixSize={matrixSize} onCizimDegisti={setSecilenNoktalar} />
          </div>
        </div>
      </div>

      <div className="matris-sag-kolon">
        <KriptoSifreCard
          hizmetAdi={hizmetAdi}
          kullaniciAdi={kullaniciAdi}
          cizimYolu={secilenNoktalar}
          matrixSize={matrixSize}
          onSifreKaydet={sifreKaydet}
        />
      </div>
    </div>
  )
}

export default Giris
import { useState } from 'react'
import './Ayarlar.css'

function Ayarlar({ matrixSize, setMatrixSize }) {
  const [panoSuresi, setPanoSuresi] = useState(30)

  return (
    <div className="ayarlar-kapsayici">
      <div className="ayarlar-kart">
        <div className="ayarlar-header">
          <div className="baslik-sol">
            <span className="ayar-ikon">⚙</span>
            <h2>Sistem Ayarları</h2>
          </div>
        </div>

        <div className="ayarlar-icerik">
          <div className="ayar-grubu">
            <label className="ayar-etiket">MATRİS GRİD BOYUTU</label>
            <div className="select-kapsayici">
              <select
                value={matrixSize}
                onChange={(e) => setMatrixSize(Number(e.target.value))}
                className="ayar-select"
              >
                <option value={4}>4×4 Grid Matrisi</option>
                <option value={5}>5×5 Grid Matrisi</option>
                <option value={6}>6×6 Grid Matrisi</option>
              </select>
            </div>
            <p className="ayar-aciklama">
              Çizim matrisinin satır ve sütun sayısı. Değiştirildiğinde canvas yenilenir.
            </p>
          </div>

          <div className="ayar-grubu">
            <div className="etiket-satiri">
              <label className="ayar-etiket">PANO TEMİZLEME SÜRESİ</label>
              <span className="sure-deger">{panoSuresi} Saniye</span>
            </div>
            <div className="slider-kapsayici">
              <input
                type="range"
                min="5"
                max="60"
                value={panoSuresi}
                onChange={(e) => setPanoSuresi(Number(e.target.value))}
                className="ayar-slider"
              />
            </div>
            <p className="ayar-aciklama">
              Kopyalanan şifrenin panodan (clipboard) otomatik silinme süresi.
            </p>
          </div>

          <div className="durum-cubugu">
            <span className="durum-nokta"></span>
            <span className="durum-metin">Yerel Olarak Kaydediliyor (Backend Bağlantısı Yok)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ayarlar
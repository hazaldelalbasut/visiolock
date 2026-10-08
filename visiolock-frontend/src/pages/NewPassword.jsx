import { useState } from 'react'
import DrawingMatrix from '../components/DrawingMatrix'
import CryptoPasswordCard from '../components/CryptoPasswordCard'
import './NewPassword.css'

function NewPassword({ matrixSize, savePassword }) {
  const [selectedPoints, setSelectedPoints] = useState([])
  const [serviceName, setServiceName] = useState('')
const [username, setUsername] = useState('')
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
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
            <input
              type="text"
              placeholder="O hizmetteki kullanıcı adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="matris-icerik">
            <DrawingMatrix matrixSize={matrixSize} onDrawingChange={setSelectedPoints} />
          </div>
        </div>
      </div>

      <div className="matris-sag-kolon">
        <CryptoPasswordCard
          serviceName={serviceName}
          username={username}
          drawingPath={selectedPoints}
          matrixSize={matrixSize}
          onSavePassword={savePassword}
        />
      </div>
    </div>
  )
}

export default NewPassword

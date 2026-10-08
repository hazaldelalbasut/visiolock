import { useState, useEffect } from 'react'
import DrawingMatrix from '../components/DrawingMatrix'
import { generatePasswordFromDrawing, computeSha256 } from '../utils/crypto'
import './PasswordDetail.css'

function PasswordDetail({ selectedPasswordId, matrixSize, setActivePage, token }) {
  const [record, setRecord] = useState(null)
  const [drawingPath, setDrawingPath] = useState([])
  const [revealedPassword, setRevealedPassword] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function kaydiGetir() {
      try {
        const response = await fetch(`http://localhost:5184/api/passwords/${selectedPasswordId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        setRecord(data)
      } catch (error) {
        console.error('Kayıt alınamadı:', error)
      }
    }
    if (selectedPasswordId && token) kaydiGetir()
  }, [selectedPasswordId, token])

  async function cizimiDogrula() {
    if (drawingPath.length === 0 || !record) return
    setVerifying(true)
    setErrorMessage('')

    const candidatePassword = await generatePasswordFromDrawing(record.serviceName, drawingPath, record.matrixSize)
    const verificationHash = await computeSha256(candidatePassword)

    try {
      const response = await fetch(`http://localhost:5184/api/passwords/${record.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ computedHash: verificationHash })
      })
      const result = await response.json()

      if (result.success) {
        setRevealedPassword(candidatePassword)
      } else {
        setErrorMessage('Çizim eşleşmedi, tekrar deneyin')
        setRevealedPassword(null)
      }
    } catch (error) {
      setErrorMessage('Doğrulama sırasında bir hata oluştu')
    } finally {
      setVerifying(false)
    }
  }

  function kopyala() {
    if (!revealedPassword) return
    navigator.clipboard.writeText(revealedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 30000)
  }

  if (!record) {
    return <div className="sifre-detay-sayfa">Yükleniyor...</div>
  }

  return (
    <div className="sifre-detay-sayfa">
      <button className="geri-btn" onClick={() => setActivePage('sifrelerim')}>
        ← Şifrelerim'e dön
      </button>
      <h1>{record.serviceName}</h1>
      <p className="detay-alt">{record.serviceUsername}</p>

      {!revealedPassword && (
        <>
          <p className="detay-alt">Şifreyi görmek için çizimini tekrar yap:</p>
          {record.hint && (
            <p className="ipucu-notu">💡 {record.hint}</p>
          )}
          <DrawingMatrix matrixSize={record.matrixSize} onDrawingChange={setDrawingPath} />
          {errorMessage && <p className="hata-mesaji">{errorMessage}</p>}
          <button className="birincil-btn" onClick={cizimiDogrula} disabled={verifying}>
            {verifying ? 'Doğrulanıyor...' : 'Doğrula'}
          </button>
        </>
      )}

      {revealedPassword && (
        <>
          <div className="sifre-kutusu">
            <span className="sifre-metni">{revealedPassword}</span>
          </div>
          <button className="birincil-btn" onClick={kopyala}>
            {copied ? 'Kopyalandı! (30 sn sonra pano temizlenir)' : 'Kopyala'}
          </button>
        </>
      )}
    </div>
  )
}

export default PasswordDetail

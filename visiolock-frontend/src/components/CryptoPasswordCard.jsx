import { useState, useEffect } from 'react'
import './CryptoPasswordCard.css'
import { generatePasswordFromDrawing, computeSha256 } from '../utils/crypto'

function CryptoPasswordCard({ serviceName = '', username = '', drawingPath = [], matrixSize = 4, onSavePassword }) {
  const [passwordHidden, setPasswordHidden] = useState(true)
  const [copied, setCopied] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [entropy, setEntropy] = useState(0)
  const [hint, setHint] = useState('')

  // Sızıntı Analizi State'i
  const [leakStatus, setLeakStatus] = useState({
    loading: false,
    status: 'BEKLIYOR', // 'BEKLIYOR', 'GÜVENLİ', 'TEHLİKELİ', 'HATA'
    mainText: 'Girdi Bekleniyor',
    subText: 'E-posta adresinizi giriniz'
  })

  // Gerçek entropi hesabı: kaç farklı sırayla nokta seçilebilir, onun log2'si
  function calculateEntropy(totalPointCount, selectedPointCount) {
    let possibleCombinations = 1
    for (let i = 0; i < selectedPointCount; i++) {
      possibleCombinations *= (totalPointCount - i)
    }
    if (possibleCombinations <= 0) return 0
    return Math.round(Math.log2(possibleCombinations))
  }

  // Şifre Üretme ve Entropi Etkisi
  useEffect(() => {
    if (!serviceName || drawingPath.length === 0) {
      setGeneratedPassword('')
      setEntropy(0)
      return
    }

    async function generatePassword() {
      const password = await generatePasswordFromDrawing(serviceName, drawingPath, matrixSize)
      setGeneratedPassword(password)
    }
    generatePassword()

    const totalPoints = matrixSize * matrixSize
    setEntropy(calculateEntropy(totalPoints, drawingPath.length))
  }, [serviceName, drawingPath, matrixSize])

  // Canlı Veri Sızıntısı Analizi İsteği (Debounced - 500ms)
  useEffect(() => {
    if (!username || !username.includes('@')) {
      setLeakStatus({
        loading: false,
        status: 'BEKLIYOR',
        mainText: 'Girdi Bekleniyor',
        subText: username ? 'Geçerli bir e-posta girin' : 'Kullanıcı adı / e-posta yazın'
      })
      return
    }

    const timer = setTimeout(async () => {
      setLeakStatus(prev => ({
        ...prev,
        loading: true,
        mainText: 'Taranıyor...',
        subText: 'Backend analiz yapıyor'
      }))

      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:5184/api/analysis/check/${encodeURIComponent(username)}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        const text = await res.text()
        const data = text ? JSON.parse(text) : {}

        if (res.ok) {
          setLeakStatus({
            loading: false,
            status: data.status || 'GÜVENLİ',
            mainText: data.status === 'TEHLİKELİ' ? '🚨 Sızıntı Var!' : '✅ Güvenli',
            subText: data.message || 'Sızıntı tespit edilmedi.'
          })
        } else {
          setLeakStatus({
            loading: false,
            status: 'HATA',
            mainText: '⚠️ Bağlantı Hatası',
            subText: data.error || 'Analiz yapılamadı'
          })
        }
      } catch (err) {
        setLeakStatus({
          loading: false,
          status: 'HATA',
          mainText: '⚠️ Sunucuya Ulaşılamadı',
          subText: 'Backend sunucusunu kontrol edin'
        })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  function handleCopy() {
    if (!generatedPassword) return
    navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSave() {
    if (!generatedPassword) return
    const verificationHash = await computeSha256(generatedPassword)

    onSavePassword({
      serviceName: serviceName,
      serviceUsername: username,
      matrixSize: matrixSize,
      entropyBits: entropy,
      verificationHash: verificationHash,
      hint: hint
    })
  }

  const serviceMissing = !serviceName
  const drawingMissing = drawingPath.length === 0

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
        <div className={`kripto-durum-badge ${serviceMissing ? 'eksik' : 'aktif'}`}>
          {serviceMissing ? 'HİZMET EKSİK' : drawingMissing ? 'DESEN BEKLENİYOR' : 'ŞİFRE HAZIR'}
        </div>
      </div>

      <div className="kripto-ekran">
        <div className="scanline"></div>
        <div className="sifre-gosterim-alani">
          {serviceMissing ? (
            <span className="kripto-placeholder">HİZMET ADI GİRİN</span>
          ) : drawingMissing ? (
            <span className="kripto-placeholder">DESEN ÇİZMEYE BAŞLAYIN</span>
          ) : (
            <span className="kripto-uretilmis-sifre">
              {passwordHidden ? '••••••••••••••••' : generatedPassword}
            </span>
          )}
        </div>

        <div className="kripto-aksiyonlar">
          <button
            className="kripto-ekran-btn"
            onClick={() => setPasswordHidden(!passwordHidden)}
            disabled={serviceMissing || drawingMissing}
          >
            {passwordHidden ? '👁' : '🔒'}
          </button>

          <button
            className={`kripto-kopyala-btn ${generatedPassword ? 'aktif' : ''}`}
            onClick={handleCopy}
            disabled={serviceMissing || drawingMissing}
          >
            {copied ? 'Kopyalandı!' : 'Kopyala'}
            <span className="kopyala-daire"></span>
          </button>
        </div>
      </div>

      <div className="kripto-detaylar">
        <div className="kripto-detay-kutu">
          <span className="detay-etiket">BİLGİ ENTROPİSİ</span>
          <span className="detay-ana-deger">
            {entropy > 0 ? `${entropy} bits` : '0 bits'}
          </span>
          <span className="detay-alt-yorum">
            {entropy === 0 ? 'Girdi bekleniyor' : entropy < 30 ? 'Zayıf Güvenlik' : 'Güçlü Kripto'}
          </span>
        </div>

        {/* CANLI VERİ SIZINTISI ANALİZ KUTUSU */}
        <div className="kripto-detay-kutu">
          <span className="detay-etiket">VERİ SIZINTISI ANALİZİ</span>
          <span className={`detay-ana-deger ${leakStatus.status.toLowerCase()}`}>
            {leakStatus.mainText}
          </span>
          <span className="detay-alt-yorum" title={leakStatus.subText}>
            {leakStatus.subText}
          </span>
        </div>
      </div>

      <div className="kripto-ipucu-alani">
        <label className="detay-etiket" htmlFor="kripto-ipucu-input">HATIRLATMA İPUCU (OPSİYONEL)</label>
        <input
          id="kripto-ipucu-input"
          type="text"
          placeholder="Örn: Köşelerden başladım, ortadan geçtim..."
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          maxLength={120}
          style={{
            width: '100%',
            marginTop: '6px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.03)',
            color: '#fff',
            fontSize: '13px',
          }}
        />
        <span className="detay-alt-yorum" style={{ display: 'block', marginTop: '4px' }}>
          Deseni ifşa etmeyecek, sadece sana bir şeyler hatırlatacak bir not yaz.
        </span>
      </div>

      <button
        className="kripto-kaydet-btn"
        onClick={handleSave}
        disabled={serviceMissing || drawingMissing}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '12px',
          background: (serviceMissing || drawingMissing) ? 'rgba(255, 255, 255, 0.02)' : 'linear-gradient(135deg, #00ffcc 0%, #00b3ff 100%)',
          color: (serviceMissing || drawingMissing) ? '#4a4959' : '#06050b',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '700',
          cursor: (serviceMissing || drawingMissing) ? 'not-allowed' : 'pointer',
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

export default CryptoPasswordCard

import { useState } from 'react'
import './Login.css'
import SecurityAlert from '../components/SecurityAlert'

function Login({ onLoginSuccess, onGoToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Bildirim nesnesi (type: 'error' | 'rateLimit' | 'success' | 'warning')
  const [alertInfo, setAlertInfo] = useState({
    type: '',
    title: '',
    message: ''
  })

  async function handleGiris(e) {
    e.preventDefault()

    if (!email || !password) {
      setAlertInfo({
        type: 'warning',
        title: 'Eksik Bilgi',
        message: 'Lütfen e-posta ve şifrenizi eksiksiz girin.'
      })
      return
    }

    setLoading(true)
    setAlertInfo({ type: '', title: '', message: '' }) // Eski uyarıyı temizle

    try {
      const response = await fetch('http://localhost:5184/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      // 1. RATE LIMIT / BRUTE-FORCE KORUMASI (HTTP 429)
      if (response.status === 429) {
        setAlertInfo({
          type: 'rateLimit',
          title: 'Çok Fazla Hatalı Deneme!',
          message: data.error || data.message || 'Güvenlik nedeniyle hesabınız geçici olarak kısıtlandı. Lütfen 1 dakika sonra tekrar deneyin.'
        })
        return
      }

      // 2. HATALI KULLANICI VEYA ŞİFRE (HTTP 401)
      if (response.status === 401) {
        setAlertInfo({
          type: 'error',
          title: 'Giriş Başarısız',
          message: data.error || 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.'
        })
        return
      }

      // 3. EKSİK / GEÇERSİZ FORMAT (HTTP 400 VEYA DİĞER HATA KODLARI)
      if (!response.ok) {
        setAlertInfo({
          type: 'warning',
          title: 'Doğrulama Uyarısı',
          message: data.error || 'Giriş yapılırken bir sorun oluştu.'
        })
        return
      }

      // 4. BAŞARILI GİRİŞ (HTTP 200)
      setAlertInfo({
        type: 'success',
        title: 'Erişim Onaylandı',
        message: 'Giriş başarılı, yönlendiriliyorsunuz...'
      })

      setTimeout(() => {
        onLoginSuccess(data.token, data.userId)
      }, 800)

    } catch (error) {
      setAlertInfo({
        type: 'error',
        title: 'Sunucu Bağlantı Hatası',
        message: 'Backend sunucusuna ulaşılamadı. Lütfen API servisinin açık olduğunu kontrol edin.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-kapsayici">
      <div className="login-kart">
        <div className="login-header">
          <span className="login-kilit-ikon">🔒</span>
          <h2>VisioLock'a Giriş Yap</h2>
          <p className="login-alt-baslik">Devam etmek için hesabınızla giriş yapın</p>
        </div>

        {/* NEON GÜVENLİK BİLDİRİMİ KUTUSU */}
        <SecurityAlert
          type={alertInfo.type}
          title={alertInfo.title}
          message={alertInfo.message}
          onClose={() => setAlertInfo({ type: '', title: '', message: '' })}
        />

        <form onSubmit={handleGiris} className="login-form">
          <div className="login-input-grubu">
            <label>E-POSTA ADRESİ</label>
            <input
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
          </div>

          <div className="login-input-grubu">
            <label>ŞİFRE</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        {onGoToRegister && (
  <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#a0a0b0' }}>
    Hesabınız yok mu?{' '}
    <span
      onClick={onGoToRegister}
      style={{ color: '#00ffcc', cursor: 'pointer', textDecoration: 'underline' }}
    >
      Kayıt Ol
    </span>
  </div>
)}
      </div>
    </div>
  )
}

export default Login

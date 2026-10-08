import { useState } from 'react'
import SecurityAlert from '../components/SecurityAlert'
import './Register.css' // Stillerini Register.css veya mevcut Login.css içinden alabilirsin

function Register({ onRegisterSuccess, onGoToLogin }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  // Neon güvenlik uyarısı state'i
  const [alertInfo, setAlertInfo] = useState({
    type: '',
    title: '',
    message: ''
  })

  async function handleKayit(e) {
    e.preventDefault()

    // 1. İstemci Tarafı Ön Doğrulamalar
    if (!fullName || !email || !password || !passwordConfirm) {
      setAlertInfo({
        type: 'warning',
        title: 'Eksik Bilgi',
        message: 'Lütfen tüm alanları doldurun.'
      })
      return
    }

    if (password !== passwordConfirm) {
      setAlertInfo({
        type: 'error',
        title: 'Şifre Uyuşmazlığı',
        message: 'Girdiğiniz şifreler birbiriyle eşleşmiyor.'
      })
      return
    }

    if (password.length < 6) {
      setAlertInfo({
        type: 'warning',
        title: 'Zayıf Şifre',
        message: 'Şifreniz güvenlik nedeniyle en az 6 karakter olmalıdır.'
      })
      return
    }

    setLoading(true)
    setAlertInfo({ type: '', title: '', message: '' })

    try {
      const response = await fetch('http://localhost:5184/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password
        })
      })

      const data = await response.json()

      // 2. ÇOK FAZLA İSTEK / RATE LIMIT (HTTP 429)
      if (response.status === 429) {
        setAlertInfo({
          type: 'rateLimit',
          title: 'Çok Fazla Deneme!',
          message: data.error || 'Güvenlik nedeniyle işlem kısıtlandı. Lütfen biraz bekleyin.'
        })
        return
      }

      // 3. E-POSTA ZATEN KULLANIMDA (HTTP 409 Conflict)
      if (response.status === 409) {
        setAlertInfo({
          type: 'warning',
          title: 'E-posta Kullanımda',
          message: data.error || 'Bu e-posta adresiyle zaten kayıtlı bir hesap var.'
        })
        return
      }

      // 4. DİĞER HATA DURUMLARI (HTTP 400 Bad Request vs.)
      if (!response.ok) {
        setAlertInfo({
          type: 'error',
          title: 'Kayıt Başarısız',
          message: data.error || 'Hesap oluşturulurken bir hata oluştu.'
        })
        return
      }

      // 5. BAŞARILI KAYIT (HTTP 200 / 201)
      setAlertInfo({
        type: 'success',
        title: 'Hesap Oluşturuldu!',
        message: 'Kaydınız başarıyla tamamlandı. Giriş ekranına yönlendiriliyorsunuz...'
      })

      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess()
        } else if (onGoToLogin) {
          onGoToLogin()
        }
      }, 1500)

    } catch (error) {
      setAlertInfo({
        type: 'error',
        title: 'Sunucu Bağlantı Hatası',
        message: 'Backend servisine ulaşılamadı. Lütfen sunucunuzun açık olduğundan emin olun.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-kapsayici">
      <div className="login-kart">
        <div className="login-header">
          <span className="login-kilit-ikon">🛡️</span>
          <h2>VisioLock'a Kayıt Ol</h2>
          <p className="login-alt-baslik">Güvenli kriptografik kasaya erişmek için hesap oluşturun</p>
        </div>

        {/* NEON GÜVENLİK BİLDİRİMİ */}
        <SecurityAlert
          type={alertInfo.type}
          title={alertInfo.title}
          message={alertInfo.message}
          onClose={() => setAlertInfo({ type: '', title: '', message: '' })}
        />

        <form onSubmit={handleKayit} className="login-form">
          <div className="login-input-grubu">
            <label>AD SOYAD</label>
            <input
              type="text"
              placeholder="Adınız ve Soyadınız"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="login-input"
            />
          </div>

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

          <div className="login-input-grubu">
            <label>ŞİFRE TEKRAR</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="login-input"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>

        {onGoToLogin && (
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#a0a0b0' }}>
            Zaten bir hesabınız var mı?{' '}
            <span
              onClick={onGoToLogin}
              style={{ color: '#00ffcc', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Giriş Yap
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Register

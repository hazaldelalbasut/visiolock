import { useState } from 'react'
import './Login.css' 

function Login({ setAktifSayfa }) {
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [hataMesaji, setHataMesaji] = useState('')

  function handleGiris(e) {
    e.preventDefault()

    if (!email || !sifre) {
      setHataMesaji('Lütfen tüm alanları doldurun.')
      return
    }

    
    if (email === 'hazaldelalbasut@gmail.com') {
      setHataMesaji('')
      setAktifSayfa('giris') 
    } else {
      setHataMesaji('Geçersiz e-posta adresi!')
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

        <form onSubmit={handleGiris} className="login-form">
          {hataMesaji && <div className="login-hata-kutusu">{hataMesaji}</div>}

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
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              className="login-input"
            />
          </div>

          <button type="submit" className="login-btn">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
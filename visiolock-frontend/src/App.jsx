import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Register from './pages/Register'
import NewPassword from './pages/NewPassword'
import Passwords from './pages/Passwords'
import PasswordDetail from './pages/PasswordDetail'
import Settings from './pages/Settings'
import BreachAnalysis from './pages/BreachAnalysis'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null)

  // Sayfa yüklendiğinde token varsa 'giris', yoksa 'login'
  const [activePage, setActivePage] = useState(localStorage.getItem('token') ? 'giris' : 'login')
  const [matrixSize, setMatrixSize] = useState(4)
  const [selectedPasswordId, setSelectedPasswordId] = useState(null)
  const [savedPasswords, setSavedPasswords] = useState([])

  // Giriş başarılı olduğunda çağrılıyor (Login.jsx'ten)
  function onLoginBasarili(incomingToken, incomingUserId) {
    localStorage.setItem('token', incomingToken)
    localStorage.setItem('userId', incomingUserId)
    setToken(incomingToken)
    setUserId(incomingUserId)
    setActivePage('giris')
  }

  // Oturumu kapatma fonksiyonu
  function handleCikisYap() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setToken(null)
    setUserId(null)
    setActivePage('login')
  }

  // Kullanıcı ve Token kontrol edilerek listeyi çekme
  useEffect(() => {
    if (!userId || !token) return

    async function listeyiGetir() {
      try {
        const response = await fetch('http://localhost:5184/api/passwords', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        // Eğer Token geçersiz veya süresi dolmuşsa (401) oturumu kapat
        if (response.status === 401) {
          console.warn("Oturum süresi dolmuş veya yetkisiz erişim. Çıkış yapılıyor...")
          handleCikisYap()
          return
        }

        if (!response.ok) {
          throw new Error(`Sunucu hatası: ${response.status}`)
        }

        const data = await response.json()
        setSavedPasswords(data)
      } catch (error) {
        console.error('Liste alınamadı:', error.message)
      }
    }
    listeyiGetir()
  }, [userId, token])

  async function sifreKaydet(data) {
    try {
      const response = await fetch('http://localhost:5184/api/passwords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceName: data.serviceName,
          serviceUsername: data.serviceUsername,
          matrixSize: data.matrixSize,
          entropyBits: data.entropyBits,
          verificationHash: data.verificationHash,
          hint: data.hint
        })
      })

      if (response.status === 401) {
        handleCikisYap()
        throw new Error('Oturum süreniz doldu, lütfen tekrar giriş yapın.')
      }

      if (!response.ok) throw new Error('Kayıt başarısız')

      const savedRecord = await response.json()
      setSavedPasswords(prev => [...prev, savedRecord])
      alert('Şifre başarıyla kasanıza kaydedildi!')
      setActivePage('sifrelerim')
    } catch (error) {
      alert('Kayıt sırasında bir hata oluştu: ' + error.message)
    }
  }

  function sifreDetayinaGit(id) {
    setSelectedPasswordId(id)
    setActivePage('sifreDetay')
  }

  async function sifreSil(id) {
    try {
      const response = await fetch(`http://localhost:5184/api/passwords/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.status === 401) {
        handleCikisYap()
        throw new Error('Oturum süreniz doldu.')
      }

      if (!response.ok) throw new Error('Silme başarısız')

      setSavedPasswords(prev => prev.filter((s) => s.id !== id))
    } catch (error) {
      alert('Silme hatası: ' + error.message)
    }
  }

  return (
    <div className="app">
      {/* Login ve Register sayfalarında Sidebar gizlenir */}
      {activePage !== 'login' && activePage !== 'register' && (
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={handleCikisYap}
        />
      )}

      <div className="content">
        {/* PUBLIC SAYFALAR */}
        {activePage === 'login' && (
          <Login
            onLoginSuccess={onLoginBasarili}
            onGoToRegister={() => setActivePage('register')}
          />
        )}

        {activePage === 'register' && (
          <Register
            onGoToLogin={() => setActivePage('login')}
          />
        )}

        {/* PROTECTED SAYFALAR (GİRİŞ ŞART) */}
        {activePage === 'giris' && (
          <ProtectedRoute token={token} onLogout={handleCikisYap}>
            <NewPassword
              matrixSize={matrixSize}
              savePassword={sifreKaydet}
            />
          </ProtectedRoute>
        )}

        {activePage === 'sifrelerim' && (
          <ProtectedRoute token={token} onLogout={handleCikisYap}>
            <Passwords
              passwordsList={savedPasswords}
              goToPasswordDetail={sifreDetayinaGit}
              deletePassword={sifreSil}
            />
          </ProtectedRoute>
        )}

        {activePage === 'sifreDetay' && (
          <ProtectedRoute token={token} onLogout={handleCikisYap}>
            <PasswordDetail
              selectedPasswordId={selectedPasswordId}
              matrixSize={matrixSize}
              setActivePage={setActivePage}
              token={token}
            />
          </ProtectedRoute>
        )}

        {activePage === 'sizintiAnalizi' && (
          <ProtectedRoute token={token} onLogout={handleCikisYap}>
            <BreachAnalysis token={token} />
          </ProtectedRoute>
        )}

        {activePage === 'ayarlar' && (
          <ProtectedRoute token={token} onLogout={handleCikisYap}>
            <Settings matrixSize={matrixSize} setMatrixSize={setMatrixSize} />
          </ProtectedRoute>
        )}
      </div>
    </div>
  )
}

export default App

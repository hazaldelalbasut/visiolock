import { useState } from 'react'
import SecurityAlert from '../components/SecurityAlert'
import './Passwords.css'

function Passwords({ passwordsList, goToPasswordDetail, deletePassword }) {
  const [searchText, setSearchText] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [notification, setNotification] = useState(null)

  // Çökme yapmaması için optional chaining (?.) ile arama kontrolü
  const filtered = passwordsList.filter((record) =>
    (record.serviceName || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (record.serviceUsername || '').toLowerCase().includes(searchText.toLowerCase())
  )

  // Kart üzerindeki sil butonuna tıklandığında
  const handleSil = async (e, id, serviceName) => {
    e.stopPropagation() // Kartın tıklama olayının (detaya gitme) tetiklenmesini engeller
    if (!window.confirm(`"${serviceName}" kaydını kasanızdan silmek istediğinize emin misiniz?`)) return

    setDeletingId(id)
    try {
      if (deletePassword) {
        await deletePassword(id)
        setNotification({ type: 'success', message: `"${serviceName}" kaydı kasanızdan silindi.` })
      }
    } catch (err) {
      setNotification({ type: 'danger', message: 'Silme işlemi sırasında bir hata oluştu.' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="sifrelerim-sayfa">
      {/* Canlı Bildirim Ekranı */}
      {notification && (
        <SecurityAlert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <h1>Şifrelerim</h1>

      <input
        type="text"
        className="arama-kutusu"
        placeholder="Platform veya kullanıcı adı ara..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <div className="sifre-listesi">
        {filtered.length === 0 && (
          <p className="bos-mesaj">Sonuç bulunamadı.</p>
        )}

        {filtered.map((record) => (
          <div
            key={record.id}
            className="sifre-karti"
            onClick={() => goToPasswordDetail(record.id)}
          >
            <div className="sifre-karti-ust">
              <div>
                <div className="sifre-karti-baslik">{record.serviceName}</div>
                <div className="sifre-karti-alt">{record.serviceUsername || 'Kullanıcı Adı Belirtilmedi'}</div>
              </div>

              {/* Silme Butonu */}
              <button
                className="sil-btn"
                title="Kaydı Sil"
                disabled={deletingId === record.id}
                onClick={(e) => handleSil(e, record.id, record.serviceName)}
              >
                {deletingId === record.id ? '...' : '🗑️'}
              </button>
            </div>

            {/* Entropi ve Matris Detay Rozetleri */}
            <div className="sifre-karti-rozetler">
              <span className="rozet-entropi">⚡ {record.entropyBits || 64} bit</span>
              <span className="rozet-matris">{record.matrixSize || 4}x{record.matrixSize || 4} Matris</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Passwords

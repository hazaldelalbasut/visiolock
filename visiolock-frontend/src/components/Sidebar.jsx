import './Sidebar.css'

function Sidebar({ aktifSayfa, setAktifSayfa }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>VISIO<span className="highlight">LOCK</span></h1>
      </div>
      <div className="sidebar-menu">
        <p
          className={aktifSayfa === 'giris' ? 'menu-item aktif' : 'menu-item'}
          onClick={() => setAktifSayfa('giris')}
        >
          Giriş
        </p>
        <p
          className={
            aktifSayfa === 'sifrelerim' || aktifSayfa === 'sifredetay'
              ? 'menu-item aktif'
              : 'menu-item'
          }
          onClick={() => setAktifSayfa('sifrelerim')}
        >
          Şifrelerim
        </p>
        <p
          className={aktifSayfa === 'ayarlar' ? 'menu-item aktif' : 'menu-item'}
          onClick={() => setAktifSayfa('ayarlar')}
        >
          Ayarlar
        </p>
      </div>
    </div>
  )
}

export default Sidebar
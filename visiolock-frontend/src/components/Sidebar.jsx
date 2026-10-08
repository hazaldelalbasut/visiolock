import './Sidebar.css'

function Sidebar({ activePage, setActivePage, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>VISIO<span className="highlight">LOCK</span></h1>
      </div>
      <div className="sidebar-menu">
        <p
          className={activePage === 'giris' ? 'menu-item aktif' : 'menu-item'}
          onClick={() => setActivePage('giris')}
        >
          Giriş
        </p>
        <p
          className={
            activePage === 'sifrelerim' || activePage === 'sifredetay'
              ? 'menu-item aktif'
              : 'menu-item'
          }
          onClick={() => setActivePage('sifrelerim')}
        >
          Şifrelerim
        </p>
        <p
          className={activePage === 'sizintiAnalizi' ? 'menu-item aktif' : 'menu-item'}
          onClick={() => setActivePage('sizintiAnalizi')}
        >
          🔍 Sızıntı Analizi
        </p>
        <p
          className={activePage === 'ayarlar' ? 'menu-item aktif' : 'menu-item'}
          onClick={() => setActivePage('ayarlar')}
        >
          Ayarlar
        </p>
      </div>

      <button className="cikis-btn" onClick={onLogout}>
        🚪 Çıkış Yap
      </button>
    </div>
  )
}

export default Sidebar

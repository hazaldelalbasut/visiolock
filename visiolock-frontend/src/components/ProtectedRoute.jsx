import React from 'react'

export default function ProtectedRoute({ children, token, onLogout }) {
  const currentToken = token || localStorage.getItem('token')

  if (!currentToken) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <div style={{
          background: '#12131c',
          border: '1px solid #ef4444',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
        }}>
          <span style={{ fontSize: '40px' }}>🛑</span>
          <h2 style={{ color: '#ef4444', margin: '16px 0 8px 0' }}>Erişim Engellendi</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
            Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.
          </p>
          <button
            onClick={onLogout}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#ef4444',
              color: '#fff',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Giriş Sayfasına Git
          </button>
        </div>
      </div>
    )
  }

  return children
}

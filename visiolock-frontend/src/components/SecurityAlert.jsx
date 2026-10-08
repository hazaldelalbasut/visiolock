import React from 'react'
import './SecurityAlert.css'

function SecurityAlert({ type = 'error', title, message, onClose }) {
  if (!message) return null

  // Hata tipine göre simge ve başlık belirleme
  const alertConfigs = {
    error: {
      icon: '🚨',
      defaultTitle: 'Kimlik Doğrulama Hatası',
      className: 'alert-error'
    },
    rateLimit: {
      icon: '⏳',
      defaultTitle: 'Güvenlik Sınırı (Rate Limit)',
      className: 'alert-ratelimit'
    },
    success: {
      icon: '⚡',
      defaultTitle: 'İşlem Başarılı',
      className: 'alert-success'
    },
    warning: {
      icon: '🛡️',
      defaultTitle: 'Güvenlik Uyarısı',
      className: 'alert-warning'
    }
  }

  const config = alertConfigs[type] || alertConfigs.error

  return (
    <div className={`security-alert-box ${config.className}`}>
      <div className="alert-content-left">
        <span className="alert-icon">{config.icon}</span>
        <div className="alert-text-group">
          <strong className="alert-title">{title || config.defaultTitle}</strong>
          <span className="alert-message">{message}</span>
        </div>
      </div>
      {onClose && (
        <button className="alert-close-btn" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  )
}

export default SecurityAlert
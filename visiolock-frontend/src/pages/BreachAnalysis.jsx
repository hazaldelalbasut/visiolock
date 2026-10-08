import React, { useState } from 'react';
import './BreachAnalysis.css';

export default function BreachAnalysis({ token }) {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBreach = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!email || !email.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    setLoading(true);

    try {
      const authToken = token || localStorage.getItem('token');

      const response = await fetch(`http://localhost:5184/api/analysis/check/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      // Boş yanıt patlamasını engellemek için önce text olarak okuyoruz
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Sızıntı analizi yapılırken bir hata oluştu.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sizinti-container">
      <h2>🔍 Veri Sızıntısı Analizi</h2>
      <p className="sizinti-aciklama">
        E-posta adresinizin geçmişte yaşanan küresel veri ihlallerinde yer alıp almadığını tarayın.
      </p>

      <form onSubmit={checkBreach} className="sizinti-form">
        <input
          type="email"
          placeholder="E-posta adresinizi giriniz..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="sizinti-input"
        />
        <button type="submit" disabled={loading} className="sizinti-btn">
          {loading ? 'Taranıyor...' : 'Taramayı Başlat'}
        </button>
      </form>

      {error && <div className="sizinti-hata">⚠️ {error}</div>}

      {result && (
        <div className={`sizinti-sonuc ${result.status ? result.status.toLowerCase() : ''}`}>
          <h4>
            {result.status === 'GÜVENLİ' && '✅ Güvenli'}
            {result.status === 'TEHLİKELİ' && '🚨 Dikkat! Sızıntı Tespit Edildi'}
            {result.status === 'ANALİZ_TAMAMLANDI' && 'ℹ️ Analiz Tamamlandı'}
          </h4>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}

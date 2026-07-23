import { useState, useRef, useEffect, useMemo } from 'react'

function CizimMatrisi({ matrixSize, onCizimDegisti }) {
  const canvasRef = useRef(null)
  const [secilenNoktalar, setSecilenNoktalar] = useState([])

  const canvasBoyutu = 400
  const kenarBosluk = 40

  function noktaKonumunuHesapla(satir, sutun) {
    const kullanilabilirAlan = canvasBoyutu - kenarBosluk - kenarBosluk
    const mesafe = kullanilabilirAlan / (matrixSize - 1)
    return { x: kenarBosluk + sutun * mesafe, y: kenarBosluk + satir * mesafe }
  }

  function tumNoktalariOlustur() {
    const liste = []
    for (let satir = 0; satir < matrixSize; satir++) {
      for (let sutun = 0; sutun < matrixSize; sutun++) {
        liste.push({ id: satir + '-' + sutun, satir, sutun })
      }
    }
    return liste
  }

  const tumNoktalar = useMemo(() => tumNoktalariOlustur(), [matrixSize])

  function ikiNoktaArasiMesafe(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  }

  function enYakinNoktayiBul(tiklananX, tiklananY) {
    for (const nokta of tumNoktalar) {
      const konum = noktaKonumunuHesapla(nokta.satir, nokta.sutun)
      if (ikiNoktaArasiMesafe(tiklananX, tiklananY, konum.x, konum.y) < 20) return nokta
    }
    return null
  }

  function noktaZatenSeciliMi(nokta) {
    return secilenNoktalar.some(n => n.id === nokta.id)
  }

  function canvasaTiklandi(tiklamaOlayi) {
    const canvas = canvasRef.current
    const konum = canvas.getBoundingClientRect()
    const x = tiklamaOlayi.clientX - konum.left
    const y = tiklamaOlayi.clientY - konum.top
    const bulunan = enYakinNoktayiBul(x, y)
    if (bulunan === null || noktaZatenSeciliMi(bulunan)) return

    const yeniListe = secilenNoktalar.concat([bulunan])
    setSecilenNoktalar(yeniListe)
    onCizimDegisti(yeniListe)
  }

  function temizle() {
    setSecilenNoktalar([])
    onCizimDegisti([])
  }

  function geriAl() {
    const yeniListe = secilenNoktalar.slice(0, -1)
    setSecilenNoktalar(yeniListe)
    onCizimDegisti(yeniListe)
  }

  function canvasiCiz() {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasBoyutu, canvasBoyutu)

    for (const nokta of tumNoktalar) {
      const konum = noktaKonumunuHesapla(nokta.satir, nokta.sutun)
      ctx.beginPath()
      ctx.arc(konum.x, konum.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.fill()
    }

    if (secilenNoktalar.length === 0) return

    ctx.beginPath()
    const ilkKonum = noktaKonumunuHesapla(secilenNoktalar[0].satir, secilenNoktalar[0].sutun)
    ctx.moveTo(ilkKonum.x, ilkKonum.y)
    for (let i = 1; i < secilenNoktalar.length; i++) {
      const konum = noktaKonumunuHesapla(secilenNoktalar[i].satir, secilenNoktalar[i].sutun)
      ctx.lineTo(konum.x, konum.y)
    }
    ctx.strokeStyle = '#00ffcc'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowBlur = 4
    ctx.shadowColor = '#00ffcc'
    ctx.stroke()
    ctx.shadowBlur = 0

    secilenNoktalar.forEach((nokta, i) => {
      const konum = noktaKonumunuHesapla(nokta.satir, nokta.sutun)
      const renk = i === secilenNoktalar.length - 1 ? '#a855f7' : '#00ffcc'
      ctx.beginPath()
      ctx.arc(konum.x, konum.y, 12, 0, Math.PI * 2)
      ctx.strokeStyle = renk
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(konum.x, konum.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = renk
      ctx.fill()
    })
  }

  useEffect(() => { canvasiCiz() }, [matrixSize, secilenNoktalar])

  return (
    <div className="matris-icerik-sarmalayici">
      <canvas ref={canvasRef} width={canvasBoyutu} height={canvasBoyutu} onClick={canvasaTiklandi}></canvas>
      <div className="matris-footer">
        <button className="matris-alt-btn" onClick={geriAl}>↩ Geri Al</button>
        <div className="matris-durum-metni">
          <span className="sayi-vurgu">{secilenNoktalar.length}</span> Nokta Bağlandı
        </div>
        <button className="matris-alt-btn temizle" onClick={temizle}>🗑 Temizle</button>
      </div>
    </div>
  )
}

export default CizimMatrisi
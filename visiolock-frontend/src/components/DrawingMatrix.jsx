import { useState, useRef, useEffect, useMemo } from 'react'

function DrawingMatrix({ matrixSize, onDrawingChange }) {
  const canvasRef = useRef(null)
  const isDraggingRef = useRef(false)
  const [selectedPoints, setSelectedPoints] = useState([])
  const [dragPosition, setDragPosition] = useState(null)

  const canvasSize = 400
  const edgePadding = 40

  function calculatePointPosition(row, col) {
    const availableSpace = canvasSize - edgePadding - edgePadding
    const spacing = availableSpace / (matrixSize - 1)
    return { x: edgePadding + col * spacing, y: edgePadding + row * spacing }
  }

  function generateAllPoints() {
    const list = []
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        list.push({ id: row + '-' + col, row, col })
      }
    }
    return list
  }

  const allPoints = useMemo(() => generateAllPoints(), [matrixSize])

  function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  }

  function findNearestPoint(x, y) {
    for (const point of allPoints) {
      const position = calculatePointPosition(point.row, point.col)
      if (distanceBetweenPoints(x, y, position.x, position.y) < 24) return point
    }
    return null
  }

  function isPointAlreadySelected(point) {
    return selectedPoints.some(n => n.id === point.id)
  }

  function getCanvasPosition(clientX, clientY) {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function addPoint(point) {
    if (!point) return
    setSelectedPoints(prev => prev.some(p => p.id === point.id) ? prev : prev.concat([point]))
  }

  // Fareyi/parmağı basılı tutup sürükleyerek noktaları hızlıca birleştirme
  function handlePointerDown(e) {
    e.preventDefault()
    canvasRef.current.setPointerCapture(e.pointerId)
    isDraggingRef.current = true
    const position = getCanvasPosition(e.clientX, e.clientY)
    setDragPosition(position)
    addPoint(findNearestPoint(position.x, position.y))
  }

  function handlePointerMove(e) {
    if (!isDraggingRef.current) return
    const position = getCanvasPosition(e.clientX, e.clientY)
    setDragPosition(position)
    addPoint(findNearestPoint(position.x, position.y))
  }

  function handlePointerUp(e) {
    isDraggingRef.current = false
    setDragPosition(null)
    try { canvasRef.current.releasePointerCapture(e.pointerId) } catch (err) { /* zaten serbest */ }
  }

  function clearAll() {
    setSelectedPoints([])
  }

  function undoLast() {
    setSelectedPoints(prev => prev.slice(0, -1))
  }

  // selectedPoints her değiştiğinde üst bileşene tek noktadan bildir
  useEffect(() => {
    onDrawingChange(selectedPoints)
  }, [selectedPoints])

  function drawCanvas() {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    for (const point of allPoints) {
      const position = calculatePointPosition(point.row, point.col)
      ctx.beginPath()
      ctx.arc(position.x, position.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.fill()
    }

    if (selectedPoints.length === 0) return

    ctx.beginPath()
    const firstPosition = calculatePointPosition(selectedPoints[0].row, selectedPoints[0].col)
    ctx.moveTo(firstPosition.x, firstPosition.y)
    for (let i = 1; i < selectedPoints.length; i++) {
      const position = calculatePointPosition(selectedPoints[i].row, selectedPoints[i].col)
      ctx.lineTo(position.x, position.y)
    }
    // Sürükleme sırasında son noktadan imlece kadar canlı çizgi
    if (isDraggingRef.current && dragPosition) {
      ctx.lineTo(dragPosition.x, dragPosition.y)
    }
    ctx.strokeStyle = '#00ffcc'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowBlur = 4
    ctx.shadowColor = '#00ffcc'
    ctx.stroke()
    ctx.shadowBlur = 0

    selectedPoints.forEach((point, i) => {
      const position = calculatePointPosition(point.row, point.col)
      const color = i === selectedPoints.length - 1 ? '#a855f7' : '#00ffcc'
      ctx.beginPath()
      ctx.arc(position.x, position.y, 12, 0, Math.PI * 2)
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(position.x, position.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })
  }

  useEffect(() => { drawCanvas() }, [matrixSize, selectedPoints, dragPosition])

  return (
    <div className="matris-icerik-sarmalayici">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{ touchAction: 'none', cursor: 'pointer' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      ></canvas>
      <div className="matris-footer">
        <button className="matris-alt-btn" onClick={undoLast}>↩ Geri Al</button>
        <div className="matris-durum-metni">
          <span className="sayi-vurgu">{selectedPoints.length}</span> Nokta Bağlandı
        </div>
        <button className="matris-alt-btn temizle" onClick={clearAll}>🗑 Temizle</button>
      </div>
    </div>
  )
}

export default DrawingMatrix

export function cizimYoluMetneCevir(cizimYolu) {
  return cizimYolu.map(nokta => `${nokta.satir},${nokta.sutun}`).join('|')
}

export async function sha256Hesapla(metin) {
  const encoder = new TextEncoder()
  const veri = encoder.encode(metin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', veri)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function hashiSifreyeCevir(hashHex, uzunluk = 16) {
  const kucukHarfler = 'abcdefghijklmnopqrstuvwxyz'
  const buyukHarfler = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const sayilar = '0123456789'
  const semboller = '!@#$%^&*'
  const tumKarakterler = kucukHarfler + buyukHarfler + sayilar + semboller

  let sifre = ''
  for (let i = 0; i < uzunluk; i++) {
    const hexCift = hashHex.substr((i * 2) % hashHex.length, 2)
    const sayiDegeri = parseInt(hexCift, 16)
    sifre += tumKarakterler[sayiDegeri % tumKarakterler.length]
  }

  sifre = buyukHarfler[parseInt(hashHex.substr(0, 2), 16) % buyukHarfler.length] +
          sayilar[parseInt(hashHex.substr(2, 2), 16) % sayilar.length] +
          semboller[parseInt(hashHex.substr(4, 2), 16) % semboller.length] +
          sifre.substr(3)

  return sifre
}

export async function cizimdenSifreUret(hizmetAdi, cizimYolu, matrixSize) {
  const cizimMetni = cizimYoluMetneCevir(cizimYolu)
  const tohumMetin = `${hizmetAdi.toLowerCase()}:${cizimMetni}:${matrixSize}`
  const hash = await sha256Hesapla(tohumMetin)
  return hashiSifreyeCevir(hash, 16)
}
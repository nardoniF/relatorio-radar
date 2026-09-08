/**
 * Alertas: sirene + voz "Baixa a velocidade para X".
 * Distância configurável (default 300 m).
 *
 * iOS Safari/PWA: só libera HTMLAudio + AudioContext no gesto do usuário.
 * Ordem crítica: desbloquear com áudio LOCAL (data-URI) ANTES de qualquer
 * await de rede; NÃO pausar o elemento de TTS depois do unlock.
 */

const STORAGE_KEY = 'radar_alert_distance_m'

/** MP3 silencioso curto — unlock confiável no iOS sem rede. */
const SILENT_MP3 =
  'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAAA8TEFNRTMuMTAwBLgAAAAAAAAAABUgJAUHQQAB9gAAAnGRqtmyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

let audioCtx: AudioContext | null = null
let unlocked = false
let voiceArmed = false
let lastSpokenRadarId: string | null = null
let lastSirenAt = 0
let alertDistanceM = loadDistance()
let ttsAudio: HTMLAudioElement | null = null
let keepAliveAudio: HTMLAudioElement | null = null
let speaking = false

function loadDistance(): number {
  const raw = localStorage.getItem(STORAGE_KEY)
  const n = raw ? Number(raw) : 300
  return Number.isFinite(n) ? Math.min(1000, Math.max(50, n)) : 300
}

export function getAlertDistanceM(): number {
  return alertDistanceM
}

export function setAlertDistanceM(m: number): void {
  alertDistanceM = Math.min(1000, Math.max(50, Math.round(m)))
  localStorage.setItem(STORAGE_KEY, String(alertDistanceM))
}

function getCtx(): AudioContext {
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    audioCtx = new AC()
  }
  return audioCtx
}

function ensureTtsAudio(): HTMLAudioElement {
  if (!ttsAudio) {
    ttsAudio = new Audio()
    ttsAudio.setAttribute('playsinline', 'true')
    ttsAudio.setAttribute('webkit-playsinline', 'true')
    ttsAudio.preload = 'auto'
    // iOS: volume > 0 no gesto ajuda a manter a sessão de áudio
    ttsAudio.volume = 1
  }
  return ttsAudio
}

function ensureKeepAlive(): HTMLAudioElement {
  if (!keepAliveAudio) {
    keepAliveAudio = new Audio(SILENT_MP3)
    keepAliveAudio.setAttribute('playsinline', 'true')
    keepAliveAudio.loop = true
    keepAliveAudio.volume = 0.01
    keepAliveAudio.preload = 'auto'
  }
  return keepAliveAudio
}

function ttsUrl(text: string): string {
  return (
    'https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=pt-BR&q=' +
    encodeURIComponent(text)
  )
}

function playBeep(): void {
  const c = getCtx()
  const t0 = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + 0.13)
}

/**
 * OBRIGATÓRIO no click de Simular/GPS/Testar (mesmo gesto do usuário).
 * Sem isso o iPhone bloqueia fala espontânea.
 */
export async function armVoiceOnUserGesture(): Promise<void> {
  const c = getCtx()
  // resume() síncrono no início do gesto — não esperar rede antes
  try {
    if (c.state === 'suspended') {
      const p = c.resume()
      // Não bloqueia o unlock local se resume demorar
      void p
    }
  } catch {
    /* ignore */
  }

  playBeep()

  // 1) Unlock HTMLAudio com MP3 local — SEM rede (gesto ainda válido)
  const audio = ensureTtsAudio()
  try {
    audio.pause()
    audio.src = SILENT_MP3
    audio.currentTime = 0
    await audio.play()
  } catch {
    /* ignore */
  }

  // 2) Keep-alive silencioso em loop — evita o iOS “dormir” a sessão
  try {
    const keep = ensureKeepAlive()
    keep.currentTime = 0
    await keep.play()
  } catch {
    /* ignore */
  }

  unlocked = true
  voiceArmed = true

  // Confirmação falada em paralelo — não atrasa o início da viagem
  void speakText('Monitoramento iniciado')
}

/** @deprecated use armVoiceOnUserGesture */
export async function unlockAudio(): Promise<void> {
  await armVoiceOnUserGesture()
}

export function playSiren(durationSec = 1.5, force = false): void {
  if (!unlocked && !force) return
  const now = Date.now()
  if (!force && now - lastSirenAt < 2200) return
  lastSirenAt = now

  const c = getCtx()
  if (c.state === 'suspended') void c.resume()

  const t0 = c.currentTime
  const master = c.createGain()
  master.gain.setValueAtTime(0.0001, t0)
  master.gain.exponentialRampToValueAtTime(0.38, t0 + 0.04)
  master.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec)
  master.connect(c.destination)

  const oscA = c.createOscillator()
  const oscB = c.createOscillator()
  oscA.type = 'square'
  oscB.type = 'sawtooth'
  oscA.frequency.setValueAtTime(740, t0)
  oscA.frequency.linearRampToValueAtTime(1100, t0 + 0.35)
  oscA.frequency.linearRampToValueAtTime(740, t0 + 0.7)
  oscA.frequency.linearRampToValueAtTime(1100, t0 + 1.05)
  oscB.frequency.setValueAtTime(520, t0)

  const gA = c.createGain()
  const gB = c.createGain()
  gA.gain.value = 0.55
  gB.gain.value = 0.25
  oscA.connect(gA)
  oscB.connect(gB)
  gA.connect(master)
  gB.connect(master)
  oscA.start(t0)
  oscB.start(t0)
  oscA.stop(t0 + durationSec)
  oscB.stop(t0 + durationSec)
}

function phrase(limitKmh: number): string {
  return `Baixa a velocidade para ${Math.round(limitKmh)} quilômetros por hora`
}

function waitEnded(audio: HTMLAudioElement, timeoutMs = 12000): Promise<void> {
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      audio.removeEventListener('ended', finish)
      audio.removeEventListener('error', finish)
      resolve()
    }
    audio.addEventListener('ended', finish)
    audio.addEventListener('error', finish)
    window.setTimeout(finish, timeoutMs)
  })
}

async function speakText(text: string): Promise<boolean> {
  if (speaking) {
    try {
      ensureTtsAudio().pause()
    } catch {
      /* ignore */
    }
  }
  speaking = true
  const audio = ensureTtsAudio()

  // Preferência: HTMLAudio (desbloqueado no gesto) — speechSynthesis no iOS
  // costuma falhar fora do toque.
  try {
    audio.pause()
    audio.src = ttsUrl(text)
    audio.load()
    audio.currentTime = 0
    const playPromise = audio.play()
    await playPromise
    await waitEnded(audio)
    speaking = false
    return true
  } catch {
    /* cai para speechSynthesis */
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'pt-BR'
      u.rate = 0.95
      u.volume = 1
      const voices = window.speechSynthesis.getVoices()
      const pt =
        voices.find((v) => /pt-BR/i.test(v.lang)) ||
        voices.find((v) => /^pt/i.test(v.lang))
      if (pt) u.voice = pt
      await new Promise<void>((resolve) => {
        u.onend = () => resolve()
        u.onerror = () => resolve()
        window.speechSynthesis.speak(u)
        window.setTimeout(resolve, 8000)
      })
      speaking = false
      return true
    } catch {
      speaking = false
      return false
    }
  }

  speaking = false
  return false
}

async function speakViaAudio(limitKmh: number): Promise<boolean> {
  return speakText(phrase(limitKmh))
}

function speakNative(limitKmh: number): boolean {
  if (!('speechSynthesis' in window)) return false
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(phrase(limitKmh))
    u.lang = 'pt-BR'
    u.rate = 0.95
    u.volume = 1
    const voices = window.speechSynthesis.getVoices()
    const pt =
      voices.find((v) => /pt-BR/i.test(v.lang)) ||
      voices.find((v) => /^pt/i.test(v.lang))
    if (pt) u.voice = pt
    window.speechSynthesis.speak(u)
    return true
  } catch {
    return false
  }
}

export async function speakSlowDown(
  limitKmh: number,
  force = false,
): Promise<void> {
  if (!voiceArmed && !force) return
  // Reativa contexto se o iOS suspendeu em background
  try {
    const c = getCtx()
    if (c.state === 'suspended') await c.resume()
  } catch {
    /* ignore */
  }
  try {
    const keep = ensureKeepAlive()
    if (keep.paused) void keep.play()
  } catch {
    /* ignore */
  }
  const ok = await speakViaAudio(limitKmh)
  if (!ok) speakNative(limitKmh)
}

/** Passou o radar acima do limite. */
export async function speakFined(force = false): Promise<void> {
  if (!voiceArmed && !force) return
  playSiren(1.8, true)
  await speakText('Você foi multado')
}

export async function testAlertNow(limitKmh = 60): Promise<void> {
  await armVoiceOnUserGesture()
  playSiren(1.6, true)
  await new Promise((r) => setTimeout(r, 700))
  await speakSlowDown(limitKmh, true)
}

export function handleRadarAlertAudio(
  alert: {
    radar: { id: string; limitKmh: number }
    distanceM: number
  } | null,
  mySpeedKmh: number,
): void {
  if (!alert || !voiceArmed) return
  if (alert.distanceM > alertDistanceM) return

  if (mySpeedKmh > alert.radar.limitKmh + 0.5) {
    playSiren(1.5)
  }

  if (lastSpokenRadarId !== alert.radar.id) {
    lastSpokenRadarId = alert.radar.id
    void speakSlowDown(alert.radar.limitKmh)
  }
}

/**
 * Limpa estado da viagem (radares falados).
 * NÃO pausa o HTMLAudio de TTS nem desarma a voz — isso quebrava o unlock do iOS.
 */
export function resetAlertAudio(): void {
  lastSpokenRadarId = null
  lastSirenAt = 0
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
  }
}

/** Para keep-alive ao finalizar viagem (opcional). */
export function stopVoiceKeepAlive(): void {
  try {
    keepAliveAudio?.pause()
  } catch {
    /* ignore */
  }
}

export function isAudioUnlocked(): boolean {
  return unlocked && voiceArmed
}

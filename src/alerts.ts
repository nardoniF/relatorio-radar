/**
 * Alertas: sirene + voz "Baixa a velocidade para X".
 * Dispara só quando distância ≤ alertDistanceM (default 300).
 * iOS: unlock no toque; fala com speechSynthesis + fallback em áudio TTS.
 */

const STORAGE_KEY = 'radar_alert_distance_m'

let audioCtx: AudioContext | null = null
let unlocked = false
let lastSpokenRadarId: string | null = null
let lastSirenAt = 0
let alertDistanceM = loadDistance()
let ttsAudio: HTMLAudioElement | null = null

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

export async function unlockAudio(): Promise<void> {
  const c = getCtx()
  try {
    if (c.state === 'suspended') await c.resume()
  } catch {
    /* ignore */
  }

  const t0 = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + 0.16)

  unlocked = true

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
      const warm = new SpeechSynthesisUtterance(' ')
      warm.volume = 0.01
      warm.rate = 1
      warm.lang = 'pt-BR'
      window.speechSynthesis.speak(warm)
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    } catch {
      /* ignore */
    }
  }

  // Pré-cria elemento de áudio (iOS)
  if (!ttsAudio) {
    ttsAudio = new Audio()
    ttsAudio.setAttribute('playsinline', 'true')
  }
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

function pickPtBrVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices?.() ?? []
  return (
    voices.find((v) => /pt-BR/i.test(v.lang)) ||
    voices.find((v) => /portuguese/i.test(v.name)) ||
    voices.find((v) => /^pt/i.test(v.lang)) ||
    null
  )
}

function speakNative(limitKmh: number): boolean {
  if (!('speechSynthesis' in window)) return false
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(phrase(limitKmh))
    u.lang = 'pt-BR'
    u.rate = 0.95
    u.pitch = 1
    u.volume = 1
    const voice = pickPtBrVoice()
    if (voice) u.voice = voice
    window.speechSynthesis.resume()
    window.speechSynthesis.speak(u)
    window.setTimeout(() => {
      try {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      } catch {
        /* ignore */
      }
    }, 60)
    return true
  } catch {
    return false
  }
}

/** Fallback TTS via áudio (mais confiável em alguns iPhones). */
async function speakViaAudio(limitKmh: number): Promise<void> {
  const text = phrase(limitKmh)
  const url =
    'https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=pt-BR&q=' +
    encodeURIComponent(text)
  try {
    if (!ttsAudio) {
      ttsAudio = new Audio()
      ttsAudio.setAttribute('playsinline', 'true')
    }
    ttsAudio.pause()
    ttsAudio.src = url
    ttsAudio.currentTime = 0
    await ttsAudio.play()
  } catch {
    // último recurso: native de novo
    speakNative(limitKmh)
  }
}

export async function speakSlowDown(
  limitKmh: number,
  force = false,
): Promise<void> {
  if (!unlocked && !force) return
  const ok = speakNative(limitKmh)
  // No iPhone, native às vezes “aceita” mas não sai som — reforça com TTS áudio
  if (force || !ok) {
    await speakViaAudio(limitKmh)
  } else {
    // Reforço após 700ms se ainda “falando” não for audível o suficiente
    window.setTimeout(() => {
      void speakViaAudio(limitKmh)
    }, 900)
  }
}

export async function testAlertNow(limitKmh = 60): Promise<void> {
  await unlockAudio()
  playSiren(1.6, true)
  await speakSlowDown(limitKmh, true)
}

/**
 * Sirene + voz só quando distanceM ≤ alertDistanceM.
 * Uma fala por radar (até reset).
 */
export function handleRadarAlertAudio(
  alert: {
    radar: { id: string; limitKmh: number }
    distanceM: number
  } | null,
  mySpeedKmh: number,
): void {
  if (!alert || !unlocked) return
  if (alert.distanceM > alertDistanceM) return

  // Sirene se ainda acima do limite; se já reduziu, não fica gritanto
  if (mySpeedKmh > alert.radar.limitKmh + 0.5) {
    playSiren(1.5)
  }

  if (lastSpokenRadarId !== alert.radar.id) {
    lastSpokenRadarId = alert.radar.id
    void speakSlowDown(alert.radar.limitKmh)
  }
}

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
  try {
    ttsAudio?.pause()
  } catch {
    /* ignore */
  }
}

export function isAudioUnlocked(): boolean {
  return unlocked
}

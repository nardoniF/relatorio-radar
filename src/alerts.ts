/**
 * Alertas sonoros para Safari/iPhone.
 * iOS: áudio/voz só liberam após toque do usuário.
 * Importante: speechSynthesis no iPhone quebra se chamado só dentro de setTimeout longo.
 */

type AlertLevel = 'far' | 'near' | 'imminent'

let audioCtx: AudioContext | null = null
let unlocked = false
let lastSpokenKey: string | null = null
let lastSirenAt = 0
let lastVoiceAt = 0

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

  // Bip audível no unlock — confirma que o som do iPhone está liberado
  const t0 = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + 0.2)

  unlocked = true
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices()
    // Alguns iOS só listam vozes após este evento
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices()
    }
  }
}

export function playSiren(durationSec = 1.6, force = false): void {
  if (!unlocked && !force) return
  const now = Date.now()
  if (!force && now - lastSirenAt < 1800) return
  lastSirenAt = now

  const c = getCtx()
  if (c.state === 'suspended') void c.resume()

  const t0 = c.currentTime
  const master = c.createGain()
  master.gain.setValueAtTime(0.0001, t0)
  master.gain.exponentialRampToValueAtTime(0.35, t0 + 0.04)
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
  oscA.frequency.linearRampToValueAtTime(740, t0 + 1.4)
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

function pickPtBrVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices?.() ?? []
  return (
    voices.find((v) => /pt-BR/i.test(v.lang)) ||
    voices.find((v) => /portuguese/i.test(v.name)) ||
    voices.find((v) => /^pt/i.test(v.lang)) ||
    null
  )
}

export function speakSlowDown(limitKmh: number, force = false): void {
  if (!('speechSynthesis' in window)) return
  if (!unlocked && !force) return
  const now = Date.now()
  if (!force && now - lastVoiceAt < 3500) return
  lastVoiceAt = now

  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }

  const text = `Atenção. Radar à frente. Diminua para ${Math.round(limitKmh)} quilômetros por hora.`
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'pt-BR'
  u.rate = 1
  u.pitch = 1
  u.volume = 1
  const voice = pickPtBrVoice()
  if (voice) u.voice = voice

  // iOS: às vezes precisa de um “kick” resume
  try {
    window.speechSynthesis.resume()
  } catch {
    /* ignore */
  }
  window.speechSynthesis.speak(u)

  // Workaround iOS pause bug
  window.setTimeout(() => {
    try {
      window.speechSynthesis.pause()
      window.speechSynthesis.resume()
    } catch {
      /* ignore */
    }
  }, 40)
}

/** Botão "Testar alerta" — deve rodar no handler de click (gesto iOS). */
export async function testAlertNow(limitKmh = 60): Promise<void> {
  await unlockAudio()
  playSiren(1.8, true)
  // Voz no mesmo gesto do usuário (crítico no iPhone)
  speakSlowDown(limitKmh, true)
}

export function handleRadarAlertAudio(alert: {
  radar: { id: string; limitKmh: number }
  level: AlertLevel
  distanceM: number
} | null): void {
  if (!alert) return
  if (!unlocked) return

  const key = `${alert.radar.id}:${alert.level}`

  if (alert.level === 'far' || alert.level === 'near' || alert.level === 'imminent') {
    playSiren(alert.level === 'imminent' ? 1.8 : 1.3)
  }

  // Fala uma vez por radar (nível near/imminent). Sem delay longo (quebra no iOS).
  if (
    (alert.level === 'near' || alert.level === 'imminent') &&
    lastSpokenKey !== alert.radar.id
  ) {
    lastSpokenKey = alert.radar.id
    speakSlowDown(alert.radar.limitKmh)
  }

  void key
}

export function resetAlertAudio(): void {
  lastSpokenKey = null
  lastSirenAt = 0
  lastVoiceAt = 0
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
  }
}

export function isAudioUnlocked(): boolean {
  return unlocked
}

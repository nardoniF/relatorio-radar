/**
 * Alertas sonoros para Safari/iPhone:
 * - sirene (Web Audio, sem arquivo externo)
 * - voz PT-BR: "Diminua para X quilômetros por hora"
 *
 * iOS exige gesto do usuário antes do áudio — chame unlock() no toque de Iniciar.
 */

type AlertLevel = 'far' | 'near' | 'imminent'

let audioCtx: AudioContext | null = null
let unlocked = false
let lastSpokenRadarId: string | null = null
let lastSirenAt = 0
let lastVoiceAt = 0
let speaking = false

function ctx(): AudioContext {
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    audioCtx = new AC()
  }
  return audioCtx
}

/** Liberar áudio no primeiro toque (obrigatório no iPhone). */
export async function unlockAudio(): Promise<void> {
  const c = ctx()
  if (c.state === 'suspended') {
    try {
      await c.resume()
    } catch {
      /* ignore */
    }
  }
  // bip curto silencioso/quase inaudível para “acordar” o contexto
  const osc = c.createOscillator()
  const gain = c.createGain()
  gain.gain.value = 0.001
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + 0.05)
  unlocked = true

  // Pré-aquece vozes no Safari
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices()
  }
}

export function playSiren(durationSec = 1.4): void {
  if (!unlocked) return
  const now = Date.now()
  if (now - lastSirenAt < 2500) return
  lastSirenAt = now

  const c = ctx()
  if (c.state === 'suspended') void c.resume()

  const t0 = c.currentTime
  const master = c.createGain()
  master.gain.setValueAtTime(0.0001, t0)
  master.gain.exponentialRampToValueAtTime(0.22, t0 + 0.05)
  master.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec)
  master.connect(c.destination)

  // Duas frequências alternando ≈ sirene
  const oscA = c.createOscillator()
  const oscB = c.createOscillator()
  oscA.type = 'sawtooth'
  oscB.type = 'sawtooth'
  oscA.frequency.setValueAtTime(680, t0)
  oscB.frequency.setValueAtTime(920, t0)

  const gA = c.createGain()
  const gB = c.createGain()
  gA.gain.value = 0.5
  gB.gain.value = 0.5

  // LFO de pan/volume entre as duas
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.value = 3.2
  lfoGain.gain.value = 0.45
  lfo.connect(lfoGain)
  lfoGain.connect(gA.gain)
  // invertido aproximado em B
  const inv = c.createGain()
  inv.gain.value = -1
  lfoGain.connect(inv)
  inv.connect(gB.gain)

  oscA.connect(gA)
  oscB.connect(gB)
  gA.connect(master)
  gB.connect(master)

  oscA.start(t0)
  oscB.start(t0)
  lfo.start(t0)
  oscA.stop(t0 + durationSec)
  oscB.stop(t0 + durationSec)
  lfo.stop(t0 + durationSec)
}

function pickPtBrVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices?.() ?? []
  return (
    voices.find((v) => /pt-BR/i.test(v.lang)) ||
    voices.find((v) => /^pt/i.test(v.lang)) ||
    null
  )
}

export function speakSlowDown(limitKmh: number): void {
  if (!unlocked || !('speechSynthesis' in window)) return
  const now = Date.now()
  if (now - lastVoiceAt < 4000 || speaking) return
  lastVoiceAt = now

  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(
    `Atenção. Radar à frente. Diminua para ${Math.round(limitKmh)} quilômetros por hora.`,
  )
  u.lang = 'pt-BR'
  u.rate = 1.05
  u.pitch = 1
  u.volume = 1
  const voice = pickPtBrVoice()
  if (voice) u.voice = voice

  speaking = true
  u.onend = () => {
    speaking = false
  }
  u.onerror = () => {
    speaking = false
  }
  window.speechSynthesis.speak(u)
}

/**
 * Dispara sirene + voz conforme o nível do alerta.
 * Evita repetir a cada frame GPS.
 */
export function handleRadarAlertAudio(alert: {
  radar: { id: string; limitKmh: number }
  level: AlertLevel
  distanceM: number
} | null): void {
  if (!alert) {
    lastSpokenRadarId = null
    return
  }

  // Sirene a partir de "near"; mais urgente em "imminent"
  if (alert.level === 'near' || alert.level === 'imminent') {
    playSiren(alert.level === 'imminent' ? 1.8 : 1.2)
  }

  // Voz uma vez por radar (ou de novo se ficou longe e voltou)
  if (
    (alert.level === 'near' || alert.level === 'imminent') &&
    lastSpokenRadarId !== alert.radar.id
  ) {
    lastSpokenRadarId = alert.radar.id
    // Pequeno atraso para a sirene começar antes da voz
    window.setTimeout(() => speakSlowDown(alert.radar.limitKmh), 450)
  }
}

export function resetAlertAudio(): void {
  lastSpokenRadarId = null
  lastSirenAt = 0
  lastVoiceAt = 0
  speaking = false
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

/**
 * Alertas: sirene + voz "Baixa a velocidade para X".
 *
 * POR QUE a voz remota falhava no iPhone:
 * Google Translate TTS devolve 404 no Safari iOS → play() falha →
 * speechSynthesis só fala DENTRO do gesto do toque (por isso o Testar
 * “funcionava” e o alerta espontâneo não).
 *
 * Solução: MP3 locais em /voice/ (mesmo origem). Desbloqueia no toque
 * de Simular/GPS tocando um arquivo local; depois o iOS deixa tocar os outros.
 */

const STORAGE_KEY = 'radar_alert_distance_m'

const LIMITS = [40, 50, 60, 70, 80, 90, 100, 110, 120] as const

let audioCtx: AudioContext | null = null
let unlocked = false
let voiceArmed = false
let lastSpokenRadarId: string | null = null
let lastSlowDownAt = 0
let lastSirenAt = 0
let alertDistanceM = loadDistance()
let ttsAudio: HTMLAudioElement | null = null
let keepAliveAudio: HTMLAudioElement | null = null
let speaking = false
const preloaded = new Map<string, HTMLAudioElement>()

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

function baseUrl(): string {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

function voiceUrl(file: string): string {
  return `${baseUrl()}voice/${file}`
}

function nearestLimit(limitKmh: number): (typeof LIMITS)[number] {
  let best: (typeof LIMITS)[number] = 60
  let bestDiff = Infinity
  for (const n of LIMITS) {
    const d = Math.abs(n - limitKmh)
    if (d < bestDiff) {
      best = n
      bestDiff = d
    }
  }
  return best
}

function clipForSlowDown(limitKmh: number): string {
  return `baixa_${nearestLimit(limitKmh)}.mp3`
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
    ttsAudio.volume = 1
  }
  return ttsAudio
}

function ensureKeepAlive(): HTMLAudioElement {
  if (!keepAliveAudio) {
    keepAliveAudio = new Audio(voiceUrl('silence.mp3'))
    keepAliveAudio.setAttribute('playsinline', 'true')
    keepAliveAudio.loop = true
    keepAliveAudio.volume = 0.01
    keepAliveAudio.preload = 'auto'
  }
  return keepAliveAudio
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

/** Pré-carrega clips locais durante o gesto (iOS libera o buffer). */
function preloadVoiceClips(): void {
  const files = [
    'monitoramento.mp3',
    'multado.mp3',
    ...LIMITS.map((n) => `baixa_${n}.mp3`),
  ]
  for (const file of files) {
    if (preloaded.has(file)) continue
    const a = new Audio()
    a.setAttribute('playsinline', 'true')
    a.preload = 'auto'
    a.src = voiceUrl(file)
    try {
      a.load()
    } catch {
      /* ignore */
    }
    preloaded.set(file, a)
  }
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

async function playLocalClip(file: string): Promise<boolean> {
  const audio = ensureTtsAudio()
  speaking = true
  try {
    // Garante sessão ativa
    try {
      const c = getCtx()
      if (c.state === 'suspended') await c.resume()
    } catch {
      /* ignore */
    }

    audio.pause()
    audio.src = voiceUrl(file)
    audio.load()
    audio.currentTime = 0
    await audio.play()
    await waitEnded(audio)
    speaking = false
    return true
  } catch {
    speaking = false
    return false
  }
}

/**
 * OBRIGATÓRIO no click de Simular/GPS/Testar (mesmo gesto do usuário).
 */
export async function armVoiceOnUserGesture(): Promise<void> {
  const c = getCtx()
  try {
    if (c.state === 'suspended') void c.resume()
  } catch {
    /* ignore */
  }

  playBeep()
  preloadVoiceClips()

  // Unlock tocando áudio LOCAL no mesmo gesto — não depende de Google TTS
  const ok = await playLocalClip('monitoramento.mp3')
  if (!ok) {
    // Última tentativa: speechSynthesis só vale AQUI (dentro do gesto)
    try {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('Monitoramento iniciado')
        u.lang = 'pt-BR'
        u.volume = 1
        window.speechSynthesis.speak(u)
      }
    } catch {
      /* ignore */
    }
  }

  try {
    const keep = ensureKeepAlive()
    keep.currentTime = 0
    await keep.play()
  } catch {
    /* ignore */
  }

  unlocked = true
  voiceArmed = true
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

export async function speakSlowDown(
  limitKmh: number,
  force = false,
): Promise<void> {
  if (!voiceArmed && !force) return
  if (speaking && !force) return
  lastSlowDownAt = Date.now()
  await playLocalClip(clipForSlowDown(limitKmh))
}

/** Passou o radar acima do limite. */
export async function speakFined(force = false): Promise<void> {
  if (!voiceArmed && !force) return
  playSiren(1.8, true)
  await playLocalClip('multado.mp3')
}

export async function testAlertNow(limitKmh = 60): Promise<void> {
  await armVoiceOnUserGesture()
  playSiren(1.6, true)
  await new Promise((r) => setTimeout(r, 500))
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

  const over = mySpeedKmh > alert.radar.limitKmh + 0.5
  if (over) playSiren(1.5)

  const now = Date.now()
  const firstForRadar = lastSpokenRadarId !== alert.radar.id
  // Repete “baixa a velocidade” enquanto acima do limite (~7 s)
  const shouldRepeat = over && now - lastSlowDownAt > 7000

  if (firstForRadar || shouldRepeat) {
    lastSpokenRadarId = alert.radar.id
    void speakSlowDown(alert.radar.limitKmh)
  }
}

/**
 * Limpa estado da viagem (radares falados).
 * NÃO pausa o HTMLAudio de TTS nem desarma a voz.
 */
export function resetAlertAudio(): void {
  lastSpokenRadarId = null
  lastSirenAt = 0
  lastSlowDownAt = 0
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
  }
}

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

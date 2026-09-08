import './style.css'
import {
  handleRadarAlertAudio,
  resetAlertAudio,
  testAlertNow,
  unlockAudio,
} from './alerts'
import { RADARS } from './data/radars'
import { formatClock, formatDuration, formatKmh } from './geo'
import { GpsEngine } from './gps'
import { RadarTracker } from './radarTracker'
import { buildReport, reportToText } from './report'
import { SimEngine } from './sim'
import type {
  PositionSample,
  RadarAlert,
  RadarPassage,
  TripMode,
  TripReport,
} from './types'

const app = document.querySelector<HTMLDivElement>('#app')!

type UiState = {
  mode: TripMode
  startedAt: number | null
  samples: PositionSample[]
  passages: RadarPassage[]
  lastSample: PositionSample | null
  alert: RadarAlert | null
  report: TripReport | null
  status: string
  error: string | null
}

const state: UiState = {
  mode: 'idle',
  startedAt: null,
  samples: [],
  passages: [],
  lastSample: null,
  alert: null,
  report: null,
  status: 'Escolha GPS real ou Simular no sofá.',
  error: null,
}

const tracker = new RadarTracker(RADARS)
let gps: GpsEngine | null = null
let sim: SimEngine | null = null

function render(): void {
  const speed = state.lastSample?.speedKmh ?? 0
  const alertClass = state.alert ? `active-${state.alert.level}` : ''
  const ringClass = state.alert
    ? state.alert.level === 'imminent'
      ? 'alert-imminent'
      : state.alert.level === 'near'
        ? 'alert-near'
        : ''
    : ''

  const running = state.mode !== 'idle' && !state.report
  const showReport = Boolean(state.report)

  app.innerHTML = `
    <div class="shell ${showReport ? 'report-open' : ''}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>GPS, alerta com sirene e voz — “diminua para X km/h” — e relatório ao finalizar.</p>
      </header>

      <section class="speed-stage live-only" aria-live="polite">
        <div class="speed-ring ${ringClass}">
          <div class="speed-inner">
            <div class="speed-value">${formatKmh(speed)}</div>
            <div class="speed-unit">km/h</div>
            <div class="meta-row">
              <div>
                Limite
                <strong>${state.alert ? state.alert.radar.limitKmh : '—'}</strong>
              </div>
              <div>
                Distância
                <strong>${state.alert ? `${Math.round(state.alert.distanceM)} m` : '—'}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="alert-banner live-only ${alertClass}">
        <div class="alert-dot" aria-hidden="true"></div>
        <div class="alert-copy">
          ${
            state.alert
              ? `<strong>${alertTitle(state.alert)}</strong>
                 <span>${state.alert.radar.name} · máx ${state.alert.radar.limitKmh} km/h</span>`
              : `<strong>Sem radar próximo</strong>
                 <span>${running ? 'Monitorando o percurso…' : 'Inicie uma viagem para monitorar.'}</span>`
          }
        </div>
      </div>

      <div class="controls live-only">
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-gps" ${running ? 'disabled' : ''}>
            GPS real
          </button>
          <button type="button" class="btn-secondary" id="btn-sim" ${running && state.mode !== 'sim' ? 'disabled' : ''}>
            Simular no sofá
          </button>
        </div>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-test-sound">
            Testar sirene + voz
          </button>
        </div>

        <div class="sim-panel ${state.mode === 'sim' && !state.report ? 'open' : ''}" id="sim-panel">
          <label>
            Velocidade
            <strong id="sim-speed-label">${sim?.getSpeedKmh() ?? 90} km/h</strong>
          </label>
          <input
            type="range"
            id="sim-speed"
            min="30"
            max="120"
            step="5"
            value="${sim?.getSpeedKmh() ?? 90}"
            ${running ? '' : 'disabled'}
          />
          <label>
            Aceleração do tempo
            <strong id="sim-scale-label">${sim?.getTimeScale() ?? 4}×</strong>
          </label>
          <input
            type="range"
            id="sim-scale"
            min="1"
            max="10"
            step="1"
            value="${sim?.getTimeScale() ?? 4}"
            ${running ? '' : 'disabled'}
          />
        </div>

        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-finish" ${running ? '' : 'disabled'}>
            Finalizar
          </button>
        </div>
      </div>

      <p class="status-line live-only ${state.error ? 'error' : ''}">
        ${state.error ?? state.status}
      </p>
      <p class="status-line live-only" style="opacity:0.55;font-size:0.75rem">áudio v3 · se não ouvir, toque em Testar sirene + voz</p>

      <section class="report ${showReport ? 'open' : ''}" aria-live="polite">
        ${showReport && state.report ? renderReport(state.report) : ''}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `

  bindEvents()
}

function alertTitle(alert: RadarAlert): string {
  if (alert.level === 'imminent') return 'Radar à frente — reduza'
  if (alert.level === 'near') return 'Aproximando do radar'
  return 'Radar no trecho'
}

function renderReport(report: TripReport): string {
  const overs = report.overs.length
  return `
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat">
        <em>Duração</em>
        <strong>${formatDuration(report.durationMs)}</strong>
      </div>
      <div class="stat">
        <em>Vel. máx</em>
        <strong>${formatKmh(report.maxSpeedKmh)} km/h</strong>
      </div>
      <div class="stat">
        <em>Radares passados</em>
        <strong>${report.passages.length}</strong>
      </div>
      <div class="stat">
        <em>Acima do limite</em>
        <strong class="${overs ? 'bad' : 'good'}">${overs}</strong>
      </div>
    </div>

    <ul class="passage-list">
      ${
        report.passages.length === 0
          ? `<li><span class="detail">Nenhuma passagem por radar nesta viagem.</span></li>`
          : report.passages
              .map(
                (p) => `
            <li>
              <span class="tag ${p.overLimit ? 'bad' : 'ok'}">${p.overLimit ? 'Acima do limite' : 'Dentro do limite'}</span>
              <span class="title">${p.radar.name}</span>
              <span class="detail">
                Limite ${p.radar.limitKmh} · passou a ${formatKmh(p.speedKmh)} km/h
                ${p.overLimit ? ` (+${formatKmh(p.excessKmh)})` : ''}
                · ${formatClock(p.passedAt)}
              </span>
            </li>`,
              )
              .join('')
      }
    </ul>

    <div class="btn-row">
      <button type="button" class="btn-secondary" id="btn-copy">Copiar relatório</button>
      <button type="button" class="btn-primary" id="btn-new">Nova viagem</button>
    </div>
  `
}

function bindEvents(): void {
  document.getElementById('btn-gps')?.addEventListener('click', startGps)
  document.getElementById('btn-sim')?.addEventListener('click', startSim)
  document.getElementById('btn-finish')?.addEventListener('click', finalizeTrip)
  document.getElementById('btn-new')?.addEventListener('click', resetTrip)
  document.getElementById('btn-copy')?.addEventListener('click', copyReport)
  document.getElementById('btn-test-sound')?.addEventListener('click', () => {
    void testAlertNow(60).then(() => {
      showToast('Sirene + voz disparados')
      state.status = 'Áudio OK — agora use Simular no sofá'
      const el = document.querySelector('.status-line')
      if (el && !state.error) el.textContent = state.status
    })
  })

  const range = document.getElementById('sim-speed') as HTMLInputElement | null
  range?.addEventListener('input', () => {
    const v = Number(range.value)
    sim?.setSpeedKmh(v)
    const label = document.getElementById('sim-speed-label')
    if (label) label.textContent = `${v} km/h`
    syncSimStatus()
  })

  const scale = document.getElementById('sim-scale') as HTMLInputElement | null
  scale?.addEventListener('input', () => {
    const v = Number(scale.value)
    sim?.setTimeScale(v)
    const label = document.getElementById('sim-scale-label')
    if (label) label.textContent = `${v}×`
    syncSimStatus()
  })
}

function syncSimStatus(): void {
  if (state.mode !== 'sim' || !sim) return
  state.status = `Simulação · ${sim.getSpeedKmh()} km/h · ${sim.getTimeScale()}×`
  const statusEl = document.querySelector('.status-line')
  if (statusEl && !state.error) statusEl.textContent = state.status
}

function stopEngines(): void {
  gps?.stop()
  sim?.stop()
  gps = null
  sim = null
}

function beginTrip(mode: Exclude<TripMode, 'idle'>): void {
  stopEngines()
  tracker.reset()
  state.mode = mode
  state.startedAt = Date.now()
  state.samples = []
  state.passages = []
  state.lastSample = null
  state.alert = null
  state.report = null
  state.error = null
  state.status =
    mode === 'gps' ? 'Iniciando GPS…' : 'Simulação pronta — ajuste a velocidade se quiser.'
  render()
}

function onSample(sample: PositionSample): void {
  state.lastSample = sample
  state.samples.push(sample)
  if (state.samples.length > 5000) state.samples.shift()

  const { alert, newPassage } = tracker.update(sample)
  state.alert = alert
  state.passages = tracker.getPassages()

  // Atualização leve do HUD sem re-render completo (melhor no iPhone)
  updateHud(sample, alert)
  handleRadarAlertAudio(alert)

  if (newPassage) {
    showToast(
      newPassage.overLimit
        ? `${newPassage.radar.name}: ${formatKmh(newPassage.speedKmh)} km/h — acima do limite`
        : `${newPassage.radar.name}: passagem OK`,
      newPassage.overLimit,
    )
  }
}

function updateHud(sample: PositionSample, alert: RadarAlert | null): void {
  const speedEl = document.querySelector('.speed-value')
  if (speedEl) speedEl.textContent = formatKmh(sample.speedKmh)

  const ring = document.querySelector('.speed-ring')
  if (ring) {
    ring.classList.remove('alert-near', 'alert-imminent')
    if (alert?.level === 'near') ring.classList.add('alert-near')
    if (alert?.level === 'imminent') ring.classList.add('alert-imminent')
  }

  const banner = document.querySelector('.alert-banner')
  if (banner) {
    banner.className = `alert-banner live-only ${alert ? `active-${alert.level}` : ''}`
    const copy = banner.querySelector('.alert-copy')
    if (copy) {
      copy.innerHTML = alert
        ? `<strong>${alertTitle(alert)}</strong>
           <span>${alert.radar.name} · máx ${alert.radar.limitKmh} km/h</span>`
        : `<strong>Sem radar próximo</strong>
           <span>Monitorando o percurso…</span>`
    }
  }

  const metas = document.querySelectorAll('.meta-row strong')
  if (metas.length >= 2) {
    metas[0].textContent = alert ? String(alert.radar.limitKmh) : '—'
    metas[1].textContent = alert ? `${Math.round(alert.distanceM)} m` : '—'
  }
}

function startGps(): void {
  void unlockAudio()
  resetAlertAudio()
  beginTrip('gps')
  gps = new GpsEngine({
    onSample,
    onError: (message) => {
      state.error = message
      state.status = message
      const el = document.querySelector('.status-line')
      if (el) {
        el.classList.add('error')
        el.textContent = message
      }
    },
    onStatus: (message) => {
      state.status = message
      state.error = null
      const el = document.querySelector('.status-line')
      if (el) {
        el.classList.remove('error')
        el.textContent = message
      }
    },
  })
  gps.start()
}

function startSim(): void {
  void unlockAudio()
  resetAlertAudio()
  stopEngines()
  tracker.reset()
  state.mode = 'sim'
  state.startedAt = Date.now()
  state.samples = []
  state.passages = []
  state.lastSample = null
  state.alert = null
  state.report = null
  state.error = null
  state.status = 'Simulação · 90 km/h · 4× · áudio ligado'

  sim = new SimEngine({
    onSample,
    onStatus: (message) => {
      state.status = message
      const el = document.querySelector('.status-line')
      if (el && !state.error) el.textContent = message
    },
    onFinished: () => {
      state.status = 'Fim do trecho simulado — toque em Finalizar.'
      const el = document.querySelector('.status-line')
      if (el) el.textContent = state.status
    },
  })
  sim.setSpeedKmh(90)
  sim.setTimeScale(4)
  render()
  sim.start()
}

function finalizeTrip(): void {
  if (state.mode === 'idle' || !state.startedAt) return
  stopEngines()
  resetAlertAudio()

  // Flush approaches still inside pass radius as passages
  if (state.lastSample) {
    // force exit by updating with a far point
    tracker.update({
      ...state.lastSample,
      lat: state.lastSample.lat + 1,
      lng: state.lastSample.lng + 1,
      at: Date.now(),
    })
  }

  const endedAt = Date.now()
  const report = buildReport({
    mode: state.mode === 'sim' ? 'sim' : 'gps',
    startedAt: state.startedAt,
    endedAt,
    samples: state.samples,
    passages: tracker.getPassages(),
  })

  state.report = report
  state.mode = 'idle'
  state.status = 'Relatório pronto.'
  state.alert = null
  render()
}

function resetTrip(): void {
  stopEngines()
  resetAlertAudio()
  tracker.reset()
  state.mode = 'idle'
  state.startedAt = null
  state.samples = []
  state.passages = []
  state.lastSample = null
  state.alert = null
  state.report = null
  state.error = null
  state.status = 'Escolha GPS real ou Simular no sofá.'
  render()
}

async function copyReport(): Promise<void> {
  if (!state.report) return
  const text = reportToText(state.report)
  try {
    await navigator.clipboard.writeText(text)
    showToast('Relatório copiado')
  } catch {
    showToast('Não foi possível copiar', true)
  }
}

function showToast(message: string, bad = false): void {
  const toast = document.getElementById('toast')
  if (!toast) return
  toast.textContent = message
  toast.className = `toast show${bad ? ' bad' : ''}`
  window.setTimeout(() => {
    toast.classList.remove('show')
  }, 2600)
}

render()

import './style.css'
import {
  armVoiceOnUserGesture,
  getAlertDistanceM,
  handleRadarAlertAudio,
  resetAlertAudio,
  setAlertDistanceM,
  speakFined,
  stopVoiceKeepAlive,
  testAlertNow,
} from './alerts'
import { RADARS } from './data/radars'
import {
  getReportEmail,
  isValidEmail,
  openReportEmail,
  setReportEmail,
  shareOrEmailReport,
} from './email'
import { formatClock, formatDuration, formatKmh } from './geo'
import { GpsEngine } from './gps'
import { RadarTracker } from './radarTracker'
import { buildReport, reportToText } from './report'
import { SimEngine } from './sim'
import type {
  PositionSample,
  Radar,
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
  alertDistanceM: number
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
  alertDistanceM: getAlertDistanceM(),
}

const tracker = new RadarTracker(RADARS)
let gps: GpsEngine | null = null
let sim: SimEngine | null = null

function ringState(
  speed: number,
  alert: RadarAlert | null,
): 'idle' | 'over' | 'ok' {
  if (!alert) return 'idle'
  return speed > alert.radar.limitKmh + 0.5 ? 'over' : 'ok'
}

function render(): void {
  const speed = state.lastSample?.speedKmh ?? 0
  const limit = state.alert?.radar.limitKmh ?? null
  const dist = state.alert ? Math.round(state.alert.distanceM) : null
  const ring = ringState(speed, state.alert)
  const running = state.mode !== 'idle' && !state.report
  const showReport = Boolean(state.report)
  const inAlertZone =
    state.alert != null && state.alert.distanceM <= state.alertDistanceM
  const upcoming =
    state.lastSample != null
      ? tracker.upcoming(state.lastSample, 3)
      : RADARS.slice(0, 3).map((radar) => ({ radar, distanceM: NaN }))

  app.innerHTML = `
    <div class="shell ${showReport ? 'report-open' : ''}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>Círculo = limite. Em cima = sua velocidade. Ao lado = próximos 3 radares.</p>
      </header>

      <section class="speed-stage live-only" aria-live="polite">
        <div class="my-speed" id="my-speed">
          <span class="my-speed-label">Sua velocidade</span>
          <strong id="my-speed-value">${formatKmh(speed)}</strong>
          <span class="my-speed-unit">km/h</span>
        </div>

        <div class="stage-row">
          <div class="speed-ring ring-${ring}" id="speed-ring">
            <div class="speed-inner">
              <div class="limit-label">${limit != null ? 'Baixe para' : 'Limite'}</div>
              <div class="speed-value" id="limit-value">${limit != null ? formatKmh(limit) : '—'}</div>
              <div class="speed-unit">km/h</div>
              <div class="dist-line" id="dist-line">
                ${
                  dist != null
                    ? inAlertZone
                      ? `Radar a ${dist} m`
                      : `Radar a ${dist} m · alerta em ${state.alertDistanceM} m`
                    : 'Sem radar próximo'
                }
              </div>
            </div>
          </div>

          <aside class="upcoming" id="upcoming-list">
            <div class="upcoming-title">Próximos</div>
            ${renderUpcoming(upcoming)}
          </aside>
        </div>
      </section>

      <div class="alert-banner live-only ${ring === 'over' ? 'active-imminent' : ring === 'ok' && state.alert ? 'active-far' : ''}">
        <div class="alert-dot" aria-hidden="true"></div>
        <div class="alert-copy">
          ${
            state.alert
              ? `<strong>${ring === 'over' ? 'Acima do limite — reduza' : 'No limite ou abaixo'}</strong>
                 <span>${state.alert.radar.name} · alvo ${state.alert.radar.limitKmh} km/h</span>`
              : `<strong>Sem radar no alcance de alerta</strong>
                 <span>${running ? 'Monitorando…' : 'Inicie uma viagem.'}</span>`
          }
        </div>
      </div>

      <div class="controls live-only">
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-gps" ${running ? 'disabled' : ''}>GPS real</button>
          <button type="button" class="btn-secondary" id="btn-sim" ${running && state.mode !== 'sim' ? 'disabled' : ''}>Simular no sofá</button>
        </div>

        <div class="settings-panel open">
          <label>
            Sirene/voz a partir de
            <strong id="alert-dist-label">${state.alertDistanceM} m</strong>
          </label>
          <input type="range" id="alert-dist" min="100" max="800" step="50" value="${state.alertDistanceM}" />
          <label class="email-label" for="report-email">
            E-mail do relatório
          </label>
          <input
            type="email"
            id="report-email"
            class="email-input"
            placeholder="seu@email.com"
            value="${escapeAttr(getReportEmail())}"
            autocomplete="email"
            inputmode="email"
          />
          <p class="hint">Ao finalizar, o Mail abre com o relatório. Confira e toque em Enviar.</p>
        </div>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-test-sound">Testar voz + sirene</button>
        </div>

        <div class="sim-panel ${state.mode === 'sim' && !state.report ? 'open' : ''}" id="sim-panel">
          <label>
            Vel. simulação
            <strong id="sim-speed-label">${sim?.getSpeedKmh() ?? 90} km/h</strong>
          </label>
          <input type="range" id="sim-speed" min="30" max="120" step="5" value="${sim?.getSpeedKmh() ?? 90}" ${running ? '' : 'disabled'} />
          <label>
            Tempo
            <strong id="sim-scale-label">${sim?.getTimeScale() ?? 4}×</strong>
          </label>
          <input type="range" id="sim-scale" min="1" max="10" step="1" value="${sim?.getTimeScale() ?? 4}" ${running ? '' : 'disabled'} />
        </div>

        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-finish" ${running ? '' : 'disabled'}>Finalizar</button>
        </div>
      </div>

      <p class="status-line live-only ${state.error ? 'error' : ''}">${state.error ?? state.status}</p>

      <section class="report ${showReport ? 'open' : ''}" aria-live="polite">
        ${showReport && state.report ? renderReport(state.report) : ''}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `

  bindEvents()
}

function renderUpcoming(
  items: Array<{ radar: Radar; distanceM: number }>,
): string {
  if (items.length === 0) {
    return `<div class="upcoming-empty">Nenhum à frente</div>`
  }
  return items
    .map((item, i) => {
      const d = Number.isFinite(item.distanceM)
        ? `${Math.round(item.distanceM)} m`
        : '—'
      return `
        <div class="upcoming-item" data-radar="${item.radar.id}">
          <div class="upcoming-rank">${i + 1}</div>
          <div class="upcoming-body">
            <strong>${item.radar.limitKmh}</strong>
            <span>${item.radar.name.replace(/^Radar\s+/i, '')}</span>
          </div>
          <div class="upcoming-dist" data-dist="${item.radar.id}">${d}</div>
        </div>`
    })
    .join('')
}

function renderReport(report: TripReport): string {
  const overs = report.overs.length
  return `
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat"><em>Duração</em><strong>${formatDuration(report.durationMs)}</strong></div>
      <div class="stat"><em>Vel. máx</em><strong>${formatKmh(report.maxSpeedKmh)} km/h</strong></div>
      <div class="stat"><em>Radares</em><strong>${report.passages.length}</strong></div>
      <div class="stat"><em>Acima do limite</em><strong class="${overs ? 'bad' : 'good'}">${overs}</strong></div>
    </div>
    <ul class="passage-list">
      ${
        report.passages.length === 0
          ? `<li><span class="detail">Nenhuma passagem por radar.</span></li>`
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
      <button type="button" class="btn-primary" id="btn-email">Enviar por e-mail</button>
      <button type="button" class="btn-secondary" id="btn-copy">Copiar relatório</button>
    </div>
    <div class="btn-row">
      <button type="button" class="btn-secondary" id="btn-share">Compartilhar</button>
      <button type="button" class="btn-primary" id="btn-new">Nova viagem</button>
    </div>
  `
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function bindEvents(): void {
  document.getElementById('btn-gps')?.addEventListener('click', startGps)
  document.getElementById('btn-sim')?.addEventListener('click', startSim)
  document.getElementById('btn-finish')?.addEventListener('click', finalizeTrip)
  document.getElementById('btn-new')?.addEventListener('click', resetTrip)
  document.getElementById('btn-copy')?.addEventListener('click', copyReport)
  document.getElementById('btn-email')?.addEventListener('click', () => sendReportEmail())
  document.getElementById('btn-share')?.addEventListener('click', () => {
    void shareReport()
  })
  document.getElementById('btn-test-sound')?.addEventListener('click', () => {
    void testAlertNow(60).then(() => showToast('Falou: Baixa a velocidade para 60'))
  })

  const emailInput = document.getElementById('report-email') as HTMLInputElement | null
  emailInput?.addEventListener('change', () => {
    setReportEmail(emailInput.value)
  })
  emailInput?.addEventListener('blur', () => {
    setReportEmail(emailInput.value)
  })

  const dist = document.getElementById('alert-dist') as HTMLInputElement | null
  dist?.addEventListener('input', () => {
    const v = Number(dist.value)
    setAlertDistanceM(v)
    state.alertDistanceM = getAlertDistanceM()
    const label = document.getElementById('alert-dist-label')
    if (label) label.textContent = `${state.alertDistanceM} m`
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
  state.status = mode === 'gps' ? 'GPS…' : 'Simulação…'
  render()
}

function onSample(sample: PositionSample): void {
  state.lastSample = sample
  state.samples.push(sample)
  if (state.samples.length > 5000) state.samples.shift()

  const { alert, newPassage } = tracker.update(sample)
  state.alert = alert
  state.passages = tracker.getPassages()

  updateHud(sample, alert)
  handleRadarAlertAudio(alert, sample.speedKmh)

  if (newPassage) {
    if (newPassage.overLimit) {
      void speakFined()
      showToast(
        `${newPassage.radar.name}: ${formatKmh(newPassage.speedKmh)} km/h — Você foi multado`,
        true,
      )
    } else {
      showToast(`${newPassage.radar.name}: OK`, false)
    }
  }
}

function updateHud(sample: PositionSample, alert: RadarAlert | null): void {
  const speed = sample.speedKmh
  const limit = alert?.radar.limitKmh ?? null
  const dist = alert ? Math.round(alert.distanceM) : null
  const ring = ringState(speed, alert)
  const inAlertZone = alert != null && alert.distanceM <= state.alertDistanceM

  const my = document.getElementById('my-speed-value')
  if (my) my.textContent = formatKmh(speed)

  const limitEl = document.getElementById('limit-value')
  if (limitEl) limitEl.textContent = limit != null ? formatKmh(limit) : '—'

  const ringEl = document.getElementById('speed-ring')
  if (ringEl) ringEl.className = `speed-ring ring-${ring}`

  const distEl = document.getElementById('dist-line')
  if (distEl) {
    distEl.textContent =
      dist != null
        ? inAlertZone
          ? `Radar a ${dist} m`
          : `Radar a ${dist} m · alerta em ${state.alertDistanceM} m`
        : 'Sem radar próximo'
  }

  const label = document.querySelector('.limit-label')
  if (label) label.textContent = limit != null ? 'Baixe para' : 'Limite'

  const banner = document.querySelector('.alert-banner')
  if (banner) {
    banner.className = `alert-banner live-only ${
      ring === 'over' ? 'active-imminent' : ring === 'ok' && alert ? 'active-far' : ''
    }`
    const copy = banner.querySelector('.alert-copy')
    if (copy) {
      copy.innerHTML = alert
        ? `<strong>${ring === 'over' ? 'Acima do limite — reduza' : 'No limite ou abaixo'}</strong>
           <span>${alert.radar.name} · alvo ${alert.radar.limitKmh} km/h</span>`
        : `<strong>Sem radar no alcance de alerta</strong>
           <span>Monitorando…</span>`
    }
  }

  const list = document.getElementById('upcoming-list')
  if (list) {
    const upcoming = tracker.upcoming(sample, 3)
    list.innerHTML = `<div class="upcoming-title">Próximos</div>${renderUpcoming(upcoming)}`
  }
}

async function startGps(): Promise<void> {
  // Reset ANTES do unlock — nunca pausar o TTS depois do gesto
  resetAlertAudio()
  // Mesmo gesto do toque — libera voz espontânea no iPhone
  await armVoiceOnUserGesture()
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

async function startSim(): Promise<void> {
  resetAlertAudio()
  await armVoiceOnUserGesture()
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
  state.status = 'Simulação · voz liberada'
  sim = new SimEngine({
    onSample,
    onStatus: (message) => {
      state.status = message
      const el = document.querySelector('.status-line')
      if (el && !state.error) el.textContent = message
    },
    onFinished: () => {
      state.status = 'Fim do trecho — Finalizar'
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

  // Salva e-mail digitado antes de re-render (campo some no relatório)
  const emailInput = document.getElementById('report-email') as HTMLInputElement | null
  if (emailInput) setReportEmail(emailInput.value)

  stopEngines()
  resetAlertAudio()
  stopVoiceKeepAlive()
  if (state.lastSample) {
    tracker.update({
      ...state.lastSample,
      lat: state.lastSample.lat + 1,
      lng: state.lastSample.lng + 1,
      at: Date.now(),
    })
  }
  const endedAt = Date.now()
  state.report = buildReport({
    mode: state.mode === 'sim' ? 'sim' : 'gps',
    startedAt: state.startedAt,
    endedAt,
    samples: state.samples,
    passages: tracker.getPassages(),
  })
  state.mode = 'idle'
  state.status = 'Relatório pronto.'
  state.alert = null
  render()

  // No mesmo gesto do toque em Finalizar — abre o Mail com o relatório
  sendReportEmail({ auto: true })
}

function sendReportEmail(opts: { auto?: boolean } = {}): void {
  if (!state.report) return
  const email = getReportEmail()
  if (!email) {
    showToast(
      opts.auto
        ? 'Informe o e-mail nas configurações para enviar o relatório'
        : 'Informe o e-mail antes de enviar',
      true,
    )
    return
  }
  if (!isValidEmail(email)) {
    showToast('E-mail inválido', true)
    return
  }
  const ok = openReportEmail(state.report)
  if (ok) {
    showToast(opts.auto ? 'Abrindo Mail com o relatório…' : 'Abrindo Mail…')
  } else {
    showToast('Não foi possível abrir o Mail', true)
  }
}

async function shareReport(): Promise<void> {
  if (!state.report) return
  const result = await shareOrEmailReport(state.report)
  if (result === 'share') showToast('Compartilhado')
  else if (result === 'mailto') showToast('Abrindo Mail…')
  else showToast('Não foi possível compartilhar', true)
}

function resetTrip(): void {
  stopEngines()
  resetAlertAudio()
  stopVoiceKeepAlive()
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
  try {
    await navigator.clipboard.writeText(reportToText(state.report))
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
  window.setTimeout(() => toast.classList.remove('show'), 2600)
}

render()

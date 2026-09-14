import type { TripReport } from './types'
import { reportToText } from './report'

const EMAIL_KEY = 'radar_report_email'

export function getReportEmail(): string {
  return localStorage.getItem(EMAIL_KEY)?.trim() ?? ''
}

export function setReportEmail(email: string): void {
  localStorage.setItem(EMAIL_KEY, email.trim())
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function subjectFor(report: TripReport): string {
  const overs = report.overs.length
  const date = new Date(report.endedAt).toLocaleDateString('pt-BR')
  return overs > 0
    ? `Relatório Radar ${date} — ${overs} acima do limite`
    : `Relatório Radar ${date}`
}

function buildMailto(email: string, subject: string, body: string): string {
  return (
    `mailto:${email}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  )
}

/**
 * Abre o Mail do iPhone com o relatório pronto para enviar.
 * (Página estática no GitHub Pages não envia SMTP sozinha.)
 */
export function openReportEmail(report: TripReport, to?: string): boolean {
  const email = (to ?? getReportEmail()).trim()
  if (!email) return false
  if (!isValidEmail(email)) return false

  const body = reportToText(report)
  const subject = subjectFor(report)
  let mailto = buildMailto(email, subject, body)

  // Limite prático de URL no iOS — relatórios longos são truncados
  if (mailto.length > 1800) {
    const shortBody =
      body.slice(0, 1400) +
      '\n\n…(relatório truncado; use Copiar relatório para o texto completo)'
    mailto = buildMailto(email, subject, shortBody)
  }

  window.location.href = mailto
  return true
}

/** Compartilha via folha do iOS; se cancelar/falhar, tenta mailto. */
export async function shareOrEmailReport(
  report: TripReport,
): Promise<'share' | 'mailto' | 'none'> {
  const text = reportToText(report)
  const title = subjectFor(report)

  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return 'share'
    } catch {
      /* cancelado ou falhou → mailto */
    }
  }

  return openReportEmail(report) ? 'mailto' : 'none'
}

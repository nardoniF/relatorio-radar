from __future__ import annotations

import re
from pathlib import Path

import fitz

HEADING_HINTS = (
    "PETIÇÃO INICIAL",
    "RECLAMAÇÃO TRABALHISTA",
    "CONTESTAÇÃO",
    "RÉPLICA",
    "REPLICA À CONTESTAÇÃO",
    "ATA DE AUDIÊNCIA",
    "LAUDO",
    "LAUDO TÉCNICO PERICIAL",
    "SENTENÇA",
    "ACÓRDÃO",
    "RECURSO ORDINÁRIO",
    "CONTRARRAZÕES",
    "DESPACHO",
    "TRCT",
    "TERMO DE RESCISÃO",
    "RECIBO DE PAGAMENTO",
    "HOLERITE",
    "CONTRACHEQUE",
    "DEMONSTRATIVO DE PAGAMENTO",
)

# Páginas com estes termos entram com prioridade (comprovantes, folha, rescisão).
PAYMENT_KEYWORDS = (
    "TRCT",
    "TERMO DE RESCISÃO",
    "TERMO DE RESCISAO",
    "RECIBO DE PAGAMENTO",
    "RECIBO DE FÉRIAS",
    "RECIBO DE FERIAS",
    "HOLERITE",
    "CONTRACHEQUE",
    "DEMONSTRATIVO DE PAGAMENTO",
    "COMPROVANTE",
    "FÉRIAS GOZADAS",
    "FERIAS GOZADAS",
    "FÉRIAS PAGAS",
    "FERIAS PAGAS",
    "13º SALÁRIO",
    "13 SALARIO",
    "DÉCIMO TERCEIRO",
    "DECIMO TERCEIRO",
    "FGTS",
    "EXTRATO FGTS",
    "GUIA FGTS",
    "GRRF",
    "AVISO PRÉVIO",
    "AVISO PREVIO",
    "VALOR LÍQUIDO",
    "VALOR LIQUIDO",
    "TOTAL PAGO",
    "PAGAMENTO EFETUADO",
    "QUITADO",
    "RECIBO DE HORAS",
    "CARTÃO PONTO",
    "CARTAO PONTO",
    "CONTROLE DE JORNADA",
    "ROMANEIO",
    "DIÁRIA",
    "DIARIA",
    "INTERVALO INTRAJORNADA",
    "HORAS EXTRAS PAGAS",
    "COMPENSAÇÃO",
    "COMPENSACAO",
    "DEDUÇÃO",
    "DEDUCAO",
)

STRONG_DOC_MARKERS = (
    "TRCT",
    "TERMO DE RESCISÃO",
    "RECIBO DE PAGAMENTO",
    "HOLERITE",
    "CONTRACHEQUE",
    "DEMONSTRATIVO DE PAGAMENTO",
    "EXTRATO FGTS",
    "DISPOSITIVO",
    "JULGO PROCEDENTE",
    "JULGO IMPROCEDENTE",
    "CONDENO",
    "DEFIRO",
    "INDEFIRO",
)


def _norm(s: str) -> str:
    return (s or "").upper()


def _score_page(text: str) -> tuple[int, list[str]]:
    u = _norm(text)
    hits = []
    score = 0
    for kw in PAYMENT_KEYWORDS:
        if kw in u:
            hits.append(kw)
            score += 3 if kw in STRONG_DOC_MARKERS else 1
    for hint in HEADING_HINTS:
        if hint in u[:1200]:
            hits.append(hint)
            score += 5
    if "DISPOSITIVO" in u or "JULGO PROCEDENTE" in u or "CONDENO" in u:
        score += 20
    return score, sorted(set(hits))


def extract_cover_meta(doc: fitz.Document) -> dict:
    first = doc[0].get_text() if doc.page_count else ""
    md = doc.metadata or {}
    numero = ""
    m = re.search(r"\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}", first)
    if m:
        numero = m.group(0)
    reclamante = ""
    reclamado = ""
    rm = re.search(r"RECLAMANTE:\s*(.+)", first)
    if rm:
        reclamante = rm.group(1).split("ADVOGADO")[0].strip(" \n;")
    rd = re.search(r"RECLAMADO:\s*(.+)", first)
    if rd:
        reclamado = rd.group(1).split("ADVOGADO")[0].split("PERITO")[0].strip(" \n;")
    if not reclamante and md.get("subject"):
        sm = re.search(r"RECLAMANTE:\s*([^;]+)", md["subject"])
        if sm:
            reclamante = sm.group(1).strip()
        sm = re.search(r"RECLAMADO:\s*([^;]+)", md["subject"])
        if sm:
            reclamado = sm.group(1).strip()
    valor = ""
    vm = re.search(r"Valor da causa:\s*R\$\s*([\d\.\,]+)", first)
    if vm:
        valor = vm.group(1)
    autuacao = ""
    am = re.search(r"Data da Autuação:\s*(\d{2}/\d{2}/\d{4})", first)
    if am:
        autuacao = am.group(1)
    return {
        "numero": numero,
        "reclamante": reclamante or "Reclamante",
        "reclamado": reclamado or "Reclamado",
        "valor_causa": valor,
        "autuacao": autuacao,
        "titulo": md.get("title") or "",
        "paginas": doc.page_count,
    }


def extract_process(pdf_path: Path, max_chars: int | None = None) -> dict:
    doc = fitz.open(pdf_path)
    try:
        meta = extract_cover_meta(doc)
        n_pages = doc.page_count
        # PDFs enormes (1000+ págs): extrato menor — Groq free não aguenta 30k+ tokens
        if max_chars is None:
            if n_pages >= 800:
                max_chars = 80_000
            elif n_pages >= 300:
                max_chars = 160_000
            else:
                max_chars = 350_000

        pages: list[str] = []
        index: list[dict] = []
        page_scores: list[tuple[int, list[str]]] = []

        for i in range(n_pages):
            t = doc[i].get_text() or ""
            pages.append(t)
            sc, hits = _score_page(t)
            page_scores.append((sc, hits))
            head = " ".join(t.split()[:40]).upper()
            for hint in HEADING_HINTS:
                if hint in head or hint in t[:800].upper():
                    index.append({"page": i + 1, "tipo": hint, "marcadores": hits[:8]})
                    break

        compact: list[dict] = []
        for item in index:
            if not compact or compact[-1]["tipo"] != item["tipo"]:
                compact.append(item)

        wanted: set[int] = set()
        big = n_pages >= 400
        huge = n_pages >= 800

        # Inicial (primeiras páginas) — menor em PDF gigante
        for i in range(min(12 if huge else (20 if big else 35), len(pages))):
            wanted.add(i)

        # Sentença, contestação, ata: janela ao redor do índice
        for item in compact:
            p = item["page"] - 1
            if item["tipo"] == "SENTENÇA":
                span = 10 if huge else (14 if big else 18)
            elif item["tipo"] in ("CONTESTAÇÃO", "ATA DE AUDIÊNCIA"):
                span = 6 if huge else (10 if big else 14)
            else:
                span = 4 if huge else (8 if big else 12)
            for j in range(max(0, p), min(len(pages), p + span)):
                wanted.add(j)

        # Comprovantes: em PDF enorme, só os de maior score (não todas as páginas)
        payment_pages: list[dict] = []
        for i, (sc, hits) in enumerate(page_scores):
            if sc >= 3:
                if hits:
                    payment_pages.append({"page": i + 1, "score": sc, "marcadores": hits[:12]})

        payment_pages.sort(key=lambda x: (-x["score"], x["page"]))
        pay_cap = 25 if huge else (50 if big else 200)
        for p in payment_pages[:pay_cap]:
            i = p["page"] - 1
            wanted.add(i)
            for j in range(max(0, i - 1), min(len(pages), i + 2)):
                wanted.add(j)
        payment_pages = payment_pages[:pay_cap]

        # Montar blob por seções (prioridade documental)
        sections: list[str] = []

        inv = (
            "=== INVENTÁRIO DOCUMENTAL (varredura automática) ===\n"
            f"Total páginas PDF: {len(pages)}\n"
            f"Páginas com indício de pagamento/comprovante: {len(payment_pages)}\n"
        )
        for p in payment_pages[:40]:
            inv += f"- Pág. {p['page']} (score {p['score']}): {', '.join(p['marcadores'][:6])}\n"
        sections.append(inv)

        # Sentença por último no PDF costuma estar no fim — garantir últimas páginas com "SENTENÇA"/DISPOSITIVO
        for i in range(max(0, len(pages) - 25), len(pages)):
            u = _norm(pages[i])
            if any(k in u for k in ("SENTENÇA", "DISPOSITIVO", "JULGO PROCEDENTE", "CONDENO")):
                for j in range(max(0, i - 2), min(len(pages), i + 15)):
                    wanted.add(j)

        def block(title: str, indices: list[int]) -> str:
            parts = [f"\n\n=== {title} ===\n"]
            for i in indices:
                parts.append(f"===== PAGINA {i + 1} =====\n{pages[i]}")
            return "\n".join(parts)

        pay_idx = sorted({p["page"] - 1 for p in payment_pages})
        sent_idx = sorted(
            i
            for i in wanted
            if any(
                k in _norm(pages[i])
                for k in ("SENTENÇA", "DISPOSITIVO", "JULGO PROCEDENTE", "CONDENO", "DEFIRO")
            )
        )
        defesa_idx = sorted(
            i
            for i in wanted
            if "CONTESTAÇÃO" in _norm(pages[i][:500]) or (i in wanted and "CONTESTAÇÃO" in _norm(pages[i]))
        )
        oral_idx = sorted(i for i in wanted if "ATA DE AUDIÊNCIA" in _norm(pages[i][:400]))
        rest = sorted(wanted - set(pay_idx) - set(sent_idx) - set(defesa_idx) - set(oral_idx))

        if sent_idx:
            sections.append(block("SENTENÇA / DISPOSITIVO (prioridade)", sent_idx[: (25 if huge else 50)]))
        if pay_idx:
            sections.append(
                block(
                    "COMPROVANTES — TRCT, RECIBOS, HOLERITES, FGTS, PONTO",
                    pay_idx[: (30 if huge else 60)],
                )
            )
        if defesa_idx:
            sections.append(block("CONTESTAÇÃO E DOCUMENTOS DA RÉ", defesa_idx[: (15 if huge else 40)]))
        if oral_idx:
            sections.append(block("PROVA ORAL — ATAS", oral_idx[: (10 if huge else 25)]))
        sections.append(block("INICIAL E DEMAIS TRECHOS", rest[: (20 if huge else 60)]))

        blob = "\n".join(sections)
        truncated = False
        if len(blob) > max_chars:
            blob = blob[:max_chars] + "\n\n[texto recortado — priorizados comprovantes e sentença]"
            truncated = True

        meta["indice"] = compact
        meta["paginas_pagamento"] = payment_pages[:50]
        meta["extracao"] = {
            "paginas_selecionadas": len(wanted),
            "paginas_comprovante": len(pay_idx),
            "truncado": truncated,
            "versao": 4,
            "max_chars": max_chars,
        }
        return {"meta": meta, "texto": blob, "paginas": doc.page_count}
    finally:
        doc.close()


# Quanto de extrato mandar por tipo de peça (não precisa do PDF inteiro).
# Ordem: inventário + sentença + comprovantes já vêm no início do blob.
ACTION_CHAR_BUDGET = {
    "resumo": 12_000,
    "jurisprudencia": 8_000,
    "recurso": 14_000,
    "defesa": 12_000,
    "contrarrazoes": 12_000,
    "replica": 10_000,
    "alegacoes_finais": 12_000,
    "embargos": 8_000,
    "impugnacao_laudo": 10_000,
    "impugnacao_calculos": 12_000,
    "manifestacao": 8_000,
    "acordo": 6_000,
    "peticao": 8_000,
    "personalizado": 12_000,
}


def slice_for_action(texto: str, tipo: str, *, max_chars: int | None = None) -> str:
    """Recorta o extrato para a peça pedida — não reenvia o processo inteiro."""
    budget = max_chars or ACTION_CHAR_BUDGET.get(tipo, 12_000)
    t = texto or ""
    if len(t) <= budget:
        return t
    # Preferir bloco de sentença + comprovantes se existirem no extrato montado
    prefer = []
    for marker in (
        "=== SENTENÇA",
        "=== COMPROVANTES",
        "=== INVENTÁRIO",
        "=== CONTESTAÇÃO",
    ):
        i = t.find(marker)
        if i >= 0:
            prefer.append(i)
    if prefer:
        start = min(prefer)
        chunk = t[start : start + budget]
        if len(chunk) < budget // 2:
            chunk = t[:budget]
    else:
        chunk = t[:budget]
    return (
        chunk
        + "\n\n[Extrato parcial de propósito: não é necessário enviar o PDF "
        "inteiro a cada peça. Priorizados sentença e comprovantes.]"
    )

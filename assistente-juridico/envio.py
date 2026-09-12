"""Envio inteligente: PDF fica no disco; a API só recebe trechos úteis."""
from __future__ import annotations

import re

# Orçamento de caracteres do EXTRATO por peça (API gratuita / Groq).
# O PDF completo NUNCA sobe — só texto já extraído e recortado.
ACTION_CHAR_BUDGET = {
    "resumo": 9_000,
    "jurisprudencia": 7_000,
    "recurso": 11_000,
    "defesa": 10_000,
    "contrarrazoes": 10_000,
    "replica": 9_000,
    "alegacoes_finais": 10_000,
    "embargos": 7_000,
    "impugnacao_laudo": 9_000,
    "impugnacao_calculos": 11_000,
    "manifestacao": 7_000,
    "acordo": 6_000,
    "peticao": 7_000,
    "personalizado": 10_000,
}

# Prioridade de seções do extrato por tipo de peça (maior = mais importante).
SECTION_PRIORITY: dict[str, dict[str, int]] = {
    "resumo": {
        "INVENTÁRIO": 10,
        "SENTENÇA": 100,
        "COMPROVANTES": 80,
        "CONTESTAÇÃO": 40,
        "PROVA ORAL": 30,
        "INICIAL": 50,
    },
    "recurso": {
        "SENTENÇA": 100,
        "COMPROVANTES": 90,
        "CONTESTAÇÃO": 50,
        "INICIAL": 40,
        "PROVA ORAL": 30,
        "INVENTÁRIO": 20,
    },
    "defesa": {
        "INICIAL": 100,
        "COMPROVANTES": 70,
        "INVENTÁRIO": 30,
        "SENTENÇA": 10,
    },
    "impugnacao_calculos": {
        "COMPROVANTES": 100,
        "SENTENÇA": 90,
        "INVENTÁRIO": 40,
        "INICIAL": 30,
    },
    "impugnacao_laudo": {
        "SENTENÇA": 50,
        "INICIAL": 40,
        "INVENTÁRIO": 30,
        "COMPROVANTES": 20,
    },
    "jurisprudencia": {
        "SENTENÇA": 100,
        "INICIAL": 60,
        "CONTESTAÇÃO": 40,
        "INVENTÁRIO": 20,
    },
    "embargos": {
        "SENTENÇA": 100,
        "INVENTÁRIO": 20,
    },
    "alegacoes_finais": {
        "SENTENÇA": 40,
        "PROVA ORAL": 80,
        "COMPROVANTES": 70,
        "CONTESTAÇÃO": 50,
        "INICIAL": 50,
    },
    "acordo": {
        "SENTENÇA": 60,
        "INICIAL": 50,
        "COMPROVANTES": 40,
        "INVENTÁRIO": 20,
    },
}

_DEFAULT_PRIORITY = {
    "SENTENÇA": 90,
    "COMPROVANTES": 80,
    "CONTESTAÇÃO": 50,
    "PROVA ORAL": 40,
    "INICIAL": 50,
    "INVENTÁRIO": 30,
}


def _split_sections(texto: str) -> list[tuple[str, str]]:
    """Divide o extrato em (rótulo, conteúdo) pelas marcações === ... ===."""
    if not texto:
        return []
    parts = re.split(r"\n(?==== )", texto)
    out: list[tuple[str, str]] = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        m = re.match(r"=== ([^=\n]+) ===", part)
        label = (m.group(1).strip().upper() if m else "GERAL")
        # normaliza rótulo curto
        short = "GERAL"
        for key in ("INVENTÁRIO", "SENTENÇA", "COMPROVANTES", "CONTESTAÇÃO", "PROVA ORAL", "INICIAL"):
            if key in label:
                short = key
                break
        out.append((short, part))
    return out or [("GERAL", texto)]


def slice_for_action(
    texto: str,
    tipo: str,
    *,
    max_chars: int | None = None,
    mode: str = "smart",
) -> dict:
    """Monta o pacote enviado à IA.

    mode:
      - smart: prioriza seções úteis até o orçamento (API gratuita)
      - full: manda o extrato montado quase inteiro (API paga / contexto grande)

    Retorna dict com texto, chars, modo e seções usadas.
    """
    t = texto or ""
    if mode == "full":
        # ainda há teto técnico alto
        budget = max_chars or 900_000
        clipped = t if len(t) <= budget else t[:budget] + "\n\n[teto técnico]"
        return {
            "texto": clipped,
            "chars": len(clipped),
            "modo": "full",
            "secoes": ["TODAS"],
            "aviso": "Extrato amplo (API com contexto grande).",
        }

    budget = max_chars if max_chars is not None else ACTION_CHAR_BUDGET.get(tipo, 9_000)
    prio = SECTION_PRIORITY.get(tipo, _DEFAULT_PRIORITY)
    sections = _split_sections(t)
    ranked = sorted(
        sections,
        key=lambda sc: (-prio.get(sc[0], 10), -len(sc[1])),
    )

    header = (
        "=== ENVIO INTELIGENTE (PDF completo fica só no PC) ===\n"
        f"Peça: {tipo} | orçamento: {budget} caracteres | "
        "a API NÃO recebe o arquivo PDF, só trechos de texto.\n\n"
    )
    total = len(header)
    chosen: list[str] = []
    used_labels: list[str] = []

    # Sempre tenta caber um inventário curto no começo (mapa do processo).
    for label, body in sections:
        if label == "INVENTÁRIO":
            inv = body.strip()
            if len(inv) > 1_500:
                inv = inv[:1_500] + "\n[…inventário resumido…]"
            piece = inv + "\n\n"
            if total + len(piece) <= budget:
                chosen.append(piece)
                used_labels.append("INVENTÁRIO")
                total += len(piece)
            break

    for label, body in ranked:
        if label in used_labels:
            continue
        piece = body.strip() + "\n\n"
        room = budget - total
        if room < 600:
            break
        if len(piece) <= room:
            chosen.append(piece)
            used_labels.append(label)
            total += len(piece)
        else:
            chosen.append(piece[: room - 40] + "\n[…seção cortada no orçamento…]\n")
            used_labels.append(label)
            total = budget
            break

    packed = header + "".join(chosen)
    if len(packed) > budget:
        packed = packed[:budget]
    return {
        "texto": packed
        + "\n\n[Envio inteligente: PDF permanece em Documentos\\Assistente Juridico\\Processos. "
        "Só estes trechos foram enviados à IA.]",
        "chars": len(packed),
        "modo": "smart",
        "secoes": used_labels,
        "aviso": (
            f"Enviados {len(packed)} caracteres "
            f"(seções: {', '.join(used_labels) or '—'}). PDF não sobe na API."
        ),
    }

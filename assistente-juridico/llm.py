from __future__ import annotations

import httpx

from organizer import DEFAULT_CONFIG, LEGACY_MODELS, load_config, save_config


class LlmError(RuntimeError):
    pass


def _cfg() -> dict:
    raw = load_config()
    defaults = DEFAULT_CONFIG
    provider = raw.get("provider") or defaults["provider"]
    # compatibilidade com configs antigas (só OpenAI)
    api_key = (raw.get("api_key") or raw.get("openai_api_key") or "").strip()
    model = raw.get("model") or raw.get("openai_model") or defaults["model"]
    if model in LEGACY_MODELS:
        model = LEGACY_MODELS[model]
        try:
            save_config({"model": model})
        except Exception:
            pass
    base_url = (
        raw.get("base_url")
        or raw.get("openai_base_url")
        or defaults["base_url"]
    ).rstrip("/")
    return {
        "provider": provider,
        "api_key": api_key,
        "model": model,
        "base_url": base_url,
        "provider_label": raw.get("provider_label") or defaults.get("provider_label", ""),
    }


def configured() -> bool:
    return bool(_cfg()["api_key"])


def complete(system: str, user: str, *, temperature: float = 0.2) -> str:
    cfg = _cfg()
    key = cfg["api_key"]
    if not key:
        raise LlmError(
            "Falta a chave da IA. Abra Ajustes, escolha Groq (gratuito), "
            "cole a chave de console.groq.com/keys e salve."
        )
    model = cfg["model"]
    base = cfg["base_url"]
    # Groq free: TPM baixo (~8k no 120B). 1 token ≈ 3–4 chars em PT-BR.
    # Manter pedido bem abaixo de 8k tokens (sistema + usuário + folga).
    if "groq.com" in base:
        max_chars = 14_000 if "120b" in model.lower() else 22_000
        max_out = 4096 if "120b" in model.lower() else 6144
    else:
        max_chars = 450_000
        max_out = 8192
    if len(user) > max_chars:
        user = (
            user[:max_chars]
            + "\n\n[…texto cortado pelo limite gratuito da IA — "
            "priorizados sentença e comprovantes no início do extrato…]"
        )
    payload = {
        "model": model,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    if "groq.com" in base:
        payload["max_tokens"] = max_out

    with httpx.Client(timeout=300.0) as client:
        r = client.post(
            f"{base}/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json=payload,
        )
        if r.status_code >= 400:
            body = (r.text or "")[:500]
            low = body.lower()
            hint = ""
            if r.status_code in (401, 403):
                hint = " Verifique a chave (Groq: console.groq.com/keys)."
            elif r.status_code == 404 or "does not exist" in low or "model_not_found" in low:
                hint = (
                    f" Modelo '{model}' indisponível. Abra Ajustes e escolha "
                    "Groq — gratuito (openai/gpt-oss-120b) ou Groq — rápido (20B)."
                )
                if model in LEGACY_MODELS or "llama" in model.lower() or "mixtral" in model.lower():
                    novo = LEGACY_MODELS.get(model, DEFAULT_CONFIG["model"])
                    try:
                        save_config({"model": novo})
                    except Exception:
                        pass
                    hint += f" Já atualizei a config para '{novo}' — clique de novo na peça."
            elif (
                r.status_code in (413, 429)
                or "rate_limit" in low
                or "request too large" in low
                or "tokens per minute" in low
            ):
                hint = (
                    " Processo grande demais para o limite gratuito deste modelo. "
                    "Espere 1 minuto e tente de novo, ou em Ajustes escolha "
                    "«Groq — rápido (20B)» (aceita pedido maior). "
                    "O programa já envia só trechos (não o PDF inteiro); "
                    "se ainda falhar, use o modelo 20B."
                )
            raise LlmError(f"A API devolveu erro {r.status_code}: {body}{hint}")
        data = r.json()
    try:
        content = data["choices"][0]["message"]["content"]
        if content is None:
            # alguns modelos reasoning devolvem em outro campo
            content = data["choices"][0]["message"].get("reasoning") or ""
        return (content or "").strip()
    except Exception as exc:
        raise LlmError(f"Resposta inesperada da API: {exc}") from exc


def ping() -> dict:
    """Testa chave + modelo com prompt mínimo (para Ajustes)."""
    cfg = _cfg()
    if not cfg["api_key"]:
        raise LlmError("Sem chave configurada.")
    text = complete(
        "Responda só com a palavra OK.",
        "Teste de conexão. Responda exatamente: OK",
        temperature=0,
    )
    return {"ok": True, "modelo": cfg["model"], "resposta": text[:80], "provider": cfg["provider"]}

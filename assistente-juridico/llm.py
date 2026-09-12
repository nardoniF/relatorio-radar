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
            "Falta a chave da IA. Abra Ajustes: Groq (gsk_...) ou OpenAI/GPT (sk-...). "
            "ChatGPT Plus no site NÃO serve — precisa chave de API em platform.openai.com/api-keys."
        )
    model = cfg["model"]
    base = cfg["base_url"]
    # Groq free: TPM ~8k no 120B — cortar forte.
    # OpenAI/GPT: contexto grande — enviar o extrato quase inteiro.
    if "groq.com" in base:
        max_chars = 10_000 if "120b" in model.lower() else 18_000
        max_out = 3072 if "120b" in model.lower() else 4096
    elif "openai.com" in base:
        max_chars = 900_000
        max_out = 16384
    else:
        max_chars = 450_000
        max_out = 8192
    if len(user) > max_chars:
        user = (
            user[:max_chars]
            + "\n\n[…texto cortado pelo limite do provedor atual "
            f"({ 'Groq gratuito' if 'groq.com' in base else 'API' })…]"
        )
    payload = {
        "model": model,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": max_out,
    }

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
                if "openai.com" in base:
                    hint = (
                        " Chave OpenAI inválida ou sem crédito. "
                        "Revogue a antiga, crie outra em platform.openai.com/api-keys "
                        "(precisa Billing com crédito; ChatGPT Plus sozinho não basta), "
                        "cole a sk-... nova aqui, Salvar e Testar de novo."
                    )
                else:
                    hint = " Verifique a chave Groq em console.groq.com/keys (gsk_...)."
            elif r.status_code == 404 or "does not exist" in low or "model_not_found" in low:
                hint = (
                    f" Modelo '{model}' indisponível. Abra Ajustes e escolha "
                    "OpenAI GPT-4.1 mini / GPT-4.1, ou Groq gratuito."
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
                or "insufficient_quota" in low
                or "credit_balance" in low
            ):
                if "openai.com" in base or "insufficient_quota" in low or "credit_balance" in low:
                    hint = (
                        " Conta OpenAI sem crédito na API. "
                        "ChatGPT Plus NÃO inclui crédito de API. "
                        "Adicione crédito em platform.openai.com/settings/organization/billing "
                        "e teste de novo."
                    )
                else:
                    hint = (
                        " Processo grande demais para o Groq gratuito (limite ~8 mil tokens). "
                        "Abra Ajustes → escolha «OpenAI GPT-4.1 mini» (com crédito na API) "
                        "para enviar o processo grande, OU «Groq — rápido (20B)» e tente de novo. "
                        "O Testar IA pode dar OK e o Resumo falhar — o teste é mensagem curta."
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

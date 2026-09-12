from __future__ import annotations

import httpx

from organizer import DEFAULT_CONFIG, LEGACY_MODELS, load_config, save_config


class LlmError(RuntimeError):
    pass


def _cfg() -> dict:
    raw = load_config()
    defaults = DEFAULT_CONFIG
    provider = raw.get("provider") or defaults["provider"]
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


def _is_groq(base: str, provider: str = "") -> bool:
    b = (base or "").lower()
    p = (provider or "").lower()
    return "groq.com" in b or p == "groq"


def complete(system: str, user: str, *, temperature: float = 0.2) -> str:
    cfg = _cfg()
    key = cfg["api_key"]
    if not key:
        raise LlmError(
            "Falta a chave da IA. Abra Ajustes: Groq (gsk_...) ou OpenAI/GPT (sk-...). "
            "ChatGPT Plus no site NÃO serve — precisa chave de API."
        )
    model = cfg["model"]
    base = cfg["base_url"]
    provider = cfg["provider"]

    # LIMITE DURO — Groq free 120B = 8000 TPM. Pedido de 32k estoura sempre.
    # ~3–4 chars/token em PT-BR. Reserva sistema + saída.
    if _is_groq(base, provider):
        # Se ainda estiver no 120B, força orçamento mínimo (quase obrigatório no free).
        if "120b" in model.lower() or "70b" in model.lower():
            max_user = 5_500
            max_system = 2_000
            max_out = 2048
        else:
            max_user = 12_000
            max_system = 2_500
            max_out = 3072
    elif "openai.com" in (base or "").lower():
        max_user = 900_000
        max_system = 20_000
        max_out = 16384
    else:
        max_user = 450_000
        max_system = 10_000
        max_out = 8192

    if len(system) > max_system:
        system = system[:max_system] + "\n[…sistema truncado…]"
    if len(user) > max_user:
        user = (
            user[:max_user]
            + "\n\n[…TEXTO CORTADO pelo limite gratuito da API. "
            "O PDF completo continua só no seu PC. "
            "Use Groq 20B em Ajustes para caber mais trechos…]"
        )

    # Segurança extra: conta grosseira de tokens (chars/3) < 7500 no Groq
    if _is_groq(base, provider):
        while (len(system) + len(user)) // 3 > 7_000 and len(user) > 2_000:
            user = user[: int(len(user) * 0.85)]
        if (len(system) + len(user)) // 3 > 7_000:
            user = user[:3_000]

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
                        "Crie sk-... em platform.openai.com/api-keys com Billing."
                    )
                else:
                    hint = " Verifique a chave Groq em console.groq.com/keys (gsk_...)."
            elif r.status_code == 404 or "does not exist" in low or "model_not_found" in low:
                hint = (
                    f" Modelo '{model}' indisponível. Em Ajustes escolha "
                    "Groq 20B (gratuito) ou OpenAI GPT-4.1 mini."
                )
                if model in LEGACY_MODELS or "llama" in model.lower():
                    novo = LEGACY_MODELS.get(model, DEFAULT_CONFIG["model"])
                    try:
                        save_config({"model": novo})
                    except Exception:
                        pass
                    hint += f" Já mudei para '{novo}' — clique de novo."
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
                        " Sem crédito na API OpenAI. "
                        "platform.openai.com → Billing → Buy credits. "
                        "ChatGPT Plus NÃO conta."
                    )
                else:
                    hint = (
                        " Processo grande demais para o Groq 120B (limite 8 mil tokens). "
                        "FAÇA AGORA: Ajustes → plano «Groq — gratuito 20B» → Salvar → "
                        "feche a janela preta → abra Iniciar.bat de novo → Resumo. "
                        "O Testar IA pode dar OK e o Resumo falhar (teste é mensagem curta)."
                    )
                    # auto-troca para 20B na próxima
                    try:
                        if "120b" in model.lower():
                            save_config(
                                {
                                    "model": "openai/gpt-oss-20b",
                                    "provider": "groq",
                                    "provider_label": "Groq — gratuito 20B",
                                    "base_url": "https://api.groq.com/openai/v1",
                                }
                            )
                            hint += " Já deixei 20B salvo — reinicie o Iniciar.bat e tente de novo."
                    except Exception:
                        pass
            raise LlmError(f"A API devolveu erro {r.status_code}: {body}{hint}")
        data = r.json()
    try:
        content = data["choices"][0]["message"]["content"]
        if content is None:
            content = data["choices"][0]["message"].get("reasoning") or ""
        return (content or "").strip()
    except Exception as exc:
        raise LlmError(f"Resposta inesperada da API: {exc}") from exc


def ping() -> dict:
    cfg = _cfg()
    if not cfg["api_key"]:
        raise LlmError("Sem chave configurada.")
    text = complete(
        "Responda só com a palavra OK.",
        "Teste de conexão. Responda exatamente: OK",
        temperature=0,
    )
    return {"ok": True, "modelo": cfg["model"], "resposta": text[:80], "provider": cfg["provider"]}

const ACOES = [
  ["resumo", "Resumo do processo"],
  ["jurisprudencia", "Jurisprudência"],
  ["recurso", "Recurso Ordinário"],
  ["defesa", "Contestação"],
  ["contrarrazoes", "Contrarrazões"],
  ["replica", "Réplica"],
  ["alegacoes_finais", "Alegações finais"],
  ["embargos", "Embargos de declaração"],
  ["impugnacao_laudo", "Impugnação ao laudo"],
  ["impugnacao_calculos", "Impugnação aos cálculos"],
  ["manifestacao", "Manifestação"],
  ["acordo", "Minuta de acordo"],
  ["peticao", "Petição intermediária"],
  ["personalizado", "Pedido personalizado"],
];

const $ = (id) => document.getElementById(id);

let config = null;
let busy = false;

function setStatus(msg, kind = "") {
  const el = $("status");
  el.textContent = msg || "";
  el.className = "status" + (kind ? " " + kind : "");
}

function setBanner(msg, kind = "") {
  const el = $("banner");
  if (!msg) {
    el.className = "banner hide";
    el.textContent = "";
    return;
  }
  el.textContent = msg;
  el.className = "banner" + (kind ? " " + kind : "");
}

async function api(url, options = {}) {
  const res = await fetch(url, options);
  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await res.json();
  } else {
    data = { detail: await res.text() };
  }
  if (!res.ok) {
    const detail = data?.detail;
    const msg = typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((d) => d.msg || JSON.stringify(d)).join("; ")
        : (data?.message || res.statusText || "Erro");
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

function caseId() {
  return $("casos").value || "";
}

function renderCasos(lista, preferId) {
  const sel = $("casos");
  const cur = preferId || sel.value;
  sel.innerHTML = "";
  if (!lista.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(nenhum processo ainda)";
    sel.appendChild(opt);
    $("meta").textContent = "";
    return;
  }
  for (const c of lista) {
    const opt = document.createElement("option");
    opt.value = c.id;
    const m = c.meta || {};
    const label = [
      m.reclamante || "?",
      "×",
      m.reclamado || "?",
      m.numero ? `(${m.numero})` : "",
    ].join(" ");
    opt.textContent = label;
    sel.appendChild(opt);
  }
  if (cur && [...sel.options].some((o) => o.value === cur)) {
    sel.value = cur;
  }
  showMeta(lista.find((c) => c.id === sel.value));
}

function showMeta(c) {
  if (!c) {
    $("meta").textContent = "";
    return;
  }
  const m = c.meta || {};
  const lines = [
    `Pasta: ${c.path}`,
    `Número: ${m.numero || "—"}`,
    `Reclamante: ${m.reclamante || "—"}`,
    `Reclamado: ${m.reclamado || "—"}`,
    `Páginas: ${m.paginas || "—"}`,
    `Peças já geradas: ${(c.arquivos || []).join(", ") || "(nenhuma)"}`,
  ];
  $("meta").textContent = lines.join("\n");
}

function renderAcoes() {
  const box = $("acoes");
  box.innerHTML = "";
  for (const [id, label] of ACOES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.tipo = id;
    btn.textContent = label;
    btn.addEventListener("click", () => runAcao(id, label));
    box.appendChild(btn);
  }
}

function setBusy(on, label = "") {
  busy = on;
  document.querySelectorAll("button").forEach((b) => {
    if (b.id === "btn-ajustes") return;
    b.disabled = on;
  });
  if (on) setStatus(label || "Trabalhando… isso pode levar 1–3 minutos.", "busy");
}

async function loadConfig() {
  config = await api("/api/config");
  if (config.aviso) setBanner(config.aviso, "err");
  else setBanner("");

  const preset = $("preset");
  preset.innerHTML = "";
  for (const [key, p] of Object.entries(config.presets || {})) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = p.provider_label || key;
    preset.appendChild(opt);
  }
  // seleciona preset pelo model atual
  const match = Object.entries(config.presets || {}).find(([, p]) => p.model === config.model);
  if (match) preset.value = match[0];
  else if (config.presets?.groq_free) preset.value = "groq_free";

  $("model").value = config.model || "";
  $("base_url").value = config.base_url || "";
  $("api_key").value = "";
  $("api_key").placeholder = config.has_key
    ? `Chave salva ${config.masked_key} — cole outra para trocar`
    : "Cole a chave gsk_… aqui";
  $("key-info").textContent = config.has_key
    ? `Chave configurada: ${config.masked_key} · modelo ${config.model}`
    : "Nenhuma chave salva — análises não vão rodar.";
  $("processos-path").textContent = `Pastas: ${config.processos_dir}`;
}

async function loadCasos(preferId) {
  const lista = await api("/api/casos");
  renderCasos(lista, preferId);
}

async function importar() {
  const file = $("pdf").files?.[0];
  if (!file) {
    setStatus("Escolha um PDF primeiro.", "err");
    return;
  }
  setBusy(true, "Lendo PDF e criando pasta do processo…");
  try {
    const fd = new FormData();
    fd.append("arquivo", file);
    const data = await api("/api/importar", { method: "POST", body: fd });
    await loadCasos(data.id);
    setStatus(
      `Processo salvo: ${data.path}` +
        (config?.has_key
          ? " Agora clique numa análise à direita."
          : " ATENÇÃO: falta chave da IA em Ajustes — sem ela não há análise."),
      config?.has_key ? "ok" : "err",
    );
    if (!config?.has_key) {
      setBanner(
        "Pasta criada, mas análise bloqueada: abra Ajustes e cole a chave (OpenAI sk-... ou Groq gsk_...).",
        "err",
      );
    }
  } catch (e) {
    setStatus(e.message || String(e), "err");
  } finally {
    setBusy(false);
  }
}

async function runAcao(tipo, label) {
  const id = caseId();
  if (!id) {
    setStatus("Importe ou selecione um processo antes.", "err");
    return;
  }
  if (!config?.has_key) {
    setStatus("Sem chave da IA. Abra Ajustes → OpenAI GPT ou Groq → cole a chave → Salvar → Testar IA.", "err");
    $("dlg-ajustes").showModal();
    return;
  }
  const extra = $("instrucoes").value.trim();
  if (tipo === "personalizado" && !extra) {
    setStatus("No pedido personalizado, escreva no diálogo o que a IA deve fazer.", "err");
    return;
  }

  setBusy(true, `Gerando “${label}”… aguarde (pode demorar).`);
  $("resultado").textContent = "";
  try {
    const fd = new FormData();
    fd.append("case_id", id);
    fd.append("tipo", tipo);
    fd.append("modo", "arquivos");
    fd.append("instrucoes_extra", extra);
    fd.append("salvar_aprendizado", $("salvar-aprendizado").checked ? "1" : "0");
    const data = await api("/api/acao", { method: "POST", body: fd });
    const files = [data.arquivo_docx, data.arquivo_pdf].filter(Boolean).join(" + ");
    const env = data.envio || {};
    const envMsg = env.aviso ? ` · ${env.aviso}` : "";
    setStatus(`Pronto: ${files} em ${data.pasta}${envMsg}`, "ok");
    $("resultado").textContent =
      (env.aviso ? `[${env.aviso}]\n\n` : "") +
      (data.texto || "").slice(0, 12000) +
      ((data.texto || "").length > 12000 ? "\n\n[…texto cortado na tela; arquivo completo na pasta]" : "");
    await loadCasos(id);
  } catch (e) {
    setStatus(e.message || String(e), "err");
    setBanner(e.message || String(e), "err");
  } finally {
    setBusy(false);
  }
}

async function refinar() {
  const id = caseId();
  if (!id) {
    setStatus("Selecione um processo.", "err");
    return;
  }
  const fb = $("instrucoes").value.trim();
  if (!fb) {
    setStatus("Escreva no diálogo o que faltou ou o que deve mudar, depois Refinar.", "err");
    return;
  }
  setBusy(true, "Refinando última peça…");
  try {
    const fd = new FormData();
    fd.append("case_id", id);
    fd.append("feedback", fb);
    fd.append("salvar_aprendizado", $("salvar-aprendizado").checked ? "1" : "0");
    const data = await api("/api/refinar", { method: "POST", body: fd });
    setStatus(`Peça refinada: ${data.arquivo_docx} + ${data.arquivo_pdf}`, "ok");
    $("resultado").textContent = (data.texto || "").slice(0, 12000);
    await loadCasos(id);
  } catch (e) {
    setStatus(e.message || String(e), "err");
  } finally {
    setBusy(false);
  }
}

async function abrirPasta() {
  const id = caseId();
  if (!id) return;
  try {
    await api(`/api/abrir-pasta?case_id=${encodeURIComponent(id)}`);
  } catch (e) {
    setStatus(e.message || String(e), "err");
  }
}

function applyPreset() {
  const key = $("preset").value;
  const p = config?.presets?.[key];
  if (!p) return;
  $("model").value = p.model || "";
  $("base_url").value = p.base_url || "";
}

async function salvarAjustes() {
  // Não manda preset sozinho sobrescrevendo o modelo digitado:
  // o backend aplica preset e depois o model do formulário.
  const payload = {
    preset: $("preset").value,
    model: $("model").value.trim(),
    base_url: $("base_url").value.trim(),
  };
  // Se o usuário digitou 20b manualmente, garante no payload
  if (!payload.model) payload.model = "openai/gpt-oss-20b";
  // Bloqueia 120b no free (volta sozinho no Salvar antigo)
  if (payload.model.includes("120b")) {
    payload.model = "openai/gpt-oss-20b";
    $("model").value = payload.model;
  }
  const key = $("api_key").value.trim();
  if (key) payload.api_key = key;
  $("ajuste-msg").textContent = "Salvando…";
  try {
    config = await api("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await loadConfig();
    $("ajuste-msg").textContent = config.has_key
      ? `Salvo · modelo ${config.model}. Use “Testar IA” e depois gere a peça.`
      : "Salvo, mas ainda sem chave — análises continuam bloqueadas.";
    $("ajuste-msg").className = "status " + (config.has_key ? "ok" : "err");
  } catch (e) {
    $("ajuste-msg").textContent = e.message || String(e);
    $("ajuste-msg").className = "status err";
  }
}

async function testarIa() {
  $("ajuste-msg").textContent = "Testando conexão com o modelo…";
  $("ajuste-msg").className = "status busy";
  try {
    const data = await api("/api/testar-ia", { method: "POST" });
    $("ajuste-msg").textContent = `OK — ${data.modelo}: “${data.resposta}”`;
    $("ajuste-msg").className = "status ok";
    setBanner("");
    setStatus("IA respondendo. Pode gerar as análises.", "ok");
  } catch (e) {
    $("ajuste-msg").textContent = e.message || String(e);
    $("ajuste-msg").className = "status err";
  }
}

function wire() {
  renderAcoes();
  $("btn-importar").addEventListener("click", importar);
  $("btn-atualizar").addEventListener("click", () => loadCasos());
  $("btn-abrir").addEventListener("click", abrirPasta);
  $("btn-refinar").addEventListener("click", refinar);
  $("casos").addEventListener("change", async () => {
    const lista = await api("/api/casos");
    showMeta(lista.find((c) => c.id === caseId()));
  });
  $("btn-ajustes").addEventListener("click", () => {
    $("ajuste-msg").textContent = "";
    $("dlg-ajustes").showModal();
  });
  $("preset").addEventListener("change", applyPreset);
  $("form-ajustes").addEventListener("submit", async (ev) => {
    const val = ev.submitter?.value;
    if (val === "salvar") {
      ev.preventDefault();
      await salvarAjustes();
    }
  });
  $("btn-testar").addEventListener("click", testarIa);
}

async function boot() {
  wire();
  try {
    await loadConfig();
    await loadCasos();
    if (config?.has_key) {
      setStatus(`Pronto · ${config.provider_label || config.provider} · ${config.model}`, "ok");
    } else {
      setStatus("Importe o PDF. Para analisar, configure a chave em Ajustes.", "err");
    }
  } catch (e) {
    setStatus("Falha ao iniciar: " + (e.message || e), "err");
  }
}

boot();

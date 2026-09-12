"""Testes locais do Assistente Jurídico (sem chave de API real)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

import fitz
from fastapi.testclient import TestClient

import organizer
import llm
from app import app


def _fake_home(tmp: Path, monkey=None):
    organizer.HOME_APP = tmp / "Assistente Juridico"
    organizer.PROCESSOS = organizer.HOME_APP / "Processos"
    organizer.CONFIG = organizer.HOME_APP / "config.json"
    import memory

    memory.GLOBAL_FILE = organizer.HOME_APP / "aprendizado_global.json"
    organizer.ensure_dirs()


def make_pdf(path: Path) -> None:
    doc = fitz.open()
    page = doc.new_page()
    text = (
        "RECLAMANTE: MARIA DA SILVA\n"
        "RECLAMADO: EMPRESA XYZ LTDA\n"
        "1000123-45.2024.5.02.0001\n"
        "Valor da causa: R$ 10.000,00\n"
        "Data da Autuação: 01/02/2024\n"
        "\nPETIÇÃO INICIAL\nPedidos de horas extras e intervalo.\n"
        "\nSENTENÇA\nDISPOSITIVO\nJULGO PROCEDENTE em parte.\nCONDENO a ré ao pagamento de intervalo intrajornada.\n"
        "\nTRCT\nTERMO DE RESCISÃO\nVALOR LÍQUIDO R$ 1.500,00\nRECIBO DE PAGAMENTO\n"
    )
    page.insert_text((72, 72), text, fontsize=11)
    doc.save(path)
    doc.close()


def test_legacy_model_migration(tmp_path: Path):
    _fake_home(tmp_path)
    organizer.CONFIG.write_text(
        json.dumps(
            {
                "provider": "groq",
                "api_key": "gsk_test",
                "model": "llama-3.3-70b-versatile",
                "base_url": "https://api.groq.com/openai/v1",
            }
        ),
        encoding="utf-8",
    )
    cfg = organizer.load_config()
    assert cfg["model"] == "openai/gpt-oss-120b", cfg
    # persistiu
    raw = json.loads(organizer.CONFIG.read_text(encoding="utf-8"))
    assert raw["model"] == "openai/gpt-oss-120b"


def test_acao_sem_chave(tmp_path: Path):
    _fake_home(tmp_path)
    client = TestClient(app)
    pdf = tmp_path / "p.pdf"
    make_pdf(pdf)
    with pdf.open("rb") as f:
        r = client.post("/api/importar", files={"arquivo": ("p.pdf", f, "application/pdf")})
    assert r.status_code == 200, r.text
    case_id = r.json()["id"]
    r2 = client.post(
        "/api/acao",
        data={"case_id": case_id, "tipo": "resumo", "modo": "arquivos"},
    )
    assert r2.status_code == 400, r2.text
    assert "chave" in r2.json()["detail"].lower()


def test_ui_static():
    client = TestClient(app)
    r = client.get("/")
    assert r.status_code == 200
    assert "Assistente Jurídico" in r.text
    r2 = client.get("/ui/app.js")
    assert r2.status_code == 200
    assert "runAcao" in r2.text


def test_config_endpoint(tmp_path: Path):
    _fake_home(tmp_path)
    client = TestClient(app)
    r = client.get("/api/config")
    assert r.status_code == 200
    data = r.json()
    assert data["model"] == "openai/gpt-oss-120b"
    assert data["analise_pronta"] is False
    assert data["aviso"]


if __name__ == "__main__":
    import tempfile

    base = Path(tempfile.mkdtemp(prefix="aj-test-"))
    print("tmp", base)
    test_legacy_model_migration(base / "m1")
    print("OK migration")
    test_acao_sem_chave(base / "m2")
    print("OK acao sem chave")
    test_ui_static()
    print("OK ui")
    test_config_endpoint(base / "m3")
    print("OK config")
    print("TODOS OK")

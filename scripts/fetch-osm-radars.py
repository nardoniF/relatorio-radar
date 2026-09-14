#!/usr/bin/env python3
"""Baixa radares OSM (speed_camera) da Grande SP para o pack do app."""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BBOX = (-23.85, -46.95, -23.35, -46.35)  # s,w,n,e


def fetch() -> list[dict]:
    query = f"""
    [out:json][timeout:120];
    (
      node["highway"="speed_camera"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
      node["enforcement"="maxspeed"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
      node["camera:type"="speed"]({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});
    );
    out body;
    """
    form = urllib.parse.urlencode({"data": query}).encode()
    req = urllib.request.Request(
        "https://overpass-api.de/api/interpreter",
        data=form,
        headers={"User-Agent": "RelatorioRadar/0.2"},
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read())
    return data.get("elements", [])


def parse(elements: list[dict]) -> list[dict]:
    radars = []
    seen: set[tuple[float, float]] = set()
    for el in elements:
        if el.get("type") != "node":
            continue
        lat, lon = el.get("lat"), el.get("lon")
        if lat is None or lon is None:
            continue
        key = (round(lat, 5), round(lon, 5))
        if key in seen:
            continue
        seen.add(key)
        tags = el.get("tags") or {}
        ms = tags.get("maxspeed") or tags.get("maxspeed:forward")
        limit = 50
        if ms:
            digits = "".join(ch if ch.isdigit() else " " for ch in str(ms)).split()
            if digits:
                try:
                    limit = int(digits[0])
                except ValueError:
                    limit = 50
        if limit < 20 or limit > 140:
            limit = 50
        radars.append(
            {
                "id": f"osm-{el['id']}",
                "name": (tags.get("name") or f"Radar OSM {el['id']}")[:80],
                "lat": round(lat, 6),
                "lng": round(lon, 6),
                "limitKmh": limit,
                "alertRadiusM": 280,
                "passRadiusM": 70,
            }
        )
    return radars


def main() -> None:
    elements = fetch()
    radars = parse(elements)
    pack = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "disclaimer": (
            "Dados OSM comunitários; podem estar incompletos ou desatualizados. "
            "Não é feed oficial CET/DER."
        ),
        "count": len(radars),
        "radars": radars,
    }
    text = json.dumps(pack, ensure_ascii=False)
    targets = [
        ROOT / "public/data/sp_osm_speed_cameras.json",
        ROOT / "data/sp_osm_speed_cameras.compact.json",
        ROOT / "ios/RelatorioRadar/Fixtures/sp_osm_speed_cameras.json",
        ROOT / "ios/RelatorioRadar/RelatorioRadar/Resources/sp_osm_speed_cameras.json",
    ]
    for path in targets:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        print("wrote", path, len(radars))


if __name__ == "__main__":
    main()

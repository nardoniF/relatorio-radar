# iOS — Relatório Radar

Scaffold nativo Swift/SwiftUI do motor de conformidade viária.

## Abrir no Xcode (Mac)

```bash
cd ios/RelatorioRadar
brew install xcodegen   # uma vez
xcodegen generate
open RelatorioRadar.xcodeproj
```

Ou abra o pacote de lógica:

```bash
open ios/RelatorioRadar/Package.swift
```

## Checklist no Xcode

1. **Signing**: selecione seu Team
2. **Capabilities → Background Modes → Location updates**
3. Confirme as strings de privacidade em PT-BR no `Info.plist`
4. Rode no dispositivo real (GPS/background); simulador serve para UI + `TripSimulator`

## O que está no MVP

- Início manual de viagem (sem destino)
- Monitoramento GPS + zonas de radar com direção
- Relatório com MapKit (polyline + marcadores verde/amarelo/vermelho/cinza)
- Histórico offline-first
- Ajustes (voz, háptico, veículo, combustível)

## Fora do MVP (arquitetura pronta)

- CarPlay UI
- Modo automático de detecção de viagem
- Integração HERE via backend (app já usa `APIClient` proxy; DemoProvider local até lá)

Detalhes: [RelatorioRadar/README.md](./RelatorioRadar/README.md)

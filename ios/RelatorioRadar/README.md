# Relatório Radar — iOS

Motor de **conformidade viária em tempo real** (Swift / SwiftUI).  
Engines em `RelatorioRadarCore` (sem SwiftUI) — prontos para CarPlay futuro. A UI do MVP é iPhone only.

## Abrir no Mac (Xcode)

### Opção A — XcodeGen (recomendado)

```bash
brew install xcodegen   # se necessário
cd ios/RelatorioRadar
xcodegen generate
open RelatorioRadar.xcodeproj
```

### Opção B — só o Package (lógica / testes)

```bash
cd ios/RelatorioRadar
swift test              # macOS; no Linux CoreLocation fica #if'd out
open Package.swift      # Xcode abre o package
```

Depois, no Xcode app target: **File → Add Package Dependencies → Add Local…** → selecione `ios/RelatorioRadar`.

## Capabilities obrigatórias

No target **RelatorioRadar**:

1. **Signing & Capabilities → + Capability → Background Modes**
2. Marque **Location updates**
3. Confirme `UIBackgroundModes = location` no `Info.plist` (já incluído)

Sem isso o iOS suspende o GPS em segundo plano.

## Privacy / Info.plist (PT-BR)

Já configurados:

| Chave | Uso |
| --- | --- |
| `NSLocationWhenInUseUsageDescription` | Monitoramento durante a viagem |
| `NSLocationAlwaysAndWhenInUseUsageDescription` | Continuar em background / tela bloqueada |
| `NSLocationAlwaysUsageDescription` | Fallback legado |
| `PrivacyInfo.xcprivacy` | Manifesto de privacidade (localização precisa) |

## Arquitetura

```
RelatorioRadarCore/     # engines — ZERO SwiftUI
  Models / Engines / Geo / Storage / Providers / Simulation
App/                    # SwiftUI + ViewModels + Services
RelatorioRadar/         # @main, Info.plist, PrivacyInfo
```

Fluxo MVP: **INICIAR VIAGEM** → dirigir (sem destino) → **FINALIZAR** → relatório MapKit.

- `ViolationEngine` nunca hardcoda R$ — injeta `FineRule[]` do backend
- Confiança baixa → marcador cinza/amarelo (não vermelho)
- Radares sentido oposto ignorados
- Waze: deep-link opcional apenas (nunca scrape)
- HERE keys: só no backend proxy (`APIClient`)

## CarPlay

Engines + protocols (`VoiceAlerting`, `LocationEngineing`, `TripEngine`) estão separados da UI.  
**CarPlay não faz parte do MVP visual** — próximo passo: template de navegação consumindo o mesmo `TripEngine`.

## Fixture de simulação

`Fixtures/sample_trip.json` — percurso demo SP para `TripSimulator`.

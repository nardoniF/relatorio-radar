# Como colocar no iPhone

## O que você pediu vs o que existe agora

| Pedido | Situação |
| --- | --- |
| App para baixar no iPhone | **Nativo Swift** no Mac via Xcode (ainda não está na App Store). Enquanto isso: PWA na Tela de Início. |
| Segundo plano avisando | **Só o app nativo** (permissão Localização = Sempre). Safari/PWA **não** monitora com tela bloqueada. |
| Iniciar acima de 30 km/h | Ligado no app nativo e também no PWA (PWA só com o Safari/app aberto). |
| Avisar início + mapear radares | Sim — pack OSM de SP (~1281 radares). |
| “Verificar no Waze a rota” | **Impossível legalmente/tecnicamente**: Waze não tem API pública de rota/radares. Usamos **MapKit** para rota + OSM para radares; o Waze só pode ser **aberto** para navegar. |
| Teste na Pacaembu real falhou | O piloto antigo usava **5 radares fictícios**. Agora o **GPS real** usa o pack OSM. |

---

## Testar AGORA no iPhone / Mac (PWA atualizado)

1. Abra no Safari: **https://nardonif.github.io/relatorio-radar/?v=9**
2. Force refresh (`Cmd+Shift+R` no Mac / limpe cache no iPhone).
3. Deve aparecer algo como **“1281 radares OSM em SP”**.
4. Marque **Iniciar sozinho acima de 30 km/h** (opcional).
5. Toque **GPS real** (não “Simular no sofá”) e dirija.
6. “Simular no sofá” continua sendo **demo** — não use isso para teste na rua.

Adicionar à Tela de Início: Safari → Compartilhar → Adicionar à Tela de Início.

---

## App nativo de verdade (segundo plano + auto 30 km/h)

Precisa de **Mac + Xcode + cabo** (ou TestFlight depois):

```bash
git clone https://github.com/nardoniF/relatorio-radar.git
cd relatorio-radar
git checkout cursor/radares-reais-app-nativo-57c1
cd ios/RelatorioRadar
brew install xcodegen
xcodegen generate
open RelatorioRadar.xcodeproj
```

No Xcode:

1. Signing & Capabilities → seu Apple ID / Team  
2. Background Modes → Location updates (já no Info.plist)  
3. Plugar o iPhone → ▶ Run  
4. No iPhone: Ajustes → Geral → VPN e gerenciamento de dispositivo → confiar no desenvolvedor  
5. Na primeira viagem: permitir localização **Sempre**  
6. Ligar **Iniciar acima de 30 km/h**

Sem Mac / conta de desenvolvedor, **não dá** para instalar um `.ipa` “pela loja” ainda — isso exige App Store / TestFlight.

---

## Dados dos radares

- Fonte: OpenStreetMap (`highway=speed_camera` / `enforcement=maxspeed`) na região de SP  
- Podem faltar radares novos ou ter limite errado — é base comunitária, não CET/DER oficial  
- Atualização: `scripts` / Overpass → `public/data/sp_osm_speed_cameras.json`

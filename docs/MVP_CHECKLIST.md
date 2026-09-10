# Checklist MVP — Critério de sucesso

O MVP só está completo quando for possível, **sem operar o iPhone durante a condução**:

- [ ] Abrir o app
- [ ] Pressionar **INICIAR VIAGEM**
- [ ] Bloquear o iPhone / abrir outro app
- [ ] Dirigir (ou reproduzir `sample_trip.json`)
- [ ] Detectar localização (Core Location background)
- [ ] Identificar estrada/segmento (map matching em janelas)
- [ ] Identificar radares no **mesmo sentido**
- [ ] Identificar limite do **segmento atual**
- [ ] Alertar (voz/haptic/banner)
- [ ] Registrar passagem com SpeedFilter
- [ ] Calcular **possível infração** (estimativa via `fine_rules`)
- [ ] **FINALIZAR**
- [ ] Relatório com mapa + lista + custos

## Fora do MVP (explícito)

- Modo automático completo
- UI CarPlay / Watch / Android
- Pedágios ao vivo
- Conta social / gamificação / anúncios
- Dependência de dados do Waze

## Evidências de teste

- `backend`: `npm test`
- Simulador: fixture `scripts/fixtures/sample_trip.json`
- Device: viagem curta real com HTTPS no backend

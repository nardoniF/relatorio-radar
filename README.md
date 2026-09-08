# Relatório Radar

Piloto web HTTPS de viagem: GPS, alerta de radares e relatório ao **Finalizar** com os radares passados acima do limite.

Sem relação com Sensor Tattoo Fix.

## O que faz

- **GPS real** — `watchPosition` no Safari (exige HTTPS + permissão)
- **Simular no sofá** — percurso demo com velocidade ajustável, sem sair de casa
- **Alerta de radar** — aviso por proximidade (longe / perto / iminente)
- **Finalizar** — relatório dos radares passados, destacando os acima do limite
- **Copiar relatório** — texto pronto para colar

## Rodar no iPhone (Safari)

```bash
npm install
npm run dev
```

O Vite sobe com **HTTPS** (`vite-plugin-mkcert`) e `host: true`.

1. No Mac/PC, anote o endereço mostrado (ex.: `https://192.168.x.x:5173`)
2. No iPhone (mesma Wi‑Fi), abra esse URL no Safari
3. Aceite o certificado local se o Safari pedir
4. Toque em **GPS real** e permita localização — ou use **Simular no sofá**

Build estático:

```bash
npm run build
npm run preview
```

## Stack

Vite + TypeScript, sem backend. Radares de demo em `src/data/radars.ts` (trecho fictício SP para a simulação).

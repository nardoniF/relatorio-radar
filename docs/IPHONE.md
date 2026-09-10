# Como colocar no iPhone — passo a passo

## Opção A (mais fácil) — app na Tela de Início via Safari

### 0. Uma vez no computador (GitHub)

1. Abra: https://github.com/nardoniF/relatorio-radar/settings/pages  
2. Em **Build and deployment** → **Source**: escolha **Deploy from a branch**  
3. Branch: **`gh-pages`** / pasta **`/`** → **Save**  
4. Espere 1–2 minutos até aparecer o link do site

O endereço será:

**https://nardonif.github.io/relatorio-radar/**

### 1. No iPhone

1. Abra o **Safari** (não use Chrome)  
2. Cole o link acima  
3. Toque em **Compartilhar** (□↑)  
4. **Adicionar à Tela de Início** → nome `Radar` → **Adicionar**  
5. Abra o ícone **Radar**

### 2. Testar

1. **Simular no sofá** → espera alertas → **Finalizar** → relatório  
2. Ou **GPS real** → permitir localização → dirigir → **Finalizar**

Sem token de API. GPS usa a localização do próprio iPhone.

---

## Opção B — se o Pages ainda não estiver no ar (rede local)

No Mac ou PC (mesma Wi‑Fi do iPhone):

```bash
git clone https://github.com/nardoniF/relatorio-radar.git
cd relatorio-radar
npm install
npm run dev
```

Anote o endereço `https://192.168.x.x:5173` que o Vite mostrar.  
No iPhone Safari abra esse HTTPS (pode pedir para confiar no certificado) → depois **Adicionar à Tela de Início**.

---

## Opção C — app nativo Swift (precisa de Mac)

1. Mac com Xcode + Apple ID  
2. `cd ios/RelatorioRadar && brew install xcodegen && xcodegen generate`  
3. Abrir no Xcode → Signing → plugar iPhone → ▶ Run  
4. No iPhone: confiar no desenvolvedor em Ajustes → Geral  

Isso **não** se instala só pelo celular.

# Como colocar no iPhone — passo a passo

## Opção A (mais fácil, AGORA) — Safari na Tela de Início

Não precisa de Mac nem App Store. É o piloto web com HTTPS.

### 1. Abra no iPhone
No **Safari** (importante: Safari, não Chrome), abra:

**https://nardonif.github.io/relatorio-radar/**

(Se a página ainda não carregar, espere 1–2 minutos após o publish do GitHub Pages.)

### 2. Instale como app
1. Toque em **Compartilhar** (quadrado com seta para cima)
2. Role e toque em **Adicionar à Tela de Início**
3. Nome: `Radar` → **Adicionar**

### 3. Use
1. Abra o ícone **Radar**
2. **Simular no sofá** = teste em casa (sem dirigir)
3. **GPS real** = na rua; quando pedir, **Permitir** localização
4. **Finalizar** = relatório dos radares acima do limite

Pronto. Isso é o app no seu iPhone para testar.

---

## Opção B — App nativo Swift (ícone “de verdade” via Xcode)

Só se você tiver **Mac + Xcode + cabo** (ou rede) e o iPhone.

1. No Mac: `git clone https://github.com/nardoniF/relatorio-radar.git`
2. `cd relatorio-radar/ios/RelatorioRadar`
3. `brew install xcodegen && xcodegen generate`
4. `open RelatorioRadar.xcodeproj`
5. Em **Signing**: escolha seu Apple ID / Team
6. Conecte o iPhone → selecione o aparelho como destino → ▶ Run
7. No iPhone: Ajustes → Geral → Gerenciamento de VPN e Dispositivo → confiar no desenvolvedor

Isso instala o app Swift nativo. **Não dá para fazer isso só pelo celular** nem daqui do Linux.

---

## Qual usar?

| Você quer… | Faça |
| --- | --- |
| Testar hoje no sofá / na rua | **Opção A** |
| App nativo Core Location / MapKit | **Opção B** (Mac) |
| App Store pública | Depois, com conta Developer paga |

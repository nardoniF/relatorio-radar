# Privacidade e armazenamento (LGPD + App Store)

## Finalidade

Localização e trajetos são usados **somente** para:

- monitorar a viagem iniciada pelo usuário;
- alertar sobre radares no mesmo sentido;
- gerar relatório e histórico a pedido do usuário.

Não vendemos dados de localização.

## Permissões iOS

- **Quando em uso** durante viagem ativa (MVP).
- Background Location Updates apenas com viagem ativa e explicação clara na UI e no `Info.plist`.
- Não solicitar *Always* sem necessidade real do modo automático (fase futura).

## Minimização

- Sem destino obrigatório.
- Sem rede social / tracking publicitário no MVP.
- Identificadores de viagem (UUID), não perfil excessivo.

## Direitos do usuário

- Apagar viagem individual.
- Apagar histórico completo.
- Encerrar monitoramento a qualquer momento (FINALIZAR).
- Desligar alertas sonoros / automático.

## Segurança

- HTTPS em trânsito.
- Chaves HERE/Mapbox só no backend.
- Dados em repouso protegidos conforme plataforma (Keychain / DB cifrado quando aplicável).

## Retenção

- Histórico local sob controle do usuário.
- Cache de atributos de mapa/radares respeita contrato do provedor (TTL).
- Logs de debug sem PII desnecessária.

## Estimativas

Velocidade GPS e multas calculadas são **estimativas**, não autuação oficial. O relatório deixa isso explícito.

## Documento legal

Este arquivo é a base técnica. Antes da App Store, publicar política de privacidade completa em URL pública e link no app.

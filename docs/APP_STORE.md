# App Store — preparação

## Capabilities

- Background Modes: **Location updates**
- (Futuro) Audio para alertas em background se necessário

## Info.plist (PT-BR)

- `NSLocationWhenInUseUsageDescription`: localização para monitorar a viagem, limites e radares no mesmo sentido.
- `NSLocationAlwaysAndWhenInUseUsageDescription`: apenas se/quando o modo automático exigir (fase 2); texto claro e honesto.

## Privacy Nutrition Labels

- Location: ligada ao recurso de viagem; não usada para tracking de anúncios no MVP.
- Dados de viagem: sob controle do usuário (exclusão).

## Review notes

Explicar:

1. App funciona **sem destino**.
2. Background location só com viagem ativa.
3. Multas são **estimativas**, não autuações.
4. DemoProvider / seeds para reviewers sem chaves HERE (ou sandbox).

## Não fazer

- Scraping de bases de radar
- Afirmar multa oficial
- Solicitar Always Location sem o recurso automático ativo

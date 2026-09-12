# Assistente Jurídico (Windows)

Pacote local para organizar PDFs de processos trabalhistas e gerar peças com IA (Groq gratuito).

## Correção desta versão

O programa **criava a pasta do processo**, mas **não analisava** porque o modelo Groq antigo
`llama-3.3-70b-versatile` foi desligado. Agora usa `openai/gpt-oss-120b`, migra a config
antiga automaticamente, e a tela avisa claramente se faltar chave ou se a IA falhar.

## No PC Windows

1. Copie a pasta `assistente-juridico` (ou o ZIP) para o desktop.
2. Dois cliques em `Iniciar.bat`.
3. Ajustes → Groq gratuito → cole a chave `gsk_...` → Salvar → **Testar IA**.
4. Importe o PDF e clique na peça desejada.

Detalhes: `PASSO_A_PASSO.txt` e `LEIA-ME.txt`.

# VOXIA 1.0 BETA.3 — Context Fix

## Correção do teste real de 05/10/2026
- Reproduzido no navegador: POST /api/context -> HTTP 502.
- Removida dependência padrão de gpt-5-nano (deprecated).
- Context usa Responses API + Structured Outputs (`text.format` / JSON Schema strict).
- Ordem de tentativa: VOXIA_CONTEXT_MODEL (se configurado), gpt-6-luna, gpt-5.4-nano, gpt-4o-mini.
- Limite de saída do Context aumentado de 300 para 800 tokens.
- GPT-6 Luna configurado com reasoning effort `none` para baixa latência.
- Timeout de 15s por tentativa.
- Diagnóstico de resposta incomplete, erro upstream e saída ausente.
- Logs: VOXIA_CONTEXT_OK / VOXIA_CONTEXT_FAIL com requestId e modelo.
- O cliente recebe código estável CONTEXT_UPSTREAM_FAILED se todos os modelos falharem.

## Verificação local
- node --check server/server.js: OK
- node --check public/app.js: OK
- node --check lib/engine.js: OK
- node --test test/engine.test.js: 11/11 PASS

## Não alegado como testado
- Chamada real OpenAI com a chave do projeto do usuário.
- Render/WebRTC/microfone após esta correção.
- Geração real de imagem após esta correção.

Esses pontos exigem novo deploy da BETA e teste real.

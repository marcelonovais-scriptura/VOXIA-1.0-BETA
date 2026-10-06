# VOXIA 1.0 BETA.2 — Candidate validation

## Alterações desta candidata
- Contexto migrou de JSON livre para Responses API com Structured Outputs (`text.format: json_schema`, `strict: true`).
- Decisão de cena agora passa por `buildDecision(..., previousScene)` e `shouldChangeScene()` no fluxo de runtime do servidor.
- Transcrições usam `item_id` e `previous_item_id` para reconciliar eventos concluídos fora de ordem antes de chamar o Contexto.
- Proteção de imagem obsoleta permanece no navegador por `latestImageJob`.
- Entrada de áudio tenta o dispositivo selecionado e, em `NotFoundError`/`OverconstrainedError`, tenta a entrada padrão.
- Ausência de entrada de áudio gera mensagem orientativa em português.
- v0.5 FAST não foi modificada.

## Testes executados localmente
- `node --test test/*.test.js`: 11/11 aprovados.
- `node --check`: engine, servidor e app do navegador sem erro de sintaxe.
- Casos: fragmento, baixa confiança, similaridade/cena, stale gate, cena conectada ao buildDecision, turnos C/B/A fora de ordem, transcrição vazia, resposta contextual vazia, baixa confiança impedindo troca.

## Não validado localmente
- Chamada real à OpenAI API (não foi usada credencial do usuário neste ambiente).
- Captura de microfone/WebRTC real em navegador.
- Deploy Render.
- Geração real de imagem.

Esses itens exigem o teste humano/integrado após deploy da candidata.

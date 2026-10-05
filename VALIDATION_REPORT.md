# VOXIA 1.0 BETA — Stability Candidate

Base: VOXIA_1.0_BETA_3_CONTEXT_FIX. A VOXIA v0.5 FAST não foi aberta, alterada nem incluída neste pacote.

## Implementado nesta rodada
- Compatibilidade de eventos Realtime `conversation.item.created` e `conversation.item.added`.
- Reconciliação causal por `item_id` / `previous_item_id`, com deduplicação.
- Fila serial do VOXIA Context para impedir respostas fora de ordem de reescreverem histórico/tela.
- Semantic VAD com `eagerness: low` para favorecer término de pensamento, sem resposta automática do modelo Realtime.
- Campo `impact` aditivo no Context, com fallback automático para `corrected` se a síntese não for projetável. O fluxo funcional da BETA.3 permanece disponível.
- VOXIA Scene continua ligada ao runtime e ao gate de confiança/similaridade.
- Imagens continuam assíncronas; requisição anterior é abortada e o job-id continua impedindo resultado obsoleto de entrar na tela.
- Reconexão WebRTC limitada a 3 tentativas com backoff.
- Botão LIMPAR limpa palco/imagem sem fechar WebRTC nem parar o microfone.

## Dupla verificação executada
1. Testes de algoritmo: reconciliação, confiança, scene gate, impacto/fallback, deduplicação e reset.
2. Testes de integração estática do runtime: rotas Realtime/Context/Image, serialização do Context, VAD, eventos, cancelamento de imagem, reconexão e LIMPAR.

Resultado: 23/23 testes Node aprovados. `node -c` aprovado para server/server.js, public/app.js e lib/engine.js.

## Limites desta validação
- OPENAI_API_KEY não estava disponível no ambiente de desenvolvimento desta rodada; portanto não foram executadas chamadas reais ao Realtime, Responses ou Images da OpenAI.
- O ambiente não concluiu `npm install` dentro do limite de execução, então não foi feito smoke HTTP real do Express nesta rodada.
- Microfone/WebRTC em navegador real não foi executado neste ambiente. Esses três pontos ficam explicitamente para o teste humano no ambiente Render já configurado.

## Referências arquiteturais consultadas
- Documentação oficial OpenAI Realtime: WebRTC, live transcription, Realtime conversations, VAD e API reference.
- openai/openai-realtime-console — MIT. Referência de WebRTC/data channel e observabilidade de eventos; nenhum código foi copiado.
- openai/openai-agents-js — MIT. Referência de ciclo de sessão/realtime; nenhum código foi copiado.
- livekit/agents — Apache-2.0. Referência de turn detection e lifecycle/reconnect; nenhum código foi copiado.

Esta candidata é deliberadamente incremental sobre a BETA.3 funcional e não é derivada da BETA.4 reprovada.

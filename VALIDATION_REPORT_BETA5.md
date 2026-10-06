# VOXIA 1.0 BETA.5 — Incremental Candidate

Base física: VOXIA_1.0_BETA_3.2_ORDERING_FIX. Preserva ordering causal, fila serial de Context, Semantic VAD, cancelamento de imagens obsoletas, reconexão limitada e LIMPAR sem desligar o microfone.

## Adições BETA.5
- Identidade VOXIA integrada ao lettering e favicon SVG.
- Medidor de áudio em tempo real.
- Gravação local do áudio da sessão via MediaRecorder.
- Registro cronológico de transcrição, decisão semântica, cena e imagem.
- Exportação do áudio e JSON da sessão.
- Regras explícitas anti-vazamento de prompt/JSON/comandos internos.
- Regra anti-legenda e bloqueio de pensamentos incompletos por baixa confiança.
- Regra conservadora para citações bíblicas: preservar o que foi falado e não completar versículos de memória.
- Versão/health atualizados para beta.5.

## Dupla verificação
1. Testes Node de algoritmo e integração estática.
2. Verificação sintática de server/server.js, public/app.js e lib/engine.js, mais inspeção do pacote final.

## Teste humano ainda obrigatório no Render
O npm install local atingiu o limite de rede deste ambiente; por isso o smoke HTTP não foi declarado como aprovado. WebRTC/microfone, chamadas reais à API, geração de imagem, gravação do navegador e download/exportação dependem do ambiente real e permissões do navegador e serão validados no Render.

# VOXIA 1.0 BETA.6 — SEMANTIC DOUBLE CHECK

Base: VOXIA 1.0 BETA.5 DOUBLE CHECK fornecida pelo usuário.

## Objetivo
Recuperar a linguagem visual semântica da v0.5 sem alterar o pipeline funcional aprovado da BETA.5.

## Alterações deliberadas
- Projeção pública continua usando `displayText || impact || corrected`; `display` permanece exclusivamente booleano.
- Nova composição semântica no navegador: palavras relevantes recebem destaque visual em cores.
- Densidade tipográfica automática reduz o tamanho conforme a frase cresce, evitando o efeito de legenda gigante.
- Logo fornecida pelo usuário integrada ao lado da marca VOXIA.
- Identificação de versão atualizada para BETA.6.

## Invariantes preservados
- WebRTC / OpenAI Realtime.
- Semantic VAD low.
- Turn reconciler / ordenação causal.
- Fila serial de contexto.
- Contrato `display` booleano e `displayText` textual.
- Motor de imagem `gpt-image-2`, quality low por padrão.
- AbortController + job id contra imagens obsoletas.
- Reconexão limitada.
- Gravação, exportação, medidor e LIMPAR.
- Proteções anti-vazamento, anti-legenda e citações bíblicas.

## Dupla verificação
- Sintaxe: `app.js`, `engine.js` e `server.js` aprovados por `node --check`.
- Testes automatizados: 35/35 aprovados, 0 falhas.
- Diff BETA.5 → BETA.6: no servidor, apenas identificação de versão mudou; endpoints Realtime, Context e Image permanecem intactos.
- Smoke HTTP local não contabilizado: o ambiente de validação não conseguiu instalar a dependência `express` dentro do limite de execução. Isso não foi tratado como aprovação nem como falha do código.

## Novas travas de regressão
1. Booleano nunca pode ser projetado como frase.
2. Composição semântica não substitui o contrato `displayText`.
3. Motor de imagem BETA.5 deve permanecer presente.
4. Logo deve estar empacotada.

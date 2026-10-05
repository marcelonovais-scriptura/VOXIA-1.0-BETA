# VOXIA 1.0 BETA.4 — Relatório de validação

Base preservada: VOXIA 1.0 BETA.3 CONTEXT FIX.

## Mudanças deliberadamente limitadas
- Contexto agora separa conteúdo público (`publicText`) de dados internos (`scene`, `imagePrompt`).
- Saída pública classificada em `impact`, `bible_quote` ou `none`.
- Fala comum: síntese semântica curta; não legenda literal.
- Citação bíblica clara: pode ser preservada integralmente.
- Filtro determinístico bloqueia padrões de instruções internas antes da projeção.
- Modo IMAGENS: frase e rótulo de cena ocultos; somente imagem gerada no palco.
- Botão LIMPAR restaurado; limpa texto/imagem/contexto visual sem fechar microfone/WebRTC.
- Proteção contra imagem obsoleta preservada.
- Ordenação causal por item_id e decisão local de cena preservadas.

## Verificação A — algoritmo
20/20 testes automatizados aprovados, incluindo regressão BETA.3, ordenação fora de ordem, baixa confiança, decisão de cena, imagem obsoleta, anti-vazamento, frase de impacto e citação bíblica.

## Verificação B — conexão ao runtime
Testes inspecionam o código efetivamente servido e confirmam:
- projeção usa `d.publicText`, nunca `raw`;
- modo IMAGENS oculta frase e cena;
- LIMPAR está conectado e não encerra WebRTC/microfone;
- proteção `latestImageJob` está presente no fluxo real de imagem.

## Verificações adicionais
- `node --check` aprovado para servidor, frontend e engine.
- sintaxe Node validada com `node --check` em servidor, frontend e engine.
- smoke test HTTP local não foi executado: a instalação local de `express` excedeu o tempo disponível neste ambiente. O pacote declara `express` corretamente em `package.json`; o teste de inicialização/HTTP permanece para o Render.

## Limite desta validação
Não foi executada chamada real à OpenAI nem captura de microfone neste ambiente, pois a chave e o dispositivo do usuário não estão disponíveis aqui. O teste final de integração deve ocorrer no Render, preservando a BETA.3 como referência de rollback.

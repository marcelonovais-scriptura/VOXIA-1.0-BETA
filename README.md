# VOXIA 1.0 BETA — Stability Candidate
Visual Semantic Director. Linha BETA separada da VOXIA v0.5 FAST.

## Fluxo
Microfone -> WebRTC/OpenAI Realtime -> transcrição ordenada por item_id -> VOXIA Context serial -> frase de impacto com fallback fiel -> VOXIA Scene -> imagem assíncrona cancelável.

## Render
Build: `npm install`
Start: `npm start`
Variável obrigatória: `OPENAI_API_KEY`
Node recomendado: 22+

## Testes
`npm test`

Leia `VALIDATION_REPORT.md` antes do teste humano.

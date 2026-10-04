# VOXIA 1.0 BETA
Visual Semantic Director. Beta separada da v0.5 estável.

## Modos
- FRASES
- IMAGENS
- IMAGENS + FRASES

## Motor
Microfone selecionável -> WebRTC -> OpenAI Realtime transcription -> VOXIA Context -> confidence gate -> VOXIA Scene -> imagem assíncrona com stale-response protection.

## Render
Build: `npm install`
Start: `npm start`
Variável obrigatória: `OPENAI_API_KEY`
Node recomendado: 22+

## Modelos configuráveis
VOXIA_REALTIME_MODEL, VOXIA_TRANSCRIBE_MODEL, VOXIA_CONTEXT_MODEL, VOXIA_IMAGE_MODEL, VOXIA_IMAGE_QUALITY.

## Segurança
A chave OpenAI fica apenas no servidor. Nunca é enviada ao navegador.

# Third-party research and notices
This VOXIA beta contains VOXIA-specific code. No third-party source code was copied or vendored in this package.

Architectural research consulted:
- OpenAI Realtime Console (openai/openai-realtime-console), MIT — WebRTC/data-channel and event-observability patterns.
- OpenAI Agents SDK JS (openai/openai-agents-js), MIT — realtime session lifecycle patterns.
- LiveKit Agents (livekit/agents), Apache-2.0 — turn-detection, lifecycle, and reconnect patterns.

Official OpenAI Realtime documentation was used as the protocol authority for event ordering, item_id reconciliation, semantic VAD, and disabling automatic responses.

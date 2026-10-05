const express=require('express');const path=require('path');const {buildDecision}=require('../lib/engine');
const app=express();app.use(express.json({limit:'3mb'}));app.use(express.text({type:'application/sdp',limit:'1mb'}));app.use(express.static(path.join(__dirname,'../public')));
const KEY=()=>process.env.OPENAI_API_KEY;
app.get('/api/health',(req,res)=>res.json({ok:true,name:'VOXIA',version:'1.0-beta.2-candidate',realtime:!!KEY()}));
app.post('/api/realtime',async(req,res)=>{
 if(!KEY())return res.status(503).send('OPENAI_API_KEY não configurada');
 try{
  const form=new FormData();form.set('sdp',req.body);
  form.set('session',JSON.stringify({type:'realtime',model:process.env.VOXIA_REALTIME_MODEL||'gpt-realtime-2.1-mini',output_modalities:['text'],audio:{input:{noise_reduction:{type:'far_field'},transcription:{model:process.env.VOXIA_TRANSCRIBE_MODEL||'gpt-4o-mini-transcribe',language:'pt',prompt:'Transcreva fielmente em português. Preserve nomes próprios e termos bíblicos quando presentes.'},turn_detection:{type:'semantic_vad'}}}}));
  const r=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:`Bearer ${KEY()}`},body:form});const body=await r.text();res.status(r.status).type('application/sdp').send(body);
 }catch(e){res.status(500).send(e.message)}
});
function extractText(j){if(j.output_text)return j.output_text;for(const o of j.output||[])for(const c of o.content||[])if(c.type==='output_text')return c.text;return ''}
const CONTEXT_SCHEMA={type:'object',additionalProperties:false,properties:{corrected:{type:'string'},confidence:{type:'number',minimum:0,maximum:1},sceneChanged:{type:'boolean'},scene:{type:'string'},imagePrompt:{type:'string'}},required:['corrected','confidence','sceneChanged','scene','imagePrompt']};
app.post('/api/context',async(req,res)=>{
 if(!KEY())return res.status(503).json({ok:false,message:'OPENAI_API_KEY não configurada'});
 const {transcript='',history='',previousScene=''}=req.body||{};
 if(!String(transcript).trim())return res.status(400).json({ok:false,message:'Transcrição vazia'});
 const instructions='Você é VOXIA Context + Scene, diretor visual semântico de uma apresentação ao vivo. Corrija somente erros de reconhecimento que o contexto torne claros; nunca invente conteúdo. Se houver ambiguidade, reduza confidence. corrected deve ser uma frase natural, completa, curta e fiel. Detecte mudança de CENA VISUAL, não mera troca de palavras. imagePrompt deve descrever somente a cena visual em 16:9, sem texto.';
 const input=`CENA ANTERIOR: ${String(previousScene).slice(-500)}\nCONTEXTO ANTERIOR: ${String(history).slice(-1200)}\nTRANSCRIÇÃO NOVA: ${String(transcript).slice(-700)}`;
 try{
  const payload={model:process.env.VOXIA_CONTEXT_MODEL||'gpt-5-nano',instructions,input,max_output_tokens:300,store:false,text:{format:{type:'json_schema',name:'voxia_context',description:'Decisão contextual e visual da VOXIA',strict:true,schema:CONTEXT_SCHEMA}}};
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${KEY()}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const j=await r.json();if(!r.ok)return res.status(r.status).json({ok:false,message:j?.error?.message||'Context API error'});
  const out=extractText(j);if(!out)return res.status(502).json({ok:false,message:'Contexto não retornou saída estruturada'});
  let parsed;try{parsed=JSON.parse(out)}catch{return res.status(502).json({ok:false,message:'Falha ao ler saída estruturada do Contexto'})}
  res.json({ok:true,...buildDecision(parsed,previousScene)});
 }catch(e){res.status(500).json({ok:false,message:e.message})}
});
function safePrompt(p=''){return `VOXIA live presentation background. ${String(p).slice(0,1200)}. Cinematic landscape 16:9, visually clear, tasteful, family-safe, no text, no captions, no typography, no logos, no watermark, leave calm negative space for optional overlay text.`}
app.post('/api/image',async(req,res)=>{
 if(!KEY())return res.status(503).json({ok:false,message:'OPENAI_API_KEY não configurada'});
 try{const body={model:process.env.VOXIA_IMAGE_MODEL||'gpt-image-2',prompt:safePrompt(req.body?.prompt),size:'1536x1024',quality:process.env.VOXIA_IMAGE_QUALITY||'low',output_format:'jpeg',output_compression:72,n:1};const r=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${KEY()}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json();if(!r.ok)return res.status(r.status).json({ok:false,message:j?.error?.message||'Falha na imagem'});const d=j?.data?.[0];res.json({ok:true,imageUrl:d?.b64_json?`data:image/jpeg;base64,${d.b64_json}`:d?.url||null});}catch(e){res.status(500).json({ok:false,message:e.message})}
});
app.listen(process.env.PORT||3000,()=>console.log('VOXIA 1.0 BETA on '+(process.env.PORT||3000)));

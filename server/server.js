const express=require('express');const path=require('path');const {buildDecision}=require('../lib/engine');
const app=express();app.use(express.json({limit:'3mb'}));app.use(express.text({type:'application/sdp',limit:'1mb'}));app.use(express.static(path.join(__dirname,'../public')));
const KEY=()=>process.env.OPENAI_API_KEY;
app.get('/api/health',(req,res)=>res.json({ok:true,name:'VOXIA',version:'1.0-beta.3-context-fix',realtime:!!KEY()}));
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
function contextModels(){
 const configured=String(process.env.VOXIA_CONTEXT_MODEL||'').trim();
 return [...new Set([configured,'gpt-6-luna','gpt-5.4-nano','gpt-4o-mini'].filter(Boolean))];
}
function contextDiagnostic(j={}){
 return {status:j.status||null,incomplete:j.incomplete_details?.reason||null,error:j.error?.message||null,outputTypes:(j.output||[]).map(x=>x.type)};
}
async function callContextModel(model,instructions,input){
 const payload={model,instructions,input,max_output_tokens:800,store:false,text:{format:{type:'json_schema',name:'voxia_context',description:'Decisão contextual e visual da VOXIA',strict:true,schema:CONTEXT_SCHEMA}}};
 // Luna supports disabling reasoning; other models safely ignore absence of this field.
 if(model==='gpt-6-luna')payload.reasoning={effort:'none'};
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${KEY()}`,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 let j={};const raw=await r.text();try{j=raw?JSON.parse(raw):{}}catch{j={error:{message:'Resposta não-JSON da API'}}}
 if(!r.ok){const err=new Error(j?.error?.message||`OpenAI HTTP ${r.status}`);err.upstreamStatus=r.status;err.diagnostic=contextDiagnostic(j);throw err}
 const out=extractText(j);
 if(!out){const err=new Error(j.status==='incomplete'?`Resposta incompleta${j.incomplete_details?.reason?': '+j.incomplete_details.reason:''}`:'Contexto sem texto estruturado');err.upstreamStatus=502;err.diagnostic=contextDiagnostic(j);throw err}
 let parsed;try{parsed=JSON.parse(out)}catch{const err=new Error('Saída estruturada não pôde ser interpretada');err.upstreamStatus=502;err.diagnostic={...contextDiagnostic(j),sample:String(out).slice(0,180)};throw err}
 return parsed;
}
app.post('/api/context',async(req,res)=>{
 const requestId=`ctx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
 if(!KEY())return res.status(503).json({ok:false,code:'NO_API_KEY',requestId,message:'OPENAI_API_KEY não configurada'});
 const {transcript='',history='',previousScene=''}=req.body||{};
 if(!String(transcript).trim())return res.status(400).json({ok:false,code:'EMPTY_TRANSCRIPT',requestId,message:'Transcrição vazia'});
 const instructions='Você é VOXIA Context + Scene, diretor visual semântico de uma apresentação ao vivo. Corrija somente erros de reconhecimento que o contexto torne claros; nunca invente conteúdo. Se houver ambiguidade, reduza confidence. corrected deve ser uma frase natural, completa, curta e fiel. Detecte mudança de CENA VISUAL, não mera troca de palavras. imagePrompt deve descrever somente a cena visual em 16:9, sem texto.';
 const input=`CENA ANTERIOR: ${String(previousScene).slice(-500)}\nCONTEXTO ANTERIOR: ${String(history).slice(-1200)}\nTRANSCRIÇÃO NOVA: ${String(transcript).slice(-700)}`;
 const failures=[];
 for(const model of contextModels()){
  try{
   const parsed=await callContextModel(model,instructions,input);
   console.log(`[VOXIA_CONTEXT_OK] ${requestId} model=${model}`);
   return res.json({ok:true,requestId,model,...buildDecision(parsed,previousScene)});
  }catch(e){
   failures.push({model,status:e.upstreamStatus||500,message:e.message,diagnostic:e.diagnostic||null});
   console.error(`[VOXIA_CONTEXT_FAIL] ${requestId} model=${model} status=${e.upstreamStatus||500} message=${e.message}`,e.diagnostic||'');
  }
 }
 const last=failures.at(-1)||{};
 return res.status(502).json({ok:false,code:'CONTEXT_UPSTREAM_FAILED',requestId,message:'Falha temporária no VOXIA Context',detail:last.message||'sem detalhe'});
});
function safePrompt(p=''){return `VOXIA live presentation background. ${String(p).slice(0,1200)}. Cinematic landscape 16:9, visually clear, tasteful, family-safe, no text, no captions, no typography, no logos, no watermark, leave calm negative space for optional overlay text.`}
app.post('/api/image',async(req,res)=>{
 if(!KEY())return res.status(503).json({ok:false,message:'OPENAI_API_KEY não configurada'});
 try{const body={model:process.env.VOXIA_IMAGE_MODEL||'gpt-image-2',prompt:safePrompt(req.body?.prompt),size:'1536x1024',quality:process.env.VOXIA_IMAGE_QUALITY||'low',output_format:'jpeg',output_compression:72,n:1};const r=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${KEY()}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json();if(!r.ok)return res.status(r.status).json({ok:false,message:j?.error?.message||'Falha na imagem'});const d=j?.data?.[0];res.json({ok:true,imageUrl:d?.b64_json?`data:image/jpeg;base64,${d.b64_json}`:d?.url||null});}catch(e){res.status(500).json({ok:false,message:e.message})}
});
app.listen(process.env.PORT||3000,()=>console.log('VOXIA 1.0 BETA on '+(process.env.PORT||3000)));

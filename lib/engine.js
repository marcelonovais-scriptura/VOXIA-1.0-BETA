const MODES=new Set(['phrases','images','both']);
function normalizeMode(v){return MODES.has(v)?v:'both'}
function cleanPhrase(s=''){return String(s).replace(/\s+/g,' ').replace(/\s+([,.!?;:])/g,'$1').trim()}
function validPhrase(s,confidence=.0,max=220){s=cleanPhrase(s);if(confidence<0.72)return false;if(s.length<5||s.length>max)return false;const words=s.split(/\s+/);if(words.length<2)return false;const dangling=/\b(a|o|as|os|de|da|do|das|dos|em|no|na|nos|nas|para|por|com|sem|que|se|e|ou|mas|porque|quando|como|um|uma)$/i;return !dangling.test(s)}
function looksInternalInstruction(s=''){const x=cleanPhrase(s).toLowerCase();if(!x)return false;const patterns=[/\btranscreva\b/,/\bpreserve nomes\b/,/\btermos bíblicos\b/,/\bquando presentes\b/,/\binstruç(ão|ões)\b/,/\bimage\s*prompt\b/,/\bprompt\b/,/\bjson\b/,/\bschema\b/,/\bconfidence\b/,/\bscenechanged\b/,/\bcena anterior\b/,/\bcontexto anterior\b/,/\btranscrição nova\b/,/\bsem texto\b.*\bsem legenda\b/,/\bvisual semantic director\b/];return patterns.some(r=>r.test(x))}
function publicTextAllowed(s,confidence=0,kind='impact'){const max=kind==='bible_quote'?700:180;return !looksInternalInstruction(s)&&validPhrase(s,confidence,max)}
function tokenize(s=''){return new Set(String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(x=>x.length>3))}
function similarity(a,b){const A=tokenize(a),B=tokenize(b);if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(1,Math.min(A.size,B.size))}
function shouldChangeScene(prev,next,{sceneChanged=false,confidence=1}={}){if(!next||confidence<.65)return false;if(!prev)return true;if(sceneChanged)return true;return similarity(prev,next)<.34}
class SceneGate{constructor(){this.latest=0;this.current=0}issue(){return ++this.latest}accept(id){if(id!==this.latest)return false;this.current=id;return true}}
function buildDecision(raw={},previousScene=''){
 const confidence=Math.max(0,Math.min(1,Number(raw.confidence)||0));
 const kind=['impact','bible_quote','none'].includes(raw.kind)?raw.kind:(raw.corrected?'impact':'none');
 const publicText=cleanPhrase(raw.publicText||raw.corrected||'');
 const scene=cleanPhrase(raw.scene||'');
 const modelSceneChanged=!!raw.sceneChanged;
 const safePublic=publicTextAllowed(publicText,confidence,kind)?publicText:'';
 return {kind,publicText:safePublic,corrected:safePublic,display:!!safePublic&&kind!=='none',confidence,sceneChanged:shouldChangeScene(previousScene,scene,{sceneChanged:modelSceneChanged,confidence}),scene,imagePrompt:cleanPhrase(raw.imagePrompt||'')};
}
class TurnReconciler{
 constructor(onTurn){this.onTurn=onTurn;this.items=new Map();this.lastDelivered=null;this.sequence=[]}
 created(itemId,previousItemId=null){if(!itemId)return;const x=this.items.get(itemId)||{};Object.assign(x,{itemId,previousItemId,created:true});this.items.set(itemId,x);if(!this.sequence.includes(itemId))this.sequence.push(itemId);this.flush()}
 completed(itemId,transcript){if(!itemId||!cleanPhrase(transcript))return;const x=this.items.get(itemId)||{itemId,previousItemId:null};Object.assign(x,{transcript:cleanPhrase(transcript),completed:true});this.items.set(itemId,x);if(!this.sequence.includes(itemId))this.sequence.push(itemId);this.flush()}
 flush(){let progressed=true;while(progressed){progressed=false;let next=null;if(this.lastDelivered){next=[...this.items.values()].find(x=>x.completed&&!x.delivered&&x.previousItemId===this.lastDelivered)}else{next=[...this.items.values()].find(x=>x.completed&&!x.delivered&&(x.previousItemId===null||x.previousItemId===undefined));}if(!next){const pending=this.sequence.map(id=>this.items.get(id)).filter(x=>x?.completed&&!x.delivered);if(pending.length===1&&!pending[0].created)next=pending[0]}if(next){next.delivered=true;this.lastDelivered=next.itemId;this.onTurn(next);progressed=true}}}
}
module.exports={normalizeMode,cleanPhrase,validPhrase,looksInternalInstruction,publicTextAllowed,similarity,shouldChangeScene,SceneGate,buildDecision,TurnReconciler};

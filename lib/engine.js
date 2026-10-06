const MODES=new Set(['phrases','images','both']);
function normalizeMode(v){return MODES.has(v)?v:'both'}
function cleanPhrase(s=''){return String(s).replace(/\s+/g,' ').replace(/\s+([,.!?;:])/g,'$1').trim()}
function validPhrase(s,confidence=.0){s=cleanPhrase(s);if(confidence<0.72)return false;if(s.length<5||s.length>180)return false;const words=s.split(/\s+/);if(words.length<2)return false;const dangling=/\b(a|o|as|os|de|da|do|das|dos|em|no|na|nos|nas|para|por|com|sem|que|se|e|ou|mas|porque|quando|como|um|uma)$/i;return !dangling.test(s)}
function tokenize(s=''){return new Set(String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(x=>x.length>3))}
function similarity(a,b){const A=tokenize(a),B=tokenize(b);if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(1,Math.min(A.size,B.size))}
function shouldChangeScene(prev,next,{sceneChanged=false,confidence=1}={}){if(!next||confidence<.65)return false;if(!prev)return true;if(sceneChanged)return true;return similarity(prev,next)<.34}
class SceneGate{constructor(){this.latest=0;this.current=0}issue(){return ++this.latest}accept(id){if(id!==this.latest)return false;this.current=id;return true}}
function buildDecision(raw={},previousScene=''){
 const confidence=Math.max(0,Math.min(1,Number(raw.confidence)||0));
 const corrected=cleanPhrase(raw.corrected||'');const impact=cleanPhrase(raw.impact||'');const scene=cleanPhrase(raw.scene||'');
 const displayText=validPhrase(impact,confidence)?impact:corrected;
 const modelSceneChanged=!!raw.sceneChanged;
 return {corrected,impact,displayText,display:validPhrase(displayText,confidence),confidence,sceneChanged:shouldChangeScene(previousScene,scene,{sceneChanged:modelSceneChanged,confidence}),scene,imagePrompt:cleanPhrase(raw.imagePrompt||'')};
}
class TurnReconciler{
 constructor(onTurn){this.onTurn=onTurn;this.items=new Map();this.sequence=[];this.delivered=new Set()}
 created(itemId,previousItemId=null,isAudioUser=false){if(!itemId)return;const x=this.items.get(itemId)||{itemId};Object.assign(x,{previousItemId,created:true,isAudioUser:!!isAudioUser});this.items.set(itemId,x);if(!this.sequence.includes(itemId))this.sequence.push(itemId);this.flush()}
 completed(itemId,transcript){if(!itemId||!cleanPhrase(transcript)||this.delivered.has(itemId))return;const x=this.items.get(itemId)||{itemId};Object.assign(x,{transcript:cleanPhrase(transcript),completed:true});this.items.set(itemId,x);if(!this.sequence.includes(itemId))this.sequence.push(itemId);this.flush()}
 flush(){let progressed=true;while(progressed){progressed=false;for(const id of this.sequence){const x=this.items.get(id);if(!x?.completed||this.delivered.has(id))continue;const prev=x.previousItemId;const prevKnown=prev&&this.items.has(prev);const prevItem=prevKnown?this.items.get(prev):null;const prevPending=prevItem?.isAudioUser&&!this.delivered.has(prev);if(prevPending)continue;this.delivered.add(id);x.delivered=true;this.onTurn(x);progressed=true;break}}}
 reset(){this.items.clear();this.sequence=[];this.delivered.clear()}
}
module.exports={normalizeMode,cleanPhrase,validPhrase,similarity,shouldChangeScene,SceneGate,buildDecision,TurnReconciler};

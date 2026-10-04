const test=require('node:test');const assert=require('node:assert/strict');const {validPhrase,similarity,shouldChangeScene,SceneGate,buildDecision,normalizeMode}=require('../lib/engine');
test('frase duvidosa não vai ao telão',()=>{assert.equal(validPhrase('talvez caminho',.51),false)});
test('fragmento pendente é bloqueado',()=>{assert.equal(validPhrase('a teu respeito para que',.95),false)});
test('frase completa e confiável passa',()=>{assert.equal(validPhrase('O Senhor é o meu pastor.',.93),true)});
test('três modos válidos',()=>{assert.equal(normalizeMode('phrases'),'phrases');assert.equal(normalizeMode('images'),'images');assert.equal(normalizeMode('both'),'both');assert.equal(normalizeMode('x'),'both')});
test('mesmo tema pode mudar de cena',()=>{assert.equal(shouldChangeScene('pastor em verdes pastos','vale escuro e profundo',{sceneChanged:true,confidence:.94}),true)});
test('cena semanticamente próxima pode ser mantida',()=>{assert.ok(similarity('pastor conduz ovelhas em pastos verdes','ovelhas seguem pastor pelos pastos')>.4)});
test('resposta de imagem velha nunca substitui nova',()=>{const g=new SceneGate();const a=g.issue(),b=g.issue();assert.equal(g.accept(a),false);assert.equal(g.accept(b),true)});
test('buildDecision bloqueia baixa confiança',()=>{const d=buildDecision({corrected:'Eu te ensino o caminho.',confidence:.4,sceneChanged:true,scene:'caminho'});assert.equal(d.display,false);assert.equal(d.sceneChanged,true)});

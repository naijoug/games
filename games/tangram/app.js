/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.TangramCore, levels = window.TangramLevels;
  const $ = id => document.getElementById(id);
  const key = 'mini-games:tangram:progress:v1';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(key)) || {}; } catch (_) {}
  if (!saved || saved.version !== 1) saved = {};
  const completed = new Set(Array.isArray(saved.completed) ? saved.completed.filter(id => levels.some(l => l.id === id)) : []);
  let levelIndex = Math.max(0, levels.findIndex(l => l.id === saved.last));
  let state, hint = null, epoch = 0;
  function persist() { try { localStorage.setItem(key, JSON.stringify({version:1,completed:[...completed],last:levels[levelIndex].id})); } catch (_) {} }
  function say(text) { $('status').textContent = text; }
  function button(text, fn, label) { const b=document.createElement('button'); b.type='button'; b.textContent=text; if(label)b.setAttribute('aria-label',label); b.onclick=fn; return b; }
  function grid(rows,cols,draw) {
    const focus=document.activeElement?.dataset?.cell; $('board').replaceChildren(); $('board').style.setProperty('--cols',cols);
    for(let i=0;i<rows*cols;i++){const b=button('',()=>onCell(i),`第 ${Math.floor(i/cols)+1} 行，第 ${i%cols+1} 列`);b.className='cell';b.dataset.cell=i;draw(b,i);$('board').append(b);}
    if(focus!==undefined)$('board').querySelector(`[data-cell="${focus}"]`)?.focus({preventScroll:true});
  }
  function finish() { if(state.status==='won'){completed.add(levels[levelIndex].id);persist();say('完成啦！你可以再玩一次，或选择下一关。');} $('progress').textContent=`第 ${levelIndex+1} / ${levels.length} 关 · 已完成 ${completed.size} 关`; }
  function reset(){epoch++;hint=null;state=C.createGame(levels[levelIndex]);$('level').value=levelIndex;persist();say(levels[levelIndex].instruction||'慢慢观察，可以随时重开或查看提示。');render();}
  levels.forEach((l,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`第 ${i+1} 关`; $('level').append(o);});
  $('level').onchange=()=>{levelIndex=Number($('level').value);reset();};
  $('restart').onclick=reset;
  $('next').onclick=()=>{levelIndex=(levelIndex+1)%levels.length;reset();};
  $('undo').onclick=()=>{if(C.undo){epoch++;state=C.undo(state);hint=null;say('已撤销。');render();}};
  $('hint').onclick=()=>{hint=C.getHint?.(state);showHint();render();};
  let selected=0;
const G=window.TangramGeometry, colors=['#eca680','#84c8b4','#cbb4eb','#ffdc86','#8ebdde','#dc9eb8','#b9cf8a'];
function onCell(){}
function act(change){state=C.transformPiece(state,selected,change);hint=null;render();}
function render(){const board=$('board');board.className='big-board';const target=C.polys(state.level.solution);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 20 20');svg.setAttribute('aria-label','上方是目标轮廓，下方是七块图形');svg.style.touchAction='none';const make=(poly,attrs)=>{const e=document.createElementNS(svg.namespaceURI,'polygon');e.setAttribute('points',poly.map(p=>p.join(',')).join(' '));for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);svg.append(e);return e;};target.forEach((p,i)=>make(p,{fill:'#314a3e',stroke:levelIndex<4?'#91ac9e':levelIndex<8&&i<3?'#91ac9e':'#314a3e','stroke-width':.06}));if(hint)make(G.transform(C.SHAPES[hint.index],hint.piece),{fill:'none',stroke:'#ffdc86','stroke-width':.15,'stroke-dasharray':'.3 .2'});C.polys(state.pieces).forEach((poly,i)=>{const e=make(poly,{fill:colors[i],stroke:selected===i?'#ffffff':'#101c17','stroke-width':selected===i?.16:.06,'data-piece':i});const label=document.createElementNS(svg.namespaceURI,'text');label.setAttribute('x',poly.reduce((a,p)=>a+p[0],0)/poly.length);label.setAttribute('y',poly.reduce((a,p)=>a+p[1],0)/poly.length);label.setAttribute('font-size','.6');label.setAttribute('text-anchor','middle');label.setAttribute('pointer-events','none');label.textContent=i+1;svg.append(label);e.onpointerdown=ev=>{ev.preventDefault();selected=i;const rect=svg.getBoundingClientRect(),start={x:ev.clientX,y:ev.clientY},old=state.pieces[i],token=epoch;svg.setPointerCapture(ev.pointerId);svg.onpointerup=up=>{svg.onpointerup=null;svg.onpointercancel=null;if(token!==epoch)return;act({x:old.x+Math.round((up.clientX-start.x)*20/rect.width),y:old.y+Math.round((up.clientY-start.y)*20/rect.height)});};svg.onpointercancel=()=>{svg.onpointerup=null;render();};};});board.replaceChildren(svg);$('controls').replaceChildren();for(let i=0;i<7;i++){const b=button('图块 '+(i+1),()=>{selected=i;render();});if(i===selected)b.classList.add('selected');$('controls').append(b);}for(const [name,dx,dy] of [['←',-1,0],['→',1,0],['↑',0,-1],['↓',0,1]])$('controls').append(button(name,()=>act({x:state.pieces[selected].x+dx,y:state.pieces[selected].y+dy})));$('controls').append(button('旋转',()=>act({rotation:state.pieces[selected].rotation+1})),button('翻面',()=>{if(selected===4)act({flipped:!state.pieces[4].flipped});else say('只有第 5 块平行四边形需要翻面。');}));finish();}
function showHint(){say(hint?'虚线是第 '+(hint.index+1)+' 块的一种参考摆法，可以调整其他图块。':'已经拼好啦！');}
window.addEventListener('keydown',e=>{if(e.target.tagName==='SELECT')return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(d){e.preventDefault();act({x:state.pieces[selected].x+d[0],y:state.pieces[selected].y+d[1]});}});
  reset();
})();

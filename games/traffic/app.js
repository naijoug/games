/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.TrafficCore, levels = window.TrafficLevels;
  const $ = id => document.getElementById(id);
  const key = 'mini-games:traffic:progress:v1';
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
  let selected='A';
function onCell(i){const v=state.vehicles.find(v=>C.cells(v).includes(i));if(v){selected=v.id;render();}}
function act(d){epoch++;state=C.moveVehicle(state,selected,d);hint=null;render();}
function render(){grid(6,6,(b,i)=>{const v=state.vehicles.find(v=>C.cells(v).includes(i));if(v){b.textContent=(v.id===state.level.targetId?'★':v.id)+(v.axis==='h'?'↔':'↕');if(v.id===selected)b.classList.add('player');if(hint?.id===v.id)b.classList.add('hint');const token=epoch;b.onpointerdown=e=>{selected=v.id;const x=e.clientX,y=e.clientY,unit=$('board').getBoundingClientRect().width/6;b.setPointerCapture(e.pointerId);b.onpointerup=up=>{if(token!==epoch)return;const d=Math.round((v.axis==='h'?up.clientX-x:up.clientY-y)/unit);act(d);};};}if(i===17)b.style.borderRight='4px solid #ffd477';});$('controls').replaceChildren();state.vehicles.forEach(v=>$('controls').append(button((v.id===state.level.targetId?'★ ':'')+v.id,()=>{selected=v.id;render();})));const v=state.vehicles.find(v=>v.id===selected)||state.vehicles[0];$('controls').append(button(v.axis==='h'?'← 左移':'↑ 上移',()=>act(-1)),button(v.axis==='h'?'→ 右移':'↓ 下移',()=>act(1)));finish();}
function showHint(){}
$('hint').onclick=()=>{const token=++epoch;const search=TrafficSolver.search(state);say('正在观察当前车位……');function tick(){if(token!==epoch)return;const r=search.step();if(r.status==='searching'){setTimeout(tick,0);return;}hint=r.path?.[0]||null;say(hint?'试着移动 '+hint.id+' 车 '+Math.abs(hint.delta)+' 格，方向：'+(state.vehicles.find(v=>v.id===hint.id).axis==='h'?(hint.delta>0?'右':'左'):(hint.delta>0?'下':'上')):'可以先撤销几步或重开，再试试。');render();}tick();};
  reset();
})();

/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.MakeTenCore, levels = window.MakeTenCore.MODES;
  const $ = id => document.getElementById(id);
  const key = 'mini-games:make-ten:progress:v1';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(key)) || {}; } catch (_) {}
  if (!saved || saved.version !== 1) saved = {};
  const completed = new Set(Array.isArray(saved.completed) ? saved.completed.filter(id => levels.some(l => l.id === id)) : []);
  let levelIndex = Math.max(0, levels.findIndex(l => l.id === saved.last));
  let state, hint = null, epoch = 0;
  function persist() { try { localStorage.setItem(key, JSON.stringify({version:1,completed:[...completed],last:levels[levelIndex].id,numbers,rounds})); } catch (_) {} }
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
  let numbers=saved.numbers===true,wonEpoch=-1,rounds=Number.isSafeInteger(saved.rounds)&&saved.rounds>=0?saved.rounds:0;
$('undo').hidden=true;$('level').options[0].textContent='凑 5';$('level').options[1].textContent='凑 10';$('next').hidden=true;
function onCell(i){state=C.selectCard(state,state.cards[i].id);hint=null;render();if(state.locked){const token=epoch;say('这两张加起来还不等于 '+state.target+'，再试试。');setTimeout(()=>{if(token!==epoch)return;state=C.resolveAttempt(state);render();},900);}}
function render(){grid(2,4,(b,i)=>{const card=state.cards[i];b.style.aspectRatio='auto';b.style.minHeight='100px';b.setAttribute('aria-label','卡片 '+(i+1)+'，数量 '+card.value);if(numbers)b.textContent=card.value;else{const frame=document.createElement('span');frame.className='ten-frame';for(let n=0;n<10;n++){const dot=document.createElement('span');dot.textContent=n<card.value?'●':'·';frame.append(dot);}b.append(frame);}if(state.selectedIds.includes(card.id))b.classList.add('selected');if(state.matchedIds.includes(card.id)){b.style.visibility='hidden';b.disabled=true;}if(hint?.ids.includes(card.id))b.classList.add('hint');});$('controls').replaceChildren(button(numbers?'切换数量图':'切换数字',()=>{numbers=!numbers;persist();render();}));if(state.status==='won'&&wonEpoch!==epoch){wonEpoch=epoch;rounds++;persist();}finish();$('progress').textContent='目标 '+state.target+' · 已完成 '+rounds+' 局';}
function showHint(){say(hint?.text||'全都配好啦！');}
  reset();
})();

/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.SymmetryCore, levels = window.SymmetryLevels;
  const $ = id => document.getElementById(id);
  const key = 'mini-games:symmetry:progress:v1';
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
  let color=1;const glyph=['','●','▲','■'],colors=['#182b25','#8bd5b2','#e5b889','#b7b0df'];
function onCell(i){state=C.paintCell(state,i,color);hint=null;render();}
function render(){const l=state.level;grid(l.size,l.size,(b,i)=>{b.textContent=glyph[state.cells[i]];b.style.background=colors[state.cells[i]];if(state.cells[i])b.style.color='#13241c';if(l.readonly.includes(i)){b.disabled=true;b.classList.add('given');}if(hint&&(hint.index===i||hint.source===i))b.classList.add('hint');if(l.axis==='vertical'&&i%l.size===l.size/2-1)b.style.borderRight='4px solid #ffd477';if(l.axis==='horizontal'&&Math.floor(i/l.size)===l.size/2-1)b.style.borderBottom='4px solid #ffd477';});$('controls').replaceChildren();for(let v=0;v<=(levelIndex<6?1:3);v++){const b=button(v?glyph[v]:'橡皮',()=>{color=v;render();});if(v===color)b.classList.add('selected');$('controls').append(b);} $('controls').append(button('检查',()=>{state=C.checkAnswer(state);say(state.status==='won'?'':'再比较一下镜子两边，也要留意哪些格子应该空着。');render();}));finish();}
function showHint(){say(hint?'比较虚线标出的两个格子，它们离镜子一样远。':'图案已对称，点击检查完成吧。');}
  reset();
})();

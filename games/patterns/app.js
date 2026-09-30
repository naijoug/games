/* Browser interaction stays separate from the pure rules. */
(() => {
  const C = window.PatternCore, levels = window.PatternLevels;
  const $ = id => document.getElementById(id);
  const key = 'mini-games:patterns:progress:v1';
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
  $('undo').hidden=true;
function glyph(v){return state.level.dual?['小圆 ●','大圆 ⬤','小方 ▪','大方 ■'][v]:['●','▲','■','★'][v];}
function onCell(){}
function render(){const board=$('board');board.className='sequence';board.replaceChildren();const l=state.level;let group;for(let i=0;i<l.sequence.length;i++){if(i%l.unit.length===0){group=document.createElement('div');group.className='pattern-group';board.append(group);}const s=document.createElement('span');s.className='piece';s.textContent=i===l.blankIndex?'？':glyph(l.sequence[i]);if(i%l.unit.length===0)s.style.borderLeft='3px solid #89dab5';group.append(s);} $('controls').replaceChildren();l.options.forEach(v=>$('controls').append(button(glyph(v),()=>{state=C.answer(state,v);say(state.status==='won'?'':'再看看每组相同位置，试另一个答案。');render();},`选择 ${glyph(v)}`)));finish();}
function showHint(){say('每组重复的是：'+hint.map(glyph).join(' → ')+'。问号在这一组的第 '+(state.level.blankIndex%hint.length+1)+' 个位置。');}
  reset();
})();

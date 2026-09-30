(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PipeCore=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
"use strict";
const DIRS=[[-1,0],[0,1],[1,0],[0,-1]];
function mask(cell){let m=cell.mask;for(let i=0;i<cell.rotation;i++)m=((m<<1)&15)|((m>>3)&1);return m;}
function createGame(level){return {level,cells:level.cells.map(c=>({...c})),history:[],status:'playing'};}
function rotateCell(s,i){if(!Number.isInteger(i)||!s.cells[i]||s.cells[i].locked||!s.cells[i].mask)return s;const cells=s.cells.map((c,j)=>j===i?{...c,rotation:(c.rotation+1)%4}:c);return {...s,cells,history:[...s.history,s.cells],status:'playing'};}
function undo(s){return s.history.length?{...s,cells:s.history.at(-1),history:s.history.slice(0,-1),status:'playing'}:s;}
function traceWater(s){const n=s.level.size,queue=[s.level.source],seen=new Set(queue),leaks=[];for(let k=0;k<queue.length;k++){const i=queue[k],m=mask(s.cells[i]);for(let d=0;d<4;d++){if(!(m&(1<<d)))continue;const [dr,dc]=DIRS[d],r=Math.floor(i/n)+dr,c=i%n+dc;if(r<0||c<0||r>=n||c>=n){if(!(i===s.level.source&&d===3||i===s.level.goal&&d===1))leaks.push(i);continue;}const j=r*n+c;if(!(mask(s.cells[j])&(1<<((d+2)%4)))){leaks.push(i);continue;}if(!seen.has(j)){seen.add(j);queue.push(j);}}}return {path:queue,leaks:[...new Set(leaks)],won:seen.has(s.level.goal)&&!leaks.length};}
function checkAnswer(s){return {...s,status:traceWater(s).won?'won':'playing'};}
function getHint(s){const t=traceWater(s);return t.won?null:{index:t.leaks[0]??s.level.source,text:'虚线处的开口还没接好。比较它和相邻管道，再试着旋转。'};}
return {mask,createGame,rotateCell,undo,traceWater,checkAnswer,getHint};
});

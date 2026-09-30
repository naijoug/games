(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MazeCore=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
"use strict";
const DIRS={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]};
function createGame(level){const rows=level.map.length,cols=level.map[0].length;let player,goal;let starts=0,goals=0;level.map.forEach((line,r)=>{if(line.length!==cols||/[^# SG]/.test(line))throw Error('Invalid map');[...line].forEach((v,c)=>{if(v==='S'){player=r*cols+c;starts++;}if(v==='G'){goal=r*cols+c;goals++;}});});if(starts!==1||goals!==1)throw Error('Invalid endpoints');return {level,rows,cols,player,goal,moves:0,history:[],status:'playing'};}
function nextCell(s,p,d){if(!DIRS[d])return null;const [dr,dc]=DIRS[d],r=Math.floor(p/s.cols)+dr,c=p%s.cols+dc;return r<0||c<0||r>=s.rows||c>=s.cols||s.level.map[r][c]==='#'?null:r*s.cols+c;}
function move(s,d){if(s.status==='won')return s;const p=nextCell(s,s.player,d);if(p===null)return s;return {...s,player:p,moves:s.moves+1,history:[...s.history,s.player],status:p===s.goal?'won':'playing'};}
function undo(s){if(!s.history.length)return s;return {...s,player:s.history.at(-1),history:s.history.slice(0,-1),moves:s.moves-1,status:'playing'};}
function getHint(s){const queue=[[s.player,[]]],seen=new Set([s.player]);for(let i=0;i<queue.length;i++){const [p,path]=queue[i];if(p===s.goal)return path[0]||null;for(const d of Object.keys(DIRS)){const n=nextCell(s,p,d);if(n!==null&&!seen.has(n)){seen.add(n);queue.push([n,[...path,d]]);}}}return null;}
return {createGame,move,undo,getHint,nextCell,DIRS};
});

(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./geometry.js'));else root.TangramCore=factory(root.TangramGeometry);})(typeof globalThis!=='undefined'?globalThis:this,function(G){
const SHAPES=[[[0,0],[4,0],[0,4]],[[0,0],[4,0],[0,4]],[[0,0],[4,0],[2,2]],[[0,0],[2,0],[2,2],[0,2]],[[0,0],[2,0],[4,2],[2,2]],[[0,0],[2,0],[0,2]],[[0,0],[2,0],[0,2]]];
function polys(pieces){return pieces.map((p,i)=>G.transform(SHAPES[i],p));}
function checkSolved(s){return G.covered(polys(s.pieces),polys(s.level.solution));}
function createGame(level){return {level,pieces:SHAPES.map((_,i)=>({x:1+(i%4)*4,y:12+Math.floor(i/4)*4,rotation:0,flipped:false})),history:[],status:'playing'};}
function transformPiece(s,i,change){if(!Number.isInteger(i)||i<0||i>=7)return s;const p={...s.pieces[i],...change};if(!Number.isInteger(p.x)||!Number.isInteger(p.y)||!Number.isInteger(p.rotation)||typeof p.flipped!=='boolean')return s;p.rotation=(p.rotation%4+4)%4;if(i!==4&&p.flipped)return s;if(G.transform(SHAPES[i],p).some(([x,y])=>x<0||y<0||x>20||y>20))return s;if(JSON.stringify(p)===JSON.stringify(s.pieces[i]))return s;const pieces=s.pieces.map((v,j)=>j===i?p:v);const next={...s,pieces,history:[...s.history,s.pieces]};next.status=checkSolved(next)?'won':'playing';return next;}
function undo(s){return s.history.length?{...s,pieces:s.history.at(-1),history:s.history.slice(0,-1),status:'playing'}:s;}
function getHint(s){const index=s.pieces.findIndex((p,i)=>JSON.stringify(p)!==JSON.stringify(s.level.solution[i]));return index<0?null:{index,piece:s.level.solution[index]};}
return {SHAPES,polys,checkSolved,createGame,transformPiece,undo,getHint};});

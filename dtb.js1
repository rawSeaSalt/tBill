(function(){
var INTERVAL_MS = 5000;
var busy = false;

function sleep(m){return new Promise(function(r){setTimeout(r,m)})}
function leaf(e){return e.children.length===0}
function onScreen(r){return r.width>0&&r.height>0&&r.bottom>0&&r.top<window.innerHeight&&r.right>0&&r.left<window.innerWidth}

function rows(){
var real=document.querySelectorAll('.marketwatch .instrument');
var out=[];
for(var i=0;i<real.length;i++){
var el=real[i], r=el.getBoundingClientRect();
if(onScreen(r)&&/\d{2,3}D\d{6}-TB/.test(el.textContent||''))out.push(el);
}
if(out.length)return out;
var re=/^\d{2,3}D\d{6}-TB$/,seen={},a=document.querySelectorAll('*');
for(var i=0;i<a.length;i++){
var e=a[i],t=(e.textContent||'').trim();
if(leaf(e)&&re.test(t)&&!seen[t]){var r2=e.getBoundingClientRect();if(onScreen(r2)){seen[t]=true;out.push(e)}}
}
return out;
}

function symText(rowEl){
var re=/\d{2,3}D\d{6}-TB/;
var a=rowEl.querySelectorAll('*');
for(var i=0;i<a.length;i++){var e=a[i];if(leaf(e)){var m=(e.textContent||'').trim().match(re);if(m)return m[0]}}
var m2=(rowEl.textContent||'').match(re);
return m2?m2[0]:null;
}

function allLeaves(){
var a=document.querySelectorAll('*'),o=[];
for(var i=0;i<a.length;i++){
var e=a[i];
if(leaf(e)){var t=(e.textContent||'').trim();if(t){var r=e.getBoundingClientRect();if(onScreen(r))o.push({t:t,top:r.top,left:r.left})}}
}
return o;
}
function sectionText(top,bottom,lvs){var items=[];for(var i=0;i<lvs.length;i++){var l=lvs[i];if(l.top>=top-5&&l.top<bottom)items.push(l)}items.sort(function(a,b){return a.top-b.top||a.left-b.left});return items.map(function(x){return x.t}).join(' ')}

function section(rowEl, allRows){
var r=rowEl.getBoundingClientRect();
var nextTop=Infinity;
for(var j=0;j<allRows.length;j++){if(allRows[j]!==rowEl){var rj=allRows[j].getBoundingClientRect();if(rj.top>r.top&&rj.top<nextTop)nextTop=rj.top}}
var bottom=Math.min(nextTop,r.top+800);
var lvs=allLeaves();
var txt=sectionText(r.top,bottom,lvs);
return {open:/Prev\.?\s*Close/i.test(txt), txt:txt};
}

function findS(scope){var a=scope.querySelectorAll('*');for(var i=0;i<a.length;i++){var e=a[i];if(leaf(e)&&(e.textContent||'').trim()==='S'){var r=e.getBoundingClientRect();if(onScreen(r))return e}}return null}
function expBtn(rowEl){var s=findS(rowEl);if(!s)return null;var btn=s.closest('button')||s.closest('[role="button"]')||s.parentElement;return btn?btn.nextElementSibling:null}

function tap(el){
var r=el.getBoundingClientRect();
var x=r.left+r.width/2,y=r.top+r.height/2;
var o={bubbles:true,cancelable:true,clientX:x,clientY:y,view:window};
try{el.dispatchEvent(new PointerEvent('pointerdown',Object.assign({pointerId:1},o)))}catch(e){}
try{el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[],targetTouches:[],changedTouches:[]}))}catch(e){}
try{el.dispatchEvent(new MouseEvent('mousedown',o))}catch(e){}
try{el.dispatchEvent(new PointerEvent('pointerup',Object.assign({pointerId:1},o)))}catch(e){}
try{el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],targetTouches:[],changedTouches:[]}))}catch(e){}
try{el.dispatchEvent(new MouseEvent('mouseup',o))}catch(e){}
try{el.click()}catch(e){}
}

function expiry(sym){var m=sym.match(/(\d{2,3})D(\d{2})(\d{2})(\d{2})-TB/);return m?new Date(2000+ +m[4],+m[3]-1,+m[2]):null}

async function ensureOpen(rowEl, allRows){
var info=section(rowEl, allRows);
if(info.open)return true;
for(var attempt=0;attempt<2;attempt++){
var btn=expBtn(rowEl);
if(!btn)return false;
tap(btn);
await sleep(550);
info=section(rowEl, allRows);
if(info.open)return true;
}
return false;
}

function extract(rowEl, allRows){
var sym=symText(rowEl);
var info=section(rowEl, allRows);
var ex=sym?expiry(sym):null,days=null,ask=null,pc=null,y=null,cmp=null;
if(ex)days=Math.round((ex-new Date())/86400000);
if(info.open){
var beforeOpen=info.txt.split(/\bOpen\b/i)[0];
var decs=(beforeOpen.match(/\d+\.\d{2}/g)||[]).map(parseFloat);
if(decs.length>1)ask=decs[1];
var pcm=info.txt.match(/Prev\.?\s*Close\s*([\d.]+)/i);
if(pcm)pc=parseFloat(pcm[1]);
if(ask!=null&&ask>0&&days>0)y=((100-ask)/ask)*(365/days)*100;
if(ask!=null&&pc!=null)cmp=ask<pc?'cheaper':ask>pc?'costlier':'same';
}
return {sym:sym||'?',days:days,ask:ask,pc:pc,y:y,cmp:cmp,open:info.open};
}

function render(R){
var body=document.getElementById('tbBody'),stamp=document.getElementById('tbStamp');
if(!body||!stamp)return;
if(!R||!R.length){body.innerHTML='<tr><td style="padding:6px" colspan="7">No T-Bill rows found</td></tr>';return}
var rowsHtml=R.map(function(r,i){
var ys=r.y!=null?r.y.toFixed(3)+'%':'N/A';
var cs=r.cmp==='cheaper'?'v cheap':r.cmp==='costlier'?'^ cost':r.cmp==='same'?'=':(r.open?'N/A':'closed');
var cc=r.cmp==='cheaper'?'#4f8':r.cmp==='costlier'?'#f66':'#ccc';
return'<tr><td class="tn">'+(i+1)+'</td><td class="tc">'+r.sym+'</td><td class="tc">'+(r.ask!=null?r.ask.toFixed(2):(r.open?'N/A':'—'))+'</td><td class="tc">'+(r.pc!=null?r.pc.toFixed(2):(r.open?'N/A':'—'))+'</td><td class="tc" style="color:'+cc+'">'+cs+'</td><td class="tc">'+(r.days!=null?r.days:'N/A')+'</td><td class="tn">'+ys+'</td></tr>';
}).join('');
body.innerHTML=rowsHtml;
var anyClosed=R.some(function(r){return !r.open});
stamp.innerHTML='Updated '+new Date().toLocaleTimeString()+(anyClosed?' &nbsp;|&nbsp; <span style="color:#f96">retrying closed rows…</span>':'');
}

async function tick(){
if(busy)return;
busy=true;
var S=rows();
if(!S.length){render(null);busy=false;return}
for(var i=0;i<S.length;i++){await ensureOpen(S[i], S)}
var R=S.map(function(r){return extract(r, S)});
R.sort(function(a,b){if(a.y==null&&b.y==null)return 0;if(a.y==null)return 1;if(b.y==null)return-1;return b.y-a.y});
render(R);
busy=false;
}

if(window.__tbInterval){clearInterval(window.__tbInterval);window.__tbInterval=null}
var old=document.getElementById('tbo');if(old)old.remove();

var d=document.createElement('div');
d.id='tbo';
d.style.cssText='position:fixed;bottom:0;left:0;right:0;max-height:55vh;overflow:auto;background:rgba(15,15,20,.88);z-index:999999999;padding:8px;font-family:sans-serif;font-size:12px;color:#fff';
d.innerHTML='<style>#tbo table{width:100%;border-collapse:collapse}#tbo .tn{color:#fd4;font-weight:700;padding:4px}#tbo .tc{padding:4px}#tbo .th{color:#9ca;border-bottom:1px solid #555}</style><div style="display:flex;justify-content:space-between;align-items:center"><span id="tbStamp" style="color:#9ca;font-size:10px"></span><span id="tbx" style="padding:4px 10px">X</span></div><table><tr class="th"><td class="tc">#</td><td class="tc">Sym</td><td class="tc">Ask</td><td class="tc">PrevCl</td><td class="tc">vsCl</td><td class="tc">Days</td><td class="tc">Yield</td></tr><tbody id="tbBody"></tbody></table>';
document.body.appendChild(d);
document.getElementById('tbx').onclick=function(){
if(window.__tbInterval){clearInterval(window.__tbInterval);window.__tbInterval=null}
d.remove();
};

tick();
window.__tbInterval=setInterval(tick, INTERVAL_MS);
})();

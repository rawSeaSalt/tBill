(function(){
var yieldStore = window.__tbYields || {};
window.__tbYields = yieldStore;

function leaf(e){return e.children.length===0}
function visible(r){return r.width>0&&r.height>0}

function symEls(){
var re=/^\d{2,3}D\d{6}-TB$/,seen={},out=[],a=document.querySelectorAll('*');
for(var i=0;i<a.length;i++){
var e=a[i],t=(e.textContent||'').trim();
if(leaf(e)&&re.test(t)&&!seen[t]){var r=e.getBoundingClientRect();if(visible(r)){seen[t]=true;out.push(e)}}
}
return out;
}

function expiry(sym){var m=sym.match(/(\d{2,3})D(\d{2})(\d{2})(\d{2})-TB/);return m?new Date(2000+ +m[4],+m[3]-1,+m[2]):null}
function daysLeft(sym){var ex=expiry(sym);return ex?Math.round((ex-new Date())/86400000):null}

function refreshTags(){
var S=symEls();
for(var i=0;i<S.length;i++){
var el=S[i], sym=el.textContent.replace(/\s*\[.*?\]/g,'').replace(/\s*\(.*?%\)/g,'').trim();
var d=daysLeft(sym);
if(d==null)continue;
var dayTag=el.querySelector('.tbDayTag');
if(!dayTag){
dayTag=document.createElement('span');
dayTag.className='tbDayTag';
dayTag.style.cssText='color:#0ff;font-weight:800;font-size:11px;margin-left:5px;text-shadow:0 0 4px rgba(0,255,255,.6)';
el.appendChild(dayTag);
el.style.cursor='pointer';
el.setAttribute('data-tbsym', sym);
if(el.getAttribute('data-tbbound')!=='1'){
el.addEventListener('click', function(s,dd){return function(){openPopup(s,dd)}}(sym,d));
el.setAttribute('data-tbbound','1');
}
}
dayTag.textContent=' ['+d+'d]';

var yTag=el.querySelector('.tbYieldTag');
if(yieldStore[sym]!=null){
if(!yTag){
yTag=document.createElement('span');
yTag.className='tbYieldTag';
yTag.style.cssText='color:#7fff00;font-weight:800;font-size:11px;margin-left:5px;text-shadow:0 0 4px rgba(127,255,0,.6)';
el.appendChild(yTag);
}
yTag.textContent=' ('+yieldStore[sym].toFixed(2)+'%)';
}
}
}

function closePopup(){var p=document.getElementById('tbPopup');if(p)p.remove()}

function makeDraggable(box, handle){
var ox=0,oy=0,dragging=false;
handle.style.cursor='move';
function start(x,y){dragging=true;var r=box.getBoundingClientRect();ox=x-r.left;oy=y-r.top}
function move(x,y){if(!dragging)return;box.style.left=(x-ox)+'px';box.style.top=(y-oy)+'px';box.style.transform='none'}
function end(){dragging=false}
handle.addEventListener('touchstart',function(e){var t=e.touches[0];start(t.clientX,t.clientY)},{passive:true});
handle.addEventListener('touchmove',function(e){var t=e.touches[0];move(t.clientX,t.clientY)},{passive:true});
handle.addEventListener('touchend',end);
handle.addEventListener('mousedown',function(e){start(e.clientX,e.clientY)});
document.addEventListener('mousemove',function(e){move(e.clientX,e.clientY)});
document.addEventListener('mouseup',end);
}

function openPopup(sym, days){
closePopup();
var ex=expiry(sym);

var box=document.createElement('div');
box.id='tbPopup';
box.style.cssText='position:fixed;top:30%;left:10%;width:80%;max-width:320px;background:rgba(20,20,25,0.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:0;color:#fff;font-family:sans-serif;z-index:999999999;box-shadow:0 8px 30px rgba(0,0,0,0.4)';

var handle=document.createElement('div');
handle.style.cssText='padding:10px 12px 6px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.15)';
var title=document.createElement('div');
title.textContent=sym;
title.style.cssText='font-weight:700;font-size:14px';
var xBtn=document.createElement('span');
xBtn.textContent='✕';
xBtn.style.cssText='cursor:pointer;padding:2px 8px;opacity:0.8';
xBtn.onclick=closePopup;
handle.appendChild(title);
handle.appendChild(xBtn);

var body=document.createElement('div');
body.style.cssText='padding:10px 12px 14px';

var sub=document.createElement('div');
sub.innerHTML='Matures '+(ex?ex.toDateString():'?')+' • <span style="color:#0ff;font-weight:800;text-shadow:0 0 4px rgba(0,255,255,.6)">'+days+' day'+(days===1?'':'s')+' left</span>';
sub.style.cssText='color:#ccd;font-size:11px;margin-bottom:12px';

var label=document.createElement('div');
label.textContent='Ask price';
label.style.cssText='font-size:12px;color:#ddd;margin-bottom:4px';

var input=document.createElement('input');
input.type='number';
input.step='0.01';
input.placeholder='e.g. 99.76';
input.style.cssText='width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.35);background:rgba(255,255,255,0.12);color:#fff;font-size:16px;margin-bottom:10px';

var result=document.createElement('div');
result.style.cssText='font-size:13px;min-height:20px';

function compute(){
var ask=parseFloat(input.value);
if(!ask||ask<=0||days<=0){result.innerHTML='';return}
var y=((100-ask)/ask)*(365/days)*100;
yieldStore[sym]=y;
result.innerHTML='Yield: <b style="color:#7fff00;text-shadow:0 0 4px rgba(127,255,0,.6)">'+y.toFixed(3)+'%</b><br>Discount to face: '+(100-ask).toFixed(2);
refreshTags();
}
input.addEventListener('input', compute);
if(yieldStore[sym]!=null)result.innerHTML='Last yield: <b style="color:#7fff00">'+yieldStore[sym].toFixed(3)+'%</b>';

body.appendChild(sub);
body.appendChild(label);
body.appendChild(input);
body.appendChild(result);
box.appendChild(handle);
box.appendChild(body);
document.body.appendChild(box);
makeDraggable(box, handle);
input.focus();
}

function sortRows(mode){
var S=symEls();
var data=S.map(function(el){
var sym=el.getAttribute('data-tbsym')||el.textContent.replace(/\s*\[.*?\]/g,'').replace(/\s*\(.*?%\)/g,'').trim();
return {el:el, d:daysLeft(sym), y:yieldStore[sym]};
});
data.sort(function(a,b){
if(mode==='days'){if(a.d==null)return 1;if(b.d==null)return -1;return a.d-b.d}
if(a.y==null&&b.y==null)return 0;if(a.y==null)return 1;if(b.y==null)return -1;return b.y-a.y;
});
var parent=data.length?data[0].el.parentElement:null;
if(!parent)return;
data.forEach(function(x){parent.appendChild(x.el)});
}

function ensureSortBar(){
if(document.getElementById('tbSortBar'))return;
var S=symEls();
if(!S.length)return;
var anchor=S[0];
var bar=document.createElement('div');
bar.id='tbSortBar';
bar.style.cssText='display:flex;gap:6px;padding:6px 8px;font-family:sans-serif;font-size:11px;background:rgba(0,0,0,0.05)';
var b1=document.createElement('span');
b1.textContent='Sort: Days';
b1.style.cssText='color:#0ff;text-shadow:0 0 4px rgba(0,255,255,.6);font-weight:700;padding:3px 8px;border:1px solid rgba(0,255,255,.4);border-radius:5px;cursor:pointer';
b1.onclick=function(){sortRows('days')};
var b2=document.createElement('span');
b2.textContent='Sort: Yield';
b2.style.cssText='color:#7fff00;text-shadow:0 0 4px rgba(127,255,0,.6);font-weight:700;padding:3px 8px;border:1px solid rgba(127,255,0,.4);border-radius:5px;cursor:pointer';
b2.onclick=function(){sortRows('yield')};
bar.appendChild(b1);
bar.appendChild(b2);
anchor.parentElement.insertBefore(bar, anchor);
}

refreshTags();
ensureSortBar();
if(window.__tbTagInterval)clearInterval(window.__tbTagInterval);
window.__tbTagInterval=setInterval(function(){refreshTags();ensureSortBar()}, 3000);
})();

export function createTouchControls({held,onPress,canPlay}) {
  const root=document.createElement('nav');root.id='touch-controls';root.setAttribute('aria-label','Touch movement controls');
  root.innerHTML='<div class="touch-pad"><button data-key="KeyW" class="touch-up" aria-label="Move forward">▲</button><button data-key="KeyA" class="touch-left" aria-label="Move left">◀</button><button data-key="KeyS" class="touch-down" aria-label="Move backward">▼</button><button data-key="KeyD" class="touch-right" aria-label="Move right">▶</button></div><button data-key="Space" class="touch-jump" aria-label="Jump">↑<small>JUMP</small></button>';
  document.body.append(root);
  const pointers=new Map(),query=matchMedia('(pointer: coarse)'),pad=root.querySelector('.touch-pad'),jump=root.querySelector('.touch-jump');
  function sync(){held.clear();for(const keys of pointers.values())for(const key of keys)held.add(key);root.querySelectorAll('button').forEach(b=>b.classList.toggle('pressed',held.has(b.dataset.key)))}
  function reset(){pointers.clear();sync()}
  function refresh(){document.body.classList.toggle('touch-enabled',navigator.maxTouchPoints>0&&query.matches);reset()}
  function directions(e){const r=pad.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,keys=new Set();if(Math.hypot(x,y)<11)return keys;const max=Math.max(Math.abs(x),Math.abs(y));if(Math.abs(x)>max*.45)keys.add(x<0?'KeyA':'KeyD');if(Math.abs(y)>max*.45)keys.add(y<0?'KeyW':'KeyS');return keys}
  function change(e,keys){const previous=pointers.get(e.pointerId)||new Set();for(const key of keys)if(!previous.has(key))onPress(key);pointers.set(e.pointerId,keys);sync()}
  function release(e){if(pointers.delete(e.pointerId))sync()}
  pad.addEventListener('pointerdown',e=>{if(!canPlay())return;e.preventDefault();e.stopPropagation();pad.setPointerCapture(e.pointerId);change(e,directions(e))});
  pad.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;e.preventDefault();if(!canPlay()){reset();return}change(e,directions(e))});
  jump.addEventListener('pointerdown',e=>{if(!canPlay())return;e.preventDefault();e.stopPropagation();jump.setPointerCapture(e.pointerId);change(e,new Set(['Space']))});
  for(const target of [pad,jump])for(const event of ['pointerup','pointercancel','lostpointercapture'])target.addEventListener(event,release);
  query.addEventListener('change',refresh);addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});refresh();
  return {reset};
}

export function createTouchControls({held,onPress,canPlay}) {
  const root=document.createElement('nav');root.id='touch-controls';root.setAttribute('aria-label','Touch movement controls');
  root.innerHTML='<div class="touch-pad"><button data-key="KeyW" class="touch-up" aria-label="Move forward">▲</button><button data-key="KeyA" class="touch-left" aria-label="Move left">◀</button><button data-key="KeyS" class="touch-down" aria-label="Move backward">▼</button><button data-key="KeyD" class="touch-right" aria-label="Move right">▶</button></div><button data-key="Space" class="touch-jump" aria-label="Jump">↑<small>JUMP</small></button>';
  document.body.append(root);
  const pointers=new Map(),query=matchMedia('(pointer: coarse)');
  function reset(){pointers.clear();held.clear();root.querySelectorAll('button').forEach(b=>b.classList.remove('pressed'))}
  function refresh(){document.body.classList.toggle('touch-enabled',navigator.maxTouchPoints>0&&query.matches);reset()}
  for(const button of root.querySelectorAll('button')){
    button.addEventListener('pointerdown',e=>{if(!canPlay())return;e.preventDefault();e.stopPropagation();button.setPointerCapture(e.pointerId);onPress(button.dataset.key);pointers.set(e.pointerId,button);held.add(button.dataset.key);button.classList.add('pressed')});
    function release(e){const b=pointers.get(e.pointerId);if(!b)return;pointers.delete(e.pointerId);if(![...pointers.values()].includes(b)){held.delete(b.dataset.key);b.classList.remove('pressed')}}
    button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  }
  query.addEventListener('change',refresh);addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});refresh();
  return {reset};
}

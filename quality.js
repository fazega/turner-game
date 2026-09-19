// Resolution adapts only after sustained slow frames, with hysteresis. Geometry
// and controls stay identical across presets; only pixel/shadow/reflection work changes.
export function createQualityController(renderer,water,sun){
  const settings=['auto','high','balanced','low'];
  let setting='auto',level='high',frame=0,samples=[],slowWindows=0,fastWindows=0,meanMs=16.7;
  function apply(next){
    level=next;
    const ratio=Math.min(devicePixelRatio,next==='high'?1.75:next==='balanced'?1.25:1);
    renderer.setPixelRatio(ratio);water.setQuality(next);
    const shadowSize=next==='high'?4096:next==='balanced'?2048:1024;
    if(sun.shadow.mapSize.x!==shadowSize){sun.shadow.mapSize.set(shadowSize,shadowSize);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}renderer.shadowMap.needsUpdate=true}
  }
  function set(value){if(!settings.includes(value))return;setting=value;samples=[];slowWindows=0;fastWindows=0;apply(value==='auto'?'high':value)}
  function tick(dt){
    frame++;
    if(frame<180||document.hidden||dt>.15)return;
    samples.push(dt*1000);
    if(samples.length<120)return;
    meanMs=samples.reduce((a,b)=>a+b,0)/samples.length;samples=[];
    if(setting!=='auto')return;
    slowWindows=meanMs>23?slowWindows+1:0;
    fastWindows=meanMs<17.2?fastWindows+1:0;
    if(slowWindows>=2&&level!=='low'){apply(level==='high'?'balanced':'low');slowWindows=0;fastWindows=0}
    else if(fastWindows>=8&&level!=='high'){apply(level==='low'?'balanced':'high');fastWindows=0;slowWindows=0}
  }
  apply('high');
  return {tick,set,get:()=>({setting,level,meanFrameMs:Math.round(meanMs*100)/100,pixelRatio:renderer.getPixelRatio(),reflectionSize:water.reflectionTarget.width,shadowSize:sun.shadow.mapSize.x})};
}

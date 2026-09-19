export function createCompass() {
  const root=document.createElement('aside');root.id='compass';root.setAttribute('aria-label','Compass');
  root.innerHTML='<div class="compass-window" aria-hidden="true"><div class="compass-strip"></div></div><span class="compass-pointer" aria-hidden="true"></span><output class="compass-bearing" aria-label="Heading"></output>';
  document.body.append(root);
  const strip=root.querySelector('.compass-strip'),bearing=root.querySelector('output');
  const directions=['N','NE','E','SE','S','SW','W','NW'];
  const ticks=[];
  for(let angle=0;angle<360;angle+=5){
    const tick=document.createElement('span');tick.className='compass-tick'+(angle%45===0?' compass-cardinal':angle%15===0?' compass-major':'');
    if(angle%45===0)tick.textContent=directions[angle/45];
    strip.append(tick);ticks.push({angle,tick});
  }
  let lastYaw=null,lastDegree=-1;
  return {update(yaw){
    if(yaw===lastYaw)return;lastYaw=yaw;
    // World north is -Z; turning clockwise toward +X increases the bearing.
    const heading=((-yaw*180/Math.PI)%360+360)%360;
    for(const {angle,tick}of ticks){const delta=((angle-heading+540)%360)-180;tick.style.transform=`translateX(${delta*2.6}px)`;}
    const degree=Math.round(heading)%360;
    if(degree!==lastDegree){lastDegree=degree;const direction=directions[Math.round(heading/45)%8];bearing.textContent=`${direction} · ${String(degree).padStart(3,'0')}°`;root.setAttribute('aria-label',`Compass: ${direction}, ${degree} degrees`)}
  }};
}

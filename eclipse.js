import * as T from './three.module.js';

export function createEclipse({scene,camera,setView,getFlying,onObserved}) {
  const center=new T.Vector3(-230,52.9,-529);
  const moon=new T.Mesh(new T.SphereGeometry(4.7,48,32),new T.MeshBasicMaterial({color:'#11151c',fog:false,toneMapped:false}));
  moon.name='Moon crossing the solar disc';moon.position.copy(center).multiplyScalar(.985);moon.position.x+=.45;moon.renderOrder=4;
  const planet=new T.Mesh(new T.SphereGeometry(.55,32,20),new T.MeshBasicMaterial({color:'#406c70',fog:false,toneMapped:false,transparent:true,depthTest:false,depthWrite:false}));
  planet.name='The uncharted wandering world';planet.renderOrder=100;
  const textureCanvas=document.createElement('canvas');textureCanvas.width=256;textureCanvas.height=128;const paint=textureCanvas.getContext('2d');for(let y=0;y<128;y++){const shade=100+Math.sin(y*.22)*18+Math.sin(y*.61)*7;paint.fillStyle=`rgb(${shade},${shade+42},${shade+40})`;paint.fillRect(0,y,256,1)}const texture=new T.CanvasTexture(textureCanvas);texture.colorSpace=T.SRGBColorSpace;planet.material.map=texture;planet.material.color.set('#ffffff');
  const ring=new T.Mesh(new T.TorusGeometry(.86,.035,8,48),new T.MeshBasicMaterial({color:'#d8c4a0',fog:false,transparent:true,depthTest:false,depthWrite:false}));ring.renderOrder=101;ring.rotation.x=1.05;planet.add(ring);
  const group=new T.Group();group.name='Eclipse discovery';group.userData.keepDynamic=true;group.add(moon,planet);group.traverse(o=>o.userData.keepDynamic=true);group.visible=false;scene.add(group);
  const panel=document.createElement('section');panel.id='eclipse-view';panel.hidden=true;
  panel.innerHTML='<div class="eyepiece"></div><div class="eclipse-caption"><p class="eyepiece-title">MIRA’S ECLIPSE GLASSES</p><h2>A moment between light and shadow</h2><p id="eclipse-note" role="status">Watch the edge of the sun…</p><button id="eclipse-discovery" disabled>1 · There is something moving…</button><button id="eclipse-leave">Lower the glasses · Esc</button></div>';
  document.body.append(panel);
  let saved=null,started=0,active=false;
  function close(observed=false){if(!active)return;active=false;panel.hidden=true;scene.getObjectByName('Solar haze').material.opacity=1;camera.fov=saved.fov;camera.near=saved.near;camera.updateProjectionMatrix();setView(saved.position,saved.target,saved.flying);saved=null;if(observed)onObserved()}
  panel.querySelector('#eclipse-leave').onclick=()=>close();
  panel.querySelector('#eclipse-discovery').onclick=()=>{if(!panel.querySelector('#eclipse-discovery').disabled)close(true)};
  function open(){if(active)return;const direction=camera.getWorldDirection(new T.Vector3());saved={position:camera.position.toArray(),target:camera.position.clone().add(direction).toArray(),fov:camera.fov,near:camera.near,flying:getFlying()};started=performance.now();active=true;scene.getObjectByName('Solar haze').material.opacity=.025;group.visible=true;camera.near=100;setView(saved.position,center.toArray(),true);panel.hidden=false;panel.querySelector('#eclipse-discovery').disabled=true;panel.querySelector('#eclipse-note').textContent='Watch the edge of the sun…';panel.querySelector('#eclipse-leave').focus({preventScroll:true})}
  function update(time,unlocked){group.visible=unlocked;const a=time*.22;planet.position.copy(center).multiplyScalar(.98);planet.position.x+=Math.cos(a)*8.2;planet.position.y+=Math.sin(a)*6.4;planet.rotation.y=time*.4;
    if(active){const elapsed=(performance.now()-started)/1000,t=Math.min(1,elapsed/1.8),smooth=t*t*(3-2*t);camera.fov=T.MathUtils.lerp(saved.fov,3.2,smooth);camera.updateProjectionMatrix();if(elapsed>4){panel.querySelector('#eclipse-discovery').disabled=false;panel.querySelector('#eclipse-note').textContent='A tiny ringed world is travelling around the darkened sun.'}}}
  return {open,close,update,observe:()=>panel.querySelector('#eclipse-discovery').click(),isOpen:()=>active,group};
}

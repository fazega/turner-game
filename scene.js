import {addPaintingTableau} from './painting-tableau.js';
import {welcomePlayer} from './welcome.js';
import {installKeyboardLabels} from './keyboard.js';
import * as T from './three.module.js';
import { material, materialStats } from './materials.js';
import { batchStatic } from './batching.js';
import { installShipLOD } from './lod.js';
import { createWater } from './water-surface.js';
import { createAtmosphere } from './atmosphere.js';
import { createQualityController } from './quality.js';
import { loadModelLibrary } from './assets-library.js';
import { preloadPBR } from './pbr.js';
import { preloadFoliage } from './foliage.js';
import { rowboat } from './rowboats.js';
import { addMicrodetails } from './microdetails.js';
import { createBirds } from './birds.js';
import { createQuest } from './quest.js';
import { loadCharacters } from './characters.js';
import { addHarbourActivity } from './harbour-activity.js';
import { enrichHarbour } from './harbour-life.js';
import { addLandscape } from './landscape.js';
let enteredWorld=false;
T.Cache.enabled=true;
installKeyboardLabels();
function loading(value,text){const bar=document.getElementById('load-progress');if(bar)bar.value=value;const label=document.getElementById('load-message');if(label)label.textContent=text}
let progress=2;T.DefaultLoadingManager.onProgress=(url,done,total)=>{progress=Math.max(progress,Math.round(done/total*65));loading(progress,'Loading the waterfront · '+progress+'%')};
const [assets,characters]=await Promise.all([loadModelLibrary(),loadCharacters(),preloadPBR(),preloadFoliage()]);
loading(70,'Building the harbour and city');await new Promise(requestAnimationFrame);
import { createDetailBuilders } from './details.js';
import { createShipBuilder } from './ships.js';
const scene=new T.Scene();scene.background=new T.Color('#c4ccd0');scene.fog=new T.FogExp2('#d2c5a2',.0085);
const camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.15,750);const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;document.body.prepend(renderer.domElement);
scene.add(new T.HemisphereLight('#dce5ef','#766344',1.65));const sun=new T.DirectionalLight('#ffdf9c',3.2);sun.position.set(-100,85,-160);scene.add(sun);sun.target.position.set(0,0,-5);scene.add(sun.target);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-120,right:120,top:110,bottom:-110,near:1,far:400});sun.shadow.bias=-.0003;sun.shadow.normalBias=.08;sun.shadow.camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;
renderer.info.autoReset=false;
let seed=147;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}const mat=material;const stone=mat('#b5a177',1,'masonry'),trim=mat('#d1b98b',1,'stone'),dark=mat('#494234'),wood=mat('#4a3323',.9,'timber'),goldwood=mat('#806449',.9,'timber'),rope=mat('#716044'),cloth=mat('#d5c49b',1,'canvas'),leaf=mat('#484c2c'),red=mat('#814837');
function mesh(g,m,x=0,y=0,z=0,parent=scene){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=!!m.isMeshStandardMaterial;o.receiveShadow=!!m.isMeshStandardMaterial;parent.add(o);return o}function box(x,y,z,w,h,d,m=stone,p=scene){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p)}function cyl(x,y,z,r,h,m=stone,p=scene,rt=r,n=10){const geo=new T.CylinderGeometry(rt,r,h,m===trim&&h>2.5&&r>.2&&r<1?48:n);if(m===trim&&h>2.5&&r>.2&&r<1){const v=geo.attributes.position;for(let i=0;i<v.count;i++){const a=Math.atan2(v.getZ(i),v.getX(i)),f=1-.035*(1+Math.cos(a*12));v.setX(i,v.getX(i)*f);v.setZ(i,v.getZ(i)*f)}geo.computeVertexNormals()}return mesh(geo,m,x,y,z,p)}function line(a,b,r=.04,m=rope,p=scene){let d=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a));let o=mesh(new T.CylinderGeometry(r,r,d.length(),5),m,0,0,0,p);o.position.copy(new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o}
const details=createDetailBuilders({scene,mesh,box,cyl,line,rand,stone,trim,wood,goldwood,rope,dark,assets,characters});
const atmosphere=createAtmosphere(scene);
const water=createWater(scene);
// The broad quay and its worn courses of limestone.
box(0,-1.2,31,170,2.8,42,stone);box(49,-1.2,-24,38,2.8,110,stone);box(0,.25,10.1,170,.5,1.4,trim);box(29.8,.25,-24,1.4,.5,70,trim);
const paving=mat('#d9cbb0',.98,'paving');
function pavedPlane(x,z,w,d){const geometry=new T.PlaneGeometry(w,d,Math.ceil(w),Math.ceil(d));const p=geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,.01*Math.sin(p.getX(i)*1.3)*Math.sin(p.getY(i)*2.1));geometry.computeVertexNormals();const surface=mesh(geometry,paving,x,.32,z);surface.rotation.x=-Math.PI/2;surface.castShadow=false;return surface}
pavedPlane(0,31,168,40);pavedPlane(49,-34,36,88);
for(let i=0;i<8;i++){box(17, -.08-i*.2,9-i*.65,16,.32,1.1,trim)}
const obstacles=[];
function palace(x,z,w,d,h){obstacles.push({x,z,w:w/2+.7,d:d/2+.7});box(x,h/2,z,w,h,d);for(let j=0;j<4;j++)box(x,2+j*(h-2)/3,z,w+.8,.35,d+.8,trim);box(x,h+.4,z,w+1.5,.7,d+1.5,trim);for(let xx=x-w/2+1;xx<x+w/2;xx+=2.3){box(xx,h+1.15,z-d/2,.25,1.3,.25,trim);box(xx,h+1.15,z+d/2,.25,1.3,.25,trim)}box(x,h+1.8,z,w+.4,.22,d+.4,trim);for(let side of [-1,1])for(let xx=x-w/2+2;xx<x+w/2-1;xx+=3.2){for(let yy=5;yy<h-1;yy+=4.6){box(xx,yy,z+side*(d/2+.025),1.05,2.2,.1,dark);let a=mesh(new T.TorusGeometry(.53,.12,5,12,Math.PI),trim,xx,yy+1.1,z+side*(d/2+.11));box(xx,yy-1.2,z+side*(d/2+.2),1.4,.2,.35,trim)}cyl(xx,3,z+side*(d/2+.45),.28,6,trim);box(xx,6.1,z+side*(d/2+.45),.9,.35,.9,trim)}for(let zz=z-d/2+2;zz<z+d/2;zz+=3.3){for(let yy=5;yy<h-1;yy+=4.6){box(x-w/2-.04,yy,zz,.1,2.2,1.15,dark);box(x-w/2-.18,yy-1.2,zz,.35,.2,1.5,trim)}cyl(x-w/2-.45,3,zz,.28,6,trim)} }
palace(49,-34,28,44,22);palace(58,19,26,15,31);palace(65,-73,32,21,17);palace(42,-52,9,10,29);
// Triumphal portico and the long waterfront arcade.
for(let i=0;i<8;i++){let z=-9-i*5.3;cyl(31.8,4,z,.48,8,trim);cyl(31.8,.6,z,.72,.4,trim);cyl(31.8,8,z,.75,.5,trim);box(33,8.6,z,4,.6,5.4,trim);let a=mesh(new T.TorusGeometry(2.2,.32,6,16,Math.PI),stone,31.8,5.6,z-2.65);a.rotation.y=Math.PI/2;}
for(let i=0;i<6;i++){let x=47+i*2.1;cyl(x,15,10.6,.52,27,trim);cyl(x,1.2,10.6,.78,.5,trim);cyl(x,28.6,10.6,.85,.8,trim)}box(52,29.4,10.5,14,1,2,trim);
const trees=details.grove();
// Distant towers fade into the luminous channel.

function tower(x,z,h){cyl(x,h/2,z,1.4,h,trim);for(let y=3;y<h;y+=4)cyl(x,y,z,1.8,.3,stone);cyl(x,h+1,z,1.6,2,stone,scene,.6);cyl(x,h+3,z,.15,3,wood)}tower(-20,-128,28);tower(17,-99,24);
// Stone foundations and a distant shoreline anchor the harbor towers.
box(77,-1.3,-172,150,2.8,118,stone);box(77,.45,-113,150,1.0,1.6,trim);
for(let i=0;i<32;i++){box(3+i*4.6,.35,-114,4.45,.9,.7,stone)}
for(const [x,z] of [[-20,-128],[17,-99]]){cyl(x,-.45,z,4.4,1.2,stone,scene,4.4,12);cyl(x,.3,z,3.3,.35,trim,scene,3.3,12);cyl(x,.65,z,2.1,.4,stone,scene,2.1,12)}
box(25,-.4,-99,16,1.3,5,stone);box(31,-.4,-88,5,1.3,26,stone);
const landscape=addLandscape(scene,assets);
// Built in three dimensions: curved hulls, decks, masts, sails and rigging.
const {ship,ships,sailTime}=createShipBuilder({scene,mesh,box,cyl,line,wood,goldwood,trim,rope,dark,details,rand,assets});
ship(-33,-14,1.25,-.25);ship(-62,-34,1.2,.25);ship(11,-55,.72,-.15);ship(-43,-102,.52,.25);ship(5,-155,.38,-.4);
const boats=[rowboat(scene,10,3,.7,details),rowboat(scene,-11,-18,-.4,details),rowboat(scene,24,-16,.3,details)];
// Small dockside stories: merchants, cargo, mooring ropes and birds.
details.architecture();details.quayLife();addMicrodetails({scene,details,box,cyl,line,trim,stone,wood,rope,assets,rand});
for(let x=-70;x<33;x+=10){cyl(x,.7,10.8,.18,1,wood);cyl(x,1.15,10.8,.25,.1,dark)}
const harbourLife=enrichHarbour({scene,details,box,cyl,line,wood,rope,trim,rand});
obstacles.push({x:33,z:39,w:2.5,d:1.0});
const activity=addHarbourActivity({scene,characters,details,box,cyl,line,wood,rope,trim,rand,obstacles});
const tableau=addPaintingTableau({scene,characters,details,box,line,wood,rope,obstacles});
const flock=createBirds(scene);
for(const t of trees)obstacles.push({x:t.x,z:t.z,w:1.6,d:1.6});
for(let i=0;i<8;i++)obstacles.push({x:31.8,z:-9-i*5.3,w:.72,d:.72});
const canWalk=(x,z)=>x>-82&&x<82&&z<49.4&&(z>11||(x>31&&z>-78))&&!obstacles.some(o=>Math.abs(x-o.x)<o.w&&Math.abs(z-o.z)<o.d);
function land(){
 if(!canWalk(camera.position.x,camera.position.z)){
  let found=false;for(let r=1;r<120&&!found;r+=1)for(let a=0;a<32;a++){
   const x=camera.position.x+Math.cos(a*Math.PI/16)*r,z=camera.position.z+Math.sin(a*Math.PI/16)*r;
   if(canWalk(x,z)){camera.position.x=x;camera.position.z=z;found=true;break}
  }if(!found)camera.position.set(7,2.25,29);
 }camera.position.y=2.25;
}
let yaw=.13,pitch=.055,flying=false,drag=false,jumpHeight=0,jumpVelocity=0;const keys=new Set();
camera.rotation.order='YXZ';
function reset(){camera.position.set(8,2.25,38);yaw=.18;pitch=.12;flying=false;jumpHeight=jumpVelocity=0;keys.clear()}
function setView(position,target,fly=true){camera.position.set(...position);camera.lookAt(...target);yaw=camera.rotation.y;pitch=camera.rotation.x;flying=fly;jumpHeight=jumpVelocity=0;keys.clear()}
reset();
const quest=createQuest({scene,camera,characters,canvas:renderer.domElement,clearMovement:()=>keys.clear(),setView,getFlying:()=>flying});
for(const npc of quest.npcs)obstacles.push({x:npc.root.position.x,z:npc.root.position.z,w:.55,d:.55});
let pointerStart=null,dragDistance=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(!enteredWorld||quest.isOpen())return;drag=true;pointerStart={x:e.clientX,y:e.clientY,button:e.button};dragDistance=0;renderer.domElement.setPointerCapture(e.pointerId)});
addEventListener('pointermove',e=>{if(drag&&!quest.isOpen()){dragDistance+=Math.abs(e.movementX)+Math.abs(e.movementY);yaw-=e.movementX*.002;pitch=Math.max(-1.4,Math.min(1.4,pitch-e.movementY*.002))}});
renderer.domElement.addEventListener('pointerup',e=>{const click=pointerStart?.button===0&&dragDistance<6;drag=false;pointerStart=null;if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);if(click)quest.interact(true)});
renderer.domElement.addEventListener('pointercancel',()=>{drag=false;pointerStart=null});renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{
 if(!enteredWorld)return;
 if(quest.keydown(e)){if(e.code!=='Tab'&&e.code!=='Enter')e.preventDefault();return}
 if(e.code==='KeyH'&&!e.repeat){const panel=document.querySelector('#commands');panel.classList.toggle('open');if(!panel.classList.contains('open'))panel.blur();return}
 if(e.code==='Escape'){document.querySelector('#commands').classList.remove('open');document.activeElement?.blur();return}
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);
 if(e.code==='Space'&&!e.repeat&&!flying&&jumpHeight===0){jumpVelocity=5.8;jumpHeight=.001}
 if(e.code==='KeyF'&&!e.repeat){flying=!flying;jumpHeight=jumpVelocity=0;if(!flying)land()}
 if(e.code==='KeyR'&&!e.repeat)reset();
});
addEventListener('keyup',e=>{keys.delete(e.code)});addEventListener('blur',()=>{keys.clear();drag=false});
loading(80,'Preparing the light');await new Promise(requestAnimationFrame);
const batchReport={ships:ships.map(g=>({sharedAsset:!!assets,meshes:7})),quay:batchStatic(scene,{cellSize:32,exclude:new Set(ships)})};
installShipLOD(ships);
scene.traverse(o=>{if(o.isMesh&&!o.userData.keepDynamic&&!ships.some(s=>s===o.parent))o.matrixAutoUpdate=false});
const envScene=new T.Scene();const envSky=scene.getObjectByName('Painted cloud sky').clone();envScene.add(envSky);const pmrem=new T.PMREMGenerator(renderer);const envTarget=pmrem.fromScene(envScene,.03,.1,600);scene.environment=envTarget.texture;scene.environmentIntensity=.4;pmrem.dispose();
const quality=createQualityController(renderer,water,sun);
loading(92,'Preparing the view');await new Promise(requestAnimationFrame);await renderer.compileAsync(scene,camera);
const clock=new T.Clock();let frames=0;function animate(){requestAnimationFrame(animate);let elapsed=clock.getDelta(),dt=Math.min(elapsed,.05),time=clock.elapsedTime;quality.tick(elapsed);let forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);let speed=((keys.has('ShiftLeft')||keys.has('ShiftRight'))?7:4.6)*dt;if(forward&&side){forward*=.707;side*=.707}let nx=camera.position.x+(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,nz=camera.position.z+(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed;if(flying){camera.position.x=nx;camera.position.z=nz;camera.position.y=Math.max(1,Math.min(90,camera.position.y+(keys.has('Space')?speed:0)-(keys.has('KeyC')?speed:0)+forward*Math.sin(pitch)*speed))}else{const valid=canWalk;if(valid(nx,camera.position.z))camera.position.x=nx;if(valid(camera.position.x,nz))camera.position.z=nz;if(jumpHeight>0||jumpVelocity>0){jumpHeight+=jumpVelocity*dt-9*dt*dt;jumpVelocity-=18*dt;if(jumpHeight<=0){jumpHeight=0;jumpVelocity=0}}camera.position.y=2.25+jumpHeight+(jumpHeight===0&&(forward||side)?Math.sin(time*9)*.035:0)}camera.rotation.set(pitch,yaw,0);water.material.uniforms.time.value=time;sailTime.value=time;assets.windTime.value=time;atmosphere.time.value=time;ships.forEach((g,i)=>{g.rotation.z=Math.sin(time*.45+i)*.009;g.position.y=g.userData.baseY+Math.sin(time*.6+i)*.06});landscape.update(time);flock.update(time);characters.update(time,camera);tableau.update(time);activity.update(time,camera);if(enteredWorld)quest.update(time);renderer.info.reset();renderer.render(scene,camera);frames++;}animate();
// The first rendered frame and shader preparation finish before entry is enabled.
loading(100,'The harbour awaits');
const enterButton=document.getElementById('enter-world');
enterButton.disabled=false;
enterButton.addEventListener('click',()=>{if(enteredWorld||enterButton.disabled)return;enteredWorld=true;keys.clear();document.getElementById('loading').remove();welcomePlayer();renderer.domElement.tabIndex=-1;renderer.domElement.focus({preventScroll:true})},{once:true});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});window.harbour={camera,renderer,scene,water,trees,batchReport,quality,reset,setView,quest,flock,characters,landscape,harbourLife,activity,getState:()=>({quest:quest.getState(),birds:flock.birds.length,cityHouses:landscape.houses,mountainRanges:landscape.ranges,position:camera.position.toArray(),flying,jumpHeight,jumpVelocity,grounded:!flying&&jumpHeight===0,frames,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,materials:materialStats(),reflectionPasses:water.reflectionPasses,trees:trees.length,assets:assets.loaded,quality:quality.get()})};


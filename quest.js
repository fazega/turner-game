import {movementCodes} from './keyboard.js';
import * as T from './three.module.js';
import { batchStatic } from './batching.js';
import { material } from './materials.js';

const SAVE='golden-harbour-last-light-v1';
export function createQuest({scene,camera,characters,canvas,clearMovement}){
 const $=id=>document.getElementById(id),dialog=$('dialogue'),hint=$('hint');
 let stage=0;try{const saved=JSON.parse(localStorage.getItem(SAVE));if(Number.isInteger(saved?.stage)&&saved.stage>=0&&saved.stage<4)stage=saved.stage}catch{}
 let current=null,hovered=null,toastTimer,oldFocus=null;
 const npcs=[],hitboxes=[],ray=new T.Raycaster(),mouse=new T.Vector2(2,2);
 const gold=new T.MeshStandardMaterial({color:'#b6954b',metalness:.7,roughness:.38}),leather=material('#302922'),skin=material('#b58c6d'),hair=material('#40352b');
 const targetIds=['mira','tomas','inez','mira',null];
 const objectives=['Speak to Mira, the harbor warden, beside the quay.','Find Tomas, the shipwright, at the far western cargo quay.','Take the brass frame to Inez, the chartmaker, along the eastern arcade.','Return the restored lens to Mira.','The beacon is lit. You are Keeper of the Evening Light.'];
 const inventory=['Empty','Mira’s seal','Brass lens frame','Restored beacon lens','Keeper’s brass token'];
 
 function ell(parent,mat,x,y,z,sx,sy,sz){const o=new T.Mesh(new T.SphereGeometry(1,24,16),mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 function rod(parent,mat,a,b,r){const v=new T.Vector3(...b).sub(new T.Vector3(...a)),o=new T.Mesh(new T.CylinderGeometry(r,r*.9,v.length(),12),mat);o.position.copy(new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());o.castShadow=true;parent.add(o);return o}
 function label(name,role){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.textAlign='center';ctx.shadowColor='#182018';ctx.shadowBlur=8;ctx.fillStyle='#f9e8bc';ctx.font='32px Georgia';ctx.fillText(name,256,50);ctx.font='18px Arial';ctx.fillStyle='#dfd3b6';ctx.fillText(role,256,82);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthTest:true,depthWrite:false}));s.scale.set(2.8,.7,1);s.position.y=2.63;return s}
 function character(id,name,role,x,z,color,hat){
  const root=characters.create(id);root.name=name+' · '+role;root.position.set(x,.32,z);scene.add(root);
  const plate=label(name,role);root.add(plate);
  const mark=new T.Mesh(new T.OctahedronGeometry(.09),new T.MeshBasicMaterial({color:'#ebc878'}));mark.name='Quest diamond';mark.position.y=2.22;root.add(mark);

  const hit=new T.Mesh(new T.BoxGeometry(.8,2.1,.7),new T.MeshBasicMaterial({visible:false}));hit.position.y=1.05;root.add(hit);hit.userData.id=id;hitboxes.push(hit);
  const npc={id,name,role,root,plate,mark,hit};npcs.push(npc);return npc;
 }
 character('mira','Mira','Harbor warden',4,20,'#345856',true);
 character('tomas','Tomas','Shipwright',-57,18,'#795039',false);
 character('inez','Inez','Chartmaker',33.2,-33.6,'#76545a',true);
 // The quest reward is visible in the world, not only in the journal.
 const beacon=new T.Group();beacon.name='The Last Light beacon';beacon.position.set(6,.32,18);beacon.userData.keepDynamic=true;scene.add(beacon);
 rod(beacon,leather,[0,0,0],[0,2.25,0],.095);ell(beacon,gold,0,.15,0,.27,.15,.27);
 const lensMaterial=new T.MeshStandardMaterial({color:'#71664a',emissive:'#ffbd55',emissiveIntensity:0,roughness:.18,metalness:.15});
 const lens=ell(beacon,lensMaterial,0,2.55,0,.24,.30,.24);
 for(let i=0;i<4;i++){const a=i*Math.PI/2;rod(beacon,gold,[Math.cos(a)*.27,2.2,Math.sin(a)*.27],[Math.cos(a)*.27,2.9,Math.sin(a)*.27],.025)}
 ell(beacon,gold,0,2.18,0,.34,.075,.34);ell(beacon,gold,0,2.91,0,.34,.08,.34);
 const light=new T.PointLight('#ffc56c',0,18,2);light.position.set(0,2.6,0);beacon.add(light);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const gc=glowCanvas.getContext('2d'),gradient=gc.createRadialGradient(64,64,2,64,64,64);gradient.addColorStop(0,'#fff2bfee');gradient.addColorStop(.18,'#ffd48c99');gradient.addColorStop(1,'#ffb74400');gc.fillStyle=gradient;gc.fillRect(0,0,128,128);
 const glow=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(glowCanvas),transparent:true,blending:T.AdditiveBlending,depthWrite:false}));glow.position.y=2.55;glow.scale.set(2.7,2.7,1);beacon.add(glow);
 function sync(){ $('objective').textContent=objectives[stage];$('quest-progress').textContent=`Step ${Math.min(stage+1,4)} of 4`;$('quest-status').textContent=stage===4?'Completed':'Ongoing';$('quest-status').className=stage===4?'completed':'ongoing';lensMaterial.emissiveIntensity=stage===4?5:0;light.intensity=stage===4?65:0;glow.visible=stage===4;}
 function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4200)}
 function advance(next){if(!current||distance(current)>4.8)return;if(next!==stage+1)return;stage=next;try{localStorage.setItem(SAVE,JSON.stringify({stage}))}catch{}sync();toast(stage===4?'The beacon burns again. Keeper of the Evening Light.':'Quest updated · '+objectives[stage]);}
 function distance(npc){return camera.position.distanceTo(npc.root.position.clone().add(new T.Vector3(0,1.6,0)))}
 function close(){dialog.hidden=true;if(current)current.root.userData.speaking=false;current=null;clearMovement();oldFocus?.focus?.({preventScroll:true});oldFocus=null;}
 function show(npc){if(distance(npc)>4.8){toast('Move closer to '+npc.name+' to speak.');return}current=npc;npc.root.userData.speaking=true;clearMovement();if(dialog.hidden)oldFocus=document.activeElement;dialog.hidden=false;hint.hidden=true;
  $('speaker').textContent=npc.role;let text='',choices=[];
  const choice=(label,next)=>({label,action:()=>{advance(next);close()}});
  if(npc.id==='mira'){
   if(stage===0){text='The tide is turning, and our last ship is still beyond the shoals. The beacon’s lens shattered this morning. Tomas kept its brass frame; Inez can fit the spare crystal. Will you help me bring them home?';choices=[choice('I’ll restore the beacon.',1),{label:'Perhaps later.',action:close}]}
   else if(stage===1)text='Take my seal to Tomas. Look west along the quay, beside the moored ships. His brass frame will hold the new crystal.';
   else if(stage===2)text='That is the frame. Inez waits east along the quay in a plum-colored coat. She has the crystal and the steady hands we need.';
   else if(stage===3){text='You have it! See how the crystal catches the sun? Set it inside the lantern. When dusk falls, every sailor on those shoals will know the way home.';choices=[choice('Fit the lens and light the beacon.',4)]}
   else{text='There—the light is steady. The ship will find the harbor. Keep this brass token, friend. So long as this beacon burns, there is a place for you on our quay.'}
  }else if(npc.id==='tomas'){
   if(stage===1){text='Mira sent you? I straightened the frame, but brass alone cannot guide a ship. Here, take it to Inez on the eastern quay. Tell her the tide will not wait.';choices=[choice('Take the brass lens frame.',2)]}
   else if(stage===0)text='A harbor is more than stone and rope. Ask Mira by the lantern what keeps it alive when the light fails.';
   else text='The frame is yours. Inez has the crystal; Mira has the flame. Put them together and we may yet see that ship come home.';
  }else{
   if(stage===2){text='A perfect fit. This crystal once belonged to my father’s charting lantern. Hold the frame still… There. Take the restored lens to Mira; the last light of the day is nearly gone.';choices=[choice('Take the restored beacon lens.',3)]}
   else if(stage<2)text='I saved a crystal for the beacon, but I need its brass frame. Speak to Mira first, then find Tomas west along the quay.';
   else text='A chart tells you where you are. A light tells you someone is waiting. Take care of ours.';
  }
  $('dialogue-title').textContent=npc.name;$('speech').textContent=text;$('choices').replaceChildren();if(!choices.length)choices=[{label:'Until we meet again.',action:close}];else if(choices.length===1)choices.push({label:'I’ll return shortly.',action:close});
  choices.forEach((c,i)=>{const b=document.createElement('button'),key=document.createElement('kbd'),label=document.createElement('span');key.textContent=String(i+1);key.setAttribute('aria-hidden','true');label.textContent=c.label;b.append(key,label);b.setAttribute('aria-keyshortcuts',String(i+1));b.onclick=c.action;$('choices').append(b)});$('choices').firstElementChild.focus({preventScroll:true});
 }
 canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1)});canvas.addEventListener('pointerleave',()=>mouse.set(2,2));
 function pick(){ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(hitboxes,false)[0];return hit?npcs.find(n=>n.id===hit.object.userData.id):null}
 function interact(click=false){if(!dialog.hidden)return;let npc=click?pick():npcs.reduce((a,n)=>!a||distance(n)<distance(a)?n:a,null);if(npc&&(click||distance(npc)<=4.8))show(npc)}
 function keydown(e){
  if(!dialog.hidden){
   if(movementCodes.has(e.code)||['Space','KeyC'].includes(e.code)){close();return false}
   if(e.code==='Escape'){close();return true}
   if(e.code==='Tab'){const bs=[...$('choices').children],i=bs.indexOf(document.activeElement);bs[(i+(e.shiftKey?-1:1)+bs.length)%bs.length].focus();e.preventDefault()}
   const digit=/^(?:Digit|Numpad)([1-4])$/.exec(e.code);if(digit&&!e.repeat){e.preventDefault();$('choices').children[Number(digit[1])-1]?.click()}
   return true;
  }
  if(e.code==='KeyE'&&!e.repeat){interact();return true}return false
 }

 function update(time){hovered=pick();const near=npcs.reduce((a,n)=>!a||distance(n)<distance(a)?n:a,null);const selected=hovered&&distance(hovered)<25?hovered:near&&distance(near)<4.8?near:null;
  hint.hidden=!dialog.hidden||!selected;if(selected)hint.textContent=distance(selected)<=4.8?`${selected.name} · ${hovered===selected?'Click or ':''}E to talk`:`${selected.name} · move closer (${Math.ceil(distance(selected))} m)`;
  for(const n of npcs){const d=distance(n);n.plate.visible=d<23;n.plate.material.opacity=Math.min(1,(23-d)/5);n.mark.visible=d<40;n.mark.rotation.y=time;n.mark.position.y=2.22+Math.sin(time*2)*.06;n.mark.material.color.set(n.id===targetIds[stage]?'#76c9d5':'#ebc878');if(d<9){const dx=camera.position.x-n.root.position.x,dz=camera.position.z-n.root.position.z;n.root.rotation.y=Math.atan2(-dx,-dz)}}
  if(stage===4)light.intensity=65+Math.sin(time*3)*3;
 }
 npcs.forEach(n=>n.root.traverse(o=>{o.userData.keepDynamic=true}));beacon.traverse(o=>{o.userData.keepDynamic=true});
 // Soft contact shadows keep feet and the lantern base grounded as characters turn.
 const sc=document.createElement('canvas');sc.width=sc.height=64;const sx=sc.getContext('2d'),sg=sx.createRadialGradient(32,32,1,32,32,32);sg.addColorStop(0,'rgba(22,19,12,.42)');sg.addColorStop(.4,'rgba(22,19,12,.25)');sg.addColorStop(1,'rgba(22,19,12,0)');sx.fillStyle=sg;sx.fillRect(0,0,64,64);
 const sm=new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});for(const root of [...npcs.map(n=>n.root),beacon]){const shadow=new T.Mesh(new T.PlaneGeometry(.85,.65),sm);shadow.rotation.x=-Math.PI/2;shadow.position.set(root.position.x,.343,root.position.z);scene.add(shadow)}
 sync();setTimeout(()=>toast(stage===0?'The Last Light · Meet Mira beside the quay lantern.':objectives[stage]),1800);
 return {update,interact,keydown,close,isOpen:()=>!dialog.hidden,npcs,beacon,getState:()=>({stage,objective:objectives[stage],inventory:inventory[stage],completed:stage===4,dialogue:current?.id??null,beaconLit:glow.visible})};
}

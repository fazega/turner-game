import {createEclipse} from './eclipse.js';
import {movementCodes} from './keyboard.js';
import * as T from './three.module.js';

const SAVE='golden-harbour-eclipse-v1';
export function createQuest({scene,camera,characters,canvas,clearMovement,setView,getFlying}){
 const $=id=>document.getElementById(id),dialog=$('dialogue'),hint=$('hint');
 let stage=0;try{const saved=JSON.parse(localStorage.getItem(SAVE));if(Number.isInteger(saved?.stage)&&saved.stage>=0&&saved.stage<=6)stage=saved.stage}catch{}
 let current=null,hovered=null,toastTimer,oldFocus=null;
 const npcs=[],hitboxes=[],ray=new T.Raycaster(),mouse=new T.Vector2(2,2);
 const targetIds=['mira','tomas','inez','mira','mira','mira',null];
 const objectives=['Speak to Mira, the harbour warden, beside the quay.','Ask Tomas, at the western cargo quay, what the eclipse means to sailors.','Ask Inez, along the eastern arcade, what causes an eclipse.','Return to Mira and share what you have learned.','Use Mira’s glasses to study the eclipse.','Tell Mira about the small world you spotted.','An unexpected discovery. Mira welcomes you as her pupil.'];
 const inventory=['Empty','A question for the harbour','Tomas’s account','Two perspectives on the eclipse','Mira’s eclipse glasses','Mira’s eclipse glasses','Mira’s eclipse glasses · An invitation to return'];
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
 const eclipse=createEclipse({scene,camera,setView,getFlying,onObserved:()=>{if(stage===4){stage=5;save();sync();show(npcs[0])}}});
 function save(){try{localStorage.setItem(SAVE,JSON.stringify({stage}))}catch{}}
 function sync(){ $('tracker-title').textContent='The Wandering Light';$('objective').textContent=objectives[stage];$('quest-progress').textContent=`Step ${Math.min(stage+1,6)} of 6`;$('quest-status').textContent=stage===6?'Completed':'Ongoing';$('quest-status').className=stage===6?'completed':'ongoing';}
 function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4200)}
 function advance(next){if(!current||distance(current)>4.8)return;if(next!==stage+1)return;stage=next;try{localStorage.setItem(SAVE,JSON.stringify({stage}))}catch{}sync();toast(stage===6?'A new pupil of the heavens.':'Quest updated · '+objectives[stage]);}
 function distance(npc){return camera.position.distanceTo(npc.root.position.clone().add(new T.Vector3(0,1.6,0)))}
 function close(){dialog.hidden=true;if(current)current.root.userData.speaking=false;current=null;clearMovement();oldFocus?.focus?.({preventScroll:true});oldFocus=null;}
 function show(npc){if(distance(npc)>4.8){toast('Move closer to '+npc.name+' to speak.');return}current=npc;npc.root.userData.speaking=true;clearMovement();if(dialog.hidden)oldFocus=document.activeElement;dialog.hidden=false;hint.hidden=true;
  $('speaker').textContent=npc.role;let text='',choices=[];
  const choice=(label,next)=>({label,action:()=>{advance(next);close()}});
  if(npc.id==='mira'){
   if(stage===0){text='Welcome, adventurer. See how the whole quay has turned toward the sun? An eclipse is approaching, and everyone has a different tale to tell. Ask Tomas what it means to those who sail, then find Inez and learn what is happening in the sky. Come back and tell me what you discover.';choices=[choice('I’ll ask around about the eclipse.',1),{label:'I’ll return in a moment.',action:close}]}
   else if(stage===1)text='Tomas is beside the cargo at the western end of the quay. Sailors have watched the heavens for generations. I wonder what he makes of today.';
   else if(stage===2)text='Now seek Inez beneath the eastern arcade. She charts the heavens as carefully as others chart the sea.';
   else if(stage===3){text='So, to Tomas it is a reminder of how small we are; to Inez, the Moon passing between us and the Sun. Wonder and understanding can belong together. You have listened well. Take these special viewing glasses, and let us watch the eclipse for ourselves.';choices=[{label:'Take the glasses and look toward the sun.',action:()=>{advance(4);close();eclipse.open()}}]}
   else if(stage===4){text='Your glasses are ready. Take your time: the most interesting things are often found at the edge of what we expect.';choices=[{label:'Put on the eclipse glasses.',action:()=>{close();eclipse.open()}}]}
   else if(stage===5){text='Well, adventurer—are you enjoying the eclipse?';choices=[{label:'There’s something moving around it… What is that?',action:()=>{advance(6);show(npc)}}]}
   else{text='Hmm… you are right. That looks like a little planet! An extraordinary observation, adventurer. Congratulations. Come back soon—with curiosity and eyes like yours, you will make a wonderful pupil.';choices=[{label:'I’ll be back. There is so much more to discover.',action:close},{label:'May I look through the glasses once more?',action:()=>{close();eclipse.open()}}]}
  }else if(npc.id==='tomas'){
   if(stage===1){text='At sea, an eclipse can make even an old captain fall silent. My grandmother called it the Sun holding its breath. Some sailors fear an omen; I see a reminder that our great ships are very small beneath this sky. Ask Inez for the reason—she has measurements where I have stories.';choices=[choice('A reminder of our place in the world. I’ll ask Inez.',2)]}
   else if(stage===0)text='The ropes can wait a moment. Something is changing in the light. Mira has been asking everyone what they make of it.';
   else text='Whatever the charts say, I shall remember the hush on this quay. Knowing why a thing happens need not make it less wonderful.';
  }else{
   if(stage===2){text='A solar eclipse happens when the Moon passes between us and the Sun, hiding part—or sometimes all—of its bright face. It is a meeting of paths, not a warning of disaster. To me, it means the sky can be understood, and still surprise us. Tell Mira that. She has special glasses prepared for your observation.';choices=[choice('The Moon crosses in front of the Sun. I’ll tell Mira.',3)]}
   else if(stage<2)text='I am plotting the Moon’s passage. Speak with Mira, and hear Tomas’s story first; a harbour has more than one way of looking at the heavens.';
   else text='Good observers compare what they expect with what they actually see. Keep watching. The smallest detail may lead to your next question.';
  }
  $('dialogue-title').textContent=npc.name;$('speech').textContent=text;$('choices').replaceChildren();if(!choices.length)choices=[{label:'Until we meet again.',action:close}];else if(choices.length===1)choices.push({label:'I’ll return shortly.',action:close});
  choices.forEach((c,i)=>{const b=document.createElement('button'),key=document.createElement('kbd'),label=document.createElement('span');key.textContent=String(i+1);key.setAttribute('aria-hidden','true');label.textContent=c.label;b.append(key,label);b.setAttribute('aria-keyshortcuts',String(i+1));b.onclick=c.action;$('choices').append(b)});$('choices').firstElementChild.focus({preventScroll:true});
 }
 function trackPointer(e){const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1)}canvas.addEventListener('pointermove',trackPointer);canvas.addEventListener('pointerdown',trackPointer);canvas.addEventListener('pointerleave',()=>mouse.set(2,2));
 function pick(){ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(hitboxes,false)[0];return hit?npcs.find(n=>n.id===hit.object.userData.id):null}
 function interact(click=false){if(eclipse.isOpen()||!dialog.hidden)return;let npc=click?pick():npcs.reduce((a,n)=>!a||distance(n)<distance(a)?n:a,null);if(npc&&(click||distance(npc)<=4.8))show(npc)}
 function keydown(e){
  if(eclipse.isOpen()){if(e.code==='Escape')eclipse.close();else if(!e.repeat&&['Digit1','Numpad1'].includes(e.code))eclipse.observe();return true}
  if(!dialog.hidden){
   if(movementCodes.has(e.code)||['Space','KeyC'].includes(e.code)){close();return false}
   if(e.code==='Escape'){close();return true}
   if(e.code==='Tab'){const bs=[...$('choices').children],i=bs.indexOf(document.activeElement);bs[(i+(e.shiftKey?-1:1)+bs.length)%bs.length].focus();e.preventDefault()}
   const digit=/^(?:Digit|Numpad)([1-4])$/.exec(e.code);if(digit&&!e.repeat){e.preventDefault();$('choices').children[Number(digit[1])-1]?.click()}
   return true;
  }
  if(e.code==='KeyE'&&!e.repeat){interact();return true}return false
 }

 function update(time){eclipse.update(time,stage>=4);if(eclipse.isOpen()){hint.hidden=true;return}hovered=pick();const near=npcs.reduce((a,n)=>!a||distance(n)<distance(a)?n:a,null);const selected=hovered&&distance(hovered)<25?hovered:near&&distance(near)<4.8?near:null;
  hint.hidden=!dialog.hidden||!selected;if(selected)hint.textContent=distance(selected)<=4.8?`${selected.name} · ${hovered===selected?'Click or ':''}E to talk`:`${selected.name} · move closer (${Math.ceil(distance(selected))} m)`;
  for(const n of npcs){const d=distance(n);n.plate.visible=d<23;n.plate.material.opacity=Math.min(1,(23-d)/5);n.mark.visible=d<40;n.mark.rotation.y=time;n.mark.position.y=2.22+Math.sin(time*2)*.06;n.mark.material.color.set(n.id===targetIds[stage]?'#76c9d5':'#ebc878');if(d<9){const dx=camera.position.x-n.root.position.x,dz=camera.position.z-n.root.position.z;n.root.rotation.y=Math.atan2(-dx,-dz)}}

 }
 npcs.forEach(n=>n.root.traverse(o=>{o.userData.keepDynamic=true}));
 // Soft contact shadows keep feet grounded as characters turn.
 const sc=document.createElement('canvas');sc.width=sc.height=64;const sx=sc.getContext('2d'),sg=sx.createRadialGradient(32,32,1,32,32,32);sg.addColorStop(0,'rgba(22,19,12,.42)');sg.addColorStop(.4,'rgba(22,19,12,.25)');sg.addColorStop(1,'rgba(22,19,12,0)');sx.fillStyle=sg;sx.fillRect(0,0,64,64);
 const sm=new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});for(const root of npcs.map(n=>n.root)){const shadow=new T.Mesh(new T.PlaneGeometry(.85,.65),sm);shadow.rotation.x=-Math.PI/2;shadow.position.set(root.position.x,.343,root.position.z);scene.add(shadow)}
 sync();
 return {update,interact,keydown,close,isOpen:()=>!dialog.hidden||eclipse.isOpen(),npcs,eclipse,getState:()=>({stage,objective:objectives[stage],inventory:inventory[stage],completed:stage===6,dialogue:current?.id??null,viewingEclipse:eclipse.isOpen()})};
}

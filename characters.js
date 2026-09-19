import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone} from './vendor/SkeletonUtils.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

export async function loadCharacters(){
 const loader=new GLTFLoader(),names=['Female_Ranger','Female_Peasant','Male_Peasant','Male_Ranger','Superhero_Female_FullBody','Superhero_Male_FullBody','Hair_Long','Hair_Buns','Hair_SimpleParted','Hair_Beard'];
 T.Cache.enabled=true;const sharedTextures=new Map();
 const motionPromise=fetch('./assets/characters/motion.json').then(r=>r.json());
 const loaded=await Promise.all(names.map(async n=>[n,(await loader.loadAsync('./assets/characters/'+n+'.gltf')).scene]));const templates=Object.fromEntries(loaded),instances=[],motion=await motionPromise;
 for(const [name,root]of loaded){root.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;o.frustumCulled=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.envMapIntensity=.45;m.roughness=Math.max(.58,m.roughness);if(/hair/i.test(m.name))m.color.set('#493322');for(const key of ['map','normalMap','roughnessMap','metalnessMap','aoMap'])if(m[key]){const tex=m[key],id=tex.name+'/'+tex.colorSpace+'/'+tex.channel+'/'+tex.flipY;if(sharedTextures.has(id)){m[key]=sharedTextures.get(id);if(m[key]!==tex)tex.dispose()}else{tex.anisotropy=8;sharedTextures.set(id,tex)}}}

 })}
 // Merge clothing pieces that share a rig and material before cloning the crew.
 for(const [name,root]of loaded){if(!/Peasant|Ranger/.test(name))continue;root.updateMatrixWorld(true);const groups=new Map();root.traverse(o=>{if(!o.isSkinnedMesh||o.name.includes('Head_Hood'))return;const key=o.material.uuid+'/'+o.skeleton.bones.map(b=>b.uuid).join()+'/'+Object.keys(o.geometry.attributes).sort().join();if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o)});for(const parts of groups.values()){if(parts.length<2)continue;const first=parts[0];if(!parts.every(p=>p.parent===first.parent&&p.matrix.equals(first.matrix)))continue;const geo=mergeGeometries(parts.map(p=>p.geometry));if(!geo)continue;const m=new T.SkinnedMesh(geo,first.material);m.name=name+' clothing';m.bind(first.skeleton,first.bindMatrix);m.castShadow=m.receiveShadow=true;first.parent.add(m);parts.forEach(p=>p.removeFromParent())}}
 function create(kind='mira',variant=0){
  const female=kind==='mira'||kind==='inez'||kind==='woman'||kind==='girl';const outfitName=kind==='mira'?'Female_Ranger':female?'Female_Peasant':kind==='guard'?'Male_Ranger':'Male_Peasant';
  const root=new T.Group(),figure=new T.Group();root.name='Quaternius character · '+kind;root.userData.keepDynamic=true;root.add(figure);
  const outfit=clone(templates[outfitName]),base=clone(templates[female?'Superhero_Female_FullBody':'Superhero_Male_FullBody']);figure.add(outfit,base);
  outfit.traverse(o=>{if(o.isMesh&&o.name.includes('Head_Hood'))o.visible=false});
  const hair=clone(templates[kind==='mira'?'Hair_Buns':female?'Hair_Long':'Hair_SimpleParted']);
  const head=base.getObjectByName('Head');if(kind==='boy'||kind==='girl')head.scale.multiplyScalar(1.10);base.updateMatrixWorld(true);
  hair.position.y=0;figure.add(hair);figure.updateMatrixWorld(true);head.attach(hair);
  if(!female&&kind!=='boy'){const beard=clone(templates.Hair_Beard);beard.position.y=0;figure.add(beard);figure.updateMatrixWorld(true);head.attach(beard)}
  figure.rotation.y=Math.PI;figure.scale.setScalar(female?1.02:1.01);figure.position.y=.012;
  const skeletons=new Map();root.traverse(o=>{o.userData.keepDynamic=true;if(o.isSkinnedMesh){o.frustumCulled=true;const key=o.skeleton.bones.map(b=>b.uuid).join();if(skeletons.has(key))o.skeleton=skeletons.get(key);else skeletons.set(key,o.skeleton)}});
  // Small color differences distinguish crew members without replacing PBR detail.
  if(variant||kind==='inez'){outfit.traverse(o=>{if(!o.isMesh)return;o.material=o.material.clone();o.material.color.multiply(new T.Color(kind==='inez'?'#c5acbd':variant%2?'#b7c2b2':'#ccbbaa'))})}
  const poseBones=[];for(const model of [outfit,base])model.traverse(b=>{if(b.isBone&&/^(pelvis|thigh_[lr]|calf_[lr]|foot_[lr]|ball_[lr]|spine_0[123])$/.test(b.name))poseBones.push({bone:b,rotation:b.quaternion.clone(),position:b.position.clone()})});
  const rigs=[outfit,base].map(model=>{const mixer=new T.AnimationMixer(model),actions={};for(const [name,tracks]of Object.entries(motion)){const converted=[];for(const t of tracks){const bone=model.getObjectByName(t.name);if(!bone)continue;if(t.type==='rotation'){const correction=bone.quaternion.clone().multiply(new T.Quaternion().fromArray(t.rest).invert()),q=new T.Quaternion(),values=[];for(let i=0;i<t.values.length;i+=4){q.fromArray(t.values,i).premultiply(correction).normalize();values.push(q.x,q.y,q.z,q.w)}converted.push(new T.QuaternionKeyframeTrack(t.name+'.quaternion',t.times,values))}else{const values=t.values.map((v,i)=>bone.position.getComponent(i%3)+(v-t.rest[i%3])*.96);converted.push(new T.VectorKeyframeTrack(t.name+'.position',t.times,values))}}const clip=new T.AnimationClip(name,-1,converted),action=mixer.clipAction(clip);action.play();action.time=(instances.length*.37)%clip.duration;actions[name]=action}return {mixer,actions}});
  root.updateMatrixWorld(true);const feet=['foot_l','foot_r'].map(n=>outfit.getObjectByName(n)),footRest=Math.min(...feet.map(b=>root.worldToLocal(b.getWorldPosition(new T.Vector3())).y));
  instances.push({root,figure,rigs,feet,footRest,poseBones,stance:instances.length%4,phase:instances.length*1.31,talk:0});return root;
 }

 let lastTime=0;
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(20,18,12,.35)');gradient.addColorStop(1,'rgba(20,18,12,0)');sc.fillStyle=gradient;sc.fillRect(0,0,64,64);const shadowMaterial=new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
 function update(time,camera){const dt=Math.min(.05,Math.max(0,time-lastTime));lastTime=time;for(const entry of instances){const {root,figure,rigs,feet,footRest,poseBones,stance,phase}=entry,route=root.userData.walkRoute;
  if(route||root.userData.crowdActivity){if(!entry.contact){entry.contact=new T.Mesh(new T.PlaneGeometry(.8,.55),shadowMaterial);entry.contact.rotation.x=-Math.PI/2;entry.contact.position.y=.015;entry.contact.userData.keepDynamic=true;root.add(entry.contact)}}if(route){route.angle??=phase;const tangent=Math.hypot(route.rx*Math.sin(route.angle),route.rz*Math.cos(route.angle));route.angle+=dt*route.speed/tangent;const a=route.angle;root.position.x=route.cx+Math.cos(a)*route.rx;root.position.z=route.cz+Math.sin(a)*route.rz;if(route.ground)root.position.y=route.ground(root.position.x,root.position.z);const heading=Math.atan2(route.rx*Math.sin(a),-route.rz*Math.cos(a));root.rotation.y+=Math.atan2(Math.sin(heading-root.rotation.y),Math.cos(heading-root.rotation.y))*Math.min(1,dt*6)}
  entry.talk+=(Number(!!root.userData.speaking)-entry.talk)*(1-Math.exp(-dt*4));for(const {mixer,actions}of rigs){for(const action of Object.values(actions))action.setEffectiveWeight(0);const locomotion=route?.run?'Jog_Fwd_Loop':'Walk_Loop';if(route){actions[locomotion].setEffectiveWeight(1).setEffectiveTimeScale(route.speed/((route.run?2.5:1.15)*root.scale.y))}else{const activity=root.userData.activity||'Idle_Loop';actions[activity].setEffectiveWeight(1-entry.talk);actions.Idle_Talking_Loop.setEffectiveWeight(entry.talk)}mixer.update(dt)}
  if(!route&&!root.userData.activity){for(const p of poseBones){const n=p.bone.name;if(n.startsWith('spine')){p.bone.quaternion.slerp(p.rotation,.58-entry.talk*.38);continue}p.bone.quaternion.copy(p.rotation);p.bone.position.copy(p.position);if(n==='pelvis'){p.bone.position.x+=(stance===1?-.018:stance===2?.018:0);p.bone.rotateZ(Math.sin(time*.55+phase)*.009)}if(n.startsWith('thigh')&&stance!==0){const relaxed=n.endsWith(stance===1?'_r':'_l');if(relaxed)p.bone.rotateX(stance===3?.045:.022)}if(n.startsWith('calf')&&stance!==0&&n.endsWith(stance===1?'_r':'_l'))p.bone.rotateX(-.028)}}
  if(!route?.run&&!root.userData.activity){figure.position.y=.012;root.updateWorldMatrix(true,true);const footY=Math.min(...feet.map(b=>root.worldToLocal(b.getWorldPosition(new T.Vector3())).y));figure.position.y+=footRest-footY;}
 }}

 return {create,update,instances,source:'Quaternius · CC0'};
}

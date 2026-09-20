import * as T from './three.module.js';

const metal=new T.MeshStandardMaterial({color:'#514d41',metalness:.72,roughness:.48});
const stampCanvas=document.createElement('canvas');stampCanvas.width=256;stampCanvas.height=128;
const ink=stampCanvas.getContext('2d');ink.fillStyle='#c9b88c';ink.fillRect(0,0,256,128);ink.strokeStyle='#453e31';ink.lineWidth=3;ink.strokeRect(12,12,232,104);ink.font='bold 25px Georgia';ink.textAlign='center';ink.fillStyle='#453e31';ink.fillText('PORT · MEDICI',128,54);ink.font='18px Georgia';ink.fillText('MERCI · No. 24',128,88);
const labelMap=new T.CanvasTexture(stampCanvas);labelMap.colorSpace=T.SRGBColorSpace;labelMap.anisotropy=8;
const labelMaterial=new T.MeshStandardMaterial({map:labelMap,roughness:1,polygonOffset:true,polygonOffsetFactor:-1});
const nailGeometry=new T.SphereGeometry(1,8,6);
export function finishCargo(model,kind){
  model.updateWorldMatrix(true,true);const bounds=new T.Box3().setFromObject(model);const min=model.worldToLocal(bounds.min.clone()),max=model.worldToLocal(bounds.max.clone());
  const w=max.x-min.x,h=max.y-min.y,d=max.z-min.z,cx=(min.x+max.x)/2,cz=(min.z+max.z)/2;
  if(!Number.isFinite(w)||w<.1)return model;
  function nail(x,y,z){const m=new T.Mesh(nailGeometry,metal);m.position.set(x,y,z);m.scale.set(.013,.013,.006);model.add(m)}
  if(kind==='crate'){
    for(const side of [-1,1])for(const x of [min.x+w*.08,max.x-w*.08])for(const y of [min.y+h*.12,max.y-h*.12])nail(x,y,cz+side*(d*.5+.006));
    const label=new T.Mesh(new T.PlaneGeometry(w*.39,h*.19),labelMaterial);label.position.set(cx,min.y+h*.55,max.z+.008);model.add(label);
  }else{
    for(let i=0;i<12;i++){const a=i*Math.PI/6;for(const y of [min.y+h*.20,min.y+h*.79]){const m=new T.Mesh(nailGeometry,metal);m.position.set(cx+Math.sin(a)*w*.465,y,cz+Math.cos(a)*d*.465);m.scale.setScalar(.014);model.add(m)}}
  }
  return model;
}

export function finishRope(rope){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const c=canvas.getContext('2d');
  for(let y=0;y<64;y++)for(let x=0;x<256;x++){const v=135+Math.sin(x*.32+y*.7)*48+Math.sin(x*1.9-y*.6)*12;c.fillStyle=`rgb(${v},${v},${v})`;c.fillRect(x,y,1,1)}
  const map=new T.CanvasTexture(canvas);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(2,1);map.anisotropy=8;rope.bumpMap=map;rope.bumpScale=.012;rope.roughness=.95;
}

export function fruitSkin(material,kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#eeeeee';c.fillRect(0,0,128,128);
  let seed=71+kind;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
  for(let i=0;i<1800;i++){const v=kind===1?145+random()*85:175+random()*70;c.fillStyle=`rgb(${v},${v},${v})`;c.beginPath();c.arc(random()*128,random()*128,kind===1?.7:.4,0,Math.PI*2);c.fill()}
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;material.map=map;material.bumpMap=map;material.bumpScale=kind===1?.006:.0015;
}

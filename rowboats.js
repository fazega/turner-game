import * as T from './three.module.js';
import { material } from './materials.js';

export function rowboat(scene,x,z,angle,details){
  const g=new T.Group();g.name='Clinker-built rowing boat';g.position.set(x,-.16,z);g.rotation.y=angle;scene.add(g);
  const wood=material('#826b49',.88,'timber'),dark=material('#5c4933',.92,'timber'),iron=material('#323b37',.55);
  const sections=[[-3.5,.05],[-2.8,.62],[-1.5,.96],[0,1.10],[1.5,.95],[2.8,.58],[3.5,.035]];
  function widthAt(zz){const i=sections.findIndex((s,i)=>i<sections.length-1&&zz>=s[0]&&zz<=sections[i+1][0]);if(i<0)return .04;const a=sections[i],b=sections[i+1];return T.MathUtils.lerp(a[1],b[1],(zz-a[0])/(b[0]-a[0]));}
  function box(xx,y,zz,w,h,d,mat){const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat);o.position.set(xx,y,zz);o.castShadow=o.receiveShadow=true;g.add(o);return o}
  // Individual overlapping planks follow the sheer and rounded cross-section.
  for(let side of [-1,1])for(let plank=0;plank<6;plank++){
    let verts=[],uv=[];
    const low=plank/6,high=(plank+1)/6+.025;
    for(let i=0;i<sections.length-1;i++){
      const [z1,w1]=sections[i],[z2,w2]=sections[i+1];
      const point=(zz,w,t)=>[side*w*Math.sqrt(t),-.35+t*.95+Math.pow(Math.abs(zz)/3.5,3)*.32,zz];
      const a=point(z1,w1,low),b=point(z1,w1,high),c=point(z2,w2,low),d=point(z2,w2,high);
      for(const p of [a,c,b,b,c,d]){verts.push(...p);uv.push(p[2],p[1])}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
    const mat=plank%3===0?dark:wood;mat.side=T.DoubleSide;
    const o=new T.Mesh(geo,mat);o.castShadow=o.receiveShadow=true;g.add(o);
    details.curve(sections.map(([zz,w])=>[side*w*Math.sqrt(high),-.35+high*.95+Math.pow(Math.abs(zz)/3.5,3)*.32,zz]),.023,dark,g);
  }
  details.curve(sections.map(([zz,w])=>[0,-.36+Math.pow(Math.abs(zz)/3.5,3)*.33,zz]),.07,dark,g);
  for(let side of [-1,1])details.curve(sections.map(([zz,w])=>[side*w,.65+Math.pow(Math.abs(zz)/3.5,3)*.32,zz]),.065,wood,g);
  for(let zz=-2.4;zz<=2.5;zz+=.6){
    const w=widthAt(zz)*.94;
    details.curve([[-w,.54,zz],[-w*.78,.04,zz],[0,-.27,zz],[w*.78,.04,zz],[w,.54,zz]],.035,dark,g);
  }
  for(let zz of [-1.7,0,1.65])box(0,.39,zz,widthAt(zz)*1.88,.095,.38,wood);
  for(let xx of [-.31,0,.31])box(xx,-.12,0,.27,.08,4.5,wood);
  for(let side of [-1,1]){
    details.curve([[side*.98,.72,-.1],[side*1.13,.72,-.1]],.04,iron,g);
    details.curve([[side*.8,.49,-1.8],[side*.3,.54,1.3],[side*.2,.57,2.9]],.035,wood,g);
    let blade=box(side*.22,.55,2.7,.19,.045,.8,dark);blade.rotation.y=side*.16;
  }
  details.ring(0,.56,-2.4,.20,.035,material('#8f7c53'),g);
  return g;
}

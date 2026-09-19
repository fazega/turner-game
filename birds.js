import * as T from './three.module.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';

// Anatomical gulls: volumetric bodies, articulated wings, overlapping flight
// feathers, fanned tails, eyes, beaks and tucked feet. Geometry is shared.
export function createBirds(scene){
 const white=new T.MeshStandardMaterial({color:'#e7e5dc',roughness:.82});
 const grey=new T.MeshStandardMaterial({color:'#969e9c',roughness:.85});
 const black=new T.MeshStandardMaterial({color:'#252b2b',roughness:.7});
 const bill=new T.MeshStandardMaterial({color:'#cb9d48',roughness:.65});
 const featherMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.9,side:T.DoubleSide});
 const parts=new T.Group(), wing=new T.Group();
 function ell(parent,material,pos,scale,rot=0){const m=new T.Mesh(new T.SphereGeometry(1,16,10),material);m.position.set(...pos);m.scale.set(...scale);m.rotation.y=rot;parent.add(m);return m}
 ell(parts,white,[0,0,0],[.13,.13,.35]);ell(parts,grey,[0,.075,.04],[.115,.07,.25]);
 ell(parts,white,[0,.035,-.29],[.085,.095,.16]);ell(parts,white,[0,.13,-.4],[.105,.105,.12]);
 for(const s of [-1,1]){ell(parts,black,[s*.091,.155,-.446],[.014,.014,.014]);ell(parts,bill,[s*.052,-.11,.22],[.025,.018,.07]);}
 const beak=new T.Mesh(new T.ConeGeometry(.037,.15,12),bill);beak.rotation.x=-Math.PI/2;beak.position.set(0,.108,-.555);parts.add(beak);
 for(let i=-2;i<=2;i++)ell(parts,white,[i*.041,-.015,.365],[.039,.014,.16],i*.10);
 // A tapered airfoil gives the wings a curved cross section rather than a flat plate.
 const positions=[],colors=[],indices=[],spans=24,chords=12;
 for(let side=0;side<2;side++)for(let i=0;i<=spans;i++)for(let j=0;j<=chords;j++){
  const u=i/spans,v=j/chords,x=u*1.10;
  const leading=-.12+.42*u*u,trailing=.16+.30*u,thick=(.055*(1-u)+.007)*Math.sin(v*Math.PI);
  positions.push(x,(side===0?1:-1)*thick+.04*Math.sin(u*Math.PI),leading+(trailing-leading)*v);
  const c=new T.Color(side===0?'#9da7a5':'#e0e0d7');if(u>.78)c.lerp(new T.Color('#30383a'),(u-.78)/.22*.8);colors.push(c.r,c.g,c.b);
 }
 const stride=chords+1,layer=(spans+1)*stride;
 for(let side=0;side<2;side++)for(let i=0;i<spans;i++)for(let j=0;j<chords;j++){const a=side*layer+i*stride+j,b=a+stride;indices.push(a,b,a+1,b,b+1,a+1)}
 const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(positions,3));wg.setAttribute('color',new T.Float32BufferAttribute(colors,3));wg.setIndex(indices);wg.computeVertexNormals();wing.add(new T.Mesh(wg,featherMat));
 // Narrow pointed feathers overlap along the trailing edge; dark primaries fan out.
 for(let i=0;i<13;i++){
  const u=(i+.5)/13,x=u*1.08,z=.16+.30*u-.04,len=.10+.10*u;
  const shape=new T.Shape();shape.moveTo(-.037,0);shape.quadraticCurveTo(-.046,len*.65,-.009,len);shape.quadraticCurveTo(.016,len*1.05,.039,.005);shape.closePath();
  const fg=new T.ExtrudeGeometry(shape,{depth:.009,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.004,bevelThickness:.004,curveSegments:6});fg.rotateX(Math.PI/2);fg.rotateY(-u*.3);const f=new T.Mesh(fg,i>9?black:i>6?grey:white);f.position.set(x,.01,z);wing.add(f);
 }
 function consolidate(group){group.updateMatrixWorld(true);const result=new T.Group();for(const mat of [white,grey,black,bill,featherMat]){const chunks=[];group.traverse(o=>{if(o.isMesh&&o.material===mat){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);chunks.push(g.index?g.toNonIndexed():g)}});if(chunks.length){const m=new T.Mesh(mergeGeometries(chunks),mat);m.castShadow=false;result.add(m);chunks.forEach(g=>g.dispose())}}return result}
 const bodyTemplate=consolidate(parts),wingTemplate=consolidate(wing),birds=[];
 for(let i=0;i<14;i++){
  const root=new T.Group();root.name='Detailed harbor gull';root.userData.keepDynamic=true;
  root.add(bodyTemplate.clone());const left=wingTemplate.clone(),right=wingTemplate.clone();left.position.x=.09;right.position.x=-.09;right.scale.x=-1;root.add(left,right);root.scale.setScalar(.8+(i%4)*.1);scene.add(root);birds.push({root,left,right,phase:i*1.71});
 }
 let previousTime=0;
 function update(time){const dt=Math.max(0,Math.min(.05,time-previousTime));previousTime=time;for(let i=0;i<birds.length;i++){
  const bird=birds[i],{root,left,right,phase}=bird,rx=35+(i%6)*6,rz=25+(i%4)*8,speed=8.5+(i%5)*1.05;
  bird.angle??=phase;const tangentLength=Math.hypot(rx*Math.sin(bird.angle),rz*Math.cos(bird.angle));bird.angle+=dt*speed/tangentLength;const a=bird.angle;
  root.position.set(-28+Math.cos(a)*rx,20+(i%4)*4+Math.sin(a*2+phase)*1.0,-24+Math.sin(a)*rz);
  const curvature=rx*rz/Math.pow(Math.hypot(rx*Math.sin(a),rz*Math.cos(a)),3),bank=Math.atan(speed*speed*curvature/9.81);
  root.rotation.set(Math.sin(a*2+phase)*.025,Math.atan2(Math.sin(a)*rx,-Math.cos(a)*rz),-bank);
  const flap=Math.sin(time*12.5+phase)*.62,glide=Math.sin(time*.65+phase)>.25;left.rotation.z=glide?.10:flap;right.rotation.z=glide?-.10:-flap;bird.speed=speed;
 }}

 update(0);return {update,birds};
}

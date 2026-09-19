import * as T from './three.module.js';
import {sandWeight} from './coast.js';
export function gardenGrass(parent,ground,random){
 // Eight tapered, curved blades per tuft; instances vary size, lean and rotation.
 const positions=[],normals=[],colors=[],uv=[],base=new T.Color('#30482c'),tip=new T.Color('#7b8951');
 const vertex=(x,y,z,t)=>{positions.push(x,y,z);normals.push(0,.92,.38);const c=base.clone().lerp(tip,t*.75);colors.push(c.r,c.g,c.b);uv.push(t,0)};
 for(let blade=0;blade<8;blade++){const a=blade*2.399,h=.09+random()*.15,lean=.04+random()*.07,w=.008+random()*.009,cx=Math.cos(a),cz=Math.sin(a),ox=cx*.022,oz=cz*.022;
  const point=(t,side)=>{const width=w*Math.pow(1-t,.8);return [ox+cx*lean*t*t-cz*width*side,h*(t-.13*t*t),oz+cz*lean*t*t+cx*width*side,t]};
  for(let j=0;j<4;j++){const t0=j/4,t1=(j+1)/4,A=point(t0,-1),B=point(t0,1),C=point(t1,-1),D=point(t1,1);for(const p of [A,B,C,B,D,C])vertex(...p)}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 const wind={value:0};const mat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.94});mat.onBeforeCompile=shader=>{shader.uniforms.grassTime=wind;shader.vertexShader='uniform float grassTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vec3 origin=instanceMatrix[3].xyz;
 float sway=sin(grassTime*1.4+origin.x*.7+origin.z*.35)*.018+sin(grassTime*2.1+origin.x*.18)*.009;
 transformed.x+=sway*pow(uv.x,2.0);`)};mat.customProgramCacheKey=()=> 'garden-curved-grass-v1';
 const points=[];for(let i=0;i<48000;i++){const x=(random()-.5)*162,z=51+random()*22;if(sandWeight(x,z)>.08)continue;if(Math.abs(x)<3.5||Math.abs(z-56)<1.9||(z>=59&&Math.abs(Math.abs(x)-24)<2))continue;if([-8,8,-38,38].some(b=>Math.abs(x-b)<2.3&&Math.abs(z-63)<1.8))continue;points.push([x,z])}
 const cells=new Map();for(const point of points){const key=Math.floor(point[0]/16)+','+Math.floor(point[1]/16);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(point)}
 const dummy=new T.Object3D();for(const cell of cells.values()){const mesh=new T.InstancedMesh(geo,mat,cell.length);cell.forEach(([x,z],i)=>{dummy.position.set(x,ground(x,z)-.005,z);dummy.rotation.y=random()*Math.PI*2;const scale=.65+random()*.75;dummy.scale.set(scale,.60+random()*.65,scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});mesh.name='Curved grass · spatial patch';mesh.receiveShadow=true;mesh.computeBoundingSphere();parent.add(mesh)}return {update:time=>wind.value=time,tufts:points.length};
}

import * as T from './three.module.js';
import {detailTownFacade} from './town-facades.js';
import {coastalGround, sandWeight} from './coast.js';
import {gardenGrass} from './garden-grass.js';
import {foliageMaterials} from './foliage.js';
import {material} from './materials.js';

export function addLandscape(scene,assets){
 let seed=3917;const random=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;
 const mountainRoot=new T.Group();mountainRoot.name='Layered coastal mountain ranges';scene.add(mountainRoot);
 function noise(x,z){return Math.sin(x*.067+Math.sin(z*.091)*2)*.50+Math.sin(x*.139+z*.11)*.26+Math.sin(x*.31-z*.22)*.13+Math.sin(x*.63+z*.54)*.065}
 function range(name,cx,cz,width,depth,height,haze){
  const nx=100,nz=38,positions=[],colors=[],indices=[],dark=new T.Color('#424f43'),rock=new T.Color('#847f68'),mist=new T.Color('#c7c5ae');
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
   const u=i/nx,v=j/nz,x=cx+(u-.5)*width,z=cz+(v-.5)*depth;
   const edge=Math.pow(Math.sin(u*Math.PI),.65)*Math.pow(Math.sin(v*Math.PI),.8);
   const ridge=.53+.22*Math.sin(u*12+1.4)+.15*Math.sin(u*25-v*3)+.10*noise(x,z);
   const y=Math.max(-.8,height*edge*Math.max(.04,ridge)+noise(x*1.8,z*1.8)*height*.035-1.5);
   positions.push(x,y,z);const c=dark.clone().lerp(rock,Math.min(1,y/height*1.6));colors.push(c.r,c.g,c.b);
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;indices.push(a,b,a+1,b,b+1,a+1)}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
  // Haze is baked by range, preserving legible distant terrain beyond the local fog.
  const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:1,fog:false,envMapIntensity:.15});mat.onBeforeCompile=shader=>{shader.uniforms.rangeHaze={value:haze};shader.fragmentShader='uniform float rangeHaze;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>','gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.72,.72,.66),rangeHaze);')};mat.customProgramCacheKey=()=> 'coastal-range-haze';const mesh=new T.Mesh(geo,mat);mesh.name=name;mesh.receiveShadow=false;mesh.castShadow=false;mountainRoot.add(mesh);
 }
 range('Far blue-grey peaks',-280,-390,420,155,65,.70);
 range('Western headland',-310,-235,230,145,33,.57);
 range('Eastern mountain range',180,-320,330,170,76,.67);
 range('Hills beyond the city',210,-165,215,150,42,.58);
 range('Southern hills behind the quay',-35,265,480,195,88,.59);
 range('Southwestern coastal ridge',-280,105,210,220,69,.64);
 range('Southeastern highlands',220,230,260,210,105,.64);
 const city=new T.Group();city.name='Old city beyond the waterfront';scene.add(city);
 const walls=['#c4b292','#b5ab94','#c4a483','#cfbda0','#b69b7a'].map(color=>material(color,1,'masonry'));
 const roofs=['#795649','#866251','#665f55'].map(color=>new T.MeshStandardMaterial({color,roughness:.95}));const trim=new T.MeshStandardMaterial({color:'#c9b995',roughness:1}),windowMat=new T.MeshStandardMaterial({color:'#3d4540',roughness:.95}),shutter=new T.MeshStandardMaterial({color:'#586259',roughness:.98});
 const cube=new T.BoxGeometry(1,1,1);function box(x,y,z,w,h,d,mat){const m=new T.Mesh(cube,mat);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=false;m.receiveShadow=true;city.add(m);return m}
 const ground=(x,z)=>.28+Math.max(0,x-72)*.064+Math.sin(z*.022)*Math.sin((x-72)*.018)*2;
 const terrain=new T.PlaneGeometry(170,220,40,40),tp=terrain.attributes.position;for(let i=0;i<tp.count;i++){const x=tp.getX(i)+150,z=-tp.getY(i)-57;tp.setXYZ(i,x,ground(x,z)-.2,z)}terrain.computeVertexNormals();const soil=new T.Mesh(terrain,new T.MeshStandardMaterial({color:'#85816a',roughness:1,side:T.DoubleSide}));soil.name='City hillside foundations';city.add(soil);
 let houses=0;
 for(let row=0;row<15;row++)for(let col=0;col<13;col++){
  if((col===5||row===7)&&random()<.8)continue;
  const x=83+col*10+(random()-.5)*2,z=27-row*11+(random()-.5)*2,w=5+random()*3.7,d=5.4+random()*3.3,h=5+random()*8,base=ground(x,z),roofHeight=1.5+random()*1.6;
  box(x,base+h/2-.3,z,w,h+.6,d,walls[Math.floor(random()*walls.length)]);box(x,base+h,z,w+.4,.23,d+.4,trim);
  const roof=new T.Mesh(new T.ConeGeometry(1,1,4),roofs[Math.floor(random()*roofs.length)]);roof.rotation.y=Math.PI/4;roof.scale.set((w+.9)/Math.SQRT2,roofHeight,(d+.9)/Math.SQRT2);roof.position.set(x,base+h+roofHeight/2,z);city.add(roof);
  if(random()>.3){box(x+w*.25,base+h+1.3,z+d*.18,.6,2.2,.65,trim);box(x+w*.25,base+h+2.45,z+d*.18,.78,.2,.8,roofs[0])}
  for(let floor=2;floor<h-1;floor+=2.8)for(let xx=-w/2+1.1;xx<w/2-.6;xx+=1.8){box(x+xx,base+floor,z+d/2+.012,.68,1.22,.06,windowMat);if((col+row)%3===0){box(x+xx-.48,base+floor,z+d/2+.06,.24,1.3,.07,shutter);box(x+xx+.48,base+floor,z+d/2+.06,.24,1.3,.07,shutter)}box(x+xx,base+floor-.69,z+d/2+.07,.88,.12,.22,trim)}
  for(let floor=2;floor<h-1;floor+=2.8)for(let zz=-d/2+1.3;zz<d/2-.8;zz+=2)box(x-w/2-.02,base+floor,z+zz,.06,1.2,.7,windowMat);
  if(random()>.75)box(x,base+2,z+d/2+.4,w*.65,.22,.9,trim);houses++;
 }
 // The far bank is a continuation of the city, with roofs and windows instead of blank blocks.
 for(let row=0;row<5;row++)for(let col=0;col<9;col++){const x=10+col*11,z=-127-row*13,w=6+random()*3,d=6+random()*3,h=4+random()*8;box(x,.4+h/2,z,w,h,d,walls[(row+col)%walls.length]);const roof=new T.Mesh(new T.ConeGeometry(1,1,4),roofs[(row+col)%3]);roof.rotation.y=Math.PI/4;roof.scale.set((w+.7)/Math.SQRT2,2.3,(d+.7)/Math.SQRT2);roof.position.set(x,h+1.55,z);city.add(roof);for(let f=2;f<h-1;f+=3)for(let xx=-w/2+1;xx<w/2;xx+=2)box(x+xx,f,z+d/2+.04,.65,1.2,.08,windowMat);houses++}
 // A domed church and two bell towers break up the roofline.
 const bx=112,bz=-49,by=ground(bx,bz);box(bx,by+10,bz,16,20,22,walls[3]);box(bx,by+20.3,bz,17,.65,23,trim);
 const drum=new T.Mesh(new T.CylinderGeometry(5,5,4,24),walls[2]);drum.position.set(bx,by+22,bz);city.add(drum);
 const dome=new T.Mesh(new T.SphereGeometry(5.4,32,18,0,Math.PI*2,0,Math.PI/2),roofs[2]);dome.position.set(bx,by+24,bz);dome.scale.y=1.1;city.add(dome);
 for(const [x,z,h]of [[96,-51,30],[164,-104,34]]){const y=ground(x,z);box(x,y+h/2,z,4.8,h,4.8,walls[3]);box(x,y+h-4,z,5.5,.5,5.5,trim);for(const side of [-1,1]){box(x+side*2.42,y+h-2,z,.06,2.3,1.4,windowMat);box(x,y+h-2,z+side*2.42,1.4,2.3,.06,windowMat)}const cap=new T.Mesh(new T.ConeGeometry(4,5,4),roofs[1]);cap.position.set(x,y+h+2,z);cap.rotation.y=Math.PI/4;city.add(cap)}
 // Land and a small southern quarter continue behind the starting quay.
 const rearGround=coastalGround;
 const rearGeo=new T.PlaneGeometry(245,170,122,85),rp=rearGeo.attributes.position;for(let i=0;i<rp.count;i++){const x=rp.getX(i)-27.5,z=126-rp.getY(i);rp.setXYZ(i,x,rearGround(x,z),z)}rearGeo.computeVertexNormals();const lawnCanvas=document.createElement('canvas');lawnCanvas.width=lawnCanvas.height=256;const lc=lawnCanvas.getContext('2d');lc.fillStyle='#65704b';lc.fillRect(0,0,256,256);for(let i=0;i<26000;i++){const c=40+Math.floor(random()*55);lc.fillStyle='rgba('+c+','+(c+13)+','+Math.floor(c*.65)+',.35)';lc.fillRect(random()*256,random()*256,1,2+random()*4)}const lawnMap=new T.CanvasTexture(lawnCanvas);lawnMap.colorSpace=T.SRGBColorSpace;lawnMap.wrapS=lawnMap.wrapT=T.RepeatWrapping;lawnMap.repeat.set(55,50);lawnMap.anisotropy=8;const coastalMaterial=new T.MeshStandardMaterial({map:lawnMap,color:'#b5bea0',roughness:1,side:T.FrontSide});coastalMaterial.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 coastPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n coastPosition=(modelMatrix*vec4(transformed,1.)).xyz;');shader.fragmentShader='varying vec3 coastPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 float shoreX=-96.+2.*sin((coastPosition.z-41.)*.028)+.8*sin(coastPosition.z*.083);
 float sand=1.-smoothstep(4.,9.,coastPosition.x-shoreX);
 float grain=fract(sin(dot(floor(coastPosition.xz*160.),vec2(127.1,311.7)))*43758.5453);
 float ripple=sin(coastPosition.x*14.+sin(coastPosition.z*1.1)*.8)*.018;
 float dry=smoothstep(-.25,.33,coastPosition.y);
 vec3 sandColor=mix(vec3(.24,.19,.12),vec3(.65,.52,.33),dry)*( .96+grain*.08+ripple );
 diffuseColor.rgb=mix(diffuseColor.rgb,sandColor,sand);
 `)};coastalMaterial.customProgramCacheKey=()=> 'southwest-beach-v1';const rearLand=new T.Mesh(rearGeo,coastalMaterial);rearLand.name='Southwest beach and garden terrain';city.add(rearLand);
 for(let row=0;row<4;row++)for(let col=-4;col<=4;col++){if(col===0)continue;const x=col*17,z=75+row*21,w=7+random()*3,d=7+random()*3,h=5+random()*6,base=rearGround(x,z);box(x,base+h/2-.25,z,w,h+.5,d,walls[(row+col+5)%walls.length]);const roof=new T.Mesh(new T.ConeGeometry(1,1,4),roofs[(row+col+6)%3]);roof.rotation.y=Math.PI/4;roof.scale.set((w+.8)/Math.SQRT2,2.6,(d+.8)/Math.SQRT2);roof.position.set(x,base+h+1.3,z);city.add(roof);for(let floor=2;floor<h-1;floor+=3)for(let xx=-w/2+1.2;xx<w/2-.6;xx+=2)box(x+xx,base+floor,z-d/2-.03,.72,1.25,.08,windowMat);box(x,base+1.2,z-d/2-.06,1.15,2.4,.10,shutter);
 for(let floor=2;floor<h-1;floor+=3)for(let xx=-w/2+1.2;xx<w/2-.6;xx+=2){box(x+xx,base+floor-.7,z-d/2-.10,1.0,.14,.3,trim);for(const side of [-1,1])box(x+xx+side*.48,base+floor,z-d/2-.09,.24,1.3,.08,shutter)}
 box(x,base+.12,z-d/2-.4,1.8,.24,.75,trim);box(x+w*.27,base+h+1.0,z,.65,2.4,.65,walls[1]);box(x+w*.27,base+h+2.22,z,.85,.18,.85,trim);for(let yy=.5;yy<2.3;yy+=.22)box(x,base+yy,z-d/2-.12,1.08,.025,.025,trim);detailTownFacade({city,box,x,z,w,d,h,base,trim,walls,roofs,shutter,windowMat,row,col});houses++}
 for(let i=0;i<14;i++){const x=(i%2?-1:1)*(12+(i%3)*2),z=65+Math.floor(i/2)*13;const tree=assets.tree(6.5+random()*3);tree.position.set(x,rearGround(x,z),z);tree.rotation.y=random()*6.28;tree.levels[1].distance=38;city.add(tree)}
 // A fenced garden gives the walking boundary a visible, physical edge.
 const iron=new T.MeshStandardMaterial({color:'#151918',metalness:.8,roughness:.43}),wood=material('#685039',.9,'wood'),gravel=material('#b2a58b',1,'stone');
 for(let x=-82;x<=82;x+=2){box(x,1.42,50,.09,2.22,.09,iron);box(x,2.59,50,.15,.12,.15,iron)}
 for(let x=-82;x<82;x+=.25)box(x,1.40,50,.025,2.06,.025,iron);
 for(const y of [.48,1.0,1.65,2.36])box(0,y,50,164,.045,.045,iron);
 box(0,.33,50,164,.2,.3,trim);
 // Gravel walks follow the rising ground, with stone edging and timber benches.
 const pathGeo=new T.PlaneGeometry(6,94,3,47),pp=pathGeo.attributes.position,pu=pathGeo.attributes.uv;for(let i=0;i<pp.count;i++){const x=pp.getX(i),z=98-pp.getY(i);pp.setXYZ(i,x,rearGround(x,z)+.05,z);pu.setXY(i,x/3,z/3)}pathGeo.computeVertexNormals();const pathMesh=new T.Mesh(pathGeo,gravel);pathMesh.receiveShadow=true;city.add(pathMesh);
 for(let z=51;z<145;z+=2){for(const x of [-3.15,3.15])box(x,rearGround(x,z)+.12,z,.18,.16,2,trim)}
 for(let x=-81;x<82;x+=2){box(x,rearGround(x,56)+.04,56,2.02,.08,3,gravel);for(const z of [54.4,57.6])box(x,rearGround(x,z)+.10,z,2,.14,.17,trim)}
 for(const x of [-65,-46,-27,27,46,65]){const z=59.8,y=rearGround(x,z);for(let i=0;i<5;i++)box(x,y+.52,z+(i-2)*.12,2.6,.065,.10,wood);for(let i=0;i<3;i++)box(x,y+.82+i*.15,z+.34,2.6,.10,.065,wood);for(const dx of [-1,1]){box(x+dx,y+.28,z,.065,.5,.5,iron);box(x+dx,y+.8,z+.38,.055,1.1,.055,iron);box(x+dx,y+.75,z,.06,.05,.7,iron)}}
 const grass=gardenGrass(city,rearGround,random);
 const gardenStone=material('#aca186',1,'stone'),hedge=new T.MeshStandardMaterial({color:'#3e5530',roughness:1}),blossom=new T.MeshStandardMaterial({color:'#baa3bc',roughness:1});
 const shrubs=foliageMaterials();
 for(const x of [-8,8,-38,38]){const z=63,y=rearGround(x,z);box(x,y+.16,z,4.3,.32,3.3,gardenStone);box(x,y+.32,z,3.9,.08,2.9,new T.MeshStandardMaterial({color:'#443e2d',roughness:1}));for(let i=0;i<35;i++){const xx=x+(random()-.5)*3.7,zz=z+(random()-.5)*2.7;const shrub=new T.Mesh(new T.IcosahedronGeometry(.19+random()*.14,1),hedge);shrub.position.set(xx,y+.5,zz);shrub.scale.y=1.2;city.add(shrub);for(let j=0;j<3;j++){const sprig=new T.Mesh(new T.PlaneGeometry(.65,.7),shrubs[(i+j)%4]);sprig.position.set(xx,y+.6,zz);sprig.rotation.set((random()-.5)*.5,j*Math.PI/3+random(),(random()-.5)*.3);city.add(sprig)}if(i%3===0){const flower=new T.Mesh(new T.IcosahedronGeometry(.06,1),blossom);flower.position.set(xx,y+.86,zz);city.add(flower)}}}
 const fountainX=0,fountainZ=82,fy=rearGround(0,82);const basin=new T.Mesh(new T.CylinderGeometry(2.5,2.7,.45,40),gardenStone);basin.position.set(0,fy+.23,82);city.add(basin);const rim=new T.Mesh(new T.TorusGeometry(2.4,.16,8,48),gardenStone);rim.rotation.x=Math.PI/2;rim.position.set(0,fy+.52,82);city.add(rim);const pool=new T.Mesh(new T.CircleGeometry(2.3,40),new T.MeshStandardMaterial({color:'#52746d',metalness:.4,roughness:.18}));pool.rotation.x=-Math.PI/2;pool.position.set(0,fy+.48,82);city.add(pool);const pedestal=new T.Mesh(new T.CylinderGeometry(.22,.5,1.4,16),gardenStone);pedestal.position.set(0,fy+1,82);city.add(pedestal);const bowl=new T.Mesh(new T.SphereGeometry(.95,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2),gardenStone);bowl.scale.y=.3;bowl.position.set(0,fy+1.8,82);city.add(bowl);
 return {mountainRoot,city,houses,ranges:7,grassTufts:grass.tufts,update:grass.update};
}

import * as T from './three.module.js';

// Shared geometry and scale textures: stalls can carry many fish without
// downloading another model or allocating materials for every specimen.
export function createFishModels(){
  const templates=[];
  const dark=new T.MeshStandardMaterial({color:'#202d32',roughness:.3});
  const finRay=new T.MeshStandardMaterial({color:'#71847e',roughness:.65});
  const iris=new T.MeshStandardMaterial({color:'#ccbc79',metalness:.4,roughness:.24});
  const pupil=new T.MeshStandardMaterial({color:'#080e13',roughness:.12});
  for(let species=0;species<3;species++){
    const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');
    const grad=ctx.createLinearGradient(0,0,0,256);grad.addColorStop(0,['#31586c','#53685b','#765647'][species]);grad.addColorStop(.32,'#8faaa7');grad.addColorStop(.55,'#d7d4b5');grad.addColorStop(.8,'#9ba9a3');grad.addColorStop(1,'#344f5c');ctx.fillStyle=grad;ctx.fillRect(0,0,512,256);
    for(let row=0;row<24;row++)for(let col=0;col<43;col++){const x=col*12+(row%2)*6,y=row*11;ctx.strokeStyle='rgba(26,47,53,.27)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,6,0,Math.PI);ctx.stroke();ctx.strokeStyle='rgba(245,247,224,.35)';ctx.beginPath();ctx.arc(x,y-1,5,0,Math.PI);ctx.stroke()}
    ctx.strokeStyle='#31485270';for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(i*55,0);ctx.bezierCurveTo(i*55+25,25,i*55-10,45,i*55+20,72);ctx.stroke()}
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
    const skin=new T.MeshStandardMaterial({map,metalness:.32,roughness:.3});
    const fin=new T.MeshStandardMaterial({color:['#64888a','#9a9873','#9b7562'][species],roughness:.53,side:T.DoubleSide});
    const g=new T.Group();g.name=['Silver sardine','Harbour bream','Red mullet'][species];
    function mesh(geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.receiveShadow=true;g.add(m);return m}
    const positions=[],uv=[],indices=[],length=32,sides=24;
    for(let i=0;i<=length;i++){const t=i/length,x=-.29+t*.60;const r=Math.pow(Math.sin(Math.PI*t),.67)*(.075+(species===1?.025:0))*(.8+.35*t);for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2;positions.push(x,Math.cos(a)*r*.67,Math.sin(a)*r);uv.push(t,j/sides)}}
    for(let i=0;i<length;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1)}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,skin);
    function ray(a,b){const delta=new T.Vector3(...b).sub(new T.Vector3(...a));const m=mesh(new T.CylinderGeometry(.0007,.0011,delta.length(),5),finRay);m.position.copy(new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize())}
    function fan(points,base){const shape=new T.Shape(points.map(([x,z])=>new T.Vector2(x,z)));const m=mesh(new T.ShapeGeometry(shape),fin);m.rotation.x=Math.PI/2;m.position.y=.008;for(const [x,z]of points.slice(1))ray([base[0],.012,base[1]],[x,.012,z])}
    fan([[-.26,0],[-.43,-.115],[-.38,-.035],[-.35,0],[-.38,.035],[-.43,.115]],[-.26,0]);
    for(const side of [-1,1]){fan([[.1,side*.055],[-.04,side*.16],[.025,side*.045]],[.1,side*.055]);const eye=mesh(new T.SphereGeometry(.018,14,10),iris,.22,side>0?.038:-.035,side*.048);eye.scale.y=.45;const dot=mesh(new T.SphereGeometry(.010,12,8),pupil,.222,side>0?.047:-.04,side*.05);dot.scale.y=.45;ray([.145,.048,side*.049],[.115,.022,side*.078]);ray([.29,.009,side*.012],[.263,.025,side*.035])}
    fan([[-.12,-.035],[-.1,-.105],[.035,-.13],[.065,-.045]],[-.08,-.03]);
    templates.push(g);
  }
  let count=0;
  return (scene,x,y,z,angle=0,size=1)=>{const root=templates[count++%3].clone(true);root.position.set(x,y+.035,z);root.rotation.y=angle;root.scale.setScalar(size);scene.add(root);return root};
}

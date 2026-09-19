import * as T from './three.module.js';

const fabricCanvas=document.createElement('canvas');fabricCanvas.width=fabricCanvas.height=128;
const ctx=fabricCanvas.getContext('2d');ctx.fillStyle='#bfb9aa';ctx.fillRect(0,0,128,128);
for(let i=0;i<128;i++){ctx.fillStyle=i%3?'#d1cbbb':'#a59e90';ctx.fillRect(i,0,1,128);ctx.fillStyle='rgba(55,40,20,.12)';ctx.fillRect(0,i*2,128,1)}
const weave=new T.CanvasTexture(fabricCanvas);weave.colorSpace=T.SRGBColorSpace;weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(6,6);weave.anisotropy=8;
const colors=['#6d4540','#a48654','#405d69','#6e5361'];
const fabrics=colors.map(color=>new T.MeshStandardMaterial({color,map:weave,roughness:.96,side:T.DoubleSide}));
const linen=new T.MeshStandardMaterial({color:'#dfd0ab',map:weave,roughness:1,side:T.DoubleSide});
const leather=new T.MeshStandardMaterial({color:'#493728',roughness:.82});
const brass=new T.MeshStandardMaterial({color:'#ad8851',metalness:.65,roughness:.5});

export function dressCharacter(root,kind,index,pose){
  const material=fabrics[index%fabrics.length];
  function mesh(geometry,mat,x,y,z,parent=root){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.userData.keepDynamic=true;m.receiveShadow=true;parent.add(m);return m}
  function curve(points,r,mat,parent=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,r,6,false),mat,0,0,0,parent)}
  // Each garment is a curved, folded surface rather than a rigid cone.
  function panel(nu,nv,point,mat){const g=new T.PlaneGeometry(1,1,nu,nv),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const v=point(uv.getX(i),1-uv.getY(i));p.setXYZ(i,...v)}g.computeVertexNormals();return mesh(g,mat,0,0,0)}
  if(kind==='woman'&&pose!=='kneeling'){
    panel(64,16,(u,v)=>{const a=u*Math.PI*2,r=.19+v*.18+Math.pow(v,.7)*(.018*Math.sin(a*14)+.009*Math.sin(a*27));return [Math.sin(a)*r,1.10-v*.85,Math.cos(a)*r]},material);
    panel(22,14,(u,v)=>{const a=(u-.5)*1.6+Math.PI,r=.215+v*.17+.008*Math.sin(u*45);return [Math.sin(a)*r,1.07-v*.69+.018*Math.cos(u*6),Math.cos(a)*r]},linen);
    for(const y of [.29,.32]){const trim=mesh(new T.TorusGeometry(.36,.009,5,64),linen,0,y,0);trim.rotation.x=Math.PI/2}
  }
  if(kind==='man'&&pose==='watching'){
    panel(28,22,(u,v)=>{const w=(.24+.12*Math.sin(v*2))*2,x=(u-.5)*w;return [x,1.65-v*.94,.12+.13*(1-Math.pow((u-.5)*2,2))+.025*Math.sin(u*37)*v]},material);
    curve([[-.23,1.61,.12],[-.26,1.59,-.02],[-.13,1.52,-.18],[0,1.49,-.22],[.13,1.52,-.18],[.26,1.59,-.02],[.23,1.61,.12]],.035,material);
    mesh(new T.SphereGeometry(.037,12,8),brass,0,1.48,-.235);
  }
  if(kind==='man'||kind==='woman'||kind==='guard'){
    const belt=mesh(new T.CylinderGeometry(.225,.225,.065,32,1,true),leather,0,1.09,0);belt.scale.z=.70;
    const buckle=mesh(new T.TorusGeometry(.038,.009,6,4),brass,0,1.09,-.173);buckle.rotation.z=Math.PI/4;
    for(let i=0;i<4;i++)mesh(new T.SphereGeometry(.012,8,6),brass,.035,1.20+i*.065,-.19);
    // Stitched leather pouch, flap, fastening and a curved shoulder strap.
    const pouch=mesh(new T.SphereGeometry(1,16,10),leather,.25,.94,.02);pouch.scale.set(.09,.115,.06);
    const flap=mesh(new T.SphereGeometry(1,12,8),leather,.25,1.015,-.02);flap.scale.set(.095,.045,.035);
    mesh(new T.SphereGeometry(.014,8,6),brass,.25,.985,-.06);
    curve([[-.20,1.62,-.08],[-.09,1.43,-.23],[.12,1.19,-.20],[.25,1.01,-.02]],.017,leather);
  }
  if(kind==='man'&&index%3===0){
    const hat=new T.Group();hat.position.y=1.91;root.add(hat);
    const brim=mesh(new T.CylinderGeometry(.27,.29,.025,40),material,0,0,0,hat);brim.scale.z=.88;
    mesh(new T.CylinderGeometry(.155,.18,.14,32),material,0,.075,0,hat);
    mesh(new T.CylinderGeometry(.179,.184,.03,32,1,true),leather,0,.024,0,hat);
    root.updateMatrixWorld(true);root.getObjectByName('Head').attach(hat);
  }
}

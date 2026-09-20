import * as T from './three.module.js';
import {material} from './materials.js';

export function addBenchHammer(scene){
 const hammer=new T.Group();hammer.name='Shipwright claw hammer';
 const ash=material('#896341',.77,'timber');
 const steel=new T.MeshStandardMaterial({color:'#626664',metalness:.82,roughness:.43});
 const face=new T.MeshStandardMaterial({color:'#919793',metalness:.86,roughness:.3});
 function mesh(geometry,mat){const m=new T.Mesh(geometry,mat);m.castShadow=true;m.receiveShadow=true;hammer.add(m);return m}
 // Oval, gently waisted ash handle with a flared heel and a neck through the eye.
 const profile=[[.001,0],[.025,.006],[.030,.018],[.028,.045],[.024,.12],[.020,.23],[.021,.32],[.026,.37],[.022,.422],[.001,.425]];
 const handle=mesh(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),20),ash);handle.scale.z=.78;
 function forged(points,depth,z){const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.003,bevelThickness:.003,curveSegments:12});const m=mesh(g,steel);m.position.z=z;return m}
 forged([[-.075,.369],[-.075,.419],[.043,.426],[.064,.413],[.064,.375],[.025,.364]],.052,-.026);
 // A round striking face, narrowed neck, and two separate curved claw tines.
 const neck=mesh(new T.CylinderGeometry(.024,.024,.035,20),steel);neck.rotation.z=Math.PI/2;neck.position.set(-.09,.394,0);
 const strikingFace=mesh(new T.CylinderGeometry(.032,.030,.014,32),face);strikingFace.rotation.z=Math.PI/2;strikingFace.position.set(-.113,.394,0);
 for(const z of [-.024,.009])forged([[.035,.420],[.070,.421],[.104,.401],[.129,.360],[.119,.351],[.090,.384],[.065,.393],[.036,.390]],.015,z);
 const wedge=mesh(new T.BoxGeometry(.005,.003,.032),face);wedge.position.set(.004,.428,0);wedge.rotation.y=.2;
 // Lay it on the clear front of the bench, away from the stacked timber.
 hammer.rotation.set(Math.PI/2,0,-Math.PI/2);hammer.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(hammer);
 hammer.position.set(-60.5,1.11-bounds.min.y,20.20);scene.add(hammer);
 return hammer;
}

import {dressCharacter} from './period-clothing.js';
import * as T from './three.module.js';
import {material} from './materials.js';
import {rowboat} from './rowboats.js';

export function addPaintingTableau({scene,characters,details,box,line,wood,rope,obstacles}) {
  const actors=[],observers=[],canvas=material('#9d8d69',1,'canvas'),terracotta=material('#815642',.92);
  function actor(kind,x,z,pose,variant=0,scale=1){if(x>-1&&x<11)z+=5;else if(x>13){x-=3;z+=3}else z+=3;const root=characters.create(kind,variant);root.position.set(x,.32,z);root.scale.setScalar(scale);root.rotation.y=.35;root.userData.crowdActivity=true;root.name='Painting tableau · '+pose;root.traverse(o=>{if(o.isMesh)o.castShadow=false});scene.add(root);actors.push(root);
    if(pose==='kneeling')root.userData.activity='Fixing_Kneeling';
    if(pose==='pointing')root.userData.activity='Idle_Torch_Loop';
    if(pose==='conversation'){root.userData.speaking=true;root.rotation.y=actors.length%2?1.35:-.95}
    dressCharacter(root,kind,actors.length,pose);
    if(pose==='watching'||pose==='pointing'){const heads=[];root.traverse(o=>{if(o.isBone&&o.name==='Head')heads.push(o)});observers.push({root,heads,phase:actors.length})}
    obstacles.push({x,z,w:.38*scale,d:.38*scale});return root;
  }
  // A central knot of spectators, with an open approach to Mira on their left.
  for(const [kind,x,z,pose,v]of [['man',2,26,'watching',1],['woman',3.2,26.8,'conversation',2],['man',5.0,25.4,'pointing',2],['woman',6.1,27.1,'watching',1],['guard',7.6,25.7,'watching',0],['man',9.0,27,'conversation',1]])actor(kind,x,z,pose,v);
  actor('boy',4.2,27.6,'watching',1,.69);actor('girl',7.2,28,'watching',2,.72);
  // Left foreground: labour briefly interrupted, net mending and coiled ropes.
  for(const [kind,x,z,pose,v]of [['man',-8,26,'kneeling',1],['man',-5.7,25,'watching',2],['woman',-10.2,27.2,'conversation',1],['man',-12,24,'pointing',0]])actor(kind,x,z,pose,v);
  // Right foreground: families among baskets, cloth bundles and the landing steps.
  for(const [kind,x,z,pose,v]of [['woman',16.4,27.4,'watching',2],['man',18,26,'conversation',1],['woman',20.3,28,'kneeling',1],['man',22,24.5,'watching',2],['woman',14.5,24,'pointing',0],['man',25,19,'watching',1]])actor(kind,x,z,pose,v);
  actor('girl',17.2,28.7,'watching',1,.68);actor('boy',21.3,29,'conversation',2,.72);
  for(const [x,z]of [[-11,28],[19,30],[22.5,27],[13,22]]){
    details.sack(x,z,.4);details.sack(x+.65,z+.3,-.5);details.crate(x-.7,z+.7,.32,.65);
    for(let i=0;i<5;i++)details.ring(x+1.1,.37+i*.035,z+.6,.46-i*.055,.028,rope);
    const cloth=new T.Mesh(new T.PlaneGeometry(1.6,1.1,12,8),canvas);const p=cloth.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,.07*Math.sin(p.getX(i)*12)+.04*Math.cos(p.getY(i)*9));cloth.geometry.computeVertexNormals();cloth.rotation.x=-Math.PI/2;cloth.position.set(x,.43,z+1.7);scene.add(cloth);
    // Shallow clay bowls, with a visible interior and rolled lip.
    for(let i=0;i<3;i++){const bowl=new T.Mesh(new T.LatheGeometry([new T.Vector2(.06,0),new T.Vector2(.19,.03),new T.Vector2(.28,.15),new T.Vector2(.30,.18),new T.Vector2(.27,.19),new T.Vector2(.24,.13),new T.Vector2(.13,.055),new T.Vector2(.06,.045)],24),terracotta);bowl.position.set(x-.6+i*.5,.35,z+2.3);scene.add(bowl)}
  }
  // Knotted fishing mesh lies over the quay rather than hovering above it.
  for(let i=0;i<17;i++){const x=-10+i*.18;details.curve([[x,.38,23.4],[x+.2,.43,24.2],[x-.1,.37,25.2]],.009,rope)}
  for(let i=0;i<12;i++)details.curve([[-10,.39,23.4+i*.16],[-8.6,.45,23.5+i*.16],[-7.1,.38,23.4+i*.16]],.009,rope);
  for(let i=0;i<5;i++){const x=-7+i*.14;line([x,.42,27.8],[x+.45,.48,31],.024,wood);box(x+.47,.48,31.1,.15,.07,.48,wood)}
  // A low landing boat and its diagonal oars echo the painting's shore traffic.
  const boat=rowboat(scene,17,5.5,1.05,details);boat.name='Foreground landing boat';
  for(const x of [14.8,18.2]){line([x,.62,4.7],[x+2.2,.72,9.3],.035,wood);box(x+2.2,.71,9.4,.20,.08,.65,wood)}
  details.curve([[17,.8,7],[19,.45,9],[22,.8,10.6]],.035,rope);
  // Rolled sail and tied bundles at the right edge of the composition.
  for(let i=0;i<3;i++){const roll=new T.Mesh(new T.CylinderGeometry(.22,.22,2.7,16),canvas);roll.rotation.z=Math.PI/2;roll.position.set(23,.59+i*.33,31);scene.add(roll);for(const x of [22.1,23.9]){const tie=new T.Mesh(new T.TorusGeometry(.225,.025,6,24),rope);tie.rotation.y=Math.PI/2;tie.position.set(x,.59+i*.33,31);scene.add(tie)}}
  function update(time){for(const {heads,phase}of observers)for(const head of heads){head.rotateX(-.10+Math.sin(time*.35+phase)*.018);head.rotateY(Math.sin(time*.22+phase)*.045)}}
  return {actors,update};
}

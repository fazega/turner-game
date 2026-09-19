import * as T from './three.module.js';
import { material } from './materials.js';

export function addMicrodetails({scene,details,box,cyl,line,trim,stone,wood,rope,assets,rand}){
  const iron=new T.MeshStandardMaterial({color:'#384038',metalness:.8,roughness:.64}),bronze=new T.MeshStandardMaterial({color:'#88734c',metalness:.72,roughness:.43});
  function coil(x,z,r=.55){
    const points=[];for(let i=0;i<240;i++){let t=i/239,a=t*Math.PI*2*6,rr=.12+(r-.12)*t;points.push([x+Math.cos(a)*rr,.355+t*.035,z+Math.sin(a)*rr])}
    for(let strand=0;strand<3;strand++){
      let p=points.map((p,i)=>{let a=i*.9+strand*Math.PI*2/3;return [p[0]+Math.cos(a)*.018,p[1]+Math.sin(a)*.018,p[2]]});details.curve(p,.014,rope);
    }
  }
  coil(12,23,.62);coil(-12,14,.45);coil(26,17,.6);
  // Heavy iron mooring rings fixed into the stone, including square anchors.
  for(let x of [-23,-3,12,25]){
    box(x,.365,10.9,.34,.08,.34,iron);
    const ring=details.ring(x,.58,10.9,.20,.042,iron);ring.rotation.x=.42;
    for(let dx of [-.11,.11])for(let dz of [-.11,.11])cyl(x+dx,.415,10.9+dz,.032,.04,bronze,scene,.032,6);
  }
  // Real crates, casks, sacks, and loose ropes compose a close-up cargo cluster.
  details.barrel(11.3,24);details.barrel(12.35,24.5,scene,.3,.82);details.crate(13.4,23.7,.32,1.15);
  details.crate(13.4,23.7,1.59,.68);
  for(let i=0;i<3;i++){
    details.sack(14.4+i*.48,25.1,i*.8);
  }
  // A coil on the quay trails to a ship-side cleat in a weighted catenary.
  details.curve([[-13,1.08,10.8],[-19,.42,5],[-25,1.0,-3],[-28,3,-8]],.045,rope);
  // Chips and grit accumulate along the edge rather than covering every surface.
  const grit=material('#80765b',1,'stone');
  for(let i=0;i<180;i++){
    let x=-45+rand()*78,z=10.5+rand()*.9;
    const rock=new T.Mesh(new T.IcosahedronGeometry(.015+rand()*.06,0),grit);rock.position.set(x,.34,z);rock.scale.y=.45;rock.rotation.set(rand()*3,rand()*3,rand()*3);scene.add(rock);
  }
  // Raised panel doors, hinges and studs at the arcade entrances.
  for(let z of [-14,-30,-46]){
    const x=34.86;
    box(x,2.4,z,.16,4.1,2.15,wood);
    for(let side of [-1,1]){
      for(let y of [1.05,2.35,3.65]){box(x-.12,y,z+side*.52,.12,1.06,.82,wood);box(x-.20,y,z+side*.52,.06,.80,.61,material('#695338',.9,'timber'))}
      for(let y of [1,3.6]){box(x-.21,y,z+side*.70,.045,.1,.68,iron);for(let dz of [-.23,.23])cyl(x-.24,y,z+side*.70+dz,.018,.04,bronze)}
      const handle=details.ring(x-.3,2.3,z+side*.16,.10,.022,bronze);handle.rotation.z=Math.PI/2;
    }
  }
}

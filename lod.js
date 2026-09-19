import * as T from './three.module.js';
import { material } from './materials.js';
import { batchStatic } from './batching.js';

export function installShipLOD(ships){
  for(const ship of ships){
    const detailed=new T.Group();detailed.name='Detailed vessel';
    for(const child of [...ship.children])detailed.add(child);
    const distant=new T.Group();distant.name='Distant vessel';
    const timber=material('#4a3323',.9,'timber'),linen=material('#c5b591',1,'canvas'),rigging=material('#716044');
    function add(geo,mat,x,y,z){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);distant.add(o);return o}
    const hull=add(new T.SphereGeometry(1,14,7),timber,0,1,0);hull.scale.set(4.3,2.6,12);
    for(let z of [-4.7,4]){
      const h=z<0?24:21;
      add(new T.CylinderGeometry(.11,.19,h,6),timber,0,h/2+3,z);
      for(let tier=0;tier<3;tier++){
        let w=9-tier*2.2,y=12+tier*6-(z>0?1.4:0),height=5-tier*.6;
        const sail=new T.PlaneGeometry(w,height,6,3),p=sail.attributes.position;
        for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(sail.attributes.uv.getX(i)*Math.PI)*.65);
        sail.computeVertexNormals();add(sail,linen,0,y-height/2,z);
        let spar=add(new T.CylinderGeometry(.07,.07,w+1,5),timber,0,y,z);spar.rotation.z=Math.PI/2;
      }
      for(let side of [-1,1]){
        const a=new T.Vector3(side*3.8,3,z-1),b=new T.Vector3(0,h+2,z),d=b.clone().sub(a);
        const o=add(new T.CylinderGeometry(.025,.025,d.length(),3),rigging,0,0,0);o.position.copy(a.add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());
      }
    }
    batchStatic(distant,{cellSize:Infinity});
    const lod=new T.LOD();lod.name='Vessel distance detail';lod.addLevel(detailed,0);lod.addLevel(distant,110,.12);ship.add(lod);ship.userData.lod=lod;
  }
}

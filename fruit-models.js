import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
const ids=['food_apple_01','lemon','food_pears_asian_01','food_pomegranate_01'];
const templates=[];
export async function preloadFruit(){
 await Promise.all(ids.map(async(id,kind)=>{
  const gltf=await new GLTFLoader().loadAsync(`./assets/fruit/${id}/model.gltf`);
  templates[kind]=gltf.scene.children.map(source=>{
   const root=new T.Group(),model=source.clone(true);root.add(model);
   if(kind===1)model.rotation.z+=Math.PI/2;
   root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(root),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());
   model.position.x-=center.x;model.position.y-=b.min.y;model.position.z-=center.z;
   root.scale.setScalar(1/Math.max(size.x,size.z));
   root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(o.material[key])o.material[key].anisotropy=8});
   return root;
  });
 }));
}
// Place the lowest point on its support after varying each fruit's orientation.
export function addFruit(scene,x,y,z,kind,width,rand){
 const variants=templates[kind],root=new T.Group();root.name=`Market fruit · ${ids[kind]}`;
 root.add(variants[Math.floor(rand()*variants.length)].clone(true));root.scale.setScalar(width);
 root.rotation.set((rand()-.5)*.28,rand()*Math.PI*2,(rand()-.5)*.28);
 root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(root);
 root.position.set(x,y-bounds.min.y,z);scene.add(root);return root;
}

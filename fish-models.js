import * as T from './three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
let template;
export async function preloadFish(){
 const gltf=await new GLTFLoader().loadAsync('./assets/barramundi/fish.glb');
 template=new T.Group();template.name='Barramundi · Microsoft / CC0';
 const model=gltf.scene;
 model.rotation.set(0,Math.PI/2,Math.PI/2);template.add(model);template.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(template),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 model.position.sub(center);model.position.y+=size.y/2;template.scale.setScalar(.62/size.x);
 template.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=true;o.material.roughness=.42;o.material.envMapIntensity=.65;for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(o.material[key])o.material[key].anisotropy=8});
}
export function createFishModels(){
 if(!template)throw new Error('Fish model has not finished loading');let count=0;
 return (scene,x,y,z,angle=0,size=1)=>{const root=new T.Group(),model=template.clone(true);root.name='Market barramundi';root.add(model);root.position.set(x,y,z);root.rotation.y=angle+(count++%3===0?Math.PI:0);root.scale.setScalar(size);scene.add(root);return root};
}

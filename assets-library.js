import * as T from './three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

export async function loadModelLibrary(){
  const windTime={value:0};
  const loader=new GLTFLoader();
  const ids=['ship_pinnace','wooden_barrels_01','wooden_crate_01','marble_bust_01','tree_small_02'];
  let distantTree;
  const loaded=await Promise.all(ids.map(async id=>{const gltf=await loader.loadAsync(`./assets/${id}/model.gltf`);if(id==='tree_small_02')distantTree=gltf.scenes[1];return [id,gltf.scene]}));
  const library=Object.fromEntries(loaded);
  for(const root of Object.values(library))root.traverse(o=>{
    if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;
    o.material.envMapIntensity=.55;
    for(const key of ['map','normalMap','roughnessMap','metalnessMap','aoMap'])if(o.material[key])o.material[key].anisotropy=8;
    if(o.name.includes('sails')){
      o.material.onBeforeCompile=shader=>{
        shader.uniforms.harbourWind=windTime;
        shader.vertexShader='uniform float harbourWind;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
          transformed.z+=sin(position.x*.65+position.y*.25+harbourWind*1.1)*.045;
        `);
      };
      o.material.customProgramCacheKey=()=> 'pinnace-sails-wind';
    }
  });
  function normalized(source,height){
    const group=new T.Group(),model=source.clone(true);model.position.set(0,0,0);group.add(model);
    group.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
    const scale=height/size.y;model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);return group;
  }
  const barrels=[library.wooden_barrels_01.getObjectByName('wooden_barrels_01_barrel01'),library.wooden_barrels_01.getObjectByName('wooden_barrels_01_barrel02')];
  const templates={barrel:barrels.map(m=>normalized(m,1.25)),crate:normalized(library.wooden_crate_01,1.1),bust:normalized(library.marble_bust_01,1.3)};
  function treeTemplate(source){const group=new T.Group(),model=source.clone(true);group.add(model);group.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model),height=bounds.max.y-bounds.min.y;model.scale.multiplyScalar(1/height);model.position.y-=bounds.min.y/height;return group}
  const treeHigh=treeTemplate(library.tree_small_02),treeLow=treeTemplate(distantTree);
  treeLow.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});
  let barrelIndex=0;
  return {
    barrel:()=>templates.barrel[barrelIndex++%2].clone(true),
    crate:()=>templates.crate.clone(true),
    bust:()=>templates.bust.clone(true),
    ship:()=>{const root=library.ship_pinnace.clone(true);root.scale.setScalar(.82);return root},
    tree:height=>{const root=new T.LOD();root.addLevel(treeHigh.clone(true),0);root.addLevel(treeLow.clone(true),72,.15);root.scale.setScalar(height);root.userData.keepDynamic=true;root.name='Scanned tree with distance detail';return root},
    loaded:ids,
    windTime,
  };
}

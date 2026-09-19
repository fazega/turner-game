import * as T from './three.module.js';

const textures={},loader=new T.TextureLoader();
export async function preloadPBR(){
  const sets={masonry:'large_sandstone_blocks_01',paving:'seaworn_stone_tiles',timber:'wooden_rough_planks',bark:'bark_brown_02',stone:'carved_sandstone',canvas:'rough_linen'};
  await Promise.all(Object.entries(sets).map(async([key,id])=>{
    const maps={};await Promise.all(['Diffuse','nor_gl','Rough','AO'].map(async name=>{
      const tex=await loader.loadAsync(`./assets/${id}/${name}.jpg`);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=8;
      if(name==='Diffuse')tex.colorSpace=T.SRGBColorSpace;maps[name]=tex;
    }));textures[key]=maps;
  }));
}
export function pbrMaterial(color,roughness,kind){
  const maps=textures[kind];if(!maps)return null;
  const tint=new T.Color(color);
  // Scan albedo supplies the material's main colour; retain only a gentle tint.
  tint.lerp(new T.Color('#ffffff'),kind==='canvas'?.15:kind==='timber'?.55:.85);
  const m=new T.MeshStandardMaterial({color:tint,map:maps.Diffuse,normalMap:maps.nor_gl,roughnessMap:maps.Rough,aoMap:maps.AO,aoMapIntensity:.75,roughness:Math.min(roughness,.98)});
  m.normalScale.setScalar(kind==='masonry'?.9:kind==='paving'?.75:.55);
  const scale=kind==='masonry'?.20:kind==='paving'?.18:kind==='timber'?.45:kind==='bark'?.5:kind==='canvas'?2.0:.8;
  m.name=`Scanned ${kind}`;
  m.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
      vec3 surfacePosition=(modelMatrix*vec4(position,1.)).xyz;
      vec3 surfaceNormal=abs(normalize(mat3(modelMatrix)*normal));
      vec2 projectedUV=surfaceNormal.y>.65?surfacePosition.xz:(surfaceNormal.x>surfaceNormal.z?surfacePosition.zy:surfacePosition.xy);
      projectedUV*=${scale.toFixed(3)};
      #ifdef USE_MAP
        vMapUv=projectedUV;
      #endif
      #ifdef USE_NORMALMAP
        vNormalMapUv=projectedUV;
      #endif
      #ifdef USE_ROUGHNESSMAP
        vRoughnessMapUv=projectedUV;
      #endif
      #ifdef USE_AOMAP
        vAoMapUv=projectedUV;
      #endif
    `);
  };
  m.customProgramCacheKey=()=>`scanned-${kind}-v1`;
  return m;
}

import * as T from './three.module.js';
import { pbrMaterial } from './pbr.js';

// Small, deterministic textures are generated once. World-space mapping keeps
// the texel density consistent after static geometry has been batched.
let state=98321;
const random=()=>((state=(state*16807)%2147483647)-1)/2147483646;
function texture(kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d'),data=ctx.createImageData(512,512);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    let value;
    if(kind==='timber'){
      const grain=Math.sin(x*.39+Math.sin(y*.035)*1.6+Math.sin(x*.071)*2.1);
      value=186+grain*13+Math.sin(x*1.4+y*.008)*5+(random()-.5)*14;
      if(x%64<2)value*=.78;
    }else if(kind==='canvas'){
      value=218+(random()-.5)*20+(x%3===0?-14:0)+(y%3===0?-10:0);
      if(x%128<2)value*=.8;
    }else{
      value=210+(random()-.5)*17+Math.sin(x*.041)*Math.sin(y*.073)*8;
      if(random()<.009)value-=24;
    }
    const i=(y*512+x)*4;data.data[i]=value;data.data[i+1]=value;data.data[i+2]=value;data.data[i+3]=255;
  }
  ctx.putImageData(data,0,0);
  const result=new T.CanvasTexture(canvas);result.wrapS=result.wrapT=T.RepeatWrapping;
  result.anisotropy=8;result.colorSpace=T.NoColorSpace;return result;
}
const textures={stone:texture('stone'),timber:texture('timber'),canvas:texture('canvas')};
const cache=new Map();
export function material(color,roughness=1,kind='plain'){
  const key=`${color}/${roughness}/${kind}`;if(cache.has(key))return cache.get(key);
  const scanned=pbrMaterial(color,roughness,kind);
  if(scanned){cache.set(key,scanned);return scanned;}
  const m=new T.MeshStandardMaterial({color,roughness});
  m.name=`${kind} ${color}`;
  if(kind!=='plain'){
    const tex=textures[kind==='masonry'?'stone':kind]||textures.stone;
    m.onBeforeCompile=shader=>{
      shader.uniforms.surfaceTexture={value:tex};
      shader.vertexShader='varying vec3 surfacePosition;varying vec3 surfaceNormal;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`surfacePosition=(modelMatrix*vec4(transformed,1.0)).xyz;
        surfaceNormal=normalize(mat3(modelMatrix)*objectNormal);
        #include <project_vertex>`);
      shader.fragmentShader='uniform sampler2D surfaceTexture;varying vec3 surfacePosition;varying vec3 surfaceNormal;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec3 sn=abs(surfaceNormal);
        vec2 surfUV=sn.y>.65?surfacePosition.xz:(sn.x>sn.z?surfacePosition.zy:surfacePosition.xy);
        float grain=texture2D(surfaceTexture,surfUV*${kind==='timber'?'vec2(.55,.13)':kind==='canvas'?'vec2(.5)':'vec2(.36)'}).r;
        float relief=grain;
        ${kind==='masonry'?`if(sn.y<.65){
          float row=floor(surfUV.y/.72);
          vec2 cell=vec2(fract(surfUV.x/1.65+mod(row,2.)*.5),fract(surfUV.y/.72));
          vec2 edge=min(cell,1.-cell);
          vec2 aa=max(fwidth(surfUV/vec2(1.65,.72))*.7,vec2(.002));
          float mortar=smoothstep(.010,.010+aa.x,edge.x)*smoothstep(.021,.021+aa.y,edge.y);
          grain*=mix(.83,1.,mortar);relief*=mortar;
          float block=fract(sin(dot(vec2(floor(surfUV.x/1.65+mod(row,2.)*.5),row),vec2(127.1,311.7)))*43758.5453);
          grain*=.91+.16*block;
        }`:''}
        diffuseColor.rgb*=.72+grain*.39;
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
        vec3 dp1=dFdx(-vViewPosition),dp2=dFdy(-vViewPosition);
        vec3 r1=cross(dp2,normal),r2=cross(normal,dp1);
        float det=dot(dp1,r1);
        normal=normalize(abs(det)*normal-sign(det)*(dFdx(relief)*r1+dFdy(relief)*r2)*${kind==='canvas'?'.009':'.012'});
      `);
    };
    m.customProgramCacheKey=()=>`harbour-surface-${kind}-v2`;
  }
  cache.set(key,m);return m;
}
export const materialStats=()=>({materials:cache.size,textures:Object.keys(textures).length});

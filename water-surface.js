import * as T from './three.module.js';
import { Water } from './WaterReflection.js';

// Use the shader's displaced surface for small floating props.
export function sampleWater(x,z,time,target){
 const sx=x,sz=z;let y=-.35;
 for(const [dx,dz,length,amplitude,speed] of [[1,.35,13,.17,1.04],[-.4,1,7.8,.09,1.47],[.7,-.6,4.1,.035,1.83],[-1,-.8,2.6,.015,2.25]]){
  const n=Math.hypot(dx,dz),a=dx/n,b=dz/n,phase=6.2831853/length*(a*x+b*z)-time*speed;
  y+=amplitude*Math.sin(phase);x+=a*amplitude*.35*Math.cos(phase);z+=b*amplitude*.35*Math.cos(phase);
 }
 const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)};
 const shore=-96+2*Math.sin((sz-41)*.028)+.8*Math.sin(sz*.083);
 const mask=smooth(40,48,sz)*(1-smooth(204,211,sz));
 const damping=1-mask*(1-(.035+.965*smooth(0,17,Math.abs(sx-shore))));
 return target.set(sx+(x-sx)*damping,-.35+(y+.35)*damping,sz+(z-sz)*damping);
}

// Analytic, periodic normal field. Generated once; mipmaps filter tiny ripples.
function rippleNormals(){
  const size=256,data=new Uint8Array(size*size*4);
  const waves=[[3,5,.30],[7,-4,.23],[-5,11,.19],[14,3,.16],[9,-17,.11],[23,13,.07],[-31,19,.05]];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    let dx=0,dy=0;
    for(const [a,b,weight] of waves){let phase=(a*x+b*y)/size*Math.PI*2;let k=Math.hypot(a,b);dx+=Math.cos(phase)*a/k*weight;dy+=Math.cos(phase)*b/k*weight;}
    const n=new T.Vector3(-dx,-dy,1).normalize(),i=(y*size+x)*4;
    data[i]=(n.x*.5+.5)*255;data[i+1]=(n.y*.5+.5)*255;data[i+2]=(n.z*.5+.5)*255;data[i+3]=255;
  }
  const tex=new T.DataTexture(data,size,size);tex.wrapS=tex.wrapT=T.RepeatWrapping;
  tex.generateMipmaps=true;tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.anisotropy=8;tex.needsUpdate=true;return tex;
}
export function createWater(scene){
  const geometry=new T.PlaneGeometry(2,2,224,224),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
    p.setX(i,Math.sign(p.getX(i))*Math.pow(Math.abs(p.getX(i)),1.7)*480);
    p.setY(i,Math.sign(p.getY(i))*Math.pow(Math.abs(p.getY(i)),1.7)*480+35);
  }
  geometry.computeBoundingSphere();
  const water=new Water(geometry,{textureWidth:1024,textureHeight:1024,waterNormals:rippleNormals(),sunDirection:new T.Vector3(-100,23,-230).normalize(),sunColor:'#ffe4af',waterColor:'#264c49',distortionScale:1.8,fog:true});
  water.name='Reflective harbor water';water.rotation.x=-Math.PI/2;water.position.y=-.35;water.userData.keepDynamic=true;scene.add(water);
  water.material.vertexShader=/* glsl */`
    uniform mat4 textureMatrix;
    uniform float time;
    varying vec4 mirrorCoord;
    varying vec4 worldPosition;
    varying vec2 waveSlope;
    #include <common>
    #include <fog_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    void wave(vec2 dir,float wavelength,float amplitude,float speed,inout vec3 p,inout vec2 slope){
      float k=6.2831853/wavelength;
      float phase=k*dot(dir,p.xz)-time*speed;
      p.y+=amplitude*sin(phase);
      slope+=dir*k*amplitude*cos(phase);
      p.xz+=dir*amplitude*.35*cos(phase);
    }
    void main(){
      worldPosition=modelMatrix*vec4(position,1.);
      vec3 wp=worldPosition.xyz;vec3 stillWater=wp;waveSlope=vec2(0.);
      wave(normalize(vec2(1.,.35)),13.,.17,1.04,wp,waveSlope);
      wave(normalize(vec2(-.4,1.)),7.8,.09,1.47,wp,waveSlope);
      wave(normalize(vec2(.7,-.6)),4.1,.035,1.83,wp,waveSlope);
      wave(normalize(vec2(-1.,-.8)),2.6,.015,2.25,wp,waveSlope);
      float shore=-96.+2.*sin((stillWater.z-41.)*.028)+.8*sin(stillWater.z*.083);
      float coastMask=smoothstep(40.,48.,stillWater.z)*(1.-smoothstep(204.,211.,stillWater.z));
      float damping=mix(1.,.035+.965*smoothstep(0.,17.,abs(stillWater.x-shore)),coastMask);
      wp=mix(stillWater,wp,damping);waveSlope*=damping;
      worldPosition.xyz=wp;
      mirrorCoord=textureMatrix*worldPosition;
      vec4 mvPosition=viewMatrix*worldPosition;
      gl_Position=projectionMatrix*mvPosition;
      #include <beginnormal_vertex>
      #include <defaultnormal_vertex>
      #include <logdepthbuf_vertex>
      #include <fog_vertex>
      #include <shadowmap_vertex>
    }
  `;
  water.material.fragmentShader=/* glsl */`
    uniform sampler2D mirrorSampler,normalSampler;
    uniform vec3 sunColor,sunDirection,eye,waterColor;
    uniform float time;
    varying vec4 mirrorCoord;
    varying vec4 worldPosition;
    varying vec2 waveSlope;
    #include <common>
    #include <packing>
    #include <bsdfs>
    #include <fog_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>
    void main(){
      #include <logdepthbuf_fragment>
      vec2 uv=worldPosition.xz;
      vec3 n1=texture2D(normalSampler,uv*.075+vec2(time*.008,-time*.004)).xyz*2.-1.;
      vec3 n2=texture2D(normalSampler,uv.yx*.137+vec2(-time*.006,time*.009)).xyz*2.-1.;
      vec3 n3=texture2D(normalSampler,uv*.291+vec2(time*.014,time*.011)).xyz*2.-1.;
      vec3 V=normalize(eye-worldPosition.xyz);
      float distanceToEye=length(eye-worldPosition.xyz);
      float fineFade=1.-smoothstep(45.,220.,distanceToEye);
      vec2 ripples=n1.xy*.23+n2.yx*.14*fineFade+n3.xy*.055*fineFade;
      vec3 N=normalize(vec3(-waveSlope.x+ripples.x,1.,-waveSlope.y+ripples.y));
      float facing=clamp(dot(N,V),0.,1.);
      float fresnel=.025+.975*pow(1.-facing,5.);
      vec2 reflectionUV=mirrorCoord.xy/mirrorCoord.w;
      vec2 distortion=N.xz*(.012+.10/max(distanceToEye,3.));
      vec3 reflected=texture2D(mirrorSampler,clamp(reflectionUV+distortion,.002,.998)).rgb;
      vec3 deep=vec3(.023,.066,.061);
      vec3 shallow=vec3(.09,.16,.105);
      float quayEdge=min(abs(uv.y-9.5),uv.y<10.&&uv.y>-78.?abs(uv.x-29.):100.);
      float beachX=-96.+2.*sin((uv.y-41.)*.028)+.8*sin(uv.y*.083);
      float beachMask=smoothstep(40.,48.,uv.y)*(1.-smoothstep(204.,211.,uv.y));
      float beachDistance=beachX-uv.x;
      float beachShallow=exp(-max(beachDistance,0.)*.085)*beachMask;
      float shallowFactor=max(exp(-quayEdge*.40),beachShallow);
      shallow=mix(shallow,vec3(.23,.27,.17),beachShallow*.8);
      vec3 body=mix(deep,shallow,shallowFactor)*(.86+dot(N,sunDirection)*.24);
      vec3 H=normalize(V+sunDirection);
      float spec=pow(max(dot(N,H),0.),150.)*.68+pow(max(dot(N,H),0.),950.)*2.5;
      float shadow=getShadowMask();
      vec3 result=mix(body,reflected,clamp(.24+fresnel*.76,0.,1.));
      result+=sunColor*spec*shadow;
      float edgeNoise=sin(uv.x*4.1+uv.y*3.3+time)*sin(uv.x*1.7-uv.y*2.5-time*.6);
      float foam=exp(-quayEdge*5.)*smoothstep(.08,.65,edgeNoise+worldPosition.y+.38)*.32;
      result=mix(result,vec3(.55,.58,.44),foam);
      float wash=sin(time*.8+uv.y*.09)*.65;
      float beachFoam=exp(-pow((beachDistance-wash-.2)*1.2,2.))*beachMask;
      beachFoam*=.35+.35*smoothstep(-.4,.7,edgeNoise);
      result=mix(result,vec3(.69,.72,.59),beachFoam);
      result=mix(result,vec3(.30,.33,.20),beachShallow*.13*(1.-fresnel));
      result*=.72+.28*shadow;
      gl_FragColor=vec4(result,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }
  `;
  const renderReflection=water.onBeforeRender,lastPosition=new T.Vector3(Infinity,0,0),lastQuaternion=new T.Quaternion();
  let lastTime=-1;water.reflectionPasses=0;water.reflectionInterval=1/30;
  water.onBeforeRender=function(renderer,scene,camera){
    const time=water.material.uniforms.time.value;
    if(lastPosition.distanceToSquared(camera.position)<.0001&&lastQuaternion.angleTo(camera.quaternion)<.001&&time-lastTime<water.reflectionInterval)return;
    renderReflection.call(this,renderer,scene,camera);lastTime=time;
    lastPosition.copy(camera.position);lastQuaternion.copy(camera.quaternion);water.reflectionPasses++;
  };
  water.setQuality=quality=>{
    const size=quality==='high'?1024:quality==='balanced'?768:512;
    water.reflectionTarget.setSize(size,size);water.reflectionInterval=quality==='high'?1/45:quality==='balanced'?1/30:1/20;
  };
  return water;
}

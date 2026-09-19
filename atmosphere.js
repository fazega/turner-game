import * as T from './three.module.js';

export function createAtmosphere(scene){
  const time={value:0};
  const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{time},vertexShader:`varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:/*glsl*/`
    varying vec3 skyDirection;
    uniform float time;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float value=0.,weight=.5;for(int i=0;i<4;i++){value+=weight*noise(p);p=mat2(1.7,1.2,-1.2,1.7)*p;weight*=.5;}return value;}
    void main(){
      vec3 dir=normalize(skyDirection);
      float h=dir.y;
      vec3 horizon=vec3(.65,.44,.20),zenith=vec3(.075,.165,.30);
      vec3 color=mix(horizon,zenith,smoothstep(-.025,.74,h));
      float solar=pow(max(dot(dir,normalize(vec3(-100.,23.,-230.))),0.),35.);
      color+=vec3(.31,.18,.055)*solar;
      vec2 cloudUV=dir.xz/max(dir.y+.14,.10)*2.1+vec2(time*.0008,0.);
      float cloud=fbm(cloudUV*vec2(.7,1.5));
      float wisps=smoothstep(.43,.73,cloud+noise(cloudUV*4.)*.08);
      float mask=smoothstep(.025,.22,h)*(1.-smoothstep(.65,1.,h));
      color=mix(color,vec3(.48,.46,.39),wisps*mask*.54);
      color+=vec3(.13,.09,.025)*wisps*solar;
      gl_FragColor=vec4(color,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `});
  const sky=new T.Mesh(new T.SphereGeometry(480,40,24),material);sky.name='Painted cloud sky';scene.add(sky);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');
  const g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,230,167,.65)');g.addColorStop(.16,'rgba(255,221,137,.23)');g.addColorStop(1,'rgba(255,218,128,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  const glow=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,fog:false}));glow.position.set(-230,52.9,-529);glow.scale.set(149.5,149.5,1);scene.add(glow);
  const disc=new T.Mesh(new T.SphereGeometry(5.06,24,16),new T.MeshBasicMaterial({color:'#fff4cd',toneMapped:false,fog:false}));disc.position.copy(glow.position);scene.add(disc);
  return {time};
}

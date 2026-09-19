import * as T from './three.module.js';
let scanned=null;
export async function preloadFoliage(){
  const loader=new T.TextureLoader();const [map,normalMap]=await Promise.all(['needles.png','needles-normal.jpg'].map(name=>loader.loadAsync(`./assets/pine_tree_01/${name}`)));
  map.colorSpace=T.SRGBColorSpace;for(const t of [map,normalMap])t.anisotropy=8;scanned={map,normalMap};
}

// Alpha-tested branch cards supplement the solid canopy with fine silhouettes.
// They write depth normally, so no transparent sorting is needed.
export function foliageMaterials(){
  if(scanned)return ['#bac397','#d8d8ae','#99ad7a','#ced59d'].map(color=>{
    const m=new T.MeshStandardMaterial({...scanned,color,alphaTest:.42,side:T.DoubleSide,roughness:.9});m.normalScale.setScalar(.3);m.name='Scanned pine foliage';return m;
  });
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');let seed=717;
  const random=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;
  ctx.strokeStyle='#746542';ctx.lineWidth=2.3;
  ctx.beginPath();ctx.moveTo(128,247);ctx.bezierCurveTo(140,165,113,77,135,12);ctx.stroke();
  for(let j=0;j<16;j++){
    const y=30+j*12,width=Math.sin((j+1)/18*Math.PI)*85+12;
    for(let side of [-1,1]){
      const endX=128+side*width,endY=y-10-random()*13;
      ctx.strokeStyle='#796944';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(128,y+18);ctx.lineTo(endX,endY);ctx.stroke();
      for(let k=0;k<12;k++){
        const t=k/12,x=128+(endX-128)*t,yy=y+18+(endY-y-18)*t;
        for(let s of [-1,1]){
          ctx.fillStyle=['#9da666','#b6b979','#7f914e','#cad092'][Math.floor(random()*4)];
          ctx.beginPath();ctx.ellipse(x+side*4,yy+s*(5+random()*3),2+random()*2,8+random()*6,side*.8+s*.35,0,Math.PI*2);ctx.fill();
        }
      }
    }
  }
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  return ['#9ea275','#bec08c','#8b9b67','#d0c795'].map(color=>{
    const m=new T.MeshStandardMaterial({color,map,alphaTest:.43,side:T.DoubleSide,roughness:1});
    m.name='Needle foliage';return m;
  });
}

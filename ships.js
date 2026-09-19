import * as T from './three.module.js';
import { material } from './materials.js';

export function createShipBuilder({scene,mesh,box,cyl,line,wood,goldwood,trim,rope,dark,details,rand,assets}){
  const canvas=material('#c5b591',1,'canvas');canvas.side=T.DoubleSide;
  const sailTime={value:0};
  const originalCompile=canvas.onBeforeCompile;
  canvas.onBeforeCompile=shader=>{
    originalCompile(shader);shader.uniforms.sailTime=sailTime;
    shader.vertexShader='uniform float sailTime;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      transformed.z+=sin(position.x*1.4+sailTime*1.35)*.045*sin(uv.y*3.14159);
    `);
  };
  canvas.customProgramCacheKey=()=> 'animated-linen-v1';
  const iron=material('#353b36',.6),gilt=material('#a48d58',.65);
  const ships=[];
  function ship(x,z,scale=1,angle=0){
    if(assets){
      const g=new T.Group();g.name='Colonial pinnace · Poly Haven';g.position.set(x,-.42,z);g.rotation.y=angle;g.scale.setScalar(scale);g.add(assets.ship());scene.add(g);ships.push(g);g.userData.baseY=-.42;g.userData.scale=scale;return g;
    }
    const g=new T.Group();g.name='Rigged merchant vessel';g.position.set(x,-.15,z);g.scale.setScalar(scale);g.rotation.y=angle;scene.add(g);ships.push(g);
    const sections=[[-11.5,.9,3.8],[-10,2.8,3.6],[-7,4,3.05],[0,4.5,2.85],[6,3.6,3.05],[10,2,3.5],[13,.07,4.1]];
    const profile=[[-1,1],[-.98,.76],[-.82,.37],[-.46,.07],[0,0],[.46,.07],[.82,.37],[.98,.76],[1,1]];
    const vertices=[],indices=[],uv=[];
    for(let s=0;s<sections.length;s++){
      const [zz,w,top]=sections[s];
      for(let j=0;j<profile.length;j++){const [xx,yy]=profile[j];vertices.push(xx*w,-1.15+yy*(top+1.15),zz);uv.push(s/(sections.length-1),j/(profile.length-1))}
      if(s<sections.length-1)for(let j=0;j<profile.length-1;j++){let a=s*profile.length+j,b=a+profile.length;indices.push(a,b,a+1,b,b+1,a+1)}
    }
    const hull=new T.BufferGeometry();hull.setAttribute('position',new T.Float32BufferAttribute(vertices,3));hull.setAttribute('uv',new T.Float32BufferAttribute(uv,2));hull.setIndex(indices);hull.computeVertexNormals();
    const hullMaterial=material('#483628',.83,'timber');hullMaterial.side=T.DoubleSide;mesh(hull,hullMaterial,0,0,0,g);
    // Deck follows the sheer of the hull, instead of intersecting a flat slab.
    const deckVertices=[],deckUV=[];
    for(let i=0;i<sections.length-1;i++){
      const [z1,w1,y1]=sections[i],[z2,w2,y2]=sections[i+1];
      for(let [xx,yy,zz] of [[-w1,y1,z1],[-w2,y2,z2],[w1,y1,z1],[w1,y1,z1],[-w2,y2,z2],[w2,y2,z2]]){deckVertices.push(xx,yy+.01,zz);deckUV.push(xx,zz)}
    }
    let deck=new T.BufferGeometry();deck.setAttribute('position',new T.Float32BufferAttribute(deckVertices,3));deck.setAttribute('uv',new T.Float32BufferAttribute(deckUV,2));deck.computeVertexNormals();
    mesh(deck,goldwood,0,0,0,g);
    for(let side of [-1,1]){
      for(let f of [.40,.58,.75,.92,1.02])details.curve(sections.map(([zz,w,top])=>[side*w*(f<.6?.85:.99),-1.15+f*(top+1.15),zz]),f===1.02?.10:.045,f===.92?gilt:wood,g);
      details.curve(sections.map(([zz,w,top])=>[side*w,top+.7,zz]),.07,goldwood,g);
      for(let i=1;i<sections.length-1;i++){
        const [zz,w,top]=sections[i];line([side*w,top,zz],[side*w,top+.7,zz],.055,wood,g);
      }
      for(let zz=-8;zz<8;zz+=2){
        let section=sections.findIndex((v,i)=>i<sections.length-1&&zz>=v[0]&&zz<sections[i+1][0]);
        const a=sections[section],b=sections[section+1],t=(zz-a[0])/(b[0]-a[0]);
        const width=T.MathUtils.lerp(a[1],b[1],t),top=T.MathUtils.lerp(a[2],b[2],t);
        const f=(1.65+1.15)/(top+1.15),factor=.82+(f-.37)/(.76-.37)*.16;
        const px=side*(width*factor+.025);
        box(px,1.65,zz,.08,.45,.55,dark,g);box(px+side*.02,1.43,zz,.12,.06,.66,gilt,g);
      }
    }
    // Raised stern gallery, framed windows and a carved rail.
    box(0,4.1,-8.3,5.8,1.7,4,wood,g);box(0,5.02,-8.3,6.1,.18,4.4,goldwood,g);
    for(let xx=-2.2;xx<=2.3;xx+=.85){box(xx,4.2,-10.32,.62,.9,.05,dark,g);for(let dx of [-.35,.35])box(xx+dx,4.2,-10.4,.06,1.1,.08,gilt,g);box(xx,4.2,-10.43,.025,.9,.02,gilt,g);box(xx,4.2,-10.43,.6,.03,.02,gilt,g);box(xx,4.72,-10.4,.76,.08,.1,gilt,g)}
    for(let xx=-2.8;xx<3;xx+=.4)line([xx,5.05,-10.3],[xx,5.6,-10.3],.035,gilt,g);
    line([-3,5.62,-10.3],[3,5.62,-10.3],.08,wood,g);
    for(let zz of [-4.7,4]){
      const height=zz<0?24:21;
      cyl(0,3+height/2,zz,.19,height,wood,g,.09,12);
      for(let yy of [3.4,8.5,15,20])cyl(0,yy,zz,.215,.1,iron,g,.215,12);
      const levels=zz<0?[[12,9.8,5.8],[19,7.7,5.0],[24.5,4.7,3.6]]:[[11,9,5.2],[17.5,6.5,4.6],[22,4.5,3.0]];
      for(let [top,width,height] of levels){
        line([-width*.55,top,zz],[width*.55,top,zz],.085,wood,g);
        const geo=new T.PlaneGeometry(width,height,16,10),p=geo.attributes.position;
        for(let i=0;i<p.count;i++){
          const u=geo.attributes.uv.getX(i),v=geo.attributes.uv.getY(i);
          p.setX(i,p.getX(i)*(.79+.21*v));
          p.setY(i,p.getY(i)+Math.sin(u*Math.PI)*.32*(1-v));
          p.setZ(i,Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*1.15+.12*Math.sin(u*18)*Math.sin(v*Math.PI));
        }geo.computeVertexNormals();
        const sail=mesh(geo,canvas,0,top-height/2-.12,zz,g);sail.userData.keepDynamic=true;
        // Bolt ropes, stitched panel seams and corner sheets.
        details.curve([[-width*.5,top-.12,zz],[0,top-.12,zz],[width*.5,top-.12,zz]],.027,rope,g);
        details.curve([[-width*.395,top-height-.12,zz],[0,top-height+.2,zz],[width*.395,top-height-.12,zz]],.025,rope,g);
        for(let side of [-1,1])line([side*width*.395,top-height,zz],[side*3.6,3.6,zz+1.7],.018,rope,g);
        for(let u of [.25,.5,.75]){
          let points=[];for(let j=0;j<=10;j++){let v=j/10;points.push([(u-.5)*width*(.79+.21*v),top-height+v*height-.12+Math.sin(u*Math.PI)*.32*(1-v),zz+Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*1.15+.12*Math.sin(u*18)*Math.sin(v*Math.PI)+.015])}
          details.curve(points,.010,material('#978866'),g);
        }
      }
      // Shrouds converge toward the mast; ratlines span the shrouds.
      for(let side of [-1,1]){
        for(let j=0;j<4;j++)line([0,height+1,zz],[side*3.9,3.2,zz-1.7+j*.9],.023,rope,g);
        for(let j=0;j<24;j++){let t=j/26,y=3.3+t*(height-2.3),xx=side*3.9*(1-t);line([xx,y,zz-1.7*(1-t)],[xx,y,zz+1*(1-t)],.016,rope,g)}
      }
      cyl(0,height*.68,zz,.7,.13,goldwood,g,.7,12);
      const flagGeo=new T.PlaneGeometry(2.8,1,8,2);let p=flagGeo.attributes.position;
      for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*2)*.22);
      const flagMaterial=material('#b59a51',1,'canvas');flagMaterial.side=T.DoubleSide;
      mesh(flagGeo,flagMaterial,1.4,height+2.6,zz,g);
    }
    line([0,3,11],[0,6.6,20],.13,wood,g);line([0,22,4],[0,6.6,20],.025,rope,g);
    line([0,27,-4.7],[0,24,4],.028,rope,g);line([0,27,-4.7],[0,5,-11],.027,rope,g);
    const jibGeo=new T.BufferGeometry();jibGeo.setAttribute('position',new T.Float32BufferAttribute([0,19,4,0,6.8,18.7,0,7,5],3));jibGeo.setAttribute('uv',new T.Float32BufferAttribute([0,1,1,0,0,0],2));jibGeo.computeVertexNormals();mesh(jibGeo,canvas,0,0,0,g).userData.keepDynamic=true;
    // Deck furniture and cargo, visible when flying over the vessel.
    box(0,3.12,0,2,.18,2.6,dark,g);for(let k=-.9;k<1;k+=.2)box(k,3.23,0,.07,.07,2.5,wood,g);
    for(let k=-1.2;k<1.3;k+=.3)box(0,3.24,k,2,.07,.065,wood,g);
    details.barrel(-2.4,-1,g,3,.8);details.barrel(2.4,-2,g,3,.8);details.crate(-2.3,6,3.15,.8,g);
    cyl(0,3.45,7,.4,.65,wood,g,.4,12);for(let j=0;j<4;j++){let a=j*Math.PI/2;line([-Math.cos(a),3.8,7-Math.sin(a)],[Math.cos(a),3.8,7+Math.sin(a)],.05,goldwood,g)}
    g.userData.baseY=-.15;g.userData.scale=scale;return g;
  }
  return {ship,ships,sailTime};
}

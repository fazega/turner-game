import {finishCargo} from './prop-finishes.js';
import * as T from './three.module.js';
import { material } from './materials.js';
import { foliageMaterials } from './foliage.js';

export function createDetailBuilders({scene,mesh,box,cyl,line,rand,stone,trim,wood,goldwood,rope,dark,assets,characters}){
  const iron=material('#393b35',.65),brass=material('#aa8953',.48),soil=material('#554c35'),bark=material('#67553c',1,'bark');
  const leaves=['#394a29','#495b31','#5c6838','#697345'].map(c=>material(c));
  const foliage=foliageMaterials();
  const treeRecords=[];
  const sphereGeometry=new T.SphereGeometry(1,10,7);
  function ellipsoid(x,y,z,sx,sy,sz,m,parent=scene){let o=mesh(sphereGeometry.clone(),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o}
  function curve(points,r,m,parent=scene){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(10,points.length*5),r,8,false),m,0,0,0,parent)}
  function ring(x,y,z,r,t,m,parent=scene){let o=mesh(new T.TorusGeometry(r,t,8,32),m,x,y,z,parent);o.rotation.x=Math.PI/2;return o}
  function leafCard(x,y,z,size,index,direction){
    const o=mesh(new T.PlaneGeometry(size*.72,size*1.44),foliage[index%4],x,y,z);
    if(direction)o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction.normalize());
    else o.rotation.set((rand()-.5)*2,rand()*Math.PI*2,rand()*Math.PI);
    return o;
  }

  function tree(x,z,height=14,type='pine'){
    // Every root intersects a visible, ground-level planter. No inherited
    // rooftop offset: root elevation is part of the diagnostic tree record.
    const ground=.30;treeRecords.push({x,z,ground,rootBottom:ground-.08,height,type});
    box(x,ground+.12,z,3.6,.24,3.6,soil);
    for(let side of [-1,1]){box(x+side*1.85,ground+.25,z,.25,.5,4,trim);box(x,ground+.25,z+side*1.85,4,.5,.25,trim)}
    if(assets?.tree&&type==='pine'){
      const model=assets.tree(height);model.position.set(x,ground-.08,z);model.rotation.y=rand()*Math.PI*2;scene.add(model);return;
    }
    cyl(x,ground+height*.37-.04,z,height*.028,height*.74,bark,scene,height*.013,12);
    // Visible roots ground the silhouette even when the canopy is viewed by air.
    for(let j=0;j<6;j++){let a=j*Math.PI/3;line([x,ground+.45,z],[x+Math.cos(a)*1.3,ground+.16,z+Math.sin(a)*1.3],.10,bark)}
    if(type==='cypress'){
      for(let tier=0;tier<8;tier++){
        let y=ground+height*(.24+tier*.09),radius=height*.095*(1-tier*.09);
        ellipsoid(x+Math.sin(tier)*.2,y,z,radius*.75,height*.13,radius*.68,leaves[tier%4]);
        for(let j=0;j<34;j++){
          let a=rand()*Math.PI*2,ny=(rand()-.5)*height*.18;
          leafCard(x+Math.cos(a)*radius*.9,y+ny,z+Math.sin(a)*radius*.8,.9+rand()*.7,j,new T.Vector3(Math.cos(a),.2,Math.sin(a)));
        }
      }
    }else{
      for(let branch=0;branch<7;branch++){
        let a=branch*2.4,len=height*(.17+rand()*.12),end=[x+Math.cos(a)*len,ground+height*(.76+rand()*.17),z+Math.sin(a)*len];
        curve([[x,ground+height*.48,z],[x+Math.cos(a)*len*.32,ground+height*.69,z+Math.sin(a)*len*.32],end],height*.013,bark);
        for(let j=0;j<7;j++){
          let px=end[0]+(rand()-.5)*len,py=end[1]+(rand()-.5)*1.6,pz=end[2]+(rand()-.5)*len;
          ellipsoid(px,py,pz,.75+rand()*.6,.42+rand()*.4,.75+rand()*.55,leaves[(branch+j)%4]);
          for(let k=0;k<16;k++){
            const a=rand()*Math.PI*2,v=rand()*2-1,r=Math.sqrt(1-v*v);
            const dir=new T.Vector3(Math.cos(a)*r,v*.6,Math.sin(a)*r);
            leafCard(px+dir.x*1.5,py+dir.y*1.6,pz+dir.z*1.5,1.15+rand()*.7,j+k,dir);
          }
        }
      }
    }
  }
  function architecture(){
    // Detailed west-facing facades: recessed windows, shutters, arch stones,
    // rusticated quoins and projecting balcony brackets.
    for(const [x,z,w,d,h] of [[49,-34,28,44,22],[58,19,26,15,31],[65,-73,32,21,17],[42,-52,9,10,29]]){
      const front=x-w/2;
      for(let zz=z-d/2+2;zz<z+d/2;zz+=3.3){
        for(let yy=5;yy<h-1;yy+=4.6){
          for(let side of [-1,1]){box(front-.13,yy,zz+side*.63,.28,2.5,.13,trim);box(front-.15,yy,zz+side*.39,.12,2.08,.27,material('#5d634c',1,'timber'));}
          box(front-.16,yy+1.2,zz,.3,.18,1.46,trim);box(front-.21,yy-1.2,zz,.45,.25,1.55,trim);
          box(front-.22,yy,zz,.09,2.16,.055,brass);
          for(let sy of [-.45,.35])box(front-.23,yy+sy,zz,.09,.035,1.1,brass);
          if(Math.round(yy)%2){
            box(front-.58,yy-1.38,zz,.95,.22,1.9,trim);
            for(let r=-.8;r<=.8;r+=.32)line([front-.99,yy-1.22,zz+r],[front-.99,yy-.45,zz+r],.025,iron);
            line([front-.99,yy-.45,zz-.95],[front-.99,yy-.45,zz+.95],.035,iron);
          }
        }
        for(let yy=1.2;yy<6.5;yy+=.9)box(front-.2,yy,zz+1.4,.35,.8,.45,trim);
      }
      for(let zz of [z-d/2+.3,z+d/2-.3])for(let yy=.75;yy<h;yy+=1.05)box(front-.22,yy,zz,.5,.96,Math.round(yy)%2?1.05:.72,trim);
      for(let yy of [h-.4,h+.15,h+.8])box(x,yy,z,w+1.25,.16,d+1.25,trim);
      for(let zz=z-d/2;zz<z+d/2;zz+=.75)box(front-.35,h-.9,zz,.7,.3,.23,trim);
      // Rooftop urns and a proper balustrade, readable against the sky.
      for(let zz=z-d/2+1;zz<z+d/2;zz+=1.15){cyl(front,h+1.15,zz,.11,.9,trim,scene,.08,8);ellipsoid(front,h+1.17,zz,.15,.22,.15,trim)}
      for(let zz of [z-d/2,z+d/2]){cyl(front,h+2,zz,.35,.45,trim);ellipsoid(front,h+2.45,zz,.48,.5,.48,trim);cyl(front,h+2.9,zz,.28,.22,trim)}
    }
    for(let i=0;i<7;i++){
      const cz=-11.65-i*5.3;
      // Individual voussoirs form a flat stone arch rather than a round pipe.
      for(let j=0;j<13;j++){
        const a=j/13*Math.PI,b=(j+1)/13*Math.PI-.013,shape=new T.Shape();
        shape.moveTo(Math.cos(a)*2.08,Math.sin(a)*2.08);shape.lineTo(Math.cos(a)*2.57,Math.sin(a)*2.57);
        shape.lineTo(Math.cos(b)*2.57,Math.sin(b)*2.57);shape.lineTo(Math.cos(b)*2.08,Math.sin(b)*2.08);shape.closePath();
        const o=mesh(new T.ExtrudeGeometry(shape,{depth:.55,bevelEnabled:false}),j%3?trim:stone,31.45,5.6,cz);o.rotation.y=Math.PI/2;
      }
      box(31.5,8.02,cz,.85,.8,.5,trim);
    }
    // Quay masonry and a dark, damp tide line.
    for(let x=-84;x<83;x+=2.2){box(x,-.35,9.35,2.12,.64,.18,material('#8a8467',1,'stone'));box(x+1.1,-1.02,9.35,2.12,.6,.18,material('#626850',1,'stone'))}
    for(let z=-76;z<9;z+=2.2){box(29.05,-.35,z,.18,.64,2.12,material('#8a8467',1,'stone'));box(29.05,-1.02,z+1.1,.18,.6,2.12,material('#626850',1,'stone'))}
  }
  function barrel(x,z,parent=scene,y=.3,scale=1){
    if(assets){const model=assets.barrel();model.position.set(x,y,z);model.scale.setScalar(scale);parent.add(model);return finishCargo(model,'barrel');}
    const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
    const points=[new T.Vector2(.38,0),new T.Vector2(.44,.12),new T.Vector2(.50,.6),new T.Vector2(.46,1.1),new T.Vector2(.38,1.25)];
    mesh(new T.LatheGeometry(points,16),goldwood,0,0,0,g);
    cyl(0,1.23,0,.38,.04,goldwood,g,.38,16);
    for(const [yy,r] of [[.12,.44],[.34,.48],[.93,.48],[1.12,.43]])ring(0,yy,0,r,.035,iron,g);
    for(let j=0;j<16;j++){let a=j/16*Math.PI*2;curve([[Math.cos(a)*.39,.02,Math.sin(a)*.39],[Math.cos(a)*.5,.61,Math.sin(a)*.5],[Math.cos(a)*.39,1.24,Math.sin(a)*.39]],.011,wood,g)}
    cyl(.07,1.26,.02,.07,.025,wood,g,.07,8);return g;
  }
  function crate(x,z,y=.3,size=1,parent=scene){
    if(assets){const model=assets.crate();model.position.set(x,y,z);model.scale.setScalar(size);parent.add(model);return model;}
    const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(size);parent.add(g);
    box(0,.55,0,1.2,1.1,1,goldwood,g);
    for(let side of [-1,1]){
      for(let yy=.1;yy<1.1;yy+=.22)box(0,yy,side*.51,1.21,.018,.025,wood,g);
      for(let xx of [-.48,.48])box(xx,.55,side*.54,.12,1.1,.06,wood,g);
      line([-.47,.10,side*.58],[.47,1,side*.58],.065,wood,g);
      for(let xx of [-.47,.47])for(let yy of [.13,.95])ellipsoid(xx,yy,side*.59,.026,.026,.014,iron,g);
    }
    return g;
  }
  function sack(x,z,angle=0,parent=scene){
    const g=new T.Group();g.position.set(x,.32,z);g.rotation.y=angle;parent.add(g);
    const fabric=material('#a49372',1,'canvas');
    const geo=new T.SphereGeometry(1,24,16),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      let xx=p.getX(i),yy=p.getY(i),zz=p.getZ(i),a=Math.atan2(yy,xx);
      const folds=1+.05*Math.cos(a*9+zz*3)*Math.pow(Math.abs(zz),2);
      p.setXYZ(i,xx*.38*folds,yy*.235*folds+.25,zz*.63);
    }geo.computeVertexNormals();mesh(geo,fabric,0,0,0,g);
    curve([[-.025,.29,-.64],[-.32,.33,-.3],[-.38,.34,0],[-.31,.32,.35],[0,.28,.66]],.008,rope,g);
    cyl(0,.28,.66,.095,.16,fabric,g,.045,10).rotation.x=Math.PI/2;
    for(let i=0;i<15;i++){const t=i/14,z=-.55+t*1.1,x=-.36*Math.sin(Math.PI*t);curve([[x-.012,.342,z-.014],[x+.02,.355,z],[x+.035,.339,z+.014]],.0035,rope,g)}
    const knot=ring(0,.28,.68,.065,.016,rope,g);knot.rotation.x=0;
    return g;
  }
  function person(x,z,i,parent=scene){
    const g=characters.create(i%3===0?'woman':i%4===0?'guard':'man',i%3);g.position.set(x,.32,z);g.rotation.y=rand()*Math.PI*2;g.scale.setScalar(.96+rand()*.06);parent.add(g);if([8,9,11,12].includes(i))g.userData.walkRoute={cx:-10,cz:44,rx:29,rz:1.7,speed:.85+(i%3)*.12,angle:i*1.7};if(g.userData.walkRoute)g.traverse(o=>{if(o.isMesh)o.castShadow=false});return g;
  }
  function lantern(x,z){
    cyl(x,1.7,z,.065,2.8,iron);cyl(x,.55,z,.16,.5,iron);
    curve([[x,3,z],[x,3.6,z],[x+.5,3.8,z],[x+.65,3.4,z]],.045,iron);
    const glass=new T.MeshStandardMaterial({color:'#e9bc65',emissive:'#bc7a25',emissiveIntensity:.35,roughness:.3});
    box(x+.65,3.1,z,.27,.45,.27,glass);for(let sx of [-.15,.15])for(let sz of [-.15,.15])line([x+.65+sx,2.84,z+sz],[x+.65+sx,3.38,z+sz],.018,iron);
    cyl(x+.65,3.44,z,.26,.2,iron,scene,0,4);
  }
  function quayLife(){
    // Keep the opening view and the walking routes clear; populate clusters.
    [[-15,14],[-16.8,15.2],[-13,15.1],[27,13],[28.5,13.2],[29,14.7],[35,30],[36.7,31.2],[-25,25],[-26.5,26.4],[33.3,-7],[-3,39],[1,42],[33.3,-17]].forEach(([x,z],i)=>person(x,z,i));
    for(const [x,z] of [[-17,17],[-20,22],[24,25],[-68,33],[-35,29],[15.5,21]]){
      barrel(x,z);barrel(x+1,z+.25,scene,.3,.9);crate(x-1.5,z+.1);crate(x-1.5,z+.1,1.4,.7);crate(x-2.5,z+1.5,.3,.8);
      for(let i=0;i<3;i++)sack(x+.4+i*.5,z+1.4,i*.4);
      for(let j=0;j<4;j++)ring(x+1.8,.35+j*.045,z+1,.4-j*.055,.03,rope);
    }
    for(let x of [-38,-13,15,28])lantern(x,11.4);
    person(33,40,2);
    const cart=new T.Group();cart.position.set(-8,.35,33);cart.rotation.y=.5;scene.add(cart);
    box(0,.85,0,1.5,.18,2.4,goldwood,cart);for(let side of [-1,1]){
      for(let y of [1,1.3])box(side*.76,y,0,.1,.18,2.4,goldwood,cart);
      let wheel=mesh(new T.TorusGeometry(.55,.065,6,22),wood,side*.94,.55,0,cart);wheel.rotation.y=Math.PI/2;
      for(let j=0;j<10;j++){let a=j*Math.PI/5;line([side*.94,.55,0],[side*.94,.55+Math.cos(a)*.53,Math.sin(a)*.53],.028,wood,cart)}
      line([side*.57,.85,1],[side*.57,.65,3.3],.06,wood,cart);
    }barrel(0,-.3,cart,.95,.8);
    for(let x=-70;x<31;x+=10){for(let j=0;j<4;j++)ring(x+.65,.36+j*.035,11.5,.4-j*.05,.025,rope)}
    // Mooring lines visibly tie the foreground ship to the stone edge.
    curve([[-26,2.8,4],[-18,.7,8],[-13,.9,10.8]],.035,rope);
    if(assets)for(const [x,z,angle] of [[32,3,-Math.PI/2],[39,32,Math.PI*.9]]){
      box(x,.57,z,1.7,.5,1.7,trim);box(x,1.3,z,1.25,1,1.25,stone);box(x,1.88,z,1.55,.2,1.55,trim);
      const bust=assets.bust();bust.position.set(x,1.98,z);bust.rotation.y=angle;scene.add(bust);
    }
  }
  function grove(){
    // Continuous soil beneath the rear garden and retaining wall at its edge.
    box(76,-.7,-17,16,2,67,stone);box(76,.32,-17,14,.10,65,soil);
    box(84,.8,-17,.6,1,68,trim);
    for(let i=0;i<8;i++)tree(75+(i%2)*5,-43+i*9,22+rand()*7,i%3===0?'cypress':'pine');
    tree(76,34,18,'pine');tree(81,43,16,'cypress');
    tree(-43,38,12,'pine');tree(-54,43,14,'pine');
    return treeRecords;
  }
  return {architecture,quayLife,grove,barrel,crate,sack,person,curve,ring,ellipsoid,treeRecords};
}

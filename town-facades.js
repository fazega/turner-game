import * as T from './three.module.js';
const iron=new T.MeshStandardMaterial({color:'#303834',metalness:.65,roughness:.55}),glasses=['#283d3e','#3a4441'].map(color=>new T.MeshStandardMaterial({color,metalness:.25,roughness:.28})),flowers=['#758148','#a95158'].map(color=>new T.MeshStandardMaterial({color,roughness:1})),lampMaterial=new T.MeshStandardMaterial({color:'#d9b778',emissive:'#b78639',emissiveIntensity:.18,roughness:.5});
export function detailTownFacade({city,box,x,z,w,d,h,base,trim,walls,roofs,shutter,windowMat,row,col}){
 const facade=z-d/2-.055;

 // Stone corner courses and a projecting cornice catch the low harbour light.
 for(const sx of [-1,1])for(let y=.5;y<h-.4;y+=.62)box(x+sx*(w/2-.16),base+y,facade-.025,.32,.29,.14,trim);
 box(x,base+h-.18,z,w+.30,.20,d+.3,trim);box(x,base+.35,facade,.95*w,.30,.13,walls[1]);
 const glass=glasses[Math.abs(col)%2];
 for(let floor=2;floor<h-1;floor+=3)for(let xx=-w/2+1.2;xx<w/2-.6;xx+=2){const wx=x+xx,wy=base+floor;
  box(wx,wy,facade-.018,.69,1.17,.07,glass);for(const dx of [-.41,.41])box(wx+dx,wy,facade-.09,.105,1.46,.14,trim);for(const dy of [-.7,.7])box(wx,wy+dy,facade-.10,.91,.12,.17,trim);
  box(wx,wy,facade-.12,.035,1.25,.035,shutter);box(wx,wy+.08,facade-.12,.75,.035,.035,shutter);
  for(const side of [-1,1]){for(let yy=-.52;yy<.61;yy+=.14)box(wx+side*.51,wy+yy,facade-.14,.23,.045,.075,shutter);for(const yy of [-.49,.49])box(wx+side*.51,wy+yy,facade-.19,.26,.04,.025,iron)}
  if(row<2&&floor===2&&(col+Math.round(xx))%3===0){box(wx,wy-.84,facade-.26,1.05,.22,.46,shutter);for(let i=0;i<7;i++){const flower=new T.Mesh(new T.IcosahedronGeometry(.07,1),flowers[i%2]);flower.position.set(wx-.4+i*.13,wy-.67,facade-.3);city.add(flower)}}
 }
 // Recessed wooden entry, lintel and ironwork; no empty painted rectangle.
 box(x,base+1.2,facade-.03,1.25,2.45,.14,windowMat);for(const dx of [-.70,.70])box(x+dx,base+1.24,facade-.12,.18,2.55,.22,trim);box(x,base+2.56,facade-.14,1.65,.20,.26,trim);
 for(let dx=-.5;dx<=.5;dx+=.125)box(x+dx,base+1.2,facade-.13,.112,2.3,.08,shutter);for(const yy of [.55,1.7])box(x,base+yy,facade-.19,1.03,.06,.04,iron);box(x+.35,base+1.2,facade-.22,.045,.19,.055,iron);
 // Tiled hipped-roof courses; rounded hip caps, chimney collar and pot.
 for(let i=1;i<7;i++){const t=i/7;box(x,base+h+2.6*t,z-(d+.8)/2*(1-t),(w+.8)*(1-t),.045,.07,roofs[1])}
 const apex=new T.Vector3(x,base+h+2.62,z);for(const dx of [-1,1])for(const dz of [-1,1]){const corner=new T.Vector3(x+dx*(w+.8)/2,base+h,z+dz*(d+.8)/2),v=apex.clone().sub(corner),cap=new T.Mesh(new T.CylinderGeometry(.06,.06,v.length(),7),roofs[0]);cap.position.copy(apex).add(corner).multiplyScalar(.5);cap.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());city.add(cap)}
 const pot=new T.Mesh(new T.CylinderGeometry(.16,.22,.65,10),roofs[0]);pot.position.set(x+w*.27,base+h+2.60,z);city.add(pot);
 // Small wrought-iron balconies on the nearest houses.
 if(row===0&&Math.abs(col)%2===0&&h>7){const by=base+4.15;box(x,by,facade-.48,2.7,.16,1.0,trim);box(x,by+1,facade-.98,2.65,.055,.05,iron);for(let dx=-1.25;dx<=1.26;dx+=.25)box(x+dx,by+.52,facade-.98,.035,.95,.035,iron);for(const dx of [-1.28,1.28])box(x+dx,by+1,facade-.51,.045,.045,.95,iron)}
 if(row<2){const lx=x-w/2+.65,ly=base+2.3;box(lx,ly+.25,facade-.3,.055,.6,.5,iron);const lamp=new T.Mesh(new T.BoxGeometry(.23,.36,.23),lampMaterial);lamp.position.set(lx,ly,facade-.5);city.add(lamp);for(const dx of [-.13,.13])box(lx+dx,ly,facade-.63,.025,.39,.025,iron);box(lx,ly+.22,facade-.5,.32,.08,.32,iron)}
}

import * as T from './three.module.js';

// Merge by material AND spatial cell, preserving useful frustum culling.
// Moving ships are batched in their own coordinate systems, never into the quay.
export function batchStatic(root,{cellSize=32,exclude=new Set()}={}){
  root.updateWorldMatrix(true,true);
  const inverse=new T.Matrix4().copy(root.matrixWorld).invert();
  const groups=new Map(),originals=[];let vertices=0;
  function visit(node){
    if(exclude.has(node)||node.userData.keepDynamic)return;
    if(node.isMesh&&!node.isInstancedMesh&&node.material?.isMeshStandardMaterial&&!Array.isArray(node.material)){
      const matrix=new T.Matrix4().multiplyMatrices(inverse,node.matrixWorld);
      const p=new T.Vector3().setFromMatrixPosition(matrix);
      const key=`${node.material.uuid}/${Math.floor(p.x/cellSize)}/${Math.floor(p.z/cellSize)}/${node.castShadow?1:0}`;
      if(!groups.has(key))groups.set(key,{material:node.material,castShadow:node.castShadow,parts:[]});
      const geometry=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();
      geometry.applyMatrix4(matrix);vertices+=geometry.attributes.position.count;
      groups.get(key).parts.push(geometry);originals.push(node);
    }
    for(const child of node.children)visit(child);
  }
  for(const child of root.children)visit(child);
  for(const group of groups.values()){
    const count=group.parts.reduce((sum,g)=>sum+g.attributes.position.count,0);
    const positions=new Float32Array(count*3),normals=new Float32Array(count*3),uvs=new Float32Array(count*2);
    const colors=group.material.vertexColors?new Float32Array(count*3).fill(1):null;
    let offset=0;
    for(const g of group.parts){
      positions.set(g.attributes.position.array,offset*3);normals.set(g.attributes.normal.array,offset*3);
      if(g.attributes.uv)uvs.set(g.attributes.uv.array,offset*2);
      if(colors&&g.attributes.color)colors.set(g.attributes.color.array,offset*3);
      offset+=g.attributes.position.count;g.dispose();
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));
    geometry.setAttribute('normal',new T.BufferAttribute(normals,3));geometry.setAttribute('uv',new T.BufferAttribute(uvs,2));
    if(colors)geometry.setAttribute('color',new T.BufferAttribute(colors,3));
    geometry.computeBoundingSphere();geometry.computeBoundingBox();
    const mesh=new T.Mesh(geometry,group.material);mesh.castShadow=group.castShadow;mesh.receiveShadow=true;
    mesh.name=`Static batch: ${group.material.name}`;mesh.matrixAutoUpdate=false;root.add(mesh);
  }
  const disposed=new Set();
  for(const mesh of originals){mesh.removeFromParent();if(!disposed.has(mesh.geometry)){mesh.geometry.dispose();disposed.add(mesh.geometry)}}
  // The empty transform groups no longer need per-frame matrix traversals.
  function prune(node){for(const child of [...node.children]){if(exclude.has(child)||child.userData.keepDynamic)continue;prune(child);if(child.isGroup&&!child.children.length)child.removeFromParent()}}
  prune(root);
  return {before:originals.length,after:groups.size,vertices};
}

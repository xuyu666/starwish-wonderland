import * as THREE from '../vendor/three.module.js';
export {THREE};
const materials = new Map(), geometries = new Map();
export const assets = [];
export function mat(color, metalness=0, roughness=.45, emissive=0) {
  if (color?.isMaterial) return color;
  const key = `${color}:${metalness}:${roughness}:${emissive}`;
  if (!materials.has(key)) materials.set(key,new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity:.7}));
  return materials.get(key);
}
function geo(key,create) { if(!geometries.has(key)) geometries.set(key,create()); return geometries.get(key); }
export function mesh(parent,geometry,material,x=0,y=0,z=0) {
  const m=new THREE.Mesh(geometry,mat(material));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
export function box(p,w,h,d,c,x=0,y=0,z=0){return mesh(p,geo(`b${w},${h},${d}`,()=>new THREE.BoxGeometry(w,h,d)),c,x,y,z);}
export function sphere(p,r,c,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=mesh(p,geo(`s${r}`,()=>new THREE.SphereGeometry(r,16,12)),c,x,y,z);m.scale.set(sx,sy,sz);return m;}
export function cylinder(p,rt,rb,h,c,x=0,y=0,z=0,n=32){return mesh(p,geo(`c${rt},${rb},${h},${n}`,()=>new THREE.CylinderGeometry(rt,rb,h,n)),c,x,y,z);}
export function cone(p,r,h,c,x=0,y=0,z=0,n=32){return cylinder(p,0,r,h,c,x,y,z,n);}
export function torus(p,r,t,c,x=0,y=0,z=0){return mesh(p,geo(`t${r},${t}`,()=>new THREE.TorusGeometry(r,t,8,48)),c,x,y,z);}
export function beam(p,a,b,r,c){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const m=cylinder(p,r,r,d.length(),c,...start.clone().add(end).multiplyScalar(.5).toArray(),8);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
export function group(p,x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g;}
export function register(id,name,zone,node,details={}){assets.push({id,name,zone,node,details});return node;}
export function textSign(p,text,x,y,z,width=5,color='#46316c',background='#fff3d9'){
  const cv=document.createElement('canvas');cv.width=768;cv.height=160;const c=cv.getContext('2d');c.fillStyle=background;c.fillRect(0,0,768,160);c.strokeStyle='#e9af4f';c.lineWidth=14;c.strokeRect(7,7,754,146);c.fillStyle=color;c.font='bold 66px "Microsoft YaHei",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,384,84,700);
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});return mesh(p,new THREE.PlaneGeometry(width,width/4.8),m,x,y,z);
}
export function star(p,r,c,x,y,z){const s=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,rad=i%2?r*.45:r;const px=Math.cos(a)*rad,py=Math.sin(a)*rad;i?s.lineTo(px,py):s.moveTo(px,py);}s.closePath();return mesh(p,geo(`star${r}`,()=>new THREE.ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:2,steps:1})),c,x,y,z);}

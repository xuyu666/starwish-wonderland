import {THREE,mat,mesh,box,sphere,cylinder,cone,torus,beam,group,register,textSign} from './kit.js';

const PI=Math.PI,TAU=PI*2;
const C={gold:'#efb846',ivory:'#fff1d2',pink:'#ff7197',rose:'#dd3b77',teal:'#2cc8bd',violet:'#9270de',blue:'#66c9f4',navy:'#44316b'};
const palette=[C.pink,C.teal,C.violet,C.blue,C.rose,C.gold];
const bulbGeometry=new THREE.SphereGeometry(.105,7,5);
const bulbMaterial=mat('#ffe9aa',.2,.24,'#ffb734');
const dummy=new THREE.Object3D();

function flatRing(parent,r,t,color,y=0){const o=torus(parent,r,t,color,0,y,0);o.rotation.x=PI/2;return o;}
function bulbs(parent,r,y,count=48,vertical=false,z=0){
  const o=new THREE.InstancedMesh(bulbGeometry,bulbMaterial,count);
  for(let i=0;i<count;i++){const a=i/count*TAU;dummy.position.set(Math.cos(a)*r,vertical?Math.sin(a)*r+y:y,vertical?z:Math.sin(a)*r);dummy.scale.setScalar(1);dummy.rotation.set(0,0,0);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);}
  parent.add(o);return o;
}
function tier(parent,r,color){
  cylinder(parent,r,r+.25,.35,C.ivory,0,.18,0,64);
  cylinder(parent,r-.12,r-.12,.25,color,0,.46,0,64);
  flatRing(parent,r-.06,.10,C.gold,.6);
}
function canopy(parent,r,y,colors){
  for(let i=0;i<12;i++)mesh(parent,new THREE.CylinderGeometry(.38,r,2.6,4,1,false,i*TAU/12,TAU/12),mat(colors[i%colors.length]),0,y,0);
  flatRing(parent,r,.16,C.gold,y-1.3);
  flatRing(parent,r-.12,.09,C.ivory,y-1.51);
  for(let i=0;i<12;i++){const a=i*TAU/12;const scallop=sphere(parent,.56,colors[i%colors.length],Math.cos(a)*r,y-1.42,Math.sin(a)*r,1.07,.62,.43);scallop.rotation.y=-a;}
  bulbs(parent,r,y-1.28,72);
  cone(parent,.53,1,C.gold,0,y+1.8,0);
  sphere(parent,.27,C.gold,0,y+2.4,0);
}
function pose(node,eye=[0,1,0],look=[0,1,6]){
  node.updateWorldMatrix(true,false);
  return {position:node.localToWorld(new THREE.Vector3(...eye)),target:node.localToWorld(new THREE.Vector3(...look))};
}
function horse(parent,color){
  sphere(parent,.68,C.ivory,0,0,0,1.38,.70,.53);
  sphere(parent,.43,C.ivory,-.62,-.02,0,1,.95,.85);
  const neck=sphere(parent,.34,C.ivory,.65,.48,0,.85,1.75,.84);neck.rotation.z=-.42;
  sphere(parent,.33,C.ivory,.95,.92,0,1.35,.82,.8);
  sphere(parent,.23,'#e8cbb6',1.27,.80,0,1.22,.72,.93);
  for(const z of [-.17,.17]){const ear=cone(parent,.11,.36,C.ivory,.83,1.25,z,8);ear.rotation.z=.12;}
  for(const z of [-.274,.274])sphere(parent,.047,C.navy,1.04,1.02,z);
  for(const x of [-.53,.48])for(const z of [-.24,.24]){
    const leg=cylinder(parent,.085,.065,.84,C.ivory,x,-.64,z,8);leg.rotation.z=x>0?-.23:.19;
    box(parent,.2,.15,.19,C.gold,x+(x>0?-.09:.08),-1.08,z);
  }
  for(let i=0;i<4;i++)sphere(parent,.17,color,.46+i*.085,.38+i*.21,0,.68,1.15,1.22);
  const tail=sphere(parent,.20,color,-1.02,-.22,0,.65,2.1,.75);tail.rotation.z=-.48;
  sphere(parent,.17,color,-1.17,-.60,0,.85,1.4,.85);
  sphere(parent,.48,color,-.05,.39,0,.95,.25,.87);
  flatRing(parent,.25,.055,C.gold,.53).scale.set(1.3,1,.9);
  beam(parent,[.79,.93,-.28],[1.22,.83,-.24],.025,C.rose);
  beam(parent,[.79,.93,.28],[1.22,.83,.24],.025,C.rose);
  beam(parent,[.8,.7,-.29],[.07,.35,-.39],.021,C.gold);
  return parent;
}

export function buildRides(world){
  const root=group(world),horseNodes=[],swingNodes=[],cabins=[],cups=[];
  const carousel=group(root,-24,0,4);
  tier(carousel,7.6,C.rose);
  const carouselRotor=group(carousel);
  cylinder(carouselRotor,6.95,7.1,.28,C.pink,0,.82,0,64);
  flatRing(carouselRotor,6.9,.11,C.gold,1);
  bulbs(carousel,7.34,.46,72);
  cylinder(carouselRotor,.65,.8,8.4,C.ivory,0,5.15,0);
  for(let i=0;i<6;i++){const a=i*TAU/6;beam(carouselRotor,[Math.cos(a)*.67,1,Math.sin(a)*.67],[Math.cos(a)*.67,9.1,Math.sin(a)*.67],.065,C.gold);}
  canopy(carouselRotor,7.7,9.4,[C.pink,C.ivory,C.teal,C.ivory]);
  for(let i=0;i<12;i++){
    const a=i*TAU/12,r=i%2?5.65:4.35;
    const station=group(carouselRotor,Math.cos(a)*r,0,Math.sin(a)*r);station.rotation.y=-a-PI/2;
    cylinder(station,.047,.047,7.4,C.gold,0,4.6,0,10);
    const h=horse(group(station,0,2.4,0),palette[i%6]);horseNodes.push(h);
    sphere(station,.13,C.gold,0,8.25,0);
  }
  textSign(carousel,'梦幻旋转木马',0,1.45,8.15,6.4);
  register('carousel','梦幻旋转木马','童话花园',carousel,{description:'十二匹装饰华丽的小马，在金色灯光下轻轻起伏。',height:12});

  const swing=group(root,24,0,5);tier(swing,7.1,C.violet);
  cylinder(swing,.93,1.2,12.6,C.teal,0,6.9,0);
  for(let i=0;i<7;i++)flatRing(swing,1.02,.10,i%2?C.gold:C.ivory,1.4+i*1.65);
  const swingRotor=group(swing,0,13.2,0);
  canopy(swingRotor,6.8,0,[C.violet,C.pink,C.ivory,C.teal]);
  cone(swingRotor,.7,1.4,C.pink,0,2.1,0);
  sphere(swingRotor,.31,C.gold,0,2.94,0);
  for(let i=0;i<12;i++){
    const a=i*TAU/12,pivot=group(swingRotor,Math.cos(a)*5.4,-1.3,Math.sin(a)*5.4);pivot.rotation.y=PI/2-a;
    const hanging=group(pivot);swingNodes.push(hanging);
    for(const x of [-.44,.44])beam(hanging,[x,0,0],[x,-7.7,0],.025,C.gold);
    const chair=group(hanging,0,-7.7,0);
    box(chair,1.3,.22,1.04,palette[i%6],0,0,0);
    box(chair,1.3,.95,.16,palette[i%6],0,.5,-.44);
    for(const x of [-.63,.63]){box(chair,.10,.42,.9,C.gold,x,.25,0);}
    beam(chair,[-.61,.48,.45],[.61,.48,.45],.055,C.ivory);
  }
  bulbs(swing,6.75,.45,64);textSign(swing,'云端飞椅',0,1.4,7.4,5);
  register('swing','云端飞椅','奇幻天空',swing,{description:'十二张双链飞椅围绕彩色伞顶，在空中画出轻盈的圆。',height:17});

  const wheel=group(root,34,0,-24);wheel.rotation.y=-.14;
  tier(wheel,7.8,C.teal);
  for(const z of [-2.7,2.7])for(const x of [-6,6]){beam(wheel,[x,.6,z],[0,17,0],.35,C.ivory);beam(wheel,[x,.6,z],[0,17,0],.12,C.gold);}
  cylinder(wheel,1.2,1.35,.65,C.pink,0,17,0).rotation.x=PI/2;
  const wheelRotor=group(wheel,0,17,0);
  for(const z of [-.37,.37]){torus(wheelRotor,12.4,.18,C.gold,0,0,z);torus(wheelRotor,11.95,.075,C.ivory,0,0,z);bulbs(wheelRotor,12.4,0,96,true,z);}
  sphere(wheelRotor,.9,C.gold,0,0,.6,1,1,.4);
  for(let i=0;i<12;i++){
    const a=i*TAU/12;
    beam(wheelRotor,[0,0,0],[Math.cos(a)*12.4,Math.sin(a)*12.4,0],.095,i%2?C.pink:C.teal);
    const cabin=group(wheelRotor,Math.cos(a)*12.4,Math.sin(a)*12.4,.45);cabins.push(cabin);
    const body=group(cabin,0,-1.28,.1);
    beam(body,[0,.1,0],[0,1.25,0],.075,C.gold);
    cylinder(body,1.02,.83,.78,palette[i%6],0,-.72,0,12);
    cylinder(body,1.16,1.16,.15,C.gold,0,-.28,0,12);
    cylinder(body,1.02,1.03,.12,C.ivory,0,-1.14,0,12);
    for(const x of [-.73,.73])for(const z of [-.54,.54])beam(body,[x,-.26,z],[x,.87,z],.045,C.gold);
    cone(body,1.22,.57,palette[i%6],0,1.06,0,12);
    sphere(body,.12,C.gold,0,1.43,0);
  }
  textSign(wheel,'星愿摩天轮',0,2.1,4.2,6.5);
  register('wheel','星愿摩天轮','奇幻天空',wheel,{description:'十二个始终保持水平的彩色轿厢，将整个童话乐园尽收眼底。',height:31});

  const tea=group(root,28,0,30);tier(tea,9,C.teal);bulbs(tea,8.85,.53,84);
  const teaRotor=group(tea,0,.65,0);cylinder(teaRotor,8.45,8.45,.15,'#f9dbe4',0,0,0,64);
  for(let i=0;i<6;i++){const a=i*TAU/6;beam(teaRotor,[Math.cos(a)*2.7,.1,Math.sin(a)*2.7],[Math.cos(a)*8.2,.1,Math.sin(a)*8.2],.065,C.gold);}
  const rocket=group(tea,0,.8,0);
  cylinder(rocket,1.06,1.28,4.2,C.ivory,0,4.1,0);
  cone(rocket,1.06,2.6,C.pink,0,7.5,0);
  cylinder(rocket,1.35,1.15,.45,C.gold,0,2.05,0);
  sphere(rocket,.56,C.blue,0,4.9,1.0,1,1,.25);
  const windowRim=torus(rocket,.58,.10,C.gold,0,4.9,1.08);windowRim.rotation.set(0,0,0);
  for(let i=0;i<3;i++){const a=i*TAU/3,pod=group(rocket,Math.cos(a)*1.12,1.8,Math.sin(a)*1.12);pod.rotation.y=-a;
    cone(pod,.56,2.3,C.teal,0,.2,0,12);sphere(pod,.29,C.gold,0,-1.02,0,1,1.4,1);
  }
  const cupGeometry=new THREE.LatheGeometry([new THREE.Vector2(.55,0),new THREE.Vector2(.83,.13),new THREE.Vector2(1.1,.85),new THREE.Vector2(1.08,.95),new THREE.Vector2(.98,.95),new THREE.Vector2(.93,.75),new THREE.Vector2(.65,.17),new THREE.Vector2(.50,.14)],24);
  for(let i=0;i<6;i++){
    const a=i*TAU/6,cup=group(teaRotor,Math.cos(a)*5.8,.25,Math.sin(a)*5.8);cups.push(cup);
    cylinder(cup,1.59,1.35,.13,C.ivory,0,-.02,0,32);flatRing(cup,1.4,.055,C.gold,.06);
    mesh(cup,cupGeometry,mat(palette[i]),0,.05,0);
    flatRing(cup,1.07,.065,C.gold,.98);
    const handle=torus(cup,.41,.12,palette[i],1.15,.56,0);handle.scale.x=.8;
    cylinder(cup,.32,.32,.10,C.gold,0,.61,0,20);cylinder(cup,.055,.055,.48,C.gold,0,.36,0,10);
    for(let j=0;j<6;j++){const b=j*TAU/6;sphere(cup,.065,C.ivory,Math.cos(b)*.98,.64,Math.sin(b)*.98);}
  }
  textSign(tea,'星际花园 · 旋转茶杯',0,1.5,9.6,7.4);
  register('teacups','星际花园旋转茶杯','星际花园',tea,{description:'围绕复古火箭旋转的六只彩色茶杯，每只茶杯都拥有自己的旋转节奏。',height:10});

  const fountain=group(root,0,0,8);tier(fountain,5.3,C.teal);
  cylinder(fountain,4.95,4.95,.2,mat('#80e8ee',.2,.15),0,.64,0,64);
  flatRing(fountain,5.05,.20,C.ivory,.76);flatRing(fountain,5.05,.055,C.gold,.95);
  cylinder(fountain,.55,.8,2.25,C.ivory,0,1.8,0);cylinder(fountain,2,1.7,.28,C.ivory,0,2.9,0,48);
  flatRing(fountain,1.9,.12,C.gold,3.08);cylinder(fountain,.24,.35,1.8,C.gold,0,3.9,0);
  sphere(fountain,.40,C.gold,0,4.9,0);sphere(fountain,.20,C.blue,0,5.3,0);
  const waterMaterial=new THREE.MeshStandardMaterial({color:'#a9f9ff',transparent:true,opacity:.64,roughness:.15,metalness:.15,emissive:'#126a80',emissiveIntensity:.15});
  for(let i=0;i<12;i++){
    const a=i*TAU/12,points=[];
    for(let j=0;j<=16;j++){const u=j/16,r=.35+u*3.8;points.push(new THREE.Vector3(Math.cos(a)*r,3.05+3.2*u-5.4*u*u,Math.sin(a)*r));}
    mesh(fountain,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.045,5,false),waterMaterial);
  }
  const drops=new THREE.InstancedMesh(new THREE.SphereGeometry(.075,6,4),waterMaterial,96);fountain.add(drops);
  register('fountain','星光许愿喷泉','中央花园',fountain,{description:'金色三层喷泉与十二道晶莹水弧，是花园中心的许愿之地。'});

  function update(t,dt){
    carouselRotor.rotation.y=t*.19;
    horseNodes.forEach((h,i)=>{h.position.y=2.5+Math.sin(t*1.9+i*TAU/12)*.43;});
    swingRotor.rotation.y=t*.31;
    swingNodes.forEach((h,i)=>{h.rotation.x=-.35-Math.sin(t*.9+i*.3)*.045;});
    wheelRotor.rotation.z=t*.075;
    cabins.forEach(cabin=>{cabin.rotation.z=-wheelRotor.rotation.z;});
    teaRotor.rotation.y=t*.14;
    cups.forEach((cup,i)=>{cup.rotation.y=t*(i%2?.57:-.49)+i;});
    for(let i=0;i<96;i++){
      const a=Math.floor(i/8)*TAU/12,u=((i%8)/8+t*.47)%1,r=.35+u*3.8;
      dummy.position.set(Math.cos(a)*r,3.05+3.2*u-5.4*u*u,Math.sin(a)*r);dummy.rotation.set(0,0,0);dummy.scale.set(.8,1.5,.8);dummy.updateMatrix();drops.setMatrixAt(i,dummy.matrix);
    }
    drops.instanceMatrix.needsUpdate=true;
  }
  update(0,0);
  return {update,seats:{
    carousel:()=>pose(horseNodes[0],[0,1.3,0],[4,1.05,0]),
    swing:()=>pose(swingNodes[0],[0,-6.7,.08],[0,-6.5,7]),
    wheel:()=>pose(cabins[0],[0,-.55,1.0],[0,-1.2,9]),
    teacups:()=>pose(cups[0],[0,1.1,0],[0,1.1,6])
  }};
}

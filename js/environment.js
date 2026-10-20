import {THREE,mat,mesh,box,sphere,cylinder,cone,torus,beam,group,register,star} from './kit.js';
import {createSea,createDistantScenery} from './backdrop.js';
let seed=43;
function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
const gold=mat(0xffc55d,.65,.25),green=0x239d68;
export function buildEnvironment(world){
  const env=group(world), clouds=[],balloons=[],guests=[], lamps=[];
  const sea=createSea(env),distant=createDistantScenery(env);
  cylinder(env,65,63,2,0xdeaa74,0,-1.2,0,128);
  const grass=mat(0x269f4d,0,.9);
  const grassCanvas=document.createElement('canvas');grassCanvas.width=256;grassCanvas.height=256;const gc=grassCanvas.getContext('2d');gc.fillStyle='#ffffff';gc.fillRect(0,0,256,256);for(let i=0;i<6500;i++){gc.fillStyle=i%2?'#c2d9ad':'#e3efd1';gc.fillRect(rand()*256,rand()*256,1,2);}const grassTexture=new THREE.CanvasTexture(grassCanvas);grassTexture.wrapS=grassTexture.wrapT=THREE.RepeatWrapping;grassTexture.repeat.set(38,38);grass.map=grassTexture;
  cylinder(env,64.8,65,.45,grass,0,-.03,0,128);
  const shore=torus(env,65,.4,0xffdfb0,0,-.8,0);shore.rotation.x=Math.PI/2;
  // The pink promenades are bordered by inset cream stone.
  const pathMat=mat(0xf7b7b3,0,.85), borderMat=mat(0xffe2b3,0,.75);
  const paving=document.createElement('canvas');paving.width=128;paving.height=128;const pc=paving.getContext('2d');pc.fillStyle='#fff3ec';pc.fillRect(0,0,128,128);pc.strokeStyle='#d4bab3';pc.lineWidth=2;for(let i=0;i<4;i++){pc.strokeRect(i%2?0:-16,i*32,64,32);pc.strokeRect(i%2?64:48,i*32,64,32);}const pavingTexture=new THREE.CanvasTexture(paving);pavingTexture.wrapS=pavingTexture.wrapT=THREE.RepeatWrapping;pavingTexture.repeat.set(3,12);pathMat.map=pavingTexture;
  function road(a,b,w=5){const d=new THREE.Vector3(b[0]-a[0],0,b[1]-a[1]),len=d.length();const r=box(env,w+.6,.12,len,borderMat,(a[0]+b[0])/2,.23,(a[1]+b[1])/2);r.rotation.y=Math.atan2(d.x,d.z);const inner=box(env,w,.14,len,pathMat,r.position.x,.25,r.position.z);inner.rotation.y=r.rotation.y;}
  road([0,58],[0,-18],7);road([-48,4],[48,4],5);road([-30,29],[28,30],5);road([-30,29],[-24,4],4);road([28,30],[24,5],4);road([-24,4],[-35,-25],4);road([24,5],[34,-24],4);road([-35,-25],[34,-24],4);
  for(const [x,z,r]of [[0,8,12],[-24,4,10],[24,5,10],[28,30,10]]){
    cylinder(env,r+.35,r+.35,.12,borderMat,x,.3,z,64);cylinder(env,r,r,.13,pathMat,x,.33,z,64);
    const ring=torus(env,r-.5,.08,gold,x,.42,z);ring.rotation.x=Math.PI/2;
  }
  // Repeated foliage, petals and lamps are instanced to retain detail at low draw cost.
  const instances={trunks:[],leaves:[],flowers:[],centers:[],posts:[],bulbs:[]};
  function add(kind,x,y,z,sx,sy,sz,color){instances[kind].push({x,y,z,sx,sy,sz,color});}
  const reservedStage=(x,z)=>(x>-58&&x<-34&&z>-17&&z<3)||(x>-52&&x<-40&&z>=3&&z<21);
  let flowerBeds=0;
  function tree(x,z,scale=1){
    if(reservedStage(x,z))return;
    add('trunks',x,1.4*scale,z,.24*scale,2.8*scale,.24*scale,0x9c5e43);
    const c=[0x1c9b67,0x33b66c,0x07866a][Math.floor(rand()*3)];
    add('leaves',x,3.8*scale,z,1.65*scale,2.1*scale,1.5*scale,c);
    add('leaves',x+.8*scale,3.5*scale,z+.3*scale,1.2*scale,1.5*scale,1.2*scale,c);
  }
  function flowers(x,z,r=1.2){
    if(reservedStage(x,z))return;flowerBeds++;
    cylinder(env,r+.2,r+.2,.28,0xffdeb0,x,.34,z,16);
    cylinder(env,r,r,.3,0x087f62,x,.37,z,16);
    for(let k=0;k<7;k++){const a=rand()*Math.PI*2,d=rand()*r*.85,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,c=[0xff4e83,0xffc539,0xad55df,0xff7440][k%4];for(let j=0;j<5;j++){const an=j*Math.PI*2/5;add('flowers',px+Math.cos(an)*.15,.75,pz+Math.sin(an)*.15,.16,.1,.16,c);}add('centers',px,.81,pz,.09,.09,.09,0xffe651);}
  }
  for(let i=0;i<62;i++){const a=i/62*Math.PI*2,r=57+rand()*4;tree(Math.cos(a)*r,Math.sin(a)*r,.7+rand()*.5);if(i%2===0)flowers(Math.cos(a)*(r-3),Math.sin(a)*(r-3),1.1);}
  for(const [x,z]of [[-13,22],[13,22],[-12,-6],[12,-6],[-45,12],[42,13],[-44,-10],[45,-9],[-15,36],[15,36]]){tree(x,z,.9);flowers(x+2,z+1,1.4);}
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2;flowers(Math.cos(a)*16,8+Math.sin(a)*16,.9);}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const x=Math.cos(a)*9,z=8+Math.sin(a)*9;flowers(x,z,.85);const line=box(env,.12,.06,2.1,gold,Math.cos(a)*7.5,.43,8+Math.sin(a)*7.5);line.rotation.y=-a+Math.PI/2;}
  // Small garden islands populate the space between the main promenades.
  const gardenSpots=[[-47,28],[-43,40],[-15,47],[15,47],[46,32],[46,16],[-46,17],[-48,-28],[-20,-39],[0,-44],[20,-44],[47,-26],[-13,-33],[14,-34]];
  gardenSpots.forEach(([x,z],i)=>{if(reservedStage(x,z))return;cylinder(env,2.7,2.9,.24,0xffdfad,x,.25,z,32);cylinder(env,2.5,2.5,.25,0x128a59,x,.3,z,32);tree(x,z,.85);flowers(x+1.7,z+1.1,.85);flowers(x-1.5,z-.8,.7);});
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=Math.cos(a)*20,z=8+Math.sin(a)*20;const bouquet=group(env,x,0,z);for(let j=0;j<4;j++){const dx=(j%2-.5)*.8,dy=Math.floor(j/2)*.7;beam(bouquet,[0,.3,0],[dx,4+dy,0],.012,0xf6d49a);sphere(bouquet,.48,[0xff4977,0xffc538,0x9854d8,0x24c7c5][j],dx,4.2+dy,0,1,1.2,1);}register('bouquet-'+i,'彩色气球束','花园',bouquet,{balloons:4});}
  for(let i=0;i<3;i++){const g=group(env,-40+i*7,.4,38);cylinder(g,.07,.07,3.3,gold,0,1.65,0,12);cone(g,2.3,.85,[0xff5c99,0x30c7bd,0x9f69d1][i],0,3.5,0,32);cylinder(g,1.15,1.15,.12,0xffedc1,0,1.4,0,32);for(let j=0;j<3;j++){const a=j*Math.PI*2/3;cylinder(g,.5,.5,.12,0xffd09e,Math.cos(a)*1.7,.75,Math.sin(a)*1.7,16);beam(g,[Math.cos(a)*1.7,0,Math.sin(a)*1.7],[Math.cos(a)*1.7,.7,Math.sin(a)*1.7],.08,gold);}register('parasol-'+i,'甜品露台桌伞','糖果小镇',g);}
  const planet=group(env,28,10.9,30);sphere(planet,.65,mat(0xffa432,.3,.24),0,0,0);for(let i=0;i<3;i++){const r=torus(planet,2.4+i*.35,.065,gold,0,0,0);r.rotation.set(.6+i*.5,i*.8,.4);}register('planet-rings','三重星环','星际花园',planet,{rings:3});
  for(let i=0;i<40;i++){
    let x,z;if(i<20){x=i%2?5:-5;z=-10+Math.floor(i/2)*6;}else{x=-48+(i-20)*5;z=i%2?-1:9;}
    add('posts',x,1.9,z,.11,3.2,.11,0xc18b43);add('bulbs',x,3.6,z,.34,.4,.34,0xffedb9);lamps.push({x,z});
    if(i%4===0){const b=group(env,x+(x>0?1.7:-1.7),.3,z);for(let j=0;j<4;j++)box(b,1.9,.12,.15,0xa36c47,0,.65,j*.2);box(b,1.9,.58,.12,0xa36c47,0,1.05,-.15);for(const dx of [-.7,.7])box(b,.12,.6,.65,gold,dx,.3,.23);}
  }
  const dummy=new THREE.Object3D();
  for(const [kind,list]of Object.entries(instances)){
    const geo=kind==='trunks'||kind==='posts'?new THREE.CylinderGeometry(1,1,1,8):new THREE.SphereGeometry(1,10,8);
    const material=kind==='bulbs'?new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffbf57,emissiveIntensity:.6,roughness:.35}):new THREE.MeshStandardMaterial({roughness:kind==='posts'?.3:.7,metalness:kind==='posts'?.5:0});
    const batch=new THREE.InstancedMesh(geo,material,list.length);list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.sx,v.sy,v.sz);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);batch.setColorAt(i,new THREE.Color(v.color));});batch.castShadow=kind==='leaves';batch.receiveShadow=true;env.add(batch);if(kind==='bulbs')env.userData.bulbMaterial=material;
    register('landscape-'+kind,kind,'全园',batch,{count:list.length,instanced:true});
  }
  for(let i=0;i<12;i++){const angle=i/12*Math.PI*2;const g=group(env,Math.cos(angle)*125,54+rand()*12,Math.sin(angle)*125);g.scale.setScalar(.65);for(let j=0;j<4;j++){const m=sphere(g,3+rand()*3,mat(0xfff3e8,0,1),j*3,rand()*2,0,1,.6,.7);m.castShadow=false;}g.userData.cloudAngle=angle;g.userData.cloudHeight=g.position.y;clouds.push(g);}
  for(let i=0;i<3;i++){
    const g=group(env,[-42,42,7][i],33+i*6,[-44,-8,-55][i]);
    for(let j=0;j<8;j++){const geo=new THREE.SphereGeometry(3.3,12,20,j*Math.PI/4,Math.PI/4);const m=mesh(g,geo,mat(j%2?[0xff5b7d,0x37c8c0,0xad68de][i]:0xffdf8b));m.scale.y=1.25;}
    cylinder(g,.6,1.4,1.8,0xffcc75,0,-4,0,16);box(g,1.4,1,1.2,0x95603e,0,-6.1,0);for(const x of [-.55,.55])beam(g,[x,-4.6,0],[x,-5.7,0],.035,gold);balloons.push(g);register('balloon-'+i,'热气球','天空',g);
  }
  for(let i=0;i<20;i++){
    const g=group(env,0,0,0),color=[0xff5f83,0x8156d9,0xffbd30,0x29b9af][i%4];
    sphere(g,.24,0xeebb95,0,1.5,0);cylinder(g,.22,.29,.65,color,0,1,0,10);const legs=[];for(const dx of [-.12,.12]){const leg=box(g,.16,.5,.19,0x3b4269,dx,.44,0);legs.push(leg);}sphere(g,.25,0x603c36,0,1.65,-.025,1,.5,1);guests.push({g,legs,a:rand()*Math.PI*2,r:12+rand()*5,speed:.04+rand()*.025});
  }
  register('island','乐园岛屿','环境',env,{radius:65,trees:instances.trunks.length,flowerBeds,guests:20,lamps:40});
  const avatar=group(world,0,0,42);sphere(avatar,.32,0xf4c99e,0,1.82,0);sphere(avatar,.33,0x493251,0,2,-.05,1,.45,1);cylinder(avatar,.31,.4,.8,0xf55e83,0,1.2,0,16);const avatarLegs=[];for(const dx of [-.2,.2])avatarLegs.push(box(avatar,.23,.7,.27,0x36467d,dx,.43,0));box(avatar,.65,.7,.23,0xffca58,0,1.25,.34);
  return {avatar,update(t,dt,moving=0){sea.material.userData.waterUniforms.time.value=t;distant.update(t);clouds.forEach((g,i)=>{const a=g.userData.cloudAngle+t*.0014*(i%2?1:-1);g.position.set(Math.cos(a)*125,g.userData.cloudHeight+Math.sin(t*.025+i)*1.4,Math.sin(a)*125);});balloons.forEach((g,i)=>g.position.y=33+i*6+Math.sin(t*.35+i)*1.2);guests.forEach(v=>{const a=v.a+t*v.speed;v.g.position.set(Math.cos(a)*v.r,0,8+Math.sin(a)*v.r);v.g.rotation.y=-a;v.legs.forEach((l,j)=>l.rotation.x=Math.sin(t*5+j*Math.PI)*.35);});avatarLegs.forEach((l,j)=>l.rotation.x=Math.sin(t*9+j*Math.PI)*.5*moving);},setNight(n){env.userData.bulbMaterial.emissiveIntensity=.5+n*2;}};
}

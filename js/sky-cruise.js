import {THREE,mat,mesh,box,sphere,cylinder,torus,beam,group,register,star} from './kit.js';

const PI=Math.PI, TAU=PI*2, DURATION=90, RAMP=8;
const C={coral:'#f46048',crimson:'#b82d45',gold:'#ffc34f',ivory:'#fff1d2',teal:'#138c89',ink:'#244851'};
const ease=u=>{u=THREE.MathUtils.clamp(u,0,1);return u*u*u*(u*(u*6-15)+10);};
function ring(p,r,t,c,y){const o=torus(p,r,t,c,0,y,0);o.rotation.x=PI/2;return o;}
function wing(p,side){
  const s=new THREE.Shape();s.moveTo(side*2.3,-.8);s.lineTo(side*4.4,-2.5);s.quadraticCurveTo(side*4.7,-3.2,side*3.8,-3.1);s.lineTo(side*1.8,-2.6);s.closePath();
  const m=mesh(p,new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:true,bevelSize:.1,bevelThickness:.1,bevelSegments:2,steps:1}),mat(C.coral,.4,.3),0,.16,0);m.rotation.x=PI/2;
  beam(p,[side*2.5,.28,1],[side*4.3,.28,2.5],.065,C.gold);
}
function seat(p,x,z){
  const s=group(p,x,.4,z);
  box(s,.96,.25,.91,mat(C.teal,.15,.35),0,.25,0);
  const back=box(s,.98,.95,.23,C.crimson,0,.78,-.38);back.rotation.x=-.1;
  box(s,.75,.6,.08,C.coral,0,.81,-.23);
  for(const side of [-1,1]){beam(s,[side*.54,.3,-.2],[side*.54,.76,.45],.065,C.gold);sphere(s,.11,C.ivory,side*.54,.76,.45);}
  beam(s,[-.5,.75,.48],[.5,.75,.48],.075,C.ivory);
  box(s,.27,.14,.15,C.gold,0,.75,.49);
}
function engine(p,x){
  const pod=group(p,x,-.05,-1.65);
  const casing=cylinder(pod,.81,.92,1.45,mat(C.crimson,.5,.29));casing.rotation.x=PI/2;
  for(const z of [-.75,.75])torus(pod,.78,.115,mat(C.gold,.65,.25),0,0,z);
  torus(pod,.61,.055,C.ivory,0,0,.79);
  const rotor=group(pod,0,0,.8);
  sphere(rotor,.22,C.gold,0,0,0,1,1,.65);
  for(let i=0;i<7;i++){const a=i*TAU/7,b=box(rotor,.12,.48,.045,C.teal,Math.sin(a)*.4,Math.cos(a)*.4,0);b.rotation.z=-a-.25;}
  const glow=mat(C.teal,.15,.2,'#38e9cf').clone();
  sphere(pod,.57,glow,0,0,-.78,1,1,.25);
  const exhaust=sphere(pod,.46,glow,0,0,-1.12,1,1,1.2);exhaust.castShadow=false;
  return {rotor,glow,exhaust};
}
function buildDock(world){
  const dock=group(world,25,0,45);dock.name='sky-cruise-dock';
  cylinder(dock,4.9,5.05,.38,C.ivory,0,.4,0,64);
  cylinder(dock,4.72,4.72,.14,C.teal,0,.66,0,64);
  ring(dock,4.63,.10,C.gold,.77);ring(dock,3.9,.04,C.ivory,.75);
  for(let i=0;i<28;i++){const a=i*TAU/28;sphere(dock,.09,mat(C.gold,.2,.3,'#ffb72f'),Math.cos(a)*4.78,.71,Math.sin(a)*4.78);}
  for(let i=0;i<13;i++){const a=PI*.2+i*PI*1.6/12,x=Math.sin(a)*4.8,z=-Math.cos(a)*4.8;
    if(z>3.7)continue;
    cylinder(dock,.065,.09,.75,C.gold,x,1.1,z,8);sphere(dock,.12,C.ivory,x,1.52,z);
  }
  for(let i=0;i<3;i++)box(dock,2.1,.19,1.05,i%2?C.coral:C.ivory,0,.58-i*.18,4.3+i*.57);
  const badge=group(dock,3.7,1.3,3.0);badge.rotation.y=.3;
  box(badge,1.3,.92,.16,C.crimson);star(badge,.29,C.gold,0,0,.1);
  register('sky-dock','星航观景艇 · 登船码头','星际花园',dock,{description:'环形灯光码头与珊瑚色登船阶梯。',radius:5,height:1.7,safeExit:[25,0,54]});
  return dock;
}
function buildCraft(world){
  const hull=group(world);hull.name='sky-cruise-craft';
  sphere(hull,1,mat(C.crimson,.45,.28),0,-.48,0,3.05,.82,4.25);
  sphere(hull,1,mat(C.coral,.35,.32),0,-.12,.3,2.96,.56,4.05);
  const deck=cylinder(hull,2.66,2.72,.17,C.ivory,0,.34,.15,64);deck.scale.z=1.4;
  const trim=ring(hull,2.81,.095,C.gold,.28);trim.scale.z=1.42;
  const inner=ring(hull,2.65,.045,C.teal,.44);inner.scale.z=1.4;
  for(const side of [-1,1]){
    wing(hull,side);
    beam(hull,[side*2.7,.55,-2.4],[side*2.7,.6,2.3],.085,C.gold);
    for(let j=0;j<5;j++)box(hull,.035,.31,.42,C.ivory,side*2.94,-.25,-2+j*1.0);
    const fin=box(hull,.17,1.05,1.7,C.teal,side*2.52,.59,-2.5);fin.rotation.z=side*-.18;fin.rotation.x=-.2;
    beam(hull,[side*2.5,1.12,-3.15],[side*2.5,1.12,-1.8],.055,C.gold);
    seat(hull,side*1.35,-1.45);
  }
  seat(hull,0,3.2);
  const console=group(hull,0,.72,4.05);console.rotation.x=.23;
  box(console,1.26,.4,.63,C.teal);
  const screen=box(console,.61,.03,.35,mat('#17484c',.1,.2,'#1f887d'),-.2,.23,0);screen.rotation.x=-.1;
  for(let i=0;i<4;i++)sphere(console,.045,i%2?C.gold:C.coral,.28+i*.13,.23,.03);
  for(const x of [-.36,.18]){const dial=torus(console,.08,.02,C.gold,x,.24,.17);dial.rotation.x=PI/2;}
  const glass=new THREE.MeshPhysicalMaterial({color:'#a9ece1',transparent:true,opacity:.21,roughness:.12,metalness:.05,side:THREE.DoubleSide,depthWrite:false});
  const wind=mesh(hull,new THREE.CylinderGeometry(2.23,2.42,.9,28,1,true,-.69,1.38),glass,0,1.55,1.05);
  wind.castShadow=false;wind.name='sky-cruise-windscreen';
  const edge=new THREE.CatmullRomCurve3(Array.from({length:29},(_,i)=>{const a=-.69+i*1.38/28;return new THREE.Vector3(Math.sin(a)*2.23,2.0,1.05+Math.cos(a)*2.23);}));
  mesh(hull,new THREE.TubeGeometry(edge,28,.045,6,false),mat(C.gold,.6,.25)).name='sky-cruise-sightline-rim';
  for(const x of [-1.55,1.55])beam(hull,[x,.52,2.89],[x,2.0,2.76],.045,C.gold);
  star(hull,.37,C.gold,0,-.06,4.16);
  for(const x of [-1.22,1.22])sphere(hull,.12,mat(C.ivory,.1,.2,'#ffd38b'),x,.1,3.81,1,.6,.6);
  for(const x of [-1.4,1.4]){const skid=box(hull,.15,.12,2.0,C.teal,x,-1.23,-.2);beam(hull,[x,-.7,-.8],[x,-1.18,-.8],.09,C.gold);beam(hull,[x,-.7,.5],[x,-1.18,.5],.09,C.gold);skid.rotation.x=.03;}
  const engines=[engine(hull,-3.13),engine(hull,3.13)];
  register('sky-cruise','星航观景艇','奇幻天空',hull,{description:'珊瑚红船体、金色包边与开放座舱，90 秒环园巡航后平稳返航。',duration:DURATION,seats:3,dock:[25,3.2,45],safeExit:[25,0,54],route:'全园四象限及城堡上空',minCruiseAltitude:56});
  return {hull,engines};
}

export function buildSkyCruise(world){
  const dock=buildDock(world),{hull,engines}=buildCraft(world);
  const route=new THREE.CatmullRomCurve3([[25,56.2,45],[48,61.2,24],[48,64.2,-18],[20,68.4,-31],[0,69.4,-24],[-25,68.4,-27],[-50,62.2,-17],[-46,60.2,22],[-13,58.2,48]].map(p=>new THREE.Vector3(...p)),true,'catmullrom',.38);
  let elapsed=0,running=false;
  const point=new THREE.Vector3(),ahead=new THREE.Vector3(),behind=new THREE.Vector3();
  const eye=new THREE.Vector3(0,2.4,3.6),gaze=new THREE.Vector3(0,2.4,17.6),up=new THREE.Vector3(0,1,0);
  function place(){
    const u=ease(elapsed/DURATION),lift=ease(elapsed/RAMP)*ease((DURATION-elapsed)/RAMP);
    route.getPointAt(u===1?0:u,point);hull.position.set(point.x,3.2+(point.y-3.2)*lift,point.z);
    hull.rotation.set(0,Math.atan2(-point.x,-point.z),0);
    route.getTangentAt((u+.012)%1,ahead);route.getTangentAt((u+.988)%1,behind);
    const turn=behind.x*ahead.z-behind.z*ahead.x;
    hull.rotateZ(THREE.MathUtils.clamp(turn*1.8,-.04,.04)*lift);
    const power=running&&elapsed<DURATION?Math.sin(PI*elapsed/DURATION)**.3:0;
    engines.forEach(({rotor,glow,exhaust},i)=>{rotor.rotation.z=elapsed*7+i*.3;glow.emissiveIntensity=.35+power*.8;exhaust.scale.z=1.2+power*(.8+Math.sin(elapsed*4+i)*.08);});
    hull.updateWorldMatrix(true,true);
  }
  function stop(){running=false;elapsed=0;place();}
  function start(){if(running)return;running=true;elapsed=0;place();}
  function update(t,dt){if(!running||!Number.isFinite(dt)||dt<=0)return;elapsed=Math.min(DURATION,elapsed+dt);place();}
  function pose(){hull.updateWorldMatrix(true,false);return {position:hull.localToWorld(eye.clone()),target:hull.localToWorld(gaze.clone()),up:up.clone()};}
  stop();
  return {update,start,stop,seats:{'sky-cruise':pose},get active(){return running;},get phase(){return !running?'idle':elapsed<RAMP?'launch':elapsed<DURATION-RAMP?'cruise':elapsed<DURATION?'landing':'complete';},get progress(){return elapsed/DURATION;},get position(){return hull.position.clone();},get dock(){return dock.position.clone();}};
}

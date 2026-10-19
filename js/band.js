import {THREE,group,mesh,box,sphere,cylinder,beam,torus,mat,register} from './kit.js';
import {updateChoreography} from './band-choreography.js';

const C={skin:'#f4c9ad',hair:'#4b2c24',dark:'#201a25',silver:mat('#d7e2eb',.8,.23),white:'#fff5df',gold:mat('#dca34c',.82,.27)};
const sparkle=mat('#fff1d4',.8,.18), eye=mat('#2e211e',.05,.2);
const lens=new THREE.MeshStandardMaterial({color:'#dcebf8',transparent:true,opacity:.12,roughness:.08,metalness:.05});
const shapeCache=new Map();
function oval(p,x,y,z,rx,ry,rz,c){return sphere(p,1,c,x,y,z,rx,ry,rz);}
function path(p,points,r,c){for(let i=1;i<points.length;i++)beam(p,points[i-1],points[i],r,c);}
function glitter(p,color,w,h,z,count=45){
  for(let i=0;i<count;i++){const x=(Math.sin(i*127.1)*.5)*w,y=(Math.cos(i*73.7)*.5)*h;const s=box(p,.032,.032,.018,i%4?color:sparkle,x,y,z);s.rotation.z=i*.7;}
}
function glasses(p,round){
  for(const s of [-1,1]){
    const x=s*.235;
    if(round){const frame=torus(p,.205,.018,'#5b3b32',x,.08,.488);frame.scale.y=.88;}
    else path(p,[[x-.19,.22,.49],[x+.19,.22,.49],[x+.18,-.08,.49],[x-.18,-.08,.49],[x-.19,.22,.49]],.021,C.dark);
    oval(p,x,.075,.482,.185,.157,.015,lens);
    path(p,[[s*.43,.15,.48],[s*.53,.13,.2],[s*.5,.02,.04]],.018,round?'#7c5d41':C.dark);
  }
  beam(p,[-.05,.1,.51],[.05,.1,.51],.018,C.dark);
}
function face(p,{female,long,bob,singing}){
  const h=group(p,0,3.55,0),hair=female?C.hair:'#282126';
  oval(h,0,.02,-.1,.56,.66,.45,hair);
  if(long)for(let i=0;i<9;i++){const a=(i-4)*.19;oval(h,Math.sin(a)*.62,-.58,-.22,.19,.9,.25,i%2?'#57372a':hair);}
  if(bob)for(let s=-1;s<=1;s+=2)oval(h,s*.43,-.2,-.07,.2,.54,.33,hair);
  oval(h,0,-.04,.02,.49,.6,.43,C.skin);
  for(const s of [-1,1]){
    oval(h,s*.49,-.02,.025,.1,.17,.095,C.skin);oval(h,s*.51,-.02,.09,.035,.09,.022,'#d28d78');
    oval(h,s*.235,.09,.397,.165,.14,.078,'#fff9ed');
    oval(h,s*.229,.082,.463,.075,.093,.035,eye);oval(h,s*.222,.079,.49,.036,.063,.018,'#17111a');
    oval(h,s*.25,.12,.505,.022,.026,.009,'#ffffff');
    beam(h,[s*.235-.16,.19,.431],[s*.235+.14,.2,.431],.018,hair);
    const brow=oval(h,s*.235,.3,.395,.155,.028,.025,hair);brow.rotation.z=-s*.08;
    oval(h,s*.3,-.18,.394,.112,.047,.012,'#eeaa9d');
    if(female){torus(h,.046,.012,C.silver,s*.49,-.18,.06);}
  }
  oval(h,0,-.055,.43,.066,.12,.09,C.skin);oval(h,0,-.13,.48,.092,.055,.052,'#e9b292');
  const mouth=group(h,0,-.31,.414);
  oval(mouth,0,0,0,.16,singing?.095:.035,.022,'#a74751');
  if(singing){oval(mouth,0,.035,.024,.117,.026,.009,'#fff8e8');oval(mouth,0,-.046,.024,.08,.023,.009,'#e9878f');}
  else path(mouth,[[-.15,.022,.012],[-.07,-.02,.03],[.06,-.025,.03],[.15,.018,.012]],.018,'#d9767b');
  glasses(h,female);
  for(let i=0;i<(female?8:13);i++){
    const x=(i/(female?7:12)-.5)*.91;
    const lock=oval(h,x,.49-Math.abs(x)*.35,.2,.11,female?.24:.2,.22,i%3?'#38251f':'#63402c');lock.rotation.z=-.4+x*1.1;
  }
  if(!female)for(let i=0;i<7;i++){const lock=oval(h,(i-3)*.12,.62+Math.sin(i*2)*.055,-.05,.09,.2,.12,hair);lock.rotation.z=(i-3)*-.18;}
  if(long)for(const s of [-1,1]){const lock=oval(h,s*.44,-.48,.2,.13,.69,.15,hair);lock.rotation.z=s*.09;}
  return {head:h,mouth};
}
function hand(p,x,y,z,open=false){
  const h=group(p,x,y,z);oval(h,0,0,0,.12,.16,.075,C.skin);
  for(let i=0;i<4;i++){
    const finger=group(h,(i-1.5)*.049,-.11,.025);finger.rotation.x=open?-.3:-.9;
    beam(finger,[0,0,0],[0,-.12,0],.025,C.skin);beam(finger,[0,-.12,0],[0,-.17,.045],.023,C.skin);
  }
  beam(h,[-.1,.03,.02],[-.17,-.05,.09],.039,C.skin);return h;
}
function arm(p,side,color,pose){
  const a=group(p,side*.49,2.84,0),elbow=pose[0],end=pose[1];
  beam(a,[0,0,0],elbow,.16,color);oval(a,0,0,0,.18,.19,.18,color);
  const fore=group(a,...elbow);beam(fore,[0,0,0],end,.12,color);
  const cuff=cylinder(fore,.125,.14,.11,C.silver,...end);cuff.rotation.z=.2;
  fore.userData.hand=hand(fore,...end);fore.userData.shoulder=a;return fore;
}
function clothes(p,color,vocal,bass){
  cylinder(p,.43,.39,1.05,C.white,0,2.38,0);
  if(vocal){
    cylinder(p,.38,.72,.95,C.white,0,1.65,0);
    for(let i=0;i<20;i++){const a=i*Math.PI/10;beam(p,[Math.cos(a)*.38,2.05,Math.sin(a)*.38],[Math.cos(a)*.7,1.2,Math.sin(a)*.7],.022,C.silver);}
    const hem=torus(p,.68,.025,C.silver,0,1.19,0);hem.rotation.x=Math.PI/2;
  }
  for(const s of [-1,1]){
    const panel=group(p,s*.32,2.37,.14);box(panel,.3,1.08,.37,color);panel.rotation.z=s*.07;
    const lapel=box(panel,.17,.66,.06,C.silver,-s*.04,.15,.21);lapel.rotation.z=-s*.28;
    box(panel,.13,.56,.075,color,-s*.04,.15,.25).rotation.z=-s*.28;
    glitter(panel,sparkle,.25,.96,.205,25);
    for(let i=0;i<4;i++)sphere(panel,.028,C.silver,-s*.09,.25-i*.19,.25);
    box(panel,.2,.07,.055,C.silver,0,-.29,.23);
  }
  const belt=torus(p,.4,.04,C.silver,0,1.88,0);belt.rotation.x=Math.PI/2;
  torus(p,.04,.014,C.silver,0,2.67,.425);path(p,[[-.22,2.87,.31],[0,2.67,.425],[.22,2.87,.31]],.012,C.silver);
  if(bass)for(let i=0;i<7;i++)torus(p,.025,.009,C.silver,.36+i*.018,1.92-Math.sin(i/6*Math.PI)*.19,.25);
}
function legs(p,vocal,seated){
  const rig=[];
  if(seated)oval(p,0,1.12,.06,.4,.18,.31,C.silver);
  for(const s of [-1,1]){
    const x=s*.245;
    if(seated){beam(p,[x,1.1,0],[s*.6,.82,.65],.21,C.silver);beam(p,[s*.6,.82,.65],[s*.65,.25,.8],.19,C.silver);}
    const thigh=seated?null:beam(p,[x,1.8,0],[s*.29,.98,.08],vocal?.135:.205,vocal?C.skin:C.silver);
    const shin=seated?null:beam(p,[s*.29,.98,.08],[s*.32,.32,.14],vocal?.13:.19,vocal?C.skin:C.silver);
    const bx=seated?s*.65:s*.32,bz=seated?.88:.14;
    const foot=group(p,bx,0,bz);foot.name=`foot-${s<0?'left':'right'}`;
    box(foot,.36,.12,.57,C.white,0,.08,.08);oval(foot,0,.23,.1,.19,.23,.32,C.silver);
    cylinder(foot,.15,.19,vocal?.52:.32,C.silver,0,vocal?.36:.27,0);
    for(let i=0;i<4;i++){const y=.17+i*.075;beam(foot,[-.11,y,.235],[.11,y+.06,.235],.013,C.white);beam(foot,[.11,y,.236],[-.11,y+.06,.236],.013,C.white);}
    if(!seated)rig.push({side:s,foot,thigh,shin,thighLength:thigh.geometry.parameters.height,shinLength:shin.geometry.parameters.height});
  }
  return rig;
}
function guitar(p,bass){
  const g=group(p,-.42,1.68,.6);g.rotation.z=-.85;
  const key=bass?'bass':'guitar';
  if(!shapeCache.has(key)){
    const s=new THREE.Shape();s.moveTo(-.07,.6);s.bezierCurveTo(-.38,.95,-.33,.42,-.47,.29);s.bezierCurveTo(-1,.03,-.57,-.71,0,-.62);s.bezierCurveTo(.73,-.57,.75,-.03,.36,.23);s.bezierCurveTo(.22,.36,.51,.86,.19,.68);s.lineTo(.12,.46);s.closePath();
    shapeCache.set(key,new THREE.ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelSize:.045,bevelThickness:.04,bevelSegments:3,steps:1,curveSegments:16}));
  }
  const body=mesh(g,shapeCache.get(key),mat(bass?'#f8e8b9':'#1457b0',bass?.28:.7,.23));body.scale.x=bass?1:1.05;
  oval(g,-.02,-.05,.225,.39,.42,.025,bass?'#292227':'#196cc5');
  box(g,.225,1.44,.13,'#523023',0,1.12,.08);box(g,.2,1.45,.027,'#251d24',0,1.12,.165);
  const head=box(g,.29,.43,.15,bass?'#e5bc7c':'#1457b0',0,2.02,.08);head.rotation.z=-.1;
  for(let i=0;i<18;i++){const y=.45+i*.074;box(g,.21,.012,.014,C.silver,0,y,.187);if(i%3===0)oval(g,0,y+.034,.2,.022,.019,.008,C.white);}
  for(let i=0;i<(bass?4:6);i++){
    const x=(i-((bass?4:6)-1)/2)*(bass?.045:.031);
    beam(g,[x,-.43,.28],[x,2.14,.19],bass?.007:.0045,C.silver);
    const y=1.86+i*.06,side=bass?-1:(i<3?-1:1);beam(g,[side*.1,y,.08],[side*.22,y,.08],.018,C.silver);oval(g,side*.24,y,.08,.053,.038,.025,C.silver);
  }
  for(const y of [-.15,.12])box(g,.31,.09,.08,bass?'#1e1920':'#c3cbd7',0,y,.257);
  box(g,.33,.14,.06,C.silver,0,-.4,.25);
  for(let i=0;i<3;i++)sphere(g,.045,C.silver,.29,-.2-i*.13,.27);
  path(p,[[-.4,1.45,.47],[-.51,2.8,-.1],[.4,2.85,-.13],[.68,1.9,.4]],.052,'#33232c');
  return g;
}
function person(stage,role,x,z,y=1.35){
  const vocal=role==='vocal',bass=role==='bass',drummer=role==='drums';
  const root=group(stage,x,y,z),body=group(root);root.name=`band-${role}`;
  const color=mat(vocal?'#eb78a2':bass?'#3cae9f':drummer?'#d99a37':'#568bd8',.55,.28);
  const legRig=legs(root,vocal,drummer);body.position.y=drummer?0:1.8;
  const upper=group(body,0,drummer?-.65:-1.8,0);clothes(upper,color,vocal,bass);
  const f=face(upper,{female:vocal||bass,long:vocal,bob:bass,singing:vocal});
  const arms=[];
  if(vocal){arms.push(arm(upper,-1,color,[[ -.13,-.49,.12],[.19,.7,.49]]));arms.push(arm(upper,1,color,[[.1,-.62,0],[.06,-.48,.15]]));}
  else if(drummer){arms.push(arm(upper,-1,color,[[-.25,-.48,.25],[.38,-.06,.58]]));arms.push(arm(upper,1,color,[[.25,-.48,.25],[-.36,-.06,.58]]));}
  else {arms.push(arm(upper,-1,bass?C.white:color,[[-.15,-.55,.18],[.45,-.31,.42]]));arms.push(arm(upper,1,bass?C.white:color,[[.26,-.42,.14],[-.05,.24,.49]]));guitar(upper,bass);}
  if(vocal){
    const mic=group(arms[0],.19,.78,.49);mic.rotation.z=-.23;cylinder(mic,.048,.06,.41,C.dark);sphere(mic,.095,C.silver,0,.25,0);
    for(let i=0;i<5;i++){const t=torus(mic,.087,.005,C.dark,0,.2+i*.022,0);t.rotation.x=Math.PI/2;}
  }
  if(drummer)for(const [i,a]of arms.entries())beam(a.userData.hand,[0,-.04,.04],[i?-.16:.16,.12,.67],.024,'#e8c790');
  register(`band-${role}`,{vocal:'薇 · 主唱',bass:'芝 · 贝斯',guitar:'宇 · 吉他',drums:'德 · 鼓手'}[role],'sunset-stage',root,{kind:'musician',role,reference:`${{vocal:'wei-vocal',bass:'zhi-bass',guitar:'yu-guitar',drums:'de-drums'}[role]}.png`});
  return {root,body,upper,head:f.head,mouth:f.mouth,arms,legs:legRig,role,home:root.position.clone()};
}
function drum(p,x,y,z,r,h,kick=false){
  const d=group(p,x,y,z);if(kick)d.rotation.x=Math.PI/2;
  cylinder(d,r,r,h,mat('#b95828',.5,.29));
  for(const s of [-1,1]){cylinder(d,r*.98,r*.98,.035,'#eee0c8',0,s*(h/2+.01),0);const ring=torus(d,r,.035,C.silver,0,s*h/2,0);ring.rotation.x=Math.PI/2;}
  for(let i=0;i<10;i++){const a=i*Math.PI/5;const dx=Math.cos(a)*r,dz=Math.sin(a)*r;beam(d,[dx,-h*.37,dz],[dx,h*.37,dz],.025,C.silver);box(d,.07,.09,.07,C.silver,dx,h*.3,dz);}
  return d;
}
function stand(p,x,z,height){
  beam(p,[x,0,z],[x,height,z],.025,C.silver);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;beam(p,[x,.25,z],[x+Math.cos(a)*.43,.04,z+Math.sin(a)*.43],.025,C.silver);}
}
function drums(stage){
  const kit=group(stage,0,1.95,-2.4),cymbals=[];
  drum(kit,0,.75,1.36,.76,.74,true);drum(kit,-.6,1.52,.86,.4,.5);drum(kit,.4,1.62,.75,.44,.52);drum(kit,-1.02,.99,.03,.49,.61);drum(kit,.78,1.04,1.02,.44,.3);
  for(const [x,z,h,r] of [[-1.65,.4,2.18,.65],[1.65,.3,2.23,.7],[-1.25,1.7,1.7,.47],[1.36,1.67,2.04,.57]]){
    stand(kit,x,z,h+.13);const c=group(kit,x,h,z);cylinder(c,.12,r,.055,C.gold);oval(c,0,.035,0,.18,.075,.18,C.gold);
    for(let i=1;i<4;i++){const t=torus(c,r*i/4,.006,C.gold);t.rotation.x=Math.PI/2;}
    cylinder(c,.035,.035,.12,C.dark,0,.12,0);cymbals.push(c);
  }
  for(const [x,z,h] of [[-.6,.86,1.3],[.4,.75,1.4],[-1.02,.03,.8],[.78,1.02,.85]])stand(kit,x,z,h);
  cylinder(kit,.31,.31,.13,C.dark,0,1.05,-.1);stand(kit,0,-.1,1.03);box(kit,.22,.07,.43,C.silver,.28,.09,1.96);
  register('band-drumkit','五鼓四镲 · 琥珀爵士鼓','sunset-stage',kit,{drums:5,cymbals:4});return cymbals;
}
export function buildBand(stage){
  const members=[person(stage,'vocal',0,3.2),person(stage,'bass',-5,1.5),person(stage,'guitar',5,1.5),person(stage,'drums',0,-2.4,1.95)];
  const cymbals=drums(stage);
  return {members,cymbals,update(t,performance){
    updateChoreography(members,cymbals,t,performance);
  }};
}

import {THREE,mat,mesh,box,sphere,cylinder,torus,beam,group,register,textSign} from './kit.js';
import {buildBand} from './band.js';
import {buildStageEffects} from './stage-effects.js';
import {createConfetti} from './confetti.js';

const gold=mat(0xffbd35,.72,.23),amber=mat(0xe87520,.5,.28),dark=mat(0x372621,.4,.34);
function truss(parent,a,b){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),length=start.distanceTo(end);
  const frame=group(parent,...start.toArray());frame.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());
  for(const x of [-.23,.23])for(const z of [-.23,.23])beam(frame,[x,0,z],[x,length,z],.055,gold);
  for(let y=0;y<length-.7;y+=.9)for(const z of [-.23,.23])beam(frame,[-.23,y,z],[.23,Math.min(y+.9,length),z],.035,gold);
}
function portraitScreens(stage){
  const loader=new THREE.TextureLoader(),screens=[];
  const portraits=JSON.parse(document.querySelector('#bandPortraits').textContent);
  const people=[['zhi-bass','贝斯 · ZHI'],['de-drums','鼓手 · DE'],['wei-vocal','主唱 · WEI'],['yu-guitar','吉他 · YU']];
  for(let side=0;side<2;side++){
    const panel=group(stage,side?9:-9,6,-3.3);
    box(panel,4.35,5.35,.38,dark);box(panel,4.55,.13,.52,gold,0,2.72,0);box(panel,4.55,.13,.52,gold,0,-2.72,0);
    for(let j=0;j<2;j++){
      const [file,label]=people[side*2+j],x=(j-.5)*2.06;
      const material=new THREE.MeshBasicMaterial({color:0xffebca});
      const screen=mesh(panel,new THREE.PlaneGeometry(1.98,3.45),material,x,.2,.22);screen.castShadow=false;
      const url=portraits[file];
      loader.load(url,texture=>{texture.colorSpace=THREE.SRGBColorSpace;material.map=texture;material.needsUpdate=true;},undefined,()=>{
        material.color.set(0xf9ad35);screen.userData.imageUnavailable=true;
      });
      textSign(panel,label,x,-1.9,.24,1.95,'#ffd477','#4c2b20');screens.push(screen);
    }
  }
  return screens;
}
function speaker(stage,x){
  const stack=group(stage,x,1.4,2.8);
  for(let i=0;i<3;i++){
    box(stack,1.4,1.45,.95,dark,0,.75+i*1.47,0);
    for(const y of [.4,1.05]){
      const speaker=cylinder(stack,.4,.4,.06,0x171c22,0,y+i*1.47,.51,24);speaker.rotation.x=Math.PI/2;
      torus(stack,.3,.025,0xa78a54,0,y+i*1.47,.56);
      sphere(stack,.11,0x382d24,0,y+i*1.47,.56,1,1,.3);
    }
    for(let j=0;j<6;j++)box(stack,1.24,.012,.012,0x786958,0,.2+j*.2+i*1.47,.57);
  }
}
export function buildSunsetStage(world){
  const stage=group(world,-46,0,-4);stage.name='盛夏日落音乐舞台';
  box(stage,19,.13,11,mat(0xeeb26e,.05,.75),0,.32,10.3);
  for(const x of [-9,9])for(let z=6;z<16;z+=1.4)box(stage,.12,.025,.7,gold,x,.4,z);
  box(stage,23,.35,13.2,mat(0xffbe62,.2,.6),0,.43,0);
  box(stage,22,1.05,12,dark,0,.825,0);
  box(stage,22.1,.1,12.1,mat(0xa64a20,.45,.25),0,1.35,0);
  for(let x=-10.5;x<=10.5;x+=.7)box(stage,.025,.015,11.8,0xe79f4a,x,1.411,0);
  for(let i=0;i<3;i++)box(stage,9+i*1.1,.27,1.05,amber,0,1.05-i*.28,6.5+i*.85);
  for(const z of [-5.9,5.9])box(stage,22,.12,.13,new THREE.MeshBasicMaterial({color:0xffbf50}),0,1.3,z);
  box(stage,5,.6,3.8,amber,0,1.65,-2.6);box(stage,5.1,.08,3.9,gold,0,1.97,-2.6);
  const backdrop=box(stage,21,10,.3,mat(0x9d321d,.2,.55),0,6.4,-5.7);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'#fdbb50');gradient.addColorStop(.5,'#ee7430');gradient.addColorStop(1,'#b83223');ctx.fillStyle=gradient;ctx.fillRect(0,0,512,256);
  for(let y=0;y<256;y+=5){ctx.fillStyle='rgba(101,35,22,.10)';ctx.fillRect(0,y,512,1);}
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  backdrop.material=new THREE.MeshStandardMaterial({map:tex,roughness:.8,emissive:0xa84416,emissiveMap:tex,emissiveIntensity:.3});
  for(let i=0;i<24;i++){
    const a=i*Math.PI*2/24,r=6.3,length=i%2?1.3:2;
    const ray=box(stage,.13,length,.13,gold,Math.sin(a)*r,9.4+Math.cos(a)*r,-5.4);ray.rotation.z=-a;
  }
  for(const r of [5.35,5.65])torus(stage,r,.06,gold,0,9.4,-5.36);
  for(const side of [-1,1]){
    truss(stage,[side*11,1.4,-.1],[side*11,12.8,-.1]);
    for(let j=0;j<5;j++)sphere(stage,.65,mat(0xffc483,0,.75),side*(4.6+j*.95),8.6+Math.sin(j)*.4,-5.12,1.6,.24,.25);
    speaker(stage,side*10.05);
    for(let j=0;j<3;j++){const monitor=box(stage,1.8,.55,.85,dark,side*(2.4+j*2.5),1.72,4.8);monitor.rotation.x=-.3;}
  }
  truss(stage,[-11,12.8,-.1],[11,12.8,-.1]);
  textSign(stage,'盛 夏 日 落',0,12.9,.35,7.2,'#fff2bb','#8f301d');
  textSign(stage,'SUNSET  /  LIVE',0,.84,6.08,5,'#ffdf8e','#4e2b22');
  const band=buildBand(stage),effects=buildStageEffects(stage),screens=portraitScreens(stage),confetti=createConfetti(stage);
  register('sunset-stage','盛夏日落音乐舞台','sunset-stage',stage,{palette:['#ffc64b','#f89632','#d88520','#d54426'],performers:4,drums:5,cymbals:4,spotlights:3,lightBeams:6,portraitScreens:4,confetti:192,dimensions:[23,17,13.2],description:'金色太阳、复古橙红舞台、四人立体乐队、暖金摇头灯与间歇飘落的彩纸。'});
  const stageController={stage,band,effects,screens,confetti,confettiEnabled:true,update(t,theme,performance){
    band.update(t,performance);effects.update(t,theme,performance);confetti.update(t,stageController.confettiEnabled);
  }};
  return stageController;
}

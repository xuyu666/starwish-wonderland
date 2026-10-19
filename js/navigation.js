import {THREE,assets} from './kit.js';
export function createNavigation(camera,canvas,avatar,toast){
  const state={view:'overview',flying:false,ride:null,yaw:0,pitch:-.32,distance:152,theta:.18,phi:.8,focus:new THREE.Vector3(0,2,10),player:new THREE.Vector3(0,0,42),moving:0};
  const keys=new Set();let drag=null;
  const pitchLimit=Math.PI/2-.02,worldUp=new THREE.Vector3(0,1,0);
  const gaze=()=>new THREE.Vector3(-Math.sin(state.yaw)*Math.cos(state.pitch),Math.sin(state.pitch),-Math.cos(state.yaw)*Math.cos(state.pitch));
  const raycaster=new THREE.Raycaster();
  const cameraBlockers=assets.filter(a=>['castle','harbor','candy-town','entrance','carousel','swing','wheel','teacups','sunset-stage'].includes(a.id)).map(a=>a.node);
  const $=s=>document.querySelector(s);
  const obstacles=[[-24,4,8.6],[24,5,8.5],[34,-24,9],[28,30,10],[0,8,6],[0,-18,12],[-35,-25,12],[-30,29,10]];
  const stageBlocked=(x,z)=>x>-57.3&&x<-34.7&&z>-10.3&&z<2.3;
  function sync(){
    $('#overview').classList.toggle('active',state.view==='overview');
    $('#perspective').classList.toggle('active',state.view==='first'||state.view==='third');
    $('#perspective').innerHTML=`◎ ${state.view==='first'?'第一人称':'第三人称'} <kbd>V</kbd>`;
    $('#flight').classList.toggle('active',state.flying);$('#flight').innerHTML=`⌁ ${state.flying?'降落步行':'开启飞行'} <kbd>F</kbd>`;
    document.body.classList.toggle('flying',state.flying);document.body.classList.toggle('roaming',state.view!=='overview');avatar.visible=state.view==='third';
    document.body.classList.toggle('riding',state.view==='ride');const exit=$('#exitRide');if(exit)exit.hidden=state.view!=='ride';
  }
  function overview(){state.view='overview';state.ride=null;state.focus.set(0,2,10);state.distance=152;state.theta=.18;state.phi=.8;sync();}
  function explore(){state.view='third';state.ride=null;sync();toast('WASD 移动 · 拖拽环顾 · F 开启飞行');}
  function reset(){state.player.set(0,0,42);state.yaw=0;state.pitch=-.32;state.flying=false;explore();}
  function perspective(){state.view=state.view==='first'?'third':'first';state.ride=null;sync();toast(state.view==='first'?'第一人称 · 拖拽屏幕环顾':'第三人称 · 跟随你的脚步');}
  function flight(){state.flying=!state.flying;state.ride=null;if(state.view==='overview'||state.view==='ride')state.view='third';if(state.flying){state.player.y=Math.max(6,state.player.y);toast('飞行开启 · Space 上升 · Shift 下降');}else{let p=state.player;const blocked=stageBlocked(p.x,p.z)||obstacles.some(([x,z,r])=>Math.hypot(p.x-x,p.z-z)<r);if(blocked)p.set(0,0,42);p.y=0;toast(blocked?'已降落到入口安全区域':'已降落 · 开始步行');}sync();}
  function visit(zone){if(zone.id==='sunset-stage'){watchStage();state.phi=1.22;state.distance=38;return;}state.ride=null;state.focus.set(zone.x,3,zone.z);state.theta=.35;state.phi=.95;state.distance=zone.id==='castle'?49:zone.id==='wheel'?48:32;state.player.set(zone.x,0,zone.z+(zone.id==='castle'?17:zone.id==='harbor'?16:zone.id==='teacups'?13:13));if(Math.hypot(state.player.x,state.player.z)>62)state.player.set(0,0,42);state.flying=false;state.view='overview';sync();}
  function watchStage(){state.ride=null;state.focus.set(-46,6,-4);state.theta=.04;state.phi=1.4;state.distance=32;state.player.set(-46,0,10);state.yaw=0;state.pitch=.12;state.flying=false;state.view='overview';sync();}
  function ride(id){state.ride=id;state.view='ride';state.yaw=0;state.pitch=0;sync();toast('已进入乘坐视角 · 拖拽环顾，按 Esc 或退出乘坐离开');}
  function leave(){state.yaw=0;state.pitch=-.32;explore();}
  const exit=$('#exitRide');if(exit)exit.onclick=leave;
  $('#overview').onclick=overview;$('#explore').onclick=explore;$('#perspective').onclick=perspective;$('#flight').onclick=flight;$('#reset').onclick=reset;
  window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;const bound=['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyF','KeyV','KeyR'];if(bound.includes(e.code))e.preventDefault();if(!e.repeat){if(e.code==='KeyV')perspective();if(e.code==='KeyF')flight();if(e.code==='KeyR')reset();if(e.code==='Escape'&&state.ride)leave();}keys.add(e.code);});
  window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();drag=null;});
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};if(state.view==='overview'){state.theta-=dx*.006;state.phi=THREE.MathUtils.clamp(state.phi+dy*.005,.02,Math.PI/2-.02);}else{state.yaw-=dx*.005;state.pitch=THREE.MathUtils.clamp(state.pitch-dy*.004,-pitchLimit,pitchLimit);}});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(state.view==='overview')state.distance=THREE.MathUtils.clamp(state.distance+e.deltaY*.035,15,180);},{passive:false});
  document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(b.dataset.key);b.setPointerCapture(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key));});
  function update(dt,seats){
    const forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));
    const strafe=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
    const vertical=Number(keys.has('Space'))-Number(keys.has('ShiftLeft')||keys.has('ShiftRight'));
    if((forward||strafe||vertical)&&state.view==='overview')explore();
    const p=state.player;state.moving=0;
    if(state.view==='first'||state.view==='third'){
      const speed=dt*(state.flying?17:keys.has('ShiftLeft')?10:6),len=Math.max(1,Math.hypot(forward,strafe));
      const dx=(strafe*Math.cos(state.yaw)-forward*Math.sin(state.yaw))*speed/len,dz=(-forward*Math.cos(state.yaw)-strafe*Math.sin(state.yaw))*speed/len;
      const nx=p.x+dx,nz=p.z+dz;
      const blocked=(x,z)=>Math.hypot(x,z)>62||(!state.flying&&(stageBlocked(x,z)||obstacles.some(([ox,oz,r])=>Math.hypot(x-ox,z-oz)<r)));
      if(!blocked(nx,p.z))p.x=nx;if(!blocked(p.x,nz))p.z=nz;
      if(state.flying)p.y=THREE.MathUtils.clamp(p.y+vertical*speed,1,65);
      state.moving=forward||strafe?1:0;avatar.position.copy(p);avatar.rotation.y=state.yaw+Math.PI;
    }
    let target=new THREE.Vector3();camera.up.copy(worldUp);
    if(state.view==='overview'){
      const d=state.distance*Math.max(1,1/camera.aspect);camera.position.set(state.focus.x+Math.sin(state.theta)*Math.sin(state.phi)*d,state.focus.y+Math.cos(state.phi)*d,state.focus.z+Math.cos(state.theta)*Math.sin(state.phi)*d);target.copy(state.focus);
    }else if(state.view==='ride'&&seats[state.ride]){
      const pose=seats[state.ride](),base=new THREE.Matrix4().lookAt(pose.position,pose.target,pose.up??worldUp);
      camera.position.copy(pose.position);camera.up.copy(pose.up??worldUp);target.copy(camera.position).add(gaze().applyMatrix4(base));
    }
    else if(state.view==='first'){camera.position.copy(p).add(new THREE.Vector3(0,1.8,0));target.copy(camera.position).add(gaze());}
    else{const distance=state.flying?11:7,look=gaze();target.copy(p).add(new THREE.Vector3(0,1.8,0));camera.position.copy(target).addScaledVector(look,-distance);camera.position.y=Math.max(1.5,camera.position.y);
      const direction=camera.position.clone().sub(target),length=direction.length();raycaster.set(target,direction.normalize());raycaster.far=length;const hit=raycaster.intersectObjects(cameraBlockers,true).find(h=>h.distance>.3);if(hit)camera.position.copy(target).addScaledVector(direction,Math.max(.6,hit.distance-.35));
      target.copy(camera.position).addScaledVector(look,distance);
    }
    camera.lookAt(target);avatar.visible=state.view==='third';
  }
  sync();return{state,update,visit,ride,leave,overview,reset,watchStage};
}

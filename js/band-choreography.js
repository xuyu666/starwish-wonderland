import {THREE} from './kit.js';

const routes={
  vocal:[[0,0],[-.9,.12],[-.9,.12],[0,-.18],[0,0],[.95,.15],[.95,.15],[0,.18],[0,0]],
  bass:[[0,0],[.5,-.3],[.5,-.3],[0,0],[0,0],[-.5,.2],[-.5,.2],[0,0],[0,0]],
  guitar:[[0,0],[0,0],[-.8,.35],[-.8,.35],[0,0],[.45,-.3],[.45,-.3],[0,0],[0,0]],
};
const up=new THREE.Vector3(0,1,0),start=new THREE.Vector3(),end=new THREE.Vector3(),direction=new THREE.Vector3();
const clamp=n=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const smooth=n=>n*n*(3-2*n);
const wrap=n=>((n%32)+32)%32;
function route(role,step){
  const at=wrap(step)/4,index=Math.floor(at),f=smooth(at-index),points=routes[role];
  return {x:points[index][0]+(points[index+1][0]-points[index][0])*f,z:points[index][1]+(points[index+1][1]-points[index][1])*f};
}
function segment(mesh,a,b,length){
  start.set(...a);end.set(...b);direction.subVectors(end,start);
  mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.scale.y=direction.length()/length;mesh.quaternion.setFromUnitVectors(up,direction.normalize());
}
function walk(member,clock,moving,energy){
  const step=Math.floor(clock),fraction=clock-step,f=smooth(fraction),from=route(member.role,step),to=route(member.role,step+1);
  const x=moving?(from.x+(to.x-from.x)*f):0,z=moving?(from.z+(to.z-from.z)*f):0;
  member.root.position.set(member.home.x+x,member.home.y,member.home.z+z);
  member.body.position.y=1.8+Math.sin(fraction*Math.PI)**2*.018*energy;
  for(const leg of member.legs){
    const swings=(step%2===0?1:-1)===leg.side,previous=route(member.role,step-1);
    const distance=Math.hypot(to.x-previous.x,to.z-previous.z),lift=moving&&swings?Math.sin(fraction*Math.PI)*Math.min(.19,distance*.38):0;
    const fx=moving?(swings?previous.x+(to.x-previous.x)*f:from.x):0;
    const fz=moving?(swings?previous.z+(to.z-previous.z)*f:from.z):0;
    leg.foot.position.set(leg.side*.32+fx-x,lift,.14+fz-z);
    leg.foot.rotation.x=-lift*.35;
    const hip=[leg.side*.245,member.body.position.y,0],ankle=[leg.foot.position.x,.32+lift,leg.foot.position.z];
    const knee=[(hip[0]+ankle[0])*.5,(hip[1]+ankle[1])*.5,.09+(hip[2]+ankle[2])*.5+lift*.65];
    segment(leg.thigh,hip,knee,leg.thighLength);segment(leg.shin,knee,ankle,leg.shinLength);
  }
}
function envelope(beat,first,last){
  if(beat<first||beat>last)return 0;
  return Math.sin(Math.PI*(beat-first)/(last-first))**2;
}
function pose(member,index,time,clock,signal){
  const {energy,level,mid,high,bass,beat,sway}=signal,phrase=wrap(clock),phase=time*2.65+index*.9;
  const accent=Math.cos(clock*Math.PI*2)*(.025*beat+.012*bass);
  member.body.rotation.set(0,Math.sin(time*.75+index)*.09*energy,Math.sin(phase)*.045*sway);
  member.head.rotation.set(Math.sin(phase*1.1)*.065*sway,Math.sin(clock*.4+index)*.075*mid,Math.sin(phase*.65)*.045*mid);
  for(const a of member.arms){a.rotation.set(0,0,0);a.userData.shoulder.rotation.set(0,0,0);}
  if(energy===0&&beat===0){member.body.rotation.set(0,0,0);member.head.rotation.set(0,0,0);if(member.role==='vocal')member.mouth.scale.y=.18;return;}
  if(member.role==='drums'){
    const fill=envelope(phrase,12,16)+envelope(phrase,28,32);
    const hit=clock*Math.PI*2;
    member.body.rotation.set(.016*bass,Math.sin(clock*.4)*.035*mid,Math.sin(hit)*.012*sway);
    member.arms[0].rotation.x=Math.sin(hit)*(.46*bass+.18*beat+.16*fill*energy);
    member.arms[1].rotation.x=Math.sin(hit+Math.PI)*(.4*high+.22*beat+.18*fill*energy);
    member.arms[0].userData.shoulder.rotation.y=(-.12+Math.sin(clock*.7)*.23)*high+fill*.28*energy;
    member.arms[1].userData.shoulder.rotation.y=(.12+Math.sin(clock*.7+1)*.2)*high-fill*.3*energy;
    return;
  }
  member.body.rotation.x=accent;
  if(member.role==='vocal'){
    const gesture=envelope(phrase,2,8)+envelope(phrase,18,24);
    member.arms[0].rotation.x=Math.sin(phase)*.025*level;
    member.arms[1].userData.shoulder.rotation.z=-gesture*.85*mid;
    member.arms[1].userData.shoulder.rotation.x=-gesture*.3*level;
    member.arms[1].rotation.x=Math.sin(clock*Math.PI)*.14*level-gesture*.3*mid;
    member.head.rotation.y+=Math.sin(clock*.28)*.1*level;
    member.mouth.scale.y=.18+level*1.55;
  }else{
    const solo=member.role==='guitar'?envelope(phrase,8,16):envelope(phrase,20,28);
    const strum=Math.max(mid,high*.7),speed=member.role==='guitar'?4:2;
    member.arms[0].rotation.x=Math.sin(clock*Math.PI*speed)*(.1*strum+.035*beat);
    member.arms[1].rotation.x=Math.sin(clock*Math.PI+1)*.045*mid;
    member.body.rotation.x-=solo*.11*energy;
    member.body.rotation.y+=(member.role==='guitar'?-.2:.16)*solo*energy;
    member.head.rotation.x+=solo*.13*energy;
  }
}
export function updateChoreography(members,cymbals,t,performance){
  const time=Number.isFinite(t)?Math.max(0,t):0,loaded=performance?.loaded===true;
  const active=!loaded||performance.active===true;
  const value=key=>active?(loaded?clamp(performance[key]):({level:.6,bass:.55,mid:.65,high:.45,beat:.35})[key]):0;
  const level=value('level'),bass=value('bass'),mid=value('mid'),high=value('high'),beat=value('beat');
  const energy=Math.max(level,bass*.8,mid*.65,high*.45),sway=energy*.8+beat*.2;
  const clock=time*2,moving=Math.max(energy,beat)>.015;
  for(const [index,member]of members.entries()){
    if(member.role!=='drums')walk(member,clock,moving,energy);
    pose(member,index,time,clock,{energy,level,bass,mid,high,beat,sway});
  }
  for(const [index,cymbal]of cymbals.entries()){
    if(energy===0&&beat===0){cymbal.rotation.set(0,0,0);continue;}
    const crash=envelope(wrap(clock),index%2?28:12,index%2?32:16);
    cymbal.rotation.x=Math.sin(time*17+index)*.065*(high*.7+beat*.3+crash*energy*.3);
    cymbal.rotation.z=Math.sin(time*13+index)*.045*high;
  }
}

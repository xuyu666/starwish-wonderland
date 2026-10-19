import {THREE,assets} from './kit.js';
import {buildEnvironment} from './environment.js';
import {buildArchitecture} from './architecture.js';
import {buildRides} from './rides.js';
import {createNavigation} from './navigation.js';
import {createAtmosphere} from './atmosphere.js';
import {createFireworks} from './fireworks.js';
import {buildSunsetStage} from './stage.js';
import {setupSound} from './sound.js';
const $=s=>document.querySelector(s),canvas=$('#scene');
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3800);}
const zones=[
  {id:'castle',name:'星愿城堡',symbol:'♜',x:0,z:-18,color:'#ec86b7',description:'粉金塔尖，收藏每一个愿望。'},
  {id:'carousel',name:'梦幻木马',symbol:'♞',x:-24,z:4,color:'#f187b5',description:'十二匹小马，转动一场粉金色的梦。'},
  {id:'swing',name:'云端飞椅',symbol:'✥',x:24,z:5,color:'#29bbb9',description:'双脚离地，和清风一起飞向天空。'},
  {id:'wheel',name:'星愿摩天轮',symbol:'☸',x:34,z:-24,color:'#eaa139',description:'慢慢升高，把整座奇境装进眼睛。'},
  {id:'harbor',name:'海盗港湾',symbol:'⚓',x:-35,z:-25,color:'#559eaa',description:'登上摇摆海盗船，随风帆一起荡向港湾。'},
  {id:'candy-town',name:'糖果小镇',symbol:'♧',x:-30,z:29,color:'#d869a3',description:'蛋糕屋顶与棒棒糖，甜蜜沿街发生。'},
  {id:'sunset-stage',name:'盛夏日落舞台',symbol:'♫',x:-46,z:-4,color:'#ee9c26',description:'四人乐队，在金色太阳下热烈开唱。'},
  {id:'teacups',name:'星际花园',symbol:'♧',x:28,z:30,color:'#8065c5',description:'坐进星际茶杯，围着复古火箭打转。'}
];
async function boot(){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.18;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xb5deee);scene.fog=new THREE.Fog(0xb5deee,155,390);
  const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.15,700);
  const hemi=new THREE.HemisphereLight(0xe9f5ff,0x588052,2.5);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffe3ba,3.3);sun.position.set(-38,75,38);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-80,right:80,top:75,bottom:-75,near:1,far:210});sun.shadow.normalBias=.08;sun.shadow.bias=-.0003;scene.add(sun);
  const rim=new THREE.DirectionalLight(0xffa1cb,1.1);rim.position.set(25,35,-45);scene.add(rim);
  const world=new THREE.Group();scene.add(world);
  const environment=buildEnvironment(world),architecture=buildArchitecture(world),rides=buildRides(world),stage=buildSunsetStage(world);
  Object.assign(rides.seats,architecture.seats);
  const nav=createNavigation(camera,canvas,environment.avatar,toast);
  const atmosphere=createAtmosphere(scene,world),fireworks=createFireworks(scene);
  let selected=zones[0],paused=matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,theme='day';
  $('#pause').textContent=paused?'▶':'Ⅱ';
  function select(zone){selected=zone;nav.visit(zone);$('#zoneTitle').textContent=zone.name;$('#zoneDescription').textContent=zone.description;$('#zoneNumber').textContent=zone.symbol;$('#ride').hidden=!rides.seats[zone.id];$('#watchShow').hidden=zone.id!=='sunset-stage';document.body.classList.toggle('at-stage',zone.id==='sunset-stage');document.body.classList.toggle('at-harbor',zone.id==='harbor');document.querySelectorAll('#destinations button').forEach(b=>{b.classList.toggle('active',b.dataset.zone===zone.id);b.setAttribute('aria-pressed',String(b.dataset.zone===zone.id));});toast('已抵达 '+zone.name);}
  zones.forEach((zone,i)=>{const b=document.createElement('button');b.dataset.zone=zone.id;b.innerHTML=`<span class="nav-symbol">${zone.symbol}</span>${zone.name}`;b.className=i===0?'active':'';b.setAttribute('aria-pressed',String(i===0));b.onclick=()=>select(zone);$('#destinations').append(b);});
  $('#ride').onclick=()=>nav.ride(selected.id);
  $('#watchShow').onclick=()=>{nav.watchStage();void sound.startShow();toast('前排观演 · 拖拽换角度，滚轮看细节');};
  const presets={day:{sky:0xb5deee,hemi:1.45,sun:2.7,rim:.8,exposure:1.05,sunColor:0xffe3ba,label:'金色午后'},sunset:{sky:0xeeb59e,hemi:1.65,sun:1.95,rim:1.3,exposure:1.03,sunColor:0xffbc7a,label:'温柔夕阳'},night:{sky:0x25223e,hemi:.68,sun:.72,rim:.65,exposure:1.1,sunColor:0xffc482,label:'暖灯星夜'}};
  const current={sky:scene.background.clone(),hemi:1.45,sun:2.7,rim:.8,exposure:1.05,sunColor:new THREE.Color(0xffe3ba)};
  document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{theme=b.dataset.day;document.querySelectorAll('[data-day]').forEach(n=>n.classList.toggle('active',n===b));$('#timeLabel').textContent=presets[theme].label;document.body.classList.toggle('night',theme==='night');if(theme==='sunset'&&nav.state.view==='overview'&&selected.id!=='sunset-stage'){nav.state.focus.set(0,5,0);nav.state.distance=165;nav.state.theta=.12;nav.state.phi=1.25;}toast(presets[theme].label);});
  $('#pause').onclick=()=>{paused=!paused;sound.syncPause(paused);$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'继续场景动画':'暂停场景动画');toast(paused?'设施动画已暂停':'奇境继续上演');};
  $('#mapToggle').onclick=()=>{$('.map-panel').classList.toggle('collapsed');$('#mapToggle').textContent=$('.map-panel').classList.contains('collapsed')?'+':'−';};
  const map=$('#minimap'),ctx=map.getContext('2d');
  function drawMap(){const s=2.08,c=155;ctx.clearRect(0,0,310,310);ctx.fillStyle='#d4e7e5';ctx.beginPath();ctx.arc(c,c,145,0,Math.PI*2);ctx.fill();ctx.fillStyle='#bad395';ctx.beginPath();ctx.arc(c,c,133,0,Math.PI*2);ctx.fill();ctx.lineWidth=9;ctx.strokeStyle='#fff1d5';ctx.lineCap='round';for(const [a,b]of [[[0,52],[0,-24]],[[-48,4],[45,4]],[[-30,29],[28,30]],[[-30,29],[-35,-25]],[[28,30],[34,-24]]]){ctx.beginPath();ctx.moveTo(c+a[0]*s,c+a[1]*s);ctx.lineTo(c+b[0]*s,c+b[1]*s);ctx.stroke();}
    for(const z of zones){ctx.fillStyle=z.color;ctx.strokeStyle=z===selected?'#49334f':'#fff6e4';ctx.lineWidth=z===selected?4:2;ctx.beginPath();ctx.arc(c+z.x*s,c+z.z*s,z.id==='castle'?15:12,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#49334f';ctx.font='bold 19px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(z.symbol,c+z.x*s,c+z.z*s);}
    const p=nav.state.player;ctx.fillStyle='#b32d60';ctx.beginPath();ctx.arc(c+p.x*s,c+p.z*s,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff8ed';ctx.lineWidth=2;ctx.stroke();}
  map.addEventListener('click',e=>{const r=map.getBoundingClientRect(),x=((e.clientX-r.left)/r.width*310-155)/2.08,z=((e.clientY-r.top)/r.height*310-155)/2.08;const nearest=[...zones].sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];select(nearest);});
  $('#help').onclick=()=>$('#guide').showModal();$('#concept').onclick=()=>$('#conceptDialog').showModal();document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('当前窗口暂不支持全屏');}};
  function download(url,name){const a=document.createElement('a');a.href=url;a.download=name;a.click();}
  $('#photo').onclick=()=>{renderer.render(scene,camera);canvas.toBlob(blob=>{if(!blob){toast('截图未能生成，请重试');return;}const url=URL.createObjectURL(blob);download(url,'星愿奇境-场景照片.png');setTimeout(()=>URL.revokeObjectURL(url),3000);toast('场景照片已生成，请查看下载');},'image/png');};
  $('#downloadAssets').onclick=()=>{const catalog=assetCatalog(world);const url=URL.createObjectURL(new Blob([JSON.stringify(catalog,null,2)],{type:'application/json'}));download(url,'星愿奇境-资产目录.json');setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const sound=setupSound(toast,()=>selected.id==='sunset-stage',()=>paused);
  sound.syncPause(paused);
  const confettiToggle=$('#confettiToggle');confettiToggle.checked=!matchMedia('(prefers-reduced-motion: reduce)').matches;stage.confettiEnabled=confettiToggle.checked;
  confettiToggle.onchange=()=>{stage.confettiEnabled=confettiToggle.checked;if(!stage.confettiEnabled)stage.confetti.update(time,false);toast(stage.confettiEnabled?'自动彩带已开启':'自动彩带已关闭');};
  $('#confettiBurst').onclick=()=>{if(paused){toast('请先继续场景动画，再撒下彩带');return;}confettiToggle.checked=true;stage.confettiEnabled=true;select(zones.find(z=>z.id==='sunset-stage'));nav.watchStage();stage.confetti.burst();$('#musicDialog').close();toast('金色彩带，为这一刻喝彩');};
  function burst(){fireworks.burst();toast('七重彩色烟花，为你的愿望盛放');}
  $('#fireworks').onclick=burst;
  let last=performance.now(),frames=0,mapTick=0,firePhase='idle';
  function animate(now){requestAnimationFrame(animate);const effectDt=Math.min((now-last)/1000,.2),dt=Math.min(effectDt,.05);last=now;if(!paused)time+=dt;
    environment.update(time,paused?0:dt,nav.state.moving);architecture.update(time,dt);rides.update(time,dt);sound.update(dt);if(!paused)stage.update(time,theme,sound.performance);nav.update(dt,rides.seats);
    const desired=presets[theme],lerp=1-Math.exp(-dt*3);current.sky.lerp(new THREE.Color(desired.sky),lerp);scene.background.copy(current.sky);scene.fog.color.copy(current.sky);for(const k of ['hemi','sun','rim','exposure'])current[k]=THREE.MathUtils.lerp(current[k],desired[k],lerp);hemi.intensity=current.hemi;sun.intensity=current.sun;rim.intensity=current.rim;renderer.toneMappingExposure=current.exposure;current.sunColor.lerp(new THREE.Color(desired.sunColor),lerp);sun.color.copy(current.sunColor);environment.setNight(theme==='night'?1:0);
    const night=theme==='night',dusk=theme==='sunset';
    hemi.color.lerp(new THREE.Color(night?0xffd4a2:dusk?0xffd9be:0xe9f5ff),lerp);hemi.groundColor.lerp(new THREE.Color(night?0x593c3b:dusk?0x926855:0x588052),lerp);
    rim.color.lerp(new THREE.Color(night?0xffb66b:dusk?0xffcba4:0xffa1cb),lerp);
    rim.position.lerp(new THREE.Vector3(...(dusk?[15,30,65]:night?[25,35,35]:[25,35,-45])),lerp);
    sun.position.lerp(new THREE.Vector3(...(dusk?[-65,28,-80]:night?[-25,40,35]:[-38,75,38])),lerp);
    atmosphere.update(theme,dt,time,camera);fireworks.update(paused?0:effectDt);
    if(firePhase!==fireworks.phase){firePhase=fireworks.phase;$('#fireworks').dataset.phase=firePhase;$('#fireworks').classList.toggle('active',fireworks.active);$('#fireworks').setAttribute('aria-label',fireworks.active?'烟花表演中，点击重新燃放':'绽放烟花');}
    scene.fog.near=155*Math.max(1,1/camera.aspect);scene.fog.far=390*Math.max(1,1/camera.aspect);renderer.render(scene,camera);if(++mapTick%6===0)drawMap();if(++frames===2)$('#loading').hidden=true;
  }
  window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();toast('图形上下文已中断，请刷新页面重新进入');});
  window.starwish={renderer,scene,camera,nav,zones,assets,rides,stage,sound,atmosphere,fireworks,get time(){return time;},get paused(){return paused;},select,burst};
  requestAnimationFrame(animate);
}
function assetCatalog(world){
  world.updateMatrixWorld(true);const position=node=>node.getWorldPosition(new THREE.Vector3()).toArray().map(n=>Math.round(n*100)/100);
  const describeMaterial=m=>({type:m.type,color:m.color?'#'+m.color.getHexString():null,metalness:m.metalness??0,roughness:m.roughness??null,transparent:m.transparent,emissive:m.emissive?'#'+m.emissive.getHexString():null});
  const groups=assets.map(a=>{let count=0;a.node.traverse(n=>{if(n.isMesh)count+=n.isInstancedMesh?n.count:1;});return{id:a.id,name:a.name,zone:a.zone,position:position(a.node),meshInstances:count,...a.details};});
  const components=[];const instanceMatrix=new THREE.Matrix4(),worldMatrix=new THREE.Matrix4();
  world.traverse(node=>{if(!node.isMesh)return;let ancestor=node,owner=null;while(ancestor&&!owner){owner=assets.find(a=>a.node===ancestor);ancestor=ancestor.parent;}const base={id:node.uuid,asset:owner?.id??'decoration',shape:node.geometry.type,position:position(node),materials:(Array.isArray(node.material)?node.material:[node.material]).map(describeMaterial)};
    if(node.isInstancedMesh){const instances=[];for(let i=0;i<node.count;i++){node.getMatrixAt(i,instanceMatrix);worldMatrix.multiplyMatrices(node.matrixWorld,instanceMatrix);const c=new THREE.Color();if(node.instanceColor)node.getColorAt(i,c);instances.push({position:new THREE.Vector3().setFromMatrixPosition(worldMatrix).toArray().map(n=>Math.round(n*100)/100),color:node.instanceColor?'#'+c.getHexString():null});}base.count=node.count;base.instances=instances;}else base.count=1;components.push(base);});
  return{title:'星愿奇境资产目录',units:'meters',coordinateSystem:'Y up, entrance at +Z',groups,components};
}
boot().catch(error=>{console.error(error);$('#loading').innerHTML='<div class="loading-star">✦</div><h2>奇境暂时无法开启</h2><p>请使用支持 WebGL 2 的现代浏览器，通过本地服务器访问。</p><button onclick="location.reload()">重新尝试</button>';});

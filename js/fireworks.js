import {THREE} from './kit.js';

export function createFireworks(scene){
  const perBurst=300,burstCount=7,trailCount=5,count=perBurst*burstCount*trailCount;
  const positions=new Float32Array(count*3),colors=new Float32Array(count*3),seeds=[];
  const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(16,16,0,16,16,16);
  gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.2,'rgba(255,255,255,1)');gradient.addColorStop(.55,'rgba(255,255,255,.35)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const material=new THREE.PointsMaterial({map:new THREE.CanvasTexture(canvas),size:1.9,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  const points=new THREE.Points(geometry,material);points.frustumCulled=false;points.visible=false;scene.add(points);
  const palette=[0xff507d,0xffd84f,0x3df5cd,0x55baff,0xb780ff,0xff8c44,0xff70e1];
  const centers=[[-25,24,-10],[0,31,-19],[25,26,-11],[-13,35,-24],[14,34,-24],[-34,29,-19],[34,30,-21]];
  let age=20;
  function burst(){
    age=0;points.visible=true;seeds.length=0;
    for(let b=0;b<burstCount;b++)for(let i=0;i<perBurst;i++){
      const u=1-2*(i+.5)/perBurst,theta=i*2.39996323+b,ring=i%5===0,radial=Math.sqrt(1-u*u),speed=ring?13:8+Math.random()*6;
      seeds.push({center:centers[b],delay:b*.36,velocity:new THREE.Vector3(Math.cos(theta)*radial,ring?.12:u,Math.sin(theta)*radial).multiplyScalar(speed),color:new THREE.Color(palette[(b+Math.floor(i/43))%palette.length]),phase:Math.random()*6});
    }
    update(0);
  }
  function update(dt){
    age+=dt;if(age>8.5){points.visible=false;return;}points.visible=true;
    seeds.forEach((s,i)=>{const local=age-s.delay;
      for(let j=0;j<trailCount;j++){
        const index=(i*trailCount+j)*3,t=local-j*.065;
        if(t<0||t>5.8){positions[index]=s.center[0];positions[index+1]=s.center[1];positions[index+2]=s.center[2];colors[index]=colors[index+1]=colors[index+2]=0;continue;}
        const travel=(1-Math.exp(-t*.3))/.3;
        positions[index]=s.center[0]+s.velocity.x*travel;positions[index+1]=s.center[1]+s.velocity.y*travel-t*t*1.15;positions[index+2]=s.center[2]+s.velocity.z*travel;
        const brightness=Math.pow(1-t/5.8,.7)*(1-j/trailCount)*(.8+.2*Math.sin(t*12+s.phase));colors[index]=s.color.r*brightness;colors[index+1]=s.color.g*brightness;colors[index+2]=s.color.b*brightness;
      }
    });geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;
  }
  return{burst,update,get active(){return age<8.5;},get phase(){return age>=8.5?'idle':age<1.4?'launch':age<4.5?'bloom':'embers';},particleCount:count};
}

import {THREE} from './kit.js';

export function createConfetti(stage){
  const capacity=192,duration=7.2,cycle=16;
  const material=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide});
  const particles=new THREE.InstancedMesh(new THREE.PlaneGeometry(.13,.55),material,capacity);
  particles.name='stage-paper-confetti';particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  particles.frustumCulled=false;particles.castShadow=false;particles.receiveShadow=false;particles.count=0;
  const palette=[0xffcc53,0xf39b3c,0xf66cad,0x39d9d0,0xffe9a4],color=new THREE.Color(),dummy=new THREE.Object3D();
  const profiles=new Array(capacity);
  const sample=n=>{const value=Math.sin(n*127.1+31.7)*43758.5453;return value-Math.floor(value);};
  for(let i=0;i<capacity;i++){
    profiles[i]={x:(sample(i*11+1)-.5)*17.4,y:10.3+sample(i*11+2)*2.4,z:-1.5+sample(i*11+3)*6,
      delay:i<12?0:sample(i*11+4)*.75,drift:(sample(i*11+5)-.5)*.85,phase:sample(i*11+6)*Math.PI*2,
      spin:1.5+sample(i*11+7)*4,scale:.7+sample(i*11+8)*.65};
    particles.setColorAt(i,color.setHex(palette[i%palette.length]));
  }
  stage.add(particles);
  let lastTime=0,manualStart=-Infinity,enabled=true,active=false;
  return {particles,
    get active(){return active;},
    burst(){manualStart=lastTime;},
    update(t,nextEnabled=true){
      if(Number.isFinite(t))lastTime=Math.max(0,t);
      enabled=Boolean(nextEnabled);particles.visible=enabled;
      if(!enabled){particles.count=0;active=false;return;}
      const manualAge=lastTime-manualStart;
      const age=manualAge>=0&&manualAge<duration?manualAge:lastTime%cycle-1.2;
      let count=0;
      if(age>=0&&age<duration){
        for(let i=0;i<capacity;i++){
          const p=profiles[i],a=age-p.delay;
          if(a<0)continue;
          const y=p.y-a*1.12-a*a*.115;
          if(y<1.5)continue;
          dummy.position.set(p.x+p.drift*a+Math.sin(a*2.1+p.phase)*.24,y,p.z+Math.cos(a*1.6+p.phase)*.35);
          dummy.rotation.set(p.phase+a*p.spin,p.phase*.7+a*1.9,Math.sin(a*2+p.phase)*.9+a*.5);
          const fade=Math.min(1,(duration-age)*2.2);
          dummy.scale.set(p.scale*fade,p.scale*fade*(i%4===0?1.8:1),p.scale*fade);dummy.updateMatrix();
          particles.setMatrixAt(count++,dummy.matrix);
        }
      }
      particles.count=count;active=count>0;particles.instanceMatrix.needsUpdate=true;
    }
  };
}

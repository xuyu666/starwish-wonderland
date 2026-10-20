import {THREE} from './kit.js';
import {skyFragmentShader} from './sky-shader.js';

function glowTexture(){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(255,255,230,1)');gradient.addColorStop(.15,'rgba(255,222,150,.85)');gradient.addColorStop(.4,'rgba(255,178,76,.25)');gradient.addColorStop(1,'rgba(255,154,65,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

export function createAtmosphere(scene,world){
  const glow=glowTexture(),lights=[],lightSprites=[],pools=[],windows=[],bulbs=[],cloudMaterials=[];let seaMaterial=null,sea=null;
  const warm=new THREE.Color(0xffb95e),windowDay=new THREE.Color(0x53b9ec),windowNight=new THREE.Color(0xffd494);
  const uniforms={night:{value:0},sunset:{value:0},time:{value:0},horizon:{value:new THREE.Color(0xb5deee).convertLinearToSRGB()}};
  const sky=new THREE.Mesh(new THREE.SphereGeometry(560,32,20),new THREE.ShaderMaterial({
    uniforms,side:THREE.BackSide,depthWrite:false,fog:false,
    vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:skyFragmentShader
  }));sky.renderOrder=-20;sky.frustumCulled=false;scene.add(sky);
  const sunsetSun=new THREE.Group();scene.add(sunsetSun);sunsetSun.position.set(-22,27,-128);
  const sunDisk=new THREE.Mesh(new THREE.SphereGeometry(12,32,20),new THREE.MeshBasicMaterial({color:0xffdb88,toneMapped:false,transparent:true,depthWrite:false}));sunsetSun.add(sunDisk);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xffc686,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));halo.scale.set(74,74,1);sunsetSun.add(halo);
  const reflection=new THREE.Mesh(new THREE.PlaneGeometry(65,135),new THREE.MeshBasicMaterial({map:glow,color:0xffc67b,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));reflection.rotation.x=-Math.PI/2;reflection.position.set(-22,-1.98,-110);scene.add(reflection);
  const ripples=new THREE.Group();scene.add(ripples);
  for(let i=0;i<24;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(3.5+Math.sin(i*3)*2.0,.3+i*.015),new THREE.MeshBasicMaterial({color:0xffdb91,transparent:true,depthWrite:false,toneMapped:false}));m.rotation.x=-Math.PI/2;m.position.set(-22+Math.sin(i*1.7)*4,-1.96,-151+i*3.4);ripples.add(m);}
  world.traverse(node=>{
    if(!node.isMesh)return;
    if(node.userData.isSea){sea=node;seaMaterial=node.material;}
    for(const material of Array.isArray(node.material)?node.material:[node.material]){
      if(material.color?.getHex()===0xfff3e8&&!cloudMaterials.includes(material))cloudMaterials.push(material);
      if(material.color?.getHex()===0x53b9ec&&!windows.includes(material))windows.push(material);
      if(material.emissive&&[0xffbf57,0xffb734].includes(material.emissive.getHex())&&!bulbs.includes(material))bulbs.push(material);
    }
  });
  // Warm pools and soft halos make the light sources visible without many shadow maps.
  const lampLocations=[];
  for(let i=0;i<40;i++){let x,z;if(i<20){x=i%2?5:-5;z=-10+Math.floor(i/2)*6;}else{x=-48+(i-20)*5;z=i%2?-1:9;}lampLocations.push([x,3.6,z]);}
  for(const [x,y,z]of lampLocations){
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xffd291,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));sprite.position.set(x,y,z);sprite.scale.set(2.8,2.8,1);scene.add(sprite);lightSprites.push(sprite);
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(7,7),new THREE.MeshBasicMaterial({map:glow,color:0xffbd68,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));pool.rotation.x=-Math.PI/2;pool.position.set(x,.44,z);scene.add(pool);pools.push(pool);
  }
  for(const [x,y,z,intensity]of [[0,8,-10,460],[-24,7,4,280],[24,8,5,280],[28,6,30,220],[-30,5,29,240],[0,4,8,150],[0,5,45,180]]){
    const light=new THREE.PointLight(0xffb968,0,34,2);light.position.set(x,y,z);light.userData.powerAtNight=intensity;scene.add(light);lights.push(light);
  }
  let night=0,sunset=0;
  return{update(theme,dt,t,camera){
    const k=1-Math.exp(-dt*2.6);night=THREE.MathUtils.lerp(night,theme==='night'?1:0,k);sunset=THREE.MathUtils.lerp(sunset,theme==='sunset'?1:0,k);
    if(seaMaterial)seaMaterial.color.set(0x168fb8).lerp(new THREE.Color(0x9f8cbd),sunset*.6).lerp(new THREE.Color(0x28394b),night);
    cloudMaterials.forEach(m=>{m.color.set(0xfff3e8).lerp(new THREE.Color(0xffbcaf),sunset*.75).lerp(new THREE.Color(0x72617c),night*.8);m.emissive.set(0xffbb8a);m.emissiveIntensity=sunset*.22;});
    uniforms.horizon.value.copy(scene.fog?.color??new THREE.Color(theme==='night'?0x25223e:theme==='sunset'?0xeeb59e:0xb5deee)).convertLinearToSRGB();
    if(sea){sea.position.x=camera.position.x;sea.position.z=camera.position.z;seaMaterial.userData.waterUniforms.horizon.value.copy(uniforms.horizon.value);}
    uniforms.night.value=night;uniforms.sunset.value=sunset;uniforms.time.value=t;sky.position.copy(camera.position);
    const opacity=sunset*(1-night);sunsetSun.visible=opacity>.005;sunDisk.material.opacity=opacity;halo.material.opacity=opacity*.75;reflection.material.opacity=opacity*.55;ripples.visible=opacity>.005;
    ripples.children.forEach((m,i)=>{m.material.opacity=opacity*(.17+.18*Math.sin(t*.8+i*.7));m.scale.x=1+Math.sin(t*.45+i)*.16;});
    lights.forEach(l=>l.intensity=l.userData.powerAtNight*(night+sunset*.12));
    lightSprites.forEach(s=>s.material.opacity=night*.8+sunset*.1);pools.forEach(p=>p.material.opacity=night*.38);
    windows.forEach(m=>{m.color.copy(windowDay).lerp(windowNight,night);m.emissive.copy(warm);m.emissiveIntensity=night*1.15;});
    bulbs.forEach(m=>{m.emissive.set(0xffad43);m.emissiveIntensity=.45+night*2.3+sunset*.3;});
  }};
}

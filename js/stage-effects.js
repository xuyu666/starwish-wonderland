import {THREE,mesh,group,cylinder} from './kit.js';

const vertex=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
function luminous(fragment,uniforms={}){
  return new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,
    transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
}
export function buildStageEffects(stage){
  const effects=group(stage),beams=[],lights=[],haze=[];
  const up=new THREE.Vector3(0,1,0),direction=new THREE.Vector3();
  const sunMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:`
    varying vec2 vUv;
    void main(){
      float y=vUv.y; vec3 c=mix(vec3(.9,.065,.012),vec3(1.,.65,.055),smoothstep(.02,.75,y));
      c=mix(c,vec3(1.,.9,.36),smoothstep(.65,1.,y));
      float stripe=step(.88,fract(y*38.))*(1.-smoothstep(.1,.65,y));
      c*=1.-stripe*.32; gl_FragColor=vec4(c,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`});
  const sun=mesh(effects,new THREE.CircleGeometry(5.15,96),sunMaterial,0,9.4,-5.32);sun.castShadow=false;
  const halo=mesh(effects,new THREE.PlaneGeometry(16,16),luminous(`varying vec2 vUv;
    void main(){float r=length(vUv-.5)*2.;float a=exp(-r*r*4.)*.25;
      gl_FragColor=vec4(1.,.43,.055,a);}`),0,9.4,-5.46);halo.castShadow=false;
  const beamGeometry=new THREE.CylinderGeometry(.09,2.05,10.4,24,1,true);
  for(let i=0;i<6;i++){
    const x=-8.75+i*3.5,head=group(effects,x,12.1,.4);
    const housing=cylinder(head,.32,.4,.85,0x3b2924,0,0,0,16);housing.rotation.x=.3;
    const lens=cylinder(head,.29,.29,.04,new THREE.MeshBasicMaterial({color:0xffdc78}),0,-.43,.13,20);
    lens.rotation.x=.3;
    const material=luminous(`varying vec2 vUv;uniform float strength;
      void main(){float edge=pow(max(0.,sin(vUv.x*3.14159265)),2.);
        float fade=pow(vUv.y,.8)*(1.-smoothstep(.88,1.,vUv.y));
        gl_FragColor=vec4(1.,.61,.17,edge*fade*strength);}`,{strength:{value:.12}});
    const cone=mesh(effects,beamGeometry,material,x,6.6,.8);cone.castShadow=false;
    const target=new THREE.Object3D();target.position.set(x*.75,1.4,2);effects.add(target);
    if(i%2===0){const light=new THREE.SpotLight(0xffce77,170,26,.31,.8,1.5);light.position.set(x,12,.4);light.target=target;effects.add(light);lights.push(light);}
    beams.push({cone,head,target,x});
  }
  const mistMaterial=luminous(`varying vec2 vUv;uniform float time;
    void main(){vec2 p=(vUv-.5)*2.;float r=dot(p,p);
      float w=.65+.35*sin(p.x*7.+sin(p.y*5.+time)*1.4+time*.35);
      float a=pow(max(0.,1.-r),2.)*w*.055;gl_FragColor=vec4(1.,.64,.35,a);}`,{time:{value:0}});
  for(let i=0;i<9;i++){
    const puff=mesh(effects,new THREE.PlaneGeometry(7,2.8),mistMaterial,-9+i*2.2,2.1+i%3*.7,-3.2+i%2*2.1);
    puff.castShadow=false;haze.push(puff);
  }
  const pools=[];
  for(let i=0;i<5;i++){
    const pool=mesh(effects,new THREE.PlaneGeometry(5,7),luminous(`varying vec2 vUv;
      void main(){float a=pow(max(0.,1.-length((vUv-.5)*2.)),2.)*.32;
      gl_FragColor=vec4(1.,.35,.025,a);}`),-8+i*4,1.43,1.4);
    pool.rotation.x=-Math.PI/2;pool.castShadow=false;pools.push(pool);
  }
  const dustPositions=new Float32Array(64*3);
  for(let i=0;i<64;i++)dustPositions.set([Math.sin(i*9.7)*10,2+(i%13)*.58,Math.cos(i*4.3)*3],i*3);
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xffd57d,size:.075,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));effects.add(dust);
  return{sun,beams,lights,haze,update(t,theme,performance){
    const boost=theme==='night'?1.1:theme==='sunset'?.85:.6;
    const value=n=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
    const reactive=performance?.loaded===true,active=performance?.active===true;
    const level=active?value(performance.level):0,bass=active?value(performance.bass):0,beat=active?value(performance.beat):0;
    const energy=reactive?.76+level*.46+bass*.18+beat*.2:1;
    beams.forEach((b,i)=>{
      const tx=b.x*.72+Math.sin(t*.55+i*1.7)*1.8,tz=1.3+Math.cos(t*.4+i)*1.2;
      b.target.position.set(tx,1.4,tz);direction.set(b.x-tx,10.6,.4-tz).normalize();
      b.cone.position.set((b.x+tx)*.5,6.7,(.4+tz)*.5);b.cone.quaternion.setFromUnitVectors(up,direction);
      b.cone.material.uniforms.strength.value=.11*boost*energy;b.head.rotation.z=Math.sin(t*.55+i*1.7)*.1;
    });
    lights.forEach((light,i)=>light.intensity=(145+Math.sin(t*2+i)*12)*boost*energy);
    haze.forEach((puff,i)=>{puff.position.x=-9+i*2.2+Math.sin(t*.17+i)*.65;puff.rotation.z=Math.sin(t*.13+i)*.13;});
    mistMaterial.uniforms.time.value=t;dust.rotation.y=Math.sin(t*.08)*.06;
  }};
}

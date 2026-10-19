import {THREE,mesh,group,cylinder} from './kit.js';

const vertex=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
function luminous(fragment,uniforms={}){
  return new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,
    transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
}
const cueNames=['gold-open-fan','amber-coral-chase','crossed-amber','guitar-solo','bass-solo','wide-finale'];
const clamp=n=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const mix=(a,b,n)=>a+(b-a)*n;
function cuePose(cue,i,t,x){
  const sway=Math.sin(t*.28+i*.8),alternate=.5+.5*Math.sin(t*1.35+i*Math.PI);
  const base={x:x*.91+sway*.5,z:2.7+Math.cos(t*.22+i)*.5,width:1,strength:.86,hue:.1,saturation:.72};
  switch(cue){
    case 1:return{...base,x:x*.78+sway*.9,z:1.8+Math.sin(t*.32+i)*1.2,strength:.55+alternate*.55,hue:mix(.027,.105,alternate),saturation:.78};
    case 2:return{...base,x:-x*.7+sway*.4,z:i%2===0?3.5:-.3,width:.76,strength:.87,hue:i%2===0?.062:.035};
    case 3:return{...base,x:mix(x*.7,5,i===4?1:.64)+sway*.22,z:1.5,width:i===4?.52:.82,strength:i===4?1.35:.46,hue:i===4?.105:.045,saturation:.66};
    case 4:return{...base,x:mix(x*.7,-5,i===0?1:.64)+sway*.22,z:1.5,width:i===0?.52:.82,strength:i===0?1.35:.46,hue:i===0?.09:.027,saturation:.7};
    case 5:return{...base,x:x*1.02+sway*.65,z:3.1+Math.cos(t*.2+i)*.75,width:1.2,strength:1.05,hue:i%3===1?.055:.115,saturation:.58};
    default:return base;
  }
}
export function buildStageEffects(stage){
  const effects=group(stage),beams=[],lights=[],haze=[];
  const up=new THREE.Vector3(0,1,0),down=new THREE.Vector3(0,-1,0),direction=new THREE.Vector3();
  const reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
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
    cylinder(head,.32,.4,.85,0x3b2924,0,0,0,16);
    const lens=cylinder(head,.29,.29,.04,new THREE.MeshBasicMaterial({color:0xffdc78}),0,-.43,0,20);
    const material=luminous(`varying vec2 vUv;uniform float strength;uniform vec3 tint;
      void main(){float edge=pow(max(0.,sin(vUv.x*3.14159265)),2.);
        float fade=pow(vUv.y,.8)*(1.-smoothstep(.88,1.,vUv.y));
        gl_FragColor=vec4(tint,edge*fade*strength);}`,{strength:{value:.12},tint:{value:new THREE.Color(0xffce77)}});
    const cone=mesh(effects,beamGeometry,material,x,6.6,.8);cone.castShadow=false;
    const target=new THREE.Object3D();target.position.set(x*.75,1.4,2);effects.add(target);
    if(i%2===0){const light=new THREE.SpotLight(0xffce77,170,26,.31,.8,1.5);light.position.set(x,12,.4);light.target=target;effects.add(light);lights.push(light);}
    beams.push({cone,head,target,lens,x});
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
    const pool=mesh(effects,new THREE.PlaneGeometry(5,7),luminous(`varying vec2 vUv;uniform float strength;uniform vec3 tint;
      void main(){vec2 p=(vUv-.5)*2.;float r=length(p);
        float petal=.83+.17*cos(atan(p.y,p.x)*5.);float a=pow(max(0.,1.-r),2.)*petal*strength;
        gl_FragColor=vec4(tint,a);}`,{strength:{value:.24},tint:{value:new THREE.Color(0xff8729)}}),-8+i*4,1.43,1.4);
    pool.rotation.x=-Math.PI/2;pool.castShadow=false;pools.push(pool);
  }
  const dustPositions=new Float32Array(64*3);
  for(let i=0;i<64;i++)dustPositions.set([Math.sin(i*9.7)*10,2+(i%13)*.58,Math.cos(i*4.3)*3],i*3);
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xffd57d,size:.075,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));effects.add(dust);
  const state={sun,beams,lights,haze,pools,cue:cueNames[0],update(t,theme,performance){
    t=Number.isFinite(t)?Math.max(0,t):0;
    const boost=theme==='night'?1.1:theme==='sunset'?.85:.6;
    const reactive=performance?.loaded===true,active=performance?.active===true;
    const level=active?clamp(performance.level):0,bass=active?clamp(performance.bass):0,beat=active?clamp(performance.beat):0;
    const idle=reactive&&(!active||level+bass+beat<.025),motion=reducedMotion||idle?0:t;
    const phrase=motion/12,index=Math.floor(phrase)%cueNames.length;
    const crossfade=clamp(((phrase%1)-.78)/.22),blend=crossfade*crossfade*(3-2*crossfade);
    const energy=idle?.55:reactive?.76+level*.36+bass*.13+beat*.045:1;
    state.cue=idle?'warm-idle':cueNames[index];
    beams.forEach((b,i)=>{
      const a=cuePose(index,i,motion,b.x),next=cuePose((index+1)%cueNames.length,i,motion,b.x);
      const tx=mix(a.x,next.x,blend),tz=mix(a.z,next.z,blend),width=mix(a.width,next.width,blend);
      b.target.position.set(tx,1.4,tz);direction.subVectors(b.head.position,b.target.position);
      const length=direction.length();direction.normalize();
      b.cone.position.copy(b.head.position).add(b.target.position).multiplyScalar(.5);
      b.cone.quaternion.setFromUnitVectors(up,direction);b.cone.scale.set(width,length/10.4,width);
      direction.negate();b.head.quaternion.setFromUnitVectors(down,direction);
      const tint=b.cone.material.uniforms.tint.value;
      tint.setHSL(mix(a.hue,next.hue,blend),mix(a.saturation,next.saturation,blend),.63+level*.045);
      b.lens.material.color.copy(tint);
      b.cone.material.uniforms.strength.value=.105*boost*energy*mix(a.strength,next.strength,blend);
    });
    lights.forEach((light,i)=>{
      const beam=beams[i*2],strength=beam.cone.material.uniforms.strength.value;
      light.position.copy(beam.head.position);light.color.copy(beam.lens.material.color);
      light.intensity=(68+strength*760)*boost;
      light.angle=Math.atan2(2.05*beam.cone.scale.x,10.4*beam.cone.scale.y);
    });
    pools.forEach((pool,i)=>{
      const beam=beams[Math.min(i,5)];pool.position.x=mix(-8+i*4,beam.target.position.x,.5);
      pool.position.z=mix(1.4,beam.target.position.z,.6);pool.rotation.z=Math.sin(motion*.13+i)*.2;
      const width=mix(index===5?1.15:.85,(index+1)%cueNames.length===5?1.15:.85,blend);
      pool.scale.setScalar(width+level*.14);
      pool.material.uniforms.tint.value.copy(beam.lens.material.color);
      pool.material.uniforms.strength.value=(idle?.12:.2+level*.08)*boost;
    });
    haze.forEach((puff,i)=>{puff.position.x=-9+i*2.2+Math.sin(motion*.17+i)*.65;puff.rotation.z=Math.sin(motion*.13+i)*.13;});
    mistMaterial.uniforms.time.value=motion;dust.rotation.y=Math.sin(motion*.08)*.06;dust.material.opacity=idle?.3:.48+level*.12;
  }};return state;
}

import {THREE,mesh,group} from './kit.js';

export function createSea(parent){
  const material=new THREE.MeshStandardMaterial({color:0x168fb8,roughness:.36,metalness:.18});
  const uniforms={time:{value:0},horizon:{value:new THREE.Color(0xb5deee).convertLinearToSRGB()}};
  material.userData.waterUniforms=uniforms;
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 seaPosition;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nseaPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
uniform float time;uniform vec3 horizon;varying vec3 seaPosition;
float waterHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float waterNoise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(waterHash(i),waterHash(i+vec2(1,0)),f.x),mix(waterHash(i+vec2(0,1)),waterHash(i+vec2(1,1)),f.x),f.y);
}`)
      .replace('#include <opaque_fragment>',`vec2 p=seaPosition.xz;
        float drift=waterNoise(p*.045+vec2(time*.012,-time*.008));
        float wave=sin(p.x*.28+p.y*.16+drift*4.0+time*.38)*sin(p.y*.39-p.x*.13+time*.32);
        float patches=smoothstep(.60,.86,waterNoise(p*.48+vec2(-time*.035,time*.025)));
        float crest=sin(p.x*.34+p.y*.45+waterNoise(p*.12)*6.0-time*.4);
        float sparkle=patches*pow(max(0.0,crest),14.0);
        outgoingLight*=.99+wave*.010;outgoingLight+=vec3(.012,.020,.022)*sparkle;
        #include <opaque_fragment>`)
      .replace('#include <fog_fragment>','#include <fog_fragment>\ngl_FragColor.rgb=mix(gl_FragColor.rgb,horizon,smoothstep(170.0,350.0,length(seaPosition-cameraPosition)));');
  };
  material.customProgramCacheKey=()=> 'continuous-ocean-v2';
  const sea=mesh(parent,new THREE.PlaneGeometry(2600,2600),material,0,-2.1,0);
  sea.name='continuous-sea';sea.userData.isSea=true;sea.rotation.x=-Math.PI/2;sea.castShadow=false;
  return sea;
}

export function createDistantScenery(parent){
  const scenery=group(parent);scenery.name='distant-scenery';
  const rockMaterial=new THREE.MeshStandardMaterial({color:0x7aa7a1,roughness:1});
  const farMaterial=new THREE.MeshStandardMaterial({color:0x95b8b5,roughness:1});
  const shape=new THREE.SphereGeometry(1,16,10),dummy=new THREE.Object3D();
  for(const [layer,material,count]of [[0,rockMaterial,7],[1,farMaterial,5]]){
    const islands=new THREE.InstancedMesh(shape,material,count);islands.name='distant-islets-'+layer;
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2+layer*.49+.22,r=205+layer*77+Math.sin(i*4.3)*16;
      dummy.position.set(Math.cos(a)*r,-2.5,Math.sin(a)*r);
      dummy.scale.set(15+Math.sin(i*2.2)*5,4+((i+layer)%3)*2,9+Math.cos(i)*3);
      dummy.rotation.set(0,a,0);dummy.updateMatrix();islands.setMatrixAt(i,dummy.matrix);
    }
    scenery.add(islands);
  }
  const vertices=new Float32Array([-1,0,0,-.3,.1,-.1,0,0,.28,0,0,.28,.3,.1,-.1,1,0,0]);
  const birdGeometry=new THREE.BufferGeometry();birdGeometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));
  birdGeometry.computeVertexNormals();
  const birds=new THREE.InstancedMesh(birdGeometry,new THREE.MeshBasicMaterial({color:0x5d7779,side:THREE.DoubleSide}),11);
  birds.name='distant-birds';birds.frustumCulled=false;scenery.add(birds);
  return {update(t){
    const a=t*.018;birds.position.set(Math.sin(a)*153,29+Math.sin(t*.07)*3,Math.cos(a)*168);
    birds.rotation.y=a+Math.PI/2;
    for(let i=0;i<birds.count;i++){
      const row=Math.ceil(i/2),side=i%2?1:-1;
      dummy.position.set(row*side*2.1,Math.sin(t*.8+i)*.25,-row*2.5);
      dummy.rotation.set(Math.sin(t*.6+i)*.06,0,Math.sin(t*.7+i)*.1);dummy.scale.setScalar(.65);
      dummy.updateMatrix();birds.setMatrixAt(i,dummy.matrix);
    }
    birds.instanceMatrix.needsUpdate=true;
    for(let i=0;i<vertices.length;i+=3)vertices[i+1]=Math.abs(vertices[i])*(.12+Math.sin(t*3.6)*.28);
    birdGeometry.attributes.position.needsUpdate=true;
  }};
}

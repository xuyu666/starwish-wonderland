export const skyFragmentShader = `varying vec3 direction;
uniform float night;
uniform float sunset;
uniform float time;
uniform vec3 horizon;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){
  vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
void main(){
  vec3 d=normalize(direction);float h=smoothstep(-.03,.65,d.y);
  vec3 day=mix(horizon,vec3(.28,.67,.88),h);
  vec3 dusk=mix(horizon,mix(vec3(.97,.49,.59),vec3(.30,.27,.55),h),smoothstep(.01,.45,d.y));
  vec3 midnight=mix(horizon,vec3(.055,.065,.14),h);
  vec3 color=mix(mix(day,dusk,sunset),midnight,night);
  vec3 cloudPoint=d*vec3(7.0,20.0,7.0);
  float n=noise(cloudPoint+vec3(time*.012,0.0,time*.004))*.57
    +noise(cloudPoint*2.03+vec3(time*.005,time*.002,0.0))*.28
    +noise(cloudPoint*4.07+vec3(0.0,0.0,-time*.008))*.15;
  float band=smoothstep(.015,.12,d.y)*(1.0-smoothstep(.40,.78,d.y));
  float cloud=smoothstep(.44,.70,n)*band;
  vec3 cloudColor=mix(vec3(1.0,.96,.87),vec3(1.0,.76,.65),sunset);
  color=mix(color,cloudColor,cloud*(1.0-night*.88)*.77);
  vec3 stars=d*180.0,cell=floor(stars);
  float st=step(.990,hash(cell))*(1.0-smoothstep(.035,.20,length(fract(stars)-.5)));
  color+=st*night*(.65+.35*sin(time*.7+hash(cell)*30.0))*smoothstep(.10,.35,d.y)*vec3(1.0,.86,.67);
  color=mix(horizon,color,smoothstep(-.015,.075,d.y));
  gl_FragColor=vec4(color,1.0);
}`;

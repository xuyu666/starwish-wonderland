import { THREE, mat, mesh, box, sphere, cylinder, cone, torus, beam, group, register, textSign } from './kit.js';

const C = { pink: '#f6a4cb', pale: '#ffe0eb', cream: '#fff0ca', gold: '#ffc64b', blue: '#4566d9', purple: '#7955c8', dark: '#493a79', teal: '#30c5c2', brown: '#9b563a' };
const animated = [];

function arch(parent, x, y, z, width, height, color = C.dark, trim = C.gold) {
  const r = width / 2, straight = height - r;
  const shape = new THREE.Shape();
  shape.moveTo(-r, 0); shape.lineTo(r, 0); shape.lineTo(r, straight);
  shape.absarc(0, straight, r, 0, Math.PI, false); shape.lineTo(-r, 0);
  mesh(parent, new THREE.ShapeGeometry(shape, 16), mat(color), x, y, z);
  for (const side of [-1, 1]) box(parent, .13, straight, .16, trim, x + side * r, y + straight / 2, z + .04);
  mesh(parent, new THREE.TorusGeometry(r, .075, 5, 20, Math.PI), mat(trim), x, y + straight, z + .07);
  box(parent, width + .25, .15, .25, trim, x, y, z);
}

function window(parent, x, y, z, width = .8, height = 1.65) {
  arch(parent, x, y, z, width, height, '#53b9ec', C.cream);
  box(parent, .08, height - .25, .13, C.gold, x, y + height / 2 - .1, z + .12);
  box(parent, width, .08, .13, C.gold, x, y + height * .48, z + .12);
  box(parent, width + .35, .18, .38, C.pale, x, y - .03, z + .1);
}

function flag(parent, x, y, z, color, scale = 1) {
  cylinder(parent, .045, .045, 1.8 * scale, C.gold, x, y + .9 * scale, z, 8);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.lineTo(1.1 * scale, -.18 * scale); shape.lineTo(.78 * scale, -.45 * scale); shape.lineTo(0, -.65 * scale);
  const pennant = mesh(parent, new THREE.ShapeGeometry(shape), mat(color), x, y + 1.7 * scale, z);
  pennant.material = pennant.material.clone(); pennant.material.side = THREE.DoubleSide;
  animated.push({ item: pennant, type: 'flag', phase: x + z });
  sphere(parent, .1 * scale, C.gold, x, y + 1.86 * scale, z);
}

function tower(parent, x, z, radius, height, roofHeight, color = C.blue) {
  const t = group(parent, x, .3, z);
  cylinder(t, radius + .2, radius + .4, .6, C.cream, 0, .3, 0);
  cylinder(t, radius, radius + .15, height, C.pink, 0, height / 2 + .5, 0);
  for (const h of [1, height * .5, height - .1]) cylinder(t, radius + .12, radius + .12, .18, C.gold, 0, h + .5, 0);
  cylinder(t, radius + .4, radius + .05, .6, C.pale, 0, height + .45, 0);
  cone(t, radius + .65, roofHeight, color, 0, height + .7 + roofHeight / 2, 0);
  for (let i = 1; i <= 2; i++) {
    const fraction = i / 3;
    cylinder(t, (radius + .65) * (1 - fraction) + .04, (radius + .65) * (1 - fraction) + .04, .11, C.gold, 0, height + .7 + roofHeight * fraction, 0);
  }
  sphere(t, .23, C.gold, 0, height + roofHeight + .85, 0);
  flag(t, 0, height + roofHeight + .9, 0, '#ff73bb', .75);
  window(t, 0, height * .53, radius + .16, radius * .57, 1.8);
  if (height > 11) window(t, 0, height * .28, radius + .16, radius * .55, 1.7);
  return t;
}

function castle(world) {
  const root = group(world, 0, 0, -18);
  cylinder(root, 16.8, 17.1, .55, '#d1b9f4', 0, .35, -4, 64).scale.z = .73;
  cylinder(root, 15.7, 16.3, .22, C.cream, 0, .72, -4, 64).scale.z = .72;
  box(root, 21, 7.6, 9, C.pale, 0, 4.6, -3.5);
  box(root, 16, 4.5, 6, C.pink, 0, 10.1, -5);
  for (const y of [1, 7.8, 8.5, 12.4]) box(root, y > 9 ? 16.6 : 21.7, .27, y > 9 ? 6.5 : 9.6, C.gold, 0, y, y > 9 ? -5 : -3.5);
  for (let x = -9; x <= 9; x += 2) {
    box(root, 1.1, 1.05, .9, C.pink, x, 8.9, 1.2);
    if (Math.abs(x) > 3) window(root, x, 3.8, 1.03, 1.05, 2.1);
  }
  for (const x of [-5.6, -2.8, 0, 2.8, 5.6]) window(root, x, 9.4, -1.93, .9, 2);
  for (const x of [-8.4, 8.4]) {
    cylinder(root, .36, .45, 6.2, C.cream, x, 4.2, 1.32, 12);
    sphere(root, .45, C.gold, x, 7.4, 1.32);
  }
  arch(root, 0, .94, 1.14, 4.2, 5.6, '#4f3477', C.gold);
  arch(root, 0, 1.02, 1.18, 3.6, 5.1, '#aa507c', C.cream);
  for (const x of [-1.1, -.55, 0, .55, 1.1]) box(root, .09, 3.1, .13, C.gold, x, 2.65, 1.28);
  box(root, 4.6, .35, 4.5, '#edb7dc', 0, .65, 3.15);
  for (let i = 0; i < 4; i++) box(root, 5 + i * .35, .2, .65, C.cream, 0, .62 - i * .1, 5 + i * .5);
  const towers = [ [-11,1,2,9,4.8], [11,1,2,9,4.8], [-9,-6,1.8,12,5.2], [9,-6,1.8,12,5.2], [-7,-10,1.5,13.5,5], [7,-10,1.5,13.5,5], [0,-10,2,16,5.4], [-4,-3,1.45,13,4.5], [0,-3.7,2.1,19.5,6] ];
  towers.forEach((a, i) => tower(root, ...a, i % 2 ? C.purple : C.blue));
  const clock = cylinder(root, 1.05, 1.05, .18, C.gold, 0, 14.6, -1.5, 40); clock.rotation.x = Math.PI / 2;
  const face = cylinder(root, .87, .87, .2, C.cream, 0, 14.6, -1.38, 40); face.rotation.x = Math.PI / 2;
  beam(root, [0,14.6,-1.25], [0,15.23,-1.25], .055, C.dark);
  beam(root, [0,14.6,-1.24], [.46,14.35,-1.24], .055, C.dark);
  for (const x of [-6.3, 6.3]) {
    box(root, 1.6, 3.1, .12, '#9458d4', x, 5.1, 1.12);
    sphere(root, .35, C.gold, x, 5.3, 1.23, 1, 1.4, .2);
  }
  textSign(root, '梦幻星愿城堡', 0, 7.6, 1.5, 5.6, C.dark, '#fff0cf');
  register('castle', '梦幻星愿城堡', 'castle', root, { description: '九座金边尖塔环绕粉色宫殿，彩窗、钟楼与皇家旗帜共同构成乐园天际线。' });
}

function sail(parent, x, y, z, width, height, color) {
  const vertices = [], indices = [], segments = 10;
  for (let j = 0; j <= segments; j++) for (let i = 0; i <= segments; i++) {
    const u = i / segments, v = j / segments;
    vertices.push(x + (u - .5) * width * (1 - .15 * v), y + v * height, z + Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * .65);
  }
  for (let j = 0; j < segments; j++) for (let i = 0; i < segments; i++) {
    const n = j * (segments + 1) + i;
    indices.push(n, n + 1, n + segments + 1, n + 1, n + segments + 2, n + segments + 1);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  const material = mat(color).clone(); material.side = THREE.DoubleSide;
  return mesh(parent, geometry, material);
}

function harbor(world) {
  const root = group(world, -35, 0, -25);
  const water = cylinder(root, 13, 13.5, .24, '#26bfd1', 0, .17, 0, 64); water.scale.z = .78;
  const edge = torus(root, 13.25, .28, '#f5d09b', 0, .25, 0); edge.rotation.x = Math.PI / 2; edge.scale.y = .78;
  const ship = group(root, -.8, .65, 0); ship.rotation.y = -.32;
  const hullShape = new THREE.Shape(); hullShape.moveTo(-6, 0); hullShape.quadraticCurveTo(-4.5, -2, 0, -2); hullShape.quadraticCurveTo(5, -2, 6.3, .9); hullShape.lineTo(4.9, 1.25); hullShape.lineTo(-5.1, 1.15); hullShape.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 3.5, bevelEnabled: true, bevelThickness: .35, bevelSize: .3, bevelSegments: 2, steps: 1 });
  mesh(ship, hullGeo, mat('#8f432d'), 0, 2.05, -1.75);
  box(ship, 10.3, .22, 3.7, '#d7a466', -.2, 3.25, 0);
  for (const z of [-1.9,1.9]) {
    beam(ship, [-5.1,3.5,z], [5.1,3.7,z], .1, C.gold);
    beam(ship, [-5.1,4.2,z], [5.1,4.4,z], .1, '#70452c');
    for (let x = -4.5; x < 5; x += 1.3) cylinder(ship, .065, .065, .8, '#ad774a', x, 3.85, z, 8);
    for (const x of [-3,-1.4,.2,1.8,3.4]) {
      const p = cylinder(ship, .27, .27, .16, C.gold, x, 2.55, z, 12); p.rotation.x = Math.PI / 2;
      sphere(ship, .2, '#282d47', x, 2.55, z + Math.sign(z) * .1, 1,1,.3);
    }
  }
  box(ship, 2.6, 1.65, 3, '#bc6e3e', -3.5, 4.05, 0);
  box(ship, 2.9, .2, 3.3, C.gold, -3.5, 4.95, 0);
  window(ship, -3.5, 3.7, 1.53, .85, 1.1);
  for (const [x, h, w] of [[-2.6,10,4.2],[1.5,12,5.3]]) {
    cylinder(ship, .13, .19, h, '#754830', x, h / 2 + 3.4, 0, 12);
    beam(ship, [x-w/2, h*.57+3.4, 0], [x+w/2,h*.57+3.4,0], .09, '#754830');
    beam(ship, [x-w*.4,h*.9+3.4,0], [x+w*.4,h*.9+3.4,0], .075, '#754830');
    sail(ship, x, h*.27+3.5, .08, w, h*.3, '#fff3ca');
    sail(ship, x, h*.62+3.5, .08, w*.77, h*.27, '#ffe4ae');
    for (const z of [-1.7,1.7]) beam(ship, [x,h+3.4,0], [x + (x < 0 ? -2 : 2),3.5,z], .025, '#f5d8a7');
    flag(ship, x, h + 3.4, 0, '#e54d5f', .8);
  }
  beam(ship, [4.7,3.3,0], [7.3,4.5,0], .12, '#754830');
  const mastEmblem = group(ship, 1.5, 8.2, .72);
  sphere(mastEmblem, .45, '#d0a04c', 0,0,0,1,1,.15);
  beam(mastEmblem, [-.65,-.55,0],[.65,.55,0], .07, '#d0a04c');
  beam(mastEmblem, [.65,-.55,0],[-.65,.55,0], .07, '#d0a04c');
  for (let x = -5; x < 9; x += .7) box(root, .6, .18, 2.5, '#bf8753', x, .65, 8);
  for (const x of [-4,0,4,8]) for (const z of [6.9,9.1]) {
    cylinder(root, .17, .22, 1.5, '#744d37', x, .85, z, 10);
    sphere(root, .21, '#f3bd6e', x,1.65,z);
  }
  const lighthouse = group(root, 10, 0, -5);
  cylinder(lighthouse, 2.7, 3, .45, '#f6ce8b', 0,.4,0,32);
  cylinder(lighthouse, 1.25, 1.9, 9, C.cream, 0,4.9,0,32);
  for (const y of [2.5,5,7.5]) cylinder(lighthouse, 1.85-y*.065, 1.85-y*.065, .7, '#ef5567',0,y,0,32);
  arch(lighthouse,0,.64,1.9,.9,1.8,'#704a5a',C.gold);
  cylinder(lighthouse,2,1.7,.3,C.gold,0,9.4,0,32);
  cylinder(lighthouse,1.2,1.2,1.5,'#9ce6e6',0,10.2,0,16);
  for (let i=0;i<8;i++) { const a=i*Math.PI/4; cylinder(lighthouse,.07,.07,1.6,C.gold,Math.cos(a)*1.2,10.2,Math.sin(a)*1.2,6); }
  cone(lighthouse,1.8,1.4,'#e35d6b',0,11.65,0);
  sphere(lighthouse,.25,C.gold,0,12.5,0);
  const lamp = sphere(lighthouse,.55,'#fff1a0',0,10.25,0); lamp.material = mat('#fff1a0',0,.3,'#ffb840');
  animated.push({item:lamp,type:'lamp'});
  for (const [x,z] of [[-6,8],[5,8]]) {
    cylinder(root,.5,.58,.85,'#a56d3c',x,1.1,z,12);
    for (const y of [.8,1.3]) cylinder(root,.59,.59,.08,'#493941',x,y,z,12);
  }
  textSign(root,'星湾海盗港',0,2.7,9.5,6,'#593a42','#ffe4ac');
  register('harbor','星湾海盗港','pirate',root,{description:'扬起弧面风帆的双桅海盗船、红白灯塔和木栈桥停靠在碧蓝港湾。'});
}

function candyShop(parent, x, z, index) {
  const palettes = [['#f887b3','#8f68d8'],['#6edcc6','#f790aa'],['#ffcf70','#e56a87'],['#a8a4fa','#6acdbd'],['#f6a181','#9a6cd9']];
  const [wall, roofColor] = palettes[index];
  const shop = group(parent,x,.3,z); shop.rotation.y = (index - 2) * -.065;
  box(shop,5.5,.35,5.7,'#fff0dc',0,.2,0);
  box(shop,4.8,4.4,4.5,wall,0,2.5,0);
  box(shop,5.2,.3,4.9,C.cream,0,4.7,0);
  const roof = cylinder(shop,0,4.2,2.7,roofColor,0,6.1,0,4); roof.rotation.y=Math.PI/4; roof.scale.z=.8;
  for (const side of [-1,1]) {
    box(shop,.26,4.1,.3,C.cream,side*2.15,2.6,2.3);
    window(shop,side*1.42,1.5,2.29,1.05,1.8);
    box(shop,1.3,.35,.55,'#e46a8c',side*1.42,1.4,2.5);
    for (let j=0;j<3;j++) sphere(shop,.19,['#ffdf65','#ffffff','#fa88bd'][j],side*1.42+(j-1)*.32,1.66,2.55);
  }
  arch(shop,0,.39,2.31,.95,2.6,'#784b8a',C.cream);
  sphere(shop,.09,C.gold,.28,1.5,2.48);
  for (let j=0;j<7;j++) {
    const awn = box(shop,.69,.17,1.5,j%2?C.cream:roofColor,(j-3)*.69,3.8,2.85); awn.rotation.x=.18;
    box(shop,.69,.43,.12,j%2?C.cream:roofColor,(j-3)*.69,3.45,3.55);
  }
  const names = ['棉花糖工坊','薄荷冰淇淋','蜂蜜烘焙屋','星星糖果铺','草莓茶派对'];
  textSign(shop,names[index],0,4.6,2.63,3.8,'#754364','#fff3d9');
  if(index%2===0) {
    cylinder(shop,.25,.4,1.4,'#d89353',0,7.6,0,16);
    sphere(shop,.85,index===0?'#ffd8e9':'#fff0ac',0,8.7,0);
    sphere(shop,.65,'#ff8bb6',.45,8.4,0);
    sphere(shop,.18,'#e94c68',0,9.5,0);
  } else {
    cylinder(shop,.1,.1,2,C.cream,0,7.9,0,10);
    const swirl = torus(shop,.75,.26,index===1?'#ff8fab':'#ffda77',0,9,0);
    torus(shop,.35,.16,C.cream,0,9,.06);
    sphere(shop,.17,C.cream,0,9,.1,1,1,.5);
    animated.push({item:swirl,type:'sweet',phase:index});
  }
  return shop;
}

function candyTown(world) {
  const root=group(world,-30,0,29);
  cylinder(root,15,15.5,.3,'#e6b7e7',0,.25,0,64).scale.z=.77;
  [[-7,-4],[0,-6],[7,-4],[-8,4],[8,4]].forEach(([x,z],i)=>candyShop(root,x,z,i));
  const fountain=group(root,0,.4,4.7);
  cylinder(fountain,2.7,3,.45,'#fff2cf',0,.25,0,40);
  cylinder(fountain,2.35,2.35,.15,'#68dce2',0,.55,0,40);
  cylinder(fountain,.28,.6,2.2,'#f79bbd',0,1.6,0,16);
  cylinder(fountain,1.5,.5,.35,'#fff0d0',0,2.7,0,32);
  sphere(fountain,.75,'#f9a2ca',0,3.35,0);
  sphere(fountain,.2,'#f35679',0,4.12,0);
  for (let i=0;i<8;i++) {
    const a=i*Math.PI/4;
    sphere(fountain,.14,'#a4f2ff',Math.cos(a)*1.4,1.65,Math.sin(a)*1.4,.7,2.8,.7);
  }
  for (const [x,z] of [[-12,0],[12,0],[-4,9],[4,9]]) {
    cylinder(root,.1,.1,3.5,'#fff6d6',x,1.95,z,10);
    sphere(root,.72,'#fb77b5',x,4,z,1,1,.4);
    torus(root,.47,.14,'#fff0dd',x,4,z+.3);
    sphere(root,.19,'#ffd75e',x,4,z+.35,1,1,.3);
    sphere(root,.22,'#ffc9e8',x,5,z);
  }
  textSign(root,'蜜糖童话小镇',0,1.3,11.2,6.5,'#8d4384','#fff0ce');
  register('candy-town','蜜糖童话小镇','candy',root,{description:'五间彩色糖果小店围绕甜点喷泉，每间都有条纹遮阳棚、花箱和巨型糖果屋顶。'});
}

function entrance(world) {
  const root=group(world,0,0,48);
  box(root,23,.45,8,'#e8b4d1',0,.35,0);
  for(const x of [-9.5,-4,4,9.5]) {
    box(root,1.6,1,2.2,C.cream,x,.95,0);
    box(root,1.15,6.4,1.5,C.pink,x,4.1,0);
    for(const z of [-.8,.8]) box(root,.18,6, .15,C.gold,x,4.1,z);
    box(root,1.7,.45,2,C.cream,x,7.4,0);
    cone(root,1.25,2.1,C.purple,x,8.7,0,4).rotation.y=Math.PI/4;
    sphere(root,.23,C.gold,x,9.9,0);
    flag(root,x,10,0,'#f372ae',.65);
  }
  for(const [x,w,y] of [[0,8,7.5],[-6.75,5.5,6.3],[6.75,5.5,6.3]]) {
    const arc=mesh(root,new THREE.TorusGeometry(w/2,.5,8,36,Math.PI),mat(C.pink),x,y-w/2,0); arc.scale.z=1.7;
    const goldArc=mesh(root,new THREE.TorusGeometry(w/2+.42,.09,6,36,Math.PI),mat(C.gold),x,y-w/2,.48);
    for(let j=0;j<7;j++) { const a=(j+.5)*Math.PI/7; sphere(root,.14,C.cream,x+Math.cos(a)*(w/2),y-w/2+Math.sin(a)*(w/2),.57); }
  }
  box(root,8.4,1.3,.7,C.purple,0,8.35,.15);
  box(root,8.8,.16,.9,C.gold,0,9.03,.15);
  textSign(root,'星愿奇境',0,8.42,.58,7,'#fff4c7','#8050ac');
  for(const x of [-7,7]) {
    box(root,3,2.9,2.5,C.pale,x,1.9,-3);
    cone(root,2.5,1.7,C.blue,x,4.2,-3,4).rotation.y=Math.PI/4;
    window(root,x,1.3,-1.72,1.5,1.5);
    textSign(root,x<0?'欢迎光临':'旅程从这里开始',x,3,-1.65,2.7,C.dark,'#ffe7bc');
  }
  for(const x of [-12,12]) {
    cylinder(root,.16,.22,4.8,C.gold,x,2.8,1.5,12);
    sphere(root,.55,'#fff0b8',x,5.4,1.5);
    cone(root,.75,.55,C.purple,x,6.1,1.5);
    for(const z of [-2,0,2]) box(root,.15,2.2,.15,C.gold,x,1.6,z);
  }
  register('entrance','星愿奇境迎宾门','entrance',root,{description:'粉金三拱门与蓝顶售票亭欢迎每位访客，灯笼与飘扬的旗帜点亮入园仪式。'});
}

export function buildArchitecture(world) {
  castle(world); harbor(world); candyTown(world); entrance(world);
  return { update(t) {
    for(const item of animated) {
      if(item.type==='flag') item.item.rotation.y=Math.sin(t*2.5+item.phase)*.14;
      else if(item.type==='sweet') item.item.rotation.z=t*.25+item.phase;
      else item.item.scale.setScalar(1+Math.sin(t*2)*.08);
    }
  } };
}

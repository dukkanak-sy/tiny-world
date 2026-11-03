import * as THREE from 'three';
import './style.css';

const mount = document.querySelector('#game');
const message = document.querySelector('#message');
const ui = {
  health: document.querySelector('#health'),
  wood: document.querySelector('#wood'),
  leaves: document.querySelector('#leaves')
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9abec0);
scene.fog = new THREE.Fog(0x9abec0, 22, 75);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 150);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe6f5ff, 0x43552d, 2));
const sun = new THREE.DirectionalLight(0xffedcf, 2.5);
sun.position.set(-12, 22, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const mat = (color, roughness = 0.9) => new THREE.MeshStandardMaterial({ color, roughness });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), mat(0x536f3d));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grassGeo = new THREE.ConeGeometry(0.09, 2.3, 4);
const grass = new THREE.InstancedMesh(grassGeo, mat(0x39713b), 700);
const dummy = new THREE.Object3D();
for (let i = 0; i < 700; i++) {
  dummy.position.set((Math.random() - .5) * 75, 1.05, (Math.random() - .5) * 75);
  dummy.rotation.z = (Math.random() - .5) * .45;
  dummy.scale.setScalar(.6 + Math.random() * 1.5);
  dummy.updateMatrix();
  grass.setMatrixAt(i, dummy.matrix);
}
scene.add(grass);

function addTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.28 * scale, .42 * scale, 4 * scale, 9), mat(0x60452c));
  trunk.position.y = 2 * scale;
  trunk.castShadow = true;
  tree.add(trunk);
  for (let i = 0; i < 5; i++) {
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.45 * scale, 12, 10), mat(i % 2 ? 0x356d37 : 0x427d3e));
    crown.position.set((Math.random() - .5) * 1.8 * scale, (3.4 + Math.random()) * scale, (Math.random() - .5) * 1.8 * scale);
    crown.castShadow = true;
    tree.add(crown);
  }
  scene.add(tree);
}
for (let i = 0; i < 45; i++) {
  const x = (Math.random() - .5) * 65, z = (Math.random() - .5) * 65;
  if (Math.hypot(x, z) > 7) addTree(x, z, .8 + Math.random() * 1.6);
}

function addMushroom(x, z, s = 1) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.18*s,.23*s,.9*s,10), mat(0xe5d6b8));
  stem.position.y = .45*s; g.add(stem);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.75*s,16,12,0,Math.PI*2,0,Math.PI/2), mat(0xb94c43));
  cap.position.y = .9*s; g.add(cap); g.position.set(x,0,z); scene.add(g);
}
for (let i = 0; i < 24; i++) addMushroom((Math.random()-.5)*45,(Math.random()-.5)*45,.6+Math.random());

function makePerson() {
  const g = new THREE.Group();
  const skin = mat(0xe2b88e), shirt = mat(0x47799a), pants = mat(0x354457), hair = mat(0x34251e);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.28,.55,4,8), shirt); torso.position.y = 1.05; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.23,16,12), skin); head.position.y = 1.58; g.add(head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.235,16,8,0,Math.PI*2,0,Math.PI/2), hair); cap.position.y = 1.68; g.add(cap);
  for (const side of [-1,1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.09,.38,3,6), pants); leg.position.set(side*.14,.38,0); g.add(leg);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.075,.34,3,6), skin); arm.position.set(side*.34,1.04,0); arm.rotation.z = side*.18; g.add(arm);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(g); return g;
}
const player = makePerson();
player.position.set(0,0,0);

function makeSpider() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(.48,16,12), mat(0x292a29)); body.scale.set(1.2,.8,1); body.position.y=.58; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.3,12,10), mat(0x383633)); head.position.set(0,.58,.43); g.add(head);
  for (const side of [-1,1]) for (let i=0;i<4;i++) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.045,.065,.95,7), mat(0x252525));
    leg.position.set(side*(.42 + (i%2)*.12),.43,(i-1.5)*.3);
    leg.rotation.z = side*.8; leg.rotation.x = (i-1.5)*.12; g.add(leg);
  }
  for (const side of [-1,1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.075,10,8), mat(0xd94b35));
    eye.position.set(side*.13,.7,.68); g.add(eye);
  }
  g.position.set(7,0,-7); g.traverse(o=>{if(o.isMesh)o.castShadow=true;}); scene.add(g); return g;
}
let spider = makeSpider();
let spiderHP = 3;

const resources = [];
function addResource(x,z,type) {
  const g = new THREE.Group();
  if (type === 'wood') {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,1.15,8),mat(0x98683c));
    log.rotation.z = Math.PI/2; g.add(log);
  } else {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.36,10,8),mat(0x5baf51));
    leaf.scale.set(1,.25,.65); g.add(leaf);
  }
  g.position.set(x,.25,z); scene.add(g); resources.push({mesh:g,type,active:true});
}
addResource(2,-2,'wood'); addResource(-3,3,'leaf'); addResource(6,2,'wood');
addResource(-6,-4,'leaf'); addResource(0,7,'wood'); addResource(9,-8,'leaf');

const keys = {};
let health=100, wood=0, leaves=0, kills=0, lastDamage=0, lastAttack=0, vertical=0, velocityY=0;
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if(e.code==='Space' && vertical===0) velocityY=6; if(e.key.toLowerCase()==='f') attack(); });
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function attack() {
  const now = performance.now();
  if (now-lastAttack<650) return;
  lastAttack=now;
  if (spider && player.position.distanceTo(spider.position)<3.1) {
    spiderHP--;
    message.textContent = `أصبت العنكبوت! بقي ${spiderHP} ضربات.`;
    if (spiderHP<=0) { scene.remove(spider); spider=null; kills++; message.textContent='انتصرت! الطريق أصبح آمناً.'; }
  } else message.textContent='اقترب أكثر من العنكبوت قبل الهجوم.';
}

function update(dt) {
  const f=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0);
  const s=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
  const len=Math.hypot(f,s)||1;
  if (f||s) {
    const dx=s/len, dz=-f/len;
    player.position.x += dx*5*dt; player.position.z += dz*5*dt;
    player.rotation.y=Math.atan2(dx,dz);
  }
  player.position.x=THREE.MathUtils.clamp(player.position.x,-35,35);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-35,35);
  if (velocityY || vertical>0) { velocityY-=15*dt; vertical+=velocityY*dt; if(vertical<0){vertical=0;velocityY=0;} }
  player.position.y=vertical;
  if (spider) {
    const d=player.position.distanceTo(spider.position);
    if(d<15 && d>1.1) {
      const dir=new THREE.Vector3().subVectors(player.position,spider.position).normalize();
      spider.position.addScaledVector(dir,1.5*dt);
      spider.rotation.y=Math.atan2(dir.x,dir.z);
    }
    if(d<1.25 && performance.now()-lastDamage>1200) {
      lastDamage=performance.now(); health=Math.max(0,health-10);
      message.textContent='العنكبوت هاجمك! اهرب أو قاتله.';
    }
  }
  for(const r of resources) if(r.active) {
    r.mesh.rotation.y+=dt;
    if(player.position.distanceTo(r.mesh.position)<1.25) {
      r.active=false; scene.remove(r.mesh);
      if(r.type==='wood') wood++; else leaves++;
      message.textContent='جمعت مورداً. استمر بالاستكشاف.';
    }
  }
  ui.health.textContent=health; ui.wood.textContent=wood; ui.leaves.textContent=leaves;
  const target=new THREE.Vector3(player.position.x+7,player.position.y+5.5,player.position.z+9);
  camera.position.lerp(target,Math.min(1,dt*4));
  camera.lookAt(player.position.x,player.position.y+1,player.position.z);
}

let previous=0;
function animate(t) { requestAnimationFrame(animate); const dt=Math.min((t-previous)/1000,.04); previous=t; update(dt); renderer.render(scene,camera); }
animate(0);

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

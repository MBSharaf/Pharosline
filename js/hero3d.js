// Hero centrepiece: the Pharosline P mark extruded in 3D. The amber block is the
// lighthouse lamp — it throws a volumetric beam that sweeps the scene, lights the
// dust, and (via CSS vars) reveals the giant headline behind the canvas.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const S = 1 / 1000; // logo file units (2000px artboard) -> world units

function markShapes() {
  // Same outline as the SVG #pmark, y flipped.
  const p = new THREE.Shape();
  p.moveTo(350, -378);
  p.lineTo(1080, -378);
  p.absarc(1080, -769, 391, Math.PI / 2, -Math.PI / 2, true);
  p.lineTo(587, -1160);
  p.lineTo(587, -1245);
  p.lineTo(1133, -1245);
  p.lineTo(1133, -1553);
  p.lineTo(350, -1553);
  p.closePath();
  const hole = new THREE.Path();
  hole.moveTo(587, -587);
  hole.lineTo(1010, -587);
  hole.absarc(1010, -713.5, 126.5, Math.PI / 2, -Math.PI / 2, true);
  hole.lineTo(587, -840);
  hole.closePath();
  p.holes.push(hole);

  const lamp = new THREE.Shape();
  lamp.moveTo(1133, -1245); lamp.lineTo(1582, -1245); lamp.lineTo(1582, -1553); lamp.lineTo(1133, -1553); lamp.closePath();
  return { p, lamp };
}

const beamVert = /* glsl */`
  varying vec3 vPos; varying vec3 vN; varying vec3 vView;
  void main(){
    vPos = position;
    vec4 wp = modelMatrix * vec4(position,1.);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const beamFrag = /* glsl */`
  uniform float uLen; uniform float uIntensity; uniform float uTime;
  varying vec3 vPos; varying vec3 vN; varying vec3 vView;
  void main(){
    float t = clamp(-vPos.y / uLen + .5, 0., 1.);           // 0 at lamp, 1 at far end
    float edge = pow(abs(dot(normalize(vN), normalize(vView))), 1.6);
    float fall = pow(1. - t, 1.7);
    float flicker = .92 + .08 * sin(uTime * 3.1 + t * 9.);
    vec3 col = mix(vec3(1., .86, .58), vec3(.87, .6, .2), t);
    gl_FragColor = vec4(col, edge * fall * uIntensity * flicker);
  }`;

const dustVert = /* glsl */`
  uniform float uTime; uniform vec3 uOrigin; uniform vec3 uDir; uniform float uSize;
  attribute float aSeed; varying float vLit;
  void main(){
    vec3 p = position;
    p.y += sin(uTime * .3 + aSeed * 6.28) * .08;
    p.x += cos(uTime * .2 + aSeed * 4.) * .06;
    vec3 d = normalize(p - uOrigin);
    float a = dot(d, uDir);
    vLit = smoothstep(.955, .995, a) * .95 + .08;
    vec4 mv = modelViewMatrix * vec4(p,1.);
    gl_PointSize = uSize * (1. + aSeed) * (3. / -mv.z) * (.6 + vLit);
    gl_Position = projectionMatrix * mv;
  }`;
const dustFrag = /* glsl */`
  varying float vLit;
  void main(){
    float d = length(gl_PointCoord - .5);
    float a = smoothstep(.5, 0., d);
    gl_FragColor = vec4(mix(vec3(.55,.5,.44), vec3(1.,.8,.5), vLit), a * vLit);
  }`;

export function initHero(canvas, { reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  camera.position.set(0, 0, 7.2);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;

  // ---- mark ----
  const { p, lamp } = markShapes();
  const depth = 260;
  const ext = { depth, bevelEnabled: true, bevelThickness: 22, bevelSize: 14, bevelSegments: 6, curveSegments: 48 };
  const pGeo = new THREE.ExtrudeGeometry(p, ext);
  const lampGeo = new THREE.ExtrudeGeometry(lamp, { ...ext, depth: depth + 60 });
  [pGeo, lampGeo].forEach(g => { g.translate(-966, 965, -depth / 2); g.scale(S, S, S); });

  const inkMat = new THREE.MeshPhysicalMaterial({ color: 0x141414, metalness: .55, roughness: .32, clearcoat: 1, clearcoatRoughness: .18, envMapIntensity: .9 });
  const lampMat = new THREE.MeshPhysicalMaterial({ color: 0xDD9933, emissive: 0xDD9933, emissiveIntensity: .9, roughness: .3, metalness: .1, transmission: .0, clearcoat: 1 });

  const mark = new THREE.Group();
  const pMesh = new THREE.Mesh(pGeo, inkMat);
  const lampMesh = new THREE.Mesh(lampGeo, lampMat);
  mark.add(pMesh, lampMesh);
  const rig = new THREE.Group(); // scroll/mouse transforms
  rig.add(mark);
  scene.add(rig);

  // lamp centre in mark space
  const lampCenter = new THREE.Vector3((1357 - 966) * S, (-1399 + 965) * S, .05);

  // ---- beam (child of a pivot at the lamp) ----
  const beamPivot = new THREE.Object3D();
  beamPivot.position.copy(lampCenter);
  mark.add(beamPivot);
  const LEN = 14;
  const beamUniforms = { uLen: { value: LEN }, uIntensity: { value: .55 }, uTime: { value: 0 } };
  const beamMat = new THREE.ShaderMaterial({ vertexShader: beamVert, fragmentShader: beamFrag, uniforms: beamUniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const beamGeo = new THREE.CylinderGeometry(1.75, .1, LEN, 64, 1, true);
  beamGeo.translate(0, -LEN / 2, 0); // narrow end at the lamp, extends along -Y
  const beam = new THREE.Mesh(beamGeo, beamMat);
  const beamCore = new THREE.Mesh(new THREE.CylinderGeometry(.55, .05, LEN * .8, 48, 1, true).translate(0, -LEN * .4, 0),
    new THREE.ShaderMaterial({ vertexShader: beamVert, fragmentShader: beamFrag, uniforms: { uLen: { value: LEN * .8 }, uIntensity: { value: .5 }, uTime: beamUniforms.uTime }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  beamPivot.add(beam, beamCore);

  // lamp glow sprite
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,220,150,1)'); gr.addColorStop(.25, 'rgba(221,153,51,.55)'); gr.addColorStop(1, 'rgba(221,153,51,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.set(1.6, 1.6, 1); glow.position.copy(lampCenter).add(new THREE.Vector3(0, 0, .25));
  mark.add(glow);

  // real light so the beam rakes the mark and backdrop
  const spot = new THREE.SpotLight(0xffc27a, 60, 30, .32, .6, 1.4);
  spot.position.copy(lampCenter);
  const spotTarget = new THREE.Object3D(); spotTarget.position.set(0, -5, 0); beamPivot.add(spotTarget);
  spot.target = spotTarget; mark.add(spot);
  scene.add(new THREE.AmbientLight(0xffffff, .15));
  const rim = new THREE.DirectionalLight(0xffe2b8, 1.4); rim.position.set(-4, 3, 3); scene.add(rim);
  const back = new THREE.DirectionalLight(0xDD9933, 1.2); back.position.set(3, -2, -4); scene.add(back);

  // ---- dust ----
  const N = innerWidth < 720 ? 700 : 1600;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - .5) * 16; pos[i * 3 + 1] = (Math.random() - .5) * 9; pos[i * 3 + 2] = (Math.random() - .5) * 6 - 1;
    seed[i] = Math.random();
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const dustU = { uTime: beamUniforms.uTime, uOrigin: { value: new THREE.Vector3() }, uDir: { value: new THREE.Vector3(1, 0, 0) }, uSize: { value: 6 * renderer.getPixelRatio() } };
  const dust = new THREE.Points(dGeo, new THREE.ShaderMaterial({ vertexShader: dustVert, fragmentShader: dustFrag, uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  // ---- state ----
  const state = { mx: 0, my: 0, tx: 0, ty: 0, scroll: 0, intro: 0, visible: true };
  const onMove = e => { state.tx = e.clientX / innerWidth - .5; state.ty = e.clientY / innerHeight - .5; };
  addEventListener('pointermove', onMove, { passive: true });

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const narrow = w < 720;
    rig.position.set(narrow ? .35 : .85, narrow ? .25 : .15, 0);
    rig.scale.setScalar(narrow ? .58 : 1.18);
  }
  layout();
  addEventListener('resize', layout);

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpDir = new THREE.Vector3();
  const root = document.documentElement;
  const degEl = document.querySelector('[data-deg]');
  const lit = document.querySelector('.hero__type--lit');
  const clock = new THREE.Clock();

  function frame() {
    const t = clock.getElapsedTime();
    beamUniforms.uTime.value = t;
    state.mx += (state.tx - state.mx) * .05; state.my += (state.ty - state.my) * .05;

    // the sweep: a slow lighthouse rotation; mouse nudges it
    const sweep = reduced ? -1.2 : Math.sin(t * .42) * 1.25 - 1.25 + state.mx * .5;
    beamPivot.rotation.z = sweep;
    beamPivot.rotation.x = .12 + state.my * .3;

    const intro = state.intro, sc = state.scroll;
    mark.rotation.y = -.42 + state.mx * .5 + (1 - intro) * -1.6 + sc * 1.4;
    mark.rotation.x = .08 + state.my * .25 + sc * .4;
    mark.position.y = Math.sin(t * .8) * .04 - sc * 1.2;
    mark.position.z = (1 - intro) * -4 + sc * 1.5;
    beamUniforms.uIntensity.value = .55 * intro * (1 - sc * .9);
    glow.material.opacity = intro;

    // beam origin/direction in world space -> dust + CSS headline mask
    beamPivot.updateWorldMatrix(true, false);
    beamPivot.getWorldPosition(tmpA);
    tmpDir.set(0, -1, 0).transformDirection(beamPivot.matrixWorld);
    dustU.uOrigin.value.copy(tmpA); dustU.uDir.value.copy(tmpDir);

    tmpB.copy(tmpA).addScaledVector(tmpDir, 4);
    const a = tmpA.clone().project(camera), b = tmpB.project(camera);
    const ax = (a.x * .5 + .5) * 100, ay = (-a.y * .5 + .5) * 100;
    const ang = Math.atan2((b.x - a.x) * camera.aspect, -(b.y - a.y)) * 180 / Math.PI; // 0deg = up, clockwise (CSS conic)
    if (lit) {
      lit.style.setProperty('--bx', ax.toFixed(2) + '%');
      lit.style.setProperty('--by', ay.toFixed(2) + '%');
      lit.style.setProperty('--beam', ((ang + 360) % 360).toFixed(2) + 'deg');
      lit.style.opacity = intro * (1 - sc * 1.2);
    }
    if (degEl) degEl.textContent = String(Math.round((ang + 360) % 360)).padStart(3, '0') + '°';

    renderer.render(scene, camera);
  }

  let raf = 0;
  const loop = () => { raf = requestAnimationFrame(loop); if (state.visible) frame(); };
  loop();

  new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; }).observe(canvas);

  return {
    state,
    setScroll(v) { state.scroll = v; },
    setIntro(v) { state.intro = v; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('pointermove', onMove); renderer.dispose(); }
  };
}

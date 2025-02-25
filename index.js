import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import spline from './spline.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000,0.3)
const camera =  new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w,h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

//const hemilight = new THREE.HemisphereLight(0xffffff, 0x444444);
//scene.add(hemilight);

//creating a line geometry from spline
const points = spline.getPoints(100);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({color: 0xfbffff});
const line = new THREE.Line(geometry,material);
//scene.add(line);

//creating a tube geometry from spline
const tubeGeo= new THREE.TubeGeometry(spline, 250, 0.85, 20, true );
const tubeMat = new THREE.MeshBasicMaterial({
    color: 0xfbffff,
    side: THREE.DoubleSide, //means that walls exist both sides, if confused just comment it out and see the diffrence
    wireframe: true, // gives a wireframe mesh type thing, comment out if confused 
});
const tube = new THREE.Mesh(tubeGeo,tubeMat)
//scene.add(tube);

//create edge geometry
const edges = new THREE.EdgesGeometry(tubeGeo,0.2);
const lineMat = new THREE.LineBasicMaterial({color: 0x3b719f});
const tubeLines = new THREE.LineSegments(edges,lineMat);
scene.add(tubeLines);


//create camera that will follow the curve
function updateCamera(t){
    const time = t*0.10; // variables
    const looptime = 8*1000;
    const p = (time%looptime)/looptime; // give a point number between 0 and 1 
    const pos = tubeGeo.parameters.path.getPointAt(p);
    const lookAt = tubeGeo.parameters.path.getPointAt((p+0.03)%1);
    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

//post-processing
const renderScene = new RenderPass(scene,camera);
const BloomPass = new UnrealBloomPass(new THREE.Vector2(w,h),1.5,0.4,100);
BloomPass.threshold = 0.002;
BloomPass.strength = 3.5;
BloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(BloomPass);


function animate(t=0){
    requestAnimationFrame(animate);
    updateCamera(t);
    composer.render(scene,camera);
    controls.update();
}

animate();
renderer.render(scene, camera);

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', handleWindowResize, false);
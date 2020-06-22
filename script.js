import * as THREE from "https://cdn.rawgit.com/mrdoob/three.js/r117/build/three.module.js";
import { ARButton } from "https://cdn.rawgit.com/mrdoob/three.js/r117/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "https://codepen.io/ollywoggy/pen/VwePmGX.js";

let container;
let camera, scene, renderer;
let controller;
let gltfMixers = [];

let followCameraTransform = true;
let mesh = null;

init();

function init() {
  
  // Prepare the DOM
  container = document.createElement("div");
  document.body.appendChild(container);
  window.addEventListener("resize", onWindowResize, false);
  
  // Prepare the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  
  // Add renderer to page
  container.appendChild(renderer.domElement);
  document.body.appendChild(ARButton.createButton(renderer));
  
  
  // Setup the scene
  scene = new THREE.Scene();

  // Setup the camera and camera position
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  
  //scene.add(new THREE.AmbientLight(0xcccccc));

  let light = new THREE.HemisphereLight(0xffffff, 0xbbbbbb, 1);
  light.position.set(0, 1, 0);
  scene.add(light);

  
  let loader = new GLTFLoader();
  let texture, material;
  mesh = new THREE.Object3D();
  texture = THREE.ImageUtils.loadTexture( "Youth.png" );
  material = new THREE.MeshLambertMaterial({ map : texture, transparent: true});
  for (let i = 0; i < 5; i++) {
    let plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    plane.position.z = i/10;
    plane.doubleSided = true;
    mesh.add(plane);
  }
  scene.add(mesh);
  // loader.load(
  //   "https://cdn.glitch.com/17a5e9f3-98e4-4ea3-8466-a4d271f324f2%2FHorse.glb?v=1592325342024",
  //   function(gltf) {
  //     let mixer;
  //     mesh = gltf.scene.children[0];
  //     mesh.scale.set(.001, .001, .001);
  //     scene.add(mesh);

  //     mixer = new THREE.AnimationMixer(mesh);

  //     mixer
  //       .clipAction(gltf.animations[0])
  //       .setDuration(1)
  //       .play();
  //     gltfMixers.push(mixer);
  //   }
  // );

  // Add the controller that will spawn models
  function onSelectStart() {
    followCameraTransform = false;
  }

  controller = renderer.xr.getController(0);
  console.log(controller);
  controller.addEventListener("selectstart", onSelectStart);
  scene.add(controller);
  
  // begin rendering!
  renderer.setAnimationLoop(render);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

let prevTime = Date.now();
function render() {
  
  if (mesh && followCameraTransform) {
    mesh.position.set(controller.position.x, controller.position.y, controller.position.z);
    mesh.rotation.y = (controller.rotation.y); 
  }

  let time = Date.now();
  for (let mixer of gltfMixers) {

    mixer.update((time - prevTime) * 0.001);

  }
  prevTime = time;
  renderer.render(scene, camera);
}

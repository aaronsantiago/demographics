import * as THREE from "https://cdn.rawgit.com/mrdoob/three.js/r117/build/three.module.js";
import { ARButton } from "https://cdn.rawgit.com/mrdoob/three.js/r117/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "https://codepen.io/ollywoggy/pen/VwePmGX.js";
import { BasisTextureLoader } from 'https://cdn.rawgit.com/mrdoob/three.js/r117/examples/jsm/loaders/BasisTextureLoader.js';

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
  // mesh = new THREE.Object3D();
  // let texture1 = new THREE.TextureLoader().load( "assets/rainbow.png" );
  // let texture2 = new THREE.TextureLoader().load( "assets/nyc_poverty_2.tif" );
  // let material1 = new THREE.MeshBasicMaterial({ map : texture1, transparent: true});
  // let material2 = new THREE.MeshBasicMaterial({ map : texture2, transparent: true});
  // let plane = new THREE.Mesh(new THREE.PlaneGeometry(600*.0004, 847*.0004), material1);
  // plane.doubleSided = true;
  // mesh.add(plane);
  // plane = new THREE.Mesh(new THREE.PlaneGeometry(1546*.0004, 294*.0004), material2);
  // plane.position.z = 1/10;
  // plane.doubleSided = true;
  // mesh.add(plane);
  // scene.add(mesh);
  loader.load(
    "assets/test2.glb",
    function(gltf) {
      mesh = new THREE.Object3D();

      for (let o of gltf.scene.children) {
        mesh.add(o);
      }
      // mesh.scale.set(.001, .001, .001);
      mesh.position.z = -.1;
      scene.add(mesh);
    }
  );

  // Add the controller that will spawn models
  function onSelectStart() {
    mesh.position.set(controller.position.x, controller.position.y, controller.position.z);
    mesh.rotation.y = controller.rotation.y; 
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

  let time = Date.now();
  for (let mixer of gltfMixers) {

    mixer.update((time - prevTime) * 0.001);

  }
  prevTime = time;
  renderer.render(scene, camera);
}

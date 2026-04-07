import * as THREE from "../vendor/three/three.module.js";
import { GLTFLoader } from "../vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../vendor/three/examples/jsm/controls/OrbitControls.js";

const mount = document.getElementById("hero-model");
const modelUrl = new URL("../models/desktop_pc/scene.gltf", import.meta.url).href;

if (mount) {
  const scene = new THREE.Scene();
  const isMobile = window.matchMedia("(max-width: 500px)").matches;
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 50 : 25,
    mount.clientWidth / Math.max(mount.clientHeight, 1),
    0.1,
    200
  );

  if (isMobile) {
    camera.position.set(0, 0, 20);
  } else {
    camera.position.set(20, 3, 5);
  }

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.15);
  scene.add(hemisphereLight);

  const spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(-20, 50, 10);
  spotLight.angle = 0.12;
  spotLight.penumbra = 1;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  scene.add(spotLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  scene.add(pointLight);

  let controls = null;
  if (!isMobile) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 2;
    controls.target.set(0, -0.8, 0);
  }

  let desktopModel = null;
  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    function (gltf) {
      desktopModel = gltf.scene;
      desktopModel.scale.setScalar(0.75);
      if (isMobile) {
        desktopModel.position.set(0, -3, 0);
      } else {
        desktopModel.position.set(-0.6, -3.25, -1.5);
        desktopModel.rotation.set(-0.01, -0.2, -0.1);
      }
      scene.add(desktopModel);
    }
  );

  const onResize = function () {
    const width = mount.clientWidth;
    const height = Math.max(mount.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  const animate = function () {
    const delta = clock.getDelta();
    if (controls) {
      controls.update();
    } else if (desktopModel) {
      desktopModel.rotation.y += delta * 0.5;
    }
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}

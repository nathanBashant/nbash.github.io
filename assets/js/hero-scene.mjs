import * as THREE from "../vendor/three/three.module.js";
import { GLTFLoader } from "../vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../vendor/three/examples/jsm/controls/OrbitControls.js";

const mount = document.getElementById("hero-model");
const modelUrl = new URL("../models/desktop_pc/scene-optimized.glb", import.meta.url).href;

if (mount) {
  const hero = mount.closest(".hero") || mount;
  const scene = new THREE.Scene();
  const isMobile = window.matchMedia("(max-width: 500px)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
    powerPreference: "high-performance"
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
    controls.autoRotate = !reducedMotion.matches;
    controls.autoRotateSpeed = 2.2;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 2;
    controls.target.set(0, -0.8, 0);
  }

  let desktopModel = null;
  let animationFrameId = 0;
  let heroIsVisible = true;
  const clock = new THREE.Clock(false);

  const canRender = function () {
    return heroIsVisible && !document.hidden && desktopModel !== null;
  };

  const stopRendering = function () {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }
    clock.stop();
  };

  const renderFrame = function () {
    animationFrameId = 0;
    if (!canRender()) {
      stopRendering();
      return;
    }

    const delta = clock.getDelta();
    if (!reducedMotion.matches) {
      if (controls) {
        controls.update();
      } else {
        desktopModel.rotation.y += delta * 0.5;
      }
    }

    renderer.render(scene, camera);

    if (reducedMotion.matches) {
      clock.stop();
      return;
    }
    animationFrameId = window.requestAnimationFrame(renderFrame);
  };

  const startRendering = function () {
    if (animationFrameId || !canRender()) {
      return;
    }
    clock.start();
    animationFrameId = window.requestAnimationFrame(renderFrame);
  };

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
      startRendering();
    }
  );

  const onResize = function () {
    const width = mount.clientWidth;
    const height = Math.max(mount.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    startRendering();
  };

  window.addEventListener("resize", onResize, { passive: true });

  if (controls) {
    controls.addEventListener("change", function () {
      if (reducedMotion.matches) {
        startRendering();
      }
    });
  }

  const handleMotionPreference = function () {
    if (controls) {
      controls.autoRotate = !reducedMotion.matches;
    }
    stopRendering();
    startRendering();
  };

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handleMotionPreference);
  } else {
    reducedMotion.addListener(handleMotionPreference);
  }

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(
      function (entries) {
        heroIsVisible = entries.some(function (entry) {
          return entry.isIntersecting;
        });
        if (heroIsVisible) {
          startRendering();
        } else {
          stopRendering();
        }
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(hero);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopRendering();
    } else {
      startRendering();
    }
  });
}

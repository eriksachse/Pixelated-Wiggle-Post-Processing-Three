import "./styles.css";
import * as THREE from "three";
var container;

var dummyCamera, camera, scene, dummyScene, renderer, zmesh1, zmesh2;

var mouseX = 0,
  mouseY = 0;

var uniforms;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var rtTexture, material, quad;

var delta = 0.01;

init();
animate();

function init() {
  container = document.getElementById("app");
  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 500;
  dummyCamera = new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    -10000,
    10000
  );
  dummyCamera.position.z = 1;

  //

  scene = new THREE.Scene();
  dummyScene = new THREE.Scene();

  rtTexture = new THREE.WebGLRenderTarget(
    window.innerWidth / 8, //resolution x
    window.innerHeight / 8, //resolution y
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat
    }
  );

  uniforms = {
    tDiffuse: { value: rtTexture.texture },
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3() }
  };
  var materialScreen = new THREE.ShaderMaterial({
    uniforms: uniforms, // rtTexture = material from perspective camera
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragment_shader_screen")
      .textContent,
    depthWrite: false
  });

  var plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
  // plane to display rendered texture
  quad = new THREE.Mesh(plane, materialScreen);
  quad.position.z = -100;
  dummyScene.add(quad);

  var geometry = new THREE.TorusGeometry(100, 25, 15, 30);

  var mat1 = new THREE.MeshBasicMaterial({ color: 0x555555 });
  var mat2 = new THREE.MeshBasicMaterial({ color: 0x550000 });

  zmesh1 = new THREE.Mesh(geometry, mat1);
  zmesh1.position.set(0, 0, 100);
  zmesh1.scale.set(1.5, 1.5, 1.5);
  scene.add(zmesh1);

  zmesh2 = new THREE.Mesh(geometry, mat2);
  zmesh2.position.set(0, 150, 100);
  zmesh2.scale.set(0.75, 0.75, 0.75);
  zmesh2.rotation.y = Math.PI / 2;
  scene.add(zmesh2);

  renderer = new THREE.WebGLRenderer();
  //				renderer.setPixelRatio( 0.2 );
  renderer.setClearColor(0xffd7a6);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;

  container.appendChild(renderer.domElement);

  document.addEventListener("mousemove", onDocumentMouseMove, false);
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function animate(time) {
  time *= 0.001;
  uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);
  uniforms.iTime.value = time;
  requestAnimationFrame(animate);
  render();
}

function render() {
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  zmesh1.position.y = Math.sin(Date.now() * 0.0012) * Math.PI * 8;

  // Render first scene into texture

  renderer.setRenderTarget(rtTexture);
  renderer.clear();
  renderer.render(scene, camera);
  // Render full screen quad with generated texture
  renderer.setRenderTarget(null);
  renderer.clear();
  renderer.render(dummyScene, dummyCamera);
}

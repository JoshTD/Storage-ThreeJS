import * as THREE from './lib/three.js';
import { OrbitControls } from './lib/orbit-controls.three.js';
import { GLTFLoader } from './lib/gltf-loader.three.js';

// Значения по умолчанию
const fov = 75;
const width = window.innerWidth * 0.8;
const height = window.innerHeight;
const aspect = width / height;
const near = 0.1;
const far = 10000;
const camera_pos = { x: 2000, y: 1000, z: -2000 };
const spotlight_pos = { x: 5000, y: 5000, z: 5000 };

// Создание сцены
var scene = new THREE.Scene();
scene.background = new THREE.Color('lightgray');
var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
var controls = new OrbitControls(camera, renderer.domElement);
let viewerBox = document.getElementById('viewer');
viewerBox.appendChild(renderer.domElement);

camera.position.set(camera_pos.x, camera_pos.y, camera_pos.z);
controls.update();

// Добавление общего освещения
let ambientLight = new THREE.AmbientLight(0xfafafa, 0.9);
scene.add(ambientLight);

// Добавление луча света
let spotLight = new THREE.SpotLight(0x606060);
spotLight.position.set(spotlight_pos.x, spotlight_pos.y, spotlight_pos.z);
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 0.1;
spotLight.shadow.camera.far = 10000;
spotLight.shadow.camera.fov = 75;
scene.add(spotLight);  

// Создание менеджера загруки моделей
const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onLoad = function () {
    console.log('Loading complete!');
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onError = function (url) {
    console.log('There was an error loading ' + url);
};

// Создание загрузчика моделей
const loader = new GLTFLoader(manager);
function modelLoader(string) {
    loader.parse(string, './', function (gltf) {
        let model = initModel(gltf.scene)
        scene.add(model);
    }, function (error) {
        console.error(error);
    });
}

function initModel(scene) {
    let model = scene;
    model.position.set(0, 0, 0);
    model.scale.set(1000, 1000, 1000);
    return model;
}

function loadModel(url) {
    fetch(url)
    .then(res => res.json())
    .then((obj) => {
        console.log(obj.scene);
        modelLoader(JSON.stringify(obj.scene));
    })
    .catch(err => { throw err });
}

// Загрузка модели по url
let url = 'http://localhost:3000/models/pacman';
loadModel(url);

// вызов функции анимации
animate();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

function ResizeCanvas() {
    let width = window.innerWidth * 0.8;
    let height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
addEventListener('resize', ResizeCanvas, false);

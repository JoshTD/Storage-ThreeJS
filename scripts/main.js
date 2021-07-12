import * as THREE from './lib/three.js';
import { OrbitControls } from './lib/orbit-controls.three.js';
import { GLTFLoader } from './lib/gltf-loader.three.js';

// Значения по умолчанию
const fov = 75;
const width = window.innerWidth * 0.8;
const height = window.innerHeight;
const aspect = width / height;
const near = 0.1;
const far = 100000;
const camera_pos = { x: 2000, y: 1000, z: -2000 };
const spotlight_pos = { x: 5000, y: 5000, z: 5000 };
const model_scale = 1000;
const baseUrl = 'http://localhost:3000/models'; // Адрес базы данных с моделями

// Создание сцены
var scene = new THREE.Scene();
scene.background = new THREE.Color('white');
var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
var controls = new OrbitControls(camera, renderer.domElement);
var viewerBox = document.getElementById('viewer');
var listBox = document.getElementById('model-list');
viewerBox.appendChild(renderer.domElement);

clearScene();

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
//const loader = new GLTFLoader(manager);
const loader = new GLTFLoader();
function modelLoader(string) {
    loader.parse(string, undefined, function (gltf) {
        let model = initModel(gltf.scene)
        scene.add(model);
    }, function (error) {
        console.error(error);
    });
}

function initModel(scene) {
    let model = scene;
    model.position.set(0, 0, 0);
    model.scale.set(model_scale, model_scale, model_scale);
    return model;
}

function loadModel(url) {
    fetch(url)
    .then(res => res.json())
    .then((object) => {
        modelLoader(JSON.stringify(object.scene));
    })
    .catch(err => { throw err });
}

function findAllModelIds() {
    let ids = [];
    fetch(baseUrl)
    .then(res => res.json())
    .then((objects) => {
        for (let item of objects) {
            addModelListItem(item.id);
            ids.push(item.id);
        }
    })
    .catch(err => { throw err });
    return ids;
}

// Загрузка списка моделей
let ids = await findAllModelIds();
for (let id of ids) {
    console.log(id);
}

// Вызов функции анимации
animate();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

function addModelListItem(id) {
    let listItem = document.createElement('div');
    listItem.id = id;
    listItem.classList.add('model-link');
    listItem.classList.add('card');
    listItem.innerHTML = id;
    listItem.addEventListener('click', () => onClick(listItem.id));
    listBox.appendChild(listItem);
}

function onClick(id) {
    loadModelToScene(getUrl(id));
}

function getUrl(id) {
    return baseUrl + '/' + id;
}

function loadModelToScene(url) {
    clearScene();
    loadModel(url);
}

function clearScene() {
    scene.clear();

    camera.position.set(camera_pos.x, camera_pos.y, camera_pos.z);

    controls.update();

    let ambientLight = new THREE.AmbientLight(0xfafafa, 0.9);
    scene.add(ambientLight)
    
    let spotLight = new THREE.SpotLight(0x606060);
    spotLight.position.set(spotlight_pos.x, spotlight_pos.y, spotlight_pos.z);
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.1;
    spotLight.shadow.camera.far = 100000;
    spotLight.shadow.camera.fov = 75;
    scene.add(spotLight);
}

function ResizeCanvas() {
    let width = window.innerWidth * 0.8;
    let height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
addEventListener('resize', ResizeCanvas, false);

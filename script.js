let scene, camera, renderer, cubes, analyser, dataArray;
const cubeCount = 500; // Adjusted for performance

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('particle-container').appendChild(renderer.domElement);

    const cubeGeometry = new THREE.BoxGeometry();
    const colors = [
        0xff5733, 0xffbd33, 0x33ff57, 0x3357ff, 0xbd33ff,
        0xff33bd, 0x33ffbd, 0xbdff33, 0x5733ff, 0x33bdff
    ];

    cubes = new THREE.Group();

    for (let i = 0; i < cubeCount; i++) {
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor

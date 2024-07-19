// script.js

let scene, camera, renderer, cubes, analyser, dataArray;
let cubeCount = 500; // Adjusted for performance

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('particle-container').appendChild(renderer.domElement);

    let cubeGeometry = new THREE.BoxGeometry();
    let edgeGeometry = new THREE.EdgesGeometry(cubeGeometry);

    const colors = [
        0xff5733, 0xffbd33, 0x33ff57, 0x3357ff, 0xbd33ff,
        0xff33bd, 0x33ffbd, 0xbdff33, 0x5733ff, 0x33bdff
    ];

    cubes = new THREE.Group();

    for (let i = 0; i < cubeCount; i++) {
        let material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 0.8,
            transparent: true,
        });

        let cube = new THREE.Mesh(cubeGeometry, material);
        cube.position.set((Math.random() * 2 - 1) * 5, (Math.random() * 2 - 1) * 5, (Math.random() * 2 - 1) * 5);
        cube.scale.set(Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1);

        cubes.add(cube);
    }

    scene.add(cubes);

    animate();

    const playButton = document.getElementById('play-button');
    playButton.addEventListener('click', () => {
        const musicPlayer = document.getElementById('music-player');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(musicPlayer);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        musicPlayer.play().catch((e) => {
            console.error('Audio play error:', e);
        });
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        cubes.children.forEach((cube, i) => {
            cube.material.color.setHex(0xff5733 + dataArray[i]);
        });
    }
    cubes.rotation.y += 0.005;
    cubes.rotation.x += 0.003;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();

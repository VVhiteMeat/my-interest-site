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
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 0.8,
            transparent: true,
        });

        const cube = new THREE.Mesh(cubeGeometry, material);
        cube.position.set((Math.random() * 2 - 1) * 5, (Math.random() * 2 - 1) * 5, (Math.random() * 2 - 1) * 5);
        cube.scale.set(Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1);

        cubes.add(cube);
    }

    scene.add(cubes);
    animate();

    const playButton = document.getElementById('play-button');
    playButton.addEventListener('click', handlePlayButtonClick);
}

function handlePlayButtonClick() {
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
}

function animate() {
    requestAnimationFrame(animate);
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        cubes.children.forEach((cube, i) => {
            const colorValue = dataArray[i % dataArray.length];
            const colorHex = (colorValue << 16) | (colorValue << 8) | colorValue;
            cube.material.color.setHex(colorHex);
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

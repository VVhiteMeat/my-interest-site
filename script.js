// script.js

let scene, camera, renderer, instancedMesh, analyser, dataArray;
const cubeCount = 200; // Adjusted for performance

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('particle-container').appendChild(renderer.domElement);

    const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8 });

    instancedMesh = new THREE.InstancedMesh(cubeGeometry, material, cubeCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < cubeCount; i++) {
        dummy.position.set((Math.random() * 2 - 1) * 5, (Math.random() * 2 - 1) * 5, (Math.random() * 2 - 1) * 5);
        dummy.scale.set(Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    scene.add(instancedMesh);
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

    musicPlayer.play().then(() => {
        console.log('Audio playing');
    }).catch((e) => {
        console.error('Audio play error:', e);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);

        const dummy = new THREE.Object3D();
        const color = new THREE.Color();

        for (let i = 0; i < cubeCount; i++) {
            const scale = (dataArray[i % dataArray.length] / 128.0) + 0.5;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);

            // Update color
            const colorValue = dataArray[i % dataArray.length];
            color.setHSL(colorValue / 256, 1, 0.5);
            instancedMesh.setColorAt(i, color);
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
        instancedMesh.instanceColor.needsUpdate = true;
    }

    instancedMesh.rotation.y += 0.005;
    instancedMesh.rotation.x += 0.003;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

export { init };

// script.js

let scene, camera, renderer, cubes, controls, particleSystem, raycaster, mouse, analyser, dataArray;
const cubeCount = 150; // Adjusted for better performance
const particleCount = 2500; // Adjusted for better performance

const hoverColors = [
    0xff5733, 0xffbd33, 0x33ff57, 0x3357ff, 0xbd33ff,
    0xff33bd, 0x33ffbd, 0xbdff33, 0x5733ff, 0x33bdff
];

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20; // Adjusted for better visibility

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Optimize rendering
    document.getElementById('particle-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    const cubeGeometry = new THREE.BoxGeometry();
    const baseColor = 0x888888; // Base grey color

    cubes = new THREE.Group();

    for (let i = 0; i < cubeCount; i++) {
        const material = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.5,
            metalness: 0.5
        });

        const cube = new THREE.Mesh(cubeGeometry, material);
        cube.position.set((Math.random() * 2 - 1) * 10, (Math.random() * 2 - 1) * 10, (Math.random() * 2 - 1) * 10);
        cube.scale.set(Math.random() * 0.75 + 0.25, Math.random() * 0.75 + 0.25, Math.random() * 0.75 + 0.25);

        cubes.add(cube);
    }

    scene.add(cubes);

    // Adding enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Adding particles with improved motion
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
        velocities[i] = (Math.random() - 0.5) * 0.02; // Assign random velocities
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const particlesMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Set up audio context for music visualization
    const audio = document.getElementById('music-player');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    animate();

    // Ensure audio plays on user interaction
    const playButton = document.getElementById('play-button');
    playButton.addEventListener('click', () => {
        audioContext.resume().then(() => {
            audio.play().catch((e) => {
                console.error('Audio play error:', e);
            });
            gsap.to(playButton, { scale: 0, duration: 1, ease: "back.in" });
        });
    }, { once: true });

    // Prevent text selection
    document.getElementById('content').style.userSelect = 'none';

    // Mouse move event
    window.addEventListener('mousemove', onMouseMove, false);
}

function animate() {
    requestAnimationFrame(animate);

    analyser.getByteFrequencyData(dataArray);
    const positions = particleSystem.geometry.attributes.position.array;
    const velocities = particleSystem.geometry.attributes.velocity.array;

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Reset particles when they go out of bounds
        if (positions[i] > 10 || positions[i] < -10) velocities[i] *= -1;
        if (positions[i + 1] > 10 || positions[i + 1] < -10) velocities[i + 1] *= -1;
        if (positions[i + 2] > 10 || positions[i + 2] < -10) velocities[i + 2] *= -1;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;

    cubes.rotation.y += 0.0025; // Reduced speed for performance
    cubes.rotation.x += 0.0015;
    particleSystem.rotation.y += 0.0005; // Reduced speed for performance

    // Update cubes based on audio frequency data
    for (let i = 0; i < cubes.children.length; i++) {
        const cube = cubes.children[i];
        const scale = (dataArray[i] / 256) * 2 + 0.5;
        cube.scale.set(scale, scale, scale);
        const colorIndex = Math.floor((dataArray[i] / 256) * hoverColors.length);
        cube.material.color.setHex(hoverColors[colorIndex]);
    }

    renderer.render(scene, camera);
    controls.update();
}

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();

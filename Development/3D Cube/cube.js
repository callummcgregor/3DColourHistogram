/**
 * Created by callum on 09/08/15.
 */
var world = { };

/**
 * Called when the page loads
 * Initialises the world and initial objects within it
 */
function onLoad() {
    world.scene = new THREE.Scene();
    world.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    world.controls = new THREE.OrbitControls(world.camera);

    world.renderer = new THREE.WebGLRenderer();
    world.renderer.setSize(window.innerWidth, window.innerHeight);
    world.renderer.setClearColor(0x6d6d6d);
    document.body.appendChild(world.renderer.domElement);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
    var cube = new THREE.Mesh(geometry, material);
    world.scene.add(cube);

    world.camera.position.z = 5;

    render();
}

function render() {
    requestAnimationFrame(render);

    world.controls.update();

    world.renderer.render(world.scene, world.camera);
}
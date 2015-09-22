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

    var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

    var color, point, face, numberOfSides, vertexIndex;

    // faces are indexed using characters
    var faceIndices = [ 'a', 'b', 'c', 'd' ];

    var size = 1;
    var geometry = new THREE.BoxGeometry( size, size, size );

    // first, assign colors to vertices as desired
    for ( var i = 0; i < geometry.vertices.length; i++ ) {
        point = geometry.vertices[ i ];
        color = new THREE.Color( 0xffffff );
        color.setRGB( 0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size );
        geometry.colors[i] = color; // use this array for convenience
    }

    // copy the colors to corresponding positions
    //     in each face's vertexColors array.
    for ( var i = 0; i < geometry.faces.length; i++ )
    {
        face = geometry.faces[ i ];
        numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
        for( var j = 0; j < numberOfSides; j++ )
        {
            vertexIndex = face[ faceIndices[ j ] ];
            face.vertexColors[ j ] = geometry.colors[ vertexIndex ];
        }
    }

    cube = new THREE.Mesh( geometry, material );

    world.scene.add(cube);

    world.camera.position.z = 2;

    render();
}

function render() {
    requestAnimationFrame(render);

    world.controls.update();

    world.renderer.render(world.scene, world.camera);
}
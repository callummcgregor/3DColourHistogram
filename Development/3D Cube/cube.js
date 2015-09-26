/**
 * Created by callum on 09/08/15.
 */

/**
 * Called when the page loads
 * Initialises the world and initial objects within it
 */
function onLoad() {
    var world = { }; // Variable to hold state of the 3D rendering world

    world.scene = new THREE.Scene();
    world.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    world.controls = new THREE.OrbitControls( world.camera );

    world.renderer = new THREE.WebGLRenderer();
    world.renderer.setSize( window.innerWidth, window.innerHeight );
    world.renderer.setClearColor(0x6d6d6d);
    document.body.appendChild( world.renderer.domElement );

    world.camera.position.z = 2;

    createWireframeCube( world );

    render( world );
}

/**
 * Create a wireframe cube (without diagonals drawn), coloured with R, G, and B being 0 - 1 along
 *  the X, Y, and Z axis' respectively
 *
 * @param world The world in which the wireframe cube is drawn
 */
function createWireframeCube( world ) {

    var material = new THREE.LineBasicMaterial( {
        vertexColors: THREE.VertexColors
    } );

    var sidesGeometry = new THREE.Geometry();
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5, -0.5, -0.5 ) ); // Black
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5,  0.5, -0.5 ) ); // Green
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5,  0.5,  0.5 ) ); // Cyan
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5, -0.5,  0.5 ) ); // Blue
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5, -0.5, -0.5 ) ); // Black
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5, -0.5, -0.5 ) ); // Red
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5,  0.5, -0.5 ) ); // Yellow
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5,  0.5,  0.5 ) ); // White
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5, -0.5,  0.5 ) ); // Magenta
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5, -0.5, -0.5 ) ); // Red

    sidesGeometry = colourGeometryVerticesByPosition( sidesGeometry );

    var sides = new THREE.Line( sidesGeometry, material );

    var connectingEdgesGeometry = new THREE.Geometry();
    connectingEdgesGeometry.vertices.push( new THREE.Vector3 (  0.5,  0.5, -0.5 ) ); // Yellow
    connectingEdgesGeometry.vertices.push( new THREE.Vector3 ( -0.5,  0.5, -0.5 ) ); // Green
    connectingEdgesGeometry.vertices.push( new THREE.Vector3 (  0.5,  0.5,  0.5 ) ); // White
    connectingEdgesGeometry.vertices.push( new THREE.Vector3 ( -0.5,  0.5,  0.5 ) ); // Cyan
    connectingEdgesGeometry.vertices.push( new THREE.Vector3 (  0.5, -0.5,  0.5 ) ); // Magenta
    connectingEdgesGeometry.vertices.push( new THREE.Vector3 ( -0.5, -0.5,  0.5 ) ); // Blue

    connectingEdgesGeometry = colourGeometryVerticesByPosition( connectingEdgesGeometry );

    var connectingEdges = new THREE.LineSegments( connectingEdgesGeometry, material );

    world.scene.add( sides );
    world.scene.add( connectingEdges );
}

/**
 * Assign colour to the vertices of a geometry corresponding to their position relative to the (0, 0, 0) origin
 * Note: I believe that the size var assumes a unit geometry
 *
 * @param geometry The geometry to be coloured
 * @returns {*} The geometry once coloured
 */
function colourGeometryVerticesByPosition( geometry ) {
    var color, point;
    var size = 1;

    // Assign colours to each vertex corresponding to the position
    for ( var i = 0; i < geometry.vertices.length; i++ ) {
        point = geometry.vertices[ i ];
        color = new THREE.Color( 0xffffff );
        color.setRGB( 0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size );
        geometry.colors[i] = color; // use this array for convenience
    }

    return geometry;
}

/**
 * Responsible for redrawing the scene each frame
 *
 * @param world The world being rendered
 */
function render( world ) {

    world.controls.update();

    world.renderer.render( world.scene, world.camera );

    // Anom. function used because render() has parameters
    requestAnimationFrame( function() {
        render( world );
    } );
}
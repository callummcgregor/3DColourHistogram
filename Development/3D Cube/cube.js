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
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5, -0.5, -0.5 ) );
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5,  0.5, -0.5 ) );
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5,  0.5,  0.5 ) );
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5, -0.5,  0.5 ) );
    sidesGeometry.vertices.push( new THREE.Vector3( -0.5, -0.5, -0.5 ) );
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5, -0.5, -0.5 ) );
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5,  0.5, -0.5 ) );
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5,  0.5,  0.5 ) );
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5, -0.5,  0.5 ) );
    sidesGeometry.vertices.push( new THREE.Vector3(  0.5, -0.5, -0.5 ) );

    sidesGeometry = colourGeometryVerticesByPosition( sidesGeometry );

    var sides = new THREE.Line( sidesGeometry, material );

    var connectingLineGeometry1 = new THREE.Geometry();
    connectingLineGeometry1.vertices.push( new THREE.Vector3 (  0.5, 0.5, -0.5 ) );
    connectingLineGeometry1.vertices.push( new THREE.Vector3 ( -0.5, 0.5, -0.5 ) );

    connectingLineGeometry1 = colourGeometryVerticesByPosition( connectingLineGeometry1 );

    var connectingLine1 = new THREE.Line( connectingLineGeometry1, material );

    var connectingLineGeometry2 = new THREE.Geometry();
    connectingLineGeometry2.vertices.push( new THREE.Vector3 (  0.5, 0.5,  0.5 ) );
    connectingLineGeometry2.vertices.push( new THREE.Vector3 ( -0.5, 0.5,  0.5 ) );

    connectingLineGeometry2 = colourGeometryVerticesByPosition( connectingLineGeometry2 );

    var connectingLine2 = new THREE.Line( connectingLineGeometry2, material );

    var connectingLineGeometry3 = new THREE.Geometry();
    connectingLineGeometry3.vertices.push( new THREE.Vector3 (  0.5, -0.5,  0.5 ) );
    connectingLineGeometry3.vertices.push( new THREE.Vector3 ( -0.5, -0.5,  0.5 ) );

    connectingLineGeometry3 = colourGeometryVerticesByPosition( connectingLineGeometry3 );

    var connectingLine3 = new THREE.Line( connectingLineGeometry3, material );

    world.scene.add( sides );
    world.scene.add( connectingLine1 );
    world.scene.add( connectingLine2 );
    world.scene.add( connectingLine3 );
}

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

function render( world ) {

    world.controls.update();

    world.renderer.render( world.scene, world.camera );

    requestAnimationFrame( function() {
        render( world );
    } );



}
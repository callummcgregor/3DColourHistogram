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

    var colors = [
        new THREE.Color( 1.0, 1.0, 1.0 ),
        new THREE.Color( 1.0, 1.0, 0.0 ),
        new THREE.Color( 1.0, 0.0, 1.0 ),
        new THREE.Color( 1.0, 0.0, 0.0 ),
        new THREE.Color( 0.0, 1.0, 1.0 ),
        new THREE.Color( 0.0, 1.0, 0.0 ),
        new THREE.Color( 0.0, 0.0, 1.0 ),
        new THREE.Color( 0.0, 0.0, 0.0 ),
        new THREE.Color( 0.25, 0.25, 0.25 ),
        new THREE.Color( 0.5, 0.5, 0.5 ),
        new THREE.Color( 0.75, 0.75, 0.75 ),
        new THREE.Color( 1.0, 0.6, 0.72 )
    ];
    createWireframeCube( world );

    plotColors( world, colors );

    render( world );
}

/**
 * Takes in an array of colours and plots them in the unit cube, coloured appropriately.
 * Currently plots as constant radius spheres.
 *
 * @param world The world in which the colours will be plotted
 * @param colors An array of THREE.Colors to plot
 */
function plotColors( world, colors ) {
    var pointGeometry, pointMaterial, pointMesh;
    var combinedGeometry, combinedMaterial, combinedMesh;
    var sphereRadius = 0.075;
    var meshes = [];

    for ( var i = 0; i < colors.length; i++ ) {
        pointGeometry = new THREE.SphereGeometry( sphereRadius );
        pointMaterial = new THREE.MeshBasicMaterial(); // Changes made to this material will have no effect on the objects

        pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);

        var position = findPositionOfColor( colors[i] );

        pointMesh.position.x = position.x; // This works, but pointMesh.position = position does not
        pointMesh.position.y = position.y;
        pointMesh.position.z = position.z;

        meshes.push(pointMesh);
    }

    combinedGeometry = mergeMeshes( meshes );
    combinedMaterial = new THREE.ShaderMaterial( {
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: document.getElementById("fragmentShader").textContent,
        wireframe: true
    } );

    combinedMesh = new THREE.Mesh( combinedGeometry, combinedMaterial );

    world.scene.add( combinedMesh );
}

function findPositionOfColor( color ) {
    return new THREE.Vector3( color.r - 0.5, color.g - 0.5, color.b - 0.5 );
}

/**
 * Takes an array of meshes and merges them together for performance purposes
 *
 * @param meshes An array of meshes to be merged into one
 *
 * @return {*} The combined meshes
 */
function mergeMeshes( meshes ) {
    var combined = new THREE.Geometry();

    for ( var i = 0; i < meshes.length; i++ ) {
        meshes[i].updateMatrix();
        combined.merge( meshes[i].geometry, meshes[i].matrix );
    }

    return combined;
}

/**
 * Create a wireframe cube (without diagonals drawn), coloured with R, G, and B being 0 - 1 along
 *  the X, Y, and Z axis' respectively
 *
 * Note: Worth considering putting entire cube into a LineSegments geometry for the sake of performance
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
 * Assign colour to the vertices of a geometry corresponding to their position relative to the (0.5, 0.5, 0.5) origin
 *
 * @param geometry The geometry to be coloured
 * @returns {*} The geometry once coloured
 */
function colourGeometryVerticesByPosition( geometry ) {
    var color, point;

    // Assign colours to each vertex corresponding to the position
    for ( var i = 0; i < geometry.vertices.length; i++ ) {
        point = geometry.vertices[ i ];
        color = new THREE.Color( 0xffffff );
        color.set( findColorOfPoint( point ) );
        geometry.colors[i] = color; // use this array for convenience
    }

    return geometry;
}

/**
 * Calculates and returns the colour of a point relative to the (0.5, 0.5, 0.5) origin
 *
 * @param point
 * @returns {THREE.Color}
 */
function findColorOfPoint( point ) {
    return new THREE.Color( 0.5 + point.x, 0.5 + point.y, 0.5 + point.z );
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
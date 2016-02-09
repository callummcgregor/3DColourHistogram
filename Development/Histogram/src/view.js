/**
 * Define View and its fields
 *
 * @param model The model, listened to and data fetched from when it updates
 * @param elements HTML elements from the webpage
 */
function View(model, elements) {
    this._model = model;
    this._elements = elements;
    this._world = {};

    this.imageUploaded = new CustomEvent(this);
    this.imageDisplayed = new CustomEvent(this);
    this.constructLutButtonPressed = new CustomEvent(this);

    var _this = this;

    // Listeners on the model
    this._model.imageSaved.attach(function(sender, args) {
        _this.displayImage(args);
    });

    //this._model.colorsExtracted.attach(function(sender, args) {
    //    _this.plotColors(args);
    //});

    this._model.colorsTransformed.attach(function(sender, args) {
        _this.plotColors(args);
    });

    this._elements.imageUploadButton.change(function(e) {
        var file = e.target.files[0];
        if (file) {
            _this.imageUploaded.notify(file);
        }
    });

    this._elements.constructLutButton.click(function() {
        _this.constructLutButtonPressed.notify();
    });
}

View.prototype = {
    show: function() {
        this.renderColourSpace();
    },

    displayImage: function(image) {
        var imageCanvas = document.getElementById("image_canvas");
        var context = imageCanvas.getContext("2d");

        context.drawImage(image, 0, 0);

        this.imageDisplayed.notify(context);
    },

    renderColourSpace: function() {
        // Set up the Three.js variables, encapsulated in a world object
        var canvasWidth = $("#histogram_holder").width();
        var canvasHeight = $("#histogram_holder").height();

        this._world.scene = new THREE.Scene();
        this._world.camera = new THREE.PerspectiveCamera(75, canvasWidth/canvasHeight, 0.1, 1000);
        this._world.controls = new THREE.OrbitControls(this._world.camera);
        this._world.renderer = new THREE.WebGLRenderer();
        this._world.renderer.setSize(canvasWidth, canvasHeight);
        this._world.renderer.setClearColor(0x6d6d6d);
        this._world.camera.position.z = 2;

        // Append the Three.js rendered to the DOM
        var canvas = $("#histogram_holder");
        canvas.append(this._world.renderer.domElement);

        this.createWireframeCube();
        this.render();
    },

    /**
     * Create a wireframe cube (without diagonals drawn), coloured with R, G, and B being 0 - 1 along
     *  the X, Y, and Z axis' respectively
     *
     * Note: Worth considering putting entire cube into a LineSegments geometry for the sake of performance
     *
     * @param world The world in which the wireframe cube is drawn
     */
    createWireframeCube: function() {
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

        sidesGeometry = this.colourGeometryVerticesByPosition( sidesGeometry );

        var sides = new THREE.Line( sidesGeometry, material );

        var connectingEdgesGeometry = new THREE.Geometry();
        connectingEdgesGeometry.vertices.push( new THREE.Vector3 (  0.5,  0.5, -0.5 ) ); // Yellow
        connectingEdgesGeometry.vertices.push( new THREE.Vector3 ( -0.5,  0.5, -0.5 ) ); // Green
        connectingEdgesGeometry.vertices.push( new THREE.Vector3 (  0.5,  0.5,  0.5 ) ); // White
        connectingEdgesGeometry.vertices.push( new THREE.Vector3 ( -0.5,  0.5,  0.5 ) ); // Cyan
        connectingEdgesGeometry.vertices.push( new THREE.Vector3 (  0.5, -0.5,  0.5 ) ); // Magenta
        connectingEdgesGeometry.vertices.push( new THREE.Vector3 ( -0.5, -0.5,  0.5 ) ); // Blue

        connectingEdgesGeometry = this.colourGeometryVerticesByPosition( connectingEdgesGeometry );

        var connectingEdges = new THREE.LineSegments( connectingEdgesGeometry, material );

        this._world.scene.add( sides );
        this._world.scene.add( connectingEdges );
    },

    /**
     * Takes in an array of colours and plots them in the unit cube, coloured appropriately.
     * Currently plots as constant radius spheres.
     *
     * @param colors An array of THREE.Colors to plot
     */
    plotColors: function(colors) {
        var pointGeometry, pointMaterial, pointMesh;
        var combinedGeometry, combinedMaterial, combinedMesh;
        var maxSphereRadius = 0.1;
        var minSphereRadius = 0.01;
        var meshes = [];

        // Remove previous colour plots from the scene
        for(var i = this._world.scene.children.length - 1; i >= 0; i--) {
            if (this._world.scene.children[i].type == "Mesh") { // Assuming colour plots are always of the type "Mesh"
                this._world.scene.remove(this._world.scene.children[i]);
            }
        }

        // Find largest value in colors
        var maxValue = 0;
        var minValue = 1000000000; // TODO: not sustainable
        for (var i = 0; i < colors.length; i++) {
            if (colors[i].value > maxValue) {
                maxValue = colors[i].value;
            }
            if (colors[i].value < minValue || colors[i].value > 0) {
                minValue = colors[i].value;
            }
        }
        console.log("Max value: " + maxValue);
        console.log("Min value: " + minValue);

        for (var i = 0; i < colors.length; i++) {
            if (colors[i].value > 0) { // Only plot colours with a count > 0
                var percentageOfMaxValue = colors[i].value / maxValue; // In range 0 - 1
                var sphereRadius = percentageOfMaxValue * maxSphereRadius;
                if (sphereRadius < minSphereRadius) {
                    sphereRadius = minSphereRadius;
                }
                pointGeometry = new THREE.SphereGeometry(sphereRadius);
                pointMaterial = new THREE.MeshBasicMaterial(); // Changes made to this material will have no effect on the objects
                pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);

                var position = this.findPositionOfColor(colors[i].key);

                pointMesh.position.x = position.x; // This works, but pointMesh.position = position does not
                pointMesh.position.y = position.y;
                pointMesh.position.z = position.z;

                meshes.push(pointMesh);
            }
        }

        combinedGeometry = this.mergeMeshes(meshes);
        combinedMaterial = new THREE.ShaderMaterial( {
            vertexShader: document.getElementById("vertexShader").textContent,
            fragmentShader: document.getElementById("fragmentShader").textContent,
            wireframe: true
        } );

        combinedMesh = new THREE.Mesh( combinedGeometry, combinedMaterial );

        this._world.scene.add( combinedMesh );
    },

    /**
     * Assign colour to the vertices of a geometry corresponding to their position relative to the (0.5, 0.5, 0.5) origin
     *
     * @param geometry The geometry to be coloured
     * @returns {*} The geometry once coloured
     */
    colourGeometryVerticesByPosition: function(geometry) {
        var color, point;

        // Assign colours to each vertex corresponding to the position
        for ( var i = 0; i < geometry.vertices.length; i++ ) {
            point = geometry.vertices[ i ];
            color = new THREE.Color( 0xffffff );
            color.set(this.findColourOfPosition(point));
            geometry.colors[i] = color; // use this array for convenience
        }

        return geometry;
    },

    /**
     * Calculates and returns the colour of a point relative to the (0.5, 0.5, 0.5) origin
     *
     * @param point
     * @returns {THREE.Color}
     */
    findColourOfPosition: function(point) {
        return new THREE.Color(0.5 + point.x, 0.5 + point.y, 0.5 + point.z);
    },

    /**
     * Interpret a colour as a position in the 3D space
     * Shift by -0.5 to center around (0, 0, 0)
     *
     * @param color The colour to interpret as a position
     * @returns {THREE.Vector3} The inferred position of the given colour
     */
    findPositionOfColor: function(color) {
        return new THREE.Vector3(color.r - 0.5, color.g - 0.5, color.b- 0.5); // .r/.g/.b have range 0-1
    },

    /**
     * Takes an array of meshes and merges them together for performance purposes
     *
     * @param meshes An array of meshes to be merged into one
     * @return {*} The combined meshes
     */
    mergeMeshes: function(meshes) {
        var combined = new THREE.Geometry();

        for ( var i = 0; i < meshes.length; i++ ) {
            meshes[i].updateMatrix();
            combined.merge( meshes[i].geometry, meshes[i].matrix );
        }

        return combined;
    },

    /**
     * Responsible for redrawing the scene each frame
     *
     * @param world The world being rendered
     */
    render: function() {
        this._world.controls.update();
        this._world.renderer.render(this._world.scene, this._world.camera);

        var _this = this; // TODO: Ensure this works
        // Anom. function used because render() has parameters
        requestAnimationFrame( function() {
            _this.render();
        } );
    }
};
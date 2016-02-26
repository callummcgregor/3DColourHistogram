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

    var _this = this;

    // Listeners on the model
    this._model.imageReady.attach(function(sender, args) {
        _this.displayImage(args);
    });

    this._model.sRGBColorsReady.attach(function(sender, args) {
        _this.plotRGBColors(args);
    });

    this._model.labColorsReady.attach(function(sender, args) {
        console.log("Plotting lab colours: ", args);
        _this.plotLabColors(args);
    });

    this._elements.imageUploadButton.change(function(e) {
        var file = e.target.files[0];
        if (file) {
            _this.imageUploaded.notify(file);
        }
    });

    this._elements.colorSpaceRadio.change(function(e) {
        console.log("Colour space changed to " + e.target.value);
        _this.createLabWireframeCube();
        _this._model.convertColorsToLab();
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

        this.createRGBWireframeCube();
        this.render();
    },

    /**
     * Create a wireframe cube (without diagonals drawn), coloured with R, G, and B being 0 - 1 along
     *  the X, Y, and Z axis' respectively
     *
     * Note: Worth considering putting entire cube into a LineSegments geometry for the sake of performance
     */
    createRGBWireframeCube: function() {
        this.clearCanvas();

        var vShader = $('#vertexShaderRgb');
        var fShader = $('#fragmentShaderRgb');

        var material = new THREE.ShaderMaterial({
            vertexShader: vShader.text(),
            fragmentShader: fShader.text()
        });

        var sidesGeometry = new THREE.Geometry();
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, -0.5)); // Black
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5, -0.5)); // Green
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5,  0.5)); // Cyan
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5,  0.5)); // Blue
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, -0.5)); // Black
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5, -0.5)); // Red
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5, -0.5)); // Yellow
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5,  0.5)); // White
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5,  0.5)); // Magenta
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5, -0.5)); // Red
        var sides = new THREE.Line( sidesGeometry, material );

        var connectingEdgesGeometry = new THREE.Geometry();
        connectingEdgesGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5, -0.5)); // Yellow
        connectingEdgesGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5, -0.5)); // Green
        connectingEdgesGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5,  0.5)); // White
        connectingEdgesGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5,  0.5)); // Cyan
        connectingEdgesGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5,  0.5)); // Magenta
        connectingEdgesGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5,  0.5)); // Blue
        var connectingEdges = new THREE.LineSegments(connectingEdgesGeometry, material);

        this._world.scene.add(sides);
        this._world.scene.add(connectingEdges);
    },

    createLabWireframeCube: function() {
        this.clearCanvas();

        var vShader = $('#vertexShaderLab');
        var fShader = $('#fragmentShaderLab');

        var material = new THREE.ShaderMaterial({
            vertexShader: vShader.text(),
            fragmentShader: fShader.text()
        });

        // Create cube
        var sidesGeometry = new THREE.Geometry();
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, -0.5)); // Black
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5, -0.5)); // Green
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5,  0.5)); // Cyan
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5,  0.5)); // Blue
        sidesGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5, -0.5)); // Black
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5, -0.5)); // Red
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5, -0.5)); // Yellow
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5,  0.5)); // White
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5,  0.5)); // Magenta
        sidesGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5, -0.5)); // Red
        var sides = new THREE.Line(sidesGeometry, material);

        var connectingEdgesGeometry = new THREE.Geometry();
        connectingEdgesGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5, -0.5)); // Yellow
        connectingEdgesGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5, -0.5)); // Green
        connectingEdgesGeometry.vertices.push(new THREE.Vector3( 0.5,  0.5,  0.5)); // White
        connectingEdgesGeometry.vertices.push(new THREE.Vector3(-0.5,  0.5,  0.5)); // Cyan
        connectingEdgesGeometry.vertices.push(new THREE.Vector3( 0.5, -0.5,  0.5)); // Magenta
        connectingEdgesGeometry.vertices.push(new THREE.Vector3(-0.5, -0.5,  0.5)); // Blue
        var connectingEdges = new THREE.LineSegments(connectingEdgesGeometry, material);

        this._world.scene.add(sides);
        this._world.scene.add(connectingEdges);

        // Create axes
        var lAxisGeometry = new THREE.Geometry();
        lAxisGeometry.vertices.push(new THREE.Vector3(0.0, -0.5, 0.0)); // L = 0
        lAxisGeometry.vertices.push(new THREE.Vector3(0.0,  0.5, 0.0)); // L = 100
        var lAxis = new THREE.Line(lAxisGeometry, material);

        var aAxisGeometry = new THREE.Geometry();
        aAxisGeometry.vertices.push(new THREE.Vector3(-0.5, 0.0, 0.0)); // a-
        aAxisGeometry.vertices.push(new THREE.Vector3( 0.5, 0.0, 0.0)); // a+
        var aAxis = new THREE.Line(aAxisGeometry, material);

        var bAxisGeometry = new THREE.Geometry();
        bAxisGeometry.vertices.push(new THREE.Vector3(0.0, 0.0, -0.5)); // b-
        bAxisGeometry.vertices.push(new THREE.Vector3(0.0, 0.0,  0.5)); // b+
        var bAxis = new THREE.Line(bAxisGeometry, material);

        this._world.scene.add(lAxis);
        this._world.scene.add(aAxis);
        this._world.scene.add(bAxis);

        // Create plane at L = 50
        var planeGeometry = new THREE.BufferGeometry();
        var vertexPositions = [
            [-0.5, 0.0,  0.5],
            [ 0.5, 0.0,  0.5],
            [ 0.5, 0.0, -0.5],

            [ 0.5, 0.0, -0.5],
            [-0.5, 0.0, -0.5],
            [-0.5, 0.0,  0.5]
        ];
        var vertices = new Float32Array(vertexPositions.length * 3);
        for(var i = 0; i < vertexPositions.length; i++) {
            vertices[i*3 + 0] = vertexPositions[i][0];
            vertices[i*3 + 1] = vertexPositions[i][1];
            vertices[i*3 + 2] = vertexPositions[i][2];
        }
        planeGeometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        var plane = new THREE.Mesh(planeGeometry, material);

        this._world.scene.add(plane);
    },

    /**
     * Takes in an array of colours and plots them in the unit cube, coloured appropriately.
     * Currently plots as constant radius spheres.
     *
     * @param colors A dictionary of Colors (the keys) and the number of that colour present (the values)
     */
    plotRGBColors: function(colors) {
        var pointGeometry, pointMaterial, pointMesh;
        var combinedGeometry, combinedMaterial, combinedMesh;
        var maxSphereRadius = 0.1;
        var minSphereRadius = 0.001;
        var meshes = [];

        // Remove previous colour plots from the scene
        this.clearHistogram();

        // Find largest value in colors
        var maxValue = 0;
        var minValue = 1000000000; // TODO: not sustainable
        for (var i = 0; i < colors.length; i++) {
            if (colors[i].value > maxValue) {
                maxValue = colors[i].value;
            }
            if (colors[i].value < minValue) {
                minValue = colors[i].value;
            }
            // TODO: Prevent 0 value colours from being in this list
        }
        console.log("Max value: " + maxValue);
        console.log("Min value: " + minValue);

        for (var i = 0; i < colors.length; i++) {
            if (colors[i].value > 0) {
                // Uses ln(x+1) to scale large results down so they don't dwarf others
                // x+1 ensures that y is always postive for x (i.e. when value = 1, ln != 0)
                var scaledPercentageOfMaxValue = Math.log(colors[i].value + 1) / Math.log(maxValue + 1);
                var sphereRadius = scaledPercentageOfMaxValue * maxSphereRadius;

                // Ensure tiny ones are still visible
                if (sphereRadius < minSphereRadius) {
                    sphereRadius = minSphereRadius;
                }

                pointGeometry = new THREE.SphereGeometry(sphereRadius);
                pointMaterial = new THREE.MeshBasicMaterial(); // Changes made to this material will have no effect on the objects
                pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);

                var position = this.findPositionOfRGBColor(colors[i].key.rgb);

                pointMesh.position.x = position.x; // This works, but pointMesh.position = position does not
                pointMesh.position.y = position.y;
                pointMesh.position.z = position.z;

                meshes.push(pointMesh);
            }
        }

        combinedGeometry = this.mergeMeshes(meshes);
        combinedMaterial = new THREE.ShaderMaterial({
            vertexShader: $("#vertexShaderRgb").text(),
            fragmentShader: $("#fragmentShaderRgb").text(),
            wireframe: true
        });

        combinedMesh = new THREE.Mesh(combinedGeometry, combinedMaterial);

        this._world.scene.add(combinedMesh);
    },

    plotLabColors: function(colors) {
        var pointGeometry, pointMaterial, pointMesh;
        var combinedGeometry, combinedMaterial, combinedMesh;
        var maxSphereRadius = 0.1;
        var minSphereRadius = 0.001;
        var meshes = [];

        // Remove previous colour plots from the scene
        this.clearHistogram();

        // Find largest value in colors
        var maxValue = 0;
        var minValue = 1000000000; // TODO: not sustainable
        for (var i = 0; i < colors.length; i++) {
            if (colors[i].value > maxValue) {
                maxValue = colors[i].value;
            }
            if (colors[i].value < minValue) {
                minValue = colors[i].value;
            }
            // TODO: Prevent 0 value colours from being in this list
        }
        console.log("Max value: " + maxValue);
        console.log("Min value: " + minValue);

        for (var i = 0; i < colors.length; i++) {
            if (colors[i].value > 0) {
                // Uses ln(x+1) to scale large results down so they don't dwarf others
                // x+1 ensures that y is always postive for x (i.e. when value = 1, ln != 0)
                var scaledPercentageOfMaxValue = Math.log(colors[i].value + 1) / Math.log(maxValue + 1);
                var sphereRadius = scaledPercentageOfMaxValue * maxSphereRadius;

                // Ensure tiny ones are still visible
                if (sphereRadius < minSphereRadius) {
                    sphereRadius = minSphereRadius;
                }

                pointGeometry = new THREE.SphereGeometry(sphereRadius);
                pointMaterial = new THREE.MeshBasicMaterial(); // Changes made to this material will have no effect on the objects
                pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);

                var position = this.findPositionOfRGBColor(colors[i].key.rgb); // TODO: Hmmm

                pointMesh.position.x = position.x; // This works, but pointMesh.position = position does not
                pointMesh.position.y = position.y;
                pointMesh.position.z = position.z;

                meshes.push(pointMesh);
            }
        }

        combinedGeometry = this.mergeMeshes(meshes);
        combinedMaterial = new THREE.ShaderMaterial({
            vertexShader: $("#vertexShaderLab").text(),
            fragmentShader: $("#fragmentShaderLab").text(),
            wireframe: true
        });

        combinedMesh = new THREE.Mesh(combinedGeometry, combinedMaterial);

        this._world.scene.add(combinedMesh);
    },

    clearHistogram: function() {
        for(var i = this._world.scene.children.length - 1; i >= 0; i--) {
            if (this._world.scene.children[i].type == "Mesh") { // Assuming colour plots are always of the type "Mesh"
                this._world.scene.remove(this._world.scene.children[i]);
            }
        }
    },

    clearCanvas: function() {
        for(var i = this._world.scene.children.length - 1; i >= 0; i--) {
            //console.log(this._world.scene.children[i].type);
            //if (this._world.scene.children[i].type == "Line" || "LineSegments") { // Assuming colour plots are always of the type "Mesh"
                this._world.scene.remove(this._world.scene.children[i]);
            //}
        }
    },

    /**
     * Interpret a colour as a position in the 3D space
     * Shift by -0.5 to center around (0, 0, 0)
     *
     * @param color The colour to interpret as a position
     * @returns {THREE.Vector3} The inferred position of the given colour
     */
    findPositionOfRGBColor: function(color) {
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

        var _this = this;
        // Anom. function used because render() has parameters
        requestAnimationFrame( function() {
            _this.render();
        } );
    }
};
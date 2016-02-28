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
    this._colorSpace = Color.rgbEnum;

    this.imageUploaded = new CustomEvent(this);
    this.imageDisplayed = new CustomEvent(this);

    var _this = this;

    // Listeners on the model
    this._model.imageReady.attach(function(sender, args) {
        _this.displayImage(args);
    });

    this._model.colorsReady.attach(function(sender, args) {
        _this.plotColors();
    });

    this._elements.imageUploadButton.change(function(e) {
        var file = e.target.files[0];
        if (file) {
            _this.imageUploaded.notify(file);
        }
    });

    this._elements.colorSpaceRadio.change(function(e) {
        console.log("Colour space changed to " + e.target.value.toString());

        if (e.target.value != Color.rgbEnum && e.target.value != Color.labEnum) {
            throw new Exception("Unrecognised color space, " + e.target.value);
        } else {
            _this._colorSpace = e.target.value;
        }

        _this.createWireframeCube();
        if (_this._model._colors != null) {
            _this.plotColors();
        }
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
     */
    createWireframeCube: function() {
        this.clearCanvas();

        // Select appropriate shaders
        if (this._colorSpace == Color.rgbEnum) {
            console.log("Rgb shader");
            var vShader = $('#vertexShaderRgb').text();
            var fShader = $('#fragmentShaderRgb').text();
        } else if (this._colorSpace == Color.labEnum) {
            console.log("Rgb shader");
            var vShader = $('#vertexShaderLab').text();
            var fShader = $('#fragmentShaderLab').text();
        }

        // Create material
        var material = new THREE.ShaderMaterial({
            vertexShader: vShader,
            fragmentShader: fShader
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

        // If Lab, also plot the axes
        if (this._colorSpace == Color.labEnum) {
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
        }
    },

    /**
     * Takes in an array of colours and plots them in the unit cube, coloured appropriately.
     * Currently plots as constant radius spheres.
     */
    plotColors: function() {
        var pointMeshes = []; // Collection of point meshes
        var combinedGeometry, combinedMaterial, combinedMesh; // Geom, material, and mesh for all points as a collective
        var maxSphereRadius = 0.1;
        var minSphereRadius = 0.001;

        // Remove previous colour plots from the scene
        this.clearHistogram();

        colorDict = [];
        var colors  = this._model._colors;

        if (this._colorSpace == Color.rgbEnum) {
            console.log("Rgb path");

            for (var i = 0; i < colors.length; i++) {
                var quantisedColor = colors[i].quantiseRgb();

                var found = false;
                var count = 0;

                while (!found && count < colorDict.length) {
                    if (quantisedColor.r == colorDict[count].key.getRgb().r && quantisedColor.g == colorDict[count].key.getRgb().g && quantisedColor.b == colorDict[count].key.getRgb().b) {
                        colorDict[count].value += 1;
                        found = true;
                    }
                    count += 1;
                }
                if (!found) {
                    var newColor = new Color();
                    newColor.setRgb(quantisedColor.r, quantisedColor.g, quantisedColor.b);
                    colorDict.push({
                        key: newColor,
                        value: 1
                    })
                }
            }
        } else if (this._colorSpace == Color.labEnum) {
            console.log("Lab path");

            for (var i = 0; i < colors.length; i++) {
                var quantisedColor = colors[i].quantiseLab();

                var found = false;
                var count = 0;
                while (!found && count < colorDict.length) {
                    if (quantisedColor.l == colorDict[count].key.getLab().l && quantisedColor.a == colorDict[count].key.getLab().a && quantisedColor.b == colorDict[count].key.getLab().b) {
                        colorDict[count].value += 1;
                        found = true;
                    }
                    count += 1;
                }
                if (!found) {
                    var newColor = new Color();
                    newColor.setLab(quantisedColor.l, quantisedColor.a, quantisedColor.b); // TODO: Just use an array/object?
                    colorDict.push({
                        key: newColor,
                        value: 1
                    })
                }
            }
        }

        // Find min and max value in colorDict
        var maxValue = colorDict[0].value;
        var minValue = colorDict[0].value;
        for (var i = 0; i < colorDict.length; i++) {
            if (colorDict[i].value > maxValue) {
                maxValue = colorDict[i].value;
            }
            if (colorDict[i].value < minValue) {
                minValue = colorDict[i].value;
            }
            // TODO: Prevent 0 value colours from being in this list
        }
        console.log("Max value: " + maxValue);
        console.log("Min value: " + minValue);

        // Create mesh for each colour (with a value greater than 0)
        for (var i = 0; i < colorDict.length; i++) {
            if (colorDict[i].value > 0) {
                // Uses ln(x+1) to scale large results down so they don't dwarf others
                // x+1 ensures that y is always postive for x (i.e. when value = 1, ln != 0)
                var scaledPercentageOfMaxValue = Math.log(colorDict[i].value + 1) / Math.log(maxValue + 1);
                var sphereRadius = scaledPercentageOfMaxValue * maxSphereRadius;

                // Ensure small values are still visible
                if (sphereRadius < minSphereRadius) {
                    sphereRadius = minSphereRadius;
                }

                var pointMesh = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius), new THREE.MeshBasicMaterial()); // Changes made to this material will have no effect on the objects

                // Set the position of the mesh according to a colour
                if (this._colorSpace == Color.rgbEnum) {
                    var position = this.findPositionOfRgbColor(colorDict[i].key.getRgb());
                } else if (this._colorSpace == Color.labEnum) {
                    var position = this.findPositionOfLabColor(colorDict[i].key.getLab());
                }
                pointMesh.position.x = position.x; // This works, but pointMesh.position = position does not
                pointMesh.position.y = position.y;
                pointMesh.position.z = position.z;

                pointMeshes.push(pointMesh);
            }
        }

        // Select appropriate shaders
        if (this._colorSpace == Color.rgbEnum) {
            console.log("Rgb shader");
            var vShader = $('#vertexShaderRgb').text();
            var fShader = $('#fragmentShaderRgb').text();
        } else if (this._colorSpace == Color.labEnum) {
            console.log("Rgb shader");
            var vShader = $('#vertexShaderLab').text();
            var fShader = $('#fragmentShaderLab').text();
        }

        // Combine point meshes into a single mesh
        combinedGeometry = this.mergeMeshes(pointMeshes);
        combinedMaterial = new THREE.ShaderMaterial({
            vertexShader: vShader,
            fragmentShader: fShader,
            wireframe: true
        });
        combinedMesh = new THREE.Mesh(combinedGeometry, combinedMaterial);

        // Add combined mesh to the scene (i.e. plot points on the histogram)
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
            this._world.scene.remove(this._world.scene.children[i]);
        }
    },

    /**
     * Interpret a colour as a position in the 3D space
     * Shift by -0.5 to center around (0, 0, 0)
     *
     * @param color The colour to interpret as a position
     * @returns {THREE.Vector3} The inferred position of the given colour
     */
    findPositionOfRgbColor: function(color) {
        return new THREE.Vector3(color.r - 0.5, color.g - 0.5, color.b- 0.5); // .r/.g/.b have range 0-1
    },

    findPositionOfLabColor: function(color) {
        return new THREE.Vector3(color.a / 256.0, (color.l / 100.0) - 0.5, color.b / 256.0);
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
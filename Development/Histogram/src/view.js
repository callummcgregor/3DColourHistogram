/**
 * The View
 *
 * @param model The model, listened to and data fetched from when it updates
 * @param elements HTML elements from the webpage
 */
function View(model, elements) {
    // Private fields
    var _model = model;
    var _elements = elements;
    var _world = {};
    var _colorSpace = Color.RGB;
    var _this = this; // Allows access to public fields from private methods

    // Public fields
    this.imageUploaded = new CustomEvent(this);
    this.imageDisplayed = new CustomEvent(this);

    // Attach listeners to the model and elements
    _model.imageReady.attach(function(sender, args) {
        setupImageCanvas(args);
    });

    _model.colorsChanged.attach(function() {
        plotColors();
        updateImageCanvas();
    });

    _elements.imageUploadButton.change(function(e) {
        var file = e.target.files[0];
        if (file) {
            _this.imageUploaded.notify(file);
        }
    });

    _elements.colorControls.change(function(e) {
        console.log(e.target.id + " changed to " + e.target.value);
        _model.applyColorChanges(e.target.id, e.target.value);
    });

    _elements.colorSpaceRadio.change(function(e) {
        var space = e.target.value;

        console.log("Colour space changed to " + e.target.value.toString());

        if (space != Color.RGB && space != Color.LAB) {
            throw new Exception("Unrecognised color space, " + e.target.value);
        } else {
            _colorSpace = space;
        }

        if (space == Color.RGB) {
            drawRgbSpace();
        } else if (space == Color.LAB) {
            drawLabSpace();
        }

        plotColors();
    });

    // Public methods
    this.show = function() {
        initCanvas();
    };

    // Private methods
    /**
     * Sets up the image canvas with the HTML5 Image object passed from the model
     *
     * @param image HTML5 Image object
     */
    var setupImageCanvas = function(image) {
        var imageCanvas = document.getElementById("image_canvas");
        imageCanvas.setAttribute("width", image.width);
        imageCanvas.setAttribute("height", image.height);
        var context = imageCanvas.getContext("2d");

        console.log("Image width : ", image.width);
        console.log("Image height: ", image.height);

        context.drawImage(image, 0, 0);

        _this.imageDisplayed.notify(context);
    };

    /**
     * Updates the image canvas with the new colours from the model
     */
    var updateImageCanvas = function() {
        var modifiedColors = _model.getColors();

        var context = document.getElementById("image_canvas").getContext("2d");
        var width = context.canvas.width;
        var height = context.canvas.height;

        var data = new Uint8ClampedArray(4 * width * height);

        for (var y = 0; y < height; y += 1) {
            for (var x = 0; x < width; x += 1) {
                data[(x * 4) + (y * (width * 4)) + 0] = modifiedColors[x + (y * context.canvas.width)].getRgb().r * 255;
                data[(x * 4) + (y * (width * 4)) + 1] = modifiedColors[x + (y * context.canvas.width)].getRgb().g * 255;
                data[(x * 4) + (y * (width * 4)) + 2] = modifiedColors[x + (y * context.canvas.width)].getRgb().b * 255;
                data[(x * 4) + (y * (width * 4)) + 3] = 255; // Alpha (assume to always be full)
            }
        }

        var imageData = new ImageData(data, width, height);
        context.putImageData(imageData, 0, 0);
    };

    /**
     * Sets up the canvas for the first time and draws the RGB cube by default
     */
    var initCanvas = function() {
        // Set up the Three.js variables, encapsulated in a world object
        var canvas = $("#histogram_holder");
        var canvasWidth = canvas.width();
        var canvasHeight = canvas.height();

        _world.scene = new THREE.Scene();
        _world.camera = new THREE.PerspectiveCamera(75, canvasWidth/canvasHeight, 0.1, 1000);
        if (document.getElementById("histogram_holder") != null) {
            _world.controls = new THREE.OrbitControls(_world.camera, document.getElementById("histogram_holder")); // Second parameter limits controls to the DOM object passed in
        } else {
            _world.controls = new THREE.OrbitControls(_world.camera); // So the tests don't trip up when there are no DOM elements
        }
        _world.renderer = new THREE.WebGLRenderer();
        _world.renderer.setSize(canvasWidth, canvasHeight);
        _world.renderer.setClearColor(0x6d6d6d);
        _world.camera.position.z = 2;

        // Append the Three.js rendered to the DOM
        canvas.append(_world.renderer.domElement);

        drawRgbSpace(); // TODO: Draw which ever space is selected in radio button, in case user changes this before the canvas is instantiated
        render();
    };

    /**
     * Create a wireframe cube (without diagonals drawn), coloured with R, G, and B being 0 - 1 along
     *  the X, Y, and Z axis' respectively
     *
     * Note: Worth considering putting entire cube into a LineSegments geometry for the sake of performance
     */
    var drawRgbSpace = function() {
        clearCanvas();

        // Create material
        var material = new THREE.ShaderMaterial({
            vertexShader: $('#vertexShaderRgb').text(),
            fragmentShader: $('#fragmentShaderRgb').text()
        });

        // Create wireframe cube
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

        _world.scene.add(sides);
        _world.scene.add(connectingEdges);
    };

    var drawLabSpace = function() {
        clearCanvas();

        // Create material
        var material = new THREE.ShaderMaterial({
            vertexShader: $('#vertexShaderLab').text(),
            fragmentShader: $('#fragmentShaderLab').text()
        });

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

        _world.scene.add(lAxis);
        _world.scene.add(aAxis);
        _world.scene.add(bAxis);
    };

    var plotColors = function() {
        console.log("Plotting colours");

        var pointMeshes = []; // Collection of point meshes
        var combinedGeometry, combinedMaterial, combinedMesh; // Geom, material, and mesh for all points as a collective
        var maxSphereRadius = 0.1;
        var minSphereRadius = 0.001;

        // Remove previous colour plots from the scene
        clearHistogram();

        colorDict = [];
        var colors  = _model.getColors();

        // TODO: Restructure if/else to minimise duplicate code
        if (_colorSpace == Color.RGB) {
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
        } else if (_colorSpace == Color.LAB) {
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
                var position;
                if (_colorSpace == Color.RGB) {
                    position = findPositionOfRgbColor(colorDict[i].key.getRgb());
                } else if (_colorSpace == Color.LAB) {
                    position = findPositionOfLabColor(colorDict[i].key.getLab());
                }
                pointMesh.position.x = position.x; // This works, but pointMesh.position = position does not
                pointMesh.position.y = position.y;
                pointMesh.position.z = position.z;

                pointMeshes.push(pointMesh);
            }
        }

        // Select appropriate shaders
        var vShader;
        var fShader;
        if (_colorSpace == Color.RGB) {
            vShader = $('#vertexShaderRgb').text();
            fShader = $('#fragmentShaderRgb').text();
        } else if (_colorSpace == Color.LAB) {
            vShader = $('#vertexShaderLab').text();
            fShader = $('#fragmentShaderLab').text();
        }

        // Combine point meshes into a single mesh
        combinedGeometry = mergeMeshes(pointMeshes);
        combinedMaterial = new THREE.ShaderMaterial({
            vertexShader: vShader,
            fragmentShader: fShader,
            wireframe: true
        });
        combinedMesh = new THREE.Mesh(combinedGeometry, combinedMaterial);

        // Add combined mesh to the scene (i.e. plot points on the histogram)
        _world.scene.add(combinedMesh);
    };

    var clearHistogram = function() {
        for(var i = _world.scene.children.length - 1; i >= 0; i--) {
            if (_world.scene.children[i].type == "Mesh") { // Assuming colour plots are always of the type "Mesh"
                _world.scene.remove(_world.scene.children[i]);
            }
        }
    };

    var clearCanvas = function() {
        for(var i = _world.scene.children.length - 1; i >= 0; i--) {
            _world.scene.remove(_world.scene.children[i]);
        }
    };

    /**
     * Interpret a colour as a position in the 3D space
     * Shift by -0.5 to center around (0, 0, 0)
     *
     * @param color The colour to interpret as a position
     * @returns {THREE.Vector3} The inferred position of the given colour
     */
    var findPositionOfRgbColor = function(color) {
        return new THREE.Vector3(color.r - 0.5, color.g - 0.5, color.b- 0.5); // .r/.g/.b have range 0-1
    };

    var findPositionOfLabColor = function(color) {
        return new THREE.Vector3(color.a / 256.0, (color.l / 100.0) - 0.5, color.b / 256.0);
    };

    /**
     * Takes an array of meshes and merges them together for performance purposes
     *
     * @param meshes An array of meshes to be merged into one
     * @return {*} The combined meshes
     */
    var mergeMeshes = function(meshes) {
        var combined = new THREE.Geometry();

        for ( var i = 0; i < meshes.length; i++ ) {
            meshes[i].updateMatrix();
            combined.merge(meshes[i].geometry, meshes[i].matrix);
        }

        return combined;
    };

    /**
     * Responsible for redrawing the scene each frame
     */
    var render = function() {
        _world.controls.update();
        _world.renderer.render(_world.scene, _world.camera);

        //var _this = this;
        // Anom. function used because render() has parameters
        requestAnimationFrame(function () {
            //_this.render();
            render();
        });
    };
}
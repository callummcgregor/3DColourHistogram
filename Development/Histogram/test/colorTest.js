QUnit.module("Color Tests");

QUnit.test("Test setRgb with correct arguments", function(assert) {
    var newColor = new Color();
    newColor.setRgb(1.0, 0.0, 1.0); // A nice magenta

    assert.equal(newColor.getRgb().r, 1.0);
    assert.equal(newColor.getRgb().g, 0.0);
    assert.equal(newColor.getRgb().b, 1.0);

    assert.notEqual(newColor.getLab(), null);
});

QUnit.test("Test setRgb with arguments out of accepted range", function(assert) {
    var erroneousColors = [
        [-1.0,  0.0,  0.0],
        [ 0.0, -1.0,  0.0],
        [ 0.0,  0.0, -1.0],
        [ 2.0,  0.0,  0.0],
        [ 0.0,  2.0,  0.0],
        [ 0.0,  0.0,  2.0]
    ];

    for (var i = 0; i < erroneousColors.length; i++) {
        assert.throws(
            function() {
                var newColor = new Color().setRgb(erroneousColors[i][0], erroneousColors[i][1], erroneousColors[i][2]);
            },
            function(e) {
                return e.toString() == "Inputted values must be in range 0-1 (inclusive)";
            }
        );
    }
});

QUnit.test("Test setLab with correct arguments", function(assert) {
    var newColor = new Color();
    newColor.setLab(60.320, 98.254, -60.843);

    assert.equal(newColor.getLab().l, 60.320);
    assert.equal(newColor.getLab().a, 98.254);
    assert.equal(newColor.getLab().b, -60.843);

    assert.notEqual(newColor.getRgb(), null);
});

QUnit.test("Test setLab with arguments out of accepted range", function(assert) {
    var erroneousColors = [
        [  -1.0,    0.0,     0.0],
        [ 101.0,    0.0,     0.0],
        [  50.0, -129.0,     0.0],
        [  50.0,  128.0,     0.0],
        [  50.0,    0.0,  -129.0],
        [  50.0,    0.0,   128.0]
    ];

    for (var i = 0; i < erroneousColors.length; i++) {
        assert.throws(
            function() {
                var newColor = new Color().setLab(erroneousColors[i][0], erroneousColors[i][1], erroneousColors[i][2]);
            },
            function(e) {
                return e.toString() == "Inputted values outside accepted ranges";
            }
        );
    }
});

QUnit.test("Test rgbToLab", function(assert) {
    var tolerance = 1;

    var testColorsRgb = [
        [0.0, 0.0, 0.0], // Black
        [0.0, 0.0, 1.0], // Blue
        [0.0, 1.0, 0.0], // Green
        [0.0, 1.0, 1.0], // Cyan
        [1.0, 0.0, 0.0], // Red
        [1.0, 0.0, 1.0], // Magenta
        [1.0, 1.0, 0.0], // Yellow
        [1.0, 1.0, 1.0], // White
        [0.5, 0.5, 0.5]  // Mid-grey
    ];
    var testColorsLab = [
        [  0.000,   0.000,    0.000], // Black
        [ 32.303,  79.197, -107.864], // Blue
        [ 87.737, -86.185,   83.181], // Green
        [ 91.117, -48.080,  -14.138], // Cyan
        [ 53.233,  80.109,   67.220], // Red
        [ 60.320,  98.254,  -60.843], // Magenta
        [ 97.138, -21.556,   94.482], // Yellow
        [100.000,   0.005,   -0.010], // White
        [ 53.389,   0.003,   -0.006]  // Mid-grey
    ];

    for (var i = 0; i < testColorsRgb.length; i++) {
        var newColor = new Color();
        newColor.setRgb(testColorsRgb[i][0], testColorsRgb[i][1], testColorsRgb[i][2]);
        var lab = newColor.getLab();

        assertClose(assert, lab.l, testColorsLab[i][0], tolerance, "");
        assertClose(assert, lab.a, testColorsLab[i][1], tolerance, "");
        assertClose(assert, lab.b, testColorsLab[i][2], tolerance, "");
    }

    assert.equal(true, true); // To stop QUnit bitching at me
});

QUnit.test("Test labToRgb", function(assert) {
    var tolerance = 1/255;

    var testColorsLab = [
        [  0.000,   0.000,    0.000], // Black
        [ 32.303,  79.197, -107.864], // Blue
        [ 87.737, -86.185,   83.181], // Green
        [ 91.117, -48.080,  -14.138], // Cyan
        [ 53.233,  80.109,   67.220], // Red
        [ 60.320,  98.254,  -60.843], // Magenta
        [ 97.138, -21.556,   94.482], // Yellow
        [100.000,   0.005,   -0.010], // White
        [ 53.389,   0.003,   -0.006]  // Mid-grey
    ];
    var testColorsRgb = [
        [0.0, 0.0, 0.0], // Black
        [0.0, 0.0, 1.0], // Blue
        [0.0, 1.0, 0.0], // Green
        [0.0, 1.0, 1.0], // Cyan
        [1.0, 0.0, 0.0], // Red
        [1.0, 0.0, 1.0], // Magenta
        [1.0, 1.0, 0.0], // Yellow
        [1.0, 1.0, 1.0], // White
        [0.5, 0.5, 0.5]  // Mid-grey
    ];

    for (var i = 0; i < testColorsLab.length; i++) {
        var newColor = new Color();
        newColor.setLab(testColorsLab[i][0], testColorsLab[i][1], testColorsLab[i][2]);
        newColor.labToRgb();
        var rgb = newColor.getRgb();

        assertClose(assert, rgb.r, testColorsRgb[i][0], tolerance, "");
        assertClose(assert, rgb.g, testColorsRgb[i][1], tolerance, "");
        assertClose(assert, rgb.b, testColorsRgb[i][2], tolerance, "");
    }

    assert.equal(true, true); // To stop QUnit bitching at me
});
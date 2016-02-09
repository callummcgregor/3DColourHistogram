/**
 * Created by callum on 27/01/2016.
 */

QUnit.module('ModelTests', {
    setup: function() {
        this.model = new Model();
    },
    teardown: function() {
        this.model = null;
    }
});

// TODO: Currently untestable
    QUnit.test("testSaveImage", function(assert) {
    assert.equal(true, true);
});

// TODO: Currently untestable
QUnit.test("testExtractColors", function(assert) {
    assert.equal(true, true);
});

QUnit.test("testGenerateLut", function(assert) {
    var from = 256;
    var to = 16;
    var lut = this.model.generateLut(from, to);

    var tolerance = 0.0001;

    // Test values around key points where values "flip"
    var testValues = [
        [0,    [  0/255,   0/255,   0/255]],
        [1,    [ 17/255,   0/255,   0/255]],
        [2,    [ 34/255,   0/255,   0/255]],
        [15,   [255/255,   0/255,   0/255]],
        [16,   [  0/255,  17/255,   0/255]],
        [17,   [ 17/255,  17/255,   0/255]],
        [31,   [255/255,  17/255,   0/255]],
        [32,   [  0/255,  34/255,   0/255]],
        [33,   [ 17/255,  34/255,   0/255]],
        [255,  [255/255, 255/255,   0/255]],
        [256,  [  0/255,   0/255,  17/255]],
        [257,  [ 17/255,   0/255,  17/255]],
        [4094, [238/255, 255/255, 255/255]],
        [4095, [255/255, 255/255, 255/255]]
    ];

    for(var i = 0; i < testValues.length; i++) {
        assertClose(assert, lut[testValues[i][0]].r, testValues[i][1][0], tolerance, testValues[i][0]);
        assertClose(assert, lut[testValues[i][0]].g, testValues[i][1][1], tolerance, testValues[i][0]);
        assertClose(assert, lut[testValues[i][0]].b, testValues[i][1][2], tolerance, testValues[i][0]);
    }

    //for(var i = 0; i < to; i++) {
    //    for (var j = 0; j < to; j++) {
    //        for (var k = 0; k < to; k++) {
    //            //assertClose(assert, lut[k + (to*j) + (to*to*i)].r, k / maxTo, tolerance);
    //            //assertClose(assert, lut[k + (to*j) + (to*to*i)].g, j / maxTo, tolerance);
    //            //assertClose(assert, lut[k + (to*j) + (to*to*i)].b, i / maxTo, tolerance);
    //        }
    //    }
    //}
});

QUnit.test("testApplyColorQuantisationValues", function(assert) {
    var from = 256;
    var fromMax = from - 1;
    var to = 16;

    var inputColors = [];
    // Grey-scale diagonal
    for(var i = 0; i < from; i++) {
        inputColors[i] = new ColorRGB(i / fromMax, i / fromMax, i / fromMax);
    }
    var colors16Bit = this.model.applyColorQuantisation(inputColors, from, to);

    var valueSum = 0;
    for(var i = 0; i < colors16Bit.length; i++) {
        valueSum += colors16Bit[i].value;
        // Tests that bins contain correct number of items, +/- 1 item
        if (i == 0 || i == (colors16Bit.length - 1)) {
            assertClose(assert, colors16Bit[i].value, 9, 1);
        } else if (((i) % 273) == 0) {
            assertClose(assert, colors16Bit[i].value, 17, 1);
        }
    }
    assert.equal(valueSum, inputColors.length);
});
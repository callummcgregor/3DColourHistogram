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
    var maxTo = to - 1;
    var lut = this.model.generateLut(from, to);

    var count = 0;
    for(var i = 0; i < to; i++) {
        for (var j = 0; j < to; j++) {
            for (var k = 0; k < to; k++) {
                // Accurate to 13 decimal places
                assert.equal(lut[count].r.toFixed(14), (k / maxTo).toFixed(14));
                assert.equal(lut[count].g.toFixed(14), (j / maxTo).toFixed(14));
                assert.equal(lut[count].b.toFixed(14), (i / maxTo).toFixed(14));
                count += 1;
            }
        }
    }
});

QUnit.test("testTranform24BitTo16Bit", function(assert) {
    // For each of the 256 (0-255) 24-bit colour values
    for(var i = 0; i < 256; i++) {
        var color24Bit = new ColorRGB(i/255, i/255, i/255); // Convert i into 0-1 range
        var color16Bit = this.model.transform24BitTo16Bit([color24Bit])[0];

        var tolerance = 0.01; // 5% tolerance

        var iRoundedToNearest17 = Math.round(i/17) * 17; // Round i to the nearest 17; redundant variable but useful for transparency for tests

        assertClose(assert, color16Bit.r, (iRoundedToNearest17/17)/15, tolerance);
        assertClose(assert, color16Bit.g, (iRoundedToNearest17/17)/15, tolerance);
        assertClose(assert, color16Bit.b, (iRoundedToNearest17/17)/15, tolerance);
    }
});

QUnit.test("testApplyColorQuantisationValues", function(assert) {
    var from = 256;
    var to = 16;
    var fromMax = from - 1;
    var toMax = to - 1;
    var ratio = fromMax / toMax;

    var colors24Bit = [];
    // Grey-scale diagonal
    for(var i = 0; i < from; i++) {
        colors24Bit[i] = new ColorRGB(i / from, i / from, i / from);
    }
    var colors16Bit = this.model.applyColorQuantisation(colors24Bit, from, to);

    var valueSum = 0;
    var lut = this.model.generateLut(from, to);

    for(var i = 0; i < colors16Bit.length; i++) {
        var color = lut[i];

        // Test key is correct
        assert.equal(colors16Bit[i].key.r.toFixed(14), color.r.toFixed(14));
        assert.equal(colors16Bit[i].key.g.toFixed(14), color.g.toFixed(14));
        assert.equal(colors16Bit[i].key.b.toFixed(14), color.b.toFixed(14));

        valueSum += colors16Bit[i].value;
        if (i == 0) {
            assert.equal(colors16Bit[i].value, 9);
        } else if (i == (colors16Bit.length - 1)) {
            assert.equal(colors16Bit[i].value, 8);
        } else if (((i) % 273) == 0) {
            assert.equal(colors16Bit[i].value, 17, i);
        }
    }

    assert.equal(valueSum, colors24Bit.length);
});
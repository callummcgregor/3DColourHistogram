QUnit.module("Exception Tests");

QUnit.test("Test Exception has correct error message", function(assert) {
    var newException = new Exception("Exception message");
    assert.equal(newException.toString(), "Exception message");
});

QUnit.test("Test Exception can be thrown", function(assert) {
    assert.throws(
        function() {
            throw new Exception();
        },
        new Exception()
    )
});

// *****

QUnit.module("CustomEvent Tests");

QUnit.test("Test CustomEvent notifies 1 listener", function(assert) {
    var eventHeard = false;

    function MyEventGenerator() {
        this.event = new CustomEvent(this);
    }

    MyEventGenerator.prototype = {
        fireEvent: function() {
            this.event.notify();
        }
    };

    function MyEventListener(eventGenerator) {
        this.eventGenerator = eventGenerator;

        this.eventGenerator.event.attach(function() {
            eventHeard = true;
        });
    }

    var myEventGenerator = new MyEventGenerator();
    var myEventListener = new MyEventListener(myEventGenerator);

    myEventGenerator.fireEvent();

    assert.equal(true, eventHeard);
});

QUnit.test("Test CustomEvent notifies many listeners", function(assert) {
    var noOfEventsHeard = 0;

    function MyEventGenerator() {
        this.event = new CustomEvent(this);
    }

    MyEventGenerator.prototype = {
        fireEvent: function() {
            this.event.notify();
        }
    };

    function MyEventListener(eventGenerator) {
        this.eventGenerator = eventGenerator;

        this.eventGenerator.event.attach(function() {
            noOfEventsHeard += 1;
        });
    }

    var myEventGenerator = new MyEventGenerator();
    var myEventListener1 = new MyEventListener(myEventGenerator);
    var myEventListener2 = new MyEventListener(myEventGenerator);
    var myEventListener3 = new MyEventListener(myEventGenerator);

    myEventGenerator.fireEvent();

    assert.equal(3, noOfEventsHeard);
});

QUnit.test("Test CustomEvent passes arguments", function(assert) {
    var eventHeard = false;
    var dataRecieved;

    function MyEventGenerator() {
        this.data = "Hello World";
        this.event = new CustomEvent(this);
    }

    MyEventGenerator.prototype = {
        fireEvent: function() {
            this.event.notify(this.data);
        }
    };

    function MyEventListener(eventGenerator) {
        this.eventGenerator = eventGenerator;

        this.eventGenerator.event.attach(function(sender, args) {
            eventHeard = true;
            dataRecieved = args;
        });
    }

    var myEventGenerator = new MyEventGenerator();
    var myEventListener = new MyEventListener(myEventGenerator);

    myEventGenerator.fireEvent();

    assert.equal(true, eventHeard);
    assert.equal("Hello World", dataRecieved);
});

// *****

QUnit.module("Color Tests");

QUnit.test("Test setRGB with correct arguments", function(assert) {
    var newColor = new Color();
    newColor.setRGB(1.0, 0.0, 1.0); // A nice magenta

    assert.equal(newColor.rgb.r, 1.0);
    assert.equal(newColor.rgb.g, 0.0);
    assert.equal(newColor.rgb.b, 1.0);
});

QUnit.test("Test setRGB with arguments out of accepted range", function(assert) {
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
                var newColor = new Color().setRGB(erroneousColors[i][0], erroneousColors[i][1], erroneousColors[i][2]);
            },
            function(e) {
                return e.toString() == "Inputted values must be in range 0-1 (inclusive)";
            }
        );
    }
});

QUnit.test("Test convertRgbToLab", function(assert) {
    var tolerance = 1/127;
    var testColorsRgb = [
        [0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 1.0, 1.0]
    ];
    var testColorsLab = [
        [0.0, 0.0, 0.0],
        [53.233, 80.109, 67.220],
        [87.737, -86.185, 83.181],
        [32.303, 79.197, -107.864],
        [100.0, 0.00526, -0.0104]
    ];

    for (var i = 0; i < testColorsRgb.length; i++) {
        var newColor = new Color();
        newColor.setRGB(testColorsRgb[i][0], testColorsRgb[i][1], testColorsRgb[i][2]);
        newColor.convertRgbToLab();
        var lab = newColor.lab;

        assertClose(assert, lab.l, testColorsLab[i][0], tolerance, "");
        assertClose(assert, lab.a, testColorsLab[i][1], tolerance, "");
        assertClose(assert, lab.b, testColorsLab[i][2], tolerance, "");
    }

    assert.equal(true, true); // To stop QUnit bitching at me
});

QUnit.test("Test convertLabToRgb", function(assert) {
    var tolerance = 1/255;
    var testColorsLab = [
        [0.0, 0.0, 0.0],
        [53.233, 80.109, 67.220],
        [87.737, -86.185, 83.181],
        [32.303, 79.197, -107.864],
        [100.0, 0.00526, -0.0104],
        [23, 19, 1]
    ];
    var testColorsRgb = [
        [0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 1.0, 1.0],
        [0.31948, 0.17060, 0.21161]
    ];

    for (var i = 0; i < testColorsLab.length; i++) {
        var newColor = new Color();
        newColor.setLab(testColorsLab[i][0], testColorsLab[i][1], testColorsLab[i][2]);
        newColor.convertLabToRgb();
        var rgb = newColor.rgb;

        assertClose(assert, rgb.r, testColorsRgb[i][0], tolerance, "");
        assertClose(assert, rgb.g, testColorsRgb[i][1], tolerance, "");
        assertClose(assert, rgb.b, testColorsRgb[i][2], tolerance, "");
    }

    assert.equal(true, true); // To stop QUnit bitching at me
});
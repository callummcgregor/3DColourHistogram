//*** Tests for the Exception object ***

QUnit.test("testExceptionErrorMessage", function(assert) {
    var newException = new Exception("Exception message");
    assert.equal(newException.toString(), "Exception message");
});

QUnit.test("testExceptionThrowing", function(assert) {
    assert.throws(
        function() {
            throw new Exception();
        },
        new Exception()
    )
});


//*** Tests for the CustomEvent object ***

QUnit.test("testCustomEventNotifiesOneListener", function(assert) {
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

QUnit.test("testCustomEventNotifiesAllListeners", function(assert) {
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

QUnit.test("testCustomEventWithArguments", function(assert) {
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

//*** Tests for the ColorRGB object ***

QUnit.test("testColorRGBWithCorrectParameters", function(assert) {
    var newColor = new ColorRGB(1.0, 0.0, 0.0);

    assert.equal(newColor.r, 1.0);
    assert.equal(newColor.g, 0.0);
    assert.equal(newColor.b, 0.0);
});

QUnit.test("testColorRGBWithOutOfRangeParameters", function(assert) {
    var erroneousColors = [
        [-1.0,  0.0,  0.0],
        [ 0.0, -1.0,  0.0],
        [ 0.0,  0.0, -1.0],
        [ 2.0,  0.0,  0.0],
        [ 0.0,  2.0,  0.0],
        [ 0.0,  0.0,  2.0],
    ];

    for (var i = 0; i < erroneousColors.length; i++) {
        assert.throws(
            function() {
                var newColor = new ColorRGB(erroneousColors[i][0], erroneousColors[i][1], erroneousColors[i][2]);
            },
            function(e) {
                return e.toString() == "Inputted value outside range 0-1 (inclusive)";
            }
        );
    }
});

QUnit.test("testColorRGBWithTooFewParameters", function(assert) {
    var erroneousColors = [
        [undefined, undefined, undefined],
        [1.0, undefined, undefined],
        [1.0, 1.0, undefined]
    ];

    for (var i = 0; i < erroneousColors.length; i++) {
        assert.throws(
            function() {
                var newColor = new ColorRGB(erroneousColors[i][0], erroneousColors[i][1], erroneousColors[i][2]);
            },
            function(e) {
                return e.toString() == "Too few parameters recieved, please supply a red, green, and blue value";
            }
        )
    }
});

QUnit.test("testColorRGBtoString", function(assert) {
    var newColor = new ColorRGB(1.0, 0.5, 0.0);

    assert.equal(newColor.toString(), "(1, 0.5, 0)"); // Note that floats are printed out as ints if .0
});
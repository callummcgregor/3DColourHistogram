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
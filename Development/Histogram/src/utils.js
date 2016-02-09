/**
 * A file of utility classes and functions
 */

/**
 * A simple custom exception
 * Allows a message to be set and retrieved
 *
 * @param message The message for this instance of the exception
 */
function Exception(message) {
    this._message = message;
}

Exception.prototype = {
    toString: function() {
        return this._message;
    }
};

/**
 * An event class. Registered listeners are notified when the event is fired
 */
function CustomEvent(sender) {
    this._sender = sender;
    this._listeners = [];
}

CustomEvent.prototype = {
    attach: function(listener) {
        this._listeners.push(listener);
    },

    notify: function(args) {
        var index;

        for (index = 0; index < this._listeners.length; index++) {
            this._listeners[index](this._sender, args);
        }
    }
};

/**
 * QUnit-assert-close plugin was unsuccessful, so I defined my own
 * Function passes or fails a simple assertion depending if the expected value is within a tolerance percentage
 *  (inclusive) either way of the actual value
 *
 * @param assert An instance of assert, allowing assertions to be made in this function
 * @param actual The actual value
 * @param expected The expected value
 * @param tolerance The percentage of the actual value by which the expected value can be higher or lower
 */
function assertClose(assert, actual, expected, tolerance, message) {
    if(actual + tolerance >= expected && actual - tolerance <= expected) {
        assert.equal(true, true, message);
    } else {
        assert.equal(false, true, message + "... " + "actual: " + actual + " not within " + tolerance + " of expected: " + expected);
    }
}

/**
 * Object for representing an RGB 24-bit colour
 * Values given and stored in the ranges 0-255
 *
 * @param red
 * @param green
 * @param blue
 */
function ColorRGB(red, green, blue) {
    this.r = null;
    this.g = null;
    this.b = null;

    if (red < 0 || red > 1 || green < 0 || green > 1 || blue < 0 || blue > 1) {
        throw new Exception("Inputted value outside range 0-1 (inclusive)"); // TODO: Give erroneous values
    } else if (red == undefined || green == undefined || blue == undefined) {
        throw new Exception("Too few parameters recieved, please supply a red, green, and blue value");
    } else {
        this.r = red;
        this.g = green;
        this.b = blue;
    }
}

ColorRGB.prototype = {
    toString: function() {
        return "(" + this.r + ", " + this.g + ", " + this.b + ")";
    }
};
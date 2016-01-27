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
        throw new Exception("Inputted value outside range 0-1 (inclusive)");
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
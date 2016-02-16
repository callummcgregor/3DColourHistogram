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
 * @param tolerance The percentage of the actual value by which the expected value can be higher or lower (0-1)
 * @param message The message displayed if the test fails
 */
function assertClose(assert, actual, expected, tolerance, message) {
    var toleranceValue = Math.abs(tolerance * expected);

    if(actual + toleranceValue >= expected && actual - toleranceValue <= expected) {
        assert.equal(true, true, message);
    } else {
        assert.equal(false, true, message + "... " + "actual: " + actual + " not within " + tolerance*100 + "% of expected: " + expected);
    }
}

/**
 * Object for representing a colour
 */
function Color() {
    this.rgb = null;
    this.lab = null;
}

Color.prototype = {
    /**
     * Set the Color's RGB values
     * @param r red value in range 0-1
     * @param g green value in range 0-1
     * @param b blue value in range 0-1
     */
    setRGB: function(r, g, b) {
        if (r < 0.0 || r > 1.0 || g < 0.0 || g > 1.0 || b < 0.0 || b > 1.0) {
            throw new Exception("Inputted values must be in range 0-1 (inclusive)"); // TODO: Give erroneous values
        } else {
            this.rgb = {
                r: r,
                g: g,
                b: b
            }
        }
    },

    /**
     * Calculate the sRGB's CIE-Lab equivalent
     */
    calculateLab: function() {
        console.log("Converting sRGB colours to CIE-L*a*b*");

        // First convert sRGB to CIE-XYZ
        var varR = this.rgbToXyzHelper(this.rgb.r) * 100;
        var varG = this.rgbToXyzHelper(this.rgb.g) * 100;
        var varB = this.rgbToXyzHelper(this.rgb.b) * 100;

        var xyz = {
            X: (varR * 0.4124) + (varG * 0.3576) + (varB * 0.1805),
            Y: (varR * 0.2126) + (varG * 0.7152) + (varB * 0.0722),
            Z: (varR * 0.0193) + (varG * 0.1192) + (varB * 0.9505)
        };

        // Then convert CIE-XYZ to CIE-Lab
        var varX = this.xyzToLabHelper(xyz.X /  95.047);
        var varY = this.xyzToLabHelper(xyz.Y / 100.000);
        var varZ = this.xyzToLabHelper(xyz.Z / 108.883);

        this.lab = {
            l: (116 * varY) - 16,
            a: 500 * (varX - varY),
            b: 200 * (varY - varZ)
        };
    },

    rgbToXyzHelper: function(channel) {
        if (channel > 0.04045) {
            channel = Math.pow((channel + 0.055) / 1.055, 2.4)
        } else {
            channel = channel / 12.92
        }
        return channel
    },

    xyzToLabHelper: function(channel) {
        if (channel > 0.00856) {
            return Math.pow(channel, 1/3);
        } else {
            return (7.787 * channel) + (16/116);
        }
    }
};


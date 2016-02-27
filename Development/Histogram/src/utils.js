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
    if(actual + tolerance >= expected && actual - tolerance <= expected) {
        assert.equal(true, true, message);
    } else {
        assert.equal(false, true, message + "... " + "actual: " + actual + " not within " + tolerance + " of expected: " + expected);
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
            };
        }

        this.convertRgbToLab();
    },

    setLab: function(l, a, b) {
        this.lab = {
            l: l,
            a: a,
            b: b
        };

        this.convertLabToRgb();
    },

    /**
     * Convert an array of Color objects from the input bits to output bits (e.g. 24-bit to 16-bit color)
     * TODO: Add paramters
     * TODO: Save quantised colours
     *
     * @returns {Array} The converted input Color objects
     */
    getQuantisedRgbColor: function() {
        return {
            r: Math.round((this.rgb.r * 255) / 17) / 15,
            g: Math.round((this.rgb.g * 255) / 17) / 15,
            b: Math.round((this.rgb.b * 255) / 17) / 15
        }
    },

    getQuantisedLabColor: function() {
        return {
            l: Math.round((this.lab.l) / 10) * 10,
            a: Math.round((this.lab.a) / 17) * 17,
            b: Math.round((this.lab.b) / 17) * 17
        }
    },

    /**
     * Calculate the sRGB's CIE-Lab equivalent
     */
    convertRgbToLab: function() {
        // First convert sRGB to CIE-XYZ
        // Original formula converts from 0-255 to 0-1 range, but my values are already there
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
    },

    convertLabToRgb: function() {
        // First convert from CIE-L*a*b* to CIE-XYZ
        varY = (this.lab.l + 16) / 116;
        varX = this.lab.a / 500 + varY;
        varZ = varY - this.lab.b / 200;

        var xyz = {
            X: 95.047 * this.labToXyzHelper(varX),
            Y: 100.0 * this.labToXyzHelper(varY),
            Z: 108.883 * this.labToXyzHelper(varZ)
        };

        // Then convert from CIE-XYZ to sRGB
        var varX1 = xyz.X / 100;
        var varY1 = xyz.Y / 100;
        var varZ1 = xyz.Z / 100;

        var varR = varX1*3.2406  + varY1*-1.5372 + varZ1*-0.4986;
        var varG = varX1*-0.9689 + varY1*1.8758  + varZ1*0.0415;
        var varB = varX1*0.0557  + varY1*-0.2040 + varZ1*1.0570;

        if (varR < 0) {
            varR = 0;
        }
        if (varR > 1) {
            varR = 1;
        }
        if (varG < 0) {
            varG = 0;
        }
        if (varG > 1) {
            varG = 1;
        }
        if (varB < 0) {
            varB = 0;
        }
        if (varB > 1) {
            varB = 1;
        }
        // Original formula then converts to 0-255 range but I keep it in 0-1 range
        this.rgb = {
            r: this.xyzTosRgbHelper(varR),
            g: this.xyzTosRgbHelper(varG),
            b: this.xyzTosRgbHelper(varB)
        };
    },

    labToXyzHelper: function(channel) {
        if (Math.pow(channel, 3) > 0.008856) {
            return Math.pow(channel, 3);
        } else {
            return (channel - 16 / 116) / 7.787;
        }
    },

    xyzTosRgbHelper: function(channel) {
        if (channel > 0.0031308) {
            return 1.055 * Math.pow(channel, 1/2.4) - 0.055;
        } else {
            return 12.92 * channel;
        }
    }
};


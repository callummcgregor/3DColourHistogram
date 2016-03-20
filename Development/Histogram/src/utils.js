/**
 * Some utility classes
 */

/**
 * A simple exception
 *
 * @param message An informative error message
 */
function Exception(message) {
    this.message = message;

    this.toString = function() {
        return this.message;
    };
}

/**
 * An implementation of a basic event class
 * Registered listeners are notified when the event is fired and passed arguments attached to the event
 */
function CustomEvent(sender) {
    var _sender = sender;
    var _listeners = [];

    this.attach = function(listener) {
        _listeners.push(listener);
    };

    this.notify = function(args) {
        var index;

        for (index = 0; index < _listeners.length; index++) {
            _listeners[index](_sender, args);
        }
    };
}

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
    // Private variables
    var _rgb = null;
    var _lab = null;
    var _hsl = null;
    var _this = this;

    // Public methods
    /**
     * Set the Color's RGB values
     * @param r red value in range 0-1
     * @param g green value in range 0-1
     * @param b blue value in range 0-1
     */
    this.setRgb = function(r, g, b) {
        if (r < 0.0 || r > 1.0 || g < 0.0 || g > 1.0 || b < 0.0 || b > 1.0) {
            console.log("r: ", r, " g: ", g, " b: ", b);
            throw new Exception("Inputted values must be in range 0-1 (inclusive)"); // TODO: Give erroneous values
        } else {
            _rgb = {
                r: r,
                g: g,
                b: b
            };
            this.rgbToLab(); // Also calculate CIE-Lab and HSL equivalents
            rgbToHsl();
        }
    };

    this.setLab = function(l, a, b) {
        if (l < 0.0 || l > 100.0 || a < -128.0 || a > 127.0 || b < -128.0 || b > 127.0) {
            throw new Exception("Inputted values outside accepted ranges"); // TODO: Give erroneous values
        } else {
            _lab = {
                l: l,
                a: a,
                b: b
            };
            this.labToRgb(); // Also calculate RGB and HSL equivalents
            rgbToHsl();
        }
    };

    this.setHsl = function(h, s, l) {
        if (h < 0.0 || h > 1.0 || s < 0.0 || s > 1.0 || l < 0.0 || l > 1.0) {
            throw new Exception("Inputted values outside accepted ranges"); // TODO: Give erroneous values
        } else {
            _hsl = {
                h: h,
                s: s,
                l: l
            };
        }
    };

    this.getRgb = function() {
        return _rgb;
    };

    this.getLab = function() {
        return _lab;
    };

    /**
     * Used only in testing
     */
    this.getHsl = function() {
        return _hsl
    };

    /**
     * Convert an array of Color objects from the input bits to output bits (e.g. 24-bit to 16-bit color)
     * TODO: Add paramters
     * TODO: Save quantised colours
     *
     * @returns {Array} The converted input Color objects
     */
    this.quantiseRgb = function() {
        return {
            r: Math.round((_rgb.r * 255) / 17) / 15,
            g: Math.round((_rgb.g * 255) / 17) / 15,
            b: Math.round((_rgb.b * 255) / 17) / 15
        }
    };

    this.quantiseLab = function() {
        return {
            l: Math.round((_lab.l) / 10) * 10,
            a: Math.round((_lab.a) / 17) * 15,
            b: Math.round((_lab.b) / 17) * 15
        }
    };

    this.changeBrightness = function(adjustment) {
        rgbToHsl();
        _hsl.l += 0.1 * adjustment;
        if (_hsl.l < 0) {
            _hsl.l = 0;
        } else if (_hsl.l > 1) {
            _hsl.l = 1;
        }
        hslToRgb();
    };

    this.changeContrast = function(adjustment) {
        var C = adjustment * (255/10); // C in range -255 to 255
        var factor = (259 * (C + 255)) / (255 * (259 - C));

        var newR = (factor * ((_rgb.r * 255) - 128) + 128) / 255;
        var newG = (factor * ((_rgb.g * 255) - 128) + 128) / 255;
        var newB = (factor * ((_rgb.b * 255) - 128) + 128) / 255;

        if (newR < 0.0) {
            newR = 0;
        }
        if (newR > 1.0) {
            newR = 1;
        }

        if (newG < 0.0) {
            newG = 0;
        }
        if (newG > 1.0) {
            newG = 1;
        }

        if (newB < 0.0) {
            newB = 0;
        }
        if (newB > 1.0) {
            newB = 1;
        }

        this.setRgb(newR, newG, newB);
    };

    this.changeSaturation = function(adjustment) {
        rgbToHsl();
        _hsl.s += 0.1 * adjustment; // S ranges between 0 and 1
        if (_hsl.s < 0) {
            _hsl.s = 0;
        } else if (_hsl.s > 1) {
            _hsl.s = 1;
        }
        hslToRgb();
    };

    this.rgbToLab = function() {
        // First convert sRGB to CIE-XYZ
        // Original formula converts from 0-255 to 0-1 range, but my values are already there
        var varR = _rgbToXyzHelper(_rgb.r) * 100;
        var varG = _rgbToXyzHelper(_rgb.g) * 100;
        var varB = _rgbToXyzHelper(_rgb.b) * 100;

        var xyz = {
            X: (varR * 0.4124) + (varG * 0.3576) + (varB * 0.1805),
            Y: (varR * 0.2126) + (varG * 0.7152) + (varB * 0.0722),
            Z: (varR * 0.0193) + (varG * 0.1192) + (varB * 0.9505)
        };

        // Then convert CIE-XYZ to CIE-Lab
        var varX = _xyzToLabHelper(xyz.X /  95.047);
        var varY = _xyzToLabHelper(xyz.Y / 100.000);
        var varZ = _xyzToLabHelper(xyz.Z / 108.883);

        //this.setLab((116 * varY) - 16, // This seems to be too slow?!?
        //            500 * (varX - varY),
        //            200 * (varY - varZ));
        _lab = {
            l: (116 * varY) - 16,
            a: 500 * (varX - varY),
            b: 200 * (varY - varZ)
        };
    };

    this.labToRgb = function() {
        // First convert from CIE-L*a*b* to CIE-XYZ
        var varY = (_lab.l + 16) / 116;
        var varX = _lab.a / 500 + varY;
        var varZ = varY - _lab.b / 200;

        var xyz = {
            X:  95.047 * _labToXyzHelper(varX),
            Y: 100.000 * _labToXyzHelper(varY),
            Z: 108.883 * _labToXyzHelper(varZ)
        };

        // Then convert from CIE-XYZ to sRGB
        var varX1 = xyz.X / 100;
        var varY1 = xyz.Y / 100;
        var varZ1 = xyz.Z / 100;

        var varR = varX1*3.2406  + varY1*-1.5372 + varZ1*-0.4986;
        var varG = varX1*-0.9689 + varY1*1.8758  + varZ1*0.0415;
        var varB = varX1*0.0557  + varY1*-0.2040 + varZ1*1.0570;

        // TODO: Clip proportionally, maintaining RGB ratio
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
        _rgb = {
            r: _xyzTosRgbHelper(varR),
            g: _xyzTosRgbHelper(varG),
            b: _xyzTosRgbHelper(varB)
        };
        //this.setRgb(_xyzTosRgbHelper(varR), _xyzTosRgbHelper(varG), _xyzTosRgbHelper(varB));
    };

    var rgbToHsl = function() {
        var min = Math.min(_rgb.r, _rgb.g, _rgb.b);
        var max = Math.max(_rgb.r, _rgb.g, _rgb.b);
        var delta = max - min;

        var h, s;
        var l = (max + min) / 2;

        if (delta == 0) {
            h = 0;
            s = 0;
        } else {
            if (l < 0.5) {
                s = delta / (max + min);
            } else {
                s = delta / (2 - max - min)
            }

            var deltaR = (((max - _rgb.r) / 6) + (delta / 2)) / delta;
            var deltaG = (((max - _rgb.g) / 6) + (delta / 2)) / delta;
            var deltaB = (((max - _rgb.b) / 6) + (delta / 2)) / delta;

            if (_rgb.r == max) {
                h = deltaB - deltaG;
            } else if (_rgb.g == max) {
                h = (1/3) + deltaR - deltaB;
            } else if (_rgb.b == max) {
                h = (2/3) + deltaG - deltaR;
            }

            // Periodic
            if (h < 0) {
                h += 1;
            }
            if (h > 1) {
                h -= 1;
            }
        }

        _this.setHsl(h, s, l);
    };

    var hslToRgb = function() {
        var v1, v2;
        var r, g, b;

        if (_hsl.s == 0) {
            r = _hsl.l;
            g = _hsl.l;
            b = _hsl.l;
        } else {
            if (_hsl.l < 0.5) {
                v2 = _hsl.l * (1 + _hsl.s);
            } else {
                v2 = (_hsl.l + _hsl.s) - (_hsl.s * _hsl.l);
            }

            v1 = (2 * _hsl.l) - v2;

            r = hslToRgbHelper(v1, v2, _hsl.h + (1/3));
            g = hslToRgbHelper(v1, v2, _hsl.h);
            b = hslToRgbHelper(v1, v2, _hsl.h - (1/3));
        }

        if (r > 1) {
            r = 1;
        } else if (r < 0) {
            r = 0;
        }
        if (g > 1) {
            g = 1;
        } else if (g < 0) {
            g = 0;
        }
        if (b > 1) {
            b = 1;
        } else if (b < 0) {
            b = 0;
        }
        _this.setRgb(r, g, b);
    };

    // Private methods
    var _rgbToXyzHelper = function(channel) {
        if (channel > 0.04045) {
            channel = Math.pow((channel + 0.055) / 1.055, 2.4)
        } else {
            channel = channel / 12.92
        }
        return channel
    };

    var _xyzToLabHelper = function(channel) {
        if (channel > 0.00856) {
            return Math.pow(channel, 1/3);
        } else {
            return (7.787 * channel) + (16/116);
        }
    };

    var _labToXyzHelper = function(channel) {
        if (Math.pow(channel, 3) > 0.008856) {
            return Math.pow(channel, 3);
        } else {
            return (channel - 16 / 116) / 7.787;
        }
    };

    var _xyzTosRgbHelper = function(channel) {
        if (channel > 0.0031308) {
            return 1.055 * Math.pow(channel, 1/2.4) - 0.055;
        } else {
            return 12.92 * channel;
        }
    };

    var hslToRgbHelper = function(v1, v2, vH) {
        if (vH < 0) {
            vH +=1;
        }
        if (vH > 1) {
            vH -= 1;
        }

        if ((6 * vH) < 1) {
            return v1 + (v2 - v1) * 6 * vH;
        } else if ((2 * vH) < 1) {
            return v2;
        } else if ((3 * vH) < 2) {
            return v1 + (v2 - v1) * 6 * ((2/3) - vH);
        } else {
            return v1;
        }
    };

    this.clone = function() {
        var newColor = new Color();
        newColor.setRgb(_rgb.r, _rgb.g, _rgb.b);
        return newColor;
    };
}

// Static variables
Color.RGB = "srgb";
Color.LAB = "cie-lab";


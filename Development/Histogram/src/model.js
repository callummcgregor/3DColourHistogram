/**
 * Define Model and its fields
 *
 * @param items Items in the list
 */
function Model() {
    this._image = null;
    this._colors = null;
    this.imageReady = new CustomEvent(this);
    this.colorsReady = new CustomEvent(this);
}

Model.prototype = {
    /**
     * Save the raw image file
     *
     * @param imageFile The raw image file to be saved
     */
    saveImage: function(imageFile) {
        var image = new Image();

        var _this = this;

        image.onload = function() {
            _this._image = image;
            _this.imageReady.notify(image);
        };

        image.src = URL.createObjectURL(imageFile); // TODO: Let this go to prevent memory leaks
    },

    /**
     * Takes the image context (from the HTML5 canvas element), extracts the colours and converts them into
     *  and appropriate bit size
     *
     * @param context The image context (from the HTML5 canvas element)
     */
    parseImage: function(context) {
         // TODO: How to detect the bit of extracted colours
        this._colors = this.extractColors(context); // Save colours in original bit size as to not loose resolution unnecessarily

        //var sRGBColors16Bit = this.applyRgbColorQuantisation(extractedColors, 256, 16);
        this.colorsReady.notify(/*sRGBColors16Bit*/);
    },

    /**
     * Iterate over the pixels in the image context and extract the RGB values (presumed to be 24-bit),
     *  returning them as an array
     *
     * @param context The image context from the HTML5 canvas element
     * @returns {Array} An array of the RGB values from each pixel in the image
     */
    extractColors: function(context) {
        var width = context.canvas.width;
        var height = context.canvas.height;
        var colors = [];

        console.log("Extracting colours...");
        var count = 0;
        for(var y = 0; y < height; y++) { // Traverses row by row
            for(var x = 0; x < width; x++) {
                var imageData = context.getImageData(x, y, 1, 1).data;
                var color = new Color;
                color.setRgb(imageData[0]/255, imageData[1]/255, imageData[2]/255);
                colors[count] = color;
                count++;
            }
        }
        console.log(colors.length + " non-unique colours extracted");

        return colors;
    }

    /**
     * Generates a look-up table (lut) of from-bit colours to to-bit colours (e.g. 24-bit to 16-bit)
     * Note: 24-bit colour is a misnomer and have 256 denominations, unlike 8-bit or 16-bit colours
     *  which have 8 or 16 denominations respectively
     *
     * @param from The number of denominations of the input colours
     * @param to The number of denomications of the output colours
     * @returns {Array} A look-up table of to-bit colour equivalents in the from-bit coordinates
     */
    //generateLut: function(from, to) {
    //    oldMax = from - 1;
    //    newMax = to - 1;
    //    scaleFactor = oldMax / newMax;
    //
    //    var lut = [];
    //
    //    for(var i = 0; i < (to*to*to); i++) {
    //         var newColor = new Color;
    //        newColor.setRgb(
    //            ((i%to) * scaleFactor) / oldMax,
    //            ((Math.floor(i/to)%to) * scaleFactor) / oldMax,
    //            ((Math.floor(i/(to*to))) * scaleFactor) / oldMax);
    //        lut[i] = newColor;
    //    }
    //
    //    return lut;
    //},

    /**
     * Convert an array of Color objects from the input bits to output bits (e.g. 24-bit to 16-bit color)
     *
     * @param inputColors An array of Color objects
     * @param inputNoOfBits The bits of the input colours (e.g. 24)
     * @param outputNoOfBits The desired bits of the output colours (e.g. 16)
     * @returns {Array} The converted input Color objects
     */
    //applyRgbColorQuantisation: function(inputColors, inputNoOfBits, outputNoOfBits) {
    //    console.log("Applying colour quantisation...");
    //    //var lut = this.generateLut(inputNoOfBits, outputNoOfBits);
    //    //
    //    //var quantisedColors = [];
    //    //for(var i = 0; i < lut.length; i++) {
    //    //    quantisedColors[i] = {
    //    //        key: lut[i],
    //    //        value: 0
    //    //    };
    //    //}
    //    //
    //    //// For each colour in the image, find it's 16-bit equivalent
    //    //for(var i = 0; i < inputColors.length; i++) {
    //    //    var minDistance = 2; // A value outside ranges of the 0-1 cube (i.e. larger than Math.sqrt(3))
    //    //    var minIndex = null; // Index of the 16-bit value in the LUT equivalent to the 24-bit input value
    //    //
    //    //    // Iterate over lut, finding entry that is closest to 24-bit colour
    //    //    for(var j = 0; j < lut.length; j++) {
    //    //        var rDiff = inputColors[i].rgb.r - lut[j].rgb.r;
    //    //        var gDiff = inputColors[i].rgb.g - lut[j].rgb.g;
    //    //        var bDiff = inputColors[i].rgb.b - lut[j].rgb.b;
    //    //        var distance = Math.sqrt(Math.pow(rDiff, 2) + Math.pow(gDiff, 2) + Math.pow(bDiff, 2));
    //    //
    //    //        if (distance < minDistance) {
    //    //            minDistance = distance;
    //    //            minIndex = j;
    //    //        }
    //    //    }
    //    //
    //    //    quantisedColors[minIndex].value += 1;
    //    //}
    //
    //    var quantisedColors = [];
    //
    //    for (var i = 0; i < inputColors.length; i++) {
    //        var color = [Math.round((inputColors[i].rgb.r * 255) / 17) / 15,
    //                     Math.round((inputColors[i].rgb.g * 255) / 17) / 15,
    //                     Math.round((inputColors[i].rgb.b * 255) / 17) / 15];
    //
    //        var found = false;
    //        var count = 0;
    //        while (!found && count < quantisedColors.length) {
    //            if (quantisedColors[count].key.rgb.r == color[0] && quantisedColors[count].key.rgb.g == color[1] && quantisedColors[count].key.rgb.b == color[2]) {
    //                quantisedColors[count].value += 1;
    //                found = true;
    //            }
    //            count += 1;
    //        }
    //        if (!found) {
    //            var newColor = new Color();
    //            newColor.setRgb(color[0], color[1], color[2]);
    //            quantisedColors.push({
    //                key: newColor,
    //                value: 1
    //            })
    //        }
    //    }
    //
    //
    //    return quantisedColors; //TODO: For testing purposes, keep?
    //}
};
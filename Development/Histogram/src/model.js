/**
 * Define Model and its fields
 *
 * @param items Items in the list
 */
function Model() {
    this._image = null;
    this._sRGBColors = null;
    this._labColours = null;

    this.imageSaved = new CustomEvent(this);
    this.colorsExtracted = new CustomEvent(this);
    this.colorsTransformed = new CustomEvent(this);
}

Model.prototype = {
    saveImage: function(imageFile) {
        var image = new Image();

        var _this = this;

        image.onload = function() {
            _this._image = image;
            _this.imageSaved.notify(image);
        };

        image.src = URL.createObjectURL(imageFile); // Let this go to prevent memory leaks
    },

    extractColors: function(context) {
        console.log(context);
        var width = context.canvas.width;
        var height = context.canvas.height;
        var colors = new Array(width * height);

        console.log("Extracting colours...");
        var count = 0;
        for(var y = 0; y < height; y++) { // Traverses row by row
            for(var x = 0; x < width; x++) {
                var imageData = context.getImageData(x, y, 1, 1).data;
                var color = new ColorRGB(imageData[0]/255, imageData[1]/255, imageData[2]/255);
                colors[count] = color;
                count++;
            }
        }
        console.log("Colours extracted.");

        this._sRGBColors = colors;

        console.log(this._sRGBColors.length + " colours extracted");
        this.colorsExtracted.notify(this._sRGBColors);
    },

    /**
     * Generates a look-up table (lut) of from-bit colours to to-bit colours (e.g. 24-bit to 16-bit)
     * Note: 24-bit colours are a misnomer and have 256 denominations, unlike 8-bit or 16-bit colours
     *  which have 8 or 16 denominations respectively
     *
     * @param from The number of denominations of the input colours
     * @param to The number of denomications of the output colours
     * @returns {Array} A look-up table of to-bit colour equivalents in the from-bit coordinates
     */
    generateLut: function(from, to) {
        fromMax = from - 1;
        toMax = to - 1;
        ratio = fromMax / toMax;

        var lut = [];

        for(var i = 0; i < (to*to*to); i++) {
            lut[i] = new ColorRGB(
                ((i%to) * ratio)/fromMax,
                ((Math.floor(i/to)%to) * ratio)/fromMax,
                ((Math.floor(i/(to*to))) * ratio)/fromMax);
        }

        return lut;
    },

    transform24BitTo16Bit: function(colors24Bit) {
        var lut = this.generateLut(256, 16);

        var colors16Bit = [];

        // For each colour in the image, find it's 16-bit equivalent
        for(var i = 0; i < colors24Bit.length; i++) {
            var minDistance = Math.sqrt(3); // TODO: Generalise/explain?
            var minIndex = null;

            // Iterate over lut, finding entry that is cloest to 24-bit colour
            for(var j = 0; j < lut.length; j++) {
                var rDiff = colors24Bit[i].r - lut[j].r;
                var gDiff = colors24Bit[i].g - lut[j].g;
                var bDiff = colors24Bit[i].b - lut[j].b;
                var distance = Math.sqrt(Math.pow(rDiff, 2) + Math.pow(gDiff, 2) + Math.pow(bDiff, 2));
                if (distance < minDistance) {
                    minDistance = distance;
                    minIndex = j;
                }
            }

            colors16Bit[i] = lut[minIndex];
        }

        this.colorsTransformed.notify(colors16Bit);

        return colors16Bit; //TODO: For testing purposes, keep?
    },

    applyColorQuantisation: function(colors24Bit, inputBits, outputBits) {
        var lut = this.generateLut(inputBits, outputBits);

        var colors16Bit = [];
        for(var i = 0; i < lut.length; i++) {
            colors16Bit[i] = {
                key: lut[i],
                value: 0
            };
        }

        // For each colour in the image, find it's 16-bit equivalent
        for(var i = 0; i < colors24Bit.length; i++) {
            var minDistance = Math.sqrt(3); // TODO: Generalise/explain?
            var minIndex = null;

            // Iterate over lut, finding entry that is cloest to 24-bit colour
            for(var j = 0; j < lut.length; j++) {
                var rDiff = colors24Bit[i].r - lut[j].r;
                var gDiff = colors24Bit[i].g - lut[j].g;
                var bDiff = colors24Bit[i].b - lut[j].b;
                var distance = Math.sqrt(Math.pow(rDiff, 2) + Math.pow(gDiff, 2) + Math.pow(bDiff, 2));

                if (distance < minDistance) {
                    minDistance = distance;
                    minIndex = j;
                }
            }

            colors16Bit[minIndex].value += 1;
        }

        this.colorsTransformed.notify(colors16Bit);
        return colors16Bit; //TODO: For testing purposes, keep?
    }
};
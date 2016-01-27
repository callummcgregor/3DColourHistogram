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

    transform24BitTo16Bit: function(colors24Bit) {
        lut = [];
        for(var i = 0; i < 4096; i++) {
            // Dictionary of 16-bit to 24-bit colour mappings in the range 0-1
            // Key: 16 bit colour
            // Value: 24 bit colour equivalent
            lut.push({
                key: new ColorRGB((i%16)/15, (Math.floor(i/16)%16)/15, (Math.floor(i/256))/15), // TODO: Generalise
                //key: new ColorRGB((i%4)/3, (Math.floor(i/4)%4)/3, (Math.floor(i/16))/3),
                value: new ColorRGB(((i%16) * 17)/255, ((Math.floor(i/16)%16) * 17)/255, (Math.floor(i/256) * 17)/255) // Add % on z coord if dimensions change?
            });
        }

        var colors16Bit = [];

        for(var i = 0; i < colors24Bit.length; i++) {
            var closest16BitColor = null;
            var closestDistance = Math.sqrt(3 * Math.pow(255, 2));

            for(var j = 0; j < lut.length; j++) {
                var rDiff = colors24Bit[i].r - lut[j].key.r;
                var gDiff = colors24Bit[i].g - lut[j].key.g;
                var bDiff = colors24Bit[i].b - lut[j].key.b;
                var distance = Math.sqrt(Math.pow(rDiff, 2) + Math.pow(gDiff, 2) + Math.pow(bDiff, 2));
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closest16BitColor = lut[j].key;
                }
            }

            colors16Bit[i] = closest16BitColor;
        }

        console.log("24 bit colours | 16 bit colors");
        for (var i = 0; i < colors24Bit.length; i++) {
            console.log(colors24Bit[i] + " | " + colors16Bit[i]);
        }

        this.colorsTransformed.notify(colors16Bit);

        return colors16Bit; //TODO: For testing purposes, keep?
    },

    applyColorQuantisation: function(image, context, numberOfBins) {
        var pixelCount = 0;
        var pixelColours = new Array(image.width * image.height);
        for (var i = 0; i < pixelColours.length; i++) {
            pixelColours[i] = new Array(3);
        }

        for (var x = 0; x < image.width; x++) {
            for (var y = 0; y < image.height; y++) {
                var pixelData = context.getImageData(x, y, 1, 1).data;
                pixelColours[pixelCount][0] = pixelData[0];
                pixelColours[pixelCount][1] = pixelData[1];
                pixelColours[pixelCount][2] = pixelData[2];
                pixelCount++;
            }
        }

        var quantisedColors = new Array(pixelColours.length);
        for (var i = 0; i < quantisedColors.length; i++) {
            quantisedColors[i] = new Array(3);
        }

        for (var i = 0; i < pixelColours.length; i++) {
            // Iterate over the red, green, and blue channels
            for (var j = 0; j < 3; j++) {
                var rawColor = pixelColours[i][j];
                quantisedColors[i][j] = Math.floor(rawColor / numberOfBins);
            }
        }

        return quantisedColors;
    }
};
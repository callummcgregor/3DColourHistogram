/**
 * The Model
 **/
function Model() {
    var _originalColors = []; // The original colours in the image, saved in both RGB and CIE-Lab spaces
    var _modifiedColors = []; // Colors currently being used (i.e. after colour changes applied)

    this.imageReady = new CustomEvent(this);
    this.colorsChanged = new CustomEvent(this);

    /**
     * Get the current state of colours
     */
    this.getColors = function() {
        return _modifiedColors;
    };

    /**
     * Save the raw image file
     *
     * @param imageFile The raw image file to be saved
     */
    this.saveImage = function(imageFile) {
        var _this = this;
        var image = new Image();

        image.onload = function() {
            _this.imageReady.notify(image);
        };

        image.src = URL.createObjectURL(imageFile); // TODO: Let this go to prevent memory leaks
    };

    /**
     * Takes the image context (from the HTML5 canvas element), extracts the colours and converts them into
     *  and appropriate bit size
     *
     * @param context The image context (from the HTML5 canvas element)
     */
    this.parseImage = function(context) {
        // TODO: How to detect the bit of extracted colours
        _originalColors = extractColors(context); // Save colours in original bit size as to not loose resolution unnecessarily
        copyOriginalColorsToModifiedColors();
        this.colorsChanged.notify();
    };

    /**
     *
     * @param control
     * @param adjustment In range -10 to +10, represents percentage of original value to increment or decrease by
     */
    this.applyColorChanges = function(control, adjustment) {
        copyOriginalColorsToModifiedColors(); // Copy original colours by value to current colours

        switch (control) {
            case Model.BRIGHTNESS:
                for (var i = 0; i < _modifiedColors.length; i++) { // Apply brightness change to each colour
                    _modifiedColors[i].changeBrightness(adjustment);
                }
                this.colorsChanged.notify();
                break;
            case Model.CONTRAST:
                for (var i = 0; i < _modifiedColors.length; i++) { // Apply brightness change to each colour
                    _modifiedColors[i].changeContrast(adjustment);
                }
                this.colorsChanged.notify();
                break;
            case Model.SATURATION:
                for (var i = 0; i < _modifiedColors.length; i++) { // Apply brightness change to each colour
                    _modifiedColors[i].changeSaturation(adjustment);
                }
                this.colorsChanged.notify();

                break;
            default:
                throw new Exception("Unrecognised colour control, " + control);
        }
    };

    /**
     * Iterate over the pixels in the image context and extract the RGB values (presumed to be 24-bit),
     *  returning them as an array
     *
     * @param context The image context from the HTML5 canvas element
     * @returns {Array} An array of the RGB values from each pixel in the image
     */
    var extractColors = function(context) {
        console.log("Extracting colours...");

        var width = context.canvas.width;
        var height = context.canvas.height;
        var colors = [];

        var imageData = context.getImageData(0, 0, width, height).data;

        var count = 0;
        for(var y = 0; y < height; y++) { // Traverses row by row
            for(var x = 0; x < width; x++) {
                //var imageData = context.getImageData(x, y, 1, 1).data;
                var color = new Color;
                //color.setRgb(imageData[0]/255, imageData[1]/255, imageData[2]/255);
                color.setRgb(imageData[(x * 4) + (y * (width * 4)) + 0]/255,
                             imageData[(x * 4) + (y * (width * 4)) + 1]/255,
                             imageData[(x * 4) + (y * (width * 4)) + 2]/255);
                colors[count] = color;
                count++;
            }
        }
        console.log(colors.length + " non-unique colours extracted");

        return colors;
    };

    /**
     * Reset the array of current colours as the array of original colours
     * Done primarily to ensure that colour adjustments are reversable
     * Note: For loop and clone method used to copy by value, not by reference
     */
    var copyOriginalColorsToModifiedColors = function() {
        var newCurrentColors = [_originalColors.length];
        for (var i = 0; i < _originalColors.length; i++) {
            newCurrentColors[i] = _originalColors[i].clone();
        }
        _modifiedColors = newCurrentColors;
    };
}

// Static variables
Model.BRIGHTNESS = "brightness";
Model.CONTRAST = "contrast";
Model.SATURATION = "saturation";
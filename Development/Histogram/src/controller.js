/**
 * Define Controller and its fields
 *
 * @param model The model to update
 * @param view Listen for events from the view
 */
function Controller(model, view) {
    this._model = model;
    this._view = view;

    var _this = this;

    // Attach view listeners
    // When the image is uploaded, send the raw image file to the model to be saved
    this._view.imageUploaded.attach(function(sender, args) {
        _this._model.saveImage(args);
    });

    // When the image has been displayed by the view, send the context (i.e. the array of pixels extracted
    //  by HTML5 Canvas element) to the model for the colours to be parsed
    this._view.imageDisplayed.attach(function(sender, args) {
       _this._model.parseImage(args);
    });

    this._view.colorSpaceChanged.attach(function(sender, args) {
        _this._model.changeColorSpace(args);
    });
}
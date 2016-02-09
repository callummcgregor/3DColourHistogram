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
    this._view.imageUploaded.attach(function(sender, args) {
        _this.processImage(args);
    });

    this._view.imageDisplayed.attach(function(sender, args) {
       _this.extractColors(args);
    });

    this._view.constructLutButtonPressed.attach(function() {
        //_this._model.transform24BitTo16Bit();
    })
}

Controller.prototype = {
    processImage: function(imageFile) {
        this._model.saveImage(imageFile);
    },

    extractColors: function(context) {
        this._model.extractColors(context);
    }
};
/**
 * The Controller
 *
 * @param model The model to update
 * @param view Listen for events from the view
 */
function Controller(model, view) {
    var _model = model;
    var _view = view;

    // Attach view listeners
    // When the image is uploaded, send the raw image file to the model to be saved
    _view.imageUploaded.attach(function(sender, args) {
        _model.saveImage(args);
    });

    // When the image has been displayed by the view, send the context (i.e. the array of pixels extracted
    //  by HTML5 Canvas element) to the model for the colours to be parsed
    _view.imageDisplayed.attach(function(sender, args) {
       _model.parseImage(args);
    });
}
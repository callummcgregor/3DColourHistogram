$(function() {
    var model = new Model();
    var view = new View(model, {
        'imageUploadButton': $('#file_input'),
        'imageCanvas': $('#image_canvas'),
        'constructLutButton': $('#constructLut'),
        'colorSpaceRadio': $('[name="color_space"]')
    });
    var controller = new Controller(model, view);

    view.show();
});

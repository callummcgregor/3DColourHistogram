/**
 * Created by callum on 13/01/2016.
 */

function onLoad() {
    // Notify controller that the page has loaded
    pageLoaded();

    // Set up event listeners
    setImageUploadedListener();
}

/**
 * A listener to the HTML5 file input element that extracts the image from the event
 *  and passes it onto the controller in another event
 */
function setImageUploadedListener() {
    document.getElementById("file_input").addEventListener("change", function() {
        // Extract the first and only file
        var file = this.files[0];

        // Create and fire an event containing the extracted image, to which the controller is a listener
        var event = document.createEvent("CustomEvent");
        event.initEvent("imageUploaded", false, false);
        event.file = file;
        document.dispatchEvent(event);
    }, false);
}

function displayImage(image) {
    var imageCanvas = document.getElementById("image_canvas");
    var context = imageCanvas.getContext("2d");

    context.drawImage(image, 0, 0);
}

function displayRendering(rendering) {

}
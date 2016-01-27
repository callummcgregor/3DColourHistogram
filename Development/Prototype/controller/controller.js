/**
 * Created by callum on 13/01/2016.
 */

function pageLoaded() {
    imageUploaded();
    imageToDisplay();

    buildWorld();
}

function imageUploaded() {
    document.addEventListener("imageUploaded", function(event) {
        handleRawImage(event.file);
    }, false);
}

function gesture() {

}

function colourSpaceChange() {

}

function imageToDisplay() {
    document.addEventListener("imageSaved", function(event) {
        displayImage(event.image);
    }, false);
}

function renderingToDisplay() {

}
'use strict'

var client = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
	var btn = document.getElementById("saveFile");
	btn.addEventListener("click", function() {downloadAndSave("./img/detroitSkyline.jpg")});
}

function downloadAndSave(url) {
	if (typeof Windows !== 'undefined') {
		client = new XMLHttpRequest();
    	if (client) {
	        client.open("GET", url, true);
	        client.responseType = "blob";
	        client.onreadystatechange = readyStateCallback;
	        client.send(null);
	    } else {
	       console.log("Cannot create new XMLHttpRequest object");
	    }
	} else {
		console.log("Windows namespace is undefined. Make sure this is running as a hosted web app with WinRT access through ACURs/Content URIs")
	}

	
}

function readyStateCallback() {
    if (client.readyState === 4) {
        if (client.status !== 200) {
            console.log("Unable to download blob - status code: " + client.status.toString());
        } else {
            var blob = client.response;
            saveFile(blob);
        }
    }
}

function saveFile(blob) {
	// Clean scenario output
    console.log("saveFile Invoked");

     // Create the picker object and set options
    var savePicker = new Windows.Storage.Pickers.FileSavePicker();
    savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
    // Dropdown of file types the user can save the file as
    savePicker.fileTypeChoices.insert("JPEG (*.jpg)", [".jpg"]);
    // Default file name if the user does not type one in or select a file to replace
    savePicker.suggestedFileName = "NewPicture";

    savePicker.pickSaveFileAsync().then(function (file) {
        if (file) {
        	// Prevent updates to the remote version of the file until we finish making changes and call CompleteUpdatesAsync.
            Windows.Storage.CachedFileManager.deferUpdates(file);
        	// Open the returned file in order to copy the data
        	file.openAsync(Windows.Storage.FileAccessMode.readWrite).then(function (output) {
	            // Get the IInputStream stream from the blob object
	            var input = blob.msDetachStream();

	            // Copy the stream from the blob to the File stream
	            Windows.Storage.Streams.RandomAccessStream.copyAsync(input, output).then(function () {
	                output.flushAsync().done(function () {
	                    input.close();
	                    output.close();
	                    console.log("File: " + file.name + " saved successfully to the Pictures Library!");

	                    // Let Windows know that we're finished changing the file so the other app can update the remote version of the file.
		                // Completing updates may require Windows to ask for user input.
		                Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
		                    if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
		                       console.log("File " + file.name + " was saved.");
		                    } else {
		                       console.log("File " + file.name + " couldn't be saved.");
		                    }
		                });
	                });
	            });
        	});
        } else {
            console.log("Operation cancelled.");
        }
    });
}
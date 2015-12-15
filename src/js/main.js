;(function() {
  'use strict'

	function download(url) {
		new Promise(function(resolve, reject) {
			if (typeof Windows === 'undefined') {
				reject(new Error("Windows namespace is undefined. Make sure this is running as a hosted web app with WinRT access through ACURs/Content URIs"));
				return;
			}
			var client = new XMLHttpRequest();
			client.open("GET", url, true);
			client.responseType = "blob";
			client.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status === 200) {
						resolve(this.response);
					} else {
						this.onerror();
					}
				}
			};
			client.onerror = function() {
				reject(new Error("Unable to download blob - status code: " + this.status));
			};
			client.send(null);
		});
	}

	function saveBlob(blob) {
		// Get the IInputStream stream from the blob object
		var inputStream = blob.msDetachStream();

		var savePicker = new Windows.Storage.Pickers.FileSavePicker();
		savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
		savePicker.fileTypeChoices.insert("JPEG (*.jpg)", [".jpg"]);
		savePicker.suggestedFileName = "NewPicture";

		return savePicker
			.pickSaveFileAsync()
			.then(deferUpdates)
			.then(function(storageFile) {
				// Open the returned file in order to copy the data
				return storageFile.openAsync(Windows.Storage.FileAccessMode.readWrite).then(function(outputStream) {
					// Copy the stream from the blob to the File stream
					return Windows.Storage.Streams.RandomAccessStream.copyAsync(inputStream, outputStream).then(function() {
						new Promise(function(resolve) {
							outputStream.flushAsync().done(function() {
								inputStream.close();
								outputStream.close();
								resolve(storageFile);
							});
						});
					});
				});
			})
			.then(completeUpdates)
			.then(function(status) {
				if (status === Windows.Storage.Provider.FileUpdateStatus.complete) {
					resolve(storageFile);
				} else {
					reject(storageFile);
				}
			});
	}

	function deferUpdates(storageFile) {
		// Prevent updates to the remote version of the file until we finish making changes and call CompleteUpdatesAsync.
		Windows.Storage.CachedFileManager.deferUpdates(storageFile);
		return Promise.resolve(storageFile);
	}

	function completeUpdates(storageFile) {
		new Promise(function(resolve) {
			Windows.Storage.CachedFileManager.completeUpdatesAsync(storageFile).done(resolve);
		});
	}

	document.addEventListener("DOMContentLoaded", function() {
		document.getElementById("saveFile")
		  .addEventListener("click", () => {
				download("./img/detroitSkyline.jpg")
				  .then(saveBlob)
					.then(function(file) {
						console.log("File " + file.name + " was saved.");
					})
					.catch(function(file) {
						console.log("File " + file.name + " couldn't be saved.");
					});
			});
	});

}());

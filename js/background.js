

var menuItem = chrome.contextMenus.create({"title": "Download all Docs", "onclick": downloadLinkedDocs});


/**
* Download all documents of the selected formats linked to in the active tab
*/
function downloadLinkedDocs() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(tabs[0].id, {file: 'js/content.js', allFrames: true}, function() {
			chrome.tabs.sendMessage(tabs[0].id, {message: "send links"}, function(links) {
				chrome.storage.local.get(null, function(items) {
					formats = [];
					for (key in items) {
						if (items[key] === "true") {
							formats.push("\\." + key + "$");
						}
					}
					var pdfRegex = new RegExp(formats.join('|'), 'i');		
					for(var i = 0; i < links.length; i++) {
						if (pdfRegex.test(links[i])) {
							chrome.downloads.download({url: links[i]});
						}
					}
				});
			});
		});
	});
}



var supported_formats = ["pdf", "docx", "pptx"];


// set checkbox "checked" states to latest saved state or to defaults
window.addEventListener('load', function() {
	supported_formats.forEach(function(format) {
		chrome.storage.local.get(format, function(result_pair) {
			if (Object.keys(result_pair).length === 0) {
				var format_pair = {};
				format_pair[format] = "true";
	  			chrome.storage.local.set(format_pair);
				document.getElementById(format).checked = true;
			} else {
				for (key in result_pair) {
					if (key === format) {
						state = result_pair[key] === "true" ? true : false;
						document.getElementById(format).checked = state;
					}
				}
			}
		});
	});
});

// save state of popup format checkboxes to local storage when they are changed
document.addEventListener('DOMContentLoaded', function() {
	supported_formats.forEach(function(format) {
		var box = document.getElementById(format);
		box.addEventListener('change', function () {
			var format_pair = {};
			format_pair[format] = "" + box.checked;
	  		chrome.storage.local.set(format_pair);
		});
	});
});



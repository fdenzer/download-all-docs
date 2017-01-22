

// set checkbox "checked" states to saved state
window.addEventListener('load', function() {
    chrome.storage.local.get(null, function(result) {
        for (key in result) {
            state = result[key] === "true" ? true : false;
            document.getElementById(key).checked = state;
        }
    });
});

// save state of popup format checkboxes to local storage when they are changed
document.addEventListener('DOMContentLoaded', function() {
    var boxes = document.getElementsByName("formats");
    boxes.forEach(function(box) {
        box.addEventListener('change', function () {
            var format_pair = {};
            format_pair[box.id] = "" + box.checked;
            chrome.storage.local.set(format_pair);
        });
    });
});
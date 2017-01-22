

var menuItem = chrome.contextMenus.create({"title": "Download all Docs", "onclick": downloadLinkedDocs});
var supported_formats = ["pdf", "docx", "pptx"];
var MAX_DOWNLOADS = 200;


// initialize checkbox "checked" states in local storage if not there already
window.addEventListener('load', function() {
    supported_formats.forEach(function(format) {
        chrome.storage.local.get(format, function(result_pair) {
            if (Object.keys(result_pair).length === 0) {
                var format_pair = {};
                format_pair[format] = "true";
                chrome.storage.local.set(format_pair);
            }
        });
    });
});


/**
* Download all documents of the selected formats linked to in the active tab
*/
function downloadLinkedDocs() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(tabs[0].id, {file: 'js/content.js', allFrames: true}, function() { 
            chrome.tabs.sendMessage(tabs[0].id, {message: "send links"}, function(links) {
                // create filter for those document formats that have been selected in the popup
                chrome.storage.local.get(null, function(items) {
                    var formats = [];
                    for (key in items) {
                        if (items[key] === "true") {
                            formats.push("\\." + key + "$");
                        }
                    }
                    var pdfRegex = new RegExp(formats.join('|'), 'i'); 
                    var downloadLinks = []; 
                    var promises = [];
                    links.forEach(function(link) {
                        if (pdfRegex.test(link)) {
                            promises.push(notBroken(link, downloadLinks));
                        }
                    });
                    // download documents, zipped if multiple
                    Promise.all(promises).then(resultArr => {
                        result = resultArr[0];
                        if (!result) {
                            alert("No documents to download on this page");
                            return;
                        }
                        if (result.length == 1) {
                            chrome.downloads.download({url: result[0]});
                        } else if (result.length > 1) {
                            if (result.length > MAX_DOWNLOADS) {
                                result = result.slice(0, MAX_DOWNLOADS);
                            }
                            getZip(result);
                        }
                    });
                });
            });
        });
    });
}


function notBroken(link, resultArr) {
    return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status < 400) {
                resultArr.push(link);
                resolve(resultArr);
            } else if (request.readyState === 4 && request.status >= 400) {
                resolve(resultArr);
            }
        }
        request.open('HEAD', link, true);
        request.send(null);
    });
}

/**
* Return zip of all files pointed to by URL array links
*/
function getZip(links) {
    var fs = new zip.fs.FS();
    links.forEach(function(link) {
        domains = link.split('/');
        fs.root.addHttpContent(domains[domains.length-1], link);
    });
    fs.root.exportData64URI(function(download_link) {
        chrome.downloads.download({url: download_link});
    });
}


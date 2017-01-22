
/*
* Return all unique functioning hyperlinks in the current page
*/
function getLinks() {
  var badPrefix = 'javascript';
  var pdfRegex = new RegExp('^https?:\/\/|^ftp:\/\/', 'i'); 
  var links = Array.prototype.slice.call(document.querySelectorAll("a"), 0);
  links.sort();
  // dedup, remove empty strings and links with risky prefixes
  for (var i = 0; i < links.length;) {  
    links[i] = String(links[i].href);
    if (!pdfRegex.test(links[i]) || (i > 0 && links[i] == links[i-1]) ||  
      (links[i].trim() === "") || (links[i].toLowerCase().substr(0, badPrefix))) {
      links.splice(i, 1);
    } else {
      // strip URL fragments
      var hashIndex = links[i].indexOf('#');  
      if (hashIndex >= 0) {
        links[i]= links[i].substr(0, hashIndex); 
      }
      ++i;
    }
  }
  return links;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === "send links") {
    sendResponse(getLinks());
  }
});
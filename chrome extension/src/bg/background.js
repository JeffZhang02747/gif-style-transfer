// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({url: chrome.extension.getURL('index.html')});
});

chrome.contextMenus.create({
	"id": "GIF Stylizer",
    "title": "open gif with GIF Stylizer",
    "contexts":["image"],
    "targetUrlPatterns": ["https://*/*.gif", "http://*/*.gif"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab){
	chrome.tabs.create({url: chrome.extension.getURL('index.html') + "?gifurl=" + info.srcUrl});
});
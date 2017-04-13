var bkg = chrome.extension.getBackgroundPage();
chrome.browserAction.onClicked.addListener(function(tab){
    bkg.console.log('browser_action');
    chrome.tabs.query({active:true,currentWindow:true},function(tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id,{"message":"clicked_browser_action"});
    })
});

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    bkg.console.log("Chrome: ",request);
    if(request.message === "open_new_tab"){
        chrome.tabs.create({"url":request.url});
    } else if(request.getstream){
        chrome.desktopCapture.chooseDesktopMedia(["screen","window"],sender.tab,function(streamId){
            sendResponse({streamId:streamId});
        });
    } else {
        console.log("Unknown requets");
        sendResponse({error:"Unknown request"});
    }
});
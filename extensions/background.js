var bkg = chrome.extension.getBackgroundPage();
chrome.browserAction.onClicked.addListener(function(tab){
    bkg.console.log('browser_action');
    chrome.tabs.query({active:true,currentWindow:true},function(tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id,{"message":"clicked_browser_action"});
    })
});

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    bkg.console.log("Chrome onMessage: ",request);
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

chrome.runtime.onMessageExternal.addListener(
     function(request,sender,sendResponse){
         bkg.console.log('Chrome External: ',request);
        if(request.message === "open_new_tab"){
            chrome.tabs.create({"url":request.url});
        } else if (request.getStream) {
             chrome.desktopCapture.chooseDesktopMedia(
                ["screen", "window"], sender.tab,
                function(streamId) {
                    sendResponse({ streamId: streamId});
                });
                return true;
        } else if (request.message === "enable"){
            console.log("Received: enable");
            var extensionID = request.extensionID;
            chrome.management.get(extensionID, function(result) {
                console.log(" Detect Content Scripts: ",result);
                console.log(" Detect Content Scripts Enabled: ",result.enabled);
                var enabled = "0";
                if(result.enabled){
                    enabled = "1";
                }
                sendResponse({extension: enabled});
            });
            return true;
        } else {
            console.error("Unknown request");
            sendResponse({ error : "Unknown request" });
        }
        
    }
);
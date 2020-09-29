// Copyright 2020 ngonhan2k5 Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var _keywords = ['industry', 'benefit', 'c2c', 'remote', 'citizen']

// When extension installed
chrome.runtime.onInstalled.addListener(function () {

    chrome.storage.sync.get('keywords', function (data) {
        console.log('onstart', data.keywords);
        if (data && data.keywords)
            _keywords = data._keywords;
        else{
            chrome.storage.sync.set({ keywords: _keywords}, function () {
                console.log("Install: default kw set");
            });
        }
    });

})

// On browser start
chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get('keywords', function (data) {
        console.log('onstart', data.keywords);
        if (data && data.keywords)
            _keywords = data._keywords;
    
    });

});

// Receive message
chrome.runtime.onMessage.addListener(handleMessage);

function handleMessage(n, t, i) {
    console.log('request message received', n, t)
    switch (n.type) {
        // Request config from activeTab
        case "config":
            console.log(n, t)
            i(_keywords)
            break;
        // Request save new keywords
        case "keyword":
            if (n.keywords){
                _keywords = n.keywords
                chrome.storage.sync.set({ keywords: _keywords}, function () {
                    console.log("Change kw set", _keywords);
                });
            }else{
                console.log("Can not change kw config")
            }
            break;
        default:
            i()
    }

}
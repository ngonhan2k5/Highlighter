// Copyright 2020 ngonhan2k5 Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let changeKeyword = document.getElementById('save');

changeKeyword.onclick = function (element) {
    let kw = txtKeyword.value;
    kw = kw.split(',').map(k=>k.trim())
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        chrome.tabs.sendMessage(tabs[0].id, {
            type: "keyword",
            keywords: kw

        })

        chrome.runtime.sendMessage({
            type: "keyword",
            keywords: kw
        })
    });
};


chrome.storage.sync.get('keywords', function (data) {
    console.log('popup', data.keywords);
    
    let txtKeyword = document.getElementById('keyword');
    if (data && data.keywords)
        txtKeyword.value = data.keywords.join(', ');

});

// Copyright 2020 ngonhan2k5 Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

(function () {
    /**
     * Observate DOM change on body and firing keyword searching with delay and bounced by bounceTime
     */
    var observeDOM = (function (obj, bounceTime) {
        var addedNodes = [], removedNodes = [],
            MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
            _mutationObserver, _obj = obj, _isRunning = false, _isObserving = false,
            _keywords = ['benefit', 'industry'],
            _kes = _keywords.map(k => [new RegExp(k, "ig"), k]),
            _replaces = [], _hlis = [];

        function init(keywords) {
            _keywords = keywords,
                _kes = _keywords.map(k => [new RegExp(k, "ig"), k]),
                _mutationObserver = null,
                _isRunning = false,
                _replaces = [],
                _hlis = []
        }
        function replace(str, keywords) {
            let result = str;
            // console.log(keywords);
            keywords.forEach(ke => {
                result = result.replace(ke[0], function (m) {
                    return '<span class="hli" hli>' + m + '</span>';
                })
            });
            return result;
        }
        function contains(str) {
            return _kes.filter(k => str.match(k[0]));
        }
        function find(nodes) {

            nodes.forEach(elm => {
                if (elm.nodeType == 3 && elm.nodeValue) {
                    let cons = contains(elm.nodeValue);
                    if (cons.length) {
                        // console.log(888, cons)
                        // let a = document.createElement('div')
                        let innerHtml = elm.nodeValue;
                        innerHtml = replace(innerHtml, cons);
                        //elm.replaceWith(...a.childNodes)
                        _replaces.push([elm, innerHtml]);
                    }
                } else if (elm.hasAttribute && elm.hasAttribute('hli')) {

                } else if (elm.nodeName != 'CODE' && elm.childNodes.length > 0) {
                    find(elm.childNodes)
                } else {
                    // console.log(element.nodeName, element.nodeType, element)
                }
            });

        }
        function doReplaces() {
            _hlis = []
            _replaces.forEach(r => {
                let a = document.createElement('span')
                a.innerHTML = r[1];
                _hlis.push(...a.querySelectorAll('span.hli'));
                // r[0].replaceWith(...a.childNodes)
                r[0].replaceWith(a)
            });
            console.log('Replace:', _replaces.length)
            _replaces = []
        }
        function doScrollIntoView() {
            console.time('scroll')
            for (i of _hlis) {
                let a = window.getComputedStyle(i)
                if (a.display != 'none') {
                    console.log('scroll', i)
                    i.scrollIntoView(true);
                    i.focus();
                    console.timeEnd('scroll')
                    return
                }
            }
            console.timeEnd('scroll')
        }
        var handle = null;
        function bouncedCallback() {
            if (handle) {
                clearTimeout(handle)
                console.log('Bouncing..')
            }

            handle = setTimeout(function () {
                console.log(111, addedNodes.length)
                console.time('find')
                find(document.body.childNodes);
                doReplaces();
                console.timeEnd('find')
                doScrollIntoView({ block: 'center', inline: 'center' }); // not work well
                handle = null;
            }, bounceTime)
        }

        var _callback = function (m) {
            bouncedCallback()
        };

        return {
            start: function (force) {
                if (_isObserving) {
                    observeDOM.stop();
                }

                console.log('Observe started on body', _keywords)
                if (!_obj || _obj.nodeType !== 1) return;

                if (MutationObserver) {
                    // define a new observer
                    _mutationObserver = new MutationObserver(_callback)

                    // have the observer observe foo for changes in children
                    _mutationObserver.observe(obj, { childList: true, subtree: true })
                }

                // browser support fallback
                else if (window.addEventListener) {
                    obj.addEventListener('DOMNodeInserted', _callback, false)
                    obj.addEventListener('DOMNodeRemoved', _callback, false)
                }

                if (force) {
                    setTimeout(_callback, bounceTime / 2)
                }
                _isObserving = true;
            },
            stop: function () {
                console.log('Observe stopped on body')
                if (!_isObserving) return;

                if (!_mutationObserver) {
                    _obj.removeEventListener('DOMNodeInserted', _callback, false)
                    _obj.removeEventListener('DOMNodeRemoved', _callback, false)
                } else {
                    _mutationObserver.disconnect();
                }

                _isObserving = false
            },
            changeKw: function (keywords, force) {
                console.log('Changed keywords', keywords)
                init(keywords)
                if (force) {
                    _callback([])
                }
            }
        }
    })(document.body, 1000);

    // Get configured keywords
    (new Promise(function (rs, rj) {
        try {
            chrome.runtime.sendMessage({
                type: "config",
                data: [1, 2]
            }, function (n) {
                rs(n)
            })
        } catch (e) {
            rj(e)
        }
    })).then(function (d) {
        observeDOM.changeKw(d)
        observeDOM.start(true); //force start
    });


    if (chrome.runtime && !chrome.runtime.onMessage.hasListener(navigated)) {
        console.log("Chrome Extension ready to go!");
        // console.log(document.URL, document.contentType);
        chrome.runtime.onMessage.addListener(navigated);
    }
    //Replace
    function navigated(message, sender, sendresponse) {
        console.log('msg received', message)
        switch (message.type) {
            // when navigated without reload
            case "navi":
                // console.log('find', message, sender, sendresponse);
                // observeDOM.start();
                break;
            // when keywords changed
            case "keyword":
                observeDOM.changeKw(message.keywords, true)
                break;
        }
    }
})()
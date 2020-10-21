// content_script.js

function checkBookmark(e) { // 初始化时检测storage中当前页面的书签信息
    var url = location.href;
    chrome.storage.sync.get(url, function(data) {
        data = data[url];

        if (!data) {
            return;
        }

        //console.log('get: ' + JSON.stringify(data));
        insertBookTag(data);
        $scrollElems[0].animate({
            scrollTop: data.pageY
        }, 1000);

        // body scroll失败，尝试html scroll
        if ($scrollElems[0].scrollTop() !== data.pageY) {
            $scrollElems[1].animate({
                scrollTop: data.pageY
            }, 1000);
        }
    });
}

function bindEvents() { // 事件和消息
    $doc.on('mouseup', function(e) { // 右键记录当前位置，并发送message给background
            //console.log(e.which);

            if (e.which === 3) {
                chrome.runtime.sendMessage({
                    type: 'bookmark-position',
                    pageX: e.pageX,
                    pageY: e.pageY,
                    title: document.title,
                    progress: Math.floor(e.pageY * 100 / $doc.height())
                });
            }
        })
        .on('ready', checkBookmark)
        .on('click', '#book-mark-tag .js-delete', function(e) {
            chrome.runtime.sendMessage({
                type: 'remove-bookmark'
            });
        });

    chrome.runtime.onMessage.addListener(function(request, sender, sendRequest) { // background返回的回调消息
        if (request.type === 'add-bookmark-cb') {
            insertBookTag(request);
        } else if (request.type === 'remove-bookmark-cb') {
            deleteTag();
        }
    });
}
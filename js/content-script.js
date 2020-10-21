
    console.log('chrome1',$)
    console.log('chrome',$)
    chrome.contextMenus.create({
        title:'采集到华钜',
        // parentId:'btn',
        onclick(e,a){
            console.log('点击了右键菜单',e,a)
            console.log('document',$('.d-title').html())
        }
    },function(e){
        console.log('出错',e)
    })
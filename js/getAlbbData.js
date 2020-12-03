function getALBBData(doc,requestCur){
    let params ={
        goodName:'',
        otherImage:[],
        goodAttributes:'',
        goodSkuVoList:[],
        "targetAt": "A1688",
        "fromUrl": requestCur.url,
        "mainImage": '',//主图
        discountPrice:'',
    }
    let obj = document.createElement('div');
    obj.innerHTML = doc;
    params.goodName = $(obj).find('.d-title').html();

    // 产品图
    $(obj).find('#dt-tab').find('li').each(function(){
        if(params.otherImage.length<4){
            let img =initImg( $(this).find('img').attr('src'));
            params.otherImage.push(img)
        }
    })
    // 主图
    if(params.otherImage.length){
        params.mainImage = params.otherImage[0]
    }
    // 属性
    $(obj).find('.obj-content').find('td').each(function(){
        if($(this).hasClass('de-feature')&&$(this).text().trim()){
            params.goodAttributes=(params.goodAttributes + $(this).text().trim()+': ');
        }
        if($(this).hasClass('de-value')&&$(this).find('.de-value-contents').text().trim()){
            params.goodAttributes+=($(this).find('.de-value-contents').text().trim()+'\n');
        }
    })
    let sku= getALBBSku(doc,params);
    params.goodSkuVoList = sku.goodSkuVoList;
    params.discountPrice = sku.discountPrice;
    // console.log(JSON.stringify(params),'obj') 
    return params;
}

function getALBBSku(doc,params){
    let p = {
        discountPrice:'',
        goodSkuVoList:[]
    }
    let mat = doc.match(/iDetailData[\s\S]*?};/g);
    let str = '';
    if(mat[0]){
        str = mat[0].replace(/[\s]*/g,'')
        str = str.substring(12,str.length-1)
    }
    // str = str.match(/skuMap:[\s\S]*?,end/g)
    // if(str[0]){
    //     str = str[0].replace(/[\s]*/g,'')
    //     str = str.substring(7,str.length-4)
    // }
    let fn = new Function('return '+str)
    let fnText = fn();
    // 存在sku
    if(fnText.sku){
        let sku = fnText.sku;
        // console.log('skuobj',sku)
        let skuMap = sku.skuMap;
        let arr =[];
        Object.keys(skuMap).map(key=>{
            let item = skuMap[key];
            let price = '';
            // 两种sku模式，一种价格范围，一种固定价格
            // 价格范围
            if(sku.price){
                price = item.discountPrice;
                p.discountPrice = sku.price.substr(sku.price.indexOf('-')+1);//价格
            }else 
            // 固定价格
            if(sku.priceRange&&sku.priceRange.length){
                price = sku.priceRange[0][1];
                price = price.toFixed(2)
                p.discountPrice = price;
            }
            arr.push({
                colorName:key.indexOf('&gt;')>-1?(key.substr(0,key.indexOf('&gt;'))):key,
                sizeName:key.indexOf('&gt;')>-1?(key.substr(key.indexOf('&gt;')+4)||''):'',
                costPrice:price,
                salePrice:price,
            })
        })
        let skuProps = sku.skuProps;
        skuProps.map(item=>{
            item.value.map(item2=>{
                arr.map(arrItem=>{
                    if(item2.name===arrItem.colorName||item2.name===arrItem.sizeName){
                        if(item2.imageUrl){
                            arrItem.mainImage = item2.imageUrl;
                        }
                    }
                    if(!arrItem.mainImage){
                        arrItem.mainImage = params.mainImage;
                    }
                })
            })
        })
        p.goodSkuVoList = arr;
    }else{
        // 不存在sku
        let mat = doc.match(/var\siDetailConfig[\s\S]*?};/g);
        let str = '';
        if(mat[0]){
            str = mat[0].replace(/[\s]*/g,'')
            str = str.substring(17,str.length-1)
        }
        // console.log(str,'mat')
        // str = str.match(/skuMap:[\s\S]*?,end/g)
        // if(str[0]){
        //     str = str[0].replace(/[\s]*/g,'')
        //     str = str.substring(7,str.length-4)
        // }
        let fn = new Function('return '+str)
        let fnText = fn();
        p.discountPrice = fnText.refPrice;//价格
    }
    // console.log(p,'sku数据')
    return p;
}

// 格式化图片
function initImg(img){
    if(img){
        img =  img.replace('.60x60.','.');
        img =  img.replace('.32x32.','.');
    }else{
        img = '';
    }
    // console.log(img,'initImg')
    return img
}
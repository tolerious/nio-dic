/*
copy the selected text to clipboard
*/
var positionX = "";
var positionY = "";
var positionWidth = "";

function copySelection(e) {
    var selectedText = window.getSelection().toString().trim();
    console.log(`copy text:  ${selectedText}`);
    if (e.target.localName != "img") {
        canAddIcon(selectedText);
    }
    if (selectedText) {
        document.execCommand("Copy");
    }
}

function canAddIcon(text) {
    let element = document.querySelector("#amo-dic-id");
    let iframe = document.querySelector("#dic-iframe");
    if (!element && text) {
        const iconDiv = document.createElement("div");
        iconDiv.addEventListener("click", iconClick);
        let htmlImageElement = document.createElement("img");
        iconDiv.setAttribute("id", "amo-dic-id");
        htmlImageElement.src = browser.runtime.getURL("images/dic.png");
        htmlImageElement.style.height = 25 + "px";
        htmlImageElement.style.width = 25 + "px";
        htmlImageElement.style.cursor = "pointer";
        let rangeAt = window.getSelection().getRangeAt(0);
        let boundingClientRect = rangeAt.getBoundingClientRect();
        let {x, y, width} = boundingClientRect;
        positionX = x;
        positionY = y;
        positionWidth = width;
        iconDiv.style.position = "fixed";
        iconDiv.style.left = (width + x) + "px";
        iconDiv.style.top = y + "px";
        iconDiv.appendChild(htmlImageElement);
        document.body.appendChild(iconDiv);
    } else {
        element.parentNode.removeChild(element);
        iframe.parentNode.removeChild(iframe);
    }
}

function iconClick() {
    console.log("click pop icon.");
    var selectedText = window.getSelection().toString().trim();
    translate(selectedText);
}

function truncate(q) {
    var len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}

function translate(translateText) {
    var appKey = "30b3aa18e38ef10f";
    var key = "bibHDDDpyseZdaYCujNje3RcQFQc9Ort";//注意：暴露appSecret，有被盗用造成损失的风险
    var salt = (new Date).getTime();
    var curtime = Math.round(new Date().getTime() / 1000);
    var query = translateText;
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = "en";
    var to = "zh-CHS";
    var str1 = appKey + truncate(query) + salt + curtime + key;

    var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
    $.ajax({
        url: "http://openapi.youdao.com/api",
        type: "post",
        // dataType: "jsonp",
        data: {
            q: query,
            appKey: appKey,
            salt: salt,
            from: from,
            to: to,
            sign: sign,
            signType: "v3",
            curtime: curtime,
        },
        success: function (data) {
            createiFrame(data);
        },
        error: function (e) {
            throw Error(e);
        }
    });


}

function createiFrame(data) {
    let htmliFrameElement = document.createElement("iframe");
    htmliFrameElement.setAttribute("id", "dic-iframe");
    htmliFrameElement.setAttribute("src", "http://localhost:8080");
    htmliFrameElement.style.position = "fixed";
    htmliFrameElement.style.left = (positionX + positionWidth) + "px";
    htmliFrameElement.style.top = positionY + "px";
    htmliFrameElement.style.border = "1px solid #409EFF";
    htmliFrameElement.style.borderRadius = "3px";
    document.body.appendChild(htmliFrameElement);
    window.addEventListener("message", function (e) {
        if (e.data.type == "iframe2ext") {
            console.log(e.data.data.status);
            if (e.data.data.status == "mounted") {
                htmliFrameElement.contentWindow.postMessage({type: "ext2iframe", result: data}, "*");
            }
        }
    });
}


browser.runtime.sendMessage({action: "insert"});

/*
Add copySelection() as a listener to mouseup events.
*/
document.addEventListener("mouseup", copySelection);
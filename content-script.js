/*
copy the selected text to clipboard
*/
var positionX = "";
var positionY = "";
var positionWidth = "";

function copySelection(e) {
    var selectedText = window.getSelection().toString().trim();
    if (e.target.localName != "img") {
        canAddIcon(selectedText);
    }
    console.log(selectedText);
    if (selectedText) {
        document.execCommand("Copy");
    }
}

function canAddIcon(text) {
    let element = document.querySelector("#amo-dic-id");
    let popup = document.querySelector("#popup-panel");
    if (!element && text) {
        const iconDiv = document.createElement("div");
        iconDiv.addEventListener("click", iconClick);
        let htmlImageElement = document.createElement("img");
        iconDiv.setAttribute("id", "amo-dic-id");
        htmlImageElement.src = browser.extension.getURL("images/dic.png");
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
        popup.parentNode.removeChild(popup);
    }
}

function iconClick() {
    console.log("click");
    var selectedText = window.getSelection().toString().trim();
    translate(selectedText);
}

function truncate(q) {
    var len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}

function translate(translateText) {
    console.log(123);
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
            createPopupDom(data);
        },
        error: function () {
            console.log(123);
        }
    });


}

function createPopupDom(data) {
    console.log(data.speakUrl);
    let laba = browser.runtime.getURL("fake/laba.png");
    let love = browser.runtime.getURL("fake/love.png");
    let s = "";
    for (let i = 0; i < data.basic.explains.length; i++) {
        let str = "<p>" + data.basic.explains[i] + "</p>";
        s += str;
    }
    let dom = `
<div class="square-container">
    <div class="square-container-innner">
        <div class="first-line">
            <div><span>${data.query}</span></div>
            <div id="laba"><img src="${laba}" alt="laba"></div>
            <div id="love"><img src="${love}" alt="laba"></div>
        </div>
        <div class="second-line">
           ${s}
        </div>
    </div>
</div>
    `;

    let htmlDivElement = document.createElement("div");
    htmlDivElement.setAttribute("id", "popup-panel");
    htmlDivElement.setAttribute("class", "square-container");
    htmlDivElement.innerHTML = dom;
    htmlDivElement.style.left = (positionX + positionWidth) + "px";
    htmlDivElement.style.top = positionY + "px";

    document.body.appendChild(htmlDivElement);
    //add event listener
    let audioDom = document.getElementById("laba");
    audioDom.addEventListener("click", function () {
        let audio = new Audio(data.speakUrl);
        audio.play();
    });

}

browser.runtime.sendMessage({action: "insert"});

/*
Add copySelection() as a listener to mouseup events.
*/
document.addEventListener("mouseup", copySelection);
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
    let popup = document.querySelector("#shadow-root-container");
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
        // popup.parentNode.removeChild(popup);
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
            // createPopupDom(data);
            // createPopDom(data);
            createiFrame(data);
        },
        error: function () {
            console.log(123);
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

function createPopDom(data) {
    let htmlDivElement = document.createElement(`div`);
    htmlDivElement.setAttribute("id", "shadow-root-container");
    let shadowRoot = htmlDivElement.attachShadow({mode: "open"});
    let htmlStyleElement = document.createElement("style");
    htmlStyleElement.textContent = `
.square-container {
    font-size: 15px;
    width: 300px;
    border: 1px solid #409EFF;
    padding: 2px;
    border-radius: 3px;
    box-sizing: border-box;
    position: fixed;
    background-color: white;
    z-index: 999;
    left: ${positionX + positionY}px;
    top:${positionY}px;
}

.square-container-innner {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    /*align-items: center;*/
}

.first-line {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.first-line > div:nth-child(2) > img {
    height: 20px;
    margin-left: 10px;
    cursor: pointer;
}

.first-line > div:nth-child(3) > img {
    height: 20px;
    margin-left: 10px;
    cursor: pointer;
}


.second-line {
    font-size: 12px;
}

    `;
    let htmlDivElement1 = document.createElement("div");
    htmlDivElement1.setAttribute("class", "square-container");
    let s = "";
    for (let i = 0; i < data.basic.explains.length; i++) {
        let str = "<p>" + data.basic.explains[i] + "</p>";
        s += str;
    }
    htmlDivElement1.innerHTML = `
    <div class="square-container-innner">
        <div class="first-line">
            <div><span>${data.query}</span></div>
            <div ><img id="laba" src="${browser.runtime.getURL("fake/laba.png")}" alt="laba"></div>
            <div><img src="${browser.runtime.getURL("fake/love.png")}" alt="laba"></div>
        </div>
        <div class="second-line">
            <p>${s}</p>
        </div>
    </div>
    `;

    shadowRoot.appendChild(htmlDivElement1);
    shadowRoot.appendChild(htmlStyleElement);

    document.body.appendChild(htmlDivElement);
    let audioDom = shadowRoot.querySelector("#laba");
    console.log(audioDom);
    let audio = new Audio("https://openapi.youdao.com/ttsapi?q=access&langType=en&sign=21EA0380AEF05C4C7CFECF57805036AD&salt=1648966390795&voice=4&format=mp3&appKey=30b3aa18e38ef10f&ttsVoiceStrict=false");
    audio.play();
    let shadowRoot1 = document.querySelector("#shadow-root-container").shadowRoot;
    console.log(shadowRoot1.querySelector("#laba"));
    shadowRoot1.querySelector("#laba").addEventListener("click", function (e) {
        e.stopPropagation();
        console.log(3344);
        let audio = new Audio("https://openapi.youdao.com/ttsapi?q=access&langType=en&sign=21EA0380AEF05C4C7CFECF57805036AD&salt=1648966390795&voice=4&format=mp3&appKey=30b3aa18e38ef10f&ttsVoiceStrict=false");
        audio.play();
    });
    // console.log(document.getElementById("laba"));
    // audioDom.onclick = e => {
    //     console.log(12333331111);
    // };
    // audioDom.addEventListener("click", function () {
    //     console.log(12333);

    // });
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
<iframe src="https://dict.youdao.com/w/Math"></iframe>
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
    `;

    let htmlDivElement = document.createElement("div");
    htmlDivElement.setAttribute("id", "popup-panel");
    htmlDivElement.setAttribute("class", "square-container");
    htmlDivElement.innerHTML = dom;
    htmlDivElement.style.left = (positionX + positionWidth) + "px";
    htmlDivElement.style.top = positionY + "px";
    let htmlDivElement1 = document.createElement("div");
    htmlDivElement1.setAttribute("id", "html-shadow");
    let shadowRoot = htmlDivElement1.attachShadow({mode: "open"});
    htmlDivElement.appendChild(htmlDivElement1);
    let htmlVideoElement = document.createElement("audio");
    htmlVideoElement.setAttribute("src", data.speakUrl);
    htmlVideoElement.setAttribute("id", "html-audio-id");
    htmlVideoElement.play();
    shadowRoot.appendChild(htmlVideoElement);

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
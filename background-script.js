console.log(123);
console.log(33);

function handleMessage(message, sender, sendResponse) {
    let tabId = sender.tab.id;
    browser.tabs.insertCSS(tabId, {
        file: "fake/index.css"
    });
}
//
browser.runtime.onMessage.addListener(handleMessage);
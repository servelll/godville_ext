// Add event handler
document.getElementById("b").addEventListener("click", function () {
    const data = {
        title: "zzzzz",
        url: window.location.href,
    }
    chrome.runtime.sendMessage(data, function (response) {
        console.log('response', response);
    });
});
chrome.runtime.sendMessage({ command: "load_log" }, function (response) {
    document.getElementById("popup_log").textContent = response;
    console.log('response', response);
});


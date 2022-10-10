//if (chrome) browser = chrome;

String.prototype.toHtmlEntities = function () {
    return this.replace(/./gm, function (s) {
        // return "&#" + s.charCodeAt(0) + ";";
        return (s.match(/[a-z0-9\s]+/i)) ? s : "&#" + s.charCodeAt(0) + ";";
    });
};
String.fromHtmlEntities = function (string) {
    return (string + "").replace(/&#\d+;/gm, function (s) {
        return String.fromCharCode(s.match(/\d+/gm)[0]);
    })
};
String.prototype.fromHtmlEntities = function () {
    return (this + "").replace(/&#\d+;/gm, function (s) {
        return String.fromCharCode(s.match(/\d+/gm)[0]);
    })
};

Array.prototype.equals = function (array) {
    return array instanceof Array && JSON.stringify(this) === JSON.stringify(array);
}

function loadScript(url) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState !== 4) {
            return;
        }
        if (request.status !== 200) {
            return;
        }
        eval(request.responseText);
    };
    request.open('GET', url);
    request.send();
}

//полигон
var d;
var pushes_percents_table = [];
let let_mas = ["A", "B", "C", "D"];

function GetPrevSubIndexs(index, subindex) {
    let prevsubindex_index, prevsubindex_subindex;
    if (index == 0) {
        prevsubindex_index = 0;
        prevsubindex_subindex = 0;
    }
    else if (subindex > 0) {
        prevsubindex_index = index;
        prevsubindex_subindex = subindex - 1;
    } else {
        prevsubindex_index = index - 1;
        prevsubindex_subindex = d[index - 1].length - 1;
    }
    return { index: prevsubindex_index, subindex: prevsubindex_subindex };
}

function GetPosAndXPFromD(currentSubStepDValue) {
    return Object.entries(currentSubStepDValue[2]).filter(([_, value]) => value > 0).map(([boss_letter, boss_xp]) => {
        const row = Array.from(currentSubStepDValue[1]).filter(j => j.includes(boss_letter) || j.some(k => k.includes(boss_letter)))[0];
        const try_y = row.indexOf(boss_letter);
        return [
            boss_letter,
            currentSubStepDValue[2][boss_letter],
            (try_y != -1) ? try_y : row.indexOf(row.filter(k => k.includes(boss_letter))[0]),
            currentSubStepDValue[1].indexOf(row)
        ];
    });
}

function fillPushesAtThisSubstep(index, subindex, submove_owner_letter) {
    pushes_percents_table[index][submove_owner_letter] = {};

    let prevsub = GetPrevSubIndexs(index, subindex);
    if (submove_owner_letter == undefined) {
        submove_owner_letter = alive_boss_letters[subindex];


        pushes_percents_table[index][submove_owner_letter].subindex = subindex;
    }

    //далее, итерация только по submove_owner_letter, subindex и d[subindex] не используем
}

/*
function manageErrors(response) {
    console.log(response);
    if (!response.ok) {
        if (response.status == 404) {
            return false;
        }
        throw Error(response.statusText);
    }
    return true;
}

function TestUrlExistAsyncWithNoCorsFetch(url) {
    return new Promise((resolve, reject) => {
        try {
            fetch(url)
                .then(() => resolve(true))
                .catch(e => {
                    console.log(e);
                    if (e.message.includes("404")) {
                        resolve(false);
                    }
                    reject(e);
                });
        } catch (e) {
            console.log("trycatch: " + e);
        }
    });
}

TestUrlExistAsyncWithNoCorsFetch("https://gv.erinome.net/duels/log/td4dqf");
TestUrlExistAsyncWithNoCorsFetch("https://gv.erinome.net/duels/log/pye686bsb");
TestUrlExistAsyncWithNoCorsFetch("https://developesdsdr.mozi");
*/
// function ifUrlExist(url, callback) {
//     let request = new XMLHttpRequest;
//     request.open('GET', url, true);
//     request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
//     request.setRequestHeader('Accept', '*/*');
//     request.onprogress = function (event) {
//         let status = event.target.status;
//         let statusFirstNumber = (status).toString()[0];
//         switch (statusFirstNumber) {
//             case '2':
//                 request.abort();
//                 return callback(true);
//             default:
//                 request.abort();
//                 return callback(false);
//         };
//     };
//     request.send('');
// };

function UrlExistsAsync(url) {
    return new Promise(resolve => {
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', url);
        xhr.onload = function () {
            resolve(xhr.status != 404);
        };
        xhr.send();
    });
}

function SetToStorage(key, propertyObj) {
    let a = {};
    a[key] = propertyObj;
    chrome.storage.local.set(a);
}

function AppendToArrayInStorage(key, value) {
    chrome.storage.local.get(key, obj => {
        if (obj[key] != undefined) {
            obj[key].push(value);
        } else {
            obj[key] = [];
        }
        SetToStorage(key, obj[key]);
    });
}

async function getPageFromUrl(url, init) {
    let cors = "https://cors-anywhere.herokuapp.com/";
    if (document.location.origin != new URL(url).origin) {
        if (!url.includes(cors)) url = cors + url;
        if (init == undefined) init = {};
        init.headers = { "X-Requested-With": "" };
        let cors_anywhere = true;
    }
    fetch(url, init).then(async (response) => {
        if (!response.ok) {
            if (response.status == 303) {
                return false;
            }
            throw Error(response.statusText);
        } else {
            const html_text = await response.text();
            if (html_text != "") {
                const parser = new DOMParser();
                const html = parser.parseFromString(html_text, "text/html");
                return html;
            } else throw new Error("blank page was loaded");
        }
    }).catch(e => {
        console.log("fetch error: " + e);
    });
}

async function AddErinomeLogsCheckingActions(wup, wup_title) {
    let a = wup_title.querySelector("#MyGV_ErinomeLogsCheckRows");
    if (a == null) {
        let dom_arr = (wup != undefined) ?
            wup.querySelectorAll(".wup-content > div > div > .wl_line > .wl_ftype > a") :
            wup_title.parentNode.querySelectorAll("tr td a");

        let checked_obj = await chrome.storage.local.get('ErinomeLogs_AlreadyChecked');
        if (checked_obj['ErinomeLogs_AlreadyChecked'] != undefined) {
            console.log(checked_obj);
            for (const i of Array.from(checked_obj['ErinomeLogs_AlreadyChecked'])) {

            }

            //delete old records
        }

        a = document.createElement("a");
        a.textContent = "[?]";
        a.title = "Всего элементов в этом popup'e; Клик -> старт проверки";
        a.id = "MyGV_ErinomeLogsCheckRows";
        a.title = "Проверить, загружены ли логи на https://gv.erinome.net/duels/log";
        let LogsCheckOrder = Promise.resolve(-1);

        let a_plus = document.createElement("a");
        a_plus.title = "Загруженных логов";
        a_plus.id = "MyGV_LoadedLogs";
        wup_title.appendChild(a_plus);

        let a_minus = document.createElement("a");
        a_minus.id = "MyGV_NotLoadedLogs";
        a_minus.title = "Не загруженных логов";
        wup_title.appendChild(a_minus);

        let a_unknown = document.createElement("a");
        a_unknown.id = "MyGV_UnknownLogs";
        a_unknown.title = "Не проверенных логов";
        wup_title.appendChild(a_unknown);

        a.onclick = () => {
            a.title = "Click to stop";
            a.textContent = `[${dom_arr.length}]`;
            for (const x of dom_arr) {
                let date = x.parentNode.parentNode.firstElementChild;
                //skip already executed
                if (!date.textContent.includes('[')) {
                    let gv_shortpath = x.href.replace("https://godville.net", "");
                    let id = gv_shortpath.replace("/duels/log/", "");
                    let link = "https://gv.erinome.net" + gv_shortpath;
                    LogsCheckOrder = LogsCheckOrder.then(async () => {
                        let b = await UrlExistsAsync(link);
                        date.textContent = `[${b ? "+" : "-"}] ${date.textContent}`;
                        AppendToArrayInStorage("MyGV_LoadedLogs", { date_str: date.textContent, id });
                    });
                }
            }
        }
        wup_title.appendChild(a);
    }
}
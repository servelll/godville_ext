if (chrome) browser = chrome;

function getLocalSelectorOfNode(node) {
    let str = node.nodeName;
    if (node.id) {
        str += "#" + node.id;
    } else if (node.classList && node.classList.length > 0) {
        str += "." + node.classList[0];
    }
    return str;
}
function getCSSPath(node) {
    if (!(node?.parentNode) || node.tagName == "HTML") return "";
    if (node.parentNode.tagName == "HTML") return node.localName;
    return getCSSPath(node.parentNode) + " > " + getLocalSelectorOfNode(node);
}

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

function getPageFromUrl(url, init) {
    return new Promise((resolve, reject) => {
        console.log("getPageFromUrl");
        fetch(url, init).then(response => {
            console.log(response);
            return response.text();
        }).then(html_text => {
            if (html_text != "") {
                const parser = new DOMParser();
                const html = parser.parseFromString(html_text, "text/html");
                resolve(html);
            } reject("blank page was loaded");
        }).catch(e => reject(e));
    });
}

function CorsGetPageFromUrl(url, init) {
    return new Promise(async (resolve, reject) => {
        console.log("CorsGetPageFromUrl");
        for (let i = 0; i < 2; i++) {
            let cors = "https://cors-anywhere.herokuapp.com/";
            if (document.location.origin != new URL(url).origin) {
                if (!url.includes(cors)) url = cors + url;
                if (init == undefined) init = {};
                init.headers = { "X-Requested-With": "" };
            }
            try {
                let test_html = await getPageFromUrl(url, init);
                console.log(test_html);
                let input = test_html.querySelector("input[name=accessRequest]");
                if (input != null && i < 1) {
                    await AskCorsPermission(input.value);
                } else {
                    resolve(test_html);
                }
            } catch (e) {
                console.log(e);
            }
        }
    });
}

function AskCorsPermission(access_id) {
    return new Promise((resolve, reject) => {
        console.log("AskCorsPermission");
        let access_url = "https://cors-anywhere.herokuapp.com/corsdemo?accessRequest=" + access_id;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', access_url);
        xhr.onload = function () {
            resolve(xhr.status != 404);
        };
        xhr.send();
    });
}

CorsGetPageFromUrl("https://cors-anywhere.herokuapp.com/" + "http://godb.gandjubas.de/sea_monsters.php", {
    headers: { "X-Requested-With": "" }
}).then(html => {
    console.log(html);
});

async function AddErinomeLogsCheckingActions(wup, wup_title) {
    console.log("AddErinomeLogsCheckingActions start");
    let a = wup_title.querySelector("#MyGV_ErinomeLogsCheckRows");
    if (a == null) {
        //console.log(wup);
        //console.log(wup.innerHTML);
        let dom_arr = (wup != undefined) ?
            Array.from(wup.querySelectorAll(".wup-content > div > div > .wl_line > .wl_ftype > a") ?? []) :
            Array.from(wup_title.parentNode.querySelectorAll("tr td a") ?? []);

        //initialization
        let checked_obj = await chrome.storage.local.get('ErinomeLogs_AlreadyChecked');
        let saved = (checked_obj['ErinomeLogs_AlreadyChecked'] ?? {}).saved;
        let saved_array = Array.from(saved ?? []);
        if (saved != undefined && saved_array.length > 0) {
            console.log("saved_array", saved_array);
            for (const i of saved_array) {

            }

            //delete old records > 3 month
        }
        let unsaved = (checked_obj['ErinomeLogs_AlreadyChecked'] ?? {}).unsaved;
        let unsaved_array = Array.from(unsaved ?? []);
        if (unsaved != undefined && unsaved_array.length > 0) {
            console.log("unsaved_array", unsaved_array);
            for (const i of unsaved_array) {

            }

            //delete old records > 1 week
        }

        let a_plus = document.createElement("z");
        a_plus.title = "Загруженных логов";
        a_plus.id = "MyGV_LoadedLogs";
        wup_title.appendChild(a_plus);

        let a_minus = document.createElement("z");
        a_minus.title = "Не загруженных логов";
        a_minus.id = "MyGV_NotLoadedLogs";
        wup_title.appendChild(a_minus);

        let a_unknown = document.createElement("z");
        a_unknown.title = "Не проверенных логов";
        a_unknown.id = "MyGV_UnknownLogs";
        wup_title.appendChild(a_unknown);

        wup_title.appendChild(document.createTextNode("/ TOTAL"));

        let a_total = document.createElement("z");
        a_total.title = "Всего логов";
        a_total.id = "MyGV_TotalLogs";
        wup_title.appendChild(a_total);

        if (wup == undefined) {
            a_plus.style.margin = "0 7px";
            a_minus.style.margin = "0 7px 0 0";
            a_unknown.style.margin = "0 7px 0 0";
            a_total.style.margin = "0 7px";
        }

        function UpdateText() {
            a_plus.textContent = saved_array.length;
            a_minus.textContent = unsaved_array.length;
            a_unknown.textContent = dom_arr.length - saved_array.length - unsaved_array.length;
            a_total.textContent = dom_arr.length;
        }
        UpdateText();

        a = document.createElement("z");
        a.textContent = "[?]";
        //a.title = "Всего элементов в этом popup'e; Клик -> старт проверки";
        a.id = "MyGV_ErinomeLogsCheckRows";
        a.title = "Проверить, загружены ли логи на https://gv.erinome.net/duels/log";
        a.onclick = async function () {
            a.title = "Click to stop";
            a.textContent = `[${dom_arr.length}]`;
            for (const x of dom_arr) {
                let date = x.parentNode.parentNode.firstElementChild;
                //skip already executed
                if (!date.textContent.includes('[')) {
                    if (start_flag) {
                        start_flag = false;
                        return;
                    }
                    let gv_shortpath = x.href.replace("https://godville.net", "");
                    let id = gv_shortpath.replace("/duels/log/", "");
                    let link = "https://gv.erinome.net" + gv_shortpath;
                    let b = await UrlExistsAsync(link);
                    date.textContent = `[${b ? "+" : "-"}] ${date.textContent}`;
                    AppendToArrayInStorage("MyGV_LoadedLogs", { date_str: date.textContent, id });
                }
            }
        }
        wup_title.appendChild(a);
    }
}

function fillMiniQuestsTitles(callback) {
    async function parseMiniQuestsTitles(link) {
        let html = await getPageFromUrl(link);
        let raw_data = html.querySelector("#post-body-1560386").textContent;
        let data = raw_data.slice(raw_data.indexOf('Старые мини-квесты') + 18).replace("\nНовые мини-квесты", ' * Metka * ').replace('\n', '').trim();
        let rawMass = data.split(' * ');
        let oldQuests = rawMass.slice(0, rawMass.indexOf('Metka'));
        let newQuests = rawMass.slice(rawMass.indexOf('Metka') + 1);
        return { oldQuests, newQuests: newQuests };
    }

    function fillMiniQuestsToStorage(miniQuests) {
        const regy = /([А-ЯЁ0-9][^\→]+)(?=(\→|$))/gi;
        const warning = '(в этом мини-квесте часто этапы меняются местами)';
        let AutoGV_miniQuests = {};
        for (let key in miniQuests) {
            console.log(miniQuests[key]);
            AutoGV_miniQuests[key] = {
                recency: (key == 'oldQuests') ? 'старый мини-квест' : 'новый мини-квест',
                quests: miniQuests[key].map(el => {
                    let quests = {};
                    if (el.includes(warning)) {
                        quests.warning = warning;
                    }
                    quests.blank = el.match(regy).map(item => item.trim());
                    return quests;
                }),
            }
        }
        browser.storage.local.set({ AutoGV_miniQuests });
        SetToStorage("AutoGV_miniQuests_lastDate", new Date().toLocaleString());
    }

    parseMiniQuestsTitles("https://godville.net/forums/show_topic/2460?page=254#post_1560386").then(mini_quests => {
        fillMiniQuestsToStorage(mini_quests);
        console.log('Filling mini quests to browser storage');
        callback();
    });
}

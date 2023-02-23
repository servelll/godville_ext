if (chrome) browser = chrome;

//PLS DEFINE ONLY FUNCTIONS TO ESCAPE intersect rewriting shared.js on unknown (superhero\logs) files
/*
if (new URL(document.URL).protocol == 'file:') {
    if (document.querySelector("#main_wrapper")) {
        //for superhero
    } else if (document.querySelector("#wrap")) 
        //for logs
    }
}
*/

function PERFORMANCE_PRINT(callback) {
    let time = performance.now();
    callback();
    time = performance.now() - time;
    console.log(`Время выполнения ${time.toFixed(1)}ms`);
}

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
    const request = new XMLHttpRequest();
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

class Polygon {
    d;
    pushes_percents_table = [];
    let_mas = ["A", "B", "C", "D"];

    GetPrevSubIndexs(index, subindex) {
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

    GetPosAndXPFromD(currentSubStepDValue) {
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

    fillPushesAtThisSubstep(index, subindex, submove_owner_letter) {
        pushes_percents_table[index][submove_owner_letter] = {};

        const prevsub = GetPrevSubIndexs(index, subindex);
        if (!submove_owner_letter) {
            submove_owner_letter = alive_boss_letters[subindex];


            pushes_percents_table[index][submove_owner_letter].subindex = subindex;
        }

        //далее, итерация только по submove_owner_letter, subindex и d[subindex] не используем
    }
}

async function MakingUniqueArrayInStorage(key, another_array) {
    const obj = await chrome.storage.local.get(key);
    if (!obj) return {};
    const dict = obj[key];
    let unique_array = Array.from(new Set(dict));
    if (key == 'MyGV_NotLoadedLogs' && another_array) {
        unique_array = unique_array.filter(m_id => !another_array.includes(m_id));
        unique_array = unique_array.filter(m_id => !m_id.includes("https://godville.net"));
    }

    SetToStorage(key, unique_array);
    return unique_array;
}

async function SetToStorage(key, value) {
    console.log("SetToStorage", key, value);
    const a = {};
    a[key] = value;
    await chrome.storage.local.set(a);
}

async function AppendToArrayInStorage(key, value) {
    console.log("AppendToArrayInStorage", key, value);
    const obj = (await chrome.storage.local.get(key)) ?? {};
    if (!obj[key]) {
        obj[key] = [];
        obj[key].push(value);
        console.log("Setted first item of dictionary:", key, "; value:", value);
    } else if (!obj[key].includes(value)) {
        console.log("Added to key:", key, "; value:", value);
        obj[key].push(value);
    }

    await SetToStorage(key, obj[key]);
}

async function RemoveFromArrayInStorage(key, value, multiple_values = false) {
    const obj = await chrome.storage.local.get(key);
    if (obj && obj[key]) {
        console.log("Removing all key-value pairs in dict, or trying, by key:", key, "; value:", value);
        if (multiple_values) {
            obj[key] = obj[key].filter(i => !value.includes(i));
        } else {
            obj[key] = obj[key].filter(i => i != value);
        }
        await SetToStorage(key, obj[key]);
    }
}

function AddAbstractChromeStorageListener(text, callback) {
    const bool_already_added = document.addedListenersList?.includes(text);
    console.log("AddAbstractChromeStorageListener inside", text, bool_already_added, document.addedListenersList);

    if (!bool_already_added) {
        console.log("Adding first time AbstractChromeStorageListener", text);
        if (!document.addedListenersList) document.addedListenersList = [];
        document.addedListenersList.push(text);
        chrome.storage.onChanged.addListener((changes, area) => {
            console.log(text + ": change in storage area: " + area, changes);
            for (const ch_key of Object.keys(changes)) {
                if (ch_key == "MyGV_NotLoadedLogs" || ch_key == "MyGV_LoadedLogs") {
                    const new_arr = Array.from(changes[ch_key].newValue ?? []);
                    const old_arr = Array.from(changes[ch_key].oldValue ?? []);
                    const add_arr = new_arr.filter(id => !old_arr.includes(id));
                    if (add_arr && add_arr.length > 0) {
                        callback(add_arr, new_arr, ch_key);
                    }
                }
            }
        });
    }
}

//https://tranquil-oasis-11167.herokuapp.com/"
//only https://corsproxy.io/
//working for https://gv.erinome.net/duels/log/x5rlfs, not forking for files
const cors_head_urls = [
    "https://tranquil-oasis-11167.herokuapp.com/",
    "https://corsproxy.io/?", //* request modes, but only without video];
];
async function UrlExistsAsync(url) {
    let another_loop = true, cors_i = cors_head_urls.values();
    while (another_loop) {
        let c = cors_i.next();
        console.log("while", c.value);
        if (c.done) break;
        another_loop = false;
        try {
            const fetch_url = (document.location.origin != new URL(url).origin) ? c.value + url : url;
            const response = await fetch(fetch_url, { method: "HEAD" });
            console.log(response);
            if (response.status == 500 || response.status == 404 || response.redirected) {
                return false;
            }
            if (response.ok && response.status == 200) {
                return true;
            }
            throw new Error('UrlExistsAsync response idk error'); //for future debug
        } catch (e) {
            another_loop = true;
            console.log("UrlExistsAsyncError", e);
        }
    }
}
function getPageFromUrl(url, init) {
    return new Promise((resolve, reject) => {
        console.log("getPageFromUrl");
        fetch(url, init).then(response => {
            console.log(response, response.headers);
            if (response.ok) return response.text();
        }).then(html_text => {
            if (html_text != "") {
                const parser = new DOMParser();
                const html = parser.parseFromString(html_text, "text/html");
                resolve(html);
            }
            reject("blank page was loaded");
        }).catch(e => reject(e));
    });
}
//https://allorigins.win/
//https://corsproxy.io/
const cors_urls = [
    "https://tranquil-oasis-11167.herokuapp.com/",
    "https://api.allorigins.win/get?url=", //only GET & json output!
    "https://corsproxy.io/?", //* request modes, but only without video
    //"https://justcors.com/ https://justcors.com/tl_5c69dec/" //need autorization
    //"https://cors-anywhere.herokuapp.com/corsdemo https://cors-anywhere.herokuapp.com/" //need autorization + requiered { headers: { 'x-requested-with': "" } }
];
function CorsGetPageFromUrl(url) {
    return new Promise(async (resolve, reject) => {
        console.log("CorsGetPageFromUrl start");
        if (document.location.origin != new URL(url).origin) {
            let another_loop = true, cors_i = cors_urls.values();
            while (another_loop) {
                let c = cors_i.next();
                console.log("while", c.value);
                if (c.done) break;
                another_loop = false;
                try {
                    let params;
                    if (c.value.includes(".herokuapp.com")) params = { headers: { "x-requested-with": "" } };
                    //encodeURIComponent(
                    await fetch(c.value + url, params)
                        .then(response => {
                            console.log(response);
                            if (response.ok) return c.value.includes("https://api.allorigins.win/") ? response.json() : response.text();
                            if (response.status >= 500 && response.status <= 526) {
                                another_loop = true;
                            }
                            throw new Error('Network response was not ok.');
                        })
                        .then(data => {
                            //console.log(data);
                            const parser = new DOMParser();
                            const html = parser.parseFromString(c.value.includes("https://api.allorigins.win/") ? data.contents : data, "text/html");
                            const cors = html.createElement('s');
                            cors.setAttribute('href', c.value);
                            html.head.append(cors);
                            resolve(html);
                        }).catch(e => {
                            another_loop = true;
                            console.log("promise catch", e);
                        });
                } catch (e) {
                    another_loop = true;
                    console.log(e);
                }
            }
        }
        else {
            getPageFromUrl(url).then(html => resolve(html));
        }
    });
}
//superhero.js && last_fight.js
async function AddErinomeLogsCheckingActions(wup, input_node) {
    console.log("AddErinomeLogsCheckingActions start");
    const dom_arr = () => wup ?
        Array.from(wup.querySelectorAll(".wup-content > div > div > .wl_line > .wl_ftype > a") ?? []) : //popup
        Array.from(input_node.parentNode.querySelectorAll("tr > td:nth-child(2) > a") ?? []);  //last_fight
    let dom_saved, dom_unsaved, saved_array, unsaved_array;

    //console.log(wup?.querySelector("#lf_popover_c").innerHTML);
    if (document.getElementById("my_logs_check_container") || input_node?.was_runned) {
        console.log("AddErinomeLogsCheckingActions return", input_node?.was_runned, input_node);
        return;
    }
    if (input_node) input_node.was_runned = true;

    const LogsCheck_container = document.createElement("div");
    LogsCheck_container.id = "my_logs_check_container";
    LogsCheck_container.className = "wl_line my_wl_line";

    const f_text = document.createElement("z");
    f_text.className = "row_header";
    f_text.textContent = "По строкам: ";
    LogsCheck_container.appendChild(f_text);

    const f_mytitle = document.createElement("span");
    f_mytitle.className = "tooltip";
    f_text.appendChild(f_mytitle);

    const z_plus = document.createElement("z");
    z_plus.title = "Загруженных логов";
    LogsCheck_container.appendChild(z_plus);

    const z_minus = document.createElement("z");
    z_minus.className = "pointer_link";
    z_minus.title = "Не загруженных логов\n~Нажмите, чтобы первые 1 [-] сверху на странице и в хранилище";
    z_minus.onclick = async () => {
        z1.started = z2.started = false;
        const a_to_del = dom_arr().filter(x => x.parentNode.parentNode.textContent.includes("[-]")).slice(0, 1);
        const id_to_del = a_to_del.map(x => x.href.replace("https://godville.net/duels/log/", ""));
        //console.log("a_to_del", a_to_del, "id_to_del", id_to_del);
        unsaved_array = await RemoveFromArrayInStorage('MyGV_NotLoadedLogs', id_to_del, true);
        dom_unsaved = (dom_unsaved ?? []).filter(s => !id_to_del.includes(s));
        await DrawUI(id_to_del);
    }
    LogsCheck_container.appendChild(z_minus);

    const z_unknown = document.createElement("z");
    z_unknown.className = "pointer_link";
    z_unknown.title = "Не проверенных логов\n~Нажмите, чтобы очистить от существующих в 'MyGV_LoadedLogs' элементов массива 'MyGV_NotLoadedLogs',\nот дублей 'MyGV_NotLoadedLogs'/'MyGV_LoadedLogs'";
    z_unknown.onclick = async () => {
        z1.started = z2.started = false;
        saved_array = await MakingUniqueArrayInStorage('MyGV_LoadedLogs');
        unsaved_array = await MakingUniqueArrayInStorage('MyGV_NotLoadedLogs', saved_array);
        UpdateText();
    }
    LogsCheck_container.appendChild(z_unknown);

    LogsCheck_container.appendChild(document.createTextNode("/"));

    const z_total = document.createElement("z");
    z_total.title = "Всего логов";
    LogsCheck_container.appendChild(z_total);

    function UpdateText() {
        z_plus.textContent = dom_saved.length + "[+]";
        z_minus.textContent = dom_unsaved.length + "[-]";
        const dom_arr_temp = dom_arr();
        z_total.textContent = dom_arr_temp.length;
        z_unknown.textContent = dom_arr_temp.length - dom_saved.length - dom_unsaved.length + "[?]";

        const types_count = {};
        dom_arr_temp.forEach(x => {
            const key = x.textContent;
            if (!(types_count[key])) types_count[key] = { saved: 0, unsaved: 0, unknown: 0, total: 0 };
            types_count[key].total++;
            if (x.parentNode.parentNode.textContent.includes("[+]")) types_count[key].saved++;
            else if (x.parentNode.parentNode.textContent.includes("[-]")) types_count[key].unsaved++;
            else types_count[key].unknown++;
        });
        console.log(types_count);

        const thead = '<thead><th>Тип</th><th>+</th><th>-</th><th>?</th><th>TOTAL</th></thead>';
        let tbody = "";
        Object.entries(types_count).forEach(entry => {
            const [key, value] = entry;
            tbody += `<tr><td>${key}</td><td>${value.saved}</td><td>${value.unsaved}</td><td>${value.unknown}</td><td>${value.total}</td></tr>`;
        });
        f_mytitle.innerHTML = `<table>${thead}${tbody}</table>`;
    }

    async function DrawUI(diff_id_arr, key) {
        let time = performance.now();
        if (diff_id_arr) {
            const filtered_arr = dom_arr().filter(a => diff_id_arr.includes(a.href.replace("https://godville.net/duels/log/", "")));
            filtered_arr.forEach(filtered => {
                const d_id = filtered.href.replace("https://godville.net/duels/log/", "");
                const date_td = filtered.parentNode.parentNode.firstElementChild;
                const bool = (key == 'MyGV_LoadedLogs') ? true : (key == 'MyGV_NotLoadedLogs') ? false : undefined;
                if (bool != undefined) {
                    const a = MarkRow(date_td, bool, "https://gv.erinome.net/duels/log/" + d_id);
                    if (bool) dom_saved.push(d_id); else dom_unsaved.push(d_id);
                } else {
                    const a = date_td.querySelector("a");
                    if (a) a.remove();
                }
            });
        } else {
            async function ActionsWithStoragedAbstract(propertyText) {
                //this taking some time ~300ms
                const checked_obj = (await chrome.storage.local.get(propertyText)) ?? {};
                const array = Array.from(checked_obj[propertyText] ?? []);
                return array;
            }
            //get Arrays 
            saved_array = await ActionsWithStoragedAbstract('MyGV_LoadedLogs');
            unsaved_array = await ActionsWithStoragedAbstract('MyGV_NotLoadedLogs');

            //Draw ALL [+]/[-]
            dom_saved = [], dom_unsaved = [];
            for (const x of dom_arr()) {
                const x_id = x.href.replace("https://godville.net/duels/log/", "");
                const bool = saved_array.includes(x_id);
                if (bool || unsaved_array.includes(x_id)) {
                    const date_td = x.parentNode.parentNode.firstElementChild;
                    MarkRow(date_td, bool, "https://gv.erinome.net/duels/log/" + x_id);
                    if (bool) dom_saved.push(x_id); else dom_unsaved.push(x_id);
                }
            }
        }
        UpdateText();
        time = performance.now() - time;
        console.log(`Время выполнения DrawUI(${diff_id_arr}, ${key}) = ${time.toFixed(1)}ms`);
    }
    await DrawUI();

    async function CheckLogsActions(z, UIArr) {
        z.processing = !z.processing;
        z.setTitleAndText();
        if (!z.processing) {
            return;
        } else {
            //a.textContent = `[${dom_arr.length}]`;
            for (const x of UIArr) {
                //stop actions
                if (!z.processing) {
                    z.setTitleAndText();

                    //clear yellow highlight
                    for (const row of dom_arr()) {
                        row.style.backgroundColor = '';
                        //if (tr.getAttribute("style") == "") tr.removeAttribute("style");
                    }
                    return;
                }

                //actual checking
                const tr = x.parentNode.parentNode;
                tr.style.backgroundColor = 'yellow';
                const id = x.href.replace("https://godville.net/duels/log/", "");
                const link = "https://gv.erinome.net/duels/log/" + id;
                const b = await UrlExistsAsync(link);
                AppendToArrayInStorage(b ? "MyGV_LoadedLogs" : "MyGV_NotLoadedLogs", id);
                if (b) {
                    RemoveFromArrayInStorage("MyGV_NotLoadedLogs", id);
                    dom_saved = (dom_saved ?? []).filter(i => i !== id);
                } else {
                    unsaved_array = (unsaved_array ?? []).filter(i => i !== id);
                }
                const date_obj = tr.firstElementChild;
                MarkRow(date_obj, b, link);
                UpdateText();
                tr.style.backgroundColor = '';
            }
            //if (!z.title.includes("перепроверяем")) z.remove(); 
            z.processing = false;
            z.textContent = z.title.includes("перепроверяем") ? "[>>]" : "[>]";
        }
    }
    const flexbreak = document.createElement("z");
    flexbreak.className = "flex_break";
    LogsCheck_container.appendChild(flexbreak);

    const z1 = document.createElement("z");
    z1.className = "pointer_link";
    z1.setTitleAndText = function () {
        this.title = this.processing ?
            "Нажмите для остановки проверки" :
            "Проверить, загружены ли логи на https://gv.erinome.net/duels/log (игнорировать [-]/[+])";
        this.textContent = this.processing ? "[||]" : "[>]";
    }
    z1.setTitleAndText();
    //skip ALL already executed
    z1.onclick = () => CheckLogsActions(z1, dom_arr().filter(x => {
        const tr = x.parentNode.parentNode;
        return !tr.firstElementChild.textContent.includes('['); //исключаем [+] и [-]
    }));
    LogsCheck_container.appendChild(z1);

    const z2 = document.createElement("z");
    z2.className = "pointer_link";
    z2.setTitleAndText = function () {
        this.title = this.processing ?
            "Нажмите для остановки проверки" :
            "Проверить, загружены ли логи на https://gv.erinome.net/duels/log (перепроверяем все [-], игнорируем [+])";
        this.textContent = this.processing ? "[||]" : "[>>]";
    }
    z2.setTitleAndText();
    z2.onclick = () => CheckLogsActions(z2, dom_arr().filter(x => {
        const tr = x.parentNode.parentNode;
        return !tr.firstElementChild.textContent.includes('[+]'); //исключаем только [+]
    }));
    LogsCheck_container.appendChild(z2);

    if (wup) input_node.prepend(LogsCheck_container); else input_node.after(LogsCheck_container);

    //listener
    AddAbstractChromeStorageListener("Duels_history", (add_arr, new_arr, ch_key) => {
        //console.log(ch_key, add_arr);
        DrawUI(add_arr, ch_key);
        if (ch_key == 'MyGV_LoadedLogs') {
            saved_array = new_arr;
        } else {
            unsaved_array = new_arr;
        }
    });
}
//superhero.js && options.js
function fillMiniQuestsTitles(callback) {
    async function parseMiniQuestsTitles(link) {
        const html = await getPageFromUrl(link);
        const raw_data = html.querySelector("#post-body-1560386").textContent;
        const data = raw_data.slice(raw_data.indexOf('Старые мини-квесты') + 18).replace("\nНовые мини-квесты", ' * Metka * ').replace('\n', '').trim();
        const rawMass = data.split(' * ');
        const oldQuests = rawMass.slice(0, rawMass.indexOf('Metka'));
        const newQuests = rawMass.slice(rawMass.indexOf('Metka') + 1);
        return { oldQuests, newQuests: newQuests };
    }

    function fillMiniQuestsToStorage(miniQuests) {
        const regy = /([А-ЯЁ0-9][^\→]+)(?=(\→|$))/gi;
        const warning = '(в этом мини-квесте часто этапы меняются местами)';
        const AutoGV_miniQuests = {};
        for (const key in miniQuests) {
            AutoGV_miniQuests[key] = {
                recency: (key == 'oldQuests') ?
                    'старый мини-квест (после битвы с боссами в старых миниках – покрасневший герой не идет в город на полный цикл)' :
                    'новый мини-квест (Если выйти с босса или банды нового миника на красном или дохлым – гарантирован полный цикл)',
                quests: miniQuests[key].map(el => {
                    const quest = {};
                    if (el.includes(warning)) {
                        quest.warning = warning;
                    }
                    quest.blank = el.match(regy).map(item => item.trim());
                    return quest;
                }),
            }
        }
        browser.storage.local.set({ AutoGV_miniQuests });
        SetToStorage("AutoGV_miniQuests_last", new Date().toLocaleString());
    }

    parseMiniQuestsTitles("https://godville.net/forums/show_topic/2460?page=254#post_1560386").then(mini_quests => {
        fillMiniQuestsToStorage(mini_quests);
        console.log('Setting mini quests, to browser storage');
        callback();
    });
}

//shared && superhero.js && logs.js
function MarkRow(row_obj, url_exist, link) {
    //console.log("MarkRow", row_obj, url_exist);
    const new_text = `[${url_exist ? '+' : '-'}]`;
    let a = row_obj.querySelector("a.pointer_link");
    if (!a) {
        a = CreateLogLinkCheckingButtonObject(link);
        a.style.textDecoration = "none";
        row_obj.prepend(a, " ");
    } else {
        a.style.backgroundColor = a.style.backgroundColor ? "" : "aqua";
        a.title = "Появились новые данные";
    }
    a.textContent = new_text;
    //a.textContent = `${a.textContent.slice(0, -1)}->${new_text.slice(1)}`;
    if (a.textContent == "[+]") {
        a.onclick = (e) => {
            e.preventDefault();
            window.open(link, '_blank');
        }
        a.title = "";
    }
    return a;
}
//superhero.js && logs.js
function GetJSCoords(obj) {
    const Row = Array.from(obj.parentNode.parentNode.childNodes).indexOf(obj.parentNode);
    const Col = Array.from(obj.parentNode.childNodes).indexOf(obj);
    const ret = { Row, Col };
    //console.log(obj, obj.parentNode, ret);
    return ret;
}
function GetNearObjs(obj, arr) {
    const tc = (obj?.Col || obj?.Row) ? obj : GetJSCoords(obj);
    const ret_objs = {};
    //console.log(arr.innerHTML, tc);
    if (tc.Row > 0) ret_objs.north = arr.childNodes[tc.Row - 1].childNodes[tc.Col];
    if (tc.Row < arr.childNodes.length - 1) ret_objs.south = arr.childNodes[tc.Row + 1].childNodes[tc.Col];
    if (tc.Col > 0) ret_objs.west = arr.childNodes[tc.Row].childNodes[tc.Col - 1];
    if (tc.Col < arr.childNodes[0].childNodes.length - 1) ret_objs.east = arr.childNodes[tc.Row].childNodes[tc.Col + 1];
    //console.log(ret_objs);
    return ret_objs;
}
function CreateLogLinkCheckingButtonObject(id) {
    const a = document.createElement("a");
    a.className = "pointer_link";
    a.textContent = "[?]";
    a.title = "~Нажмите, чтобы проверить существование лога на gv.erinome.net/";
    const link = id.includes("/duels/log/") ? id : "https://gv.erinome.net/duels/log/" + id;
    a.setAttribute("href", link);
    a.onclick = async (e) => {
        e.preventDefault();
        const b = await UrlExistsAsync(link);
        a.textContent = b ? "[+]" : "[-]";
        a.style.backgroundColor = a.style.backgroundColor ? "" : "pink";
        AppendToArrayInStorage(b ? "MyGV_LoadedLogs" : "MyGV_NotLoadedLogs", id);
        if (b) {
            RemoveFromArrayInStorage("MyGV_NotLoadedLogs", id);
            a.onclick = null;
            a.title = "";
        }
    }
    return a;
}
function EditAByChromeStorageData(a, id) {
    //return
    chrome.storage.local.get("MyGV_LoadedLogs").then(obj => {
        if (obj && obj["MyGV_LoadedLogs"] && obj["MyGV_LoadedLogs"].includes(id)) {
            a.textContent = "[+]";
            a.removeAttribute("title");
            a.onclick = (e) => {
                e.preventDefault();
                window.open(a.href, '_blank');
            }
            return a;
        }
        chrome.storage.local.get("MyGV_NotLoadedLogs").then(obj2 => {
            if (obj2 && obj2["MyGV_NotLoadedLogs"] && obj2["MyGV_NotLoadedLogs"].includes(id)) {
                a.textContent = "[-]";
            }
        });
    });
}

function AddMovesCountVisibleTools(dmap_selector, title_selector) {
    const dmap = document.querySelector(dmap_selector);
    if (dmap) {
        const but = document.createElement("z");
        but.className = "my_blockh_elem";
        function SetZTexts(bool) {
            if (bool) {
                but.textContent = "/⌚";
                but.title = "Выйти из режима подсчета";
            } else {
                but.textContent = "⌚";
                dmap.style.setProperty("--move-visibility", "hidden");
                but.title = "Перевести карту в режим подсчета (ходов)";
            }
        }
        SetZTexts(false);

        function UpdateVisualSteps() {
            dmap.style.setProperty("--move-visibility", "visible");
            dmap.style.setProperty("--startIndex", 0);
            const map_arr = Array.from(dmap.querySelectorAll(".dmc"));
            const heroes = map_arr.find(i => i.textContent == "@");
            let temp_objs = [heroes];
            for (let i = 0; i < 20; i++) {
                if (temp_objs.length == 0) break;
                const iterated_cells = temp_objs;
                temp_objs = [];
                iterated_cells.forEach(check_obj => {
                    const int = parseInt(check_obj.style.getPropertyValue("--move"));
                    //no reason to chech NaN
                    if (i < int || isNaN(int)) {
                        check_obj.style.setProperty("--move", i);
                        //console.log(check_obj, dmap, GetNearObjs(check_obj, dmap));
                        const objs = Object.values(GetNearObjs(check_obj, dmap)).filter(obj => !obj.classList.contains("dmw"));
                        objs.forEach(obj => {
                            if (!temp_objs.includes(obj)) temp_objs.push(obj);
                        });
                    }
                });
            }
            //alert(Object.entries({ dim, heroes, obj_coord }));
        }
        but.onclick = () => {
            const bool = but.textContent == "⌚";
            if (bool) {
                UpdateVisualSteps();
            } else {
                document.getElementById("slider")?.dispatchEvent(new Event("change"));
            }
            SetZTexts(bool);
        }
        const container = document.createElement("span");
        container.className = "my_blockh_elem_container";
        container.appendChild(but);
        document.querySelector(title_selector).appendChild(container);
    }
}
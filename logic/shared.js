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

async function RemoveFromArrayInStorage(key, value) {
    let obj = await chrome.storage.local.get(key);
    if (obj && obj[key]) {
        console.log("Removing all key-value pairs in dict, or trying, by key:", key, "; value:", value);
        obj[key] = obj[key].filter(i => i != value);
        await SetToStorage(key, obj[key]);
    }
}

//only https://corsproxy.io/
//working for https://gv.erinome.net/duels/log/x5rlfs, not forking for files
function UrlExistsAsync(url) {
    return new Promise((resolve, reject) => {
        let fetch_url = (document.location.origin != new URL(url).origin) ? "https://corsproxy.io/?" + url : url;
        fetch(fetch_url, { method: "HEAD" })
            .then(response => {
                console.log(response);
                if (response.status == 500 || response.status == 404 || response.redirected) {
                    resolve(false);
                    return;
                }
                if (response.ok && response.status == 200) {
                    resolve(true);
                    return;
                }
                throw new Error('UrlExistsAsync response idk error'); //for future debug
            });
    });
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
//supehero.js && last_fight.js
async function AddErinomeLogsCheckingActions(wup, after_node) {

    function MarkRow(row_obj, url_exist, link) {
        //console.log("MarkRow", row_obj, url_exist);
        let new_text = `[${url_exist ? '+' : '-'}]`;
        let a = row_obj.querySelector("a");
        if (!a) {
            a = document.createElement("a");
            a.setAttribute("href", link);
            a.style.textDecoration = "none";
            a.onclick = (e) => {
                window.open(link, '_blank');
                e.preventDefault();
            }
            a.textContent = new_text;
            row_obj.prepend(a, " ");
        } else if (new_text != a.textContent) {
            a.textContent = "[+/-]";
        } else {
            a.textContent = new_text;
        }
        return a;
    }

    console.log("AddErinomeLogsCheckingActions start");
    const dom_arr = () => wup ?
        Array.from(wup.querySelectorAll(".wup-content > div > div > .wl_line > .wl_ftype > a") ?? []) : //popup
        Array.from(after_node.parentNode.querySelectorAll("tr > td:nth-child(2) > a") ?? []);  //last_fight
    let dom_saved, dom_unsaved, saved_array, unsaved_array;

    let LogsCheck_container = document.createElement("div");
    LogsCheck_container.className = "wl_line";
    LogsCheck_container.style.display = "flex";
    LogsCheck_container.style.minWidth = "280px";
    LogsCheck_container.style.justifyContent = "center";
    LogsCheck_container.style.gap = "10px";
    LogsCheck_container.style.flexWrap = "wrap";

    LogsCheck_container.append("По строкам: ")

    let z_plus = document.createElement("z");
    z_plus.title = "Загруженных логов";
    LogsCheck_container.appendChild(z_plus);

    let z_minus = document.createElement("z");
    z_minus.title = "Не загруженных логов";
    LogsCheck_container.appendChild(z_minus);

    const z_unknown = document.createElement("z");
    z_unknown.style.color = "#199BDC";
    z_unknown.style.cursor = "pointer";
    z_unknown.title = "Не проверенных логов\nНажмите, чтобы очистить от существующих в 'MyGV_LoadedLogs' элементов массива 'MyGV_NotLoadedLogs',\nот дублей 'MyGV_NotLoadedLogs'/'MyGV_LoadedLogs'";
    z_unknown.onclick = async () => {
        z1.started = false;
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
        const dom_arr_buffer = dom_arr();
        z_total.textContent = dom_arr_buffer.length;
        z_unknown.textContent = dom_arr_buffer.length - dom_saved.length - dom_unsaved.length + "[?]";
    }

    async function DrawUI(diff_id_arr, key) {
        var time = performance.now();
        if (diff_id_arr && key) {
            for (d_id of diff_id_arr) {
                let filtered = dom_arr().find(a => a.href.includes(d_id));
                if (filtered) {
                    let date_td = filtered.parentNode.parentNode.firstElementChild;
                    let bool = key == 'MyGV_LoadedLogs';
                    let a = MarkRow(date_td, bool, "https://gv.erinome.net/duels/log/" + d_id);
                    a.style.backgroundColor = "Aqua";
                    a.title = "Появились новые данные";
                    if (bool) dom_saved.push(d_id); else dom_unsaved.push(d_id);
                }
            }
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
                let gv_shortpath = x.href.replace("https://godville.net", "");
                let x_id = gv_shortpath.replace("/duels/log/", "");
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
        z.setTitle();
        if (!z.processing) {
            return;
        } else {
            z.textContent = "[||]";
            //a.textContent = `[${dom_arr.length}]`;
            for (const x of UIArr) {
                if (!z.processing) {
                    return;
                }
                let tr = x.parentNode.parentNode;
                tr.style.backgroundColor = 'yellow';
                let date_obj = tr.firstElementChild;
                let gv_shortpath = x.href.replace("https://godville.net", "");
                let id = gv_shortpath.replace("/duels/log/", "");
                let link = "https://gv.erinome.net" + gv_shortpath;
                const b = await UrlExistsAsync(link);
                AppendToArrayInStorage(b ? "MyGV_LoadedLogs" : "MyGV_NotLoadedLogs", id);
                if (b) {
                    RemoveFromArrayInStorage("MyGV_NotLoadedLogs", id);
                    dom_saved = dom_saved.filter(i => i !== id);
                } else {
                    unsaved_array = unsaved_array.filter(i => i !== id);
                }
                MarkRow(date_obj, b, link);
                UpdateText();
                tr.style.backgroundColor = '';
            }
            if (!z.title.includes("перепроверять")) z.remove();
            z.processing = false;
            z.textContent = z.title.includes("перепроверять") ? "[>>]" : "[>]";
        }
    }

    const z1 = document.createElement("z");
    z1.setAttribute("style", z_unknown.getAttribute("style"));
    z1.textContent = "[>]";
    z1.setTitle = function () {
        this.title = this.processing ?
            "Нажмите для остановки проверки" :
            "Проверить, загружены ли логи на https://gv.erinome.net/duels/log (игнорировать [-]/[+])";
    }
    z1.setTitle();
    //skip ALL already executed
    z1.onclick = () => CheckLogsActions(z1, dom_arr().filter(x => {
        const tr = x.parentNode.parentNode;
        return !tr.firstElementChild.textContent.includes('['); //исключаем [+] и [-]
    }));
    LogsCheck_container.appendChild(z1);

    const z2 = document.createElement("z");
    z2.textContent = "[>>]";
    z2.setAttribute("style", z_unknown.getAttribute("style"));
    z2.setTitle = function () {
        this.title = this.processing ?
            "Нажмите для остановки проверки" :
            "Проверить, загружены ли логи на https://gv.erinome.net/duels/log (перепроверяем все [-], игнорируем [+])";
    }
    z2.setTitle();
    z2.onclick = () => CheckLogsActions(z2, dom_arr().filter(x => {
        const tr = x.parentNode.parentNode;
        return !tr.firstElementChild.textContent.includes('[+]'); //исключаем только [+]
    }));
    LogsCheck_container.appendChild(z2);

    after_node.after(LogsCheck_container);

    //listener
    chrome.storage.onChanged.addListener((changes, area) => {
        console.log("Change in storage area: " + area, changes);
        for (let ch_key of Object.keys(changes)) {
            if (ch_key == "MyGV_NotLoadedLogs" || ch_key == "MyGV_LoadedLogs") {
                let new_arr = Array.from(changes[ch_key].newValue);
                let old_arr = Array.from(changes[ch_key].oldValue);
                let add_arr = new_arr.filter(id => !old_arr.includes(id));
                if (add_arr && add_arr.length > 0) {
                    //console.log(ch_key, add_arr);
                    DrawUI(add_arr, ch_key);
                    if (ch_key == 'MyGV_LoadedLogs') {
                        saved_array = changes[ch_key].newValue;
                    } else {
                        unsaved_array = changes[ch_key].newValue;
                    }
                }
            }
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
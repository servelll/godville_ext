if (chrome) browser = chrome;

function Print(s) {
	const _status = document.getElementById("status");
	_status.textContent = s;
	_status.style.display = "";
	setTimeout(() => {
		let opacity = 1,
			animate = setInterval(function () {
				opacity -= 0.05;
				_status.style.opacity = opacity;
				if (opacity <= 0.05) {
					clearInterval(animate);
				}
			}, 100);
	}, 1000);
}

function SetDebugElementsStyle(debug) {
	console.log("SetDebugElementsStyle", debug);
	const str = debug ? "" : "none";
	for (const e of document.getElementsByClassName("debug")) {
		e.style.display = str;
	}
}

function saveOptions(e) {
	e.preventDefault();

	const options = {};
	for (const obj of document.getElementsByClassName('savable')) {
		if (obj.tagName == "INPUT" && obj.type == "checkbox") {
			options[obj.id] = obj.checked;
		} else if (obj.tagName == "INPUT" || obj.tagName == "TEXTAREA") {
			options[obj.id] = obj.value;
		} else if (obj.tagName == "SELECT") {
			const selected = obj.selectedIndex;
			if (selected) options[obj.id] = obj.childNodes[selected];
		} else {
			options[obj.id] = obj.textContent;
		}
	}
	/*
	const object = {
		options: {
			debug: document.getElementById("debug").checked,
			pluses: document.getElementById("pluses").checked ? document.getElementById("plusesSelect").value : false,
			MyTestString: document.getElementById("MyTestString").value
		}
	};
	*/
	SetToStorage("options", options);

	const d = new Date();
	Print(`Успешно сохранено: ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`);
}

function LoadIfExist(e) {
	if (e && e.type == "Event") e.preventDefault();
	//Load if options Exist
	browser.storage.local.get('options', object => {
		console.log("inside await");
		if (!browser.runtime.error) {
			if (Object.entries(object).length === 0 && object.constructor === Object) {
				console.log("blank storage, empty object");
				Print("Пустое хранилище, невозможно загрузить");
			} else {
				console.log("load => ", object);
				for (const i in object.options) {
					//splitted for 1). pluses: 'Random' 2). pluses: false
					const i_block = document.getElementById(i);
					const value = object.options[i];
					console.log(i, i_block);
					if (!i_block) {
						console.log(i, " not exist");
					} else if (i_block.tagName == "INPUT" && i_block.type == "checkbox") {
						i_block.checked = value;
						if (i_block.id == "debug") {
							SetDebugElementsStyle(value);
							document.getElementById("options_str").value = JSON.stringify(object.options, null, 1);
						}
						//init() visibility of childrens
						if (i_block.classList.contains("hidingSmthngCheckbox")) SetChildrenElementsVisibility(i_block);
					} else if (i_block.tagName == "INPUT" && i_block.tagName == "TEXTAREA") {
						i_block.value = value;
					} else if (i_block.tagName == "SELECT") {
						const new_index = Array.from(i_block.options).findIndex(o => o.value == value);
						i_block.selectedIndex = new_index;
					} else {
						i_block.textContent = value;
					}
				}
			}
		}
	});
}

//init()
LoadIfExist();

//add listeners to checkboxes
function SetChildrenElementsVisibility(e) {
	if (e.type == "Event") e.preventDefault();
	const node = (e instanceof Event) ? e.target : e;
	//!!!searching all nodes with id same with node`s
	const Objs_to_set = document.querySelectorAll(`[id^="${node.id}_"]`);
	console.log("SetChildrenElementsVisibility", node);
	//console.log(Array.from(Objs_to_set).map(i => i.id).join(", "));
	for (const o of Objs_to_set) {
		if (o == node) continue;//not same object
		o.style.display = (node.checked) ? "" : "none";
	}
}
for (const j of document.getElementsByClassName('hidingSmthngCheckbox')) {
	j.addEventListener('change', event => SetChildrenElementsVisibility(event));
}

for (const form of document.querySelectorAll("form")) {
	//form.addEventListener("submit", event => saveOptions(event));
}

//options
document.getElementById("save").addEventListener("click", e => saveOptions(e));
document.getElementById("load").addEventListener("click", LoadIfExist);
document.getElementById("clearStorage").addEventListener("click", e => {
	e.preventDefault();
	console.log("clearing all Storage data");

	browser.storage.local.clear(function () {
		const error = browser.runtime.lastError;
		if (error) {
			console.error(error);
		}
	});
});
document.getElementById("Print").addEventListener("click", e => {
	e.preventDefault();
	browser.storage.local.get('options', function (object) {
		if (!browser.runtime.error) {
			console.log("obj = ", object);
			document.getElementById("options_str").value = JSON.stringify(object['options'], null, 1);
		} else {
			console.log(browser.runtime.error);
		}
	});
});
document.getElementById("debug").addEventListener('change', e => {
	e.preventDefault();
	SetDebugElementsStyle(event.target.checked);
});

function UpdateFieldChildObject(line_obj) {
	let line = line_obj;
	while (!line.classList.contains("new_line")) {
		line = line.parentNode;
	}
	const key = line.id;
	const key_last = key + "_last";
	const field_childobj = line.querySelector(".title_print") ??
		line.querySelector(".field_content label, .field_content_extented label") ??
		line.querySelector(".field_content, .field_content_extented").firstElementChild;

	chrome.storage.local.get(key_last, obj => {
		const text = (Object.keys(obj).length === 0) ? 'undefined' : obj[key_last];
		if (field_childobj.nodeName == "INPUT") {
			field_childobj.value = text;
		} else {
			field_childobj.textContent = text;
		}
	});

	chrome.storage.local.get(key, obj2 => {
		if (Object.keys(obj2).length === 0) {
			field_childobj.title = 'undefined';
		} else if (obj2[key].constructor.name === "Object") {
			if (key == "AutoGV_miniQuests") {
				const a = [];
				Object.values(obj2[key]).forEach(q => {
					a.push(...q?.quests.map(quests_obj => quests_obj?.blank.join('→')));
				});
				field_childobj.title = "Всего записей миниквестов(объект): " + a.length + "\n" + a;
			} else {
				const b = Object.keys(obj2[key]);
				field_childobj.title = "Всего ключей/значений объекта: " + b.length + "\n" + b;
			}
		}
		else field_childobj.title = "Всего записей массива: " + obj2[key].length + "\n" + obj2[key];
	});
}

for (const label of document.getElementsByClassName("correct_link")) {
	//caption label-click actions
	label.addEventListener("click", e => {
		e.preventDefault();
		window.open(e.target.title, '_blank');
	});

	const caption = label.parentNode;
	//initial actions - setting title of right label (caption)
	UpdateFieldChildObject(caption.querySelector(".update"));
}

for (const button of document.getElementsByClassName("clear")) {
	const line = button.parentNode.parentNode;
	const key = line.id;
	button.addEventListener("click", e => {
		e.preventDefault();
		SetToStorage(key + "_last", new Date().toLocaleString());
		SetToStorage(key, []);
		UpdateFieldChildObject(button);
	});
}

//update buttons click() actions
document.querySelector("#terrain .update").addEventListener('click', e => {
	e.preventDefault();
	const time = performance.now();
	const label = e.target.parentNode.querySelector(".correct_link");
	getPageFromUrl(label.title).then(html => {
		const rawText = html.querySelector("#post-body-698233 > ol").textContent;
		const clearedArray = rawText.split("\n\t").filter(i => i != "").map(i => i.replaceAll("\n", "").replaceAll("*", "").replaceAll(/\(.+\)/g, "").trim());
		if (e.target.title) e.target.title += "\n";
		e.target.title += `direct request (${(performance.now() - time).toFixed(1)}ms)`;
		SetToStorage("terrain_last", new Date().toLocaleString());
		SetToStorage("terrain", clearedArray);
		UpdateFieldChildObject(e.target);
	})
});
document.querySelector("#seaMonsters .update").addEventListener('click', e => {
	e.preventDefault();
	const time = performance.now();
	const label = e.target.parentNode.querySelector(".correct_link");
	CorsGetPageFromUrl(label.title).then(html => {
		console.log(html);
		const rawText = html.querySelector("body > ol").textContent;
		const clearedArray = rawText.split("\n").filter(i => i != "").map(i => i.replace(/\(.+\)/g, "").trim());
		console.log(clearedArray);
		if (e.target.title) e.target.title += "\n";
		e.target.title += `loaded with CORS-proxy (${(performance.now() - time).toFixed(1)}ms) ${html.querySelector("s").getAttribute("href")}`;
		SetToStorage("seaMonsters_last", new Date().toLocaleString());
		SetToStorage("seaMonsters", clearedArray);
		UpdateFieldChildObject(e.target);
	}).catch(et => {
		e.target.parentNode.parentNode.querySelector(".field_content label").textContent = new Date().toLocaleString() + " " + et;
	});
});
document.querySelector("#AutoGV_miniQuests .update").addEventListener('click', e => {
	e.preventDefault();
	const time = performance.now();
	fillMiniQuestsTitles(() => {
		UpdateFieldChildObject(e.target);
		if (!e.target.title) e.target.title += "\n";
		e.target.title += `loaded with CORS-proxy (${(performance.now() - time).toFixed(1)}ms)`;
	});
});

//init() titles
for (const item of document.getElementsByClassName("title_print")) {
	UpdateFieldChildObject(item);
}

//chrome.storage debug things
for (const button of document.getElementsByClassName("append")) {
	const line = button.parentNode.parentNode;
	const key = line.id;
	button.addEventListener('click', async (e) => {
		e.preventDefault();
		const value = line.querySelector(".field_content input").value;
		await AppendToArrayInStorage(key, value);
		UpdateFieldChildObject(button);
	});
}
for (const button of document.getElementsByClassName("delete")) {
	const line = button.parentNode.parentNode;
	const key = line.id;
	button.addEventListener('click', async (e) => {
		e.preventDefault();
		const value = line.querySelector(".field_content input").value;
		await RemoveFromArrayInStorage(key, value);
		UpdateFieldChildObject(button);
	});
}


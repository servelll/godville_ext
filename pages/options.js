if (chrome) browser = chrome;

function Print(s) {
	let _status = document.getElementById("status");
	_status.textContent = s;
	_status.style.display = "";
	setTimeout(() => {
		var opacity = 1,
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
	let str = debug ? "" : "none";
	for (const e of document.getElementsByClassName("debug")) {
		e.style.display = str;
	}
}

function SetDisplaying(node, bool) {
	node.style.display = (bool) ? "" : "none";
}

function SetSelectStyle(e) {
	let node = (e instanceof Event) ? e.target : e;
	//!!!searching all nodes with id same with node`s
	let Objs_to_set = document.querySelectorAll(`[id^="${node.id}"]`);
	console.log("SetSelectStyle", node);
	//console.log(Array.from(Objs_to_set).map(i => i.id).join(", "));
	for (let o of Objs_to_set) {
		if (o == node) continue;//not same object
		SetDisplaying(o, node.checked);
	}
	if (e.type == "Event") e.preventDefault();
}

function saveOptions(e) {
	let object = {
		options: {
			debug: document.getElementById("debug").checked,
			pluses: document.getElementById("pluses").checked ? document.getElementById("plusesSelect").value : false,
			MyTestString: document.getElementById("MyTestString").value
		}
	};

	console.log("save => ", object);
	browser.storage.local.set(object);

	let d = new Date();
	Print(`Успешно сохранено: ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`);

	e.preventDefault();
}

function LoadIfExist(e) {
	//Load if options Exist
	browser.storage.local.get('options', function (object) {
		if (!browser.runtime.error) {
			if (Object.entries(object).length === 0 && object.constructor === Object) {
				console.log("blank storage, empty object");
				Print("Пустое хранилище, невозможно загрузить");
			} else {
				console.log("load => ", object);
				for (let i in object.options) {
					//splitted for 1). pluses: 'Random' 2). pluses: false 
					let i_block = document.getElementById(i);
					let value = object.options[i];
					console.log(i, i_block);
					if (!i_block) continue;
					if (i_block.tagName == "INPUT") {
						if (i_block.type == "checkBox") {
							i_block.checked = value;
							if (i_block.id == "debug") {
								SetButtonsStyle(value);
							}
						} else {
							i_block.value = value;
						}
					} else if (i_block.tagName == "SELECT") {
						console.log(value);
						i_block.value = (value != false) ? value : "Random";
						let chkbx = document.getElementById(i_block.id + "CheckBox");
						chkbx.checked = (value != false);
						SetSelectStyle(chkbx);
					}
				}
			}
		}
	});
	if (e && e.type == "Event") e.preventDefault();
}

LoadIfExist();
SetDebugElementsStyle();

//add listeners to checkboxes
let checkBoxes = document.getElementsByClassName('hidingSmthngCheckbox');
for (let j of checkBoxes) {
	j.addEventListener('change', event => SetSelectStyle(event));
	//SetSelectStyle(j);
}

for (let form of document.querySelectorAll("form")) {
	//form.addEventListener("submit", event => saveOptions(event));
}

//buttons
document.getElementById("save").addEventListener("click", e => saveOptions(e));
document.getElementById("load").addEventListener("click", LoadIfExist);
document.getElementById("clearOptions").addEventListener("click", e => {
	console.log("Clear");

	browser.storage.local.clear(function () {
		var error = browser.runtime.lastError;
		if (error) {
			console.error(error);
		}
	});
	e.preventDefault();
});
document.getElementById("Print").addEventListener("click", e => {
	browser.storage.local.get('options', function (object) {
		if (!browser.runtime.error) {
			console.log("obj = ", object);
			document.getElementById("options").value = JSON.stringify(object);
		} else {
			console.log(browser.runtime.error);
		}
	});
	e.preventDefault();
});
document.getElementById("debug").addEventListener('change', event => {
	SetDebugElementsStyle(event.target.checked);
	event.preventDefault();
});

function UpdateFieldLabel(button) {
	let line = button.parentNode.parentNode;
	let key = line.id;
	let key_date = key + "_lastDate";
	let field_label = line.querySelector(".field_content label");

	chrome.storage.local.get(key_date, obj => {
		field_label.textContent = (Object.keys(obj).length === 0) ? 'undefined' : obj[key_date];
	});

	chrome.storage.local.get(key, obj2 => {
		if (key == "AutoGV_miniQuests" && Object.keys(obj2).length !== 0) {
			let a = [];
			for (let q of Object.values(obj2[key])) {
				a.push(...q?.quests.map(quests_obj => quests_obj?.blank.join('→')));
			}
			field_label.title = "Всего записей: " + a.length + "\n" + a;
		}
		else field_label.title = (Object.keys(obj2).length === 0) ? 'undefined' : "Всего записей: " + obj2[key].length + "\n" + obj2[key];
	});
}

for (const label of document.getElementsByClassName("correct_link")) {
	//caption label-click actions
	label.addEventListener("click", e => {
		window.open(e.target.title, '_blank');
		e.preventDefault();
	});

	let caption = label.parentNode;
	//initial actions - setting title of right label (caption)
	UpdateFieldLabel(caption.querySelector(".update"));
}

for (const button of document.getElementsByClassName("clear")) {
	let line = button.parentNode.parentNode;
	let key = line.id;
	button.addEventListener("click", e => {
		SetToStorage(key + "_lastDate", new Date().toLocaleString());
		SetToStorage(key, []);
		UpdateFieldLabel(button);
		e.preventDefault();
	});
}

//update buttons click() actions
document.querySelector("#terrain .update").addEventListener('click', e => {
	let time = performance.now();
	let label = e.target.parentNode.querySelector(".correct_link");
	getPageFromUrl(label.title).then(html => {
		let rawText = html.querySelector("#post-body-698233 > ol").textContent;
		let clearedArray = rawText.split("\n\t").filter(i => i != "").map(i => i.replaceAll("\n", "").replaceAll("*", "").replaceAll(/\(.+\)/g, "").trim());
		if (e.target.title) e.target.title += "\n";
		e.target.title += `direct request (${(performance.now() - time).toFixed(1)}ms)`;
		SetToStorage("terrain_lastDate", new Date().toLocaleString());
		SetToStorage("terrain", clearedArray);
		UpdateFieldLabel(e.target);
	})
	e.preventDefault();
});
document.querySelector("#seaMonsters .update").addEventListener('click', e => {
	let time = performance.now();
	let label = e.target.parentNode.querySelector(".correct_link");
	CorsGetPageFromUrl(label.title).then(html => {
		console.log(html);
		let rawText = html.querySelector("body > ol").textContent;
		let clearedArray = rawText.split("\n").filter(i => i != "").map(i => i.replace(/\(.+\)/g, "").trim());
		console.log(clearedArray);
		if (e.target.title) e.target.title += "\n";
		e.target.title += `loaded with CORS-proxy (${(performance.now() - time).toFixed(1)}ms) ${html.querySelector("s").getAttribute("href")}`;
		SetToStorage("seaMonsters_lastDate", new Date().toLocaleString());
		SetToStorage("seaMonsters", clearedArray);
		UpdateFieldLabel(e.target);
	}).catch(et => {
		e.target.parentNode.parentNode.querySelector(".field_content label").textContent = new Date().toLocaleString() + " " + et;
	});
	e.preventDefault();
});
document.querySelector("#AutoGV_miniQuests .update").addEventListener('click', e => {
	let time = performance.now();
	fillMiniQuestsTitles(() => {
		UpdateFieldLabel(e.target);
		if (!e.target.title) e.target.title += "\n";
		e.target.title += `loaded with CORS-proxy (${(performance.now() - time).toFixed(1)}ms)`;
	});
	e.preventDefault();
});

for (let button of document.getElementsByClassName("append")) {
	UpdateFieldLabel(button); //for initial

	let line = button.parentNode.parentNode;
	let key = line.id;
	button.addEventListener('click', async (e) => {
		await AppendToArrayInStorage(key, "y1dxtz2");
		UpdateFieldLabel(button);
		e.preventDefault();
	});
}
for (let button of document.getElementsByClassName("delete")) {
	let line = button.parentNode.parentNode;
	let key = line.id;
	button.addEventListener('click', async (e) => {
		await RemoveFromArrayInStorage(key, "y1dxtz2");
		UpdateFieldLabel(button);
		e.preventDefault();
	});
}
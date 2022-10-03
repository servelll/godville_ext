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
	if (bool) {
		node.style.display = "";
	} else {
		node.style.display = "none";
	}
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
					if (i_block == undefined) continue;
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
	if (e != undefined && e.type == "Event") e.preventDefault();
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
document.getElementById("save").addEventListener("click", (e) => saveOptions(e));
document.getElementById("load").addEventListener("click", LoadIfExist);
document.getElementById("clearOptions").addEventListener("click", (e) => {
	console.log("Clear");

	browser.storage.local.clear(function () {
		var error = browser.runtime.lastError;
		if (error) {
			console.error(error);
		}
	});
	e.preventDefault();
});
document.getElementById("Print").addEventListener("click", (e) => {
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

document.getElementById("Updade_DB_of_mini_quests").addEventListener("click", event => {
	fillMiniQuestsTitles();
	let d = new Date();
	Print(`База данных обновлена: ${d.toLocaleString()}`);
	event.preventDefault();
});

/*

				<div class="new_line">
					<table class="field_content">
						<tr>
							<th></th>
							<th>газета</th>
							<th>поле</th>
							<th>дуэли</th>
						</tr>
						<tr>
							<td></td>
							<td><input type="checkBox" id=""></td>
						</tr>
						<tr>
							<td></td>
							<td><input type="checkBox" id=""></td>
						</tr>
					</table>
				</div>
*/
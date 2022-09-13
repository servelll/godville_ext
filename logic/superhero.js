function AddLaboratoryPopupObserver() {
	let target = document.querySelector('body');
	let config = {
		childList: true
	};
	let callback = function (mutationsList, observer) {
		let wups = document.querySelectorAll(".wup");
		for (const wup of wups) {
			let wup_title = wup.querySelector(".wup-title");
			if (wup_title != null && wup_title.textContent.includes("Лаборатория")) {
				wup_title.style.display = "flex";
				wup_title.style.justifyContent = "space-between";
				wup.querySelector(".wup-content").removeAttribute("style");

				let a = wup_title.querySelector("#MyGV_CalcLink");
				if (a == null) {
					a = document.createElement("a");
					a.textContent = "Ссылка на калькулятор";
					a.id = "MyGV_CalcLink";
					a.title = "Полный рассчет на http://godb.gandjubas.de/";
					a.onclick = (e) => {
						let txt = Array.from(wup.querySelectorAll(".wup-content > div .bps_line")).reduce((acc, curr) => {
							return acc + curr.querySelector(".bps_capt").textContent + "+" + curr.querySelector(".bps_val").textContent.replaceAll(" ", "+") + "%0D%0A";
						}, "");
						window.open("http://godb.gandjubas.de/golem/index.php?txt=" + txt, '_blank');
					}
					wup_title.appendChild(a);
				}
				for (const x of wup.querySelectorAll(".wup-content > div .bps_line .div_link_nu")) {
					x.addEventListener('click', function (e) {
						alert("test");
					});
				}

			}
		}
	}
	let observer = new MutationObserver(callback);
	observer.observe(target, config);

	console.log("AddLaboratoryPopupObserver done");
}

function AddGodVoicesPopupObserver() {
	//кнопка удаления лишних гласов
	let target = document.querySelector('body');
	let config = {
		childList: true
	};
	let callback = function (mutationsList, observer) {
		let title_chronique = document.querySelector("#m_fight_log > div.block_h > h2");
		let diary = document.querySelector("#diary > div.block_h > h2");
		const researches_roots = ["изобр", "крафт", "склей", "собир", "собери", "слепи", "соедини", "сделай"];
		const directions_roots = ["север", "юг", "запад", "восток", "вниз", "спуск", "вверх", "наверх", "лестниц", "подним"];
		const global_par_table = [
			{ dict: {}, pre: "[x", post: "🛠]", id: "MyGV_craft_del", title: "Удалить все крафтовые гласы" },
			{ dict: {}, pre: "[x", post: "↗]", id: "MyGV_directions_del", title: "Удалить все гласы направлений (включая лестничные)" },
			{ dict: {}, pre: "[", post: "]", id: "MyGV_del", title: "Очистить все гласы" }
		];

		function UpdateObjText(par_entity) {
			let obj = document.getElementById(par_entity.id);
			//console.log("UpdateObjText", par_entity, obj);
			if (obj != null) {
				obj.className = (Object.keys(par_entity.dict).length == 0) ? "" : "div_link_nu";
				obj.textContent = par_entity.pre + Object.keys(par_entity.dict).length + par_entity.post;
			}
		}
		function reFillDictionariesAndUpdateNumbers() {
			//console.log("reFillDictionariesAndUpdateNumbers", document.querySelectorAll("#gv_popover_c .wl_line:not([style*='display: none'])"));
			for (const entity of global_par_table) {
				entity.dict = {};
			}
			for (let i of document.querySelectorAll("#gv_popover_c .wl_line:not([style*='display: none'])")) {
				const t = i.querySelector(".lv_text > a").textContent;
				if (researches_roots.some(root => t.match(new RegExp(root, "gi")))) {
					global_par_table[0].dict[t] = i.querySelector('.wl_stats');
				}
				if (directions_roots.some(root => t.match(new RegExp(root, "gi")))) {
					global_par_table[1].dict[t] = i.querySelector('.wl_stats');
				}
				global_par_table[2].dict[t] = i.querySelector('.wl_stats');
			}
		}
		reFillDictionariesAndUpdateNumbers();

		let godvoices_panel = document.getElementById("gv_popover_c");
		if (godvoices_panel != null) {
			const a = godvoices_panel.parentNode.parentNode;
			function Create_DeleteDiv(_entity) {
				let obj = document.getElementById(_entity.id);
				if (obj == null) {
					obj = document.createElement("div");
					obj.id = _entity.id;
					obj.title = _entity.title;
					obj.style.display = "";
					obj.onclick = function () {
						for (const k in _entity.dict) {
							console.log("Удаляем ", k);
							_entity.dict[k].click();
						}
						console.log(_entity.title + " / onclick");
						reFillDictionariesAndUpdateNumbers();
						for (const entity of global_par_table) {
							UpdateObjText(entity);
						}
					};
					a.insertBefore(obj, a.getElementsByTagName("h3")[0]);
				}
				UpdateObjText(_entity);
				return obj;
			}

			let el = document.getElementById("MyGV_craft_del");
			if (title_chronique == null && diary != null) {
				Create_DeleteDiv(global_par_table[0]);
			} else {
				if (el != null) el.style.display = "none";
			}

			let el1 = document.getElementById("MyGV_directions_del");
			if (title_chronique != null && title_chronique.textContent.includes("подземелья")) {
				Create_DeleteDiv(global_par_table[1]);
			} else {
				if (el1 != null) el1.style.display = "none";
			}

			Create_DeleteDiv(global_par_table[2]);

			for (const x of godvoices_panel.querySelectorAll("div.wl_line > div.wl_stats.div_link_nu")) {
				x.addEventListener("click", function () {
					reFillDictionariesAndUpdateNumbers();
					for (const entity of global_par_table) {
						UpdateObjText(entity);
					}
				});
			}
		}
	};
	let observer = new MutationObserver(callback);
	observer.observe(target, config);

	console.log("AddGodVoicesPopupObserver done");
}

function AddChroniqueStepObserver() {
	let title_chronique = document.querySelector("#m_fight_log > div.block_h > h2");
	let div = document.getElementById("MyGV_ToNextHint");
	if (div == null) {
		div = document.createElement("div");
		div.id = "MyGV_ToNextHint";
		div.style.display = "inline";
		title_chronique.nextSibling.insertBefore(div, title_chronique.nextSibling.firstChild);
	}

	let config = {
		childList: true,
		characterData: true
	};
	let callback = function (mutationsList, observer) {
		//TODO исключить моря
		//console.log("ChroniqueStep callback");
		var re = /\d+/g;
		let move_number = re.exec(title_chronique.firstChild.textContent)[0];
		div.textContent = move_number;
		//TODO

		if (title_chronique.firstChild.textContent.includes("подземелья")) {
			AddOrUpdateAquariumLinks();
			//TODO молилка, исключить 100+ праны, подзем Мольбы, праноконденсатор, учитывая распаковку (по астропрогнозу)

			//TODO урон ловушки, исключить влияния\чудеса не в Бессилии

			let exitObj = document.querySelector("[title='Выход из подземелья']");
			//TODO цвет выхода
			//if (Number(move_number) <= 20) exitObj.style.backgroundColor = "#ff4422";
		}

		if (title_chronique.firstChild.textContent.includes("боя")) {

			//TODO молитва на влияния\чудеса\гласы, исключить 100+ праны, праноконденсатор, учитывая распаковку (по астропрогнозу)
		}
	};
	callback();

	let observer = new MutationObserver(callback);
	observer.observe(title_chronique, config);

	console.log("AddChroniqueStepObserver done");
}


function AddPolygonStepObserver() {
	let polygon_chronuque = document.querySelector("#a_central_block div.block_h h2");
	let div = document.getElementById("MyGV_PolygonTimeBeforeEndHint");
	if (div == null) {
		div = document.createElement("div");
		div.id = "MyGV_PolygonTimeBeforeEndHint";
		div.title = "осталось секунд до конца полигона";
		div.style.display = "inline";
		polygon_chronuque.nextSibling.appendChild(div);
	}

	let config = {
		childList: true,
		characterData: true
	};
	let callback = function (mutationsList, observer) {
		console.log("AddPolygonStepObserver callback");
		//let substep_in_perc = document.querySelector("#turn_pbar .p_val");
		let re = /\d+/g;
		let step = Number(re.exec(polygon_chronuque.firstChild.textContent)[0]);
		let seconds_left = (41 - step) * 20;
		let timerId = setTimeout(function tick() {
			div.textContent = seconds_left--;
			timerId = setTimeout(tick, 1000);
		}, 1000);
		//observer.disconnect();
	};

	let observer = new MutationObserver(callback);
	observer.observe(polygon_chronuque.firstChild, config);
	callback();

	//add boss letters as titles
	let title_letters = "BCDABC";
	let z = document.querySelectorAll(".opp_n:not(.opp_ng)");
	let ind = Array.from(z).findIndex(x => x.firstElementChild.textContent.includes("@"));

	let Objmas = document.getElementsByClassName("st_div");
	for (let index = 0; index < 3; index++) {
		Objmas[index].textContent = title_letters[index + ind];
	}

	console.log("AddPolygonStepObserver done");
}

function GetJSCoords(obj) {
	console.log(obj, obj.parentNode);
	let Col = Array.from(obj.parentNode.childNodes).indexOf(obj);
	let Row = Array.from(obj.parentNode.parentNode.childNodes).indexOf(obj.parentNode);
	return [Col, Row];
}
//TODO add ONLY FIRST level
//TODO check buffered level
function AddOrUpdateAquariumLinks() {
	let m = document.querySelector("#map > div.block_content > div");
	let map = m.childNodes[1];

	let exitObj = document.querySelector("[title*='Выход из подземелья']") || document.querySelector("[title*='Команда героев']");
	if (exitObj == null || document.querySelector("[title*='Тайная комната'") != null || m.childNodes[0].textContent.includes("2Э")) {
		console.log("AddOrUpdateAquariumLinks return");
		return;
	}
	let exitCoord = GetJSCoords(exitObj);
	let exitRowsNear = [-1, 0, 1].map(i => Array.from(map.childNodes)[exitCoord[1] + i]);
	let exitCellsNear_H = exitRowsNear.map(r => [-1, 0, 1].map(j => Array.from(r.childNodes)[exitCoord[0] + j]));

	let north_south_NearExit = [0, 2].filter(i => exitCellsNear_H[i].every(cell => cell.className.includes("dmw")));
	let west_east_NearExit = [0, 2].filter(i => exitCellsNear_H.every(r => r[i].className.includes("dmw")));
	console.log(north_south_NearExit, west_east_NearExit);
	if (north_south_NearExit.length > 0 || west_east_NearExit.length > 0) {
		console.log("AddOrUpdateAquariumLinks return exitNotNearWall");
		return;
	}

	let a = document.getElementById("MyGV_AquaLink");
	if (a == null) {
		a = document.createElement("a");
		a.id = "MyGV_AquaLink";
		a.textContent = "Карта аквариума";
		a.title = "С сайта digdog.web.app на основе статистики";
		m.appendChild(a);
	}

	let borders_mas = [
		Array.from(map.firstElementChild.childNodes),
		Array.from(map.lastElementChild.childNodes),
		Array.from(map.childNodes).map(e => e.firstElementChild),
		Array.from(map.childNodes).map(e => e.lastElementChild)
	];
	console.log("borders_mas", borders_mas);

	let indexes = 0;
	//in corners
	if (north_south_NearExit.length > 0 && west_east_NearExit.length > 0) {

	} else if (north_south_NearExit.length > 0 || west_east_NearExit.length > 0) {
		//near wall
		if (north_south_NearExit.length > 0) {
			let borders_index = north_south_NearExit / 2;
		}
		if (west_east_NearExit.length > 0) {
			let borders_index = 2 + west_east_NearExit / 2;
		}
	}

	let chosenPoints = [borders_mas[0], borders_mas[1]].reduce((acc, e) => {

		//acc.push([e[0], e[]]);
	}, []);

	console.log("chosenPoints", chosenPoints);
	//TODO переписать!
	let points_mas = chosenPoints.map(e => {
		console.log(e);
		let coords = GetJSCoords(e);
		let type = 0;
		if (e.className.includes("dmw")) return null;
		return `${coords[1] - exitCoord[1] + 17},${coords[0] - exitCoord[0] + 17}-` + type;
	}).filter(a => a != null);

	let link = "!https://digdog.web.app/?points=" + points_mas.join(";");
	a.href = link;
	a.onclick = (e) => {
		window.open(link, '_blank');
		e.preventDefault();
	}

	console.log("AddOrUpdateAquariumLinks done");
}

function DecideDungeonType() {

}

//test
/*
function TestObserver(id) {
	let target = document.querySelector("#diary > div.block_h > h2");
	const config = {
		childList: true,	
		characterData: true
	};
	const callback = function (mutationsList, observer) {
		console.log("callback " + id, observer);
	};
	
	const observer = new MutationObserver(callback);
	observer.observe(target.firstChild, config);
	console.log(`TestObserver ${id}done`);
}
TestObserver(1);
TestObserver(2);
*/

function getMaxHp(godName) {
	return new Promise((resolve, reject) => {
		//throw API
		let url = `https://godville.net/gods/api/${godName}.json`;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'json';
		xhr.onload = function () {
			var status = xhr.status;
			if (status === 200) {
				resolve(xhr.response.max_health);
			} else {
				reject(status, xhr.response);
			}
		};
		xhr.send();
	});
}

let last_dungeon = {};
let mutatable_boss_abilities_history = "";

//TODO для логов
function AddHolemSearch() {
	let boss_name = document.querySelector("#o_hk_name > .l_val").textContent;
	//TODO проверить на зовущем
	let boss_abilities = document.querySelector('#o_info > .block_content > .line:not([id]) > .l_val').textContent;
	if (boss_abilities.split(", ").length == 3) {
		//ссылка на поиск голема для трехабила
		let boss_hp = /\d+$/g.exec(document.querySelector("#o_hl1 > .l_val").textContent)[0];
		let hero_hp = /\d+$/g.exec(document.querySelector("#hk_health > .l_val").textContent)[0];

		let params = new URLSearchParams({ "str": boss_name, "b": boss_hp, "h1": hero_hp });
		let i = 2;
		Array.from(document.querySelectorAll("#alls > .block_content .line.oppl")).forEach(z => {
			let text = z.querySelector(".opp_h > span").textContent;
			let allies_hp = text == "повержен" ? getMaxHp(z.querySelector(".opp_ng > span").textContent.slice(1, -1)).then() : /\d+$/g.exec(text)[0];
			params.append(`h${i++}`, allies_hp);
		});
		if (boss_abilities.includes("мутирующий")) {
			//TODO из лога
			if (mutatable_boss_abilities_history.includes("мощный")) {
				if (boss_abilities.includes("мощный")) {
					params.append("mpwf", "on");
				} else {
					params.append("mnpwf", "on");
				}
			} else {
				if (boss_abilities.includes("мощный")) params.append("pwf", "on");
			}
		}

		//TODO Бесшумность pwf=on с проверкой из кэша
		let link = "http://godb.gandjubas.de/golems/golems.php?" + params.toString();

		let a = document.createElement("a");
		a.textContent = "Ссылка на поиск голема";
		a.href = link;
		let where = document.querySelector("#o_info > .block_content");
		where.insertBefore(a, where.lastElementChild);

	}

	console.log("AddHolemSearch done");
}

//TODO ????
function DecideToAddAuraStringObserver() {
	let second_target = Array.from(document.querySelectorAll("#stats > div.block_content > .line:not([id])")).find(a => a.firstElementChild.textContent == "Аура");
	if (second_target != undefined) AddAuraSecondsObserver(second_target.lastElementChild);
	else {
		let target = document.querySelector("#stats > div.block_content");
		let config = {
			childList: true
		};
		let callback = function (mutationsList, observer) {
			//mutationsList
		};
		//let observer = new MutationObserver(callback);
		//observer.observe(target, config);
	}
	console.log("DecideToAddAuraStringObserver done");
}

//TODO test
function AddAuraSecondsObserver(target) {
	let config = {
		subtree: true,
		characterData: true
	};
	let callback = function (mutationsList, observer) {
		console.log(new Date().getSeconds(), observer.target.lastChild.textContent);

		let i = 60;
		setTimeout(function run() {
			if (i > 0) {
				i--;
				console.log(i);
				observer.target.lastElementChild.lastChild.textContent += i;
				setTimeout(run, 1000);
			}
		}, 1000);
	};

	let observer = new MutationObserver(callback);
	observer.observe(target, config);

	console.log("AddAuraSecondsObserver done");
}

//TODO параметр для разных режимов
function AddMyGVCountsBlock() {
	let div = document.getElementById("MyGV_Field_Counts");
	if (div == null) {
		div = document.createElement("div");
		div.id = "MyGV_Field_Counts";
		div.className = "block";
		div.innerHTML = `<div class="block_h">
							<span class="l_slot"> 
								<span class="b_handle m_hover" style="display: none;" title="Переместить блок">●</span> 
							</span>
							<h2 class="block_title">Подсчёты [MyGV]</h2>
							<span class="r_slot">
								<span class="h_min m_hover" style="display: none;">↑</span>
							</span>
						</div>
						<div class="block_content"></div>`;

		//TODO load last_place
		document.getElementById("a_right_block")?.appendChild(div);
	}

	let div_duel = document.getElementById("MyGV_Duel_Counts");
	if (div_duel == null) {
		div_duel = div.cloneNode(true);
		div_duel.id = "MyGV_Duel_Counts";
		document.getElementById("right_block")?.appendChild(div_duel);
	}

	console.log("AddMyGVCountsBlock done");
}

//TODO параметр + 1
function AddInventoryListener() {
	let target = document.querySelector("#inv_block_content > ul");
	let config = {
		childList: true
	};
	let callback = function (mutationsList, observer) {
		//замена ареналина
		let index = Array.from(target.childNodes).findIndex(a => a.textContent.includes("ареналин"));
		if (index > 0) {
			console.log("ареналин");
			let time = new Date();
			if (time.getUTCMinutes() < 3) {
				console.log("Клик на", target.childNodes[index]);
				//target.childNodes[index].onclick();
			}
		}

		//TODO прокликивания бесплатных активашек
	};
	let observer = new MutationObserver(callback);
	observer.observe(target, config);

	callback();
	console.log("AddInventoryListener done");
}

function AddFieldNewsListener() {
	let target = document.querySelector("#news > div.block_content");
	let config = {
		attributes: true,
		childList: true,
		subtree: true
	};
	let callback = function (mutationsList, observer) {
		console.log("AddFieldNewsListener callback", observer);
		/*
		let IsMonsterHided = document.querySelector("#news_pb > div.line.npb").style.display == "none";
		if (IsMonsterHided) {
			let bar = document.querySelector("#news_pb > div.p_bar.n_pbar > div");
			bar.
		}
		*/
	};

	let observer = new MutationObserver(callback);
	observer.observe(target, config);
	callback();
	console.log("AddFieldNewsListener done");
}

function AddFieldTaskObserver() {
	let task = document.querySelector("#hk_quests_completed .p_bar div");
	let config = {
		attributes: true
	};
	let callback = function (mutationsList, observer) {
		let taskWithPerc = task.style.getPropertyValue('width') ?? "0%";
		let taskValue = Number(taskWithPerc.slice(0, -1));
		let obj = document.querySelector("#news_pb .p_bar.n_pbar .p_val");
		if (obj != null) {
			if (taskWithPerc == "0%") {
				obj.style.setProperty('--Width', "1%");
				obj.style.setProperty('--Left', "0%");
			} else {
				obj.style.setProperty('--Width', "2%");
				obj.style.setProperty('--Left', Math.max(0, taskValue - 1.3) + "%");
			}

			if (taskWithPerc == "100%") {
				obj.style.setProperty('--Visibility', "hidden");
			}
		}

		//console.log("FieldTaskObserver callback", taskValue);
	};
	let observer = new MutationObserver(callback);
	observer.observe(task, config);

	callback();
	console.log("AddFieldTaskObserver done");
}

function AddFieldHeaderObserver() {
	let target = document.querySelector("#news > div.block_h > h2");
	let config = {
		childList: true//,
		//characterData: true, //required subtree: true
		//subtree: true
	};
	let callback = function (mutationsList, observer) {
		let val = target.textContent.includes("из города") ? "hidden" : "visible";
		/*
		if (mutationsList != null) {
			for (let mutation of mutationsList) {
				console.log(mutation);
				if (mutation.type === 'characterData') {
					console.log('Mutation Detected: Character data has been altered.');
				}
			}
		}
		*/
		let obj = document.querySelector("#news_pb .p_bar.n_pbar .p_val");
		if (obj != null) {
			obj.style.setProperty('--Visibility', val);
		}
		console.log("FieldHeaderObserver callback", target, val, document.querySelector("#news > div.block_h > h2"));
	};
	let observer = new MutationObserver(callback);
	observer.observe(target, config);

	callback();
	console.log("AddFieldHeaderObserver done");
}


///TODO parameter
function AddMonsterInvitingListener() {
	let target = document.querySelector('#news > div.block_content > [aria-live="polite"]> .line');
	let config = {
		attributes: true
	};
	let callback = function (mutationsList, observer) {
		console.log("MonsterListener callback", observer);
		//TODO Восставший \\не с кровати
		let Monster = document.querySelector("#news div.l_val > span").textContent;
		if (Monster == "") {
			//document.getElementById("monster_invite_submit").onclick();
		}
	};

	let observer = new MutationObserver(callback);
	observer.observe(target, config);
	callback();
	console.log("AddMonsterListener done");
}

function waitForContents(callback) {
	function ObserverCallback(mutations, observer) {
		//if (document.getElementById('hero_block')) {
		if (document.getElementById('stats') || document.getElementById('m_info') || document.getElementById('b_info')) {
			observer.disconnect();
			callback();
		}
	}
	ObserverCallback();
	console.log("obserse");
	let observer = new MutationObserver(ObserverCallback);
	observer.observe(document.body, { childList: true, subtree: true });
}

//debug for detect partial loading\changings between duels
let ids = { 'stats': true, 'm_info': true, 'b_info': true, 'diary': true, 'm_fight_log': true };
function tempCallback(mutations, observer) {
	let str = [];
	for (const [k, v] of Object.entries(ids)) {
		let obj = document.getElementById(k);
		let _v = (obj == null);
		if (_v != v) {
			str.push(k + "->" + obj);
			ids[k] = _v;
		}
	}
	if (str.length > 0) {
		str.unshift(new Date().toLocaleString());
		chrome.runtime.sendMessage({ command: "print_popup", text: str.join("\n") });
		//alert(str.join("\n"));
	}
}
let tempobserver = new MutationObserver(tempCallback);
tempobserver.observe(document.getElementById('hero_block'), { childList: true, subtree: true });

//TODO! листенер ожидания реальной прогрузки документа 
//(потому что обычный addeventlisner('load' и аналоги иногда багано выдают неполную страницу)

//console.log("documentBeforeWait", document.body.outerHTML);
//console.log(document.getElementById('stats'), document.getElementById('m_info'), document.getElementById('b_info'));
waitForContents(() => {
	//console.log("document", document.body.outerHTML);
	//console.log(document.getElementById('stats'), document.getElementById('m_info'), document.getElementById('b_info'));
	AddMyGVCountsBlock();
	AddLaboratoryPopupObserver();
	AddGodVoicesPopupObserver();
	let title_chronique = document.querySelector("#m_fight_log div.block_h > h2");
	if (title_chronique != null) {
		AddChroniqueStepObserver();
		if (title_chronique.textContent.includes("боя")) {
			AddHolemSearch();
		}
	}
	let polygon_title = document.querySelector("#a_central_block div.block_h > h2");
	if (polygon_title != null && polygon_title.textContent.includes("Полигон")) {
		AddPolygonStepObserver();
	}
	let diary = document.querySelector("#diary div.block_h > h2");
	if (diary != null) {
		DecideToAddAuraStringObserver();
		AddInventoryListener();
		//AddFieldNewsListener();
		//AddMonsterInvitingListener();
		AddFieldHeaderObserver();
		AddFieldTaskObserver();
	}
});

chrome.storage.onChanged.addListener(items => {
	console.log(items);
});

let godpower = document.querySelector("#cntrl > div.pbar.line > div.gp_val.l_val");
let polygon = document.querySelector("#r_map > div.block_h > h2");

let diary = document.querySelector("#diary > div.block_h > h2");
if (diary != null) {
	//определение торговли

	//газета - проклик "проверить" -> "заполнить" или "ой все" на бинго
	let time = new Date();
	if (time.getUTCHours() == 21 && time.getUTCMinutes() < 2) {
		//запросом
	}

	//TODO плюсики
	var pluses = document.querySelectorAll(".vote_links_b");
	for (let i of pluses) {
		// точно минус -> "эстафеты" отдельно
		// крафтовые класы новичков "Скрести"
		let pos = Math.round(Math.random());
		//let plusminus = i.children[pos];
		//plusminus.click();
	}
}
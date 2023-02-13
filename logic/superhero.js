function AddAbstactPopupObserver(name, title_text, inside_observer_callback) {
	const target = document.querySelector('body');
	const config = {
		childList: true
	};
	const callback = function (mutationsList, observer) {
		const wups = document.querySelectorAll(".wup");
		for (const wup of wups) {
			const wup_title = wup.querySelector(".wup-title");
			if (wup_title && wup_title.textContent.includes(title_text)) {
				console.log(name + "PopupObserver callback inside");
				wup_title.style.display = "flex";
				wup_title.style.justifyContent = "space-around";
				wup.querySelector(".wup-content").removeAttribute("style");

				inside_observer_callback(wup, wup_title);
			}
		}
	}

	const observer = new MutationObserver(callback);
	observer.observe(target, config);

	console.log("Add" + name + "PopupObserver done");
}

function AddLogsHistoryPopupObserver() {
	//TODO https://godville.net/hero/last_fight
	//TODO third eye
	//todo еще и внутри /logs
	AddAbstactPopupObserver("LogsHistory", "История сражений", function (wup, wup_title) {
		wup_title.innerHTML = "<a href=https://godville.net/hero/last_fight>История сражений</a>";

		//wait until wup will load
		const observer_callback = function (mutationsList, observer) {
			observer.disconnect();
			AddErinomeLogsCheckingActions(wup, document.querySelector("#lf_popover_c div:not(.wl_line)"));
		};
		const observer = new MutationObserver(observer_callback);
		observer.observe(wup.querySelector("#lf_popover_c"), { childList: true });
	});
}

function AddLaboratoryPopupObserver() {
	AddAbstactPopupObserver("Laboratory", "Лаборатория", function (wup, wup_title) {
		let a = wup_title.querySelector(".center_link");
		if (!a) {
			a = document.createElement("a");
			a.textContent = "Ссылка на калькулятор";
			a.className = "center_link";
			a.title = "Полный рассчет на http://godb.gandjubas.de/";
			a.onclick = () => {
				const txt = Array.from(wup.querySelectorAll(".wup-content > div .bps_line")).reduce((acc, curr) => {
					return acc + curr.querySelector(".bps_capt").textContent + "+" + curr.querySelector(".bps_val").textContent.replaceAll(" ", "+") + "%0D%0A";
				}, "");
				window.open("http://godb.gandjubas.de/golem/index.php?txt=" + txt, '_blank');
			}
			wup_title.appendChild(a);
		}
		/* do i need it ???
		for (const x of wup.querySelectorAll(".wup-content > div .bps_line .div_link_nu")) {
			x.addEventListener('click', function (e) {
				alert("test");
			});
		}
		*/
	});
}

function AddGodVoicesPopupObserver() {
	const target = document.querySelector('body');
	const config = {
		childList: true
	};
	const callback = function (mutationsList, observer) {
		const title_chronique = document.querySelector("#m_fight_log > div.block_h > h2");
		const diary = document.querySelector("#diary > div.block_h > h2");
		const researches_roots = ["изобр", "крафт", "склей", "собир", "собери", "слепи", "соедини", "сделай"];
		const directions_roots = ["север", "юг", "запад", "восток", "вниз", "спуск", "вверх", "наверх", "лестниц", "подним"];
		const global_par_table = [
			{ dict: {}, pre: "[x", post: "🛠]", id: "MyGV_craft_del", title: "Удалить все крафтовые гласы" },
			{ dict: {}, pre: "[x", post: "↗]", id: "MyGV_directions_del", title: "Удалить все гласы направлений (включая лестничные)" },
			{ dict: {}, pre: "[", post: "]", id: "MyGV_del", title: "Очистить все гласы" }
		];

		function UpdateObjText(par_entity) {
			const obj = document.getElementById(par_entity.id);
			//console.log("UpdateObjText", par_entity, obj);
			if (obj) {
				obj.className = (Object.keys(par_entity.dict).length == 0) ? "" : "div_link_nu";
				obj.textContent = par_entity.pre + Object.keys(par_entity.dict).length + par_entity.post;
			}
		}
		function reFillDictionariesAndUpdateNumbers() {
			//console.log("reFillDictionariesAndUpdateNumbers", document.querySelectorAll("#gv_popover_c .wl_line:not([style*='display: none'])"));
			for (const entity of global_par_table) {
				entity.dict = {};
			}
			for (const i of document.querySelectorAll("#gv_popover_c .wl_line:not([style*='display: none'])")) {
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

		const godvoices_panel = document.getElementById("gv_popover_c");
		if (godvoices_panel) {
			const a = godvoices_panel.parentNode.parentNode;
			function Create_DeleteDiv(_entity) {
				let obj = document.getElementById(_entity.id);
				if (!obj) {
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

			const el = document.getElementById("MyGV_craft_del");
			if (!title_chronique && diary) {
				Create_DeleteDiv(global_par_table[0]);
			} else {
				if (el) el.style.display = "none";
			}

			const el1 = document.getElementById("MyGV_directions_del");
			if (title_chronique && title_chronique.textContent.includes("подземелья")) {
				Create_DeleteDiv(global_par_table[1]);
			} else {
				if (el1) el1.style.display = "none";
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
	const observer = new MutationObserver(callback);
	observer.observe(target, config);

	console.log("AddGodVoicesPopupObserver done");
}

function AddChroniqueStepObserver() {
	const title_chronique = document.querySelector("#m_fight_log > div.block_h > h2");
	let div = document.getElementById("MyGV_ToNextHint");
	if (!div) {
		div = document.createElement("div");
		div.id = "MyGV_ToNextHint";
		div.style.display = "inline";
		title_chronique.nextSibling.prepend(div);
	}

	const config = {
		childList: true,
		characterData: true
	};
	const callback = function (mutationsList, observer) {
		//TODO исключить моря
		//console.log("ChroniqueStep callback");
		const re = /\d+/g;
		const match = re.exec(title_chronique.textContent);
		if (match) {
			const move_number = match[0];
			div.textContent = move_number;
		}
		//TODO

		if (title_chronique.firstChild.textContent.includes("подземелья")) { ///TODO && is_need_check_later
			AddOrUpdateAquariumLinks();
			//TODO молилка, исключить 100+ праны, подзем Мольбы, праноконденсатор, учитывая распаковку (по астропрогнозу)

			//TODO урон ловушки, исключить влияния\чудеса не в Бессилии

			const exitObj = document.querySelector("[title='Выход из подземелья']");
			//TODO цвет выхода
			//if (Number(move_number) <= 20) exitObj.style.backgroundColor = "#ff4422";
		}

		if (title_chronique.firstChild.textContent.includes("боя")) {

			//TODO молитва на влияния\чудеса\гласы, исключить 100+ праны, праноконденсатор, учитывая распаковку (по астропрогнозу)
		}
	};
	callback();

	const observer = new MutationObserver(callback);
	observer.observe(title_chronique, config);

	console.log("AddChroniqueStepObserver done");
}

function AddThirdEyeObserver() {
	AddAbstactPopupObserver("ThirdEye", "Третий глаз", function (wup, wup_title) {
		const links = wup.getElementsByClassName("div_link");
		for (const a of links) {
			const id = a.getAttribute("href").replaceAll("/duels/log/", "");
			const my_a = CreateLogLinkCheckingButtonObject(id);
			EditAByChromeStorageData(my_a, id);
			const d_msg = a.parentNode.parentNode;
			const my_span = document.createElement("span");
			my_span.append(" ");
			my_span.appendChild(my_a);
			d_msg.appendChild(my_span);
		}

		const pointer_links = Array.from(wup.getElementsByClassName("pointer_link") ?? []);
		AddAbstractChromeStorageListener("ThirdEye", (add_arr, new_arr, ch_key) => {
			console.log("add_arr", add_arr, ch_key);
			add_arr.forEach(x_id => {
				const filtered = pointer_links.find(a => a.getAttribute("href").includes(x_id));
				const bool = (ch_key == 'MyGV_LoadedLogs') ? true : (ch_key == 'MyGV_NotLoadedLogs') ? false : undefined;
				if (bool != undefined && filtered) MarkRow(filtered.parentNode, bool, "https://gv.erinome.net/duels/log/" + x_id);
			});
		});
	});
}


function AddPolygonStepObserver() {
	let timerId;

	const polygon_title_h2 = document.querySelector("#a_central_block div.block_h h2");
	let div = document.getElementById("MyGV_PolygonTimeBeforeEndHint");
	if (!div) {
		div = document.createElement("div");
		div.id = "MyGV_PolygonTimeBeforeEndHint";
		div.title = "осталось секунд до конца полигона";
		div.style.display = "inline";
		polygon_title_h2.nextSibling.appendChild(div);
	}

	const config = {
		childList: true,
		characterData: true
	};
	const callback = function (mutationsList, observer) {
		console.log("AddPolygonStepObserver callback");
		//const substep_in_perc = document.querySelector("#turn_pbar .p_val");
		if (polygon_title_h2 && polygon_title_h2.textContent) console.log(polygon_title_h2.innerHTML);
		const match = /\d+/g.exec(polygon_title_h2.textContent);
		if (match) {
			const step = Number(match[0]);
			let msseconds_left = (41 - step) * 20;
			clearTimeout(timerId);
			timerId = setTimeout(function tick() {
				div.textContent = msseconds_left-- + "s";
				clearTimeout(timerId);
				timerId = setTimeout(tick, 1000);
			}, 1000);
			//observer.disconnect();
		}
	};

	const observer = new MutationObserver(callback);
	observer.observe(polygon_title_h2, config);
	callback();

	//add boss letters as titles
	const title_letters = "BCDABC";
	const z = document.querySelectorAll(".opp_n:not(.opp_ng)");
	const ind = Array.from(z).findIndex(x => x.firstElementChild.textContent.includes("@"));

	const Objmas = document.getElementsByClassName("st_div");
	for (let index = 0; index < 3; index++) {
		Objmas[index].textContent = title_letters[index + ind];
	}

	console.log("AddPolygonStepObserver done");
}

//TODO add ONLY FIRST level
//TODO check buffered level
function AddOrUpdateAquariumLinks() {
	const m = document.querySelector("#map > div.block_content > div");
	const map = m.childNodes[1];

	const exitObj = document.querySelector("[title*='Выход из подземелья']") || document.querySelector("[title*='Команда героев']");
	if (!exitObj || document.querySelector("[title*='Тайная комната'") || m.childNodes[0].textContent.includes("2Э")) {
		console.log("AddOrUpdateAquariumLinks return");
		return;
	}
	const exitCoord = GetJSCoords(exitObj);
	const exitRowsNear = [-1, 0, 1].map(i => Array.from(map.childNodes)[exitCoord[1] + i]);
	const exitCellsNear_H = exitRowsNear.map(r => [-1, 0, 1].map(j => Array.from(r.childNodes)[exitCoord[0] + j]));

	const north_south_NearExit = [0, 2].filter(i => exitCellsNear_H[i].every(cell => cell.className.includes("dmw")));
	const west_east_NearExit = [0, 2].filter(i => exitCellsNear_H.every(r => r[i].className.includes("dmw")));
	//console.log(north_south_NearExit, west_east_NearExit);
	if (north_south_NearExit.length > 0 || west_east_NearExit.length > 0) {
		console.log("AddOrUpdateAquariumLinks return exitNotNearWall");
		return;
	}

	let a = m.querySelector(".center_link");
	if (!a) {
		a = document.createElement("a");
		a.className = "center_link";
		a.textContent = "Карта аквариума";
		a.title = "С сайта digdog.web.app на основе статистики";
		m.appendChild(a);
	}

	const borders_mas = [
		Array.from(map.firstElementChild.childNodes),
		Array.from(map.lastElementChild.childNodes),
		Array.from(map.childNodes, e => e.firstElementChild),
		Array.from(map.childNodes, e => e.lastElementChild)
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

	const chosenPoints = [borders_mas[0], borders_mas[1]].reduce((acc, e) => {

		//acc.push([e[0], e[]]);
	}, []);

	console.log("chosenPoints", chosenPoints);
	//TODO переписать!
	const points_mas = chosenPoints.map(e => {
		console.log(e);
		const coords = GetJSCoords(e);
		const type = 0;
		if (e.className.includes("dmw")) return null;
		return `${coords[1] - exitCoord[1] + 17},${coords[0] - exitCoord[0] + 17}-` + type;
	}).filter(a => a);

	const link = "!https://digdog.web.app/?points=" + points_mas.join(";");
	a.href = link;
	a.onclick = (e) => {
		e.preventDefault();
		window.open(link, '_blank');
	}

	console.log("AddOrUpdateAquariumLinks done");
}

function DecideDungeonType() {

}

function getMaxHp(godName) {
	return new Promise((resolve, reject) => {
		//throw API
		const url = `https://godville.net/gods/api/${godName}.json`;
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'json';
		xhr.onload = function () {
			const status = xhr.status;
			if (status === 200) {
				resolve(xhr.response.max_health);
			} else {
				reject(status, xhr.response);
			}
		};
		xhr.send();
	});
}

const last_dungeon = {};
let mutatable_boss_abilities_history = "";

//TODO для логов
function AddHolemSearch() {
	const boss = document.querySelector("#o_hk_name > .l_val");
	if (!boss) return; //для отрядов
	const boss_name = boss.textContent;
	//TODO проверить на зовущем
	const boss_abilities = document.querySelector('#o_info > .block_content > .line:not([id]) > .l_val').textContent;
	if (boss_abilities.split(", ").length == 3) {
		//ссылка на поиск голема для трехабила
		const boss_hp = /\d+$/g.exec(document.querySelector("#o_hl1 > .l_val").textContent)[0];
		const hero_hp = /\d+$/g.exec(document.querySelector("#hk_health > .l_val").textContent)[0];

		const params = new URLSearchParams({ "str": boss_name, "b": boss_hp, "h1": hero_hp });
		let i = 2;
		Array.from(document.querySelectorAll("#alls > .block_content .line.oppl")).forEach(z => {
			const text = z.querySelector(".opp_h > span").textContent;
			const allies_hp = text == "повержен" ? getMaxHp(z.querySelector(".opp_ng > span").textContent.slice(1, -1)).then() : /\d+$/g.exec(text)[0];
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
		const link = "http://godb.gandjubas.de/golems/golems.php?" + params.toString();

		const a = document.createElement("a");
		a.textContent = "Ссылка на поиск голема";
		a.href = link;
		const where = document.querySelector("#o_info > .block_content");
		where.insertBefore(a, where.lastElementChild);
	}

	console.log("AddHolemSearch done");
}

//TODO ????
function DecideToAddAuraStringObserver() {
	const second_target = Array.from(document.querySelectorAll("#stats > div.block_content > .line:not([id])")).find(a => a.firstElementChild.textContent == "Аура");
	if (second_target) AddAuraSecondsObserver(second_target.lastElementChild);
	else {
		const target = document.querySelector("#stats > div.block_content");
		const config = {
			childList: true
		};
		const callback = function (mutationsList, observer) {
			//mutationsList
		};
		//const observer = new MutationObserver(callback);
		//observer.observe(target, config);
	}
	console.log("DecideToAddAuraStringObserver done");
}

//TODO test
function AddAuraSecondsObserver(target) {
	const config = {
		subtree: true,
		characterData: true
	};
	const callback = function (mutationsList, observer) {
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

	const observer = new MutationObserver(callback);
	observer.observe(target, config);

	console.log("AddAuraSecondsObserver done");
}

//TODO параметр для разных режимов
function AddMyGVCountsBlock() {
	let div = document.getElementById("MyGV_Field_Counts");
	if (!div) {
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
	if (!div_duel) {
		div_duel = div.cloneNode(true);
		div_duel.id = "MyGV_Duel_Counts";
		document.getElementById("right_block")?.appendChild(div_duel);
	}

	console.log("AddMyGVCountsBlock done");
}

//TODO параметр + 1
function AddInventoryListener() {
	const target = document.querySelector("#inv_block_content > ul");
	const config = {
		childList: true
	};
	const callback = function (mutationsList, observer) {
		//замена ареналина
		const index = Array.from(target.childNodes).findIndex(a => a.textContent.includes("ареналин"));
		if (index > 0) {
			console.log("ареналин");
			const time = new Date();
			if (time.getUTCMinutes() < 3) {
				console.log("Клик на", target.childNodes[index]);
				//target.childNodes[index].onclick();
			}
		}

		//TODO прокликивания бесплатных активашек
	};
	const observer = new MutationObserver(callback);
	observer.observe(target, config);

	callback();
	console.log("AddInventoryListener done");
}

function AddFieldNewsListener() {
	const target = document.querySelector("#news > div.block_content");
	const config = {
		attributes: true,
		childList: true,
		subtree: true
	};
	const callback = function (mutationsList, observer) {
		console.log("AddFieldNewsListener callback", observer);
		/*
		const IsMonsterHided = document.querySelector("#news_pb > div.line.npb").style.display == "none";
		if (IsMonsterHided) {
			const bar = document.querySelector("#news_pb > div.p_bar.n_pbar > div");
			bar.
		}
		*/
	};

	const observer = new MutationObserver(callback);
	observer.observe(target, config);
	callback();
	console.log("AddFieldNewsListener done");
}

function AddFieldTaskObserver() {
	const task = document.querySelector("#hk_quests_completed .p_bar div");
	const config = {
		attributes: true
	};
	const callback = function (mutationsList, observer) {
		const taskWithPerc = task.style.getPropertyValue('width') ?? "0%";
		const taskValue = Number(taskWithPerc.slice(0, -1));
		const obj = document.querySelector("#news_pb .p_bar.n_pbar .p_val");
		if (obj) {
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
	const observer = new MutationObserver(callback);
	observer.observe(task, config);

	callback();
	console.log("AddFieldTaskObserver done");
}

function AddFieldHeaderObserver() {
	const target = document.querySelector("#news > div.block_h > h2");
	const config = {
		childList: true
	};
	const callback = function (mutationsList, observer) {
		const val = target.textContent.includes("из города") ? "hidden" : "visible";
		/*
		if (mutationsList) {
			for (const mutation of mutationsList) {
				console.log(mutation);
			}
		}
		*/
		const obj = document.querySelector("#news_pb .p_bar.n_pbar .p_val");
		if (obj) {
			obj.style.setProperty('--Visibility', val);
		}
		console.log("FieldHeaderObserver callback", target, val, document.querySelector("#news > div.block_h > h2"));
	};
	const observer = new MutationObserver(callback);
	observer.observe(target, config);

	callback();
	console.log("AddFieldHeaderObserver done");
}


///TODO parameter
function AddMonsterInvitingListener() {
	const target = document.querySelector('#news > div.block_content > [aria-live="polite"]> .line');
	const config = {
		attributes: true
	};
	const callback = function (mutationsList, observer) {
		console.log("MonsterListener callback", observer);
		//TODO Восставший \\не с кровати
		const Monster = document.querySelector("#news div.l_val > span").textContent;
		if (Monster == "") {
			//document.getElementById("monster_invite_submit").onclick();
		}
	};

	const observer = new MutationObserver(callback);
	observer.observe(target, config);
	callback();
	console.log("AddMonsterListener done");
}

//1) diary -> (any) duel mode (by getElementById("hero_columns"))
//2) dungeon -> boss_fight
function waitForContents(callback, level = 0, observer_target_id, observer_config) {
	//console.log(document.body.innerHTML);
	console.log("waitForContents, level", level);
	function ObserverCallback(mutations, inner_observer) {
		if (document.getElementById('stats') || document.getElementById('m_info') || document.getElementById('b_info')) {
			console.log("ObserverCallback, level", level, "inner_observer =", inner_observer);
			inner_observer?.disconnect();
			//waitForContents(callback, ++level, "hero_columns", { attributes: true });
			callback();
		}
	}
	const observer = new MutationObserver(ObserverCallback);
	ObserverCallback(undefined, observer);
	observer.observe(document.getElementById(observer_target_id), observer_config);
	console.log("waitForContents end, level", level);
}

function UpdateMiniQuestsDB() {
	chrome.storage.local.get('AutoGV_miniQuests', function (result) {
		//console.log(result);
		if (Object.keys(result).length == 0 || result['AutoGV_miniQuests'].length == 0) {
			fillMiniQuestsTitles(UpdateMiniQuestInfo);	// заполнение и колбеком в конце обновление
			console.log("fetched miniquests data from source");
		}
		else {
			// Заход первый раз при загрузке и с БД в памяти
			// первичная проверка задания на мини-квест		
			UpdateMiniQuestInfo();
			console.log("used just chrome.storage for miniquests data");
		}
	});
}

function AddPetLink() {
	//ссылка на таблицу питомцев
	const pet = document.querySelector("#pet > div.block_h > h2");
	pet.setAttribute('href', "https://wiki.godville.net/Питомец");
	pet.style.cursor = "pointer";
	pet.onclick = function (e) {
		e.preventDefault();
		window.open(this.getAttribute("href"), '_blank');
	}
}

function AddSkillsTypesNumbers() {
	const skills_left = document.querySelector("#skills .l_slot");
	const div = document.createElement("div");
	div.id = "skill_badge2";
	div.className = "fr_new_badge e_badge_pos m_hover";
	const callback = function (mutationsList, observer) {
		const arr = Array.from(document.querySelectorAll("#skills .skills_block li .skill_info"));
		const text_arr = arr.map(span => span.textContent);
		const c = ["боевое", "торговое", "трансп"].map(str => text_arr.filter(s => s.includes(str)).length);
		div.textContent = `${c[0]}/${c[1]}/${c[2]}`;
		div.title = `Количество умений:
	${c[0]} боевых
	${c[1]} торговых
	${c[2]} транспортных`;
		//if (observer) alert("updated AddSkillsTypesNumbers");
	}
	callback();
	skills_left.appendChild(div);

	//listener
	const target = document.querySelector("#skills .block_content");
	const config = {
		characterData: true,
		childList: true,
		subtree: true
	};

	const observer = new MutationObserver(callback);
	observer.observe(target, config);

	console.log("AddSkillsTypesNumbers done");
}

function AddResizeCentralBlock() {
	const arr = ["central_block", "a_central_block"].map(t => document.getElementById(t));
	const central_block = arr.find(node => node.childNodes.length > 0);
	function SetWidth() {
		const new_width = window.innerWidth - 560;
		if (new_width > 400) central_block.style.width = new_width + "px";
	}
	SetWidth();
	window.addEventListener("resize", (e) => {
		//console.log("AddResizeCentralBlock central_block", central_block);
		SetWidth();
	});
}

//листенер ожидания реальной прогрузки документа в первый раз 
//(потому что обычный addeventlisner('load' и аналоги иногда багано выдают неполную страницу)
//+ эта же конструкция для включения функций в случае переключения дуэльного режима - неполной перезагрузки
const was_runned_on = [];
waitForContents(() => {
	const temp_will_run_state = [];
	if (was_runned_on.length == 0) {
		temp_will_run_state.push("base");
		//console.log("document", document.body.outerHTML);
		//console.log(document.getElementById('stats'), document.getElementById('m_info'), document.getElementById('b_info'));

		AddMyGVCountsBlock();
		AddLogsHistoryPopupObserver();
		AddLaboratoryPopupObserver();
		AddGodVoicesPopupObserver();
		AddThirdEyeObserver();
		AddResizeCentralBlock();
	}

	const title_chronique = document.querySelector("#m_fight_log div.block_h > h2");
	if (title_chronique && !was_runned_on.some(i => i.includes("chronique"))) {
		AddChroniqueStepObserver();
		if (title_chronique.textContent.includes("боя")) {
			AddHolemSearch();
		}
		temp_will_run_state.push("chronique");
	}
	const polygon_title = document.querySelector("#a_central_block div.block_h > h2");
	if (polygon_title && polygon_title.textContent.includes("Полигон") && !was_runned_on.some(i => i.includes("polygon"))) {
		AddPolygonStepObserver();
		temp_will_run_state.push("polygon");
	}
	const diary = document.querySelector("#diary div.block_h > h2");
	if (diary && !was_runned_on.some(i => i.includes("diary"))) {
		DecideToAddAuraStringObserver();
		AddInventoryListener();
		//AddFieldNewsListener();
		//AddMonsterInvitingListener();
		AddFieldHeaderObserver();
		AddFieldTaskObserver();
		UpdateMiniQuestsDB();
		AddMiniQuestListeners();
		AddPetLink();
		AddSkillsTypesNumbers();

		temp_will_run_state.push("diary");
	}
	was_runned_on.push(temp_will_run_state);
	console.log("was_runned_on ", was_runned_on);
}, 0, "main_wrapper", { childList: true, subtree: true });

const godpower = document.querySelector("#cntrl > div.pbar.line > div.gp_val.l_val");
const polygon = document.querySelector("#r_map > div.block_h > h2");

const diary = document.querySelector("#diary > div.block_h > h2");
if (diary) {
	//определение торговли

	//газета - проклик "проверить" -> "заполнить" или "ой все" на бинго
	const time = new Date();
	if (time.getUTCHours() == 21 && time.getUTCMinutes() < 2) {
		//запросом
	}

	//TODO плюсики
	const pluses = document.querySelectorAll(".vote_links_b");
	for (const i of pluses) {
		// точно минус -> "эстафеты" отдельно
		// крафтовые класы новичков "Скрести"
		const pos = Math.round(Math.random());
		//const plusminus = i.children[pos];
		//plusminus.click();
	}

}

function FindTittleInfo(miniQuests, target) {
	const titleInfo = [];
	for (const miniQuestsObj of Object.values(miniQuests)) {
		for (const blankObj of miniQuestsObj['quests']) {
			const questBlank = blankObj.blank.slice(1);
			for (const [questIndex, quest] of questBlank.entries()) {
				if (quest.includes(target)) {
					const tempObject = {
						recency: miniQuestsObj['recency'],
						quest,
						questBlank,
						questProgress: (questIndex + 1) + '/' + questBlank.length
					}
					if (questIndex + 1 < questBlank.length) {
						tempObject['nextQuest'] = questBlank[questIndex + 1];
					}
					if (blankObj.hasOwnProperty('warning')) {
						tempObject['warning'] = blankObj['warning'];
					}
					titleInfo.push(tempObject);
				}
			}
		}
	}
	//console.log(titleInfo);
	return titleInfo;
}

// Функция проверки на мини-квест и обновления информации о мини-квесте в title
function UpdateMiniQuestInfo() {
	console.log("UpdateMiniQuestInfo");
	const quest_target = document.querySelector("#hk_quests_completed > div.q_name");
	if (!quest_target.textContent.includes(' (мини)')) {
		quest_target.title = ''; // убираем title, в случае если это не мини-квест
		return;
	}
	const targetQuest = document.querySelector("#hk_quests_completed > div.q_name").textContent.replace(' (мини)', '');
	chrome.storage.local.get('AutoGV_miniQuests').then(data => {
		console.log('UpdateMiniQuestInfo > inside AutoGV_miniQuests');
		const titleInfo = FindTittleInfo(data.AutoGV_miniQuests, targetQuest);
		if (titleInfo != 0) {
			let questTitle = '', commonWarning = 0, commonRecency = 0;
			// просмотр на одинаковые поля titleInfo 
			for (const match2 of titleInfo) {
				if (match2.hasOwnProperty('warning')) {
					commonWarning++;
				}
				if (match2.recency == titleInfo[0].recency) {
					commonRecency++;
				}
			}
			// Вывод titleInfo
			for (const [index, match] of titleInfo.entries()) {
				if (match.hasOwnProperty('warning')) {		// проверка на наличие предупреждения о меняющемся порядке квестов
					questTitle += (index + 1) + ". " + match.questBlank.join(' → ') + '\n';
					if (commonWarning != titleInfo.length) {
						questTitle += match['warning'] + '\n';
					}
				}
				else {
					questTitle += match.quest;
					if (match.hasOwnProperty('nextQuest')) {		// проверка на наличие следующего квеста из ветки
						questTitle += ' → ' + match.nextQuest;
					}
					questTitle += ' ' + match['questProgress'] + '\n';
				}
				if (commonRecency != titleInfo.length) {
					questTitle += match.recency + '\n';			// старый или новый мини-квест, если разные
				}
			}
			if (commonWarning == titleInfo.length) {
				questTitle += "~! " + titleInfo[0].warning + '\n';		// наличие предупреждения о меняющемся порядке квестов для всех квестов
			}
			if (commonRecency == titleInfo.length) {
				questTitle += "~ " + titleInfo[0].recency;		// старый или новый мини-квест, если одинаково поле у всех квестов
			}
			document.querySelector('#hk_quests_completed > div.q_name').title = questTitle;		// добавление итогового title
		}
		else document.querySelector('#hk_quests_completed > div.q_name').title =
			'Описание не найдено. Попробуйте обновить базу мини-квестов в настройках расширения';
	})
}

// Функция добавления слушателей и обработчиков при изменении квеста и при изменении БД с мини-квестами
function AddMiniQuestListeners() {
	console.log("AddMiniQuestListeners start");
	const quest_target = document.querySelector("#hk_quests_completed > div.q_name");
	const quest_config = {
		characterData: true,
		childList: true
	}
	const miniQuest_callback = function (mutationsList, observer) {
		UpdateMiniQuestInfo();
	}
	const miniQuest_observer = new MutationObserver(miniQuest_callback);
	miniQuest_observer.observe(quest_target, quest_config);
	browser.storage.onChanged.addListener((changes, area) => {
		if (area === 'local' && changes.AutoGV_miniQuests?.newValue) {
			UpdateMiniQuestInfo();
		}
	});
	console.log("AddMiniQuestListeners done");
}

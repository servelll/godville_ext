//crossword
async function AddCrosswordThings() {
	function FillWord(objs, match_or_matches, force_mark = false) {
		let status = "fullfilled";
		for (let i = 0; i < objs.length; i++) {
			//console.log(`${o.getAttribute("class")}`);
			if (objs[i].getAttribute("class") == "sym") {
				let x;
				if (typeof match_or_matches == "string") {
					x = match_or_matches[i];
				} else if (Array.isArray(match_or_matches) && match_or_matches[0].length == 1 ||
					Array.isArray(match_or_matches) && match_or_matches[0].length > 1 &&
					Array.from(match_or_matches, v => v[i]).every(v => v == match_or_matches[0][i])) {
					x = match_or_matches[0][i];
				}

				if (x) {
					if ((force_mark || objs[i].value != "") && objs[i].value != x.toUpperCase()) {
						objs[i].style.background = "#3dc43d";
						status = "partially_filled";
					}
					objs[i].value = x.toUpperCase();
				} else {
					status = "partially_filled";
				}
			}
		}
		return status;
	};

	function CheckCrosswordFullfilledState() {
		if (final_mas.every(z => z.array.every(x => x.status != "not_filled" && x.status != "partially_filled"))) but.style.display = "none";
	}
	const cross = document.querySelector('.cross_q');
	const text_mas = cross.textContent.replaceAll("\n", "").replaceAll("\t", "").replaceAll("По горизонтали:", "").split("По вертикали:");
	const dir_mas = ['По горизонтали', 'По вертикали'];

	const final_mas = text_mas.map((i, _index) => {
		const numbers = i.match(/\d+/g);
		const types = i.match(/[а-яА-Я ]{2,}/g);
		return {
			dir: dir_mas[_index], array: numbers.map((j, index) => {
				return {
					index: j, value: types[index].trim(), status: "not_filled",
					objs: document.querySelectorAll(`[aria-label *= '${j} ${dir_mas[_index]}']`)
				};
			})
		};
	});

	function clear() {
		document.querySelectorAll('#cross_tbl .td_cell:not(.known) input').forEach(obj => obj.value = "");
	}
	//TODO для дебага не чистим от пользовательского мусора
	clear();
	console.log("final_mas", final_mas);

	//чистим старое описание (ставим свои нормальные тэги для устаноки титлов)
	cross.replaceChildren();
	final_mas.forEach(j => {
		const header_span = document.createElement("span");
		header_span.textContent = j.dir + ":";
		cross.appendChild(header_span);
		cross.append(document.createTextNode(" "));
		const temp_obj_array = j.array.map(i => {
			const z = document.createElement("z");
			z.id = `cross_${j.dir == "По горизонтали" ? "h" : "v"}_${i.index}`;
			z.textContent = `${i.index}.\u00A0${i.value}.`;
			return z;
		});
		for (let k = 0; k < temp_obj_array.length; k++) {
			cross.appendChild(temp_obj_array[k]);

			if (k < temp_obj_array.length - 1) {
				const span = document.createElement("span");
				span.textContent = " ";
				cross.append(span);
			}
		}
		if (j.dir == "По горизонтали") cross.appendChild(document.createElement("br"));
	});
	function SetTitles() {
		final_mas.forEach(j => {
			j.array.forEach(i => {
				const id = `cross_${j.dir == "По горизонтали" ? "h" : "v"}_${i.index}`;
				const z = document.getElementById(id);
				const array = ["status", "group_num", "match", "total_regex_mask"].map(prop => `${prop}: ${i[prop]}`);
				z.title = array.join("\n");
				z.style.backgroundColor = (i.status == "fullfilled" || i.status == "not_filled") ? "" : "#3dc43d";
			});
		});
	}
	SetTitles();

	const terrain_obj = await chrome.storage.local.get("terrain");
	const terrain_source = Array.from(terrain_obj["terrain"]).join("\n");
	const seaMonsters_obj = await chrome.storage.local.get("seaMonsters");
	const seaMonsters_source = Array.from(seaMonsters_obj["seaMonsters"]).join("\n");

	const but = document.createElement("button");
	but.textContent = "Заполнить";
	but.style = "margin: 10px";
	const cr = document.querySelector("#cross_block");
	cr.style = "text-align: center";
	cr.insertBefore(but, document.querySelector("#cross_block form"));

	let unaccuracy_level = 0;
	const url = chrome.runtime.getURL('parsed_words_for_crossword.txt');
	const response = await fetch(url);
	const data = await response.text();

	//при формировании списка отдельных типов мы учитывваем, что в файле идут сначала А->Я, потом другие символы
	//также, для простоты, в каждом списке есть А, поэтому не усложняем алгоритм до более общего 
	const pos_mas = [0];
	const diff_types_pos = [...data.matchAll(/^А.+/gim)];
	let last_pos = 0;
	diff_types_pos.forEach(v => {
		if (v.index > last_pos) {
			pos_mas.push(v.index);
		}
		last_pos = v.index + v[0].length + 3;//на всякий случай \r\n
	});
	pos_mas.push(data.length);
	console.log("pos_mas", pos_mas);
	if (pos_mas.length != 9) alert("нестандартный parsed_words_for_crossword.txt");

	but.addEventListener("click", async function () {
		const time = new Date();
		if (time.getUTCHours() == 21 && time.getUTCMinutes() > 4 && time.getUTCMinutes() < 9) {
			alert("Слишком ранняя разгадка! Подождите хотя бы до .9 минут");
			return;
		}

		const previous_mas = final_mas;
		final_mas.forEach(j => {
			j.array.filter(a => a.status != "fullfilled").forEach(i => {
				const _masks_mas = Array.from(i.objs, function (node) {
					const symb = (node.getAttribute("class") == "sym") ? node.value : node.innerHTML;
					if (symb == " ") return " ";
					if (symb == "Ё" || symb == "ё") return '[ЁЕ]';
					return (!symb) ? "." : `${symb.toLowerCase()}`;
				});

				let source;
				i.total_regex_mask = (unaccuracy_level < 2) ? "^" : "";
				i.total_regex_mask += _masks_mas.join("");
				const types_mas = ['монстр', 'трофей', 'умение', 'снаряжение', 'босс', 'город', 'местность', 'тварь'];
				const group_num = types_mas.findIndex(type => i.value.toLowerCase().includes(type));
				if (group_num == -1) {
					if (seaMonsters_source != "" && /мор/gi.test(i.value)) {
						source = seaMonsters_source;
					} else if (terrain_source != "" && /местност/gi.test(i.value)) {
						source = terrain_source;
					}
				} else {
					i.group_num = group_num;
					const indexFirst = (unaccuracy_level > 1) ? 0 : pos_mas[group_num];
					const indexLast = (unaccuracy_level > 1) ? pos_mas[pos_mas.length - 1] : pos_mas[group_num + 1];
					source = data.substring(indexFirst, indexLast);
					if (unaccuracy_level < 2 && group_num == 1 && i.value.includes('Жирный')) i.total_regex_mask += "(?=\|\(.*жирный.*\))";
					if (unaccuracy_level < 2 && group_num == 4 && i.value.includes('Подземный')) i.total_regex_mask += "(?=\|\(.*(подземельный)|(подвальный).*\))";
				}

				if (source) {
					//Корован как Сильный монстр или босс????
					i.match = source.match(new RegExp(i.total_regex_mask, "gim"));
					if (i.match) {
						i.match = Array.from(new Set(i.match));
					}
				} else {
					console.log(i.objs);
					throw new Error("unknown category!");
				}
			});
		});
		//check Confilcts of mas.copy
		//construct total final_mas
		//break if equal

		console.log("final_mas", final_mas);

		//заполняем
		//уровни точности
		//на 0 итерацию - чистые маски
		//на 1 - дозаполняем найденным по новым маски с всем заполненным на 0
		//на 2 - ослабляем рамки, TODO ищем ложно заполненные
		final_mas.forEach(j => {
			j.array.forEach(i => {
				//общее множеств и одиночки
				if (i.match) {
					i.status = FillWord(i.objs, i.match);
				}
			});
		});

		//на 2 - позволяем пользователю выбрать дубли оставшегося
		if (unaccuracy_level >= 3) {
			final_mas.forEach(j => {
				j.array.filter(a => a.match && a.match.length > 1).forEach(i => {
					const b = document.createElement("button");
					b.style = "margin: 10px";
					b.textContent = `${i.index} ${j.dir}: ${i.match[0]}`;
					b.value = 0;
					FillWord(i.objs, i.match[0], true);

					b.onclick = function () {
						this.value++;
						if (this.value > i.match.length - 1) this.value = 0;
						this.textContent = `${i.index} ${j.dir}: ${i.match[this.value]}`;
						FillWord(i.objs, i.match[this.value]);
					}

					cr.insertBefore(b, but);
					i.status = "user_choose_fill";
				});
			});
		}

		CheckCrosswordFullfilledState();
		SetTitles();
		if (previous_mas == final_mas) {
			unaccuracy_level++;
			console.log("Повышаем уровень точности:", unaccuracy_level);
			if (unaccuracy_level == 0) but.title = `Уровень ${unaccuracy_level}: Поиск по маске только внутри категории и строгая проверка дополнительных свойств (жирный трофей/сильный монстр/подземный босс)`;
			else if (unaccuracy_level == 1) but.title = `Уровень ${unaccuracy_level}: Поиск по маске во всем файле и строгая проверка дополнительных свойств (жирный трофей/сильный монстр/подземный босс)`;
			else but.title = `Уровень ${unaccuracy_level} (2+): Поиск по маске во всем файле и игнорирование доп свойств (жирный трофей/сильный монстр)`;
		}
	});

	//вешаем листенер для детекта ошибок с сервера
	document.getElementById("crossword_submit")?.addEventListener("click", (e) => {
		e.preventDefault();

		const crossw_table = document.getElementById("cross_tbl");
		if (crossw_table) {

			const callback = function (mutationsList, observer) {
				mutationsList.forEach(mut => {
					if (mut.target.style.backgroundColor == "rgb(255, 153, 153)") {
						mut.target.querySelector("input").value = "";
						but.style.display = "";
					}
				});
			}
			const config = {
				attributes: true,
				subtree: true
			};

			const observer = new MutationObserver(callback);
			observer.observe(crossw_table, config);
		}
	});

	console.log("AddCrosswordThings done");
}

let forecast = Array.from(document.querySelectorAll(".fc > p")).reduce((sum, i) => sum + i.textContent, "");
let unknown_forecast_strings = [
	"но уточнять его содержимое астрологи отказываются",
	"в каждом прогнозе должна быть загадка"
];
function AddUnknownForecastLinks() {
	if (unknown_forecast_strings.some(i => forecast.includes(i))) {
		console.log("AddUnknownForecast inside if");
		const p = document.createElement("p");

		const a1 = document.createElement("a");
		a1.textContent = "Форум для неизвестного прогноза";
		a1.href = "https://godville.net/forums/show_topic/3779?page=last";
		p.appendChild(a1);

		p.appendChild(document.createTextNode(" | "));

		const a2 = document.createElement("a");
		a2.textContent = "Google-таблица";
		a2.href = "https://docs.google.com/spreadsheets/d/18TWoG9vb0ASZxxs90RJ2Gk2D56ln6scGMYlCPW9T8GE/edit#gid=1239959726";
		p.appendChild(a2);

		const css_after = document.querySelector(".fc_vote");
		console.log(css_after);
		css_after.parentNode.insertBefore(p, css_after);
		//after.parentNode.insertBefore(document.createElement("br"), after);
	}
}
AddUnknownForecastLinks();

function AddWantedMonsterLinks() {
	const p_s = document.querySelectorAll("#content div.game div p:not([class]):not([id])");
	const wanted_ps = Array.from(p_s).filter(i => i.parentNode.previousSibling.previousSibling &&
		i.parentNode.parentNode.firstElementChild.textContent == "Разыскиваются");
	console.log("AddWantedMonsterLinks", wanted_ps);
	wanted_ps.forEach(p => {
		if (p.textContent.match(new RegExp("достойн.+наград", "g"))) {
			const div = document.createElement("div");
			div.style.display = "inline-grid";

			const a1 = document.createElement("a");
			a1.textContent = "Форум для рандомной награды";
			a1.href = "https://godville.net/forums/show_topic/4275?page=last";
			div.appendChild(a1);

			const z = document.createElement("z");
			z.textContent = "Спарсить данные при клике";
			z.onclick = (e) => {
				e.preventDefault();
				getPageFromUrl("https://godville.net/forums/show_topic/4275?page=last").then(html => {
					const posts = html.getElementsByClassName("post");
					const start_date = new Date();
					start_date.setUTCHours(-3, 6, 0);
					//meh TODO проверить работу между 0.00 и 0.06 МСК

					const _text_mas = [];
					for (const post of posts) {
						const post_date = Date.parse(post.querySelector("td.author.vcard > div.post_info > div.date > abbr").getAttribute('title'));
						const post_text = post.querySelector("td.body").textContent.replaceAll("\n", " ").trim();
						const post_author = post.querySelector("td.author.vcard > div.post_info > span.fn > span.u_link > a").textContent;
						//для вчерашних шкур в инвентаре, 3 часа
						if (post_date - start_date < 1000 * 60 * 60 * 3 && post_date > start_date - 1000 * 60 * 60 * 24) {
							if (_text_mas.length == 0) _text_mas.push("Вчера");
							_text_mas.push(`${post_author}[${new Date(post_date).toLocaleString("ru-Ru")}]: ${post_text}`);
						}
						//основной текст, сегодня
						if (post_date > start_date) {
							if (!_text_mas.some(t => t.includes("Сегодня"))) _text_mas.push("Сегодня");
							_text_mas.push(`${post_author}[${new Date(post_date).toLocaleString("ru-Ru")}]: ${post_text}`);
						}
					}
					console.log("inside z.onclick", _text_mas);
					z.innerHTML = _text_mas.map(i => "<p>" + i + "</p>").join("");
				}).catch(e => console.log(e));
			}
			div.appendChild(z);

			p.parentNode.appendChild(document.createElement("br"));
			p.parentNode.appendChild(div);
		}
	});
}
AddWantedMonsterLinks();

//bingo//
function UpdateBingo() {
	const l_clicks = document.getElementById("l_clicks");
	let p2 = document.getElementById("bingo_possible_price_next");
	if (!p2) {
		p2 = document.createElement("p");
		p2.id = "bingo_possible_price_next";
		//p2.style.display = "";
		l_clicks.parentNode.insertBefore(p2, l_clicks);
	}

	function Calc(s, full, big = forecast.includes("награда за бинго")) {
		const k = 0.5 + Number(full) * 0.5;
		const min = big ? Math.min(k * (200 + 300 * s), 20000) : Math.min(k * (500 + 100 * s), 7777);
		const max = big ? Math.min(k * (1700 + 300 * s), 20000) : Math.min(k * (1000 + 100 * s), 7777);

		return `${min} - ${max}`;
	}

	//UPDATE
	const score = Number(document.getElementById("b_score").textContent);
	if (score > 0) {
		document.getElementById("bgn_end").setAttribute("title", "Награда за досрочную сдачу " + Calc(score, false));
	}

	const n_score = document.getElementById("b_nscore").textContent;
	const n_score_sum = score + Number(n_score.slice(2));
	//запоминать досрочное\полное забирание
	const cnt = document.getElementById("l_rank").style.display == "none" ? Number(document.getElementById("b_cnt").textContent) : 0;
	p2.innerText = "";
	if (cnt > 0) {
		const c = (n_score_sum > score) ? cnt - 1 : cnt;
		if (c > 0) {
			p2.innerText = 'При будущем минимальном полном заполнении хотя бы единицами,\nза ' + (n_score_sum + 2 * c) +
				' очков получаем ' + Calc(n_score_sum + 2 * c, true);
		} else {
			p2.innerText = "При заполнении получаем " + Calc(n_score_sum, true);
		}
		if (n_score > 0) p2.innerText += ",\nза досрочный забор `Ой, всё`: " + Calc(n_score_sum, false);
	}

	console.log("UpdateBingo done");
}

function AddBingoListeners() {
	UpdateBingo();
	const bingo_target = document.getElementById("b_nscore");
	const bingo_config = {
		childList: true,
		characterData: true
	};
	const bingo_callback = function (mutationsList, observer) {
		UpdateBingo();
	};
	const bingo_observer = new MutationObserver(bingo_callback);
	bingo_observer.observe(bingo_target, bingo_config);

	document.getElementById("bgn_show").addEventListener("click", () => UpdateBingo());
	console.log("AddBingoListeners done");
}

function AddCondensatorThings() {
	let last_max = 0;
	let last_datetime = new Date();
	const max_perc = document.createElement("a");

	function cond_last_update(v) {
		last_max = (v) ? v : 0;
		last_datetime = new Date();
		max_perc.textContent = (v) ? `Максимум ${v} % в ` : "Очистили точку отсчета ";
		function addZero(i) {
			if (i < 10) { i = "0" + i }
			return i;
		}
		max_perc.textContent += `${addZero(last_datetime.getHours())
			}:${addZero(last_datetime.getMinutes())}:${addZero(last_datetime.getSeconds())} `;
	}

	let checkbox, input, div, button;
	if (document.getElementById("gp_cap_use").getAttribute("disabled") != "disabled") {
		input = document.createElement("input");
		input.id = "MyGV_chosen_perc";
		input.type = "number";
		input.min = 1;
		input.max = 200;
		input.value = '10';

		checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = "MyGV_AutoCond";
		checkbox.textContent = "Автозабирание выбранного процента";
		checkbox.onclick = function (e) {
			input.disabled = checkbox.checked;
			if (document.getElementById("gp_cap_use").getAttribute("disabled") == "disabled") {
				checkbox.checked = false;
			}
		}

		//https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#browser_compatibility
		if (checkbox) {
			window.addEventListener("beforeunload", function (e) {
				if (checkbox?.checked) {
					const confirmationMessage = `Поставлена задача по забиранию процента с праноконденсатора, 
				она требует эту открытую вкладку. Вы действительно хотите выйти?`;
					e.returnValue = confirmationMessage; //need for chrome
				}
			});
			console.log("add beforeunload event");
		}

		button = document.createElement("button");
		button.textContent = "🔕";
		button.onclick = function () {
			button.textContent = (button.textContent == "🔕") ? "🔔" : "🔕";
		}

		div = document.createElement("div");
		div.appendChild(checkbox);
		div.appendChild(document.createTextNode("Автозабирание "));
		div.appendChild(input);
		div.appendChild(document.createTextNode(" %"));
		div.appendChild(button);
		document.getElementById("gp_bat").parentNode.insertBefore(div, document.getElementById("gpc_block"));
	}

	//anyway creating forever working observer
	const cond_perc_obj = document.getElementById("gpc_val");
	const config = {
		childList: true,
		characterData: true
	};
	const cond_callback = function (mutationsList, observer) {
		/*
		if (div && document.getElementById("gp_bat").style.left == "0px"
			&& document.getElementById("gp_cap_use").getAttribute("disabled") == "disabled") {
			console.log(document.getElementById("gp_cap_use"), document.getElementById("gp_bat"));
			//cond_observer.disconnect();
			div.parentNode.removeChild(div);
			div = null;
			return;
		}
		*/

		//автоклик на update при долгом ожидании
		if (document.getElementById("gp_cap_r").style.display != "none") {
			console.log("update click");
			document.getElementById("gp_cap_r").click();
			//TODO REAL ONCLICK
			return;
		}
		const cond_perc = () => Number(cond_perc_obj.textContent.slice(0, -1));
		//console.log(cond_perc(), `% на момент времени: ...${ new Date().getSeconds() }s ${ new Date().getUTCMilliseconds() } ms`);

		//actions to click
		if (checkbox) {
			const chosen_perc = Number(input.value);
			function Check_conditions() {
				return (cond_perc() >= chosen_perc - 1 && checkbox.checked && chosen_perc > 0 && !document.getElementById("gp_cap_use").getAttribute("style"));
			}
			function DoActions() {
				document.getElementById("gp_cap_use").click();
				if (button.textContent == "🔔") {
					const sound = new Audio(chrome.runtime.getURL('Sound_16300.mp3'));
					sound.play();
				}
				checkbox.checked = false;

				//update_button.display = "none"; TODO_wtf?????
				console.log(document.getElementById("gpc_val").textContent, ` попытались забрать в ${new Date().getSeconds()}s ${new Date().getUTCMilliseconds()} ms`);
			}

			if (Check_conditions()) {
				//TODO параметр уставки из настроек
				setTimeout(function () {
					if (Check_conditions()) {
						DoActions();
					}
				}, 1000);
				//200, 500 мало
				//на 800 редко
				//1000 норм, но иногда не срабатывает //проверить, может, дело было в ошибке??
				//1500 ?
			}
		}

		//print maximum
		if (cond_perc() > last_max) cond_last_update(cond_perc());
	};
	cond_callback();
	const cond_observer = new MutationObserver(cond_callback);
	cond_observer.observe(cond_perc_obj, config);

	//"в праноконденсатор отправлено" -> выключение главного листенера
	const err = document.querySelector("#gpc_err");
	const err_callback = function (mutationsList, observer) {
		if (err.textContent.includes("В праноконденсатор отправлено")) {
			console.log("err_callback ", e);
			div.parentNode.removeChild(div);
			cond_observer.disconnect();
			observer.disconnect();
		}
	};
	const err_observer = new MutationObserver(err_callback);
	err_observer.observe(err, config);

	/*
	document.getElementById("MyGV_AutoCond").addEventListener("change", function (event) {
		if (event.currentTarget.checked) {
			input.disabled = true;
			//cond_callback()
		} else {
			input.disabled = false;
			//cond_observer.disconnect();
		}
	});
	*/

	//maximum
	const max_clear_button = document.createElement("button");
	max_clear_button.textContent = "↻";
	max_clear_button.onclick = () => cond_last_update();

	const max_div = document.createElement("div");
	document.getElementById("gp_bat").parentNode.insertBefore(max_div, document.getElementById("gpc_block"));
	max_div.appendChild(max_perc);
	max_div.appendChild(max_clear_button);
}

// Coupon things
function AddCouponThings() {
	const button = document.querySelector("#coupon_b");
	const coupon_text = document.querySelector("#cpn_name").innerText.replaceAll('\n', ' ').toLowerCase().trim();

	//даже не пытаемся добавлять элементы, если купон уже забран
	if (!button.disabled) {
		// observer on success button click for remove ats
		//срабатывает в случае, если кнопка недоступна (в дуэлях и при переключении режимов)
		const button_callback = function (mutationsList, observer) {
			console.log("button_callback inside");
			if (button.disabled) {
				Array.from(document.getElementsByClassName("my_div")).forEach(el => el.remove());
			}
		}
		const button_observer = new MutationObserver(button_callback);
		button_observer.observe(button, { attributes: true });

		// Observe table for adding ats if it was recorded by control btns: "bgn_show", "bgn_use"
		const coupon_callback = function (mutationsList, observer) {
			console.log("coupon_callback inside");
			if (!button.disabled) {
				Array.from(document.querySelectorAll("#bgn td")).forEach((tableElem) => {
					if (!tableElem.classList.contains("bgnk") && coupon_text.includes(tableElem.textContent)) {
						// Конструктор элемента @
						const at = document.createElement("a");
						at.textContent = "@";
						at.className = 'my_at';
						at.title = coupon_text;
						// Pushing at is pushing btn to take coupon
						at.addEventListener("click", () => {
							button.click();
						});
						const atdiv = document.createElement("div");
						atdiv.textContent = " (";
						atdiv.className = 'my_div';
						atdiv.appendChild(at);
						at.after(')');
						tableElem.appendChild(atdiv);
					}
				});
			}
		}
		const coupon_observer = new MutationObserver(coupon_callback);
		coupon_observer.observe(document.getElementById("bgn_t"), { childList: true });

		// First adding ats
		coupon_callback();
	}
	console.log("AddCouponListener done");
}

window.addEventListener('load', e => {
	AddBingoListeners();
	AddCrosswordThings();
	AddCondensatorThings();
	AddCouponThings();
});
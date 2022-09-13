/*
 * Сравнивает содержимое массива на... одинаковость
 *
 * @param {Array}   arr    Массив для проверки
 * @param {Boolean} strict Уровень проверки, дефолтно (false) - строгий (5 НЕ равно '5');
 *                         Если true - без проверки типов (5 БУДЕТ равно '5')
 *
 * @throws {Error} Если первый аргумент не является массивом, кидается ошибка
 *
 * @return {Boolean} Результаты проверки
 */
function compareArr(arr, strict) {
	let test,
		equal = strict ? (a, b) => a == b : (a, b) => a === b;

	if (!Array.isArray(arr))
		throw new Error(`It is not an array!`);

	try {
		arr.reduce(
			(prev, current) => {
				if (equal(current.toUpperCase(), prev.toUpperCase()))
					return current;
				else
					throw new Error(1);
			});

		test = true;
	} catch (e) {
		test = false;
	}

	//console.log(test, arr);
	return test;
}

//crossword
function AddCrosswordThings() {
	function FillWord(objs, z) {
		objs.forEach(function (o, _ind) {
			//console.log(`${o.getAttribute("class")}`);
			if (o.getAttribute("class") == "sym") {
				var x;
				if (typeof z == "string") {
					x = z[_ind];
				} else if (z.length == 1 || compareArr(Array.from(z).map(v => v[_ind]))) {
					if (o.value == "") x = z[0][_ind];
				}
				if (x !== undefined) {
					//console.log(`${x.toUpperCase()} ${o.getAttribute("id")}`);
					o.value = x.toUpperCase();
				}
			}
		});
	};

	function CheckCrosswordFullfilledState() {
		if (false || final_mas.every(z => z.array.every(x => x.status != "not filled"))) but.style.display = "none";
	}
	let cross = document.querySelector('.cross_q');
	let text_mas = cross.textContent.replaceAll("\n", "").replaceAll("\t", "").replaceAll("По горизонтали:", "").split("По вертикали:");
	let dir_mas = ['По горизонтали', 'По вертикали'];

	let final_mas = text_mas.map(function (i, _index) {
		let numbers = i.match(/\d+/g);
		let types = i.match(/[а-яА-Я ]{2,}/g);
		return {
			dir: dir_mas[_index], array: numbers.map(function (j, index) {
				return { index: j, value: types[index].trim(), status: "not filled" };
			})
		};
	});
	//TODO почистить от пользовательского мусора на всякий
	console.log("final_mas", final_mas);

	let but = document.createElement("button");
	but.textContent = "Заполнить";
	but.style = "margin: 10px";
	let cr = document.querySelector("#cross_block");
	cr.style = "text-align: center";
	let cr2 = document.querySelector("#twl_wrap");
	cr.insertBefore(but, cr2.parentNode);

	var pos_mas = [];
	var accuracy_level = 0;
	const url = chrome.runtime.getURL('./parsed_words_for_crossword.txt');
	fetch(url)
		.then(response => response.text())
		.then(data => {
			let diff_types_pos = [...data.matchAll(/^А.+/gim)];
			let last_pos = -100;
			for (let v of diff_types_pos) {
				if (v.index > last_pos) {
					pos_mas.push(v.index);
				}
				last_pos = v.index + v[0].length + 1;
			}
			pos_mas.push(data.length);
			console.log("pos_mas", pos_mas);

			but.addEventListener("click", function () {
				let time = new Date();
				if (time.getUTCHours() == 21 && time.getUTCMinutes() > 4 && time.getUTCMinutes() < 9) {
					alert("Слишком ранняя разгадка! Подождите до .10 минут");
					return;
				}

				let previous_mas = final_mas;
				for (let j of final_mas) {
					for (let i of j.array.filter(a => a.status == "not filled")) {
						i.objs = document.querySelectorAll(`[aria-label *= '${i.index} ${j.dir}']`);
						let _masks_mas = Array.from(i.objs).map(function (node) {
							var symb = (node.getAttribute("class") == "sym") ? node.value : node.innerHTML;
							if (symb == " ") return " ";
							if (symb == "Ё" || symb == "ё") return '[ЁЕ]';
							return (symb == "" || symb === undefined) ? "." : `${symb.toLowerCase()}`;
						});

						i.total_regex_mask = "^" + _masks_mas.join("");
						const types_mas = ['онстр', 'рофей', 'Умение', 'Снаряжение', 'Босс', 'Город'];
						let num = types_mas.findIndex(type => i.value.includes(type));
						let indexFirst = (accuracy_level > 1) ? 0 : pos_mas[num];
						let indexLast = (accuracy_level > 1) ? pos_mas[pos_mas.length - 1] : pos_mas[num + 1];

						if (accuracy_level < 2 && i.value.includes('Жирный')) i.total_regex_mask += "(?=\|\(.*bold.*\))";
						//Корован как Сильный монстр????
						i.match = data.substring(indexFirst, indexLast).match(new RegExp(i.total_regex_mask, "gim"));
						if (i.match != null) {
							i.match = Array.from(new Set(i.match));
						}
					}
				}
				//check Confilcts of mas.copy
				//construct total final_mas
				//break if equal

				console.log("final_mas", final_mas);

				//заполняем
				//уровни точности
				//на 0 итерацию - чистые маски
				//на 1 - дозаполняем найденным по новым маски с всем заполненным на 0
				//на 2 - ослабляем рамки, TODO ищем ложно заполненные
				for (let j of final_mas) {
					for (let i of j.array) {
						//общее множеств и одиночки
						if (i.match != null) {
							FillWord(i.objs, i.match);
							if (i.match.length == 1) i.status = "filled";
						}
					}
				}

				//на 2 - позволяем пользователю выбрать дубли оставшегося
				if (accuracy_level >= 3) {
					for (let j of final_mas) {
						for (let i of j.array.filter(a => a.match != null && a.match.length > 1)) {
							let b = document.createElement("button");
							b.style = "margin: 10px";
							b.textContent = `${i.index} ${j.dir}: ${i.match[0]}`;
							b.value = 0;
							FillWord(i.objs, i.match[0]);

							b.onclick = function () {
								this.value++;
								if (this.value > i.match.length - 1) this.value = 0;
								this.textContent = `${i.index} ${j.dir}: ${i.match[this.value]}`;
								FillWord(i.objs, i.match[this.value]);
							}

							cr.insertBefore(b, but);
							i.status = "user choose fill";
						}
					}
				}

				CheckCrosswordFullfilledState();
				if (previous_mas == final_mas) {
					accuracy_level++;
					console.log("Повышаем уровень точности:", accuracy_level);
					if (accuracy_level == 0) but.title = `Уровень ${accuracy_level}: Поиск по маске только внутри категории и строгая проверка дополнительных свойств (жирный трофей/сильный монстр)`;
					else if (accuracy_level == 1) but.title = `Уровень ${accuracy_level}: Поиск по маске во всем файле и строгая проверка дополнительных свойств (жирный трофей/сильный монстр)`;
					else but.title = `Уровень ${accuracy_level} (2+): Поиск по маске во всем файле и игнорирование доп свойств (жирный трофей/сильный монстр)`;
				}
			});
		});

	console.log("AddCrosswordThings done");
}
//прогноз//
let forecast = Array.from(document.querySelectorAll(".fc > p")).reduce((sum, i) => sum + i.textContent, "");
if (forecast.includes("но уточнять его содержимое астрологи отказываются")) {
	let p = document.createElement("p");

	let a1 = document.createElement("a");
	a1.textContent = "Форум для неизвестного прогноза";
	a1.href = "https://godville.net/forums/show_topic/3779?page=last";

	let a2 = document.createElement("a");
	a2.textContent = "Google-таблица";
	a2.href = "https://docs.google.com/spreadsheets/d/18TWoG9vb0ASZxxs90RJ2Gk2D56ln6scGMYlCPW9T8GE/edit#gid=1239959726";

	let after = document.querySelector(".fc_vote");
	p.appendChild(a1);
	p.appendChild(document.createTextNode(" | "));
	p.appendChild(a2);
	after.parentNode.insertBefore(p, after);
	//after.parentNode.insertBefore(document.createElement("br"), after);
}

async function getPageFromUrl(url) {
	let response = await fetch(url);
	const html_text = await response.text();
	const parser = new DOMParser();
	const html = parser.parseFromString(html_text, "text/html");
	return html;
}

//разыскиваемый
let p_s = document.querySelectorAll("#content div.game div p:not([class]):not([id])");
let wanted_ps = Array.from(p_s).filter(i => i.parentNode.previousSibling.previousSibling != null &&
	i.parentNode.parentNode.firstElementChild.textContent == "Разыскиваются");
console.log(wanted_ps);
if (Array.from(wanted_ps).some(p => p.textContent.match(new RegExp("достойн.+наград", "g")))) {
	let div = document.createElement("div");
	div.style.display = "inline-grid";

	let a1 = document.createElement("a");
	a1.textContent = "Форум для рандомной награды";
	a1.href = "https://godville.net/forums/show_topic/4275?page=last";
	div.appendChild(a1);

	let z = document.createElement("z");
	z.textContent = "Спарсить данные при клике";
	z.onclick = (event) => {
		getPageFromUrl("https://godville.net/forums/show_topic/4275?page=last").then(html => {
			let posts = html.getElementsByClassName("post");
			let start_date = new Date();
			start_date.setUTCHours(-3, 6, 0);
			//meh TODO проверить работу между 0.00 и 0.06 МСК

			let _text_mas = [];
			for (const post of posts) {
				let post_date = Date.parse(post.querySelector("td.author.vcard > div.post_info > div.date > abbr").getAttribute('title'));
				let post_text = post.querySelector("td.body").textContent.replaceAll("\n", " ").trim();
				let post_author = post.querySelector("td.author.vcard > div.post_info > span.fn > span.u_link > a").textContent;
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
			z.innerHTML = _text_mas.map(i => "<p>" + i + "</p>").join("");
		}).catch(e => console.log(e));
		event.preventDefault();
	}
	div.appendChild(z);

	let hero_clearfixes = document.querySelectorAll("#content .hero.clearfix");
	let filtered_hero_clearfixes = Array.from(hero_clearfixes).filter(i => i.firstElementChild.textContent == "Идёт набор");
	if (filtered_hero_clearfixes.length == 1) {
		filtered_hero_clearfixes[0].parentNode.insertBefore(div, filtered_hero_clearfixes[0]);
	}
}

//bingo//
function UpdateBingo() {
	const l_clicks = document.getElementById("l_clicks");
	let p2 = document.getElementById("bingo_possible_price_next");
	if (p2 == null) {
		p2 = document.createElement("p");
		p2.id = "bingo_possible_price_next";
		//p2.style.display = "";
		l_clicks.parentNode.insertBefore(p2, l_clicks);
	}

	function Calc(s, full, big = forecast.includes("награда за бинго")) {
		let k = 0.5 + Number(full) * 0.5;
		let min = big ? Math.min(k * (200 + 300 * s), 20000) : Math.min(k * (500 + 100 * s), 7777);
		let max = big ? Math.min(k * (1700 + 300 * s), 20000) : Math.min(k * (1000 + 100 * s), 7777);

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
	let cnt = document.getElementById("l_rank").style.display == "none" ? Number(document.getElementById("b_cnt").textContent) : 0;
	p2.innerText = "";
	if (cnt > 0) {
		let c = (n_score_sum > score) ? cnt - 1 : cnt;
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
	let bingo_target = document.getElementById("b_nscore");
	let bingo_config = {
		childList: true,
		characterData: true
	};
	let bingo_callback = function (mutationsList, observer) {
		UpdateBingo();
	};
	let bingo_observer = new MutationObserver(bingo_callback);
	bingo_observer.observe(bingo_target, bingo_config);

	document.getElementById("bgn_show").addEventListener("click", () => UpdateBingo());
	console.log("AddBingoListeners done");
}

function AddCondensatorThings() {
	let last_max = 0;
	let last_datetime = new Date();
	let max_perc = document.createElement("a");

	function cond_last_update(v) {
		last_max = (v == null) ? 0 : v;
		last_datetime = new Date();
		max_perc.textContent = (v == null) ? "Очистили точку отсчета " : `Максимум ${v} % в `;
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
	let cond_perc_obj = document.getElementById("gpc_val");
	let config = {
		childList: true,
		characterData: true
	};
	let cond_callback = function (mutationsList, observer) {
		/*
		if (div != undefined && div != null && document.getElementById("gp_bat").style.left == "0px"
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
		let cond_perc = () => Number(cond_perc_obj.textContent.slice(0, -1));
		//console.log(cond_perc(), `% на момент времени: ...${ new Date().getSeconds() }s ${ new Date().getUTCMilliseconds() } ms`);

		//actions to click
		if (checkbox != undefined) {
			let chosen_perc = Number(input.value);
			function Check_conditions() {
				return (cond_perc() >= chosen_perc - 1 && checkbox.checked && chosen_perc > 0 && document.getElementById("gp_cap_use").getAttribute("style") == null);
			}
			if (Check_conditions()) {
				//TODO параметр уставки из настроек
				setTimeout(function () {
					if (Check_conditions()) {
						document.getElementById("gp_cap_use").click();
						if (button.textContent == "🔔") {
							var sound = new Audio(chrome.runtime.getURL('Sound_16300.mp3'));
							sound.play();
						}
						checkbox.checked = false;

						//update_button.display = "none"; TODO_wtf?????
						console.log(document.getElementById("gpc_val").textContent, ` попытались забрать в ${new Date().getSeconds()}s ${new Date().getUTCMilliseconds()} ms`);
					}
				}, 1500);
				//200, 500 мало
				//на 800 редко
				//1000 норм, но иногда не срабатывает
				//1500 ?
			}
		}

		//print maximum
		if (cond_perc() > last_max) cond_last_update(cond_perc());
	};
	cond_callback();
	let cond_observer = new MutationObserver(cond_callback);
	cond_observer.observe(cond_perc_obj, config);

	//"в праноконденсатор отправлено" -> выключение главного листенера
	let err = document.querySelector("#gpc_err");
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
	let max_clear_button = document.createElement("button");
	max_clear_button.textContent = "↻";
	max_clear_button.onclick = () => cond_last_update();

	let max_div = document.createElement("div");
	document.getElementById("gp_bat").parentNode.insertBefore(max_div, document.getElementById("gpc_block"));
	max_div.appendChild(max_perc);
	max_div.appendChild(max_clear_button);
}

window.addEventListener('load', e => {
	AddBingoListeners();
	AddCrosswordThings();
	AddCondensatorThings();
});
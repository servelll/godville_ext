//for:
//https://gv.erinome.net/duels/log/apq4exf4c (forever, find any at https://gv.erinome.net/duels/log)
//https://godville.net/duels/log/apq4exf4c (expired 3 month)
//https://gdvl.tk/duels/log/apq4e

class PolygonLog {
	directions_symbols = ["⇡", "⇠", "", "⇢", "⇣"];

	MatchLabelsWithSubindexes(index) {
		if (d[index].length == 4) return let_mas.reduce(function (accumulator, currentValue, index) {
			accumulator[index] = currentValue;
			return accumulator;
		}, {});

		//if ()
	}

	AddPolygonObjects() {
		condition_text = document.getElementById("rah")?.innerHTML;

		//load d (mas of all turns)
		const scriptdata = document.querySelector("div.c_left > script").innerHTML;
		const re = /var d = [^;]+;/g;
		const var_to_eval = re.exec(scriptdata)[0].replaceAll('var d = ', '').replaceAll(";", "");
		d = JSON.parse(var_to_eval);
		console.log("Полигон! d=", d);

		//[0-39] [0-3]
		for (let index = 0; index < d.length; index++) {
			pushes_percents_table[index] = {};
			let MatchesTable = MatchLabelsWithSubindexes();
			for (let subindex = 0; subindex < d[index].length; subindex++) {
				fillPushesAtThisSubstep(index, MatchesTable[subindex]);
			}
		}
		console.log(pushes_percents_table);

		//сабход
		document.querySelector(".step_capt").appendChild(document.createTextNode('; сабшаг[0-3] = '));
		let s1 = document.createElement("span");
		s1.id = "subturn_num";
		document.querySelector(".step_capt").appendChild(s1);

		//буква ласт сабхода
		document.querySelector(".step_capt").appendChild(document.createTextNode('; последний ход босса '));
		let s2 = document.createElement("span");
		s2.id = "subturn_let";
		document.querySelector(".step_capt").appendChild(s2);

		//Проценты толчка
		for (const boss_row of document.getElementsByClassName("c1")) {
			let z = document.createElement("div");
			z.class = "push";
			z.id = "push_" + boss_row.firstChild.textContent[0];
			boss_row.appendChild(z);
		}

		//логгер снизу
		let s = document.createElement("div");
		s.id = 'AGDv_log_text';
		s.style = "padding-top:0.5em; text-align:center;";
		document.querySelector(".c_left").insertAdjacentElement('beforeend', s);
		UpdatePolygon(e);

		var target = document.getElementById('content');
		const observer = new MutationObserver((mutationsList, observer) => UpdatePolygon(mutationsList));
		observer.observe(target, { attributes: true });
	}

	UpdatePolygon(e) {
		//sub_step calculate & write
		step = document.getElementById("turn_num").textContent;
		let sub_step, sub_step_let;
		const bossesObjs = document.getElementsByClassName("rmb");
		let currentBossesXPandPOS = Array.from(bossesObjs).map(function (i) {
			return [
				i.firstChild.textContent,
				parseInt(document.getElementById(`pl_${i.firstChild.textContent.toLowerCase()}_hp`).textContent),
				Array.from(i.parentNode.children).indexOf(i),
				Array.from(document.getElementsByClassName("rml")).indexOf(i.parentNode)
			];
		});
		currentBossesXPandPOS.sort((a, b) => a[0].localeCompare(b[0]));
		//console.log("currentBossesXPandPOS", currentBossesXPandPOS);

		//TO DEL? calculate substep by (xp + position)
		for (const currentSubStepDValue of d[step - 1]) {
			const BossesPOSFromD = GetPosAndXPFromD(currentSubStepDValue);
			//console.log("BossesPOSFromD", BossesPOSFromD);
			if (currentBossesXPandPOS.equals(BossesPOSFromD)) {
				sub_step = d[step - 1].indexOf(currentSubStepDValue);
				break;
			}
		}

		//calculate letter
		if (step == 1) {
			sub_step_let = "-";
		}
		else {
			sub_step_let = pushes_percents_table[step - 1];
		}

		document.getElementById("subturn_num").textContent = sub_step ?? "???";
		document.getElementById("subturn_let").textContent = sub_step_let ?? "?";

		//push_value write
		for (const b of bossesObjs) {
			b.title += `; заряд = ${pushes_percents_table[step - 1][sub_step][b.firstChild.textContent]}%`;
		}

		let s = document.getElementById('AGDv_log_text');
		//TODO всего неразведано
		//s.textContent = ;
		//console.log("UpdatePolygon(e)", e);
	}
}

function UpdateSails(e) {
	step = document.getElementById("slider").value;

	if (e === undefined) return;
	for (let mutation of e) {
		if (mutation.type === 'childList') {
			console.log(mutation, 'A child node has been added or removed.');
		}
	}
}

let header = document.querySelector("#wrap > div.lastduelpl > span > a");
if (header?.textContent == "Полигон") {
	let header2 = document.getElementsByClassName("lastduelpl");
	if (header2.length > 0 && header2[header2.length - 1].textContent.includes("прямая трансляция")) {
		let z = document.createElement("div");
		z.textContent = "Во время прямой трансляции невозможно получать данные из лога полигона";
		document.querySelector(".lastduelpl_f")?.appendChild(z);
	} else {
		window.addEventListener('load', e => {
			let polygon = new PolygonLog();
			polygon.AddPolygonObjects();
		});
	}

}
if (header?.textContent == "Заплыв") {
	//запрос к логу тогда (для поиска цвета близкой рыбы), когда есть смысл
	//когда один остался нет смысла тоже
	//если рыба одна тоже не надо
	window.addEventListener('load', e => {
		UpdateSails();

		var target = document.getElementById("sail_map");
		const observer = new MutationObserver((mutationsList, observer) => UpdateSails(mutationsList));
		observer.observe(target, { childList: true, subtree: true });
	});
}
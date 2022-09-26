//if (chrome) browser = chrome;

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
    var request = new XMLHttpRequest();
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

//полигон
var d;
var pushes_percents_table = [];
let let_mas = ["A", "B", "C", "D"];

function GetPrevSubIndexs(index, subindex) {
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

function GetPosAndXPFromD(currentSubStepDValue) {
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

function fillPushesAtThisSubstep(index, subindex, submove_owner_letter) {
    pushes_percents_table[index][submove_owner_letter] = {};

    let prevsub = GetPrevSubIndexs(index, subindex);
    if (submove_owner_letter == undefined) {
        submove_owner_letter = alive_boss_letters[subindex];


        pushes_percents_table[index][submove_owner_letter].subindex = subindex;
    }

    //далее, итерация только по submove_owner_letter, subindex и d[subindex] не используем
}


/*function getArrayViaFrom(dim1, dim2) {
    //console.time('Execution Time');
    let output = Array.from(Array(dim1), () => Array[dim2]);
    //console.timeEnd('Execution Time');
    return output;
  }*/

function getArrayViaFor(dim1, dim2) {
    //console.time('Execution Time 1');
    let output = [];
    for (let i = 1; i <= dim1; i++) {
        output.push(Array(dim2));
    }
    //console.timeEnd('Execution Time 1');
    return output;
}

/*function createArray(length) {
    let arr = new Array(length || 0),
        i = length;
    if (arguments.length > 1) {
        let args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }
    return arr;
}

  console.time('Execution Time 1');
  console.log(getArrayViaFrom(100)) // Takes 10x more than for that is 0.220ms
  console.timeEnd('Execution Time 1')
  console.time('Execution Time 1');
  console.log(getArrayViaFor(100))  // Takes 10x less than From that is 0.020ms
  console.timeEnd('Execution Time 1')
  console.time('Execution Time 1');
  console.log(createArray(100, 1))
  console.timeEnd('Execution Time 1'); */

let miniQuestsObj = {
    newquests: {
        recency: 'новый мини-квест',
        quests: []
    },
    oldquests: {
        recency: 'старый мини-квест',
        quests: []
    }
}

async function getPageFromUrl(url) {
	let response = await fetch(url);
	const html_text = await response.text();
	const parser = new DOMParser();
	const html = parser.parseFromString(html_text, "text/html");
	return html;
}

async function parseMiniQuestsTitles(link) {
    let html      = await getPageFromUrl(link);
    let raw_data  = html.querySelector("#post-body-1560386").textContent;
    let data      = raw_data.slice(raw_data.indexOf('Старые мини-квесты') + 18).replace("\nНовые мини-квесты", ' * Metka * ').replace('\n', '').trim();
    let rawMass   = data.split(' * ');
    let oldQuests = rawMass.slice(0, rawMass.indexOf('Metka'));
    let newQuests = rawMass.slice(rawMass.indexOf('Metka') + 1);
    return { oldQuests, newQuests: newQuests };
}

function fillMiniQuestsBlanks(fromArr, toArr, regy) {
    fromArr.forEach(function (el, index) {
        toArr[index] = { blank: [] };
        if (el.includes('(в этом мини-квесте часто этапы меняются местами)')) {
            toArr[index].warning = '(в этом мини-квесте часто этапы меняются местами)';
        }
        el.match(regy).forEach(function (item) {
            toArr[index]['blank'].push(item.trim());
        });
    });
}

function fillMiniQuestsTitles() {
    parseMiniQuestsTitles("https://godville.net/forums/show_topic/2460?page=254#post_1560386").then(mini_quests => {
        let regy = /([А-ЯЁ0-9][^\→]+)(?=(\→|$))/gi;
        //let godvilleMiniQuests = getArrayViaFor(mini_quests['oldQuests'].length + mini_quests['newQuests'].length, 0);
        //let rawMass = mini_quests.oldQuests.concat(mini_quests.newQuests);
        fillMiniQuestsBlanks(mini_quests.oldQuests, miniQuestsObj['oldquests']['quests'], regy);
        fillMiniQuestsBlanks(mini_quests.newQuests, miniQuestsObj['newquests']['quests'], regy);
        //console.log(JSON.stringify(miniQuestsObj));
        //localStorage.setItem('godvilleMiniQuests', JSON.stringify(godvilleMiniQuests));
        localStorage.setItem('AutoGV_miniQuests', JSON.stringify(miniQuestsObj));
        let data = new Date();
        //"mini_quests_time"
    });
}

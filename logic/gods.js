if (document.URL.slice(-5) != ".json") {
    //equip
    let eq_mas = Array.from(document.querySelectorAll("#equipment tr .value"));
    let sum = eq_mas.reduce((acc, i) => acc + (i.textContent != "" ? parseInt(i.textContent) : -11), 0);
    let count = eq_mas.filter(i => i.textContent != "").length;
    let middle = (sum / count).toFixed(1);
    let lvl = parseInt(document.querySelector("#essential_info > p.level").textContent);
    let v1 = Math.round(30 * (sum + 77) / 7);
    let text1 = `Сумма [${sum}]/${count}; Очков мастерства [${v1}]`;
    let text2 = `Среднее [${middle}]; Относительно уровня [${(middle - lvl).toFixed(1)}]`;
    document.querySelector("#column_2").insertBefore(document.createElement("br"), document.querySelector("#column_2 > div"));
    document.querySelector("#column_2").insertBefore(document.createTextNode(text1), document.querySelector("#column_2 > div"));
    document.querySelector("#column_2").insertBefore(document.createElement("br"), document.querySelector("#column_2 > div"));
    document.querySelector("#column_2").insertBefore(document.createTextNode(text2), document.querySelector("#column_2 > div"));

    //skills
    let v3 = 0;
    let where2 = document.querySelector("#column_2 > .b_list");
    if (where2 != null) {
        let sk_mas = Array.from(where2.querySelectorAll("li span"));
        let sum2 = sk_mas.reduce((acc, i) => acc + (i.textContent != "" ? parseInt(i.textContent) : 0), 0);
        v3 = (10 * sum2);
        let text4 = `Очков мастерства [${v3}]`;
        document.querySelector("#column_2").appendChild(document.createElement("br"));
        document.querySelector("#column_2").appendChild(document.createTextNode(text4));

        let text5 = `Деньги [${500 * parseInt(sk_mas[sk_mas.length - 1].textContent) + 500} - ${500 * parseInt(sk_mas[0].textContent) + 500}]`;
        document.querySelector("#column_2").appendChild(document.createElement("br"));
        document.querySelector("#column_2").appendChild(document.createTextNode(text5));
    }

    let tr_mas = Array.from(document.querySelectorAll("#panteons > tbody > tr"));
    let master_pantheon = tr_mas.filter(i => i.innerText.includes("Мастерства"));
    if (master_pantheon.length == 1) {
        let _sum = document.createElement("z");
        _sum.className = "_sum";
        _sum.textContent = ` [${v1 + v3}]`;
        master_pantheon[0].querySelector(".name").appendChild(_sum);
    }

    //hp
    let lvl_1 = document.querySelector("#essential_info > p.level").firstChild;
    let z = document.createElement("z");
    z.title = `${4 * lvl + 96} hp`;
    z.textContent = lvl_1.textContent;
    lvl_1.replaceWith(z);

    let first_mas = Array.from(document.querySelectorAll("#characteristics > tbody > tr"));
    //age time
    let age_obj = first_mas.filter(td => td.firstElementChild.textContent.includes("Возраст"));
    if (age_obj != null) { //никогда, но почему нет
        let age_clear_text = age_obj[0].lastElementChild.firstChild.textContent;
        let age_mas = age_clear_text.split(" ");
        let age_hours = age_mas[age_mas.findIndex(i => i.includes("час")) - 1];
        let age_days = age_mas[age_mas.findIndex(i => i.includes("дн") || i.includes("ден")) - 1];
        let age_month = age_mas[age_mas.findIndex(i => i.includes("мес")) - 1];
        let age_years = age_mas[age_mas.findIndex(i => i.includes("год") || i.includes("лет")) - 1];

        let d2 = moment();
        let date1_structure = {};
        if (age_hours != undefined) date1_structure.hours = age_hours;
        if (age_days != undefined) date1_structure.days = age_days;
        if (age_month != undefined) date1_structure.month = age_month;
        if (age_years != undefined) date1_structure.years = age_years;
        d2.subtract(date1_structure);

        let d1 = d2.clone();
        let birth_approx;
        if (age_years != undefined) {
            d1.subtract(1, 'month');
            birth_approx = "месяц";
        } else if (age_month != undefined || age_days != undefined) {
            d1.subtract(1, 'day');
            birth_approx = "день";
        } else {
            d1.subtract(1, 'hour');
            birth_approx = "час";
        }
        let birth_approx_text = `Дата-время регистрации [${d1.format("DD.MM.YYYY HH:mm")} - ${d2.format("DD.MM.YYYY HH:mm")}], погрешность 1 ` + birth_approx;
        age_obj[0].lastElementChild.title = birth_approx_text;

        //pure days - date of birth
        let total_days_obj = document.querySelector("#characteristics div.d_date");
        let d3, d4;
        if (total_days_obj != null) {
            let total_days = Number(total_days_obj.textContent.match(/\d+/)[0]);
            d4 = moment().subtract({ days: total_days });
            d3 = d4.clone();
            d3.subtract(1, 'day');
            total_days_obj.title = `Дата-время регистрации [${d3.format("DD.MM.YYYY HH:mm")} - ${d4.format("DD.MM.YYYY HH:mm")}]`;
            total_days_obj.title += `\nДнем рождения считается ${d3.format("DD.MM.YYYY")}?`;
            birth_approx = "день";
        }
        let birth_d1 = (total_days_obj != null) ? d3 : d1;
        let birth_d2 = (total_days_obj != null) ? d4 : d2;

        function getBetterRussianHumanizedDurationText(dur) {
            let m = [];
            if (dur.years() != 0) {
                if (dur.years() == 1) m.push(dur.years() + " год");
                else if (dur.years() == 2 || dur.years() == 3 || dur.years() == 4) m.push(dur.years() + " года");
                else m.push(dur.years() + " лет");
            }
            if (dur.months() != 0) {
                if (dur.months() == 1) m.push(dur.months() + " месяц");
                else if (dur.months() == 2 || dur.months() == 3 || dur.months() == 4) m.push(dur.months() + " месяца");
                else m.push(dur.months() + " месяцев");
            }
            if ((dur.days() != 0) && (birth_approx == "месяц" || birth_approx == "день" || birth_approx == "час")) {
                if (dur.days() == 1 || dur.days() == 21 || dur.days() == 31) m.push(dur.days() + " день");
                else if (dur.days() == 2 || dur.days() == 3 || dur.days() == 4 || dur.days() == 22 || dur.days() == 23 || dur.days() == 24) m.push(dur.days() + " дня");
                else m.push(dur.days() + " дней");
            }
            if ((dur.hours() != 0) && (birth_approx == "день" || birth_approx == "час")) {
                if (dur.hours() == 1 || dur.hours() == 21) m.push(dur.hours() + " час");
                else if (dur.hours() == 2 || dur.hours() == 3 || dur.hours() == 4 || dur.hours() == 22 || dur.hours() == 23 || dur.hours() == 24) m.push(dur.hours() + " часа");
                else m.push(dur.hours() + " часов");
            }
            return m.join(" ");
        }

        function AddDurationObjs(first_date, hint, place_to, search, start_dates) {
            let span_dt = Array.from(document.querySelectorAll(".t_award_dt")).filter(i => i.textContent.match(new RegExp(search, "gi")));

            let p = document.createElement("div");
            p.className = "duration_div";

            let date_text = (span_dt.length == 1) ? span_dt[0].textContent.match(/\d+\.\d+\.\d+ \d+\:\d+/) : null;
            let d_text = (span_dt.length == 0 || date_text == null) ? "уже" : "за";
            let d = (span_dt.length == 0 || date_text == null) ? moment() : moment(date_text[0].trim(), 'DD.MM.YYYY HH:mm');

            let current_dates = (start_dates == null) ? { d1: birth_d1, d2: birth_d2, approx: birth_approx, hint: "регистрации" } : start_dates;

            if (current_dates.d1 == null) return { d1: null, hint: hint }; //escape future calculations
            if (current_dates.d1 > first_date) {
                if (start_dates == null) {
                    p.title = "Погрешность 1 " + birth_approx + " от возраста";
                }
            }

            let duration_max = moment.duration(d.diff(moment.max(first_date, current_dates.d1)));
            if (moment.max(first_date, current_dates.d1) < d) {
                let bool_equal_durations = false;
                let duration_min;
                if (current_dates.approx != undefined) {
                    duration_min = moment.duration(d.diff(moment.max(first_date, current_dates.d2)));
                    bool_equal_durations = (duration_max.asMilliseconds() == duration_min.asMilliseconds());
                }
                if (current_dates.approx == undefined || bool_equal_durations) {
                    p.textContent = `${d_text} ${getBetterRussianHumanizedDurationText(duration_max)}`;
                } else {
                    p.textContent = `${d_text} [${getBetterRussianHumanizedDurationText(duration_min)} - ${getBetterRussianHumanizedDurationText(duration_max)})`;
                }
            } else {
                p.textContent = `максимум за ${getBetterRussianHumanizedDurationText(duration_max)}`;
                age_obj[0].lastElementChild.title += `\nС поправкой на дату ${hint} [${d.format("DD.MM.YYYY HH:mm")} - ${current_dates.d1.format("DD.MM.YYYY HH:mm")}], погрешность 1 ` + birth_approx;
            }

            if (p.title != "") p.title += ";\n";
            p.title += `Отсчёт ведем с ${moment.max(first_date, current_dates.d1).format("DD.MM.YYYY HH:mm")} - `;
            p.title += (current_dates.d1 > first_date) ? "даты " + current_dates.hint : "момента начала " + hint + " у всех";

            let tr_constructed = first_mas.filter(i => i.firstElementChild.textContent.match(new RegExp(place_to, "gi")));
            if (tr_constructed.length == 1) {
                let td_constructed = tr_constructed[0].firstElementChild;
                td_constructed.appendChild(p);
            }

            return { d1: (d_text == "уже") ? null : d, hint: hint };
        }

        //temple time
        let temple_start = moment("15.03.2009 18:14", 'DD.MM.YYYY HH:mm');
        let temple_dates = AddDurationObjs(temple_start, "постройки храма", 'храм', 'Храмовник');
        //https://godville.net/gods/%D0%A1%D0%B5%D0%BB%D0%B5%D1%81%D1%82%D0%B8%D0%BD%D0%B0

        //ark time
        let ark_start = moment("04.07.2013 14:27", 'DD.MM.YYYY HH:mm');
        let ark_dates = AddDurationObjs(ark_start, "постройки ковчега", 'ковчег', 'Корабел', temple_dates);

        let pairs_start = moment("02.10.2015 12:59", 'DD.MM.YYYY HH:mm');
        let pairs_dates = AddDurationObjs(pairs_start, "сбора тварей", 'твари', 'Тваревед', ark_dates);
        //рекорд https://godville.net/gods/%D0%A4p%D0%B0%D0%BD%D0%BA

        let boss = first_mas.filter(i => i.firstElementChild.textContent.includes("Босс"));
        let book_dates;
        if (boss.length == 1) {
            let book_start = moment("20.08.2019 16:16", 'DD.MM.YYYY HH:mm');
            book_dates = AddDurationObjs(book_start, "написания книги", 'книг', 'Книжник', pairs_dates);
        }

        let trade_start = moment("18.07.2012 16:16", 'DD.MM.YYYY HH:mm');
        AddDurationObjs(trade_start, "постройки лавки", 'сбережения', 'Лавочник', temple_dates);

        let souls_start = moment("02.03.2022 15:16", 'DD.MM.YYYY HH:mm');
        AddDurationObjs(souls_start, "собирания всех душ", 'душ', 'Душевник', book_dates);

        //
        //tests
        //https://godville.net/gods/%D0%93%D0%B0%D1%86%D1%83%D1%86%20%D0%92%D0%B5%D0%BB%D0%B8%D0%BA%D0%B8%D0%B9
        //https://godville.net/gods/Servelll

    }
}
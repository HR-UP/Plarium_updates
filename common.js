let $old_default_letter_tx = "Цель проведения опроса «360 градусов»\n" +
    "\n" +
    "Целью опроса является помощь в развитии корпоративных и менеджерских компетенций оцениваемым сотрудникам.\n" +
    "Опрос «360 градусов» позволяет оцениваемому сотруднику получить всестороннюю обратную связь о том, как другие люди организации воспринимают уровень развития его компетенций. " +
    "На основании этой информации можно определить дополнительные возможности развития лидерского и менеджерского потенциала.\n" +
    "\n" +
    "Суть метода опрос «360 градусов»\n" +
    "\n" +
    "Участникам опроса «360 градусов» предлагается заполнить структурированный опросник, отражающий различные аспекты " +
    "менеджерского и лидерского стиля деятельности оцениваемого сотрудника.\n" +
    "При проведении опроса опрашиваются: сам оцениваемый сотрудник, его руководитель, коллеги и подчиненные.\n" +
    "\n" +
    "Опрос проводится Компанией ...\n" +
    "Этапы проведения опроса «360 градусов»\n" +
    "Сотрудники принимающие участие в опросе, получают письма приглашения и заполняют индивидуальные анонимные опросники в электронном формате. " +
    "Таким образом, Ваши ответы поступают непосредственно в компанию, чем обеспечивается полная конфиденциальность процесса. " +
    "Результаты опроса будут консолидироваться и обрабатываться автоматически и доступны только консультантам компании.\n" +
    "По результатам опроса каждого оцениваемого сотрудника будет создан индивидуальный отчет. " +
    "В отчете будут отражены обобщенные результаты оценки по отдельным группам сотрудников: руководителей, коллег и подчиненных оцениваемого сотрудника.\n" +
    "Чтобы пройти опрос перейдите, пожалуйста, по данной ссылке %LINK% \n" +
    "Если у Вас возникнут вопросы, Вы можете обратиться к координатору проекта.";

let $default_letter_tx = "Привет!\n\n" +
    "Приглашаем тебя заполнить опрос по взаимодействию с сотрудником: %ФИО%. " +
    "Это поможет твоему коллеге выявить свои сильные и слабые стороны и понять, как ему следует развиваться дальше.\n\n" +
    "Опрос полностью конфиденциален, поэтому, пожалуйста, отвечай честно. Если ты не знаешь, как в той или иной ситуации поступает коллега, выбирай ответ 'Не владею информацией'.\n\n" +
    "На заполнение анкеты у тебя уйдет не более 15–20 минут.\n\n" +
    "Будем ждать твои ответы до %ДАТА%.\n\n" +
    "Чтобы пройти опрос, перейди по ссылке.\n\n" +
    "##ПЕРЕЙТИ##\n\n";

let $default_letter_head = "Участие в оценке методом 360 градусов";

//****------------------------------------------------------------------------------------------------------------------
function getUrlValue($param){
    let $x = location.search.indexOf($param+"=");
    if ($x !== -1) {
        $x = location.search.substring(location.search.indexOf($param + "=") + $param.length + 1);
        if ($x && $x.indexOf("&") !== -1) $x = $x.substring(0, $x.indexOf("&"));
    }
    if ($x && $x !== -1) return $x;
    else return null;
}
//****------------------------------------------------------------------------------------------------------------------
function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


//****------------------------------------------------------------------------------------------------------------------
function timestamp_from_date($date, $reverse)
{
    // common: we got format $date[0] - day, $date[1] - month, $date[2] - year
    let stamp;
    if (!$reverse)
    {
        stamp = $date;
        for (let i=0; i<stamp.length; i++)
            stamp[i] *= 1;
        //console.log(stamp);
        $date = new Date();
        $date.setFullYear(stamp[2], stamp[1]-1, stamp[0]); // month goes 0..11
        stamp = math_floor($date.getTime() / 1000, 0);
    }
    // timestamp to date
    else
    {
        stamp = "";
        let tx_date = new Date();
        if ($date)
            tx_date.setTime($date * 1000);
        // Day format
        if (tx_date.getDate() < 10)
            stamp += '0' + tx_date.getDate();
        else
            stamp += tx_date.getDate();
        stamp += ".";
        // Month format
        if (tx_date.getMonth() + 1 < 10)
            stamp += '0' + (tx_date.getMonth() + 1);
        else
            stamp += tx_date.getMonth() + 1;
        stamp += "." + tx_date.getFullYear();
    }

    return stamp;
}
//****------------------------------------------------------------------------------------------------------------------
function decode_timestamp($timeStamp, $flags)
{
    let date = new Date();
    if ($timeStamp)
        date.setTime($timeStamp * 1000);
    let exStr = "";
    // DAY --------------------------------------------
    if ($flags === undefined || $flags.indexOf("no_span") === -1)
        exStr += "<span class='date_day'>";
    // Day format
    if (date.getDate() < 10)
        exStr += '0' + date.getDate();
    else
        exStr += date.getDate();
    exStr += ".";
    // Month format
    if (date.getMonth()*1 + 1 < 10)
        exStr += '0' + (date.getMonth() + 1);
    else
        exStr += date.getMonth() + 1;
    exStr += "." + date.getFullYear() + " ";
    if ($flags === undefined || $flags.indexOf("no_span") === -1)
        exStr += "</span>";

    if ($flags === undefined || $flags.indexOf("no_time") === -1)
    {
        // TIME --------------------------------------------
        if ($flags === undefined || $flags.indexOf("no_span") === -1)
            exStr += "<span class='date_time'>";
        if (date.getHours() < 10)
            exStr += '0' + date.getHours();
        else
            exStr += date.getHours();
        exStr += ":";
        if (date.getMinutes() < 10)
            exStr += '0' + date.getMinutes();
        else
            exStr += date.getMinutes();
        exStr += ":";
        if (date.getSeconds() < 10)
            exStr += '0' + date.getSeconds();
        else
            exStr += date.getSeconds();
        if ($flags === undefined || $flags.indexOf("no_span") === -1)
            exStr += "</span>";
    }

    return exStr;
}
//****------------------------------------------------------------------------------------------------------------------
function math_floor(val, digits)
{
    let divider = Math.pow(10, digits);
    return (Math.floor(val * divider))/divider;
}
//****------------------------------------------------------------------------------------------------------------------
function strip_tags(html)
{
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
//****------------------------------------------------------------------------------------------------------------------
function validate_email($src) {
    if (!$src)
        return false;
    else
    {
        let mail = $src.split("@");
        if (mail.length === 2)
        {
            if (mail[0].length > 0)
            {
                if (mail[1].length >= 3)
                {
                    let r = mail[1].split(".");
                    if (r.length >= 2)
                    {
                        if (r[r.length - 1]) // domain is ok
                            return true;
                        else
                            return false;
                    }
                    else
                        return false;
                }
                else
                    return false;
            }
            else
                return false;
        }
        else
            return false;
    }
}
//****------------------------------------------------------------------------------------------------------------------
function duplicate(arr){
    return JSON.parse(JSON.stringify(arr));
}
//****------------------------------------------------------------------------------------------------------------------
function fio_abbrev(fio) {
    let a_fio = fio.split(" ");
    for (let k=1; k<3; k++) // shorten the Name + Father's name to one char
        if (a_fio[k])
            a_fio[k] = a_fio[k][0].toUpperCase() + ".";
        else
            a_fio[k] = "";
   return (a_fio[0] +" "+a_fio[1]+" "+a_fio[2]);
}

//****------------------------------------------------------------------------------------------------------------------
function load_excell_table(table, filename, title, subject) {

    let wb = XLSX.utils.book_new();
    wb.Props = {
        Title: title,
        Subject: subject,
        Author: "HR-UP",
        CreatedDate: new Date()
    };
    //  console.log("#");
    // Add new sheet handle by name
    wb.SheetNames.push("Datasheet");
    let ws = XLSX.utils.aoa_to_sheet(table); // convert array to sheet
    let attrs = {
        wch : 30 // width in characters
        //'width?': 200, // width in screen pixels
        //'wpx?': 50, // width in Excel's "Max Digit Width", width*256 is integral
    };
    ws['!cols'] = [];
    ws["!merges"] =[
        {s:{r:0,c:0},e:{r:2,c:0}} // A1:A3
    ];

    ws['A2'].s = {
        fill:{fgColor: {rgb:"FF86BC25"}},
        alignment:{horizontal :"center"}
    };
    ws['A3'].s = {
        fill:{
            fgColor: {rgb:"FFAA00CC"}
        },
        font:{
            sz: 22,
            color: {rgb:"FFAA0000"}
        }
    };

    table[0].forEach(function (v) {
        ws['!cols'].push(attrs);
    });
    //console.log('let x = 12');
    //console.log(ws);
    wb.Sheets["Datasheet"] = ws; // attach sheet to worbook handle
    let wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'}); // export to binary format
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), filename);
}
//****------------------------------------------------------------------------------------------------------------------
function s2ab(s) {
    let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    let view = new Uint8Array(buf);  //create uint8array as viewer
    for (let i=0; i<s.length; i++)
        view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
}
//****------------------------------------------------------------------------------------------------------------------
function clean_text($str){
    let k = $str;
    for (let i=0; i<10; i++)
        k = k.replace("  ", " ");
    return strip_tags(k.trim());
}
//****------------------------------------------------------------------------------------------------------------------
function data_check($mode, $action){
    function purify($str){
        return strip_tags($str.trim());
    }

    function is_mail($mail){

        let $ans = purify($mail);
        $ans = $ans.split("@");

        if (!$ans[0] || !$ans[1])
            return false;

        $ans[1] = $ans[1].split(".");
        if (!$ans[1][0] || !$ans[1][1])
            return false;
        return true;
    }

    function turn_to_number($x){
        let $ans = "";
        let $bank = [0,1,2,3,4,5,6,7,8,9];
        for (let i=0; i<$x.length; i++)
            if ($bank.indexOf($x[i]*1) !== -1)
                $ans += $x[i]*1;
        return ($ans);
    }

    let i, j;
    switch ($mode){
        case "uData":
        case "register":{
            let $pass = true;
            let dig;
            $let = Array();

            // #1 Проверка на заполнение Инициалов
            for (i=0; i<3; i++) {
                $var[i] = $(".reg_box .init input:nth-child("+(i+1)+")").val();
                // Убрать все пробелы
                $var[i] = purify($var[i]);
                if (!$var[i]) {
                    $pass = false;
                    $(".reg_box .init input:nth-child("+(i+1)+")").css("background-color", "#ffe2e2");
                }
                else {
                    $(".reg_box .init input:nth-child("+(i+1)+")").css("background-color", "#ecffe2");
                }
            }

            // #2 Поверить название кмпании
            $var[3] = $(".reg_box .comp input").val();
            //$var[3] = purify($var[3]);
            if (!$var[3]) {
                $pass = false;
                $(".reg_box .comp input").css("background-color", "#ffe2e2");
            }
            else {
                $(".reg_box .comp input").css("background-color", "#ecffe2");
            }

            // #4 Эл почта
            $var[4] = $(".reg_box .email input").val();
            if (!is_mail($var[4]) ||
                (!$unique_mail &&
                    ($uData && $var[4] !== $uData[3]))) {
                $pass = false;
                $(".reg_box .email input").css("background-color", "#ffe2e2");
            }
            else {
                $(".reg_box .email input").css("background-color", "#ecffe2");
            }

            // #4 Телефон
            for (i=5; i<8; i++) {
                digs = [[1,2],[3,3],[7,7]];
                $var[i] = $(".reg_box .phone input:nth-child("+(i-4)+")").val();
                // Взять все численные символы
                dig = turn_to_number($var[i]);

                if (dig.toString().length !== $var[i].length ||
                    dig.toString().length < digs[i-5][0] ||
                    dig.toString().length > digs[i-5][1] ) {
                    $pass = false;
                    $(".reg_box .phone input:nth-child("+(i-4)+")").css("background-color", "#ffe2e2");
                }
                else {
                    $(".reg_box .phone input:nth-child("+(i-4)+")").css("background-color", "#ecffe2");
                }
            }

            // #5 Пароль
            if ($mode === "register") {
                $var[8] = $(".reg_box .pass input:nth-child(1)").val();
                $var[9] = $(".reg_box .pass input:nth-child(2)").val();
                // Слишком короткий пароль
                if ($var[8].length < 8) {
                    $pass = false;
                    $(".reg_box .pass input:nth-child(1)").css("background-color", "#ffe2e2");
                }
                else {
                    $(".reg_box .pass input:nth-child(1)").css("background-color", "#ecffe2");
                }
                // Неверный повтор пароля
                if ($var[9].length < 8 || $var[8] !== $var[9]) {
                    $pass = false;
                    $(".reg_box .pass input:nth-child(2)").css("background-color", "#ffe2e2");
                }
                else {
                    $(".reg_box .pass input:nth-child(2)").css("background-color", "#ecffe2");
                }
            }

            // Должность
            $var[9] = $(".reg_box .spec input").val();

            // Дата рождения

            if ($mode === "uData"){
                // #4 Телефон
                for (i=10; i<13; i++) {
                    digs = [[1,2],[1,2],[4,4]];
                    $var[i] = $(".reg_box .b_date input:nth-child("+(i-9)+")").val();
                    // Взять все численные символы
                    dig = turn_to_number($var[i]);
                    // Проверить рамки дат (условно)
                    let limit = true;
                    switch (i){
                        // день
                        case 10:
                            if (dig < 1 || dig > 31)
                                limit = false;
                            break;
                        // месяц
                        case 11:
                            if (dig < 1 || dig > 12)
                                limit = false;
                            break;
                        // год
                        case 12:
                            if (dig < 1925 || dig > 2002)
                                limit = false;
                            break;
                    }

                    if (dig.toString().length !== $var[i].length ||
                        dig.toString().length < digs[i-10][0] ||
                        dig.toString().length > digs[i-10][1] ||
                        !limit)
                    {
                        $pass = false;
                        $(".reg_box .b_date input:nth-child("+(i-9)+")").css("background-color", "#ffe2e2");
                    }
                    else {
                        $(".reg_box .b_date input:nth-child("+(i-9)+")").css("background-color", "#ecffe2");
                    }
                }
            }

            // По итогам
            if ($pass)
            // показать кнопку "Регистрация"
                $(".reg_box .btn[do=submit]").css("display","inline-block");
            else
            // спрятать кнопку "Регистрация"
                $(".reg_box .btn[do=submit]").css("display","none");

            if ($action == "return")
                return JSON.stringify($var);

            break;
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function enspan(content, clas) {
    return "<span class='"+clas+"'>" + content + "</span>";
}
//----------------------------------------------------------------------------------------------------------------------
function ddlist_from_array(arr, class_name)
{
    if (typeof arr !== "object" || arr.length === 0)
    {
        alert("bad array given to dd_from_array function!");
        return undefined;
    }
    else
    {
        let s = "<select class='"+class_name+"'>";
        arr.forEach(function (v, i) {
            s += "<option>"+v+"</option>";
        });
        s += "</select>";
        return s;
    }
}
//****------------------------------------------------------------------------------------------------------------------
function get_qz_owner_fio() {
    let fio = "";
    let chk_id = $ad.qzs[$session.opened_qz_ord].resps[$session.opened_focus_ord][0].id * 1;
    if ($ad.resps !== null)
        for (let i=0; i<$ad.resps.length; i++)
            if ($ad.resps[i].id === chk_id)
            {
                fio = $ad.resps[i].fio;
                break;
            }
    return fio;
}
//****------------------------------------------------------------------------------------------------------------------
function get_qb_ord_from_qb_id(qb_id) {
    let qb_ord = null;
    if ($ad.qbooks.length)
        for (let i=0; i<$ad.qbooks.length; i++)
            if (qb_id === $ad.qbooks[i].id)
            {
                qb_ord = i;
                break;
            }
    return qb_ord;
}
//****------------------------------------------------------------------------------------------------------------------
function get_resp_ord_from_resp_id(id) {
    let ord = null;
    if ($ad.resps.length)
        for (let i=0; i<$ad.resps.length; i++)
            if (id === $ad.resps[i].id)
            {
                ord = i;
                break;
            }
    return ord;
}
//****------------------------------------------------------------------------------------------------------------------
function get_qst_ord_from_qst_id(qid) {
    let q_ord = null;
    if ($ad.qsts.length)
        for (let i=0; i<$ad.qsts.length; i++)
            if (qid === $ad.qsts[i].id)
            {
                q_ord = i;
                break;
            }
    return q_ord;
}
//****------------------------------------------------------------------------------------------------------------------
function get_comp_id_from_qst_id(qid) {
    let comp_id = null;
    if ($ad.qsts.length)
        for (let i=0; i<$ad.qsts.length; i++)
            if (qid === $ad.qsts[i].id)
            {
                comp_id = $ad.qsts[i].comp_id;
                break;
            }
    return comp_id;
}
//****------------------------------------------------------------------------------------------------------------------
function get_comp_id_list_from_qst_list(qst_list) {
    let comp_list = null;
    if (qst_list.length)
    {
        comp_list = [];
        qst_list.forEach(function (qid) {
            let comp_id = get_comp_id_from_qst_id(qid);
            if (null !== comp_id && comp_list.indexOf(comp_id) === -1)
                comp_list.push(comp_id);
        });
    }
    // List of unique comp_id's
    return comp_list;
}
//****------------------------------------------------------------------------------------------------------------------
function get_cid_from_qst(qst_id) {
    let cid = null;
    if ($ad.qsts.length)
        for (let i=0; i<$ad.qsts.length; i++)
            if (qst_id === $ad.qsts[i].id)
            {
                cid = $ad.qsts[i].comp_id;
                break;
            }
    return cid;
}
//****------------------------------------------------------------------------------------------------------------------
function get_comp_ord_from_comp_id(cid) {
    let cind = null;
    if ($ad.comps.length)
        for (let i=0; i<$ad.comps.length; i++)
            if (cid === $ad.comps[i].id)
            {
                cind = i;
                break;
            }
    return cind;
}
//****------------------------------------------------------------------------------------------------------------------
function disableDrag(){
    $curs.drag = false;
    $(".dragPick").css("display","none");
}
//****------------------------------------------------------------------------------------------------------------------
function workbook_to_array(wb, col_qnt) {
    // workbook has field named as in excell A1-A2-B1 etc placed in one line, so we cut this line by a fixed size into a usable matrix of arrays
    let ans = [];
    let row = [];
    let bank = wb.Sheets[wb.SheetNames[0]];
    let counter = 0;
    Object.keys(bank).map(function (key, index) {
        if (key !== "!ref")
        {
            counter++;
            row.push(bank[key].v);
            if (counter >= col_qnt)
            {
                counter = 0;
                ans.push(row);
                row = [];
            }
        }
    });
    //console.log("wb to array result");
    //console.log(ans);
    return ans;
}
//****------------------------------------------------------------------------------------------------------------------
function chk_qz_validity_resp_list(qz, gr_ord, resp_ord) {
    let is_valid = false;
    let err_list = [];

    let gr = qz.resps[gr_ord];
    let resp = gr[resp_ord];


    let props_list = ["id","ans_list","cat_id","feedback","ignore","last_message_id","last_message_status","last_remainder_date","last_upd","remainders_sent","ukey"];
    let props_qnt = props_list.length;
    let props_valid = 0;
    for (let p=0; p<props_qnt; p++)
        if (resp.hasOwnProperty(props_list[p]))
            props_valid++;
        else
        {
            let error = "# опрос " + qz.name +", группа №"+i+ ", респ. №"+k+" не имеет "+props_list[p]+ " параметра!";
            err_list.push(error);
            break;
        }

    if (!err_list.length)
        return true;
    else
        return err_list;
}
// -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,4,0,5,4,5,-1,-1,-1,0,5,0,5,-1,5,5,-1,-1,0,0,0,5,5,4,4,5,5,0,0,-1,5,5,0,0,5,0,-1,-1,-1,-1,-1,-1,0,-1,-1,5,-1,5,0,0,
//****------------------------------------------------------------------------------------------------------------------
function chk_qz_validity_basic(qz) {
    let is_valid = false;
    let err_list = [];

    if (!qz)
        err_list.push("# переменная опроса пуста!");
    else
    if (!qz.hasOwnProperty("settings"))
        err_list.push("# нет структуры \"settings\"!");
    else
    if (typeof qz.settings !== "object" || qz.settings === null || qz.settings.length === 0)
        err_list.push("# структура параметра \"settings\" не валидна!");
    else
    {
        let props_list = [
            "answer_opts_list",
            "comm_groups",
            "comment",
            //"djo_avg_id",
            "end_date",
            "letter",
            "notice_list",
            "notice_pct",
            "notice_period_id",
            "qst_list",
            "start_date"];

        for (let p=0; p<props_list.length; p++)
            if (!qz.settings.hasOwnProperty(props_list[p]))
            {
                let error = "# настройки опроса не имеют "+props_list[p]+ " параметра!";
                err_list.push(error);
            }
    }

    // ALL SETTINGS WERE CORRECT
    if (!err_list.length)
    {
        if (!qz.hasOwnProperty("resps"))
            err_list.push("# нет структуры респондентов!");
        else
        if (typeof qz.resps !== "object" || qz.resps === null)
            err_list.push("# структура респондентов не валидна");
        else
        if (!qz.resps.length)
            err_list.push("# структура респондентов не содержит опрос-групп!");
        else
        {
            let gr_qnt = qz.resps.length;
            for (let i=0; i<gr_qnt; i++)
            {
                let gr = qz.resps[i];
                if (typeof gr === "object" && gr !== null && gr.length > 1)
                {
                }
                else
                {
                    let error = "# группа №"+i+ " не имеет корректного списка респондентов!";
                    err_list.push(error);
                }
            }
        }
    }

    if (!err_list.length)
        return true;
    else
        return err_list;
}
//****------------------------------------------------------------------------------------------------------------------
function numerize(val) {
    val *= 1;
    if (isNaN(val))
        val = 0;
    return val;
}
//****------------------------------------------------------------------------------------------------------------------
function floater_hint(action, data) {
    if (action === "remove")
    {
        $(".floater").css("display", "none").html("");
    }
    else
    if (action === "show")
    {
        let tx = "<div class='head'>" + data.head + "</div>" + data.tx;
        $(".floater")
            .css("display", "inline-block")
            .css("width", data.w+"px")
            //.css("height", "350px")
            .css("left", ($curs.x+data.dx)+"px")
            .css("top", ($curs.y+data.dy)+"px")
            .css("border-color", "#4A67AD")
            .html(tx);
    }
}
//****------------------------------------------------------------------------------------------------------------------
function get_resp_categories_dropdown_list(class_name) {
    let s;
    let class_data = "";
    if (class_name)
        class_data = "class='"+class_name+"'";

    s = "<select "+class_data+">";
        for (let i=1; i<$RESP_CATEGORIES_QNT; i++)
            s += "<option>"+get_resp_category("by_id", i)+"</option>";
    s += "</select>";
    return s;
}
//****------------------------------------------------------------------------------------------------------------------
function get_timestamp() {
    let d = new Date();
    return math_floor(d.getTime() / 1000, 0);
}
//****------------------------------------------------------------------------------------------------------------------
function new_qz_tab_progress(val) {
    if (val)
    {
        $new_qz.tab_progress = val;
        if ($new_qz.tab_progress > $new_qz.tab_progress_max)
        {
            if ($new_qz.tab_progress < 5)
                $new_qz.tab_progress_max = $new_qz.tab_progress;
        }


        // If user clicked directly on qst chapter - reset the inner screen id (this happens only by direct transition)
        /*
        if (val === 2)
            $new_qz.qst_screen_id = 0; // For QSTS
        else
        */
        // Same for options
        if (val === 4)
            $new_qz.options_screen_id = 2; // For OPTIONS we skip =1 cuz we translated that screen to options in system's header

        content_g_cpanel_tab_update(); // visually redraw tabs to indicated active, completed and the rest

        if ($new_qz.tab_progress_max) // don't resave when last 2 sections access from the starting screen (that means we have empty session info and will del last session's info)
            $session.set();
    }
}
//****------------------------------------------------------------------------------------------------------------------

let PATH, TEST_MODE = false;

let $pers, $crew, $qsts, $resp, $test, $dep,  $ad;
let $hint_locked = 0, $data_gathered = 0, $allow_refresh = false, $manipulation = false, $host, $host_uid, $draw_step = 25;
let $nav = {};
    $nav.screen = "land_auth"; // defines which screen are we viewing right now (since all navigation will be handled in front-end)
    $nav.subscreen = "";
    $nav.scroll = {};
    $nav.top = 0;
    $nav.left = 0;
    $nav.an_block_id = 0;
    $nav.an_chap_id = 0; // saves picked chapter for analytics page
    $nav.an_show_hint = true;
    $nav.an_max_report_tabs = 6;
    $nav.cr = false;

    $nav.tab = {}; // defines data for opened tabs/windows like comments/hints/ C.R.U.D windows and such
    $nav.tab.id = 0;
    $nav.tab_name = {};
    $nav.tab_name.land_auth = "Вход";
    $nav.tab_name.land_reg = "Регистрация";
    $nav.tab_name.land_oferta = "Публичная оферта";

    $nav.tab_box_names = {};
    $nav.tab_box_names.qz_create = "Создание<br>опроса";
    $nav.tab_box_names.qst = "Вопросы<br>и компетенции";
    $nav.tab_box_names.deli_set = "Настройка<br>рассылки";
    $nav.tab_box_names.options = "Дополнительные<br>параметры";
    $nav.tab_box_names.deli_control = "Контроль<br>рассылки";
    $nav.tab_box_names.analytics = "Аналитика";

    $nav.tab_name.pers_cab = "Настройки";
    $nav.tab_name.pers_access = "Доступы";
    $nav.tab_name.pers_list = "Клиенты";

    $nav.tab_name.pers_settings = "Настройка доступов";
    $nav.tab_name.help = "Помощь";
    $nav.tab_name.quit = "Выход";

let $draw_interval, $unlogInter, $d_entry, $unique_mail;
let $chap,$opt,$pID;
// Содержит временные данные по форматируемуму опроснику
let $oid_list = Array();
let $changes_log;
let $autosave_prg, $autosave_rot_ang = 0;
let $keyboard = {
    is_down: [],
    is_down_code: [],
};

let $new_qz = {}; // object of new quiz with all fields added during the construction

$curs = {
        x : 0,
        y : 0,
        drag: false,// свитч, показывает тянет ли юзер в данный момент что-то или нет
        picked: [], // содержит id-шники выбранного вопроса [0] и его компетенции [1]
        hover : 0 // id элемента над которым нависает курсор с активным isDrag - тоесть конечное место вброса перетягиваемого элемента
    };

let $comps_id_map = []; // key is comp's id, value is order of comps array
let $mainCore = function() {
    this.msMove = function (event) {
        $curs.x = event.pageX;
        $curs.y = event.pageY;

        if (qdrag.ord !== null)
            $(".floater")
                .css("left", ($curs.x-350)+"px")
                .css("top", $curs.y+"px");
    };
};


//****------------------------------------------------------------------------------------------------------------------
function get_id($db, $id)
{
    let i, ans = null;
    if ($db !== null && typeof $db === "object" && $db.length > 0)
    for (i=0; i<$db.length; i++)
        if ($db[i].id * 1 === $id * 1)
        {
            ans = i;
            break;
        }
    return ans;
}
//****------------------------------------------------------------------------------------------------------------------
function add_tabs_box() {
    if ($ad && typeof $ad === "object" && $pers !== undefined)
        $(".tabs_box")
            .css("display", "block")
            .empty()
            .append(content_tabs_box());

    if ($pers && $pers.access < 3)
    {
        let limit = 6;
        if ($pers.access === 2)
            limit = 5;

        // Hide all other chapters
        $(".tabs_box .tab").each(function (v) {
            if ($(this).attr("tab_id")*1 < limit)
                $(this).css("visibility", "hidden");
        });
    }

}
//****------------------------------------------------------------------------------------------------------------------
function show_content($page, $scr_data)
{
    if ($page !== undefined)
        $nav.screen = $page;

    // fill cpanel on first initialization
    // Fill cpanel with section tabs
    //if ($nav.screen === "landing")
    $(".g_cpanel")
        .css("display", "block")
        .empty()
        .append(content_g_cpanel());

    // Add regular chapters block
    $(".tabs_box").empty();
    add_tabs_box();

    $(".qzs_list").remove(); // Box from "qz_create" screen

    // Add options chapters block (except screen num 6 which is end-screen)
    $(".options_tabs_box").remove();
    $(".qst_tabs_box").remove();
    if ($nav.screen === "options" && $new_qz.options_screen_id < 6)
    {
        $(".tabs_box")
            .after(content_options_tabs());
        content_options_tabs_events();
    }
    else
    if ($nav.screen === "qst")
    {
        $(".tabs_box")
            .after(content_qst_tabs());
        content_qst_tabs_events();
    }

    if ($ad && $ad.qzs && $ad.qzs.length)
    {
        $(".tabs_box .tab[tag='analytics']").css("opacity","1.0");
        $(".tabs_box .tab[tag='deli_control']").css("opacity","1.0");
    }
    else
    {
        $(".tabs_box .tab[tag='analytics']").css("opacity","0.4");
        $(".tabs_box .tab[tag='deli_control']").css("opacity","0.4");
    }

    // event handlers for refreshed cpanel content
    content_g_cpanel_events();

    // Refresh float box for qst popups
    $(".floater").remove();
    $("body").prepend("<div class='floater'></div>");


    $(".g_cpanel_bg").css("display", "block");

    $res = "";
    switch ($nav.screen)
    {
        // Top panel
        case "landing":
            $res = content_landing_front();
            break;

        case "land_auth":
            new_qz_tab_progress(0);
            $res = content_landing_auth();
            break;

        case "land_reg":
            new_qz_tab_progress(0);
            $res = content_landing_reg($scr_data);
            break;

        case "pers_cab":
            $res = content_pers_cabinet();
            break;

        case "pers_access":
            $res = content_options_pers_access();
            break;

        // Tabs panel
        case "qz_create":
            $res = content_qz_create();
            break;

        case "qst":
            $res = content_qst();
            break;

        case "deli_set":
            $res = content_deli();
            break;

        case "options":
            $res = content_options();
            break;

        case "deli_control":
            $res = content_deli_control();
            break;

        case "analytics":
            $res = content_analytics();
            break;


    }
    // finally show related to the selected page/tab stuff on screen
    $(".g_content")
        .empty()
        .append($res);

    // # EVENTS
    // add events related to inserted elements
    switch ($nav.screen)
    {
        // Top panel
        case "landing":
        case "land_auth":
        case "land_reg":
            content_landing_events();
            break;

        case "pers_cab":
            content_pers_cabinet_events();
            break;

        case "pers_access":
            content_options_pers_access_events();
            break;

        // Tabs panel
        case "pers":
            content_pers_events();
            break;

        case "analytics":
            content_analytics_events();
            break;

        case "qz_create":
            content_qz_create_events();
            break;

        case "qst":
            content_qst_events();
            break;

        case "deli_set":
            content_deli_events();
            break;

        case "options":
            content_options_events();
            break;

        case "deli_control":
            content_deli_control_events();
            break;
    }

}
//****------------------------------------------------------------------------------------------------------------------
function screen_refresh()
{
    if ($allow_refresh)
    {
        let $body = $("body");
        $nav.scroll.top = $body.scrollTop();
        $nav.scroll.left = $body.scrollLeft();
        show_content($nav.screen);
        $body.scrollTop($nav.scroll.top);
        $body.scrollLeft($nav.scroll.left);
    }
}
//****------------------------------------------------------------------------------------------------------------------
function filter_string(content, caption)
{
    let date = new Date();
    let ans = content;
    ans = ans.trim();
    if (ans === "")
        ans = "<" + caption +" #" + date.getTime()+ ">";
    return ans;
}
//****------------------------------------------------------------------------------------------------------------------
function have_invites(){
    // Проверить есть ли респ-ты добавляемые в уже запущенный опрос
    let dohave = false;
    if ($changes_log && $changes_log[4].length > 0)
        for (let i=0; i<$changes_log[4].length; i++){
            // Внутренний айди опроса в который добавляется участник
            $qz_iid = $changes_log[4][i][0] * 1;
            // Если этот опрос уже запущен
            if ($qzs[$qz_iid][5] * 1 === 1){
                // Сигнализировать что приглашения будут
                dohave = true;
                break;
            }
        }
    return dohave;
}
//****------------------------------------------------------------------------------------------------------------------
function vdate_invi_mail($action,$mode){
    let i;

    if ($action === "check"){
        let $txt = $("textarea.invite_body").val();
        let $pass = 1;
        // Проверить количество тэгов
        // Тэг %ИМЯ%
        if ($txt.indexOf("%NAME%") === -1) $pass = 0;
        // Тэг %ORG%
        if ($txt.indexOf("%ORG%") === -1) $pass = 0;
        // Тэг %MAIL%
        if ($txt.indexOf("%MAIL%") === -1) $pass = 0;
        // Тэг %LINK%
        if ($txt.indexOf("%LINK%") === -1) $pass = 0;
            else {
                let pos = $txt.indexOf("%LINK%");
                // Проверить если такиъ тэгов больше одного
                if ($txt.indexOf("%LINK%",pos+1) !== -1) $pass = 0;
            }

        $(".btn_box .btn[valid]").attr("valid",$pass);

        if (!$pass){
            $(".btn_box .btn[valid]").text("Ошибка!");
            //$(".btn_box .btn[action=preview]").css("visibility","hidden");
        }
            else {
                $(".btn_box .btn[valid]").text("Подтвердить");
                //$(".btn_box .btn[action=preview]").css("visibility","visible");
            }

    }
        else
        if ($action === "recode"){

        }
            else
            if ($action === "preview"){
                let $head = $("input.invite_head").val();
                let $cont = $("textarea.invite_body").val();
                let bold_cntr = 0, $ind;
                // Привести эти тексты в прилежную форму
                // ЗАГОЛОВОК ПИСЬМА ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                for (i=0; i<100; i++){

                    // ЗАГОЛОВОК ПИСЬМА
                    // Выставить тэги жирности
                    $ind = $head.indexOf("*");
                    if ($ind !== -1){
                        // Открывающий тэг
                        if (!bold_cntr){
                            $head = $head.slice(0,$ind) + "<b>" + $head.slice($ind + 1);
                            bold_cntr = 1;
                        }
                            // Закрывающий тэг
                            else {
                                $head = $head.slice(0,$ind) + "</b>" + $head.slice($ind + 1);
                                bold_cntr = 0;
                            }
                    }

                    // Если письмо не для отправки на сервак - расписать понятнее тэги
                    if ($mode !== "no_tag_replace") {
                        // Выставить тэги ФИО
                        $ind = $head.indexOf("%NAME%"); // длина тэга - 6 знаков
                        if ($ind !== -1){
                            $head = $head.slice(0,$ind) + "<span class='u'>Фамилия Имя Отчество</span>" + $head.slice($ind + 6);
                        }

                        // Выставить тэги ФИО
                        $ind = $head.indexOf("%ORG%"); // длина тэга - 6 знаков
                        if ($ind !== -1){
                            $head = $head.slice(0,$ind) + "<span class='u'>"+$uData[8]+"</span>" + $head.slice($ind + 5);
                        }

                        // Выставить тэги ФИО
                        $ind = $head.indexOf("%MAIL%"); // длина тэга - 6 знаков
                        if ($ind !== -1){
                            $head = $head.slice(0,$ind) + "<span class='u'>"+$uData[3]+"</span>" + $head.slice($ind + 6);
                        }

                        // Выставить тэги ФИО
                        $ind = $head.indexOf("%LINK%"); // длина тэга - 6 знаков
                        if ($ind !== -1){
                            $head = $head.slice(0,$ind) + "<span class='u'>http://link-for-respondent - оценка такого-то человека</span>" + $head.slice($ind + 6);
                        }
                    }
                }
                // Подставить переносы
                for (i=0; i<100; i++){
                    $ind = $head.indexOf("\n");
                    if ($ind !== -1)
                        $head = $head.slice(0,$ind) + "<br>" + $head.slice($ind + 1);
                }

                // ТЕЛО ПИСЬМА +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                bold_cntr = 0;
                for (i=0; i<100; i++){

                    // Выставить тэги жирности

                    $ind = $cont.indexOf("*");
                    if ($ind !== -1){
                        // Открывающий тэг
                        if (!bold_cntr){
                            $cont = $cont.slice(0,$ind) + "<b>" + $cont.slice($ind + 1);
                            bold_cntr = 1;
                        }
                            // Закрывающий тэг
                            else {
                                $cont = $cont.slice(0,$ind) + "</b>" + $cont.slice($ind + 1);
                                bold_cntr = 0;
                            }
                    }

                    // Если письмо не для отправки на сервак - расписать понятнее тэги
                    if ($mode !== "no_tag_replace") {
                        // Выставить тэги ФИО
                        $ind = $cont.indexOf("%NAME%"); // длина тэга - 6 знаков
                        if ($ind !== -1) {
                            $cont = $cont.slice(0, $ind) + "<span class='u'>Фамилия Имя Отчество</span>" + $cont.slice($ind + 6);
                        }

                        // Выставить тэги ФИО
                        $ind = $cont.indexOf("%ORG%"); // длина тэга - 6 знаков
                        if ($ind !== -1) {
                            $cont = $cont.slice(0, $ind) + "<span class='u'>"+$uData[8]+"</span>" + $cont.slice($ind + 5);
                        }

                        // Выставить тэги ФИО
                        $ind = $cont.indexOf("%MAIL%"); // длина тэга - 6 знаков
                        if ($ind !== -1) {
                            $cont = $cont.slice(0, $ind) + "<span class='u'>"+$uData[3]+"</span>" + $cont.slice($ind + 6);
                        }

                        // Выставить тэги ФИО
                        $ind = $cont.indexOf("%LINK%"); // длина тэга - 6 знаков
                        if ($ind !== -1) {
                            $cont = $cont.slice(0, $ind) + "<span class='u'>http://link-for-respondent - оценка такого-то человека</span>" + $cont.slice($ind + 6);
                        }
                    }
                }
                // Подставить переносы
                for (let i=0; i<100; i++){
                    $ind = $cont.indexOf("\n")
                    if ($ind !== -1)
                        $cont = $cont.slice(0,$ind) + "<br>" + $cont.slice($ind + 1);
                }
                return [$head,$cont];
            }
}
//****------------------------------------------------------------------------------------------------------------------
function draw(){
    // Called each 50 ms
    /*
    if ($curs.drag) {

        $(".dragPick")
            .css("left",$curs.x+15)
            .css("top",$curs.y+15);
    }
    */

    if ($autosave_prg > 0)
    {
        $autosave_prg -= $draw_step; // interval of this update

        if ($autosave_prg <= 0)
        {
            $(".auth_box .autosave")
                .css("display", "none");
        }
        else
        {
            $autosave_rot_ang += 5; // rotate image 15deg at a time
            $(".auth_box .autosave")
                .css("display", "block")
                .css("transform", "rotate("+$autosave_rot_ang+"deg)");
        }
    }

    if (qdrag.insert_tmr !== null)
    {
        qdrag.insert_tmr -= $draw_step;

        if (qdrag.insert_tmr <= 0)
            qdrag.insert_anim("off");
        else
        {
            let icon = $(".insert_gif");
            let curr_opacity = icon.css("opacity") * 1;
            qdrag.insert_xpos += 0.07;

            if (qdrag.insert_tmr >= qdrag.insert_tmr_mx) // fade in
                icon
                    .css("right", qdrag.insert_xpos + "%")
                    .css("opacity", curr_opacity + qdrag.insert_opa_step); // we have 1 sec, so 1000/50 = 20 triggers to reach from 0 to 1
            else // fade out
                icon
                    .css("right", qdrag.insert_xpos + "%")
                    .css("opacity", curr_opacity - qdrag.insert_opa_step);
        }
    }
}
//****------------------------------------------------------------------------------------------------------------------
function get_info($mode, $submode, $id, $action){
    // Это индекс вопроса в БД, а нам нужен в массиве js
    $id *= 1;
    let $i,$k,$z,$ord;
    // RESPONDENTS
    if ($mode === "resp"){
        for ($k=0; $k<$resps.length; $k++)
            if ($resps[$k][0]*1 === $id)
                switch ($submode){
                    case "iid":
                        return $k;

                    case "fio":
                        // Оформить в стиле Фамилия И.О.
                        if ($action){
                            let name = $resps[$k][1].split(",");
                            if (!name[0])
                                    name[0] = "";
                            if (!name[1])
                                    name[1] = "";
                            if (!name[2])
                                    name[2] = "";

                            if ($action === "shorted")
                            {
                                if (name[1] !== "")
                                    name[1] = name[1][0]+".";
                                if (name[2] !== "")
                                    name[2] = name[2][0]+".";

                                name = name[0]+" "+name[1]+" "+name[2];
                                return name;
                            }
                            else
                                if ($action === "clean")
                                {
                                    name = name[0]+" "+name[1]+" "+name[2];
                                    return name;
                                }
                        }
                            else
                                return $resps[$k][1];
                        break;
                } //
    }
    else
    // QUESTIONS
    if ($mode === "qst"){
        for ($k=0; $k<$qsts.length; $k++)
            switch ($submode){
                case "iid":
                    if ($qsts[$k][0]*1 === $id)
                        return $k;
                    break;
                case "text":
                    if ($qsts[$k][0]*1 === $id)
                        return $qsts[$k][1];
                    break;
                case "comp_name":
                case "comp_ord":
                    // Найден внутренний индекс нашего вопроса по внешнему
                    if ($qsts[$k][0]*1 === $id){
                        if ($submode === "comp_name"){
                            // Теперь мы можем узнать внешний индекс компетенции
                            for ($z=0; $z<$comps.length; $z++)
                                // а по нему узнаем ее название
                                if ($comps[$z][0]*1 === $qsts[$k][5]*1)
                                    return $comps[$z][1];
                        }
                            else
                                if ($submode === "comp_ord"){
                                    // Узнать внешний индекс компетенции нашего вопроса
                                    let $comp_oid = $qsts[$k][5] * 1;
                                    $ord = 0;
                                    // Начать отсчет...
                                    for ($z=0; $z<$qsts.length; $z++){
                                        // ...вопросов с индексом данной компетенции
                                        if ($qsts[$z][5]*1 === $comp_oid)
                                            $ord++;
                                        // Пока не дойдем до порядкового номера нашего вопроса
                                        if ($z === $k)
                                            return $ord;
                                    }
                                }
                    }
                    break;
            }
    }
    else
    // COMPETENTIONS
    if ($mode === "comp"){

        switch ($submode){
            // Кол-во вопросов по внешнему индексу компетенции
            case "qst_qnt":{
                for ($k=0; $k<$comps.length; $k++){
                    let $qnt = 0;
                    for ($z=0; $z<$qsts.length; $z++)
                        if ($qsts[$k][5]*1 === $id)
                            $qnt++;
                    return $qnt;
                }
                break;
            }

            case "name":{
                for ($k = 0; $k < $comps.length; $k++) {
                    if ($comps[$k][0] * 1 === $id)
                        return $comps[$k][1];
                }
                break;
            }

            case "iid":{
                for ($k = 0; $k < $comps.length; $k++) {
                    if ($comps[$k][0] * 1 === $id)
                        return $k;
                }
                break;
            }
        }
    }
    else
    // COMPETENTIONS
    if ($mode === "qbook"){
        for ($k=0; $k<$qBooks.length; $k++)
            if ($qBooks[$k][3]*1 === $id)
                switch ($submode){
                    case "name":
                        return $qBooks[$k][0];

                    case "iid":
                        return $k;

                }
    }
    else
    // COMPETENTIONS
    if ($mode === "ans"){
        for ($k=0; $k<$ansSchemes.length; $k++)
            if ($ansSchemes[$k][0]*1 === $id)
                switch ($submode){
                    case "name":
                        return $ansSchemes[$k][1];

                    case "iid":
                        return $k;
                }
    }
    else
    // PROJECT
    if ($mode === "prj"){
        for ($k=0; $k<$prjs.length; $k++)
            switch ($submode){
                case "iid":
                    if ($prjs[$k][0]*1 === $id)
                        return $k;
                    break;
            }


    }
}
//****------------------------------------------------------------------------------------------------------------------
function format_name($input_name, $separator){
    let $res = "";
    if ($input_name) {
        let $name_tx = $input_name.split(",");
        if ($name_tx[0])
            $res += $name_tx[0];
        if ($name_tx[1]) {
            if ($res) $res += $separator;
            $res += $name_tx[1];
        }
        if ($name_tx[2]) {
            if ($res) $res += $separator;
            $res += $name_tx[2];
        }
    }
    return $res;
}
//****------------------------------------------------------------------------------------------------------------------
function get_time($format)
{
    let d = new Date();
    if ($format === "date")
        return decode_timestamp(null, "no_span");
    else
    if ($format === "date_filename")
    {
        let s = decode_timestamp(null, "no_span");
        s = s.replace(/\./g,"_");
        s = s.replace(/:/g,"_");
        return s;
    }
    else
    if ($format === "stamp")
        return math_floor(d.getTime() / 1000, 0);
}

//****------------------------------------------------------------------------------------------------------------------
window.onload = function()
{
    //console.clear();
    localStorage.clear();
    $session.reset();

    $("body")
        .off("keyup")
        .keyup(function (e) {
            //let char = String.fromCharCode(e.keyCode);
            let index = $keyboard.is_down.indexOf(e.keyCode);
            if (-1 !== index)
            {
                $keyboard.is_down.splice(index,1);


            }
        })
        .off("keydown")
        .keydown(function (e) {
            let char = String.fromCharCode(e.keyCode);
            console.log("keydown " + char + " code " + e.keyCode);
            if ($keyboard.is_down.indexOf(e.keyCode) === -1)
                $keyboard.is_down.push(e.keyCode); // record all held down keys

            if (17 === e.keyCode)
            {
                let oqt_db_box = $(".oqt_box");
                if (oqt_db_box.length)
                {

                    if ("10px" === oqt_db_box.css("right"))
                    {
                        oqt_db_box.css("right","unset");
                        oqt_db_box.css("left","10px");
                    }
                    else
                    {
                        oqt_db_box.css("right","10px");
                        oqt_db_box.css("left","unset");
                    }
                }
                let qp_box = $(".qp_box");
                if (qp_box.length)
                {

                    if ("10px" === qp_box.css("right"))
                    {
                        qp_box.css("right","unset");
                        qp_box.css("left","10px");
                    }
                    else
                    {
                        qp_box.css("right","10px");
                        qp_box.css("left","unset");
                    }
                }
            }
        })
        .off("mouseup")
        .mouseup(function () {
            $curs.drag = false;

            if ($curs.hasOwnProperty("qb_id"))
            {
                // transfer qbook to different dir
                if ($curs.hasOwnProperty("insert_folder"))
                {
                    let form = {
                        qb_id: $curs.qb_id,
                        lay_id: $curs.insert_folder.id,
                        meta: {
                            lay_name: $curs.insert_folder.tag,
                            lay_ind: dirs_get_latest_layer_index($curs.insert_folder.tag)
                        },
                        lay_name: $curs.insert_folder.tag
                    };

                    if (form.lay_id === "null")
                        form.lay_id = null;
                    if (form.lay_name === "null")
                        form.lay_name = null;

                    form.qb_ord = get_qb_ord_from_qb_id($curs.qb_id);

                    if (null !== form.qb_ord)
                        sendAJ("qbook_redir", JSON.stringify(form));
                }
                else
                if ($curs.hasOwnProperty("swap_qbook") && "qst" === $nav.screen)
                {
                    let from_qb_ord = get_qb_ord_from_qb_id($curs.qb_id);
                    let to_qb_ord = get_qb_ord_from_qb_id($curs.swap_qbook.id);
                    let saved_to_lay_ind = $ad.qbooks[to_qb_ord].meta.lay_ind;
                    // swap indexes
                    $ad.qbooks[to_qb_ord].meta.lay_ind = $ad.qbooks[from_qb_ord].meta.lay_ind;
                    $ad.qbooks[from_qb_ord].meta.lay_ind = saved_to_lay_ind;

                    let form = {
                        mode: "qbooks_index_swap",
                        from_qb_id: $curs.qb_id,
                        from_meta: $ad.qbooks[from_qb_ord].meta,
                        to_qb_id: $curs.swap_qbook.id,
                        to_meta: $ad.qbooks[to_qb_ord].meta
                    };

                    if (null !== form.qb_ord)
                        sendAJ("qbook_swap_index", JSON.stringify(form));
                }
                /*
                $ad.qbooks.forEach(function (v_qb1, i) {
                    $ad.qbooks.forEach(function (v_qb2, k) {
                        if (i !== k &&
                            v_qb1.lay_id === v_qb2.lay_id &&
                            v_qb1.lay_name === v_qb2.lay_name &&
                            v_qb1.meta.lay_ind === v_qb2.meta.lay_ind)
                        {
                            console.log(v_qb1.name + " AND " + v_qb2.name);
                        }
                    });
                });
                */

                delete $curs.qb_id ;
                delete $curs.swap_qbook;
                $(".dirs_wnd .icon[type='qb']")
                    .css("transform","rotate(0deg)")
                    .css("filter","grayscale(100%)");
                $(".dir_insert").remove();
                $(".qb_insert").remove();
                if ($curs.hasOwnProperty("insert_folder"))
                    delete $curs.insert_folder;

                $(".floater").css("display", "none"); // remove hint as it can fail to be deleted cuz of overlayed folder icons
            }

            if ($curs.hasOwnProperty("an_fold"))
            {
                console.log("$curs.an_fold keyup", $curs.an_fold);

                // Bring qz out of the folder
                if ($curs.an_fold.hasOwnProperty("unfold"))
                {
                    let qz_id = $ad.qzs[$curs.an_fold.qz_ord].id;
                    let found = false;
                    let folders_qnt = $pers.an_folders.length;
                    for (let i=0; i<folders_qnt; i++)
                    {
                        if ($pers.an_folders[i].list.length)
                        {
                            let list_qnt = $pers.an_folders[i].list.length;
                            for (let k=0; k<list_qnt; k++)
                                if ($pers.an_folders[i].list[k] === qz_id)
                                {
                                    $pers.an_folders[i].list.splice(k, 1); // remve qz id from list of that folder
                                    break;
                                }
                        }

                        if (found)
                            break;
                    }

                    $(".item[ord='"+ $curs.an_fold.qz_ord +"'][folder_ord='"+ $curs.an_fold.folder_ord +"']").removeAttr("folder_ord");
                    sendAJ("save_an_folder", JSON.stringify($pers.an_folders)); // save the new foldering scheme
                }
                else
                if ($curs.an_fold.hasOwnProperty("folder_ord")) // place a quiz into a folder
                {
                    let qz_id = $ad.qzs[$curs.an_fold.qz_ord].id;

                    let folder_ord = $curs.an_fold.folder_ord;
                    if ($pers.an_folders[folder_ord].list.indexOf(qz_id) === -1) // cant put same quiz twice into a folder
                    {
                        //let item = $(".item[ord='"+ $curs.an_fold.qz_ord +"']");
                        //console.log("item with ord=" + $curs.an_fold.qz_ord, item);
                        //item.attr("folder_ord", folder_ord);
                        $pers.an_folders[folder_ord].list.push(qz_id);
                        // See if that quiz is removed from another folder
                        $pers.an_folders.forEach(function (v_folder, i_folder) {
                            if (i_folder !== folder_ord && v_folder.list.length)
                            {
                                let ind = v_folder.list.indexOf(qz_id);
                                if (-1 !== ind)
                                    v_folder.list.splice(ind, 1); // remove from this folder
                            }
                        });
                    }
                    else
                        message_ex("show","info","direct","Этот опрос уже содержится в данной папке.");


                    sendAJ("save_an_folder", JSON.stringify($pers.an_folders)); // save the new foldering scheme
                }
                delete $curs.an_fold;
                $(".btn_add_folder").attr("unfolder", 0);
                $(".roster .item").css("background-color", "inherit"); // make all items default color again
                $(".roster .item_folder").css("background-color", "inherit"); // make all items default color again
            }


        });

    //content_footer();
    getUrlValue("av") === "axv6tI83kkUoL"?$nav.cr = true:false;
        //$nav.cr = true;

    let confirmation = getUrlValue("pers_confirm");
    let restoration = getUrlValue("pr_cd");
    if (confirmation !== null)
    {
        sendAJ("pers_confirm", confirmation);
    }
    else
    if (restoration !== null)
    {
        sendAJ("pass_recover_confirm", restoration);
    }
    else
    {
        if (getCookie("is_local") === "false")
            PATH = path_host;
        else
            PATH = path_local;

        // Floater updater
        let $MC = new $mainCore();
        $(document).mousemove(function(event){$MC.msMove(event)});
        let $form = {};

        let wid = getUrlValue("wid");
        if (wid === null)
            $form = wid;
        else
        {
            $form.wid = wid;
            $form = JSON.stringify($form);
        }

        sendAJ("auth", $form);
    }

    if ($draw_interval)
        clearInterval($draw_interval);
    if ($unlogInter)
        clearInterval($unlogInter);

    // Частота прорисовки пиктограммы-подсказки для курсора в конструкторах
    $draw_interval = setInterval( function(){draw()} , $draw_interval);
    //setEventHandlers_basic($chap);

    /*
    setTimeout(function () {
        console.clear();
    }, 1000);
    */
};

let qdrag = {};
qdrag.id = null;
qdrag.ord = null;
qdrag.insert_tmr = null;
qdrag.insert_tmr_mx = 2000; // standart interval of insert qst crossfade animation
qdrag.insert_xpos = 0;
qdrag.insert_opa_step = 0;
qdrag.destination = null;
qdrag.land_src_qid = 0;
qdrag.land_src_type = "comp";// comp or list
qdrag.land_dest_qid = 0;
qdrag.insert_anim = function (action) {
    if (action === "on")
    {
        qdrag.insert_opa_step = 1 / ((1 / $draw_step) * qdrag.insert_tmr_mx);
        qdrag.insert_xpos = 10;
        qdrag.insert_tmr = qdrag.insert_tmr_mx * 2; // *2 is for in + out
        $(".qsts_list").append("<div class='insert_gif'></div>");
        $(".insert_gif")
            .css("opacity","0")
            .css("right", qdrag.insert_xpos + "%");
    }
    else
    if (action === "off")
    {
        qdrag.insert_tmr = null;
        $(".insert_gif").remove();
    }
};

let unfocus_block = false;
let last_qst_screen_id = null; // is set when user goes to answer sets before filling the qst screens (when answer set was picked even before that and it will be skipped in the end of qst sequence)
let answer_set_option_template = {
    3: ["Согласен","Не согласен","Затрудняюсь ответить"],
    4: ["Абсолютно согласен","Скорее согласен, чем не согласен","Скорее не согласен, чем согласен","Абсолютно не согласен"],
    5: ["Абсолютно согласен","Скорее согласен, чем не согласен","В большей степени не согласен","Абсолютно не согласен","Затрудняюсь ответить"],
    7: ["Абсолютно согласен","В большей степени согласен","Скорее согласен, чем не согласен","Скорее не согласен","В большей степени не согласен","Абсолютно не согласен","Затрудняюсь ответить"],
};


//----------------------------------------------------------------------------------------------------------------------
function content_qst()
{
    let $res;
    if (TEST_MODE)
    {
        if (!$new_qz.qst_list.length)
            $new_qz.qst_list.push($ad.qsts[0]);
    }

    //$new_qz.answer_set_id = 2; // reset picked answer set
    $nosel = "onselectstart='return false' ";
    $res = "<div class='qst_box' "+$nosel+">";

    if ($new_qz.qst_screen_id === 1)
    {

        $res += content_qst_template_standart();
    }

    else
    if ($new_qz.qst_screen_id === 2)
    {
        $res += content_qst_template_load();
    }

    else
    if ($new_qz.qst_screen_id === 3)
    {
        $res += content_qst_template_manual();
    }

    else
    if ($new_qz.qst_screen_id === 4)
    {
        $res += content_qst_adapt_screen();
    }

    else
    if ($new_qz.qst_screen_id === 5)
    {
        $res += content_qst_answer_sets();
    }

    else
    {
        $res += "<div class='hint_box'>";
        $res += "<div class='head'>Выбор способа формирования опросника</div>";
        $res += "<div class='tx'>На выбор Вам предлагается 3 способа добавления вопросов." +
            "<ol>" +
            "<li>Выбрать стандартные вопросы по компетенциям, которые есть в базе. </li>" +
            "<li>Загрузить все свои вопросы с помощью специального шаблона.</li>" +
            "<li>Добавить свои вопросы по одному, с помощью специальной формы.</li>" +
            "</ol></div>";
        $res += "</div>";
        /*
        $res += "<div class='hint_box'>";
        $res += "<div class='head'>Вопросы и компетенции</div>";
        $res += "<div class='tx'>В этом разделе вы можете воспользоваться готовыми шаблонами вопросов, загрузить свои или добавить их вручную. " +
            "Также вы можете отредактировать существующие шаблоны под себя или сделать микс из готовых шаблонов, загруженных вопросов, добавляя и редактируя вопросы по своему усмотрению.\n" +
            "Если у вас возникли по добавлению вопросов, ответы на стандартные вопросы вы найдете в справке, если не нашли ответ - напишите письмо в техподдержку, нажав на логотип.</div>";
        $res += "</div>";
        */

        $res += "<table class='tiles_box'><tr>";
        $res += "<td class='tile' tag='template_standart'></td>";
        $res += "<td class='tile' tag='template_load'></td>";
        $res += "<td class='tile' tag='template_manual'></td>";
        $res += "</tr></table>";
    }

    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_hintbox()
{
    let $res = "";
    $res += "<div class='hint_box'>";
    $res += "<div class='btn_close'></div>";
    $res += "<div class='head'>Выбрать вопросы из базы</div>";
    $res += "<div class='tx'>На панели справа, Вы можете выбрать вопросы из компетенций." +
        "<ol>" +
        "<li><span class='icon' tag='insert_comp'></span> на компетенции добавляет компетенцию целиком, со всеми вопросами.</li>" +
        "<li><span class='icon' tag='wrap_comp'></span> раскрывает вопросы компетенции и значком <span class='icon' tag='insert_qst'></span> вы может добавить их по одному.</li>" +
        "<li><span class='icon' tag='hide_comp'></span> скрывает компетенцию. </li>" +
        "</ol>";

    //console.log("$session.presets.is_picked " + $session.presets.is_picked);
    //if ($session.presets.is_picked)
    //    $res += "<br><div>Вами уже был выбран шаблон ответов, чтобы его изменить <b class='btn_answer_set_change'>нажмите сюда</b></div>";
    $res += "</div>";
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_template_standart()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='qst_box_template_standart' "+$nosel+">";
    $res += "<div class='head'>Готовые вопросы по компетенциям</div>";
    //$res += content_qst_answer_set_wnd();

    // HINT BOX
    $res += "<table class='lower_box'><tr>";

    $res += "<tr>";
    $res += "<td topper style='height: 5%;'>";
    $res += "<div class='dirs_wnd'>";
        $res += "<div class='head'><div class='dirs_folder' is_fold='1'></div><div class='icon' type='di'></div><div class='dirs_folding_save'></div>Директории</div>";
        $res += content_qst_dirs("get_html");
    $res += "</div>";

    $res += "<div class='qsts_list'>";
    $res += content_qst_hintbox();
    $res += "<div class='list'>" + content_qst_update_list(true) + "</div>";
    $res += "<table class='btn_box'><tr>";
    $res += "<td><div class='btn' action='back'>Назад</div></td>";
    //$res += "<td><div class='btn' action='show_list'>Список добавленных вопросов</div></td>";
    $res += "<td><div class='btn' action='reset_list'>Очистить список</div></td>"; //
    $res += "<td><div class='btn' action='next'>Продолжить</div></td>";
    $res += "</tr></table>";
    $res += "</div>";

    $res += "</td>";

    $res += "<td rowspan='2' topper>";
    /*
        $res += "<div class='qbook_box'>";
        $res += content_qst_update_qbookbox("get_html");
        $res += "</div>";
*/
    $res += "<div class='comp_box'>";
        $res += "<div class='head'>Компетенции</div>";
        $res += "<div class='btn' action='show_hidden'>" +
            "<div class='img'></div>" +
            "<div class='tx'>Показать скрытые компетенции</div>" +
            "</div>";
        $res += "<div class='list'>" + content_qst_update_compbox(true) + "</div>";
    $res += "</div>";

    $res += "</td>";

    $res += "</tr>";

/*
    $res += "<tr>";
        $res += "<td colspan='2' class='qbook_box'>";
            $res += content_qst_update_qbookbox("get_html");
        $res += "</td>";
    $res += "</tr>";
    */

/*
    $res += "<tr>";
    $res += "<td topper>";





    $res += "</td>";
    */

/*
    $res += "<td class='comp_box'>";
    $res += "<div class='head'>Компетенции</div>";
    $res += "<div class='btn' action='show_hidden'>" +
        "<div class='img'></div>" +
        "<div class='tx'>Показать скрытые компетенции</div>" +
        "</div>";
    $res += "<div class='list'>" + content_qst_update_compbox(true) + "</div>";
    $res += "</div>";
    $res += "</td>";
    */

    $res += "</tr></table>";

    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_template_load()
{
    //if (!TEST_MODE)
    //    window.open(PATH + "Оценка360_(шаблон_загрузки_вопросов).csv");
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='qst_box_template_load' "+$nosel+">";
    $res += "<div class='head'>Загрузить вопросы по компетенциям</div>";

    // HINT BOX
    $res += "<div class='hint_box'>";
    $res += "<div class='btn_close'></div>";
    $res += "<div class='head'>Загрузка вопросов с помощью шаблона</div>";
    $res += "<div class='tx'>На панели справа, Вы можете выбрать вопросы из компетенций." +
        "<ol>" +
        "<li>Скачайте шаблон. Это таблица Excel.</li>" +
        "<li>Согласно инструкции заполните ее.</li>" +
        "<li>Загрузите заполненную таблицу в систему.</li>" +
        "<li>Проверьте правильность введенных вопросов.</li>" +
        "<li>Сохраните.</li>" +
        "</ol></div>";
    $res += "</div>";

    $res += "<table class='desc_box'><tr>";
    /*
        $res += "<td><div class='btn' action='load_qst_template'></div></td>";
        $res += "<td class='tx'>Скачайте шаблон, внесите вопросы из своего опросника в соответствии с таблицей в шаблоне. " +
            "Загрузите файл excel на страницу. " +
            "Выберите одну из стандартных схем ответов.</td>";
            */
    $res += "</tr><tr>";
        $res += "<td colspan='2' class='template_hint'></td>";
    $res += "</tr></table>";
    //$res += content_qst_answer_set_wnd();
    $res += "<table class='btn_box'><tr>";
        $res += "<td><div class='btn' action='back'>Назад</div></td>";
        //$res += "<td><div class='btn' action='show_list'>Список добавленных вопросов</div></td>";
        $res += "<td><div class='btn' action='load_qst_template'>Скачать шаблон</div></td>";
        $res += "<td><div class='btn' action='load'>Загрузить шаблон</div>";
            $res += "<input type='file' accept='.csv, .xlsx' class='fileloader_qsts' value=''>";
        $res += "</td>";
        //$res += "</tr><tr>";
            $res += "<td colspan='4'><div class='btn' action='next'>Продолжить</div></td>";
    $res += "</tr></table>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_template_manual()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='qst_box_template_manual' "+$nosel+">";
    $res += "<div class='head'>Добавить вопросы по компетенциям</div>";
    //$res += content_qst_answer_set_wnd();
    // HINT BOX
    $res += content_qst_hintbox();

    $res += "<table class='lower_box'>";
    $res += "<tr>";
    $res += "<td class='qsts_list'>";
        $res += "<div class='qsts_adder'>";
            $res += "<div class='adder_box'>";
                $res += "<div class='head'>Каждый вопрос вы можете отнести к уже существующей компетенции или создать свою.</div>";
                $res += "<div class='label'>Вопрос</div>";
                $res += "<textarea class='qst_tx' placeholder='Напишите свой вопрос'></textarea>";

                $res += "<div class='holder'>";
                $res += "<div class='left'>";
                    $res += "<div class='label'>Компетенция</div>";
                    $res += "<input class='comp_name' placeholder='Напишите компетенцию'>";
                    $res += "<div class='dummy'></div>";
                $res += "</div>";
                $res += "<div class='right'>";
                    $res += "<table class='btn_box'><tr>";
                    $res += "<td><div class='btn' action='add'>Добавить вопрос</div></td>";
                    $res += "</tr></table>";
                $res += "</div>";
                $res += "</div>";
            $res += "</div>";


        $res += "</div>";
    $res += "<div class='list' template='short'>" + content_qst_update_list(true) + "</div>";
    $res += "<table class='btn_box'><tr>";
    $res += "<td><div class='btn' action='back'>Назад</div></td>";
    //$res += "<td><div class='btn' action='show_list'>Список добавленных вопросов</div></td>";
    $res += "<td><div class='btn' action='reset_list'>Очистить список</div></td>";
    $res += "<td><div class='btn' action='next'>Продолжить</div></td>";
    $res += "</tr></table>";
    $res += "</td>";

    $res += "<td class='comp_box'>";
    $res += "<div class='head'>Компетенции</div>";
    $res += "<div class='btn' action='show_hidden'>" +
        "<div class='img'></div>" +
        "<div class='tx'>Показать скрытые компетенции</div>" +
        "</div>";
    $res += "<div class='list' subtype='manual'>" + content_qst_update_compbox(true) + "</div>";
    $res += "</div>";
    $res += "</td>";

    $res += "</tr></table>";
    return $res;
    /*
    $res += "<div class='adder_box'>";
        $res += "<div class='head'>Каждый вопрос вы можете отнести к уже существующей компетенции или создать свою.</div>";
        $res += "<div class='label'>Вопрос</div>";
        $res += "<textarea class='qst_tx' placeholder='Напишите свой вопрос'></textarea>";
        $res += "<div class='label'>Компетенция</div>";
        $res += "<input class='comp_name' placeholder='Напишите компетенцию'>";
        $res += "<div class='dummy'></div>";
    $res += "</div>";

    $res += "<table class='btn_box'><tr>";
    $res += "<td><div class='btn' action='add'>Добавить</div></td>";
    $res += "</tr></table>";
     */
}


//----------------------------------------------------------------------------------------------------------------------
function content_qst_update_compbox(do_return)
{
    if (do_return === "add_events")
    {
        $(".comp_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {if (qdrag.ord === null) floater_hint("remove");})
            .mouseenter(function()
            {
                if (qdrag.ord === null)
                {
                    let head = "", cont = "";
                    let action = $(this).attr("action");
                    switch (action) {
                        case "show_hidden":
                            head = "Показать все компетенции";
                            cont = "Отобразить в панели все блоки компетенций.";
                            break;
                    }
                    let tx = "<div class='head'>" + head + "</div>" + cont;

                    $(".floater")
                        .css("display", "inline-block")
                        .css("width", "400px")
                        //.css("height", "350px")
                        .css("left", ($curs.x-420)+"px")
                        .css("top", $curs.y+"px")
                        .css("border-color", "#4A67AD")
                        .html(tx);
                }

            })
            .off("click")
            .click(function(){
                let action = $(this).attr("action");
                switch (action) {
                    case "show_hidden":
                        $(".comp_box .list .comp_tile[is_hidden='1']").css("display","block");
                        $(this).css("display","none");
                        break;
                }
            });

        $(".comp_tile .head .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {if (qdrag.ord === null) floater_hint("remove");})
            .mouseenter(function()
            {
                if (qdrag.ord === null)
                {
                    let head = "", cont = "";
                    let action = $(this).attr("action");
                    switch (action) {
                        case "add":
                            head = "Добавить компетенцию";
                            cont = "Добавляет в Ваш список все вопросы данной компетенции (без повторов).";
                            break;
                        case "wrap":
                            head = "Показать/скрыть вопросы";
                            cont = "Отображает/скрывает список всех вопросов, принадлежащих данной компетенции.";
                            break;
                        case "hide":
                            head = "Cкрыть компетенцию";
                            cont = "Скрывает блок компетенции в панели. Чтобы потом вернуть ее нажмите на «Показать все компетенции» вверху блока.";
                            break;
                        case "edit":
                            head = "Редактировать компетенцию";
                            cont = "Редактировать название компетенции.";
                            break;
                    }
                    let tx = "<div class='head'>" + head + "</div>" + cont;

                    $(".floater")
                        .css("display", "inline-block")
                        .css("width", "400px")
                        //.css("height", "350px")
                        .css("left", ($curs.x-420)+"px")
                        .css("top", $curs.y+"px")
                        .css("border-color", "#4A67AD")
                        .html(tx);
                }

            })
            .off("click")
            .click(function(){
                let comp_tile;
                let action = $(this).attr("action");
                let comp_id, comp_name;
                switch (action) {
                    case "add":
                        comp_id = $(this).closest(".comp_tile").attr("id") * 1;
                        comp_name = "?";
                        for (let i=0; i<$ad.comps.length; i++)
                            if ($ad.comps[i].id === comp_id)
                            {
                                comp_name = $ad.comps[i].name;
                                break;
                            }
                        message_ex("show","confirm","add_whole_comp_to_list",{"comp_id": comp_id, "comp_name": comp_name});
                        break;

                    case "edit":
                        comp_id = $(this).closest(".comp_tile").attr("id") * 1;
                        let comp_ord = get_comp_ord_from_comp_id(comp_id);
                        message_ex("show","insert","comp_edit",{comp_ord: comp_ord, comp: $ad.comps[comp_ord]});
                        break;

                    case "wrap":
                        comp_tile = $(this).closest(".comp_tile");

                        if (comp_tile.attr("is_wrapped")*1)
                        {
                            comp_tile.attr("is_wrapped", 0);
                            comp_tile.find(".btn[action='wrap']").css("transform", "rotate(-90deg)");
                            comp_tile.find(".qst_item").css("display","block");
                            comp_tile.find(".notify").css("display","block");
                            comp_tile.css("padding-bottom","5px");
                        }
                        else
                        {
                            comp_tile.attr("is_wrapped", 1);
                            comp_tile.find(".btn[action='wrap']").css("transform", "rotate(0deg)");
                            comp_tile.find(".qst_item").css("display","none");
                            comp_tile.find(".notify").css("display","none");
                            comp_tile.css("padding-bottom","0");
                        }
                        break;

                    case "hide":
                        $(this).closest(".comp_tile")
                            .attr("is_hidden", 1)
                            .css("display","none");

                        $(".comp_box .btn[action='show_hidden']").css("display","block");
                        break;
                }
            });


        $(".qst_item .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {if (qdrag.ord === null) floater_hint("remove");})
            .mouseenter(function()
            {
                if (qdrag.ord === null)
                {
                    let head = "", cont = "";
                    let action = $(this).attr("action");
                    switch (action) {
                        case "add":
                            head = "Добавить вопрос";
                            cont = "Добавляет данный вопрос в текущий список:.<br>" +
                                "1) Если нет выбранных вопросов - помещается вконец списка.<br>" +
                                "2) Если какой-либо вопрос выбран - помещается на его место, сдвигая выбранный вниз " +
                                "(если в это время была зажата клавиша Shift - заменяет выбранный вопрос на этот).";
                            break;
                        case "edit":
                            head = "Редактировать вопрос";
                            cont = "Изменить текст вопроса.";
                            break;

                        case "shift":
                            head = "Переместить вопрос";
                            cont = "Нажмите чтобы обозначить вопрос, который нужно переместить.<br>" +
                                "Затем выберите другой, на место которого нужно поместить этот нажав на кнопку вставки.<br>" +
                                "Чтобы отменить выделение нажмите правую кнопку мыши.";
                            break;
                        case "del":
                            head = "Удалить вопрос";
                            cont = "Удалить вопрос из этой компетенции.";
                            break;
                    }
                    let tx = "<div class='head'>" + head + "</div>" + cont;

                    $(".floater")
                        .css("display", "inline-block")
                        .css("width", "400px")
                        //.css("height", "350px")
                        .css("left", ($curs.x-420)+"px")
                        .css("top", $curs.y+"px")
                        .css("border-color", "#4A67AD")
                        .html(tx); 
                }
                
            })
            .off("click")
            .click(function(){
                let qsts_ord;
                let action = $(this).attr("action");
                let qid;
                switch (action) {
                    case "add":
                        qsts_ord = $(this).closest(".qst_item").attr("qsts_ord") * 1;
                        let qst = duplicate($ad.qsts[qsts_ord]);
                        // Check if this qst already selected for the qbook
                        if (check_quiz_qst_duplicate(qst.id))
                        {
                            message_ex("show","info","direct","Данный вопрос уже имеется в Вашем списке опросника.")
                        }
                        else
                        {
                            if (!qdrag.land_src_qid) // add to the end of the list
                                $new_qz.qst_list.push(qst); // add qst to list
                            else // insert right before the selected item in the list
                            {
                                let gofrom_ord = null;
                                for (i=0; i<=$new_qz.qst_list.length; i++)
                                    if (qdrag.land_src_qid === $new_qz.qst_list[i].id)
                                    {
                                        gofrom_ord = i;
                                        break;
                                    }

                                if (null !== gofrom_ord)
                                {
                                    if ($keyboard.is_down.indexOf(16) !== -1) // left shift is held - do a switcharoo
                                    {
                                        $new_qz.qst_list[gofrom_ord] = duplicate(qst); // set it to src slot with all the data
                                        qdrag.land_src_qid = qst.id; // since we switched the qst, we write it's id to selected qid instead of the prev one
                                    }
                                    else // move into a slot with a shift
                                    {
                                        // insert saved qst's info into this slot's ord shifting the existing one down
                                        $new_qz.qst_list.splice(gofrom_ord, 0, duplicate(qst));
                                    }
                                    floater_hint("remove");
                                }
                            }

                            content_qst_update_list(false); // refresh list visually
                            qdrag.insert_anim("on");
                        }
                        break;

                    case "edit":
                        qsts_ord = $(this).closest(".qst_item").attr("qsts_ord") * 1;
                        qid = $ad.qsts[qsts_ord].id;
                        message_ex("show","insert","qst_edit",{qst: $ad.qsts[qsts_ord], q_ord: qsts_ord});
                        break;

                    case "del":
                        qsts_ord = $(this).closest(".qst_item").attr("qsts_ord") * 1;
                        qid = $ad.qsts[qsts_ord].id;

                        let can_delete = true;
                        let involvement_list = [];
                        // chk qst involvement in all present quizes
                        if ($ad.qzs.length)
                            $ad.qzs.forEach(function (v_qz) {
                                v_qz.resps.forEach(function (v_group, i_group) {
                                    if (v_qz.settings.comm_groups[i_group].hasOwnProperty("qb_id") && v_qz.settings.comm_groups[i_group].qb_id)
                                    {
                                        let qb_id = v_qz.settings.comm_groups[i_group].qb_id;
                                        let qb_ord = get_qb_ord_from_qb_id(qb_id);
                                        let q_list = $ad.qbooks[qb_ord].list;
                                        if (q_list.indexOf(qid) !== -1)
                                        {
                                            let slot = {
                                                qz_name: v_qz.name,
                                                gr_name: "",
                                            };
                                            let resp_id = v_group[0].id;
                                            let resp_ord = get_resp_ord_from_resp_id(resp_id);
                                            slot.gr_name = $ad.resps[resp_ord].fio;
                                            involvement_list.push(slot); // record all involvement places
                                            can_delete = false;
                                        }
                                    }
                                });
                            });

                        if (!can_delete)
                        {
                            let s = "Вопрос не может быть удален, потому что он задействован в таких группах:<br><br>";
                            involvement_list.forEach(function (v_slot, i) {
                                s += i + ") <b>" + involvement_list.qz_name +" </b> в группе  <b>"+ involvement_list.gr_name +"</b><br>";
                            });
                            message_ex("show","info","direct_full", {head:"Удаление вопроса запрещено", tx: s});
                        }
                        else
                            message_ex("show","confirm","qst_del",{qst: $ad.qsts[qsts_ord], q_ord: qsts_ord});
                        break;

                    case "hide":
                        /*
                        $(this).closest(".comp_tile")
                            .attr("is_hidden", 1)
                            .css("display","none");
                            */
                        break;
                }
            });

        // Qst drag start
        $(".qst_item .tx")
            .off("mouseenter").off("mouseleave").mouseleave(function() {
                if (qdrag.ord === null) // don't remove if we are drag'n'dropping
                    floater_hint("remove");
            })
            .mouseenter(function()
            {
                if ($new_qz.qst_screen_id === 3 && qdrag.ord === null) // only for manual editing screen
                {
                    let head = "Текст вопроса";
                    let cont = "Чтобы автоматически заполнить поле «вопрос» данным текстом, зажмите над текстом левую кнопку мыши, а затем поместите указатель над полем и отпустите кнопку.";
                    let tx = "<div class='head'>" + head + "</div>" + cont;

                    $(".floater")
                        .css("display", "inline-block")
                        .css("width", "400px")
                        //.css("height", "350px")
                        .css("left", ($curs.x-415) + "px")
                        .css("top", $curs.y + "px")
                        .css("border-color", "#4A67AD")
                        .html(tx);
                }
            })
            .off("mousedown")
            .mousedown(function(){
                qdrag.ord = $(this).closest(".qst_item").attr("qsts_ord") * 1; // get this qst's global ord in qsts array
                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "350px")
                    .css("min-height", "120px")
                    .css("left", ($curs.x-350)+"px")
                    .css("top", $curs.y+"px")
                    .css("border-color", "#4A67AD")
                    .html($ad.qsts[qdrag.ord].tx);
            });
        $(document)
            .off("mouseup")
            .mouseup(function(){
                // any drag was going on
                if (qdrag.ord)
                {
                    switch (qdrag.destination) {

                        // Fill dragged qst info into the inputs
                        case "qst_tx_input":
                            let qst = $ad.qsts[qdrag.ord];
                            $(".adder_box .qst_tx").val(qst.tx);
                            let comp = $ad.comps[$comps_id_map[qst.comp_id]];
                            $(".adder_box .comp_name").val(comp.name);
                            break;
                    }
                    console.log(qdrag);
                    qdrag.ord = null;
                    qdrag.destination = null;
                    $(".floater").css("display", "none");
                }
            });
    }
    else
    {
        let s = "";
        if ($ad.comps.length)
            $ad.comps.forEach(function (v_comp) {
                s += "<div class='comp_tile'  is_wrapped='1' is_hidden='0' id='"+ v_comp.id +"'>";
                s += "<table class='head'><tr>";
                s += "<td><div class='btn' action='add'></div></td>";
                s += "<td><div class='name'>" + v_comp.name + "</div></td>";
                s += "<td><div class='btn' action='wrap'></div></td>";
                s += "<td><div class='btn' action='edit'></div></td>";
                s += "<td><div class='btn' action='hide'></div></td>";
                s += "</tr></table>";

                let qst_added = 0;
                if ($ad.qsts.length)
                    $ad.qsts.forEach(function (v_qst, i_qst) {
                        if (v_qst.comp_id === v_comp.id)
                        {
                            qst_added++;
                            s += "<div class='qst_item' qsts_ord='"+i_qst+"'>";
                            s += "<div class='opts_box'>";
                            //s += "<div class='btn' action='shift'></div>";
                            s += "<div class='btn' action='edit'></div>";
                            s += "<div class='btn' action='add'></div>";
                            s += "</div>";
                            s += "<div class='tx'><span class='q_index'>" + qst_added + ".</span> <span class='string'>" + v_qst.tx + "</span></div>";
                            s += "</div>";
                        }
                    });

                if (!qst_added)
                    s += "<div class='notify'>Нет ни одного вопроса</div>";
                s += "</div>";
            });

        if (do_return === true)
            return s;
        else
        {
            $(".lower_box .comp_box .list")
                .empty()
                .append(s);
            content_qst_update_compbox("add_events");
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_qbook_qst_list_unique(list) {
    // return order index for the first matched qb_list
    // or "true" if unique
    let is_unique = true;
    let ids_list = [];
    list.forEach(function (slot) {
        ids_list.push(slot.id);
    });

    if ($ad.qbooks.length)
        for (let i=0; i<$ad.qbooks.length; i++)
            if ($ad.qbooks[i].list.length === ids_list.length)
            {
                let mismatch = 0;
                for (let q=0; q<ids_list.length; q++)
                    if (ids_list[q] !== $ad.qbooks[i].list[q])
                    {
                        mismatch++;
                        break;
                    }

                if (!mismatch)
                {
                    is_unique = i;
                    break;
                }
            }

    return is_unique;
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_update_qbookbox(action)
{
    if (action === "add_events")
    {
        $(".qbook_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {if (qdrag.ord === null) floater_hint("remove");})
            .mouseenter(function()
            {
                if (qdrag.ord === null)
                {
                    let head = "", cont = "";
                    let action = $(this).attr("action");
                    switch (action) {
                        case "back":
                            break;

                        case "save":
                            head = "Сохранить текущий список вопросов";
                            cont = "Настроив свой специализированный список, Вы можете сохранить его в шаблон, " +
                                "а затем при необходимости быстро загружать нажатием на «Загрузить из шаблона».";
                            break;

                        case "load":
                            head = "Добавить в список вопросы из шаблона";
                            cont = "Возможность пополнить Ваш список, перечнем вопросов/компетенций, загрузив их из стандартных и/или своих шаблонов.";
                            break;
                    }
                    let tx = "<div class='head'>" + head + "</div>" + cont;

                    if (action !== "back")
                        $(".floater")
                            .css("display", "inline-block")
                            .css("width", "400px")
                            //.css("height", "350px")
                            .css("left", ($curs.x-420)+"px")
                            .css("top", $curs.y+"px")
                            .css("border-color", "#4A67AD")
                            .html(tx);
                }
            })
            .off("click")
            .click(function(){
                let action = $(this).attr("action");
                switch (action) {
                    case "back":
                        $(this).css("display","none");
                        $(".qbook_box .btn_box .btn[action='load']").css("display","block");
                        $(".qbook_box .btn_box .btn[action='save']").css("display","block");
                        $(".qbook_box .list").remove(); // remove list
                        break;

                    case "save":

                        if (!$new_qz.qst_list.length)
                            message_ex("show","info","direct","Шаблон опросника, который Вы хотите сохранить, пуст.");
                        else
                        {
                            let qb_match_id = content_qst_qbook_qst_list_unique($new_qz.qst_list); // gives "true" if qbook is unique
                            if (qb_match_id !== true)
                                message_ex("show","insert","qbook_save",{
                                    qst_list: $new_qz.qst_list,
                                    name: $ad.qbooks[qb_match_id].name,
                                    qb_ord: qb_match_id
                                });
                            else
                                message_ex("show","insert","qbook_save_as",{
                                    qst_list: $new_qz.qst_list,
                                    qb_ord: qb_match_id});

                        }
                        break;

                    case "load":
                        $(".qbook_box .list").remove();

                        if (!$ad.qbooks.length)
                            message_ex("show","info","direct","Не ни одного готового опросника.");
                        else
                        {
                            let s = "";
                            s += "<table class='list'>";
                            $ad.qbooks.forEach(function (v_qb, i_qb) {
                                s += "<tr><td><div class='item' ord='"+ i_qb +"'>"+ v_qb.name +"</div></td></tr>";
                            });
                            s += "</table>";
                            $(".qbook_box .btn_box").after(s);

                            // Events
                            $(".qbook_box .list .item")
                                .off("mouseenter")
                                .mouseenter(function () {
                                    let qbook_ord = $(this).attr("ord") * 1;
                                    let qst_list = $ad.qbooks[qbook_ord].list;
                                    let str = "<div class='hint'>";
                                    let comp_list =  comps_list_from_qsts(qst_list);
                                    str += "<div class='pointer'></div>";
                                    str += "<div class='list_head'>Содержит компетенции</div>";
                                    comp_list.forEach(function (v_comp, i_comp) {
                                        str += "<div class='comp'>" + (i_comp + 1) + ") "+ v_comp.name +"</div>";
                                    });

                                    str += "</div>";
                                    $(this).closest("td").append(str);
                                })
                                .off("mouseleave")
                                .mouseleave(function () {
                                    $(".qbook_box .list .hint").remove();
                                })
                                .off("click")
                                .click(function () {
                                    let qbook_ord = $(this).attr("ord") * 1;
                                    message_ex("show","confirm","qbook_template_insert",{"qbook_ord": qbook_ord});
                                });

                            $(".qbook_box .btn_box .btn[action='back']").css("display","block");
                            $(".qbook_box .btn_box .btn[action='load']").css("display","none");
                            $(".qbook_box .btn_box .btn[action='save']").css("display","none");
                        }


                        break;
                }
            });
    }
    else
    {
        let s = "";
        s += "<div class='head'>Опросники</div>";
        s += "<table class='btn_box'><tr><td>";
        s += "<div class='btn' action='back'>Вернуться</div>";
        s += "<div class='btn' action='save'>Сохранить шаблон</div>";
        s += "<div class='btn' action='load'>Загрузить из шаблона</div>";
        s += "</td></tr></table>";

        if (action === "get_html")
            return s;
        else
        if (action === "update_self")
        {
            $(".lower_box .comp_box .list")
                .empty()
                .append(s);
            content_qst_update_qbookbox("add_events");
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_update_list(do_return)
{

    if (do_return === "add_events")
    {
        // Set header for qsts list
        $(".lower_box .qsts_list .head").remove();
        let list_qst_qnt = $new_qz.qst_list.length;

        if (list_qst_qnt) {
            let tx = "вопросов";
            if (list_qst_qnt % 10 === 1)
                tx = "вопрос";
            else
            if ([2,3,4].indexOf(list_qst_qnt % 10) !== -1)
                tx = "вопроса";

            $(".lower_box .qsts_list .list")
                .before("<div class='head'>В опроснике " + $new_qz.qst_list.length +" "+ tx +"</div>");
        }

        // Btn box actions
        $(".qsts_list .list+.btn_box .btn")
            .off("click")
            .click(function(){
                let action = $(this).attr("action");
                switch (action) {

                    case "back":
                        $new_qz.qst_screen_id = 0;
                        show_content("qst");
                        break;

                    case "reset_list":
                        $new_qz.qst_list = [];
                        content_qst_update_list(false);
                        break;

                    case "show_list":
                        let s = "";// <h2>Список добавленных вопросов:</h2>";
                        let list = [];
                        let comp_names = [];
                        $ad.comps.forEach(function (v_comp) {
                            comp_names[v_comp.id] = v_comp.name;
                        });

                        // Sort qsts by competentions into slots
                        if ($new_qz.qst_list.length)
                            $new_qz.qst_list.forEach(function (v_qst, i_qst) {
                                // No qst was added to this comp slot yet
                                if (!list[v_qst.comp_id])
                                    list[v_qst.comp_id] = [];

                                list[v_qst.comp_id].push(v_qst.tx);
                            });

                        let qst_ord = 0;
                        list.forEach(function (v_comp, i_comp) {
                            s += "<h3>"+comp_names[i_comp]+"</h3>";
                            v_comp.forEach(function (v_qst, i_qst) {
                                qst_ord++; // for absolute numeration
                                s += "<div>" + (i_qst + 1) + ". "+ v_qst +"</div>";
                            });
                        });
                        message_ex("show","info","direct_full", {"tx":s, "head": "Список добавленных вопросов:"});
                        break;



                    case "next":
                        if (1 === $new_qz.qst_screen_id)
                        {
                            $new_qz.qst_screen_id = 4; // go to second sub tab
                        }
                        else
                            $new_qz.qst_screen_id = 1; // go to central qst screen to show all the questions
                        show_content("qst");
                        //content_qst_goto_answer_sets_screen();
                        /*
                        if (qbook_size_check())
                        {
                            // skip the answer sets picking part, if was picked before
                            if ($session.presets.is_picked)
                                content_qst_goto_deli_screen();
                            else
                                content_qst_goto_answer_sets_screen();
                        }
                        */
                        break;
                }
            });

        // Remove qst from list
        $(".qst_tile .btn_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                if (qdrag.ord === null)
                {
                    let head = "", cont = "";
                    let action = $(this).attr("action");
                    switch (action) {
                        case "delete":
                            floater_hint("show",{
                                head: "Удалить вопрос",
                                tx: "Удаляет данный вопрос из Вашего текущего списка.",
                                w: 400,
                                dx: -420,
                                dy: 20,
                            });
                            break;

                        case "shift":
                            floater_hint("show",{
                                head: "Переместить вопрос",
                                tx: "Нажмите чтобы обозначить вопрос, который нужно переместить.<br>" +
                                    "Затем выберите другой, на место которого нужно поместить этот нажав на кнопку вставки.<br>" +
                                    "Чтобы отменить выделение нажмите правую кнопку мыши.",
                                w: 400,
                                dx: -420,
                                dy: -150,
                            });
                            break;

                        case "land_down":
                            floater_hint("show",{
                                head: "Вставка со смещением вниз",
                                tx: "Поместить выбранный вопрос на месте этого, сместив его вниз.<br>" +
                                "Если в это время удерживать клавишу Shift - вопросы меняются местами.",
                                w: 400,
                                dx: -420,
                                dy: 20,
                            });
                            break;

                        case "land_up":
                            floater_hint("show",{
                                head: "Вставка со смещением вверх",
                                tx: "Поместить выбранный вопрос на месте этого, сместив его вверх.<br>" +
                                "Если в это время удерживать клавишу Shift - вопросы меняются местами.",
                                w: 400,
                                dx: -420,
                                dy: 20,
                            });
                            break;
                    }
                }

            })
            .off("click")
            .click(function(){
                let action = $(this).attr("action");
                let ord = $(this).closest(".qst_tile").attr("list_ord")*1;

                switch (action) {
                    case "delete":
                        floater_hint("remove"); // del the hint so when all qsts are deleted it wont stay afloat
                        $new_qz.qst_list.splice(ord, 1);
                        content_qst_update_list(false); // redraw list
                        break;

                    case "shift":
                        qdrag.land_src_qid = $new_qz.qst_list[ord].id;
                        qdrag.land_src_type = "list";
                        qst_shifting_highlights();
                        break;

                    case "land_down":
                        // insert new qst from a comp
                        if ("comp" === qdrag.land_src_type)
                        {

                        }
                        else
                        // swipe two qst inside the list
                        if ("list" === qdrag.land_src_type)
                        {
                            let gofrom_ord = null;
                            for (i=0; i<=$new_qz.qst_list.length; i++)
                            if (qdrag.land_src_qid === $new_qz.qst_list[i].id)
                            {
                                gofrom_ord = i;
                                break;
                            }

                            if (null !== gofrom_ord)
                            {
                                if ($keyboard.is_down.indexOf(16) !== -1) // left shift is held - do a switcharoo
                                {
                                    let q_ord = get_qst_ord_from_qst_id($new_qz.qst_list[ord].id); // ord of dest qst
                                    $new_qz.qst_list[gofrom_ord] = duplicate($ad.qsts[q_ord]); // set it to src slot with all the data
                                    q_ord = get_qst_ord_from_qst_id(qdrag.land_src_qid); // ord of src qst
                                    $new_qz.qst_list[ord] = duplicate($ad.qsts[q_ord]); // put it into the dest slot ...
                                }
                                else // move into a slot with a shift
                                {
                                    let dest_qid = $new_qz.qst_list[ord].id;
                                    let slot = duplicate($new_qz.qst_list[gofrom_ord]); // save the slot's info
                                    $new_qz.qst_list.splice(gofrom_ord, 1); // remove the moving qst from the list

                                    for (i=0; i<=$new_qz.qst_list.length; i++) // find out a !new! ord that the dest is in now
                                        if (dest_qid === $new_qz.qst_list[i].id)
                                        {
                                            ord = i;
                                            break;
                                        }

                                    // insert saved qst's info into this slot's ord shifting the existing one down
                                    $new_qz.qst_list.splice(ord, 0, slot);
                                }

                                floater_hint("remove");
                                content_qst_update_list(false); // update the list
                                qdrag.land_src_qid = 0;
                                qdrag.land_dest_qid = 0;
                                qst_shifting_highlights();

                            }
                        }
                        break;

                    case "land_up":
                        // insert new qst from a comp
                        if ("comp" === qdrag.land_src_type)
                        {

                        }
                        else
                        // swipe two qst inside the list
                        if ("list" === qdrag.land_src_type)
                        {
                            let gofrom_ord = null;
                            for (i=0; i<=$new_qz.qst_list.length; i++)
                                if (qdrag.land_src_qid === $new_qz.qst_list[i].id)
                                {
                                    gofrom_ord = i;
                                    break;
                                }

                            if (null !== gofrom_ord)
                            {
                                if ($keyboard.is_down.indexOf(16) !== -1) // left shift is held - do a switcharoo
                                {
                                    let q_ord = get_qst_ord_from_qst_id($new_qz.qst_list[ord].id); // ord of dest qst
                                    $new_qz.qst_list[gofrom_ord] = duplicate($ad.qsts[q_ord]); // set it to src slot with all the data
                                    q_ord = get_qst_ord_from_qst_id(qdrag.land_src_qid); // ord of src qst
                                    $new_qz.qst_list[ord] = duplicate($ad.qsts[q_ord]); // put it into the dest slot ...
                                }
                                else // move into a slot with a shift
                                {
                                    let dest_qid = $new_qz.qst_list[ord].id;
                                    let slot = duplicate($new_qz.qst_list[gofrom_ord]); // save the slot's info
                                    $new_qz.qst_list.splice(gofrom_ord, 1); // remove the moving qst from the list

                                    for (i=0; i<=$new_qz.qst_list.length; i++) // find out a !new! ord that the dest is in now
                                        if (dest_qid === $new_qz.qst_list[i].id)
                                        {
                                            ord = i;
                                            break;
                                        }

                                    // insert saved qst's info into this slot's ord shifting the existing one up
                                    $new_qz.qst_list.splice(ord + 1, 0, slot);
                                }

                                floater_hint("remove");
                                content_qst_update_list(false); // update the list
                                qdrag.land_src_qid = 0;
                                qdrag.land_dest_qid = 0;
                                qst_shifting_highlights();
                            }
                        }
                        break;
                }
            });
    }
    else
    {
        let s = "";
        if ($new_qz.qst_list.length)
            $new_qz.qst_list.forEach(function (v_qst, i_qst) {
                // Get related competention name
                let comp_name = "? not found ?";
                if ($ad.comps)
                    for (let i=0; i<$ad.comps.length; i++)
                        if ($ad.comps[i].id === v_qst.comp_id)
                        {
                            comp_name = $ad.comps[i].name;
                            break;
                        }

                s += "<div class='qst_tile' list_ord='"+i_qst+"'>";
                s += "<div class='content'>";
                s += "<div class='tx'>" +(i_qst+1) + ". " + v_qst.tx + "</div>";
                s += "<div class='comp_btn'>" + comp_name + "</div>";
                s += "</div>";
                s += "<div class='btn_box'>";
                    //s += "<div class='btn' action='edit'></div>";
                    s += "<div class='btn' action='land_down'></div>";
                    s += "<div class='btn' action='land_up'></div>";
                    s += "<div class='btn' action='shift'></div>";
                    s += "<div class='btn' action='delete'></div>";
                s += "</div>";
                s += "</div>";
            });
        else
            s += "<span class='notify'>Список вопросов пустой</span>";

        if (do_return === true)
            return s;
        else
        {
            $(".lower_box .qsts_list .list")
                .empty()
                .append(s);
            content_qst_update_list("add_events");
            qst_shifting_highlights();
        }
    }
}



//----------------------------------------------------------------------------------------------------------------------
function qst_shifting_highlights()
{

    if (qdrag.land_src_qid) // smthn is selected for shifting
    {
        if ("comp" === qdrag.land_src_type)
        {
            $(".comp_box .qst_item").css("background-color","initial"); // make all white
            let qord = get_qst_ord_from_qst_id(qdrag.land_src_qid);
            $(".comp_box .qst_item[qsts_ord='"+ qord +"']").css("background-color","#b9e3ff"); // hl selected
        }
        else
        if ("list" === qdrag.land_src_type)
        {
            $(".qsts_list .qst_tile").css("background-color","initial"); // make all white
            let list_ord = null;
            if ($new_qz.qst_list.length) // get the ord of picked qst id in q_list buffer
                for (let i=0; i<$new_qz.qst_list.length; i++)
                    if ($new_qz.qst_list[i].id === qdrag.land_src_qid)
                    {
                        list_ord = i;
                        break;
                    }

            if (null !== list_ord)
                $(".qsts_list .qst_tile[list_ord='"+ list_ord +"']").css("background-color","#b9e3ff"); // hl selected
        }

        $(".comp_box .qst_item .btn[action='land_down'], .comp_box .qst_item .btn[action='land_up']").css("display","inline-block"); // hide all "shift-to" buttons
        $(".qsts_list .qst_tile .btn[action='land_down'], .qsts_list .qst_tile .btn[action='land_up']").css("display","inline-block"); // show all "shift-to" buttons
    }
    // deselect all
    else
    {
        $(".comp_box .qst_item").css("background-color","initial"); // make all white
        $(".qsts_list .qst_tile").css("background-color","initial"); // make all white

        $(".comp_box .qst_item .btn[action='land_down'], .comp_box .qst_item .btn[action='land_up']").css("display","none"); // hide all "shift-to" buttons
        $(".qsts_list .qst_tile .btn[action='land_down'], .qsts_list .qst_tile .btn[action='land_up']").css("display","none"); // hide all "shift-to" buttons
    }
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_events()
{
    $('.qst_box').off("mousedown")
        .mousedown(function(event) {
            switch (event.which) {
                case 1:
                    //alert('Left Mouse button pressed.');
                    break;
                case 2:
                    //alert('Middle Mouse button pressed.');
                    break;
                case 3:
                    qdrag.land_src_qid = 0;
                    qdrag.land_dest_qid = 0;
                    qst_shifting_highlights();
                    //alert('Right Mouse button pressed.');
                    break;
                default:
                    //alert('You have a strange Mouse!');
            }
        });


    // ************************************     MAIN WINDOW EVENTS     ********************************************
    $(".hint_box .btn_close").off("click").click(function() { $(this).closest(".hint_box").remove(); });

    //---------------------------------

    $(".qst_box .tiles_box .tile")
        .off("click")
        .click(function()
        {
            //$new_qz.answer_set_id = 2; // reset picked answer set
            let tag = $(this).attr("tag");
            let content = "";
            switch (tag) {
                case "template_standart":
                    content = content_qst_template_standart();
                    $new_qz.qst_screen_id = 1; // remember the exact srenn user was last into
                    break;

                case "template_load":
                    content = content_qst_template_load();
                    $new_qz.qst_screen_id = 2; // remember the exact srenn user was last into
                    break;

                case "template_manual":
                    content = content_qst_template_manual();
                    $new_qz.qst_screen_id = 3; // remember the exact srenn user was last into
                    break;
            }

            if (content)
            {
                $(".qst_box")
                    .empty()
                    .append(content);

                // Rewire events
                content_qst_events();
                $session.set();
            }
        });

    $(".qst_box .btn_answer_set_change")
        .off("click")
        .click(function()
        {
            last_qst_screen_id = $new_qz.qst_screen_id;
            content_qst_goto_answer_sets_screen();
        });

    // ************************************     COMPETENTIONS BOX EVENTS     *******************************************
    content_qst_update_compbox("add_events");

    // ************************************     ANSWER SET EVENTS     **************************************************
    if ($new_qz.qst_screen_id === 5)
        content_qst_answer_sets_events();

    // ************************************     QUESTIONS LIST EVENTS     **********************************************
    content_qst_update_list("add_events");
    // ************************************     TEMPLATE_STANDART EVENTS     *******************************************
    content_qst_update_qbookbox("add_events");

    // ************************************     TEMPLATE_LOAD EVENTS     ***********************************************
    $(".fileloader_qsts")
        .change(function(e){
            let reader = new FileReader();
            reader.readAsArrayBuffer(e.target.files[0]); // windows-1251 utf-8
            reader.onload = function(e)
            {
                let data = new Uint8Array(e.target.result);
                let workbook = XLSX.read(data, {type: 'array'});
                let qst_list = workbook_to_array(workbook, 2); // get array of imported resps with all their fields being named
                import_qsts(qst_list); // separate linear array by focus persona groups
                $(".fileloader_qsts").val(""); // reset to be able to import same file right away
                //let html = XLSX.write(workbook, {sheet:workbook.SheetNames[0], type:"binary", bookType:"html"});
                //import_qsts(reader.result);
            };

            /*
            let $ufile  = e.target.files[0];
            reader = new FileReader();
            reader.readAsText($ufile, "windows-1251");
            reader.onload = function()
            {


                import_qsts(reader.result);
                $(".fileloader_qsts").val(""); // reset to be able to import same file right away

            };
            */
        });

    $(".qst_box_template_load .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {
                case "load_qst_template":
                    window.open(PATH + "Оценка360_(шаблон_загрузки_вопросов).xlsx");
                    break;

                case "back":
                    $new_qz.qst_screen_id = 0;
                    show_content("qst");
                    break;

                case "show_list":
                    let s = "";// <h2>Список добавленных вопросов:</h2>";
                    let list = [];
                    let comp_names = [];
                    $ad.comps.forEach(function (v_comp) {
                        comp_names[v_comp.id] = v_comp.name;
                    });

                    // Sort qsts by competentions into slots
                    if ($new_qz.qst_list.length)
                        $new_qz.qst_list.forEach(function (v_qst, i_qst) {
                            // No qst was added to this comp slot yet
                            if (!list[v_qst.comp_id])
                                list[v_qst.comp_id] = [];

                            list[v_qst.comp_id].push(v_qst.tx);
                        });

                    let qst_ord = 0;
                    list.forEach(function (v_comp, i_comp) {
                        s += "<h3>"+comp_names[i_comp]+"</h3>";
                        v_comp.forEach(function (v_qst, i_qst) {
                            qst_ord++; // for absolute numeration
                            s += "<div>" + (i_qst + 1) + ". "+ v_qst +"</div>";
                        });
                    });
                    message_ex("show","info","direct_full", {"tx":s, "head": "Список добавленных вопросов:"});

                    break;

                case "load":
                    $(".fileloader_qsts").trigger("click");
                    //show_content("deli_set");
                    break;

                case "next":
                    $new_qz.qst_screen_id = 1; // go to central qst screen to show all the questions
                    show_content("qst");
                    //content_qst_goto_answer_sets_screen();
                    /*
                    if (qbook_size_check())
                    {
                        if ($session.presets.is_picked)
                            content_qst_goto_deli_screen();
                        else
                            content_qst_goto_answer_sets_screen();
                    }
                    */
                    break;
            }
        });

    // ************************************     TEMPLATE_MANUAL EVENTS     *********************************************

    // Override for default input:file handle
    $(".qst_box_template_manual .qsts_adder .qst_tx")
        .off("mouseenter")
        .off("mouseleave")
        .mouseenter(function(){
            // Show active of floater to signal avaliable drop-in
            if(qdrag.ord)
            {
                qdrag.destination = "qst_tx_input";
                $(".floater")
                    .css("border-color", "#4cff5f");
            }

        })
        .mouseleave(function(){
            // Revert active state to default by border color
            if(qdrag.ord)
            {
                qdrag.destination = null;
                $(".floater")
                    .css("border-color", "#4A67AD");
            }
        });

    // Override for default input:file handle
    $(".qst_box_template_manual .qsts_adder .comp_name")
        .off("focus")
        .off("focusout")
        .focus(function(){
            let s = "<div class='comps_helper'>";
            s += "<div class='head'>Быстрое заполнение</div>";
            // Get all comp names
            let comp_list = [];
            if ($ad.comps.length)
                $ad.comps.forEach(function (v_entry) {
                    comp_list.push(v_entry.name);
                });
            comp_list = comp_list.sort(); // Alphabetic sort
            // Add to clipboard
            comp_list.forEach(function (v_entry) {
                s += "<div class='tile'>" + v_entry + "</div>";
            });
            s += "</div>";
            $(".dummy").append(s);

            // Add events
            $(".comps_helper .tile")
                .off("click")
                .off("mouseenter")
                .off("mouseleave")
                .click(function(){
                    $(".qst_box_template_manual .qsts_adder .comp_name")
                        .val($(this).html())
                        .focus();

                })
                .mouseenter(function(){
                    unfocus_block = true;
                })
                .mouseleave(function(){
                    unfocus_block = false;
                });
        })
        .focusout(function(){
            if(!unfocus_block)
                $(".comps_helper").remove();
        });

    $(".qst_box_template_manual .adder_box .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {
                case "add":
                    let form = {};
                    form.tx = strip_tags($(".qsts_adder .qst_tx").val().trim());
                    let tx_test = form.tx.toLowerCase();
                    form.comp_name = strip_tags($(".qsts_adder .comp_name").val().trim());
                    let comp_name = form.comp_name.toLowerCase();
                    // Check if comp is existant or new
                    form.comp_id = null;
                    if ($ad.comps.length && comp_name)
                        for (let i=0; i<$ad.comps.length; i++)
                            if ($ad.comps[i].name.toLowerCase() === comp_name)
                            {
                                form.comp_id = $ad.comps[i].id;
                                break;
                            }
                    // Check if qst_tx is unique
                    let match = "none";
                    let match_comp_name = "";
                    if ($ad.qsts.length)
                        for (let i=0; i<$ad.qsts.length; i++)
                            if ($ad.qsts[i].tx.toLowerCase() === tx_test)
                            {
                                if ($ad.qsts[i].comp_id === form.comp_id)
                                {
                                    match = "full";
                                    break;
                                }
                                else
                                {
                                    match = "part";
                                    // get the matching qst_tx comp's name
                                    if ($ad.comps.length)
                                        for (let i=0; i<$ad.comps.length; i++)
                                            if ($ad.comps[i].id === $ad.qsts[i].comp_id)
                                            {
                                                match_comp_name = $ad.qsts[i].name;
                                                break;
                                            }
                                }
                            }

                    if (match === "full")
                        message_ex("show","info","direct","Данный вопрос в компетенции уже имеется.");
                    else if (!comp_name)
                        message_ex("show","info","direct","Укажите название компетенции.");
                    else if (!form.tx)
                        message_ex("show","info","direct","Введите текст вопроса.");
                    else if (match === "part")
                        message_ex("show","confirm","direct","Вопрос с таким содержанием имеется в компетенции <b>"+match_comp_name+"</b>, продолжить?.",form,"qst_add_notice");
                    else
                        sendAJ("qst_add", JSON.stringify(form), "single");
                    break;
            }
        });

    // ************************************     SUB-TABS OF THE QST SCREEN     *********************************************
    content_qst_tabs_update();

    // ************************************     ALL DIRS WINDOW EVENTS     *********************************************
    if ([1,4].indexOf($new_qz.qst_screen_id) !== -1)
        dirs_wnd_events();

    if ($new_qz.qst_screen_id === 4)
        content_qst_adapt_screen_events();

}



//----------------------------------------------------------------------------------------------------------------------
function content_qst_goto_answer_sets_screen()
{
    $new_qz.qst_screen_id = 5;
    $(".qst_box")
        .empty()
        .append(content_qst_answer_sets());
    content_qst_events(); // Rewire events
    $session.set();
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_goto_deli_screen()
{
    new_qz_tab_progress(3);
    $new_qz.deli_screen_id = 1;
    show_content("deli_set");
}



//----------------------------------------------------------------------------------------------------------------------
function content_qst_tabs()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='qst_tabs_box' "+$nosel+">";
    $res += "<div class='tab' tag='modes' ord='0' "+$nosel+">Настройка<br>шаблонов</div>";
    $res += "<div class='tab' tag='adapt' ord='4' "+$nosel+">Настройка<br>опросников</div>";
    $res += "<div class='tab' tag='answers' ord='5' "+$nosel+">Настройка<br>ответов</div>";
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_tabs_update() {
    // Selected tab appearance to custom
    $(".qst_tabs_box .tab").each(function (index)
    {
        let ord = $(this).attr("ord") * 1;

        if (ord === $new_qz.qst_screen_id || ($new_qz.qst_screen_id <= 3 && ord <= 3))
        {
            $(this).css("background-color","#D5DDEF");
        }
        else if (ord <= $new_qz.qst_screen_id_max)
        {
            $(this).css("background-color","#EFEFEF");
        }
        else
        {
            $(this).css("background-color","white");
        }
    });
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_tabs_progress(val) {
    if (null !== val && undefined !== val)
    {
        $new_qz.qst_screen_id = val;
        if ($new_qz.qst_screen_id > $new_qz.qst_screen_id_max)
            $new_qz.qst_screen_id_max = $new_qz.qst_screen_id;
        $session.set();
    }
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_tabs_events()
{
    content_qst_tabs_update();

    $(".qst_tabs_box .tab")
        .off("click")
        .click(function()
        {
            let ord = $(this).attr("ord") * 1;
            console.log(ord);
            // Must be dublicated here for selected tabs to change clrs correctly
            if (ord <= $new_qz.qst_screen_id_max)  //  ord === 1 || ord <= $new_qz.qst_screen_id_max
            {
                content_qst_tabs_progress(ord);
                show_content("qst");
                $session.set();
            }
        });
}
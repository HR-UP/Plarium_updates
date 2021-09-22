//----------------------------------------------------------------------------------------------------------------------
function content_qst_answer_sets()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='qst_box_answer_sets_wnd' "+$nosel+">";
    $res += "<div class='head'>Настроить текст вариантов ответов</div>"; // Выберите схему ответов
    $res += "<div class='subhead'>Помните, шкала оценки в баллах определяется количеством вариантов ответов.<br>" +
        "11 ответов дает шкалу 1..10, 7 ответов - шкалу 1..6 и т.д.<br>" +
        "<span class='warning'>Последний вариант должен быть отведен для зеро-ответа (в стиле \"затрудняюсь ответить\" или \"не уверен\"),<br>он <b>не будет учитываться</b> в рассчете среднего балла.</span></div>";
    //$res += "<div class='subhead'>Схемы с большим количеством градаций ответа<br>позволят пользователю точнее описать свою позицию по каждому вопросу.</div>";
    $res += content_qst_answer_set_wnd();

    $res += "<table class='lower_box'>";
    $res += "<tr><td>";
    $res += "<table class='btn_box'><tr>";
    $res += "<td><div class='btn' action='back'>Назад</div></td>";
    $res += "<td><div class='btn' action='next'>Сохранить</div></td>";
    $res += "</tr></table>";
    $res += "</td>";
    $res += "</tr></table>";

    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_answer_set_options($action)
{
    if ($action === "add_events")
    {
        $(".as_options_box .option")
            .off("change")
            .change(function () {
                $(".as_options_box .option input").each(function (ord) {
                    $new_qz.settings.answer_opts_list[ord] = $(this).val();
                });

                $session.set();
                $session.autosave();
            });

        $(".as_options_box .btn_options_reset")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "Сбросить варианты ответов",
                    cont = "Нажмите левой кнопкой мыши, чтобы перезагрузить варианты ответов (в списке внизу) на ответы по умолчанию.";
                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x-420)+"px")
                    .css("top", ($curs.y)+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function () {
                $new_qz.settings.answer_opts_list = answer_set_option_template[7];
                $(".as_options_box .option input").each(function (ord) {
                    $(this).val($new_qz.settings.answer_opts_list[ord]);
                });
                $session.set();
            });


        $(".as_options_box .btn_save_as_template")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "Сохранить в шаблон",
                    cont = "Сохранить текущий набор вариантов ответа в шаблон.";
                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x-200)+"px")
                    .css("top", ($curs.y + 10)+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function () {
                let qnt = $new_qz.settings.answer_opts_list.length;
                if (qnt >= 11)
                    message_ex("show", "info", "direct", "Нельзя меть более чем 11 вариантов ответов.");
                else
                {
                    message_ex("show", "insert", "save_as_template", $new_qz.settings.answer_opts_list);
                }
            });


        $(".as_options_box .btn_options_add")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "Добавить вариант ответа",
                    cont = "Нажмите левой кнопкой мыши, чтобы добавить вариант ответа в конец списка.<br>Максимальное количество вариантов ответов - 11.";
                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x-420)+"px")
                    .css("top", ($curs.y)+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function () {
                let qnt = $new_qz.settings.answer_opts_list.length;
                if (qnt >= 11)
                    message_ex("show", "info", "direct", "Нельзя меть более чем 11 вариантов ответов.");
                else
                {
                    $new_qz.settings.answer_opts_list.push("введите текст ответа"); // add answer slot with text
                    let s = "";
                    s += "<tr ord='"+ qnt +"'>";
                    s += "<td class='num_ord'>№"+ (qnt + 1) +"</td>";
                    s += "<td class='option'>";
                    s += "<input type='text' value='"+ $new_qz.settings.answer_opts_list[qnt]+"'>";
                    s += "</td>";
                    s += "<td><div class='answer_del'></div></td>";
                    s += "</tr>";
                    $(".as_options_box").append(s); // add html vissual for a new answer slot
                    content_qst_answer_set_options("add_events"); // apply trigger to a new row
                }
            });

        $(".as_options_box .answer_del")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "Удалить вариант ответа",
                    cont = "Нажмите левой кнопкой мыши, чтобы удалить вариант ответа.";
                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x-420)+"px")
                    .css("top", ($curs.y)+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function () {
                let ord = $(this).closest("tr").attr("ord") * 1;
                $new_qz.settings.answer_opts_list.splice(ord - 1, 1);
                $(".as_options_box tr[ord='"+ ord +"']").remove();

                $(".as_options_box tr").each(function (ord) {
                    if (ord)
                    {
                        $(this)
                            .attr("ord", ord)
                            .find(".num_ord").html("№" + ord);
                    }

                });
            });

        as_templates_bld_dd_list("update_self");
    }
    else
    {
        let s = "<tr>";
        s += "<td colspan='3' class='head'>";
            s += "<div class='btn_options_add'></div>";
            s += "<div class='btn_save_as_template'></div>";
            //s += "<div class='btn_options_reset'></div>";
            s += "<span class='label'>Список вариантов ответов</span>";
        s += "</td>";
        s += "</tr>";

        let opt_qnt = 7;
        if ($new_qz.settings.answer_opts_list && $new_qz.settings.answer_opts_list.length)
            opt_qnt = $new_qz.settings.answer_opts_list.length;

        for (i=0; i<opt_qnt; i++)
        {
            s += "<tr ord='"+ i +"'>";
            s += "<td class='num_ord'>№"+ (i+1) +"</td>";
            s += "<td class='option'>";
            let tx_line = $new_qz.settings.answer_opts_list[i];
            if (undefined === tx_line)
                tx_line = "вариант ответа";

            s += "<input type='text' value='"+ tx_line +"'>";
            s += "</td>";

            s += "<td>";
            if (i > 2)
                s += "<div class='answer_del'></div>";
            s += "</td>";
            s += "</tr>";
        }

        if ($action === "get_html")
        {
            return s;
        }
        else
        if ($action === "update_self")
        {
            $(".as_options_box")
                .empty()
                .append(s);
            content_qst_answer_set_options("add_events");
        }
    }
}

//----------------------------------------------------------------------------------------------------------------------
function as_templates_bld_dd_list(action) {

    if ("add_events" === action)
    {
        $(".as_temp_ddlist")
            .off("change")
            .change(function () {
                let as_temp_ord = $(this).prop("selectedIndex") * 1;
                as_temp_ord = $(this).find("option:nth-child("+ (as_temp_ord+1) +")").attr("id") * 1;
                if (-1 !== as_temp_ord)
                {
                    $pers.as_temp_index = as_temp_ord;
                    $new_qz.settings.answer_opts_list = duplicate($pers.as_temp[as_temp_ord].list);
                    content_qst_answer_set_options("update_self");
                    //$new_qz.settings.answer_opts_list
                    console.log("as_temp_ddlist, triggered change");
                }
            });

        let as_temp_ord = $(".as_temp_ddlist").prop("selectedIndex") * 1;
        if ($pers.hasOwnProperty("as_temp_index") && $pers.as_temp_index + 1 !== as_temp_ord)
            $(".as_temp_ddlist").prop("selectedIndex", $pers.as_temp_index + 1);
    }
    else
    {
        let s = "<div class='as_temp_box'><select class='as_temp_ddlist'>";

        if ($pers.hasOwnProperty("as_temp") && $pers.as_temp.length)
        {
            s += "<option id='-1'>"+ "выбрать шаблон" +"</option>";
            $pers.as_temp.forEach(function (v_temp, i_temp) {
                s += "<option id='"+ i_temp +"'>"+ v_temp.name +"</option>";
            })
        }
        else
        {
            s += "<option id='-1'>"+ "нет сохраненных шаблонов" +"</option>";
        }

        s += "</select></div>";

        if ("update_self" === action)
        {
            $(".as_temp_ddlist").remove();
            $(".as_options_box .head .label").after(s);
            as_templates_bld_dd_list("add_events");
        }
        else
        if ("get_html" === action)
        {
            return s;
        }
    }
}


//----------------------------------------------------------------------------------------------------------------------
function content_qst_answer_set_wnd()
{
    let s = "";
    let set_opt_qnt = [null,3,4,5,7];
    let picked = [null,0,0,0,1];

    s += "<div class='answer_set_box'>";

    /*
    s += "<table class='sets_box'>";
    for (let i=1; i<5; i++)
    {
        s += "<tr>";
        s += "<td>";
        s += "<div class='set' set_id='"+i+"' is_picked='"+picked[i]+"'>";
            s += "<div class='opt'>";
                s += "<div class='switch'></div>";
                s += "<div class='label'>"+set_opt_qnt[i]+"-вариантный</div>";
            s += "</div>";
        s += "</div>";

        s += "</td>";

        if (i === 1)
        {
            s += "<td rowspan='4'>";
            s += "<div class='img' set_id='"+i+"'></div>";
            s += "</td>";
        }
        s += "</tr>";
    }
    s += "</table>";
    */


    s += "<table class='as_options_box'>";
    s += content_qst_answer_set_options("get_html");
    s += "</table>";


    s += "</div>";
    return s;
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_answer_sets_events()
{
    content_qst_answer_set_options("add_events");

    $(".qst_box_answer_sets_wnd .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {

                case "back":
                    $new_qz.qst_screen_id = 4;
                    show_content("qst");
                    break;

                case "next":
                    // When we first set an answer set
                    content_qst_goto_deli_screen();
                    /*
                    if (last_qst_screen_id === 4 || last_qst_screen_id === null)
                        content_qst_goto_deli_screen();
                    // When we went to asnwer_set screen from a hyperlink in starting qst menu
                    else
                    {
                        $new_qz.qst_screen_id = 4; // last_qst_screen_id;
                        show_content();
                        $session.set();
                    }
                    */
                    break;
            }
        });
}
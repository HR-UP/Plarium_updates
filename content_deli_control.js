let ignore_status_changes = [];

let muted_sign = "<span class='muted_sign' style='padding-left: 15px; font-size: 16px; color: #bf504e; font-weight: bold; font-style: normal;'>[БЛОК]</span>";
//----------------------------------------------------------------------------------------------------------------------
function content_deli_control()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='deli_control_box' "+$nosel+">";
    $res += "<div class='head'>Контроль рассылки</div>";

    if ($session.opened_qz_ord !== null) // draw picked quiz
    {
        let qz = $ad.qzs[$session.opened_qz_ord];
        $res += "<div class='subhead'>" +
                    "<div class='force_complete'></div>" +
                    "<div class='qz_del'></div>" +
                    "<div class='qz_rename'></div>" +
                    "<div class='qz_mute'></div>" +
                    "<div class='qz_reschedule'></div>" +
                    "<span class='qz_name'>" + qz.name;
        if (qz.settings.is_muted)
            $res += muted_sign
        $res += "</span>";

        $res += "<div class='date'><span class='label'>дата окончания </span><span class='date_val'>" +timestamp_from_date(qz.settings.end_date, true)+ "</span></div>" +
                "</div>";
        $res += "<table class='deli_list'>";
        $res += content_deli_control_build_list("get_html");
        $res += "</table>";

        $res += "<table class='btn_box' pos='bottom'><tr>";
        $res += "<td><div class='btn' action='save'>Сохранить</div></td>";
        $res += "</tr></table>";
    }
    else // draw selection ROSTER
    {
        $res += "<div class='roster'>";
        $res += "<div class='head'>Выберите активный опрос для просмотра</div>";
        let broken_qz_ords = [];
        let broken_qz_comment = [];
        let active_qz_ord_list = [];
        let error_comment;
        if ($ad.qzs.length)
            $ad.qzs.forEach(function (v_qz, i_qz) {
                let show = false;
                error_comment = chk_qz_validity_basic(v_qz);
                if (error_comment !== true)
                {
                    show = true; // obviously active
                    broken_qz_ords.push(active_qz_ord_list.length);
                    broken_qz_comment.push(error_comment);
                }
                else
                if (!qz_is_complete(i_qz))  // if (!v_qz.status)
                {
                    show = true; // obviously active
                }

                if (show)
                {
                    active_qz_ord_list.push(i_qz);
                }

            });

        //console.log(active_qz_ord_list);

        if (!active_qz_ord_list.length)
            $res += "<div class='item' empty>Нет активных опросов</div>";
        else
        {
            // Build list of names of active quizes (selectable)
            active_qz_ord_list.forEach(function (v_qz_ord, list_ord) {
                if (broken_qz_ords.indexOf(list_ord) === -1) // valid quiz
                {
                    $res += "<div class='item' ord='"+v_qz_ord+"'>";
                    $res += $ad.qzs[v_qz_ord].name;

                    if ($ad.qzs[v_qz_ord].settings.is_muted)
                    {
                        $res += muted_sign;
                    }

                    if ($ad.qzs[v_qz_ord].settings.comment)
                        $res += " <div class='comment'>(" + $ad.qzs[v_qz_ord].settings.comment + ")</div>";
                    $res += "</div>";
                }
                else
                {
                    let qz = $ad.qzs[v_qz_ord];
                    let qz_name = "";
                    if (qz && qz.hasOwnProperty("name"))
                        qz_name = qz.name;


                    $res += "<div class='item' ord='"+v_qz_ord+"' is_broken='1'>";
                        $res += " <div class='comment'>" +
                            "<div class='hint_icon'></div>" +
                            "[Опрос поврежден: "+ qz_name +"]" +
                            "<div class='error_tx'>";
                                let comments_slot = broken_qz_comment[broken_qz_ords.indexOf(list_ord)];
                                if (comments_slot.length)
                                    comments_slot.forEach(function (v_tx_line, i_line) {
                                        $res += v_tx_line;
                                        if (i_line+1 < comments_slot.length)
                                            $res += "<br>";
                                    });
                            $res += "</div>";
                            if ($ad.qzs[v_qz_ord].can_restore) // backup file with a blueprint is found for this quiz
                            {
                                $res += "<div class='restore_btn' action='settings'></div>";
                                $res += "<div class='restore_btn' action='resps'></div>";
                            }
                            else
                                $res += "<div class='restore_btn' action='no_backup'></div>";

                        $res += "</div>";
                    $res += "</div>";
                }
            });
        }

        $res += "</div>";
    }

    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_deli_control_status_icon(pct_done) {
    let state = "red";
    if (pct_done === 100)
        state = "green";
    else
    if (pct_done > 0)
        state = "yellow";

    return "<div class='status_icon' state='" + state + "'></div>";
}

//----------------------------------------------------------------------------------------------------------------------
function content_deli_control_build_list(do_return) {
    let qz = $ad.qzs[$session.opened_qz_ord];
    let qst_qnt = qz.settings.qst_list.length;
    let s = "";
    if (do_return === "add_events")
    {
        let answered, pct_done;
        //let qz_statuses = [];
        qz.resps.forEach(function (v_batch, i_batch) {
            if (qz.status)
                pct_done = 100;
            else
                pct_done = get_qz_group_completion_pct(qz, i_batch);

            $(".resp_line[batch_ord='"+i_batch+"'][resp_ord='0'] .qz_status")
                .empty()
                .append(content_deli_control_status_icon(pct_done));
        });

        $(".resp_line .qz_status .status_icon")
            .off("mouseenter").off("mouseleave").mouseleave(function() {$(".floater").css("display", "none").html("");})
            .mouseenter(function()
            {
                let resp_ord = $(this).closest(".resp_line").attr("resp_ord") * 1;
                if (!resp_ord) // only for focus-resp icons
                {
                    let gr_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
                    let qz = $ad.qzs[$session.opened_qz_ord];
                    let qb_name = get_qb_ord_from_qb_id(qz.settings.comm_groups[gr_ord].qb_id);
                    qb_name = $ad.qbooks[qb_name].name;
                    //let pos = $(this).offset();
                    let tx = "";
                    tx += "<div class='head'>Информация о группе</div>";
                    tx += "<span class='label'>Опросник: </span>" + qb_name;

                    $(".floater")
                        .css("display", "inline-block")
                        .css("width", "450px")
                        //.css("height", "350px")
                        .css("left", ($curs.x-480)+"px")
                        .css("top", $curs.y+"px")
                        .css("border-color", "#4A67AD")
                        .html(tx);
                }


            });

        $(".resp_line .show_batch")
            .off("click")
            .click(function()
            {
                let active = $(this).attr("active") * 1;
                let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
                if (!active)
                {
                    $(this)
                        .css("transform", "rotate(180deg)")
                        .attr("active", 1);
                    $(".resp_line[batch_ord='"+batch_ord+"']").css("display","table-row");
                }
                else
                {
                    $(this)
                        .css("transform", "rotate(00deg)")
                        .attr("active", 0);
                    $(".resp_line[batch_ord='"+batch_ord+"'][resp_ord!='0']").css("display","none");
                }
            });

        $(".resp_line .actions .btn[action='ignore']")
            .off("mouseenter").off("mouseleave").mouseleave(function() {$(".floater").css("display", "none").html("");})
            .mouseenter(function()
            {
                //let pos = $(this).offset();
                let tx = "";
                tx += "<div class='head'>Исключить/включить респондента</div>";
                tx += "Исключение респондентов может быть использовано для досрочного завершения опроса.<br><br>" +
                    "Индикация состояний:<br>"+
                    "<div class='line'><span class='exclusion_icon' state='1'></span> - включен</div>" +
                    "<div class='line'><span class='exclusion_icon' state='2'></span> - включен, назначен на исключение (*требуется сохранение)</div>" +
                    "<div class='line'><span class='exclusion_icon' state='3'></span> - исключен</div>" +
                    "<div class='line'><span class='exclusion_icon' state='4'></span> - исключен, назначен на включение (*)</div>";

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "450px")
                    //.css("height", "350px")
                    .css("left", ($curs.x-470)+"px")
                    .css("top", $curs.y+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function()
            {
                let is_on = $(this).attr("set") * 1; // 0 - not ignored, inactive ; 1 - not ignored, active ; 2 - ignored, inactive ; 3 - ignored, active ;
                let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
                let resp_ord = $(this).closest(".resp_line").attr("resp_ord") * 1;

                if (qz.resps[batch_ord][resp_ord].ignore)
                {
                    // Is excluded now
                    if (is_on === 2)
                    {
                        $(this).attr("set", 3);
                        ignore_status_changes[batch_ord][resp_ord] = false; // activated for inclusion
                    }
                    else
                    {
                        $(this).attr("set", 2);
                        ignore_status_changes[batch_ord][resp_ord] = true; // de-activated for inclusion
                    }
                }
                else
                {
                    // Is included now
                    if (is_on === 0)
                    {
                        $(this).attr("set", 1);
                        ignore_status_changes[batch_ord][resp_ord] = true; // activated for exclusion
                    }
                    else
                    {
                        $(this).attr("set", 0);
                        ignore_status_changes[batch_ord][resp_ord] = false; // de-activated for exclusion
                    }
                }
                content_deli_control_detect_changes(); // show/hide "save" btn
            });

        // ------------------------------------------------------------
        $(".resp_line .actions .btn[action='send_invite']")
            .off("mouseenter")
            .mouseenter(function()
            {
                //let pos = $(this).offset();
                let tx = "";
                tx += "<div class='head'>Отправка напоминания</div>";
                tx += "Нажатие на кнопку высылает данному респонденту стандартное письмо-напоминание.";

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "350px")
                    .css("left", ($curs.x-370)+"px")
                    .css("top", $curs.y+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("mouseleave")
            .mouseleave(function()
            {
                $(".floater").css("display", "none").html("");
            })
            .off("click")
            .click(function()
            {
                let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
                let resp_ord = $(this).closest(".resp_line").attr("resp_ord") * 1;
                let qz = $ad.qzs[$session.opened_qz_ord];
                let pct_done = content_deli_resp_pct_done({
                    qz_ord: $session.opened_qz_ord,
                    gr_ord: batch_ord,
                    resp_ord: resp_ord
                });

                if (pct_done >= 100)
                    message_ex("show","info","direct_full",{
                        "head": "Отправка напоминания",
                        "tx": "Данный респондент уже ответил на все вопросы."
                    });
                else
                {
                    let form = {};
                    form.link = PATH + "client.php?q=" + qz.qkey + "&r=" + qz.resps[batch_ord][resp_ord].ukey;
                    let focus_resp = null;
                    for (let i=0; i<$ad.resps.length; i++)
                        if ($ad.resps[i].id === qz.resps[batch_ord][0].id)
                        {
                            focus_resp = $ad.resps[i];
                            break;
                        }

                    let resp = null;
                    for (let i=0; i<$ad.resps.length; i++)
                        if ($ad.resps[i].id === qz.resps[batch_ord][resp_ord].id)
                        {
                            resp = $ad.resps[i];
                            break;
                        }
                    if (null !== resp)
                    {
                        form.fio = resp.fio;
                        form.focus_fio = focus_resp.fio;
                        form.mail = resp.mail;
                        message_ex("show","confirm","resp_send_remainder", form);
                        //sendAJ("resp_send_remainder", JSON.stringify(form));
                    }
                    else
                        message_ex("show","info","direct","Информация о данном респонденте не найдена в базе данных.");
                    //message_ex("show","info","direct","Отправка напоминания пока что отключена.");
                }
            });

        $(".resp_line .actions .btn[action='add_resp']")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Добавить респондента в группу",
                    tx: "Нажмите чтобы внести данные респондента и добавить его в эту группу опроса.<br><br>" +
                    "Респондент получит ранее настроенное для этого опроса письмо-приглашение.",
                    w: 400,
                    dx: ($curs.x-370)+"px",
                    dy: 20,
                });
            })
            .off("click")
            .click(function()
            {
                let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
                let qz = $ad.qzs[$session.opened_qz_ord];
                message_ex("show","group_resp_add","group_resp_add", {batch_ord: batch_ord, qz_id: qz.id, qz_ord: $session.opened_qz_ord});
            });

        //$(".resp_line[batch_ord='0'][resp_ord='0'] .btn[action='send_invite']" ).offset().top

        // External link
        $(".resp_line .link")
            .off("click")
            .click(function()
            {
                let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
                let resp_ord = $(this).closest(".resp_line").attr("resp_ord") * 1;
                let qz = $ad.qzs[$session.opened_qz_ord];
                window.open(PATH + "client.php?q=" + qz.qkey + "&r=" + qz.resps[batch_ord][resp_ord].ukey);
            });

        // Force_complete qz
        $(".subhead .force_complete")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Принудительное завершение",
                    tx: "Изменить статус опроса на \"завершен\".",
                    w: 400,
                    dx: 0,
                    dy: 20,
                });
            })
            .off("click")
            .click(function()
            {
                let action_tx = "Вы действительно хотите принудительно завершить опрос?<br><br>"+
                    "<b>Внимание:</b> данное действие окончательное, респонденты больше не смогут проходить этот опрос и его просмотр в разделе \"Контроль рассылки\" будет невозможен.";

                message_ex("show","confirm","direct_full",{
                    "head":"Изменение статуса опроса",
                    "tx": action_tx,
                    "qz_new_status": 1
                }, "force_qz_status");

            });

        $(".subhead .qz_del")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Удаление опроса",
                    tx: "Полное удаление всех данных по опросу.",
                    w: 400,
                    dx: 0,
                    dy: 20,
                });
            })
            .off("click")
            .click(function()
            {
                let action_tx = "Вы действительно хотите удалить опрос <b>"+ $ad.qzs[$session.opened_qz_ord].name +"</b>?<br><br>"+
                    "<b>Внимание:</b> данное действие окончательное, все результаты и данные этого опроса будут необратимо удалены.";

                message_ex("show","confirm","direct_full",{
                    "head":"Удаление опроса",
                    "tx": action_tx,
                    "qz_ord": $session.opened_qz_ord
                }, "qz_del");

            });

        $(".subhead .qz_rename")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Переименование опроса",
                    tx: "Вы можете дать другое название этому опросу.",
                    w: 400,
                    dx: 0,
                    dy: 20,
                });
            })
            .off("click")
            .click(function()
            {
                let action_tx = "Вы действительно хотите переименовать опрос <b>"+ $ad.qzs[$session.opened_qz_ord].name +"</b>?<br><br>"+
                    "Укажите его новое название в поле ниже.";

                message_ex("show","insert","direct_full",{
                    "head":"Переименование опроса",
                    "tx": action_tx,
                    "qz_ord": $session.opened_qz_ord
                }, "qz_rename");

            });

        $(".subhead .qz_mute")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Заблокировать опрос",
                    tx: "Вы можете заблокировать прохождение опроса, чтобы его донастроить.",
                    w: 400,
                    dx: 0,
                    dy: 20,
                });
            })
            .off("click")
            .click(function()
            {
                let action_tx = "Опрос <b>"+ $ad.qzs[$session.opened_qz_ord].name +"</b> на данный момент ";
                if (!$ad.qzs[$session.opened_qz_ord].settings.hasOwnProperty("is_muted"))
                    $ad.qzs[$session.opened_qz_ord].settings.is_muted = 0;

                if (!$ad.qzs[$session.opened_qz_ord].settings.hasOwnProperty("is_muted") || !$ad.qzs[$session.opened_qz_ord].settings.is_muted )
                {
                    action_tx += " <b>открыт</b>.<br>Вы хотите его заблокировать?";
                }
                else {
                    action_tx += " <b>заблокирован</b>.<br>Вы хотите его открыть?";
                }

                message_ex("show","memo","direct_full",{
                    "head":"Заблокировать/открыть опрос",
                    "tx": action_tx,
                    "qz_ord": $session.opened_qz_ord
                }, "qz_mute");
                // muted_sign

            });


        $(".subhead .qz_reschedule")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Переназначить дату завершения",
                    tx: "Вы можете установить новую дату завершения опроса.",
                    w: 400,
                    dx: 0,
                    dy: 20,
                });
            })
            .off("click")
            .click(function()
            {
                message_ex("show","qz_reschedule","qz_reschedule",{"qz_ord": $session.opened_qz_ord}, null);
            });


        // At first show only focus-persons
        $(".resp_line[resp_ord='0']").css("display","table-row");
    }
    else
    {
        // Head
        s += "<tr class='head'>" +
            "<td>Фокус-персона<div class='sorter'></div></td>" +
            "<td>ФИО</td>" +
            "<td>E-mail</td>" +
            "<td>Категория</td>" +
            "<td>Заполнено</td>" +
            "<td>Статус</td>" +
            "<td>Действия</td>" +
            "</tr>";

        // Body
        qz.resps.forEach(function (v_batch, i_batch) {
            ignore_status_changes[i_batch] = [];
            // Each qz with it's inhabitants
            v_batch.forEach(function (v_resp, i_resp) {
                //if (!v_resp.ignore)
                {
                    let pct_done = content_deli_resp_pct_done({
                        qz_ord: $session.opened_qz_ord,
                        gr_ord: i_batch,
                        resp_ord: i_resp
                    });
                    //console.log(qz.name + ", i_batch: " + i_batch +", i_resp: " + i_resp + ", pct_done: " + pct_done);

                    //let pct_done = Math.floor((v_resp.ans_list.length * 100) / qst_qnt);
                    // get rest of resp's info
                    let resp; // global resp's info by his id
                    if ($ad.resps.length)
                        for (let i=0; i<$ad.resps.length; i++)
                            if ($ad.resps[i].id === v_resp.id)
                            {
                                resp = $ad.resps[i];
                                break;
                            }

                    s += "<tr class='resp_line' batch_ord='"+i_batch+"' resp_ord='"+i_resp+"'>";
                    // 1) Focus FIO
                    if (!i_resp)
                    {
                        let is_disabled = false;
                        if (qz.settings.hasOwnProperty("self_ban_list") &&
                            1 === qz.settings.self_ban_list[i_batch])
                            is_disabled = true;

                        s += "<td>";
                        if (!is_disabled)
                            s += "<div class='link'></div>";
                        s += resp.fio + "</td>";
                    }
                    else
                        s += "<td></td>";

                    // 2) resp FIO
                    if (!i_resp)
                        s += "<td><div class='show_batch' active='0'></div></td>";
                    else
                        s += "<td><div class='link'></div>" + resp.fio + "</td>";

                    s += "<td>" + resp.mail + "</td>";
                    s += "<td>" + get_resp_category("by_id", v_resp.cat_id) + "</td>";
                    // completion
                    s += "<td><div class='qst_done'>" + pct_done +"%</div>"+ content_deli_control_status_icon(pct_done) + "</td>"; // "+ content_deli_control_status_icon(pct_done) + "

                    ignore_status_changes[i_batch][i_resp] = v_resp.ignore;

                    // QZ STATUS
                    if (!i_resp)
                        s += "<td><div class='qz_status'></div></td>";
                    else
                        s += "<td></td>";

                    // actions
                    s += "<td class='actions'>";

                    if (i_resp ||
                        (qz.settings.hasOwnProperty("self_ban_list") && !qz.settings.self_ban_list[i_batch])
                    ) // do not show reminder sender for turned off self-eval
                        s += "<div class='btn' action='send_invite'></div>";
                    if (i_resp)
                    {
                        let status = 0;// starting from: resp not excluded
                        if (v_resp.ignore)
                            status = 2; // starting from: resp already excluded
                        s += "<div class='btn' action='ignore' set='"+status+"'></div>";
                    }
                    else
                    {
                        s += "<div class='btn' action='add_resp'></div>";
                    }

                    s += "</td>";

                    s += "</tr>";
                }
            });
        });

        // Output type
        if (do_return === "get_html")
            return s;
        else
        if (do_return === "update_self")
        {
            $(".deli_control_box .deli_list")
                .empty()
                .append(s);
            content_deli_control_build_list("add_events");
        }
    }
}


//----------------------------------------------------------------------------------------------------------------------
function get_qz_group_completion_pct(qz, batch_ord) {
    let contestants_qnt = 0;
    let total_prg_pct = 0;
    // Each qz with it's inhabitants
    qz.resps[batch_ord].forEach(function (v_resp, i_resp) {
        if (!v_resp.ignore)
        {
            contestants_qnt++;

            let pct_done = content_deli_resp_pct_done({
                qz_ord: $session.opened_qz_ord,
                gr_ord: batch_ord,
                resp_ord: i_resp
            });
            if (pct_done)
                total_prg_pct += pct_done;
        }
    });

    return (total_prg_pct / contestants_qnt);
}
//----------------------------------------------------------------------------------------------------------------------
function content_deli_resp_pct_done(data, feedback)
{
    //let pct = 0;
    //console.log(data);
    let qz = $ad.qzs[data.qz_ord];
    let resp = qz.resps[data.gr_ord][data.resp_ord];
    let cat_id = resp.cat_id;
    let pct;
    if (!data.resp_ord &&
        qz.settings.hasOwnProperty("self_ban_list") &&
        qz.settings.self_ban_list[data.gr_ord]) // self-eval was turned off - auto 100% fill
    {
        pct = 100;
    }
    else
    {
        // Get qbook qsts list
        let comm_group = qz.settings.comm_groups[data.gr_ord];
        let qb_ord = get_qb_ord_from_qb_id(comm_group.qb_id);
        let qst_id_list = $ad.qbooks[qb_ord].list;
        let struct = $ad.qbooks[qb_ord].struct;

        // Map system is present and this resp's first cycle, and it's not complete
        if (resp.hasOwnProperty("map_step") &&
            resp.hasOwnProperty("map_len") &&
            resp.map_step + 1 < resp.map_len
        )
        {
            if (!resp.map_len)
                return 0;
            else
                return math_floor((resp.map_step * 100) / resp.map_len, 0);
        }

        // We need to know exact qst qnt of this resp, due to his category
        let qst_qnt = 0;
        if (struct)
        {
            qst_id_list.forEach(function (v_qid) {
                if (struct.q_list[v_qid].cats[cat_id].is_on)
                    qst_qnt++;
            });
        }
        if (!qst_qnt)
            qst_qnt = 1;

        // How many qsts resp actually have answered
        let answered = 0;
        if (resp.ans_list.length)
            resp.ans_list.forEach(function (v_ans) {
                if ([null,undefined,-1].indexOf(v_ans) === -1)
                    answered++;
            });

        if (feedback)
            console.log("check qz "+ qz.name + " answered/qst_qnt  " + answered + " / " + qst_qnt);
        pct = Math.floor((answered * 100) / qst_qnt);
        if (pct >= 100)
        {
            pct = 100;
            let fb_done = get_resp_fb_done({
                qz_ord: data.qz_ord,
                gr_ord: data.gr_ord,
                resp_ord: data.resp_ord});
            if (!fb_done)
                pct = 99;
        }
    }

    return pct;
}
//----------------------------------------------------------------------------------------------------------------------
function content_deli_control_qzs_status()
{
    let date = get_time("stamp");
    let qz_active_qnt = 0;
    if ($ad.qzs.length)
        $ad.qzs.forEach(function (v) {
            if (!v.status && date < v.settings.end_date) // not completed and time didn't ruan out
                qz_active_qnt++;
        });
    return qz_active_qnt;
}
//----------------------------------------------------------------------------------------------------------------------
function content_deli_control_detect_changes() {
    let changed = false;

    // By ignore statuses
    let group_list = $ad.qzs[$session.opened_qz_ord].resps;

    for (let q=0; q<group_list.length; q++)
        for (let r=0; r< group_list[q].length; r++)
            if (group_list[q][r].ignore !== ignore_status_changes[q][r])
                changed = true;

    if (changed)
        $(".deli_control_box .btn_box[pos='bottom']").css("display","table");
    else
        $(".deli_control_box .btn_box[pos='bottom']").css("display","none");
}


//----------------------------------------------------------------------------------------------------------------------
function content_deli_control_events()
{

    // ************************************     TEMPLATE_STANDART EVENTS     *******************************************
    if ($session.opened_qz_ord !== null)
        content_deli_control_build_list("add_events");
    else // ROSTER LIST
    {
        $(".roster .item")
            .off("click")
            .click(function(){
                let is_broken = $(this).attr("is_broken");
                if (!is_broken && $(this).attr("ord") !== undefined)
                {
                    $session.opened_qz_ord = $(this).attr("ord") * 1;
                    show_content("deli_control"); // show picked quiz
                }
            });

        $(".roster .item .hint_icon")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                let is_broken = $(this).closest(".item").attr("is_broken");
                let qz_ord = $(this).closest(".item").attr("ord") * 1;
                let qz_name = $ad.qzs[qz_ord].name;

                if (is_broken)
                    floater_hint("show",{
                        head: "Ошибки",
                        tx: $(this).closest(".item").find(".error_tx").html(),
                        w: 700,
                        dx: -150,
                        dy: 30,
                    });
            });
    }

    // Restoration btns
    $(".deli_control_box .restore_btn")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
        .mouseenter(function()
        {
            let action = $(this).attr("action");
            let head = "", tx = "";

            switch (action) {
                case "settings":
                    head = "Восстановление настроек опроса";
                    tx = "Восстанавливает данные о датах, опросниках, комментах, текстах писем и интро.";
                    break;
                case "resps":
                    head = "Восстановление респондентов опроса";
                    tx = "Восстанавливает начальные данные о респондентах.";
                    break;

                case "no_backup":
                    head = "Восстановление невозможно";
                    tx = "Файл бэкапа с данными опросника этого не был найден на сервере.";
                    break;
            }

            floater_hint("show",{
                head: head,
                tx: tx,
                w: 600,
                dx: -300,
                dy: 30,
            });
        })
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            let qz_ord = $(this).closest(".item").attr("ord") * 1;

            if (["settings","resps"].indexOf(action) !== -1)
                message_ex("show","confirm","qz_restore", {action: action, qz_ord: qz_ord});
        });


    $(".deli_control_box .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {
                /*
                case "back":
                    new_qz_tab_progress(2);
                    show_content("qst");
                    break;
                */

                case "save":
                    let form = {};
                    form.qz_ord = $session.opened_qz_ord;
                    form.qz_id = $ad.qzs[form.qz_ord].id;
                    form.new_set = ignore_status_changes;
                    //console.log(form);
                    sendAJ("qz_exclusion_update", JSON.stringify(form));
                    /*
                    new_qz_tab_progress(4);
                    show_content("options");
                    $session.set();
                    */
                    break;
            }
        });

}
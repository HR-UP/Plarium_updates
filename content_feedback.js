let last_fb_opened = {
    qz_ord: null,
    batch_ord: null
};

//   -------------------------------------------------------------------------------------------------------------------
function content_feedback(action, qz_ord, batch_ord)
{
    if ("show" === action)
    {
        $(".calculus_box").css("display","none");
        $(".webchart").css("display","none");
        $(".djohari_box").css("display","none");

        let qz = $ad.qzs[qz_ord];
        let sett = qz.settings;
        let comm_group = sett.comm_groups[batch_ord];

        // GEt general quantity of comment questions
        let qz_qnt = 0;
        if (comm_group.qz_list)
            qz_qnt = comm_group.qz_list.length;
        let comp_qnt = 0;
        if (comm_group.comp_list && typeof comm_group.comp_list === "object" && comm_group.comp_list.length)
            comm_group.comp_list.forEach(function (v) {
                if (null !== v && typeof v === "object")
                    comp_qnt += v.length;
            });

        //if (last_fb_opened.qz_ord === qz_ord && last_fb_opened.batch_ord === batch_ord)
        if ($(".group_fb_box").length)
        {
            $(".group_fb_box").css("display","block");
        }
        else
        {
            last_fb_opened.qz_ord = qz_ord;
            last_fb_opened.batch_ord = batch_ord;
            $(".group_fb_box").remove();
            let s = "<div class='group_fb_box'>"; // BUILD a new box
                s += "<div class='btn' action='fb_close'>Закрыть</div>";
                // AFTER QUIZ
                if (comm_group.qz_after && qz_qnt)
                    s += content_feedback("get_section", "qz", null);

                // AFTER COMPETENTION
                if (comm_group.comp_after && comp_qnt)
                    s += content_feedback("get_section", "comp", null);

                //s += "<div class='btn' action='fb_load'>Выгрузить</div>";

            s += "</div>";

            $(".single_report_box .btn_box").after(s);
        }
        content_feedback_events();
    }
    else
    if ("hide" === action)
    {
        $(".group_fb_box").css("display","none");

        $(".calculus_box").css("display","block");
        $(".webchart").css("display","block");
        $(".djohari_box").css("display","block");
    }
    else
    if ("get_section" === action)
    {
        let s = "";
        let qz = $ad.qzs[last_fb_opened.qz_ord];
        let cat_names = {
            0: "Самооценка",
            3: "Коллеги",
            4: "Руководители",
            5: "Подчиненные"
        };

        let group = qz.resps[last_fb_opened.batch_ord];
        let sett = qz.settings;
        let comm_group = sett.comm_groups[last_fb_opened.batch_ord];

        if ("qz" === qz_ord)
        {
            s += "<div class='section' type='qz'>";
                s += "<div class='title'>Комментарии после опроса" +
                        "<div class='icon' action='comments_reload' type='qz'></div>" +
                    "</div>";
                comm_group.qz_list.forEach(function (v_qst, i_qst) {

                    s += "<div class='qst_head' ord='"+ i_qst +"'>" +
                            //"<div class='tip'>вопрос</div> " +
                            v_qst +
                        "</div>";
                    [0,4,3,5].forEach(function (v_cat_id) {
                        let comments_list = [];
                        group.forEach(function (v_resp) {
                            if (v_resp.cat_id === v_cat_id)
                            {
                                if (v_resp.feedback.hasOwnProperty("qz_list"))
                                {
                                    let fb = v_resp.feedback.qz_list;
                                    if (fb.hasOwnProperty(i_qst) && v_resp.ans_list.length) // && fb[i_qst].tx
                                    {
                                        if (fb[i_qst].tx)
                                            comments_list.push(fb[i_qst].tx);
                                        else
                                            comments_list.push("...");
                                    }
                                }
                                else
                                    comments_list.push("...");
                            }
                        });

                        if (comments_list.length)
                        {
                            s += "<div class='cat_box' ord='"+ i_qst +"'>";
                            s += "<div class='cat_head'>- "+ cat_names[v_cat_id] +" -</div>";
                            comments_list.forEach(function (v_tx) {
                                s += "<textarea class='line'>"+ v_tx +"</textarea>";
                            });
                            s += "</div>";
                        }
                    });
                });
            s += "</div>";
        }
        else
        if ("comp" === qz_ord)
        {
            s += "<div class='section' type='comp'>";
                s += "<div class='title'>Комментарии после компетенций" +
                    "<div class='icon' action='comments_reload' type='comp'></div>" +
                    "</div>";
                comm_group.comp_list.forEach(function (v_slot, i_slot) {
                    if (v_slot && typeof v_slot === "object" && v_slot.length)
                    {
                        let comp_ord = get_comp_ord_from_comp_id(i_slot);
                        let comp_name = "Неизвестная компетенция";
                        if (undefined !== $ad.comps[comp_ord] && $ad.comps[comp_ord].name)
                            comp_name = $ad.comps[comp_ord].name;
                        let wnd = "";
                        let line_added = 0;

                        wnd += "<div class='comp_wnd' comp_ord='"+ i_slot +"'>";
                            wnd += "<div class='comp_head'>" +
                                    "<div class='tip'>компетенция</div> " +
                                comp_name +"</div>";
                            v_slot.forEach(function (v_qst, i_qst) {
                                wnd += "<div class='qst_head' comp_ord='"+ i_slot +"' ord='"+ i_qst +"'>" +
                                    //"<div class='tip'>вопрос</div> " +
                                    v_qst +"</div>";
                                [0,4,3,5].forEach(function (v_cat_id) {
                                    let comments_list = [];
                                    group.forEach(function (v_resp) {
                                        if (v_resp.cat_id === v_cat_id)
                                        {
                                            if (v_resp.feedback.hasOwnProperty("comp_list"))
                                            {
                                                let fb = v_resp.feedback.comp_list;
                                                if (null !== fb[i_slot] && fb[i_slot].hasOwnProperty(i_qst) && v_resp.ans_list.length) // fb[i_slot][i_qst].tx
                                                {
                                                    line_added++;

                                                    if (fb[i_slot][i_qst].tx)
                                                        comments_list.push(fb[i_slot][i_qst].tx);
                                                    else
                                                        comments_list.push("...");
                                                }
                                            }
                                            else
                                                comments_list.push("...");
                                        }
                                    });

                                    if (comments_list.length)
                                    {
                                        wnd += "<div class='cat_box' ord='"+ i_qst +"'>";
                                            wnd += "<div class='cat_head'>- "+ cat_names[v_cat_id] +" -</div>";
                                            comments_list.forEach(function (v_tx) {
                                                wnd += "<textarea class='line'>"+ v_tx +"</textarea>";
                                            });
                                        wnd += "</div>";
                                    }
                                });
                            });
                        wnd += "</div>";

                        if (line_added)
                            s += wnd;
                    }
                });
            s += "</div>";
        }
        return s;
    }
    else
    if ("reload" === action)
    {
        console.log(qz_ord);
        // _qz_ord is "qz" or "comp"
        $(".group_fb_box .section[type='"+ qz_ord +"']").remove();
        let s = content_feedback("get_section", qz_ord, null);

        if ("qz" === qz_ord)
            $(".group_fb_box ").prepend(s);
        else
            $(".group_fb_box .btn").before(s);
        content_feedback_events();
    }
}
//   -------------------------------------------------------------------------------------------------------------------
function content_feedback_events()
{
    $(".group_fb_box .btn").off("click")
        .click(function () {
            let action = $(this).attr("action");

            if ("fb_close" === action)
            {
                console.log("done");
                content_feedback("hide", null, null);
            }
        });

    $(".group_fb_box .icon").off("click")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
        .mouseenter(function()
        {
            let action = $(this).attr("action");
            if ("comments_reload" === action)
                floater_hint("show",{
                    head: "Сбросить данные",
                    tx: "Перезагрузить этот сегмент данных, предоставив исходные ответы респондентов.",
                    w: 400,
                    dx: -200,
                    dy: 30,
                });
        })
        .click(function () {
            let action = $(this).attr("action");
            let type = $(this).attr("type");

            if ("comments_reload" === action)
            {
                content_feedback("reload", type, null);
            }
        });
}

//   -------------------------------------------------------------------------------------------------------------------
function bld_comments() {
    let box = $(".group_fb_box");
    let a = ["",""];

    if (!box.length)
        a = false;
    else
    {
        // we need lines

        let qz_sect = box.find(".section[type='qz']");
        if (qz_sect.length)
        {
            a.push("Комментарии после опроса");
            qz_sect.find(".qst_head").each(function () {
                let ind = $(this).attr("ord");
                let qst_head = $(this).text();
                a.push(qst_head);

                qz_sect.find(".cat_box[ord='"+ ind +"']").each(function () {
                    /*
                    let cat_name = $(this).find(".cat_head").html();
                    let tx = $(this).find("textarea").val();
                    a.push(cat_name);
                    a.push(tx);
                    */
                    let cat_name = $(this).find(".cat_head").html();
                    a.push(cat_name);

                    $(this).find("textarea").each(function () {
                        let tx = $(this).val();
                        a.push(tx);
                    });
                });
            });
        }


        let comp_sect = box.find(".section[type='comp']");
        if (comp_sect.length)
        {
            a.push("");
            a.push("Комментарии после компетенций");
            comp_sect.find(".comp_wnd").each(function () {
                let comp_wnd = $(this);
                let comp_name = $(this).find(".comp_head").text();
                a.push(comp_name);

                $(this).find(".qst_head").each(function () {
                    let ind = $(this).attr("ord");
                    let qst_head = $(this).text();
                    a.push(qst_head);

                    comp_wnd.find(".cat_box[ord='"+ ind +"']").each(function () {
                        let cat_name = $(this).find(".cat_head").html();
                        a.push(cat_name);

                        $(this).find("textarea").each(function () {
                            let tx = $(this).val();
                            a.push(tx);
                        });
                    });
                });
            });
        }
    }
    return a;
}
//   -------------------------------------------------------------------------------------------------------------------
function bld_table_comments() {
    let box = $(".group_fb_box");
    let a = [];

    if (!box.length)
    {
        content_feedback("show", $session.opened_qz_ord, $session.opened_focus_ord);
        content_feedback("hide");
        box = $(".group_fb_box");
    }

    let title_style = "style='font-size: 24px;text-align: center;font-weight: bold; padding: 20px; margin-top: 30px;'";
    let qst_head_style = "style='padding: 10px;" +
        "font-weight: bold;" +
        "font-size: 18px;" +
        "border-bottom: 1px solid lightgray;" +
        "text-align: center;" +
        "color: #4A67AD;'";
    let comp_head_style = "style='padding: 10px;" +
        "            font-weight: bold;" +
        "            font-size: 18px;" +
        "            text-align: center;" +
        "            color: #217ad3;" +
        "            width: 90%;" +
        "            margin: 30px auto 15px auto; " +
        "            background-color: #f0f8ff;'";
    let cat_head_style = "style='padding: 5px;" +
        "            text-align: center;" +
        "            font-size: 16px;'";

    // we need lines
    let qz_sect = box.find(".section[type='qz']");
    if (qz_sect.length)
    {
        a.push("<tr><td> </td></tr>");
        a.push("<tr><td> </td></tr>");
        a.push("<tr><td "+title_style+">Комментарии после опроса</td></tr>"); //  <tr><td "+  +">  </td></tr>
        qz_sect.find(".qst_head").each(function () {
            let ind = $(this).attr("ord");
            let qst_head = $(this).text();
            a.push("<tr><td "+ qst_head_style +">"+ qst_head +"</td></tr>");

            qz_sect.find(".cat_box[ord='"+ ind +"']").each(function () {
                let cat_name = $(this).find(".cat_head").html();

                a.push("<tr><td "+ cat_head_style +">"+ cat_name +"</td></tr>");
                $(this).find("textarea").each(function () {
                    let tx = $(this).val();
                    a.push("<tr><td>" + tx + "</td></tr>");
                });
            });
        });
    }
    console.log("quiz comments");
    console.log(a);


    let comp_sect = box.find(".section[type='comp']");
    if (comp_sect.length)
    {
        a.push("");
        a.push("<tr><td "+title_style+">Комментарии после компетенций</td></tr>");
        comp_sect.find(".comp_wnd").each(function () {
            let comp_wnd = $(this);
            let comp_name = $(this).find(".comp_head").text();
            a.push("<tr><td "+ comp_head_style +">"+ comp_name +"</td></tr>");

            $(this).find(".qst_head").each(function () {
                let ind = $(this).attr("ord");
                let qst_head = $(this).text();
                a.push("<tr><td "+ qst_head_style +">"+ qst_head +"</td></tr>");

                comp_wnd.find(".cat_box[ord='"+ ind +"']").each(function () {
                    let cat_name = $(this).find(".cat_head").html();
                    //let tx = $(this).find("textarea").val();
                    a.push("<tr><td "+ cat_head_style +">"+ cat_name +"</td></tr>");
                    $(this).find("textarea").each(function () {
                        let tx = $(this).val();
                        a.push("<tr><td>" + tx + "</td></tr>");
                    });
                });
            });
        });
    }

    return a;
}
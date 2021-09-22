let $RESP_CATEGORIES_QNT = 5;
let $RESP_CAT_ID_LIST = [0,1,3,4,5];
let resp_db = {
    mode: "all",
    qz_ord: null,
    gr_ord: null,
    resp_ord: null
};
//----------------------------------------------------------------------------------------------------------------------
function content_deli()
{
    //$new_qz.answer_set_id = 2; // reset picked answer set
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='deli_box' "+$nosel+">";

    switch ($new_qz.deli_screen_id)
    {
        case 1:
            $res += content_deli_template_load();
            break;

        case 2:
            $res += content_deli_template_standart();
            break;

        case 3:
            $res += content_deli_template_manual();
            break;
    }
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_deli_template_standart()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='deli_box_template_standart' "+$nosel+">";
    $res += "<div class='head'>Список опрашиваемых групп" +
        "<div class='qp_box_toggle'></div>" +
        "</div>";

    $res += "<table class='deli_list'>";
    $res += build_deli_list_table(true);
    $res += "</table>";

    $res += "<table class='btn_box'><tr>";
    $res += "<td><div class='btn' action='back'>Назад</div></td>";
    $res += "<td><div class='btn' action='load'>Загрузить списком</div></td>";
    $res += "<td><div class='btn' action='edit'>Добавить вручную</div></td>";
    $res += "<td><div class='btn' action='next'>Продолжить</div></td>";
    $res += "</tr></table>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_deli_template_load()
{
    //window.open(PATH + "Оценка360_(шаблон_загрузки_вопросов).csv");
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='deli_box_template_load' "+$nosel+">";
        $res += "<div class='head'>Загрузить файл со списком учасников</div>";
        $res += "<div class='subhead'>Скачайте шаблон для заполнения списка респондентов, чтобы быстро загрузить их в систему.</div>";
        $res += "<div class='btn' action='load_deli_template'>Скачать шаблон</div>";
        $res += "<div class='subhead'>Заполните шаблон в соответствии с таблицей ниже и загрузите файл excel на страницу.</div>";
        $res += "<div class='deli_template_img'></div>";

        $res += "<table class='btn_box'><tr>";
        $res += "<td><div class='btn' action='back'>Назад</div></td>";
        $res += "<td><div class='btn' action='show_list'>Показать список участников</div></td>";
        $res += "<td><div class='btn' action='edit'>Добавить вручную</div></td>";
        $res += "<td><div class='btn' action='load'>Загрузить</div>";
        $res += "<input type='file' class='fileloader_deli' accept='.csv, .xlsx' value=''>";
        $res += "</td>";
        $res += "</tr></table>";
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_deli_template_manual()
{
    $nosel = "onselectstart='return false' ";
    let $res;
    $res = "<div class='deli_box_template_manual' "+$nosel+">";

        $res += "<div class='head'>Добавить/редактировать опрашиваемые группы" +
            "<div class='qp_box_toggle'></div>" +
            "</div>";
        // upper btn box
        $res += "<table class='btn_box' pos='up'><tr>";
        $res += "<td><div class='btn' action='resp_add'>Добавить респондента</div></td>";
        if ($new_qz.deli_edit_ord === null)
            $res += "<td><div class='btn' action='group_add'>Добавить участника оценки</div></td>";
        $res += "<td><div class='btn' action='reset'>Очистить</div></td>";
        $res += "</td>";
        $res += "</tr></table>";

        $res += "<div class='deli_edit_wnd'>";
            $res += content_deli_build_editing_list("get_html");
        $res += "</div>";
        // lower btn box
        $res += "<table class='btn_box' pos='bottom'><tr>";
        $res += "<td><div class='btn' action='back'>Назад</div></td>";
        $res += "<td><div class='btn' action='show_list'>Показать список участников</div></td>";
        if ($new_qz.deli_edit_ord === null)
            $res += "<td><div class='btn' action='load'>Загрузить списком</div></td>";
        else
            $res += "<td></td>";

        $res += "<td><div class='btn' action='save'>Сохранить</div>";
        $res += "</td>";
        $res += "</tr></table>";

    $res += "</div>";
    return $res;
}



//----------------------------------------------------------------------------------------------------------------------
function content_deli_build_editing_list(action, opts)
{
    let row_attributes = ["surname","name","father","mail","spec"];
    let row_placeholders = ["Фамилия*","Имя*","Отчество","e-mail*","Должность"];
    let resp_dd = get_resp_categories_dropdown_list("resp_cat_dropdown");
    let s = "";

    if (action === "add_events")
    {
        $(".resp_field")
            .off("change")
            .change(function () { $(this).trigger("keyup"); })
            .off("keyup")
            .keyup(function () {
                let val = $(this).val();
                let attr = $(this).attr("attr");
                switch (attr) {
                    case "surname":
                    case "name":
                        if (val)
                            $(this).attr("valid", "true");
                        else
                            $(this).attr("valid", "false");
                        break;
                    case "mail":
                        if (validate_email(val))
                            $(this).attr("valid", "true");
                        else
                            $(this).attr("valid", "false");
                        break;
                }
            });

        $(".gr_beacon")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "Выбрать группу";
                let cont = "Нажмите, чтобы сделать эту группу активной (выбранной).<br>" +
                    "В любое время может быть только одна активная группа.<br>" +
                    "Когда позже Вы будете добавлять респондентов из панели «база респондентов», они будут добавляться именно в активную группу.";

                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x+25)+"px")
                    .css("top", $curs.y+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function(){
                $(".gr_beacon").attr("is_on", 0);
                $(this).attr("is_on", 1);
                resp_db.gr_ord = $(this).closest(".deli_edit_box").attr("ord") * 1;
            });

        // switch all categories dropdown to correct position
        let ddlist_cats_order_template = [2,1,3,0]; // self, boss, colleague, employee
        $(".deli_edit_box").each(function (i) {
            $(this).find("select.resp_cat_dropdown").each(function (index) {
                let prop_index = $(this).prop("selectedIndex") * 1;

                if ($new_qz.deli_edit_ord === null) // for default template
                {
                    if (!prop_index) // only if wasnt selected earlier
                    {
                        $(this).prop("selectedIndex", ddlist_cats_order_template[index]); // set dd_list into position corresponding to default templated above
                        //console.log("content_deli_build_editing_list, default, resp_cat_dropdown ord: " + index + ", prop_index: " + prop_index +", index set: " + ddlist_cats_order_template[index]);
                    }
                }
                else // for existing edited list of resps
                {
                    // convert cat_id to selected dropdown index
                    let dd_index = 2; // default index is "colleague"
                    if ($new_qz.deli_edit_list[index] &&
                        $new_qz.deli_edit_list[index].hasOwnProperty("cat_id") &&
                        $new_qz.deli_edit_list[index].cat_id) // position of this resp and his cat_id are valid
                    {
                        let cid = $new_qz.deli_edit_list[index].cat_id;
                        dd_index = get_ddlist_index_from_cat_id(cid, "no_self"); // Transpose global cat_id into dd_index position (0 - first option, 1 - second ...)
                    }
                    $(this).prop("selectedIndex", dd_index);
                }
            });
        });

        $(".resp_line .resp_line_del")
            .off("click")
            .click(function()
            {
                let deli_ord = $(this).closest(".deli_edit_box").attr("ord");

                //message_ex("show","confirm","resp_line_del",)
                let ord = $(this).closest(".resp_line").attr("resp_ord") * 1;
                if (ord)
                    $(this).closest(".resp_line").remove(); // del this resp
                else
                    $(this).closest(".deli_edit_box").remove(); // del whole group

                // Reset order indexes for the whole group
                let new_ord = 0;
                $(".deli_edit_box[ord='"+ deli_ord +"'] .resp_line").each(function () {
                    $(this).attr("resp_ord", new_ord);
                    new_ord++;
                });
            });
    }
    else
    if (action === "resp_add_line")
    {
        let new_ord = $(".resp_cat_dropdown").length;
        s += "<tr class='resp_line' resp_ord='"+new_ord+"'>";
        s += "<td>";
            // add category switcher to col 1
            s += "<div class='cat_dropdown'>" + resp_dd + "</div>";
        s += "</td>";
        for (let i=0; i<5; i++)
        {
            // Define custom info by each cell
            let info = {};
            info.attr = row_attributes[i];
            info.pc = row_placeholders[i];
            info.value = "";
            if (i !== 2 && i !== 4)
                info.valid = "false"; // Father's name is not required
            else
                info.valid = "none";

            s += "<td>";
                // add category switcher to col 1
                s += "<input class='resp_field' attr='"+info.attr+"' placeholder='"+ info.pc +"' valid='"+ info.valid +"' value='"+ info.value +"'>";
            s += "</td>";
        }
        s += "<td><div class='resp_line_del'>удалить</div></td>";
        s += "</tr>";
        return s;
    }
    else
    if (action === "empty_template")
    {
        let groups_qnt = $(".deli_edit_box").length;
        //s += "<div class='mode_notice'>Создание новой фокус-группы</div>";
        s += "<table class='deli_edit_box' ord='"+ groups_qnt +"'>";

        $cats_list_template.forEach(function (v_cat_id, i_cat_id) {
            let k = v_cat_id;

            s += "<tr class='resp_line' resp_ord='"+k+"'>";
            // add category switcher to col 1
            if (!k)
                s += "<td><div class='cat_dropdown'>" +
                    "<div class='resp_cat_dropdown'>" +
                        "<div class='gr_beacon' is_on='0'></div>" +
                    "<b>Фокус-персона</b>" +
                    "</div>" +
                    "</div></td>";
            else
                s += "<td><div class='cat_dropdown'>" + resp_dd + "</div></td>";

            // Fields for each person line
            for (let i=0; i<5; i++)
            {
                // Define custom info by each cell
                let info = {};
                info.attr = row_attributes[i];
                info.valid = "none";
                info.pc = row_placeholders[i];
                info.value = "";
                if (i <= 2)
                {
                    if (i !== 2)
                        info.valid = "false"; // Father's name is not required
                }
                // MAIL
                else if (i === 3)
                    info.valid = "false";

                s += "<td>";
                s += "<input class='resp_field' attr='"+info.attr+"' placeholder='"+ info.pc +"' valid='"+ info.valid +"' value='"+ info.value +"'>";
                s += "</td>";
            }
            // Buttons column
            if (!k)
            {
                if (groups_qnt)
                    s += "<td><div class='resp_line_del'>удалить участника оценки</div></td>";
                else
                    s += "<td></td>";
            }
            else
            {
                if (i_cat_id !== 1)
                    s += "<td><div class='resp_line_del'>удалить</div></td>";
                else
                    s += "<td><div class='resp_line_del_empty'></div></td>";
            }

            s += "</tr>";

        });

        s += "</table>";
        return s;
    }
    else
    if (action === "resp_insert_from_db")
    {
        let db_ord = get_resp_ord_from_resp_id(opts.resp.id);
        let new_resp = {
            fio: $ad.resps[db_ord].fio.split(" "),
            spec: $ad.resps[db_ord].spec,
            cat_id: opts.resp.id,
            mail: $ad.resps[db_ord].mail,
        };
        let new_ord = $(".resp_cat_dropdown").length;
        s += "<tr class='resp_line' resp_ord='"+new_ord+"'>";
        s += "<td>";
        // add category switcher to col 1
        s += "<div class='cat_dropdown'>" + resp_dd + "</div>";
        s += "</td>";
        for (let i=0; i<5; i++)
        {
            // Define custom info by each cell
            let info = {};
            info.attr = row_attributes[i];
            info.pc = row_placeholders[i];
            info.value = "";

            // TEXT
            switch (i){
                case 0:
                    info.value = new_resp.fio[0];
                    break;
                case 1:
                    if (new_resp.fio.hasOwnProperty(1))
                        info.value = new_resp.fio[1];
                    break;
                case 2:
                    if (new_resp.fio.hasOwnProperty(2))
                        info.value = new_resp.fio[2];
                    break;
                case 3:
                    info.value = new_resp.mail;
                    break;
                case 4:
                    info.value = new_resp.spec;
                    break;
            }

            if (i !== 2 && i !== 4)
                info.valid = "false"; // Father's name is not required
            else
                info.valid = "none";

            s += "<td>";
            // add category switcher to col 1
            s += "<input class='resp_field' attr='"+info.attr+"' placeholder='"+ info.pc +"' valid='"+ info.valid +"' value='"+ info.value +"'>";
            s += "</td>";
        }
        s += "<td><div class='resp_line_del'>удалить</div></td>";
        s += "</tr>";
        return s;
    }
    else
    {
        // If we are creating a new qz or present one is empty
        if ($new_qz.deli_edit_ord === null || !$new_qz.deli_edit_list.length)
            s += content_deli_build_editing_list("empty_template");
        else
        {
            //s += "<div class='mode_notice'>Редактирование фокус-группы</div>";
            s += "<table class='deli_edit_box' ord=0>";

            $new_qz.deli_edit_list.forEach(function (v_resp, i_resp) {
                s += "<tr class='resp_line' resp_ord='"+i_resp+"'>";
                // add category switcher to col 1
                if (!i_resp)
                    s += "<td><div class='cat_dropdown'>" +
                        "<div class='resp_cat_dropdown'>" +
                        "<div class='gr_beacon' is_on='0'></div>" +
                        "<b>Фокус-персона</b>" +
                        "</div>" +
                        "</div></td>";
                else
                    s += "<td><div class='cat_dropdown'>" + resp_dd + "</div></td>";

                for (let i=0; i<5; i++)
                {
                    // Define custom info by each cell
                    let info = {};
                    info.attr = row_attributes[i];
                    info.valid = "none";
                    info.pc = row_placeholders[i];
                    if (i <= 2)
                    {
                        let fio = v_resp.fio.split(" ");
                        if (fio[i])
                            info.value = fio[i];
                        else
                            info.value = "";

                        // Not for fathers name
                        if (i !== 2)
                        {
                            if (fio[i])
                                info.valid = "true";
                            else
                                info.valid = "false";
                        }
                    }
                    // MAIL
                    else if (i === 3)
                    {
                        info.value = v_resp.mail;
                        if (validate_email(v_resp.mail))
                            info.valid = "true";
                        else
                            info.valid = "false";
                    }
                    // SPEC
                    else
                    {
                        info.value = v_resp.spec;
                    }

                    // Input field customize to it's relation - FIO or Mail or Spec
                    s += "<td>";
                        s += "<input class='resp_field' attr='"+info.attr+"' placeholder='"+ info.pc +"' valid='"+ info.valid +"' value='"+ info.value +"'>";
                    s += "</td>";
                }
                // Buttons column
                if (!i_resp)
                    s += "<td></td>";
                else
                {
                    s += "<td><div class='resp_line_del'>удалить</div></td>"; // unlock ability to del every resp except self-eval
                    /*
                    if (i_resp !== 1)
                        s += "<td><div class='resp_line_del'>удалить</div></td>";
                    else
                        s += "<td><div class='resp_line_del_empty'></div></td>";
                    */
                }

                s += "</tr>";
            });
            s += "</table>";
        }


        // Export method
        if (action === "get_html")
        {
            return s;
        }
        else if (action === "update_self")
        {
            $(".deli_edit_box")
                .empty()
                .append(s);
            content_deli_build_editing_list("add_events");
        }
    }
}


//----------------------------------------------------------------------------------------------------------------------
function build_deli_list_table(do_return) {
    let d = $new_qz.deli_list;
    let s = "";
    if (do_return === "add_events")
    {
        $(".resp_line .show_batch")
            .off("click")
            .click(function()
            {
                let active = $(this).attr("active") * 1;
                let batch_ord = $(this).closest(".resp_line").attr("batch_ord");
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

        $(".resp_line .resp_line_del")
            .off("click")
            .click(function()
            {
                let deli_ord = $(this).closest(".deli_edit_box").attr("ord");

                //message_ex("show","confirm","resp_line_del",)
                let ord = $(this).closest(".resp_line").attr("resp_ord") * 1;
                if (ord)
                    $(this).closest(".resp_line").remove(); // del this resp
                else
                    $(this).closest(".deli_edit_box").remove(); // del whole group

                // Reset order indexes for the whole group
                let new_ord = 0;
                $(".deli_edit_box[ord='"+ deli_ord +"'] .resp_line").each(function () {
                    $(this).attr("resp_ord", ord);
                    new_ord++;
                })

            });


        // At first show only focus-persons
        $(".resp_line[resp_ord='0']").css("display","table-row");
        focus_groups_qbook_hue_update();

    }
    else
    {
        let comm_gr = $new_qz.settings.comm_groups;
        // Head
        s += "<tr class='head'>" +
                "<td>Фокус-персона<div class='sorter'></div></td>" +
                "<td>ФИО</td>" +
                "<td>E-mail</td>" +
                "<td>Категория</td>" +
                "<td>Должность</td>" +
            "</td>";

        // Body
        d.forEach(function (v_batch, i_batch) {
            // Each qz with it's inhabitants
            v_batch.forEach(function (v_resp, i_resp) {
                s += "<tr class='resp_line' batch_ord='"+i_batch+"' resp_ord='"+i_resp+"'>";
                    // 1) Focus FIO
                    if (!i_resp)
                    {
                        s += "<td>" +
                            "<div style='text-align: left;'>" +
                                "<div class='batch_edit'></div>" +
                                //"<div class='batch_qb'></div>" +
                                "<div class='batch_selfban' is_on='0'></div>" +
                                "<div class='batch_del'></div>" +
                                "<span class='fio'>" + v_resp.fio + "</span>" +

                            "</div>";

                        // Show selected qbook name
                        if (comm_gr.hasOwnProperty(i_batch) && null !== comm_gr[i_batch].qb_id)
                        {
                            let qb_id = comm_gr[i_batch].qb_id;
                            let qb_name = $ad.qbooks[get_qb_ord_from_qb_id(qb_id)].name;
                            s += "<div class='hint_qb' >" +
                                "<div class='batch_qb'></div>" +
                                "<span class='name'>"+ qb_name +"</span>" +
                                "</div>";
                        }
                        else
                            s += "<div class='hint_qb' >" +
                                "<div class='batch_qb'></div>" +
                                "<span class='name'>опросник не выбран</span>" +
                                "</div>";

                        s += "</td>";
                    }
                    else
                        s += "<td></td>";

                    // 2) resp FIO
                    if (!i_resp)
                        s += "<td><div class='show_batch' active='0'></div></td>";
                    else
                        s += "<td>" + v_resp.fio + "</td>";

                    s += "<td>" + v_resp.mail + "</td>";
                    s += "<td>" + v_resp.cat_name + "</td>";
                    s += "<td>" + v_resp.spec + "</td>";
                s += "</tr>";
            });
        });

        // Output type
        if (do_return === true)
        {
            return s;
        }
        else
        {
            $(".deli_box_template_standart .deli_list")
                .empty()
                .append(s);
            build_deli_list_table("add_events");
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function get_resp_category(by, identifier){
    let s; 
    if (by === "by_name")
    {
        switch(identifier.trim().toLowerCase()){
            case "самооценка":
                s = 0;
                break;
            case "смежная команда":
                s = 1;
                break;
            case "коллеги":
                s = 3;
                break;
            case "руководители":
                s = 4;
                break;
            case "подчиненные":
                s = 5;
                break;
            default:
                s = null;
        }
    }
    else
    if (by === "by_id")
    {
        switch(identifier*1){
            case 0:
                s = "Самооценка";
                break;
            case 1:
                s = "Смежная команда";
                break;
            case 3:
                s = "Коллеги";
                break;
            case 4:
                s = "Руководители";
                break;
            case 5:
                s = "Подчиненные";
                break;
            default:
                s = "?категория?";
                break;
        }
    }
    return s;
}
//----------------------------------------------------------------------------------------------------------------------
function resp_exists(fio, mail) {
    let resp_id = null;
    if ($ad.resps.length)
        for (i=0; i<$ad.resps.length; i++)
            if ($ad.resps[i].fio.toLowerCase() === fio.toLowerCase() &&
                $ad.resps[i].mail.toLowerCase() === mail.toLowerCase())
            {
                resp_id =  $ad.resps[i].id;
                break;
            }
    return resp_id;
}
//----------------------------------------------------------------------------------------------------------------------
function adapt_imported_deli_list(src_list, first_row) {
    function is_duplicate(list, item) {
        let is_duplicate = false;
        /*
        console.log("duplicate resp chk // list, item");
        console.log(list);
        console.log(item);
        */
        if (typeof list !== "object")
            message_ex("show","info","Проверке на дубликаты респондентов предоставлен неправильный список.");
        else
            if (list.length)
                for (let i=0; i<list.length; i++)
                    if (list[i].mail.toLowerCase() === item.mail.toLowerCase()) // list[i].fio.toLowerCase() === item.fio.toLowerCase() &&
                    {
                        is_duplicate = true;
                        break;
                    }
        return is_duplicate;
    }
    
    let list = [];
    let batch = [];
    let report = {};
    report.no_charges = false;
    report.resp_qnt_old = 0;
    report.resp_qnt_new = 0;
    report.bad_resp_list = [];
    report.harsh_mistake = false;
    let resp;
    console.log("src_list");
    console.log(src_list);
    for (let i=first_row; i<src_list.length; i++) // ignore first row of headers
    {
        resp = {};
        resp.fio = clean_text(src_list[i][0]);
        resp.mail = clean_text(src_list[i][1]);
        resp.mail_is_valid = validate_email(resp.mail);
        resp.cat_name = clean_text(src_list[i][2]).toLowerCase();
        resp.cat_id = get_resp_category("by_name", resp.cat_name);
        resp.spec = clean_text(src_list[i][3]);
        if ("*" === resp.spec)
            resp.spec = "";
        resp.id = resp_exists(resp.fio, resp.mail); // null if this fella is new, global $ad.deli[x].id if not

        // Check with existing fellas for match fio+mail

        // Detect the start/end of qz by self-eval person with 0-cat_id
        if (resp.cat_id === 0)
        {
            // If prev batch was somewhat filled - make a qz out of it - push to the list
            if (batch.length > 1)
                list.push(batch);
            else if (batch.length === 1) // a single focus-person in a group
            {
                report.harsh_mistake = true;
                resp.reason = "single";
                report.bad_resp_list.push(resp);
                if (batch[0].id === null)
                    report.resp_qnt_new--; // if this was a new resp (that was added infact to batch and counted towards new resps qnt) - reduce new qnt back
            }
            batch = [];
        }

        // FILL GROUP (BATCH)
        if (!resp.fio)
        {
            resp.reason = "no_name";
            report.bad_resp_list.push(resp);
        }
        // Only the focus-person goes first in the list, else that resp in omitted and goes to missed batch
        else if (resp.cat_id === 0 || batch.length)
        {
            // Check for inner duplicates
            if (!batch.length || !is_duplicate(batch, resp))
            {
                // Check out the invalid mail ones
                if (resp.mail_is_valid)
                {
                    if (resp.id === null)
                    {
                        report.resp_qnt_new++;
                        //console.log("new resp");
                        //console.log(resp);
                    }
                    else
                        report.resp_qnt_old++;
                    batch.push(resp);
                }
                else
                {
                    resp.reason = "bad_mail";
                    report.bad_resp_list.push(resp);
                }
            }
            else
            {
                resp.reason = "inner_double";
                report.bad_resp_list.push(resp);
            }

        }
        else
        {
            report.harsh_mistake = true;
            resp.reason = "omitted";
            report.bad_resp_list.push(resp);
        }
    }

    // Don't forget the last batch, cleanup
    if (batch.length === 1) // a single focus-person in a group
    {
        resp = duplicate(batch[0]); // if focus resp is the only one - hes credentials we need to show
        resp.reason = "single";
        report.bad_resp_list.push(resp);
        if (batch[0].id === null)
            report.resp_qnt_new--; // if this was a new resp (that was added infact to batch and counted towards new resps qnt) - reduce new qnt back
    }
    else
    if (batch.length > 1)
        list.push(batch);


    report.resps_list = list;
    if (report.resps_list.length > $pers.focus_charges && $pers.focus_charges*1 !== -50)
    {
        report.resps_list.splice($pers.focus_charges);
        report.no_charges = true;
    }

    console.log("import report");
    console.log(report);

    if (report.bad_resp_list.length)
        message_ex("show","confirm","omitted_imported_resps", report);
    else
        message_ex("show","confirm","resps_import_report", report);

    //return list;
}
//----------------------------------------------------------------------------------------------------------------------
function content_deli_get_edited_list() {
    let list = [];
    let slot;

    $(".deli_edit_box").each(function (i_group) {

        $(this).find(".resp_line").each(function (i_line) {
            slot = [];
            slot[0] = $(this).find(".resp_field[attr='surname']").val() +" "+ $(this).find(".resp_field[attr='name']").val()+" "+ $(this).find(".resp_field[attr='father']").val();
            slot[1] = $(this).find(".resp_field[attr='mail']").val();

            if (!i_line)
                slot[2] = "самооценка";
            else
                slot[2] = $(this).find(".resp_cat_dropdown").val();
            slot[3] = $(this).find(".resp_field[attr='spec']").val();
            list.push(slot);
        });
    });

    console.log("edited list");
    console.log(list);
    return list;
}
//----------------------------------------------------------------------------------------------------------------------
function content_deli_confirm_resps_import($data)
{
    // build list right away
    /*
    let resps_list = duplicate($data.resps_list);
    $data.edited_ord = $new_qz.deli_edit_ord; // remember if we adding this new f-group (null) or editing
    $data.insert_pos = $new_qz.deli_list.length; // index starting from which are new batch of groups will kick in

    if ($data.edited_ord === null)
        // add each focus group to current list
        resps_list.forEach(function (v_focus_group) {
            $new_qz.deli_list.push(v_focus_group);
        });
    else
        $new_qz.deli_list[$data.edited_ord] = resps_list;
    */

    // DB: add new and update all existing resps
    //console.log("batches qnt " + $data.resps_list.length);
    if ($data.resps_list.length)
    {
        let form = {};
        form.resps_list = $data.resps_list;
        //form.insert_pos = $data.insert_pos = $new_qz.deli_list.length; // index starting from which are new batch of groups will kick in
        form.edited_ord = $new_qz.deli_edit_ord; // remember if we adding this new f-group (null) or editing
        console.log("exported data");
        console.log(form);
        sendAJ("import_resps", JSON.stringify(form));
    }
    else
        message_ex("show","info","direct","Список добавляемых респондентов пуст.");

}
//----------------------------------------------------------------------------------------------------------------------
function focus_slots_avaliable() {
    if ($pers.focus_charges && ($new_qz.deli_list.length < $pers.focus_charges || $pers.focus_charges === -50))
    {
        return true
    }
    else
    {
        message_ex("show","info","direct","Невозможно совершить операцию - лимит фокус-персон вашего аккаунта исчерпан.");
        return false;
    }
}
//----------------------------------------------------------------------------------------------------------------------
function focus_groups_update() {
    console.log("focus_groups_update");
    let comm_gr = $new_qz.settings.comm_groups;

    // update comment boxes an qbook id's
    if ($new_qz.deli_list.length)
        $new_qz.deli_list.forEach(function (gr, i_gr) {
            if (!comm_gr.hasOwnProperty(i_gr))
                comm_gr[i_gr] = focus_groups_comm_slot();

            // Insert new lock-fields if none
            if (!comm_gr[i_gr].hasOwnProperty("lock_qz_list"))
                comm_gr[i_gr].lock_qz_list = [];
            if (!comm_gr[i_gr].hasOwnProperty("lock_comp_list"))
                comm_gr[i_gr].lock_comp_list = {};
            if (!comm_gr[i_gr].hasOwnProperty("comp_cats_list"))
                comm_gr[i_gr].comp_cats_list = {};

            if (null !== comm_gr[i_gr].qb_id) // && !comm_gr[i_gr].comp_list.length
            {
                let qb_id = comm_gr[i_gr].qb_id;
                if (!comm_gr[i_gr].hasOwnProperty("last_qb_id"))
                    comm_gr[i_gr].last_qb_id = comm_gr[i_gr].qb_id;


                let qb_ord = get_qb_ord_from_qb_id(qb_id);
                let comp_id_list = get_comp_id_list_from_qst_list($ad.qbooks[qb_ord].list);

                // Check if new comp list differ from the old one
                if (comm_gr[i_gr].hasOwnProperty("comp_list"))
                {
                    // Remove all comps that was deleted
                    if (comm_gr[i_gr].qb_id !== comm_gr[i_gr].last_qb_id) // something was indeed changed so this search is justified
                        Object.keys(comm_gr[i_gr].comp_list).map(function (key) {
                            if (key && comp_id_list.indexOf(key*1) === -1)
                            {
                                delete comm_gr[i_gr].comp_list[key];
                                delete comm_gr[i_gr].lock_comp_list[key];
                                if (comm_gr[i_gr].hasOwnProperty("comp_cats_list"))
                                    delete comm_gr[i_gr].comp_cats_list[key];
                            }
                        });

                    // Create fresh slots for all new (thus non-existant) competentions
                    comp_id_list.forEach(function (comp_id) {
                        // Generate a slot for each comp
                        if (!comm_gr[i_gr].comp_list.hasOwnProperty(comp_id))
                            comm_gr[i_gr].comp_list[comp_id] = [];

                        // No lock list exist - generate with all present questions unlocked
                        if (!comm_gr[i_gr].lock_comp_list.hasOwnProperty(comp_id))
                        {
                            comm_gr[i_gr].lock_comp_list[comp_id] = [];
                            let qst_qnt = obj_len(comm_gr[i_gr].comp_list);
                            if (qst_qnt)
                                for (let z=0; z<qst_qnt; z++)
                                    comm_gr[i_gr].lock_comp_list[comp_id][z] = 0;
                        }

                    });
                }
                else
                {
                    comm_gr[i_gr].comp_list = {};
                    //comm_gr[i_gr].lock_comp_list = {};
                    //comm_gr[i_gr].comp_cats_list = {};
                    comp_id_list.forEach(function (comp_id) {
                        comm_gr[i_gr].comp_list[comp_id] = []; // set a fresh list of qst for the competention
                        comm_gr[i_gr].lock_comp_list[comp_id] = []; // set a fresh list of qst for the competention
                        comm_gr[i_gr].comp_cats_list[comp_id] = [];
                    });
                }

            }

            // repaint selected qbook icons for groups
            if (null !== comm_gr[i_gr].qb_id)
            {
                $(".resp_line[batch_ord='"+ i_gr +"'] .batch_qb").css("filter", "hue-rotate(0deg)");
                let qb_id = comm_gr[i_gr].qb_id;
                let qb_name = $ad.qbooks[get_qb_ord_from_qb_id(qb_id)].name;
                $(".resp_line[batch_ord='"+ i_gr +"'] .hint_qb .name").html(qb_name);
            }
            else
            {
                $(".resp_line[batch_ord='"+ i_gr +"'] .batch_qb").css("filter", "hue-rotate(120deg)");
                $(".resp_line[batch_ord='"+ i_gr +"'] .hint_qb .name").html("опросник не выбран");
            }

        });
}
//----------------------------------------------------------------------------------------------------------------------
function focus_groups_qbook_hue_update() {
    let comm_gr = $new_qz.settings.comm_groups;
    if ($new_qz.deli_list.length)
        $new_qz.deli_list.forEach(function (gr, i_gr) {
            // repaint selected qbook icons for groups
            if (comm_gr.hasOwnProperty(i_gr) && null !== comm_gr[i_gr].qb_id)
                $(".resp_line[batch_ord='"+ i_gr +"'] .batch_qb").css("filter", "hue-rotate(0deg)");
            else
                $(".resp_line[batch_ord='"+ i_gr +"'] .batch_qb").css("filter", "hue-rotate(120deg)");
        });
}

//----------------------------------------------------------------------------------------------------------------------
function groups_chk_qbooks_selected(){
    let all_selected = true;
    if ($new_qz.deli_list.length)
        $new_qz.deli_list.forEach(function (gr, i_gr) {
            if (null === $new_qz.settings.comm_groups[i_gr].qb_id)
                all_selected = false;
        });

    return all_selected;
}



//----------------------------------------------------------------------------------------------------------------------
function focus_groups_comm_slot() {
    let slot = {
        qb_id: null,
        last_qb_id: null,
        self_ban: 0,

        qz_after: false,
        qz_list: [],
        qz_cats_list: [],
        lock_qz_list: [],

        comp_after: false,
        comp_list: {},
        comp_cats_list: {},
        lock_comp_list: {}
    };
    return slot;
}
//----------------------------------------------------------------------------------------------------------------------
function comm_slot_build_cats_qst_slot()
{
    let slot = {};
    $cats_list_template.forEach(function (v_cat_id) {
        slot[v_cat_id] = {
            tx: "",
            is_on: 1
        }
    });
    return slot;
}

//----------------------------------------------------------------------------------------------------------------------
function comm_slot_add_qst(block, batch_ord, id)
{
    let group = $new_qz.settings.comm_groups[batch_ord];
    let q_list, lock_list;
    if (block === "qz")
    {
        q_list = group.qz_list; // qz questions list

        if (!group.hasOwnProperty("lock_qz_list"))
            group.lock_qz_list = [];
        if (!group.hasOwnProperty("qz_cats_list"))
            group.qz_cats_list = [];

        lock_list = group.lock_qz_list;
    }
    else
    {
        if (!group.hasOwnProperty("lock_comp_list"))
            group.lock_comp_list = [];

        if (!group.hasOwnProperty("comp_cats_list"))
            group.comp_cats_list = {};

        if (null === group.comp_list[id])
        {
            group.comp_list[id] = [];
            group.comp_cats_list[id] = {};
            group.lock_comp_list[id] = [];
        }

        q_list = group.comp_list[id]; // comp questions list
        lock_list = group.lock_comp_list[id];
    }

    //let qnt = q_list.length;
    q_list.push(""); // add new empty line to general formulation
    lock_list.push(0);

    // add act-specific fields for this qst
    let qst_ord = q_list.length - 1;
    if (block === "qz")
    {
        if (!group.qz_cats_list.hasOwnProperty(qst_ord))
            group.qz_cats_list[qst_ord] = {};

        group.qz_cats_list[qst_ord] = comm_slot_build_cats_qst_slot();
    }
    else
    {
        if (!group.comp_cats_list.hasOwnProperty(id) ||
            null === group.comp_cats_list[id])
            group.comp_cats_list[id] = []; // slot for question inside the comp

        if (!group.comp_cats_list[id].hasOwnProperty(qst_ord) ||
            null === group.comp_cats_list[id][qst_ord])
            group.comp_cats_list[id][qst_ord] = {}; // slot for categories inside the question

        // Assemble template of each category slot of the question
        group.comp_cats_list[id][qst_ord] = comm_slot_build_cats_qst_slot();
    }


    let s = "";
    s += "<tr ord='"+ qst_ord +"'>";
    s += "<td>" +
        (qst_ord + 1) +". "+
        "<div class='lock_btn' is_locked='0'></div>" +
        "</td>";
    s += "<td class='line'>";
    s += "<input type='text' placeholder='..текст вопроса..'>";
    s += content_options_feedback_list_update("add_cats_fields", {
        batch_ord: batch_ord,
        type: block,
        id: id,
        qst_ord: qst_ord
    });
    s += "</td>";
    s += "<td><div class='btn_del_fb_line'>удалить</div></td>";
    s += "</tr>";

    return s;
}
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
function content_deli_qp_box(do_return, opts)
{
    if (do_return === "add_quiz")
    {
        let successfull_qnt = 0;
        let resps = $ad.qzs[opts.qz_ord].resps;
        resps.forEach(function (v_gr, i_gr) {
            let response = content_deli_qp_box("add_group", {qz_ord: opts.qz_ord, gr_ord: i_gr});
            if (response)
                successfull_qnt++;
        });
        return successfull_qnt;
    }
    else
    if (do_return === "add_group")
    {
        let new_deli_group = [];

        /* template of what DB resp HAVE
            data: []
            fio: "Респондент 10"
            id: 587
            mail: "some_mail_10@mail.com"
            spec: ""
            status: 0
            last_upd: 1603839807
            cd: 1603839807
            ud: 1603839807
         */

        /* TEMPLATE of RESP in QZ GROUP
            ans_list: (36) [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1]
            back_ans_list: []
            cat_id: 0
            feedback: []
            id: 595
            idk_comms: []
            ignore: false
            last_message_id: "17747377591"
            last_message_status: null
            last_remainder_date: 1603869082
            last_upd: 1603869283
            remainders_sent: 0
            ukey: "ZvJPO"
         */

        /* template of what every resp SHOULD HAVE
            cat_id: 0
            cat_name: "самооценка"
            data: []
            fio: "A X"
            id: 606
            mail: "a@a.a"
            spec: "kek"

            status: 0
            last_upd: 1613137495
            cd: 1613137495
            ud: 1613137495
        */

        let group = $ad.qzs[opts.qz_ord].resps[opts.gr_ord];
        group.forEach(function (v_resp, i_resp) {
            let db_resp = get_resp_ord_from_resp_id(v_resp.id);
            db_resp = $ad.resps[db_resp];
            let resp_slot = {
                id: v_resp.id,
                cat_id: v_resp.cat_id,
                cat_name: g_cats_name_list_short[v_resp.cat_id],
                last_upd: v_resp.last_upd,
                data:[],

                status: 0,
                spec: db_resp.spec,
                mail: db_resp.mail,
                fio: db_resp.fio,
                cd: db_resp.cd,
                ud: db_resp.ud
            }; // Form a slot by deli_list standarts

            new_deli_group.push(resp_slot);
        });
        if (new_deli_group.length)
            $new_qz.deli_list.push(new_deli_group);
        return new_deli_group.length;

    }
    else
    if (do_return === "add_events")
    {
        $(".qp_box")
            .off("mouseenter")
            .off("mouseleave")
            .mouseleave(function() {$(this).css("opacity", 0.2)})
            .mouseenter(function() {$(this).css("opacity", 1)});

        // Close the whole RespDB window
        $(".qp_box .head .close")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "Закрыть базу респондентов";
                let cont = "Нажмите чтобы убрать базу респондентов.";
                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x-400)+"px")
                    .css("top", ($curs.y + 30)+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function(){
                $(".qp_box").remove();
                floater_hint("remove"); // do this for hint of closing to not stick
            });

        // QUIZ: show all hidden
        $(".qp_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                if (qdrag.ord === null)
                {
                    let head = "", cont = "";
                    let action = $(this).attr("action");
                    switch (action) {
                        case "show_hidden":
                            head = "Показать все опросы";
                            cont = "Отобразить в панели все блоки опросов.";
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
                        $(".qp_box .list .qz_tile[is_hidden='1']").css("display","block");
                        $(this).css("display","none");
                        break;
                }
            });

        $(".qp_box .head .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                if (qdrag.ord === null)
                {
                    let head = "", cont = "";
                    let action = $(this).attr("action");
                    switch (action) {
                        case "add":
                            head = "Добавить опрос";
                            cont = "Добавляет в список создаваемого опроса все группы респондентов (с теми же ролями) из этого опроса.";
                            break;
                        case "wrap":
                            head = "Показать/скрыть вопросы";
                            cont = "Отображает/скрывает список всех вопросов, принадлежащих данной компетенции.";
                            break;
                        case "hide":
                            head = "Cкрыть компетенцию";
                            cont = "Скрывает блок компетенции в панели. Чтобы потом вернуть ее нажмите на «Показать все компетенции» вверху блока.";
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
                let qz_tile;
                let action = $(this).attr("action");
                let comp_id, comp_name;
                switch (action) {
                    case "add":
                        qz_ord = $(this).closest(".qz_tile").attr("qz_ord") * 1;
                        message_ex("show","confirm","add_whole_qz_to_list",{qz_ord: qz_ord});
                        break;

                    case "wrap":
                        qz_tile = $(this).closest(".qz_tile");

                        if (qz_tile.attr("is_wrapped")*1)
                        {
                            qz_tile.attr("is_wrapped", 0);
                            qz_tile.find(".btn[lvl='qz'][action='wrap']").css("transform", "rotate(-90deg)");
                            qz_tile.find(".gr_item").css("display","block");
                            qz_tile.find(".notify").css("display","block");
                            qz_tile.css("padding-bottom","5px");
                        }
                        else
                        {
                            qz_tile.attr("is_wrapped", 1);
                            qz_tile.find(".btn[lvl='qz'][action='wrap']").css("transform", "rotate(0deg)");
                            qz_tile.find(".gr_item").css("display","none");
                            qz_tile.find(".notify").css("display","none");
                            qz_tile.css("padding-bottom","0");
                        }
                        break;

                    case "hide":
                        $(this).closest(".qz_tile")
                            .attr("is_hidden", 1)
                            .css("display","none");

                        $(".qp_box .btn[action='show_hidden']").css("display","block");
                        break;
                }
            });

        $(".qp_box .gr_item>.opts_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                if (qdrag.ord === null)
                {
                    let head = "", cont = "";
                    let action = $(this).attr("action");
                    switch (action) {
                        case "add":
                            head = "Добавить группу";
                            cont = "Добавляет эту группу как отдельную в текущий список запуска нового опроса.";
                            break;
                        case "wrap":
                            head = "Показать/скрыть участников";
                            cont = "Отображает/скрывает список всех участников в данной группе.";
                            break;

                        case "focus_add":
                            head = "Заполнить фокус-персону";
                            cont = "Ввести данные этого респондента в поля фокус-персоны выбранной группы.<br>" +
                                "Удерживайте клавишу shift при нажатии, чтобы добавить фокус-персону как респондента, имеющего роль по-умолчанию.";
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
                let qz_ord, gr_ord;
                let comp_id, comp_name;
                switch (action) {
                    case "add":
                        qz_ord = $(this).closest(".qz_tile").attr("qz_ord") * 1;
                        gr_ord = $(this).closest(".gr_item").attr("gr_ord") * 1;

                        message_ex("show","confirm","add_group_to_deli_list",{qz_ord: qz_ord, gr_ord: gr_ord});
                        break;

                    case "focus_add":
                        if (null === resp_db.gr_ord) // some group was selected
                            message_ex("show","info","direct","Невозможно совершить операцию - не выделена целевая группа.");
                        else
                        {
                            qz_ord = $(this).closest(".qz_tile").attr("qz_ord") * 1;
                            gr_ord = $(this).closest(".gr_item").attr("gr_ord") * 1;
                            let new_resp = $ad.qzs[qz_ord].resps[gr_ord][0];
                            let new_resp_id = new_resp.id;

                            let focus_resp_qz = duplicate($ad.qzs[qz_ord].resps[gr_ord][0]);
                            let focus_ord = get_resp_ord_from_resp_id(focus_resp_qz.id);
                            let focus_resp_db = duplicate($ad.resps[focus_ord]);
                            let focus_fio = focus_resp_db.fio;
                            focus_fio = focus_fio.split(" ");

                            // Shift is held - add focus person as new resp with default cat_id
                            if ($keyboard.is_down.indexOf(16) !== -1)
                            {
                                let is_uniue = true;
                                // Check target group for dublicates
                                if ($new_qz.deli_list.hasOwnProperty(resp_db.gr_ord))
                                {
                                    let gr = $new_qz.deli_list[resp_db.gr_ord];
                                    if (gr.length)
                                        for (let b=0; b<gr.length; b++)
                                        {
                                            if (gr[b] === new_resp_id)
                                            {
                                                is_uniue = false;
                                                break;
                                            }
                                        }
                                }

                                if (!is_uniue)
                                    message_ex("show","info","direct","Невозможно совершить операцию - такой респондент уже содержится в выбранной группе.");
                                else
                                {
                                    let html = content_deli_build_editing_list("resp_insert_from_db", {resp: focus_resp_qz, resp_ord: focus_ord});
                                    $(".deli_edit_box[ord=" + resp_db.gr_ord + "]").append(html); // add to the last group
                                    $(".resp_line .resp_field").trigger("change"); // trigger to activate green HL where info is filled and valid

                                    content_deli_build_editing_list("add_events"); // refresh events
                                    let x = $(".deli_edit_box[ord=" + resp_db.gr_ord + "] .resp_cat_dropdown");
                                    x[x.length-1].selectedIndex = 0; // set the cat_dd to correct category
                                }
                            }
                            // Fill data of existing focus person
                            else
                            {
                                // Surname
                                let resp_line = $(".deli_edit_box[ord='"+resp_db.gr_ord+"'] .resp_line[resp_ord='0']");
                                resp_line.find("input[attr='surname']").val(focus_fio[0]);

                                // Name
                                if (focus_fio.length > 1 && focus_fio[1])
                                    resp_line.find("input[attr='name']").val(focus_fio[1]);

                                // Father's name
                                if (focus_fio.length > 2 && focus_fio[2])
                                    resp_line.find("input[attr='father']").val(focus_fio[2]);

                                resp_line.find("input[attr='mail']").val(focus_resp_db.mail); // Mail
                                resp_line.find("input[attr='spec']").val(focus_resp_db.spec); // Spec
                                $(".resp_field").trigger("change"); // auto-color valid fields with green
                            }

                        }


                        break;

                    case "wrap":
                        let gr_item = $(this).closest(".gr_item");
                        if ($(this).attr("is_wrapped")*1)
                        {
                            $(this).attr("is_wrapped", 0); // state of a button
                            gr_item
                                .attr("is_wrapped", 0)
                                .find(".resp_item").css("display","block");
                        }
                        else
                        {
                            $(this).attr("is_wrapped", 1);
                            gr_item
                                .attr("is_wrapped", 1)
                                .find(".resp_item").css("display","none");
                        }
                        break;
                }
            });

        // RESP TILE
        $(".resp_item>.opts_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                if (qdrag.ord === null)
                {
                    let head = "", cont = "";
                    let action = $(this).attr("action");
                    switch (action) {
                        case "add":
                            head = "Добавить респондента";
                            cont = "Чтобы добавить респондента, Вам нужно:<br>" +
                                "1) Напротив надписи «Фокус-персона» нажать на иконку звездочки, чтобы она подсветилась (это указатель куда будут добавляться все последующие респонденты из базы).<br>" +
                                "2) Нажать на эту кнопку напротив респондента, чтобы добавить его в выбранную группу.";
                            break;
                    }
                    let tx = "<div class='head'>" + head + "</div>" + cont;

                    $(".floater")
                        .css("display", "inline-block")
                        .css("width", "400px")
                        //.css("height", "350px")
                        .css("left", ($curs.x-430)+"px")
                        .css("top", $curs.y+"px")
                        .css("border-color", "#4A67AD")
                        .html(tx);
                }

            })
            .off("click")
            .click(function(){
                let action = $(this).attr("action");
                switch (action) {
                    case "add":
                        if (null === resp_db.gr_ord) // some group was selected
                            message_ex("show","info","direct","Невозможно совершить операцию - не выделена целевая группа.");
                        else
                        {
                            let qz_ord = $(this).closest(".qz_tile").attr("qz_ord") * 1;
                            let gr_ord = $(this).closest(".gr_item").attr("gr_ord") * 1;
                            let resp_ord = $(this).closest(".resp_item").attr("resp_ord") * 1;
                            console.log("qz_ord", qz_ord, "gr_ord", gr_ord, "resp_ord", resp_ord);

                            let new_resp = $ad.qzs[qz_ord].resps[gr_ord][resp_ord];
                            let new_resp_id = new_resp.id;
                            let is_uniue = true;
                            // Check target group for dublicates
                            if ($new_qz.deli_list.hasOwnProperty(resp_db.gr_ord))
                            {
                                let gr = $new_qz.deli_list[resp_db.gr_ord];
                                if (gr.length)
                                    for (let b=0; b<gr.length; b++)
                                    {
                                        if (gr[b] === new_resp_id)
                                        {
                                            is_uniue = false;
                                            break;
                                        }
                                    }
                            }

                            if (!is_uniue)
                                message_ex("show","info","direct","Невозможно совершить операцию - такой респондент уже содержится в выбранной группе.");
                            else
                            {
                                //console.log("new_resp", new_resp);
                                let html = content_deli_build_editing_list("resp_insert_from_db", {resp: $ad.qzs[qz_ord].resps[gr_ord][resp_ord], resp_ord: resp_ord});
                                $(".deli_edit_box[ord=" + resp_db.gr_ord + "]").append(html); // add to the last group

                                content_deli_build_editing_list("add_events"); // refresh events

                                let x = $(".deli_edit_box[ord=" + resp_db.gr_ord + "] .resp_cat_dropdown");

                                let cat_index = 0;

                                switch (new_resp.cat_id) {
                                    case 1: cat_index = 0;break;
                                    case 3: cat_index = 1;break;
                                    case 4: cat_index = 2;break;
                                    case 5: cat_index = 3;break;
                                }

                                //console.log("cat_index " + cat_index);
                                x[x.length-1].selectedIndex = cat_index; // set the cat_dd to correct category
                                $(".resp_field").trigger("change"); // auto-color valid fields with green
                            }
                        }



                        break;
                }
            });

        /*
        // Qst drag start
        $(".gr_item .tx")
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
                qdrag.ord = $(this).closest(".gr_item").attr("qsts_ord") * 1; // get this qst's global ord in qsts array
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
        */
    }
    else
    {
        let s = "";
        if ($ad.qzs.length)
            $ad.qzs.forEach(function (v_qz, i_qz) {
                s += "<div class='qz_tile'  is_wrapped='1' is_hidden='0' id='"+ v_qz.id +"' qz_ord='"+ i_qz +"'>";
                s += "<table class='head'><tr>";
                if (2 === $new_qz.deli_screen_id) // only in center mode of resps screen
                    s += "<td><div class='btn' action='add'></div></td>";
                else
                    s += "<td></td>";
                s += "<td><div class='name'>" + v_qz.name + "</div></td>";
                s += "<td><div class='btn' lvl='qz' action='wrap'></div></td>";
                //s += "<td><div class='btn' action='edit'></div></td>";
                s += "<td><div class='btn' action='hide'></div></td>";

                s += "</tr></table>";


                if (!v_qz.resps.length)
                    s += "<div class='notify'>Нет ни одной группы</div>";
                else
                    v_qz.resps.forEach(function (v_gr, i_gr) {
                        let focus_ord = get_resp_ord_from_resp_id(v_gr[0].id);

                        if (null !== focus_ord)
                        {
                            let focus_fio = $ad.resps[focus_ord].fio;
                            s += "<div class='gr_item' gr_ord='"+i_gr+"' is_wrapped='1'>";
                            s += "<div class='opts_box'>";
                            s += "<div class='btn' action='wrap' is_wrapped='1'></div>";
                            if (2 === $new_qz.deli_screen_id) // only in center mode of resps screen
                                s += "<div class='btn' action='add'></div>";
                            else
                            if (3 === $new_qz.deli_screen_id) // only in center mode of resps screen
                                s += "<div class='btn' action='focus_add'></div>";
                            s += "</div>";
                            s += "<div class='tx'><span class='q_index'>" + (i_gr + 1) + ".</span> <span class='string'>" + focus_fio + "</span></div>";

                            // Get every resp in this group
                            v_gr.forEach(function (v_resp, i_resp) {
                                if (i_resp) // skip the focus-person, as it's highlighted in gr_item tab
                                {
                                    focus_ord = get_resp_ord_from_resp_id(v_resp.id);

                                    if (null !== focus_ord) // resp still exists in the database
                                    {
                                        let focus_fio = $ad.resps[focus_ord].fio;
                                        s += "<div class='resp_item' resp_ord='"+i_resp+"' is_wrapped='1'>";
                                        if (3 === $new_qz.deli_screen_id) // specific group is selected - show ctrl to add resps from DB to it
                                        {
                                            s += "<div class='opts_box'>";
                                            s += "<div class='btn' action='add'></div>";
                                            s += "</div>";
                                        }

                                        s += "<div class='tx'>" +
                                            "<span class='q_index'>" + (i_resp + 1) + ".</span> " +

                                            "<span class='string'>" + focus_fio + "</span>" + " " +

                                            "<div class='role' >"+
                                            g_cats_name_list_short[v_resp.cat_id] +
                                            "</div>" +
                                            "</div>";
                                        s += "</div>"; // end of "gr_item" box
                                    }
                                }
                            });

                            s += "</div>"; // end of "gr_item" box
                        }
                    });


                s += "</div>";
            });

        let wrap = "";
        wrap += "<div class='qp_box'>";
        wrap += "<div class='head'>База респондентов" +
            "<div class='close'></div>" +
            "</div>";
        wrap += "<div class='btn' action='show_hidden'>" +

            "<div class='img'></div>" +
            "<div class='tx'>Показать скрытые опросы</div>" +
            "</div>";
        wrap += "<div class='list'>" + s + "</div>";
        wrap += "</div>";

        if (do_return === true)
            return wrap;
        else
        {
            $(".deli_box .qp_box").remove();
            $(".deli_box").prepend(wrap);
            content_deli_qp_box("add_events");
        }
    }
}

//----------------------------------------------------------------------------------------------------------------------
function content_deli_events()
{
    // ************************************     MAIN WINDOW EVENTS     ********************************************


    // ************************************     TEMPLATE_STANDART EVENTS     *******************************************
    build_deli_list_table("add_events");

    $(".deli_box .head .qp_box_toggle")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
        .mouseenter(function()
        {
            let head = "Открыть базу респондентов";
            let cont = "Нажмите чтобы отобразить базу респондентов.";
            let tx = "<div class='head'>" + head + "</div>" + cont;

            $(".floater")
                .css("display", "inline-block")
                .css("width", "400px")
                //.css("height", "350px")
                .css("left", ($curs.x-300)+"px")
                .css("top", ($curs.y+25)+"px")
                .css("border-color", "#4A67AD")
                .html(tx);
        })
        .off("click")
        .click(function(){
            content_deli_qp_box(0);
        });

    $(".deli_box_template_standart .deli_list+.btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {

                case "back":
                    new_qz_tab_progress(2);
                    show_content("qst");
                    break;

                // back to loading list of resps
                case "load":
                    $new_qz.deli_screen_id = 1;
                    show_content("deli_set");
                    break;

                case "edit":
                    if (focus_slots_avaliable())
                    {
                        $new_qz.deli_screen_id = 3;
                        show_content("deli_set");
                    }
                    break;

                case "next":
                    if (!$new_qz.deli_list.length || $new_qz.deli_list[0].length < 2)
                        message_ex("show","info","direct","Чтобы продолжить Вам нужно создать минимум одну фокус-персону и одного респондента для нее.");
                    else
                    if (!groups_chk_qbooks_selected()) // make sure that qbooks are picked for all groups
                        message_ex("show","info","direct","Не у всех фокус-групп выбран опросник.<br>" +
                            "Нажмите на красную иконку опросника в строке фокус-персоны, чтобы открыть окно выбора опросника.<br>" +
                            "Выбранный опросник подсвечен синей иконкой.");
                    else
                    {
                        new_qz_tab_progress(4);
                        show_content("options");
                        $session.set();
                    }

                    break;
            }
        });

    $(".batch_edit")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
        .mouseenter(function()
        {
            floater_hint("show",{
                head: "Редактировать фокус-группу",
                tx: "Открыть фокус-группу в окне для редактирования.<br>(добавить/удалить респондентов, изменить категорию)",
                w: 400,
                dx: 0,
                dy: 20,
            });
        })
        .off("click")
        .click(function(){
            // get order index of to be edited qz
            let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
            $new_qz.deli_edit_ord = batch_ord;
            $new_qz.deli_edit_list = $new_qz.deli_list[batch_ord];
            // go to edit deli screen
            $new_qz.deli_screen_id = 3;
            show_content("deli_set");
        });

    $(".batch_qb")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
        .mouseenter(function()
        {
            floater_hint("show",{
                head: "Выбрать опросник для фокус-группы",
                tx: "Открыть окно для определения опросника для этой фокус-группы.",
                w: 400,
                dx: 0,
                dy: 20,
            });
        })
        .off("click")
        .click(function(){
            // get order index of to be edited qz
            let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
            let focus_resp_slot = duplicate($new_qz.deli_list[batch_ord][0]);
            focus_resp_slot.batch_ord = batch_ord;
            message_ex("show", "group_qb_select", "qb_select", focus_resp_slot); // send focus-person slot
        });

    $(".batch_selfban")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
        .mouseenter(function()
        {
            floater_hint("show",{
                head: "Исключить фокус-персону",
                tx: "Активируйте, чтобы исключить фокус-персону из оценки.<br>" +
                    "Таким образом респонденту в роли самооценки не будут приходить письма и он эффективно будет отсутствовать в процессе оценки.",
                w: 400,
                dx: 0,
                dy: 20,
            });
        })
        .off("click")
        .click(function(){
            // get order index of to be edited qz

            let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
            let is_on = $(this).attr("is_on") * 1;
            is_on = Math.abs(is_on - 1);
            $(this).attr("is_on", is_on);

            $new_qz.settings.self_ban_list[batch_ord] = is_on;
            /*
            if (null !== $new_qz.settings.comm_groups[batch_ord].qb_id) // qbook chosen for this group
            {


            }
            */
        })
        // Refresh image of each disabled self-eval btn
        .each(function () {
            let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;

            if ($new_qz.settings.hasOwnProperty("self_ban_list") &&
                $new_qz.settings.self_ban_list.hasOwnProperty(batch_ord)
            )
            {
                $(this).attr("is_on", $new_qz.settings.self_ban_list[batch_ord]);
            }

        });

    $(".batch_del")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
        .mouseenter(function()
        {
            floater_hint("show",{
                head: "Удалить фокус-группу",
                tx: "Удилать фокус-персону и ее респондентов.",
                w: 400,
                dx: 0,
                dy: 20,
            });
        })
        .off("click")
        .click(function(){
            // get order index of to be edited qz
            let batch_ord = $(this).closest(".resp_line").attr("batch_ord") * 1;
            message_ex("show","confirm","resp_delete_batch_from_list", batch_ord);
        });

    focus_groups_update();

    // ************************************     TEMPLATE_LOAD EVENTS     ***********************************************
    $(".deli_box_template_load .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {

                case "back":
                    new_qz_tab_progress(2);
                    show_content("qst");
                    break;

                case "load":
                    if (focus_slots_avaliable())
                    {
                        $(".fileloader_deli").trigger("click");
                    }
                    //show_content("deli_set");
                    break;

                case "show_list":
                    //if ($new_qz.deli_list.length)
                    {
                        $new_qz.deli_edit_ord = null;
                        $new_qz.deli_screen_id = 2;
                        show_content("deli_set");
                    }
                    break;

                case "edit":
                    if (focus_slots_avaliable())
                    {
                        $new_qz.deli_screen_id = 3;
                        show_content("deli_set");
                    }
                    break;
            }
        });

    $(".fileloader_deli")
        .change(function(e){
            let reader = new FileReader();
            reader.readAsArrayBuffer(e.target.files[0]); // windows-1251 utf-8
            reader.onload = function(e)
            {
                let data = new Uint8Array(e.target.result);
                let workbook = XLSX.read(data, {type: 'array'});
                let deli_list = workbook_to_array(workbook, 4); // get array of imported resps with all their fields being named
                $new_qz.deli_edit_ord = null; // indicate that we are introducing a new list
                adapt_imported_deli_list(deli_list, 1); // separate linear array by focus persona groups
                $(".fileloader_deli").val(""); // reset to be able to import same file right away
                //let html = XLSX.write(workbook, {sheet:workbook.SheetNames[0], type:"binary", bookType:"html"});
                //import_qsts(reader.result);
            };
        });

    $(".deli_box_template_load .btn[action='load_deli_template']")
        .off("click")
        .click(function(){
            window.open(PATH + "Оценка360_(шаблон_загрузки_рассылки).xlsx");
        });

    // ************************************     TEMPLATE_MANUAL EVENTS     *********************************************
    content_deli_build_editing_list("add_events"); // refresh events

    $(".deli_box_template_manual .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {

                case "resp_add":
                    let groups_qnt = $(".deli_edit_box").length;

                    $(".deli_edit_box[ord="+(groups_qnt-1)+"]").append(content_deli_build_editing_list("resp_add_line")); // add to the last group

                    let x = $(".resp_cat_dropdown");
                    x[x.length-1].selectedIndex = 2;
                    content_deli_build_editing_list("add_events"); // refresh events
                    break;

                case "group_add":
                    $(".deli_edit_wnd").append(content_deli_build_editing_list("empty_template"));
                    build_deli_list_table("add_events");
                    content_deli_build_editing_list("add_events"); // refresh events
                    break;


                case "reset":
                    $(".deli_edit_wnd")
                        .empty()
                        .append(content_deli_build_editing_list("empty_template"));
                    build_deli_list_table("add_events");
                    content_deli_build_editing_list("add_events"); // refresh events
                    break;

                case "back":
                    if ($new_qz.deli_edit_ord === null) // no group editing - back to qst
                    {
                        new_qz_tab_progress(2);
                        show_content("qst");
                    }
                    else
                    {
                        $new_qz.deli_edit_ord = null;
                        $new_qz.deli_screen_id = 2;
                        show_content("deli_set");
                        //$(".deli_box_template_manual .btn_box .btn[action='show_list']").trigger("click"); // was editing a group - back to deli lists
                    }

                    break;

                // save created/edited qz and show list
                case "save":
                    let resp_list = content_deli_get_edited_list();
                    adapt_imported_deli_list(resp_list, 0); // this will reformat, check for errors and save to DB (update/insert) all the resps in this focus group
                    break;

                // back to loading list of resps
                case "load":
                    $new_qz.deli_screen_id = 1;
                    show_content("deli_set");
                    break;

                // go back to list without saving
                case "show_list":
                    $new_qz.deli_edit_ord = null;
                    $new_qz.deli_screen_id = 2;
                    show_content("deli_set");
                    break;
            }
        });


}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_hintbox_adapt()
{
    let $res = "";
    $res += "<div class='hint_box'>";
        $res += "<div class='btn_close'></div>";
        $res += "<div class='head'>Настройка опросников: вес вопросов и формулировки для ролей</div>";
        $res += "<div class='tx'>Чтобы приступить к настройке опросника, найдите требуемый опросник в папке и затем нажмите на кнопку настройки " +
            "<span class='icon' tag='qb_adapt'></span> в его строке.";
        $res += "</div>";
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_adapt_screen()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='qbooks_adapt_wnd'>";
    $res += "<div class='head'>Готовые вопросы по компетенциям</div>";
    //$res += content_qst_answer_set_wnd();

    // HINT BOX
    $res += content_qst_hintbox_adapt();
    $res += "<div class='dirs_wnd' "+$nosel+">";
        $res += "<div class='head'><div class='dirs_folder' is_fold='1'></div><div class='icon' type='di'></div><div class='dirs_folding_save'></div>Опросники</div>";
        $res += content_qst_dirs("get_html");
    $res += "</div>";

    $res += "<table class='qb_adapt_box'>";
        $res += qb_adapt("get_html");
    $res += "</table>";

    $res += "<table class='btn_box'><tr>";
        $res += "<td><div class='btn' action='back'>Назад</div></td>";
        $res += "<td><div class='btn' action='next'>Продолжить</div></td>";
    $res += "</tr></table>";

    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_line_comp(comp_slot, comp_id) {
    let ord = get_comp_ord_from_comp_id(comp_id);
    let c = $ad.comps[ord];

    let s = "<tr class='line' type='comp' comp_id='"+ comp_id +"'>";


    s += "<td>" + c.name + "</td>"; // Name

    s += "<td><div class='comp_wg'><input placeholder='0-1' value='"+ comp_slot.wg +"'></div></td>"; // Weight

    let val = "";
    if (comp_slot.targ_avg)
        val = comp_slot.targ_avg;

    s += "<td>"; // Ефкпуе мфдгуы
        s += "<div class='comp_targ'><input type='text' value='"+ val +"'></div>";
        //s += "<div class='comp_targ_total'><input placeholder='целевое суммарное' value='"+ comp_slot.targ_total +"'></div>";
    s += "</td>";

    [0,4,3,5].forEach(function (cat_id) {
        s += "<td class='cat_slot'><div class='switch' cat_id='"+ cat_id +"' is_on='1'></div></td>";
    });

    // Cats columns
/*
    let cat_ids = [0,4,3,5];
    cat_ids.forEach(function (v_id) {
        //s += "<td>" + get_resp_category("by_id", v_id) + "</td>";
        s += "<td></td>";
    });
*/



    s += "</tr>";
    return s;

}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_line_qst(qst_slot, qst_id, comp_id) {
    let ord = get_qst_ord_from_qst_id(qst_id);
    let q = $ad.qsts[ord];

    let s = "<tr class='line' type='qst' qid='"+ qst_id +"' comp_id='"+ comp_id +"'>";

    s += "<td>" + q.tx + "</td>"; // Name

    s += "<td><div class='qst_wg'><input value='"+ qst_slot.wg +"' placeholder='0-1'></div></td>"; // Weight
    let val = "";
    if (qst_slot.targ)
        val = qst_slot.targ;

    s += "<td><div class='qst_targ'><input value='"+ val +"'></div></td>";
    // Cats columns
    let cat_ids = [0,4,3,5];
    cat_ids.forEach(function (v_id) {
        s += "<td class='cat_slot' cat_id='"+ v_id +"'>";
            let tx = "";
            if (qst_slot.cats[v_id].tx)
                tx = qst_slot.cats[v_id].tx;
            s += "<div class='switch' is_on='"+ qst_slot.cats[v_id].is_on +"'></div><textarea class='tx' >"+ tx +"</textarea>";
        s += "</td>";
    });

    s += "</tr>";
    return s;

}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_weight_constraint(val){
    let weight = val * 1;
    if (!weight && weight !== 0) // for all invalid stuff except zero
        weight = 0;
    /*
    else
    if (weight > 1)
        weight = 1;
    */
    return weight;
}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_targ_val_constraint(val){
    let targ = val * 1;
    //let max_value = $new_qz.settings.answer_opts_list.length - 1;
    let max_value = 9999;

    if (!targ && targ !== 0) // for all invalid stuff except zero
        targ = 0;
    else
    if (targ > max_value)
        targ = max_value;
    return targ;
}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_mark_as_unsaved() {
    $new_qz.temp_struct[$new_qz.qb_adapt_id].is_saved = 0;
    $(".line[type=title] .qb_save").attr("is_saved", 0);
}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt(action) {
    let s = "";
    if (null !== $new_qz.qb_adapt_ord)
    {
        //qb_adapt_update_structure($new_qz.qb_adapt_ord); // update structure of the qbook
        qb_adapt_check_structure($new_qz.qb_adapt_ord);// chk validity of structure's sub_object

        if (action === "add_events")
        {
            $(".line[type=title] .qb_save")
                .off("mouseleave")
                .mouseleave(function(){floater_hint("remove")})
                .off("mouseenter")
                .mouseenter(function(){
                    //let ofs = $(this).offset();
                    floater_hint("show",{
                        head: "Сохранить опросник",
                        tx: "Сохранить адаптивную структуру в опросник.<br>" +
                        "Если эта иконка <span style='color: #b30a18'>красная</span> - с момента последнего сохранения были произведены изменения в структуре.",
                        w: 400,
                        dx: -200,
                        dy: 30,
                    });
                })
                .off("click")
                .click(function () {
                    let struct = $new_qz.temp_struct[$new_qz.qb_adapt_id];
                    struct.is_saved = 1; // mark as saved

                    let form = {
                        qb_ord: $new_qz.qb_adapt_ord,
                        qb_id: $new_qz.qb_adapt_id,
                        struct: duplicate(struct)
                    };

                    if (null !== form.qb_ord)
                        sendAJ("qbook_redir", JSON.stringify(form));
                });

            // QST TX
            $(".cat_slot .tx")
                .off("mouseleave")
                .mouseleave(function(){floater_hint("remove")})
                .off("mouseenter")
                .mouseenter(function(){
                    //let ofs = $(this).offset();
                    floater_hint("show",{
                        head: "Формулировка вопроса для категории",
                        tx: "Определяет текст для данного вопроса, который увидят респонденты этой категории/роли.<br>" +
                        "Оставьте поле пустым чтобы использовать формулировку по-умолчанию.",
                        w: 400,
                        dx: -450,
                        dy: -50
                    });
                })
                .off("keyup")
                .keyup(function (e) {
                    let cat_id = $(this).closest(".cat_slot").attr("cat_id")*1;
                    let qid = $(this).closest(".line").attr("qid")*1;
                    let tx = $(this).val();
                    let qb_id = $ad.qbooks[$new_qz.qb_adapt_ord].id;
                    $new_qz.temp_struct[qb_id].q_list[qid].cats[cat_id].tx = tx;
                    qb_adapt_mark_as_unsaved();
                    floater_hint("remove");
                });

            // QST ON/OFF
            $(".qb_adapt_box .line[type='qst'] .switch")
                .off("mouseleave")
                .mouseleave(function(){floater_hint("remove")})
                .off("mouseenter")
                .mouseenter(function(){
                    floater_hint("show",{
                        head: "Вкл./выкд. вопроса для категории",
                        tx: "Определяет будет ли данный вопрос задан респондентам этой категории/роли.",
                        w: 300,
                        dx: -150,
                        dy: 20
                    });
                })
                .off("click")
                .click(function () {
                    let is_on = Math.abs($(this).attr("is_on")*1 - 1); // toggle 0-1 values
                    let cat_id = $(this).closest(".cat_slot").attr("cat_id")*1;
                    let qid = $(this).closest(".line").attr("qid")*1;
                    if (qid)
                    {
                        $(this).attr("is_on", is_on); // toggle param visually
                        $new_qz.temp_struct[$new_qz.qb_adapt_id].q_list[qid].cats[cat_id].is_on = is_on;
                        qb_adapt_mark_as_unsaved();
                    }
                });

            // WEIGHT of COMP
            $(".comp_wg input")
                .off("mouseenter")
                .off("mouseleave")
                .mouseenter(function(){

                    floater_hint("show",{
                        head: "Вес (множитель) компетенции.",
                        tx: "Нажмите левой кнопкой мыши по этому полю, удерживая клавишу <span style='font-weight: bold'>Shift</span>, " +
                            "чтобы копировать данный вес во все подлежащие поля индикаторов.",
                        w: 400,
                        dx: 40,
                        dy: -40,
                    });
                })
                .mouseleave(function(){floater_hint("remove")})
                .off("change")
                .change(function (e) {
                    // Constraint value to 0-1 (we allow zero only cuz typing dot will floor it down to zero in an instant)
                    let weight = qb_adapt_weight_constraint($(this).val()); // toggle 0-1 values
                    $(this).val(weight);
                    let comp_id = $(this).closest(".line[type='comp']").attr("comp_id")*1;
                    $new_qz.temp_struct[$new_qz.qb_adapt_id].c_list[comp_id].wg = weight;
                    qb_adapt_mark_as_unsaved()
                })
                .off("click")
                .click(function (e) {
                    // LMB + Shift is held down
                    //console.log("e.which " + e.which +" is_down[16] " + $keyboard.is_down.indexOf(16));
                    if (e.which === 1 && $keyboard.is_down.indexOf(16) !== -1)
                    {
                        let comp_id = $(this).closest(".line").attr("comp_id") * 1;
                        let weight = qb_adapt_weight_constraint($(this).val()); // toggle 0-1 values
                        // Assign it to every sibling qst's weight field
                        $(".line[type='qst'][comp_id='"+comp_id+"'] .qst_wg input").each(function () {
                            let qid = $(this).closest(".line").attr("qid")*1;
                            $(this).val(weight);
                            $new_qz.temp_struct[$new_qz.qb_adapt_id].q_list[qid].wg = weight;
                        });
                        qb_adapt_mark_as_unsaved();
                    }

                });

            // TARGVAL of COMP
            $(".comp_targ input")
                .off("change")
                .change(function (e) {
                    // Constraint value to 0-1 (we allow zero only cuz typing dot will floor it down to zero in an instant)
                    let targ_value = qb_adapt_targ_val_constraint($(this).val()); // toggle 0-1 values
                    $(this).val(targ_value);
                    let comp_id = $(this).closest(".line[type='comp']").attr("comp_id")*1;
                    $new_qz.temp_struct[$new_qz.qb_adapt_id].c_list[comp_id].targ_avg = targ_value;
                    qb_adapt_mark_as_unsaved();
                });

            // WEIGHT of QST
            $(".qst_wg input")
                .off("change")
                .change(function (e) {
                    // Constraint value to 0-1 (we allow zero only cuz typing dot will floor it down to zero in an instant)
                    let weight = qb_adapt_weight_constraint($(this).val()); // toggle 0-1 values
                    $(this).val(weight);
                    let qid = $(this).closest(".line").attr("qid")*1;
                    $new_qz.temp_struct[$new_qz.qb_adapt_id].q_list[qid].wg = weight;
                    qb_adapt_mark_as_unsaved();
                });

            // TARGVAL of QST
            $(".qst_targ input")
                .off("change")
                .change(function (e) {
                    // Constraint value to 0-1 (we allow zero only cuz typing dot will floor it down to zero in an instant)
                    let targ_value = qb_adapt_targ_val_constraint($(this).val()); // toggle 0-1 values
                    $(this).val(targ_value);
                    let qid = $(this).closest(".line").attr("qid")*1;
                    $new_qz.temp_struct[$new_qz.qb_adapt_id].q_list[qid].targ = targ_value;
                    qb_adapt_mark_as_unsaved();
                });


            $(".qb_adapt_box  .line[type='comp'] .switch")
                .off("mouseleave")
                .mouseleave(function(){floater_hint("remove")})
                .off("mouseenter")
                .mouseenter(function(){
                    floater_hint("show",{
                        head: "Вкл./выкд. вопроса для категории",
                        tx: "Групповое переключение наличия вопроса для респондентов этой категории/роли.",
                        w: 300,
                        dx: -150,
                        dy: 20
                    });
                })
                .off("click")
                .click(function () {
                    let is_on = Math.abs($(this).attr("is_on")*1 - 1); // toggle 0-1 values
                    let cat_id = $(this).attr("cat_id");
                    let comp_id = $(this).closest(".line").attr("comp_id");
                    $(this).attr("is_on", is_on);

                    $(".qb_adapt_box .line[type='qst'][comp_id='"+comp_id+"']").each(function () {
                        let qid = $(this).attr("qid") * 1;
                        $(this).find(".cat_slot[cat_id='"+ cat_id +"'] .switch").each(function () {
                            $(this).attr("is_on", is_on);
                            $new_qz.temp_struct[$new_qz.qb_adapt_id].q_list[qid].cats[cat_id].is_on = is_on;
                        });
                    });
                    qb_adapt_mark_as_unsaved();
                });
        }
        else
        {
            let qb = $ad.qbooks[$new_qz.qb_adapt_ord];
            //let struct = qb.struct; //$new_qz.temp_struct[qb.id];
            let struct = $new_qz.temp_struct[qb.id]; // unsaved qbook structure


            s += "<tr class='line' type='title'>" +
                    "<td colspan='7'>" +
                        "<span class='label'>опросник</span> "+
                        qb.name +
                        "<span class='qb_save' is_saved='"+ struct.is_saved +"'></span>" +
                    "</td>" +
                "</tr>";
            s += "<tr class='line' type='head'>" +
                "<td>Компетенции<br>и индикаторы</td>" +
                "<td>Вес</td>" +
                "<td>Проходной<br>балл</td>" +
                "<td>Самооценка</td>" +
                "<td>Руководители</td>" +
                "<td>Коллеги</td>" +
                "<td>Подчиненные</td>" +
                "</tr>";

            let comp_id_list = get_comp_id_list_from_qst_list(qb.list);
            let log_pushed = false;

            for (let k=0; k<comp_id_list.length; k++)

            comp_id_list.forEach(function (v_comp_id) {
                if (null === struct.c_list[v_comp_id])
                {
                    let cmp = get_comp_ord_from_comp_id(v_comp_id);

                    struct.c_list[v_comp_id] = qb_adapt_bld_comp_structure();
                    console.log("ошибка: компетенциz ["+v_comp_id+"] " + cmp.name + " не имелf слота в c_list, восполнено");
                }

                s += qb_adapt_line_comp(struct.c_list[v_comp_id], v_comp_id); // add COMP line to the table

                // Find every qst related to this competention
                qb.list.forEach(function (v_qid) {
                    let q_ord = get_qst_ord_from_qst_id(v_qid);
                    if (null !== q_ord && $ad.qsts[q_ord].comp_id === v_comp_id) // qst belongs to this competention id
                    {
                        if (null === struct.q_list[v_qid])
                        {
                            let qtx = $ad.qsts[q_ord].tx;

                            console.log("ошибка: вопрос ["+v_qid+"] ->" + qtx + " // не имел слота в q_list, восполнено");
                            if (!log_pushed)
                            {
                                log_pushed = true;
                                let list = "";
                                let exs_qid = "";
                                let exs_slots = "";
                                qb.list.forEach(function (q) {
                                    if (!list)
                                        list += q;
                                    else
                                        list += "," + q;

                                    if (!struct.q_list.hasOwnProperty(q))
                                    {
                                        if (!exs_qid)
                                            exs_qid += q;
                                        else
                                            exs_qid += "," + q;
                                    }
                                });
                                console.log("список опросника: " + list);
                                list = "";
                                Object.keys(struct.q_list).map(function (key) {
                                    if (null !== struct.q_list[key])
                                    {
                                        if (!list)
                                            list += key;
                                        else
                                            list += "," + key;

                                        if (qb.list.indexOf(key*1) === -1)
                                        {
                                            if (!exs_slots)
                                                exs_slots += key;
                                            else
                                                exs_slots += "," + key;
                                        }
                                    }

                                });

                                if (!exs_qid) exs_qid = "нет";
                                if (!exs_slots) exs_slots = "нет";
                                console.log("список слотов: " + list);
                                console.log("лишние слоты: " + exs_slots);
                                console.log("лишние вопросы: " + exs_qid);
                            }

                            struct.q_list[v_qid] = qb_adapt_bld_qst_structure(v_qid);
                        }
                        s += qb_adapt_line_qst(struct.q_list[v_qid], v_qid, v_comp_id); // add QST line to the table
                    }
                });
            });

            if (action === "get_html")
                return s;
            else
            if (action === "update_self")
            {
                $(".qb_adapt_box")
                    .empty()
                    .css("display","table")
                    .append(s);
                qb_adapt("add_events");

            }
        }
    }
    else
        return s;
}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_update_structure(qb_ord) {
    let qb = $ad.qbooks[qb_ord];
    console.log("qb_adapt_update_structure");

    if (qb)
    {
        if (!qb.struct)
        {
            if (!$new_qz.temp_struct.hasOwnProperty(qb.id) || null === $new_qz.temp_struct[qb.id])
                $new_qz.temp_struct[qb.id] = {
                    c_list: {},
                    q_list : {},
                    calc_mode: "avg",
                    is_saved: 0 // util var that show if qb info was save after a last change
                };
        }
        else
            $new_qz.temp_struct[qb.id] = duplicate(qb.struct); // replicate current structure object to temp list we about to modify
        let struct = $new_qz.temp_struct[qb.id]; // new potential structure


        let new_list = $new_qz.qst_list;
        let new_qid_list = [];
        new_list.forEach(function (v_qslot) {
            new_qid_list.push(v_qslot.id);
        });

        // ## REMOVAL CLEANUP
            // 1) Remove all absent qsts data:
            let old_comp_id_list = [];
            // get a list of unique comp_id's
            $new_qz.qst_list.forEach(function (v_qst_slot) {
                let comp_id = v_qst_slot.comp_id;
                if (old_comp_id_list.indexOf(comp_id) === -1)
                    old_comp_id_list.push(comp_id);
            });
            // now remove all non-existen comp_slots from struct
            Object.keys(struct.c_list).map(function (key, ord) {
                // key here is comp_id
                let comp_id = key*1;
                if (old_comp_id_list.indexOf(comp_id) === -1)
                    delete struct.c_list[comp_id]; // = null;
            });
            // same for qst id's
            Object.keys(struct.q_list).map(function (key, ord) {
                // key here is comp_id
                let qid = key*1;
                if (new_qid_list.indexOf(qid) === -1)
                    delete struct.q_list[qid]; // = null;
            });

        // ## ADDITION OF NEW ONES
            new_list.forEach(function (v_qst) {
                let qid = v_qst.id;
                let comp_id = get_cid_from_qst(qid);
                //console.log("comp_id " + comp_id);
                //let qst_ord = get_qst_ord_from_qst_id(v_qid);
                //let comp_ord = get_comp_ord_from_comp_id(comp_id);

                // Add slots for new/absent COMP
                if (!struct.c_list.hasOwnProperty(comp_id))
                {
                    struct.c_list[comp_id] = qb_adapt_bld_comp_structure();
                    struct.is_saved = 0; // new element - mark qb adaptive structure as unsaved
                    //console.log("new comp_id slot " + comp_id);
                }

                // Add slots for new/absent QST
                if (!struct.q_list.hasOwnProperty(qid))
                {
                    struct.q_list[qid] = qb_adapt_bld_qst_structure(qid);
                    struct.is_saved = 0; // new element - mark qb adaptive structure as unsaved
                }
            });

        //qb.list = duplicate(new_qid_list);

        //qb_adapt_clean_removed_elements(qb);
    }
}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_bld_qst_structure(qid) {
    let slot = {
        wg: 1,
        targ: null,
        cats: []
    };
    //console.log("new qst slot " + qid);

    // Fill cats obj with a default template for roles/categories
    let cat_id_list = [0,4,3,5]; // self, boss, colleague, employee
    cat_id_list.forEach(function (cat_id) {
        slot.cats[cat_id] = {
            tx: "",
            is_on: 1
        };
    });
    return slot;
}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_bld_comp_structure() {
    return {
        wg: 1,
        targ_total: null,
        targ_avg: null
    };
}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_check_structure(qb_ord) {
    let qb = $ad.qbooks[qb_ord];
    // build valid frame of "structure" based on self questions id list
    console.log("qb_adapt_check_structure");

    if (qb)
    {
        if (!qb.struct)
        {
            if (!$new_qz.temp_struct.hasOwnProperty(qb.id) || null === $new_qz.temp_struct[qb.id])
                $new_qz.temp_struct[qb.id] = {
                    c_list: {},
                    q_list : {},
                    calc_mode: "avg",
                    is_saved: 0 // util var that show if qb info was save after a last change
                };
        }
        else
            $new_qz.temp_struct[qb.id] = duplicate(qb.struct); // replicate current structure object to temp list we about to modify
        let struct = $new_qz.temp_struct[qb.id]; // new potential structure


        let current_list = qb.list;
        let current_qid_list = [];
        current_list.forEach(function (v_qslot) {
            current_qid_list.push(v_qslot.id);
        });


        // ## ADDITION OF NEW ONES
        current_list.forEach(function (qid) {
            let comp_id = get_cid_from_qst(qid);
            //console.log("comp_id " + comp_id);

            // Add slots for new/absent COMP
            if (!struct.c_list.hasOwnProperty(comp_id))
            {
                struct.c_list[comp_id] = qb_adapt_bld_comp_structure();
                struct.is_saved = 0; // new element - mark qb adaptive structure as unsaved
                //console.log("new comp_id slot " + comp_id);
            }

            // Add slots for new/absent QST
            if (!struct.q_list.hasOwnProperty(qid))
            {
                struct.q_list[qid] = qb_adapt_bld_qst_structure(qid);
                struct.is_saved = 0; // new element - mark qb adaptive structure as unsaved
            }
        });
    }
}
//----------------------------------------------------------------------------------------------------------------------
function qb_adapt_clean_removed_elements(qb) {
    let struct = $new_qz.temp_struct[qb.id];

    // Check for deleted COMPS
    let delete_bank = [];
    if (Object.keys(struct.c_list).length)
        Object.keys(struct.c_list).map(function (key) {
            let found = false;
            for (let i=0; i<qb.list.length; i++)
            {
                let comp_id = get_cid_from_qst(qb.list[i]);
                if (comp_id*1 === key*1)
                {
                    found = true;
                    break;
                }
            }

            if (!found)
                delete_bank.push(key); // id of comp to delete later

        });

    // REMOVE all unmatched comps from c_list
    if (delete_bank.length)
        delete_bank.forEach(function (comp_id) {
            delete struct.c_list[comp_id];
        });

    // Check for deleted QSTS
    delete_bank = [];
    if (Object.keys(struct.q_list).length)
        Object.keys(struct.q_list).map(function (key) {
            let found = false;
            for (let i=0; i<qb.list.length; i++)
                if (qb.list[i] === key*1)
                {
                    found = true;
                    break;
                }
            if (!found)
                delete_bank.push(key); // id of comp to delete later
        });

    // REMOVE all unmatched qsts from q_list
    if (delete_bank.length)
        delete_bank.forEach(function (q_id) {
            delete struct.q_list[q_id];
        });
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_adapt_screen_events()
{
    $(".qst_box").removeAttr('onselectstart');
    qb_adapt("add_events");

    $(".qbooks_adapt_wnd .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {
                case "back":
                    $new_qz.qst_screen_id = 1; // go to standart template screen
                    show_content("qst");
                    break;

                case "next":
                    let qb_is_saved = $(".line[type=title] .qb_save").attr("is_saved") * 1;
                    if (undefined !== qb_is_saved && !qb_is_saved)
                    {
                        message_ex("show","confirm","direct_full",{
                            head: "Обнаружены не сохраненные изменения опросника",
                            tx: "Нажмите \"Подтвердить\" если Вы хотите продолжить <b>без сохранения изменений</b>.<br>" +
                            "В противном случае нажмите \"Отмена\" и сохраните данные нажав на кнопку <div class='icon' qb_save></div> возле названия опросника." +
                            "<br>Когда данные сохранятся, эта иконка станет серой."}, "qb_adapt_save_skip")
                    }
                    else
                    {
                        $new_qz.qst_screen_id = 5; // go to answer options
                        show_content("qst");
                    }
                    break;
            }
        });

}

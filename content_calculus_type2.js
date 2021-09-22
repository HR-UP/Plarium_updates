//   -------------------------------------------------------------------------------------------------------------------
function report2_comps_summ(qz_ord, batch_ord, targ_qz_id) {
    let qz = $ad.qzs[qz_ord];
    let group = qz.resps[batch_ord];
    let resp_answers = []; // id of resp - qnt of answers present

    let qb = qz.settings.comm_groups[batch_ord].qb_id; // this is id
    qb = get_qb_ord_from_qb_id(qb); // this is ord
    qb = $ad.qbooks[qb]; // this is actuall qbook
    let qst_id_list = qb.list;
    let struct = qb.struct;
    let qb_next, struct_next;


    let res = {
        summ: 0,
        div: 0,
        comp_list: [],
        gate: 0,
        gate_next: null
    };

    let qb_next_match = true, qb_valid = true, qb_next_valid = true;
/*
    Object.keys(struct.c_list).map(function(k) { // COMPETENTION
        if (null !== struct.c_list[k] && (!struct.c_list[k].hasOwnProperty("targ_avg") || null === struct.c_list[k].targ_avg))
            qb_valid = false;
    });
    */
    if (targ_qz_id)
    {
        qb_next = get_qb_ord_from_qb_id(targ_qz_id); // this is ord
        qb_next = $ad.qbooks[qb_next]; // this is actuall qbook
        struct_next = qb_next.struct;

        Object.keys(struct_next.c_list).map(function(k) { // COMPETENTION
            if (!struct.c_list.hasOwnProperty(k))
                qb_next_match = false;

            if (!struct_next.c_list[k].hasOwnProperty("targ_avg") || null === struct_next.c_list[k].targ_avg)
                qb_next_valid = false;
        });
    }

    // Validity check
    /*
    if (!qb_next_match)
    {
        message_ex("show","info","direct","У текущего опросника, и у опросника выбранного в качестве целеполагания не соответствует наличие компетенций.");
        return;
    }
    else
    if (!qb_next_valid)
    {
        message_ex("show","info","direct","У опросника выбранного в качестве целеполагания не проставлены все проходные баллы в компетенциях.");
        return;
    }
    else
    if (!qb_valid)
    {
        message_ex("show","info","direct","У текущего опросника не проставлены все проходные баллы в компетенциях.");
        return;
    }
    */

    let cid_list = get_comp_id_list_from_qst_list(qst_id_list);
    cid_list.forEach(function (v_cid) {
        res.gate += struct.c_list[v_cid].targ_avg; // The gate value for the current spec

        let comp_slot = {
            summ: 0,
            div: 0,
            id: v_cid * 1,
            cat_list: {},
            wg: struct.c_list[v_cid].wg,
            targ_avg: struct.c_list[v_cid].targ_avg,
            targ_next: null
        };

        if (targ_qz_id)
            comp_slot.targ_next = struct_next.c_list[comp_slot.id].targ_avg;

        $cats_list_template.forEach(function (v_cat_id) { // CAT
            let cat_slot = {
                summ: 0,
                div: 0,
                id: v_cat_id,
                q_list: [],
                resp_id_list: [],
                valid_q_qnt: 0
            };

            qst_id_list.forEach(function (v_qid, i_qid) { // QST
                let qst_ord = get_qst_ord_from_qst_id(v_qid);
                if ($ad.qsts[qst_ord].comp_id === comp_slot.id) // related competention
                {
                    let qst_slot = {
                        summ_wg: 0,
                        summ: 0,
                        div: 0,
                        id: v_qid,
                        //tx: "",
                        wg: struct.q_list[v_qid].wg,
                        resp_list: [],
                        resp_id_list: [],
                        resp_wg_list: []
                    };
                    //qst_slot.tx = $ad.qsts[q_ord].tx;

                    group.forEach(function (v_resp) { // RESP
                        if (!resp_answers.hasOwnProperty(v_resp.id))
                            resp_answers[v_resp.id] = 0; // make the slot that count answers of each resp on any qst

                        // Resp had this qst
                        if (v_resp.cat_id === v_cat_id && !v_resp.ignore) // cat match

                        {
                            if (cat_slot.resp_id_list.indexOf(v_resp.id) === -1)
                                cat_slot.resp_id_list.push(v_resp.id);

                            if (struct.q_list[v_qid].cats[v_cat_id].is_on && // qst is on for this category
                                calculus_ans_is_valid(v_resp.ans_list[i_qid]) &&
                                undefined !== v_resp.ans_list[i_qid])
                            {
                                qst_slot.summ += v_resp.ans_list[i_qid];
                                qst_slot.div++;

                                qst_slot.resp_list.push(v_resp.ans_list[i_qid]);
                                qst_slot.resp_wg_list.push(v_resp.ans_list[i_qid] * qst_slot.wg);

                                qst_slot.resp_id_list.push(v_resp.id);
                                resp_answers[v_resp.id]++;
                            }
                            else
                            {
                                qst_slot.resp_list.push("");
                                qst_slot.resp_wg_list.push("");
                                qst_slot.resp_id_list.push(v_resp.id);
                            }
                        }
                    });

                    // Get avg
                    if (qst_slot.div)
                        qst_slot.summ_wg = math_floor((qst_slot.summ / qst_slot.div) * qst_slot.wg, 2);
                    //qst_slot.summ_wg = qst_slot.summ * qst_slot.wg;
                    cat_slot.q_list.push(qst_slot);
                    cat_slot.summ += qst_slot.summ_wg;

                    if (qst_slot.div)
                        cat_slot.div++;
                }
            });

            //if (cat_slot.div)
            //    cat_slot.summ /= cat_slot.div;

            comp_slot.cat_list[v_cat_id] = cat_slot;

            if (v_cat_id) // exclude self
            {
                comp_slot.summ += cat_slot.summ;
                comp_slot.div++;
            }

        });

        //if (comp_slot.div)
        //    comp_slot.summ /= comp_slot.div;
        res.comp_list.push(comp_slot);
        res.summ += comp_slot.summ;
        res.div++;
    });
    /*
        Object.keys(struct.c_list).map(function(k) { // COMPETENTION

        });
        */
    //if (res.div)
    //    res.summ /= res.div;

    // BUILD TABLE
    // HEAD
    let head = "<tr>";
    let head_elems = [
        "Вес индикатора",
        "самооценка: сумма баллов по компетенции с учетом веса",
        "средняя по индикатору умнож на вес",
        "руководители: сумма баллов по компетенции с учетом веса",
        "средняя по индикатору умнож на вес",
        "коллеги: сумма баллов по компетенции с учетом веса",
        "средняя по индикатору умнож на вес",
        "подчиненные: сумма баллов по компетенции с учетом веса",
        "средняя по индикатору умнож на вес",
        "смежная команда: сумма баллов по компетенции с учетом веса",
        "средняя по индикатору умнож на вес",

        "Балл по компетенции по всем группам респ, исключ. самооценку",
        "проходной балл компетенции выбранной должности",
        "Соответсвие выбранной должности в %"
    ];

    if (targ_qz_id)
    {
        head_elems.push("целевой уровень следующей должности");
        head_elems.push("Соответсвие следующей должности в %");
    }

    let cat_col_spans = {
        0: 1,
        4: res.comp_list[0].cat_list[4].resp_id_list.length,
        3: res.comp_list[0].cat_list[3].resp_id_list.length,
        5: res.comp_list[0].cat_list[5].resp_id_list.length,
        1: res.comp_list[0].cat_list[1].resp_id_list.length,
    };

    // by each cat_group decide by how many columns we need to shorten the table
    if (!shrink_is_on)
        resp_answers = {};
    let sub_empty_cols = calc_empty_cat_columns({3:0,4:0,5:0,1:0}, group, resp_answers, cat_col_spans);
    [3,4,5,1].forEach(function (id) {
        cat_col_spans[id] -= sub_empty_cols[id];
        //if (cat_col_spans[id] < 1)
        //    cat_col_spans[id] = 1;
    });
    console.log("cat_col_spans ", cat_col_spans);

    head += "<td></td>";
    head += "<td>"+ head_elems[0] +"</td>";

    head += "<td class='line_comp'>"+ head_elems[1] +"</td>"; // SELF
    head += "<td>"+ head_elems[2] +"</td>";

    if (cat_col_spans[4])
    {
        head += "<td class='line_comp' colspan='"+ cat_col_spans[4] +"'>"+ head_elems[3] +"</td>"; // BOSS
        head += "<td>"+ head_elems[4] +"</td>";
    }

    if (cat_col_spans[3])
    {
        head += "<td class='line_comp' colspan='"+ cat_col_spans[3] +"'>"+ head_elems[5] +"</td>"; // COLLEAGUE
        head += "<td>"+ head_elems[6] +"</td>";
    }

    if (cat_col_spans[5])
    {
        head += "<td class='line_comp' colspan='"+ cat_col_spans[5] +"'>"+ head_elems[7] +"</td>"; // SLAVES
        head += "<td>"+ head_elems[8] +"</td>";
    }

    if (cat_col_spans[1])
    {
        head += "<td class='line_comp' colspan='"+ cat_col_spans[1] +"'>"+ head_elems[9] +"</td>"; // MERGERS
        head += "<td>"+ head_elems[10] +"</td>";
    }

    head += "<td>"+ head_elems[11] +"</td>";
    head += "<td>"+ head_elems[12] +"</td>";
    head += "<td>"+ head_elems[13] +"</td>";

    if (targ_qz_id)
    {
        head += "<td>"+ head_elems[14] +"</td>";
        head += "<td>"+ head_elems[15] +"</td>";
    }
    head += "</tr>";

    let avg_pass_pct = {summ:0, div: 0}, avg_next_pass_pct = {summ:0, div: 0};
    let body = "";
    let rowspan = 1 + Object.keys(struct.c_list).length + Object.keys(struct.q_list).length;

    res.comp_list.forEach(function (v_comp) {
        // ---   COMP LINE   ---
        let line = "<tr class='line_comp'>";
        let com_ord = get_comp_ord_from_comp_id(v_comp.id);
        let comp_name = $ad.comps[com_ord].name;

        // COMPENTION LINE   ------------------------------------------------- + + +
        line += "<td>Компетенция: <b>"+ comp_name +"</b></td>";
        line += "<td></td>";

        $cats_list_template.forEach(function (v_cat_id) {
            if (cat_col_spans[v_cat_id]) // there is resps in that category
            {
                let cat_slot = v_comp.cat_list[v_cat_id];
                let val = "";
                if (cat_slot.div)
                    val = cat_slot.summ;

                let new_colspan = cat_slot.resp_id_list.length;
                if (v_cat_id)
                    new_colspan -= sub_empty_cols[v_cat_id];
                line += "<td colspan='"+ new_colspan +"'>"+ val +"</td>";
                line += "<td> </td>";
            }
        });

        // RESULTING COMP GRADE ----------->
        let q_qnt = 0; // calc qst qnt of this competention
        qst_id_list.forEach(function (v_qid) {
            let q_ord = get_qst_ord_from_qst_id(v_qid);
            if ($ad.qsts[q_ord].comp_id === v_comp.id)
                q_qnt++;
        });
        rowspan = 1 + q_qnt;

        line += "<td white rowspan='"+ rowspan +"'>"+ calculus_colorize_pct(v_comp.summ, calculus_get_pct(v_comp.summ / v_comp.targ_avg)) +"</td>";
        line += "<td white rowspan='"+ rowspan +"'>"+ v_comp.targ_avg +"</td>";

        let pct = calculus_get_pct(math_floor(v_comp.summ / v_comp.targ_avg, 2));
        if (pct)
        {
            avg_pass_pct.summ += pct;
            avg_pass_pct.div++;
        }
        line += "<td white rowspan='"+ rowspan +"'>"+ calculus_colorize_pct(pct + "%", pct) +"</td>";

        if (targ_qz_id)
        {
            //console.log("struct_next");
            //console.log(struct_next);
            //console.log("v_comp.id " + v_comp.id);
            let targ_next = struct_next.c_list[v_comp.id].targ_avg;
            line += "<td white rowspan='"+ rowspan +"'>"+ targ_next +"</td>"; // next grade

            pct = calculus_get_pct(v_comp.summ / targ_next);
            avg_next_pass_pct.summ += pct;
            avg_next_pass_pct.div++;
            line += "<td white rowspan='"+ rowspan +"'>"+ calculus_colorize_pct(pct + "%", pct) +"</td>"; // next grade %
        }
        // RESULTING COMP GRADE ----------->
        line += "</tr>";
        body += line;
        // COMPENTION LINE END   ------------------------------------------------- + + +

        // INNER INDICATOR LINES   ------------------------------------------------- + + +
        qst_id_list.forEach(function (v_qid) {

            let qst_ord = get_qst_ord_from_qst_id(v_qid);
            if ($ad.qsts[qst_ord].comp_id === v_comp.id)
            {
                line = "<tr>";
                line += "<td>"+ $ad.qsts[qst_ord].tx +"</td>"; // tx
                line += "<td>"+ struct.q_list[v_qid].wg +"</td>"; // wg

                $cats_list_template.forEach(function (v_cat_id) {
                    if (cat_col_spans[v_cat_id]) // there is resps in that category
                    {
                        let q_list = v_comp.cat_list[v_cat_id].q_list;
                        for (let q=0; q<q_list.length; q++)
                            if (q_list[q].id === v_qid)
                            {
                                let resp_list = q_list[q].resp_list;
                                let resp_id_list = q_list[q].resp_id_list;

                                if (!resp_list.length)
                                    line += "<td> </td>";
                                else
                                    resp_list.forEach(function (v_resp_val, i_resp) {
                                        let resp_id = resp_id_list[i_resp];
                                        let resp_ans_qnt = null;
                                        if (v_cat_id !== 0 &&
                                            resp_id &&
                                            resp_answers.hasOwnProperty(resp_id)
                                        )
                                            resp_ans_qnt = resp_answers[resp_id];
                                        if (null === resp_ans_qnt || resp_ans_qnt) // skip the whole column if no answers at all is present for this resp
                                            line += "<td>"+ v_resp_val +"</td>"; // value of each resp of this category for this question
                                    });

                                let v = "";
                                if (q_list[q].div)
                                    v = q_list[q].summ_wg; // show value only if any resps at all is present
                                line += "<td>"+ v +"</td>"; // avg-summ of all resps of this category for this indicator
                                break;
                            }
                    }

                });
                line += "</tr>";
                body += line;
            }

        });
    });

    let global_colspan = 2 + 4;
    let resp_w = cat_col_spans[0] + cat_col_spans[3] + cat_col_spans[4] + cat_col_spans[5] + cat_col_spans[1]; // columns qnt for all the resp results
    if (resp_w < 4)
        global_colspan += 4;
    else
        global_colspan += resp_w;

    let line = "<tr>";
    line += "<td colspan='"+ global_colspan +"' style='text-align: center; background-color: #fff6ed;'>Средний % соответствия по всем компетенциям</td>";
    if (!avg_pass_pct.div)
        avg_pass_pct.div = 1;
    let pct = Math.floor(avg_pass_pct.summ / avg_pass_pct.div);
    line += "<td> </td>";
    line += "<td> </td>";
    line += "<td style='background-color: #fff6ed;'>"+ calculus_colorize_pct(pct + "%", pct) +"</td>";
    if (targ_qz_id)
    {
        pct = Math.floor(avg_next_pass_pct.summ / avg_next_pass_pct.div);
        line += "<td> </td>";
        line += "<td style='background-color: #fff6ed;'>"+ calculus_colorize_pct(pct + "%", pct) +"</td>";
    }
    line += "</tr>";
    body += line;

    if (!block_calculus_update) {
        let t = "<table class='calculus' type='2'>" +
            head +
            body +
            "</table>";
        $(".calculus").remove();
        $(".calculus_wnd").append(t);
    }

    return res;
}



//   -------------------------------------------------------------------------------------------------------------------
function report2_comps_summ_resp(qz_ord, batch_ord, targ_qz_id) {
    let qz = $ad.qzs[qz_ord];
    let group = qz.resps[batch_ord];

    let qb = qz.settings.comm_groups[batch_ord].qb_id; // this is id
    qb = get_qb_ord_from_qb_id(qb); // this is ord
    qb = $ad.qbooks[qb]; // this is actuall qbook
    let qst_id_list = qb.list;
    let struct = qb.struct;
    let qb_next, struct_next;


    let res = {
        summ: 0,
        div: 0,
        comp_list: [],
        gate: 0,
        gate_next: null
    };

    let qb_next_match = true, qb_valid = true, qb_next_valid = true;
    /*
    Object.keys(struct.c_list).map(function(k) { // COMPETENTION
        if (null !== struct.c_list[k] && (!struct.c_list[k].hasOwnProperty("targ_avg") || null === struct.c_list[k].targ_avg))
            qb_valid = false;
    });
    */
    if (targ_qz_id)
    {
        qb_next = get_qb_ord_from_qb_id(targ_qz_id); // this is ord
        qb_next = $ad.qbooks[qb_next]; // this is actuall qbook
        struct_next = qb_next.struct;

        Object.keys(struct_next.c_list).map(function(k) { // COMPETENTION
            if (!struct.c_list.hasOwnProperty(k))
                qb_next_match = false;

            if (!struct_next.c_list[k].hasOwnProperty("targ_avg") || null === struct_next.c_list[k].targ_avg)
                qb_next_valid = false;
        });
    }

    // Validity check
    /*
    if (!qb_next_match)
    {
        message_ex("show","info","direct","У текущего опросника, и у опросника выбранного в качестве целеполагания не соответствует наличие компетенций.");
        return;
    }
    else
    if (!qb_next_valid)
    {
        message_ex("show","info","direct","У опросника выбранного в качестве целеполагания не проставлены все проходные баллы в компетенциях.");
        return;
    }
    else
    if (!qb_valid)
    {
        message_ex("show","info","direct","У текущего опросника не проставлены все проходные баллы в компетенциях.");
        return;
    }
    */

    let cid_list = get_comp_id_list_from_qst_list(qst_id_list);
    cid_list.forEach(function (v_cid) {
        res.gate += struct.c_list[v_cid].targ_avg; // The gate value for the current spec

        let comp_slot = {
            summ: 0,
            div: 0,
            id: v_cid * 1,
            cat_list: {},
            wg: struct.c_list[v_cid].wg,
            targ_avg: struct.c_list[v_cid].targ_avg,
            targ_next: null
        };

        if (targ_qz_id)
            comp_slot.targ_next = struct_next.c_list[comp_slot.id].targ_avg;

        $cats_list_template.forEach(function (v_cat_id) { // CAT
            let cat_slot = {
                summ: 0,
                div: 0,
                id: v_cat_id,
                q_list: [],
                resp_id_list: [],
                valid_q_qnt: 0
            };

            qst_id_list.forEach(function (v_qid, i_qid) { // QST
                let qst_ord = get_qst_ord_from_qst_id(v_qid);
                if ($ad.qsts[qst_ord].comp_id === comp_slot.id) // related competention
                {
                    let qst_slot = {
                        summ_wg: 0,
                        summ: 0,
                        div: 0,
                        id: v_qid,
                        //tx: "",
                        wg: struct.q_list[v_qid].wg,
                        resp_list: [],
                        resp_wg_list: []
                    };
                    //qst_slot.tx = $ad.qsts[q_ord].tx;

                    group.forEach(function (v_resp) { // RESP
                        // Resp had this qst
                        if (v_resp.cat_id === v_cat_id && !v_resp.ignore) // cat match

                        {
                            if (cat_slot.resp_id_list.indexOf(v_resp.id) === -1)
                                cat_slot.resp_id_list.push(v_resp.id);

                            if (struct.q_list[v_qid].cats[v_cat_id].is_on && // qst is on for this category
                                calculus_ans_is_valid(v_resp.ans_list[i_qid]) &&
                                undefined !== v_resp.ans_list[i_qid])
                            {
                                qst_slot.summ += v_resp.ans_list[i_qid];
                                qst_slot.div++;

                                qst_slot.resp_list.push(v_resp.ans_list[i_qid]);
                                qst_slot.resp_wg_list.push(v_resp.ans_list[i_qid] * qst_slot.wg);
                            }
                            else
                            {
                                qst_slot.resp_list.push("");
                                qst_slot.resp_wg_list.push("");
                            }
                        }
                    });

                    // Get avg
                    if (qst_slot.div)
                        qst_slot.summ_wg = math_floor((qst_slot.summ / qst_slot.div) * qst_slot.wg, 2);
                    //qst_slot.summ_wg = qst_slot.summ * qst_slot.wg;
                    cat_slot.q_list.push(qst_slot);
                    cat_slot.summ += qst_slot.summ_wg;

                    if (qst_slot.div)
                        cat_slot.div++;
                }
            });

            //if (cat_slot.div)
            //    cat_slot.summ /= cat_slot.div;

            comp_slot.cat_list[v_cat_id] = cat_slot;

            if (v_cat_id) // exclude self
            {
                comp_slot.summ += cat_slot.summ;
                comp_slot.div++;
            }

        });

        //if (comp_slot.div)
        //    comp_slot.summ /= comp_slot.div;
        res.comp_list.push(comp_slot);
        res.summ += comp_slot.summ;
        res.div++;
    });


    // BUILD TABLE
    // HEAD
    let head = "<tr>";
    let head_elems = [

        "самооценка: сумма баллов по компетенции с учетом веса",
        "руководители: сумма баллов по компетенции с учетом веса",
        "коллеги: сумма баллов по компетенции с учетом веса",
        "подчиненные: сумма баллов по компетенции с учетом веса",
        "смежная команда: сумма баллов по компетенции с учетом веса",

        "Балл по компетенции по всем группам респ, исключ. самооценку",
        "проходной балл компетенции выбранной должности",
        "Соответсвие выбранной должности в %"
    ];

    if (targ_qz_id)
    {
        head_elems.push("целевой уровень следующей должности");
        head_elems.push("Соответсвие следующей должности в %");
    }

    let cat_col_spans = {
        0: 1,
        4: res.comp_list[0].cat_list[4].resp_id_list.length,
        3: res.comp_list[0].cat_list[3].resp_id_list.length,
        5: res.comp_list[0].cat_list[5].resp_id_list.length,
        1: res.comp_list[0].cat_list[1].resp_id_list.length,
    };

    head += "<td></td>";

    head += "<td>"+ head_elems[0] +"</td>"; // SELF

    if (cat_col_spans[4])
        head += "<td>"+ head_elems[1] +"</td>"; // BOSS
    if (cat_col_spans[3])
        head += "<td>"+ head_elems[2] +"</td>"; // COLLEAGUE
    if (cat_col_spans[5])
        head += "<td>"+ head_elems[3] +"</td>"; // SLAVES
    if (cat_col_spans[1])
        head += "<td>"+ head_elems[4] +"</td>"; // MERGES

    head += "<td>"+ head_elems[5] +"</td>";
    head += "<td>"+ head_elems[6] +"</td>";
    head += "<td>"+ head_elems[7] +"</td>";

    if (targ_qz_id)
    {
        head += "<td>"+ head_elems[8] +"</td>";
        head += "<td>"+ head_elems[9] +"</td>";
    }
    head += "</tr>";

    let avg_pass_pct = {summ:0, div: 0}, avg_next_pass_pct = {summ:0, div: 0};
    let body = "";
    let rowspan = 1 + Object.keys(struct.c_list).length;

    res.comp_list.forEach(function (v_comp) {
        // ---   COMP LINE   ---
        let line = "<tr>";
        let com_ord = get_comp_ord_from_comp_id(v_comp.id);
        let comp_name = $ad.comps[com_ord].name;

        // COMPENTION LINE   ------------------------------------------------- + + +
        line += "<td class='line_comp'>Компетенция: <b>"+ comp_name +"</b></td>";

        $cats_list_template.forEach(function (v_cat_id) {
            let cat_slot = v_comp.cat_list[v_cat_id];
            let val = "";
            if (cat_slot.div)
                val = cat_slot.summ;

            line += "<td>"+ val +"</td>";
        });

        // RESULTING COMP GRADE ----------->
        rowspan = 1;
        line += "<td white rowspan='"+ rowspan +"'>"+ calculus_colorize_pct(v_comp.summ, calculus_get_pct(v_comp.summ / v_comp.targ_avg)) +"</td>";
        line += "<td white rowspan='"+ rowspan +"'>"+ v_comp.targ_avg +"</td>";

        let pct = calculus_get_pct(v_comp.summ / v_comp.targ_avg);
        if (pct)
        {
            avg_pass_pct.summ += pct;
            avg_pass_pct.div++;
        }
        line += "<td white rowspan='"+ rowspan +"'>"+ calculus_colorize_pct(pct + "%", pct) +"</td>";

        if (targ_qz_id)
        {
            let targ_next = struct_next.c_list[v_comp.id].targ_avg;
            line += "<td white rowspan='"+ rowspan +"'>"+ targ_next +"</td>"; // next grade

            pct = calculus_get_pct(math_floor(v_comp.summ / targ_next, 2));
            avg_next_pass_pct.summ += pct;
            avg_next_pass_pct.div++;
            line += "<td white rowspan='"+ rowspan +"'>"+ calculus_colorize_pct(pct + "%", pct) +"</td>"; // next grade %
        }
        // RESULTING COMP GRADE ----------->
        line += "</tr>";
        body += line;
        // COMPENTION LINE END   ------------------------------------------------- + + +
    });

    let global_colspan = 1 + 4;
    let line = "<tr>";
    line += "<td colspan='"+ global_colspan +"' style='text-align: center; background-color: #fff6ed;'>Средний % соответствия по всем компетенциям</td>";
    if (!avg_pass_pct.div)
        avg_pass_pct.div = 1;
    let pct = Math.floor(avg_pass_pct.summ / avg_pass_pct.div);
    line += "<td> </td>";
    line += "<td> </td>";
    line += "<td style='background-color: #fff6ed;'>"+ calculus_colorize_pct(pct + "%", pct) +"</td>";
    if (targ_qz_id)
    {
        pct = Math.floor(avg_next_pass_pct.summ / avg_next_pass_pct.div);
        line += "<td> </td>";
        line += "<td style='background-color: #fff6ed;'>"+ calculus_colorize_pct(pct + "%", pct) +"</td>";
    }
    line += "</tr>";
    body += line;

    if (!block_calculus_update) {
        let t = "<table class='calculus' type='2' resp>" +
            head +
            body +
            "</table>";
        $(".calculus").remove();
        $(".calculus_wnd").append(t);
    }

    return res;
}
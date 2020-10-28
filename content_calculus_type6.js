//   -------------------------------------------------------------------------------------------------------------------
function report6_indicator_env(qz_ord, batch_ord, targ_qz_id) {
    let qb_next, struct_next;
    let qz = $ad.qzs[qz_ord];
    let group = qz.resps[batch_ord];
    let line;
    let resp_answers = []; // id of resp - qnt of answers present

    let qb = qz.settings.comm_groups[batch_ord].qb_id; // this is id
    qb = get_qb_ord_from_qb_id(qb); // this is ord
    qb = $ad.qbooks[qb]; // this is actuall qbook
    let qst_id_list = qb.list;
    let struct = qb.struct;
    let avg_indic = {summ: 0, div: 0};
    let avg_next_indic = {summ: 0, div: 0};

    let res = {
        summ: 0,
        div: 0,
        comp_list: [],
        gate: 0,
        gate_next: null
    };

    let qb_next_match = true, qb_valid = true, qb_next_valid = true;
    Object.keys(struct.c_list).map(function(k) { // COMPETENTION
        if (null !== struct.c_list[k] && !struct.c_list[k].hasOwnProperty("targ_avg") || null === struct.c_list[k].targ_avg)
            qb_valid = false;
    });
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

        [0,4,3,5].forEach(function (v_cat_id) { // CAT
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
                        qst_slot.summ = math_floor(qst_slot.summ / qst_slot.div, 2);
                    //qst_slot.summ_wg = qst_slot.summ * qst_slot.wg;
                    cat_slot.q_list.push(qst_slot);
                    cat_slot.summ += qst_slot.summ;// qst_slot.summ_wg;

                    if (qst_slot.div)
                        cat_slot.div++;
                }
            });

            if (cat_slot.div)
                cat_slot.summ = math_floor(cat_slot.summ / cat_slot.div, 2);

            comp_slot.cat_list[v_cat_id] = cat_slot;

            if (v_cat_id && cat_slot.div) // exclude self
            {
                comp_slot.summ += cat_slot.summ;
                comp_slot.div++;
            }

        });

        if (comp_slot.div)
            comp_slot.summ = math_floor(comp_slot.summ / comp_slot.div, 2);
        res.comp_list.push(comp_slot);
        res.summ += comp_slot.summ;
        res.div++;
    });

    if (res.div)
        res.summ = math_floor(res.summ / res.div , 2);

    // BUILD TABLE
    // HEAD
    let head = "<tr>";
    let head_elems = [
        "Индикаторы",

        "Самооценка",
        "Средний балл по компетенции самооценка",

        "Подчиненные",
        "Средний балл по компетенции по группе респондентов подчиненные",

        "Коллеги",
        "Средний балл по компетенции по группе респондентов коллеги",

        "Руководители",
        "Средний балл по компетенции по группе респондентов руководители",

        "Средний балл по компетенции по всем группам респондентов кроме самооценки",
        "Проходной балл компетенции выбранной должности",
        "Соответсвие выбранной должности  в %"
    ];

    if (targ_qz_id)
    {
        head_elems.push("Целевой уровень следующей должности");
        head_elems.push("Соответсвие следующей должности в %");
    }

    let cat_col_spans = {
        0: 1,
        4: res.comp_list[0].cat_list[4].resp_id_list.length,
        3: res.comp_list[0].cat_list[3].resp_id_list.length,
        5: res.comp_list[0].cat_list[5].resp_id_list.length,
    };

    // by each cat_group decide by how many columns we need to shorten the table
    if (!shrink_is_on)
        resp_answers = {};
    let sub_empty_cols = calc_empty_cat_columns({3:0,4:0,5:0}, group, resp_answers, cat_col_spans);
    [3,4,5].forEach(function (id) {
        cat_col_spans[id] -= sub_empty_cols[id];
        if (cat_col_spans[id] < 1)
            cat_col_spans[id] = 1;
    });

    let global_colspan = 2 + 5;
    let resp_w = cat_col_spans[0] + cat_col_spans[3] +cat_col_spans[4] +cat_col_spans[5]; // columns qnt for all the resp results
    if (resp_w < 4)
        global_colspan += 4;
    else
        global_colspan += resp_w;

    head += "<td>Компетенция</td>";
    head += "<td>"+ head_elems[0] +"</td>";

    head += "<td class='line_comp'>"+ head_elems[1] +"</td>"; // SELF
    head += "<td>"+ head_elems[2] +"</td>";

    head += "<td class='line_comp' colspan='"+ cat_col_spans[5] +"'>"+ head_elems[3] +"</td>"; // BOSS
    head += "<td>"+ head_elems[4] +"</td>";

    head += "<td class='line_comp' colspan='"+ cat_col_spans[3] +"'>"+ head_elems[5] +"</td>"; // COLLEAGUE
    head += "<td>"+ head_elems[6] +"</td>";

    head += "<td class='line_comp' colspan='"+ cat_col_spans[4] +"'>"+ head_elems[7] +"</td>"; // SLAVES
    head += "<td>"+ head_elems[8] +"</td>";

    head += "<td style='background-color: #ff98a4'>"+ head_elems[9] +"</td>";
    head += "<td>"+ head_elems[10] +"</td>";
    head += "<td>"+ head_elems[11] +"</td>";

    if (targ_qz_id)
    {
        head += "<td>"+ head_elems[12] +"</td>";
        head += "<td>"+ head_elems[13] +"</td>";
    }
    head += "</tr>";

    let body = "";

    res.comp_list.forEach(function (v_comp, i_comp) {
        // ---   COMP LINE   ---
        let com_ord = get_comp_ord_from_comp_id(v_comp.id);
        let comp_name = $ad.comps[com_ord].name;
        let qst_index = 0;
        // INNER INDICATOR LINES   ------------------------------------------------- + + +
        qst_id_list.forEach(function (v_qid, i_qid) {

            let qst_ord = get_qst_ord_from_qst_id(v_qid);
            if ($ad.qsts[qst_ord].comp_id === v_comp.id)
            {
                line = "<tr>";
                if (!qst_index)
                {
                    line += "<td rowspan='"+ v_comp.cat_list[0].q_list.length +"'><b>"+ comp_name +"</b></td>"; // comp name
                }

                line += "<td style='text-align: left;'>"+ $ad.qsts[qst_ord].tx +"</td>"; // indicator's tx

                [0,5,3,4].forEach(function (v_cat_id) {
                    let cat_slot = v_comp.cat_list[v_cat_id];
                    let q_list = cat_slot.q_list;
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
                            if (cat_slot.div)
                            {
                                v = cat_slot.summ; // show value only if any resps at all is present
                            }
                            let rowspan_td = "<td rowspan='"+ q_list.length +"'";

                            if (!qst_index)
                                line += rowspan_td +" style='background-color: #fff6ed'>"+ calculus_colorize_pct(v, calculus_get_pct(v / v_comp.targ_avg)) +"</td>"; // avg-summ of all resps of this category for this indicator

                            // GRADE %
                            if (4 === v_cat_id && !qst_index)
                            {

                                //console.log("i_comp: "+i_comp+" v_comp.summ: "+ v_comp.summ);
                                line += rowspan_td +">"+ v_comp.summ +"</td>"; // avg of roles, thus comp avg
                                line += rowspan_td +">"+ v_comp.targ_avg +"</td>"; // targ avg of comp

                                let pct = calculus_get_pct(v_comp.summ / v_comp.targ_avg);
                                line += rowspan_td +">"+ calculus_colorize_pct(pct + "%", pct) + "</td>"; // targ avg of comp
                                avg_indic.summ += pct;
                                avg_indic.div++;

                                if (targ_qz_id)
                                {
                                    let targ_val = struct_next.c_list[v_comp.id].targ_avg;
                                    line += rowspan_td +">"+ targ_val +"</td>";
                                    pct = calculus_get_pct(v_comp.summ / targ_val);
                                    avg_next_indic.summ += pct;
                                    avg_next_indic.div++;
                                    line += rowspan_td +">"+ calculus_colorize_pct(pct + "%", pct) +"</td>";
                                }
                            }
                            break;
                        }
                });
                line += "</tr>";
                body += line;

                qst_index++;
            }

        });
    });

    line = "<tr>";
    line += "<td style='background-color: #fff6ed' colspan='"+ global_colspan +"'>Средний % соответствия по всем компетенциям</td>";
    line += "<td> </td>";
    line += "<td style='background-color: #fff6ed'>"+ Math.floor(avg_indic.summ / avg_indic.div) +"%</td>";
    if (targ_qz_id)
    {
        line += "<td> </td>";
        line += "<td style='background-color: #fff6ed'>"+ Math.floor(avg_next_indic.summ / avg_next_indic.div) +"%</td>";
    }
    line += "</tr>";
    body += line;

    if (!block_calculus_update) {
        let t = "<table class='calculus' type='6'>" +
            //"<td class='line_comp' colspan='"+ (1 + head_elems.length) +"'>Общая сумма баллов по всей оценке 360/  Сумма баллов всех компетенций по всем группам респондентов с учетом веса, без самооценки</td>" +
            head +
            body +
            "</table>";

        $(".calculus").remove();
        $(".calculus_wnd").append(t);
    }
    return res;
}

//   -------------------------------------------------------------------------------------------------------------------
function report6_indicator_env_resp(qz_ord, batch_ord, targ_qz_id) {
    let qb_next, struct_next;
    let qz = $ad.qzs[qz_ord];
    let group = qz.resps[batch_ord];
    let line;

    let qb = qz.settings.comm_groups[batch_ord].qb_id; // this is id
    qb = get_qb_ord_from_qb_id(qb); // this is ord
    qb = $ad.qbooks[qb]; // this is actuall qbook
    let qst_id_list = qb.list;
    let struct = qb.struct;
    let avg_indic = {summ: 0, div: 0};
    let avg_next_indic = {summ: 0, div: 0};

    let res = {
        summ: 0,
        div: 0,
        comp_list: [],
        gate: 0,
        gate_next: null
    };

    let qb_next_match = true, qb_valid = true, qb_next_valid = true;
    Object.keys(struct.c_list).map(function(k) { // COMPETENTION
        if (null !== struct.c_list[k] && (!struct.c_list[k].hasOwnProperty("targ_avg") || null === struct.c_list[k].targ_avg))
            qb_valid = false;
    });
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

        [0,4,3,5].forEach(function (v_cat_id) { // CAT
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
                        qst_slot.summ = math_floor(qst_slot.summ / qst_slot.div, 2);
                    //qst_slot.summ_wg = qst_slot.summ * qst_slot.wg;
                    cat_slot.q_list.push(qst_slot);
                    cat_slot.summ += qst_slot.summ;// qst_slot.summ_wg;

                    if (qst_slot.div)
                        cat_slot.div++;
                }
            });

            if (cat_slot.div)
                cat_slot.summ = math_floor( cat_slot.summ / cat_slot.div, 2);

            comp_slot.cat_list[v_cat_id] = cat_slot;

            if (v_cat_id && cat_slot.div) // exclude self
            {
                comp_slot.summ += cat_slot.summ;
                comp_slot.div++;
            }

        });

        if (comp_slot.div)
            comp_slot.summ = math_floor( comp_slot.summ / comp_slot.div, 2);
        res.comp_list.push(comp_slot);
        res.summ += comp_slot.summ;
        res.div++;
    });
    /*
    Object.keys(struct.c_list).map(function(k) { // COMPETENTION
        res.gate += struct.c_list[k].targ_avg; // The gate value for the current spec

        let comp_slot = {
            summ: 0,
            div: 0,
            id: k * 1,
            cat_list: {},
            wg: struct.c_list[k].wg,
            targ_avg: struct.c_list[k].targ_avg,
            targ_next: null
        };

        if (targ_qz_id)
            comp_slot.targ_next = struct_next.c_list[k*1].targ_avg;

        [0,4,3,5].forEach(function (v_cat_id) { // CAT
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
                                v_resp.ans_list[i_qid] !== -1 &&
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
                        qst_slot.summ = math_floor(qst_slot.summ / qst_slot.div, 2);
                    //qst_slot.summ_wg = qst_slot.summ * qst_slot.wg;
                    cat_slot.q_list.push(qst_slot);
                    cat_slot.summ += qst_slot.summ;// qst_slot.summ_wg;

                    if (qst_slot.div)
                        cat_slot.div++;
                }
            });

            if (cat_slot.div)
                cat_slot.summ = math_floor( cat_slot.summ / cat_slot.div, 2);

            comp_slot.cat_list[v_cat_id] = cat_slot;

            if (v_cat_id) // exclude self
            {
                comp_slot.summ += cat_slot.summ;
                comp_slot.div++;
            }

        });

        if (comp_slot.div)
            comp_slot.summ = math_floor( comp_slot.summ / comp_slot.div, 2);
        res.comp_list.push(comp_slot);
        res.summ += comp_slot.summ;
        res.div++;
    });
    */
    if (res.div)
        res.summ = math_floor( res.summ / res.div, 2);

    // BUILD TABLE
    // HEAD
    let head = "<tr>";
    let head_elems = [
        "Средний балл по компетенции самооценка",
        "Средний балл по компетенции по группе респондентов подчиненные",
        "Средний балл по компетенции по группе респондентов коллеги",
        "Средний балл по компетенции по группе респондентов руководители",

        "Средний балл по компетенции по всем группам респондентов кроме самооценки",
        "Проходной балл компетенции выбранной должности",
        "Соответсвие выбранной должности  в %"
    ];

    if (targ_qz_id)
    {
        head_elems.push("Целевой уровень следующей должности");
        head_elems.push("Соответсвие следующей должности в %");
    }

    let cat_col_spans = {
        0: 1,
        4: res.comp_list[0].cat_list[4].resp_id_list.length,
        3: res.comp_list[0].cat_list[3].resp_id_list.length,
        5: res.comp_list[0].cat_list[5].resp_id_list.length,
    };

    let global_colspan = 1 + 5;


    head += "<td class='line_comp'>Компетенция</td>";
    head += "<td class='line_comp'>"+ head_elems[0] +"</td>";
    head += "<td class='line_comp'>"+ head_elems[1] +"</td>";
    head += "<td class='line_comp'>"+ head_elems[2] +"</td>";
    head += "<td class='line_comp'>"+ head_elems[3] +"</td>";

    head += "<td>"+ head_elems[4] +"</td>";
    head += "<td>"+ head_elems[5] +"</td>";
    head += "<td>"+ head_elems[6] +"</td>";

    if (targ_qz_id)
    {
        head += "<td>"+ head_elems[7] +"</td>";
        head += "<td>"+ head_elems[8] +"</td>";
    }
    head += "</tr>";

    let body = "";

    res.comp_list.forEach(function (v_comp) {
        // ---   COMP LINE   ---
        let com_ord = get_comp_ord_from_comp_id(v_comp.id);
        let comp_name = $ad.comps[com_ord].name;
        let qst_index = 0;
        // INNER INDICATOR LINES   ------------------------------------------------- + + +
        qst_id_list.forEach(function (v_qid) {

            let qst_ord = get_qst_ord_from_qst_id(v_qid);
            if ($ad.qsts[qst_ord].comp_id === v_comp.id)
            {
                line = "<tr>";
                if (!qst_index)
                {
                    line += "<td><b>"+ comp_name +"</b></td>"; // comp name
                }

                [0,5,3,4].forEach(function (v_cat_id) {
                    let cat_slot = v_comp.cat_list[v_cat_id];
                    let q_list = cat_slot.q_list;
                    for (let q=0; q<q_list.length; q++)
                        if (q_list[q].id === v_qid)
                        {
                            let v = "";
                            if (cat_slot.div)
                                v = cat_slot.summ; // show value only if any resps at all is present

                            if (!qst_index)
                                line += "<td>"+ calculus_colorize_pct(v, calculus_get_pct(v / v_comp.targ_avg)) +"</td>"; // avg-summ of all resps of this category for this indicator

                            // GRADE %
                            if (4 === v_cat_id && !qst_index)
                            {

                                line += "<td style='background-color: #fff6ed'>"+ v_comp.summ +"</td>"; // avg of roles, thus comp avg
                                line += "<td>"+ v_comp.targ_avg +"</td>"; // targ avg of comp

                                let pct = calculus_get_pct(v_comp.summ / v_comp.targ_avg);
                                line += "<td>"+ calculus_colorize_pct(pct + "%", pct) + "</td>"; // targ avg of comp
                                avg_indic.summ += pct;
                                avg_indic.div++;

                                if (targ_qz_id)
                                {
                                    let targ_val = struct_next.c_list[v_comp.id].targ_avg;
                                    line += "<td>"+ targ_val +"</td>";
                                    pct = calculus_get_pct(v_comp.summ / targ_val);
                                    avg_next_indic.summ += pct;
                                    avg_next_indic.div++;
                                    line += "<td>"+ calculus_colorize_pct(pct + "%", pct) +"</td>";
                                }
                            }
                            break;
                        }
                });
                line += "</tr>";
                body += line;

                qst_index++;
            }

        });
    });

    line = "<tr>";
    line += "<td style='background-color: #fff6ed; font-weight: bold;' colspan='"+ global_colspan +"'>Средний % соответствия по всем компетенциям</td>";
    line += "<td> </td>";
    line += "<td style='background-color: #fff6ed; font-weight: bold;'>"+ Math.floor(avg_indic.summ / avg_indic.div) +"%</td>";
    if (targ_qz_id)
    {
        line += "<td> </td>";
        line += "<td style='background-color: #fff6ed'>"+ Math.floor(avg_next_indic.summ / avg_next_indic.div) +"%</td>";
    }
    line += "</tr>";
    body += line;

    if (!block_calculus_update) {
        let t = "<table class='calculus' type='6' resp>" +
            //"<td class='line_comp' colspan='"+ (1 + head_elems.length) +"'>Общая сумма баллов по всей оценке 360/  Сумма баллов всех компетенций по всем группам респондентов с учетом веса, без самооценки</td>" +
            head +
            body +
            "</table>";

        $(".calculus").remove();
        $(".calculus_wnd").append(t);
    }
    return res;
}
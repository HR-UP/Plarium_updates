//   -------------------------------------------------------------------------------------------------------------------
function report3_indicator(qz_ord, batch_ord, targ_qz_id) {
    let qz = $ad.qzs[qz_ord];
    let group = qz.resps[batch_ord];
    let resp_answers = []; // id of resp - qnt of answers present

    let qb = qz.settings.comm_groups[batch_ord].qb_id; // this is id
    qb = get_qb_ord_from_qb_id(qb); // this is ord
    qb = $ad.qbooks[qb]; // this is actuall qbook
    let qst_id_list = qb.list;
    let struct = qb.struct;

    let res = {
        summ: 0,
        div: 0,
        comp_list: [],
        gate: 0,
        gate_next: null
    };

    let cid_list = get_comp_id_list_from_qst_list(qst_id_list);
    cid_list.forEach(function (v_cid) {
        res.gate += struct.c_list[v_cid].targ_avg; // The gate value for the current spec

        let comp_slot = {
            summ: 0,
            div: 0,
            id: v_cid * 1,
            cat_list: {},
            wg: struct.c_list[v_cid].wg,
            targ_avg: struct.c_list[v_cid].targ_avg
        };

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
                    //console.log("for cid: " + v_cat_id);
                    group.forEach(function (v_resp) { // RESP

                        if (!resp_answers.hasOwnProperty(v_resp.id) && !v_resp.ignore)
                            resp_answers[v_resp.id] = 0; // make the slot that count answers of each resp on any qst

                        // Resp had this qst
                        if (v_resp.cat_id === v_cat_id && !v_resp.ignore) // cat match
                        {
                            //console.log("resp "+ v_resp.id +" (cid: " + v_resp.cat_id +", ignore: "+ v_resp.ignore +") approved");
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
                        //else
                        //    console.log("resp "+ v_resp.id +" (cid: " + v_resp.cat_id +", ignore: "+ v_resp.ignore +") denied");
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

    console.log("calc 3: res", res);


    let global_colspan = 3;
    // BUILD TABLE
    // HEAD
    let head = "<tr>";
    let head_elems = [
        "Вес индикатора",
        "самооценка",
        "средняя по индикатору умнож на вес",
        "оценки руководители",
        "средняя по индикатору умнож на вес",
        "оценки коллеги",
        "средняя по индикатору умнож на вес",
        "оценки подчиненные",
        "средняя по индикатору умнож на вес",
        "оценки смежная команда",
        "средняя по индикатору умнож на вес",

        "Проходной балл индикатора"
    ];

    let cat_col_spans = {
        0: 0,
        4: 0,
        3: 0,
        5: 0,
        1: 0
    };
    Object.keys(cat_col_spans).map(function (k) {
        let cat_id = k * 1;
        //console.log("for cat_id: " + cat_id);

        res.comp_list.forEach(function (v_comp) {
            /*
            console.log("hasOwnProperty: " + v_comp.cat_list.hasOwnProperty(cat_id));
            console.log("resp_id_list.length: " + v_comp.cat_list[cat_id].resp_id_list.length);
            console.log("div > 0: " + (v_comp.cat_list[cat_id].div > 0));
            console.log("resp_id_list.length > cat_col_spans[cat_id]: " + (v_comp.cat_list[cat_id].resp_id_list.length > cat_col_spans[cat_id]));
            */

            if (v_comp.cat_list.hasOwnProperty(cat_id) &&
                v_comp.cat_list[cat_id].resp_id_list.length &&
                v_comp.cat_list[cat_id].div > 0 &&
                v_comp.cat_list[cat_id].resp_id_list.length > cat_col_spans[cat_id]
            )
                cat_col_spans[cat_id] = v_comp.cat_list[cat_id].resp_id_list.length;
        });
    });

    console.log("cat_col_spans", duplicate(cat_col_spans));
    //console.log("res", res);

    // by each cat_group decide by how many columns we need to shorten the table
    if (shrink_is_on)
    {
        let sub_empty_cols = calc_empty_cat_columns({0:0,3:0,4:0,5:0,1:0}, group, resp_answers);
        [0,3,4,5,1].forEach(function (id) {
            if (cat_col_spans[id])
                cat_col_spans[id] -= sub_empty_cols[id];
        });
        console.log("sub_empty_cols", sub_empty_cols);
    }

    console.log("cat_col_spans", duplicate(cat_col_spans));
    [0,3,4,5,1].forEach(function (v) {
        if (cat_col_spans.hasOwnProperty(v) &&
            cat_col_spans[v])
        {
            console.log("subbed cat_id: " + v +" " + (1 + cat_col_spans[v]));
            global_colspan += 1 + cat_col_spans[v];
        }

    });
    console.log("global_colspan", global_colspan);
    /*
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


    let global_colspan = 1 + 1 + 4;
    let resp_w = cat_col_spans[0] + cat_col_spans[3] +cat_col_spans[4] + cat_col_spans[5] + cat_col_spans[1]; // columns qnt for all the resp results
    if (resp_w < 4)
        global_colspan += 4;
    else
        global_colspan += resp_w;
    */


    head += "<td></td>";
    head += "<td>"+ head_elems[0] +"</td>";

    if (cat_col_spans[0])
    {
        head += "<td class='line_comp'>" + head_elems[1] + "</td>"; // SELF
        head += "<td>" + head_elems[2] + "</td>";
    }

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
        head += "<td class='line_comp' colspan='"+ cat_col_spans[1] +"'>"+ head_elems[9] +"</td>"; // SLAVES
        head += "<td>"+ head_elems[10] +"</td>";
    }


    head += "<td>"+ head_elems[11] +"</td>";
    head += "</tr>";

    let body = "";
    let rowspan = 1 + Object.keys(struct.c_list).length + Object.keys(struct.q_list).length;

    res.comp_list.forEach(function (v_comp) {
        // ---   COMP LINE   ---
        let line = "<tr class='line_comp'>";
        let com_ord = get_comp_ord_from_comp_id(v_comp.id);
        let comp_name = $ad.comps[com_ord].name;

        // COMPENTION LINE   ------------------------------------------------- + + +
        line += "<td>Компетенция: <b>"+ comp_name +"</b></td>";
        line += "<td colspan='"+ global_colspan +"'></td>";
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

                [0,4,3,5,1].forEach(function (v_cat_id) {
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
                                        else
                                        if (!shrink_is_on)
                                            line += "<td></td>";
                                    });
                                let v = "";
                                if (q_list[q].div)
                                {
                                    v = q_list[q].summ_wg; // show value only if any resps at all is present
                                    v = calculus_colorize_pct(v, calculus_get_pct(v / struct.q_list[v_qid].targ));
                                }

                                line += "<td>"+ v +"</td>"; // avg-summ of all resps of this category for this indicator
                                break;
                            }
                    }
                });

                // GRADE %
                let targ = struct.q_list[v_qid].targ;
                if (null === targ)
                    targ = "<span style='font-size: 12px;'>нет данных</span>";

                line += "<td>"+ targ +"</td>";
                line += "</tr>";
                body += line;
            }

        });
    });

    if (!block_calculus_update) {
        let t = "<table class='calculus' type='3'>" + head + body + "</table>";
        $(".calculus").remove();
        $(".calculus_wnd").append(t);
    }
    return res;
}



//   -------------------------------------------------------------------------------------------------------------------
function report3_indicator_resp(qz_ord, batch_ord, targ_qz_id) {
    let qz = $ad.qzs[qz_ord];
    let group = qz.resps[batch_ord];

    let qb = qz.settings.comm_groups[batch_ord].qb_id; // this is id
    qb = get_qb_ord_from_qb_id(qb); // this is ord
    qb = $ad.qbooks[qb]; // this is actuall qbook
    let qst_id_list = qb.list;
    let struct = qb.struct;

    let res = {
        summ: 0,
        div: 0,
        comp_list: [],
        gate: 0,
        gate_next: null
    };

    let cid_list = get_comp_id_list_from_qst_list(qst_id_list);
    cid_list.forEach(function (v_cid) {
        res.gate += struct.c_list[v_cid].targ_avg; // The gate value for the current spec

        let comp_slot = {
            summ: 0,
            div: 0,
            id: v_cid * 1,
            cat_list: {},
            wg: struct.c_list[v_cid].wg,
            targ_avg: struct.c_list[v_cid].targ_avg
        };

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


    let global_colspan = 2;
    // BUILD TABLE
    // HEAD
    let head = "<tr>";
    let head_elems = [
        "<b>самооценка:</b> средняя по индикатору * вес",
        "<b>руководители:</b> средняя по индикатору * вес",
        "<b>коллеги:</b> средняя по индикатору * вес",
        "<b>подчиненные:</b> средняя по индикатору * вес",
        "<b>смежная команда:</b> средняя по индикатору * вес",

        "Проходной балл индикатора"
    ];

    let cat_col_spans = {
        0: 0,
        4: 0,
        3: 0,
        5: 0,
        1: 0
    };
    Object.keys(cat_col_spans).map(function (k) {
        let cat_id = k * 1;
        res.comp_list.forEach(function (v_comp) {
            if (v_comp.cat_list.hasOwnProperty(cat_id) &&
                v_comp.cat_list[cat_id].resp_id_list.length &&
                v_comp.cat_list[cat_id].div > 0 &&
                v_comp.cat_list[cat_id].resp_id_list.length > cat_col_spans[k]
            )
                cat_col_spans[cat_id] = v_comp.cat_list[cat_id].resp_id_list.length;
        });
    });

    console.log("short: cat_col_spans", duplicate(cat_col_spans));
    [0,3,4,5,1].forEach(function (v) {
        if (cat_col_spans.hasOwnProperty(v) &&
            cat_col_spans[v])
        {
            console.log("short: subbed cat_id: " + v +" " + cat_col_spans[v]);
            global_colspan += cat_col_spans[v];
        }

    });
    console.log("short: global_colspan", global_colspan);

    /*
    let global_colspan = 1 + 4;
    let cat_col_spans = {
        0: 1,
        4: res.comp_list[0].cat_list[4].resp_id_list.length,
        3: res.comp_list[0].cat_list[3].resp_id_list.length,
        5: res.comp_list[0].cat_list[5].resp_id_list.length,
        1: res.comp_list[0].cat_list[1].resp_id_list.length,
    };
    */

    head += "<td></td>";

    if (cat_col_spans[0])
    {
        head += "<td>"+ head_elems[0] +"</td>";
    }


    if (cat_col_spans[4])
    {
        head += "<td>"+ head_elems[1] +"</td>";
    }

    if (cat_col_spans[3])
    {
        head += "<td>"+ head_elems[2] +"</td>";
    }

    if (cat_col_spans[5])
    {
        head += "<td>"+ head_elems[3] +"</td>";
    }

    if (cat_col_spans[1])
    {
        head += "<td>"+ head_elems[4] +"</td>";
    }

    head += "<td>"+ head_elems[5] +"</td>";
    head += "</tr>";

    let body = "";
    res.comp_list.forEach(function (v_comp) {
        // ---   COMP LINE   ---
        let line = "<tr>";
        let com_ord = get_comp_ord_from_comp_id(v_comp.id);
        let comp_name = $ad.comps[com_ord].name;

        // COMPENTION LINE   ------------------------------------------------- + + +
        line += "<td class='line_comp'>Компетенция: <b>"+ comp_name +"</b></td>";
        line += "<td colspan='"+ (global_colspan-1) +"'></td>";
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

                [0,4,3,5,1].forEach(function (v_cat_id) {
                    if (cat_col_spans[v_cat_id]) // there is resps in that category
                    {
                        let q_list = v_comp.cat_list[v_cat_id].q_list;
                        for (let q=0; q<q_list.length; q++)
                            if (q_list[q].id === v_qid)
                            {
                                let v = "";
                                if (q_list[q].div)
                                {
                                    v = q_list[q].summ_wg; // show value only if any resps at all is present
                                    v = calculus_colorize_pct(v, calculus_get_pct(v / struct.q_list[v_qid].targ));
                                }
                                line += "<td>"+ v +"</td>"; // avg-summ of all resps of this category for this indicator
                                break;
                            }
                    }
                });

                // GRADE %
                let targ = struct.q_list[v_qid].targ;
                if (null === targ)
                    targ = "<span style='font-size: 12px;'>нет данных</span>";
                line += "<td style='background-color: #fff6ed;'>"+ targ +"</td>";
                line += "</tr>";
                body += line;
            }
        });
    });

    if (!block_calculus_update)
    {
        let t = "<table class='calculus' type='3' resp>" +
            head +
            body +
            "</table>";
        $(".calculus").remove();
        $(".calculus_wnd").append(t);
    }
    return res;
}
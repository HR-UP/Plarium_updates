let aj_callers = {};

//----------------------------------------------------------------------------------------------------------------------
function qz_is_complete(qz_ord)
{
    let qst_qnt;
    let time = new Date();
    time = math_floor(time.getTime() / 1000, 0);
    let done = true;
    let qz = $ad.qzs[qz_ord];


    if (qz.settings.end_date > time && !qz.status)
        for (let g=0; g<qz.resps.length; g++)
        {
            let group = qz.resps[g];

            // Get qbook qsts list
            let comm_group = qz.settings.comm_groups[g];
            let qb_ord = get_qb_ord_from_qb_id(comm_group.qb_id);
            let qst_id_list = $ad.qbooks[qb_ord].list;
            let struct = $ad.qbooks[qb_ord].struct;

            for (let r=0; r<group.length; r++)
            {
                let resp = group[r];
                qst_qnt = 0;

                // We need to know exact qst qnt of this resp, due to his category
                let cat_id = resp.cat_id;
                if (struct)
                {
                    qst_id_list.forEach(function (v_qid) {
                        if (struct.q_list[v_qid].cats[cat_id].is_on)
                            qst_qnt++;
                    });
                }

                // Count truly answered questions
                let answered = 0;
                if (resp.ans_list.length)
                    resp.ans_list.forEach(function (v_ans) {
                        if (null !== v_ans && undefined !== v_ans)
                            answered++;
                    });

                console.log("check qz "+ qz.name + " qst_qnt / answered " + qst_qnt + " / " + answered);
                if (resp.ignore || answered < qst_qnt) // ecluded or not answered all yet
                {
                    done = false;
                    break;
                }
            }
        }

    return done;
}
//----------------------------------------------------------------------------------------------------------------------
function can_unaccomplish_qz(ord)
{
    /*
    let can = false;
    if ($ad.qzs && $ad.qzs[ord])
    {
        let qz = $ad.qzs[ord];
        let date_now = new Date();
        date_now = Math.floor(date_now.getTime() / 1000);
        if (date_now < qz.settings.end_date) // qz not expired yet
            for (let g=0; g<qz.resps.length; g++)
            {
                let q_list = get_qbook_q_list(ord, g);
                let qst_qnt = q_list.length;
                for (let r=0; r<qz.resps[g].length; r++)
                    if (qz.resps[g][r].ignore || qz.resps[g][r].ans_list.length < qst_qnt) // resp was ignored or not filled all answers yet
                    {
                        can = true;
                        break;
                    }
                if (can)
                    break;
            }

    }
    */
    let can = true;
    return can;
}
//----------------------------------------------------------------------------------------------------------------------
function cats_list_from_group(group, from_whole_qz)
{
    let cat_list = [];
    if (typeof group !== "object")
        message_ex("show","info","direct","Ошибка, для построения списка категорий был передан <b>невалидный массив</b> вопросов!");
    else
    if (!group.length)
        message_ex("show","info","direct","Ошибка, для построения списка категорий был передан <b>пустой</b> массив вопросов!");
    else
    {
        if (from_whole_qz)
            group.forEach(function (v_gr) {
                v_gr.forEach(function (v_resp) {
                    let cat_id = v_resp.cat_id;
                    if (!cat_list.length || cat_list.indexOf(cat_id) === -1)
                        cat_list.push(cat_id);
                });
            });
        else
        group.forEach(function (v_resp) {
            let cat_id = v_resp.cat_id;
            if (!cat_list.length || cat_list.indexOf(cat_id) === -1)
                cat_list.push(cat_id);
        });
    }

    if (cat_list.length)
    {
        let full_list = [];
        cat_list.forEach(function (cat_id) {
            let slot = {};
            slot.id = cat_id;
            slot.name = get_resp_category("by_id", cat_id);
            full_list.push(slot);
        });
        return full_list;
    }
    else
        return null;
}
//----------------------------------------------------------------------------------------------------------------------
function scale_pts_convertion(pts, scale_id) {
    let conv_pts;
    switch (scale_id) {
        case 1: // 0..3
            conv_pts = math_floor(pts / 10, 2);
            break;

        case 2: // 1..5
            conv_pts = math_floor(pts / 6, 2);
            break;

        case 3: // 1..10
            conv_pts = math_floor(pts / 3, 2);
            break;

        case 4: // 1..4
            conv_pts = math_floor(pts / 7.5, 2);
            break;

        case 5: // 1..6
            conv_pts = math_floor(pts / 5, 2);
            break;
    }
    //return conv_pts;
    return pts;
}
//----------------------------------------------------------------------------------------------------------------------
function get_graph_scale(qz_ord) {
    let scale = {};
    scale.min = 1;
    scale.max = $ad.qzs[qz_ord].settings.answer_opts_list.length - 1;
    return scale;
}
//----------------------------------------------------------------------------------------------------------------------
function get_focuspers_name(qz_ord, focus_ord) {
    let name = "?";
    let focus_id = $ad.qzs[qz_ord].resps[focus_ord][0].id;
    for (let i=0; i<$ad.resps.length; i++)
        if ($ad.resps[i].id === focus_id)
        {
            name = $ad.resps[i].fio;
            break;
        }
    return name;
}


//----------------------------------------------------------------------------------------------------------------------
function get_comp_cat_avg_of_focused(qz_ord, focus_ord) // can be called only after "calc_comps_avgs" func
{
    //console.log("CALL get_comp_cat_avg_of_focused: qz_ord = "+qz_ord+ " focus_ord="+focus_ord);
    let focus = calc_comps_avgs(qz_ord, false, focus_ord); // false - don't resave global res_comp_avg array
    focus = focus[0]; // from list to the array itself
    let qz = $ad.qzs[qz_ord];
    let qst_list = get_qbook_q_list(qz_ord, focus_ord);
    let qst_qnt = qst_list.length;
    let group = qz.resps[focus_ord];
    let cats_list = cats_list_from_group(group);
    let qst_comp_id_list = [];
    let qst_tx_list = [];
    $ad.qsts.forEach(function (v_qst) {
        qst_comp_id_list[v_qst.id] = v_qst.comp_id;
        qst_tx_list[v_qst.id] = v_qst.tx;
    });

    res_comp_cat_avg = [];
    focus.comp_list.forEach(function (v_comp, i_comp) {
        let comp = {};
        comp.id = v_comp.id;
        comp.avg = v_comp.pts; // avg for all cats
        comp.div = v_comp.div;
        comp.ns_avg = v_comp.ns_pts; // avg for all cats
        comp.ns_div = v_comp.ns_div;
        comp.name = v_comp.name;
        comp.cat_list = [];

        // Fill avg of each category of resps
        cats_list.forEach(function (v_cat) {
            let cat = {};
            cat.id = v_cat.id;
            cat.name = v_cat.name;
            cat.avg = 0;
            cat.div = 0;
            cat.resp_list = [];

            group.forEach(function (v_resp) {
                if (v_resp.cat_id === v_cat.id)
                {
                    let resp_slot = {};
                    resp_slot.avg = 0;
                    resp_slot.div = 0;
                    resp_slot.qst_list = [];

                    for (let q=0; q<qst_qnt; q++)
                        if (v_resp.ans_list[q] && qst_comp_id_list[qst_list[q]] === comp.id) // non-empty answer on qst of matched comp
                        {
                            let q_pts = v_resp.ans_list[q];
                            cat.avg += q_pts;
                            cat.div++;

                            let qst_slot = {};
                            qst_slot.ord = q;
                            qst_slot.id = qst_list[q];
                            qst_slot.pts = q_pts;

                            resp_slot.qst_list.push(qst_slot);
                            resp_slot.avg += q_pts;
                            resp_slot.div++;
                        }

                    if (resp_slot.div)
                        resp_slot.avg = math_floor(resp_slot.avg / resp_slot.div, 2);
                    cat.resp_list.push(resp_slot);
                }
            });
            if (cat.div)
                cat.avg = math_floor(cat.avg / cat.div, 2);
            cat.avg = scale_pts_convertion(cat.avg, qz.settings.scale_id); // convert from raw pts to scaled
            comp.cat_list.push(cat);
        });

        // Fill cat avgs for each qst + qst's avg for all cats
        comp.qst_list = [];
        qst_list.forEach(function (v_qst_id, i_qst) {
            if (qst_comp_id_list[v_qst_id] === comp.id) // non-empty answer on qst of matched comp
            {
                let qst = {};
                qst.id = v_qst_id;
                qst.tx = qst_tx_list[v_qst_id];
                qst.cat_list = [];
                qst.avg = 0;
                qst.div = 0;

                qst.ns_avg = 0;
                qst.ns_div = 0;


                // Fill avg of each category of group
                cats_list.forEach(function (v_cat) {
                    let cat = {};
                    cat.id = v_cat.id;
                    cat.name = v_cat.name;
                    cat.avg = 0;
                    cat.div = 0;

                    group.forEach(function (v_resp) {
                        if (v_resp.cat_id === v_cat.id && v_resp.ans_list[i_qst]) // resp of matched category that have answer on this qst
                        {
                            cat.avg += v_resp.ans_list[i_qst];
                            cat.div++;
                        }
                    });
                    if (cat.div)
                        cat.avg = math_floor(cat.avg / cat.div, 2);
                    cat.avg = scale_pts_convertion(cat.avg, qz.settings.scale_id); // convert from raw pts to scaled
                    if (cat.avg)
                    {
                        qst.avg += cat.avg;
                        qst.div++;

                        if (cat.id) // without self points
                        {
                            qst.ns_avg += cat.avg;
                            qst.ns_div++;
                        }
                    }
                    qst.cat_list.push(cat);
                });

                if (qst.div)
                    qst.avg = math_floor(qst.avg / qst.div, 2);

                if (qst.ns_div)
                    qst.ns_avg = math_floor(qst.ns_avg / qst.ns_div, 2);
                comp.qst_list.push(qst);
            }
        });
        res_comp_cat_avg.push(comp);
    });

    //console.log(res_comp_cat_avg);
    return res_comp_cat_avg;
}
//----------------------------------------------------------------------------------------------------------------------
function get_qbook_q_list(qz_ord, gr_ord) {
    if (undefined === gr_ord)
        gr_ord = 0;
    // console.log("qz_ord " + qz_ord +" gr_ord "+ gr_ord);
    let qz = $ad.qzs[qz_ord];
    let qb_id = qz.settings.comm_groups[gr_ord].qb_id;
    let qb_ord = get_qb_ord_from_qb_id(qb_id);
    let qb = $ad.qbooks[qb_ord];
    return qb.list;
}
//----------------------------------------------------------------------------------------------------------------------
function calc_comps_avgs(qz_ord, overwrite_global, focus_ord) // qz data break down by competentions by cats, by comps by qsts by cats
{
    let groups = [];
    let qz = $ad.qzs[qz_ord];
    let qst_list = get_qbook_q_list(qz_ord, focus_ord);
    let qst_qnt = qst_list.length;
    let comps_list = comps_list_from_qsts(qst_list);

    // Get array with resp_id as ord and it's fio as value for quick use
    let resp_id_to_fio_list = [];
    $ad.resps.forEach(function (v_resp) {
        resp_id_to_fio_list[v_resp.id] = v_resp.fio;
    });

    // Get array with qst_id as ord and it's comp_id as value for quick use
    let qst_comp_id_list = [];
    $ad.qsts.forEach(function (v_qst) {
        qst_comp_id_list[v_qst.id] = v_qst.comp_id;
    });

    qz.resps.forEach(function (v_gr, i_gr) {
        if (focus_ord === undefined || i_gr === focus_ord) // filter by a single focus-person
        {
            let gr = {};
            gr.fio = resp_id_to_fio_list[v_gr[0].id];
            gr.comp_list = [];
            gr.avg = 0;
            gr.ns_avg = 0;

            comps_list.forEach(function (v_comp) {
                let comp = {};
                comp.id = v_comp.id;
                comp.name = v_comp.name;
                comp.pts = 0;
                comp.div = 0;
                comp.ns_pts = 0;
                comp.ns_div = 0;
                comp.qst_list = [];
                comp.resp_list = [];

                v_gr.forEach(function (v_resp, i_resp) {
                    let resp = {};
                    resp.id = v_resp.id;
                    resp.fio = resp_id_to_fio_list[resp.id];
                    resp.qst_list = [];

                    for (let q=0; q<qst_qnt; q++)
                    {
                        let qst_id = qst_list[q];
                        let qst_comp_id = qst_comp_id_list[qst_id];
                        if (qst_comp_id === comp.id && v_resp.ans_list[q])  // match of comp, ans is given
                        {
                            let qst = {};
                            qst.ord = q;
                            qst.id = qst_id;
                            qst.pts = null;
                            if (undefined !== v_resp.ans_list[q])
                                qst.pts = v_resp.ans_list[q];

                            resp.qst_list.push(qst);

                            comp.qst_list.push(qst);
                            comp.div++;
                            comp.pts += qst.pts;

                            if (i_resp) // no self
                            {
                                comp.ns_div++;
                                comp.ns_pts += qst.pts;
                            }
                        }
                    }
                    comp.resp_list.push(resp);
                });

                if (comp.div)
                    comp.pts = math_floor(comp.pts / comp.div, 2); // avg for this comp
                comp.pts = scale_pts_convertion(comp.pts, qz.settings.scale_id); // Recalc based on picked scale id
                gr.comp_list.push(comp);
                gr.avg += comp.pts;

                if (comp.ns_div)
                    comp.ns_pts = math_floor(comp.ns_pts / comp.ns_div, 2); // avg for this comp without self focus-person
                comp.ns_pts = scale_pts_convertion(comp.ns_pts, qz.settings.scale_id);
                gr.ns_avg += comp.ns_pts;
            });

            gr.avg = math_floor(gr.avg / gr.comp_list.length, 2);
            gr.ns_avg = math_floor(gr.ns_avg / gr.comp_list.length, 2);
            groups.push(gr);
        }
    });

    if (overwrite_global === "overwrite")
        res_foc_comps = duplicate(groups);

    return groups;
}
//----------------------------------------------------------------------------------------------------------------------
function get_standart_entropy(list, avg_val) {
    let res = 0;
    if (!list || typeof list !== "object" || !list.length)
        message_ex("show","info","direct","Ошибка, на рассчет стандартного отклонения передан пустой массив.");
    else
    {
        list.forEach(function (v_pts) {
            res += Math.pow(v_pts - avg_val, 2);
        });
        res = Math.sqrt(res / (list.length - 1));
    }
    return res;
}
//----------------------------------------------------------------------------------------------------------------------
function get_djohari_avg_point(qz_ord, focus_ord) {
    let res = {};
    let qz = $ad.qzs[qz_ord];
    if (qz.settings.scale_id === 1)
    {
        res.min = 0;
        res.max = 3.0;
    }
    else
    if (qz.settings.scale_id === 2)
    {
        res.min = 1;
        res.max = 5.0;
    }
    else
    if (qz.settings.scale_id === 3)
    {
        res.min = 1;
        res.max = 10.0;
    }

    let djo_avg_id = $ad.qzs[qz_ord].settings.djo_avg_id;
    if (djo_avg_id === 1) // 50% of the scale
    {
        if (qz.settings.scale_id === 1)
        {
            res.self = 1.5;
            res.env = 1.5;
        }
        else
        if (qz.settings.scale_id === 2)
        {
            res.self = 3;
            res.env = 3;
        }
        else
            if (qz.settings.scale_id === 3)
        {
            res.self = 5.5;
            res.env = 5.5;
        }
    }
    else
    if (djo_avg_id === 2) // 70% of hte scale
    {
        if (qz.settings.scale_id === 1)
        {
            res.self = 2.1;
            res.env = 2.1;
        }
        else
        if (qz.settings.scale_id === 2)
        {
            res.self = 3.8;
            res.env = 3.8;
        }
        else if (qz.settings.scale_id === 3)
        {
            res.self = 7.3;
            res.env = 7.3;
        }
    }
    else
    if (djo_avg_id === 3) // self avg
    {
        if ($session.opened_focus_ord === null)
            message_ex("show","info","direct","Не установлен индекс фокус-персоны для получения средних значений для окна Джохари");
        else
        {
            let avgs = calc_comps_avgs(qz_ord, focus_ord); //
            res.self = 0;
            res.env = 0;
            let comps_qnt = avgs.polar_comps.length;

            if (!use_harmonic_avg) // ARIPHM AVG
            {
                avgs.polar_comps.forEach(function (v_comp) {
                    res.self += v_comp.pts_self;
                    res.env += v_comp.pts_env;
                });
                res.self = math_floor(res.self / comps_qnt, 2);
                res.env = math_floor(res.env / comps_qnt, 2);
            }
            else // HARMONIC AVG
            {
                avgs.polar_comps.forEach(function (v_comp) {
                    res.self += 1 / v_comp.pts_self;
                    res.env += 1 / v_comp.pts_env;
                });
                res.self = math_floor(1 / (res.self / comps_qnt), 2);
                res.env = math_floor(1 / (res.env / comps_qnt), 2);
            }
        }
    }
    else
    if (djo_avg_id === 4) // self avg
    {
        let pack = [];

        let avgs = calc_comps_avgs(qz_ord, false);
        res.self = 0;
        res.env = 0;
        let comps_qnt = avgs.polar_comps.length;

        // ARIPHM AVG
        /*
        avgs.polar_comps.forEach(function (v_comp) {
            res.self += v_comp.pts_self;
            res.env += v_comp.pts_env;
        });
        res.self = math_floor(res.self / comps_qnt, 2);
        res.env = math_floor(res.env / comps_qnt, 2);
        */

        // HARMONIC AVG
        avgs.polar_comps.forEach(function (v_comp) {
            res.self += 1 / v_comp.pts_self;
            res.env += 1 / v_comp.pts_env;
        });
        res.self = math_floor(1 / (res.self / comps_qnt), 2);
        res.env = math_floor(1 / (res.env / comps_qnt), 2);
    }

    res.mid = (res.self + res.env) / 2;
    return res;
}

//----------------------------------------------------------------------------------------------------------------------
function save_to_server(name) {
    let canvas, form = {}, uid = 0;

    if (name === "dual_graph")
    {
        canvas = $(".dual_graph");
        form.name = name; //"polar_graph";
    }
    else
    {
        uid = name;
        canvas = $(".comp_graph[ord='"+ name +"']");
        form.name = "group_comp_graph_" + name; //"polar_graph";
    }

    //console.log("save_to_server " + form.name);
    form.image = canvas[0].toDataURL("image/png");
    //sendAJ("base64_image_save", JSON.stringify(form), form.image);

    aj_callers[name] = $.ajax(
        {
            url: "Receiver.php",
            data: {"ajax":"base64_image_save", "data":JSON.stringify(form), "base64data": form.image},
            method: "POST",
            cache: false
        })
    // -------------------------------------------------------------------------------------
        .done(function()
        {
            //console.log(" "+data);
            if (aj_callers[name].readyState === 4 && aj_callers[name].status === 200)
            {
                if (aj_callers[name].responseText)
                {
                    group_report.images[uid] = 2;
                    if (group_report.images.length >= group_report.images_max) // set report download box to full opacity
                        $(".btn[action='load_group_report']").css("opacity","1");

                }
                else
                    message_ex("show", "info", "direct", "Информация о изображении не сохранена.");
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            message_ex("show", "info", "direct", "Ошибка при сохранена информация о изображении (групповой отчет).");
            console.log(" aj failed: save_to_server");
        });
}
//----------------------------------------------------------------------------------------------------------------------
function save_to_server_single(name, $tag) {
    let canvas, form = {}, uid = 0; // wc_focus_comcats djo_graph
    canvas = $("."+name);

    // Single report screen
    if ($new_qz.analyt_screen_id === 3 || $tag === "force")
    {
        form.name = name; //"polar_graph";
        if (name !== "wc_focus_comcats")
            uid = 1;

        //console.log("save_to_server " + form.name);
        form.image = canvas[0].toDataURL("image/png");
        //sendAJ("base64_image_save", JSON.stringify(form), form.image);

        aj_callers[name] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":"base64_image_save", "data":JSON.stringify(form), "base64data": form.image},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                //console.log(dtx);
                if (aj_callers[name].readyState === 4 && aj_callers[name].status === 200)
                {
                    if (aj_callers[name].responseText)
                    {
                        //console.log("image saved "+ x.responseText);
                        single_report.images[uid] = 2;
                        //console.log("-) image "+ name +" ready");
                        let images_done = 0;
                        single_report.images.forEach(function (v) {
                            if (v * 1 === 2)
                                images_done++;
                        });

                        if (images_done >= single_report.images_max) // set report download box to full opacity
                        {
                            $(".btn[action='load_single_report']").css("opacity","1");

                            if (batch_reports.cur !== null)
                            {
                                console.log("3) all images are ready");
                                batch_reports.img_rdy = true; // signal to batcher that all resp's images are saved to server (interval checker should pick this up)
                                batch_reports_handle ("gen_focus_report",{qz_ord: $session.opened_qz_ord});
                            }
                        }
                    }
                    //else
                    //    message_ex("show", "info", "direct", "Информация о изображении не сохранена.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                message_ex("show", "info", "direct", "Ошибка при сохранена информация о изображении (персональный отчет).");
                console.log(" aj failed: save_to_server_single");
            });
    }
}
//----------------------------------------------------------------------------------------------------------------------
function redraw_graph_for_calctype() {
    if ([1,2,6,7,4].indexOf(single_report.calc_type) !== -1)
        draw_graph(null, {"style": "polar_comps"});
}
//----------------------------------------------------------------------------------------------------------------------
function draw_graph(data, tag)
{
    let datasets_info, ctx;
    // Adjust the scales to fir the quiz settings
    let scale = get_graph_scale($session.opened_qz_ord);
    let qz = $ad.qzs[$session.opened_qz_ord];


    //scale.min = 0;
    //scale.max = qz.settings.answer_opts_list.length - 1;

    Chart.scaleService.updateScaleDefaults('horizontalBar', {
        ticks: {
            min: 0,
            max: qz.settings.answer_opts_list.length - 1
        }
    });

    let LABELS;
    if (tag.style === "polar_comps")
    {
        let res = get_report_results(single_report.calc_type, $session.opened_qz_ord, $session.opened_focus_ord, single_report.targ_qb_id);
        let self_vals = [];
        let spec_this = [];
        let spec_next = [];
        let datasets = [];
        let title = "Сравнение значений";

        if ([2,6,7,4].indexOf(single_report.calc_type) !== -1)
        {
            let role_vals = {
                0: [],
                3: [],
                4: [],
                5: []
            };
            title = "Сравнение компетенций";
            LABELS = [];
            res.comp_list.forEach(function (v_comp) {
                let comp_ord = get_comp_ord_from_comp_id(v_comp.id);
                let name = $ad.comps[comp_ord].name;
                if (name.length > 25)
                    name = name.slice(0, 25) + "...";
                LABELS.push(name);

                [0,3,4,5].forEach(function (cat_id) {
                    role_vals[cat_id].push(math_floor(v_comp.cat_list[cat_id].summ, 2));
                });
                spec_this.push(math_floor(v_comp.targ_avg, 2));

                if ([2,6,7].indexOf(single_report.calc_type) !== -1 && single_report.targ_qb_id)
                    spec_next.push(math_floor(v_comp.targ_next, 2));
            });

            datasets.push({
                label: 'самооценка',
                backgroundColor: "#fdb8d4",//color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: "#fdd0d3",//window.chartColors.red,
                borderWidth: 1,
                data: role_vals[0]
            });

            datasets.push({
                label: 'руководители',
                backgroundColor: "#a6b0fd",//color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: "#cfd2fd",//window.chartColors.red,
                borderWidth: 1,
                data: role_vals[4]
            });

            datasets.push({
                label: 'коллеги',
                backgroundColor: "#a0fd9c",//color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: "#ddfddb",//window.chartColors.red,
                borderWidth: 1,
                data: role_vals[3]
            });

            datasets.push({
                label: 'подчиненные',
                backgroundColor: "#a4f8fd",//color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: "#d3fafd",//window.chartColors.red,
                borderWidth: 1,
                data: role_vals[5]
            });

            datasets.push({
                label: 'цель',
                backgroundColor: "#FDD048",//color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: "#FDD048",//window.chartColors.red,
                borderWidth: 1,
                data: spec_this
            });

            if ([2,6,7].indexOf(single_report.calc_type) !== -1 && single_report.targ_qb_id)
                datasets.push({
                    label: 'след. цель',
                    backgroundColor: "#FD636D",//color(window.chartColors.red).alpha(0.5).rgbString(),
                    borderColor: "#AC434A",//window.chartColors.red,
                    borderWidth: 1,
                    data: spec_next
                });
        }
        else
        if ([2,6,7].indexOf(single_report.calc_type) !== -1)
        {
            title = "Сравнение компетенций";
            LABELS = [];
            res.comp_list.forEach(function (v_comp) {
                let comp_ord = get_comp_ord_from_comp_id(v_comp.id);
                let name = $ad.comps[comp_ord].name;
                if (name.length > 25)
                    name = name.slice(0, 25) + "...";
                LABELS.push(name);

                self_vals.push(math_floor(v_comp.summ, 2));
                spec_this.push(math_floor(v_comp.targ_avg, 2));
                if (single_report.targ_qb_id)
                    spec_next.push(math_floor(v_comp.targ_next, 2));
            });

            datasets.push({
                label: 'текущее',
                backgroundColor: "#526EB0",//color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: "#363c6c",//window.chartColors.red,
                borderWidth: 1,
                data: self_vals
            });

            datasets.push({
                label: 'должность',
                backgroundColor: "#FDD048",//color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: "#cb9f3e",//window.chartColors.red,
                borderWidth: 1,
                data: spec_this
            });

            if (single_report.targ_qb_id)
                datasets.push({
                    label: 'след. должность',
                    backgroundColor: "#FD636D",//color(window.chartColors.red).alpha(0.5).rgbString(),
                    borderColor: "#AC434A",//window.chartColors.red,
                    borderWidth: 1,
                    data: spec_next
                });
        }
        else
        if ([1].indexOf(single_report.calc_type) !== -1)
        {
            title = "Сравнение компетенций";
            LABELS = ["Сумма по компетенциям"];

            self_vals.push(math_floor(res.summ, 2));
            spec_this.push(math_floor(res.gate, 2));
            if (single_report.targ_qb_id)
                spec_next.push(math_floor(res.gate_next, 2));

            datasets.push({
                label: 'текущее',
                backgroundColor: "#526EB0",//color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: "#363c6c",//window.chartColors.red,
                borderWidth: 1,
                data: self_vals
            });

            datasets.push({
                label: 'цель',
                backgroundColor: "#FDD048",//color(window.chartColors.red).alpha(0.5).rgbString(),
                borderColor: "#cb9f3e",//window.chartColors.red,
                borderWidth: 1,
                data: spec_this
            });

            if (single_report.targ_qb_id)
                datasets.push({
                    label: 'след. цель',
                    backgroundColor: "#FD636D",//color(window.chartColors.red).alpha(0.5).rgbString(),
                    borderColor: "#AC434A",//window.chartColors.red,
                    borderWidth: 1,
                    data: spec_next
                });
        }
        else
        {
            LABELS = data.comp_names_list;

            data.polar_comps.forEach(function (v_comp) {
                self_vals.push(v_comp.pts_self);
                env_vals.push(v_comp.pts_env);
            });
        }

        datasets_info = {
            labels: LABELS,
            datasets: datasets
        };

        ctx = $('.wc_focus_comcats')[0].getContext('2d');
        $('.wc_focus_comcats').css("height","1100px");
        window.myBar.destroy();
        window.myBar = new Chart(ctx, {
            type: 'horizontalBar',
            data: datasets_info,
            plugins: {
                // Change options for ALL labels of THIS CHART
                datalabels: {
                    color: 'black',
                    anchor: 'end',
                    align: 'right',
                    labels: {
                        title: {
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        value: {
                            color: null
                        }
                    }
                }
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        color: 'black',
                        anchor: 'end',
                        align: 'right',

                        labels: {
                            title: {
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
                            },
                            value: {
                                color: null
                            }
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: "black",
                            fontSize: 16,
                            fontStyle: 'bold',
                            precision:2
                        },
                        categoryPercentage: 0.9,
                        barPercentage: 1.0,
                        //barThickness: 10,//20,
                        //maxBarThickness: 50,
                        minBarLength: 2,
                        gridLines: {
                            display: false,
                            offsetGridLines: true
                        }
                    }],
                    xAxes: [{
                        ticks:{
                            suggestedMin: 0,
                            suggestedMax: qz.settings.answer_opts_list.length - 1,
                            fontColor: "black",
                            fontSize: 12,
                            fontStyle: 'bold'
                        },
                        barPercentage: 1.0,
                        //barThickness: 10,
                        //maxBarThickness: 50,
                        minBarLength: 2,
                        gridLines: {
                            display: false,
                            offsetGridLines: true
                        }
                    }]
                },

                legend: {
                    display: true,
                    position: 'right',

                    labels: {
                        fontStyle: 'bold',
                        fontSize: 14
                    }
                },
                title: {
                    display: true,
                    fontSize: 20,
                    padding: 20,
                    fontColor: "#282F36",
                    text: title
                },
                animation: {
                    duration: 500,
                    onComplete: function(animation) {
                        save_to_server_single("wc_focus_comcats", "force");
                        /*
                        if (group_report.images[0] === undefined)
                        {
                            group_report.images[0] = true;
                            //save_to_server("dual_graph");

                        }
                        */
                        //save_to_server("dual_graph");
                    }
                }
            }
        });
    }
    else
    if (tag.style === "comps_of_cats")
    {
        LABELS = data.cat_names_list;
        for (let i=0; i<data.comp_names_list.length; i++)
        {
            let cat_list = data.comp_cats[i].cat_list;
            let vals = [];
            cat_list.forEach(function (cat) {
                vals.push(cat.avg);
            });

            datasets_info = {
                labels: LABELS,
                datasets:
                    [
                        {
                            label: 'dataset',
                            backgroundColor: "#526EB0",//color(window.chartColors.red).alpha(0.5).rgbString(),
                            borderColor: "#363c6c",//window.chartColors.red,
                            borderWidth: 1,
                            data: vals
                        }
                    ]
            };
            ctx = $(".comp_graph[ord='"+ (i+1) +"']")[0].getContext('2d');
            window.myBar = new Chart(ctx, {
                type: 'horizontalBar',
                data: datasets_info,
                options: {
                    plugins: {
                        // Change options for ALL labels of THIS CHART
                        datalabels: {
                            color: 'black',
                            anchor: 'end',
                            align: 'right',

                            labels: {
                                title: {
                                    font: {
                                        size: 20,
                                        weight: 'bold'
                                    }
                                },
                                value: {
                                    color: null
                                }
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                fontColor: "black",
                                fontSize: 16,
                                fontStyle: 'bold',
                                precision:2
                            },
                            categoryPercentage: 1.0,
                            barPercentage: 0.9,
                            //barThickness: 40,
                            //maxBarThickness: 40,
                            minBarLength: 2,
                            gridLines: {
                                display: false,
                                offsetGridLines: true
                            }
                        }],
                        xAxes: [{
                            ticks:{
                                suggestedMin: scale.min,
                                suggestedMax: scale.max,
                                fontColor: "black",
                                fontSize: 16,
                                fontStyle: 'bold'
                            },
                            barPercentage: 0.9,
                            barThickness: 20,
                            maxBarThickness: 20,
                            minBarLength: 2,
                            gridLines: {
                                display: false,
                                offsetGridLines: true
                            }
                        }]
                    },
                    responsive: true,
                    legend: {
                        display: false,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        fontSize: 20,
                        padding: 20,
                        fontColor: "#000000",
                        text: data.comp_names_list[i]
                    },
                    animation: {
                        duration: 500,
                        onProgress: function(animation) {
                            /*
                            $progress.attr({
                                value: animation.animationObject.currentStep / animation.animationObject.numSteps,
                            });
                            */
                        },
                        onComplete: function(animation) {
                            if (group_report.images[i+1] === undefined)
                            {
                                group_report.images[i+1] = true;
                                //console.log("comp graph " + (i + 1));
                                //console.log(animation);
                                save_to_server(i+1);
                            }
                            //save_to_server(i+1);
                        }
                    }
                }
            });
        }
    }
    else
    if (tag.style === "web")
    {
        console.log("constructing web chart");
        let d_sets = {};
        d_sets.self = [];
        d_sets.env = [];
        data.polar_comps.forEach(function (v_comp) {
            d_sets.self.push(v_comp.pts_self);
            d_sets.env.push(v_comp.pts_env);
        });


        LABELS = data.comp_names_list;
        // Shorten labels to avoid errors when the graph itself can't be inserted cuz of all canvas space taken by the labels
        LABELS.forEach(function (v, i) {
            if (v.length > 20)
                LABELS[i] = v.substr(0, 20) + "...";
        });

        datasets_info = {
            labels: LABELS,
            datasets:
                [
                    {
                        label: 'самооценка',
                        backgroundColor: "rgba(176, 41, 36, 0.3)",//color(window.chartColors.red).alpha(0.5).rgbString(), // #b02924
                        borderColor: "rgba(176, 41, 36, 1.0)",//window.chartColors.red, // #363c6c
                        borderWidth: 2,
                        lineTension: 0.2,
                        data: d_sets.self

                    },
                    {
                        label: 'окружение',
                        backgroundColor: "rgba(82, 110, 176, 0.3)",//color(window.chartColors.red).alpha(0.5).rgbString(),
                        borderColor: "rgba(82, 110, 176, 1.0)",//window.chartColors.red, // #363c6c
                        borderWidth: 2,
                        lineTension: 0.2,
                        data: d_sets.env
                    }
                ]
        };
        ctx = $(".wc_focus_comcats")[0].getContext('2d');
        window.myBar = new Chart(ctx, {
            type: 'radar',
            data: datasets_info,
            options: {
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        color: 'black',
                        anchor: 'end',
                        align: 'right',

                        labels: {
                            title: {
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            value: {
                                color: null
                            }
                        }
                    }
                },
                scale: {
                    pointLabels: {
                        fontSize: 16
                    },
                    angleLines: {
                        display: false
                    },
                    ticks: {
                        suggestedMin: scale.min,
                        suggestedMax: scale.max,
                        fontColor: "#bbbbbb",
                        fontSize: 16,
                        fontStyle: 'bold',
                        precision:2,
                    },
                    gridLines: {
                        circular: true
                    }
                },
                /*
                scales: {
                    yAxes: [{
                        fontColor: "black",
                        fontSize: 16,
                        fontStyle: 'bold',
                        precision:2,

                        ticks: {
                            fontColor: "black",
                            fontSize: 16,
                            fontStyle: 'bold',
                            precision:2
                        },
                        gridLines: {
                            display: false,
                            offsetGridLines: true
                        }
                    }]

                  ,
                    xAxes: [{
                        ticks:{
                            suggestedMin: scale.min,
                            suggestedMax: scale.max,
                            fontColor: "black",
                            fontSize: 16,
                            fontStyle: 'bold'
                        },
                        gridLines: {
                            display: false,
                            offsetGridLines: true
                        }
                    }]

                },
                */
                responsive: true,
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        fontSize: 16,
                        fontStyle: 'bold',
                    }
                },
                title: {
                    display: true,
                    fontSize: 20,
                    padding: 20,
                    fontColor: "#000000",
                    text: "Сравнение самооценки и оценки окружающих"
                },
                animation: {
                    duration: 500,
                    onComplete: function(animation) {
                        if (single_report.images[0] === undefined)
                        {
                            single_report.images[0] = true;
                            if (batch_reports.cur !== null)
                                save_to_server_single("wc_focus_comcats", "force");
                            else
                                save_to_server_single("wc_focus_comcats");
                        }
                    }
                }
            }
        });
    }
    else
    if (tag.style === "djohari")
    {
        console.log("constructing djo chart");
        let d_sets = {};
        d_sets.super = [];
        d_sets.strong = [];
        d_sets.mid = [];
        d_sets.weak = [];
        let pivot = pivot_avg = get_djohari_avg_point($session.opened_qz_ord, $session.opened_focus_ord);
        //console.log("pivot");
        //console.log(pivot);

        data.polar_comps.forEach(function (v_comp, i_comp) {
            let link;
            if (v_comp.pts_self >= pivot.self && v_comp.pts_env >= pivot.env) // super (явные сильные)
                link = d_sets.super;
            else
            if (v_comp.pts_self < pivot.self && v_comp.pts_env >= pivot.env) // strong (скрытые сильне)
                link = d_sets.strong;
            else
            if (v_comp.pts_self >= pivot.self && v_comp.pts_env < pivot.env) // mid (слепое пятно)
                link = d_sets.mid;
            else
                link = d_sets.weak;

            link[i_comp] = {
                "x": v_comp.pts_self - pivot.self,
                "y": v_comp.pts_env - pivot.env,
                "r": 7,
                //"name": v_comp.name
            };
            link = undefined;
        });

        //console.log("d_sets");
        //console.log(d_sets);

        LABELS = data.comp_names_list;
        LABELS.forEach(function (v, i) {
            if (v.length > 20)
                LABELS[i] = v.substr(0, 20) + "...";
        });

        datasets_info = {
            labels: LABELS,
            datasets:
                [
                    {
                        datalabels: {
                            color: 'black',
                            anchor: 'end',
                            align: -30,
                            clamp: true,
                            offset: 5,
                        },
                        label: 'очевидные сильные стороны',
                        backgroundColor: "#0bcc27",//color(window.chartColors.red).alpha(0.5).rgbString(), // #b02924
                        borderColor: "black",//window.chartColors.red, // #363c6c
                        borderWidth: 1,
                        data: d_sets.super
                    },
                    {
                        datalabels: {
                            color: 'black',
                            anchor: 'end',
                            align: -125,
                            clamp: true,
                            offset: 5,
                        },
                        label: 'неочевидные сильные стороны',
                        backgroundColor: "#0d20cc",//color(window.chartColors.red).alpha(0.5).rgbString(), // #b02924
                        borderColor: "black",//window.chartColors.red, // #363c6c
                        borderWidth: 1,
                        data: d_sets.strong
                    },
                    {
                        datalabels: {
                            color: 'black',
                            anchor: 'end',
                            align: 45,
                            clamp: true,
                            offset: 7,
                        },
                        label: '«слепое пятно»',
                        backgroundColor: "#cc7d08",//color(window.chartColors.red).alpha(0.5).rgbString(), // #b02924
                        borderColor: "black",//window.chartColors.red, // #363c6c
                        borderWidth: 1,
                        data: d_sets.mid
                    },
                    {
                        datalabels: {
                            color: 'black',
                            anchor: 'end',
                            align: 125,
                            clamp: true,
                            offset: 10,
                        },
                        label: 'очевидные потребности для развития',
                        backgroundColor: "#cc0513",//color(window.chartColors.red).alpha(0.5).rgbString(), // #b02924
                        borderColor: "black",//window.chartColors.red, // #363c6c
                        borderWidth: 1,
                        data: d_sets.weak
                    }
                ]
        };
        ctx = $(".djo_graph")[0].getContext('2d');
        window.myBar = new Chart(ctx, {
            type: 'bubble',
            data: datasets_info,
            options: {
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        color: 'black',
                        anchor: 'center',
                        align: 'start',
                        clamp: true,
                        offset: 5,

                        labels: {
                            title: {
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            value: {
                                color: null
                            }
                        },
                        formatter: function(value, context) {
                            /*
                            console.log("-------------------------");
                            console.log("-----  formatter  -------");
                            console.log(value);
                            console.log("-----  context  -------");
                            console.log(context);
                            */
                            return context.chart.data.labels[context.dataIndex];
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        scaleLabel:{
                            display: true,
                            labelString: "Окружение",
                            fontSize: 18,
                            fontStyle: 'bold',
                            fontColor: "0e0e0e"

                        },
                        ticks: {
                            suggestedMin: scale.min - pivot.env - 2,
                            suggestedMax: scale.max,
                            fontColor: "white",
                            precision:2
                        },

                        gridLines: {
                            display: true,
                            //offsetGridLines: false,
                            drawTicks: false,
                            zeroLineWidth: 4,
                            //color: 'black'
                        }
                    }]

                  ,
                    xAxes: [{
                        scaleLabel:{
                            display: true,
                            labelString: "Самооценка",
                            fontSize: 18,
                            fontStyle: 'bold',
                            fontColor: "0e0e0e"
                        },
                        ticks:{
                            suggestedMin: scale.min - pivot.self - 2,
                            suggestedMax: scale.max,
                            fontColor: "white",
                            precision:2
                        },

                        gridLines: {
                            display: true,
                            drawTicks: false,
                            zeroLineWidth: 4,
                            //color: 'black'
                        }
                    }]

                },

                responsive: true,
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        fontSize: 16,
                        fontStyle: 'bold',
                    }
                },
                title: {
                    display: true,
                    fontSize: 20,
                    padding: 20,
                    fontColor: "#000000",
                    text: "Окно Джохари"
                },
                animation: {
                    duration: 500,
                    onComplete: function(animation) {
                        if (single_report.images[1] === undefined)
                        {
                            single_report.images[1] = true;
                            if (batch_reports.cur !== null) // batching
                                save_to_server_single("djo_graph", "force");
                            else // online show
                                save_to_server_single("djo_graph");
                        }
                    }
                }
            }
        });
    }
    else
    if (tag.style === "bars")
    {
        let d_sets = {};
        d_sets.self = [];
        d_sets.env = [];
        data.polar_comps.forEach(function (v_comp) {
            d_sets.self.push(v_comp.pts_self);
            d_sets.env.push(v_comp.pts_env);
        });

        LABELS = data.comp_names_list;

        datasets_info = {
            labels: LABELS,
            datasets:
                [
                    {
                        label: 'самооценка',
                        backgroundColor: "rgba(176, 41, 36, 0.3)",//color(window.chartColors.red).alpha(0.5).rgbString(), // #b02924
                        borderColor: "rgba(176, 41, 36, 1.0)",//window.chartColors.red, // #363c6c
                        borderWidth: 2,
                        lineTension: 0.2,
                        data: d_sets.self

                    },
                    {
                        label: 'окружение',
                        backgroundColor: "rgba(82, 110, 176, 0.3)",//color(window.chartColors.red).alpha(0.5).rgbString(),
                        borderColor: "rgba(82, 110, 176, 1.0)",//window.chartColors.red, // #363c6c
                        borderWidth: 2,
                        lineTension: 0.2,
                        data: d_sets.env
                    }
                ]
        };
        ctx = $(".wc_focus_comcats")[0].getContext('2d');
        window.myBar = new Chart(ctx, {
            type: 'radar',
            data: datasets_info,
            options: {
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        color: 'black',
                        anchor: 'end',
                        align: 'right',

                        labels: {
                            title: {
                                font: {
                                    size: 20,
                                    weight: 'bold'
                                }
                            },
                            value: {
                                color: null
                            }
                        }
                    }
                },
                scale: {
                    pointLabels: {
                        fontSize: 16
                    },
                    angleLines: {
                        display: false
                    },
                    ticks: {
                        suggestedMin: scale.min,
                        suggestedMax: scale.max,
                        fontColor: "#bbbbbb",
                        fontSize: 16,
                        fontStyle: 'bold',
                        precision:2,
                    },
                    gridLines: {
                        circular: true
                    }
                },
                /*
                scales: {
                    yAxes: [{
                        fontColor: "black",
                        fontSize: 16,
                        fontStyle: 'bold',
                        precision:2,

                        ticks: {
                            fontColor: "black",
                            fontSize: 16,
                            fontStyle: 'bold',
                            precision:2
                        },
                        gridLines: {
                            display: false,
                            offsetGridLines: true
                        }
                    }]

                  ,
                    xAxes: [{
                        ticks:{
                            suggestedMin: scale.min,
                            suggestedMax: scale.max,
                            fontColor: "black",
                            fontSize: 16,
                            fontStyle: 'bold'
                        },
                        gridLines: {
                            display: false,
                            offsetGridLines: true
                        }
                    }]

                },
                */
                responsive: true,
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        fontSize: 16,
                        fontStyle: 'bold',
                    }
                },
                title: {
                    display: true,
                    fontSize: 20,
                    padding: 20,
                    fontColor: "#000000",
                    text: "Сравнение самооценки и оценки окружающих"
                },
                animation: {
                    duration: 500,
                    onComplete: function(animation) {
                        if (single_report.images[0] === undefined)
                        {
                            single_report.images[0] = true;
                            if (batch_reports.cur !== null)
                                save_to_server_single("wc_focus_comcats", "force");
                            else
                                save_to_server_single("wc_focus_comcats");
                        }
                    }
                }
            }
        });
    }
    /*
    else
    if (tag.style === "polar_comps")
    {
        LABELS = data.comp_names_list;
        let self_vals = [];
        let env_vals = [];
        data.polar_comps.forEach(function (v_comp) {
            self_vals.push(v_comp.pts_self);
            env_vals.push(v_comp.pts_env);
        });

        datasets_info = {
            labels: LABELS,
            datasets:
                [
                    {
                        label: 'самооценка',
                        backgroundColor: "#526EB0",//color(window.chartColors.red).alpha(0.5).rgbString(),
                        borderColor: "#363c6c",//window.chartColors.red,
                        borderWidth: 1,
                        data: self_vals
                    },
                    {
                        label: 'другие',
                        backgroundColor: "#FDD048",//color(window.chartColors.red).alpha(0.5).rgbString(),
                        borderColor: "#cb9f3e",//window.chartColors.red,
                        borderWidth: 1,
                        data: env_vals
                    }
                ]
        };
        ctx = $('.dual_graph')[0].getContext('2d');
        window.myBar = new Chart(ctx, {
            type: 'horizontalBar',
            data: datasets_info,
            plugins: {
                // Change options for ALL labels of THIS CHART
                datalabels: {
                    color: 'black',
                    anchor: 'end',
                    align: 'right',

                    labels: {
                        title: {
                            font: {
                                size: 20,
                                weight: 'bold'
                            }
                        },
                        value: {
                            color: null
                        }
                    }
                }
            },
            options: {
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        color: 'black',
                        anchor: 'end',
                        align: 'right',

                        labels: {
                            title: {
                                font: {
                                    size: 20,
                                    weight: 'bold'
                                }
                            },
                            value: {
                                color: null
                            }
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: "black",
                            fontSize: 16,
                            fontStyle: 'bold',
                            precision:2
                        },
                        categoryPercentage: 1.0,
                        barPercentage: 0.9,
                        //barThickness: 30,
                        //maxBarThickness: 30,
                        minBarLength: 2,
                        gridLines: {
                            display: false,
                            offsetGridLines: true
                        }
                    }],
                    xAxes: [{
                        ticks:{
                            suggestedMin: scale.min,
                            suggestedMax: scale.max,
                            fontColor: "black",
                            fontSize: 16,
                            fontStyle: 'bold'
                        },
                        barPercentage: 0.9,
                        barThickness: 40,
                        maxBarThickness: 40,
                        minBarLength: 2,
                        gridLines: {
                            display: false,
                            offsetGridLines: true
                        }
                    }]
                },
                responsive: true,
                legend: {
                    display: true,
                    position: 'right',

                    labels: {
                        fontStyle: 'bold',
                        fontSize: 14
                    }
                },
                title: {
                    display: true,
                    fontSize: 20,
                    padding: 20,
                    fontColor: "#282F36",
                    text: 'Сравнение самооценки и оценки окружающих'
                },
                animation: {
                    duration: 500,
                    onComplete: function(animation) {
                        if (group_report.images[0] === undefined)
                        {
                            group_report.images[0] = true;
                            save_to_server("dual_graph");
                        }
                        //save_to_server("dual_graph");
                    }
                }
            }
        });
    }
    */
}


/*
SheetNames:["Sheet1"],
	Sheets: {
		Sheet1: {
			"!ref": "A1:B2",
			A1:{t:'s', v:"A1:A2"},
			B1:{t:'n', v:1},
			B2:{t:'b', v:true},
			"!merges":[
				{s:{r:0,c:0},e:{r:1,c:0}} // A1:A2
            ]
        }
    }
*/
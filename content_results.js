//$(".avg_com_cats_web_spec_3").css("background-image", "url(img/WebChart_spec_3.png?"+Math.random()+")");
//----------------------------------------------------------------------------------------------------------------------
let mon_names = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
let res_foc_comps = []; // global holder of comps avg for each focus guy, making tth sorting of this shit fast (by name, or by comp)
let res_comp_cat_avg = []; // comps list of avgs, avg of each cat in a comp, avg of each cat of every qst in a comp
let use_harmonic_avg = true;
let group_report = {};
group_report.images = [];
group_report.images_max = 0;
let single_report = {};
single_report.images = [];
single_report.images_max = 0;
single_report.calc_type = null;
single_report.targ_qb_id = null;

let batch_reports = {};
batch_reports.qnt = null;
batch_reports.cur = null;
batch_reports.img_rdy = false;
batch_reports.interval = false;

let shrink_is_on = true;

let calc_template_names = [null,
    "Сумма баллов всех компетенций по всем группам, с учетом веса",
    "Сумма баллов по каждой компетенции, с учетом веса",
    "Отдельно по каждому индикатору, средняя * вес",
    "Сумма баллов по каждой компетенции, сложение взвешенных индикаторов.",
    "Средняя по индикатору (цель - руководители)",
    "Средняя по компетенции по каждой группе респондентов",
    "Средневзвешенная арифметическая, с весом",
    "Средняя по индикатору (цель - окружение)",];
let folder_block = false;

//----------------------------------------------------------------------------------------------------------------------
function content_analytics()
{
    let qz;
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='analytics_box' "+$nosel+">";
    //$res += "<div class='head'>Аналитика по участникам</div>";

    switch ($new_qz.analyt_screen_id)
    {
        // ROSTER / COMPS TABLE
        case 1:
            $res += "<div class='head'>Аналитика по участникам</div>";
            if ($session.opened_qz_ord !== null) // COMPS TABLE
            {
                let qz = $ad.qzs[$session.opened_qz_ord];
                let unforce_btn = "";
                if (can_unaccomplish_qz($session.opened_qz_ord)) // is true when 1) enddate is not expired, there is ignored or unfinished resp entries
                    unforce_btn ="<div class='force_complete' is_complete='"+qz.status+"'></div>";

                $res += "<div class='subhead'>"+ unforce_btn + qz.name +"</div>";

                $res += "<table class='btn_box' pos='up'><tr>";
                $res += "<td><input class='search' placeholder='Поиск'></td>";
                ///$res += "<td><div class='btn' action='load_data_table'>Выгрузить таблицу с данными</div></td>";
                //$res += "<td><div class='btn' action='load_batch_reports'>Выгрузить отчеты</div></td>";
                //$res += "<td><div class='btn' action='group_report'>Групповой отчет</div></td>";
                $res += "</tr></table>";


                $res += "<table class='comps_table'>";
                $res += content_analytics_comps_table("get_html");
                $res += "</table>";

            }
            else // draw selection ROSTER
            {
                $res += "<div class='roster'>";
                $res += "<div class='head'>Выберите активный опрос для просмотра</div>";

                let qz_ord_list = [];
                if ($ad.qzs.length)
                    $ad.qzs.forEach(function (v_qz, i_qz) {
                        qz_ord_list.push(i_qz);
                    });

                let foldered_qz_ords = [];

                if (!qz_ord_list.length)
                    $res += "<div class='item'>Нет активных опросов</div>";
                else
                {
                    $res += "<div class='utils_box'>" +
                        "<div class='btn_add_folder' unfolder='0'></div>" +
                        "<div class='btn_sort' dir='1'></div>" +
                        "<span class='filter'><input type='text' placeholder='поиск' class='res_filter'></span>" +
                        "</div>";

                    // Draw folders
                    if ($pers.hasOwnProperty("an_folders") && $pers.an_folders.length)
                    {
                        $pers.an_folders.forEach(function (v_folder, i_folder) {
                            $res += "<div class='item_folder an_line' is_folded='0' ord='"+i_folder+"'>";
                                $res += "<div class='btn_sort_dir' dir='1'></div>";
                                $res += v_folder.name;
                            $res += "</div>";

                            if (v_folder.list.length)
                                v_folder.list.forEach(function (v_list_qz_id) {
                                        $ad.qzs.forEach(function (v_qz, i_qz) {
                                            if (v_qz.id === v_list_qz_id)
                                            {
                                                foldered_qz_ords.push(i_qz);
                                                $res += "<div class='item an_line' ord='"+i_qz+"' folder_ord='"+ i_folder +"' is_folded last_seen='0'>";
                                                    $res += $ad.qzs[i_qz].name;
                                                    if ($ad.qzs[i_qz].settings.comment)
                                                        $res += " <div class='comment'>(" + $ad.qzs[i_qz].settings.comment + ")</div>";
                                                $res += "</div>";
                                            }
                                        });
                                });
                        });
                    }

                    // Build list of names of active quizes (selectable)
                    qz_ord_list.forEach(function (v_qz_ord) {
                        if (foldered_qz_ords.indexOf(v_qz_ord) === -1) // not showed in some folder already
                        {
                            $res += "<div class='item an_line' ord='"+v_qz_ord+"'>";
                            $res += $ad.qzs[v_qz_ord].name;
                            if ($ad.qzs[v_qz_ord].settings.comment)
                                $res += " <div class='comment'>(" + $ad.qzs[v_qz_ord].settings.comment + ")</div>";
                            $res += "</div>";
                        }
                    });
                }
                $res += "</div>";
            }
            break;

        // GROUP REPORT
        case 2:
            group_report.images = [];

            qz = $ad.qzs[$session.opened_qz_ord];
            let qb_list = get_qbook_q_list($session.opened_qz_ord, $session.opened_focus_ord);
            let comps_list = comps_list_from_qsts(qz.settings.qst_list);
            group_report.images_max = comps_list.length + 1;
            let data = group_report_data($session.opened_qz_ord);

            $res += "<div class='group_report_box'>";
                $res += "<div class='head'>Групповой отчет: "+qz.name+"</div>";

                $res += "<table class='btn_box' pos='group'><tr>";
            $res += "<td><div class='btn' action='back'>Назад к группам</div></td>";
                $res += "<td><div class='btn' action='load_group_report'>Скачать отчет</div></td>";
                $res += "</tr></table>";

                $res += "<canvas class='dual_graph'></canvas>";

                for (let i=0; i<data.comp_names_list.length; i++)
                    $res += "<div class='comp_graph_box'><canvas ord='"+ (i+1) +"' class='comp_graph'></canvas></div>";
            $res += "</div>";
            break;

        // SINGLE REPORT
        case 3:
            single_report.images = [];
            single_report.images_max = 2;
            qz = $ad.qzs[$session.opened_qz_ord];
            let focus = qz.resps[$session.opened_focus_ord];
            let fio = "";
            for (let i=0; i<$ad.resps.length; i++)
                if ($ad.resps[i].id === focus[0].id)
                {
                    fio = $ad.resps[i].fio;
                    break;
                }

            $res += "<div class='single_report_box'>";
                $res += "<div class='head'>" +
                    qz.name +
                        "<div class='focus_pers'>"+ fio +
                            "<div class='icon' show_qz_list></div>" +
                        "</div>" +
                    "</div>";
                // BTNS
                $res += "<table class='btn_box' pos='group'><tr>";
                $res += "<td><div class='btn' action='load_single_report'>Скачать отчет</div></td>";
                $res += "<td><div class='btn' action='load_comments_report'>Скачать комментарии</div></td>";
                $res += "<td><div class='btn' action='group_fb'>Посмотреть комментарии</div></td>";
                //$res += "<td><div class='btn' action='ans_table_cat'>Посмотреть ответы по категориям</div></td>";
                //$res += "<td><div class='btn' action='ans_table_qst'>Посмотреть ответы по вопросам</div></td>";
                //$res += "<td><div class='btn' action='load_ipr'>Скачать ИПР</div></td>";
                $res += "<td><div class='btn' action='back'>Назад к группам</div></td>";
                $res += "</tr></table>";



            $res += "<div class='calculus_box'>" +
                    "<div class='title'>Выберите тип расчетов</div>" +
                    "<div class='title_options'>" +
                        "<div class='targetng'><input type='checkbox' action='goal'>Целеполагание</div>" +
                        "<div class='targetng'><input type='checkbox' action='shrink' checked>Сократить пустых респондентов</div>" +
                        "<div class='targetng'><input type='checkbox' action='comments'>Комментарии</div>" +
                        "<div class='targetng'><input type='checkbox' action='djo'>Окно Джохари</div>" +
                    "</div>" +
                    "<div class='options_box'>" +

                        "<div class='option' type='1'>" +
                            "<div class='icon' resp_table></div>" +
                            "<span class='tx'>Сумма баллов всех компетенций по всем группам, с учетом веса" +
                        "</div>" +

                        "<div class='option' type='2'>" +
                            "<div class='icon' resp_table></div>" +
                            "<span class='tx'>Сумма баллов по каждой компетенции, с учетом веса" +
                        "</div>" +

                        "<div class='option' type='3'>" +
                            "<div class='icon' resp_table></div>" +
                            "<span class='tx'>Отдельно по каждому индикатору, средняя * вес" +
                        "</div>" +

                        "<div class='option' type='4'>" +
                            "<div class='icon' resp_table></div>" +
                            "<span class='tx'>Сумма баллов по каждой компетенции, сложение взвешенных индикаторов." +
                        "</div>" +

                        "<div class='option' type='5'>" +
                            "<div class='icon' resp_table></div>" +
                            "<span class='tx'>Средняя по индикатору (цель - руководители)" +
                        "</div>" +

                        "<div class='option' type='8'>" +
                            "<div class='icon' resp_table></div>" +
                            "<span class='tx'>Средняя по индикатору (цель - окружение)" +
                        "</div>" +

                        "<div class='option' type='6'>" +
                            "<div class='icon' resp_table></div>" +
                            "<span class='tx'>Средняя по компетенции по каждой группе респондентов" +
                        "</div>" +

                        "<div class='option' type='7'>" +
                            "<div class='icon' resp_table></div>" +
                            "<span class='tx'>Средневзвешенная арифметическая, с весом" +
                        "</div>" +
                                "<div class='btn' load>Скачать таблицу</div>" +
                    "</div>" +
                "<div class='calculus_wnd'></div>" +

                "</div>";

            $res += "<div class='webchart'><canvas class='wc_focus_comcats'></canvas></div>";
            $res += "<br><br><br>";
            $res += "<div class='djohari_box'><canvas class='djo_graph'></canvas></div>";
            $res += "</div>";
            break;

        // ANSWERS TABLE
        case 4:
            if (["cat","qst"].indexOf($session.ans_table_style) === -1)
                message_ex("show","info","direct","Ошибка, не задан тип данных для вывода", null);
            else
            {
                let anst = group_report_data($session.opened_qz_ord, $session.opened_focus_ord);
                let focus_name = get_focuspers_name($session.opened_qz_ord, $session.opened_focus_ord);
                $res += "<div class='ans_table_box'>";
                $res += "<div class='head'>" +
                    $ad.qzs[$session.opened_qz_ord].name +
                    ": "+ focus_name + "</div>";

                // BTNS
                $res += "<table class='btn_box' pos='single'><tr>";
                $res += "<td><div class='btn' action='export_ans_table'>Скачать таблицу</div></td>";
                $res += "<td><div class='btn' action='back'>Назад</div></td>";
                $res += "</tr></table>";

                $res += "<table class='list'>";
                // HEAD
                $res += "<tr class='head'>";
                $res += "<td></td>";
                anst.comp_cats[0].cat_list.forEach(function (v_cat) {
                    $res += "<td>"+ v_cat.name +"</td>";
                });

                $res += "</tr>";
                if ($session.ans_table_style === "cat")
                {
                    anst.comp_cats.forEach(function (v_comp) {
                        $res += "<tr>";
                        $res += "<td>"+ v_comp.name +"</td>";
                        v_comp.cat_list.forEach(function (v_cat) {
                            $res += "<td>"+ v_cat.avg +"</td>";
                        });
                        $res += "</tr>";
                    });
                }
                else
                if ($session.ans_table_style === "qst")
                {
                    let AA = get_comp_cat_avg_of_focused($session.opened_qz_ord, $session.opened_focus_ord);
                    AA.forEach(function (v_comp) {
                        $res += "<tr>";
                        $res += "<td>"+ v_comp.name +"</td>";
                        v_comp.cat_list.forEach(function (v_cat) {
                            $res += "<td>"+ v_cat.avg +"</td>";
                        });
                        $res += "</tr>";

                        // qst of that comp
                        v_comp.qst_list.forEach(function (v_qst) {
                            $res += "<tr>";
                            $res += "<td class='qst_tx'>"+ v_qst.tx +"</td>";

                            v_qst.cat_list.forEach(function (v_qst_cat) {
                                $res += "<td>"+ v_qst_cat.avg +"</td>";
                            });
                            $res += "</tr>";
                        });

                    });
                }
                $res += "</table>";
                $res += "</div>";
            }

            break;
    }

    $res += "</div>";
    return $res
}
//----------------------------------------------------------------------------------------------------------------------
function group_report_data(qz_ord, focus_ord) // qz data for building dual_graph of comps (self v avg) and comps by cats graphs
{
    let qz = $ad.qzs[qz_ord];
    let grep = {};
    let cat_names_filled = false;
    grep.polar_comps = [];
    grep.comp_names_list = [];
    grep.cat_names_list = [];
    grep.comp_cats = [];

    let q_list = get_qbook_q_list(qz_ord, focus_ord);
    let comps_list = comps_list_from_qsts(q_list);

    // Get polar avg for each comp of entire quiz
    comps_list.forEach(function (v_comp, i_comp) {
        let comp = {};
        comp.id = v_comp.id;
        grep.comp_names_list.push(v_comp.name);
        comp.name = v_comp.name;
        comp.pts_self = 0;
        comp.pts_env = 0;
        comp.pts_div = 1;
        if (focus_ord === undefined)
            comp.pts_div = qz.resps.length; //qnt of groups to divide by

        qz.resps.forEach(function (v_group, i_group) {
            if (focus_ord === undefined || focus_ord === i_group) // filter by focus person, if set
            {
                let cats_list = cats_list_from_group(v_group);
                let comp_avgs = get_comp_cat_avg_of_focused(qz_ord, i_group);
                comp.pts_self += comp_avgs[i_comp].cat_list[0].avg; // Self cat stacking

                let pts_env = 0; // // Environment cats stacking (avg of them all)
                for (let q=1; q<cats_list.length; q++) // get summ of all environment pts
                {
                    /*
                    console.log("i_comp "+ i_comp);
                    console.log("q "+ q);
                    console.log("comp_avgs");
                    console.log(comp_avgs);
                    */
                    pts_env += comp_avgs[i_comp].cat_list[q].avg;
                }

                let env_cats_qnt = cats_list.length - 1;
                comp.pts_env += math_floor(pts_env / env_cats_qnt, 2); // get environment avg for tihs comp (inside this group)
            }
        });

        comp.pts_self = math_floor(comp.pts_self / comp.pts_div, 2);
        comp.pts_env = math_floor(comp.pts_env / comp.pts_div, 2);
        grep.polar_comps.push(comp);
    });

    //console.log(" --- calc group cats ---");
    let cats_list = cats_list_from_group(qz.resps, true); // get all different categories from all groups in this quiz
    // Get categories avgs for each comp of entire quiz
    comps_list.forEach(function (v_comp, i_comp) {
        let comp = {};
        comp.id = v_comp.id;
        comp.name = v_comp.name;
        comp.cat_list = [];
        comp.cat_div = 1;
        if (focus_ord === undefined)
            comp.cat_div = qz.resps.length; //qnt of groups to divide by

        cats_list.forEach(function (v_cat) {
            if (!cat_names_filled)
                grep.cat_names_list.push(v_cat.name);
            let cat = {};
            cat.id = v_cat.id;
            cat.name = v_cat.name;
            cat.avg = 0;
            comp.cat_list.push(cat);
        });
        cat_names_filled = true;

        //console.log(" --- comp "+i_comp+" cat list ---");
        //console.log(comp.cat_list);


        // Get avg of categories from all groups in this quiz
        qz.resps.forEach(function (v_group, i_group) {
            if (focus_ord === undefined || focus_ord === i_group) // filter by focus person, if set
            {
                let comp_avgs = get_comp_cat_avg_of_focused(qz_ord, i_group);
                // Add group's comp-cat points to each cat (to global stack)
                comp_avgs[i_comp].cat_list.forEach(function (v_cat, i_cat) {
                    comp.cat_list[i_cat].avg += v_cat.avg;
                });
            }
        });

        // all stacked pts in each cat we div by qnt of groups in this quiz
        cats_list.forEach(function (v_cat, i_cat) {
            comp.cat_list[i_cat].avg = math_floor(comp.cat_list[i_cat].avg / comp.cat_div, 2);
        });
        grep.comp_cats.push(comp);
    });

    //console.log(grep);
    return grep;
}
//----------------------------------------------------------------------------------------------------------------------
function content_analytics_comps_table(action, sorted) {
    let qz = $ad.qzs[$session.opened_qz_ord];
    //let qst_qnt = qz.settings.qst_list.length;
    let s = "";
    if (action === "add_events")
    {
        // Transition to online single report
        $(".resp_line .resp_link")
            .off("click")
            .click(function()
            {
                $session.opened_focus_ord = $(this).closest(".resp_line").attr("ord") *1;
                $new_qz.analyt_screen_id = 3;
                show_content("analytics");
            });

        // External link
        $(".resp_line .resp_rep_load")
            .off("click")
            .click(function()
            {
                let ord = $(this).closest(".resp_line").attr("ord") *1;
                $(".resp_line[ord='" + ord + "'] .resp_link").trigger("click");
                //alert("пока не внедрено");
            });

        $(".report_tables")
            .off("click")
            .click(function()
            {
                let type = $(this).attr("type") * 1;
                let group_ord = $(this).closest(".resp_line").attr("ord") * 1;

                switch (type)
                {
                    case 1:
                        report1_grades_summ($session.opened_qz_ord, group_ord, null);
                        break;

                    case 2:
                        report2_comps_summ($session.opened_qz_ord, group_ord, null);
                        break;

                    case 3:
                        report3_indicator($session.opened_qz_ord, group_ord);
                        break;

                    case 4:
                        report4_indic_by_roles($session.opened_qz_ord, group_ord);
                        break;

                    case 5:
                        report5_indicator($session.opened_qz_ord, group_ord, null);
                        break;

                    case 6:
                        report6_indicator_env($session.opened_qz_ord, group_ord, null);
                        break;

                    case 7:
                        report6_indicator_env($session.opened_qz_ord, group_ord, null);
                        break;
                }
            });


        // Force_un-complete qz
        $(".head .sorter")
            .off("click")
            .click(function()
            {
                let dir = $(this).attr("dir");
                console.log("dir " + dir);
                if (dir === "none")
                    dir = "desc";
                else
                if (dir === "desc")
                    dir = "asc";
                else
                if (dir === "asc")
                    dir = "none";
                $(this).attr("dir", dir);

                if(dir === "none")
                    content_analytics_comps_table("update_self");
                else
                {
                    let comp_ord = $(this).closest("td").attr("ord") * 1;
                    let attr = $(this).closest("td").attr("attr");
                    let to_sort = [];
                    let sorted = [];
                    console.log("comp_ord: "+comp_ord+" attr:" + attr);

                    // Labels
                    if (attr === "fio")
                        res_foc_comps.forEach(function (v_focus) {
                            to_sort.push(v_focus.fio);
                        });
                    else
                    if (attr === "avg")
                        res_foc_comps.forEach(function (v_focus) {
                            to_sort.push(v_focus.avg);
                        });
                    else
                    {
                        res_foc_comps.forEach(function (v_focus) {
                            to_sort.push(v_focus.comp_list[comp_ord].pts);
                        });
                    }

                    let sorted_vals = duplicate(to_sort.sort());
                    console.log("sorted_vals");
                    if (dir === "desc")
                        sorted_vals.reverse();
                    console.log(sorted_vals);


                    sorted_vals.forEach(function (val, i) {
                        sorted[to_sort.indexOf(val)] = i;
                    });
                    console.log("sorted");
                    console.log(sorted);

                    if (sorted.length)
                        content_analytics_comps_table("sorted", sorted);
                    else
                        content_analytics_comps_table("update_self");
                }

            });



    }
    if (action === "sorted")
    {
        let html_rows_list = []; // sorted is a list of ords of rows in some order, we take thml of that rows and reload the table with them inside in that order
        $(".comps_table .resp_line").each(function (index) {
            let ord = $(this).attr("ord") * 1;
            if (sorted.length && sorted.indexOf(ord) !== -1)
            {
                html_rows_list[sorted.indexOf(ord)] = $(this)[0];
                $(this).remove();
            }
            else
                $(this).css("display","none");
        });

        let table = $(".comps_table");

        if (html_rows_list.length)
            html_rows_list.forEach(function (v_row_html, i) {
                table.append(v_row_html);
            });

        content_analytics_comps_table("add_events");
    }
    else
    {
        let q_list;
        if ($session.opened_focus_ord || 0 === $session.opened_focus_ord)
            q_list = get_qbook_q_list($session.opened_qz_ord, $session.opened_focus_ord);
        else
            q_list = get_qbook_q_list($session.opened_qz_ord, 0);

        let comps_list = comps_list_from_qsts(q_list);
        if (comps_list === null)
            s += "<tr class='head'><td>Нет данных</td></tr>";
        else
        {
            // Head
            s += "<tr class='head'>" +
                "<td attr='fio'>Фокус-персона<div class='sorter' dir='none'></div></td>";
            /*
            comps_list.forEach(function (v_slot, i_slot) {
                s += "<td ord='"+ i_slot +"' attr='comp'>"+ v_slot.name +"<div class='sorter' dir='none'></div></td>";
            });
            s += "<td ord='"+ comps_list.length +"' attr='avg'>Среднее<div class='sorter' dir='none'></div></td>";
            */
            s += "<td>Скачать</td></tr>";

            // Body
            let comp_avgs_list = calc_comps_avgs($session.opened_qz_ord, "overwrite");
            comp_avgs_list.forEach(function (v_focus, i_focus) {
                s += "<tr class='resp_line' ord='"+i_focus+"'>";
                    s += "<td class='resp_link'>" + fio_abbrev(v_focus.fio) + "</td>"; // FIO
                /*
                    v_focus.comp_list.forEach(function (v_comp) {
                        s += "<td>" + v_comp.pts + "</td>";
                    });

                    s += "<td>" + v_focus.avg + "</td>"; // AVG
                */
                    s += "<td>" +
                        "<div class='resp_rep_load'></div>" +
                        "</td>"; // REPORT download
                s += "</tr>";
            });
        }

        // Output type
        if (action === "get_html")
            return s;
        else
        if (action === "update_self")
        {
            $(".analytics_box .comps_table")
                .empty()
                .append(s);
            content_analytics_comps_table("add_events");
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function generate_report($data, $tags) {
    //let self_is_in_avg = false;
    let qz_ord = $data.qz_ord;
    let focus_ord = $data.focus_ord;

    let form = {};
    form.res = get_comp_cat_avg_of_focused(qz_ord, focus_ord);
    form.djo_avg = get_djohari_avg_point(qz_ord, focus_ord);
    // Get standart entropy
    let pts_list = [];
    form.res.forEach(function (v_comp) {
        pts_list.push(v_comp.avg);
    });
    form.std_entropy = get_standart_entropy(pts_list, form.djo_avg.mid);
    form.edge_low = form.djo_avg.mid - form.std_entropy;
    form.edge_high = form.djo_avg.mid + form.std_entropy;
    form.scale_id = $ad.qzs[$session.opened_qz_ord].settings.scale_id;
    form.calc_type = single_report.calc_type;

    // $ad.qzs[0].settings.start_date
    let qz = $ad.qzs[qz_ord];
    form.start_date = qz.settings.start_date;
    form.end_date = qz.settings.end_date;
    form.table = $(".calculus");
    form.table = form.table[0].outerHTML;
    form.is_djo = $(".calculus_box .title_options input[action='djo']").prop("checked") * 1;


    if ($tags === "open")
    {
        $(".floater")
            .css("display", "inline-block")
            .css("width", "400px")
            .css("height", "250px")
            .css("text-align", "center")
            .css("font-size", "30px")
            .css("left", ((window.innerWidth/2)-200)+"px")
            .css("top", "400px")
            .css("border-color", "#4A67AD")
            .html("Подготовка загрузки отчета, пожалуйста подождите...");
        console.log("load_single_report data");
    }

    //console.log(form);
    let focus_name = get_focuspers_name(qz_ord, focus_ord);
    console.log(form);

    // Save report info to a server file with unique key, and get the key
    sendAJ("single_report_datastore", JSON.stringify(form), {focus_name: focus_name, pers_id: $pers.id, tag: $tags});
}
//----------------------------------------------------------------------------------------------------------------------
function generate_comments_report($tags) {
    //let self_is_in_avg = false;
    let qz_ord = $session.opened_qz_ord;
    let focus_ord = $session.opened_focus_ord;
    let qz = $ad.qzs[qz_ord];
    let focus_name = get_focuspers_name(qz_ord, focus_ord);

    let form = {};
    form.start_date = qz.settings.start_date;
    form.end_date = qz.settings.end_date;
    form.comments = bld_table_comments();

    if ($tags === "open")
    {
        $(".floater")
            .css("display", "inline-block")
            .css("width", "400px")
            .css("height", "250px")
            .css("text-align", "center")
            .css("font-size", "30px")
            .css("left", ((window.innerWidth/2)-200)+"px")
            .css("top", "400px")
            .css("border-color", "#4A67AD")
            .html("Подготовка загрузки отчета, пожалуйста подождите...");
        console.log("load_comments_report data");
    }
    //console.log(form);

    // Save report info to a server file with unique key, and get the key
    sendAJ("comment_report_datastore", JSON.stringify(form), {focus_name: focus_name, pers_id: $pers.id, tag: $tags});
}
//----------------------------------------------------------------------------------------------------------------------
function batch_reports_handle ($action, $data) {
    if ($action === "gen_focus_images")
    {
        single_report.images = [];
        single_report.images_max = 2;
        let stylez = "style='visibility: hidden; width: 1000px; height: 600px;'";
        let $res = "<div "+stylez+" class='webchart'><canvas class='wc_focus_comcats'></canvas></div>";
        $res += "<div "+stylez+" class='djohari_box'><canvas class='djo_graph'></canvas></div>";
        $("body").append($res);

        let report_data = group_report_data($data.qz_ord, $data.focus_ord);
        draw_graph(report_data, {"style": "web"});
        //report_data = group_report_data($session.opened_qz_ord, $session.opened_focus_ord);
        draw_graph(report_data, {"style": "djohari"});

        console.log("2) tasked images generation");
    }
    else
    if ($action === "gen_focus_report")
    {
        if (batch_reports.img_rdy)
        {
            // clear the created image canvases
            $("body .webchart").remove();
            $("body .djohari_box").remove();
            console.log("4) images done - tasked report generation");
            // STEP 2 - generate report, add it's name to the batch list to archive them all later
            generate_report({qz_ord: $data.qz_ord, focus_ord: batch_reports.cur}, "save");
            //clearInterval(batch_reports.interval);
            batch_reports.img_rdy = false;
        }
    }
}


//----------------------------------------------------------------------------------------------------------------------
function folder_filter_events() {

    $(".btn_sort_dir")
        .off("mouseup").mouseup(function () {
        folder_block = false;
        }).off("mousedown").mouseup(function () {
            folder_block = true;
        })
        .off("click")
        .click(function () {

            let folder_ord = $(this).closest(".item_folder").attr("ord") * 1;
            let dir = $(this).attr("dir") * 1;
            dir = Math.abs(dir - 1);
            $(this).attr("dir", dir);

            let names_list = [];
            let sorted_names_list;
            let new_indexes_ord = [];
            let blocks_list = [];

            let last_folder_index = 0;

            // Collect all lines on top level
            $(".item[folder_ord='"+ folder_ord +"']").each(function () {
                let L = $(this)[0];
                names_list.push(L.innerHTML);
                blocks_list.push(L.outerHTML);
            });

            sorted_names_list = duplicate(names_list);
            sorted_names_list.sort();
            if (dir)
                sorted_names_list.reverse();
            // rework indexes
            sorted_names_list.forEach(function (v_name) {
                let found = false;
                for (let i=0; i<names_list.length; i++)
                    if (names_list[i] === v_name)
                    {
                        new_indexes_ord.push(i);
                        break;
                    }
            });

            $(".item[folder_ord='"+ folder_ord +"']").remove();
            let sorted_html = "";
            new_indexes_ord.forEach(function (v_ind) {
                sorted_html += blocks_list[v_ind];
            });
            $(".item_folder[ord='"+ folder_ord +"']").after(sorted_html);

            console.log("btn_sort_dir " + folder_ord);
            folder_filter_events();
        });

    // show a picked quiz's results
    $(".roster .item")
        .off("mousedown")
        .mousedown(function () {

            $curs.an_fold = {};
            $curs.an_fold.qz_ord = $(this).attr("ord") * 1;
            $(this).css("background-color", "#A6EADB");
        })
        .off("click")
        .click(function () {
            $session.opened_qz_ord = $(this).attr("ord") * 1;
            show_content($nav.screen);
        });

    $(".item_folder")
        .off("mouseenter")
        .mouseenter(function () {
            if ($curs.hasOwnProperty("an_fold"))
            {
                $(this).css("background-color", "#A6DCEA");
                $curs.an_fold.folder_ord = $(this).attr("ord") * 1;
            }
        })
        .off("mouseleave")
        .mouseleave(function () {
            if ($curs.hasOwnProperty("an_fold"))
            {
                $(this).css("background-color", "inherit");
                delete $curs.an_fold.folder_ord;
            }
        })

        .off("click")
        .click(function () {
            if (!folder_block) // anti-doubling of actions - sorting and folding
            {
                console.log("item_folder event fire ");
                let is_folded = $(this).attr("is_folded") * 1;
                is_folded = Math.abs(is_folded - 1);
                $(this).attr("is_folded", is_folded);

                let folder_list = $pers.an_folders[$(this).attr("ord")*1].list;

                if (folder_list.length)
                    $(".roster .item").each(function () {
                        let qz_id = $ad.qzs[$(this).attr("ord") * 1].id;
                        if (folder_list.indexOf(qz_id) !== -1)
                        {
                            if (is_folded)
                                $(this).css("display", "none");
                            else
                                $(this).css("display", "block");
                        }
                    });
            }
        });


}
//----------------------------------------------------------------------------------------------------------------------
function content_analytics_events() {
    if ($session.opened_qz_ord !== null) {
        if ($new_qz.analyt_screen_id === 1) // base list screen events
        {
            content_analytics_comps_table("add_events");

            // report downloader
            $(".btn_box[pos='up'] .btn")
                .off("click")
                .click(function () {
                    let action = $(this).attr("action");
                    if (action === "group_report")
                    {
                        $new_qz.analyt_screen_id = 2;
                        show_content("analytics");
                    }
                    else
                    if (action === "load_data_table")
                    {
                        let form = {};
                        let qz = $ad.qzs[$session.opened_qz_ord];
                        form.name = "Таблица_данных_["+ qz.name +"] " + get_time("date_filename");
                        form.table = [];
                        // FILL HEAD -----------------------------------------------------------
                        let line = ["Фокус-персона"];
                        let comp_list = comps_list_from_qsts(qz.settings.qst_list);
                        comp_list.forEach(function (v_comp) {
                            line.push(v_comp.name);
                        });
                        line.push("Среднее");
                        form.table.push(line);
                        // FILL BODY -----------------------------------------------------------
                        let comp_avgs_list = calc_comps_avgs($session.opened_qz_ord, null);
                        comp_avgs_list.forEach(function (v_focus) {
                            line = [fio_abbrev(v_focus.fio)];
                            v_focus.comp_list.forEach(function (v_comp) {
                                let val = v_comp.pts.toString().replace(/\./, ",");
                                line.push( val );
                            });
                            let val = v_focus.avg.toString().replace(/\./, ",");
                            line.push(val);
                            form.table.push(line);
                        });

                        sendAJ("to_excell", JSON.stringify(form));
                    }
                    else
                    if (action === "load_batch_reports")
                    {
                        message_ex("show","holder","direct","Производится рисование графиков, генерация отчетов и их упаковывание.<br>Пожалуйста, ожидайте.");

                        // Set the line, start with focus resp 0
                        batch_reports.qnt = $ad.qzs[$session.opened_qz_ord].resps.length;
                        batch_reports.cur = 0;
                        batch_reports.img_rdy = false;
                        $(".sys_mes[id="+$sys_mes_ind+"] .cont .updater").html("<br>Прогресс 0 из " + batch_reports.qnt);
                        console.log("1) tasked images generation");
                        // Interval to check when the images are ready
                        /*
                        batch_reports.interval = setInterval(function () {
                            batch_reports_handle ("gen_focus_report",{qz_ord: $session.opened_qz_ord});
                        }, 500);
                        */

                        // STEP 1 - task to gen images
                        batch_reports_handle ("gen_focus_images",{qz_ord: $session.opened_qz_ord, focus_ord: batch_reports.cur});
                        //generate_report({qz_ord: $session.opened_qz_ord, focus_ord: batch_reports.cur}, "save");
                        //sendAJ("to_excell", JSON.stringify(form));
                    }

                });
        }
        else
        if ($new_qz.analyt_screen_id === 2) // redraw group graphs
        {
            let report_data = group_report_data($session.opened_qz_ord);
            draw_graph(report_data, {"style": "polar_comps"});
            draw_graph(report_data, {"style": "comps_of_cats"});

            // report doownloader
            $(".btn_box[pos='group'] .btn")
                .off("click")
                .click(function () {
                    let action = $(this).attr("action");
                    if (action === "load_group_report")
                    {
                        if (group_report.images.length < group_report.images_max)
                            message_ex("show","info","direct","Отчет все еще формируется, повторите действие через 5-10 сек.");
                        else
                        {
                            let qz =  $ad.qzs[$session.opened_qz_ord];
                            let comps_list = comps_list_from_qsts(qz.settings.qst_list);
                            window.open(PATH + "report_group_download.php?pers_id="+$pers.id +"&name=" + qz.name + "&qnt=" + comps_list.length);
                        }
                    }
                    else
                    if (action === "back")
                    {
                        $new_qz.analyt_screen_id = 1;
                        show_content("analytics");
                    }
                });
        }
        else
        if ($new_qz.analyt_screen_id === 3) // single report events
        {
            let report_data = group_report_data($session.opened_qz_ord, $session.opened_focus_ord);
            if (single_report.calc_type === 2)
                draw_graph(report_data, {"style": "polar_comps"});
            else
                draw_graph(report_data, {"style": "web"});

            report_data = group_report_data($session.opened_qz_ord, $session.opened_focus_ord);
            draw_graph(report_data, {"style": "djohari"});

            // report doownloader
            $(".btn_box[pos='group'] .btn")
                .off("click")
                .click(function () {
                    let action = $(this).attr("action");
                    if (action === "load_single_report")
                    {
                        if (single_report.images.length < single_report.images_max)
                            message_ex("show","info","direct","Отчет все еще подготавливается, повторите действие через 5-10 сек.");
                        else
                        if (null === single_report.calc_type)
                            message_ex("show","info","direct","Сначала выберите тип расчета, который пойдет в создаваемый отчет.");
                        else
                        {
                            generate_report({qz_ord: $session.opened_qz_ord, focus_ord: $session.opened_focus_ord}, "open");
                            /*
                            let focus_name = get_focuspers_name($session.opened_qz_ord, $session.opened_focus_ord);
                            window.open(PATH + "report_single_download.php?pers_id="+$pers.id + "&name=" + focus_name);
                            */
                        }
                    }
                    if (action === "load_comments_report")
                    {
                        generate_comments_report("open");
                    }
                    else

                    if (action === "load_ipr")
                    {
                        let form = {};
                        form.qz_iid = $session.opened_qz_ord;
                        form.focus_ord = $session.opened_focus_ord;
                        form.fio = get_qz_owner_fio();
                        sendAJ("store_ipr_info", JSON.stringify(form));
                    }
                    else
                    if (action === "ans_table_cat" || action === "ans_table_qst")
                    {
                        if (action === "ans_table_cat")
                            $session.ans_table_style = "cat";
                        else
                            $session.ans_table_style = "qst";
                        $new_qz.analyt_screen_id = 4;
                        show_content("analytics");
                    }
                    if (action === "group_fb")
                    {
                        content_feedback("show", $session.opened_qz_ord, $session.opened_focus_ord);
                    }
                    else
                    if (action === "back")
                    {
                        $new_qz.analyt_screen_id = 1;
                        //last_fb_opened.batch_ord = null;
                        show_content("analytics");
                    }
                });


            $(".calculus_box .option .tx").off("click")
                .click(function () {
                    single_report.targ_qb_id = null;
                    let type = $(this).closest(".option").attr("type") * 1;
                    single_report.calc_type = type;
                    let group_ord = $session.opened_focus_ord;
                    let is_targeted = $(".calculus_box .title_options input[action='goal']").prop("checked");

                    $(".calculus_box .option .tx").css("font-weight","normal");
                    $(this).css("font-weight","bold");

                    if (!is_targeted || [3,4].indexOf(type) !== -1)
                    {
                        open_report(type, $session.opened_qz_ord, group_ord, null);
                        redraw_graph_for_calctype();
                    }

                    else
                        message_ex("show", "target_qb_select", "target_qb_select", {
                            type: type,
                            subtype: "admin",
                            qz_ord: $session.opened_qz_ord,
                            group_ord: group_ord});
                });

            $(".calculus_box .option .icon").off("click")
                .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
                .mouseenter(function()
                {
                    floater_hint("show",{
                        head: "Таблица для респондента",
                        tx: "Показать таблицу данных, в формате для респондента.",
                        w: 400,
                        dx: 0,
                        dy: 30,
                    });
                })
                .click(function () {
                    single_report.targ_qb_id = null;
                    let type = $(this).closest(".option").attr("type") * 1;
                    single_report.calc_type = type;
                    let group_ord = $session.opened_focus_ord;
                    let is_targeted = $(".calculus_box .title_options input[action='goal']").prop("checked");

                    $(".calculus_box .option .tx").css("font-weight","normal");
                    $(this).closest(".option").find(".tx").css("font-weight","bold");

                    if (!is_targeted || [3,4].indexOf(type) !== -1)
                    {
                        open_report_resp(type, $session.opened_qz_ord, group_ord, null);
                        redraw_graph_for_calctype();
                    }
                    else
                        message_ex("show", "target_qb_select", "target_qb_select", {
                            type: type,
                            subtype: "resp",
                            qz_ord: $session.opened_qz_ord,
                            group_ord: group_ord});
                });

            $(".single_report_box .head .icon").off("click")
                .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
                .mouseenter(function()
                {
                    let gr = $ad.qzs[$session.opened_qz_ord].resps[$session.opened_focus_ord];
                    let tx = "";
                    let cat_name = {
                        0: "самооценка",
                        1: "смежная команда",
                        3: "коллеги",
                        4: "руководители",
                        5: "подчиненные"
                    };
                    if (gr.length)
                        gr.forEach(function (v_resp, i) {
                            let fio = get_resp_ord_from_resp_id(v_resp.id);
                            fio = "<strong>" + $ad.resps[fio].fio + "</strong>";
                            let str = (i + 1) + ") " + fio +" ("+ cat_name[v_resp.cat_id] +")";
                            switch (v_resp.cat_id)
                            {
                                case 0: str = "<span style='color: #7c1c1e;'>" + str + "</span>";break;
                                case 3: str = "<span style='color: #377c3b;'>" + str + "</span>";break;
                                case 4: str = "<span style='color: #a536ae;'>" + str + "</span>";break;
                                case 5: str = "<span style='color: #35397c;'>" + str + "</span>";break;
                                case 1: str = "<span style='color: #487c78;'>" + str + "</span>";break;
                            }

                            if (!tx)
                                tx = str;
                            else
                                tx += "<br>" + str;
                        });

                    floater_hint("show",{
                        head: "Список опрашиваемых",
                        tx: tx,
                        w: 500,
                        dx: -250,
                        dy: 30,
                    });
                });


            $(".calculus_box  .title_options input[action='shrink']").off("click")
                .click(function () {
                    shrink_is_on = $(this).prop("checked");
                });
        }
        else
        if ($new_qz.analyt_screen_id === 4) // single report, results tables
        {
            // report doownloader
            $(".btn_box[pos='single'] .btn")
                .off("click")
                .click(function () {
                    let action = $(this).attr("action");
                    if (action === "back")
                    {
                        $new_qz.analyt_screen_id = 3;
                        //last_fb_opened.batch_ord = null;
                        show_content("analytics");
                    }
                    else
                    if (action === "export_ans_table")
                    {
                        let form = {};
                        let qz = $ad.qzs[$session.opened_qz_ord];
                        let focus_name = get_focuspers_name($session.opened_qz_ord, $session.opened_focus_ord);
                        form.name = "";
                        if ($session.ans_table_style === "cat")
                            form.name += "360_данные_по_категориям";
                        else
                        if ($session.ans_table_style === "qst")
                            form.name += "360_данные_по_вопросам";

                        form.name += "_["+ focus_name +"] " + get_time("date_filename"); // + qz.name +"_"
                        form.table = [];
                        $(".ans_table_box .list tr").each(function (z) {
                            let line = [];
                            $(this).find("td").each(function (i) {
                                let val = $(this).html().toString();
                                if (i)
                                    val = val.replace(/\./, ",");
                                line.push(val);
                            });
                            form.table.push(line);
                        });
                        //console.log(form);
                        sendAJ("to_excell", JSON.stringify(form));
                    }
                });
        }
    }



    // Force_un-complete qz
    $(".subhead .force_complete")
        .off("click")
        .click(function () {
            let action_tx = "Вы действительно хотите активировать опрос?<br><br>" +
                "<b>Внимание,</b> используйте данное действие только если по ошибке завершили опрос досрочно, <br>" +
                "в то время, как дата конца опроса еще не наступила и не все респонденты прошли опрос.";
            message_ex("show", "confirm", "direct_full", {
                "head": "Изменение статуса опроса",
                "tx": action_tx,
                "qz_new_status": 0
            }, "force_qz_status");
        });

    // Force_un-complete qz
    $(".analytics_box .search")
        .off("change")
        .off("keyup")
        .keyup(function () {
            $(this).trigger("change");
        })
        .change(function () {
            let tx = $(this).val();
            let sorted = [];

            if (tx)
                res_foc_comps.forEach(function (v_focus, i_focus) {
                    if (v_focus.fio.search(tx) !== -1)
                        sorted.push(i_focus);
                });
            if (sorted.length)
                content_analytics_comps_table("sorted", sorted);
            else
                content_analytics_comps_table("update_self");
        });

    // scrollTop: 0
    $(".gotop_btn")
        .off("click")
        .click(function () {
            $('html, body').animate({
                scrollTop: 0
            }, 2000);

        });


    $(".res_filter")
        .off("change")
        .change(function () {
            let text = $(this).val();

            // If anything is entered
            if (text && " " !== text)
            {
                // date based search
                if (text[0] === "#")
                {
                    text = text.substring(1);
                    // range based search
                    if (text.indexOf("-") !== -1)
                    {
                        text = text.split("-"); // [0] - date from, [1] - date to

                        let date_from = text[0].split(".");
                        date_from.forEach(function (v,i) {
                            date_from[i] *= 1;
                        });
                        date_from = timestamp_from_date(date_from, false);

                        let date_to = text[1].split(".");
                        date_to.forEach(function (v,i) {
                            date_to[i] *= 1;
                        });
                        date_to = timestamp_from_date(date_to, false);
                        /*
                        console.log("date_from/to ", {
                            date_from: date_from,
                            date_to: date_to
                        });
                        */

                        $(".roster .item").each(function () {
                            //let name = $(this).html();
                            let qz_ord = $(this).attr("ord");
                            let qz_date = $ad.qzs[qz_ord].settings.start_date;

                            let vis_type =  $(this).css("display");
                            let last_seen = $(this).attr("last_seen") * 1;

                            let date_match = false;


                            if (qz_date >= date_from && qz_date <= date_to) // text matches
                            {
                                if (1 === last_seen)
                                    $(this).css("display", "block").attr("last_seen", 0); // show only what was hidden before
                            }
                            else
                            {
                                if ("block" === vis_type)
                                    $(this).css("display", "none")
                                        .attr("last_seen", 1); // hide and mark as hidden by this func
                            }

                        });
                    }
                    // single date based search
                    else
                    {
                        text = text.split(".");
                        let match_parts = text.length;

                        //console.log("qz search date", text);

                        $(".roster .item").each(function () {
                            //let name = $(this).html();
                            let qz_ord = $(this).attr("ord") * 1;
                            let qz_date = $ad.qzs[qz_ord].settings.start_date;
                            let D = new Date();
                            D.setTime(qz_date * 1000);
                            let Yer = D.getFullYear().toString();
                            let Mon = (D.getMonth() + 1).toString();
                            if (1 === Mon.length)
                                Mon = "0" + Mon;
                            let Dat = D.getDate().toString();
                            if (1 === Dat.length)
                                Dat = "0" + Dat;

                            /*
                            console.log("qz date",{
                                ord: qz_ord,
                                d: Dat,
                                m: Mon,
                                y: Yer
                            });
                            */

                            let vis_type =  $(this).css("display");
                            let last_seen = $(this).attr("last_seen") * 1;

                            let date_match = false;

                            switch (match_parts) {
                                case 3:
                                    if (Yer === text[2] &&
                                        Mon === text[1] &&
                                        Dat === text[0] )
                                        date_match = true;
                                    break;

                                case 2:
                                    if (Yer === text[1] &&
                                        Mon === text[0])
                                        date_match = true;
                                    break;

                                case 1:
                                    if (Yer === text[0])
                                        date_match = true;
                                    break;
                            }

                            if (date_match) // text matches
                            {
                                if (1 === last_seen)
                                    $(this).css("display", "block").attr("last_seen", 0); // show only what was hidden before
                            }
                            else
                            {
                                if ("block" === vis_type)
                                    $(this).css("display", "none")
                                        .attr("last_seen", 1); // hide and mark as hidden by this func
                            }

                        });
                    }
                }
                // text based serxh
                else
                {
                    $(".roster .item").each(function () {
                        let name = $(this).html();
                        let vis_type =  $(this).css("display");
                        let last_seen = $(this).attr("last_seen") * 1;

                        if (name.indexOf(text) !== -1) // text matches
                        {
                            if (1 === last_seen)
                                $(this).css("display", "block").attr("last_seen", 0); // show only what was hidden before
                        }

                        else
                        {
                            if ("block" === vis_type)
                                $(this).css("display", "none")
                                    .attr("last_seen", 1); // hide and mark as hidden by this func
                        }

                    });
                }
            }
            else
            {
                $(".roster .item").each(function () {
                    let last_seen = $(this).attr("last_seen") * 1;
                    if (1 === last_seen)
                    {
                        $(this).css("display", "block").attr("last_seen", 0); // show all hidden before
                    }

                });


            }
        });

    $(".btn_add_folder")
        .off("mouseenter")
        .mouseenter(function () {
            if ($curs.hasOwnProperty("an_fold"))
            {
                // qz_unfolder.png
                $(this).attr("unfolder", 1);
                $curs.an_fold.unfold = true;
            }
        })
        .off("mouseleave")
        .mouseleave(function () {
            if ($curs.hasOwnProperty("an_fold"))
            {
                $(this).attr("unfolder", 0);
                delete $curs.an_fold.unfold;
            }
        })
        .off("click")
        .click(function () {
            message_ex("show","insert","an_folder",null);
        });

    $(".btn_sort")
        .off("click")
        .click(function () {
            let dir = $(this).attr("dir") * 1;
            dir = Math.abs(dir - 1);
            $(this).attr("dir", dir);

            let names_list = [];
            let sorted_names_list;
            let new_indexes_ord = [];
            let blocks_list = [];

            let last_folder_index = 0;

            // Collect all lines on top level
            $(".an_line").each(function () {
                let L = $(this)[0];
                let owner = L.classList[0];
                let is_sibling = false;
                let is_folded = false; //L.attributes[2].split("=");

                if ("item" === L.classList[0] && undefined !== $(this).attr("is_folded"))
                    is_sibling = true;

                let c_name = L.className;
                if (!$(this).attr("is_folded") || c_name.indexOf("item_folder") !== -1) // is a folder or a quiz on root level
                {
                    if ("item_folder" === owner)
                    {
                        blocks_list.push(L.outerHTML);
                        last_folder_index = blocks_list.length - 1;
                        names_list.push(L.innerHTML);
                    }
                    else
                    if (is_sibling)
                        blocks_list[last_folder_index] += L.outerHTML; // make children of folder come with them in wholde chunk of html
                    else // root level quizes
                    {
                        blocks_list.push(L.outerHTML);
                        names_list.push(L.innerHTML);
                    }
                }
            });

            sorted_names_list = duplicate(names_list);
            sorted_names_list.sort();
            if (dir)
                sorted_names_list.reverse();
            // rework indexes
            sorted_names_list.forEach(function (v_name) {
                let found = false;
                for (let i=0; i<names_list.length; i++)
                    if (names_list[i] === v_name)
                    {
                        new_indexes_ord.push(i);
                        break;
                    }
            });

            $(".an_line").remove();
            let sorted_html = "";
            new_indexes_ord.forEach(function (v_ind) {
                sorted_html += blocks_list[v_ind];
            });
            $(".utils_box").after(sorted_html);
            folder_filter_events();
        });


    folder_filter_events()




}


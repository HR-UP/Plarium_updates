let block_calculus_update = false;
//   -------------------------------------------------------------------------------------------------------------------
function calculus_ans_is_valid(src) {
    return (src * 1 !== -1 && src * 1 !== 0);
}
//   -------------------------------------------------------------------------------------------------------------------
function calculus_reformat_values() {

    function value_is_absent(val)
    {
        return (["null","NaN%"].indexOf(val) !== -1);
    }

    $(".calculus td").each(function () {
        let val = $(this).html();
        if (value_is_absent(val))
            $(this).html("<span style='font-size: 12px;'>нет данных</span>");
        else
        if (val && !isNaN(val * 1))
        {
            let v = math_floor(val, 2).toString();
            v = v.replace(/\./g, ",");
            if ("0" === v)
                v = "";
            $(this).html(v);
        }
        else
            $(this).find("span").each(function () {
                val = $(this).html();
                if (value_is_absent(val))
                    $(this).html("<span style='font-size: 12px;'>нет данных</span>");
                else
                if (val && !isNaN(val * 1))
                {
                    let v = math_floor(val, 2).toString();
                    v = v.replace(/\./g, ",");
                    if ("0" === v)
                        v = "";
                    $(this).html(v);
                }
            });
    });
}
//   -------------------------------------------------------------------------------------------------------------------
function get_report_results(type, qz_ord, group_ord, targ_qb_id)
{
    block_calculus_update = true;
    let x;
    switch (type)
    {
        case 1:
            x = report1_grades_summ(qz_ord, group_ord, targ_qb_id);
            break;

        case 2:
            x = report2_comps_summ(qz_ord, group_ord, targ_qb_id);
            break;

        case 3:
            x = report3_indicator(qz_ord, group_ord);
            break;

        case 4:
            x = report4_indic_by_roles(qz_ord, group_ord);
            break;

        case 5:
            x = report5_indicator(qz_ord, group_ord, targ_qb_id);
            break;

        case 6:
            x = report6_indicator_env(qz_ord, group_ord, targ_qb_id);
            break;

        case 7:
            x = report7_avg_wg(qz_ord, group_ord, targ_qb_id);
            break;

        case 8:
            x = report8_indicator(qz_ord, group_ord, targ_qb_id);
            break;
    }
    block_calculus_update = false;
    return x;
}
//   -------------------------------------------------------------------------------------------------------------------
function open_report(type, qz_ord, group_ord, targ_qb_id, is_comments) {
    switch (type)
    {
        case 1:
            report1_grades_summ(qz_ord, group_ord, targ_qb_id);
            break;

        case 2:
            report2_comps_summ(qz_ord, group_ord, targ_qb_id);
            break;

        case 3:
            report3_indicator(qz_ord, group_ord);
            break;

        case 4:
            report4_indic_by_roles(qz_ord, group_ord);
            break;

        case 5:
            report5_indicator(qz_ord, group_ord, targ_qb_id);
            break;

        case 6:
            report6_indicator_env(qz_ord, group_ord, targ_qb_id);
            break;

        case 7:
            report7_avg_wg(qz_ord, group_ord, targ_qb_id);
            break;

        case 8:
            report8_indicator(qz_ord, group_ord, targ_qb_id);
            break;
    }

    calculus_reformat_values();

    // Export to table with styles and colspans
    $(".calculus_box .btn[load]")
        .css("display", "block")
        .off("click")
        .click(function () {
            let add_comments = $(".calculus_box .title_options input[action='comments']").prop("checked");
            if (add_comments)
            {
                let comm_table = $(".group_fb_box");

                if (!comm_table.length) // if there is no table - construct it
                {
                    console.log("reconstruct table");
                    content_feedback("show", $session.opened_qz_ord, $session.opened_focus_ord); // rebuild table, hide all else, show table

                    // Hide back table, show back all else
                    $(".group_fb_box").css("display","none");

                    $(".calculus_box").css("display","block");
                    $(".webchart").css("display","block");
                    $(".djohari_box").css("display","block");
                }
                else
                    console.log("there is a table table");

                let list_of_comments = bld_comments();
                if (list_of_comments)
                {
                    let s = "";
                    list_of_comments.forEach(function (v_line) {
                        s += "<tr type='new'><td>"+ v_line +"</td></tr>";
                    });

                    $(".calculus").append(s);
                }
            }

            $(".calculus").table2excel({
                exclude:".noExl",
                name:"Report table (resp)",
                filename:"Таблица_данных_[" + get_qz_owner_fio() + "]",
                fileext:".xls",
                preserveColors:true
            });

            $(".calculus tr[type='new']").remove();
        });
}
//   -------------------------------------------------------------------------------------------------------------------
function open_report_resp(type, qz_ord, group_ord, targ_qb_id, is_comments) {
    switch (type)
    {
        case 1:
            report1_grades_summ_resp(qz_ord, group_ord, targ_qb_id);
            break;

        case 2:
            report2_comps_summ_resp(qz_ord, group_ord, targ_qb_id);
            break;

        case 3:
            report3_indicator_resp(qz_ord, group_ord);
            break;

        case 4:
            report4_indic_by_roles_resp(qz_ord, group_ord);
            break;

        case 5:
            report5_indicator_resp(qz_ord, group_ord, targ_qb_id);
            break;

        case 6:
            report6_indicator_env_resp(qz_ord, group_ord, targ_qb_id);
            break;

        case 7:
            report7_avg_wg_resp(qz_ord, group_ord, targ_qb_id);
            break;

        case 8:
            report8_indicator_resp(qz_ord, group_ord, targ_qb_id);
            break;
    }

    calculus_reformat_values();

    // Export to table with styles and colspans
    $(".calculus_box .btn[load]")
        .css("display", "block")
        .off("click")
        .click(function () {
            let add_comments = $(".calculus_box .title_options input[action='comments']").prop("checked");
            if (add_comments)
            {
                let comm_table = $(".group_fb_box");

                if (!comm_table.length) // if there is no table - construct it
                {
                    console.log("reconstruct table");
                    content_feedback("show", $session.opened_qz_ord, $session.opened_focus_ord); // rebuild table, hide all else, show table

                    // Hide back table, show back all else
                    $(".group_fb_box").css("display","none");

                    $(".calculus_box").css("display","block");
                    $(".webchart").css("display","block");
                    $(".djohari_box").css("display","block");
                }
                else
                    console.log("there is a table table");

                let list_of_comments = bld_comments();
                if (list_of_comments)
                {
                    let marked = ["- Коллеги -","- Самооценка -","- Руководители -","- Подчиненные -"];
                    let s = "";
                    list_of_comments.forEach(function (v_line) {

                        s += "<tr type='new'>";
                        if (marked.indexOf(v_line) !== -1)
                            s += "<td style='color: #4682e2; font-weight: bold;'>";
                        else
                            s += "<td>";
                        s += v_line;

                        s += "</td>";
                        s += "</tr>";
                    });

                    $(".calculus").append(s);
                }
            }

            //let html = $(".calculus").html();
            //html = html.replace(/./g, ",");
            //$(".calculus").html(html);

            $(".calculus").table2excel({
                exclude:".noExl",
                name:"Report table (resp)",
                filename:"Таблица_данных_[" + get_qz_owner_fio() + "]",
                fileext:".xls",
                preserveColors:true
            });

            //html = html.replace(/,/g, ",");
            //$(".calculus").html(html);

            $(".calculus tr[type='new']").remove();
        });
}


//   -------------------------------------------------------------------------------------------------------------------
function calculus_get_pct(val) {
    let pct = Math.floor(100 * val);
    if (Infinity === pct)
        pct = 0;
    else
    if (pct > 100)
        pct = 100;
    return pct;
}
//   -------------------------------------------------------------------------------------------------------------------
function calculus_colorize_pct(src, val) {
/*
    if (val < 50)
        return "<span style='color: red'>"+src+"</span>";
    else
    if (val <= 75)
        return "<span style='color: #efef00'>"+src+"</span>";
    else
        return "<span style='color: green'>"+src+"</span>";
    */
    if (val < 90)
        return "<span style='color: red; font-weight: bold;'>"+src+"</span>";
    else
        return "<span style='color: green; font-weight: bold;'>"+src+"</span>";
}
//   -------------------------------------------------------------------------------------------------------------------
function calc_empty_cat_columns(sub_empty_cols, group, resp_answers) {
    Object.keys(resp_answers).map(function (key, ind) { // key is id of a resp, val is qnt o answers given
        if (resp_answers[key] === 0) // no answers given
            for (let i=0; i<group.length; i++)
                if (group[i].id === key*1 &&
                    [0,3,4,5,1].indexOf(group[i].cat_id) !== -1) // this guy is in thi group of some of this cats
                {
                    let cat_id = group[i].cat_id;
                    sub_empty_cols[cat_id]++; // minus his column
                    break;
                }

    });
    return sub_empty_cols;
}

//   -------------------------------------------------------------------------------------------------------------------
//   -------------------------------------------------------------------------------------------------------------------
//   -------------------------------------------------------------------------------------------------------------------

/*
    let cid_list = get_comp_id_list_from_qst_list(qst_id_list);
    cid_list.forEach(function (v_cid) {

    });
* */



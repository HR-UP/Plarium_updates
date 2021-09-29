<?php
define("IS_LOCAL", false); // "true" only for developement, when using localhost like apache n stuff
define("REPORT_IMAGES_DIR", "report_images"); // backup for orders on project
define("REPORT_IMAGES_USER_DIR", "pers_");
define("NO_COMP_HERE", "<div style='font-style: italic; text-align: center; box-sizing: border-box; margin: 0 auto;'>   Сюда не попала ни одна компетенция</div>");
define("REPORT_TEMPDATA_FILENAME", "report_temp_data");
//****--------------------------------------------------------------------------------------------------------------****
function true_json_code($src, $action="encode")
{
    if ($action === "decode")
    {
        $src = str_replace("\n", "<br>", $src);
        $src = str_replace("☼", "\\", $src);
        //$src = str_replace("♀♀", "\"", $src);

        $src = str_replace("♀!♀", "\\\"", $src);
        $src = str_replace("♀", "'", $src);
        $src = json_decode($src, true);
    }
    else
    {
        $src = json_encode($src, JSON_UNESCAPED_UNICODE);
        $src = str_replace("\\", "☼", $src);
        $src = str_replace("\\\"", "♀!♀", $src);
        $src = str_replace("'", "♀", $src);
    }
    return $src;
}
//----------------------------------------------------------------------------------------------------------------------
function get_link_button_html($label, $link)
{
    return "<span style='padding: 10px;".
        "display: inline-block;".
            "width: 200px;".
            "text-align: center;".
            "line-height: 30px;".
            "font-size: 18px;".
            "background-color: #4A67AD;".
            "color: white;".
            "border-radius: 5px;".
            "font-weight: bold;'>" .
        "<a href='$link' style='text-decoration: none; color: white;'>$label</a></span>";
}
//----------------------------------------------------------------------------------------------------------------------
function get_qb_ord_from_qb_id($qb_id, $qbooks = false)
{
    $ord = null;
    if (!$qbooks)
    {
        if (!$_SESSION["qbooks"])
        {
            $db = new DBase();
            $db->qbook("list", "no_recon");
        }
        $qbooks_list = $_SESSION["qbooks"];
    }
    else
        $qbooks_list = $qbooks;

    foreach ($qbooks_list as $qb_ord => $qb)
        if ($qb["id"]*1 === $qb_id*1)
        {
            $ord = $qb_ord;
            break;
        }
    return $ord;
}
//----------------------------------------------------------------------------------------------------------------------
function resp_pct_done($d, $qbooks = false)
{
    $qbooks_list = $_SESSION["qbooks"];
    if ($qbooks)
        $qbooks_list = $qbooks; // list given us manually
    file_put_contents("qz_complete.tx", "");
    //$pct = 0;
    //console.log(data);
    $resp = $d["resps"][$d["gr_ord"]][$d["resp_ord"]];
    $cat_id = $resp["cat_id"];

    // Map system is present and this resp's first cycle, and it's not complete
    if (isset($resp["map_step"]) &&
        isset($resp["map_len"]) &&
        intval($resp["map_step"]) + 1 < intval($resp["map_len"])
    )
    {
        return (($resp["map_step"]+1) / $resp["map_len"]);
    }

    if (!$d["resp_ord"] && $d["settings"]["self_ban_list"][$d["gr_ord"]])
    {
        file_put_contents("resp_rec_chk.txt", " \n pct complete: disabled self-eval", FILE_APPEND);
        $answered = 1;
        $qst_qnt = 1;
    }
    else
    {
        // Get qbook qsts list
        $comm_group = $d["settings"]["comm_groups"][$d["gr_ord"]];
        $qb_ord = get_qb_ord_from_qb_id($comm_group["qb_id"], $qbooks_list);
        $qst_id_list = $qbooks_list[$qb_ord]["list"];
        $struct = $qbooks_list[$qb_ord]["struct"];
        file_put_contents("resp_rec_chk.txt", " \n resp_pct_done qb_ord: $qb_ord", FILE_APPEND);

        // We need to know exact qst qnt of this resp, due to his category
        $qst_qnt = 0;
        if ($struct)
            foreach ($qst_id_list as $v_qid)
            {
                if ($struct["q_list"][$v_qid]["cats"][$cat_id]["is_on"])
                    $qst_qnt++;
            }

        if (!$qst_qnt)
            $qst_qnt = 1;

        // How many qsts resp actually have answered
        $answered = 0;
        if (count($resp["ans_list"]))
            foreach ($resp["ans_list"] as $v_ans)
                if (null !== $v_ans && -1 !== $v_ans)
                    $answered++;

        //file_put_contents("completion_chk_php.txt", "\n\nresp_id = ". $resp["id"] .",  cat_id = $cat_id, qb_ord = $qb_ord, qst_qnt = $qst_qnt, answered = $answered", FILE_APPEND);
        file_put_contents("resp_rec_chk.txt", " \n pct complete: answered - $answered, qst_qnt = $qst_qnt", FILE_APPEND);
    }

    return ($answered / $qst_qnt);
}
//----------------------------------------------------------------------------------------------------------------------
function resp_fb_done($d, $qbooks = null, $qsts = null)
{
    $passed = true;

    $resp = $d["resps"][$d["gr_ord"]][$d["resp_ord"]];
    $cat_id = $resp["cat_id"] * 1;
    file_put_contents("fb_done_log.txt", "START\n");
    file_put_contents("fb_done_log.txt", "cat_id $cat_id\n", FILE_APPEND);

    // Map system is present and this resp's first cycle, and it's not complete
    if (isset($resp["map_step"]) &&
        isset($resp["map_len"]) &&
        intval($resp["map_step"]) + 1 < intval($resp["map_len"])
    )
    {
        $passed = false;
        return $passed;
    }

    if (null !== $qbooks)
        $QB = $qbooks;
    else
        $QB = $_SESSION['qbooks'];

    if (null !== $qsts)
        $Q_DB = $qsts;
    else
        $Q_DB = $_SESSION['qsts'];

    // Get qbook qsts list
    $comm_group = $d["settings"]["comm_groups"][$d["gr_ord"]];
    $qb_ord = get_qb_ord_from_qb_id($comm_group["qb_id"], $_SESSION["qbooks"]);
    $struct = $QB[$qb_ord]["struct"];
    file_put_contents("fb_done_log.txt", "qb_ord $qb_ord, qb_id ". $comm_group["qb_id"] ." \n", FILE_APPEND);


    /*
    1. Get id_comp_list of ALL ENABLED+MANDATORY comments for this ROLE in the comm_group comps,
    2. Check presense of all mandatory + enabled qz_after comments
    3. Check presense of all comments being filled for all comps from point 1
    */

    $uniq_real_comp_id_list = array(); // real "blue" comps, backed by the questions in the qbook
    foreach ($struct["q_list"] as $q_id => $q)
    {
        $comp_id = null;
        foreach ($Q_DB as $q_db)
            if ($q_db["id"] === $q_id)
            {
                $comp_id = $q_db["comp_id"];
                break;
            }

        if (null !== $comp_id &&
            !in_array($comp_id, $uniq_real_comp_id_list)
        ) // get list of unique comp id's
            array_push($uniq_real_comp_id_list, $comp_id);
    }

    // 1. Get id_comp_list of ALL PRESENT in the comm_group comps, inside them get ords of all mandatory comments for this role to chk their presense later
    $present_comp_id_list = array();
    foreach ($comm_group["comp_list"] as $comp_id => $qst_list)
        if (is_array($qst_list) && count($qst_list)) // list of questions is not empty
        {

            // check if there is at least one mandatory enabled comment
            foreach ($qst_list as $q_ord => $qst_tx) {
                $found_enabled = false;
                if (isset($comm_group["comp_cats_list"][$comp_id])) {
                    $cats_specs = $comm_group["comp_cats_list"][$comp_id];
                    if (isset($cats_specs[$q_ord]) &&
                        isset($cats_specs[$q_ord][$cat_id]) &&
                        isset($cats_specs[$q_ord][$cat_id]["is_on"]) &&
                        $cats_specs[$q_ord][$cat_id]["is_on"] * 1 // this 4 conds track that comment is not disabled for this particular role
                    )
                        $found_enabled = true;
                }

                $is_mandatory = false;
                if (isset($comm_group["lock_comp_list"][$comp_id])) {
                    $lock_specs = $comm_group["lock_comp_list"][$comp_id];
                    if (null !== $lock_specs &&
                        isset($lock_specs[$q_ord]) &&
                        $lock_specs[$q_ord] * 1 // this comment is marked with a "lock" to be mandatory (thus unskippable)
                    )
                        $is_mandatory = true;
                }


                if ($found_enabled && $is_mandatory)
                {

                    if (!isset($present_comp_id_list[$comp_id]))
                        $present_comp_id_list[$comp_id] = array();

                    array_push($present_comp_id_list[$comp_id], $q_ord); // remember ord of a mandatory comment
                }
            }
        }

    file_put_contents("fb_done_log.txt", "present_comp_id_list ". json_encode($present_comp_id_list) ."\n", FILE_APPEND);

    $resp_feedback_exist = false;
    $fb = array(); //$resp["feedback"];
    if (isset($resp["feedback"]) &&
        is_array($resp["feedback"]) &&
        count($resp["feedback"]))
    {
        $resp_feedback_exist = true;
        $fb = $resp["feedback"];
    }
    file_put_contents("fb_done_log.txt", "resp_feedback_exist |$resp_feedback_exist|\n", FILE_APPEND);

    // Check if there is any after_qz comment that is mandatory, enabled for this role and not filled yet (thus empty)
    if ($comm_group["qz_after"]) // there is comment after quiz
    {
        file_put_contents("fb_done_log.txt", "qz_after: present\n", FILE_APPEND);
        foreach ($comm_group["qz_list"] as $ord => $qz_comment)
            if ($comm_group["lock_qz_list"][$ord]*1 === 1) // comment is mandatory
            {
                $enabled_by_cat = false; // check that this comment enabled for this role
                if (isset($comm_group["qz_cats_list"]) &&
                    isset($comm_group["qz_cats_list"][$ord])
                )
                {
                    $specs_slot = $comm_group["qz_cats_list"][$ord];
                    if (isset($specs_slot[$cat_id]) &&
                        isset($specs_slot[$cat_id]["is_on"]) &&
                        $specs_slot[$cat_id]["is_on"] * 1 // this 4 track that comment is not disabled for this role
                    )
                        $enabled_by_cat = true;
                }

                if ($enabled_by_cat)
                {
                    if (!$resp_feedback_exist)
                    {
                        file_put_contents("fb_done_log.txt", "after_qz, com_ord: $ord - no feedback exist\n", FILE_APPEND);
                        $passed = false;
                        break;
                    }
                    elseif (isset($fb["qz_list"]) &&
                        isset($fb["qz_list"][$ord]) &&
                        isset($fb["qz_list"][$ord]["tx"])
                    )
                    {
                        file_put_contents("fb_done_log.txt", "after_qz, com_ord: $ord - slot exist", FILE_APPEND);
                        if (!trim($fb["qz_list"][$ord]["tx"]))
                        {
                            file_put_contents("fb_done_log.txt", " but is empty\n", FILE_APPEND);
                            $passed = false;
                            break;
                        }
                        else
                            file_put_contents("fb_done_log.txt", " and filled ok\n", FILE_APPEND);
                    }
                    else
                    {
                        file_put_contents("fb_done_log.txt", "after_qz, com_ord: $ord - no feedback slot\n", FILE_APPEND);
                        $passed = false;
                        break;
                    }
                }
            }
    }

    // Check only if qz_after stuff is considered filled
    if ($passed &&
        $comm_group["comp_after"] &&
        count($present_comp_id_list))
    {
        file_put_contents("fb_done_log.txt", "comp_after: present\n", FILE_APPEND);

        foreach ($present_comp_id_list as $comp_id => $comp)
            foreach ($comp as $comm_ord)
            {
                if (!$resp_feedback_exist)
                {
                    file_put_contents("fb_done_log.txt", "comp_id: $comp_id, com_ord: $comm_ord - no feedback exist\n", FILE_APPEND);
                    $passed = false;
                    break;
                    break;
                }
                // Comment for this open qst of this comp_id is present
                elseif (isset($fb["comp_list"]) &&
                        isset($fb["comp_list"][$comp_id]) &&
                        isset($fb["comp_list"][$comp_id][$comm_ord]) &&
                        isset($fb["comp_list"][$comp_id][$comm_ord]["tx"])
                )
                {
                    file_put_contents("fb_done_log.txt", "comp_id: $comp_id, com_ord: $comm_ord - slot exist", FILE_APPEND);
                    if (!trim($fb["comp_list"][$comp_id][$comm_ord]["tx"])) // but comment is empty
                    {
                        file_put_contents("fb_done_log.txt", " but is empty\n", FILE_APPEND);
                        $passed = false;
                        break;
                        break;
                    }
                    else
                        file_put_contents("fb_done_log.txt", " and filled ok\n", FILE_APPEND);
                }
                else
                {
                    file_put_contents("fb_done_log.txt", "comp_id: $comp_id, com_ord: $comm_ord - no feedback slot\n", FILE_APPEND);
                    $passed = false;
                    break;
                    break;
                }
            }
    }

    //file_put_contents("fb_done_log.txt", "\n\n Q_DB ". json_encode($Q_DB) ."", FILE_APPEND);

    return $passed;
}
//****--------------------------------------------------------------------------------------------------------------****
function shield($str,$mode=true,$type="str"){
    $resstr = "";
    $str = purify($str,$type);
    // Shield string
    if ($str !== null) {
        if ($mode == true) {

            for ($i = 0; $i < strlen($str); $i++) {
                switch ($str[$i]):
                    case "'":
                        $resstr .= "'" . $str[$i];
                        break;
                    case ";":
                    case ":":
                    case "\"":
                    case "(":
                    case ")":
                    case "[":
                    case "]":
                    case "{":
                    case "}":
                    case "*":
                    case "+":
                    case "^":
                    case "%":
                    case "#":
                        $resstr .= "\\" . $str[$i];
                        break;
                    default:
                        $resstr .= $str[$i];
                endswitch;
            }
        } else { // UnShield string
            for ($i = 0; $i < strlen($str); $i++) {
                switch ($str[$i]):
                    case "''":
                        $resstr .= "'";
                        break;
                    case "\\;":
                        $resstr .= ";";
                        break;
                    case "\\\"":
                        $resstr .= "\"";
                        break;
                    case "\\:":
                        $resstr .= ":";
                        break;
                    case "\\(":
                        $resstr .= "(" . $str[$i];
                        break;
                    case "\\)":
                        $resstr .= ")" . $str[$i];
                        break;
                    case "\\[":
                        $resstr .= "[" . $str[$i];
                        break;
                    case "\\]":
                        $resstr .= "]" . $str[$i];
                        break;
                    case "\\{":
                        $resstr .= "{" . $str[$i];
                        break;
                    case "\\}":
                        $resstr .= "}" . $str[$i];
                        break;
                    case "\\*":
                        $resstr .= "*" . $str[$i];
                        break;
                    case "\\+":
                        $resstr .= "+" . $str[$i];
                        break;
                    case "\\^":
                        $resstr .= "^" . $str[$i];
                        break;
                    case "\\%":
                        $resstr .= "%" . $str[$i];
                        break;
                    case "\\#":
                        $resstr .= "#" . $str[$i];
                        break;
                    default:
                        $resstr .= $str[$i];
                endswitch;
            }
        }
    }
    return $resstr;
}
//****--------------------------------------------------------------------------------------------------------------****
function purify($str,$mode="str"){
    $resstr = null;
    if (isset($str)) {
    switch ($mode):
        case "str":$resstr = trim(strip_tags($str));break;
        case "int":$resstr = abs((int)$str);break;
    endswitch;
    };
    return $resstr;
}
//****--------------------------------------------------------------------------------------------------------------****
function encrypt($inp){
    return md5("0asdmgvb(8-4640*86u3-".$inp."m(82hbn%bBF)wqwkw");
}
//****--------------------------------------------------------------------------------------------------------------****
function log_add($data)
{
    if (file_exists(SERV_LOG_FILE))
    {
        $log = json_decode(file_get_contents(SERV_LOG_FILE), true);
        if (!is_array($log))
            $log = array();
    }
    else
        $log = array();
    $entry = array();
    if (isset($_SESSION["pers"]))
        $entry["user"] = $_SESSION["pers"]["name"] . " " . $_SESSION["pers"]["id"];
    $entry["msg"] = $data;
    $entry["time"] = time();
    $entry["date"] = date("d-m-y H:i:s", $entry["time"]);
    array_push($log, $entry);
    file_put_contents(SERV_LOG_FILE, json_encode($log, JSON_UNESCAPED_UNICODE));
}
//****--------------------------------------------------------------------------------------------------------------****
function find_last_iteration_ind($iter_array, $resp_ind)
{
    $last_iter_ind = -1;
    foreach($iter_array as $iter_ind => $iter)
    {
        $stats = $iter["resp_stats"];
        if (isset($stats[$resp_ind]) && is_array($stats[$resp_ind]))
            $last_iter_ind = $iter_ind;
    }
    return $last_iter_ind;
}
//****--------------------------------------------------------------------------------------------------------------****
function digitize($src, $field_list = null)
{
    // Digitize selected array fields
    foreach ($src as $keyname => &$val)
        if ($field_list === null || in_array($keyname, $field_list))
            $val = intval($val);
    return $src;
}

// -------------------------------------------------------------------------------------------------------------------
function get_base()
{
    // Arr of comments
    $body_style = "body {
        font-family: Verdana, sans-serif;
        background-color: #ffffff;
        font-family: 'Verdana';
        background-image-resize: 6
    }"; // background: url(img/rep_bgrnd.png);

    $base = "";
    $base .= "<head>";
    $base .= "<meta http-equiv='Content-Type' content='text/html; charset=utf-8'>";
    $base .= "<style>";
    $base .= "$body_style";
    $base .= "";
    $base .= "</style>";
    $base .= "</head>";
    return $base;
}
//----------------------------------------------------------------------------------------------------------------------
function draw_cat_header($cat_names_list, $pallette)
{
    $st_comp_head = "style='width: 400px; font-weight: bold; border-bottom: 1px solid black; padding: 5px;'";
    $a = "";
    $a .= "<tr>";
    $a .= "<td $st_comp_head></td>";
    foreach ($cat_names_list as $cat_ord => $entry_cat_name)
    {
        $catname = mb_strtolower($entry_cat_name);
        $catname = mb_strtoupper(mb_substr($catname, 0, 1)) . mb_substr($catname, 1);
        $a .= "<td style='border-bottom: 1px solid black; color:black; font-size: 13px; text-align: center; width: 12%;'>".$catname."</td>";
        //$a .= "<td style='border-bottom: 3px solid ".$pallette[$cat_ord]."; color:".$pallette[$cat_ord]."; font-size: 12px; width: 15%;'>".$catname."</td>";
    }
    $a .= "<td style='border-bottom: 1px solid black; color: black; font-size: 13px; text-align: center; width: 12%;'>cредняя</td>";
    $a .= "<td style='border-bottom: 1px solid black; color: black; font-size: 13px; text-align: center; width: 12%;'>вектор<br>самооценки</td>";
    //$a .= "<td style='border-bottom: 1px solid black; color: black; font-size: 13px; text-align: center; width: 12%;'>cр. окруж.</td>";
    $a .= "</tr>";
    return $a;
}
//----------------------------------------------------------------------------------------------------------------------
function value_rank($val, $edge_low, $edge_high)
{
    if ($val >= $edge_high)
        return "high";
    elseif ($val <= $edge_low)
        return "low";
    else
        return "mid";
}
//----------------------------------------------------------------------------------------------------------------------
function get_legend_table($scale_id)
{

    function get_grade_range($scale_id, $step)
    {
        switch ($scale_id)
        {
            // 0..3
            case 1:
                switch ($step)
                {
                    case 1:
                        return "3-2 балла";
                        break;
                    case 2:
                        return "2-1 балла";
                        break;
                    case 3:
                        return "1-0 балла";
                        break;
                }
                break;

            // 1..5
            case 2:
                switch ($step)
                {
                    case 1:
                        return "5-4 балла";
                        break;
                    case 2:
                        return "3 балла";
                        break;
                    case 3:
                        return "2-1 балла";
                        break;
                }
                break;

            // 1..10
            case 3:
                switch ($step)
                {
                    case 1:
                        return "10-8 балла";
                        break;
                    case 2:
                        return "7-4 балла";
                        break;
                    case 3:
                        return "3-1 балла";
                        break;
                }
                break;

            // 1..4
            case 4:
                switch ($step)
                {
                    case 1:
                        return "4-3 балла";
                        break;
                    case 2:
                        return "3-2 балла";
                        break;
                    case 3:
                        return "2-1 балла";
                        break;
                }
                break;

            // 1..6
            case 5:
                switch ($step)
                {
                    case 1:
                        return "6-5 балла";
                        break;
                    case 2:
                        return "4-3 балла";
                        break;
                    case 3:
                        return "2-1 балла";
                        break;
                }
                break;

        }
    }

    $clr_avg = array(
        "high"=>array(
            "font"=> "#0F874B",
            "bg"=> "#E6F4E9"
        ),
        "mid"=>array(
            "font"=> "#000000",
            "bg"=> "#FFBF71"
        ),
        "low"=>array(
            "font"=> "#E61B37",
            "bg"=> "#FCE7EA"
        )
    );
    $st_r = "style='text-align: right;'";
    $a = "";
    $a .= "<table style='width: 90%; padding: 10px; margin: 10px auto; border: 1px solid black;'>";
    $a .= "<tr>";
    $a .= "<td colspan='2' style='font-weight: bold; width: 80px; text-align: center; '>Легенда</td>";
    //$a .= "<td></td>";
    $a .= "</tr>";


    $a .= "<tr>";
    $a .= "<td $st_r>" .get_grade_range($scale_id, 1). "</td>";
    $a .= "<td>Компетенция проявляется стабильно и с должным качеством в соответствии с ребуемым уровнем. Эта компетенция не требует усилий по развитию.</td>";
    $a .= "</tr>";

    $a .= "<tr>";
    $a .= "<td $st_r>" .get_grade_range($scale_id, 2). "</td>";
    $a .= "<td>Компетенция проявляется нестабильно или недостаточно выражена. Требует незначительных усилий по развитию.</td>";
    $a .= "</tr>";

    $a .= "<tr>";
    $a .= "<td $st_r>" .get_grade_range($scale_id, 3). "</td>";
    $a .= "<td>Компетенция проявлена ниже требуемого уровня или не проявлена в ряде ситуаций. Эта компетенция является зоной развития и требует особого внимания.</td>";
    $a .= "</tr>";

    $a .= "<tr>";
    $a .= "<td style='color: ".$clr_avg["high"]["font"]."; text-align: right;'>&#8593;</td>";
    //$a .= "<td style='width:30px; height: 30px; background: url(img/legend_1.png) no-repeat 100%; background-image-resize: 3;'></td>";
    $a .= "<td>Баллы по вопросу значительно выше средней оценки по категории.</td>";
    $a .= "</tr>";

    $a .= "<tr>";
    $a .= "<td style='color: ".$clr_avg["low"]["font"]."; text-align: right;'>&#8595;</td>";
    //$a .= "<td style='width:30px; height: 30px; background: url(img/legend_2.png) no-repeat 100%; background-image-resize: 3;'></td>";
    $a .= "<td>Баллы по вопросу значительно ниже средней оценки по категории.</td>";
    $a .= "</tr>";

    $a .= "<tr>";


    $a .= "<td style='color: ".$clr_avg["mid"]["bg"]."; text-align: right;'>&#8595;</td>";
    //$a .= "<td style='width:30px; height: 30px; background: url(img/legend_3.png) no-repeat 100%; background-image-resize: 3;'></td>"; // background-image-resize: 3;
    $a .= "<td>Ответы по вопросу сильно расходятся.</td>";
    $a .= "</tr>";

    $a .= "<tr>";
    $a .= "<td $st_r>-</td>";
    $a .= "<td>Нет достоверных данных. Человек не заполнил тест либо в более 45% вопросов ответил «Не имею информации».</td>";
    $a .= "</tr>";

    $a .= "</table>";
    return $a;
}
//----------------------------------------------------------------------------------------------------------------------
function draw_comp_chunk($pallette, $clr_avg, $st_comp_head){
    global $all_data;
    $ans = "";
    $table_style = "style='width: 100%; padding: 10px; box-sizing: border-box; border-collapse: collapse; margin: 15px 40px; page-break-inside:avoid;'";
    $st_qst_head = "style='width: 400px; border-bottom: 1px solid #A3A3A3; padding: 5px;'";
    $clr_qst = array(
        "high"=>"#109E36",
        "mid"=>"#FEAE43",
        "low"=>"#E61B37"
    );
    $cell_styles = "border-bottom: 1px solid black; 
        font-size: 23px; 
        text-align: center;";

    // ALL COMPS
    //if ($indexes)
        foreach ($all_data["res"] as $comp_ord => $comp)
            //if (in_array($comp_ord,$indexes))
            {
                $ans .= "<table $table_style>";
                $ans .= draw_cat_header($all_data["cat_names_list"], $pallette);
                // COMP HEAD
                $ans .= "<tr>";
                $ans .= "<td $st_comp_head>".$comp["name"]."</td>";
                foreach ($comp["cat_list"] as $ord => $cat_entry)
                {
                    $value_rank = value_rank($cat_entry["avg"], $all_data["edge_low"], $all_data["edge_high"]);
                    $bg_clr = $clr_avg[$value_rank]["bg"];
                    $font_clr = $clr_avg[$value_rank]["font"];
                    $ans .= "<td style='background-color: $bg_clr; color: $font_clr; $cell_styles'>". $cat_entry["avg"] ."</td>";
                }

                // avg of comp
                $value_rank = value_rank($comp["ns_avg"], $all_data["edge_low"], $all_data["edge_high"]);
                $bg_clr = $clr_avg[$value_rank]["bg"];
                $font_clr = $clr_avg[$value_rank]["font"];
                $ans .= "<td style=' background-color: $bg_clr; color: $font_clr; $cell_styles'>".$comp["ns_avg"]."</td>";

                $se_vector = $comp["cat_list"][0]["avg"] - $comp["ns_avg"];
                if ($se_vector > 0)
                    $rank = "high";
                elseif ($se_vector < 0)
                    $rank = "low";
                else
                    $rank = "mid";
                $bg_clr = $clr_avg[$rank]["bg"];
                $font_clr = $clr_avg[$rank]["font"];
                $ans .= "<td style=' background-color: $bg_clr; color: $font_clr; $cell_styles'>". $se_vector ."</td>";

                $ans .= "</tr>";

                // ALL QSTS
                foreach ($comp["qst_list"] as $qst)
                {
                    $ans .= "<tr>";
                    $ans .= "<td $st_qst_head>".$qst["tx"]."</td>";
                    foreach ($qst["cat_list"] as $ord => $cat)
                    {
                        $rank = value_rank($cat["avg"], $all_data["edge_low"], $all_data["edge_high"]);
                        $img = "";
                        if ($rank === "high")
                        {
                            $pct = $cat["avg"] - $all_data["edge_high"]; // pts from low end of high result to max
                            $pct /= ($all_data["djo_avg"]["max"] - $all_data["edge_high"]); // % on the scale range of high results

                            if ($pct >= 0.84)
                                $img = "&#8593;"; // up
                            elseif ($pct <= 0.16)
                                $img = "&#8595;"; // down
                        }
                        elseif ($rank === "mid")
                        {
                            $pct = ($cat["avg"] - $all_data["edge_low"]);
                            $pct = ($pct / ($all_data["edge_high"] - $all_data["edge_low"]));

                            if ($pct >= 0.84)
                                $img = "&#8593;"; // up
                            elseif ($pct <= 0.16)
                                $img = "&#8595;"; // down
                        }
                        else
                        {
                            $pct = $cat["avg"];
                            $pct = ($pct / ($all_data["edge_low"] - $all_data["djo_avg"]["min"]));

                            if ($pct >= 0.84)
                                $img = "&#8593;"; // up
                            elseif ($pct <= 0.16)
                                $img = "&#8595;"; // down
                        }
                        $ans .= "<td 
                            style='
                                color: ".$clr_qst[$rank]."; 
                                border-bottom: 1px solid #A3A3A3; 
                                font-size: 16px; 
                                text-align: center;'
                            >".$cat["avg"]." ".$img;

                        $ans .= "</td>";
                    }

                    // avg of qst
                    $rank = value_rank($qst["ns_avg"], $all_data["edge_low"], $all_data["edge_high"]);
                    $ans .= "<td 
                        style='
                            color: ".$clr_qst[$rank]."; 
                            border-bottom: 1px solid #A3A3A3; 
                            font-size: 16px; 
                            text-align: center;'
                            >".$qst["ns_avg"]."</td>";

                    $se_vector = $qst["cat_list"][0]["avg"] - $qst["ns_avg"];
                    if ($se_vector > 0)
                        $rank = "high";
                    elseif ($se_vector < 0)
                        $rank = "low";
                    else
                        $rank = "mid";
                    $ans .= "<td 
                        style='
                            color: ".$clr_qst[$rank]."; 
                            border-bottom: 1px solid #A3A3A3; 
                            font-size: 16px; 
                            text-align: center;'
                            >".$qst["ns_avg"]."</td>";
                    $ans .= "</tr>";

                }
                $ans .= "</table><br>";
            }
    return $ans;
}
//----------------------------------------------------------------------------------------------------------------------
function comp_tables($indexes, $is_first=false, $no_body = false)
{
    $cqc = $_SESSION["comp_qst_cats"];
    $pallette = array("#4A67AD", "#229B55", "#F7941D", "#CC2B2B", "#000000");
    $clr_avg = array(
        "high"=>array(
            "font"=> "#0F874B",
            "bg"=> "#E6F4E9"
        ),
        "mid"=>array(
            "font"=> "#000000",
            "bg"=> "#FFF6EB"
        ),
        "low"=>array(
            "font"=> "#E61B37",
            "bg"=> "#FCE7EA"
        )
    );

    $st_comp_head = "style='width: 400px; background-color: #F4F6FC; font-weight: bold; border-bottom: 1px solid black; padding: 5px;'";

    $ans = get_base();
    if (!$no_body)
        $ans .= "<body>";
    if ($is_first)
    {
        $res = calc_avg_comps($cqc);
        $totals_avg = $res["totals_avg"];
        $super_avg = $res["super_avg"];
        //$ans .= "<h2 style='text-align: left; font-weight: bold; padding: 10px; font-size: 30px;'>Результаты по<br>компетенциям</h2><br><br>";

        // AVG
        $ans .= "<br><table style='width: 100%; padding: 10px; box-sizing: border-box; border-collapse: collapse; margin: 0 40px;'>";
        $ans .= draw_cat_header($pallette);
        $ans .= "<tr>";
        $ans .= "<td $st_comp_head>Средняя оценка</td>";
        foreach ($totals_avg as $ord => $avg)
            $ans .= "<td style='background-color: ".$clr_avg[value_rank($avg)]["bg"]."; color: ".$clr_avg[value_rank($avg)]["font"]."; border-bottom: 1px solid black; font-size: 23px; text-align: center; width: 12%;'>$avg</td>";
        // avg of all
        $ans .= "<td style='background-color: ".$clr_avg[value_rank($super_avg)]["bg"]."; color: ".$clr_avg[value_rank($super_avg)]["font"]."; border-bottom: 1px solid black; font-size: 23px; text-align: center; width: 12%;'>$super_avg</td>";
        $ans .= "</tr>";
        $ans .= "</table><br>";
        $ans .= get_legend_table();
        $ans .= draw_comp_chunk($pallette, $clr_avg, $st_comp_head);
    }
    else
    {
        $ans .= draw_comp_chunk($pallette, $clr_avg, $st_comp_head);
    }
    if (!$no_body)
        $ans .= "</body>";
    return $ans;
}
//****--------------------------------------------------------------------------------------------------------------****
function get_tempdata_presets_filename()
{
    if (!is_dir(TEMP_DATA_DIR))
        mkdir(TEMP_DATA_DIR, 0777, true);

    // PRESETS DATA
    $filename = TEMP_DATA_DIR ."/tempdata_presets_" . $_SESSION["pers"]["id"] . ".txt";
    return $filename;
}
//****--------------------------------------------------------------------------------------------------------------****
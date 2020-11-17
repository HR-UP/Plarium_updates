<?php
header('Content-type: text/html; charset=utf-8');

include_once "DBase.class.php";
// include_once "Renderer.php";
include_once "pChart/class/pData.class.php";
include_once "pChart/class/pDraw.class.php";
include_once "pChart/class/pRadar.class.php";
include_once "pChart/class/pImage.class.php";


$html = array();
$desc_blind_spot = "
Эта зона содержит компетенции, в оценке которых Ваше мнение и мнения<br>
окружающих не совпадают. В отличие от окружающих, Вы оценили эти<br>
 компетенции как хорошо развитые. Поскольку этими компетенциями <br>
 Вы либо владеете не в полном объеме, либо не достаточно их проявляете,<br>
  на них стоит обратить внимание и развивать их.";
// Need to develope
$desc_need_to_develope = "Эта зона отражает компетенции, которые развиты у Вас недостаточно. Это считаете как Вы сами, так и окружающие.
Вам необходимо особо сосредоточиться на развитии данных компетенций.";
// Hidden strengths
$desc_hidden_strengths = "  <br>  <br>Эту часть условно можно назвать зоной “скромности”: это значит, что окружающие оценили данные компетенции выше, чем Вы сами.
Развивать ли перечисленные компетенции – Ваш выбор, но коллеги уверены, что Вы ими уже вполне владеете.";

$desc_obvious_stregths = "В этой зоне перечислены компетенции, которыми Вы вполне владеете. 
                            В этом уверены и Вы сами, и Ваши коллеги. 
                            Эти компетенции можно дальше совершенствовать.";

$quadName = array("«Слепое пятно»<br>(Неочевидные потребности для развития)", "Очевидные сильные стороны", "Очевидные потребности для развития", "Неочевидные сильные стороны");


$qd_td_desc_style = "style='text-align: center; margin: 0 auto; padding: 5px;'";
// -------------------------------------------------------------------------------------------------------------------
function SREP_get_base()
{
    // Arr of comments
    $body_style = "body {
        font-family: Verdana, sans-serif;
        background-color: #ffffff;
        font-family: 'Verdana';
        background-image-resize: 6;  
    }
    
    .calculus{
        width: 100%;
        text-align: center;
        font-size: 12px;
        border-collapse: collapse;
    }
    
    .calculus tr{font-size: 18px;}
    .calculus tr.line_comp{background-color: #d7dff2;}
    .calculus tr[white]{background-color: white;}
    .calculus tr:first-child{font-size: 12px;}
    .calculus td{border: 1px solid lightgray;}
    .calculus td:first-child{text-align: left;}
    .calculus td.line_comp{background-color: #d7dff2;}
    "; // background: url(img/rep_bgrnd.png);
    
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
function SREP_comp_avgs_table($indexes=false, $is_first=false)
{
    global $all_data;
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

    $cell_styles = "border-bottom: 1px solid black; 
        font-size: 23px; 
        text-align: center; 
        width: 12%;";


    if ($is_first)
    {
        // AVG
        $ans .= "<br><table style='width: 100%; padding: 10px; box-sizing: border-box; border-collapse: collapse; margin: 0 40px;'>";
        $ans .= draw_cat_header($all_data["cat_names_list"], $pallette);
        $ans .= "<tr>";
        $ans .= "<td $st_comp_head>Средняя оценка</td>";
        $comps_qnt = count($all_data["res"]);

        // array of total avgs by cats from all comps
        $cat_total_avg = array();

        foreach ($all_data["res"] as $comp)
            foreach ($comp["cat_list"] as $ord => $cat)
                if (!isset($cat_total_avg[$ord]))
                    $cat_total_avg[$ord] = $cat["avg"];
                else
                    $cat_total_avg[$ord] += $cat["avg"];
        foreach ($cat_total_avg as &$val)
            $val = round($val / $comps_qnt, 2);


        // Get the total avg of all
        $cats_qnt = count($all_data["cat_names_list"]);
        $cat_global_avg = 0;
        $cat_global_ns_avg = 0;
        foreach ($cat_total_avg as $ord => $val)
        {
            $cat_global_avg += $val;
            if ($ord)
                $cat_global_ns_avg += $val;
        }

        $cat_global_avg = round($cat_global_avg / $cats_qnt, 2);
        if ($cats_qnt - 1 > 0)
            $cat_global_ns_avg = round($cat_global_ns_avg / ($cats_qnt-1), 2);

        // Draw all cats total avgs
        foreach ($cat_total_avg as $ord => $avg)
        {
            $value_rank = value_rank($avg, $all_data["edge_low"], $all_data["edge_high"]);
            $bg_clr = $clr_avg[$value_rank]["bg"];
            $font_clr = $clr_avg[$value_rank]["font"];
            $ans .= "<td style=' background-color: $bg_clr; color: $font_clr; $cell_styles'>". $avg."</td>";
        }

        // avg of all
        $value_rank = value_rank($cat_global_ns_avg, $all_data["edge_low"], $all_data["edge_high"]);
        $bg_clr = $clr_avg[$value_rank]["bg"];
        $font_clr = $clr_avg[$value_rank]["font"];
        // TOTAL AVG
        //$ans .= "<td style=' background-color: $bg_clr; color: $font_clr; $cell_styles'>". $cat_global_avg ."</td>";
        //$ans .= "</tr>";
        // NO SELF AVG
        $ans .= "<td style=' background-color: $bg_clr; color: $font_clr; $cell_styles'>". $cat_global_ns_avg ."</td>";

        // SELF VECTOR
        $se_vector = $cat_total_avg[0] - $cat_global_ns_avg;
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

        $ans .= "</table><br>";
        $ans .= get_legend_table($all_data["scale_id"] * 1);
    }
    else
    //$ans .= draw_comp_chunk($pallette, $clr_avg, $st_comp_head);
        $ans .= draw_comp_chunk($pallette, $clr_avg, $st_comp_head);


    return $ans;
}
//----------------------------------------------------------------------------------------------------------------------
function SREP_page_1($pers_id, $name){
    global $base, $all_data;
    $dir = REPORT_IMAGES_DIR ."/".REPORT_IMAGES_USER_DIR . $pers_id;
    $title = "
        height: 900px; 
        width: 800px; 
        background-image-resize: 4; 
        margin: 0 auto;
    ";
    $page = $base;
    $page .= "<body>";
    $page .= "<div align='center' style='background-color: #102F88; color: white; padding-top: 5px; margin-top: -20px;'>";
    $page .= "<table style='padding: 10px; color: white; width: 100%; font-weight: bold;'>
        <tr>
        <td rowspan='3'>
            <div style='text-align: center;'><img src='img/icon-114_white.png' style='width: 70px; height: 70px;'></div>
        </td>
        <td style='text-align: center; font-size: 28px;'>Отчёт по результатам оценки 360</td>
        </tr>
        <tr>
        <td style='text-align: center; font-size: 24px;'>$name</td>
        </tr>
        <tr>
        <td style='text-align: center; font-size: 14px;'>дата проведения ". date("d:m:Y", $all_data["start_date"]) ." - ". date("d:m:Y", $all_data["end_date"]) . "</td>
        </tr>
        </table>";
    $page .= "</div>";
    $page .= "<br>";
    if (!in_array($all_data["calc_type"], array(3,5,8))) // dont show web-diag for 3 report-typed of calculations
    {
        $url = $dir . "/wc_focus_comcats.png"; // group_comp_graph_
        $page .= "<div style='background: url($url) no-repeat 50%; $title'></div>";
    }
        //$page .= SREP_comp_avgs_table(false, true);
    $page .= "</body>";
    return $page;
}
//----------------------------------------------------------------------------------------------------------------------
function SREP_page_2($res_table){
    global $base;

    $page = $base;
    $page .= "<body>";
    //$page .= SREP_comp_avgs_table();
    $page .= $res_table;
    $page .= "</body>";
    return $page;
}
//----------------------------------------------------------------------------------------------------------------------
function SREP_page_3($pers_id){
    global $base;

    $page = $base;
    $title = "
            height: 600px; 
            width: 1000px; 
            background-image-resize: 4; 
            margin: 0 auto;
        ";
    $dir = REPORT_IMAGES_DIR ."/".REPORT_IMAGES_USER_DIR . $pers_id;
    $url = $dir . "/djo_graph.png"; // group_comp_graph_

    $page .= "<body>";
    $page .= "<div style='background: url($url) no-repeat 50%; $title'></div>";
    $page .= "</body>";
    return $page;
}
// -------------------------------------------------------------------------------------------------------------------
if (
    (isset($_GET["name"]) && isset($_GET["pers_id"]) && isset($_GET["k"]))
    ||
    (isset($_POST["name"]) && isset($_POST["pers_id"]) && isset($_POST["k"]))
    )// $_SERVER["REQUEST_METHOD"] === "GET" &&
{
    (isset($_GET["name"])) ? $name = $_GET["name"] : $name = $_POST["name"];
    (isset($_GET["pers_id"])) ? $pers_id = $_GET["pers_id"] : $pers_id = $_POST["pers_id"];
    (isset($_GET["k"])) ? $key = $_GET["k"] : $key = $_POST["k"];

    if (isset($_GET["action"]))
        $action = $_GET["action"];
    elseif (isset($_POST["action"]))
        $action = $_POST["action"];
    else
        $action = "";

    if (isset($_GET["batch"]))
        $batch = $_GET["batch"];
    elseif (isset($_POST["batch"]))
        $batch = $_POST["batch"];
    else
        $batch = null;


    $html = array();
    file_put_contents("show_key.txt", $key);
    $filename = REPORT_TEMPDATA_FILENAME . "_" . $key . ".txt";
    $all_data = file_get_contents($filename);
    $all_data = json_decode($all_data, true);
    $report_calc_type = $all_data["calc_type"];
    $all_data["cat_names_list"] = [];
    foreach ($all_data["res"][0]["cat_list"] as $cat)
        array_push($all_data["cat_names_list"], $cat["name"]);

    unlink($filename); //#TEST LATER MUST BE ACTIVATED
    $base = SREP_get_base();
    //1st PAGE - TITLE ---------------------------------------------------
    array_push($html, SREP_page_1($pers_id, $name));
    array_push($html, SREP_page_2($all_data["table"]));
    if ($all_data["is_djo"])
        array_push($html, SREP_page_3($pers_id));

    include('plugins/MPDF/mpdf.php'); // local

    $filename = "Plarium360_отчет_[$name]_[" .date("d-m-Y H_i_s", time()) ."].pdf";
    $mpdf = new mPDF();
    $mpdf->charset_in = 'utf-8';//'cp1251';
    $mpdf->ignore_invalid_utf8 = true;
    $edge_margin = 0;
    foreach ($html as $ord => $page)
    {
        if ($ord)
            $mpdf->AddPage('L',0,0,0, $edge_margin,10,10,10,10);
        else
            $mpdf->AddPage('P',0,0,0, $edge_margin,$edge_margin,$edge_margin,$edge_margin,$edge_margin);
        $mpdf->WriteHTML($page);
    }

    if ($action)
    {
        switch ($action){
            case "save":
                $mpdf->Output($filename, "F");
                if ($batch !== null)
                {
                    // Create dir
                    if (!is_dir(BATCH_DIR))
                        mkdir(BATCH_DIR, 0777, true);

                    $batch_filename = BATCH_DIR ."/batch_list_$pers_id.txt";
                    if (!file_exists($batch_filename))
                        $batch_list = array();
                    else
                        $batch_list = json_decode(file_get_contents($batch_filename));
                    array_push($batch_list, $filename);
                    file_put_contents($batch_filename, json_encode($batch_list));
                    echo "report_batched";
                }
                else
                    echo "report_saved";
                break;

            case "load":
                $mpdf->Output($filename, "D");
                echo $filename;
                break;

            case "show":
                $mpdf->Output($filename, "I");
                echo $filename;
                break;
        }
    }
    else
    {
        $mpdf->Output($filename, "I"); // I - show in browser
    }

}
//else echo json_encode($_POST);
?>
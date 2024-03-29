<?php
header('Access-Control-Allow-Origin: *');
header('Content-type: text/html; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");


define("SEC_PER_DAY", 60 * 60 * 24);

define("SERV_LOG_FILE","log.txt");
define("SUPP_LOG_FILE","support_reports.txt");
define("COMMENTS_FILE","user_feedback.txt");
define("TEMP_DATA_DIR", "temp_data");
define("BATCH_DIR", "batch_lists");
define("LETTER_TEMPLATES_DIR", "letter_templates");
define("PERSONIFY_ORDERS_LIST", "personify_orders.txt"); // backup for orders on project
define("BACKUP_ANSWERS_DIR", "answers_backup"); // backup for orders on project
define("BACKUP_DELETED_QZS_DIR", "deleted_qz_backup"); // backup for orders on project
define("BACKUP_QZS_BLUEPRINT", "backup_qz_blueprints"); // backup for orders on project
define("FRESH_QZS_BACKUP_DIR", "fresh_qz_backup"); // backup for orders on project
//define("REPORT_IMAGES_DIR", "report_images"); // backup for orders on project
include_once "db_auth.php";
include_once "common.php";
include_once "mailer.php";
include_once "calculations.php";

if (!isset($_SESSION))
    session_start();

class DBase{
    private $_db;
    private $_db_error_reporter;
    public  $recData;

//****--------------------------------------------------------------------------------------------------------------****
    function __construct(){
    }
//****--------------------------------------------------------------------------------------------------------------****
    function build_link($indexes)
    {
        $group = &$_SESSION["resp_g"][$indexes["group"]];
        $quiz = &$group["quiz"][$indexes["quiz"]];
        $resp = &$_SESSION["resp"][$indexes["resp"]];
        $iter = &$quiz["iter_list"][$indexes["iter"]];

        $group_part = $group["ukey"];
        $quiz_part = $quiz["ukey"];
        $resp_part = $resp["ukey"];
        $iter_part = $iter["ukey"];
        // Link builds always in that order group->resp->quiz->iteration
        $link = DURL . "client.php?qz=" . $group_part.$resp_part.$quiz_part.$iter_part;
        return $link;
    }
//****------------------------------------------------------------------------------------------------------------------
    function get_ddList($mode,$ind=false){
        $res = "<select";

        if ($mode === "deli"){
            $res .= " class='prj_new_ddDeli'>";
            $res .= "<option>не выбрано</option>";
            for ($i=0; $i<count($_SESSION["delis"]); $i++){
                $name = $_SESSION['delis'][$i][1];
                $res .= "<option>$name</option>";
            }
        }
        elseif ($mode === "qbook"){
            $res .= " class='prj_new_ddQbook'>";
            $res .= "<option>не выбрано</option>";
            for ($i=0; $i<count($_SESSION["qbooks"]); $i++){
                $name = $_SESSION['qbooks'][$i][0];
                $res .= "<option>$name</option>";
            }
        }
        elseif ($mode === "ans_scheme"){
            $res .= " class='prj_new_ddAnsSch'>";
            $res .= "<option>не выбрано</option>";
            for ($i=0; $i<count($_SESSION["ansSchemes"]); $i++){
                $name = $_SESSION['ansSchemes'][$i][1];
                $res .= "<option>$name</option>";
            }
        }
        elseif ($mode === "categories"){
            if ($ind*1 === 0) return "самооценка";
            else {
                $res .= " class='pers_cats'";
                for ($i=0; $i<9; $i++){
                    $res .= "<option";
                    // $ind tell's picked category of current respondent's dd_list
                    if ($i === $ind*1) $res .= " selected='selected'";
                    $res .= ">";
                    // Пометить иным шрифтом исходную категорию
                    switch ($i){
                        case 0: $res .= "самооценка";break;
                        case 1: $res .= "друзья";break;
                        case 2: $res .= "родственники";break;
                        case 3: $res .= "коллеги";break;
                        case 4: $res .= "руководители";break;
                        case 5: $res .= "подчиненные";break;
                        case 6: $res .= "сотрудники";break;
                        case 7: $res .= "клиенты";break;
                        case 8: $res .= "партнеры";break;
                    }
                    $res .= "</option>";
                }
            }
        }
        $res .= "</select>";
        return $res;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function DB_conn(){
        //$this->_db = new mysqli(SERVER, USER, PASS, DATABASE);
        $this->_db = new PDO('mysql:host='.SERVER.';dbname='.DATABASE, USER, PASS);
        /*
        if ($this->_db->connect_error)
        {
            log_add("pers->error on connection try to Database: " . $this->_db->connect_error);
            die(
                'Ошибка подключения (' . $this->_db->connect_errno . ') '. $this->_db->connect_error
            );
        }
        */
        $this->_db ->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);// ERRMODE_EXCEPTION ERRMODE_WARNING
        $this->_db_error_reporter = new mysqli_driver();
        $this->_db_error_reporter->report_mode = MYSQLI_REPORT_STRICT;
        $this->setUTF8();
    }
//****--------------------------------------------------------------------------------------------------------------****
    function DB_close(&$handle)
    {
        $handle = null;
        $this->_db = null;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function setUTF8(){
        $this->send_query("SET NAMES 'utf8'");
        $this->send_query("SET CHARACTER SET 'utf8'");
        $this->send_query("SET SESSION collation_connection = 'utf8_general_ci'");
    }
//****--------------------------------------------------------------------------------------------------------------****
    function set_owner_filter()
    {
        $ans = $this->set_owner_id();
        // Super-admin - get all
        if ($ans === 1)
            $ans = "";
        else
            $ans = " WHERE pers_id = null OR pers_id = $ans";

        return $ans;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function madeby_filter($is_cumulative=false)
    {
        $ans = "";
        if (!$is_cumulative)
            $ans .= " WHERE";
        $ans .= " madeby = -1";
        if (isset($_SESSION["pers"]))
            $ans .= " OR madeby = " . $_SESSION["pers"]["id"];
        return $ans;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function set_owner_id()
    {
        $ans = null;
        if (isset($_SESSION) && isset($_SESSION["pers"])&& isset($_SESSION["pers"]["id"]))
            $ans = intval($_SESSION["pers"]["id"]);
        return $ans;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function PasswordRecover(){
        $log_data = json_decode($_POST["data"]);
        $mail = shield($log_data[0]);
        $phone = implode(",", $log_data[1]);
        $this->DB_conn();
        $q = $this->send_query("SELECT count(lgn) FROM recr WHERE lgn = '$mail' AND phone = '$phone'");
        $bro = $q->fetch(PDO::FETCH_ASSOC);

        if ($bro[0]*1 === 1) {
            $newpass = rand(10000000000,99999999000);
            $newpass_cyph = $this->encrypt($newpass);
            $this->send_query("UPDATE recr SET pass = '$newpass_cyph' WHERE lgn = '$mail' AND phone = '$phone'");
            $subject = "Проект «оценка методом 360 градусов»: Восстановление пароля";
            $message = "Добрый день!<br>
                        Ваш новый пароль: $newpass. <br>
                        Пожалуйста, при следующей авторизации (в целях безопасности) смените его на свой.<br>
                        Если Вы не использовали функцию восстановления пароля, пожалуйста, обратитесь по адресу технической поддержки проекта Support@mental-skills.ru.<br>
                        С уважением, команда «Mental-Skills».";
            sendMail($subject, $message, $log_data[0]);
            echo true;
        }
        else {
            echo false;
        }
        $this->DB_close($q);
        return "pass_recover";
    }
//****--------------------------------------------------------------------------------------------------------------****
    function ChangePassword(){
        $this->DB_conn();
        $data = json_decode($_POST["data"]);
        $pass = $this->encrypt($data[0]);
        $passN = $this->encrypt($data[1]);
        $q = $this->send_query("SELECT count(lgn) FROM recr WHERE pass = '$pass'");
        $resp = $q->fetch(PDO::FETCH_ASSOC);

        if ((int)$resp[0] >= 1) {
            $this->send_query("UPDATE recr SET pass = '$passN' WHERE pass = '$pass'");
            echo true;
        }
        else
            echo false;
        $this->DB_close($q);
    }
//****--------------------------------------------------------------------------------------------------------------****
    function add_tag($tag="div", $content, $classes=null)
    {
        $res = "<$tag";
        if ($classes)
        {
            $class_list = explode(",", $classes);
            $res .= " class='";
            foreach ($class_list as $class)
                $res .= $class;
            $res .= "'";
        }

        $res .= " >$content</$tag>";
        return $res;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function chkRegisterMail($mail){
        $this->DB_conn();
        $res = $this->send_query("SELECT COUNT(lgn) FROM recr WHERE lgn = '$mail' ");
        $bro = $res->fetch(PDO::FETCH_ASSOC);
        $this->DB_close($q);
        if ($bro[0]*1 !== 1) return 0; else return 1;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function get_param($array, $field, $value, $seek_field)
    {
        $ans = null;
        if (is_array($array))
        {
            foreach ($array[$field] as $key_index => $entry)
                if ($array[$field] === $value)
                {
                    if ($seek_field === "index_order")
                        $ans = $key_index;
                    else
                        $ans = $entry[$seek_field];
                    break;
                }
        }
        else
        {
            log_add("[get_param] => no array given : array = $array, field = $field, value = $value, seek_field = $seek_field");
            $ans = "no array given!";
        }
        return $ans;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function doKey($len,$mode,$qnt=1){
        $collection = "0,1,2,3,4,5,6,7,8,9,q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,v,b,n,m,Q,W,E,R,T,Y,U,I,O,P,A,S,D,F,G,H,J,K,L,Z,X,C,V,B,N,M";
        $collection = explode(",",$collection);
        $ans = null;
        $cQnt = count($collection);
        $doneQnt = 0; // сколько уникальный ключей сделано
        if ($mode === "resp")
            $ans = array();
        elseif ($mode === "qz")
        {
            $key_list = array();
            $q = $this->send_query("SELECT qkey FROM quiz");
            if ($q)
                while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                    array_push($key_list, $bro["qkey"]);
        }


        do {
            $sec = "";
            $pass = true;
            // 1) сгенерировать ключ
            for ($j=0; $j<$len; $j++)
                $sec .= $collection[rand(0,$cQnt-1)];

            // Check on uniquity among its relevant groups
            if ($mode === "resp")
            {
                // Get a list of unique keys
                if (!in_array($sec, $ans))
                {
                    if ($qnt === 1)
                        $ans = $sec; // for a single key request give non-array one
                    else
                        array_push($ans, $sec);
                }
                else
                    $pass = false;
            }
            elseif ($mode === "qz")
            {
                // Get a list of unique keys
                if (in_array($sec, $key_list))
                    $pass = false;
                else
                    $ans = $sec;
            }
            elseif ($mode === "pers")
            {
                $ans = $sec;
            }
            elseif ($mode === "watcher")
            {
                $w_list = array();
                $q = $this->send_query("SELECT wkey FROM watchers");
                if ($q)
                    while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                        array_push($w_list, $bro["wkey"]);

                // Если сгенериный ключ все-же уникален - записать его
                if (in_array($sec, $w_list) !== false)
                    $pass = false;
                else
                    $ans = $sec;
            }
            else // default one-key answer
                $ans = $sec;

            // если ключ на этом цикле попался уникальный - увеличить шаг
            if ($pass)
                $doneQnt++;
        } while ($doneQnt < $qnt);
        return $ans;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function send_confirm_letter($pers)
    {
        $subject = "система 360, подтверждение регистрации";
        $message = "Добро пожаловать.<br>
        Вы успешно зарегистрировались на <a href='".DURL."'>".DURL."</a>, ниже указаны ваши данные для входа.<br>
        Изменить пароль можно в разделе настройки.<br>
        
        <br>
        <b>Логин:</b> " .$pers["login"].".<br>
        <b>Пароль:</b> ". $pers["pass"];
        $mailto = $pers["mail"];
        sendMail($subject,$message,$mailto);
        /*
         <div style='text-align: center; margin: 10px auto;'>Подтвердите адрес эл. почты</div>
        <div style='text-align: center; margin: 0 auto;'>
        <a  href='https://hr-up.online/".FOLDER."/?pers_confirm=".$pers["key"]."' target='_blank'
        style='
            padding: 10px;
            background-color: #102270;
            color: white;
            border-radius: 3px;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 16px;
            text-decoration: none;
            font-weight:bold;
            display: inline-block;
            text-align: center;
            margin: 10px auto;
        '>Подтвердить</a></div>
         */

    }
//****--------------------------------------------------------------------------------------------------------------****
    function send_recovery_letter($pers)
    {
        $subject = "система 360, восстановление пароля";
        $message = "Добрый день.<br>
        Была инициирована смена пароля в системе 360 для аккаунта ".$pers["mail"].
            ".<br>Если Вы все еще хотите сменить пароль перейдите по данной ссылке 
        <a href='".DURL."/?pr_cd=" .$pers["code"]. "'>перейти</a>.
        <br>
        <b>Ваш новый пароль:</b> ". $pers["pass"];
        $mailto = $pers["mail"];
        sendMail($subject,$message,$mailto);
    }
//****--------------------------------------------------------------------------------------------------------------****
    function send_feedback_letter($pers)
    {
        $subject = $pers["head"];
        $message = "
        <b>Пользователь:</b> " .$pers["name"].".<br>
        <b>Почта:</b> ". $pers["mail"].".<br>
        <b>Телефон:</b> ". $pers["phone"].".<br>
        <b>Сообщение:</b> ". $pers["message"];
        sendMail($subject,$message,"info@hr-consulting.online", "rez");
    }
//****--------------------------------------------------------------------------------------------------------------****
    function watchers($action, $info, $reconnect=true, $flags = false)
    {
        $ans = "☼";
        if ($reconnect)
            $this->DB_conn();
        switch ($action)
        {
            case "list":
                {
                    $_SESSION["watchers"] = array();
                    $q = $this->send_query("SELECT id, mail, madeby, list, cd, ud, wkey, last_log, access_id, qz_id FROM watchers WHERE madeby = $info");

                    if ($q)
                        while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                        {
                            if ($bro["list"])
                                $bro["list"] = json_decode($bro["list"], true);
                            else
                                $bro["list"] = array();

                            $bro = digitize($bro, array("id","cd","ud","last_log","access_id","qz_id"));
                            $bro["madeby"] = $info * 1;
                            $bro["host_mail"] = null;
                            // Get host's mail
                            $z = $this->send_query("SELECT mail FROM pers WHERE id = $info");
                            if ($z)
                            {
                                $sis = $z->fetch(PDO::FETCH_ASSOC);
                                $bro["host_mail"] = $sis["mail"];
                            }
                            array_push($_SESSION["watchers"], $bro);
                        }

                    $ans = $_SESSION["watchers"];
                    break;
                }

            case "new":
                {
                    $new = $info;
                    if (!$flags["no_src_decode"])
                        $new = json_decode($new, true);
                    //$new["list"] = json_encode($new["list"]);
                    $new["wkey"] = $this->doKey(20, "watcher"); // get unique key of x chars among all watcher keys
                    $q = $this->send_query("INSERT INTO watchers SET 
                      mail = '".$new["mail"]."', 
                      madeby = ".$_SESSION["pers"]["id"].", 
                      cd = '".time()."', 
                      ud = '".time()."',
                      wkey = '".$new["wkey"]."',
                      last_log = '".time()."', 
                      access_id = '".$new["access_id"]."'");

                    if ($q)
                    {
                        $last_watcher_id = $this->_db->lastInsertId() * 1;

                        // Default answer - send new list of watchers
                        if (!$flags || isset($flags["return_list"]))
                        {
                            $ans = $this->watchers("list", $_SESSION["pers"]["id"], false);
                            $ans = json_encode($ans, JSON_UNESCAPED_UNICODE);
                        }
                        elseif (isset($flags["return_last_id"]))
                            $ans = $last_watcher_id;

                        // Send letter to watcher
                        $subject = "Получение наблюдательского доступа к проекту «оценка методом 360»";
                        $message = "Добрый день.\nДля доступа в проект пройдите по данной ссылке\n".DURL."?wid=".$new["wkey"];
                        if (!IS_LOCAL)
                            sendMail($subject,$message,$new["mail"]);
                    }
                    else
                        $ans = false;
                    break;
                }

            case "del":
                {
                    $d = json_decode($_POST['data'], true);
                    $d = digitize($d, array("ord","id"));
                    $q = $this->send_query("DELETE FROM watchers WHERE id = ". $d["id"]);
                    array_slice($_SESSION["watchers"], $d["ord"], 1);
                    $ans = true;
                    break;
                }
        }

        if ($reconnect)
            $this->DB_close($q);
        $ans = "☼" ;
        if ($ans !== "☼" && !$flags["return_none"])
            return $ans;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function results($action, $info, $reconnect=true, $no_ans = false)
    {
        $ans = "☼";
        if ($reconnect)
            $this->DB_conn();
        switch ($action)
        {

            case "list":
                {
                    $q = $this->send_query("SELECT group_id, resp_id, qst_id, qz_key, iter_key, cd, ans_val, ans_pts, qst_ord, ans_ord FROM results");

                    if ($q)
                    {
                        $owner_id = $this->set_owner_id();
                        $_SESSION["results"] = array();
                        $res_data = array();
                        while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                            array_push($res_data, $bro);
                        // no crew data (there is not a single entry except the lead-admin)
                        foreach ($res_data as $line)
                        {
                            $line["group_id"] *= 1;
                            $line["resp_id"] *= 1;
                            $line["qst_id"] *= 1;
                            $line["cd"] *= 1;
                            $line["ans_val"] *= 1;
                            $line["ans_pts"] *= 1;
                            $line["qst_ord"] *= 1;
                            $line["ans_ord"] *= 1;

                            // Filter out all the results that belong to other users
                            // try Validate by groups
                            $is_owned = false;
                            if (isset($_SESSION["resp_g"]))
                                foreach ($_SESSION["resp_g"] as $group)
                                    if(intval($group["id"]) === $line["group_id"] && $group["pers_id"] === $owner_id)
                                    {
                                        $is_owned = true;
                                        break;
                                    }
                            // try Validate by resps
                            if (!$is_owned && isset($_SESSION["resp"]))
                                foreach ($_SESSION["resp"] as $resp)
                                    if(intval($resp["id"]) === $line["resp_id"] && $resp["pers_id"] === $owner_id)
                                    {
                                        $is_owned = true;
                                        break;
                                    }
                            // try Validate by questions
                            if (!$is_owned && isset($_SESSION["qst"]))
                                foreach ($_SESSION["qst"] as $qst)
                                    if(intval($qst["id"]) === $line["resp_id"] && $qst["pers_id"] === $owner_id)
                                    {
                                        $is_owned = true;
                                        break;
                                    }

                            if ($is_owned)
                                array_push($_SESSION["results"], $line);
                        }
                        return $_SESSION["results"];
                    }
                    else
                    {
                        log_add("results->list: empty Database data on request!");
                        return null;
                    }
                    break;
                }

            case "save_answer":
                {
                    $data = json_decode($info, true);
                    $key_str = $data["key"];
                    $key = array();
                    $key["resp"] = substr($key_str, 10, 10);
                    $key["qz"] = substr($key_str, 20, 10);
                    $key["iter"] = substr($key_str, 30, 10);
                    $resp_id = $data["resp_id"] * 1;
                    if (!isset($data["ans_ord"]))
                        $data["ans_ord"] = null;

                    if ($data["op_type"] === "insert")
                    {
                        try
                        {
                            $q = $this->send_query("INSERT INTO results SET
                            qst_id = " . $data["qst_id"] . ",
                            ans_val = " . $data["ans_val"] . ",
                            ans_pts = '" . $data["ans_pts"] . "',
                            ans_ord = '" . $data["ans_ord"] . "',
                            qst_ord = '" . $data["qst_ord"] . "',
                            group_id = " . $data["group_id"] . ",
                            resp_id = " . $data["resp_id"] . ",
                            qz_key = '" . $key["qz"] . "',
                            iter_key = '" . $key["iter"] . "',
                            cd = " . time());
                        } catch (PDOException $e) {
                            log_add("resp->save_answer, insert: " . $e->getMessage());
                        }
                    }
                    else
                    {
                        try
                        {
                            $q = $this->send_query("UPDATE results SET
                            ans_val = " . $data["ans_val"] . ",
                            ans_pts = '" . $data["ans_pts"] . "',
                            qst_ord = '" . $data["qst_ord"] . "',
                            cd = " . time() .
                                " WHERE resp_id = ". $data["resp_id"]. "
                                AND qst_id = " . $data["qst_id"] . "
                                AND group_id = " . $data["group_id"] . "
                                AND qz_key = '" . $key["qz"] . "'
                                AND iter_key = '" . $key["iter"] ."'");
                        } catch (PDOException $e) {
                            log_add("resp->save_answer, update: " . $e->getMessage());
                        }
                    }
                    //

                    if ($q)
                        $ans = "done";
                    else
                    {
                        log_add("resp->save_answer: error on saving a resp answer!");
                        $ans = "fail";
                    }
                    break;
                }

            case "graph":
                {
                    switch ($info[0])
                    {
                        case "trajectory":

                            $data = json_decode($info[1], true);
                            $y = $data["axis_y"];
                            $x = $data["axis_x"];
                            // Build a dataset
                            $MyData = new pData();
                            $path_to_fonts = "../pChart/fonts/";
                            foreach ($data["lines"] as $key => &$line)
                            {
                                // Convert zero-data to pChart format
                                foreach ($line["points"] as $point_key => &$point)
                                    if ($point === 0)
                                        $point = 0.3;

                                $MyData->addPoints($line["points"],$line["name"]);


                                if ($key === 0)
                                    $MyData->setSerieWeight($line["name"], 4);
                                else
                                    $MyData->setSerieWeight($line["name"], 1.5);
                            }
                            /*
                            $MyData->addPoints(array(-4,VOID,VOID,12,8,3),"Probe 1");
                            $MyData->addPoints(array(3,12,15,8,5,-5),"Probe 2");
                            $MyData->addPoints(array(2,7,5,18,19,22),"Probe 3");
                            */
                            //$MyData->setSerieTicks("Probe 2",4);
                            //$MyData->setSerieWeight("Probe 3",2);
                            $MyData->setPalette($x["name"], array("R"=>0, "G"=>0, "B"=>0, "Alpha"=>100));

                            /*
                            $MyData->addPoints(array(0.5, 2.5),"ghost");
                            $MyData->setSerieWeight("ghost", 0.1);
                            $MyData->setPalette("ghost", array("R"=>255, "G"=>255, "B"=>255, "Alpha"=>0));
                            */

                            $MyData->setAxisName(0,$y["name"]);
                            //$MyData->setAxisName(0,"Temperatures");

                            $name = $x["name"];
                            $MyData->addPoints($x["grades"],$x["name"]);
                            $MyData->setSerieDescription($x["name"],$name);
                            $MyData->setAbscissa($name);

                            $graph_L = 10;

                            // Create the 1st chart
                            $myPicture = new pImage(900,520,$MyData);
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>12,"FontWeight"=>300));
                            //$myPicture->drawGradientArea(0,0,700,500,DIRECTION_VERTICAL,array("StartR"=>255,"StartG"=>255,"StartB"=>255,"EndR"=>189,"EndG"=>198,"EndB"=>222,"Alpha"=>100));


                            $myPicture->setGraphArea($graph_L,10,640,440);

                            $myPicture->drawFilledRectangle($graph_L,0,640,520,array("R"=>255,"G"=>255,"B"=>255));//,"Surrounding"=>-200,"Alpha"=>10
                            $myPicture->drawScale(array("DrawSubTicks"=>FALSE,"GridR"=>0,"GridG"=>0,"GridB"=>0,"GridAlpha"=>20, "MinDivHeight" => 100, "DrawYLines" => false, "Mode"=>SCALE_MODE_MANUAL, "ManualScale"=> array(0=>array("Min"=>0.7,"Max"=>3.2))));
                            //$myPicture->drawScale(array("DrawSubTicks"=>TRUE));
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>12,"FontWeight"=>300));
                            $myPicture->setShadow(TRUE,array("X"=>1,"Y"=>1,"R"=>0,"G"=>0,"B"=>0,"Alpha"=>10));

                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>12));
                            $myPicture->drawText(190,490,$name,array("R"=>0,"G"=>0,"B"=>0));

                            //$myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>10));
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>10,"R"=>0,"G"=>0,"B"=>0)); // $path_to_fonts."

                            //$MyData->setAxisDisplay(0,AXIS_FORMAT_PRECISION,"1");
                            //$MyData->setAxisDisplay(0,AXIS_FORMAT_METRIC,0);
                            // 14.8

                            $myPicture->drawFilledRectangle($graph_L,10,640,135,array("R"=>200,"G"=>255,"B"=>200,"Alpha"=>20));//,"Surrounding"=>-200
                            $myPicture->drawFilledRectangle($graph_L,136,640,315,array("R"=>255,"G"=>255,"B"=>200,"Alpha"=>20));//,"Surrounding"=>-200
                            $myPicture->drawFilledRectangle($graph_L,316,640,440,array("R"=>255,"G"=>200,"B"=>200,"Alpha"=>20));//,"Surrounding"=>-200
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>20,"R"=>120,"G"=>120,"B"=>120));
                            $myPicture->drawText($graph_L + 10,40,"высокий уровень",array("R"=>0,"G"=>0,"B"=>0,"Alpha"=>25));
                            $myPicture->drawText($graph_L + 10,166,"средний уровень",array("R"=>0,"G"=>0,"B"=>0,"Alpha"=>25));
                            $myPicture->drawText($graph_L + 10,346,"низкий уровень",array("R"=>0,"G"=>0,"B"=>0,"Alpha"=>25));


                            $myPicture->drawLineChart(array("DisplayValues"=>FALSE,"DisplayColor"=>DISPLAY_MANUAL));
                            $myPicture->setShadow(FALSE);

                            // Write the legend
                            //$MyData->removeSerie("ghost");
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>12,"R"=>0,"G"=>0,"B"=>0));
                            $myPicture->drawLegend(650,30,array(
                                "Style"=>LEGEND_NOBORDER,
                                "Mode"=>LEGEND_VERTICAL,
                                "R"=>255,
                                "G"=>255,
                                "B"=>255));
                            $myPicture->render("img/traj_graph.png");
                            break;

                        case "test_results":

                            $data = json_decode($info[1], true);
                            $y = $data["axis_y"];
                            $x = $data["axis_x"];
                            // Build a dataset
                            $MyData = new pData();
                            $max_resp_qnt = 0;
                            $path_to_fonts = "../pChart/fonts/";
                            foreach ($data["lines"] as $key => &$line)
                            {
                                // Convert zero-data to pChart format
                                foreach ($line["points"] as $point)
                                    if ($max_resp_qnt < $point)
                                        $max_resp_qnt = $point;

                                $MyData->addPoints($line["points"],$line["name"]);
                                $MyData->setSerieWeight($line["name"], 2);
                            }
                            /*
                            $MyData->addPoints(array(-4,VOID,VOID,12,8,3),"Probe 1");
                            $MyData->addPoints(array(3,12,15,8,5,-5),"Probe 2");
                            $MyData->addPoints(array(2,7,5,18,19,22),"Probe 3");
                            */
                            //$MyData->setSerieTicks("Probe 2",4);
                            //$MyData->setSerieWeight("Probe 3",2);
                            $MyData->setPalette($x["name"], array("R"=>0, "G"=>0, "B"=>0, "Alpha"=>100));

                            /*
                            $MyData->addPoints(array(0.5, 2.5),"ghost");
                            $MyData->setSerieWeight("ghost", 0.1);
                            $MyData->setPalette("ghost", array("R"=>255, "G"=>255, "B"=>255, "Alpha"=>0));
                            */

                            $MyData->setAxisName(0,$y["name"]);
                            //$MyData->setAxisName(0,"Temperatures");

                            $name = $x["name"];
                            $MyData->addPoints($x["grades"],$x["name"]);
                            $MyData->setSerieDescription($x["name"],$name);
                            $MyData->setAbscissa($name);

                            //$MyData->setAxisDisplay(0,AXIS_FORMAT_PRECISION,"1");
                            $MyData->setAxisDisplay(0,AXIS_FORMAT_METRIC,0);

                            $graph_L = 60;

                            // Create the 1st chart
                            $myPicture = new pImage(900,520,$MyData);
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>12,"FontWeight"=>300));
                            //$myPicture->drawGradientArea(0,0,700,500,DIRECTION_VERTICAL,array("StartR"=>255,"StartG"=>255,"StartB"=>255,"EndR"=>189,"EndG"=>198,"EndB"=>222,"Alpha"=>100));


                            $myPicture->setGraphArea($graph_L,20,640,450);

                            $myPicture->drawFilledRectangle($graph_L,0,640,520,array("R"=>255,"G"=>255,"B"=>255));//,"Surrounding"=>-200,"Alpha"=>10
                            $myPicture->drawScale(array(
                                "DrawSubTicks"=>TRUE,
                                "GridR"=>0,
                                "GridG"=>0,
                                "GridB"=>0,
                                "GridAlpha"=>20,
                                "MinDivHeight" => 150,
                                "Mode"=>SCALE_MODE_MANUAL,
                                "ManualScale"=> array(0=>array("Min"=>0,"Max"=>$max_resp_qnt), 1=>array("Min"=>0,"Max"=>5)))); // "DrawYLines" => true,
                            //$myPicture->drawScale(array("DrawSubTicks"=>TRUE));
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>12,"FontWeight"=>300));
                            $myPicture->setShadow(TRUE,array("X"=>1,"Y"=>1,"R"=>0,"G"=>0,"B"=>0,"Alpha"=>10));

                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>12));
                            $myPicture->drawText(190,490,$name,array("R"=>0,"G"=>0,"B"=>0));

                            //$myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>10));
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>10,"R"=>0,"G"=>0,"B"=>0)); // $path_to_fonts."

                            //$myPicture->drawFilledRectangle($graph_L,20,640,163,array("R"=>255,"G"=>255,"B"=>255,"Alpha"=>100));//,"Surrounding"=>-200
                            //$myPicture->drawFilledRectangle($graph_L,20,640,163,array("R"=>200,"G"=>255,"B"=>200,"Alpha"=>20));//,"Surrounding"=>-200
                            //$myPicture->drawFilledRectangle($graph_L,163,640,306,array("R"=>255,"G"=>255,"B"=>200,"Alpha"=>20));//,"Surrounding"=>-200
                            //$myPicture->drawFilledRectangle($graph_L,306,640,450,array("R"=>255,"G"=>200,"B"=>200,"Alpha"=>20));//,"Surrounding"=>-200
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>20,"R"=>120,"G"=>120,"B"=>120));
                            //$myPicture->drawText($graph_L + 10,335,"низкий уровень",array("R"=>0,"G"=>0,"B"=>0,"Alpha"=>25));
                            //$myPicture->drawText($graph_L + 10,190,"средний уровень",array("R"=>0,"G"=>0,"B"=>0,"Alpha"=>25));
                            //$myPicture->drawText($graph_L + 10,50,"высокий уровень",array("R"=>0,"G"=>0,"B"=>0,"Alpha"=>25));
                            $myPicture->drawLineChart(array(
                                "DisplayValues"=>FALSE,
                                "DisplayColor"=>DISPLAY_MANUAL,
                                "DisplayOffset" => "UP",
                                "DisplayR" => 0,
                                "DisplayG" => 0,
                                "DisplayB" => 0));
                            $myPicture->setShadow(FALSE);

                            // Write the legend
                            //$MyData->removeSerie("ghost");
                            $myPicture->setFontProperties(array("FontName"=>$path_to_fonts."verdana.ttf","FontSize"=>12,"R"=>0,"G"=>0,"B"=>0));
                            $myPicture->drawLegend(650,20,array(
                                "Style"=>LEGEND_NOBORDER,
                                "Mode"=>LEGEND_VERTICAL,
                                "R"=>255,
                                "G"=>205,
                                "B"=>205));
                            $myPicture->render("img/traj_graph.png");
                            break;
                    }

                    $ans = json_encode($data);
                }
                break;

            case "to_excell":
                {
                    //$data = json_decode($info, true);
                    file_put_contents("table_export_". $_SESSION["pers"]["id"] .".txt", $info);
                    //$_SESSION["extycs"] = $data;
                    //header("Location: Answers_exporter.php");
                    $ans = "done";
                }
                break;

            case "base64_image_save":
                {
                    // IMAGES STORAGE
                    if (!is_dir(REPORT_IMAGES_DIR))
                        mkdir(REPORT_IMAGES_DIR, 0777, true);

                    if (isset($_SESSION["pers"]))
                    {
                        $data = json_decode($info);
                        //$image = base64_decode($data->image);
                        $image = $_POST["base64data"];
                        $image = str_replace('data:image/png;base64,', '', $image);
                        $image = str_replace(' ', '+', $image);
                        $image = base64_decode($image);
                        //$image = base64_decode($_POST["base64data"]); // base64data

                        $dir = REPORT_IMAGES_DIR ."/".REPORT_IMAGES_USER_DIR . $_SESSION["pers"]["id"];
                        // PERS IMAGES FOLDER
                        if (!is_dir($dir))
                            mkdir($dir, 0777, true);


                        $full_dir = $dir ."/" . $data->name . ".png"; // ful dir to image
                        file_put_contents($full_dir, $image); // save image
                        $ans = $full_dir; // send image's full dir to
                    }
                    else
                        $ans = false;


                }
                break;

            case "batch_load":
                {
                    $data = json_decode($_POST["data"]);
                    if ($data->action === "zip_delete")
                    {
                        unlink($data->zip_name);
                        unlink(BATCH_DIR . "/batch_list_". $data->pers_id .".txt");
                        echo "zip_deleted";
                    }
                    else
                    {
                        // BATCH_DIR ."/batch_list_$id.txt";
                        $zipfile_name = "360_".mb_strtolower($data->qz_name)."_отчеты_" . date("d-m-Y H_i_s", time()) . ".zip";
                        $zip_reports_list = json_decode(file_get_contents(DURL . BATCH_DIR . "/batch_list_".$data->pers_id.".txt"));
                        // NOw stuff all the created reports into zipped archive
                        $archive = new ZipArchive();
                        //$archive->filename = "test_zip.zip";
                        $res = $archive->open($zipfile_name, ZipArchive::CREATE);
                        if ($res === TRUE)
                        {
                            foreach ($zip_reports_list as $filename)
                                $archive->addFile($filename);
                            $archive->close();
                            // remove archived reports
                            foreach ($zip_reports_list as $filename)
                                unlink($filename);

                            echo $zipfile_name;
                        }
                        else
                        {
                            echo '☼ошибка с кодом:' . $res;
                        }
                    }
                }
                break;

        }
        if ($reconnect)
            $this->DB_close($q);
        if ($ans !== "☼" && !$no_ans)
            return $ans;
    }
//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
    function answer_set($action,$mode=false){
        if ($action === "list")
        {
            $this->DB_conn();
            $_SESSION['ansSchemes'] = array();
            $as = &$_SESSION['ansSchemes'];
            $owner_id = $_SESSION['pers']['id'];
            $cond = $this->set_select_cond($owner_id);

            $res = $this->send_query("SELECT id, name, data, aveval FROM answer_set " . $cond);
            if ($res)
                while ($bro = $res->fetch(PDO::FETCH_ASSOC))
                {
                    $bro = digitize($bro, array("aveval","id"));
                    if ($bro["data"])
                        $bro["data"] = json_decode($bro["data"], true);
                    else
                        $bro["data"] = array();
                    $bro["aveval"] *= 1;
                    array_push($as, $bro);
                }
            else
                log_add("answer_set->list: $res");
            $this->DB_close($res);
        }

    }


//****--------------------------------------------------------------------------------------------------------------****
    function resp($action, $info, $reconnect=true, $no_ans = false)
    {
        $ans = "☼";
        if ($reconnect)
            $this->DB_conn();
        switch ($action)
        {
            case "list":
                {
                    $_SESSION["resps"] = array();
                    $q = $this->send_query("SELECT id, fio, mail, data, spec, cd, ud, last_upd, status FROM resp WHERE madeby = $info");

                    if ($q)
                        while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                        {
                            if ($bro["data"])
                                $bro["data"] = json_decode($bro["data"], true);
                            else
                                $bro["data"] = array();

                            $bro = digitize($bro, array("id","cd","ud","last_upd","status"));
                            array_push($_SESSION["resps"], $bro);
                        }

                    $ans = $_SESSION["resps"];
                    break;
                }

            case "update":
                {
                    $upd = json_decode($info, true);
                    $upd["ud"] = time();

                    $q = $this->send_query("UPDATE resp SET
                  name = '".$upd["name"]."',
                  mail = '".$upd["mail"]."',
                  spec = '".$upd["spec"]."',
                  dep_id = '".$upd["dep_id"]."',
                  ud = '".$upd["ud"]."',
                  birth_date = '".$upd["birth_date"]."',
                  sex = '".$upd["sex"]."',
                  mail = '".$upd["mail"]."',
                  job_date = '".$upd["job_date"]."'
                  WHERE id = ".$upd["id"]);

                    if ($q)
                    {
                        $id = $upd["iid"] * 1;
                        // remove shortcut-dummy entries for not spamming them to Session var
                        unset($upd["iid"]);
                        if (is_int($id))
                        {
                            // refresh all editable pers data inside session array
                            foreach ($upd as $key => $val)
                                $_SESSION["resp"][$id][$key] = $val;
                            // send fresh data on this pers to sync it with front end
                            echo json_encode($_SESSION["resp"][$id], JSON_UNESCAPED_UNICODE);
                        }
                        else
                        {
                            log_add("resp->update: invalid index of updatable respondent");
                            echo false;
                        }
                    }
                    // Entry in DB wasn't successfully updated
                    else
                        echo false;
                    break;
                }

            case "del":
                {
                    $d = json_decode($info);
                    $resp_id = purify($d->resp_id, "int");
                    $pers_id = purify($d->pers_id, "int");
                    if ($pers_id && $resp_id)
                    {
                        try
                        {
                            $q = $this->send_query("DELETE FROM resp WHERE id = $resp_id");
                        }
                        catch (PDOException $e)
                        {
                            log_add("resp_g->del: ". $e->getMessage());
                        }


                        if ($q)
                        {
                            // refresh crew list and send it back
                            $ans = $this->resp("list", $pers_id, false);
                            // refresh crew list and send it back
                            $ans = json_encode($ans, JSON_UNESCAPED_UNICODE);
                        }
                        else
                        {
                            log_add("resp->del: error on deleting a resp entry!");
                            $ans = "fail";
                        }
                    }
                    else
                    {
                        if (!$pers_id)
                            log_add("resp->del: invalid index of pers_id to delete!");
                        if (!$resp_id)
                            log_add("resp->del: invalid index of resp_id to delete!");
                        $ans = "fail";
                    }
                    break;
                }

            case "import":
                {
                    $d = json_decode($info, true);
                    $new_resps_list = $d["resps_list"];
                    $date = time();
                    $owner_id = $_SESSION["pers"]["id"] * 1;
                    $resps_id_list = array();
                    $resps_cat_list = array();
                    $existing_resps = array();
                    file_put_contents("resps_id_list.txt", json_encode($resps_id_list));
                    // UPDATE all existing resps
                    // Add all new resps (with id's === null)
                    $trans = $this->_db->prepare("UPDATE resp SET fio = ?, spec = ?, ud = $date, last_upd = $date WHERE id = ? AND madeby = $owner_id");
                    foreach ($new_resps_list as $focus_ord => $focus_group)
                    {
                        array_push($resps_id_list, array());
                        array_push($resps_cat_list, array());
                        file_put_contents("resps_id_list.txt", "\n". json_encode($resps_id_list), FILE_APPEND);
                        foreach ($focus_group as $resp_ord => $resp)
                            // For existing resps only
                            if ($resp["id"] !== null)
                            {
                                $mail = mb_strtolower($resp["mail"]);
                                $trans->execute(array(
                                    $resp["fio"],
                                    $resp["spec"],
                                    $resp["id"]
                                ));
                                $resps_id_list[$focus_ord*1][$resp_ord*1] = $resp["id"];
                                $resps_cat_list[$focus_ord*1][$resp_ord*1] = $resp["cat_id"];

                                // Fill array of unique resps that are already added to not dublicate shit in DB
                                $is_new_resp = true;
                                if (count($existing_resps))
                                    foreach ($existing_resps as $rslot)
                                        if ($rslot["mail"] === $mail)
                                        {
                                            $is_new_resp = false;
                                            break;
                                        }

                                if ($is_new_resp)
                                    array_push($existing_resps, array("mail" => $mail, "id" => $resp["id"] * 1));
                            }
                    }

                    // ADD NEW resps (with id's === null)
                    $trans = $this->_db->prepare("INSERT resp SET fio = ?, mail = ?, spec = ?, cd = $date, ud = $date, last_upd = $date, madeby = $owner_id");
                    foreach ($new_resps_list as $focus_ord => $focus_group)
                        foreach ($focus_group as $resp_ord => $resp)
                        {
                            $mail = mb_strtolower($resp["mail"]);
                            // find if resp with that mail was already added, and get his id instead
                            foreach ($existing_resps as $ex_resp)
                                if ($ex_resp["mail"] === $mail)
                                {
                                    $resp["id"] = $ex_resp["id"];
                                    break;
                                }

                            // For new resps only
                            if ($resp["id"] === null)
                            {
                                $trans->execute(array(
                                    $resp["fio"],
                                    $resp["mail"],
                                    $resp["spec"]
                                ));
                                $resp["id"] = $this->_db->lastInsertId() * 1; // get new resp's global id

                                // Fill array of unique resps that are already added to not dublicate shit in DB
                                $is_new_resp = true;
                                if (count($existing_resps))
                                    foreach ($existing_resps as $rslot)
                                        if ($rslot["mail"] === $mail)
                                        {
                                            $is_new_resp = false;
                                            break;
                                        }

                                if ($is_new_resp)
                                    array_push($existing_resps, array("mail" => $mail, "id" => $resp["id"] * 1));
                            }
                            $resps_id_list[$focus_ord*1][$resp_ord*1] = $resp["id"]; // gather all new id's in same focus-groups structure
                            $resps_cat_list[$focus_ord*1][$resp_ord*1] = $resp["cat_id"];
                        }

                    $ans = array();
                    $ans["resps"] = $this->resp("list", $owner_id, false); // recollect all resp info and send it

                    // Reformat array to make indexes into a stright order, cuz apparently if the're not - json codes that array as object ffs
                    $ans["resps_id_list"]  = array();
                    foreach ($resps_id_list as $gr)
                    {
                        $slot = array();
                        $ord = 0;
                        foreach ($gr as $r)
                        {
                            array_push($slot, $gr[$ord]);
                            $ord++;
                        }
                        array_push($ans["resps_id_list"], $slot);
                    }
                    $ans["resps_cat_list"] = array();
                    foreach ($resps_cat_list as $gr)
                    {
                        $slot = array();
                        $ord = 0;
                        foreach ($gr as $r)
                        {
                            array_push($slot, $gr[$ord]);
                            $ord++;
                        }
                        array_push($ans["resps_cat_list"], $slot);
                    }

                    //$ans["insert_pos"] = $d["insert_pos"] * 1;
                    $ans["edited_ord"] = $d["edited_ord"];
                    $ans = json_encode($ans, JSON_UNESCAPED_UNICODE);
                    break;
                }

            case "new":
                {
                    $resps_id_list  = array();
                    $owner_id = $_SESSION["pers"]["id"] * 1;
                    $date = time();
                    $trans = $this->_db->prepare("INSERT resp SET fio = ?, mail = ?, spec = ?, cd = $date, ud = $date, last_upd = $date, madeby = $owner_id");
                    foreach ($info as $resp_slot) // array of new resp slots
                    {
                        $trans->execute(array(
                            $resp_slot["fio"],
                            $resp_slot["mail"],
                            $resp_slot["spec"]
                        ));
                        $resp_slot["id"] = $this->_db->lastInsertId() * 1; // get new resp's global id
                        array_push($resps_id_list, $resp_slot["id"]);
                    }
                    $this->resp("list", null, false, true); // refresh global resps list
                    $ans = $resps_id_list;
                    break;
                }

            case "get_client_data":
                {
                    $ans = array();
                    $file = "resp_rec_chk.txt";
                    if (!file_exists($file))
                        file_put_contents($file, "");

                    file_put_contents($file, "\n\n info: ". $info, FILE_APPEND);

                    $d = json_decode($info);
                    $q = $this->send_query("SELECT resps, settings, status, madeby, qkey, name FROM quiz WHERE qkey = '". $d->qkey ."'");

                    if ($q)
                    {
                        $duplicate_quizes = array();

                        $qz_list = array();
                        $pers_id = false;
                        while($bro = $q->fetch(PDO::FETCH_ASSOC))
                        {
                            $dup_gr_ord = null;
                            $dup_resp_ord = null;
                            $bro["resps"] = true_json_code($bro["resps"], "decode");
                            $bro["settings"] = true_json_code($bro["settings"], "decode");
                            $bro["status"] *= 1;
                            $pers_id = $bro["madeby"]*1;


                            $found = false;
                            foreach ($bro["resps"] as $gr_ord => $group)
                                foreach ($group as $ord => $resp_data)
                                    if ($resp_data["ukey"] === $d->rkey)
                                    {
                                        $dup_gr_ord = $gr_ord;
                                        $dup_resp_ord = $ord;
                                        $found = true;
                                        break;
                                        break;
                                    }

                            if ($found)
                            {
                                array_push($duplicate_quizes, $bro["name"] . " [". $bro["qkey"] ."], gro: $dup_gr_ord, ro: $dup_resp_ord");

                                array_push($qz_list, $bro);
                            }

                        };

                        //file_put_contents("qz_list_chk.txt", "resp key ". $d->rkey);
                        file_put_contents($file, " \n qz_list count: ". count($qz_list), FILE_APPEND);

                        // A single valid resp for the keys combination
                        if (count($qz_list) === 1)
                        {
                            $qz = $qz_list[0];
                            $sett = $qz["settings"];
                            // Get answers_set
                            $ans["answer_opts_list"] = $sett["answer_opts_list"];
                            $ans["status"] = $qz["status"];

                            if (1 === $qz["status"] * 1)
                                $ans["error"] = "Опрос уже завершен.";
                            elseif ($sett["end_date"] < time())
                                $ans["error"] = "Время прохождения опроса истекло. Опрос был завершен: " . date("d-m-y H:i:s", $sett["end_date"]);
                            elseif (isset($sett["is_muted"]) && 1 === $sett["is_muted"] * 1)
                            {
                                $ans["error"] = "Опрос временно приостановлен.";
                                if ($sett["is_muted_tx"])
                                    $ans["error"] .= "<br>Комментарий: <span style='font-style: italic; '>" . $sett["is_muted_tx"] . "</span>";
                            }
                            else
                            {

                                $QBOOKS = $this->qbook("list", "no_recon", $pers_id);
                                // question($action, $info=false, $recon = true, $madeby_id = null)
                                $this->question("list", false, false, $pers_id); // refreshes  qsts db, sets into the session
                                $QSTS = $_SESSION['qsts'];
                                // Get all comp names+id's for our qst_list

                                $resp = null;
                                $resp["ord"] = null;
                                foreach ($qz["resps"] as $gr_ord => $group)
                                    foreach ($group as $ord => $resp_data)
                                        if ($resp_data["ukey"] === $d->rkey)
                                        {
                                            $ans["resp_ord"] = $ord;
                                            $ans["group_ord"] = $gr_ord;
                                            $resp = $resp_data;
                                            break;
                                            break;
                                        }

                                if (null === $resp)
                                    $ans["error"] = "Не найден id респондента.";
                                else
                                {
                                    $resp["ord"] = $ans["resp_ord"];
                                    //$ans["resp_ord"] = $ord;
                                    //$ans["group_ord"] = $gr_ord;
                                    $ans["fb_log"] = $resp_data["feedback"];
                                    if (isset($resp["map_step"]))
                                        $ans["map_step"] = $resp["map_step"];

                                    //else
                                    //    $ans["map_step"] = null;
                                    $ans["feedback"] = $sett["comm_groups"][$ans["group_ord"]];

                                    $fb = $ans["feedback"];
                                    $cid = $resp["cat_id"] * 1;
                                    $map_qz_after_block = array();

                                    //file_put_contents("qz_list_chk.txt", "\n resp cat_id $cid", FILE_APPEND);
                                    // Rewrite specialized comments AFTER QZ
                                    if ($fb["qz_after"] && isset($fb["qz_cats_list"]))
                                    {
                                        $resulting_list = array();
                                        if (isset($fb["qz_list"]) && count($fb["qz_list"]))
                                            foreach ($fb["qz_list"] as $i => $qz_comment)
                                            {
                                                // Check if this is new update system or old
                                                $pass = false;
                                                $role_specs_exist = true;

                                                if (isset($fb["qz_cats_list"]))
                                                {
                                                    if (isset($fb["qz_cats_list"][$i]) &&
                                                        isset($fb["qz_cats_list"][$i][$cid]) &&
                                                        isset($fb["qz_cats_list"][$i][$cid]["is_on"])
                                                    )
                                                        $pass = true;
                                                }
                                                else
                                                {
                                                    $pass = true;
                                                    $role_specs_exist = false;
                                                }

                                                //file_put_contents("qz_list_chk.txt", "\n qz_list $i, comment $qz_comment", FILE_APPEND);
                                                //file_put_contents("qz_list_chk.txt", "\n pass: $pass, role_specs_exist: $role_specs_exist, qz_cats_list is_on: " . ($fb["qz_cats_list"][$i][$cid]["is_on"]*1), FILE_APPEND);

                                                if ($pass)
                                                {
                                                    if (!$role_specs_exist || $fb["qz_cats_list"][$i][$cid]["is_on"]*1)  // comment is disabled for this role
                                                    {
                                                        $map_slot = array(
                                                            "type" => "comment",
                                                            "subtype" => "qz",
                                                            "ord" => count($resulting_list)
                                                        );
                                                        array_push($map_qz_after_block, $map_slot);
                                                        if ($role_specs_exist &&
                                                            $fb["qz_cats_list"][$i][$cid]["tx"]) // swap desc to role-specific
                                                        {
                                                            $new_dec_comment = $fb["qz_cats_list"][$i][$cid]["tx"];
                                                            array_push($resulting_list, $new_dec_comment);
                                                        }
                                                        else
                                                            array_push($resulting_list, $qz_comment); // keep default
                                                    }
                                                }
                                                else
                                                    array_push($resulting_list, $qz_comment);

                                            }

                                        if (count($resulting_list))
                                            $fb["qz_list"] = $resulting_list; // overwrite filtered list
                                    }
                                    //$ans["map_qz_after_block"] = $map_qz_after_block;

                                    $map_comps_block = array(); // key is comp_id, in it array of qsts
                                    // Rewrite specialized comments
                                    if ($fb["comp_after"] && isset($fb["comp_cats_list"]))
                                        foreach ($fb["comp_list"] as $comp_id => $comp)
                                            if ($comp && is_array($comp) && count($comp))
                                            {
                                                $resulting_list = array();
                                                $comp_cat_slot_exists = false;
                                                if (isset($fb["comp_cats_list"]) &&
                                                    isset($fb["comp_cats_list"][$comp_id])
                                                )
                                                {
                                                    $comp_cat_slot_exists = true;
                                                }

                                                foreach ($comp as $i => $comp_comment)
                                                {
                                                    // Check if this is  new update system or old
                                                    $pass = false;

                                                    if ($comp_cat_slot_exists)
                                                    {
                                                        if (isset($fb["comp_cats_list"][$comp_id][$i]) &&
                                                            isset($fb["comp_cats_list"][$comp_id][$i][$cid]) &&
                                                            isset($fb["comp_cats_list"][$comp_id][$i][$cid]["is_on"])
                                                        )
                                                            $pass = true;
                                                    }
                                                    else
                                                        $pass = true;

                                                    if ($pass)
                                                    {
                                                        $comp_cat_slot = null;
                                                        if ($comp_cat_slot_exists)
                                                            $comp_cat_slot = $fb["comp_cats_list"][$comp_id][$i][$cid];

                                                        if (!$comp_cat_slot_exists ||
                                                            1 === $comp_cat_slot["is_on"]*1) // comment is disabled for this role
                                                        {
                                                            // Fill competentions slot
                                                            if (!isset($map_comps_block[$comp_id]))
                                                                $map_comps_block[$comp_id] = array();

                                                            $map_slot = array(
                                                                "type" => "comment",
                                                                "subtype" => "comp",
                                                                "comp_id" => $comp_id,
                                                                "ord" => count($resulting_list)
                                                            );
                                                            array_push($map_comps_block[$comp_id], $map_slot);

                                                            if ($comp_cat_slot_exists &&
                                                                $comp_cat_slot["tx"]) // swap desc to role-specific
                                                            {
                                                                $new_dec_comment = $comp_cat_slot["tx"];
                                                                array_push($resulting_list, $new_dec_comment);
                                                            }
                                                            else
                                                                array_push($resulting_list, $comp_comment);
                                                        }
                                                    }
                                                    else
                                                        array_push($resulting_list, $comp_comment);
                                                }

                                                if (count($resulting_list))
                                                    $fb["comp_list"][$comp_id] = $resulting_list; // overwrite filtered list
                                            }

                                    //$ans["map_comps_block"] = $map_comps_block;

                                    $ans["feedback"] = $fb; // return all the changes here
                                    $resp["host_id"] = $group[0]["id"] * 1;

                                    // Add backup info to resp's slot


                                    $filename = BACKUP_ANSWERS_DIR . "/q_". $qz["qkey"] ."_r_". $resp_data["ukey"] . ".txt";
                                    if (file_exists($filename))
                                    {
                                        $backup = json_decode(file_get_contents($filename),true);
                                        if ($backup && isset($backup["ans_list"]))
                                        {
                                            $backup_list = $backup["ans_list"];

                                            // Restore every missed non-empty answer
                                            if (isset($resp["ans_list"]) && count($resp["ans_list"]))
                                                foreach ($resp["ans_list"] as $ind =>  &$ans_val)
                                                    if (-1 === intval($ans_val) && null !== $backup_list[$ind])
                                                        $ans_val = $backup_list[$ind];
                                        }
                                    }

                                    // Slot to check progress of resp
                                    $chk_slot = [];
                                    $chk_slot["resps"] = $qz["resps"];
                                    $chk_slot["settings"] = $qz["settings"];
                                    $chk_slot["gr_ord"] = $ans["group_ord"];
                                    $chk_slot["resp_ord"] = $ans["resp_ord"];

                                    $qb_pct_done = resp_pct_done($chk_slot, $QBOOKS);
                                    $fb_done = resp_fb_done($chk_slot, $QBOOKS, $QSTS);

                                    $ans["fb_done_chk"] = 0;
                                    if ($fb_done) // manually disable further comment attempts
                                        $ans["fb_done_chk"] = 1;


                                    /*
                                    $is_finished_trough = true;
                                    if (isset($resp["map_len"]) &&
                                        isset($resp["map_step"]) &&
                                        $resp["map_step"]*1 < $resp["map_len"]*1
                                    )
                                        $is_finished_trough = false;
                                    */

                                    if ($qb_pct_done >= 1 && $fb_done) // && $is_finished_trough
                                        $ans["error"] = "Опрос Вами успешно заполнен.";
                                    else
                                    {
                                        $cat_id = $resp["cat_id"] * 1;
                                        $ans["ans_list"] = $resp["ans_list"];
                                        $ans["map"] = array();

                                        // Get self info
                                        $z = $this->send_query("SELECT fio FROM resp WHERE id = '". $resp["id"] ."'");
                                        $resp_data = $z->fetch(PDO::FETCH_ASSOC);
                                        $ans["resp_slave"] = $resp_data["fio"];
                                        // Get focus-resp info
                                        // self
                                        if (!$cat_id)
                                        {
                                            $ans["resp_host"] = $resp_data["fio"];
                                            $ans["intro_tx"] = $sett["intro_tx"]["self"];
                                            if (!$ans["intro_tx"])
                                                $ans["intro_tx"] = "Уважаемый коллега!<br><br>" .
                                                    "Перед Вами – опрос 360 градусов. Пожалуйста, ответьте на вопросы о самом себе, Ваших деловых качествах и управленческом стиле<br>" .
                                                    "Задача проведения данной части опроса – обеспечить сравнение Вашей самооценки с тем, как Вас видят окружающие. " .
                                                    "Впоследствии это поможет Вам глубже проанализировать Ваши сильные стороны и зоны развития. Постарайтесь давать максимально правдивые ответы.<br><br>" .
                                                    "Правила заполнения опроса: <br>" .
                                                    "Опросник состоит из нескольких вопросов. По каждому вопросу Вам будут предложены варианты ответов. " .
                                                    "Вам необходимо выбрать один вариант и нажать на него один раз. " .
                                                    "После этого будет автоматически осуществлен переход к другому вопросу (дождитесь перехода системы к следующему вопросу).<br>" .
                                                    "В конце опроса Вам будет предложено вписать от себя некоторые комментарии.<br>" .
                                                    "По завершении опроса нажмите кнопку «сохранить» в верхней части экрана слева.";
                                        }
                                        // other guy
                                        else
                                        {
                                            $z = $this->send_query("SELECT fio FROM resp WHERE id = '". $resp["host_id"] ."'");
                                            $resp_data = $z->fetch(PDO::FETCH_ASSOC);
                                            $ans["resp_host"] = $resp_data["fio"];
                                            $ans["intro_tx"] = $sett["intro_tx"]["env"];
                                            if (!$ans["intro_tx"])
                                                $ans["intro_tx"] = "Уважаемый коллега!<br><br>" .
                                                    "Перед Вами – опрос 360 градусов. Просим Вас ответить на предлагаемые вопросы, касающиеся делового и управленческого стиля %ФИО%.<br>" .
                                                    "Задача проведения опроса – обеспечить максимально качественную и объективную обратную связь. Опросник анонимен. При обработке результатов опроса Ваше имя и фамилия фиксироваться не будут. " .
                                                    "Важно максимально точное отражение Вашего мнения.<br> " .
                                                    "Правила заполнения опроса: <br>" .
                                                    "Опросник состоит из нескольких вопросов. По каждому вопросу Вам будут предложены варианты ответов. Вам необходимо выбрать один вариант и нажать на него один раз. " .
                                                    "После этого будет автоматически осуществлен переход к другому вопросу (дождитесь перехода системы к следующему вопросу).<br>" .
                                                    "В конце опроса Вам будет предложено вписать от себя некоторые комментарии.<br><br>" .
                                                    "По завершении опроса нажмите кнопку «сохранить» в верхней части экрана слева.";
                                        }


                                        $qb_id = $ans["feedback"]["qb_id"] * 1;
                                        foreach ($QBOOKS as $ordz => $qb)
                                            if ($qb["id"]*1 === $qb_id*1)
                                            {
                                                $qb_ord = $ordz;
                                                break;
                                            }

                                        //$qb_ord = get_qb_ord_from_qb_id($qb_id); // this creates session['qbooks'] if needed
                                        //$qb = $_SESSION["qbooks"][$qb_ord];
                                        $qb = $QBOOKS[$qb_ord];
                                        $qst_list = $qb["list"];
                                        $struct = $qb["struct"];

                                        file_put_contents($file, " \n qkey: ". $d->qkey .
                                            " \n rkey: ". $d->rkey .
                                            " \n pers_id: ". $pers_id .
                                            " \n qbooks: ". json_encode($QBOOKS) .
                                            " \n qb_id: $qb_id ".
                                            " \n qb_ord: $qb_ord ".
                                            " \n qst_list:" . implode(",", $qst_list), FILE_APPEND);

                                        $ans["qsts"] = array();
                                        $qst_global_ord = -1;

                                        $unique_comp_id_list = array(); // get the list of all "blue" comps
                                        $ans["comp_id_list"] = array();
                                        $trans = $this->_db->prepare("SELECT tx, comp_id FROM qsts WHERE id = ? ");
                                        $qst_qnt = count($qst_list);
                                        foreach ($qst_list as $ord => $qst_id)
                                        {
                                            $qst_global_ord++;
                                            $trans->execute(array($qst_id));
                                            $q_data = $trans->fetch(PDO::FETCH_ASSOC);
                                            $comp_id = $q_data["comp_id"]*1;
                                            $qst_tx = $q_data["tx"];
                                            array_push($ans["comp_id_list"], $comp_id);

                                            if (!in_array($comp_id, $unique_comp_id_list))
                                            {
                                                array_push($unique_comp_id_list, $comp_id);
                                                $comps_qnt = count($unique_comp_id_list);

                                                // Fill MAP with comments from prev comp, if any are present+enabled
                                                if ($comps_qnt > 1)
                                                {
                                                    $prev_comp_id = $unique_comp_id_list[$comps_qnt - 2];
                                                    // There is comments after this comp
                                                    if (isset($map_comps_block[$prev_comp_id]))
                                                        foreach ($map_comps_block[$prev_comp_id] as $slot)
                                                            array_push($ans["map"], $slot);
                                                }
                                            }

                                            // Chk if alternative tx is applied for this category
                                            if ($struct && $struct["q_list"][$qst_id]["cats"][$cat_id]["is_on"])
                                            {

                                                $map_slot = array(
                                                    "type" => "qst",
                                                    "ord" => $qst_global_ord,
                                                    "comp_id" => $comp_id,
                                                );
                                                array_push($ans["map"], $map_slot);

                                                if ($struct["q_list"][$qst_id]["cats"][$cat_id]["tx"])
                                                    $qst_tx = $struct["q_list"][$qst_id]["cats"][$cat_id]["tx"]; // alternative tx
                                            }
                                            else
                                                $qst_tx = null;
                                            array_push($ans["qsts"], $qst_tx);

                                            // That was last question
                                            if ($qst_qnt === $ord + 1)
                                            {
                                                // There is comments after this comp
                                                if (isset($map_comps_block[$comp_id]))
                                                    foreach ($map_comps_block[$comp_id] as $slot)
                                                        array_push($ans["map"], $slot);
                                            }
                                        }
                                        unset($trans);

                                        //$ans["unique_comp_id_list"] = $unique_comp_id_list;

                                        // Fill all the "red" comps comments if there is any
                                        foreach ($map_comps_block as $comp_id => $list)
                                            if (!in_array($comp_id*1, $unique_comp_id_list)) // is a "red" comp, id of which absent in qst-related comps
                                                foreach ($list as $slot)
                                                    array_push($ans["map"], $slot);

                                        // Fill all the after_qz comments
                                        if (count($map_qz_after_block))
                                            foreach ($map_qz_after_block as $slot)
                                                array_push($ans["map"], $slot);

                                        // Replace comp_id with proper names
                                        $ans["comp_names_list"] = array();
                                        $trans = $this->_db->prepare("SELECT name FROM comp WHERE id = ? ");
                                        foreach ($ans["comp_id_list"] as $ord => $comp_id)
                                        {
                                            $trans->execute(array($comp_id));
                                            $cmp_data = $trans->fetch(PDO::FETCH_ASSOC);
                                            $ans["comp_names_list"][$ord] = $cmp_data["name"];
                                        }
                                        unset($trans);

                                        // Get names for all comps of comment sections
                                        $trans = $this->_db->prepare("SELECT name FROM comp WHERE id = ? ");
                                        foreach ($ans["map"] as &$slot)
                                            if ("comment" === $slot["type"] &&
                                                "comp" === $slot["subtype"]
                                            )
                                            {
                                                $trans->execute(array($slot["comp_id"]));
                                                $cmp_data = $trans->fetch(PDO::FETCH_ASSOC);
                                                $slot["name"] = $cmp_data["name"];
                                            }
                                        unset($trans);

                                        /* and so we have
                                        ["answer_opts_list"]
                                        ["resp_slave"]
                                        ["resp_host"]
                                        ["qsts"]
                                        ["feedback"]
                                        ["intro_tx"]
                                        ["answer_set"]
                                        ["ans_list"]
                                        ["comp_names_list"]
                                        ["comp_id_list"]
                                        ["error"]
                                        */

                                        file_put_contents($file, "\n ans[qsts]: " . json_encode($ans["qsts"], JSON_UNESCAPED_UNICODE), FILE_APPEND);
                                    }
                                }
                            }
                        }
                        else
                        {
                            if (count($qz_list))
                                log_add("duplicated key pairs found: " . implode(" || ", $duplicate_quizes));
                            else
                                log_add("empty qz_list to get resp data from: " . implode(" || ", $duplicate_quizes));
                            $ans["error"] = "Не уникальный id опроса.";
                        }
                    }
                    else $ans["error"] = "Не найдено опроса по id.";

                    $ans = json_encode($ans, JSON_UNESCAPED_UNICODE); // compress on export
                    break;
                }

            case "record_answer":
                {
                    $d = json_decode($info);

                    // BACKUP ANSWERS SAVE
                    if (!is_dir(BACKUP_ANSWERS_DIR))
                        mkdir(BACKUP_ANSWERS_DIR, 0777, true);
                    $filename = BACKUP_ANSWERS_DIR . "/q_". $d->qkey ."_r_".$d->rkey .".txt";
                    if (!file_exists($filename))
                    {
                        $cli_data = array();
                        $cli_data["answers"] = array();
                        $cli_data["ans_list"] = array();
                    }

                    $cli_data = json_decode(file_get_contents($filename), true);
                    if (!isset($cli_data["answers"]))
                    {
                        $cli_data = array();
                        $cli_data["answers"] = array();
                        $cli_data["ans_list"] = array();
                    }
                    $cli_data["answers"][$d->qst_ord * 1] = $d->pts * 1;
                    $cli_data["ans_list"] = $d->ans_list;

                    file_put_contents($filename, json_encode($cli_data));

                    /*
                    $file = "resp_rec_chk.txt";
                    file_put_contents($file, "\n\n record_answer: ". $info, FILE_APPEND);
                    */

                    // Main DB answer record
                    $q = $this->send_query("SELECT resps, settings, madeby, status FROM quiz WHERE qkey = '". $d->qkey ."'");
                    if ($q)
                    {
                        $data = $q->fetchAll(PDO::FETCH_ASSOC);
                        //file_put_contents($file, " \n count of quizes by a key: ". count($data), FILE_APPEND);
                        if (count($data) !== 1)
                            $ans = false;
                        else
                        {
                            $pers_id = $data[0]["madeby"] * 1;
                            $status = intval($data[0]["status"]);

                            if (1 !== $status)
                            {
                                //$settings = true_json_code($data[0]["settings"], "decode");
                                $resps = true_json_code($data[0]["resps"], "decode");
                                //$QBOOKS = $this->qbook("list", "no_recon", $pers_id);
                                //$this->question("list", false, false, $pers_id); // refreshes  qsts db, sets into the session
                                //$QSTS = $_SESSION['qsts'];

                                // Record the currents answer
                                $resp = &$resps[$d->group_ord][$d->resp_ord];
                                if (isset($d->map_step))
                                    $resp["map_step"] = $d->map_step;
                                if (isset($d->map_len))
                                    $resp["map_len"] = $d->map_len;
                                //$resp["ans_list"] = $d->ans_list; // fully rewrite results
                                $resp["ans_list"][$d->qst_ord] = $d->pts; // record user answer value
                                for ($i=0; $i<count($resp["ans_list"]); $i++)
                                    if (null === $resp["ans_list"][$i])
                                        $resp["ans_list"][$i] = -1; // absent answer, cuz it's blocked for this resp's category (or for other reasons)

                                $proper_array = []; // when array saves value at indexes not in strict order, it becomes assoc type, we redo it to index type by this
                                for ($i=0; $i<count($resp["ans_list"]); $i++)
                                    array_push($proper_array, $resp["ans_list"][$i]);
                                $resp["ans_list"] = $proper_array;

                                $resp["last_upd"] = time();

                                // Update info in DB
                                $resps = true_json_code($resps);
                                //file_put_contents($file, " \n before qz update: ", FILE_APPEND);
                                $this->send_query("UPDATE quiz SET resps = '$resps' WHERE qkey = '". $d->qkey ."'");
                                $ans = true;
                            }
                            else
                            {
                                $ans = "qz_ended";
                            }
                        }
                    }
                    //file_put_contents($file, " \n answer is: ". $ans, FILE_APPEND);
                    break;
                }

            case "user_feedback":
                {
                    $d = json_decode($info);

                    // BACKUP ANSWERS SAVE
                    if (!is_dir(BACKUP_ANSWERS_DIR))
                        mkdir(BACKUP_ANSWERS_DIR, 0777, true);
                    //http://evaluation.plarium.local/answers_backup/feedback_q_QWwyt_r_CadoG.txt
                    file_put_contents(BACKUP_ANSWERS_DIR . "/feedback_q_". $d->qkey ."_r_".$d->rkey .".txt", json_encode($d->feedback, JSON_UNESCAPED_UNICODE));

                    $q = $this->send_query("SELECT resps, settings, madeby, status FROM quiz WHERE qkey = '". $d->qkey ."'");
                    if ($q)
                    {
                        $data = $q->fetchAll(PDO::FETCH_ASSOC);
                        if (count($data) !== 1)
                            $ans = false;
                        else
                        {
                            $status = intval($data[0]["status"]);

                            if (1 !== $status)
                            {
                                //$settings = true_json_code($data[0]["settings"], "decode");
                                $resps = true_json_code($data[0]["resps"], "decode"); // proper decode json
                                //$pers_id = $data[0]["madeby"] * 1;
                                //$QBOOKS = $this->qbook("list", "no_recon", $pers_id);
                                //$this->question("list", false, false, $pers_id); // refreshes  qsts db, sets into the session
                                //$QSTS = $_SESSION['qsts'];

                                $resp = &$resps[$d->group_ord][$d->resp_ord];
                                $resp["feedback"] = $d->feedback; // record user feedback answers
                                $resp["last_upd"] = time();
                                if (isset($d->map_step))
                                    $resp["map_step"] = $d->map_step;
                                if (isset($d->map_len))
                                    $resp["map_len"] = $d->map_len;

                                $resps = true_json_code($resps); // proper encode json

                                // Update info in DB
                                $this->send_query("UPDATE quiz SET resps = '$resps' WHERE qkey = '". $d->qkey ."'");
                                $ans = true;
                            }
                            else
                            {
                                $ans = "qz_ended";
                            }

                        }
                    }

                    break;
                }

            case "remind":
                {
                    $resp = json_decode($info);
                    // $q = $this->send_query("UPDATE resp SET ud = '".time()."' WHERE ukey = '".$resp->ukey."'");
                    /*
                    if (!$q)
                    {
                        log_add("resp->new: error on creating a new respondent entry!");
                        $ans = false;
                    }
                    */
                    $subject = "система 360, опрос";
                    $message = "Уважаемый, коллега.<br>
                    Напоминаем Вам о необходимости пройти опрос.<br>" .
                        "Ссылка на опрос: " . DURL . "client.php?q=" . $resp->qkey ."r=" . $resp->rkey;
                    sendMail($subject, $message, $resp->mail);
                    break;
                }

            case "keys_list":
                {
                    $list = array();
                    $q = $this->send_query("SELECT ukey FROM resp");
                    while ($entry = $q->fetch(PDO::FETCH_ASSOC))
                        array_push($list, $entry["ukey"]);

                    $ans = $list;
                    break;
                }

            case "send_remainder":
                {
                    $d = json_decode($info);

                    /*
                    $message = "Уважаемый(ая) ".$d->fio.".<br>";
                    $message .= "Мы запустили опрос оценка 360 градусов. К сожалению, мы пока не получили ответы от Вас. Отсутствие ответов хотя бы одного человека мешает завершить опрос и получить отчеты Вашим коллегам.<br>";
                    $message .= "Пожалуйста, пройдите по ссылке(ам) и заполните опросник.<br>";
                    //$message .= "Пожалуйста, пройдите по ссылке(ам) и заполните опросник.<br>";
                    $message .= $d->focus_fio ." - ". $d->link . "<br>";
                    $message .= "Если у Вас возникнут вопросы, Вы можете обратиться к координатору проекта из HR-UP<br>";
                    $message .= "по e-mail: info@hr-up.ru";
                    */
                    $message = "Привет!<br><br>";
                    $message .= "Недавно тебе пришел опрос по взаимодействию с сотрудником: ". $d->focus_fio .". К сожалению, ты пока его не заполнил, а значит, мы не можем завершить оценку твоего коллеги.<br><br>";
                    $message .= "Пожалуйста, перейди по ссылке и ответь на вопросы в анкете.<br><br>";
                    $message .= get_link_button_html("ПЕРЕЙТИ", $d->link) . "<br><br>";
                    $message .= "Сомневаешься в чем-то? Пиши на info@hr-up.ru.";

                    $subject = "Напоминание о необходимости пройти опрос по методике 360 градусов";
                    //$resp["last_message_id"] = sendMail($subject, $message, $d->mail);
                    sendMail($subject, $message, $d->mail);
                    $ans = true;
                    break;
                }

        }

        if ($reconnect)
            $this->DB_close($q);
        if ($ans !== "☼" && !$no_ans)
            return $ans;
    }
//****--------------------------------------------------------------------------------------------------------------****
    function pers($action, $info, $reconnect=true)
    {
        $ret = "#";
        if ($reconnect)
            $this->DB_conn();
        switch ($action)
        {
            case "login":
                {
                    unset ($_SESSION["pers"]);
                    $log_data = json_decode($info, true);
                    $q = null;
                    $access_overwrite = null;
                    $watcher_id = null;
                    // REGULAR LOGIN
                    if (isset($log_data['login']) && isset($log_data['pass']))
                    {
                        $log_data['login'] = shield($log_data['login']);
                        $log_data['pass'] = encrypt(shield($log_data['pass']));
                        // ?

                        $q = $this->send_query("SELECT id, login, name, spec, comp, cd, ud, mail, last_log, added_by, access, region, phone, valid, tags, focus_charges, watcher_id ".
                            "FROM pers ".
                            "WHERE login = '".$log_data['login']."' ".
                            "AND pass = '".$log_data['pass']."'");
                    }
                    elseif (isset($log_data['wid']))
                    {
                        //$access_overwrite
                        $wid = $log_data['wid'];
                        $z = $this->send_query("SELECT id, madeby, access_id FROM watchers WHERE wkey = '$wid'");
                        $bro = $z->fetch(PDO::FETCH_ASSOC);
                        $pers_id = $bro["madeby"] * 1;
                        $access_overwrite = $bro["access_id"] * 1;
                        $watcher_id = $bro["id"] * 1;
                        $q = $this->send_query("SELECT id, login, name, spec, comp, cd, ud, mail, last_log, added_by, access, region, phone, valid, tags, focus_charges, watcher_id ".
                            "FROM pers ".
                            "WHERE id = '$pers_id'");
                    }

                    if ($q)
                    {
                        $data = array();
                        while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                        {
                            $bro = digitize($bro, array("id","cd","ud","last_log","added_by","access","valid","focus_charges","watcher_id"));
                            if ($bro["tags"])
                                $bro["tags"] = json_decode($bro["tags"], true);
                            else
                                $bro["tags"] = array();

                            if (null !== $access_overwrite)
                                $bro["access"] = $access_overwrite;

                            $bro["wid"] = $watcher_id;

                            //if ($bro["dirs"]) $bro["dirs"] = json_decode($bro["dirs"], true);
                            array_push($data, $bro);
                        }

                        // error: more then 1 user matched the given login info
                        if (count($data) !== 1)
                        {
                            log_add("pers->$action: ".count($data)." entries match one login+password combination!");
                            echo null;
                        }
                        elseif (count($data) === 1)
                        {
                            // Set auth cookie for 20 hrs
                            if (!setcookie("is_logged",true,time()+14400))
                                log_add("pers->$action: auth cookie was not set!");

                            $_SESSION["auth_data"] = $data;
                            // set all data of logged user into handy session array
                            $_SESSION["pers"] = array();
                            foreach ($data[0] as $key => $val)
                                $_SESSION["pers"][$key] = $val;
                            $_SESSION["pers"]["last_log"] = time();
                            $_SESSION["pers"]["gang"] = null;

                            if ($_SESSION["pers"]["id"]*1 === -1)
                            {
                                $q = $this->send_query("SELECT name, cd, last_log, mail FROM pers WHERE NOT id = -1");
                                $list = array();
                                while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                                {
                                    $bro = digitize($bro, array("cd","last_log"));
                                    $bro["name"] = str_replace("☼"," ", $bro["name"]);

                                    array_push($list, $bro);
                                }
                                $_SESSION["pers"]["gang"] = $list;
                            }


                            // Detect if this is slave-acc or admin
                            if ($_SESSION["pers"]["added_by"])
                            {
                                // Get focus charges amount from the master-entry
                                $z = $this->send_query("SELECT focus_charges FROM pers WHERE id = ". ($_SESSION["pers"]["added_by"] * 1));
                                $d = $z->fetchAll(PDO::FETCH_ASSOC);
                                $_SESSION["pers"]["focus_charges"] = intval($d[0]["focus_charges"]);
                            }

                            // 1) Load letter templates
                            // Create dir and get/create the file
                            if (!is_dir(LETTER_TEMPLATES_DIR))
                                mkdir(LETTER_TEMPLATES_DIR, 0777, true);

                            $filename = LETTER_TEMPLATES_DIR ."/letemps_" . $_SESSION["pers"]["id"] . ".txt";
                            if (!file_exists($filename))
                            {
                                $_SESSION["pers"]["letemps_list"] = array();
                                file_put_contents($filename, json_encode(array()));
                            }
                            else
                                $_SESSION["pers"]["letemps_list"] = json_decode(file_get_contents($filename));

                            // 2) Answers scheme templates
                            $filename = LETTER_TEMPLATES_DIR ."/as_templates_" . $_SESSION["pers"]["id"] . ".txt";
                            if (!file_exists($filename))
                            {
                                $_SESSION["pers"]["as_temp"] = array();
                                file_put_contents($filename, json_encode(array()));
                            }
                            else
                                $_SESSION["pers"]["as_temp"] = json_decode(file_get_contents($filename));

                            // 3) Analitycs folders
                            $filename = LETTER_TEMPLATES_DIR ."/an_folders_" . $_SESSION["pers"]["id"] . ".txt";
                            if (!file_exists($filename))
                            {
                                $_SESSION["pers"]["an_folders"] = array();
                                file_put_contents($filename, json_encode(array()));
                            }
                            else
                                $_SESSION["pers"]["an_folders"] = json_decode(file_get_contents($filename));

                            // 4) OQ templats folders
                            $filename = LETTER_TEMPLATES_DIR ."/oqt_" . $_SESSION["pers"]["id"] . ".txt";
                            if (!file_exists($filename))
                            {
                                $_SESSION["pers"]["oqt"] = array();
                                file_put_contents($filename, json_encode(array()));
                            }
                            else
                                $_SESSION["pers"]["oqt"] = json_decode(file_get_contents($filename));


                            if (isset($log_data['login']) && isset($log_data['pass']))
                                $this->send_query("UPDATE pers SET last_log = ".time()." WHERE login = '".$log_data['login']."' AND pass = '".$log_data['pass']."'");

                            // Get catalogs structure
                            $filename = TEMP_DATA_DIR ."/dirs_".$_SESSION["pers"]["id"] . ".txt";
                            if (file_exists($filename))
                                $_SESSION["pers"]["dirs"] = json_decode(file_get_contents($filename), true);
                            else
                                $_SESSION["pers"]["dirs"] = array(
                                    "di_id" => 0,
                                    "de_id" => 0,
                                    "br_id" => 0,
                                    "tm_id" => 0,
                                    "st_id" => 0,
                                    "sp_id" => 0,
                                    "gr_id" => 0,
                                    "di_list" => array(),
                                    "de_list" => array(),
                                    "br_list" => array(),
                                    "tm_list" => array(),
                                    "st_list" => array(),
                                    "sp_list" => array(),
                                    "gr_list" => array()
                                );

                            echo json_encode($_SESSION["pers"], JSON_UNESCAPED_UNICODE);
                        }
                    }
                    break;
                }

            case "refresh": // update focus_charges to session
                {
                    $pers_id = $this->pers("get_host_id", null, false); // $_SESSION["pers"]["id"];
                    $q = $this->send_query("SELECT focus_charges FROM pers WHERE id = $pers_id");

                    if ($q)
                    {
                        $data = $q->fetchAll(PDO::FETCH_ASSOC);
                        if (count($data) !== 1) // error: more then 1 user matched the given login info
                            log_add("pers->$action: ".count($data)." entries match one given pers_id!");
                        elseif (count($data) === 1)
                            $_SESSION["pers"]["focus_charges"] = $data[0]["focus_charges"] * 1;
                    }
                    break;
                }

            case "get_host_id": // get the id of the super-client acc
                {
                    if (isset($_SESSION["pers"]) && isset($_SESSION["pers"]["host_id"]))
                        $ret = $_SESSION["pers"]["host_id"];
                    else
                        $ret = $_SESSION["pers"]["id"];
                    break;
                }

            case "update":
                {
                    $upd = json_decode($info, true);
                    $upd["ud"] = time();
                    $upd["id"] *= 1;
                    if (isset($upd["pass_new"]))
                        $upd["pass_new"] = encrypt(shield($upd["pass_new"]));
                    // By this we will search entry
                    if (isset($upd["pass"]))
                        $upd["pass"] = encrypt(shield($upd["pass"]));

                    $condition = "WHERE ";
                    // Prev pass is correct
                    if (intval($upd["id"]) === intval($_SESSION["pers"]["id"]))
                        $condition .= " pass = '".$upd["pass"]."' AND id = " . intval($upd["id"]);
                    // If this is sub-admins entry and i'm an super-admin
                    elseif (intval($upd["id"]) !== intval($_SESSION["pers"]["id"]) && intval($_SESSION["pers"]["id"]) === -1)
                        $condition .= " id = " . intval($upd["id"]);

                    $set_str = "";
                    $cntr = 0;
                    foreach($upd as $key => $val)
                        if (in_array($key, array("login", "name", "access", "spec", "phone", "comp", "branch", "ud", "mail", "pass_new", "valid")))
                        {
                            if ($cntr)
                                $set_str .= ", ";
                            $cntr++;

                            $db_key = $key;
                            // Adapt new pass as main pass
                            if ($key === "pass_new")
                                $db_key = "pass";

                            // numeric vals
                            if ($key === "ud")
                                $set_str .= " " .$db_key ."=". $val." ";
                            // string vals
                            else
                                $set_str .= " " .$db_key ."='". $val."' ";
                        }

                    $q = $this->send_query("UPDATE pers SET $set_str $condition");
                    if ($q)
                        $q = $q->rowCount();

                    if (isset($q) && $q === 1)
                    {
                        // update self info
                        if ($upd["id"]*1 === $_SESSION["pers"]["id"]*1)
                        {
                            $upd["pass"] = $upd["pass_new"];
                            unset($upd["pass_new"]);

                            foreach ($upd as $key => $val)
                                $_SESSION["pers"][$key] = $val;
                            // Prevent 'pass' field from going to client
                            $pass = $_SESSION["pers"]["pass"];
                            unset($_SESSION["pers"]["pass"]);
                            echo json_encode($_SESSION["pers"], JSON_UNESCAPED_UNICODE);
                            // Bring pass field back
                            $_SESSION["pers"]["pass"] = $pass;
                        }
                        // update crew array info
                        else
                        {
                            // retrieve local index of editable fella
                            $id = $upd["iid"] * 1;
                            // remove shortcut-dummy entries for not spamming them to Session var
                            unset($upd["iid"]);
                            if (is_int($id))
                            {
                                // refresh all editable pers data inside session array
                                foreach ($upd as $key => $val)
                                    $_SESSION["crew"][$id][$key] = $val;
                                // send fresh data on this pers to sync it with front end
                                echo json_encode($_SESSION["crew"][$id], JSON_UNESCAPED_UNICODE);
                            }
                            else
                            {
                                log_add("pers->update: invalid index of updatable resp");
                                echo "fail";
                            }
                        }
                    }
                    // Entry in DB wasn't successfully updated
                    else
                        echo "fail";
                    break;
                }

            case "crew_list":
                {
                    $q = $this->send_query("SELECT id, login, name, spec, cd, ud, mail, last_log, added_by, access, phone, branch, comp, emplo_qnt, valid FROM pers WHERE NOT access = 10 ORDER BY cd DESC");// ORDER BY cd DESC

                    if ($q)
                    {
                        $data = array();
                        while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                            array_push($data, $bro);
                        // no crew data (there is not a single entry except the lead-admin)
                        if (count($data) === 0)
                        {
                            $crew_list = null;
                        }
                        else
                        {
                            $crew_list = array();
                            foreach ($data as $pers)
                            {
                                array_push($crew_list, array(
                                    "id" => $pers["id"] * 1,
                                    "login" => $pers["login"],
                                    "name" => $pers["name"],
                                    "spec" => $pers["spec"],
                                    "comp" => $pers["comp"],
                                    "branch" => $pers["branch"],
                                    "emplo_qnt" => intval($pers["emplo_qnt"]),
                                    "cd" => $pers["cd"] * 1,
                                    "ud" => $pers["ud"] * 1,
                                    "mail" => $pers["mail"],
                                    "phone" => $pers["phone"],
                                    "last_log" => $pers["last_log"] * 1,
                                    "added_by" => $pers["added_by"] * 1,
                                    "access" => $pers["access"] * 1,
                                    "valid" => $pers["valid"]
                                ));
                            }
                        }

                        $_SESSION["crew"] = $crew_list;
                        return $_SESSION["crew"];
                    }
                    else
                    {
                        log_add("pers->login: empty Database data on Crew list request!");
                        return null;
                    }
                    break;
                }

            case "full_list":
                {
                    $q = $this->send_query("SELECT id, login, name, spec, cd, ud, mail, last_log, added_by, access, phone, comp, valid FROM pers ORDER BY cd DESC");// ORDER BY cd DESC , WHERE NOT access >= 4

                    if ($q)
                    {
                        $data = array();
                        while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                            array_push($data, $bro);
                        // no crew data (there is not a single entry except the lead-admin)
                        if (count($data) === 0)
                        {
                            $crew_list = null;
                        }
                        else
                        {
                            $crew_list = array();
                            foreach ($data as $pers)
                            {
                                array_push($crew_list, array(
                                    "id" => $pers["id"] * 1,
                                    "login" => $pers["login"],
                                    "name" => $pers["name"],
                                    "spec" => $pers["spec"],
                                    "comp" => $pers["comp"],
                                    "cd" => $pers["cd"] * 1,
                                    "ud" => $pers["ud"] * 1,
                                    "mail" => $pers["mail"],
                                    "phone" => $pers["phone"],
                                    "last_log" => $pers["last_log"] * 1,
                                    "added_by" => $pers["added_by"] * 1,
                                    "access" => $pers["access"] * 1,
                                    "valid" => $pers["valid"]
                                ));
                            }
                        }

                        $_SESSION["crew"] = $crew_list;
                        return $_SESSION["crew"];
                    }
                    else
                    {
                        log_add("pers->login: empty Database data on Crew list request!");
                        return null;
                    }
                    break;
                }

            case "new":
                {
                    $new_pers = json_decode($info, true);
                    $new_pers["cd"] = time();
                    $new_pers["ud"] = time();
                    $pass = encrypt($new_pers["pass"]);
                    //$new_pers["pass"] = encrypt("000"); // set default password
                    $new_pers["access"] = 5;
                    $new_pers["last_log"] = 0;
                    //$new_pers["key"] = $this->doKey(19, "pers");
                    if (isset($_SESSION["pers"]) && isset($_SESSION["pers"]["id"]))
                        $new_pers["added_by"] = $_SESSION["pers"]["id"];
                    else
                        $new_pers["added_by"] = 0;

                    // Check for mail duplication
                    $mail_is_duplicate = false;
                    $q = $this->send_query("SELECT mail FROM pers");
                    $mails_list = array();
                    if ($q)
                    {
                        while ($entry = $q->fetch(PDO::FETCH_ASSOC))
                            array_push($mails_list, trim(strtolower($entry["mail"])));
                        $reg_mail = trim(strtolower($new_pers["mail"]));

                        foreach ($mails_list as $mail)
                            if ($mail === $reg_mail)
                            {
                                $mail_is_duplicate = true;
                                break;
                            }
                    }

                    if (!$mail_is_duplicate)
                    {
                        $q = $this->send_query("INSERT INTO pers SET
                      login = '".shield($new_pers["login"])."',
                      name = '".shield($new_pers["fio"])."',
                      pass = '".$pass."',
                      spec = '".shield($new_pers["spec"])."',
                      comp = '".shield($new_pers["comp"])."',
                      mail = '".$new_pers["mail"]."',
                      phone = '".$new_pers["phone"]."',
                      cd = '".$new_pers["cd"]."',
                      ud = '".$new_pers["ud"]."',
                      added_by = '".$new_pers["added_by"]."',
                      access = '".$new_pers["access"]."',
                      valid = '0', 
                      tags = '". json_encode(array()) ."'"); // ".$new_pers["key"]." was on valid field

                        if ($q)
                        {
                            // Get the id of the added entry
                            $new_pers["id"] = $this->_db->lastInsertId();
                            if (!isset($_SESSION["crew"]) || !is_array($_SESSION["crew"]))
                                $_SESSION["crew"] = array();
                            array_push($_SESSION["crew"], $new_pers);
                            $this->send_confirm_letter($new_pers);
                            unset($new_pers["pass"]);
                            $ret = json_encode($new_pers, JSON_UNESCAPED_UNICODE);
                        }
                        else
                        {
                            log_add("resp->new: error on creating a new pers entry! $info");
                            $ret = false;
                        }
                    }
                    else
                    {
                        log_add("pers->$action: mail is duplicate! $info");
                        $ret = "mail_duplicate";
                    }

                    break;
                }

            case "del":
                {
                    $pers_id = $info * 1;
                    if (is_int($pers_id) && $pers_id > 0)
                    {
                        $q = $this->send_query("DELETE FROM pers WHERE id = $pers_id");


                        if ($q)
                        {
                            $this->send_query("DELETE FROM resp WHERE pers_id = $pers_id");
                            // refresh crew list and send it back
                            echo json_encode($this->pers("crew_list", null, false), JSON_UNESCAPED_UNICODE);
                        }
                        else
                        {
                            log_add("resp->new: error on deleting a pers entry!");
                            echo false;
                        }
                    }
                    else
                    {
                        log_add("pers->$action: invalid index of pers to delete!");
                        echo false;
                    }

                    break;
                }

            case "confirm":
                {
                    if (strlen(strval($info)) === 19)
                    {
                        $q = $this->send_query("SELECT COUNT(name) FROM pers WHERE valid = '".$info."'");

                        if ($q)
                        {
                            $val = $q->fetch(PDO::FETCH_NUM);
                            file_put_contents("chk.txt", json_encode($val));
                            if (intval($val[0]) === 1)
                            {
                                $this->send_query("UPDATE pers SET valid = '1' WHERE valid = '".$info."'");
                                $ret = "done";
                            }
                            else
                            {
                                log_add("pers->$action: wrong qnt of entries selected!");

                                $ret = "fail";
                            }
                        }
                        else
                        {
                            log_add("resp->$action: error on finding a pers entry!");
                            $ret = "fail";
                        }
                    }
                    else
                    {
                        log_add("pers->$action: wrong key format!");
                        $ret = "fail";
                    }

                    break;
                }

            case "set_tag":
                {
                    $d = json_decode($_POST["data"]);
                    $pers_id = purify($d->pers_id, "int");
                    $tag = purify($d->tag);
                    $val = purify($d->val, "int");
                    $_SESSION["pers"]["tags"][$tag] = $val;
                    $this->send_query("UPDATE pers SET tags = '".json_encode($_SESSION["pers"]["tags"])."' WHERE id = $pers_id");
                    $ret = true;
                    break;
                }

            case "set_default_tags":
                {
                    $ret = array(
                        "demo_resp_notice" => 0
                    );
                    break;
                }

            case "send_feedback":
                {
                    $d = json_decode($info, true);
                    $d["head"] = shield($d["head"]);
                    $d["message"] = shield($d["message"]);
                    $pers_id = $d["id"];
                    $date = time();
                    unset($d["id"]);

                    $q = $this->send_query("INSERT INTO feedback SET
                      data = '".json_encode($d, JSON_UNESCAPED_UNICODE)."',
                      cd = '$date',
                      pers_id = '$pers_id'
                     ");

                    if ($q && $this->_db->lastInsertId())
                    {
                        if (!IS_LOCAL)
                        {
                            $d["id"] = $pers_id;
                            $d["cd"] = $date;
                            $this->send_feedback_letter($d);
                            $ret = true;
                        }
                    }
                    else
                    {
                        log_add("pers->$action: error on writing feedback!");
                        $ret = false;
                    }

                    break;
                }

            case "recover_pass":
                {
                    $ret = false;
                    $data = json_decode($info);
                    $mail = $data->mail;
                    file_put_contents("k.txt", $mail . "\n");
                    $new_pass = encrypt($data->pass);
                    $q = $this->send_query("SELECT login, id, tags FROM pers");
                    $list = array();
                    if ($q)
                    {
                        while ($entry = $q->fetch(PDO::FETCH_ASSOC))
                            array_push($list, $entry);

                        foreach ($list as $entry)
                        {
                            file_put_contents("k.txt", $entry["login"] . "\n", FILE_APPEND);
                            if (trim(strtolower($entry["login"])) === trim(strtolower($mail)))
                            {
                                if ($entry["tags"])
                                    $tags = json_decode($entry["tags"], true);
                                else
                                    $tags = $this->pers("set_default_tags", null, false);

                                $key = $this->doKey(30, "pers");
                                $tags["pr_code"] = $key;
                                $tags["pr_pass"] = $new_pass;
                                $tags = json_encode($tags);
                                try{
                                    $q = $this->send_query("UPDATE pers SET tags = '$tags' WHERE id = " . $entry["id"]);
                                    $this->send_recovery_letter(array(
                                        "mail" => $mail,
                                        "pass" => $data->pass,
                                        "code" => $key));
                                }
                                catch (PDOException $e)
                                {
                                    log_add( "pers->find_mail: ". $e->getMessage());
                                }
                                $ret = "found";
                                break;
                            }
                        }
                    }
                    break;
                }

            case "recover_pass_confirm":
                {
                    $code = $info;
                    file_put_contents("k.txt", $code . "\n");
                    $ret = false;
                    $q = $this->send_query("SELECT tags, id FROM pers");
                    $list = array();
                    if ($q)
                    {
                        while ($entry = $q->fetch(PDO::FETCH_ASSOC))
                            array_push($list, $entry);

                        foreach ($list as $key => $entry)
                        {
                            $tags = $entry["tags"];
                            if ($tags)
                            {
                                file_put_contents("k.txt", $tags . "\n", FILE_APPEND);
                                $tags = json_decode($tags, true);

                                if (is_array($tags) && isset($tags["pr_code"]) && isset($tags["pr_pass"]) && $tags["pr_code"] === $code)
                                {
                                    $new_pass = $tags["pr_pass"];
                                    unset($tags["pr_pass"]);
                                    unset($tags["pr_code"]);
                                    $tags = json_encode($tags);
                                    try{
                                        $q = $this->send_query("UPDATE pers SET tags = '$tags', pass = '$new_pass' WHERE id = " . $entry["id"]);
                                        $ret = "done";
                                    }
                                    catch (PDOException $e)
                                    {
                                        log_add( "pers->recover_pass_confirm: ". $e->getMessage());
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    break;
                }

            case "temp_data":
                {
                    if (isset($_SESSION["pers"]))
                    {
                        if ($info)
                            $info = json_decode($info, true);

                        // Create dir and get/create the file
                        if (!is_dir(TEMP_DATA_DIR))
                            mkdir(TEMP_DATA_DIR, 0777, true);

                        // SESSION TEMP DATA
                        if (null === $_SESSION["pers"]["wid"]) // base admin file
                            $filename = TEMP_DATA_DIR ."/tempdata_" . $_SESSION["pers"]["id"] . ".txt";
                        else
                            $filename = TEMP_DATA_DIR ."/tempdata_" . $_SESSION["pers"]["id"] . "_". $_SESSION["pers"]["wid"] .".txt";

                        if (!file_exists($filename))
                        {
                            $temp = array();
                            $temp["session"] = array();
                            file_put_contents($filename, json_encode($temp));
                        }
                        else
                            $temp = json_decode(file_get_contents($filename), true);


                        // Received corret data structure
                        if (is_array($info) && isset($info["action"]))
                            // Proccess action
                            switch ($info["action"])
                            {
                                case "get":
                                    $ret = json_encode($temp["session"]);
                                    break;

                                case "set":
                                    $temp["session"] = $info["session"];
                                    file_put_contents($filename, json_encode($temp));
                                    $ret = true;
                                    break;

                                default :
                                    $ret = false;
                            }
                        else
                            $ret = false;

                    }
                    else
                        $ret = false;
                    break;
                }

            case "presets_temp_data":
                {
                    if (isset($_SESSION["pers"]))
                    {
                        if ($info)
                            $info = json_decode($info, true);

                        // Create dir and get/create the file
                        $filename = get_tempdata_presets_filename();
                        if (!file_exists($filename))
                        {
                            $temp = $info["template"];
                            file_put_contents($filename, json_encode($temp));
                        }
                        else
                            $temp = json_decode(file_get_contents($filename), true);

                        // Received corret data structure
                        if (is_array($info) && isset($info["action"]))
                            // Proccess action
                            switch ($info["action"])
                            {
                                case "presets_get":
                                    $ret = json_encode($temp);
                                    break;

                                case "presets_set":
                                    $temp = $info["template"];
                                    file_put_contents($filename, json_encode($temp));
                                    $ret = true;
                                    break;

                                default :
                                    $ret = false;
                            }
                        else
                            $ret = false;

                    }
                    else
                        $ret = false;
                    break;
                }

            case "letter_templates_save":
                {
                    if (isset($_SESSION["pers"]))
                    {
                        if ($info)
                        {
                            // Create dir and get/create the file
                            if (!is_dir(LETTER_TEMPLATES_DIR))
                                mkdir(LETTER_TEMPLATES_DIR, 0777, true);

                            $filename = LETTER_TEMPLATES_DIR ."/letemps_" . $_SESSION["pers"]["id"] . ".txt";
                            $letemps_list = file_get_contents($filename);
                            if (!$letemps_list)
                                $letemps_list = array();
                            else
                                $letemps_list = json_decode($letemps_list, true);

                            if ($info !== "update")
                            {
                                $info = json_decode($info, true);
                                $insert_ord = null;
                                // Save over
                                if (count($letemps_list))
                                    foreach ($letemps_list as $key => $slot)
                                        if (mb_strtolower($slot["name"]) === mb_strtolower($info["name"]))
                                        {
                                            $letemps_list[$key]["tx"] = $info["tx"];
                                            $letemps_list[$key]["head"] = $info["head"];
                                            $insert_ord = $key;
                                            break;
                                        }

                                // Save new
                                if ($insert_ord === null)
                                    array_push($letemps_list, $info);

                                $new_list = json_encode($letemps_list, JSON_UNESCAPED_UNICODE); // resave new list to file
                                file_put_contents($filename, $new_list);
                                $ret = $new_list;
                            }
                            // Insert default letter heads if there is old version entries without them
                            foreach ($letemps_list as &$entry)
                                if (empty($entry["head"]))
                                    $entry["head"] = "Участие в оценке методом 360 градусов";

                            $_SESSION["pers"]["letemps_list"] = $letemps_list; // Update cookie
                        }
                        else
                            $ret = false;
                    }
                    else
                        $ret = false;
                    break;
                }

            case "save_as_template":
                {
                    if (isset($_SESSION["pers"]) && $info)
                    {
                        // Create dir and get/create the file
                        if (!is_dir(LETTER_TEMPLATES_DIR))
                            mkdir(LETTER_TEMPLATES_DIR, 0777, true);

                        $filename = LETTER_TEMPLATES_DIR ."/as_templates_" . $_SESSION["pers"]["id"] . ".txt";
                        $as_template = file_get_contents($filename);
                        if (!$as_template)
                            $as_template = array();
                        else
                            $as_template = json_decode($as_template, true);

                        $info = json_decode($info, true);
                        $insert_ord = null;
                        // Save over
                        if (count($as_template))
                            foreach ($as_template as $key => $slot)
                                if (mb_strtolower($slot["name"]) === mb_strtolower($info["name"]))
                                {
                                    $as_template[$key]["name"] = $info["name"];
                                    $as_template[$key]["list"] = $info["list"];
                                    $insert_ord = $key;
                                    break;
                                }

                        // Save new
                        if ($insert_ord === null)
                        {
                            array_push($as_template, array(
                                "name" => $info["name"],
                                "list" => $info["list"],
                            ));
                        }

                        $new_list = json_encode($as_template, JSON_UNESCAPED_UNICODE); // resave new list to file
                        file_put_contents($filename, $new_list);
                        $ret = $new_list; // send back a new list

                        $_SESSION["pers"]["as_temp"] = $as_template; // Update cookie
                    }
                    else
                        $ret = false;
                    break;
                }

            case "save_an_folder":
                {
                    if (isset($_SESSION["pers"]) && $info)
                    {
                        // Create dir and get/create the file
                        if (!is_dir(LETTER_TEMPLATES_DIR))
                            mkdir(LETTER_TEMPLATES_DIR, 0777, true);

                        $filename = LETTER_TEMPLATES_DIR ."/an_folders_" . $_SESSION["pers"]["id"] . ".txt";
                        file_put_contents($filename, $info); // overwrite with new lists
                        $an_folders = json_decode($info, true);
                        $ret = $info; // send back a new list
                        $_SESSION["pers"]["an_folders"] = $an_folders; // Update cookie
                    }
                    else
                        $ret = false;
                    break;
                }

            case "oqt_save":
                {
                    if (isset($_SESSION["pers"]) && $info)
                    {
                        // Create dir and get/create the file
                        if (!is_dir(LETTER_TEMPLATES_DIR))
                            mkdir(LETTER_TEMPLATES_DIR, 0777, true);

                        $filename = LETTER_TEMPLATES_DIR ."/oqt_" . $_SESSION["pers"]["id"] . ".txt";
                        $oqt_db = json_decode(file_get_contents($filename), true); // overwrite with new lists
                        $new_template = json_decode($info, true);
                        array_push($oqt_db, $new_template);
                        $updated_oqt = json_encode($oqt_db, JSON_UNESCAPED_UNICODE);
                        file_put_contents($filename, $updated_oqt);
                        /*
                        $new_temp_ord = null;
                        if (count($oqt_db))
                            foreach ($oqt_db as $temp)
                        */

                        $ret = $updated_oqt; // send back a new list
                        $_SESSION["pers"]["oqt"] = $oqt_db; // Update session data
                    }
                    else
                        $ret = false;
                    break;
                }



            case "personify_mail":
                {
                    if ($info)
                    {
                        $default_features_list = array(
                            "Добавление логотипа и корпоротивного стиля компании в отчет.",
                            "Возможность оставлять комментарии по фокус-персоне, и отражение их в индивидуальных отчетах.",
                            "Отдельные отчеты по каждому опросу и консолидированный отчет с разбивкой по проектам за выбранный период (полгода / год).",
                            "Индивидуально настраиваемый формат отчета в зависимости от категории сотрудников - фокус-персона, руководитель, HR или других ролей.",
                            "Возможность в каждом из отчетов визуализировать уровень развития всех компетенций или каждой из них, по сравнению с другими участниками опроса: ниже среднего / среднему / выше среднего.",

                            "Настройка отчета и системы аналитики на основе пожеланий Заказчика. Выбор диаграммы / системы баллов / формат и формулировки описаний / разбивка по блокам / выгрузка сырых баллов / ответы на вопросы.",
                            "Сравнение оценок, если опрос проводится повторно.",
                            "Оценка “под ключ”, внесение данных информационную систему и мониторинг процесса оценки, выгрузка отчетов все осуществляется Исполнителем, Заказчик получает результаты и доступ к аналитике.",
                            "Включение индивидуальных планов развития в отчеты участников.",
                            "Построение кадрового резерва."
                        );


                        if (!file_exists(PERSONIFY_ORDERS_LIST))
                        {
                            $backup_list = array();
                            file_put_contents(PERSONIFY_ORDERS_LIST, json_encode($backup_list));
                        }
                        else
                            $backup_list = json_decode(file_get_contents(PERSONIFY_ORDERS_LIST), true);

                        $info = json_decode($info, true);
                        $form = array();
                        $form["name"] = $_SESSION["pers"]["name"];
                        $form["mail"] = $_SESSION["pers"]["mail"];
                        $form["phone"] = $_SESSION["pers"]["phone"];
                        $form["comp"] = $_SESSION["pers"]["comp"];
                        $form["spec"] = $_SESSION["pers"]["spec"];
                        $form["comment"] = $info["comment"];
                        $form["date"] = date("d-m-y h:i:s", time());
                        $form["stamp"] = time();
                        $form["features"] = array();

                        foreach ($info["personify_list"] as $ord => $checked)
                            if ($checked)
                                array_push($form["features"], $default_features_list[$ord]);

                        // Save to backup location
                        array_push($backup_list, $form);
                        file_put_contents(PERSONIFY_ORDERS_LIST, json_encode($backup_list, JSON_UNESCAPED_UNICODE));

                        $subject = "Система 360: заказ индивидуальных настроек";
                        $message = "Заказ от: ". $form["name"];
                        $message .= "\nОрганизация: ". $form["comp"];
                        $message .= "\nДолжность: ". $form["spec"];
                        $message .= "\nE-mail: ". $form["mail"];
                        $message .= "\nТел.: ". $form["phone"];
                        $message .= "\n\nОтмеченные настройки: ";
                        if (!count($form["features"]))
                            $message .= "\n\nОтмеченных настроек нет.";
                        else
                        {
                            $message .= "\n\nОтмеченных настройки:";
                            foreach ($form["features"] as $ord => $tx)
                                $message .= "\n$ord) $tx";
                        }
                        if ($form["comment"])
                            $message .= "\n\nКомментарий заказчика: " . $form["comment"];

                        if (!IS_LOCAL)
                            sendMail($subject, $message, "info@hr-up.ru");
                        $ret = true;
                    }
                    else
                        $ret = false;
                    break;
                }

            case "dirs":
                {
                    if ($info)
                    {
                        $d = json_decode($info, true);
                        if ($d["action"] === "save")
                        {
                            $new_dirs = json_encode($d["dirs"]);
                            $filename = TEMP_DATA_DIR ."/dirs_".$_SESSION["pers"]["id"] . ".txt";
                            file_put_contents($filename, $new_dirs);
                            //$this->send_query("UPDATE pers SET dirs = '" . $new_dirs . "' WHERE id = " . $d["pers_id"]);
                            $_SESSION["pers"]["dirs"] = $d["dirs"];
                        }
                        $ret = "done";
                    }
                    else
                        $ret = false;
                    break;
                }

            case "gang_change":
                {
                    $ret = false;
                    if ($info && isset($_SESSION) && isset($_SESSION["pers"]) && $_SESSION["pers"]["id"]*1 === -1 && isset($_SESSION["pers"]["gang"]))
                    {
                        $d = json_decode($info);
                        if ("pass" === $d->action)
                        {
                            $new_pass = encrypt($d->new_pass);
                            try{
                                $this->send_query("UPDATE pers SET pass = '$new_pass' WHERE mail = '" . $d->mail . "'");
                                $ret = "done";
                            }
                            catch (PDOException $e)
                            {
                                log_add( "pers->gang_change, password: ". $e->getMessage());
                            }
                        }
                        elseif ("mail" === $d->action)
                        {
                            try{
                                $this->send_query("UPDATE pers SET mail = '". $d->new_mail ."', login = '". $d->new_mail ."' WHERE mail = '" . $d->mail . "'");

                                $_SESSION["pers"]["gang"][$d->ord]["mail"] = $d->new_mail;
                                $ret = "done";
                            }
                            catch (PDOException $e)
                            {
                                log_add( "pers->gang_change, email: ". $e->getMessage());
                            }
                        }
                    }
                    break;
                }
        }
        if ($reconnect)
            $this->DB_close($q);

        if ($ret !== "#")
            return $ret;
    }
//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
    function competention($action,$mode=false){
        if ($action === "list"){
            $this->DB_conn();
            $_SESSION["comps"] = array();
            $owner_id = $_SESSION['pers']['id'];

            $res = $this->send_query("SELECT id, name, cd, ud, madeby FROM comp WHERE madeby = -1 OR madeby = '$owner_id'");
            while ($bro = $res->fetch(PDO::FETCH_ASSOC))
            {
                $bro = digitize($bro, array("cd","ud","madeby","id"));
                array_push($_SESSION["comps"], $bro);
            }
            // Определить статус [5] слот
            foreach ($_SESSION["comps"] as &$comp){
                $status = 0;
                foreach ($_SESSION['qsts'] as $qst)
                    // Вопрос из этой компетенции и он вовлечён
                    if ($qst["comp_id"] === $comp["id"] && $qst["status"] !== 0)
                        $status++;
                // Статуус определяет вовлеченность компетенции по вовлеченности вовпросов входящих в него
                // данное число отображает кол-во вовлеченных вопросов этой компетенции
                $comp["status"] = $status;
            }
            $this->DB_close($q);
            return true;
        }
        elseif ($action === "create"){
            $this->DB_conn();

            $owner_id = $_SESSION["udata"][0];
            $name = $this->Purify($_POST["name"]);
            $date = time();
            $this->send_query("INSERT INTO comp SET
              name = '$name',
              madeby = '$owner_id',
              cDate = '$date',
              uDate = '$date'");
            $this->DB_close($q);
            return true;
        }
        elseif ($action === "rename"){
            $this->DB_conn();
            $d = json_decode($_POST["data"]);
            $this->send_query("UPDATE comp SET name = '". $d->name ."', ud = '". time() ."' WHERE id = ". $d->cid);
            $this->DB_close($q);
            echo true;
        }
        elseif ($action === "delete"){
            $this->DB_conn();
            $comp_iid = $this->Purify($_POST['id'], "int");
            $comp_oid = $_SESSION["comps"][$comp_iid][0];

            // Получить разрешение на удаление (в виде условия)
            $permission = $this->get_permission();
            // Удалить саму компетенцию
            $this->send_query("DELETE FROM comp WHERE id = '$comp_oid'" . $permission);

            // Удалить все её вопросы
            $trans = $this->_db->prepare("DELETE FROM qst WHERE id = ? " . $permission);
            foreach ($_SESSION["qsts"] as $qst)
                if ($qst[5]*1 === $comp_oid){
                    $trans->bind_param("s",$qst[0]);
                    $trans->execute();
                }

            $this->DB_close($q);
            return true;
        }
    }
//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
    function question($action, $info=false, $recon = true, $madeby_id = null)
    {
        if ($recon)
            $this->DB_conn();

        if (null !== $madeby_id)
            $owner_id = $madeby_id;
        else
            $owner_id = $_SESSION["pers"]["id"];

        if ($action === "list")
        {
            $_SESSION['qsts'] = array();
            $cond = $this->set_select_cond($owner_id);

            $res = $this->send_query("SELECT id, head, tx, madeby, comp_id, status, cd, ud FROM qsts ".$cond . " ORDER BY ud DESC");
            while ($bro = $res->fetch(PDO::FETCH_ASSOC))
            {
                foreach ($bro as $key => &$val)
                    if (in_array($key, array("head","tx")))
                        $val = shield($val,false);
                $bro = digitize($bro, array("cd","ud","madeby","id","status","comp_id"));
                array_push($_SESSION['qsts'], $bro);
            }
            $this->DB_close($q);
            return true;
        }
        elseif ($action === "add")
        {
            $d = json_decode($_POST["data"]);
            $date = time();
            $new_comp = array();
            $new_qst = array();
            // New comp - first add that
            if ($d->comp_id === null)
            {
                $new_comp["name"] = $d->comp_name;
                $new_comp["cd"] = $date;
                $new_comp["ud"] = $date;
                $new_comp["madeby"] = $owner_id;
                $this->send_query("INSERT INTO comp SET
                  name = '$d->comp_name',
                  cd = '$date',
                  ud = '$date',
                  madeby = '$owner_id'");
                $new_comp["id"] = $this->_db->lastInsertId() * 1;
                $d->comp_id = $new_comp["id"];
                array_push($_SESSION["comps"], $new_comp);
            }

            // Only if competention is defined
            if ($d->comp_id !== null)
            {
                $new_qst["tx"] = $d->tx;
                $new_qst["cd"] = $date;
                $new_qst["ud"] = $date;
                $new_qst["madeby"] = $owner_id;
                $new_qst["comp_id"] = $d->comp_id;
                $this->send_query("INSERT INTO qsts SET
                  tx = '$d->tx',
                  comp_id = '$d->comp_id',
                  cd = '$date',
                  ud = '$date',
                  madeby = '$owner_id'");
                $new_qst["id"] = $this->_db->lastInsertId() * 1;
                array_push($_SESSION["qsts"], $new_qst);

                $form = array();
                if (count($new_comp))
                    $form["comp"] = $new_comp;
                $form["qst"] = $new_qst;
                // Send info about new qst and/or comp
                return json_encode($form, JSON_UNESCAPED_UNICODE);
            }
            else
                return false;
        }
        elseif ($action === "update")
        {
            $this->DB_conn();
            $d = json_decode($_POST["data"]);
            $this->send_query("UPDATE qsts SET 
              tx = '". $d->tx ."',
              ud = '". time() ."'
              WHERE id = '". $d->qid ."'");
            return true;
        }
        elseif ($action === "delete"){
            $this->DB_conn();
            $qst_oid = $this->Purify($info, "int");
            $date = time();
            $permission = $this->get_permission();
            $this->send_query("DELETE FROM qsts WHERE id = '$qst_oid'" . $permission);

            // Удалить индекс этого вопроса из всех опросников
            $trans = $this->_db->prepare("UPDATE qbook SET qst_list = ?, uDate = '$date' WHERE id = ?");
            $qb_iid = -1;
            foreach ($_SESSION["qbooks"] as $qbook){
                $qb_iid++;
                $id = -1;
                $qst_ord = -1;
                foreach ($qbook[2] as $qst_id){
                    $qst_ord++;
                    // Идекс удаляемого опроса найден в списке этого опросника
                    if ($qst_oid === $qst_id*1){
                        // Запомнить индекс опросника который нужно обновить
                        $id = $qbook[3] * 1;
                        break;
                    }
                }
                // Вопрос был найден - вырезать его и обновить опросник
                if ($id !== -1){
                    // Вынять индекс вопроса из списка опросника
                    unset($_SESSION["qbooks"][$qb_iid][2][$qst_ord]);
                    // Перешить список вопросов
                    if ($_SESSION["qbooks"][$qb_iid][2] && count($_SESSION["qbooks"][$qb_iid][2]) > 0)
                        $list = implode(",", $_SESSION["qbooks"][$qb_iid][2]);
                    else
                        $list = null;
                    $trans->bind_param("ss", $list, $id);
                    $trans->execute();
                }
            }
            echo true;
        }
        elseif ($action === "import")
        {
            $this->DB_conn();
            $info = json_decode($info, true);
            $new_cmps = $info["new_comps"];
            $new_cmps_id = array();
            $new_qsts = $info["new_qsts"];
            $date = time();

            // Insert all new comps and get their id's
            $trans = $this->_db->prepare("INSERT comp SET name = ?, cd = '$date', ud = '$date', madeby = $owner_id");
            foreach ($new_cmps as $comp_ind => $comp_name)
            {
                $trans->execute(array($comp_name));
                if ($comp_id = $this->_db->lastInsertId() * 1)
                    array_push($new_cmps_id, $comp_id);
            }
            unset($trans);

            // Удалить индекс этого вопроса из всех опросников
            $trans = $this->_db->prepare("INSERT qsts SET tx = ?, cd = '$date', ud = '$date', madeby = $owner_id, comp_id = ?");
            foreach ($new_qsts as $key => $slot)
                if ($slot["is_new"])
                {
                    $comp_id = $slot["comp_id"];
                    if ($slot["comp_index"] !== null)
                        $comp_id = $new_cmps_id[$slot["comp_index"]];
                    $trans->execute(array($slot["tx"], $comp_id));
                    $new_qsts[$key]["id"] = $this->_db->lastInsertId() * 1;
                }

            $form = array();
            $form["qsts_id_list"] = array();
            foreach ($new_qsts as $slot)
                array_push($form["qsts_id_list"], $slot["id"]);

            // Refresh comps and qsts globaly
            $this->question("list"); // +
            $this->competention("list"); // +
            $form["qsts"] = $_SESSION["qsts"];
            $form["comps"] = $_SESSION["comps"];
            echo json_encode($form, JSON_UNESCAPED_UNICODE);
        }

        if ($recon)
            $this->DB_close($q);
    }
//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
    function qbook($action,$mode=false,$alter_pid=false){
        $owner_id = $_SESSION['pers']["id"];

        if ($action === "list"){
            if ("no_recon" !== $mode)
                $this->DB_conn();
            if (!$alter_pid)
            {
                $_SESSION['qbooks'] = array();
                $stack = &$_SESSION['qbooks'];
            }
            else
                $stack = array();

            $cond = $this->set_select_cond($owner_id, false, $alter_pid);
            $new_indexes_list = array();

            /*
            if ($alter_pid)
                file_put_contents("resp_rec_chk.txt", "\n qbook condition $cond" , FILE_APPEND);
            */

            $res = $this->send_query("SELECT id, name, madeby, list, cd, ud, status, lay_name, lay_id, struct FROM qbook ".$cond);
            while ($bro = $res->fetch(PDO::FETCH_ASSOC))
            {
                // Get numbers in numeric type
                $bro = digitize($bro, array("cd","ud","madeby","id","status","lay_id"));
                $bro["list"] = explode(",", $bro["list"]);
                $bro["list"] = digitize($bro["list"]);

                if ($bro["struct"] && "\"\"" !== $bro["struct"])
                {
                    $v = str_replace("♀", "\\", $bro["struct"]);
                    $bro["struct"] = json_decode($v, true);
                    foreach ($bro["struct"]["c_list"] as $i => $comp)
                        if (isset($bro["struct"]["c_list"][$i]["targ_avg"]) &&
                            0 === $bro["struct"]["c_list"][$i]["targ_avg"])
                            $bro["struct"]["c_list"][$i]["targ_avg"] = null;

                    // Update to a new category
                    foreach ($bro["struct"]["q_list"] as $i => $qst)
                        if (isset($qst["cats"]) && !$qst["cats"][1])
                        {
                            $bro["struct"]["q_list"][$i]["cats"][1] = array(
                                "tx" => "",
                                "is_on" => 0
                            );
                        }
                }
                else
                    $bro["struct"] = "";

                // Reformat lay name into an array
                if (strlen($bro["lay_name"]) < 5)
                {
                    // We give for each ID of each layer a one-timed indexation of qbooks [0+]
                    if (!isset($new_indexes_list[$bro["lay_name"]]))
                        $new_indexes_list[$bro["lay_name"]] = [];
                    if (!isset($new_indexes_list[$bro["lay_name"]][$bro["lay_id"]]))
                        $new_indexes_list[$bro["lay_name"]][$bro["lay_id"]] = -1;

                    $new_indexes_list[$bro["lay_name"]][$bro["lay_id"]]++;
                    $current_index_of_layer = $new_indexes_list[$bro["lay_name"]][$bro["lay_id"]];

                    $bro["meta"] = array();
                    $bro["meta"]["lay_name"] = $bro["lay_name"];
                    $bro["meta"]["lay_ind"] = $current_index_of_layer;
                    $new_layout = json_encode($bro["meta"]);
                    $this->send_query("UPDATE qbook SET lay_name = '$new_layout' WHERE id = " . $bro["id"]);
                }
                else
                {
                    $bro["meta"] = json_decode($bro["lay_name"], true);
                    $bro["lay_name"] = $bro["meta"]["lay_name"];
                }

                array_push($stack, $bro);
            }

            if ("no_recon" !== $mode)
                $this->DB_close($q);


            // Fix indexation errors
            file_put_contents("dires_index_corrector.txt", "start \n");
            if (count($stack))
            {
                $bank = array();
                $errors = array();
                foreach ($stack as $ord => $qb)
                {
                    $meta = $qb["meta"];
                    $layer = $meta["lay_name"];
                    $index = $meta["lay_ind"];
                    if (!isset($bank[$layer]))
                    {
                        $bank[$layer] = array(
                            "latest" => $meta["lay_ind"],
                            "ind_list" => array($index)
                        );
                    }
                    else
                    {
                        // we found duplicate of index
                        if (in_array($index, $bank[$layer]["ind_list"]))
                        {
                            $slot = $meta;
                            $slot["ord"] = $ord;
                            array_push($errors, $slot); // add to resolving later
                        }

                        else
                        {
                            if ($index > $bank[$layer]["latest"]) // track the latest avaliable index
                                $bank[$layer]["latest"] = $index;
                            array_push($bank[$layer]["ind_list"], $index);
                        }

                    }
                }

                // Correction
                if (count($errors))
                {
                    file_put_contents("dires_index_corrector.txt", json_encode($errors), FILE_APPEND);
                    foreach ($errors as $er)
                    {
                        $i = $er["ord"] * 1;
                        $slot = &$stack[$i];
                        $meta = $slot["meta"];
                        $layer = $meta["lay_name"];
                        $bank[$layer]["latest"]++; // new latest with correction inserted errorneus slot
                        file_put_contents("dires_index_corrector.txt", "\n for ". $slot["name"] ." reset lay_index from " .$slot["meta"]["lay_ind"]. " to " . $bank[$layer]["latest"] . "", FILE_APPEND);
                        $slot["meta"]["lay_ind"] = $bank[$layer]["latest"];
                        unset($slot);
                    }
                }
            }

            if (!$alter_pid)
                return true;
            else
                return $stack;

        }

        elseif ($action === "new")
        {
            $this->DB_conn();
            $d = json_decode($_POST["data"], true);
            $date =  time();
            $d["cd"] = $date;
            $d["ud"] = $date;
            $d["madeby"] = $owner_id;
            if (!isset($d["struct"]))
                $d["struct"] = "";
            if (!isset($d["lay_id"]))
                $d["lay_id"] = 0;

            //$d["lay_name"] = json_encode($d["meta"]);



            // make a query of params
            $q_params = "";
            $ord = 0;
            foreach ($d as $key => $val)
            {
                if (in_array($key, array("cd","ud","lay_id","status","madeby")))
                {
                    ($ord > 0) ? $q_params .= ", " : false;
                    $q_params .= $key . " = " . ($val * 1);
                    $ord++;
                }
                elseif (in_array($key, array("lay_name")))
                {
                    ($ord > 0) ? $q_params .= ", " : false;
                    $q_params .= $key . " = '". json_encode($d["meta"]) ."'";
                    $ord++;
                }
                elseif (in_array($key, array("name")))
                {
                    ($ord > 0) ? $q_params .= ", " : false;
                    $q_params .= $key . " = '$val'";
                    $ord++;
                }
                elseif (in_array($key, array("list")))
                {
                    ($ord > 0) ? $q_params .= ", " : false;
                    $q_params .= $key . " = '". implode(",", $val) ."'";
                    $ord++;
                }
                elseif (in_array($key, array("struct")))
                {
                    ($ord > 0) ? $q_params .= ", " : false;
                    $v = json_encode($val);
                    $v = str_replace("\\", "♀", $v);
                    $q_params .= $key . " = '$v'";
                    $ord++;
                }
            }

            $this->send_query("INSERT INTO qbook SET $q_params");
            $d["id"] = $this->_db->lastInsertId() * 1;
            array_push($_SESSION["qbooks"], $d);

            $this->DB_close($q);
            return json_encode($d, JSON_UNESCAPED_UNICODE);
        }

        elseif ($action === "save")
        {
            $this->DB_conn();
            $d = json_decode($_POST["data"], true);
            $d["ud"] = time();
            $qb = &$_SESSION["qbooks"][$d["qb_ord"]];

            // make a query of params
            $q_params = "";
            $ord = 0;
            foreach ($d as $key => $val)
            {
                $qb[$key] = $val;
                if (in_array($key, array("cd","ud","lay_id","status")))
                {
                    ($ord > 0) ? $q_params .= ", " : false;
                    $q_params .= $key . " = " . $qb[$key];
                    $ord++;
                }
                elseif (in_array($key, array("lay_name")))
                {
                    ($ord > 0) ? $q_params .= ", " : false;
                    $q_params .= $key . " = '". json_encode($d["meta"]) ."'";
                    $ord++;
                }
                elseif (in_array($key, array("name")))
                {
                    if (( "lay_name") === $key)
                        $val = json_encode($val);
                    ($ord > 0) ? $q_params .= ", " : false;
                    $q_params .= $key . " = '$val'";
                    $ord++;
                }
                elseif (in_array($key, array("list")))
                {
                    ($ord > 0) ? $q_params .= ", " : false;
                    $q_params .= $key . " = '". implode(",", $val) ."'";
                    $ord++;
                }
                elseif (in_array($key, array("struct")))
                {
                    ($ord > 0) ? $q_params .= ", " : false;
                    $v = json_encode($val);
                    $v = str_replace("\\", "♀", $v);
                    $q_params .= $key . " = '$v'";
                    $ord++;
                }
            }

            $this->send_query("UPDATE qbook SET $q_params WHERE id = ". $d["qb_id"] ." AND (" . $this->madeby_filter(true). ")");
            $this->DB_close($q);
            return json_encode($qb);
        }

        elseif ($action === "swap_index")
        {
            $this->DB_conn();
            $d = json_decode($_POST["data"], true);
            $d["ud"] = time();

            $this->send_query("UPDATE qbook SET ud = ". $d["ud"] .", lay_name = '". json_encode($d["from_meta"]) ."' WHERE id = ". $d["from_qb_id"] ." AND (" . $this->madeby_filter(true). ")");
            $this->send_query("UPDATE qbook SET ud = ". $d["ud"] .", lay_name = '". json_encode($d["to_meta"]) ."' WHERE id = ". $d["to_qb_id"] ." AND (" . $this->madeby_filter(true). ")");
            $this->DB_close($q);
            return true;
        }

        elseif ($action === "delete"){
            $this->DB_conn();
            file_put_contents("qb_del_chk.txt", "info " . $mode, FILE_APPEND);
            $d = json_decode($mode);
            $qb_id = intval($d->qb_id);
            $this->send_query("DELETE FROM qbook WHERE id = '$qb_id' AND madeby = '" . $owner_id . "'");
            $this->DB_close($q);

            $this->qbook("list"); // refresh session data
            return json_encode($_SESSION["qbooks"]);
        }

        elseif ($action === "qbook_dirs_update"){
            if ($mode)
            {
                $this->DB_conn();
                $d = json_decode($mode, true);
                $date = time();
                //$file = "qb_redir_chk.txt";
                //file_put_contents($file, "src " . json_encode($d));

                $trans = $this->_db->prepare("UPDATE qbook SET lay_name = ?, ud = '$date', lay_id = ? WHERE id = ?");
                foreach ($d as $qbook)
                {
                    $lay_name = array(
                        "lay_name" => $qbook["lay_name"],
                        "lay_ind" => $qbook["lay_ind"]
                    );
                    $data_set = array(
                        json_encode($lay_name),
                        $qbook["lay_id"],
                        $qbook["qb_id"]
                    );
                    //file_put_contents($file, "add string " . json_encode($data_set), FILE_APPEND);
                    $trans->execute($data_set);
                    //file_put_contents($file, "result string " . $trans, FILE_APPEND);
                }

                $this->DB_close($q);
                $this->qbook("list"); // refresh session data
                return json_encode($_SESSION["qbooks"]);
            }
            else
                return false;

        }
        return false;
    }
//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
    function delivery($action,$mode=false){
        $owner_id = $_SESSION['pers']["id"];
        if ($action === "list"){
            $this->DB_conn();
            $_SESSION['delis'] = array();
            $cond = $this->set_select_cond($owner_id, "deli");

            $res = $this->send_query("SELECT id, head, list, status, madeby, cd, ud FROM deli ".$cond);
            while ($bro = $res->fetch(PDO::FETCH_ASSOC))
            {
                // Get numbers in numeric type
                $bro = digitize($bro, array("cd","ud","madeby","id","status"));
                $bro["list"] = explode(",", $bro["list"]);
                $bro["list"] = digitize($bro["list"]);
                array_push($_SESSION['delis'], $bro);
            }
            $this->DB_close($q);
            return true;
        }

        elseif ($action === "save"){
            $this->DB_conn();
            $owner_id = $_SESSION['pers']['id'];
            $data = json_decode($_POST['data']);
            $date = time();

            if ($mode === "saveAs"){
                // $data[0] - name; [1] - deli array: [0] - FIO, [1] - mail, [2] - oid or (-iid)
                $deli_name = $data[0];
                if (!$deli_name)
                    $deli_name = "рассылка без названия";
                // Прописать импортированных респондентов (если есть) и обновить их список
                if (is_array($data[1]) && is_array($data[1][2]) && count($data[1][2]) > 0)
                    $resp_list = implode(",", $this->delivery("register_new_resps", $data[1]));
                else
                    $resp_list = "";
                $this->send_query("INSERT INTO deli SET head = '$deli_name', madeby = '$owner_id', resp_list = '$resp_list', cDate = '$date', uDate = '$date' ");
            }
            elseif ($mode === "save"){
                // $data[0] - deli iid; [1] - deli name; [2] - deli aaray
                $deli_oid = $_SESSION["delis"][$data[0]*1][0];
                $deli_name = $data[1];
                // Define if we need to change a name (and we do if name isn't empty)
                $name_change = "";
                if ($deli_name)
                    $name_change = "head = '$deli_name',";

                // Прописать импортированных респондентов (если есть) и обновить их список
                if (is_array($data[2]) && is_array($data[2][2]) && count($data[2][2]) > 0)
                    $resp_list = implode(",", $this->delivery("register_new_resps", $data[2]));
                else
                    $resp_list = "";
                $this->send_query("UPDATE deli SET $name_change madeby = '$owner_id', resp_list = '$resp_list', uDate = '$date' WHERE id = '$deli_oid'");
            }
            $this->DB_close($q);
            return true;
        }

        elseif ($action === "register_new_resps"){
            // Принимает список айдишников участников рассылки, все отрицательные регистрирует заменяя их значения в списке на свои новые-внешние
            $owner_id = $_SESSION['pers']['id'];
            $date = time();
            $resp_list = $mode[2];
            $trans = $this->_db->prepare("INSERT INTO resp SET fio = ?, email = ?, madeby = '$owner_id', cDate = '$date', uDate = '$date'");
            $cntr = -1;
            // Для всех импортированных респ-тов - добавить их в БД и записьть их oid в список (вместо локальных "пустышек")
            foreach ($resp_list as &$resp_ind){
                $cntr++;
                if (!$resp_ind){
                    $trans->bind_param("ss",$mode[0][$cntr],$mode[1][$cntr]);
                    $trans->execute();
                    $resp_ind = $this->_db->insert_id;
                }
            }
            // и возвращает обратно список
            return $resp_list;
        }

        elseif ($action === "delete"){
            $this->DB_conn();
            $deli_oid = $_SESSION["delis"][$this->Purify($_POST['iid'], "int")][0];
            $permission = $this->get_permission();

            $this->send_query("DELETE FROM deli WHERE id = '$deli_oid'" . $permission);
            $this->DB_close($q);
            return true;
        }
    }
//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
    function quiz($action,$mode=false,$reconn=true){
        if ($reconn)
            $this->DB_conn();
        $owner_id = $_SESSION['pers']["id"];

        if ($action === "list")
        {
            file_put_contents("qz_stat_chk.txt", "");
            file_put_contents("resp_rec_chk.txt", "", FILE_APPEND);
            // Get all the feedback comments
            $comments = array();
            if (file_exists(COMMENTS_FILE))
                $comments = json_decode(file_get_contents(COMMENTS_FILE), true);

            $QBOOKS = $this->qbook("list", "no_recon", $owner_id);
            $this->question("list", false, false, $owner_id); // refreshes  qsts db, sets into the session
            $QSTS = $_SESSION['qsts'];

            $_SESSION['qzs'] = array();
            $cond = $this->set_select_cond($owner_id, "quiz");

            $res = $this->send_query("SELECT
                                      id,
                                      name,
                                      status,
                                      settings,
                                      resps,
                                      cd,
                                      ud,
                                      qkey,
                                      madeby
                                      FROM quiz ". $cond . " ORDER BY id DESC");
            if ($res)
                while ($bro = $res->fetch(PDO::FETCH_ASSOC))
                {
                    $bro = digitize($bro, array("id","status","cd","ud","madeby"));
                    // Decode all compressed arrays
                    foreach ($bro as $key => $slot)
                        if (in_array($key, array("settings","resps")))
                        {
                            if ($slot)
                            {
                                $bro[$key] = str_replace("\n","<br>",$bro[$key]);
                                $bro[$key] = str_replace("☼", "\\", $bro[$key]);
                                $bro[$key] = str_replace("♀♀", "\"", $bro[$key]);
                                $bro[$key] = str_replace("♀!♀", "\\\"", $bro[$key]);
                                $bro[$key] = str_replace("♀", "'", $bro[$key]);
                                $bro[$key] = json_decode($bro[$key]);

                                //if ($bro["qkey"] === "Yo8FU" && $key === "resps")
                                //file_put_contents("no_resps.txt", "\n Re-encoded " . json_encode($bro["resps"], JSON_UNESCAPED_UNICODE), FILE_APPEND);
                                // Change the formating back to its original state
                                if ($key === "settings")
                                {
                                    $bro[$key]->letter = str_replace("<br>","\n", $bro[$key]->letter);

                                    if (!isset($bro[$key]->djo_avg_id))
                                        $bro[$key]->djo_avg_id = 1;

                                    if (!isset($bro[$key]->self_ban_list))
                                        $bro[$key]->self_ban_list = [];
                                }
                                // RESPS - temporal restoration o missed answers from backup files
                                else
                                {
                                    $qkey = $bro["qkey"];
                                    // Add backup info to each resp's slot
                                    foreach ($bro[$key] as &$group)
                                        foreach ($group as &$resp_slot)
                                        {
                                            $filename_comm = BACKUP_ANSWERS_DIR . "/feedback_q_". $qkey."_r_". $resp_slot->ukey . ".txt"; // backup comments file
                                            $filename = BACKUP_ANSWERS_DIR . "/q_". $qkey."_r_". $resp_slot->ukey . ".txt"; // backup anwers file

                                            // REstore from answers backup if something is missing
                                            if (file_exists($filename))
                                            {
                                                $backup = json_decode(file_get_contents($filename),true);
                                                if (isset($backup["ans_list"]))
                                                    $backup_list = $backup["ans_list"];

                                                // Restore every missed non-empty answer
                                                if (isset($resp_slot->ans_list) && count($resp_slot->ans_list))
                                                    foreach ($resp_slot->ans_list as $ind =>  &$ans_val)
                                                        if (-1 === intval($ans_val) && null !== $backup_list[$ind])
                                                            $ans_val = $backup_list[$ind];
                                            }

                                            // REstore from answers backup if something is missing
                                            /*
                                            if (file_exists($filename_comm))
                                            {
                                                $backup_comm = json_decode(file_get_contents($filename_comm));

                                                // full recovery needed
                                                if (!$resp_slot->feedback || !count($resp_slot->feedback))
                                                    $resp_slot->feedback = $backup_comm;
                                                else
                                                {
                                                    // QZ LIST comments
                                                    if (!isset($resp_slot->feedback->qz_list))
                                                }
                                            }
                                            */
                                        }
                                }
                            }
                            else
                                $bro[$key] = array();
                        }


                    if ($bro["status"] === -1)
                    {
                        $bro["status"] = 0;
                        $bro["is_fixed"] = 1;
                    }
                    else
                        $bro["is_fixed"] = 0;

                    // Update self_ban_list for previous qbooks
                    foreach ($bro["resps"] as $r_ind => $r)
                        if (!isset($bro["settings"]->self_ban_list[$r_ind]))
                            $bro["settings"]->self_ban_list[$r_ind] = 0;

                    $filename = BACKUP_QZS_BLUEPRINT . "/qz_" . $_SESSION["pers"]["id"] . "_" . $bro["id"] . "_" . $bro["qkey"] . ".txt";
                    if (file_exists($filename))
                        $bro["can_restore"] = 1;
                    else
                        $bro["can_restore"] = 0;

                    // Recheck completion of quizes
                    $qz_status = 0;

                    if (intval($bro["settings"]->end_date) <= time())
                        $qz_status = 1;
                    else
                    {
                        $resps_qnt = 0;
                        $resps_done = 0;
                        $chk_slot = [];
                        $chk_slot["qz_id"] = $bro["id"];
                        $chk_slot["resps"] = $bro["resps"];
                        $chk_slot["resps"] = true_json_code($chk_slot["resps"]);
                        $chk_slot["resps"] = true_json_code($chk_slot["resps"], "decode");

                        $chk_slot["settings"] = $bro["settings"];
                        $chk_slot["settings"] = true_json_code($chk_slot["settings"]);
                        $chk_slot["settings"] = true_json_code($chk_slot["settings"], "decode");

                        foreach ($chk_slot["resps"] as $gr_ord => $gr)
                            foreach ($gr as $resp_ord => $r)
                            {
                                $resps_qnt++;

                                if (intval($r["ignore"]))
                                {
                                    $resps_done++;
                                    file_put_contents("qz_stat_chk.txt", "\n quiz" . $bro["name"] . ", g: $gr_ord, r: $resp_ord, qb_pct: -, fb_done: -, is_ignored", FILE_APPEND);
                                }
                                else
                                {
                                    $chk_slot["gr_ord"] = $gr_ord;
                                    $chk_slot["resp_ord"] = $resp_ord;
                                    $qb_pct_done = resp_pct_done($chk_slot, $QBOOKS);
                                    $fb_done = resp_fb_done($chk_slot, $QBOOKS, $QSTS);
                                    file_put_contents("qz_stat_chk.txt", "\n quiz" . $bro["name"] . ", g: $gr_ord, r: $resp_ord, qb_pct: $qb_pct_done, fb_done: $fb_done", FILE_APPEND);
                                    if ($qb_pct_done >= 1 && $fb_done)
                                        $resps_done++;
                                }

                            }

                        if ($resps_done === $resps_qnt)
                            $qz_status = 1;
                    }

                    // Recalculated status don't corresponds to current one
                    if ($qz_status !== $bro["status"]*1 && // can oтly complete quiz, not uncomplete
                        (0 === $bro["status"]*1 && !$bro["is_fixed"])) // can only mod status if quiz wasn't uncompleted manually
                    {
                        $bro["status"] = $qz_status;
                        $this->send_query("UPDATE quiz SET status = '$qz_status' WHERE id = '". $bro["id"] ."'");
                    }
                    array_push($_SESSION['qzs'], $bro);
                }
            if ($reconn)
                $this->DB_close($q);
            return true;
        }

        elseif ($action === "new")
        {
            $d = json_decode($mode, true);
            //$qst_qnt = count($d["qst_list"]);
            $date = time();
            $qz = array(); // need id and qkey
            $qz["name"] = $d["name"];
            $qz["cd"] = $date;
            $qz["ud"] = $date;
            $qz["madeby"] = $owner_id;
            $qz["qkey"] = $this->doKey(5, "qz");
            $qz["resps"] = $d["deli_list"];

            // Get the global amount of focus charges // prevents bugs when few people spend this
            (isset($_SESSION["pers"]["host_id"])) ? $host_pers_id = $_SESSION["pers"]["host_id"] : $host_pers_id = $_SESSION["pers"]["id"];
            $z = $this->send_query("SELECT focus_charges FROM pers WHERE id = '". $host_pers_id ."'");
            $fc = $z->fetchAll(PDO::FETCH_ASSOC);
            $charges_max = $fc[0]["focus_charges"] * 1;

            if (count($qz["resps"]) > $charges_max) // Shorten the groups amount if there is more then allowed for this account
                array_splice($qz["resps"], 0, $charges_max);
            // Reduce used focus charges on this pers
            //$charges_left = $charges_max - count($qz["resps"]);

            //$this->send_query("UPDATE pers SET focus_charges = '$charges_left' WHERE id = '". $host_pers_id ."'"); // update the global value of focus charges
            //$_SESSION["pers"]["focus_charges"] = $charges_left;

            $resps_qnt = 0;
            foreach ($qz["resps"] as $group)
                $resps_qnt += count($group);
            $resp_keys = $this->doKey(5, "resp", $resps_qnt);
            $key_ord = -1;
            $mailer_list = array();
            $mailer_focus_name_list = array();

            // Set all needed attributes for each resp in every focus group + get info on multi-links to same resp

            $RESPS = $this->resp("list", $owner_id, false); // Regather resps ?
            foreach ($qz["resps"] as $gr_ord => &$group)
            {
                $focus_name = "";
                foreach ($RESPS as $db_resp)
                    if ($db_resp['id'] === $group[0]["id"])
                    {
                        $focus_name = $db_resp["fio"];
                        break;
                    }

                foreach ($group as $resp_ord => &$resp)
                {
                    $key_ord++;
                    // we already have "id" & "cat_id"
                    $resp["ukey"] = $resp_keys[$key_ord];
                    $resp["ignore"] = false;
                    $resp["ans_list"] = array();
                    $resp["feedback"] = array();
                    $resp["last_upd"] = $date;
                    $resp["remainders_sent"] = 0;
                    $resp["last_message_id"] = null; // Unisenders id
                    $resp["last_message_status"] = null;
                    $resp["last_remainder_date"] = time();

                    if (!IS_LOCAL)
                    {
                        if ($resp_ord || // no self-eval role
                            !$d["settings"]["self_ban_list"][$resp_ord]) // self-eval role but not turned off
                        {
                            if (!isset($mailer_list[$resp["id"]]))
                            {
                                $mailer_list[$resp["id"]] = array();
                                $mailer_focus_name_list[$resp["id"]] = array();
                            }

                            $m_slot = &$mailer_list[$resp["id"]];

                            array_push($m_slot, $resp["ukey"]); // in case same resp present if several focus groups of same quiz, he will get N links in one letter
                            array_push($mailer_focus_name_list[$resp["id"]], $focus_name);
                            unset($m_slot);
                        }
                    }
                    unset($resp);
                }
                unset($group);
            }

            // Send invites (letters are grouped by unique respondent)
            if (!IS_LOCAL)
            {
                file_put_contents("mailer_list_check.txt", json_encode($mailer_list));
                $sent_letters_bank = array();
                // Send invites to resps (letters are grouped by unique respondent id's)
                foreach ($qz["resps"] as $gr_ord => &$group)
                {
                    foreach ($group as $resp_ord => &$resp)
                    {
                        $rid = $resp["id"];
                        $resp_mail = "";
                        $resp_fio = "";


                        foreach ($RESPS as $db_resp)
                            if (intval($db_resp['id']) === intval($resp["id"]))
                            {
                                $resp_mail = mb_strtolower($db_resp["mail"]);
                                $resp_fio = $db_resp["fio"];
                                break;
                            }

                        // Send mail
                        if ($resp_mail && !in_array($resp_mail, $sent_letters_bank))
                        {
                            array_push($sent_letters_bank, $resp_mail);

                            $message = $d["settings"]["letter"];
                            $btn_name = explode("##", $message);
                            $btn_name = $btn_name[1];

                            $link = "";
                            file_put_contents("mailer_list_check.txt", "\n resp id " . $rid . " is_empty=" . empty($mailer_list[$rid]) ." |", FILE_APPEND);
                            // Add all needed links to one letter
                            if (!empty($mailer_list[$rid]))
                            {
                                foreach ($mailer_list[$rid] as $list_ord => $ukey) // pack all link for this resp into one letter, but multi-btns
                                {
                                    $focus_name = $mailer_focus_name_list[$resp["id"]][$list_ord];
                                    if (!$btn_name)
                                        $btn_name = $focus_name;

                                    $path = DURL . "client.php?q=".$qz["qkey"]."&r=".$ukey;
                                    $link_string = get_link_button_html($btn_name, $path); //"<a href='". $path ."'><b>ПЕРЕЙТИ</b></a>";
                                    $link .= "\n опрос <b>$focus_name</b> $link_string";
                                }

                                file_put_contents("mailer_list_check.txt", "\n link " . $link, FILE_APPEND);
                                $message = str_replace("##$btn_name##", $link, $message);
                                $message = str_replace("%ФИО%", $focus_name, $message);
                                $message = str_replace("%NAME%", $focus_name, $message);
                                $message = str_replace("%LINK%", $link, $message);
                                $message = str_replace("\n", "<br>", $message);
                                $message = str_replace("%ORG%", $_SESSION["pers"]["comp"], $message);
                                $subject = $d["settings"]["letter_head"];
                                $resp["last_message_id"] = sendMail($subject, $message, $resp_mail);
                                //sleep(7);
                            }
                        }
                        else
                        {
                            if (!$resp_mail)
                                log_add("no resp mail while trying to send invites on qz:create, rid: $rid, cat_id: " . $resp["cat_id"]);
                        }

                        unset($resp);
                    }
                    unset($group);
                }

                // Send invites to watchers
                foreach ($d["watchers_list"] as $watcher)
                {
                    $this->watchers("new", $watcher, false, array("no_src_decode"=>true,"return_none"=>true));
                }
            }

            //Add watchers info

            // All the settings stuff
            $qz["settings"] = array();
            $sts = &$qz["settings"];
            $sts["comment"] = $d["comment"];
            $sts["qst_list"] = $d["qst_list"];
            $sts["is_anon"] = $d["settings"]["is_anon"];
            $sts["self_ban_list"] = $d["settings"]["self_ban_list"]; // new
            $sts["start_date"] = $d["settings"]["start_date"] * 1;
            $sts["end_date"] = $d["settings"]["end_date"] * 1;
            $sts["answer_set_id"] = $d["answer_set_id"] * 1;
            $sts["scale_id"] = $d["settings"]["scale_id"] * 1;
            $sts["letter"] = str_replace("\n","<br>", $d["settings"]["letter"]); // Change the formating to avoid error on json_decode after getting it from DB
            $sts["letter_head"] = $d["settings"]["letter_head"]; // Change the formating to avoid error on json_decode after getting it from DB
            $sts["notice_list"] = $d["settings"]["notice_list"];
            $sts["notice_period_id"] = $d["settings"]["notice_period_id"];
            $sts["notice_pct"] = $d["settings"]["notice_pct"];
            $sts["comm_groups"] = $d["settings"]["comm_groups"];
            $sts["answer_opts_list"] = $d["settings"]["answer_opts_list"];
            $sts["intro_tx"] = $d["settings"]["intro_tx"];
            $sts["is_muted"] = $d["settings"]["is_muted"] * 1;
            $sts["djo_avg_id"] = $d["settings"]["djo_avg_id"] * 1;

            unset($sts);
            $qz["resps"] = true_json_code($qz["resps"]); // compress to safe json
            $qz["settings"] = true_json_code($qz["settings"]);
            $qz_coded = json_encode($qz, JSON_UNESCAPED_UNICODE);
            $qz_coded = str_replace("\\", "♀", $qz_coded);

            if (!is_dir(FRESH_QZS_BACKUP_DIR))
                mkdir(FRESH_QZS_BACKUP_DIR, 0754, true);
            file_put_contents("FRESH_QZS_BACKUP_DIR/fresh_qz_backup_". $qz["qkey"] .".txt", $qz_coded);
            // сменить статус рассылки
            $this->send_query("INSERT INTO quiz SET name = '". $qz["name"] ."',
                cd = ". $qz["cd"] .",
                ud = ". $qz["ud"] .",
                resps = '". $qz["resps"] ."',
                settings = '". $qz["settings"] ."',
                madeby = ". $qz["madeby"] .",
                qkey = '". $qz["qkey"] ."'
                 ");

            $qz["id"] = $this->_db->lastInsertId()*1;
            $qz["focus_charges"] = -50;//$charges_left;
            $qz["resps"] = true_json_code($qz["resps"], "decode"); // decompress from safe json to use
            $qz["settings"] = true_json_code($qz["settings"], "decode");

            // Create a starter blueprint backup of freshly create quiz
            $qz_save = true_json_code($qz);
            $filename = BACKUP_QZS_BLUEPRINT . "/qz_" . $_SESSION["pers"]["id"] . "_" . $qz["id"] . "_" . $qz["qkey"] . ".txt";
            if (!is_dir(BACKUP_QZS_BLUEPRINT))
                mkdir(BACKUP_QZS_BLUEPRINT, 0754, true);
            file_put_contents($filename, $qz_save);

            array_push($_SESSION['qzs'], $qz);
            if ($reconn)
                $this->DB_close($q);
            return json_encode($qz, JSON_UNESCAPED_UNICODE);
        }

        elseif ($action === "restore")
        {
            $ans = false;
            $d = json_decode($mode);
            if (isset($_SESSION["pers"]["id"]) && ($_SESSION["pers"]["id"] === $d->pid*1 || $_SESSION["pers"]["id"] === -1)) // this is owner of the session or admin
            {
                $qz_key = $_SESSION["qzs"][$d->qz_ord]["qkey"];
                $filename = BACKUP_QZS_BLUEPRINT . "/qz_" . $_SESSION["pers"]["id"] . "_" . $d->qz_id . "_" . $qz_key . ".txt";
                if (file_exists($filename))
                {
                    $blueprint = true_json_code(file_get_contents($filename), "decode"); // decodes to assoc
                    $param_name = $d->action;
                    $param_val = true_json_code($blueprint[$param_name]); // encode back for db
                    // update to db
                    $this->send_query("UPDATE quiz SET $param_name = '". $param_val ."' WHERE id = " . $d->qz_id);
                    // update to session
                    $_SESSION["qzs"][$d->qz_ord][$param_name] = $blueprint[$param_name]; // assign decoded for the session
                    $ans = json_encode($_SESSION["qzs"][$d->qz_ord][$param_name], JSON_UNESCAPED_UNICODE);
                }
            }

            if ($reconn)
                $this->DB_close($q);
            //return json_encode($_SESSION['qzs'], JSON_UNESCAPED_UNICODE);
            return $ans;
        }

        elseif ($action === "del")
        {

            $d = json_decode($mode);
            //$qst_qnt = count($d["qst_list"]);
            $z = $this->send_query("SELECT * FROM quiz WHERE id = '". $d->qz_id ."' AND madeby = " . $_SESSION["pers"]["id"]);
            $fc = $z->fetchAll(PDO::FETCH_ASSOC);
            $fc = $fc[0];


            $filename = BACKUP_DELETED_QZS_DIR . "/qz_" . $_SESSION["pers"]["id"] . "_" . $d->qz_id . ".txt";
            if (!is_dir(BACKUP_DELETED_QZS_DIR))
                mkdir(BACKUP_DELETED_QZS_DIR, 0754, true);


            file_put_contents($filename, json_encode($fc));


            $this->send_query("DELETE FROM quiz WHERE id = '". $d->qz_id ."' AND madeby = " . $_SESSION["pers"]["id"]);
            $this->quiz("list", null, false);
            if ($reconn)
                $this->DB_close($q);
            return json_encode($_SESSION['qzs'], JSON_UNESCAPED_UNICODE);
        }

        elseif ($action === "rename")
        {

            $d = json_decode($mode);
            $this->send_query("UPDATE quiz SET name = '". $d->qz_name ."'WHERE id = '". $d->qz_id ."' AND madeby = " . $_SESSION["pers"]["id"]);
            $_SESSION["qzs"][$d->qz_ord]["name"] = $d->qz_name;

            if ($reconn)
                $this->DB_close($q);
            return "qz_renamed";
        }

        elseif ($action === "status_update")
        {
            $d = json_decode($mode);
            if (isset($d->status) && isset($d->qz_id))
            {
                $_SESSION["qzs"][$d->qz_ord]["status"] = $d->status;
                $this->send_query("UPDATE quiz SET status = '" . $d->status . "', ud = '". time() ."' WHERE id = '". $d->qz_id ."'");
                return true;
            }
            else
                return false;
        }

        elseif ($action === "qz_mute")
        {
            $d = json_decode($mode);
            $z = $this->send_query("SELECT settings FROM quiz WHERE id = '". $d->qz_id ."' AND madeby = " . $_SESSION["pers"]["id"]);
            $fc = $z->fetchAll(PDO::FETCH_ASSOC);
            $sts = $fc[0]["settings"];
            $sts = str_replace("\n","<br>", $sts);
            $sts = str_replace("☼", "\\", $sts);
            $sts = str_replace("♀♀", "\"",$sts);
            $sts = str_replace("♀!♀", "\\\"", $sts);
            $sts = str_replace("♀", "'", $sts);
            $sts = json_decode($sts);
            $sts->is_muted = $d->mute_state;
            $sts->is_muted_tx = $d->mute_tx;
            $sts = true_json_code($sts);
            $_SESSION["qzs"][$d->qz_ord]["settings"]->is_muted = $d->mute_state;
            $_SESSION["qzs"][$d->qz_ord]["settings"]->is_muted_tx = $d->mute_tx;
            $this->send_query("UPDATE quiz SET settings = '$sts' WHERE id = '". $d->qz_id ."' AND madeby = " . $_SESSION["pers"]["id"]);
            return true;
        }


        elseif ($action === "exclusion_update")
        {
            $d = json_decode($mode, true);
            //$qst_qnt = count($d["qst_list"]);
            $date = time();
            $new_set = $d["new_set"];

            $q = $this->send_query("SELECT resps FROM quiz WHERE id = '". $d["qz_id"] ."'");
            $old_resps = $q->fetch(PDO::FETCH_ASSOC);
            $old_resps = true_json_code($old_resps["resps"], "decode");
            //$old_resps = json_decode($old_resps["resps"], true);

            foreach ($old_resps as $gr_ord => &$gr)
                foreach ($gr as $resp_ord => &$r)
                    if ($r["ignore"] !== $new_set[$gr_ord][$resp_ord])
                    {
                        $r["ignore"] = $new_set[$gr_ord][$resp_ord]; // change status
                        $r["ud"] = time(); // remember the update time
                    }
            unset($r);
            unset($gr);
            //$old_resps = json_encode($old_resps, JSON_UNESCAPED_UNICODE);
            $old_resps = true_json_code($old_resps);
            if ($old_resps)
                $this->send_query("UPDATE quiz SET resps = '$old_resps' WHERE id = '". $d["qz_id"] ."'");
            return $old_resps; // give back the updated bit
        }

        elseif ($action === "new_end_date")
        {
            $d = json_decode($mode, true);
            //$qst_qnt = count($d["qst_list"]);
            $date = time();
            $new_end_date = $d["end_date"];

            $q = $this->send_query("SELECT settings FROM quiz WHERE id = '". $d["qz_id"] ."'");
            $old_sett = $q->fetch(PDO::FETCH_ASSOC);
            $old_sett = true_json_code($old_sett["settings"], "decode");
            $old_sett["end_date"] = $new_end_date;
            $old_sett = true_json_code($old_sett);
            if ($old_sett)
            {
                $this->send_query("UPDATE quiz SET settings = '$old_sett', ud='$date' WHERE id = '". $d["qz_id"] ."'");
                $this->quiz("list", null, false); // refreh session data
                return true;
            }
            else
                return false;
             // give back the updated bit
        }

        elseif ($action === "group_resp_add") // hr.up@fortest.only
        {
            $d = json_decode($mode);
            // refresh quizes array
            $this->quiz("list",false,false);
            if (!isset($_SESSION["resps"]))
                $this->resp("list", $owner_id,false, true);

            $qz = null;
            foreach ($_SESSION["qzs"] as $qz_key => $db_qz)
                if ($db_qz['id'] === $d->qz_id)
                {
                    $qz = &$_SESSION["qzs"][$qz_key];
                    break;
                }

            if (null === $qz)
            {
                log_add("qz_id not found in 'group_resp_add' qz_id=" . $d->qz_id);
                return ("no_qz_found");
            }
            else
            {
                $new_resp = array();
                $new_resp["id"] = null;
                $resp_is_duplicated = false;
                $new_resp_found = false;
                $mail = mb_strtolower($d->mail);

                $is_test_mail = false;
                if (in_array($mail, array("plarium@fortest.only","hr.up@fortest.only")))
                    $is_test_mail = true;
                // Check if the resp is new via mail

                if (!$is_test_mail)
                {
                    foreach ($_SESSION["resps"] as $resp_slot)
                        if (mb_strtolower($resp_slot["mail"]) === $mail)
                        {
                            $new_resp["id"] = $resp_slot["id"]*1;
                            break;
                        }

                    if (null === $new_resp["id"]) // this IS a new resp
                    {
                        $new_resp_found = true;
                        // add resp to Db
                        $new_resp_id_list = $this->resp("new", array(array("fio" => $d->fio, "spec" => $d->spec, "mail" => $d->mail)), false); // list-array of new resps keys
                        $new_resp["id"] = $new_resp_id_list[0]; // get his new id to ur qz info, [0] cuz we know for sure we have asked only for one resp
                    }
                    // check if resp with that id already exists in that group
                    else
                    {
                        foreach ($qz["resps"][$d->gr_ord] as $resp_slot)
                            if ($resp_slot->id*1 === $new_resp["id"])
                            {
                                $resp_is_duplicated = true;
                                break;
                            }
                    }
                }

                file_put_contents("tester_mail_cjk.txt", "start: mail->" . $mail . " recoded $mail");
                if ($is_test_mail)
                {
                    file_put_contents("tester_mail_cjk.txt", "\n go to test chamber:", FILE_APPEND);
                    $group = $qz["resps"][$d->gr_ord];
                    $sts = $qz["settings"];
                    if ("plarium@fortest.only" === $mail)
                        $mail = "marina.ereshchenko@plarium.com";
                    else
                        $mail = "info@hr-up.ru";
                    file_put_contents("tester_mail_cjk.txt", "\n actual mail: $mail", FILE_APPEND);

                    // Send invite to a newbie
                    if (!IS_LOCAL)
                    {
                        file_put_contents("tester_mail_cjk.txt", "\n not local: resps count" . count($_SESSION["resps"]), FILE_APPEND);
                        $focus_name = "";
                        $focus_id = $group[0]->id;
                        foreach ($_SESSION["resps"] as $db_resp)
                            if ($db_resp['id'] === $focus_id)
                            {
                                $focus_name = $db_resp["fio"]; // get a focus-person fio in each group
                                break;
                            }
                        file_put_contents("tester_mail_cjk.txt", "\n after foreach", FILE_APPEND);

                        // Send mail
                        $message = "*error finding a message text*";
                        if (isset($sts->letter))
                            $message = $sts->letter;
                        elseif (isset($sts["letter"]))
                            $message = $sts["letter"];
                        $btn_name = explode("##", $message);
                        if (count($btn_name) >= 3)
                            $btn_name = $btn_name[1];
                        else
                            $btn_name = "default btn name";
                        if (!$btn_name)
                            $btn_name = "Перейти";

                        file_put_contents("tester_mail_cjk.txt", "\n after btn_name + message", FILE_APPEND);
                        $path = DURL . "client.php?q=" . $qz["qkey"] . "&r=" . $new_resp["ukey"];
                        $link_string = get_link_button_html($btn_name, $path); //"<a href='". $path ."'><b>ПЕРЕЙТИ</b></a>";
                        $link = "\n опрос <b>$focus_name</b> " . $link_string;
                        file_put_contents("tester_mail_cjk.txt", "\n after link string", FILE_APPEND);

                        //$message = str_replace("%LINK%", $link, $message);
                        $message = str_replace("##$btn_name##", $link, $message);
                        file_put_contents("tester_mail_cjk.txt", "\n message recode 1", FILE_APPEND);
                        $message = str_replace("##", "", $message);// cleanup
                        file_put_contents("tester_mail_cjk.txt", "\n message recode 2", FILE_APPEND);
                        $message = str_replace("%ФИО%", $focus_name, $message);
                        file_put_contents("tester_mail_cjk.txt", "\n message recode 3", FILE_APPEND);
                        $message = str_replace("\n", "<br>", $message);
                        //$message = str_replace("%ORG%", $_SESSION["pers"]["comp"], $message);
                        file_put_contents("tester_mail_cjk.txt", "\n after message recode ", FILE_APPEND);
                        $subject = "Приглашение на тестирование";
                        if (isset($sts->letter_head))
                            $subject = $sts->letter_head;
                        file_put_contents("tester_mail_cjk.txt", "\n subject: $subject", FILE_APPEND);
                        file_put_contents("tester_mail_cjk.txt", "\n message: $message", FILE_APPEND);
                        sendMail($subject, $message, $mail);
                    }


                    $ans = array();
                    $ans["group"] = $group;
                    unset($qz);
                    unset($group);
                    if ($reconn)
                        $this->DB_close($q);
                    $ans = json_encode($ans);
                    file_put_contents("tester_mail_cjk.txt", "\n ans: $ans", FILE_APPEND);
                    return $ans; // give back updated data on resps and quizes
                }
                elseif ($resp_is_duplicated)
                    return ("resp_already_exists");
                else
                {
                    $new_resp["cat_id"] = $d->cat_id;
                    $new_resp["feedback"] = array();
                    $new_resp["ans_list"] = array();
                    $new_resp["ignore"] = false;
                    $new_resp["last_message_id"] = null;
                    $new_resp["last_message_status"] = null;
                    $new_resp["last_remainder_date"] = time();
                    $new_resp["last_upd"] = null;
                    $new_resp["remainders_sent"] = 0;

                    // Get new unique key for our new resp
                    $keys_list = array();
                    foreach ($qz["resps"] as $group)
                        foreach ($group as $resp_slot)
                            array_push($keys_list, $resp_slot->ukey);
                    // Get unique (among whole quiz) key for the resp
                    do {
                        $sample = $this->doKey(5,"pers");
                    } while (in_array($sample, $keys_list));
                    $new_resp["ukey"] = $sample;

                    // Add new resp to session

                    $group = &$qz["resps"][$d->gr_ord];
                    $sts = $qz["settings"];

                    // Send invite to a newbie
                    if (!IS_LOCAL)
                    {
                        $focus_name = "";
                        $focus_id = $group[0]->id;
                        foreach ($_SESSION["resps"] as $db_resp)
                            if ($db_resp['id'] === $focus_id)
                            {
                                $focus_name = $db_resp["fio"]; // get a focus-person fio in each group
                                break;
                            }

                        // Send mail
                        $message = "*error finding a message text*";
                        if (isset($sts->letter))
                            $message = $sts->letter;
                        elseif (isset($sts["letter"]))
                            $message = $sts["letter"];
                        $btn_name = explode("##", $message);
                        $btn_name = $btn_name[1];
                        if (!$btn_name)
                            $btn_name = "Перейти";
                        $path = DURL . "client.php?q=" . $qz["qkey"] . "&r=" . $new_resp["ukey"];
                        $link_string = get_link_button_html($btn_name, $path); //"<a href='". $path ."'><b>ПЕРЕЙТИ</b></a>";
                        $link = "\n опрос <b>$focus_name</b> " . $link_string;


                        //$message = str_replace("%LINK%", $link, $message);
                        $message = str_replace("##$btn_name##", $link, $message);
                        $message = str_replace("##", "", $message);// cleanup
                        $message = str_replace("%ФИО%", $focus_name, $message);
                        $message = str_replace("\n", "<br>", $message);
                        $message = str_replace("%ORG%", $_SESSION["pers"]["comp"], $message);
                        $subject = $sts->letter_head;
                        if (!$subject && isset($sts["letter_head"]))
                            $subject = $sts["letter_head"];
                        elseif (!$subject)
                            $subject = "Приглашение на тестирование";
                        if (!file_exists("resp_add_log.txt"))
                            file_put_contents("resp_add_log.txt", json_encode(array($subject, $message, $d->mail, $qz["settings"]->letter, $d), JSON_UNESCAPED_UNICODE));
                        else
                            file_put_contents("resp_add_log.txt", "\n\n\n" . json_encode(array($subject, $message, $d->mail, $qz["settings"]->letter, $d), JSON_UNESCAPED_UNICODE), FILE_APPEND);


                        $new_resp["last_message_id"] = sendMail($subject, $message, $d->mail);
                    }

                    // Install new resp into group with all the fresh data gathered
                    array_push($group, $new_resp);
                    $updated_resps = true_json_code($qz["resps"]);
                    $this->send_query("UPDATE quiz SET resps = '$updated_resps' WHERE id = ". $d->qz_id);

                    $ans = array();
                    if ($new_resp_found)
                        $ans["resps"] = $this->resp("list", $owner_id, false);

                    $ans["group"] = $group;
                    unset($qz);
                    unset($group);
                    if ($reconn)
                        $this->DB_close($q);
                    return json_encode($ans); // give back updated data on resps and quizes
                }
                //file_put_contents("tester_mail_cjk.txt", "\n should not be here:", FILE_APPEND);
            }
        }

        elseif ($action === "answers_console_hack")
        {
            $d = json_decode($mode);
            $ans = array();
            $res = $this->send_query("SELECT settings FROM quiz WHERE id = '". $d->qz_id ."'");
            if ($res)
            {
                $z = $res->fetchAll(PDO::FETCH_ASSOC);
                if (1 === count($z))
                {
                    $sett = true_json_code($z[0]["settings"], "decode");
                    $sett["answer_opts_list"] = $d->new_ans_list;
                    $sett = true_json_code($sett);
                    $this->send_query("UPDATE quiz SET settings = '$sett' WHERE id = '". $d->qz_id ."'");
                    $ans["done"] = "y";
                }
                else
                    $ans["error"] = "Не уникальный ID опроса";
            }
            else
                $ans["error"] = "Не найден опрос с таким ID";

            if ($reconn)
                $this->DB_close($q);

            return json_encode($ans);
        }


    }
//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
/*
    function recruiter($action,$mode=true){

        if ($action === "list")
        {
            if ($mode) $this->DB_conn();
            unset($_SESSION["crew"]);
            $data = array();
            $q = $this->send_query("SELECT id, login, name, spec, comp, cd, ud, mail, last_log, added_by, access, region, phone, valid, tags FROM pers WHERE NOT id = -1");
            if ($q)
                while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                {
                    $bro = digitize($bro, array("id","last_log","added_by","cd","ud","access","valid"));
                    $bro["tags"] = json_decode($bro["tags"], true);
                    array_push($data, $bro);
                }
            $_SESSION["crew"] = $data;
            if ($mode)
                $this->DB_close($q);
            return true;
        }
        elseif ($action === "delete")
        {
            $this->DB_conn();
            $recr_id = $this->Purify($_POST['id'],"int");

            if ($recr_id !== -1) {
                // Удалить самого рекрутреа
                $this->send_query("DELETE FROM recr WHERE id = '$recr_id'");
                // Анлочить все ресурсы заблоченые этим рекрутером
                // Получить список проектов
                $data = array();
                $q = $this->send_query("SELECT id FROM quiz WHERE madeby = '$recr_id' AND NOT madeby = -1");
                if ($q)
                    while ($bro = $q->fetch(PDO::FETCH_ASSOC))
                        array_push($data,$bro["id"]);

                // Зачистить по всем проектам блокировку и сами проекты
                if (count($data))
                    foreach ($data as $prjdata) {
                        $prj_iid = array_search($prjdata,$_SESSION["qzs"]["id"]);
                        if ($prj_iid !== false)
                            $this->quiz("delete",$prj_iid,false);
                    }

                // А теперь удалить все его наработки
                // 1) Опросники
                $this->send_query("DELETE FROM qbook WHERE madeby = '$recr_id'");
                // 2) Компетенции
                $this->send_query("DELETE FROM comp WHERE madeby = '$recr_id'");
                // 3) Вопросы
                $this->send_query("DELETE FROM qsts WHERE madeby = '$recr_id'");
                // 4) Рассылки
                $this->send_query("DELETE FROM deli WHERE madeby = '$recr_id'");
                // 5) Респондентов
                $this->send_query("DELETE FROM resp WHERE madeby = '$recr_id'");
                // Освежить данные после зачистки
                $this->recruiter("list",false);
            }
            $this->DB_close($q); //
            return true;
        }
    }
*/
//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
    function send_query ($query)
    {
        $ans = null;
        try
        {
            if (!$this->_db)
                $this->DB_conn();
            $ans = $this->_db->query($query);
        }
        catch (PDOException $e)
        {
            log_add( "ON $query GIVEN ". $e->getMessage());
        }
        return $ans;
    }
//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
    function set_select_cond($owner_id, $tag = false, $alter_pid = false){
        $ret = "";
        if (isset($_SESSION["meta"]) && ($_SESSION["meta"]["role"] === "admin"))
            $ret = "";
        else
        {
            if (!in_array($tag, array("quiz","deli")))
                $ret = "WHERE madeby = -1 OR madeby = '$owner_id'";
            else
                $ret = "WHERE madeby = '$owner_id'";

            if ($alter_pid)
                $ret .= " OR madeby = '$alter_pid'";
        }

        return $ret;
    }

//>>>>--------->>>>--------->>>>---------->>>>---------->>>>----------->>>>------------>>>>------------>>>>------->>>>--
    function get_pers_data($mode=false){
        $this->question("list"); // +
        $this->competention("list"); // +
        $this->qbook("list"); // +
        $this->watchers("list", $_SESSION['pers']['id']); // +
        $this->quiz("list"); // +
        $this->answer_set("list");
        //$this->recruiter("list");
        $this->resp("list", $_SESSION['pers']['id']);
        if ($mode === "pack")
        {
            $d = array();
            $d["comps"] = $_SESSION["comps"];
            $d["qsts"] = $_SESSION["qsts"];
            $d["qbooks"] = $_SESSION["qbooks"];
            $d["ansSchemes"] = $_SESSION["ansSchemes"];
            //$d["delis"] = $_SESSION["delis"];
            $d["watchers"] = $_SESSION["watchers"];
            $d["resps"] = $_SESSION["resps"];
            $d["qzs"] = $_SESSION["qzs"];
            $d["pers"] = $_SESSION["pers"];
            return json_encode($d, JSON_UNESCAPED_UNICODE);
        }
        else
            return "get_pers_data empty return";
    }
}
?>
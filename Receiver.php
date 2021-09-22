<?php
include_once "DBase.class.php";
include_once "pChart/class/pData.class.php";
include_once "pChart/class/pDraw.class.php";
include_once "pChart/class/pRadar.class.php";
include_once "pChart/class/pImage.class.php";

$entry = 0;
if (!isset($_SESSION))
    session_start();

//----------------------------------------------------------------------------------------------------------------------
function unset_sses()
{

}
//----------------------------------------------------------------------------------------------------------------------
// ------------------------ POST -------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
if (isset($_SERVER["REQUEST_METHOD"]))
{
    //file_put_contents("errors.txt", "\n Inside server", FILE_APPEND);
    if ($_SERVER["REQUEST_METHOD"] === "POST")
    {
        if (isset($_POST['ajax']))
            switch ($_POST['ajax'])
            {
                case "auth":
                {
                    // user was logged in + login cookie is not expired yet (2 hrs)
                    if ($_POST['data'] == false && isset($_COOKIE["is_logged"]))
                    {
                        if (isset($_SESSION["pers"]))
                        {
                            // We was logged in as sub-user and this is our cookie
                            if ($_SESSION["pers"]["access"]*1 < 5)
                            {
                                setcookie("is_logged",false,-1);
                                unset($_SESSION["pers"]);
                                echo null;
                            }
                            // We was logged in as sup-admin and this is our cookie
                            else
                            {
                                $cDB = new DBase();
                                $cDB->pers("refresh", null);
                                $cDB->pers("letter_templates_save", "update"); // this will refresh the letter templates into the session's "pers" array
                                // send all the users data back
                                echo json_encode($_SESSION["pers"], JSON_UNESCAPED_UNICODE);
                            }

                        }
                        else
                        {
                            setcookie("is_logged",false,-1);
                            echo null;
                        }
                    }
                    // an actuall auth attempt with login + pass
                    elseif ($_POST['data'] != false)
                    {
                        //file_put_contents("errors.txt", "\n Receiver post -> ", FILE_APPEND);
                        $cDB = new DBase();
                        $cDB->pers("login", $_POST['data']);
                    }
                    else
                        echo null;
                    break;
                }

                case "register":
                    {
                        $do_reg = false;
                        // user was logged in + login cookie is not expired yet (2 hrs)
                        if (isset($_COOKIE["is_logged"]))
                        {
                            // Already logged in - fukk you
                            if (!isset($_SESSION["pers"]))
                            {
                                setcookie("is_logged",false,-1);
                                //unset($_SESSION);
                                $do_reg = true;
                            }
                        }
                        else
                            $do_reg = true;

                        if ($do_reg)
                        {
                            $cDB = new DBase();
                            echo $cDB->pers("new", $_POST["data"]);
                        }
                        else
                            echo "nope";

                        break;
                    }

                case "get_pers_data":
                    {
                        $cDB = new DBase();
                        echo $cDB->get_pers_data("pack");
                        break;
                    }

                // chk for login cookie expiration (when we send Nuul as response, js will redirect user to auth page)
                case "unlog_chk":
                {
                    if (isset($_COOKIE["is_logged"]))
                        echo true;
                    else
                    {
                        setcookie("is_logged",false,-1);
                        //unset($_SESSION);
                        echo null;
                    }
                    break;
                }

                // chk for login cookie expiration (when we send Nuul as response, js will redirect user to auth page)
                case "g_cpanel_quit":
                {
                    setcookie("is_logged",false,-1);
                    //unset($_SESSION);
                    echo true;
                    break;
                }

                case "temp_data":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("temp_data", $_POST['data']);
                        break;
                    }

                case "presets_temp_data":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("presets_temp_data", $_POST['data']);
                        break;
                    }

                // -------------------- QSTS ---------------------------------
                case "qst_add":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->question("add", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }

                case "qst_edit":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->question("update", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }

                case "qst_del":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->question("delete", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }

                case "comp_edit":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->competention("rename", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }


                case "import_qsts":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->question("import", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }

                // -------------------- QBOOKS ---------------------------------
                case "dirs_save":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->pers("dirs", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }

                case "qbook_dirs_update":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->qbook("qbook_dirs_update", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }


                case "qbook_save_as":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->qbook("new", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }


                case "qbook_del":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            file_put_contents("qb_del_chk.txt", "pers is set ");
                            $cDB = new DBase();
                            echo $cDB->qbook("delete", $_POST["data"]);
                        }
                        else
                            echo false;
                        break;
                    }

                case "qbook_swap_index":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->qbook("swap_index", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }

                case "qbook_save":
                case "qbook_resave":
                case "qbook_redir":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->qbook("save", $_POST["data"]);
                            // send all the users data back
                        }
                        else
                            echo false;
                        break;
                    }

                // -------------------- DELI ---------------------------------
                case "import_resps":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->resp("import", $_POST["data"]);
                        }
                        else
                            echo false;
                        break;
                    }

                // -------------------- OPTIONS ---------------------------------
                case "watcher_add":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->watchers("new", $_POST["data"]);
                        }
                        else
                            echo false;
                        break;
                    }

                case "watcher_del":
                    {
                        // logged and have the rank to receive the crew list
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->watchers("del", $_POST["data"]);
                        }
                        else
                            echo false;
                        break;
                    }

                case "letter_templates_save":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("letter_templates_save", $_POST["data"]);
                        break;
                    }

                case "personify_mail":
                    {
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->pers("personify_mail", $_POST["data"]);
                        }
                        break;
                    }

                case "save_as_template":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("save_as_template", $_POST["data"]);
                        break;
                    }

                case "save_an_folder":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("save_an_folder", $_POST["data"]);
                        break;
                    }

                case "oqt_save":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("oqt_save", $_POST["data"]);
                        break;
                    }

                // -------------------- QZS ---------------------------------
                case "qz_create":
                    {
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->quiz("new", $_POST["data"]);
                        }
                        else
                            echo false;
                        break;
                    }

                case "qz_exclusion_update":
                    {
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->quiz("exclusion_update", $_POST["data"]);
                        }
                        else
                            echo false;
                        break;
                    }

                case "qz_status_force":
                    {
                        $cDB = new DBase();
                        echo $cDB->quiz("status_update", $_POST["data"]);
                        break;
                    }

                case "qz_del":
                    {
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->quiz("del", $_POST["data"]);
                        }
                        else
                            echo false;
                        break;
                    }

                case "qz_rename":
                    {
                        if (isset($_SESSION["pers"]))
                        {
                            $cDB = new DBase();
                            echo $cDB->quiz("rename", $_POST["data"]);
                        }
                        else
                            echo false;
                        break;
                    }

                case "qz_restore":
                    {
                        $cDB = new DBase();
                        echo $cDB->quiz("restore", $_POST["data"]);
                        break;
                    }

                case "qz_mute":
                    {
                        $cDB = new DBase();
                        echo $cDB->quiz("qz_mute", $_POST["data"]);
                        break;
                    }



                case "group_resp_add":
                    {
                        $cDB = new DBase();
                        echo $cDB->quiz("group_resp_add", $_POST["data"]);
                        file_put_contents("tester_mail_cjk.txt", "\n receiver group_resp_add:", FILE_APPEND);
                        break;
                    }


                // -------------------- PERSONELL ---------------------------------
                case "get_crew":
                {
                    // logged and have the rank to receive the crew list
                    if (isset($_SESSION["pers"]) && $_SESSION["pers"]["access"]*1 === 10)
                    {
                        $cDB = new DBase();
                        echo json_encode($cDB->pers("crew_list", null));
                        // send all the users data back
                    }
                    break;
                }

                case "pers_update":
                {
                    $cDB = new DBase();
                    $cDB->pers("update", $_POST['data']);
                    break;
                }

                case "pers_new":
                {
                    $cDB = new DBase();
                    $cDB->pers("new", $_POST['data']);
                    break;
                }

                case "pers_edit":
                {
                    $cDB = new DBase();
                    $cDB->pers("update", $_POST['data']);
                    break;
                }

                case "pers_del":
                {
                    $cDB = new DBase();
                    $cDB->pers("del", $_POST['data']);
                    break;
                }

                case "recover_pass":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("recover_pass", $_POST['data']);
                        break;
                    }

                case "pass_recover_confirm":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("recover_pass_confirm", $_POST['data']);
                        break;
                    }

                case "pers_chk_mail":
                {
                    $cDB = new DBase();
                    $cDB->pers("chk_mail", $_POST['data']);
                    break;
                }

                case "on_report":
                    {
                        $file = "user_reports.txt";
                        if (!file_exists($file))
                            file_put_contents($file, json_encode(array()));

                        $data = json_decode(file_get_contents($file), true);
                        array_push($data, $_POST["data"]);
                        file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE));
                        echo true;
                        break;
                    }

                // -------------------- RESPONDENTS ---------------------------------
                case "resp_list":
                {
                    $cDB = new DBase();
                    echo json_encode($cDB->resp("list", $_POST['data']));
                    // send all the users data back
                    break;
                }

                case "resp_new":
                {
                    $cDB = new DBase();
                    echo $cDB->resp("new", $_POST['data']);
                    break;
                }

                case "resp_edit":
                {
                    $cDB = new DBase();
                    $cDB->resp("update", $_POST['data']);
                    break;
                }

                case "resp_del":
                {
                    $cDB = new DBase();
                    echo $cDB->resp("del", $_POST['data']);
                    break;
                }

                case "resp_import":
                {
                    $cDB = new DBase();
                    echo $cDB->resp("import", $_POST['data']);
                    break;
                }

                case "resp_send_remainder":
                    {
                        $cDB = new DBase();
                        echo $cDB->resp("send_remainder", $_POST['data']);
                        break;
                    }

                case "resp_send_reminder":
                    {
                        $cDB = new DBase();
                        //echo $cDB->resp("remind", $_POST["data"]);
                        echo $cDB->resp("send_remainder", $_POST["data"]);

                        // send all the users data back
                        break;
                    }


                // --------- CLIENT_SIDE QZ ------------------
                case "get_client_data":
                {
                    $cDB = new DBase();
                    file_put_contents("0_gcd_chk.txt", $_POST['data']);
                    echo $cDB->resp("get_client_data", $_POST['data']);
                    break;
                }

                case "record_answer":
                    {
                        $file = "resp_rec_chk.txt";
                        file_put_contents($file, "\n\n record_answer receiver: ". $_POST['data'], FILE_APPEND);
                        $cDB = new DBase();
                        echo $cDB->resp("record_answer", $_POST['data']);
                        break;
                    }

                case "user_feedback":
                    {
                        $cDB = new DBase();
                        echo $cDB->resp("user_feedback", $_POST['data']);
                        break;
                    }

                // -------------------- RESULTS ---------------------------------
                case "save_answer":
                {
                    $cDB = new DBase();
                    echo $cDB->results("save_answer", $_POST['data']);
                    break;
                }

                case "get_results_list":
                {
                    $cDB = new DBase();
                    echo json_encode($cDB->results("list", null));
                    // send all the users data back
                    break;
                }

                case "to_excell":
                {
                    $cDB = new DBase();
                    echo $cDB->results("to_excell", $_POST["data"], false);
                    // send all the users data back
                    break;
                }

                case "single_report_datastore":
                    {
                        $cDB = new DBase();
                        $key = $cDB->doKey(30, null);
                        file_put_contents(REPORT_TEMPDATA_FILENAME . "_" . $key . ".txt", $_POST["data"]); // save temp data from front to temp storage and return a key to it
                        echo $key;
                        // send all the users data back
                        break;
                    }

                case "comment_report_datastore":
                    {
                        $cDB = new DBase();
                        $key = $cDB->doKey(30, null);
                        file_put_contents(REPORT_TEMPDATA_FILENAME . "_" . $key . ".txt", $_POST["data"]); // save temp data from front to temp storage and return a key to it
                        echo $key;
                        // send all the users data back
                        break;
                    }

                case "base64_image_save":
                    {
                        $cDB = new DBase();
                        echo $cDB->results("base64_image_save", $_POST["data"]);
                        // send all the users data back
                        break;
                    }

                case "batch_load":
                    {
                        $cDB = new DBase();
                        echo $cDB->results("batch_load", $_POST["data"]);
                        // send all the users data back
                        break;
                    }
                // -------------------- REPORTS ---------------------------------

                case "pers_confirm":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("confirm", $_POST['data']);
                        break;
                    }

                case "set_tag":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("set_tag", $_POST['data']);
                        break;
                    }

                case "send_feedback":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("send_feedback", $_POST['data']);
                        break;
                    }

                case "gang_change":
                    {
                        $cDB = new DBase();
                        echo $cDB->pers("gang_change", $_POST['data']);
                        break;
                    }
            }
    }
    else
    {
        if (isset($_GET['ajax']))
        {
            switch ($_GET['ajax'])
            {
                case "load_year_report":
                    {
                        $data = json_decode($_GET['data'], true);
                        report_EXIT($data, "show");
                        //echo "done";
                        break;
                    }

                case "load_report":
                    {
                        $data = array(
                            "total" => 20,
                            "trial" => 5,
                            "coef" => 17,
                            "done" => 8,
                            "graph" => array(0,1,2,3,4,5,6,7,8,9,10,11),
                            "stats" => array()
                        );

                        // 1st
                        $k = array();
                        $num = 7;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 7;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 28;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 3;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 4;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 9;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 10;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 5;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 4;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 5;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        $k = array();
                        $num = 5;
                        for ($i=0; $i<$num; $i++)
                            array_push($k, round(rand(0, 100)));
                        array_push($data["stats"], $k);

                        report_EXIT($data, "show");
                        break;
                    }

            }
        }


    }
}
else
{
    /*
    $entry++;
    if (isset($_POST["ajax"]))
        $ajax = $_POST["ajax"];
    else
        $ajax = "void";

    file_put_contents("errors.txt", "\n No server var -> $entry " . $ajax, FILE_APPEND);
    */
}

/* code for mail send via file open
    $content = "";
    $fp=fopen("http://www.bloodsabbath.ho.ua/360invitator.php?mail=".$mail.
        "&pkey=".$prj_key.
        "&ukey=".$user_key.
        "&name=".$name.
        "&org=".$_SESSION["udata"][8].
        "&hostmail=".$_SESSION["udata"][3],"r");
    while(!feof($fp))
    {
     $content .= fread($fp,1024);
    }
    fclose($fp);
*/
?>
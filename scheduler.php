<?php
// should be executed ever 30-60 min
header('Access-Control-Allow-Origin: *');
header('Content-type: text/html; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

include_once "DBase.class.php";
$cdb = new DBase();

$crew = $cdb->pers("full_list", false);
$mess_sub = "<br><br><i>Это сообщение создано автоматически, на него не нужно отвечать.</i>.";
$scheduler_log_file = "https://hr-up.online/Plarium360/scheduler_log.txt";
$scheduler_data = array();
$send_enabled = true;
if (!file_exists($scheduler_log_file))
    file_put_contents($scheduler_log_file, json_encode(array()));
else
{
    $scheduler_data = file_get_contents($scheduler_log_file);
    $scheduler_data = json_decode($scheduler_data);
}

array_push($scheduler_data, array(
    "type" => "INTRO",
    "subject" => "Start of the scheduler",
    "log exists" => file_exists($scheduler_log_file),
    "message" => "time is " . date ("Y-m-d H:i:s", time()),
    "admin_mail" => ""
));

$current_session = null;
if (isset($_SESSION))
    $current_session = $_SESSION;


// print_r($_SESSION["crew"]);

if (is_array($crew))
    foreach ($crew as $pers)
    {
        $_SESSION["pers"] = $pers;
        $admin_mail = $pers["mail"];
        $cdb->quiz("list");
        $cdb->question("list");
        $cdb->qbook("list");
        $cdb->resp("list", $_SESSION['pers']['id']);
        //$cdb->get_pers_data(); // create all data sets in the session
        echo ("\n\n" . $pers["name"] . ", qz qnt: " . count($_SESSION["qzs"]));

        $s = &$_SESSION;
        $date_of_now = time();
        foreach ($s["qzs"] as $qz_ord => &$qz) // EACH QZ
            if ($qz["madeby"]*1 === $pers["id"]*1) // && $qz["id"] === 156 #test Grinfin quiz only
            {
                $made_changes = false;
                $sts = json_decode(json_encode($qz["settings"]), true);
                $resps = json_decode(json_encode($qz["resps"]), true);
                $notice_list = &$sts["notice_list"];
                $reminders_period = SEC_PER_DAY * $sts["notice_period_id"]; // THIS sould be the interval of messages sent
                //$reminders_period = 60 * 5; // #test value for each 5 min

                // 1 - REPORT ON EXPIRED DATE
                if ($notice_list[0]*1 === 1)
                {
                    if ($date_of_now >= $sts["end_date"])
                    {
                        $notice_list[0] = $date_of_now; // set value to cur date to indicate we already done this
                        $made_changes = true;
                        $message = "Добрый день.<br>";
                        $message .= "Дата прохождения опроса ". $qz["name"] ." в вашей учетной записи истекла.";
                        $message .= $mess_sub;
                        $subject = "Система 360, дата прохождения опроса вышла";
                        if (!IS_LOCAL && $send_enabled)
                            sendMail($subject, $message, $admin_mail);
                        array_push($scheduler_data, array(
                            "type" => "REPORT ON QUIZ EXPIRED DATE",
                            "subject" => $subject,
                            "message" => $message,
                            "admin_mail" => $admin_mail
                        ));
                    }
                }

                // 2 - REPORT ON QZ COMPLETE
                if ($notice_list[1]*1 === 1)
                {
                    if ($qz["status"]*1 === 1)
                    {
                        $notice_list[1] = $date_of_now; // set value to cur date to indicate we already done this
                        $made_changes = true;
                        $message = "Добрый день.<br>";
                        $message .= "Опрос ". $qz["name"] ." пройден всеми респондентам.";
                        $message .= $mess_sub;
                        $subject = "Система 360, опроса завершен";
                        if (!IS_LOCAL && $send_enabled)
                            sendMail($subject, $message, $admin_mail);
                        array_push($scheduler_data, array(
                            "type" => "REPORT ON QZ COMPLETE",
                            "subject" => $subject,
                            "message" => $message,
                            "admin_mail" => $admin_mail
                        ));
                    }
                }

                // 3 - REPORT ON QZ COMPLETION %
                if (is_array($notice_list[2]) || $notice_list[2]*1 === 1)
                {
                    if (!is_array($notice_list[2]))
                    {
                        $notice_list[2] = array();
                        foreach ($resps as $group)
                            array_push($notice_list[2], 0);
                    }

                    $pct_target = $sts["notice_pct"] / 100;
                    $pct_filled = 0;
                    $slot = array(
                        "settings" => $sts,
                        "resps" => $resps
                        //"qz_ord" => $qz_ord
                    );

                    foreach ($resps as $gr_ord => $group) // get avg pct of completion across all groups
                        if (!$notice_list[2][$gr_ord])
                        {
                            $slot["gr_ord"] = $gr_ord;
                            $pct_filled = 0; //resp_pct_done($slot);
                            $resp_qnt = 0;
                            foreach ($group as $r_ord => $resp)
                                if (!$resp["ignore"])
                                {
                                    $slot["resp_ord"] = $r_ord;
                                    $pct_filled += resp_pct_done($slot);
                                    $resp_qnt++;
                                }
                            if ($resp_qnt)
                                $pct_filled /= $resp_qnt;

                            echo ("\n group $gr_ord completion %: $pct_filled, resp qnt: $resp_qnt, target: $pct_target");

                            if ($pct_filled >= $pct_target)
                            {
                                $notice_list[2][$gr_ord] = $date_of_now; // set value to cur date to indicate we already done this
                                $made_changes = true;
                                $focus = $group[0]["id"] * 1 ;
                                foreach ($_SESSION["resps"] as $resp)
                                    if ($resp["id"]*1 === $focus)
                                    {
                                        $focus = $resp["fio"];
                                        break;
                                    }

                                $message = "Добрый день.<br>";
                                $message .= "В опросе ". $qz["name"] ." фокус-группа ". $focus ." заполнена на ". floor($pct_target * 100) ."%.";
                                $message .= $mess_sub;
                                $subject = "Система 360, группа $focus завершена на ". floor($pct_target * 100) ."%.";
                                if (!IS_LOCAL && $send_enabled)
                                    sendMail($subject, $message, $admin_mail);
                                array_push($scheduler_data, array(
                                    "type" => "REPORT ON GROUP % COMPLETION, GROUP #$gr_ord",
                                    "subject" => $subject,
                                    "message" => $message,
                                    "admin_mail" => $admin_mail
                                ));
                            }
                        }
                }

                // 4 - DAILY ON COMPLETION
                if ($notice_list[3]*1 !== 0 && $qz["status"]*1 === 0 && $sts["end_date"]*1 < $date_of_now)
                {
                    // First time or a [day period set] have passed since
                    if ($notice_list[3]*1 === 1 || $notice_list[3]*1 + $reminders_period <= $date_of_now)
                    {
                        $notice_list[3] = $date_of_now;
                        $made_changes = true;
                        $slot = array(
                            "settings" => $sts,
                            "resps" => $resps
                        );

                        $subject = "Система 360, ежедневный отчет по опросу ". $qz["name"];
                        $message = "Добрый день.<br>";

                        foreach ($resps as $gr_ord => $group) // get avg pct of completion across all groups
                        {
                            $slot["gr_ord"] = $gr_ord;
                            $resps_qnt = 0;
                            foreach ($group as $resp_ord => $resp)
                                if (!$resp["ignore"]) // resp is not excluded from quiz completion
                                {
                                    $slot["resp_ord"] = $resp_ord;
                                    $pct_filled += resp_pct_done($slot);
                                    $resps_qnt++;
                                }

                            if ($resps_qnt)
                                $pct_filled /= $resps_qnt; // get the completion % of the group


                            $focus = $group[0]["id"] * 1 ;
                            foreach ($_SESSION["resps"] as $resp) // get the name of focus-person
                                if ($resp["id"]*1 === $focus)
                                {
                                    $focus = $resp["fio"];
                                    break;
                                }

                            $message .= "В опросе ". $qz["name"] ." фокус-группа ". $focus ." заполнена на ". floor($pct_filled * 100) ."%.";
                        }

                        $message .= $mess_sub;
                        if (!IS_LOCAL && $send_enabled)
                            sendMail($subject, $message, $admin_mail);
                        array_push($scheduler_data, array(
                            "type" => "DAYLY REPORT ON GROUP % COMPLETION",
                            "subject" => $subject,
                            "message" => $message,
                            "admin_mail" => $admin_mail
                        ));
                    }
                }

                // 6 - DAYLY REMINDERS FOR EVERY UNFINISHED RESP
                if ($notice_list[5]*1 === 1 && !$qz["status"]*1)
                {
                    $pct_filled = 0;
                    $slot = array(
                        "settings" => $sts,
                        "resps" => $resps
                        //"qz_ord" => $qz_ord
                    );

                    foreach ($resps as $gr_ord => &$group) // get avg pct of completion across all groups
                        {
                            $slot["gr_ord"] = $gr_ord;
                            foreach ($group as $resp_ord => &$resp)
                                if (!$resp["ignore"]) // resp is not excluded from quiz completion
                                {
                                    $slot["resp_ord"] = $resp_ord;
                                    $pct_filled = resp_pct_done($slot);
                                    $fb_done = resp_fb_done($slot);;
                                    if (($pct_filled < 1 || !$fb_done) && // answers or mandatory comments are not given
                                        ($date_of_now - $resp["last_remainder_date"]) >= $reminders_period) // resp has not yet completed this quiz
                                    {
                                        $resp["last_remainder_date"] = $date_of_now; // rewrite last auto-reminder sent date
                                        $made_changes = true;

                                        // Get focus-person fio
                                        $focus = $group[0]["id"] * 1 ;
                                        foreach ($_SESSION["resps"] as $r)
                                            if ($r["id"]*1 === $focus)
                                            {
                                                $focus = $r["fio"];
                                                break;
                                            }


                                        // we need [focus_fio, link, mail, ]
                                        $reminder_request = array(
                                            "focus_fio" => $focus,
                                            "link" => DURL . "client.php?q=" . $qz["qkey"] . "&r=". $resp["ukey"],
                                            "mail" => ""
                                        );

                                        // Get resp's mail
                                        foreach ($_SESSION["resps"] as $r)
                                            if ($r["id"] === $resp["id"])
                                            {
                                                $reminder_request["mail"] = $r["mail"];
                                                break;
                                            }

                                        if ($reminder_request["mail"])
                                        {
                                            $cdb->resp("send_remainder", json_encode($reminder_request));
                                            array_push($scheduler_data, array(
                                                "type" => "QUIZ: ". $qz["name"] .", GROUP: ". $focus .", RESP #$resp_ord auto-reminder sent",
                                                "subject" => "Авто-напоминание респондентам",
                                                "message" => "Опрос: ". $qz["name"] .", группа: ". $focus .", респондент #$resp_ord авто-напоминание отправлено, ссылка: " . $reminder_request["link"],
                                                "admin_mail" => $admin_mail
                                            ));
                                        }

                                    }
                                }
                        }
                }

                if ($made_changes)
                {
                    $updated_sts = true_json_code($sts);
                    $updated_resps = true_json_code($resps);
                    try
                    {
                        $q = $cdb->send_query("UPDATE quiz SET settings = '". $updated_sts . "', resps = '". $updated_resps . "' WHERE id = ". $qz["id"] . " AND madeby = " . $_SESSION['pers']['id']);
                    }
                    catch (PDOException $e)
                    {
                        array_push($scheduler_data, array(
                            "subject" => "error on quiz's DB settings update",
                            "message" => $e->getMessage(),
                            "admin_mail" => null
                        ));
                        //log_add("scheduler cycle error: ". $e->getMessage());
                    }
                }

                unset($resps);
                unset($notice_list);
                unset($sts);
            }
    }
    
unset($s);
//unset($_SESSION); // clear session on finish
if (null !== $current_session)
    $_SESSION = $current_session;


if ($_GET["show_log"] === "pls")
    print_r($scheduler_data);

$scheduler_data = json_encode($scheduler_data, JSON_UNESCAPED_UNICODE);
file_put_contents($scheduler_log_file, $scheduler_data);


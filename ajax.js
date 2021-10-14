let $ajResponse = [];
// ---------------------------------------------------------------------------------------------------------------------
function sendAJ($tag,$data,$tags){
    // last index : 67
    let z;
    // ----------- Записать все данные вошедшего в массив -------------------------------------
    if ($tag === "auth")
    {
        z = 0;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                // already logged in — aquire Self (pers) and Crew data and go to landing page
                if ($ajResponse[z].responseText != false)
                {
                    //$user = JSON.parse($ajResponse[z].responseText);
                    $pers = JSON.parse($ajResponse[z].responseText);
                    //show_content("landing");
                    sendAJ("get_pers_data", $pers.id);
                    //show_content("analytics"); // show_content("landing");
                }
                // show auth page with inputs
                else
                {
                    $pers = undefined;
                    if ($data == null)
                    {
                        new_qz_tab_progress(0);
                        show_content("land_auth"); //show_content("landing");
                    }
                    else
                        message_ex("show", "info", "login_fail", null);
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "pers_confirm")
    {
        z = 19;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText === "done")
                        message_ex("show", "info", "validation", true);
                    else
                        message_ex("show", "info", "validation", false);
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "register")
    {
        z = 15;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    // already logged in — aquire Self (pers) and Crew data and go to landing page
                    if ($ajResponse[z].responseText !== false && $ajResponse[z].responseText !== "mail_duplicate")
                    {
                        //$pers = JSON.parse($ajResponse[z].responseText);
                        message_ex("show", "info", "fresh_register", null);
                    }
                    else
                    if ($ajResponse[z].responseText === "mail_duplicate")
                    {
                        message_ex("show", "info", "direct", "Вы уже зарегистрированы с использованием этой почты,<br>" +
                            "восстановите пароль, чтобы получить доступ к системе<br>" +
                            "или зарегистрируйтесь по другому адресу.");
                    }
                    // show auth page with inputs
                    else
                    {
                        message_ex("show", "info", "direct", "При регистрации возникла ошибка. Регистрация не была осуществлена.");
                    }
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "unlog_chk")
    {
        z = 1;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                // already logged in — aquire Self (pers) and Crew data and go to landing page
                if ($ajResponse[z].responseText == false)
                {
                    $data_gathered = 0;
                    // redicrect user to auth page
                    show_content("auth");
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "g_cpanel_quit")
    {
        z = 2;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                // successfull unlogin
                if ($ajResponse[z].responseText)
                {
                    //$data_gathered = 0;
                    // Go to auth screen
                    $pers = undefined;
                    new_qz_tab_progress(0);
                    show_content("land_auth");
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }

    //  -------------------------------            PERS REQUESTS    ----------------------------------------------------
    else
    if ($tag === "get_crew")
    {
        z = 3;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText != false)
                {
                    //console.log($ajResponse[z].responseText);
                    $crew = JSON.parse($ajResponse[z].responseText);
                }
                // show auth page with inputs
                else
                {
                    $crew = null;
                    //message_ex("show", "info", "aj_request", [$tag]);
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "pers_update")
    {
        z = 4;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText && $ajResponse[z].responseText !== "fail")
                {
                    // update client-side pers data
                    let $response = JSON.parse($ajResponse[z].responseText);
                    // Data belongs to authed user
                    if ($response.id*1 === $pers.id*1)
                    {
                        $pers = JSON.parse($ajResponse[z].responseText);
                        $(".g_cpanel .fio_box").html($pers.name);
                    }
                    else // Data belongs to crew user
                    {
                        $id = get_id($crew, $response.id);
                        $crew[$id] = JSON.parse($ajResponse[z].responseText);
                    }
                    // Update page
                    show_content($nav.screen);
                    message_ex("show", "info", "pers_update_ok", null);
                }
                else
                {
                    message_ex("show", "info", "pers_update_fail", [$tag, $ajResponse[z].responseText]);
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "pers_new")
    {
        z = 5;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText)
                {
                    // If this is the first pers — get ready array for it
                    if ($crew === null)
                        $crew = [];
                    // add new pers entry to the crew list
                    $crew.push(JSON.parse($ajResponse[z].responseText));
                    // Update page
                    show_content($nav.screen);
                }
                else
                {
                    message_ex("show", "info", "fail_create", "pers");
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "pers_edit")
    {
        z = 6;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText && $ajResponse[z].responseText !== "fail")
                {
                    // If this is the first pers — get ready array for it
                    if ($crew === null)
                        $crew = [];
                    // update pers entry // $nav.tab.id — is local order index of updatable pers in $crew array
                    $crew[$nav.tab.id] = (JSON.parse($ajResponse[z].responseText));
                    // Update page
                    show_content($nav.screen);
                }
                else
                {
                    message_ex("show", "info", "fail_edit", "pers");
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "pers_del")
    {
        z = 7;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText)
                {
                    // fully refresh crew list
                    $crew = JSON.parse($ajResponse[z].responseText);
                    // Update page
                    show_content($nav.screen);
                }
                else
                {
                    message_ex("show", "info", "fail_del", "pers");
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }

    //  -------------------------------            RESP REQUESTS    ----------------------------------------------------
    else
    if ($tag === "resp_list")
    {
        z = 8;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText !== false)
                {
                    //console.log($ajResponse[z].responseText);
                    $resp = JSON.parse($ajResponse[z].responseText);
                    if ($tags !== undefined && $tags.indexOf("refresh_resplist") !== -1)
                    {
                        show_content("ankete_data");
                        message_ex("show","info","direct","Все демо-записи были удалены.");
                    }
                    else
                    if ($pers.access === 10)
                        show_content("landing");
                    else
                        show_content("analytics");
                }
                // show auth page with inputs
                else
                {
                    $resp = null;
                    //message_ex("show", "info", "aj_request", [$tag]);
                }

            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "resp_new")
    {
        z = 9;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText)
                {
                    // If this is the first pers — get ready array for it
                    if ($resp === null)
                        $resp = [];
                    // add new pers entry to the crew list
                    $resp.push(JSON.parse($ajResponse[z].responseText));
                    // Update page
                    //show_content($nav.screen);
                }
                else
                {
                    message_ex("show", "info", "fail_create", "resp");
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "resp_edit")
    {
        z = 10;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText)
                {
                    // If this is the first pers — get ready array for it
                    if ($resp === null)
                        $resp = [];
                    // update pers entry // $nav.tab.id — is local order index of updatable pers in $crew array
                    $resp[$nav.tab.id] = (JSON.parse($ajResponse[z].responseText));
                    // Update page
                    show_content($nav.screen);
                }
                else
                {
                    message_ex("show", "info", "fail_edit", "resp");
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "resp_del")
    {
        z = 11;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText === "fail")
                {
                    message_ex("show", "info", "direct", "Респондент не был удален!");
                }
                else
                {
                    // fully refresh  resp_list and results
                    $resp = JSON.parse($ajResponse[z].responseText);
                    // Update page
                    show_content($nav.screen);
                    message_ex("show", "info", "direct", "Респондент успешно удален.");
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "resp_import")
    {
        z = 12;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText === "fail")
                {
                    message_ex("show", "info", "fail_import", "resp");
                }
                else
                {
                    // fully refresh
                    var $response = JSON.parse($ajResponse[z].responseText);
                    // Update departments list
                    $dep =  JSON.parse(JSON.stringify($response[0]));
                    // Update respondents list
                    $resp =  JSON.parse(JSON.stringify($response[1]));
                    // Update page
                    show_content($nav.screen);
                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    else
    if ($tag === "resp_send_remainder")
    {
        z = 41;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        message_ex("show", "info", "direct", "Напоминание успешно отправлено.");
                    }
                    else
                        message_ex("show", "info", "direct", "Ошибка, напоминание не было отправлено.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    //  -------------------------------            RESPONDENT QUIZ   ---------------------------------------------------
    if ($tag === "get_pers_data")
    {
        z = 13;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
        .done(function()
        {
            if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
            {
                if ($ajResponse[z].responseText)
                {
                    $ad = JSON.parse($ajResponse[z].responseText);
                    update_comps("build_map");
                    $session.get();
                    $session.presets_get();
                    //add_tabs_box();
                    if ($pers.access > 1)
                        show_content("landing");
                    else
                    {
                        show_content("analytics"); // rookie goes straight to analytics
                    }

                }
            }
        })
        // -------------------------------------------------------------------------------------
        .fail(function()
        {
            console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
            message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
        });
    }
    //  -------------------------------            RESULTS    ----------------------------------------------------------
    else
    if ($tag === "resp_send_reminder")
    {
        z = 17;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    // already logged in — aquire Self (pers) and Crew data and go to landing page
                    if ($ajResponse[z].responseText === "done")
                    {
                        console.log("reminder sent");
                        //window.open(PATH + "Answers_exporter.php");
                    }
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "to_excell")
    {
        z = 20;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText === "done")
                    {
                        console.log("data successfully exported");
                        window.open(PATH + "excell.php");
                    }
                    else
                        message_ex("show","info","direct","Ошибка выгрузки данных.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "single_report_datastore")
    {
        z = 40;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText) // return key of file with stored data for this report
                    {
                        $(".floater")
                            .css("display", "none")
                            .css("text-align", "left")
                            .css("font-size", "16px")
                            .html("");

                        if ($tags.tag === "open")
                            window.open(PATH + "report_single_download.php?pers_id="+$tags.pers_id + "&name=" + $tags.focus_name+ "&k=" + $ajResponse[z].responseText);
                        else
                        {
                            console.log("5) report data saved to server file - start generation");
                            let form = {
                                name: $tags.focus_name,
                                pers_id: $tags.pers_id,
                                key: $ajResponse[z].responseText,
                                action: "save"
                            };
                            console.log(form);
                            sendAJ("gen_single_report", form);
                        }
                    }
                    else
                        message_ex("show","info","direct","Ошибка создания отчета.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "gen_single_report")
    {
        z = 42;
        $ajResponse[z] = $.ajax(
            {
                url: "report_single_download.php",
                data: {"name":$data.name, "pers_id":$data.pers_id, "k":$data.key, "action":$data.action, "batch":true},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText === "report_batched") // return key of file with stored data for this report
                    {
                        console.log("6) report generated, resp # " + batch_reports.cur + " completed");
                        batch_reports.cur++;
                        $(".sys_mes[id="+$sys_mes_ind+"] .cont .updater").html("<br>Прогресс " +batch_reports.cur+ " из " + batch_reports.qnt);
                        if (batch_reports.cur === batch_reports.qnt)
                        {
                            console.log("z) saving batching reports completed, compressing");
                            batch_reports.cur = null;
                            sendAJ("batch_load", JSON.stringify({
                                action: "zip_new",
                                pers_id: $data.pers_id,
                                qz_name: $ad.qzs[$session.opened_qz_ord].name
                            }));
                        }
                        else
                        {
                            batch_reports.img_rdy = false;
                            console.log("x) restart cycle resp # " + batch_reports.cur + " go");
                            batch_reports_handle ("gen_focus_images",{qz_ord: $session.opened_qz_ord, focus_ord: batch_reports.cur});
                        }
                    }
                    else
                        message_ex("show","info","direct","Ошибка генерации отчета для скачивания архивом.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "batch_load")
    {
        z = 43;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText === "zip_deleted")
                        console.log("zipfile deleted");
                    else
                    {
                        message_ex("hide","handler");
                        if ($ajResponse[z].responseText && $ajResponse[z].responseText.indexOf("☼") === -1) // return key of file with stored data for this report
                        {

                            window.open(PATH + $ajResponse[z].responseText); // load zip file
                            // Wait for 5 sec and delete the zip file
                            setTimeout(function () {
                                sendAJ("batch_load", JSON.stringify({
                                    action: "zip_delete",
                                    pers_id: $pers.id,
                                    zip_name: $ajResponse[z].responseText
                                }));
                            }, 5000);

                        }
                        else
                            message_ex("show","info","direct","Ошибка скачивания архива отчетов.<br>" + $ajResponse[z].responseText);
                    }

                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "set_tag")
    {
        z = 22;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    console.log("tag "+JSON.parse($data).tag+" was set");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "qz_restore")
    {
        z = 57;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let arg = JSON.parse($data);
                        $ad.qzs[arg.qz_ord][arg.action] = JSON.parse($ajResponse[z].responseText);
                        show_content();
                    }
                    else
                        message_ex("show","info","direct", "Был получен пустой результат восстановления опроса. Возможно операция прошла успешно и требуется обновить страницу.")
                    //console.log("tag "+JSON.parse($data).tag+" was set");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "send_feedback")
    {
        z = 23;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                        message_ex("show","info","direct","Сообщение успешно отправлено.");
                    else
                        message_ex("show","info","direct","Произошла ошибка.<br>Сообщение не было отправлено.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "pers_chk_mail")
    {
        z = 24;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText === "done")
                        message_ex("show","info","direct","Сообщение успешно отправлено.");
                    else
                        message_ex("show","info","direct","Произошла ошибка.<br>Сообщение не было отправлено.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "recover_pass")
    {
        z = 25;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText === "found")
                    {
                        message_ex("hide");
                        message_ex("show","info","direct","Письмо с инструкциями было выслано<br>на указанную почту.");
                    }

                    else
                    {
                        //message_ex("hide");
                        message_ex("show","info","direct","Аккаунт с такими данными не найден.");
                    }


                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "pass_recover_confirm")
    {
        z = 26;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText === "done")
                        message_ex("show", "info", "recovery", true);
                    else
                        message_ex("show", "info", "recovery", false);

                    /*
                    if ($ajResponse[z].responseText === "done")
                        message_ex("show","info","direct","");
                    else
                        message_ex("show","info","direct","Ссылка для смены пароля.<br>больше не валидна.");
                    */
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "import_qsts")
    {
        z = 27;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let $d = JSON.parse($ajResponse[z].responseText);
                        $ad.qsts = duplicate($d.qsts);
                        update_comps(duplicate($d.comps));
                        // Fill new qz with new (imported too) qsts
                        //$new_qz.qst_list = []; // in case we need a all-in loading
                        if ($d.qsts_id_list.length)
                        {
                            $d.qsts_id_list.forEach(function (v_qst_id) {
                                for (let i=0; i<$ad.qsts.length; i++)
                                    if ($ad.qsts[i].id === v_qst_id)
                                    {
                                        $new_qz.qst_list.push($ad.qsts[i]);
                                        break;
                                    }
                            });
                            // Update onscreen lists
                            content_qst_update_compbox(false);
                            content_qst_update_list(false);
                            message_ex("show", "info", "direct_full", {
                                "head":"Импорт вопросов",
                                "tx": "Импорт успешно завершен.<br>Нажмите на кнопку «Список добавленных вопросов» для предварительной проверки."}
                                );
                        }
                        else
                            message_ex("show", "info", "direct", "Список индексов импортированных вопросов пуст.<br>Попробуйте еще раз или обратитесь в поддержку.");
                        $session.set();
                    }
                    else
                        message_ex("show", "info", "direct", "Импорт вопросов был неудачным.<br>Попробуйте еще раз или обратитесь в поддержку.");

                    /*
                    if ($ajResponse[z].responseText === "done")
                        message_ex("show","info","direct","");
                    else
                        message_ex("show","info","direct","Ссылка для смены пароля.<br>больше не валидна.");
                    */
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "qst_add")
    {
        z = 28;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let $d = JSON.parse($ajResponse[z].responseText);
                        let new_qst = duplicate($d.qst);
                        $ad.qsts.push(new_qst);
                        $new_qz.qst_list.push(new_qst);
                        if ($d.comp)
                        {
                            $ad.comps.push(duplicate($d.comp));
                            update_comps("build_map");
                        }

                        // Update onscreen lists
                        content_qst_update_compbox(false);
                        content_qst_update_list(false);
                        // Fill new qz with new (imported too) qsts
                        //$new_qz.qst_list = []; // in case we need a all-in loading

                        if ($tags !== "single")
                            message_ex("show", "info", "direct_full", {
                                "head":"Добавление вопросов",
                                "tx": "Добавление успешно завершено.<br>Нажмите на кнопку «Список добавленных вопросов» для предварительной проверки."}
                            );
                        else
                            qdrag.insert_anim("on");
                        $session.set();
                    }
                    else
                        message_ex("show", "info", "direct", "Добавление вопросов было неудачным.<br>Попробуйте еще раз или обратитесь в поддержку.");

                    /*
                    if ($ajResponse[z].responseText === "done")
                        message_ex("show","info","direct","");
                    else
                        message_ex("show","info","direct","Ссылка для смены пароля.<br>больше не валидна.");
                    */
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "qst_edit")
    {
        z = 54;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        message_ex("show", "info", "direct", "Обновление вопроса выполнено успешно.");
                    }
                    else
                        message_ex("show", "info", "direct", "При обновлении вопроса произошла ошибка.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "qst_del")
    {
        z = 56;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        message_ex("show", "info", "direct", "Удаление вопроса успешно.");
                    }
                    else
                    {
                        message_ex("show", "info", "direct", "При удалении вопроса произошла ошибка.");
                        content_qst_update_compbox(false); // refresh both lists to return the deleted qst element
                        content_qst_update_list(false); // - || -
                    }
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "comp_edit")
    {
        z = 55;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        message_ex("show", "info", "direct", "Обновление компетенции выполнено успешно.");
                        content_qst_update_list(false);
                    }
                    else
                        message_ex("show", "info", "direct", "При обновлении компетенции произошла ошибка.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "temp_data")
    {
        z = 29;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText !== false)
                    {
                        let d = JSON.parse($data);
                        //console.log("temp_data answer "+d.action);
                        if (d.action === "get" && getCookie("is_logged"))
                        {
                            if ($ajResponse[z].responseText)
                            {
                                // Check the validity of data
                                let data = JSON.parse($ajResponse[z].responseText);
                                if (typeof data === "object" && Object.keys(data).length)
                                {
                                    $session.last_data = JSON.parse($ajResponse[z].responseText);
                                    let date = new Date();
                                    $session.last_data_time = Math.floor(date.getTime() / 1000);

                                    $(".revert_session").css("display","block");
                                }
                                else
                                    $session.set(); // If not valid data - send fresh new set of it
                            }
                        }
                        else if (d.action === "set")
                        {
                            $session.autosave(); // show anim to indicate succsessful session data autosave
                        }
                    }
                    else
                        message_ex("show", "info", "direct", "Ошибка получения временных данных.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "presets_temp_data")
    {
        z = 45;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText !== false)
                    {
                        let d = JSON.parse($data);
                        if (d.action === "presets_get")
                        {
                            let d = JSON.parse($ajResponse[z].responseText);
                            Object.keys(d).map(function (key, ord) {
                                if ($session.presets.hasOwnProperty(key))
                                    $session.presets[key] = duplicate(d[key]);
                            });
                            //$session.presets = JSON.parse($ajResponse[z].responseText);
                            console.log("user presets is loaded");
                            // update options values to loaded ones
                            if ($new_qz.qst_screen_id === 4)
                                content_qst_answer_set_options("update_self");
                        }
                        else if (d.action === "presets_set")
                        {
                            console.log("user presets is updated");
                        }
                    }
                    else
                        message_ex("show", "info", "direct", "Ошибка получения временных данных.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "import_resps")
    {
        z = 30;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let $d = JSON.parse($ajResponse[z].responseText);
                        $ad.resps = duplicate($d.resps);
                        let edited_ord = $d.edited_ord; // "null" if this is a new f-group (imported via list load)

                        // Fill deli_list with resps, based on the list of their global ids, and the updated $ad.resps data
                        if ($d.resps_id_list.length)
                        {
                            let group; // form a group
                            let resp_ord;
                            let resp;
                            // import the id's of newly added to DB resps
                            $d.resps_id_list.forEach(function (v_focus_gr, i_focus_gr) {
                                group = [];
                                // Fill a group with resps by their ids
                                v_focus_gr.forEach(function (v_resp_id, i_resp_id) {
                                    resp_ord = null;
                                    if ($ad.resps.length)
                                        for (let i=0; i<$ad.resps.length; i++)
                                            if ($ad.resps[i].id === v_resp_id * 1)
                                            {
                                                resp_ord = i;
                                                resp = duplicate($ad.resps[resp_ord]);
                                                resp.cat_id = $d.resps_cat_list[i_focus_gr][i_resp_id];
                                                resp.cat_name = get_resp_category("by_id", resp.cat_id);
                                                break;
                                            }

                                    if (resp_ord !== null)
                                        group.push(resp);
                                });

                                // Add group
                                if (edited_ord === null)
                                    $new_qz.deli_list.push(group);
                                // Update group
                                else
                                    $new_qz.deli_list[edited_ord] = group;
                            });

                            message_ex("show", "info", "direct_full", {
                                "head":"Импорт респондентов",
                                "tx": "Внесение данных успешно завершено."}
                            );

                            $new_qz.deli_screen_id = 2; // go to major deli screen
                            show_content("deli_set");
                            $new_qz.deli_edit_ord = null;
                            $session.set();
                        }
                        else
                            message_ex("show", "info", "direct", "Список индексов импортированных респондентов пуст.<br>Попробуйте еще раз или обратитесь в поддержку.");


                    }
                    else
                        message_ex("show", "info", "direct", "Импорт респондентов был неудачным.<br>Попробуйте еще раз или обратитесь в поддержку.");

                    /*
                    if ($ajResponse[z].responseText === "done")
                        message_ex("show","info","direct","");
                    else
                        message_ex("show","info","direct","Ссылка для смены пароля.<br>больше не валидна.");
                    */
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "watcher_add")
    {
        z = 31;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        $ad.watchers = duplicate($ajResponse[z].responseText);
                        content_options_build_watchers_list("update_self");
                        message_ex("show", "info", "direct", "Создание наблюдателя успешно выполнено.");
                    }
                    else
                        message_ex("show", "info", "direct", "Создание наблюдателя не было выполнено.<br>Попробуйте еще раз или обратитесь в поддержку.");

                    /*
                    if ($ajResponse[z].responseText === "done")
                        message_ex("show","info","direct","");
                    else
                        message_ex("show","info","direct","Ссылка для смены пароля.<br>больше не валидна.");
                    */
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "watcher_del")
    {
        z = 32;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        $ad.watchers.splice($data, 1);
                        content_options_build_watchers_list("update_self");
                        message_ex("show", "info", "direct", "Удаление наблюдателя успешно выполнено.");
                    }
                    else
                        message_ex("show", "info", "direct", "Удаление наблюдателя не было выполнено.<br>Попробуйте еще раз или обратитесь в поддержку.");

                    /*
                    if ($ajResponse[z].responseText === "done")
                        message_ex("show","info","direct","");
                    else
                        message_ex("show","info","direct","Ссылка для смены пароля.<br>больше не валидна.");
                    */
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "letter_templates_save")
    {
        z = 33;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        $pers.letemps_list = JSON.parse($ajResponse[z].responseText);
                        content_options_letter_templated_dropdown("update_self");
                        message_ex("show", "info", "direct", "Шаблон письма успешно сохранен.");
                    }
                    else
                        message_ex("show", "info", "direct", "Шаблон письма не удалось сохранить.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "personify_mail")
    {
        z = 34;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        content_options_tabs_progress(6);
                        show_content("options");
                        message_ex("show", "info", "direct", "Письмо с желаемыми настройками успешно отправлено.");

                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось отправить письмо с желаемыми настройками.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "qz_create")
    {
        z = 35;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                message_ex("hide","holder"); // remove holder message box
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let $new_qz = JSON.parse($ajResponse[z].responseText);
                        $pers.focus_charges = $new_qz.focus_charges; // cut off service info, update pers with it
                        $new_qz.focus_charges = undefined; // remove service info
                        $ad.qzs.push($new_qz); // add new create quiz
                        $session.reset(); // zero-out session data
                        $session.set();
                        new_qz_tab_progress(1);

                        show_content("qz_create");
                        message_ex("show", "info", "direct", "Опрос успешно создан, приглашения отправлены.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось создать опрос.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                message_ex("hide","holder"); // remove holder message box
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "direct", "Не удалось создать опрос.<br>Ошибка запроса, возможно проблема в работоспособности интернета или сервера.");
            });
    }
    else
    if ($tag === "qz_exclusion_update")
    {
        z = 36;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let qz_ord = JSON.parse($data);
                        qz_ord = qz_ord.qz_ord;
                        $ad.qzs[qz_ord].resps = JSON.parse($ajResponse[z].responseText); // update resps with their new ignore statuses
                        content_deli_control_build_list("update_self");
                        content_deli_control_detect_changes(); // this will hide the "save" btn cuz no changes is there for now
                        message_ex("show", "info", "direct", "Данные опроса успешно обновлены.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось обновить данные опроса.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "qz_status_force")
    {
        z = 37;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let qz = JSON.parse($data);
                        let qz_ord = qz.qz_ord;
                        $ad.qzs[qz_ord].status = qz.status; // update resps with their new ignore statuses
                        if (-1 == qz.status)
                        {
                            $ad.qzs[qz_ord].status = 0;
                            $ad.qzs[qz_ord].is_fixed = 1;
                        }
                        else
                        {
                            $ad.qzs[qz_ord].is_fixed = 0;
                        }
                        content_deli_control_build_list("update_self");
                        content_deli_control_detect_changes(); // this will hide the "save" btn cuz no changes is there for now
                        message_ex("show", "info", "direct", "Данные опроса успешно обновлены.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось обновить данные опроса.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "qz_del")
    {
        z = 44;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        $ad.qzs = duplicate(JSON.parse($ajResponse[z].responseText));
                        $session.opened_qz_ord = null;
                        show_content();
                        message_ex("show", "info", "direct", "Данные опроса успешно удалены.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось удалить данные опроса.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "qz_rename")
    {
        z = 61;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText && "qz_renamed" === $ajResponse[z].responseText)
                    {
                        let args = JSON.parse($data);
                        $ad.qzs[args.qz_ord].name = args.qz_name;
                        $(".deli_control_box .qz_name").html($ad.qzs[args.qz_ord].name);
                        message_ex("show", "info", "direct", "Опрос успешно переименован.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось изменить название опроса.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "qbook_save_as")
    {
        z = 38;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let qbook = JSON.parse($ajResponse[z].responseText);
                        $ad.qbooks.push(duplicate(qbook)); // update resps with their new ignore statuses
                        content_qst_dirs("update_self");
                        message_ex("show", "info", "direct", "Новый шаблон опросника успешно сохранен.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось сохранить новый шаблон опросника.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    else
    if ($tag === "qbook_save")
    {
        z = 50;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let d = JSON.parse($data);
                        $ad.qbooks[d.qb_ord] = JSON.parse($ajResponse[z].responseText);
                        content_qst_dirs("update_self");
                        message_ex("show", "info", "direct", "Шаблон опросника успешно обновлен.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось обновить шаблон опросника.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "store_ipr_info")
    {
        z = 49;
        $ajResponse[z] = $.ajax({
            url: "report_ipr_download.php",
            data: {"ajax":$tag, "data":$data},
            method: "POST",
            cache: false
        })
        // -------------------------------------------------------------------------------------
            .done(function(){
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    console.log("store_ipr_info");
                    console.log($ajResponse[z].responseText);
                    // обновить наши данные после сохранения
                    if ($ajResponse[z].responseText !== "") {
                        // We got our filename with sored comments data
                        window.open(PATH + "report_ipr_download.php?storage="+$ajResponse[z].responseText);
                    }
                    else {
                        message("show", "direct", "store_report_info wrong data returned");
                    }

                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function(){
                console.log($tag, $ajResponse[z].responseText);
            });
    }

    else
    if ($tag === "base64_image_save")
    {
        z = 39;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data, "base64data":$tags},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        // we have full url to our new saved image
                        // $(".group_report_box").append("<img src="+$ajResponse[z].responseText+">");
                        console.log("image saved "+ $ajResponse[z].responseText);
                        group_report.images++;
                    }
                    else
                        message_ex("show", "info", "direct", "Информация об изображении не сохранена.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "dirs_save")
    {
        z = 47;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText === "done")
                        console.log("dirs saved");
                    content_qst_dirs("update_self");
                    $session.set();
                    /*
                    if ($ajResponse[z].responseText)
                    {
                        message_ex("show", "info", "direct", "Напоминание успешно отправлено.");
                    }
                    else
                        message_ex("show", "info", "direct", "Ошибка, напоминание не было отправлено.");
                    */
                }

            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "qbook_dirs_update")
    {
        z = 51;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                        $ad.qbooks = duplicate(JSON.parse($ajResponse[z].responseText));
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "qbook_redir")
    {
        z = 52;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let d = JSON.parse($data);
                        $ad.qbooks[d.qb_ord] = JSON.parse($ajResponse[z].responseText);
                        if(d.hasOwnProperty("lay_id") || d.hasOwnProperty("lay_name"))
                            content_qst_dirs("update_self");

                        if(d.hasOwnProperty("struct"))
                        {
                            $(".line[type=title] .qb_save").attr("is_saved", 1);
                        }
                    }
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "comment_report_datastore")
    {
        z = 53;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText) // return key of file with stored data for this report
                    {
                        $(".floater")
                            .css("display", "none")
                            .css("text-align", "left")
                            .css("font-size", "16px")
                            .html("");

                        if ($tags.tag === "open")
                            window.open(PATH + "report_single_comments.php?pers_id="+$tags.pers_id + "&name=" + $tags.focus_name+ "&k=" + $ajResponse[z].responseText);
                    }
                    else
                        message_ex("show","info","direct","Ошибка создания отчета с комментариями.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "qbook_resave")
    {
        z = 58;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let d = JSON.parse($data);
                        $ad.qbooks[d.qb_ord] = JSON.parse($ajResponse[z].responseText);
                        content_qst_dirs("update_self");
                        $session.set();
                        message_ex("show", "info", "direct", "Шаблон опросника успешно обновлен.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось обновить шаблон опросника.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }
    
    else
    if ($tag === "group_resp_add")
    {
        z = 59;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        if ($ajResponse[z].responseText === "resp_already_exists")
                        {
                            message_ex("show", "info", "direct", "Респондент с такой почтой уже существует в этой группе данного опроса.");
                        }
                        if ($ajResponse[z].responseText === "no_qz_found")
                        {
                            message_ex("show", "info", "direct", "Ошибка, не найдены данные опроса.");
                        }
                        else
                        {
                            let args = JSON.parse($data);

                            let d = JSON.parse($ajResponse[z].responseText);
                            if (d.hasOwnProperty("resps") && typeof d.resps === "object" && d.resps.length)
                                $ad.resps = duplicate(d.resps);
                            $ad.qzs[args.qz_ord].resps[args.gr_ord] = duplicate(d.group);
                            content_deli_control_build_list("update_self"); // refresh groups info
                            message_ex("show", "info", "direct", "Респондент успешно добавлен.");
                        }

                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось добавить респонлента.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "gang_change")
    {
        z = 60;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let args = JSON.parse($data);
                        // Update the table
                        if ("mail" === args.action)
                        {
                            $pers.gang[args.ord].mail = args.new_mail;
                            content_landing_crewmembers("update_self");
                        }
                        message_ex("show", "info", "direct", "Измение данных завершено успешно.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось изменить данные админа.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "qbook_swap_index")
    {
        z = 63;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        console.log("indexes swapped ok");
                        content_qst_dirs("update_self");
                    }
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "save_as_template")
    {
        z = 62;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    $pers.as_temp = JSON.parse($ajResponse[z].responseText);
                    as_templates_bld_dd_list("update_self");
                    message_ex("show","info","direct","Шаблон успешно сохранен.");
                }
                else
                    message_ex("show","info","direct","Шаблон не удалось сохранить.");
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "save_an_folder")
    {
        z = 64;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    $pers.an_folders = JSON.parse($ajResponse[z].responseText);
                    show_content();
                    //message_ex("show","info","direct","Папка успешно создана.");
                }
                else
                    message_ex("show","info","direct","Папку не удалось создать.");
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "qz_mute")
    {
        z = 66;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    message_ex("show","info","direct","Статус блокировки опроса успешно изменен .");
                }
                else
                    message_ex("show","info","direct","Не удалось изменить статус блокировки опроса.");
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }


    else
    if ($tag === "oqt_save")
    {
        z = 65;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        $pers.oqt = JSON.parse($ajResponse[z].responseText);
                        message_ex("show","info","direct","Шаблон успешно сохранен.");
                    }
                    else
                        message_ex("show","info","direct","Шаблон не удалось сохранить. Возвращен пустой массив.");
                }
                else
                    message_ex("show","info","direct","Шаблон не удалось сохранить. Сбой ajax запроса или сети.");
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "qbook_del")
    {
        z = 67;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        $ad.qbooks = duplicate(JSON.parse($ajResponse[z].responseText));
                        content_qst_dirs("update_self");
                        message_ex("show", "info", "direct", "Удаление опросника успешно.");
                    }
                    else
                        message_ex("show", "info", "direct", "Удаление опросника не было успешно.");

                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }

    else
    if ($tag === "qz_new_end_date")
    {
        z = 68;
        $ajResponse[z] = $.ajax(
            {
                url: "Receiver.php",
                data: {"ajax":$tag, "data":$data},
                method: "POST",
                cache: false
            })
        // -------------------------------------------------------------------------------------
            .done(function()
            {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        let args = JSON.parse($data);
                        $ad.qzs[args.qz_ord] = args.end_date;
                        $(".deli_control_box .subhead .date .date_val").html(timestamp_from_date(args.end_date, true)); // refresh date marker in the qz screen
                        message_ex("show", "info", "direct", "Замена даты прошла успешно.");
                    }
                    else
                        message_ex("show", "info", "direct", "Не удалось произвести замену даты.");

                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function()
            {
                console.log($tag + " aj failed: "+ $ajResponse[z].responseText);
                message_ex("show", "info", "aj_fail", [$tag, $ajResponse[z].responseText]);
            });
    }


}
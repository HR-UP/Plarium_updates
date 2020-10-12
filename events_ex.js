let $sys_mes_ind = 0;
let $last_holder_ind = null;
//****------------------------------------------------------------------------------------------------------------------
function bld_intro_text(tx) {

    function subchunk(tag, subtx) {
        let icon_star = subtx.split(tag);
        let img_attr = tag.replace(/#/g,"");
        img_attr = img_attr.toLowerCase();

        if (icon_star.length > 1)
            icon_star.forEach(function (tx_chunk, i_chunk) {
                if (math_floor(i_chunk / 2, 0) !== i_chunk / 2)
                {
                    subtx = subtx.replace(tag+tx_chunk+tag, "<table class='para'>" +
                        "<tr>" +
                        "<td class='icon' img='"+img_attr+"'></td>" +
                        "<td class='tx'>"+ tx_chunk +"</td>" +
                        "</tr>" +
                        "</table>");
                }
            });
        for (let i=0; i<50; i++)
            subtx = subtx.replace(tag,""); // clear the rest of the tags that have no pairs
        return subtx;
    }

    tx = tx.replace(/'/g, "☼");

    // Build tag paragraphs
    ["#STAR#","#MAN#","#TIME#","#NONE#"].forEach(function (tag) { //
        tx = subchunk(tag, tx);
    });

    let titles = tx.split("#TITLE#");
    if (titles.length > 1)
        titles.forEach(function (tx_chunk, i_chunk) {
            if (math_floor(i_chunk / 2, 0) !== i_chunk / 2)
                tx = tx.replace(tx_chunk, "<table class='para'>" +
                    "<tr>" +
                    "<td class='icon' img='none'></td>" +
                    "<td class='tx'>"+
                    "<div class='title'>"+ tx_chunk +"</div>" +
                    "</td>" +
                    "</tr>" +
                    "</table>");//"<div class='title'>"+ tx_chunk +"</div>");
        });
    tx = tx.replace(/#TITLE#/g,"");

    let colorize = tx.split("$");
    if (colorize.length > 1)
        colorize.forEach(function (tx_chunk, i_chunk) {
            if (math_floor(i_chunk / 2, 0) !== i_chunk / 2)
                tx = tx.replace(tx_chunk, "<span class='empo'>"+ tx_chunk +"</span>");
        });
    tx = tx.replace(/\$/g,"");

    tx = tx.replace(/☼/g, "'");


    let s = "<div class='intro_preview'>";
    s += tx;
    s += "</div>";
    return s;
}
//****------------------------------------------------------------------------------------------------------------------
function message_ex($action,$type,$about,$data,$tags){
// $action: show/hide, tip/hide_tip, make_clue
// $type: confirm (text + y/n btns), info (tx + "ok" btn), insert (tx + input + ok/cancel btns)
// $about — tag that handle what this msg_box is informing about (may define showed text)
// $data — custom data to show/calculate
    let name,  qbook_name, qbook_names_list, form;

    function set_content($action,$type,$about,$data,$tags) {
        let $cont, $head;
        switch ($about) {
            case "validation":
                $head = "Подтверждение аккаунта";
                if ($data)
                    $cont = "Аккаунт успешно подтвержден.";
                else
                    $cont = "Аккаунт не подтвержден.<br>Вероятно произошла ошибка, либо эта ссылка уже была успешно использована для подтверждения.";
                break;

            case "recovery":
                $head = "Восстановление пароля";
                if ($data)
                    $cont = "Пароль успешно изменен.<br>Для входа используйте почту и пароль из письма.";
                else
                    $cont = "Ссылка для смены пароля.<br>больше не валидна.";
                break;


            case "fresh_register":
                $head = "Регистрация успешна";
                $cont = "Используйте введенную почту и указанный пароль для входа в систему.";
                break;


            case "resp_send_reminder":
                $head = "Отправить напоминание";
                $cont = "Вы хотите отправить напоминание сотруднику <br><b>"+$data.name+"</b>?";
                break;

            // Ошибка получения данных на стороне сервера/БД  ______________________________________________________
            case "aj_request":
                $head = "Получение данных с БД неудачно";
                $cont = $data[0] + ": ошибка в запросе.";
                break;
            // Ошибка работы Ajax ____________________________________________________________________________
            case "aj_fail":
                $head = "Ошибка отправки/получения запроса через Ajax";
                $cont = $data[0] + " — тэг запроса что выдал ошибку.\nОтчет по запросу:\n" + $data[1];
                break;

            // Ошибка работы Ajax ____________________________________________________________________________
            case "login_fail":
                $head = "Ошибка авторизации";
                $cont = "Логин или пароль были введены неверно.";
                break;

            //  ____________________________________________________________________________
            case "pers_update_ok":
                $head = "Обновление данных учетной записи";
                $cont = "Данные успешно обновлены.";
                break;

            //  ____________________________________________________________________________
            case "pers_update_fail":
                $head = "Обновление данных учетной записи";
                $cont = "Данные не удалось обновить (возможно был введен неправильный пароль или произошла ошибка).";
                break;

            //  ____________________________________________________________________________
            case "pers_addition_fail":
                $head = "Создание учетной записи";
                $cont = "Учетная запись не была создана.";
                break;

            //  ____________________________________________________________________________
            case "pers_edit_fail":
                $head = "Редактирование учетной записи";
                $cont = "Учетная запись не была редактирована.";
                break;

            //  ____________________________________________________________________________
            case "pers_del_fail":
                $head = "Удаление учетной записи";
                $cont = "Учетная запись не была удалена.";
                break;

            case "export_excell":
                $head = "Загрузка данных";
                $cont = "Введите название файла для выгрузки в поле ниже.";
                break;

            case "scen_limit_changed":
                $head = "Изменение времени допуска";
                $cont = "Вы изменили время допуска в сценарии, который уже используется в опрос-группах. " +
                    "Если опросы в них были запущены рекомендуется разослать письма-напоминания, которые будут содержать актуальные даты доступа.";
                break;

            case "resp_create_no_dep_selected":
                $head = "Создание респондента";
                $cont = "Ошибка создания респондента. Вам необходимо выбрать подразделение. Если подразделений нет - их необходимо сперва создать.";
                break;

            case "resp_ans_list":
                $head = "Ответы респондента: " + $data[0];
                $cont = "<table class='ans_list'>";
                $data.forEach(function (v, i) {
                    if (i)
                    {
                        $cont += "<tr>";
                        $cont += "<td>" + v.tx + "<td>";
                        $cont += "<td>";
                        if (v.ans)
                            $cont += v.ans;
                        $cont += "</td>";
                        $cont += "</tr>";
                    }
                });
                $cont += "</table>";
                break;

            case "qst_edit":
                $head = "Редактировать текст вопроса";
                $cont = "Введите новый текст в поле ниже.";
                break;

            case "qst_del":
                $head = "Удалить вопрос";
                let comp_ord = get_comp_ord_from_comp_id($data.qst.comp_id);
                let comp_name = $ad.comps[comp_ord].name;
                $cont = "Вы действительно хотите удалить вопрос <b>"+ $data.qst.tx +"</b> из компетенции <b>"+ comp_name +"</b>?";
                $cont += "<br><br>Обратите внимание что данный вопрос будет удален из текущего списка вопросов (если содержится).";
                break;

            case "comp_edit":
                $head = "Редактировать название компетенции";
                $cont = "Введите новое название в поле ниже.";
                break;

            case "direct":
                $head = "Уведомление";
                $cont = $data;
                break;

            case "direct_full":
                $head = $data.head;
                $cont = $data.tx;
                break;

            case "del_fake_resps":
                $head = "Удаление демо-записей";
                $cont = "Вы уверены что хотите удалить?";
                break;

            case "pass_recovery":
                $head = "Восстановление пароля";
                $cont = "Введите почту данного аккаунта и новый пароль.<br>" +
                    "(на почту придет письмо со ссылкой подтверждения).";
                break;

            case "session_load":
                $head = "Восстановление последней сессии";
                $cont = "Вы действительно хотите восстановить данные последней сессии?<br>" +
                    "Время последнего сохранения восстанавливаемой сессии: <b>"+decode_timestamp($session.last_data_time, "no_span")+"</b>.<br>" +
                    "(после подтверждения все временные данные текущей сессии, такие как настройки создаваемого опроса, будут утеряны).";
                break;

            case "omitted_imported_resps":
                let hard_misses = 0;
                $head = "Загрузка респондентов";
                $cont = "Новых респондентов будет добавлено: <b>"+ $data.resp_qnt_new +"</b><br>";
                $cont += "Записей уже имеющихся респондентов: <b>"+ $data.resp_qnt_old +"</b><br><br>";
                $cont += "При загрузке обнаружены такие ошибки:";
                $data.bad_resp_list.forEach(function (v_resp, i_resp) {
                    $cont += "<br>";
                    $cont += (i_resp+1) +") <b>"+v_resp.fio+"</b>, " + v_resp.cat_name;
                    if (v_resp.reason === "omitted")
                    {
                        hard_misses++;
                        $cont += " (нет фокус-персоны)";
                    }
                    else if (v_resp.reason === "no_name")
                    {
                        //hard_misses++;
                        $cont += " (ФИО не указано)";
                    }
                    else if (v_resp.reason === "single")
                    {
                        hard_misses++;
                        $cont += " (нет группы)";
                    }
                    else if (v_resp.reason === "bad_mail")
                        $cont += " ("+v_resp.mail+" - не валиден почтовый адрес)";
                    else if (v_resp.reason === "inner_double")
                        $cont += " (дублирован e-mail в фокус-группе)";
                });

                if ($data.no_charges)
                    $cont += "<br><br>Загружаемый список был укорочен. Превышено доступное количество фокус-персон на данный момент: <b>"+ $pers.focus_charges +"</b><br>";

                // Show desc for harsh mistakes
                if (hard_misses)
                    $cont += "<br><br>Некоторые ошибки могли произойти по таким причинам:<br>" +
                        "1) фокус-персона (респондент назначенный на самооценку) оказалась единственным респондентом в своей группе;<br>" +
                        "2) фокус-персона была расположена в загружаемой таблице ниже предназначенных ей респондентов;<br>" +
                        "3) фокус-персона была расположена в самой первой строке загружаемой таблицы. Данная строка используется для вспомогательной информации и игнорируется при загрузке.<br><br>"+
                        "Построение списка фокус-персон проводится по такому принципу: начиная со второй строки таблицы находится первая фокус-персона, затем все строки респондентов, " +
                        "расположенные под ней, попадают в ее группу. Данная группа пополняется вплоть до нахождения следующей фокус-персоны или конца списка.";

                $cont += "<br><br>Нажмите «Подтвердить», если Вы желаете продолжить загрузку, исключив всех приведенных выше респондентов из списка.";
                break;

            case "resps_import_report":
                $head = "Загрузка респондентов";
                $cont = "Новых респондентов будет добавлено: "+ $data.resp_qnt_new +"<br>";
                $cont += "Записей уже имеющихся респондентов: "+ $data.resp_qnt_old +"<br>";

                if ($data.no_charges)
                    $cont += "<br><br>Загружаемый список был укорочен. Превышено доступное количество фокус-персон на данный момент: <b>"+ $pers.focus_charges +"</b><br>";
                // No new resps when we adding a new batch (not editing existing one)
                if (!$data.resp_qnt_new && $new_qz.deli_edit_ord !== null)
                    $cont += "<br><br>Новых респондентов не обнаружено.<br>" +
                        "Нажмите «Подтвердить», чтобы пополнить список из уже существующих в системе респондентов согласно загружаемой таблице.";
                else
                    $cont += "<br><br>Нажмите «Подтвердить», чтобы начать загрузку данных.";
                break;

            case "import_report_qsts":
                $head = "Сводка загрузки вопросов";
                $cont = "Всего новых вопросов будет внесено: <b>" + $data.report.new_qst_count + "</b>" +
                    "<br><br>Существующих вопросов найдено: <b>" + $data.report.old_qst_count + "</b>";
                // New comps
                if ($data.new_comps.length)
                {
                    $cont += "<br><br>Новые компетенции будут добавлены: ";
                    $data.new_comps.forEach(function (v_comp, i_comp) {
                        if (i_comp)
                            $cont += ", ";
                        $cont += v_comp;
                        if (i_comp+1 === $data.new_comps.length)
                            $cont += ".";
                    });
                }

                // current QZ list Repeats
                if ($data.report.qst_qb_matches.length)
                {
                    $cont += "<br><br>Дублирование вопросов с текущим списком опросника:";
                    $data.report.qst_qb_matches.forEach(function (v_slot, i_slot) {
                        $cont += "<br>    <b>" +
                            (i_slot+1) + ") " +
                            v_slot.comp_name+"</b>  >  " +
                            "<i>" + v_slot.qst_tx +"</i>"+
                            "  ("+v_slot.times_repeated+" повторов)";
                    });
                }
                else
                    $cont += "<br><br>Дублирование вопросов с текущим списком опросника: не обнаружено.";

                // Self Repeats
                if ($data.report.qst_repeats.length)
                {
                    $cont += "<br><br>Дублирование вопросов внутри списка: <b>обнаружено</b>";
                    $data.report.qst_repeats.forEach(function (v_slot, i_slot) {
                        $cont += "<br>    <b>" +
                            (i_slot+1) + ") " +
                            v_slot.comp_name+"</b>, " +
                            "<i>" + v_slot.qst_tx +"</i>"+
                            " ("+v_slot.times_repeated+" повторов)";
                    });
                }
                else
                    $cont += "<br><br>Дублирование вопросов внутри списка: не обнаружено.";

                if ($data.report.qst_repeats.length || $data.report.qst_qb_matches.length)
                    $cont += "<br><br>Все обнаруженные дублирования будут устранены при составлении списка.";

                if (!$data.report.new_qst_count)
                    $cont += "<br><br>Новых вопросов не обнаружено!<br>" +
                        "Нажмите «Подтвердить» чтобы создать список из уже существующих вопросов согласно загружаемой таблице.<br>"+
                        "Кнопка «Список добавленных вопросов» позволяет мониторить текущее состояние опросника.";
                else
                    $cont += "<br><br>Нажмите «Подтвердить» чтобы начать загрузку данных.";
                break;

            case "resp_delete_batch_from_list":
                $head = "Удаление фокус-группы";
                $cont = "Вы действительно хотите удалить фокус-группу <b>"+ $new_qz.deli_list[$data][0].fio +"</b>?";
                break;

            case "letter_template_save":
                $head = "Сохранение шаблона письма";
                $cont = "Рекомендуется давать краткие названия шаблонам (не более 30 символов).<br>";
                $cont += "Быстрые тэги, такие как %ORG% и %LINK%, при рассылке будут автоматически заменены на название компании и ссылку для прохождения соответственно.";
                if ($data.name)
                    $cont += "<br><br>Вы сохраняете измененный текст существующего шаблона.<br>" +
                        "Если Вы желаете перезаписать контент данного шаблона, то оставьте его прежнее название.<br>" +
                        "При изменении названия будет создан новый шаблон (и сохранен текущий).";
                break;

            case "send_feedback":
                $head = "Обращение в поддержку";
                $cont = "Есть вопросы?<div class='instruction_btn'>Показать инструкцию</div>" +
                    "Нашли ошибку?<br>Свяжитесь с нами на support@hr-up.ru или через форму ниже.";
                break;

            case "qbook_template_insert":
                let qbook = $ad.qbooks[$data.qbook_ord];
                $head = "Загрузить опросник из шаблона";
                $cont = "Вы действительно хотите загрузить вопросы из шаблона <b>"+ qbook.name +"</b> в Ваш список?<br>" +
                    "Обратите внимание, что Ваш текущий список будет полностью заменен загружаемым.";

                // QST TX
                /*
                    <br><br>" +
                    "Ниже указан полный перечень вопросов загружаемого опросника<br><br><div style='font-size: 12px; color: #484848'>";

                let qst_tx_list = [];
                let qst_compid_list = [];
                $ad.qsts.forEach(function (v_qst) {
                    qst_tx_list[v_qst.id] = v_qst.tx;
                    qst_compid_list[v_qst.id] = v_qst.comp_id;
                });
                let comp_name_list = [];
                $ad.comps.forEach(function (v_comp) {
                    comp_name_list[v_comp.id] = v_comp.name;
                });

                qbook.list.forEach(function (v_qst_id, i_qst_id) {
                    $cont += (i_qst_id+1) +") "+ qst_tx_list[v_qst_id] +" ("+comp_name_list[qst_compid_list[v_qst_id]]+")<br>";
                });
                $cont += "</div>";
                */
                break;

            case "qbook_save_as":
                $head = "Сохранение опросника в шаблон ";
                $cont = "Чтобы сохранить опросник дайте ему краткое уникальное название в поле ниже.";
                break;

            case "qbook_save":
            case "qbook_rename":
                $head = "Обновление существующего \""+ $ad.qbooks[$data.qb_ord].name +"\" шаблона опросника";
                $cont = "Обновляя опросник, Вы можете сменить его название в поле ниже.";
                break;


            case "qbook_resave":
                $head = "Обновление существующего \""+ $data.name +"\" шаблона опросника";
                $cont = "Вы уверены что хотите сохранить с перезаписью список вопросов?";//"Обновляя опросник, Вы можете сменить его название в поле ниже.";
                if ($data.involved_qz_list.length)
                {
                    $cont += "<br><br><b>ВАЖНО:</b> данный опросник был найден в таких опрос-группах:";
                    $data.involved_qz_list.forEach(function (slot) {
                        $cont = "<br>опрос "+ slot.name +" в группе "+ slot.focus +".";
                    });
                    $cont += "<br><br>Список выше учитывает группы которые уже начали (и/или завершили) прохождение опроса по старому шаблону опросника.<br>" +
                        "Убедитесь что новый список вопросов в сохраняемом опроснике не смажет результаты в уже пройденном опросе или не повредит результаты в активном опросе, " +
                        "например, если несколько человек уже прошли по старому шаблону опросника, а вы сохраняете в нем иное количество/арранжировку вопросов.";
                }

                break;

            case "add_whole_comp_to_list":
                $head = "Добавление вопросов из компетенции";
                $cont = "Вы действительно хотите добавить все вопросы компетенции <b>"+ $data.comp_name +"</b> в Ваш список?";
                break;

            case "resp_send_remainder":
                $head = "Отправка напоминания";
                $cont = "Вы действительно хотите отправить письмо с напоминанием о прохождении респонденту "+ $data.fio+"?";
                break;

            case "dirs_structure":
                $head = $data.head;
                $cont = $data.tx;
                break;

            case "dir_rename":
                $head = "Переименование папки \"" +$pers.dirs[$data.lay_name][$data.lay_ord].name+ "\"";
                $cont = "Введите новое название в поле ниже";
                break;

            case "qb_duplicate":
                $head = "Дублировать опросник \"" + $ad.qbooks[$data.qb_ord].name+ "\"";
                $cont = "Введите название для дублируемого опросника";
                break;


            case "qb_select":
                $head = "Выбрать опросник для фокус-группы \"<b>"+ $data.fio +"\"</b>";
                $cont = "Выберите опросник нажатием на название";
                $cont += "<div class='dirs_wnd'>";
                //$cont += "<div class='head'><div class='dirs_folder' is_fold='1'></div><div class='icon' type='di'></div><div class='dirs_folding_save'></div>Директории</div>";
                $cont += content_qst_dirs("get_html");
                $cont += "</div>";
                break;

            case "dir_delete":
                $head = "Удаление директории \"<b>"+ $data.label + " " + $data.name +"\"</b>";
                $cont = "Удаляя директорию, все подпапки в ней также будут удалены, а все опросники будут перемещены в корневую папку.";
                $cont += "<br><br><b>Список удаляемых элементов:</b>";
                $data.final_list.dirs.forEach(function (v_slot, i) {
                    $cont += "<br>"+ (i+1) +") <i>" + v_slot.label + "</i> " + v_slot.name;
                });

                if ($data.final_list.qbooks.length)
                {
                    $cont += "<br><br><b>Список переносимых опросников:</b>";
                    $data.final_list.qbooks.forEach(function (v_slot, i) {
                        let qb_ord = get_qb_ord_from_qb_id(v_slot.qb_id);
                        $cont += "<br>"+ (i+1) +") " + $ad.qbooks[qb_ord].name;
                    });
                }
                break;

            case "target_qb_select":
                $head = "Выбрать опросник для целеполагания";
                $cont = "Выберите опросник нажатием на название";
                $cont += "<div class='dirs_wnd'>";
                $cont += content_qst_dirs("get_html");
                $cont += "</div>";
                break;

            case "qz_restore":
                $head = "неверный указатель действия";
                $cont = "неверный указатель действия";
                let qz_name = "";
                if ($ad.qzs[$data.qz_ord].name)
                    qz_name = $ad.qzs[$data.qz_ord].name;

                if ("settings" === $data.action)
                {
                    $head = "Восстановление настроек опроса <b>"+ qz_name +"</b>";
                    $cont = "Выполняйте это действие только в том случае, когда в списке указана проблема с <b>настройками</b> опроса.";
                }
                else
                if ("resps" === $data.action)
                {
                    $head = "Восстановление респондентов опроса <b>"+ qz_name +"</b>";
                    $cont = "Выполняйте это действие только в том случае, когда в списке указана проблема со структурой <b>респондентов</b> опроса.";
                }
                break;

            case "group_resp_add":
                $head = "Добавление респондента в группу";
                $cont = "Ниже заполните данные нового респондента";
                break;

            case "intro_preview":
                $head = "Предпросмотр интро текcта";
                $cont = bld_intro_text($data.tx);
                break;

            case "gang_change_pass":
                $head = "Смена пароля для <b>"+ $data.name +"</b>";
                $cont = "Введите новый пароля для данного аккаунта";
                break;

            case "gang_change_mail":
                $head = "Смена пароля для <b>"+ $data.name +"</b>";
                $cont = "Введите новый email для данного аккаунта.<br><b>Внимание:</b> логин аккаунта также будет изменен на новое значение email'а.";
                break;

        }
        return {"cont":$cont, "head":$head};
    }

    function set_structure($action,$type,$about,$data,$tags) {
        let $res = "";
        switch ($type) {

            case "group_qb_select":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";

                $res += "<div class='btn_box'>";
                    $res += "<div action='ok' class='btn'>Ок</div>";
                $res += "</div>";
                break;
            }

            case "target_qb_select":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";

                $res += "<div class='btn_box'>";
                    $res += "<div action='ok' class='btn'>Ок</div>";
                $res += "</div>";
                break;
            }

            case "confirm":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                $res += "<div class='btn_box'>";
                $res += "<div action='yes' valid='1' class='btn pos_rght'>Подтвердить</div>";
                $res += "<div action='no' class='btn pos_left'>Отмена</div>";
                $res += "</div>";
                break;
            }

            case "pass_rec":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                // Блок текстового ввода
                $res += "<div class='inp_box'>";
                $res += "<label for='pr_mail' >Email-аккаунта</label><br>";
                $res += "<input type='text' id='pr_mail' class='inp pr_mail'><br>";
                $res += "<label for='pr_pass' >Новый пароль</label><br>";
                $res += "<input type='text' class='inp pr_pass'><br>";
                $res += "</div>";
                $res += "<div class='btn_box'>";
                $res += "<div action='yes' valid='1'  class='btn pos_rght'>Восстановить</div>";
                $res += "<div action='no' class='btn pos_left'>Отмена</div>";
                $res += "</div>";
                break;
            }

            case "insert":
            {
                let insert_value = "";
                if ($about === "letter_template_save")
                    insert_value = $data.name;
                else
                if ($about === "qst_edit")
                    insert_value = $data.qst.tx;
                else
                if ($about === "comp_edit")
                    insert_value = $data.comp.name;

                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                // Блок текстового ввода
                $res += "<div class='inp_box'>";
                $res += "<input style='text-align: center;' type='text' class='inp' placeholder='Введите текст' value='"+insert_value+"'>";
                $res += "</div>";
                $res += "<div class='btn_box'>";
                $res += "<div action='yes' valid='1' class='btn pos_rght'>Подтвердить</div>";
                $res += "<div action='no' class='btn pos_left'>Отмена</div>";
                $res += "</div>";
                break;
            }

            case "gang_change":
            {
                let insert_value = "";
                if ($about === "gang_change_mail")
                    insert_value = $data.mail;

                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                // Блок текстового ввода
                $res += "<div class='inp_box'>";

                if ($about === "gang_change_pass")
                    $res += "<input style='text-align: center;' type='password' class='inp' minlength='4' placeholder='Введите текст' value=''>";
                else
                    $res += "<input style='text-align: center;' type='email' class='inp' placeholder='Введите текст' value='"+insert_value+"'>";
                $res += "</div>";
                $res += "<div class='btn_box'>";
                $res += "<div action='yes' valid='1' class='btn pos_rght'>Подтвердить</div>";
                $res += "<div action='no' class='btn pos_left'>Отмена</div>";
                $res += "</div>";
                break;
            }

            case "group_resp_add":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                // Блок текстового ввода
                $res += "<div class='inp_box'>";
                    $res += "<input wide style='text-align: center;' type='text' class='inp' placeholder='Фамилия' param='fam' >";// value='Вася'
                $res += "</div>";
                $res += "<div class='inp_box'>";
                $res += "<input wide style='text-align: center;' type='text' class='inp' placeholder='Имя' param='name' >"; // value='Новик'
                $res += "</div>";
                $res += "<div class='inp_box'>";
                $res += "<input wide style='text-align: center;' type='text' class='inp' placeholder='Отчество' param='father'>";
                $res += "</div>";
                $res += "<div class='inp_box' wide>";
                    $res += "<input wide style='text-align: center;' type='email' class='inp' placeholder='Email, plarium@fortest.only' param='mail' >"; // value='vas@a.a'
                $res += "</div>";
                $res += "<div class='inp_box'>";
                    $res += "<select>" +
                        "<option>Руководители</option>" +
                        "<option>Коллеги</option>" +
                        "<option>Подчиненные</option>" +
                        "</select>";
                $res += "</div>";
                $res += "<div class='inp_box'>";
                    $res += "<input spec style='text-align: center;' type='email' class='inp' placeholder='Должность' param='spec'>";
                $res += "</div>";

                $res += "<div class='btn_box'>";
                $res += "<div action='yes' valid='1' class='btn pos_rght'>Подтвердить</div>";
                $res += "<div action='no' class='btn pos_left'>Отмена</div>";
                $res += "</div>";
                break;
            }

            case "resp_ans_list":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                $res += "<div class='btn_box'>";
                $res += "<div action='load' class='btn pos_left'>Скачать таблицу</div>";
                $res += "<div action='ok' class='btn pos_rght'>Ок</div>";
                $res += "</div>";
                break;
            }

            case "info":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                $res += "<div class='btn_box'>";
                $res += "<div action='ok' class='btn'>Ок</div>";
                $res += "</div>";
                break;
            }

            case "holder":
            {
                $last_holder_ind = $sys_mes_ind;
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"<div class='updater'></div></div>";
                $res += "<div class='btn_box'>";
                $res += "<div action='ok' class='btn'>Принудительно закрыть</div>";
                $res += "</div>";
                break;
            }

            case "add_quiz":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                // Блок настроек нового опроса
                $res += "<div class='new_quiz_box'>";
                $res += "<div><input type='text' placeholder='Название опроса' class='add_qz_name'></div>";
                $res += "<div>Опросник</div>";
                $res += "<div class='qb'>"+get_ddList("qbook","no_default",null)+"</div>";
                $res += "<div>Схема ответов</div>";
                $res += "<div class='ans'>"+get_ddList("ans_scheme","no_default",null)+"</div>";
                $res += "<div>Оцениваемый</div>";
                $res += "<div  class='host'>"+get_ddList("all_resps","no_default",null)+"</div>";
                $res += "</div>";
                // Блок кнопок
                $res += "<div class='btn_box'>";
                $res += "<div action='no' class='btn pos_left'>Отмена</div>";
                $res += "<div action='yes' valid='1' class='btn pos_rght'>Подтвердить</div>";
                $res += "</div>";
                break;
            }

            case "mail_template":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                $res += "<input type='text' class='mail_temp_name' placeholder='название нового шаблона'>";
                // Блок кнопок
                $res += "<div class='btn_box'>";
                $res += "<div action='no' class='btn pos_left'>Отмена</div>";

                if ($data.ind < 1)
                    $res += "<div action='save_as' class='btn pos_rght'>Сохранить как</div>";
                else
                {
                    $res += "<div action='save' class='btn pos_mid'>Сохранить</div>";
                    $res += "<div action='save_as' class='btn pos_rght'>Сохранить как</div>";
                }

                $res += "</div>";
                break;
            }

            case "feedback_form":
            {
                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";

                // Блок текстового ввода
                $res += "<div class='inp_box'>";
                    $res += "<input style='text-align: center;' type='text' class='inp' placeholder='Тема обращения' fb_head>";
                $res += "</div>";

                // Блок текстового ввода
                $res += "<div class='inp_box'>";
                $res += "<textarea class='fb_message' placeholder='Сообщение' ></textarea>";
                $res += "</div>";

                $res += "<div class='btn_box'>";
                $res += "<div action='yes' valid='1' class='btn pos_rght'>Отправить</div>";
                $res += "<div action='no' class='btn pos_left'>Отмена</div>";
                $res += "</div>";
                break;
            }

            case "dirs_add":
            {
                let insert_value = "";
                if (undefined !== $data.name)
                    insert_value = $data.name;

                $res += "<div class='head'>"+$head+"</div>";
                $res += "<div class='cont'>"+$cont+"</div>";
                // Блок текстового ввода
                $res += "<div class='inp_box'>";
                $res += "<input style='text-align: center;' type='text' class='inp' placeholder='Введите название' value='"+insert_value+"'>";
                $res += "</div>";
                $res += "<div class='btn_box'>";
                $res += "<div action='yes' valid='1' class='btn pos_rght'>Подтвердить</div>";
                $res += "<div action='no' class='btn pos_left'>Отмена</div>";
                $res += "</div>";
                break;
            }

        }
        return $res;
    }

    function set_events($action,$type,$about,$data,$tags) {
        let form;
        switch ($about)
        {
            case "send_feedback":
                $(".instruction_btn")
                    .off("click")
                    .click(function(){
                        if (getCookie("is_logged"))
                        {
                            window.open(PATH + "Оценка360_(гид по системе).pdf");
                        }
                    });
                break;

            case "qb_select":

                content_qst_dirs("update_self");
                // show dirs right away, sort of unfold
                $(".dirs_box").css("display","block");
                $(".qb_adapt").remove();
                $(".toolbox").remove();
                //$(".toolkit").remove();
                $(".header .icon").each(function (i) {
                    let line_type = $(this).attr("line");
                    if ("qb" !== line_type)
                        $(this).css("display","none");
                });

                $(".header .name")
                    .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
                    .mouseenter(function()
                    {
                        let is_qb = $(this).closest(".line").attr("is_qb") * 1;
                        if (is_qb)
                            floater_hint("show",{
                                head: "Название опросника",
                                tx: "Нажмите, чтобы назначить опросник для данной фокус-группы.",
                                w: 400,
                                dx: -200,
                                dy: 30,
                            });
                    })
                    .off("click")
                    .click(function(){
                        let is_qb = $(this).closest(".line").attr("is_qb") * 1;
                        if (is_qb)
                        {
                            let qb_id = $(this).closest(".line").attr("uid") * 1; // toggle 0-1
                            let qb_ord = get_qb_ord_from_qb_id(qb_id);
                            if (!$ad.qbooks[qb_ord].struct)
                            {
                                message_ex("hide"); // close window
                                message_ex("show","info","direct","Нельзя выбрать этот опросник, для него не настроена адаптивная схема<br>(вес вопросов, включенность для категорий и т.п.)"); // close window
                            }
                            else
                            {
                                // recheck & delete empty groups
                                let do_recheck = true;
                                while (do_recheck)
                                {
                                    do_recheck = false;
                                    for (let i=0; i<$new_qz.deli_list.length; i++)
                                        if (!$new_qz.deli_list[i] || !$new_qz.deli_list[i].length)
                                        {
                                            $new_qz.deli_list.splice(i, 1);
                                            do_recheck = true;
                                            break;
                                        }
                                }

                                let ord = $data.batch_ord;
                                $new_qz.settings.comm_groups[ord].qb_id = qb_id;
                                $(".resp_line[batch_ord='"+ ord +"'] .batch_qb").css("filter", "hue-rotate(0deg)"); // paint qb icon blue
                                message_ex("hide"); // close window
                                console.log("qb_id " + qb_id + " batch_ord " + ord);
                                focus_groups_update(); // add/remove slots
                            }
                        }
                    });
                break;

            case "target_qb_select":

                content_qst_dirs("update_self");
                // show dirs right away, sort of unfold
                $(".dirs_box").css("display","block");
                $(".qb_adapt").remove();
                $(".toolbox").remove();
                //$(".toolkit").remove();
                $(".header .icon").each(function (i) {
                    let line_type = $(this).attr("line");
                    if ("qb" !== line_type)
                        $(this).css("display","none");
                });

                $(".header .name")
                    .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
                    .mouseenter(function()
                    {
                        let is_qb = $(this).closest(".line").attr("is_qb") * 1;
                        if (is_qb)
                            floater_hint("show",{
                                head: "Название опросника",
                                tx: "Нажмите, чтобы назначить этот опросник.",
                                w: 400,
                                dx: -200,
                                dy: 30,
                            });
                    })
                    .off("click")
                    .click(function(){
                        let is_qb = $(this).closest(".line").attr("is_qb") * 1;
                        if (is_qb)
                        {
                            let qb_id = $(this).closest(".line").attr("uid") * 1; // toggle 0-1
                            let qb_ord = get_qb_ord_from_qb_id(qb_id);
                            if (!$ad.qbooks[qb_ord].struct)
                            {
                                message_ex("hide"); // close window
                                message_ex("show","info","direct","Нельзя выбрать этот опросник, для него не настроена адаптивная схема<br>(вес вопросов, включенность для категорий и т.п.)"); // close window
                            }
                            else
                            {
                                let match = null; // match by indicators of qbooks
                                //single_report.calc_type = type;
                                if (5 === $data.type) // check indicators match
                                {
                                    let match = true; // match by indicators of qbooks
                                    console.log("qb pick src data");
                                    console.log($data);

                                    let next_qb_list = $ad.qbooks[qb_ord].list;
                                    let main_qb = $ad.qzs[$data.qz_ord].settings.comm_groups[$data.group_ord].qb_id;
                                    let main_qb_ord = get_qb_ord_from_qb_id(main_qb);
                                    let main_qb_list = $ad.qbooks[main_qb_ord].list;
                                    for(let n=0; n<=next_qb_list.length; n++)
                                        if (main_qb_list.indexOf(next_qb_list[n]) === -1)
                                        {
                                            match = false;
                                            single_report.calc_type = 6; // slip to other type of report
                                            $data.type = 6;
                                            $(".calculus_box .option .tx").css("font-weight","normal");
                                            $(".option[type='6'] .tx").css("font-weight","bold");

                                            message_ex("hide"); // close window of qb picks
                                            message_ex("show","info","direct","Опросник целеполагание не совпадает с основным опросником по индицкаторам (по количеству или порядку).<br>" +
                                                "Тип отчета был переключен.");
                                            break;
                                        }
                                }

                                single_report.targ_qb_id = qb_id;
                                if ("admin" === $data.subtype)
                                    open_report($data.type, $data.qz_ord, $data.group_ord, qb_id);
                                else
                                    open_report_resp($data.type, $data.qz_ord, $data.group_ord, qb_id);

                                redraw_graph_for_calctype();
                                if (null === match)
                                    message_ex("hide"); // close window of qb picks
                            }
                        }


                    });
                break;

            case "qst_edit":
                // show dirs right away, sort of unfold
                $(".inp_box .inp").css("width","800px");
                break;

            case "comp_edit":
                // show dirs right away, sort of unfold
                $(".inp_box .inp").css("width","400px");
                break;

            case "group_resp_add":

                break;
        }
    }

    if (!$sys_mes_ind)
    {
        $(".sys_mes .btn_box .btn")
            .off("click");
        $("textarea.invite_body")
            .off("keyup")
            .off("change");
    }

    let $res = "", block_autoclose = false; // Блок используется когда нужно отключить фунцию авто-закрытия окна при нажатии "yes"-опции
    switch ($action) {
        // Показать окно с сообщением
        case "show":
            $sys_mes_ind++;
            let c = set_content($action,$type,$about,$data,$tags); // Определить контент сообщения
            $cont = c.cont;
            $head = c.head;
            $res += set_structure($action,$type,$about,$data,$tags); // Определить структуру окна
            $res = "<div class='sys_mes' id='"+$sys_mes_ind+"'><div class='wnd'>" + $res + "</div></div>"; // Обрамить сообщение

            // Вывести сообщение на экран
            let $elem = $("div.sys_mes[id="+($sys_mes_ind-1)+"]").length;
            // Если это НЕ первое системное сообщение - вывести его поверх предыдущего (кнопки предыдущего будут деактивированы)
            if ($sys_mes_ind > 1 && $elem)
                $("div.sys_mes[id="+($sys_mes_ind-1)+"]").after($res);
            else
                $($res).appendTo("body");
                //$($res).appendTo(".g_content"); // иначе вывести в топе содержимого (и поверх него)

            set_events($action,$type,$about,$data,$tags); // EVENTS for stuff

            // Обработчики событий кнопок сообщения + + + + + + + + + + + + + + + + +
            $(".sys_mes .btn_box .btn")
                .click(function()
                {
                    let wnd_ind = $(this).closest("div.sys_mes").attr("id")*1; // Индекс окна в котором была нажата кнопка
                    if ($sys_mes_ind === wnd_ind) // Позволить нажимать кнопки только на "верхнем" открытом окне
                    {
                        let $action = $(this).attr("action");
                        let $valid = $(".sys_mes .btn_box .btn[valid]").attr("valid") * 1;
                        if ($action === "load")
                        {
                            switch ($about)
                            {
                                case "resp_ans_list":
                                {
                                    //let date = new Date();
                                    let $form = {};
                                    $form.name = $data[0] + "_ответы";
                                    let $data_pure = JSON.parse(JSON.stringify($data));
                                    $data_pure.shift();
                                    // Fill table with correctly-parsed lines
                                    $form.table = [];
                                    $data_pure.forEach(function (v) {
                                        $form.table.push([
                                            strip(v.tx),
                                            strip(v.ans_val),
                                            strip(v.ans_tx)
                                        ]);
                                    });
                                    //console.log($form);
                                    sendAJ("export_excel", JSON.stringify($form));

                                    break;
                                }
                            }
                        }
                        else
                        if ($action === "yes")
                        {
                            if ($valid === 1)
                            {
                                switch ($about)
                                {
                                    case "resp_send_reminder":
                                    {
                                        // $data[1] - contains structure of all validly imported questions
                                        sendAJ("resp_send_reminder", JSON.stringify($data));
                                        break;
                                    }

                                    case "export_excell":
                                    {
                                        // Relocate to another let and change type index to type key for server-side use
                                        let $form = {};
                                        $form.table = $data;
                                        $form.name = $(".inp_box .inp").val();
                                        sendAJ("export_excel", JSON.stringify($form));
                                        break;
                                    }

                                    case "del_fake_resps":
                                    {
                                        sendAJ("remove_fakes", $pers.id);
                                        $(".remove_fakes").remove();
                                        break;
                                    }

                                    case "pass_recovery":
                                    {
                                        form  = {};
                                        form.mail = $(".pr_mail").val();
                                        form.pass = $(".pr_pass").val();
                                        console.log(form);

                                        if (validate_email(form.mail) && form.pass.length >= 3)
                                        {
                                            block_autoclose = true;
                                            sendAJ("recover_pass", JSON.stringify(form));
                                        }

                                        else
                                        {
                                            block_autoclose = true;
                                            message_ex("show", "info", "direct", "Введен некорректный email или слишком короткий пароль<br>(пароль минимум 3 символа)");
                                        }

                                        break;
                                    }

                                    case "session_load" :
                                        $session.load();
                                        break;

                                    case "pass_rec_auth":
                                    {
                                        form  = {};
                                        form.new_pass = $(".pass_rec_pass").val();
                                        form.auth_code = $(".pass_rec_code").val();
                                        message_ex("show", "info", "pass_recovery_sent", null);
                                        break;
                                    }

                                    case "import_report_qsts":
                                    {
                                        // No new qsts - make a list from existed ones based on imported list
                                        if (!$data.report.new_qst_count)
                                        {
                                            // Stack qsts based on global id from global array
                                            $data.new_qsts.forEach(function (v_slot) {
                                                for (let k=0; k<$ad.qsts.length; k++)
                                                    if ($ad.qsts[k].id === v_slot.id)
                                                    {
                                                        $new_qz.qst_list.push($ad.qsts[k]);
                                                        break;
                                                    }
                                            })
                                        }
                                        // import to DB new stuff
                                        else
                                        {
                                            $data.report = undefined;
                                            sendAJ("import_qsts", JSON.stringify($data));
                                            //console.log("done?");
                                        }


                                        break;
                                    }

                                    case "omitted_imported_resps":
                                    {
                                        // user agreed to ignore bad resps and load the shit anyway
                                        content_deli_confirm_resps_import($data);
                                        break;
                                    }

                                    case "resps_import_report":
                                    {
                                        content_deli_confirm_resps_import($data);
                                        break;
                                    }

                                    case "resp_delete_batch_from_list":
                                        $new_qz.deli_list.splice($data, 1);
                                        // refresh the window contents
                                        show_content("deli_set");
                                        $session.set();
                                        break;

                                    case "letter_template_save":
                                        $data.name = strip_tags($(".sys_mes .inp_box .inp").val().trim());
                                        if ($data.name && $data.name.length <= 35)
                                            sendAJ("letter_templates_save", JSON.stringify($data));
                                        else
                                            message_ex("show","info","direct","Название шаблона письма не указано или слишком длинное (более 35 символов).");
                                        break;

                                    case "send_feedback":
                                        form = {};
                                        form.head = strip_tags($(".inp[fb_head]").val().trim());
                                        form.message = strip_tags($(".fb_message").val().trim());
                                        form.id = $pers.id;
                                        form.name = $pers.name.replace("/☼/g", " ", $pers.name);
                                        form.mail = $pers.mail;
                                        form.phone = $pers.phone;

                                        if (!form.message || !form.head)
                                            message_ex("show","info","direct","Пожалуйста, заполните все поля темы и сообщения.");
                                        else
                                            sendAJ("send_feedback", JSON.stringify(form));
                                        break;

                                    case "qbook_template_insert":
                                        let qst_id_ords_list = []; // get ord by id for fast use
                                        $ad.qsts.forEach(function (v_qst, i_qst) {
                                            qst_id_ords_list[v_qst.id] = i_qst;
                                        });

                                        $new_qz.qst_list = []; // reload the whole list with qbooks questions

                                        let qbook = $ad.qbooks[$data.qbook_ord];
                                        qbook.list.forEach(function (v_qst_id) {
                                            let qst_ord = qst_id_ords_list[v_qst_id];
                                            let qst = $ad.qsts[qst_ord];
                                            $new_qz.qst_list.push(duplicate(qst));
                                        });
                                        content_qst_update_list(false); // update the list visually
                                        $session.set(); // save changes to session
                                        break;

                                    case "qbook_save_as":
                                        qbook_name = strip_tags($(".sys_mes .inp").val().trim());
                                        qbook_names_list = [];
                                        if ($ad.qbooks.length)
                                            $ad.qbooks.forEach(function (v_qb) {
                                                qbook_names_list.push(v_qb.name);
                                            });

                                        if (!qbook_name)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Пожалуйста, введите название шаблона.");
                                        }
                                        else
                                        if (qbook_names_list.indexOf(qbook_name) !== -1)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Шаблон с таким названием уже существует.");
                                        }

                                        else
                                        {
                                            form = {};
                                            // Transfer all keys
                                            Object.keys($data).map(function (key, ind) {
                                                form[key] = $data[key];
                                            });
                                            form.name = qbook_name;
                                            form.list = [];
                                            $data.qst_list.forEach(function (v_qst) {
                                                form.list.push(v_qst.id);
                                            });
                                            delete form.qst_list;
                                            sendAJ("qbook_save_as", JSON.stringify(form));
                                        }
                                        break;

                                    case "qbook_save":
                                        qbook_name = strip_tags($(".sys_mes .inp").val().trim());
                                        qbook_names_list = [];
                                        if ($ad.qbooks.length && qbook_name)
                                            $ad.qbooks.forEach(function (v_qb, i_qb) {
                                                if (i_qb !== $data.qb_ord) // exclude own qb_name from the list of match-search
                                                    qbook_names_list.push(v_qb.name);
                                            });

                                        if (!qbook_name) // name wasn't changed
                                            qbook_name = $ad.qbooks[$data.qb_ord].name;

                                        if (qbook_names_list.indexOf(qbook_name) !== -1)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Шаблон с таким названием уже существует.");
                                        }
                                        else
                                        {
                                            form = {};
                                            form.name = qbook_name;
                                            form.qb_ord = $data.qb_ord;
                                            form.qb_id = $ad.qbooks[$data.qb_ord].id;
                                            form.list = [];
                                            $data.qst_list.forEach(function (v_qst) {
                                                form.list.push(v_qst.id);
                                            });
                                            //console.log("saved qbook template");
                                            //console.log(form);
                                            sendAJ("qbook_save", JSON.stringify(form));
                                        }
                                        break;

                                    case "qbook_resave":
                                        /*
                                        qbook_name = strip_tags($(".sys_mes .inp").val().trim());
                                        qbook_names_list = [];
                                        if ($ad.qbooks.length && qbook_name)
                                            $ad.qbooks.forEach(function (v_qb, i_qb) {
                                                if (i_qb !== $data.qb_ord) // exclude own qb_name from the list of match-search
                                                    qbook_names_list.push(v_qb.name);
                                            });

                                        if (!qbook_name) // name wasn't changed
                                            qbook_name = $ad.qbooks[$data.qb_ord].name;

                                        if (qbook_names_list.indexOf(qbook_name) !== -1)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Шаблон с таким названием уже существует.");
                                        }
                                        else
                                        {
                                            form = {};
                                            form.name = qbook_name;
                                            form.qb_ord = $data.qb_ord;
                                            form.qb_id = $ad.qbooks[$data.qb_ord].id;
                                            form.struct = $data.struct;
                                            console.log("qbook resave");
                                            console.log(form);
                                            sendAJ("qbook_resave", JSON.stringify(form));
                                        }
                                        */
                                        form = {};
                                        form.name = $ad.qbooks[$data.qb_ord].name;
                                        form.qb_ord = $data.qb_ord;
                                        form.list = $data.list;
                                        form.qb_id = $ad.qbooks[$data.qb_ord].id;
                                        form.struct = $data.struct;
                                        console.log("qbook resave");
                                        console.log(form);
                                        sendAJ("qbook_resave", JSON.stringify(form));
                                        break;

                                    case "qbook_rename":
                                        qbook_name = strip_tags($(".sys_mes .inp").val().trim());
                                        qbook_names_list = [];
                                        if ($ad.qbooks.length && qbook_name)
                                            $ad.qbooks.forEach(function (v_qb, i_qb) {
                                                if (i_qb !== $data.qb_ord) // exclude own qb_name from the list of match-search
                                                    qbook_names_list.push(v_qb.name);
                                            });

                                        if (!qbook_name) // name wasn't changed
                                            qbook_name = $ad.qbooks[$data.qb_ord].name;

                                        if (qbook_names_list.indexOf(qbook_name) !== -1)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Шаблон с таким названием уже существует.");
                                        }
                                        else
                                        {
                                            form = {};
                                            let qb_src = $ad.qbooks[$data.qb_ord];
                                            // Transfer all keys
                                            Object.keys(qb_src).map(function (key) {
                                                form[key] = qb_src[key];
                                            });
                                            form.name = qbook_name;
                                            form.qb_ord = $data.qb_ord;
                                            form.qb_id = $ad.qbooks[$data.qb_ord].id;
                                            sendAJ("qbook_save", JSON.stringify(form));
                                        }
                                        break;

                                    case "add_whole_comp_to_list":
                                        let new_qst = 0;
                                        let old_qst = 0;
                                        let comp_id = $data.comp_id;

                                        // Find competention
                                        for (let i=0; i<$ad.qsts.length; i++)
                                            if ($ad.qsts[i].comp_id === comp_id)
                                            {
                                                let qst = $ad.qsts[i];
                                                if (check_quiz_qst_duplicate(qst.id))
                                                    old_qst++;
                                                else
                                                {
                                                    new_qst++;
                                                    $new_qz.qst_list.push(qst); // add qst to list
                                                }
                                            }

                                        if (!new_qst)
                                            message_ex("show","info","direct","Все вопросы данной компетенции уже есть в Вашем списке.");
                                        else
                                        {
                                            content_qst_update_list(false); // refresh list visually
                                            qdrag.insert_anim("on");

                                            if (new_qst && old_qst)
                                                message_ex("show","info","direct","Некоторые вопросы данной компетенции уже есть в Вашем списке.<br>"+
                                                    "Вопросов добавлено: " + new_qst +"<br>"+
                                                    "Вопросов повторяется: " + old_qst);
                                        }
                                        break;

                                    case "resp_send_remainder":
                                        sendAJ("resp_send_remainder", JSON.stringify($data));
                                        break;

                                    case "dirs_structure":
                                        name = $(".sys_mes .inp_box .inp").val().trim();
                                        let is_unique = dirs_chk_unique($data.layer, name.toLowerCase(), $data.host_id);
                                        if (!name)
                                        {
                                            message_ex("show","info","direct","Введите корректное название создаваемого подуровня.");
                                            block_autoclose = true;
                                        }
                                        else
                                        if (!is_unique)
                                        {
                                            message_ex("show","info","direct","Введите уникальное (для данного уровня) название создаваемого подуровня.");
                                            block_autoclose = true;
                                        }
                                        else
                                        {
                                            // Raise id counter
                                            let lay_id_name = $data.layer + "_id";
                                            $pers.dirs[lay_id_name]++;
                                            let new_id = $pers.dirs[lay_id_name];
                                            let date = get_timestamp();

                                            let lay_name = $data.layer + "_list";
                                            let list = $pers.dirs[lay_name];

                                            if ($data.action === "add")
                                            {
                                                let slot = {
                                                    id: new_id,
                                                    host_id: $data.host_id,
                                                    name: name,
                                                    cd: date,
                                                    ud: date
                                                };
                                                list.push(slot);
                                            }
                                            else
                                            if ($data.action === "edit")
                                            {
                                                switch ($data.layer) {
                                                    case "di":
                                                        $pers.dirs.di_id++;
                                                        break;

                                                    case "de":
                                                        break;

                                                    case "br":
                                                        break;

                                                    case "tm":
                                                        break;

                                                    case "st":
                                                        break;

                                                    case "sp":
                                                        break;

                                                    case "gr":
                                                        break;
                                                }
                                            }

                                            form = {
                                                pers_id: $pers.id,
                                                dirs: $pers.dirs,
                                                action: "save"
                                            };
                                            sendAJ("dirs_save", JSON.stringify(form));
                                        }
                                        break;

                                    case "dir_rename":
                                        name = $(".sys_mes .inp_box .inp").val().trim();
                                        if (!name)
                                            message_ex("show","info","direct","Не введено новое название для папки.");
                                        else
                                        if (!dirs_chk_unique_name(name, $data))
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Такое имя папки уже имеется на данном уровне, введите другое имя.");
                                        }
                                        else
                                        {
                                            $pers.dirs[$data.lay_name][$data.lay_ord].name = name; // change name
                                            form = {
                                                pers_id: $pers.id,
                                                dirs: $pers.dirs,
                                                action: "save"
                                            };
                                            sendAJ("dirs_save", JSON.stringify(form)); // save to server
                                        }
                                        break;

                                    case "qb_duplicate":
                                        qbook_name = strip_tags($(".sys_mes .inp").val().trim());
                                        qbook_names_list = [];
                                        if ($ad.qbooks.length)
                                            $ad.qbooks.forEach(function (v_qb) {
                                                qbook_names_list.push(v_qb.name);
                                            });

                                        if (!qbook_name)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Пожалуйста, введите название шаблона.");
                                        }
                                        else
                                        if (qbook_names_list.indexOf(qbook_name) !== -1)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Шаблон с таким названием уже существует.");
                                        }
                                        else
                                        {
                                            form = {};
                                            let qb_src = $ad.qbooks[$data.qb_ord];
                                            // Transfer all keys
                                            Object.keys(qb_src).map(function (key) {
                                                form[key] = qb_src[key];
                                            });
                                            form.name = qbook_name;
                                            delete form.id;
                                            sendAJ("qbook_save_as", JSON.stringify(form));
                                        }
                                        break;

                                    case "qb_select":

                                        break;

                                    case "dir_delete":
                                        let final_list = dirs_del_layer($data.lay_name, $data.lay_id, "remove"); // get all deleted in list: folder and sub-folders, and qbooks wis unsigned to the root
                                        sendAJ("qbook_dirs_update", JSON.stringify(final_list.qbooks)); // update all affected qbook relation tags
                                        form = {
                                            action: "save",
                                            dirs: $pers.dirs
                                        };

                                        sendAJ("dirs_save", JSON.stringify(form)); // update all affected qbook relation tags
                                        break;

                                    case "qst_edit":
                                        let tx = strip_tags($(".sys_mes .inp_box .inp").val().trim()); // get all deleted in list: folder and sub-folders, and qbooks wis unsigned to the root

                                        if (!tx)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Поле текста вопроса не может быть пустым.");
                                        }
                                        else
                                        {
                                            $ad.qsts[$data.q_ord].tx = tx; // change client side
                                            form = {
                                                qid: $data.qst.id,
                                                tx: tx,
                                            };

                                            $(".qst_item[qsts_ord='"+ $data.q_ord +"'] .tx .string").text(tx);

                                            sendAJ("qst_edit", JSON.stringify(form)); // update server side
                                        }
                                        break;

                                    case "qst_del":
                                        $(".qst_item[qsts_ord='"+ $data.q_ord +"']").remove(); // remove form comps batch
                                        if ($new_qz.qst_list.length) // remove from current list
                                            for (let i=0; i<$new_qz.qst_list.length; i++)
                                                if ($new_qz.qst_list[i] === $data.qst.id * 1)
                                                {
                                                    $new_qz.qst_list.splice(i, 1);
                                                    break;
                                                }

                                        sendAJ("qst_del", JSON.stringify($data.qst.id)); // update server side

                                        break;

                                    case "comp_edit":
                                        name = strip_tags($(".sys_mes .inp_box .inp").val().trim()); // get all deleted in list: folder and sub-folders, and qbooks wis unsigned to the root

                                        if (!name)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Поле названия компетенции не может быть пустым.");
                                        }
                                        else
                                        {
                                            $ad.comps[$data.comp_ord].name = name; // change client side
                                            form = {
                                                cid: $data.comp.id,
                                                name: name,
                                            };

                                            $(".comp_tile[id='"+ $data.comp.id +"'] .head .name").text(name);

                                            sendAJ("comp_edit", JSON.stringify(form)); // update server side
                                        }
                                        break;

                                    case "qz_restore":
                                        {
                                            form = {
                                                action: $data.action,
                                                qz_ord: $data.qz_ord,
                                                qz_id: $ad.qzs[$data.qz_ord].id,
                                                pid: $pers.id
                                            };
                                            sendAJ("qz_restore", JSON.stringify(form));
                                            break;
                                        }

                                    case "group_resp_add":
                                        form = {};
                                        form.qz_id = $data.qz_id;
                                        form.qz_ord = $data.qz_ord;
                                        form.gr_ord = $data.batch_ord;
                                        form.fio = [];
                                        $(".inp_box input").each(function () {
                                            let param = $(this).attr("param");
                                            switch (param) {
                                                case "fam":
                                                    form.fio[0] = $(this).val().trim();
                                                    break;
                                                case "name":
                                                    form.fio[1] = $(this).val().trim();
                                                    break;
                                                case "father":
                                                    form.fio[2] = $(this).val().trim();
                                                    break;
                                                case "mail":
                                                    form.mail = $(this).val().trim();
                                                    break;
                                                case "spec":
                                                    form.spec = $(this).val().trim();
                                                    break;
                                            }
                                        });
                                        form.cat_id = $(".inp_box select").prop("selectedIndex")*1;
                                        if (0 === form.cat_id)
                                            form.cat_id = 4; // boss
                                        else
                                        if (1 === form.cat_id)
                                            form.cat_id = 3; // colleagues
                                        else
                                            form.cat_id = 5; // employee


                                        if (!validate_email(form.mail))
                                        {
                                            message_ex("show","info","direct","Почта введена не верно.");
                                            block_autoclose = true;
                                        }
                                        else
                                        if (!form.fio[0] || !form.fio[1])
                                        {
                                            message_ex("show","info","direct","Фамилия или Имя не введены.");
                                            block_autoclose = true;
                                        }
                                        else {
                                            let fio = duplicate(form.fio);
                                            form.fio = fio[0];
                                            if (fio[1])
                                                form.fio += " " + fio[1];
                                            if (fio[2])
                                                form.fio += " " + fio[2];
                                            sendAJ("group_resp_add", JSON.stringify(form));
                                        }

                                        console.log("group_resp_add form");
                                        console.log(form);

                                        break;

                                    case "gang_change_pass":
                                    {
                                        form = {
                                            action: "pass",
                                            ord: $data.ord,
                                            mail: $data.mail,
                                            new_pass: $(".sys_mes .inp_box .inp").val()
                                        };
                                        form.new_pass.trim();
                                        if (form.new_pass.length < 4)
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Новый пароль должен быть не менее четырех символов.");
                                        }
                                        else
                                            sendAJ("gang_change", JSON.stringify(form));
                                        break;
                                    }

                                    case "gang_change_mail":
                                    {
                                        form = {
                                            action: "mail",
                                            ord: $data.ord,
                                            mail: $data.mail,
                                            new_mail: $(".sys_mes .inp_box .inp").val()
                                        };
                                        form.new_mail.trim();
                                        if (!validate_email(form.new_mail))
                                        {
                                            block_autoclose = true;
                                            message_ex("show","info","direct","Введите корректный почтовый адрес.");
                                        }
                                        else
                                            sendAJ("gang_change", JSON.stringify(form));
                                        break;
                                    }
                                }

                                // ---------------------------------- TAGS ---------------------------------------------

                                switch ($tags)
                                {
                                    case "qst_add_notice":
                                        sendAJ("qst_add", JSON.stringify(form));
                                        break;

                                    case "force_qz_status":
                                        form = {};
                                        form.qz_ord = $session.opened_qz_ord;
                                        form.qz_id = $ad.qzs[$session.opened_qz_ord].id;
                                        form.status = $data.qz_new_status;
                                        sendAJ("qz_status_force", JSON.stringify(form));
                                        break;

                                    case "qz_del":
                                        form = {};
                                        form.qz_ord = $data.qz_ord;
                                        form.qz_id = $ad.qzs[form.qz_ord].id;
                                        console.log(form);
                                        sendAJ("qz_del", JSON.stringify(form));
                                        break;

                                    case "qb_adapt_save_skip":
                                        $new_qz.qst_screen_id = 5; // go to answer options
                                        show_content("qst");
                                        break;
                                }

                                // Убрать окно сообщения
                                if (!block_autoclose)
                                    message_ex("hide");
                            }
                        }
                        else
                        if ($action === "no" || $action === "ok")
                        {
                            message_ex("hide");
                            switch ($about){
                                case "scen_limit_changed":
                                    sendAJ("scen_edit", $data);
                                    break;


                                case "register_ok":
                                    goto_screen("login");
                                    break;

                                case "test_used_cant_be_del":
                                    test_opt_picked = false; // return double-event blocker to default state (without this test will unfold when edit/del btns is pressed)
                                    break;

                                case "fresh_register":
                                case "validation":
                                case "recovery":
                                    new_qz_tab_progress(1);
                                    show_content("land_auth");
                                    //location.href = location.origin + location.pathname;
                                    break;

                            }
                            switch ($tags){
                                case "resp_ankete_sent":
                                    wipe_ankete();
                                    break;

                                case "demo_resp_notice":
                                    $pers.tags.demo_resp_notice = 1;
                                    sendAJ("set_tag", JSON.stringify({"pers_id" :$pers.id, "tag" : "demo_resp_notice", "val" : 1}));
                                    break;

                            }
                        }
                    }
                });
            break;

        // Спрятать окно с сообщением
        case "hide":{
            if ($type === "holder")
                $last_holder_ind = null;

            $(".sys_mes[id="+$sys_mes_ind+"]").remove();
            if (typeof $curs !== 'undefined')
                $curs.picked[0] = 0;
            $sys_mes_ind--;
            floater_hint("remove");
            break;
        }
    }
}




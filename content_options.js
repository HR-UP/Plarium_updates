let personify_settings_sent = false;
/*
let default_intro_self = "Уважаемый коллега!<br><br>" +
    "Перед Вами – опрос 360 градусов. Пожалуйста, ответьте на вопросы о самом себе, Ваших деловых качествах и управленческом стиле<br>" +
    "Задача проведения данной части опроса – обеспечить сравнение Вашей самооценки с тем, как Вас видят окружающие. " +
    "Впоследствии это поможет Вам глубже проанализировать Ваши сильные стороны и зоны развития. Постарайтесь давать максимально правдивые ответы.<br><br>" +
    "Правила заполнения опроса: <br>" +
    "Опросник состоит из нескольких вопросов. По каждому вопросу Вам будут предложены варианты ответов. " +
    "Вам необходимо выбрать один вариант и нажать на него один раз. " +
    "После этого будет автоматически осуществлен переход к другому вопросу (дождитесь перехода системы к следующему вопросу).<br>" +
    "В конце опроса Вам будет предложено вписать от себя некоторые комментарии.<br>" +
    "По завершении опроса нажмите кнопку «сохранить» в верхней части экрана слева.";

let default_intro_other = "Уважаемый коллега!<br><br>" +
    "Перед Вами – опрос 360 градусов. Просим Вас ответить на предлагаемые вопросы, касающиеся делового и управленческого стиля %ФИО%.<br>" +
    "Задача проведения опроса – обеспечить максимально качественную и объективную обратную связь. Опросник анонимен. При обработке результатов опроса Ваше имя и фамилия фиксироваться не будут. " +
    "Важно максимально точное отражение Вашего мнения.<br> " +
    "Правила заполнения опроса: <br>" +
    "Опросник состоит из нескольких вопросов. По каждому вопросу Вам будут предложены варианты ответов. Вам необходимо выбрать один вариант и нажать на него один раз. " +
    "После этого будет автоматически осуществлен переход к другому вопросу (дождитесь перехода системы к следующему вопросу).<br>" +
    "В конце опроса Вам будет предложено вписать от себя некоторые комментарии.<br><br>" +
    "По завершении опроса нажмите кнопку «сохранить» в верхней части экрана слева.";
    */
let default_intro_self = "Привет!<br><br>" +
    "Это опрос, в котором ты должен оценить свое взаимодействие с коллегами.<br><br>" +
    "Пожалуйста, отвечай честно. Так тебе будет проще понять, в чем твоя оценка собственных действий совпадает с оценкой коллег, а в чем — расходится с ней.";

let default_intro_other =
    "#TITLE#\n" +
    "Привет!\n" +
    "#TITLE#\n" +
    "\n" +
    "#STAR#\n" +
    "Приглашаем тебя заполнить опрос по взаимодействию с сотрудником: %ФИО%. Это поможет твоему коллеге выявить свои сильные и слабые стороны и понять, как ему следует развиваться дальше.\n" +
    "#STAR#\n" +
    "\n" +
    "#MAN#\n" +
    "Опрос $полностью конфиденциален,$ поэтому, пожалуйста, отвечай честно. Если ты не знаешь, как в той или иной ситуации поступает коллега, выбирай ответ $'Не владею информацией'.$\n" +
    "#MAN#\n" +
    "\n" +
    "#TIME#\n" +
    "На заполнение анкеты у тебя уйдет не более $15–20 минут.$\n" +
    "#TIME#\n" +
    "\n" +
    "Будем ждать твои ответы $до 30.09.2020 18:00$";
    /*
    "Уважаемый коллега!<br><br>" +
    "Это опрос по взаимодействию с сотрудником: %ФИО%.<br><br>" +
    "Пожалуйста, отвечай честно. Такая обратная связь очень важна для твоего коллеги: она поможет ему понять, за что его ценят в коллективе, и определить свои зоны роста.";
*/

//----------------------------------------------------------------------------------------------------------------------
function content_options()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='options_box' "+$nosel+">";

    switch ($new_qz.options_screen_id)
    {
        case 1:
            $res += content_options_1_access();
            break;

        case 2:
            $res += content_options_2_scales();
            break;

        case 3:
            $res += content_options_3_letter();
            break;

        case 4:
            $res += content_options_4_notify();
            break;

        case 5:
            //$res += content_options_5_personify();
            $res += content_options_5_feedback();
            break;

        case 6:
            $res += content_options_6_finalize();
            break;
    }

    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_1_access()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='options_access' "+$nosel+">";

        $res += "<div class='head'>Добавить наблюдателей с уровнем доступа</div>"; // Выберите уровень доступа к аккаунту

        $res += "<table class='access_box'>";
            $res += "<tr>";
            $res += "<td><input placeholder='Укажите e-mail чтобы добавить наблюдателя' class='mail' ></td>";
            $res += "<td><div class='opt'><div class='img' set='1' ord='1'></div>Только чтение</div></td>";
            $res += "<td><div class='opt'><div class='img' set='0' ord='2'></div>Стандартный</div></td>";
            $res += "<td><div class='opt'><div class='img' set='0' ord='3'></div>Администратор</div></td>";
            $res += "</tr>";
            // <div class='checked'></div>
            $res += "<tr>";
            $res += "<td>Добавление опросов</td>";
            $res += "<td></td>";
            $res += "<td></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";

            $res += "<tr>";
            $res += "<td>Добавление вопросов</td>";
            $res += "<td></td>";
            $res += "<td></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";

            $res += "<tr>";
            $res += "<td>Редактирование вопросов\n</td>";
            $res += "<td></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";

            $res += "<tr>";
            $res += "<td>Добавление участников</td>";
            $res += "<td></td>";
            $res += "<td></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";

            $res += "<tr>";
            $res += "<td>Рассылка приглашений </td>";
            $res += "<td></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";

            $res += "<tr>";
            $res += "<td>Изменение настроек</td>";
            $res += "<td></td>";
            $res += "<td></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";

            $res += "<tr>";
            $res += "<td>Мониторинг оценки</td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";

            $res += "<tr>";
            $res += "<td>Отправка напоминаний</td>";
            $res += "<td></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";

            $res += "<tr>";
            $res += "<td>Просмотр отчетов</td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";

            $res += "<tr>";
            $res += "<td>Скачивание отчетов</td>";
            $res += "<td></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "<td><div class='checked'></div></td>";
            $res += "</tr>";
        $res += "</table>";

        $res += "<table class='btn_box' pos='mid'><tr>";
        $res += "<td><div class='btn' action='send_invite'>Назначить приглашение</div></td>";
        $res += "</tr></table>";

        $res += content_options_build_watchers_list("get_html");
/*
        $res += "<table class='btn_box' pos='bottom'><tr>";
        $res += "<td><div class='btn' action='back'>Назад</div></td>";
        $res += "<td><div class='btn' action='next'>Сохранить</div></td>";
        $res += "</tr></table>";
        */
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_2_scales()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='options_scales' "+$nosel+">";
    /*
    $res += "<div class='head'>Настройка оценок</div>"; // Выберите уровень доступа к аккаунту

    $res += "<table class='scales_holder'><tr><td>";

        $res += "<table class='scales_box'>";
        $res += "<tr>";
        $res += "<td class='subhead'>Выберите формат оценок:</td>";
        $res += "</tr>";
        $res += "<tr>";
        $res += "<td><div class='opt'><div class='img' set='0' ord='1'></div></div><div class='scale' ord='1'></div></td>";
        $res += "</tr>";

        $res += "<tr>";
        $res += "<td><div class='opt'><div class='img' set='0' ord='4'></div></div><div class='scale' ord='4'></div></td>";
        $res += "</tr>";
        $res += "<tr>";
        $res += "<td><div class='opt'><div class='img' set='0' ord='2'></div></div><div class='scale' ord='2'></div></td>";
        $res += "</tr>";
        $res += "<tr>";
        $res += "<td><div class='opt'><div class='img' set='0' ord='5'></div></div><div class='scale' ord='5'></div></td>";
        $res += "</tr>";
        $res += "<tr>";
        $res += "<td><div class='opt'><div class='img' set='0' ord='3'></div></div><div class='scale' ord='3'></div></td>";
        $res += "</tr>";
        $res += "</table>";

    $res += "</td>";
    */
    $res += "<td>";
        $res += "<table class='djo_avg_box'>";
        $res += "<tr>";
        $res += "<td class='subhead'>Выберите тип отражения данных в окне Джохари:</td>";
        $res += "</tr>";
        $res += "<tr>";
        $res += "<td><div class='opt'><div class='img' set='0' ord='1'></div></div><div class='tx'>Среднее</div></td>";
        // hint: Деление данных в матрице идет по среднему  строго математически - 50 на 50, но обычно данные в окне Джохарри смещаются в одну из частей окна.
        $res += "</tr>";
        $res += "<tr>";
        $res += "<td><div class='opt'><div class='img' set='0' ord='2'></div></div><div class='tx'>Среднее с поправкой на общую выборку</div></td>";
        // hint: Деление  данные идет с эмпирическая поправка, полученная в ходе более 1200 оценок. Она позволяет сравнивать данные фокус-персоны с общими показателями по проведенных оценок 360. Такой подход позволяет получить более равномерное распределение в окне Джохари.
        $res += "</tr>";
        $res += "<tr>";
        $res += "<td><div class='opt'><div class='img' set='0' ord='3'></div></div><div class='tx'>Среднее по респонденту</div></td>";
        // hint: Деление данных идет на основе средних показателей оценок каждой фокус-персоны. Позволяет в целом получить равномерное распределение данных в окне Джохари, но нужно не забывать о таком подходе в результате обратной связи, чтобы не запутаться.
        $res += "</tr>";
        $res += "<tr>";
        $res += "<td><div class='opt'><div class='img' set='0' ord='4'></div></div><div class='tx'>Среднее по выборке</div></td>";
        // hint: Деление данных идет на основе средних показателей в выборе текущего опросника. Это дает сравнивать данные в одной группе, но приводит к тому, что у 25 % данные в окнах будут распределены не равномерно. Также эту оценку нельзя применять, если в опросе участвуют люди из разных подразделений.
        $res += "</tr>";
        $res += "</table>";

    $res += "</td></tr></table>";

    $res += "<table class='btn_box' pos='bottom'><tr>";
    $res += "<td><div class='btn' action='back'>Назад</div></td>";
    $res += "<td><div class='btn' action='next'>Сохранить</div></td>";
    $res += "</tr></table>";
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_letter_templated_dropdown(action)
{
    if (action === "add_events")
    {
        $(".letemps_list")
            .off("change")
            .change(function () {
                let ord = $(this).prop("selectedIndex") * 1; // we ignore 1st position cuz of temp_slot there
                if (ord)
                    $(".letter_box").val($pers.letemps_list[ord - 1].tx); // Insert text from a pciked mail template
                else
                    $(".letter_box").val($new_qz.options_temp_letter); // Insert from a store temp text
                content_options_letter_save_tx(); // save tx in current fields to a temp_letter vars (basicly assign them right away)
            });
    }
    else
    {
        let s = "";
        s += "<select class='letemps_list'>";
        s += "<option>Ваш текст письма</option>";
        if ($pers.letemps_list.length)
            $pers.letemps_list.forEach(function (v_letter) {
                s += "<option>"+ v_letter.name +"</option>";
            });
        s += "</select>";
        if (action === "get_html")
        {
            return s;
        }
        else
        if (action === "update_self")
        {
            $(".letemps_list").remove();
            $(".options_letter .btn_box[pos='bottom'] td:nth-child(2)").append(s);
            content_options_letter_templated_dropdown("add_events");
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_letter_screen_set(tag)
{
    if (undefined !== tag)
        $new_qz.options_letter_screen_tag = tag;

    if ($new_qz.options_screen_id === 3)
        $(".options_letter .section").each(function () {
            if ($(this).attr("tag") === $new_qz.options_letter_screen_tag)
                $(this).css("display","block");
            else
                $(this).css("display","none");
        });
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_letter_save_tx()
{
    $new_qz.options_temp_letter = $(".letter_box").val();
    $new_qz.options_temp_letter_head = $(".letter_head").val();
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_3_letter()
{
    $nosel = "onselectstart='return false' ";
    let letter_tx = $default_letter_tx.replace(/%ДАТА%/, decode_timestamp($new_qz.settings.end_date, "no_span"));
    let $res = "<div class='options_letter' "+$nosel+">";

    $res += "<div class='section_box'>";
        $res += "<div class='btn_section' tag='letter'>Пригласительное письмо</div>";
        $res += "<div class='btn_section' tag='intros'>Вступительные тексты</div>";
    $res += "</div>";

    // LETTER SECTION
    $res += "<div class='section' tag='letter'>";

        $res += "<table class='btn_box' pos='top'><tr>";
        $res += "<td><div class='btn' action='save_template'>Сохранить шаблон</div></td>";
        $res += "<td><div class='head'>Отредактировать текст письма рассылки</div><div class='hint'>Текст обязательно должен содержать тэг ##Имя кнопки## .</div></td>";
        $res += "<td><div class='btn' action='reset'>Сбросить</div></td>";
        $res += "</tr></table>";

        $res += "<div class='letter_wnd'>";
            if (!$new_qz.options_temp_letter_head)
                $res += "<textarea class='letter_head'>"+ $default_letter_head +"</textarea>";
            else
                $res += "<textarea class='letter_head'>"+ $new_qz.options_temp_letter_head +"</textarea>";

            $res += "<textarea class='letter_box'>";
            if (!$new_qz.options_temp_letter)
                $res += letter_tx;
            else
            {
                letter_tx = $new_qz.options_temp_letter.replace(/%ДАТА%/, decode_timestamp($new_qz.settings.end_date, "no_span"));
                $res += letter_tx;
            }

            $res += "</textarea>";
        $res += "</div>";

        $res += "<table class='btn_box' pos='bottom'><tr>";
        $res += "<td><div class='btn' action='back'>Назад</div></td>";
        $res += "<td>" +
            "<div  class='letemps_list_head'>Заполнение из шаблона</div>" +
            content_options_letter_templated_dropdown("get_html") +
            "</td>";
        $res += "<td><div class='btn' action='next'>Сохранить</div></td>";
        $res += "</tr></table>";
    $res += "</div>";

    // INTROS SECTION
    $res += "<div class='section' tag='intros'>";

        $res += "<table class='btn_box' pos='top'><tr>";
            //$res += "<td><div class='btn' action='save_template'>Сохранить шаблон</div></td>";
            $res += "<td><div class='head'>Отредактировать текст вступления</div><div class='hint'>Нижнее поле обязательно должно содержать тэг %ФИО%.</div></td>";
            $res += "<td><div class='btn' action='intros_reset'>Сбросить</div></td>";

        $res += "</tr></table>";

        let tx = $new_qz.settings.intro_tx.self.replace(/<br>/g, "\n", $new_qz.settings.intro_tx.self);

    $res += "<div class='legend_wnd'>";
    $res += "<div class='title'>Доступные тэги:</div>" +
        "<b>$текст$</b> - выделение оранжевым;<br>" +
        "<b>#TITLE#</b> - двойной, крупный заголовок;<br>" +
        "<b>#STAR#</b> - двойной, иконка <div class='icon' ></div> звезды;<br>" +
        "<b>#MAN#</b> - двойной, иконка <div class='icon' img='man'></div> человечка;<br>" +
        "<b>#TIME#</b> - двойной, иконка <div class='icon' img='time'></div> часов;<br>" +
        "<b>#NONE#</b> - двойной, текст со смещением;";
    $res += "</div>";


    $res += "<div class='intros_wnd'>";
            $res += "<div class='wnd_label'>Самооценка" +
                "<div class='icon_btn' action='preview_self'></div>" +
                "</div>";
            $res += "<textarea class='intro' tag='self' placeholder='текст для самооценки'>"+ tx +"</textarea>";

            $res += "<div class='wnd_label'>Окружение" +
                "<div class='icon_btn' action='preview_env'></div>" +
                "</div>";
            tx = $new_qz.settings.intro_tx.env.replace(/<br>/g, "\n", $new_qz.settings.intro_tx.env);
            $res += "<textarea class='intro' tag='other' placeholder='текст для респондентов, обязан содержать тэг %ФИО%'>"+ tx +"</textarea>";
        $res += "</div>";

        $res += "<table class='btn_box' pos='bottom'><tr>";
        $res += "<td><div class='btn' action='back'>Назад</div></td>";
        $res += "<td></td>";
        $res += "<td><div class='btn' action='next'>Сохранить</div></td>";
        $res += "</tr></table>";
        $res += "</div>";

    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_4_notify()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='options_notify' "+$nosel+">";
    $res += "<div class='head'>Настройка уведомлений</div>";

    $res += "<table class='rule_points'>";
    $res += "<tr>";
        $res += "<td><div class='chbox' ord='1' set='0'></div></td>";
        $res += "<td><div class='tx'>Уведомление на e-mail об окончании срока опроса.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='2' set='0'></div></td>";
    $res += "<td><div class='tx'>Уведомление на e-mail, что все прошли опрос.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='3' set='0'></div></td>";
    $res += "<td><div class='tx'>Уведомление на e-mail, что <input class='pct' placeholder='10..99%' value='50'>% сотрудников прошли опрос.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='4' set='0'></div></td>";
    $res += "<td><div class='tx'>Ежедневное уведомление на e-mail, о количестве заполненных опросов.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='5' set='0'></div></td>";
    $res += "<td><div class='tx'>Ежегодное уведомление на e-mail, о необходимости повторить оценку.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='6' set='0'></div></td>";
    $res += "<td><div class='tx'>Автоматическая отправка напоминаний сотрудникам, если они не прошли опрос.</div></td>";
    $res += "</tr>";
    $res += "</table>";

    $res += "<table class='period_id'>";
    $res += "<tr>";
    $res += "<td><div class='opt'><div class='img' set='1' ord='1'></div>1 раз в сутки</div></td>";
    $res += "<td><div class='opt'><div class='img' set='0' ord='2'></div>1 раз в 2 суток</div></td>";
    $res += "</tr>";
    $res += "</table>";


    $res += "<table class='btn_box' pos='bottom'><tr>";
    $res += "<td><div class='btn' action='back'>Назад</div></td>";
    $res += "<td><div class='btn' action='next'>Сохранить</div></td>";
    $res += "</tr></table>";
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_5_personify()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='options_personify' "+$nosel+">";
    $res += "<div class='head'>Запросить индивидуальную настройку опроса</div>";
    $res += "<div class='subhead' notice>Стоимость на индивидуальную настройку опроса<br>оговаривается отдельно</div>";
    $res += "<div class='subhead'>Отметьте  настройки, которые вам необходимы, остальные опишите в тексте письма.<br>" +
        "Нажмите кнопку отправить, ответ придет на вашу почту в течении 1-2 рабочих дней.</div>";

    $res += "<table class='feature_points'>";
    $res += "<tr>";
    $res += "<td><div class='chbox' ord='1' set='0'></div></td>";
    $res += "<td><div class='tx'>Добавление логотипа и корпоративного стиля компании в отчет.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='2' set='0'></div></td>";
    $res += "<td><div class='tx'>Возможность оставлять комментарии по фокус-персоне, и отражение их в индивидуальных отчетах.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='3' set='0'></div></td>";
    $res += "<td><div class='tx'>Отдельные отчеты по каждому опросу и консолидированный отчет с разбивкой по проектам за выбранный период (полгода / год).</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='4' set='0'></div></td>";
    $res += "<td><div class='tx'>Индивидуально настраиваемый формат отчета в зависимости от категории сотрудников - фокус-персона, руководитель, HR или других ролей.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='5' set='0'></div></td>";
    $res += "<td><div class='tx'>Возможность в каждом из отчетов визуализировать уровень развития всех компетенций или каждой из них, по сравнению с другими участниками опроса: ниже среднего / среднему / выше среднего.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='6' set='0'></div></td>";
    $res += "<td><div class='tx'>Настройка отчета и системы аналитики на основе пожеланий Заказчика. Выбор диаграммы / системы баллов / формат и формулировки описаний / разбивка по блокам / выгрузка сырых баллов / ответы на вопросы.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='7' set='0'></div></td>";
    $res += "<td><div class='tx'>Сравнение оценок, если опрос проводится повторно.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='8' set='0'></div></td>";
    $res += "<td><div class='tx'>Оценка “под ключ”, внесение данных в информационную систему и мониторинг процесса оценки, выгрузка отчетов. Все осуществляется Исполнителем, Заказчик получает результаты и доступ к аналитике.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='9' set='0'></div></td>";
    $res += "<td><div class='tx'>Включение индивидуальных планов развития в отчеты участников.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td><div class='chbox' ord='10' set='0'></div></td>";
    $res += "<td><div class='tx'>Построение кадрового резерва.</div></td>";
    $res += "</tr>";

    $res += "<tr>";
    $res += "<td colspan='2' comment><textarea class='comment' placeholder='Напишите здесь свои пожелания относительно дополнительных настроек системы.'></textarea></td>";
    $res += "</tr>";
    $res += "</table>";

    $res += "<table class='btn_box' pos='bottom'><tr>";
    $res += "<td><div class='btn' action='back'>Назад</div></td>";
    $res += "<td><div class='btn' action='send'>Отправить</div></td>";
    //$res += "<td><div class='notify'>Письмо с Вашими настройками будет выслано</div></td>";
    $res += "<td><div class='btn' action='next'>Продолжить</div></td>";
    $res += "</tr></table>";
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_6_finalize()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='options_finalize' "+$nosel+">";
    $res += "<div class='head'>Вы выполнили полную настройку оценки.<br>" +
        " </div>";

    $res += "<div class='subhead'>Запустите опрос, чтобы начать процедуру оценки <br>" +
        "и перейти в следующий раздел <br>" +
        "для мониторинга прохождения и результатов оценки.</div>";

    $res += "<table class='btn_box' pos='mid'><tr>";
    $res += "<td><div class='btn' action='start'>Запустить опрос</div></td>";
    $res += "</tr></table>";

    $res += "<div class='subhead' notice>В запущенном опросе какие-либо параметры изменить нельзя.";//<br>"+
        //"Вы можете вернуться в один из разделов, чтобы проверить параметры настроек.</div>";

    //$res += "<table class='btn_box' pos='bottom'><tr>";
    //$res += "<td><div class='btn' action='back'>Назад</div></td>";
    //$res += "</tr></table>";
    $res += "</div>";
    return $res;
}



//----------------------------------------------------------------------------------------------------------------------
function content_options_feedback_list_update(action, specs)
{
    if (action === "add_events")
    {
        $(".btn_add_fb_line")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Добавить вопрос",
                    tx: "Добавляет еще один вопрос в конце списка, не забудьте написать текст вопроса в окно ввода.",
                    w: 400,
                    dx: -100,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let bath_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;

                let group = $new_qz.settings.comm_groups[bath_ord];
                let q_list, lock_list;
                if (type === "qz")
                {
                    q_list = group.qz_list; // qz questions list
                    if (!group.hasOwnProperty("lock_qz_list"))
                        group.lock_qz_list = [];
                    lock_list = group.lock_qz_list;
                }
                else
                {
                    if (!group.hasOwnProperty("lock_comp_list"))
                        group.lock_comp_list = [];

                    if (null === group.comp_list[id])
                    {
                        group.comp_list[id] = [];
                        group.lock_comp_list[id] = [];
                    }

                    q_list = group.comp_list[id]; // comp questions list
                    lock_list = group.lock_comp_list[id];
                }
                //console.log("id " + id);
                //console.log(lock_list);

                let qnt = q_list.length;
                q_list.push(""); // add new empty line
                lock_list.push(0);

                let s = "";
                s += "<tr ord='"+ qnt +"'>";
                    s += "<td>" +
                        (qnt + 1) +". "+
                        "<div class='lock_btn' is_locked='0'></div>" +
                        "</td>";
                    s += "<td class='line'><input type='text' placeholder='..текст вопроса..'></td>";
                    s += "<td><div class='btn_del_fb_line'>удалить</div></td>";
                s += "</tr>";

                $(this).closest(".feedback_list").append(s);
                content_options_feedback_list_update("add_events", null);
            });

        $(".feedback_list .line input").off("change")
            .change(function(){
                let bath_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;
                let q_list;
                let group = $new_qz.settings.comm_groups[bath_ord];
                if (type === "qz")
                    q_list = group.qz_list; // qz questions list
                else
                    q_list = group.comp_list[id]; // comp questions list

                let comment_line_ord = $(this).closest("tr").attr("ord") * 1; // comment line order
                q_list[comment_line_ord] = $(this).val();
            });

        $(".feedback_list .btn_del_fb_line").off("click")
            .click(function(){
                let bath_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;

                let group = $new_qz.settings.comm_groups[bath_ord];
                let q_list, lock_list;
                if (type === "qz")
                {
                    q_list = group.qz_list; // qz questions list
                    lock_list = group.lock_qz_list; // qz questions list
                }
                else
                {
                    q_list = group.comp_list[id]; // comp questions list
                    lock_list = group.lock_comp_list[id]; // qz questions list
                }


                let comment_line_ord = $(this).closest("tr").attr("ord") * 1; // comment line order
                q_list.splice(comment_line_ord, 1);
                lock_list.splice(comment_line_ord, 1);
                content_options_feedback_list_update("update_self", {type:type, id:id, batch_ord:bath_ord});
            });

        $(".feedback_list .lock_btn").off("click")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Обязательно к заполнению",
                    tx: "Нажмите чтобы вкл./выкл. обязательность этого комментария к заполнению.<br>Серый замочек - не обязательно, синий - обязательно.",
                    w: 400,
                    dx: -100,
                    dy: 20,
                });
            })
            .click(function(){
                let bath_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;
                let new_state = $(this).attr("is_locked") * 1;
                new_state = Math.abs(new_state - 1); // revert state
                $(this).attr("is_locked", new_state);

                let group = $new_qz.settings.comm_groups[bath_ord];
                let lock_list;
                if (type === "qz")
                    lock_list = group.lock_qz_list; // qz questions list
                else
                    lock_list = group.lock_comp_list[id]; // qz questions list

                let comment_line_ord = $(this).closest("tr").attr("ord") * 1; // comment line order
                lock_list[comment_line_ord] =  new_state;
                content_options_feedback_list_update("update_self", {type:type, id:id, batch_ord:bath_ord});
            });
    }
    else
    {
        let head_name = "";
        let q_list, lock_list;
        let group = $new_qz.settings.comm_groups[specs.batch_ord];
        if (specs.type === "qz")
        {
            head_name = "Задать после опроса";
            q_list = group.qz_list; // qz questions list
            lock_list = group.lock_qz_list;
        }
        else
        {
            head_name = "Задать после компетенции";
            q_list = group.comp_list[specs.id]; // comp questions list
            lock_list = group.lock_comp_list[specs.id];
        }

        let s = "";
        s += "<tr>";
        s += "<td colspan='3' class='head'><div class='btn_add_fb_line'></div>"+ head_name +"</td>";
        s += "</tr>";

        if (q_list)
            q_list.forEach(function (v, i) {
                s += "<tr ord='"+i+"'>";
                s += "<td>" +
                    (i + 1) +". "+
                    "<div class='lock_btn' is_locked='"+ lock_list[i] +"'></div>" +
                    "</td>";

                s += "<td class='line'><input type='text' value='"+ v +"' placeholder='..текст вопроса..'></td>";
                s += "<td><div class='btn_del_fb_line'>удалить</div></td>";

                s += "</tr>";
            });

        if (action === "get_html")
        {
            return s;
        }
        else
        if (action === "update_self")
        {
            let path = ".after_comp";
            if (specs.type === "qz")
                path = ".after_qz";

            $(".comm_group[batch_ord='"+ specs.batch_ord +"'] "+ path +" .feedback_list[id='"+ specs.id +"']")
                .empty()
                .append(s);
            content_options_feedback_list_update("add_events", null);
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_5_feedback()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='options_personify' "+$nosel+">";
    $res += "<div class='head'>Настройка комментариев</div>";
    $res += "<div class='subhead'>У респондентов будет возможность оставить комментарии на указанные вопросы</div>"; // <div class='subhead' notice>

    /*
    let opt_labels = ["спрашивать после опроса","спрашивать после каждой компетенций","спрашивать после каждого вопроса"];
    $res += "<table class='sets_box'>";
    let picked = [null,1,0,0];
    for (let i=1; i<opt_labels.length+1; i++)
    {
        $res += "<tr>";
            $res += "<td>";
                $res += "<div class='set' set_id='"+i+"' is_picked='"+picked[i]+"'>";
                $res += "<div class='opt'>";
                    $res += "<div class='switch'></div>";
                    $res += "<div class='label'>" + opt_labels[i-1] + "</div>";
                $res += "</div>";
                $res += "</div>";
            $res += "</td>";
        $res += "</tr>";
    }
    $res += "</table>";
    */
    $new_qz.deli_list.forEach(function (v_gr, i_gr) {
        $res += "<div class='comm_group' batch_ord='"+ i_gr +"'>";
            $res += "<div class='head'>"+
                    "<div class='btn_after_qz' is_on='0'></div>" +
                    "<div class='btn_after_comp' is_on='0'></div>" +
                    "<span class='label'>фокус-группа </span>" +
                    v_gr[0].fio +
                "</div>";

            $res += "<div class='after_qz'>";
                $res += "<table class='feedback_list' type='qz' id='0'>";
                $res += content_options_feedback_list_update("get_html", {type:"qz", id:0, batch_ord:i_gr});
                $res += "</table>";
            $res += "</div>";

            $res += "<div class='after_comp'>";
                let qb_id = $new_qz.settings.comm_groups[i_gr].qb_id;
                let qb_ord = get_qb_ord_from_qb_id(qb_id);
                let qst_list = $ad.qbooks[qb_ord].list;
                let comp_list = get_comp_id_list_from_qst_list(qst_list);
                let comp_info_list = []; // list of names and ords of comps for later use
                comp_list.forEach(function (v_cid, i_cid) {
                    for (let i=0; i<=$ad.comps.length; i++)
                        if (v_cid === $ad.comps[i].id)
                        {
                            let slot = {
                                id: v_cid,
                                ord: i_cid,
                                name: $ad.comps[i].name
                            };
                            comp_info_list.push(slot);
                            break;
                        }
                });
                // Build comp blocks

                comp_info_list.forEach(function (v_comp) {
                    $res += "<div class='head'>"+
                            "<span class='label'>компетенция </span>" +
                            v_comp.name +
                        "</div>";
                    $res += "<table class='feedback_list' type='comp' id='"+ v_comp.id +"'>";
                        $res += content_options_feedback_list_update("get_html", {type:"comp", id:v_comp.id, batch_ord:i_gr});
                    $res += "</table>";
                });

            $res += "</div>";
        $res += "</div>";
    });


    $res += "<table class='btn_box' pos='bottom'><tr>";
    $res += "<td><div class='btn' action='back'>Назад</div></td>";
    //$res += "<td><div class='notify'>Письмо с Вашими настройками будет выслано</div></td>";
    $res += "<td><div class='btn' action='next'>Продолжить</div></td>";
    $res += "</tr></table>";
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_chk_empty_comment_lines()
{
    let found = false;
    let groups_qnt = $new_qz.settings.comm_groups.length;
    for (let gr=0; gr<groups_qnt; gr++)
    {
        let group = $new_qz.settings.comm_groups[gr];
        if (group.qz_after)
        {
            // Seek empty qz lines
            let qz_qsts_qnt = group.qz_list.length;
            if (qz_qsts_qnt)
                for (let i=0; i<qz_qsts_qnt; i++)
                    if (!group.qz_list[i])
                    {
                        found = true;
                        break;
                    }
        }

        if (group.comp_after) {
            // Seek empty comp lines
            let comp_qsts_qnt = group.comp_list.length;
            if (comp_qsts_qnt)
                Object.keys(group.comp_list).map(function (key) {
                    let slot = group.comp_list[key];
                    if (null !== slot && slot.length)
                        for (let i = 0; i < slot.length; i++)
                            if (!slot[i]) {
                                found = true;
                                break;
                            }
                });
        }

        if (found)
            break;
    }

    return found;
}


//----------------------------------------------------------------------------------------------------------------------
function get_personal_settings() {
    let form = {};
    form.personify_list = duplicate($new_qz.settings.personify_list);
    form.comment = strip_tags($new_qz.settings.personify_comment.trim());
    form.chk_summ = 0;
    form.personify_list.forEach(function (v) {
        form.chk_summ += v;
    });

    if (form.comment)
        form.chk_summ++;
    return form;
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_events()
{
    if ($new_qz.options_screen_id === 1)
        content_options_build_watchers_list("add_events");
    else
    if ($new_qz.options_screen_id === 3)
        content_options_letter_templated_dropdown("add_events");

    // *****************************************     SCREEN 1     ******************************************************

    // Access id pick
    $(".access_box .opt .img")
        .off("click")
        .click(function(){
            let ord = $(this).attr("ord") *1;
            // All to default
            $(".access_box .opt .img")
                .attr("set", 0)
                .css("background-image","url('img/Opt_0.png')");

            $(this)
                .attr("set", 1)
                .css("background-image","url('img/Opt_1.png')");
            $new_qz.settings.access_id = ord;
        });

    $(".options_access .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {

                case "back":
                    new_qz_tab_progress(3);
                    show_content("deli_set");
                    break;

                case "send_invite":
                    let form = {};
                    //form.list = [];
                    form.access_id = $(".access_box .opt .img[set='1']").attr("ord")*1;
                    form.mail = clean_text($(".access_box .mail").val());
                    form.host_mail = $pers.mail;
                    form.last_log = null;

                    if (!form.mail || !validate_email(form.mail))
                        message_ex("show","info","direct_full",{
                            "head": "Создание наблюдателя",
                            "tx": "Пожалуйста, укажите валидный почтовый адрес наблюдателя."});
                    else
                    {
                        $new_qz.watchers_list.push(form);
                        content_options_build_watchers_list("update_self");
                        /*
                        message_ex("show","info","direct_full",{
                            "head": "Создание наблюдателя",
                            "tx": "Приглашение назначено. Письма будут разосланы сразу после запуска опроса."});
                            */
                        message_ex("show","info","direct_full",{
                            "head": "Создание наблюдателя",
                            "tx": "Приглашение отправлено."});
                        sendAJ("watcher_add", JSON.stringify(form));
                    }
                    /*
                    if (!form.mail || !validate_email(form.mail))
                        message_ex("show","info","direct_full",{
                            "head": "Создание наблюдателя",
                            "tx": "Пожалуйста, укажите валидный почтовый адрес наблюдателя."});
                    else
                    */
                        //sendAJ("watcher_add", JSON.stringify(form));

                    break;

                // To 2nd tab (scales)
                case "next":
                    content_options_tabs_progress(2);
                    show_content("options");
                    break;
            }
        });

    // *****************************************     SCREEN 2     ******************************************************

    // Scale id pick
    $(".options_scales .scales_box .opt .img[ord='"+$new_qz.settings.scale_id+"']").attr("set", 1); // Select picked scales id
    $(".options_scales .scales_box .opt .img")
        .off("click")
        .click(function(){
            let ord = $(this).attr("ord") *1;
            // All to default
            $(".options_scales .scales_box  .opt .img")
                .attr("set", 0)
                .css("background-image","url('img/Opt_0.png')");

            $(this)
                .attr("set", 1)
                .css("background-image","url('img/Opt_1.png')");
            $new_qz.settings.scale_id = ord;
        });


    // Calculation midpoint pick
    $(".options_scales .djo_avg_box .subhead")
        .off("mouseenter").off("mouseleave").mouseleave(function() {$(".floater").css("display", "none").html("");})
        .mouseenter(function()
        {
            let head = "окно Джохари",
                cont = "Матрица, показывающая взаимосвязь между личными качествами и тем, как их видит окружение";
            let tx = "<div class='head'>" + head + "</div>" + cont;

            $(".floater")
                .css("display", "inline-block")
                .css("width", "400px")
                //.css("height", "350px")
                .css("left", ($curs.x-420)+"px")
                .css("top", $curs.y+"px")
                .css("border-color", "#4A67AD")
                .html(tx);
        });

    // Calculation midpoint pick
    $(".options_scales .djo_avg_box .opt .img[ord='"+$new_qz.settings.djo_avg_id+"']").attr("set", 1); // Select picked djohara avg point id
    $(".options_scales .djo_avg_box .opt .img")
        .off("mouseenter").off("mouseleave").mouseleave(function() {$(".floater").css("display", "none").html("");})
        .mouseenter(function()
        {
            let desc_bank = [null,
                "Деление данных в матрице идет по среднему строго математически - 50 на 50, но обычно данные в окне Джохари смещаются в одну из частей окна.",
                "Деление данные идет с имперической поправкой, полученной в ходе более 1200 оценок. Она позволяет сравнивать данные фокус-персоны с общими показателями по проведенных оценок 360. Такой подход позволяет получить более равномерное распределение в окне Джохари.",
                "Деление данных идет на основе средних показателей оценок каждой фокус-персоны. Позволяет в целом получить равномерное распределение данных в окне Джохари, но нужно не забывать о таком подходе в результате обратной связи, чтобы не запутаться.",
                "Деление данных идет на основе средних показателей в выборе текущего опросника. Это дает сравнивать данные в одной группе, но приводит к тому, что у 25 % данные в окнах будут распределены не равномерно. Также эту оценку нельзя применять, если в опросе участвуют люди из разных подразделений."
            ];
            let ord = $(this).attr("ord")*1;

            let head = "Тип отражения данных",
                cont = desc_bank[ord];
            let tx = "<div class='head'>" + head + "</div>" + cont;

            $(".floater")
                .css("display", "inline-block")
                .css("width", "400px")
                //.css("height", "350px")
                .css("left", ($curs.x-420)+"px")
                .css("top", $curs.y+"px")
                .css("border-color", "#4A67AD")
                .html(tx);
        })
        .off("click")
        .click(function(){
            let ord = $(this).attr("ord") *1;
            // All to default
            $(".options_scales .djo_avg_box  .opt .img")
                .attr("set", 0)
                .css("background-image","url('img/Opt_0.png')");

            $(this)
                .attr("set", 1)
                .css("background-image","url('img/Opt_1.png')");
            $new_qz.settings.djo_avg_id = ord;
        });

    $(".options_scales .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {

                case "back":
                    //content_options_tabs_progress(1);
                    show_content("deli");
                    break;

                // To 3rd tab (letter)
                case "next":
                    content_options_tabs_progress(3);
                    show_content("options");
                    break;
            }
        });

    // *****************************************     SCREEN 3     ******************************************************

    content_options_letter_screen_set(); // set the selected letter screen

    // Scale id pick
    $(".options_letter .intros_wnd .intro")
        .off("keyup")
        .keyup(function(){
            let tag = $(this).attr("tag");
            if (tag === "self")
                $new_qz.settings.intro_tx.self = $(this).val();
            else
            if (tag === "other")
                $new_qz.settings.intro_tx.env = $(this).val();
        });

    $(".options_letter .intros_wnd .icon_btn")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
        .mouseenter(function()
        {
            floater_hint("show",{
                head: "Предпросмотр",
                tx: "Нажмите, чтобы увидеть предпросмотр вступительного текста каким его увидит респондент.",
                w: 400,
                dx: -200,
                dy: 20,
            });
        })
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            let tx = "";
            if ("preview_self" === action)
            {
                tx = $(".intro[tag='self']").val();
            }
            else
            {
                tx = $(".intro[tag='other']").val();
            }
            message_ex("show","info","intro_preview",{tx:tx});
        });

    $(".options_letter .section_box .btn_section").off("click")
        .click(function () {
            let tag = $(this).attr("tag");
            content_options_letter_screen_set(tag);
        });

    // Scale id pick
    $(".letter_box")
        .off("keyup")
        .keyup(function(){
            if (!$(".letemps_list").prop("selectedIndex") * 1)
            {
                content_options_letter_save_tx();
                //$new_qz.options_temp_letter = $(this).val(); // save all changes while in temp_slot of letters
                //$new_qz.options_temp_letter_head = $(".letter_head").val(); // save all changes while in temp_slot of letters
            }
        });

    $(".options_letter .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {

                case "intros_reset":
                    $(".options_letter .intros_wnd .intro[tag='self']").val(default_intro_self.replace(/<br>/g,"\n"));
                    $(".options_letter .intros_wnd .intro[tag='other']").val(default_intro_other.replace(/<br>/g,"\n"));
                    $session.presets_set();
                    break;

                case "reset":
                    let letter_tx = replace(/%ДАТА%/, decode_timestamp($new_qz.settings.end_date));
                    $(".letter_box").val(letter_tx);
                    $(".letter_head").val($default_letter_head);
                    content_options_letter_save_tx();
                    break;

                case "save_template":
                    let form = {};
                    form.name = "";
                    if ($(".letemps_list").prop("selectedIndex") * 1)
                        form.name = $(".letemps_list").val();
                    form.tx = $(".letter_box").val();
                    form.head = $(".letter_head").val();

                    message_ex("show","insert","letter_template_save",form);
                    break;

                case "back":
                    content_options_tabs_progress(2);
                    show_content("options");
                    break;

                // To 4rd tab (notices)
                case "next":
                    content_options_letter_save_tx();
                    let parts = $new_qz.options_temp_letter.split("##");
                    if (parts.length !== 3)
                        message_ex("show","info","direct","Текст письма обязательно должен содержать тэг <b>##Имя конпки##</b>");
                    else
                    {
                        let btn_label = parts[1];
                        if (!btn_label)
                            message_ex("show","info","direct","Имя кнопки не указано - напечатайте, например, \"начать\" или \"перейти\" между символами ## (вот в таком виде ##Перейти##).");
                        else
                        if ($new_qz.settings.intro_tx.env.indexOf("%ФИО%") === -1)
                            message_ex("show","info","direct","Вступительный текст для респондентов (нижнее окно в секции \"Вступительные тексты\") обязательно должен содержать тэг <b>%ФИО%</b>.");
                        else
                        {
                            $session.presets_set();
                            content_options_tabs_progress(4);
                            show_content("options");
                        }
                    }

                    break;
            }
        });

    // *****************************************     SCREEN 4     ******************************************************

    $(".options_notify .pct")
        .off("change")
        .change(function(){
            let val = Math.floor($(this).val() * 1);

            if (val > 99)
                $(this).val(99);
            else
            if (val < 10)
                $(this).val(10);
            else
                $(this).val(Math.floor(val));
        });

    // Periodity id pick
    /*
    $(".options_notify .chbox")
        .off("click")
        .click(function(){
            let ord = $(this).attr("ord") * 1 - 1;

            if ($(this).attr("set")*1) // turn off
            {
                $(this).attr("set", 0);
                $new_qz.settings.notice_list[ord] = 0;
            }
            else
            {
                $(this).attr("set", 1);
                $new_qz.settings.notice_list[ord] = 1;
            }
        });
    */

    // Fill chboxes from session
    $(".options_notify .chbox").each(function (index) {
        $(this)
            .off("click")
            .attr("set", $new_qz.settings.notice_list[index])
            .click(function(){
                let ord = $(this).attr("ord") * 1 - 1;

                if ($(this).attr("set")*1) // turn off
                {
                    $(this).attr("set", 0);
                    $new_qz.settings.notice_list[ord] = 0;
                }
                else
                {
                    $(this).attr("set", 1);
                    $new_qz.settings.notice_list[ord] = 1;
                }
            })
    });

    // Periodity id pick
    $(".options_notify .opt .img")
        .off("click")
        .click(function(){
            let ord = $(this).attr("ord") *1;
            // All to default
            $(".options_notify .opt .img")
                .attr("set", 0)
                .css("background-image","url('img/Opt_0.png')");

            $(this)
                .attr("set", 1)
                .css("background-image","url('img/Opt_1.png')");
            $new_qz.settings.notice_period_id = ord;
        });

    // Select picked periodity id
    $(".options_notify .opt .img[ord='"+$new_qz.settings.notice_period_id+"']").attr("set", 1);

    $(".options_notify .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {
                case "back":
                    content_options_tabs_progress(3);
                    show_content("options");
                    break;

                // To 4rd tab (notices)
                case "next":
                    $new_qz.settings.notice_pct = Math.floor($(".options_notify .rule_points .pct").val() * 1);
                    if ($new_qz.settings.notice_pct >= 100)
                        $new_qz.settings.notice_pct = 99;
                    else
                    if ($new_qz.settings.notice_pct < 10)
                        $new_qz.settings.notice_pct = 10;

                    content_options_tabs_progress(5);
                    // content_options_tabs_progress(6); // content_options_tabs_progress(5);
                    show_content("options");
                    break;
            }
        });

    // *****************************************     SCREEN 5     ******************************************************

    $(".options_personify .chbox").each(function (index) {
        $(this)
            .off("click")
            .attr("set", $new_qz.settings.personify_list[index]) // Fill chboxes from session
            .click(function(){
                let ord = $(this).attr("ord") * 1 - 1;

                if ($(this).attr("set")*1) // turn off
                {
                    $(this).attr("set", 0);
                    $new_qz.settings.personify_list[ord] = 0;
                }
                else
                {
                    $(this).attr("set", 1);
                    $new_qz.settings.personify_list[ord] = 1;
                }
            })
    });

    // Select picked periodity id
    $(".options_personify .comment")
        .val($new_qz.settings.personify_comment)
        .off("change")
        .change(function(){
            $new_qz.settings.personify_comment = strip_tags($(this).val().trim());
        });

    $(".options_personify .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {
                case "send":
                    let form = get_personal_settings();
                    if (form.chk_summ)
                    {
                        sendAJ("personify_mail", JSON.stringify(form));
                        personify_settings_sent = true;
                    }
                    else
                        message_ex("show","info","direct_full",{head:"Отправка персональных настроек опроса", tx: "Невозможно отправить пустой набор настроек."});
                    break;

                case "back":
                    content_options_tabs_progress(4);
                    show_content("options");
                    break;

                // To 6rd tab (finalization)
                case "next":
                    $new_qz.settings.letter = $new_qz.options_temp_letter;
                    $new_qz.settings.letter_head = $new_qz.options_temp_letter_head;

                    // In case user checked some stuff and forgot to press the "send" button
                    let personify_data = get_personal_settings();
                    if (personify_data.chk_summ && !personify_settings_sent)
                        sendAJ("personify_mail", JSON.stringify(personify_data));
                    // Check empty comment lines
                    if (content_options_chk_empty_comment_lines())
                        message_ex("show", "info", "direct_full", {head:"Пустые строки вопросов", tx:"Ваш блок комментариев содержит пусте строки - удалите их или введите текст задаваемого вопроса."});
                    else
                    {
                        content_options_tabs_progress(6);
                        show_content("options");
                    }
                    break;
            }
        });

    $(".options_personify .btn_after_qz")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
        .mouseenter(function()
        {
            floater_hint("show",{
                head: "Вопросы после опроса",
                tx: "Вкл./выкл. вопросы после опроса.",
                w: 400,
                dx: -200,
                dy: 20,
            });
        })
        .off("click")
        .click(function(){
            let bath_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
            let group = $new_qz.settings.comm_groups[bath_ord];
            if (group.qz_after)
            {
                $new_qz.settings.comm_groups[bath_ord].qz_after = false;
                $(this).closest(".comm_group").find(".after_qz").css("display","none");
                $(this).attr("is_on", "0");
            }
            else
            {
                $new_qz.settings.comm_groups[bath_ord].qz_after = true;
                $(this).closest(".comm_group").find(".after_qz").css("display","block");
                $(this).attr("is_on", "1");
            }
        });

    $(".options_personify .btn_after_comp")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
        .mouseenter(function()
        {
            floater_hint("show",{
                head: "Вопросы после компетенций",
                tx: "Вкл./выкл. вопросы после компетенций, индивидуально.",
                w: 400,
                dx: -200,
                dy: 20,
            });
        })
        .off("click")
        .click(function(){
            let bath_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
            let group = $new_qz.settings.comm_groups[bath_ord];
            if (group.comp_after)
            {
                $new_qz.settings.comm_groups[bath_ord].comp_after = false;
                $(this).closest(".comm_group").find(".after_comp").css("display","none");
                $(this).attr("is_on", "0");
            }
            else
            {
                $new_qz.settings.comm_groups[bath_ord].comp_after = true;
                $(this).closest(".comm_group").find(".after_comp").css("display","block");
                $(this).attr("is_on", "1");
            }
        });

    // Turn on comment blocks + paint the btn icons if already enabled
    $(".options_personify .comm_group").each(function () {
        let batch_ord = $(this).attr("batch_ord") * 1;
        let group = $new_qz.settings.comm_groups[batch_ord];
        if (group.qz_after)
        {
            $(this).find(".after_qz").css("display","block");
            $(this).find(".btn_after_qz").attr("is_on", "1");
        }

        if (group.comp_after)
        {
            $(this).find(".after_comp").css("display","block");
            $(this).find(".btn_after_comp").attr("is_on", "1");
        }
    });

    content_options_feedback_list_update("add_events", null);
    // *****************************************     SCREEN 6     ******************************************************


    $(".options_finalize .btn_box .btn")
        .off("click")
        .click(function(){
            let action = $(this).attr("action");
            switch (action) {

                case "back":
                    content_options_tabs_progress(5);
                    // content_options_tabs_progress(4); // content_options_tabs_progress(5);
                    show_content("options");
                    break;

                // To 6rd tab (finalization)
                case "start":
                    let form = duplicate($new_qz);

                    form.qst_list.forEach(function (v,i) {
                        form.qst_list[i] = form.qst_list[i].id; // Cut qst_list to only their global ids
                    });

                    form.deli_list.forEach(function (v_group,i_group) {
                        v_group.forEach(function (v_resp,i_resp) {
                            let slot = {};
                            slot.id = form.deli_list[i_group][i_resp].id;
                            slot.cat_id = form.deli_list[i_group][i_resp].cat_id;
                            form.deli_list[i_group][i_resp] = duplicate(slot); // Same for focus groups, leave only id + cat_id
                        });
                    });
                    //console.log("sent_qz_form");
                    //console.log(form);
                    message_ex("show","holder","direct","Опрос в процессе создания.<br>Создаются записи и рассылаются приглашения.<br>Пожалуйста, ожидайте.");
                    sendAJ("qz_create", JSON.stringify(form));
                    break;
            }
        });
}



//----------------------------------------------------------------------------------------------------------------------
function content_options_tabs()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='options_tabs_box' "+$nosel+">";
        //$res += "<div class='tab' tag='access' ord='1' "+$nosel+">Уровни<br>доступа</div>";
        $res += "<div class='tab' tag='scales' ord='2' "+$nosel+">Настройка<br>оценок</div>";
        $res += "<div class='tab' tag='letter' ord='3' "+$nosel+">Отредактировать<br>текст письма</div>";
        $res += "<div class='tab' tag='notice' ord='4' "+$nosel+">Настройка<br>уведомлений</div>";
        $res += "<div class='tab' tag='personalize' ord='5' "+$nosel+">Настройка<br>комментариев</div>";
        //$res += "<div class='tab' tag='personalize' ord='5' "+$nosel+">Запросить<br>индивидуальные<br>настройки оценки</div>";
    $res += "</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_tabs_update() {
    // Selected tab appearance to custom
    $(".options_tabs_box .tab").each(function (index) {
        if ($(this).attr("ord")*1 === $new_qz.options_screen_id)
        {
            $(this).css("background-color","#D5DDEF");
        }
        else if ($(this).attr("ord") <= $new_qz.options_screen_id_max)
        {
            $(this).css("background-color","#EFEFEF");
        }
        else
        {
            $(this).css("background-color","white");
        }
    });
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_tabs_progress(val) {
    if (val)
    {
        $new_qz.options_screen_id = val;
        if ($new_qz.options_screen_id > $new_qz.options_screen_id_max)
            $new_qz.options_screen_id_max = $new_qz.options_screen_id;
        $session.set();
    }
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_tabs_events()
{
    content_options_tabs_update();
    focus_groups_update();

    $(".options_tabs_box .tab")
        .off("click")
        .click(function()
        {
            let ord = $(this).attr("ord") * 1;
            // Must be dublicated here for selected tabs to change clrs correctly
            if (ord === 1 || ord <= $new_qz.options_screen_id_max)
            {
                content_options_tabs_progress(ord);
                show_content("options");
                $session.set();
            }
        });
}
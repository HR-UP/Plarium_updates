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

let oqt_db = {
    gr_ord: null
};
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
function content_options_5_feedback()
{
    $nosel = "onselectstart='return false' ";
    let $res = "<div class='options_personify' "+$nosel+">";
    $res += "<div class='head'>";
    $res += "<div class='btn_oqt_save'></div>";
    $res += "<div class='btn_oqt_database'></div>";

    $res += "<span class='tx'>Настройка комментариев</span>";
    $res += "</div>";
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
    $res += feedback_list_build("get_html");


    $res += "<table class='btn_box' pos='bottom'><tr>";
    $res += "<td><div class='btn' action='back'>Назад</div></td>";
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
function feedback_update_cat_textarea(tx, batch_ord, qst_ord, type, id, cat_id)
{
    /*
    console.log("cat_ta change",{
        batch_ord:batch_ord,
        type: type,
        id: id,
        qst_ord: qst_ord,
        cat_id: cat_id,
        tx: tx
    });
    */
    let group = $new_qz.settings.comm_groups[batch_ord];
    let slot;
    if (type === "qz")
    {
        slot = group.qz_cats_list[qst_ord][cat_id]; // qz questions list
    }
    else
    {
        slot = group.comp_cats_list[id][qst_ord][cat_id]; // qz questions list
    }

    //console.log("slot",slot);
    slot.tx = tx;
    feedback_buffer("save");
}

//----------------------------------------------------------------------------------------------------------------------
function feedback_list_build(action)
{
    let $res = "";
    $new_qz.deli_list.forEach(function (v_gr, i_gr) {
        $res += "<div class='comm_group' batch_ord='"+ i_gr +"'>";
        $res += "<div class='head'>"+
            "<div class='btn_after_qz' is_on='0'></div>" +
            "<div class='btn_after_comp' is_on='0'></div>" +
            "<span class='btch_name'>"+ v_gr[0].fio +"</span>" +
            "<div class='btn_focus' is_on='0'></div>" +
            "</div>";

        $res += "<div class='after_qz'>";
        $res += "<table class='feedback_list' type='qz' id='0'>";
        $res += content_options_feedback_list_update("get_html", {type:"qz", id:0, batch_ord:i_gr});
        $res += "</table>";
        $res += "</div>";

        $res += "<div class='after_comp'>";
        // Get all BLUE mandatory comps
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
            $res += content_options_feedback_list_update("add_comp_box", {
                batch_ord: i_gr,
                comp_id: v_comp.id,
                comp_name: v_comp.name,
            });
        });

        // Get all reds
        let comm_gr = $new_qz.settings.comm_groups[i_gr];
        if (obj_len(comm_gr.comp_list))
            Object.keys(comm_gr.comp_list).map(function (k) {
                let comp_id = k * 1;
                if (comp_list.indexOf(comp_id) === -1 && // do not duplicate the blue ones
                    typeof comm_gr.comp_list[k] === "object" && // comp format is solid
                    obj_len(comm_gr.comp_list[k]))
                {
                    $res += content_options_feedback_list_update("add_comp_box", {
                        batch_ord: i_gr,
                        comp_id: comp_id,
                        comp_name: $ad.comps[get_comp_ord_from_comp_id(comp_id)].name,
                        is_red: 1
                    });
                }

            });



        $res += "</div>";
        $res += "</div>";
    });

    switch (action){
        case "get_html":
            return $res;

        case "update_self":
            $(".comm_group").remove(); // remove old
            $(".options_personify .subhead").after($res); // draw new
            content_options_feedback_list_update("add_events", null); // hook events
            break;
    }
}
//----------------------------------------------------------------------------------------------------------------------
function content_options_feedback_list_update(action, specs)
{
    if (action === "add_cats_fields")
    {
        let com_gr = $new_qz.settings.comm_groups[specs.batch_ord];
        let q_ord = specs.qst_ord;

        let s = "<div class='cats_line'>";
        let order_of_comps = [0,4,3,5,1];
        let slots_tx = [];

        Object.keys(g_cats_name_list_short).map(function (k) {
            let str = "";
            let cat_name = g_cats_name_list_short[k];
            let cat_id = k;
            let tx = "", is_on = 1;

            if ("qz" === specs.type)
            {
                tx = com_gr.qz_cats_list[q_ord][cat_id].tx;
                is_on = com_gr.qz_cats_list[q_ord][cat_id].is_on
            }
            else
            {
                tx = com_gr.comp_cats_list[specs.id][q_ord][cat_id].tx;
                is_on = com_gr.comp_cats_list[specs.id][q_ord][cat_id].is_on;
            }

            str += "<div class='cat_box' cid='"+ cat_id +"'>";
            str += "<div>" +
                    "<span  class='label'>" + cat_name + "</span>" +
                    "<div class='btn_switch' is_on='"+ is_on +"'></div>" +
                    "</div>";
            str += "<textarea class='cat_ta'>"+ tx +"</textarea>";
            str += "</div>";

            let index_order = order_of_comps.indexOf(k*1);
            if (-1 !== index_order)
                slots_tx[index_order] = str;
        });
        slots_tx.forEach(function (v_tx) {
            s += v_tx;
        });
        s += "</div>";
        return s;
    }
    else
    if (action === "add_comp_box")
    {
        let $res = "<div class='head' feedback_list red='"+ specs.is_red +"' type='comp' id='"+ specs.comp_id +"'>"+
            "<div class='btn_add_fb_line'></div>" +
            "<span class='label'>компетенция </span>" +
            specs.comp_name;

        if (specs.is_red) // add delete btn
        {
            $res += "<div class='btn_fb_del_comp'></div>";
        }

        $res +="</div>";


        $res += "<table class='feedback_list' type='comp' id='"+ specs.comp_id +"'>";
        $res += content_options_feedback_list_update("get_html", {
            type:"comp",
            id:specs.comp_id,
            batch_ord:specs.batch_ord
        });
        $res += "</table>";
        return $res;
    }
    else
    if (action === "add_events")
    {
        $(".btn_fb_del_comp")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Удалить компетенцию",
                    tx: "Удаляет \"красную\" компетенцию со всеми ее настройками и вопросами.",
                    w: 400,
                    dx: -100,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let cid = $(this).closest(".head").attr("id") * 1; // comp_id
                let comm_gr = $new_qz.settings.comm_groups[batch_ord];
                // Now we dell all setting we have in comm_group attached to this comp_id
                if (comm_gr.comp_list.hasOwnProperty(cid))
                    delete comm_gr.comp_list[cid];
                if (comm_gr.comp_cats_list.hasOwnProperty(cid))
                    delete comm_gr.comp_cats_list[cid];
                if (comm_gr.lock_comp_list.hasOwnProperty(cid))
                    delete comm_gr.lock_comp_list[cid];
                $session.set();
                //feedback_buffer("save"); // we probably don't need to save this right away to buffer, since user could do this by mistake and lose all the stuff before second thought

                // Remove corresponding html elements
                $(".head[feedback_list][id='"+ cid +"'][type='comp'").remove();
                $(".feedback_list[id='"+ cid +"'][type='comp'").remove();
                floater_hint("remove", null);
            });

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
                let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                //let type = $(this).closest(".feedback_list").attr("type");
                //let id = $(this).closest(".feedback_list").attr("id") * 1;
                let type = $(this).closest(".head").attr("type");
                let id = $(this).closest(".head").attr("id") * 1;
                if (undefined === type) // means we clicked the "quiz add comment" btn
                {
                    type = $(this).closest(".feedback_list").attr("type");
                    id = $(this).closest(".feedback_list").attr("id") * 1;
                }

                //console.log("btn_add_fb_line press, stats are", {batch_ord:batch_ord, type:type, id: id});
                let s = comm_slot_add_qst(type, batch_ord, id);
                $(".feedback_list[id='"+ id +"'][type='"+ type +"'").append(s);
                feedback_buffer("save");
                content_options_feedback_list_update("add_events", null);
            });

        $(".feedback_list .line input")
            .off("keyup")
            .keyup(function () {
                let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;
                let q_list;
                let group = $new_qz.settings.comm_groups[batch_ord];
                if (type === "qz")
                    q_list = group.qz_list; // qz questions list
                else
                    q_list = group.comp_list[id]; // comp questions list

                let comment_line_ord = $(this).closest("tr").attr("ord") * 1; // comment line order
                q_list[comment_line_ord] = $(this).val();
                feedback_buffer("save");
            })
            .off("change")
            .change(function(){
                let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;
                let q_list;
                let group = $new_qz.settings.comm_groups[batch_ord];
                if (type === "qz")
                    q_list = group.qz_list; // qz questions list
                else
                    q_list = group.comp_list[id]; // comp questions list

                let comment_line_ord = $(this).closest("tr").attr("ord") * 1; // comment line order
                q_list[comment_line_ord] = $(this).val();
                feedback_buffer("save");
                $session.set();
            });

        $(".feedback_list .btn_del_fb_line").off("click")
            .click(function(){
                let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;

                let group = $new_qz.settings.comm_groups[batch_ord];
                let q_list, q_cats_list, lock_list;
                if (type === "qz")
                {
                    q_list = group.qz_list; // qz questions list
                    q_cats_list = group.qz_cats_list;
                    lock_list = group.lock_qz_list; // qz questions list
                }
                else
                {
                    q_list = group.comp_list[id]; // comp questions list
                    q_cats_list = group.comp_cats_list[id];
                    lock_list = group.lock_comp_list[id]; // qz questions list
                }


                let comment_line_ord = $(this).closest("tr").attr("ord") * 1; // comment line order
                q_list.splice(comment_line_ord, 1); // common desc removal
                q_cats_list.splice(comment_line_ord, 1); // synced to it cat-spec descs removal
                lock_list.splice(comment_line_ord, 1); // lock indication removal

                content_options_feedback_list_update("update_self", {type:type, id:id, batch_ord:batch_ord});
                feedback_buffer("save");
                $session.set();
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
                let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;
                let new_state = $(this).attr("is_locked") * 1;
                new_state = Math.abs(new_state - 1); // revert state
                $(this).attr("is_locked", new_state);

                let group = $new_qz.settings.comm_groups[batch_ord];
                let lock_list;
                if (type === "qz")
                    lock_list = group.lock_qz_list; // qz questions list
                else
                    lock_list = group.lock_comp_list[id]; // qz questions list

                let comment_line_ord = $(this).closest("tr").attr("ord") * 1; // comment line order
                lock_list[comment_line_ord] =  new_state;
                content_options_feedback_list_update("update_self", {type:type, id:id, batch_ord:batch_ord});
                feedback_buffer("save");
                $session.set();
            });


        // On/off of role-specofic comments
        $(".cats_line .btn_switch").off("click")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Включено для роли",
                    tx: "Нажмите чтобы вкл./выкл. наличие этого комментария для данной роли.",
                    w: 400,
                    dx: -200,
                    dy: 20,
                });
            })
            .click(function(){
                let is_on = $(this).attr("is_on") * 1;
                let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let qst_ord = $(this).closest("tr").attr("ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;
                let cat_id = $(this).closest(".cat_box").attr("cid") * 1;
                is_on = Math.abs(is_on - 1); // revert state
                $(this).attr("is_on", is_on);


                let group = $new_qz.settings.comm_groups[batch_ord];
                let slot;
                if (type === "qz")
                    slot = group.qz_cats_list[qst_ord][cat_id]; // qz questions list
                else
                    slot = group.comp_cats_list[id][qst_ord][cat_id]; // qz questions list

                slot.is_on = is_on;
                feedback_buffer("save");
                $session.set();
            });

        // A role-specific change of comment tx
        $(".cats_line .cat_ta")
            .off("keyup")
            .keyup(function () {
                let tx = $(this).val().trim();
                tx = tx.replace(/"/g, "\"");
                let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let qst_ord = $(this).closest("tr").attr("ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;
                let cat_id = $(this).closest(".cat_box").attr("cid") * 1;
                feedback_update_cat_textarea(tx, batch_ord, qst_ord, type, id, cat_id);
            })
            .off("change")
            .change(function(){
                let tx = $(this).val().trim();
                tx = tx.replace(/"/g, "\"");
                let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
                let qst_ord = $(this).closest("tr").attr("ord") * 1;
                let type = $(this).closest(".feedback_list").attr("type");
                let id = $(this).closest(".feedback_list").attr("id") * 1;
                let cat_id = $(this).closest(".cat_box").attr("cid") * 1;
                feedback_update_cat_textarea(tx, batch_ord, qst_ord, type, id, cat_id);
                $session.set();
            });

    }
    else
    {
        let head_name = "";
        let q_list, lock_list;

        if (undefined !== specs)
        {
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
        }

        let s = "";


        if (undefined !== specs && specs.type === "qz")
        {
            s += "<tr>";
            s += "<td colspan='3' class='head'><div class='btn_add_fb_line'></div>"+ head_name +"</td>";
            s += "</tr>";
        }

        if (q_list)
            q_list.forEach(function (v, i) {
                s += "<tr ord='"+i+"'>";
                s += "<td>" +
                    (i + 1) +". "+
                    "<div class='lock_btn' is_locked='"+ lock_list[i] +"'></div>" +
                    "</td>";

                //s += "<td class='line'><input type='text' value='"+ v +"' placeholder='..текст вопроса..'></td>";
                s += "<td class='line'>";
                    let value_tx = v;
                    s += "<input type='text' placeholder='..текст вопроса..' value='"+ value_tx +"'>";
                    s += content_options_feedback_list_update("add_cats_fields", {
                        batch_ord: specs.batch_ord,
                        type: specs.type,
                        id: specs.id,
                        qst_ord: i
                    });
                s += "</td>";
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
function feedback_insert_qst(oqt_ord, block, qst_ord, shift, comp_id) {
    let comm_gr = $new_qz.settings.comm_groups[oqt_db.gr_ord];
    let new_qst;

    if (null === oqt_db.gr_ord)
    {
        message_ex("show","info","direct","Не выбрана целевая фокус-группа.");
    }
    else
    if ("comp_list" === block)
    {

        if ("empty_comp" !== qst_ord)
            new_qst = $pers.oqt[oqt_ord][block][comp_id][qst_ord]; // new qst tx

        if ("empty_comp" === qst_ord)
        {
            // add structures to a new comp: slots into comp_list, lock_comp_list, comp_cats_list
            if (!comm_gr.comp_list.hasOwnProperty(comp_id)) // create a box for this new comp
            {
                let comp_ord = get_comp_ord_from_comp_id(comp_id);
                if (null !== comp_ord)
                {
                    let comp_name = $ad.comps[comp_ord].name;

                    comm_gr.comp_list[comp_id] = [];
                    comm_gr.lock_comp_list[comp_id] = [];
                    comm_gr.comp_cats_list[comp_id] = [];


                    let comp_box_html = content_options_feedback_list_update("add_comp_box", {
                        batch_ord: oqt_db.gr_ord,
                        comp_id: comp_id,
                        comp_name: comp_name,
                        is_red: 1
                    });
                    $(".after_comp").append(comp_box_html);

                    //$(".feedback_list[id='"+ comp_id +"'][type='comp'").append(s);
                    content_options_feedback_list_update("add_events", null);
                }
                else
                {
                    message_ex("show","info","direct","Такой компетенции нет в опроснике выбранной группы, " +
                        "этот вопрос можно добавить только в список \"после-опросных\" путем нажатия этой кнопки, удерживая клавишу shift.");
                }
            }

            if (!comm_gr.comp_cats_list.hasOwnProperty(comp_id))
                comm_gr.comp_cats_list[comp_id] = [];
            if (!comm_gr.lock_comp_list.hasOwnProperty(comp_id))
                comm_gr.lock_comp_list[comp_id] = [];


            content_options_feedback_list_update("update_self", {
                type: "comp",
                id: comp_id,
                batch_ord: oqt_db.gr_ord
            });
        }
        else
        // Check if there is such comp_id in our current comm_group
        if (!shift) // add to comp
        {

            if (!comm_gr.comp_list.hasOwnProperty(comp_id)) // create a box for this new comp
            {
                let comp_ord = get_comp_ord_from_comp_id(comp_id);
                if (null !== comp_ord)
                {
                    let comp_name = $ad.comps[comp_ord].name;

                    comm_gr.comp_list[comp_id] = [];
                    comm_gr.lock_comp_list[comp_id] = [];
                    comm_gr.comp_cats_list[comp_id] = [];


                    let comp_box_html = content_options_feedback_list_update("add_comp_box", {
                        batch_ord: oqt_db.gr_ord,
                        comp_id: comp_id,
                        comp_name: comp_name,
                        is_red: 1
                    });
                    $(".after_comp").append(comp_box_html);

                    //$(".feedback_list[id='"+ comp_id +"'][type='comp'").append(s);
                    content_options_feedback_list_update("add_events", null);
                }
                else
                {
                    message_ex("show","info","direct","Такой компетенции нет в опроснике выбранной группы, " +
                        "этот вопрос можно добавить только в список \"после-опросных\" путем нажатия этой кнопки, удерживая клавишу shift.");
                }
            }

            //else // all ok - add

            comm_gr.comp_list[comp_id].push(new_qst);
            if (!comm_gr.comp_cats_list.hasOwnProperty(comp_id))
                comm_gr.comp_cats_list[comp_id] = [];
            if (!comm_gr.lock_comp_list.hasOwnProperty(comp_id))
                comm_gr.lock_comp_list[comp_id] = [];


            // check if there is a role-spec structure to it
            if ($pers.oqt[oqt_ord]["comp_cats_list"].hasOwnProperty(comp_id) &&
                $pers.oqt[oqt_ord]["comp_cats_list"][comp_id].hasOwnProperty(qst_ord)
            )
            {
                comm_gr.comp_cats_list[comp_id].push($pers.oqt[oqt_ord]["comp_cats_list"][comp_id][qst_ord]); // qst slot
                comm_gr.lock_comp_list[comp_id].push($pers.oqt[oqt_ord]["lock_comp_list"][comp_id][qst_ord]); // lock status
            }
            else
                comm_gr.comp_cats_list[comp_id].push(comm_slot_build_cats_qst_slot()); // default empty slot of question

            content_options_feedback_list_update("update_self", {
                type: "comp",
                id: comp_id,
                batch_ord: oqt_db.gr_ord
            });

        }
        else // add to after qz list via holding "shift" btn
        {
            if (typeof comm_gr.qz_list !== "object")
                comm_gr.qz_list = [];

            comm_gr.qz_list.push(new_qst); // add the main desc of qst
            // check if there is a role-spec structure to it
            if ($pers.oqt[oqt_ord]["comp_cats_list"].hasOwnProperty(comp_id) &&
                $pers.oqt[oqt_ord]["comp_cats_list"][comp_id].hasOwnProperty(qst_ord)
            )
                comm_gr.qz_cats_list.push($pers.oqt[oqt_ord]["comp_cats_list"][comp_id][qst_ord]);

            comp_id = 0; // this is always true when adding to qz_list
            content_options_feedback_list_update("update_self", {
                type: "qz",
                id: comp_id,
                batch_ord: oqt_db.gr_ord
            });
        }
    }
    // AFTER QUIZ
    else
    {
        new_qst = $pers.oqt[oqt_ord][block][qst_ord];

        if (typeof comm_gr.qz_list !== "object")
            comm_gr.qz_list = [];
        let lock_status = 0;
        if ($pers.oqt[oqt_ord]["lock_qz_list"].hasOwnProperty(qst_ord))
         lock_status = $pers.oqt[oqt_ord]["lock_qz_list"][qst_ord];

        comm_gr.qz_list.push(new_qst); // add the main desc of qst
        comm_gr.lock_qz_list.push(lock_status); // lock status
        // check if there is a role-spec structure to it
        if ($pers.oqt[oqt_ord]["qz_cats_list"].hasOwnProperty(qst_ord))
            comm_gr.qz_cats_list.push($pers.oqt[oqt_ord]["qz_cats_list"][qst_ord]);

        content_options_feedback_list_update("update_self", {
            type: "qz",
            id: 0,
            batch_ord: oqt_db.gr_ord
        });
    }
}

//----------------------------------------------------------------------------------------------------------------------
function feedback_oqt_box(do_return, opts)
{
    if (do_return === "add_events")
    {
        $(".oqt_box")
            .off("mouseenter")
            .off("mouseleave")
            .mouseleave(function() {$(this).css("opacity", 0.2)})
            .mouseenter(function() {$(this).css("opacity", 1)});

        // Close the whole RespDB window
        $(".oqt_box .head .close")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "Закрыть базу шаблонов";
                let cont = "Нажмите чтобы убрать базу шаблонов.";
                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x-400)+"px")
                    .css("top", ($curs.y + 30)+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function(){
                $(".oqt_box").remove();
                floater_hint("remove"); // do this for hint of closing to not stick
            });

        // OQT: show all hidden
        $(".oqt_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "", cont = "";
                let action = $(this).attr("action");
                switch (action) {
                    case "show_hidden":
                        head = "Показать все шаблоны";
                        cont = "Отобразить в панели все блоки шаблонов.";
                        break;
                }
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
                let action = $(this).attr("action");
                switch (action) {
                    case "show_hidden":
                        $(".oqt_box .list .qz_tile[is_hidden='1']").css("display","block");
                        $(this).css("display","none");
                        break;
                }
            });

        $(".oqt_box .head .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "", cont = "";
                let action = $(this).attr("action");
                switch (action) {
                    case "all_comps":
                        head = "Добавить из списка компетенций";
                        cont = "Список содержит все доступные компетенции в учетной записи.";
                        break;
                    case "add":
                        head = "Добавить/внедрить шаблон";
                        cont = "Добавляет в создаваемый список открытых вопросов все блоки со всеми вопросами в них.";
                        break;
                    case "wrap":
                        head = "Показать/скрыть блоки шаблона";
                        cont = "Отображает/скрывает блоки данного шаблона: \"после опроса\" и \"после компетенций\".";
                        break;
                    case "hide":
                        head = "Cкрыть шаблон";
                        cont = "Скрывает блок шаблона в панели. Чтобы потом вернуть его, нажмите на «Показать все шаблоны» вверху этого окна.";
                        break;
                }
                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x - 300) + "px")
                    .css("top", ($curs.y + 15) +"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function(){
                let qz_tile;
                let action = $(this).attr("action");
                switch (action) {

                    case "add":
                        let oqt_ord = $(this).closest(".qz_tile").attr("qz_ord") * 1;

                        // All after quiz stuff
                        $pers.oqt[oqt_ord].qz_list.forEach(function (v_qst, qst_ord) {
                            feedback_insert_qst(oqt_ord, "qz_list", qst_ord, false, 0);
                        });

                        // All after comp stuff
                        Object.keys($pers.oqt[oqt_ord].comp_list).map(function (c_id) {
                            let comp_id = c_id * 1;
                            if ($pers.oqt[oqt_ord].comp_list[comp_id] &&
                                $pers.oqt[oqt_ord].comp_list[comp_id].length)
                                $pers.oqt[oqt_ord].comp_list[comp_id].forEach(function (v_qst, qst_ord) {
                                    feedback_insert_qst(oqt_ord, "comp_list", qst_ord, false, comp_id);
                                })
                        });

                        feedback_turn_on_block("qz_list");
                        feedback_turn_on_block("comp_list");
                        feedback_buffer("save");
                        $session.set();
                        break;

                    case "wrap":
                        qz_tile = $(this).closest(".qz_tile");

                        if (qz_tile.attr("is_wrapped")*1)
                        {
                            qz_tile.attr("is_wrapped", 0);
                            qz_tile.find(".btn[lvl='qz'][action='wrap']").css("transform", "rotate(-90deg)");
                            qz_tile.find(".gr_item").css("display","block");
                            qz_tile.find(".notify").css("display","block");
                            qz_tile.css("padding-bottom","5px");
                        }
                        else
                        {
                            qz_tile.attr("is_wrapped", 1);
                            qz_tile.find(".btn[lvl='qz'][action='wrap']").css("transform", "rotate(0deg)");
                            qz_tile.find(".gr_item").css("display","none");
                            qz_tile.find(".notify").css("display","none");
                            qz_tile.css("padding-bottom","0");
                        }
                        break;

                    case "hide":
                        $(this).closest(".qz_tile")
                            .attr("is_hidden", 1)
                            .css("display","none");

                        $(".oqt_box .btn[action='show_hidden']").css("display","block");
                        break;
                }
            });

        $(".oqt_box .gr_item>.opts_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "", cont = "";
                let action = $(this).attr("action");
                switch (action) {
                    case "add_fresh_comp":
                        head = "Добавить эту компетенцию";
                        cont = "Нажмите чтобы добавить пустой слот компетенции в настройку открытых вопросов.<br>" +
                            "Нельзя добавлять две одинаковые компетенции.";
                        break;

                    case "add":
                        head = "Добавить все вопросы блока";
                        cont = "Добавляет все вопросы данного блока в ваш текущий список вопросов в том же типе блока.";
                        break;
                    case "wrap":
                        let block = $(this).closest(".gr_item").attr("subtype");
                        if ("qz_list" === block)
                        {
                            head = "Показать/скрыть вопросы";
                            cont = "Отображает/скрывает список всех вопросов в данном типе блока.";
                        }
                        else
                        {
                            head = "Показать/скрыть компетенции";
                            cont = "Отображает/скрывает список всех компетенций в данном типе блока.";
                        }
                        break;

                }
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
                let action = $(this).attr("action");
                // let qz_ord, gr_ord;
                switch (action) {
                    case "add_fresh_comp":
                        if (null === oqt_db.gr_ord) // some group was selected
                            message_ex("show","info","direct","Невозможно совершить операцию - не выделена целевая группа.");
                        else
                        {
                            let comp_id = $(this).attr("comp_id") * 1;
                            // Check the current list for that comp_id
                            let comm_gr = $new_qz.settings.comm_groups[oqt_db.gr_ord];
                            if (comm_gr.comp_list.hasOwnProperty(comp_id))
                                message_ex("show","info","direct","Данная компетенция уже существует в редактируемом списке.");
                            else
                            {
                                feedback_insert_qst(oqt_db.gr_ord, "comp_list", "empty_comp", false, comp_id);
                            }
                        }


                        break;


                    case "add":
                        let shift = false;
                        if ($keyboard.is_down.indexOf(16) !== -1)
                            shift = true;

                        let oqt_ord = $(this).closest(".qz_tile").attr("qz_ord") * 1;
                        let block = $(this).closest(".gr_item").attr("subtype");
                        //let comp_id = $(this).closest(".resp_item").attr("comp_id") * 1;

                        if ("qz_list" === block)
                        {
                            $pers.oqt[oqt_ord].qz_list.forEach(function (v_qst, qst_ord) {
                                feedback_insert_qst(oqt_ord, block, qst_ord, shift, 0);
                            })
                        }
                        else
                        {
                            Object.keys($pers.oqt[oqt_ord].comp_list).map(function (c_id) {
                                let comp_id = c_id * 1;
                                if ($pers.oqt[oqt_ord].comp_list[comp_id] &&
                                    $pers.oqt[oqt_ord].comp_list[comp_id].length)
                                        $pers.oqt[oqt_ord].comp_list[comp_id].forEach(function (v_qst, qst_ord) {
                                            feedback_insert_qst(oqt_ord, block, qst_ord, shift, comp_id);
                                })
                            })
                        }

                        feedback_turn_on_block(block);
                        feedback_buffer("save");
                        $session.set();
                        break;

                    case "wrap":
                        let gr_item = $(this).closest(".gr_item");
                        if ($(this).attr("is_wrapped")*1)
                        {
                            $(this).attr("is_wrapped", 0); // state of a button
                            gr_item
                                .attr("is_wrapped", 0)
                                .find(".resp_item").css("display","block");
                        }
                        else
                        {
                            $(this).attr("is_wrapped", 1);
                            gr_item
                                .attr("is_wrapped", 1)
                                .find(".resp_item").css("display","none");
                        }
                        break;
                }
            });

        // RESP TILE
        $(".resp_item>.opts_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "", cont = "";
                let action = $(this).attr("action");
                switch (action) {
                    case "add":
                        head = "Добавить все вопросы";
                        cont = "ЧНажмите, чтобы добавить все вопросы данной компетенции.";
                        break;
                    case "wrap":
                        head = "Показать/скрыть вопросы";
                        cont = "Отображает/скрывает список всех вопросов данной компетенции.";
                        break;
                }
                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x-430)+"px")
                    .css("top", $curs.y+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function(){
                let action = $(this).attr("action");
                switch (action) {
                    case "wrap":
                        let gr_item = $(this).closest(".resp_item");
                        if ($(this).attr("is_wrapped")*1)
                        {
                            $(this).attr("is_wrapped", 0); // state of a button
                            gr_item
                                .attr("is_wrapped", 0)
                                .find(".qst_item").css("display","block");
                        }
                        else
                        {
                            $(this).attr("is_wrapped", 1);
                            gr_item
                                .attr("is_wrapped", 1)
                                .find(".qst_item").css("display","none");
                        }
                        break;

                    case "add":
                        if (null === oqt_db.gr_ord) // some group was selected
                            message_ex("show","info","direct","Невозможно совершить операцию - не выделена целевая группа.");
                        else
                        {
                            let shift = false;
                            if ($keyboard.is_down.indexOf(16) !== -1)
                                shift = true;

                            let oqt_ord = $(this).closest(".qz_tile").attr("qz_ord") * 1;
                            let block = $(this).closest(".gr_item").attr("subtype");
                            //let comp_id = $(this).closest(".resp_item").attr("comp_id") * 1;

                            if ("qz_list" === block) // add 1 qst from QZ_LIST to QZ_LIST
                            {
                                let qst_ord = $(this).closest(".resp_item").attr("qst_ord") * 1;
                                console.log("qz_list 1 to qz_list", oqt_ord, "block", block, "qst_ord", qst_ord);
                                feedback_insert_qst(oqt_ord, block, qst_ord, shift, 0);
                            }
                            else
                            {
                                let comp_id = $(this).closest(".resp_item").attr("comp_id") * 1;
                                console.log("comp_list ALL COMP to CL or QL", oqt_ord, "block", block);
                                if ($pers.oqt[oqt_ord].comp_list[comp_id] &&
                                    $pers.oqt[oqt_ord].comp_list[comp_id].length)
                                    $pers.oqt[oqt_ord].comp_list[comp_id].forEach(function (v_qst, qst_ord) {
                                        feedback_insert_qst(oqt_ord, block, qst_ord, shift, comp_id);
                                    });
                            }
                            feedback_turn_on_block(block);
                            feedback_buffer("save");
                            $session.set();
                        }
                        break;
                }
            });

        // QST TILE
        $(".qst_item>.opts_box .btn")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
            .mouseenter(function()
            {
                let head = "", cont = "";
                let action = $(this).attr("action");
                switch (action) {
                    case "add":
                        head = "Добавить вопрос";
                        cont = "Чтобы добавить вопрос, Вам нужно:<br>" +
                            "1) Убедиться что иконка звездочки в целевой группе подсвеченв.<br>" +
                            "2) Нажать на эту кнопку напротив вопроса, чтобы добавить его в свою компетенцию.<br>" +
                            "(Опционально) при нажатии кнопки удерживать <b>shift</b>, чтобы добавить этот вопрос в список \"после опроса\".";
                        break;
                }
                let tx = "<div class='head'>" + head + "</div>" + cont;

                $(".floater")
                    .css("display", "inline-block")
                    .css("width", "400px")
                    //.css("height", "350px")
                    .css("left", ($curs.x-430)+"px")
                    .css("top", $curs.y+"px")
                    .css("border-color", "#4A67AD")
                    .html(tx);
            })
            .off("click")
            .click(function(){
                let action = $(this).attr("action");
                switch (action) {
                    case "add":
                        if (null === oqt_db.gr_ord) // some group was selected
                            message_ex("show","info","direct","Невозможно совершить операцию - не выделена целевая группа.");
                        else
                        {
                            let shift = false;
                            if ($keyboard.is_down.indexOf(16) !== -1)
                                shift = true;

                            let oqt_ord = $(this).closest(".qz_tile").attr("qz_ord") * 1;
                            let block = $(this).closest(".gr_item").attr("subtype");
                            let comp_id = $(this).closest(".resp_item").attr("comp_id") * 1;
                            let qst_ord = $(this).closest(".qst_item").attr("qst_ord") * 1;
                            console.log("oqt_ord", oqt_ord, "block", block, "qst_ord", qst_ord);
                            feedback_insert_qst(oqt_ord, block, qst_ord, shift, comp_id);
                            console.log("comp_list 1 to CL or QL", oqt_ord, "block", block);

                            feedback_turn_on_block(block);
                            feedback_buffer("save");
                            $session.set();
                        }
                        break;
                }
            });
    }
    else
    {
        let s = "";

        // Buffer button
        s += "<div class='qz_tile' is_wrapped='1' is_hidden='0'>";
            s += "<table class='head'>";
                s += "<tr>";
                s += "<td></td>";
                s += "<td><div class='name'>Список Компетенций</div></td>";
                s += "<td>" +
                        "<div class='btn' lvl='qz' action='wrap'></div>" +
                    "</td>";
                s += "<td></td>"; // was hide btn
                s += "</tr>";
            s += "</table>";

            $ad.comps.forEach(function (v_comp) {
                s += "<div class='gr_item' is_wrapped='1' subtype='qz_list' empty_comp>";
                    s += "<div class='opts_box'>";
                        s += "<div class='btn' action='add_fresh_comp' comp_id='"+ v_comp.id +"'></div>";
                    s += "</div>";
                    s += "<div class='tx'><span class='string'>"+ v_comp.name +"</span></div>";
                s += "</div>";
            });
        s += "</div>";


        // Custom save templates html structure
        if (undefined !== $pers.oqt && $pers.oqt.length)
            $pers.oqt.forEach(function (v_qz, i_qz) {
                s += "<div class='qz_tile'  is_wrapped='1' is_hidden='0' qz_ord='"+ i_qz +"'>";
                    s += "<table class='head'>";
                        s += "<tr>";
                            s += "<td>" +
                                "<div class='btn' action='add'></div>" +
                                "</td>";

                            s += "<td>" +
                                "<div class='name'>" + v_qz.name + "</div>" +
                                "</td>";
                            s += "<td>" +
                                "<div class='btn' lvl='qz' action='wrap'></div>" +
                                "</td>";
                            //s += "<td><div class='btn' action='edit'></div></td>";
                            s += "<td>" +
                                "<div class='btn' action='hide'></div>" +
                                "</td>";
                        s += "</tr>";
                    s += "</table>";

                    // AFTER QZ
                    if (v_qz.qz_list.length)
                    {
                        s += "<div class='gr_item' is_wrapped='1' subtype='qz_list'>";
                            s += "<div class='opts_box'>";
                                s += "<div class='btn' action='wrap' is_wrapped='1'></div>";
                                s += "<div class='btn' action='add'></div>";
                            s += "</div>";
                            s += "<div class='tx'><span class='string'>После опроса</span></div>";

                            // Get every resp in this group
                            v_qz.qz_list.forEach(function (v_qtx, i_resp) {
                                s += "<div class='resp_item' qst_ord='"+i_resp+"' is_wrapped='1'>";
                                    s += "<div class='opts_box'>";
                                        s += "<div class='btn' action='add'></div>";
                                    s += "</div>";

                                    s += "<div class='tx'>" +
                                            "<span class='q_index'>" + (i_resp + 1) + ".</span> " +
                                            "<span class='string'>" + v_qtx + "</span>" + " " +
                                        "</div>";
                                s += "</div>"; // end of "gr_item" box

                            });

                        s += "</div>"; // end of "gr_item" box
                    }

                    // AFTER COMP
                    if (obj_len(v_qz.comp_list))
                    {

                        //console.log("v_qz.comp_list", v_qz.comp_list);
                        s += "<div class='gr_item' is_wrapped='1' subtype='comp_list'>";
                            s += "<div class='opts_box'>";
                                s += "<div class='btn' action='wrap' is_wrapped='1'></div>";
                                s += "<div class='btn' action='add'></div>";
                            s += "</div>";
                            s += "<div class='tx'><span class='string'>После компетенций</span></div>";

                            // Get every resp in this group
                            Object.keys(v_qz.comp_list).map(function (k, i_comp) {
                                let comp_name = "?";
                                let comp_ord = get_comp_ord_from_comp_id(k*1);
                                // Comp exists and has qsts in it
                                if (null !== comp_ord &&
                                    typeof v_qz.comp_list[k] === "object" &&
                                    obj_len(v_qz.comp_list[k]))
                                {
                                    comp_name = $ad.comps[comp_ord].name;
                                    s += "<div class='resp_item' comp_id='"+ k +"' is_wrapped='1'>";
                                    s += "<div class='opts_box'>";
                                    s += "<div class='btn' action='wrap' is_wrapped='1'></div>";
                                    s += "<div class='btn' action='add'></div>";
                                    s += "</div>";

                                    s += "<div class='tx'>" +
                                        "<span class='string'><b>" + comp_name + "</b></span>" +
                                        "</div>";

                                    // QSTS list of this COMP
                                    let comp_qlist =  v_qz.comp_list[k];
                                    comp_qlist.forEach(function (v_qtx, i_qtx) {
                                        s += "<div class='qst_item' qst_ord='"+i_qtx+"' is_wrapped='1'>";
                                        s += "<div class='opts_box'>";
                                        s += "<div class='btn' action='add'></div>";
                                        s += "</div>";

                                        s += "<div class='tx'>" +
                                            "<span class='q_index'>" + (i_qtx + 1) + ".</span> " +
                                            "<span class='string'>" + v_qtx + "</span>" + " " +
                                            "</div>";
                                        s += "</div>"; // end of "gr_item" box
                                    });

                                    s += "</div>"; // end of "gr_item" box
                                }
                            });
                        s += "</div>"; // end of "gr_item" box
                    }

                    /*
                    if (!v_qz.resps.length)
                        s += "<div class='notify'>Нет ни одного шаблона</div>";
                    else
                    */
                s += "</div>";
            });
        else
        {
            s += "<div class='qz_tile'>";
            s += "<table class='head'>";
            s += "<tr>";
                s += "<td>" +
                    "<div class='name'>Нет сохраненных шаблонов</div>" +
                    "</td>";
            s += "</tr>";
            s += "</table>";
            s += "</div>";
        }

        let wrap = "";
        wrap += "<div class='oqt_box'>";
        wrap += "<div class='head'>База шаблонов" +
            "<div class='close'></div>" +
            "</div>";
        wrap += "<div class='btn' action='show_hidden'>" +

            "<div class='img'></div>" +
            "<div class='tx'>Показать скрытые шаблоны</div>" +
            "</div>";
        wrap += "<div class='list'>" + s + "</div>";
        wrap += "</div>";

        if (do_return === true)
            return wrap;
        else
        {
            $(".options_personify .oqt_box").remove();
            $(".options_personify").prepend(wrap);
            feedback_oqt_box("add_events");
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function feedback_turn_on_block(block) {
    if ("qz_list" === block &&
        !$new_qz.settings.comm_groups[oqt_db.gr_ord].qz_after
    )
        $(".comm_group .btn_after_qz").trigger("click"); // open qz-list window if isn't
    else
    if ("comp_list" === block &&
        !$new_qz.settings.comm_groups[oqt_db.gr_ord].comp_after
    )
        $(".comm_group .btn_after_comp").trigger("click"); // open qz-list window if isn't
}

//----------------------------------------------------------------------------------------------------------------------
function feedback_buffer(action)
{
    if ("save" === action)
    {
        $new_qz.oq_buffer = duplicate($new_qz.settings.comm_groups);
    }
    else
    if ("load" === action)
    {
        if ($new_qz.hasOwnProperty("oq_buffer"))
        {
            Object.keys($new_qz.oq_buffer).map(function (k) {
                if (["qb_id","self_ban"].indexOf(k) === -1) // exclude this fields
                {
                    if (typeof $new_qz.oq_buffer[k] === "object")
                        $new_qz.settings.comm_groups[k] = duplicate($new_qz.oq_buffer[k]); // brake link between cloned arrays
                    else
                        $new_qz.settings.comm_groups[k] = $new_qz.oq_buffer[k];
                }
            });
            //$new_qz.settings.comm_groups = duplicate($new_qz.oq_buffer);
            feedback_list_build("update_self");
        }
        else
            message_ex("show","info","direct","Невозможно совершить действие - буффер пуст.");
    }
}

//----------------------------------------------------------------------------------------------------------------------
function content_options_5_feedback_events()
{
    $(".btn_oqt_save")
        .off("mouseenter").off("mouseleave").mouseleave(function(){floater_hint("remove");})
        .mouseenter(function()
        {
            floater_hint("show",{
             head: "Сохранить в шаблон открытых вопросов",
             tx: "Нажмите, чтобы сохранить текущую выборку в шаблон открытых вопросов.",
             w: 400,
             dx: -200,
             dy: 20,
            });
        })
        .off("click")
        .click(function () {
            if (null === oqt_db.gr_ord)
                message_ex("show","info","direct","Не выбрана группа для сохранения.");
            else
            {

                message_ex("show","insert","direct_full",{
                    head: "Сохранение группы в шаблон",
                    tx: "Укажите название нового шаблона в поле ниже."
                },
                "oqt_save");
            }

        });

    $(".btn_oqt_database")
        .off("mouseenter").off("mouseleave").mouseleave(function(){floater_hint("remove");})
        .mouseenter(function()
        {
            floater_hint("show",{
                head: "База шаблонов",
                tx: "Нажмите, чтобы открыть окно с сохраненными шаблонами открытых вопросов.",
                w: 400,
                dx: -200,
                dy: 20,
            });
        })
        .off("click")
        .click(function () {
            feedback_oqt_box("update_self");
        });

    $(".btn_focus")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
        .mouseenter(function()
        {
            let head = "Выбрать группу";
            let cont = "Нажмите, чтобы сделать эту группу активной (выбранной).<br>" +
                "В любое время может быть только одна активная группа.<br>" +
                "При сохранении шаблона будет сохранен только набор вопросов выбранной группы.";

            let tx = "<div class='head'>" + head + "</div>" + cont;

            $(".floater")
                .css("display", "inline-block")
                .css("width", "400px")
                //.css("height", "350px")
                .css("left", ($curs.x-200)+"px")
                .css("top", $curs.y+20+"px")
                .css("border-color", "#4A67AD")
                .html(tx);
        })
        .off("click")
        .click(function(){
            $(".btn_focus").attr("is_on", 0);
            $(this).attr("is_on", 1);
            oqt_db.gr_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
        });
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
    switch ($new_qz.options_screen_id){
        case 1:
            content_options_build_watchers_list("add_events");
            break;
        case 3:
            content_options_letter_templated_dropdown("add_events");
            break;

        case 5:
            content_options_5_feedback_events();
            break;
    }

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
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
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
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
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
                    let letter_tx = $default_letter_tx.replace(/%ДАТА%/g, decode_timestamp($new_qz.settings.end_date, "no_span"));
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
            let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
            let group = $new_qz.settings.comm_groups[batch_ord];
            if (group.qz_after)
            {
                $new_qz.settings.comm_groups[batch_ord].qz_after = false;
                $(this).closest(".comm_group").find(".after_qz").css("display","none");
                $(this).attr("is_on", "0");
            }
            else
            {
                $new_qz.settings.comm_groups[batch_ord].qz_after = true;
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
            let batch_ord = $(this).closest(".comm_group").attr("batch_ord") * 1;
            let group = $new_qz.settings.comm_groups[batch_ord];
            if (group.comp_after)
            {
                $new_qz.settings.comm_groups[batch_ord].comp_after = false;
                $(this).closest(".comm_group").find(".after_comp").css("display","none");
                $(this).attr("is_on", "0");
            }
            else
            {
                $new_qz.settings.comm_groups[batch_ord].comp_after = true;
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
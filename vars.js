let $session = {};
$session.opened_qz_ord = null; // gets "active" or "done" or number to open certain qz (for deli-control only),
// used when entering "analytics" + maybe "deli_control" screens to define which list to pick from to open
$session.ans_table_style = null; // "cat" or "qst"
$session.opened_focus_ord = null; // same for a focus person

$session.last_data = null;
$session.last_data_time = null;
$session.reset = function () {
    $new_qz.comment = "";
    $new_qz.name = "";
    $new_qz.tab_progress = 0;
    $new_qz.tab_progress_max = 0;

    $new_qz.qst_screen_id = 0;// 0 - mode pick, 1 - standart, 2 - import, 3 - manual, 4 - adaptation, 5 - answer options,
    $new_qz.qst_screen_id_max = 5;
    $new_qz.qst_list = [];
    $new_qz.dirs_fold_map = [];
    $new_qz.qb_adapt_ord = null; // index of qbook in $ad.qbooks that is expanded in adapt_box to deal with
    $new_qz.qb_adapt_id = null;
    $new_qz.temp_struct = []; // by index of qbook id contains temporary form of struct array for that qbook

    $new_qz.answer_set_id = 4;


    $new_qz.deli_screen_id = 1;
    $new_qz.deli_list = [];
    $new_qz.deli_edit_ord = null; // != null when existing list is being edited, this is it's ord index in new_qz_deli_list
    $new_qz.deli_edit_list = null;

    $new_qz.options_letter_screen_tag = "letter";
    $new_qz.options_screen_id = 2;
    $new_qz.options_screen_id_max = 2;
    $new_qz.options_temp_letter = $default_letter_tx;
    $new_qz.options_temp_letter_head = $default_letter_head;

    $new_qz.analyt_screen_id = 1;

    $new_qz.watchers_list = [];


    $new_qz.settings = {};
    $new_qz.settings.start_date = null;
    $new_qz.settings.end_date = null;
    $new_qz.settings.is_anon = true; // null
    $new_qz.settings.answer_opts_list = [
        "Абсолютно согласен",
        "В большей степени согласен",
        "Скорее согласен, чем не согласен",
        "Скорее не согласен",
        "В большей степени не согласен",
        "Абсолютно не согласен",
        "Затрудняюсь ответить"];

    $new_qz.settings.intro_tx = {};
    $new_qz.settings.intro_tx.env = "#TITLE#<br>"+
    "Привет!<br>"+
        "#TITLE#<br>"+

    "#STAR#<br>"+
        "Приглашаем тебя заполнить опрос по взаимодействию с сотрудником: %ФИО%. Это поможет твоему коллеге выявить свои сильные и слабые стороны и понять, как ему следует развиваться дальше.<br>"+
        "#STAR#<br>"+

    "#MAN#<br>"+
        "Опрос $полностью конфиденциален,$ поэтому, пожалуйста, отвечай честно. Если ты не знаешь, как в той или иной ситуации поступает коллега, выбирай ответ $'Не владею информацией'.$<br>"+
    "#MAN#<br>"+

    "#TIME#<br>"+
        "На заполнение анкеты у тебя уйдет не более $15–20 минут.$<br>"+
    "#TIME#<br>"+
        "Будем ждать твои ответы $до 30.09.2020 18:00$";
    $new_qz.settings.intro_tx.self = "Привет!<br><br>" +
        "Это опрос, в котором ты должен оценить свое взаимодействие с коллегами.<br><br>" +
        "Пожалуйста, отвечай честно. Так тебе будет проще понять, в чем твоя оценка собственных действий совпадает с оценкой коллег, а в чем — расходится с ней.";;

    $new_qz.settings.s_date_raw = "";
    $new_qz.settings.e_date_raw = "";

//$new_qz.settings.watchers_list = [];
    $new_qz.settings.scale_id = 1;
    $new_qz.settings.djo_avg_id = 1;

    $new_qz.settings.qb_list = []; // qb list of global id's for each focus-group
    $new_qz.settings.comm_groups = []; // consists of slots of
    /*
        {
            qb_id: int

            qz_after: bool
            qz_list: []

            comp_after: bool
            comp_list[
                comp_id_x1: []
                comp_id_x2: []
            ]
        }
    */

    $new_qz.settings.access_id = 1; // temp
    $new_qz.settings.letter = "";
    $new_qz.settings.letter_head = "";
    $new_qz.settings.notice_list = [0,0,0,0,0,0];
    $new_qz.settings.notice_period_id = 1;
    $new_qz.settings.personify_list = [0,0,0,0,0,0,0,0,0,0];
    $new_qz.settings.personify_comment = "";
    $new_qz.settings.notice_pct = 50; // % of resps completed the qz

    $new_qz.settings.feedback_type = 1; // 1 - ask all after a quiz, 2 - after every comp, 3 - after every qst

    $session.presets = {};
    $session.presets.is_picked = false;

    $session.presets.feedback_qst_list = [
        "Опишите самые сильные стороны этого человека",
        "Опишите конкретные вещи, которые этот человек мог бы сделать, чтобы стать более эффективным",
        "Чтобы вы пожелали этому человеку"
    ];


    $session.presets.intro_self = "Уважаемый коллега!\n\n" +
        "Перед Вами – опрос 360 градусов. Пожалуйста, ответьте на вопросы о самом себе, Ваших деловых качествах и управленческом стиле\n" +
        "Задача проведения данной части опроса – обеспечить сравнение Вашей самооценки с тем, как Вас видят окружающие. " +
        "Впоследствии это поможет Вам глубже проанализировать Ваши сильные стороны и зоны развития. Постарайтесь давать максимально правдивые ответы.\n\n" +
        "Правила заполнения опроса: \n" +
        "Опросник состоит из нескольких вопросов. По каждому вопросу Вам будут предложены варианты ответов. " +
        "Вам необходимо выбрать один вариант и нажать на него один раз. " +
        "После этого будет автоматически осуществлен переход к другому вопросу (дождитесь перехода системы к следующему вопросу).\n" +
        "В конце опроса Вам будет предложено вписать от себя некоторые комментарии.\n" +
        "По завершении опроса нажмите кнопку «сохранить» в верхней части экрана слева.";

    $session.presets.intro_other = "Уважаемый коллега!\n\n" +
        "Перед Вами – опрос 360 градусов. Просим Вас ответить на предлагаемые вопросы, касающиеся делового и управленческого стиля %ФИО%.\n" +
        "Задача проведения опроса – обеспечить максимально качественную и объективную обратную связь. Опросник анонимен. При обработке результатов опроса Ваше имя и фамилия фиксироваться не будут. " +
        "Важно максимально точное отражение Вашего мнения.\n " +
        "Правила заполнения опроса: \n" +
        "Опросник состоит из нескольких вопросов. По каждому вопросу Вам будут предложены варианты ответов. Вам необходимо выбрать один вариант и нажать на него один раз. " +
        "После этого будет автоматически осуществлен переход к другому вопросу (дождитесь перехода системы к следующему вопросу).\n" +
        "В конце опроса Вам будет предложено вписать от себя некоторые комментарии.\n\n" +
        "По завершении опроса нажмите кнопку «сохранить» в верхней части экрана слева.";
};
$session.get = function () {
    let form = {};
    form.action = "get";
    sendAJ("temp_data", JSON.stringify(form));
};
$session.presets_get = function () {
    let form = {};
    form.action = "presets_get";
    form.template = $session.presets;
    sendAJ("presets_temp_data", JSON.stringify(form));
};
$session.presets_set = function () {
    let form = {};
    form.action = "presets_set";
    form.template = $session.presets;
    sendAJ("presets_temp_data", JSON.stringify(form));
};
$session.set = function () {
    let form = {};
    form.action = "set";
    form.session = duplicate($new_qz);
    sendAJ("temp_data", JSON.stringify(form));
    $session.presets_set();
};
$session.autosave = function () {
    $(".auth_box .autosave")
        .css("display", "block")
        .css("transorm", "rotate(0deg)");
    $autosave_rot_ang = 0;
    $autosave_prg = 2000; // animation dur in msec
};
$session.load = function () {
    if ($session.last_data !== null)
    {
        // Do not delete all new options that was introduced later in developemant (insert only know keys)
        Object.keys($new_qz).map(function (key) {
            if ($session.last_data[key] !== undefined)
                if (key !== "settings")
                    $new_qz[key] = $session.last_data[key];
                else
                {
                    let obj = $session.last_data[key];
                    Object.keys($new_qz.settings).map(function (key) {
                        if (obj[key] !== undefined)
                            $new_qz.settings[key] = obj[key];
                    });
                }
        });

        switch ($new_qz.tab_progress)
        {
            case 0:
                show_content("landing");
                break;

            case 1:
                show_content("qz_create");
                break;

            case 2:
                show_content("qst");
                break;

            case 3:
                show_content("deli_set");
                break;

            case 4:
                show_content("options");
                break;

            case 5:
                show_content("deli_control");
                break;

            case 6:
                show_content("analytics");
                break;
        }

        $session.presets_get();
    }
    else
        message_ex("show", "info", "direct", "Нет в наличи данных о последней сессии.");

};


/*
#TITLE#
Привет!
#TITLE#

#STAR#
Приглашаем тебя заполнить опрос по взаимодействию с сотрудником: %ФИО%. Это поможет твоему коллеге выявить свои сильные и слабые стороны и понять, как ему следует развиваться дальше.
#STAR#

#MAN#
Опрос $полностью конфиденциален,$ поэтому, пожалуйста, отвечай честно. Если ты не знаешь, как в той или иной ситуации поступает коллега, выбирай ответ $'Не владею информацией'.$
#MAN#

#TIME#
На заполнение анкеты у тебя уйдет не более $15–20 минут.$
#TIME#

Будем ждать твои ответы $до 30.09.2020 18:00$
* */
let $rkey,
    $qkey,
    $qBook,
    $qsts_total,
    $state,
    $ajResponse = Array(),
    $selfGrade,
    $qsts = {},
    $save_chk,
    $ctrl_block = false,
    $unsaved_prg = false,
    $fb_prg = 0,
    $saveans_timer = 0,
    $saveans_phase = 0,
    $saveans_countdown = false,
    $was_backed = false,
    $saveans_interval,
    $clidata;
let unique_comp_list = [];

let is_test_link = false;
$qsts.cur = 0;
$qsts.last = 0;
$qsts.formost = 0;
$qsts.max = 0;
$qsts.tx = [];

$presets = {};
$presets.is_picked = false;
$presets.feedback_qst_list = [
    "Опишите самые сильные стороны этого человека",
    "Опишите конкретные вещи, которые этот человек мог бы сделать, чтобы стать более эффективным",
    "Чтобы вы пожелали этому человеку"
];

$presets.answer_opts_list = [
    "Абсолютно согласен",
    "В большей степени согласен",
    "Скорее согласен, чем не согласен",
    "Скорее не согласен",
    "В большей степени не согласен",
    "Абсолютно не согласен",
    "Затрудняюсь ответить"];

$presets.intro_self = "Уважаемый коллега!\n\n" +
    "Перед Вами – опрос 360 градусов. Пожалуйста, ответьте на вопросы о самом себе, Ваших деловых качествах и управленческом стиле\n" +
    "Задача проведения данной части опроса – обеспечить сравнение Вашей самооценки с тем, как Вас видят окружающие. " +
    "Впоследствии это поможет Вам глубже проанализировать Ваши сильные стороны и зоны развития. Постарайтесь давать максимально правдивые ответы.\n\n" +
    "Правила заполнения опроса: \n" +
    "Опросник состоит из нескольких вопросов. По каждому вопросу Вам будут предложены варианты ответов. " +
    "Вам необходимо выбрать один вариант и нажать на него один раз. " +
    "После этого будет автоматически осуществлен переход к другому вопросу (дождитесь перехода системы к следующему вопросу).\n" +
    "В конце опроса Вам будет предложено вписать от себя некоторые комментарии.\n" +
    "По завершении опроса нажмите кнопку «сохранить» в верхней части экрана слева.";

$presets.intro_other = "Уважаемый коллега!\n\n" +
    "Перед Вами – опрос 360 градусов. Просим Вас ответить на предлагаемые вопросы, касающиеся делового и управленческого стиля %ФИО%.\n" +
    "Задача проведения опроса – обеспечить максимально качественную и объективную обратную связь. Опросник анонимен. При обработке результатов опроса Ваше имя и фамилия фиксироваться не будут. " +
    "Важно максимально точное отражение Вашего мнения.\n " +
    "Правила заполнения опроса: \n" +
    "Опросник состоит из нескольких вопросов. По каждому вопросу Вам будут предложены варианты ответов. Вам необходимо выбрать один вариант и нажать на него один раз. " +
    "После этого будет автоматически осуществлен переход к другому вопросу (дождитесь перехода системы к следующему вопросу).\n" +
    "В конце опроса Вам будет предложено вписать от себя некоторые комментарии.\n\n" +
    "По завершении опроса нажмите кнопку «сохранить» в верхней части экрана слева.";

$intro_other = "Уважаемый коллега!\n\n" +
    "Перед Вами – опрос 360 градусов. Просим Вас ответить на предлагаемые вопросы, касающиеся делового и управленческого стиля %ФИО%.\n" +
    "Задача проведения опроса – обеспечить максимально качественную и объективную обратную связь. Опросник анонимен. При обработке результатов опроса Ваше имя и фамилия фиксироваться не будут. " +
    "Важно максимально точное отражение Вашего мнения.\n " +
    "Правила заполнения опроса: \n" +
    "Опросник состоит из нескольких вопросов. По каждому вопросу Вам будут предложены варианты ответов. Вам необходимо выбрать один вариант и нажать на него один раз. " +
    "После этого будет автоматически осуществлен переход к другому вопросу (дождитесь перехода системы к следующему вопросу).\n" +
    "В конце опроса Вам будет предложено вписать от себя некоторые комментарии.\n\n" +
    "По завершении опроса нажмите кнопку «сохранить» в верхней части экрана слева.";

let $fb = {};
$fb.qz_list = [];
$fb.comp_list = {};

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

$nosel = "onselectstart='return false' onmousedown='return false'";
// sself http://test4hr.ru/ATS/client.php?p_key=nDqKYezhVyRwv2HUhxfA&ukey=EANIEpcY0f
// cli   http://test4hr.ru/ATS/client.php?p_key=nDqKYezhVyRwv2HUhxfA&ukey=2dpL1WPADt
//****------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

let map = {
    db: null,
    formost: 0,
    step: 0
};

map.get_last_unanswered_step = function () {

    for (let i=0; i<$clidata.map.length; i++)
    {
        let slot = $clidata.map[i];
        let o = slot.ord;
        if ("qst" === slot.type)
        {
            if (!$clidata.ans_list.hasOwnProperty(o))
            {
                $qsts.cur = o;
                map.step = i;
                break;
            }
        }
        else
        if ("comment" === slot.type)
        {
            if ("comp" === slot.subtype)
            {
                let cid = slot.comp_id;
                if (1 === $clidata.feedback.lock_comp_list[cid][o] && // mandatory comment
                    !$fb.comp_list[cid][o].tx // answer waasn't given
                )
                {
                    map.step = i;
                    break;
                }
            }
            else
            {
                if (1 === $clidata.feedback.lock_qz_list[o] && // mandatory comment
                    !$fb.qz_list[o].tx // answer waasn't given
                )
                {
                    map.step = i;
                    break;
                }
            }
        }
    }
    console.log("map.get_last_unanswered_step, map.step: " + map.step);
};

map.next_step = function (tag) {
    console.log("map.next_step, tag: " + tag);
    if ("back" === tag)
    {
        if (map.step >= 0)
            map.step--;
    }
    else
    if ("no_prg" !== tag)
        map.step++;

    if (map.step >= map.formost)
        map.formost = map.step;

    if (map.step >= map.db.length)
        endscreen();
    else
    {

        let slot = map.db[map.step];
        switch (slot.type){
            case "qst":
                // Reset all triggers of qst screen
                // Добавить обработчик событий
                $(".ans_line .opt")
                    .off("mouseenter")
                    .off("mouseleave")
                    .off("click")
                    .click(function()
                    {
                        if (!$ctrl_block)
                        {
                            let form = {};
                            form.pts = $(this).closest(".ans_line").attr("pts") * 1;
                            form.qst_ord = map.db[map.step].ord; //$qsts.cur;
                            $clidata.ans_list[form.qst_ord] = form.pts; // record answer localy so algo can detect the next unanswered qst
                            form.resp_ord = $clidata.resp_ord * 1;
                            form.group_ord = $clidata.group_ord * 1;
                            form.rkey = $rkey;
                            form.qkey = $qkey;
                            form.ans_list = $clidata.ans_list;
                            form.map_step = map.step;
                            form.map_len = map.db.length;

                            if (is_test_link) // avoid data recordings
                            {
                                map.next_step();
                                $ctrl_block = false;
                            }
                            else
                            {
                                $ctrl_block = true;
                                $unsaved_prg = true;
                                roll_answer_delay(1);
                                sendAJ("record_answer",JSON.stringify(form)); // upon saving confirm we will move to the next qst
                            }
                        }
                    });

                // Onhover animation
                if (!window.mobilecheck())
                    $(".ans_line .opt")
                        .mouseenter(function()
                        {
                            let opts_max_ord = $clidata.answer_opts_list.length - 1;
                            let ord = $(this).closest("td").attr("ord") * 1;
                            if (ord === opts_max_ord)
                            {
                                $(this).attr("state", 1);
                            }
                            else
                            {
                                $(".ans_line .opt").each(function () {
                                    let his_ord = $(this).closest("td").attr("ord") * 1;
                                    if (his_ord !== opts_max_ord)
                                    {
                                        if (his_ord > ord)
                                            $(this).attr("state", 1);
                                        else
                                        if (his_ord === ord)
                                            $(this).attr("state", 2);
                                        else
                                            $(this).attr("state", 0);
                                    }
                                });
                            }

                        })
                        .mouseleave(function()
                        {
                            let opts_max_ord = $clidata.answer_opts_list.length - 1;
                            let ord = $(this).closest("td").attr("ord") * 1;
                            if (ord === opts_max_ord)
                            {
                                $(this).attr("state", 0);
                            }
                            else
                            {
                                $(".ans_line .opt").each(function () {
                                    let his_ord = $(this).closest("td").attr("ord") * 1;
                                    if (his_ord !== opts_max_ord)
                                        $(this).attr("state", 0);
                                });
                            }
                        });

                let q_ord = map.db[map.step].ord;
                let local_qst_ord = 0;
                map.db.forEach(function (v_slot, i_slot) {
                    if ("qst" === v_slot.type && i_slot <= map.step)
                        local_qst_ord++;
                });

                $(".qst_cntr .tx")
                    .empty()
                    .append("Вопрос: <b>" + local_qst_ord + "/" + $qsts.max + "</b>");

                $(".qst_cntr .fillbar_front")
                    .css("width", (100 * local_qst_ord / $qsts.max) + "%");

                // Special qst for certain quizes with 2 textareas
                $(".ans_box .ans_line").css("display", "table-cell");
                $(".ans_box textarea").css("display", "none");

                $(".qst_cntr .comp_name").html("<span class='label'>Компетенция:</span> "+ $clidata.comp_names_list[q_ord]);
                $(".qst_box").html($qsts.tx[q_ord]);

                // Set answer, if was alrady given
                $(".ans_line").each(function () {
                    $(this).find(".opt").attr("type", "0");
                    let pts = $(this).attr("pts") * 1;
                    if ($clidata.ans_list.hasOwnProperty(q_ord))
                    {
                        if (!pts)
                        {
                            if ($clidata.ans_list[q_ord] === pts)
                                $(this).find(".opt").attr("state", "1");
                            else
                                $(this).find(".opt").attr("state", "0");
                        }
                        else
                        if (pts === $clidata.ans_list[q_ord])
                            $(this).find(".opt").attr("state", "2");
                        else
                        if (pts < $clidata.ans_list[q_ord])
                            $(this).find(".opt").attr("state", "1");
                        else
                            $(this).find(".opt").attr("state", "0");
                    }
                });

                map.window_set("qst", "show");
                break;

            case "comment":
                if ("comp" === slot.subtype)
                {
                    $clidata.fb_tag = "comp";
                    $fb_prg = slot.ord;
                    let comp_id = slot.comp_id;

                    // Form a question header
                    let tx = $clidata.feedback.comp_list[comp_id][$fb_prg];
                    // Add mandatory sign "red star" to the end of the question
                    if ($clidata.feedback.lock_comp_list &&
                        $clidata.feedback.lock_comp_list.hasOwnProperty(comp_id) &&
                        $clidata.feedback.lock_comp_list[comp_id].hasOwnProperty($fb_prg) &&
                        1 === 1 * $clidata.feedback.lock_comp_list[comp_id][$fb_prg]
                    )
                        tx += "<div class='musthave'>*</div>";
                    $(".fb_wnd .ta_head").html(tx);

                    let next_qst_ans = "";
                    if ($fb.comp_list.hasOwnProperty(comp_id) &&
                        $fb.comp_list[comp_id].hasOwnProperty($fb_prg) &&
                        $fb.comp_list[comp_id][$fb_prg].tx
                    )
                        next_qst_ans = $fb.comp_list[comp_id][$fb_prg].tx;

                    $(".fb_wnd .ta").val(next_qst_ans); // Set new qst_tx to comment on
                }
                else
                {
                    $clidata.fb_tag = "qz";
                    $fb_prg = slot.ord;

                    // Form a question header
                    tx = $clidata.feedback.qz_list[$fb_prg];
                    if ($clidata.feedback.lock_qz_list[$fb_prg])
                        tx += "<div class='musthave'>*</div>";

                    $(".fb_wnd .ta_head").html(tx);
                    map.window_set("feedback", "show");

                    // Fill already given comment, if any
                    next_qst_ans = "";
                    if ($fb.qz_list.hasOwnProperty($fb_prg) && $fb.qz_list[$fb_prg].tx)
                        next_qst_ans = $fb.qz_list[$fb_prg].tx;
                    $(".fb_wnd .ta").val(next_qst_ans);

                }
                map.window_set("feedback", "show");
                break;
        }
    }
};

map.window_set = function (wnd_name, action) {
    console.log("map.window_set: " + wnd_name + ", action: " + action);
    switch (wnd_name){

        case "qst":
            if ("show" === action)
            {
                map.window_set("feedback", "hide");
                $(".qst_box").css("display","block");
                $(".qst_cntr").css("display","block");
                $(".hint_box").css("display","block");
                $(".ans_box").css("display","table");
                $(".btn[action='back']").css("display","block");
            }
            else
            {
                $(".qst_box").css("display","none");
                $(".qst_cntr").css("display","none");
                $(".hint_box").css("display","none");
                $(".ans_box").css("display","none");
                $(".btn[action='back']").css("display","none");
            }
            break;

        case "feedback":
            if ("show" === action)
            {
                map.window_set("qst", "hide");
                //$(".fb_wnd .ta_head").html(str);
                $(".fb_wnd").css("display","block");
                $(".btn[action='back']").css("display","block");
            }
            else
            {
                $(".fb_wnd").css("display","none");
                $(".btn[action='back']").css("display","none");
            }
            break;
    }
};

map.feedback_save = function () {
    let form = {};
    form.qkey = $qkey;
    form.rkey = $rkey;
    form.resp_ord = $clidata.resp_ord * 1;
    form.group_ord = $clidata.group_ord * 1;
    form.feedback = $fb; //  $(".ta").val();
    form.map_step = map.step;
    form.map_len = map.db.length;
    sendAJ("user_feedback", JSON.stringify(form)); // calls endscreen on success
};

map.start_screen = function () {
    console.log("map.start_screen");
    $(".qst_box").css("display","none");
    $(".ans_box").css("display","none");
    $(".btn[action='back']").css("display","none");
    if (!$clidata.hasOwnProperty('error'))
    {
        let $text = setIntroText();
        $(".content").append($text);

        $(".btn[action='start_qz']")
            .off("click")
            .click(function ()
            {
                // Remove self UI
                $(".invite_text").css("display", "none");
                $(this).css("display", "none");
                if ($clidata.hasOwnProperty("map_step"))
                {
                    map.step = $clidata.map_step;
                    map.next_step(); // "no_prg" excluded cuz map_step is the last saved answer, not unanswered step
                }
                else
                {
                    map.get_last_unanswered_step();
                    map.next_step("no_prg"); // since we already on the unnswered step ord - do not step on the next one with "no_prg" argument
                }


            });
    }
    // Short-end screen
    else
    {
        $(".persona").css("display","none");
        $(".qst_cntr").css("display","none");
        $(".footer").css("display","none");
        $(".client_body .head").css("background-color","white");
        $(".client_body").css("background-color","white");
        // NEW TEXT with exact reason explained
        let tx = $clidata.error;
        $(".content").append("<div class='invite_text' style='font-size: 26px; text-align: center;'>" + tx + "</div>");
    }
};


function setIntroText(){
    let tx = bld_intro_text($clidata.intro_tx);

    return "<div class='invite_text'>" + tx + "</div>" +
        "<div class='btn' action='start_qz'>НАЧАТЬ</div>";
}
//----------------------------------------------------------------------------------------------------------------------
function getUrlValue($param){
    let $x = location.search.indexOf($param+"=");
    if ($x !== -1) {
        $x = location.search.substring(location.search.indexOf($param + "=") + $param.length + 1);
        if ($x && $x.indexOf("&") !== -1) $x = $x.substring(0, $x.indexOf("&"));
    }
    if ($x && $x !== -1)
        return $x;
            else
                return null;
}
//----------------------------------------------------------------------------------------------------------------------
function roll_answer_delay(dur)
{
    // Show breakdown with grey scren for a N seconds
    $(".mask").css("display", "block");
    $saveans_timer = dur;
    $saveans_countdown = true;
    $saveans_interval = setInterval(function () {
        answer_record_tracker();
    }, 100);
}
//----------------------------------------------------------------------------------------------------------------------
function bld_feedback_blocks() {
    let s = "";

    // Build comment blocks structure for user feedback
    $comp_qsts_qnt = 0; // get total number of comment-qst for competentions (if enabled)
    if ($clidata.feedback.comp_after &&
        Object.keys($clidata.feedback.comp_list).length
    )
        Object.keys($clidata.feedback.comp_list).map(function (v) {
            let list = $clidata.feedback.comp_list[v];
            let comp_id = v * 1;
            $fb.comp_list[comp_id] = []; // slot for this comp
            if (null !== list && list.length)
            {
                $comp_qsts_qnt += list.length;
                for (let i=0; i<list.length; i++)
                    $fb.comp_list[comp_id].push({"tx": "", "accept":0}); // slot for each qst in this comp
            }
        });
    let $qz_qsts_qnt = 0; // get total number of comment-qst for qz_end (if enabled)
    if ($clidata.feedback.qz_after &&
        $clidata.feedback.qz_list.length)
    {
        $qz_qsts_qnt = $clidata.feedback.qz_list.length;
        for (let i=0; i<$qz_qsts_qnt; i++)
            $fb.qz_list.push({"tx": "", "accept":0});
    }

    $clidata.comm_comp_qnt = $comp_qsts_qnt;
    $clidata.comm_qz_qnt = $qz_qsts_qnt;

    if (($comp_qsts_qnt + $qz_qsts_qnt) &&
        $clidata.hasOwnProperty("fb_log") &&
        $clidata.fb_log &&
        $clidata.fb_log.length !== 0
    )
        $fb = duplicate($clidata.fb_log);


    // Change answer text
    $(".fb_wnd .ta").off("keyup")
        .keyup(function () {
            let comment_tx = $(".fb_wnd .ta").val().trim();

            if ($clidata.fb_tag === "qz")
            {
                $fb.qz_list[$fb_prg].tx = comment_tx;
            }
            else
            if ($clidata.fb_tag === "comp")
            {
                let comp_id = map.db[map.step].comp_id; //$clidata.comp_id_list[$qsts.last];
                $fb.comp_list[comp_id][$fb_prg].tx = comment_tx;
            }
        });

    // Submit answer text
    $(".feedback")
        .off("click")
        .click(function () {
            let comment_tx = $(".fb_wnd .ta").val().trim();
            let lock_item;

            if ($clidata.fb_tag === "qz")
            {
                $fb.qz_list[$fb_prg].tx = comment_tx;
                if ($clidata.feedback.lock_qz_list)
                    lock_item = $clidata.feedback.lock_qz_list[$fb_prg];
            }
            else
            if ($clidata.fb_tag === "comp")
            {
                let comp_id = map.db[map.step].comp_id; // $clidata.comp_id_list[$qsts.last];
                $fb.comp_list[comp_id][$fb_prg].tx = comment_tx;
                if ($clidata.feedback.lock_comp_list)
                    lock_item = $clidata.feedback.lock_comp_list[comp_id][$fb_prg];
            }

            if (lock_item && !comment_tx) // is mandatory nad not filled at all
                message_ex("show","info","direct","Данное поле комментария обязательно к заполнению.");
            else
            {
                roll_answer_delay(1.5);
                map.feedback_save(); //feedback_progress(1);
            }

        });
}


//----------------------------------------------------------------------------------------------------------------------
function sendAJ($tag,$data) {
    let z;
    if ($tag === "get_client_data")
    {
        z = 0;
        $ajResponse[z] = $.ajax({
            url: "Receiver.php",
            data: {"ajax": $tag, "client":true, "data":$data},
            method: "POST",
            cache: false
        })
            // -------------------------------------------------------------------------------------
            .done(function () {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        $clidata = JSON.parse($ajResponse[z].responseText);
                        $clidata.comments = {};
                        if ($clidata.hasOwnProperty('error'))
                        {
                            map.start_screen();
                        }
                        else
                        {
                            //if ($clidata.presets === null)
                            //    $clidata.presets = JSON.parse(JSON.stringify($presets));
                            map.db = duplicate($clidata.map);

                            $clidata.intro_tx = $clidata.intro_tx.replace(/%ФИО%/g, $clidata.resp_host);

                            if ($clidata.resp_slave.toLowerCase() === $clidata.resp_host.toLowerCase())
                                $selfGrade = true;

                            if ($clidata.hasOwnProperty("qsts"))
                            {
                                $qsts.max = 0;
                                $clidata.qsts.forEach(function (q_tx) {
                                    if (null !== q_tx)
                                        $qsts.max++;
                                });
                                $qsts.tx = duplicate($clidata.qsts);
                            }

                            //$(".p_client .tx").html("<span class='tag'>оценивающий:</span> " + $clidata.resp_slave);
                            $(".p_host .tx").html("<span class='tag'>Оценка сотрудника</span> " + $clidata.resp_host);
                            $("div.content").append(draw_answer_options());

                            // Set events for Inputs (for the last special qst)
                            $(".btn[action='back']")
                            .off("click")
                            .click(function(){
                                map.next_step("back");
                            });

                            bld_feedback_blocks();
                            console.log("clidata received");
                            console.log($clidata);
                            map.start_screen();
                            //map.next_step();
                        }

                    }
                    else
                    {
                        console.log("error to get clidata!");
                        $clidata = {};
                        $clidata.error = "Не удалось получить данные для опроса.";
                        map.start_screen();
                    }

                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function () {
                console.log("Failed "+$tag+"! " + $ajResponse[z].responseText);
            });
    }
    else
    if ($tag === "record_answer")
    {
        z = 1;
        $ajResponse[z] = $.ajax({
            url: "Receiver.php",
            data: {"ajax": $tag, "client":true, "data":$data},
            method: "POST",
            cache: false
        })
            // -------------------------------------------------------------------------------------
            .done(function () {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    if ($ajResponse[z].responseText)
                    {
                        $saveans_countdown = true;
                        map.next_step(); // saved successfully — moving on
                        $ctrl_block = false;
                    }
                    else
                        message_ex("show","info","direct","Не удалось сохранить данные.<br>При повторе ошибки обратитесь в техподдержку.");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function () {
                console.log("Failed "+$tag+" " + $ajResponse[z].responseText);
                $ctrl_block = false;
            });
    }
    else
    if ($tag === "on_report")
    {
        z = 4;
        $ajResponse[z] = $.ajax({
            url: "Receiver.php",
            data: {"ajax": $tag, "data":$data},
            method: "POST",
            cache: false
        })
            // -------------------------------------------------------------------------------------
            .done(function () {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200) {
                    if ($ajResponse[z].responseText)
                        msg("show", "Отчет успешно доставлен!", null);
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function () {
                console.log("Failed to report! " + $ajResponse[z].responseText);
                msg("show", "Ошибка! Отчет не был доставлен!", null);
            });
    }
    else
    if ($tag === "user_feedback")
    {
        z = 5;
        $ajResponse[z] = $.ajax({
            url: "Receiver.php",
            data: {"ajax": $tag, "data":$data},
            method: "POST",
            cache: false
        })
        // -------------------------------------------------------------------------------------
            .done(function () {
                if ($ajResponse[z].readyState === 4 && $ajResponse[z].status === 200)
                {
                    map.next_step();
                    console.log("feedback saved");
                }
            })
            // -------------------------------------------------------------------------------------
            .fail(function () {
                console.log("Failed to save a feedback " + $ajResponse[z].responseText);
                //msg("show", "Ошибка! Отчет не был доставлен!", null);
            });
    }
}
//----------------------------------------------------------------------------------------------------------------------
function msg($action, $caller, $info)
{
    switch ($action)
    {
        case "show":
        {
            $res = "";

            if ($caller === "report")
            {
                $res += "<div class='msg'>";
                    $res += "<div class='shroud'></div>";
                    $res += "<div class='wnd'>";
                        $res += "<div class='head' "+$nosel+">";
                            $res += "Выслать отчет об ошибке";
                        $res += "</div>";

                        $res += "<div class='fb_box'>";
                        $res += "<textarea class='error_desc' placeholder='описание проблемы'></textarea>";
                        $res += "</div>";
                $res += "<div class='hint_desc'>";
                $res += "Например, вы заметили ошибку в постановке вопроса или в вариантах ответов.<br>" +
                    "Или вы обнаружили техническую проблему опросника. Или может у вас есть предложения, как можно сделать опросник лучше";
                $res += "</div>";

                        $res += "<div class='btn_box' "+$nosel+">";
                            $res += "<div class='btn' id='report_cancel'>Закрыть</div>";
                            $res += "<div class='btn' id='report_create'>Отправить</div>";
                        $res += "</div>";
                    $res += "</div>";
                $res += "</div>";
            }
            else
            {
                $res += "<div class='msg' "+$nosel+">";
                    $res += "<div class='shroud'></div>";
                    $res += "<div class='wnd'>";
                        $res += "<div class='head'>";
                            $res += "Сообщение";
                        $res += "</div>";

                        $res += "<div class='desc'>"+$caller+"</div>";

                        $res += "<div class='btn_box' "+$nosel+">";
                            $res += "<div class='btn_single' id='close'>Закрыть</div>";
                        $res += "</div>";

                    $res += "</div>";
                $res += "</div>";
            }


            $(".client_body").append($res);

            // EVENTS
            if ($caller === "report")
            {
                $("#report_create")
                    .off("click")
                    .click(function()
                    {
                        $form = {};
                        $form.msg = $(".error_desc").val();
                        $form.receiver = $clidata.resp_slave;
                        $form.user = $clidata.resp_slave +" : " + $rkey;
                        $form.qz = $qkey;
                        sendAJ("on_report", JSON.stringify($form));
                        msg("hide", "report", null);
                    });

                $("#report_cancel")
                    .off("click")
                    .click(function(){
                        msg("hide", "report", null);
                    });
            }
            else
            {
                $("#close")
                    .off("click")
                    .click(function(){
                        msg("hide", "report", null);
                    });

                $("#finish")
                    .off("click")
                    .click(function(){
                        msg("hide", "report", null);
                        map.next_step("no_prg");
                    });
            }
            break;
        }

        case "hide":
        {
            if ($caller === "report")
            {
                $(".msg").remove();
            }
            else
            {
                $(".msg").remove();
            }

            break;
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function draw_answer_options()
{
    let $res = "";
    let list = $clidata.answer_opts_list;
    let qnt = list.length;
    let opt_width = Math.floor(100 / qnt);

    $res += "<table class='ans_box'><tr>";
    // Backwards style

    for (let i=qnt - 1; i>=0; i--)
    {
        let opt_tx = list[i];
        if (!$selfGrade || i !== (qnt - 1))
        {
            let mark = "";
            if (!$selfGrade && i === (qnt - 1))
                mark = "idk";

            $res += "<td ord="+i+" class='ans_line' pts='" + (qnt - i - 1) + "' "+$nosel+" style='width: "+ opt_width +"%;'>"; //
            $res += "<div class='opt' state='0' "+mark+"></div>";
            $res += "<div class='tx' >" + opt_tx + "</div>";
            $res += "</td>";
        }
    }

    /*
        list.forEach(function (opt_tx, opt_ord) {
            if (!$selfGrade || opt_ord !== (qnt - 1))
            {
                let pts_val = qnt - opt_ord - 1;
                $res += "<td ord=" + opt_ord + " class='ans_line' pts='" + pts_val + "' " + $nosel + " style='width: " + opt_width + "%;'>"; //
                $res += "<div class='opt' type='0'></div>";
                $res += "<div class='tx' >" + opt_tx + "</div>";
                $res += "</td>";
            }
        });
        */
    console.log("draw_answer_options called");
    $res += "</tr></table>";
    $res += "<div class='btn' action='back'>Назад</div>";
    return $res;
}
//----------------------------------------------------------------------------------------------------------------------
function endscreen() {
    console.log("endscreen rolled");
    $(".endscreen").css("display","block");
    $(".endscreen .logo").css("display","block");
    $(".persona").css("display","none");
    $(".save_feedback").css("display","none");

    map.window_set("qst", "hide");
    map.window_set("feedback", "hide");
}
//----------------------------------------------------------------------------------------------------------------------
function answer_record_tracker() {
    if ($saveans_countdown && $saveans_timer > 0)
    {
        $saveans_timer -= 0.1;
        $saveans_phase++;
        if ($saveans_phase > 5)
            $saveans_phase = 0;

        if (!$saveans_phase)
            $(".mask .msg").html("Ваш ответ сохраняется");
        else
        if ($saveans_phase === 1)
            $(".mask .msg").html(".Ваш ответ сохраняется.");
        else
        if ($saveans_phase === 2)
            $(".mask .msg").html("..Ваш ответ сохраняется..");
        else
        if ($saveans_phase === 3)
            $(".mask .msg").html("...Ваш ответ сохраняется...");
        else
        if ($saveans_phase === 4)
            $(".mask .msg").html("....Ваш ответ сохраняется....");
        else
            $(".mask .msg").html(".....Ваш ответ сохраняется.....");

        if ($saveans_timer <= 0)
        {
            $(".mask").css("display", "none");
            clearInterval($saveans_interval);
        }
    }
}

//----------------------------------------------------------------------------------------------------------------------
function save_chk()
{
    if ($unsaved_prg)
    {

        //if ($(".tools .save").css("border-color", "#fff"))
        if ($(".tools .save").css("border-color") === "rgb(255, 255, 255)")
            $(".tools .save").css("border-color", "rgb(255, 0, 0)");
        else
            $(".tools .save").css("border-color", "rgb(255, 255, 255)");

    }
}
//----------------------------------------------------------------------------------------------------------------------
window.mobilecheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
//----------------------------------------------------------------------------------------------------------------------
window.onload = function()
{
    //localStorage.clear();
    $selfGrade = false;
    if (getUrlValue("it"))
        is_test_link = true;

    $qkey = getUrlValue("q"); // Узнать в какой мы вкладке
    $rkey = getUrlValue("r"); // Узнать в какой мы вкладке
    if ($qkey && $rkey && $qkey.length === 5 && $rkey.length === 5)
    {
        let form = {};
        form.qkey = $qkey;
        form.rkey = $rkey;
        sendAJ("get_client_data", JSON.stringify(form));

        // Save checker
        if ($save_chk)
            clearInterval($save_chk);
        // Blink the save btn if there is unsaved proggress
        $save_chk = setInterval( function(){save_chk()} ,1500);

        $(".footer .report")
            .off("click")
            .click(function(){
                msg("show", "report", null);
                /*
                $form = {};
                sendAJ("on_save", JSON.stringify($form));
                */
            });}
    else
    {
        $clidata.error = "Ссылка не валидна.";
        map.start_screen();
    }


};
//----------------------------------------------------------------------------------------------------------------------
function hoverTouchUnstick() {
    // Check if the device supports touch events
    //if('ontouchstart' in document.documentElement) {
        // Loop through each stylesheet
        for(let sheetI = document.styleSheets.length - 1; sheetI >= 0; sheetI--) {
            let sheet = document.styleSheets[sheetI];
            // Verify if cssRules exists in sheet
            if(sheet.cssRules) {
                // Loop through each rule in sheet
                for(let ruleI = sheet.cssRules.length - 1; ruleI >= 0; ruleI--) {
                    let rule = sheet.cssRules[ruleI];
                    // Verify rule has selector text
                    if(rule.selectorText) {
                        // Replace hover psuedo-class with active psuedo-class
                        rule.selectorText = rule.selectorText.replace(":hover", ":active");
                    }
                }
            }
        }
    //}
}


/*
Сергей Матвеев http://evaluation.plarium.local/client.php?q=JQZQV&r=UGzyV

let form = {};
form.pts = -1;
form.qst_ord = 0;
form.resp_ord = 7;
form.group_ord = 0;
form.rkey = "UGzyV";
form.qkey = "JQZQV";
form.ans_list = [-1];
$.ajax({
    url: "http://evaluation.plarium.local/Receiver.php",
    data: {"ajax": "record_answer", "client":true, "data":JSON.stringify(form)},
    method: "POST",
    cache: false
}).done(function (data) {
        alert("Действие прошло успешно");
    });
* */

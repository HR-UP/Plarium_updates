//----------------------------------------------------------------------------------------------------------------------
function content_landing_front() {
    $nosel = "onselectstart='return false' onmousedown='return false'";
    $res = "<div class='land_box'>";
        //$res += "<div class='head'>Оценка 360</div>";
        $res += "<div class='btn revert_session' action='revert_session'>Восстановить последнюю сессию</div>";
        //$res += "<div class='head'>Основные шаги</div>";
        //$res += "<div class='icon'></div>";
        $res += "<div class='btn act_start'>Старт</div>";

        $res += "<div class='tx'>";
        $res += "Оценка строится на мнениях окружающих оцениваемого – руководителя, коллег и подчиненных.";
        $res += "</div>";
        $res += "<div class='btn act_load_manual'>Показать инструкцию</div>";

        $res += "<div class='hint'>";
        $res += "Вы можете провести оценку 360 с используя стандартные вопросы или добавив свои.<br>" +
            "Если Вам необходимы дополнительные функции или индивидуальная настройка отчетов<br>" +
            "- напишите об этом в службу поддержки, нажав на лого проекта в левом верхнем углу экрана.";
        $res += "</div>";


        if (null !== $pers.gang)
            $res += content_landing_crewmembers("get_html");

    $res += "</div>"; // land_box
    return $res
}
//----------------------------------------------------------------------------------------------------------------------
function content_landing_auth() {
    $nosel = "onselectstart='return false' onmousedown='return false'";
    $databank = {
        "login": "",
        "pass": ""
    };
    if (TEST_MODE)
        $databank = {
            "login": "deviatex@ukr.net",
            "pass": "12345"
        };

    $res = "";
    $res += "<div class='land_box'>";

        // HEAD
        $res += "<div class='head'>Вход</div>";
        //$res += "<div class='desc'>У вас нет аккаунта? <span class='auth_to_reg'>Зарегистрируйтесь.</span></div>";

        // Login
        $res += "<div class='entry_half'>";
        $res += "<label for='auth_login' "+$nosel+">Логин</label>";
        $res += "<input type='text' id='auth_login' class='auth_login' value='"+$databank.login+"'>";
        $res += "</div>";

        // Password
        $res += "<div class='entry_half'>";
        $res += "<label for='auth_pass' "+$nosel+">Пароль</label>";
        $res += "<input type='password' id='auth_pass' class='auth_pass' value='"+$databank.pass+"'>";
        $res += "</div>";

        // Submit btn
        $res += "<div class='btn auth_btn' "+$nosel+">Войти</div>";
        //$res += "<div class='desc'><span class='auth_to_passrec'>Забыли пароль?</span></div>";

    $res += "</div>";

    return $res
}
//----------------------------------------------------------------------------------------------------------------------
function content_landing_reg() {
    $nosel = "onselectstart='return false' onmousedown='return false'";
    $res = "";
    $databank = {
        "fio": ["","",""],
        "company": "",
        "spec": "",
        "mail": "",
        "phone": "",
        "pass": "",
        "pass_rep": "",
    };
    if (TEST_MODE)
        $databank = {
            "fio": ["Тестов","Вася","Johnson"],
            "company": "Шаролябия",
            "spec": "Пульверолог",
            "mail": "deviatex@ukr.net",
            "phone": "309509559090",
            "pass": "12345",
            "pass_rep": "12345",
        };


    $res += "<div class='land_box'>";
        // HEAD
        $res += "<div class='head'>Регистрация</div>";
        //$res += "<div class='desc'>Вся информация проходит проверку администратором.<br>" + "Администратор может отказать в регистрации,<br>если вы указали некорректные данные.</div>";

        // FIO
        $res += "<div class='entry'>";
            $res += "<div class='block'>";
                $res += "<label for='reg_login_1' "+$nosel+">Фамилия</label>";
                $res += "<input type='text' id='reg_login_1' class='auth_login_1' value='"+$databank.fio[0]+"'>";
            $res += "</div>";

            $res += "<div class='block'>";
                $res += "<label for='reg_login_2' "+$nosel+">Имя</label>";
                $res += "<input type='text' id='reg_login_2' class='auth_login_2' value='"+$databank.fio[1]+"'>";
            $res += "</div>";

            $res += "<div class='block'>";
                $res += "<label for='reg_login_3' "+$nosel+">Отчество</label>";
                $res += "<input type='text' id='reg_login_3' class='auth_login_3' value='"+$databank.fio[2]+"'>";
            $res += "</div>";
        $res += "</div>";

        // Company
        $res += "<div class='entry_half'>";
        $res += "<label for='reg_comp' "+$nosel+">Название компании</label>";
        $res += "<input type='text' id='reg_comp' class='reg_comp' value='"+$databank.company+"'>";
        $res += "</div>";


        // Company
        $res += "<div class='entry_half'>";
        $res += "<label for='reg_spec' "+$nosel+">Должность</label>";
        $res += "<input type='text' id='reg_spec' class='reg_spec' value='"+$databank.spec+"'>";
        $res += "</div>";

        // Mail
        $res += "<div class='entry_half'>";
        $res += "<label for='reg_mail' "+$nosel+">E-mail</label>";
        $res += "<input type='text' id='reg_mail' class='reg_mail' value='"+$databank.mail+"'>";
        //$res += "<span class='side_hint'>Администратор может отказать в регистрации, если вы указали личную почту.</span>";
        $res += "</div>";


        // Phone
        $res += "<div class='entry_half'>";
        $res += "<label for='reg_phone' "+$nosel+">Номер телефона</label>";
        $res += "<input type='text' id='reg_phone' class='reg_phone' value='"+$databank.phone+"'>";
        $res += "</div>";

        /*
        // Branch
        $res += "<div class='entry'>";
        $res += "<label for='reg_branch' "+$nosel+">Отрасль компании</label>";
        $res += "<input type='text' id='reg_branch' class='reg_branch'>";
        $res += "</div>";
        */

        // Password
        $res += "<div class='entry_half'>";
        $res += "<label for='reg_pass' "+$nosel+">Пароль</label>";
        $res += "<input type='password' id='reg_pass' class='auth_pass' value='"+$databank.pass+"'>";
        $res += "</div>";

        // Password
        $res += "<div class='entry_half'>";
        $res += "<label for='reg_pass_conf' "+$nosel+">Повтор пароля</label>";
        $res += "<input type='password' id='reg_pass_conf' class='auth_pass_conf' value='"+$databank.pass_rep+"'>";
        $res += "</div>";

        // Submit btn
        $res += "<div class='btn reg_btn' "+$nosel+">Зарегистрироваться</div>";

    $res += "</div>";

    return $res
}
//----------------------------------------------------------------------------------------------------------------------
function content_landing_crewmembers(action){
    if ("add_events" === action)
    {
        $(".gang_list .gang_btn")
            .off("click")
            .click(function(){
                let action = $(this).attr("action");
                let ord = $(this).closest("tr").attr("ord") * 1;
                let data = duplicate($pers.gang[ord]);
                data.ord = ord;

                switch (action) {
                    case "pass":
                        message_ex("show","gang_change","gang_change_pass",data);
                        break;

                    case "mail":
                        message_ex("show","gang_change","gang_change_mail",data);
                        break;

                    default: message_ex("show","info","direct","Не валидная олперация");
                }
            });
    }
    else
    {
        let s = "<table class='gang_list'>";
        s += "<tr><th colspan='5'>Список админов</th></tr>";
        s += "<tr><td>№</td><td>ФИО<br>почта</td><td>дата регистрации</td><td>дата последнего входа</td><td>действия</td></tr>";
        if ($pers.gang.length)
            $pers.gang.forEach(function (v_resp, i) {
                s += "<tr ord='"+ i +"'>";
                s += "<td>"+ (i + 1) +"</td>";

                let mail_string = "<span style='color: #0b42a7;'>" + v_resp.mail + "</span>";
                let name = v_resp.name.replace(/☼/g," ", v_resp.name);

                s += "<td>"+ name +"<br>"+ mail_string +"</td>"; // v_resp.name.replace(/☼/g," ", v_resp.name)
                //s += "<td>"+ v_resp.mail +"</td>";
                s += "<td>"+ decode_timestamp(v_resp.cd, "no_span") +"</td>";
                s += "<td>"+ decode_timestamp(v_resp.last_log, "no_span") +"</td>";
                s += "<td>"+
                    "<div class='gang_btn' action='pass'>сменить пароль</div>" +
                    "<div class='gang_btn' action='mail'>сменить почту</div>" +
                    "</td>";
                s += "</tr>";
            });
        s += "</table>";

        if ("get_html" === action)
            return s;
        else
        if ("update_self" === action)
        {
            $(".gang_list").empty();
            $(".land_box .hint").after(s);
            content_landing_crewmembers("add_events");
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------
function content_landing_events()
{
    $(".land_box .auth_btn")
        .off("click")
        .click(function(){
            let $form = {};
            $form.login = $("#auth_login").val();
            $form.pass = $("#auth_pass").val();
            sendAJ("auth", JSON.stringify($form));
        });

    // Proceed to registration from top control panel
    $(".land_box .top .btn")
        .off("click")
        .click(function(){
            $nav.screen = "land_reg";
            hide_sub_panels();
            show_content($nav.screen);
        });

    // Proceed to registration from auth wnd
    $(".auth_to_reg")
        .off("click")
        .click(function(){
            $nav.screen = "land_reg";
            show_content($nav.screen);
            //$(".land_box .top .btn").trigger("click");
        });

    $(".auth_to_passrec")
        .off("click")
        .click(function(){
            message("show", "pass_rec", "pass_recovery", null);
            //$(".land_box .top .btn").trigger("click");
        });


    // Do the registration
    $(".land_box .reg_btn")
        .off("click")
        .click(function(){
            /*
            reg_login
            reg_comp
            reg_spec
            reg_phone
            reg_mail
            reg_pass
            reg_pass_conf
            */
            let $form = {};
            $form.fio = $("#reg_login_1").val().trim() + "☼" + $("#reg_login_2").val().trim() + "☼" + $("#reg_login_3").val().trim();
            $form.spec = $("#reg_spec").val().trim();
            $form.comp = $("#reg_comp").val().trim();
            //$form.branch = $("#reg_branch").val();
            $form.phone = $("#reg_phone").val().trim().trim();
            $form.mail = $("#reg_mail").val().trim();
            $form.pass = $("#reg_pass").val();
            $form.pass_conf = $("#reg_pass_conf").val();

            if (!$form.fio)
                message_ex("show", "info", "direct", "Поля ФИО не заполнены.");
            else
            if ($form.pass.length < 3)
                message_ex("show", "info", "direct", "Пароль слишком короткий. Минимум - 3 символа.");
            else
            if ($form.pass !== $form.pass_conf)
                message_ex("show", "info", "direct", "Пароль и его подтверждение не совпадают.");
            else if (!$form.mail || !validate_email($form.mail))
                message_ex("show", "info", "direct", "Не указана или не валидна почта!");
            else
            {
                let err_found = false;
                /*
                let counter = 0;
                let prop_names = ["ФИО", "Рабочий e-mail"]; // "должность", "компания", "телефон",
                for (prop in $form)
                {
                    if ($form.hasOwnProperty(prop) && $form[prop].length === 0 && !err_found)
                    {
                        err_found = true;
                        message_ex("show", "info", "direct", "Поле "+prop_names[counter]+" не заполнено.");
                    }
                    counter++;
                }
                */

                if (!err_found)
                {
                    $form.login = $form.mail;
                    sendAJ("register", JSON.stringify($form));
                }

            }
        });


    // Download manual to project
    $(".act_load_manual")
        .off("click")
        .click(function(){
            if (getCookie("is_logged"))
            {
                window.open(PATH + "Оценка360_(гид по системе).pdf");
            }
        });

    // Download manual to project
    $(".act_start")
        .off("click")
        .click(function(){
            if (getCookie("is_logged"))
            {
                show_content("qz_create");
            }
        });

    // Revert to data from last session
    $(".revert_session")
        .off("click")
        .click(function(){
            message_ex("show","confirm","session_load",null);
        });

    content_landing_crewmembers("add_events");
}

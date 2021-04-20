function content_pers_cabinet()
{
    $nosel = "onselectstart='return false' onmousedown='return false'";
    $res = "";

    $res += "<div class='pers_cab_box'>";

        $res += "<div class='head'>Настройки</div>";
        //$res += "<div class='desc'>Пожалуйста, указывайте корректные данные, вся информация проходит проверку администратором.</div>";
        // FIO
        let fio = $pers.name.split("☼");
        for (let i=0; i<3; i++)
            if (fio[i] === undefined)
                fio[i] = "";
        $res += "<div class='entry'>";
        $res += "<label for='reg_login_1' "+$nosel+">Фамилия</label>";
        $res += "<input type='text' id='reg_login_1' class='auth_login_1' value='"+fio[0]+"'>";
        $res += "</div>";

        // FIO 2
        $res += "<div class='entry'>";
        $res += "<label for='reg_login_2' "+$nosel+">Имя</label>";
        $res += "<input type='text' id='reg_login_2' class='auth_login_2' value='"+fio[1]+"'>";
        $res += "</div>";

        // FIO 3
        $res += "<div class='entry'>";
        $res += "<label for='reg_login_3' "+$nosel+">Отчество</label>";
        $res += "<input type='text' id='reg_login_3' class='auth_login_3' value='"+fio[2]+"'>";
        $res += "</div>";

        // Mail
        $res += "<div class='entry'>";
        $res += "<label for='reg_login' "+$nosel+">Логин</label>";
        $res += "<input type='text' id='reg_login' class='reg_mail' value='"+$pers.login+"'>";
        $res += "</div>";

        // Mail
        $res += "<div class='entry'>";
        $res += "<label for='reg_mail' "+$nosel+">Рабочий e-mail</label>";
        $res += "<input type='text' id='reg_mail' class='reg_mail' value='"+$pers.mail+"'>";
        $res += "</div>";

        // Company
        $res += "<div class='entry'>";
        $res += "<label for='reg_spec' "+$nosel+">Должность</label>";
        $res += "<input type='text' id='reg_spec' class='reg_spec' value='"+$pers.comp+"'>";
        $res += "</div>";

        // Phone
        $res += "<div class='entry'>";
        $res += "<label for='reg_phone' "+$nosel+">Номер телефона</label>";
        $res += "<input type='text' id='reg_phone' class='reg_phone' value='"+$pers.phone+"'>";
        $res += "</div>";

        /*
        // Branch
        $res += "<div class='entry'>";
        $res += "<label for='reg_branch' "+$nosel+">Отрасль компании</label>";
        $res += "<input type='text' id='reg_branch' class='reg_branch'>";
        $res += "</div>";
        */

        // Password
        $res += "<div class='entry'>";
        $res += "<label for='reg_pass' "+$nosel+">Пароль</label>";
        $res += "<input type='password' id='reg_pass' class='auth_pass'>";
        $res += "</div>";

        // Password
        $res += "<div class='entry'>";
        $res += "<label for='reg_pass_new' "+$nosel+">Новый пароль</label>";
        $res += "<input type='password' id='reg_pass_new' class='auth_pass_conf'>";
        $res += "</div>";

        // Submit btn
        $res += "<div class='btn reg_btn' "+$nosel+">Подтвердить</div>";

    $res += "</div>";

    return $res
}
//----------------------------------------------------------------------------------------------------------------------
function content_pers_cabinet_events()
{

    $(".pers_cab_box .btn")
        .off()
        .click(function(){
            $form = {};
            $form.login = $("#reg_login").val();
            $form.mail = $("#reg_mail").val();
            let name = [];
            name.push($("#reg_login_1").val());
            name.push($("#reg_login_2").val());
            name.push($("#reg_login_3").val());
            $form.name = name[0]+ "☼" + name[1] + "☼" + name[2];
            $form.spec = $("#reg_spec").val();
            $form.pass = $("#reg_pass").val();
            // only add if new password is entered
            let new_pass = $("#reg_pass_new").val();
            if (new_pass)
                $form.pass_new = new_pass;
            $form.id = $pers.id;

            if (!$form.login)
                message_ex("show", "info", "direct", "Неверно указан логин!");
            else if (!$form.mail || !validate_email($form.mail))
                message_ex("show", "info", "direct", "Не указана или не валидна почта!");
            else if (!$form.pass)
                message_ex("show", "info", "direct", "Для изменения каких-либо данных нужно ввести свой пароль!");
            else if (!name[0] || !name[1])
                message_ex("show", "info", "direct", "Не указаны имя или фамилия!");
            else
                sendAJ("pers_update", JSON.stringify($form));
        })

}
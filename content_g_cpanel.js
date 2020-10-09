let db_landing = {};
// ---------------------------------------------------------------------------------------------------------------------
db_landing.intro_box = function () {
    let s = "";
    s += "<div class='intro'>";
    //if ($pers !== undefined && $pers !== null)
    //   s += "<div class='tab' tag='name'>" + $pers.name + "</div>";//$pers.name;
    if (getCookie("is_logged"))
    {
        s += "<div class='logo' mode='feedback'></div>";
        s += "<div class='logo' mode='log_show'></div>";
    }

    switch ($pers)
    {

        case undefined:
        case null:
            if ($nav.cr)
            {
                s += "<div class='tab' tag='land_auth'>"+$nav.tab_name.land_auth+"</div>";
                s += "<div class='tab' tag='land_reg'>"+$nav.tab_name.land_reg+"</div>";
            }
            //s += "<div class='tab' tag='land_auth'>"+$nav.tab_name.land_auth+"</div>";
            //s += "<div class='tab' tag='land_reg'>"+$nav.tab_name.land_reg+"</div>";
            break;

        default:
            switch ($pers.access)
            {
                // Logged in but not approved client

                // Logged in, super-admin + admin
                case 3:
                case 4:
                    s += "<div class='tab' tag='pers_cab'>"+$nav.tab_name.pers_cab+"</div>";
                    s += "<div class='tab' tag='quit'>"+$nav.tab_name.quit+"</div>";
                    break;

                case 5:
                    s += "<div class='tab' tag='pers_access'>"+$nav.tab_name.pers_access+"</div>";
                    s += "<div class='tab' tag='pers_cab'>"+$nav.tab_name.pers_cab+"</div>";
                    s += "<div class='tab' tag='quit'>"+$nav.tab_name.quit+"</div>";
                    break;

                // Admin
                case 10:

                    if ($manipulation)
                    {

                    }
                    else
                    {
                    }
                    s += "<div class='tab' tag='pers_access'>"+$nav.tab_name.pers_access+"</div>";
                    s += "<div class='tab' tag='pers_cab'>"+$nav.tab_name.pers_cab+"</div>";
                    s += "<div class='tab' tag='quit'>"+$nav.tab_name.quit+"</div>";
                    break;
            }
            break;
    }
    s += "</div>";
    return s;
};
//----------------------------------------------------------------------------------------------------------------------
db_landing.tabs_box = function () {
    let s = "";
    let tab_id = 0;
    Object.keys($nav.tab_box_names).map(function (tab_name)
    {
        tab_id++;
        s += "<div class='tab' tab_id='"+ tab_id +"' tag='"+tab_name+"'>"+$nav.tab_box_names[tab_name]+"</div>";
    });
    return s;
};
//----------------------------------------------------------------------------------------------------------------------
function content_g_cpanel()
{
    $nosel = "onselectstart='return false' onmousedown='return false'";
    let $res = "";

    // Logo
    //$res += "<div class='logo_box'>Exit система</div>";

    // Auth'ed persons FIO
    $res += "<div class='auth_box'>";
        $res += "<div class='logo' mode='default'></div>";
        $res += "<div class='autosave'></div>";
    $res += db_landing.intro_box();
        $res += "<div class='name'>Оценка 360</div>";
        //$res += "<div class='tab' tag='quit'>"+$nav.tab_name.quit+"</div>";

    $res += "</div>";
    return $res
}
//----------------------------------------------------------------------------------------------------------------------
function content_tabs_box()
{
    $nosel = "onselectstart='return false' onmousedown='return false'";
    let $res = "";
    $res += db_landing.tabs_box();
    return $res
}
//----------------------------------------------------------------------------------------------------------------------
function can_switch_to_tab(tab_tag) {
    let can_switch = false;
    let order = {
        "qz_create": 1,
        "qst": 2,
        "deli_set": 3,
        "options": 4,
        "deli_control": 5,
        "analytics": 6
    };

    // You want the first page or the page that was reached before (meaning you completed the rest of them before)
    if (order[tab_tag] < 5)
        can_switch = (order[tab_tag] === 1 || order[tab_tag] <= $new_qz.tab_progress_max);
    else
    if (order[tab_tag] === 5)
        can_switch = content_deli_control_qzs_status(); // can see deli_control if any unfinalized qzs present
    else
    if (order[tab_tag] === 6)
        can_switch = $ad.qzs.length; // can see analytics if any qzs present

    if (!can_switch)
        message_ex("show","info","direct","Данный раздел будет доступен позже, по мере заполнения опроса.");
    else
    if ($pers && $pers.access < 3 && tab_tag !== "analytics" && tab_tag !== "deli_control")
    {
        can_switch = false;
        message_ex("show","info","direct","Данные разделы закрыты для вашего уровня доступа.");
    }

        return can_switch;
}
//----------------------------------------------------------------------------------------------------------------------
function tab_id_by_name(tab_name) {
    let order = {
        "qz_create": 1,
        "qst": 2,
        "deli_set": 3,
        "options": 4,
        "deli_control": 5,
        "analytics": 6
    };

    // You want the first page or the page that was reached before (meaning you completed the rest of them before)
    return order[tab_name];
}
//----------------------------------------------------------------------------------------------------------------------
function content_g_cpanel_tab_update() {
    // Selected tab appearance to custom
    $(".tabs_box .tab").each(function () {
        let tab_id = $(this).attr("tab_id")*1;

        if (tab_id < 5)
        {
            if (tab_id === $new_qz.tab_progress)
            {
                $(this)
                    .css("background-image","url('img/tabsbox_arrow_1.png')") // Active tab
                    .css("color","white");
            }
            else if (tab_id <= $new_qz.tab_progress_max && $new_qz.tab_progress_max < 5) // dont show whole line as filled if we are in analytics or deli_control tabs
            {
                $(this)
                    .css("background-image","url('img/tabsbox_arrow_2.png')") // Filled tab, not active
                    .css("color","white");
            }
            else
            {
                $(this)
                    .css("background-image","url('img/tabsbox_arrow_0.png')") // All tabs appearance to default
                    .css("color","black")
            }
        }
        // Special markings for deli_control and analytics tabs
        else
        {
            if (tab_id === $new_qz.tab_progress)
            {
                $(this)
                    .css("background-image","url('img/tabsbox_arrow_1.png')") // Active tab
                    .css("color","white")
                    .css("opacity","1");
            }
            else
            {
                let qz_active_qnt = content_deli_control_qzs_status();

                // Deli control
                if (tab_id === 5)
                {
                    if (qz_active_qnt)
                        $(this)
                            .css("background-image","url('img/tabsbox_arrow_4.png')") // All tabs appearance to default
                            .css("color","white")
                            .css("opacity","1");
                    else
                        $(this)
                            .css("background-image","url('img/tabsbox_arrow_0.png')") // All tabs appearance to default
                            .css("color","black")
                            .css("opacity","0.4");
                }
                else
                // Analytics
                if (tab_id === 6)
                {
                    if ($ad.qzs.length)
                        $(this)
                            .css("background-image","url('img/tabsbox_arrow_4.png')") // All tabs appearance to default
                            .css("color","white")
                            .css("opacity","1");
                    else
                        $(this)
                            .css("background-image","url('img/tabsbox_arrow_0.png')") // All tabs appearance to default
                            .css("color","black")
                            .css("opacity","0.4");
                }
            }
        }

    });
}
//----------------------------------------------------------------------------------------------------------------------
function content_g_cpanel_events()
{
    // Reload tab colorizing events on default/hover/press/selected stances
    $(".auth_box .tab")
        .off("click")
        .click(function()
        {
            tag = $(this).attr("tag");
            // Must be dublicated here for selected tabs to change clrs correctly
            switch (tag)
            {
                // Auth chapters
                case "land_auth":
                case "land_reg":
                    new_qz_tab_progress(0);
                    $nav.screen = tag;
                    show_content(tag);
                    break;

                case "pers_cab":
                case "pers_access":
                    $nav.screen = tag;
                    show_content(tag);
                    break;

                // Auth chapters
                case "landing":
                case "help":
                    $nav.screen = tag;
                    show_content(tag);
                    break;

                // admin screen for avaliable users
                case "manip":
                    $nav.screen = "landing";
                    $manipulation = false;
                    for (p in $pers)
                        if (p !== "access" && p !== "id")
                            $crew[$host_uid][p] = $pers[p];
                    $pers = copy_arr($host);
                    $host = null;
                    show_content($nav.screen);
                    break;

                case "pers_settings":
                    wrap_index = $(this).attr("wrap") * 1;
                    wrap_index = 3 - wrap_index;
                    $(this).attr("wrap", wrap_index);

                    switch (wrap_index)
                    {
                        // close the tab (hide related tabs)
                        case 1:
                            break;
                        // open the tab (show related tabs)
                        case 2:
                            $(".tabs_box .sub_tab[tag='pers']").css("display", "block");
                            $(".tabs_box .sub_tab[tag='pers_cab']").css("display", "block");
                            //$(".tabs_box .sub_tab[tag='server_log']").css("display", "block");
                            break;
                    }
                    // clear the selected sub tabs
                    $nav.subscreen = "";
                    break;

                case "quit":
                    $nav.screen = tag;
                    sendAJ("g_cpanel_quit");
                    break;
            }
        });

    // Send feedback
    $(".auth_box .logo")
        .off("click")
        .click(function(){
            let tag = $(this).attr("mode");
            switch (tag)
            {
                case "feedback":
                case "default":
                    message_ex("show","feedback_form","send_feedback", null);
                    break;

                case "log_show":
                    window.open(PATH + "log_viewer.php");
                    break;
            }

        });

    content_g_cpanel_tab_update();

    // Reload tab colorizing events on default/hover/press/selected stances
    $(".tabs_box .tab")
        .off("click")
        .click(function()
        {
            let tag = $(this).attr("tag");
            // Must be dublicated here for selected tabs to change clrs correctly
            if (can_switch_to_tab(tag))
            {
                // Refresh content
                switch (tag)
                {
                    // Base chapters
                    case "qz_create":
                    case "qst":
                    case "deli_set":
                    case "options":
                        console.log("on tabs_box tab click ");
                        console.log($new_qz.settings.comm_groups);
                        $nav.screen = tag;
                        new_qz_tab_progress(tab_id_by_name($nav.screen)); // save progress to session
                        show_content(tag);
                        break;

                    case "deli_control":
                        if (content_deli_control_qzs_status()) // if any active unfinished quizes present
                        {
                            $nav.screen = tag;
                            new_qz_tab_progress(tab_id_by_name($nav.screen)); // save progress to session
                            $session.opened_qz_ord = null; // reset this id so the opening scren will get a qz-pick menu
                            show_content(tag);
                        }

                        break;

                    case "analytics":
                        if ($ad.qzs.length) // any quizes present
                        {
                            $nav.screen = tag;
                            $new_qz.analyt_screen_id = 1; // go to central tab (roster / comps table)
                            new_qz_tab_progress(tab_id_by_name($nav.screen)); // save progress to session
                            $session.opened_qz_ord = null; // reset this id so the opening scren will get a qz-pick menu
                            last_fb_opened.batch_ord = null;
                            show_content(tag);
                        }

                        break;
                }
            }

        });

        $(".auth_box .name")
        .off("click")
        .click(function()
        {
            if ($pers && $pers.access > 1) // don't let rookie to scout the system
            {
                $new_qz.tab_progress = 0;
                show_content("landing");

                $session.set(); // save session
                if ($session.last_data !== null)
                    $(".revert_session").css("display","block"); // show "session load" btn
            }
        });
}
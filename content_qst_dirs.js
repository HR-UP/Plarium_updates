//----------------------------------------------------------------------------------------------------------------------
function content_qst_dirs_fold_map_save() {
    //console.log("save folds");
    $new_qz.dirs_fold_map = [];
    $(".dirs_box .line").each(function () {
        let tag = $(this).find(".icon").attr("type");
        let is_fold = $(this).find(".folder").attr("is_fold");
        if (undefined === is_fold)
            is_fold = null;
        let uid = $(this).attr("uid");
        $new_qz.dirs_fold_map.push({uid: uid, is_fold: is_fold, tag: tag, class: "line_" + tag });
    });

    // State of panel folder
    $new_qz.dirs_fold_map.push({uid: -1, is_fold: $(".dirs_wnd .dirs_folder").attr("is_fold"), tag: "", class: ""});
    document.cookie = "dirs_fold_map=" + JSON.stringify($new_qz.dirs_fold_map);
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_dirs_fold_map_apply() {
    //console.log("apply folds");
    let x = getCookie("dirs_fold_map");
    if (x)
        $new_qz.dirs_fold_map = JSON.parse(x);


    // Fold/Unfold the panel
    let dirs_folder = null;
    for (let i=0; i<$new_qz.dirs_fold_map.length; i++)
        if (-1 === $new_qz.dirs_fold_map[i].uid)
        {
            dirs_folder = $new_qz.dirs_fold_map[i].is_fold * 1;
            break;
        }
    //console.log("dirs_folder " + dirs_folder);
    //console.log("html " + ($(".dirs_wnd .dirs_folder").attr("is_fold") * 1));
    let btn_state = $(".dirs_wnd .dirs_folder").attr("is_fold") * 1;
    if (null !== dirs_folder && dirs_folder !== btn_state)
        $(".dirs_wnd .dirs_folder").trigger("click");
    else if (btn_state === 0 && $(".dirs_box").css("display") === "none") // btn is not updatable, we upd the body and hid it, but btn remained as "opened"
    {
        $(".dirs_wnd .dirs_folder")
            .attr("is_fold", 1) // revert btn to it's objective state
            .trigger("click"); // switch it for all stuff to be shown
    }
    /*
    dirs_folder = $(".dirs_wnd .dirs_folder").attr("is_fold") * 1;

    if (dirs_folder === 0)
    {
        $(".dirs_box").css("display", "block"); // show the panel
        $(".dirs_wnd .icon[type='di']").css("display", "inline-block"); // show the btn on the head bar
    }
    */


    // Fold/Un fold the layers
    $(".dirs_box .line").each(function () {
        let is_fold = $(this).find(".folder").attr("is_fold");
        let uid = $(this).attr("uid");
        let tag = $(this).find(".icon").attr("type");
        for (let i=0; i<$new_qz.dirs_fold_map.length; i++)
            if (tag === $new_qz.dirs_fold_map[i].tag && uid === $new_qz.dirs_fold_map[i].uid && is_fold !== $new_qz.dirs_fold_map[i].is_fold)
            {
                $(this).find(".folder").trigger("click");
                break;
            }

    });
}
//----------------------------------------------------------------------------------------------------------------------
function content_qst_dirs(action, tag) {
    let s = "";
    /*
    let qb_stack = [];
    $ad.qbooks.forEach(function (v_qb) {
        qb_stack[v_qb.id] = v_qb.name;
    });
    */

    if (action === "add_events")
    {
        $(".dirs_wnd .icon")
            .off("mousedown")
            .mousedown(function () {
                //let layer = $(this).attr("type");
                let id = $(this).closest(".line").attr("uid") * 1;
                let is_qb = $(this).closest(".line").attr("is_qb") * 1;
                if ($(this).attr("type") === "qb" && is_qb)
                {
                    $curs.drag = true;
                    $curs.qb_id = id;
                    $(this)
                        .css("transform","rotate(15deg)")
                        .css("filter","grayscale(0%)");

                    // show "input to this dir" icons to all valid lovations
                    $(".dirs_wnd .icon").each(function () {
                        let is_qb = $(this).closest(".line").attr("is_qb") * 1;
                        let layer = dirs_get_layer_relative_tag("host", $(this).attr("type"));

                        if (layer !== "qb" && !is_qb)
                        {

                            let id = $(this).closest(".line").attr("uid") * 1;
                            if (isNaN(id))
                                id = 0;
                            if (null === layer)
                                layer = "";

                            let s = "<div class='dir_insert' uid='"+ id +"' tag='"+ layer +"'></div>";
                            $(this).append(s);
                        }
                    });

                    $(".dir_insert")
                        .mouseenter(function () {
                            if ($curs.drag && $curs.hasOwnProperty("qb_id"))
                            {
                                $(".dir_insert").css("filter","grayscale(100%)"); // gray all
                                $(this).css("filter","grayscale(0%)"); // saturate self

                                $curs.insert_folder = {
                                    id: $(this).attr("uid") * 1,
                                    tag: $(this).attr("tag")
                                };
                                console.log($curs.insert_folder);
                            }
                        })
                        .mouseleave(function () {
                            if ($curs.drag && $curs.hasOwnProperty("qb_id"))
                            {
                                $(this).css("filter","grayscale(100%)");
                                if ($curs.hasOwnProperty("insert_folder"))
                                    delete $curs.insert_folder;
                            }
                        });
                }

            })
            .off("click")
            .click(function () {
                let layer = $(this).attr("type");
                let id = $(this).closest(".line").attr("uid") * 1;
                if (isNaN(id))
                    id = null;

                let form = {
                    head: "",
                    tx: "",
                    action: "add",
                    layer: layer,
                    host_id: id
                };

                switch (layer) {
                    case "di":
                        form.head = "Добавить дивизион";
                        form.tx = "Введите название в поле ниже. Постарайтесь максимально сокращать названия.";
                        break;

                    case "de":
                        form.head = "Добавить департамент";
                        form.tx = "Введите название в поле ниже. Постарайтесь максимально сокращать названия.";
                        break;

                    case "br":
                        form.head = "Добавить отдел";
                        form.tx = "Введите название в поле ниже. Постарайтесь максимально сокращать названия.";
                        break;

                    case "tm":
                        form.head = "Добавить команду";
                        form.tx = "Введите название в поле ниже. Постарайтесь максимально сокращать названия.";
                        break;

                    case "st":
                        form.head = "Добавить подкоманду";
                        form.tx = "Введите название в поле ниже. Постарайтесь максимально сокращать названия.";
                        break;

                    case "sp":
                        form.head = "Добавить должность";
                        form.tx = "Введите название в поле ниже. Постарайтесь максимально сокращать названия.";
                        break;

                    case "gr":
                        form.head = "Добавить грейд";
                        form.tx = "Введите название в поле ниже. Постарайтесь максимально сокращать названия.";
                        break;
                }

                if (form.head)
                    message_ex("show","insert","dirs_structure", form);
            });

        $(".dirs_wnd .folder").off("click")
            .click(function () {
                let is_fold = $(this).attr("is_fold") * 1;
                is_fold = Math.abs(is_fold - 1); // switch 0-1 states
                $(this).attr("is_fold", is_fold);
                let type = $(this).closest(".header").find(".icon").attr("line");
                //console.log("type: " + type);
                let tag = ".line_" + $(this).closest(".header").find(".icon").attr("type"); // type line
                //let sublayer_tag = ".line_" + dirs_get_layer_relative_tag("child", tag);
                let new_display_state = "block";
                if (is_fold)
                    new_display_state = "none";

                let src = $(this).closest(".line");
                let host_id = src.attr("uid") * 1;
                src.find(tag).css("display", new_display_state); // show the sub-layer

                // Show all qbooks related to this particular layer
                $(".dirs_wnd .line_qb").each(function () {
                    let qb_id = $(this).attr("uid") * 1;
                    if($ad.qbooks.length)
                        for(let i=0; i<$ad.qbooks.length; i++)
                            if ($ad.qbooks[i].id === qb_id && $ad.qbooks[i].lay_id === host_id && $ad.qbooks[i].lay_name === type)
                            {
                                $(this).css("display", new_display_state);
                                break;
                            }
                })
                //content_qst_dirs_fold_map_save();
            });


        $(".qb_adapt")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Настроить опросник",
                    tx: "Нажмите чтобы раскрыть панель настроек для данного опросника.",
                    w: 400,
                    dx: -200,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let qb_id = $(this).closest(".line").attr("uid") * 1;
                for (i=0; i<$ad.qbooks.length; i++)
                    if (qb_id === $ad.qbooks[i].id)
                    {
                        $new_qz.qb_adapt_ord = i;
                        $new_qz.qb_adapt_id = $ad.qbooks[i].id;
                        qb_adapt("update_self");
                        break;
                    }
            });

        $(".header .name")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                let is_qb = $(this).closest(".line").attr("is_qb") * 1;
                if (isNaN(is_qb) || undefined === is_qb)
                    floater_hint("show",{
                        head: "Название слоя директории",
                        tx: "Нажмите чтобы показать/скрыть доп. панель функций.",
                        w: 400,
                        dx: -200,
                        dy: 30,
                    });
                else
                    floater_hint("show",{
                        head: "Название опросника",
                        tx: "Нажмите чтобы показать/скрыть доп. панель функций.",
                        w: 400,
                        dx: -200,
                        dy: 30,
                    });
            })
            .off("click")
            .click(function(){
                let show_panel = Math.abs($(this).attr("show_panel") * 1 - 1); // toggle 0-1

                // Reset all
                $(".toolbox").css("display", "none"); // hide all toolboxes
                $(".header .name").attr("show_panel", 0);

                // Set this
                $(this).attr("show_panel", show_panel);
                // Show this one (if opened)
                if (show_panel)
                {
                    let toolbox = $(this).closest(".header").find(".toolbox");
                    toolbox.css("display", "inline-block");
                }

            });

        $(".toolbox .qb_save")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Сохранить шаблон в эту папку",
                    tx: "Нажмите чтобы сохранить список вопросов ниже в шаблон опросника и поместить его в эту папку грейда.<br>" +
                    "Позже (на следующем экране) можно будет выбрать данный шаблон, чтобы настроить в нем вес каждого вопроса, а также его формулировку и наличие для разных ролей.",
                    w: 400,
                    dx: -200,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let form = {};
                form.lay_name = $(this).closest(".header").find(".icon").attr("line");
                form.lay_id = $(this).closest(".line").attr("uid") * 1;
                form.qst_list = $new_qz.qst_list;
                if (!form.qst_list.length)
                    message_ex("show","info","direct","Шаблон опросника, который Вы хотите сохранить, пуст.");
                else
                {
                    message_ex("show","insert","qbook_save_as", form);
                }
            });

        $(".toolbox .lay_rename")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Переименовать директорию",
                    tx: "Нажмите чтобы ввести новое имя директории.",
                    w: 400,
                    dx: -200,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let form = {};
                form.lay_name = $(this).closest(".line").find(".icon").attr("line") + "_list";
                form.lay_id = $(this).closest(".line").attr("uid") * 1;
                console.log("name "+ form.lay_name +" "+ form.lay_id);
                if ($pers.dirs[form.lay_name].length)
                {
                    let list = $pers.dirs[form.lay_name];
                    for (let i=0; i<list.length; i++)
                        if (list[i].id === form.lay_id)
                        {
                            form.lay_ord = i;
                            break;
                        }
                }
                message_ex("show","insert","dir_rename", form);
            });

        $(".toolbox .lay_delete")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Удалить директорию",
                    tx: "ВНИМАНИЕ: директория будет удалена вместе со всеми вложенными.",
                    w: 400,
                    dx: -200,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let form = {};
                form.label = $(this).closest(".header").find(".label").html();
                form.name = $(this).closest(".header").find(".name").html();
                form.lay_name = $(this).closest(".line").find(".icon").attr("line");
                form.lay_id = $(this).closest(".line").attr("uid") * 1;
                form.final_list = dirs_del_layer(form.lay_name, form.lay_id, "show");
                //console.log("deleting layer: " + form.lay_name + " id " + form.lay_id);
                console.log("final_qb_list is:");
                console.log(form.final_list);
                message_ex("show","confirm","dir_delete", form);
                //sendAJ("qbook_dirs_update", JSON.stringify(final_list)); // update all affected qbook relation tags
                //sendAJ("dirs_save", JSON.stringify($pers.dirs)); // update all affected qbook relation tags
            });

        $(".toolbox .qb_rename")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Переименовать опросник",
                    tx: "Нажмите чтобы ввести новое имя опросника.",
                    w: 400,
                    dx: -200,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let form = {};
                form.qb_id = $(this).closest(".line").attr("uid") * 1;
                form.qb_ord = get_qb_ord_from_qb_id(form.qb_id);
                message_ex("show","insert","qbook_rename", form);
            });

        $(".toolbox .qb_duplicate")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Дублировать опросник",
                    tx: "Копировать содержание опросника.",
                    w: 400,
                    dx: -200,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let form = {};
                form.lay_name = $(this).closest(".line").find(".icon").attr("line") + "_list";
                form.lay_id = $(this).closest(".line").attr("uid") * 1;
                form.qb_ord = get_qb_ord_from_qb_id(form.lay_id);
                console.log(form);
                message_ex("show","insert","qb_duplicate", form);
            });

        $(".toolbox .qb_resave_list")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Сохранить в шаблон ",
                    tx: "Сохранить текущий список вопросов в этот шаблон.<br>" +
                    "Произойдет полня перезапись списка вопросов.<br>" +
                    "Адаптивные настройки всех совпадающих вопросов будут сохранены, всех исколюченных - утеряны.<br>" +
                    "<b>Важно:</b> на все новые (относительного старого набора) вопросы получат адаптивные настройки по-умолчанию, " +
                    "а значит будут включены для всех ролей без альтернативных формулировок.",
                    w: 400,
                    dx: -200,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let form = {};
                form.lay_name = $(this).closest(".line").find(".icon").attr("line") + "_list";
                form.lay_id = $(this).closest(".line").attr("uid") * 1;
                form.qb_ord = get_qb_ord_from_qb_id(form.lay_id);
                form.name = $ad.qbooks[form.qb_ord].name;
                qb_adapt_update_structure(form.qb_ord); // refrom struct param in temp_struct of new_qz
                let this_temp_struct = $new_qz.temp_struct[form.lay_id];
                form.struct = duplicate(this_temp_struct);

                form.list = [];
                $new_qz.qst_list.forEach(function (v_qslot) {
                    form.list.push(v_qslot.id);
                });

                form.involved_qz_list = [];
                if ($ad.hasOwnProperty("qzs") && $ad.qzs.length)
                    $ad.qzs.forEach(function (v_qz, i_qz) {
                        //if (!v_qz.status) // quiz is not finished yet

                        let comm_gr = v_qz.settings.comm_groups;
                        let resps = v_qz.resps;
                        if (comm_gr.length)
                            comm_gr.forEach(function (v_gr, i_gr) {
                                if (v_gr.qb_id === form.lay_id) // some resp group in the qb has this qbook assigned
                                {
                                    let resp_gr = resps[i_gr];
                                    for (let i=0; i<resp_gr.length; i++)
                                        if (resp_gr[i].ans_list.length) // some chop already started to pass this quiz
                                        {
                                            let focus_name = get_resp_ord_from_resp_id(resp_gr[0].id); // get global ord of this group's focus-person
                                            focus_name = $ad.resps[focus_name].fio;
                                            let slot = {
                                                id: v_qz.id,
                                                ord: v_qz.i_qz,
                                                name: v_qz.name,
                                                focus: focus_name,
                                            };
                                            form.involved_qz_list.push(slot);
                                            break;
                                        }
                                }
                            });
                    });

                console.log(form);
                message_ex("show","confirm","qbook_resave", form);
            });


        $(".toolbox .qb_insert_to_list")
            .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove")})
            .mouseenter(function()
            {
                floater_hint("show",{
                    head: "Загрузить опросник в список",
                    tx: "Добавить все индикаторы (вопросы) этого опросника в список вопросов ниже.",
                    w: 400,
                    dx: -200,
                    dy: 20,
                });
            })
            .off("click")
            .click(function(){
                let qb_id = $(this).closest(".line").attr("uid") * 1;
                let qbook_ord = get_qb_ord_from_qb_id(qb_id);
                message_ex("show","confirm","qbook_template_insert",{"qbook_ord": qbook_ord});
            });
    }
    else
    {
        s += "<div class='dirs_box'>";
        s += dirs_bld_element_lines("di", null);
        s += "</div>";

        if (action === "get_html")
        {
            return s;
        }
        else
        if (action === "update_self")
        {
            content_qst_dirs_fold_map_save();
            $(".dirs_box").remove();
            $(".dirs_wnd").append(s);
            content_qst_dirs("add_events");
            content_qst_dirs_fold_map_apply();
        }
    }
}


//----------------------------------------------------------------------------------------------------------------------
function dirs_chk_unique_name(name, data) {
    let match_name = name.toLowerCase();
    let host_id = $pers.dirs[data.lay_name][data.lay_ord].host_id;
    let is_unique = true;

    let list = $pers.dirs[data.lay_name];
    if (list.length)
        for (let i=0; i<list.length; i++)
            // Not self, only in same subdir as our subject, names do match
            if (list[i].id !== data.lay_id && list[i].host_id === host_id && match_name === list[i].name.toLowerCase())
                {
                    match_name = false;
                    break;
                }

    return is_unique;
}
//----------------------------------------------------------------------------------------------------------------------
function dirs_siblings_exist(layer, id) {
    let found = false;
    let child_layer = dirs_get_layer_relative_tag("child", layer);

    // Serach among qbooks in root of this layer
    if ($ad.qbooks.length)
        for (let i=0; i<$ad.qbooks.length; i++)
            if ($ad.qbooks[i].lay_name === layer && $ad.qbooks[i].lay_id === id)
            {
                found = true;
                break;
            }
    // Search among existent sub-layers
    if (!found && null !== child_layer)
    {
        let sub_layname = child_layer + "_list";
        if ($pers.dirs.hasOwnProperty(sub_layname) && $pers.dirs[sub_layname].length)
            for (let i=0; i<$pers.dirs[sub_layname].length; i++)
                if ($pers.dirs[sub_layname][i].host_id === id)
                {
                    found = true;
                    break;
                }
    }
    return found;
}
//----------------------------------------------------------------------------------------------------------------------
function dirs_del_layer(layer, id, mode) {
    let lay_name = layer + "_list";
    let qbooks_change_list = {
        dirs: [],
        qbooks: []
    }; // all changed qbook records go here, for mass update later
    let layname_bank = {
        di_list: "дивизион",
        de_list: "департамент",
        br_list: "отдел",
        tm_list: "команда",
        st_list: "подкоманда",
        sp_list: "должность",
        gr_list: "грейд"
    };

    // Check qbooks in root level of this layer
    if ($ad.qbooks.length)
        $ad.qbooks.forEach(function (v_qb) {
            if (v_qb.lay_name === layer && v_qb.lay_id === id)
            {
                let slot = {
                    qb_id: v_qb.id,
                    lay_name: null,
                    lay_id: 0,
                };
                qbooks_change_list.qbooks.push(slot);
            }
        });
    //console.log("1) direct qbooks list in this layer:");
    //console.log(qbooks_change_list);

    // Delete this layer
    console.log("2) lay_name: " + lay_name);
    for (let i=0; i<$pers.dirs[lay_name].length; i++)
        if ($pers.dirs[lay_name][i].id === id)
        {

            //console.log("3) delete layer:" + lay_name);
            let slot = {
                label: layname_bank[lay_name],
                name: $pers.dirs[lay_name][i].name
            };
            qbooks_change_list.dirs.push(slot); // slot.label + " " + slot.name

            if (mode === "remove")
                $pers.dirs[lay_name].splice(i, 1); // remove this layer from the structure
            break;
        }


    // Search for sublayers
    let child_layer = dirs_get_layer_relative_tag("child", layer);
    if (null !== child_layer && "qb" !== child_layer)
    {
        //console.log("4) sublayer is: " + child_layer);
        let sub_layname = child_layer + "_list";
        if ($pers.dirs[sub_layname].length)
            $pers.dirs[sub_layname].forEach(function (sub_slot) {
                if (sub_slot.host_id === id)
                {
                    let sub_list_del = dirs_del_layer(child_layer, sub_slot.id, mode);
                    if (sub_list_del.dirs.length)
                        sub_list_del.dirs.forEach(function (v) {
                            qbooks_change_list.dirs.push(v);
                        });

                    if (sub_list_del.qbooks.length)
                    sub_list_del.qbooks.forEach(function (v) {
                        qbooks_change_list.qbooks.push(v);
                    });
                }
            })
    }
    return qbooks_change_list;
}
//----------------------------------------------------------------------------------------------------------------------
function dirs_get_layer_relative_tag(type, layer) {
    let name = null;

    if (type === "host")
    {
        switch (layer) {
            case "de":
                name = "di";
                break;

            case "br":
                name = "de";
                break;

            case "tm":
                name = "br";
                break;

            case "st":
                name = "tm";
                break;

            case "sp":
                name = "st";
                break;

            case "gr":
                name = "sp";
                break;

            case "qb":
                name = "gr";
                break;
        }
    }
    else
    if (type === "child")
    {
        switch (layer) {
            case "di":
                name = "de";
                break;

            case "de":
                name = "br";
                break;

            case "br":
                name = "tm";
                break;

            case "tm":
                name = "st";
                break;

            case "st":
                name = "sp";
                break;

            case "sp":
                name = "gr";
                break;

            case "gr":
                name = "qb";
                break;
        }
    }


    //if (null !== name)
    //    name += "_list";
    return name;
}
//----------------------------------------------------------------------------------------------------------------------
function dirs_chk_unique(layer, name, host_id) {
    // "host_id" is id of host-layer this layer is attached too
    let layname = layer + "_list";
    let is_unique = true;
    if ($pers.dirs.hasOwnProperty(layname) && $pers.dirs[layname].length)
    {
        let qnt = $pers.dirs[layname].length;
        for (let i=0; i<qnt; i++)
            if ($pers.dirs[layname][i].name.toLowerCase() === name && $pers.dirs[layname][i].host_id === host_id)
            {
                is_unique = false;
                break;
            }
    }
    return is_unique;
}


//----------------------------------------------------------------------------------------------------------------------
function dirs_bld_element_lines(layer, id) {

    function bld_related_qb_lines(layer, host_id) {
        let s = "";

        let qb_toolbox = "<div class='toolbox'>" +
            "<div class='qb_rename'></div>" +
            "<div class='qb_duplicate'></div>";

        if ($new_qz.qst_screen_id < 4)
        {
            qb_toolbox += "<div class='qb_insert_to_list'></div>"; // save qbook's list btn
            qb_toolbox += "<div class='qb_resave_list'></div>"; // save qbook's list btn
        }

        qb_toolbox += "</div>";


        if ($ad.qbooks.length)
            $ad.qbooks.forEach(function (v_qb) {
                if ((v_qb.lay_name === layer || (layer === null && !v_qb.lay_name)) && v_qb.lay_id === host_id)
                {
                    let mark = "";
                    if (!v_qb.lay_name)
                        mark = "toplvl";

                    s += "<div class='line line_qb' uid='"+ v_qb.id +"' "+mark+" is_qb='1'>";
                        s += "<div class='header'>";
                        s += "<div class='icon' type='qb' line='qb'></div>";

                        // Add adaptaion btn icon (only when in relevant screen)
                        if (4 === $new_qz.qst_screen_id)
                            s += "<div class='qb_adapt'></div>";

                        let is_adapted = 0;
                        let qb_ord = get_qb_ord_from_qb_id(v_qb.id);
                        if (null !== qb_ord && $ad.qbooks[qb_ord].struct)
                            is_adapted = 1;

                        s += "<span class='name' is_adapted='"+ is_adapted +"' show_panel='0'>" + v_qb.name + "</span>";
                        s += qb_toolbox ;
                        s += "</div>";
                    s += "</div>";
                }
            });
        return s;
    }

    let s = "";
    let lay_name = layer +"_list";
    let tag_labels = {
        di: "дивизион",
        de: "департамент",
        br: "отдел",
        tm: "команда",
        st: "подкоманда",
        sp: "должность",
        gr: "грейд",
    };

    let toolbox = "<div class='toolbox'>" +
        "<div class='lay_rename'></div>" +
        "<div class='lay_delete'></div>";

    // only for first screen
    if (4 !== $new_qz.qst_screen_id)
        toolbox += "<div class='qb_save'></div>";

    toolbox += "</div>";

    if ($pers.dirs.hasOwnProperty(lay_name))
    {
        if (layer === "di") // search for qbooks on top-most root lvl of layers (the default ones)
            s += bld_related_qb_lines(null, 0);

        let src = $pers.dirs[lay_name];
        //console.log("src of " + lay_name);
        //console.log(src);
        if (src.length) // Build lines of this layer level
            src.forEach(function (v_slot) {
                if (null === id || id === v_slot.host_id) // Only if this is a sub-layer for our upper-layer or root
                {
                    // Bld line of this layer
                    s += "<div class='line line_"+ layer +"' uid='"+ v_slot.id +"'>";
                    s += "<div class='header' >";
                    // Set icon for creation of next sub-level?
                    let child_lay_name = dirs_get_layer_relative_tag("child", layer);

                    // Folder arrow icon
                    if (dirs_siblings_exist(layer, v_slot.id))
                        s += "<div class='folder' is_fold='1'></div>";
                    else
                        s += "<div class='folder_dummy'></div>"; // white/box to occupty space and keep the margins intact

                    // Add sub-layer btn icon
                    if (null !== child_lay_name)
                        s += "<div class='icon' type='"+ child_lay_name +"' line='"+layer+"'></div>";


                    if (tag_labels.hasOwnProperty(layer))
                        s += "<span class='label'>" + tag_labels[layer] + "</span> " ; // icon

                    s += "<span class='name' show_panel='0'>" + v_slot.name + "</span>";
                    s += toolbox ; // Name of this layer's slot
                    s += "</div>";

                    let self_id = null;
                    if (v_slot.hasOwnProperty("id"))
                    {
                        self_id = v_slot.id;
                        s += bld_related_qb_lines(layer, self_id); // Bld all related qbooks

                        let child_layer = dirs_get_layer_relative_tag("child", layer); // There is a sub-layer based on a fixed structure
                        if (null !== child_layer)
                            s += dirs_bld_element_lines(child_layer, self_id);
                    }
                    s += "</div>";
                }
            })
    }

    return s;
}
//----------------------------------------------------------------------------------------------------------------------
function dirs_wnd_events() {
    $(".dirs_folder")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
        .mouseenter(function()
        {
            let head = "Показать/скрыть папки опросников",
                cont = "Нажмите чтобы отобразить/убрать панель подпапок.<br>Здесь можно управлять структурой директорий, и выбирать куда сохранить созданный в этом экране шаблон опросника.";
            let tx = "<div class='head'>" + head + "</div>" + cont;

            $(".floater")
                .css("display", "inline-block")
                .css("width", "400px")
                //.css("height", "350px")
                .css("left", ($curs.x-420)+"px")
                .css("top", ($curs.y)+"px")
                .css("border-color", "#4A67AD")
                .html(tx);
        })
        .off("click")
        .click(function(){
            let is_fold = $(this).attr("is_fold") * 1;
            is_fold = Math.abs(is_fold - 1);
            $(this).attr("is_fold", is_fold);
            if (is_fold)
            {
                $(".dirs_wnd .icon[type='di']").css("display", "none");
                $(".dirs_box").css("display", "none");
            }
            else
            {
                $(".dirs_wnd .icon[type='di']").css("display", "inline-block");
                $(".dirs_box").css("display", "block");
            }
        });

    $(".dirs_folding_save")
        .off("mouseenter").off("mouseleave").mouseleave(function() {floater_hint("remove");})
        .mouseenter(function()
        {
            let head = "Сохранить развертку папок",
                cont = "Нажмите, чтобы сохранить текущее состояние папок (какие раскрыты и какие нет).<br>" +
                    "Можно использовать когда настроена удобная развертка, и нужно чтобы она сохранилась после перезагрузок и переходов на другие экраны.";
            let tx = "<div class='head'>" + head + "</div>" + cont;

            $(".floater")
                .css("display", "inline-block")
                .css("width", "400px")
                //.css("height", "350px")
                .css("left", ($curs.x-420)+"px")
                .css("top", ($curs.y-20)+"px")
                .css("border-color", "#4A67AD")
                .html(tx);
        })
        .off("click")
        .click(function(){
            content_qst_dirs_fold_map_save();
            console.log();

            $(this).append("<div class='fold_save_anim' t='0'></div>");
            let fold_save_anim = setInterval(function ()
            {
                $(".fold_save_anim").each(function () {
                    let opa = $(this).css("opacity");
                    let t = $(this).attr("t") - 2;
                    if (opa <= 0)
                    {
                        $(this).remove();
                        clearInterval(fold_save_anim);
                    }
                    else
                        $(this)
                            .attr("t", t)
                            .css("top", t + "px")
                            .css("opacity", (opa - 0.05));
                });
            }, 50);
        });

    content_qst_dirs("add_events");
    content_qst_dirs_fold_map_apply();
}



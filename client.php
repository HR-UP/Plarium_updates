<html>

<head>
    <title>Оценка 360</title>
    <meta http-equiv="Content-Encoding" charset="UTF-8">
    <link rel="stylesheet/less" type="text/css" href="styles.less?<?php echo rand(0, 9999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="client_core.less?<?php echo rand(0, 9999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="styles_sysmes.less?<?php echo rand(0, 9999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="client_font/averia_libre.css">
    <script src="client.js?<?php echo rand(0, 9999999) ?>" type="text/javascript"></script>
    <script src="events_ex.js?<?php echo rand(0, 9999999) ?>" type="text/javascript"></script>
    <script src="common.js?<?php echo rand(0, 9999999) ?>" type="text/javascript"></script>
    <script src="../plugins/Less.js" type="text/javascript"></script>
    <script src="../plugins/jquery-3.0.0.js" type="text/javascript"></script>
</head>

<?php
    $nosel = "onselectstart='return false' onmousedown='return false'";
echo "
<body class='client_body'>
<div class='mask'><div class='msg'>Ваш ответ сохраняется</div></div>


    <div class='head' $nosel>
        <div class='box' $nosel>  
            <div class='persona ' $nosel>
                <div class='p_host' $nosel>
                    <div class='tx'></div>
                </div>   
            </div>
            <div class='logo'></div>".
            "<div class='label'>Оценка 360</div>
            <div class='qst_cntr' $nosel>
                <div class='tx'></div>
                <div class='comp_name'></div>
                <div class='fillbar_back'></div>
                <div class='fillbar_front'></div>
            </div>
        </div>
    </div>
    
    <div class='wrap'>
        
        <div class='content'>
            
            <div class='qst_box' $nosel></div>
            <div class='hint_box' $nosel>Выберите, насколько это утверждение верно.</div>
            
            <div class='fb_wnd'>
                <div class='ta_head'>?</div>
                <div class='es_head'>Оставьте комментарий</div>
                <textarea class='ta'></textarea>
                <div class='btn feedback' kind='next'>Дальше</div>    
            </div>
            
            
            <div class='endscreen'>
                <div class='logo'></div>
                <div class='es_head'>Спасибо за прохождение опроса!</div>
                <!-- <div class='es_desc'>Твои ответы помогут коллеге улучшать свои профессиональные и личностные качества</div> -->    
            </div>
        </div>
    </div>
    
    <div class='clearance'></div>
    <div class='footer'>
        <div class='box'>
            <div class='label'>Нашли ошибку, возникли проблемы при прохождении опроса<br>или есть предложения как сделать опрос лучше? Напишите нам:</div>
            <div class='report'>Сообщить об ошибке</div>
            
        </div>
    </div>
</body>
</html>
";
?>
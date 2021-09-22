<?php
    include_once "Receiver.php";
    $cDB = new DBase;
?>

<html>

<head>
    <title>Оценка 360</title>
    <meta http-equiv="Content-Encoding" charset="UTF-8">
    <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">

    <link rel="stylesheet/less" type="text/css" href="styles.less?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="style_analytics.less?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="styles_resp.less?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="fonts/averia_libre.css?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="styles_sysmes.less?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="styles_g_panel.less?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="styles_qz_create.less?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="styles_qst.less?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="styles_deli.less?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="styles_options.less?<?php echo rand(0,99999999) ?>">
    <link rel="stylesheet/less" type="text/css" href="styles_deli_control.less?<?php echo rand(0,99999999) ?>">

    <script src="front_auth.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="vars.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_landing.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_g_cpanel.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_pers.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>

    <script src="content_qst.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_qst_dirs.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_qst_adapt.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_answer_sets.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>

    <script src="content_deli.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_options.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_deli_control.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>

    <script src="content_pers_cabinet.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_pers_access.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="quiz_utils.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="qst_utils.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_results.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_calculus.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_calculus_type1.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_calculus_type2.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_calculus_type3.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_calculus_type4.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_calculus_type5.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_calculus_type6.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_calculus_type7.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_calculus_type8.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_feedback.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="content_qz_create.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>

    <script src="common.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="ajax.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="core.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="events_ex.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>


    <script src="utils.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>
    <script src="plugins/Chart.min.js" type="text/javascript"></script>
    <script src="plugins/chartjs-plugin-datalabels.js" type="module"></script> <!-- type="text/javascript" -->

    <script type="text/javascript" src="xlsx.js"></script>
    <script type="text/javascript" src="shim.js"></script>
    
    <link rel="stylesheet/css" type="text/css" href="plugins/Chart.css">
    <script src="plugins/Less.js" type="text/javascript"></script>
    <script src="plugins/jquery-3.0.0.js" type="text/javascript"></script>
    <script src="jquery.table2excel.min.js?<?php echo rand(0,99999999) ?>" type="text/javascript"></script>

    <script lang="javascript" src="plugins/xlsx.full.min.js?<?php echo rand(0,99999999) ?>"></script>
    <script lang="javascript" src="plugins/FileSaver.min.js"></script>
</head>
<body">

<?php //body -> oncontextmenu="return false;
$str = "";
$str .= "<div class='g_cpanel'></div>";
$str .= "<div class='tabs_box'></div>";
$str .= $cDB->add_tag("div", "", "g_content");
$str .= $cDB->add_tag("div", "", "footer");
echo $str;
?>
</body>
</html>

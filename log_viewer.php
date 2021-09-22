<?php
header('Content-type: text/html; charset=utf-8');
$table = "<table style='border-collapse: collapse; width: 100%'>";
$log = file_get_contents("log.txt");
//$log = str_replace("\\", "♀", $log);
$log = json_decode($log);
//$log = utf8_encode($log);
//$data_json = utf8_encode($log);
//$log = str_replace( "♀", "\\", $log);
$qnt = count($log);

while ($qnt)
{
    $prop = $log[--$qnt];
    $table .= "<tr><td style='border-bottom: 1px solid black; padding: 20px; 50px;'>";
    //foreach ($log as $val)


    if (isset($prop->user))
        $table .= "<div><b>" .str_replace("☼", " ", $prop->user) . "</b></div>";

    $table .= "<div>" .$prop->msg. "</div>";
    $table .= "<div>" .$prop->date. "</div>";


    $table .= "</td></tr>";
}

$table .= "</table>";

$body = "<html>

<head>
    <title>Оценка 360</title>
    <meta http-equiv='Content-Encoding' charset='TF-8'>
</head>
<body>" . $table . "</body>";

echo $body;

<?php
define("USE_LOCAL_MAIL_SERVER", false);// false if using Unisender, true if sending via local mail server by mail() php func

setcookie("is_local","false",time()+14400);
define("PATH", "/hr-up.online/public_html/".FOLDER."/");// change this, plarium domain chain here
define("SERVER","localhost");
define("USER","db_username"); // change this
define("PASS","db_userpassword"); // change this
define("DATABASE","db_name"); // change this
define("DURL","https://hr-up.online/".FOLDER."/"); // change this, plarium domain chain here


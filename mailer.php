<?php
$list_id = 12345678; // change this, 8-digit list ID
$api_key = "long_ass_api_key"; // change this, API key
include_once 'PHPMailer.php';
include_once 'POP3.php';
include_once 'Exception.php';
include_once 'SMTP.php';
include_once 'smtp_auth.php';
//****--------------------------------------------------------------------------------------------------------------****
function use_curl($data, $url, $tags=null){
    $er_list = array(
        "err_blacklisted" => "Сообщение отвергнуто из-за блеклистинга. Будет переотправлено.",
        "err_will_retry" => "Одна или несколько попыток доставки оказались неудачными, но попытки продолжаются. Статус неокончательный.",
        "err_resend" => "Фактически эквивалентен err_will_retry, с некоторыми несущественными внутренними особенностями.",
        "err_internal" => "Внутренний сбой. Необходима переотправка письма. Статус окончательный.",
        "err_user_unknown" => "Адрес не существует, доставка не удалась. Статус окончательный.",

        "err_user_inactive" => "Адрес когда-то существовал, но сейчас отключен. Доставка не удалась. Статус окончательный.",
        "err_mailbox_discarded" => "Почтовый ящик получателя удален. Статус окончательный.",
        "err_mailbox_full" => "Почтовый ящик получателя переполнен. Статус окончательный.",
        "err_no_dns" => "Нет записи или некорректная запись в DNS.",
        "err_no_smtp" => "Запись в DNS есть, но smtp сервер отсутствует.",

        "err_domain_inactive" => "Домен не принимает почту или не существует. Статус окончательный.",
        "err_destination_misconfigured" => "Домен не принимает почту из-за неверной настройки на стороне получателя, причем ответ сервера содержит информацию об устранимой причине (например, используется неработающий блеклист и т. п.)",
        "err_spam_rejected" => "Письмо отклонено сервером как спам.",
        "err_too_large" => "Письмо превышает допустимый размер по данным сервера получателя. Также причиной может быть отклонение письма сервером получателя из-за непринимаемого типа вложения. Например, .exe.",
        "err_giveup" => "В этот статус переводятся сообщения из статусов err_will_retry, err_resend после истечения срока повторных попыток.",

        "err_spam_removed" => "Отправка отменена из-за блокировки рассылки как спама. Статус неокончательный, может быть изменён на not_sent, delayed или err_spam_may_retry после переговоров с почтовой службой получателя.",
        "err_spam_may_retry" => "Эквивалент err_spam_rejected, но вы можете переотправить сообщение путём генерации нового такого же письма.",
        "ok_spam_folder" => "Письмо доставлено, но сервер получателя поместил его в папку «Спам». Статус окончательный.",
        "err_delivery_failed" => "Доставка не удалась по иным причинам. Статус окончательный.",
        "" => "",

        "err_skip_letter" => "Отправка отменена, так как email адрес недоступен (кроме случаев err_unsubscribed и err_not_allowed).",
        "err_spam_skipped" => "Отправка отменена из-за блокировки рассылки как спама. Результат неокончательный, может быть изменён на not_sent, delayed или err_spam_may_retry после переговоров с почтовой службой получателя.",
        "err_unsubscribed" => "Отправка не выполнялась, т.к. адрес, по которому пытались отправить письмо, ранее отписался. Вы можете пометить этот адрес как отписавшийся и в своей базе данных и больше не отправлять на него. Статус окончательный.",
        "err_src_invalid" => "Неправильный адрес отправителя. Используется, если «невалидность email-а отправителя» обнаружилась не на стадии приёма задания и проверки параметров, а на более поздней стадии, когда осуществляется детальная проверка того, что нужно отправить. Статус окончательный.",

        "err_dest_invalid" => "Неправильный адрес получателя. Используется, если «невалидность email-а получателя» обнаружилась не на стадии приёма задания и проверки параметров, а на более поздней стадии, когда осуществляется подробная проверка того, что нужно отправить. Статус окончательный.",
        "err_not_allowed" => "Отправка отменена, так как сотрудники технической поддержки заблокировали рассылку или же из-за заблокированного адреса получателя или блокировки вашего аккаунта. Статус окончательный.",
        "err_over_quota" => "Отправка отменена, из-за нехватки средств на счету или из-за превышений по тарифу.",
        "err_not_available" => "Адрес, по которому вы пытались отправить письмо, не является доступным (т.е. ранее отправки на него приводили к ответу от сервера вида  «адрес не существует» или «блокировка по спаму») Доступность адреса теоретически может быть восстановлена через несколько дней или недель, поэтому можно его не вычёркивать полностью из списка потенциальных адресатов. Статус окончательный.",
        "err_unreachable" => "	Отправка отменена, так как адрес недоступен, но, в отличие от статуса err_not_available, доступность адресу возвращена не будет. Статус окончательный.",

        "err_lost" => "Письмо не было отправлено из-за несогласованности его частей (например, в теле письма передается ссылка на изображение во вложениях, но само изображение во вложениях не передано), или было утеряно из-за сбоя на нашей стороне. Отправитель должен переотправить письмо самостоятельно, т.к. оригинал не сохранился. Статус окончательный.",

        "skip_dup_unreachable" => "Адрес недоступен, отправка не удалась. Статус окончательный.",
        "skip_dup_temp_unreachable" => "Адрес временно недоступен. Отправка не удалась. Статус окончательный.",
        "skip_dup_mailbox_full" => "Почтовый ящик получателя переполнен. Статус окончательный.",
        "not_sent" => "Сообщение еще не было обработано.",
        "ok_sent" => "Сообщение было отправлено, промежуточный статус до получения ответа о доставке/недоставке.",

        "ok_delivered" => "Сообщение доставлено. Может измениться на ‘ok_read’, ‘ok_link_visited’, ‘ok_unsubscribed’ или ‘ok_spam_folder’.",
        "ok_read" => "	Сообщение доставлено и зарегистрировано его прочтение. Может измениться на ‘ok_link_visited’, ‘ok_unsubscribed’ или ‘ok_spam_folder’.",
        "ok_fbl" => "Сообщение доставлено, но помещено в папку «спам» получателем.",
        "ok_link_visited" => "Сообщение доставлено, прочитано и выполнен переход по одной из ссылок. Может измениться на ‘ok_unsubscribed’ или ‘ok_spam_folder’.",
        "ok_unsubscribed" => "Сообщение доставлено и прочитано, но пользователь отписался по ссылке в письме. Статус окончательный."

    );

    //log_add("curl_init with data (" . json_encode($data, JSON_UNESCAPED_UNICODE) . ")");

    $ans = "";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_URL, $url);
    $result = curl_exec($ch);

    if ($result)
    {
        // Раскодируем ответ API-сервера
        $jsonObj = json_decode($result);
        // Ошибка в полученном ответе
        if (null === $jsonObj)
            log_add('Invalid JSON');
        // Ошибка отправки сообщения
        elseif (!empty($jsonObj->error))
            log_add('An error occured ' .  $jsonObj->error . $jsonObj->code);
        // Сообщение успешно отправлено
        else
        {
            // Return data if this is test curl for validity
            if ($url === "https://api.unisender.com/ru/api/checkEmail?format=json" && $tags === "reg_chk")
            {

                log_add("Email message to ".$data['email']." is sent. Message info " . json_encode($jsonObj));
                $ans = $jsonObj;
            }
            else
            {
                log_add("Email message to ".$data['email']." is sent. Message id " . $jsonObj->result->email_id);
                $ans = $jsonObj->result->email_id;
            }

        }

        // reports on delivery
        /*
        if ($tags !== null && $tags !== "no_chk_mail" && $tags !== "reg_chk" && is_object($jsonObj))
        {
            $args = array(
                'api_key' => "6hmi3r1s5ti4651fi1nrj13r5gy5e1p8nmjd1jjy",
                'email_id' => $jsonObj->result->email_id
            );
            sleep(45);
            $r = $this->use_curl(
                    $args,
                    "https://api.unisender.com/ru/api/checkEmail?format=json",
                    "reg_chk"
                );

            foreach ($r->result->statuses as $resp_status)
            {
                $s = explode("_", $resp_status->status);
                // https://api.unisender.com/ru/api/checkEmail?format=json&api_key=6hmi3r1s5ti4651fi1nrj13r5gy5e1p8nmjd1jjy&email_id=15722366257
                if ($s[0] === "ok" || $s[0] === "err" || $s[0] === "skip" || $resp_status->status === "ok_spam_folder")
                {
                    $this->sendMail("Отчет от сервиса", "
                    Отправлено на адрес ".$data["email"]." <br>
                    Пользователь: ".$_SESSION["pers"]["name"]." <br>
                    тел.: ".$_SESSION["pers"]["phone"]." <br>
                    почта: ".$_SESSION["pers"]["mail"]." <br>
                    статус: " . $er_list[$resp_status->status] , "info@hr-up.com", "no_chk_mail"); // deviatech@ukr.net info@hr-up.ru support@hr-consulting.online
                }
            }
        }
        */
    }
    // Ошибка соединения с API-сервером
    else
    {
        log_add('API access error' . json_encode(curl_getinfo($ch)));
    }
    return $ans;
}
//****--------------------------------------------------------------------------------------------------------------****
function sendMail($subject,$message,$mailto,$acc="off"){
    global $list_id, $api_key;
    $email_from_name = 'проект 360';
    //log_add("sendMail_init with data ($subject |  $mailto)");
    $done_message = str_replace("\n","<br>",$message);

    if (USE_LOCAL_MAIL_SERVER)
    {
        $boundary = "***";

        $header  = "--".$boundary."\r\n";
        $header .="Content-Transfer-Encoding: 8bits\r\n";
        $header .= "Content-Type: text/html; charset=utf-8\r\n\r\n"; // or utf-8 // or ISO-8859-1 // or cp1251
        $header .= $done_message."\r\n";
        $header .= "--".$boundary."\r\n";

        $header2 = "MIME-Version: 1.0\r\n";
        $header2 .= "From: ".$email_from_name." \r\n";
        $header2 .= "Return-Path:".SMTP_FROM_MAIL."\r\n";
        $header2 .= "Content-type: multipart/mixed; boundary=\"".$boundary."\"\r\n";
        $header2 .= $boundary."\r\n";

        // To called user
        return mail($mailto,$subject,$header,$header2);
    }
    else
    {
        /*
        // Создаём POST-запрос
        $request = array(
            'api_key' => $api_key,
            'email' => $mailto,
            'sender_name' => $email_from_name,
            'sender_email' => $from_mail,
            'subject' => $subject,//$subject,
            'body' => $done_message,
            'list_id' => $list_id
        );
        file_put_contents("last_sent_mail_addr.txt", $mailto);
        return use_curl($request, 'https://api.unisender.com/ru/api/sendEmail?format=json', $acc);
        */
        $mailer = new PHPMailer\PHPMailer\PHPMailer(true);
        try {
            //Server settings
            $mailer->IsSMTP(); // Send using SMTP
            $mailer->Host       = SMTP_HOST;                    // Set the SMTP server to send through
            $mailer->SMTPAuth   = true;                                   // Enable SMTP authentication
            $mailer->Username   = SMTP_USERNAME;                                  // SMTP username
            $mailer->Password   = SMTP_PASSWORD;                               // SMTP password
            $mailer->SMTPDebug  = 0;
            $mailer->SMTPAuth   = true;
            $mailer->SMTPSecure = "ssl";
            $mailer->Port       = SMTP_PORT;
            $mailer->Priority    = 3;
            $mailer->CharSet     = 'UTF-8';
            $mailer->Encoding    = '8bit';
            $mailer->ContentType = "text/html; charset=utf-8\r\n";

            //Recipients
            $mailer->setFrom(SMTP_FROM_MAIL, 'Plarium');
            //$mailer->addAddress('joe@example.net', 'Joe User');     // Add a recipient
            $mailer->addAddress($mailto);               // Name is optional
            $mailer->addReplyTo(SMTP_FROM_MAIL, 'Information');
            //$mailer->addCC('cc@example.com');
            //$mailer->addBCC('bcc@example.com');

            /*
            // Attachments
                $mailer->addAttachment('/var/tmp/file.tar.gz');         // Add attachments
                $mailer->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name
            */
            // Content
            $mailer->isHTML(true);                                  // Set email format to HTML
            $mailer->Subject = $subject;
            $mailer->Body    = $done_message;
            $mailer->AltBody = 'Get the HTML mail client you bum';

            if (!$mailer->send())
            {
                log_add($mailer->ErrorInfo);
                return 0;
            }
            else
            {
                log_add('Message has been sent');
                return 1;
            }
        }
        catch (Exception $e) {
            log_add("Message could not be sent. Mailer Error:" . $mailer->ErrorInfo );
            return 0;
        }
    }

}
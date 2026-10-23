<?php
declare(strict_types=1);
define('RQ_APP',true);require __DIR__.'/_lib/app.php';rq_headers();
try {
    $cookie=$_COOKIE['rq_received']??'';$parts=is_string($cookie)?explode('.',$cookie):[];
    $valid=count($parts)===3 && $parts[0]==='received' && preg_match('/^\d{10}$/D',$parts[1]) && (time()-(int)$parts[1])>=0 && (time()-(int)$parts[1])<=180 && hash_equals(hash_hmac('sha256',$parts[0].'.'.$parts[1],rq_secret()),$parts[2]);
    if (!$valid) { header('Location: /solicitud-recibida/',true,303);exit; }
    $html=file_get_contents(dirname(__DIR__).'/solicitud-recibida/index.html');
    if ($html===false) throw new RuntimeException('RECEIPT_NOT_FOUND');
    $html=str_replace(['Consulta tu solicitud','Comprueba la confirmación de envío','Esta página por sí sola no acredita que se haya enviado una solicitud. Revisa la confirmación que apareció al utilizar el formulario.'],['Solicitud registrada','Tu consulta ha quedado registrada','El registro no confirma una cita ni una intervención. Si necesitas aclarar algún detalle, contacta por teléfono o WhatsApp.'],$html);
    header('Content-Type: text/html; charset=utf-8');echo $html;
} catch (Throwable $e) {rq_reply(503,'Consulta el estado del envío por teléfono.');}

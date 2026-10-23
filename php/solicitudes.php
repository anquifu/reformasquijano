<?php
declare(strict_types=1);
define('RQ_APP',true);require __DIR__.'/_lib/app.php';rq_headers();
try {
    if (($_SERVER['REQUEST_METHOD']??'')!=='POST') {header('Allow: POST');rq_reply(405,'Método no permitido.');}
    if (!rq_origin_valid($_SERVER['HTTP_ORIGIN']??'')) rq_reply(403,'No se pudo verificar el origen del formulario.');
    if (!str_starts_with($_SERVER['CONTENT_TYPE']??'','application/x-www-form-urlencoded')) rq_reply(415,'Formato de solicitud no admitido.');
    if ((int)($_SERVER['CONTENT_LENGTH']??0)>16000) rq_reply(413,'La solicitud es demasiado larga.');
    $body=file_get_contents('php://input',false,null,0,16001);
    if ($body===false || strlen($body)>16000) rq_reply(413,'La solicitud es demasiado larga.');
    parse_str($body,$input);$token=$input['csrf']??'';$cookie=$_COOKIE['rq_form']??'';
    if (!is_string($token) || !is_string($cookie) || !rq_token_valid($token,$cookie)) rq_reply(403,'Recarga el formulario para iniciar una solicitud segura.');
    if (!empty($input['website']) || time()-(int)explode('.',$token)[1]<1) rq_reply(422,'Revisa los datos antes de enviar la solicitud.');
    if (!rq_rate($_SERVER['REMOTE_ADDR']??'unknown')) { header('Retry-After: 600');rq_reply(429,'Has realizado varios intentos. Espera unos minutos o llama al 602 089 887.'); }
    [$data,$errors]=rq_validate($input);
    if ($errors) rq_reply(422,'Revisa los campos indicados.',$errors);
    $saved=rq_save($data);if ($saved['created']) rq_notify($saved['id']);
    rq_reply(201,'Tu solicitud ha quedado registrada. El envío no confirma una cita ni una intervención.',[],$saved['id']);
} catch (Throwable $e) {
    if ($e->getMessage()==='IDEMPOTENCY_CONFLICT') rq_reply(409,'Esta solicitud ya se registró con otros datos. Recarga el formulario.');
    rq_reply(503,'No hemos podido confirmar el registro. Conserva tus datos y vuelve a intentarlo o llama al 602 089 887.');
}

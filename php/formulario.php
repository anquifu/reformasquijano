<?php
declare(strict_types=1);
define('RQ_APP',true);require __DIR__.'/_lib/app.php';rq_headers();
try {
    if (($_SERVER['REQUEST_METHOD']??'GET')!=='GET') {header('Allow: GET');rq_reply(405,'Método no permitido.');}
    if (($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site') rq_reply(403,'Abre el formulario desde nuestra web.');
    $form=rq_form_token();
    if (isset($_GET['token'])) rq_json(200,$form);
    $html=file_get_contents(dirname(__DIR__).'/presupuesto-reformas-a-coruna/index.html');
    if ($html===false) throw new RuntimeException('FORM_NOT_FOUND');
    foreach ($form as $name=>$value) $html=str_replace('name="'.$name.'" value=""','name="'.$name.'" value="'.htmlspecialchars($value,ENT_QUOTES,'UTF-8').'"',$html);
    header('Content-Type: text/html; charset=utf-8');echo $html;
} catch (Throwable $e) {rq_reply(503,'El formulario no está disponible. Llama al 602 089 887.');}

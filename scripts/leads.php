<?php
declare(strict_types=1);
if (PHP_SAPI!=='cli') {http_response_code(404);exit;}
define('RQ_APP',true);require dirname(__DIR__).'/dist/api/_lib/app.php';
$command=$argv[1]??'list';$id=$argv[2]??'';
if ($id && !preg_match('/^[a-f0-9]{32}$/D',$id)) {fwrite(STDERR,"Referencia inválida\n");exit(1);}
if ($command==='purge') {rq_lock(fn()=>rq_cleanup_locked());echo "Solicitudes caducadas eliminadas.\n";}
elseif ($command==='list') {foreach(glob(rq_private().'/lead-*.json')?:[] as $file){$row=rq_read($file);echo json_encode(array_intersect_key($row,array_flip(['id','created_at','classification','mail_state'])),JSON_UNESCAPED_UNICODE)."\n";}}
elseif ($command==='show' && $id) {echo json_encode(rq_read(rq_private().'/lead-'.$id.'.json')['data'],JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT)."\n";}
elseif ($command==='delete' && $id) {rq_lock(function()use($id){$file=rq_private().'/lead-'.$id.'.json';if(is_file($file))unlink($file);});echo "Solicitud eliminada.\n";}
elseif ($command==='retry') {
    $ids=rq_lock(function(){rq_cleanup_locked();$ids=[];foreach(glob(rq_private().'/lead-*.json')?:[] as $file){$row=rq_read($file);if($row['mail_state']==='sending' && $row['mail_started_at']<time()-300){$row['mail_state']='failed';rq_write($file,$row);}if(in_array($row['mail_state'],['pending','failed'],true)&&$row['mail_attempts']<5)$ids[]=$row['id'];}return array_slice($ids,0,20);});
    $accepted=0;foreach($ids as $id)if(rq_notify($id))$accepted++;echo "Revisadas: ".count($ids).". Aceptadas por el transporte: $accepted.\n";
} else {fwrite(STDERR,"Uso: php scripts/leads.php list|show ID|delete ID|purge|retry\n");exit(1);}

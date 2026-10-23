<?php
declare(strict_types=1);
ini_set('display_errors','0');
date_default_timezone_set('Europe/Madrid');
if (!defined('RQ_APP')) { http_response_code(404); exit; }
// Solo se distribuyen datos públicos. Los secretos y solicitudes se crean fuera de public_html.
function rq_site(): array { static $site; return $site ??= require __DIR__.'/site-config.php'; }
function rq_private(): string {
    static $path;
    if (isset($path)) return $path;
    $root = dirname(__DIR__, 2);
    $candidate = getenv('RQ_PRIVATE_DIR') ?: dirname($root).'/.quijano-private';
    if (!is_dir($candidate) && !mkdir($candidate, 0700, true) && !is_dir($candidate)) throw new RuntimeException('STORAGE_UNAVAILABLE');
    $resolved = realpath($candidate); $public = realpath($root);
    if (!$resolved || !$public || $resolved === $public || str_starts_with($resolved, $public.DIRECTORY_SEPARATOR)) throw new RuntimeException('PRIVATE_STORAGE_REQUIRED');
    chmod($resolved, 0700);
    return $path = $resolved;
}
function rq_lock(callable $fn): mixed {
    $lock = fopen(rq_private().'/.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('LOCK_UNAVAILABLE');
    chmod(rq_private().'/.lock',0600);
    try { return $fn(); } finally { flock($lock, LOCK_UN); fclose($lock); }
}
function rq_write(string $path, array $data): void {
    $tmp = $path.'.'.bin2hex(random_bytes(6)).'.tmp';
    try {
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        if (file_put_contents($tmp,$json,LOCK_EX) === false) throw new RuntimeException('STORAGE_UNAVAILABLE');
        chmod($tmp,0600);
        if (!rename($tmp,$path)) throw new RuntimeException('STORAGE_UNAVAILABLE');
    } finally { if (is_file($tmp)) unlink($tmp); }
}
function rq_read(string $path): array { return json_decode((string)file_get_contents($path),true,512,JSON_THROW_ON_ERROR); }
function rq_secret(): string {
    return rq_lock(function() {
        $path=rq_private().'/.secret';
        if (!is_file($path)) { $h=fopen($path,'x'); if (!$h) throw new RuntimeException('SECRET_UNAVAILABLE'); chmod($path,0600); fwrite($h,bin2hex(random_bytes(32))); fclose($h); }
        $secret=trim((string)file_get_contents($path)); if (strlen($secret)!==64) throw new RuntimeException('SECRET_INVALID'); return $secret;
    });
}
function rq_options(): array {
    $options=['mail_enabled'=>true,'mail_to'=>rq_site()['email'],'mail_from'=>rq_site()['email'],'retention_days'=>rq_site()['retentionDays']];
    $file=rq_private().'/config.php';
    if (is_file($file)) { $local=require $file; if (is_array($local)) $options=array_replace($options,$local); }
    if (getenv('RQ_MAIL_ENABLED') !== false) $options['mail_enabled']=getenv('RQ_MAIL_ENABLED')==='1';
    // La política mostrada en HTML y la limpieza deben coincidir.
    $options['retention_days']=rq_site()['retentionDays'];
    return $options;
}
function rq_cookie(string $name,string $value,int $age): void {
    setcookie($name,$value,['expires'=>time()+$age,'path'=>'/','secure'=>(!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off'),'httponly'=>true,'samesite'=>'Strict']);
}
function rq_token_valid(string $token,string $cookie): bool {
    if (strlen($token)>180 || !hash_equals($cookie,$token)) return false;
    $parts=explode('.',$token);
    if (count($parts)!==3 || !preg_match('/^[a-f0-9]{48}$/D',$parts[0]) || !preg_match('/^\d{10}$/D',$parts[1])) return false;
    $age=time()-(int)$parts[1];
    return $age>=0 && $age<3600 && hash_equals(hash_hmac('sha256',$parts[0].'.'.$parts[1],rq_secret()),$parts[2]);
}
function rq_form_token(): array {
    $token=$_COOKIE['rq_form']??'';
    if (!is_string($token) || !rq_token_valid($token,$token)) {
        $payload=bin2hex(random_bytes(24)).'.'.time();$token=$payload.'.'.hash_hmac('sha256',$payload,rq_secret());
    }
    rq_cookie('rq_form',$token,3600);
    return ['csrf'=>$token,'requestId'=>bin2hex(random_bytes(16))];
}
function rq_headers(): void {
    header('Cache-Control: no-store');header('X-Robots-Tag: noindex, nofollow');header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');header('X-Frame-Options: DENY');
}
function rq_json(int $code,array $data): never {
    http_response_code($code);header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);exit;
}
function rq_reply(int $code,string $message,array $errors=[],?string $reference=null): never {
    if (str_contains($_SERVER['HTTP_ACCEPT']??'','application/json')) rq_json($code,['ok'=>$code===201,'message'=>$message,'errors'=>(object)$errors]+($reference?['reference'=>$reference]:[]));
    if ($code===201) {
        $payload='received.'.time();rq_cookie('rq_received',$payload.'.'.hash_hmac('sha256',$payload,rq_secret()),180);
        header('Location: /api/confirmacion.php',true,303);exit;
    }
    http_response_code($code);header('Content-Type: text/html; charset=utf-8');
    $escaped=htmlspecialchars($message,ENT_QUOTES,'UTF-8');
    echo '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Revisa tu solicitud | Reformas Quijano</title><main><h1>'.$escaped.'</h1><ul>';
    foreach ($errors as $error) echo '<li>'.htmlspecialchars($error,ENT_QUOTES,'UTF-8').'</li>';
    echo '</ul><p>La solicitud no se ha registrado. Vuelve al formulario o llama al <a href="tel:+34602089887">602 089 887</a>.</p><a href="/api/formulario.php">Volver al formulario</a></main></html>';exit;
}
function rq_origin_valid(string $origin): bool {
    if (!$origin || $origin==='null') return false;
    $host=$_SERVER['HTTP_HOST']??'';
    if (!preg_match('/^[a-z0-9.\[\]:-]+$/i',$host)) return false;
    $scheme=(!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off')?'https':'http';
    return in_array($origin,[$scheme.'://'.$host,rq_site()['site']],true);
}
function rq_length(string $value): int { $count=preg_match_all('/./us',$value); return $count===false?-1:$count; }
function rq_validate(array $input): array {
    $data=[];$errors=[];
    foreach (['name','phone','email','municipality','service','budget','urgency','startDate','description','source','requestId'] as $key) $data[$key]=is_string($input[$key]??null)?trim($input[$key]):'';
    if (rq_length($data['name'])<2 || rq_length($data['name'])>100 || preg_match('/[\r\n<>]/',$data['name'])) $errors['name']='Escribe un nombre válido.';
    $data['phone']=preg_replace('/[\s().-]/','',$data['phone']);
    if (!preg_match('/^\+?\d{9,15}$/D',$data['phone'])) $errors['phone']='Escribe un teléfono válido.';
    if ($data['email'] && (strlen($data['email'])>254 || !filter_var($data['email'],FILTER_VALIDATE_EMAIL))) $errors['email']='Revisa el correo electrónico.';
    if (!in_array($data['municipality'],rq_site()['areas'],true)) $errors['municipality']='Selecciona un municipio atendido.';
    if (!isset(rq_site()['services'][$data['service']])) $errors['service']='Selecciona un servicio.';
    if (!in_array($data['budget'],['','menos-3000','3000-10000','10000-30000','mas-30000'],true)) $errors['budget']='Selecciona un presupuesto.';
    if (!in_array($data['urgency'],['sin-fecha','proximamente','fecha-prevista','consultar-disponibilidad'],true)) $errors['urgency']='Selecciona cuándo lo necesitas.';
    if ($data['startDate']) { $date=DateTimeImmutable::createFromFormat('!Y-m-d',$data['startDate']); if (!$date || $date->format('Y-m-d')!==$data['startDate'] || $data['startDate']<date('Y-m-d')) $errors['startDate']='Indica una fecha válida de hoy en adelante.'; }
    if ($data['urgency']==='fecha-prevista' && !$data['startDate']) $errors['startDate']='Indica la fecha aproximada.';
    if (rq_length($data['description'])<15 || rq_length($data['description'])>2500) $errors['description']='Describe el trabajo con entre 15 y 2500 caracteres.';
    if (($input['privacy']??'')!=='accepted') $errors['privacy']='Lee y acepta la información de privacidad.';
    if (!preg_match('/^[a-f0-9]{32}$/D',$data['requestId'])) $errors['requestId']='Recarga el formulario.';
    if (!in_array($data['source'],rq_site()['paths'],true)) $data['source']='/';
    return [$data,$errors];
}
function rq_cleanup_locked(): void {
    $cutoff=time()-rq_options()['retention_days']*86400;
    foreach (glob(rq_private().'/lead-*.json')?:[] as $path) {
        $row=rq_read($path);if ($row['created_at']<$cutoff) unlink($path);
    }
}
function rq_rate(string $ip): bool {
    $key=hash_hmac('sha256',$ip,rq_secret());
    return rq_lock(function() use($key) {
        $file=rq_private().'/.limits.json';$limits=is_file($file)?rq_read($file):[];$cutoff=time()-600;
        foreach ($limits as $k=>$times) { $limits[$k]=array_values(array_filter($times,fn($t)=>$t>$cutoff)); if (!$limits[$k]) unset($limits[$k]); }
        $allowed=count($limits[$key]??[])<12;
        if ($allowed) $limits[$key][]=time();
        rq_write($file,$limits);return $allowed;
    });
}
function rq_save(array $data): array {
    return rq_lock(function() use($data) {
        rq_cleanup_locked();$id=$data['requestId'];$file=rq_private().'/lead-'.$id.'.json';$hash=hash('sha256',json_encode($data,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR));
        if (is_file($file)) { $row=rq_read($file);if (!hash_equals($row['fingerprint'],$hash)) throw new RuntimeException('IDEMPOTENCY_CONFLICT');return ['id'=>$id,'created'=>false]; }
        $classification=['category'=>in_array($data['service'],['cerrajeria','desatascos'],true)?'incidencia':'reforma','service'=>$data['service'],'budget'=>$data['budget']?:'sin-definir','urgency'=>$data['urgency']];
        rq_write($file,['id'=>$id,'created_at'=>time(),'data'=>$data,'classification'=>$classification,'fingerprint'=>$hash,'consent_version'=>'2026-10-23-html-v1','mail_state'=>'pending','mail_attempts'=>0,'mail_started_at'=>0]);
        return ['id'=>$id,'created'=>true];
    });
}
function rq_notify(string $id): bool {
    $options=rq_options();if (!$options['mail_enabled']) return false;
    $file=rq_private().'/lead-'.$id.'.json';
    $row=rq_lock(function() use($file) {
        if (!is_file($file)) return null;$row=rq_read($file);
        if (!in_array($row['mail_state'],['pending','failed'],true) || $row['mail_attempts']>=5) return null;
        $row['mail_state']='sending';$row['mail_started_at']=time();$row['mail_attempts']++;rq_write($file,$row);return $row;
    });
    if (!$row) return false;
    $data=$row['data'];$sent=false;
    try {
        $to=$options['mail_to'];$from=$options['mail_from'];
        if (!filter_var($to,FILTER_VALIDATE_EMAIL) || !filter_var($from,FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/',$to.$from)) throw new RuntimeException('MAIL_CONFIG_INVALID');
        $headers=['From'=>$from,'MIME-Version'=>'1.0','Content-Type'=>'text/plain; charset=UTF-8','Message-ID'=>'<'.$id.'@reformasquijano.online>'];
        if ($data['email']) $headers['Reply-To']=$data['email'];
        $body="Referencia: $id\nNombre: {$data['name']}\nTeléfono: {$data['phone']}\nCorreo: {$data['email']}\nMunicipio: {$data['municipality']}\nServicio: ".rq_site()['services'][$data['service']]."\nPresupuesto: {$data['budget']}\nNecesidad: {$data['urgency']}\nFecha deseada: {$data['startDate']}\n\n{$data['description']}\n\nOrigen: {$data['source']}\nLa solicitud no confirma una intervención.";
        $sent=mail($to,'Solicitud web - Reformas Quijano',$body,$headers);
    } catch (Throwable $e) { $sent=false; }
    rq_lock(function() use($file,$sent) { if (!is_file($file)) return;$current=rq_read($file);$current['mail_state']=$sent?'accepted':'failed';rq_write($file,$current); });
    return $sent;
}

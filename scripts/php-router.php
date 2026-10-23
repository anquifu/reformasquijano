<?php
// Solo para pruebas locales: emula las rutas y .htaccess de Apache/LiteSpeed.
$root=realpath(__DIR__.'/../dist');$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
$raw=urldecode($path);if (preg_match('~(?:^|/)\.\.(?:/|$)~',$raw) || str_contains($raw,"\0") || str_starts_with($raw,'/api/_lib') || str_starts_with($raw,'/.')) {http_response_code(403);exit;}
$htaccess=file_get_contents($root.'/.htaccess');
if (preg_match('/Header always set Content-Security-Policy "([^"\n]+)"/',$htaccess,$m)) header('Content-Security-Policy: '.$m[1]);
if (str_contains($htaccess,'Header always set X-Robots-Tag')) header('X-Robots-Tag: noindex, nofollow');
header('X-Content-Type-Options: nosniff');
preg_match_all('/RewriteRule \^([^ ]+) ([^ ]+) \[R=301,L\]/',$htaccess,$matches,PREG_SET_ORDER);
foreach ($matches as $match) if (preg_match('~^'.$match[1].'~',ltrim($path,'/'))) {header('Location: '.$match[2],true,301);exit;}
$file=$root.$raw;
if (is_dir($file) && !str_ends_with($path,'/')) {header('Location: '.$path.'/',true,301);exit;}
if (is_dir($file)) $file.='/index.html';
if (is_file($file)) {
    if (str_ends_with($file,'.php')) {require $file;return true;}
    $mime=['html'=>'text/html; charset=utf-8','css'=>'text/css','js'=>'text/javascript','json'=>'application/json','svg'=>'image/svg+xml','webp'=>'image/webp','woff2'=>'font/woff2','txt'=>'text/plain','xml'=>'application/xml'];
    header('Content-Type: '.($mime[pathinfo($file,PATHINFO_EXTENSION)]??'application/octet-stream'));readfile($file);return true;
}
http_response_code(404);header('Content-Type: text/html; charset=utf-8');readfile($root.'/404.html');

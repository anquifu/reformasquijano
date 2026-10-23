import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
if(!existsSync('dist/index.html')){console.error('Ejecuta npm run build antes de iniciar la vista previa.');process.exit(1)}
const php=process.env.PHP_BIN||'php';
const server=spawn(php,['-S',`${process.env.HOST||'127.0.0.1'}:${process.env.PORT||4321}`,'-t','dist','scripts/php-router.php'],{stdio:'inherit',env:process.env});
server.on('error',()=>{console.error('Instala PHP 8.2 o superior o indica PHP_BIN. El hosting web ejecuta los archivos PHP directamente.');process.exitCode=1});
server.on('exit',code=>{process.exitCode=code||0});for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>server.kill(sig));

import { database, cleanup } from '../src/lib/leads.mjs';
const db = database();
const [command, id] = process.argv.slice(2);
if (command === 'purge') { cleanup(db); console.log('Limpieza de caducados completada.'); }
else if (command === 'list') {
  // Listado sin PII, accesible solo con permisos del servidor.
  console.table(db.prepare('SELECT id, datetime(created_at/1000, \'unixepoch\') AS created, classification, status, mail_state FROM leads ORDER BY created_at DESC LIMIT 50').all());
} else if (command === 'show' && id) {
  const row = db.prepare('SELECT data FROM leads WHERE id=?').get(id);
  if (!row) { console.error('Solicitud no encontrada.'); process.exitCode=1; }
  else console.log(JSON.stringify(JSON.parse(row.data),null,2));
} else if (command === 'delete' && id) { const result=db.prepare('DELETE FROM leads WHERE id=?').run(id); console.log(`Solicitudes eliminadas: ${result.changes}`); }
else { console.log('Uso: npm run leads -- list | show <id> | delete <id> | purge. show contiene datos personales: no copiar a logs compartidos.'); process.exitCode=1; }
db.close();

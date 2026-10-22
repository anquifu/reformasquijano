import { retryPending } from '../src/lib/mail.mjs';
import { mailEnabled } from '../src/lib/config.mjs';
if (!mailEnabled()) { console.error('SMTP y destinatario no configurados. Las solicitudes siguen guardadas.'); process.exitCode=1; }
else console.log(await retryPending());

function conversion(name: string, source: string, detail: Record<string,string> = {}) {
  // Evento local, sin transmisión, cookies analíticas ni datos personales.
  document.dispatchEvent(new CustomEvent('quijano:conversion', { detail: { name, source, ...detail } }));
}
document.querySelectorAll<HTMLAnchorElement>('[data-conversion]').forEach(link => link.addEventListener('click', () => conversion(link.dataset.conversion!, location.pathname)));
const menu = document.querySelector<HTMLDetailsElement>('.menu');
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.open) { menu.open = false; menu.querySelector('summary')?.focus(); } });
document.addEventListener('click', event => { if (menu?.open && !menu.contains(event.target as Node)) menu.open = false; });

document.querySelectorAll<HTMLFormElement>('[data-lead-form]').forEach(form => {
  const status = form.querySelector<HTMLElement>('.form-status')!;
  const button = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    form.querySelectorAll<HTMLElement>('.field-error').forEach(el => { el.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    sending = true; button.disabled = true; button.textContent = 'Enviando…';
    status.hidden = false; status.textContent = 'Estamos registrando tu solicitud.'; status.className = 'form-status';
    try {
      const body = new URLSearchParams();
      for (const [key,value] of new FormData(form)) if (typeof value === 'string') body.append(key,value);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      let response: Response;
      try { response = await fetch(form.action, { method:'POST', headers:{Accept:'application/json'}, body, signal:controller.signal }); }
      finally { clearTimeout(timeout); }
      const result = await response.json();
      if (!response.ok || !result.ok) {
        const entries = Object.entries(result.errors || {});
        let first: HTMLElement | null = null;
        for (const [field, error] of entries) {
          const input = form.elements.namedItem(field) as HTMLElement | null;
          input?.setAttribute('aria-invalid','true');
          const label = form.querySelector<HTMLElement>(`#error-${CSS.escape(field)}`);
          if (label) label.textContent = String(error);
          if (input && !first) first = input;
          input?.closest('details')?.setAttribute('open','');
        }
        status.textContent = result.message || 'No se ha podido registrar. Vuelve a intentarlo o llama al 602 089 887.';
        status.classList.add('is-error');
        (first || status).focus();
      } else {
        status.textContent = `${result.message} Referencia: ${String(result.reference).slice(0,8)}.`;
        status.classList.add('is-success');
        conversion('lead_registered', location.pathname, { service:String(body.get('service') || '') });
        form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea').forEach(el => el.disabled = true);
        button.textContent = 'Solicitud registrada'; button.disabled = true;
        status.focus(); return;
      }
    } catch {
      status.textContent = 'No hemos podido confirmar el envío. Conservamos lo que has escrito. Puedes reintentar sin duplicar la solicitud o llamar al 602 089 887.';
      status.classList.add('is-error'); status.focus();
    }
    sending = false; button.disabled = false; button.textContent = 'Solicitar presupuesto';
  });
});

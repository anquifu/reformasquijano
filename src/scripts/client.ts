function conversion(name: string, source: string, detail: Record<string,string> = {}) {
  // Evento local, sin transmisión, cookies analíticas ni datos personales.
  document.dispatchEvent(new CustomEvent('quijano:conversion', { detail: { name, source, ...detail } }));
}
document.querySelectorAll<HTMLAnchorElement>('[data-conversion]').forEach(link => link.addEventListener('click', () => conversion(link.dataset.conversion!, location.pathname)));
const menu = document.querySelector<HTMLDetailsElement>('.menu');
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.open) { menu.open = false; menu.querySelector('summary')?.focus(); } });
document.addEventListener('click', event => { if (menu?.open && !menu.contains(event.target as Node)) menu.open = false; });

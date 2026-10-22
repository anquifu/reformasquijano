import { business } from '../data/site.mjs';
import { siteUrl } from './config.mjs';
export function structuredData(page) {
  const orgId = `${siteUrl}/#organization`;
  const graph = [
    { '@type': 'Organization', '@id': orgId, name: business.name, url: `${siteUrl}/`, telephone: business.telephone, email: business.email, areaServed: business.areas.map(name => ({ '@type':'City',name })) },
    { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: business.name, inLanguage:'es-ES', publisher: {'@id':orgId} },
  ];
  if (page.type === 'service') graph.push({ '@type':'Service', '@id':`${siteUrl}${page.path}#service`, name:page.h1, description:page.intro, url:`${siteUrl}${page.path}`, provider:{'@id':orgId}, serviceType:page.id === 'cerrajeria' ? 'Apertura de puertas' : page.label, areaServed:business.areas.map(name=>({'@type':'City',name})) });
  if (page.path !== '/') graph.push({ '@type':'BreadcrumbList', '@id':`${siteUrl}${page.path}#breadcrumbs`, itemListElement:[{ '@type':'ListItem',position:1,name:'Inicio',item:`${siteUrl}/` },{ '@type':'ListItem',position:2,name:page.label,item:`${siteUrl}${page.path}` }] });
  return { '@context':'https://schema.org', '@graph':graph };
}

import {settings} from '@/lib/server/core';
export async function GET(){const s=await settings();return new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nDisallow: /pedido\nDisallow: /carrito\nDisallow: /finalizar-pedido\n'+(s.site_url?'Sitemap: '+s.site_url+'/sitemap.xml\n':''),{headers:{'Content-Type':'text/plain'}})}

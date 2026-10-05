import {readFile} from 'node:fs/promises';
export async function check({compiled=false}={}){
 const source=JSON.parse(await readFile('wrangler.jsonc','utf8'));
 const db=source.d1_databases?.find(x=>x.binding==='DB');
 if(!db||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(db.database_id)||/^0{8}-/.test(db.database_id))throw new Error('Falta el Database ID real. Ejecuta cf:configure o edita wrangler.jsonc.');
 if(!source.name)throw new Error('Falta configurar el nombre del Worker.');
 if(compiled){const built=JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
  const builtDb=built.d1_databases?.find(x=>x.binding==='DB');
  if(builtDb?.database_id!==db.database_id)throw new Error('El build usa una base anterior. Ejecuta pnpm run build otra vez.');
  if(built.name!==source.name)throw new Error('El nombre del Worker cambió. Compila de nuevo.');
 }
 return source;
}
if(process.argv[1]?.endsWith('check-cloudflare.mjs')){await check();console.log('Configuración D1 completa.');}

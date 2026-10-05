import {readFile} from 'node:fs/promises';
export async function check({compiled=false}={}){
 const source=JSON.parse(await readFile('wrangler.jsonc','utf8'));
 const db=source.d1_databases?.find(x=>x.binding==='DB'),bucket=source.r2_buckets?.find(x=>x.binding==='BUCKET');
 if(!db||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(db.database_id)||/^0{8}-/.test(db.database_id))throw new Error('Falta el Database ID real. Ejecuta cf:configure o edita wrangler.jsonc.');
 if(!bucket?.bucket_name||!source.name)throw new Error('Falta configurar R2 o el nombre del Worker.');
 if(compiled){const built=JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
 for(const [key,binding,field] of [['d1_databases','DB','database_id'],['r2_buckets','BUCKET','bucket_name']])if(built[key]?.find(x=>x.binding===binding)?.[field]!==source[key].find(x=>x.binding===binding)[field])throw new Error('El build usa recursos anteriores. Ejecuta pnpm run build otra vez.');
 if(built.name!==source.name)throw new Error('El nombre del Worker cambió. Compila de nuevo.');
 }
 return source;
}
if(process.argv[1]?.endsWith('check-cloudflare.mjs')){await check();console.log('Configuración completa. La existencia y permisos de los recursos se comprueban al conectar con Cloudflare.');}

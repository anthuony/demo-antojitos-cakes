import {readFile,writeFile,rm} from 'node:fs/promises';
const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i+=2){if(!['--database-id','--database-name','--bucket','--worker'].includes(args[i])||!args[i+1])throw new Error('Uso: pnpm run cf:configure --database-id ID-D1 [--database-name NOMBRE] [--bucket NOMBRE] [--worker NOMBRE]');options[args[i]]=args[i+1];}
if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(options['--database-id']||'')||/^0{8}-/.test(options['--database-id']))throw new Error('Indica el Database ID real que muestra Cloudflare D1.');
for(const key of ['--database-name','--bucket','--worker'])if(options[key]&&!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(options[key]))throw new Error('Nombre inválido: '+key);
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
config.d1_databases[0].database_id=options['--database-id'];
if(options['--database-name'])config.d1_databases[0].database_name=options['--database-name'];
if(options['--bucket'])config.r2_buckets[0].bucket_name=options['--bucket'];
if(options['--worker'])config.name=options['--worker'];
await writeFile('wrangler.jsonc',JSON.stringify(config,null,2)+'\n');
await rm('dist',{recursive:true,force:true});await rm('.wrangler/deploy',{recursive:true,force:true});
console.log('Configuración guardada. Ejecuta pnpm run build para generar el despliegue con estos recursos.');

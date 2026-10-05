import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {check} from './check-cloudflare.mjs';
const action=process.argv[2];
if(!['deploy','preview','migrate','secret'].includes(action))throw new Error('Acción inválida.');
await check({compiled:['deploy','preview'].includes(action)});
const require=createRequire(import.meta.url),cli=require.resolve('wrangler/bin/wrangler.js');
function run(args){const result=spawnSync(process.execPath,[cli,...args],{stdio:'inherit',env:process.env});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);}
if(action==='secret'){run(['secret','put','ADMIN_SETUP_TOKEN','--config','wrangler.jsonc']);}
else if(action==='preview'){throw new Error('Las compilaciones de ramas están desactivadas para evitar compartir los datos de producción. Usa una base y un bucket de pruebas antes de habilitarlas.');}
else {
 run(['d1','migrations','apply','DB','--remote','--config','wrangler.jsonc']);
 if(action==='deploy')run(['deploy','--config','dist/server/wrangler.json']);
}

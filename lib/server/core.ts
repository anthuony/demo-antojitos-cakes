import {env} from 'cloudflare:workers';
export {env};
export const uid=()=>crypto.randomUUID(),now=()=>new Date().toISOString();
export function db(){if(!env.DB)throw new Error('Base de datos no disponible');return env.DB;}
export const sql=(query:string,...args:any[])=>db().prepare(query).bind(...args.map(v=>v===undefined?null:v));
export async function all(query:string,...args:any[]):Promise<any[]>{return (await sql(query,...args).all()).results;}
export async function one(query:string,...args:any[]):Promise<any>{return sql(query,...args).first();}
export const run=(query:string,...args:any[])=>sql(query,...args).run();
export const batch=(queries:D1PreparedStatement[])=>db().batch(queries);
export async function settings(){return Object.fromEntries((await all('SELECT * FROM settings')).map(r=>[r.key,JSON.parse(r.value)]));}
export const audit=(actor:string,action:string,entity:string,id:string,detail:any={})=>run('INSERT INTO audit_logs (id,actor_id,action,entity,entity_id,detail,created_at) VALUES (?,?,?,?,?,?,?)',uid(),actor,action,entity,id,JSON.stringify(detail),now());
export class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
export function ensure(test:any,message:string,status=400):asserts test{if(!test)throw new HttpError(status,message);}
export const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
export async function digest(v:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),v=>v.toString(16).padStart(2,'0')).join('');}
export function equal(a:string,b:string){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
export async function passwordHash(pass:string,salt=random()){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveBits']);const v=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},k,256);return `pbkdf2:100000:${salt}:${Array.from(new Uint8Array(v),n=>n.toString(16).padStart(2,'0')).join('')}`;}
export const cookie=(r:Request,key:string)=>r.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(key+'='))?.slice(key.length+1)||'';
export const cookieHeader=(r:Request,key:string,value:string,age:number)=>`${key}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(r.url).protocol==='https:'?'; Secure':''}`;
export function csrf(r:Request){if(['GET','HEAD'].includes(r.method))return;const origin=r.headers.get('origin');ensure(origin&&new URL(origin).host===(r.headers.get('x-forwarded-host')||r.headers.get('host')||new URL(r.url).host),'Origen no permitido.',403);ensure(r.headers.get('sec-fetch-site')!=='cross-site','Origen no permitido.',403);}
export async function body(r:Request):Promise<any>{const text=await r.text();ensure(text.length<=1_000_000,'Solicitud demasiado grande.',413);try{return JSON.parse(text)}catch{throw new HttpError(400,'Datos no válidos.')}}
export async function throttle(r:Request,key:string,max=60,seconds=60){const ip=r.headers.get('cf-connecting-ip')||r.headers.get('x-real-ip')||'local';const id=await digest(key+ip+Math.floor(Date.now()/1000/seconds));const row=await one('INSERT INTO rate_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count',id,Date.now()+seconds*1000);ensure(row.count<=max,'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',429);}
export async function auth(r:Request){const key=cookie(r,'ac_session');const u=key?await one('SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>? AND u.active=1',await digest(key),Date.now()):null;ensure(u&&u.role==='ADMINISTRADOR','Inicia sesión para continuar.',401);return u;}
export function phone(v:string){let p=v.replace(/\D/g,'');if(p.length===11&&p.startsWith('0'))p='58'+p.slice(1);if(p.length===10)p='58'+p;ensure(p.length>=10&&p.length<=15,'Teléfono inválido.');return p;}
export function safeUrl(v:string){ensure(!v||v.startsWith('/')&&!v.startsWith('//')||/^https:\/\//.test(v),'Usa una dirección HTTPS o una ruta del sitio.');return v;}

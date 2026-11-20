import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {cookies} from 'next/headers';
import {getDb} from './db';
function secret(){
 if(process.env.AUTH_SECRET&&process.env.AUTH_SECRET.length>=32)return process.env.AUTH_SECRET;
 const fromDb=((getDb().settings as any)?.authSecret);
 if(fromDb&&typeof fromDb==='string'&&fromDb.length>=32)return fromDb;
 if(process.env.NODE_ENV==='production')throw new Error('AUTH_SECRET nÃ£o configurado.');
 const dir=path.join(os.homedir(),'.openbot-local-secrets');fs.mkdirSync(dir,{recursive:true});
 const file=path.join(dir,'leitura-session');if(!fs.existsSync(file))fs.writeFileSync(file,crypto.randomBytes(48).toString('hex'),{mode:0o600,flag:'wx'});
 return fs.readFileSync(file,'utf8');
}
export function hashPassword(password:string){if(password.length<12)throw new Error('Use pelo menos 12 caracteres.');const salt=crypto.randomBytes(16).toString('hex');return ['scrypt',salt,crypto.scryptSync(password,salt,64).toString('hex')].join('$');}
export function checkPassword(password:string,stored:string){try{const [kind,salt,hash]=stored.split('$');if(kind!=='scrypt'||!salt||!hash||password.length>256)return false;const a=crypto.scryptSync(password,salt,64),b=Buffer.from(hash,'hex');return a.length===b.length&&crypto.timingSafeEqual(a,b);}catch{return false;}}
export function safeEqual(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y);}
export function createSessionToken(username:string){const version=getDb().settings.sessionVersion||0;const payload=Buffer.from(JSON.stringify({user:username,exp:Date.now()+86400000,version})).toString('base64url');return payload+'.'+crypto.createHmac('sha256',secret()).update(payload).digest('base64url');}
export function verifySessionToken(token:string,user:string){try{const [payload,sig,...extra]=token.split('.');if(extra.length||!payload||!sig)return false;if(!safeEqual(sig,crypto.createHmac('sha256',secret()).update(payload).digest('base64url')))return false;const body=JSON.parse(Buffer.from(payload,'base64url').toString());return body.user===user&&Number.isFinite(body.exp)&&body.exp>Date.now()&&body.version===(getDb().settings.sessionVersion||0);}catch{return false;}}
export async function requireAdminAuth(){const token=(await cookies()).get('admin_session')?.value;return token&&verifySessionToken(token,getDb().settings.adminUser)?{authorized:true}:{authorized:false,error:'FaÃ§a login para continuar.'};}
export function sameOrigin(req:Request){try{const origin=req.headers.get('origin'),configured=process.env.APP_URL||getDb().settings.appUrl;const expected=configured?new URL(configured).origin:new URL(req.url).origin;return !!origin&&origin===expected;}catch{return false;}}
export function orderAccess(order:any,key:string){return !!order?.accessKey&&key.length>=32&&safeEqual(order.accessKey,key);}

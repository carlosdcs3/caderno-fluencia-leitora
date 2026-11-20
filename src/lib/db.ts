import fs from 'fs';
import path from 'path';
import {DEFAULT_PRODUCT} from './catalog';
export interface OrderBumpConfig {id:string;name:string;description:string;priceCents:number;deliveryType:'url'|'file';deliveryUrl?:string;fileName?:string;}
export interface ProductConfig {id:string;slug:string;title:string;headline:string;subheadline:string;badge:string;priceCents:number;originalPriceCents:number;deliveryType:'url'|'file';deliveryUrl?:string;fileName?:string;bumps:OrderBumpConfig[];active:boolean;comboPriceCents?:number;comboBumpIds?:string[];includedFiles?:{name:string;label:string}[];}
export interface StoreSettings {adminUser:string;adminPasswordHash:string;efiClientId?:string;efiClientSecret?:string;efiCertificate?:string;efiCertBase64?:boolean;efiPixKey?:string;efiSandbox?:boolean;wooviAppId?:string;resendApiKey:string;resendFromEmail:string;whatsmiauApiUrl:string;whatsmiauApiKey:string;whatsmiauInstance:string;sellerName?:string;sellerDocument?:string;supportEmail?:string;appUrl?:string;sessionVersion?:number;whatsappEnabled?:boolean;}
export interface AnalyticsEvent {id:string;lpSlug:string;event:'page_view'|'checkout_view'|'pix_generated'|'purchase';timestamp:string;metadata?:any;}
export interface OrderRecord {id:string;correlationID:string;lpSlug:string;customerName:string;customerEmail:string;customerPhone?:string;selectedBumps:string[];totalCents:number;status:'PENDING'|'PAID'|'FAILED';createdAt:string;paidAt?:string;whatsappDelivered?:boolean;accessKey?:string;plan?:string;files?:{name:string;label:string}[];idempotencyKey?:string;qrCodeImage?:string;brCode?:string;expiresDate?:string;emailStatus?:string;emailMessageId?:string;emailError?:string;whatsappStatus?:string;deliveryLease?:number;lastDeliveryAttempt?:number;test?:boolean;}
export interface DatabaseSchema {settings:StoreSettings;products:ProductConfig[];orders:OrderRecord[];analytics:AnalyticsEvent[];schemaVersion?:number;}
let connection:any;
function database(){
 const isVercel=Boolean(process.env.VERCEL||process.env.AWS_LAMBDA_FUNCTION_NAME);
 if(isVercel&&process.env.SALES_ENABLED==='true')throw new Error('Vendas bloqueadas: SQLite local nÃ£o persiste entre funÃ§Ãµes. Configure um banco persistente antes de ativar vendas nesta hospedagem.');
 if(connection)return connection;
 const dir=process.env.STORE_DATA_DIR||(isVercel?'/tmp/data':path.join(process.cwd(),'data'));fs.mkdirSync(dir,{recursive:true});
 const targetDb=path.join(dir,'store.sqlite');
 const {DatabaseSync}=require('node:sqlite');
 connection=new DatabaseSync(targetDb);
 connection.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, until INTEGER NOT NULL, count INTEGER NOT NULL);');
 connection.exec('BEGIN IMMEDIATE');
 try{
  if(!connection.prepare('SELECT id FROM state WHERE id=1').get()){
   const legacy=path.join(dir,'store.json');
   const data:DatabaseSchema=fs.existsSync(legacy)?JSON.parse(fs.readFileSync(legacy,'utf8')):{settings:{} as StoreSettings,products:[],orders:[],analytics:[]};
   data.settings=Object.assign({adminUser:'admin',adminPasswordHash:'',wooviAppId:'',resendApiKey:'',resendFromEmail:'',whatsmiauApiUrl:'',whatsmiauApiKey:'',whatsmiauInstance:''},data.settings,{sessionVersion:2});
   if(!data.settings.adminPasswordHash?.startsWith('scrypt$'))data.settings.adminPasswordHash='';
   data.products=data.products.filter(p=>p.slug!==DEFAULT_PRODUCT.slug);data.products.unshift(DEFAULT_PRODUCT);
   data.schemaVersion=3;
   connection.prepare('INSERT INTO state(id,value) VALUES(1,?)').run(JSON.stringify(data));
  }
  connection.exec('COMMIT');
 }catch(e){connection.exec('ROLLBACK');throw e;}
 return connection;
}
export function getDb():DatabaseSchema{return JSON.parse(database().prepare('SELECT value FROM state WHERE id=1').get().value);}
export function mutateDb<T>(fn:(data:DatabaseSchema)=>T):T{const db=database();db.exec('BEGIN IMMEDIATE');try{const data=getDb();const result=fn(data);db.prepare('UPDATE state SET value=? WHERE id=1').run(JSON.stringify(data));db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}
export function saveDb(data:DatabaseSchema){mutateDb(current=>{Object.assign(current,data);});}
export function rateLimit(key:string,max:number,windowMs:number){const db=database(),now=Date.now();db.exec('BEGIN IMMEDIATE');try{db.prepare('DELETE FROM limits WHERE until < ?').run(now);const row=db.prepare('SELECT * FROM limits WHERE key=?').get(key);if(row&&row.count>=max){db.exec('COMMIT');return false;}db.prepare('INSERT INTO limits(key,until,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,now+windowMs);db.exec('COMMIT');return true;}catch(e){db.exec('ROLLBACK');throw e;}}

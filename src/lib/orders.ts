import crypto from 'crypto';
import {getDb,mutateDb,OrderRecord} from './db';
import {config} from './config';
export function snapshotFiles(product:any,bumps:string[]){return [...(product.includedFiles?.length?product.includedFiles:[{name:product.fileName,label:product.title}]),...product.bumps.filter((b:any)=>bumps.includes(b.id)).map((b:any)=>({name:b.fileName,label:b.name}))];}
export function accessUrl(order:OrderRecord){return config().appUrl.replace(/\/$/,'')+'/obrigado?pedido='+encodeURIComponent(order.id)+'&acesso='+encodeURIComponent(order.accessKey||'');}
export function getEfiClient(){
 const s=config();
 if(!s.efiClientId||!s.efiClientSecret||!s.efiCertificate)throw new Error('ConfiguraÃ§Ã£o da EfÃ­ incompleta.');
 const EfiPay=require('sdk-node-apis-efi');
 return new EfiPay({client_id:s.efiClientId,client_secret:s.efiClientSecret,certificate:s.efiCertificate,cert_base64:Boolean(s.efiCertBase64),sandbox:Boolean(s.efiSandbox)});
}
export async function verifyCharge(correlationID:string){
 const s=config();
 if(s.efiClientId&&s.efiClientSecret&&s.efiCertificate){
  const efipay=getEfiClient();
  const charge=await efipay.pixDetailCharge({txid:correlationID});
  if(!charge||charge.txid!==correlationID)throw new Error('Resposta de pagamento invÃ¡lida da EfÃ­.');
  const valueCents=Math.round(parseFloat(charge.valor?.original||'0')*100);
  return {correlationID:charge.txid,value:valueCents,status:charge.status==='CONCLUIDA'?'COMPLETED':charge.status};
 }
 const key=s.wooviAppId;if(!key)throw new Error('Pagamento nÃ£o configurado.');
 const response=await fetch('https://api.woovi.com/api/v1/charge/'+encodeURIComponent(correlationID),{headers:{Authorization:key},cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('NÃ£o foi possÃ­vel confirmar o pagamento no gateway.');
 const {charge}=await response.json();
 if(!charge||charge.correlationID!==correlationID||!Number.isSafeInteger(charge.value))throw new Error('Resposta de pagamento invÃ¡lida.');
 return charge;
}
export async function reconcile(correlationID:string){
 const before=getDb().orders.find(o=>o.correlationID===correlationID);if(!before)throw new Error('Pedido nÃ£o encontrado.');
 if(before.status==='PAID'){await deliver(before.id);return getDb().orders.find(o=>o.id===before.id)!;}
 const charge=await verifyCharge(correlationID);
 if(charge.value!==before.totalCents)throw new Error('Valor do pagamento nÃ£o confere.');
 if(charge.status!=='COMPLETED')return before;
 mutateDb(db=>{const order=db.orders.find(o=>o.id===before.id)!;if(order.status==='PAID')return;order.status='PAID';order.paidAt=new Date().toISOString();db.analytics.push({id:crypto.randomUUID(),lpSlug:order.lpSlug,event:'purchase',timestamp:order.paidAt,metadata:{orderId:order.id,totalCents:order.totalCents}});});
 await deliver(before.id);return getDb().orders.find(o=>o.id===before.id)!;
}
export async function deliver(orderId:string,force=false){
 const claimed=mutateDb(db=>{const o=db.orders.find(x=>x.id===orderId);if(!o||o.status!=='PAID'||!o.accessKey||!o.files)return null;const now=Date.now();if(o.deliveryLease&&o.deliveryLease>now)return null;if(!force&&o.lastDeliveryAttempt&&now-o.lastDeliveryAttempt<60000)return null;
 if(o.emailStatus==='accepted'&&(!o.customerPhone||!config().whatsappEnabled||o.whatsappStatus==='accepted'))return null;
 o.deliveryLease=now+120000;o.lastDeliveryAttempt=now;return {...o};});
 if(!claimed)return;
 const s=config(),url=accessUrl(claimed);
 try{
  if(claimed.emailStatus!=='accepted'){
   let status='failed',messageId='',reason='ServiÃ§o de e-mail nÃ£o configurado.';
   if(s.resendApiKey&&s.resendFromEmail)try{
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+s.resendApiKey,'Content-Type':'application/json','Idempotency-Key':'delivery-'+claimed.id},body:JSON.stringify({from:s.resendFromEmail,to:[claimed.customerEmail],subject:'Seus materiais de leitura estÃ£o disponÃ­veis',text:'OlÃ¡, '+claimed.customerName+'. Seu pagamento foi confirmado. Acesse os arquivos do seu pedido: '+url+'\n\nSuporte: '+s.supportEmail}),signal:AbortSignal.timeout(15000)});
    const result=await r.json();if(r.ok&&typeof result.id==='string'){status='accepted';messageId=result.id;reason='';}else reason='Provedor nÃ£o aceitou o envio.';
   }catch{reason='Falha de conexÃ£o com o provedor.';}
   mutateDb(db=>{const o=db.orders.find(x=>x.id===orderId)!;o.emailStatus=status;o.emailMessageId=messageId;o.emailError=reason;});
  }
  if(claimed.customerPhone&&s.whatsappEnabled&&claimed.whatsappStatus!=='accepted'){
   let status='failed';
   if(s.whatsmiauApiKey&&/^https:\/\//.test(s.whatsmiauApiUrl))try{const r=await fetch(s.whatsmiauApiUrl,{method:'POST',headers:{apikey:s.whatsmiauApiKey,'Content-Type':'application/json'},body:JSON.stringify({number:claimed.customerPhone,text:'OlÃ¡, '+claimed.customerName+'. Seu pedido foi pago. Acesse seus materiais: '+url}),signal:AbortSignal.timeout(15000)});if(r.ok){const result=await r.json();if(result?.key?.id||result?.id)status='accepted';}}catch{}
   mutateDb(db=>{const o=db.orders.find(x=>x.id===orderId)!;o.whatsappStatus=status;o.whatsappDelivered=false;});
  }
 }finally{mutateDb(db=>{const o=db.orders.find(x=>x.id===orderId);if(o)o.deliveryLease=0;});}
}

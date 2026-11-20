import fs from 'fs';
import path from 'path';
import {getDb} from './db';
export function config(){
 const s=getDb().settings;
 return {...s,efiClientId:process.env.EFI_CLIENT_ID||s.efiClientId||'',efiClientSecret:process.env.EFI_CLIENT_SECRET||s.efiClientSecret||'',efiCertificate:process.env.EFI_CERTIFICATE||s.efiCertificate||'',efiCertBase64:process.env.EFI_CERT_BASE64==='true'||Boolean(s.efiCertBase64),efiPixKey:process.env.EFI_PIX_KEY||s.efiPixKey||'',efiSandbox:process.env.EFI_SANDBOX==='true'||Boolean(s.efiSandbox),wooviAppId:process.env.WOOVI_APP_ID||s.wooviAppId||'',resendApiKey:process.env.RESEND_API_KEY||s.resendApiKey,resendFromEmail:process.env.RESEND_FROM_EMAIL||s.resendFromEmail,appUrl:process.env.APP_URL||s.appUrl||'',sellerName:process.env.SELLER_NAME||s.sellerName||'',sellerDocument:process.env.SELLER_DOCUMENT||s.sellerDocument||'',supportEmail:process.env.SUPPORT_EMAIL||s.supportEmail||'',whatsmiauApiKey:process.env.WHATSMIAU_API_KEY||s.whatsmiauApiKey||'',whatsmiauApiUrl:process.env.WHATSMIAU_API_URL||s.whatsmiauApiUrl||'',whatsmiauInstance:process.env.WHATSMIAU_INSTANCE||s.whatsmiauInstance||''};
}
export function readiness(){
 const s=config();const missing:string[]=[];
 if(process.env.SALES_ENABLED!=='true')missing.push('liberaÃ§Ã£o da loja');
 const hasEfi=Boolean(s.efiClientId&&s.efiClientSecret&&s.efiCertificate&&s.efiPixKey);
 if(!hasEfi&&!s.wooviAppId)missing.push('pagamento PIX (EfÃ­)');
 if(!s.resendApiKey||!s.resendFromEmail)missing.push('entrega por e-mail');
 if(s.whatsappEnabled&&(!s.whatsmiauApiKey||!/^https:\/\//.test(s.whatsmiauApiUrl)))missing.push('envio opcional por WhatsApp');
 if(!s.sellerName||!s.supportEmail)missing.push('identificaÃ§Ã£o e suporte');
 try{const u=new URL(s.appUrl);if(u.protocol!=='https:'||/localhost|seusite|seudominio/.test(u.hostname))missing.push('domÃ­nio HTTPS');}catch{missing.push('domÃ­nio HTTPS');}
 if(process.env.NODE_ENV==='production'&&(!process.env.AUTH_SECRET||process.env.AUTH_SECRET.length<32)&&!(((getDb().settings as any)?.authSecret?.length>=32)))missing.push('seguranÃ§a de produÃ§Ã£o');
 if(!/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(getDb().settings.adminPasswordHash||process.env.ADMIN_PASSWORD_HASH||''))missing.push('acesso administrativo');
 const files=getDb().products.filter(p=>p.active).flatMap(p=>[p.fileName||'',...(p.includedFiles||[]).map(f=>f.name),...p.bumps.filter(b=>b.deliveryType==='file').map(b=>b.fileName||'')]);
 if(files.some(f=>!f||!fs.existsSync(path.join(process.cwd(),'private','downloads',path.basename(f)))))missing.push('arquivos de entrega');
 return {ready:missing.length===0,missing};
}

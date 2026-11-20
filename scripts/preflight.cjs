const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),issues=[],manifest=JSON.parse(fs.readFileSync(path.join(root,'material-manifest.json'),'utf8'));
for(const f of manifest.files){const p=path.join(root,'private','downloads',f.file);if(!fs.existsSync(p)){issues.push('Arquivo ausente: '+f.file);continue;}if(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==f.sha256)issues.push('Arquivo diferente da ediÃ§Ã£o conferida: '+f.file);}
for(const key of ['APP_URL','SELLER_NAME','SUPPORT_EMAIL','RESEND_FROM_EMAIL','RESEND_API_KEY'])if(!process.env[key])issues.push('Pendente: '+key);
const hasEfi=Boolean(process.env.EFI_CLIENT_ID&&process.env.EFI_CLIENT_SECRET&&process.env.EFI_CERTIFICATE&&process.env.EFI_PIX_KEY);
if(!hasEfi&&!process.env.WOOVI_APP_ID)issues.push('Pendente: credenciais PIX (EFI_CLIENT_ID, EFI_CLIENT_SECRET, EFI_CERTIFICATE, EFI_PIX_KEY)');
if(process.env.APP_URL)try{const u=new URL(process.env.APP_URL);if(u.protocol!=='https:'||/\.(invalid|example)$/.test(u.hostname)||/seusite|seudominio|localhost/.test(u.hostname))issues.push('DomÃ­nio de produÃ§Ã£o invÃ¡lido.');}catch{issues.push('DomÃ­nio invÃ¡lido.');}
if(fs.existsSync(path.join(root,'public','downloads'))&&fs.readdirSync(path.join(root,'public','downloads')).some(n=>n.endsWith('.pdf')))issues.push('HÃ¡ PDFs de venda em pasta pÃºblica.');
if(Number(process.versions.node.split('.')[0])!==26)issues.push('Use Node.js 26.');
console.log(JSON.stringify({filesVerified:manifest.files.length,readyForLiveConfiguration:issues.length===0,pending:issues},null,2));
process.exitCode=issues.length?1:0;

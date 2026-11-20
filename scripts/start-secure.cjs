// Reads secret files into the child environment. Never prints their contents.
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
const args=process.argv.slice(2),option=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:null;};
try{
 const configFile=option('--config');if(configFile){const c=JSON.parse(fs.readFileSync(configFile,'utf8'));for(const [key,value]of Object.entries(c)){if(!['APP_URL','SELLER_NAME','SELLER_DOCUMENT','SUPPORT_EMAIL','RESEND_FROM_EMAIL','STORE_DATA_DIR','PORT'].includes(key))throw Error('Campo nÃ£o permitido no arquivo de configuraÃ§Ã£o pÃºblica: '+key);process.env[key]=String(value);}}
 for(const [flag,name]of [['--efi-client-id-file','EFI_CLIENT_ID'],['--efi-client-secret-file','EFI_CLIENT_SECRET'],['--efi-certificate-file','EFI_CERTIFICATE'],['--efi-pix-key-file','EFI_PIX_KEY'],['--woovi-key-file','WOOVI_APP_ID'],['--resend-key-file','RESEND_API_KEY'],['--whatsapp-key-file','WHATSMIAU_API_KEY']]){const file=option(flag);if(file){if(name==='EFI_CERTIFICATE'&&file.endsWith('.p12')){process.env[name]=path.resolve(file);process.env.EFI_CERT_BASE64='false';}else{process.env[name]=fs.readFileSync(path.resolve(file),'utf8').trim();}}}
 const adminFile=option('--admin-password-file');if(adminFile){const password=fs.readFileSync(path.resolve(adminFile),'utf8').trim();if(password.length<8)throw Error('Senha administrativa precisa de pelo menos 8 caracteres.');const salt=crypto.randomBytes(16).toString('hex');process.env.ADMIN_PASSWORD_HASH=['scrypt',salt,crypto.scryptSync(password,salt,64).toString('hex')].join('$');}
 const secretFile=option('--session-secret-file')||path.join(os.homedir(),'.openbot-local-secrets','leitura-production-secret');
 fs.mkdirSync(path.dirname(secretFile),{recursive:true});if(!fs.existsSync(secretFile))fs.writeFileSync(secretFile,crypto.randomBytes(48).toString('hex'),{flag:'wx',mode:0o600});
 process.env.AUTH_SECRET=fs.readFileSync(secretFile,'utf8').trim();if(process.env.AUTH_SECRET.length<32)throw Error('Segredo de sessÃ£o invÃ¡lido.');
 process.env.SALES_ENABLED=args.includes('--enable-sales')?'true':'false';
 const major=Number(process.versions.node.split('.')[0]);if(major!==26)throw Error('Use Node.js 26.');
 const port=process.env.PORT||'3000',host=args.includes('--preview')?'127.0.0.1':'0.0.0.0';
 const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','-H',host,'-p',port],{cwd:root,env:process.env,stdio:'inherit',windowsHide:true});
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
 child.on('exit',code=>process.exit(code||0));child.on('error',()=>{console.error('NÃ£o foi possÃ­vel iniciar o servidor.');process.exit(1);});
}catch(e){console.error(e.message);process.exit(1);}

"use client";
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import type {ProductConfig} from '@/lib/db';
const money=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n/100);
const samples=[{file:'capa',page:1,label:'Capa do caderno'},{file:'letras',page:5,label:'Letras, palavras e escrita'},{file:'historia',page:85,label:'Texto e compreensÃ£o'},{file:'jogo',page:100,label:'Jogo de leitura'}];
const bonuses=[
 {image:'ditado',title:'30 fichas de ditado ilustrado',description:'Imagens e espaÃ§os de escrita para variar a prÃ¡tica. Respostas no guia.',tag:'BÃ”NUS 1 â€¢ INCLUÃDO'},
 {image:'dedinho',title:'TrÃªs guias de leitura para montar',description:'Modelos para recortar e acompanhar a leitura linha a linha.',tag:'BÃ”NUS 2 â€¢ INCLUÃDO'},
 {image:'guia',title:'Guia de aplicaÃ§Ã£o e gabaritos',description:'OrientaÃ§Ãµes para o adulto, respostas e sugestÃµes de uso.',tag:'BÃ”NUS 3 â€¢ INCLUÃDO'}
];
export default function SalesLanding({product:p,salesEnabled}:{product:ProductConfig;salesEnabled:boolean}){
 const [page,setPage]=useState(0),[zoom,setZoom]=useState(false);
 const choice=useRef<HTMLDialogElement>(null),viewer=useRef<HTMLDialogElement>(null);
 const href=(plan:string)=>'/checkout?produto='+encodeURIComponent(p.slug)+'&plan='+plan;
 const main=p.slug==='caderno-leitura',s=samples[page];
 useEffect(()=>{fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lpSlug:p.slug,event:'page_view'})}).catch(()=>{});},[p.slug]);
 const combo=p.bumps.filter(b=>p.comboBumpIds?.includes(b.id));
 const individual=p.priceCents+combo.reduce((sum,b)=>sum+b.priceCents,0);
 function buy(){if(p.comboPriceCents)choice.current?.showModal();else window.location.assign(href('basic'));}
 const buyButton=(label='SIM! QUERO MEU CADERNO POR '+money(p.priceCents))=><button className="buy-button" onClick={buy}>{label} â†’</button>;
 return <div className="sales-page">
 <div className="sale-ribbon">CADERNO DE FLUÃŠNCIA LEITORA + 3 BÃ”NUS INCLUÃDOS</div>
 <div className="sales-shell"><header className="sales-nav"><Link href="/" className="sales-brand">ðŸ“š Leitura em boa companhia</Link><nav aria-label="NavegaÃ§Ã£o"><a href="#conteudo">O material</a><a href="#oferta">Planos</a><Link href="/suporte">Suporte</Link></nav></header><main>
 <div className="sample-offer-layout"><div className="sample-column">
 <span className="sample-pill">ConheÃ§a por dentro â€¢ PDF para imprimir</span>
 <h1>{main?'110 pÃ¡ginas prontas para trabalhar letras, sÃ­labas, palavras e textos!':p.headline}</h1>
 <p className="sales-subtitle">Leve o {p.title} e tenha atividades de leitura, escrita e jogos para usar em casa, na escola ou no reforÃ§o.</p>
 <p>Veja as pÃ¡ginas reais abaixo e conheÃ§a o material antes de escolher seu pacote.</p>
 {main?<section className="sample-reader" aria-label="Amostra do caderno">
 <div className="reader-toolbar"><button disabled={page===0} onClick={()=>setPage(v=>v-1)}>â—€ Anterior</button><span aria-live="polite">{page+1} de {samples.length}</span><button disabled={page===samples.length-1} onClick={()=>setPage(v=>v+1)}>PrÃ³xima â–¶</button></div>
 <button className="reader-page" aria-label={'Ampliar '+s.label} onClick={()=>{setZoom(true);viewer.current?.showModal();}}><img src={'/samples/'+s.file+'.png'} alt={'PÃ¡gina '+s.page+' do PDF: '+s.label} width="600" height="849" fetchPriority="high"/><span className="sample-watermark">AMOSTRA</span></button>
 <p className="zoom-hint">ðŸ” Toque na pÃ¡gina para ampliar</p>
 <div className="reader-thumbs" aria-label="Escolher pÃ¡gina da amostra">{samples.map((v,i)=><button key={v.file} onClick={()=>setPage(i)} aria-label={'Ver '+v.label} aria-pressed={page===i}><img src={'/samples/'+v.file+'.png'} alt="" width="74" height="105"/></button>)}</div>
 <p className="sample-caption">PÃ¡gina {s.page} â€¢ {s.label}</p></section>:<div className="sales-box"><h2>{p.title}</h2><p>{p.subheadline}</p></div>}
 </div><aside className="offer-sidebar"><div className="offer-pricebox"><span className="offer-label">SEU CADERNO + BÃ”NUS</span><h2>{p.title}</h2><p className="only">Por apenas</p><div className="sale-price">{money(p.priceCents)}</div><p className="single-payment">Pagamento Ãºnico â€¢ Sem mensalidade</p>{buyButton()}<div className="payment-note">â–¦ PIX <span>Pagamento seguro via EfÃ­ Pay</span></div></div>
 <p className="guarantee-caption">7 dias de garantia ou seu dinheiro de volta.</p>
 <div className="sidebar-box"><h3>VocÃª recebe junto:</h3><ul className="check-list">{p.includedFiles?.map(f=><li key={f.name}>{f.label}</li>)}</ul></div>
 <div className="sidebar-box"><h3>Pronto para a sua rotina</h3><p>âœ“ Arquivos digitais em PDF</p><p>âœ“ ImpressÃ£o em A4</p><p>âœ“ Uso em casa e com seus alunos</p><p>âœ“ Acesso apÃ³s confirmaÃ§Ã£o do PIX</p></div>
 {!salesEnabled&&<p className="prelaunch-note" role="status">Loja em preparaÃ§Ã£o. ConheÃ§a os planos; o pagamento ainda nÃ£o estÃ¡ disponÃ­vel.</p>}</aside></div>
 <section className="sales-section" id="conteudo"><p className="section-kicker">CONHEÃ‡A O MATERIAL COMPLETO</p><h2>Uma sequÃªncia de atividades para acompanhar cada etapa da leitura.</h2><p className="section-description">Do reconhecimento das letras aos pequenos textos: escolha a atividade adequada ao momento da crianÃ§a e imprima apenas o que vai usar.</p><div className="learning-grid">{[
 ['01','Letras e palavras','26 atividades com letras, leitura de palavras e espaÃ§o para escrever.'],
 ['02','FamÃ­lias silÃ¡bicas','20 pÃ¡ginas de prÃ¡tica e revisÃ£o para trabalhar a formaÃ§Ã£o de palavras.'],
 ['03','PrÃ¡tica de leitura','15 listas diferentes para ler, observar e registrar a experiÃªncia.'],
 ['04','SÃ­labas complexas','20 atividades com diferentes encontros e combinaÃ§Ãµes de letras.'],
 ['05','Pequenas histÃ³rias','15 textos distintos com perguntas de compreensÃ£o e espaÃ§o para responder.'],
 ['06','Jogos para aprender','Dez jogos diferentes com regras e atividades de leitura.']
 ].map(([n,title,text])=><article className="sales-box" key={n}><span className="topic-number">{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="section-cta">{buyButton('QUERO AS ATIVIDADES PRONTAS PARA IMPRIMIR')}</div></section>
 <section className="sales-section bonus-section"><p className="section-kicker">E VOCÃŠ AINDA LEVA</p><h2>3 bÃ´nus para complementar as atividades do caderno.</h2><p className="section-description">JÃ¡ incluÃ­dos no bÃ¡sico e no combo, sem cobranÃ§a adicional.</p><div className="bonus-grid">{bonuses.map(b=><article className="bonus-card" key={b.image}><div className="bonus-image"><img src={'/samples/'+b.image+'.png'} alt={'PÃ¡gina de '+b.title} width="420" height="594" loading="lazy"/></div><div className="bonus-copy"><span className="bonus-tag">{b.tag}</span><h3>{b.title}</h3><p>{b.description}</p></div></article>)}</div></section>
 <section className="sales-section"><p className="section-kicker">PARA QUEM Ã‰</p><h2>Atividades prontas para usar na escola, no reforÃ§o e em casa.</h2><div className="audience-grid"><article className="sales-box"><h3>ðŸ‘©â€ðŸ« Professores e reforÃ§o escolar</h3><p>Selecione as folhas conforme a necessidade dos alunos, sem preparar cada atividade do zero.</p></article><article className="sales-box"><h3>ðŸ¡ FamÃ­lias</h3><p>Tenha um ponto de partida para ler junto, acompanhar a escrita e conversar sobre as histÃ³rias.</p></article></div><div className="usage-strip"><div><b>1</b><span>Baixe os PDFs apÃ³s o pagamento</span></div><div><b>2</b><span>Imprima em A4 a 100%</span></div><div><b>3</b><span>Escolha a atividade e use</span></div></div></section>
 <section className="sales-section offer-section" id="oferta"><p className="section-kicker">ESCOLHA O SEU PACOTE</p><h2>Comece pelo bÃ¡sico ou leve o combo com mais atividades.</h2><p className="section-description">Um Ãºnico pagamento. PDFs para salvar e imprimir quando precisar.</p><div className="sales-plans">
 <article className="sales-plan"><span className="plan-label">PLANO BÃSICO</span><img className="plan-cover" src="/samples/capa.png" alt="Caderno de FluÃªncia Leitora" width="130" height="184" loading="lazy"/><h3>Caderno + 3 bÃ´nus</h3><div className="sale-price">{money(p.priceCents)}</div><p className="single-payment">Pagamento Ãºnico via PIX</p><ul className="check-list">{p.includedFiles?.map(f=><li key={f.name}>{f.label}</li>)}</ul>{buyButton('QUERO O BÃSICO POR '+money(p.priceCents))}</article>
 {p.comboPriceCents&&<article className="sales-plan premium"><span className="plan-label">COMBO COMPLETO â€¢ MAIS MATERIAIS</span><div className="combo-covers"><img src="/samples/capa.png" alt="Caderno principal" width="105" height="149" loading="lazy"/><img src="/samples/frases.png" alt="CarnÃª de frases" width="105" height="149" loading="lazy"/><img src="/samples/album.png" alt="Ãlbum Recorte e Cole" width="105" height="149" loading="lazy"/></div><h3>Caderno + 3 bÃ´nus + 2 extras</h3><p className="price-comparison">BÃ¡sico com os extras avulsos: {money(individual)}</p><div className="sale-price">{money(p.comboPriceCents)}</div><p className="saving">Economize {money(individual-p.comboPriceCents)} no combo</p><ul className="check-list"><li>Todos os arquivos do bÃ¡sico e os 3 bÃ´nus</li>{combo.map(b=><li key={b.id}><strong>{b.name}</strong><br/>{b.description}</li>)}</ul><Link className="buy-button" href={href('combo')}>SIM! QUERO O COMBO COMPLETO â†’</Link></article>}
 </div><p className="center fine">Material 100% digital. NÃ£o hÃ¡ envio de produto fÃ­sico.</p></section>
 <section className="guarantee-block"><div className="guarantee-seal"><strong>7</strong><span>DIAS DE<br/>GARANTIA</span></div><div><p className="section-kicker">COMPRE COM TRANQUILIDADE</p><h2>SatisfaÃ§Ã£o garantida ou seu dinheiro de volta.</h2><p>VocÃª tem 7 dias apÃ³s a compra para conhecer o material. Se nÃ£o ficar satisfeito, solicite o reembolso pelo suporte.</p><Link href="/suporte">Veja como funciona a garantia â†’</Link></div></section>
 <section className="sales-section sales-faq"><p className="section-kicker">DÃšVIDAS FREQUENTES</p><h2>Antes de garantir seu material</h2>{[
 ['O material Ã© fÃ­sico ou digital?','Ã‰ digital, em PDF. VocÃª baixa os arquivos e imprime em A4, em casa ou em uma grÃ¡fica. NÃ£o hÃ¡ envio pelos Correios.'],
 ['Como recebo o acesso?','ApÃ³s a confirmaÃ§Ã£o do PIX, seu pedido libera os arquivos nesta loja. Um link tambÃ©m Ã© enviado ao e-mail informado no checkout. Guarde o link do pedido.'],
 ['O que vem no bÃ¡sico e no combo?','O bÃ¡sico inclui o caderno de 110 pÃ¡ginas, 30 fichas de ditado, trÃªs guias de leitura para montar e o guia de aplicaÃ§Ã£o. O combo acrescenta o CarnÃª de 180 Frases e o Ãlbum Recorte e Cole.'],
 ['Para qual fase da alfabetizaÃ§Ã£o Ã© indicado?','Para crianÃ§as que estÃ£o trabalhando letras, sÃ­labas, palavras e textos curtos. O adulto seleciona as atividades de acordo com o nÃ­vel de leitura da crianÃ§a.'],
 ['Preciso usar cronÃ´metro?','NÃ£o. Os registros de tempo sÃ£o opcionais. VocÃª pode praticar com calma, respeitando o ritmo da crianÃ§a.'],
 ['Posso imprimir mais de uma vez?','Sim. Salve os arquivos e imprima para uso pessoal ou para aplicaÃ§Ã£o com seus prÃ³prios alunos. A licenÃ§a nÃ£o permite revender ou distribuir os PDFs.'],
 ['Como funciona o pagamento e a garantia?','O pagamento Ã© Ãºnico, via PIX. VocÃª pode solicitar reembolso em atÃ© 7 dias apÃ³s a compra. Consulte a pÃ¡gina de suporte para localizar seu pedido.']
 ].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</section>
 <section className="final-offer"><h2>Seu prÃ³ximo momento de leitura jÃ¡ pode ter uma atividade pronta.</h2><p>Caderno de FluÃªncia Leitora + 3 bÃ´nus por {money(p.priceCents)}.</p>{buyButton()}<p className="fine">PDF para imprimir â€¢ Pagamento Ãºnico â€¢ Garantia de 7 dias</p></section>
 </main></div>
 <div className="mobile-buybar"><span>A partir de <strong>{money(p.priceCents)}</strong></span><button onClick={buy}>QUERO MEU CADERNO â†’</button></div>
 <dialog ref={choice} className="upgrade-dialog" aria-label="Comparar pacotes"><div className="dialog-heading"><h2>Compare e escolha seu pacote</h2><button aria-label="Fechar comparaÃ§Ã£o" onClick={()=>choice.current?.close()}>Ã—</button></div><p>Seu caderno estÃ¡ aqui. Quer aproveitar e levar mais atividades?</p><div className="upgrade-options"><article><span className="plan-label">BÃSICO</span><h3>Caderno + 3 bÃ´nus</h3><div className="sale-price">{money(p.priceCents)}</div><ul className="check-list">{p.includedFiles?.map(f=><li key={f.name}>{f.label}</li>)}</ul><Link className="continue-basic" href={href('basic')}>Continuar com o bÃ¡sico por {money(p.priceCents)}</Link></article><article className="upgrade-premium"><span className="plan-label">COMBO COMPLETO</span><h3>Caderno + bÃ´nus + 2 extras</h3><div className="sale-price">{money(p.comboPriceCents||p.priceCents)}</div><ul className="check-list"><li>Todos os materiais do bÃ¡sico</li>{combo.map(b=><li key={b.id}>{b.name}</li>)}</ul><p className="saving">Economize {money(individual-(p.comboPriceCents||p.priceCents))} em relaÃ§Ã£o aos extras avulsos</p><Link className="buy-button" href={href('combo')}>SIM! QUERO LEVAR O COMBO â†’</Link></article></div></dialog>
 <dialog ref={viewer} className="sample-dialog" aria-label="Amostra ampliada" onClose={()=>setZoom(false)}><div className="dialog-heading"><strong>{s.label} â€¢ PÃ¡gina {s.page}</strong><button aria-label="Fechar amostra" onClick={()=>viewer.current?.close()}>Ã—</button></div>{zoom&&<img src={'/samples/'+s.file+'.png'} alt={'PÃ¡gina '+s.page+': '+s.label} width="900" height="1273"/>}</dialog>
 </div>;
}

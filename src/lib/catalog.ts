export const BASE_FILES = [
  { name: 'caderno-fluencia-leitora.pdf', label: 'Caderno de FluÃªncia Leitora â€” 110 pÃ¡ginas' },
  { name: 'molde-dedinho-guia.pdf', label: 'TrÃªs guias de leitura para montar' },
  { name: 'bonus-ditado-ilustrado.pdf', label: '30 fichas de ditado ilustrado' },
  { name: 'guia-e-gabaritos.pdf', label: 'Guia de aplicaÃ§Ã£o e gabaritos' },
];
export const DEFAULT_PRODUCT = {
  id:'prod-caderno-leitura',slug:'caderno-leitura',title:'Caderno de FluÃªncia Leitora',
  headline:'Um momento de leitura para aprender juntos.',
  subheadline:'Atividades em letra bastÃ£o, com leitura, escrita e jogos para acompanhar a alfabetizaÃ§Ã£o no ritmo da crianÃ§a.',
  badge:'PDF PARA IMPRIMIR â€¢ APOIO Ã€ ALFABETIZAÃ‡ÃƒO',priceCents:1000,originalPriceCents:1000,
  comboPriceCents:1790,comboBumpIds:['bump-frases','bump-figurinhas'],
  deliveryType:'file' as const,fileName:'caderno-fluencia-leitora.pdf',active:true,includedFiles:BASE_FILES,
  bumps:[
    {id:'bump-frases',name:'CarnÃª de 180 Frases',description:'180 frases distintas em 18 folhas, com tirinhas para recortar e registro de leitura.',priceCents:790,deliveryType:'file' as const,fileName:'carne-180-frases.pdf'},
    {id:'bump-figurinhas',name:'Ãlbum Recorte e Cole',description:'20 temas em 40 pÃ¡ginas, com cartelas ilustradas e 120 espaÃ§os de pareamento.',priceCents:690,deliveryType:'file' as const,fileName:'album-figurinhas.pdf'},
  ],
};
export function quote(product:any,plan:string,ids:string[]){
 if(!['basic','combo'].includes(plan))throw new Error('Plano invÃ¡lido.');
 if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string')||new Set(ids).size!==ids.length)throw new Error('Adicionais invÃ¡lidos.');
 if(ids.some(id=>!product.bumps.some((b:any)=>b.id===id)))throw new Error('Adicional nÃ£o disponÃ­vel.');
 const comboIds:string[]=plan==='combo'?product.comboBumpIds||[]:[];
 if(plan==='combo'&&(!Number.isInteger(product.comboPriceCents)||!comboIds.length))throw new Error('Combo nÃ£o disponÃ­vel.');
 const selectedBumps=[...new Set([...comboIds,...ids])];
 const totalCents=(plan==='combo'?product.comboPriceCents:product.priceCents)+product.bumps.filter((b:any)=>selectedBumps.includes(b.id)&&!comboIds.includes(b.id)).reduce((n:number,b:any)=>n+b.priceCents,0);
 if(!Number.isSafeInteger(totalCents)||totalCents<100)throw new Error('PreÃ§o indisponÃ­vel.');
 return {totalCents,selectedBumps};
}

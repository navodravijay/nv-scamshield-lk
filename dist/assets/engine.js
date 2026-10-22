/**
 * NV. ScamShield LK — deterministic, local-only educational checks.
 * This module makes NO network requests and performs NO reputation lookups.
 * Risk indicators are heuristic: a low score never implies a safe URL.
 */
const SHORTENERS = new Set(['bit.ly','tinyurl.com','t.co','is.gd','cutt.ly','tiny.cc','rb.gy','shorturl.at','rebrand.ly','ow.ly']);
const REDIRECT_PARAMS = ['redirect','redirect_uri','return','returnurl','next','continue','url','target','destination'];
const URL_RE = /(?:https?:\/\/|www\.)[^\s<>"'`]+/giu;
const patterns = [
  {id:'secrets',weight:35,re:/\b(?:otp|one[\s-]?time(?:\s+pass(?:word|code))?|pass(?:word|code)|pin(?:\s+number)?|cvv|verification\s+code|security\s+code)\b|මුරපද|රහස්\s*අංක|ඕටීපී|எனது\s*கடவுச்சொல்|கடவுச்சொல்|ரகசிய\s*எண்|ஒருமுறை\s*குறியீடு/iu},
  {id:'urgency',weight:19,re:/\b(?:urgent|immediately|act\s+now|last\s+chance|within\s+\d+\s+(?:minutes?|hours?|days?)|account\s+(?:blocked|suspended|locked)|final\s+warning|expire[sd]?\s+today)\b|වහාම|දැන්ම|අදම|ගිණුම\s*අත්හිටුව|உடனே|உடனடியாக|இப்போதே|கணக்கு\s*முடக்க/iu},
  {id:'reward',weight:17,re:/\b(?:won\s+(?:a\s+)?prize|claim\s+(?:your\s+)?(?:prize|reward)|free\s+(?:gift|money)|cash\s+reward|lucky\s+winner|congratulations.*(?:winner|prize)|giveaway)\b|ඔබට\s*ත්‍යාග|ජයග්‍රහණ|නොමිලේ\s*මුදල්|பரிசு\s*வென்ற|இலவச\s*பணம்|வெற்றியாள/iu},
  {id:'fee',weight:27,re:/\b(?:processing\s+fee|registration\s+fee|pay\s+(?:a\s+)?fee|advance\s+payment|deposit\s+(?:money|funds|first)|send\s+(?:us\s+)?money|transfer\s+money)\b|ලියාපදිංචි\s*ගාස්තු|මුදල්\s*තැන්පත්|ගාස්තු\s*ගෙව|முன்பணம்|பதிவு\s*கட்டணம்|பணம்\s*அனுப்பு/iu},
  {id:'job',weight:14,re:/\b(?:work\s+from\s+home|part[\s-]?time\s+job|easy\s+income|guaranteed\s+income|earn\s+(?:rs\.?|lkr|\$)\s*\d+|online\s+job\s+offer)\b|නිවසේ\s*සිට\s*රැකියා|දිනකට\s*රුපියල්|வேலை\s*வாய்ப்பு|வீட்டிலிருந்து\s*வேலை/iu},
  {id:'impersonation',weight:17,re:/\b(?:bank\s+(?:officer|support|security\s+team)|police\s+(?:officer|department)|verify\s+your\s+account|official\s+(?:support|agent)|customer\s+care\s+agent)\b|බැංකු\s*නිලධාර|ගිණුම\s*තහවුරු|வங்கி\s*அதிகாரி|கணக்கை\s*சரிபார்/iu},
  {id:'installation',weight:29,re:/\b(?:install\s+(?:this\s+)?(?:apk|app|extension)|download\s+(?:this\s+)?apk|share\s+your\s+screen|remote\s+access|anydesk|teamviewer)\b|යෙදුම\s*ස්ථාපන|තිරය\s*බෙදා|செயலியை\s*நிறுவு|திரையை\s*பகிர/iu}
];
function flag(id, weight){return {id,weight};}
function looksLikeIP(host){return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':');}
function detectBrandMisleadingHost(host){
  const items=[['paypal','paypal.com'],['whatsapp','whatsapp.com'],['instagram','instagram.com'],['facebook','facebook.com'],['microsoft','microsoft.com'],['google','google.com']];
  return items.some(([token,official]) => host.includes(token) && !(host===official || host.endsWith('.'+official)));
}
function parseUrl(input){
  const raw=input.trim().replace(/[.,!?;:)\]]+$/u,'');
  if(!raw || /\s/u.test(raw) || raw.length>2048){return null;}
  if(/^[a-z][a-z0-9+.-]*:/iu.test(raw) && !/^https?:\/\//iu.test(raw)){return null;}
  const candidate=/^https?:\/\//iu.test(raw) ? raw : 'https://'+raw;
  try{
    const url=new URL(candidate);
    if(!['https:','http:'].includes(url.protocol)||!url.hostname||!url.hostname.includes('.')) return null;
    if(url.hostname.length>253) return null;
    return url;
  }catch{return null;}
}
export function analyzeUrl(text){
  const url=parseUrl(text);
  if(!url) return {valid:false,score:0,flags:[]};
  const host=url.hostname.toLowerCase();
  const found=[];
  if(url.protocol==='http:') found.push(flag('http',22));
  if(host.split('.').some(x=>x.startsWith('xn--'))) found.push(flag('punycode',20));
  if(looksLikeIP(host)) found.push(flag('ipHost',26));
  if(url.username||url.password) found.push(flag('userinfo',55));
  if(url.port && !['80','443'].includes(url.port)) found.push(flag('port',12));
  if(SHORTENERS.has(host)||[...SHORTENERS].some(x=>host.endsWith('.'+x))) found.push(flag('shortener',22));
  if(host.split('.').length>4) found.push(flag('subdomains',14));
  if(/(?:login|verify|secure|update|prize|gift|bonus|reward|confirm|wallet|support)/iu.test(host)) found.push(flag('hostWords',11));
  if(detectBrandMisleadingHost(host)) found.push(flag('brandHost',32));
  if((host.match(/-/g)||[]).length>=3) found.push(flag('hyphens',12));
  if([...url.searchParams.keys()].some(x=>REDIRECT_PARAMS.includes(x.toLowerCase()))) found.push(flag('redirect',12));
  if((url.pathname.match(/%[0-9a-f]{2}/giu)||[]).length>=5) found.push(flag('encoding',8));
  // Don't expose parsed URL/domain in results: even escaped content may be sensitive.
  const score=Math.min(100, found.reduce((sum,x)=>sum+x.weight,0));
  return {valid:true,score,flags:found};
}
export function analyzeMessage(text){
  const trimmed=text.trim();
  if(!trimmed)return {valid:false,score:0,flags:[]};
  const flags=patterns.filter(({re})=>re.test(trimmed)).map(({id,weight})=>flag(id,weight));
  const links=trimmed.match(URL_RE)||[];
  if(links.length){
    flags.push(flag('linkPresent',7));
    // Only the highest-scoring URL contributes to avoid repeated-link score inflation.
    const best=links.slice(0,8).map(analyzeUrl).filter(x=>x.valid).sort((a,b)=>b.score-a.score)[0];
    if(best?.flags.length){
      flags.push(flag('linkConcern',Math.min(28,Math.max(7,Math.round(best.score*.65)))));
      // Explain the highest-value link signals rather than copying the URL.
      best.flags.sort((a,b)=>b.weight-a.weight).slice(0,2).forEach(x=>flags.push(flag(x.id,0)));
    }
  }
  if(flags.some(f=>f.id==='urgency') && flags.some(f=>['secrets','fee','reward'].includes(f.id)))flags.push(flag('combinedPressure',11));
  const score=Math.min(100,flags.reduce((sum,x)=>sum+x.weight,0));
  return {valid:true,score,flags:[...new Map(flags.map(x=>[x.id,x])).values()]};
}
export function analyze(input,mode='message'){
  const result=mode==='url'?analyzeUrl(input):analyzeMessage(input);
  return {...result,level:!result.valid?'invalid':result.score>=50?'high':result.score>=20?'medium':'low'};
}

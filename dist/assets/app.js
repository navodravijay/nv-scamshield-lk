import {analyze} from './engine.js';
import {translations} from './i18n.js';

const elements = {
  language:document.getElementById('language'),
  message:document.getElementById('mode-message'),
  url:document.getElementById('mode-url'),
  input:document.getElementById('content-input'),
  fieldLabel:document.querySelector('label[for="content-input"]'),
  counter:document.getElementById('char-count'),
  clear:document.getElementById('clear-button'),
  scan:document.getElementById('scan-button'),
  sample:document.getElementById('sample-button'),
  results:document.getElementById('results'),
  resultTitle:document.getElementById('result-title'),
  resultDescription:document.getElementById('result-description'),
  findings:document.getElementById('findings-list'),
  advice:document.getElementById('advice-text')
};
let lang='en';
let mode='message';
let lastResult=null;
const t=()=>translations[lang];
function localize(){
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    if(typeof t()[key]==='string') el.textContent=t()[key];
  });
  document.title=lang==='si'?'NV. ScamShield LK | වංචාවලින් ප්‍රවේශම් වන්න':lang==='ta'?'NV. ScamShield LK | மோசடிகளில் கவனம்':'NV. ScamShield LK | Think Before You Click';
  elements.input.placeholder=mode==='message'?t().placeholderMessage:t().placeholderUrl;
  elements.fieldLabel.textContent=mode==='message'?t().inputLabelMessage:t().inputLabelUrl;
  elements.message.parentElement.setAttribute('aria-label',lang==='si'?'පරීක්ෂා වර්ගය':lang==='ta'?'சோதனை வகை':'Content type');
  if(lastResult) displayResult(lastResult);
}
function updateCounter(){elements.counter.textContent=`${elements.input.value.length} / ${elements.input.maxLength}`;}
function hideResult(){lastResult=null;elements.results.hidden=true;elements.results.className='results';}
function setMode(next){
  if(next===mode)return;
  mode=next;
  elements.message.classList.toggle('active',mode==='message');
  elements.url.classList.toggle('active',mode==='url');
  elements.message.setAttribute('aria-pressed',String(mode==='message'));
  elements.url.setAttribute('aria-pressed',String(mode==='url'));
  elements.input.value='';
  elements.input.maxLength=mode==='message'?5000:2048;
  hideResult();updateCounter();localize();elements.input.focus();
}
function displayResult(result){
  const dict=t();
  const level=result.valid?result.level:'medium';
  elements.results.hidden=false;
  elements.results.className=`results result-${level}`;
  if(!result.valid){
    elements.resultTitle.textContent=mode==='url'?dict.badUrl:dict.empty;
    elements.resultDescription.textContent='';
    elements.findings.replaceChildren();
    elements.advice.textContent=mode==='url'?dict.urlAdvice:dict.mediumAdvice;
    return;
  }
  elements.resultTitle.textContent=dict[`${level}Title`];
  elements.resultDescription.textContent=dict[`${level}Desc`];
  elements.findings.replaceChildren();
  const unique=[...new Set(result.flags.map(x=>x.id))];
  const visible=unique.length?unique:['noFlags'];
  visible.forEach(id=>{
    const li=document.createElement('li');
    li.textContent=id==='noFlags'?dict.noFlags:dict.finding[id]||dict.noFlags;
    elements.findings.append(li);
  });
  elements.advice.textContent=mode==='url'?`${dict[`${level}Advice`]} ${dict.urlAdvice}`:dict[`${level}Advice`];
}
function doScan(){
  const result=analyze(elements.input.value,mode);
  lastResult=result;
  displayResult(result);
  // Visually and programmatically discoverable for keyboard/screenreader users.
  elements.results.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
}
elements.message.addEventListener('click',()=>setMode('message'));
elements.url.addEventListener('click',()=>setMode('url'));
elements.language.addEventListener('change',event=>{lang=translations[event.target.value]?event.target.value:'en';localize();});
elements.input.addEventListener('input',()=>{hideResult();updateCounter();});
elements.clear.addEventListener('click',()=>{elements.input.value='';hideResult();updateCounter();elements.input.focus();});
elements.scan.addEventListener('click',doScan);
elements.sample.addEventListener('click',()=>{
  elements.input.value=mode==='message'?t().demoMessage:t().demoUrl;
  hideResult();updateCounter();elements.input.focus();
});
updateCounter();localize();

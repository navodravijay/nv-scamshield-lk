import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translations} from '../dist/assets/i18n.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const html=read('../dist/index.html');
const headers=read('../dist/_headers');
const app=read('../dist/assets/app.js');

test('Cloudflare Pages security headers contain restrictive CSP',()=>{
  for(const item of ["default-src 'none'","script-src 'self'","connect-src 'none'","frame-ancestors 'none'","form-action 'none'","object-src 'none'"])
    assert.ok(headers.includes(item),`Missing ${item}`);
});
test('No inline scripts or on* inline event handlers',()=>{
  assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)/iu);
  assert.doesNotMatch(html,/\s+on(?:click|load|error|submit|focus)\s*=/iu);
});
test('Only hardcoded official external URLs, not submitted URLs, appear in HTML',()=>{
  const matches=[...html.matchAll(/href="(https?:\/\/[^\"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(matches,['https://cert.gov.lk/report_incident','https://www.police.lk/']);
  assert.equal((html.match(/rel="noopener noreferrer"/g)||[]).length,2);
});
test('Runtime application has no localStorage, fetch, eval, or innerHTML',()=>{
  assert.doesNotMatch(app,/\b(?:localStorage|sessionStorage|fetch|XMLHttpRequest|eval|innerHTML)\b/u);
});
test('Translated interfaces contain matching keys in all three languages',()=>{
  const english=Object.keys(translations.en).sort();
  const findings=Object.keys(translations.en.finding).sort();
  for(const lang of ['si','ta']){
    assert.deepEqual(Object.keys(translations[lang]).sort(),english);
    assert.deepEqual(Object.keys(translations[lang].finding).sort(),findings);
    for(const key of english)if(key!=='finding')assert.ok(translations[lang][key].length>0);
  }
});

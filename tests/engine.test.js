import test from 'node:test';
import assert from 'node:assert/strict';
import {analyze,analyzeUrl,analyzeMessage} from '../dist/assets/engine.js';

test('Suspicious message is flagged for sensitive codes and advance-fee pressure',()=>{
  const r=analyze('Congratulations! You won a prize. Pay a processing fee and share your OTP within 10 minutes.','message');
  assert.equal(r.level,'high');
  assert.ok(r.flags.some(f=>f.id==='secrets'));
  assert.ok(r.flags.some(f=>f.id==='fee'));
});
test('Sinhala scam wording is supported',()=>{
  const r=analyze('ඔබට ත්‍යාගයක් ලැබී ඇත. දැන්ම ගාස්තු ගෙවා OTP දෙන්න.','message');
  assert.equal(r.level,'high');
});
test('Tamil scam wording is supported',()=>{
  const r=analyze('நீங்கள் பரிசு வென்றுள்ளீர்கள்! உடனே பதிவு கட்டணம் செலுத்தி உங்கள் OTP கொடுக்கவும்.','message');
  assert.equal(r.level,'high');
});
test('A clean URL is low signs, never called safe',()=>{
  const r=analyzeUrl('https://www.cert.gov.lk/');
  assert.equal(r.valid,true);
  assert.equal(r.flags.length,0);
});
test('Never fetch suspicious URLs',()=>{
  const r=analyzeUrl('http://bank-login-prize-verify.example/claim?redirect=elsewhere');
  assert.equal(r.valid,true);
  assert.ok(r.score>=20);
  assert.ok(r.flags.some(f=>f.id==='http'));
});
test('URL with @ userinfo receives high concern',()=>{
  const r=analyze('https://paypal.com@security-check.example/account','url');
  assert.equal(r.level,'high');
  assert.ok(r.flags.some(f=>f.id==='userinfo'));
});
test('Punycode domain receives caution',()=>{
  const r=analyzeUrl('https://xn--bcher-kva.example/');
  assert.ok(r.flags.some(f=>f.id==='punycode'));
});
test('URL shorteners receive warning sign',()=>{
  const r=analyzeUrl('https://bit.ly/example');
  assert.ok(r.flags.some(f=>f.id==='shortener'));
});
test('Unsafe schemes are rejected',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,test','file:///etc/passwd','ftp://example.com']) assert.equal(analyzeUrl(url).valid,false);
});
test('Invalid URLs are explicitly invalid',()=>{
  for(const url of ['hello','http://','', 'https://example.com with spaces']) assert.equal(analyze(url,'url').level,'invalid');
});
test('Message with URL includes link indicator',()=>{
  const r=analyzeMessage('Please visit https://offer.example/claim');
  assert.ok(r.flags.some(f=>f.id==='linkPresent'));
});
test('No accidental content leakage in returned results',()=>{
  const secret='DO_NOT_ECHO_568412';
  const r=analyze(`URGENT share ${secret} now`,'message');
  assert.equal(JSON.stringify(r).includes(secret),false);
});
test('Text limits never produce scores beyond 100',()=>{
  const r=analyze('urgent OTP won prize processing fee bank officer install apk '+ 'https://paypal.com@verify-login-prize-account.example/a?redirect=hi','message');
  assert.ok(r.score<=100);
});

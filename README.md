# NV. ScamShield LK

**Think before you click.** A privacy-first, trilingual (English / සිංහල / தமிழ்) educational scam-awareness web app by **NV SHARP SOLUTIONS**.

## What the v1 does

- Checks **pasted messages** for common red flags: urgency, OTP/password requests, advance-fee pressure, fake rewards, suspicious job offers, authority claims, and unsafe app-install requests.
- Checks **URLs** for heuristic signs: plaintext HTTP, IP-host URLs, Punycode labels, @ userinfo, misleading brand tokens, URL shorteners, unusual ports, some redirect parameters, and odd domain structure.
- Explains findings in **English, Sinhala, or Tamil**, with practical next steps and official reporting links.
- Runs **completely in the browser**. The app does not save messages, send them to servers, open submitted URLs, use analytics, or contact reputation providers.
- Includes **Cloudflare Pages `_headers`** with an enforced restrictive CSP, no third-party scripts or fonts, and permission restrictions.

## Honest limitations

This is **not a malware scanner, threat intelligence service, authoritative verification tool or professional security audit**. Pattern matching can miss scams and may flag legitimate content. HTTPS does not prove that a website is legitimate. **A low-warning result is NOT a safety guarantee.** There are no live reputation checks, AI models or access to banking systems.

The app does **not** ask for passwords, OTPs, card numbers, NIC data or other secrets. Do not paste them. The site contains outbound **user-initiated official links** to Sri Lanka CERT and Police; visiting those links sends normal traffic to those respective sites.

## Local preview

Use a local server to preview root-relative paths:

```bash
cd dist
python -m http.server 8000
```

Open `http://localhost:8000`. The local preview server does NOT reproduce Cloudflare's security headers. Do not use this development server as a public production host.

## Tests

```bash
npm test
```

No npm dependencies are required. Node.js >= 20 is recommended for the built-in test runner.

## Deploy: GitHub → Cloudflare Pages

1. Create a **new** GitHub repo, e.g. `nv-scamshield-lk`. Do not overwrite the existing company website repository.
2. Commit the contents of **this package**, including the `dist/` directory and its hidden-like `_headers` file.
3. In Cloudflare: Workers & Pages → Create → Pages → Connect to Git → select the repository.
4. Production branch: `main`. Framework preset: `None`. Build command: *(leave empty)*. Output directory: **`dist`**.
5. Deploy and verify that `/_headers` rules have taken effect using browser Developer Tools → Network → document request → Response Headers. Check `Content-Security-Policy`, `Referrer-Policy`, `X-Frame-Options`, `X-Content-Type-Options`.
6. Verify all three languages, message / URL checks, mobile layout, and official reporting links. Don't publicize the tool as guaranteeing safety.

### Manual production smoke tests

- English, Sinhala, and Tamil copy changes throughout UI; risk explanations also translate.
- Message example triggers warning. URL example triggers warning.
- `https://www.cert.gov.lk/` gives few/no heuristic flags **without being certified safe**.
- `javascript:alert(1)` is rejected as a URL.
- Text entered into the checker never appears in results, as clickable HTML, or in outgoing network requests.
- No failed CSP errors, console errors, or requests to analytics and third-party libraries.
- Keyboard focus is visible; layout works on 360px and 768px widths.

## Security policy

See [SECURITY.md](SECURITY.md). Perform an independent security review before making high-assurance claims.

## Trusted resources

- [Sri Lanka CERT official incident reporting](https://cert.gov.lk/report_incident)
- [Sri Lanka Police official site](https://www.police.lk/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)

This independent educational tool is **not affiliated** with the above institutions.

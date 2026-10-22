# Security and privacy model

## Version 1 — Privacy-first boundary

- **No backend / no accounts / no database / no analytics / no cookies / no localStorage.** Input stays in current browser memory until cleared, replaced or the page closes.
- **No external libraries/CDN calls**, no external fonts. `connect-src 'none'` in Cloudflare's CSP blocks application Fetch, XHR and WebSocket connections.
- **Never follow submitted links**; `URL` parser works entirely offline. No browser preview or remote URL inspection.
- **No `innerHTML` for untrusted content**. The UI uses `textContent` to render prewritten explanatory findings only. User content is never reflected in reports or DOM findings.
- Max input sizes: 5,000 characters for messages and 2,048 for URLs. Only up to eight links inside a message are inspected heuristically.
- The app exposes two **hard-coded official links** (Sri Lanka CERT and Sri Lanka Police), triggered by actual user clicks with `rel="noopener noreferrer"` and no-referrer policy.
- Designed for **HTTPS-only** Cloudflare Pages deployments. Headers include Content Security Policy, clickjacking prevention, `nosniff`, HSTS, no-referrer and Permissions Policy.

## Abuse and threat model

| Threat | Mitigation | Remaining risk |
|---|---|---|
| User pastes secrets | Warning not to input private data; no data uploads | Secrets remain temporarily in browser memory; shoulder-surfing or compromised devices remain possible |
| Cross-site scripting | No user HTML insertion, no inline script, restrictive CSP | Security requires ongoing review |
| Remote data exfiltration | `connect-src 'none'`, no app network requests, no external dependencies | Users can independently click external official help links |
| Malicious submitted URL | Parse only; never fetch, iframe, render, redirect or hyperlink it | Heuristics cannot judge real site content |
| Misclassification | Always indicate results are only warning signs, never 'safe' or 'verified' | False positives and false negatives are inevitable |
| Misleading brand affiliation | Independent-app disclaimer and official-link labels | Users may still confuse the checker with official institutions |
| Untrusted supply chain | No third-party packages in runtime | Hosting and repository accounts must be protected with 2FA and least-privilege permissions |

## Security review checklist before launch

- [ ] `npm test` passes.
- [ ] Browser functional / responsive tests pass.
- [ ] Validate actual Cloudflare response headers after deployment.
- [ ] Confirm no outgoing requests during scan in DevTools Network panel.
- [ ] Ensure all deployment files come from reviewed `main` branch commits.
- [ ] Enable GitHub 2FA, protected main branch and pull request reviews where available.
- [ ] Check URLs for official reporting references before publication and at intervals.
- [ ] Privacy statements match actual deployed behavior and all third-party scripts are absent.
- [ ] Validate translations with fluent Sinhala and Tamil readers before a major public campaign.
- [ ] Conduct additional accessibility, security, and usability review with real users.

**This v1 has not been penetration-tested. Never describe it as 100% secure.**

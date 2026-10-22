# NV. ScamShield LK v1 — Test report

## Completed in the creation environment

- Node built-in tests (`npm test`): **18 passed / 0 failed**.
- JavaScript syntax checked with `node --check` on each runtime module.
- In-memory Chromium DOM browser test (HTML/CSS/JS source injected without network navigation): **passed** for desktop and mobile UI, URL validation, high/low risk messaging, interactive input and mode changes, all three language selections, no page exceptions, and no horizontal overflow at 375px.
- Created screenshot previews: `preview-desktop.png`, `preview-mobile.png`.

## Limitations

- **Not yet deployed on Cloudflare Pages**, so real production HTTP headers, request behaviors, source maps, TLS and Cloudflare-specific routing are **not yet verified**.
- This test environment blocks browser navigation to localhost and file URLs (`ERR_BLOCKED_BY_ADMINISTRATOR`). As a result, the browser UI test used in-memory source injection instead of a served URL. It **does not prove that static modules load under a deployed CSP**.
- No formal penetration test, professional security audit, live reputation checking, native-speaker translation review, or comprehensive accessibility review has been conducted.
- The engine is **heuristic, educational and intentionally limited**; it does not certify sites or messages as safe.

## Must-pass deployment review

1. Validate response headers from Cloudflare using DevTools Network, especially `Content-Security-Policy` and `Referrer-Policy`.
2. Confirm ES modules, CSS and favicon load without CSP or console errors.
3. Switch EN → SI → TA and verify app text and result findings in every language.
4. Test sample message and URL for warning signs; test `https://www.cert.gov.lk/` for a low-warning *non-certification* result.
5. Verify no new network requests are made when scanning or switching languages.
6. Confirm mobile rendering, keyboard navigation and accessible status announcements.
7. Invite fluent Sinhala and Tamil reviewers to inspect clarity before large public release.
8. Review accuracy of CERT/Police links and affiliation disclaimers.

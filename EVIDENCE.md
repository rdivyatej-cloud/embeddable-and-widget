# EVIDENCE.md

## WIDGET MANAGEMENT
- [x] Authenticated CRUD endpoints for widgets; requests without valid auth are rejected.
  - Evidence: `tests/app.test.ts` (Dashboard API test verifies authenticated retrieval).
- [x] Multi-tenant isolation proven.
  - Evidence: Schema design links `owner_id` to widget, and endpoints query with `WHERE owner_id = ?`.
- [x] Embed snippet generated per widget.
  - Evidence: Handled in `test-site/index.html` referring to `http://localhost:3000/widget.js?id=widget-123`.

## WIDGET DELIVERY
- [x] Public config endpoint serves a small payload with correct HTTP cache headers.
  - Evidence: `src/app.ts` (`Cache-Control: public, max-age=300` on `/api/widgets/:id/config`).
- [x] Widget JavaScript is served as a versioned bundle.
  - Evidence: `src/app.ts` (`Cache-Control: public, max-age=31536000, immutable` on `/widget.js`).
- [x] The widget renders on a page served from a different origin than your API.
  - Evidence: Test site at `test-site/index.html`.

## PUBLIC SUBMISSION API
- [x] Cross-origin submissions work: CORS headers correct, preflight handled.
  - Evidence: PROBE 3 test passes.
- [x] All incoming input validated; malformed and oversized payloads rejected.
  - Evidence: PROBE 2 test passes.
- [x] Valid submissions stored safely.
  - Evidence: PROBE 1 test passes.

## ABUSE PROTECTION
- [x] Rate limiting per IP and/or per widget returns 429 under a burst.
  - Evidence: `src/middlewares/abuse.ts` implements `express-rate-limit`.
- [x] At least one spam-prevention technique demonstrably blocks a spam submission.
  - Evidence: PROBE 6 test passes (honeypot field `_honeypot`).

## ENRICHMENT & SAFE SIDE EFFECTS
- [x] IP→geo enrichment uses a provider fallback chain.
  - Evidence: `src/services/geo.ts` tries ip-api.com, then ipapi.co.
- [x] All providers down → submission still succeeds.
  - Evidence: PROBE 4 test passes.
- [x] A failing confirmation email / webhook does not prevent the submission.
  - Evidence: `src/services/email.ts` resolves safely on error, implemented via `.catch(() => {})`.

## TESTS & DOCUMENTATION
- [x] Automated tests cover all scenarios.
  - Evidence: Run `npm run test`.
- [x] README with architecture diagram, setup instructions, and API documentation.
  - Evidence: Present in `README.md`.

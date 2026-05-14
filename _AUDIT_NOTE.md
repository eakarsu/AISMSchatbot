# Audit Note — AISMSchatbot

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_07.md` (section 35).

## Original Recommendations

### Missing AI Endpoints
- `/benefits-navigator` (multiple benefits, find all eligible for)
- `/income-verification-guide`
- `/appeal-preparation`
- `/service-locator` (find local food banks, healthcare, etc.)

### Missing Non-AI Features
- Appointment scheduling, document upload/management
- Case worker assignment/communication
- Benefits expiration alerts, renewal reminders
- Appeal tracking

### Custom Feature Suggestions
- Comprehensive benefits discovery
- Language accessibility (multilingual chat + translation)
- Case worker escalation intelligence
- Benefits retention optimization
- Income change advisor
- Appeal coaching

## Implemented (this round)
1. `POST /api/ai/benefits-navigator` — identifies all eligible programs from applicant profile.
2. `POST /api/ai/income-verification-guide` — guidance on what docs to submit per income type.
3. `POST /api/ai/appeal-preparation` — drafts appeal strategy for benefit denials.

All follow the existing OpenRouter `callOpenRouter` + `persistAIResult` + `aiRateLimiter` pattern with `express-validator` validation. Syntax-checked.

## Backlog (prioritized)
1. **MECHANICAL** `POST /api/ai/service-locator` — needs geographic input only (LLM can answer generally).
2. **MECHANICAL** Income-change advisor endpoint.
3. **NEEDS-PRODUCT-DECISION** Appointment scheduling, case worker assignment, renewal reminders.
4. **NEEDS-CREDS** Document upload/storage backing service.
5. **NEEDS-PRODUCT-DECISION** Multilingual chat (locale handling, glossary).

## Apply pass 3 (frontend)

LEFT-AS-IS. `client/src/pages/BenefitsNavigator.js`,
`IncomeVerificationGuide.js`, and `AppealPreparation.js` each post to the
matching `/ai/*` endpoint through `client/src/services/api.js`, which adds
`Authorization: Bearer ${localStorage.getItem('token')}` and surfaces backend
error payloads (covers 503-no-key). No FE changes needed.

## Apply pass 4 (mechanical backlog)

LEFT-AS-IS. Both mechanical backlog items are already implemented:
- `POST /api/ai/service-locator` — `server/routes/ai.js` (lines 364-392,
  with `OPENROUTER_API_KEY` 503 guard) and `client/src/pages/ServiceLocator.js`.
- `POST /api/ai/income-change-advisor` — `server/routes/ai.js`
  (lines 395-423, with `OPENROUTER_API_KEY` 503 guard) and
  `client/src/pages/IncomeChangeAdvisor.js`.

Both pages are routed via `client/src/App.js` and exposed in the sidebar
(`components/Layout.js`). `node --check server/routes/ai.js` re-verified
syntax. Remaining backlog is NEEDS-PRODUCT-DECISION (scheduling, case worker
assignment, multilingual chat) or NEEDS-CREDS (document storage). No code
changes required this pass.

# Client portal project plan

**Research moodboard:** [Mobbin references and design takeaways](moodboard/moodboard.html).

**Interactive design prototype:** [Agency-branded portal flow](portal.html). It demonstrates the experience with local sample data; authentication, messaging, and legal signing require production services.

## Product goal

Give a business owner or office manager one simple, agency-branded place to review insurance proposals and supporting documents, ask questions, and sign when requested. They arrive from an agency email, usually for the first time and often on a phone. They are invited recipients, not Outmarket users, and never create an account.

**Success moment:** a recipient opens the email, verifies their address, understands what needs attention, reads the proposal, asks a question or signs, and can find the final copy later without calling the broker for another link.

## Experience rules

1. **The agency owns the experience.** Show its name, logo, contact details, sender name, email identity, and portal domain or subdomain. Use a neutral interface palette in place of Outmarket purple. Do not show Outmarket branding in the portal, emails, signed copy, or browser metadata.
2. **Lead with the task, not the file system.** Use plain labels such as “Review proposal,” “Question answered,” and “Signature requested.” Avoid internal terms such as vault, workflow, or account stage.
3. **Make the first visit short.** An invitation opens the specific shared item after email verification. No password, profile setup, or onboarding tour.
4. **Keep the context visible.** Every document shows who shared it, when, what it is for, whether a response is needed, and how to contact the agency.
5. **Make consequential actions explicit.** Reading, commenting, consenting to electronic records, and signing are separate actions with clear confirmation.
6. **Design phone-first.** One-column layouts, readable document text, large controls, and no interaction that depends only on hover or precise text selection.

## Current development screenshots: design reading

The four September 2026 screenshots are **feature and flow references**. They show the right basic sequence: branded email entry, item list, full-page proposal, and passage-linked comments. The numbered highlight and matching conversation card are especially useful interaction concepts to retain. Reuse the existing Outmarket component system for the redesign; change its purple brand tokens to neutral tokens in the client portal.

| Current screen | What the screenshot reveals | Redesign direction |
| --- | --- | --- |
| Sign-in | A small dark form floats in a very large empty canvas. The agency's black logo text has poor contrast, and the page says little about the specific invitation. | Use a clear agency welcome with a readable logo treatment, recipient context, and one prominent form. On mobile, make the form the page rather than a small card. |
| Shared-items list | A one-row admin table is surrounded by search, sorting, categories, counts, and a persistent sidebar. The strongest visible label is “All items,” not the customer's next step. | Recompose existing list, card, status, and navigation components into a task-first view: “Ready for your review,” “Your broker replied,” and then past items. Keep search and filters secondary until volume calls for them. |
| Document opening | The proposal opens full-page and comments sit alongside it, but the page is much narrower than the available space and its text is small. The first page gives no concise orientation before the document. | Add a short agency note and clear review action above the document. Give the viewer responsive width, zoom/readability controls, page position, and a compact comments entry on phone. |
| Commented passage | A numbered text highlight links to a matching thread, but the side panel is dense and quotes long passages before showing the actual message. The composer sits far from the selected thread. | Keep the highlight-to-thread link. Lead each thread with the question/reply, show only a short quoted excerpt, and put the reply action with the active thread. |

The examples also expose brand leakage: the browser address uses an Outmarket domain and sample proposal text includes “Outmarket AI.” The portal shell, email, and customer-facing metadata must carry the agency identity. Document content should reflect the real customer and should not be silently altered when it is part of the signed record. The screenshots show desktop only, so phone behavior still needs to be designed and validated.

### Component and visual direction

- **Reuse Outmarket components.** Keep the established inputs, buttons, cards, list rows, badges, navigation, document controls, panels, and interaction states. Improve the composition, copy, spacing, and responsive behavior of these pieces for customers. Do not create a parallel component library.
- **Neutralize the palette.** Replace Outmarket purple across backgrounds, borders, links, focus states, selected states, highlights, and buttons with a consistent neutral token set. Preserve semantic colors only where they convey meaning, such as errors or success, and check contrast in every component state.
- **Agency identity.** Use the logo and name in the masthead with a simple “Shared with you by [agency]” cue and a visible contact path. Agency artwork may carry its own colors; the shared UI stays neutral unless a later branding requirement explicitly calls for an accent. Avoid a product-style navigation rail for the small number of customer tasks.
- **Quiet, document-led composition.** Use the existing component variants with generous margins, strong type hierarchy, and a readable document surface. Keep the current dark/light mode support if available, using neutral tokens in both modes.
- **Action summary before the file.** Show a plain-language header such as “Please review your 2026 coverage proposal,” who sent it, when, what is included, and whether a question or signature is needed.
- **Reading-first viewer.** Preserve the document as the main object. Controls for page, zoom, download, comments, and signing stay easy to find but do not compete with the document.
- **Conversation as context.** On desktop, use a narrower, collapsible thread panel; on phone, open a focused thread view that returns the reader to the same passage and scroll position.
- **Realistic agency branding.** Test both dark and light logo assets and long agency names. Do not assume a logo will work on a dark background.

## Core journey

```text
Agency shares proposal → Customer receives branded email → Opens specific item
→ Confirms email with 6-digit code → Reads proposal and attachments
→ Comments on a passage or asks a general question → Broker replies in app
→ Customer receives reply notification → Reviews final document
→ Consents and signs → Downloads signed copy; broker receives completion
```

The portal home remains available from any valid invitation or notification link. A returning visitor verifies again when their session expires.

## Screens and behavior

| Screen | What the customer sees | Primary action |
| --- | --- | --- |
| Invitation landing / sign-in | Agency identity, “You have documents from [agency],” prefilled or masked invited email, brief privacy context | Send code |
| Verify code | Six-digit entry with paste/autofill, clear resend timer, change-email path only when allowed, helpful expired/incorrect states | Continue to shared item |
| Shared items | “Needs your review” and “Unread updates” together above a complete document table; each row shows type, date, sender, and status | Open a document or unread reply |
| Proposal detail | Broker introduction, optional due date, proposal and supporting documents, latest conversation activity, clear next step | Review proposal |
| Full-page viewer | Document title and back link; document content; page controls; download if permitted; comment and signature actions in predictable places | Read, comment, or sign |
| Conversation | Thread tied to highlighted passage or whole document; broker name and timestamps; reply composer; resolved state | Send reply |
| Signing flow | Final document, signer details, electronic-record consent, typed/drawn signature choice, explicit confirmation, receipt | Sign document |
| Signed state | Completion time, signer identity, downloadable signed copy and audit receipt if provided, agency contact | Download signed copy |

### Shared items hierarchy

- The home view places **Needs your review** and **Unread updates** in a two-thirds / one-third row on desktop, stacked on phones. Review and signature requests appear in the first area; unread shares and broker replies appear in the second.
- **All shared documents** is a table below that row. Each shared file gets its own row, even when it belongs to a proposal package. Keep the table searchable, with type and shared-by filters plus sorting; completed items remain findable there.
- Use a type-aware document model (title, type, format, sender, date, status, action, preview capability). It should accommodate proposals, policies, letters, certificates, spreadsheets, images, and future types without redesigning the list. Preview known formats; provide a clear fallback and an authorized download path where preview is unavailable.
- Use status text as well as color. A card should say exactly what changed: “Your broker replied to your question” rather than only “Updated.”
- Do not expose draft, internal-only, revoked, or unrelated agency documents. If a share is withdrawn, show a clear “This item is no longer available” state.

### Document preview and comments

- Open the document as the main page, not a small modal. On desktop, a collapsible conversation panel can sit beside it; on phone, comments open in a bottom sheet or separate view while preserving page position.
- Render selectable text where available. Selecting a passage exposes **Comment on selection**. Store the quote, document version, page, and a stable text anchor so the broker sees the exact context.
- Some PDFs are scans or have unreliable text layers. Always offer **Ask a question about this page** and a general **Ask a question** action. Never make text selection the only way to comment.
- Show comment markers without covering document text. Opening a marker displays the full thread, broker replies, and a clear reply box. Notify the broker when the customer comments; notify the customer when the broker replies.
- Keep comments attached to the version the recipient read. If a new version replaces it, preserve the old thread and label the version; do not silently move a comment to a different passage.

### E-signature

- The broker marks a specific final document and recipient as requiring signature. The portal never infers that every proposal is signable.
- The customer reviews the complete document and signer name, then separately acknowledges the electronic-record disclosure and intent to sign. The disclosure and evidence required depend on jurisdiction and document type; have counsel and the signing provider approve the final flow before launch.
- Offer **Type signature** and **Draw signature**, with a clear/redo option. Do not make drawing necessary on a phone. Show the final placement or appearance before the last **Sign and finish** action.
- After signing, lock that document version, create a tamper-evident signed copy and event record, make the copy available to both parties, and send a confirmation that contains a link rather than the sensitive document as an attachment.
- Handle declined signature, wrong signer, expired request, and interrupted signing with direct explanations and a route back to the agency.

## Brand system

The portal reuses Outmarket components with a neutral color theme. The agency configures a logo, display name, support email/phone, and optional short welcome message. Its logo and supplied artwork can retain their own colors, while buttons, links, highlights, and other shared interface elements use neutral tokens. Provide a preview for desktop, phone, email, verification, and signed receipt. Fall back to a neutral, agency-named presentation if an asset is missing. Agency identity settings are shared across the portal, transactional emails, and downloadable cover/receipt pages.


## Permissions, privacy, and reliability

- Access is granted to a **named invited email**, scoped to the specific agency and share packages. A link alone does not authorize viewing; verification is required before document content loads. Do not reveal whether an email is invited during code request.
- Six-digit codes are short-lived, single-use, and rate-limited; resend and failed attempts are throttled. Bind verification to the invitation and create a time-limited session. Reverify for high-impact actions such as signing when the session is stale.
- Enforce authorization on every document, preview page, download, comment, and signed-copy request. A recipient who works with two agencies sees separated agency-branded spaces and never a mixed list.
- Keep sensitive content out of email bodies, page metadata, analytics payloads, notification previews, and public caches. Record share changes and signing events with timestamps and actor identity.
- Notifications are event-based: first share, new document/version, broker reply, signature request, signing completed, and delivery failure for the broker. Group bursts of replies, avoid sending a message for the customer’s own action, and link to the exact item after verification.

Email codes are a convenient passwordless access method, but they should not be described as high-assurance or multi-factor authentication. NIST distinguishes email confirmation from approved out-of-band authentication; the product should choose its security posture based on the sensitivity of shared documents and signing requirements.

## Build sequence

| Phase | Deliverable | Exit check |
| --- | --- | --- |
| 0. Foundations | Agency branding from the main app; recipient/share model; permission rules; document versioning; email templates | Broker can preview exactly what a named recipient will see |
| 1. Read | Invitation, email code, shared-items list, proposal detail, full-page PDF preview, mobile layout | First-time recipient can open and read the intended document from an email on a phone |
| 2. Discuss | Passage/page/general comments, broker replies in app, thread notifications, unread states | Both parties can exchange and revisit a question in the correct document version |
| 3. Sign | Final-version designation, consent, type/draw signature, provider integration, signed copy and receipt | Recipient can complete signing and both parties can retrieve the same completed record |
| 4. Polish and launch | Revocation, expiry, replacement, delivery failure, accessibility review, instrumentation, agency pilot | Pilot agencies can recover common errors without support intervention |

Build Phase 0 with Phase 1; the portal cannot safely launch as a static viewer disconnected from recipient permissions. Phases 2 and 3 can be released separately once the read experience is reliable.

## Acceptance scenarios

1. A first-time recipient opens an invitation on a phone, enters a code, and lands on the intended proposal without creating an account.
2. An invited office manager can see only documents shared with their email, even if they change URLs or receive a forwarded link.
3. A customer can ask about selected text, a scanned PDF page, or the whole document; the broker sees each question in context and can answer.
4. A broker reply triggers a branded email and opens the exact thread after verification; unread status clears when viewed.
5. A signer can read, consent, type or draw, confirm, and retrieve the signed copy; interruption before final confirmation does not produce a signature.
6. A revoked or replaced item is no longer accessible through an old link, while prior activity and signed records remain auditable.
7. Logo, colors, agency name, sender, document screens, and completion messages contain no Outmarket branding.
8. The essential journey works with keyboard and screen reader, on a narrow phone, at increased text size, and without relying on color or precise pointer selection.

## Measures for the pilot

- Invitation delivered → verified → document opened conversion.
- Median time from opening email to first document view; code resend and failure rate.
- Proposal read, comments sent, broker response time, and reply viewed rate.
- Signature request → completed rate and abandonment step.
- Support contacts for access, preview, and signing problems; broken/expired link incidence.

## Decisions to settle before design freeze

1. Which jurisdictions and document types will be signed? This determines disclosure, retention, identity, and provider requirements.
2. Can a business have multiple recipients, and which roles may comment versus sign?
3. Which file types must preview in v1? Recommend PDF and rendered proposal first; other file types can offer a safe download until preview quality is proven.
4. Does the agency have a custom sending domain and portal domain, or will the first release use an agency-branded subdomain?
5. Can customers download unsigned source files, or only view them? Make this a per-share broker choice if agencies need both.

## Reference notes

- [W3C WCAG 2.2](https://www.w3.org/TR/wcag/) applies to web content on mobile and desktop; use it as the accessibility baseline, with generous touch controls and reflow.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html) and its [FAQ](https://pages.nist.gov/800-63-FAQ/) distinguish email confirmation codes from stronger authentication methods; treat email verification as a deliberate risk decision.
- For US consumer transactions, the [FTC's E-SIGN report](https://www.ftc.gov/sites/default/files/documents/reports/report-congress-electronic-signatures-global-and-national-commerce-act-consumer-consent-provision/esignreport.pdf) explains that electronic-record consent can require clear disclosures and proof that the consumer can access the electronic format. Apply the requirements relevant to the document and jurisdiction with legal review.

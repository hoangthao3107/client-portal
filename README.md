# Client portal design prototype

Open [portal.html](portal.html) in a browser. The sample invitation email is prefilled; enter any six digits on the next screen to explore the flow. This is a local interaction prototype: no email is sent, comments stay in the page, and the downloaded signed copy is explicitly marked as a preview.

The sign-in and code screens follow the updated Figma split layout. Moody's agency branding replaces the sample brand in that file. The email form uses the Figma mail icons, and the code entry uses six visible digit slots backed by a single accessible input. The resend control counts down for 59 seconds in this prototype.

After sign-in, the header shows an avatar button. Its account menu has Light, Dark, and System themes plus Log out. Theme preference is saved when local browser storage is available.

The main screen follows the linked home-view Figma composition: a welcome message, requests needing action, and a shared-documents table beside unread updates. When the proposal is marked reviewed and the separate commercial insurance application is signed, the action section disappears. The layout stacks on smaller screens. The proposal is for review and comments; the application requests a signature. The unread panel shows a broker reply and a newly shared letter. The table header contains search, document type, sender, and sort controls. Its sample expiry dates illustrate how time-limited sharing would appear; they are not enforced by this local prototype. The table shows document name, type, sender, and expiry; selecting a row opens its preview. The list is rendered from a document data model with type, format, sender, status, date, and preview behavior; an unknown future preview type has a safe fallback screen. Opening an update marks it read and goes to its document or conversation.

The prototype reuses the button, input, badge, card, and panel patterns from the existing Outmarket workspace. [portal.css](portal.css) uses black primary actions and a neutral client palette; the agency name and logo treatment are sample content. The [Mobbin moodboard](moodboard/moodboard.html) records the reference patterns behind the flow.

In the proposal preview, the document starts directly beneath its header. The comments panel shows all conversation threads as clickable cards. Threads start collapsed; selecting one reveals only its reply box and scrolls to its document context. Unsent replies stay with their thread when switching. Highlighting document text creates a new question card with the selected passage. On narrow screens, the Comments button in the header opens this panel.

Document rows use the file-type SVGs from the linked Outmarket Figma icon frame. PDF and XLSX match the sample files, and a generic file icon covers future formats without a matching asset.

The filter and sort controls follow the linked Figma Select component frame: Select fields for filters, the compact Inline Select treatment for sorting, and a selectable menu. Their names remain available to assistive technology without visible labels. Purple focus and selection states are changed to neutral colors for this client portal.

The commercial insurance application opens in the same document viewer shell. Its marked signature field shows the unsigned or signed state. Sign Document in the header opens a modal for a typed or drawn signature and electronic signature consent. After signing, the signature appears on the page, the header shows Signed and Download signed copy, and the request disappears from Needs your action. This remains a local prototype: the signature state lasts only for the current page session.

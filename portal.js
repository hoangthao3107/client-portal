// Interactive design prototype. Production verification, comments, and signing need services.
const screens = ['signin', 'code', 'home', 'file', 'document', 'application'];
const demoVerificationCode = '123456';
let currentScreen = 'signin';
let verified = false;
let signed = false;
let reviewedProposal = false;
const reviewedDocuments = new Set();
let activeViewerDoc = null;
let signedName = 'Alex Lee';
let signedSignatureImage = null;
let signedSignatureStyle = 'classic';
let signatureUploadData = null;
let signedDate = '';
let signatureMethod = 'type';
let hasDrawn = false;
let drawing = false;
let selectedQuote = '';
let selectedAnchorQuote = '';
let activeThreadId = null;
let draftContext = null;
const replyDrafts = new Map();
let unreadReply = true;
let unreadShare = true;
let resendCountdown = null;
const threads = [{
  id: 'cyber', documentId: 'proposal', number: 1, location: 'Page 2 · Cyber liability', quote: '$5,000,000 aggregate',
  messages: [
    { author: 'You', initials: 'AL', when: 'Yesterday', body: 'Does this include social engineering claims?' },
    { author: 'Maya Torres', initials: 'MT', when: 'Today', body: "Yes, subject to the policy's sublimit. I can walk you through the details." }
  ]
}];
const sharedDocuments = [
  { id: 'proposal', title: '2026 Business Insurance Proposal', type: 'Proposal', format: 'PDF', sharedBy: 'Maya Torres', shared: 'Sep 24, 2026', date: '2026-09-24', expires: 'Oct 24, 2026', status: 'Review requested', action: 'Review proposal', actionDescription: 'Review the recommended coverage and leave Maya any questions.', description: 'Recommended coverage and next steps for your 2026 renewal.', preview: 'proposal' },
  { id: 'application', title: '2026 Commercial Insurance Application', type: 'Application', format: 'PDF', sharedBy: 'Maya Torres', shared: 'Sep 24, 2026', date: '2026-09-24', expires: 'Oct 24, 2026', status: 'Signature requested', action: 'Review & sign', actionDescription: 'Confirm your business details before signing.', description: 'Confirm your business details and sign the application for your 2026 coverage.', preview: 'application' },
  { id: 'bor-letter', title: 'Broker of Record Letter', type: 'Letter', format: 'PDF', sharedBy: 'Maya Torres', shared: 'Sep 22, 2026', date: '2026-09-22', expires: 'Oct 24, 2026', status: 'New', description: 'A letter explaining how Moody’s will represent Cascade Logistics.', preview: 'letter' },
  { id: 'policy-summary', title: 'Current Policy Summary', type: 'Policy', format: 'PDF', sharedBy: 'Jordan Wells', shared: 'Sep 18, 2026', date: '2026-09-18', expires: 'Oct 24, 2026', status: 'Reference', description: 'A summary of your existing business insurance coverage.', preview: 'policy' },
  { id: 'certificate', title: 'Certificate of Insurance', type: 'Certificate', format: 'PDF', sharedBy: 'Maya Torres', shared: 'Sep 12, 2026', date: '2026-09-12', expires: 'Oct 24, 2026', status: 'Reference', description: 'A current certificate for your records.', preview: 'certificate' }
];
const documentTypeBadgeTones = {
  Proposal: 'orange',
  Application: 'purple',
  Letter: 'yellow',
  Policy: 'grey',
  Certificate: 'blue'
};

function $(id) { return document.getElementById(id); }
function initialsAvatar(name, className) {
  const initials = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const color = name === 'Maya Torres' ? 'avatar-color-blue' : name === 'Jordan Wells' ? 'avatar-color-green' : 'avatar-color-gray';
  const avatar = addText('span', `${className} ${color}`, initials);
  avatar.setAttribute('aria-hidden', 'true');
  return avatar;
}
const proposalMarkup = $('proposal-pages').innerHTML;
const systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)');
let themePreference = 'light';
try {
  const savedTheme = localStorage.getItem('client-portal-theme');
  if (['light', 'dark', 'system'].includes(savedTheme)) themePreference = savedTheme;
} catch (_) { /* The file preview may not allow local storage. */ }
function applyTheme() {
  document.documentElement.dataset.theme = themePreference === 'system'
    ? (systemColorScheme.matches ? 'dark' : 'light') : themePreference;
  document.querySelectorAll('[data-theme-choice]').forEach(option => {
    option.setAttribute('aria-checked', String(option.dataset.themeChoice === themePreference));
  });
}
function setThemePreference(choice) {
  themePreference = choice;
  try { localStorage.setItem('client-portal-theme', choice); } catch (_) { /* Keep it for this preview session. */ }
  applyTheme();
}
function closeAccountMenu(returnFocus = false) {
  const wasOpen = !$('account-menu').hidden;
  $('account-menu').hidden = true;
  $('account-trigger').setAttribute('aria-expanded', 'false');
  if (wasOpen && returnFocus) $('account-trigger').focus();
}
function openAccountMenu() {
  $('account-menu').hidden = false;
  $('account-trigger').setAttribute('aria-expanded', 'true');
  $('account-menu').querySelector('[aria-checked="true"]').focus();
}
applyTheme();
systemColorScheme.addEventListener?.('change', () => {
  if (themePreference === 'system') applyTheme();
});
$('account-trigger').addEventListener('click', () => {
  if ($('account-menu').hidden) openAccountMenu();
  else closeAccountMenu(true);
});
$('account-menu').addEventListener('click', event => {
  const option = event.target.closest('[data-theme-choice]');
  if (option) {
    setThemePreference(option.dataset.themeChoice);
    closeAccountMenu(true);
  }
});
$('account-logout').addEventListener('click', () => {
  closeAccountMenu();
  verified = false;
  $('code-input').value = '';
  showScreen('signin');
  $('email-input').focus();
});
document.addEventListener('pointerdown', event => {
  if (!$('account-menu').hidden && !$('header-recipient').contains(event.target)) closeAccountMenu();
});
document.addEventListener('focusin', event => {
  if (!$('account-menu').hidden && !$('header-recipient').contains(event.target)) closeAccountMenu();
});
document.addEventListener('keydown', event => {
  if ($('account-menu').hidden) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeAccountMenu(true);
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const items = [...$('account-menu').querySelectorAll('[role="menuitemradio"], [role="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    items[(index + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
  }
});
function showScreen(name) {
  if (!screens.includes(name)) return;
  if (name === 'home' && !verified) return;
  for (const screen of screens) {
    const el = $(`screen-${screen}`);
    el.hidden = screen !== name;
    el.classList.toggle('active', screen === name);
  }
  currentScreen = name;
  closeAccountMenu();
  document.body.classList.toggle('auth-active', name === 'signin' || name === 'code');
  if (name !== 'code' && resendCountdown) {
    clearInterval(resendCountdown);
    resendCountdown = null;
  }
  $('header-recipient').hidden = !verified || name === 'signin' || name === 'code';
  closeComments();
  window.scrollTo(0, 0);
  if (name === 'home') renderHomeDocuments();
  if (name === 'document') {
    $('document-main').scrollTop = 0;
    activeThreadId = null;
    draftContext = null;
    applyThreadAnchors();
    renderThreadList();
    const isReviewed = activeViewerDoc?.id === 'proposal' ? reviewedProposal : reviewedDocuments.has(activeViewerDoc?.id);
    $('mark-proposal-reviewed').textContent = isReviewed ? 'Reviewed' : 'Mark reviewed';
    $('mark-proposal-reviewed').disabled = isReviewed;
    setCommentsOpen(window.matchMedia('(min-width: 791px)').matches);
  }
  if (name === 'application') {
    $('application-main').scrollTop = 0;
    activeThreadId = null;
    draftContext = null;
    renderApplicationSignature();
    applyThreadAnchors();
    renderThreadList();
    setCommentsOpen(window.matchMedia('(min-width: 791px)').matches);
  }
}

document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => {
  const target = button.dataset.go;
  if (target === 'home' && !verified) return;
  showScreen(target);
}));

$('email-form').addEventListener('submit', event => {
  event.preventDefault();
  const email = $('email-input').value.trim();
  const error = $('email-error');
  if (!$('email-input').checkValidity()) {
    error.textContent = 'Enter a valid email address to continue.';
    error.hidden = false;
    return;
  }
  error.hidden = true;
  $('code-destination').textContent = email;
  $('recipient-email').textContent = email;
  $('code-input').value = demoVerificationCode;
  $('resend-status').textContent = '';
  renderCodeDigits();
  showScreen('code');
  startResendCountdown();
  $('code-input').focus();
});

function renderCodeDigits() {
  const digits = $('code-input').value;
  [...document.querySelectorAll('.code-digits span')].forEach((box, index) => {
    box.textContent = digits[index] || '';
    box.classList.toggle('is-current', index === Math.min(digits.length, 5));
  });
}
function startResendCountdown() {
  if (resendCountdown) clearInterval(resendCountdown);
  let remaining = 59;
  const button = $('resend-code');
  const update = () => {
    button.disabled = remaining > 0;
    button.textContent = remaining > 0 ? `Resend code in ${remaining}s` : 'Resend code';
  };
  update();
  resendCountdown = setInterval(() => {
    remaining -= 1;
    update();
    if (remaining === 0) {
      clearInterval(resendCountdown);
      resendCountdown = null;
    }
  }, 1000);
}
$('code-input').addEventListener('input', event => {
  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 6);
  renderCodeDigits();
  $('code-error').hidden = true;
});
$('code-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!/^\d{6}$/.test($('code-input').value)) {
    $('code-error').textContent = 'Enter the six-digit code from your email.';
    $('code-error').hidden = false;
    return;
  }
  verified = true;
  showScreen('home');
});
$('resend-code').addEventListener('click', () => {
  $('code-input').value = demoVerificationCode;
  renderCodeDigits();
  $('code-input').focus();
  $('resend-status').textContent = 'A new code has been sent.';
  startResendCountdown();
});
$('change-email').addEventListener('click', () => showScreen('signin'));

function activeViewerPages() { return currentScreen === 'application' ? $('application-pages') : $('proposal-pages'); }
function activeViewerMain() { return currentScreen === 'application' ? $('application-main') : $('document-main'); }
function activeSelectionBar() { return $(currentScreen === 'application' ? 'application-selection-bar' : 'selection-bar'); }
function activeSelectionText() { return $(currentScreen === 'application' ? 'application-selection-text' : 'selection-text'); }
function placeCommentsPanel() {
  const layout = currentScreen === 'application'
    ? document.querySelector('#screen-application .application-layout')
    : document.querySelector('#screen-document .document-layout');
  if (layout && $('comments-panel').parentElement !== layout) layout.append($('comments-panel'));
}
function setCommentsOpen(open) {
  if (open) placeCommentsPanel();
  else {
    document.querySelector('#screen-document .document-layout').append($('comments-panel'));
  }
  document.body.classList.toggle('panel-open', open);
  for (const toggle of [$('comments-toggle'), $('application-comments-toggle')]) {
    toggle.setAttribute('aria-expanded', String(open && toggle.id === (currentScreen === 'application' ? 'application-comments-toggle' : 'comments-toggle')));
    toggle.setAttribute('aria-label', open && toggle.id === (currentScreen === 'application' ? 'application-comments-toggle' : 'comments-toggle') ? 'Close comments' : 'Open comments');
    toggle.setAttribute('aria-pressed', String(open && toggle.id === (currentScreen === 'application' ? 'application-comments-toggle' : 'comments-toggle')));
    toggle.classList.toggle('is-active', open && toggle.id === (currentScreen === 'application' ? 'application-comments-toggle' : 'comments-toggle'));
  }
}
function openComments() { setCommentsOpen(true); }
function closeComments() { setCommentsOpen(false); }
$('comments-toggle').addEventListener('click', () => setCommentsOpen(!document.body.classList.contains('panel-open')));
$('application-comments-toggle').addEventListener('click', () => setCommentsOpen(!document.body.classList.contains('panel-open')));
$('panel-close').addEventListener('click', closeComments);
function handleCommentPageClick(event) {
  const dynamicPin = event.target.closest('.dynamic-comment-pin');
  if (dynamicPin) {
    if (dynamicPin.dataset.threadId === 'draft') {
      renderThreadList({ focus: true, scrollToActive: true });
    } else {
      openThread(dynamicPin.dataset.threadId, { focus: true, scrollToActive: true });
    }
    openComments();
    return;
  }
  if (currentScreen === 'document' && event.target.closest('#anchor-pin, #cyber-highlight')) {
    openThread('cyber');
    openComments();
  }
}
$('proposal-pages').addEventListener('click', handleCommentPageClick);
$('application-pages').addEventListener('click', handleCommentPageClick);
function openUnreadReply() {
  unreadReply = false;
  renderUpdates();
  openSharedDocument(sharedDocuments.find(doc => doc.id === 'proposal'));
  $('cyber-target').scrollIntoView({ block: 'center', behavior: 'smooth' });
  openThread('cyber');
  openComments();
}
function openUnreadShare() {
  unreadShare = false;
  renderUpdates();
  openSharedDocument(sharedDocuments.find(doc => doc.id === 'bor-letter'));
}

function addText(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = value;
  return el;
}
function documentStatus(doc) {
  if (doc.id === 'application' && signed) return 'Signed';
  if (doc.id === 'proposal' && reviewedProposal) return 'Reviewed';
  if (reviewedDocuments.has(doc.id)) return 'Reviewed';
  if (doc.id === 'bor-letter' && !unreadShare) return 'Viewed';
  return doc.status;
}
function documentAction(doc) {
  if (doc.id === 'application' && signed) return null;
  if (doc.id === 'proposal' && reviewedProposal) return null;
  return doc.action;
}
function statusBadge(label) {
  const badge = addText('span', `badge ${label === 'Signed' ? 'badge-green' : ['Reference', 'Viewed', 'Reviewed'].includes(label) ? 'badge-grey' : 'badge-neutral'}`, label);
  return badge;
}
function fileIcon(doc) {
  const icons = {
    PDF: 'action-pdf.svg', XLSX: 'file-xlsx.svg', XLS: 'file-xlsx.svg',
    DOC: 'file-doc.svg', DOCX: 'file-doc.svg', PPTX: 'file-pptx.svg',
    CSV: 'file-csv.svg', TXT: 'file-txt.svg', PNG: 'file-png.svg',
    JPG: 'file-jpeg.svg', JPEG: 'file-jpeg.svg'
  };
  const img = document.createElement('img');
  img.className = 'file-type-icon';
  img.src = `assets/${icons[(doc.format || '').toUpperCase()] || 'file-unknown.svg'}`;
  img.alt = '';
  img.width = 32;
  img.height = 32;
  return img;
}
function openSharedDocument(doc) {
  if (doc.preview === 'proposal') {
    activeViewerDoc = doc;
    $('proposal-pages').innerHTML = proposalMarkup;
    $('document-title').textContent = doc.title;
    $('selection-bar').hidden = true;
    return showScreen('document');
  }
  if (doc.preview === 'application') {
    activeViewerDoc = doc;
    $('application-selection-bar').hidden = true;
    return showScreen('application');
  }
  if (doc.id === 'bor-letter' && unreadShare) {
    unreadShare = false;
    renderUpdates();
  }
  activeViewerDoc = doc;
  $('document-title').textContent = doc.title;
  $('selection-bar').hidden = true;
  renderFilePreview(doc.preview);
  const pageContent = $('generic-preview').innerHTML;
  $('proposal-pages').innerHTML = `<article class="paper document-preview-paper" data-page="1"><div class="paper-header"><span class="paper-agency">MOODY'S<br><small>INSURANCE AGENCY</small></span><span>${doc.sharedBy} · ${doc.shared}</span></div><div class="document-preview-content">${pageContent}</div><div class="page-number">1</div></article>`;
  $('mark-proposal-reviewed').hidden = false;
  $('mark-proposal-reviewed').disabled = documentStatus(doc) === 'Reviewed';
  $('mark-proposal-reviewed').textContent = documentStatus(doc) === 'Reviewed' ? 'Reviewed' : 'Mark reviewed';
  showScreen('document');
}
function renderFilePreview(preview) {
  const templates = {
    letter: `<div class="preview-eyebrow">MOODY'S INSURANCE AGENCY</div><h2>Broker of Record Letter</h2><p>To Cascade Logistics:</p><p>This letter summarizes the agency relationship and the role Moody's will play in servicing your insurance program. Please contact Maya if any detail needs clarification.</p><div class="preview-note">The final signed letter will appear in this document space when available.</div>`,
    policy: `<div class="preview-eyebrow">Current program · Summary</div><h2>Current Policy Summary</h2><p>This document summarizes the coverage in place before the 2026 renewal. It is here for reference while you review the proposed program.</p><table><thead><tr><th>Coverage</th><th>Current limit</th></tr></thead><tbody><tr><td>General liability</td><td>$2,000,000</td></tr><tr><td>Commercial auto</td><td>$1,000,000</td></tr><tr><td>Cyber liability</td><td>$2,000,000</td></tr></tbody></table>`,
    certificate: `<div class="preview-eyebrow">Certificate of insurance</div><h2>Coverage confirmation</h2><p>Issued for Cascade Logistics as a summary of coverage currently on file.</p><table><thead><tr><th>Named insured</th><th>Policy period</th></tr></thead><tbody><tr><td>Cascade Logistics</td><td>Jan 1 – Dec 31, 2026</td></tr></tbody></table><div class="preview-note">For formal evidence of insurance, use the original certificate provided by your broker.</div>`
  };
  $('generic-preview').innerHTML = templates[preview] || `<div class="preview-eyebrow">Document preview</div><h2>Preview coming soon</h2><p>This file type is supported in the shared list. Your broker can help you access the original document while its preview is being prepared.</p>`;
}
function renderUpdates() {
  const list = $('updates-list');
  list.replaceChildren();
  const updates = [
    ...(unreadReply ? [{ sender: 'Maya Torres', kind: 'Replied', context: '2026 Business Insurance Proposal', body: 'I answered your question about the cyber liability limit.', time: 'Today', unread: true, open: openUnreadReply }] : []),
    ...(unreadShare ? [{ sender: 'Maya Torres', kind: 'Shared', context: 'Broker of Record Letter', body: 'A new letter is ready for you to read.', time: 'Sep 22', unread: true, open: openUnreadShare }] : []),
    { sender: 'Maya Torres', kind: 'Shared', context: 'Current Policy Summary', body: 'Your current coverage summary is here for reference.', time: 'Sep 18', unread: false, open: () => openSharedDocument(sharedDocuments.find(doc => doc.id === 'policy-summary')) },
    { sender: 'Maya Torres', kind: 'Shared', context: 'Certificate of Insurance', body: 'Your certificate is ready to view or download.', time: 'Sep 12', unread: false, open: () => openSharedDocument(sharedDocuments.find(doc => doc.id === 'certificate')) }
  ];
  for (const item of updates) {
    const update = document.createElement('button');
    update.type = 'button';
    update.className = 'update-feed-item';
    update.setAttribute('aria-label', `Open ${item.unread ? 'unread' : 'read'} update from ${item.sender}: ${item.kind.toLowerCase()} ${item.context}`);
    update.addEventListener('click', item.open);
    const avatar = initialsAvatar(item.sender, 'feed-avatar');
    const avatarWrap = document.createElement('span');
    avatarWrap.className = 'feed-avatar-wrap';
    avatarWrap.append(avatar);
    const actionBadge = document.createElement('span');
    actionBadge.className = `feed-avatar-badge ${item.kind === 'Replied' ? 'is-reply' : 'is-shared'}`;
    actionBadge.setAttribute('aria-hidden', 'true');
    if (item.kind === 'Replied') {
      const commentIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      commentIcon.setAttribute('viewBox', '0 0 24 24');
      commentIcon.setAttribute('fill', 'none');
      commentIcon.setAttribute('stroke', 'currentColor');
      commentIcon.setAttribute('stroke-width', '2');
      commentIcon.setAttribute('stroke-linecap', 'round');
      commentIcon.setAttribute('stroke-linejoin', 'round');
      commentIcon.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719');
      commentIcon.append(path);
      actionBadge.append(commentIcon);
    } else {
      const actionIcon = document.createElement('img');
      actionIcon.src = 'assets/action-share.svg';
      actionIcon.alt = '';
      actionIcon.width = 12;
      actionIcon.height = 12;
      actionBadge.append(actionIcon);
    }
    avatarWrap.append(actionBadge);
    const copy = document.createElement('div');
    copy.className = 'update-feed-copy';
    const heading = document.createElement('div');
    heading.className = 'feed-heading';
    const trailing = document.createElement('span');
    trailing.className = 'update-trailing';
    trailing.append(addText('time', '', item.time));
    if (item.unread) trailing.append(addText('span', 'unread-dot', ''));
    heading.append(addText('strong', '', item.sender), trailing);
    copy.append(heading, addText('span', 'feed-context', `${item.kind} • ${item.context}`), addText('p', '', item.body));
    update.append(avatarWrap, copy);
    list.append(update);
  }
}

const dashboardFilters = { type: 'all', sharedBy: 'all', sort: 'newest' };
const selectChoices = {
  type: [{ value: 'all', label: 'All types' }, ...[...new Set(sharedDocuments.map(doc => doc.type).filter(Boolean))].sort().map(type => ({ value: type, label: type }))],
  sharedBy: [{ value: 'all', label: 'Anyone' }, ...[...new Set(sharedDocuments.map(doc => doc.sharedBy))].sort().map(person => ({ value: person, label: person }))],
  sort: [{ value: 'newest', label: 'Newest first' }, { value: 'name', label: 'Name A–Z' }]
};
function closeSelect(select) {
  select.classList.remove('is-open');
  select.querySelector('.om-select-trigger').setAttribute('aria-expanded', 'false');
  select.querySelector('.om-select-menu').hidden = true;
  document.querySelector('.om-select-backdrop')?.remove();
}
function closeOtherSelects(except) {
  document.querySelectorAll('.om-select.is-open').forEach(select => {
    if (select !== except) closeSelect(select);
  });
}
function updateSelectScrollbar(menu) {
  const scroller = menu.querySelector('.om-select-options');
  const scrollbar = menu.querySelector('.om-select-scrollbar');
  const thumb = scrollbar?.firstElementChild;
  if (!scroller || !scrollbar || !thumb) return;
  const scrollRange = scroller.scrollHeight - scroller.clientHeight;
  const trackHeight = scrollbar.clientHeight;
  const hasOverflow = scrollRange > 1 && trackHeight > 0;
  scrollbar.classList.toggle('is-visible', hasOverflow);
  if (!hasOverflow) return;
  const thumbHeight = Math.min(trackHeight, Math.max(24, trackHeight * scroller.clientHeight / scroller.scrollHeight));
  const thumbTravel = trackHeight - thumbHeight;
  thumb.style.height = `${thumbHeight}px`;
  thumb.style.transform = `translateY(${thumbTravel * scroller.scrollTop / scrollRange}px)`;
}
function setupSelectScrollbar(menu) {
  const scroller = menu.querySelector('.om-select-options');
  const scrollbar = menu.querySelector('.om-select-scrollbar');
  const thumb = scrollbar?.firstElementChild;
  if (!scroller || !scrollbar || !thumb) return;
  let dragStart = null;
  scroller.addEventListener('scroll', () => updateSelectScrollbar(menu));
  scrollbar.addEventListener('pointerdown', event => {
    if (!scrollbar.classList.contains('is-visible')) return;
    const trackHeight = scrollbar.clientHeight;
    const thumbHeight = thumb.offsetHeight;
    const scrollRange = scroller.scrollHeight - scroller.clientHeight;
    if (event.target === thumb) {
      dragStart = { pointerY: event.clientY, scrollTop: scroller.scrollTop };
      scrollbar.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }
    const trackOffset = event.clientY - scrollbar.getBoundingClientRect().top - thumbHeight / 2;
    scroller.scrollTop = Math.max(0, Math.min(scrollRange, trackOffset / (trackHeight - thumbHeight) * scrollRange));
  });
  scrollbar.addEventListener('pointermove', event => {
    if (!dragStart) return;
    const trackHeight = scrollbar.clientHeight;
    const thumbHeight = thumb.offsetHeight;
    const scrollRange = scroller.scrollHeight - scroller.clientHeight;
    const thumbTravel = trackHeight - thumbHeight;
    if (thumbTravel > 0) scroller.scrollTop = dragStart.scrollTop + (event.clientY - dragStart.pointerY) * scrollRange / thumbTravel;
  });
  const endDrag = () => { dragStart = null; };
  scrollbar.addEventListener('pointerup', endDrag);
  scrollbar.addEventListener('pointercancel', endDrag);
}
function renderSelectOptions(select) {
  const key = select.dataset.select;
  const menu = select.querySelector('.om-select-menu');
  const optionsContainer = menu.querySelector('.om-select-options');
  optionsContainer.replaceChildren();
  const selected = selectChoices[key].find(choice => choice.value === dashboardFilters[key]);
  select.querySelector('.om-select-trigger span').textContent = selected.label;
  for (const choice of selectChoices[key]) {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'om-select-option';
    option.id = `${select.id}-option-${selectChoices[key].indexOf(choice)}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(choice.value === dashboardFilters[key]));
    option.tabIndex = -1;
    option.append(addText('span', '', choice.label));
    if (choice.value === dashboardFilters[key]) {
      const check = document.createElement('img');
      check.src = 'assets/select-check.svg';
      check.alt = '';
      check.width = 16;
      check.height = 16;
      option.append(check);
    }
    option.addEventListener('click', () => {
      dashboardFilters[key] = choice.value;
      renderSelectOptions(select);
      closeSelect(select);
      select.querySelector('.om-select-trigger').focus();
      renderHomeDocuments();
    });
    optionsContainer.append(option);
  }
  requestAnimationFrame(() => updateSelectScrollbar(menu));
}
function openSelect(select, focusPosition) {
  closeOtherSelects(select);
  if (window.matchMedia('(max-width: 560px)').matches && !document.querySelector('.om-select-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.className = 'om-select-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.append(backdrop);
  }
  select.classList.add('is-open');
  select.querySelector('.om-select-trigger').setAttribute('aria-expanded', 'true');
  const menu = select.querySelector('.om-select-menu');
  menu.hidden = false;
  requestAnimationFrame(() => updateSelectScrollbar(menu));
  if (focusPosition) {
    const options = [...menu.querySelectorAll('.om-select-option')];
    const target = focusPosition === 'last' ? options.at(-1) : options.find(option => option.getAttribute('aria-selected') === 'true') || options[0];
    target?.focus();
  }
}
for (const select of document.querySelectorAll('.om-select')) {
  renderSelectOptions(select);
  const trigger = select.querySelector('.om-select-trigger');
  const menu = select.querySelector('.om-select-menu');
  setupSelectScrollbar(menu);
  trigger.addEventListener('click', () => select.classList.contains('is-open') ? closeSelect(select) : openSelect(select));
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openSelect(select, event.key === 'ArrowUp' ? 'last' : 'selected');
    } else if (event.key === 'Escape' && select.classList.contains('is-open')) {
      event.preventDefault();
      closeSelect(select);
    } else if (event.key === 'Tab') {
      closeSelect(select);
    }
  });
  menu.addEventListener('keydown', event => {
    const options = [...menu.querySelectorAll('.om-select-option')];
    const index = options.indexOf(document.activeElement);
    let next = index;
    if (event.key === 'ArrowDown') next = (index + 1) % options.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else if (event.key === 'Escape') {
      closeSelect(select);
      trigger.focus();
      event.preventDefault();
      return;
    } else if (event.key === 'Tab') {
      closeSelect(select);
      return;
    } else return;
    event.preventDefault();
    options[next]?.focus();
  });
}
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.om-select')) closeOtherSelects();
});
function renderHomeDocuments() {
  renderUpdates();
  const actionDocs = sharedDocuments.filter(documentAction).sort((a, b) => Number(b.id === 'application') - Number(a.id === 'application'));
  const actionList = $('action-list');
  actionList.replaceChildren();
  $('action-section').hidden = actionDocs.length === 0;
  for (const doc of actionDocs) {
    const item = document.createElement('div');
    item.className = `action-feed-item${doc.id === 'application' ? ' is-signature' : ''}`;
    item.append(fileIcon(doc));
    const copy = document.createElement('div');
    copy.className = 'action-feed-copy';
    const summary = document.createElement('div');
    summary.className = 'action-feed-summary';
    summary.append(addText('h3', 'action-feed-title', doc.title), addText('p', 'action-feed-description', doc.actionDescription || doc.description));
    copy.append(summary);
    const meta = addText('span', 'action-feed-meta', `Shared by ${doc.sharedBy} • `);
    const date = addText('time', '', doc.shared);
    date.dateTime = doc.date;
    meta.append(date);
    copy.append(meta);
    const open = addText('button', 'btn btn-secondary action-feed-button', doc.action);
    open.type = 'button';
    open.addEventListener('click', () => openSharedDocument(doc));
    item.append(copy, open);
    actionList.append(item);
  }

  $('document-count').textContent = `${sharedDocuments.length} documents`;
  const query = $('document-search').value.trim().toLowerCase();
  const matches = sharedDocuments.filter(doc =>
    (dashboardFilters.type === 'all' || doc.type === dashboardFilters.type) &&
    (dashboardFilters.sharedBy === 'all' || doc.sharedBy === dashboardFilters.sharedBy) &&
    `${doc.title} ${doc.type || ''} ${doc.sharedBy} ${doc.description}`.toLowerCase().includes(query)
  );
  if (dashboardFilters.sort === 'name') matches.sort((a, b) => a.title.localeCompare(b.title));
  else matches.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  $('empty-documents').hidden = Boolean(matches.length);
  $('documents-list').closest('table').hidden = !matches.length;
  const list = $('documents-list');
  list.replaceChildren();
  for (const doc of matches) {
    const row = document.createElement('tr');
    row.className = 'document-table-row';
    row.addEventListener('click', () => openSharedDocument(doc));
    const nameCell = document.createElement('td');
    const openButton = document.createElement('button');
    openButton.type = 'button';
    openButton.className = 'table-document-button';
    openButton.append(fileIcon(doc));
    const nameCopy = document.createElement('span');
    nameCopy.append(addText('strong', '', doc.title));
    const mobileMeta = addText('span', 'table-document-mobile-meta', `${doc.type || 'Document'} • expires ${doc.expires || 'No expiry'}`);
    nameCopy.append(mobileMeta);
    openButton.append(nameCopy);
    openButton.addEventListener('click', event => { event.stopPropagation(); openSharedDocument(doc); });
    nameCell.append(openButton);
    row.append(nameCell);
    const typeCell = document.createElement('td');
    typeCell.className = 'table-type-cell';
    typeCell.dataset.label = 'Type';
    if (doc.type) {
      const badgeTone = documentTypeBadgeTones[doc.type] || 'grey';
      typeCell.append(addText('span', `badge badge-type badge-type-${badgeTone}`, doc.type));
    }
    row.append(typeCell);
    const senderCell = document.createElement('td');
    senderCell.className = 'table-sender-cell';
    senderCell.dataset.label = 'Shared by';
    const sender = document.createElement('span');
    sender.className = 'table-sender';
    sender.append(initialsAvatar(doc.sharedBy, 'table-sender-avatar'), addText('span', 'table-sender-name', doc.sharedBy));
    senderCell.append(sender);
    row.append(senderCell);
    const expiryCell = addText('td', 'table-expiry-cell', doc.expires || 'No expiry');
    expiryCell.dataset.label = 'Expires';
    row.append(expiryCell);
    list.append(row);
  }
}
$('document-search').addEventListener('input', renderHomeDocuments);
function renderThreadMessages(container, messages) {
  for (const message of messages) {
    const row = document.createElement('div');
    row.className = 'message';
    const avatarName = message.author === 'You' ? 'Alex Lee' : message.author;
    const avatar = initialsAvatar(avatarName, 'message-avatar');
    row.append(avatar);
    const copy = document.createElement('div');
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.append(addText('strong', '', message.author), addText('span', '', message.when));
    copy.append(meta, addText('p', '', message.body));
    row.append(copy);
    container.append(row);
  }
}
function renderThreadList({ focus = false, scrollToActive = false } = {}) {
  const list = $('thread-list');
  list.replaceChildren();
  const documentThreads = threads.filter(thread => thread.documentId === (activeViewerDoc?.id || 'proposal'));
  const visibleThreads = draftContext
    ? [{ id: 'draft', number: draftContext.number, location: draftContext.location, quote: draftContext.quote, messages: [], draft: true }, ...documentThreads]
    : documentThreads;
  $('all-threads').hidden = visibleThreads.length === 0;
  if (!visibleThreads.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'comments-empty-state';
    const featured = document.createElement('span');
    featured.className = 'comments-empty-featured';
    featured.setAttribute('aria-hidden', 'true');
    const commentIcon = $('comments-toggle').querySelector('svg').cloneNode(true);
    commentIcon.removeAttribute('width');
    commentIcon.removeAttribute('height');
    commentIcon.classList.remove('preview-icon');
    featured.append(commentIcon);
    const copy = addText('p', 'comments-empty-copy', 'Select text to comment, or choose Add comment for the whole document.');
    const addComment = document.createElement('button');
    addComment.className = 'comments-empty-action';
    addComment.type = 'button';
    const plusIcon = $('all-threads').querySelector('svg').cloneNode(true);
    plusIcon.removeAttribute('width');
    plusIcon.removeAttribute('height');
    plusIcon.classList.remove('preview-icon');
    addComment.append(plusIcon, addText('span', '', 'Add comment'));
    addComment.addEventListener('click', () => beginQuestion(`Page ${currentPage()} · General question`, 'This page'));
    emptyState.append(featured, copy, addComment);
    list.append(emptyState);
    return;
  }
  for (const thread of visibleThreads) {
    const active = thread.draft || thread.id === activeThreadId;
    const card = document.createElement('article');
    card.className = `comment-thread${active ? ' is-active' : ''}`;
    card.dataset.threadId = thread.id;
    const head = document.createElement('div');
    head.className = 'comment-thread-head';
    head.append(addText('span', 'comment-thread-location', thread.location));
    card.append(head);
    card.append(addText('blockquote', '', thread.quote === 'This page' ? 'Question about this page' : `“${thread.quote}”`));
    const messages = document.createElement('div');
    messages.className = 'thread-messages';
    renderThreadMessages(messages, thread.messages);
    card.append(messages);
    const selectThread = () => {
      if (thread.draft) {
        renderThreadList({ focus: true, scrollToActive: true });
        openComments();
      } else if (!active) openThread(thread.id, { focus: true, scrollToActive: true });
      scrollToThreadAnchor(thread);
    };
    card.addEventListener('click', event => {
      if (!event.target.closest('.thread-composer')) selectThread();
    });
    if (!active) {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Open comment thread on ${thread.location}`);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectThread();
        }
      });
    }
    if (active) {
      card.setAttribute('role', 'group');
      card.setAttribute('aria-label', `Comment thread on ${thread.location}`);
      const form = document.createElement('form');
      form.className = 'thread-composer';
      const label = addText('label', 'sr-only', thread.draft ? 'Your question for Maya' : 'Reply to this conversation');
      const input = document.createElement('textarea');
      input.id = `comment-input-${thread.id}`;
      input.rows = 2;
      input.required = true;
      input.placeholder = thread.draft ? 'What would you like to ask?' : 'Write a reply…';
      if (!thread.draft) {
        input.value = replyDrafts.get(thread.id) || '';
        input.addEventListener('input', () => replyDrafts.set(thread.id, input.value));
      }
      label.htmlFor = input.id;
      const actions = document.createElement('div');
      actions.className = 'thread-composer-actions';
      const discard = addText('button', 'btn btn-secondary btn-sm', 'Discard');
      discard.type = 'button';
      discard.addEventListener('click', () => {
        if (thread.draft) {
          draftContext = null;
          applyThreadAnchors();
        } else {
          replyDrafts.delete(thread.id);
        }
        activeThreadId = null;
        renderThreadList();
        if (thread.draft) {
          $('all-threads').focus({ preventScroll: true });
        } else {
          [...list.querySelectorAll('.comment-thread')]
            .find(item => item.dataset.threadId === thread.id)
            ?.focus({ preventScroll: true });
        }
      });
      const send = addText('button', 'btn btn-primary btn-sm', thread.draft ? 'Ask question' : 'Reply');
      send.type = 'submit';
      actions.append(discard, send);
      form.append(label, input, actions);
      card.append(form);
    }
    list.append(card);
  }
  const activeCard = list.querySelector('.comment-thread.is-active');
  if (scrollToActive) activeCard?.scrollIntoView({ block: 'nearest' });
  if (focus) activeCard?.querySelector('textarea')?.focus({ preventScroll: true });
}
function openThread(id, options = {}) {
  if (!threads.some(thread => thread.id === id && thread.documentId === (activeViewerDoc?.id || 'proposal'))) return;
  draftContext = null;
  activeThreadId = id;
  applyThreadAnchors();
  renderThreadList(options);
}
function scrollToThreadAnchor(thread) {
  const page = Number(thread.location.match(/Page (\d+)/)?.[1]);
  const pages = activeViewerPages();
  const marker = thread.id === 'cyber' ? null : pages.querySelector(`.dynamic-comment-pin[data-thread-id="${CSS.escape(thread.id)}"]`);
  const target = marker || (thread.id === 'cyber' ? $('cyber-target') : pages.querySelector(`.paper[data-page="${page}"]`));
  target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
function nextThreadNumber(documentId = activeViewerDoc?.id || 'proposal') {
  return Math.max(0, ...threads.filter(thread => thread.documentId === documentId).map(thread => thread.number || 0)) + 1;
}
function makeCommentPin(thread, pageMarker = false) {
  const pin = addText('button', `dynamic-comment-pin${pageMarker ? ' page-comment-marker' : ''}`, String(thread.number));
  pin.type = 'button';
  pin.dataset.threadId = thread.id;
  pin.setAttribute('aria-label', `${thread.draft ? 'Draft comment' : 'Open comment'} ${thread.number} on ${thread.location}`);
  return pin;
}
function applyThreadAnchors() {
  const pages = activeViewerPages();
  if (currentScreen === 'document') {
    $('anchor-pin')?.classList.toggle('is-active', activeThreadId === 'cyber');
    $('cyber-highlight')?.classList.toggle('is-active', activeThreadId === 'cyber');
  }
  pages.querySelectorAll('.dynamic-comment-anchor').forEach(anchor => {
    anchor.querySelector('.dynamic-comment-pin')?.remove();
    anchor.replaceWith(...anchor.childNodes);
  });
  pages.querySelectorAll('.page-comment-marker').forEach(marker => marker.remove());
  const documentId = activeViewerDoc?.id || 'proposal';
  const anchors = threads.filter(thread => thread.documentId === documentId && thread.id !== 'cyber');
  if (draftContext?.documentId === documentId) anchors.unshift({
    id: 'draft', number: draftContext.number, location: draftContext.location, quote: draftContext.quote,
    anchorQuote: draftContext.anchorQuote, draft: true
  });
  for (const thread of anchors) {
    const pageNumber = Number(thread.location.match(/Page (\d+)/)?.[1]) || 1;
    const page = pages.querySelector(`.paper[data-page="${pageNumber}"]`);
    if (!page) continue;
    const quote = thread.anchorQuote || (thread.location.includes('Selected text') ? thread.quote : '');
    let markerPlaced = false;
    if (quote) {
      const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.nodeValue.includes(quote) || node.parentElement?.closest('button, .dynamic-comment-anchor')) continue;
        const start = node.nodeValue.indexOf(quote);
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, start + quote.length);
        const anchor = document.createElement('span');
        anchor.className = 'dynamic-comment-anchor';
        anchor.dataset.threadId = thread.id;
        if (thread.id === activeThreadId || thread.draft) anchor.classList.add('is-active');
        anchor.append(range.extractContents(), makeCommentPin(thread));
        range.insertNode(anchor);
        markerPlaced = true;
        break;
      }
    }
    if (!markerPlaced) {
      const pin = makeCommentPin(thread, true);
      if (thread.id === activeThreadId || thread.draft) pin.classList.add('is-active');
      page.append(pin);
    }
  }
}
function beginQuestion(location, quote, anchorQuote = '') {
  activeThreadId = null;
  draftContext = { documentId: activeViewerDoc?.id || 'proposal', number: nextThreadNumber(), location, quote, anchorQuote };
  openComments();
  applyThreadAnchors();
  renderThreadList({ focus: true, scrollToActive: true });
}
function currentPage() {
  const main = activeViewerMain();
  const pages = [...main.querySelectorAll('.paper')];
  const top = main.getBoundingClientRect().top;
  const page = pages.findLast(el => el.getBoundingClientRect().top < top + 170) || pages[0];
  return Number(page.dataset.page);
}
$('all-threads').addEventListener('click', () => beginQuestion(`Page ${currentPage()} · General question`, 'This page'));
$('thread-list').addEventListener('submit', event => {
  const form = event.target.closest('.thread-composer');
  if (!form) return;
  event.preventDefault();
  const body = form.querySelector('textarea').value.trim();
  if (!body) return;
  if (draftContext) {
    const id = `question-${Date.now()}`;
    threads.unshift({ id, documentId: draftContext.documentId, number: draftContext.number, location: draftContext.location, quote: draftContext.quote, anchorQuote: draftContext.anchorQuote, messages: [{ author: 'You', initials: 'AL', when: 'Just now', body }] });
    openThread(id, { focus: true, scrollToActive: true });
  } else {
    const thread = threads.find(item => item.id === activeThreadId);
    if (!thread) return;
    thread.messages.push({ author: 'You', initials: 'AL', when: 'Just now', body });
    replyDrafts.delete(thread.id);
    renderThreadList({ focus: true, scrollToActive: true });
  }
});

function captureSelection() {
  const selection = window.getSelection();
  const text = selection?.toString().trim().replace(/\s+/g, ' ') || '';
  const anchor = selection?.anchorNode?.parentElement;
  const isInPaper = anchor?.closest('.paper');
  if (text.length < 3 || !isInPaper || text.length > 400) {
    activeSelectionBar().hidden = true;
    return;
  }
  selectedQuote = text;
  selectedAnchorQuote = selection.toString().trim();
  activeSelectionText().textContent = `“${text.slice(0, 85)}${text.length > 85 ? '…' : ''}”`;
  activeSelectionBar().hidden = false;
}
for (const pages of [$('proposal-pages'), $('application-pages')]) {
  pages.addEventListener('mouseup', () => setTimeout(captureSelection, 0));
  pages.addEventListener('touchend', () => setTimeout(captureSelection, 150));
}
function commentOnSelection() {
  const page = currentPage();
  beginQuestion(`Page ${page} · Selected text`, selectedQuote, selectedAnchorQuote);
  activeSelectionBar().hidden = true;
  window.getSelection()?.removeAllRanges();
}
$('comment-selection').addEventListener('click', commentOnSelection);
$('application-comment-selection').addEventListener('click', commentOnSelection);
$('download-proposal').addEventListener('click', () => window.print());
$('mark-proposal-reviewed').addEventListener('click', () => {
  if (activeViewerDoc?.id === 'proposal') reviewedProposal = true;
  else if (activeViewerDoc) reviewedDocuments.add(activeViewerDoc.id);
  showScreen('home');
});

function renderApplicationSignature() {
  $('application-sign-action').hidden = signed;
  $('application-download-action').hidden = !signed;
  $('application-signed-badge').hidden = !signed;
  $('signature-field-status').textContent = signed ? 'Signed' : 'Signature required';
  $('signature-field-status').className = `badge ${signed ? 'badge-green' : 'badge-neutral'}`;
  $('application-signature-placeholder').hidden = signed;
  $('application-signature-value').hidden = !signed;
  $('application-signature-value').className = `application-signature-value signature-style-${signedSignatureStyle}`;
  $('application-signature-value').replaceChildren();
  if (signed) {
    if (signedSignatureImage) {
      const image = document.createElement('img');
      image.src = signedSignatureImage;
      image.alt = `Signature drawn by ${signedName}`;
      $('application-signature-value').append(image);
    } else {
      $('application-signature-value').textContent = signedName;
    }
  }
  $('application-signature-date').textContent = signed ? `Signed ${signedDate}` : 'Date signed: —';
  $('application-signature-block').classList.toggle('is-signed', signed);
}

$('application-sign-action').addEventListener('click', () => {
  if (signed) return;
  $('sign-error').hidden = true;
  $('signature-dialog-subtitle').textContent = `Adopt your signature for ${activeViewerDoc?.title || '2026 Commercial Insurance Application'}`;
  $('signature-dialog').showModal();
  $(signatureMethod === 'draw' ? 'signature-canvas' : signatureMethod === 'upload' ? 'signature-upload' : 'signature-name').focus();
});
function closeSignatureDialog() { $('signature-dialog').close(); }
$('close-signature-dialog').addEventListener('click', closeSignatureDialog);
$('cancel-signature-dialog').addEventListener('click', closeSignatureDialog);

function setSignatureMethod(method) {
  signatureMethod = method;
  $('sign-error').hidden = true;
  for (const candidate of ['type', 'draw', 'upload']) {
    $(`${candidate}-tab`).classList.toggle('active', candidate === method);
    $(`${candidate}-tab`).setAttribute('aria-selected', String(candidate === method));
    $(`${candidate}-signature`).hidden = candidate !== method;
  }
}
$('type-tab').addEventListener('click', () => setSignatureMethod('type'));
$('draw-tab').addEventListener('click', () => setSignatureMethod('draw'));
$('upload-tab').addEventListener('click', () => setSignatureMethod('upload'));
$('signature-name').addEventListener('input', event => {
  $('sign-error').hidden = true;
  const name = event.target.value.trim();
  document.querySelectorAll('[data-signature-preview]').forEach(preview => { preview.textContent = name || 'Your signature'; });
});
$('signature-upload').addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (!file) return;
  const error = $('sign-error');
  if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    signatureUploadData = null;
    event.target.value = '';
    $('signature-upload-preview').hidden = true;
    error.textContent = 'Choose a PNG or JPEG image under 5 MB.';
    error.hidden = false;
    return;
  }
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    signatureUploadData = String(reader.result);
    $('signature-upload-image').src = signatureUploadData;
    $('signature-upload-preview').hidden = false;
    error.hidden = true;
  });
  reader.readAsDataURL(file);
});
$('remove-signature-upload').addEventListener('click', () => {
  signatureUploadData = null;
  $('signature-upload').value = '';
  $('signature-upload-image').removeAttribute('src');
  $('signature-upload-preview').hidden = true;
});

const canvas = $('signature-canvas');
const ctx = canvas.getContext('2d');
ctx.strokeStyle = '#1b1d1d';
ctx.lineWidth = 3;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
}
canvas.addEventListener('pointerdown', event => {
  drawing = true;
  canvas.setPointerCapture(event.pointerId);
  const point = canvasPoint(event);
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
});
canvas.addEventListener('pointermove', event => {
  if (!drawing) return;
  const point = canvasPoint(event);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  hasDrawn = true;
});
for (const type of ['pointerup', 'pointercancel']) canvas.addEventListener(type, () => { drawing = false; });
$('clear-signature').addEventListener('click', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); hasDrawn = false; });

$('finish-signing').addEventListener('click', () => {
  const error = $('sign-error');
  if (!$('consent-checkbox').checked) {
    error.textContent = 'Please review and agree to the electronic signature consent.';
    error.hidden = false;
    $('consent-checkbox').focus();
    return;
  }
  if (signatureMethod === 'type' && !$('signature-name').value.trim()) {
    error.textContent = 'Type your full name to add your signature.';
    error.hidden = false;
    $('signature-name').focus();
    return;
  }
  if (signatureMethod === 'draw' && !hasDrawn) {
    error.textContent = 'Draw your signature or choose another signing method.';
    error.hidden = false;
    canvas.focus();
    return;
  }
  if (signatureMethod === 'upload' && !signatureUploadData) {
    error.textContent = 'Upload an image of your signature or choose another method.';
    error.hidden = false;
    $('signature-upload').focus();
    return;
  }
  error.hidden = true;
  signed = true;
  signedName = $('signature-name').value.trim() || 'Alex Lee';
  signedSignatureImage = signatureMethod === 'draw' ? canvas.toDataURL('image/png') : signatureMethod === 'upload' ? signatureUploadData : null;
  signedSignatureStyle = 'classic';
  signedDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  closeSignatureDialog();
  renderApplicationSignature();
});

function downloadSignedCopy() {
  if (!signed) return;
  const name = signedName.replace(/[&<>"']/g, '');
  const date = signedDate;
  const signature = signedSignatureImage ? `<img src="${signedSignatureImage}" alt="Signature drawn by ${name}">` : name;
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Signed application preview</title><style>body{font:16px/1.5 Arial,sans-serif;max-width:760px;margin:60px auto;color:#1b1d1d}h1{font-size:40px;line-height:1.2}header{border-bottom:2px solid #333;padding-bottom:20px}.note{background:#f1f3f1;padding:16px;margin:30px 0}.signature{font:italic 32px Georgia,serif;border-bottom:1px solid #555;padding:20px 0}.signature img{display:block;max-width:360px;max-height:100px}</style><header><strong>MOODY'S INSURANCE AGENCY</strong></header><p>Applicant: Cascade Logistics</p><h1>2026 Commercial Insurance Application</h1><p>Requested coverage period: January 1 – December 31, 2026</p><h2>Coverage requested</h2><ul><li>General liability</li><li>Commercial auto</li><li>Cyber liability</li><li>Professional liability</li></ul><h2>Signature preview</h2><div class="signature">${signature}</div><p>Signed by ${name} on ${date}</p><p class="note"><strong>Design prototype only.</strong> This file demonstrates the intended signed-copy experience. It is not a legally executed document or audit record.</p></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = '2026-commercial-insurance-application-signed-preview.html';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('application-download-action').addEventListener('click', downloadSignedCopy);

renderThreadList();

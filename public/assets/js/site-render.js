(function (global) {
  const SERVICE_ICONS = {
    barangay_clearance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/></svg>',
    residency_certificate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4 21V9l8-6 8 6v12"/><path stroke-linecap="round" d="M9 21v-6h6v6"/></svg>',
    indigency_certificate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path stroke-linecap="round" d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    business_clearance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="9" width="18" height="12" rx="1"/><path stroke-linecap="round" d="M8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M3 13h18"/></svg>',
    blotter_report: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.3 4.3 2.6 18a1 1 0 0 0 .9 1.5h17a1 1 0 0 0 .9-1.5L13.7 4.3a1 1 0 0 0-1.8 0Z"/></svg>',
    complaint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>',
    pet_registration: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5.5" cy="9.5" r="1.7"/><circle cx="9.5" cy="5.5" r="1.7"/><circle cx="14.5" cy="5.5" r="1.7"/><circle cx="18.5" cy="9.5" r="1.7"/><path stroke-linecap="round" d="M12 21c-3 0-5.5-1.6-5.5-4.2 0-2 1.7-3 2.8-4.3 1-1.2 1.2-2.5 2.7-2.5s1.7 1.3 2.7 2.5c1.1 1.3 2.8 2.3 2.8 4.3C17.5 19.4 15 21 12 21Z"/></svg>',
  };

  const SERVICE_DESCRIPTIONS = {
    barangay_clearance: 'General-purpose clearance for employment, travel, or ID applications.',
    residency_certificate: 'Certifies proof of residency within the barangay.',
    indigency_certificate: 'For residents applying for financial or medical assistance.',
    business_clearance: 'Required for new or renewing business permit applications.',
    blotter_report: 'File an incident report for barangay mediation or police referral.',
    complaint: 'Formally raise a dispute or concern for barangay action.',
    pet_registration: 'Register your pet and log its anti-rabies vaccination.',
  };

  function serviceCardHtml(key, def, loggedIn) {
    return `
      <div class="service-card">
        <span class="icon">${SERVICE_ICONS[key]}</span>
        <h3>${def.label}</h3>
        <p>${SERVICE_DESCRIPTIONS[key]}</p>
        <span class="fee">${def.fee ? `Fee: ₱${def.fee}` : 'No fee'}</span>
        <a href="${loggedIn ? `dashboard.html?type=${key}#new-request` : `login.html?next=dashboard.html%3Ftype%3D${key}%23new-request`}" class="btn btn-blue btn-sm btn-pill btn-chevron">Request Now</a>
      </div>`;
  }

  async function renderServiceCards(container, { limit } = {}) {
    if (!container) return;
    const session = await Api.me();
    const entries = Object.entries(DemoDB.SERVICE_TYPES).slice(0, limit || 100);
    container.innerHTML = entries.map(([key, def]) => serviceCardHtml(key, def, !!session)).join('');
  }

  function announcementHtml(a) {
    const d = new Date(a.published_at);
    const catTag = { announcement: 'tag', program: 'tag-gold', advisory: 'tag-red', event: 'tag-green' }[a.category] || 'tag';
    return `
      <article class="announcement ${a.is_pinned ? 'pinned' : ''}">
        <div class="date-block">
          <div class="day">${d.getDate()}</div>
          <div class="mon">${d.toLocaleString('en-PH', { month: 'short' }).toUpperCase()}</div>
        </div>
        <div>
          <div class="meta"><span class="tag ${catTag}">${a.category.charAt(0).toUpperCase() + a.category.slice(1)}</span> ${a.is_pinned ? '<span class="tag tag-grey">Pinned</span>' : ''}</div>
          <h3>${Utils.escapeHtml(a.title)}</h3>
          <p>${Utils.escapeHtml(a.body)}</p>
        </div>
      </article>`;
  }

  async function renderAnnouncementList(container, { limit } = {}) {
    if (!container) return;
    const list = await Api.listAnnouncements();
    const items = limit ? list.slice(0, limit) : list;
    container.innerHTML = items.length
      ? items.map(announcementHtml).join('')
      : `<div class="empty-state">No announcements posted yet.</div>`;
  }

  const TIER_LABELS = {
    chairman: 'Punong Barangay',
    kagawad: 'Sangguniang Barangay (Kagawad)',
    sk_chairman: 'Sangguniang Kabataan',
    sk_kagawad: 'Sangguniang Kabataan',
    secretary: 'Barangay Secretariat',
    treasurer: 'Barangay Secretariat',
    tanod: 'Barangay Peacekeeping Force (Tanod)',
  };
  const TIER_ORDER = ['chairman', 'kagawad', 'sk_chairman__sk_kagawad', 'secretary__treasurer', 'tanod'];

  function initials(name) {
    return name.replace(/^Hon\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('');
  }
  function officialRowHtml(o) {
    return `
      <div class="official-row">
        <div class="photo" style="display:flex;align-items:center;justify-content:center;font-weight:600;color:#0B2545;">${initials(o.full_name)}</div>
        <div class="info">
          <div class="role">${o.role_title}</div>
          <div class="name">${Utils.escapeHtml(o.full_name)}</div>
          <div class="committee">${o.committee || ''} ${o.term ? '• ' + o.term : ''}</div>
        </div>
      </div>`;
  }

  async function renderChairmanCard(container) {
    if (!container) return;
    const officials = await Api.listOfficials();
    const chairman = officials.find((o) => o.position === 'chairman');
    if (!chairman) { container.innerHTML = '<div class="empty-state">Not yet posted.</div>'; return; }
    container.innerHTML = `
      <div class="chairman-feature">
        <div class="photo" style="display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:600;color:#0B2545;">${initials(chairman.full_name)}</div>
        <div>
          <div class="role">${chairman.role_title}</div>
          <h2>${Utils.escapeHtml(chairman.full_name)}</h2>
          <p>${chairman.committee || ''} ${chairman.term ? `• Term: ${chairman.term}` : ''}</p>
        </div>
      </div>`;
  }

  async function renderOfficialsDirectory(container) {
    if (!container) return;
    const officials = await Api.listOfficials();
    const chairman = officials.filter((o) => o.position === 'chairman');
    const kagawad = officials.filter((o) => o.position === 'kagawad').sort((a, b) => a.display_order - b.display_order);
    const sk = officials.filter((o) => o.position === 'sk_chairman' || o.position === 'sk_kagawad')
      .sort((a, b) => (a.position === 'sk_chairman' ? -1 : 1) - (b.position === 'sk_chairman' ? -1 : 1) || a.display_order - b.display_order);
    const staff = officials.filter((o) => o.position === 'secretary' || o.position === 'treasurer');
    const tanod = officials.filter((o) => o.position === 'tanod').sort((a, b) => a.display_order - b.display_order);

    let html = '';
    if (chairman[0]) {
      html += `
        <div class="chairman-feature">
          <div class="photo" style="display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:600;color:#0B2545;">${initials(chairman[0].full_name)}</div>
          <div>
            <div class="role">${chairman[0].role_title}</div>
            <h2>${Utils.escapeHtml(chairman[0].full_name)}</h2>
            <p>${chairman[0].committee || ''} ${chairman[0].term ? `• Term: ${chairman[0].term}` : ''}</p>
          </div>
        </div>`;
    }
    const tier = (label, list) => list.length ? `
      <div class="org-tier">
        <span class="tier-label">${label}</span>
        ${list.map(officialRowHtml).join('')}
      </div>` : '';

    html += tier('Sangguniang Barangay — Kagawad', kagawad);
    html += tier('Sangguniang Kabataan', sk);
    html += tier('Barangay Secretariat', staff);
    html += tier('Barangay Peacekeeping Force — Tanod', tanod);
    container.innerHTML = html || '<div class="empty-state">No officials posted yet.</div>';
  }

  global.SiteRender = { renderServiceCards, renderAnnouncementList, renderChairmanCard, renderOfficialsDirectory, SERVICE_ICONS, SERVICE_DESCRIPTIONS };
})(window);

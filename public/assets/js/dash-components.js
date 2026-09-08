(function (global) {
  const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path stroke-linecap="round" d="M14 3v5h5M9 13h6M9 17h6M9 9h2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path stroke-linecap="round" d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path stroke-linecap="round" d="M2.5 20c1-3.6 3.7-5.5 6.5-5.5s5.5 1.9 6.5 5.5"/><circle cx="17" cy="8.5" r="2.8"/><path stroke-linecap="round" d="M16 14.7c2.2.4 4 1.9 4.8 5.3"/></svg>',
    bullhorn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10v4a1 1 0 0 0 1 1h2l1 5h2l-1-5h1l9 4V6l-9 4H4a1 1 0 0 0-1 1Z"/><path stroke-linecap="round" d="M19 9.5v5"/></svg>',
    badge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="9" r="5"/><path stroke-linecap="round" stroke-linejoin="round" d="m8 13-2 8 6-3 6 3-2-8"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>',
  };

  const RESIDENT_NAV = [
    { key: 'overview', label: 'Overview', icon: 'home' },
    { key: 'new-request', label: 'Submit a Request', icon: 'plus' },
    { key: 'my-requests', label: 'My Requests', icon: 'doc' },
    { key: 'profile', label: 'My Profile', icon: 'user' },
  ];

  const ADMIN_NAV = [
    { key: 'index.html', label: 'Overview', icon: 'grid' },
    { key: 'requests.html', label: 'Service Requests', icon: 'doc' },
    { key: 'residents.html', label: 'Residents', icon: 'users' },
    { key: 'announcements.html', label: 'Announcements', icon: 'bullhorn' },
    { key: 'officials.html', label: 'Officials', icon: 'badge' },
  ];

  async function renderSidebar({ role, active, basePrefix = '' }) {
    const target = document.getElementById('dashSidebar');
    if (!target) return;
    const info = await Api.getBarangayInfo();
    const session = await Api.me();
    const items = role === 'admin' ? ADMIN_NAV : RESIDENT_NAV;
    const linkFor = (key) => role === 'admin' ? key : `#${key}`;

    target.innerHTML = `
      <div class="brand">
        <div style="display:flex;align-items:center;gap:10px;">
          ${Components.sealSvg(34)}
          <div>
            <div class="barangay">${info.barangay_name || 'Barangay PH'}</div>
            <div class="locality">${role === 'admin' ? 'Admin Console' : 'Resident Portal'}</div>
          </div>
        </div>
      </div>
      <nav class="dash-nav" id="dashNav">
        ${items.map((it) => `
          <a href="${linkFor(it.key)}" data-key="${it.key}" class="${it.key === active ? 'active' : ''}">
            ${ICONS[it.icon]}<span>${it.label}</span>
          </a>`).join('')}
      </nav>
      <div class="sidebar-foot">
        <div class="who">${session ? session.name : ''}</div>
        <div class="who-sub">${role === 'admin' ? (session?.role === 'super_admin' ? 'Super Admin' : 'Staff') : 'Resident'}</div>
        <button class="btn btn-outline btn-sm btn-block" id="logoutBtn" style="border-color:rgba(255,255,255,0.3);color:#fff;">${ICONS.logout} Log Out</button>
      </div>`;

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await Api.logout();
      location.href = role === 'admin' ? '../login.html' : 'login.html';
    });
  }

  function renderTopbar({ title, subtitle }) {
    const target = document.getElementById('dashTopbar');
    if (!target) return;
    target.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu">${ICONS.grid}</button>
        <div>
          <h1>${title}</h1>
          ${subtitle ? `<div class="page-sub">${subtitle}</div>` : ''}
        </div>
      </div>`;
    const sidebar = document.getElementById('dashSidebar');
    const overlay = document.getElementById('drawerOverlay');
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
      sidebar?.classList.add('open');
      overlay?.classList.add('open');
    });
    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('open');
    });
  }

  global.DashUI = { renderSidebar, renderTopbar, ICONS };
})(window);

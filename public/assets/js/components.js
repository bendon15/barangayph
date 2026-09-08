/**
 * components.js
 * Renders the shared header, footer, and barangay seal into any
 * page that includes <div data-component="site-header"> etc.
 * Centralizing these means editing one file updates every page.
 */
(function (global) {
  function generatedSvgSeal(size) {
    return `
    <svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Barangay PH seal">
      <circle cx="50" cy="50" r="48" fill="#0B2545" stroke="#E8A93B" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#E8A93B" stroke-width="1" opacity="0.5"/>
      <g fill="#E8A93B">
        <circle cx="50" cy="50" r="12"/>
        ${Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const x1 = 50 + Math.cos(angle) * 15, y1 = 50 + Math.sin(angle) * 15;
          const x2 = 50 + Math.cos(angle) * 26, y2 = 50 + Math.sin(angle) * 26;
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E8A93B" stroke-width="3" stroke-linecap="round"/>`;
        }).join('')}
      </g>
      <text x="50" y="54" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#0B2545" font-weight="700">PH</text>
    </svg>`;
  }

  // Drop your logo file at public/assets/img/logo.png (or .svg/.jpg —
  // just update the src below to match). If the file is missing or
  // fails to load, it automatically falls back to the generated seal
  // below, so nothing breaks before you add your own image.
  // Works whether the site sits at the domain root or inside a
  // subfolder (e.g. Laragon's http://localhost/barangay-ph/public/...):
  // admin/ pages are one folder deeper, so they need "../" back to assets/.
  function assetBase() {
    return location.pathname.includes('/admin/') ? '../' : '';
  }

  function sealSvg(size) {
    return `
    <span style="display:inline-block;position:relative;width:${size}px;height:${size}px;">
      <img src="${assetBase()}assets/img/logo.png" alt="Barangay PH logo" width="${size}" height="${size}"
           style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;"
           onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
      <span style="display:none;position:absolute;inset:0;">${generatedSvgSeal(size)}</span>
    </span>`;
  }

  const NAV_LINKS = [
    { href: 'index.html', label: 'Home' },
    { href: 'officials.html', label: 'Officials' },
    { href: 'services.html', label: 'Services' },
    { href: 'announcements.html', label: 'Announcements' },
  ];

  function currentFile() {
    const path = global.location.pathname.split('/').pop();
    return path === '' ? 'index.html' : path;
  }

  async function renderHeader(target) {
    const info = await Api.getBarangayInfo();
    const session = await Api.me();
    const active = currentFile();
    const dashHref = session ? (session.type === 'admin' ? 'admin/index.html' : 'dashboard.html') : null;

    target.innerHTML = `
      <div class="bar wrap">
        <a href="index.html" class="brand">
          <span class="seal">${sealSvg(42)}</span>
          <span class="name-block">
            <span class="barangay">${info.barangay_name || 'Barangay PH'}</span>
            <span class="locality">${info.city_municipality || 'Sta.Mesa'}, ${info.province || 'Metro Manila'}</span>
          </span>
        </a>
        <nav class="main-nav" id="mainNav">
          ${NAV_LINKS.map((l) => `<a href="${l.href}" class="${l.href === active ? 'active' : ''}">${l.label}</a>`).join('')}
          <div class="nav-actions" style="margin-top:4px;">
            ${session
              ? `<a href="${dashHref}" class="btn btn-outline btn-sm btn-pill">My Dashboard</a>`
              : `<a href="login.html" class="btn btn-outline btn-sm btn-pill">Log In</a><a href="register.html" class="btn btn-blue btn-sm btn-pill btn-lift">Register</a>`}
          </div>
        </nav>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>`;

    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    toggle?.addEventListener('click', () => nav.classList.toggle('open'));
  }

  async function renderFooter(target) {
    const info = await Api.getBarangayInfo();
    target.innerHTML = `
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">${sealSvg(38)}<span class="barangay">${info.barangay_name || 'Barangay PH'}</span></div>
            <p style="color:#93a9c4;font-size:0.88rem;max-width:320px;">${info.address || ''}</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="officials.html">Barangay Officials</a></li>
              <li><a href="services.html">Request Services</a></li>
              <li><a href="announcements.html">Announcements &amp; Programs</a></li>
              <li><a href="login.html">Resident Login</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>${info.contact_number || ''}</li>
              <li>${info.email || ''}</li>
              <li>${info.office_hours || ''}</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} ${info.barangay_name || 'Barangay PH'}. All rights reserved.</span>
          <span>BenDon™ Portfolio demo project — not an official government website.</span>
        </div>
      </div>`;
  }

  function renderDemoBanner(target) {
    if (!target) return;
    target.innerHTML = `Portfolio demo — sample data only. <strong>Not an official barangay website.</strong>`;
  }

  async function mountSiteChrome() {
    const header = document.querySelector('[data-component="site-header"]');
    const footer = document.querySelector('[data-component="site-footer"]');
    const banner = document.querySelector('[data-component="demo-banner"]');
    renderDemoBanner(banner);
    if (header) await renderHeader(header);
    if (footer) await renderFooter(footer);
  }

  document.addEventListener('DOMContentLoaded', mountSiteChrome);

  global.Components = { sealSvg, mountSiteChrome };
})(window);

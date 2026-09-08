(async function () {
  const session = await Utils.requireResident('login.html');
  if (!session) return;

  function activePanel() { return (location.hash || '#overview').slice(1); }

  async function showPanel(key) {
    document.querySelectorAll('.dash-panel').forEach((p) => { p.style.display = 'none'; });
    document.getElementById(`panel-${key}`).style.display = 'block';
    document.querySelectorAll('#dashNav a').forEach((a) => a.classList.toggle('active', a.dataset.key === key));
    document.getElementById('dashSidebar').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('open');

    const titles = {
      overview: ['Overview', `Welcome back, ${session.name.split(' ')[0]}.`],
      'new-request': ['Submit a Request', 'Choose a service and fill out the form below.'],
      'my-requests': ['My Requests', 'Track the status of everything you\u2019ve filed.'],
      profile: ['My Profile', 'Your registered resident information.'],
    };
    DashUI.renderTopbar({ title: titles[key][0], subtitle: titles[key][1] });

    if (key === 'overview') await loadOverview();
    if (key === 'new-request') await loadRequestForm();
    if (key === 'my-requests') await loadMyRequests();
    if (key === 'profile') await loadProfile();
  }

  async function loadOverview() {
    const requests = await Api.myRequests();
    document.getElementById('statTotal').textContent = requests.length;
    document.getElementById('statPending').textContent = requests.filter((r) => ['pending', 'processing'].includes(r.status)).length;
    document.getElementById('statDone').textContent = requests.filter((r) => ['ready_for_pickup', 'released', 'approved'].includes(r.status)).length;

    const quick = document.getElementById('quickLinks');
    quick.innerHTML = Object.entries(DemoDB.SERVICE_TYPES).slice(0, 4).map(([key, def]) => `
      <a href="#new-request" class="quick-link" data-nav="new-request" data-preselect="${key}">
        <span class="icon">${SiteRender.SERVICE_ICONS[key]}</span>
        <span class="label">${def.label}</span>
      </a>`).join('');

    const tbody = document.querySelector('#recentTable tbody');
    const recent = requests.slice(0, 5);
    tbody.innerHTML = recent.length ? recent.map(rowHtml).join('') : `<tr><td colspan="4" class="empty-state">No requests yet.</td></tr>`;
  }

  function rowHtml(r) {
    return `<tr>
      <td>${r.reference_no}</td>
      <td>${DemoDB.SERVICE_TYPES[r.service_type]?.label || r.service_type}</td>
      <td><span class="status-pill status-${r.status}">${Utils.statusLabel(r.status)}</span></td>
      <td>${Utils.formatDate(r.requested_at)}</td>
    </tr>`;
  }

  function fieldFor(name, label, type = 'text') {
    return `<div class="field"><label for="f_${name}">${label}</label><input type="${type}" id="f_${name}" name="${name}" required></div>`;
  }

  function renderDynamicFields(serviceKey) {
    const def = DemoDB.SERVICE_TYPES[serviceKey];
    const container = document.getElementById('dynamicFields');
    let html = '';
    if (def.needsPurpose) {
      html += `<div class="field"><label for="f_purpose">Purpose</label><textarea id="f_purpose" name="purpose" required placeholder="e.g. Employment requirement"></textarea></div>`;
    }
    if (def.extra) {
      const labels = {
        business_name: 'Business name', business_address: 'Business address', business_type: 'Type of business',
        incident_date: 'Date of incident', incident_location: 'Location of incident', parties_involved: 'Parties involved', narrative: 'Narrative / details',
        against_whom: 'Complaint against', pet_name: 'Pet name', species: 'Species', breed: 'Breed',
        pet_color: 'Color', pet_sex: 'Sex', vaccination_date: 'Last vaccination date',
      };
      const types = { incident_date: 'date', vaccination_date: 'date', narrative: 'textarea' };
      html += def.extra.map((f) => {
        if (types[f] === 'textarea') return `<div class="field"><label for="f_${f}">${labels[f]}</label><textarea id="f_${f}" name="${f}" required></textarea></div>`;
        if (f === 'species') return `<div class="field"><label for="f_species">Species</label><select id="f_species" name="species" required><option>Dog</option><option>Cat</option><option>Other</option></select></div>`;
        if (f === 'pet_sex') return `<div class="field"><label for="f_pet_sex">Sex</label><select id="f_pet_sex" name="pet_sex" required><option>Male</option><option>Female</option></select></div>`;
        return fieldFor(f, labels[f], types[f] || 'text');
      }).join('');
    }
    if (!def.needsPurpose && !def.extra) {
      html = `<p style="color:var(--color-ink-500);font-size:0.9rem;">No additional details needed — click submit to file this request.</p>`;
    }
    container.innerHTML = html;
  }

  async function loadRequestForm(preselect) {
    const select = document.getElementById('serviceTypeSelect');
    select.innerHTML = Object.entries(DemoDB.SERVICE_TYPES).map(([key, def]) => `<option value="${key}">${def.label}</option>`).join('');
    if (preselect) select.value = preselect;
    renderDynamicFields(select.value);
    select.onchange = () => renderDynamicFields(select.value);
  }

  async function loadMyRequests(filterStatus) {
    const requests = await Api.myRequests();
    const filtered = filterStatus ? requests.filter((r) => r.status === filterStatus) : requests;
    const tbody = document.querySelector('#myRequestsTable tbody');
    tbody.innerHTML = filtered.length ? filtered.map((r) => `
      <tr>
        <td>${r.reference_no}</td>
        <td>${DemoDB.SERVICE_TYPES[r.service_type]?.label || r.service_type}</td>
        <td>${Utils.escapeHtml(r.purpose || '—')}</td>
        <td><span class="status-pill status-${r.status}">${Utils.statusLabel(r.status)}</span></td>
        <td>${Utils.formatDate(r.requested_at)}</td>
        <td>${Utils.formatDate(r.updated_at)}</td>
      </tr>`).join('') : `<tr><td colspan="6" class="empty-state">No requests found.</td></tr>`;
  }

  async function loadProfile() {
    const profile = await Api.myProfile();
    const grid = document.getElementById('profileGrid');
    const rows = [
      ['Full name', `${profile.first_name} ${profile.middle_name || ''} ${profile.last_name} ${profile.suffix || ''}`],
      ['Birthdate', Utils.formatDate(profile.birthdate)],
      ['Gender', profile.gender],
      ['Civil status', profile.civil_status],
      ['Purok', profile.purok],
      ['Address', profile.address],
      ['Mobile number', profile.contact_number],
      ['Email', profile.email],
      ['Account status', profile.is_verified ? 'Verified' : 'Pending verification by secretariat'],
    ];
    grid.innerHTML = rows.map(([dt, dd]) => `<div><div class="dt">${dt}</div><div class="dd">${dd || '—'}</div></div>`).join('');
  }

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      e.preventDefault();
      const key = nav.dataset.nav;
      location.hash = `#${key}`;
      showPanel(key).then(() => {
        if (nav.dataset.preselect) loadRequestForm(nav.dataset.preselect);
      });
    }
  });

  document.getElementById('requestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('requestMsg');
    const serviceKey = document.getElementById('serviceTypeSelect').value;
    const form = e.target;
    const details = {};
    let purpose = '';
    Array.from(form.elements).forEach((el) => {
      if (!el.name) return;
      if (el.name === 'purpose') purpose = el.value;
      else details[el.name] = el.value;
    });
    try {
      const record = await Api.submitRequest({ service_type: serviceKey, purpose, details });
      Utils.showMessage(msg, 'success', `Request submitted! Your reference number is ${record.reference_no}.`);
      form.reset();
      renderDynamicFields(serviceKey);
    } catch (err) {
      Utils.showMessage(msg, 'error', err.message || 'Could not submit request.');
    }
  });

  document.getElementById('filterStatus').addEventListener('change', (e) => loadMyRequests(e.target.value));

  await DashUI.renderSidebar({ role: 'resident', active: activePanel() });
  window.addEventListener('hashchange', () => showPanel(activePanel()));
  await showPanel(activePanel());

  const preselect = Utils.qs('type');
  if (activePanel() === 'new-request' && preselect) loadRequestForm(preselect);
})();

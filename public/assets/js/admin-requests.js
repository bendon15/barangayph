(async function () {
  const session = await Utils.requireAdmin('../login.html');
  if (!session) return;
  await DashUI.renderSidebar({ role: 'admin', active: 'requests.html' });
  DashUI.renderTopbar({ title: 'Service Requests', subtitle: 'Review, process, and update resident requests.' });

  const serviceFilter = document.getElementById('serviceFilter');
  Object.entries(DemoDB.SERVICE_TYPES).forEach(([key, def]) => {
    const opt = document.createElement('option');
    opt.value = key; opt.textContent = def.label;
    serviceFilter.appendChild(opt);
  });

  let allRequests = [];
  let currentId = null;

  async function load() {
    allRequests = await Api.adminListRequests();
    render();
  }

  function render() {
    const search = document.getElementById('searchInput').value.trim().toLowerCase();
    const svc = serviceFilter.value;
    const status = document.getElementById('statusFilter').value;
    const filtered = allRequests.filter((r) => {
      if (svc && r.service_type !== svc) return false;
      if (status && r.status !== status) return false;
      if (search && !(`${r.resident_name} ${r.reference_no}`.toLowerCase().includes(search))) return false;
      return true;
    });
    const tbody = document.getElementById('requestsBody');
    tbody.innerHTML = filtered.length ? filtered.map((r) => `
      <tr>
        <td>${r.reference_no}</td>
        <td>${Utils.escapeHtml(r.resident_name)}</td>
        <td>${DemoDB.SERVICE_TYPES[r.service_type]?.label || r.service_type}</td>
        <td><span class="status-pill status-${r.status}">${Utils.statusLabel(r.status)}</span></td>
        <td>${Utils.formatDate(r.requested_at)}</td>
        <td><button class="btn btn-outline btn-sm" data-view="${r.id}">View</button></td>
      </tr>`).join('') : `<tr><td colspan="6" class="empty-state">No matching requests.</td></tr>`;
  }

  document.getElementById('searchInput').addEventListener('input', render);
  serviceFilter.addEventListener('change', render);
  document.getElementById('statusFilter').addEventListener('change', render);

  document.getElementById('requestsBody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    openModal(btn.dataset.view);
  });

  function detailFieldLabel(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function openModal(id) {
    currentId = id;
    const r = allRequests.find((x) => x.id === id);
    document.getElementById('modalTitle').textContent = `${DemoDB.SERVICE_TYPES[r.service_type]?.label || r.service_type} — ${r.reference_no}`;
    const details = [
      ['Resident', r.resident_name],
      ['Contact', r.resident_contact || '—'],
      ['Filed on', Utils.formatDateTime(r.requested_at)],
      ['Last updated', Utils.formatDateTime(r.updated_at)],
    ];
    if (r.purpose) details.push(['Purpose', r.purpose]);
    Object.entries(r.details || {}).forEach(([k, v]) => details.push([detailFieldLabel(k), v]));
    document.getElementById('modalDetails').innerHTML = details.map(([dt, dd]) => `<div><div class="dt">${dt}</div><div class="dd">${Utils.escapeHtml(dd)}</div></div>`).join('');
    document.getElementById('modalStatus').value = r.status;
    document.getElementById('modalNotes').value = r.admin_notes || '';
    document.getElementById('modalMsg').className = 'form-message';
    document.getElementById('detailModal').classList.add('open');
  }

  document.getElementById('closeModal').addEventListener('click', () => document.getElementById('detailModal').classList.remove('open'));
  document.getElementById('detailModal').addEventListener('click', (e) => { if (e.target.id === 'detailModal') e.currentTarget.classList.remove('open'); });

  document.getElementById('saveStatusBtn').addEventListener('click', async () => {
    const msg = document.getElementById('modalMsg');
    try {
      await Api.updateRequestStatus({ id: currentId, status: document.getElementById('modalStatus').value, admin_notes: document.getElementById('modalNotes').value });
      Utils.showMessage(msg, 'success', 'Request updated.');
      await load();
      setTimeout(() => document.getElementById('detailModal').classList.remove('open'), 700);
    } catch (err) {
      Utils.showMessage(msg, 'error', err.message || 'Update failed.');
    }
  });

  await load();
})();

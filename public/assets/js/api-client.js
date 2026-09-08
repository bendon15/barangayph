/**
 * api-client.js
 * -------------------------------------------------------------
 * Single entry point the frontend uses to talk to "the backend".
 *
 * On a real PHP + MySQL deployment (Laragon, XAMPP, Hostinger, any
 * Apache/Nginx + PHP host), it POSTs/GETs the api/*.php endpoints
 * documented in README.md.
 *
 * On a static host that cannot execute PHP (GitHub Pages, Vercel
 * static deploy), those requests fail and Api transparently falls
 * back to the localStorage-backed demo-data.js so the portfolio
 * demo still works end-to-end. This detection happens once and is
 * cached for the session.
 *
 * Swap-over note: nothing in dashboard.js / admin.js / auth.js
 * needs to change when you move from demo mode to a real server —
 * they only ever call the Api.* functions below.
 * -------------------------------------------------------------
 */
(function (global) {
  const API_BASE = '/api';
  let backendChecked = false;
  let backendAvailable = false;

  async function detectBackend() {
    if (backendChecked) return backendAvailable;
    backendChecked = true;
    try {
      const res = await fetch(`${API_BASE}/health.php`, { method: 'GET' });
      backendAvailable = res.ok;
    } catch (e) {
      backendAvailable = false;
    }
    if (!backendAvailable) {
      console.info('%cBarangay PH Portal — DEMO MODE', 'color:#C98A1F;font-weight:bold;', '\nNo PHP backend detected. Running on the built-in localStorage demo dataset. See /api and /database for the real MySQL-backed implementation.');
    }
    return backendAvailable;
  }

  async function realCall(path, options) {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.ok === false) {
      throw new ApiError(body.message || 'Request failed', body);
    }
    return body.data;
  }

  class ApiError extends Error {
    constructor(message, payload) { super(message); this.payload = payload; }
  }

  // ---- Demo-mode implementations (mirrors what api/*.php would return) ----
  const Demo = {
    async barangayInfo() {
      DemoDB.seed();
      return DemoDB.read(DemoDB.KEYS.info, {});
    },
    async officials() {
      DemoDB.seed();
      return DemoDB.read(DemoDB.KEYS.officials, []);
    },
    async announcements() {
      DemoDB.seed();
      const list = DemoDB.read(DemoDB.KEYS.announcements, []);
      return [...list].sort((a, b) => (b.is_pinned - a.is_pinned) || new Date(b.published_at) - new Date(a.published_at));
    },
    async saveAnnouncement(payload) {
      DemoDB.seed();
      const list = DemoDB.read(DemoDB.KEYS.announcements, []);
      if (payload.id) {
        const idx = list.findIndex((a) => a.id === payload.id);
        if (idx > -1) list[idx] = { ...list[idx], ...payload };
      } else {
        list.unshift({ ...payload, id: DemoDB.uid('ann'), published_at: DemoDB.nowIso() });
      }
      DemoDB.write(DemoDB.KEYS.announcements, list);
      return { success: true };
    },
    async deleteAnnouncement(id) {
      const list = DemoDB.read(DemoDB.KEYS.announcements, []).filter((a) => a.id !== id);
      DemoDB.write(DemoDB.KEYS.announcements, list);
      return { success: true };
    },
    async saveOfficial(payload) {
      DemoDB.seed();
      const list = DemoDB.read(DemoDB.KEYS.officials, []);
      if (payload.id) {
        const idx = list.findIndex((o) => o.id === payload.id);
        if (idx > -1) list[idx] = { ...list[idx], ...payload };
      } else {
        list.push({ ...payload, id: DemoDB.uid('off') });
      }
      DemoDB.write(DemoDB.KEYS.officials, list);
      return { success: true };
    },
    async deleteOfficial(id) {
      const list = DemoDB.read(DemoDB.KEYS.officials, []).filter((o) => o.id !== id);
      DemoDB.write(DemoDB.KEYS.officials, list);
      return { success: true };
    },
    async register(payload) {
      DemoDB.seed();
      const residents = DemoDB.read(DemoDB.KEYS.residents, []);
      if (residents.some((r) => r.email.toLowerCase() === payload.email.toLowerCase())) {
        throw new ApiError('An account with that email already exists.');
      }
      const resident = { ...payload, id: DemoDB.uid('res'), is_verified: false, created_at: DemoDB.nowIso() };
      residents.push(resident);
      DemoDB.write(DemoDB.KEYS.residents, residents);
      return { id: resident.id };
    },
    async login({ email, password }) {
      DemoDB.seed();
      const residents = DemoDB.read(DemoDB.KEYS.residents, []);
      const found = residents.find((r) => r.email.toLowerCase() === email.toLowerCase() && r.password === password);
      if (!found) throw new ApiError('Invalid email or password.');
      DemoDB.setSession({ type: 'resident', id: found.id, name: `${found.first_name} ${found.last_name}` });
      return { id: found.id };
    },
    async adminLogin({ username, password }) {
      DemoDB.seed();
      const admins = DemoDB.read(DemoDB.KEYS.admins, []);
      const found = admins.find((a) => a.username.toLowerCase() === username.toLowerCase() && a.password === password);
      if (!found) throw new ApiError('Invalid username or password.');
      DemoDB.setSession({ type: 'admin', id: found.id, name: found.full_name, role: found.role });
      return { id: found.id };
    },
    async logout() { DemoDB.clearSession(); return { success: true }; },
    async me() { return DemoDB.getSession(); },
    async submitRequest(payload) {
      const session = DemoDB.getSession();
      if (!session || session.type !== 'resident') throw new ApiError('Please log in first.');
      const list = DemoDB.read(DemoDB.KEYS.requests, []);
      const record = {
        id: DemoDB.uid('req'),
        reference_no: DemoDB.refNo(),
        resident_id: session.id,
        service_type: payload.service_type,
        purpose: payload.purpose || '',
        details: payload.details || {},
        status: 'pending',
        admin_notes: '',
        requested_at: DemoDB.nowIso(),
        updated_at: DemoDB.nowIso(),
      };
      list.unshift(record);
      DemoDB.write(DemoDB.KEYS.requests, list);
      return record;
    },
    async myRequests() {
      const session = DemoDB.getSession();
      if (!session || session.type !== 'resident') throw new ApiError('Please log in first.');
      return DemoDB.read(DemoDB.KEYS.requests, []).filter((r) => r.resident_id === session.id)
        .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at));
    },
    async adminListRequests() {
      const requests = DemoDB.read(DemoDB.KEYS.requests, []);
      const residents = DemoDB.read(DemoDB.KEYS.residents, []);
      return requests.map((r) => {
        const res = residents.find((x) => x.id === r.resident_id);
        return { ...r, resident_name: res ? `${res.first_name} ${res.last_name}` : 'Unknown', resident_contact: res ? res.contact_number : '' };
      }).sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at));
    },
    async updateRequestStatus({ id, status, admin_notes }) {
      const list = DemoDB.read(DemoDB.KEYS.requests, []);
      const idx = list.findIndex((r) => r.id === id);
      if (idx === -1) throw new ApiError('Request not found.');
      list[idx].status = status;
      list[idx].admin_notes = admin_notes ?? list[idx].admin_notes;
      list[idx].updated_at = DemoDB.nowIso();
      DemoDB.write(DemoDB.KEYS.requests, list);
      return list[idx];
    },
    async adminListResidents() {
      DemoDB.seed();
      return DemoDB.read(DemoDB.KEYS.residents, []).map(({ password, ...rest }) => rest);
    },
    async myProfile() {
      const session = DemoDB.getSession();
      if (!session || session.type !== 'resident') throw new ApiError('Please log in first.');
      const found = DemoDB.read(DemoDB.KEYS.residents, []).find((r) => r.id === session.id);
      if (!found) throw new ApiError('Profile not found.');
      const { password, ...rest } = found;
      return rest;
    },
  };

  // ---- Public API surface ----
  const Api = {
    ApiError,

    async getBarangayInfo() {
      return (await detectBackend()) ? realCall('/barangay-info.php') : Demo.barangayInfo();
    },
    async listOfficials() {
      return (await detectBackend()) ? realCall('/officials/list.php') : Demo.officials();
    },
    async saveOfficial(payload) {
      return (await detectBackend()) ? realCall('/officials/save.php', { method: 'POST', body: JSON.stringify(payload) }) : Demo.saveOfficial(payload);
    },
    async deleteOfficial(id) {
      return (await detectBackend()) ? realCall('/officials/delete.php', { method: 'POST', body: JSON.stringify({ id }) }) : Demo.deleteOfficial(id);
    },
    async listAnnouncements() {
      return (await detectBackend()) ? realCall('/announcements/list.php') : Demo.announcements();
    },
    async saveAnnouncement(payload) {
      return (await detectBackend()) ? realCall('/announcements/save.php', { method: 'POST', body: JSON.stringify(payload) }) : Demo.saveAnnouncement(payload);
    },
    async deleteAnnouncement(id) {
      return (await detectBackend()) ? realCall('/announcements/delete.php', { method: 'POST', body: JSON.stringify({ id }) }) : Demo.deleteAnnouncement(id);
    },
    async register(payload) {
      return (await detectBackend()) ? realCall('/auth/register.php', { method: 'POST', body: JSON.stringify(payload) }) : Demo.register(payload);
    },
    async login(payload) {
      return (await detectBackend()) ? realCall('/auth/login.php', { method: 'POST', body: JSON.stringify(payload) }) : Demo.login(payload);
    },
    async adminLogin(payload) {
      return (await detectBackend()) ? realCall('/auth/admin_login.php', { method: 'POST', body: JSON.stringify(payload) }) : Demo.adminLogin(payload);
    },
    async logout() {
      return (await detectBackend()) ? realCall('/auth/logout.php', { method: 'POST' }) : Demo.logout();
    },
    async me() {
      return (await detectBackend()) ? realCall('/auth/me.php') : Demo.me();
    },
    async submitRequest(payload) {
      return (await detectBackend()) ? realCall('/requests/submit.php', { method: 'POST', body: JSON.stringify(payload) }) : Demo.submitRequest(payload);
    },
    async myRequests() {
      return (await detectBackend()) ? realCall('/requests/mine.php') : Demo.myRequests();
    },
    async adminListRequests(filters) {
      const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
      return (await detectBackend()) ? realCall('/requests/list.php' + qs) : Demo.adminListRequests(filters);
    },
    async updateRequestStatus(payload) {
      return (await detectBackend()) ? realCall('/requests/update_status.php', { method: 'POST', body: JSON.stringify(payload) }) : Demo.updateRequestStatus(payload);
    },
    async adminListResidents() {
      return (await detectBackend()) ? realCall('/residents/list.php') : Demo.adminListResidents();
    },
    async myProfile() {
      return (await detectBackend()) ? realCall('/residents/me.php') : Demo.myProfile();
    },
  };

  global.Api = Api;
})(window);

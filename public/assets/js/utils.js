(function (global) {
  function formatDate(iso, opts) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', opts || { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function formatDateTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function qs(name) { return new URLSearchParams(location.search).get(name); }
  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function showMessage(el, type, text) {
    if (!el) return;
    el.textContent = text;
    el.className = `form-message show ${type}`;
  }
  function statusLabel(status) {
    return {
      pending: 'Pending', processing: 'Processing', approved: 'Approved',
      ready_for_pickup: 'Ready for Pickup', released: 'Released', rejected: 'Rejected',
    }[status] || status;
  }
  async function requireResident(redirectTo) {
    const session = await Api.me();
    if (!session || session.type !== 'resident') {
      location.href = redirectTo || 'login.html';
      return null;
    }
    return session;
  }
  async function requireAdmin(redirectTo) {
    const session = await Api.me();
    if (!session || session.type !== 'admin') {
      location.href = redirectTo || 'login.html';
      return null;
    }
    return session;
  }
  global.Utils = { formatDate, formatDateTime, qs, escapeHtml, showMessage, statusLabel, requireResident, requireAdmin };
})(window);

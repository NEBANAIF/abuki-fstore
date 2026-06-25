import { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Edit2, Trash2, Search, X, Save,
  RefreshCw, Shield, CheckCircle, XCircle, Eye, EyeOff,
  Lock, User, ChevronLeft, ChevronRight, AlertCircle, Mail, Calendar,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

// ─── Shared design system CSS ─────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  .abk-dash {
    --cream:#F0F7E2;--cream-deep:#E4F0CF;--ink:#0F1F04;--ink-mid:#3A5220;
    --ink-light:#6A8A4A;--ink-faint:#A8C080;--border:#D0E4B0;--border-light:#E2EFC8;
    --card:#FFFFFF;--card-hover:#F3FAE6;
    --green:#1D9E75;--green-bg:#E1F5EE;
    --blue:#185FA5;--blue-bg:#E6F1FB;
    --purple:#534AB7;--purple-bg:#EEEDFE;
    --amber:#854F0B;--amber-bg:#FAEEDA;
    --red-bg:#FCEBEB;--red-border:#F7C1C1;--red-text:#791F1F;
    --yellow-bg:#FAEEDA;--yellow-border:#FAC775;--yellow-text:#633806;
    --texture-col:#C8DCA8;
  }
  .abk-dash.abk-dark {
    --cream:#0D1117;--cream-deep:#161B22;--ink:#E6EDF3;--ink-mid:#B8C9DB;
    --ink-light:#8BA4BE;--ink-faint:#5A7A96;--border:#21303F;--border-light:#1A2535;
    --card:#13192A;--card-hover:#1C2540;
    --green:#3DD68C;--green-bg:#0D2B1F;
    --blue:#58A6FF;--blue-bg:#0D1F35;
    --purple:#A78BFA;--purple-bg:#1A1535;
    --amber:#F0A742;--amber-bg:#2A1C06;
    --red-bg:#1F0D0D;--red-border:#3D1515;--red-text:#FF8080;
    --yellow-bg:#1F1608;--yellow-border:#3D2A0A;--yellow-text:#F5C842;
    --texture-col:#1A2535;
  }
  .abk-dash,.abk-dash *{font-family:'DM Sans',sans-serif;box-sizing:border-box;}
  .abk-serif{font-family:'Playfair Display',Georgia,serif !important;}
  .abk-texture::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image:linear-gradient(var(--texture-col) 1px,transparent 1px),
      linear-gradient(90deg,var(--texture-col) 1px,transparent 1px);
    background-size:48px 48px;opacity:.25;}
  .abk-dash.abk-dark.abk-texture::before{opacity:.18;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
  @keyframes barGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .abk-anim-fade-up{opacity:0;animation:fadeUp .45s ease both;}
  .abk-anim-scale-in{opacity:0;animation:scaleIn .45s ease both;}
  .abk-anim-fade-in{opacity:0;animation:fadeIn .35s ease both;}
  .abk-prog-fill{transform-origin:left;animation:barGrow .85s ease both;}
  .abk-row-hover{transition:background .15s;}
  .abk-row-hover:hover{background:var(--card-hover) !important;}
  .abk-dark ::-webkit-scrollbar{width:6px;}
  .abk-dark ::-webkit-scrollbar-track{background:#0D1117;}
  .abk-dark ::-webkit-scrollbar-thumb{background:#21303F;border-radius:3px;}

  /* ── Responsive: tablet ── */
  @media (max-width:1023px) {
    .abk-usr-kpi-5  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    /* 5th card (odd one out in a 2-col layout) spans both columns and
       centers itself, instead of sitting alone on the left. */
    .abk-usr-kpi-5 > *:nth-child(5) { grid-column: 1 / -1 !important; max-width: 50% !important; margin: 0 auto !important; }
    .abk-usr-filter { flex-wrap: wrap !important; }
    .abk-usr-filter > * { min-width: 140px !important; }
    .abk-usr-modal-grid { grid-template-columns: 1fr !important; }
  }

  /* ── Responsive: phone ── */
  @media (max-width:767px) {
    .abk-usr-pad    { padding: 1rem 0.75rem 3rem !important; }
    .abk-usr-kpi-5  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-usr-kpi-5 > *:nth-child(5) { grid-column: 1 / -1 !important; max-width: 60% !important; margin: 0 auto !important; }
    .abk-usr-filter { flex-direction: column !important; }
    .abk-usr-filter > * { width: 100% !important; }
    /* ── User Access table: horizontal scroll — all columns visible, no hiding ── */
    .abk-usr-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
    .abk-usr-table-wrap table { min-width: 600px !important; table-layout: auto !important; }
    .abk-usr-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    .abk-usr-modal-grid { grid-template-columns: 1fr !important; }
  }

  @media (max-width:480px) {
    .abk-usr-pad { padding: 0.75rem 0.5rem 2rem !important; }
    .abk-usr-kpi-5 { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
  }

  @media (max-width:380px) {
    /* Below this width even 2 columns get cramped — drop to 1 column.
       No centering needed since every card already spans the full row. */
    .abk-usr-kpi-5 { grid-template-columns: 1fr !important; }
    .abk-usr-kpi-5 > *:nth-child(5) { max-width: 100% !important; }
  }
  /* iOS: prevent zoom on input focus */
  @media (max-width:767px) {
    input, select, textarea { font-size: 16px !important; }
  }

`;

// Three roles exist on the backend: ADMIN, WORKER, and SECURITY_ADMIN
// (see SecurityConfig.java). SECURITY_ADMIN is intentionally narrow —
// only loginHistory — so it doesn't quietly become a second admin.
const ROLE_DEFAULTS = {
  ADMIN:          ['dashboard','products','sales','loans','stock'],
  WORKER:         ['dashboard','products','sales','loans'],
  SECURITY_ADMIN: ['loginHistory'],
};

const EMPTY_FORM = {
  name: '', email: '', role: 'WORKER',
  password: '', status: 'ACTIVE',
  permissions: ROLE_DEFAULTS['WORKER'],
};

// Per-role color tokens using CSS vars
const ROLE_COLORS = {
  ADMIN:          { stripe: 'var(--red-text)', badge: { bg: 'var(--red-bg)',  border: 'var(--red-border)', text: 'var(--red-text)' }, avatar: '#ef4444' },
  WORKER:         { stripe: 'var(--blue)',     badge: { bg: 'var(--blue-bg)', border: 'var(--border)',     text: 'var(--blue)'     }, avatar: 'var(--blue)' },
  SECURITY_ADMIN: { stripe: 'var(--purple)',   badge: { bg: 'var(--purple-bg)', border: 'var(--border)',   text: 'var(--purple)'   }, avatar: 'var(--purple)' },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, Icon, stripeColor, iconBg, iconColor, progPct, delay }) {
  return (
    <div className="abk-anim-fade-up" style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '1.1rem 1.1rem .9rem',
      position: 'relative', overflow: 'hidden',
      transition: 'background .3s, border-color .3s', animationDelay: delay,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: stripeColor }} />
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 9, marginTop: 4,
      }}>
        <Icon size={15} color={iconColor} />
      </div>
      <div className="abk-serif" style={{ fontSize: 24, fontWeight: 700, color: iconColor, letterSpacing: -0.3, marginBottom: 4, lineHeight: 1.15 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 400 }}>{label}</div>
      <div style={{ height: 2, background: 'var(--cream-deep)', borderRadius: 2, overflow: 'hidden', marginTop: 9 }}>
        <div className="abk-prog-fill" style={{ height: '100%', borderRadius: 2, background: stripeColor, width: `${Math.max(2, progPct)}%`, animationDelay: `calc(${delay} + .5s)` }} />
      </div>
    </div>
  );
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle = {
  background: 'var(--card)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '8px 12px',
  fontSize: 13, color: 'var(--ink)', outline: 'none',
  fontFamily: "'DM Sans', sans-serif", width: '100%',
  transition: 'border-color .2s',
};

export default function UserAccess({ dark: darkProp }) {
  const { t } = useTranslation();

  useEffect(() => {
    const id = 'abk-useraccess-css';
    let tag = document.getElementById(id);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = id;
      document.head.appendChild(tag);
    }
    tag.innerHTML = GLOBAL_CSS;
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);

  const dark = darkProp ?? (localStorage.getItem('abk-dark') === 'true');

  const ROLES = [
    { value: 'ADMIN',  label: t('users.admins') || 'Admin',  desc: 'Full business access — products, sales, loans, stock, users' },
    { value: 'WORKER', label: 'Worker',                       desc: 'Products, sales & stock-in — no user or history access' },
    { value: 'SECURITY_ADMIN', label: 'Security Admin',       desc: 'Login history & device management only — no business access' },
  ];

  const PERMISSIONS = [
    { key: 'dashboard', label: t('nav.dashboard') },
    { key: 'products',  label: t('nav.products')  },
    { key: 'sales',     label: t('nav.sales')     },
    { key: 'loans',     label: t('nav.loans') || 'Loans' },
    { key: 'stock',     label: t('nav.stock')     },
    { key: 'loginHistory', label: t('nav.loginHistory') || 'Login History' },
  ];

  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [roleFilter, setRoleFilter]       = useState('ALL');
  const [page, setPage]                   = useState(1);
  const rowsPerPage                       = 12;
  const [showModal, setShowModal]         = useState(false);
  const [editUser, setEditUser]           = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [successMsg, setSuccessMsg]       = useState('');
  const [errorMsg, setErrorMsg]           = useState('');
  const [activeTab, setActiveTab]         = useState('users');

  const fetchUsers = useCallback(async () => {
    setLoading(true); setErrorMsg('');
    try { const data = await getUsers(); setUsers(data); }
    catch (err) { setErrorMsg('Failed to load users: ' + err.message); }
    finally     { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function showSuccess(msg) { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3500); }
  function showError(msg)   { setErrorMsg(msg);   setTimeout(() => setErrorMsg(''), 5000);   }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (!search || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q))
      && (roleFilter === 'ALL' || u.role === roleFilter);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const activeCount  = users.filter(u => u.status === 'ACTIVE').length;
  const adminCount  = users.filter(u => u.role === 'ADMIN').length;
  const workerCount = users.filter(u => u.role === 'WORKER').length;
  const securityAdminCount = users.filter(u => u.role === 'SECURITY_ADMIN').length;

  function openCreate() { setEditUser(null); setForm(EMPTY_FORM); setShowPassword(false); setShowModal(true); }
  function openEdit(u) {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, password: '', status: u.status, permissions: u.permissions || ROLE_DEFAULTS[u.role] || [] });
    setShowPassword(false); setShowModal(true);
  }
  function handleRoleChange(role) { setForm(f => ({ ...f, role, permissions: ROLE_DEFAULTS[role] || [] })); }
  function togglePermission(key) {
    setForm(f => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter(p => p !== key) : [...f.permissions, key] }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) { showError('Name and email are required.'); return; }
    if (!editUser && !form.password)              { showError('Password is required for new users.'); return; }
    if (form.password && form.password.length < 6){ showError('Password must be at least 6 characters.'); return; }
    setSaving(true); setErrorMsg('');
    const payload = { name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role, status: form.status };
    if (form.password) payload.password = form.password;
    try {
      if (editUser) {
        const updated = await updateUser(editUser.id, payload);
        setUsers(prev => prev.map(u => u.id === editUser.id ? updated : u));
        showSuccess(t('users.userUpdated'));
      } else {
        const created = await createUser(payload);
        setUsers(prev => [created, ...prev]);
        showSuccess(t('users.userAdded'));
      }
      setShowModal(false);
    } catch (err) { showError(err.message || 'Failed to save user.'); }
    finally       { setSaving(false); }
  }

  async function handleDelete(id) {
    setDeleting(true); setErrorMsg('');
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteConfirm(null); showSuccess(t('users.userDeleted'));
    } catch (err) { showError(err.message || 'Failed to delete user.'); setDeleteConfirm(null); }
    finally       { setDeleting(false); }
  }

  async function toggleStatus(u) {
    const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await updateUser(u.id, { ...u, status: newStatus, password: undefined });
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
      showSuccess(t('users.statusUpdated'));
    } catch (err) { showError(err.message || 'Failed to update status.'); }
  }

  // ── Overlay backdrop style ────────────────────────────────────────────────
  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 50,
    background: dark ? 'rgba(0,0,0,.65)' : 'rgba(0,0,0,.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  };

  return (
    <div className={`abk-dash abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ background: 'var(--cream)', minHeight: '100vh', position: 'relative', transition: 'background .3s' }}>

      {/* ── Toasts ─────────────────────────────────────────────────────────── */}
      {successMsg && (
        <div className="abk-anim-fade-in" style={{ position: 'fixed', top: 20, right: 20, zIndex: 60, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--green)', color: '#fff', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="abk-anim-fade-in" style={{ position: 'fixed', top: 20, right: 20, zIndex: 60, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--red-text)', color: '#fff', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,.2)', maxWidth: 340 }}>
          <AlertCircle size={15} /> {errorMsg}
        </div>
      )}

      <div className="abk-usr-pad" style={{ position: 'relative', zIndex: 1, padding: '0 1.5rem 2.5rem' }}>

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="abk-anim-fade-up" style={{ padding: '1.75rem 0 1.25rem' }}>
          <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 18, height: 1.5, background: 'var(--purple)', borderRadius: 1 }} />
            {t('users.title') || 'User Access'}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="abk-serif" style={{ fontSize: 28, fontWeight: 500, color: 'var(--ink)', letterSpacing: -0.5, lineHeight: 1.15 }}>
                {t('users.title') || 'User Access'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-light)', fontWeight: 300, marginTop: 4 }}>
                {t('users.subtitle') || 'Manage team members, roles and permissions'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={fetchUsers} style={{ padding: 8, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--ink-light)', display: 'flex', alignItems: 'center', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-deep)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}>
                <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
              </button>
              <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, boxShadow: '0 2px 8px rgba(0,0,0,.15)', transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <Plus size={15} /> {t('users.addUser')}
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <div className="abk-usr-kpi-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 10, marginBottom: '1.1rem' }}>
          <KpiCard label={t('users.totalUsers')}  value={users.length}  Icon={Users}       stripeColor="var(--blue)"   iconBg="var(--blue-bg)"   iconColor="var(--blue)"   progPct={70} delay=".06s" />
          <KpiCard label={t('users.activeUsers')} value={activeCount}   Icon={CheckCircle} stripeColor="var(--green)"  iconBg="var(--green-bg)"  iconColor="var(--green)"  progPct={Math.round(activeCount / Math.max(users.length, 1) * 100)} delay=".13s" />
          <KpiCard label={t('users.admins')}      value={adminCount}    Icon={Shield}      stripeColor="var(--red-text)" iconBg="var(--red-bg)" iconColor="var(--red-text)" progPct={Math.round(adminCount / Math.max(users.length, 1) * 100)} delay=".20s" />
          <KpiCard label="Workers"                value={workerCount}   Icon={User}        stripeColor="var(--purple)" iconBg="var(--purple-bg)" iconColor="var(--purple)" progPct={Math.round(workerCount / Math.max(users.length, 1) * 100)} delay=".27s" />
          <KpiCard label="Security Admins"        value={securityAdminCount} Icon={Lock}   stripeColor="var(--blue)" iconBg="var(--blue-bg)" iconColor="var(--blue)" progPct={Math.round(securityAdminCount / Math.max(users.length, 1) * 100)} delay=".34s" />
        </div>

        {/* ── Tab Toggle ────────────────────────────────────────────────── */}
        <div className="abk-anim-fade-up" style={{ display: 'flex', gap: 4, marginBottom: 14, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, width: 'fit-content', animationDelay: '.32s' }}>
          {[
            { key: 'users', label: t('users.userList'),         Icon: Users  },
            { key: 'roles', label: t('users.rolesPermissions'), Icon: Shield },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
              transition: 'background .18s, color .18s',
              background: activeTab === tab.key ? 'var(--purple)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--ink-light)',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <tab.Icon size={13} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB: Users
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <>
            {/* Filters */}
            <div className="abk-anim-fade-up abk-usr-filter" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, animationDelay: '.36s' }}>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder={t('users.searchPlaceholder')}
                  style={{ ...inputStyle, paddingLeft: 32 }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
                <option value="ALL">{t('users.allRoles')}</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {(search || roleFilter !== 'ALL') && (
                <button onClick={() => { setSearch(''); setRoleFilter('ALL'); setPage(1); }} style={{ ...inputStyle, width: 'auto', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: 'var(--red-text)', borderColor: 'var(--red-border)', background: 'var(--red-bg)', paddingLeft: 12, paddingRight: 12 }}>
                  <X size={13} /> {t('ui.clear')}
                </button>
              )}
            </div>

            <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 300, marginBottom: 12 }}>
              {filtered.length} {t('users.userCount')}
            </div>

            {/* User Card Grid */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                <p style={{ color: 'var(--ink-faint)', fontSize: 13 }}>{t('ui.loading')}</p>
              </div>
            ) : paginated.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                <Users size={36} style={{ color: 'var(--ink-faint)', marginBottom: 10 }} />
                <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontWeight: 300 }}>
                  {search || roleFilter !== 'ALL' ? t('users.noUsersFilter') : t('users.noUsers')}
                </p>
              </div>
            ) : (
              <div className="abk-usr-modal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10, marginBottom: 14 }}>
                {paginated.map((u, i) => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.WORKER;
                  const role = ROLES.find(r => r.value === u.role) || ROLES[1];
                  return (
                    <div key={u.id} className="abk-anim-scale-in" style={{
                      background: 'var(--card)', border: '1px solid var(--border)',
                      borderRadius: 14, overflow: 'hidden',
                      transition: 'background .3s, border-color .3s, box-shadow .2s',
                      animationDelay: `${.38 + i * 0.04}s`,
                    }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.1)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      {/* Role stripe */}
                      <div style={{ height: 3, background: rc.stripe }} />

                      <div style={{ padding: '14px 14px 12px' }}>
                        {/* Top row: status + actions */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <button onClick={() => toggleStatus(u)} style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                            border: `1px solid ${u.status === 'ACTIVE' ? 'var(--border)' : 'var(--border)'}`,
                            background: u.status === 'ACTIVE' ? 'var(--green-bg)' : 'var(--cream-deep)',
                            color: u.status === 'ACTIVE' ? 'var(--green)' : 'var(--ink-faint)',
                            cursor: 'pointer', transition: 'opacity .15s',
                          }}>
                            {u.status === 'ACTIVE' ? `● ${t('users.active')}` : `○ ${t('users.inactive')}`}
                          </button>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {[
                              { Icon: Edit2, cb: () => openEdit(u), bg: 'var(--blue-bg)', color: 'var(--blue)', border: 'var(--border)' },
                              { Icon: Trash2, cb: () => setDeleteConfirm(u), bg: 'var(--red-bg)', color: 'var(--red-text)', border: 'var(--red-border)' },
                            ].map(({ Icon, cb, bg, color, border }, idx) => (
                              <button key={idx} onClick={cb} style={{ padding: '5px 6px', borderRadius: 8, cursor: 'pointer', background: bg, border: `1px solid ${border}`, color, display: 'flex', alignItems: 'center', transition: 'opacity .15s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '.7'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                <Icon size={12} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Avatar + Name + Role */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                          <div style={{
                            width: 46, height: 46, borderRadius: '50%',
                            background: rc.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                          }}>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{(u.name || '?')[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{u.name}</div>
                            <div style={{
                              display: 'inline-block', marginTop: 4,
                              fontSize: 10.5, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                              background: rc.badge.bg, border: `1px solid ${rc.badge.border}`,
                              color: rc.badge.text,
                            }}>
                              {role.label}
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                          <Mail size={11} style={{ color: 'var(--ink-faint)', flexShrink: 0 }} />
                          <span style={{ fontSize: 11.5, color: 'var(--ink-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 300 }}>{u.email}</span>
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Calendar size={10} style={{ color: 'var(--ink-faint)' }} />
                            <span style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 300 }}>{u.createdAt ? u.createdAt.slice(0, 10) : '—'}</span>
                          </div>
                          <span style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 300 }}>
                            {t('users.lastLogin')}: {u.lastLogin ? u.lastLogin.slice(0, 10) : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 300 }}>{users.length} {t('users.totalUsers')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 300 }}>
                  {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} / {filtered.length}
                </span>
                {[
                  { Icon: ChevronLeft,  disabled: page === 1,         action: () => setPage(p => Math.max(1, p - 1)) },
                  { Icon: ChevronRight, disabled: page === totalPages, action: () => setPage(p => Math.min(totalPages, p + 1)) },
                ].map(({ Icon, disabled, action }, i) => (
                  <button key={i} onClick={action} disabled={disabled} style={{ padding: 5, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--ink-light)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.3 : 1, display: 'flex', alignItems: 'center' }}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: Roles & Permissions
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'roles' && (
          <div className="abk-usr-modal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
            {ROLES.map((role, i) => {
              const rc = ROLE_COLORS[role.value] || ROLE_COLORS.WORKER;
              return (
                <div key={role.value} className="abk-anim-scale-in" style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 14, overflow: 'hidden',
                  transition: 'background .3s, border-color .3s',
                  animationDelay: `${.34 + i * 0.07}s`,
                }}>
                  <div style={{ height: 3, background: rc.stripe }} />
                  <div style={{ padding: '1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 11px', borderRadius: 20, marginBottom: 6, background: rc.badge.bg, border: `1px solid ${rc.badge.border}`, color: rc.badge.text }}>
                          {role.label}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 300 }}>{role.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="abk-serif" style={{ fontSize: 22, fontWeight: 700, color: rc.stripe, lineHeight: 1 }}>
                          {users.filter(u => u.role === role.value).length}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 300, marginTop: 2 }}>{t('users.userCount')}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>
                      {t('users.defaultPermissions')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {PERMISSIONS.map(perm => {
                        const has = (ROLE_DEFAULTS[role.value] || []).includes(perm.key);
                        return (
                          <div key={perm.key} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 10px', borderRadius: 8,
                            background: has ? 'var(--green-bg)' : 'var(--cream-deep)',
                            border: `1px solid ${has ? 'var(--border)' : 'var(--border-light)'}`,
                          }}>
                            <span style={{ fontSize: 12, fontWeight: has ? 500 : 300, color: has ? 'var(--ink)' : 'var(--ink-faint)' }}>{perm.label}</span>
                            {has
                              ? <CheckCircle size={13} style={{ color: 'var(--green)', flexShrink: 0 }} />
                              : <XCircle size={13} style={{ color: 'var(--ink-faint)', flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '1.1rem', paddingTop: 14, borderTop: dark ? '1px solid rgba(88,166,255,.08)' : '1px solid rgba(168,192,128,.3)', fontSize: 11, color: dark ? 'rgba(91,143,179,.45)' : 'rgba(168,192,128,.6)', fontWeight: 300, letterSpacing: '0.02em' }}>
          User access changes take effect immediately. Admins retain full access regardless of permission settings.
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: Add / Edit User
      ══════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div style={overlayStyle}>
          <div className="abk-anim-scale-in" style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 16, width: '100%', maxWidth: 520,
            boxShadow: '0 20px 60px rgba(0,0,0,.25)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div className="abk-serif" style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>
                  {editUser ? t('users.editUser') : t('users.newUser')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2, fontWeight: 300 }}>{t('users.fillDetails')}</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'var(--cream-deep)', color: 'var(--ink-light)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Name */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 5 }}>{t('users.fullName')} *</div>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('users.namePlaceholder')} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* Email */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 5 }}>{t('users.email')} *</div>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={t('users.emailPlaceholder')} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* Password */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 5 }}>
                  {editUser ? t('users.passwordHint') : `${t('users.password')} *`}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={editUser ? t('users.passwordPlaceholder') : '••••••••'}
                    style={{ ...inputStyle, paddingLeft: 32, paddingRight: 36 }}
                    onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  <button onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', display: 'flex' }}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 4, fontWeight: 300 }}>Minimum 6 characters</div>
              </div>

              {/* Role */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>{t('users.role')} *</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
                  {ROLES.map(r => {
                    const rc = ROLE_COLORS[r.value] || ROLE_COLORS.WORKER;
                    const selected = form.role === r.value;
                    return (
                      <button key={r.value} onClick={() => handleRoleChange(r.value)} style={{
                        padding: '10px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                        border: `2px solid ${selected ? rc.stripe : 'var(--border)'}`,
                        background: selected ? rc.badge.bg : 'var(--cream-deep)',
                        transition: 'border-color .2s, background .2s',
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: selected ? rc.stripe : 'var(--ink)', marginBottom: 2 }}>{r.label}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 300 }}>{r.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>{t('users.status')}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['ACTIVE', 'INACTIVE'].map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))} style={{
                      flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                      fontSize: 12.5, fontWeight: 600,
                      border: `2px solid ${form.status === s ? (s === 'ACTIVE' ? 'var(--green)' : 'var(--ink-faint)') : 'var(--border)'}`,
                      background: form.status === s ? (s === 'ACTIVE' ? 'var(--green)' : 'var(--ink-faint)') : 'var(--cream-deep)',
                      color: form.status === s ? '#fff' : 'var(--ink-light)',
                      transition: 'all .2s',
                    }}>
                      {s === 'ACTIVE' ? `● ${t('users.active')}` : `○ ${t('users.inactive')}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 8 }}>
                  {t('users.permissions')} <span style={{ fontWeight: 300, textTransform: 'none', letterSpacing: 0, fontSize: 10.5, color: 'var(--ink-faint)' }}>({t('users.customizeAccess')})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 5 }}>
                  {PERMISSIONS.map(perm => {
                    const has = form.permissions.includes(perm.key);
                    return (
                      <button key={perm.key} onClick={() => togglePermission(perm.key)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '7px 11px', borderRadius: 9, cursor: 'pointer',
                        border: `1px solid ${has ? 'var(--border)' : 'var(--border-light)'}`,
                        background: has ? 'var(--blue-bg)' : 'var(--cream-deep)',
                        transition: 'background .15s, border-color .15s',
                        fontSize: 12, fontWeight: has ? 500 : 300,
                        color: has ? 'var(--blue)' : 'var(--ink-faint)',
                      }}>
                        <span>{perm.label}</span>
                        {has ? <CheckCircle size={12} style={{ color: 'var(--blue)' }} /> : <XCircle size={12} style={{ color: 'var(--ink-faint)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--border-light)' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--cream-deep)', border: '1px solid var(--border)', color: 'var(--ink-mid)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                {t('ui.cancel')}
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--blue)', border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500, opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
                {saving
                  ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> {t('ui.saving')}</>
                  : <><Save size={13} /> {editUser ? t('users.saveChanges') : t('users.addUser')}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          Delete Confirm
      ══════════════════════════════════════════════════════════════════ */}
      {deleteConfirm && (
        <div style={overlayStyle}>
          <div className="abk-anim-scale-in" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 360, padding: '1.75rem', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--red-bg)', border: '2px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={22} style={{ color: 'var(--red-text)' }} />
            </div>
            <div className="abk-serif" style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>{t('users.deleteUser')}</div>
            <p style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 4, fontWeight: 500 }}>{deleteConfirm.name}</p>
            <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginBottom: 20, fontWeight: 300 }}>{t('products.cannotUndo')}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--cream-deep)', border: '1px solid var(--border)', color: 'var(--ink-mid)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                {t('ui.cancel')}
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)} disabled={deleting} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--red-text)', border: 'none', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {deleting ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> {t('ui.loading')}</> : t('ui.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
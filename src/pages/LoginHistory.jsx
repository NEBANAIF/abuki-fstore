/**
 * ─────────────────────────────────────────────────────────────────────────
 *  LoginHistory.jsx — ADMIN-only device registry
 *
 *  Shows every browser/device that has ever logged in, identified by a
 *  client-generated fingerprint (see utils/deviceFingerprint.js). Admins
 *  can give each device a friendly name and Allow/Disallow it.
 *
 *  A disallowed device is rejected at the LOGIN step on the backend (see
 *  AuthController) — credentials must still be correct, but a blocked
 *  device gets a 403 instead of a token. An already-issued token for that
 *  device keeps working until it naturally expires; blocking only stops
 *  future logins from that browser, it isn't an instant kill-switch.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';
import {
  Shield, RefreshCw, XCircle, Search, ChevronLeft, ChevronRight,
  Monitor, Smartphone, Tablet, Globe, Pencil, Check, X, Lock, Unlock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDevices, updateDevice } from '../services/api';

/* ─────────────────────────────────────────────────────────────────────────────
   Design tokens — same palette as Sales / Loans / Stock History
   ───────────────────────────────────────────────────────────────────────── */
const LH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .abk-lh {
    --cream:         #F0F7E2;
    --cream-deep:    #E4F0CF;
    --ink:           #0F1F04;
    --ink-mid:       #3A5220;
    --ink-light:     #6A8A4A;
    --ink-faint:     #A8C080;
    --border:        #D0E4B0;
    --border-light:  #E2EFC8;
    --card:          #FFFFFF;
    --card-hover:    #F3FAE6;
    --green:         #1D9E75;
    --green-bg:      #E1F5EE;
    --blue:          #185FA5;
    --blue-bg:       #E6F1FB;
    --amber:         #854F0B;
    --amber-bg:      #FAEEDA;
    --red-bg:        #FCEBEB;
    --red-border:    #F7C1C1;
    --red-text:      #791F1F;
    --texture-col:   #C8DCA8;
  }

  .abk-lh.abk-dark {
    --cream:         #0D1117;
    --cream-deep:    #161B22;
    --ink:           #E6EDF3;
    --ink-mid:       #B8C9DB;
    --ink-light:     #8BA4BE;
    --ink-faint:     #5A7A96;
    --border:        #21303F;
    --border-light:  #1A2535;
    --card:          #13192A;
    --card-hover:    #1C2540;
    --green:         #3DD68C;
    --green-bg:      #0D2B1F;
    --blue:          #58A6FF;
    --blue-bg:       #0D1F35;
    --amber:         #F0A742;
    --amber-bg:      #2A1C06;
    --red-bg:        #1F0D0D;
    --red-border:    #3D1515;
    --red-text:      #FF8080;
    --texture-col:   #1A2535;
  }

  .abk-lh, .abk-lh * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
  .abk-lh .abk-serif { font-family:'Playfair Display',Georgia,serif !important; }

  .abk-lh.abk-texture::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(var(--texture-col) 1px, transparent 1px),
      linear-gradient(90deg, var(--texture-col) 1px, transparent 1px);
    background-size:48px 48px; opacity:.25;
  }
  .abk-lh.abk-dark.abk-texture::before { opacity:.18; }

  @keyframes abkLhFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes abkLhScaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  @keyframes abkLhSpin    { to{transform:rotate(360deg)} }

  .abk-lh .abk-anim-fade-up  { opacity:0; animation:abkLhFadeUp  .45s ease both; }
  .abk-lh .abk-anim-scale-in { opacity:0; animation:abkLhScaleIn .45s ease both; }

  .abk-lh .abk-row-hover { transition:background .15s; }
  .abk-lh .abk-row-hover:hover { background:var(--card-hover) !important; }

  .abk-lh .abk-input {
    border:1px solid var(--border); border-radius:9px;
    padding:7px 10px; font-size:13px; color:var(--ink);
    background:var(--card); outline:none;
    transition:border-color .15s, box-shadow .15s;
    font-family:'DM Sans',sans-serif;
  }
  .abk-lh .abk-input:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(24,95,165,.12); }
  .abk-lh .abk-input::placeholder { color:var(--ink-faint); }
  .abk-lh.abk-dark .abk-input { background:var(--cream-deep); }

  .abk-lh ::-webkit-scrollbar       { width:5px; }
  .abk-lh ::-webkit-scrollbar-track { background:transparent; }
  .abk-lh ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

  @media (max-width:767px) {
    .abk-lh-pad { padding: 1rem 0.75rem 3rem !important; }
    .abk-lh-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
    .abk-lh-table-wrap table { min-width: 820px !important; }
    input, select, textarea { font-size: 16px !important; }
  }
`;

/* ── Small User-Agent parser — just enough for a friendly default label ──── */
function parseDevice(ua) {
  if (!ua) return { label: '—', device: '', Icon: Globe };
  const s = ua.toLowerCase();

  let device = 'Desktop', Icon = Monitor;
  if (/ipad|tablet/.test(s)) { device = 'Tablet'; Icon = Tablet; }
  else if (/mobile|iphone|android/.test(s)) { device = 'Mobile'; Icon = Smartphone; }

  let browser = 'Browser';
  if (s.includes('edg/')) browser = 'Edge';
  else if (s.includes('chrome/') && !s.includes('edg/')) browser = 'Chrome';
  else if (s.includes('firefox/')) browser = 'Firefox';
  else if (s.includes('safari/') && !s.includes('chrome/')) browser = 'Safari';
  else if (s.includes('opr/') || s.includes('opera')) browser = 'Opera';

  let os = '';
  if (s.includes('windows')) os = 'Windows';
  else if (s.includes('android')) os = 'Android';
  else if (s.includes('iphone') || s.includes('ipad')) os = 'iOS';
  else if (s.includes('mac os')) os = 'macOS';
  else if (s.includes('linux')) os = 'Linux';

  return { label: `${browser}${os ? ' on ' + os : ''}`, device, Icon };
}

function fmtDateTime(iso) {
  if (!iso) return { date: '—', time: '' };
  try {
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return { date: iso, time: '' };
    return {
      date: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch { return { date: iso, time: '' }; }
}

/* ════════════════════════════════════════════════════════════════════════════
   Login History / Devices page
   ════════════════════════════════════════════════════════════════════════════ */
export default function LoginHistory({ dark }) {
  const { t } = useTranslation();

  useEffect(() => {
    const id = 'abk-loginhistory-css';
    let tag = document.getElementById(id);
    if (!tag) { tag = document.createElement('style'); tag.id = id; document.head.appendChild(tag); }
    tag.innerHTML = LH_CSS;
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const rowsPerPage = 20;

  // Inline rename state
  const [editingId, setEditingId] = useState(null);
  const [editName,  setEditName]  = useState('');
  const [savingId,  setSavingId]  = useState(null);

  // Block/unblock confirmation modal
  const [confirmTarget, setConfirmTarget] = useState(null); // device being toggled

  useEffect(() => { loadDevices(); }, []);

  async function loadDevices() {
    try {
      setLoading(true); setError(null);
      const all = await getDevices();
      setDevices(all);
    } catch {
      setError(t('loginHistory.errorLoad'));
    } finally {
      setLoading(false);
    }
  }

  function startEdit(device) {
    setEditingId(device.id);
    setEditName(device.deviceName || '');
  }

  async function saveEdit(device) {
    const trimmed = editName.trim();
    setSavingId(device.id);
    try {
      const updated = await updateDevice(device.id, { deviceName: trimmed || null });
      setDevices(prev => prev.map(d => d.id === device.id ? updated : d));
      setEditingId(null);
    } catch {
      alert(t('loginHistory.failedToRename'));
    } finally {
      setSavingId(null);
    }
  }

  async function toggleBlock(device) {
    const nextBlocked = !device.blocked;
    setSavingId(device.id);
    try {
      const updated = await updateDevice(device.id, { blocked: nextBlocked });
      setDevices(prev => prev.map(d => d.id === device.id ? updated : d));
      setConfirmTarget(null);
    } catch {
      alert(t('loginHistory.failedToUpdateStatus'));
    } finally {
      setSavingId(null);
    }
  }

  const filtered = devices.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.userEmail?.toLowerCase().includes(q)
      || d.deviceName?.toLowerCase().includes(q)
      || d.lastIpAddress?.toLowerCase().includes(q)
      || d.lastUserAgent?.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  /* ── Loading ── */
  if (loading) return (
    <div className={`abk-lh abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--cream)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 34, height: 34, border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'abkLhSpin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontWeight: 300 }}>{t('loginHistory.loading')}</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className={`abk-lh abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--cream)' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--red-border)', borderRadius: 18, padding: 32, textAlign: 'center', maxWidth: 380 }}>
        <XCircle size={38} style={{ color: 'var(--red-text)', marginBottom: 12 }} />
        <div className="abk-serif" style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>{t('loginHistory.connectionError')}</div>
        <p style={{ color: 'var(--ink-faint)', fontSize: 12, marginBottom: 16 }}>{error}</p>
        <button onClick={loadDevices} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
          <RefreshCw size={13} /> {t('loginHistory.retry')}
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className={`abk-lh abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ background: 'var(--cream)', minHeight: '100vh', position: 'relative', transition: 'background .3s' }}>

      <div className="abk-lh-pad" style={{ position: 'relative', zIndex: 1, padding: '1.5rem 1.5rem 3rem' }}>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="abk-anim-fade-up" style={{ padding: '0.5rem 0 1.4rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 18, height: 1.5, background: 'var(--blue)', borderRadius: 1 }} />
              {t('loginHistory.label')}
            </div>
            <div className="abk-serif" style={{ fontSize: 28, fontWeight: 500, color: 'var(--ink)', letterSpacing: -0.5, lineHeight: 1.1 }}>
              {t('loginHistory.title')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4, fontWeight: 300 }}>
              {t('loginHistory.subtitle')}
            </div>
          </div>

          <button onClick={loadDevices} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', marginTop: 4,
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 11,
            color: 'var(--ink-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif',
            transition: 'background .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-deep)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
          >
            <RefreshCw size={12} /> {t('loginHistory.refresh')}
          </button>
        </div>

        {/* ── Search ───────────────────────────────────────────────────── */}
        <div className="abk-anim-fade-up" style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('loginHistory.searchPlaceholder')} className="abk-input" style={{ width: '100%', paddingLeft: 34 }} />
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="abk-anim-scale-in" style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,.06)',
        }}>
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid var(--border-light)',
            background: 'var(--cream-deep)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div className="abk-serif" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{t('loginHistory.recentLogins')}</div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 300 }}>{filtered.length} {t('loginHistory.records')}</span>
          </div>

          <div className="abk-lh-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 'max-content', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cream-deep)', borderBottom: '1px solid var(--border)' }}>
                  {[t('loginHistory.user'), t('loginHistory.deviceName'), t('loginHistory.device'), t('loginHistory.ipAddress'), t('loginHistory.lastSeen'), t('loginHistory.status'), t('loginHistory.actions')].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 0' }}>
                      <Shield size={34} style={{ color: 'var(--border)', margin: '0 auto 10px', display: 'block' }} />
                      <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontWeight: 300 }}>
                        {search ? t('loginHistory.noResultsFilter') : t('loginHistory.noLoginsYet')}
                      </p>
                    </td>
                  </tr>
                ) : paginated.map(d => {
                  const { label, device: deviceType, Icon } = parseDevice(d.lastUserAgent);
                  const dt = fmtDateTime(d.lastSeenAt);
                  const isEditing = editingId === d.id;
                  const isSaving  = savingId === d.id;
                  return (
                    <tr key={d.id} className="abk-row-hover" style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--card)' }}>
                      {/* User */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{d.userEmail || '—'}</div>
                      </td>

                      {/* Device Name — editable */}
                      <td style={{ padding: '12px 14px', minWidth: 170 }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              autoFocus
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(d); if (e.key === 'Escape') setEditingId(null); }}
                              placeholder={t('loginHistory.deviceNamePlaceholder')}
                              className="abk-input"
                              style={{ width: 140 }}
                            />
                            <button onClick={() => saveEdit(d)} disabled={isSaving} title={t('loginHistory.save')} style={{
                              width: 26, height: 26, borderRadius: 7, border: 'none', background: 'var(--green)',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? .6 : 1, flexShrink: 0,
                            }}><Check size={13} /></button>
                            <button onClick={() => setEditingId(null)} title={t('loginHistory.cancel')} style={{
                              width: 26, height: 26, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--cream-deep)',
                              color: 'var(--ink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                            }}><X size={13} /></button>
                          </div>
                        ) : (
                          <div className="abk-row-hover" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => startEdit(d)}>
                            <span style={{ fontSize: 13, fontWeight: d.deviceName ? 600 : 400, color: d.deviceName ? 'var(--ink)' : 'var(--ink-faint)', fontStyle: d.deviceName ? 'normal' : 'italic' }}>
                              {d.deviceName || t('loginHistory.unnamedDevice')}
                            </span>
                            <Pencil size={11} style={{ color: 'var(--ink-faint)', flexShrink: 0 }} />
                          </div>
                        )}
                      </td>

                      {/* Browser/OS — auto-detected, read-only */}
                      <td style={{ padding: '12px 14px' }} title={d.lastUserAgent || ''}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, background: 'var(--blue-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Icon size={14} style={{ color: 'var(--blue)' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 300 }}>{deviceType}</div>
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--ink-mid)' }}>
                          {d.lastIpAddress || '—'}
                        </span>
                      </td>

                      {/* Last Seen */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>{dt.date}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 300 }}>{dt.time}</div>
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                          background: d.blocked ? 'var(--red-bg)' : 'var(--green-bg)',
                          color: d.blocked ? 'var(--red-text)' : 'var(--green)',
                          border: `1px solid ${d.blocked ? 'var(--red-border)' : 'var(--border)'}`,
                        }}>
                          {d.blocked ? <Lock size={10} /> : <Unlock size={10} />}
                          {d.blocked ? t('loginHistory.blocked') : t('loginHistory.allowed')}
                        </span>
                      </td>

                      {/* Allow / Disallow action */}
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          onClick={() => setConfirmTarget(d)}
                          disabled={isSaving}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '7px 13px', borderRadius: 9, fontSize: 12, fontWeight: 500,
                            border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                            opacity: isSaving ? .6 : 1,
                            background: d.blocked ? 'var(--green)' : 'var(--red-text)',
                            color: '#fff',
                          }}
                        >
                          {d.blocked
                            ? <><Unlock size={12} /> {t('loginHistory.allow')}</>
                            : <><Lock size={12} /> {t('loginHistory.disallow')}</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderTop: '1px solid var(--border-light)',
              background: 'var(--cream-deep)',
            }}>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 300 }}>
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} / {filtered.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[
                  { Icon: ChevronLeft,  action: () => setPage(p => Math.max(1, p - 1)),          disabled: page === 1 },
                  { Icon: ChevronRight, action: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages },
                ].map(({ Icon, action, disabled }, i) => (
                  <button key={i} onClick={action} disabled={disabled} style={{
                    width: 26, height: 26, borderRadius: 7, border: '1px solid var(--border)',
                    background: 'var(--card)', color: 'var(--ink-light)', cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? .35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon size={13} /></button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Block / Unblock confirmation modal ──────────────────────────── */}
      {confirmTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={() => setConfirmTarget(null)}>
          <div className="abk-anim-scale-in" onClick={e => e.stopPropagation()} style={{
            background: 'var(--card)', borderRadius: 16, padding: '1.6rem',
            maxWidth: 380, width: '100%', border: '1px solid var(--border)',
            boxShadow: '0 12px 40px rgba(0,0,0,.18)',
          }}>
            {confirmTarget.blocked ? (
              <Unlock size={32} style={{ color: 'var(--green)', marginBottom: 12 }} />
            ) : (
              <Lock size={32} style={{ color: 'var(--red-text)', marginBottom: 12 }} />
            )}
            <div className="abk-serif" style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>
              {confirmTarget.blocked ? t('loginHistory.allowDeviceTitle') : t('loginHistory.disallowDeviceTitle')}
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 4, fontWeight: 300 }}>
              {confirmTarget.deviceName || t('loginHistory.unnamedDevice')} — <strong style={{ color: 'var(--ink)' }}>{confirmTarget.userEmail}</strong>
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginBottom: 20, fontWeight: 300 }}>
              {confirmTarget.blocked ? t('loginHistory.allowDeviceDesc') : t('loginHistory.disallowDeviceDesc')}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmTarget(null)} style={{
                flex: 1, padding: '10px 0', background: 'var(--cream-deep)', color: 'var(--ink-mid)',
                border: '1px solid var(--border)', borderRadius: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>{t('loginHistory.cancel')}</button>
              <button onClick={() => toggleBlock(confirmTarget)} style={{
                flex: 1, padding: '10px 0', color: '#fff', border: 'none', borderRadius: 11,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: confirmTarget.blocked ? 'var(--green)' : 'var(--red-text)',
              }}>
                {confirmTarget.blocked ? t('loginHistory.allow') : t('loginHistory.disallow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

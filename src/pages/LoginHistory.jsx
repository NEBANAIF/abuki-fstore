/**
 * ─────────────────────────────────────────────────────────────────────────
 *  LoginHistory.jsx — ADMIN-only device/IP audit trail
 *
 *  Shows every successful login: who, when, from which IP, and which
 *  browser/device (parsed from the raw User-Agent string for readability).
 *  Read-only — there is nothing to create/edit/delete here, it's an
 *  audit log, not editable data.
 *
 *  Lets an admin spot an unfamiliar device/IP connecting to the app.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';
import {
  Shield, RefreshCw, XCircle, Search, ChevronLeft, ChevronRight,
  Monitor, Smartphone, Tablet, Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLoginHistory } from '../services/api';

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
    width:100%; border:1px solid var(--border); border-radius:10px;
    padding:9px 12px; font-size:13px; color:var(--ink);
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
    .abk-lh-table-wrap table { min-width: 760px !important; }
    input, select, textarea { font-size: 16px !important; }
  }
`;

/* ── Very small, readable User-Agent parser ─────────────────────────────────
   We only need a rough device/browser label for display — not a full UA
   parsing library. The raw userAgent string is still shown on hover/tooltip
   so nothing is hidden, this is just a friendlier summary on top of it. ── */
function parseDevice(ua) {
  if (!ua) return { label: '—', Icon: Globe };
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

  return { label: `${browser}${os ? ' · ' + os : ''}`, device, Icon };
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  try {
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return iso;
    return {
      date: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch { return { date: iso, time: '' }; }
}

/* ════════════════════════════════════════════════════════════════════════════
   Login History page
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

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const rowsPerPage = 20;

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      setLoading(true); setError(null);
      const all = await getLoginHistory();
      setRecords(all);
    } catch {
      setError(t('loginHistory.errorLoad'));
    } finally {
      setLoading(false);
    }
  }

  const filtered = records.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.userEmail?.toLowerCase().includes(q)
      || r.ipAddress?.toLowerCase().includes(q)
      || r.userAgent?.toLowerCase().includes(q);
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
        <button onClick={loadHistory} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
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

          <button onClick={loadHistory} style={{
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
              placeholder={t('loginHistory.searchPlaceholder')} className="abk-input" style={{ paddingLeft: 34 }} />
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
                  {[t('loginHistory.user'), t('loginHistory.device'), t('loginHistory.ipAddress'), t('loginHistory.dateTime')].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3.5rem 0' }}>
                      <Shield size={34} style={{ color: 'var(--border)', margin: '0 auto 10px', display: 'block' }} />
                      <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontWeight: 300 }}>
                        {search ? t('loginHistory.noResultsFilter') : t('loginHistory.noLoginsYet')}
                      </p>
                    </td>
                  </tr>
                ) : paginated.map(r => {
                  const { label, device, Icon } = parseDevice(r.userAgent);
                  const dt = fmtDateTime(r.loggedInAt);
                  return (
                    <tr key={r.id} className="abk-row-hover" style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--card)' }}>
                      {/* User */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.userEmail || '—'}</div>
                      </td>

                      {/* Device — icon + browser/OS, with full UA on hover */}
                      <td style={{ padding: '12px 14px' }} title={r.userAgent || ''}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, background: 'var(--blue-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Icon size={14} style={{ color: 'var(--blue)' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 300 }}>{device}</div>
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--ink-mid)' }}>
                          {r.ipAddress || '—'}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>{dt.date}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 300 }}>{dt.time}</div>
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
    </div>
  );
}

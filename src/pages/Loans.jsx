import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Landmark, Search, RefreshCw, X, XCircle, CheckCircle,
  Trash2, Pencil, ChevronLeft, ChevronRight, Calendar,
} from 'lucide-react';
import { getSales, updateSalePayment, deleteSale } from '../services/api';
import { localYMD, normalizeSaleDate } from '../utils/dateUtils';

/* ─────────────────────────────────────────────────────────────────────────────
   Design tokens — same palette as Sales / Products
   ───────────────────────────────────────────────────────────────────────── */
const LOANS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .abk-loans {
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
    --yellow-border: #FAC775;
    --red-bg:        #FCEBEB;
    --red-border:    #F7C1C1;
    --red-text:      #791F1F;
    --texture-col:   #C8DCA8;
  }

  .abk-loans.abk-dark {
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
    --yellow-border: #3D2A0A;
    --red-bg:        #1F0D0D;
    --red-border:    #3D1515;
    --red-text:      #FF8080;
    --texture-col:   #1A2535;
  }

  .abk-loans, .abk-loans * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
  .abk-loans .abk-serif     { font-family:'Playfair Display',Georgia,serif !important; }

  .abk-loans.abk-texture::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(var(--texture-col) 1px, transparent 1px),
      linear-gradient(90deg, var(--texture-col) 1px, transparent 1px);
    background-size:48px 48px; opacity:.25;
  }
  .abk-loans.abk-dark.abk-texture::before { opacity:.18; }

  @keyframes abkLFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes abkLFadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes abkLScaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  @keyframes abkLBarGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes abkLToast   { 0%{opacity:0;transform:translateY(-12px)} 10%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }

  .abk-loans .abk-anim-fade-up  { opacity:0; animation:abkLFadeUp  .45s ease both; }
  .abk-loans .abk-anim-fade-in  { opacity:0; animation:abkLFadeIn  .45s ease both; }
  .abk-loans .abk-anim-scale-in { opacity:0; animation:abkLScaleIn .45s ease both; }
  .abk-loans .abk-toast         { animation:abkLToast 3.2s ease forwards; }

  .abk-loans .abk-row-hover { transition:background .15s; }
  .abk-loans .abk-row-hover:hover { background:var(--card-hover) !important; }

  .abk-loans .abk-prog-fill { transform-origin:left; animation:abkLBarGrow .85s ease both; }

  .abk-loans .abk-input {
    width:100%; border:1px solid var(--border); border-radius:10px;
    padding:9px 12px; font-size:13px; color:var(--ink);
    background:var(--card); outline:none;
    transition:border-color .15s, box-shadow .15s;
    font-family:'DM Sans',sans-serif;
  }
  .abk-loans .abk-input:focus {
    border-color:var(--amber);
    box-shadow:0 0 0 3px rgba(133,79,11,.12);
  }
  .abk-loans .abk-input::placeholder { color:var(--ink-faint); }
  .abk-loans.abk-dark .abk-input    { background:var(--cream-deep); }

  .abk-loans .abk-label {
    display:block; font-size:10.5px; font-weight:600;
    text-transform:uppercase; letter-spacing:.09em;
    color:var(--ink-light); margin-bottom:6px;
  }

  .abk-loans ::-webkit-scrollbar       { width:5px; }
  .abk-loans ::-webkit-scrollbar-track { background:transparent; }
  .abk-loans ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

  @media (max-width:1023px) {
    .abk-loans-kpi { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    /* 3rd card (odd one out) spans both columns and centers itself,
       instead of sitting alone on the left with empty space beside it. */
    .abk-loans-kpi > *:nth-child(3) { grid-column: 1 / -1 !important; max-width: 50% !important; margin: 0 auto !important; }
  }
  @media (max-width:767px) {
    .abk-loans-pad  { padding: 1rem 0.75rem 3rem !important; }
    .abk-loans-kpi  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-loans-kpi > *:nth-child(3) { grid-column: 1 / -1 !important; max-width: 60% !important; margin: 0 auto !important; }
    .abk-loans-filter { flex-direction: column !important; }
    .abk-loans-filter > * { width: 100% !important; }
    .abk-loans-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
    .abk-loans-table-wrap table { min-width: 760px !important; }
  }
  @media (max-width:767px) {
    input, select, textarea { font-size: 16px !important; }
  }
`;

/* ── helpers ──────────────────────────────────────────────────────────────── */
function fmt(n) {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── shared atoms ─────────────────────────────────────────────────────────── */
function Modal({ onClose, children, maxWidth = 460 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16, backdropFilter: 'blur(4px)',
    }}>
      <div className="abk-anim-scale-in" style={{
        background: 'var(--card)', borderRadius: 18, width: '100%', maxWidth,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.2), 0 2px 8px rgba(0,0,0,.1)',
        border: '1px solid var(--border)',
      }}>{children}</div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border-light)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{ marginTop: 4 }}>
        <div className="abk-serif" style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2, fontWeight: 300 }}>{subtitle}</div>}
      </div>
      <button onClick={onClose} style={{
        width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
        background: 'var(--cream-deep)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-light)',
      }}><X size={14} /></button>
    </div>
  );
}

function BtnPrimary({ onClick, disabled, children, color = 'var(--amber)' }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, padding: '10px 0', background: color, color: '#fff',
      border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      transition: 'filter .15s', fontFamily: 'DM Sans,sans-serif',
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
    >{children}</button>
  );
}

function BtnSecondary({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '10px 0', background: 'var(--cream-deep)', color: 'var(--ink-mid)',
      border: '1px solid var(--border)', borderRadius: 11, fontSize: 13, fontWeight: 500,
      cursor: 'pointer', transition: 'background .15s', fontFamily: 'DM Sans,sans-serif',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--cream-deep)'}
    >{children}</button>
  );
}

function KpiCard({ label, value, sub, Icon, stripeColor, iconBg, iconColor, progPct, delay }) {
  return (
    <div className="abk-anim-fade-up" style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '1.1rem 1.1rem .9rem',
      position: 'relative', overflow: 'hidden',
      transition: 'background .3s, border-color .3s', animationDelay: delay,
      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: stripeColor }} />
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 9, marginTop: 4,
      }}>
        <Icon size={15} color={iconColor} />
      </div>
      <div className="abk-serif" style={{
        fontSize: 24, fontWeight: 700, color: iconColor, letterSpacing: -0.3,
        marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis', lineHeight: 1.15,
      }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 400 }}>{label}</div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 300, marginTop: 1 }}>{sub}</div>
      <div style={{ height: 2, background: 'var(--cream-deep)', borderRadius: 2, overflow: 'hidden', marginTop: 9 }}>
        <div className="abk-prog-fill" style={{
          height: '100%', borderRadius: 2, background: stripeColor,
          width: `${Math.max(2, progPct)}%`,
          animationDelay: `calc(${delay} + .5s)`,
        }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Loans page
   ════════════════════════════════════════════════════════════════════════════ */
export default function Loans({ dark, user }) {
  const { t } = useTranslation();
  const isAdmin  = user?.role?.toUpperCase() === 'ADMIN';
  const isWorker = user?.role?.toUpperCase() === 'WORKER';

  useEffect(() => {
    const id = 'abk-loans-css';
    let tag = document.getElementById(id);
    if (!tag) { tag = document.createElement('style'); tag.id = id; document.head.appendChild(tag); }
    tag.innerHTML = LOANS_CSS;
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);

  const [loans,         setLoans]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState('');
  const [dateFilter,    setDateFilter]    = useState('');
  const [page,          setPage]          = useState(1);
  const [rowsPerPage,   setRowsPerPage]   = useState(10);
  const [successMsg,    setSuccessMsg]    = useState('');
  const [editModal,     setEditModal]     = useState(null); // sale object being edited
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving,        setSaving]        = useState(false);

  // Edit form state — tracks additional payment amount
  const [additionalPay, setAdditionalPay] = useState('');

  useEffect(() => { if (user !== undefined) loadLoans(); }, [user]);

  async function loadLoans() {
    try {
      setLoading(true); setError(null);
      // Both ADMIN and WORKER see the full loan/debt list now
      const all = await getSales();
      // Only show PARTIAL_LOAN sales (remainingLoan > 0)
      setLoans(all.filter(s => s.paymentStatus === 'PARTIAL_LOAN' && (s.remainingLoan ?? 0) > 0));
    } catch {
      setError(t('loans.errorLoad'));
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg) { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3200); }

  /* ── KPI totals ─────────────────────────────────────────────────────────── */
  const totalOutstanding = loans.reduce((a, s) => a + (s.remainingLoan ?? 0), 0);
  const totalCollected   = loans.reduce((a, s) => a + (s.paidAmount   ?? 0), 0);
  const totalSaleValue   = loans.reduce((a, s) => a + (s.total        ?? 0), 0);

  /* ── Filter ─────────────────────────────────────────────────────────────── */
  const filtered = loans.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || s.customerName?.toLowerCase().includes(q)
      || s.product?.name?.toLowerCase().includes(q);
    const matchDate = !dateFilter || normalizeSaleDate(s.saleDate) === dateFilter;
    return matchSearch && matchDate;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  /* ── Edit modal helpers ──────────────────────────────────────────────────── */
  function openEdit(sale) {
    setEditModal(sale);
    setAdditionalPay('');
  }

  // Compute what the new paidAmount will be after adding additionalPay
  const editTotal       = editModal?.total ?? 0;
  const editCurrentPaid = editModal?.paidAmount ?? 0;
  const editAddAmt      = parseFloat(additionalPay) || 0;
  const editNewPaid     = editCurrentPaid + editAddAmt;
  const editNewRemain   = Math.max(0, editTotal - editNewPaid);
  const editInvalid     = editAddAmt < 0 || editNewPaid > editTotal;

  async function handleSavePayment() {
    if (!editModal) return;
    if (editAddAmt <= 0) { alert(t('loans.enterPaymentGreaterThanZero')); return; }
    if (editInvalid) { alert(`${t('loans.paymentCannotExceed')} $${fmt(editModal.remainingLoan)}.`); return; }
    setSaving(true);
    try {
      await updateSalePayment(editModal.id, editNewPaid);
      setEditModal(null);
      showSuccess(editNewRemain === 0
        ? `✓ ${t('loans.loanFullySettledFor')} ${editModal.customerName}`
        : `✓ ${t('loans.paymentRecordedOutstanding')} ($${fmt(editNewRemain)})`);
      await loadLoans();
    } catch (e) { alert(e.message || t('loans.failedToSavePayment')); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await deleteSale(id);
      setDeleteConfirm(null);
      showSuccess(t('loans.loanRecordDeleted'));
      await loadLoans();
    } catch { alert(t('loans.failedToDelete')); }
  }

  /* ── Loading ── */
  if (loading) return (
    <div className={`abk-loans abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--cream)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 34, height: 34, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontWeight: 300 }}>{t('loans.loading')}</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className={`abk-loans abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--cream)' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--red-border)', borderRadius: 18, padding: 32, textAlign: 'center', maxWidth: 380 }}>
        <XCircle size={38} style={{ color: 'var(--red-text)', marginBottom: 12 }} />
        <div className="abk-serif" style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>{t('loans.connectionError')}</div>
        <p style={{ color: 'var(--ink-faint)', fontSize: 12, marginBottom: 16 }}>{error}</p>
        <button onClick={loadLoans} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'var(--amber)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
          <RefreshCw size={13} /> {t('loans.retry')}
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className={`abk-loans abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ background: 'var(--cream)', minHeight: '100vh', position: 'relative', transition: 'background .3s' }}>

      {/* ── Toast ── */}
      {successMsg && (
        <div className="abk-toast" style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--amber)', color: '#fff',
          padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(133,79,11,.35)',
        }}>
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}

      <div className="abk-loans-pad" style={{ position: 'relative', zIndex: 1, padding: '1.5rem 1.5rem 3rem' }}>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="abk-anim-fade-up" style={{ padding: '0.5rem 0 1.4rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 18, height: 1.5, background: 'var(--amber)', borderRadius: 1 }} />
              {t('loans.label')}
            </div>
            <div className="abk-serif" style={{ fontSize: 28, fontWeight: 500, color: 'var(--ink)', letterSpacing: -0.5, lineHeight: 1.1 }}>
              {t('loans.title')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4, fontWeight: 300 }}>
              {t('loans.subtitle')}
            </div>
            {/* WORKER mode notice — shown below page title */}
            {isWorker && (
              <div style={{
                marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '6px 12px', borderRadius: 10,
                background: dark ? 'rgba(251,191,36,.08)' : '#FFFBEB',
                border: dark ? '1px solid rgba(251,191,36,.2)' : '1px solid #FDE68A',
                fontSize: 11, color: dark ? '#FBBf24' : '#92400E',
              }}>
                <span style={{ fontWeight: 600 }}>👷 {t('loans.workerMode')}</span>
                <span style={{ fontWeight: 300 }}>· {t('loans.workerModeNote')}</span>
              </div>
            )}
          </div>

          <button onClick={loadLoans} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', marginTop: 4,
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 11,
            color: 'var(--ink-mid)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif',
            transition: 'background .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-deep)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
          >
            <RefreshCw size={12} /> {t('loans.refresh')}
          </button>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────────────── */}
        <div className="abk-loans-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: '1.1rem' }}>
          <KpiCard
            label={t('loans.totalOutstanding')} value={`$${fmt(totalOutstanding)}`}
            sub={`${loans.length} ${t(loans.length !== 1 ? 'loans.openLoans' : 'loans.openLoan')}`}
            Icon={Landmark} stripeColor="var(--amber)" iconBg="var(--amber-bg)" iconColor="var(--amber)"
            progPct={totalSaleValue > 0 ? Math.round((totalOutstanding / totalSaleValue) * 100) : 2} delay=".06s"
          />
          <KpiCard
            label={t('loans.collectedSoFar')} value={`$${fmt(totalCollected)}`}
            sub={t('loans.partialPaymentsReceived')}
            Icon={CheckCircle} stripeColor="var(--green)" iconBg="var(--green-bg)" iconColor="var(--green)"
            progPct={totalSaleValue > 0 ? Math.round((totalCollected / totalSaleValue) * 100) : 2} delay=".13s"
          />
          <KpiCard
            label={t('loans.totalLoanValue')} value={`$${fmt(totalSaleValue)}`}
            sub={t('loans.combinedSaleTotals')}
            Icon={Landmark} stripeColor="var(--blue)" iconBg="var(--blue-bg)" iconColor="var(--blue)"
            progPct={82} delay=".20s"
          />
        </div>

        {/* ── Search & Date Filter ──────────────────────────────────────── */}
        <div className="abk-anim-fade-in abk-loans-filter" style={{ display: 'flex', gap: 8, marginBottom: '1rem', animationDelay: '.28s' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('loans.searchPlaceholder')} className="abk-input" style={{ paddingLeft: 34 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Calendar size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
            <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }}
              className="abk-input" style={{ paddingLeft: 32, minWidth: 160, cursor: 'pointer', colorScheme: dark ? 'dark' : 'light' }} />
          </div>
          {(search || dateFilter) && (
            <button onClick={() => { setSearch(''); setDateFilter(''); setPage(1); }} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 13px',
              background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              borderRadius: 10, color: 'var(--red-text)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif',
            }}>
              <X size={12} /> {t('loans.clear')}
            </button>
          )}
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="abk-anim-scale-in" style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,.06)', animationDelay: '.32s',
        }}>
          {/* Sub-header */}
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid var(--border-light)',
            background: 'var(--cream-deep)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRadius: '16px 16px 0 0',
          }}>
            <div className="abk-serif" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{t('loans.openLoansTableTitle')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {(search || dateFilter) && (
                <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>
                  {t('loans.outstandingLabel')}: ${fmt(filtered.reduce((a, s) => a + (s.remainingLoan ?? 0), 0))}
                </span>
              )}
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 300 }}>{filtered.length} {t('loans.records')}</span>
            </div>
          </div>

          <div className="abk-loans-table-wrap" style={{ overflowX: 'auto', borderRadius: '0 0 16px 16px', display: 'block' }}>
            <table style={{ width: '100%', minWidth: 'max-content', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--cream-deep)', borderBottom: '1px solid var(--border)' }}>
                  {[t('loans.customer'), t('loans.saleDetails'), t('loans.total'), t('loans.paid'), t('loans.remaining'), t('loans.date'), t('loans.actions')].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem 0' }}>
                      <Landmark size={34} style={{ color: 'var(--border)', margin: '0 auto 10px', display: 'block' }} />
                      <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontWeight: 300 }}>
                        {search || dateFilter ? t('loans.noLoansFilter') : t('loans.noLoansYet')}
                      </p>
                    </td>
                  </tr>
                ) : paginated.map(s => {
                  const pct = s.total > 0 ? Math.round(((s.paidAmount ?? 0) / s.total) * 100) : 0;
                  return (
                    <tr key={s.id} className="abk-row-hover" style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--card)' }}>

                      {/* Customer */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{s.customerName || '—'}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 2, fontWeight: 300 }}>ID #{s.id}</div>
                      </td>

                      {/* Sale Details */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{s.product?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2, fontWeight: 300 }}>
                          {s.quantity} × ${fmt(s.price)}
                          {s.product?.sku && <span style={{ fontFamily: 'monospace', marginLeft: 6 }}>{t('loans.skuLabel')}: {s.product.sku}</span>}
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '12px 14px' }}>
                        <span className="abk-serif" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-mid)' }}>
                          ${fmt(s.total)}
                        </span>
                      </td>

                      {/* Paid — with progress bar */}
                      <td style={{ padding: '12px 14px', minWidth: 120 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>${fmt(s.paidAmount)}</div>
                        <div style={{ height: 4, background: 'var(--cream-deep)', borderRadius: 3, overflow: 'hidden', marginTop: 5, width: 100 }}>
                          <div style={{
                            height: '100%', borderRadius: 3,
                            background: pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red-text)',
                            width: `${pct}%`, transition: 'width .4s ease',
                          }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 2 }}>{pct}% {t('loans.percentPaid')}</div>
                      </td>

                      {/* Remaining */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{
                          display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
                          background: 'var(--amber-bg)', border: '1px solid var(--yellow-border)',
                          borderRadius: 9, padding: '5px 10px',
                        }}>
                          <span className="abk-serif" style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)' }}>
                            ${fmt(s.remainingLoan)}
                          </span>
                          <span style={{ fontSize: 9.5, color: 'var(--amber)', fontWeight: 400, marginTop: 1 }}>{t('loans.outstanding')}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--ink-light)', fontWeight: 300, whiteSpace: 'nowrap' }}>
                        {fmtDate(normalizeSaleDate(s.saleDate))}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 7 }}>
                          {/* Record payment — permitted for both ADMIN and WORKER */}
                          <button onClick={() => openEdit(s)} title={t('loans.recordPayment')} style={{
                            width: 30, height: 30, borderRadius: 8,
                            border: '1px solid var(--yellow-border)',
                            background: 'var(--amber-bg)', color: 'var(--amber)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'background .15s, transform .1s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--yellow-border)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--amber-bg)'; e.currentTarget.style.transform = 'none'; }}
                          >
                            <Pencil size={13} />
                          </button>
                          {/* Delete — ADMIN only */}
                          {isAdmin && (
                            <button onClick={() => setDeleteConfirm(s)} title={t('loans.deleteLoanRecord')} style={{
                              width: 30, height: 30, borderRadius: 8,
                              border: '1px solid var(--red-border)',
                              background: 'var(--red-bg)', color: 'var(--red-text)',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'background .15s, transform .1s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-border)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.transform = 'none'; }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderTop: '1px solid var(--border-light)',
            background: 'var(--cream-deep)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-faint)', fontWeight: 300 }}>
              <span>{t('loans.rows')}</span>
              {[10, 20, 50].map(n => (
                <button key={n} onClick={() => { setRowsPerPage(n); setPage(1); }} style={{
                  padding: '2px 9px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  background: rowsPerPage === n ? 'var(--amber)' : 'var(--card)',
                  color: rowsPerPage === n ? '#fff' : 'var(--ink-faint)',
                  border: `1px solid ${rowsPerPage === n ? 'var(--amber)' : 'var(--border)'}`,
                  fontFamily: 'DM Sans,sans-serif', transition: 'background .15s',
                }}>{n}</button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--ink-faint)', fontWeight: 300 }}>
              <span>{filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} / {filtered.length}</span>
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
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MODAL: Record Payment
        ══════════════════════════════════════════════════════════════════ */}
        {editModal && (
          <Modal onClose={() => setEditModal(null)} maxWidth={440}>
            <ModalHeader
              title={t('loans.recordPaymentTitle')}
              subtitle={`${editModal.customerName} · ${editModal.product?.name}`}
              onClose={() => setEditModal(null)}
              accent="var(--amber)"
            />

            <div style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Loan summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: t('loans.saleTotal'), val: `$${fmt(editTotal)}`, color: 'var(--ink-mid)' },
                  { label: t('loans.paidSoFar'), val: `$${fmt(editCurrentPaid)}`, color: 'var(--green)' },
                  { label: t('loans.outstandingLabel'), val: `$${fmt(editModal.remainingLoan)}`, color: 'var(--amber)' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'var(--cream-deep)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '10px 12px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                    <div className="abk-serif" style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* Additional payment input */}
              <div>
                <label className="abk-label">{t('loans.amountBeingPaidNow')}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 13, color: 'var(--ink-faint)', fontWeight: 500, pointerEvents: 'none',
                  }}>$</span>
                  <input
                    type="number" min="0.01" step="0.01"
                    max={editModal.remainingLoan}
                    value={additionalPay}
                    onChange={e => setAdditionalPay(e.target.value)}
                    placeholder={`0.01 – ${fmt(editModal.remainingLoan)}`}
                    className="abk-input"
                    style={{ paddingLeft: 24, borderColor: editInvalid ? 'var(--red-text)' : undefined }}
                    autoFocus
                  />
                </div>
                {editInvalid && (
                  <div style={{ fontSize: 11, color: 'var(--red-text)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <XCircle size={11} />
                    {editAddAmt < 0 ? t('loans.cannotBeNegative') : `${t('loans.cannotExceedOutstanding')} $${fmt(editModal.remainingLoan)}.`}
                  </div>
                )}
              </div>

              {/* Quick-pay buttons: 25%, 50%, Pay Full */}
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginBottom: 6, fontWeight: 400 }}>{t('loans.quickPay')}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { label: '25%', val: editModal.remainingLoan * 0.25 },
                    { label: '50%', val: editModal.remainingLoan * 0.50 },
                    { label: '75%', val: editModal.remainingLoan * 0.75 },
                    { label: t('loans.payFull'), val: editModal.remainingLoan },
                  ].map(q => (
                    <button key={q.label} onClick={() => setAdditionalPay(q.val.toFixed(2))} style={{
                      flex: 1, padding: '6px 0', borderRadius: 9, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'DM Sans,sans-serif',
                      background: 'var(--amber-bg)', color: 'var(--amber)',
                      border: '1px solid var(--yellow-border)',
                      transition: 'filter .12s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >{q.label}</button>
                  ))}
                </div>
              </div>

              {/* Preview after payment */}
              {editAddAmt > 0 && !editInvalid && (
                <div style={{
                  background: editNewRemain === 0 ? 'var(--green-bg)' : 'var(--amber-bg)',
                  border: `1px solid ${editNewRemain === 0 ? 'rgba(29,158,117,.25)' : 'var(--yellow-border)'}`,
                  borderRadius: 11, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: editNewRemain === 0 ? 'var(--green)' : 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {editNewRemain === 0 ? t('loans.fullySettled') : t('loans.remainingAfterPayment')}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 2, fontWeight: 300 }}>
                      ${fmt(editCurrentPaid)} + ${fmt(editAddAmt)} = ${fmt(editNewPaid)} {t('loans.paidWord')}
                    </div>
                  </div>
                  <div className="abk-serif" style={{ fontSize: 22, fontWeight: 700, color: editNewRemain === 0 ? 'var(--green)' : 'var(--amber)' }}>
                    ${fmt(editNewRemain)}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '1rem 1.4rem', borderTop: '1px solid var(--border-light)' }}>
              <BtnSecondary onClick={() => setEditModal(null)}>{t('loans.cancel')}</BtnSecondary>
              <BtnPrimary onClick={handleSavePayment} disabled={saving || editAddAmt <= 0 || editInvalid}>
                {saving
                  ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> {t('loans.saving')}</>
                  : <><CheckCircle size={13} /> {t('loans.savePayment')}</>}
              </BtnPrimary>
            </div>
          </Modal>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MODAL: Delete Confirm
        ══════════════════════════════════════════════════════════════════ */}
        {deleteConfirm && (
          <Modal onClose={() => setDeleteConfirm(null)} maxWidth={360}>
            <div style={{ padding: '2rem 1.6rem 1.4rem', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--red-bg)', border: '2px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Trash2 size={22} style={{ color: 'var(--red-text)' }} />
              </div>
              <div className="abk-serif" style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 6 }}>{t('loans.deleteLoanRecordTitle')}</div>
              <p style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 4, fontWeight: 300 }}>
                {t('loans.saleTo')} <strong style={{ color: 'var(--ink)' }}>{deleteConfirm.customerName}</strong> {t('loans.forProduct')} <strong style={{ color: 'var(--ink)' }}>{deleteConfirm.product?.name}</strong>
              </p>
              <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginBottom: 4 }}>
                {t('loans.outstandingLabel')}: <span className="abk-serif" style={{ fontWeight: 700, color: 'var(--amber)', fontSize: 14 }}>${fmt(deleteConfirm.remainingLoan)}</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 20, fontWeight: 300 }}>{t('loans.stockWillBeRestored')}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <BtnSecondary onClick={() => setDeleteConfirm(null)}>{t('loans.cancel')}</BtnSecondary>
                <BtnPrimary onClick={() => handleDelete(deleteConfirm.id)} color="#c53030">
                  <Trash2 size={13} /> {t('loans.delete')}
                </BtnPrimary>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}

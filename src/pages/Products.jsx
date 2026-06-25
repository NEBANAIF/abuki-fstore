import { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, Edit2, Trash2, Package, AlertTriangle,
  XCircle, RefreshCw, ChevronLeft, ChevronRight, X, Save,
  PackageMinus, PackagePlus, Filter, SlidersHorizontal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getProducts, createProduct, updateProduct,
  deleteProduct, addStock
} from '../services/api';

/* ─────────────────────────────────────────────────────────────────────────────
   Design-system CSS — identical token set as Dashboard's GLOBAL_CSS
   ───────────────────────────────────────────────────────────────────────── */
const PRODUCTS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .abk-prod {
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
    --purple:        #534AB7;
    --purple-bg:     #EEEDFE;
    --amber:         #854F0B;
    --amber-bg:      #FAEEDA;
    --red-bg:        #FCEBEB;
    --red-border:    #F7C1C1;
    --red-text:      #791F1F;
    --yellow-bg:     #FAEEDA;
    --yellow-border: #FAC775;
    --yellow-text:   #633806;
    --texture-col:   #C8DCA8;
  }

  .abk-prod.abk-dark {
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
    --purple:        #A78BFA;
    --purple-bg:     #1A1535;
    --amber:         #F0A742;
    --amber-bg:      #2A1C06;
    --red-bg:        #1F0D0D;
    --red-border:    #3D1515;
    --red-text:      #FF8080;
    --yellow-bg:     #1F1608;
    --yellow-border: #3D2A0A;
    --yellow-text:   #F5C842;
    --texture-col:   #1A2535;
  }

  .abk-prod, .abk-prod * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
  .abk-prod .abk-serif   { font-family:'Playfair Display',Georgia,serif !important; }

  .abk-prod.abk-texture::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(var(--texture-col) 1px, transparent 1px),
      linear-gradient(90deg, var(--texture-col) 1px, transparent 1px);
    background-size:48px 48px; opacity:.25;
  }
  .abk-prod.abk-dark.abk-texture::before { opacity:.18; }

  @keyframes abkFadeUp   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes abkFadeIn   { from { opacity:0 } to { opacity:1 } }
  @keyframes abkScaleIn  { from { opacity:0; transform:scale(.94) } to { opacity:1; transform:scale(1) } }
  @keyframes abkBarGrow  { from { transform:scaleX(0) } to { transform:scaleX(1) } }

  .abk-prod .abk-anim-fade-up  { opacity:0; animation:abkFadeUp  .45s ease both; }
  .abk-prod .abk-anim-fade-in  { opacity:0; animation:abkFadeIn  .45s ease both; }
  .abk-prod .abk-anim-scale-in { opacity:0; animation:abkScaleIn .45s ease both; }

  .abk-prod .abk-row-hover { transition:background .15s; }
  .abk-prod .abk-row-hover:hover { background:var(--card-hover) !important; }

  .abk-prod .abk-prog-fill { transform-origin:left; animation:abkBarGrow .85s ease both; }

  .abk-prod .abk-btn-icon {
    display:inline-flex; align-items:center; justify-content:center;
    border:none; cursor:pointer; transition:background .15s, transform .1s;
    border-radius:9px;
  }
  .abk-prod .abk-btn-icon:hover { transform:translateY(-1px); }

  .abk-prod .abk-input {
    width:100%; border:1px solid var(--border); border-radius:10px;
    padding:9px 12px; font-size:13px; color:var(--ink);
    background:var(--card); outline:none;
    transition:border-color .15s, box-shadow .15s;
    font-family:'DM Sans',sans-serif;
  }
  .abk-prod .abk-input:focus {
    border-color:var(--green);
    box-shadow:0 0 0 3px rgba(29,158,117,.12);
  }
  .abk-prod .abk-input::placeholder { color:var(--ink-faint); }

  .abk-prod .abk-label {
    display:block; font-size:10.5px; font-weight:600;
    text-transform:uppercase; letter-spacing:.09em;
    color:var(--ink-light); margin-bottom:6px;
  }

  .abk-dark .abk-prod .abk-input { background:var(--cream-deep); }
  .abk-prod.abk-dark .abk-input  { background:var(--cream-deep); }

  .abk-prod ::-webkit-scrollbar       { width:5px; }
  .abk-prod ::-webkit-scrollbar-track { background:transparent; }
  .abk-prod ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

  /* ── Responsive: tablet ── */
  @media (max-width:1023px) {
    .abk-prod-kpi-4   { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    /* 3rd card (odd one out) spans both columns and centers itself,
       instead of sitting alone on the left with empty space beside it. */
    .abk-prod-kpi-4 > *:nth-child(3) { grid-column: 1 / -1 !important; max-width: 50% !important; margin: 0 auto !important; }
    .abk-prod-filter  { flex-wrap: wrap !important; }
    .abk-prod-filter > * { min-width: 140px !important; }
    .abk-prod-modal-grid { grid-template-columns: 1fr !important; }
  }

  /* ── Responsive: phone ── */
  @media (max-width:767px) {
    .abk-prod-pad     { padding: 1rem 0.75rem 3rem !important; }
    .abk-prod-kpi-4   { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-prod-kpi-4 > *:nth-child(3) { grid-column: 1 / -1 !important; max-width: 60% !important; margin: 0 auto !important; }
    .abk-prod-filter  { flex-direction: column !important; }
    .abk-prod-filter > * { width: 100% !important; }
    .abk-prod-header  { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    .abk-prod-header > * { width: 100% !important; }
    .abk-prod-modal-grid { grid-template-columns: 1fr !important; }

    /* ── Products table: horizontal scroll — all columns visible, no hiding ── */
    .abk-prod-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
    .abk-prod-table-wrap table { min-width: 680px !important; table-layout: auto !important; }
  }

  /* Autocomplete dropdown */
  .abk-autocomplete { position: relative; }
  .abk-autocomplete-list {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
    background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12); max-height: 220px; overflow-y: auto;
  }
  .abk-autocomplete-item {
    padding: 9px 12px; cursor: pointer; font-size: 13px; color: var(--ink);
    transition: background .12s; display: flex; align-items: center; justify-content: space-between;
  }
  .abk-autocomplete-item:hover, .abk-autocomplete-item.active { background: var(--card-hover); }
  .abk-autocomplete-item:not(:last-child) { border-bottom: 1px solid var(--border-light); }

  @media (max-width:480px) {
    .abk-prod-pad { padding: 0.75rem 0.5rem 2rem !important; }
    /* Keep KPI at 2-col on small phones; 3rd card still centered via the rule above */
    .abk-prod-kpi-4 { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
  }

  @media (max-width:380px) {
    /* Below this width even 2 columns get cramped — drop to 1 column.
       No centering needed here since every card already spans the full row. */
    .abk-prod-kpi-4 { grid-template-columns: 1fr !important; }
    .abk-prod-kpi-4 > *:nth-child(3) { max-width: 100% !important; }
  }
  /* iOS: prevent zoom on input focus */
  @media (max-width:767px) {
    input, select, textarea { font-size: 16px !important; }
  }

`;

const EMPTY = { name:'',sku:'',price:'',stock:'',minStock:'30',description:'' };

/* ── tiny helpers ─────────────────────────────────────────────────────────── */
function Pill({ children, bg, color, border }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      fontSize:10.5, fontWeight:600, letterSpacing:'0.06em',
      textTransform:'uppercase', padding:'2px 10px', borderRadius:20,
      background:bg, color, border:`1px solid ${border ?? bg}`,
    }}>{children}</span>
  );
}

function SummaryCard({ label, count, active, onClick, Icon, bg, border, textColor, iconBg, progPct, delay }) {
  return (
    <button onClick={onClick} className="abk-anim-fade-up" style={{
      background:bg, border:`1.5px solid ${active ? 'var(--blue)' : border}`,
      borderRadius:14, padding:'1rem 1.1rem', textAlign:'left', cursor:'pointer',
      transition:'border-color .2s, box-shadow .2s, transform .15s',
      boxShadow: active ? '0 0 0 3px rgba(24,95,165,.18)' : '0 1px 4px rgba(0,0,0,.06)',
      transform: active ? 'translateY(-2px)' : 'none',
      position:'relative', overflow:'hidden', animationDelay:delay,
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:textColor, borderRadius:'14px 14px 0 0', opacity:.7 }} />
      <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:4 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={15} color={textColor} />
        </div>
        <div>
          <div className="abk-serif" style={{ fontSize:22, fontWeight:700, color:textColor, lineHeight:1.1 }}>{count}</div>
          <div style={{ fontSize:11, fontWeight:500, color:textColor, opacity:.8, marginTop:1 }}>{label}</div>
        </div>
      </div>
      <div style={{ height:2, background:'rgba(255,255,255,.25)', borderRadius:2, overflow:'hidden', marginTop:10 }}>
        <div className="abk-prog-fill" style={{ height:'100%', borderRadius:2, background:textColor, width:`${Math.max(2, progPct)}%`, opacity:.6, animationDelay:`calc(${delay} + .5s)` }} />
      </div>
    </button>
  );
}

/* ── Modal shell ──────────────────────────────────────────────────────────── */
function Modal({ onClose, children, maxWidth = 480 }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.45)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:50, padding:16, backdropFilter:'blur(4px)',
    }}>
      <div className="abk-anim-scale-in" style={{
        background:'var(--card)', borderRadius:18, width:'100%', maxWidth,
        maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,.2), 0 2px 8px rgba(0,0,0,.1)',
        border:'1px solid var(--border)',
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose, accent }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'1.1rem 1.4rem', borderBottom:'1px solid var(--border-light)',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:accent }} />
      <div style={{ marginTop:4 }}>
        <div className="abk-serif" style={{ fontSize:16, fontWeight:500, color:'var(--ink)' }}>{title}</div>
        {subtitle && <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{subtitle}</div>}
      </div>
      <button onClick={onClose} style={{
        width:30, height:30, borderRadius:8, border:'1px solid var(--border)',
        background:'var(--cream-deep)', display:'flex', alignItems:'center',
        justifyContent:'center', cursor:'pointer', color:'var(--ink-light)',
        transition:'background .15s',
      }}><X size={14} /></button>
    </div>
  );
}

function ModalFooter({ children }) {
  return (
    <div style={{ display:'flex', gap:10, padding:'1rem 1.4rem', borderTop:'1px solid var(--border-light)' }}>
      {children}
    </div>
  );
}

function BtnPrimary({ onClick, disabled, children, color = 'var(--green)', style: extra }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex:1, padding:'10px 0', background:color, color:'#fff',
      border:'none', borderRadius:11, fontSize:13, fontWeight:500,
      cursor:disabled ? 'not-allowed' : 'pointer', opacity:disabled ? .5 : 1,
      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
      transition:'opacity .15s, filter .15s',
      fontFamily:'DM Sans,sans-serif',
      ...extra,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
    >{children}</button>
  );
}

function BtnSecondary({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:'10px 0', background:'var(--cream-deep)', color:'var(--ink-mid)',
      border:'1px solid var(--border)', borderRadius:11, fontSize:13, fontWeight:500,
      cursor:'pointer', transition:'background .15s', fontFamily:'DM Sans,sans-serif',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--cream-deep)'}
    >{children}</button>
  );
}

/* ── Product Autocomplete ─────────────────────────────────────────────────── */
function ProductAutocomplete({ products, value, onChange, placeholder }) {
  const [query, setQuery]   = useState('');
  const [open,  setOpen]    = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);

  // Sync display value when external value changes
  useEffect(() => {
    const p = products.find(p => String(p.id) === String(value));
    setQuery(p ? p.name : '');
  }, [value, products]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = products.filter(p =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku?.toLowerCase().includes(query.toLowerCase())
  );

  function select(p) {
    onChange(p.id);
    setQuery(p.name);
    setOpen(false);
    setActive(-1);
  }

  function handleKey(e) {
    if (!open) { setOpen(true); return; }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); select(filtered[active]); }
    if (e.key === 'Escape')     { setOpen(false); }
  }

  return (
    <div className="abk-autocomplete" ref={ref}>
      <div style={{ position:'relative' }}>
        <Search size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--ink-faint)', pointerEvents:'none' }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); onChange(''); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder || 'Search product…'}
          className="abk-input"
          style={{ paddingLeft: 32 }}
          autoComplete="off"
        />
        {query && (
          <button onClick={() => { setQuery(''); onChange(''); setOpen(false); }} style={{ position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--ink-faint)', display:'flex', padding:2 }}>
            <X size={13} />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="abk-autocomplete-list">
          {filtered.map((p, i) => (
            <div key={p.id} className={`abk-autocomplete-item${i === active ? ' active' : ''}`} onMouseDown={() => select(p)}>
              <div>
                <div style={{ fontWeight:500 }}>{p.name}</div>
                <div style={{ fontSize:11, color:'var(--ink-faint)', fontFamily:'monospace' }}>{p.sku}</div>
              </div>
              <div style={{ fontSize:11, color:'var(--ink-light)', textAlign:'right' }}>
                <div style={{ fontWeight:500 }}>${p.price}</div>
                <div style={{ color: p.stock === 0 ? 'var(--red-text)' : p.stock <= (p.minStock||30) ? 'var(--amber)' : 'var(--ink-faint)' }}>
                  Stock: {p.stock}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && query && (
        <div className="abk-autocomplete-list">
          <div style={{ padding:'12px', fontSize:12, color:'var(--ink-faint)', textAlign:'center' }}>No products found</div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Products component
   ════════════════════════════════════════════════════════════════════════════ */
export default function Products({ dark, user }) {
  // ── Role flags ────────────────────────────────────────────────────────
  // WORKER: full access (add, edit, delete, stock adjustment)
  // ADMIN:  full access
  const isAdmin  = user?.role?.toUpperCase() === 'ADMIN';
  const isWorker = user?.role?.toUpperCase() === 'WORKER';
  const { t } = useTranslation();

  /* Inject CSS once */
  useEffect(() => {
    const id = 'abk-products-css';
    let tag = document.getElementById(id);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = id;
      document.head.appendChild(tag);
    }
    tag.innerHTML = PRODUCTS_CSS;
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);

  const STATUS_CFG = {
    IN_STOCK:     { label: t('products.inStock'),    bg:'var(--green-bg)',  color:'var(--green)',  border:'rgba(29,158,117,.3)' },
    LOW_STOCK:    { label: t('products.lowStock'),   bg:'var(--amber-bg)',  color:'var(--amber)',  border:'var(--yellow-border)' },
    OUT_OF_STOCK: { label: t('products.outOfStock'), bg:'var(--red-bg)',    color:'var(--red-text)',border:'var(--red-border)' },
  };

  const [products,      setProducts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('ALL');
  const [page,          setPage]          = useState(1);
  const [rowsPerPage,   setRowsPerPage]   = useState(10);
  const [showModal,     setShowModal]     = useState(false);
  const [editProduct,   setEditProduct]   = useState(null);
  const [form,          setForm]          = useState(EMPTY);
  const [saving,        setSaving]        = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stockModal,    setStockModal]    = useState(null);
  const [stockMode,     setStockMode]     = useState('add');
  const [stockQty,      setStockQty]      = useState('');
  const [stockReason,   setStockReason]   = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try { setLoading(true); setError(null); setProducts(await getProducts()); }
    catch { setError(t('ui.retry')); }
    finally { setLoading(false); }
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    return matchSearch && (statusFilter === 'ALL' || p.status === statusFilter);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const inStock    = products.filter(p => p.status === 'IN_STOCK').length;
  const lowStock   = products.filter(p => p.status === 'LOW_STOCK').length;
  const outOfStock = products.filter(p => p.status === 'OUT_OF_STOCK').length;

  function openCreate() { setEditProduct(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(p) {
    setEditProduct(p);
    setForm({ name:p.name||'', sku:p.sku||'', price:p.price??'', stock:p.stock??'', minStock:p.minStock??30, description:p.description||'' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.sku || form.price === '') { alert('Name, SKU and Price are required.'); return; }
    setSaving(true);
    try {
      const payload = { name:form.name, sku:form.sku, price:parseFloat(form.price), stock:parseInt(form.stock)||0, minStock:parseInt(form.minStock)||30, description:form.description };
      if (editProduct) {
        const updated = await updateProduct(editProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editProduct.id ? updated : p));
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (e) { alert(e.response?.data?.message || 'Failed to save product.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); setDeleteConfirm(null); }
    catch { alert('Failed to delete product.'); }
  }

  async function handleAdjustStock() {
    const qty = parseInt(stockQty);
    if (!qty || qty <= 0) { alert('Enter a valid quantity.'); return; }
    if (stockMode === 'subtract' && qty > stockModal.stock) { alert(`Cannot subtract more than current stock (${stockModal.stock} units).`); return; }
    try {
      const updated = await addStock(stockModal.id, stockMode === 'subtract' ? -qty : qty, stockReason || (stockMode === 'add' ? 'Stock addition' : 'Stock subtraction'), 'Admin');
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setStockModal(null); setStockQty(''); setStockReason('');
    } catch (e) { alert(e.response?.data?.message || 'Failed to adjust stock.'); }
  }

  const previewStock = stockModal && stockQty && parseInt(stockQty) > 0
    ? stockMode === 'add' ? stockModal.stock + parseInt(stockQty) : stockModal.stock - parseInt(stockQty)
    : null;

  /* ── Loading ── */
  if (loading) return (
    <div className={`abk-prod abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--cream)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:34, height:34, border:'3px solid var(--border)', borderTopColor:'var(--green)', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:'var(--ink-faint)', fontSize:13, fontWeight:300 }}>{t('ui.loading')}</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className={`abk-prod abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--cream)' }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--red-border)', borderRadius:18, padding:32, textAlign:'center', maxWidth:380, boxShadow:'0 4px 24px rgba(0,0,0,.1)' }}>
        <XCircle size={38} style={{ color:'var(--red-text)', marginBottom:12 }} />
        <div className="abk-serif" style={{ fontSize:16, fontWeight:500, color:'var(--ink)', marginBottom:6 }}>Connection Error</div>
        <p style={{ color:'var(--ink-faint)', fontSize:12, marginBottom:16, fontWeight:300 }}>{error}</p>
        <button onClick={load} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 18px', background:'var(--green)', color:'#fff', border:'none', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
          <RefreshCw size={13} /> {t('ui.retry')}
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className={`abk-prod abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ background:'var(--cream)', minHeight:'100vh', position:'relative', transition:'background .3s' }}>

      <div className="abk-prod-pad" style={{ position:'relative', zIndex:1, padding:'1.5rem 1.5rem 3rem' }}>

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="abk-anim-fade-up" style={{ padding:'0.5rem 0 1.4rem', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
          <div>
            <div style={{ fontSize:10.5, fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink-light)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ display:'inline-block', width:18, height:1.5, background:'var(--green)', borderRadius:1 }} />
              {t('products.title')}
            </div>
            <div className="abk-serif" style={{ fontSize:28, fontWeight:500, color:'var(--ink)', letterSpacing:-0.5, lineHeight:1.1 }}>
              {t('products.title')}
            </div>
            <div style={{ fontSize:12, color:'var(--ink-faint)', marginTop:4, fontWeight:300 }}>
              {products.length} {t('products.totalProducts')}
            </div>
          </div>

          <div style={{ display:'flex', gap:8, alignItems:'center', paddingTop:4 }}>
            <button onClick={load} style={{
              display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px',
              background:'var(--card)', border:'1px solid var(--border)', borderRadius:11,
              color:'var(--ink-mid)', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
              transition:'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-deep)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
            >
              <RefreshCw size={12} /> Refresh
            </button>
            {/* Add product button — ADMIN and WORKER */}
            {(isAdmin || isWorker) && (
            <button onClick={openCreate} style={{
              display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
              background:'var(--green)', color:'#fff', border:'none', borderRadius:11,
              fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
              boxShadow:'0 2px 8px rgba(29,158,117,.3)',
              transition:'filter .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              <Plus size={14} /> {t('products.addProduct')}
            </button>
            )}
          </div>
        </div>

        {/* ── Summary Cards ──────────────────────────────────────────────── */}
        <div className="abk-prod-kpi-4" style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:10, marginBottom:'1.1rem' }}>
          <SummaryCard label={t('products.inStock')}    count={inStock}    active={statusFilter==='IN_STOCK'}    onClick={() => { setStatusFilter(statusFilter==='IN_STOCK'    ? 'ALL' : 'IN_STOCK');    setPage(1); }} Icon={Package}       bg="var(--green-bg)"  border="rgba(29,158,117,.25)"  textColor="var(--green)"    iconBg="rgba(29,158,117,.15)"  progPct={products.length > 0 ? Math.round(inStock/products.length*100) : 0}    delay=".06s" />
          <SummaryCard label={t('products.lowStock')}   count={lowStock}   active={statusFilter==='LOW_STOCK'}   onClick={() => { setStatusFilter(statusFilter==='LOW_STOCK'   ? 'ALL' : 'LOW_STOCK');   setPage(1); }} Icon={AlertTriangle} bg="var(--amber-bg)"  border="rgba(133,79,11,.2)"    textColor="var(--amber)"    iconBg="rgba(133,79,11,.12)"   progPct={products.length > 0 ? Math.round(lowStock/products.length*100) : 0}   delay=".13s" />
          <SummaryCard label={t('products.outOfStock')} count={outOfStock} active={statusFilter==='OUT_OF_STOCK'} onClick={() => { setStatusFilter(statusFilter==='OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK'); setPage(1); }} Icon={XCircle}       bg="var(--red-bg)"    border="var(--red-border)"     textColor="var(--red-text)" iconBg="rgba(121,31,31,.12)"   progPct={products.length > 0 ? Math.round(outOfStock/products.length*100) : 0} delay=".20s" />
        </div>

        {/* ── Search & Filter bar ────────────────────────────────────────── */}
        <div className="abk-anim-fade-in abk-prod-filter" style={{ display:'flex', gap:8, marginBottom:'1rem', animationDelay:'.28s' }}>
          <div style={{ flex:1, position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--ink-faint)', pointerEvents:'none' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('products.searchPlaceholder')}
              className="abk-input" style={{ paddingLeft:34 }} />
          </div>
          <div style={{ position:'relative' }}>
            <Filter size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--ink-faint)', pointerEvents:'none' }} />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="abk-input" style={{ paddingLeft:30, minWidth:160, appearance:'none', cursor:'pointer' }}>
              <option value="ALL">{t('products.allStatus')}</option>
              <option value="IN_STOCK">{t('products.inStock')}</option>
              <option value="LOW_STOCK">{t('products.lowStock')}</option>
              <option value="OUT_OF_STOCK">{t('products.outOfStock')}</option>
            </select>
          </div>
          {(search || statusFilter !== 'ALL') && (
            <button onClick={() => { setSearch(''); setStatusFilter('ALL'); setPage(1); }} style={{
              display:'inline-flex', alignItems:'center', gap:5, padding:'0 13px',
              background:'var(--red-bg)', border:'1px solid var(--red-border)',
              borderRadius:10, color:'var(--red-text)', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
            }}>
              <X size={12} /> {t('ui.clear')}
            </button>
          )}
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="abk-anim-scale-in" style={{
          background:'var(--card)', border:'1px solid var(--border)',
          borderRadius:16, width:'100%', overflow:'hidden',
          boxShadow:'0 2px 12px rgba(0,0,0,.06)',
          animationDelay:'.32s', transition:'background .3s, border-color .3s',
        }}>
          <div className="abk-prod-table-wrap" style={{ overflowX:'auto', borderRadius:16, width:'100%', display:'block' }}>
            <table style={{ width:'100%', minWidth:'max-content', borderCollapse:'collapse' }}>
              {/* colgroup — controls per-column widths on mobile via CSS col selectors */}
              <colgroup>
                <col />{/* Name */}
                <col />{/* SKU */}
                <col />{/* Price */}
                <col />{/* Stock */}
                <col />{/* Status */}
                <col />{/* Actions */}
              </colgroup>
              <thead>
                <tr style={{ background:'var(--cream-deep)', borderBottom:'1px solid var(--border)' }}>
                  {[
                    { label: t('sales.product') },
                    { label: t('products.sku'), cls: 'abk-prod-col-sku' },
                    { label: t('products.sellingPrice') },
                    { label: t('products.currentStock') },
                    { label: 'Status' },
                    { label: t('ui.actions') },
                  ].map(({ label, cls }) => (
                    <th key={label} className={cls || ''} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:600, letterSpacing:'0.10em', textTransform:'uppercase', color:'var(--ink-light)', whiteSpace:'nowrap' }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign:'center', padding:'3.5rem 0' }}>
                      <Package size={34} style={{ color:'var(--border)', margin:'0 auto 10px', display:'block' }} />
                      <p style={{ color:'var(--ink-faint)', fontSize:13, fontWeight:300 }}>
                        {search || statusFilter !== 'ALL' ? t('products.noProductsFilter') : t('products.noProductsYet')}
                      </p>
                    </td>
                  </tr>
                ) : paginated.map((p, idx) => {
                  const sc = STATUS_CFG[p.status] || STATUS_CFG.IN_STOCK;
                  return (
                    <tr key={p.id} className="abk-row-hover" style={{ borderBottom:'1px solid var(--border-light)', background:'var(--card)', transition:'background .15s' }}>
                      {/* Product name */}
                      <td data-label="Product" style={{ padding:'11px 14px' }}>
                        <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{p.name}</div>
                        {p.description && <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:300 }}>{p.description}</div>}
                      </td>
                      {/* SKU */}
                      <td className="abk-prod-col-sku" data-label="SKU" style={{ padding:'11px 14px', fontFamily:'monospace', fontSize:12, color:'var(--ink-light)' }}>{p.sku}</td>
                      {/* Selling price */}
                      <td data-label="Price" style={{ padding:'11px 14px' }}>
                        <span className="abk-serif" style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>
                          ${(p.price ?? 0).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}
                        </span>
                      </td>
                      {/* Stock */}
                      <td data-label="Stock" style={{ padding:'11px 14px' }}>
                        <span style={{
                          fontSize:14, fontWeight:700,
                          color: p.stock === 0 ? 'var(--red-text)' : p.stock <= (p.minStock || 30) ? 'var(--amber)' : 'var(--ink)',
                        }}>{p.stock}</span>
                        {p.minStock && <div style={{ fontSize:10, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{t('products.min')}: {p.minStock}</div>}
                      </td>
                      {/* Status */}
                      <td data-label="Status" style={{ padding:'11px 14px' }}>
                        <Pill bg={sc.bg} color={sc.color} border={sc.border}>{sc.label}</Pill>
                      </td>
                      {/* Actions — edit/delete/stock-adjust for ADMIN and WORKER */}
                      <td className="abk-td-actions" style={{ padding:'11px 14px' }}>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          {(isAdmin || isWorker) ? (
                            <>
                              <button onClick={() => openEdit(p)} className="abk-btn-icon" style={{ width:28, height:28, background:'var(--blue-bg)', color:'var(--blue)', border:'1px solid rgba(24,95,165,.2)' }} title="Edit">
                                <Edit2 size={12} />
                              </button>
                              {/* Delete — ADMIN only */}
                              {isAdmin && (
                                <button onClick={() => setDeleteConfirm(p)} className="abk-btn-icon" style={{ width:28, height:28, background:'var(--red-bg)', color:'var(--red-text)', border:'1px solid var(--red-border)' }} title="Delete">
                                  <Trash2 size={12} />
                                </button>
                              )}
                              <button onClick={() => { setStockModal(p); setStockMode('add'); setStockQty(''); setStockReason(''); }} className="abk-btn-icon" style={{ width:28, height:28, background:'var(--green-bg)', color:'var(--green)', border:'1px solid rgba(29,158,117,.25)' }} title={t('products.adjustStock')}>
                                <SlidersHorizontal size={12} />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'10px 14px', borderTop:'1px solid var(--border-light)',
            background:'var(--cream-deep)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--ink-faint)', fontWeight:300 }}>
              <span>Rows:</span>
              {[10, 20, 50, 100].map(n => (
                <button key={n} onClick={() => { setRowsPerPage(n); setPage(1); }} style={{
                  padding:'2px 9px', borderRadius:7, fontSize:11, fontWeight:500, cursor:'pointer',
                  background: rowsPerPage === n ? 'var(--green)' : 'var(--card)',
                  color: rowsPerPage === n ? '#fff' : 'var(--ink-faint)',
                  border:`1px solid ${rowsPerPage === n ? 'var(--green)' : 'var(--border)'}`,
                  fontFamily:'DM Sans,sans-serif', transition:'background .15s',
                }}>{n}</button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--ink-faint)', fontWeight:300 }}>
              <span>{filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}</span>
              {[{ Icon:ChevronLeft, action:() => setPage(p => Math.max(1,p-1)), disabled:page===1 }, { Icon:ChevronRight, action:() => setPage(p => Math.min(totalPages,p+1)), disabled:page===totalPages }].map(({ Icon, action, disabled }, i) => (
                <button key={i} onClick={action} disabled={disabled} style={{
                  width:26, height:26, borderRadius:7, border:'1px solid var(--border)',
                  background:'var(--card)', color:'var(--ink-light)', cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? .35 : 1, display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'background .15s',
                }}><Icon size={13} /></button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MODAL: Add / Edit Product
        ══════════════════════════════════════════════════════════════════ */}
        {showModal && (
          <Modal onClose={() => setShowModal(false)} maxWidth={500}>
            <ModalHeader
              title={editProduct ? t('products.editProduct') : t('products.newProduct')}
              subtitle={t('products.fillDetails')}
              onClose={() => setShowModal(false)}
              accent="var(--green)"
            />
            <div style={{ padding:'1.2rem 1.4rem', display:'flex', flexDirection:'column', gap:14 }}>

              <div>
                <label className="abk-label">{t('products.productName')} *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder={t('products.namePlaceholder')} className="abk-input" />
              </div>

              <div>
                <label className="abk-label">{t('products.sku')} *</label>
                <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku:e.target.value }))} placeholder={t('products.skuPlaceholder')} className="abk-input" />
              </div>

              <div className="abk-prod-modal-grid" style={{ display:'grid', gridTemplateColumns: isWorker ? '1fr' : '1fr 1fr', gap:12 }}>
                <div>
                  <label className="abk-label">{t('products.sellingPrice')} *</label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price:e.target.value }))} placeholder="0.00" className="abk-input" />
                </div>
              </div>

              <div className="abk-prod-modal-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="abk-label">{t('products.initialStock')}{editProduct ? ' (use Adjust Stock)' : ''}</label>
                  <input
                    type="number" min="0"
                    value={editProduct ? (editProduct.stock ?? '') : form.stock}
                    onChange={e => { if (!editProduct) setForm(f => ({ ...f, stock:e.target.value })); }}
                    readOnly={!!editProduct}
                    placeholder="0"
                    className="abk-input"
                    style={editProduct ? { opacity:.55, cursor:'not-allowed', background:'var(--cream-deep)' } : {}}
                    title={editProduct ? 'Use the Adjust Stock button to change stock level' : ''}
                  />
                  {editProduct && <div style={{ fontSize:10, color:'var(--ink-faint)', marginTop:3, fontWeight:300 }}>Use Adjust Stock (⊞) to modify inventory.</div>}
                </div>
                <div>
                  <label className="abk-label">{t('products.minStockAlert')}</label>
                  <input type="number" min="0" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock:e.target.value }))} placeholder="30" className="abk-input" />
                </div>
              </div>

              <div>
                <label className="abk-label">{t('products.description')}</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} placeholder={t('products.descPlaceholder')} rows={2} className="abk-input" style={{ resize:'none' }} />
              </div>
            </div>
            <ModalFooter>
              <BtnSecondary onClick={() => setShowModal(false)}>{t('ui.cancel')}</BtnSecondary>
              <BtnPrimary onClick={handleSave} disabled={saving}>
                {saving
                  ? <><RefreshCw size={13} style={{ animation:'spin 1s linear infinite' }} /> {t('ui.saving')}</>
                  : <><Save size={13} /> {editProduct ? t('products.saveChanges') : t('products.addProduct')}</>}
              </BtnPrimary>
            </ModalFooter>
          </Modal>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MODAL: Adjust Stock
        ══════════════════════════════════════════════════════════════════ */}
        {stockModal && (
          <Modal onClose={() => setStockModal(null)} maxWidth={380}>
            <ModalHeader
              title={stockMode === 'add' ? t('products.addStockLabel') : t('products.subtractStock')}
              subtitle={stockModal.name}
              onClose={() => setStockModal(null)}
              accent={stockMode === 'add' ? 'var(--green)' : 'var(--red-text)'}
            />
            <div style={{ padding:'1.1rem 1.4rem', display:'flex', flexDirection:'column', gap:12 }}>

              {/* Toggle */}
              <div style={{ display:'flex', gap:6, padding:4, background:'var(--cream-deep)', borderRadius:11, border:'1px solid var(--border)' }}>
                {[
                  { mode:'add',      Icon:PackagePlus,  label:t('products.addStockLabel'), active:'var(--green)' },
                  { mode:'subtract', Icon:PackageMinus, label:t('products.subtractStock'),  active:'var(--red-text)' },
                ].map(btn => (
                  <button key={btn.mode} onClick={() => setStockMode(btn.mode)} style={{
                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                    padding:'7px 0', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:500,
                    background: stockMode === btn.mode ? btn.active : 'transparent',
                    color: stockMode === btn.mode ? '#fff' : 'var(--ink-faint)',
                    transition:'all .15s', fontFamily:'DM Sans,sans-serif',
                  }}>
                    <btn.Icon size={12} /> {btn.label}
                  </button>
                ))}
              </div>

              {/* Current stock chip */}
              <div style={{ background:'var(--blue-bg)', border:'1px solid rgba(24,95,165,.2)', borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, color:'var(--blue)', fontWeight:500 }}>{t('products.currentStock')}</span>
                <span className="abk-serif" style={{ fontSize:14, fontWeight:600, color:'var(--blue)' }}>{stockModal.stock} {t('stock.units')}</span>
              </div>

              <div>
                <label className="abk-label">{t('products.quantityToAdd')} *</label>
                <input type="number" min="1" max={stockMode === 'subtract' ? stockModal.stock : undefined} value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="0" className="abk-input" />
                {stockMode === 'subtract' && <div style={{ fontSize:10.5, color:'var(--ink-faint)', marginTop:4, fontWeight:300 }}>{t('products.maxNote', { max:stockModal.stock })}</div>}
              </div>

              <div>
                <label className="abk-label">{t('products.reason')}</label>
                <input value={stockReason} onChange={e => setStockReason(e.target.value)} placeholder={stockMode === 'add' ? t('products.reasonPlaceholder') : t('products.reasonSubtractPlaceholder')} className="abk-input" />
              </div>

              {previewStock !== null && (() => {
                const bad = previewStock < 0;
                const addMode = stockMode === 'add';
                return (
                  <div style={{
                    background: bad ? 'var(--red-bg)' : addMode ? 'var(--green-bg)' : 'var(--amber-bg)',
                    border:`1px solid ${bad ? 'var(--red-border)' : addMode ? 'rgba(29,158,117,.25)' : 'var(--yellow-border)'}`,
                    borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between',
                  }}>
                    <span style={{ fontSize:12, fontWeight:500, color: bad ? 'var(--red-text)' : addMode ? 'var(--green)' : 'var(--amber)' }}>{t('products.newTotal')}</span>
                    <span className="abk-serif" style={{ fontSize:14, fontWeight:600, color: bad ? 'var(--red-text)' : addMode ? 'var(--green)' : 'var(--amber)' }}>
                      {bad ? 'Exceeds available stock!' : `${previewStock} ${t('stock.units')}`}
                    </span>
                  </div>
                );
              })()}
            </div>

            <ModalFooter>
              <BtnSecondary onClick={() => setStockModal(null)}>{t('ui.cancel')}</BtnSecondary>
              <BtnPrimary
                onClick={handleAdjustStock}
                disabled={previewStock !== null && previewStock < 0}
                color={stockMode === 'add' ? 'var(--green)' : '#c53030'}
              >
                {stockMode === 'add'
                  ? <><PackagePlus size={13} /> {t('products.addStockLabel')}</>
                  : <><PackageMinus size={13} /> {t('products.subtractStock')}</>}
              </BtnPrimary>
            </ModalFooter>
          </Modal>
        )}

        {/* ── Delete Confirm ── */}
        {deleteConfirm && (
          <Modal onClose={() => setDeleteConfirm(null)} maxWidth={360}>
            <div style={{ padding:'2rem 1.6rem 1.4rem', textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--red-bg)', border:'2px solid var(--red-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <Trash2 size={22} style={{ color:'var(--red-text)' }} />
              </div>
              <div className="abk-serif" style={{ fontSize:17, fontWeight:500, color:'var(--ink)', marginBottom:6 }}>{t('products.deleteProduct')}</div>
              <p style={{ fontSize:13, color:'var(--ink-light)', marginBottom:4, fontWeight:300 }}>
                {t('products.deleteConfirm')}{' '}
                <strong style={{ color:'var(--ink)', fontWeight:500 }}>"{deleteConfirm.name}"</strong>?
              </p>
              <p style={{ fontSize:11, color:'var(--ink-faint)', marginBottom:20, fontWeight:300 }}>{t('products.cannotUndo')}</p>
              <div style={{ display:'flex', gap:10 }}>
                <BtnSecondary onClick={() => setDeleteConfirm(null)}>{t('ui.cancel')}</BtnSecondary>
                <BtnPrimary onClick={() => handleDelete(deleteConfirm.id)} color="#c53030">{t('ui.delete')}</BtnPrimary>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}
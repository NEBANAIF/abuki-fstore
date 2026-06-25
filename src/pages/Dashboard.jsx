import { useState, useEffect } from 'react';
import {
  Package, ShoppingCart, Boxes, Landmark,
  AlertTriangle, RefreshCw, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight, History,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, getSales, getStockHistory } from '../services/api';
import { localYMD } from '../utils/dateUtils';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .abk-dash {
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
    --ticker-bg:     #0F1F04;
    --ticker-fg:     #F0F7E2;
    --feat-bg:       #0F1F04;
    --feat-fg:       #F0F7E2;
    --feat-card:     rgba(255,255,255,.07);
    --feat-card-hov: rgba(255,255,255,.13);
    --feat-border:   rgba(255,255,255,.11);
    --feat-desc:     rgba(168,192,128,.82);
    --texture-col:   #C8DCA8;
  }

  .abk-dash.abk-dark {
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
    --ticker-bg:     #090D14;
    --ticker-fg:     #E6EDF3;
    --feat-bg:       #090D14;
    --feat-fg:       #E6EDF3;
    --feat-card:     rgba(88,166,255,.06);
    --feat-card-hov: rgba(88,166,255,.12);
    --feat-border:   rgba(88,166,255,.12);
    --feat-desc:     #7D9BB5;
    --texture-col:   #1A2535;
  }

  .abk-dash, .abk-dash * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
  .abk-serif              { font-family:'Playfair Display',Georgia,serif !important; }

  .abk-texture::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(var(--texture-col) 1px, transparent 1px),
      linear-gradient(90deg, var(--texture-col) 1px, transparent 1px);
    background-size:48px 48px; opacity:.25;
  }
  .abk-dash.abk-dark::before { opacity:.18; }

  @keyframes tickerScroll { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
  @keyframes fadeUp       { from { opacity:0;transform:translateY(16px) } to { opacity:1;transform:translateY(0) } }
  @keyframes fadeIn       { from { opacity:0 } to { opacity:1 } }
  @keyframes scaleIn      { from { opacity:0;transform:scale(.94) } to { opacity:1;transform:scale(1) } }
  @keyframes barGrow      { from { transform:scaleX(0) } to { transform:scaleX(1) } }
  @keyframes slideInUp    { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  @keyframes slideOutUp   { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-14px) } }

  .abk-slide-in  { animation: slideInUp  .42s cubic-bezier(.22,1,.36,1) both; }
  .abk-slide-out { animation: slideOutUp .32s ease-in both; }

  .abk-ticker-inner  { display:flex; white-space:nowrap; animation:tickerScroll 34s linear infinite; }
  .abk-prog-fill     { transform-origin:left; animation:barGrow .85s ease both; }
  .abk-anim-fade-up  { opacity:0; animation:fadeUp  .45s ease both; }
  .abk-anim-fade-in  { opacity:0; animation:fadeIn  .45s ease both; }
  .abk-anim-scale-in { opacity:0; animation:scaleIn .45s ease both; }

  .abk-feat-card { transition:background .18s,transform .18s; cursor:default; }
  .abk-feat-card:hover { background:var(--feat-card-hov) !important; transform:translateY(-2px); }

  .abk-row-hover { transition:background .15s; }
  .abk-row-hover:hover { background:var(--card-hover) !important; }
  .abk-dark .abk-row-hover:hover { background:var(--card-hover) !important; }

  .abk-dark ::-webkit-scrollbar { width:6px; }
  .abk-dark ::-webkit-scrollbar-track { background:#0D1117; }
  .abk-dark ::-webkit-scrollbar-thumb { background:#21303F; border-radius:3px; }

  /* ── Responsive: tablet (≤1023px) ── */
  @media (max-width:1023px) {
    .abk-dash-kpi-4  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-dash-nav-5  { grid-template-columns: repeat(3,minmax(0,1fr)) !important; }
    .abk-dash-mid    { grid-template-columns: 1fr !important; }
    .abk-dash-bot-3  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-dash-bot-3 > *:nth-child(3) { grid-column: 1 / -1 !important; max-width: 50% !important; margin: 0 auto !important; }
    .abk-dash-feat-4 { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
  }

  /* ── Responsive: phone (≤767px) ── */
  @media (max-width:767px) {
    .abk-dash-pad    { padding: 0 0.75rem 2rem !important; }
    .abk-dash-kpi-4  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-dash-nav-5  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-dash-mid    { grid-template-columns: 1fr !important; }
    .abk-dash-bot-3  { grid-template-columns: 1fr !important; }
    .abk-dash-feat-4 { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-dash-header-inner { padding-top: 0.6rem !important; padding-bottom: 0.6rem !important; }
    .abk-dash-greeting-name { font-size: 20px !important; }
  }

  /* ── Responsive: small phone (≤480px) ── */
  @media (max-width:480px) {
    .abk-dash-pad    { padding: 0 0.5rem 1.5rem !important; }
    .abk-dash-kpi-4  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-dash-nav-5  { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-dash-feat-4 { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
    .abk-dash-greeting-name { font-size: 17px !important; }
  }

  /* ── Responsive: very small phone (≤380px) ── */
  @media (max-width:380px) {
    .abk-dash-kpi-4  { grid-template-columns: 1fr !important; }
    .abk-dash-feat-4 { grid-template-columns: 1fr !important; }
  }
  /* iOS: prevent zoom on input focus */
  @media (max-width:767px) {
    input, select, textarea { font-size: 16px !important; }
  }

`;

function fmt(n) {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function TickerBar({ products, unsoldValue, outstandingLoans, topProduct, t }) {
  const items = [
    { icon: '□', label: t('dashboard.tickerProducts'),    val: `${products.length} SKUs` },
    { icon: '↓', label: t('dashboard.tickerUnsoldValue'), val: `$${fmt(unsoldValue)}` },
    { icon: '🏦', label: t('dashboard.tickerLoans'),       val: `$${fmt(outstandingLoans)}` },
    { icon: '🛒', label: t('dashboard.tickerTopProduct'),  val: topProduct?.name ?? '—' },
    { icon: '📅', label: t('dashboard.tickerToday'),
      val: new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }) },
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{
      background:'var(--ticker-bg)', color:'var(--ticker-fg)',
      padding:'7px 0', overflow:'hidden',
      fontSize:11.5, fontWeight:300, letterSpacing:'0.04em',
      position:'relative', zIndex:2,
      borderBottom:'1px solid rgba(88,166,255,.08)',
    }}>
      <div className="abk-ticker-inner">
        {doubled.map((item, i) => (
          <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'0 30px' }}>
            <span style={{ opacity:.45 }}>{item.icon}</span>
            {item.label}
            <span style={{ fontWeight:500, color:'var(--ink-faint)' }}>{item.val}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ segments, total }) {
  const cx = 80, cy = 80, R = 58, r = 36, gap = 3;
  function polar(deg, radius) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }
  function arcPath(s, e) {
    const s1 = polar(s + gap/2, R), e1 = polar(e - gap/2, R);
    const s2 = polar(e - gap/2, r), e2 = polar(s + gap/2, r);
    const lg = e - s - gap > 180 ? 1 : 0;
    return `M${s1.x} ${s1.y} A${R} ${R} 0 ${lg} 1 ${e1.x} ${e1.y} L${s2.x} ${s2.y} A${r} ${r} 0 ${lg} 0 ${e2.x} ${e2.y}Z`;
  }
  let cur = 0;
  const computed = segments.map(seg => {
    const pct = total > 0 ? seg.value / total : 0;
    const sw = pct * 360;
    const s = cur; cur += sw;
    return { ...seg, pct: Math.round(pct * 100), start: s, end: cur };
  });
  return (
    <svg viewBox="0 0 160 160" width="148" height="148">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--cream-deep)" strokeWidth={19} />
      {computed.map((seg, i) => {
        if (!seg.value) return null;
        const lp = polar((seg.start + seg.end) / 2, R + 18);
        return (
          <g key={i}>
            <path d={arcPath(seg.start, seg.end)} fill={seg.color}
              style={{ filter:'drop-shadow(0 1px 4px rgba(0,0,0,.25))' }} />
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="9.5" fontWeight="700" fill={seg.color}>{seg.pct}%</text>
          </g>
        );
      })}
      <text x={cx} y={cy-7} textAnchor="middle" fontSize="21" fontWeight="700"
        fill="var(--ink)" className="abk-serif">{total}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fontSize="8"
        fill="var(--ink-faint)" letterSpacing="0.5">total</text>
    </svg>
  );
}

function KpiCard({ label, value, sub, Icon, stripeColor, iconBg, iconColor, progPct, delay }) {
  return (
    <div className="abk-anim-fade-up" style={{
      background:'var(--card)', border:'1px solid var(--border)',
      borderRadius:14, padding:'1.1rem 1.1rem .9rem',
      position:'relative', overflow:'hidden',
      transition:'background .3s, border-color .3s', animationDelay:delay,
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:stripeColor }} />
      <div style={{
        width:32, height:32, borderRadius:8, background:iconBg,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom:9, marginTop:4,
      }}>
        <Icon size={15} color={iconColor} />
      </div>
      <div className="abk-serif" style={{
        fontSize:24,
  fontWeight:700, color:iconColor, letterSpacing:-0.3,marginBottom:4, 
  whiteSpace:'nowrap', overflow:'hidden',textOverflow:'ellipsis', lineHeight:1.15,
      }}>{value}</div>
      <div style={{ fontSize:11, color:'var(--ink-light)', fontWeight:400 }}>{label}</div>
      <div style={{ fontSize:10.5, color:'var(--ink-faint)', fontWeight:300, marginTop:1 }}>{sub}</div>
      <div style={{ height:2, background:'var(--cream-deep)', borderRadius:2, overflow:'hidden', marginTop:9 }}>
        <div className="abk-prog-fill" style={{
          height:'100%', borderRadius:2, background:stripeColor,
          width:`${Math.max(2, progPct)}%`,
          animationDelay:`calc(${delay} + .5s)`,
        }} />
      </div>
    </div>
  );
}

function MetricChip({ label, value, change, changeUp, delay }) {
  return (
    <div className="abk-anim-fade-in" style={{
      background:'var(--cream-deep)', border:'1px solid var(--border)',
      borderRadius:10, padding:'10px 12px',
      display:'flex', flexDirection:'column', gap:3,
      transition:'background .3s, border-color .3s', animationDelay:delay,
    }}>
      <div style={{ fontSize:10, color:'var(--ink-light)', fontWeight:500,
        textTransform:'uppercase', letterSpacing:'0.10em' }}>{label}</div>
      <div className="abk-serif" style={{ fontSize:16, fontWeight:500, color:'var(--ink)', letterSpacing:-0.3 }}>
        {value}
      </div>
      {change && (
        <div style={{
          fontSize:10.5, fontWeight:500,
          color: changeUp === true ? 'var(--green)' : changeUp === false ? '#FF6B6B' : 'var(--ink-faint)',
        }}>
          {changeUp === true ? '↑ ' : changeUp === false ? '↓ ' : ''}{change}
        </div>
      )}
    </div>
  );
}

function GreetingSlider({ greeting, adminName, dark, slides, onRefresh, now, locale }) {
  const [idx,     setIdx]     = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimKey(k => k + 1);
      setIdx(i => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  function goTo(i) {
    if (i === idx) return;
    setAnimKey(k => k + 1);
    setIdx(i);
  }

  const slide = slides[idx];

  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <div className="abk-serif abk-dash-greeting-name" style={{
          fontSize:28, fontWeight:500, color:'var(--ink)',
          letterSpacing:-0.5, lineHeight:1.15,
        }}>
          {greeting},{' '}
          <em style={{ color: dark ? '#58A6FF' : 'var(--ink-mid)' }}>{adminName}</em>
        </div>

        <button
          onClick={onRefresh}
          style={{
            fontSize:12, fontWeight:400, padding:'6px 13px', borderRadius:20,
            border:'1px solid var(--border)', background:'var(--card)',
            color:'var(--ink-mid)', cursor:'pointer',
            display:'inline-flex', alignItems:'center', gap:5,
            transition:'background .15s', flexShrink:0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-deep)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div style={{ fontSize:12.5, color:'var(--ink-light)', fontWeight:300, marginBottom:10 }}>
        {now.toLocaleDateString(locale, { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        {' · '}
        {now.toLocaleTimeString(locale, { hour:'2-digit', minute:'2-digit' })}
      </div>

      <div style={{
        background: dark ? 'rgba(88,166,255,.07)' : 'rgba(29,158,117,.07)',
        border: `1px solid ${dark ? 'rgba(88,166,255,.15)' : 'rgba(29,158,117,.18)'}`,
        borderRadius:10, padding:'12px 16px', marginBottom:10,
        minHeight:60, display:'flex', alignItems:'center', gap:12,
        overflow:'hidden', position:'relative', width:'100%',
      }}>
        <div style={{
          width:3, height:36, borderRadius:2, flexShrink:0,
          background: slide.color, transition:'background .4s',
        }} />
        <div key={animKey} className="abk-slide-in" style={{ flex:1 }}>
          <div style={{
            fontSize:11, fontWeight:600, textTransform:'uppercase',
            letterSpacing:'0.10em', color: slide.color, marginBottom:3,
          }}>
            {slide.label}
          </div>
          <div style={{ fontSize:13.5, fontWeight:400, color:'var(--ink-mid)', lineHeight:1.5 }}>
            {slide.message}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:5, alignItems:'center' }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === idx ? 18 : 6,
            height:6, borderRadius:3, border:'none', cursor:'pointer',
            background: i === idx
              ? (dark ? '#58A6FF' : 'var(--green)')
              : (dark ? '#21303F' : 'var(--border)'),
            transition:'width .35s, background .35s', padding:0,
          }} />
        ))}
      </div>
    </div>
  );
}


// ─── Props ────────────────────────────────────────────────────────────────────
// dark : boolean — controlled from parent (App), no longer owned here
export default function Dashboard({ dark }) {
  const { t, i18n } = useTranslation();

  const [products,      setProducts]      = useState([]);
  const [sales,         setSales]         = useState([]);
  const [stockHistory,  setStockHistory]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [backendOk,     setBackendOk]     = useState(true);
  const [now,           setNow]           = useState(new Date());

  // Inject global CSS once
  useEffect(() => {
    const id = 'abk-dashboard-css';
    let tag = document.getElementById(id);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = id;
      document.head.appendChild(tag);
    }
    tag.innerHTML = GLOBAL_CSS;
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [p, s, h] = await Promise.all([
        getProducts().catch(() => []),
        getSales().catch(() => []),
        getStockHistory().catch(() => []),
      ]);
      setProducts(p); setSales(s); setStockHistory(h);
      setBackendOk(true);
    } catch {
      setBackendOk(false);
    } finally {
      setLoading(false);
    }
  }

  const todayStr   = localYMD();
  const todaySales = sales.filter(s => String(s.saleDate).slice(0, 10) === todayStr);
  const todayCount = todaySales.length;
  const todayUnits = todaySales.reduce((a, x) => a + (x.quantity ?? 0), 0);

  const inStock  = products.filter(p => p.status === 'IN_STOCK').length;
  const lowStock = products.filter(p => p.status === 'LOW_STOCK').length;
  const outStock = products.filter(p => p.status === 'OUT_OF_STOCK').length;

  // ── Inventory tracking core formulas ─────────────────────────────────
  // Added Stock = sum of all positive stock additions ever recorded
  // Sold Stock  = sum of all units sold (all sales)
  // Remaining Stock = Added Stock − Sold Stock  (≈ current product.stock)
  // Unsold Value    = Price × Remaining Quantity, summed per product
  const totalStock  = products.reduce((a, p) => a + (p.stock ?? 0), 0);
  const unitsSold   = sales.reduce((a, s) => a + (s.quantity ?? 0), 0);

  const unsoldItems = products.reduce((a, p) => a + (p.stock ?? 0), 0); // Remaining Stock per product
  const unsoldValue = products.reduce((a, p) => a + (p.price ?? 0) * (p.stock ?? 0), 0); // Unsold Value

  // ── Loans ──────────────────────────────────────────────────────────
  const loanSales        = sales.filter(s => (s.remainingLoan ?? 0) > 0);
  const outstandingLoans = loanSales.reduce((a, s) => a + (s.remainingLoan ?? 0), 0);

  const recentSales   = sales.slice(0, 5);
  const alertProducts = products.filter(p => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK').slice(0, 5);

  // ── Stock movement (most recent stock history entries) ────────────────
  const recentMovement = [...stockHistory]
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00:00'}`) - new Date(`${a.date}T${a.time || '00:00:00'}`))
    .slice(0, 5);

  const topProduct = (() => {
    const map = {};
    sales.forEach(s => { const n = s.product?.name ?? '—'; map[n] = (map[n] ?? 0) + (s.quantity ?? 0); });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length ? { name: sorted[0][0], units: sorted[0][1] } : null;
  })();

  const donutSegments = [
    { label: t('stock.inStock'),    value: inStock,  color: dark ? '#3DD68C' : '#34d399' },
    { label: t('stock.lowStock'),   value: lowStock, color: dark ? '#58A6FF' : '#60a5fa' },
    { label: t('stock.outOfStock'), value: outStock, color: dark ? '#A78BFA' : '#a78bfa' },
  ];

  const hour     = now.getHours();
  const greeting = hour < 12 ? t('dashboard.greeting_morning')
                 : hour < 17 ? t('dashboard.greeting_afternoon')
                 :              t('dashboard.greeting_evening');
  const locale   = i18n.language === 'am' ? 'am-ET' : 'en-US';

  const greetingSlides = [
    { label: t('dashboard.sliderLabel1'), message: t('dashboard.sliderMsg1'), color: dark ? '#3DD68C' : '#1D9E75' },
    { label: t('dashboard.sliderLabel2'), message: t('dashboard.sliderMsg2'), color: dark ? '#58A6FF' : '#185FA5' },
    { label: t('dashboard.sliderLabel3'), message: t('dashboard.sliderMsg3'), color: dark ? '#A78BFA' : '#534AB7' },
    { label: t('dashboard.sliderLabel4'), message: t('dashboard.sliderMsg4'), color: dark ? '#F0A742' : '#854F0B' },
  ];

  const features = [
    { Icon: Package,      color: dark ? '#3DD68C' : '#2EC68F', bg: dark ? 'rgba(61,214,140,.14)' : 'rgba(46,198,143,.16)',   title: t('dashboard.productsTitle'),    badge: t('dashboard.productsBadge'),    desc: t('dashboard.productsDesc')    },
    { Icon: ShoppingCart, color: dark ? '#58A6FF' : '#4D9AE0', bg: dark ? 'rgba(88,166,255,.14)' : 'rgba(77,154,224,.16)',   title: t('dashboard.salesTitle'),       badge: t('dashboard.salesBadge'),       desc: t('dashboard.salesDesc')       },
    { Icon: Landmark,     color: dark ? '#F0A742' : '#854F0B', bg: dark ? 'rgba(240,167,66,.14)'  : 'rgba(245,158,11,.16)',  title: t('dashboard.loansTitle'),       badge: t('dashboard.loansBadge'),       desc: t('dashboard.loansDesc')       },
    { Icon: History,      color: dark ? '#A78BFA' : '#8B82E8', bg: dark ? 'rgba(167,139,250,.14)': 'rgba(139,130,232,.16)',  title: t('dashboard.stockHistoryTitle'),badge: t('dashboard.stockHistoryBadge'),desc: t('dashboard.stockHistoryDesc') },
  ];

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background: dark ? '#0D1117' : '#F0F7E2', transition:'background .3s' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:34, height:34, border:'3px solid #D0E4B0', borderTopColor:'#1D9E75',
          borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:'#A8C080', fontSize:13 }}>{t('ui.loading')}</p>
      </div>
    </div>
  );

  return (
    <div className={`abk-dash abk-texture${dark ? ' abk-dark' : ''}`}
      style={{ background:'var(--cream)', minHeight:'100vh', position:'relative', transition:'background .3s' }}>

      <TickerBar products={products} unsoldValue={unsoldValue} outstandingLoans={outstandingLoans} topProduct={topProduct} t={t} />

      <div className="abk-dash-pad" style={{ position:'relative', zIndex:1, padding:'0 1.5rem 2.5rem' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="abk-anim-fade-up abk-dash-header-inner" style={{ padding:'1.25rem 0 0.9rem' }}>
          <div style={{
            fontSize:10.5, fontWeight:500, letterSpacing:'0.14em',
            textTransform:'uppercase', color:'var(--ink-light)',
            marginBottom:10, display:'flex', alignItems:'center', gap:6,
          }}>
            <span style={{ display:'inline-block', width:18, height:1.5, background:'var(--green)', borderRadius:1 }} />
            {t('dashboard.erpSubtitle')}
          </div>

          <GreetingSlider
            greeting={greeting}
            adminName={t('dashboard.adminName')}
            dark={dark}
            slides={greetingSlides}
            onRefresh={load}
            now={now}
            locale={locale}
          />
        </div>

        {/* ── KPI row ──────────────────────────────────────────────────── */}
        <div className="abk-dash-kpi-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:10, marginBottom:'1.1rem' }}>
          <KpiCard label={t('dashboard.totalStock')} value={totalStock}
            sub={`${t('dashboard.acrossProducts', { count: products.length })}`} Icon={Boxes}
            stripeColor="var(--green)" iconBg="var(--green-bg)" iconColor="var(--green)"
            progPct={totalStock > 0 ? 68 : 2} delay=".06s" />
          <KpiCard label={t('dashboard.soldItems')} value={unitsSold}
            sub={`${todayUnits} ${t('dashboard.soldToday')}`} Icon={ShoppingCart}
            stripeColor="var(--blue)" iconBg="var(--blue-bg)" iconColor="var(--blue)"
            progPct={unitsSold > 0 ? 82 : 2} delay=".13s" />
          <KpiCard label={t('dashboard.unsoldItems')} value={unsoldItems}
            sub={`$${fmt(unsoldValue)} ${t('dashboard.unsoldValue')}`} Icon={Package}
            stripeColor="var(--purple)" iconBg="var(--purple-bg)" iconColor="var(--purple)"
            progPct={100} delay=".20s" />
          <KpiCard label={t('dashboard.outstandingLoans')} value={`$${fmt(outstandingLoans)}`}
            sub={`${loanSales.length} ${t('dashboard.loanAccounts')}`} Icon={Landmark}
            stripeColor="var(--amber)" iconBg="var(--amber-bg)" iconColor="var(--amber)"
            progPct={outstandingLoans > 0 ? 75 : 2} delay=".27s" />
        </div>

        {/* ── Secondary metric chips ──────────────────────────────────── */}
        <div className="abk-dash-nav-5" style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:8, marginBottom:'1.1rem' }}>
          <MetricChip label={t('dashboard.metricInStock')}    value={inStock}                    change={t('dashboard.metricHealthy')}    changeUp={true}  delay=".32s" />
          <MetricChip label={t('dashboard.metricLowStock')}   value={lowStock}                   change={lowStock > 0 ? t('dashboard.metricNeedsRestock') : t('dashboard.metricHealthy')} changeUp={lowStock === 0} delay=".38s" />
          <MetricChip label={t('dashboard.metricOutOfStock')} value={outStock}                   change={outStock > 0 ? t('dashboard.metricNeedsRestock') : t('dashboard.metricHealthy')} changeUp={outStock === 0} delay=".44s" />
          <MetricChip label={t('dashboard.metricTopProduct')} value={topProduct?.name ?? '—'}    change={topProduct ? `${topProduct.units} ${t('stock.units')}` : '—'} changeUp={null} delay=".50s" />
        </div>

        {/* ── Middle grid ─────────────────────────────────────────────── */}
        <div className="abk-dash-mid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,2fr)', gap:10, marginBottom:'1.1rem' }}>

          <div className="abk-anim-scale-in" style={{
            background:'var(--card)', border:'1px solid var(--border)',
            borderRadius:14, padding:'1.15rem', animationDelay:'.28s',
            transition:'background .3s, border-color .3s',
          }}>
            <div style={{ marginBottom:14 }}>
              <div className="abk-serif" style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>{t('dashboard.stockStatus')}</div>
              <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{products.length} {t('dashboard.productsTracked')}</div>
            </div>
            <div style={{ display:'flex', justifyContent:'center', margin:'6px 0 14px' }}>
              <DonutChart segments={donutSegments} total={products.length} />
            </div>
            {donutSegments.map(seg => {
              const pct = products.length > 0 ? Math.round((seg.value / products.length) * 100) : 0;
              return (
                <div key={seg.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderTop:'1px solid var(--border-light)' }}>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:seg.color }} />
                    <span style={{ fontSize:11.5, color:'var(--ink-light)', marginLeft:7, fontWeight:300 }}>{seg.label}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:500, color:'var(--ink)' }}>{seg.value}</span>
                    <span style={{ fontSize:10.5, fontWeight:500, minWidth:30, textAlign:'right', color:seg.color }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="abk-anim-scale-in" style={{
            background:'var(--card)', border:'1px solid var(--border)',
            borderRadius:14, padding:'1.15rem', animationDelay:'.35s',
            transition:'background .3s, border-color .3s',
          }}>
            <div style={{ marginBottom:14 }}>
              <div className="abk-serif" style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>{t('dashboard.recentSales')}</div>
              <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{t('dashboard.lastTransactions', { count: recentSales.length })}</div>
            </div>
            {recentSales.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'2rem 0', color:'var(--ink-faint)' }}>
                <ShoppingCart size={28} style={{ marginBottom:8 }} />
                <p style={{ fontSize:13 }}>{t('dashboard.noSalesYet')}</p>
              </div>
            ) : recentSales.map(s => (
              <div key={s.id} className="abk-row-hover" style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'7px 9px', borderRadius:8, background:'var(--cream-deep)', marginBottom:5,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:'var(--green-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <ShoppingCart size={13} color="var(--green)" />
                  </div>
                  <div>
                    <div style={{ fontSize:12.5, fontWeight:500, color:'var(--ink)' }}>{s.product?.name ?? '—'}</div>
                    <div style={{ fontSize:10.5, color:'var(--ink-faint)', marginTop:1, fontWeight:300 }}>{s.quantity} {t('sales.availableUnit')} · {s.saleDate}</div>
                  </div>
                </div>
                <div style={{ fontSize:12.5, fontWeight:500, color:'var(--green)' }}>${fmt(s.total)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom row ──────────────────────────────────────────────── */}
        <div className="abk-dash-bot-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:10 }}>

          <div className="abk-anim-fade-up" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:'1.15rem', animationDelay:'.42s', transition:'background .3s, border-color .3s' }}>
            <div style={{ marginBottom:14 }}>
              <div className="abk-serif" style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>{t('dashboard.stockAlerts')}</div>
              <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{t('dashboard.productsNeedAttention')}</div>
            </div>
            {alertProducts.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'1.5rem 0', color:'var(--ink-faint)' }}>
                <CheckCircle size={24} style={{ marginBottom:8, color:'var(--green)' }} />
                <p style={{ fontSize:12 }}>{t('dashboard.allProductsStocked')}</p>
              </div>
            ) : alertProducts.map(p => {
              const isOut = p.status === 'OUT_OF_STOCK';
              return (
                <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 9px', borderRadius:8, marginBottom:5,
                  background: isOut ? 'var(--red-bg)' : 'var(--yellow-bg)',
                  border: isOut ? '1px solid var(--red-border)' : '1px solid var(--yellow-border)' }}>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <AlertTriangle size={13} style={{ marginRight:6, flexShrink:0, color: isOut ? 'var(--red-text)' : 'var(--yellow-text)' }} />
                    <div>
                      <div style={{ fontSize:12.5, fontWeight:500, color: isOut ? 'var(--red-text)' : 'var(--yellow-text)' }}>{p.name}</div>
                      <div style={{ fontSize:10.5, marginTop:1, fontWeight:300, opacity:.75, color: isOut ? 'var(--red-text)' : 'var(--yellow-text)' }}>{t('products.sku')}: {p.sku}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:10.5, fontWeight:500, padding:'2px 9px', borderRadius:20, background: isOut ? 'var(--red-border)' : 'var(--yellow-border)', color: isOut ? 'var(--red-text)' : 'var(--yellow-text)' }}>
                    {p.stock} {t('stock.units')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="abk-anim-fade-up" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:'1.15rem', animationDelay:'.49s', transition:'background .3s, border-color .3s' }}>
            <div style={{ marginBottom:14 }}>
              <div className="abk-serif" style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>{t('dashboard.quickSummary')}</div>
              <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{t('dashboard.inventoryOverview')}</div>
            </div>
            {[
              { label:t('dashboard.todaySales'),       value:todayCount,            unit:t('dashboard.transactions'), color:'var(--blue)'   },
              { label:t('dashboard.soldToday'),        value:todayUnits,            unit:t('stock.units'),            color:'var(--green)'  },
              { label:t('dashboard.totalProducts'),    value:products.length,       unit:t('dashboard.items'),        color:'var(--purple)' },
              { label:t('dashboard.unsoldItems'),      value:unsoldItems,           unit:t('stock.units'),            color:'var(--amber)'  },
              { label:t('dashboard.outstandingLoans'), value:`$${fmt(outstandingLoans)}`, unit:'',                     color:'var(--red-text)' },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border-light)' }}>
                <span style={{ fontSize:12, color:'var(--ink-light)', fontWeight:300 }}>{item.label}</span>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:12.5, fontWeight:500, color:item.color }}>{item.value}</div>
                  {item.unit && <div style={{ fontSize:10, color:'var(--ink-faint)' }}>{item.unit}</div>}
                </div>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10.5, color:'var(--ink-faint)', marginTop:10, paddingTop:9, borderTop:'1px solid var(--border-light)', fontWeight:300 }}>
              <Clock size={11} />
              {t('dashboard.updatedAt')} {now.toLocaleTimeString(locale, { hour:'2-digit', minute:'2-digit' })}
            </div>
          </div>

          <div className="abk-anim-fade-up" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:'1.15rem', animationDelay:'.56s', transition:'background .3s, border-color .3s' }}>
            <div style={{ marginBottom:14 }}>
              <div className="abk-serif" style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>{t('dashboard.stockMovement')}</div>
              <div style={{ fontSize:11, color:'var(--ink-faint)', marginTop:2, fontWeight:300 }}>{t('dashboard.recentMovementSub')}</div>
            </div>
            {recentMovement.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'1.5rem 0', color:'var(--ink-faint)' }}>
                <History size={24} style={{ marginBottom:8 }} />
                <p style={{ fontSize:12 }}>{t('dashboard.noMovement')}</p>
              </div>
            ) : recentMovement.map((h, i) => {
              const isPositive = (h.quantityChange ?? 0) > 0;
              const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
              return (
                <div key={h.id ?? i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border-light)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Icon size={13} color={isPositive ? 'var(--green)' : 'var(--red-text)'} />
                    <div>
                      <div style={{ fontSize:12, color:'var(--ink-mid)', fontWeight:400 }}>{h.product?.name ?? '—'}</div>
                      <div style={{ fontSize:10.5, color:'var(--ink-faint)', marginTop:1, fontWeight:300 }}>{h.type} · {h.date}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:12.5, fontWeight:500, color: isPositive ? 'var(--green)' : 'var(--red-text)' }}>
                    {isPositive ? '+' : ''}{h.quantityChange ?? 0}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── "What This ERP Does" panel ───────────────────────────────── */}
        <div className="abk-anim-fade-up" style={{ marginTop:'1.1rem', background:'var(--feat-bg)', borderRadius:14, padding:'1.4rem 1.6rem', animationDelay:'.62s', transition:'background .3s', border: dark ? '1px solid rgba(88,166,255,.1)' : 'none' }}>
          <div style={{ marginBottom:20 }}>
            <div className="abk-serif" style={{ fontSize:18, fontWeight:500, color:'var(--feat-fg)', letterSpacing:-0.3, display:'flex', alignItems:'center', gap:9 }}>
              <span style={{ display:'inline-block', width:3, height:18, background:'var(--green)', borderRadius:2 }} />
              {t('dashboard.whatErpDoes')}
            </div>
            <div style={{ fontSize:12, color:'var(--feat-desc)', marginTop:8, fontWeight:300, lineHeight:1.7 }}>
              {t('dashboard.erpDescription')}
            </div>
          </div>
          <div className="abk-dash-feat-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:10 }}>
            {features.map(card => (
              <div key={card.title} className="abk-feat-card" style={{ background:'var(--feat-card)', border:'1px solid var(--feat-border)', borderRadius:11, padding:'14px 14px 16px' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:card.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                  <card.Icon size={18} color={card.color} />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8, flexWrap:'wrap' }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--feat-fg)' }}>{card.title}</div>
                  <span style={{ fontSize:9.5, fontWeight:600, letterSpacing:'0.07em', padding:'1px 8px', borderRadius:20, background:card.bg, color:card.color, textTransform:'uppercase' }}>
                    {card.badge}
                  </span>
                </div>
                <div style={{ fontSize:11.5, color:'var(--feat-desc)', fontWeight:300, lineHeight:1.7 }}>{card.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:18, paddingTop:14, borderTop: dark ? '1px solid rgba(88,166,255,.08)' : '1px solid rgba(255,255,255,.07)', fontSize:11, color: dark ? 'rgba(91,143,179,.5)' : 'rgba(168,192,128,.45)', fontWeight:300, letterSpacing:'0.02em' }}>
            {t('dashboard.erpFooter')}
          </div>
        </div>

      </div>
    </div>
  );
}
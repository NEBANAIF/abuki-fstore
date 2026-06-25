/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Sidebar.jsx — Role-aware navigation sidebar
 *
 *  ADMIN:  sees all nav items (Dashboard, Products, Sales, Loans,
 *          Stock History, User Access)
 *  WORKER: sees only Products and Sales
 *          Other items are completely hidden from the sidebar (not just disabled)
 *
 *  Role badge is color coded:
 *    ADMIN  → green
 *    WORKER → blue/amber
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart,
  Clock, Users, LogOut, ChevronRight, Moon, Sun, Languages,
  Shield, Briefcase, Landmark,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Full navigation list — each item has an optional `adminOnly` flag.
 * If `adminOnly: true`, the item is hidden from WORKER-role users.
 */
const NAV = [
  { key: 'dashboard', i18n: 'nav.dashboard', icon: LayoutDashboard, adminOnly: true  },
  { key: 'products',  i18n: 'nav.products',  icon: Package,          adminOnly: false },
  { key: 'sales',     i18n: 'nav.sales',     icon: ShoppingCart,     adminOnly: false },
  { key: 'loans',     i18n: 'nav.loans',     icon: Landmark,         adminOnly: false },
  { key: 'stock',     i18n: 'nav.stock',     icon: Clock,            adminOnly: true  },
  { key: 'users',     i18n: 'nav.users',     icon: Users,            adminOnly: true  },
];

export default function Sidebar({ current, setCurrent, user, onLogout, dark, onDarkToggle, open }) {
  const { t, i18n } = useTranslation();

  function toggleLang() {
    const next = i18n.language === 'am' ? 'en' : 'am';
    void i18n.changeLanguage(next);
    try { localStorage.setItem('abuki_lang', next); } catch {}
  }

  const roleKey  = user?.role?.toUpperCase() || 'VIEWER';
  const isWorker = roleKey === 'WORKER';
  const isAdmin  = roleKey === 'ADMIN';
  const headerBg = dark ? '#090D14' : '#0F1F04';

  // Filter the nav items based on user role
  // WORKER only sees items where adminOnly = false
  const visibleNav = NAV.filter(item => {
    if (isAdmin)  return true;          // admin sees everything
    if (isWorker) return !item.adminOnly; // worker only sees non-admin items
    return false;                        // unknown role sees nothing
  });

  return (
    <aside className={`abk-sidebar${dark ? ' abk-dark' : ''}${open ? ' open' : ''}`}>

      {/* ── Brand header ── */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: '1px solid var(--abk-border)',
        position: 'relative', zIndex: 1,
        background: headerBg,
        transition: 'background .3s',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: dark ? 'rgba(88,166,255,.12)' : 'rgba(255,255,255,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: dark ? '1px solid rgba(61,214,140,.25)' : '1px solid rgba(255,255,255,.12)',
            overflow: 'hidden',
          }}>
            <img
              src="/logo.png"
              alt="Stokio logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 15, fontWeight: 500,
              color: dark ? '#E6EDF3' : '#F0F7E2',
              letterSpacing: -0.3, lineHeight: 1.2,
            }}>My stock</div>
            <div style={{
              fontSize: 10, fontWeight: 300, marginTop: 1,
              color: dark ? '#5A7A96' : '#A8C080',
            }}>
              {i18n.language === 'am' ? 'የችርቻሮ ሥርዓት' : 'Retail operations'}
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={onDarkToggle}
            style={{
              width: 28, height: 28, borderRadius: 7, border: 'none',
              background: dark ? 'rgba(88,166,255,.12)' : 'rgba(255,255,255,.08)',
              color: dark ? '#58A6FF' : '#A8C080',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              transition: 'background .2s',
            }}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>

        {/* Live status + role indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Live dot */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 10.5, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
            background: dark ? 'rgba(61,214,140,.08)' : 'rgba(255,255,255,.07)',
            color: dark ? '#3DD68C' : '#A8C080',
            border: dark ? '1px solid rgba(61,214,140,.2)' : '1px solid rgba(255,255,255,.1)',
          }}>
            <span className="abk-pulse" style={{
              width: 6, height: 6, borderRadius: '50%',
              background: dark ? '#3DD68C' : '#2EC68F',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 10, letterSpacing: '0.06em' }}>
              {t('dashboard.live')}
            </span>
          </div>

          {/* Role badge — shown prominently in header */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 9.5, fontWeight: 700, padding: '4px 8px', borderRadius: 20,
            letterSpacing: '0.08em',
            // Green for ADMIN, amber for WORKER
            background: isAdmin
              ? (dark ? 'rgba(61,214,140,.12)' : 'rgba(255,255,255,.08)')
              : (dark ? 'rgba(251,191,36,.12)'  : 'rgba(255,255,255,.07)'),
            color: isAdmin
              ? (dark ? '#3DD68C' : '#A8C080')
              : (dark ? '#FBBf24' : '#D4A820'),
            border: isAdmin
              ? (dark ? '1px solid rgba(61,214,140,.25)' : '1px solid rgba(255,255,255,.15)')
              : (dark ? '1px solid rgba(251,191,36,.25)'  : '1px solid rgba(255,255,255,.1)'),
          }}>
            {/* Shield icon for admin, briefcase for worker */}
            {isAdmin ? <Shield size={9} /> : <Briefcase size={9} />}
            {roleKey}
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        flex: 1, padding: '10px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 2,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--abk-ink-faint)',
          padding: '6px 12px 4px', marginBottom: 2,
        }}>
          {i18n.language === 'am' ? 'ዋና ምናሌ' : 'Main Menu'}
        </div>

        {/* Only render nav items allowed for this role */}
        {visibleNav.map(({ key, i18n: ns, icon: Icon }, idx) => {
          const active = current === key;
          return (
            <button
              key={key}
              className={`abk-nav-btn abk-anim-slide-in${active ? ' active' : ''}`}
              style={{ animationDelay: `${0.06 + idx * 0.05}s` }}
              onClick={() => setCurrent(key)}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active
                  ? (dark ? 'rgba(61,214,140,.12)' : 'rgba(29,158,117,.12)')
                  : 'transparent',
                transition: 'background .2s',
              }}>
                <Icon size={15} color={active ? (dark ? '#3DD68C' : '#1D9E75') : 'var(--abk-nav-idle-fg)'} />
              </div>
              <span style={{ flex: 1 }}>{t(ns)}</span>
              {active && <ChevronRight size={13} style={{ opacity: .5, color: 'var(--abk-nav-active-fg)' }} />}
            </button>
          );
        })}

        {/* Worker info note — tells them what they have access to */}
        {isWorker && (
          <div style={{
            marginTop: 10, padding: '10px 12px', borderRadius: 10,
            background: dark ? 'rgba(251,191,36,.06)' : 'rgba(0,0,0,.04)',
            border: dark ? '1px solid rgba(251,191,36,.15)' : '1px solid rgba(0,0,0,.07)',
          }}>
            <div style={{
              fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: dark ? '#FBBf24' : '#A07A10',
              marginBottom: 4,
            }}>
              Worker Access
            </div>
            <div style={{ fontSize: 10, color: 'var(--abk-ink-faint)', lineHeight: 1.5 }}>
              • View products (read only)<br />
              • View &amp; record today's sales<br />
              • Cannot delete sales
            </div>
          </div>
        )}
      </nav>

      {/* ── Footer ── */}
      <div style={{
        padding: '10px 10px 14px',
        borderTop: '1px solid var(--abk-border)',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: 4,
        flexShrink: 0,
      }}>
        <button className="abk-util-btn" onClick={toggleLang}>
          <Languages size={14} color="var(--abk-ink-faint)" />
          <span>{i18n.language === 'am' ? t('ui.english') : t('ui.amharic')}</span>
        </button>

        {/* User card */}
        <div style={{
          background: 'var(--abk-cream-deep)',
          border: '1px solid var(--abk-border)',
          borderRadius: 10, padding: '9px 11px',
          display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--abk-ticker-bg)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: dark ? '1px solid rgba(61,214,140,.2)' : 'none',
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              color: 'var(--abk-ticker-fg)',
              fontWeight: 600, fontSize: 13, fontStyle: 'italic',
            }}>
              {(user?.name || 'A')[0].toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12.5, fontWeight: 500, color: 'var(--abk-ink)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{user?.name || 'Admin'}</div>
            <div style={{
              fontSize: 10, color: 'var(--abk-ink-faint)', fontWeight: 300,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{user?.email}</div>
            {/* Role badge — color coded */}
            <span style={{
              display: 'inline-block', fontSize: 9.5, fontWeight: 600,
              letterSpacing: '0.06em', padding: '1px 7px', borderRadius: 20,
              textTransform: 'uppercase', marginTop: 2,
              // Green for ADMIN, amber for WORKER
              background: isAdmin
                ? (dark ? 'rgba(61,214,140,.15)' : '#D4EDDA')
                : (dark ? 'rgba(251,191,36,.15)'  : '#FFF3CD'),
              color: isAdmin
                ? (dark ? '#3DD68C' : '#155724')
                : (dark ? '#FBBf24' : '#856404'),
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="abk-divider" />

        <button className="abk-util-btn danger" onClick={() => onLogout?.()}>
          <LogOut size={14} />
          <span>{t('ui.signOut')}</span>
        </button>

        <div style={{
          fontSize: 9.5, color: 'var(--abk-ink-faint)', fontWeight: 300,
          textAlign: 'center', paddingTop: 4, letterSpacing: '0.04em',
        }}>
          {t('settings.version')}
        </div>
      </div>
    </aside>
  );
}

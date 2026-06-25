/**
 * ─────────────────────────────────────────────────────────────────────────
 *  App.jsx — Root component with role-based page access
 *
 *  ROLES:
 *    ADMIN  → full access: dashboard, products, sales, finance, analytics,
 *             stock history, user management
 *    WORKER → restricted access: products (view only), sales (today only,
 *             no delete, can record new sale)
 *             All other pages redirect to "sales" automatically
 *
 *  The `user` object (from localStorage / login response) is passed to every
 *  page and sidebar so they can adapt their UI accordingly.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';
import Login        from './pages/Login';
import Layout       from './components/Layout';
import Dashboard    from './pages/Dashboard';
import Products     from './pages/Products';
import Sales        from './pages/Sales';
import StockHistory from './pages/StockHistory';
import UserAccess   from './pages/UserAccess';
import Loans        from './pages/Loans';
import LoginHistory from './pages/LoginHistory';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://abuki-backend.onrender.com';

/**
 * Pages that a WORKER role is allowed to navigate to.
 * Any other page key will be redirected to 'sales'.
 */
const WORKER_ALLOWED_PAGES = ['sales', 'products', 'loans'];

export default function App() {
  // ── Restore user from localStorage on first render ───────────────────
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('abuki_user');
      const token  = localStorage.getItem('abuki_token');
      return stored && token ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // ── Default page depends on role ─────────────────────────────────────
  const [current, setCurrent] = useState('dashboard');

  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('abuki_theme') === 'dark'; } catch { return false; }
  });

  // ── Apply dark class to <html> ────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('abuki_theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  // ── Keep-alive ping every 4 minutes to prevent Render cold starts ──────
  //
  // WHY no `mode: 'no-cors'`:
  //   `no-cors` silently swallows the response, so the browser never actually
  //   opens a real HTTP connection to the backend — Render never sees it and
  //   the service still goes to sleep. A plain fetch() sends a real request
  //   that Render counts as activity. We silence errors so a sleeping backend
  //   doesn't surface anything to the user.
  //
  // WHY 4 minutes (not 2):
  //   Render free tier sleeps after 15 minutes of inactivity. 4-minute pings
  //   keep it warm with plenty of margin and reduce unnecessary requests.
  //
  useEffect(() => {
    const ping = () => fetch(`${BACKEND}/actuator/health`).catch(() => {});
    ping(); // immediate ping on mount so backend is warm before first real request
    const id = setInterval(ping, 4 * 60_000);
    return () => clearInterval(id);
  }, []);

  // ── When user role changes, redirect workers to their allowed landing ──
  useEffect(() => {
    if (user) {
      const isWorker = user.role?.toUpperCase() === 'WORKER';
      if (isWorker) {
        // Workers always start on and are redirected back to 'sales'
        setCurrent('sales');
      }
    }
  }, [user]);

  /**
   * Smart page setter — enforces WORKER restrictions.
   * If a WORKER tries to navigate to a forbidden page, silently redirect
   * them back to 'sales' instead.
   */
  function setCurrentGuarded(pageKey) {
    if (user?.role?.toUpperCase() === 'WORKER') {
      if (!WORKER_ALLOWED_PAGES.includes(pageKey)) {
        setCurrent('sales'); // silently redirect
        return;
      }
    }
    setCurrent(pageKey);
  }

  // ── Login handler ─────────────────────────────────────────────────────
  function handleLogin(data) {
    const u = { id: data.id, name: data.name, email: data.email, role: data.role };
    setUser(u);
    localStorage.setItem('abuki_user', JSON.stringify(u));
    localStorage.setItem('abuki_token', data.token);

    // Redirect workers to sales immediately after login
    const isWorker = data.role?.toUpperCase() === 'WORKER';
    setCurrent(isWorker ? 'sales' : 'dashboard');
  }

  // ── Logout handler ────────────────────────────────────────────────────
  function handleLogout() {
    localStorage.removeItem('abuki_token');
    localStorage.removeItem('abuki_user');
    setUser(null);
    setCurrent('dashboard');
    window.location.href = '/';
  }

  // ── Not logged in → show Login page ──────────────────────────────────
  if (!user) return <Login onLogin={handleLogin} />;

  const isWorker = user.role?.toUpperCase() === 'WORKER';
  const isAdmin  = user.role?.toUpperCase() === 'ADMIN';

  /**
   * Page map — pass user down to every page.
   * Pages use `user` prop to show/hide buttons and apply restrictions.
   *
   * Workers only see 'products' and 'sales'.
   * Admin sees all modules (Dashboard, Products, Sales, Loans, Stock History, Users).
   */
  const pages = {
    // ── Both roles ──────────────────────────────────────────────────────
    products: <Products  dark={dark} user={user} />,
    sales:    <Sales     dark={dark} user={user} />,
    loans:    <Loans     dark={dark} user={user} />,

    // ── Admin only ──────────────────────────────────────────────────────
    ...(isAdmin && {
      dashboard: <Dashboard    dark={dark} user={user} />,
      stock:     <StockHistory dark={dark} user={user} />,
      users:     <UserAccess   dark={dark} user={user} />,
      loginHistory: <LoginHistory dark={dark} user={user} />,
    }),
  };

  return (
    <Layout
      current={current}
      setCurrent={setCurrentGuarded}   // ← guarded version prevents WORKER from accessing admin pages
      user={user}
      onLogout={handleLogout}
      dark={dark}
      onDarkToggle={() => setDark(d => !d)}
    >
      {/* Render page — fallback to Sales for workers, Dashboard for admins */}
      {pages[current] || (isWorker ? <Sales dark={dark} user={user} /> : <Dashboard dark={dark} user={user} />)}
    </Layout>
  );
}

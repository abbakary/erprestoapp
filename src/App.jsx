import React, { useState, useEffect, useContext } from 'react';
import { Landing } from './screens/Landing';
import { Auth } from './screens/Auth';
import { Customer } from './screens/Customer';
import { Waiter } from './screens/Waiter';
import { KDS } from './screens/KDS';
import { Cashier } from './screens/Cashier';
import { Inventory } from './screens/Inventory';
import { Manager } from './screens/Manager';
import { HQ } from './screens/HQ';
import { Production } from './screens/Production';
import Accounting from './screens/Accounting';
import HR from './screens/HR';
import { Ctx } from './store';
import { USERS, WAITERS } from './data';

/* ── Module launcher shown after login for manager/owner roles ── */
const MODULES = [
  { id: 'pos',        label: 'Point of Sale',   icon: '🍽️',  color: '#e67e22', roles: ['cashier','waiter','manager','owner'] },
  { id: 'kitchen',    label: 'Kitchen Display',  icon: '👨‍🍳',  color: '#8e44ad', roles: ['chef','manager','owner'] },
  { id: 'inventory',  label: 'Inventory',        icon: '📦',  color: '#2980b9', roles: ['storekeeper','manager','owner'] },
  { id: 'production', label: 'Production',       icon: '🏭',  color: '#16a085', roles: ['production','manager','owner'] },
  { id: 'accounting', label: 'Accounting',       icon: '💲',  color: '#1C7A4B', roles: ['manager','owner'] },
  { id: 'hr',         label: 'Human Resources',  icon: '👤',  color: '#875A7B', roles: ['manager','owner'] },
  { id: 'manager',    label: 'Manager',          icon: '📊',  color: '#c0392b', roles: ['manager','owner'] },
  { id: 'hq',         label: 'HQ / Owner',       icon: '🌍',  color: '#2c3e50', roles: ['owner'] },
];

function ModuleLauncher({ sess, onLaunch, onOut }) {
  const visibleModules = MODULES.filter(m => m.roles.includes(sess?.role));
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: '#c0392b', color: '#fff', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🍽️</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>RestoERP</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, opacity: 0.9 }}>Safari Grill &amp; Lounge</span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
            {sess?.name?.[0]}
          </div>
          <button onClick={onOut} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Welcome, {sess?.name}</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{sess?.title || `Role: ${sess?.role}`} · Safari Grill &amp; Lounge · Masaki</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {visibleModules.map(mod => (
            <button key={mod.id} onClick={() => onLaunch(mod.id)}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all .15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = mod.color; e.currentTarget.style.boxShadow = `0 4px 20px ${mod.color}30`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: mod.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                {mod.icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>{mod.label}</span>
            </button>
          ))}
        </div>

        {/* Quick stats strip */}
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            { label: 'Open Orders', value: '3', icon: '🍽️', color: '#e67e22' },
            { label: 'Pending Bills', value: '2', icon: '📄', color: '#c0392b' },
            { label: 'Active Staff', value: '10', icon: '👤', color: '#1C7A4B' },
            { label: 'Today Revenue', value: 'TSh 284K', icon: '💰', color: '#875A7B' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { S } = useContext(Ctx);

  const [v, setV] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('resto_v')) || 'land'; }
    catch { return 'land'; }
  });
  const [sess, setSess] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('resto_sess')) || null; }
    catch { return null; }
  });
  const [via, setVia] = useState(null);
  // track which module is active when using launcher
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      let token = searchParams.get('w') || searchParams.get('token');
      const tableParam = searchParams.get('table') || searchParams.get('tb');
      if (token) {
        const matchingWaiter = (S.waiters || WAITERS).find(w => w.tok.toLowerCase() === token.toLowerCase());
        if (matchingWaiter) {
          setVia({ wid: matchingWaiter.id, token });
          if (!sess) {
            setSess({ id: 'guest_' + Date.now(), role: 'customer', name: 'Table Guest' });
            setV('customer');
          }
        }
      } else if (tableParam) {
        setVia(prev => ({ ...prev, tb: tableParam, qr: true }));
        if (!sess) {
          setSess({ id: 'guest_' + Date.now(), role: 'customer', name: `Guest (Table ${tableParam})` });
          setV('customer');
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('resto_v', JSON.stringify(v));
      sessionStorage.setItem('resto_sess', JSON.stringify(sess));
    } catch { /* ignore */ }
  }, [v, sess]);

  const done = user => { setSess(user); setV(user.role); setActiveModule(null); };
  const out  = () => { setSess(null); setVia(null); setV('land'); setActiveModule(null); };

  const handleDirectRoleLaunch = user => { setSess(user); setV(user.role); };

  const previewAsCustomer = wid => {
    setVia({ wid });
    setSess({ id: 'guest_' + Date.now(), role: 'customer', name: 'Preview Guest', backTo: sess });
    setV('customer');
  };

  const launchModule = (modId) => {
    setActiveModule(modId);
  };

  const exitModule = () => {
    setActiveModule(null);
  };

  /* ── LANDING ── */
  if (v === 'land' || (!sess && !v.startsWith('auth'))) {
    return <Landing go={setV} onDirectRole={handleDirectRoleLaunch} />;
  }

  /* ── AUTH ── */
  if (v.startsWith('auth')) {
    return <Auth mode0={v.split(':')[1] || 'register'} done={done} back={() => setV('land')} />;
  }

  /* ── CUSTOMER / TABLE QR ── */
  if (v === 'customer' || v === 'preview') {
    return <Customer sess={sess} out={out} via={via} setVia={setVia} setSess={setSess} setV={setV} />;
  }

  /* ── WAITER ── */
  if (v === 'waiter') {
    return <Waiter sess={sess} out={out} preview={previewAsCustomer} setSess={setSess} setV={setV} />;
  }

  /* ── CHEF / KDS ── */
  if (v === 'chef') {
    return <KDS sess={sess} out={out} setSess={setSess} setV={setV} />;
  }

  /* ── CASHIER ── */
  if (v === 'cashier') {
    return <Cashier sess={sess} out={out} setSess={setSess} setV={setV} />;
  }

  /* ── STOREKEEPER ── */
  if (v === 'storekeeper') {
    return <Inventory sess={sess} out={out} setSess={setSess} setV={setV} />;
  }

  /* ── PRODUCTION ── */
  if (v === 'production') {
    return <Production sess={sess} out={out} setSess={setSess} setV={setV} />;
  }

  /* ── MANAGER / OWNER — Module Launcher ── */
  if (v === 'manager' || v === 'owner') {
    // If a module is active, render it
    if (activeModule === 'accounting') {
      return <Accounting sess={sess} out={exitModule} />;
    }
    if (activeModule === 'hr') {
      return <HR sess={sess} out={exitModule} />;
    }
    if (activeModule === 'manager') {
      return <Manager sess={sess} out={exitModule} setSess={setSess} setV={setV} />;
    }
    if (activeModule === 'hq') {
      return <HQ sess={sess} out={exitModule} setSess={setSess} setV={setV} />;
    }
    if (activeModule === 'pos') {
      return <Cashier sess={sess} out={exitModule} setSess={setSess} setV={setV} />;
    }
    if (activeModule === 'kitchen') {
      return <KDS sess={sess} out={exitModule} setSess={setSess} setV={setV} />;
    }
    if (activeModule === 'inventory') {
      return <Inventory sess={sess} out={exitModule} setSess={setSess} setV={setV} />;
    }
    if (activeModule === 'production') {
      return <Production sess={sess} out={exitModule} setSess={setSess} setV={setV} />;
    }
    // No module selected — show launcher
    return <ModuleLauncher sess={sess} onLaunch={launchModule} onOut={out} />;
  }

  // Fallback
  return <Cashier sess={sess} out={out} setSess={setSess} setV={setV} />;
}

import React, { useState, useContext } from 'react';
import { LB, M, SEATS, ST, fmt, tot, calcNet, calcTax, SITES, USERS } from '../data';
import { Ctx } from '../store';

export let DP = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    DP = e;
  });
}

export const Pill = ({ st }) => {
  const label = LB[st] || st;
  return <span className={`pill ${st}`}>{label}</span>;
};

export function Sheet({ onClose, c, children, title, t, subtitle, maxWidth = 580, className = '', style = {}, extraHeader = null, bodyStyle = {} }) {
  const closeFn = onClose || c;
  const modalTitle = title || t;
  return (
    <div className="ov" onClick={closeFn}>
      <div
        className={`sh ${className}`}
        style={{
          maxWidth,
          transition: 'max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1), width 0.35s ease',
          ...style
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="grab" />
            {modalTitle && <h3 className="modal-title">{modalTitle}</h3>}
            {subtitle && <small className="modal-subtitle">{subtitle}</small>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {extraHeader}
            {closeFn && (
              <button className="modal-close-btn" onClick={closeFn} aria-label="Close dialog">
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="modal-body" style={bodyStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Install({ cls }) {
  const [sh, setSh] = useState(false);
  const go = async () => {
    if (DP) {
      DP.prompt();
      try {
        await DP.userChoice;
      } catch (e) {}
      DP = null;
    } else {
      setSh(true);
    }
  };

  return (
    <>
      <button className={cls || 'btn ghost'} onClick={go}>
        ⬇︎ Install App (PWA)
      </button>
      {sh && (
        <Sheet title="Install Safari Grill & Lounge" onClose={() => setSh(false)}>
          <div className="card" style={{ lineHeight: 1.6 }}>
            <p><b>iPhone / iPad (Safari):</b> Tap the Share button at bottom, then scroll and select <b>Add to Home Screen</b>.</p>
            <p><b>Android (Chrome):</b> Tap the 3 dots menu and select <b>Install app</b> or <b>Add to Home Screen</b>.</p>
            <p><small>Launches instantly in full-screen standalone mode with offline order caching.</small></p>
          </div>
        </Sheet>
      )}
    </>
  );
}

export const Hd = ({ t, s, r }) => (
  <div className="hd">
    <div>
      {s && <small>{s}</small>}
      <h1>{t}</h1>
    </div>
    {r && <div style={{ display: 'flex', gap: 6 }}>{r}</div>}
  </div>
);

/* ─── Role icon map ─────────────────────────────────── */
const ROLE_ICONS = {
  customer: { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, emoji:'🍽️' },
  waiter:   { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M16 4l2 2-2 2"/></svg>, emoji:'🧑‍🍳' },
  chef:     { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3C9 3 7 5 7 7.5c0 1 .4 2 1 2.7V19h8V10.2c.6-.7 1-1.7 1-2.7C17 5 15 3 12 3z"/><path d="M9 19v2h6v-2"/></svg>, emoji:'🍳' },
  cashier:  { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20M6 6V4M18 6V4"/></svg>, emoji:'💳' },
  storekeeper:{ svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, emoji:'📦' },
  production: { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4"/></svg>, emoji:'🏭' },
  manager:  { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, emoji:'👔' },
  owner:    { svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, emoji:'🏢' },
};

/* ─── MOBILE ROLES that hide the desktop topbar ──────── */
const MOBILE_ROLES = new Set(['customer','waiter','chef','cashier','storekeeper','production']);

/* ─── TopBar ─────────────────────────────────────────── */
export function TopBar({ sess, setSess, setV, currentView }) {
  const { S, A } = useContext(Ctx);
  const [showSwitch, setShowSwitch] = useState(false);
  const site = SITES.find(s => s.id === (S.siteId || 'masaki')) || SITES[0];
  const role = sess?.role || 'customer';
  const isMobileRole = MOBILE_ROLES.has(role);

  const shiftDot = { opening:'#FF9500', service:'#3cb371', closed:'#8E8E93' }[S.shiftState||'service'];
  const shiftLabel = { opening:'Opening Prep', service:'Live Service', closed:'Day Closed' }[S.shiftState||'service'];

  const ri = ROLE_ICONS[role] || ROLE_ICONS.owner;

  return (
    <>
      {/* ── Desktop topbar (hidden on mobile roles) ── */}
      {!isMobileRole && (
        <header className="topbar-container topbar-desktop">
          <div className="topbar-inner">
            {/* Brand */}
            <div className="topbar-brand">
              <div className="tb-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
              </div>
              <div>
                <div className="brand-name">Safari Grill &amp; Lounge</div>
                <div className="brand-sub">{site.name?.split('·')[1]?.trim() || 'Masaki'}</div>
              </div>
              <div className="shift-indicator">
                <span className="dot" style={{ background: shiftDot }}/>
                <span>{shiftLabel}</span>
              </div>
            </div>
            {/* User pill */}
            <button className="workspace-switcher-btn" onClick={() => setShowSwitch(true)}>
              <div className="tb-avatar" style={{ background:'#3cb371' }}>
                <span style={{ width:18,height:18,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center' }}>{ri.emoji}</span>
              </div>
              <div className="user-meta">
                <span className="user-name">{sess?.name || 'Guest'}</span>
                <span className="user-role" style={{ color:'#3cb371' }}>{role.toUpperCase()}</span>
              </div>
              <span className="chevron">▾</span>
            </button>
          </div>
        </header>
      )}

      {/* ── Compact mobile top strip (mobile roles only) ── */}
      {isMobileRole && (
        <header className="topbar-mobile-strip">
          <div className="tms-left">
            <div className="tms-logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5" stroke="#3cb371" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
            </div>
            <span className="tms-title">Safari Grill</span>
            <span className="tms-dot" style={{ background: shiftDot }}/>
          </div>
          <div className="tms-right">
            <button className="tms-user-btn" onClick={() => setShowSwitch(true)}>
              <span className="tms-role-badge" style={{ background:'#3cb37122', color:'#3cb371', border:'1px solid #3cb37144' }}>
                {role === 'customer' ? '🍽️' : role === 'waiter' ? '🧑‍🍳' : role === 'chef' ? '👨‍🍳' : role === 'cashier' ? '💳' : '📦'}&nbsp;
                {sess?.name?.split(' ')[0] || 'Guest'}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* ── Role switcher sheet (shared) ── */}
      {showSwitch && (
        <Sheet title="Switch Role / Workspace" onClose={() => setShowSwitch(false)}>
          <div style={{ display:'grid', gap:10 }}>
            <small style={{ color:'var(--mut)' }}>Switch to a different role or branch:</small>
            <div className="roles-list-grid">
              {USERS.map(u => {
                const ri2 = ROLE_ICONS[u.role] || ROLE_ICONS.owner;
                return (
                  <button key={u.id} className={`role-select-card ${sess?.id===u.id?'active':''}`}
                    onClick={() => { setSess(u); setV(u.role); setShowSwitch(false); }}>
                    <div className="role-icon" style={{ background: sess?.id===u.id ? '#3cb37120':'var(--bg)', color:'#3cb371' }}>
                      <span style={{ fontSize:22 }}>{ri2.emoji}</span>
                    </div>
                    <div style={{ textAlign:'left', flex:1 }}>
                      <div style={{ fontWeight:600 }}>{u.name}</div>
                      <small style={{ color:'var(--mut)' }}>{u.title}</small>
                    </div>
                    {sess?.id===u.id && <span style={{ color:'#3cb371', fontWeight:700, fontSize:13 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ borderTop:'1px solid var(--line)', paddingTop:10, marginTop:4, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {SITES.map(st => (
                <button key={st.id} className={`btn ghost sm ${S.siteId===st.id?'active-site':''}`}
                  style={{ textAlign:'center', fontSize:12, padding:'7px 4px' }}
                  onClick={() => { A.setShift(S.shiftState); setShowSwitch(false); }}>
                  {st.name.split('·')[1]?.trim() || st.name}
                </button>
              ))}
            </div>
            <button className="btn ghost sm" onClick={() => { setSess(null); setV('land'); setShowSwitch(false); }}>
              Sign Out
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}

/* ─── Nav icon SVGs (used in Tabs / sidebar) ──────────── */
const NAV_ICONS = {
  // Customer
  menu:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h12"/></svg>,
  orders:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14l2 2 4-4"/></svg>,
  me:           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  // Waiter
  new:          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  link:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  earn:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M8 12h2m4 0h2"/><path d="M10 10a2 2 0 114 0c0 1.5-2 2-2 3"/></svg>,
  // Cashier
  queue:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  floor:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  cash:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>,
  // KDS
  tickets:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5v2M15 11v2M15 17v2M5 5a2 2 0 00-2 2v2a2 2 0 002 2 2 2 0 000 4v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2 2 2 0 000-4V7a2 2 0 00-2-2H5z"/></svg>,
  '86':         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  prep:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"/></svg>,
  haccp:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  // Inventory
  stock:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  retail:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>,
  finished:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  transfers:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  receiving:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  procurement:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  waste:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  // Manager / HQ
  overview:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  commission:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  reconciliation:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
  checklists:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  audit:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  // Production
  batches:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4"/></svg>,
  boms:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  requisitions: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h6M16 12h6M16 16l6-4"/></svg>,
  traceability: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  // HQ
  pnl:          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  kpis:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  sites:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  waiters:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
};

/* ─── Tabs (bottom nav mobile + left sidebar desktop) ── */
export const Tabs = ({ tabs, cur, set }) => (
  <nav className="tb">
    {tabs.map(([k, l, , b]) => {
      const icon = NAV_ICONS[k];
      const on = cur === k;
      return (
        <button key={k} className={on ? 'on' : ''} onClick={() => set(k)}>
          <i className="tb-icon">
            {icon
              ? <span style={{ width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {React.cloneElement(icon, {
                    width: 20, height: 20,
                    stroke: on ? '#ffffff' : 'currentColor',
                    strokeWidth: on ? 2.2 : 1.8
                  })}
                </span>
              : <span style={{ fontSize:18 }}>{['🧾','➕','🔗','💰','🪑','💵','🍳','🚫','📋','🌡️','📦','🛒','🍱','⇄','📥','🤝','🗑️','📊','👥','✅','🛡️','🏭','📑','🚚','🔍','💼','📈','🏠','🏆'][['orders','new','link','earn','floor','cash','tickets','86','prep','haccp','stock','retail','finished','transfers','receiving','procurement','waste','overview','reconciliation','checklists','audit','batches','boms','requisitions','traceability','pnl','kpis','sites','waiters'].indexOf(k)] || '●'}</span>
            }
          </i>
          {l}
          {b > 0 && <u>{b}</u>}
        </button>
      );
    })}
  </nav>
);

export const OC = ({ o, children }) => {
  const { wn } = useContext(Ctx);
  const gross = tot(o);
  const minutesAgo = Math.max(1, Math.round((Date.now() - o.t) / 60000));

  return (
    <div className="card oc">
      <div className="row">
        <div>
          <b>{o.no} · {o.tb}</b>
          <span style={{ fontSize: 12, color: 'var(--mut)', marginLeft: 8 }}>({o.src.replace('_', ' ').toLowerCase()})</span>
        </div>
        <Pill st={o.st} />
      </div>

      <small>
        Waiter: <b>{wn(o.wid)}</b> · {minutesAgo} min ago · By {o.by || 'Guest'}
      </small>

      <div style={{ margin: '8px 0', borderLeft: '3px solid var(--line)', paddingLeft: 8 }}>
        {(o.it || []).map((l, i) => (
          <div key={i} style={{ fontSize: 14, margin: '2px 0' }}>
            {l.q}× {M[l.id]?.n || `Item #${l.id}`}
            {l.note && <span style={{ color: 'var(--o)', fontSize: 12, marginLeft: 6 }}>({l.note})</span>}
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <div>
          <b style={{ fontSize: 18 }}>{fmt(gross)}</b>
          {o.paid && <span style={{ fontSize: 12, color: '#15803D', marginLeft: 6 }}>✓ Paid ({o.pm})</span>}
        </div>
        <div className="acts">{children}</div>
      </div>
    </div>
  );
};

export function Track({ o }) {
  const steps = [
    { st: 'placed', label: 'Placed' },
    { st: 'accepted', label: 'Kitchen Accepted' },
    { st: 'preparing', label: 'Cooking' },
    { st: 'ready', label: 'Ready at Pass' },
    { st: 'served', label: 'Served to Table' },
    { st: 'billreq', label: 'Bill Requested' },
    { st: 'paid', label: 'Paid & Verified' }
  ];

  const currentIdx = Math.max(0, steps.findIndex(s => s.st === o.st));
  const isCancelled = o.st === 'cancelled';

  if (isCancelled) {
    return (
      <div style={{ background: '#FFE0DE', padding: 8, borderRadius: 10, margin: '8px 0', color: '#C62828', fontSize: 13 }}>
        ⚠️ Order cancelled: {o.why || 'Cancelled by manager'}
      </div>
    );
  }

  return (
    <div style={{ margin: '10px 0' }}>
      <div className="bar">
        <i style={{ width: `${Math.min(100, Math.round(((currentIdx + 1) / steps.length) * 100))}%` }} />
      </div>
      <div className="row" style={{ marginTop: 4 }}>
        <small style={{ fontWeight: 600, color: 'var(--tx)' }}>
          {LB[o.st] || o.st}
        </small>
        <small>Step {currentIdx + 1} of {steps.length}</small>
      </div>
    </div>
  );
}

export { ReceiptModal } from './ReceiptModal';

export function Receipt({ o, close, initialTab, userRole }) {
  return <ReceiptModal o={o} close={close} initialTab={initialTab || 'customer'} userRole={userRole} />;
}

/* ─── ORDER STATUS CONFIG ───────────────────────────────────────────
   Maps every order.st to a colour, icon, label and priority order.
   This drives the table card badge and status ring colour.
──────────────────────────────────────────────────────────────────── */
const ST_CFG = {
  placed:    { color:'#f59e0b', bg:'#fffbeb', ring:'#f59e0b', icon:'📋', label:'Order Placed',    dot:'#f59e0b' },
  accepted:  { color:'#3b82f6', bg:'#eff6ff', ring:'#3b82f6', icon:'✅', label:'Kitchen Accepted',dot:'#3b82f6' },
  preparing: { color:'#8b5cf6', bg:'#f5f3ff', ring:'#8b5cf6', icon:'👨‍🍳', label:'Cooking',         dot:'#8b5cf6' },
  ready:     { color:'#10b981', bg:'#ecfdf5', ring:'#10b981', icon:'🔔', label:'Ready at Pass',   dot:'#10b981' },
  served:    { color:'#06b6d4', bg:'#ecfeff', ring:'#06b6d4', icon:'🍽️', label:'Served',           dot:'#06b6d4' },
  billreq:   { color:'#ef4444', bg:'#fff1f2', ring:'#ef4444', icon:'🧾', label:'Bill Requested',  dot:'#ef4444' },
  paid:      { color:'#16a34a', bg:'#dcfce7', ring:'#16a34a', icon:'💳', label:'Paid',             dot:'#16a34a' },
  cancelled: { color:'#9ca3af', bg:'#f9fafb', ring:'#9ca3af', icon:'❌', label:'Cancelled',       dot:'#9ca3af' },
};

/* dominant status for a table = highest-priority unpaid order status */
const PRIORITY = ['billreq','ready','preparing','accepted','placed','served'];
function dominantStatus(orders) {
  for (const st of PRIORITY) {
    if (orders.some(o => o.st === st)) return st;
  }
  if (orders.length) return orders[0].st;
  return null;
}

/* elapsed time helper */
function elapsed(ts) {
  if (!ts) return '';
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  return `${Math.floor(m/60)}h ${m%60}m`;
}

/* seat chair SVG row */
function Chairs({ n, side, color }) {
  return (
    <div style={{ display:'flex', gap: side==='top'?8:6, justifyContent:'center', alignItems: side==='top'?'flex-end':'flex-start' }}>
      {Array.from({length:n}).map((_,i) => (
        <div key={i} style={{
          width: 18, height: 10, borderRadius: side==='top'?'6px 6px 2px 2px':'2px 2px 6px 6px',
          background: color, opacity: .85, transition: '.2s'
        }}/>
      ))}
    </div>
  );
}

export function TableMap({ val, set, big }) {
  const { S } = useContext(Ctx);

  /* per-table live data */
  const liveOrders = t =>
    (S.orders || []).filter(o => o.tb === t && !['paid','closed','cancelled'].includes(o.st));
  const tableAmt  = t => liveOrders(t).reduce((a,o) => a + tot(o), 0);
  const tableTime = t => {
    const os = liveOrders(t);
    return os.length ? Math.min(...os.map(o => o.t || o.created_at || Date.now())) : null;
  };
  const tableWaiter = t => {
    const os = liveOrders(t);
    if (!os.length) return null;
    const w = (S.waiters || []).find(w => w.id === os[0].wid);
    return w?.name?.split(' ')[0] || null;
  };

  const tables = Object.keys(SEATS).filter(t => t !== 'Takeaway');
  const twAmt  = (S.orders || []).filter(o => o.tb === 'Takeaway' && !['paid','closed','cancelled'].includes(o.st)).reduce((a,o)=>a+tot(o),0);
  const twOrds = (S.orders || []).filter(o => o.tb === 'Takeaway' && !['paid','closed','cancelled'].includes(o.st)).length;

  /* legend items */
  const LEGEND = [
    { color:'#374151', label:'Free' },
    { color:'#f59e0b', label:'Order Placed' },
    { color:'#8b5cf6', label:'Cooking' },
    { color:'#10b981', label:'Ready' },
    { color:'#06b6d4', label:'Served' },
    { color:'#ef4444', label:'Bill Requested' },
  ];

  return (
    <div style={{
      background:'#f0fdf4',
      border:'1px solid #bbf7d0',
      borderRadius:20, padding: big?'20px 20px 16px':'14px 14px 12px',
      margin:'6px 0', boxShadow:'0 2px 16px rgba(60,179,113,.1)'
    }}>
      {/* header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: big?16:12 }}>
        <div>
          <div style={{ fontWeight:800, fontSize: big?20:17, letterSpacing:-.3, color:'#14532d' }}>Interactive Floor Plan</div>
          <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>
            {tables.filter(t => liveOrders(t).length).length} active tables · tap to select
          </div>
        </div>
        <div style={{ fontSize:11, color:'#6b7280', textAlign:'right' }}>
          <div style={{ fontWeight:600, color: twOrds?'#d97706':'#9ca3af' }}>
            {twOrds ? `${twOrds} takeaway` : 'No takeaway'}
          </div>
          {twOrds > 0 && <div style={{ color:'#16a34a', fontWeight:700 }}>{fmt(twAmt)}</div>}
        </div>
      </div>

      {/* table grid */}
      <div style={{
        display:'grid',
        gridTemplateColumns: big ? 'repeat(auto-fill,minmax(160px,1fr))' : 'repeat(auto-fill,minmax(130px,1fr))',
        gap: big?20:12,
        marginBottom:14
      }}>
        {tables.map(t => {
          const n    = SEATS[t];
          const ords = liveOrders(t);
          const busy = ords.length > 0;
          const sel  = val === t;
          const ds   = dominantStatus(ords);
          const cfg  = ds ? ST_CFG[ds] : null;
          const am   = tableAmt(t);
          const time = tableTime(t);
          const wtr  = tableWaiter(t);
          const elapsed_m = time ? Math.floor((Date.now() - time) / 60000) : 0;
          const isLate = elapsed_m > 30 && ds && !['served','paid'].includes(ds);

          /* colour scheme — light palette */
          const ringColor  = sel ? '#3cb371' : busy ? cfg?.ring || '#f59e0b' : '#d1fae5';
          const bgColor    = sel
            ? 'linear-gradient(145deg,#3cb371,#2a9d5c)'
            : busy
            ? '#ffffff'
            : '#f9fafb';
          const textColor  = sel ? '#fff' : '#111827';
          const mutedColor = sel ? 'rgba(255,255,255,.75)' : '#6b7280';
          const chairColor = sel ? '#a7f3d0' : busy ? cfg?.ring || '#f59e0b' : '#bbf7d0';

          return (
            <button
              key={t}
              onClick={() => set && set(t)}
              aria-label={`Table ${t}`}
              style={{
                background:'transparent', border:'none', cursor:'pointer', padding:0,
                display:'flex', flexDirection:'column', alignItems:'center', gap: big?8:6,
                outline:'none'
              }}
            >
              {/* top chairs */}
              <Chairs n={Math.ceil(n/2)} side="top" color={chairColor}/>

              {/* table body */}
              <div style={{
                width:'100%', minHeight: big?80:64,
                background: bgColor,
                borderRadius:14,
                border:`2px solid ${ringColor}`,
                boxShadow: sel
                  ? '0 4px 18px rgba(60,179,113,.4)'
                  : busy
                  ? `0 2px 12px ${cfg?.ring}33`
                  : '0 1px 4px rgba(0,0,0,.06)',
                padding: big?'10px 10px':'7px 8px',
                display:'flex', flexDirection:'column', justifyContent:'space-between',
                transition:'all .18s ease', position:'relative', overflow:'hidden',
              }}>
                {/* left accent bar when busy */}
                {busy && !sel && (
                  <div style={{
                    position:'absolute', left:0, top:0, bottom:0,
                    width:4, borderRadius:'14px 0 0 14px',
                    background: cfg?.ring || '#f59e0b'
                  }}/>
                )}

                {/* status dot */}
                {busy && (
                  <div style={{
                    position:'absolute', top:7, right:7,
                    width:8, height:8, borderRadius:'50%',
                    background: sel ? '#fff' : cfg?.dot || '#f59e0b',
                    boxShadow:`0 0 6px ${sel ? '#fff' : cfg?.dot || '#f59e0b'}`,
                    animation: ds==='preparing'||ds==='ready' ? 'pulse 1.4s infinite' : 'none'
                  }}/>
                )}

                {/* table label */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontWeight:800, fontSize: big?22:17, color: textColor, lineHeight:1 }}>{t}</div>
                  {busy && cfg && (
                    <span style={{ fontSize: big?14:11 }}>{cfg.icon}</span>
                  )}
                </div>

                {/* seat count */}
                <div style={{ fontSize: big?11:10, color: sel ? 'rgba(255,255,255,.8)' : busy ? cfg?.ring : '#9ca3af', fontWeight:600, marginTop:2 }}>
                  {n} seats
                </div>

                {/* status info when busy */}
                {busy ? (
                  <div style={{ marginTop: big?6:4 }}>
                    {/* status badge */}
                    <div style={{
                      background: sel ? 'rgba(255,255,255,.2)' : cfg?.bg || '#f3f4f6',
                      color: sel ? '#fff' : cfg?.color || '#f59e0b',
                      borderRadius:6, padding:'2px 6px',
                      fontSize: big?11:9, fontWeight:700,
                      display:'inline-block', marginBottom: big?4:2,
                      maxWidth:'100%', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'
                    }}>
                      {cfg?.label || ds}
                    </div>
                    {/* amount */}
                    <div style={{ fontSize: big?13:11, fontWeight:800, color: sel ? '#fff' : '#111827', marginTop:1 }}>
                      {fmt(am)}
                    </div>
                    {/* bottom row: time + waiter */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: big?4:2 }}>
                      <span style={{ fontSize: big?10:9, color: isLate?'#ef4444': sel ? 'rgba(255,255,255,.7)' : '#9ca3af', fontWeight: isLate?700:400 }}>
                        {isLate ? '⚠ ' : '⏱ '}{elapsed(time)}
                      </span>
                      {wtr && (
                        <span style={{ fontSize: big?10:9, color: sel ? 'rgba(255,255,255,.7)' : '#9ca3af', maxWidth:50, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                          {wtr}
                        </span>
                      )}
                    </div>
                    {/* order count */}
                    {ords.length > 1 && (
                      <div style={{ fontSize:9, color: sel ? 'rgba(255,255,255,.6)' : '#9ca3af', marginTop:1 }}>
                        {ords.length} active tickets
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: big?12:10, color: mutedColor, marginTop: big?6:4, fontWeight:500 }}>
                    Free · available
                  </div>
                )}
              </div>

              {/* bottom chairs */}
              <Chairs n={Math.floor(n/2)} side="bottom" color={chairColor}/>
            </button>
          );
        })}
      </div>

      {/* Takeaway button */}
      <button
        type="button"
        onClick={() => set && set('Takeaway')}
        style={{
          width:'100%',
          background: val==='Takeaway'
            ? 'linear-gradient(135deg,#3cb371,#2a9d5c)'
            : twOrds > 0
            ? 'rgba(60,179,113,.08)'
            : 'rgba(0,0,0,.03)',
          border: `1.5px ${val==='Takeaway' ? 'solid #3cb371' : twOrds > 0 ? 'solid #bbf7d0' : 'dashed #d1fae5'}`,
          borderRadius:14, padding: big?'12px 16px':'9px 14px',
          color: val==='Takeaway' ? '#fff' : '#374151', fontWeight:700, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          fontSize: big?14:13, transition:'all .15s',
          boxShadow: val==='Takeaway' ? '0 4px 12px rgba(60,179,113,.3)' : 'none'
        }}
      >
        <span>🛍️ Takeaway / Bar Tab (No Table)</span>
        {twOrds > 0 && (
          <span style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ background:'#ef4444', borderRadius:10, padding:'1px 7px', fontSize:11, fontWeight:700, color:'#fff' }}>{twOrds}</span>
            <span style={{ color: val==='Takeaway'?'#fff':'#16a34a', fontWeight:800 }}>{fmt(twAmt)}</span>
          </span>
        )}
      </button>

      {/* Legend */}
      <div style={{ display:'flex', gap:12, marginTop:14, flexWrap:'wrap' }}>
        {LEGEND.map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#6b7280' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:l.color, boxShadow:`0 0 4px ${l.color}80` }}/>
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { USERS } from '../data';
import { Install, Sheet } from '../components/ui';

export function Landing({ go, onDirectRole }) {
  const [showPersonas, setShowPersonas] = useState(false);

  return (
    <div className="land">
      <div className="big">🔥</div>
      <div style={{ margin: 'auto 0 0' }}>
        <small style={{ color: '#cfe8df', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          Safari Grill & Lounge · Dar es Salaam
        </small>
        <h1 style={{ fontSize: 36, margin: '8px 0 12px' }}>
          RestoERP Platform
        </h1>
        <p style={{ color: '#cfe8df', fontSize: 16, lineHeight: 1.4, margin: '0 0 16px' }}>
          One shared order engine powering Customer Mobile Ordering, Waiter Links & Commission, Kitchen KDS, Cashier Settlement, Inventory & Multi-Site HQ.
        </p>

        <button className="btn o" onClick={() => onDirectRole ? onDirectRole(USERS[0]) : go('customer')}>
          🍽️ Open Customer Portal
        </button>

        <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', marginTop: 8 }} onClick={() => setShowPersonas(true)}>
          ⚡ Fast Role Switcher (All 7 SRS Personas)
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <button className="btn ghost" onClick={() => go('auth:login')}>
            Staff Log In
          </button>
          <button className="btn ghost" onClick={() => go('auth:register')}>
            Register
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <Install cls="btn ghost" />
        </div>
      </div>

      {showPersonas && (
        <Sheet title="Select SRS User Persona" onClose={() => setShowPersonas(false)}>
          <div style={{ display: 'grid', gap: 8 }}>
            <p style={{ margin: '0 0 6px' }}>
              <small>Instant demo access without entering passwords:</small>
            </p>

            <div className="roles-list-grid">
              {USERS.map(u => (
                <button
                  key={u.id}
                  className="role-select-card"
                  onClick={() => {
                    setShowPersonas(false);
                    if (onDirectRole) onDirectRole(u);
                    else go(u.role);
                  }}
                >
                  <div className="role-icon">
                    {u.role === 'customer' ? '🍽️' : u.role === 'waiter' ? '🧑‍🍳' : u.role === 'chef' ? '🍳' : u.role === 'production' ? '🏭' : u.role === 'cashier' ? '💳' : u.role === 'storekeeper' ? '📦' : u.role === 'manager' ? '👔' : '🏢'}
                  </div>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <small style={{ color: 'var(--mut)' }}>{u.title} ({u.role})</small>
                  </div>
                  <span style={{ color: 'var(--g)', fontSize: 13, fontWeight: 600 }}>Launch ▸</span>
                </button>
              ))}
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}

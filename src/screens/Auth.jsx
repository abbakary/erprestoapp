import React, { useState, useContext } from 'react';
import { Ctx } from '../store';
import { Hd } from '../components/ui';
import { USERS } from '../data';

export function Auth({ mode0, done, back }) {
  const { S, A } = useContext(Ctx);
  const [m, setM] = useState(mode0);
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [ph, setPh] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const demo = roleKey => {
    const u = (S.users || USERS).find(x => x.role === roleKey) || USERS.find(x => x.role === roleKey);
    if (u) {
      setM('login');
      setPh(u.ph);
      setPw(u.pw);
      setErr('');
    }
  };

  const sub = () => {
    setErr('');
    const cleanPh = ph.replace(/\s/g, '');

    if (m === 'login') {
      const u = (S.users || USERS).find(x => x.ph === cleanPh && x.pw === pw);
      return u ? done(u) : setErr('Phone or password is wrong. Tap a demo account below.');
    }

    if (!name || !ph || pw.length < 4) {
      return setErr('Enter your full name, phone number, and a password of 4+ characters.');
    }

    const u = {
      id: 'u' + Date.now(),
      role,
      name,
      ph: cleanPh,
      pw,
      wid: role === 'waiter' ? 'w' + Date.now() : undefined,
      title: role === 'waiter' ? 'Staff Waiter' : role === 'cashier' ? 'Cashier' : role === 'chef' ? 'Kitchen Cook' : 'Guest Member'
    };

    A.addUser(u);
    done(u);
  };

  return (
    <div className="app">
      <button onClick={back} style={{ color: 'var(--g)', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        ‹ Back to Home
      </button>

      <Hd t={m === 'login' ? 'Staff & Customer Login' : 'Create Account'} s="Safari Grill & Lounge · RestoERP" />

      <div className="seg">
        {[
          ['login', 'Log In'],
          ['register', 'Register New']
        ].map(([k, l]) => (
          <button key={k} className={m === k ? 'on' : ''} onClick={() => setM(k)}>
            {l}
          </button>
        ))}
      </div>

      {m === 'register' && (
        <>
          <small style={{ fontWeight: 600 }}>Select Workspace Role:</small>
          <div className="roles" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              ['customer', '🍽️', 'Customer'],
              ['waiter', '🧑‍🍳', 'Waiter'],
              ['cashier', '💳', 'Cashier'],
              ['chef', '🍳', 'Kitchen Chef'],
              ['production', '🏭', 'Production & CK'],
              ['storekeeper', '📦', 'Storekeeper'],
              ['manager', '👔', 'Manager']
            ].map(([k, i, l]) => (
              <button key={k} className={role === k ? 'on' : ''} onClick={() => setRole(k)}>
                <b>{i}</b>
                {l}
              </button>
            ))}
          </div>

          <input
            className="inp"
            placeholder="Full Name (e.g. Amani Juma)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </>
      )}

      <input
        className="inp"
        placeholder="Phone Number (e.g. 0713000222)"
        inputMode="tel"
        value={ph}
        onChange={e => setPh(e.target.value)}
      />

      <input
        className="inp"
        placeholder="Password (demo accounts use: demo)"
        type="password"
        value={pw}
        onChange={e => setPw(e.target.value)}
      />

      {err && <p className="err">{err}</p>}

      <button className="btn" style={{ marginTop: 10 }} onClick={sub}>
        {m === 'login' ? 'Log In to Workspace' : 'Create Account & Enter'}
      </button>

      <button
        className="btn ghost"
        style={{ marginTop: 8 }}
        onClick={() => done({ id: 'guest_' + Date.now(), role: 'customer', name: 'Guest Diner' })}
      >
        Continue as Guest (No Password)
      </button>

      <div style={{ marginTop: 20 }}>
        <small style={{ fontWeight: 600, color: 'var(--mut)', display: 'block', marginBottom: 6 }}>
          1-Tap Demo Credentials (Password: “demo”):
        </small>
        <div className="tags">
          {[
            ['customer', '🍽️ Customer · Juma'],
            ['waiter', '🧑‍🍳 Waiter · Amani'],
            ['chef', '🍳 Chef · Baraka'],
            ['production', '🏭 CK · Jaffar'],
            ['cashier', '💳 Cashier · Zawadi'],
            ['storekeeper', '📦 Store · Hamisi'],
            ['manager', '👔 Manager · Rehema'],
            ['owner', '🏢 Owner · David (CEO)']
          ].map(([r, l]) => (
            <button key={r} onClick={() => demo(r)}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useContext } from 'react';
import { fmt, tot } from '../data';
import { Ctx } from '../store';
import { Hd, OC, Pill, Tabs, TopBar } from '../components/ui';
import { CartBar, Checkout, Menu } from '../components/Ordering';

export function Waiter({ sess, out, preview, setSess, setV }) {
  const { S, A, wn } = useContext(Ctx);
  const [tab, setTab] = useState('orders');
  const [f, setF] = useState('live');
  const [cart, setCart] = useState([]);
  const [co, setCo] = useState(false);
  const [toast, setToast] = useState('');
  const [cp, setCp] = useState(false);

  const me = (S.waiters || []).find(w => w.id === sess?.wid) || (S.waiters || [])[0] || { id: 'w1', name: 'Amani Juma', tok: 'amani-7QK2' };
  const sw = { ...sess, wid: me.id };

  const mine = (S.orders || []).filter(o => o.wid === me.id);
  const live = mine.filter(o => !['paid', 'closed', 'cancelled'].includes(o.st));

  // Audio/Visual toast on new order
  const pc = useRef(mine.length);
  useEffect(() => {
    if (mine.length > pc.current) {
      const latest = mine[0];
      setToast(`🔔 New Order ${latest?.no || ''} for Table ${latest?.tb || ''}!`);
      setTimeout(() => setToast(''), 4500);
    }
    pc.current = mine.length;
  }, [mine.length]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://order.dukadigital.co.tz';
  const link = `${origin}/restaurant/safari-grill/w/${me.tok}`;

  const led = (S.ledger || []).filter(l => l.wid === me.id);
  const sum = s => led.filter(l => l.st === s).reduce((a, l) => a + l.amt, 0);

  const nxt = {
    placed: 'accepted',
    accepted: 'preparing',
    preparing: 'ready',
    ready: 'served'
  };

  const policy = S.policy || { method: 'percent', rate: 5, fixed: 2000, basis: 'gross' };
  const waiterRate = (policy.overrides && policy.overrides[me.id]) !== undefined ? policy.overrides[me.id] : policy.rate;

  return (
    <div className="app">
      <TopBar sess={sess} setSess={setSess} setV={setV} currentView="waiter" />

      {toast && <div className="toast">🔥 {toast}</div>}

      {tab === 'orders' && (
        <>
          <Hd s={`Waiter Console · ${me.name}`} t="My Orders Register" />

          <div className="seg">
            {[
              ['live', `Live Service (${live.length})`],
              ['all', `All Shift Orders (${mine.length})`]
            ].map(([k, l]) => (
              <button key={k} className={f === k ? 'on' : ''} onClick={() => setF(k)}>
                {l}
              </button>
            ))}
          </div>

          {!(f === 'live' ? live : mine).length && (
            <div className="card" style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
              <p style={{ fontWeight: 600 }}>No orders in this view</p>
              <small>Take a walk-in order or share your personal link with diners.</small>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn sm o" onClick={() => setTab('new')}>+ Walk-in Order</button>
                <button className="btn sm ghost" onClick={() => setTab('link')}>🔗 Share Link</button>
              </div>
            </div>
          )}

          {(f === 'live' ? live : mine).map(o => (
            <OC key={o.id} o={o}>
              {nxt[o.st] && (
                <button
                  className="btn ghost sm"
                  onClick={() => A.st(o.id, nxt[o.st], me.name)}
                >
                  {o.st === 'ready' ? '✓ Mark Served' : 'Kitchen: Next ▸'}
                </button>
              )}

              {o.st === 'served' && !o.paid && (
                <button
                  className="btn ghost sm"
                  onClick={() => A.st(o.id, 'billreq', me.name)}
                >
                  Request Bill
                </button>
              )}

              {['served', 'billreq'].includes(o.st) && !o.paid && (
                <button
                  className="btn sm"
                  onClick={() => A.pay(o.id, 'cash', 'WAITER_CASH', me.name)}
                >
                  💵 Take Cash
                </button>
              )}
            </OC>
          ))}

          <div style={{ marginTop: 14, padding: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 12, fontSize: 13, color: 'var(--mut)' }}>
            💡 <b>Workflow Note:</b> When customers order through your link or table QR, tickets appear here instantly and route directly to the Kitchen KDS.
          </div>
        </>
      )}

      {tab === 'new' && (
        <>
          <Hd s="Walk-in Dine-in or Takeaway" t="Take Order" />
          <Menu cart={cart} setCart={setCart} isPosMode={false} onOpenCart={() => setCo(true)} />
          <CartBar cart={cart} open={() => setCo(true)} />
        </>
      )}

      {tab === 'link' && (
        <>
          <Hd s="Customer Orders Attributed to You" t="My Ordering Link" />
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 32 }}>🔗</span>
              <div>
                <b style={{ fontSize: 17 }}>Your Dedicated Customer Link</b>
                <div style={{ color: 'var(--mut)', fontSize: 13 }}>Customers who open this link automatically credit you with commission.</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: 12, wordBreak: 'break-all', fontWeight: 600, fontSize: 14, margin: '12px 0', border: '1px solid var(--line)' }}>
              {link}
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <button
                className="btn"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(link);
                  } catch (e) {}
                  setCp(true);
                  setTimeout(() => setCp(false), 2000);
                }}
              >
                {cp ? '✓ Link Copied to Clipboard!' : '📋 Copy Link'}
              </button>

              <a
                className="btn o"
                style={{ textDecoration: 'none' }}
                href={`https://wa.me/?text=${encodeURIComponent('Hi! View the Safari Grill menu and order directly to our table here: ' + link)}`}
                target="_blank"
                rel="noreferrer"
              >
                💬 Share on WhatsApp
              </a>

              <a
                className="btn ghost"
                style={{ textDecoration: 'none' }}
                href={`sms:?&body=${encodeURIComponent('Order from Safari Grill: ' + link)}`}
              >
                ✉️ Share by SMS
              </a>

              <button
                className="btn ghost"
                onClick={() => preview(me.id)}
              >
                👀 Preview Customer View (As Table Diner)
              </button>

              <button
                className="btn ghost"
                style={{ color: '#FF3B30' }}
                onClick={() => {
                  A.rot(me.id, me.name);
                  setToast('Rotated link! A new token has been generated and the old link revoked.');
                }}
              >
                🔄 Rotate Token (Revoke Old Link)
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <b>Security & Token Rules (SRS NFR-21):</b>
            <p style={{ fontSize: 13, color: 'var(--mut)', margin: '6px 0' }}>
              Your link identifies the waiter to credit orders to. It never logs the customer into your staff account, and rotating it immediately renders old links invalid.
            </p>
          </div>
        </>
      )}

      {tab === 'earn' && (
        <>
          <Hd
            s={`Policy: ${policy.method === 'fixed' ? fmt(policy.fixed) + ' per order' : waiterRate + '% of ' + policy.basis}`}
            t="Commission & Earnings"
          />

          <div className="tiles">
            {[
              ['Pending Approval', 'pending', '#FF9500'],
              ['Approved for Payout', 'approved', '#007AFF'],
              ['Paid Out to You', 'paid', '#15803D']
            ].map(([label, stKey, color]) => (
              <div key={stKey} className="card">
                <small>{label}</small>
                <b style={{ color, fontSize: 22 }}>{fmt(sum(stKey))}</b>
              </div>
            ))}
          </div>

          <p className="sec" style={{ marginTop: 16 }}>Ledger Activity</p>

          {!led.length && (
            <div className="card">
              <small>Commission records post once customer payment is confirmed by cashier or mobile money.</small>
            </div>
          )}

          {led.map(l => {
            const o = (S.orders || []).find(x => x.id === l.oid) || { no: `#${l.oid}`, tb: '–' };
            const isRev = l.st === 'reversed';

            return (
              <div key={l.id} className="card row" style={{ marginBottom: 8, opacity: isRev ? 0.6 : 1 }}>
                <div>
                  <b>{o.no} · {o.tb}</b>
                  <br />
                  <small style={{ color: 'var(--mut)' }}>
                    {l.method === 'fixed' ? 'Fixed fee' : `${l.rate}% · ${l.basis}`} · {new Date(l.t).toLocaleTimeString()}
                  </small>
                  {l.note && <div style={{ fontSize: 12, color: 'var(--mut)' }}>{l.note}</div>}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <b style={{ color: isRev ? '#FF3B30' : 'inherit', fontSize: 17 }}>
                    {isRev ? `-${fmt(Math.abs(l.amt))}` : fmt(l.amt)}
                  </b>
                  <br />
                  <Pill st={l.st === 'pending' ? 'placed' : l.st === 'approved' ? 'ready' : l.st === 'paid' ? 'paid' : 'cancelled'} />
                </div>
              </div>
            );
          })}

          <button className="btn ghost" style={{ marginTop: 16 }} onClick={out}>
            Sign Out of Waiter Console
          </button>
        </>
      )}

      {co && (
        <Checkout
          cart={cart}
          setCart={setCart}
          mode="waiter"
          sess={sw}
          close={() => setCo(false)}
          onPlaced={() => {
            setCo(false);
            setTab('orders');
          }}
        />
      )}

      <Tabs
        cur={tab}
        set={setTab}
        tabs={[
          ['orders', 'Orders', '🧾', live.filter(o => o.st === 'placed').length],
          ['new', 'Take Order', '➕', 0],
          ['link', 'Share Link', '🔗', 0],
          ['earn', 'Earnings', '💰', 0]
        ]}
      />
    </div>
  );
}

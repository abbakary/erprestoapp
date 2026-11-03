import React, { useState, useContext, useEffect } from 'react';
import { M, fmt, tot, calcNet, calcTax } from '../data';
import { Ctx } from '../store';
import { Hd, Install, Pill, Receipt, Tabs, Track, TopBar } from '../components/ui';
import { CartBar, Checkout, Menu } from '../components/Ordering';

export function Customer({ sess, out, via, setVia, setSess, setV }) {
  const { S, A, wn } = useContext(Ctx);
  const [tab, setTab] = useState('menu');
  const [cart, setCart] = useState([]);
  const [co, setCo] = useState(false);
  const [busyPay, setBusyPay] = useState(0);
  const [rc, setRc] = useState(null);
  const [tb, setTb] = useState(via?.tb || '');
  const [billToast, setBillToast] = useState('');
  const [momoModal, setMomoModal] = useState(null);

  const mine = (S.orders || []).filter(o => o.cust === sess?.id);

  // Bill request action
  const requestBill = orderId => {
    A.st(orderId, 'billreq', sess?.name || 'Customer');
    setBillToast('Bill requested! A waiter or cashier will attend to your table shortly.');
    setTimeout(() => setBillToast(''), 4000);
  };

  // Mobile money payment trigger
  const confirmMomoPayment = orderId => {
    setBusyPay(orderId);
    setTimeout(() => {
      const txRef = 'MP' + Math.random().toString(36).slice(2, 8).toUpperCase();
      A.pay(orderId, 'momo', txRef, 'Customer Mobile Push');
      setBusyPay(0);
      setMomoModal(null);
      setBillToast('✓ Payment verified! Thank you for dining with Safari Grill.');
      setTimeout(() => setBillToast(''), 4500);
    }, 1200);
  };

  const hero = (
    <div className="hero">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <small>Safari Grill & Lounge · Open daily 11:00 – 23:00</small>
          <h2>Fire-grilled, shared, served to your table</h2>
        </div>
      </div>

      <div style={{ margin: '8px 0' }}>
        <span className="chip">★ 4.8 (312 reviews)</span>
        <span className="chip">📍 Masaki, Dar es Salaam</span>
        {via?.wid && <span className="chip" style={{ background: '#FF6B2C' }}>Served by {wn(via.wid)}</span>}
        {tb && <span className="chip" style={{ background: '#0E5A47', color: '#fff' }}>Table {tb}</span>}
      </div>

      {!tb && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn sm o" onClick={() => { setTb('T4'); setVia({ ...via, qr: true }); }}>
            📷 Scan Table QR (Demo: Table 4)
          </button>
          <button className="btn sm ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => setTb('Takeaway')}>
            🛍️ Order Takeaway
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="app">
      <TopBar sess={sess} setSess={setSess} setV={setV} currentView="customer" />

      {billToast && <div className="toast">🔔 {billToast}</div>}

      {tab === 'menu' && (
        <>
          <Hd s={`Welcome, ${sess?.name || 'Guest'}`} t="Food & Drinks Menu" />
          <Menu cart={cart} setCart={setCart} hero={hero} isPosMode={false} onOpenCart={() => setCo(true)} />
        </>
      )}

      {tab === 'orders' && (
        <>
          <Hd s="Live Tracker & Receipts" t="My Orders" />
          {!mine.length && (
            <div className="card" style={{ textAlign: 'center', padding: '30px 16px' }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🧾</div>
              <p style={{ fontWeight: 600 }}>No orders placed yet</p>
              <small>Explore the menu, pick your favorite grilled dishes, and track cooking progress in real time.</small>
              <button className="btn o" style={{ marginTop: 14 }} onClick={() => setTab('menu')}>
                Browse Menu
              </button>
            </div>
          )}

          {mine.map(o => (
            <div key={o.id} className="card oc" style={{ borderLeft: `4px solid ${o.paid ? '#15803D' : '#FF6B2C'}` }}>
              <div className="row">
                <b>{o.no} · Table {o.tb}</b>
                <Pill st={o.st} />
              </div>

              <div style={{ margin: '6px 0' }}>
                {(o.it || []).map((l, i) => (
                  <span key={i} style={{ fontSize: 14 }}>
                    {l.q}× {M[l.id]?.n || `Item #${l.id}`}{i < o.it.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>

              <small>
                Waiter: <b>{wn(o.wid)}</b> · Source: {o.src.replace('_', ' ').toLowerCase()}
              </small>

              <Track o={o} />

              <div className="row" style={{ marginTop: 8 }}>
                <div>
                  <b style={{ fontSize: 20 }}>{fmt(tot(o))}</b>
                  {o.paid && <span style={{ color: '#15803D', fontSize: 13, marginLeft: 6 }}>✓ Paid</span>}
                </div>

                <div className="acts">
                  {o.st === 'served' && (
                    <button className="btn ghost sm" onClick={() => requestBill(o.id)}>
                      Ask for Bill
                    </button>
                  )}

                  {['served', 'billreq'].includes(o.st) && !o.paid && (
                    <button
                      className="btn o sm"
                      onClick={() => setMomoModal(o)}
                    >
                      📱 Pay Mobile Money
                    </button>
                  )}

                  {o.paid && (
                    <button className="btn ghost sm" onClick={() => setRc(o)}>
                      Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'me' && (
        <>
          <Hd s="Safari Rewards & Preferences" t="My Profile" />
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--g)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 24 }}>
                🍽️
              </div>
              <div>
                <b style={{ fontSize: 18 }}>{sess?.name || 'Guest Diner'}</b>
                <div style={{ color: 'var(--mut)', fontSize: 13 }}>{sess?.ph || '0712000111'} · Member</div>
              </div>
            </div>

            <div className="tiles" style={{ gridTemplateColumns: '1fr 1fr', margin: '14px 0' }}>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12 }}>
                <small>Completed Orders</small>
                <b>{mine.filter(o => o.paid).length}</b>
              </div>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12 }}>
                <small>Loyalty Points</small>
                <b style={{ color: 'var(--g)' }}>{mine.filter(o => o.paid).length * 150} pts</b>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, fontSize: 14 }}>
              <p><b>Ordering Preferences:</b> Direct Table QR & Waiter Links enabled</p>
              <p><b>Dining Location:</b> Masaki Flagship Restaurant</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            <Install />
            <button className="btn ghost" onClick={out}>
              Sign out / Exit
            </button>
          </div>
        </>
      )}

      {tab === 'menu' && <CartBar cart={cart} open={() => setCo(true)} />}

      {co && (
        <Checkout
          cart={cart}
          setCart={setCart}
          mode="customer"
          via={via}
          tb0={tb}
          sess={sess}
          close={() => setCo(false)}
          onPlaced={() => {
            setCo(false);
            setTab('orders');
          }}
        />
      )}

      {rc && <Receipt o={rc} close={() => setRc(null)} />}

      {momoModal && (
        <Sheet title={`Pay Order ${momoModal.no}`} onClose={() => setMomoModal(null)}>
          <div className="card">
            <div className="row" style={{ marginBottom: 8 }}>
              <span>Total Bill:</span>
              <b style={{ fontSize: 20 }}>{fmt(tot(momoModal))}</b>
            </div>
            <div className="row" style={{ marginBottom: 12 }}>
              <span>Table / Order:</span>
              <b>Table {momoModal.tb} ({momoModal.no})</b>
            </div>

            <p style={{ margin: '8px 0' }}><small>Choose provider for instant push prompt (STK Push):</small></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '8px 0' }}>
              <button className="btn sm ghost active-site">M-Pesa (Vodacom)</button>
              <button className="btn sm ghost">Tigo Pesa</button>
              <button className="btn sm ghost">Airtel Money</button>
            </div>

            <input
              className="inp"
              placeholder="Confirm Mobile Phone"
              defaultValue={sess?.ph || '0712000111'}
            />

            <p style={{ fontSize: 13, color: 'var(--mut)', margin: '10px 0' }}>
              Simulates verified provider webhook callback (SRS PAY-03).
            </p>

            <button
              className="btn o"
              disabled={busyPay === momoModal.id}
              onClick={() => confirmMomoPayment(momoModal.id)}
            >
              {busyPay === momoModal.id ? 'Verifying with Telco Gateway…' : `Send USSD Push & Pay ${fmt(tot(momoModal))}`}
            </button>
          </div>
        </Sheet>
      )}

      <Tabs
        cur={tab}
        set={setTab}
        tabs={[
          ['menu', 'Menu', '🍽️', cart.reduce((a, l) => a + l.q, 0)],
          ['orders', 'My Orders', '🧾', mine.filter(o => !o.paid && o.st !== 'cancelled').length],
          ['me', 'Profile', '👤', 0]
        ]}
      />
    </div>
  );
}

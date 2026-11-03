import React, { useState, useContext, useMemo } from 'react';
import { fmt, tot, calcNet, calcTax, M, MENU, TABLES, TW, SEATS } from '../data';
import { Ctx } from '../store';
import { Hd, Install, Pill, Receipt, Sheet, TableMap, Tabs, TopBar } from '../components/ui';
import { Menu } from '../components/Ordering';
import { TableSlideSelector } from '../components/TableSlideSelector';
import { QuickAddMenuItemModal } from '../components/FastDrinksAndInventory';
import { MenuManagementView } from '../components/MenuManagement';

export function Cashier({ sess, out, setSess, setV }) {
  const { S, A, wn } = useContext(Ctx);

  // Cashier main views: 'orders' (Image 3 Bitepoint view), 'pos' (Image 1 POS view), 'floor', 'cash'
  const [cashierView, setCashierView] = useState('orders');

  // Filter tabs for Image 3 Orders screen
  const [filterTab, setFilterTab] = useState('all'); // all, process, online, billreq, completed
  const [searchQ, setSearchQ] = useState('');

  // Modals
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [tenderAmt, setTenderAmt] = useState('');
  const [payMethod, setPayMethod] = useState('cash'); // cash, card, momo
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [rc, setRc] = useState(null);
  const [discountOrder, setDiscountOrder] = useState(null);
  const [discountType, setDiscountType] = useState('10');
  const [discountReason, setDiscountReason] = useState('Manager Goodwill');
  const [zReportOpen, setZReportOpen] = useState(false);
  const [cx, setCx] = useState(null);
  const [showFloorSlide, setShowFloorSlide] = useState(false);
  const [quickAddModal, setQuickAddModal] = useState(false);

  // Cash drawer state
  const [fl, setFl] = useState(String(S.openingFloat || 200000));
  const [cnt, setCnt] = useState(S.countedCash || '');
  const [ho, setHo] = useState({});

  // Cart for POS Desk Order mode (Image 1)
  const [posCart, setPosCart] = useState([]);
  const [floorTable, setFloorTable] = useState('T1');

  // Toast
  const [toastMsg, setToastMsg] = useState('');

  const showToast = msg => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const orders = S.orders || [];

  // Groupings
  const onlineOrders = orders.filter(o => o.online || o.src === 'ONLINE_ORDER');
  const pendingOnlineOrders = onlineOrders.filter(o => ['placed', 'accepted'].includes(o.st) && !o.paid);
  const onProcessOrders = orders.filter(o => ['placed', 'accepted', 'preparing'].includes(o.st));
  const billReqOrders = orders.filter(o => o.st === 'billreq' || (o.st === 'ready' && !o.paid));
  const completedOrders = orders.filter(o => o.paid || o.st === 'closed');
  const paidOrders = orders.filter(o => o.paid || o.st === 'closed');

  const byPayment = m => paidOrders.filter(o => o.pm === m).reduce((a, o) => a + tot(o), 0);

  // Filtered orders list matching Image 3
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Tab filter
      if (filterTab === 'process') {
        if (!['placed', 'accepted', 'preparing'].includes(o.st)) return false;
      } else if (filterTab === 'online') {
        if (!o.online && o.src !== 'ONLINE_ORDER') return false;
      } else if (filterTab === 'billreq') {
        if (o.st !== 'billreq' && o.st !== 'ready' && o.paid) return false;
      } else if (filterTab === 'completed') {
        if (!o.paid && o.st !== 'closed') return false;
      }

      // Search filter
      if (searchQ) {
        const q = searchQ.toLowerCase();
        const matchNo = (o.no || '').toLowerCase().includes(q);
        const matchBy = (o.by || '').toLowerCase().includes(q);
        const matchTb = (o.tb || '').toLowerCase().includes(q);
        const matchItems = (o.it || []).some(l => (M[l.id]?.n || '').toLowerCase().includes(q));
        if (!matchNo && !matchBy && !matchTb && !matchItems) return false;
      }

      return true;
    });
  }, [orders, filterTab, searchQ]);

  // Handle Touch Numpad inputs
  const handleNumpadPress = val => {
    if (val === 'C') {
      setTenderAmt('');
    } else if (val === '⌫') {
      setTenderAmt(prev => prev.slice(0, -1));
    } else if (val === '.') {
      if (!tenderAmt.includes('.')) setTenderAmt(prev => (prev || '0') + '.');
    } else {
      setTenderAmt(prev => prev + val);
    }
  };

  const handleQuickCash = amt => {
    setTenderAmt(String(amt));
  };

  const handleSettlePayment = () => {
    if (!paymentModalOrder) return;
    const order = paymentModalOrder;
    const totalDue = tot(order);
    const numTender = parseFloat(tenderAmt) || totalDue;
    const refCode = payMethod === 'momo' ? 'MP' + Math.random().toString(36).slice(2, 7).toUpperCase() :
                    payMethod === 'card' ? 'TX' + Math.random().toString(36).slice(2, 7).toUpperCase() :
                    'CSH' + Math.random().toString(36).slice(2, 7).toUpperCase();

    A.pay(order.id, payMethod, refCode, sess?.name || 'Cashier');
    showToast(`✓ Order ${order.no} marked as PAID via ${payMethod.toUpperCase()} (${fmt(totalDue)})`);
    setPaymentModalOrder(null);
    setTenderAmt('');
  };

  const handleAcceptOnlineOrder = orderId => {
    A.st(orderId, 'accepted', sess?.name || 'Cashier');
    showToast(`✓ Online order #${orderId} accepted and forwarded to kitchen!`);
  };

  const handleApplyDiscount = () => {
    if (!discountOrder) return;
    const pct = +discountType || 10;
    discountOrder.discountPct = pct;
    discountOrder.discountReason = discountReason;
    showToast(`✓ Applied ${pct}% discount to ${discountOrder.no}`);
    setDiscountOrder(null);
  };

  // Avatar badge color mapping matching Image 3
  const getAvatarColor = (tb, isOnline) => {
    if (isOnline) return 'coral';
    if (!tb) return 'blue';
    if (tb.startsWith('A')) return 'green';
    if (tb.startsWith('B')) return 'teal';
    if (tb.startsWith('C')) return 'blue';
    if (tb.toLowerCase().includes('take') || tb === 'TA') return 'amber';
    return 'green';
  };

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="app wide" style={{ maxWidth: 1400 }}>
      <TopBar sess={sess} setSess={setSess} setV={setV} currentView="cashier" />

      {toastMsg && (
        <div className="toast" style={{ background: '#15803D' }}>
          {toastMsg}
        </div>
      )}

      {/* Online Order Alert Banner (for Cashier visibility & control) */}
      {pendingOnlineOrders.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #FF5A43 0%, #FF8A3C 100%)',
            color: '#fff',
            borderRadius: 16,
            padding: '12px 18px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(255,90,67,0.3)',
            animation: 'pulse 2.5s infinite'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>📱</span>
            <div>
              <b style={{ fontSize: 15 }}>
                {pendingOnlineOrders.length} New Customer Online Order{pendingOnlineOrders.length > 1 ? 's' : ''} Received!
              </b>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                Diners placed orders via customer web portal awaiting cashier review.
              </div>
            </div>
          </div>

          <button
            className="btn sm"
            style={{ background: '#fff', color: '#FF5A43', fontWeight: 800, padding: '7px 16px', borderRadius: 10 }}
            onClick={() => {
              setCashierView('orders');
              setFilterTab('online');
            }}
          >
            Review Online Orders ➔
          </button>
        </div>
      )}

      {/* Cashier Mode Sub-Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div className="inv-subnav" style={{ margin: 0 }}>
          <button
            className={`inv-tab-btn ${cashierView === 'orders' ? 'on' : ''}`}
            onClick={() => setCashierView('orders')}
          >
            <span>📋 Orders & Online Control</span>
            <span className={`inv-tab-badge ${pendingOnlineOrders.length ? 'warn' : ''}`}>
              {orders.filter(o => !o.paid && o.st !== 'closed').length}
            </span>
          </button>
          <button
            className={`inv-tab-btn ${cashierView === 'pos' ? 'on' : ''}`}
            onClick={() => setCashierView('pos')}
          >
            <span>🍽️ Desk POS & Menu</span>
          </button>
          <button
            className={`inv-tab-btn ${cashierView === 'menu' ? 'on' : ''}`}
            onClick={() => setCashierView('menu')}
          >
            <span>📖 Menu Catalog</span>
            <span className="inv-tab-badge">
              {S.menu ? S.menu.length : MENU.length}
            </span>
          </button>
          <button
            className={`inv-tab-btn ${cashierView === 'floor' ? 'on' : ''}`}
            onClick={() => setCashierView('floor')}
          >
            <span>🪑 Floor Plan Map</span>
          </button>
          <button
            className={`inv-tab-btn ${cashierView === 'cash' ? 'on' : ''}`}
            onClick={() => setCashierView('cash')}
          >
            <span>💵 Cash Drawer & Shift</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn sm o"
            style={{ borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5 }}
            onClick={() => setQuickAddModal(true)}
            title="Add a menu item in under 10 seconds; goes live on POS immediately marked 'Needs Review'"
          >
            <span>⚡</span>
            <span>+ Quick Add Item (&lt;10s)</span>
          </button>
          <button
            className="btn ghost sm"
            style={{ borderRadius: 12, border: '1px solid var(--line)' }}
            onClick={() => setZReportOpen(true)}
          >
            📑 End Shift Z-Report
          </button>
          <button className="btn ghost sm" style={{ borderRadius: 12 }} onClick={out}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ========================================================
          VIEW 1: IMAGE 3 — ORDERS SCREEN (Bitepoint Style)
          ======================================================== */}
      {cashierView === 'orders' && (
        <div>
          {/* Header row with date */}
          <div className="bite-header-row">
            <div>
              <h1 className="bite-title">Orders</h1>
              <small style={{ color: 'var(--mut)' }}>Live transaction control, dine-in tables, and customer online orders</small>
            </div>
            <div className="bite-date-badge">
              📅 {todayDateString}
            </div>
          </div>

          {/* Filter tabs & Search Bar (Image 3 style) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div className="bite-tabs-bar" style={{ margin: 0 }}>
              <button
                className={`bite-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
                onClick={() => setFilterTab('all')}
              >
                All ({orders.length})
              </button>
              <button
                className={`bite-tab-btn ${filterTab === 'process' ? 'active' : ''}`}
                onClick={() => setFilterTab('process')}
              >
                On Process ({onProcessOrders.length})
              </button>
              <button
                className={`bite-tab-btn ${filterTab === 'online' ? 'online-active' : ''}`}
                onClick={() => setFilterTab('online')}
                style={{ borderColor: pendingOnlineOrders.length ? '#FF5A43' : 'var(--line)' }}
              >
                📱 Online Orders {onlineOrders.length > 0 && `(${onlineOrders.length})`}
                {pendingOnlineOrders.length > 0 && (
                  <span style={{ background: '#fff', color: '#FF5A43', borderRadius: 99, padding: '1px 6px', fontSize: 11, fontWeight: 800 }}>
                    {pendingOnlineOrders.length} new
                  </span>
                )}
              </button>
              <button
                className={`bite-tab-btn ${filterTab === 'billreq' ? 'active' : ''}`}
                onClick={() => setFilterTab('billreq')}
              >
                Waiting For Payment ({billReqOrders.length})
              </button>
              <button
                className={`bite-tab-btn ${filterTab === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterTab('completed')}
              >
                Completed ({completedOrders.length})
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="search" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '7px 14px', borderRadius: 14, minWidth: 260 }}>
                <span>🔍</span>
                <input
                  placeholder="Search a name, order, or etc"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={{ fontSize: 13.5 }}
                />
                {searchQ && <button onClick={() => setSearchQ('')} style={{ color: 'var(--mut)', padding: '0 4px' }}>✕</button>}
              </div>
              <button
                className="btn ghost sm"
                style={{ borderRadius: 12, padding: '8px 12px', border: '1px solid var(--line)' }}
                title="Filter options"
                onClick={() => setFilterTab('all')}
              >
                ⚙️
              </button>
            </div>
          </div>

          {!filteredOrders.length && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>No Orders Found</h3>
              <p style={{ color: 'var(--mut)', maxWidth: 400, margin: '6px auto 16px' }}>
                There are no orders matching this filter. Place an order via Desk POS or the customer web portal to see it here live.
              </p>
              <button className="btn o sm" style={{ background: '#FF5A43' }} onClick={() => setCashierView('pos')}>
                Open Desk POS
              </button>
            </div>
          )}

          {/* Bitepoint Order Cards Grid (Image 3 style) */}
          <div className="bite-orders-grid">
            {filteredOrders.map(o => {
              const isOnline = o.online || o.src === 'ONLINE_ORDER';
              const avatarColor = getAvatarColor(o.tb, isOnline);
              const avatarLabel = isOnline ? '📱' : (o.tb || 'T1').slice(0, 3);
              const orderTotal = tot(o);

              let statusTagClass = 'process';
              let statusLabel = 'In Progress';
              let statusSub = 'Cooking Now';

              if (o.paid || o.st === 'closed') {
                statusTagClass = 'completed';
                statusLabel = 'Completed';
                statusSub = 'Paid & Closed';
              } else if (o.st === 'ready') {
                statusTagClass = 'ready';
                statusLabel = 'Ready';
                statusSub = 'Ready to serve';
              } else if (o.st === 'billreq') {
                statusTagClass = 'process';
                statusLabel = 'Bill Requested';
                statusSub = 'Waiting For Payment';
              } else if (o.st === 'placed') {
                statusTagClass = 'pending';
                statusLabel = isOnline ? 'Online Alert' : 'Pending';
                statusSub = 'Awaiting Kitchen';
              }

              return (
                <div key={o.id} className="bite-card">
                  {/* Card Header: Avatar circle, customer name, type, and status tag */}
                  <div className="bite-card-header">
                    <div className={`bite-avatar ${avatarColor}`}>
                      {avatarLabel}
                    </div>

                    <div>
                      <div className="bite-customer-name">
                        {o.by || 'Guest Customer'}
                      </div>
                      <div className="bite-order-type">
                        Order {o.no} / {o.orderType || (isOnline ? 'Online Order' : o.tb === 'Takeaway' ? 'Takeaway' : 'Dine In')}
                      </div>
                    </div>

                    <div className={`bite-status-tag ${statusTagClass}`}>
                      <span>●</span>
                      <span>{statusLabel}</span>
                    </div>
                  </div>

                  {/* Date and time meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--mut)', marginBottom: 8 }}>
                    <span>{new Date(o.t).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span>{new Date(o.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Items breakdown list */}
                  <div className="bite-items-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--mut)', fontWeight: 700, marginBottom: 4 }}>
                      <span>Items</span>
                      <div style={{ display: 'flex', gap: 20 }}>
                        <span>Qty</span>
                        <span>Price</span>
                      </div>
                    </div>

                    {(o.it || []).slice(0, 3).map((line, idx) => {
                      const item = M[line.id] || { n: `Item #${line.id}`, p: 0 };
                      return (
                        <div key={idx} className="bite-item-row">
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 6 }}>
                            {item.n}
                          </span>
                          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                            <span style={{ color: 'var(--mut)' }}>{line.q}</span>
                            <span style={{ fontWeight: 700 }}>{fmt(item.p * line.q)}</span>
                          </div>
                        </div>
                      );
                    })}

                    {(o.it || []).length > 3 && (
                      <div style={{ fontSize: 11, color: '#FF5A43', fontWeight: 700, marginTop: 4 }}>
                        +{o.it.length - 3} more item{o.it.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Total row */}
                    <div className="bite-total-row">
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
                      <span className="bite-total-amt">{fmt(orderTotal)}</span>
                    </div>
                  </div>

                  {/* Action buttons (matching Image 3) */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                    <button
                      className="action-btn"
                      style={{ flex: 1, justifyContent: 'center', padding: '9px 12px' }}
                      onClick={() => setDetailsOrder(o)}
                    >
                      See Details
                    </button>

                    {/* Online Order Quick Acceptance */}
                    {isOnline && o.st === 'placed' ? (
                      <button
                        className="btn sm o"
                        style={{ flex: 1, background: '#FF5A43', fontSize: 12.5 }}
                        onClick={() => handleAcceptOnlineOrder(o.id)}
                      >
                        ✓ Accept Online
                      </button>
                    ) : !o.paid ? (
                      <button
                        className="bite-btn-pay"
                        onClick={() => {
                          setPaymentModalOrder(o);
                          setTenderAmt(String(orderTotal));
                        }}
                      >
                        Pay Bills
                      </button>
                    ) : (
                      <button
                        className="action-btn settle"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => setRc(o)}
                      >
                        Receipt ✓
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 2: IMAGE 1 — DESK POS & MENU (Tst Food Style)
          ======================================================== */}
      {cashierView === 'pos' && (
        <div>
          <Menu
            cart={posCart}
            setCart={setPosCart}
            isPosMode={true}
            onPlaced={() => {
              setCashierView('orders');
              setFilterTab('all');
            }}
            sess={sess}
          />
        </div>
      )}

      {/* ========================================================
          VIEW 3: FLOOR PLAN & TABLE SELECTION
          ======================================================== */}
      {cashierView === 'floor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Floor KPI Ribbon */}
          {(() => {
            const dineTables = TABLES.filter(t => t !== 'Takeaway' && t !== 'Online');
            const occupiedTables = dineTables.filter(t =>
              orders.some(o => o.tb === t && !['paid', 'closed', 'cancelled'].includes(o.st))
            );
            const availableTables = dineTables.filter(t =>
              !orders.some(o => o.tb === t && !['paid', 'closed', 'cancelled'].includes(o.st))
            );
            const activeFloorOrders = orders.filter(o =>
              dineTables.includes(o.tb) && !['paid', 'closed', 'cancelled'].includes(o.st)
            );
            const floorRevenue = activeFloorOrders.reduce((sum, o) => sum + tot(o), 0);
            const totalSeatedGuests = activeFloorOrders.reduce((sum, o) => sum + (o.guests || SEATS[o.tb] || 2), 0);

            return (
              <div className="card" style={{ padding: '16px 20px', borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>
                      Restaurant Floor Plan & Seating Status
                    </h2>
                    <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>
                      Live table occupancy, active bills, waiter assignments, and floor operations
                    </small>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn o sm"
                      style={{ background: 'linear-gradient(135deg, #0E5A47, #15803D)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={() => setShowFloorSlide(true)}
                    >
                      <span>🪑</span>
                      <span>Open Slide Table Selector ➔</span>
                    </button>
                    <button
                      type="button"
                      className="btn o sm"
                      style={{ background: '#FF5A43' }}
                      onClick={() => setCashierView('pos')}
                    >
                      + Create Desk Order
                    </button>
                  </div>
                </div>

                {/* Metrics Summary Strip */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 12,
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: '1px solid var(--line)'
                }}>
                  <div style={{ background: 'var(--bg)', padding: '10px 14px', borderRadius: 14 }}>
                    <small style={{ color: 'var(--mut)', fontWeight: 600 }}>Total Floor Tables</small>
                    <b style={{ fontSize: 20, display: 'block', color: 'var(--tx)' }}>{dineTables.length} Tables</b>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '10px 14px', borderRadius: 14 }}>
                    <small style={{ color: 'var(--mut)', fontWeight: 600 }}>Available (Vacant)</small>
                    <b style={{ fontSize: 20, display: 'block', color: '#16a34a' }}>{availableTables.length} Free</b>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '10px 14px', borderRadius: 14 }}>
                    <small style={{ color: 'var(--mut)', fontWeight: 600 }}>Occupied (Seated)</small>
                    <b style={{ fontSize: 20, display: 'block', color: '#ef4444' }}>{occupiedTables.length} Occupied</b>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '10px 14px', borderRadius: 14 }}>
                    <small style={{ color: 'var(--mut)', fontWeight: 600 }}>Total Guests Seated</small>
                    <b style={{ fontSize: 20, display: 'block', color: '#007AFF' }}>{totalSeatedGuests} Diners</b>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '10px 14px', borderRadius: 14 }}>
                    <small style={{ color: 'var(--mut)', fontWeight: 600 }}>Active Floor Bill</small>
                    <b style={{ fontSize: 20, display: 'block', color: '#0E5A47' }}>{fmt(floorRevenue)}</b>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Interactive TableMap Component */}
          <div className="card" style={{ borderRadius: 20, padding: 18 }}>
            <TableMap val={floorTable} set={t => setFloorTable(t)} big={true} />

            {/* Selected Table Inspector Panel */}
            {floorTable && (() => {
              const activeForTable = orders.filter(o => o.tb === floorTable && !['paid', 'closed', 'cancelled'].includes(o.st));
              const isOccupied = activeForTable.length > 0;
              const cap = SEATS[floorTable] || 4;
              const waiterName = wn(TW?.[floorTable]) || 'Staff';
              const activeTotal = activeForTable.reduce((acc, o) => acc + tot(o), 0);

              return (
                <div style={{
                  marginTop: 18,
                  background: 'var(--bg)',
                  borderRadius: 18,
                  padding: 18,
                  border: `2px solid ${isOccupied ? '#FCA5A5' : '#86EFAC'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <b style={{ fontSize: 20, color: 'var(--tx)' }}>
                          {floorTable === 'Takeaway' ? '🛵 Takeaway Counter' : `Table ${floorTable}`}
                        </b>
                        <span style={{
                          fontSize: 12,
                          padding: '3px 10px',
                          borderRadius: 99,
                          fontWeight: 800,
                          background: isOccupied ? '#FEE2E2' : '#DCFCE7',
                          color: isOccupied ? '#DC2626' : '#166534'
                        }}>
                          {isOccupied ? '🔴 OCCUPIED' : '🟢 AVAILABLE'}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--mut)', display: 'block', marginTop: 3 }}>
                        {floorTable === 'Takeaway'
                          ? 'Counter Service & Pickup'
                          : `Capacity: ${cap} Seats · Assigned Waiter: ${waiterName}`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {isOccupied ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 700 }}>
                            🔒 Occupied (Cannot Select)
                          </span>
                        </div>
                      ) : (
                        <button
                          className="btn o sm"
                          style={{ background: '#FF5A43', fontWeight: 800 }}
                          onClick={() => {
                            setCashierView('pos');
                          }}
                        >
                          + Seat Diners & Open POS Order ➔
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Orders List or Available Confirmation */}
                  {isOccupied ? (
                    <div>
                      <div style={{
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: 12,
                        padding: '10px 14px',
                        marginBottom: 12,
                        color: '#991B1B',
                        fontSize: 12.5,
                        lineHeight: 1.4
                      }}>
                        <b>⚠️ Operational Rule:</b> Table {floorTable} currently has active dining in progress. You cannot seat new guests until the open order is paid and closed.
                      </div>

                      <p style={{ margin: '8px 0 6px', fontSize: 13, fontWeight: 700, color: 'var(--mut)' }}>
                        Active Dining Ticket{activeForTable.length > 1 ? 's' : ''} ({activeForTable.length}):
                      </p>

                      {activeForTable.map(o => (
                        <div
                          key={o.id}
                          style={{
                            background: 'var(--card)',
                            borderRadius: 14,
                            padding: 14,
                            marginBottom: 8,
                            border: '1px solid var(--line)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <b style={{ fontSize: 15 }}>Ticket {o.no}</b>
                              <span>·</span>
                              <span style={{ fontWeight: 600 }}>{o.by || 'Guest'}</span>
                              <Pill st={o.st} />
                            </div>
                            <small style={{ color: 'var(--mut)', display: 'block', marginTop: 3 }}>
                              Seated {Math.max(1, Math.round((Date.now() - o.t) / 60000))} min ago · {(o.it || []).length} items · Total: <b style={{ color: '#15803D' }}>{fmt(tot(o))}</b>
                            </small>
                          </div>

                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="action-btn"
                              onClick={() => setDetailsOrder(o)}
                            >
                              See Details
                            </button>
                            <button
                              className="bite-btn-pay"
                              style={{ padding: '7px 16px', fontSize: 12.5 }}
                              onClick={() => {
                                setPaymentModalOrder(o);
                                setTenderAmt(String(tot(o)));
                              }}
                            >
                              Pay Bill ({fmt(tot(o))})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '12px 14px',
                      background: '#F0FDF4',
                      borderRadius: 12,
                      color: '#166534',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>✓ Table {floorTable} is clean, vacant, and available for seating.</span>
                      <button
                        className="btn sm o"
                        style={{ background: '#15803D', fontSize: 12 }}
                        onClick={() => setCashierView('pos')}
                      >
                        Start Order Now
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 4: CASH DRAWER & CLOSING
          ======================================================== */}
      {cashierView === 'cash' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 800 }}>Cash Drawer & Shift Float Reconciliation</h3>
            <div className="tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 16 }}>
              <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 14 }}>
                <small style={{ color: 'var(--mut)' }}>Opening Float:</small>
                <b style={{ fontSize: 20, display: 'block', color: 'var(--tx)' }}>{fmt(+fl || 0)}</b>
              </div>
              <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 14 }}>
                <small style={{ color: 'var(--mut)' }}>Cash Sales Recorded:</small>
                <b style={{ fontSize: 20, display: 'block', color: '#15803D' }}>{fmt(byPayment('cash'))}</b>
              </div>
              <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 14 }}>
                <small style={{ color: 'var(--mut)' }}>Mobile Money Sales:</small>
                <b style={{ fontSize: 20, display: 'block', color: '#007AFF' }}>{fmt(byPayment('momo'))}</b>
              </div>
              <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 14 }}>
                <small style={{ color: 'var(--mut)' }}>Debit Card Sales:</small>
                <b style={{ fontSize: 20, display: 'block', color: '#E67E22' }}>{fmt(byPayment('card'))}</b>
              </div>
            </div>

            <div className="fld" style={{ marginBottom: 12 }}>
              <span>Opening Shift Float:</span>
              <input
                className="inp"
                value={fl}
                onChange={e => {
                  setFl(e.target.value);
                  A.updateFloat(+e.target.value, cnt);
                }}
                style={{ width: 140 }}
              />
            </div>

            <div className="fld">
              <span>Counted Drawer Cash:</span>
              <input
                className="inp"
                value={cnt}
                placeholder="Count drawer bills"
                onChange={e => {
                  setCnt(e.target.value);
                  A.updateFloat(+fl, e.target.value);
                }}
                style={{ width: 140 }}
              />
            </div>

            {cnt !== '' && (
              <div className="row" style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                <b>Over / Short Balance Discrepancy:</b>
                <b style={{ color: (+cnt) - ((+fl || 0) + byPayment('cash')) < 0 ? '#FF3B30' : '#15803D', fontSize: 18 }}>
                  {fmt((+cnt) - ((+fl || 0) + byPayment('cash')))}
                </b>
              </div>
            )}
          </div>

          <button
            className="btn o"
            style={{ background: '#FF5A43' }}
            onClick={() => setZReportOpen(true)}
          >
            Review Shift & Generate Official Z-Report
          </button>
        </div>
      )}

      {/* ========================================================
          IMAGE 3 OVERLAY: TOUCH NUMPAD & PAYMENT MODAL
          ======================================================== */}
      {paymentModalOrder && (
        <div className="ov" onClick={() => setPaymentModalOrder(null)}>
          <div className="numpad-modal-wrap" onClick={e => e.stopPropagation()}>
            {/* Left Receipt Side (with serrated bottom edge) */}
            <div className="numpad-receipt-side">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <b style={{ fontSize: 18, color: '#111827' }}>Payment</b>
                <button
                  onClick={() => setPaymentModalOrder(null)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--mut)' }}
                >
                  ✕
                </button>
              </div>

              {/* Customer Information */}
              <div style={{ marginBottom: 12, fontSize: 13, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                <small style={{ color: 'var(--mut)', fontWeight: 700 }}>Customer Information</small>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <div
                    className="bite-avatar green"
                    style={{ width: 36, height: 36, fontSize: 14 }}
                  >
                    {paymentModalOrder.tb?.slice(0, 3) || 'A4'}
                  </div>
                  <div>
                    <b style={{ fontSize: 14 }}>{paymentModalOrder.by || 'Guest Customer'}</b>
                    <div style={{ fontSize: 11, color: 'var(--mut)' }}>
                      Order {paymentModalOrder.no} · {paymentModalOrder.tb}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction items */}
              <small style={{ color: 'var(--mut)', fontWeight: 700, marginBottom: 6, display: 'block' }}>
                Transaction Items
              </small>
              <div style={{ flex: 1, maxHeight: 180, overflowY: 'auto', marginBottom: 12 }}>
                {(paymentModalOrder.it || []).map((l, idx) => {
                  const item = M[l.id] || { n: `Item #${l.id}`, p: 0 };
                  return (
                    <div key={idx} className="row" style={{ padding: '4px 0', fontSize: 13 }}>
                      <div>
                        <b>{item.n}</b>
                        <div style={{ fontSize: 11, color: 'var(--mut)' }}>{fmt(item.p)}</div>
                      </div>
                      <b style={{ color: '#111827' }}>{l.q}x</b>
                    </div>
                  );
                })}
              </div>

              {/* Financial Totals */}
              <div style={{ borderTop: '1px dashed var(--line)', paddingTop: 8, fontSize: 13 }}>
                <div className="row" style={{ padding: '2px 0', color: 'var(--mut)' }}>
                  <span>Items ({paymentModalOrder.it?.reduce((a, l) => a + l.q, 0) || 0})</span>
                  <span>{fmt(tot(paymentModalOrder))}</span>
                </div>
                <div className="row" style={{ padding: '2px 0', color: 'var(--mut)' }}>
                  <span>Tax (10%)</span>
                  <span>{fmt(calcTax(tot(paymentModalOrder)))}</span>
                </div>
                {paymentModalOrder.discountPct && (
                  <div className="row" style={{ padding: '2px 0', color: '#FF3B30' }}>
                    <span>Discount ({paymentModalOrder.discountPct}%)</span>
                    <span>-{fmt(tot(paymentModalOrder) * (paymentModalOrder.discountPct / 100))}</span>
                  </div>
                )}
                <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: 6, marginTop: 4, alignItems: 'baseline' }}>
                  <b style={{ fontSize: 16 }}>Total</b>
                  <b style={{ fontSize: 24, fontWeight: 800, color: '#15803D' }}>{fmt(tot(paymentModalOrder))}</b>
                </div>
              </div>
            </div>

            {/* Right Keypad Side */}
            <div className="numpad-keypad-side">
              {/* Payment Mode Segment */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[
                  ['cash', '💵 Cash'],
                  ['card', '💳 Debit Card'],
                  ['momo', '📱 Mobile Money']
                ].map(([m, label]) => (
                  <button
                    key={m}
                    className={`action-btn ${payMethod === m ? 'settle' : ''}`}
                    style={{ flex: 1, padding: '7px 4px', fontSize: 12, justifyContent: 'center' }}
                    onClick={() => setPayMethod(m)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Quick Cash Presets (matching Image 3 top buttons) */}
              <div className="quick-cash-row">
                {[5000, 10000, 20000, 50000].map(val => (
                  <button
                    key={val}
                    className="quick-cash-chip"
                    onClick={() => handleQuickCash(val)}
                  >
                    {fmt(val).replace('TSh ', '')}
                  </button>
                ))}
              </div>

              {/* Tender Amount Display */}
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <small style={{ color: 'var(--mut)', fontWeight: 700 }}>Tendered:</small>
                <b style={{ fontSize: 22, color: 'var(--tx)' }}>
                  {tenderAmt ? fmt(+tenderAmt) : fmt(tot(paymentModalOrder))}
                </b>
              </div>

              {/* Touch Numpad Grid (Image 3 style) */}
              <div className="numpad-grid">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(btn => (
                  <button
                    key={btn}
                    className="numpad-btn"
                    onClick={() => handleNumpadPress(btn)}
                  >
                    {btn}
                  </button>
                ))}
              </div>

              {/* Change calculation */}
              {parseFloat(tenderAmt) > tot(paymentModalOrder) && (
                <div className="row" style={{ fontSize: 13, color: '#15803D', fontWeight: 700, marginBottom: 8 }}>
                  <span>Change Due to Diner:</span>
                  <b>{fmt(parseFloat(tenderAmt) - tot(paymentModalOrder))}</b>
                </div>
              )}

              {/* Pay Now Button (golden-orange matching Image 3) */}
              <button
                className="bite-btn-pay"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: 16,
                  fontWeight: 800,
                  borderRadius: 14,
                  boxShadow: '0 4px 16px rgba(245,166,35,0.4)'
                }}
                onClick={handleSettlePayment}
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 5: MENU MANAGEMENT & CATALOG DASHBOARD
          ======================================================== */}
      {cashierView === 'menu' && (
        <MenuManagementView
          menuList={S.menu && S.menu.length ? S.menu : MENU}
          stockList={S.stock || []}
          outOfStockIds={S.outOfStockIds || []}
          onToggle86={(id, actor) => A.toggle86(id, actor || sess?.name || 'Cashier')}
          onCreateItem={(data, actor) => {
            A.createMenuItem(data, actor || sess?.name || 'Cashier');
            showToast(`✓ Created dish "${data.n}" in menu catalog!`);
          }}
          onUpdateItem={(id, data, actor) => {
            A.updateMenuItem(id, data, actor || sess?.name || 'Cashier');
            showToast(`✓ Updated "${data.n || 'Dish'}" details!`);
          }}
          onDeleteItem={(id, actor) => {
            A.deleteMenuItem(id, actor || sess?.name || 'Cashier');
            showToast(`✓ Dish removed from menu.`);
          }}
          actor={sess?.name || 'Cashier'}
        />
      )}

      {/* Order Details Drawer */}
      {detailsOrder && (
        <Sheet title={`Order Details: ${detailsOrder.no}`} onClose={() => setDetailsOrder(null)}>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="row" style={{ marginBottom: 8 }}>
              <b style={{ fontSize: 18 }}>Table: {detailsOrder.tb}</b>
              <Pill st={detailsOrder.st} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13, color: 'var(--mut)', marginBottom: 10 }}>
              <div>Guest: <b>{detailsOrder.by}</b></div>
              <div>Source: <b>{detailsOrder.src}</b></div>
              <div>Waiter: <b>{wn(detailsOrder.wid)}</b></div>
              <div>Placed: <b>{new Date(detailsOrder.t).toLocaleTimeString()}</b></div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '8px 0', margin: '8px 0' }}>
              {(detailsOrder.it || []).map((l, i) => (
                <div key={i} className="row" style={{ padding: '4px 0' }}>
                  <span>{l.q}× {M[l.id]?.n}</span>
                  <b>{fmt((M[l.id]?.p || 0) * l.q)}</b>
                </div>
              ))}
            </div>

            <div className="row">
              <b>Total Amount:</b>
              <b style={{ fontSize: 20, color: '#15803D' }}>{fmt(tot(detailsOrder))}</b>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {!detailsOrder.paid && (
              <button
                className="bite-btn-pay"
                style={{ flex: 1 }}
                onClick={() => {
                  setPaymentModalOrder(detailsOrder);
                  setTenderAmt(String(tot(detailsOrder)));
                  setDetailsOrder(null);
                }}
              >
                Pay Bills
              </button>
            )}
            <button
              className="action-btn"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => {
                setDiscountOrder(detailsOrder);
                setDetailsOrder(null);
              }}
            >
              % Discount
            </button>
            <button
              className="btn ghost sm"
              style={{ flex: 1 }}
              onClick={() => setDetailsOrder(null)}
            >
              Close
            </button>
          </div>
        </Sheet>
      )}

      {/* Discount Modal */}
      {discountOrder && (
        <Sheet title={`Apply Discount to ${discountOrder.no}`} onClose={() => setDiscountOrder(null)}>
          <div className="card">
            <div className="row" style={{ marginBottom: 10 }}>
              <span>Order Total:</span>
              <b>{fmt(tot(discountOrder))}</b>
            </div>

            <small style={{ fontWeight: 700 }}>Discount Percentage:</small>
            <div className="seg">
              {['5', '10', '15', '20', '50'].map(p => (
                <button key={p} className={discountType === p ? 'on' : ''} onClick={() => setDiscountType(p)}>
                  {p}%
                </button>
              ))}
            </div>

            <div style={{ margin: '10px 0' }}>
              <small style={{ fontWeight: 700 }}>Authorization Reason:</small>
              <select className="inp" value={discountReason} onChange={e => setDiscountReason(e.target.value)}>
                <option value="Manager Goodwill">Manager Goodwill / VIP Guest</option>
                <option value="Staff Dining">Staff Dining (20%)</option>
                <option value="Kitchen Delay Apology">Kitchen Delay Apology</option>
                <option value="Special Online Promo">Special Online Promo</option>
              </select>
            </div>

            <button className="btn o" style={{ background: '#FF5A43' }} onClick={handleApplyDiscount}>
              Apply {discountType}% Discount
            </button>
          </div>
        </Sheet>
      )}

      {/* Z-Report Modal */}
      {zReportOpen && (
        <Sheet title="Day End Shift Z-Report" onClose={() => setZReportOpen(false)}>
          <div className="card receipt-paper" style={{ fontFamily: 'monospace', fontSize: 13 }}>
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <b>SAFARI GRILL & LOUNGE</b>
              <br />
              <small>Z-REPORT · OFFICIAL REGISTER CLOSING</small>
            </div>

            <div style={{ borderTop: '1px dashed var(--line)', borderBottom: '1px dashed var(--line)', padding: '6px 0', margin: '6px 0' }}>
              <div className="row"><span>Date: {new Date().toLocaleDateString()}</span><span>Time: {new Date().toLocaleTimeString()}</span></div>
              <div className="row"><span>Cashier: {sess?.name || 'Cashier Desk'}</span><span>Status: BALANCED</span></div>
            </div>

            {[
              ['Paid Orders Settled', paidOrders.length],
              ['Gross Cash Sales', fmt(byPayment('cash'))],
              ['Mobile Money (M-Pesa/Tigo)', fmt(byPayment('momo'))],
              ['Debit Card Sales', fmt(byPayment('card'))],
              ['Total Net Revenue', fmt(byPayment('cash') + byPayment('momo') + byPayment('card'))],
              ['VAT Tax (10% Collected)', fmt(calcTax(byPayment('cash') + byPayment('momo') + byPayment('card')))],
              ['Opening Cash Float', fmt(+fl || 0)],
              ['Counted Drawer Cash', fmt(+cnt || 0)]
            ].map(([k, v]) => (
              <div key={k} className="row" style={{ padding: '3px 0' }}>
                <span>{k}:</span>
                <b>{v}</b>
              </div>
            ))}
          </div>

          <button className="btn o" style={{ marginTop: 12, background: '#FF5A43' }} onClick={() => setZReportOpen(false)}>
            Close & Lock Shift
          </button>
        </Sheet>
      )}

      {/* Receipt Modal */}
      {rc && <Receipt o={rc} close={() => setRc(null)} />}

      {/* Right Slide Drawer for Table Selection & Operational Status */}
      <TableSlideSelector
        isOpen={showFloorSlide}
        onClose={() => setShowFloorSlide(false)}
        selectedTable={floorTable}
        onSelectTable={(t) => {
          setFloorTable(t);
          setShowFloorSlide(false);
        }}
        guestCount={SEATS[floorTable] || 2}
      />

      {/* Desktop Left Sidebar & Mobile Bottom Navigation */}
      <Tabs
        cur={cashierView}
        set={setCashierView}
        tabs={[
          ['orders', 'Bill Queue', '🧾', billReqOrders.length],
          ['pos', 'Desk Order', '➕', 0],
          ['menu', 'Menu Catalog', '📖', 0],
          ['floor', 'Floor Plan', '🪑', 0],
          ['cash', 'Cash Drawer', '💵', 0]
        ]}
      />

      {/* Quick Add Menu Item Modal */}
      <QuickAddMenuItemModal
        isOpen={quickAddModal}
        onClose={() => setQuickAddModal(false)}
        onSave={item => {
          A.quickAddMenuItem(item, sess?.name || 'Cashier');
          showToast(`✓ Added "${item.n}" to POS live menu (marked Needs Review)`);
        }}
        actor={sess?.name || 'Cashier'}
      />
    </div>
  );
}

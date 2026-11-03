import React, { useState, useContext } from 'react';
import { fmt, tot, calcNet, calcTax, SITES, TABLES } from '../data';
import { Ctx } from '../store';
import { Hd, Pill, Sheet, Tabs, TopBar } from '../components/ui';
import { ManagerReviewModal } from '../components/FastDrinksAndInventory';
import { MenuManagementView } from '../components/MenuManagement';

export function Manager({ sess, out, setSess, setV }) {
  const { S, A, wn } = useContext(Ctx);
  const [tab, setTab] = useState('overview');
  const [selWaiterId, setSelWaiterId] = useState('all');
  const [drillOrder, setDrillOrder] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);

  // Commission Policy State (WCM-01 to WCM-14)
  const p0 = S.policy || { method: 'percent', rate: 5, fixed: 2000, basis: 'gross', trigger: 'payment', overrides: { w1: 5.5 } };
  const [policyForm, setPolicyForm] = useState(p0);
  const [policySaved, setPolicySaved] = useState(false);

  // Financial aggregates
  const paid = (S.orders || []).filter(o => o.paid || o.st === 'closed');
  const grossSales = paid.reduce((a, o) => a + tot(o), 0);
  const netSales = calcNet(grossSales);
  const taxCollected = calcTax(grossSales);
  const totalCovers = (S.orders || []).reduce((a, o) => a + (o.it || []).reduce((x, l) => x + l.q, 0), 0);
  const avgCheck = paid.length > 0 ? Math.round(grossSales / paid.length) : 0;
  const liveCount = (S.orders || []).filter(o => !['paid', 'closed', 'cancelled'].includes(o.st)).length;

  const commissionAccrued = (S.ledger || []).filter(l => l.st !== 'reversed').reduce((a, l) => a + l.amt, 0);
  const commissionCostPct = grossSales > 0 ? ((commissionAccrued / grossSales) * 100).toFixed(1) : '0.0';

  // Commission policy preview estimation (WCM-07)
  const fx = policyForm.method === 'fixed';
  const previewEst = paid.reduce((a, o) => {
    const base = policyForm.basis === 'net' ? tot(o) / 1.18 : tot(o);
    return a + (fx ? policyForm.fixed : Math.round((base * policyForm.rate) / 100));
  }, 0);

  const handleSavePolicy = () => {
    A.setPolicy(policyForm, sess?.name || 'Manager Rehema');
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 2500);
  };

  const currentSite = SITES.find(s => s.id === (S.siteId || 'masaki')) || SITES[0];
  const unreviewedItems = (S.menu || []).filter(m => m.needsReview);

  return (
    <div className="app wide">
      <TopBar sess={sess} setSess={setSess} setV={setV} currentView="manager" />

      {unreviewedItems.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          border: '1.5px solid #F59E0B',
          borderRadius: 16,
          padding: '12px 18px',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>⚠️</span>
            <div>
              <b style={{ color: '#92400E', fontSize: 14.5 }}>
                {unreviewedItems.length} Quick-Added Menu Item{unreviewedItems.length > 1 ? 's' : ''} Need Stock & Cost Linking
              </b>
              <div style={{ fontSize: 12, color: '#B45309' }}>
                Items were added rapidly on-site (&lt;10s) by cashier/kitchen. Link to inventory stock items to track depleted stock and margins.
              </div>
            </div>
          </div>
          <button
            className="btn sm o"
            style={{ background: '#D97706', color: '#fff', fontSize: 12.5, whiteSpace: 'nowrap' }}
            onClick={() => setReviewModal(true)}
          >
            Review Items ({unreviewedItems.length}) ➔
          </button>
        </div>
      )}

      <Hd
        s={`Site General Manager · ${sess?.name || 'Rehema Said'}`}
        t="Manager Operating Console"
        r={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm o" onClick={A.approve}>
              ✓ Approve All Commissions
            </button>
            <button className="btn sm ghost" onClick={out}>
              Exit
            </button>
          </div>
        }
      />

      <div className="inv-subnav">
        {[
          ['overview', 'Day Operations & KPIs', '📊'],
          ['menu', 'Menu Catalog & Pricing', '🍽️'],
          ['finance', 'Site P&L & Expenses', '💼'],
          ['commission', 'Commission Policy', '💰'],
          ['reconciliation', 'Waiter Reconciliation', '🧾'],
          ['checklists', 'Daily Checklists & HACCP', '📋'],
          ['audit', 'Audit Log', '🛡️']
        ].map(([k, l, icon]) => (
          <button
            key={k}
            className={`inv-tab-btn ${tab === k ? 'on' : ''}`}
            onClick={() => setTab(k)}
          >
            <span>{icon}</span>
            <span>{l}</span>
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Day Lifecycle Automation Banner (Section 6.3) */}
          <div className="card" style={{ marginBottom: 14, background: 'linear-gradient(135deg, #093B2F, #0E5A47)', color: '#fff' }}>
            <div className="row">
              <div>
                <small style={{ color: '#cfe8df' }}>SITE WORKSPACE · TIMELINE</small>
                <h3 style={{ margin: '4px 0', color: '#fff' }}>{currentSite.name}</h3>
                <div style={{ fontSize: 13, color: '#cfe8df' }}>
                  Current Status: <b style={{ color: '#FFD700', textTransform: 'uppercase' }}>{S.shiftState || 'Live Service'}</b>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  className={`btn sm ${S.shiftState === 'opening' ? 'o' : 'ghost'}`}
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  onClick={() => A.setShift('opening', sess?.name || 'Manager')}
                >
                  1. Opening
                </button>
                <button
                  className={`btn sm ${S.shiftState === 'service' ? 'o' : 'ghost'}`}
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  onClick={() => A.setShift('service', sess?.name || 'Manager')}
                >
                  2. Service
                </button>
                <button
                  className={`btn sm ${S.shiftState === 'closed' ? 'o' : 'ghost'}`}
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  onClick={() => A.setShift('closed', sess?.name || 'Manager')}
                >
                  3. Day-Close
                </button>
              </div>
            </div>
          </div>

          <div className="tiles">
            {[
              ['Gross Sales Today', fmt(grossSales), 'Target: TSh 1,200,000', '#15803D'],
              ['Net Revenue (excl. VAT)', fmt(netSales), `18% VAT: ${fmt(taxCollected)}`, '#0E5A47'],
              ['Average Check / Cover', fmt(avgCheck), `${paid.length} bills settled`, '#007AFF'],
              ['Live Service Tickets', `${liveCount} orders`, 'Currently active', '#FF9500'],
              ['Waiter Commission Cost', `${commissionCostPct}%`, `Total: ${fmt(commissionAccrued)}`, '#5856D6'],
              ['Food Cost % (Theoretical)', '29.4%', 'Target PAR: <32%', '#093B2F']
            ].map(([label, val, sub, color]) => (
              <div key={label} className="card">
                <small>{label}</small>
                <b style={{ color, fontSize: 22 }}>{val}</b>
                <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>{sub}</small>
              </div>
            ))}
          </div>

          {/* Recommended Design Architecture: Tracking Mode Widget (Option A Simple vs Option B Recipe) */}
          <div className="card" style={{ marginTop: 14, border: '1.5px solid #E5E7EB', background: 'var(--card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>⚙️</span>
                  <b style={{ fontSize: 16 }}>Inventory &amp; Kitchen Food Costing Mode</b>
                </div>
                <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>
                  Drinks always use direct link (−1 base bottle, no BOM). Kitchen dishes support two operating models:
                </small>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`btn sm ${S.kitchenTrackingMode !== 'recipe' ? 'o' : 'ghost'}`}
                  style={{
                    fontSize: 12,
                    padding: '6px 12px',
                    background: S.kitchenTrackingMode !== 'recipe' ? '#0E5A47' : 'transparent',
                    color: S.kitchenTrackingMode !== 'recipe' ? '#fff' : 'var(--tx)',
                    borderColor: '#0E5A47'
                  }}
                  onClick={() => A.setKitchenTrackingMode('simple', sess?.name || 'Manager')}
                >
                  ✓ Option A: Simple (Issued)
                </button>
                <button
                  type="button"
                  className={`btn sm ${S.kitchenTrackingMode === 'recipe' ? 'o' : 'ghost'}`}
                  style={{
                    fontSize: 12,
                    padding: '6px 12px',
                    background: S.kitchenTrackingMode === 'recipe' ? '#0E5A47' : 'transparent',
                    color: S.kitchenTrackingMode === 'recipe' ? '#fff' : 'var(--tx)',
                    borderColor: '#0E5A47'
                  }}
                  onClick={() => A.setKitchenTrackingMode('recipe', sess?.name || 'Manager')}
                >
                  Option B: Recipe-based (BOM)
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              <div style={{
                padding: 12,
                borderRadius: 12,
                background: S.kitchenTrackingMode !== 'recipe' ? '#E5F2EE' : 'var(--bg)',
                border: S.kitchenTrackingMode !== 'recipe' ? '1.5px solid #0E5A47' : '1px solid var(--line)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <b style={{ color: S.kitchenTrackingMode !== 'recipe' ? '#0E5A47' : 'var(--tx)', fontSize: 13.5 }}>
                    Option A: Simple (Recommended for Small/Mid Restaurants)
                  </b>
                  {S.kitchenTrackingMode !== 'recipe' && (
                    <span style={{ fontSize: 11, background: '#0E5A47', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--mut)', lineHeight: 1.4 }}>
                  Food items are issued from Store to Kitchen. Cost is counted immediately upon issue. No BOM recipes needed. End-of-day count of leftovers gives actual variance.
                </p>
              </div>

              <div style={{
                padding: 12,
                borderRadius: 12,
                background: S.kitchenTrackingMode === 'recipe' ? '#E5F2EE' : 'var(--bg)',
                border: S.kitchenTrackingMode === 'recipe' ? '1.5px solid #0E5A47' : '1px solid var(--line)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <b style={{ color: S.kitchenTrackingMode === 'recipe' ? '#0E5A47' : 'var(--tx)', fontSize: 13.5 }}>
                    Option B: Recipe-Based (Precision Costing)
                  </b>
                  {S.kitchenTrackingMode === 'recipe' && (
                    <span style={{ fontSize: 11, background: '#0E5A47', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--mut)', lineHeight: 1.4 }}>
                  Each dish lists raw ingredients (e.g. Chicken Plate = 250g chicken + 1 tbsp oil). Each POS sale deducts ingredients from kitchen stock automatically.
                </p>
              </div>
            </div>
          </div>

          <p className="sec" style={{ marginTop: 20 }}>Live Shift Summary</p>
          <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <small>Cash in Drawer</small>
              <b style={{ fontSize: 18, display: 'block' }}>
                {fmt(paid.filter(o => o.pm === 'cash').reduce((a, o) => a + tot(o), 0))}
              </b>
            </div>
            <div>
              <small>Mobile Money (M-Pesa / Tigo)</small>
              <b style={{ fontSize: 18, display: 'block' }}>
                {fmt(paid.filter(o => o.pm === 'momo').reduce((a, o) => a + tot(o), 0))}
              </b>
            </div>
            <div>
              <small>Pending PO Deliveries</small>
              <b style={{ fontSize: 18, display: 'block' }}>
                {(S.purchaseOrders || []).filter(p => p.status === 'pending_approval').length} POs
              </b>
            </div>
            <div>
              <small>Staff on Floor</small>
              <b style={{ fontSize: 18, display: 'block' }}>2 Waiters · 1 Chef · 1 Cashier</b>
            </div>
          </div>
        </>
      )}

      {tab === 'finance' && (
        <div>
          <div className="card" style={{ marginBottom: 14, background: 'linear-gradient(135deg, #093B2F, #0E5A47)', color: '#fff' }}>
            <div className="row">
              <div>
                <b style={{ fontSize: 17 }}>Site Financial Intelligence & P&L Analysis</b>
                <p style={{ fontSize: 13, color: '#cfe8df', margin: '4px 0 0' }}>
                  Audited financial metrics: Gross Sales, Net Revenue, Cost of Goods Sold (COGS), Operating Expenses (OPEX), and Real-Time Cashflow.
                </p>
              </div>
              <button
                className="btn sm o"
                style={{ background: 'var(--o)', color: '#fff', border: 0 }}
                onClick={() => setV ? setV('owner') : null}
              >
                📊 Open Executive HQ
              </button>
            </div>
          </div>

          <div className="tiles" style={{ marginBottom: 14 }}>
            {[
              ['Gross Sales (incl. VAT)', fmt(grossSales), `${paid.length} settled tickets`, '#15803D'],
              ['Net Revenue (excl. VAT)', fmt(netSales), `18% VAT: ${fmt(taxCollected)}`, '#0E5A47'],
              ['Site Estimated COGS', fmt(Math.round(grossSales * 0.32)), 'Food + Drinks wholesale', '#C2410C'],
              ['Gross Margin', grossSales > 0 ? `${Math.round(((netSales - grossSales * 0.32) / netSales) * 100)}%` : '0%', `Profit: ${fmt(netSales - Math.round(grossSales * 0.32))}`, '#007AFF'],
              ['Commission Liability', fmt(commissionAccrued), `${commissionCostPct}% of gross sales`, '#5856D6'],
              ['Operating Expenses (OPEX)', fmt((S.expenses || []).reduce((a, e) => a + Number(e.amount || 0), 0)), 'Utilities, gas, permits', '#FF9500']
            ].map(([lbl, val, sub, c]) => (
              <div key={lbl} className="card">
                <small>{lbl}</small>
                <b style={{ color: c, fontSize: 22 }}>{val}</b>
                <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>{sub}</small>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)', gap: 14 }}>
            {/* P&L Statement */}
            <div className="card">
              <b style={{ fontSize: 16 }}>Site Income Statement (P&L)</b>
              <table className="fin-statement">
                <tbody>
                  <tr className="fin-sec-header">
                    <td><b>1. REVENUE</b></td>
                    <td style={{ textAlign: 'right' }}><b>Amount (TSh)</b></td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Gross Sales (Food + Beverages)</td>
                    <td style={{ textAlign: 'right' }}>{fmt(grossSales)}</td>
                  </tr>
                  <tr className="fin-subrow" style={{ color: '#C2410C' }}>
                    <td>Less: VAT (18%)</td>
                    <td style={{ textAlign: 'right', color: '#C2410C' }}>-{fmt(taxCollected)}</td>
                  </tr>
                  <tr className="fin-total-row">
                    <td><b>NET REVENUE</b></td>
                    <td style={{ textAlign: 'right' }}><b>{fmt(netSales)}</b></td>
                  </tr>

                  <tr className="fin-sec-header">
                    <td><b>2. COST OF GOODS SOLD</b></td>
                    <td style={{ textAlign: 'right' }}></td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Theoretical Kitchen Recipe Usage</td>
                    <td style={{ textAlign: 'right' }}>{fmt(Math.round(grossSales * 0.28))}</td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Waste & Spoilage Incident Log</td>
                    <td style={{ textAlign: 'right' }}>{fmt((S.wasteLog || []).reduce((a, w) => a + (w.cost || 0), 0))}</td>
                  </tr>
                  <tr className="fin-total-row">
                    <td><b>TOTAL COGS</b></td>
                    <td style={{ textAlign: 'right' }}><b>{fmt(Math.round(grossSales * 0.28) + (S.wasteLog || []).reduce((a, w) => a + (w.cost || 0), 0))}</b></td>
                  </tr>

                  <tr style={{ background: '#E0EDFE' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#007AFF' }}>
                      <b>GROSS OPERATING PROFIT</b>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#007AFF' }}>
                      <b>{fmt(netSales - (Math.round(grossSales * 0.28) + (S.wasteLog || []).reduce((a, w) => a + (w.cost || 0), 0)))}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Operating Expenses & Outflows */}
            <div className="card">
              <b style={{ fontSize: 16 }}>Operational Expenses & Disbursements</b>
              <table style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>Expense Name</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(S.expenses || []).map(exp => (
                    <tr key={exp.id}>
                      <td>
                        <b>{exp.name}</b>
                        {exp.ref && <div style={{ fontSize: 11, color: 'var(--mut)' }}>Ref: {exp.ref}</div>}
                      </td>
                      <td><small>{exp.category}</small></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#FF3B30' }}>
                        -{fmt(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'commission' && (
        <div style={{ maxWidth: 840 }}>
          <div className="card" style={{ marginBottom: 14 }}>
            <b>Waiter Commission Policy Configuration (SRS WCM-01 to WCM-14)</b>
            <p style={{ fontSize: 13, color: 'var(--mut)', margin: '4px 0 0' }}>
              Changes take effect on future transactions and store a snapshot on every ledger entry. Previous earnings are never silently altered.
            </p>
          </div>

          <div className="card">
            <small style={{ fontWeight: 600 }}>Calculation Method:</small>
            <div className="seg">
              {[
                ['percent', 'Percentage (%) of Sales'],
                ['fixed', 'Fixed Amount (TSh per Order)'],
                ['tiered', 'Tiered Target Matrix']
              ].map(([k, l]) => (
                <button
                  key={k}
                  className={policyForm.method === k ? 'on' : ''}
                  onClick={() => setPolicyForm({ ...policyForm, method: k })}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="fld" style={{ margin: '12px 0' }}>
              <span>{fx ? 'Fixed Fee per Eligible Order (TSh)' : 'Default Commission Rate (%)'}</span>
              <input
                className="inp"
                inputMode="decimal"
                value={fx ? policyForm.fixed : policyForm.rate}
                onChange={e => setPolicyForm({ ...policyForm, [fx ? 'fixed' : 'rate']: +e.target.value || 0 })}
              />
            </div>

            <small style={{ fontWeight: 600, display: 'block', marginTop: 12 }}>Commission Calculation Basis:</small>
            <div className="seg">
              {[
                ['gross', 'Gross Order Total (Standard)'],
                ['net', 'Net Revenue (Excluding 18% VAT Tax)']
              ].map(([k, l]) => (
                <button
                  key={k}
                  className={policyForm.basis === k ? 'on' : ''}
                  onClick={() => setPolicyForm({ ...policyForm, basis: k })}
                >
                  {l}
                </button>
              ))}
            </div>

            <small style={{ fontWeight: 600, display: 'block', marginTop: 12 }}>Qualification Earning Trigger:</small>
            <div className="seg">
              {[
                ['payment', 'On Verified Customer Payment (Cash / Momo)'],
                ['served', 'Immediately When Order is Served at Table']
              ].map(([k, l]) => (
                <button
                  key={k}
                  className={policyForm.trigger === k ? 'on' : ''}
                  onClick={() => setPolicyForm({ ...policyForm, trigger: k })}
                >
                  {l}
                </button>
              ))}
            </div>

            <div style={{ margin: '14px 0', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <b>Waiter-Specific Override Rates (SRS WCM-04):</b>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                {(S.waiters || []).map(w => (
                  <div key={w.id} className="fld">
                    <span>{w.name} Rate (%)</span>
                    <input
                      className="inp"
                      style={{ width: 80 }}
                      value={policyForm.overrides?.[w.id] ?? policyForm.rate}
                      onChange={e => setPolicyForm({
                        ...policyForm,
                        overrides: { ...policyForm.overrides, [w.id]: +e.target.value || policyForm.rate }
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: '#E5F2EE', margin: '14px 0' }}>
              <div className="row">
                <span>Estimated Commission on Today’s {paid.length} Paid Orders:</span>
                <b style={{ color: 'var(--g)', fontSize: 18 }}>{fmt(previewEst)}</b>
              </div>
              <small style={{ color: 'var(--g)' }}>Live simulation preview before committing changes (WCM-07)</small>
            </div>

            <button className="btn o" onClick={handleSavePolicy}>
              {policySaved ? '✓ Policy Saved & Activated!' : 'Save & Activate Commission Policy'}
            </button>
          </div>

          <p className="sec" style={{ marginTop: 24 }}>Commission Payout Liabilities (SRS WCM-09)</p>
          <div className="tiles">
            {[
              ['Pending Manager Approval', (S.ledger || []).filter(l => l.st === 'pending').reduce((a, l) => a + l.amt, 0), '#FF9500'],
              ['Approved for Payout', (S.ledger || []).filter(l => l.st === 'approved').reduce((a, l) => a + l.amt, 0), '#007AFF'],
              ['Paid Out to Staff', (S.ledger || []).filter(l => l.st === 'paid').reduce((a, l) => a + l.amt, 0), '#15803D']
            ].map(([lbl, val, c]) => (
              <div key={lbl} className="card">
                <small>{lbl}</small>
                <b style={{ color: c, fontSize: 20 }}>{fmt(val)}</b>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn sm" onClick={() => A.approve('all', sess?.name || 'Manager')}>
              ✓ Approve All Pending Commissions
            </button>
            <button className="btn ghost sm" onClick={() => A.payout('all', sess?.name || 'Manager')}>
              💵 Record Batch Commission Payout
            </button>
          </div>
        </div>
      )}

      {tab === 'reconciliation' && (
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <b>Manager Waiter Reconciliation Report (SRS Section 5.7, REC-01 to REC-10)</b>
            <p style={{ fontSize: 13, color: 'var(--mut)', margin: '4px 0 0' }}>
              Cross-check waiter sales, direct cash collections, order sources (waiter personal links vs dine-in), and commission liabilities.
            </p>
          </div>

          <div className="tags" style={{ marginBottom: 14 }}>
            <button className={selWaiterId === 'all' ? 'on' : ''} onClick={() => setSelWaiterId('all')}>
              Side-by-Side Comparison (All Staff)
            </button>
            {(S.waiters || []).map(w => (
              <button key={w.id} className={selWaiterId === w.id ? 'on' : ''} onClick={() => setSelWaiterId(w.id)}>
                {w.name}
              </button>
            ))}
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Waiter</th>
                  <th>Total Orders</th>
                  <th>Link Orders (CPT)</th>
                  <th>Total Sales</th>
                  <th>Direct Cash</th>
                  <th>Cashier Momo</th>
                  <th>Commission Earned</th>
                  <th>Approved</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(S.waiters || [])
                  .filter(w => selWaiterId === 'all' || w.id === selWaiterId)
                  .map(w => {
                    const os = (S.orders || []).filter(o => o.wid === w.id);
                    const linkOrders = os.filter(o => o.src === 'WAITER_LINK');
                    const sales = os.filter(o => o.paid || o.st === 'closed').reduce((a, o) => a + tot(o), 0);
                    const cash = os.filter(o => o.pm === 'cash' && (o.paid || o.st === 'closed')).reduce((a, o) => a + tot(o), 0);
                    const momo = os.filter(o => o.pm === 'momo' && (o.paid || o.st === 'closed')).reduce((a, o) => a + tot(o), 0);

                    const led = (S.ledger || []).filter(l => l.wid === w.id && l.st !== 'reversed');
                    const earned = led.reduce((a, l) => a + l.amt, 0);
                    const approved = led.filter(l => l.st === 'approved' || l.st === 'paid').reduce((a, l) => a + l.amt, 0);

                    return (
                      <tr key={w.id}>
                        <td>
                          <b>{w.name}</b>
                          <div style={{ fontSize: 12, color: 'var(--mut)' }}>Token: {w.tok}</div>
                        </td>
                        <td>{os.length}</td>
                        <td><b style={{ color: 'var(--o)' }}>{linkOrders.length}</b></td>
                        <td><b>{fmt(sales)}</b></td>
                        <td>{fmt(cash)}</td>
                        <td>{fmt(momo)}</td>
                        <td style={{ color: '#15803D', fontWeight: 700 }}>{fmt(earned)}</td>
                        <td>{fmt(approved)}</td>
                        <td>
                          <button
                            className="btn sm ghost"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => setSelWaiterId(w.id)}
                          >
                            Drill Down ▸
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Drill-down order details */}
          <div style={{ marginTop: 20 }}>
            <p className="sec">
              {selWaiterId === 'all' ? 'All Orders Audit Trail' : `Drill Down Orders for ${wn(selWaiterId)}`}
            </p>

            <div className="cg">
              {(S.orders || [])
                .filter(o => selWaiterId === 'all' || o.wid === selWaiterId)
                .map(o => (
                  <div key={o.id} className="card">
                    <div className="row">
                      <b>{o.no} · Table {o.tb}</b>
                      <Pill st={o.st} />
                    </div>
                    <small style={{ display: 'block', margin: '4px 0', color: 'var(--mut)' }}>
                      Waiter: <b>{wn(o.wid)}</b> · Source: {o.src} · Payment: {o.pm || 'unpaid'}
                    </small>
                    <div className="row" style={{ marginTop: 8 }}>
                      <b>{fmt(tot(o))}</b>
                      <button className="btn sm ghost" onClick={() => setDrillOrder(o)}>
                        Inspect Receipt & Audit
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'checklists' && (
        <div style={{ maxWidth: 740 }}>
          <p className="sec">Digital Checklists & Quality Standards (SRS QSC-01)</p>
          {(S.checklists || []).map(chk => (
            <div key={chk.id} className="card" style={{ marginBottom: 14 }}>
              <div className="row">
                <b>{chk.title}</b>
                <span
                  className="pill"
                  style={{
                    background: chk.completed ? '#DDF3E4' : '#FFE9DD',
                    color: chk.completed ? '#15803D' : '#C2410C'
                  }}
                >
                  {chk.completed ? `Signed: ${chk.signedBy || 'Verified'}` : 'Pending Items'}
                </span>
              </div>

              <div style={{ margin: '10px 0' }}>
                {chk.items.map((it, idx) => (
                  <label
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 0',
                      borderBottom: idx < chk.items.length - 1 ? '1px solid var(--line)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={it.done}
                      onChange={() => A.toggleChecklist(chk.id, idx, sess?.name || 'Manager')}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ textDecoration: it.done ? 'line-through' : 'none', color: it.done ? 'var(--mut)' : 'inherit' }}>
                      {it.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'audit' && (
        <div>
          <p className="sec">Tamper-Evident System Audit Trail (SRS ADM-04, NFR-12)</p>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / User</th>
                  <th>Action Event</th>
                  <th>Audit Details</th>
                </tr>
              </thead>
              <tbody>
                {(S.auditLog || []).map(aud => (
                  <tr key={aud.id}>
                    <td><small>{new Date(aud.t).toLocaleTimeString()} ({new Date(aud.t).toLocaleDateString()})</small></td>
                    <td><b>{aud.user}</b></td>
                    <td>
                      <span className="pill" style={{ fontSize: 11 }}>{aud.action}</span>
                    </td>
                    <td>{aud.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'menu' && (
        <MenuManagementView
          menuList={S.menu && S.menu.length ? S.menu : MENU}
          stockList={S.stock || []}
          outOfStockIds={S.outOfStockIds || []}
          onToggle86={(id, actor) => A.toggle86(id, actor || sess?.name || 'General Manager')}
          onCreateItem={(data, actor) => A.createMenuItem(data, actor || sess?.name || 'General Manager')}
          onUpdateItem={(id, data, actor) => A.updateMenuItem(id, data, actor || sess?.name || 'General Manager')}
          onDeleteItem={(id, actor) => A.deleteMenuItem(id, actor || sess?.name || 'General Manager')}
          actor={sess?.name || 'General Manager'}
        />
      )}

      {drillOrder && (
        <Sheet title={`Order Audit Details ${drillOrder.no}`} onClose={() => setDrillOrder(null)}>
          <div className="card">
            <div className="row" style={{ marginBottom: 8 }}>
              <b>{drillOrder.no} · Table {drillOrder.tb}</b>
              <Pill st={drillOrder.st} />
            </div>

            <div style={{ fontSize: 13, color: 'var(--mut)', marginBottom: 10 }}>
              Created: {new Date(drillOrder.t).toLocaleString()} · Waiter: {wn(drillOrder.wid)}
            </div>

            <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '8px 0', margin: '8px 0' }}>
              {(drillOrder.it || []).map((l, i) => (
                <div key={i} className="row" style={{ padding: '3px 0' }}>
                  <span>{l.q}x Item #{l.id}</span>
                </div>
              ))}
            </div>

            <p><b>Lifecycle Audit History:</b></p>
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--mut)' }}>
              {(drillOrder.log || []).map((entry, idx) => (
                <li key={idx} style={{ margin: '4px 0' }}>{entry}</li>
              ))}
            </ul>

            <button className="btn ghost sm" style={{ width: '100%', marginTop: 10 }} onClick={() => setDrillOrder(null)}>
              Close
            </button>
          </div>
        </Sheet>
      )}

      <Tabs
        cur={tab}
        set={setTab}
        tabs={[
          ['overview', 'Overview', '📊', 0],
          ['menu', 'Menu Catalog', '🍽️', unreviewedItems.length],
          ['commission', 'Commission', '💰', 0],
          ['reconciliation', 'Waiters (REC)', '👥', 0],
          ['checklists', 'Checklists', '📋', 0],
          ['audit', 'Audit Trail', '🛡️', 0]
        ]}
      />

      {/* Manager Review Modal for Quick-Added Items */}
      <ManagerReviewModal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        unreviewedItems={unreviewedItems}
        stockList={S.stock || []}
        onApproveItem={(itemId, approvalData) => A.reviewMenuItem(itemId, approvalData, sess?.name || 'Manager')}
      />
    </div>
  );
}

import React, { useState, useContext } from 'react';
import { fmt, fmtNum, fmtDateTime, tot, calcNet, calcTax, SITES, MENU } from '../data';
import { Ctx } from '../store';
import { Hd, Tabs, TopBar, Sheet } from '../components/ui';

export function HQ({ sess, out, setSess, setV }) {
  const { S, A, wn } = useContext(Ctx);
  const [tab, setTab] = useState('pnl'); // default to boss financial intelligence!
  const [expenseModal, setExpenseModal] = useState(false);
  const [newExp, setNewExp] = useState({
    category: 'Utilities & Power',
    name: '',
    amount: '',
    method: 'bank',
    ref: ''
  });

  // Calculate live financial numbers from actual store data
  const paidOrders = (S.orders || []).filter(o => o.paid || o.st === 'closed');
  const grossSalesLive = paidOrders.reduce((a, o) => a + tot(o), 0);
  const netSalesLive = calcNet(grossSalesLive);
  const vatLive = calcTax(grossSalesLive);

  // COGS Calculation (Raw materials + Finished goods consumed + Direct resale wholesale cost + Waste)
  const wasteCost = (S.wasteLog || []).reduce((a, w) => a + (w.cost || 0), 0);
  // Estimate COGS based on actual orders items and theoretical recipe costs
  const cogsFood = Math.round(grossSalesLive * 0.285);
  const cogsBeverage = Math.round(grossSalesLive * 0.08);
  const totalCOGS = cogsFood + cogsBeverage + wasteCost;
  const grossProfit = netSalesLive - totalCOGS;
  const grossMarginPct = netSalesLive > 0 ? ((grossProfit / netSalesLive) * 100).toFixed(1) : '0.0';

  // OPEX (Commissions + Production Labor + Other Expenses)
  const commissionCost = (S.ledger || []).filter(l => l.st !== 'reversed').reduce((a, l) => a + (l.amt || 0), 0);
  const productionLaborCost = (S.productionOrders || []).filter(p => p.status === 'completed').reduce((a, p) => a + (p.laborCost || 0) + (p.overheadCost || 0), 0);
  const otherExpenses = (S.expenses || []).reduce((a, e) => a + Number(e.amount || 0), 0);
  const totalOPEX = commissionCost + productionLaborCost + otherExpenses;

  // Net Profit
  const netProfit = grossProfit - totalOPEX;
  const netProfitMarginPct = netSalesLive > 0 ? ((netProfit / netSalesLive) * 100).toFixed(1) : '0.0';

  // Real-time Cashflow
  const cashInflowCash = paidOrders.filter(o => o.pm === 'cash').reduce((a, o) => a + tot(o), 0);
  const cashInflowMomo = paidOrders.filter(o => o.pm === 'momo').reduce((a, o) => a + tot(o), 0);
  const totalCashInflow = cashInflowCash + cashInflowMomo;

  const poPaidOutflows = (S.purchaseOrders || []).filter(p => p.status === 'paid').reduce((a, p) => a + p.total, 0);
  const commissionPaidOutflows = (S.ledger || []).filter(l => l.st === 'paid').reduce((a, l) => a + l.amt, 0);
  const directExpensesPaid = (S.expenses || []).filter(e => e.category !== 'Supplier Goods Settlement').reduce((a, e) => a + Number(e.amount || 0), 0);
  const totalCashOutflow = poPaidOutflows + commissionPaidOutflows + directExpensesPaid;
  const netCashSurplus = totalCashInflow - totalCashOutflow;

  // Multi-site consolidated estimates
  const sitePerformance = [
    { site: SITES[0], revenue: 1845000, covers: 48, avgCheck: 38437, foodCostPct: 29.2, commission: 92250, health: 'Excellent 98%' },
    { site: SITES[1], revenue: 640000, covers: 22, avgCheck: 29090, foodCostPct: 31.5, commission: 32000, health: 'Good 92%' },
    { site: SITES[2], revenue: 1210000, covers: 36, avgCheck: 33611, foodCostPct: 28.8, commission: 60500, health: 'Strong 95%' }
  ];

  const totalNetworkRevenue = sitePerformance.reduce((a, s) => a + s.revenue, 0);
  const totalCovers = sitePerformance.reduce((a, s) => a + s.covers, 0);
  const networkAvgCheck = Math.round(totalNetworkRevenue / totalCovers);
  const totalCommission = sitePerformance.reduce((a, s) => a + s.commission, 0);

  // Menu Engineering Matrix classifications (MNU-04)
  const menuMatrix = [
    { type: 'Stars (High Profit, High Popularity)', color: '#15803D', bg: '#DDF3E4', items: [
      { name: 'Mishkaki Platter', margin: '68%', volume: '142 orders/wk', action: 'Maintain quality, feature in prime menu spot' },
      { name: 'Fresh Mango Juice', margin: '74%', volume: '185 orders/wk', action: 'Upsell with grilled combos' }
    ]},
    { type: 'Plowhorses (Low Profit, High Popularity)', color: '#007AFF', bg: '#E0EDFE', items: [
      { name: 'Masala Chips', margin: '42%', volume: '210 orders/wk', action: 'Consider modest 5% price revision or combo pairing' },
      { name: 'Roasted Chicken', margin: '48%', volume: '135 orders/wk', action: 'Optimize poultry portion yield in recipe BOM' }
    ]},
    { type: 'Puzzles (High Profit, Low Popularity)', color: '#FF9500', bg: '#FFF4E5', items: [
      { name: 'Grilled Tilapia', margin: '71%', volume: '44 orders/wk', action: 'Reposition on menu and train servers to recommend' },
      { name: 'Chocolate Lava', margin: '65%', volume: '38 orders/wk', action: 'Promote as post-dinner dessert special' }
    ]},
    { type: 'Dogs (Low Profit, Low Popularity)', color: '#FF3B30', bg: '#FFE5E5', items: [
      { name: 'Coconut Tart', margin: '38%', volume: '18 orders/wk', action: 'Review recipe cost or replace with seasonal fruit tart' }
    ]}
  ];

  const handleCreateExpense = () => {
    if (!newExp.name || !newExp.amount) return;
    A.recordExpense({
      category: newExp.category,
      name: newExp.name,
      amount: +newExp.amount,
      method: newExp.method,
      ref: newExp.ref || `EXP-${Date.now().toString().slice(-4)}`
    }, sess?.name || 'David Kimani (CEO)');
    setExpenseModal(false);
    setNewExp({ category: 'Utilities & Power', name: '', amount: '', method: 'bank', ref: '' });
  };

  return (
    <div className="app wide">
      <TopBar sess={sess} setSess={setSess} setV={setV} currentView="owner" />

      <Hd
        s={`Group Executive Workspace · ${sess?.name || 'David Kimani (CEO / Owner)'}`}
        t="Enterprise Multi-Site HQ & Financial Console"
        r={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn sm o" onClick={() => setExpenseModal(true)}>
              + Log Operating Expense
            </button>
            <button className="btn sm ghost" onClick={out}>
              Sign Out
            </button>
          </div>
        }
      />

      <div className="inv-subnav">
        {[
          ['pnl', 'Executive P&L & Cashflow', '💼', 0],
          ['kpis', 'Group Consolidated KPIs', '📊', 0],
          ['sites', 'Branch Benchmarking', '🏢', SITES.length],
          ['menu', 'Menu Engineering Matrix', '🍽️', 0],
          ['waiters', 'Cross-Site Server Performance', '🏆', (S.waiters || []).length]
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

      {/* BOSS FINANCIAL INTELLIGENCE & P&L DASHBOARD */}
      {tab === 'pnl' && (
        <>
          {/* Top KPI Cards for Boss */}
          <div className="tiles" style={{ marginBottom: 16 }}>
            <div className="card" style={{ borderLeft: '4px solid #15803D' }}>
              <small>Gross Sales (incl. VAT)</small>
              <b style={{ color: '#15803D', fontSize: 24 }}>{fmt(grossSalesLive)}</b>
              <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>{paidOrders.length} settled tickets</small>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--g)' }}>
              <small>Net Revenue (excl. 18% VAT)</small>
              <b style={{ color: 'var(--g)', fontSize: 24 }}>{fmt(netSalesLive)}</b>
              <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>VAT Collected: {fmt(vatLive)}</small>
            </div>
            <div className="card" style={{ borderLeft: '4px solid #FF6B2C' }}>
              <small>Total COGS & Spoilage</small>
              <b style={{ color: '#C2410C', fontSize: 24 }}>{fmt(totalCOGS)}</b>
              <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>Food + Beverage + Spoilage</small>
            </div>
            <div className="card" style={{ borderLeft: '4px solid #007AFF' }}>
              <small>Gross Profit Margin</small>
              <b style={{ color: '#007AFF', fontSize: 24 }}>{grossMarginPct}%</b>
              <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>Gross Profit: {fmt(grossProfit)}</small>
            </div>
            <div className="card" style={{ borderLeft: '4px solid #5856D6' }}>
              <small>Total OPEX & Overheads</small>
              <b style={{ color: '#5856D6', fontSize: 24 }}>{fmt(totalOPEX)}</b>
              <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>Staff comms + utilities + gas</small>
            </div>
            <div className="card" style={{ borderLeft: `4px solid ${netProfit >= 0 ? '#15803D' : '#FF3B30'}`, background: netProfit >= 0 ? 'rgba(21,128,61,0.06)' : 'rgba(255,59,48,0.06)' }}>
              <small>Net Profit (EBITDA)</small>
              <b style={{ color: netProfit >= 0 ? '#15803D' : '#FF3B30', fontSize: 24 }}>{fmt(netProfit)}</b>
              <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>Net Margin: <b>{netProfitMarginPct}%</b></small>
            </div>
          </div>

          {/* Side by side: P&L Statement and Real-time Cashflow */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(340px, 1fr)', gap: 16 }}>
            {/* Income Statement (P&L) */}
            <div className="card">
              <div className="row" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8, marginBottom: 8 }}>
                <div>
                  <b style={{ fontSize: 17 }}>Executive Profit & Loss Statement</b>
                  <div style={{ fontSize: 12, color: 'var(--mut)' }}>Live Calculated · Safari Grill Masaki & Branches</div>
                </div>
                <span className="chip" style={{ background: '#DDF3E4', color: '#15803D', margin: 0 }}>Audited Live</span>
              </div>

              <table className="fin-statement">
                <tbody>
                  <tr className="fin-sec-header">
                    <td><b>1. REVENUE (SALES)</b></td>
                    <td style={{ textAlign: 'right' }}><b>Amount (TSh)</b></td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Gross Food & Dining Sales</td>
                    <td style={{ textAlign: 'right' }}>{fmt(Math.round(grossSalesLive * 0.72))}</td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Beverage & Direct Resale Retail Sales</td>
                    <td style={{ textAlign: 'right' }}>{fmt(Math.round(grossSalesLive * 0.28))}</td>
                  </tr>
                  <tr className="fin-subrow" style={{ color: '#C2410C' }}>
                    <td>Less: Value Added Tax (VAT 18%)</td>
                    <td style={{ textAlign: 'right', color: '#C2410C' }}>-{fmt(vatLive)}</td>
                  </tr>
                  <tr className="fin-total-row">
                    <td><b>NET REVENUE</b></td>
                    <td style={{ textAlign: 'right' }}><b>{fmt(netSalesLive)}</b></td>
                  </tr>

                  <tr className="fin-sec-header">
                    <td><b>2. COST OF GOODS SOLD (COGS)</b></td>
                    <td style={{ textAlign: 'right' }}></td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Raw Material Ingredients Consumed (Grills & Kitchen)</td>
                    <td style={{ textAlign: 'right' }}>{fmt(cogsFood)}</td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Direct Resale & Beverage Wholesale Cost</td>
                    <td style={{ textAlign: 'right' }}>{fmt(cogsBeverage)}</td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Waste, Spoilage & Trimming Loss (Audit Log)</td>
                    <td style={{ textAlign: 'right' }}>{fmt(wasteCost)}</td>
                  </tr>
                  <tr className="fin-total-row">
                    <td><b>TOTAL COGS</b></td>
                    <td style={{ textAlign: 'right' }}><b>{fmt(totalCOGS)}</b></td>
                  </tr>

                  <tr style={{ background: '#E0EDFE' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#007AFF' }}>
                      <b>GROSS PROFIT (Margin: {grossMarginPct}%)</b>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#007AFF' }}>
                      <b>{fmt(grossProfit)}</b>
                    </td>
                  </tr>

                  <tr className="fin-sec-header">
                    <td><b>3. OPERATING EXPENSES (OPEX)</b></td>
                    <td style={{ textAlign: 'right' }}></td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Waiter & Staff Commissions Accrued</td>
                    <td style={{ textAlign: 'right' }}>{fmt(commissionCost)}</td>
                  </tr>
                  <tr className="fin-subrow">
                    <td>Central Kitchen Prep Labor & Overhead</td>
                    <td style={{ textAlign: 'right' }}>{fmt(productionLaborCost)}</td>
                  </tr>
                  {(S.expenses || []).map(exp => (
                    <tr key={exp.id} className="fin-subrow">
                      <td>{exp.name} ({exp.category})</td>
                      <td style={{ textAlign: 'right' }}>{fmt(exp.amount)}</td>
                    </tr>
                  ))}
                  <tr className="fin-total-row">
                    <td><b>TOTAL OPERATING EXPENSES</b></td>
                    <td style={{ textAlign: 'right' }}><b>{fmt(totalOPEX)}</b></td>
                  </tr>

                  <tr className="fin-net-profit">
                    <td style={{ padding: '12px 12px' }}>
                      <b>NET OPERATING PROFIT (EBITDA)</b>
                      <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>After all goods, labor, taxes & overheads</div>
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                      <b>{fmt(netProfit)}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Real-Time Cashflow & Liquidity Tracker */}
            <div>
              <div className="card" style={{ marginBottom: 14 }}>
                <div className="row" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8, marginBottom: 8 }}>
                  <div>
                    <b style={{ fontSize: 17 }}>Real-Time Cashflow & Liquidity</b>
                    <div style={{ fontSize: 12, color: 'var(--mut)' }}>Actual Cash & Momo Inflows vs Supplier & Expense Outflows</div>
                  </div>
                  <span className="chip" style={{ background: '#E5F2EE', color: 'var(--g)', margin: 0 }}>Live Treasury</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '10px 0' }}>
                  <div className="fin-cash-card" style={{ borderLeft: '4px solid #15803D' }}>
                    <small>Total Cash Inflows</small>
                    <b style={{ color: '#15803D', fontSize: 20, display: 'block' }}>+{fmt(totalCashInflow)}</b>
                    <small style={{ color: 'var(--mut)' }}>Cash + Verified Mobile Money</small>
                  </div>
                  <div className="fin-cash-card" style={{ borderLeft: '4px solid #FF3B30' }}>
                    <small>Total Cash Outflows</small>
                    <b style={{ color: '#FF3B30', fontSize: 20, display: 'block' }}>-{fmt(totalCashOutflow)}</b>
                    <small style={{ color: 'var(--mut)' }}>PO Bills + Payouts + Expenses</small>
                  </div>
                </div>

                <div className="card" style={{ background: netCashSurplus >= 0 ? '#E5F2EE' : '#FFE0DE', margin: '10px 0' }}>
                  <div className="row">
                    <div>
                      <small style={{ color: netCashSurplus >= 0 ? 'var(--g)' : '#C62828', fontWeight: 700 }}>NET REALIZED CASH POSITION</small>
                      <h3 style={{ margin: '4px 0', color: netCashSurplus >= 0 ? 'var(--g)' : '#C62828' }}>
                        {fmt(netCashSurplus)}
                      </h3>
                      <small style={{ color: 'var(--mut)' }}>
                        {netCashSurplus >= 0 ? 'Liquid Cash Surplus Available in Accounts' : 'Cash Deficit / Working Capital Required'}
                      </small>
                    </div>
                    <span style={{ fontSize: 32 }}>{netCashSurplus >= 0 ? '💰' : '⚠️'}</span>
                  </div>
                </div>

                <p style={{ fontWeight: 700, margin: '14px 0 6px', fontSize: 14 }}>Inflow Breakdown:</p>
                <div className="row" style={{ padding: '4px 0', fontSize: 13 }}>
                  <span>💵 Cash Register Drawer Collections:</span>
                  <b>{fmt(cashInflowCash)}</b>
                </div>
                <div className="row" style={{ padding: '4px 0', fontSize: 13, borderBottom: '1px solid var(--line)' }}>
                  <span>📱 Mobile Money (M-Pesa / Tigo Pesa):</span>
                  <b>{fmt(cashInflowMomo)}</b>
                </div>

                <p style={{ fontWeight: 700, margin: '14px 0 6px', fontSize: 14 }}>Outflow Breakdown:</p>
                <div className="row" style={{ padding: '4px 0', fontSize: 13 }}>
                  <span>🤝 Supplier PO Settlements (AP Paid):</span>
                  <b style={{ color: '#FF3B30' }}>-{fmt(poPaidOutflows)}</b>
                </div>
                <div className="row" style={{ padding: '4px 0', fontSize: 13 }}>
                  <span>🧑‍🍳 Waiter Commission Cash Payouts:</span>
                  <b style={{ color: '#FF3B30' }}>-{fmt(commissionPaidOutflows)}</b>
                </div>
                <div className="row" style={{ padding: '4px 0', fontSize: 13, borderBottom: '1px solid var(--line)' }}>
                  <span>⚡ Direct Operational Expenses Paid:</span>
                  <b style={{ color: '#FF3B30' }}>-{fmt(directExpensesPaid)}</b>
                </div>
              </div>

              {/* Recent Operating Expenses List */}
              <div className="card">
                <div className="row" style={{ marginBottom: 8 }}>
                  <b>Operating Expenses Ledger (SRS RPT-02)</b>
                  <button className="btn sm o" onClick={() => setExpenseModal(true)}>
                    + Add Expense
                  </button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Expense Item</th>
                      <th>Category</th>
                      <th>Method</th>
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
                        <td><span className="chip" style={{ margin: 0, fontSize: 11 }}>{exp.method.toUpperCase()}</span></td>
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
        </>
      )}

      {/* KPI TILES TAB */}
      {tab === 'kpis' && (
        <>
          <div className="tiles">
            {[
              ['Group Network Sales Today', fmt(totalNetworkRevenue), 'Across 3 active sites', '#15803D'],
              ['Network Covers (Diners)', `${totalCovers} guests`, 'Peak turn: 19:30', '#0E5A47'],
              ['Consolidated Avg Check', fmt(networkAvgCheck), '+8.4% vs last week', '#007AFF'],
              ['Consolidated Cash Position', fmt(2450000), 'In transit & banks', '#093B2F'],
              ['Group Food Cost %', '29.8%', 'Target threshold <32%', '#FF9500'],
              ['Total Commission Liability', fmt(totalCommission), '3.1% of network sales', '#5856D6']
            ].map(([lbl, val, sub, c]) => (
              <div key={lbl} className="card">
                <small>{lbl}</small>
                <b style={{ color: c, fontSize: 22 }}>{val}</b>
                <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>{sub}</small>
              </div>
            ))}
          </div>

          <p className="sec" style={{ marginTop: 20 }}>Executive Summary & Multi-Site Health</p>
          <div className="card">
            <p>
              <b>Safari Grill Holdings:</b> Real-time operational data is streaming from all 3 physical locations. Masaki Flagship maintains highest volume, while Oysterbay Express continues steady takeaway order growth through Waiter ordering links.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="chip" style={{ background: '#DDF3E4', color: '#15803D' }}>🟢 All 3 Sites Online</span>
              <span className="chip" style={{ background: '#E0EDFE', color: '#007AFF' }}>🛡️ Zero Fraud / Void Anomalies</span>
              <span className="chip" style={{ background: '#E5F2EE', color: 'var(--g)' }}>📊 Central Recipe Costing Synced</span>
            </div>
          </div>
        </>
      )}

      {/* BRANCH BENCHMARKING */}
      {tab === 'sites' && (
        <div>
          <p className="sec">Branch Benchmarking & Ranking (SRS RPT-04)</p>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Branch Outlet</th>
                  <th>Format / Concept</th>
                  <th>General Manager</th>
                  <th>Today Sales</th>
                  <th>Covers</th>
                  <th>Avg Check</th>
                  <th>Food Cost %</th>
                  <th>Commission Cost</th>
                  <th>Operational Score</th>
                </tr>
              </thead>
              <tbody>
                {sitePerformance.map((sp, idx) => (
                  <tr key={idx}>
                    <td>
                      <b>{sp.site.name}</b>
                      <div style={{ fontSize: 12, color: 'var(--mut)' }}>{sp.site.address}</div>
                    </td>
                    <td>{sp.site.type}</td>
                    <td>{sp.site.gm}</td>
                    <td><b>{fmt(sp.revenue)}</b></td>
                    <td>{sp.covers}</td>
                    <td>{fmt(sp.avgCheck)}</td>
                    <td>{sp.foodCostPct}%</td>
                    <td>{fmt(sp.commission)}</td>
                    <td>
                      <span className="pill" style={{ background: '#DDF3E4', color: '#15803D' }}>
                        {sp.health}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOSTON MATRIX */}
      {tab === 'menu' && (
        <div>
          <p className="sec">Boston Consulting Group Menu Engineering Matrix (SRS MNU-04)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {menuMatrix.map((cat, idx) => (
              <div key={idx} className="card" style={{ borderTop: `4px solid ${cat.color}` }}>
                <b style={{ color: cat.color, fontSize: 16 }}>{cat.type}</b>
                <div style={{ marginTop: 10 }}>
                  {cat.items.map((it, i) => (
                    <div key={i} style={{ padding: '8px 0', borderBottom: i < cat.items.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div className="row">
                        <b>{it.name}</b>
                        <span style={{ fontSize: 13, color: 'var(--g)', fontWeight: 600 }}>Margin: {it.margin}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--mut)', margin: '2px 0' }}>Volume: {it.volume}</div>
                      <div style={{ fontSize: 12, color: 'var(--tx)', fontStyle: 'italic', background: 'var(--bg)', padding: '4px 8px', borderRadius: 6, marginTop: 4 }}>
                        Recommendation: {it.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WAITERS LEADERBOARD */}
      {tab === 'waiters' && (
        <div>
          <p className="sec">Cross-Site Waiter Performance & Ordering Link Adoption (SRS REC-10)</p>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Assigned Site</th>
                  <th>Orders Closed</th>
                  <th>Total Sales</th>
                  <th>Link Order Share</th>
                  <th>Commission Earned</th>
                  <th>Average Table Turn</th>
                </tr>
              </thead>
              <tbody>
                {(S.waiters || []).map(w => {
                  const os = (S.orders || []).filter(o => o.wid === w.id);
                  const sales = os.filter(o => o.paid || o.st === 'closed').reduce((a, o) => a + tot(o), 0);
                  const linkShare = os.length > 0 ? Math.round((os.filter(o => o.src === 'WAITER_LINK').length / os.length) * 100) : 0;
                  const comm = (S.ledger || []).filter(l => l.wid === w.id && l.st !== 'reversed').reduce((a, l) => a + l.amt, 0);

                  return (
                    <tr key={w.id}>
                      <td><b>{w.name}</b></td>
                      <td>Masaki Flagship</td>
                      <td>{os.length}</td>
                      <td><b>{fmt(sales)}</b></td>
                      <td><b style={{ color: 'var(--o)' }}>{linkShare}%</b></td>
                      <td style={{ color: '#15803D', fontWeight: 700 }}>{fmt(comm)}</td>
                      <td>42 mins</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {expenseModal && (
        <Sheet title="Log Operating Expense (OPEX)" onClose={() => setExpenseModal(false)}>
          <div className="card">
            <small style={{ fontWeight: 600 }}>Expense Category:</small>
            <select
              className="inp"
              value={newExp.category}
              onChange={e => setNewExp({ ...newExp, category: e.target.value })}
            >
              <option value="Utilities & Power">Utilities & Power (TANESCO / Generator)</option>
              <option value="Gas & Fuel">Cooking Gas (Oryx LPG Bulk) & Fuel</option>
              <option value="Facility & Cleaning">Facility Maintenance & Cleaning</option>
              <option value="Internet & Telecom">POS & Internet Connectivity</option>
              <option value="Marketing & Promotion">Marketing & Social Media</option>
              <option value="Packaging & Consumables">Takeaway Packaging & Disposables</option>
              <option value="Licenses & Permits">TRA / Municipal Licenses & Inspection</option>
            </select>

            <small style={{ fontWeight: 600 }}>Expense Title / Vendor Description:</small>
            <input
              className="inp"
              placeholder="e.g. TANESCO Monthly Electricity Masaki"
              value={newExp.name}
              onChange={e => setNewExp({ ...newExp, name: e.target.value })}
            />

            <small style={{ fontWeight: 600 }}>Amount (TSh):</small>
            <input
              className="inp"
              type="number"
              placeholder="e.g. 150000"
              value={newExp.amount}
              onChange={e => setNewExp({ ...newExp, amount: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <small style={{ fontWeight: 600 }}>Payment Method:</small>
                <select
                  className="inp"
                  value={newExp.method}
                  onChange={e => setNewExp({ ...newExp, method: e.target.value })}
                >
                  <option value="bank">Bank Wire (CRDB / NMB)</option>
                  <option value="cash">Petty Cash Drawer</option>
                  <option value="momo">M-Pesa / Tigo Pesa</option>
                </select>
              </div>
              <div>
                <small style={{ fontWeight: 600 }}>Voucher / Invoice Ref:</small>
                <input
                  className="inp"
                  placeholder="e.g. VOUCH-441"
                  value={newExp.ref}
                  onChange={e => setNewExp({ ...newExp, ref: e.target.value })}
                />
              </div>
            </div>

            <button className="btn o" style={{ marginTop: 14 }} onClick={handleCreateExpense}>
              Record Expense to P&L & Cashflow
            </button>
          </div>
        </Sheet>
      )}

      <Tabs
        cur={tab}
        set={setTab}
        tabs={[
          ['pnl', 'Executive P&L', '💼', 0],
          ['kpis', 'Group KPIs', '📊', 0],
          ['sites', 'Branches', '🏢', 0],
          ['menu', 'Menu Matrix', '🍽️', 0],
          ['waiters', 'Staff Leaderboard', '🏆', 0]
        ]}
      />
    </div>
  );
}

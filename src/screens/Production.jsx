import React, { useState, useContext } from 'react';
import { fmt, fmtNum, BOMS, SITES, M } from '../data';
import { Ctx } from '../store';
import { TopBar, Sheet } from '../components/ui';

export function Production({ sess, out, setSess, setV }) {
  const { S, A } = useContext(Ctx);
  const [tab, setTab] = useState('batches');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newBatchModal, setNewBatchModal] = useState(false);
  const [completeModalWO, setCompleteModalWO] = useState(null);
  const [labelModalWO, setLabelModalWO] = useState(null);
  const [dispatchModalReq, setDispatchModalReq] = useState(null);

  // New batch form
  const [selBomId, setSelBomId] = useState(BOMS[0].id);
  const [targetYield, setTargetYield] = useState(String(BOMS[0].targetYield));

  // Complete batch form
  const [actualYieldInput, setActualYieldInput] = useState('');
  const [tempLogInput, setTempLogInput] = useState('2.4°C');
  const [notesInput, setNotesInput] = useState('QC passed: appearance, weight, and aroma verified.');

  // Dispatch form
  const [driverName, setDriverName] = useState('Rashid Mtambo (Van #TZ 881 AC)');
  const [transportTemp, setTransportTemp] = useState('2.8°C');

  // Traceability search
  const [traceQuery, setTraceQuery] = useState('#0001');

  const boms = S.boms || BOMS;
  const productionOrders = S.productionOrders || [];
  const finishedGoods = S.finishedGoods || [];
  const siteRequisitions = S.siteRequisitions || [];

  const plannedBatches = productionOrders.filter(w => w.status === 'planned');
  const inProdBatches = productionOrders.filter(w => w.status === 'in_production');
  const completedBatches = productionOrders.filter(w => w.status === 'completed');

  const filteredOrders = productionOrders.filter(wo => {
    if (statusFilter === 'all') return true;
    return wo.status === statusFilter;
  });

  const handleCreateBatch = () => {
    A.createProductionOrder(selBomId, +targetYield, sess?.name || 'Jaffar Mdee (CK Lead)');
    setNewBatchModal(false);
  };

  const handleOpenCompleteModal = wo => {
    setCompleteModalWO(wo);
    setActualYieldInput(String(wo.plannedYield));
    setTempLogInput('2.4°C');
    setNotesInput('Passed QA sensory, temperature, and weight audit.');
  };

  const handleConfirmComplete = () => {
    if (!completeModalWO) return;
    A.completeProduction(
      completeModalWO.id,
      +actualYieldInput || completeModalWO.plannedYield,
      tempLogInput,
      notesInput,
      sess?.name || 'Jaffar Mdee'
    );
    setCompleteModalWO(null);
  };

  const handleConfirmDispatch = () => {
    if (!dispatchModalReq) return;
    A.dispatchRequisition(dispatchModalReq.id, driverName, transportTemp, sess?.name || 'Production Dispatch');
    setDispatchModalReq(null);
  };

  const searchedOrder = (S.orders || []).find(o => o.no === traceQuery || String(o.id) === traceQuery || traceQuery.includes(String(o.id)));

  return (
    <div className="app wide" style={{ maxWidth: 1440, padding: '8px 14px 100px' }}>
      <TopBar sess={sess} setSess={setSess} setV={setV} currentView="production" />

      {/* Production Station Header matching KDS Design Philosophy */}
      <div className="kds-monitor-container" style={{ marginBottom: 16 }}>
        <div className="kds-teal-nav" style={{ height: 56 }}>
          <div className="kds-teal-tabs">
            <button
              className={`kds-nav-tab ${tab === 'batches' ? 'active' : ''}`}
              onClick={() => setTab('batches')}
            >
              🔥 Work Orders ({inProdBatches.length + plannedBatches.length})
            </button>
            <button
              className={`kds-nav-tab ${tab === 'boms' ? 'active' : ''}`}
              onClick={() => setTab('boms')}
            >
              📜 Recipes & BOMs ({boms.length})
            </button>
            <button
              className={`kds-nav-tab ${tab === 'finished' ? 'active' : ''}`}
              onClick={() => setTab('finished')}
            >
              🍱 Finished Sales Goods ({finishedGoods.length})
            </button>
            <button
              className={`kds-nav-tab ${tab === 'requisitions' ? 'active' : ''}`}
              onClick={() => setTab('requisitions')}
            >
              🚚 Site Requisitions ({siteRequisitions.filter(r => r.status === 'pending').length})
            </button>
            <button
              className={`kds-nav-tab ${tab === 'traceability' ? 'active' : ''}`}
              onClick={() => setTab('traceability')}
            >
              🛡️ Traceability Chain
            </button>
          </div>

          <div className="kds-nav-right">
            <button
              className="btn sm o"
              style={{ background: '#FF6B2C', padding: '7px 14px', borderRadius: 8, fontWeight: 700 }}
              onClick={() => setNewBatchModal(true)}
            >
              + Schedule Batch
            </button>
            <div className="kds-avatar-badge" title="Central Kitchen Manager">
              JM
            </div>
          </div>
        </div>
      </div>

      {/* Work Orders Tab */}
      {tab === 'batches' && (
        <div>
          {/* Quick Filter Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--mut)' }}>Stage Filter:</span>
              {[
                ['all', `All (${productionOrders.length})`],
                ['planned', `Planned Schedule (${plannedBatches.length})`],
                ['in_production', `In Production (${inProdBatches.length}) 🔥`],
                ['completed', `Completed & Packaged (${completedBatches.length}) ✓`]
              ].map(([stKey, label]) => (
                <button
                  key={stKey}
                  className={`btn sm ghost ${statusFilter === stKey ? 'active-site' : ''}`}
                  style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8 }}
                  onClick={() => setStatusFilter(stKey)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 600 }}>
              Central Facility: Masaki Flagship Hub · Cold Room Temp: 2.6°C
            </div>
          </div>

          {/* Batches Grid organized by High-Contrast Stage Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {filteredOrders.map(wo => {
              const isCompleted = wo.status === 'completed';
              const isInProd = wo.status === 'in_production';

              let headerBg = '#3182CE'; // planned blue
              let headerTitle = 'PLANNED SCHEDULE';
              if (isInProd) {
                headerBg = '#ED8936'; // in production orange
                headerTitle = 'IN PRODUCTION 🔥';
              } else if (isCompleted) {
                headerBg = '#16A34A'; // completed green
                headerTitle = 'COMPLETED & PACKAGED ✓';
              }

              return (
                <div key={wo.id} className="kds-card" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {/* Card Header matching KDS aesthetic */}
                  <div style={{ background: headerBg, color: '#fff', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>{wo.batchNo}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: 4 }}>
                        {headerTitle}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                      Lead Operator: <b>{wo.operator}</b> · WO #{wo.id}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1E293B' }}>
                      {wo.productName}
                    </h3>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 10, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div className="row">
                        <span style={{ color: 'var(--mut)' }}>Target Yield:</span>
                        <b>{wo.plannedYield} {wo.uom}</b>
                      </div>

                      {isCompleted && (
                        <div className="row">
                          <span style={{ color: 'var(--mut)' }}>Actual Output:</span>
                          <b style={{ color: wo.yieldVariancePct < 0 ? '#DC2626' : '#16A34A' }}>
                            {wo.actualYield} {wo.uom} ({wo.yieldVariancePct >= 0 ? '+' : ''}{wo.yieldVariancePct}%)
                          </b>
                        </div>
                      )}

                      <div className="row">
                        <span style={{ color: 'var(--mut)' }}>Total Batch Cost:</span>
                        <b>{fmt(wo.totalBatchCost)} ({fmt(wo.unitCost)}/{wo.uom})</b>
                      </div>

                      <div className="row">
                        <span style={{ color: 'var(--mut)' }}>Storage Temp:</span>
                        <span style={{ color: '#0E5A47', fontWeight: 700 }}>{wo.tempLog || '2.8°C'}</span>
                      </div>

                      <div className="row">
                        <span style={{ color: 'var(--mut)' }}>Expiry Date:</span>
                        <span>{wo.expiryDate}</span>
                      </div>
                    </div>

                    {wo.notes && (
                      <div style={{ fontSize: 12, color: 'var(--mut)', fontStyle: 'italic', paddingLeft: 4 }}>
                        QA Note: {wo.notes}
                      </div>
                    )}

                    {/* Operational CTA Button */}
                    <div style={{ marginTop: 'auto', paddingTop: 6 }}>
                      {wo.status === 'planned' && (
                        <button
                          className="kds-btn-start"
                          onClick={() => A.startProduction(wo.id, sess?.name || 'Central Kitchen Operator')}
                        >
                          🔥 START PRODUCTION BATCH
                        </button>
                      )}

                      {isInProd && (
                        <button
                          className="kds-btn-done-all"
                          onClick={() => handleOpenCompleteModal(wo)}
                        >
                          ✓ COMPLETE & QA SIGN-OFF
                        </button>
                      )}

                      {isCompleted && (
                        <button
                          className="kds-btn-reopen"
                          onClick={() => setLabelModalWO(wo)}
                        >
                          🏷️ PRINT BATCH LABEL & TRACE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BOMs & Recipe Costing Tab */}
      {tab === 'boms' && (
        <div>
          <div className="kds-card" style={{ padding: 14, marginBottom: 14 }}>
            <b style={{ fontSize: 16 }}>Bill of Materials (BOM) & Industrial Cost Formulation</b>
            <p style={{ fontSize: 13, color: 'var(--mut)', margin: '4px 0 0' }}>
              Standard ingredient recipes, yield conversion factors, labor allocation, and overhead absorption for central kitchen production.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {boms.map(bom => {
              const materialsCost = bom.ingredients.reduce((acc, ing) => {
                const stk = (S.stock || []).find(x => x.id === ing.stockId);
                return acc + (ing.qty * (stk?.unitCost || 5000));
              }, 0);
              const totalCost = materialsCost + bom.laborCost + bom.overheadCost;
              const costPerUnit = Math.round(totalCost / bom.targetYield);

              return (
                <div key={bom.id} className="kds-card">
                  <div style={{ background: '#0E5A47', color: '#fff', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: 16 }}>{bom.name}</b>
                      <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                        Yield: {bom.targetYield} {bom.uom}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                      Output Item: <b>{bom.outputName}</b> · Prep: {bom.prepTimeMins}m
                    </div>
                  </div>

                  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <b style={{ fontSize: 13, color: '#1E293B' }}>Raw Ingredients Consumed:</b>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 8 }}>
                      {bom.ingredients.map((ing, idx) => {
                        const stk = (S.stock || []).find(x => x.id === ing.stockId);
                        const lineCost = ing.qty * (stk?.unitCost || 5000);
                        return (
                          <div key={idx} className="row" style={{ fontSize: 12, padding: '3px 0' }}>
                            <span>{ing.qty} {ing.uom} {ing.name}</span>
                            <b>{fmt(lineCost)}</b>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ background: '#F1F5F9', padding: 8, borderRadius: 8, fontSize: 12 }}>
                      <div className="row"><span>Materials Cost:</span><span>{fmt(materialsCost)}</span></div>
                      <div className="row"><span>Labor Cost:</span><span>{fmt(bom.laborCost)}</span></div>
                      <div className="row"><span>Overhead:</span><span>{fmt(bom.overheadCost)}</span></div>
                      <div className="row" style={{ borderTop: '1px solid #CBD5E1', paddingTop: 4, fontWeight: 800 }}>
                        <span>Unit Cost:</span>
                        <b style={{ color: '#16A34A', fontSize: 13 }}>{fmt(costPerUnit)} / {bom.uom}</b>
                      </div>
                    </div>

                    <button
                      className="kds-btn-start"
                      style={{ marginTop: 'auto' }}
                      onClick={() => {
                        setSelBomId(bom.id);
                        setTargetYield(String(bom.targetYield));
                        setNewBatchModal(true);
                      }}
                    >
                      + Schedule Batch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Finished Goods Tab */}
      {tab === 'finished' && (
        <div>
          <div className="kds-card" style={{ padding: 14, marginBottom: 14 }}>
            <b style={{ fontSize: 16 }}>Finished & Prepared Goods Inventory Storage</b>
            <p style={{ fontSize: 13, color: 'var(--mut)', margin: '4px 0 0' }}>
              Real-time stock of kitchen-manufactured finished and semi-finished food items stored in temperature-controlled chillers.
            </p>
          </div>

          <div className="kds-card" style={{ overflowX: 'auto', padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: 10 }}>Finished Product</th>
                  <th style={{ padding: 10 }}>Category</th>
                  <th style={{ padding: 10 }}>On-Hand Stock</th>
                  <th style={{ padding: 10 }}>PAR Target</th>
                  <th style={{ padding: 10 }}>Batch Lot</th>
                  <th style={{ padding: 10 }}>Unit Cost</th>
                  <th style={{ padding: 10 }}>Expiry Date</th>
                  <th style={{ padding: 10 }}>Location</th>
                  <th style={{ padding: 10 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {finishedGoods.map(fg => {
                  const isLow = fg.onHand < fg.reorder;
                  return (
                    <tr key={fg.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: 10 }}>
                        <b>{fg.name}</b>
                        {fg.menuId && <div style={{ fontSize: 11, color: 'var(--mut)' }}>Linked Sales Item: #{fg.menuId} {M[fg.menuId]?.n}</div>}
                      </td>
                      <td style={{ padding: 10 }}>{fg.category}</td>
                      <td style={{ padding: 10 }}><b style={{ fontSize: 14 }}>{fmtNum(fg.onHand)} {fg.uom}</b></td>
                      <td style={{ padding: 10 }}>{fg.par} {fg.uom}</td>
                      <td style={{ padding: 10 }}><code>{fg.batchNo}</code></td>
                      <td style={{ padding: 10 }}>{fmt(fg.unitCost)}</td>
                      <td style={{ padding: 10 }}>{fg.expiry}</td>
                      <td style={{ padding: 10 }}>{fg.loc}</td>
                      <td style={{ padding: 10 }}>
                        <span
                          style={{
                            background: isLow ? '#FEE2E2' : '#DCFCE7',
                            color: isLow ? '#DC2626' : '#16A34A',
                            fontWeight: 800,
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 4
                          }}
                        >
                          {isLow ? 'REORDER NEEDED' : 'IN STOCK ✓'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requisitions Tab */}
      {tab === 'requisitions' && (
        <div>
          <div className="kds-card" style={{ padding: 14, marginBottom: 14 }}>
            <b style={{ fontSize: 16 }}>Branch Outlets Internal Requisitions & Temperature-Monitored Dispatch</b>
            <p style={{ fontSize: 13, color: 'var(--mut)', margin: '4px 0 0' }}>
              Transfer requests from satellite branches to Masaki central facility with refrigerated vehicle monitoring.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
            {siteRequisitions.map(req => {
              const isDispatched = req.status === 'dispatched';
              const isReceived = req.status === 'received';

              return (
                <div key={req.id} className="kds-card">
                  <div style={{ background: isReceived ? '#16A34A' : isDispatched ? '#3182CE' : '#ED8936', color: '#fff', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: 15 }}>{req.id} · {req.fromSiteName.split('·')[1] || req.fromSiteName}</b>
                      <span style={{ fontSize: 11, background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--mut)' }}>
                      Requested by: {req.requestedBy}
                    </div>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 8 }}>
                      {(req.items || []).map((it, idx) => (
                        <div key={idx} className="row" style={{ fontSize: 13, padding: '3px 0' }}>
                          <span>{it.qty} {it.uom} {it.name}</span>
                          <span style={{ color: '#16A34A', fontWeight: 700 }}>Allocated ✓</span>
                        </div>
                      ))}
                    </div>

                    {isDispatched && (
                      <div style={{ fontSize: 12, color: '#334155', background: '#EFF6FF', padding: 8, borderRadius: 6 }}>
                        🚚 Driver: <b>{req.driver}</b> · Van Temp: <b>{req.transportTemp}</b>
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: 6 }}>
                      {req.status === 'pending' && (
                        <button className="kds-btn-start" onClick={() => setDispatchModalReq(req)}>
                          🚚 DISPATCH REFRIGERATED VAN
                        </button>
                      )}

                      {isDispatched && (
                        <button
                          className="kds-btn-done-all"
                          onClick={() => A.receiveRequisition(req.id, sess?.name || 'Branch Receiver')}
                        >
                          ✓ CONFIRM BRANCH RECEIPT
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Traceability Tab */}
      {tab === 'traceability' && (
        <div style={{ maxWidth: 800 }}>
          <div className="kds-card" style={{ padding: 14, marginBottom: 14 }}>
            <b style={{ fontSize: 16 }}>Farm-to-Table Quality & Batch Traceability Explorer</b>
            <p style={{ fontSize: 13, color: 'var(--mut)', margin: '4px 0 0' }}>
              Search any Customer Ticket # or Production Batch to audit source supplier lots, preparation temperature, and serving logs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              className="inp"
              style={{ margin: 0, flex: 1 }}
              placeholder="Search Order # (e.g. #0001, #0009)..."
              value={traceQuery}
              onChange={e => setTraceQuery(e.target.value)}
            />
            <button className="btn sm o" style={{ width: 'auto', background: '#0E5A47' }}>
              Trace Chain
            </button>
          </div>

          {searchedOrder ? (
            <div className="kds-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                <div>
                  <b style={{ fontSize: 18 }}>Order {searchedOrder.no} · {searchedOrder.tb}</b>
                  <div style={{ fontSize: 12, color: 'var(--mut)' }}>Server: {searchedOrder.by} · Placed: {fmtTime(searchedOrder.t)}</div>
                </div>
                <span className="kds-guests-badge">👥 Guests {searchedOrder.guests}</span>
              </div>

              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ borderLeft: '3px solid #16A34A', paddingLeft: 12 }}>
                  <b style={{ fontSize: 13, color: '#16A34A' }}>Step 1: Raw Material Receiving</b>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                    Supplied by <b>Serengeti Meats & Poultry</b> (Batch LOT-20261028-A) · Received temp: 2.1°C
                  </div>
                </div>

                <div style={{ borderLeft: '3px solid #ED8936', paddingLeft: 12 }}>
                  <b style={{ fontSize: 13, color: '#ED8936' }}>Step 2: Central Kitchen Production</b>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                    Marinated & prepped under <b>WO-101 (BATCH-20261101-01)</b> · Lead: Chef Baraka · HACCP Cold Chain: 2.6°C
                  </div>
                </div>

                <div style={{ borderLeft: '3px solid #3182CE', paddingLeft: 12 }}>
                  <b style={{ fontSize: 13, color: '#3182CE' }}>Step 3: Station Cooking & Pass Expo</b>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                    Fired on Charcoal Grill Station · Checked out by <b>Ammie</b> at POS
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="kds-card" style={{ padding: 24, textAlign: 'center', color: 'var(--mut)' }}>
              No order found matching "{traceQuery}". Try searching #0001 or #0009.
            </div>
          )}
        </div>
      )}

      {/* New Batch Modal */}
      {newBatchModal && (
        <Sheet t="Schedule Central Kitchen Batch" c={() => setNewBatchModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Select Recipe BOM</label>
              <select
                className="inp"
                value={selBomId}
                onChange={e => {
                  setSelBomId(e.target.value);
                  const b = boms.find(x => x.id === e.target.value);
                  if (b) setTargetYield(String(b.targetYield));
                }}
              >
                {boms.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Output: {b.outputName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Target Planned Yield</label>
              <input
                className="inp"
                type="number"
                value={targetYield}
                onChange={e => setTargetYield(e.target.value)}
              />
            </div>

            <button className="kds-btn-start" style={{ marginTop: 8 }} onClick={handleCreateBatch}>
              Schedule Production Work Order
            </button>
          </div>
        </Sheet>
      )}

      {/* Complete Batch Modal */}
      {completeModalWO && (
        <Sheet t={`Complete & QA Audit · ${completeModalWO.batchNo}`} c={() => setCompleteModalWO(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Actual Yield Output ({completeModalWO.uom})</label>
              <input
                className="inp"
                type="number"
                value={actualYieldInput}
                onChange={e => setActualYieldInput(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Cold Chain Temperature Log</label>
              <input
                className="inp"
                value={tempLogInput}
                onChange={e => setTempLogInput(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>QA Quality & Sensory Notes</label>
              <textarea
                className="inp"
                rows={2}
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
              />
            </div>

            <button className="kds-btn-done-all" onClick={handleConfirmComplete}>
              Confirm QA Pass & Add to Finished Goods Stock
            </button>
          </div>
        </Sheet>
      )}

      {/* Dispatch Modal */}
      {dispatchModalReq && (
        <Sheet t={`Refrigerated Van Dispatch · ${dispatchModalReq.id}`} c={() => setDispatchModalReq(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Driver Name & Vehicle Plate</label>
              <input
                className="inp"
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Refrigerated Cargo Temp Log</label>
              <input
                className="inp"
                value={transportTemp}
                onChange={e => setTransportTemp(e.target.value)}
              />
            </div>

            <button className="kds-btn-start" onClick={handleConfirmDispatch}>
              Sign-Off Dispatch & Print Manifest
            </button>
          </div>
        </Sheet>
      )}

      {/* Batch Label Modal */}
      {labelModalWO && (
        <Sheet t="Print Industrial Batch Label" c={() => setLabelModalWO(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="receipt-paper" style={{ padding: 20 }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 8 }}>
                <b style={{ fontSize: 16 }}>SAFARI GRILL MANUFACTURING</b>
                <div style={{ fontSize: 12 }}>Masaki Central Food Production Hub</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <b>{labelModalWO.productName}</b>
                <b>{labelModalWO.actualYield} {labelModalWO.uom}</b>
              </div>

              <div style={{ fontSize: 12, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div>Batch Lot: <code>{labelModalWO.batchNo}</code></div>
                <div>Storage: <b>Chiller 0°C to 3°C</b> (Logged: {labelModalWO.tempLog})</div>
                <div>Prep Date: <b>{new Date().toLocaleDateString()}</b></div>
                <div>Best Before: <b>{labelModalWO.expiryDate}</b></div>
                <div>Operator: <b>{labelModalWO.operator}</b></div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px dashed #000' }}>
                <span style={{ fontSize: 24, letterSpacing: 4 }}>||| | |||| | ||| |||| |</span>
                <div style={{ fontSize: 10 }}>BARCODE: {labelModalWO.batchNo.replace('-', '')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn o sm"
                style={{ background: '#0E5A47' }}
                onClick={() => {
                  window.print();
                  setLabelModalWO(null);
                }}
              >
                🖨️ Print Label Sticker
              </button>
              <button className="btn sm ghost" onClick={() => setLabelModalWO(null)}>
                Close
              </button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}

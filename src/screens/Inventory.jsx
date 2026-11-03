import React, { useState, useContext } from 'react';
import { fmt, fmtNum, fmtDateTime, SUPPLIERS, RECIPES } from '../data';
import { Ctx } from '../store';
import { Hd, Pill, Sheet, Tabs, TopBar } from '../components/ui';
import { StockIngredientSlideSelector, CATEGORY_ICONS, CATEGORY_BG } from '../components/StockIngredientSlideSelector';
import {
  FastDrinkPurchaseModal,
  FastRegistryModal,
  ReturnableCratesTracker,
  LocationAndProfitReportsView,
  ManagerReviewModal
} from '../components/FastDrinksAndInventory';
import { MenuManagementView } from '../components/MenuManagement';

export const getItemLocations = (item) => {
  if (!item) return { storeQty: 0, kitchenQty: 0, barQty: 0 };
  let sQ = Number(item.storeQty);
  let kQ = Number(item.kitchenQty);
  let bQ = Number(item.barQty);
  const total = (isNaN(sQ) ? 0 : sQ) + (isNaN(kQ) ? 0 : kQ) + (isNaN(bQ) ? 0 : bQ);
  const onHand = Number(item.onHand) || 0;

  if (total === 0 && onHand > 0) {
    const loc = (item.loc || '').toLowerCase();
    const cat = (item.cat || '').toLowerCase();
    if (loc.includes('bar') || (cat.includes('drinks') && loc.includes('station'))) {
      return { storeQty: 0, kitchenQty: 0, barQty: onHand };
    }
    if (loc.includes('kitchen') || loc.includes('pass') || loc.includes('prep')) {
      return { storeQty: 0, kitchenQty: onHand, barQty: 0 };
    }
    return { storeQty: onHand, kitchenQty: 0, barQty: 0 };
  }

  return {
    storeQty: isNaN(sQ) ? 0 : sQ,
    kitchenQty: isNaN(kQ) ? 0 : kQ,
    barQty: isNaN(bQ) ? 0 : bQ
  };
};

export function Inventory({ sess, out, setSess, setV }) {
  const { S, A } = useContext(Ctx);
  const [tab, setTab] = useState('stock');
  const [catFilter, setCatFilter] = useState('All');
  const [q, setQ] = useState('');

  // Physical Stock Count inputs & feedback
  const [countInputs, setCountInputs] = useState({});
  const [countSubmitted, setCountSubmitted] = useState(false);

  // Modals & Drawers
  const [fastPurchaseModal, setFastPurchaseModal] = useState(false);
  const [fastRegistryModal, setFastRegistryModal] = useState(false);
  const [managerReviewModal, setManagerReviewModal] = useState(false);
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    stockId: 'stk_soda',
    location: 'Bar',
    deltaQty: '1',
    reason: 'Breakage (dropped bottle)',
    notes: 'Broken during service'
  });

  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [transferItem, setTransferItem] = useState(null);
  const [transferModal, setTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromLoc: 'Main Store',
    toLoc: 'Bar Station',
    stockId: 'stk_soda',
    purchaseUnit: 'Crate',
    factor: 24,
    qty: '1',
    notes: 'Shift stock transfer to bar'
  });

  // Receiving Goods & HACCP
  const [receivingPO, setReceivingPO] = useState(null);
  const [receivingTemp, setReceivingTemp] = useState('3.2°C');

  // PO & RFQ Modals
  const [newPOModal, setNewPOModal] = useState(false);
  const [newPOType, setNewPOType] = useState('existing'); // 'existing' | 'new'
  const [selectedSupplierId, setSelectedSupplierId] = useState('sup_1');
  const [selectedStockId, setSelectedStockId] = useState('stk_chicken');
  const [poQty, setPoQty] = useState('20');
  const [poUnitPrice, setPoUnitPrice] = useState('8500');

  // Brand new item form inside PO/RFQ
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    cat: 'Produce',
    uom: 'kg',
    itemType: 'raw_material', // 'raw_material' | 'direct_resale'
    par: 40,
    reorder: 15,
    unitPrice: 3500,
    sellingPrice: 7000,
    loc: 'Main Store'
  });

  // RFQ Creation & Bidding
  const [newRFQModal, setNewRFQModal] = useState(false);
  const [rfqStockDrawerOpen, setRfqStockDrawerOpen] = useState(false);
  const [poStockDrawerOpen, setPoStockDrawerOpen] = useState(false);
  const [transferStockDrawerOpen, setTransferStockDrawerOpen] = useState(false);
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqStockId, setRfqStockId] = useState('stk_chicken');
  const [rfqQty, setRfqQty] = useState('50');
  const [rfqNotes, setRfqNotes] = useState('');
  const [biddingRFQ, setBiddingRFQ] = useState(null);
  const [bidForm, setBidForm] = useState({ supplierId: 'sup_1', quoteAmount: 420000, leadDays: 1 });

  // Invoice Settlement (3-way match)
  const [settlingPO, setSettlingPO] = useState(null);
  const [settleMethod, setSettleMethod] = useState('bank');
  const [settleRef, setSettleRef] = useState('');

  // Waste logging modal
  const [wasteModal, setWasteModal] = useState(false);
  const [wasteForm, setWasteForm] = useState({
    stockId: 'stk_potatoes',
    qty: '2.5',
    reason: 'Trimming loss / bruised',
    uom: 'kg'
  });

  // Detail sheets
  const [viewTransferManifest, setViewTransferManifest] = useState(null);
  const [viewPOModal, setViewPOModal] = useState(null);

  // Filters & categorization
  const rawStock = (S.stock || []).filter(item => item.itemType !== 'direct_resale');
  const retailStock = (S.stock || []).filter(item => item.itemType === 'direct_resale');

  const stockList = (tab === 'retail' ? retailStock : rawStock).filter(item => {
    const matchCat = catFilter === 'All' || item.cat === catFilter;
    const matchQ = item.name.toLowerCase().includes(q.toLowerCase()) || (item.loc || '').toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  const categories = ['All', ...new Set((tab === 'retail' ? retailStock : rawStock).map(s => s.cat))];

  // Physical Count variance
  const getVariance = item => {
    const inputVal = countInputs[item.id];
    if (inputVal === undefined || inputVal === '') return 0;
    return +inputVal - item.theoretical;
  };

  const handleApplyStockCount = () => {
    A.recordCount(countInputs, sess?.name || 'Hamisi Bakari');
    setCountSubmitted(true);
    setTimeout(() => setCountSubmitted(false), 3000);
  };

  const handleReceivePO = poId => {
    A.receivePO(poId, receivingTemp, sess?.name || 'Hamisi Bakari');
    setReceivingPO(null);
  };

  const handleSettlePO = () => {
    if (!settlingPO) return;
    A.payPOInvoice(settlingPO.id, settleMethod, settleRef || `SETTLE-${settlingPO.id}`, sess?.name || 'Cashier Zawadi');
    setSettlingPO(null);
  };

  const handleCreatePO = () => {
    const supplier = SUPPLIERS.find(s => s.id === selectedSupplierId) || SUPPLIERS[0];

    if (newPOType === 'existing') {
      const stockItem = (S.stock || []).find(s => s.id === selectedStockId);
      const qty = +poQty || 10;
      const unitPrice = +poUnitPrice || stockItem?.unitCost || 5000;
      const total = qty * unitPrice;

      A.createPO({
        supplierId: selectedSupplierId,
        supplierName: supplier.name,
        siteId: S.siteId || 'masaki',
        items: [
          { stockId: selectedStockId, name: stockItem?.name, qty, unitPrice, uom: stockItem?.uom, isNewItem: false }
        ],
        total,
        notes: `Replenishment order for ${stockItem?.name}`
      }, sess?.name || 'Hamisi Bakari');
    } else {
      // Brand new item creation
      const qty = +poQty || 10;
      const unitPrice = +newItemForm.unitPrice || 3000;
      const total = qty * unitPrice;

      A.createPO({
        supplierId: selectedSupplierId,
        supplierName: supplier.name,
        siteId: S.siteId || 'masaki',
        items: [
          {
            name: newItemForm.name,
            qty,
            unitPrice,
            uom: newItemForm.uom,
            cat: newItemForm.cat,
            itemType: newItemForm.itemType,
            sellingPrice: newItemForm.itemType === 'direct_resale' ? +newItemForm.sellingPrice : null,
            par: +newItemForm.par,
            reorder: +newItemForm.reorder,
            loc: newItemForm.loc,
            isNewItem: true
          }
        ],
        total,
        notes: `New item procurement: ${newItemForm.name} (${newItemForm.itemType === 'direct_resale' ? 'Direct Resale' : 'Raw Material'})`
      }, sess?.name || 'Hamisi Bakari');
    }

    setNewPOModal(false);
  };

  const handleExecuteTransfer = () => {
    const stk = (S.stock || []).find(s => s.id === transferForm.stockId);
    if (!stk) return;

    A.fastTransfer({
      stockId: stk.id,
      fromLoc: transferForm.fromLoc,
      toLoc: transferForm.toLoc,
      purchaseUnit: transferForm.purchaseUnit || 'Single',
      factor: Number(transferForm.factor) || 1,
      purchaseQty: Number(transferForm.qty) || 1,
      notes: transferForm.notes
    }, sess?.name || 'Hamisi Bakari');

    setTransferModal(false);
  };

  const handleSaveStockEdit = () => {
    if (!editItem) return;
    A.editStockItem(editItem.id, {
      name: editItem.name,
      par: +editItem.par,
      reorder: +editItem.reorder,
      unitCost: +editItem.unitCost,
      sellingPrice: editItem.sellingPrice ? +editItem.sellingPrice : null,
      loc: editItem.loc
    }, sess?.name || 'Hamisi Bakari');
    setEditItem(null);
  };

  const handleCreateRFQ = () => {
    const stockItem = (S.stock || []).find(s => s.id === rfqStockId);
    const qty = +rfqQty || 20;

    A.createRFQ({
      title: rfqTitle || `Restock RFQ for ${stockItem?.name || 'Supplies'}`,
      items: [
        { stockId: rfqStockId, name: stockItem?.name, qty, uom: stockItem?.uom }
      ],
      notes: rfqNotes
    }, sess?.name || 'Hamisi Bakari');

    setNewRFQModal(false);
    setRfqTitle('');
    setRfqNotes('');
  };

  const handleAddBid = () => {
    if (!biddingRFQ) return;
    const sup = SUPPLIERS.find(s => s.id === bidForm.supplierId);
    A.addRFQBid(biddingRFQ.id, {
      supplierId: bidForm.supplierId,
      supplierName: sup?.name || 'Supplier',
      quoteAmount: +bidForm.quoteAmount,
      leadDays: +bidForm.leadDays
    }, sess?.name || 'Hamisi Bakari');
    setBiddingRFQ(null);
  };

  const handleConvertRFQ = (rfq, bid) => {
    A.convertRFQToPO(rfq.id, bid.supplierId, bid.quoteAmount, sess?.name || 'Hamisi Bakari');
  };

  const handleLogWasteSubmit = () => {
    const stk = (S.stock || []).find(s => s.id === wasteForm.stockId);
    const qty = +wasteForm.qty || 1;
    const cost = Math.round(qty * (stk?.unitCost || 2000));
    A.logWaste({
      stockId: wasteForm.stockId,
      name: stk?.name || 'Ingredient',
      qty,
      uom: stk?.uom || wasteForm.uom,
      cost,
      reason: wasteForm.reason
    }, sess?.name || 'Hamisi Bakari');
    setWasteModal(false);
  };

  const unreviewedItems = (S.menu || []).filter(m => m.needsReview);
  const totalCratesOwed = (S.crateLedger || []).reduce((acc, c) => acc + (c.netCratesOwed || 0), 0);

  return (
    <div className="app wide">
      <TopBar sess={sess} setSess={setSess} setV={setV} currentView="storekeeper" />

      {/* Unreviewed Items Alert Banner (Design Requirement 6) */}
      {unreviewedItems.length > 0 && (
        <div
          style={{
            background: '#FFF9ED',
            border: '1.5px solid #FFE2A8',
            borderRadius: 14,
            padding: '10px 16px',
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <b style={{ color: '#B45309', fontSize: 14 }}>
                {unreviewedItems.length} Menu Items Quick-Added on Site
              </b>
              <div style={{ fontSize: 12, color: '#92400E' }}>
                These items are currently live on POS. Please link inventory stock items or cost structures.
              </div>
            </div>
          </div>
          <button
            className="btn sm o"
            style={{ fontSize: 12, padding: '6px 12px', background: '#D97706' }}
            onClick={() => setManagerReviewModal(true)}
          >
            Review &amp; Link Stock Now ({unreviewedItems.length})
          </button>
        </div>
      )}

      <Hd
        s={`Store & Warehouse Management · ${sess?.name || 'Hamisi Bakari'}`}
        t="Inventory & Procurement"
        r={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* ⚡ Fast Drink Purchase Button */}
            <button
              className="btn sm o"
              style={{ background: 'linear-gradient(135deg, #093B2F, #0E5A47)', border: 0, fontWeight: 700 }}
              onClick={() => setFastPurchaseModal(true)}
            >
              ⚡ Fast Drink Purchase
            </button>

            {/* 📝 Bulk Item Registry & Grid */}
            <button
              className="btn sm o"
              onClick={() => setFastRegistryModal(true)}
            >
              📝 Bulk Registry &amp; Grid
            </button>

            {/* Kitchen Tracking Mode: Option A (Simple Issue) vs Option B (Recipe BOM) */}
            <button
              className="btn sm ghost"
              style={{
                background: S.kitchenTrackingMode === 'recipe' ? '#F1DDF5' : '#E5F2EE',
                color: S.kitchenTrackingMode === 'recipe' ? '#8E44AD' : 'var(--g)',
                borderColor: S.kitchenTrackingMode === 'recipe' ? '#8E44AD' : 'var(--g)',
                fontSize: 12
              }}
              title="Click to toggle Option A (Simple Issue) vs Option B (Recipe BOM)"
              onClick={() => {
                const nextMode = S.kitchenTrackingMode === 'recipe' ? 'simple' : 'recipe';
                A.setKitchenTrackingMode(nextMode, sess?.name || 'Storekeeper');
              }}
            >
              {S.kitchenTrackingMode === 'recipe' ? '🍳 Mode: Option B (Recipe BOM)' : '🍳 Mode: Option A (Simple Issue)'}
            </button>

            <button className="btn sm ghost" onClick={() => setTransferModal(true)}>
              ⇄ Stock Transfer
            </button>

            <button className="btn sm ghost" onClick={out}>
              Exit
            </button>
          </div>
        }
      />

      {/* Sub-Navigation in one single horizontal line without overflow */}
      <div className="inv-subnav">
        {[
          ['retail', '🥤 Drinks & Direct Resale', '', (S.stock || []).filter(s => s.itemType === 'direct_resale' || s.cat === 'Drinks').length],
          ['stock', '🥩 Raw Ingredients', '', (S.stock || []).filter(s => s.itemType !== 'direct_resale' && s.cat !== 'Drinks').length],
          ['menu', '🍽️ Menu & Dish Catalog', '', (S.menu || []).length],
          ['crates', '🍾 Returnable Crates & Empties', '', totalCratesOwed],
          ['reports', '📈 Location & Profit Reports', '', 0],
          ['transfers', '⇄ Transfers', '', (S.transfers || []).length],
          ['finished', '🍱 Finished Goods', '', (S.finishedGoods || []).length],
          ['receiving', '📥 PO Receiving', '', (S.purchaseOrders || []).filter(p => p.status !== 'received').length],
          ['rfq', '📋 RFQ & Bidding', '', (S.rfqs || []).filter(r => r.status === 'bidding').length],
          ['count', '📊 Physical Count', '', 0],
          ['procurement', '🤝 Suppliers Master', '', (S.purchaseOrders || []).length],
          ['waste', '🗑️ Waste & Adjustments', '', (S.wasteLog || []).length]
        ].map(([k, l, icon, count]) => (
          <button
            key={k}
            className={`inv-tab-btn ${tab === k ? 'on' : ''}`}
            onClick={() => { setTab(k); setCatFilter('All'); }}
          >
            <span>{l}</span>
            {count !== undefined && count > 0 && (
              <span className={`inv-tab-badge ${k === 'crates' ? 'warn' : ''}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* RAW MATERIALS & DIRECT RESALE TABLES */}
      {(tab === 'stock' || tab === 'retail') && (
        <>
          <div className="card" style={{ marginBottom: 12, background: tab === 'stock' ? 'linear-gradient(135deg, #093B2F, #0E5A47)' : 'linear-gradient(135deg, #C2410C, #FF6B2C)', color: '#fff' }}>
            <div className="row">
              <div>
                <b style={{ fontSize: 16 }}>
                  {tab === 'stock' ? '🥩 Raw Materials Stock & Kitchen Issuing' : '🥤 Direct Resale Goods (Retail Menu Items)'}
                </b>
                <p style={{ fontSize: 13, margin: '4px 0 0', color: 'rgba(255,255,255,0.85)' }}>
                  {tab === 'stock'
                    ? 'Raw ingredients are purchased from approved suppliers, received into Main Store, and transferred to the Kitchen before BOM production.'
                    : 'Direct resale goods are purchased with set cost and sales prices, and automatically linked to the customer & waiter sales menu without kitchen cooking.'}
                </p>
              </div>
              <button
                className="btn sm ghost"
                style={{ background: '#fff', color: tab === 'stock' ? 'var(--g)' : 'var(--o)', border: 0, fontWeight: 700 }}
                onClick={() => setTransferModal(true)}
              >
                ⇄ Issue / Transfer
              </button>
            </div>
          </div>

          <div className="search" style={{ marginBottom: 10 }}>
            <span>🔍</span>
            <input
              placeholder={`Search ${tab === 'stock' ? 'ingredients' : 'retail items'}, storage bins, codes...`}
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>

          <div className="cats" style={{ marginBottom: 12 }}>
            {categories.map(c => (
              <button
                key={c}
                className={catFilter === c ? 'on' : ''}
                onClick={() => setCatFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Stock Item</th>
                  <th>Type & Loc</th>
                  <th>Store Qty</th>
                  <th>Kitchen Qty</th>
                  <th>Bar Qty</th>
                  <th>Total Physical</th>
                  <th>Theoretical</th>
                  <th>Unit Cost</th>
                  {tab === 'retail' && <th>Sell Price</th>}
                  <th>Total Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockList.map(item => {
                  const isCritical = item.onHand <= item.reorder;
                  const isLow = item.onHand <= item.par && !isCritical;
                  const locs = getItemLocations(item);

                  return (
                    <tr key={item.id}>
                      <td>
                        <b>{item.name}</b>
                        <div style={{ fontSize: 12, color: 'var(--mut)' }}>{item.cat}</div>
                      </td>
                      <td>
                        <span className="chip" style={{ fontSize: 11, padding: '2px 6px', margin: 0, background: item.itemType === 'direct_resale' ? '#FFE9DD' : '#E5F2EE', color: item.itemType === 'direct_resale' ? '#C2410C' : 'var(--g)' }}>
                          {item.itemType === 'direct_resale' ? 'Direct Resale' : 'Raw Ingredient'}
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--mut)', marginTop: 2 }}>{item.loc}</div>
                      </td>
                      <td><b>{fmtNum(locs.storeQty)}</b> <small>{item.uom}</small></td>
                      <td style={{ color: locs.kitchenQty > 0 ? 'var(--g)' : 'var(--mut)' }}>
                        <b>{fmtNum(locs.kitchenQty)}</b> <small>{item.uom}</small>
                      </td>
                      <td style={{ color: locs.barQty > 0 ? '#007AFF' : 'var(--mut)' }}>
                        <b>{fmtNum(locs.barQty)}</b> <small>{item.uom}</small>
                      </td>
                      <td><b>{fmtNum(item.onHand)} {item.uom}</b></td>
                      <td style={{ color: 'var(--g)' }}>{fmtNum(item.theoretical)} {item.uom}</td>
                      <td>{fmt(item.unitCost)}</td>
                      {tab === 'retail' && (
                        <td style={{ color: 'var(--o)', fontWeight: 700 }}>
                          {item.sellingPrice ? fmt(item.sellingPrice) : '—'}
                        </td>
                      )}
                      <td><b>{fmt(item.onHand * item.unitCost)}</b></td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background: isCritical ? '#FFE0DE' : isLow ? '#FFE9DD' : '#DDF3E4',
                            color: isCritical ? '#C62828' : isLow ? '#C2410C' : '#15803D'
                          }}
                        >
                          {isCritical ? 'Critical' : isLow ? 'Low' : 'Optimal'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-group" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {(item.cat === 'Drinks' || item.itemType === 'direct_resale') && (
                            <button
                              className="action-btn settle"
                              style={{ fontWeight: 700, color: 'var(--g)', background: '#E5F2EE', borderColor: 'var(--g)' }}
                              title="Fast Drink Purchase (One-tap units & direct store receiving)"
                              onClick={() => {
                                setSelectedStockId(item.id);
                                setFastPurchaseModal(true);
                              }}
                            >
                              ⚡ Buy
                            </button>
                          )}
                          <button
                            className="action-btn view"
                            title="Duplicate Item Structure"
                            onClick={() => setFastRegistryModal(true)}
                          >
                            📋 Duplicate
                          </button>
                          <button
                            className="action-btn transfer"
                            title="Transfer Stock to Kitchen or Bar"
                            onClick={() => {
                              setTransferForm({
                                fromLoc: 'Main Store',
                                toLoc: item.cat === 'Drinks' ? 'Bar Station' : 'Kitchen Prep Station',
                                stockId: item.id,
                                purchaseUnit: item.lastPurchaseUnit || item.defaultPurchaseUnit || 'Single',
                                factor: item.purchaseUnits?.[1]?.factor || 1,
                                qty: '2',
                                notes: 'Internal shift issue'
                              });
                              setTransferModal(true);
                            }}
                          >
                            ⇄ Transfer
                          </button>
                          <button
                            className="action-btn danger"
                            title="Log Breakage, Expiry, or Complimentary Adjustment"
                            onClick={() => {
                              setAdjustmentForm({
                                stockId: item.id,
                                location: item.cat === 'Drinks' ? 'Bar Fridge' : 'Main Store',
                                deltaQty: '1',
                                reason: 'Breakage (dropped bottle)',
                                notes: 'Logged by staff'
                              });
                              setAdjustmentModal(true);
                            }}
                          >
                            ⚠️ Adjust
                          </button>
                          <button
                            className="action-btn edit"
                            title="Edit PAR & Pricing"
                            onClick={() => setEditItem({ ...item })}
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* FINISHED GOODS / PREP STOCK */}
      {tab === 'finished' && (
        <div>
          <div className="card" style={{ marginBottom: 12, background: 'linear-gradient(135deg, #093B2F, #14795f)', color: '#fff' }}>
            <div className="row">
              <div>
                <b style={{ fontSize: 16 }}>🍱 Finished Goods & Central Kitchen Batches (SRS CK-02)</b>
                <p style={{ fontSize: 13, margin: '4px 0 0', color: '#cfe8df' }}>
                  Finished goods produced via Bill of Materials (BOM) work orders. Once production completes, finished goods are automatically linked and available on the sales menu.
                </p>
              </div>
              <button
                className="btn sm ghost"
                style={{ background: '#fff', color: 'var(--g)', border: 0, fontWeight: 700 }}
                onClick={() => setV ? setV('production') : null}
              >
                🏭 Open Central Kitchen
              </button>
            </div>
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Finished Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>PAR Level</th>
                  <th>Unit Cost</th>
                  <th>Active Batch No</th>
                  <th>HACCP Expiry</th>
                  <th>Allergens</th>
                  <th>Storage Location</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(S.finishedGoods || []).map(fg => (
                  <tr key={fg.id}>
                    <td>
                      <b>{fg.name}</b>
                      {fg.menuId && (
                        <div style={{ fontSize: 11, color: 'var(--g)', fontWeight: 600 }}>
                          ✓ Synced to Sales Menu #{fg.menuId}
                        </div>
                      )}
                    </td>
                    <td><small>{fg.category}</small></td>
                    <td><b>{fg.onHand} {fg.uom}</b></td>
                    <td>{fg.par} {fg.uom}</td>
                    <td>{fmt(fg.unitCost)}</td>
                    <td><span className="chip" style={{ margin: 0, fontSize: 11 }}>{fg.batchNo}</span></td>
                    <td><small>{fg.expiry}</small></td>
                    <td>
                      {(fg.allergens || []).length > 0 ? (
                        fg.allergens.map(a => <span key={a} className="allergen-tag">{a}</span>)
                      ) : (
                        <small style={{ color: 'var(--mut)' }}>None</small>
                      )}
                    </td>
                    <td><small>{fg.loc}</small></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn view"
                          onClick={() => setViewItem({ ...fg, isFinished: true })}
                        >
                          👁️ Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RETURNABLE CRATES & EMPTY BOTTLES TAB (Design Requirement 7) */}
      {tab === 'crates' && (
        <ReturnableCratesTracker
          crateLedger={S.crateLedger || []}
          suppliers={S.suppliers || SUPPLIERS}
          onReturnEmpties={A.returnCrates}
        />
      )}

      {/* LOCATION VALUATION & PROFIT MARGIN REPORTS TAB (Design Requirement 7) */}
      {tab === 'reports' && (
        <LocationAndProfitReportsView
          stockList={S.stock || []}
          menu={S.menu || []}
          orders={S.orders || []}
        />
      )}

      {/* MENU & DISH CATALOG TAB */}
      {tab === 'menu' && (
        <MenuManagementView
          menuList={S.menu && S.menu.length ? S.menu : MENU}
          stockList={S.stock || []}
          outOfStockIds={S.outOfStockIds || []}
          onToggle86={(id, actor) => A.toggle86(id, actor || sess?.name || 'Inventory Manager')}
          onCreateItem={(data, actor) => A.createMenuItem(data, actor || sess?.name || 'Inventory Manager')}
          onUpdateItem={(id, data, actor) => A.updateMenuItem(id, data, actor || sess?.name || 'Inventory Manager')}
          onDeleteItem={(id, actor) => A.deleteMenuItem(id, actor || sess?.name || 'Inventory Manager')}
          actor={sess?.name || 'Inventory Manager'}
        />
      )}

      {/* STOCK TRANSFERS TAB */}
      {tab === 'transfers' && (
        <div>
          <div className="row" style={{ marginBottom: 12 }}>
            <p className="sec" style={{ margin: 0 }}>Inter-Location Stock Transfers (Store → Kitchen / Bar)</p>
            <button className="btn sm o" onClick={() => setTransferModal(true)}>
              + Create New Transfer
            </button>
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Transfer ID</th>
                  <th>Date & Time</th>
                  <th>From (Source)</th>
                  <th>To (Destination)</th>
                  <th>Transferred Items</th>
                  <th>Storekeeper</th>
                  <th>Receiver</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(S.transfers || []).map(tr => (
                  <tr key={tr.id}>
                    <td><b>{tr.id}</b></td>
                    <td><small>{fmtDateTime(tr.t)}</small></td>
                    <td><span className="chip" style={{ margin: 0, fontSize: 11 }}>{tr.fromLoc}</span></td>
                    <td><b style={{ color: 'var(--g)' }}>{tr.toLoc}</b></td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        {(tr.items || []).map((it, idx) => (
                          <div key={idx}>• {it.qty} {it.uom} {it.name}</div>
                        ))}
                      </div>
                    </td>
                    <td><small>{tr.transferredBy}</small></td>
                    <td><small>{tr.acceptedBy}</small></td>
                    <td>
                      <span className="pill" style={{ background: '#DDF3E4', color: '#15803D' }}>
                        ✓ {tr.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="action-btn view"
                        onClick={() => setViewTransferManifest(tr)}
                      >
                        👁️ Manifest
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PO RECEIVING & 3-WAY MATCH */}
      {tab === 'receiving' && (
        <div>
          <p className="sec">Goods Receiving Inspection & 3-Way Match (SRS INV-03, PRC-02)</p>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Created Date</th>
                  <th>Total Amount</th>
                  <th>Items Ordered</th>
                  <th>Cold Chain Temp</th>
                  <th>Receiving Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(S.purchaseOrders || []).map(po => {
                  const isReceived = po.status === 'received' || po.status === 'paid';
                  const isPaid = po.status === 'paid';

                  return (
                    <tr key={po.id}>
                      <td><b>{po.id}</b></td>
                      <td><b>{po.supplierName}</b></td>
                      <td><small>{fmtDateTime(po.createdAt)}</small></td>
                      <td><b style={{ color: 'var(--g)' }}>{fmt(po.total)}</b></td>
                      <td>
                        <small>
                          {po.items.map(i => `${i.qty} ${i.uom} ${i.name}`).join(', ')}
                        </small>
                      </td>
                      <td>
                        {po.tempLog ? (
                          <span className="chip" style={{ background: '#E0EDFE', color: '#007AFF', margin: 0, fontSize: 11 }}>
                            🌡️ {po.tempLog}
                          </span>
                        ) : (
                          <small style={{ color: 'var(--mut)' }}>Pending Check</small>
                        )}
                      </td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background: isPaid ? '#DDF3E4' : isReceived ? '#E5F2EE' : '#FFE9DD',
                            color: isPaid ? '#15803D' : isReceived ? 'var(--g)' : '#C2410C'
                          }}
                        >
                          {isPaid ? 'Paid & Settled' : isReceived ? 'Goods Received' : 'Awaiting Delivery'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="action-btn view"
                            onClick={() => setViewPOModal(po)}
                          >
                            👁️ PO Sheet
                          </button>
                          {!isReceived && (
                            <button
                              className="action-btn settle"
                              onClick={() => { setReceivingPO(po); setReceivingTemp('3.2°C'); }}
                            >
                              📥 Receive Goods
                            </button>
                          )}
                          {isReceived && !isPaid && (
                            <button
                              className="action-btn edit"
                              onClick={() => { setSettlingPO(po); setSettleRef(`INV-${po.id}`); }}
                            >
                              💵 Pay Invoice
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RFQ & BIDDING (STEP 1 OF PROCUREMENT) */}
      {tab === 'rfq' && (
        <div>
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <p className="sec" style={{ margin: 0 }}>Requests for Quotation (RFQ) & Supplier Bidding</p>
              <small style={{ color: 'var(--mut)' }}>Step 1: Solicit quotes from approved vendors before issuing purchase orders.</small>
            </div>
            <button className="btn sm o" onClick={() => setNewRFQModal(true)}>
              + Create RFQ
            </button>
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>RFQ ID</th>
                  <th>Title & Description</th>
                  <th>Created Date</th>
                  <th>Required Items</th>
                  <th>Bids Received</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(S.rfqs || []).map(rfq => (
                  <tr key={rfq.id}>
                    <td><b>{rfq.id}</b></td>
                    <td>
                      <b>{rfq.title}</b>
                      {rfq.notes && <div style={{ fontSize: 12, color: 'var(--mut)' }}>{rfq.notes}</div>}
                    </td>
                    <td><small>{fmtDateTime(rfq.createdAt)}</small></td>
                    <td>
                      {(rfq.items || []).map((it, idx) => (
                        <div key={idx} style={{ fontSize: 12 }}>• {it.qty} {it.uom} {it.name}</div>
                      ))}
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        {(rfq.bids || []).length === 0 ? (
                          <span style={{ color: 'var(--mut)' }}>No bids yet</span>
                        ) : (
                          rfq.bids.map((b, i) => (
                            <div key={i} style={{ padding: '2px 0' }}>
                              <b>{b.supplierName}:</b> {fmt(b.quoteAmount)} ({b.leadDays}d)
                              {b.selected && <span style={{ color: 'var(--g)', fontWeight: 700, marginLeft: 4 }}>✓ Awarded</span>}
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className="pill"
                        style={{
                          background: rfq.status === 'converted_to_po' ? '#DDF3E4' : '#FFE9DD',
                          color: rfq.status === 'converted_to_po' ? '#15803D' : '#C2410C'
                        }}
                      >
                        {rfq.status === 'converted_to_po' ? `PO Issued (${rfq.poId})` : 'Active Bidding'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-group" style={{ justifyContent: 'flex-end' }}>
                        {rfq.status === 'bidding' && (
                          <>
                            <button
                              className="action-btn edit"
                              onClick={() => {
                                setBiddingRFQ(rfq);
                                setBidForm({ supplierId: 'sup_1', quoteAmount: 250000, leadDays: 1 });
                              }}
                            >
                              ➕ Add Bid
                            </button>
                            {(rfq.bids || []).length > 0 && (
                              <button
                                className="action-btn settle"
                                onClick={() => handleConvertRFQ(rfq, rfq.bids[0])}
                              >
                                🔄 Convert to PO
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PHYSICAL CYCLE COUNT TAB */}
      {tab === 'count' && (
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="row">
              <div>
                <b>Physical Cycle Count (SRS Section 4.5, INV-05)</b>
                <p style={{ fontSize: 13, color: 'var(--mut)', margin: '4px 0 0' }}>
                  Perform blind cycle count against theoretical depletion. Negative variance logs shrinkage or kitchen over-portioning.
                </p>
              </div>
              <button className="btn sm o" onClick={handleApplyStockCount}>
                ✓ Submit & Reconcile Count
              </button>
            </div>
            {countSubmitted && (
              <div style={{ marginTop: 10, padding: 8, background: '#DDF3E4', color: '#15803D', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                ✓ Physical stock count saved. Variance adjustments logged to tamper-evident audit ledger.
              </div>
            )}
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Stock Item</th>
                  <th>UOM</th>
                  <th>Theoretical (System)</th>
                  <th>Physical Actual Count</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(S.stock || []).map(item => {
                  const variance = getVariance(item);
                  return (
                    <tr key={item.id}>
                      <td><b>{item.name}</b></td>
                      <td>{item.uom}</td>
                      <td><b>{fmtNum(item.theoretical)}</b></td>
                      <td>
                        <input
                          className="inp"
                          style={{ width: 100, padding: '6px 10px', margin: 0 }}
                          type="number"
                          step="0.1"
                          placeholder={String(item.onHand)}
                          value={countInputs[item.id] !== undefined ? countInputs[item.id] : ''}
                          onChange={e => setCountInputs({ ...countInputs, [item.id]: e.target.value })}
                        />
                      </td>
                      <td>
                        <b style={{ color: variance < 0 ? '#FF3B30' : variance > 0 ? '#007AFF' : 'var(--g)' }}>
                          {variance > 0 ? `+${variance}` : variance} {item.uom}
                        </b>
                      </td>
                      <td>
                        <span className="pill" style={{ background: variance < 0 ? '#FFE0DE' : '#DDF3E4', color: variance < 0 ? '#C62828' : '#15803D' }}>
                          {variance === 0 ? 'Balanced' : variance < 0 ? 'Shrinkage' : 'Surplus'}
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

      {/* SUPPLIERS & PO MASTER */}
      {tab === 'procurement' && (
        <div>
          <div className="row" style={{ marginBottom: 12 }}>
            <p className="sec" style={{ margin: 0 }}>Approved Suppliers Directory (SRS PRC-01)</p>
            <button className="btn sm o" onClick={() => setNewPOModal(true)}>
              + Issue Purchase Order
            </button>
          </div>

          <div className="cg" style={{ marginBottom: 20 }}>
            {SUPPLIERS.map(sup => (
              <div key={sup.id} className="card">
                <div className="row">
                  <b>{sup.name}</b>
                  <span className="chip" style={{ background: '#E5F2EE', color: 'var(--g)', margin: 0 }}>★ {sup.rating}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--mut)', margin: '6px 0' }}>
                  Contact: {sup.contact} · {sup.phone}
                </div>
                <div style={{ fontSize: 13 }}>
                  Payment Terms: <b>{sup.terms}</b> · Lead Time: <b>{sup.leadDays} day(s)</b>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {sup.cats.map(cat => (
                    <span key={cat} className="allergen-tag">{cat}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="sec" style={{ marginTop: 14 }}>All Purchase Orders History (PO Master)</p>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Issued Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Received Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(S.purchaseOrders || []).map(p => (
                  <tr key={p.id}>
                    <td><b>{p.id}</b></td>
                    <td>{p.supplierName}</td>
                    <td><small>{fmtDateTime(p.createdAt)}</small></td>
                    <td>
                      <span className="pill" style={{ background: p.status === 'paid' ? '#DDF3E4' : '#E5F2EE', color: p.status === 'paid' ? '#15803D' : 'var(--g)' }}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td><b>{fmt(p.total)}</b></td>
                    <td><small>{p.receivedAt ? fmtDateTime(p.receivedAt) : 'Pending'}</small></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="action-btn view" onClick={() => setViewPOModal(p)}>
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WASTE LOG TAB */}
      {tab === 'waste' && (
        <div>
          <div className="row" style={{ marginBottom: 12 }}>
            <p className="sec" style={{ margin: 0 }}>Waste & Spoilage Audit Log (SRS INV-08)</p>
            <button className="btn sm o" onClick={() => setWasteModal(true)}>
              + Log Waste / Spoilage
            </button>
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Logged Date/Time</th>
                  <th>Stock Item</th>
                  <th>Quantity</th>
                  <th>Estimated Cost</th>
                  <th>Reason Code</th>
                  <th>Logged By</th>
                </tr>
              </thead>
              <tbody>
                {(S.wasteLog || []).map(w => (
                  <tr key={w.id}>
                    <td>{fmtDateTime(w.t)}</td>
                    <td><b>{w.name}</b></td>
                    <td>{w.qty} {w.uom}</td>
                    <td style={{ color: '#FF3B30', fontWeight: 600 }}>{fmt(w.cost)}</td>
                    <td>{w.reason}</td>
                    <td><small>{w.user}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODALS & SHEETS ================= */}

      {/* VIEW ITEM DETAILS SHEET */}
      {viewItem && (
        <Sheet
          title={viewItem.name}
          subtitle={`Inventory Item Details · ${viewItem.id}`}
          maxWidth={560}
          onClose={() => setViewItem(null)}
        >
          <div className="row" style={{ marginBottom: 12 }}>
            <span className="chip" style={{ background: viewItem.itemType === 'direct_resale' ? '#FFE9DD' : '#E5F2EE', color: viewItem.itemType === 'direct_resale' ? '#C2410C' : 'var(--g)', margin: 0, fontWeight: 700 }}>
              {viewItem.itemType === 'direct_resale' ? '🥤 Direct Resale / Retail Good' : '🥩 Raw Production Material'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--mut)' }}>Category: <b>{viewItem.cat}</b></span>
          </div>

          {(() => {
            const vLocs = getItemLocations(viewItem);
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, margin: '14px 0' }}>
                <div style={{ background: 'var(--card)', padding: 12, borderRadius: 12, border: '1px solid var(--line)' }}>
                  <small style={{ color: 'var(--mut)' }}>Main Store / Warehouse</small>
                  <b style={{ fontSize: 20, display: 'block', marginTop: 2 }}>{fmtNum(vLocs.storeQty)} <span style={{ fontSize: 13, fontWeight: 500 }}>{viewItem.uom}</span></b>
                </div>
                <div style={{ background: 'var(--card)', padding: 12, borderRadius: 12, border: '1px solid var(--line)' }}>
                  <small style={{ color: 'var(--mut)' }}>Kitchen Prep Station</small>
                  <b style={{ fontSize: 20, display: 'block', color: 'var(--g)', marginTop: 2 }}>{fmtNum(vLocs.kitchenQty)} <span style={{ fontSize: 13, fontWeight: 500 }}>{viewItem.uom}</span></b>
                </div>
                <div style={{ background: 'var(--card)', padding: 12, borderRadius: 12, border: '1px solid var(--line)' }}>
                  <small style={{ color: 'var(--mut)' }}>Bar Station</small>
                  <b style={{ fontSize: 20, display: 'block', color: '#007AFF', marginTop: 2 }}>{fmtNum(vLocs.barQty)} <span style={{ fontSize: 13, fontWeight: 500 }}>{viewItem.uom}</span></b>
                </div>
                <div style={{ background: 'var(--card)', padding: 12, borderRadius: 12, border: '1px solid var(--line)' }}>
                  <small style={{ color: 'var(--mut)' }}>Total Physical On-Hand</small>
                  <b style={{ fontSize: 20, display: 'block', marginTop: 2 }}>{fmtNum(viewItem.onHand || 0)} <span style={{ fontSize: 13, fontWeight: 500 }}>{viewItem.uom}</span></b>
                </div>
              </div>
            );
          })()}

          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 14, fontSize: 13.5, lineHeight: 1.8 }}>
            <div className="row">
              <span>Target PAR Level:</span>
              <b>{viewItem.par} {viewItem.uom}</b>
            </div>
            <div className="row">
              <span>Automatic Reorder Point:</span>
              <b>{viewItem.reorder} {viewItem.uom}</b>
            </div>
            <div className="row">
              <span>Purchase Unit Cost:</span>
              <b>{fmt(viewItem.unitCost)} / {viewItem.uom}</b>
            </div>
            {viewItem.sellingPrice && (
              <div className="row" style={{ color: 'var(--o)' }}>
                <span>Menu Selling Price (Diners):</span>
                <b>{fmt(viewItem.sellingPrice)}</b>
              </div>
            )}
            <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: 6, marginTop: 4 }}>
              <span>Total Current Stock Valuation:</span>
              <b style={{ color: 'var(--g)', fontSize: 16 }}>{fmt((viewItem.onHand || 0) * (viewItem.unitCost || 0))}</b>
            </div>
            <div className="row">
              <span>Assigned Storage Bin:</span>
              <small style={{ fontWeight: 600 }}>{viewItem.loc}</small>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              className="btn o"
              style={{ flex: 1 }}
              onClick={() => {
                const target = viewItem;
                setViewItem(null);
                setEditItem({ ...target });
              }}
            >
              ✏️ Edit Item Parameters
            </button>
            <button
              className="btn ghost"
              style={{ flex: 1 }}
              onClick={() => {
                const target = viewItem;
                setViewItem(null);
                setTransferForm({
                  fromLoc: 'Main Store',
                  toLoc: target.cat === 'Drinks' ? 'Bar Station' : 'Kitchen Prep Station',
                  stockId: target.id,
                  qty: '10',
                  notes: 'Transfer from details view'
                });
                setTransferModal(true);
              }}
            >
              ⇄ Issue / Transfer
            </button>
          </div>
        </Sheet>
      )}

      {/* EDIT ITEM SHEET */}
      {editItem && (
        <Sheet
          title={`Edit ${editItem.name}`}
          subtitle={`Adjust inventory controls, PAR levels and pricing`}
          maxWidth={540}
          onClose={() => setEditItem(null)}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Item Name:
            </label>
            <input
              className="inp"
              value={editItem.name}
              onChange={e => setEditItem({ ...editItem, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Target PAR Level ({editItem.uom}):
              </label>
              <input
                className="inp"
                type="number"
                value={editItem.par}
                onChange={e => setEditItem({ ...editItem, par: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Reorder Point ({editItem.uom}):
              </label>
              <input
                className="inp"
                type="number"
                value={editItem.reorder}
                onChange={e => setEditItem({ ...editItem, reorder: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Purchase Unit Cost (TSh):
              </label>
              <input
                className="inp"
                type="number"
                value={editItem.unitCost}
                onChange={e => setEditItem({ ...editItem, unitCost: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Menu Selling Price (if retail):
              </label>
              <input
                className="inp"
                type="number"
                placeholder="Only for retail goods"
                value={editItem.sellingPrice || ''}
                onChange={e => setEditItem({ ...editItem, sellingPrice: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Storage Location / Bin:
            </label>
            <input
              className="inp"
              value={editItem.loc}
              onChange={e => setEditItem({ ...editItem, loc: e.target.value })}
            />
          </div>

          <button className="btn o" onClick={handleSaveStockEdit}>
            Save Stock Adjustments
          </button>
        </Sheet>
      )}

      {/* INTER-LOCATION STOCK TRANSFER MODAL WITH SLIDE WORKBENCH */}
      {transferModal && (() => {
        const curStk = (S.stock || []).find(s => s.id === transferForm.stockId) || S.stock?.[0];
        const curLocs = getItemLocations(curStk);
        return (
          <Sheet
            title="Inter-Location Stock Transfer"
            subtitle="Storekeeper Physical Movement Voucher (Store → Kitchen / Bar)"
            maxWidth={transferStockDrawerOpen ? 1160 : 560}
            bodyStyle={{ padding: 0 }}
            extraHeader={
              <button
                type="button"
                className="action-btn"
                onClick={() => setTransferStockDrawerOpen(!transferStockDrawerOpen)}
                style={{
                  fontSize: 12,
                  padding: '5px 11px',
                  background: transferStockDrawerOpen ? '#E5F2EE' : 'var(--card)',
                  color: transferStockDrawerOpen ? 'var(--g)' : 'inherit',
                  borderColor: transferStockDrawerOpen ? 'var(--g)' : 'var(--line)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{transferStockDrawerOpen ? '◀ Collapse Cards' : '🍱 Slide Open Cards ▶'}</span>
              </button>
            }
            onClose={() => {
              setTransferModal(false);
              setTransferStockDrawerOpen(false);
            }}
          >
            <div className={`workbench-container ${transferStockDrawerOpen ? 'dual' : ''}`}>
              <div className={`workbench-form-pane ${transferStockDrawerOpen ? 'pushed' : ''}`}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Source Location (From):
                    </label>
                    <select
                      className="inp"
                      value={transferForm.fromLoc}
                      onChange={e => setTransferForm({ ...transferForm, fromLoc: e.target.value })}
                    >
                      <option value="Main Store">Main Store / Warehouse</option>
                      <option value="Beverage Store">Beverage Store</option>
                      <option value="Kitchen Prep Station">Kitchen Prep Station</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Destination (To):
                    </label>
                    <select
                      className="inp"
                      value={transferForm.toLoc}
                      onChange={e => setTransferForm({ ...transferForm, toLoc: e.target.value })}
                    >
                      <option value="Kitchen Prep Station">🍳 Kitchen Prep (Cooking BOM)</option>
                      <option value="Bar Station">🍹 Bar Station (Drinks / Retail)</option>
                      <option value="Main Store">📦 Main Store (Return Excess)</option>
                    </select>
                  </div>
                </div>

                {/* Item to Issue / Transfer with Interactive Slide Trigger */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>
                      Item to Issue / Transfer:
                    </label>
                    <button
                      type="button"
                      onClick={() => setTransferStockDrawerOpen(!transferStockDrawerOpen)}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--g)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {transferStockDrawerOpen ? '◀ Close Cards' : '✨ Slide Open Cards ▶'}
                    </button>
                  </div>

                  <div
                    className={`stock-picker-trigger ${transferStockDrawerOpen ? 'active' : ''}`}
                    onClick={() => setTransferStockDrawerOpen(true)}
                    title="Click to slide open the stock cards catalog"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        className="stock-picker-avatar"
                        style={{
                          width: 40,
                          height: 40,
                          fontSize: 22,
                          background: CATEGORY_BG[curStk?.cat] || '#E5F2EE'
                        }}
                      >
                        {CATEGORY_ICONS[curStk?.cat] || '📦'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <b style={{ fontSize: 14, color: 'var(--tx)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {curStk?.name}
                        </b>
                        <small style={{ color: 'var(--mut)', fontSize: 11 }}>
                          Store: <b>{fmtNum(curLocs.storeQty)} {curStk?.uom}</b> · Kitchen: <b>{fmtNum(curLocs.kitchenQty)} {curStk?.uom}</b> · Total: <b>{fmtNum(curStk?.onHand)} {curStk?.uom}</b>
                        </small>
                      </div>
                    </div>

                    <span
                      className="chip"
                      style={{
                        background: transferStockDrawerOpen ? 'var(--g)' : 'rgba(14,90,71,0.1)',
                        color: transferStockDrawerOpen ? '#fff' : 'var(--g)',
                        fontSize: 11,
                        fontWeight: 700,
                        margin: 0
                      }}
                    >
                      {transferStockDrawerOpen ? 'Drawer Open' : 'Change ⇄'}
                    </span>
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <select
                      className="inp"
                      style={{ fontSize: 12, padding: '7px 10px', color: 'var(--mut)' }}
                      value={transferForm.stockId}
                      onChange={e => setTransferForm({ ...transferForm, stockId: e.target.value })}
                    >
                      {(S.stock || []).map(stk => {
                        const l = getItemLocations(stk);
                        return (
                          <option key={stk.id} value={stk.id}>
                            {stk.name} (Store: {fmtNum(l.storeQty)} {stk.uom} | Kitchen: {fmtNum(l.kitchenQty)} {stk.uom})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Transfer Unit pills */}
                {curStk?.purchaseUnits && curStk.purchaseUnits.length > 1 && (
                  <div style={{ marginBottom: 12 }}>
                    <small style={{ fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: 4 }}>
                      Transfer Unit:
                    </small>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {curStk.purchaseUnits.map(u => {
                        const isUnitSel = (transferForm.purchaseUnit || 'Single') === u.name;
                        return (
                          <button
                            type="button"
                            key={u.name}
                            onClick={() => setTransferForm({ ...transferForm, purchaseUnit: u.name, factor: u.factor })}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 10,
                              fontSize: 12.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: isUnitSel ? '2px solid var(--o)' : '1px solid var(--line)',
                              background: isUnitSel ? '#FFE9DD' : 'var(--card)',
                              color: isUnitSel ? 'var(--o)' : 'var(--tx)'
                            }}
                          >
                            {u.name} ({u.factor} {curStk.baseUnit || curStk.uom})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    Transfer Quantity ({transferForm.purchaseUnit || curStk?.uom || 'units'}):
                  </label>
                  <input
                    className="inp"
                    type="number"
                    step="1"
                    min="1"
                    value={transferForm.qty}
                    onChange={e => setTransferForm({ ...transferForm, qty: e.target.value })}
                  />
                  {/* Live Conversion Preview */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--g)', marginTop: 4 }}>
                    = {Math.round((Number(transferForm.qty) || 0) * (transferForm.factor || 1))} {curStk?.baseUnit || curStk?.uom || 'bottles'}
                  </div>
                </div>

                {/* Tracking Rule Notice: Option A vs Option B */}
                {transferForm.toLoc.includes('Kitchen') ? (
                  <div style={{ background: '#E5F2EE', border: '1px solid rgba(14,90,71,0.25)', borderRadius: 10, padding: 10, fontSize: 12, color: 'var(--g)', marginBottom: 12 }}>
                    <b>Option A (Simple Restaurant Accounting):</b> Food ingredients moved to the kitchen are treated as issued and counted in cost upon leaving the store.
                  </div>
                ) : (
                  <div style={{ background: '#FFE9DD', border: '1px solid rgba(255,107,44,0.25)', borderRadius: 10, padding: 10, fontSize: 12, color: '#C2410C', marginBottom: 12 }}>
                    <b>Direct Bar Stocking:</b> Transferred bottles will be placed in the Bar Fridge and deducted automatically on POS drink orders.
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    Transfer Purpose / Reason:
                  </label>
                  <input
                    className="inp"
                    placeholder="e.g. Morning bar fridge restock (Crates to Bar Cooler)"
                    value={transferForm.notes}
                    onChange={e => setTransferForm({ ...transferForm, notes: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn o" style={{ flex: 2, padding: '13px' }} onClick={handleExecuteTransfer}>
                    Execute Stock Transfer Manifest
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    style={{ flex: 1, padding: '13px' }}
                    onClick={() => {
                      setTransferModal(false);
                      setTransferStockDrawerOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {transferStockDrawerOpen && (
                <StockIngredientSlideSelector
                  stock={S.stock || []}
                  selectedId={transferForm.stockId}
                  onSelect={item => setTransferForm({ ...transferForm, stockId: item.id })}
                  onClose={() => setTransferStockDrawerOpen(false)}
                  title="Stock Inventory Items Catalog"
                  subtitle="Click any card below to select the stock item for transfer"
                  itemTypeFilter="all"
                />
              )}
            </div>
          </Sheet>
        );
      })()}

      {/* PURCHASE ORDER CREATION MODAL */}
      {newPOModal && (() => {
        const activeSup = SUPPLIERS.find(s => s.id === selectedSupplierId) || SUPPLIERS[0];
        const existingItem = (S.stock || []).find(s => s.id === selectedStockId);
        const calcTotal = newPOType === 'existing'
          ? (+poQty || 0) * (+poUnitPrice || existingItem?.unitCost || 0)
          : (+poQty || 0) * (+newItemForm.unitPrice || 0);
        const unitMargin = newItemForm.itemType === 'direct_resale' && +newItemForm.sellingPrice > 0
          ? Math.round(((+newItemForm.sellingPrice - (+newItemForm.unitPrice || 0)) / +newItemForm.sellingPrice) * 100)
          : null;
        const unitProfit = newItemForm.itemType === 'direct_resale' && +newItemForm.sellingPrice
          ? +newItemForm.sellingPrice - (+newItemForm.unitPrice || 0)
          : null;

        const isDual = poStockDrawerOpen && newPOType === 'existing';

        return (
          <Sheet
            title="Create Purchase Order (PRC-02)"
            subtitle="Procurement & Vendor Stock Replenishment"
            maxWidth={isDual ? 1160 : 620}
            bodyStyle={{ padding: 0 }}
            extraHeader={
              newPOType === 'existing' && (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => setPoStockDrawerOpen(!poStockDrawerOpen)}
                  style={{
                    fontSize: 12,
                    padding: '5px 11px',
                    background: poStockDrawerOpen ? '#E5F2EE' : 'var(--card)',
                    color: poStockDrawerOpen ? 'var(--g)' : 'inherit',
                    borderColor: poStockDrawerOpen ? 'var(--g)' : 'var(--line)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>{poStockDrawerOpen ? '◀ Collapse Cards' : '🍱 Slide Open Cards ▶'}</span>
                </button>
              )
            }
            onClose={() => {
              setNewPOModal(false);
              setPoStockDrawerOpen(false);
            }}
          >
            <div className={`workbench-container ${isDual ? 'dual' : ''}`}>
              <div className={`workbench-form-pane ${isDual ? 'pushed' : ''}`}>
                {/* Mode Switcher */}
                <div className="seg" style={{ marginBottom: 14 }}>
                  <button
                    type="button"
                    className={newPOType === 'existing' ? 'on' : ''}
                    onClick={() => setNewPOType('existing')}
                  >
                    🔄 Reorder Existing Stock Item
                  </button>
                  <button
                    type="button"
                    className={newPOType === 'new' ? 'on' : ''}
                    onClick={() => {
                      setNewPOType('new');
                      setPoStockDrawerOpen(false);
                    }}
                  >
                    ➕ Add Brand New Item
                  </button>
                </div>

                {/* Supplier Selector with Vendor Details */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    <span>Approved Vendor / Supplier:</span>
                    <span style={{ color: 'var(--g)', fontWeight: 600 }}>★ {activeSup.rating} · Terms: {activeSup.terms}</span>
                  </label>
                  <select
                    className="inp"
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                  >
                    {SUPPLIERS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.terms} · Lead {s.leadDays}d)
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 2 }}>
                    Primary Contact: {activeSup.contact} ({activeSup.phone}) · Guaranteed delivery in {activeSup.leadDays} day(s)
                  </div>
                </div>

                {newPOType === 'existing' ? (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>
                          Select Stock Item to Reorder:
                        </label>
                        <button
                          type="button"
                          onClick={() => setPoStockDrawerOpen(!poStockDrawerOpen)}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--g)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {poStockDrawerOpen ? '◀ Close Cards' : '✨ Slide Open Cards ▶'}
                        </button>
                      </div>

                      {/* Interactive Trigger Card */}
                      <div
                        className={`stock-picker-trigger ${poStockDrawerOpen ? 'active' : ''}`}
                        onClick={() => setPoStockDrawerOpen(true)}
                        title="Click to slide open the stock cards catalog"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div
                            className="stock-picker-avatar"
                            style={{
                              width: 40,
                              height: 40,
                              fontSize: 22,
                              background: CATEGORY_BG[existingItem?.cat] || '#E5F2EE'
                            }}
                          >
                            {CATEGORY_ICONS[existingItem?.cat] || '📦'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <b style={{ fontSize: 14, color: 'var(--tx)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {existingItem?.name}
                            </b>
                            <small style={{ color: 'var(--mut)', fontSize: 11 }}>
                              {existingItem?.cat} · On-Hand: <b>{fmtNum(existingItem?.onHand)} {existingItem?.uom}</b> · PAR: {existingItem?.par} {existingItem?.uom}
                            </small>
                          </div>
                        </div>

                        <span
                          className="chip"
                          style={{
                            background: poStockDrawerOpen ? 'var(--g)' : 'rgba(14,90,71,0.1)',
                            color: poStockDrawerOpen ? '#fff' : 'var(--g)',
                            fontSize: 11,
                            fontWeight: 700,
                            margin: 0
                          }}
                        >
                          {poStockDrawerOpen ? 'Drawer Open' : 'Change ⇄'}
                        </span>
                      </div>

                      <div style={{ marginTop: 6 }}>
                        <select
                          className="inp"
                          style={{ fontSize: 12, padding: '7px 10px', color: 'var(--mut)' }}
                          value={selectedStockId}
                          onChange={e => {
                            setSelectedStockId(e.target.value);
                            const item = (S.stock || []).find(x => x.id === e.target.value);
                            if (item) setPoUnitPrice(item.unitCost);
                          }}
                        >
                          {(S.stock || []).map(stk => (
                            <option key={stk.id} value={stk.id}>
                              {stk.name} ({stk.cat}) · On-hand: {stk.onHand} {stk.uom} (PAR: {stk.par} {stk.uom})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Order Quantity ({existingItem?.uom || 'units'}):
                    </label>
                    <input
                      className="inp"
                      type="number"
                      min="1"
                      value={poQty}
                      onChange={e => setPoQty(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Unit Purchase Price (TSh):
                    </label>
                    <input
                      className="inp"
                      type="number"
                      value={poUnitPrice}
                      onChange={e => setPoUnitPrice(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* New Item Name */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    New Item Name & Specification:
                  </label>
                  <input
                    className="inp"
                    placeholder="e.g. Serengeti Premium Cider 500ml or Whole Goat Trim"
                    value={newItemForm.name}
                    onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  />
                </div>

                {/* Classification Cards: Raw Material vs Direct Resale */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    Item Flow & Purpose:
                  </label>
                  <div className="type-grid">
                    <div
                      className={`type-card ${newItemForm.itemType === 'raw_material' ? 'active' : ''}`}
                      onClick={() => setNewItemForm({ ...newItemForm, itemType: 'raw_material', cat: 'Produce' })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 22 }}>🥩</span>
                        <div>
                          <b style={{ fontSize: 14, color: newItemForm.itemType === 'raw_material' ? 'var(--g)' : 'inherit' }}>
                            Raw Material
                          </b>
                          <div style={{ fontSize: 11, color: 'var(--mut)' }}>Kitchen Cooking / BOM</div>
                        </div>
                      </div>
                      <small style={{ color: 'var(--mut)', fontSize: 11, marginTop: 4 }}>
                        Received into Main Store, transferred to kitchen for cooking. Not sold directly on menu.
                      </small>
                    </div>

                    <div
                      className={`type-card ${newItemForm.itemType === 'direct_resale' ? 'active-orange' : ''}`}
                      onClick={() => setNewItemForm({ ...newItemForm, itemType: 'direct_resale', cat: 'Drinks', sellingPrice: 5000 })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 22 }}>🥤</span>
                        <div>
                          <b style={{ fontSize: 14, color: newItemForm.itemType === 'direct_resale' ? 'var(--o)' : 'inherit' }}>
                            Direct Resale
                          </b>
                          <div style={{ fontSize: 11, color: 'var(--mut)' }}>Retail Dining Good</div>
                        </div>
                      </div>
                      <small style={{ color: 'var(--mut)', fontSize: 11, marginTop: 4 }}>
                        Sold as-is without kitchen cooking (e.g. bottled water, beers, sodas, retail snacks).
                      </small>
                    </div>
                  </div>
                </div>

                {/* Category & UOM */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Inventory Category:
                    </label>
                    <select
                      className="inp"
                      value={newItemForm.cat}
                      onChange={e => setNewItemForm({ ...newItemForm, cat: e.target.value })}
                    >
                      <option value="Produce">🥬 Fresh Produce</option>
                      <option value="Meat">🥩 Prime Meat</option>
                      <option value="Poultry">🍗 Poultry & Eggs</option>
                      <option value="Seafood">🐟 Fresh Seafood</option>
                      <option value="Dairy">🧀 Dairy & Milk</option>
                      <option value="Drinks">🥤 Drinks & Beverages</option>
                      <option value="Dry Goods">🌾 Grains & Dry Goods</option>
                      <option value="Bakery">🥖 Bakery & Pastry</option>
                      <option value="Spices">🌶️ Spices & Seasoning</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Unit of Measure (UOM):
                    </label>
                    <input
                      className="inp"
                      placeholder="e.g. kg, L, bottles, cans"
                      value={newItemForm.uom}
                      onChange={e => setNewItemForm({ ...newItemForm, uom: e.target.value })}
                    />
                  </div>
                </div>

                {/* Quick UOM Pills */}
                <div style={{ marginBottom: 12 }}>
                  <small style={{ color: 'var(--mut)', fontSize: 11 }}>Quick UOM preset:</small>
                  <div className="uom-list">
                    {['kg', 'litres', 'pcs', 'bottles', 'cans', 'boxes', 'pkts'].map(u => (
                      <button
                        type="button"
                        key={u}
                        className={`uom-pill ${newItemForm.uom === u ? 'on' : ''}`}
                        onClick={() => setNewItemForm({ ...newItemForm, uom: u })}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Unit Purchase Cost */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Order Quantity ({newItemForm.uom || 'units'}):
                    </label>
                    <input
                      className="inp"
                      type="number"
                      min="1"
                      value={poQty}
                      onChange={e => setPoQty(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Purchase Unit Cost (TSh):
                    </label>
                    <input
                      className="inp"
                      type="number"
                      min="100"
                      value={newItemForm.unitPrice}
                      onChange={e => setNewItemForm({ ...newItemForm, unitPrice: e.target.value })}
                    />
                  </div>
                </div>

                {/* Direct Resale Selling Price & Margin Preview */}
                {newItemForm.itemType === 'direct_resale' && (
                  <div style={{ background: '#FFF5EB', border: '1px solid #FFD9B3', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <div className="row" style={{ marginBottom: 4 }}>
                      <b style={{ color: 'var(--o)', fontSize: 13 }}>Menu Selling Price (Diner Bill Rate):</b>
                      {unitMargin !== null && (
                        <span className="pill" style={{ background: unitMargin >= 40 ? '#DDF3E4' : '#FFE9DD', color: unitMargin >= 40 ? '#15803D' : '#C2410C' }}>
                          Margin: {unitMargin}% (+{fmt(unitProfit)}/unit)
                        </span>
                      )}
                    </div>
                    <input
                      className="inp"
                      type="number"
                      placeholder="e.g. 5000"
                      value={newItemForm.sellingPrice || ''}
                      onChange={e => setNewItemForm({ ...newItemForm, sellingPrice: e.target.value })}
                    />
                    <small style={{ color: 'var(--mut)', display: 'block', marginTop: 4 }}>
                      ✓ Automatically publishes this item to customer mobile menu and waiter tickets upon PO receipt.
                    </small>
                  </div>
                )}

                {/* Inventory Controls: PAR & Storage Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <small style={{ fontWeight: 600 }}>PAR Level ({newItemForm.uom}):</small>
                    <input
                      className="inp"
                      type="number"
                      value={newItemForm.par}
                      onChange={e => setNewItemForm({ ...newItemForm, par: e.target.value })}
                    />
                  </div>
                  <div>
                    <small style={{ fontWeight: 600 }}>Reorder Alert:</small>
                    <input
                      className="inp"
                      type="number"
                      value={newItemForm.reorder}
                      onChange={e => setNewItemForm({ ...newItemForm, reorder: e.target.value })}
                    />
                  </div>
                  <div>
                    <small style={{ fontWeight: 600 }}>Storage Bin:</small>
                    <input
                      className="inp"
                      value={newItemForm.loc}
                      onChange={e => setNewItemForm({ ...newItemForm, loc: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Live Order Valuation Summary Box */}
            <div className="order-summary-box">
              <div className="row">
                <div>
                  <small style={{ color: 'var(--mut)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Binding Order Valuation
                  </small>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--g)', marginTop: 2 }}>
                    {fmt(calcTotal)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 2 }}>
                    Payable to: <b>{activeSup.name}</b> ({activeSup.terms})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="chip" style={{ background: '#E5F2EE', color: 'var(--g)', fontWeight: 700, margin: 0 }}>
                    {poQty || 0} {newPOType === 'existing' ? existingItem?.uom : newItemForm.uom} @ {fmt(newPOType === 'existing' ? poUnitPrice : newItemForm.unitPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="btn o"
                style={{ flex: 2, padding: '14px', fontSize: 15 }}
                onClick={handleCreatePO}
              >
                Submit Purchase Order · {fmt(calcTotal)}
              </button>
              <button
                type="button"
                className="btn ghost"
                style={{ flex: 1, padding: '14px' }}
                onClick={() => {
                  setNewPOModal(false);
                  setPoStockDrawerOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Slide-way Card Drawer (Stock Items) */}
          {isDual && (
            <StockIngredientSlideSelector
              stock={S.stock || []}
              selectedId={selectedStockId}
              onSelect={item => {
                setSelectedStockId(item.id);
                setPoUnitPrice(item.unitCost);
              }}
              onClose={() => setPoStockDrawerOpen(false)}
              title="Select Stock Item to Reorder"
              subtitle="Click any card below to load item details into the Purchase Order on the left"
              itemTypeFilter="all"
            />
          )}
        </div>
      </Sheet>
    );
  })()}

      {/* RECEIVING GOODS HACCP SHEET */}
      {receivingPO && (
        <Sheet
          title={`Receive Delivery: ${receivingPO.id}`}
          subtitle={`Goods Inspection & Cold Chain HACCP Verification`}
          maxWidth={560}
          onClose={() => setReceivingPO(null)}
        >
          <div className="row" style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
            <span>Delivering Vendor:</span>
            <b>{receivingPO.supplierName}</b>
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, margin: '8px 0 4px' }}>Physical Shipment Manifest:</p>
          <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--line)', padding: '6px 12px', marginBottom: 14 }}>
            {receivingPO.items.map((it, idx) => (
              <div key={idx} className="row" style={{ padding: '8px 0', borderBottom: idx < receivingPO.items.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span><b>{it.qty} {it.uom}</b> {it.name}</span>
                <b style={{ color: 'var(--g)' }}>{fmt(it.qty * it.unitPrice)}</b>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Cold Chain Core Temperature Log (°C) (SRS QSC-01 HACCP):
            </label>
            <input
              className="inp"
              placeholder="e.g. 2.8°C (Meat/Poultry must be 0°C to 4°C)"
              value={receivingTemp}
              onChange={e => setReceivingTemp(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {['2.4°C', '3.1°C', '3.5°C', '4.0°C'].map(t => (
                <button
                  type="button"
                  key={t}
                  className={`uom-pill ${receivingTemp === t ? 'on' : ''}`}
                  onClick={() => setReceivingTemp(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button className="btn o" onClick={() => handleReceivePO(receivingPO.id)}>
            Confirm Inspection & Post to Store Inventory
          </button>
        </Sheet>
      )}

      {/* INVOICE SETTLEMENT SHEET (3-WAY MATCH) */}
      {settlingPO && (
        <Sheet
          title={`Settle Supplier Invoice: ${settlingPO.id}`}
          subtitle={`3-Way Match Verification (PO · Goods Receipt · Vendor Invoice)`}
          maxWidth={540}
          onClose={() => setSettlingPO(null)}
        >
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div className="row" style={{ marginBottom: 6 }}>
              <span>Supplier / Beneficiary:</span>
              <b>{settlingPO.supplierName}</b>
            </div>
            <div className="row" style={{ marginBottom: 6 }}>
              <span>HACCP Temp Verified:</span>
              <span className="chip" style={{ background: '#E0EDFE', color: '#007AFF', margin: 0 }}>
                🌡️ {settlingPO.tempLog || '3.2°C'}
              </span>
            </div>
            <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: 8, marginTop: 4 }}>
              <span>Total Approved Invoice Due:</span>
              <b style={{ color: 'var(--g)', fontSize: 20 }}>{fmt(settlingPO.total)}</b>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Disbursement Payment Method:
            </label>
            <select
              className="inp"
              value={settleMethod}
              onChange={e => setSettleMethod(e.target.value)}
            >
              <option value="bank">CRDB Bank Commercial Wire Transfer</option>
              <option value="cash">Petty Cash Register Drawer Outflow</option>
              <option value="momo">M-Pesa / Tigo Pesa Commercial Till</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Bank Wire / Check / Voucher Reference:
            </label>
            <input
              className="inp"
              placeholder="e.g. CRDB-WIRE-99412 or CHQ-771"
              value={settleRef}
              onChange={e => setSettleRef(e.target.value)}
            />
          </div>

          <button className="btn o" onClick={handleSettlePO}>
            Confirm 3-Way Match & Post Outflow ({fmt(settlingPO.total)})
          </button>
        </Sheet>
      )}

      {/* RFQ CREATION SHEET WITH DUAL-PANEL SLIDE WORKBENCH */}
      {newRFQModal && (() => {
        const curRfqStk = (S.stock || []).find(s => s.id === rfqStockId) || S.stock?.[0];
        const rfqUom = curRfqStk?.uom || 'kg';
        const estValue = (+rfqQty || 0) * (curRfqStk?.unitCost || 0);

        return (
          <Sheet
            title="Issue Request for Quotation (RFQ)"
            subtitle="Solicit competitive bids from approved vendors (SRS PRC-01)"
            maxWidth={rfqStockDrawerOpen ? 1160 : 560}
            bodyStyle={{ padding: 0 }}
            extraHeader={
              <button
                type="button"
                className="action-btn"
                onClick={() => setRfqStockDrawerOpen(!rfqStockDrawerOpen)}
                style={{
                  fontSize: 12,
                  padding: '5px 11px',
                  background: rfqStockDrawerOpen ? '#E5F2EE' : 'var(--card)',
                  color: rfqStockDrawerOpen ? 'var(--g)' : 'inherit',
                  borderColor: rfqStockDrawerOpen ? 'var(--g)' : 'var(--line)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{rfqStockDrawerOpen ? '◀ Collapse Cards' : '🍱 Slide Open Cards ▶'}</span>
              </button>
            }
            onClose={() => {
              setNewRFQModal(false);
              setRfqStockDrawerOpen(false);
            }}
          >
            <div className={`workbench-container ${rfqStockDrawerOpen ? 'dual' : ''}`}>
              {/* Form Pane (Pushed to the left-side when drawer is active) */}
              <div className={`workbench-form-pane ${rfqStockDrawerOpen ? 'pushed' : ''}`}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    Tender RFQ Title:
                  </label>
                  <input
                    className="inp"
                    placeholder="e.g. Bi-Weekly Fresh Poultry Supply (Masaki Site)"
                    value={rfqTitle}
                    onChange={e => setRfqTitle(e.target.value)}
                  />
                </div>

                {/* Required Stock Ingredient: Interactive trigger & visual card */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Required Stock Ingredient:</span>
                      <span style={{ fontSize: 10, background: '#E5F2EE', color: 'var(--g)', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>
                        BOM Link
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setRfqStockDrawerOpen(!rfqStockDrawerOpen)}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--g)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {rfqStockDrawerOpen ? '◀ Close Cards' : '✨ Slide Open Item Cards ▶'}
                    </button>
                  </div>

                  {/* Attractive Interactive Trigger Card */}
                  <div
                    className={`stock-picker-trigger ${rfqStockDrawerOpen ? 'active' : ''}`}
                    onClick={() => setRfqStockDrawerOpen(true)}
                    title="Click to slide open the ingredients catalog"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        className="stock-picker-avatar"
                        style={{
                          width: 40,
                          height: 40,
                          fontSize: 22,
                          background: CATEGORY_BG[curRfqStk?.cat] || '#E5F2EE'
                        }}
                      >
                        {CATEGORY_ICONS[curRfqStk?.cat] || '📦'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <b style={{ fontSize: 14, color: 'var(--tx)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {curRfqStk?.name || 'Select an ingredient...'}
                        </b>
                        <small style={{ color: 'var(--mut)', fontSize: 11, display: 'block', marginTop: 1 }}>
                          {curRfqStk?.cat} · In Stock: <b>{fmtNum(curRfqStk?.onHand)} {rfqUom}</b> · Est. Cost: {fmt(curRfqStk?.unitCost)}/{rfqUom}
                        </small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span
                        className="chip"
                        style={{
                          background: rfqStockDrawerOpen ? 'var(--g)' : 'rgba(14,90,71,0.1)',
                          color: rfqStockDrawerOpen ? '#fff' : 'var(--g)',
                          fontSize: 11,
                          fontWeight: 700,
                          margin: 0
                        }}
                      >
                        {rfqStockDrawerOpen ? 'Drawer Active ⇄' : 'Choose Item ⇄'}
                      </span>
                    </div>
                  </div>

                  {/* Keyboard accessible quick dropdown */}
                  <div style={{ marginTop: 6 }}>
                    <select
                      className="inp"
                      style={{ fontSize: 12, padding: '7px 10px', color: 'var(--mut)' }}
                      value={rfqStockId}
                      onChange={e => {
                        setRfqStockId(e.target.value);
                        const s = (S.stock || []).find(x => x.id === e.target.value);
                        if (s && (!rfqTitle || rfqTitle.startsWith('Tender RFQ for'))) {
                          setRfqTitle(`Tender RFQ for ${s.name}`);
                        }
                      }}
                    >
                      {(S.stock || []).map(stk => (
                        <option key={stk.id} value={stk.id}>
                          {stk.name} ({stk.cat}) · Stock: {stk.onHand} {stk.uom} · {fmt(stk.unitCost)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Target Tender Quantity ({rfqUom}):
                    </label>
                    <input
                      className="inp"
                      type="number"
                      min="1"
                      value={rfqQty}
                      onChange={e => setRfqQty(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                      Target Delivery Window:
                    </label>
                    <select className="inp" defaultValue="within_48h">
                      <option value="immediate">Immediate (24 hrs)</option>
                      <option value="within_48h">Standard (48 hrs)</option>
                      <option value="scheduled">Weekly Batch Contract</option>
                    </select>
                  </div>
                </div>

                {/* Live Value Estimate */}
                <div style={{ background: '#F8F9FA', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
                  <div className="row" style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--mut)' }}>Estimated Tender Benchmark Value:</span>
                    <b style={{ color: 'var(--g)', fontSize: 15 }}>{fmt(estValue)}</b>
                  </div>
                  <small style={{ color: 'var(--mut)', fontSize: 11, display: 'block', marginTop: 2 }}>
                    Calculated from current reference cost ({fmt(curRfqStk?.unitCost || 0)} / {rfqUom})
                  </small>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    Quality Criteria & Tender Specifications:
                  </label>
                  <textarea
                    className="inp"
                    rows={3}
                    style={{ resize: 'vertical' }}
                    placeholder="e.g. Must hold certified veterinary health certificate, chilled delivery < 4°C, and vacuum-sealed HACCP packaging."
                    value={rfqNotes}
                    onChange={e => setRfqNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn o" style={{ flex: 2, padding: '13px' }} onClick={handleCreateRFQ}>
                    Publish Tender to Approved Vendors
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    style={{ flex: 1, padding: '13px' }}
                    onClick={() => {
                      setNewRFQModal(false);
                      setRfqStockDrawerOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Slide-way Card Drawer (Item Cards) */}
              {rfqStockDrawerOpen && (
                <StockIngredientSlideSelector
                  stock={rawStock}
                  selectedId={rfqStockId}
                  onSelect={item => {
                    setRfqStockId(item.id);
                    if (!rfqTitle || rfqTitle.startsWith('Tender RFQ for') || rfqTitle.startsWith('Tender RFQ:')) {
                      setRfqTitle(`Tender RFQ: ${item.name} Supply`);
                    }
                  }}
                  onClose={() => setRfqStockDrawerOpen(false)}
                  title="Required Stock Ingredient Catalog"
                  subtitle="Click any card below to instantly bind to the active tender form on the left"
                  itemTypeFilter="raw_material"
                />
              )}
            </div>
          </Sheet>
        );
      })()}

      {/* ADD BID SHEET */}
      {biddingRFQ && (
        <Sheet
          title={`Record Supplier Quotation: ${biddingRFQ.id}`}
          subtitle={`Log tender bid received from vendor`}
          maxWidth={520}
          onClose={() => setBiddingRFQ(null)}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Bidding Vendor:
            </label>
            <select
              className="inp"
              value={bidForm.supplierId}
              onChange={e => setBidForm({ ...bidForm, supplierId: e.target.value })}
            >
              {SUPPLIERS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.terms})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Quoted Total Amount (TSh):
            </label>
            <input
              className="inp"
              type="number"
              min="1000"
              value={bidForm.quoteAmount}
              onChange={e => setBidForm({ ...bidForm, quoteAmount: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Guaranteed Delivery Lead Time (Days):
            </label>
            <input
              className="inp"
              type="number"
              min="1"
              value={bidForm.leadDays}
              onChange={e => setBidForm({ ...bidForm, leadDays: e.target.value })}
            />
          </div>

          <button className="btn o" onClick={handleAddBid}>
            Save Vendor Quotation
          </button>
        </Sheet>
      )}

      {/* WASTE LOGGING SHEET */}
      {wasteModal && (
        <Sheet
          title="Log Waste & Spoilage Incident (INV-08)"
          subtitle="Audit-trailed write-off against on-hand inventory"
          maxWidth={540}
          onClose={() => setWasteModal(false)}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Affected Stock Item:
            </label>
            <select
              className="inp"
              value={wasteForm.stockId}
              onChange={e => {
                const s = (S.stock || []).find(x => x.id === e.target.value);
                setWasteForm({ ...wasteForm, stockId: e.target.value, uom: s?.uom || 'kg' });
              }}
            >
              {(S.stock || []).map(stk => (
                <option key={stk.id} value={stk.id}>
                  {stk.name} ({stk.cat}) · On-Hand: {stk.onHand} {stk.uom}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Quantity Wasted ({wasteForm.uom}):
            </label>
            <input
              className="inp"
              type="number"
              step="0.1"
              min="0.1"
              value={wasteForm.qty}
              onChange={e => setWasteForm({ ...wasteForm, qty: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              Reason Code / Spoilage Cause:
            </label>
            <select
              className="inp"
              value={wasteForm.reason}
              onChange={e => setWasteForm({ ...wasteForm, reason: e.target.value })}
            >
              <option value="Trimming loss / prep trim">Trimming loss / prep trim</option>
              <option value="Overcooked / burned on grill">Overcooked / burned on grill</option>
              <option value="Cold chain breakdown / sour">Cold chain breakdown / sour</option>
              <option value="Expired past shelf life">Expired past shelf life</option>
              <option value="Dropped / container damaged">Dropped / container damaged</option>
            </select>
          </div>

          <button className="btn o" onClick={handleLogWasteSubmit}>
            Record Spoilage to Audit Log
          </button>
        </Sheet>
      )}

      {/* TRANSFER MANIFEST SHEET */}
      {viewTransferManifest && (
        <Sheet
          title={`Transfer Manifest: ${viewTransferManifest.id}`}
          subtitle={`Physical Inventory Custody Transfer`}
          maxWidth={540}
          onClose={() => setViewTransferManifest(null)}
        >
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div className="row" style={{ marginBottom: 6 }}>
              <span>Manifest Date:</span>
              <b>{fmtDateTime(viewTransferManifest.t)}</b>
            </div>
            <div className="row" style={{ marginBottom: 6 }}>
              <span>Source (From):</span>
              <span className="chip" style={{ margin: 0 }}>{viewTransferManifest.fromLoc}</span>
            </div>
            <div className="row">
              <span>Destination (To):</span>
              <b style={{ color: 'var(--g)' }}>{viewTransferManifest.toLoc}</b>
            </div>
          </div>

          <p style={{ fontWeight: 700, fontSize: 13, margin: '8px 0 6px' }}>Transferred Goods Manifest:</p>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '6px 12px', marginBottom: 14 }}>
            {(viewTransferManifest.items || []).map((it, idx) => (
              <div key={idx} className="row" style={{ padding: '8px 0', borderBottom: idx < viewTransferManifest.items.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span>{it.name}</span>
                <b style={{ color: 'var(--g)' }}>{it.qty} {it.uom}</b>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12.5, color: 'var(--mut)', lineHeight: 1.6 }}>
            <div>Dispatched by: <b>{viewTransferManifest.transferredBy}</b></div>
            <div>Accepted at station: <b>{viewTransferManifest.acceptedBy}</b></div>
            <div>Notes: {viewTransferManifest.notes}</div>
          </div>
        </Sheet>
      )}

      {/* VIEW PO SHEET */}
      {viewPOModal && (
        <Sheet
          title={`Purchase Order: ${viewPOModal.id}`}
          subtitle={`Procurement Voucher · ${viewPOModal.supplierName}`}
          maxWidth={560}
          onClose={() => setViewPOModal(null)}
        >
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div className="row" style={{ marginBottom: 6 }}>
              <span>Supplier:</span>
              <b>{viewPOModal.supplierName}</b>
            </div>
            <div className="row" style={{ marginBottom: 6 }}>
              <span>PO Status:</span>
              <span className="pill" style={{ background: '#E5F2EE', color: 'var(--g)' }}>
                {viewPOModal.status.toUpperCase()}
              </span>
            </div>
            <div className="row">
              <span>Order Issued Date:</span>
              <small>{fmtDateTime(viewPOModal.createdAt)}</small>
            </div>
          </div>

          <p style={{ fontWeight: 700, fontSize: 13, margin: '8px 0 6px' }}>Procured Items:</p>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '6px 12px', marginBottom: 14 }}>
            {(viewPOModal.items || []).map((it, i) => (
              <div key={i} className="row" style={{ padding: '8px 0', borderBottom: i < viewPOModal.items.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span>{it.qty} {it.uom} {it.name}</span>
                <b style={{ color: 'var(--g)' }}>{fmt(it.qty * it.unitPrice)}</b>
              </div>
            ))}
          </div>

          <div className="row" style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
            <b style={{ fontSize: 15 }}>Total PO Amount:</b>
            <b style={{ fontSize: 20, color: 'var(--g)' }}>{fmt(viewPOModal.total)}</b>
          </div>
        </Sheet>
      )}

      {/* FAST DRINKS PURCHASING MODAL (Design Requirements 1 & 2) */}
      <FastDrinkPurchaseModal
        isOpen={fastPurchaseModal}
        onClose={() => setFastPurchaseModal(false)}
        onSave={(data) => A.fastPurchase(data, sess?.name || 'Storekeeper')}
        stockList={S.stock || []}
        suppliers={S.suppliers || SUPPLIERS}
      />

      {/* FAST ITEM SETUP SPREADSHEET GRID & PRESETS MODAL (Design Requirement 5) */}
      <FastRegistryModal
        isOpen={fastRegistryModal}
        onClose={() => setFastRegistryModal(false)}
        onBatchSave={(items) => A.batchAddStockItems(items, sess?.name || 'Storekeeper')}
        stockList={S.stock || []}
      />

      {/* MANAGER REVIEW DRAWER FOR ON-SITE QUICK ADDED ITEMS (Design Requirement 6) */}
      <ManagerReviewModal
        isOpen={managerReviewModal}
        onClose={() => setManagerReviewModal(false)}
        unreviewedItems={unreviewedItems}
        stockList={S.stock || []}
        onApproveItem={(menuId, data) => A.reviewMenuItem(menuId, data, sess?.name || 'Manager')}
      />

      {/* STOCK ADJUSTMENTS SHEET: Breakage, Expiry, Complimentary, Spoilage (Design Requirement 7) */}
      {adjustmentModal && (() => {
        const adjItem = (S.stock || []).find(s => s.id === adjustmentForm.stockId);
        const delta = Number(adjustmentForm.deltaQty) || 0;
        const estLoss = Math.round(delta * (adjItem?.unitCost || 1000));

        return (
          <Sheet
            title="Stock Count & Loss Adjustment"
            subtitle="Document non-sale reductions (Breakage, Expiry, Complimentary, Spoilage)"
            maxWidth={520}
            onClose={() => setAdjustmentModal(false)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Item to Adjust:
                </label>
                <select
                  className="inp"
                  value={adjustmentForm.stockId}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, stockId: e.target.value })}
                >
                  {(S.stock || []).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.cat}) · On Hand: {s.onHand} {s.baseUnit || s.uom} · Cost: {fmt(s.unitCost)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Location:
                  </label>
                  <select
                    className="inp"
                    value={adjustmentForm.location}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, location: e.target.value })}
                  >
                    <option value="Bar Fridge">Bar Fridge / Station</option>
                    <option value="Main Store">Main Store / Warehouse</option>
                    <option value="Kitchen">Kitchen Prep Area</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Quantity ({adjItem?.baseUnit || adjItem?.uom || 'units'}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="inp"
                    value={adjustmentForm.deltaQty}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, deltaQty: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Adjustment Reason:
                </label>
                <select
                  className="inp"
                  value={adjustmentForm.reason}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                >
                  <option value="Breakage (dropped bottle / shattered glass)">Breakage (dropped bottle / glass)</option>
                  <option value="Expiry (best before exceeded)">Expiry (expired stock)</option>
                  <option value="Complimentary (VIP / Manager tasting)">Complimentary (VIP / promo / tasting)</option>
                  <option value="Spoilage / Cold Chain Failure">Spoilage / fridge malfunction</option>
                  <option value="Physical Count Discrepancy">Discrepancy (missing in count)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Incident Notes:
                </label>
                <input
                  type="text"
                  className="inp"
                  placeholder="e.g. Broken during Friday night bar rush by floor team"
                  value={adjustmentForm.notes}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                />
              </div>

              <div style={{ background: '#FFE0DE', border: '1px solid #FFCDD2', borderRadius: 12, padding: 12, color: '#C62828' }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Financial Write-off Impact:</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>
                  -{fmt(estLoss)}
                </div>
                <small style={{ color: '#B71C1C' }}>
                  Deducts {delta} {adjItem?.baseUnit || 'units'} from {adjustmentForm.location} stock and writes off cost to audit log.
                </small>
              </div>

              <button
                type="button"
                className="btn o sm"
                onClick={() => {
                  A.recordStockAdjustment({
                    stockId: adjustmentForm.stockId,
                    location: adjustmentForm.location,
                    deltaQty: Number(adjustmentForm.deltaQty) || 1,
                    reason: adjustmentForm.reason,
                    notes: adjustmentForm.notes
                  }, sess?.name || 'Storekeeper');
                  setAdjustmentModal(false);
                }}
              >
                Confirm Stock Write-Off
              </button>
            </div>
          </Sheet>
        );
      })()}

      <Tabs
        cur={tab}
        set={setTab}
        tabs={[
          ['stock', 'Raw Stock', '📦', 0],
          ['retail', 'Direct Resale', '🥤', 0],
          ['finished', 'Finished Goods', '🍱', (S.finishedGoods || []).filter(fg => fg.onHand < fg.reorder).length],
          ['transfers', 'Transfers', '⇄', 0],
          ['receiving', 'Receiving', '📥', (S.purchaseOrders || []).filter(p => p.status !== 'received').length],
          ['procurement', 'Suppliers', '🤝', 0],
          ['waste', 'Waste Log', '🗑️', 0]
        ]}
      />
    </div>
  );
}

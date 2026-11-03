import React, { useState } from 'react';
import { fmt, fmtNum, SUPPLIERS, CATEGORY_PRESETS } from '../data';

/* ── 1. Fast Drink Purchase Modal ── */
export function FastDrinkPurchaseModal({ isOpen, onClose, onSave, stockList = [], suppliers = SUPPLIERS }) {
  if (!isOpen) return null;

  const drinkItems = stockList.filter(s => s.cat === 'Drinks' || s.itemType === 'direct_resale');
  const availableItems = drinkItems.length ? drinkItems : stockList;

  const [selectedStockId, setSelectedStockId] = useState(availableItems[0]?.id || 'stk_soda');
  const selectedItem = stockList.find(s => s.id === selectedStockId) || availableItems[0];

  const [supplierId, setSupplierId] = useState(
    selectedItem?.supplierId || suppliers.find(s => s.cats?.includes('Drinks'))?.id || suppliers[0]?.id || 'sup_coca'
  );

  const purchaseUnits = selectedItem?.purchaseUnits && selectedItem.purchaseUnits.length
    ? selectedItem.purchaseUnits
    : [
        { name: 'Single', factor: 1 },
        { name: 'Crate', factor: 24 }
      ];

  const defaultUnitName = selectedItem?.lastPurchaseUnit || selectedItem?.defaultPurchaseUnit || purchaseUnits[purchaseUnits.length - 1]?.name || 'Crate';
  const [selectedUnit, setSelectedUnit] = useState(defaultUnitName);

  const currentUnitObj = purchaseUnits.find(u => u.name === selectedUnit) || purchaseUnits[0] || { name: 'Single', factor: 1 };
  const factor = currentUnitObj.factor || 1;

  const [qty, setQty] = useState('5');
  const [unitPrice, setUnitPrice] = useState(
    selectedItem?.lastPurchasePrice ? String(Math.round(selectedItem.lastPurchasePrice / (selectedItem.lastPurchaseQty || 1))) : String((selectedItem?.unitCost || 1000) * factor)
  );

  const [returnableCrates, setReturnableCrates] = useState(selectedItem?.returnable ? '5' : '0');
  const [cratesReturnedNow, setCratesReturnedNow] = useState('0');
  const [notes, setNotes] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Calculations
  const numericQty = Number(qty) || 0;
  const numericPrice = Number(unitPrice) || 0;
  const totalBaseUnits = Math.round(numericQty * factor);
  const totalCost = Math.round(numericQty * numericPrice);
  const costPerBaseUnit = totalBaseUnits > 0 ? Math.round(totalCost / totalBaseUnits) : 0;

  const handleItemSelect = (item) => {
    setSelectedStockId(item.id);
    if (item.supplierId) setSupplierId(item.supplierId);
    const uList = item.purchaseUnits && item.purchaseUnits.length ? item.purchaseUnits : [{ name: 'Single', factor: 1 }, { name: 'Crate', factor: 24 }];
    const unitName = item.lastPurchaseUnit || item.defaultPurchaseUnit || uList[uList.length - 1]?.name || 'Crate';
    setSelectedUnit(unitName);
    const uObj = uList.find(u => u.name === unitName) || uList[0];
    const uFactor = uObj.factor || 1;
    setUnitPrice(String((item.unitCost || 1000) * uFactor));
    if (item.returnable) {
      setReturnableCrates(qty || '5');
    } else {
      setReturnableCrates('0');
    }
  };

  const handleUnitSelect = (uName) => {
    setSelectedUnit(uName);
    const uObj = purchaseUnits.find(u => u.name === uName) || { factor: 1 };
    const baseCost = selectedItem?.unitCost || 1000;
    setUnitPrice(String(Math.round(baseCost * (uObj.factor || 1))));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem || numericQty <= 0) return;
    onSave({
      supplierId,
      stockId: selectedItem.id,
      purchaseUnit: selectedUnit,
      factor,
      purchaseQty: numericQty,
      unitPrice: numericPrice,
      totalCost,
      returnableCrates: Number(returnableCrates) || 0,
      cratesReturnedNow: Number(cratesReturnedNow) || 0,
      notes: notes || `Fast Purchase: ${numericQty} ${selectedUnit} of ${selectedItem.name}`
    });
    onClose();
  };

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (item.cat || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="ov" onClick={onClose}>
      <div className="sh" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #093B2F, #0E5A47)', color: '#fff' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <h3 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}>Fast Drink Purchase</h3>
            </div>
            <small style={{ color: '#cfe8df', fontSize: 12 }}>
              One base unit · Multi-unit conversion · Moving average cost · Direct into Main Store
            </small>
          </div>
          <button className="modal-close-btn" style={{ color: '#fff', background: 'rgba(255,255,255,0.2)' }} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Step 1: Supplier */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: 4 }}>
              1. Choose Supplier:
            </label>
            <select
              className="inp"
              style={{ margin: 0 }}
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.terms || 'Net 15'}) {s.returnableSupported ? '· 🍾 Empty Crates Accepted' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select or Search Item */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>
                2. Select Item (Quick Pick or Search):
              </label>
              <span style={{ fontSize: 11, color: 'var(--mut)' }}>
                Base unit: <b>{selectedItem?.baseUnit || selectedItem?.uom || 'bottle'}</b>
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input
                type="text"
                className="inp"
                placeholder="🔍 Search drinks (Coke, Safari, Water, Wine...)"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ margin: 0, padding: '8px 12px', fontSize: 13 }}
              />
            </div>

            {/* Quick Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              {filteredItems.slice(0, 8).map(item => {
                const isSelected = item.id === selectedStockId;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      border: isSelected ? '2px solid var(--g)' : '1px solid var(--line)',
                      background: isSelected ? '#E5F2EE' : 'var(--card)',
                      color: isSelected ? 'var(--g)' : 'var(--tx)',
                      cursor: 'pointer'
                    }}
                  >
                    {item.name.replace(' (Coke/Fanta/Sprite)', '').replace(' Mineral Water 500ml', '')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Purchase Unit Pill Switcher (Design: Pre-selected with one-tap switch) */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>
                3. Purchase Unit (One-Tap Switch):
              </label>
              <span style={{ fontSize: 11.5, color: 'var(--mut)' }}>
                1 {selectedUnit} = <b>{factor} {selectedItem?.baseUnit || 'bottles'}</b>
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {purchaseUnits.map(u => {
                const isUnitSelected = u.name === selectedUnit;
                return (
                  <button
                    type="button"
                    key={u.name}
                    onClick={() => handleUnitSelect(u.name)}
                    style={{
                      flex: '1 1 80px',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: isUnitSelected ? '2px solid var(--o)' : '1px solid var(--line)',
                      background: isUnitSelected ? '#FFE9DD' : 'var(--bg)',
                      color: isUnitSelected ? 'var(--o)' : 'var(--tx)',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <span>{u.name}</span>
                    <small style={{ fontSize: 11, fontWeight: 500, color: isUnitSelected ? 'var(--o)' : 'var(--mut)' }}>
                      {u.factor} {selectedItem?.baseUnit || 'bottles'}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Quantity & Unit Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: 4 }}>
                Quantity ({selectedUnit}s):
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className="inp"
                style={{ margin: 0, fontSize: 18, fontWeight: 700 }}
                value={qty}
                onChange={e => {
                  const val = e.target.value;
                  setQty(val);
                  if (selectedItem?.returnable) setReturnableCrates(val);
                }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: 4 }}>
                Price per {selectedUnit} (TSh):
              </label>
              <input
                type="number"
                min="0"
                step="100"
                className="inp"
                style={{ margin: 0, fontSize: 18, fontWeight: 700 }}
                value={unitPrice}
                onChange={e => setUnitPrice(e.target.value)}
                required
              />
            </div>
          </div>

          {/* LIVE CONVERSION CALLOUT (Design Requirement 2: System shows "= 120 bottles" immediately) */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(14,90,71,0.08), rgba(255,107,44,0.08))',
              border: '2px solid rgba(14,90,71,0.25)',
              borderRadius: 14,
              padding: '14px 16px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--mut)', fontWeight: 700 }}>
              Live Conversion Preview
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--g)', margin: '4px 0' }}>
              = {totalBaseUnits.toLocaleString()} {selectedItem?.baseUnit || 'bottles'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--tx)' }}>
              Total: <b>{fmt(totalCost)}</b> &nbsp;·&nbsp; Unit Cost: <b>{fmt(costPerBaseUnit)} / {selectedItem?.baseUnit || 'bottle'}</b>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--mut)', marginTop: 4 }}>
              Current Main Store stock: {selectedItem?.storeQty || 0} → Will become{' '}
              <b>{((selectedItem?.storeQty || 0) + totalBaseUnits).toLocaleString()} {selectedItem?.baseUnit || 'bottles'}</b>
            </div>
          </div>

          {/* Step 5: Returnable Crates & Empty Bottles (Design Requirement 7) */}
          {selectedItem?.returnable && (
            <div style={{ background: '#FFF9ED', border: '1px solid #FFE2A8', borderRadius: 12, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span>🍾</span>
                <b style={{ fontSize: 13, color: '#B45309' }}>Returnable Glass Crates &amp; Empty Bottles:</b>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, color: '#92400E', display: 'block', marginBottom: 2 }}>
                    Crates Received (Owed):
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="inp"
                    style={{ margin: 0, padding: '7px 10px', fontSize: 14 }}
                    value={returnableCrates}
                    onChange={e => setReturnableCrates(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, color: '#92400E', display: 'block', marginBottom: 2 }}>
                    Empty Crates Returned Now:
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="inp"
                    style={{ margin: 0, padding: '7px 10px', fontSize: 14 }}
                    value={cratesReturnedNow}
                    onChange={e => setCratesReturnedNow(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className="btn ghost sm"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn o sm"
              style={{ flex: 2, padding: '12px 18px', fontSize: 15 }}
            >
              ⚡ Receive {totalBaseUnits} {selectedItem?.baseUnit || 'Bottles'} into Main Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── 2. Fast Item Setup (Spreadsheet Grid + Presets + Duplicate + CSV Import) ── */
export function FastRegistryModal({ isOpen, onClose, onBatchSave, stockList = [] }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('grid'); // 'grid' | 'preset' | 'csv'
  const [selectedPresetKey, setSelectedPresetKey] = useState('soda');

  // Spreadsheet Rows
  const [rows, setRows] = useState([
    { name: 'Coke 500ml', preset: 'soda', baseUnit: 'bottle', purchaseUnit: 'Crate', factor: 24, cost: 24000, sellingPrice: 2000, initialCrates: 5 },
    { name: 'Fanta Orange 500ml', preset: 'soda', baseUnit: 'bottle', purchaseUnit: 'Crate', factor: 24, cost: 24000, sellingPrice: 2000, initialCrates: 4 },
    { name: 'Sprite 500ml', preset: 'soda', baseUnit: 'bottle', purchaseUnit: 'Crate', factor: 24, cost: 24000, sellingPrice: 2000, initialCrates: 3 },
    { name: 'Safari Lager 500ml', preset: 'beer', baseUnit: 'bottle', purchaseUnit: 'Crate', factor: 20, cost: 50000, sellingPrice: 5000, initialCrates: 4 },
    { name: 'Kilimanjaro Water 500ml', preset: 'water', baseUnit: 'bottle', purchaseUnit: 'Carton', factor: 12, cost: 9600, sellingPrice: 2000, initialCrates: 10 }
  ]);

  // Single Item from Preset Form
  const currentPreset = CATEGORY_PRESETS[selectedPresetKey] || CATEGORY_PRESETS.soda;
  const [presetForm, setPresetForm] = useState({
    name: 'Stoney Tangawizi 500ml',
    size: '500ml',
    purchasePrice: '24000',
    sellingPrice: '2000',
    initialCrates: '5'
  });

  // CSV Import State
  const [csvText, setCsvText] = useState(
`Name,Category,BaseUnit,PurchaseUnit,PackSize,CrateCost,SellingPrice,InitialCrates
Pepsi 500ml,Drinks,bottle,Crate,24,24000,2000,5
Mirinda Orange 500ml,Drinks,bottle,Crate,24,24000,2000,4
7Up 500ml,Drinks,bottle,Crate,24,24000,2000,3
Serengeti Lite 500ml,Drinks,bottle,Crate,20,50000,5000,4
Uhuru Peak Mineral Water 500ml,Drinks,bottle,Carton,12,9600,2000,8`
  );

  const addGridRow = () => {
    setRows(prev => [
      ...prev,
      { name: '', preset: 'soda', baseUnit: 'bottle', purchaseUnit: 'Crate', factor: 24, cost: 24000, sellingPrice: 2000, initialCrates: 2 }
    ]);
  };

  const updateGridRow = (index, field, value) => {
    setRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      if (field === 'preset') {
        const p = CATEGORY_PRESETS[value];
        if (p) {
          copy[index].baseUnit = p.baseUnit;
          copy[index].purchaseUnit = p.defaultPurchaseUnit;
          copy[index].factor = p.purchaseUnits?.[1]?.factor || 24;
          copy[index].cost = (p.sampleCost || 1000) * copy[index].factor;
          copy[index].sellingPrice = p.sampleSellingPrice || 2000;
        }
      }
      return copy;
    });
  };

  const removeGridRow = (index) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveGrid = () => {
    const validRows = rows.filter(r => r.name.trim().length > 0);
    if (!validRows.length) return;

    const formattedItems = validRows.map(r => {
      const p = CATEGORY_PRESETS[r.preset] || CATEGORY_PRESETS.soda;
      const baseCost = Math.round(r.cost / (r.factor || 24));
      return {
        name: r.name,
        cat: p.cat || 'Drinks',
        itemType: p.itemType || 'direct_resale',
        baseUnit: r.baseUnit || 'bottle',
        purchaseUnits: [
          { name: 'Single', factor: 1 },
          { name: r.purchaseUnit || 'Crate', factor: Number(r.factor) || 24 }
        ],
        defaultPurchaseUnit: r.purchaseUnit || 'Crate',
        unitCost: baseCost,
        sellingPrice: Number(r.sellingPrice) || 2000,
        initialCrates: Number(r.initialCrates) || 0,
        returnable: p.returnable !== undefined ? p.returnable : true,
        supplierId: p.suggestedSupplierId || 'sup_coca'
      };
    });

    onBatchSave(formattedItems);
    onClose();
  };

  const handleSavePresetSingle = (e) => {
    e.preventDefault();
    if (!presetForm.name.trim()) return;
    const factor = currentPreset.purchaseUnits?.[1]?.factor || 24;
    const purchasePrice = Number(presetForm.purchasePrice) || 24000;
    const baseCost = Math.round(purchasePrice / factor);

    onBatchSave([
      {
        name: presetForm.name,
        cat: currentPreset.cat || 'Drinks',
        itemType: currentPreset.itemType || 'direct_resale',
        baseUnit: currentPreset.baseUnit || 'bottle',
        purchaseUnits: currentPreset.purchaseUnits,
        defaultPurchaseUnit: currentPreset.defaultPurchaseUnit,
        unitCost: baseCost,
        sellingPrice: Number(presetForm.sellingPrice) || 2000,
        initialCrates: Number(presetForm.initialCrates) || 0,
        returnable: currentPreset.returnable,
        supplierId: currentPreset.suggestedSupplierId || 'sup_coca'
      }
    ]);
    onClose();
  };

  const handleImportCsv = () => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) return;

    const dataLines = lines.slice(1);
    const parsed = dataLines.map(line => {
      const [name, category, baseUnit, purchaseUnit, packSize, crateCost, sellingPrice, initialCrates] = line.split(',').map(s => s?.trim());
      const factor = Number(packSize) || 24;
      const cCost = Number(crateCost) || 24000;
      const baseCost = Math.round(cCost / factor);

      return {
        name: name || 'Imported Drink',
        cat: category || 'Drinks',
        itemType: 'direct_resale',
        baseUnit: baseUnit || 'bottle',
        purchaseUnits: [
          { name: 'Single', factor: 1 },
          { name: purchaseUnit || 'Crate', factor }
        ],
        defaultPurchaseUnit: purchaseUnit || 'Crate',
        unitCost: baseCost,
        sellingPrice: Number(sellingPrice) || 2000,
        initialCrates: Number(initialCrates) || 0,
        returnable: true,
        supplierId: 'sup_coca'
      };
    });

    onBatchSave(parsed);
    onClose();
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="sh" style={{ maxWidth: 840 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Fast Item Registry &amp; Bulk Setup</h3>
            </div>
            <small style={{ color: 'var(--mut)', fontSize: 12 }}>
              Add 10–20 drinks in one screen · Category presets auto-fill · Instant POS link
            </small>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Sub-modes */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', background: 'var(--bg)', padding: '0 18px' }}>
          {[
            ['grid', '📊 Spreadsheet Grid Entry (Fastest)'],
            ['preset', '⚡ Category Preset (1-Tap Setup)'],
            ['csv', '📁 Excel / CSV Batch Import']
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              style={{
                padding: '10px 14px',
                borderBottom: mode === k ? '3px solid var(--g)' : '3px solid transparent',
                color: mode === k ? 'var(--g)' : 'var(--mut)',
                fontWeight: mode === k ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* MODE 1: SPREADSHEET GRID */}
          {mode === 'grid' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <small style={{ color: 'var(--mut)', fontSize: 12.5 }}>
                  Fill in names, prices and crates below. All items are automatically linked to POS drinks menu!
                </small>
                <button
                  type="button"
                  className="btn sm ghost"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={addGridRow}
                >
                  + Add Row
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 6px' }}>Item Name</th>
                      <th style={{ padding: '8px 6px' }}>Category Preset</th>
                      <th style={{ padding: '8px 6px' }}>Base Unit</th>
                      <th style={{ padding: '8px 6px' }}>Pack Unit</th>
                      <th style={{ padding: '8px 6px' }}>Pack Cost</th>
                      <th style={{ padding: '8px 6px' }}>Base Cost</th>
                      <th style={{ padding: '8px 6px' }}>Selling (POS)</th>
                      <th style={{ padding: '8px 6px' }}>Init Crates</th>
                      <th style={{ padding: '8px 6px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const baseCost = Math.round(row.cost / (row.factor || 24));
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '6px 4px' }}>
                            <input
                              type="text"
                              className="inp"
                              placeholder="e.g. Fanta Passion 500ml"
                              value={row.name}
                              onChange={e => updateGridRow(idx, 'name', e.target.value)}
                              style={{ margin: 0, padding: '6px 8px', fontSize: 12.5, minWidth: 140 }}
                            />
                          </td>
                          <td style={{ padding: '6px 4px' }}>
                            <select
                              className="inp"
                              value={row.preset}
                              onChange={e => updateGridRow(idx, 'preset', e.target.value)}
                              style={{ margin: 0, padding: '6px 6px', fontSize: 12 }}
                            >
                              <option value="soda">Soda (24/crate)</option>
                              <option value="beer">Beer (20/crate)</option>
                              <option value="water">Water (12/carton)</option>
                              <option value="energy">Energy Can (24/box)</option>
                              <option value="spirits">Wine/Spirit (6/case)</option>
                            </select>
                          </td>
                          <td style={{ padding: '6px 4px', color: 'var(--mut)', fontSize: 12 }}>
                            {row.baseUnit}
                          </td>
                          <td style={{ padding: '6px 4px', fontSize: 12 }}>
                            {row.purchaseUnit} ({row.factor})
                          </td>
                          <td style={{ padding: '6px 4px' }}>
                            <input
                              type="number"
                              step="500"
                              className="inp"
                              value={row.cost}
                              onChange={e => updateGridRow(idx, 'cost', Number(e.target.value))}
                              style={{ margin: 0, padding: '6px 6px', fontSize: 12, width: 80 }}
                            />
                          </td>
                          <td style={{ padding: '6px 4px', fontWeight: 600, color: 'var(--g)', fontSize: 12 }}>
                            {fmt(baseCost)}
                          </td>
                          <td style={{ padding: '6px 4px' }}>
                            <input
                              type="number"
                              step="500"
                              className="inp"
                              value={row.sellingPrice}
                              onChange={e => updateGridRow(idx, 'sellingPrice', Number(e.target.value))}
                              style={{ margin: 0, padding: '6px 6px', fontSize: 12, width: 80, fontWeight: 700 }}
                            />
                          </td>
                          <td style={{ padding: '6px 4px' }}>
                            <input
                              type="number"
                              className="inp"
                              value={row.initialCrates}
                              onChange={e => updateGridRow(idx, 'initialCrates', Number(e.target.value))}
                              style={{ margin: 0, padding: '6px 6px', fontSize: 12, width: 55 }}
                            />
                          </td>
                          <td style={{ padding: '6px 4px' }}>
                            <button
                              type="button"
                              onClick={() => removeGridRow(idx)}
                              style={{ color: '#FF3B30', fontSize: 14, cursor: 'pointer', background: 'none', border: 0 }}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn ghost sm" onClick={addGridRow}>
                  + Add Another Drink Row
                </button>
                <button type="button" className="btn o sm" onClick={handleSaveGrid} style={{ flex: 1 }}>
                  ⚡ Save All {rows.filter(r => r.name.trim()).length} Drinks to Inventory &amp; POS
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: CATEGORY PRESET */}
          {mode === 'preset' && (
            <form onSubmit={handleSavePresetSingle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: 6 }}>
                  Select Category Preset (Auto-Fills Base Unit &amp; Conversion):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                  {Object.entries(CATEGORY_PRESETS).map(([k, p]) => {
                    const isSel = selectedPresetKey === k;
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => {
                          setSelectedPresetKey(k);
                          setPresetForm(prev => ({
                            ...prev,
                            purchasePrice: String((p.sampleCost || 1000) * (p.purchaseUnits?.[1]?.factor || 1)),
                            sellingPrice: String(p.sampleSellingPrice || 2000)
                          }));
                        }}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 12,
                          border: isSel ? '2px solid var(--g)' : '1px solid var(--line)',
                          background: isSel ? '#E5F2EE' : 'var(--card)',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: 22 }}>{p.icon}</div>
                        <b style={{ fontSize: 12, display: 'block', marginTop: 4, color: isSel ? 'var(--g)' : 'var(--tx)' }}>
                          {p.label}
                        </b>
                        <small style={{ fontSize: 10.5, color: 'var(--mut)' }}>
                          Base: {p.baseUnit}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-filled banner */}
              <div style={{ background: '#E5F2EE', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(14,90,71,0.2)' }}>
                <b style={{ color: 'var(--g)', fontSize: 13 }}>Preset Auto-Filled Configuration:</b>
                <div style={{ fontSize: 12, color: 'var(--tx)', marginTop: 2 }}>
                  Base Unit: <b>{currentPreset.baseUnit}</b> &nbsp;·&nbsp;
                  Purchase Units: <b>{currentPreset.purchaseUnits?.map(u => `${u.name} (${u.factor})`).join(', ')}</b> &nbsp;·&nbsp;
                  Returnable Crate: <b>{currentPreset.returnable ? 'Yes (Glass Crate Deposit)' : 'No'}</b>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700 }}>Drink Item Name:</label>
                  <input
                    type="text"
                    className="inp"
                    value={presetForm.name}
                    onChange={e => setPresetForm({ ...presetForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700 }}>Initial Crates in Store:</label>
                  <input
                    type="number"
                    className="inp"
                    value={presetForm.initialCrates}
                    onChange={e => setPresetForm({ ...presetForm, initialCrates: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700 }}>
                    Purchase Price per {currentPreset.defaultPurchaseUnit} (TSh):
                  </label>
                  <input
                    type="number"
                    step="500"
                    className="inp"
                    value={presetForm.purchasePrice}
                    onChange={e => setPresetForm({ ...presetForm, purchasePrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700 }}>
                    Selling Price at POS per {currentPreset.baseUnit} (TSh):
                  </label>
                  <input
                    type="number"
                    step="500"
                    className="inp"
                    value={presetForm.sellingPrice}
                    onChange={e => setPresetForm({ ...presetForm, sellingPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn sm o" style={{ marginTop: 6 }}>
                ⚡ Register Item &amp; Add Directly to POS
              </button>
            </form>
          )}

          {/* MODE 3: CSV IMPORT */}
          {mode === 'csv' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--mut)', marginTop: 0 }}>
                Paste your Excel / CSV drink roster below. Format: <code>Name,Category,BaseUnit,PurchaseUnit,PackSize,CrateCost,SellingPrice,InitialCrates</code>
              </p>
              <textarea
                className="inp"
                rows="8"
                style={{ fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn sm ghost" onClick={() => setCsvText(
`Name,Category,BaseUnit,PurchaseUnit,PackSize,CrateCost,SellingPrice,InitialCrates
Coke 500ml,Drinks,bottle,Crate,24,24000,2000,10
Fanta 500ml,Drinks,bottle,Crate,24,24000,2000,8
Sprite 500ml,Drinks,bottle,Crate,24,24000,2000,6
Safari Lager 500ml,Drinks,bottle,Crate,20,50000,5000,5
Castle Lite 330ml,Drinks,bottle,Crate,24,62400,5000,4
Water 500ml,Drinks,bottle,Carton,12,9600,2000,15`
                )}>
                  Reset to Sample
                </button>
                <button type="button" className="btn sm o" onClick={handleImportCsv} style={{ flex: 1 }}>
                  📁 Import Drinks Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 3. Returnable Crates & Empty Bottles Tracker (Design Requirement 7) ── */
export function ReturnableCratesTracker({ crateLedger = [], suppliers = SUPPLIERS, onReturnEmpties }) {
  const [returnModal, setReturnModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(crateLedger[0]?.supplierId || 'sup_coca');
  const [cratesToReturn, setCratesToReturn] = useState('5');
  const [bottlesToReturn, setBottlesToReturn] = useState('24');
  const [returnNotes, setReturnNotes] = useState('');

  const currentCrateEntry = crateLedger.find(c => c.supplierId === selectedSupplierId) || crateLedger[0];

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    onReturnEmpties({
      supplierId: selectedSupplierId,
      cratesQty: Number(cratesToReturn) || 0,
      bottlesQty: Number(bottlesToReturn) || 0,
      notes: returnNotes || `Handed over ${cratesToReturn} empty crates to supplier delivery driver`
    });
    setReturnModal(false);
  };

  const totalOwed = crateLedger.reduce((acc, c) => acc + (c.netCratesOwed || 0), 0);
  const totalDepositValue = crateLedger.reduce((acc, c) => acc + ((c.netCratesOwed || 0) * (c.depositPerCrate || 15000)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        <div className="card" style={{ background: '#FFF9ED', border: '1.5px solid #FFE2A8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>🍾</span>
            <div>
              <small style={{ color: '#92400E', fontWeight: 600 }}>Empty Crates Owed to Suppliers</small>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#B45309' }}>{totalOwed} crates</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#E5F2EE', border: '1.5px solid rgba(14,90,71,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>💰</span>
            <div>
              <small style={{ color: 'var(--g)', fontWeight: 600 }}>Deposit Value at Risk</small>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--g)' }}>{fmt(totalDepositValue)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <b style={{ fontSize: 16 }}>Returnable Glass Crates &amp; Empties Ledger</b>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--mut)' }}>
              Tracks full crates received vs empty crates returned to distributors (Coca-Cola, Serengeti, TBL)
            </p>
          </div>
          <button className="btn sm o" onClick={() => setReturnModal(true)}>
            🍾 Return Empties to Supplier
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                <th style={{ padding: '9px 10px' }}>Supplier / Distributor</th>
                <th style={{ padding: '9px 10px' }}>Drink Brand</th>
                <th style={{ padding: '9px 10px' }}>Crates Received</th>
                <th style={{ padding: '9px 10px' }}>Crates Returned</th>
                <th style={{ padding: '9px 10px' }}>Net Owed</th>
                <th style={{ padding: '9px 10px' }}>Deposit / Crate</th>
                <th style={{ padding: '9px 10px' }}>Deposit Total</th>
                <th style={{ padding: '9px 10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {crateLedger.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px' }}>
                    <b>{item.supplierName}</b>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--mut)' }}>
                    {item.drinkName}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 600 }}>
                    {item.cratesReceived}
                  </td>
                  <td style={{ padding: '10px', color: '#15803D', fontWeight: 600 }}>
                    {item.cratesReturned}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 99,
                      fontWeight: 700,
                      fontSize: 12,
                      background: item.netCratesOwed > 5 ? '#FFE0DE' : '#FFF9ED',
                      color: item.netCratesOwed > 5 ? '#C62828' : '#B45309'
                    }}>
                      {item.netCratesOwed} crates
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--mut)' }}>
                    {fmt(item.depositPerCrate || 15000)}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 700, color: 'var(--tx)' }}>
                    {fmt((item.netCratesOwed || 0) * (item.depositPerCrate || 15000))}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button
                      className="btn sm ghost"
                      style={{ fontSize: 11.5, padding: '4px 8px' }}
                      onClick={() => {
                        setSelectedSupplierId(item.supplierId);
                        setCratesToReturn(String(item.netCratesOwed || 2));
                        setReturnModal(true);
                      }}
                    >
                      Return
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Modal */}
      {returnModal && (
        <div className="ov" onClick={() => setReturnModal(false)}>
          <div className="sh" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: 16 }}>Return Empty Crates to Supplier</h3>
              <button className="modal-close-btn" onClick={() => setReturnModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReturnSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Supplier:</label>
                <select
                  className="inp"
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Empty Crates Handed Over:</label>
                <input
                  type="number"
                  min="1"
                  className="inp"
                  value={cratesToReturn}
                  onChange={e => setCratesToReturn(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Empty Loose Bottles (Optional):</label>
                <input
                  type="number"
                  min="0"
                  className="inp"
                  value={bottlesToReturn}
                  onChange={e => setBottlesToReturn(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Delivery Driver / Notes:</label>
                <input
                  type="text"
                  className="inp"
                  placeholder="e.g. Returned with Coca-Cola truck driver"
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="btn sm o" style={{ marginTop: 8 }}>
                Confirm Return &amp; Deduct from Owed Balance
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 4. Stock by Location & Profit Margin Report (Design Requirement 7) ── */
export function LocationAndProfitReportsView({ stockList = [], menu = [], orders = [] }) {
  const [reportTab, setReportTab] = useState('locations'); // 'locations' | 'profit' | 'variance'

  // Stock by location
  const totalStoreValue = stockList.reduce((acc, s) => acc + ((s.storeQty || 0) * (s.unitCost || 0)), 0);
  const totalBarValue = stockList.reduce((acc, s) => acc + ((s.barQty || 0) * (s.unitCost || 0)), 0);
  const totalKitchenValue = stockList.reduce((acc, s) => acc + ((s.kitchenQty || 0) * (s.unitCost || 0)), 0);
  const totalInventoryValue = totalStoreValue + totalBarValue + totalKitchenValue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top Value Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        <div className="card" style={{ background: '#E5F2EE', border: '1px solid rgba(14,90,71,0.2)' }}>
          <small style={{ color: 'var(--g)', fontWeight: 600 }}>🏬 Main Store Stock</small>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--g)', margin: '4px 0' }}>{fmt(totalStoreValue)}</div>
          <small style={{ color: 'var(--mut)' }}>Central reserve &amp; bulk cases</small>
        </div>

        <div className="card" style={{ background: '#FFE9DD', border: '1px solid rgba(255,107,44,0.25)' }}>
          <small style={{ color: 'var(--o)', fontWeight: 600 }}>🍸 Bar &amp; Counter Fridges</small>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--o)', margin: '4px 0' }}>{fmt(totalBarValue)}</div>
          <small style={{ color: 'var(--mut)' }}>Ready for immediate sale</small>
        </div>

        <div className="card" style={{ background: '#F1DDF5', border: '1px solid rgba(142,68,173,0.2)' }}>
          <small style={{ color: '#8E44AD', fontWeight: 600 }}>👨‍🍳 Kitchen Prep Stock</small>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#8E44AD', margin: '4px 0' }}>{fmt(totalKitchenValue)}</div>
          <small style={{ color: 'var(--mut)' }}>Active prep &amp; cooking</small>
        </div>

        <div className="card" style={{ background: 'var(--card)' }}>
          <small style={{ color: 'var(--mut)', fontWeight: 600 }}>📦 Total Inventory Valuation</small>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--tx)', margin: '4px 0' }}>{fmt(totalInventoryValue)}</div>
          <small style={{ color: 'var(--mut)' }}>Across all 3 locations</small>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="seg" style={{ margin: 0 }}>
        <button className={reportTab === 'locations' ? 'on' : ''} onClick={() => setReportTab('locations')}>
          📍 Stock by Location
        </button>
        <button className={reportTab === 'profit' ? 'on' : ''} onClick={() => setReportTab('profit')}>
          💰 Profit Margin per Item
        </button>
        <button className={reportTab === 'variance' ? 'on' : ''} onClick={() => setReportTab('variance')}>
          ⚖️ Sales vs. Stock Variance
        </button>
      </div>

      {/* TAB 1: Stock by Location */}
      {reportTab === 'locations' && (
        <div className="card">
          <b style={{ fontSize: 16 }}>Location Breakdown (Main Store vs Bar vs Kitchen)</b>
          <p style={{ fontSize: 12.5, color: 'var(--mut)', margin: '2px 0 12px' }}>
            All quantities are counted strictly in base units (bottles, cans, kg)
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Item</th>
                  <th style={{ padding: '8px 10px' }}>Category</th>
                  <th style={{ padding: '8px 10px' }}>Base Unit</th>
                  <th style={{ padding: '8px 10px' }}>Main Store</th>
                  <th style={{ padding: '8px 10px' }}>Bar Fridge</th>
                  <th style={{ padding: '8px 10px' }}>Kitchen</th>
                  <th style={{ padding: '8px 10px' }}>Total On Hand</th>
                  <th style={{ padding: '8px 10px' }}>Unit Cost</th>
                  <th style={{ padding: '8px 10px' }}>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {stockList.map(item => {
                  const bQ = item.barQty || 0;
                  const isBarLow = item.cat === 'Drinks' && bQ <= 12;
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px' }}>
                        <b>{item.name}</b>
                      </td>
                      <td style={{ padding: '10px', color: 'var(--mut)' }}>{item.cat}</td>
                      <td style={{ padding: '10px' }}>{item.baseUnit || item.uom}</td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{item.storeQty || 0}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: isBarLow ? '#C2410C' : 'var(--tx)',
                          background: isBarLow ? '#FFE9DD' : 'transparent',
                          padding: isBarLow ? '2px 6px' : 0,
                          borderRadius: 6
                        }}>
                          {bQ} {isBarLow ? '⚠️ Low' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{item.kitchenQty || 0}</td>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{item.onHand}</td>
                      <td style={{ padding: '10px', color: 'var(--mut)' }}>{fmt(item.unitCost)}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: 'var(--g)' }}>
                        {fmt((item.onHand || 0) * (item.unitCost || 0))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Profit Margin per Item */}
      {reportTab === 'profit' && (
        <div className="card">
          <b style={{ fontSize: 16 }}>Profit per Item &amp; Gross Margin Analysis</b>
          <p style={{ fontSize: 12.5, color: 'var(--mut)', margin: '2px 0 12px' }}>
            Calculated as Selling Price minus Base Unit Cost
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Menu Item</th>
                  <th style={{ padding: '8px 10px' }}>Linked Stock Item</th>
                  <th style={{ padding: '8px 10px' }}>Base Cost</th>
                  <th style={{ padding: '8px 10px' }}>Selling Price</th>
                  <th style={{ padding: '8px 10px' }}>Gross Profit</th>
                  <th style={{ padding: '8px 10px' }}>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {menu.filter(m => m.p > 0).map(m => {
                  const linkedStock = stockList.find(s => s.id === m.stockId || s.menuId === m.id);
                  const multiplier = m.packMultiplier || 1;
                  const unitCost = linkedStock ? (linkedStock.unitCost * multiplier) : (m.c === 'Drinks' ? Math.round(m.p * 0.45) : Math.round(m.p * 0.35));
                  const profit = m.p - unitCost;
                  const marginPct = Math.round((profit / m.p) * 100);

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px' }}>
                        <b>{m.n}</b> {multiplier > 1 ? <span className="pill placed">Pack of {multiplier}</span> : null}
                      </td>
                      <td style={{ padding: '10px', color: 'var(--mut)' }}>
                        {linkedStock ? linkedStock.name : '—'}
                      </td>
                      <td style={{ padding: '10px', color: '#6B7280' }}>
                        {fmt(unitCost)}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>
                        {fmt(m.p)}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 800, color: profit > 0 ? '#15803D' : '#C62828' }}>
                        {fmt(profit)}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 99,
                          fontWeight: 700,
                          fontSize: 12,
                          background: marginPct >= 60 ? '#DDF3E4' : marginPct >= 40 ? '#E5F2EE' : '#FFE9DD',
                          color: marginPct >= 60 ? '#15803D' : marginPct >= 40 ? 'var(--g)' : 'var(--o)'
                        }}>
                          {marginPct}%
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

      {/* TAB 3: Sales vs Stock Variance */}
      {reportTab === 'variance' && (
        <div className="card">
          <b style={{ fontSize: 16 }}>Sales vs. Stock Variance Reconciliation</b>
          <p style={{ fontSize: 12.5, color: 'var(--mut)', margin: '2px 0 12px' }}>
            Theoretical Inventory = Opening + Purchases − POS Sales − Logged Spoilage
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Stock Item</th>
                  <th style={{ padding: '8px 10px' }}>Base Unit</th>
                  <th style={{ padding: '8px 10px' }}>Physical On Hand</th>
                  <th style={{ padding: '8px 10px' }}>Theoretical</th>
                  <th style={{ padding: '8px 10px' }}>Variance</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockList.slice(0, 15).map(item => {
                  const physical = Number(item.onHand) || 0;
                  const theoretical = Number(item.theoretical !== undefined ? item.theoretical : physical);
                  const variance = +(physical - theoretical).toFixed(2);
                  const isClean = Math.abs(variance) < 0.01;

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px' }}>
                        <b>{item.name}</b>
                      </td>
                      <td style={{ padding: '10px', color: 'var(--mut)' }}>{item.baseUnit || item.uom}</td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>{physical}</td>
                      <td style={{ padding: '10px', color: 'var(--mut)' }}>{theoretical}</td>
                      <td style={{ padding: '10px', fontWeight: 800, color: variance < 0 ? '#FF3B30' : variance > 0 ? '#15803D' : 'var(--tx)' }}>
                        {variance > 0 ? `+${variance}` : variance}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 99,
                          fontWeight: 700,
                          fontSize: 12,
                          background: isClean ? '#DDF3E4' : '#FFE0DE',
                          color: isClean ? '#15803D' : '#C62828'
                        }}>
                          {isClean ? '✓ Balanced' : '⚠️ Discrepancy'}
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
    </div>
  );
}

/* ── 5. Quick Add Menu Item Modal (On-Site under 10 seconds, marked "needs review") ── */
export function QuickAddMenuItemModal({ isOpen, onClose, onSave, actor = 'Cashier' }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('3000');
  const [category, setCategory] = useState('Drinks');
  const [station, setStation] = useState('bar');
  const [packMultiplier, setPackMultiplier] = useState('1');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      n: name.trim(),
      p: Number(price) || 2000,
      c: category,
      station,
      packMultiplier: Number(packMultiplier) || 1,
      e: category === 'Drinks' ? '🍹' : category === 'Burgers' ? '🍔' : '🍽️'
    });
    onClose();
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="sh" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#FFE9DD', borderBottom: '1px solid #FFD0BA' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: 16, color: '#C2410C' }}>Quick Add Menu Item (&lt;10s)</h3>
            </div>
            <small style={{ color: '#9A3412', fontSize: 11.5 }}>
              Goes live on POS immediately with <b>"Needs Review"</b> badge
            </small>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
              Item Name:
            </label>
            <input
              type="text"
              autoFocus
              className="inp"
              placeholder="e.g. Castle Lite Draught 500ml"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Selling Price (TSh):
              </label>
              <input
                type="number"
                step="500"
                className="inp"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Category:
              </label>
              <select
                className="inp"
                value={category}
                onChange={e => {
                  const cat = e.target.value;
                  setCategory(cat);
                  setStation(cat === 'Drinks' ? 'bar' : 'grill');
                }}
              >
                <option value="Drinks">Drinks</option>
                <option value="Grills">Grills</option>
                <option value="Burgers">Burgers</option>
                <option value="Snacks">Snacks</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Station:
              </label>
              <select
                className="inp"
                value={station}
                onChange={e => setStation(e.target.value)}
              >
                <option value="bar">Bar (Drink Station)</option>
                <option value="grill">Grill / Kitchen Pass</option>
                <option value="fry">Fry Station</option>
                <option value="dessert">Dessert / Cold Pass</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Pack Multiplier:
              </label>
              <input
                type="number"
                min="1"
                className="inp"
                value={packMultiplier}
                onChange={e => setPackMultiplier(e.target.value)}
                placeholder="1 (e.g. 6 for bucket)"
              />
            </div>
          </div>

          <div style={{ background: '#FFF9ED', border: '1px solid #FFE2A8', borderRadius: 10, padding: 10, fontSize: 12, color: '#92400E' }}>
            ℹ️ Cashiers can add items to sell immediately. A manager will review and link stock/cost later.
          </div>

          <button type="submit" className="btn sm o" style={{ marginTop: 4 }}>
            ⚡ Put Live on POS Immediately
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── 6. Manager Review Drawer for Quick-Added Items ── */
export function ManagerReviewModal({ isOpen, onClose, unreviewedItems = [], stockList = [], onApproveItem }) {
  if (!isOpen) return null;

  return (
    <div className="ov" onClick={onClose}>
      <div className="sh" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#FFF9ED', borderBottom: '1px solid #FFE2A8' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: 16, color: '#B45309' }}>
                Review On-Site Added Items ({unreviewedItems.length})
              </h3>
            </div>
            <small style={{ color: '#92400E', fontSize: 12 }}>
              Link inventory stock items or recipe costs to maintain control without slowing POS sales
            </small>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {unreviewedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--mut)' }}>
              <div style={{ fontSize: 36 }}>✓</div>
              <b>All quick-added items have been reviewed!</b>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {unreviewedItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--card)',
                    border: '1.5px solid #FFD0BA',
                    borderRadius: 14,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <b style={{ fontSize: 15, color: 'var(--tx)' }}>{item.n}</b>
                      <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 2 }}>
                        Category: <b>{item.c}</b> · Station: <b>{item.station}</b> · Added by: <b>{item.addedBy || 'Staff'}</b>
                      </div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--g)' }}>
                      {fmt(item.p)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <select
                      className="inp"
                      id={`link_stock_${item.id}`}
                      defaultValue={stockList.find(s => s.name.toLowerCase().includes(item.n.toLowerCase()))?.id || ''}
                      style={{ margin: 0, fontSize: 12.5, flex: 2 }}
                    >
                      <option value="">— Link to Stock Item (or keep unlinked) —</option>
                      {stockList.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.baseUnit || s.uom}, Cost: {fmt(s.unitCost)})
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn sm o"
                      style={{ fontSize: 12, flex: 1 }}
                      onClick={() => {
                        const sel = document.getElementById(`link_stock_${item.id}`);
                        const linkedStockId = sel?.value || null;
                        onApproveItem(item.id, {
                          stockId: linkedStockId
                        });
                      }}
                    >
                      ✓ Approve Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

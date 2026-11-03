import React, { useState, useMemo } from 'react';
import { fmt, fmtNum } from '../data';
import { getItemLocations } from '../screens/Inventory';

export const CATEGORY_ICONS = {
  Poultry: '🍗',
  Meat: '🥩',
  Seafood: '🐟',
  Produce: '🥬',
  Dairy: '🧀',
  'Dry Goods': '🌾',
  Bakery: '🥖',
  Spices: '🌶️',
  Oils: '🫒',
  Drinks: '🥤',
  Desserts: '🍰',
  Other: '📦'
};

export const CATEGORY_BG = {
  Poultry: '#FFF3E0',
  Meat: '#FFEBEE',
  Seafood: '#E1F5FE',
  Produce: '#E8F5E9',
  Dairy: '#FFF8E1',
  'Dry Goods': '#EFEBE9',
  Bakery: '#FBE9E7',
  Spices: '#F3E5F5',
  Oils: '#FFFDE7',
  Drinks: '#E0F2F1',
  Desserts: '#FCE4EC',
  Other: '#ECEFF1'
};

export function StockIngredientSlideSelector({
  stock = [],
  selectedId,
  onSelect,
  onClose,
  title = 'Required Stock Ingredients Catalog',
  subtitle = 'Click any card to select for the active form',
  itemTypeFilter = 'all' // 'all' | 'raw_material' | 'direct_resale'
}) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'low' | 'optimal'

  // Filter items
  const filteredItems = useMemo(() => {
    return stock.filter(item => {
      // Type filter
      if (itemTypeFilter === 'raw_material' && item.itemType === 'direct_resale') return false;
      if (itemTypeFilter === 'direct_resale' && item.itemType !== 'direct_resale') return false;

      // Category filter
      if (selectedCat !== 'All' && item.cat !== selectedCat) return false;

      // Status filter
      if (stockStatusFilter === 'low' && item.onHand >= item.reorder) return false;
      if (stockStatusFilter === 'optimal' && item.onHand < item.reorder) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (item.name || '').toLowerCase().includes(q);
        const matchCat = (item.cat || '').toLowerCase().includes(q);
        const matchLoc = (item.loc || '').toLowerCase().includes(q);
        const matchId = (item.id || '').toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchLoc && !matchId) return false;
      }

      return true;
    });
  }, [stock, itemTypeFilter, selectedCat, stockStatusFilter, search]);

  // Available categories
  const categories = useMemo(() => {
    const set = new Set();
    stock.forEach(item => {
      if (itemTypeFilter === 'raw_material' && item.itemType === 'direct_resale') return;
      if (itemTypeFilter === 'direct_resale' && item.itemType !== 'direct_resale') return;
      if (item.cat) set.add(item.cat);
    });
    return ['All', ...Array.from(set)];
  }, [stock, itemTypeFilter]);

  return (
    <div className="workbench-slide-pane">
      {/* Slide Pane Header */}
      <div className="workbench-slide-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🍱</span>
              <b style={{ fontSize: 15, color: 'var(--tx)' }}>{title}</b>
              <span className="inv-tab-badge" style={{ background: '#E5F2EE', color: 'var(--g)' }}>
                {filteredItems.length} items
              </span>
            </div>
            <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>{subtitle}</small>
          </div>

          {onClose && (
            <button
              type="button"
              className="action-btn"
              onClick={onClose}
              title="Close catalog drawer"
              style={{ fontSize: 12, padding: '4px 10px', background: 'var(--card)' }}
            >
              ✕ Hide Cards
            </button>
          )}
        </div>

        {/* Live Search Bar */}
        <div className="search" style={{ marginBottom: 8, padding: '7px 12px' }}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search ingredients by name, bin, category, or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', fontSize: 13 }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ color: 'var(--mut)', fontSize: 12, fontWeight: 700 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills Slider */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none'
          }}
        >
          {categories.map(cat => {
            const icon = cat === 'All' ? '✨' : CATEGORY_ICONS[cat] || '📦';
            const isSel = selectedCat === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSel ? '1px solid var(--g)' : '1px solid var(--line)',
                  background: isSel ? 'var(--g)' : 'var(--card)',
                  color: isSel ? '#fff' : 'var(--tx)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Scrollable Body */}
      <div className="workbench-slide-body">
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--mut)' }}>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>🔍</span>
            <b>No matching stock ingredients found</b>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try clearing search keywords or choosing another category.</p>
            <button
              type="button"
              className="btn sm ghost"
              style={{ marginTop: 10 }}
              onClick={() => {
                setSearch('');
                setSelectedCat('All');
                setStockStatusFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="stock-cards-grid">
            {filteredItems.map(item => {
              const locs = getItemLocations(item);
              const isSelected = selectedId === item.id;
              const isLow = item.onHand < item.reorder;
              const icon = CATEGORY_ICONS[item.cat] || '📦';
              const avatarBg = CATEGORY_BG[item.cat] || '#ECEFF1';

              return (
                <div
                  key={item.id}
                  className={`stock-picker-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelect(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(item);
                    }
                  }}
                >
                  {/* Top Row: Icon Avatar + Name + Selected Badge */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <div className="stock-picker-avatar" style={{ background: avatarBg }}>
                        {icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                          <b
                            style={{
                              fontSize: 14,
                              color: isSelected ? 'var(--g)' : 'var(--tx)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'block'
                            }}
                          >
                            {item.name}
                          </b>
                          {isSelected && (
                            <span className="stock-selected-badge">
                              ✓ Selected
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--mut)',
                              background: 'rgba(118,118,128,0.1)',
                              padding: '1px 6px',
                              borderRadius: 4
                            }}
                          >
                            {item.cat}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--mut)' }}>
                            📍 {item.loc || 'Main Store'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Quantities Split Bar */}
                    <div
                      style={{
                        background: 'var(--bg)',
                        borderRadius: 10,
                        padding: '6px 10px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 4,
                        textAlign: 'center',
                        fontSize: 11,
                        marginBottom: 8
                      }}
                    >
                      <div>
                        <small style={{ color: 'var(--mut)', display: 'block', fontSize: 10 }}>Store</small>
                        <b style={{ color: 'var(--tx)' }}>{fmtNum(locs.storeQty)} {item.uom}</b>
                      </div>
                      <div>
                        <small style={{ color: 'var(--mut)', display: 'block', fontSize: 10 }}>Kitchen</small>
                        <b style={{ color: 'var(--tx)' }}>{fmtNum(locs.kitchenQty)} {item.uom}</b>
                      </div>
                      <div>
                        <small style={{ color: 'var(--mut)', display: 'block', fontSize: 10 }}>Total Stock</small>
                        <b style={{ color: isLow ? '#C2410C' : 'var(--g)', fontWeight: 800 }}>
                          {fmtNum(item.onHand)} {item.uom}
                        </b>
                      </div>
                    </div>

                    {/* Financial Cost & Status Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                      <div>
                        <small style={{ color: 'var(--mut)', display: 'block', fontSize: 10 }}>Unit Cost</small>
                        <b style={{ color: 'var(--tx)' }}>{fmt(item.unitCost)} / {item.uom}</b>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          className="pill"
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            background: isLow ? '#FFE9DD' : '#DDF3E4',
                            color: isLow ? '#C2410C' : '#15803D'
                          }}
                        >
                          {isLow ? `Low (PAR ${item.par})` : `Optimal`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selection Button Trigger */}
                  <button
                    type="button"
                    className={`btn sm ${isSelected ? '' : 'ghost'}`}
                    style={{
                      width: '100%',
                      padding: '7px',
                      fontSize: 12,
                      background: isSelected ? 'var(--g)' : 'var(--card)',
                      color: isSelected ? '#fff' : 'var(--g)',
                      borderColor: isSelected ? 'var(--g)' : 'var(--line)'
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      onSelect(item);
                    }}
                  >
                    {isSelected ? '✓ Chosen for Recipe / Tender' : 'Select This Ingredient →'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

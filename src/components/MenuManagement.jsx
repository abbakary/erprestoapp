import React, { useState, useEffect } from 'react';
import { CATS, CAT_ICONS, fmt, fmtNum, M, MENU } from '../data';

// Curated high-resolution finished good food & beverage imagery presets
export const FINISHED_GOOD_PRESETS = [
  {
    name: 'Flame-Grilled Ribeye & Steaks',
    category: 'Grills',
    station: 'grill',
    url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80',
    emoji: '🥩'
  },
  {
    name: 'Roasted Chicken Half',
    category: 'Grills',
    station: 'grill',
    url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
    emoji: '🍗'
  },
  {
    name: 'Swahili Beef Mishkaki Skewers',
    category: 'Grills',
    station: 'grill',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    emoji: '🍢'
  },
  {
    name: 'Grilled Whole Tilapia',
    category: 'Grills',
    station: 'grill',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
    emoji: '🐟'
  },
  {
    name: 'Gourmet Steakhouse Burger',
    category: 'Burgers',
    station: 'grill',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    emoji: '🍔'
  },
  {
    name: 'Crispy Buttermilk Chicken Burger',
    category: 'Burgers',
    station: 'fry',
    url: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80',
    emoji: '🥪'
  },
  {
    name: 'Stone-Baked Mozzarella Pizza',
    category: 'Pizza',
    station: 'pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    emoji: '🍕'
  },
  {
    name: 'Creamy Chicken Alfredo Pasta',
    category: 'Pastas',
    station: 'grill',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281098?w=600&auto=format&fit=crop&q=80',
    emoji: '🍝'
  },
  {
    name: 'Crispy Masala Fries & Bites',
    category: 'Snacks',
    station: 'fry',
    url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    emoji: '🍟'
  },
  {
    name: 'Greek Salad with Feta & Olives',
    category: 'Salads',
    station: 'salad',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    emoji: '🥗'
  },
  {
    name: 'Dark Chocolate Lava Cake',
    category: 'Desserts',
    station: 'dessert',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    emoji: '🧁'
  },
  {
    name: 'Chilled Passion Cooler Mocktail',
    category: 'Drinks',
    station: 'bar',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    emoji: '🍹'
  },
  {
    name: 'Coca-Cola / Soda 500ml Bottle',
    category: 'Drinks',
    station: 'bar',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    emoji: '🥤'
  },
  {
    name: 'Cold Beer / Safari Lager Bottle',
    category: 'Drinks',
    station: 'bar',
    url: 'https://images.unsplash.com/photo-1608270191295-829d2b2ecbe3?w=600&auto=format&fit=crop&q=80',
    emoji: '🍺'
  },
  {
    name: 'Kilimanjaro Mineral Water 500ml',
    category: 'Drinks',
    station: 'bar',
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
    emoji: '💧'
  },
  {
    name: 'Red Bull Energy Drink',
    category: 'Drinks',
    station: 'bar',
    url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80',
    emoji: '⚡'
  }
];

const ALLERGEN_OPTIONS = ['Gluten', 'Dairy', 'Nuts', 'Fish', 'Shellfish', 'Eggs', 'Soy', 'Chilli', 'Garlic'];

/* ── 1. Comprehensive Detailed Menu Item Creator & Editor Modal ── */
export function MenuItemDetailModal({
  isOpen,
  onClose,
  onSave,
  editItem = null,
  stockList = [],
  actor = 'Staff'
}) {
  if (!isOpen) return null;

  const isEditing = !!editItem;

  // Form State
  const [mode, setMode] = useState(editItem?.needsReview ? 'quick' : 'detailed'); // 'detailed' | 'quick'
  const [name, setName] = useState(editItem?.n || '');
  const [category, setCategory] = useState(editItem?.c || 'Grills');
  const [price, setPrice] = useState(editItem ? String(editItem.p) : '15000');
  const [costPrice, setCostPrice] = useState(editItem ? String(editItem.costPrice || 0) : '5000');
  const [description, setDescription] = useState(editItem?.d || '');
  const [station, setStation] = useState(editItem?.station || (category === 'Drinks' ? 'bar' : 'grill'));
  const [prepTime, setPrepTime] = useState(editItem ? String(editItem.t || 15) : '15');
  const [rating, setRating] = useState(editItem ? String(editItem.r || 4.8) : '4.8');
  const [image, setImage] = useState(
    editItem?.img || 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80'
  );
  const [selectedStockId, setSelectedStockId] = useState(editItem?.stockId || '');
  const [packMultiplier, setPackMultiplier] = useState(editItem ? String(editItem.packMultiplier || 1) : '1');
  const [allergens, setAllergens] = useState(editItem?.allergens || []);
  const [isSpecial, setIsSpecial] = useState(editItem ? !!editItem.isSpecial : true);
  const [uploadError, setUploadError] = useState('');

  // Fast Search States
  const [fastSearch, setFastSearch] = useState('');
  const [presetSearch, setPresetSearch] = useState('');
  const [presetCatFilter, setPresetCatFilter] = useState('All');
  const [stockSearch, setStockSearch] = useState('');
  const [autofillBanner, setAutofillBanner] = useState('');

  // Update form if editItem changes
  useEffect(() => {
    if (editItem) {
      setName(editItem.n || '');
      setCategory(editItem.c || 'Grills');
      setPrice(String(editItem.p || 0));
      setCostPrice(String(editItem.costPrice || 0));
      setDescription(editItem.d || '');
      setStation(editItem.station || (editItem.c === 'Drinks' ? 'bar' : 'grill'));
      setPrepTime(String(editItem.t || 15));
      setRating(String(editItem.r || 4.8));
      setImage(editItem.img || 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80');
      setSelectedStockId(editItem.stockId || '');
      setPackMultiplier(String(editItem.packMultiplier || 1));
      setAllergens(editItem.allergens || []);
      setIsSpecial(!!editItem.isSpecial);
      setMode(editItem.needsReview ? 'quick' : 'detailed');
    }
  }, [editItem]);

  // Handle Finished Good Image File Upload (FileReader Base64)
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size is too large. Please upload an image under 5MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setImage(uploadEvent.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleAllergen = (al) => {
    setAllergens(prev =>
      prev.includes(al) ? prev.filter(x => x !== al) : [...prev, al]
    );
  };

  // Profit Margin Calculation
  const numPrice = Number(price) || 0;
  const numCost = Number(costPrice) || 0;
  const grossProfit = Math.max(0, numPrice - numCost);
  const marginPct = numPrice > 0 ? ((grossProfit / numPrice) * 100).toFixed(1) : '0.0';

  // Fast Autofill Action
  const applyAutofill = (template) => {
    if (!template) return;
    if (template.name || template.n) setName(template.name || template.n);
    if (template.category || template.c) {
      const c = template.category || template.c;
      setCategory(c);
      if (template.station) setStation(template.station);
      else if (c === 'Drinks') setStation('bar');
      else if (c === 'Pizza') setStation('pizza');
      else if (c === 'Salads') setStation('salad');
      else if (c === 'Desserts') setStation('dessert');
      else setStation('grill');
    }
    if (template.price || template.p) setPrice(String(template.price || template.p));
    if (template.costPrice) setCostPrice(String(template.costPrice));
    else if (template.unitCost) setCostPrice(String(template.unitCost));
    if (template.description || template.d) setDescription(template.description || template.d);
    if (template.url || template.img) setImage(template.url || template.img);
    if (template.t) setPrepTime(String(template.t));
    if (template.r) setRating(String(template.r));
    if (template.allergens) setAllergens(template.allergens);

    // Try linking to stock if matching stock item exists
    if (template.stockId) {
      setSelectedStockId(template.stockId);
      if (template.packMultiplier) setPackMultiplier(String(template.packMultiplier));
    } else if (template.id && String(template.id).startsWith('stk_')) {
      setSelectedStockId(template.id);
      setPackMultiplier('1');
    } else {
      const matched = stockList.find(s => s.name?.toLowerCase().includes((template.name || template.n || '').toLowerCase()));
      if (matched) {
        setSelectedStockId(matched.id);
      }
    }

    setAutofillBanner(`⚡ Form auto-populated from "${template.name || template.n}"! Feel free to adjust.`);
    setFastSearch('');
    setTimeout(() => setAutofillBanner(''), 5000);
  };

  // Filtered Photo Presets
  const filteredPresets = FINISHED_GOOD_PRESETS.filter(p => {
    const matchCat = presetCatFilter === 'All' || p.category === presetCatFilter;
    const matchSearch = !presetSearch.trim() ||
      p.name.toLowerCase().includes(presetSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(presetSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Stock Items for Section 5
  const filteredStock = stockList.filter(s => {
    if (!stockSearch.trim()) return true;
    const term = stockSearch.toLowerCase();
    return s.name.toLowerCase().includes(term) ||
      (s.category || '').toLowerCase().includes(term) ||
      (s.baseUnit || s.uom || '').toLowerCase().includes(term);
  });

  // Quick Catalog Templates for Fast Search
  const quickCatalogSuggestions = [
    { name: 'Flame-Grilled Ribeye 350g', category: 'Grills', price: 28000, costPrice: 9500, station: 'grill', t: 18, emoji: '🥩', url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80', description: 'Tender prime dry-aged Tanzanian beef ribeye grilled over aromatic charcoal with herb garlic butter.' },
    { name: 'Roasted Chicken Half', category: 'Grills', price: 18000, costPrice: 6000, station: 'grill', t: 15, emoji: '🍗', url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80', description: 'Half chicken marinated in lemon, garlic, rosemary and fresh herbs roasted to golden perfection.' },
    { name: 'Swahili Beef Mishkaki (5 Skewers)', category: 'Grills', price: 16000, costPrice: 4800, station: 'grill', t: 12, emoji: '🍢', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80', description: 'Fire-grilled tender marinated beef skewers served with spicy kachumbari and lime wedges.' },
    { name: 'Gourmet Steakhouse Burger', category: 'Burgers', price: 15000, costPrice: 4500, station: 'grill', t: 10, emoji: '🍔', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', description: '200g prime beef patty, mature cheddar, caramelized onions, pickles and house BBQ on brioche.' },
    { name: 'Crispy Buttermilk Chicken Burger', category: 'Burgers', price: 13000, costPrice: 4000, station: 'fry', t: 10, emoji: '🥪', url: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80', description: 'Golden crispy chicken breast with jalapeño slaw and spicy garlic mayo.' },
    { name: 'Stone-Baked Mozzarella Pizza', category: 'Pizza', price: 16000, costPrice: 4200, station: 'pizza', t: 12, emoji: '🍕', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', description: 'San Marzano tomato base, fresh buffalo mozzarella, fragrant basil and extra virgin olive oil.' },
    { name: 'Crispy Masala Fries & Bites', category: 'Snacks', price: 6000, costPrice: 1800, station: 'fry', t: 8, emoji: '🍟', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80', description: 'Hand-cut crispy potatoes tossed in aromatic Swahili masala spices with lemon.' },
    { name: 'Soda 500ml Bottle (Coke/Fanta/Sprite)', category: 'Drinks', price: 2000, costPrice: 1000, station: 'bar', t: 1, stockId: 'stk_coke', packMultiplier: 1, emoji: '🥤', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', description: 'Chilled 500ml glass bottle soda served with lemon slice and ice.' },
    { name: 'Cold Beer / Safari Lager Bottle', category: 'Drinks', price: 4500, costPrice: 2200, station: 'bar', t: 1, stockId: 'stk_beer', packMultiplier: 1, emoji: '🍺', url: 'https://images.unsplash.com/photo-1608270191295-829d2b2ecbe3?w=600&auto=format&fit=crop&q=80', description: 'Crisp cold 500ml Safari Lager served frosty.' },
    { name: 'Bucket of 6 Beers (Ice Bucket)', category: 'Drinks', price: 25000, costPrice: 13200, station: 'bar', t: 2, stockId: 'stk_beer', packMultiplier: 6, emoji: '🍻', url: 'https://images.unsplash.com/photo-1608270191295-829d2b2ecbe3?w=600&auto=format&fit=crop&q=80', description: 'Chilled bucket of 6 Safari Lagers packed in crushed ice.' },
    { name: 'Kilimanjaro Mineral Water 500ml', category: 'Drinks', price: 2000, costPrice: 800, station: 'bar', t: 1, stockId: 'stk_water', packMultiplier: 1, emoji: '💧', url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80', description: 'Chilled natural pure mineral water.' }
  ];

  // Matched autofill items for fastSearch
  const fastMatches = fastSearch.trim()
    ? [...quickCatalogSuggestions, ...stockList.map(s => ({
        name: s.name,
        n: s.name,
        category: s.category === 'Drinks' ? 'Drinks' : 'Snacks',
        price: s.unitCost ? Math.round(s.unitCost * 1.8 / 500) * 500 : 5000,
        costPrice: s.unitCost || 2000,
        station: s.category === 'Drinks' ? 'bar' : 'grill',
        stockId: s.id,
        emoji: s.category === 'Drinks' ? '🥤' : '🥘',
        url: s.category === 'Drinks' ? 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80'
      }))].filter(item => {
        const title = (item.name || item.n || '').toLowerCase();
        return title.includes(fastSearch.toLowerCase());
      }).slice(0, 6)
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      n: name.trim(),
      c: category,
      p: numPrice,
      costPrice: numCost,
      d: description.trim() || `${name.trim()} served fresh at Safari Grill & Lounge.`,
      station,
      t: Number(prepTime) || 12,
      r: Number(rating) || 4.8,
      img: image,
      stockId: selectedStockId || null,
      packMultiplier: Number(packMultiplier) || 1,
      allergens,
      isSpecial,
      needsReview: mode === 'quick',
      e: category === 'Drinks' ? '🍹' : category === 'Burgers' ? '🍔' : category === 'Pizza' ? '🍕' : '🍽️'
    };

    onSave(payload, editItem?.id);
    onClose();
  };

  return (
    <div className="ov" onClick={onClose} style={{ zIndex: 1200, padding: '16px 12px' }}>
      <div
        className="sh"
        style={{
          width: 'min(1280px, 97vw)',
          maxWidth: 1280,
          height: '92vh',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 22,
          boxShadow: '0 25px 70px rgba(0,0,0,0.4)',
          background: 'var(--bg)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #093B2F 0%, #0E5A47 100%)',
            color: '#fff',
            borderBottom: 'none',
            padding: '16px 24px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.14)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 24
              }}
            >
              🍽️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#fff' }}>
                  {isEditing ? `Edit Menu Item: ${editItem.n}` : 'Create Menu Item (Finished Good Catalog)'}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff'
                  }}
                >
                  Full Width Workstation
                </span>
              </div>
              <small style={{ color: '#cfe8df', fontSize: 12.5, display: 'block', marginTop: 2 }}>
                Full detailed finished good photo upload, kitchen routing, profit margin analysis, and inventory stock link
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="modal-close-btn"
              style={{ color: '#fff', background: 'rgba(255,255,255,0.18)' }}
              onClick={onClose}
              title="Close form (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mode Switcher & Fast Setup Bar */}
        <div style={{ padding: '12px 24px 0', background: 'var(--card)', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            {/* Mode Switcher */}
            <div className="seg" style={{ margin: 0, maxWidth: 440 }}>
              <button
                type="button"
                className={mode === 'detailed' ? 'on' : ''}
                onClick={() => setMode('detailed')}
                style={{ fontWeight: 700 }}
              >
                🎨 Full Detailed Item (with Photo &amp; Specs)
              </button>
              <button
                type="button"
                className={mode === 'quick' ? 'on' : ''}
                onClick={() => setMode('quick')}
                style={{ fontWeight: 700 }}
              >
                ⚡ Quick Add (&lt;10s Rapid Setup)
              </button>
            </div>

            {/* Fast Auto-Fill Search Bar for rapid creation */}
            <div style={{ position: 'relative', flex: 1, minWidth: 280, maxWidth: 520 }}>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, fontSize: 14, color: 'var(--mut)', pointerEvents: 'none' }}>
                  ⚡
                </span>
                <input
                  type="text"
                  className="inp"
                  value={fastSearch}
                  onChange={e => setFastSearch(e.target.value)}
                  placeholder="Fast search dish template or stock item to auto-fill..."
                  style={{
                    margin: 0,
                    paddingLeft: 34,
                    paddingRight: 28,
                    fontSize: 12.5,
                    borderRadius: 99,
                    border: '1.5px solid var(--g)',
                    background: '#F0FDF4'
                  }}
                />
                {fastSearch && (
                  <button
                    type="button"
                    onClick={() => setFastSearch('')}
                    style={{ position: 'absolute', right: 10, fontSize: 12, color: 'var(--mut)' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Fast Autocomplete Dropdown */}
              {fastMatches.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--card)',
                    border: '1.5px solid var(--g)',
                    borderRadius: 14,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    zIndex: 2000,
                    marginTop: 6,
                    maxHeight: 240,
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, color: 'var(--mut)', background: 'var(--bg)' }}>
                    TAP TO INSTANTLY FILL ALL FIELDS:
                  </div>
                  {fastMatches.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyAutofill(item)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--line)',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#E5F2EE')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{item.emoji || '🍽️'}</span>
                        <div>
                          <b style={{ fontSize: 13, color: 'var(--tx)' }}>{item.name || item.n}</b>
                          <small style={{ display: 'block', fontSize: 11, color: 'var(--mut)' }}>
                            {item.category} · Station: {(item.station || 'grill').toUpperCase()}
                          </small>
                        </div>
                      </div>
                      <b style={{ color: 'var(--g)', fontSize: 12.5 }}>{fmt(item.price || item.p)}</b>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Auto-Fill Chips Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 10, WebkitOverflowScrolling: 'touch' }}>
            <small style={{ fontSize: 11, fontWeight: 700, color: 'var(--mut)', whiteSpace: 'nowrap' }}>
              ⚡ 1-Tap Presets:
            </small>
            {quickCatalogSuggestions.slice(0, 8).map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyAutofill(tpl)}
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 99,
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--tx)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>{tpl.emoji}</span>
                <span>{tpl.name.split(' ')[0]} {tpl.name.split(' ')[1] || ''}</span>
              </button>
            ))}
          </div>

          {autofillBanner && (
            <div
              style={{
                background: '#E5F2EE',
                border: '1.5px solid #0E5A47',
                borderRadius: 10,
                padding: '6px 12px',
                fontSize: 12,
                color: '#0E5A47',
                fontWeight: 700,
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{autofillBanner}</span>
              <button type="button" onClick={() => setAutofillBanner('')} style={{ color: '#0E5A47', fontWeight: 800 }}>
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >
          {mode === 'quick' ? (
            /* Quick Mode: Fast compact layout */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                  Item Name:
                </label>
                <input
                  type="text"
                  required
                  className="inp"
                  placeholder="e.g. Castle Lite 330ml or Peri-Peri Wings"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                  Category:
                </label>
                <select
                  className="inp"
                  value={category}
                  onChange={e => {
                    const c = e.target.value;
                    setCategory(c);
                    if (c === 'Drinks') setStation('bar');
                    else if (c === 'Pizza') setStation('pizza');
                    else if (c === 'Salads') setStation('salad');
                    else if (c === 'Desserts') setStation('dessert');
                    else setStation('grill');
                  }}
                >
                  {CATS.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>
                      {CAT_ICONS[c] || '🍽️'} {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                  Selling Price (TSh):
                </label>
                <input
                  type="number"
                  step="500"
                  required
                  className="inp"
                  style={{ fontWeight: 800, color: '#15803D' }}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                  Kitchen/Bar Station:
                </label>
                <select className="inp" value={station} onChange={e => setStation(e.target.value)}>
                  <option value="grill">🔥 Grill &amp; Charcoal</option>
                  <option value="fry">🍟 Fryer Station</option>
                  <option value="pizza">🍕 Pizza Stone Oven</option>
                  <option value="salad">🥗 Salad &amp; Cold Pass</option>
                  <option value="bar">🍹 Bar Station</option>
                  <option value="dessert">🧁 Dessert Station</option>
                </select>
              </div>
            </div>
          ) : (
            /* Full Detailed Mode: 2-Column Responsive Layout */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(340px, 420px) 1fr',
                gap: 24,
                alignItems: 'start'
              }}
            >
              {/* LEFT COLUMN: FINISHED GOOD PHOTO & LIVE PREVIEW */}
              <div
                style={{
                  background: 'var(--card)',
                  borderRadius: 18,
                  border: '1.5px solid var(--line)',
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 14, color: 'var(--tx)' }}>1. Finished Good Photo Studio</b>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--g)', background: '#E5F2EE', padding: '2px 8px', borderRadius: 99 }}>
                    Live POS Preview
                  </span>
                </div>

                {/* Live Card Preview */}
                <div
                  style={{
                    background: 'var(--bg)',
                    borderRadius: 16,
                    border: '1.5px solid var(--line)',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ position: 'relative', height: 160, background: '#1C1C1E' }}>
                    <img
                      src={image}
                      alt={name || 'Dish Preview'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 99,
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      ★ {rating}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        background: 'rgba(14,90,71,0.92)',
                        color: '#fff',
                        fontSize: 10.5,
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontWeight: 700,
                        letterSpacing: '0.4px'
                      }}
                    >
                      STATION: {station.toUpperCase()}
                    </span>
                    {selectedStockId && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          background: 'rgba(255,107,44,0.92)',
                          color: '#fff',
                          fontSize: 10.5,
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 700
                        }}
                      >
                        📦 LINKED STOCK
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--tx)', lineHeight: 1.25 }}>
                        {name || 'Serengeti Prime Ribeye Dish'}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--mut)', whiteSpace: 'nowrap' }}>
                        ⏱️ {prepTime}m
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                      <b style={{ color: 'var(--g)', fontSize: 16 }}>{fmt(numPrice)}</b>
                      <small style={{ fontSize: 11, color: 'var(--mut)' }}>
                        Cost: {fmt(numCost)} ({marginPct}% margin)
                      </small>
                    </div>

                    {allergens.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                        {allergens.map(al => (
                          <span
                            key={al}
                            style={{
                              fontSize: 9.5,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#FFEBE7',
                              color: '#C2410C',
                              fontWeight: 700
                            }}
                          >
                            {al}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload & Source Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <label
                      htmlFor="dish-photo-file-input"
                      className="btn sm o"
                      style={{
                        cursor: 'pointer',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        padding: '10px 14px'
                      }}
                    >
                      <span>📷</span>
                      <span>Upload Photo from Device</span>
                    </label>
                    <input
                      id="dish-photo-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {uploadError && (
                    <small style={{ color: '#EF4444', fontWeight: 600 }}>{uploadError}</small>
                  )}

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                      Or Image URL:
                    </label>
                    <input
                      type="url"
                      className="inp"
                      style={{ fontSize: 12, padding: '7px 10px', margin: 0 }}
                      placeholder="https://images.unsplash.com/..."
                      value={image}
                      onChange={e => setImage(e.target.value)}
                    />
                  </div>
                </div>

                {/* Presets Gallery with Instant Search & Category Filter */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <b style={{ fontSize: 12.5, color: 'var(--tx)' }}>High-Res Food &amp; Drink Presets</b>
                    <small style={{ color: 'var(--mut)', fontSize: 11 }}>{filteredPresets.length} presets</small>
                  </div>

                  {/* Preset Search Input */}
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <input
                      type="text"
                      className="inp"
                      value={presetSearch}
                      onChange={e => setPresetSearch(e.target.value)}
                      placeholder="🔍 Filter photo presets (e.g. beer, burger)..."
                      style={{ margin: 0, fontSize: 11.5, padding: '6px 10px', borderRadius: 8 }}
                    />
                    {presetSearch && (
                      <button
                        type="button"
                        onClick={() => setPresetSearch('')}
                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--mut)' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Preset Category Pills */}
                  <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
                    {['All', 'Grills', 'Burgers', 'Pizza', 'Drinks', 'Snacks', 'Pastas', 'Salads', 'Desserts'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPresetCatFilter(cat)}
                        style={{
                          fontSize: 10.5,
                          padding: '2px 8px',
                          borderRadius: 99,
                          border: presetCatFilter === cat ? '1px solid var(--g)' : '1px solid var(--line)',
                          background: presetCatFilter === cat ? '#E5F2EE' : 'var(--bg)',
                          color: presetCatFilter === cat ? 'var(--g)' : 'var(--tx)',
                          fontWeight: presetCatFilter === cat ? 700 : 500,
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Preset Grid Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 8,
                      maxHeight: 180,
                      overflowY: 'auto',
                      padding: 2
                    }}
                  >
                    {filteredPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImage(preset.url);
                          if (!name || name === 'Serengeti Prime Ribeye Dish') setName(preset.name);
                          setCategory(preset.category);
                          setStation(preset.station);
                        }}
                        style={{
                          padding: '6px',
                          borderRadius: 10,
                          border: image === preset.url ? '2px solid var(--g)' : '1px solid var(--line)',
                          background: image === preset.url ? '#E5F2EE' : 'var(--bg)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          textAlign: 'left'
                        }}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {preset.name}
                          </span>
                          <span style={{ fontSize: 9.5, color: 'var(--mut)' }}>{preset.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DETAILED DISH SPECIFICATIONS & LINKAGE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* SECTION 2: BASIC INFORMATION */}
                <div
                  style={{
                    background: 'var(--card)',
                    borderRadius: 18,
                    border: '1.5px solid var(--line)',
                    padding: 16
                  }}
                >
                  <label style={{ fontSize: 13.5, fontWeight: 800, display: 'block', marginBottom: 10, color: 'var(--tx)' }}>
                    2. Basic Information &amp; POS Classification
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                        Item Name (as displayed on menu &amp; receipts):
                      </label>
                      <input
                        type="text"
                        required
                        className="inp"
                        style={{ margin: 0, fontWeight: 700 }}
                        placeholder="e.g. Flame-Grilled Serengeti Ribeye 350g"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                        POS Category:
                      </label>
                      <select
                        className="inp"
                        style={{ margin: 0, fontWeight: 600 }}
                        value={category}
                        onChange={e => {
                          const c = e.target.value;
                          setCategory(c);
                          if (c === 'Drinks') setStation('bar');
                          else if (c === 'Pizza') setStation('pizza');
                          else if (c === 'Salads') setStation('salad');
                          else if (c === 'Desserts') setStation('dessert');
                          else setStation('grill');
                        }}
                      >
                        {CATS.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>
                            {CAT_ICONS[c] || '🍽️'} {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                      Dish Description (Ingredients, Cooking Technique, Flavor Profile):
                    </label>
                    <textarea
                      rows="2"
                      className="inp"
                      style={{ margin: 0, resize: 'vertical', fontSize: 13 }}
                      placeholder="e.g. Prime dry-aged Tanzanian beef ribeye grilled over aromatic charcoal, served with roasted garlic butter and kachumbari."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* SECTION 3: PRICING & PROFIT MARGIN ANALYSIS */}
                <div
                  style={{
                    background: 'var(--card)',
                    borderRadius: 18,
                    border: '1.5px solid var(--line)',
                    padding: 16
                  }}
                >
                  <label style={{ fontSize: 13.5, fontWeight: 800, display: 'block', marginBottom: 10, color: 'var(--tx)' }}>
                    3. Selling Price &amp; Profit Margin Analysis
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                        Selling Price (TSh):
                      </label>
                      <input
                        type="number"
                        step="500"
                        required
                        className="inp"
                        style={{ margin: 0, fontWeight: 800, color: '#15803D', fontSize: 16 }}
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                        Ingredient Cost (TSh):
                      </label>
                      <input
                        type="number"
                        step="500"
                        className="inp"
                        style={{ margin: 0, fontWeight: 700, fontSize: 16 }}
                        value={costPrice}
                        onChange={e => setCostPrice(e.target.value)}
                      />
                    </div>

                    <div
                      style={{
                        background: Number(marginPct) >= 55 ? '#E5F2EE' : Number(marginPct) >= 30 ? '#FEF3C7' : '#FEE2E2',
                        border: `1.5px solid ${Number(marginPct) >= 55 ? '#86EFAC' : Number(marginPct) >= 30 ? '#FDE68A' : '#FCA5A5'}`,
                        borderRadius: 14,
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: Number(marginPct) >= 55 ? 'var(--g)' : Number(marginPct) >= 30 ? '#92400E' : '#991B1B' }}>
                          Gross Profit / Margin
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: '#fff',
                            color: Number(marginPct) >= 55 ? '#15803D' : '#D97706'
                          }}
                        >
                          {marginPct}%
                        </span>
                      </div>
                      <b style={{ fontSize: 16, marginTop: 4, color: Number(marginPct) >= 55 ? 'var(--g)' : '#92400E' }}>
                        {fmt(grossProfit)}
                      </b>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: STATION ROUTING, PREP TIME & ALLERGENS */}
                <div
                  style={{
                    background: 'var(--card)',
                    borderRadius: 18,
                    border: '1.5px solid var(--line)',
                    padding: 16
                  }}
                >
                  <label style={{ fontSize: 13.5, fontWeight: 800, display: 'block', marginBottom: 10, color: 'var(--tx)' }}>
                    4. Kitchen Station Routing &amp; Dietary Compliance
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                        Kitchen Station:
                      </label>
                      <select
                        className="inp"
                        style={{ margin: 0, fontWeight: 600 }}
                        value={station}
                        onChange={e => setStation(e.target.value)}
                      >
                        <option value="grill">🔥 Grill &amp; Charcoal</option>
                        <option value="fry">🍟 Fryer Station</option>
                        <option value="pizza">🍕 Pizza Stone Oven</option>
                        <option value="salad">🥗 Salad &amp; Cold Pass</option>
                        <option value="bar">🍹 Bar Station</option>
                        <option value="dessert">🧁 Dessert Station</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                        Prep Time (Minutes):
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="inp"
                        style={{ margin: 0 }}
                        value={prepTime}
                        onChange={e => setPrepTime(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                        Star Rating (1-5):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        className="inp"
                        style={{ margin: 0 }}
                        value={rating}
                        onChange={e => setRating(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 6 }}>
                      Contains Dietary Allergens (Multi-Select):
                    </label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ALLERGEN_OPTIONS.map(al => {
                        const active = allergens.includes(al);
                        return (
                          <button
                            key={al}
                            type="button"
                            onClick={() => toggleAllergen(al)}
                            style={{
                              fontSize: 11.5,
                              padding: '5px 10px',
                              borderRadius: 8,
                              border: active ? '1.5px solid #FF5A43' : '1px solid var(--line)',
                              background: active ? '#FFEBE7' : 'var(--bg)',
                              color: active ? '#C2410C' : 'var(--tx)',
                              fontWeight: active ? 700 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {active ? '✓ ' : ''}{al}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SECTION 5: INVENTORY LINKAGE WITH SEARCH FILTER */}
                <div
                  style={{
                    background: 'var(--card)',
                    borderRadius: 18,
                    border: '1.5px solid var(--line)',
                    padding: 16
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                    <b style={{ fontSize: 13.5, color: 'var(--tx)' }}>5. Inventory Stock Linkage (Depletion on Sale)</b>
                    <span style={{ fontSize: 11, color: 'var(--mut)' }}>Direct link for drinks &amp; goods · No recipe BOM needed</span>
                  </div>

                  {/* Stock search filter input */}
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="text"
                      className="inp"
                      value={stockSearch}
                      onChange={e => setStockSearch(e.target.value)}
                      placeholder="🔍 Search stock items (e.g. soda, water, beef, beer)..."
                      style={{ margin: 0, fontSize: 12, padding: '7px 10px', borderRadius: 8 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                        Linked Stock Item ({filteredStock.length} matches):
                      </label>
                      <select
                        className="inp"
                        style={{ margin: 0, fontSize: 13 }}
                        value={selectedStockId}
                        onChange={e => {
                          const sid = e.target.value;
                          setSelectedStockId(sid);
                          const matched = stockList.find(s => s.id === sid);
                          if (matched && matched.unitCost) {
                            setCostPrice(String(matched.unitCost * (Number(packMultiplier) || 1)));
                          }
                        }}
                      >
                        <option value="">— Unlinked (Independent Kitchen Dish) —</option>
                        {filteredStock.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.baseUnit || s.uom}, Cost: {fmt(s.unitCost)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--mut)', display: 'block', marginBottom: 4 }}>
                        Pack Multiplier:
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="inp"
                        style={{ margin: 0 }}
                        value={packMultiplier}
                        onChange={e => {
                          const m = e.target.value;
                          setPackMultiplier(m);
                          const matched = stockList.find(s => s.id === selectedStockId);
                          if (matched && matched.unitCost) {
                            setCostPrice(String(matched.unitCost * (Number(m) || 1)));
                          }
                        }}
                        placeholder="1 (e.g. 6 for beer bucket)"
                      />
                    </div>
                  </div>

                  {selectedStockId && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '8px 12px',
                        background: '#FFF9ED',
                        border: '1px solid #FFE2A8',
                        borderRadius: 10,
                        fontSize: 11.5,
                        color: '#92400E',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <span>💡</span>
                      <span>
                        <b>Direct Link Active:</b> When sold at POS, this item deducts <b>{packMultiplier} unit(s)</b> from <b>{stockList.find(s => s.id === selectedStockId)?.name || 'Stock'}</b> at the selling location (Bar fridge / Kitchen).
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Sticky Modal Bottom Actions */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--line)',
              marginTop: 'auto',
              background: 'var(--bg)',
              position: 'sticky',
              bottom: 0,
              zIndex: 20
            }}
          >
            <button
              type="submit"
              className="btn o"
              style={{
                flex: 2,
                padding: '14px',
                fontSize: 15,
                fontWeight: 800,
                borderRadius: 14,
                boxShadow: '0 4px 16px rgba(255,107,44,0.35)'
              }}
            >
              {isEditing
                ? '✓ Save Changes to Menu'
                : mode === 'quick'
                ? '⚡ Put Live on POS (<10s)'
                : '✓ Create & Add Dish to POS'}
            </button>
            <button
              type="button"
              className="btn ghost"
              style={{ flex: 1, padding: '14px', borderRadius: 14, fontWeight: 700 }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── 2. Unified Menu Management Drawer / Dashboard ── */
export function MenuManagementView({
  menuList = [],
  stockList = [],
  outOfStockIds = [],
  onToggle86,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  actor = 'Chef'
}) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedStation, setSelectedStation] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtered menu list
  const filteredItems = menuList.filter(item => {
    const matchCat = selectedCat === 'All' || item.c === selectedCat;
    const matchStation = selectedStation === 'All' || (item.station || 'grill').toLowerCase() === selectedStation.toLowerCase();
    const matchQuery =
      item.n.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.d || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.station || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStation && matchQuery;
  });

  const totalCount = menuList.length;
  const count86 = outOfStockIds.length;
  const countNeedsReview = menuList.filter(m => m.needsReview).length;

  const handleDuplicate = (item) => {
    const copy = {
      ...item,
      n: `${item.n} (Copy)`,
      needsReview: false
    };
    onCreateItem(copy, actor);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top Banner & KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <div className="card" style={{ background: '#E5F2EE', border: '1.5px solid rgba(14,90,71,0.2)' }}>
          <small style={{ color: 'var(--g)', fontWeight: 700 }}>Total Catalog Items</small>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--g)' }}>{totalCount} dishes</div>
          <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>Active on POS &amp; Mobile Web</small>
        </div>

        <div className="card" style={{ background: count86 > 0 ? '#FEF2F2' : '#F0FDF4', border: `1.5px solid ${count86 > 0 ? '#FCA5A5' : '#86EFAC'}` }}>
          <small style={{ color: count86 > 0 ? '#DC2626' : '#166534', fontWeight: 700 }}>86-List / Out of Stock</small>
          <div style={{ fontSize: 24, fontWeight: 800, color: count86 > 0 ? '#DC2626' : '#166534' }}>{count86} items</div>
          <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>Hidden from customer ordering</small>
        </div>

        <div className="card" style={{ background: countNeedsReview > 0 ? '#FFF9ED' : '#F8FAFC', border: `1.5px solid ${countNeedsReview > 0 ? '#FFE2A8' : '#E2E8F0'}` }}>
          <small style={{ color: countNeedsReview > 0 ? '#B45309' : '#64748B', fontWeight: 700 }}>Awaiting Stock Review</small>
          <div style={{ fontSize: 24, fontWeight: 800, color: countNeedsReview > 0 ? '#B45309' : '#0F172A' }}>{countNeedsReview} items</div>
          <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>Added on-site under 10s</small>
        </div>
      </div>

      {/* Main Menu Management Toolbar */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div>
            <b style={{ fontSize: 16 }}>Safari Grill Finished Goods &amp; Menu Catalog</b>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--mut)' }}>
              Manage dishes, finished goods imagery, prices, 86 availability, and kitchen station routing
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn sm o"
              onClick={() => {
                setEditingItem(null);
                setShowCreateModal(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>+</span>
              <span>Create New Dish / Drink</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input
              type="text"
              placeholder="🔍 Search dishes, ingredients, stations..."
              className="inp"
              style={{ margin: 0, padding: '8px 12px', fontSize: 13 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 8, top: 9, color: 'var(--mut)', fontSize: 12 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                style={{
                  fontSize: 11.5,
                  padding: '5px 9px',
                  borderRadius: 8,
                  fontWeight: selectedCat === c ? 800 : 500,
                  background: selectedCat === c ? 'var(--g)' : 'var(--bg)',
                  color: selectedCat === c ? '#fff' : 'var(--tx)',
                  border: '1px solid var(--line)',
                  cursor: 'pointer'
                }}
              >
                {CAT_ICONS[c] || ''} {c}
              </button>
            ))}
          </div>

          {/* Station Filter Dropdown */}
          <select
            className="inp"
            style={{ margin: 0, width: 'auto', fontSize: 12.5, padding: '6px 10px' }}
            value={selectedStation}
            onChange={e => setSelectedStation(e.target.value)}
          >
            <option value="All">All Stations ▾</option>
            <option value="grill">🔥 Grill &amp; Charcoal</option>
            <option value="fry">🍟 Fry Station</option>
            <option value="pizza">🍕 Pizza Oven</option>
            <option value="salad">🥗 Salad Bar</option>
            <option value="bar">🍹 Drink Bar</option>
            <option value="dessert">🧁 Dessert Pass</option>
          </select>
        </div>

        {/* Dishes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filteredItems.map(item => {
            const is86 = outOfStockIds.includes(item.id);
            const linkedStock = stockList.find(s => s.id === item.stockId);

            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--card)',
                  borderRadius: 16,
                  border: is86 ? '1.5px solid #FCA5A5' : item.needsReview ? '1.5px solid #FCD34D' : '1px solid var(--line)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  opacity: is86 ? 0.75 : 1
                }}
              >
                {/* Image Banner */}
                <div style={{ position: 'relative', height: 130 }}>
                  <img
                    src={item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
                    alt={item.n}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {is86 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: '#DC2626',
                        color: '#fff',
                        fontSize: 10,
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontWeight: 800
                      }}
                    >
                      86'D / SOLD OUT
                    </span>
                  )}
                  {item.needsReview && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: is86 ? 110 : 8,
                        background: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FCD34D',
                        fontSize: 10,
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontWeight: 800
                      }}
                    >
                      ⚠️ Needs Review
                    </span>
                  )}
                  {item.packMultiplier && item.packMultiplier > 1 && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        background: 'rgba(30,58,138,0.85)',
                        color: '#fff',
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 6,
                        fontWeight: 800
                      }}
                    >
                      📦 {item.packMultiplier}x Pack
                    </span>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 99
                    }}
                  >
                    ★ {item.r || '4.8'}
                  </span>
                </div>

                {/* Body Content */}
                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                    <div>
                      <b style={{ fontSize: 14.5 }}>{item.n}</b>
                      <div style={{ fontSize: 11.5, color: 'var(--mut)', marginTop: 2 }}>
                        {item.c} · Station: <b>{(item.station || 'grill').toUpperCase()}</b> · {item.t || 12} mins
                      </div>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--g)', whiteSpace: 'nowrap' }}>
                      {fmt(item.p)}
                    </span>
                  </div>

                  {item.d && (
                    <p style={{ margin: '6px 0', fontSize: 12, color: 'var(--mut)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.d}
                    </p>
                  )}

                  {/* Stock Link Feedback */}
                  <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--line)', fontSize: 11.5 }}>
                    {linkedStock ? (
                      <span style={{ color: 'var(--g)', fontWeight: 600 }}>
                        🔗 Linked: {linkedStock.name} ({linkedStock.baseUnit || linkedStock.uom})
                      </span>
                    ) : item.c === 'Drinks' ? (
                      <span style={{ color: '#B45309', fontWeight: 600 }}>
                        ⚠️ Drink unlinked to stock
                      </span>
                    ) : (
                      <span style={{ color: 'var(--mut)' }}>
                        🥘 Kitchen Made (Issued Stock)
                      </span>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button
                      type="button"
                      className={`btn sm ${is86 ? 'o' : 'ghost'}`}
                      style={{
                        flex: 1,
                        fontSize: 11.5,
                        padding: '6px 8px',
                        borderColor: is86 ? '#15803D' : '#FCA5A5',
                        color: is86 ? '#fff' : '#DC2626'
                      }}
                      onClick={() => onToggle86(item.id, actor)}
                    >
                      {is86 ? '🟢 Restore Item' : '🔴 86 (Sold Out)'}
                    </button>
                    <button
                      type="button"
                      className="btn sm ghost"
                      style={{ fontSize: 11.5, padding: '6px 8px' }}
                      onClick={() => {
                        setEditingItem(item);
                        setShowCreateModal(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn sm ghost"
                      style={{ fontSize: 11.5, padding: '6px 8px' }}
                      title="Duplicate dish into new item"
                      onClick={() => handleDuplicate(item)}
                    >
                      📋 Copy
                    </button>
                    <button
                      type="button"
                      className="btn sm ghost"
                      style={{ fontSize: 11.5, padding: '6px 8px', color: '#DC2626' }}
                      title="Delete item from menu"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${item.n}"?`)) {
                          onDeleteItem(item.id, actor);
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--mut)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
            <b>No dishes found matching criteria</b>
            <p style={{ margin: '4px 0 0', fontSize: 13 }}>Try clearing filters or click "+ Create New Dish" to add one.</p>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      <MenuItemDetailModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
        stockList={stockList}
        actor={actor}
        onSave={(data, id) => {
          if (id) {
            onUpdateItem(id, data, actor);
          } else {
            onCreateItem(data, actor);
          }
        }}
      />
    </div>
  );
}

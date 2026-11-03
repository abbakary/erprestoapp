// RestoERP Data Engine - Safari Grill & Lounge
// Full SRS v1.1 Data Schema & Seed Entities

export const fmt = n => 'TSh ' + Math.round(n || 0).toLocaleString('en-US');
export const fmtNum = n => Number(n || 0).toLocaleString('en-US');
export const fmtTime = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const fmtDateTime = t => new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const ST = ['placed', 'accepted', 'preparing', 'ready', 'served', 'billreq', 'paid', 'closed'];

export const LB = {
  placed: 'Placed',
  accepted: 'Accepted by Kitchen',
  preparing: 'Preparing in Kitchen',
  ready: 'Ready at Pass',
  served: 'Served at Table',
  billreq: 'Bill Requested',
  paid: 'Paid & Verified',
  closed: 'Closed & Archived',
  cancelled: 'Cancelled'
};

export const ST_COLORS = {
  placed: '#FF9500',
  accepted: '#007AFF',
  preparing: '#5856D6',
  ready: '#34C759',
  served: '#0E5A47',
  billreq: '#FF6B2C',
  paid: '#15803D',
  closed: '#8E8E93',
  cancelled: '#FF3B30'
};

export const SITES = [
  { id: 'masaki', name: 'Safari Grill & Lounge · Masaki', type: 'Flagship Restaurant', address: 'Plot 42, Haile Selassie Rd, Masaki, Dar es Salaam', tables: 6, covers: 22, gm: 'Rehema Said' },
  { id: 'oysterbay', name: 'Safari Grill Express · Oysterbay', type: 'Kiosk & Takeaway', address: 'Oysterbay Shopping Village, Dar es Salaam', tables: 3, covers: 8, gm: 'Hassan Mwinyi' },
  { id: 'city', name: 'Safari Grill & Lounge · City Centre', type: 'Branch Restaurant', address: 'Samora Avenue, City Centre, Dar es Salaam', tables: 5, covers: 18, gm: 'Fatma Juma' }
];

export const CATS = ['All', 'Snacks', 'Pizza', 'Burgers', 'Grills', 'Pastas', 'Salads', 'Drinks', 'Desserts'];

export const CAT_ICONS = {
  All: '🍽️',
  Snacks: '🍟',
  Pizza: '🍕',
  Burgers: '🍔',
  Grills: '🥩',
  Pastas: '🍝',
  Salads: '🥗',
  Drinks: '🍹',
  Desserts: '🧁'
};

export const MENU = [
  { id: 1, n: 'Roasted Chicken', e: '🍗', p: 18000, c: 'Grills', t: 15, r: 4.8, station: 'grill', allergens: ['Garlic'], d: 'Half chicken roasted with lemon, garlic, rosemary and fresh herbs. Served with side sauce.', img: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&auto=format&fit=crop&q=80' },
  { id: 2, n: 'Mishkaki Platter', e: '🍢', p: 16000, c: 'Grills', t: 12, r: 4.7, station: 'grill', allergens: ['Chilli'], d: 'Tender marinated beef skewers fire-grilled on charcoal with spicy kachumbari salad and lemon.', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80' },
  { id: 3, n: 'Grilled Tilapia', e: '🐟', p: 22000, c: 'Grills', t: 20, r: 4.6, station: 'grill', allergens: ['Fish'], d: 'Whole fresh Lake Victoria tilapia in rich Swahili coconut-tamarind sauce, served with fragrant rice or ugali.', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80' },
  { id: 4, n: 'Steakhouse Burger', e: '🍔', p: 15000, c: 'Burgers', t: 10, r: 4.7, station: 'grill', allergens: ['Gluten', 'Dairy'], d: '200g prime beef patty, mature cheddar, caramelised onions, pickles, house smoked BBQ sauce on brioche.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' },
  { id: 5, n: 'Crispy Chicken Burger', e: '🥪', p: 13000, c: 'Burgers', t: 10, r: 4.5, station: 'fry', allergens: ['Gluten', 'Dairy'], d: 'Golden buttermilk fried chicken breast, pickled jalapeños, purple cabbage slaw, tangy garlic aioli.', img: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&auto=format&fit=crop&q=80' },
  { id: 6, n: 'Masala Chips', e: '🍟', p: 6000, c: 'Snacks', t: 8, r: 4.6, station: 'sides', allergens: [], d: 'Crispy hand-cut fries tossed in house spicy tamarind masala, chopped cilantro and fresh lime.', img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80' },
  { id: 7, n: 'Pilau', e: '🍛', p: 9000, c: 'Grills', t: 10, r: 4.8, station: 'sides', allergens: [], d: 'Authentic spiced East African basmati rice cooked slowly in rich aromatic beef broth with whole spices.', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
  { id: 8, n: 'Fresh Mango Juice', e: '🥭', p: 4500, c: 'Drinks', t: 3, r: 4.9, station: 'bar', allergens: [], d: 'Cold-pressed ripe Kilombero mangoes made to order. 100% pure fruit, no added sugar.', img: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80' },
  { id: 9, n: 'Passion Cooler', e: '🍹', p: 5000, c: 'Drinks', t: 3, r: 4.6, station: 'bar', allergens: [], d: 'Fresh local passion fruit pulp shaken with mint leaves, crushed ice and sparkling lime.', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80' },
  { id: 10, n: 'Spiced Chai', e: '☕', p: 2500, c: 'Drinks', t: 4, r: 4.7, station: 'bar', allergens: ['Dairy'], d: 'Fresh whole cow milk simmered gently with crushed cardamom, ginger, cloves and premium Tanzanian tea leaves.', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80' },
  { id: 11, n: 'Chocolate Lava', e: '🍫', p: 8000, c: 'Desserts', t: 9, r: 4.8, station: 'dessert', allergens: ['Gluten', 'Dairy', 'Eggs'], d: 'Warm dark Belgian chocolate cake with a molten centre, served with vanilla bean whip.', img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80' },
  { id: 12, n: 'Coconut Tart', e: '🥥', p: 7000, c: 'Desserts', t: 5, r: 4.4, station: 'dessert', allergens: ['Gluten', 'Dairy', 'Eggs'], d: 'Caramelised Zanzibar coconut custard baked into a crisp butter pastry shell.', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80' },
  { id: 13, n: 'Kilimanjaro Mineral Water', e: '💧', p: 2000, c: 'Drinks', t: 1, r: 4.9, station: 'bar', allergens: [], stockId: 'stk_water', packMultiplier: 1, d: '500ml chilled natural mineral water bottled at the foot of Mount Kilimanjaro.', img: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80' },
  { id: 14, n: 'Coca-Cola Zero 330ml', e: '🥤', p: 3000, c: 'Drinks', t: 1, r: 4.7, station: 'bar', allergens: [], stockId: 'stk_coke', packMultiplier: 1, d: 'Cold canned Coca-Cola Zero Sugar served with fresh lemon slice and ice.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80' },
  { id: 15, n: 'Safari Premium Lager 500ml', e: '🍺', p: 5000, c: 'Drinks', t: 1, r: 4.8, station: 'bar', allergens: ['Gluten'], stockId: 'stk_beer', packMultiplier: 1, d: 'Tanzania’s iconic full-bodied cold lager brewed with malted barley.', img: 'https://images.unsplash.com/photo-1608270191953-6254425785a3?w=500&auto=format&fit=crop&q=80' },
  // Image 1 Special Menu & POS items
  { id: 16, n: 'Chicken Biryani', e: '🍲', p: 20210, c: 'Grills', t: 15, r: 4.9, station: 'grill', allergens: [], d: 'Fragrant saffron basmati rice layered with tender marinated chicken, crisp fried onions, aromatic spices and cool mint raita.', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80', featured: true },
  { id: 17, n: 'Cheese Burger', e: '🍔', p: 18230, c: 'Burgers', t: 10, r: 4.8, station: 'grill', allergens: ['Gluten', 'Dairy'], d: 'Prime beef patty grilled over coals, melted aged cheddar, crisp lettuce, red onion and garlic aioli on toasted brioche.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', featured: true },
  { id: 18, n: 'Mozzarella Pizza', e: '🍕', p: 35630, c: 'Pizza', t: 12, r: 4.9, station: 'grill', allergens: ['Gluten', 'Dairy'], d: 'Stone-baked artisan crust layered with San Marzano tomato sugo, molten fresh mozzarella, basil and virgin olive oil.', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', featured: true },
  { id: 19, n: 'Milky Banana Juice', e: '🥤', p: 20170, c: 'Drinks', t: 3, r: 4.7, station: 'bar', allergens: ['Dairy'], d: 'Delicious chilled milk smoothie with sweet local bananas, wild honey, vanilla and crushed roasted almonds.', img: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80', featured: true },
  { id: 20, n: 'Chicken Nuggets', e: '🍗', p: 18230, c: 'Snacks', t: 8, r: 4.7, station: 'fry', allergens: ['Gluten'], d: 'Tender chicken breast nuggets coated in crunchy herb panko crumb, fried golden and served with honey mustard.', img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80', featured: true },
  { id: 21, n: 'Veg Sandwich', e: '🥪', p: 35230, c: 'Snacks', t: 7, r: 4.6, station: 'sides', allergens: ['Gluten'], d: 'Multigrain panini packed with grilled courgettes, ripe tomatoes, bell peppers, fresh mozzarella and basil pesto.', img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80', featured: true },
  { id: 22, n: 'Veggie Pakora', e: '🥟', p: 19220, c: 'Snacks', t: 8, r: 4.8, station: 'fry', allergens: [], d: 'Crisp onion and spinach fritters tossed in spiced gram flour batter, fried until crunchy with tamarind dip.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80', featured: true },
  { id: 23, n: 'Tandoori Paneer', e: '🍢', p: 25130, c: 'Grills', t: 10, r: 4.8, station: 'grill', allergens: ['Dairy'], d: 'Skewered cottage cheese cubes char-grilled with capsicum and red onions in yogurt tandoori marinade.', img: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80', featured: true },
  { id: 24, n: 'Italian Pasta', e: '🍝', p: 20360, c: 'Pastas', t: 12, r: 4.8, station: 'sides', allergens: ['Gluten', 'Dairy'], d: 'Handmade tagliatelle spun in slow-simmered rich tomato basil sauce, parmigiano reggiano and extra virgin olive oil.', img: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=500&auto=format&fit=crop&q=80' },
  { id: 25, n: 'Garden Fresh Salad', e: '🥗', p: 14500, c: 'Salads', t: 5, r: 4.7, station: 'sides', allergens: [], d: 'Crispy romaine lettuce, baby spinach, avocado, cherry tomatoes, kalamata olives and lemon oregano vinaigrette.', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80' },
  { id: 26, n: 'Pad Thai with Shrimp', e: '🍤', p: 24000, c: 'Pastas', t: 10, r: 4.9, station: 'grill', allergens: ['Shellfish', 'Peanuts'], d: 'Stir-fried noodles with prawns, bean sprouts, peanuts and lime.', img: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500&auto=format&fit=crop&q=80' },
  { id: 27, n: 'Special Beef Steak', e: '🥩', p: 32000, c: 'Grills', t: 15, r: 4.8, station: 'grill', allergens: [], d: 'Tender prime cut beef steak flame-grilled with herb butter.', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
  { id: 28, n: 'New York Cheese Pizza', e: '🍕', p: 28000, c: 'Pizza', t: 12, r: 4.9, station: 'grill', allergens: ['Gluten', 'Dairy'], d: 'Crisp artisan crust with rich marinara and molten mozzarella.', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
  { id: 29, n: 'Matcha', e: '🍵', p: 7500, c: 'Drinks', t: 3, r: 4.7, station: 'bar', allergens: ['Dairy'], d: 'Ceremonial grade green tea whisked with steamed milk.', img: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80' },
  { id: 30, n: 'Coca Cola', e: '🥤', p: 2500, c: 'Drinks', t: 1, r: 4.8, station: 'bar', allergens: [], stockId: 'stk_soda', packMultiplier: 1, d: '250 ml chilled classic glass bottle Coca Cola.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80' },
  // Direct Link Drinks & Pack Multipliers (Design Requirement 3: Selling at POS and tracking)
  { id: 31, n: 'Bucket of 6 Beers (Safari)', e: '🍻', p: 27000, c: 'Drinks', t: 1, r: 4.9, station: 'bar', allergens: ['Gluten'], stockId: 'stk_beer', packMultiplier: 6, d: 'Bucket of 6 chilled Safari Premium Lagers on ice. Deducts 6 bottles directly from bar stock.', img: 'https://images.unsplash.com/photo-1608270191953-6254425785a3?w=500&auto=format&fit=crop&q=80', featured: true },
  { id: 32, n: 'Soda 500ml (Coke/Fanta/Sprite)', e: '🥤', p: 2000, c: 'Drinks', t: 1, r: 4.8, station: 'bar', allergens: [], stockId: 'stk_soda', packMultiplier: 1, d: 'Chilled 500ml soda bottle. Choose Coke, Fanta Orange, or Sprite.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80' },
  { id: 33, n: 'Water 500ml (Carton of 12)', e: '💧', p: 20000, c: 'Drinks', t: 1, r: 4.9, station: 'bar', allergens: [], stockId: 'stk_water', packMultiplier: 12, d: 'Full sealed carton of 12 Kilimanjaro mineral water bottles.', img: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80' },
  { id: 34, n: 'Castle Lite 330ml', e: '🍺', p: 5000, c: 'Drinks', t: 1, r: 4.8, station: 'bar', allergens: ['Gluten'], stockId: 'stk_castle', packMultiplier: 1, d: 'Extra cold Castle Lite 330ml bottle.', img: 'https://images.unsplash.com/photo-1608270191953-6254425785a3?w=500&auto=format&fit=crop&q=80' },
  { id: 35, n: 'Red Bull Energy Drink', e: '⚡', p: 7000, c: 'Drinks', t: 1, r: 4.8, station: 'bar', allergens: [], stockId: 'stk_redbull', packMultiplier: 1, d: 'Vitalizes body and mind. 250ml chilled can.', img: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80' }
];

export const M = Object.fromEntries(MENU.map(m => [m.id, m]));

export const TABLES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Takeaway'];
export const TW = { T1: 'w1', T2: 'w1', T3: 'w1', T4: 'w2', T5: 'w2', T6: 'w2', Takeaway: 'w1' };
export const SEATS = { T1: 2, T2: 4, T3: 4, T4: 6, T5: 2, T6: 4, Takeaway: 0 };

// Category Presets (Design Requirement 5: Fast registry of items with auto-fill)
export const CATEGORY_PRESETS = {
  soda: {
    label: 'Soda / Soft Drink',
    cat: 'Drinks',
    itemType: 'direct_resale',
    baseUnit: 'bottle',
    trackStock: true,
    directSale: true,
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Crate', factor: 24 }
    ],
    defaultPurchaseUnit: 'Crate',
    returnable: true,
    defaultMarkup: 100, // 100% markup
    suggestedSupplierId: 'sup_coca',
    icon: '🥤',
    sampleCost: 1000,
    sampleSellingPrice: 2000
  },
  water: {
    label: 'Mineral Water',
    cat: 'Drinks',
    itemType: 'direct_resale',
    baseUnit: 'bottle',
    trackStock: true,
    directSale: true,
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Carton', factor: 12 },
      { name: 'Pack (24)', factor: 24 }
    ],
    defaultPurchaseUnit: 'Carton',
    returnable: false,
    defaultMarkup: 150,
    suggestedSupplierId: 'sup_coca',
    icon: '💧',
    sampleCost: 800,
    sampleSellingPrice: 2000
  },
  beer: {
    label: 'Beer & Cider',
    cat: 'Drinks',
    itemType: 'direct_resale',
    baseUnit: 'bottle',
    trackStock: true,
    directSale: true,
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Crate (20)', factor: 20 },
      { name: 'Crate (24)', factor: 24 }
    ],
    defaultPurchaseUnit: 'Crate (20)',
    returnable: true,
    defaultMarkup: 100,
    suggestedSupplierId: 'sup_serengeti',
    icon: '🍺',
    sampleCost: 2500,
    sampleSellingPrice: 5000
  },
  energy: {
    label: 'Energy Drink / Juice Can',
    cat: 'Drinks',
    itemType: 'direct_resale',
    baseUnit: 'can',
    trackStock: true,
    directSale: true,
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Pack (6)', factor: 6 },
      { name: 'Carton (24)', factor: 24 }
    ],
    defaultPurchaseUnit: 'Carton (24)',
    returnable: false,
    defaultMarkup: 100,
    suggestedSupplierId: 'sup_3',
    icon: '⚡',
    sampleCost: 3500,
    sampleSellingPrice: 7000
  },
  spirits: {
    label: 'Spirits & Wine',
    cat: 'Drinks',
    itemType: 'direct_resale',
    baseUnit: 'bottle',
    trackStock: true,
    directSale: true,
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Case (6)', factor: 6 },
      { name: 'Case (12)', factor: 12 }
    ],
    defaultPurchaseUnit: 'Case (6)',
    returnable: false,
    defaultMarkup: 120,
    suggestedSupplierId: 'sup_serengeti',
    icon: '🍾',
    sampleCost: 15000,
    sampleSellingPrice: 35000
  },
  kitchen_simple: {
    label: 'Kitchen Food (Option A: Simple Issue)',
    cat: 'Grills',
    itemType: 'kitchen_simple',
    baseUnit: 'portion',
    trackStock: false,
    directSale: false,
    trackingMode: 'simple_issue',
    purchaseUnits: [{ name: 'Portion', factor: 1 }],
    defaultPurchaseUnit: 'Portion',
    icon: '🍽️',
    sampleCost: 6000,
    sampleSellingPrice: 15000
  },
  recipe_dish: {
    label: 'Recipe Dish (Option B: BOM Precise)',
    cat: 'Grills',
    itemType: 'recipe_dish',
    baseUnit: 'portion',
    trackStock: false,
    directSale: false,
    trackingMode: 'recipe_bom',
    purchaseUnits: [{ name: 'Portion', factor: 1 }],
    defaultPurchaseUnit: 'Portion',
    icon: '🥘',
    sampleCost: 8000,
    sampleSellingPrice: 20000
  },
  raw_produce: {
    label: 'Kitchen Raw Ingredient',
    cat: 'Produce',
    itemType: 'raw_material',
    baseUnit: 'kg',
    trackStock: true,
    directSale: false,
    purchaseUnits: [
      { name: 'Kg', factor: 1 },
      { name: 'Sack (25kg)', factor: 25 },
      { name: 'Sack (50kg)', factor: 50 },
      { name: 'Box (10kg)', factor: 10 }
    ],
    defaultPurchaseUnit: 'Sack (25kg)',
    suggestedSupplierId: 'sup_2',
    icon: '🥔',
    sampleCost: 2000,
    sampleSellingPrice: null
  }
};

// Recipe BOM Mapping for Theoretical Stock Depletion (INV-04)
export const RECIPES = {
  1: [{ stockId: 'stk_chicken', qty: 0.5 }, { stockId: 'stk_spices', qty: 0.04 }, { stockId: 'stk_oil', qty: 0.05 }],
  2: [{ stockId: 'stk_beef', qty: 0.35 }, { stockId: 'stk_spices', qty: 0.05 }],
  3: [{ stockId: 'stk_tilapia', qty: 1 }, { stockId: 'stk_rice', qty: 0.2 }, { stockId: 'stk_spices', qty: 0.03 }],
  4: [{ stockId: 'stk_beef', qty: 0.2 }, { stockId: 'stk_buns', qty: 1 }, { stockId: 'stk_cheese', qty: 0.05 }],
  5: [{ stockId: 'stk_chicken', qty: 0.25 }, { stockId: 'stk_buns', qty: 1 }, { stockId: 'stk_oil', qty: 0.08 }],
  6: [{ stockId: 'stk_potatoes', qty: 0.4 }, { stockId: 'stk_oil', qty: 0.06 }],
  7: [{ stockId: 'stk_rice', qty: 0.25 }, { stockId: 'stk_beef', qty: 0.1 }, { stockId: 'stk_spices', qty: 0.03 }],
  8: [{ stockId: 'stk_mangoes', qty: 0.4 }],
  9: [{ stockId: 'stk_passion', qty: 0.25 }],
  10: [{ stockId: 'stk_milk', qty: 0.2 }, { stockId: 'stk_spices', qty: 0.02 }],
  11: [{ stockId: 'stk_chocolate', qty: 0.15 }],
  12: [{ stockId: 'stk_coconut', qty: 0.1 }]
};

export const STOCK_ITEMS = [
  // Raw materials (Kitchen / Food Prep) - Option A / Option B
  {
    id: 'stk_chicken',
    name: 'Fresh Whole Chicken',
    cat: 'Poultry',
    uom: 'kg',
    baseUnit: 'kg',
    purchaseUnits: [{ name: 'Single/Kg', factor: 1 }, { name: 'Box (10kg)', factor: 10 }, { name: 'Crate (20kg)', factor: 20 }],
    defaultPurchaseUnit: 'Box (10kg)',
    lastPurchaseUnit: 'Box (10kg)',
    onHand: 42.5,
    storeQty: 25.0,
    kitchenQty: 17.5,
    barQty: 0,
    par: 50,
    reorder: 20,
    unitCost: 8500,
    sellingPrice: null,
    itemType: 'raw_material',
    trackingMode: 'simple_issue', // Option A simple kitchen issuing
    loc: 'Cold Room',
    theoretical: 42.5
  },
  {
    id: 'stk_beef',
    name: 'Prime Beef Tenderloin',
    cat: 'Meat',
    uom: 'kg',
    baseUnit: 'kg',
    purchaseUnits: [{ name: 'Single/Kg', factor: 1 }, { name: 'Quarter (20kg)', factor: 20 }],
    defaultPurchaseUnit: 'Single/Kg',
    lastPurchaseUnit: 'Single/Kg',
    onHand: 28.0,
    storeQty: 18.0,
    kitchenQty: 10.0,
    barQty: 0,
    par: 35,
    reorder: 15,
    unitCost: 14000,
    sellingPrice: null,
    itemType: 'raw_material',
    trackingMode: 'recipe_bom', // Option B recipe tracking
    loc: 'Meat Freezer',
    theoretical: 28.0
  },
  {
    id: 'stk_tilapia',
    name: 'Fresh Tilapia (Whole)',
    cat: 'Seafood',
    uom: 'pcs',
    baseUnit: 'pcs',
    purchaseUnits: [{ name: 'Single', factor: 1 }, { name: 'Crate (25pcs)', factor: 25 }],
    defaultPurchaseUnit: 'Crate (25pcs)',
    lastPurchaseUnit: 'Crate (25pcs)',
    onHand: 24,
    storeQty: 16,
    kitchenQty: 8,
    barQty: 0,
    par: 30,
    reorder: 10,
    unitCost: 9500,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Fish Cooler',
    theoretical: 24
  },
  {
    id: 'stk_potatoes',
    name: 'Mbeya Red Potatoes',
    cat: 'Produce',
    uom: 'kg',
    baseUnit: 'kg',
    purchaseUnits: [{ name: 'Single/Kg', factor: 1 }, { name: 'Sack (50kg)', factor: 50 }, { name: 'Sack (25kg)', factor: 25 }],
    defaultPurchaseUnit: 'Sack (50kg)',
    lastPurchaseUnit: 'Sack (50kg)',
    onHand: 85.0,
    storeQty: 60.0,
    kitchenQty: 25.0,
    barQty: 0,
    par: 100,
    reorder: 40,
    unitCost: 1800,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Dry Store',
    theoretical: 85.0
  },
  {
    id: 'stk_rice',
    name: 'Kyela Basmati Rice',
    cat: 'Dry Goods',
    uom: 'kg',
    baseUnit: 'kg',
    purchaseUnits: [{ name: 'Single/Kg', factor: 1 }, { name: 'Bag (25kg)', factor: 25 }, { name: 'Bag (50kg)', factor: 50 }],
    defaultPurchaseUnit: 'Bag (25kg)',
    lastPurchaseUnit: 'Bag (25kg)',
    onHand: 62.0,
    storeQty: 45.0,
    kitchenQty: 17.0,
    barQty: 0,
    par: 75,
    reorder: 25,
    unitCost: 3200,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Dry Store',
    theoretical: 62.0
  },
  {
    id: 'stk_buns',
    name: 'Brioche Burger Buns',
    cat: 'Bakery',
    uom: 'pcs',
    baseUnit: 'pcs',
    purchaseUnits: [{ name: 'Single', factor: 1 }, { name: 'Tray (12)', factor: 12 }, { name: 'Crate (24)', factor: 24 }],
    defaultPurchaseUnit: 'Tray (12)',
    lastPurchaseUnit: 'Tray (12)',
    onHand: 55,
    storeQty: 30,
    kitchenQty: 25,
    barQty: 0,
    par: 80,
    reorder: 30,
    unitCost: 900,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Kitchen Pass',
    theoretical: 55
  },
  {
    id: 'stk_cheese',
    name: 'Cheddar Cheese Blocks',
    cat: 'Dairy',
    uom: 'kg',
    baseUnit: 'kg',
    purchaseUnits: [{ name: 'Single/Kg', factor: 1 }, { name: 'Block (2.5kg)', factor: 2.5 }],
    defaultPurchaseUnit: 'Block (2.5kg)',
    lastPurchaseUnit: 'Block (2.5kg)',
    onHand: 8.5,
    storeQty: 5.5,
    kitchenQty: 3.0,
    barQty: 0,
    par: 12,
    reorder: 5,
    unitCost: 22000,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Dairy Fridge',
    theoretical: 8.5
  },
  {
    id: 'stk_mangoes',
    name: 'Kilombero Mangoes',
    cat: 'Produce',
    uom: 'kg',
    baseUnit: 'kg',
    purchaseUnits: [{ name: 'Single/Kg', factor: 1 }, { name: 'Crate (20kg)', factor: 20 }],
    defaultPurchaseUnit: 'Crate (20kg)',
    lastPurchaseUnit: 'Crate (20kg)',
    onHand: 34.0,
    storeQty: 20.0,
    kitchenQty: 0,
    barQty: 14.0,
    par: 40,
    reorder: 15,
    unitCost: 2500,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Fruit Chiller',
    theoretical: 34.0
  },
  {
    id: 'stk_passion',
    name: 'Lushoto Passion Fruit',
    cat: 'Produce',
    uom: 'kg',
    baseUnit: 'kg',
    purchaseUnits: [{ name: 'Single/Kg', factor: 1 }, { name: 'Crate (15kg)', factor: 15 }],
    defaultPurchaseUnit: 'Crate (15kg)',
    lastPurchaseUnit: 'Crate (15kg)',
    onHand: 16.0,
    storeQty: 10.0,
    kitchenQty: 0,
    barQty: 6.0,
    par: 20,
    reorder: 8,
    unitCost: 4000,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Fruit Chiller',
    theoretical: 16.0
  },
  {
    id: 'stk_milk',
    name: 'Fresh Pasteurized Milk',
    cat: 'Dairy',
    uom: 'L',
    baseUnit: 'L',
    purchaseUnits: [{ name: 'Litre', factor: 1 }, { name: 'Crate (10L)', factor: 10 }],
    defaultPurchaseUnit: 'Crate (10L)',
    lastPurchaseUnit: 'Crate (10L)',
    onHand: 22.0,
    storeQty: 14.0,
    kitchenQty: 4.0,
    barQty: 4.0,
    par: 30,
    reorder: 10,
    unitCost: 2400,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Dairy Fridge',
    theoretical: 22.0
  },
  {
    id: 'stk_chocolate',
    name: 'Dark Chocolate Callets 70%',
    cat: 'Bakery',
    uom: 'kg',
    baseUnit: 'kg',
    purchaseUnits: [{ name: 'Single/Kg', factor: 1 }, { name: 'Bag (5kg)', factor: 5 }],
    defaultPurchaseUnit: 'Bag (5kg)',
    lastPurchaseUnit: 'Bag (5kg)',
    onHand: 6.2,
    storeQty: 4.0,
    kitchenQty: 2.2,
    barQty: 0,
    par: 10,
    reorder: 4,
    unitCost: 28000,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Pastry Store',
    theoretical: 6.2
  },
  {
    id: 'stk_oil',
    name: 'Pure Sunflower Cooking Oil',
    cat: 'Oils',
    uom: 'L',
    baseUnit: 'L',
    purchaseUnits: [{ name: 'Litre', factor: 1 }, { name: 'Jerrycan (20L)', factor: 20 }],
    defaultPurchaseUnit: 'Jerrycan (20L)',
    lastPurchaseUnit: 'Jerrycan (20L)',
    onHand: 45.0,
    storeQty: 30.0,
    kitchenQty: 15.0,
    barQty: 0,
    par: 60,
    reorder: 20,
    unitCost: 4800,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Dry Store',
    theoretical: 45.0
  },
  {
    id: 'stk_spices',
    name: 'Safari House Spice Blend',
    cat: 'Spices',
    uom: 'kg',
    baseUnit: 'kg',
    purchaseUnits: [{ name: 'Single/Kg', factor: 1 }, { name: 'Tub (5kg)', factor: 5 }],
    defaultPurchaseUnit: 'Tub (5kg)',
    lastPurchaseUnit: 'Tub (5kg)',
    onHand: 12.0,
    storeQty: 8.0,
    kitchenQty: 4.0,
    barQty: 0,
    par: 15,
    reorder: 5,
    unitCost: 15000,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Dry Store',
    theoretical: 12.0
  },
  {
    id: 'stk_coconut',
    name: 'Zanzibar Coconut Milk',
    cat: 'Produce',
    uom: 'L',
    baseUnit: 'L',
    purchaseUnits: [{ name: 'Litre', factor: 1 }, { name: 'Carton (12L)', factor: 12 }],
    defaultPurchaseUnit: 'Carton (12L)',
    lastPurchaseUnit: 'Carton (12L)',
    onHand: 14.0,
    storeQty: 10.0,
    kitchenQty: 4.0,
    barQty: 0,
    par: 20,
    reorder: 8,
    unitCost: 5500,
    sellingPrice: null,
    itemType: 'raw_material',
    loc: 'Dry Store',
    theoretical: 14.0
  },

  // DRINKS: One Base Unit, Many Purchase Units (Design Requirement 1 & 3: Direct Link & Returnable Crates)
  {
    id: 'stk_soda',
    name: 'Soda 500ml (Coke/Fanta/Sprite)',
    cat: 'Drinks',
    uom: 'bottles',
    baseUnit: 'bottle',
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Crate', factor: 24 }
    ],
    defaultPurchaseUnit: 'Crate',
    lastPurchaseUnit: 'Crate',
    lastPurchasePrice: 24000,
    onHand: 144,
    storeQty: 96,
    kitchenQty: 0,
    barQty: 48,
    par: 200,
    reorder: 48,
    unitCost: 1000,
    sellingPrice: 2000,
    itemType: 'direct_resale',
    trackingMode: 'direct_link',
    loc: 'Beverage Store',
    theoretical: 144,
    menuId: 32,
    supplierId: 'sup_coca',
    returnable: true,
    cratesOnHand: 6,
    emptyBottlesOnHand: 38,
    cratesOwedSupplier: 8
  },
  {
    id: 'stk_water',
    name: 'Kilimanjaro Mineral Water 500ml',
    cat: 'Drinks',
    uom: 'bottles',
    baseUnit: 'bottle',
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Carton', factor: 12 },
      { name: 'Pack (24)', factor: 24 }
    ],
    defaultPurchaseUnit: 'Carton',
    lastPurchaseUnit: 'Carton',
    lastPurchasePrice: 9600,
    onHand: 120,
    storeQty: 80,
    kitchenQty: 0,
    barQty: 40,
    par: 150,
    reorder: 40,
    unitCost: 800,
    sellingPrice: 2000,
    itemType: 'direct_resale',
    trackingMode: 'direct_link',
    loc: 'Beverage Store',
    theoretical: 120,
    menuId: 13,
    supplierId: 'sup_coca',
    returnable: false,
    cratesOnHand: 0,
    emptyBottlesOnHand: 0,
    cratesOwedSupplier: 0
  },
  {
    id: 'stk_beer',
    name: 'Safari Premium Lager 500ml',
    cat: 'Drinks',
    uom: 'bottles',
    baseUnit: 'bottle',
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Crate (20)', factor: 20 }
    ],
    defaultPurchaseUnit: 'Crate (20)',
    lastPurchaseUnit: 'Crate (20)',
    lastPurchasePrice: 50000,
    onHand: 80,
    storeQty: 50,
    kitchenQty: 0,
    barQty: 30,
    par: 120,
    reorder: 30,
    unitCost: 2500,
    sellingPrice: 5000,
    itemType: 'direct_resale',
    trackingMode: 'direct_link',
    loc: 'Bar Chiller',
    theoretical: 80,
    menuId: 15,
    supplierId: 'sup_serengeti',
    returnable: true,
    cratesOnHand: 4,
    emptyBottlesOnHand: 28,
    cratesOwedSupplier: 6
  },
  {
    id: 'stk_coke',
    name: 'Coca-Cola Zero 330ml Can',
    cat: 'Drinks',
    uom: 'cans',
    baseUnit: 'can',
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Carton', factor: 24 }
    ],
    defaultPurchaseUnit: 'Carton',
    lastPurchaseUnit: 'Carton',
    lastPurchasePrice: 28800,
    onHand: 96,
    storeQty: 60,
    kitchenQty: 0,
    barQty: 36,
    par: 120,
    reorder: 30,
    unitCost: 1200,
    sellingPrice: 3000,
    itemType: 'direct_resale',
    trackingMode: 'direct_link',
    loc: 'Beverage Store',
    theoretical: 96,
    menuId: 14,
    supplierId: 'sup_coca',
    returnable: false,
    cratesOnHand: 0,
    emptyBottlesOnHand: 0,
    cratesOwedSupplier: 0
  },
  {
    id: 'stk_castle',
    name: 'Castle Lite 330ml',
    cat: 'Drinks',
    uom: 'bottles',
    baseUnit: 'bottle',
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Crate', factor: 24 }
    ],
    defaultPurchaseUnit: 'Crate',
    lastPurchaseUnit: 'Crate',
    lastPurchasePrice: 62400,
    onHand: 72,
    storeQty: 48,
    kitchenQty: 0,
    barQty: 24,
    par: 96,
    reorder: 24,
    unitCost: 2600,
    sellingPrice: 5000,
    itemType: 'direct_resale',
    trackingMode: 'direct_link',
    loc: 'Bar Chiller',
    theoretical: 72,
    menuId: 34,
    supplierId: 'sup_tbl',
    returnable: true,
    cratesOnHand: 3,
    emptyBottlesOnHand: 20,
    cratesOwedSupplier: 4
  },
  {
    id: 'stk_redbull',
    name: 'Red Bull Energy Drink 250ml',
    cat: 'Drinks',
    uom: 'cans',
    baseUnit: 'can',
    purchaseUnits: [
      { name: 'Single', factor: 1 },
      { name: 'Pack (6)', factor: 6 },
      { name: 'Carton (24)', factor: 24 }
    ],
    defaultPurchaseUnit: 'Carton (24)',
    lastPurchaseUnit: 'Carton (24)',
    lastPurchasePrice: 84000,
    onHand: 48,
    storeQty: 30,
    kitchenQty: 0,
    barQty: 18,
    par: 60,
    reorder: 18,
    unitCost: 3500,
    sellingPrice: 7000,
    itemType: 'direct_resale',
    trackingMode: 'direct_link',
    loc: 'Beverage Store',
    theoretical: 48,
    menuId: 35,
    supplierId: 'sup_3',
    returnable: false,
    cratesOnHand: 0,
    emptyBottlesOnHand: 0,
    cratesOwedSupplier: 0
  }
];

export const SUPPLIERS = [
  { id: 'sup_coca', name: 'Coca-Cola Kwanza Ltd', contact: 'Juma Hassan', phone: '+255 714 556 778', terms: 'Cash / Crates Deposit', leadDays: 1, rating: 4.9, cats: ['Drinks', 'Soda', 'Water'], returnableSupported: true },
  { id: 'sup_serengeti', name: 'Serengeti Breweries Ltd (SBL)', contact: 'Daniel Mrosso', phone: '+255 784 990 112', terms: 'Net 15', leadDays: 1, rating: 4.9, cats: ['Beer', 'Spirits', 'Drinks'], returnableSupported: true },
  { id: 'sup_tbl', name: 'Tanzania Breweries Ltd (TBL / AB InBev)', contact: 'Grace Minja', phone: '+255 754 332 110', terms: 'Net 15', leadDays: 1, rating: 4.8, cats: ['Beer', 'Drinks'], returnableSupported: true },
  { id: 'sup_1', name: 'Serengeti Meats & Poultry', contact: 'Bakari Mwita', phone: '+255 784 112 233', terms: 'Net 15', leadDays: 1, rating: 4.9, cats: ['Poultry', 'Meat', 'Seafood'], returnableSupported: false },
  { id: 'sup_2', name: 'Farm Fresh Tanzania Ltd', contact: 'Salma Hamad', phone: '+255 715 443 322', terms: 'Net 7', leadDays: 1, rating: 4.8, cats: ['Produce', 'Dairy'], returnableSupported: false },
  { id: 'sup_3', name: 'Kibo Food & Beverage Supplies', contact: 'Emanuel Kimaro', phone: '+255 754 887 766', terms: 'Net 30', leadDays: 2, rating: 4.7, cats: ['Dry Goods', 'Bakery', 'Oils', 'Spices', 'Drinks'], returnableSupported: false }
];

export const INITIAL_CRATE_LEDGER = [
  { id: 'crtl_1', supplierId: 'sup_coca', supplierName: 'Coca-Cola Kwanza Ltd', drinkName: 'Soda 500ml Glass', cratesReceived: 30, cratesReturned: 22, netCratesOwed: 8, emptyBottlesOnHand: 38, depositPerCrate: 12000, lastUpdated: Date.now() - 3600 * 24 * 1000 },
  { id: 'crtl_2', supplierId: 'sup_serengeti', supplierName: 'Serengeti Breweries Ltd (SBL)', drinkName: 'Safari Premium Lager 500ml', cratesReceived: 25, cratesReturned: 19, netCratesOwed: 6, emptyBottlesOnHand: 28, depositPerCrate: 15000, lastUpdated: Date.now() - 3600 * 18 * 1000 },
  { id: 'crtl_3', supplierId: 'sup_tbl', supplierName: 'Tanzania Breweries Ltd (TBL)', drinkName: 'Castle Lite 330ml', cratesReceived: 20, cratesReturned: 16, netCratesOwed: 4, emptyBottlesOnHand: 20, depositPerCrate: 15000, lastUpdated: Date.now() - 3600 * 12 * 1000 }
];

// Inter-Location Transfers (Store -> Kitchen, Store -> Bar)
export const INITIAL_TRANSFERS = [
  {
    id: 'TR-501',
    t: Date.now() - 3 * 3600 * 1000,
    fromLoc: 'Main Store',
    toLoc: 'Kitchen Prep Station',
    items: [
      { stockId: 'stk_chicken', name: 'Fresh Whole Chicken', qty: 15.0, uom: 'kg' },
      { stockId: 'stk_beef', name: 'Prime Beef Tenderloin', qty: 10.0, uom: 'kg' },
      { stockId: 'stk_spices', name: 'Safari House Spice Blend', qty: 3.0, uom: 'kg' }
    ],
    transferredBy: 'Hamisi Bakari (Storekeeper)',
    acceptedBy: 'Chef Baraka (Kitchen Lead)',
    status: 'completed',
    notes: 'Morning kitchen stock transfer for grill prep'
  },
  {
    id: 'TR-502',
    t: Date.now() - 2 * 3600 * 1000,
    fromLoc: 'Beverage Store',
    toLoc: 'Bar Station',
    items: [
      { stockId: 'stk_water', name: 'Kilimanjaro Mineral Water', qty: 40, uom: 'bottles' },
      { stockId: 'stk_coke', name: 'Coca-Cola Zero 330ml', qty: 36, uom: 'cans' },
      { stockId: 'stk_beer', name: 'Safari Premium Lager 500ml', qty: 24, uom: 'bottles' }
    ],
    transferredBy: 'Hamisi Bakari (Storekeeper)',
    acceptedBy: 'Zawadi Ally (Bar Lead)',
    status: 'completed',
    notes: 'Bar cooler restock for evening rush'
  }
];

// Procurement Requests for Quotation (RFQs - Step 1 of Procurement)
export const INITIAL_RFQS = [
  {
    id: 'RFQ-301',
    title: 'Bi-Weekly Fresh Meat & Poultry Supply',
    createdAt: Date.now() - 48 * 3600 * 1000,
    status: 'converted_to_po',
    poId: 'PO-881',
    items: [
      { stockId: 'stk_chicken', name: 'Fresh Whole Chicken', qty: 50, uom: 'kg' },
      { stockId: 'stk_beef', name: 'Prime Beef Tenderloin', qty: 30, uom: 'kg' }
    ],
    bids: [
      { supplierId: 'sup_1', supplierName: 'Serengeti Meats & Poultry', quoteAmount: 845000, leadDays: 1, selected: true },
      { supplierId: 'sup_3', supplierName: 'Kibo Food & Beverage', quoteAmount: 910000, leadDays: 2, selected: false }
    ],
    selectedSupplierId: 'sup_1',
    notes: 'Serengeti Meats selected based on lower unit pricing and same-day delivery.'
  },
  {
    id: 'RFQ-302',
    title: 'Beverage Stock Restock (Mineral Water & Soda)',
    createdAt: Date.now() - 12 * 3600 * 1000,
    status: 'bidding',
    poId: null,
    items: [
      { stockId: 'stk_water', name: 'Kilimanjaro Mineral Water', qty: 100, uom: 'bottles' },
      { stockId: 'stk_coke', name: 'Coca-Cola Zero 330ml', qty: 80, uom: 'cans' }
    ],
    bids: [
      { supplierId: 'sup_3', supplierName: 'Kibo Food & Beverage Supplies', quoteAmount: 176000, leadDays: 1, selected: false }
    ],
    selectedSupplierId: null,
    notes: 'Pending quotation from second regional distributor before PO issuance.'
  }
];

// Operating Expenses for Boss Financial P&L Analysis
export const INITIAL_EXPENSES = [
  { id: 'exp_1', t: Date.now() - 24 * 3600 * 1000, category: 'Utilities & Power', name: 'TANESCO Commercial Electricity', amount: 180000, method: 'bank', ref: 'TAN-44129' },
  { id: 'exp_2', t: Date.now() - 48 * 3600 * 1000, category: 'Gas & Fuel', name: 'Oryx Bulk LPG Gas Refill (Grill)', amount: 120000, method: 'cash', ref: 'ORYX-9912' },
  { id: 'exp_3', t: Date.now() - 72 * 3600 * 1000, category: 'Facility & Cleaning', name: 'Hygiene & Cleaning Chemicals', amount: 45000, method: 'cash', ref: 'CSH-CLN' },
  { id: 'exp_4', t: Date.now() - 96 * 3600 * 1000, category: 'Internet & Telecom', name: 'Fiber Broadband Internet (POS & KDS)', amount: 85000, method: 'bank', ref: 'TTCL-8871' }
];

export const USERS = [
  { id: 'u1', role: 'customer', name: 'Juma Rashid', ph: '0712000111', pw: 'demo', title: 'Loyal Customer', email: 'juma.r@gmail.com' },
  { id: 'u2', role: 'waiter', name: 'Amani Juma', ph: '0713000222', pw: 'demo', wid: 'w1', title: 'Senior Waiter', email: 'amani.j@safarigrill.tz' },
  { id: 'u2b', role: 'waiter', name: 'Neema Mushi', ph: '0713000223', pw: 'demo', wid: 'w2', title: 'Floor Waiter', email: 'neema.m@safarigrill.tz' },
  { id: 'u5', role: 'chef', name: 'Chef Baraka', ph: '0716000555', pw: 'demo', title: 'Head Chef & Kitchen Lead', email: 'baraka@safarigrill.tz' },
  { id: 'u8', role: 'production', name: 'Jaffar Mdee', ph: '0719000888', pw: 'demo', title: 'Central Kitchen & Production Manager', email: 'jaffar.m@safarigrill.tz' },
  { id: 'u3', role: 'cashier', name: 'Zawadi Ally', ph: '0714000333', pw: 'demo', title: 'Head Cashier / Receptionist', email: 'zawadi.a@safarigrill.tz' },
  { id: 'u6', role: 'storekeeper', name: 'Hamisi Bakari', ph: '0717000666', pw: 'demo', title: 'Storekeeper & Receiving', email: 'hamisi.b@safarigrill.tz' },
  { id: 'u4', role: 'manager', name: 'Rehema Said', ph: '0715000444', pw: 'demo', title: 'Site General Manager', email: 'rehema.s@safarigrill.tz' },
  { id: 'u7', role: 'owner', name: 'David Kimani', ph: '0718000777', pw: 'demo', title: 'Group Owner & CEO', email: 'david.k@safariholding.tz' }
];

// Central Kitchen & Manufacturing BOMs (SRS Section 4.8, CK-02, MNU-02)
export const BOMS = [
  {
    id: 'bom_chicken',
    name: 'Pre-Marinated Whole Chicken Halves',
    outputFgId: 'fg_marinated_chicken',
    outputName: 'Marinated Chicken Halves',
    targetYield: 40,
    uom: 'portions',
    prepTimeMins: 45,
    shelfLifeHours: 48,
    laborCost: 12000,
    overheadCost: 4000,
    allergens: ['Garlic'],
    targetStorage: 'Chiller (0°C to 3°C)',
    ingredients: [
      { stockId: 'stk_chicken', name: 'Fresh Whole Chicken', qty: 20.0, uom: 'kg' },
      { stockId: 'stk_spices', name: 'Safari House Spice Blend', qty: 1.6, uom: 'kg' },
      { stockId: 'stk_oil', name: 'Pure Sunflower Cooking Oil', qty: 2.0, uom: 'L' }
    ]
  },
  {
    id: 'bom_mishkaki',
    name: 'Charcoal Skewer Beef Mishkaki',
    outputFgId: 'fg_skewered_mishkaki',
    outputName: 'Marinated Beef Mishkaki Skewers',
    targetYield: 50,
    uom: 'skewers',
    prepTimeMins: 60,
    shelfLifeHours: 72,
    laborCost: 18000,
    overheadCost: 5000,
    allergens: ['Chilli'],
    targetStorage: 'Chiller (0°C to 3°C)',
    ingredients: [
      { stockId: 'stk_beef', name: 'Prime Beef Tenderloin', qty: 17.5, uom: 'kg' },
      { stockId: 'stk_spices', name: 'Safari House Spice Blend', qty: 2.5, uom: 'kg' }
    ]
  },
  {
    id: 'bom_pilau_base',
    name: 'Swahili Beef Pilau Broth Concentrated Base',
    outputFgId: 'fg_pilau_base',
    outputName: 'Pilau Broth Concentrate',
    targetYield: 30,
    uom: 'litres',
    prepTimeMins: 90,
    shelfLifeHours: 96,
    laborCost: 15000,
    overheadCost: 6000,
    allergens: [],
    targetStorage: 'Chiller (1°C to 4°C)',
    ingredients: [
      { stockId: 'stk_beef', name: 'Prime Beef Tenderloin (Bone & Trim)', qty: 6.0, uom: 'kg' },
      { stockId: 'stk_spices', name: 'Safari House Spice Blend', qty: 1.5, uom: 'kg' },
      { stockId: 'stk_oil', name: 'Pure Sunflower Cooking Oil', qty: 2.0, uom: 'L' }
    ]
  },
  {
    id: 'bom_lava_mix',
    name: 'Molten Belgian Chocolate Lava Batter',
    outputFgId: 'fg_lava_mix',
    outputName: 'Lava Cake Batter Ramekins',
    targetYield: 25,
    uom: 'ramekins',
    prepTimeMins: 30,
    shelfLifeHours: 72,
    laborCost: 10000,
    overheadCost: 3500,
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    targetStorage: 'Pastry Chiller (2°C to 4°C)',
    ingredients: [
      { stockId: 'stk_chocolate', name: 'Dark Chocolate Callets 70%', qty: 3.75, uom: 'kg' },
      { stockId: 'stk_milk', name: 'Fresh Pasteurized Milk', qty: 2.0, uom: 'L' }
    ]
  }
];

// Finished Goods / Prep Stock Inventory (Section 4.6, 4.8)
export const INITIAL_FINISHED_GOODS = [
  {
    id: 'fg_marinated_chicken',
    name: 'Marinated Chicken Halves',
    category: 'Prepared Poultry',
    uom: 'portions',
    onHand: 48,
    par: 60,
    reorder: 20,
    unitCost: 5420,
    batchNo: 'BATCH-20261101-01',
    expiry: 'Nov 3, 2026',
    allergens: ['Garlic'],
    loc: 'Cold Room A (Masaki)',
    menuId: 1
  },
  {
    id: 'fg_skewered_mishkaki',
    name: 'Marinated Beef Mishkaki Skewers',
    category: 'Prepared Meat',
    uom: 'skewers',
    onHand: 65,
    par: 80,
    reorder: 30,
    unitCost: 6100,
    batchNo: 'BATCH-20261101-02',
    expiry: 'Nov 4, 2026',
    allergens: ['Chilli'],
    loc: 'Meat Freezer Pass',
    menuId: 2
  },
  {
    id: 'fg_pilau_base',
    name: 'Pilau Broth Concentrate',
    category: 'Prepared Bases',
    uom: 'litres',
    onHand: 24,
    par: 30,
    reorder: 10,
    unitCost: 4800,
    batchNo: 'BATCH-20261031-04',
    expiry: 'Nov 5, 2026',
    allergens: [],
    loc: 'Sauce Walk-in',
    menuId: 7
  },
  {
    id: 'fg_lava_mix',
    name: 'Lava Cake Batter Ramekins',
    category: 'Prepared Pastry',
    uom: 'ramekins',
    onHand: 18,
    par: 25,
    reorder: 8,
    unitCost: 4950,
    batchNo: 'BATCH-20261031-05',
    expiry: 'Nov 3, 2026',
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    loc: 'Pastry Chiller',
    menuId: 11
  }
];

// Production Work Orders (SRS CK-02)
export const INITIAL_PRODUCTION_ORDERS = [
  {
    id: 'WO-101',
    batchNo: 'BATCH-20261101-01',
    bomId: 'bom_chicken',
    productName: 'Marinated Chicken Halves',
    plannedYield: 40,
    actualYield: 38,
    uom: 'portions',
    status: 'completed',
    operator: 'Chef Baraka',
    tempLog: '2.6°C',
    laborCost: 12000,
    overheadCost: 4000,
    materialsCost: 194000,
    totalBatchCost: 210000,
    unitCost: 5526,
    yieldVariancePct: -5.0,
    createdAt: Date.now() - 5 * 3600 * 1000,
    completedAt: Date.now() - 3 * 3600 * 1000,
    expiryDate: new Date(Date.now() + 48 * 3600 * 1000).toLocaleDateString(),
    notes: 'Batch seasoned with fresh garlic rosemary rub. 2 portions culled for underweight inspection.'
  },
  {
    id: 'WO-102',
    batchNo: 'BATCH-20261101-02',
    bomId: 'bom_mishkaki',
    productName: 'Marinated Beef Mishkaki Skewers',
    plannedYield: 50,
    actualYield: 50,
    uom: 'skewers',
    status: 'completed',
    operator: 'Jaffar Mdee',
    tempLog: '2.8°C',
    laborCost: 18000,
    overheadCost: 5000,
    materialsCost: 282500,
    totalBatchCost: 305500,
    unitCost: 6110,
    yieldVariancePct: 0.0,
    createdAt: Date.now() - 4 * 3600 * 1000,
    completedAt: Date.now() - 2 * 3600 * 1000,
    expiryDate: new Date(Date.now() + 72 * 3600 * 1000).toLocaleDateString(),
    notes: '100% yield achieved with zero trim loss.'
  },
  {
    id: 'WO-103',
    batchNo: 'BATCH-20261101-03',
    bomId: 'bom_lava_mix',
    productName: 'Lava Cake Batter Ramekins',
    plannedYield: 25,
    actualYield: null,
    uom: 'ramekins',
    status: 'in_production',
    operator: 'Jaffar Mdee',
    tempLog: '3.4°C',
    laborCost: 10000,
    overheadCost: 3500,
    materialsCost: 109800,
    totalBatchCost: 123300,
    unitCost: 4932,
    yieldVariancePct: null,
    createdAt: Date.now() - 45 * 60 * 1000,
    completedAt: null,
    expiryDate: new Date(Date.now() + 72 * 3600 * 1000).toLocaleDateString(),
    notes: 'Currently tempering dark Belgian chocolate callets in bain-marie.'
  }
];

// Inter-site Requisitions from Outlets to Central Kitchen (SRS CK-01, CK-03)
export const INITIAL_SITE_REQUISITIONS = [
  {
    id: 'REQ-401',
    fromSiteId: 'oysterbay',
    fromSiteName: 'Safari Grill Express · Oysterbay',
    toSiteId: 'ck',
    toSiteName: 'Central Production Facility (Masaki)',
    status: 'approved',
    items: [
      { fgId: 'fg_marinated_chicken', name: 'Marinated Chicken Halves', qty: 15, uom: 'portions' },
      { fgId: 'fg_skewered_mishkaki', name: 'Marinated Beef Mishkaki Skewers', qty: 20, uom: 'skewers' }
    ],
    requestedAt: Date.now() - 3 * 3600 * 1000,
    requestedBy: 'Hassan Mwinyi (GM Oysterbay)',
    dispatchedAt: Date.now() - 1 * 3600 * 1000,
    driver: 'Rashid Mtambo (Van #TZ 881 AC)',
    transportTemp: '3.1°C'
  },
  {
    id: 'REQ-402',
    fromSiteId: 'city',
    fromSiteName: 'Safari Grill & Lounge · City Centre',
    toSiteId: 'ck',
    toSiteName: 'Central Production Facility (Masaki)',
    status: 'pending',
    items: [
      { fgId: 'fg_pilau_base', name: 'Pilau Broth Concentrate', qty: 10, uom: 'litres' },
      { fgId: 'fg_lava_mix', name: 'Lava Cake Batter Ramekins', qty: 12, uom: 'ramekins' }
    ],
    requestedAt: Date.now() - 45 * 60 * 1000,
    requestedBy: 'Fatma Juma (GM City Centre)',
    dispatchedAt: null,
    driver: null,
    transportTemp: null
  }
];


export const WAITERS = [
  { id: 'w1', name: 'Amani Juma', phone: '0713000222', tok: 'amani-7QK2', active: true, tables: ['T1', 'T2', 'T3'], avatar: '👨🏾‍🍳' },
  { id: 'w2', name: 'Neema Mushi', phone: '0713000223', tok: 'neema-X93F', active: true, tables: ['T4', 'T5', 'T6'], avatar: '👩🏾‍🍳' }
];

export const tot = o => (o.it || []).reduce((a, l) => a + (M[l.id] ? M[l.id].p : 0) * l.q, 0);
export const calcTax = amt => Math.round(amt - amt / 1.18); // 18% VAT included
export const calcNet = amt => Math.round(amt / 1.18);

const now = Date.now();

export const INITIAL_ORDERS = [
  // Image cb6e1d9e KDS Display Orders
  {
    id: 1009,
    no: '#0009',
    src: 'POS',
    orderType: 'Dine In',
    tb: 'Table 04',
    guests: 4,
    wid: 'w1',
    by: 'Ammie',
    it: [
      { id: 26, q: 1, done: false },
      { id: 27, q: 1, done: false },
      { id: 28, q: 1, done: false },
      { id: 30, q: 1, sub: '250 ml', done: false }
    ],
    st: 'placed',
    pm: 'cash',
    paid: false,
    t: now - 3 * 60 * 1000,
    timeStr: '12:53',
    elapsedMins: 3,
    timerTarget: 15,
    cust: 'guest_0009',
    created_at: now - 3 * 60 * 1000,
    log: ['Placed by Ammie at POS', 'Waiting for kitchen start']
  },
  {
    id: 1008,
    no: '#0008',
    src: 'POS',
    orderType: 'Dine In',
    tb: 'Table 02',
    guests: 3,
    wid: 'w1',
    by: 'Ammie',
    it: [
      { id: 26, q: 1, done: false },
      { id: 27, q: 1, done: false },
      { id: 30, q: 1, sub: '250 ml', done: false }
    ],
    st: 'placed',
    pm: 'cash',
    paid: false,
    t: now - 4 * 60 * 1000,
    timeStr: '12:52',
    elapsedMins: 4,
    timerTarget: 15,
    cust: 'guest_0008',
    created_at: now - 4 * 60 * 1000,
    log: ['Placed by Ammie at POS']
  },
  {
    id: 1007,
    no: '#0007',
    src: 'POS',
    orderType: 'Dine In',
    tb: 'Table 06',
    guests: 3,
    wid: 'w1',
    by: 'Ammie',
    it: [
      { id: 28, q: 1, done: false },
      { id: 27, q: 1, done: false }
    ],
    st: 'placed',
    pm: 'cash',
    paid: false,
    t: now - 5 * 60 * 1000,
    timeStr: '12:51',
    elapsedMins: 5,
    timerTarget: 15,
    cust: 'guest_0007',
    created_at: now - 5 * 60 * 1000,
    log: ['Placed by Ammie at POS']
  },
  {
    id: 1001,
    no: '#0001',
    src: 'POS',
    orderType: 'Dine In',
    tb: 'Table 01',
    guests: 4,
    wid: 'w1',
    by: 'Ammie',
    it: [
      { id: 26, q: 1, done: true },
      { id: 27, q: 1, done: true },
      { id: 28, q: 1, done: false },
      { id: 30, q: 1, sub: '250 ml', done: false }
    ],
    st: 'preparing',
    pm: 'cash',
    paid: false,
    t: now - 18 * 60 * 1000,
    timeStr: '12:00',
    elapsedMins: 18,
    timerTarget: 15,
    cust: 'guest_0001',
    created_at: now - 18 * 60 * 1000,
    log: ['Placed by Ammie at POS', 'Chef started cooking']
  },
  {
    id: 1002,
    no: '#0002',
    src: 'Online Order',
    orderType: 'Takeaway',
    tb: 'Takeaway',
    guests: 4,
    wid: 'w1',
    by: 'Ammie',
    it: [
      { id: 26, q: 1, voided: true, done: false },
      { id: 27, q: 1, done: false },
      { id: 28, q: 1, done: false },
      { id: 30, q: 1, sub: '250 ml', done: false }
    ],
    st: 'preparing',
    pm: 'online',
    paid: false,
    t: now - 15 * 60 * 1000,
    timeStr: '12:10',
    elapsedMins: 15,
    timerTarget: 15,
    cust: 'guest_0002',
    created_at: now - 15 * 60 * 1000,
    log: ['Online order placed', 'Pad Thai voided per customer request']
  },
  {
    id: 1004,
    no: '#0004',
    src: 'POS',
    orderType: 'Pickup',
    tb: 'Pickup Counter',
    guests: 4,
    wid: 'w1',
    by: 'Ammie',
    it: [
      { id: 28, q: 1, mods: ['* Large', '+ Mushroom', '+ Cheese'], done: false }
    ],
    st: 'preparing',
    pm: 'card',
    paid: false,
    t: now - 10 * 60 * 1000,
    timeStr: '12:30',
    elapsedMins: 10,
    timerTarget: 15,
    cust: 'guest_0004',
    created_at: now - 10 * 60 * 1000,
    log: ['Pickup order placed at POS']
  },
  {
    id: 1005,
    no: '#0005',
    src: 'POS',
    orderType: 'Delivery',
    tb: 'Delivery',
    guests: 4,
    wid: 'w1',
    by: 'Ammie',
    it: [
      { id: 26, q: 1, done: false },
      { id: 29, q: 1, note: 'Less sweet', done: false }
    ],
    st: 'preparing',
    pm: 'momo',
    paid: false,
    t: now - 8 * 60 * 1000,
    timeStr: '12:40',
    elapsedMins: 8,
    timerTarget: 15,
    cust: 'guest_0005',
    created_at: now - 8 * 60 * 1000,
    log: ['Delivery order placed at POS']
  },
  {
    id: 1000,
    no: '#0001',
    src: 'POS',
    orderType: 'Dine In',
    tb: 'Table 03',
    guests: 3,
    wid: 'w1',
    by: 'Ammie',
    it: [
      { id: 26, q: 1, done: true },
      { id: 27, q: 1, done: true },
      { id: 28, q: 1, done: true }
    ],
    st: 'ready',
    pm: 'cash',
    paid: true,
    t: now - 35 * 60 * 1000,
    timeStr: '12:25',
    elapsedMins: 35,
    timerTarget: 15,
    cust: 'guest_past',
    created_at: now - 35 * 60 * 1000,
    log: ['Completed and ready at pass']
  },
  // Existing Orders
  {
    id: 2,
    no: '#002',
    src: 'WALKIN_WAITER',
    orderType: 'Dine In',
    tb: 'VIP Room 08',
    guests: 12,
    wid: 'w1',
    by: 'John doe',
    it: [
      { id: 1, q: 2, note: 'Grilled with rosemary & lemon' },
      { id: 3, q: 2, note: 'Lake Victoria fresh tilapia' }
    ],
    st: 'preparing',
    pm: 'cash',
    paid: false,
    t: now - 8 * 60 * 1000 - 12 * 1000,
    elapsedMins: 8,
    elapsedSecs: 12,
    timerTarget: 15,
    cust: 'guest_vip08',
    created_at: now - 8 * 60 * 1000 - 12 * 1000,
    log: ['Placed by John doe for VIP Room 08', 'Kitchen accepted - on grill']
  },
  {
    id: 3,
    no: '#003',
    src: 'ONLINE_ORDER',
    orderType: 'Online Order',
    tb: 'Online / Takeaway',
    guests: 2,
    wid: 'w2',
    by: 'Judith Rodriguez',
    it: [
      { id: 16, q: 1, note: 'Extra saffron aroma, raita packed separately' },
      { id: 18, q: 1, note: 'Stone baked, slice in 8' }
    ],
    st: 'ready',
    pm: 'ewallet',
    paid: false,
    t: now - 12 * 60 * 1000 - 34 * 1000,
    elapsedMins: 12,
    elapsedSecs: 34,
    timerTarget: 15,
    online: true,
    cust: 'cust_judith',
    created_at: now - 12 * 60 * 1000 - 34 * 1000,
    log: ['Customer placed via Online Web Order', 'Pre-authorized payment: E-Wallet', 'Kitchen marked Ready at Pass']
  },
  {
    id: 1,
    no: '#01',
    src: 'TABLE_QR',
    orderType: 'Dine In',
    tb: 'Table 08',
    guests: 8,
    wid: 'w1',
    by: 'John doe',
    it: [
      { id: 25, q: 2, note: 'Dressing on the side' },
      { id: 2, q: 2, note: 'Medium spice kachumbari' }
    ],
    st: 'placed',
    pm: 'cashier',
    paid: false,
    t: now - 2 * 60 * 1000 - 34 * 1000,
    elapsedMins: 2,
    elapsedSecs: 34,
    timerTarget: 12,
    cust: 'guest_tb08',
    created_at: now - 2 * 60 * 1000 - 34 * 1000,
    log: ['Scanned Table 08 QR', 'Awaiting kitchen acceptance']
  },
  // Image 3 Bitepoint Cashier & Orders Screen Items
  {
    id: 925,
    no: '#925',
    src: 'TABLE_QR',
    orderType: 'Dine In',
    tb: 'A4',
    guests: 4,
    wid: 'w1',
    by: 'Ariel Hikmat',
    it: [
      { id: 18, q: 1, note: 'Thin crust mozzarella' },
      { id: 20, q: 1, note: 'Honey mustard dip' },
      { id: 11, q: 2, note: 'Molten centre' },
      { id: 9, q: 1, note: 'Chilled passion cooler' }
    ],
    st: 'ready',
    pm: 'cash',
    paid: false,
    t: now - 22 * 60 * 1000,
    elapsedMins: 22,
    cust: 'cust_ariel',
    created_at: now - 22 * 60 * 1000,
    log: ['Order placed at Table A4', 'Kitchen served all courses', 'Ready to settle bill']
  },
  {
    id: 921,
    no: '#921',
    src: 'TABLE_QR',
    orderType: 'Dine In',
    tb: 'B2',
    guests: 2,
    wid: 'w2',
    by: 'Denis Freeman',
    it: [
      { id: 17, q: 1, note: 'Classic Cheeseburger with cheddar' },
      { id: 6, q: 2, note: 'Masala fries crispy' },
      { id: 2, q: 1, note: 'Greek / Mishkaki skewers' }
    ],
    st: 'preparing',
    pm: 'card',
    paid: false,
    t: now - 14 * 60 * 1000,
    elapsedMins: 14,
    cust: 'cust_denis',
    created_at: now - 14 * 60 * 1000,
    log: ['Order entered for Table B2', 'Grill station cooking burgers & skewers']
  },
  {
    id: 916,
    no: '#916',
    src: 'CASHIER',
    orderType: 'Takeaway',
    tb: 'TA',
    guests: 1,
    wid: 'w1',
    by: 'Morgan Cox',
    it: [
      { id: 24, q: 1, note: 'Fettuccine pasta in herb sauce' },
      { id: 3, q: 2, note: 'Lake tilapia fillets' },
      { id: 8, q: 1, note: 'Fresh mango juice' }
    ],
    st: 'preparing',
    pm: 'card',
    paid: false,
    t: now - 10 * 60 * 1000,
    elapsedMins: 10,
    cust: 'cust_morgan',
    created_at: now - 10 * 60 * 1000,
    log: ['Takeaway counter order taken', 'Packaging prepared in kitchen']
  },
  {
    id: 919,
    no: '#919',
    src: 'ONLINE_ORDER',
    orderType: 'Online Order',
    tb: 'Online',
    guests: 2,
    wid: 'w1',
    by: 'Paul Rey',
    it: [
      { id: 18, q: 1, note: 'Mozzarella Pizza extra crispy' },
      { id: 12, q: 1, note: 'Coconut tart with cream' },
      { id: 9, q: 2, note: 'Passion cooler with mint' }
    ],
    st: 'preparing',
    pm: 'momo',
    paid: false,
    t: now - 7 * 60 * 1000,
    elapsedMins: 7,
    online: true,
    cust: 'cust_paul',
    created_at: now - 7 * 60 * 1000,
    log: ['Placed via Customer Mobile App', 'Online delivery assigned to rider']
  },
  {
    id: 912,
    no: '#912',
    src: 'TABLE_QR',
    orderType: 'Dine In',
    tb: 'A9',
    guests: 3,
    wid: 'w2',
    by: 'Maja Becker',
    it: [
      { id: 22, q: 1, note: 'Veggie pakora fritters' },
      { id: 1, q: 1, note: 'Half roast chicken' },
      { id: 10, q: 2, note: 'Cardamom spiced chai' }
    ],
    st: 'billreq',
    pm: 'cash',
    paid: false,
    t: now - 38 * 60 * 1000,
    elapsedMins: 38,
    cust: 'cust_maja',
    created_at: now - 38 * 60 * 1000,
    log: ['Table A9 seated', 'Customer finished meal and requested bill']
  },
  {
    id: 908,
    no: '#908',
    src: 'TABLE_QR',
    orderType: 'Dine In',
    tb: 'C2',
    guests: 2,
    wid: 'w1',
    by: 'Erwan Richard',
    it: [
      { id: 5, q: 1, note: 'Crispy chicken burger' },
      { id: 6, q: 1, note: 'Spicy masala chips' },
      { id: 14, q: 1, note: 'Coke zero with ice' }
    ],
    st: 'paid',
    pm: 'card',
    paid: true,
    t: now - 55 * 60 * 1000,
    elapsedMins: 55,
    cust: 'cust_erwan',
    created_at: now - 55 * 60 * 1000,
    log: ['Order placed at Table C2', 'Meal served', 'Paid via Visa Debit Card ($56.96)']
  },
  {
    id: 101,
    no: '#1001',
    src: 'WAITER_LINK',
    orderType: 'Dine In',
    tb: 'T2',
    wid: 'w1',
    by: 'Juma Rashid',
    it: [{ id: 1, q: 2, note: 'Extra garlic herb butter' }, { id: 8, q: 2, note: 'No ice' }],
    st: 'preparing',
    pm: 'momo',
    paid: false,
    t: now - 18 * 60 * 1000,
    elapsedMins: 18,
    cust: 'u1',
    created_at: now - 18 * 60 * 1000,
    log: ['Order placed via Waiter Link', 'Kitchen accepted ticket']
  }
];

export const INITIAL_LEDGER = [
  {
    id: 'L104',
    oid: 104,
    wid: 'w1',
    method: 'percent',
    rate: 5,
    basis: 'gross',
    eligibleAmt: 42000,
    amt: 2100,
    st: 'pending',
    t: now - 74 * 60 * 1000,
    note: 'Order #1004 payment confirmed'
  }
];

export const INITIAL_PURCHASE_ORDERS = [
  {
    id: 'PO-881',
    supplierId: 'sup_1',
    supplierName: 'Serengeti Meats & Poultry',
    siteId: 'masaki',
    status: 'received',
    items: [
      { stockId: 'stk_chicken', name: 'Fresh Whole Chicken', qty: 25, unitPrice: 8500, uom: 'kg' },
      { stockId: 'stk_beef', name: 'Prime Beef Tenderloin', qty: 15, unitPrice: 14000, uom: 'kg' }
    ],
    total: 422500,
    tempLog: '3.4°C',
    createdAt: now - 6 * 3600 * 1000,
    receivedAt: now - 2 * 3600 * 1000,
    notes: 'Morning fresh poultry and meat delivery'
  },
  {
    id: 'PO-882',
    supplierId: 'sup_2',
    supplierName: 'Farm Fresh Tanzania Ltd',
    siteId: 'masaki',
    status: 'pending_approval',
    items: [
      { stockId: 'stk_mangoes', name: 'Kilombero Mangoes', qty: 30, unitPrice: 2500, uom: 'kg' },
      { stockId: 'stk_passion', name: 'Lushoto Passion Fruit', qty: 15, unitPrice: 4000, uom: 'kg' },
      { stockId: 'stk_potatoes', name: 'Mbeya Red Potatoes', qty: 50, unitPrice: 1800, uom: 'kg' }
    ],
    total: 225000,
    createdAt: now - 1 * 3600 * 1000,
    notes: 'Restock fresh produce for weekend rush'
  }
];

export const INITIAL_WASTE_LOG = [
  { id: 'wst_1', stockId: 'stk_potatoes', name: 'Mbeya Red Potatoes', qty: 4.5, uom: 'kg', cost: 8100, reason: 'Bruised during prep', user: 'Chef Baraka', t: now - 4 * 3600 * 1000 },
  { id: 'wst_2', stockId: 'stk_milk', name: 'Fresh Milk', qty: 2.0, uom: 'L', cost: 4800, reason: 'Sour after power dip', user: 'Hamisi Bakari', t: now - 24 * 3600 * 1000 }
];

export const INITIAL_CHECKLISTS = [
  { id: 'chk_open', title: 'Morning Opening Checklist', type: 'opening', date: new Date().toISOString().slice(0, 10), completed: true, signedBy: 'Rehema Said (GM)', items: [
    { text: 'Cash drawer float verified (TSh 200,000)', done: true },
    { text: 'Kitchen cold room temp below 4°C (Logged 3.1°C)', done: true },
    { text: 'Grill gas valves and extraction fans active', done: true },
    { text: 'POS and KDS terminals online and synced', done: true },
    { text: 'Staff grooming and health check passed', done: true }
  ]},
  { id: 'chk_haccp', title: 'HACCP & Temperature Safety Log', type: 'haccp', date: new Date().toISOString().slice(0, 10), completed: true, signedBy: 'Chef Baraka', items: [
    { text: 'Walk-in Meat Cooler: 2.4°C (Normal: 0-4°C)', done: true },
    { text: 'Dairy Refrigerator: 3.2°C (Normal: 1-4°C)', done: true },
    { text: 'Cooked Food Pass Warmer: 68°C (Normal: >63°C)', done: true },
    { text: 'Handwash stations stocked with antibacterial soap', done: true }
  ]},
  { id: 'chk_close', title: 'Shift End Closing Checklist', type: 'closing', date: new Date().toISOString().slice(0, 10), completed: false, signedBy: null, items: [
    { text: 'Blind cash drawer count entered by cashier', done: false },
    { text: 'All open bills settled or transferred', done: false },
    { text: 'Waiter cash hand-over balanced with zero variance', done: false },
    { text: 'Grill and fryers safely extinguished & cleaned', done: false },
    { text: 'Z-Report generated and synced to HQ', done: false }
  ]}
];

export const INITIAL_AUDIT_LOG = [
  { id: 'aud_1', t: now - 75 * 60 * 1000, user: 'Zawadi Ally (Cashier)', action: 'PAYMENT_VERIFIED', detail: 'Verified Tigo/M-Pesa payment TSh 42,000 for Order #1004' },
  { id: 'aud_2', t: now - 74 * 60 * 1000, user: 'System (Engine)', action: 'COMMISSION_POSTED', detail: 'Posted commission TSh 2,100 snapshot for Waiter Amani Juma (Order #1004)' },
  { id: 'aud_3', t: now - 60 * 60 * 1000, user: 'Rehema Said (GM)', action: 'POLICY_SAVED', detail: 'Updated default commission rate to 5% gross' },
  { id: 'aud_4', t: now - 40 * 60 * 1000, user: 'Chef Baraka', action: '86_STATUS_UPDATE', detail: 'Checked menu availability (all items currently active)' },
  { id: 'aud_5', t: now - 5 * 60 * 1000, user: 'Hamisi Bakari', action: 'STOCK_DEPLETION', detail: 'Theoretical inventory updated after Order #1005 entry' }
];

export const SEED = {
  no: 1006,
  siteId: 'masaki',
  shiftState: 'service', // opening, service, closed
  openingFloat: 200000,
  countedCash: '',
  policy: {
    method: 'percent', // 'percent' | 'fixed' | 'tiered'
    rate: 5,
    fixed: 2000,
    basis: 'gross', // 'gross' | 'net'
    trigger: 'payment', // 'payment' | 'served'
    from: new Date().toISOString().slice(0, 10),
    overrides: { w1: 5.5 }
  },
  waiters: WAITERS,
  users: USERS,
  orders: INITIAL_ORDERS,
  ledger: INITIAL_LEDGER,
  stock: STOCK_ITEMS,
  menu: MENU,
  suppliers: SUPPLIERS,
  transfers: INITIAL_TRANSFERS,
  rfqs: INITIAL_RFQS,
  expenses: INITIAL_EXPENSES,
  finishedGoods: INITIAL_FINISHED_GOODS,
  boms: BOMS,
  productionOrders: INITIAL_PRODUCTION_ORDERS,
  siteRequisitions: INITIAL_SITE_REQUISITIONS,
  purchaseOrders: INITIAL_PURCHASE_ORDERS,
  wasteLog: INITIAL_WASTE_LOG,
  checklists: INITIAL_CHECKLISTS,
  auditLog: INITIAL_AUDIT_LOG,
  outOfStockIds: [], // 86 list
  crateLedger: INITIAL_CRATE_LEDGER,
  kitchenTrackingMode: 'simple', // Option A: 'simple' (costed on transfer to kitchen), Option B: 'recipe' (costed via BOM on sale)
  quickAddedMenuReviewCount: 0
};


import React, { useState, useEffect, createContext } from 'react';
import { SEED, tot, calcNet, calcTax, RECIPES, M } from './data';

export const Ctx = createContext();

export function migrateStock(savedStock) {
  if (!Array.isArray(savedStock) || savedStock.length === 0) return SEED.stock;
  return savedStock.map(item => {
    const seedItem = (SEED.stock || []).find(s => s.id === item.id);
    let storeQty = item.storeQty;
    let kitchenQty = item.kitchenQty;
    let barQty = item.barQty;
    const onHand = Number(item.onHand !== undefined ? item.onHand : (seedItem?.onHand || 0));

    // If sub-location breakdown is missing or all 0 while onHand > 0
    const totalAllocated = (Number(storeQty) || 0) + (Number(kitchenQty) || 0) + (Number(barQty) || 0);
    if (totalAllocated === 0 && onHand > 0) {
      if (seedItem && ((Number(seedItem.storeQty) || 0) + (Number(seedItem.kitchenQty) || 0) + (Number(seedItem.barQty) || 0)) > 0) {
        const seedTotal = (seedItem.storeQty || 0) + (seedItem.kitchenQty || 0) + (seedItem.barQty || 0);
        if (Math.abs(seedTotal - onHand) < 0.01) {
          storeQty = seedItem.storeQty;
          kitchenQty = seedItem.kitchenQty || 0;
          barQty = seedItem.barQty || 0;
        } else {
          const ratio = onHand / (seedTotal || 1);
          kitchenQty = Math.round((seedItem.kitchenQty || 0) * ratio * 10) / 10;
          barQty = Math.round((seedItem.barQty || 0) * ratio * 10) / 10;
          storeQty = Math.max(0, +(onHand - kitchenQty - barQty).toFixed(2));
        }
      } else {
        const loc = (item.loc || '').toLowerCase();
        const cat = (item.cat || '').toLowerCase();
        if (loc.includes('bar') || (cat.includes('drinks') && loc.includes('station'))) {
          barQty = onHand;
          kitchenQty = 0;
          storeQty = 0;
        } else if (loc.includes('kitchen') || loc.includes('pass') || loc.includes('prep')) {
          kitchenQty = onHand;
          storeQty = 0;
          barQty = 0;
        } else {
          // Cold Room, Meat Freezer, Dry Store, Fish Cooler, Fruit Chiller, Dairy Fridge
          storeQty = onHand;
          kitchenQty = 0;
          barQty = 0;
        }
      }
    }

    return {
      ...(seedItem || {}),
      ...item,
      baseUnit: item.baseUnit || seedItem?.baseUnit || item.uom || 'bottle',
      purchaseUnits: item.purchaseUnits || seedItem?.purchaseUnits || [
        { name: 'Single', factor: 1 },
        { name: 'Crate', factor: 24 }
      ],
      defaultPurchaseUnit: item.defaultPurchaseUnit || seedItem?.defaultPurchaseUnit || 'Single',
      lastPurchaseUnit: item.lastPurchaseUnit || seedItem?.lastPurchaseUnit || 'Single',
      returnable: item.returnable !== undefined ? item.returnable : (seedItem?.returnable || false),
      cratesOnHand: Number(item.cratesOnHand !== undefined ? item.cratesOnHand : (seedItem?.cratesOnHand || 0)),
      emptyBottlesOnHand: Number(item.emptyBottlesOnHand !== undefined ? item.emptyBottlesOnHand : (seedItem?.emptyBottlesOnHand || 0)),
      cratesOwedSupplier: Number(item.cratesOwedSupplier !== undefined ? item.cratesOwedSupplier : (seedItem?.cratesOwedSupplier || 0)),
      supplierId: item.supplierId || seedItem?.supplierId || null,
      trackingMode: item.trackingMode || seedItem?.trackingMode || (item.cat === 'Drinks' ? 'direct_link' : 'simple_issue'),
      storeQty: Number(storeQty) || 0,
      kitchenQty: Number(kitchenQty) || 0,
      barQty: Number(barQty) || 0,
      onHand: onHand,
      theoretical: Number(item.theoretical !== undefined ? item.theoretical : onHand)
    };
  });
}

export function Store({ children }) {
  const [S, setS] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('resto_erp_v1_1'));
      if (saved && saved.orders && saved.stock) {
        const mergedOrders = [...(saved.orders || [])];
        (SEED.orders || []).forEach(so => {
          if (!mergedOrders.some(mo => mo.id === so.id)) {
            mergedOrders.push(so);
          }
        });
        return {
          ...SEED,
          ...saved,
          orders: mergedOrders,
          stock: migrateStock(saved.stock),
          crateLedger: saved.crateLedger && saved.crateLedger.length ? saved.crateLedger : SEED.crateLedger,
          kitchenTrackingMode: saved.kitchenTrackingMode || SEED.kitchenTrackingMode || 'simple',
          quickAddedMenuReviewCount: saved.quickAddedMenuReviewCount || 0,
          transfers: saved.transfers && saved.transfers.length ? saved.transfers : SEED.transfers,
          rfqs: saved.rfqs && saved.rfqs.length ? saved.rfqs : SEED.rfqs,
          expenses: saved.expenses && saved.expenses.length ? saved.expenses : SEED.expenses,
          suppliers: saved.suppliers && saved.suppliers.length ? saved.suppliers : SEED.suppliers,
          finishedGoods: saved.finishedGoods && saved.finishedGoods.length ? saved.finishedGoods : SEED.finishedGoods,
          boms: saved.boms && saved.boms.length ? saved.boms : SEED.boms,
          productionOrders: saved.productionOrders && saved.productionOrders.length ? saved.productionOrders : SEED.productionOrders,
          siteRequisitions: saved.siteRequisitions && saved.siteRequisitions.length ? saved.siteRequisitions : SEED.siteRequisitions,
          menu: saved.menu && saved.menu.length ? saved.menu : SEED.menu
        };
      }
    } catch (e) {
      console.warn('Failed to parse cached store, using seed', e);
    }
    return SEED;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('resto_erp_v1_1', JSON.stringify(S));
    } catch (e) {}
  }, [S]);

  // Cross-tab sync via storage events
  useEffect(() => {
    const handleStorage = e => {
      if (e.key === 'resto_erp_v1_1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.stock) {
            parsed.stock = migrateStock(parsed.stock);
          }
          setS(parsed);
        } catch (x) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Helper to record audit log
  const logAudit = (s, user, action, detail) => [
    {
      id: 'aud_' + Date.now() + Math.random().toString(36).slice(2, 5),
      t: Date.now(),
      user: user || 'System',
      action,
      detail
    },
    ...(s.auditLog || [])
  ];

  // Engine Actions
  const A = {
    // POS / Customer / Waiter: Place Order
    // Drinks: Direct link - deducts from Bar/Counter stock (selling location) with pack multiplier (no BOM!)
    // Kitchen Food: Option A (Simple - costed on transfer) vs Option B (Recipe BOM - deducted from kitchen stock)
    place: (orderData, actor = 'System') => setS(s => {
      const orderId = Date.now();
      const orderNo = '#' + (s.no || 1000);
      const gross = tot(orderData);
      const net = calcNet(gross);
      const tax = calcTax(gross);

      const activeMenu = s.menu && s.menu.length ? s.menu : MENU;
      const menuMap = Object.fromEntries(activeMenu.map(m => [m.id, m]));
      const trackingMode = s.kitchenTrackingMode || 'simple';

      let lowBarAlerts = [];

      const updatedStock = (s.stock || []).map(item => {
        let barDepletion = 0;
        let kitchenDepletion = 0;

        (orderData.it || []).forEach(line => {
          const menuItem = menuMap[line.id] || M[line.id];
          if (!menuItem) return;

          // 1. Direct Link for Drinks & Ready Items (Design Requirement 3)
          // No recipe needed: deducts directly from Bar Fridge / Counter Fridge
          const isDirectLink = menuItem.stockId === item.id ||
            (item.itemType === 'direct_resale' && (item.menuId === line.id || item.name.toLowerCase() === menuItem.n.toLowerCase()));

          if (isDirectLink) {
            const multiplier = Number(menuItem.packMultiplier) || 1;
            barDepletion += (multiplier * line.q);
          }

          // 2. Kitchen Food Depletion: Option B (Recipe-based)
          // Only deconstructs recipe ingredients if restaurant is in Recipe Mode OR item is explicitly recipe_bom
          const useRecipe = trackingMode === 'recipe' || item.trackingMode === 'recipe_bom';
          if (useRecipe) {
            const recipe = RECIPES[line.id] || [];
            recipe.forEach(ing => {
              if (ing.stockId === item.id) {
                kitchenDepletion += (ing.qty * line.q);
              }
            });
          }
        });

        if (barDepletion > 0 || kitchenDepletion > 0) {
          const newBarQty = Math.max(0, +((item.barQty || 0) - barDepletion).toFixed(2));
          const newKitchenQty = Math.max(0, +((item.kitchenQty || 0) - kitchenDepletion).toFixed(2));
          const newStoreQty = item.storeQty || 0;
          const newOnHand = +(newStoreQty + newBarQty + newKitchenQty).toFixed(2);
          const totalDepletion = barDepletion + kitchenDepletion;
          const newTheoretical = Math.max(0, +((item.theoretical !== undefined ? item.theoretical : item.onHand) - totalDepletion).toFixed(2));

          if (newBarQty <= 10 && item.cat === 'Drinks') {
            lowBarAlerts.push(`${item.name} low in bar (${newBarQty} left, ${newStoreQty} in main store)`);
          }

          return {
            ...item,
            barQty: newBarQty,
            kitchenQty: newKitchenQty,
            onHand: newOnHand,
            theoretical: newTheoretical
          };
        }
        return item;
      });

      const newOrder = {
        ...orderData,
        id: orderId,
        no: orderNo,
        st: 'placed',
        paid: false,
        t: Date.now(),
        created_at: Date.now(),
        gross,
        net,
        tax,
        log: [
          `Order placed by ${actor || 'User'} (${orderData.src}) at ${new Date().toLocaleTimeString()}`,
          ...(lowBarAlerts.length ? [`Bar inventory alert: ${lowBarAlerts.join('; ')}`] : [])
        ]
      };

      const audit = logAudit(
        s,
        actor,
        'ORDER_PLACED',
        `Placed ${orderNo} for ${orderData.tb} (Total: TSh ${gross.toLocaleString()})${lowBarAlerts.length ? ' · Bar Restock Alert' : ''}`
      );

      return {
        ...s,
        no: s.no + 1,
        orders: [newOrder, ...s.orders],
        stock: updatedStock,
        auditLog: audit
      };
    }),

    // Order status transition (KDS, Waiter, Cashier)
    st: (id, newSt, actor = 'Staff') => setS(s => {
      const order = s.orders.find(o => o.id === id);
      if (!order) return s;

      const updatedOrders = s.orders.map(o => {
        if (o.id === id) {
          return {
            ...o,
            st: newSt,
            log: [...(o.log || []), `${newSt.toUpperCase()} by ${actor} at ${new Date().toLocaleTimeString()}`]
          };
        }
        return o;
      });

      let updatedLedger = s.ledger;
      let auditDetail = `Order ${order.no} status updated to ${newSt}`;

      // Check if commission qualifies upon 'served' rule
      const policy = s.policy || { method: 'percent', rate: 5, basis: 'gross', trigger: 'payment' };
      if (newSt === 'served' && policy.trigger === 'served' && order.wid && !s.ledger.some(l => l.oid === id)) {
        const waiterOverride = (policy.overrides && policy.overrides[order.wid]) || null;
        const rate = waiterOverride !== null ? waiterOverride : policy.rate;
        const base = policy.basis === 'net' ? calcNet(tot(order)) : tot(order);
        const amt = Math.round(policy.method === 'fixed' ? (policy.fixed || 2000) : (base * rate) / 100);

        updatedLedger = [
          {
            id: 'L' + id + '_' + Date.now(),
            oid: id,
            wid: order.wid,
            method: policy.method,
            rate,
            basis: policy.basis,
            eligibleAmt: base,
            amt,
            st: 'pending',
            t: Date.now(),
            note: `Earned on order served (${order.no})`
          },
          ...s.ledger
        ];
        auditDetail += ` · Commission TSh ${amt.toLocaleString()} posted (policy: served)`;
      }

      return {
        ...s,
        orders: updatedOrders,
        ledger: updatedLedger,
        auditLog: logAudit(s, actor, 'ORDER_STATUS_CHANGED', auditDetail)
      };
    }),

    // Waiter assignment / re-assignment
    assign: (id, wid, actor = 'Cashier') => setS(s => {
      const waiter = s.waiters.find(w => w.id === wid);
      const name = waiter ? waiter.name : 'Unassigned';
      return {
        ...s,
        orders: s.orders.map(o => o.id === id ? {
          ...o,
          wid,
          log: [...(o.log || []), `Assigned to ${name} by ${actor} at ${new Date().toLocaleTimeString()}`]
        } : o),
        auditLog: logAudit(s, actor, 'WAITER_REASSIGNED', `Order reassigned to ${name}`)
      };
    }),

    // Payment collection (Direct mobile money, cashier cash, split, etc.)
    // Posts snapshot commission once (WCM-10, Business Rule 9)
    pay: (id, method = 'cash', ref = '', actor = 'Cashier') => setS(s => {
      const order = s.orders.find(o => o.id === id);
      if (!order || order.paid) return s;

      const policy = s.policy || { method: 'percent', rate: 5, fixed: 2000, basis: 'gross', trigger: 'payment' };
      const waiterOverride = (policy.overrides && policy.overrides[order.wid]) !== undefined ? policy.overrides[order.wid] : null;
      const rate = waiterOverride !== null ? waiterOverride : (policy.rate || 5);
      const gross = tot(order);
      const base = policy.basis === 'net' ? calcNet(gross) : gross;
      const commissionAmt = Math.round(policy.method === 'fixed' ? (policy.fixed || 2000) : (base * rate) / 100);

      // Only add to ledger if waiter is assigned and not already posted
      const hasLedger = s.ledger.some(l => l.oid === id && !l.reversal_of_id);
      let updatedLedger = s.ledger;

      if (order.wid && !hasLedger) {
        const ledgerEntry = {
          id: 'L' + id + '_' + Date.now(),
          oid: id,
          wid: order.wid,
          method: policy.method,
          rate,
          basis: policy.basis,
          eligibleAmt: base,
          amt: commissionAmt,
          st: 'pending',
          t: Date.now(),
          note: `Payment confirmed (${method.toUpperCase()}${ref ? ' Ref: ' + ref : ''})`
        };
        updatedLedger = [ledgerEntry, ...s.ledger];
      }

      const updatedOrders = s.orders.map(o => o.id === id ? {
        ...o,
        paid: true,
        pm: method,
        payRef: ref || ('TX' + Math.random().toString(36).slice(2, 8).toUpperCase()),
        st: 'paid',
        paid_at: Date.now(),
        log: [...(o.log || []), `Payment confirmed via ${method.toUpperCase()} by ${actor}`]
      } : o);

      return {
        ...s,
        orders: updatedOrders,
        ledger: updatedLedger,
        auditLog: logAudit(s, actor, 'PAYMENT_CONFIRMED', `Order ${order.no} paid via ${method} (TSh ${gross.toLocaleString()})`)
      };
    }),

    // Cancel order with reason code (WCM-14: reverses commission if already posted)
    cancel: (id, reason = 'Customer changed mind', actor = 'Manager') => setS(s => {
      const order = s.orders.find(o => o.id === id);
      if (!order) return s;

      // Check if commission had been posted
      const existingLedger = s.ledger.find(l => l.oid === id && l.st !== 'reversed');
      let updatedLedger = s.ledger;

      if (existingLedger) {
        const reversalEntry = {
          id: 'REV_' + existingLedger.id,
          oid: id,
          wid: existingLedger.wid,
          method: existingLedger.method,
          rate: existingLedger.rate,
          basis: existingLedger.basis,
          eligibleAmt: -existingLedger.eligibleAmt,
          amt: -existingLedger.amt,
          st: 'reversed',
          reversal_of_id: existingLedger.id,
          t: Date.now(),
          note: `Reversal: Order ${order.no} cancelled (${reason})`
        };
        updatedLedger = [reversalEntry, ...s.ledger.map(l => l.id === existingLedger.id ? { ...l, st: 'reversed' } : l)];
      }

      return {
        ...s,
        orders: s.orders.map(o => o.id === id ? {
          ...o,
          st: 'cancelled',
          why: reason,
          log: [...(o.log || []), `Cancelled by ${actor}: ${reason}`]
        } : o),
        ledger: updatedLedger,
        auditLog: logAudit(s, actor, 'ORDER_CANCELLED', `Cancelled ${order.no}. Reason: ${reason}`)
      };
    }),

    // KDS Interactive Item Toggles & Order Transitions (SRS Section 4.5 & Image cb6e1d9e)
    toggleOrderItemDone: (orderId, itemIndex, actor = 'Kitchen Station') => setS(s => ({
      ...s,
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;
        const updatedItems = (o.it || []).map((line, idx) => {
          if (idx !== itemIndex) return line;
          return { ...line, done: !line.done };
        });
        return {
          ...o,
          it: updatedItems,
          log: [...(o.log || []), `Item #${itemIndex + 1} marked ${updatedItems[itemIndex]?.done ? 'DONE' : 'PENDING'} by ${actor}`]
        };
      })
    })),

    voidOrderItem: (orderId, itemIndex, actor = 'Kitchen Station') => setS(s => ({
      ...s,
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;
        const updatedItems = (o.it || []).map((line, idx) => {
          if (idx !== itemIndex) return line;
          return { ...line, voided: !line.voided };
        });
        return {
          ...o,
          it: updatedItems,
          log: [...(o.log || []), `Item #${itemIndex + 1} VOID toggled by ${actor}`]
        };
      })
    })),

    doneAllOrder: (orderId, actor = 'Chef Expo') => setS(s => ({
      ...s,
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;
        const updatedItems = (o.it || []).map(line => ({ ...line, done: true }));
        return {
          ...o,
          st: 'ready',
          it: updatedItems,
          log: [...(o.log || []), `DONE ALL completed by ${actor} at ${new Date().toLocaleTimeString()}`]
        };
      }),
      auditLog: logAudit(s, actor, 'KDS_DONE_ALL', `Order ${orderId} marked ready at pass`)
    })),

    reopenOrder: (orderId, actor = 'Chef Expo') => setS(s => ({
      ...s,
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          st: 'preparing',
          log: [...(o.log || []), `Reopened back to Cooking by ${actor} at ${new Date().toLocaleTimeString()}`]
        };
      }),
      auditLog: logAudit(s, actor, 'KDS_ORDER_REOPENED', `Order ${orderId} moved back to cooking queue`)
    })),

    clearCompletedOrders: (actor = 'Chef Expo') => setS(s => ({
      ...s,
      orders: s.orders.map(o => {
        if (['ready', 'served'].includes(o.st)) {
          return { ...o, st: 'closed', log: [...(o.log || []), `Archived by KDS CLEAR`] };
        }
        return o;
      }),
      auditLog: logAudit(s, actor, 'KDS_CLEAR_COMPLETED', 'Archived completed KDS tickets')
    })),

    // Commission Policy Management (WCM-01 to WCM-10)
    setPolicy: (newPolicy, actor = 'Manager') => setS(s => ({
      ...s,
      policy: {
        ...newPolicy,
        from: new Date().toISOString().slice(0, 10),
        updatedBy: actor
      },
      auditLog: logAudit(s, actor, 'POLICY_UPDATED', `Commission policy set to ${newPolicy.method} (${newPolicy.rate}% or TSh ${newPolicy.fixed}) basis ${newPolicy.basis}`)
    })),

    // Approve pending commission entries
    approve: (targetId = 'all', actor = 'Manager') => setS(s => ({
      ...s,
      ledger: s.ledger.map(l => {
        if (targetId === 'all' || l.id === targetId) {
          return l.st === 'pending' ? { ...l, st: 'approved', approvedBy: actor, approvedAt: Date.now() } : l;
        }
        return l;
      }),
      auditLog: logAudit(s, actor, 'COMMISSION_APPROVED', `Approved commission entries (${targetId})`)
    })),

    // Record commission payout to waiter
    payout: (waiterId = 'all', actor = 'Manager') => setS(s => ({
      ...s,
      ledger: s.ledger.map(l => {
        if ((waiterId === 'all' || l.wid === waiterId) && l.st === 'approved') {
          return { ...l, st: 'paid', paidAt: Date.now(), paidBy: actor };
        }
        return l;
      }),
      auditLog: logAudit(s, actor, 'COMMISSION_PAYOUT', `Commission paid out to waiter ${waiterId}`)
    })),

    // Rotate Waiter token (CPT-04: creates new token, revoking prior)
    rot: (wid, actor = 'Waiter') => setS(s => {
      const waiter = s.waiters.find(w => w.id === wid);
      const prefix = waiter ? waiter.name.split(' ')[0].toLowerCase() : 'w';
      const newToken = `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      return {
        ...s,
        waiters: s.waiters.map(w => w.id === wid ? { ...w, tok: newToken, rotatedAt: Date.now() } : w),
        auditLog: logAudit(s, actor, 'WAITER_LINK_ROTATED', `Rotated link token for ${waiter?.name || wid}`)
      };
    }),

    // Kitchen 86-ing / Menu Out-of-stock toggle (KDS-06)
    toggle86: (menuId, actor = 'Chef') => setS(s => {
      const isOut = (s.outOfStockIds || []).includes(menuId);
      const updatedList = isOut
        ? s.outOfStockIds.filter(id => id !== menuId)
        : [...(s.outOfStockIds || []), menuId];
      const itemName = M[menuId] ? M[menuId].n : `Item #${menuId}`;

      return {
        ...s,
        outOfStockIds: updatedList,
        auditLog: logAudit(s, actor, '86_STATUS_TOGGLE', `${isOut ? 'Restored in-stock' : 'Marked 86 (Out of Stock)'}: ${itemName}`)
      };
    }),

    // Inventory: Physical Stock Count & Variance submission (INV-05)
    recordCount: (counts, actor = 'Storekeeper') => setS(s => {
      // counts is { [stockId]: physicalQty }
      const updatedStock = s.stock.map(item => {
        if (counts[item.id] !== undefined) {
          const physical = +counts[item.id];
          return {
            ...item,
            onHand: physical,
            lastCountAt: Date.now()
          };
        }
        return item;
      });

      return {
        ...s,
        stock: updatedStock,
        auditLog: logAudit(s, actor, 'STOCK_COUNT_SUBMITTED', `Physical cycle count submitted with variance adjustments`)
      };
    }),

    // Inventory: Goods Receipt against Purchase Order (INV-03, PRC-02)
    receivePO: (poId, tempLog = '3.5°C', actor = 'Storekeeper') => setS(s => {
      const po = s.purchaseOrders.find(p => p.id === poId);
      if (!po || po.status === 'received') return s;

      // Increase storeQty, onHand, and theoretical stock
      let updatedMenu = [...(s.menu || [])];
      const updatedStock = s.stock.map(item => {
        const poLine = po.items.find(l => l.stockId === item.id);
        if (poLine) {
          const added = +poLine.qty;
          const newStoreQty = +( (item.storeQty || 0) + added ).toFixed(2);
          const newOnHand = +( (item.onHand || 0) + added ).toFixed(2);

          // If direct resale item and has selling price, ensure menu is synced
          if (item.itemType === 'direct_resale' && item.sellingPrice) {
            const menuIdx = updatedMenu.findIndex(m => m.id === item.menuId || m.n.toLowerCase() === item.name.toLowerCase());
            if (menuIdx >= 0) {
              updatedMenu[menuIdx] = { ...updatedMenu[menuIdx], p: item.sellingPrice };
            } else {
              const newMenuId = item.menuId || (Date.now() + Math.floor(Math.random() * 100));
              updatedMenu.push({
                id: newMenuId,
                n: item.name,
                e: item.cat === 'Drinks' ? '🥤' : '🍿',
                p: item.sellingPrice,
                c: item.cat === 'Drinks' ? 'Drinks' : 'Sides',
                t: 1,
                r: 4.9,
                station: 'bar',
                allergens: [],
                d: `Chilled ${item.name} served directly.`
              });
            }
          }

          return {
            ...item,
            storeQty: newStoreQty,
            onHand: newOnHand,
            theoretical: +( (item.theoretical || 0) + added ).toFixed(2),
            lastCost: poLine.unitPrice
          };
        }
        return item;
      });

      const updatedPOs = s.purchaseOrders.map(p => p.id === poId ? {
        ...p,
        status: 'received',
        tempLog,
        receivedAt: Date.now(),
        receivedBy: actor
      } : p);

      return {
        ...s,
        stock: updatedStock,
        menu: updatedMenu,
        purchaseOrders: updatedPOs,
        auditLog: logAudit(s, actor, 'PO_RECEIVED', `Received goods for ${poId} from ${po.supplierName} (Temp: ${tempLog})`)
      };
    }),

    // Fast Drinks & Stock Purchasing (Design Requirement 1 & 2)
    // One base unit, many purchase units, automatic conversion, weighted moving average cost, and returnable crates
    fastPurchase: (data, actor = 'Storekeeper') => setS(s => {
      const {
        supplierId,
        stockId,
        purchaseUnit = 'Crate',
        factor = 24,
        purchaseQty = 1,
        unitPrice = 0, // price per purchase unit (e.g. 24,000 / crate)
        totalCost = 0,
        returnableCrates = 0,
        cratesReturnedNow = 0,
        notes = '',
        directSellingPrice = null
      } = data;

      const actualTotalCost = totalCost > 0 ? totalCost : Math.round(purchaseQty * unitPrice);
      const baseUnitsAdded = Math.round(purchaseQty * factor);
      const costPerBaseUnit = baseUnitsAdded > 0 ? Math.round(actualTotalCost / baseUnitsAdded) : unitPrice;

      const sup = (s.suppliers || []).find(x => x.id === supplierId);
      const poId = 'PO-' + (880 + (s.purchaseOrders || []).length + 1);

      let updatedMenu = [...(s.menu || [])];
      let targetItemName = '';

      const updatedStock = (s.stock || []).map(item => {
        if (item.id === stockId) {
          targetItemName = item.name;
          const currentOnHand = Number(item.onHand) || 0;
          const currentCost = Number(item.unitCost) || costPerBaseUnit;

          // Moving weighted average cost per base unit
          const totalOldValuation = currentOnHand * currentCost;
          const totalNewValuation = totalOldValuation + actualTotalCost;
          const newOnHand = +(currentOnHand + baseUnitsAdded).toFixed(2);
          const weightedCost = newOnHand > 0 ? Math.round(totalNewValuation / newOnHand) : costPerBaseUnit;

          const newStoreQty = +((item.storeQty || 0) + baseUnitsAdded).toFixed(2);
          const newBarQty = item.barQty || 0;
          const newKitchenQty = item.kitchenQty || 0;

          // Returnable crates tracking
          const newCratesOnHand = (item.cratesOnHand || 0) + Number(returnableCrates || 0) - Number(cratesReturnedNow || 0);
          const newCratesOwed = (item.cratesOwedSupplier || 0) + Number(returnableCrates || 0) - Number(cratesReturnedNow || 0);

          // Update menu selling price if configured
          if (directSellingPrice && item.itemType === 'direct_resale') {
            const mIdx = updatedMenu.findIndex(m => m.id === item.menuId || m.stockId === item.id);
            if (mIdx >= 0) {
              updatedMenu[mIdx] = { ...updatedMenu[mIdx], p: Number(directSellingPrice) };
            }
          }

          return {
            ...item,
            storeQty: newStoreQty,
            onHand: newOnHand,
            theoretical: +((item.theoretical !== undefined ? item.theoretical : currentOnHand) + baseUnitsAdded).toFixed(2),
            unitCost: weightedCost,
            lastPurchaseUnit: purchaseUnit,
            lastPurchasePrice: actualTotalCost,
            cratesOnHand: Math.max(0, newCratesOnHand),
            cratesOwedSupplier: Math.max(0, newCratesOwed),
            sellingPrice: directSellingPrice ? Number(directSellingPrice) : item.sellingPrice
          };
        }
        return item;
      });

      // Update Crate Ledger for returnable bottles/crates
      let updatedCrateLedger = s.crateLedger || [];
      if (returnableCrates > 0 || cratesReturnedNow > 0) {
        const existingCrateIdx = updatedCrateLedger.findIndex(c => c.supplierId === supplierId);
        if (existingCrateIdx >= 0) {
          const c = updatedCrateLedger[existingCrateIdx];
          const newRec = (c.cratesReceived || 0) + Number(returnableCrates || 0);
          const newRet = (c.cratesReturned || 0) + Number(cratesReturnedNow || 0);
          updatedCrateLedger[existingCrateIdx] = {
            ...c,
            cratesReceived: newRec,
            cratesReturned: newRet,
            netCratesOwed: Math.max(0, newRec - newRet),
            lastUpdated: Date.now()
          };
        } else {
          updatedCrateLedger.push({
            id: 'crtl_' + Date.now(),
            supplierId,
            supplierName: sup?.name || 'Beverage Supplier',
            drinkName: targetItemName || 'Crated Drinks',
            cratesReceived: Number(returnableCrates || 0),
            cratesReturned: Number(cratesReturnedNow || 0),
            netCratesOwed: Math.max(0, Number(returnableCrates || 0) - Number(cratesReturnedNow || 0)),
            depositPerCrate: 15000,
            emptyBottlesOnHand: 0,
            lastUpdated: Date.now()
          });
        }
      }

      // Record auto-received PO
      const poEntry = {
        id: poId,
        supplierId,
        supplierName: sup?.name || 'Beverage Supplier',
        siteId: s.siteId || 'masaki',
        status: 'received',
        receivedAt: Date.now(),
        receivedBy: actor,
        items: [
          {
            stockId,
            name: targetItemName,
            purchaseQty: Number(purchaseQty),
            purchaseUnit,
            factor,
            qty: baseUnitsAdded,
            unitPrice: costPerBaseUnit,
            totalCost: actualTotalCost,
            uom: 'bottles'
          }
        ],
        total: actualTotalCost,
        createdAt: Date.now(),
        notes: notes || `Fast Purchase: ${purchaseQty} ${purchaseUnit} (= ${baseUnitsAdded} base units received into Main Store)`
      };

      return {
        ...s,
        stock: updatedStock,
        menu: updatedMenu,
        crateLedger: updatedCrateLedger,
        purchaseOrders: [poEntry, ...(s.purchaseOrders || [])],
        auditLog: logAudit(
          s,
          actor,
          'FAST_PURCHASE_RECEIVED',
          `Fast received ${purchaseQty} ${purchaseUnit} (= ${baseUnitsAdded} units) of ${targetItemName} from ${sup?.name || 'Supplier'} (TSh ${actualTotalCost.toLocaleString()})`
        )
      };
    }),

    // Fast Transfer from Store to Bar or Kitchen with Purchase Units and Option A / B tracking
    fastTransfer: (data, actor = 'Storekeeper') => setS(s => {
      const {
        stockId,
        fromLoc = 'Main Store',
        toLoc = 'Bar Station',
        purchaseUnit = 'Single',
        factor = 1,
        purchaseQty = 1,
        notes = ''
      } = data;

      const baseQty = Math.round(purchaseQty * factor);
      const transferId = 'TR-' + (500 + (s.transfers || []).length + 1);

      let targetItem = null;
      const updatedStock = (s.stock || []).map(item => {
        if (item.id === stockId) {
          targetItem = item;
          let sQ = item.storeQty || 0;
          let bQ = item.barQty || 0;
          let kQ = item.kitchenQty || 0;

          // Deduct from source
          if (fromLoc.includes('Store') || fromLoc.includes('Main') || fromLoc.includes('Beverage')) {
            sQ = Math.max(0, +(sQ - baseQty).toFixed(2));
          } else if (fromLoc.includes('Bar')) {
            bQ = Math.max(0, +(bQ - baseQty).toFixed(2));
          } else if (fromLoc.includes('Kitchen')) {
            kQ = Math.max(0, +(kQ - baseQty).toFixed(2));
          }

          // Add to destination
          if (toLoc.includes('Bar') || toLoc.includes('Fridge') || toLoc.includes('Chiller')) {
            bQ = +(bQ + baseQty).toFixed(2);
          } else if (toLoc.includes('Kitchen')) {
            kQ = +(kQ + baseQty).toFixed(2);
          } else if (toLoc.includes('Store')) {
            sQ = +(sQ + baseQty).toFixed(2);
          }

          const onHand = +(sQ + bQ + kQ).toFixed(2);
          return {
            ...item,
            storeQty: sQ,
            barQty: bQ,
            kitchenQty: kQ,
            onHand
          };
        }
        return item;
      });

      // Option A (Simple): When food ingredients are transferred to kitchen, cost is counted upon issue!
      let updatedExpenses = s.expenses || [];
      if (toLoc.includes('Kitchen') && (s.kitchenTrackingMode === 'simple' || targetItem?.trackingMode === 'simple_issue')) {
        const costValue = Math.round(baseQty * (targetItem?.unitCost || 2000));
        updatedExpenses = [
          {
            id: 'exp_iss_' + Date.now(),
            t: Date.now(),
            category: 'Kitchen Ingredient Issues (Option A)',
            name: `Kitchen Issue: ${baseQty} ${targetItem?.baseUnit || targetItem?.uom} ${targetItem?.name}`,
            amount: costValue,
            method: 'internal_transfer',
            ref: transferId
          },
          ...updatedExpenses
        ];
      }

      const transferRecord = {
        id: transferId,
        t: Date.now(),
        fromLoc,
        toLoc,
        items: [
          {
            stockId,
            name: targetItem?.name || 'Stock Item',
            qty: baseQty,
            uom: targetItem?.baseUnit || targetItem?.uom || 'units',
            purchaseUnit,
            purchaseQty,
            factor
          }
        ],
        transferredBy: actor,
        acceptedBy: toLoc.includes('Kitchen') ? 'Chef Baraka (Kitchen Lead)' : 'Zawadi Ally (Bar Lead)',
        status: 'completed',
        notes: notes || `Transferred ${purchaseQty} ${purchaseUnit} (= ${baseQty} base units) to ${toLoc}`
      };

      return {
        ...s,
        stock: updatedStock,
        expenses: updatedExpenses,
        transfers: [transferRecord, ...(s.transfers || [])],
        auditLog: logAudit(
          s,
          actor,
          'FAST_TRANSFER',
          `Transferred ${purchaseQty} ${purchaseUnit} (= ${baseQty} ${targetItem?.baseUnit || 'units'}) of ${targetItem?.name} from ${fromLoc} to ${toLoc}`
        )
      };
    }),

    // Quick Add Menu Item on Site (Design Requirement 6: Kitchen / Cashier in under 10 seconds)
    // Goes live on POS immediately, marked with "needsReview: true"
    quickAddMenuItem: (data, actor = 'Cashier') => setS(s => {
      const newId = Date.now() + Math.floor(Math.random() * 100);
      const newItem = {
        id: newId,
        n: data.n,
        e: data.e || (data.c === 'Drinks' ? '🍹' : '🍽️'),
        p: Number(data.p) || 5000,
        c: data.c || 'Drinks',
        station: data.station || (data.c === 'Drinks' ? 'bar' : 'grill'),
        t: Number(data.t) || (data.c === 'Drinks' ? 1 : 12),
        r: 5.0,
        packMultiplier: Number(data.packMultiplier) || 1,
        stockId: data.stockId || null,
        allergens: data.allergens || [],
        d: data.d || `Quick-added by ${actor} on site.`,
        needsReview: true,
        addedBy: actor,
        addedAt: Date.now()
      };

      return {
        ...s,
        menu: [newItem, ...(s.menu || [])],
        quickAddedMenuReviewCount: (s.quickAddedMenuReviewCount || 0) + 1,
        auditLog: logAudit(
          s,
          actor,
          'QUICK_MENU_ITEM_ADDED',
          `Quick-added "${newItem.n}" (TSh ${newItem.p.toLocaleString()}) on site — live on POS, marked "Needs Review"`
        )
      };
    }),

    // Manager reviews and links quick-added menu items to inventory / cost
    reviewMenuItem: (menuId, reviewData, actor = 'Manager') => setS(s => {
      const updatedMenu = (s.menu || []).map(m => {
        if (m.id === menuId) {
          return {
            ...m,
            ...reviewData,
            needsReview: false,
            reviewedBy: actor,
            reviewedAt: Date.now()
          };
        }
        return m;
      });

      return {
        ...s,
        menu: updatedMenu,
        quickAddedMenuReviewCount: Math.max(0, (s.quickAddedMenuReviewCount || 1) - 1),
        auditLog: logAudit(s, actor, 'MENU_ITEM_REVIEWED', `Manager reviewed & linked stock for menu item #${menuId}`)
      };
    }),

    // Create Normal / Detailed Menu Item (with Finished Good photo, pricing, station, allergens, and stock link)
    createMenuItem: (data, actor = 'Staff') => setS(s => {
      const newId = Date.now() + Math.floor(Math.random() * 100);
      const newItem = {
        id: newId,
        n: data.n || 'New Dish',
        e: data.e || (data.c === 'Drinks' ? '🍹' : '🍽️'),
        p: Number(data.p) || 5000,
        c: data.c || 'Grills',
        station: data.station || (data.c === 'Drinks' ? 'bar' : 'grill'),
        t: Number(data.t) || (data.c === 'Drinks' ? 2 : 15),
        r: Number(data.r) || 4.8,
        allergens: Array.isArray(data.allergens) ? data.allergens : [],
        d: data.d || '',
        img: data.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        stockId: data.stockId || null,
        packMultiplier: Number(data.packMultiplier) || 1,
        costPrice: Number(data.costPrice) || 0,
        recipe: Array.isArray(data.recipe) ? data.recipe : [],
        isSpecial: !!data.isSpecial,
        needsReview: data.needsReview !== undefined ? data.needsReview : false,
        addedBy: actor,
        addedAt: Date.now()
      };

      return {
        ...s,
        menu: [newItem, ...(s.menu || [])],
        auditLog: logAudit(
          s,
          actor,
          'MENU_ITEM_CREATED',
          `Created menu item "${newItem.n}" (${newItem.c}, TSh ${newItem.p.toLocaleString()})`
        )
      };
    }),

    // Update existing menu item
    updateMenuItem: (menuId, data, actor = 'Staff') => setS(s => {
      const updatedMenu = (s.menu || []).map(m => {
        if (m.id === menuId) {
          return {
            ...m,
            ...data,
            p: data.p !== undefined ? Number(data.p) : m.p,
            t: data.t !== undefined ? Number(data.t) : m.t,
            packMultiplier: data.packMultiplier !== undefined ? Number(data.packMultiplier) : m.packMultiplier,
            updatedBy: actor,
            updatedAt: Date.now()
          };
        }
        return m;
      });

      return {
        ...s,
        menu: updatedMenu,
        auditLog: logAudit(
          s,
          actor,
          'MENU_ITEM_UPDATED',
          `Updated menu item #${menuId} (${data.n || 'Dish'}) by ${actor}`
        )
      };
    }),

    // Delete / Archive menu item
    deleteMenuItem: (menuId, actor = 'Staff') => setS(s => {
      const itemToDelete = (s.menu || []).find(m => m.id === menuId);
      return {
        ...s,
        menu: (s.menu || []).filter(m => m.id !== menuId),
        outOfStockIds: (s.outOfStockIds || []).filter(id => id !== menuId),
        auditLog: logAudit(
          s,
          actor,
          'MENU_ITEM_DELETED',
          `Removed menu item "${itemToDelete?.n || menuId}" by ${actor}`
        )
      };
    }),

    // Spreadsheet Grid & CSV Batch Registration (Design Requirement 5)
    batchAddStockItems: (itemsList, actor = 'Storekeeper') => setS(s => {
      let updatedStock = [...(s.stock || [])];
      let updatedMenu = [...(s.menu || [])];

      itemsList.forEach(item => {
        const stockId = item.id || ('stk_' + item.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15) + '_' + Math.random().toString(36).slice(2, 5));
        const factor = item.purchaseUnits?.[1]?.factor || item.crateFactor || 24;
        const initialBaseQty = (Number(item.initialCrates) || 0) * factor + (Number(item.initialSingles) || 0);

        const stockEntry = {
          id: stockId,
          name: item.name,
          cat: item.cat || 'Drinks',
          uom: item.baseUnit || 'bottles',
          baseUnit: item.baseUnit || 'bottle',
          purchaseUnits: item.purchaseUnits || [
            { name: 'Single', factor: 1 },
            { name: 'Crate', factor: factor }
          ],
          defaultPurchaseUnit: item.defaultPurchaseUnit || 'Crate',
          lastPurchaseUnit: item.defaultPurchaseUnit || 'Crate',
          lastPurchasePrice: (Number(item.unitCost) || 1000) * factor,
          onHand: initialBaseQty,
          storeQty: initialBaseQty,
          kitchenQty: 0,
          barQty: 0,
          par: Number(item.par) || 100,
          reorder: Number(item.reorder) || 24,
          unitCost: Number(item.unitCost) || 1000,
          sellingPrice: Number(item.sellingPrice) || 2000,
          itemType: item.itemType || 'direct_resale',
          trackingMode: item.trackingMode || 'direct_link',
          loc: item.loc || 'Beverage Store',
          theoretical: initialBaseQty,
          supplierId: item.supplierId || 'sup_coca',
          returnable: item.returnable !== undefined ? item.returnable : true,
          cratesOnHand: Math.floor(initialBaseQty / factor),
          emptyBottlesOnHand: 0,
          cratesOwedSupplier: Math.floor(initialBaseQty / factor)
        };

        const existingIdx = updatedStock.findIndex(x => x.name.toLowerCase() === item.name.toLowerCase());
        if (existingIdx >= 0) {
          updatedStock[existingIdx] = { ...updatedStock[existingIdx], ...stockEntry };
        } else {
          updatedStock.push(stockEntry);
        }

        if (Number(item.sellingPrice) > 0) {
          const menuIdx = updatedMenu.findIndex(m => m.stockId === stockId || m.n.toLowerCase() === item.name.toLowerCase());
          if (menuIdx >= 0) {
            updatedMenu[menuIdx] = { ...updatedMenu[menuIdx], p: Number(item.sellingPrice), stockId };
          } else {
            updatedMenu.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              n: item.name,
              e: item.cat === 'Drinks' ? '🥤' : '🍽️',
              p: Number(item.sellingPrice),
              c: item.cat || 'Drinks',
              station: item.cat === 'Drinks' ? 'bar' : 'grill',
              t: 1,
              r: 5.0,
              packMultiplier: 1,
              stockId,
              allergens: [],
              d: `Chilled ${item.name} served directly.`
            });
          }
        }
      });

      return {
        ...s,
        stock: updatedStock,
        menu: updatedMenu,
        auditLog: logAudit(s, actor, 'BATCH_STOCK_ADDED', `Batch added/updated ${itemsList.length} items via registry`)
      };
    }),

    // Stock adjustments with reasons (Breakage, Expiry, Complimentary, Spoilage, Discrepancy)
    recordStockAdjustment: (data, actor = 'Storekeeper') => setS(s => {
      const { stockId, location = 'Bar', deltaQty = 1, reason = 'Breakage', notes = '' } = data;
      let targetItem = null;

      const updatedStock = (s.stock || []).map(item => {
        if (item.id === stockId) {
          targetItem = item;
          let sQ = item.storeQty || 0;
          let bQ = item.barQty || 0;
          let kQ = item.kitchenQty || 0;

          if (location.includes('Bar')) {
            bQ = Math.max(0, +(bQ - deltaQty).toFixed(2));
          } else if (location.includes('Kitchen')) {
            kQ = Math.max(0, +(kQ - deltaQty).toFixed(2));
          } else {
            sQ = Math.max(0, +(sQ - deltaQty).toFixed(2));
          }

          const onHand = +(sQ + bQ + kQ).toFixed(2);
          return {
            ...item,
            storeQty: sQ,
            barQty: bQ,
            kitchenQty: kQ,
            onHand,
            theoretical: Math.max(0, +((item.theoretical !== undefined ? item.theoretical : onHand) - deltaQty).toFixed(2))
          };
        }
        return item;
      });

      const cost = Math.round(deltaQty * (targetItem?.unitCost || 1000));
      const wasteItem = {
        id: 'adj_' + Date.now(),
        stockId,
        name: targetItem?.name || 'Stock Item',
        qty: deltaQty,
        uom: targetItem?.baseUnit || targetItem?.uom || 'units',
        cost,
        reason,
        location,
        notes,
        user: actor,
        t: Date.now()
      };

      return {
        ...s,
        stock: updatedStock,
        wasteLog: [wasteItem, ...(s.wasteLog || [])],
        auditLog: logAudit(
          s,
          actor,
          'STOCK_ADJUSTMENT',
          `Adjusted -${deltaQty} ${targetItem?.baseUnit || 'units'} of ${targetItem?.name} at ${location} (${reason}, Loss: TSh ${cost.toLocaleString()})`
        )
      };
    }),

    // Returnable Crates & Empty Bottles Tracker
    returnCrates: (data, actor = 'Storekeeper') => setS(s => {
      const { supplierId, cratesQty = 0, bottlesQty = 0, notes = '' } = data;
      const sup = (s.suppliers || []).find(x => x.id === supplierId);

      const updatedCrateLedger = (s.crateLedger || []).map(c => {
        if (c.supplierId === supplierId) {
          const newRet = (c.cratesReturned || 0) + Number(cratesQty || 0);
          const newOwed = Math.max(0, (c.cratesReceived || 0) - newRet);
          const newBottles = Math.max(0, (c.emptyBottlesOnHand || 0) - Number(bottlesQty || 0));
          return {
            ...c,
            cratesReturned: newRet,
            netCratesOwed: newOwed,
            emptyBottlesOnHand: newBottles,
            lastUpdated: Date.now()
          };
        }
        return c;
      });

      return {
        ...s,
        crateLedger: updatedCrateLedger,
        auditLog: logAudit(
          s,
          actor,
          'RETURNABLE_CRATES_RETURNED',
          `Returned ${cratesQty} empty crates and ${bottlesQty} bottles to ${sup?.name || 'Supplier'} (${notes || 'Supplier return'})`
        )
      };
    }),

    // Kitchen Inventory Tracking Mode Switcher: Option A (Simple Issue) vs Option B (Recipe BOM)
    setKitchenTrackingMode: (mode, actor = 'Manager') => setS(s => ({
      ...s,
      kitchenTrackingMode: mode,
      auditLog: logAudit(
        s,
        actor,
        'KITCHEN_TRACKING_MODE_CHANGED',
        `Switched kitchen inventory tracking to ${mode === 'simple' ? 'Option A: Simple (issued to kitchen)' : 'Option B: Recipe-based (BOM)'}`
      )
    })),

    // Procurement: Create Purchase Order (with support for Existing or Brand New Items and Direct Resale)
    createPO: (newPO, actor = 'Storekeeper') => setS(s => {
      const poId = 'PO-' + (880 + (s.purchaseOrders || []).length + 1);
      let updatedStock = [...(s.stock || [])];
      let updatedMenu = [...(s.menu || [])];

      // If new item flag is provided, create stock item and direct resale menu entry if applicable
      (newPO.items || []).forEach(line => {
        if (line.isNewItem) {
          const newStockId = line.stockId || 'stk_' + line.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
          line.stockId = newStockId;

          let menuId = null;
          if (line.itemType === 'direct_resale' && line.sellingPrice > 0) {
            menuId = Date.now() + Math.floor(Math.random() * 100);
            updatedMenu.push({
              id: menuId,
              n: line.name,
              e: line.cat === 'Drinks' ? '🥤' : '🍿',
              p: line.sellingPrice,
              c: line.cat === 'Drinks' ? 'Drinks' : 'Sides',
              t: 1,
              r: 4.8,
              station: 'bar',
              allergens: [],
              d: `Fresh retail stock: ${line.name}`
            });
          }

          const existingStk = updatedStock.find(x => x.id === newStockId);
          if (!existingStk) {
            updatedStock.push({
              id: newStockId,
              name: line.name,
              cat: line.cat || 'Dry Goods',
              uom: line.uom || 'pcs',
              onHand: 0,
              storeQty: 0,
              kitchenQty: 0,
              barQty: 0,
              par: line.par || 30,
              reorder: line.reorder || 10,
              unitCost: line.unitPrice,
              sellingPrice: line.sellingPrice || null,
              itemType: line.itemType || 'raw_material',
              loc: line.loc || 'Main Store',
              theoretical: 0,
              menuId
            });
          }
        }
      });

      const poEntry = {
        ...newPO,
        id: poId,
        createdAt: Date.now(),
        status: 'pending_approval'
      };

      return {
        ...s,
        stock: updatedStock,
        menu: updatedMenu,
        purchaseOrders: [poEntry, ...(s.purchaseOrders || [])],
        auditLog: logAudit(s, actor, 'PO_CREATED', `Created PO ${poId} for ${newPO.supplierName} (Total: TSh ${newPO.total.toLocaleString()})`)
      };
    }),

    // Procurement: Approve PO (Site Manager / Owner)
    approvePO: (poId, actor = 'Manager') => setS(s => ({
      ...s,
      purchaseOrders: s.purchaseOrders.map(p => p.id === poId ? { ...p, status: 'approved', approvedBy: actor, approvedAt: Date.now() } : p),
      auditLog: logAudit(s, actor, 'PO_APPROVED', `Approved ${poId}`)
    })),

    // Procurement: Settle / Pay PO Invoice (3-Way Match Settlement)
    payPOInvoice: (poId, method = 'bank', ref = '', actor = 'Cashier') => setS(s => {
      const po = (s.purchaseOrders || []).find(p => p.id === poId);
      if (!po || po.status === 'paid') return s;

      const expenseEntry = {
        id: 'exp_' + Date.now(),
        t: Date.now(),
        category: 'Supplier Goods Settlement',
        name: `PO Settlement: ${po.id} (${po.supplierName})`,
        amount: po.total,
        method: method || 'bank',
        ref: ref || `PAY-${po.id}`
      };

      const updatedPOs = s.purchaseOrders.map(p => p.id === poId ? {
        ...p,
        status: 'paid',
        paidAt: Date.now(),
        paidBy: actor,
        payMethod: method,
        payRef: ref
      } : p);

      return {
        ...s,
        purchaseOrders: updatedPOs,
        expenses: [expenseEntry, ...(s.expenses || [])],
        auditLog: logAudit(s, actor, 'PO_INVOICE_PAID', `Settled supplier invoice for ${po.id} via ${method.toUpperCase()} (TSh ${po.total.toLocaleString()})`)
      };
    }),

    // Inter-Location Stock Transfer: Move stock between Store, Kitchen, and Bar
    transferStock: (fromLoc, toLoc, items, notes = '', operator = 'Storekeeper') => setS(s => {
      const transferId = 'TR-' + (500 + (s.transfers || []).length + 1);

      // Adjust location counts in stock
      const updatedStock = s.stock.map(item => {
        const transLine = items.find(it => it.stockId === item.id);
        if (!transLine) return item;

        const qty = +transLine.qty;
        let storeQty = item.storeQty || 0;
        let kitchenQty = item.kitchenQty || 0;
        let barQty = item.barQty || 0;

        // Deduct from source
        if (fromLoc.includes('Store') || fromLoc.includes('Main')) {
          storeQty = Math.max(0, +(storeQty - qty).toFixed(2));
        } else if (fromLoc.includes('Kitchen')) {
          kitchenQty = Math.max(0, +(kitchenQty - qty).toFixed(2));
        } else if (fromLoc.includes('Bar')) {
          barQty = Math.max(0, +(barQty - qty).toFixed(2));
        }

        // Add to destination
        if (toLoc.includes('Kitchen')) {
          kitchenQty = +(kitchenQty + qty).toFixed(2);
        } else if (toLoc.includes('Bar')) {
          barQty = +(barQty + qty).toFixed(2);
        } else if (toLoc.includes('Store')) {
          storeQty = +(storeQty + qty).toFixed(2);
        }

        const onHand = +(storeQty + kitchenQty + barQty).toFixed(2);

        return {
          ...item,
          storeQty,
          kitchenQty,
          barQty,
          onHand
        };
      });

      const transferRecord = {
        id: transferId,
        t: Date.now(),
        fromLoc,
        toLoc,
        items,
        transferredBy: operator,
        acceptedBy: toLoc.includes('Kitchen') ? 'Chef Baraka (Kitchen Lead)' : 'Zawadi Ally (Bar Lead)',
        status: 'completed',
        notes: notes || 'Standard inventory transfer'
      };

      return {
        ...s,
        stock: updatedStock,
        transfers: [transferRecord, ...(s.transfers || [])],
        auditLog: logAudit(s, operator, 'STOCK_TRANSFER', `Transferred ${items.length} items from ${fromLoc} to ${toLoc} (${transferId})`)
      };
    }),

    // Procurement: Create Request for Quotation (RFQ)
    createRFQ: (rfqData, operator = 'Storekeeper') => setS(s => {
      const rfqId = 'RFQ-' + (300 + (s.rfqs || []).length + 1);
      const newRFQ = {
        id: rfqId,
        title: rfqData.title || `RFQ for ${rfqData.items?.[0]?.name || 'Ingredients'}`,
        createdAt: Date.now(),
        status: 'bidding',
        poId: null,
        items: rfqData.items || [],
        bids: rfqData.bids || [],
        selectedSupplierId: null,
        notes: rfqData.notes || ''
      };

      return {
        ...s,
        rfqs: [newRFQ, ...(s.rfqs || [])],
        auditLog: logAudit(s, operator, 'RFQ_CREATED', `Issued RFQ ${rfqId}: ${newRFQ.title}`)
      };
    }),

    // RFQ: Add Supplier Bid / Quote
    addRFQBid: (rfqId, bidData, operator = 'Storekeeper') => setS(s => ({
      ...s,
      rfqs: (s.rfqs || []).map(r => r.id === rfqId ? {
        ...r,
        bids: [...(r.bids || []), { ...bidData, selected: false }]
      } : r),
      auditLog: logAudit(s, operator, 'RFQ_BID_RECORDED', `Bid recorded for ${rfqId} from ${bidData.supplierName} (TSh ${bidData.quoteAmount.toLocaleString()})`)
    })),

    // RFQ: Convert Approved Bid into an Official Purchase Order
    convertRFQToPO: (rfqId, supplierId, quoteAmount, operator = 'Storekeeper') => setS(s => {
      const rfq = (s.rfqs || []).find(r => r.id === rfqId);
      if (!rfq || rfq.status === 'converted_to_po') return s;

      const sup = (s.suppliers || []).find(x => x.id === supplierId);
      const poId = 'PO-' + (880 + (s.purchaseOrders || []).length + 1);

      const newPO = {
        id: poId,
        rfqId,
        supplierId,
        supplierName: sup?.name || 'Approved Supplier',
        siteId: s.siteId || 'masaki',
        status: 'approved',
        items: rfq.items.map(it => ({
          stockId: it.stockId,
          name: it.name,
          qty: it.qty,
          unitPrice: Math.round(quoteAmount / (it.qty || 1)),
          uom: it.uom
        })),
        total: quoteAmount,
        createdAt: Date.now(),
        notes: `Converted from RFQ ${rfqId}. Winning quotation approved.`
      };

      const updatedRFQs = (s.rfqs || []).map(r => r.id === rfqId ? {
        ...r,
        status: 'converted_to_po',
        poId,
        selectedSupplierId: supplierId,
        bids: (r.bids || []).map(b => ({ ...b, selected: b.supplierId === supplierId }))
      } : r);

      return {
        ...s,
        rfqs: updatedRFQs,
        purchaseOrders: [newPO, ...(s.purchaseOrders || [])],
        auditLog: logAudit(s, operator, 'RFQ_CONVERTED_TO_PO', `Converted ${rfqId} to PO ${poId} with ${newPO.supplierName}`)
      };
    }),

    // Stock Item Edit: Adjust PAR, Reorder Point, Cost, Selling Price
    editStockItem: (stockId, patch, operator = 'Storekeeper') => setS(s => {
      let updatedMenu = [...(s.menu || [])];
      const updatedStock = s.stock.map(stk => {
        if (stk.id === stockId) {
          const merged = { ...stk, ...patch };
          if (patch.sellingPrice && merged.itemType === 'direct_resale') {
            const menuIdx = updatedMenu.findIndex(m => m.id === merged.menuId || m.n.toLowerCase() === merged.name.toLowerCase());
            if (menuIdx >= 0) {
              updatedMenu[menuIdx] = { ...updatedMenu[menuIdx], p: patch.sellingPrice };
            }
          }
          return merged;
        }
        return stk;
      });

      return {
        ...s,
        stock: updatedStock,
        menu: updatedMenu,
        auditLog: logAudit(s, operator, 'STOCK_ITEM_UPDATED', `Updated stock item ${stockId}`)
      };
    }),

    // Financial Analysis: Record Operating Expense (OPEX)
    recordExpense: (expense, operator = 'Manager') => setS(s => {
      const expEntry = {
        id: 'exp_' + Date.now(),
        t: Date.now(),
        ...expense
      };
      return {
        ...s,
        expenses: [expEntry, ...(s.expenses || [])],
        auditLog: logAudit(s, operator, 'EXPENSE_RECORDED', `Logged expense: ${expense.name} (TSh ${Number(expense.amount).toLocaleString()})`)
      };
    }),

    // Quality: Log Waste / Spoilage (INV-08)
    logWaste: (entry, actor = 'Chef') => setS(s => {
      const wasteItem = {
        ...entry,
        id: 'wst_' + Date.now(),
        user: actor,
        t: Date.now()
      };

      // Deduct from onHand stock and store/kitchen
      const updatedStock = s.stock.map(stk => {
        if (stk.id === entry.stockId) {
          const newOnHand = Math.max(0, +(stk.onHand - entry.qty).toFixed(2));
          const newKitchen = Math.max(0, +( (stk.kitchenQty || 0) - entry.qty ).toFixed(2));
          return {
            ...stk,
            kitchenQty: newKitchen,
            onHand: newOnHand
          };
        }
        return stk;
      });

      return {
        ...s,
        stock: updatedStock,
        wasteLog: [wasteItem, ...(s.wasteLog || [])],
        auditLog: logAudit(s, actor, 'WASTE_LOGGED', `Waste logged: ${entry.qty}${entry.uom} ${entry.name} (${entry.reason})`)
      };
    }),

    // Manufacturing & Central Kitchen: Create Production Work Order (SRS CK-02)
    createProductionOrder: (bomId, targetYield, operator = 'Production Manager') => setS(s => {
      const bom = (s.boms || []).find(b => b.id === bomId);
      if (!bom) return s;

      const plannedQty = +targetYield || bom.targetYield;
      const scale = plannedQty / bom.targetYield;
      const materialsCost = bom.ingredients.reduce((acc, ing) => {
        const stk = (s.stock || []).find(x => x.id === ing.stockId);
        return acc + (ing.qty * scale * (stk?.unitCost || 5000));
      }, 0);
      const laborCost = Math.round(bom.laborCost * scale);
      const overheadCost = Math.round(bom.overheadCost * scale);
      const totalBatchCost = Math.round(materialsCost + laborCost + overheadCost);
      const unitCost = Math.round(totalBatchCost / plannedQty);

      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const batchNo = `BATCH-${todayStr}-${String((s.productionOrders || []).length + 1).padStart(2, '0')}`;
      const woId = 'WO-' + (100 + (s.productionOrders || []).length + 1);

      const newWO = {
        id: woId,
        batchNo,
        bomId: bom.id,
        productName: bom.outputName,
        plannedYield: plannedQty,
        actualYield: null,
        uom: bom.uom,
        status: 'planned',
        operator,
        tempLog: bom.targetStorage,
        laborCost,
        overheadCost,
        materialsCost: Math.round(materialsCost),
        totalBatchCost,
        unitCost,
        yieldVariancePct: null,
        createdAt: Date.now(),
        completedAt: null,
        expiryDate: new Date(Date.now() + (bom.shelfLifeHours || 48) * 3600 * 1000).toLocaleDateString(),
        notes: `Production planned from BOM ${bom.name}`
      };

      return {
        ...s,
        productionOrders: [newWO, ...(s.productionOrders || [])],
        auditLog: logAudit(s, operator, 'PRODUCTION_ORDER_PLANNED', `Planned Work Order ${woId} (${batchNo}) for ${plannedQty} ${bom.uom} of ${bom.outputName}`)
      };
    }),

    // Start Batch Cooking / Mixing
    startProduction: (woId, operator = 'Chef') => setS(s => ({
      ...s,
      productionOrders: (s.productionOrders || []).map(wo => wo.id === woId ? {
        ...wo,
        status: 'in_production',
        startedAt: Date.now(),
        operator
      } : wo),
      auditLog: logAudit(s, operator, 'PRODUCTION_STARTED', `Batch production started for ${woId}`)
    })),

    // Complete Production: Atomic Inventory Depletion & Finished Goods Increment
    completeProduction: (woId, actualYield, tempLog = '2.5°C', notes = '', operator = 'Chef') => setS(s => {
      const wo = (s.productionOrders || []).find(w => w.id === woId);
      if (!wo || wo.status === 'completed') return s;

      const bom = (s.boms || []).find(b => b.id === wo.bomId);
      const actualQty = +actualYield || wo.plannedYield;
      const scale = wo.plannedYield / (bom?.targetYield || wo.plannedYield);

      // 1. Deduct Raw Ingredients from Kitchen Stock
      const updatedStock = (s.stock || []).map(stk => {
        const bomIng = (bom?.ingredients || []).find(i => i.stockId === stk.id);
        if (bomIng) {
          const deduction = +(bomIng.qty * scale).toFixed(2);
          const newKitchen = Math.max(0, +( (stk.kitchenQty || 0) - deduction ).toFixed(2));
          const newStore = stk.storeQty || 0;
          const newBar = stk.barQty || 0;
          return {
            ...stk,
            kitchenQty: newKitchen,
            onHand: +(newKitchen + newStore + newBar).toFixed(2),
            theoretical: Math.max(0, +(stk.theoretical - deduction).toFixed(2))
          };
        }
        return stk;
      });

      // 2. Increment Finished Goods Inventory and sync with Sales Menu
      const fgId = bom?.outputFgId || 'fg_marinated_chicken';
      let updatedMenu = [...(s.menu || [])];
      let linkedMenuId = null;

      const targetFg = (s.finishedGoods || []).find(fg => fg.id === fgId);
      if (targetFg?.menuId) {
        linkedMenuId = targetFg.menuId;
      } else {
        const foundMenu = updatedMenu.find(m => m.n.toLowerCase() === (bom?.outputName || wo.productName).toLowerCase());
        if (foundMenu) {
          linkedMenuId = foundMenu.id;
        } else {
          linkedMenuId = Date.now() + Math.floor(Math.random() * 100);
          updatedMenu.push({
            id: linkedMenuId,
            n: wo.productName,
            e: '🍱',
            p: Math.round(wo.unitCost * 2.4),
            c: 'Grills',
            t: 15,
            r: 4.8,
            station: 'grill',
            allergens: bom?.allergens || [],
            d: `Fresh central kitchen batch (${wo.batchNo}).`
          });
        }
      }

      const updatedFinishedGoods = (s.finishedGoods || []).map(fg => {
        if (fg.id === fgId) {
          return {
            ...fg,
            onHand: +(fg.onHand + actualQty).toFixed(2),
            batchNo: wo.batchNo,
            unitCost: wo.unitCost,
            expiry: wo.expiryDate,
            menuId: linkedMenuId
          };
        }
        return fg;
      });

      const yieldVariance = +(((actualQty - wo.plannedYield) / wo.plannedYield) * 100).toFixed(1);

      // 3. Update Work Order
      const updatedWOs = (s.productionOrders || []).map(w => w.id === woId ? {
        ...w,
        status: 'completed',
        actualYield: actualQty,
        yieldVariancePct: yieldVariance,
        tempLog,
        completedAt: Date.now(),
        notes: notes || w.notes
      } : w);

      // If item was previously 86'd out of stock, unmark it now that new batch is ready
      const updatedOutOfStock = (s.outOfStockIds || []).filter(id => id !== linkedMenuId);

      return {
        ...s,
        stock: updatedStock,
        menu: updatedMenu,
        outOfStockIds: updatedOutOfStock,
        finishedGoods: updatedFinishedGoods,
        productionOrders: updatedWOs,
        auditLog: logAudit(s, operator, 'PRODUCTION_BATCH_COMPLETED', `Completed batch ${wo.batchNo}: produced ${actualQty} ${wo.uom} ${wo.productName} (Yield: ${yieldVariance >= 0 ? '+' : ''}${yieldVariance}%, Temp: ${tempLog})`)
      };
    }),

    // Dispatch Requisition to Branch Outlet (CK-03)
    dispatchRequisition: (reqId, driver = 'Rashid Mtambo', transportTemp = '3.0°C', operator = 'Production Manager') => setS(s => {
      const req = (s.siteRequisitions || []).find(r => r.id === reqId);
      if (!req || req.status === 'dispatched') return s;

      // Deduct dispatched quantities from Central Kitchen finished goods
      let updatedFG = s.finishedGoods || [];
      (req.items || []).forEach(it => {
        updatedFG = updatedFG.map(fg => fg.id === it.fgId ? { ...fg, onHand: Math.max(0, fg.onHand - it.qty) } : fg);
      });

      const updatedReqs = (s.siteRequisitions || []).map(r => r.id === reqId ? {
        ...r,
        status: 'dispatched',
        dispatchedAt: Date.now(),
        driver,
        transportTemp
      } : r);

      return {
        ...s,
        finishedGoods: updatedFG,
        siteRequisitions: updatedReqs,
        auditLog: logAudit(s, operator, 'REQUISITION_DISPATCHED', `Dispatched requisition ${reqId} to ${req.fromSiteName} (Temp: ${transportTemp})`)
      };
    }),

    // Outlet Confirms Receipt of Central Kitchen Batch (CK-03)
    receiveRequisition: (reqId, operator = 'Branch Manager') => setS(s => ({
      ...s,
      siteRequisitions: (s.siteRequisitions || []).map(r => r.id === reqId ? {
        ...r,
        status: 'received',
        receivedAt: Date.now(),
        receivedBy: operator
      } : r),
      auditLog: logAudit(s, operator, 'REQUISITION_RECEIVED', `Requisition ${reqId} confirmed received at branch`)
    })),

    // Checklists: Toggle Item or Sign-off (QSC-01)
    toggleChecklist: (chkId, itemIdx, actor = 'Manager') => setS(s => ({
      ...s,
      checklists: s.checklists.map(c => {
        if (c.id === chkId) {
          const items = c.items.map((it, idx) => idx === itemIdx ? { ...it, done: !it.done } : it);
          const completed = items.every(it => it.done);
          return {
            ...c,
            items,
            completed,
            signedBy: completed ? actor : c.signedBy
          };
        }
        return c;
      })
    })),

    // Shift / Day Lifecycle Automation (Section 6.3)
    setShift: (newState, actor = 'Manager') => setS(s => ({
      ...s,
      shiftState: newState,
      auditLog: logAudit(s, actor, 'SHIFT_STATE_CHANGED', `Shift transition to ${newState.toUpperCase()}`)
    })),

    // Cash drawer float & count
    updateFloat: (floatVal, countedVal) => setS(s => ({
      ...s,
      openingFloat: floatVal !== undefined ? floatVal : s.openingFloat,
      countedCash: countedVal !== undefined ? countedVal : s.countedCash
    })),

    // Register user or waiter
    addUser: u => setS(s => ({
      ...s,
      users: [...s.users, u],
      waiters: u.role === 'waiter' ? [...s.waiters, {
        id: u.wid,
        name: u.name,
        tok: u.name.split(' ')[0].toLowerCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        phone: u.ph,
        active: true,
        tables: []
      }] : s.waiters
    })),

    // Reset demo store
    reset: () => setS(SEED)
  };

  const wn = id => {
    const w = (S.waiters || []).find(x => x.id === id);
    return w ? w.name : 'Unassigned';
  };

  return (
    <Ctx.Provider value={{ S, A, wn }}>
      {children}
    </Ctx.Provider>
  );
}

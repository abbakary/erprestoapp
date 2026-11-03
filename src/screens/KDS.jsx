import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { M, MENU, fmt, fmtTime, USERS, SITES } from '../data';
import { Ctx } from '../store';
import { TopBar, Sheet } from '../components/ui';
import { QuickAddMenuItemModal } from '../components/FastDrinksAndInventory';
import { MenuManagementView } from '../components/MenuManagement';

export function KDS({ sess, out, setSess, setV }) {
  const { S, A, wn } = useContext(Ctx);

  // Scroll container refs for smooth scrolling & wheel delegation
  const waitingScrollRef = useRef(null);
  const cookingScrollRef = useRef(null);
  const completedScrollRef = useRef(null);

  // Persistent sidebar & role switcher state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Monitor Navigation Tab: 'monitor' (Image cb6e1d9e), '86', 'haccp', 'history'
  const [activeTab, setActiveTab] = useState('monitor');
  const [monitorId, setMonitorId] = useState('Monitor 1');

  // Stage filter for the full-width board: 'all', 'placed', 'accepted', 'preparing', 'ready', 'served'
  const [stageFilter, setStageFilter] = useState('all');

  // Channel filter: 'ALL', 'Dine In', 'Takeaway', 'Pickup', 'Delivery'
  const [channelFilter, setChannelFilter] = useState('ALL');

  // Search input & sorting on the KDS board
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSort, setOrderSort] = useState('fifo'); // 'fifo', 'lifo', 'urgent', 'table'

  // Dedicated Station Prep & Batch Summary Modal state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryStationFilter, setSummaryStationFilter] = useState('all');

  // Cancellation modal state
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer changed mind');
  const [cancelCustomText, setCancelCustomText] = useState('');

  // Thermal kitchen slip modal
  const [slipOrder, setSlipOrder] = useState(null);

  // Selected ticket for Bumpbar navigation
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Sort direction in waiting column: 'asc' (oldest first) vs 'desc' (newest first)
  const [waitSortAsc, setWaitSortAsc] = useState(true);

  // Sound chime toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals
  const [infoOrder, setInfoOrder] = useState(null);
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [wasteModal, setWasteModal] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState('stk_chicken');
  const [wasteQty, setWasteQty] = useState('1');
  const [wasteReason, setWasteReason] = useState('Overcooked on grill');
  const [haccpLog, setHaccpLog] = useState({ fridge: '3.1', freezer: '-18.2', pass: '68.5' });
  const [haccpSaved, setHaccpSaved] = useState(false);
  const [printSummaryModal, setPrintSummaryModal] = useState(false);
  const [historyDrawer, setHistoryDrawer] = useState(false);
  const [quickAddModal, setQuickAddModal] = useState(false);

  // History & Tracking Analytics Filters State
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
  const [historyChannelFilter, setHistoryChannelFilter] = useState('ALL');
  const [historySortBy, setHistorySortBy] = useState('recent');
  const [expandedAuditId, setExpandedAuditId] = useState(null);

  // Quick order creator state
  const [quickOrderChannel, setQuickOrderChannel] = useState('Dine In');
  const [quickOrderTable, setQuickOrderTable] = useState('Table 05');
  const [quickOrderGuests, setQuickOrderGuests] = useState(4);
  const [quickOrderItems, setQuickOrderItems] = useState([
    { id: 26, q: 1 },
    { id: 27, q: 1 },
    { id: 28, q: 1 },
    { id: 30, q: 1, sub: '250 ml' }
  ]);

  // Live ticking clock (matches "12:30" in Image cb6e1d9e)
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API Chime generator
  const playKitchenChime = (type = 'chime') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'chime') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      } else if (type === 'done') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn('Audio chime unsupported or blocked', e);
    }
  };

  // Group Orders by Column Lifecycle matching Image cb6e1d9e:
  // 1. Waiting Column: st === 'placed' || st === 'accepted'
  // 2. Cooking Column: st === 'preparing'
  // 3. Completed Column: st === 'ready' || st === 'served'
  const orders = S.orders || [];

  // Stage counts for quick header & subtoolbar indicators
  const countPlaced = useMemo(() => orders.filter(o => o.st === 'placed').length, [orders]);
  const countAccepted = useMemo(() => orders.filter(o => o.st === 'accepted').length, [orders]);
  const countCooking = useMemo(() => orders.filter(o => o.st === 'preparing').length, [orders]);
  const countReady = useMemo(() => orders.filter(o => o.st === 'ready').length, [orders]);
  const countServed = useMemo(() => orders.filter(o => o.st === 'served').length, [orders]);
  const countAllActive = useMemo(() => orders.filter(o => ['placed', 'accepted', 'preparing', 'ready', 'served'].includes(o.st)).length, [orders]);

  const waitingOrders = useMemo(() => {
    const list = orders.filter(o => ['placed', 'accepted'].includes(o.st));
    return list.sort((a, b) => waitSortAsc ? (a.t - b.t) : (b.t - a.t));
  }, [orders, waitSortAsc]);

  const cookingOrdersRaw = useMemo(() => {
    return orders.filter(o => o.st === 'preparing');
  }, [orders]);

  const cookingOrders = useMemo(() => {
    if (channelFilter === 'ALL') return cookingOrdersRaw;
    return cookingOrdersRaw.filter(o => {
      const type = (o.orderType || '').toLowerCase();
      const target = channelFilter.toLowerCase();
      if (target === 'dine in') return type.includes('dine') || type.includes('table');
      if (target === 'takeaway') return type.includes('take') || type.includes('ta');
      if (target === 'pickup') return type.includes('pickup');
      if (target === 'delivery') return type.includes('delivery');
      return true;
    });
  }, [cookingOrdersRaw, channelFilter]);

  const completedOrders = useMemo(() => {
    return orders.filter(o => ['ready', 'served'].includes(o.st));
  }, [orders]);

  // Full-width board filtered orders
  const displayedOrders = useMemo(() => {
    let list = orders.filter(o => {
      // Stage filtering
      if (stageFilter === 'all') {
        if (!['placed', 'accepted', 'preparing', 'ready', 'served'].includes(o.st)) return false;
      } else if (stageFilter === 'new' || stageFilter === 'placed') {
        if (o.st !== 'placed') return false;
      } else {
        if (o.st !== stageFilter) return false;
      }

      // Channel filtering
      if (channelFilter !== 'ALL') {
        const type = (o.orderType || '').toLowerCase();
        const target = channelFilter.toLowerCase();
        if (target === 'dine in' && !(type.includes('dine') || type.includes('table'))) return false;
        if (target === 'takeaway' && !(type.includes('take') || type.includes('ta'))) return false;
        if (target === 'pickup' && !type.includes('pickup')) return false;
        if (target === 'delivery' && !type.includes('delivery')) return false;
      }

      // Text search
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const orderNum = String(o.no || o.id).toLowerCase();
        const tb = (o.tb || '').toLowerCase();
        const by = (o.by || '').toLowerCase();
        const cust = (o.cust || '').toLowerCase();
        const dishNames = (o.it || []).map(l => (M[l.id]?.n || '').toLowerCase()).join(' ');
        if (!orderNum.includes(q) && !tb.includes(q) && !by.includes(q) && !cust.includes(q) && !dishNames.includes(q)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (orderSort === 'fifo') return (a.t || 0) - (b.t || 0);
      if (orderSort === 'lifo') return (b.t || 0) - (a.t || 0);
      if (orderSort === 'urgent') {
        const elapsedA = a.elapsedMins || Math.round((Date.now() - (a.t || 0)) / 60000);
        const elapsedB = b.elapsedMins || Math.round((Date.now() - (b.t || 0)) / 60000);
        return elapsedB - elapsedA;
      }
      if (orderSort === 'table') {
        return (a.tb || '').localeCompare(b.tb || '');
      }
      return (a.t || 0) - (b.t || 0);
    });

    return list;
  }, [orders, stageFilter, channelFilter, orderSearch, orderSort]);

  // Historical orders for tracking & operational analysis
  const allHistoryOrders = useMemo(() => {
    return orders.filter(o => ['ready', 'served', 'billreq', 'paid', 'closed', 'cancelled'].includes(o.st));
  }, [orders]);

  const filteredHistoryOrders = useMemo(() => {
    let list = [...allHistoryOrders];
    if (historyStatusFilter !== 'ALL') {
      list = list.filter(o => o.st === historyStatusFilter);
    }
    if (historyChannelFilter !== 'ALL') {
      list = list.filter(o => {
        const type = (o.orderType || '').toLowerCase();
        const target = historyChannelFilter.toLowerCase();
        if (target === 'dine in') return type.includes('dine') || type.includes('table');
        if (target === 'takeaway') return type.includes('take') || type.includes('ta');
        if (target === 'pickup') return type.includes('pickup');
        if (target === 'delivery') return type.includes('delivery');
        return true;
      });
    }
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      list = list.filter(o => {
        const no = String(o.no || o.id).toLowerCase();
        const tb = (o.tb || '').toLowerCase();
        const by = (o.by || '').toLowerCase();
        const cust = (o.cust || '').toLowerCase();
        const items = (o.it || []).map(i => (M[i.id]?.n || '').toLowerCase()).join(' ');
        return no.includes(q) || tb.includes(q) || by.includes(q) || cust.includes(q) || items.includes(q);
      });
    }
    list.sort((a, b) => {
      if (historySortBy === 'oldest') return (a.t || 0) - (b.t || 0);
      if (historySortBy === 'prepTime') {
        const prepA = a.elapsedMins || Math.round((Date.now() - (a.t || 0)) / 60000);
        const prepB = b.elapsedMins || Math.round((Date.now() - (b.t || 0)) / 60000);
        return prepB - prepA;
      }
      if (historySortBy === 'value') {
        const valA = (a.it || []).reduce((acc, l) => acc + (M[l.id]?.p || 0) * l.q, 0);
        const valB = (b.it || []).reduce((acc, l) => acc + (M[l.id]?.p || 0) * l.q, 0);
        return valB - valA;
      }
      return (b.t || 0) - (a.t || 0);
    });
    return list;
  }, [allHistoryOrders, historyStatusFilter, historyChannelFilter, historySearch, historySortBy]);

  const historyAnalytics = useMemo(() => {
    const totalCount = allHistoryOrders.length;
    let totalPrepMins = 0;
    let prepCount = 0;
    let onTimeCount = 0;
    let totalSales = 0;
    let totalPortions = 0;
    let voidedCount = 0;
    let voidedLoss = 0;

    allHistoryOrders.forEach(o => {
      const prep = o.elapsedMins || Math.min(60, Math.max(3, Math.round((Date.now() - (o.t || 0)) / 60000)));
      totalPrepMins += prep;
      prepCount++;
      if (prep <= (o.timerTarget || 15)) onTimeCount++;

      (o.it || []).forEach(line => {
        const price = M[line.id]?.p || 0;
        if (line.voided) {
          voidedCount += (line.q || 1);
          voidedLoss += price * (line.q || 1);
        } else {
          totalPortions += (line.q || 1);
          totalSales += price * (line.q || 1);
        }
      });
    });

    const avgPrep = prepCount > 0 ? (totalPrepMins / prepCount).toFixed(1) : '12.5';
    const onTimePct = prepCount > 0 ? Math.round((onTimeCount / prepCount) * 100) : 95;

    return {
      totalCount,
      avgPrep,
      onTimePct,
      totalSales,
      totalPortions,
      voidedCount,
      voidedLoss
    };
  }, [allHistoryOrders]);

  const exportHistoryCSV = () => {
    try {
      const headers = ['Order Number', 'Time Placed', 'Channel', 'Table', 'Guests', 'Server', 'Total Value (TSh)', 'Prep Time (Mins)', 'Status', 'Dishes Summary', 'Audit Trail'];
      const rows = filteredHistoryOrders.map(o => {
        const orderNo = String(o.no || o.id);
        const timeStr = o.timeStr || fmtTime(o.t);
        const channel = o.orderType || 'Dine In';
        const table = o.tb || 'Table';
        const guests = o.guests || 1;
        const server = o.by || 'Ammie';
        const totalVal = (o.it || []).reduce((acc, l) => acc + (M[l.id]?.p || 0) * l.q, 0);
        const prepTime = o.elapsedMins || Math.round((Date.now() - (o.t || 0)) / 60000);
        const status = (o.st || '').toUpperCase();
        const dishes = (o.it || []).map(l => `${l.q}x ${M[l.id]?.n || 'Item'}${l.voided ? ' (VOIDED)' : ''}`).join('; ');
        const audit = (o.log || []).join(' | ');

        return [
          `"${orderNo}"`,
          `"${timeStr}"`,
          `"${channel}"`,
          `"${table}"`,
          guests,
          `"${server}"`,
          totalVal,
          prepTime,
          `"${status}"`,
          `"${dishes.replace(/"/g, '""')}"`,
          `"${audit.replace(/"/g, '""')}"`
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `KDS_Order_History_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  // Set default selection to first cooking order, or first waiting order
  useEffect(() => {
    if (!selectedOrderId) {
      if (cookingOrders.length > 0) setSelectedOrderId(cookingOrders[0].id);
      else if (waitingOrders.length > 0) setSelectedOrderId(waitingOrders[0].id);
      else if (completedOrders.length > 0) setSelectedOrderId(completedOrders[0].id);
    }
  }, [cookingOrders, waitingOrders, completedOrders, selectedOrderId]);

  // Smooth scroll selected ticket into view
  useEffect(() => {
    if (selectedOrderId) {
      const el = document.getElementById(`kds-order-${selectedOrderId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedOrderId]);

  // Comprehensive Aggregated Station & Batch Summary of Dishes active across tickets
  const cookingSummary = useMemo(() => {
    const map = {};
    orders.filter(o => ['placed', 'accepted', 'preparing'].includes(o.st)).forEach(o => {
      const orderRef = `#${String(o.no || o.id).replace('#', '').padStart(4, '0')} (${o.tb || o.orderType || 'Order'})`;
      (o.it || []).forEach(line => {
        if (line.voided) return;
        const item = M[line.id];
        const id = line.id;
        const name = item ? item.n : `Item #${line.id}`;
        const cat = item ? item.c : 'Mains';
        const emoji = item ? (item.e || '🍽️') : '🍽️';
        const station = item?.station || (cat === 'Drinks' ? 'bar' : cat === 'Pizza' ? 'pizza' : cat === 'Salads' ? 'salad' : cat === 'Burgers' ? 'grill' : cat === 'Desserts' ? 'dessert' : 'grill');
        const prepTime = item?.t || 12;

        if (!map[id]) {
          map[id] = {
            id,
            name,
            qty: 0,
            totalQty: 0,
            cookingQty: 0,
            waitingQty: 0,
            emoji,
            cat,
            station,
            prepTime,
            orderRefs: []
          };
        }
        const qty = line.q || 1;
        map[id].qty += qty;
        map[id].totalQty += qty;
        if (o.st === 'preparing') {
          map[id].cookingQty += qty;
        } else {
          map[id].waitingQty += qty;
        }
        if (!map[id].orderRefs.includes(orderRef)) {
          map[id].orderRefs.push(orderRef);
        }
      });
    });

    return Object.values(map).sort((a, b) => b.totalQty - a.totalQty);
  }, [orders]);

  // Order Lifecycle Actions (SRS Section 4.5 & Cross-screen Sync)
  const handleAcceptOrder = (orderId) => {
    playKitchenChime('chime');
    A.st(orderId, 'accepted', sess?.name || 'Chef Expo');
    setSelectedOrderId(orderId);
  };

  const handleStartOrder = (orderId) => {
    playKitchenChime('chime');
    A.st(orderId, 'preparing', sess?.name || 'Chef Expo');
    setSelectedOrderId(orderId);
  };

  const handleMarkReady = (orderId) => {
    playKitchenChime('done');
    if (A.doneAllOrder) {
      A.doneAllOrder(orderId, sess?.name || 'Chef Expo');
    } else {
      A.st(orderId, 'ready', sess?.name || 'Chef Expo');
    }
  };

  const handleMarkServed = (orderId) => {
    playKitchenChime('done');
    A.st(orderId, 'served', sess?.name || 'Chef Expo');
  };

  const handleFastServe = (orderId) => {
    playKitchenChime('done');
    if (A.doneAllOrder) A.doneAllOrder(orderId, sess?.name || 'Chef Expo');
    A.st(orderId, 'served', sess?.name || 'Chef Expo');
  };

  const handleReopenToPrep = (orderId) => {
    playKitchenChime('chime');
    if (A.reopenOrder) {
      A.reopenOrder(orderId, sess?.name || 'Chef Expo');
    } else {
      A.st(orderId, 'preparing', sess?.name || 'Chef Expo');
    }
    setSelectedOrderId(orderId);
  };

  const handleOpenCancel = (order) => {
    setCancelModalOrder(order);
    setCancelReason('Customer changed mind');
    setCancelCustomText('');
  };

  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return;
    const finalReason = cancelReason === 'Custom' ? (cancelCustomText.trim() || 'Cancelled by kitchen') : cancelReason;
    A.cancel(cancelModalOrder.id, finalReason, sess?.name || 'Chef Lead');
    playKitchenChime('chime');
    setCancelModalOrder(null);
  };

  const handleDoneAll = (orderId) => {
    handleMarkReady(orderId);
  };

  const handleReopen = (orderId) => {
    handleReopenToPrep(orderId);
  };

  const handleClearCompleted = () => {
    if (window.confirm('Clear all completed/served orders from the active kitchen monitor?')) {
      if (A.clearCompletedOrders) {
        A.clearCompletedOrders(sess?.name || 'Chef Expo');
      } else {
        completedOrders.forEach(o => A.st(o.id, 'closed', 'Chef Expo'));
      }
    }
  };

  const handleToggleItem = (orderId, idx) => {
    playKitchenChime('chime');
    if (A.toggleOrderItemDone) {
      A.toggleOrderItemDone(orderId, idx, sess?.name || 'Station Cook');
    }
  };

  const handleVoidItem = (orderId, idx, e) => {
    e.stopPropagation();
    if (window.confirm('Void this item from the kitchen order?')) {
      if (A.voidOrderItem) {
        A.voidOrderItem(orderId, idx, sess?.name || 'Chef Lead');
      }
    }
  };

  // Bumpbar Controls Handler
  const handleBumpAction = () => {
    const target = orders.find(o => o.id === selectedOrderId) || displayedOrders[0];
    if (!target) return;

    if (target.st === 'placed') {
      handleAcceptOrder(target.id);
    } else if (target.st === 'accepted') {
      handleStartOrder(target.id);
    } else if (target.st === 'preparing') {
      handleMarkReady(target.id);
    } else if (target.st === 'ready') {
      handleMarkServed(target.id);
    } else if (target.st === 'served') {
      handleReopenToPrep(target.id);
    }
  };

  const handleBumpbarCooking = () => {
    if (stageFilter !== 'preparing') {
      setStageFilter('preparing');
    } else {
      const nextWaiting = orders.find(o => ['placed', 'accepted'].includes(o.st));
      if (nextWaiting) handleStartOrder(nextWaiting.id);
    }
  };

  const handleBumpbarReady = () => {
    if (stageFilter !== 'ready') {
      setStageFilter('ready');
    } else if (selectedOrderId) {
      handleMarkServed(selectedOrderId);
    }
  };

  const handleBumpbarServe = () => {
    const readyOrder = orders.find(o => o.id === selectedOrderId && o.st === 'ready') || orders.find(o => o.st === 'ready');
    if (readyOrder) {
      handleMarkServed(readyOrder.id);
    } else {
      setStageFilter('served');
    }
  };

  const handleBumpbarRecall = () => {
    const lastDone = completedOrders[0] || orders.find(o => o.st === 'served');
    if (lastDone) {
      handleReopenToPrep(lastDone.id);
    }
  };

  const handleBumpbarPrint = () => {
    setPrintSummaryModal(true);
  };

  const handleBumpbarInfo = () => {
    const sel = orders.find(o => o.id === selectedOrderId) || displayedOrders[0] || cookingOrders[0] || waitingOrders[0];
    if (sel) setInfoOrder(sel);
  };

  // Left / Right / Up / Down Keyboard & Button navigation
  const allCardsList = useMemo(() => {
    return displayedOrders.length > 0 ? displayedOrders : orders;
  }, [displayedOrders, orders]);

  const handleNavigate = (dir) => {
    if (!allCardsList.length) return;
    const currentIndex = allCardsList.findIndex(o => o.id === selectedOrderId);
    let nextIndex = 0;
    if (dir === 'next' || dir === 'right') {
      nextIndex = currentIndex >= allCardsList.length - 1 ? 0 : currentIndex + 1;
    } else if (dir === 'prev' || dir === 'left') {
      nextIndex = currentIndex <= 0 ? allCardsList.length - 1 : currentIndex - 1;
    } else if (dir === 'up') {
      nextIndex = Math.max(0, currentIndex - 2);
    } else if (dir === 'down') {
      nextIndex = Math.min(allCardsList.length - 1, currentIndex + 2);
    }
    const nextOrder = allCardsList[nextIndex];
    if (nextOrder) setSelectedOrderId(nextOrder.id);
  };

  // Keyboard Bumpbar shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNavigate('right'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); handleNavigate('left'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); handleNavigate('up'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); handleNavigate('down'); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleBumpAction(); }
      else if (e.key.toLowerCase() === 'c') { handleBumpbarCooking(); }
      else if (e.key.toLowerCase() === 'p') { handleBumpbarPrint(); }
      else if (e.key.toLowerCase() === 'i') { handleBumpbarInfo(); }
      else if (e.key.toLowerCase() === 'r') { handleBumpbarRecall(); }
      else if (e.key.toLowerCase() === 's') { setShowSummaryModal(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Channel style helpers
  const getChannelTheme = (order) => {
    const type = (order.orderType || '').toLowerCase();
    if (type.includes('dine') || type.includes('table')) {
      return { key: 'dine-in', label: 'Dine-In', icon: '🍽️', headerClass: 'dine-in' };
    }
    if (type.includes('take') || type.includes('ta')) {
      return { key: 'takeaway', label: 'Takeaway', icon: '🥡', headerClass: 'takeaway' };
    }
    if (type.includes('pickup')) {
      return { key: 'pickup', label: 'Pickup', icon: '🏪', headerClass: 'pickup' };
    }
    if (type.includes('delivery')) {
      return { key: 'delivery', label: 'Delivery', icon: '🛵', headerClass: 'delivery' };
    }
    return { key: 'dine-in', label: 'Dine-In', icon: '🍽️', headerClass: 'dine-in' };
  };

  const handleCreateFastOrder = () => {
    A.place({
      src: 'POS',
      orderType: quickOrderChannel,
      tb: quickOrderTable,
      guests: quickOrderGuests,
      wid: 'w1',
      it: quickOrderItems,
      pm: 'cash',
      by: 'Ammie',
      cust: 'cust_' + Date.now().toString(36)
    }, sess?.name || 'Chef Ammie');

    playKitchenChime('chime');
    setNewOrderModal(false);
  };

  const handleLogWaste = () => {
    const stockItem = (S.stock || []).find(s => s.id === selectedStockId);
    if (!stockItem) return;
    const qty = +wasteQty || 1;
    const cost = Math.round(qty * stockItem.unitCost);

    A.logWaste({
      stockId: stockItem.id,
      name: stockItem.name,
      qty,
      uom: stockItem.uom,
      cost,
      reason: wasteReason
    }, sess?.name || 'Chef Baraka');

    setWasteModal(false);
  };

  return (
    <div className="kds-viewport-root">
      {/* ── Persistent Desktop Sidebar Navigation (≥900px) ── */}
      <aside className="kds-sidebar-rail">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {/* Brand Logo */}
          <button
            className="kds-rail-logo"
            onClick={() => setActiveTab('monitor')}
            title="Safari Grill & Lounge · Kitchen Operations"
          >
            🍽️
          </button>

          {/* Rail Navigation Buttons */}
          <div className="kds-rail-group">
            <button
              className={`kds-rail-btn ${activeTab === 'monitor' ? 'active' : ''}`}
              onClick={() => setActiveTab('monitor')}
              title="Kitchen Display System"
            >
              <span className="rail-icon">👨‍🍳</span>
              <span>KDS</span>
              {(waitingOrders.length + cookingOrdersRaw.length) > 0 && (
                <span className="rail-badge">{waitingOrders.length + cookingOrdersRaw.length}</span>
              )}
            </button>

            <button
              className="kds-rail-btn"
              onClick={() => setV && setV('cashier')}
              title="Point of Sale / Cashier Desk"
            >
              <span className="rail-icon">💳</span>
              <span>POS</span>
            </button>

            <button
              className="kds-rail-btn"
              onClick={() => setV && setV('waiter')}
              title="Waiter Floor & Order Taking"
            >
              <span className="rail-icon">🧑‍🍳</span>
              <span>Waiters</span>
            </button>

            <button
              className="kds-rail-btn"
              onClick={() => setV && setV('storekeeper')}
              title="Inventory & Stock Rooms"
            >
              <span className="rail-icon">📦</span>
              <span>Stock</span>
            </button>

            <button
              className="kds-rail-btn"
              onClick={() => setV && setV('manager')}
              title="Manager Dashboard"
            >
              <span className="rail-icon">👔</span>
              <span>Manager</span>
            </button>

            <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />

            <button
              className={`kds-rail-btn ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
              title="Menu Management & Finished Goods Catalog"
            >
              <span className="rail-icon">🍽️</span>
              <span>Menu</span>
            </button>

            <button
              className={`kds-rail-btn ${activeTab === '86' ? 'active' : ''}`}
              onClick={() => setActiveTab('86')}
              title="86-List & Depleted Dishes"
            >
              <span className="rail-icon">🚫</span>
              <span>86-List</span>
              {(S.outOfStockIds || []).length > 0 && (
                <span className="rail-badge" style={{ background: '#FF3B30' }}>
                  {(S.outOfStockIds || []).length}
                </span>
              )}
            </button>

            <button
              className={`kds-rail-btn ${activeTab === 'haccp' ? 'active' : ''}`}
              onClick={() => setActiveTab('haccp')}
              title="HACCP Temperature & Safety Compliance"
            >
              <span className="rail-icon">🌡️</span>
              <span>HACCP</span>
            </button>

            <button
              className={`kds-rail-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              title="Kitchen Order History & Tracking Analytics"
            >
              <span className="rail-icon">🕒</span>
              <span>History</span>
              {allHistoryOrders.length > 0 && (
                <span className="rail-badge" style={{ background: '#0D9488' }}>
                  {allHistoryOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Rail Bottom User / Role & Logout */}
        <div className="kds-rail-group">
          <button
            className="kds-rail-btn"
            onClick={() => setShowRoleModal(true)}
            title={`Logged in as ${sess?.name || 'Chef'} · Switch Workspace / Role`}
          >
            <span className="rail-icon">🔄</span>
            <span>Switch</span>
          </button>

          <button
            className="kds-rail-btn"
            onClick={out}
            title="Sign Out / Back to Launcher"
          >
            <span className="rail-icon">🚪</span>
            <span>Exit</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Slide-Over Drawer Navigation (<900px) ── */}
      {sidebarOpen && (
        <div className="kds-drawer-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="kds-drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="kds-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🍽️</span>
                <div>
                  <b style={{ color: '#fff', fontSize: 16 }}>Safari Grill &amp; Lounge</b>
                  <small style={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>RestoERP Kitchen Operations</small>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: 4 }}
              >
                ✕
              </button>
            </div>

            <div className="kds-drawer-body">
              <button
                className={`kds-drawer-nav-item ${activeTab === 'monitor' ? 'active' : ''}`}
                onClick={() => { setActiveTab('monitor'); setSidebarOpen(false); }}
              >
                <span style={{ fontSize: 20 }}>👨‍🍳</span>
                <span style={{ flex: 1 }}>Kitchen Display System (KDS)</span>
                {(waitingOrders.length + cookingOrdersRaw.length) > 0 && (
                  <span style={{ background: '#EF4444', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 99 }}>
                    {waitingOrders.length + cookingOrdersRaw.length}
                  </span>
                )}
              </button>

              <button
                className="kds-drawer-nav-item"
                onClick={() => { setSidebarOpen(false); setV && setV('cashier'); }}
              >
                <span style={{ fontSize: 20 }}>💳</span>
                <span>Point of Sale (POS Desk)</span>
              </button>

              <button
                className="kds-drawer-nav-item"
                onClick={() => { setSidebarOpen(false); setV && setV('waiter'); }}
              >
                <span style={{ fontSize: 20 }}>🧑‍🍳</span>
                <span>Waitstaff Floor Service</span>
              </button>

              <button
                className="kds-drawer-nav-item"
                onClick={() => { setSidebarOpen(false); setV && setV('storekeeper'); }}
              >
                <span style={{ fontSize: 20 }}>📦</span>
                <span>Inventory &amp; Stores</span>
              </button>

              <button
                className="kds-drawer-nav-item"
                onClick={() => { setSidebarOpen(false); setV && setV('manager'); }}
              >
                <span style={{ fontSize: 20 }}>👔</span>
                <span>Manager Dashboard</span>
              </button>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />

              <button
                className={`kds-drawer-nav-item ${activeTab === '86' ? 'active' : ''}`}
                onClick={() => { setActiveTab('86'); setSidebarOpen(false); }}
              >
                <span style={{ fontSize: 20 }}>🚫</span>
                <span>86-List &amp; Depleted Dishes</span>
              </button>

              <button
                className={`kds-drawer-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => { setActiveTab('menu'); setSidebarOpen(false); }}
              >
                <span style={{ fontSize: 20 }}>🍽️</span>
                <span>Menu Catalog &amp; Finished Goods</span>
              </button>

              <button
                className={`kds-drawer-nav-item ${activeTab === 'haccp' ? 'active' : ''}`}
                onClick={() => { setActiveTab('haccp'); setSidebarOpen(false); }}
              >
                <span style={{ fontSize: 20 }}>🌡️</span>
                <span>HACCP Compliance Log</span>
              </button>

              <button
                className={`kds-drawer-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => { setActiveTab('history'); setSidebarOpen(false); }}
              >
                <span style={{ fontSize: 20 }}>🕒</span>
                <span style={{ flex: 1 }}>Order History &amp; Analytics</span>
                {allHistoryOrders.length > 0 && (
                  <span style={{ background: '#0D9488', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 99 }}>
                    {allHistoryOrders.length}
                  </span>
                )}
              </button>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />

              <button
                className="kds-drawer-nav-item"
                onClick={() => { setSidebarOpen(false); setShowRoleModal(true); }}
              >
                <span style={{ fontSize: 20 }}>🔄</span>
                <span>Switch Role / Site</span>
              </button>

              <button
                className="kds-drawer-nav-item"
                style={{ color: '#FCA5A5' }}
                onClick={() => { setSidebarOpen(false); out && out(); }}
              >
                <span style={{ fontSize: 20 }}>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Viewport Frame ── */}
      <div className="kds-main-viewport">
        
        {/* Top Teal Status & Navigation Header matching Image cb6e1d9e (Sticky at top) */}
        <header className="kds-teal-nav">
          <div className="kds-teal-tabs">
            {/* Hamburger Button for Mobile screens to open navigation drawer */}
            <button
              className="kds-menu-toggle-btn"
              onClick={() => setSidebarOpen(true)}
              title="Open Navigation Menu"
            >
              ☰
            </button>

            <button
              className={`kds-nav-tab ${activeTab === 'monitor' && stageFilter === 'all' ? 'active' : ''}`}
              onClick={() => { setActiveTab('monitor'); setStageFilter('all'); }}
            >
              Monitor 1 ({countAllActive})
            </button>
            <button
              className={`kds-nav-tab ${activeTab === 'monitor' && stageFilter === 'placed' ? 'active' : ''}`}
              onClick={() => { setActiveTab('monitor'); setStageFilter('placed'); }}
            >
              New ({countPlaced})
            </button>
            <button
              className={`kds-nav-tab ${activeTab === 'monitor' && stageFilter === 'preparing' ? 'active' : ''}`}
              onClick={() => { setActiveTab('monitor'); setStageFilter('preparing'); }}
            >
              Cooking ({countCooking})
            </button>
            <button
              className={`kds-nav-tab ${activeTab === 'monitor' && stageFilter === 'ready' ? 'active' : ''}`}
              onClick={() => { setActiveTab('monitor'); setStageFilter('ready'); }}
            >
              Ready ({countReady})
            </button>
            <button
              className={`kds-nav-tab ${activeTab === 'monitor' && stageFilter === 'served' ? 'active' : ''}`}
              onClick={() => { setActiveTab('monitor'); setStageFilter('served'); }}
            >
              Served ({countServed})
            </button>

            {/* Utility Tab Options */}
            <button
              className={`kds-nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
              style={{ opacity: 0.95 }}
            >
              🍽️ Menu ({S.menu ? S.menu.length : MENU.length})
            </button>
            <button
              className={`kds-nav-tab ${activeTab === '86' ? 'active' : ''}`}
              onClick={() => setActiveTab('86')}
              style={{ opacity: 0.85 }}
            >
              86-List
            </button>
            <button
              className={`kds-nav-tab ${activeTab === 'haccp' ? 'active' : ''}`}
              onClick={() => setActiveTab('haccp')}
              style={{ opacity: 0.85 }}
            >
              HACCP
            </button>
            <button
              className={`kds-nav-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              style={{ opacity: 0.95 }}
            >
              History ({allHistoryOrders.length})
            </button>
          </div>

          <div className="kds-nav-right">
            {/* Live Clock "12:30" */}
            <span className="kds-clock">{currentTimeStr}</span>

            {/* Sound Mute/Unmute Toggle Button */}
            <button
              className="kds-sound-btn"
              title={soundEnabled ? 'Kitchen Sound Alerts ON (Click to mute)' : 'Kitchen Sound Alerts MUTED (Click to enable)'}
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playKitchenChime('chime');
              }}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Staff Station Badge "AD" */}
            <div
              className="kds-avatar-badge"
              title={`Station Expo · ${sess?.name || 'Chef Ammie'} (Click to switch)`}
              onClick={() => setShowRoleModal(true)}
            >
              AD
            </div>

            {/* 9-Dots App Switcher Button (matches Image 2 top right) */}
            <button
              className="kds-launcher-dots-btn"
              title="Open Navigation & Role Switcher"
              onClick={() => setSidebarOpen(true)}
            >
              ⠇⠇⠇
            </button>
          </div>
        </header>

        {/* ── Scrollable Central Area (Columns Scroll Independently, Header & Bottom Stay Pinned) ── */}
        <main className={`kds-columns-scrollable ${activeTab !== 'monitor' ? 'tab-scroll' : ''}`}>
          {activeTab === 'monitor' && (
            <div className="kds-full-viewport">

              {/* Subtoolbar with stage pills, channel filters, search input, sort dropdown, and actions */}
              <div className="kds-subtoolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    className={`kds-stage-pill ${stageFilter === 'all' ? 'all active' : ''}`}
                    onClick={() => setStageFilter('all')}
                  >
                    All Active ({countAllActive})
                  </button>
                  <button
                    className={`kds-stage-pill placed ${stageFilter === 'placed' ? 'active' : ''}`}
                    onClick={() => setStageFilter(stageFilter === 'placed' ? 'all' : 'placed')}
                  >
                    New ({countPlaced})
                  </button>
                  <button
                    className={`kds-stage-pill accepted ${stageFilter === 'accepted' ? 'active' : ''}`}
                    onClick={() => setStageFilter(stageFilter === 'accepted' ? 'all' : 'accepted')}
                  >
                    Accepted ({countAccepted})
                  </button>
                  <button
                    className={`kds-stage-pill preparing ${stageFilter === 'preparing' ? 'active' : ''}`}
                    onClick={() => setStageFilter(stageFilter === 'preparing' ? 'all' : 'preparing')}
                  >
                    👨‍🍳 Cooking ({countCooking})
                  </button>
                  <button
                    className={`kds-stage-pill ready ${stageFilter === 'ready' ? 'active' : ''}`}
                    onClick={() => setStageFilter(stageFilter === 'ready' ? 'all' : 'ready')}
                  >
                    ✓ Ready at Pass ({countReady})
                  </button>
                  <button
                    className={`kds-stage-pill served ${stageFilter === 'served' ? 'active' : ''}`}
                    onClick={() => setStageFilter(stageFilter === 'served' ? 'all' : 'served')}
                  >
                    🍽️ Served ({countServed})
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Channel Dropdown */}
                  <select
                    value={channelFilter}
                    onChange={e => setChannelFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 800,
                      background: '#0D9488',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ALL" style={{ color: '#0F172A', background: '#fff' }}>ALL CHANNELS ▾</option>
                    <option value="Dine In" style={{ color: '#0F172A', background: '#fff' }}>🍽️ Dine-In</option>
                    <option value="Takeaway" style={{ color: '#0F172A', background: '#fff' }}>🥡 Takeaway</option>
                    <option value="Pickup" style={{ color: '#0F172A', background: '#fff' }}>📦 Pickup</option>
                    <option value="Delivery" style={{ color: '#0F172A', background: '#fff' }}>🛵 Delivery</option>
                  </select>

                  {/* Search input */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="🔍 Search #ticket, table, dish..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      style={{
                        padding: '6px 10px 6px 28px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 12,
                        background: '#fff',
                        width: 190
                      }}
                    />
                    {orderSearch && (
                      <button
                        onClick={() => setOrderSearch('')}
                        style={{ position: 'absolute', right: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#94A3B8' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Sort select */}
                  <select
                    value={orderSort}
                    onChange={e => setOrderSort(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 12,
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="fifo">Sort: FIFO (Oldest)</option>
                    <option value="lifo">Sort: LIFO (Newest)</option>
                    <option value="urgent">Sort: Urgent (Longest wait)</option>
                    <option value="table">Sort: Table No</option>
                  </select>

                  {/* Dedicated Station Prep & Batch Summary trigger */}
                  <button
                    onClick={() => setShowSummaryModal(true)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 12,
                      fontWeight: 700,
                      background: '#fff',
                      color: '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    title="Open All-Day Station Prep & Batch Cooking Summary"
                  >
                    <span>📊 Batch Summary</span>
                    {cookingSummary.length > 0 && (
                      <span style={{
                        background: '#0E5A47',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '1px 7px',
                        borderRadius: 99
                      }}>
                        {cookingSummary.reduce((acc, i) => acc + (i.totalQty || i.qty || 1), 0)}
                      </span>
                    )}
                  </button>

                  {/* Quick new demo ticket button */}
                  <button
                    className="btn sm o"
                    style={{ background: '#FF6B2C', padding: '6px 12px', fontSize: 12, width: 'auto' }}
                    onClick={() => setNewOrderModal(true)}
                    title="Add fast demo ticket"
                  >
                    + Ticket
                  </button>

                  {/* Kitchen Quick Add Menu Item under 10s */}
                  <button
                    className="btn sm"
                    style={{ background: '#0E5A47', color: '#fff', padding: '6px 12px', fontSize: 12, width: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => setQuickAddModal(true)}
                    title="Kitchen on-site quick menu item addition (<10s) - live on POS marked Needs Review"
                  >
                    <span>⚡</span>
                    <span>+ Quick Add Item</span>
                  </button>
                </div>
              </div>

              {/* Full-width scrollable orders grid */}
              <div className="kds-orders-scroll-area">
                {displayedOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, margin: '20px auto', maxWidth: 480, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🥣</div>
                    <b style={{ fontSize: 18, color: '#0F172A' }}>No Orders in View</b>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '8px 0 16px' }}>
                      {stageFilter !== 'all' || channelFilter !== 'ALL' || orderSearch
                        ? 'Try clearing the search or switching stage filter to All Active.'
                        : 'Kitchen queue is currently clear. New incoming tickets will display here.'}
                    </p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      {(stageFilter !== 'all' || channelFilter !== 'ALL' || orderSearch) && (
                        <button
                          className="btn sm ghost"
                          style={{ width: 'auto' }}
                          onClick={() => { setStageFilter('all'); setChannelFilter('ALL'); setOrderSearch(''); }}
                        >
                          Reset Filters
                        </button>
                      )}
                      <button
                        className="btn sm o"
                        style={{ background: '#FF6B2C', width: 'auto' }}
                        onClick={() => setNewOrderModal(true)}
                      >
                        + Create Ticket
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="kds-orders-full-grid">
                    {displayedOrders.map(order => {
                      const isSelected = order.id === selectedOrderId;
                      const orderNum = order.no ? String(order.no).replace('#', '') : String(order.id).slice(-4);
                      const timeLabel = order.timeStr || fmtTime(order.t);
                      const theme = getChannelTheme(order);
                      const elapsedMinutes = order.elapsedMins !== undefined
                        ? order.elapsedMins
                        : Math.max(1, Math.round((Date.now() - (order.t || Date.now())) / 60000));
                      const isUrgent = elapsedMinutes > 15 && !['ready', 'served', 'paid', 'closed', 'cancelled'].includes(order.st);
                      const isWarning = elapsedMinutes > 10 && !isUrgent && !['ready', 'served', 'paid', 'closed', 'cancelled'].includes(order.st);

                      return (
                        <div
                          key={order.id}
                          id={`kds-order-${order.id}`}
                          className={`kds-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedOrderId(order.id)}
                          style={{
                            boxShadow: isSelected ? '0 0 0 3px #0E5A47, 0 8px 24px rgba(0,0,0,0.15)' : undefined
                          }}
                        >
                          {/* Stage-themed card header */}
                          <div className={`kds-card-header ${
                            order.st === 'placed' ? 'waiting' :
                            order.st === 'accepted' ? 'takeaway' :
                            order.st === 'preparing' ? theme.headerClass :
                            order.st === 'ready' ? 'completed' :
                            order.st === 'served' ? 'delivery' : 'waiting'
                          }`}>
                            <div className="kds-card-top-row">
                              <span className="kds-card-no">#{orderNum.padStart(4, '0')}</span>
                              <span className="kds-card-time">{timeLabel}</span>
                              <span className={`kds-timer-badge ${isUrgent ? 'urgent' : isWarning ? 'warning' : 'normal'}`} title="Prep elapsed timer">
                                ⏱️ {elapsedMinutes}m
                              </span>
                              <span className="kds-guests-badge">
                                👥 {order.guests || 4}
                              </span>
                            </div>

                            <div className="kds-card-subrow">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 800 }}>{order.tb || 'Table'}</span>
                                <span style={{ opacity: 0.85 }}>· {order.by || 'Ammie'}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className={`kds-stage-pill ${order.st}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                                  {order.st.toUpperCase()}
                                </span>
                                <button
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: 'inherit', fontWeight: 800 }}
                                  onClick={(e) => { e.stopPropagation(); setInfoOrder(order); }}
                                  title="Ticket details"
                                >
                                  ⌵
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Substripe: Source / Order Type */}
                          <div className="kds-substripe" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{order.src || (order.online ? 'ONLINE_ORDER' : 'POS')} · {order.orderType || 'Dine In'}</span>
                            {order.cust && <span style={{ fontStyle: 'italic', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Guest: {order.cust}</span>}
                          </div>

                          {/* Special Customer / Kitchen Note */}
                          {order.note && (
                            <div style={{ padding: '6px 12px', background: '#FEF3C7', borderBottom: '1px solid #FDE68A', fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                              ⚠️ Kitchen Note: {order.note}
                            </div>
                          )}

                          {/* Items list with done checkboxes */}
                          <div className="kds-card-items">
                            {(order.it || []).map((line, idx) => {
                              const item = M[line.id] || { n: `Item #${line.id}` };
                              const isDone = line.done;
                              const isVoided = line.voided;

                              return (
                                <div key={idx} className="kds-item-row">
                                  <div className="kds-item-main">
                                    <div className={`kds-item-qty-name ${isDone ? 'done' : ''} ${isVoided ? 'voided' : ''}`}>
                                      <span>{line.q}x</span>
                                      <span>{item.n}</span>
                                      {isVoided && <span className="kds-void-tag">VOIDED</span>}
                                    </div>
                                    {line.sub && <div className="kds-item-sub">{line.sub}</div>}
                                    {line.mods && line.mods.length > 0 && (
                                      <div className="kds-item-mods">
                                        {line.mods.map((mod, mIdx) => (
                                          <span key={mIdx}>{mod}</span>
                                        ))}
                                      </div>
                                    )}
                                    {line.note && <div className="kds-item-note">Note: {line.note}</div>}
                                  </div>

                                  {/* Checkbox button */}
                                  <button
                                    className={`kds-item-check-btn ${isDone ? 'checked' : ''} ${isVoided ? 'voided' : ''}`}
                                    title={isVoided ? 'Voided item' : isDone ? 'Marked cooked' : 'Click to strike through when prepared'}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isVoided) handleToggleItem(order.id, idx);
                                    }}
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      handleVoidItem(order.id, idx, e);
                                    }}
                                  >
                                    {isDone ? '✓' : isVoided ? '✕' : '✓'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* All Required Action Buttons for Complete Lifecycle */}
                          <div className="kds-card-actions">
                            {order.st === 'placed' && (
                              <>
                                <button
                                  className="kds-btn-action accept"
                                  onClick={(e) => { e.stopPropagation(); handleAcceptOrder(order.id); }}
                                  title="Accept order into active kitchen"
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  className="kds-btn-action start"
                                  onClick={(e) => { e.stopPropagation(); handleStartOrder(order.id); }}
                                  title="Start cooking on line"
                                >
                                  🔥 Start Prep
                                </button>
                                <button
                                  className="kds-btn-action cancel"
                                  onClick={(e) => { e.stopPropagation(); handleOpenCancel(order); }}
                                  title="Cancel / Void order"
                                >
                                  ✕ Cancel
                                </button>
                              </>
                            )}

                            {order.st === 'accepted' && (
                              <>
                                <button
                                  className="kds-btn-action start"
                                  style={{ flex: 2 }}
                                  onClick={(e) => { e.stopPropagation(); handleStartOrder(order.id); }}
                                  title="Begin cooking now"
                                >
                                  🔥 Start Cooking
                                </button>
                                <button
                                  className="kds-btn-action cancel"
                                  onClick={(e) => { e.stopPropagation(); handleOpenCancel(order); }}
                                  title="Cancel / Void order"
                                >
                                  ✕ Cancel
                                </button>
                              </>
                            )}

                            {order.st === 'preparing' && (
                              <>
                                <button
                                  className="kds-btn-action ready"
                                  onClick={(e) => { e.stopPropagation(); handleMarkReady(order.id); }}
                                  title="Mark all dishes ready at pass"
                                >
                                  ✓ Ready at Pass
                                </button>
                                <button
                                  className="kds-btn-action serve"
                                  onClick={(e) => { e.stopPropagation(); handleFastServe(order.id); }}
                                  title="Fast pass & serve directly to diners"
                                >
                                  ⚡ Fast Serve
                                </button>
                                <button
                                  className="kds-btn-action cancel"
                                  onClick={(e) => { e.stopPropagation(); handleOpenCancel(order); }}
                                  title="Cancel order"
                                >
                                  ✕
                                </button>
                              </>
                            )}

                            {order.st === 'ready' && (
                              <>
                                <button
                                  className="kds-btn-action serve"
                                  style={{ flex: 2 }}
                                  onClick={(e) => { e.stopPropagation(); handleMarkServed(order.id); }}
                                  title="Confirm served to table / diner"
                                >
                                  🍽️ Mark Served
                                </button>
                                <button
                                  className="kds-btn-action reopen"
                                  onClick={(e) => { e.stopPropagation(); handleReopenToPrep(order.id); }}
                                  title="Return ticket back to prep"
                                >
                                  ↺ Return
                                </button>
                              </>
                            )}

                            {order.st === 'served' && (
                              <>
                                <div style={{ flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#DCFCE7', color: '#15803D', borderRadius: 8, fontWeight: 800, fontSize: 12, padding: '7px 10px' }}>
                                  ✓ Served to Table
                                </div>
                                <button
                                  className="kds-btn-action reopen"
                                  onClick={(e) => { e.stopPropagation(); handleReopenToPrep(order.id); }}
                                  title="Remake or return order to prep station"
                                >
                                  ↺ Remake
                                </button>
                              </>
                            )}
                          </div>

                          {/* Card Utility Mini Bar */}
                          <div className="kds-card-tools">
                            <button
                              className="kds-card-tool-btn"
                              onClick={(e) => { e.stopPropagation(); setSlipOrder(order); }}
                              title="Print Kitchen Order Thermal Slip"
                            >
                              🖨️ Slip
                            </button>
                            <button
                              className="kds-card-tool-btn"
                              onClick={(e) => { e.stopPropagation(); setInfoOrder(order); }}
                              title="View detailed allergens, audit trail, and station log"
                            >
                              📄 Details
                            </button>
                            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                              {order.it?.length || 0} items
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        {/* 86-List Tab */}
        {activeTab === '86' && (
          <div style={{ padding: 18, background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>86-List & Depleted Dishes</h3>
                <small style={{ color: 'var(--mut)' }}>Toggling 86 instantly marks dishes as SOLD OUT across customer and POS ordering.</small>
              </div>
              <button className="btn sm ghost" onClick={() => setWasteModal(true)}>
                🗑️ Log Kitchen Waste
              </button>
            </div>

            <div className="cg" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {MENU.map(m => {
                const is86 = (S.outOfStockIds || []).includes(m.id);
                return (
                  <div
                    key={m.id}
                    className="card row"
                    style={{
                      background: is86 ? '#FFF0F0' : 'var(--card)',
                      borderColor: is86 ? '#FF3B30' : 'var(--line)',
                      padding: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 28 }}>{m.e || '🍽️'}</span>
                      <div>
                        <b>{m.n}</b>
                        <div style={{ fontSize: 12, color: 'var(--mut)' }}>{m.c} · {fmt(m.p)}</div>
                      </div>
                    </div>
                    <button
                      className="btn sm"
                      style={{
                        background: is86 ? '#FF3B30' : 'var(--line)',
                        color: is86 ? '#fff' : 'var(--tx)',
                        width: 'auto',
                        padding: '6px 12px',
                        fontSize: 12
                      }}
                      onClick={() => A.toggle86(m.id, sess?.name || 'Chef')}
                    >
                      {is86 ? '86 ACTIVE' : 'MARK 86'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu Management & Finished Goods Catalog Tab */}
        {activeTab === 'menu' && (
          <div style={{ padding: 18, background: '#fff', minHeight: '100%' }}>
            <MenuManagementView
              menuList={S.menu && S.menu.length ? S.menu : MENU}
              stockList={S.stock || []}
              outOfStockIds={S.outOfStockIds || []}
              onToggle86={(id, actor) => A.toggle86(id, actor || sess?.name || 'Chef Expo')}
              onCreateItem={(data, actor) => A.createMenuItem(data, actor || sess?.name || 'Chef Expo')}
              onUpdateItem={(id, data, actor) => A.updateMenuItem(id, data, actor || sess?.name || 'Chef Expo')}
              onDeleteItem={(id, actor) => A.deleteMenuItem(id, actor || sess?.name || 'Chef Expo')}
              actor={sess?.name || 'Chef Expo'}
            />
          </div>
        )}

        {/* HACCP Food Safety Log Tab */}
        {activeTab === 'haccp' && (
          <div style={{ padding: 18, background: '#fff' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>HACCP Temperature & Safety Compliance</h3>
            <small style={{ color: 'var(--mut)' }}>Critical Control Points (CCP) logged every shift for cold storage and hot holding.</small>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, margin: '16px 0' }}>
              <div className="card" style={{ padding: 14 }}>
                <b>Cold Room Fridge (CCP 1)</b>
                <div style={{ fontSize: 12, color: 'var(--mut)', marginBottom: 8 }}>Target: &lt; 4.0°C</div>
                <input
                  className="inp"
                  value={haccpLog.fridge}
                  onChange={e => setHaccpLog({ ...haccpLog, fridge: e.target.value })}
                  placeholder="e.g. 3.1"
                />
              </div>

              <div className="card" style={{ padding: 14 }}>
                <b>Deep Meat Freezer (CCP 2)</b>
                <div style={{ fontSize: 12, color: 'var(--mut)', marginBottom: 8 }}>Target: &lt; -18.0°C</div>
                <input
                  className="inp"
                  value={haccpLog.freezer}
                  onChange={e => setHaccpLog({ ...haccpLog, freezer: e.target.value })}
                  placeholder="e.g. -18.2"
                />
              </div>

              <div className="card" style={{ padding: 14 }}>
                <b>Hot Holding Pass (CCP 3)</b>
                <div style={{ fontSize: 12, color: 'var(--mut)', marginBottom: 8 }}>Target: &gt; 63.0°C</div>
                <input
                  className="inp"
                  value={haccpLog.pass}
                  onChange={e => setHaccpLog({ ...haccpLog, pass: e.target.value })}
                  placeholder="e.g. 68.5"
                />
              </div>
            </div>

            <button
              className="btn o sm"
              style={{ width: 'auto', background: '#0E5A47' }}
              onClick={() => {
                setHaccpSaved(true);
                setTimeout(() => setHaccpSaved(false), 3000);
              }}
            >
              {haccpSaved ? '✓ Temperatures Logged to HACCP Audit' : 'Record Shift Temperatures'}
            </button>
          </div>
        )}

        {/* ========================================================
            KDS ORDER HISTORY & OPERATIONS AUDIT ANALYTICS TAB
            ======================================================== */}
        {activeTab === 'history' && (
          <div className="kds-history-container">
            {/* Header with Title and Shift Actions */}
            <div className="kds-history-header-row">
              <div className="kds-history-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>🕒</span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0F172A' }}>
                      Kitchen Order History &amp; Operations Audit
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>
                      Accurately saved tracking records of placed, prepared, served, and settled tickets for audit &amp; performance analysis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="kds-history-acts">
                <button
                  className="btn sm"
                  style={{ background: '#0D9488', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}
                  onClick={exportHistoryCSV}
                  title="Download full CSV report of historical tickets for spreadsheet tracking"
                >
                  <span>📥</span>
                  <span>Export CSV</span>
                </button>

                <button
                  className="btn sm ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  onClick={() => window.print()}
                  title="Print shift summary audit slip"
                >
                  <span>🖨️</span>
                  <span>Print Shift Audit</span>
                </button>

                <button
                  className="btn sm ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  onClick={() => setActiveTab('monitor')}
                  title="Return to 3-column Kitchen Monitor"
                >
                  <span>⬅</span>
                  <span>Back to Monitor</span>
                </button>
              </div>
            </div>

            {/* Performance KPI Cards Grid */}
            <div className="kds-history-kpi-grid">
              <div className="kds-kpi-card">
                <span className="kds-kpi-lbl">Total Orders Tracked</span>
                <span className="kds-kpi-num">{historyAnalytics.totalCount}</span>
                <span className="kds-kpi-sub green">✓ Persisted store</span>
              </div>

              <div className="kds-kpi-card">
                <span className="kds-kpi-lbl">Avg Prep Turnaround</span>
                <span className="kds-kpi-num">{historyAnalytics.avgPrep}m</span>
                <span className={`kds-kpi-sub ${parseFloat(historyAnalytics.avgPrep) <= 15 ? 'green' : 'amber'}`}>
                  {parseFloat(historyAnalytics.avgPrep) <= 15 ? '✓ Under 15m benchmark' : '⚠️ Exceeds 15m benchmark'}
                </span>
              </div>

              <div className="kds-kpi-card">
                <span className="kds-kpi-lbl">On-Time Performance</span>
                <span className="kds-kpi-num">{historyAnalytics.onTimePct}%</span>
                <span className="kds-kpi-sub green">✓ Speed compliance rate</span>
              </div>

              <div className="kds-kpi-card">
                <span className="kds-kpi-lbl">Dishes Prepared</span>
                <span className="kds-kpi-num">{historyAnalytics.totalPortions}</span>
                <span className="kds-kpi-sub blue">🍽️ Kitchen pass output</span>
              </div>

              <div className="kds-kpi-card">
                <span className="kds-kpi-lbl">Shift Sales Value</span>
                <span className="kds-kpi-num" style={{ fontSize: 22 }}>{fmt(historyAnalytics.totalSales)}</span>
                <span className="kds-kpi-sub green">💰 Tracked gross</span>
              </div>

              <div className="kds-kpi-card">
                <span className="kds-kpi-lbl">Voided Dishes Loss</span>
                <span className="kds-kpi-num" style={{ color: historyAnalytics.voidedCount > 0 ? '#DC2626' : '#0F172A' }}>
                  {historyAnalytics.voidedCount}x
                </span>
                <span className={`kds-kpi-sub ${historyAnalytics.voidedCount > 0 ? 'red' : 'green'}`}>
                  {historyAnalytics.voidedCount > 0 ? `-${fmt(historyAnalytics.voidedLoss)} loss` : '✓ Zero waste logged'}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar Controls */}
            <div className="kds-history-controls">
              <div className="kds-history-search-row">
                <input
                  type="text"
                  className="kds-history-search-inp"
                  placeholder="🔍 Search ticket #, table, server, customer, or dish (e.g. Pizza, Steak, #0001, Table 01)..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                />

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Sort by:</label>
                  <select
                    className="inp"
                    style={{ margin: 0, padding: '7px 12px', fontSize: 13, background: '#fff', width: 'auto' }}
                    value={historySortBy}
                    onChange={e => setHistorySortBy(e.target.value)}
                  >
                    <option value="recent">Most Recent First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="prepTime">Longest Prep Time</option>
                    <option value="value">Highest Total Value</option>
                  </select>
                </div>
              </div>

              {/* Status and Channel Filter Pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', width: 95 }}>STATUS:</span>
                  <div className="kds-history-pills">
                    {[
                      { id: 'ALL', label: `All History (${allHistoryOrders.length})` },
                      { id: 'ready', label: 'Ready at Pass' },
                      { id: 'served', label: 'Served to Table' },
                      { id: 'paid', label: 'Paid & Settled' },
                      { id: 'billreq', label: 'Bill Requested' },
                      { id: 'closed', label: 'Archived / Closed' },
                      { id: 'cancelled', label: 'Cancelled / Void' }
                    ].map(pill => (
                      <button
                        key={pill.id}
                        className={`kds-history-pill-btn ${historyStatusFilter === pill.id ? 'active' : ''}`}
                        onClick={() => setHistoryStatusFilter(pill.id)}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', width: 95 }}>CHANNEL:</span>
                  <div className="kds-history-pills">
                    {[
                      { id: 'ALL', label: 'All Channels' },
                      { id: 'Dine In', label: '🍽️ Dine-In' },
                      { id: 'Takeaway', label: '🥡 Takeaway' },
                      { id: 'Pickup', label: '📦 Pickup' },
                      { id: 'Delivery', label: '🛵 Delivery' }
                    ].map(ch => (
                      <button
                        key={ch.id}
                        className={`kds-history-pill-btn ${historyChannelFilter === ch.id ? 'active' : ''}`}
                        onClick={() => setHistoryChannelFilter(ch.id)}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* List of Historical Orders */}
            <div className="kds-history-list">
              {filteredHistoryOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: '#F8FAFC', borderRadius: 14, color: '#64748B' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                  <b style={{ color: '#0F172A', fontSize: 16 }}>No Orders Match Your Filters</b>
                  <p style={{ fontSize: 13, margin: '6px 0 14px' }}>
                    Try clearing the search input or choosing "All History" to view saved tickets.
                  </p>
                  <button
                    className="btn sm ghost"
                    style={{ width: 'auto' }}
                    onClick={() => { setHistorySearch(''); setHistoryStatusFilter('ALL'); setHistoryChannelFilter('ALL'); }}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                filteredHistoryOrders.map(order => {
                  const orderNum = order.no ? String(order.no).replace('#', '') : String(order.id).slice(-4);
                  const timeLabel = order.timeStr || fmtTime(order.t);
                  const prepTime = order.elapsedMins || Math.max(3, Math.round((Date.now() - (order.t || 0)) / 60000));
                  const isOnTime = prepTime <= (order.timerTarget || 15);
                  const totalVal = (order.it || []).reduce((acc, l) => acc + (M[l.id]?.p || 0) * l.q, 0);
                  const isAuditExpanded = expandedAuditId === order.id;

                  const channelType = (order.orderType || '').toLowerCase();
                  let channelBadgeClass = 'other';
                  let channelIcon = '🍽️';
                  if (channelType.includes('dine')) { channelBadgeClass = 'dine-in'; channelIcon = '🍽️'; }
                  else if (channelType.includes('take')) { channelBadgeClass = 'takeaway'; channelIcon = '🥡'; }
                  else if (channelType.includes('pick')) { channelBadgeClass = 'pickup'; channelIcon = '📦'; }
                  else if (channelType.includes('deliv')) { channelBadgeClass = 'delivery'; channelIcon = '🛵'; }

                  return (
                    <div key={order.id} className="kds-history-ticket-card">
                      {/* Top Header Row */}
                      <div className="kds-history-card-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span className="kds-history-id-badge">
                            #{orderNum.padStart(4, '0')}
                          </span>
                          <span className={`kds-history-type-chip ${channelBadgeClass}`}>
                            {channelIcon} {order.orderType || 'Dine In'}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: isOnTime ? '#E6F9EE' : '#FEF3C7',
                              color: isOnTime ? '#15803D' : '#B45309'
                            }}
                          >
                            {isOnTime ? `✓ On-Time (${prepTime}m)` : `⚠️ Over Target (${prepTime}m)`}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: order.st === 'ready' ? '#D1FAE5' : order.st === 'paid' ? '#DBEAFE' : order.st === 'served' ? '#E0F2FE' : '#F1F5F9',
                              color: order.st === 'ready' ? '#065F46' : order.st === 'paid' ? '#1E40AF' : order.st === 'served' ? '#0369A1' : '#475569',
                              textTransform: 'uppercase'
                            }}
                          >
                            {order.st === 'ready' ? 'READY AT PASS' : order.st.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
                            {fmt(totalVal)}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn sm ghost"
                              style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700 }}
                              onClick={() => {
                                handleReopen(order.id);
                                playKitchenChime('done');
                              }}
                              title="Recall order back to active kitchen pass"
                            >
                              ↺ Recall to Pass
                            </button>
                            <button
                              className="btn sm ghost"
                              style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700 }}
                              onClick={() => setInfoOrder(order)}
                              title="Print / View ticket slip"
                            >
                              🖨️ Slip
                            </button>
                            <button
                              className="btn sm ghost"
                              style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700 }}
                              onClick={() => setExpandedAuditId(isAuditExpanded ? null : order.id)}
                              title="View timestamp timeline"
                            >
                              {isAuditExpanded ? 'Hide Log ▴' : 'Audit Log ▾'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Meta Information Row */}
                      <div className="kds-history-meta-row">
                        <span><b>Placed:</b> {timeLabel}</span>
                        <span><b>Location:</b> {order.tb || 'Table'}</span>
                        <span><b>Guests:</b> 👥 {order.guests || 2}</span>
                        <span><b>Server:</b> {order.by || 'Ammie'}</span>
                        <span><b>Source:</b> {order.src || 'POS'}</span>
                        {order.paid && <span style={{ color: '#16A34A', fontWeight: 700 }}>✓ Paid ({order.pm || 'Cash'})</span>}
                      </div>

                      {/* Ordered Items Grid */}
                      <div className="kds-history-items-grid">
                        {(order.it || []).map((line, idx) => {
                          const item = M[line.id] || { n: `Item #${line.id}`, p: 0 };
                          const isVoided = line.voided;
                          return (
                            <div key={idx} className={`kds-history-item-line ${isVoided ? 'voided' : ''}`}>
                              <span>
                                <b>{line.q}x</b> {item.n}
                                {line.sub && <small style={{ color: '#64748B', display: 'block' }}>{line.sub}</small>}
                                {line.mods && line.mods.length > 0 && (
                                  <small style={{ color: '#64748B', display: 'block' }}>{line.mods.join(', ')}</small>
                                )}
                                {line.note && (
                                  <small style={{ color: '#D97706', display: 'block' }}>Note: {line.note}</small>
                                )}
                              </span>
                              <span>
                                {isVoided ? (
                                  <span style={{ color: '#DC2626', fontWeight: 800 }}>VOIDED</span>
                                ) : (
                                  <span style={{ color: '#16A34A' }}>✓ {fmt(item.p * line.q)}</span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expandable Audit Log Timeline */}
                      {isAuditExpanded && (
                        <div className="kds-history-timeline">
                          <b style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Chronological Audit Trail:</b>
                          {(order.log || ['Order recorded in kitchen store']).map((entry, lIdx) => (
                            <div key={lIdx}>• {entry}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          BOTTOM BUMPBAR CONTROLS matching Image 1 & Image 2 (Sticky at bottom)
          ======================================================== */}
      <footer className="kds-bumpbar">
        {/* Primary BUMP Button (Orange) */}
        <button
          className="kds-bump-btn bump"
          title="Bump selected order to next lifecycle stage (Space / Enter)"
          onClick={handleBumpAction}
        >
          <span>⚡</span>
          <span>BUMP</span>
        </button>

        {/* COOKING Button */}
        <button
          className="kds-bump-btn cooking"
          title="Filter or Start Next Cooking Ticket (C)"
          onClick={handleBumpbarCooking}
        >
          <span>👨‍🍳</span>
          <span>COOKING</span>
        </button>

        {/* READY Button */}
        <button
          className="kds-bump-btn"
          style={{ background: '#16A34A', color: '#fff' }}
          title="Filter or Mark Ready at Pass"
          onClick={handleBumpbarReady}
        >
          <span>✓</span>
          <span>READY</span>
        </button>

        {/* SERVE Button */}
        <button
          className="kds-bump-btn"
          style={{ background: '#0D9488', color: '#fff' }}
          title="Mark Selected / Next Ready as Served"
          onClick={handleBumpbarServe}
        >
          <span>🍽️</span>
          <span>SERVE</span>
        </button>

        {/* SUMMARY Button */}
        <button
          className={`kds-bump-btn ${showSummaryModal ? 'bump' : ''}`}
          title="Open All-Day Station Prep & Batch Summary (S)"
          onClick={() => setShowSummaryModal(true)}
        >
          <span>📊</span>
          <span>SUMMARY</span>
        </button>

        {/* PRINT Button */}
        <button
          className="kds-bump-btn"
          title="Print Kitchen Ticket / Summary (P)"
          onClick={handleBumpbarPrint}
        >
          <span>🖨️</span>
          <span>PRINT</span>
        </button>

        {/* INFO Button */}
        <button
          className="kds-bump-btn"
          title="Ticket Info & Allergens (I)"
          onClick={handleBumpbarInfo}
        >
          <span>📄</span>
          <span>INFO</span>
        </button>

        {/* RECALL Button */}
        <button
          className="kds-bump-btn"
          title="Recall Last Completed Ticket (R)"
          onClick={handleBumpbarRecall}
        >
          <span>↺</span>
          <span>RECALL</span>
        </button>

        {/* SOUND TOGGLE Button */}
        <button
          className="kds-bump-btn"
          title="Toggle Audio Beeps"
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (!soundEnabled) playKitchenChime('chime');
          }}
        >
          <span>{soundEnabled ? '🔊' : '🔇'}</span>
          <span>{soundEnabled ? 'MUTE' : 'ENABLE SOUND'}</span>
        </button>

        {/* LEFT / RIGHT Navigation Buttons (Slate-grey) */}
        <button
          className="kds-bump-btn nav-slate"
          title="Select Previous Ticket (ArrowLeft)"
          onClick={() => handleNavigate('left')}
        >
          <span>← LEFT</span>
        </button>

        <button
          className="kds-bump-btn nav-slate"
          title="Select Next Ticket (ArrowRight)"
          onClick={() => handleNavigate('right')}
        >
          <span>RIGHT →</span>
        </button>

        {/* UP / DOWN Navigation Buttons (Warm amber) */}
        <button
          className="kds-bump-btn arrow-gold"
          title="Navigate Up (ArrowUp)"
          onClick={() => handleNavigate('up')}
        >
          <span>↑ UP</span>
        </button>

        <button
          className="kds-bump-btn arrow-gold"
          title="Navigate Down (ArrowDown)"
          onClick={() => handleNavigate('down')}
        >
          <span>↓ DOWN</span>
        </button>

        {/* HISTORY Button */}
        <button
          className={`kds-bump-btn ${activeTab === 'history' ? 'bump' : ''}`}
          title="View All Past Orders & Kitchen Tracking Analytics"
          onClick={() => setActiveTab(activeTab === 'history' ? 'monitor' : 'history')}
        >
          <span>🕒</span>
          <span>{activeTab === 'history' ? 'BACK TO KDS' : 'HISTORY'}</span>
        </button>
      </footer>

    </div> {/* closes kds-main-viewport */}

      {/* Ticket Details & Allergens Modal */}
      {infoOrder && (
        <Sheet t={`Ticket #${String(infoOrder.no || infoOrder.id).replace('#', '')}`} c={() => setInfoOrder(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="row" style={{ background: '#F8FAFC', padding: 12, borderRadius: 12 }}>
              <div>
                <b style={{ fontSize: 18 }}>{infoOrder.orderType || 'Dine In'} · {infoOrder.tb || 'Table'}</b>
                <div style={{ fontSize: 13, color: 'var(--mut)' }}>
                  Placed by {infoOrder.by || 'Server'} · Guests: {infoOrder.guests || 2}
                </div>
              </div>
              <span className={`kds-status-pill ${infoOrder.st}`} style={{ padding: '6px 14px', fontSize: 13 }}>
                {infoOrder.st}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <b style={{ fontSize: 14 }}>Ordered Dishes & Kitchen Stations:</b>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {(infoOrder.it || []).map((line, idx) => {
                  const m = M[line.id] || { n: `Item #${line.id}` };
                  return (
                    <div key={idx} className="row" style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 10 }}>
                      <div>
                        <b>{line.q}x {m.n}</b>
                        {line.mods && line.mods.length > 0 && (
                          <div style={{ fontSize: 12, color: 'var(--mut)' }}>{line.mods.join(', ')}</div>
                        )}
                        {line.note && <div style={{ fontSize: 12, color: '#FF6B2C' }}>Note: {line.note}</div>}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mut)' }}>
                        Station: {m.station || 'Grill'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <b style={{ fontSize: 14 }}>Audit History & Timestamps:</b>
              <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {(infoOrder.log || []).map((l, lIdx) => (
                  <div key={lIdx}>• {l}</div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {['placed', 'accepted'].includes(infoOrder.st) && (
                <button
                  className="btn o sm"
                  style={{ background: '#FF6B2C' }}
                  onClick={() => {
                    handleStartOrder(infoOrder.id);
                    setInfoOrder(null);
                  }}
                >
                  Start This Order
                </button>
              )}
              {infoOrder.st === 'preparing' && (
                <button
                  className="btn sm"
                  style={{ background: '#16A34A', color: '#fff' }}
                  onClick={() => {
                    handleDoneAll(infoOrder.id);
                    setInfoOrder(null);
                  }}
                >
                  Done All (Mark Ready)
                </button>
              )}
              <button className="btn sm ghost" onClick={() => setInfoOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {/* Cancel Order Modal with Reason Picker & Audit/Ledger sync */}
      {cancelModalOrder && (
        <Sheet
          title={`Cancel Order #${String(cancelModalOrder.no || cancelModalOrder.id).replace('#', '')}`}
          subtitle={`Table: ${cancelModalOrder.tb || 'Dine In'} · Server: ${cancelModalOrder.by || 'Staff'}`}
          onClose={() => setCancelModalOrder(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 12, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#991B1B' }}>
              <b>⚠️ Order Cancellation & Commission Reversal:</b>
              <p style={{ fontSize: 13, margin: '4px 0 0' }}>
                Cancelling this order will mark it cancelled in the KDS, notify POS/waiters, and automatically reverse any posted staff commissions in the ledger.
              </p>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                Select Cancellation Reason:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {[
                  'Customer changed mind',
                  'Kitchen 86 / Out of ingredients',
                  'Wrong table / Duplicate order',
                  'Table walked out',
                  'Preparation delay exceeded',
                  'Custom'
                ].map(r => (
                  <button
                    key={r}
                    type="button"
                    className="card"
                    style={{
                      padding: '10px 12px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      textAlign: 'left',
                      background: cancelReason === r ? '#EFF6FF' : '#fff',
                      border: cancelReason === r ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      color: cancelReason === r ? '#1D4ED8' : '#334155'
                    }}
                    onClick={() => setCancelReason(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {cancelReason === 'Custom' && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  Custom Reason Description:
                </label>
                <input
                  type="text"
                  className="inp"
                  placeholder="Explain why this order was cancelled..."
                  value={cancelCustomText}
                  onChange={e => setCancelCustomText(e.target.value)}
                />
              </div>
            )}

            <div>
              <b style={{ fontSize: 13, color: '#64748B' }}>Order Items to be Cancelled:</b>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(cancelModalOrder.it || []).map((line, idx) => (
                  <div key={idx} className="row" style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span>{line.q}x {M[line.id]?.n || `Item #${line.id}`}</span>
                    <span style={{ color: '#94A3B8' }}>{fmt((M[line.id]?.p || 0) * line.q)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                className="btn o sm"
                style={{ background: '#DC2626', flex: 1 }}
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </button>
              <button
                className="btn sm ghost"
                style={{ flex: 1 }}
                onClick={() => setCancelModalOrder(null)}
              >
                Keep Order
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {/* Kitchen Order Thermal Slip Modal */}
      {slipOrder && (
        <Sheet
          title={`Kitchen Slip #${String(slipOrder.no || slipOrder.id).replace('#', '')}`}
          onClose={() => setSlipOrder(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="receipt-paper" style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: 10, marginBottom: 12 }}>
                <b style={{ fontSize: 20, letterSpacing: 1 }}>SAFARI GRILL &amp; LOUNGE</b>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>KITCHEN ORDER TICKET (KOT)</div>
                <div style={{ fontSize: 12, color: '#475569' }}>
                  {slipOrder.timeStr || fmtTime(slipOrder.t)} · {new Date().toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, fontWeight: 800 }}>
                <span>TICKET #{String(slipOrder.no || slipOrder.id).replace('#', '').padStart(4, '0')}</span>
                <span>{slipOrder.tb || 'DINE IN'}</span>
              </div>

              <div style={{ fontSize: 12, color: '#475569', marginBottom: 12 }}>
                <div>Server: <b>{slipOrder.by || 'Ammie'}</b> · Guests: <b>{slipOrder.guests || 2}</b></div>
                <div>Channel: <b>{slipOrder.orderType || 'Dine In'}</b> · Source: <b>{slipOrder.src || 'POS'}</b></div>
                {slipOrder.cust && <div>Customer: <b>{slipOrder.cust}</b></div>}
              </div>

              {slipOrder.note && (
                <div style={{ padding: '6px 10px', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 12 }}>
                  SPECIAL NOTE: {slipOrder.note}
                </div>
              )}

              <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '8px 0', margin: '8px 0' }}>
                {(slipOrder.it || []).map((line, idx) => {
                  const m = M[line.id] || { n: `Item #${line.id}` };
                  return (
                    <div key={idx} style={{ padding: '4px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}>
                        <span>{line.q}x  {m.n}</span>
                        <span>{m.station || 'Line'}</span>
                      </div>
                      {line.sub && <div style={{ fontSize: 12, color: '#475569', paddingLeft: 22 }}>↳ {line.sub}</div>}
                      {line.mods && line.mods.length > 0 && (
                        <div style={{ fontSize: 12, color: '#475569', paddingLeft: 22 }}>
                          ↳ {line.mods.join(', ')}
                        </div>
                      )}
                      {line.note && (
                        <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 700, paddingLeft: 22 }}>
                          * {line.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: 'center', fontSize: 11, color: '#64748B', marginTop: 12 }}>
                *** END OF KITCHEN ORDER ***
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn o sm"
                style={{ background: '#0E5A47', flex: 1 }}
                onClick={() => { window.print(); setSlipOrder(null); }}
              >
                🖨️ Print Kitchen Slip
              </button>
              <button className="btn sm ghost" style={{ flex: 1 }} onClick={() => setSlipOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {/* Dedicated All-Day Kitchen Station Prep & Batch Cooking Modal */}
      {showSummaryModal && (
        <Sheet
          title="👨‍🍳 Kitchen Station Prep & Batch Cooking Summary"
          onClose={() => setShowSummaryModal(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '78vh', overflowY: 'auto', paddingRight: 2 }}>
            {/* Header KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'block' }}>Total Portions</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#15803D' }}>
                  {cookingSummary.reduce((acc, i) => acc + (i.totalQty || i.qty || 1), 0)}
                </span>
                <small style={{ color: '#166534', display: 'block' }}>Across all active orders</small>
              </div>

              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', display: 'block' }}>Unique Dishes</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#1D4ED8' }}>
                  {cookingSummary.length}
                </span>
                <small style={{ color: '#1E40AF', display: 'block' }}>To fire in batches</small>
              </div>

              <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#9A3412', textTransform: 'uppercase', display: 'block' }}>Active Tickets</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#C2410C' }}>
                  {orders.filter(o => ['placed', 'accepted', 'preparing'].includes(o.st)).length}
                </span>
                <small style={{ color: '#9A3412', display: 'block' }}>Waiting & Cooking</small>
              </div>
            </div>

            {/* Station Filter Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { id: 'all', label: `All Stations (${cookingSummary.length})`, icon: '🍽️' },
                { id: 'grill', label: 'Grill & Fryer', icon: '🔥' },
                { id: 'pizza', label: 'Pizza & Oven', icon: '🍕' },
                { id: 'salad', label: 'Salads & Cold', icon: '🥗' },
                { id: 'bar', label: 'Bar & Drinks', icon: '🍹' },
                { id: 'dessert', label: 'Pastry & Dessert', icon: '🍰' }
              ].map(stn => {
                const count = stn.id === 'all'
                  ? cookingSummary.length
                  : cookingSummary.filter(i => {
                      if (stn.id === 'grill') return i.station === 'grill' || i.station === 'fry' || i.cat === 'Grills' || i.cat === 'Burgers' || i.cat === 'Snacks';
                      if (stn.id === 'pizza') return i.station === 'pizza' || i.cat === 'Pizza';
                      if (stn.id === 'salad') return i.station === 'salad' || i.cat === 'Salads';
                      if (stn.id === 'bar') return i.station === 'bar' || i.cat === 'Drinks';
                      if (stn.id === 'dessert') return i.station === 'dessert' || i.cat === 'Desserts';
                      return false;
                    }).length;

                return (
                  <button
                    key={stn.id}
                    onClick={() => setSummaryStationFilter(stn.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 99,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12.5,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      background: summaryStationFilter === stn.id ? '#0E5A47' : '#F1F5F9',
                      color: summaryStationFilter === stn.id ? '#fff' : '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{stn.icon}</span>
                    <span>{stn.label}</span>
                    <span style={{
                      background: summaryStationFilter === stn.id ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                      padding: '1px 6px',
                      borderRadius: 99,
                      fontSize: 11
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Aggregated Dishes List */}
            {cookingSummary.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', background: '#F8FAFC', borderRadius: 12 }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>✅</span>
                <b>No Active Dishes In Kitchen Queue</b>
                <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
                  All orders have been prepared and served. Incoming orders will automatically aggregate here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cookingSummary
                  .filter(item => {
                    if (summaryStationFilter === 'all') return true;
                    if (summaryStationFilter === 'grill') return item.station === 'grill' || item.station === 'fry' || item.cat === 'Grills' || item.cat === 'Burgers' || item.cat === 'Snacks';
                    if (summaryStationFilter === 'pizza') return item.station === 'pizza' || item.cat === 'Pizza';
                    if (summaryStationFilter === 'salad') return item.station === 'salad' || item.cat === 'Salads';
                    if (summaryStationFilter === 'bar') return item.station === 'bar' || item.cat === 'Drinks';
                    if (summaryStationFilter === 'dessert') return item.station === 'dessert' || item.cat === 'Desserts';
                    return true;
                  })
                  .map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: 12,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: '#F1F5F9',
                          fontSize: 20
                        }}>
                          {item.emoji}
                        </span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>
                            {item.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: '#F1F5F9',
                              color: '#475569',
                              padding: '1px 6px',
                              borderRadius: 4
                            }}>
                              {item.cat} · {item.station}
                            </span>
                            <span style={{ fontSize: 11, color: '#64748B' }}>
                              ⏱️ ~{item.prepTime}m prep
                            </span>
                            {item.orderRefs && item.orderRefs.length > 0 && (
                              <span style={{ fontSize: 11, color: '#0E5A47', fontWeight: 600 }}>
                                {item.orderRefs.slice(0, 3).join(', ')}{item.orderRefs.length > 3 ? ` +${item.orderRefs.length - 3} more` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-block',
                            background: '#DCFCE7',
                            color: '#15803D',
                            fontSize: 18,
                            fontWeight: 900,
                            padding: '3px 12px',
                            borderRadius: 8,
                            border: '1px solid #86EFAC'
                          }}>
                            {item.totalQty || item.qty}x
                          </span>
                          <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                            {item.cookingQty || 0} cooking · {item.waitingQty || 0} waiting
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                className="btn o sm"
                style={{ background: '#0E5A47', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => {
                  setPrintSummaryModal(true);
                }}
              >
                <span>🖨️</span>
                <span>Print Kitchen Batch Ticket</span>
              </button>
              <button
                className="btn sm ghost"
                style={{ flex: 1 }}
                onClick={() => setShowSummaryModal(false)}
              >
                Close Summary
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {/* Print Aggregated Kitchen Prep Sheet Modal */}
      {printSummaryModal && (
        <Sheet t="Print Station Aggregated Prep Summary" c={() => setPrintSummaryModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="receipt-paper" style={{ padding: 18 }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--line)', paddingBottom: 10, marginBottom: 10 }}>
                <b style={{ fontSize: 18 }}>SAFARI GRILL & LOUNGE</b>
                <div style={{ fontSize: 12, color: 'var(--mut)' }}>Kitchen Display System · Station Prep Summary</div>
                <div style={{ fontSize: 12, color: 'var(--mut)' }}>Timestamp: {new Date().toLocaleString()}</div>
              </div>

              <b style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--mut)' }}>Active Queue Ingredients:</b>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cookingSummary.map((item, idx) => (
                  <div key={idx} className="row" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 4 }}>
                    <span>{item.name}</span>
                    <b style={{ color: '#16A34A' }}>{item.qty}x</b>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn o sm"
                style={{ background: '#0E5A47' }}
                onClick={() => {
                  window.print();
                  setPrintSummaryModal(false);
                }}
              >
                🖨️ Send to Kitchen Receipt Printer
              </button>
              <button className="btn sm ghost" onClick={() => setPrintSummaryModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {/* Add Fast Order Modal */}
      {newOrderModal && (
        <Sheet t="Add Quick Kitchen Demo Order" c={() => setNewOrderModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Order Channel</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {['Dine In', 'Takeaway', 'Pickup', 'Delivery'].map(ch => (
                  <button
                    key={ch}
                    className={`btn sm ${quickOrderChannel === ch ? 'o' : 'ghost'}`}
                    style={{ flex: 1, padding: '7px 4px', fontSize: 12 }}
                    onClick={() => setQuickOrderChannel(ch)}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="row">
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Table / Location</label>
                <input
                  className="inp"
                  value={quickOrderTable}
                  onChange={e => setQuickOrderTable(e.target.value)}
                />
              </div>
              <div style={{ width: 100 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>Guests</label>
                <input
                  className="inp"
                  type="number"
                  value={quickOrderGuests}
                  onChange={e => setQuickOrderGuests(+e.target.value || 1)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Dishes included in ticket:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                {quickOrderItems.map((it, idx) => (
                  <div key={idx} className="row" style={{ fontSize: 13 }}>
                    <span>{it.q}x {M[it.id]?.n || `Item ${it.id}`}</span>
                    <span style={{ color: 'var(--mut)' }}>{fmt(M[it.id]?.p || 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn o" style={{ background: '#FF6B2C', marginTop: 10 }} onClick={handleCreateFastOrder}>
              + Create & Push to Kitchen
            </button>
          </div>
        </Sheet>
      )}

      {/* Waste Logging Modal */}
      {wasteModal && (
        <Sheet t="Log Kitchen Spoilage / Waste" c={() => setWasteModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Stock Item</label>
              <select
                className="inp"
                value={selectedStockId}
                onChange={e => setSelectedStockId(e.target.value)}
              >
                {(S.stock || []).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.onHand} {s.uom} on hand)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Quantity Spoiled</label>
              <input
                className="inp"
                type="number"
                step="0.1"
                value={wasteQty}
                onChange={e => setWasteQty(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Reason</label>
              <select
                className="inp"
                value={wasteReason}
                onChange={e => setWasteReason(e.target.value)}
              >
                <option value="Overcooked on grill">Overcooked on grill</option>
                <option value="Customer returned dish">Customer returned dish</option>
                <option value="Expired past shelf life">Expired past shelf life</option>
                <option value="Dropped / prep contamination">Dropped / prep contamination</option>
              </select>
            </div>

            <button className="btn o" style={{ background: '#FF3B30' }} onClick={handleLogWaste}>
              Confirm Waste Entry
            </button>
          </div>
        </Sheet>
      )}

      {/* History Drawer */}
      {historyDrawer && (
        <Sheet t="Today's Completed Kitchen Tickets" c={() => setHistoryDrawer(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                {allHistoryOrders.length} completed &amp; tracked orders
              </span>
              <button
                className="btn sm"
                style={{ background: '#0D9488', color: '#fff', fontSize: 12, padding: '5px 10px' }}
                onClick={() => {
                  setActiveTab('history');
                  setHistoryDrawer(false);
                }}
              >
                📊 Open Full Audit &amp; Analytics
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
              {allHistoryOrders.map(o => (
                <div key={o.id} className="card row" style={{ padding: 12 }}>
                  <div>
                    <b>#{String(o.no || o.id).replace('#', '')} · {o.orderType || 'Dine In'}</b>
                    <div style={{ fontSize: 12, color: 'var(--mut)' }}>
                      {fmtTime(o.t)} · Server: {o.by || 'Ammie'} · {o.tb}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn sm ghost"
                      onClick={() => {
                        handleReopen(o.id);
                        setHistoryDrawer(false);
                      }}
                    >
                      Recall
                    </button>
                    <button
                      className="btn sm ghost"
                      onClick={() => {
                        setInfoOrder(o);
                        setHistoryDrawer(false);
                      }}
                    >
                      Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Sheet>
      )}

      {/* Role & Site Switcher Sheet */}
      {showRoleModal && (
        <Sheet t="RestoERP Workspace & Role Switcher" c={() => setShowRoleModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--mut)' }}>Current Station & User</div>
              <b style={{ fontSize: 16, color: '#0F172A' }}>{sess?.name || 'Chef Ammie'} · {sess?.r?.toUpperCase() || 'CHEF'}</b>
              <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: 2 }}>Branch: Safari Grill &amp; Lounge (Downtown Flagship)</div>
            </div>

            <div>
              <b style={{ fontSize: 14 }}>Switch ERP Role / Viewport:</b>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 8 }}>
                {[
                  { r: 'chef', icon: '👨‍🍳', label: 'Kitchen (KDS)', desc: 'Expo & Line Prep' },
                  { r: 'cashier', icon: '💳', label: 'Cashier (POS)', desc: 'Billing & Payments' },
                  { r: 'waiter', icon: '🧑‍🍳', label: 'Waiters', desc: 'Floor Tables & Orders' },
                  { r: 'storekeeper', icon: '📦', label: 'Inventory', desc: 'Stock & Batches' },
                  { r: 'manager', icon: '👔', label: 'Manager', desc: 'P&L, Reports & Staff' },
                  { r: 'customer', icon: '🍽️', label: 'Customer Menu', desc: 'Guest Dine-In Ordering' }
                ].map(item => (
                  <button
                    key={item.r}
                    className="card"
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      border: sess?.r === item.r ? '2px solid #0E5A47' : '1px solid var(--line)',
                      background: sess?.r === item.r ? '#E5F2EE' : 'var(--card)',
                      textAlign: 'left'
                    }}
                    onClick={() => {
                      setShowRoleModal(false);
                      if (setSess && USERS[item.r]) setSess(USERS[item.r]);
                      if (setV) setV(item.r);
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div>
                      <b style={{ fontSize: 13, display: 'block' }}>{item.label}</b>
                      <small style={{ fontSize: 11, color: 'var(--mut)' }}>{item.desc}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                className="btn o sm"
                style={{ background: '#EF4444', flex: 1 }}
                onClick={() => {
                  setShowRoleModal(false);
                  out && out();
                }}
              >
                Sign Out / Exit
              </button>
              <button className="btn sm ghost" style={{ flex: 1 }} onClick={() => setShowRoleModal(false)}>
                Stay on KDS
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {/* Kitchen Quick Add Menu Item Modal */}
      <QuickAddMenuItemModal
        isOpen={quickAddModal}
        onClose={() => setQuickAddModal(false)}
        onSave={item => A.quickAddMenuItem(item, sess?.name || 'Chef Expo')}
        actor={sess?.name || 'Chef Expo'}
      />
    </div>
  );
}

import React, { useState, useContext, useMemo } from 'react';
import { fmt, fmtTime, tot, SEATS, TABLES, TW } from '../data';
import { Ctx } from '../store';
import { Pill } from './ui';

export function TableSlideSelector({
  isOpen,
  onClose,
  selectedTable,
  onSelectTable,
  guestCount = 2,
  onChangeGuests = null,
  orderType = 'dine_in',
  onChangeOrderType = null
}) {
  const { S, wn } = useContext(Ctx);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'occupied', 'takeaway'
  const [search, setSearch] = useState('');
  const [warnMsg, setWarnMsg] = useState('');

  const orders = S.orders || [];

  // Helper to get active orders for any table
  const getTableOrders = t => {
    return orders.filter(o => o.tb === t && !['paid', 'closed', 'cancelled'].includes(o.st));
  };

  // Compute table statistics
  const dineTables = TABLES.filter(t => t !== 'Takeaway' && t !== 'Online');
  const tableStats = useMemo(() => {
    let availableCount = 0;
    let occupiedCount = 0;
    let totalDiners = 0;
    let totalActiveRevenue = 0;

    dineTables.forEach(t => {
      const active = getTableOrders(t);
      if (active.length > 0) {
        occupiedCount++;
        totalDiners += active[0].guests || SEATS[t] || 2;
        totalActiveRevenue += active.reduce((acc, o) => acc + tot(o), 0);
      } else {
        availableCount++;
      }
    });

    return { availableCount, occupiedCount, totalDiners, totalActiveRevenue };
  }, [orders, dineTables]);

  if (!isOpen) return null;

  const handleTableClick = (t, isOccupied, activeOrder) => {
    if (isOccupied) {
      setWarnMsg(`⚠️ Table ${t} is currently OCCUPIED by ${activeOrder?.by || 'Guests'} (Order ${activeOrder?.no || ''}). Normal restaurant operations require settling or transferring the active bill before seating new guests.`);
      setTimeout(() => setWarnMsg(''), 5000);
      return;
    }

    setWarnMsg('');
    const cap = SEATS[t] || 4;
    onSelectTable(t, cap);
    if (onChangeOrderType) onChangeOrderType('dine_in');
    if (onChangeGuests && guestCount > cap) {
      onChangeGuests(cap);
    }
  };

  const handleTakeawayClick = () => {
    setWarnMsg('');
    onSelectTable('Takeaway', 0);
    if (onChangeOrderType) onChangeOrderType('takeaway');
    if (onChangeGuests) onChangeGuests(1);
  };

  const handleOnlineClick = () => {
    setWarnMsg('');
    onSelectTable('Online', 0);
    if (onChangeOrderType) onChangeOrderType('online');
    if (onChangeGuests) onChangeGuests(1);
  };

  // Filtered table list
  const filteredTables = dineTables.filter(t => {
    const active = getTableOrders(t);
    const isOccupied = active.length > 0;

    if (filter === 'available' && isOccupied) return false;
    if (filter === 'occupied' && !isOccupied) return false;
    if (filter === 'takeaway') return false;

    if (search) {
      const q = search.toLowerCase();
      const matchName = t.toLowerCase().includes(q);
      const matchWaiter = (wn(TW[t]) || '').toLowerCase().includes(q);
      const matchGuest = isOccupied && (active[0].by || '').toLowerCase().includes(q);
      if (!matchName && !matchWaiter && !matchGuest) return false;
    }

    return true;
  });

  const selectedTableCap = SEATS[selectedTable] || 4;
  const isSelectedTableOccupied = dineTables.includes(selectedTable) && getTableOrders(selectedTable).length > 0;

  return (
    <div className="table-slide-overlay" onClick={onClose}>
      <div className="table-slide-drawer" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🪑</span>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
                Table Seating & Floor Selection
              </h3>
            </div>
            <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>
              Safari Grill & Lounge · Live Floor Operations
            </small>
          </div>

          <button
            onClick={onClose}
            aria-label="Close table selector"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--tx)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div style={{
          padding: '10px 18px',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--line)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          flexShrink: 0
        }}>
          <div style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 12, textAlign: 'center', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>Available</span>
            <b style={{ display: 'block', fontSize: 16, color: '#16a34a' }}>{tableStats.availableCount}</b>
          </div>
          <div style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 12, textAlign: 'center', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>Occupied</span>
            <b style={{ display: 'block', fontSize: 16, color: '#ef4444' }}>{tableStats.occupiedCount}</b>
          </div>
          <div style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 12, textAlign: 'center', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>Diners Seated</span>
            <b style={{ display: 'block', fontSize: 16, color: 'var(--tx)' }}>{tableStats.totalDiners}</b>
          </div>
          <div style={{ background: 'var(--card)', padding: '8px 10px', borderRadius: 12, textAlign: 'center', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11, color: 'var(--mut)', fontWeight: 600 }}>Floor Active</span>
            <b style={{ display: 'block', fontSize: 14, color: '#0E5A47', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fmt(tableStats.totalActiveRevenue)}
            </b>
          </div>
        </div>

        {/* Search & Quick Filter Pills */}
        <div style={{ padding: '12px 18px 8px', background: 'var(--card)', flexShrink: 0 }}>
          <div className="search" style={{ background: 'var(--bg)', border: '1px solid var(--line)', padding: '7px 12px', borderRadius: 12, marginBottom: 10 }}>
            <span>🔍</span>
            <input
              placeholder="Search table number (T1, T4) or waiter..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 13.5 }}
            />
            {search && <button onClick={() => setSearch('')} style={{ color: 'var(--mut)' }}>✕</button>}
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              ['all', `All Tables (${dineTables.length})`],
              ['available', `🟢 Available (${tableStats.availableCount})`],
              ['occupied', `🔴 Occupied (${tableStats.occupiedCount})`],
              ['takeaway', '🛵 Counter & Online']
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: filter === k ? '1.5px solid #FF5A43' : '1px solid var(--line)',
                  background: filter === k ? '#FF5A43' : 'var(--bg)',
                  color: filter === k ? '#fff' : 'var(--tx)',
                  transition: 'all 0.15s ease'
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Warning Banner when user tries to pick an occupied table */}
        {warnMsg && (
          <div style={{
            margin: '0 18px 10px',
            padding: '10px 14px',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 12,
            color: '#B91C1C',
            fontSize: 12.5,
            lineHeight: 1.4,
            animation: 'fadeIn 0.2s ease',
            flexShrink: 0
          }}>
            {warnMsg}
          </div>
        )}

        {/* Scrollable Table List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Quick Alternative Channels (Takeaway & Online) */}
          {(filter === 'all' || filter === 'takeaway') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
              {/* Takeaway Card */}
              <div
                onClick={handleTakeawayClick}
                className={`table-card-item available ${selectedTable === 'Takeaway' ? 'selected' : ''}`}
                style={{ padding: '12px 14px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <b style={{ fontSize: 15 }}>🛵 Takeaway Counter</b>
                  {selectedTable === 'Takeaway' && <span style={{ color: '#15803D', fontWeight: 800 }}>✓ Selected</span>}
                </div>
                <small style={{ color: 'var(--mut)', display: 'block', fontSize: 11.5 }}>
                  Walk-in pickup / Bar counter (No table seating)
                </small>
                <div style={{ marginTop: 8, display: 'inline-block', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                  Always Available
                </div>
              </div>

              {/* Online Delivery Card */}
              <div
                onClick={handleOnlineClick}
                className={`table-card-item available ${selectedTable === 'Online' ? 'selected' : ''}`}
                style={{ padding: '12px 14px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <b style={{ fontSize: 15 }}>📱 Online Delivery</b>
                  {selectedTable === 'Online' && <span style={{ color: '#15803D', fontWeight: 800 }}>✓ Selected</span>}
                </div>
                <small style={{ color: 'var(--mut)', display: 'block', fontSize: 11.5 }}>
                  Remote customer app / Dispatch rider
                </small>
                <div style={{ marginTop: 8, display: 'inline-block', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                  Remote Channel
                </div>
              </div>
            </div>
          )}

          {/* Dine-In Physical Tables */}
          {filter !== 'takeaway' && filteredTables.map(t => {
            const active = getTableOrders(t);
            const isOccupied = active.length > 0;
            const cap = SEATS[t] || 4;
            const waiterName = wn(TW[t]) || 'Staff';
            const isSelected = selectedTable === t;
            const activeOrder = active[0];
            const runningTotal = active.reduce((acc, o) => acc + tot(o), 0);
            const elapsedMins = activeOrder ? Math.max(1, Math.round((Date.now() - activeOrder.t) / 60000)) : 0;

            const zoneName = ['T1', 'T2', 'T3'].includes(t) ? 'Indoor Main Hall' : 'Garden Terrace & VIP';

            return (
              <div
                key={t}
                onClick={() => handleTableClick(t, isOccupied, activeOrder)}
                className={`table-card-item ${isOccupied ? 'occupied' : 'available'} ${isSelected ? 'selected' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)' }}>
                        Table {t}
                      </span>
                      <span style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 99,
                        fontWeight: 700,
                        background: isOccupied ? '#FEE2E2' : '#DCFCE7',
                        color: isOccupied ? '#DC2626' : '#166534'
                      }}>
                        {isOccupied ? '🔴 OCCUPIED' : '🟢 AVAILABLE'}
                      </span>
                    </div>
                    <small style={{ color: 'var(--mut)', display: 'block', marginTop: 2 }}>
                      {zoneName} · Capacity: <b>{cap} Guests</b> · Waiter: {waiterName}
                    </small>
                  </div>

                  {isSelected && (
                    <span style={{
                      background: '#15803D',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 8
                    }}>
                      ✓ SELECTED
                    </span>
                  )}
                </div>

                {/* Table details depending on state */}
                {isOccupied ? (
                  <div style={{
                    marginTop: 8,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#B91C1C' }}>
                      <span>Seated: {activeOrder?.by || 'Guests'} ({activeOrder?.guests || cap} covers)</span>
                      <span>{fmt(runningTotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--mut)', marginTop: 3 }}>
                      <span>Ticket {activeOrder?.no || ''} · <Pill st={activeOrder?.st || 'preparing'} /></span>
                      <span>⏱ Seated {elapsedMins} min ago</span>
                    </div>
                    <div style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: '#DC2626',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <span>🔒</span>
                      <span>Cannot select: Table is currently in active service</span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    marginTop: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#166534'
                  }}>
                    <span>✓ Vacant & Sanitized · Ready for immediate seating</span>
                    <button
                      type="button"
                      style={{
                        background: isSelected ? '#15803D' : '#FF5A43',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? '✓ In Use' : 'Select Table ➔'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {!filteredTables.length && filter !== 'takeaway' && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--mut)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <p style={{ fontWeight: 700, margin: 0 }}>No tables found matching your filter</p>
              <small>Try choosing "All Tables" or clear your search term.</small>
            </div>
          )}
        </div>

        {/* Drawer Bottom Action Bar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--line)',
          background: 'var(--card)',
          flexShrink: 0
        }}>
          {/* Guest Count Stepper if Dine-in Table */}
          {selectedTable !== 'Takeaway' && selectedTable !== 'Online' && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              padding: '8px 12px',
              borderRadius: 12,
              background: 'var(--bg)',
              border: '1px solid var(--line)'
            }}>
              <div>
                <b style={{ fontSize: 13, display: 'block' }}>Party Size / Seated Diners:</b>
                <small style={{ color: 'var(--mut)' }}>
                  Table {selectedTable} fits up to {selectedTableCap} guests
                </small>
              </div>

              {onChangeGuests && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className="pos-stepper-btn"
                    onClick={() => onChangeGuests(Math.max(1, guestCount - 1))}
                  >
                    −
                  </button>
                  <span style={{ fontWeight: 800, fontSize: 15, minWidth: 24, textAlign: 'center' }}>
                    {guestCount}
                  </span>
                  <button
                    className="pos-stepper-btn"
                    onClick={() => {
                      if (guestCount < selectedTableCap) {
                        onChangeGuests(guestCount + 1);
                      } else {
                        setWarnMsg(`Note: Table ${selectedTable} has a standard capacity of ${selectedTableCap} seats. You can still seat extra guests if chairs are added.`);
                        onChangeGuests(guestCount + 1);
                        setTimeout(() => setWarnMsg(''), 4000);
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn ghost sm"
              style={{ flex: 1, padding: '12px 14px' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn o sm"
              disabled={isSelectedTableOccupied}
              style={{
                flex: 2,
                background: isSelectedTableOccupied ? '#8E8E93' : '#FF5A43',
                padding: '12px 14px',
                fontSize: 14,
                fontWeight: 800
              }}
              onClick={() => {
                if (isSelectedTableOccupied) {
                  setWarnMsg(`Cannot confirm: Table ${selectedTable} is occupied.`);
                  return;
                }
                onClose();
              }}
            >
              ✓ Confirm {selectedTable} Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

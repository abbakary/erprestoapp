import React, { useState, useContext, useRef } from 'react';
import { M, fmt, tot, calcNet, calcTax } from '../data';
import { Ctx } from '../store';
import { Sheet } from './ui';

export function ReceiptModal({ o, close, initialTab = 'customer', userRole = 'cashier' }) {
  const { S, A, wn } = useContext(Ctx);
  const [tab, setTab] = useState(initialTab);
  const [copied, setCopied] = useState(false);
  const [couponCode, setCouponCode] = useState(o?.couponCode || 'SAFARI10');
  const [appliedDiscount, setAppliedDiscount] = useState(o?.discountPct || 0);
  const [tenderAmount, setTenderAmount] = useState('');
  const receiptRef = useRef(null);

  if (!o) return null;

  // Active site details
  const site = S?.sites?.find(s => s.id === (S.siteId || 'masaki')) || {
    name: 'Safari Grill & Lounge Ltd',
    address: 'Plot 42, Haile Selassie Rd, Masaki, Dar es Salaam',
    phone: '+255 784 112 334 / +255 22 260 1234',
    tin: '104824986',
    vrn: '40012984-Z',
    efdSerial: 'TZ01004829'
  };

  const rawGross = tot(o);
  const discountPct = appliedDiscount || o.discountPct || 0;
  const discountAmt = o.discountAmt || (discountPct ? Math.round(rawGross * (discountPct / 100)) : 0);
  const payableGross = Math.max(0, rawGross - discountAmt);
  const netTaxable = calcNet(payableGross);
  const vatTax = calcTax(payableGross);

  // Formatted receipt sequence number (6 digits, matching user's image format "Safari Grill & Lounge Ltd - 000012")
  const receiptSequence = String(o.id || o.no || '12').replace(/\D/g, '').padStart(6, '0').slice(-6) || '000012';
  const receiptNumberStr = `${site.name.replace(' Ltd', '')} - ${receiptSequence}`;

  // Formatted ISO Datetime with East Africa Timezone (+03:00) matching user screenshot
  const orderDate = new Date(o.t || o.created_at || Date.now());
  const isoTimeWithTz = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}T${String(orderDate.getHours()).padStart(2, '0')}:${String(orderDate.getMinutes()).padStart(2, '0')}:${String(orderDate.getSeconds()).padStart(2, '0')}.000+03:00`;

  // Change calculation for Cashier
  const numTender = parseFloat(tenderAmount) || (o.paid ? payableGross : 0);
  const changeDue = Math.max(0, numTender - payableGross);

  // Print thermal slip
  const handlePrint = () => {
    window.print();
  };

  // Copy plain text receipt
  const handleCopyText = () => {
    const textLines = [
      `==========================================`,
      `          SAFARI GRILL & LOUNGE LTD       `,
      `    Plot 42, Haile Selassie Rd, Masaki    `,
      `   MOBILE: +255 784 112 334 / +255 22 260 1234`,
      `             TIN: 104824986               `,
      `------------------------------------------`,
      `RECEIPT NO: ${receiptNumberStr}`,
      `DATETIME: ${isoTimeWithTz}`,
      `TABLE: ${o.tb} | WAITER: ${wn ? wn(o.wid) : (o.wid || 'Server')}`,
      `------------------------------------------`,
      `Item                        Qty     Amount`,
      `------------------------------------------`,
      ...(o.it || []).map(l => {
        const itemObj = M[l.id] || { n: `Item #${l.id}`, p: l.p || 0 };
        const name = (itemObj.n || '').toUpperCase();
        const amtStr = `${fmtNum(itemObj.p * l.q)}.00 TSh`;
        return `${name.padEnd(25).slice(0, 25)} ${String(l.q).padStart(3)} ${amtStr.padStart(12)}`;
      }),
      `==========================================`,
      discountAmt > 0 ? `DISCOUNT (${discountPct}%):        -${fmtNum(discountAmt)}.00 TSh` : null,
      `TOTAL:                     ${fmtNum(payableGross)}.00 TSh`,
      `------------------------------------------`,
      `NET TAXABLE (EXCL. VAT):   ${fmtNum(netTaxable)}.00 TSh`,
      `VAT 18% (INCLUSIVE):       ${fmtNum(vatTax)}.00 TSh`,
      `PAYMENT METHOD: ${(o.pm || 'CASH').toUpperCase()}`,
      `VERIFICATION REF: ${o.payRef || ('RG' + String(o.id).slice(-6))}`,
      `------------------------------------------`,
      `      Thank You! Please Come Again.       `,
      `  Asante sana! Karibu tena Safari Grill.  `,
      `==========================================`
    ].filter(Boolean).join('\n');

    navigator.clipboard?.writeText(textLines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  // WhatsApp share link
  const whatsappText = encodeURIComponent(
    `*Safari Grill & Lounge - Official Receipt*\n` +
    `Receipt No: ${receiptNumberStr}\n` +
    `Table: ${o.tb} | Time: ${orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
    `Total: ${fmt(payableGross)}\n` +
    `Status: ${o.paid ? 'PAID ✓' : 'UNPAID'}\n` +
    `TIN: 104824986\n` +
    `Karibu tena Safari Grill!`
  );

  return (
    <Sheet title={`Receipt & Order Chit: ${o.no || receiptSequence}`} onClose={close}>
      {/* Role / Format Switcher Tabs */}
      <div className="receipt-tab-bar no-print">
        <button
          type="button"
          className={`receipt-tab-btn ${tab === 'customer' ? 'active' : ''}`}
          onClick={() => setTab('customer')}
        >
          🧾 Customer Slip
        </button>
        <button
          type="button"
          className={`receipt-tab-btn ${tab === 'kot' ? 'active' : ''}`}
          onClick={() => setTab('kot')}
        >
          🎫 Kitchen KOT
        </button>
        <button
          type="button"
          className={`receipt-tab-btn ${tab === 'fiscal' ? 'active' : ''}`}
          onClick={() => setTab('fiscal')}
        >
          🏛️ EFD Fiscal Tax
        </button>
        <button
          type="button"
          className={`receipt-tab-btn ${tab === 'coupon' ? 'active' : ''}`}
          onClick={() => setTab('coupon')}
        >
          🎟️ Promo Voucher
        </button>
      </div>

      {/* Main Print Container */}
      <div className="receipt-modal-content">
        {/* ===================== VIEW 1: CUSTOMER RECEIPT ===================== */}
        {tab === 'customer' && (
          <div className="thermal-receipt-container" ref={receiptRef}>
            {/* Header matching user reference image image_f1eba700.png */}
            <div className="thermal-header">
              <div className="thermal-logo">
                <span className="flame-icon">🔥</span>
                <span className="logo-text">Logo</span>
              </div>
              <h2 className="thermal-business-name">Safari Grill & Lounge Ltd</h2>
              <div className="thermal-sub-meta">Masaki Peninsula, Dar es Salaam</div>
              <div className="thermal-sub-meta">MOBILE: +255 784 112 334 / +255 22 260 1234</div>
              <div className="thermal-tin-line">TIN: 104824986</div>
            </div>

            <div className="thermal-dash-line">--------------------------------------------------</div>

            <div className="thermal-meta-block">
              <div className="thermal-meta-row">
                <span className="thermal-meta-label">RECEIPT NO:</span>
                <span className="thermal-meta-val bold">{receiptNumberStr}</span>
              </div>
              <div className="thermal-meta-row">
                <span className="thermal-meta-label">DATETIME:</span>
                <span className="thermal-meta-val">{isoTimeWithTz}</span>
              </div>
              <div className="thermal-meta-row" style={{ marginTop: 2, fontSize: 12 }}>
                <span>TABLE: <b>{o.tb}</b></span>
                <span>SERVER: <b>{wn ? wn(o.wid) : (o.wid || 'Floor Server')}</b></span>
              </div>
            </div>

            <div className="thermal-dash-line">--------------------------------------------------</div>

            {/* Table Columns matching image */}
            <table className="thermal-items-table">
              <thead>
                <tr>
                  <th className="col-item">Item</th>
                  <th className="col-qty">Qty</th>
                  <th className="col-amt">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(o.it || []).map((l, idx) => {
                  const item = M[l.id] || { n: `Item #${l.id}`, p: l.p || 0 };
                  const lineTotal = item.p * l.q;
                  return (
                    <tr key={idx}>
                      <td className="col-item">
                        <div className="thermal-item-name">{(item.n || '').toUpperCase()}</div>
                        {l.note && <div className="thermal-item-note">Note: {l.note}</div>}
                      </td>
                      <td className="col-qty">{l.q}</td>
                      <td className="col-amt">{fmtNum(lineTotal)}.00 TSh</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Discount if present */}
            {discountAmt > 0 && (
              <div className="thermal-discount-row">
                <span>DISCOUNT ({discountPct}% VOUCHER):</span>
                <span>-{fmtNum(discountAmt)}.00 TSh</span>
              </div>
            )}

            {/* Solid thick black divider line matching image */}
            <div className="thermal-total-divider" />

            {/* Bold Total Line matching image */}
            <div className="thermal-total-row">
              <span className="thermal-total-label">TOTAL:</span>
              <span className="thermal-total-amount">{fmtNum(payableGross)}.00 TSh</span>
            </div>

            {/* Fiscal & Tax Summary */}
            <div className="thermal-tax-details">
              <div className="thermal-tax-row">
                <span>NET TAXABLE (EXCL. VAT):</span>
                <span>{fmtNum(netTaxable)}.00 TSh</span>
              </div>
              <div className="thermal-tax-row">
                <span>VAT 18% (INCLUSIVE):</span>
                <span>{fmtNum(vatTax)}.00 TSh</span>
              </div>
              <div className="thermal-tax-row">
                <span>PAYMENT METHOD:</span>
                <span><b>{(o.pm || 'CASH').toUpperCase()}</b></span>
              </div>
              {o.payRef && (
                <div className="thermal-tax-row">
                  <span>PAYMENT REF:</span>
                  <span><b>{o.payRef}</b></span>
                </div>
              )}
            </div>

            {/* Centered Footer matching image */}
            <div className="thermal-footer">
              <p className="thermal-thank-you">Thank You! Please Come Again.</p>
              <p className="thermal-swahili-msg">Asante sana! Karibu tena Safari Grill.</p>
            </div>

            {/* Simulation Barcode */}
            <div className="thermal-barcode-box">
              <div className="thermal-barcode-lines">
                ||||| | ||| ||||| || |||||| | ||||| |||| || |||||||| |||| | ||||| |||
              </div>
              <div className="thermal-barcode-number">REF-{o.id}-{receiptSequence}</div>
            </div>

            {/* Tear-Off Customer Coupon Voucher */}
            <div className="thermal-perforation">
              <span className="perforation-text">- - - - - - - - - - - - - ✂ TEAR HERE ✂ - - - - - - - - - - - - -</span>
            </div>

            <div className="thermal-coupon-tearoff">
              <div className="coupon-tearoff-header">
                <span className="coupon-badge">★ DINER REWARD VOUCHER ★</span>
                <div className="coupon-headline">GET 10% OFF YOUR NEXT VISIT</div>
                <div className="coupon-sub">Present this coupon at Masaki, Oysterbay or City Centre</div>
              </div>

              <div className="coupon-code-box">
                <span className="coupon-label">PROMO CODE:</span>
                <span className="coupon-code-text">{couponCode}</span>
              </div>

              <div className="coupon-expiry">
                Valid for 30 days from issuance · Min spend TSh 20,000
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW 2: KITCHEN ORDER TICKET (KOT / CHIT) ===================== */}
        {tab === 'kot' && (
          <div className="thermal-receipt-container kot-ticket" ref={receiptRef}>
            <div className="kot-header">
              <div className="kot-badge">*** KITCHEN ORDER TICKET (KOT) ***</div>
              <div className="kot-table-giant">TABLE {o.tb}</div>
              <div className="kot-type-tag">{o.tb === 'Takeaway' ? '🛍️ TAKEAWAY PASS' : '🍽️ DINE-IN SERVICE'}</div>
            </div>

            <div className="thermal-dash-line">--------------------------------------------------</div>

            <div className="kot-meta-grid">
              <div><b>TICKET #:</b> {o.no || `#${o.id}`}</div>
              <div><b>SERVER:</b> {wn ? wn(o.wid) : (o.wid || 'Floor Staff')}</div>
              <div><b>TIME:</b> {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div><b>STATUS:</b> <span className="kot-status-badge">{o.st?.toUpperCase()}</span></div>
            </div>

            <div className="thermal-dash-line">--------------------------------------------------</div>

            <div className="kot-items-list">
              {(o.it || []).map((l, idx) => {
                const item = M[l.id] || { n: `Item #${l.id}`, c: 'Grills', station: 'grill' };
                return (
                  <div key={idx} className="kot-item-row">
                    <div className="kot-item-check">[ ]</div>
                    <div className="kot-item-details">
                      <div className="kot-item-title">
                        <span className="kot-qty">{l.q}x</span>
                        <span className="kot-name">{(item.n || '').toUpperCase()}</span>
                      </div>
                      <div className="kot-station-tag">Pass: {(item.station || item.c || 'Kitchen').toUpperCase()}</div>
                      {l.note && (
                        <div className="kot-special-note">
                          ⚠️ NOTE: <b>{l.note}</b>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="thermal-dash-line">--------------------------------------------------</div>

            <div className="kot-footer-boxes">
              <div className="kot-sign-box">
                <small>Cooked By (Chef):</small>
                <div className="kot-line" />
              </div>
              <div className="kot-sign-box">
                <small>Dispatched (Pass Runner):</small>
                <div className="kot-line" />
              </div>
            </div>

            <div className="kot-timer-note">
              Order placed: {orderDate.toLocaleTimeString()} · Priority: {o.st === 'billreq' ? 'RUSH' : 'STANDARD'}
            </div>
          </div>
        )}

        {/* ===================== VIEW 3: CASHIER EFD FISCAL TAX SLIP ===================== */}
        {tab === 'fiscal' && (
          <div className="thermal-receipt-container fiscal-tax-slip" ref={receiptRef}>
            <div className="fiscal-header">
              <div className="tra-header-badge">TANZANIA REVENUE AUTHORITY (TRA)</div>
              <div className="tra-vfd-title">ELECTRONIC FISCAL RECEIPT (VFD)</div>
              <div className="thermal-business-name">SAFARI GRILL & LOUNGE LTD</div>
              <div className="thermal-sub-meta">PLOT 42, HAILE SELASSIE RD, MASAKI</div>
              <div className="thermal-sub-meta">DAR ES SALAAM, TANZANIA</div>
              <div className="fiscal-reg-block">
                <div><b>TIN:</b> 104824986</div>
                <div><b>VRN:</b> 40012984-Z</div>
                <div><b>SERIAL NO:</b> TZ01004829</div>
                <div><b>UIN:</b> 994208492048</div>
              </div>
            </div>

            <div className="thermal-dash-line">==================================================</div>

            <div className="fiscal-meta">
              <div>RECEIPT NUMBER: <b>{receiptNumberStr}</b></div>
              <div>DATE & TIME: <b>{isoTimeWithTz}</b></div>
              <div>OPERATOR: <b>Zawadi Ally (Till #01)</b></div>
              <div>TABLE / POS: <b>{o.tb} (Terminal #01)</b></div>
            </div>

            <div className="thermal-dash-line">--------------------------------------------------</div>

            <table className="thermal-items-table">
              <thead>
                <tr>
                  <th className="col-item">DESCRIPTION</th>
                  <th className="col-qty">QTY</th>
                  <th className="col-amt">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {(o.it || []).map((l, idx) => {
                  const item = M[l.id] || { n: `Item #${l.id}`, p: l.p || 0 };
                  return (
                    <tr key={idx}>
                      <td className="col-item">{(item.n || '').toUpperCase()}</td>
                      <td className="col-qty">{l.q}</td>
                      <td className="col-amt">{fmtNum(item.p * l.q)}.00 TSh</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {discountAmt > 0 && (
              <div className="thermal-discount-row">
                <span>LESS DISCOUNT ({discountPct}%):</span>
                <span>-{fmtNum(discountAmt)}.00 TSh</span>
              </div>
            )}

            <div className="thermal-total-divider" />

            <div className="thermal-total-row">
              <span className="thermal-total-label">TOTAL TAX INCL.:</span>
              <span className="thermal-total-amount">{fmtNum(payableGross)}.00 TSh</span>
            </div>

            <div className="thermal-tax-details" style={{ margin: '8px 0', borderTop: '1px dashed #000', paddingTop: 6 }}>
              <div className="thermal-tax-row">
                <span>TAX CATEGORY A (18.00%):</span>
                <span>{fmtNum(vatTax)}.00 TSh</span>
              </div>
              <div className="thermal-tax-row">
                <span>NET TURNOVER:</span>
                <span>{fmtNum(netTaxable)}.00 TSh</span>
              </div>
              <div className="thermal-tax-row">
                <span>PAYMENT METHOD:</span>
                <span><b>{(o.pm || 'CASH').toUpperCase()}</b></span>
              </div>
              <div className="thermal-tax-row">
                <span>AMOUNT TENDERED:</span>
                <span><b>{fmtNum(numTender)}.00 TSh</b></span>
              </div>
              <div className="thermal-tax-row">
                <span>CHANGE RETURNED:</span>
                <span><b>{fmtNum(changeDue)}.00 TSh</b></span>
              </div>
            </div>

            {/* Cashier Tender Input Field for interactive change calculation */}
            <div className="cashier-tender-tool no-print">
              <div className="row" style={{ gap: 8, alignItems: 'center', margin: '10px 0 6px' }}>
                <small style={{ fontWeight: 600 }}>Tendered Cash (TSh):</small>
                <input
                  type="number"
                  className="inp"
                  style={{ width: 140, padding: '4px 8px', fontSize: 13, margin: 0 }}
                  placeholder="e.g. 50000"
                  value={tenderAmount}
                  onChange={e => setTenderAmount(e.target.value)}
                />
                <button
                  type="button"
                  className="btn sm ghost"
                  style={{ padding: '4px 8px', fontSize: 12 }}
                  onClick={() => setTenderAmount(String(payableGross))}
                >
                  Exact
                </button>
              </div>
              {numTender > 0 && (
                <div style={{ fontSize: 13, color: changeDue > 0 ? '#15803D' : 'inherit', fontWeight: 600 }}>
                  Change to Return: {fmt(changeDue)}
                </div>
              )}
            </div>

            <div className="tra-qr-code-box">
              <div className="tra-qr-graphic">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" width="85" height="85">
                  <rect width="100" height="100" fill="#fff" />
                  <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M19,19 h7 v7 h-7 z" fill="#000" />
                  <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M74,19 h7 v7 h-7 z" fill="#000" />
                  <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M19,74 h7 v7 h-7 z" fill="#000" />
                  <path d="M42,12 h6 v6 h-6 z M52,15 h6 v6 h-6 z M42,28 h10 v6 h-10 z" fill="#000" />
                  <path d="M12,42 h6 v12 h-6 z M24,45 h8 v6 h-8 z M36,42 h6 v8 h-6 z" fill="#000" />
                  <path d="M48,42 h16 v6 h-16 z M68,42 h8 v8 h-8 z M82,45 h8 v6 h-8 z" fill="#000" />
                  <path d="M42,54 h8 v8 h-8 z M54,54 h8 v14 h-8 z M68,54 h6 v6 h-6 z" fill="#000" />
                  <path d="M42,72 h12 v8 h-12 z M60,72 h12 v6 h-12 z M78,72 h12 v12 h-12 z" fill="#000" />
                  <path d="M42,86 h8 v6 h-8 z M58,84 h14 v6 h-14 z" fill="#000" />
                </svg>
              </div>
              <div className="tra-qr-text">
                <div>VERIFICATION URL:</div>
                <div style={{ wordBreak: 'break-all', fontSize: 9 }}>https://verify.tra.go.tz/vfd/104824986/{receiptSequence}</div>
                <div style={{ fontWeight: 600, marginTop: 3 }}>RECEIPT VALIDATED & SIGNED</div>
              </div>
            </div>

            <div className="thermal-footer">
              <p className="thermal-thank-you">Thank You! Please Come Again.</p>
              <p className="thermal-swahili-msg">Asante sana! Karibu tena Safari Grill.</p>
            </div>
          </div>
        )}

        {/* ===================== VIEW 4: PROMOTIONAL / LOYALTY VOUCHER COUPON ===================== */}
        {tab === 'coupon' && (
          <div className="promo-coupon-container" ref={receiptRef}>
            <div className="coupon-card-deluxe">
              <div className="coupon-gold-ribbon">
                <span>EXCLUSIVE DINER PRIVILEGE</span>
              </div>

              <div className="coupon-main-body">
                <div className="coupon-brand-row">
                  <div className="brand-badge-circle">🔥</div>
                  <div>
                    <h3 className="coupon-brand-name">Safari Grill & Lounge</h3>
                    <small>Official Loyalty Club Voucher</small>
                  </div>
                </div>

                <div className="coupon-offer-box">
                  <div className="coupon-discount-value">10% OFF</div>
                  <div className="coupon-discount-tagline">YOUR ENTIRE BILL ON NEXT VISIT</div>
                </div>

                <div className="coupon-details-grid">
                  <div className="coupon-meta-item">
                    <small>PROMO VOUCHER CODE</small>
                    <b className="coupon-code-display">{couponCode}</b>
                  </div>
                  <div className="coupon-meta-item">
                    <small>VALIDITY PERIOD</small>
                    <b>30 Days (Dec 1, 2026)</b>
                  </div>
                  <div className="coupon-meta-item">
                    <small>MINIMUM SPEND</small>
                    <b>TSh 20,000</b>
                  </div>
                  <div className="coupon-meta-item">
                    <small>VALID BRANCHES</small>
                    <b>Masaki · Oysterbay · City</b>
                  </div>
                </div>

                <div className="coupon-barcode-section">
                  <div className="barcode-bars">
                    |||| | ||||| |||| || |||||||| |||| | |||| ||||| ||||
                  </div>
                  <small className="barcode-text">VOUCHER-{receiptSequence}-{couponCode}</small>
                </div>

                <div className="coupon-instructions">
                  💡 Present this code or voucher to your waiter or cashier when placing an order, or enter it at mobile checkout.
                </div>
              </div>
            </div>

            {/* Quick action to apply coupon discount to current order */}
            {o && !o.paid && (
              <div className="coupon-apply-action card no-print" style={{ marginTop: 14 }}>
                <b>Redeem Voucher on Order #{o.no || o.id}</b>
                <p style={{ fontSize: 13, color: 'var(--mut)', margin: '4px 0 10px' }}>
                  Apply a 10% discount voucher directly to this active order.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn sm o"
                    onClick={() => {
                      setAppliedDiscount(10);
                      o.discountPct = 10;
                      o.discountReason = 'Loyalty Voucher ' + couponCode;
                      setTab('customer');
                    }}
                  >
                    ✓ Apply 10% Voucher to This Order
                  </button>
                  <button
                    type="button"
                    className="btn sm ghost"
                    onClick={() => {
                      setAppliedDiscount(15);
                      o.discountPct = 15;
                      o.discountReason = 'VIP Diner Coupon ' + couponCode;
                      setTab('customer');
                    }}
                  >
                    ★ Apply 15% VIP
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons Toolbar at Bottom */}
      <div className="receipt-action-bar no-print">
        <button type="button" className="btn o sm action-print" onClick={handlePrint}>
          🖨️ Print Thermal Slip
        </button>

        <button type="button" className="btn ghost sm" onClick={handleCopyText}>
          {copied ? '✓ Copied Text!' : '📋 Copy Slip'}
        </button>

        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn ghost sm"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          📱 WhatsApp
        </a>

        <button type="button" className="btn ghost sm" onClick={close}>
          Close
        </button>
      </div>
    </Sheet>
  );
}

// Helper to format numbers with commas
function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-US');
}

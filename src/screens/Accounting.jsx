import React, { useState } from 'react';
import {
  INVOICES, BILLS, PAYMENTS, BANK_ACCOUNTS, CUSTOMERS, VENDORS,
  GENERAL_LEDGER, TRIAL_BALANCE, BALANCE_SHEET, PROFIT_LOSS,
  CASH_FLOW, TAX_REPORT, PARTNER_LEDGER, AGED_RECEIVABLE, AGED_PAYABLE,
  CHART_OF_ACCOUNTS
} from '../data_accounting';
import {
  InvoiceForm, BillForm, PaymentForm, PartnerForm, JournalEntryForm, DocDetail
} from '../components/AccountingForms';

/* ── Theme ── */
const G = '#1C7A4B', GBG = '#f0faf4', GD = '#145a36';
const fmt = n => 'TSh ' + Math.abs(Math.round(n || 0)).toLocaleString('en-US');
const fmtN = n => { const v = Math.round(n || 0); if (!v) return '0.00'; return (v < 0 ? '-' : '') + Math.abs(v).toLocaleString('en-US') + '.00'; };
const numColor = n => n < 0 ? '#c0392b' : n > 0 ? '#16a34a' : '#374151';

/* ── Badge ── */
const BADGE = { open:['#fef3c7','#92400e','Unpaid'], paid:['#d1fae5','#065f46','Paid'], draft:['#f3f4f6','#6b7280','Draft'], posted:['#dbeafe','#1e40af','Posted'], done:['#d1fae5','#065f46','Done'], approved:['#d1fae5','#065f46','Approved'], refused:['#fee2e2','#991b1b','Refused'] };
function Badge({ s }) { const [bg,c,l] = BADGE[s] || ['#f3f4f6','#6b7280',s]; return <span style={{background:bg,color:c,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:600}}>{l}</span>; }

/* ── Report banner ── */
const Banner = () => (
  <div style={{background:'#fffbeb',borderBottom:'1px solid #fcd34d',padding:'9px 24px',fontSize:12,color:'#92400e',textAlign:'center'}}>
    There are <span style={{color:G,fontWeight:600,cursor:'pointer',textDecoration:'underline'}}>unposted Journal Entries</span> prior or included in this period.
  </div>
);

/* ── Report top bar ── */
function RBar({ title, btns=[] }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 20px',borderBottom:'1px solid #e5e7eb',background:'#fff',flexWrap:'wrap'}}>
      <button style={{background:'#374151',color:'#fff',border:'none',borderRadius:5,padding:'5px 12px',fontWeight:700,cursor:'pointer',fontSize:12}}>PDF</button>
      <button style={{background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:5,padding:'5px 12px',fontWeight:600,cursor:'pointer',fontSize:12}}>XLSX</button>
      <span style={{fontWeight:700,fontSize:15,color:'#111827',marginLeft:4}}>{title}</span>
      {btns.map((b,i)=><button key={i} style={{background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11.5}}>{b}</button>)}
    </div>
  );
}

/* ── Toolbar ── */
function Toolbar({ title, onNew, newLabel='New', extra=[] }) {
  return (
    <div style={{borderBottom:'1px solid #e5e7eb',background:'#fff',display:'flex',alignItems:'center',gap:8,padding:'8px 20px'}}>
      {onNew && <button onClick={onNew} style={{background:G,color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontWeight:600,fontSize:13}}>+ {newLabel}</button>}
      {extra.map((b,i)=><button key={i} style={{background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:5,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:600}}>{b}</button>)}
      <span style={{fontWeight:700,fontSize:15,color:'#111827',marginLeft:4}}>{title}</span>
    </div>
  );
}

/* ── Search bar ── */
function SBar({ v, sv, ph='Search...' }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 20px',background:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
      <div style={{display:'flex',alignItems:'center',background:'#fff',border:'1px solid #d1d5db',borderRadius:20,padding:'5px 14px',gap:6,flex:1,maxWidth:400}}>
        <span style={{color:'#9ca3af'}}>🔍</span>
        <input value={v} onChange={e=>sv(e.target.value)} placeholder={ph} style={{border:'none',outline:'none',fontSize:13,flex:1,background:'transparent'}}/>
      </div>
      <button style={{background:G,color:'#fff',border:'none',borderRadius:20,padding:'5px 12px',fontSize:12,cursor:'pointer'}}>⭐ Favorites</button>
      <span style={{fontSize:12,color:'#6b7280'}}>1-5 / 5</span>
    </div>
  );
}

/* ── Generic Table ── */
function GT({ cols, rows, onRow }) {
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
            <th style={{width:36,padding:'10px 12px'}}><input type="checkbox" style={{accentColor:G}}/></th>
            {cols.map(c=><th key={c.k} style={{padding:'10px 12px',textAlign:c.r?'right':'left',color:'#6b7280',fontWeight:600,fontSize:12,whiteSpace:'nowrap'}}>{c.l}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>(
            <tr key={i} onClick={()=>onRow&&onRow(row)} style={{borderBottom:'1px solid #f3f4f6',cursor:onRow?'pointer':'default'}}
              onMouseEnter={e=>e.currentTarget.style.background=GBG}
              onMouseLeave={e=>e.currentTarget.style.background=''}>
              <td style={{padding:'10px 12px'}} onClick={e=>e.stopPropagation()}><input type="checkbox" style={{accentColor:G}}/></td>
              {cols.map(c=>(
                <td key={c.k} style={{padding:'10px 12px',textAlign:c.r?'right':'left',fontWeight:c.b?600:400,whiteSpace:c.wrap?'normal':'nowrap'}}>
                  {c.fn ? c.fn(row[c.k],row) : row[c.k]}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={cols.length+1} style={{padding:40,textAlign:'center',color:'#9ca3af'}}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════ NAV ══════════════════════ */
function NavDropdown({ items, anchorEl, active, go, onClose }) {
  if (!anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  return (
    <div
      onMouseEnter={()=>{}}
      onMouseLeave={onClose}
      style={{
        position:'fixed',
        top: rect.bottom,
        left: rect.left,
        background:'#fff',
        boxShadow:'0 6px 24px rgba(0,0,0,.18)',
        borderRadius:6,
        minWidth:210,
        zIndex:99999,
        border:'1px solid #e5e7eb',
        overflow:'hidden',
      }}>
      {items.map(s=>(
        <button key={s.k} onClick={()=>{go(s.k);onClose();}}
          style={{
            display:'block',width:'100%',textAlign:'left',
            padding:'10px 16px',
            background:active===s.k?GBG:'transparent',
            color:active===s.k?G:'#374151',
            border:'none',cursor:'pointer',fontSize:13.5,
            fontWeight:active===s.k?600:400,
            borderLeft:active===s.k?`3px solid ${G}`:'3px solid transparent',
          }}>
          {s.l}
        </button>
      ))}
    </div>
  );
}

function Nav({ active, go, out }) {
  const [open, setOpen] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const timeoutRef = React.useRef(null);

  const M = [
    {k:'dashboard',l:'Dashboard'},
    {k:'customers',l:'Customers',sub:[{k:'cust_invoices',l:'Invoices'},{k:'cust_payments',l:'Payments'},{k:'cust_list',l:'Customers'}]},
    {k:'vendors',l:'Vendors',sub:[{k:'vend_bills',l:'Bills'},{k:'vend_payments',l:'Vendor Payments'},{k:'vend_list',l:'Vendors'}]},
    {k:'accounting',l:'Accounting',sub:[{k:'journal_entries',l:'Journal Entries'},{k:'chart_of_accounts',l:'Chart of Accounts'},{k:'bank',l:'Bank & Cash'}]},
    {k:'review',l:'Review',sub:[{k:'journal_entries',l:'Journal Items'},{k:'bank',l:'Bank Reconciliation'}]},
    {k:'reporting',l:'Reporting',sub:[
      {k:'rpt_balance_sheet',l:'Balance Sheet'},{k:'rpt_pl',l:'Profit and Loss'},
      {k:'rpt_cashflow',l:'Cash Flow Statement'},{k:'rpt_trial_balance',l:'Trial Balance'},
      {k:'rpt_general_ledger',l:'General Ledger'},{k:'rpt_partner_ledger',l:'Partner Ledger'},
      {k:'rpt_aged_receivable',l:'Aged Receivable'},{k:'rpt_aged_payable',l:'Aged Payable'},
      {k:'rpt_tax',l:'Tax Report'},
    ]},
    {k:'configuration',l:'Configuration',sub:[{k:'chart_of_accounts',l:'Chart of Accounts'},{k:'journal_entries',l:'Journals'}]},
  ];

  const handleEnter = (e, mk) => {
    clearTimeout(timeoutRef.current);
    setOpen(mk);
    setAnchorEl(e.currentTarget);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => { setOpen(null); setAnchorEl(null); }, 120);
  };
  const cancelClose = () => clearTimeout(timeoutRef.current);

  const openItem = M.find(m => m.k === open);

  return (
    <>
      <nav style={{background:G,color:'#fff',display:'flex',alignItems:'center',minHeight:48,zIndex:1000,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'0 16px',borderRight:'1px solid rgba(255,255,255,.2)',height:48,flexShrink:0}}>
          <span style={{fontSize:18}}>💲</span>
          <span style={{fontWeight:700,fontSize:15}}>Accounting</span>
        </div>
        <div style={{display:'flex',flex:1}}>
          {M.map(m=>(
            <div key={m.k}
              onMouseEnter={m.sub ? e=>handleEnter(e,m.k) : undefined}
              onMouseLeave={m.sub ? handleLeave : undefined}
              style={{flexShrink:0}}>
              <button onClick={()=>{ if(!m.sub){go(m.k);} else { go(m.sub[0].k); } }}
                style={{
                  background:active===m.k||(m.sub&&m.sub.some(s=>s.k===active))?'rgba(255,255,255,.18)':'transparent',
                  color:'#fff',border:'none',cursor:'pointer',padding:'0 13px',height:48,
                  fontWeight:500,fontSize:13.5,display:'flex',alignItems:'center',gap:3,whiteSpace:'nowrap'
                }}>
                {m.l}{m.sub&&<span style={{fontSize:9,opacity:.7}}>▼</span>}
              </button>
            </div>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,paddingRight:16,flexShrink:0}}>
          <span style={{fontSize:12,opacity:.8,whiteSpace:'nowrap'}}>Safari Grill &amp; Lounge</span>
          <button onClick={out} style={{background:'rgba(255,255,255,.15)',color:'#fff',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}}>← Exit</button>
        </div>
      </nav>
      {openItem?.sub && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={handleLeave}
          style={{
            position:'fixed',
            top: anchorEl ? anchorEl.getBoundingClientRect().bottom : 48,
            left: anchorEl ? anchorEl.getBoundingClientRect().left : 0,
            background:'#fff',
            boxShadow:'0 6px 24px rgba(0,0,0,.18)',
            borderRadius:6,
            minWidth:210,
            zIndex:99999,
            border:'1px solid #e5e7eb',
            overflow:'hidden',
          }}>
          {openItem.sub.map(s=>(
            <button key={s.k} onClick={()=>{go(s.k);setOpen(null);setAnchorEl(null);}}
              style={{
                display:'block',width:'100%',textAlign:'left',
                padding:'10px 16px',
                background:active===s.k?GBG:'transparent',
                color:active===s.k?G:'#374151',
                border:'none',cursor:'pointer',fontSize:13.5,
                fontWeight:active===s.k?600:400,
                borderLeft:active===s.k?`3px solid ${G}`:'3px solid transparent',
              }}>
              {s.l}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ══════════════════════ DASHBOARD ══════════════════════ */
function Dashboard({ go }) {
  const unpaid = INVOICES.filter(i=>i.state==='open');
  const totalUnpaid = unpaid.reduce((s,i)=>s+i.balance,0);
  const inflows = PAYMENTS.filter(p=>p.type==='inbound').reduce((s,p)=>s+p.amount,0);
  const bankTotal = BANK_ACCOUNTS.reduce((s,b)=>s+b.balance,0);
  const pendingBills = BILLS.filter(b=>b.state==='open').reduce((s,b)=>s+b.balance,0);

  const Bar = ({vals,color}) => {
    const max = Math.max(...vals,1);
    const lbs = ['Due','25-31 Oct','This Week','8-14 Nov','15-21 Nov','Not Due'];
    return (
      <div style={{display:'flex',alignItems:'flex-end',gap:5,height:80,marginTop:10}}>
        {vals.map((v,i)=>(
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <div style={{width:'100%',background:v>0?color:'#e5e7eb',height:Math.max(4,(v/max)*64),borderRadius:3}}/>
            <span style={{fontSize:9,color:'#9ca3af',textAlign:'center',lineHeight:1.2}}>{lbs[i]}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{padding:24,background:'#f8fafc',minHeight:'100vh'}}>
      {/* KPI strip */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
        {[
          {l:'Unpaid Invoices',v:fmt(totalUnpaid),sub:`${unpaid.length} invoices`,bg:'#fef3c7',c:'#92400e'},
          {l:'Bills to Pay',v:fmt(pendingBills),sub:`${BILLS.filter(b=>b.state==='open').length} bills`,bg:'#dbeafe',c:'#1e40af'},
          {l:'Bank Balance',v:fmt(bankTotal),sub:`${BANK_ACCOUNTS.length} accounts`,bg:GBG,c:G},
          {l:'Cash Received',v:fmt(inflows),sub:'This month',bg:'#d1fae5',c:'#065f46'},
        ].map((k,i)=>(
          <div key={i} style={{background:'#fff',borderRadius:10,border:'1px solid #e5e7eb',padding:16}}>
            <div style={{fontSize:12,color:'#6b7280',marginBottom:6}}>{k.l}</div>
            <div style={{fontSize:21,fontWeight:700,color:'#111827'}}>{k.v}</div>
            <div style={{background:k.bg,color:k.c,fontSize:11,fontWeight:600,borderRadius:12,padding:'2px 8px',display:'inline-block',marginTop:4}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        {/* Sales */}
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontWeight:700,fontSize:15}}>Sales</span>
            <span style={{color:'#9ca3af',cursor:'pointer',fontSize:18}}>⋮</span>
          </div>
          <button onClick={()=>go('cust_invoices')} style={{background:G,color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontWeight:600,fontSize:13,marginBottom:10}}>New</button>
          <div style={{fontSize:12.5,marginBottom:5}}><span style={{color:G,fontWeight:600}}>{unpaid.length} Unpaid</span><span style={{float:'right',fontWeight:600}}>{fmt(totalUnpaid)}</span></div>
          <div style={{fontSize:12.5}}><span style={{color:'#ef4444',fontWeight:600}}>{unpaid.length} Late</span><span style={{float:'right',fontWeight:600,color:'#ef4444'}}>{fmt(totalUnpaid)}</span></div>
          <Bar vals={[600000,150000,45000,300000,500000,175000]} color="#d4b2e8"/>
        </div>

        {/* Purchases */}
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontWeight:700,fontSize:15}}>Purchases</span>
            <span style={{color:'#9ca3af',cursor:'pointer',fontSize:18}}>⋮</span>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <button style={{background:G,color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontWeight:600,fontSize:13}}>Upload</button>
            <button onClick={()=>go('vend_bills')} style={{background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13}}>New</button>
          </div>
          <Bar vals={[225000,50000,0,176000,0,0]} color="#a7d7c5"/>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        {/* Bank */}
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:20}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Bank</div>
          <div style={{display:'flex',gap:8,marginBottom:14}}>
            <button style={{background:G,color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontWeight:600,fontSize:13}}>Bank Setup</button>
            <button onClick={()=>go('bank')} style={{background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13}}>Transactions</button>
          </div>
          {BANK_ACCOUNTS.map(b=>(
            <div key={b.id} style={{marginBottom:10,paddingBottom:10,borderBottom:'1px solid #f3f4f6'}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{b.name}</div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5}}>
                <span style={{color:'#6b7280'}}>Balance</span>
                <span style={{color:b.balance<0?'#ef4444':'#111827',fontWeight:700}}>{fmt(b.balance)}</span>
              </div>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginTop:4}}>
            <span style={{color:'#6b7280'}}>Payments</span><span style={{color:G,fontWeight:600}}>{fmt(inflows)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginTop:4}}>
            <span style={{color:'#6b7280'}}>Misc. Operations</span><span style={{color:G,fontWeight:600}}>TSh 23,273,200</span>
          </div>
        </div>

        {/* Tax Returns */}
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:20}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Tax Returns</div>
          <button onClick={()=>go('rpt_tax')} style={{background:G,color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontWeight:600,fontSize:13,marginBottom:16}}>Tax Returns</button>
          {[{l:'Set Company Data',d:true},{l:'Set Periods',d:true},{l:'Review Chart of Accounts',d:false}].map((x,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:10}}>
              <div style={{width:13,height:13,borderRadius:'50%',background:x.d?G:'#e5e7eb',border:`2px solid ${x.d?G:'#d1d5db'}`,flexShrink:0}}/>
              <span style={{color:x.d?'#374151':'#9ca3af'}}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ INVOICES ══════════════════════ */
function Invoices({ onNew, onRow, data }) {
  const [q,setQ]=useState('');
  const rows=(data||INVOICES).filter(i=>i.partner.toLowerCase().includes(q.toLowerCase())||i.no.includes(q));
  return (
    <div>
      <Toolbar title="Customer Invoices" onNew={onNew} newLabel="Invoice" extra={['Upload']}/>
      <SBar v={q} sv={setQ} ph="Search invoices..."/>
      <GT onRow={onRow} rows={rows} cols={[
        {k:'no',l:'Number',fn:v=><span style={{color:G,fontWeight:600}}>{v}</span>},
        {k:'date',l:'Invoice Date'},
        {k:'due',l:'Due Date',fn:(v,row)=><span style={{color:row.state==='open'&&new Date(v)<new Date()?'#ef4444':'#374151'}}>{v}</span>},
        {k:'partner',l:'Customer',b:true},
        {k:'total',l:'Total',r:true,fn:v=><span style={{fontWeight:600}}>{fmt(v)}</span>},
        {k:'balance',l:'Amount Due',r:true,fn:v=><span style={{fontWeight:600,color:v>0?'#92400e':'#065f46'}}>{fmt(v)}</span>},
        {k:'state',l:'Status',fn:v=><Badge s={v}/>},
      ]}/>
    </div>
  );
}

/* ══════════════════════ BILLS ══════════════════════ */
function Bills({ onNew, onRow, data }) {
  const [q,setQ]=useState('');
  const rows=(data||BILLS).filter(b=>b.partner.toLowerCase().includes(q.toLowerCase())||b.no.includes(q));
  return (
    <div>
      <Toolbar title="Vendor Bills" onNew={onNew} newLabel="Bill" extra={['Upload']}/>
      <SBar v={q} sv={setQ} ph="Search bills..."/>
      <GT onRow={onRow} rows={rows} cols={[
        {k:'no',l:'Number',fn:v=><span style={{color:G,fontWeight:600}}>{v}</span>},
        {k:'date',l:'Bill Date'},
        {k:'due',l:'Due Date'},
        {k:'partner',l:'Vendor',b:true},
        {k:'total',l:'Total',r:true,fn:v=><span style={{fontWeight:600}}>{fmt(v)}</span>},
        {k:'balance',l:'Amount Due',r:true,fn:v=><span style={{fontWeight:600,color:v>0?'#92400e':'#065f46'}}>{fmt(v)}</span>},
        {k:'state',l:'Status',fn:v=><Badge s={v}/>},
      ]}/>
    </div>
  );
}

/* ══════════════════════ PAYMENTS ══════════════════════ */
function PaymentsView({ dir, onNew, onRow }) {
  const [q,setQ]=useState('');
  const data=dir?PAYMENTS.filter(p=>p.type===dir):PAYMENTS;
  const rows=data.filter(p=>p.partner.toLowerCase().includes(q.toLowerCase()));
  const title=dir==='inbound'?'Customer Payments':dir==='outbound'?'Vendor Payments':'Payments';
  return (
    <div>
      <Toolbar title={title} onNew={onNew} newLabel="Payment"/>
      <SBar v={q} sv={setQ} ph="Search payments..."/>
      <GT onRow={onRow} rows={rows} cols={[
        {k:'no',l:'Number',fn:v=><span style={{color:G,fontWeight:600}}>{v}</span>},
        {k:'date',l:'Date'},
        {k:'partner',l:'Partner',b:true},
        {k:'memo',l:'Memo',wrap:true},
        {k:'journal',l:'Journal'},
        {k:'method',l:'Method',fn:v=><span style={{background:'#f3f4f6',padding:'2px 8px',borderRadius:4,fontSize:11,fontWeight:600,textTransform:'uppercase'}}>{v}</span>},
        {k:'amount',l:'Amount',r:true,fn:(v,row)=><span style={{fontWeight:600,color:row.type==='inbound'?'#065f46':'#c0392b'}}>{row.type==='outbound'?'- ':''}{fmt(v)}</span>},
      ]}/>
    </div>
  );
}

/* ══════════════════════ PARTNERS ══════════════════════ */
function Partners({ type, onNew, onRow }) {
  const [q,setQ]=useState('');
  const data=type==='customer'?CUSTOMERS:VENDORS;
  const rows=data.filter(p=>p.name.toLowerCase().includes(q.toLowerCase()));
  const title=type==='customer'?'Customers':'Vendors';
  return (
    <div>
      <Toolbar title={title} onNew={onNew} newLabel={title.slice(0,-1)}/>
      <SBar v={q} sv={setQ} ph={`Search ${title.toLowerCase()}...`}/>
      <GT onRow={onRow} rows={rows} cols={[
        {k:'ref',l:'Reference'},
        {k:'name',l:'Name',b:true},
        {k:'city',l:'City'},
        {k:'phone',l:'Phone'},
        {k:'email',l:'Email'},
        ...(type==='vendor'?[{k:'terms',l:'Payment Terms'}]:[]),
        {k:'balance',l:'Balance',r:true,fn:v=><span style={{fontWeight:600,color:v>0?'#92400e':'#065f46'}}>{fmt(v)}</span>},
        {k:'overdue',l:'Overdue',r:true,fn:v=>v>0?<span style={{color:'#ef4444',fontWeight:600}}>{fmt(v)}</span>:<span style={{color:'#d1d5db'}}>—</span>},
      ]}/>
    </div>
  );
}

/* ══════════════════════ JOURNAL ENTRIES ══════════════════════ */
function JournalEntries({ entries=[], onNew, onRow }) {
  const [q,setQ]=useState('');
  const [exp,setExp]=useState(null);
  const rows=entries.filter(j=>j.ref.toLowerCase().includes(q.toLowerCase())||j.no.includes(q));
  return (
    <div>
      <Toolbar title="Journal Entries" onNew={onNew} newLabel="Journal Entry"/>
      <SBar v={q} sv={setQ} ph="Search journal entries..."/>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
            <th style={{width:36,padding:'10px 12px'}}><input type="checkbox"/></th>
            {['Number','Date','Journal','Reference','Total','Status'].map(h=>(
              <th key={h} style={{padding:'10px 12px',textAlign:h==='Total'?'right':'left',color:'#6b7280',fontWeight:600,fontSize:12}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(je=>(
            <React.Fragment key={je.id}>
              <tr onClick={()=>setExp(exp===je.id?null:je.id)}
                style={{borderBottom:'1px solid #f3f4f6',cursor:'pointer',background:exp===je.id?GBG:''}}
                onMouseEnter={e=>{if(exp!==je.id)e.currentTarget.style.background='#fafafa';}}
                onMouseLeave={e=>{if(exp!==je.id)e.currentTarget.style.background='';}}>
                <td style={{padding:'10px 12px'}} onClick={e=>e.stopPropagation()}><input type="checkbox"/></td>
                <td style={{padding:'10px 12px',color:G,fontWeight:600}}>{je.no}</td>
                <td style={{padding:'10px 12px'}}>{je.date}</td>
                <td style={{padding:'10px 12px'}}>{je.journal}</td>
                <td style={{padding:'10px 12px',color:G,fontWeight:500}}>{je.ref}</td>
                <td style={{padding:'10px 12px',textAlign:'right',fontWeight:600}}>{fmt(je.lines.reduce((s,l)=>s+l.debit,0))}</td>
                <td style={{padding:'10px 12px'}}><Badge s={je.state}/></td>
              </tr>
              {exp===je.id&&(
                <tr>
                  <td colSpan={7} style={{padding:0,background:'#f8fafc'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                      <thead>
                        <tr style={{background:'#e8f5ee'}}>
                          {['Account','Partner','Debit','Credit'].map((h,i)=>(
                            <th key={h} style={{padding:`7px ${i===0?'24px':'12px'}`,textAlign:i>1?'right':'left',color:G,fontWeight:600}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {je.lines.map((l,li)=>(
                          <tr key={li} style={{borderBottom:'1px solid #e5e7eb'}}>
                            <td style={{padding:'6px 24px'}}>{l.account} {l.name}</td>
                            <td style={{padding:'6px 12px',color:'#6b7280'}}>{l.partner||'—'}</td>
                            <td style={{padding:'6px 12px',textAlign:'right',color:l.debit>0?'#374151':'#d1d5db'}}>{l.debit>0?fmt(l.debit):'0.00'}</td>
                            <td style={{padding:'6px 12px',textAlign:'right',color:l.credit>0?'#374151':'#d1d5db'}}>{l.credit>0?fmt(l.credit):'0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════ CHART OF ACCOUNTS ══════════════════════ */
function ChartOfAccounts() {
  const [q,setQ]=useState('');
  const filtered=CHART_OF_ACCOUNTS.filter(a=>a.name.toLowerCase().includes(q.toLowerCase())||a.code.includes(q));
  const cats=[...new Set(filtered.map(a=>a.category))];
  return (
    <div>
      <Toolbar title="Chart of Accounts" onNew={()=>{}} newLabel="Account"/>
      <SBar v={q} sv={setQ} ph="Search accounts..."/>
      <div style={{padding:'12px 20px'}}>
        {cats.map(cat=>(
          <div key={cat} style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:11,color:G,textTransform:'uppercase',letterSpacing:1,marginBottom:6,paddingBottom:4,borderBottom:`2px solid ${G}30`}}>{cat}</div>
            {filtered.filter(a=>a.category===cat).map(acc=>(
              <div key={acc.id} style={{display:'flex',alignItems:'center',gap:16,padding:'8px 12px',borderBottom:'1px solid #f3f4f6',borderRadius:4}}
                onMouseEnter={e=>e.currentTarget.style.background=GBG}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <span style={{color:G,fontWeight:700,fontSize:13,minWidth:50}}>{acc.code}</span>
                <span style={{flex:1,color:'#374151',fontSize:13,fontWeight:500}}>{acc.name}</span>
                <span style={{fontSize:12,color:'#6b7280',minWidth:80}}>{acc.type}</span>
                <span style={{background:acc.normal==='debit'?'#dbeafe':'#fce7f3',color:acc.normal==='debit'?'#1e40af':'#9d174d',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:600}}>{acc.normal}</span>
                <button style={{background:'transparent',color:G,border:`1px solid ${G}40`,borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11}}>Setup</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════ BANK & CASH ══════════════════════ */
function BankCash() {
  return (
    <div>
      <Toolbar title="Bank & Cash" onNew={()=>{}} newLabel="Transaction"/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16,padding:24}}>
        {BANK_ACCOUNTS.map(b=>(
          <div key={b.id} style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{b.name}</div>
                <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>{b.bank} · {b.number}</div>
              </div>
              <span style={{fontSize:22}}>🏦</span>
            </div>
            <div style={{fontSize:26,fontWeight:700,color:b.balance<0?'#ef4444':'#111827',marginBottom:4}}>{fmt(b.balance)}</div>
            <div style={{fontSize:11,color:'#9ca3af',marginBottom:14}}>Last sync: {b.lastSync}</div>
            <div style={{display:'flex',gap:8}}>
              <button style={{flex:1,background:G,color:'#fff',border:'none',borderRadius:6,padding:'7px 0',cursor:'pointer',fontWeight:600,fontSize:12}}>Transactions</button>
              <button style={{flex:1,background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:6,padding:'7px 0',cursor:'pointer',fontSize:12}}>Reconcile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════ BALANCE SHEET ══════════════════════ */
function BalanceSheet() {
  const [ex,setEx]=useState({});
  const toggle=k=>setEx(p=>({...p,[k]:!p[k]}));
  const bs=BALANCE_SHEET;
  const totalA=bs.assets.noncurrent.total+bs.assets.current.total;

  const Row=({item,depth=0,sk})=>{
    const k=sk+item.name;
    return(
      <>
        <tr onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
          <td style={{padding:`8px 12px 8px ${24+depth*20}px`,color:'#4b5563',fontSize:13}}>
            {item.expandable
              ?<button onClick={()=>toggle(k)} style={{background:'none',border:'none',cursor:'pointer',color:G,marginRight:6,fontSize:11,padding:0}}>{ex[k]?'▾':'▸'}</button>
              :<span style={{display:'inline-block',width:22}}/>}
            {item.balance!==0&&depth>0?<span style={{color:G}}>{item.name}</span>:item.name}
          </td>
          <td style={{padding:'8px 24px',textAlign:'right',fontSize:13,color:numColor(item.balance||0),fontWeight:item.balance?500:400}}>
            {item.balance!==undefined?fmtN(item.balance):''}
          </td>
        </tr>
        {ex[k]&&(item.children||[]).map((c,i)=><Row key={i} item={c} depth={depth+1} sk={sk}/>)}
      </>
    );
  };

  const Section=({title,total,items,sk})=>(
    <>
      <tr style={{background:'#f3f4f6'}}><td colSpan={2} style={{padding:'9px 24px',fontWeight:700,fontSize:13,color:'#374151'}}>{title}</td></tr>
      {items.map((item,i)=><Row key={i} item={item} sk={sk}/>)}
      <tr style={{borderTop:'2px solid #e5e7eb',background:'#f8fafc'}}>
        <td style={{padding:'9px 24px',fontWeight:700,fontSize:13}}>Total {title}</td>
        <td style={{padding:'9px 24px',textAlign:'right',fontWeight:700,fontSize:13,color:numColor(total)}}>{fmtN(total)}</td>
      </tr>
    </>
  );

  return(
    <div>
      <RBar title="Balance Sheet" btns={['📅 As of 11/01/2026','% Comparison','📋 All Journals','📊 Analytic','≡ Posted Entries','🇹🇿 Report: Balance sheet (TZ)','In .TSh']}/>
      <Banner/>
      <div style={{maxWidth:700,margin:'24px auto',background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'flex-end',borderBottom:'2px solid #e5e7eb'}}>
          <div style={{padding:'12px 24px',minWidth:220,textAlign:'right'}}>
            <div style={{fontWeight:600,fontSize:13,borderBottom:'1px solid #e5e7eb',paddingBottom:4,marginBottom:4}}>{bs.date}</div>
            <div style={{fontWeight:700,fontSize:12,color:'#374151'}}>Balance</div>
          </div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <tbody>
            <tr style={{background:'#e8f5ee'}}>
              <td style={{padding:'10px 24px',fontWeight:700,fontSize:14,color:G}}>Active</td>
              <td style={{padding:'10px 24px',textAlign:'right',fontWeight:700,fontSize:14,color:G}}>{fmtN(totalA)}</td>
            </tr>
            <Section title="Non currents assets" total={bs.assets.noncurrent.total} items={bs.assets.noncurrent.items} sk="nca"/>
            <Section title="Current Assets" total={bs.assets.current.total} items={bs.assets.current.items} sk="ca"/>
            <tr><td colSpan={2} style={{height:12}}/></tr>
            <tr style={{background:'#e8f5ee'}}>
              <td style={{padding:'10px 24px',fontWeight:700,fontSize:14,color:GD}}>Liabilities &amp; Equity</td>
              <td style={{padding:'10px 24px',textAlign:'right',fontWeight:700,fontSize:14,color:GD}}>{fmtN(bs.liabilities.current.total)}</td>
            </tr>
            <Section title="Non-Current Liabilities" total={bs.liabilities.noncurrent.total} items={bs.liabilities.noncurrent.items} sk="ncl"/>
            <Section title="Current Liabilities" total={bs.liabilities.current.total} items={bs.liabilities.current.items} sk="cl"/>
            <tr><td colSpan={2} style={{height:12}}/></tr>
            <tr style={{background:'#f3f4f6'}}><td colSpan={2} style={{padding:'9px 24px',fontWeight:700,fontSize:13}}>Equity</td></tr>
            {bs.equity.items.map((item,i)=>(
              <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{padding:'8px 12px 8px 44px',fontSize:13,color:'#4b5563'}}>{item.name}</td>
                <td style={{padding:'8px 24px',textAlign:'right',fontSize:13,color:numColor(item.balance)}}>{fmtN(item.balance)}</td>
              </tr>
            ))}
            <tr style={{borderTop:'2px solid #e5e7eb',background:'#f8fafc'}}>
              <td style={{padding:'9px 24px',fontWeight:700,fontSize:13}}>Total Equity</td>
              <td style={{padding:'9px 24px',textAlign:'right',fontWeight:700,fontSize:13,color:G}}>{fmtN(bs.equity.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════ P&L ══════════════════════ */
function PL() {
  const pl=PROFIT_LOSS;
  const ti=pl.income.reduce((s,i)=>s+i.amount,0);
  const tc=pl.cogs.reduce((s,i)=>s+i.amount,0);
  const gp=ti-tc;
  const te=pl.expenses.reduce((s,i)=>s+i.amount,0);
  const net=gp-te;

  const Sec=({title,items,total,tc:totC})=>(
    <>
      <tr style={{background:'#f3f4f6'}}><td colSpan={2} style={{padding:'9px 24px',fontWeight:700,fontSize:13,color:'#374151'}}>{title}</td></tr>
      {items.map((item,i)=>(
        <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
          <td style={{padding:'8px 12px 8px 44px',fontSize:13,color:'#374151'}}>{item.name}</td>
          <td style={{padding:'8px 24px',textAlign:'right',fontSize:13,color:'#374151'}}>{fmtN(item.amount)}</td>
        </tr>
      ))}
      <tr style={{borderTop:'2px solid #e5e7eb',background:'#f8fafc'}}>
        <td style={{padding:'9px 24px',fontWeight:700,fontSize:13}}>Total {title}</td>
        <td style={{padding:'9px 24px',textAlign:'right',fontWeight:700,fontSize:13,color:totC||'#374151'}}>{fmtN(total)}</td>
      </tr>
    </>
  );

  return(
    <div>
      <RBar title="Profit and Loss" btns={['📅 Nov 2026','% Comparison','📋 All Journals','T Analytic','≡ Posted Entries','In .TSh']}/>
      <Banner/>
      <div style={{maxWidth:700,margin:'24px auto',background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'flex-end',borderBottom:'2px solid #e5e7eb'}}>
          <div style={{padding:'12px 24px',minWidth:220,textAlign:'right'}}>
            <div style={{fontWeight:600,fontSize:13,borderBottom:'1px solid #e5e7eb',paddingBottom:4,marginBottom:4}}>Nov 2026</div>
            <div style={{fontWeight:700,fontSize:12}}>Balance</div>
          </div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <tbody>
            <Sec title="Income" items={pl.income} total={ti} tc={G}/>
            <tr style={{background:'#e8f5ee'}}>
              <td style={{padding:'10px 24px',fontWeight:700,fontSize:14,color:G}}>Gross Profit</td>
              <td style={{padding:'10px 24px',textAlign:'right',fontWeight:700,fontSize:14,color:G}}>{fmtN(gp)}</td>
            </tr>
            <Sec title="Cost of Revenue" items={pl.cogs} total={tc} tc="#c0392b"/>
            <Sec title="Operating Expenses" items={pl.expenses} total={te} tc="#c0392b"/>
            <tr style={{background:net>=0?'#e8f5ee':'#fee2e2',borderTop:'2px solid #e5e7eb'}}>
              <td style={{padding:'12px 24px',fontWeight:700,fontSize:15,color:net>=0?G:'#c0392b'}}>Net Profit / (Loss)</td>
              <td style={{padding:'12px 24px',textAlign:'right',fontWeight:700,fontSize:15,color:net>=0?G:'#c0392b'}}>{fmtN(net)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════ CASH FLOW ══════════════════════ */
function CashFlow() {
  const cf=CASH_FLOW;
  const op=cf.operating.reduce((s,i)=>s+i.amount,0);
  const inv=cf.investing.reduce((s,i)=>s+i.amount,0);
  const fin=cf.financing.reduce((s,i)=>s+i.amount,0);
  const net=op+inv+fin;

  const Sec=({title,items,total})=>(
    <>
      <tr style={{background:'#f3f4f6'}}><td colSpan={2} style={{padding:'9px 24px',fontWeight:700,fontSize:13}}>{title}</td></tr>
      {items.map((item,i)=>(
        <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
          <td style={{padding:'8px 12px 8px 44px',fontSize:13}}>{item.name}</td>
          <td style={{padding:'8px 24px',textAlign:'right',fontSize:13,color:numColor(item.amount)}}>{fmtN(item.amount)}</td>
        </tr>
      ))}
      <tr style={{borderTop:'2px solid #e5e7eb',background:'#f8fafc'}}>
        <td style={{padding:'9px 24px',fontWeight:700,fontSize:13}}>Net Cash from {title}</td>
        <td style={{padding:'9px 24px',textAlign:'right',fontWeight:700,fontSize:13,color:numColor(total)}}>{fmtN(total)}</td>
      </tr>
    </>
  );

  return(
    <div>
      <RBar title="Cash Flow Statement" btns={['📅 Nov 2026','% Comparison','📋 All Journals','≡ Posted Entries','In .TSh']}/>
      <Banner/>
      <div style={{maxWidth:700,margin:'24px auto',background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'flex-end',borderBottom:'2px solid #e5e7eb'}}>
          <div style={{padding:'12px 24px',minWidth:220,textAlign:'right'}}>
            <div style={{fontWeight:600,fontSize:13,borderBottom:'1px solid #e5e7eb',paddingBottom:4,marginBottom:4}}>Nov 2026</div>
            <div style={{fontWeight:700,fontSize:12}}>Balance</div>
          </div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <tbody>
            <Sec title="Operating Activities" items={cf.operating} total={op}/>
            <Sec title="Investing Activities" items={cf.investing} total={inv}/>
            <Sec title="Financing Activities" items={cf.financing} total={fin}/>
            <tr style={{background:net>=0?'#e8f5ee':'#fee2e2',borderTop:'3px solid #e5e7eb'}}>
              <td style={{padding:'12px 24px',fontWeight:700,fontSize:15,color:net>=0?G:'#c0392b'}}>Net Change in Cash</td>
              <td style={{padding:'12px 24px',textAlign:'right',fontWeight:700,fontSize:15,color:numColor(net)}}>{fmtN(net)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════ TRIAL BALANCE ══════════════════════ */
function TrialBalance() {
  const tD=TRIAL_BALANCE.reduce((s,r)=>s+r.debit,0);
  const tC=TRIAL_BALANCE.reduce((s,r)=>s+r.credit,0);
  return(
    <div>
      <RBar title="Trial Balance" btns={['🔍','📅 Nov 2026','% Comparison','📋 All Journals','T Analytic','≡ Posted Entries','In .TSh']}/>
      <Banner/>
      <div style={{maxWidth:880,margin:'24px auto',background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
          <thead>
            <tr style={{background:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
              <th rowSpan={2} style={{padding:'10px 24px',textAlign:'left',color:'#374151',fontWeight:600,borderBottom:'2px solid #e5e7eb',minWidth:280}}>Account</th>
              <th style={{padding:'8px 24px',textAlign:'center',color:'#374151',fontWeight:600,borderLeft:'1px solid #e5e7eb',borderBottom:'1px solid #e5e7eb'}}>Initial Balance</th>
              <th colSpan={2} style={{padding:'8px 24px',textAlign:'center',color:'#374151',fontWeight:600,borderLeft:'1px solid #e5e7eb',borderBottom:'1px solid #e5e7eb'}}>Nov 2026</th>
              <th style={{padding:'8px 24px',textAlign:'center',color:'#374151',fontWeight:600,borderLeft:'1px solid #e5e7eb',borderBottom:'1px solid #e5e7eb'}}>End Balance</th>
            </tr>
            <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
              <th style={{padding:'5px 24px',textAlign:'right',color:'#6b7280',fontWeight:500,fontSize:11,borderLeft:'1px solid #e5e7eb'}}>Balance</th>
              <th style={{padding:'5px 12px',textAlign:'right',color:'#6b7280',fontWeight:500,fontSize:11,borderLeft:'1px solid #e5e7eb'}}>Debit</th>
              <th style={{padding:'5px 12px',textAlign:'right',color:'#6b7280',fontWeight:500,fontSize:11}}>Credit</th>
              <th style={{padding:'5px 24px',textAlign:'right',color:'#6b7280',fontWeight:500,fontSize:11,borderLeft:'1px solid #e5e7eb'}}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {TRIAL_BALANCE.map((row,i)=>(
              <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}
                onMouseEnter={e=>e.currentTarget.style.background=GBG}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{padding:'7px 24px',color:'#374151'}}>
                  {row.code} {row.name}
                  <span style={{color:'#d1d5db',marginLeft:6,fontSize:11}}>≡ 💬</span>
                </td>
                <td style={{padding:'7px 24px',textAlign:'right',color:numColor(row.initBalance),borderLeft:'1px solid #f3f4f6'}}>{fmtN(row.initBalance)}</td>
                <td style={{padding:'7px 12px',textAlign:'right',color:'#374151',borderLeft:'1px solid #f3f4f6'}}>0.00</td>
                <td style={{padding:'7px 12px',textAlign:'right',color:'#374151'}}>0.00</td>
                <td style={{padding:'7px 24px',textAlign:'right',color:numColor(row.endBalance),fontWeight:500,borderLeft:'1px solid #f3f4f6'}}>{fmtN(row.endBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:'#f9fafb',borderTop:'2px solid #e5e7eb'}}>
              <td style={{padding:'10px 24px',fontWeight:700,fontSize:13}}>Total</td>
              <td style={{padding:'10px 24px',textAlign:'right',fontWeight:700,borderLeft:'1px solid #e5e7eb'}}>0.00</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,color:G,borderLeft:'1px solid #e5e7eb'}}>{fmtN(tD)}</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,color:'#c0392b'}}>{fmtN(tC)}</td>
              <td style={{padding:'10px 24px',textAlign:'right',fontWeight:700,borderLeft:'1px solid #e5e7eb'}}>0.00</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════ GENERAL LEDGER ══════════════════════ */
function GeneralLedger() {
  const [ex,setEx]=useState({});
  const tD=GENERAL_LEDGER.reduce((s,r)=>s+r.debit,0);
  const tC=GENERAL_LEDGER.reduce((s,r)=>s+r.credit,0);
  return(
    <div>
      <RBar title="General Ledger" btns={['🔍','📅 Nov 2026','📋 All Journals','T Analytic','≡ Posted Entries','In .TSh']}/>
      <Banner/>
      <div style={{maxWidth:980,margin:'24px auto',background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
          <thead>
            <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
              <th colSpan={3} style={{padding:'10px 24px',textAlign:'left',color:'#374151',fontWeight:600}}>Nov 2026</th>
              <th style={{padding:'10px 12px',textAlign:'right',color:'#374151',fontWeight:600}}>Debit</th>
              <th style={{padding:'10px 12px',textAlign:'right',color:'#374151',fontWeight:600}}>Credit</th>
              <th style={{padding:'10px 24px',textAlign:'right',color:'#374151',fontWeight:600}}>Balance</th>
            </tr>
            <tr style={{background:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
              {['Date','Partner','Currency','','',''].map((h,i)=>(
                <th key={i} style={{padding:'5px '+(i===0?'24px':'12px'),color:'#6b7280',fontWeight:500,fontSize:11,textAlign:i>2?'right':'left'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GENERAL_LEDGER.map((row,i)=>(
              <React.Fragment key={i}>
                <tr onClick={()=>setEx(p=>({...p,[i]:!p[i]}))}
                  style={{borderBottom:'1px solid #f3f4f6',cursor:'pointer',background:ex[i]?GBG:''}}
                  onMouseEnter={e=>{if(!ex[i])e.currentTarget.style.background='#fafafa';}}
                  onMouseLeave={e=>{if(!ex[i])e.currentTarget.style.background='';}}>
                  <td style={{padding:'8px 24px',fontWeight:500}}>
                    <span style={{color:G,marginRight:6,fontSize:11}}>{ex[i]?'▾':'▸'}</span>
                    {row.code} {row.name}
                  </td>
                  <td style={{padding:'8px 12px',color:'#9ca3af'}}></td>
                  <td style={{padding:'8px 12px',textAlign:'right',color:row.balance<0?'#c0392b':'#374151',fontWeight:500}}>
                    {Math.abs(row.balance).toLocaleString()}.00 TSh
                  </td>
                  <td style={{padding:'8px 12px',textAlign:'right'}}>{row.debit>0?row.debit.toLocaleString()+'.00 TSh':'0.00 TSh'}</td>
                  <td style={{padding:'8px 12px',textAlign:'right'}}>{row.credit>0?row.credit.toLocaleString()+'.00 TSh':'0.00 TSh'}</td>
                  <td style={{padding:'8px 24px',textAlign:'right',color:numColor(row.balance),fontWeight:600}}>
                    {row.balance<0?'-':''}{Math.abs(row.balance).toLocaleString()}.00 TSh
                  </td>
                </tr>
                {ex[i]&&(
                  <tr>
                    <td colSpan={6} style={{background:'#f8fafc',padding:'8px 48px',fontSize:12,color:'#9ca3af',fontStyle:'italic'}}>
                      Opening balance carried forward — no individual transaction lines in demo mode.
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:'#f9fafb',borderTop:'2px solid #e5e7eb'}}>
              <td colSpan={3} style={{padding:'10px 24px',fontWeight:700,fontSize:13}}>Total General Ledger</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,color:G}}>{tD.toLocaleString()}.00 TSh</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,color:'#c0392b'}}>{tC.toLocaleString()}.00 TSh</td>
              <td style={{padding:'10px 24px',textAlign:'right',fontWeight:700}}>0.00 TSh</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════ PARTNER LEDGER ══════════════════════ */
function PartnerLedger() {
  return(
    <div>
      <RBar title="Partner Ledger" btns={['📅 Nov 2026','📋 All Journals','≡ Posted Entries','In .TSh']}/>
      <Banner/>
      <div style={{maxWidth:860,margin:'24px auto',background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',overflow:'hidden'}}>
        {PARTNER_LEDGER.map((pl,pi)=>(
          <div key={pi}>
            <div style={{background:'#f3f4f6',padding:'10px 24px',fontWeight:700,fontSize:13,color:'#374151',display:'flex',justifyContent:'space-between',borderBottom:'1px solid #e5e7eb'}}>
              <span>{pl.partner} <span style={{background:'#e5e7eb',color:'#6b7280',borderRadius:4,padding:'1px 6px',fontSize:11,marginLeft:6}}>{pl.type}</span></span>
              <span style={{color:numColor(pl.balance)}}>{fmtN(pl.balance)}</span>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
              <thead>
                <tr style={{background:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
                  {['Date','Reference','Debit','Credit','Balance'].map((h,i)=>(
                    <th key={h} style={{padding:'7px '+(i<2?'24px':'12px'),textAlign:i>1?'right':'left',color:'#6b7280',fontWeight:500,fontSize:11}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pl.lines.map((line,li)=>(
                  <tr key={li} style={{borderBottom:'1px solid #f3f4f6'}}
                    onMouseEnter={e=>e.currentTarget.style.background=GBG}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{padding:'7px 24px'}}>{line.date}</td>
                    <td style={{padding:'7px 24px',color:G,fontWeight:500}}>{line.ref}</td>
                    <td style={{padding:'7px 12px',textAlign:'right',color:'#374151'}}>{line.debit>0?fmtN(line.debit):'0.00'}</td>
                    <td style={{padding:'7px 12px',textAlign:'right',color:'#374151'}}>{line.credit>0?fmtN(line.credit):'0.00'}</td>
                    <td style={{padding:'7px 24px',textAlign:'right',color:numColor(line.balance)}}>{fmtN(line.balance)}</td>
                  </tr>
                ))}
                <tr style={{background:'#f8fafc',borderTop:'2px solid #e5e7eb',borderBottom:'3px solid #e5e7eb'}}>
                  <td colSpan={2} style={{padding:'8px 24px',fontWeight:700,fontSize:12.5}}>Total for {pl.partner}</td>
                  <td style={{padding:'8px 12px',textAlign:'right',fontWeight:700,color:G}}>{fmtN(pl.total_debit)}</td>
                  <td style={{padding:'8px 12px',textAlign:'right',fontWeight:700,color:'#c0392b'}}>{fmtN(pl.total_credit)}</td>
                  <td style={{padding:'8px 24px',textAlign:'right',fontWeight:700,color:numColor(pl.balance)}}>{fmtN(pl.balance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════ AGED REPORTS ══════════════════════ */
function AgedReport({ type='receivable' }) {
  const data=type==='receivable'?AGED_RECEIVABLE:AGED_PAYABLE;
  const title=type==='receivable'?'Aged Receivable':'Aged Payable';
  const cols=['Not Due','1-30 Days','31-60 Days','61-90 Days','Older'];
  const keys=['current','days_1_30','days_31_60','days_61_90','older'];
  const total=data.reduce((s,r)=>s+r.total,0);
  const agingColor=['#374151','#d97706','#c0392b','#991b1b','#7f1d1d'];

  return(
    <div>
      <RBar title={title} btns={['📅 As of 11/01/2026','📋 All Journals','≡ Posted Entries','In .TSh']}/>
      <Banner/>
      <div style={{maxWidth:920,margin:'24px auto',background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
          <thead>
            <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
              <th style={{padding:'10px 24px',textAlign:'left',color:'#374151',fontWeight:600}}>Partner</th>
              <th style={{padding:'10px 12px',textAlign:'right',color:'#374151',fontWeight:600}}>Total</th>
              {cols.map(c=><th key={c} style={{padding:'10px 12px',textAlign:'right',color:'#374151',fontWeight:600}}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row,i)=>(
              <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}
                onMouseEnter={e=>e.currentTarget.style.background=GBG}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{padding:'9px 24px',fontWeight:500}}>{row.partner}</td>
                <td style={{padding:'9px 12px',textAlign:'right',fontWeight:700}}>{fmtN(row.total)}</td>
                {keys.map((k,ki)=>(
                  <td key={k} style={{padding:'9px 12px',textAlign:'right',color:row[k]>0?agingColor[ki]:'#d1d5db'}}>{fmtN(row[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:'#f9fafb',borderTop:'2px solid #e5e7eb'}}>
              <td style={{padding:'10px 24px',fontWeight:700}}>Total</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,color:G}}>{fmtN(total)}</td>
              {keys.map((k,ki)=>{
                const s=data.reduce((sum,r)=>sum+r[k],0);
                return <td key={k} style={{padding:'10px 12px',textAlign:'right',fontWeight:700,color:s>0?agingColor[ki]:'#d1d5db'}}>{fmtN(s)}</td>;
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════ TAX REPORT ══════════════════════ */
function TaxReport() {
  const totalTax=TAX_REPORT.reduce((s,r)=>s+r.tax,0);
  return(
    <div>
      <RBar title="Tax Report" btns={['📅 Nov 2026','📋 All Journals','≡ Posted Entries','In .TSh']}/>
      <Banner/>
      <div style={{maxWidth:760,margin:'24px auto',background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',overflow:'hidden'}}>
        <div style={{padding:'14px 24px',background:'#f9fafb',borderBottom:'2px solid #e5e7eb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontWeight:700,fontSize:14,color:'#111827'}}>Tax Summary — November 2026</span>
          <span style={{background:GBG,color:G,borderRadius:6,padding:'4px 12px',fontWeight:700,fontSize:13}}>Total Tax: {fmt(totalTax)}</span>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{borderBottom:'1px solid #e5e7eb',background:'#f9fafb'}}>
              {['Tax Name','Tax Code','Taxable Base','Tax Amount'].map((h,i)=>(
                <th key={h} style={{padding:'10px '+(i<2?'24px':'12px'),textAlign:i>1?'right':'left',color:'#6b7280',fontWeight:600,fontSize:12}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TAX_REPORT.map((row,i)=>(
              <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}
                onMouseEnter={e=>e.currentTarget.style.background=GBG}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{padding:'10px 24px',fontWeight:500,color:'#374151'}}>{row.name}</td>
                <td style={{padding:'10px 24px'}}>
                  <span style={{background:'#f3f4f6',color:'#374151',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:600}}>{row.code}</span>
                </td>
                <td style={{padding:'10px 12px',textAlign:'right',color:'#374151'}}>{row.base>0?fmt(row.base):'—'}</td>
                <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,color:row.tax>0?G:'#9ca3af'}}>{row.tax>0?fmt(row.tax):'—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:'#f9fafb',borderTop:'2px solid #e5e7eb'}}>
              <td colSpan={3} style={{padding:'10px 24px',fontWeight:700,fontSize:13}}>Total Tax Payable</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,fontSize:14,color:G}}>{fmt(totalTax)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════ ROOT ══════════════════════ */
export default function Accounting({ sess, out }) {
  /* ── page routing ── */
  const [page, setPage] = useState('dashboard');

  /* ── document state (in-memory, demo-mode) ── */
  const [invoices,   setInvoices]   = useState(INVOICES);
  const [bills,      setBills]      = useState(BILLS);
  const [payments,   setPayments]   = useState(PAYMENTS);
  const [customers,  setCustomers]  = useState(CUSTOMERS);
  const [vendors,    setVendors]    = useState(VENDORS);
  const [jEntries,   setJEntries]   = useState([
    { id:'je_001', no:'JE/2026/00001', date:'2026-10-02', journal:'Sales Journal', state:'posted', ref:'INV/2026/0001', lines:[{account:'1518',name:'Accounts Receivable',debit:2832000,credit:0,partner:'Marriott Hotel Dar'},{account:'4001',name:'Food & Beverage Revenue',debit:0,credit:2400000,partner:''},{account:'6002',name:'VAT Payable (18%)',debit:0,credit:432000,partner:''}] },
    { id:'je_002', no:'JE/2026/00002', date:'2026-10-26', journal:'Purchase Journal', state:'posted', ref:'BILL/2026/0001', lines:[{account:'5001',name:'Cost of Goods Sold',debit:422500,credit:0,partner:''},{account:'6001',name:'Trade Payables',debit:0,credit:422500,partner:'Serengeti Meats'}] },
    { id:'je_003', no:'JE/2026/00003', date:'2026-10-08', journal:'Bank', state:'posted', ref:'TAN-44129', lines:[{account:'5006',name:'Electricity Expenses',debit:180000,credit:0,partner:''},{account:'1031',name:'Bank',debit:0,credit:180000,partner:'TANESCO'}] },
    { id:'je_004', no:'JE/2026/00004', date:'2026-10-29', journal:'Sales Journal', state:'posted', ref:'INV/2026/0003', lines:[{account:'1031',name:'Bank',debit:1050200,credit:0,partner:'Safari Holdings Ltd'},{account:'1518',name:'Accounts Receivable',debit:0,credit:1050200,partner:''}] },
    { id:'je_005', no:'JE/2026/00005', date:'2026-11-01', journal:'Payroll Journal', state:'posted', ref:'PAYROLL-NOV-2026', lines:[{account:'1001',name:'Salaries and Wages Expense',debit:5186000,credit:0,partner:''},{account:'1031',name:'Bank',debit:0,credit:5186000,partner:''}] },
  ]);

  /* ── form / detail overlay state ── */
  // { mode: 'new'|'edit'|'detail', type: 'invoice'|'bill'|'payment'|'customer'|'vendor'|'je', doc: {} }
  const [overlay, setOverlay] = useState(null);

  /* ── helpers ── */
  const goList = () => setOverlay(null);

  const openNew  = (type) => setOverlay({ mode:'new',    type, doc: null });
  const openEdit = (type, doc) => setOverlay({ mode:'edit',   type, doc });
  const openDetail = (type, doc) => setOverlay({ mode:'detail', type, doc });

  const saveInvoice = (doc) => {
    setInvoices(prev => prev.some(i=>i.id===doc.id) ? prev.map(i=>i.id===doc.id?doc:i) : [doc,...prev]);
    setOverlay({ mode:'detail', type:'invoice', doc });
  };
  const saveBill = (doc) => {
    setBills(prev => prev.some(b=>b.id===doc.id) ? prev.map(b=>b.id===doc.id?doc:b) : [doc,...prev]);
    setOverlay({ mode:'detail', type:'bill', doc });
  };
  const savePayment = (doc) => {
    setPayments(prev => prev.some(p=>p.id===doc.id) ? prev.map(p=>p.id===doc.id?doc:p) : [doc,...prev]);
    goList();
  };
  const saveCustomer = (doc) => {
    setCustomers(prev => prev.some(c=>c.id===doc.id) ? prev.map(c=>c.id===doc.id?doc:c) : [doc,...prev]);
    goList();
  };
  const saveVendor = (doc) => {
    setVendors(prev => prev.some(v=>v.id===doc.id) ? prev.map(v=>v.id===doc.id?doc:v) : [doc,...prev]);
    goList();
  };
  const saveJE = (doc) => {
    setJEntries(prev => prev.some(j=>j.id===doc.id) ? prev.map(j=>j.id===doc.id?doc:j) : [doc,...prev]);
    goList();
  };

  /* ── overlay renderer ── */
  const renderOverlay = () => {
    if (!overlay) return null;
    const { mode, type, doc } = overlay;

    /* INVOICE */
    if (type === 'invoice') {
      if (mode === 'detail') return (
        <DocDetail doc={doc}
          onBack={goList}
          onEdit={(d) => setOverlay({ mode:'edit', type:'invoice', doc:d })}/>
      );
      return (
        <InvoiceForm
          initial={mode==='edit' ? doc : null}
          onSave={saveInvoice}
          onBack={goList}
          onDiscard={goList}/>
      );
    }

    /* BILL */
    if (type === 'bill') {
      if (mode === 'detail') return (
        <DocDetail doc={doc}
          onBack={goList}
          onEdit={(d) => setOverlay({ mode:'edit', type:'bill', doc:d })}/>
      );
      return (
        <BillForm
          initial={mode==='edit' ? doc : null}
          onSave={saveBill}
          onBack={goList}
          onDiscard={goList}/>
      );
    }

    /* PAYMENT */
    if (type === 'payment' || type === 'payment_in' || type === 'payment_out') {
      return (
        <PaymentForm
          initial={mode==='edit' ? doc : null}
          direction={type==='payment_out' ? 'outbound' : 'inbound'}
          onSave={savePayment}
          onBack={goList}
          onDiscard={goList}/>
      );
    }

    /* CUSTOMER */
    if (type === 'customer') {
      return (
        <PartnerForm
          initial={mode==='edit' ? doc : null}
          type="customer"
          onSave={saveCustomer}
          onBack={goList}
          onDiscard={goList}/>
      );
    }

    /* VENDOR */
    if (type === 'vendor') {
      return (
        <PartnerForm
          initial={mode==='edit' ? doc : null}
          type="vendor"
          onSave={saveVendor}
          onBack={goList}
          onDiscard={goList}/>
      );
    }

    /* JOURNAL ENTRY */
    if (type === 'je') {
      return (
        <JournalEntryForm
          initial={mode==='edit' ? doc : null}
          onSave={saveJE}
          onBack={goList}
          onDiscard={goList}/>
      );
    }

    return null;
  };

  /* ── main page map ── */
  const pageMap = {
    dashboard:          <Dashboard go={setPage}/>,
    cust_invoices:      <Invoices
                          data={invoices}
                          onNew={()=>openNew('invoice')}
                          onRow={(row)=>openDetail('invoice', row)}/>,
    cust_payments:      <PaymentsView
                          dir="inbound"
                          onNew={()=>openNew('payment_in')}
                          onRow={(row)=>openEdit('payment', row)}/>,
    cust_list:          <Partners
                          type="customer"
                          onNew={()=>openNew('customer')}
                          onRow={(row)=>openEdit('customer', row)}/>,
    vend_bills:         <Bills
                          data={bills}
                          onNew={()=>openNew('bill')}
                          onRow={(row)=>openDetail('bill', row)}/>,
    vend_payments:      <PaymentsView
                          dir="outbound"
                          onNew={()=>openNew('payment_out')}
                          onRow={(row)=>openEdit('payment', row)}/>,
    vend_list:          <Partners
                          type="vendor"
                          onNew={()=>openNew('vendor')}
                          onRow={(row)=>openEdit('vendor', row)}/>,
    journal_entries:    <JournalEntries
                          entries={jEntries}
                          onNew={()=>openNew('je')}
                          onRow={(row)=>openEdit('je', row)}/>,
    chart_of_accounts:  <ChartOfAccounts/>,
    bank:               <BankCash/>,
    rpt_balance_sheet:  <BalanceSheet/>,
    rpt_pl:             <PL/>,
    rpt_cashflow:       <CashFlow/>,
    rpt_trial_balance:  <TrialBalance/>,
    rpt_general_ledger: <GeneralLedger/>,
    rpt_partner_ledger: <PartnerLedger/>,
    rpt_aged_receivable:<AgedReport type="receivable"/>,
    rpt_aged_payable:   <AgedReport type="payable"/>,
    rpt_tax:            <TaxReport/>,
  };

  const currentContent = overlay ? renderOverlay() : (pageMap[page] || <Dashboard go={setPage}/>);

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',fontFamily:'system-ui,sans-serif'}}>
      <Nav active={page} go={(p)=>{ setPage(p); setOverlay(null); }} out={out}/>
      <div style={{flex:1,overflowY:'auto',background:'#f8fafc'}}>
        {currentContent}
      </div>
    </div>
  );
}

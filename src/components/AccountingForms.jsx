/**
 * AccountingForms.jsx
 * Full Odoo-style create/edit forms for: Invoice, Bill, Payment, Customer, Vendor, Journal Entry
 * Reference: zalongwa-odoo-apps / tax_invoice_pdf / zalongwa_account_financial_report
 */
import React, { useState, useRef } from 'react';
import { CHART_OF_ACCOUNTS, CUSTOMERS, VENDORS } from '../data_accounting';

/* ─── theme ─────────────────────────────────────────── */
const G  = '#1C7A4B';
const GH = '#145a36';
const GB = '#f0faf4';

/* ─── helpers ────────────────────────────────────────── */
const today  = () => new Date().toISOString().slice(0,10);
const addDays = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); };
const uid    = () => Math.random().toString(36).slice(2,9).toUpperCase();
const fmt    = n => 'TSh ' + Math.round(n||0).toLocaleString('en-US');
const parseN = v => parseFloat(v)||0;

/* ─── sub-components ─────────────────────────────────── */

/** Odoo-style status bar */
function StatusBar({ states, current }) {
  const idx = states.indexOf(current);
  return (
    <div style={{display:'flex',alignItems:'center',gap:0,background:'#f9fafb',borderBottom:'1px solid #e5e7eb',padding:'0 24px',height:40,overflowX:'auto'}}>
      {states.map((s,i)=>{
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s} style={{display:'flex',alignItems:'center',gap:0,flexShrink:0}}>
            {i>0&&<div style={{width:0,height:0,borderTop:'20px solid transparent',borderBottom:'20px solid transparent',borderLeft:`10px solid ${i<=idx?G:'#e5e7eb'}`,flexShrink:0}}/>}
            <div style={{
              background: active?G : done?GH : '#fff',
              color: active||done?'#fff':'#6b7280',
              padding: i===0?'0 20px 0 14px':'0 20px',
              height:40, display:'flex', alignItems:'center',
              fontSize:12.5, fontWeight: active?700:500,
              borderTop: active||done?'none':'1px solid #e5e7eb',
              borderBottom: active||done?'none':'1px solid #e5e7eb',
              borderRight: i===states.length-1?(active||done?'none':'1px solid #e5e7eb'):'none',
              ...(i===0?{borderLeft:active||done?'none':'1px solid #e5e7eb',borderRadius:'4px 0 0 4px'}:{})
            }}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Form field wrapper */
function Field({ label, required, children, half, note }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4,flex:half?'0 0 calc(50% - 8px)':'1 1 100%',minWidth:half?200:0}}>
      <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'flex',gap:4}}>
        {label}{required&&<span style={{color:'#ef4444'}}>*</span>}
      </label>
      {children}
      {note&&<span style={{fontSize:11,color:'#9ca3af'}}>{note}</span>}
    </div>
  );
}

/** Input */
const Inp = (props) => (
  <input {...props} style={{border:'1px solid #d1d5db',borderRadius:6,padding:'7px 10px',fontSize:13,color:'#374151',outline:'none',width:'100%',boxSizing:'border-box',background:props.readOnly?'#f9fafb':'#fff',...(props.style||{})}}
    onFocus={e=>{ if(!props.readOnly) e.target.style.borderColor=G; e.target.style.boxShadow=`0 0 0 2px ${G}20`; }}
    onBlur={e=>{ e.target.style.borderColor='#d1d5db'; e.target.style.boxShadow='none'; }}
  />
);

/** Select */
const Sel = ({children,...props}) => (
  <select {...props} style={{border:'1px solid #d1d5db',borderRadius:6,padding:'7px 10px',fontSize:13,color:'#374151',outline:'none',width:'100%',background:'#fff',cursor:'pointer',...(props.style||{})}}>
    {children}
  </select>
);

/** Textarea */
const Txt = (props) => (
  <textarea {...props} rows={3} style={{border:'1px solid #d1d5db',borderRadius:6,padding:'7px 10px',fontSize:13,color:'#374151',outline:'none',resize:'vertical',width:'100%',boxSizing:'border-box',...(props.style||{})}}
    onFocus={e=>{ e.target.style.borderColor=G; e.target.style.boxShadow=`0 0 0 2px ${G}20`; }}
    onBlur={e=>{ e.target.style.borderColor='#d1d5db'; e.target.style.boxShadow='none'; }}
  />
);

/** Breadcrumb */
function Breadcrumb({ items }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:6,padding:'10px 24px',borderBottom:'1px solid #e5e7eb',background:'#fff',fontSize:13}}>
      {items.map((item,i)=>(
        <React.Fragment key={i}>
          {i>0&&<span style={{color:'#d1d5db'}}>›</span>}
          <span onClick={item.onClick} style={{color:item.onClick?G:'#374151',cursor:item.onClick?'pointer':'default',fontWeight:i===items.length-1?600:400}}>
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

/** Action buttons row */
function ActionBar({ children }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 24px',borderBottom:'1px solid #e5e7eb',background:'#fff',flexWrap:'wrap'}}>
      {children}
    </div>
  );
}
const BtnPrimary = ({children,...p}) => (
  <button {...p} style={{background:G,color:'#fff',border:'none',borderRadius:6,padding:'7px 18px',cursor:'pointer',fontWeight:600,fontSize:13,...(p.style||{})}}
    onMouseEnter={e=>e.currentTarget.style.background=GH}
    onMouseLeave={e=>e.currentTarget.style.background=G}>
    {children}
  </button>
);
const BtnSecondary = ({children,...p}) => (
  <button {...p} style={{background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:6,padding:'7px 16px',cursor:'pointer',fontWeight:500,fontSize:13,...(p.style||{})}}>
    {children}
  </button>
);
const BtnDanger = ({children,...p}) => (
  <button {...p} style={{background:'#fff',color:'#ef4444',border:'1px solid #fca5a5',borderRadius:6,padding:'7px 16px',cursor:'pointer',fontWeight:500,fontSize:13,...(p.style||{})}}>
    {children}
  </button>
);

/** Section card */
const Card = ({children,style}) => (
  <div style={{background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',marginBottom:16,...(style||{})}}>
    {children}
  </div>
);
const CardHeader = ({title,sub}) => (
  <div style={{padding:'12px 20px',borderBottom:'1px solid #f3f4f6',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
    <span style={{fontWeight:700,fontSize:14,color:'#111827'}}>{title}</span>
    {sub&&<span style={{fontSize:12,color:'#6b7280'}}>{sub}</span>}
  </div>
);

/** Inline editable lines table */
function LinesTable({ lines, setLines, type='invoice' }) {
  const accounts = CHART_OF_ACCOUNTS.filter(a => ['income','expense','asset'].includes(a.type));
  const TAX_OPTS = [{ v:0,l:'No Tax' },{ v:18,l:'18% VAT' },{ v:8,l:'8% VAT' },{ v:5,l:'5% Withholding' }];

  const addLine = () => setLines(prev => [...prev, {
    id: uid(), description:'', account: type==='invoice'?'acc_4001':'acc_5001',
    qty:1, price:0, tax:18, subtotal:0
  }]);

  const updateLine = (id, key, val) => setLines(prev => prev.map(l => {
    if (l.id !== id) return l;
    const upd = {...l, [key]: val};
    upd.subtotal = parseN(upd.qty) * parseN(upd.price);
    return upd;
  }));

  const removeLine = id => setLines(prev => prev.filter(l => l.id !== id));

  const subtotal = lines.reduce((s,l) => s + parseN(l.qty)*parseN(l.price), 0);
  const taxAmt   = lines.reduce((s,l) => s + (parseN(l.qty)*parseN(l.price))*(parseN(l.tax)/100), 0);
  const total    = subtotal + taxAmt;

  return (
    <div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
              {['Description','Account','Qty','Unit Price','Tax %','Amount'].map((h,i)=>(
                <th key={h} style={{padding:'9px '+(i===0?'16px':'10px'),textAlign:i>1?'right':'left',color:'#6b7280',fontWeight:600,fontSize:12}}>{h}</th>
              ))}
              <th style={{width:40}}/>
            </tr>
          </thead>
          <tbody>
            {lines.map((line,li) => {
              const lineTotal = parseN(line.qty)*parseN(line.price);
              return (
                <tr key={line.id} style={{borderBottom:'1px solid #f3f4f6'}}
                  onMouseEnter={e=>e.currentTarget.style.background=GB}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{padding:'6px 16px 6px 16px',minWidth:200}}>
                    <Inp value={line.description} onChange={e=>updateLine(line.id,'description',e.target.value)} placeholder="Product or service description"/>
                  </td>
                  <td style={{padding:'6px 10px',minWidth:180}}>
                    <Sel value={line.account} onChange={e=>updateLine(line.id,'account',e.target.value)}>
                      {accounts.map(a=><option key={a.id} value={a.id}>{a.code} {a.name}</option>)}
                    </Sel>
                  </td>
                  <td style={{padding:'6px 10px',minWidth:80}}>
                    <Inp type="number" value={line.qty} min="0" step="0.01" onChange={e=>updateLine(line.id,'qty',e.target.value)} style={{textAlign:'right'}}/>
                  </td>
                  <td style={{padding:'6px 10px',minWidth:130}}>
                    <Inp type="number" value={line.price} min="0" step="1" onChange={e=>updateLine(line.id,'price',e.target.value)} style={{textAlign:'right'}}/>
                  </td>
                  <td style={{padding:'6px 10px',minWidth:110}}>
                    <Sel value={line.tax} onChange={e=>updateLine(line.id,'tax',e.target.value)}>
                      {TAX_OPTS.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}
                    </Sel>
                  </td>
                  <td style={{padding:'6px 10px',textAlign:'right',fontWeight:600,color:'#374151',whiteSpace:'nowrap'}}>
                    {fmt(lineTotal)}
                  </td>
                  <td style={{padding:'6px 8px',textAlign:'center'}}>
                    <button onClick={()=>removeLine(line.id)} style={{background:'transparent',border:'none',cursor:'pointer',color:'#ef4444',fontSize:16,lineHeight:1,padding:'2px 4px'}} title="Remove line">×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add line */}
      <div style={{padding:'10px 16px',borderTop:'1px solid #f3f4f6'}}>
        <button onClick={addLine} style={{background:'transparent',color:G,border:`1px dashed ${G}60`,borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:600}}>
          + Add a line
        </button>
      </div>

      {/* Totals */}
      <div style={{display:'flex',justifyContent:'flex-end',padding:'16px 20px',borderTop:'2px solid #e5e7eb'}}>
        <table style={{borderCollapse:'collapse',fontSize:13,minWidth:280}}>
          <tbody>
            <tr>
              <td style={{padding:'5px 20px 5px 0',color:'#6b7280',textAlign:'right'}}>Subtotal</td>
              <td style={{padding:'5px 0',textAlign:'right',fontWeight:500,color:'#374151',minWidth:140}}>{fmt(subtotal)}</td>
            </tr>
            <tr>
              <td style={{padding:'5px 20px 5px 0',color:'#6b7280',textAlign:'right'}}>Tax</td>
              <td style={{padding:'5px 0',textAlign:'right',fontWeight:500,color:'#374151'}}>{fmt(taxAmt)}</td>
            </tr>
            <tr style={{borderTop:'2px solid #e5e7eb'}}>
              <td style={{padding:'10px 20px 10px 0',color:'#111827',fontWeight:700,fontSize:14,textAlign:'right'}}>Total</td>
              <td style={{padding:'10px 0',textAlign:'right',fontWeight:800,fontSize:16,color:G}}>{fmt(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Journal lines table (debit/credit) */
function JELinesTable({ lines, setLines }) {
  const accounts = CHART_OF_ACCOUNTS;
  const all_partners = [...CUSTOMERS.map(c=>({id:c.id,name:c.name,type:'Customer'})), ...VENDORS.map(v=>({id:v.id,name:v.name,type:'Vendor'}))];

  const addLine = () => setLines(prev=>[...prev,{id:uid(),account:'acc_1518',partner:'',label:'',debit:0,credit:0}]);
  const updateLine = (id,key,val) => setLines(prev=>prev.map(l=>l.id===id?{...l,[key]:val}:l));
  const removeLine = id => setLines(prev=>prev.filter(l=>l.id!==id));

  const totalD = lines.reduce((s,l)=>s+parseN(l.debit),0);
  const totalC = lines.reduce((s,l)=>s+parseN(l.credit),0);
  const balanced = Math.abs(totalD-totalC) < 0.01;

  return (
    <div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
              {['Account','Partner / Label','Label','Debit','Credit'].map((h,i)=>(
                <th key={h} style={{padding:'9px '+(i===0?'16px':'10px'),textAlign:i>2?'right':'left',color:'#6b7280',fontWeight:600,fontSize:12}}>{h}</th>
              ))}
              <th style={{width:40}}/>
            </tr>
          </thead>
          <tbody>
            {lines.map(line=>(
              <tr key={line.id} style={{borderBottom:'1px solid #f3f4f6'}}
                onMouseEnter={e=>e.currentTarget.style.background=GB}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{padding:'6px 16px',minWidth:200}}>
                  <Sel value={line.account} onChange={e=>updateLine(line.id,'account',e.target.value)}>
                    {accounts.map(a=><option key={a.id} value={a.id}>{a.code} {a.name}</option>)}
                  </Sel>
                </td>
                <td style={{padding:'6px 10px',minWidth:160}}>
                  <Sel value={line.partner} onChange={e=>updateLine(line.id,'partner',e.target.value)}>
                    <option value="">—</option>
                    {all_partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </Sel>
                </td>
                <td style={{padding:'6px 10px',minWidth:180}}>
                  <Inp value={line.label} onChange={e=>updateLine(line.id,'label',e.target.value)} placeholder="Label…"/>
                </td>
                <td style={{padding:'6px 10px',minWidth:130}}>
                  <Inp type="number" value={line.debit||''} min="0" step="1" onChange={e=>updateLine(line.id,'debit',e.target.value)} style={{textAlign:'right'}}/>
                </td>
                <td style={{padding:'6px 10px',minWidth:130}}>
                  <Inp type="number" value={line.credit||''} min="0" step="1" onChange={e=>updateLine(line.id,'credit',e.target.value)} style={{textAlign:'right'}}/>
                </td>
                <td style={{padding:'6px 8px',textAlign:'center'}}>
                  <button onClick={()=>removeLine(line.id)} style={{background:'transparent',border:'none',cursor:'pointer',color:'#ef4444',fontSize:16,padding:'2px 4px'}}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{padding:'10px 16px',borderTop:'1px solid #f3f4f6'}}>
        <button onClick={addLine} style={{background:'transparent',color:G,border:`1px dashed ${G}60`,borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:600}}>
          + Add a line
        </button>
      </div>
      {/* Totals */}
      <div style={{display:'flex',justifyContent:'flex-end',gap:16,padding:'14px 20px',borderTop:'2px solid #e5e7eb',alignItems:'center'}}>
        {!balanced && <span style={{color:'#ef4444',fontSize:12,fontWeight:600}}>⚠ Not balanced (diff: {fmt(Math.abs(totalD-totalC))})</span>}
        {balanced && totalD>0 && <span style={{color:G,fontSize:12,fontWeight:600}}>✓ Balanced</span>}
        <table style={{borderCollapse:'collapse',fontSize:13}}>
          <tbody>
            <tr style={{borderTop:'2px solid #e5e7eb'}}>
              <td style={{padding:'8px 20px 8px 0',color:'#374151',fontWeight:700,textAlign:'right'}}>Total Debit</td>
              <td style={{padding:'8px 0',textAlign:'right',fontWeight:700,color:G,minWidth:140}}>{fmt(totalD)}</td>
            </tr>
            <tr>
              <td style={{padding:'4px 20px 8px 0',color:'#374151',fontWeight:700,textAlign:'right'}}>Total Credit</td>
              <td style={{padding:'4px 0 8px',textAlign:'right',fontWeight:700,color:'#c0392b'}}>{fmt(totalC)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   INVOICE FORM  (out_invoice)
═══════════════════════════════════════════════════════ */
export function InvoiceForm({ initial, onSave, onBack, onDiscard }) {
  const isNew = !initial?.id;
  const [state, setState] = useState(initial?.state||'draft');
  const [partner, setPartner] = useState(initial?.partnerId||'');
  const [invDate, setInvDate] = useState(initial?.date||today());
  const [dueDate, setDueDate] = useState(initial?.due||addDays(today(),30));
  const [ref, setRef] = useState(initial?.ref||'');
  const [notes, setNotes] = useState(initial?.notes||'');
  const [payTerms, setPayTerms] = useState(initial?.payTerms||'Net 30');
  const [journal, setJournal] = useState(initial?.journal||'Sales Journal');
  const [lines, setLines] = useState(initial?.lines?.map(l=>({...l,id:l.id||uid()})) || [{id:uid(),description:'',account:'acc_4001',qty:1,price:0,tax:18,subtotal:0}]);

  const subtotal = lines.reduce((s,l)=>s+parseN(l.qty)*parseN(l.price),0);
  const taxAmt   = lines.reduce((s,l)=>s+(parseN(l.qty)*parseN(l.price))*(parseN(l.tax)/100),0);
  const total    = subtotal+taxAmt;
  const amountDue = initial?.balance ?? total;

  const partnerObj = CUSTOMERS.find(c=>c.id===partner);
  const docNo = isNew ? (state==='draft'?'Draft':'INV/'+new Date().getFullYear()+'/'+Math.floor(Math.random()*9000+1000)) : initial.no;

  const handleConfirm = () => { setState('posted'); onSave&&onSave({...buildDoc(), state:'posted'}); };
  const handleReset   = () => setState('draft');
  const handleSave    = () => onSave&&onSave(buildDoc());

  const buildDoc = () => ({
    id: initial?.id || 'inv_'+uid(),
    no: docNo, date:invDate, due:dueDate, partnerId:partner,
    partner: partnerObj?.name||'', ref, notes, payTerms, journal,
    type:'out_invoice', state,
    lines: lines.map(l=>({...l})),
    subtotal, tax_amount:taxAmt, total, balance: state==='paid'?0:amountDue,
    paid: state==='paid'?total:initial?.paid||0,
  });

  return (
    <div style={{background:'#f8fafc',minHeight:'100vh'}}>
      {/* Breadcrumb */}
      <Breadcrumb items={[{label:'Invoices',onClick:onBack},{label:isNew?'New Invoice':docNo}]}/>

      {/* Action bar */}
      <ActionBar>
        {state==='draft'&&<BtnPrimary onClick={handleConfirm}>Confirm</BtnPrimary>}
        {state==='posted'&&<BtnSecondary onClick={()=>setState('paid')}>Register Payment</BtnSecondary>}
        {state==='posted'&&<BtnSecondary>Send &amp; Print</BtnSecondary>}
        {state==='draft'&&<BtnSecondary onClick={handleSave}>Save</BtnSecondary>}
        {state==='draft'&&<BtnDanger onClick={onDiscard||onBack}>Discard</BtnDanger>}
        {state==='posted'&&<BtnSecondary onClick={()=>{}}>PDF</BtnSecondary>}
        {state!=='draft'&&<BtnSecondary onClick={handleReset}>Reset to Draft</BtnSecondary>}
        <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
          {state==='posted'&&<div style={{background:'#fef3c7',color:'#92400e',borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:600}}>
            Amount Due: {fmt(amountDue)}
          </div>}
          {state==='paid'&&<div style={{background:'#d1fae5',color:'#065f46',borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:700}}>✓ Paid</div>}
        </div>
      </ActionBar>

      {/* Status bar */}
      <StatusBar states={['draft','posted','paid']} current={state}/>

      <div style={{maxWidth:1100,margin:'24px auto',padding:'0 16px'}}>

        {/* Header card */}
        <Card>
          <div style={{padding:24}}>
            {/* Doc title */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
              <div>
                <div style={{fontSize:12,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>Customer Invoice</div>
                <div style={{fontSize:22,fontWeight:700,color:'#111827'}}>{docNo}</div>
              </div>
              <div style={{textAlign:'right',fontSize:12,color:'#6b7280'}}>
                <div style={{fontWeight:700,color:'#374151',fontSize:15}}>Safari Grill &amp; Lounge</div>
                <div>Masaki, Dar es Salaam, Tanzania</div>
                <div>TIN: TZ-TIN-10001</div>
              </div>
            </div>

            {/* 2-col fields */}
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              <Field label="Customer" required half>
                <Sel value={partner} onChange={e=>setPartner(e.target.value)} disabled={state!=='draft'}>
                  <option value="">— Select Customer —</option>
                  {CUSTOMERS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </Sel>
              </Field>
              <Field label="Invoice Date" required half>
                <Inp type="date" value={invDate} onChange={e=>setInvDate(e.target.value)} readOnly={state!=='draft'}/>
              </Field>
              <Field label="Payment Terms" half>
                <Sel value={payTerms} onChange={e=>setPayTerms(e.target.value)} disabled={state!=='draft'}>
                  {['Immediate','Net 7','Net 15','Net 30','Net 60'].map(t=><option key={t}>{t}</option>)}
                </Sel>
              </Field>
              <Field label="Due Date" half>
                <Inp type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} readOnly={state!=='draft'}/>
              </Field>
              <Field label="Source Document / PO Number" half>
                <Inp value={ref} onChange={e=>setRef(e.target.value)} placeholder="e.g. PO-2026-001" readOnly={state!=='draft'}/>
              </Field>
              <Field label="Journal" half>
                <Sel value={journal} onChange={e=>setJournal(e.target.value)} disabled={state!=='draft'}>
                  {['Sales Journal','Cash','Bank','Miscellaneous'].map(j=><option key={j}>{j}</option>)}
                </Sel>
              </Field>
            </div>

            {/* Customer address block */}
            {partnerObj&&(
              <div style={{marginTop:16,padding:'12px 16px',background:'#f9fafb',borderRadius:8,border:'1px solid #e5e7eb',fontSize:12.5}}>
                <div style={{fontWeight:700,color:'#374151',marginBottom:4}}>Bill To</div>
                <div style={{color:'#374151',fontWeight:600}}>{partnerObj.name}</div>
                <div style={{color:'#6b7280'}}>{partnerObj.city}, Tanzania</div>
                <div style={{color:'#6b7280'}}>{partnerObj.phone} · {partnerObj.email}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Lines card */}
        <Card>
          <CardHeader title="Invoice Lines"/>
          <LinesTable lines={lines} setLines={state==='draft'?setLines:()=>{}} type="invoice"/>
        </Card>

        {/* Notes & Terms */}
        <Card>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
            <div style={{padding:20,borderRight:'1px solid #f3f4f6'}}>
              <Field label="Internal Notes">
                <Txt value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Internal notes visible only to staff…" readOnly={state!=='draft'}/>
              </Field>
            </div>
            <div style={{padding:20}}>
              <Field label="Terms &amp; Conditions">
                <Txt placeholder="Payment terms, bank details, legal notes…" rows={3}/>
              </Field>
              <div style={{marginTop:12,padding:'12px 16px',background:'#f9fafb',borderRadius:8,border:'1px solid #e5e7eb',fontSize:12.5}}>
                <div style={{marginBottom:4,display:'flex',justifyContent:'space-between'}}>
                  <span style={{color:'#6b7280'}}>Bank:</span>
                  <span style={{fontWeight:600,color:'#374151'}}>CRDB Business Account</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{color:'#6b7280'}}>Account No.:</span>
                  <span style={{fontWeight:600,color:'#374151'}}>0150194874500</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{color:'#6b7280'}}>SWIFT/BIC:</span>
                  <span style={{fontWeight:600,color:'#374151'}}>CRDBTZTZ</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Chatter / log */}
        <Card>
          <CardHeader title="Activity Log"/>
          <div style={{padding:16}}>
            {[
              { user:'System', msg: isNew?'Invoice created':'Invoice loaded', time: today(), icon:'📄' },
              ...(state==='posted'?[{user:'System',msg:'Invoice confirmed and posted to accounting',time:today(),icon:'✅'}]:[]),
              ...(state==='paid'?[{user:'System',msg:'Payment registered. Invoice marked as paid.',time:today(),icon:'💰'}]:[]),
            ].map((ev,i)=>(
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:GB,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{ev.icon}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:'#374151'}}>{ev.user}</div>
                  <div style={{fontSize:12.5,color:'#6b7280',marginTop:2}}>{ev.msg}</div>
                  <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>{ev.time}</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:12,display:'flex',gap:8}}>
              <Inp placeholder="Write a note…" style={{flex:1}}/>
              <BtnPrimary>Send</BtnPrimary>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BILL FORM  (in_invoice)
═══════════════════════════════════════════════════════ */
export function BillForm({ initial, onSave, onBack, onDiscard }) {
  const isNew = !initial?.id;
  const [state, setState] = useState(initial?.state||'draft');
  const [partner, setPartner] = useState(initial?.partnerId||'');
  const [billDate, setBillDate] = useState(initial?.date||today());
  const [dueDate,  setDueDate]  = useState(initial?.due||addDays(today(),30));
  const [ref,      setRef]      = useState(initial?.ref||'');
  const [notes,    setNotes]    = useState(initial?.notes||'');
  const [journal,  setJournal]  = useState(initial?.journal||'Purchase Journal');
  const [lines,    setLines]    = useState(initial?.lines?.map(l=>({...l,id:l.id||uid()}))||[{id:uid(),description:'',account:'acc_5001',qty:1,price:0,tax:0,subtotal:0}]);

  const subtotal = lines.reduce((s,l)=>s+parseN(l.qty)*parseN(l.price),0);
  const taxAmt   = lines.reduce((s,l)=>s+(parseN(l.qty)*parseN(l.price))*(parseN(l.tax)/100),0);
  const total    = subtotal+taxAmt;
  const vendorObj= VENDORS.find(v=>v.id===partner);
  const docNo    = isNew?'Draft':initial?.no||'BILL/'+new Date().getFullYear()+'/'+Math.floor(Math.random()*9000+1000);

  const handleConfirm = () => { setState('posted'); onSave&&onSave({...buildDoc(),state:'posted'}); };
  const handleSave    = () => onSave&&onSave(buildDoc());

  const buildDoc = () => ({
    id: initial?.id||'bill_'+uid(),
    no:docNo, date:billDate, due:dueDate, partnerId:partner,
    partner:vendorObj?.name||'', ref, notes, journal,
    type:'in_invoice', state, lines:lines.map(l=>({...l})),
    subtotal, tax_amount:taxAmt, total, balance:state==='paid'?0:total,
    paid:state==='paid'?total:0,
  });

  return (
    <div style={{background:'#f8fafc',minHeight:'100vh'}}>
      <Breadcrumb items={[{label:'Vendor Bills',onClick:onBack},{label:isNew?'New Bill':docNo}]}/>
      <ActionBar>
        {state==='draft'&&<BtnPrimary onClick={handleConfirm}>Confirm</BtnPrimary>}
        {state==='posted'&&<BtnSecondary onClick={()=>setState('paid')}>Register Payment</BtnSecondary>}
        {state==='draft'&&<BtnSecondary onClick={handleSave}>Save</BtnSecondary>}
        {state==='draft'&&<BtnDanger onClick={onDiscard||onBack}>Discard</BtnDanger>}
        {state!=='draft'&&<BtnSecondary onClick={()=>setState('draft')}>Reset to Draft</BtnSecondary>}
        {state==='posted'&&<div style={{marginLeft:'auto',background:'#fef3c7',color:'#92400e',borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:600}}>Amount Due: {fmt(total)}</div>}
        {state==='paid'&&<div style={{marginLeft:'auto',background:'#d1fae5',color:'#065f46',borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:700}}>✓ Paid</div>}
      </ActionBar>
      <StatusBar states={['draft','posted','paid']} current={state}/>

      <div style={{maxWidth:1100,margin:'24px auto',padding:'0 16px'}}>
        <Card>
          <div style={{padding:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
              <div>
                <div style={{fontSize:12,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>Vendor Bill</div>
                <div style={{fontSize:22,fontWeight:700,color:'#111827'}}>{docNo}</div>
              </div>
              <div style={{textAlign:'right',fontSize:12,color:'#6b7280'}}>
                <div style={{fontWeight:700,color:'#374151',fontSize:15}}>Safari Grill &amp; Lounge</div>
                <div>Masaki, Dar es Salaam</div>
              </div>
            </div>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              <Field label="Vendor" required half>
                <Sel value={partner} onChange={e=>setPartner(e.target.value)} disabled={state!=='draft'}>
                  <option value="">— Select Vendor —</option>
                  {VENDORS.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
                </Sel>
              </Field>
              <Field label="Bill Date" required half>
                <Inp type="date" value={billDate} onChange={e=>setBillDate(e.target.value)} readOnly={state!=='draft'}/>
              </Field>
              <Field label="Due Date" half>
                <Inp type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} readOnly={state!=='draft'}/>
              </Field>
              <Field label="Journal" half>
                <Sel value={journal} onChange={e=>setJournal(e.target.value)} disabled={state!=='draft'}>
                  {['Purchase Journal','Cash','Bank','Miscellaneous'].map(j=><option key={j}>{j}</option>)}
                </Sel>
              </Field>
              <Field label="Vendor Bill Reference / Source" half>
                <Inp value={ref} onChange={e=>setRef(e.target.value)} placeholder="Vendor's invoice number…" readOnly={state!=='draft'}/>
              </Field>
            </div>
            {vendorObj&&(
              <div style={{marginTop:16,padding:'12px 16px',background:'#f9fafb',borderRadius:8,border:'1px solid #e5e7eb',fontSize:12.5}}>
                <div style={{fontWeight:700,color:'#374151',marginBottom:4}}>Vendor Details</div>
                <div style={{color:'#374151',fontWeight:600}}>{vendorObj.name}</div>
                <div style={{color:'#6b7280'}}>{vendorObj.city} · {vendorObj.terms}</div>
                <div style={{color:'#6b7280'}}>{vendorObj.phone} · {vendorObj.email}</div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Bill Lines"/>
          <LinesTable lines={lines} setLines={state==='draft'?setLines:()=>{}} type="bill"/>
        </Card>

        <Card>
          <div style={{padding:20}}>
            <Field label="Notes">
              <Txt value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Internal notes…" readOnly={state!=='draft'}/>
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAYMENT FORM
═══════════════════════════════════════════════════════ */
export function PaymentForm({ initial, direction='inbound', onSave, onBack, onDiscard }) {
  const isNew = !initial?.id;
  const [state,   setState]   = useState(initial?.state||'draft');
  const [partner, setPartner] = useState(initial?.partner||'');
  const [amount,  setAmount]  = useState(initial?.amount||'');
  const [date,    setDate]    = useState(initial?.date||today());
  const [method,  setMethod]  = useState(initial?.method||'bank');
  const [memo,    setMemo]    = useState(initial?.memo||'');
  const [journal, setJournal] = useState(initial?.journal||'Bank');
  const [ref,     setRef]     = useState(initial?.ref||'');

  const dir     = initial?.type === 'outbound' ? 'outbound' : direction;
  const isIn    = dir === 'inbound';
  const partners= isIn ? CUSTOMERS : VENDORS;
  const docNo   = isNew ? 'New Payment' : (initial?.no||'PAY-'+uid());
  const fmt2    = v => 'TSh '+(parseN(v)).toLocaleString('en-US');

  const handlePost = () => { setState('posted'); onSave&&onSave(buildDoc()); };
  const handleSave = () => onSave&&onSave(buildDoc());

  const buildDoc = () => ({
    id: initial?.id||'pay_'+uid(),
    no: docNo, date, partner, amount:parseN(amount),
    type: dir, method, memo, journal, ref, state,
  });

  return (
    <div style={{background:'#f8fafc',minHeight:'100vh'}}>
      <Breadcrumb items={[{label:isIn?'Customer Payments':'Vendor Payments',onClick:onBack},{label:isNew?`New ${isIn?'Customer':'Vendor'} Payment`:docNo}]}/>
      <ActionBar>
        {state==='draft'&&<BtnPrimary onClick={handlePost}>Confirm Payment</BtnPrimary>}
        {state==='draft'&&<BtnSecondary onClick={handleSave}>Save</BtnSecondary>}
        {state==='draft'&&<BtnDanger onClick={onDiscard||onBack}>Discard</BtnDanger>}
        {state==='posted'&&<BtnSecondary>Print Receipt</BtnSecondary>}
        {state==='posted'&&<BtnSecondary onClick={()=>setState('draft')}>Reset to Draft</BtnSecondary>}
        {state==='posted'&&<div style={{marginLeft:'auto',background:'#d1fae5',color:'#065f46',borderRadius:6,padding:'5px 14px',fontSize:13,fontWeight:700}}>✓ Posted</div>}
      </ActionBar>
      <StatusBar states={['draft','posted']} current={state}/>

      <div style={{maxWidth:780,margin:'32px auto',padding:'0 16px'}}>
        <Card>
          <CardHeader title={isIn ? '📥 Incoming Payment' : '📤 Outgoing Payment'}/>
          <div style={{padding:24,display:'flex',flexDirection:'column',gap:16}}>
            {/* Payment type toggle */}
            <div style={{display:'flex',gap:0,border:'1px solid #d1d5db',borderRadius:8,overflow:'hidden',width:'fit-content'}}>
              {['inbound','outbound'].map(d=>(
                <button key={d} onClick={()=>{}} disabled={state!=='draft'}
                  style={{padding:'8px 20px',background:dir===d?G:'#fff',color:dir===d?'#fff':'#374151',border:'none',cursor:'pointer',fontWeight:dir===d?600:400,fontSize:13}}>
                  {d==='inbound'?'📥 Receive Money':'📤 Send Money'}
                </button>
              ))}
            </div>

            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              <Field label={isIn?'Customer':'Vendor'} required half>
                <Sel value={partner} onChange={e=>setPartner(e.target.value)} disabled={state!=='draft'}>
                  <option value="">— Select {isIn?'Customer':'Vendor'} —</option>
                  {partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </Sel>
              </Field>
              <Field label="Payment Date" required half>
                <Inp type="date" value={date} onChange={e=>setDate(e.target.value)} readOnly={state!=='draft'}/>
              </Field>
              <Field label="Amount" required half>
                <div style={{display:'flex',gap:0}}>
                  <div style={{background:'#f3f4f6',border:'1px solid #d1d5db',borderRight:'none',borderRadius:'6px 0 0 6px',padding:'7px 12px',fontSize:13,color:'#6b7280',whiteSpace:'nowrap'}}>TSh</div>
                  <Inp type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0" min="0" step="1000" readOnly={state!=='draft'} style={{borderRadius:'0 6px 6px 0',textAlign:'right',fontSize:16,fontWeight:700}}/>
                </div>
              </Field>
              <Field label="Payment Method" half>
                <Sel value={method} onChange={e=>setMethod(e.target.value)} disabled={state!=='draft'}>
                  {['bank','cash','momo','cheque','card'].map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                </Sel>
              </Field>
              <Field label="Journal" required half>
                <Sel value={journal} onChange={e=>setJournal(e.target.value)} disabled={state!=='draft'}>
                  {['Bank','Cash','Mobile Money','Cheque'].map(j=><option key={j}>{j}</option>)}
                </Sel>
              </Field>
              <Field label="Reference / Transaction ID" half>
                <Inp value={ref} onChange={e=>setRef(e.target.value)} placeholder="e.g. TX9912ABC" readOnly={state!=='draft'}/>
              </Field>
            </div>

            <Field label="Memo">
              <Inp value={memo} onChange={e=>setMemo(e.target.value)} placeholder="Payment description or invoice reference…" readOnly={state!=='draft'}/>
            </Field>

            {/* Summary box */}
            {parseN(amount)>0&&(
              <div style={{background:isIn?GB:'#fff7ed',border:`1px solid ${isIn?G+'40':'#f59e0b40'}`,borderRadius:8,padding:'16px 20px'}}>
                <div style={{fontSize:12,color:'#6b7280',marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>Payment Summary</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:13,color:'#374151'}}>{partners.find(p=>p.id===partner)?.name||'Partner'}</div>
                    <div style={{fontSize:12,color:'#6b7280'}}>{method.toUpperCase()} · {date}</div>
                  </div>
                  <div style={{fontSize:26,fontWeight:800,color:isIn?G:'#f59e0b'}}>{isIn?'+':'-'}{fmt2(amount)}</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PARTNER FORM  (customer or vendor)
═══════════════════════════════════════════════════════ */
export function PartnerForm({ initial, type='customer', onSave, onBack, onDiscard }) {
  const isNew = !initial?.id;
  const [name,      setName]      = useState(initial?.name||'');
  const [ptype,     setPtype]     = useState(initial?.type||'company');
  const [ref,       setRef]       = useState(initial?.ref||'');
  const [phone,     setPhone]     = useState(initial?.phone||'');
  const [email,     setEmail]     = useState(initial?.email||'');
  const [city,      setCity]      = useState(initial?.city||'');
  const [country,   setCountry]   = useState(initial?.country||'TZ');
  const [tin,       setTin]       = useState(initial?.tin||'');
  const [vrn,       setVrn]       = useState(initial?.vrn||'');
  const [terms,     setTerms]     = useState(initial?.terms||'Net 30');
  const [bank,      setBank]      = useState(initial?.bank||'');
  const [bankAcc,   setBankAcc]   = useState(initial?.bankAcc||'');
  const [notes,     setNotes]     = useState(initial?.notes||'');
  const [tab,       setTab]       = useState('general');

  const isCustomer = type==='customer';
  const title = isCustomer ? 'Customer' : 'Vendor';

  const buildDoc = () => ({
    id: initial?.id||'partner_'+uid(),
    name, type:ptype, ref: ref||(isCustomer?'CUST-'+uid():'VEND-'+uid()),
    phone, email, city, country, tin, vrn, terms, bank, bankAcc, notes,
    balance:0, overdue:0,
  });

  const TABS = ['general','accounting','bank','notes'];

  return (
    <div style={{background:'#f8fafc',minHeight:'100vh'}}>
      <Breadcrumb items={[{label:`${title}s`,onClick:onBack},{label:isNew?`New ${title}`:name||'Unnamed'}]}/>
      <ActionBar>
        <BtnPrimary onClick={()=>onSave&&onSave(buildDoc())}>Save</BtnPrimary>
        <BtnDanger onClick={onDiscard||onBack}>Discard</BtnDanger>
      </ActionBar>

      <div style={{maxWidth:1000,margin:'24px auto',padding:'0 16px'}}>
        {/* Avatar + name header */}
        <Card>
          <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:20}}>
            <div style={{width:72,height:72,borderRadius:12,background:isCustomer?GB:'#fdf4ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,border:'1px solid #e5e7eb',flexShrink:0}}>
              {ptype==='company'?'🏢':'👤'}
            </div>
            <div style={{flex:1}}>
              <Inp value={name} onChange={e=>setName(e.target.value)} placeholder={`${title} Name`} style={{fontSize:22,fontWeight:700,border:'none',borderBottom:'2px solid #e5e7eb',borderRadius:0,padding:'4px 0',background:'transparent'}}/>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                {['company','individual'].map(pt=>(
                  <button key={pt} onClick={()=>setPtype(pt)}
                    style={{background:ptype===pt?G:'#f3f4f6',color:ptype===pt?'#fff':'#374151',border:'none',borderRadius:16,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:ptype===pt?600:400}}>
                    {pt==='company'?'🏢 Company':'👤 Individual'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{textAlign:'right',fontSize:12,color:'#6b7280'}}>
              <div style={{fontWeight:600,color:'#374151',fontSize:13}}>{isCustomer?'Customer':'Vendor'}</div>
              {ref&&<div style={{marginTop:2}}>{ref}</div>}
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',borderBottom:'2px solid #e5e7eb',padding:'0 24px'}}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 16px',background:'transparent',border:'none',borderBottom:tab===t?`2px solid ${G}`:'2px solid transparent',color:tab===t?G:'#6b7280',fontWeight:tab===t?600:400,cursor:'pointer',fontSize:13,textTransform:'capitalize',marginBottom:-2}}>
                {t}
              </button>
            ))}
          </div>

          <div style={{padding:24}}>
            {tab==='general'&&(
              <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                <Field label="Phone" half><Inp value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+255 7XX XXX XXX"/></Field>
                <Field label="Email" half><Inp type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="contact@company.tz"/></Field>
                <Field label="City" half><Inp value={city} onChange={e=>setCity(e.target.value)} placeholder="Dar es Salaam"/></Field>
                <Field label="Country" half>
                  <Sel value={country} onChange={e=>setCountry(e.target.value)}>
                    <option value="TZ">Tanzania</option>
                    <option value="KE">Kenya</option>
                    <option value="UG">Uganda</option>
                    <option value="RW">Rwanda</option>
                  </Sel>
                </Field>
                <Field label="Reference" half><Inp value={ref} onChange={e=>setRef(e.target.value)} placeholder="Internal reference"/></Field>
                <Field label="Payment Terms" half>
                  <Sel value={terms} onChange={e=>setTerms(e.target.value)}>
                    {['Immediate','Net 7','Net 15','Net 30','Net 60','Cash'].map(t=><option key={t}>{t}</option>)}
                  </Sel>
                </Field>
              </div>
            )}
            {tab==='accounting'&&(
              <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                <Field label="TIN (Tax Identification Number)" half><Inp value={tin} onChange={e=>setTin(e.target.value)} placeholder="TZ-TIN-XXXXX"/></Field>
                <Field label="VRN (VAT Registration Number)" half><Inp value={vrn} onChange={e=>setVrn(e.target.value)} placeholder="10-XXXXXXX-X"/></Field>
                <Field label={isCustomer?'Account Receivable':'Account Payable'} half>
                  <Sel>
                    {CHART_OF_ACCOUNTS.filter(a=>isCustomer?a.type==='receivable':a.type==='payable').map(a=>(
                      <option key={a.id}>{a.code} {a.name}</option>
                    ))}
                  </Sel>
                </Field>
                <Field label="Fiscal Position" half>
                  <Sel><option>Tanzania Standard</option><option>Export (Zero-rated)</option></Sel>
                </Field>
              </div>
            )}
            {tab==='bank'&&(
              <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                <Field label="Bank Name" half><Inp value={bank} onChange={e=>setBank(e.target.value)} placeholder="e.g. CRDB Bank"/></Field>
                <Field label="Account Number" half><Inp value={bankAcc} onChange={e=>setBankAcc(e.target.value)} placeholder="e.g. 0150194874500"/></Field>
                <Field label="Account Holder" half><Inp placeholder="e.g. Company Limited"/></Field>
                <Field label="SWIFT / BIC" half><Inp placeholder="e.g. CRDBTZTZ"/></Field>
              </div>
            )}
            {tab==='notes'&&(
              <Field label="Internal Notes">
                <Txt value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Internal notes about this partner…" style={{minHeight:120}}/>
              </Field>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   JOURNAL ENTRY FORM
═══════════════════════════════════════════════════════ */
export function JournalEntryForm({ initial, onSave, onBack, onDiscard }) {
  const isNew = !initial?.id;
  const [state,   setState]   = useState(initial?.state||'draft');
  const [date,    setDate]    = useState(initial?.date||today());
  const [ref,     setRef]     = useState(initial?.ref||'');
  const [journal, setJournal] = useState(initial?.journal||'Miscellaneous');
  const [notes,   setNotes]   = useState(initial?.notes||'');
  const [lines,   setLines]   = useState(initial?.lines?.map(l=>({...l,id:l.id||uid()}))||[
    {id:uid(),account:'acc_1518',partner:'',label:'',debit:0,credit:0},
    {id:uid(),account:'acc_4001',partner:'',label:'',debit:0,credit:0},
  ]);

  const totalD = lines.reduce((s,l)=>s+parseN(l.debit),0);
  const totalC = lines.reduce((s,l)=>s+parseN(l.credit),0);
  const balanced = Math.abs(totalD-totalC)<0.01;
  const docNo = isNew?'New Entry':(initial?.no||'JE/'+new Date().getFullYear()+'/'+uid());

  const handlePost = () => {
    if(!balanced){ alert('Journal entry is not balanced. Total Debit must equal Total Credit.'); return; }
    setState('posted'); onSave&&onSave(buildDoc());
  };
  const handleSave = () => onSave&&onSave(buildDoc());

  const buildDoc = () => ({
    id: initial?.id||'je_'+uid(), no:docNo, date, ref, journal,
    notes, state, lines:lines.map(l=>({...l})),
  });

  return (
    <div style={{background:'#f8fafc',minHeight:'100vh'}}>
      <Breadcrumb items={[{label:'Journal Entries',onClick:onBack},{label:isNew?'New Journal Entry':docNo}]}/>
      <ActionBar>
        {state==='draft'&&<BtnPrimary onClick={handlePost} style={{opacity:balanced?1:.6}}>Post Entry</BtnPrimary>}
        {state==='draft'&&<BtnSecondary onClick={handleSave}>Save Draft</BtnSecondary>}
        {state==='draft'&&<BtnDanger onClick={onDiscard||onBack}>Discard</BtnDanger>}
        {state==='posted'&&<BtnSecondary onClick={()=>setState('draft')}>Reset to Draft</BtnSecondary>}
        {state==='posted'&&<BtnSecondary>PDF</BtnSecondary>}
        {!balanced&&<span style={{marginLeft:8,color:'#ef4444',fontSize:12,fontWeight:600}}>⚠ Entry not balanced</span>}
        {state==='posted'&&<div style={{marginLeft:'auto',background:'#d1fae5',color:'#065f46',borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:700}}>✓ Posted</div>}
      </ActionBar>
      <StatusBar states={['draft','posted']} current={state}/>

      <div style={{maxWidth:1100,margin:'24px auto',padding:'0 16px'}}>
        <Card>
          <div style={{padding:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
              <div>
                <div style={{fontSize:12,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>Journal Entry</div>
                <div style={{fontSize:22,fontWeight:700,color:'#111827'}}>{docNo}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              <Field label="Date" required half>
                <Inp type="date" value={date} onChange={e=>setDate(e.target.value)} readOnly={state!=='draft'}/>
              </Field>
              <Field label="Journal" required half>
                <Sel value={journal} onChange={e=>setJournal(e.target.value)} disabled={state!=='draft'}>
                  {['Sales Journal','Purchase Journal','Bank','Cash','Payroll Journal','Miscellaneous'].map(j=><option key={j}>{j}</option>)}
                </Sel>
              </Field>
              <Field label="Reference" half>
                <Inp value={ref} onChange={e=>setRef(e.target.value)} placeholder="Source document reference" readOnly={state!=='draft'}/>
              </Field>
              <Field label="Notes" half>
                <Inp value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Internal note" readOnly={state!=='draft'}/>
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Journal Lines" sub={balanced&&totalD>0?`Balanced · ${fmt(totalD)}`:'Not balanced'}/>
          <JELinesTable lines={lines} setLines={state==='draft'?setLines:()=>{}}/>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   INVOICE / BILL DETAIL VIEW (read-only, for existing docs)
═══════════════════════════════════════════════════════ */
export function DocDetail({ doc, onBack, onEdit }) {
  const isInvoice = doc.type==='out_invoice';
  const partnerObj = isInvoice ? CUSTOMERS.find(c=>c.id===doc.partnerId) : VENDORS.find(v=>v.id===doc.partnerId);
  const statusColor = { open:'#fef3c7', paid:'#d1fae5', draft:'#f3f4f6', posted:'#dbeafe' };
  const statusText  = { open:'Unpaid', paid:'Paid', draft:'Draft', posted:'Posted' };
  const stColor     = { open:'#92400e', paid:'#065f46', draft:'#6b7280', posted:'#1e40af' };

  return (
    <div style={{background:'#f8fafc',minHeight:'100vh'}}>
      <Breadcrumb items={[{label:isInvoice?'Invoices':'Bills',onClick:onBack},{label:doc.no}]}/>
      <ActionBar>
        {doc.state==='open'&&<BtnPrimary onClick={()=>onEdit&&onEdit(doc)}>Register Payment</BtnPrimary>}
        <BtnSecondary onClick={()=>onEdit&&onEdit(doc)}>Edit</BtnSecondary>
        <BtnSecondary>PDF</BtnSecondary>
        <BtnSecondary>Print</BtnSecondary>
        <div style={{marginLeft:'auto',background:statusColor[doc.state]||'#f3f4f6',color:stColor[doc.state]||'#6b7280',borderRadius:6,padding:'5px 14px',fontSize:12,fontWeight:700}}>
          {statusText[doc.state]||doc.state}
        </div>
      </ActionBar>

      <div style={{maxWidth:1000,margin:'24px auto',padding:'0 16px'}}>
        {/* Invoice header */}
        <Card>
          <div style={{padding:32}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
              <div>
                <div style={{fontSize:12,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>{isInvoice?'Customer Invoice':'Vendor Bill'}</div>
                <div style={{fontSize:26,fontWeight:800,color:'#111827'}}>{doc.no}</div>
                <div style={{marginTop:8,display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{background:statusColor[doc.state],color:stColor[doc.state],borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:700}}>{statusText[doc.state]||doc.state}</span>
                  {doc.state==='open'&&doc.due&&new Date(doc.due)<new Date()&&(
                    <span style={{background:'#fee2e2',color:'#991b1b',borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:700}}>Overdue</span>
                  )}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:700,color:'#374151',fontSize:16}}>Safari Grill &amp; Lounge</div>
                <div style={{fontSize:12,color:'#6b7280',marginTop:4}}>Masaki, Dar es Salaam, Tanzania</div>
                <div style={{fontSize:12,color:'#6b7280'}}>TIN: TZ-TIN-10001</div>
              </div>
            </div>

            {/* Info grid */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:20}}>
              <div>
                <div style={{fontSize:11,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>{isInvoice?'Bill To':'From'}</div>
                <div style={{fontWeight:700,fontSize:14,color:'#374151'}}>{doc.partner}</div>
                {partnerObj&&(
                  <>
                    <div style={{fontSize:13,color:'#6b7280',marginTop:4}}>{partnerObj.city}, Tanzania</div>
                    <div style={{fontSize:13,color:'#6b7280'}}>{partnerObj.phone}</div>
                    <div style={{fontSize:13,color:G}}>{partnerObj.email}</div>
                  </>
                )}
              </div>
              <div style={{textAlign:'right'}}>
                {[
                  {l:'Invoice No.',v:doc.no},
                  {l:'Date',v:doc.date},
                  {l:'Due Date',v:doc.due},
                  {l:'Reference',v:doc.ref||'—'},
                ].map((f,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'flex-end',gap:16,marginBottom:6,fontSize:13}}>
                    <span style={{color:'#9ca3af',minWidth:90}}>{f.l}</span>
                    <span style={{fontWeight:600,color:'#374151'}}>{f.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lines */}
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,marginBottom:0}}>
              <thead>
                <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
                  {['#','Description','Account','Qty','Unit Price','Tax','Amount'].map((h,i)=>(
                    <th key={h} style={{padding:'10px '+(i===0||i>3?'16px':'10px'),textAlign:i>3?'right':'left',color:'#6b7280',fontWeight:600,fontSize:12}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(doc.lines||[]).map((line,i)=>{
                  const acct = CHART_OF_ACCOUNTS.find(a=>a.id===line.account)||{code:line.account,name:''};
                  const lineTotal = parseN(line.qty||1)*parseN(line.price||line.price_unit||0);
                  return (
                    <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}>
                      <td style={{padding:'10px 16px',color:'#9ca3af'}}>{i+1}</td>
                      <td style={{padding:'10px 10px',fontWeight:500,color:'#374151'}}>{line.description||line.description_text||'—'}</td>
                      <td style={{padding:'10px 10px',color:'#6b7280',fontSize:12}}>{acct.code} {acct.name}</td>
                      <td style={{padding:'10px 10px',textAlign:'right'}}>{line.qty||1}</td>
                      <td style={{padding:'10px 10px',textAlign:'right'}}>{(parseN(line.price||line.price_unit||0)).toLocaleString()}</td>
                      <td style={{padding:'10px 10px',textAlign:'right',color:'#6b7280'}}>{line.tax||0}%</td>
                      <td style={{padding:'10px 16px',textAlign:'right',fontWeight:600}}>{fmt(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{display:'flex',justifyContent:'flex-end',paddingTop:16,borderTop:'2px solid #e5e7eb'}}>
              <table style={{borderCollapse:'collapse',fontSize:13,minWidth:300}}>
                <tbody>
                  <tr><td style={{padding:'5px 20px 5px 0',color:'#6b7280',textAlign:'right'}}>Subtotal</td><td style={{padding:'5px 0',textAlign:'right',fontWeight:500,minWidth:160}}>{fmt(doc.subtotal||doc.total)}</td></tr>
                  <tr><td style={{padding:'5px 20px 5px 0',color:'#6b7280',textAlign:'right'}}>Tax (18%)</td><td style={{padding:'5px 0',textAlign:'right',fontWeight:500}}>{fmt(doc.tax_amount||0)}</td></tr>
                  <tr style={{borderTop:'2px solid #e5e7eb'}}>
                    <td style={{padding:'12px 20px 12px 0',color:'#111827',fontWeight:700,fontSize:15,textAlign:'right'}}>Total</td>
                    <td style={{padding:'12px 0',textAlign:'right',fontWeight:800,fontSize:18,color:'#111827'}}>{fmt(doc.total)}</td>
                  </tr>
                  {doc.paid>0&&(
                    <tr><td style={{padding:'5px 20px 5px 0',color:G,textAlign:'right',fontWeight:600}}>Amount Paid</td><td style={{padding:'5px 0',textAlign:'right',fontWeight:600,color:G}}>-{fmt(doc.paid)}</td></tr>
                  )}
                  {doc.balance>0&&(
                    <tr style={{background:'#fffbeb'}}>
                      <td style={{padding:'10px 20px 10px 0',color:'#92400e',fontWeight:700,fontSize:14,textAlign:'right'}}>Amount Due</td>
                      <td style={{padding:'10px 0',textAlign:'right',fontWeight:800,fontSize:16,color:'#92400e'}}>{fmt(doc.balance)}</td>
                    </tr>
                  )}
                  {doc.balance===0&&doc.state==='paid'&&(
                    <tr style={{background:GB}}>
                      <td colSpan={2} style={{padding:'10px 0',textAlign:'center',fontWeight:700,fontSize:14,color:G}}>✓ Fully Paid</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {doc.notes&&(
          <Card><div style={{padding:'16px 24px',fontSize:13,color:'#6b7280'}}>
            <div style={{fontWeight:600,color:'#374151',marginBottom:6}}>Notes</div>
            {doc.notes}
          </div></Card>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { EMPLOYEES, DEPARTMENTS, JOB_POSITIONS, PAYSLIPS, PAYSLIP_BATCHES, EMP_EXPENSES, ATTENDANCE_SUMMARY, computePayslip } from '../data_hr';

/* ── theme ── */
const P = '#875A7B'; // Odoo HR purple
const PBG = '#fdf4ff';
const GR = '#1C7A4B'; // payroll green

const fmt = n => 'TSh ' + Math.abs(Math.round(n || 0)).toLocaleString('en-US');

/* ── Badge ── */
const BADGE_MAP = {
  active:['#d1fae5','#065f46','Active'], done:['#d1fae5','#065f46','Done'],
  draft:['#f3f4f6','#6b7280','Draft'], approved:['#d1fae5','#065f46','Approved'],
  posted:['#dbeafe','#1e40af','Posted'], refused:['#fee2e2','#991b1b','Refused'],
  Permanent:['#dbeafe','#1e40af','Permanent'], 'Fixed Term':['#fef3c7','#92400e','Fixed Term'],
};
function Badge({ s }) {
  const [bg,c,l] = BADGE_MAP[s] || ['#f3f4f6','#6b7280',s];
  return <span style={{background:bg,color:c,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:600}}>{l}</span>;
}

/* ── Avatar ── */
function Avatar({ initials, size=36 }) {
  const colors = ['#1C7A4B','#875A7B','#1e40af','#92400e','#065f46'];
  const bg = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:bg,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size*0.36,flexShrink:0}}>
      {initials}
    </div>
  );
}

/* ── Nav ── */
function Nav({ mod, setMod, page, setPage, out }) {
  const [open, setOpen] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const timerRef = React.useRef(null);

  const modules = [
    { k:'employees', l:'Employees', icon:'👥', sub:[{k:'emp_list',l:'Employees'},{k:'emp_departments',l:'Departments'},{k:'emp_new',l:'New Employee'}] },
    { k:'payroll',   l:'Payroll',   icon:'💰', sub:[{k:'pay_slips',l:'Payslips'},{k:'pay_batches',l:'Payslip Batches'},{k:'pay_summary',l:'Salary Summary'}] },
    { k:'expenses',  l:'Expenses',  icon:'🧾', sub:[{k:'exp_list',l:'Expense Reports'},{k:'exp_new',l:'New Expense'}] },
  ];

  const handleEnter = (e, mk) => { clearTimeout(timerRef.current); setOpen(mk); setAnchorEl(e.currentTarget); };
  const handleLeave = () => { timerRef.current = setTimeout(()=>{ setOpen(null); setAnchorEl(null); }, 120); };
  const cancelClose = () => clearTimeout(timerRef.current);

  const openItem = modules.find(m => m.k === open);

  return (
    <>
      <nav style={{background:'#875A7B',color:'#fff',display:'flex',alignItems:'center',minHeight:48,zIndex:1000,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'0 16px',borderRight:'1px solid rgba(255,255,255,.2)',height:48,flexShrink:0}}>
          <span style={{fontSize:18}}>👤</span>
          <span style={{fontWeight:700,fontSize:15}}>Human Resources</span>
        </div>
        <div style={{display:'flex',flex:1}}>
          {modules.map(m=>(
            <div key={m.k} style={{flexShrink:0}}
              onMouseEnter={e=>handleEnter(e, m.k)}
              onMouseLeave={handleLeave}>
              <button onClick={()=>{setMod(m.k);setPage(m.sub[0].k);}}
                style={{background:mod===m.k?'rgba(255,255,255,.18)':'transparent',color:'#fff',border:'none',cursor:'pointer',padding:'0 14px',height:48,fontWeight:500,fontSize:13.5,display:'flex',alignItems:'center',gap:3}}>
                {m.icon} {m.l} <span style={{fontSize:9,opacity:.7}}>▼</span>
              </button>
            </div>
          ))}
        </div>
        <div style={{paddingRight:16,flexShrink:0,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:12,opacity:.8}}>Safari Grill &amp; Lounge</span>
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
            <button key={s.k} onClick={()=>{setMod(open);setPage(s.k);setOpen(null);setAnchorEl(null);}}
              style={{
                display:'block',width:'100%',textAlign:'left',
                padding:'10px 16px',
                background:page===s.k?PBG:'transparent',
                color:page===s.k?P:'#374151',
                border:'none',cursor:'pointer',fontSize:13.5,
                fontWeight:page===s.k?600:400,
                borderLeft:page===s.k?`3px solid ${P}`:'3px solid transparent',
              }}>
              {s.l}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Toolbar ── */
function Toolbar({ title, onNew, newLabel='New', extra=[], color=P }) {
  return (
    <div style={{borderBottom:'1px solid #e5e7eb',background:'#fff',display:'flex',alignItems:'center',gap:8,padding:'8px 20px'}}>
      {onNew && <button onClick={onNew} style={{background:color,color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontWeight:600,fontSize:13}}>+ {newLabel}</button>}
      {extra.map((b,i)=><button key={i} style={{background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:5,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:600}}>{b}</button>)}
      <span style={{fontWeight:700,fontSize:15,color:'#111827',marginLeft:4}}>{title}</span>
    </div>
  );
}

/* ── Search ── */
function SBar({ v, sv, ph='Search...' }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 20px',background:'#f9fafb',borderBottom:'1px solid #e5e7eb'}}>
      <div style={{display:'flex',alignItems:'center',background:'#fff',border:'1px solid #d1d5db',borderRadius:20,padding:'5px 14px',gap:6,flex:1,maxWidth:400}}>
        <span style={{color:'#9ca3af'}}>🔍</span>
        <input value={v} onChange={e=>sv(e.target.value)} placeholder={ph} style={{border:'none',outline:'none',fontSize:13,flex:1,background:'transparent'}}/>
      </div>
      <span style={{fontSize:12,color:'#6b7280'}}>{v ? 'Filtered' : 'All Records'}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   EMPLOYEES MODULE
══════════════════════════════════════════════ */
function EmployeeList({ onSelect }) {
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('All');
  const [view, setView] = useState('kanban'); // 'kanban' | 'list'
  const depts = ['All', ...DEPARTMENTS.map(d=>d.name)];
  const filtered = EMPLOYEES
    .filter(e => e.name.toLowerCase().includes(q.toLowerCase()) || e.empNo.includes(q))
    .filter(e => dept === 'All' || DEPARTMENTS.find(d=>d.id===e.deptId)?.name === dept);

  return (
    <div>
      <Toolbar title="Employees" onNew={()=>{}} newLabel="Employee" extra={['Import']}/>
      <SBar v={q} sv={setQ} ph="Search employees..."/>
      {/* Dept filter + view toggle */}
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 20px',borderBottom:'1px solid #e5e7eb',background:'#fff'}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {depts.map(d=>(
            <button key={d} onClick={()=>setDept(d)}
              style={{background:dept===d?P:'#f3f4f6',color:dept===d?'#fff':'#374151',border:'none',borderRadius:16,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:dept===d?600:400}}>
              {d}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:4}}>
          <button onClick={()=>setView('kanban')} style={{background:view==='kanban'?P:'#f3f4f6',color:view==='kanban'?'#fff':'#374151',border:'none',borderRadius:4,padding:'5px 10px',cursor:'pointer',fontSize:13}}>⊞</button>
          <button onClick={()=>setView('list')} style={{background:view==='list'?P:'#f3f4f6',color:view==='list'?'#fff':'#374151',border:'none',borderRadius:4,padding:'5px 10px',cursor:'pointer',fontSize:13}}>≡</button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div style={{padding:20,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
          {filtered.map(emp=>{
            const dept = DEPARTMENTS.find(d=>d.id===emp.deptId);
            const job = JOB_POSITIONS.find(j=>j.id===emp.jobId);
            const calc = computePayslip(emp);
            return (
              <div key={emp.id} onClick={()=>onSelect(emp)}
                style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:20,cursor:'pointer',transition:'all .15s'}}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=P; e.currentTarget.style.boxShadow=`0 4px 16px ${P}20`; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <Avatar initials={emp.avatar} size={44}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:'#111827'}}>{emp.name}</div>
                    <div style={{fontSize:12,color:P,fontWeight:600}}>{job?.name}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:'#6b7280',marginBottom:4}}>📦 {dept?.name}</div>
                <div style={{fontSize:12,color:'#6b7280',marginBottom:4}}>📞 {emp.phone}</div>
                <div style={{fontSize:12,color:'#6b7280',marginBottom:10}}>📍 {emp.site}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #f3f4f6',paddingTop:10}}>
                  <Badge s={emp.contractType}/>
                  <span style={{fontSize:12,fontWeight:600,color:'#374151'}}>{fmt(calc.gross)}<span style={{color:'#9ca3af',fontWeight:400}}>/mo</span></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
                <th style={{width:36,padding:'10px 12px'}}><input type="checkbox" style={{accentColor:P}}/></th>
                {['Employee','Emp No','Department','Job Position','Contract','Gross Salary','Status'].map(h=>(
                  <th key={h} style={{padding:'10px 12px',textAlign:'left',color:'#6b7280',fontWeight:600,fontSize:12}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp=>{
                const dept = DEPARTMENTS.find(d=>d.id===emp.deptId);
                const job = JOB_POSITIONS.find(j=>j.id===emp.jobId);
                const calc = computePayslip(emp);
                return (
                  <tr key={emp.id} onClick={()=>onSelect(emp)} style={{borderBottom:'1px solid #f3f4f6',cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background=PBG}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{padding:'10px 12px'}} onClick={e=>e.stopPropagation()}><input type="checkbox" style={{accentColor:P}}/></td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <Avatar initials={emp.avatar} size={32}/>
                        <div>
                          <div style={{fontWeight:600,color:'#111827'}}>{emp.name}</div>
                          <div style={{fontSize:11,color:'#9ca3af'}}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'10px 12px',color:P,fontWeight:600}}>{emp.empNo}</td>
                    <td style={{padding:'10px 12px',color:'#374151'}}>{dept?.name}</td>
                    <td style={{padding:'10px 12px',color:'#374151'}}>{job?.name}</td>
                    <td style={{padding:'10px 12px'}}><Badge s={emp.contractType}/></td>
                    <td style={{padding:'10px 12px',fontWeight:600,color:'#374151'}}>{fmt(calc.gross)}</td>
                    <td style={{padding:'10px 12px'}}><Badge s={emp.status}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Employee Detail Form ── */
function EmployeeDetail({ emp, onBack }) {
  const [tab, setTab] = useState('info');
  const calc = computePayslip(emp);
  const dept = DEPARTMENTS.find(d=>d.id===emp.deptId);
  const job = JOB_POSITIONS.find(j=>j.id===emp.jobId);
  const mgr = emp.manager ? EMPLOYEES.find(e=>e.id===emp.manager) : null;
  const tabs = ['info','contract','payroll','attendance'];

  return (
    <div>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'12px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <button onClick={onBack} style={{background:'transparent',border:'none',cursor:'pointer',color:P,fontSize:13,fontWeight:600}}>← Employees</button>
          <span style={{color:'#d1d5db'}}>/</span>
          <span style={{fontSize:13,fontWeight:600,color:'#374151'}}>{emp.name}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <Avatar initials={emp.avatar} size={72}/>
          <div>
            <h2 style={{margin:0,fontSize:22,fontWeight:700,color:'#111827'}}>{emp.name}</h2>
            <div style={{color:P,fontWeight:600,fontSize:14,marginTop:2}}>{job?.name}</div>
            <div style={{color:'#6b7280',fontSize:13,marginTop:2}}>{dept?.name} · {emp.site}</div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:8}}>
            <button style={{background:P,color:'#fff',border:'none',borderRadius:6,padding:'7px 16px',cursor:'pointer',fontWeight:600,fontSize:13}}>Edit</button>
            <button style={{background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:6,padding:'7px 16px',cursor:'pointer',fontSize:13}}>Archive</button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{display:'flex',gap:0,marginTop:16,borderBottom:'2px solid #e5e7eb'}}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:'8px 18px',background:'transparent',border:'none',borderBottom:tab===t?`2px solid ${P}`:'2px solid transparent',color:tab===t?P:'#6b7280',fontWeight:tab===t?600:400,cursor:'pointer',fontSize:13,textTransform:'capitalize',marginBottom:-2}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{padding:24,maxWidth:900}}>
        {tab==='info'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            {[
              {l:'Employee Number',v:emp.empNo},{l:'Job Position',v:job?.name},{l:'Department',v:dept?.name},
              {l:'Manager',v:mgr?.name||'—'},{l:'Email',v:emp.email},{l:'Phone',v:emp.phone},
              {l:'Date of Birth',v:emp.dob},{l:'Gender',v:emp.gender},{l:'Nationality',v:emp.nationality},
              {l:'NIDA / ID',v:emp.nida},{l:'Join Date',v:emp.joinDate},{l:'Work Location',v:emp.site},
              {l:'TIN',v:emp.tin},{l:'NSSF Number',v:emp.nssf},{l:'Bank Account',v:emp.bank+' — '+emp.accountNo},
            ].map((f,i)=>(
              <div key={i} style={{background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',padding:'14px 16px'}}>
                <div style={{fontSize:11,color:'#9ca3af',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>{f.l}</div>
                <div style={{fontSize:14,color:'#111827',fontWeight:500}}>{f.v}</div>
              </div>
            ))}
          </div>
        )}
        {tab==='contract'&&(
          <div style={{background:'#fff',borderRadius:10,border:'1px solid #e5e7eb',overflow:'hidden'}}>
            <div style={{padding:'14px 20px',background:'#f9fafb',borderBottom:'1px solid #e5e7eb',fontWeight:700,color:'#374151',fontSize:14}}>Contract Details</div>
            <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {[
                {l:'Contract Type',v:emp.contractType},{l:'Join Date',v:emp.joinDate},
                {l:'Basic Salary',v:fmt(emp.wage)},{l:'HRA',v:fmt(emp.hra)},
                {l:'Travel Allowance',v:fmt(emp.travel)},{l:'Meal Allowance',v:fmt(emp.meal)},
                {l:'Gross Monthly',v:fmt(calc.gross)},{l:'Net Monthly',v:fmt(calc.net)},
              ].map((f,i)=>(
                <div key={i}>
                  <div style={{fontSize:11,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{f.l}</div>
                  <div style={{fontSize:14,color:'#111827',fontWeight:600}}>{f.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==='payroll'&&(
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Recent Payslips</div>
            {PAYSLIPS.filter(p=>p.employeeId===emp.id).slice(0,4).map(slip=>(
              <div key={slip.id} style={{background:'#fff',borderRadius:8,border:'1px solid #e5e7eb',padding:16,marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:600,color:'#374151'}}>{slip.name}</div>
                  <div style={{fontSize:12,color:'#9ca3af',marginTop:2}}>{slip.dateFrom} — {slip.dateTo}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:13,fontWeight:600,color:GR}}>Net: {fmt(slip.net)}</div>
                  <Badge s={slip.state}/>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==='attendance'&&(
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Attendance — November 2026</div>
            {(()=>{
              const att = ATTENDANCE_SUMMARY.find(a=>a.employeeId===emp.id);
              if(!att) return <p style={{color:'#9ca3af'}}>No attendance data</p>;
              return (
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
                  {[
                    {l:'Worked Days',v:att.workedDays,c:'#065f46',bg:'#d1fae5'},
                    {l:'Leave Days',v:att.leaveDays,c:'#1e40af',bg:'#dbeafe'},
                    {l:'Absent Days',v:att.absentDays,c:'#c0392b',bg:'#fee2e2'},
                    {l:'Overtime Hrs',v:att.overtimeHours,c:'#92400e',bg:'#fef3c7'},
                  ].map((k,i)=>(
                    <div key={i} style={{background:'#fff',borderRadius:10,border:'1px solid #e5e7eb',padding:16}}>
                      <div style={{fontSize:12,color:'#6b7280',marginBottom:6}}>{k.l}</div>
                      <div style={{fontSize:30,fontWeight:700,color:'#111827'}}>{k.v}</div>
                      <div style={{background:k.bg,color:k.c,fontSize:11,fontWeight:600,borderRadius:10,padding:'2px 8px',display:'inline-block',marginTop:4}}>Nov 2026</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Departments ── */
function Departments() {
  return (
    <div>
      <Toolbar title="Departments" onNew={()=>{}} newLabel="Department"/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16,padding:24}}>
        {DEPARTMENTS.map(dept=>{
          const emps = EMPLOYEES.filter(e=>e.deptId===dept.id);
          return (
            <div key={dept.id} style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:20}}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=P; e.currentTarget.style.boxShadow=`0 4px 12px ${P}20`; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:15,color:'#111827'}}>{dept.name}</div>
                <div style={{background:PBG,color:P,borderRadius:8,padding:'3px 10px',fontSize:12,fontWeight:700}}>{emps.length}</div>
              </div>
              <div style={{fontSize:12,color:'#6b7280',marginBottom:12}}>Manager: <span style={{fontWeight:600,color:'#374151'}}>{dept.manager}</span></div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {emps.slice(0,4).map(e=><Avatar key={e.id} initials={e.avatar} size={28}/>)}
                {emps.length>4&&<div style={{width:28,height:28,borderRadius:'50%',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#6b7280',fontWeight:600}}>+{emps.length-4}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAYROLL MODULE
══════════════════════════════════════════════ */
function PayslipList({ onSelect }) {
  const [q, setQ] = useState('');
  const [period, setPeriod] = useState('2026-11');
  const rows = PAYSLIPS
    .filter(p => p.period === period)
    .filter(p => p.employeeName.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <Toolbar title="Payslips" onNew={()=>{}} newLabel="Payslip" color={GR} extra={['Generate Batch']}/>
      <SBar v={q} sv={setQ} ph="Search payslips..."/>
      <div style={{display:'flex',gap:8,padding:'8px 20px',borderBottom:'1px solid #e5e7eb',background:'#fff',alignItems:'center'}}>
        <span style={{fontSize:12,color:'#6b7280',fontWeight:600}}>Period:</span>
        {['2026-10','2026-11'].map(p=>(
          <button key={p} onClick={()=>setPeriod(p)}
            style={{background:period===p?GR:'#f3f4f6',color:period===p?'#fff':'#374151',border:'none',borderRadius:16,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:period===p?600:400}}>
            {p}
          </button>
        ))}
        <span style={{marginLeft:'auto',fontSize:12,color:'#6b7280'}}>{rows.length} payslips</span>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
              <th style={{width:36,padding:'10px 12px'}}><input type="checkbox" style={{accentColor:GR}}/></th>
              {['Employee','Reference','Period','Gross','Net Salary','Status'].map(h=>(
                <th key={h} style={{padding:'10px 12px',textAlign:h==='Gross'||h==='Net Salary'?'right':'left',color:'#6b7280',fontWeight:600,fontSize:12}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(slip=>(
              <tr key={slip.id} onClick={()=>onSelect(slip)} style={{borderBottom:'1px solid #f3f4f6',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.background='#f0faf4'}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{padding:'10px 12px'}} onClick={e=>e.stopPropagation()}><input type="checkbox" style={{accentColor:GR}}/></td>
                <td style={{padding:'10px 12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <Avatar initials={slip.employeeName.split(' ').map(n=>n[0]).join('').slice(0,2)} size={32}/>
                    <span style={{fontWeight:600,color:'#111827'}}>{slip.employeeName}</span>
                  </div>
                </td>
                <td style={{padding:'10px 12px',color:GR,fontWeight:600}}>{slip.no}</td>
                <td style={{padding:'10px 12px',color:'#6b7280'}}>{slip.dateFrom} → {slip.dateTo}</td>
                <td style={{padding:'10px 12px',textAlign:'right',fontWeight:600}}>{fmt(slip.gross)}</td>
                <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,color:GR}}>{fmt(slip.net)}</td>
                <td style={{padding:'10px 12px'}}><Badge s={slip.state}/></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:'#f0faf4',borderTop:'2px solid #e5e7eb'}}>
              <td colSpan={4} style={{padding:'10px 12px',fontWeight:700,fontSize:13}}>Totals ({rows.length} employees)</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,fontSize:13,color:'#374151'}}>{fmt(rows.reduce((s,p)=>s+p.gross,0))}</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,fontSize:13,color:GR}}>{fmt(rows.reduce((s,p)=>s+p.net,0))}</td>
              <td/>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ── Payslip Detail ── */
function PayslipDetail({ slip, onBack }) {
  const emp = EMPLOYEES.find(e => e.id === slip.employeeId);
  const earnings = slip.lines.filter(l => l.type === 'earning');
  const deductions = slip.lines.filter(l => l.type === 'deduction');
  const employer = slip.lines.filter(l => l.type === 'employer');

  return (
    <div>
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'12px 20px',display:'flex',alignItems:'center',gap:8}}>
        <button onClick={onBack} style={{background:'transparent',border:'none',cursor:'pointer',color:GR,fontSize:13,fontWeight:600}}>← Payslips</button>
        <span style={{color:'#d1d5db'}}>/</span>
        <span style={{fontSize:13,fontWeight:600}}>{slip.name}</span>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button style={{background:'#374151',color:'#fff',border:'none',borderRadius:5,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>PDF</button>
          <button style={{background:'#fff',color:'#374151',border:'1px solid #d1d5db',borderRadius:5,padding:'5px 12px',cursor:'pointer',fontSize:12}}>Print</button>
          <Badge s={slip.state}/>
        </div>
      </div>

      <div style={{maxWidth:760,margin:'24px auto',background:'#fff',borderRadius:10,border:'1px solid #e5e7eb',overflow:'hidden'}}>
        {/* Header */}
        <div style={{background:GR,color:'#fff',padding:'24px 32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:22,fontWeight:700}}>PAYSLIP</div>
            <div style={{fontSize:13,opacity:.85,marginTop:4}}>{slip.name}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13,opacity:.8}}>{slip.dateFrom} — {slip.dateTo}</div>
            <div style={{fontSize:15,fontWeight:700,marginTop:4}}>Safari Grill &amp; Lounge</div>
          </div>
        </div>

        {/* Employee info */}
        <div style={{padding:'20px 32px',borderBottom:'1px solid #e5e7eb',display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {emp&&[
            {l:'Employee',v:emp.name},{l:'Employee No.',v:emp.empNo},
            {l:'Department',v:DEPARTMENTS.find(d=>d.id===emp.deptId)?.name},{l:'Job Position',v:JOB_POSITIONS.find(j=>j.id===emp.jobId)?.name},
            {l:'Bank',v:emp.bank},{l:'Account No.',v:emp.accountNo},
            {l:'NSSF No.',v:emp.nssf},{l:'TIN',v:emp.tin},
          ].map((f,i)=>(
            <div key={i}>
              <div style={{fontSize:11,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>{f.l}</div>
              <div style={{fontSize:13,color:'#374151',fontWeight:600}}>{f.v}</div>
            </div>
          ))}
        </div>

        {/* Earnings & Deductions */}
        <div style={{padding:'0 32px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,borderBottom:'1px solid #e5e7eb'}}>
            {/* Earnings */}
            <div style={{padding:'16px 0',borderRight:'1px solid #e5e7eb'}}>
              <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:10,paddingBottom:6,borderBottom:'2px solid #e5e7eb'}}>EARNINGS</div>
              {earnings.map((l,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8,color:l.code==='GROSS'?'#374151':'#4b5563',fontWeight:l.code==='GROSS'?700:400}}>
                  <span style={{borderBottom:l.code==='GROSS'?'1px solid #e5e7eb':''}}>{l.name}</span>
                  <span style={{fontWeight:l.code==='GROSS'?700:500}}>{fmt(l.amount)}</span>
                </div>
              ))}
            </div>
            {/* Deductions */}
            <div style={{padding:'16px 0 16px 20px'}}>
              <div style={{fontWeight:700,fontSize:13,color:'#374151',marginBottom:10,paddingBottom:6,borderBottom:'2px solid #e5e7eb'}}>DEDUCTIONS</div>
              {deductions.map((l,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8,color:l.code==='NET'?'#374151':'#4b5563',fontWeight:l.code==='NET'?700:400}}>
                  <span>{l.name}</span>
                  <span style={{color:'#c0392b',fontWeight:500}}>{fmt(l.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div style={{padding:'20px 32px',background:'#f0faf4',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'2px solid #e5e7eb'}}>
          <span style={{fontWeight:700,fontSize:18,color:GR}}>NET PAY</span>
          <span style={{fontWeight:800,fontSize:24,color:GR}}>{fmt(slip.net)}</span>
        </div>

        {/* Employer contributions */}
        <div style={{padding:'16px 32px',borderTop:'1px solid #e5e7eb',background:'#fafafa'}}>
          <div style={{fontSize:12,fontWeight:700,color:'#6b7280',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Employer Contributions (not deducted from employee)</div>
          <div style={{display:'flex',gap:24}}>
            {employer.map((l,i)=>(
              <div key={i} style={{fontSize:12}}>
                <span style={{color:'#9ca3af'}}>{l.name}: </span>
                <span style={{fontWeight:600,color:'#374151'}}>{fmt(l.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Payslip Batches ── */
function PayslipBatches() {
  return (
    <div>
      <Toolbar title="Payslip Batches" onNew={()=>{}} newLabel="Batch" color={GR}/>
      <div style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
        {PAYSLIP_BATCHES.map(batch=>(
          <div key={batch.id} style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:20,cursor:'pointer'}}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=GR; e.currentTarget.style.boxShadow='0 4px 12px #1C7A4B20'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.boxShadow='none'; }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{fontWeight:700,fontSize:15}}>{batch.name}</span>
              <Badge s={batch.state}/>
            </div>
            <div style={{fontSize:12,color:'#6b7280',marginBottom:12}}>{batch.dateStart} — {batch.dateEnd}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><div style={{fontSize:11,color:'#9ca3af',fontWeight:600}}>EMPLOYEES</div><div style={{fontSize:20,fontWeight:700}}>{batch.employeeCount}</div></div>
              <div><div style={{fontSize:11,color:'#9ca3af',fontWeight:600}}>TOTAL GROSS</div><div style={{fontSize:16,fontWeight:700,color:'#374151'}}>{fmt(batch.totalGross)}</div></div>
              <div><div style={{fontSize:11,color:'#9ca3af',fontWeight:600}}>TOTAL NET</div><div style={{fontSize:16,fontWeight:700,color:GR}}>{fmt(batch.totalNet)}</div></div>
              <div><div style={{fontSize:11,color:'#9ca3af',fontWeight:600}}>DEDUCTIONS</div><div style={{fontSize:16,fontWeight:700,color:'#c0392b'}}>{fmt(batch.totalGross-batch.totalNet)}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Salary Summary ── */
function SalarySummary() {
  const totalGross = EMPLOYEES.reduce((s,e)=>s+computePayslip(e).gross,0);
  const totalNet = EMPLOYEES.reduce((s,e)=>s+computePayslip(e).net,0);
  const totalNSSF = EMPLOYEES.reduce((s,e)=>s+computePayslip(e).nssf_er,0);
  const totalPAYE = EMPLOYEES.reduce((s,e)=>s+computePayslip(e).paye,0);
  const totalSDL = EMPLOYEES.reduce((s,e)=>s+computePayslip(e).sdl,0);
  const totalWCF = EMPLOYEES.reduce((s,e)=>s+computePayslip(e).wcf,0);

  return (
    <div>
      <Toolbar title="Salary Summary — November 2026" color={GR}/>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[
            {l:'Total Gross',v:fmt(totalGross),c:GR,bg:'#f0faf4'},
            {l:'Total Net Pay',v:fmt(totalNet),c:'#065f46',bg:'#d1fae5'},
            {l:'Total PAYE',v:fmt(totalPAYE),c:'#c0392b',bg:'#fee2e2'},
            {l:'Total NSSF (Employer)',v:fmt(totalNSSF),c:'#1e40af',bg:'#dbeafe'},
          ].map((k,i)=>(
            <div key={i} style={{background:'#fff',borderRadius:10,border:'1px solid #e5e7eb',padding:16}}>
              <div style={{fontSize:12,color:'#6b7280',marginBottom:6}}>{k.l}</div>
              <div style={{fontSize:20,fontWeight:700,color:'#111827'}}>{k.v}</div>
              <div style={{background:k.bg,color:k.c,fontSize:11,fontWeight:600,borderRadius:10,padding:'2px 8px',display:'inline-block',marginTop:4}}>Nov 2026</div>
            </div>
          ))}
        </div>
        <div style={{background:'#fff',borderRadius:10,border:'1px solid #e5e7eb',overflow:'hidden'}}>
          <div style={{padding:'12px 20px',borderBottom:'1px solid #e5e7eb',fontWeight:700,color:'#374151',background:'#f9fafb'}}>Employee Payroll Detail</div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12.5}}>
              <thead>
                <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
                  {['Employee','Basic','HRA','Travel+Meal','Gross','NSSF (EE)','PAYE','Net Pay','Employer NSSF','SDL','WCF','Total CTC'].map(h=>(
                    <th key={h} style={{padding:'9px 10px',textAlign:h==='Employee'?'left':'right',color:'#6b7280',fontWeight:600,fontSize:11,whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EMPLOYEES.map(emp=>{
                  const c=computePayslip(emp);
                  return(
                    <tr key={emp.id} style={{borderBottom:'1px solid #f3f4f6'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#f0faf4'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <td style={{padding:'9px 10px',fontWeight:600,color:'#374151',whiteSpace:'nowrap'}}>{emp.name}</td>
                      {[c.basic,c.hra,c.travel+c.meal,c.gross,c.nssf_ee,c.paye,c.net,c.nssf_er,c.sdl,c.wcf,c.totalCostToCompany].map((v,i)=>(
                        <td key={i} style={{padding:'9px 10px',textAlign:'right',color:i===6?GR:i===4||i===5?'#c0392b':'#374151',fontWeight:i===6||i===10?700:400}}>
                          {v.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{background:'#f0faf4',borderTop:'2px solid #e5e7eb'}}>
                  <td style={{padding:'10px',fontWeight:700}}>TOTAL</td>
                  {[totalGross-EMPLOYEES.reduce((s,e)=>s+(e.hra+e.travel+e.meal),0),EMPLOYEES.reduce((s,e)=>s+e.hra,0),EMPLOYEES.reduce((s,e)=>s+(e.travel+e.meal),0),totalGross,EMPLOYEES.reduce((s,e)=>s+computePayslip(e).nssf_ee,0),totalPAYE,totalNet,totalNSSF,totalSDL,totalWCF,totalGross+totalNSSF+totalSDL+totalWCF].map((v,i)=>(
                    <td key={i} style={{padding:'10px',textAlign:'right',fontWeight:700,color:i===6?GR:i===4||i===5?'#c0392b':'#374151'}}>{v.toLocaleString()}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   EXPENSES MODULE
══════════════════════════════════════════════ */
function ExpenseList() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const states = ['All','draft','approved','posted','refused'];
  const rows = EMP_EXPENSES
    .filter(e => e.employeeName.toLowerCase().includes(q.toLowerCase()) || e.description.toLowerCase().includes(q.toLowerCase()))
    .filter(e => filter==='All' || e.state===filter);

  const totalAmt = rows.reduce((s,e)=>s+e.amount,0);

  return (
    <div>
      <Toolbar title="Expense Reports" onNew={()=>{}} newLabel="Expense" color="#f59e0b"/>
      <SBar v={q} sv={setQ} ph="Search expenses..."/>
      <div style={{display:'flex',gap:8,padding:'8px 20px',borderBottom:'1px solid #e5e7eb',background:'#fff',alignItems:'center'}}>
        {states.map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{background:filter===s?'#f59e0b':'#f3f4f6',color:filter===s?'#fff':'#374151',border:'none',borderRadius:16,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:filter===s?600:400,textTransform:'capitalize'}}>
            {s}
          </button>
        ))}
        <span style={{marginLeft:'auto',fontSize:12,color:'#6b7280'}}>Total: <strong>{fmt(totalAmt)}</strong></span>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
              <th style={{width:36,padding:'10px 12px'}}><input type="checkbox" style={{accentColor:'#f59e0b'}}/></th>
              {['Date','Employee','Category','Description','Amount','Payment Mode','Status'].map(h=>(
                <th key={h} style={{padding:'10px 12px',textAlign:h==='Amount'?'right':'left',color:'#6b7280',fontWeight:600,fontSize:12}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(exp=>(
              <tr key={exp.id} style={{borderBottom:'1px solid #f3f4f6',cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.background='#fffbeb'}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{padding:'10px 12px'}} onClick={e=>e.stopPropagation()}><input type="checkbox" style={{accentColor:'#f59e0b'}}/></td>
                <td style={{padding:'10px 12px',color:'#6b7280'}}>{exp.date}</td>
                <td style={{padding:'10px 12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <Avatar initials={exp.employeeName.split(' ').map(n=>n[0]).join('').slice(0,2)} size={28}/>
                    <span style={{fontWeight:600,color:'#374151'}}>{exp.employeeName}</span>
                  </div>
                </td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:'#f3f4f6',color:'#374151',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:600}}>{exp.category}</span>
                </td>
                <td style={{padding:'10px 12px',color:'#374151',maxWidth:240}}>{exp.description}</td>
                <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,color:'#374151'}}>{fmt(exp.amount)}</td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:exp.paymentMode==='company'?'#dbeafe':'#f3f4f6',color:exp.paymentMode==='company'?'#1e40af':'#374151',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:600}}>
                    {exp.paymentMode==='company'?'Company':'Own Account'}
                  </span>
                </td>
                <td style={{padding:'10px 12px'}}><Badge s={exp.state}/></td>
              </tr>
            ))}
            {!rows.length&&<tr><td colSpan={8} style={{padding:40,textAlign:'center',color:'#9ca3af'}}>No expense records found.</td></tr>}
          </tbody>
          <tfoot>
            {rows.length>0&&(
              <tr style={{background:'#fffbeb',borderTop:'2px solid #e5e7eb'}}>
                <td colSpan={5} style={{padding:'10px 12px',fontWeight:700,fontSize:13}}>Total</td>
                <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700,fontSize:14,color:'#f59e0b'}}>{fmt(totalAmt)}</td>
                <td colSpan={2}/>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════ */
export default function HR({ sess, out }) {
  const [mod, setMod] = useState('employees');
  const [page, setPage] = useState('emp_list');
  const [selEmp, setSelEmp] = useState(null);
  const [selSlip, setSelSlip] = useState(null);

  const renderPage = () => {
    if (page === 'emp_list') {
      if (selEmp) return <EmployeeDetail emp={selEmp} onBack={()=>setSelEmp(null)}/>;
      return <EmployeeList onSelect={setSelEmp}/>;
    }
    if (page === 'emp_departments') return <Departments/>;
    if (page === 'pay_slips') {
      if (selSlip) return <PayslipDetail slip={selSlip} onBack={()=>setSelSlip(null)}/>;
      return <PayslipList onSelect={setSelSlip}/>;
    }
    if (page === 'pay_batches') return <PayslipBatches/>;
    if (page === 'pay_summary') return <SalarySummary/>;
    if (page === 'exp_list') return <ExpenseList/>;
    return <EmployeeList onSelect={setSelEmp}/>;
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',fontFamily:'system-ui,sans-serif'}}>
      <Nav mod={mod} setMod={setMod} page={page} setPage={p=>{ setPage(p); setSelEmp(null); setSelSlip(null); }} out={out}/>
      <div style={{flex:1,overflowY:'auto',background:'#f8fafc'}}>
        {renderPage()}
      </div>
    </div>
  );
}

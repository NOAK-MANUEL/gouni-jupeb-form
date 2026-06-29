"use client"
import { C } from "@/data/colors";
import { inputBase } from "@/data/inputBase";
import { Student } from "@/data/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminDashboard ()  {
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<"all"|"complete"|"incomplete"|"paid"|"unpaid">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student|null>(null);
  const navigate = useRouter()


  const togglePaid = (id: string) => {
    const _tempStudent = students.map(s => s.id === id ? { ...s, paid:!s.paid, paymentRef: !s.paid ? `PAY-${Date.now()}` : "" } : s);
    setStudents([..._tempStudent]);
    if (selected?.id === id) setSelected(_tempStudent.find(s => s.id === id) ?? null);
  };

  const filtered = students.filter(s => {
    const matchFilter =
      filter === "all" ? true :
      filter === "complete" ? s.status === "complete" :
      filter === "incomplete" ? s.status === "incomplete" :
      filter === "paid" ? s.paid :
      !s.paid;
    const matchSearch = search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: students.length,
    complete: students.filter(s => s.status === "complete").length,
    paid: students.filter(s => s.paid).length,
    incomplete: students.filter(s => s.status === "incomplete").length,
  };

  const badge = (label: string, color: string, bg: string) => (
    <span style={{ background:bg, color, fontSize:"11px", fontWeight:700, padding:"3px 10px", borderRadius:"20px", letterSpacing:"0.06em" }}>{label}</span>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans', sans-serif" }}>
      {/* header */}
      <header style={{ background:C.primaryDk, borderBottom:`3px solid ${C.accent}`, position:"sticky", top:0, zIndex:30 }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"8px", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:"18px", fontWeight:900, color:C.primaryDk }}>G</span>
            </div>
            <div>
              <p style={{ color:C.accent, fontSize:"10px", fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", margin:0 }}>GOUNI JUPEB</p>
              <p style={{ color:"white", fontSize:"15px", fontWeight:700, margin:0 }}>Admin Dashboard</p>
            </div>
          </div>
          <button onClick={()=>navigate.back()} style={{ background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:"8px", color:"white", padding:"8px 18px", fontSize:"12px", fontWeight:700, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>
            ← Back to Form
          </button>
        </div>
      </header>

      <main style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 24px" }}>
        {/* page heading */}
        <div style={{ marginBottom:"28px" }}>
          <h1 style={{ fontSize:"28px", fontWeight:700, color:C.slate, margin:"0 0 6px", fontFamily:"'DM Serif Display', Georgia, serif" }}>Applicant Management</h1>
          <p style={{ fontSize:"13px", color:C.muted, margin:0 }}>Review, track and manage all JUPEB applicants for the 2024/2025 academic session.</p>
        </div>

        {/* stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"16px", marginBottom:"28px" }}>
          {[
            { label:"Total Applications", value:stats.total, color:C.primary, bg:C.primaryLt },
            { label:"Complete", value:stats.complete, color:"#1A7A45", bg:"#D6F0E0" },
            { label:"Incomplete", value:stats.incomplete, color:"#9B6200", bg:"#FDF2E4" },
            { label:"Payment Received", value:stats.paid, color:"#1A5C38", bg:"#D6EAE0" },
            { label:"Payment Pending", value:stats.total - stats.paid, color:C.danger, bg:"#FBECEC" },
          ].map(c => (
            <div key={c.label} style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:"12px", padding:"16px 20px", borderTop:`3px solid ${c.color}` }}>
              <p style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:C.muted, margin:"0 0 8px" }}>{c.label}</p>
              <p style={{ fontSize:"28px", fontWeight:800, color:c.color, margin:0 }}>{c.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:"20px", flexWrap:"wrap" }}>
          {/* table panel */}
          <div style={{ flex:"1 1 500px", background:"white", border:`1px solid ${C.border}`, borderRadius:"12px", overflow:"hidden" }}>
            {/* toolbar */}
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", gap:"12px", flexWrap:"wrap", alignItems:"center" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                style={{ ...inputBase, flex:"1 1 180px", minWidth:"140px", padding:"8px 12px" }}
              />
              <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)}
                style={{ ...inputBase, width:"auto", padding:"8px 32px 8px 12px", appearance:"none", cursor:"pointer", flexShrink:0 }}>
                <option value="all">All Applicants</option>
                <option value="complete">Complete Only</option>
                <option value="incomplete">Incomplete Only</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {/* table */}
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                <thead>
                  <tr style={{ background:"#F6FAF8", borderBottom:`1px solid ${C.border}` }}>
                    {["ID","Applicant","Faculty","Date","Status","Payment","Action"].map(h => (
                      <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:"10px", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding:"32px", textAlign:"center", color:C.hint, fontSize:"13px" }}>No applicants found</td></tr>
                  ) : filtered.map((s, i) => (
                    <tr key={s.id} onClick={() => setSelected(s)}
                      style={{ borderBottom:`1px solid ${C.border}`, cursor:"pointer", background: selected?.id === s.id ? C.primaryLt : i % 2 === 0 ? "white" : "#F9FBF9", transition:"background 0.1s" }}>
                      <td style={{ padding:"10px 14px", color:C.hint, fontSize:"11px", fontWeight:700 }}>{s.id}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <p style={{ margin:0, fontWeight:600, color:C.slate }}>{s.name}</p>
                        <p style={{ margin:0, fontSize:"11px", color:C.hint }}>{s.email}</p>
                      </td>
                      <td style={{ padding:"10px 14px", fontSize:"12px", color:C.muted, maxWidth:"160px" }}>
                        <span style={{ display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.faculty.replace("FACULTY OF ","").replace("COLLEGE OF ","")}</span>
                      </td>
                      <td style={{ padding:"10px 14px", fontSize:"12px", color:C.muted, whiteSpace:"nowrap" }}>{s.submittedAt}</td>
                      <td style={{ padding:"10px 14px" }}>
                        {s.status === "complete"
                          ? badge("Complete","#1A7A45","#D6F0E0")
                          : badge("Incomplete","#9B6200","#FDF2E4")}
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        {s.paid
                          ? badge("Paid","#1A5C38","#D6EAE0")
                          : badge("Pending",C.danger,"#FBECEC")}
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <button
                          onClick={e => { e.stopPropagation(); togglePaid(s.id); }}
                          style={{ fontSize:"11px", fontWeight:700, padding:"5px 12px", borderRadius:"6px", border:`1.5px solid ${s.paid ? C.border : C.primary}`, background: s.paid ? "white" : C.primaryLt, color: s.paid ? C.muted : C.primary, cursor:"pointer", whiteSpace:"nowrap" }}>
                          {s.paid ? "Unmark Paid" : "Mark Paid"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding:"12px 20px", borderTop:`1px solid ${C.border}`, fontSize:"12px", color:C.hint }}>
              Showing {filtered.length} of {students.length} applicants
            </div>
          </div>

          {/* detail panel */}
          {selected ? (
            <div style={{ width:"300px", flexShrink:0, background:"white", border:`1px solid ${C.border}`, borderRadius:"12px", overflow:"hidden", alignSelf:"start" }}>
              <div style={{ background:C.primaryDk, padding:"20px" }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"12px" }}>
                  <span style={{ fontSize:"20px", fontWeight:800, color:C.primaryDk }}>{selected.name.charAt(0)}</span>
                </div>
                <p style={{ color:"white", fontWeight:700, fontSize:"16px", margin:"0 0 2px" }}>{selected.name}</p>
                <p style={{ color:C.hint, fontSize:"12px", margin:0 }}>{selected.email}</p>
              </div>
              <div style={{ padding:"20px" }}>
                {[
                  { label:"Applicant ID", value:selected.id },
                  { label:"Faculty", value:selected.faculty.replace("FACULTY OF ","").replace("COLLEGE OF ","") },
                  { label:"Programme", value:selected.programme },
                  { label:"Applied On", value:selected.submittedAt },
                  { label:"Application Status", value:selected.status === "complete" ? "✓ Complete" : "⚠ Incomplete" },
                  { label:"Payment Status", value:selected.paid ? "✓ Paid" : "✗ Pending" },
                  ...(selected.paymentRef ? [{ label:"Payment Ref", value:selected.paymentRef }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ marginBottom:"12px" }}>
                    <p style={{ fontSize:"10px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", color:C.hint, margin:"0 0 2px" }}>{label}</p>
                    <p style={{ fontSize:"13px", color:C.slate, margin:0, fontWeight:600 }}>{value}</p>
                  </div>
                ))}
                <button onClick={() => togglePaid(selected.id)}
                  style={{ width:"100%", marginTop:"12px", padding:"11px", borderRadius:"8px", border:"none", background: selected.paid ? "#FBECEC" : C.primary, color: selected.paid ? C.danger : "white", fontWeight:700, fontSize:"13px", cursor:"pointer", letterSpacing:"0.06em" }}>
                  {selected.paid ? "Remove Payment" : "Confirm Payment"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ width:"300px", flexShrink:0, background:"white", border:`1.5px dashed ${C.border}`, borderRadius:"12px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", textAlign:"center", gap:"12px", alignSelf:"start" }}>
              <div style={{ width:"48px", height:"48px", borderRadius:"50%", background:C.primaryLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>👤</div>
              <p style={{ fontSize:"13px", color:C.muted, margin:0 }}>Click any applicant row to view their details here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
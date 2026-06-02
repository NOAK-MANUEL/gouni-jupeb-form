"use client"
import { useState, } from "react";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/* ═══════════════════════════════════════════════════════════════════
   COLOUR TOKENS — deep forest green / slate / amber
═══════════════════════════════════════════════════════════════════ */
const C = {
  bg:        "#F0F4F1",   // page background
  white:     "#FFFFFF",
  card:      "#FFFFFF",
  border:    "#C8D5CC",
  borderFocus:"#1A5C38",
  primary:   "#1A5C38",   // forest green
  primaryDk: "#0E3D25",
  primaryLt: "#D6EAE0",
  accent:    "#C9802A",   // amber
  accentLt:  "#FDF2E4",
  slate:     "#2D3E36",
  muted:     "#5A7060",
  hint:      "#9AB3A0",
  danger:    "#C0392B",
  success:   "#1A7A45",
  warning:   "#C9802A",
  info:      "#1A5C38",
};

/* ═══════════════════════════════════════════════════════════════════
   ZOD SCHEMAS
═══════════════════════════════════════════════════════════════════ */
const subjectSchema = z.object({
  faculty: z.string().min(1, "Select a faculty"),
  programme: z.string().min(1, "Select a programme"),
});

const personalSchema = z.object({
  firstName:   z.string().min(2, "Required"),
  lastName:    z.string().min(2, "Required"),
  otherNames:  z.string().optional(),
  gender:      z.enum(["Male","Female"], { message: "Select gender" }),
  maritalStatus: z.enum(["Married","Single"], { message: "Select status" }),
  email:       z.email("Valid email required"),
  phone:       z.string().min(8, "Valid phone required"),
  nationality: z.string().min(2, "Required"),
  street:      z.string().min(3, "Required"),
  street2:     z.string().optional(),
  city:        z.string().min(1, "Required"),
  stateProvince: z.string().optional(),
  postalCode:  z.string().optional(),
  country:     z.string().min(1, "Required"),
  stateOfOrigin: z.string().min(1, "Required"),
  lga:         z.string().min(1, "Required"),
  dobMonth:    z.string().min(1, "Required"),
  dobDay:      z.string().min(1, "Required"),
  dobYear:     z.string().min(4, "Required"),
  hobbies:     z.string().min(2, "Required"),
});

const educationRowSchema = z.object({
  institution: z.string().optional(),
  location:    z.string().optional(),
  dateFrom:    z.string().optional(),
  dateTo:      z.string().optional(),
  certificate: z.string().optional(),
});

const sponsorRowSchema = z.object({
  name:         z.string().optional(),
  relationship: z.string().optional(),
  address:      z.string().optional(),
  phone:        z.string().optional(),
  email:        z.string().optional(),
});

const declarationSchema = z.object({
  heardFrom:   z.string().min(1, "Required"),
  heardOther:  z.string().optional(),
  declaration: z.boolean().refine((value) => value === true, {
  message: "You must accept the declaration",
}),
});

const fullSchema = z.object({
  ...subjectSchema.shape,
  ...personalSchema.shape,
  education: z.array(educationRowSchema),
  sponsors: z.array(sponsorRowSchema),
  ...declarationSchema.shape,
});

type FullForm = z.infer<typeof fullSchema>;

/* ═══════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════ */
const FACULTIES: Record<string, string[]> = {
  "FACULTY OF ARTS": [
    "English and Literary Studies (ELS) – Literature in English, History, CRS/Government",
    "History and International Studies – History/Government, Literature in English, CRS",
    "Music – Music, CRS, Government/Literature in English",
    "Philosophy – History/Government, CRS, Literature in English",
  ],
  "FACULTY OF LAW": [
    "Government, Literature in English, CRS or Economics, Government, Literature in English",
  ],
  "FACULTY OF EDUCATION": [
    "Biology Education – Biology, Chemistry, Mathematics/Physics",
    "Business Education (BED) – Mathematics, Economics, Government/Business Studies",
    "Chemistry Education – Chemistry, Physics, Biology/Mathematics",
    "Computer Science Education – Mathematics, Physics, Chemistry/Geography",
    "Economics Education – Economics, Mathematics, Physics/Geography/Government",
    "English and Literary Studies Education – Literature in English, History, CRS/Government",
    "History Education – History, Economics, Literature in English",
    "Mathematics Education – Mathematics, Physics, Chemistry",
    "Physics Education – Physics, Mathematics, Chemistry",
    "Political Science Education – Government, Literature in English, CRS/Economics",
    "Social Studies Education – CRS, Economics, Government",
  ],
  "FACULTY OF MANAGEMENT AND SOCIAL SCIENCES": [
    "Accounting – Mathematics, Economics, Business Studies/Government",
    "Banking and Finance – Mathematics, Economics, Business Studies/Government",
    "International Relations – Economics, Literature in English, Government",
    "Management – Mathematics, Economics, Business Studies/Government",
    "Marketing – Mathematics, Economics, Business Studies/Government",
    "Mass Communication – Government, Literature in English, CRS/Economics",
    "Political Science – Government, Literature in English, CRS/Economics",
    "Public Administration – Economics, Literature in English, Government",
    "Psychology – Economics, Government, Biology",
    "Sociology – Government, Literature in English, CRS/Economics",
    "Economics – Economics, Government, Mathematics",
  ],
  "NATURAL SCIENCES AND ENVIRONMENTAL STUDIES": [
    "Architecture – Physics, Mathematics, Chemistry",
    "Biotechnology – Biology, Chemistry, Physics/Mathematics",
    "Microbiology – Biology, Chemistry, Physics/Mathematics",
    "Biochemistry – Biology, Chemistry, Physics/Mathematics",
    "Industrial Chemistry – Chemistry, Physics, Biology/Mathematics",
    "Computer Science – Mathematics, Physics, Chemistry",
    "Mathematics – Mathematics, Physics, Chemistry",
    "Industrial Physics/Physics with Electronics/Renewable Energy/Geophysics – Physics, Mathematics, Chemistry",
  ],
  "COLLEGE OF MEDICINE AND NURSING": [
    "Medicine – Biology, Chemistry, Physics",
    "Nursing – Biology, Chemistry, Physics",
  ],
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS  = Array.from({ length: 80 }, (_, i) => String(2010 - i));
const COUNTRIES = ["Nigeria","Ghana","Cameroon","Benin","Togo","United Kingdom","United States","Canada","Other"];

/* ═══════════════════════════════════════════════════════════════════
   STUDENT STORE (simulated localStorage via module state)
═══════════════════════════════════════════════════════════════════ */
interface Student {
  id: string;
  name: string;
  email: string;
  faculty: string;
  programme: string;
  submittedAt: string;
  status: "complete" | "incomplete";
  paid: boolean;
  paymentRef: string;
}

let _students: Student[] = [
  { id:"STU-001", name:"Adaeze Okonkwo", email:"adaeze@gmail.com", faculty:"FACULTY OF ARTS", programme:"English and Literary Studies (ELS)…", submittedAt:"2024-11-01", status:"complete", paid:true,  paymentRef:"PAY-2024-001" },
  { id:"STU-002", name:"Emeka Nwosu",    email:"emeka@yahoo.com",  faculty:"FACULTY OF MANAGEMENT AND SOCIAL SCIENCES", programme:"Accounting…", submittedAt:"2024-11-03", status:"complete", paid:false, paymentRef:"" },
  { id:"STU-003", name:"Chisom Eze",     email:"chisom@mail.com",  faculty:"NATURAL SCIENCES AND ENVIRONMENTAL STUDIES", programme:"Biotechnology…", submittedAt:"2024-11-05", status:"incomplete", paid:false, paymentRef:"" },
  { id:"STU-004", name:"Kelechi Obi",    email:"kelechi@edu.ng",   faculty:"FACULTY OF EDUCATION", programme:"Mathematics Education…", submittedAt:"2024-11-06", status:"complete", paid:true,  paymentRef:"PAY-2024-004" },
  { id:"STU-005", name:"Ngozi Ibe",      email:"ngozi@gmail.com",  faculty:"COLLEGE OF MEDICINE AND NURSING", programme:"Medicine…", submittedAt:"2024-11-07", status:"complete", paid:false, paymentRef:"" },
];

let _idCounter = 6;
function saveStudent(data: FullForm): Student {
  const s: Student = {
    id: `STU-00${_idCounter++}`,
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    faculty: data.faculty,
    programme: data.programme.split("–")[0].trim(),
    submittedAt: new Date().toISOString().split("T")[0],
    status: "complete",
    paid: false,
    paymentRef: "",
  };
  _students = [..._students, s];
  return s;
}

/* ═══════════════════════════════════════════════════════════════════
   PRIMITIVE COMPONENTS
═══════════════════════════════════════════════════════════════════ */
const inputBase: React.CSSProperties = {
  width:"100%", boxSizing:"border-box",
  background:"#FAFCFB", border:`1.5px solid ${C.border}`,
  borderRadius:"8px", padding:"10px 14px",
  fontSize:"14px", color:C.slate, outline:"none",
  fontFamily:"'DM Sans', sans-serif",
  transition:"border-color 0.15s",
};

const Inp = ({ error, style, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) => (
  <div style={{ width:"100%" }}>
    <input {...p} style={{ ...inputBase, ...(error ? { borderColor:C.danger } : {}), ...style }} />
    {error && <p style={{ color:C.danger, fontSize:"11px", marginTop:"4px" }}>{error}</p>}
  </div>
);

const Sel = ({ error, children, style, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string; children: React.ReactNode }) => (
  <div style={{ width:"100%", position:"relative" }}>
    <select {...p} style={{ ...inputBase, appearance:"none", cursor:"pointer", ...(error ? { borderColor:C.danger } : {}), ...style }}>
      {children}
    </select>
    <span style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:C.muted, fontSize:"12px" }}>▾</span>
    {error && <p style={{ color:C.danger, fontSize:"11px", marginTop:"4px" }}>{error}</p>}
  </div>
);

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ display:"block", fontSize:"11px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, marginBottom:"6px" }}>
    {children}{required && <span style={{ color:C.danger, marginLeft:"3px" }}>*</span>}
  </label>
);

const F = ({ label, required, children, half }: { label?: string; required?: boolean; children: React.ReactNode; half?: boolean }) => (
  <div style={{ gridColumn: half ? "span 1" : "span 2", marginBottom:"4px" }}>
    {label && <Label required={required}>{label}</Label>}
    {children}
  </div>
);

const Grid = ({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:"16px 20px" }}>
    {children}
  </div>
);

const SectionDivider = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"28px 0 20px" }}>
    <div style={{ flex:1, height:"1px", background:C.border }} />
    <span style={{ fontSize:"10px", fontWeight:800, letterSpacing:"0.18em", color:C.primary, textTransform:"uppercase", whiteSpace:"nowrap" }}>{children}</span>
    <div style={{ flex:1, height:"1px", background:C.border }} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════════════════════════════ */
type Step = "subjects"|"personal"|"education"|"declaration";
const STEPS: { key:Step; label:string }[] = [
  { key:"subjects",    label:"Subjects" },
  { key:"personal",   label:"Personal" },
  { key:"education",  label:"Education" },
  { key:"declaration",label:"Declaration" },
];

const StepBar = ({ current }: { current: Step }) => {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <div style={{ marginBottom:"32px" }}>
      <div style={{ position:"relative", height:"3px", background:C.border, borderRadius:"2px", marginBottom:"20px" }}>
        <div style={{ position:"absolute", left:0, top:0, height:"3px", borderRadius:"2px", background:C.primary, width:`${(idx / (STEPS.length - 1)) * 100}%`, transition:"width 0.4s ease" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        {STEPS.map((s, i) => (
          <div key={s.key} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", flex:1 }}>
            <div style={{
              width:"32px", height:"32px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"12px", fontWeight:700, transition:"all 0.2s",
              background: i < idx ? C.primary : i === idx ? C.primary : "white",
              color: i <= idx ? "white" : C.hint,
              border: i > idx ? `2px solid ${C.border}` : "none",
              boxShadow: i === idx ? `0 0 0 4px ${C.primaryLt}` : "none",
            }}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
              color: i === idx ? C.primary : i < idx ? C.muted : C.hint }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* step heading */
const StepHeading = ({ n, title, sub }: { n:number; title:string; sub:string }) => (
  <div style={{ marginBottom:"24px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"4px" }}>
      <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:C.primaryDk, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ color:C.accent, fontSize:"11px", fontWeight:800 }}>{n}</span>
      </div>
      <h2 style={{ fontSize:"20px", fontWeight:700, color:C.slate, margin:0, fontFamily:"'DM Serif Display', Georgia, serif" }}>{title}</h2>
    </div>
    <p style={{ fontSize:"13px", color:C.muted, marginLeft:"40px", margin:"4px 0 0 40px", lineHeight:"1.5" }}>{sub}</p>
  </div>
);

/* nav */
const NavRow = ({ onBack, onNext, nextLabel="Continue", nextDisabled=false }: {
  onBack?:()=>void; onNext:()=>void; nextLabel?:string; nextDisabled?:boolean;
}) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"32px", paddingTop:"24px", borderTop:`1px solid ${C.border}` }}>
    {onBack
      ? <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:"6px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:"8px", padding:"10px 22px", fontSize:"13px", fontWeight:700, color:C.muted, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>← Back</button>
      : <div />}
    <button onClick={onNext} disabled={nextDisabled} style={{ display:"flex", alignItems:"center", gap:"6px", background: nextDisabled ? C.hint : C.primary, border:"none", borderRadius:"8px", padding:"11px 28px", fontSize:"13px", fontWeight:700, color:"white", cursor: nextDisabled ? "not-allowed" : "pointer", letterSpacing:"0.08em", textTransform:"uppercase", transition:"background 0.15s" }}>
      {nextLabel} {nextLabel !== "Submit" && "→"}
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════════ */
const AdminDashboard = ({ onBack }: { onBack:()=>void }) => {
  const [students, setStudents] = useState<Student[]>(_students);
  const [filter, setFilter] = useState<"all"|"complete"|"incomplete"|"paid"|"unpaid">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student|null>(null);


  const togglePaid = (id: string) => {
    const _tempStudent = _students.map(s => s.id === id ? { ...s, paid:!s.paid, paymentRef: !s.paid ? `PAY-${Date.now()}` : "" } : s);
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
          <button onClick={onBack} style={{ background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:"8px", color:"white", padding:"8px 18px", fontSize:"12px", fontWeight:700, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>
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

/* ═══════════════════════════════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════════════════════════════ */
const SuccessScreen = ({ name, id, onNew }: { name:string; id:string; onNew:()=>void }) => (
  <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"'DM Sans', sans-serif" }}>
    <div style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:"16px", maxWidth:"460px", width:"100%", padding:"48px 40px", textAlign:"center" }}>
      <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:C.primaryLt, border:`4px solid ${C.primary}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
        <span style={{ fontSize:"28px" }}>✓</span>
      </div>
      <p style={{ color:C.primary, fontSize:"11px", fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 8px" }}>Application Submitted</p>
      <h2 style={{ fontSize:"26px", fontWeight:700, color:C.slate, margin:"0 0 16px", fontFamily:"'DM Serif Display', Georgia, serif" }}>Thank You, {name}!</h2>
      <p style={{ fontSize:"14px", color:C.muted, lineHeight:"1.6", margin:"0 0 24px" }}>
        Your JUPEB application has been successfully received. Please proceed to make your payment at the bursary to complete your admission process.
      </p>
      <div style={{ background:C.accentLt, border:`1px solid #F0D0A0`, borderRadius:"10px", padding:"14px 20px", marginBottom:"28px" }}>
        <p style={{ fontSize:"11px", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:C.accent, margin:"0 0 4px" }}>Application Reference</p>
        <p style={{ fontSize:"20px", fontWeight:800, color:C.primaryDk, margin:0, letterSpacing:"0.05em" }}>{id}</p>
      </div>
      <button onClick={onNew} style={{ background:"white", border:`1.5px solid ${C.primary}`, borderRadius:"8px", color:C.primary, padding:"11px 28px", fontSize:"13px", fontWeight:700, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>
        New Application
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN FORM COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function JUPEBAdmissions() {
  const [page, setPage] = useState<"form"|"admin"|"success">("form");
  const [step, setStep] = useState<Step>("subjects");
  const [successData, setSuccessData] = useState<{ name:string; id:string } | null>(null);

  const { register, control, handleSubmit, trigger, watch, formState: { errors } } = useForm<FullForm>({
    resolver: zodResolver(fullSchema),
    mode: "onBlur",
    defaultValues: {
      education: Array(5).fill({}),
      sponsors: Array(3).fill({}),
      declaration: undefined,
    },
  });

  const { fields: eduFields } = useFieldArray({ control, name: "education" });
  const { fields: sponsorFields } = useFieldArray({ control, name: "sponsors" });

  const faculty = watch("faculty");

  const nav = (to: Step) => { window.scrollTo({ top:0, behavior:"smooth" }); setStep(to); };

  const tryNext = async (fields: (keyof FullForm)[], to: Step) => {
    const ok = await trigger(fields);
    if (ok) nav(to);
  };

  const onSubmit = (data: FullForm) => {
    const s = saveStudent(data);
    setSuccessData({ name: data.firstName, id: s.id });
    setPage("success");
  };

  if (page === "admin") return <AdminDashboard onBack={() => setPage("form")} />;
  if (page === "success" && successData) return (
    <SuccessScreen name={successData.name} id={successData.id} onNew={() => { setPage("form"); setStep("subjects"); }} />
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans', sans-serif" }}>
      {/* ── GOOGLE FONTS ── */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');`}</style>

      {/* ── HEADER ── */}
      <header style={{ background:C.primaryDk, position:"sticky", top:0, zIndex:30 }}>
        <div style={{ maxWidth:"860px", margin:"0 auto", padding:"0 20px", height:"62px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <img src="https://www.jotform.com/uploads/Anthony_Chinedu/form_files/GOUNI%20LOGO.66546a673bad29.99553637.jpg"
              alt="GOUNI" style={{ width:"44px", height:"44px", borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.accent}` }}
              onError={e => { const el = e.target as HTMLImageElement; el.style.display="none"; }} />
            <div>
              <p style={{ color:C.accent, fontSize:"10px", fontWeight:800, letterSpacing:"0.22em", textTransform:"uppercase", margin:0 }}>Godfrey Okoye University</p>
              <p style={{ color:"white", fontSize:"16px", fontWeight:700, margin:0 }}>JUPEB Application Form</p>
            </div>
          </div>
          <button onClick={() => setPage("admin")}
            style={{ background:"rgba(255,255,255,0.08)", border:`1.5px solid rgba(255,255,255,0.18)`, borderRadius:"8px", color:"white", padding:"8px 16px", fontSize:"12px", fontWeight:700, cursor:"pointer", letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:"6px" }}>
            Admin →
          </button>
        </div>
        <div style={{ height:"3px", background:`linear-gradient(90deg, ${C.primaryDk}, ${C.accent}, ${C.primaryDk})` }} />
      </header>

      {/* ── PAGE HEADING BAND ── */}
      <div style={{ background:"white", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:"860px", margin:"0 auto", padding:"20px 20px 18px", display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-end", gap:"12px" }}>
          <div>
            <p style={{ color:C.primary, fontSize:"10px", fontWeight:800, letterSpacing:"0.22em", textTransform:"uppercase", margin:"0 0 4px" }}>Online Application Portal · 2024/2025</p>
            <h1 style={{ fontSize:"clamp(20px, 4vw, 28px)", fontWeight:700, color:C.slate, margin:"0 0 4px", fontFamily:"'DM Serif Display', Georgia, serif" }}>
              JUPEB Preliminary Programme
            </h1>
            <p style={{ fontSize:"13px", color:C.muted, margin:0 }}>Joint Universities Preliminary Examinations Board — Admission Application</p>
          </div>
          <div style={{ background:C.primaryLt, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"10px 16px", display:"flex", gap:"8px", alignItems:"center" }}>
            <span style={{ fontSize:"16px" }}>🔒</span>
            <div>
              <p style={{ fontSize:"11px", fontWeight:700, color:C.primary, margin:0 }}>Secure Form</p>
              <p style={{ fontSize:"10px", color:C.muted, margin:0 }}>Your data is protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ELIGIBILITY NOTICE ── */}
      <div style={{ background:C.accentLt, borderBottom:`1px solid #E8C98A` }}>
        <div style={{ maxWidth:"860px", margin:"0 auto", padding:"12px 20px", display:"flex", gap:"10px", alignItems:"flex-start" }}>
          <span style={{ fontSize:"16px", flexShrink:0, marginTop:"1px" }}>ℹ️</span>
          <div style={{ fontSize:"12px", color:"#6B4800", lineHeight:"1.5" }}>
            <strong>Eligibility:</strong> Candidates must possess a minimum of 5 Credits (maximum two sittings) in at least 5 subjects, including English Language and Mathematics, relevant to their desired course.
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <main style={{ maxWidth:"860px", margin:"0 auto", padding:"28px 16px 48px" }}>
        <div style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:"14px", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          {/* sticky step bar */}
          <div style={{ padding:"24px 32px 0", borderBottom:`1px solid ${C.border}`, background:"white", position:"sticky", top:"65px", zIndex:20 }}>
            <StepBar current={step} />
          </div>

          <div style={{ padding:"28px 32px 32px" }}>

            {/* ══ STEP 1: SUBJECTS ══ */}
            {step === "subjects" && (
              <div>
                <StepHeading n={1} title="Subject Combination" sub="Select the faculty and your preferred JUPEB subject combination for your desired course of study." />

                <F label="Faculty / College" required>
                  <Sel error={errors.faculty?.message} {...register("faculty")}>
                    <option value="">— Select Faculty —</option>
                    {Object.keys(FACULTIES).map(f => <option key={f}>{f}</option>)}
                  </Sel>
                </F>

                <F label="Subject Combination / Programme" required>
                  <Sel error={errors.programme?.message} {...register("programme")} disabled={!faculty}>
                    <option value="">— Select Programme —</option>
                    {(faculty && FACULTIES[faculty] ? FACULTIES[faculty] : []).map(p => <option key={p}>{p}</option>)}
                  </Sel>
                </F>

                {watch("programme") && (
                  <div style={{ marginTop:"16px", background:C.primaryLt, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"14px 18px", display:"flex", gap:"10px" }}>
                    <span style={{ fontSize:"18px" }}>🎓</span>
                    <div>
                      <p style={{ fontSize:"11px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:C.primary, margin:"0 0 3px" }}>Selected Programme</p>
                      <p style={{ fontSize:"13px", color:C.slate, fontWeight:600, margin:0 }}>{watch("programme")}</p>
                    </div>
                  </div>
                )}

                <NavRow onNext={() => tryNext(["faculty","programme"], "personal")} />
              </div>
            )}

            {/* ══ STEP 2: PERSONAL ══ */}
            {step === "personal" && (
              <div>
                <StepHeading n={2} title="Personal Details" sub="Provide accurate personal information as it appears on your official documents." />

                <Grid>
                  <F label="First Name" required half>
                    <Inp error={errors.firstName?.message} {...register("firstName")} placeholder="Given name" />
                  </F>
                  <F label="Last Name" required half>
                    <Inp error={errors.lastName?.message} {...register("lastName")} placeholder="Surname" />
                  </F>
                </Grid>

                <F label="Other Names">
                  <Inp {...register("otherNames")} placeholder="Middle name (optional)" />
                </F>

                <Grid>
                  <F label="Gender" required half>
                    <Sel error={errors.gender?.message} {...register("gender")}>
                      <option value="">— Select —</option>
                      <option>Male</option><option>Female</option>
                    </Sel>
                  </F>
                  <F label="Marital Status" required half>
                    <Sel error={errors.maritalStatus?.message} {...register("maritalStatus")}>
                      <option value="">— Select —</option>
                      <option>Married</option><option>Single</option>
                    </Sel>
                  </F>
                </Grid>

                <Grid>
                  <F label="Email Address" required half>
                    <Inp error={errors.email?.message} {...register("email")} type="email" placeholder="example@email.com" />
                  </F>
                  <F label="Phone Number" required half>
                    <Inp error={errors.phone?.message} {...register("phone")} type="tel" placeholder="+234 800 000 0000" />
                  </F>
                </Grid>

                <F label="Nationality" required>
                  <Inp error={errors.nationality?.message} {...register("nationality")} placeholder="e.g. Nigerian" />
                </F>

                <SectionDivider>Contact Address</SectionDivider>

                <F label="Street Address" required>
                  <Inp error={errors.street?.message} {...register("street")} placeholder="Street address" style={{ marginBottom:"8px" }} />
                  <Inp {...register("street2")} placeholder="Apartment, suite, etc. (optional)" />
                </F>

                <Grid>
                  <F label="City" required half>
                    <Inp error={errors.city?.message} {...register("city")} />
                  </F>
                  <F label="State / Province" half>
                    <Inp {...register("stateProvince")} />
                  </F>
                  <F label="Postal / Zip Code" half>
                    <Inp {...register("postalCode")} />
                  </F>
                  <F label="Country" required half>
                    <Sel error={errors.country?.message} {...register("country")}>
                      <option value="">— Select Country —</option>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </Sel>
                  </F>
                </Grid>

                <SectionDivider>Background</SectionDivider>

                <Grid>
                  <F label="State of Origin" required half>
                    <Inp error={errors.stateOfOrigin?.message} {...register("stateOfOrigin")} />
                  </F>
                  <F label="L.G.A" required half>
                    <Inp error={errors.lga?.message} {...register("lga")} />
                  </F>
                </Grid>

                <F label="Date of Birth" required>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
                    <Sel error={errors.dobMonth?.message} {...register("dobMonth")}>
                      <option value="">Month</option>
                      {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </Sel>
                    <Sel error={errors.dobDay?.message} {...register("dobDay")}>
                      <option value="">Day</option>
                      {DAYS.map(d => <option key={d}>{d}</option>)}
                    </Sel>
                    <Sel error={errors.dobYear?.message} {...register("dobYear")}>
                      <option value="">Year</option>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </Sel>
                  </div>
                </F>

                <F label="Hobbies & Interests" required>
                  <Inp error={errors.hobbies?.message} {...register("hobbies")} placeholder="Reading, sports, music…" />
                </F>

                <NavRow
                  onBack={() => nav("subjects")}
                  onNext={() => tryNext(["firstName","lastName","gender","maritalStatus","email","phone","nationality","street","city","country","stateOfOrigin","lga","dobMonth","dobDay","dobYear","hobbies"], "education")}
                />
              </div>
            )}

            {/* ══ STEP 3: EDUCATION ══ */}
            {step === "education" && (
              <div>
                <StepHeading n={3} title="Educational Background" sub="List all educational institutions attended (post-primary and above). Add sponsors / guarantors below." />

                <SectionDivider>Educational Institutions</SectionDivider>

                <div style={{ overflowX:"auto", border:`1px solid ${C.border}`, borderRadius:"10px", marginBottom:"8px" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px", minWidth:"560px" }}>
                    <thead>
                      <tr style={{ background:"#F2F7F4" }}>
                        {["#","Institution Name","Location","Date From","Date To","Certificate Obtained"].map(h => (
                          <th key={h} style={{ textAlign:"left", padding:"10px 12px", fontSize:"10px", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {eduFields.map((f, i) => (
                        <tr key={f.id} style={{ borderBottom: i < eduFields.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "white" : "#FAFCFA" }}>
                          <td style={{ padding:"8px 12px", color:C.hint, fontWeight:700, fontSize:"11px" }}>{i + 1}</td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`education.${i}.institution`)} placeholder="School name" /></td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`education.${i}.location`)} placeholder="City" /></td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`education.${i}.dateFrom`)} placeholder="YYYY" style={{ minWidth:"70px" }} /></td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`education.${i}.dateTo`)} placeholder="YYYY" style={{ minWidth:"70px" }} /></td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`education.${i}.certificate`)} placeholder="e.g. WAEC" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <SectionDivider>Contact of Sponsor / Guardian</SectionDivider>

                <div style={{ overflowX:"auto", border:`1px solid ${C.border}`, borderRadius:"10px", marginBottom:"8px" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px", minWidth:"560px" }}>
                    <thead>
                      <tr style={{ background:"#F2F7F4" }}>
                        {["#","Name of Sponsor","Relationship","Address","Phone","Email"].map(h => (
                          <th key={h} style={{ textAlign:"left", padding:"10px 12px", fontSize:"10px", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sponsorFields.map((f, i) => (
                        <tr key={f.id} style={{ borderBottom: i < sponsorFields.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "white" : "#FAFCFA" }}>
                          <td style={{ padding:"8px 12px", color:C.hint, fontWeight:700, fontSize:"11px" }}>{i + 1}</td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`sponsors.${i}.name`)} placeholder="Full name" /></td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`sponsors.${i}.relationship`)} placeholder="Parent, Guardian…" /></td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`sponsors.${i}.address`)} placeholder="Address" /></td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`sponsors.${i}.phone`)} placeholder="Phone" /></td>
                          <td style={{ padding:"6px 8px" }}><Inp {...register(`sponsors.${i}.email`)} placeholder="Email" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <NavRow onBack={() => nav("personal")} onNext={() => nav("declaration")} />
              </div>
            )}

            {/* ══ STEP 4: DECLARATION ══ */}
            {step === "declaration" && (
              <div>
                <StepHeading n={4} title="Declaration & Submission" sub="Review your application, declare accuracy, and submit." />

                {/* Summary */}
                <div style={{ border:`1px solid ${C.border}`, borderRadius:"10px", overflow:"hidden", marginBottom:"24px" }}>
                  <div style={{ background:C.primaryDk, padding:"12px 18px" }}>
                    <p style={{ fontSize:"10px", fontWeight:800, letterSpacing:"0.18em", textTransform:"uppercase", color:C.accent, margin:0 }}>Application Summary</p>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:0 }}>
                    {[
                      { label:"Faculty", value:watch("faculty") || "—" },
                      { label:"Programme", value:(watch("programme") || "—").split("–")[0]?.trim() },
                      { label:"Full Name", value:[watch("firstName"),watch("lastName")].filter(Boolean).join(" ") || "—" },
                      { label:"Email", value:watch("email") || "—" },
                      { label:"Phone", value:watch("phone") || "—" },
                      { label:"Gender", value:watch("gender") || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, borderRight:`1px solid ${C.border}` }}>
                        <p style={{ fontSize:"10px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:C.hint, margin:"0 0 3px" }}>{label}</p>
                        <p style={{ fontSize:"13px", fontWeight:600, color:C.slate, margin:0, wordBreak:"break-word" }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <F label="How did you find us?" required>
                  <Sel error={errors.heardFrom?.message} {...register("heardFrom")}>
                    <option value="">— Please Select —</option>
                    {["Google","Radio","Television","University Website","Staff","Student","Others"].map(v => <option key={v}>{v}</option>)}
                  </Sel>
                </F>

                {watch("heardFrom") === "Others" && (
                  <F label="Please specify">
                    <Inp {...register("heardOther")} placeholder="Tell us how you found us" />
                  </F>
                )}

                <SectionDivider>Declaration</SectionDivider>

                <Controller name="declaration" control={control} render={({ field }) => (
                  <label style={{ display:"flex", gap:"14px", cursor:"pointer", border:`1.5px solid ${errors.declaration ? C.danger : C.border}`, borderRadius:"10px", padding:"16px 18px", background: field.value ? C.primaryLt : "white", transition:"all 0.15s" }}>
                    <div onClick={() => field.onChange(field.value ? undefined : true)}
                      style={{ width:"22px", height:"22px", borderRadius:"6px", border:`2px solid ${field.value ? C.primary : C.border}`, background: field.value ? C.primary : "white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"1px", transition:"all 0.15s" }}>
                      {field.value && <span style={{ color:"white", fontWeight:900, fontSize:"13px" }}>✓</span>}
                    </div>
                    <span style={{ fontSize:"13px", color:C.slate, lineHeight:"1.6" }}>
                      <span style={{ color:C.danger, fontWeight:700, marginRight:"4px" }}>*</span>
                      I hereby declare that the information given on this form, to the best of my knowledge and belief, is complete and accurate. I am aware that withholding information or giving false information automatically disqualifies me from admission. If admitted, I shall regard myself bound by the University&apos;s Statutes, Ordinances and Regulations.
                    </span>
                  </label>
                )} />
                {errors.declaration && <p style={{ color:C.danger, fontSize:"12px", marginTop:"6px" }}>{errors.declaration.message}</p>}

                <NavRow
                  onBack={() => nav("education")}
                  onNext={handleSubmit(onSubmit)}
                  nextLabel="Submit"
                  nextDisabled={!watch("declaration")}
                />
              </div>
            )}

          </div>
        </div>

        {/* footer */}
        <div style={{ marginTop:"32px", textAlign:"center" }}>
          <p style={{ fontSize:"12px", color:C.hint, margin:"0 0 4px" }}>© 2024 Godfrey Okoye University · JUPEB Preliminary Programme · Enugu, Nigeria</p>
          <p style={{ fontSize:"11px", color:C.hint, margin:0 }}>Enquiries: <span style={{ color:C.primary, fontWeight:600 }}>jupeb@gouni.edu.ng</span></p>
        </div>
      </main>
    </div>
  );
}
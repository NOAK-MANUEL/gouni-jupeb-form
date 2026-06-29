import { C } from "@/data/colors";

export const StepHeading = ({ n, title, sub }: { n:number; title:string; sub:string }) => (
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
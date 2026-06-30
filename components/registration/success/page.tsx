import { C } from "@/data/colors";

export const SuccessScreen = ({ name,  onNew }: { name:string;  onNew:()=>void }) => (
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
      {/* <div style={{ background:C.accentLt, border:`1px solid #F0D0A0`, borderRadius:"10px", padding:"14px 20px", marginBottom:"28px" }}>
        <p style={{ fontSize:"11px", fontWeight:800, letterSpacing:"0.12em", textTransform:"uppercase", color:C.accent, margin:"0 0 4px" }}>Application Reference</p>
        <p style={{ fontSize:"20px", fontWeight:800, color:C.primaryDk, margin:0, letterSpacing:"0.05em" }}>{id}</p>
      </div> */}
      <button onClick={onNew} style={{ background:"white", border:`1.5px solid ${C.primary}`, borderRadius:"8px", color:C.primary, padding:"11px 28px", fontSize:"13px", fontWeight:700, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>
        New Application
      </button>
    </div>
  </div>
);

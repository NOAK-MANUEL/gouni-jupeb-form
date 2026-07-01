import { C } from "@/data/colors";

export const FailedScreen = ({ name, message,intent, onClick }: { name:string; message:string; intent:string; onClick:()=>void }) => (
  <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"'DM Sans', sans-serif" }}>
    <div style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:"16px", maxWidth:"460px", width:"100%", padding:"48px 40px", textAlign:"center" }}>
      <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:C.danger, border:`4px solid ${C.danger}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
        <span style={{ fontSize:"28px" }}>X</span>
      </div>
      <p style={{ color:C.danger, fontSize:"11px", fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 8px" }}>Application Rejected</p>
      <h2 style={{ fontSize:"26px", fontWeight:700, color:C.slate, margin:"0 0 16px", fontFamily:"'DM Serif Display', Georgia, serif" }}>Kindly complete all form requirements</h2>
     
      <p style={{ fontSize:"14px", color:C.muted, lineHeight:"1.6", margin:"0 0 24px" }}>
        {message}
      </p>
      {
        intent === "payment" && (
      <button onClick={onClick} style={{ background:"white", border:`1.5px solid ${C.primary}`, borderRadius:"8px", color:C.primary, padding:"11px 28px", fontSize:"13px", fontWeight:700, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>
        Complete Payment
      </button>
        )
    }
    {
        intent === "custom" && (
          <button onClick={onClick} style={{ background:"white", border:`1.5px solid ${C.primary}`, borderRadius:"8px", color:C.primary, padding:"11px 28px", fontSize:"13px", fontWeight:700, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>
            Go Back
            </button>

        )
    }
    </div>
  </div>
);

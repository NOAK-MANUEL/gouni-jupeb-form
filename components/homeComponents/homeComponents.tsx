import { C } from "@/data/colors";
import { inputBase } from "@/data/inputBase";

export const Inp = ({ error, style, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) => (
  <div style={{ width:"100%" }}>
    <input {...p} style={{ ...inputBase, ...(error ? { borderColor:C.danger } : {}), ...style }} />
    {error && <p style={{ color:C.danger, fontSize:"11px", marginTop:"4px" }}>{error}</p>}
  </div>
);

export const Sel = ({ error, children, style, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string; children: React.ReactNode }) => (
  <div style={{ width:"100%", position:"relative" }}>
    <select {...p} style={{ ...inputBase, appearance:"none", cursor:"pointer", ...(error ? { borderColor:C.danger } : {}), ...style }}>
      {children}
    </select>
    <span style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:C.muted, fontSize:"12px" }}>▾</span>
    {error && <p style={{ color:C.danger, fontSize:"11px", marginTop:"4px" }}>{error}</p>}
  </div>
);

export const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ display:"block", fontSize:"11px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted, marginBottom:"6px" }}>
    {children}{required && <span style={{ color:C.danger, marginLeft:"3px" }}>*</span>}
  </label>
);

export const F = ({ label, required, children, half }: { label?: string; required?: boolean; children: React.ReactNode; half?: boolean }) => (
  <div style={{ gridColumn: half ? "span 1" : "span 2", marginBottom:"4px" }}>
    {label && <Label required={required}>{label}</Label>}
    {children}
  </div>
);

export const Grid = ({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:"16px 20px" }}>
    {children}
  </div>
);

export const SectionDivider = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"28px 0 20px" }}>
    <div style={{ flex:1, height:"1px", background:C.border }} />
    <span style={{ fontSize:"10px", fontWeight:800, letterSpacing:"0.18em", color:C.primary, textTransform:"uppercase", whiteSpace:"nowrap" }}>{children}</span>
    <div style={{ flex:1, height:"1px", background:C.border }} />
  </div>
);

export const AddBtn =({onAdd, label}: { onAdd: () => void; label: string }) => {
  return        <button onClick={onAdd} style={{ display:"flex", alignItems:"center", gap:"6px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:"8px", padding:"10px 22px", fontSize:"13px", fontWeight:700, color:C.muted, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</button>
  
}
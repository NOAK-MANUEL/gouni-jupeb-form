import { C } from "./colors";

export const inputBase: React.CSSProperties = {
  width:"100%", boxSizing:"border-box",
  background:"#FAFCFB", border:`1.5px solid ${C.border}`,
  borderRadius:"8px", padding:"10px 14px",
  fontSize:"14px", color:C.slate, outline:"none",
  fontFamily:"'DM Sans', sans-serif",
  transition:"border-color 0.15s",
};
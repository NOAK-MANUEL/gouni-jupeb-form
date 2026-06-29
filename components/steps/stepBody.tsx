import { C } from "@/data/colors";
import { Step } from "@/data/types";

export const STEPS: { key:Step; label:string }[] = [
  { key:"subjects",    label:"Subjects" },
  { key:"personal",   label:"Personal" },
  { key:"education",  label:"Education" },
  { key:"declaration",label:"Declaration" },
];

export const StepBar = ({ current }: { current: Step }) => {
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
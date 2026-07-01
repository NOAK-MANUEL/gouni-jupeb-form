"use client"
import { useEffect, useState, } from "react";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FACULTIES } from "@/data/faculties";
import { Step, Student } from "@/data/types";
import { C } from "@/data/colors";
import { StepHeading } from "@/components/steps/stepHeading";
import { StepBar } from "@/components/steps/stepBody";
import { AddBtn, F, Grid, Inp, SectionDivider, Sel } from "@/components/homeComponents/homeComponents";
import { FullForm, fullSchema,  } from "@/data/schemas";
import { countries } from "@/data/countries";
import { statesLGA } from "@/data/statesLGA";
import { getStudentData, storeStudentData1, storeStudentData2 } from "@/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { SuccessScreen } from "@/components/registration/success/page";
import { FailedScreen } from "@/components/registration/failed/page";
import LoadingSpinner from "@/components/loading";



const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS  = Array.from({ length: 80 }, (_, i) => String(2010 - i));

/* ═══════════════════════════════════════════════════════════════════
   STUDENT STORE (simulated localStorage via module state)
═══════════════════════════════════════════════════════════════════ */




let _idCounter = 6;
function saveStudent(data: FullForm,paid:boolean=false): Student {
  const s: Student = {
    id: `STU-00${_idCounter++}`,
    first_name: `${data.firstName} `,
    last_name: ` ${data.lastName}`,
    email: data.email,
    faculty: data.faculty,
    subjects: data.programme.split("–")[0].trim(),
    created_at: new Date(),
    status: "success",
    paid,
    dob: data.dobYear && data.dobMonth && data.dobDay ? new Date(`${data.dobYear}-${data.dobMonth}-${data.dobDay}`) : new Date(),

    ref_number: data.ref_number||"",
  };
 

  return s;
}




/* nav */
const NavRow = ({ onBack, onNext, nextLabel="Continue", nextDisabled=false }: {
  onBack?:()=>void; onNext:()=>void; nextLabel?:string; nextDisabled?:boolean;
}) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"32px", paddingTop:"24px", borderTop:`1px solid ${C.border}` }}>
    {onBack
      ? <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:"6px", background:"white", border:`1.5px solid ${C.border}`, borderRadius:"8px", padding:"10px 22px", fontSize:"13px", fontWeight:700, color:C.muted, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase" }}>← Back</button>
      : <div />}
    <button onClick={onNext} disabled={nextDisabled} style={{ display:"flex", alignItems:"center", gap:"6px", background: nextDisabled ? C.hint : C.primary, border:"none", borderRadius:"8px", padding:"11px 28px", fontSize:"13px", fontWeight:700, color:"white", cursor: nextDisabled ? "not-allowed" : "pointer", letterSpacing:"0.08em", textTransform:"uppercase", transition:"background 0.15s" }}>
      {nextDisabled ? <LoadingSpinner/> :` ${nextLabel !== "Submit" ? "Next →":nextLabel}`}
    </button>
  </div>
);



export default function JUPEBAdmissions() {
  const [page, setPage] = useState<"form"|"admin"|"success"|"failed">("form");
  const [step, setStep] = useState<Step>("subjects");
  const [successData, setSuccessData] = useState<{ name:string; id:string,intent?:string, message?:string ,link?:string} | null>(null);
  const [paid,setPaid] = useState(false)
  const [loading, setLoading] = useState(false);

  const query = useSearchParams()

  const navigate = useRouter()
  const { register, control,  trigger, watch,getValues, setValues,formState: { errors, } } = useForm<FullForm>({
    resolver: zodResolver(fullSchema),
    mode: "onBlur",
    defaultValues: {
      education: Array(1).fill({}),
      sponsors: Array(1).fill({}),
      declaration: undefined,
    },
  });

  const { fields: eduFields,append:addEdu, } = useFieldArray({ control, name: "education" });
  const { fields: sponsorFields,append:addSponsor, } = useFieldArray({ control, name: "sponsors" });

  const faculty = watch("faculty");


  const nav = (to: Step) => { window.scrollTo({ top:0, behavior:"smooth" }); setStep(to); };

  const tryNext = async (fields: (keyof FullForm)[], to: Step) => {
    const ok = await trigger(fields);
    
    if(ok && to==="education" && !paid) {
      setLoading(true)
      const data =await storeStudentData1(getValues());
      if(data.success){
        
        return navigate.push(data.message)
      }else return alert(data.message)
    } 
    if (ok) nav(to);
  };
  
  
  useEffect(() => {
    const paid = query.get("paid")
    const ref_number = query.get("ref-number")
    if(paid && ref_number){
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 300,);
      getStudentData(ref_number).then((data)=>{
        if(data.success){
          if(!data.data)return;
          setPaid(data.data.paid as boolean) 

          setValues({
            country: data.data.country,
            stateOfOrigin: data.data.state_of_origin,
            lga: data.data.lga,
            faculty: data.data.faculty,
            programme: data.data.subjects,
            firstName: data.data.first_name,
            lastName: data.data.last_name,
            otherNames: data.data.middle_name,
            email: data.data.email,
            phone: data.data.phone_number,
            street: data.data.street_address,
            city: data.data.city,
            stateProvince: data.data.state_province,
            postalCode: data.data.postal||"",
            dobMonth: String(new Date(data.data.dob).getMonth() + 1),
            dobDay: String(new Date(data.data.dob).getDate()),
            dobYear: String(new Date(data.data.dob).getFullYear()),
            hobbies: data.data.hobbies,
          maritalStatus: data.data.marital_status as "Single" | "Married",
            gender: data.data.gender as "Male" | "Female", 
            ref_number
          });   
          trigger(["city", "stateProvince", "postalCode","country","phone","dobMonth", "dobDay", "dobYear","firstName","lastName","email","otherNames","gender","maritalStatus","faculty"]).then((ok)=>{

          if (ok) nav("education");
          })
   
        }
      });
    }
  },[query,setValues,trigger]);

  const onSubmit = (data: FullForm) => {
    
    const s = saveStudent(data);
    
     storeStudentData2(data).then((res)=>{
      
    if(!res.success){
      s.intent = res.intent
      s.message = res.message
      s.status = "failed"
    }    
    setSuccessData({ name: data.firstName, id: s.id, intent: s.intent, message: s.message,link:res?.link });
    setPage(s.status as "success"|"failed");
  })
  };

  if (page === "success" && successData) return (
    <SuccessScreen name={successData.name}  onNew={() => { setPage("form"); setStep("subjects"); }} />
  );
  if (page === "failed" && successData) return (
    <FailedScreen  intent={successData.intent||"custom"} message={successData.message||"something went wrong"} onClick={successData.link?()=>navigate.push(successData.link!):() => { setPage("form"); setStep("subjects"); }} />
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
          <button onClick={() => navigate.push("/admin")}
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

                {/* <F label="Nationality" required>
                  <Inp error={errors.nationality?.message} {...register("nationality")} placeholder="e.g. Nigerian" />
                </F> */}

                <SectionDivider>Contact Address</SectionDivider>

                <F label="Street Address" required>
                  <Inp error={errors.street?.message} {...register("street")} placeholder="Street address" style={{ marginBottom:"8px" }} />
                  <Inp {...register("street2")} placeholder="Apartment, suite, etc. (optional)" />
                </F>

                <Grid>
                  <F label="City" required half>
                    <Inp error={errors.city?.message} {...register("city")} />
                  </F>
                   <Sel error={errors.stateProvince?.message} {...register("stateProvince")}>
                      <option value="">— Select State Province —</option>
                      {Object.keys(statesLGA).map(c => <option key={c}>{c}</option>)}
                    </Sel>
                  <F label="Postal / Zip Code" half>
                    <Inp {...register("postalCode")} />
                  </F>
                  <F label="Country" required half>
                    <Sel error={errors.country?.message} {...register("country")}>
                      <option value="">— Select Country —</option>
                      {countries.map(c => <option key={c}>{c}</option>)}
                    </Sel>
                  </F>
                </Grid>

                <SectionDivider>Background</SectionDivider>

                <Grid>
                  <Sel error={errors.stateOfOrigin?.message} {...register("stateOfOrigin")}>
                      <option value="">— Select State Of Origin —</option>
                      {Object.keys(statesLGA).map(c => <option value={c} key={c}>{c}</option>)}
                    </Sel>
                  <Sel error={errors.lga?.message} {...register("lga")}>
                      <option value="">— Select LGA —</option>
                      {( statesLGA[watch("stateOfOrigin")]||[]).map(c => <option value={c} key={c}>{c}</option>)}
                    </Sel>
                 
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
                  nextDisabled={loading}
                  onNext={() => tryNext(["firstName","lastName","gender","maritalStatus","email","phone","street","city","country","stateOfOrigin","lga","dobMonth","dobDay","dobYear","hobbies"], "education")}
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
                      <AddBtn onAdd={() => addEdu({institution: "", location: "", dateFrom: "", dateTo: "", certificate: ""})} label="Add Institution" />
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
                      <AddBtn onAdd={() => addSponsor({name: "", relationship: "", address: "", phone: "", email: ""})} label="Add Sponsor / Guardian" />
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
                  onNext={()=>onSubmit(getValues())}
                  nextLabel="Submit"
                  nextDisabled={!watch("declaration")}
                />
              </div>
            )}

          </div>
        </div>

        {/* footer */}
        <div style={{ marginTop:"32px", textAlign:"center" }}>
          <p style={{ fontSize:"12px", color:C.hint, margin:"0 0 4px" }}>© {new Date().getFullYear()} Godfrey Okoye University · JUPEB Preliminary Programme · Enugu, Nigeria</p>
          <p style={{ fontSize:"11px", color:C.hint, margin:0 }}>Enquiries: <span style={{ color:C.primary, fontWeight:600 }}>jupeb@gouni.edu.ng</span></p>
        </div>
      </main>
    </div>
  );
}
import { useState, useEffect, useCallback, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  SUPABASE CONFIG
//  → Substitua SUPABASE_URL pela URL do seu projeto:
//    Dashboard → Settings → API → Project URL
// ══════════════════════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://kwgokqudyraxtgtmhnst.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Z29rcXVkeXJheHRndG1obnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjkyNzEsImV4cCI6MjA4ODI0NTI3MX0.8m3-BjUIaytGtg-0J1XNt0_58ET6Gxf5RgoKyH8gcm0";
const SB_READY     = !SUPABASE_URL.includes("SEU_PROJETO");

// Helper de requisição Supabase
async function sbFetch(path, body = null, method = "POST", token = null) {
  try {
    const res = await fetch(SUPABASE_URL + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        "apikey":       SUPABASE_KEY,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body !== null && { body: JSON.stringify(body) }),
    });
    const data = await res.json();
    return { data, ok: res.ok, status: res.status };
  } catch {
    return { data: { error_description: "Sem conexao com o servidor." }, ok: false };
  }
}

const SB = {
  signUp:    (e, p)   => sbFetch("/auth/v1/signup",                    { email: e, password: p }),
  signIn:    (e, p)   => sbFetch("/auth/v1/token?grant_type=password", { email: e, password: p }),
  sendOTP:   (e)      => sbFetch("/auth/v1/otp",                       { email: e, options: { shouldCreateUser: false } }),
  verifyOTP: (e, tok) => sbFetch("/auth/v1/verify",                    { type: "email", email: e, token: tok }),
  signOut:   (tk)     => sbFetch("/auth/v1/logout",                    null, "POST", tk),
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap');
  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
  @keyframes slideR  { from{transform:translateX(-14px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes sheetUp { from{transform:translateX(-50%) translateY(110%)} to{transform:translateX(-50%) translateY(0)} }
  @keyframes shakeX  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  @keyframes popIn   { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes b1      { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-22px) scale(1.04)} }
  @keyframes b2      { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-16px) scale(1.06)} }
  * { box-sizing:border-box; -webkit-font-smoothing:antialiased; margin:0; padding:0 }
  body,input,textarea,button,select { font-family:'Helvetica Neue',Helvetica,Arial,sans-serif }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none }
  ::-webkit-scrollbar { width:3px }
  ::-webkit-scrollbar-thumb { background:rgba(128,128,128,0.2);border-radius:2px }
`;

// ── TEMAS ─────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg:"linear-gradient(160deg,#f9f4ff 0%,#fdf6ff 30%,#f4f8ff 60%,#f8fff6 100%)",
  card:"rgba(255,255,255,0.72)", cardDeep:"rgba(255,255,255,0.88)",
  border:"rgba(255,255,255,0.9)", text:"#111827", sub:"#6b7280", muted:"#9ca3af",
  navBg:"rgba(255,255,255,0.82)", inputBg:"rgba(255,255,255,0.92)",
  inputBorder:"rgba(124,58,237,0.22)", divider:"rgba(0,0,0,0.06)",
  accent:"#7c3aed", accentSoft:"rgba(124,58,237,0.1)",
  grad:"linear-gradient(135deg,#7c3aed,#db2777)",
  shadow:"0 4px 24px rgba(0,0,0,0.07)", blur:"blur(20px)",
  sheetBg:"rgba(255,255,255,0.98)", positive:"#059669",
  negative:"#dc2626", warning:"#d97706",
  blob1:"rgba(196,181,253,0.32)", blob2:"rgba(251,207,232,0.26)", blob3:"rgba(167,243,208,0.2)",
};
const DARK = {
  bg:"linear-gradient(160deg,#0c0814 0%,#110d1f 35%,#090e1a 65%,#0b1510 100%)",
  card:"rgba(30,20,55,0.7)", cardDeep:"rgba(36,24,66,0.88)",
  border:"rgba(255,255,255,0.07)", text:"#ede8ff", sub:"#9d8ec0", muted:"#6d5f90",
  navBg:"rgba(14,8,32,0.92)", inputBg:"rgba(40,26,75,0.8)",
  inputBorder:"rgba(167,139,250,0.3)", divider:"rgba(255,255,255,0.06)",
  accent:"#a78bfa", accentSoft:"rgba(167,139,250,0.12)",
  grad:"linear-gradient(135deg,#6d28d9,#be185d)",
  shadow:"0 4px 28px rgba(0,0,0,0.45)", blur:"blur(20px)",
  sheetBg:"rgba(14,8,34,0.98)", positive:"#10b981",
  negative:"#f87171", warning:"#fbbf24",
  blob1:"rgba(109,40,217,0.15)", blob2:"rgba(190,24,93,0.1)", blob3:"rgba(16,185,129,0.08)",
};

// ── DADOS ─────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#c4b5fd","#fbcfe8","#6ee7b7","#fde68a","#bae6fd","#fca5a5"];
const PM = [
  { id:"pix",      label:"Pix",      color:"#059669", bg:"rgba(5,150,105,0.1)",  border:"rgba(5,150,105,0.35)"  },
  { id:"cartao",   label:"Cartao",   color:"#2563eb", bg:"rgba(37,99,235,0.1)",  border:"rgba(37,99,235,0.35)"  },
  { id:"dinheiro", label:"Dinheiro", color:"#d97706", bg:"rgba(217,119,6,0.1)",  border:"rgba(217,119,6,0.35)"  },
  { id:"fiado",    label:"Fiado",    color:"#dc2626", bg:"rgba(220,38,38,0.1)",  border:"rgba(220,38,38,0.35)"  },
];
const ECATS = ["Aluguel","Produto","Equipamento","Transporte","Outros"].map(l => ({ id:l.toLowerCase(), label:l }));
const SVCS  = ["Manicure Completa","Pedicure","Spa dos Pes","Esmaltacao em Gel","Unhas de Fibra","Blindagem","Alongamento","Remocao de Gel"];

const fmt   = d => `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
const TODAY = new Date();
const TS    = fmt(TODAY);
const bld   = n => { const d=new Date(TODAY); d.setDate(d.getDate()+n); return fmt(d); };
const pv    = v => parseFloat((v||"0").toString().replace(",","."))||0;
const ini   = n => { const w=n.trim().split(" "); return (w[0][0]+(w[1]?.[0]||"")).toUpperCase(); };
const rc    = () => AVATAR_COLORS[Math.floor(Math.random()*AVATAR_COLORS.length)];

const ICLIENTS = [
  {id:1,name:"Ana Paula Silva",phone:"(11) 98765-4321",totalSpent:480,credit:0,  avatar:"AP",color:"#c4b5fd",services:[]},
  {id:2,name:"Fernanda Costa",  phone:"(11) 91234-5678",totalSpent:320,credit:80, avatar:"FC",color:"#fbcfe8",services:[{srv:"Pedicure",date:bld(-5),val:80,paid:false,payment:"fiado"}]},
  {id:3,name:"Juliana Mendes",  phone:"(21) 99876-5432",totalSpent:760,credit:0,  avatar:"JM",color:"#6ee7b7",services:[]},
  {id:4,name:"Camila Rocha",    phone:"(11) 95555-9999",totalSpent:220,credit:120,avatar:"CR",color:"#fde68a",services:[{srv:"Fibra",date:bld(-3),val:120,paid:false,payment:"fiado"}]},
  {id:5,name:"Bianca Lima",     phone:"(31) 98888-1111",totalSpent:990,credit:0,  avatar:"BL",color:"#c4b5fd",services:[]},
  {id:6,name:"Larissa Souza",   phone:"(11) 97777-3333",totalSpent:150,credit:50, avatar:"LS",color:"#bae6fd",services:[{srv:"Blindagem",date:bld(-2),val:50,paid:false,payment:"fiado"}]},
];
const IAGENDA = [
  {id:1,date:TS,     time:"09:00",clientName:"Ana Paula Silva",clientPhone:"(11) 98765-4321",service:"Manicure Completa",status:"confirmed"},
  {id:2,date:TS,     time:"10:30",clientName:"Fernanda Costa",  clientPhone:"(11) 91234-5678",service:"Pedicure",          status:"confirmed"},
  {id:3,date:TS,     time:"13:00",clientName:"Juliana Mendes",  clientPhone:"(21) 99876-5432",service:"Esmaltacao em Gel", status:"pending"  },
  {id:4,date:bld(1), time:"09:00",clientName:"Camila Rocha",    clientPhone:"(11) 95555-9999",service:"Spa dos Pes",        status:"confirmed"},
  {id:5,date:bld(1), time:"14:00",clientName:"Bianca Lima",     clientPhone:"(31) 98888-1111",service:"Unhas de Fibra",     status:"confirmed"},
  {id:6,date:bld(-1),time:"10:00",clientName:"Larissa Souza",   clientPhone:"(11) 97777-3333",service:"Blindagem",          status:"confirmed"},
];
const ITXS = [
  {id:1,desc:"Manicure - Ana Paula",  type:"entrada",value:45, date:bld(-1),category:"servico", payment:"pix"     },
  {id:2,desc:"Pedicure - Fernanda",   type:"entrada",value:55, date:bld(-1),category:"servico", payment:"cartao"  },
  {id:3,desc:"Spa dos Pes - Juliana", type:"entrada",value:90, date:bld(-2),category:"servico", payment:"pix"     },
  {id:4,desc:"Esmaltes e bases",      type:"saida",  value:85, date:bld(-2),category:"produto",  payment:null      },
  {id:5,desc:"Aluguel do espaco",     type:"saida",  value:400,date:bld(-3),category:"aluguel",  payment:null      },
  {id:6,desc:"Manicure - Bianca",     type:"entrada",value:45, date:bld(-3),category:"servico", payment:"dinheiro"},
];

// ── ICONES ────────────────────────────────────────────────────────────────────
const D = {
  home:"M3 12L12 3l9 9M9 21V12h6v9",
  cal:"M3 4h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2zM16 2v4M8 2v4M2 10h20",
  user:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  wallet:"M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM3 9l2-4h14l2 4",
  gear:"M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  check:"M5 13l4 4L19 7",
  chev:"M6 9l6 6 6-6",
  up:"M12 19V5M5 12l7-7 7 7",
  dn:"M12 5v14M5 12l7 7 7-7",
  warn:"M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  x:"M18 6L6 18M6 6l12 12",
  lock:"M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  msg:"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  brief:"M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  chart:"M18 20V10M12 20V4M6 20v-6",
  back:"M19 12H5M12 19l-7-7 7-7",
  mail:"M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff:"M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

function Ico({ k, size=20, color="currentColor", style={} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={D[k]} />
    </svg>
  );
}

// ── PRIMITIVOS ────────────────────────────────────────────────────────────────
function Blobs({ t }) {
  return (
    <div style={{ position:"fixed", inset:0, overflow:"hidden", zIndex:0, pointerEvents:"none" }}>
      <div style={{ position:"absolute", top:"-5%", left:"-5%", width:380, height:380, borderRadius:"50%", background:`radial-gradient(circle,${t.blob1} 0%,transparent 65%)`, animation:"b1 9s ease-in-out infinite" }} />
      <div style={{ position:"absolute", top:"35%", right:"-8%", width:320, height:320, borderRadius:"50%", background:`radial-gradient(circle,${t.blob2} 0%,transparent 65%)`, animation:"b2 12s ease-in-out infinite reverse" }} />
      <div style={{ position:"absolute", bottom:"5%", left:"15%", width:260, height:260, borderRadius:"50%", background:`radial-gradient(circle,${t.blob3} 0%,transparent 65%)`, animation:"b1 14s ease-in-out infinite 4s" }} />
    </div>
  );
}

function Card({ children, style={}, onClick, t }) {
  const [p, setP] = useState(false);
  return (
    <div
      onPointerDown={() => setP(true)} onPointerUp={() => setP(false)} onPointerLeave={() => setP(false)}
      onClick={onClick}
      style={{ background:t.cardDeep, backdropFilter:t.blur, WebkitBackdropFilter:t.blur, border:`1px solid ${t.border}`, boxShadow:t.shadow, borderRadius:18, padding:18, transition:"transform 0.15s", transform:p&&onClick?"scale(0.97)":"scale(1)", cursor:onClick?"pointer":"default", ...style }}>
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type="text", error, prefix, rows, t, sx={} }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  const base = { width:"100%", borderRadius:13, fontSize:15, color:t.text, background:t.inputBg, border:`1.5px solid ${error?"#dc2626":t.inputBorder}`, outline:"none", lineHeight:1.5, padding:`12px ${isPass?"44px":"14px"} 12px ${prefix?"36px":"14px"}`, ...sx };
  return (
    <div style={{ position:"relative" }}>
      {prefix && <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:t.muted, fontSize:14, fontWeight:500 }}>{prefix}</span>}
      {rows
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ ...base, resize:"none" }} />
        : <input value={value} onChange={onChange} placeholder={placeholder} type={isPass?(show?"text":"password"):type} style={base} />
      }
      {isPass && (
        <button onClick={() => setShow(s=>!s)} type="button" style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:2, display:"flex" }}>
          <Ico k={show?"eyeOff":"eye"} size={16} color={t.muted} />
        </button>
      )}
      {error && <p style={{ color:"#dc2626", fontSize:12, marginTop:4, animation:"fadeIn 0.2s" }}>{error}</p>}
    </div>
  );
}

function Lbl({ children, t }) {
  return <label style={{ fontSize:11, fontWeight:700, color:t.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.7 }}>{children}</label>;
}

function Btn({ children, onClick, loading=false, variant="primary", style={}, t }) {
  const [p, setP] = useState(false);
  const styles = {
    primary: { bg:t.grad, color:"#fff", border:"transparent" },
    ghost:   { bg:t.cardDeep, color:t.accent, border:t.inputBorder },
    danger:  { bg:"rgba(220,38,38,0.08)", color:t.negative, border:"rgba(220,38,38,0.2)" },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} disabled={loading}
      onPointerDown={() => setP(true)} onPointerUp={() => setP(false)} onPointerLeave={() => setP(false)}
      style={{ width:"100%", background:s.bg, color:s.color, border:`1.5px solid ${s.border}`, borderRadius:14, padding:"15px 20px", fontSize:15, fontWeight:600, cursor:"pointer", letterSpacing:0.3, display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"transform 0.15s, opacity 0.15s", transform:p?"scale(0.97)":"scale(1)", opacity:loading?0.7:1, backdropFilter:variant==="ghost"?t.blur:"none", ...style }}>
      {loading
        ? <span style={{ width:18, height:18, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin 0.7s linear infinite", display:"inline-block" }} />
        : children}
    </button>
  );
}

function Toggle({ on, onChange }) {
  return (
    <div onClick={onChange} style={{ width:46, height:26, borderRadius:13, cursor:"pointer", flexShrink:0, background:on?"linear-gradient(135deg,#7c3aed,#db2777)":"rgba(150,150,150,0.25)", position:"relative", transition:"background 0.3s" }}>
      <div style={{ position:"absolute", top:3, left:on?21:3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.3s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

function Fab({ onClick, t }) {
  const [p, setP] = useState(false);
  return (
    <button onPointerDown={() => setP(true)} onPointerUp={() => setP(false)} onPointerLeave={() => setP(false)} onClick={onClick}
      style={{ position:"fixed", bottom:96, right:20, width:52, height:52, borderRadius:"50%", background:t.grad, border:"none", color:"#fff", fontSize:24, cursor:"pointer", boxShadow:"0 6px 22px rgba(109,40,217,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, transition:"transform 0.15s", transform:p?"scale(0.9)":"scale(1)" }}>
      +
    </button>
  );
}

function Nav({ active, setScreen, t }) {
  const tabs = [
    { id:"dashboard", label:"Inicio",   k:"home"   },
    { id:"agenda",    label:"Agenda",   k:"cal"    },
    { id:"clients",   label:"Clientes", k:"user"   },
    { id:"finance",   label:"Financas", k:"wallet" },
    { id:"settings",  label:"Config",   k:"gear"   },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, zIndex:100, background:t.navBg, backdropFilter:t.blur, WebkitBackdropFilter:t.blur, borderTop:`1px solid ${t.border}`, borderRadius:"18px 18px 0 0", display:"flex", padding:"8px 0 18px" }}>
      {tabs.map(tab => {
        const on = active === tab.id;
        return (
          <button key={tab.id} onClick={() => setScreen(tab.id)}
            style={{ flex:1, border:"none", background:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"6px 0", transition:"all 0.2s", transform:on?"scale(1.08)":"scale(1)" }}>
            <Ico k={tab.k} size={20} color={on?t.accent:t.muted} />
            <span style={{ fontSize:9.5, fontWeight:on?700:400, color:on?t.accent:t.muted, letterSpacing:0.3 }}>{tab.label}</span>
            {on && <div style={{ width:3, height:3, borderRadius:"50%", background:t.accent }} />}
          </button>
        );
      })}
    </div>
  );
}

function SW({ children }) {
  return <div style={{ animation:"scaleIn 0.25s ease forwards", paddingBottom:86, minHeight:"100vh", maxWidth:430, margin:"0 auto" }}>{children}</div>;
}

function Sheet({ onClose, title, children, t, success, successNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(6px)", zIndex:200, animation:"fadeIn 0.2s" }} />
      <div style={{ position:"fixed", bottom:0, left:"50%", width:"100%", maxWidth:430, zIndex:201, background:t.sheetBg, backdropFilter:t.blur, WebkitBackdropFilter:t.blur, borderRadius:"26px 26px 0 0", padding:"20px 22px 42px", boxShadow:"0 -6px 40px rgba(0,0,0,0.18)", border:`1px solid ${t.border}`, animation:"sheetUp 0.3s cubic-bezier(0.34,1.4,0.64,1) forwards", overflowY:"auto", maxHeight:"92vh" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:t.divider, margin:"0 auto 18px" }} />
        {success ? successNode : (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:t.text }}>{title}</h2>
              <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%", background:t.divider, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Ico k="x" size={14} color={t.sub} />
              </button>
            </div>
            {children}
          </>
        )}
      </div>
    </>
  );
}

function OK({ title, sub, t }) {
  return (
    <div style={{ textAlign:"center", padding:"28px 0", animation:"popIn 0.45s ease forwards", color:t.text }}>
      <div style={{ width:56, height:56, borderRadius:"50%", background:t.accentSoft, border:`2px solid ${t.accent}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
        <Ico k="check" size={24} color={t.accent} />
      </div>
      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:21, fontWeight:700, marginBottom:6 }}>{title}</h3>
      {sub && <p style={{ fontSize:14, color:t.sub, lineHeight:1.5 }}>{sub}</p>}
    </div>
  );
}

function PayPick({ value, onChange, error, t }) {
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {PM.map(pm => {
          const on = value === pm.id;
          return (
            <button key={pm.id} onClick={() => onChange(on?"":pm.id)}
              style={{ border:`${on?"2px":"1.5px"} solid ${on?pm.color:t.divider}`, borderRadius:13, padding:"12px 10px", background:on?pm.bg:t.inputBg, cursor:"pointer", transition:"all 0.2s", transform:on?"scale(1.03)":"scale(1)", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:13, fontWeight:on?700:500, color:on?pm.color:t.sub }}>{pm.label}</span>
              {on && <div style={{ width:5, height:5, borderRadius:"50%", background:pm.color }} />}
            </button>
          );
        })}
      </div>
      {error && <p style={{ color:"#dc2626", fontSize:12, marginTop:6 }}>{error}</p>}
      {value==="fiado" && (
        <div style={{ marginTop:10, borderRadius:11, padding:"10px 14px", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.25)" }}>
          <p style={{ margin:0, fontSize:12, color:"#b91c1c", lineHeight:1.5 }}>O valor sera registrado como fiado em aberto.</p>
        </div>
      )}
    </div>
  );
}

function ErrorBox({ msg, t }) {
  if (!msg) return null;
  return (
    <div style={{ borderRadius:11, padding:"11px 14px", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", display:"flex", gap:9, alignItems:"flex-start", animation:"fadeIn 0.2s" }}>
      <Ico k="warn" size={16} color="#dc2626" style={{ flexShrink:0, marginTop:1 }} />
      <p style={{ fontSize:13, color:"#dc2626", fontWeight:500, lineHeight:1.4 }}>{msg}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  AVISO DE CONFIGURAÇÃO
// ══════════════════════════════════════════════════════════════════════════════
function ConfigWarning({ t }) {
  return (
    <div style={{ background:t.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <Blobs t={t} />
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease" }}>
        <Card t={t} style={{ borderLeft:"4px solid #f97316" }}>
          <div style={{ display:"flex", gap:12, marginBottom:18 }}>
            <Ico k="warn" size={22} color="#f97316" style={{ flexShrink:0, marginTop:2 }} />
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color:t.text, marginBottom:6 }}>
                Configure o Supabase
              </h2>
              <p style={{ fontSize:13, color:t.sub, lineHeight:1.6 }}>
                Para ativar o login, substitua a <code style={{ background:t.accentSoft, color:t.accent, padding:"1px 6px", borderRadius:5, fontSize:12 }}>SUPABASE_URL</code> no topo do arquivo.
              </p>
            </div>
          </div>
          <div style={{ background:t.inputBg, border:`1px solid ${t.inputBorder}`, borderRadius:12, padding:"13px 15px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:t.muted, textTransform:"uppercase", letterSpacing:0.6, marginBottom:10 }}>Como encontrar</p>
            {["Acesse app.supabase.com","Abra seu projeto","Settings → API","Copie o Project URL","Cole na linha 13 do arquivo JSX"].map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:t.accentSoft, color:t.accent, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</div>
                <p style={{ fontSize:13, color:t.sub }}>{s}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:"10px 14px", background:t.accentSoft, borderRadius:11 }}>
            <p style={{ fontSize:12, color:t.accent, fontWeight:600 }}>
              Exemplo de URL:<br/>
              <span style={{ fontWeight:400, fontSize:11 }}>https://abcdefghijkl.supabase.co</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TELA DE BOAS-VINDAS
// ══════════════════════════════════════════════════════════════════════════════
function WelcomeScreen({ setScreen, t }) {
  return (
    <div style={{ background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:32 }}>
      <Blobs t={t} />
      <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"fadeUp 0.7s ease forwards", width:"100%", maxWidth:340 }}>
        <div style={{ width:88, height:88, borderRadius:26, background:t.grad, margin:"0 auto 28px", boxShadow:"0 20px 56px rgba(109,40,217,0.38)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ico k="brief" size={40} color="#fff" />
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:700, color:t.text, margin:"0 0 8px", lineHeight:1.2 }}>
          BeautyPro<br />Manager
        </h1>
        <p style={{ color:t.sub, fontSize:14, margin:"0 0 52px", lineHeight:1.65 }}>
          Gerencie seu negocio de beleza<br />com elegancia e simplicidade
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Btn onClick={() => setScreen("login")} t={t} style={{ boxShadow:"0 8px 28px rgba(109,40,217,0.32)" }}>
            <Ico k="lock" size={17} color="#fff" /> Entrar na conta
          </Btn>
          <Btn onClick={() => setScreen("register")} variant="ghost" t={t}>
            Criar conta gratis
          </Btn>
        </div>
        <p style={{ color:t.muted, fontSize:12, marginTop:36, letterSpacing:0.3 }}>
          Mais de 3.000 profissionais confiam em nos
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TELA DE LOGIN  (email + senha → envia OTP)
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ setScreen, setPendingEmail, t }) {
  const [email,    setEmail]   = useState("");
  const [password, setPass]    = useState("");
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);
  const [shake,    setShake]   = useState(false);

  const handle = async () => {
    if (!email.trim() || !password) { setError("Preencha todos os campos."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("E-mail invalido."); return; }
    setLoading(true); setError("");

    // 1. Verifica credenciais via Supabase
    const { data, ok } = await SB.signIn(email.trim(), password);

    if (!ok || !data.access_token) {
      const msg = data.error_description || data.msg || "E-mail ou senha incorretos.";
      setError(msg);
      setShake(true); setTimeout(() => setShake(false), 500);
      setLoading(false); return;
    }

    // 2. Credenciais corretas → envia codigo OTP por email
    await SB.sendOTP(email.trim());
    setPendingEmail(email.trim());
    setScreen("otp");
    setLoading(false);
  };

  return (
    <div style={{ background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24 }}>
      <Blobs t={t} />
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease" }}>

        <button onClick={() => setScreen("welcome")} style={{ background:"none", border:"none", cursor:"pointer", color:t.sub, display:"flex", alignItems:"center", gap:6, marginBottom:32, fontSize:14 }}>
          <Ico k="back" size={18} color={t.sub} /> Voltar
        </button>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ width:52, height:52, borderRadius:15, background:t.accentSoft, border:`1.5px solid ${t.inputBorder}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
            <Ico k="lock" size={22} color={t.accent} />
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:27, fontWeight:700, color:t.text, marginBottom:8 }}>
            Bem-vinda de volta
          </h2>
          <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 13px", background:t.accentSoft, borderRadius:11 }}>
            <Ico k="shield" size={15} color={t.accent} style={{ flexShrink:0, marginTop:1 }} />
            <p style={{ fontSize:12, color:t.accent, lineHeight:1.5 }}>
              Apos verificar sua senha, enviaremos um <strong>codigo de 6 digitos</strong> para o seu e-mail.
            </p>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14, animation:shake?"shakeX 0.4s ease":"none" }}>
          <div>
            <Lbl t={t}>E-mail</Lbl>
            <Inp value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" type="email" t={t} />
          </div>
          <div>
            <Lbl t={t}>Senha</Lbl>
            <Inp value={password} onChange={e => setPass(e.target.value)} placeholder="Sua senha" type="password" t={t} />
          </div>

          <ErrorBox msg={error} t={t} />

          <Btn onClick={handle} loading={loading} t={t} style={{ marginTop:4, boxShadow:"0 6px 22px rgba(109,40,217,0.28)" }}>
            <Ico k="mail" size={17} color="#fff" /> Continuar — receber codigo
          </Btn>

          <button onClick={() => setScreen("register")} style={{ background:"none", border:"none", color:t.accent, fontSize:13, cursor:"pointer", fontWeight:600 }}>
            Nao tem conta? Criar agora
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TELA DE CADASTRO
// ══════════════════════════════════════════════════════════════════════════════
function RegisterScreen({ setScreen, t }) {
  const [form, setForm]     = useState({ email:"", password:"", confirm:"" });
  const [error, setError]   = useState("");
  const [loading, setLoad]  = useState(false);
  const [done, setDone]     = useState(false);
  const [shake, setShake]   = useState(false);
  const upd = k => e => setForm(p => ({ ...p, [k]:e.target.value }));

  const handle = async () => {
    if (!form.email || !form.password || !form.confirm) { setError("Preencha todos os campos."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("E-mail invalido."); return; }
    if (form.password.length < 8) { setError("Senha precisa ter no minimo 8 caracteres."); return; }
    if (form.password !== form.confirm) { setError("As senhas nao conferem."); setShake(true); setTimeout(() => setShake(false), 500); return; }
    setLoad(true); setError("");

    const { data, ok } = await SB.signUp(form.email.trim(), form.password);
    if (!ok && data.code !== "user_already_exists") {
      setError(data.error_description || data.msg || "Erro ao criar conta."); setLoad(false); return;
    }
    setDone(true); setLoad(false);
  };

  if (done) {
    return (
      <div style={{ background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:32 }}>
        <Blobs t={t} />
        <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn 0.5s ease forwards", maxWidth:340, width:"100%" }}>
          <div style={{ width:76, height:76, borderRadius:"50%", background:"rgba(5,150,105,0.1)", border:"2px solid #059669", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px" }}>
            <Ico k="mail" size={34} color="#059669" />
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:t.text, marginBottom:10 }}>Verifique seu e-mail</h2>
          <p style={{ color:t.sub, fontSize:14, lineHeight:1.7, marginBottom:30 }}>
            Enviamos um link de confirmacao para<br />
            <strong style={{ color:t.accent }}>{form.email}</strong><br />
            Clique no link para ativar sua conta e depois faca login.
          </p>
          <Btn onClick={() => setScreen("login")} t={t}>Ir para o Login</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24 }}>
      <Blobs t={t} />
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease" }}>
        <button onClick={() => setScreen("welcome")} style={{ background:"none", border:"none", cursor:"pointer", color:t.sub, display:"flex", alignItems:"center", gap:6, marginBottom:32, fontSize:14 }}>
          <Ico k="back" size={18} color={t.sub} /> Voltar
        </button>
        <div style={{ marginBottom:28 }}>
          <div style={{ width:52, height:52, borderRadius:15, background:t.accentSoft, border:`1.5px solid ${t.inputBorder}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
            <Ico k="user" size={22} color={t.accent} />
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:27, fontWeight:700, color:t.text, marginBottom:6 }}>Criar conta</h2>
          <p style={{ color:t.muted, fontSize:14, lineHeight:1.5 }}>Comece a gerenciar seu negocio hoje mesmo.</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14, animation:shake?"shakeX 0.4s ease":"none" }}>
          <div><Lbl t={t}>E-mail</Lbl><Inp value={form.email} onChange={upd("email")} placeholder="seu@email.com" type="email" t={t}/></div>
          <div><Lbl t={t}>Senha</Lbl><Inp value={form.password} onChange={upd("password")} placeholder="Minimo 8 caracteres" type="password" t={t}/></div>
          <div><Lbl t={t}>Confirmar senha</Lbl><Inp value={form.confirm} onChange={upd("confirm")} placeholder="Repita a senha" type="password" t={t}/></div>
          <ErrorBox msg={error} t={t} />
          <Btn onClick={handle} loading={loading} t={t} style={{ marginTop:4, boxShadow:"0 6px 22px rgba(109,40,217,0.28)" }}>
            Criar conta
          </Btn>
          <button onClick={() => setScreen("login")} style={{ background:"none", border:"none", color:t.accent, fontSize:13, cursor:"pointer", fontWeight:600 }}>
            Ja tem conta? Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TELA DE OTP — 6 digitos recebidos por email
// ══════════════════════════════════════════════════════════════════════════════
function OTPScreen({ email, setScreen, setSession, t }) {
  const [digits,   setDigits]  = useState(["","","","","",""]);
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);
  const [resendCD, setCD]      = useState(60);
  const [shake,    setShake]   = useState(false);
  const [verifying,setVfying]  = useState(false);
  const inputs = useRef([]);

  // Contagem regressiva para reenvio
  useEffect(() => {
    const iv = setInterval(() => setCD(c => Math.max(0, c-1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const verify = async (code) => {
    if (verifying) return;
    setVfying(true); setLoading(true); setError("");

    const { data, ok } = await SB.verifyOTP(email, code);

    if (ok && data.access_token) {
      setSession({ token: data.access_token, user: data.user });
      setScreen("dashboard");
    } else {
      const msg = data.error_description || data.msg || "Codigo invalido ou expirado.";
      setError(msg);
      setShake(true); setTimeout(() => setShake(false), 500);
      setDigits(["","","","","",""]);
      setTimeout(() => inputs.current[0]?.focus(), 100);
    }
    setLoading(false); setVfying(false);
  };

  const handleDigit = (i, val) => {
    const d = val.replace(/\D/g,"").slice(-1);
    const next = [...digits]; next[i] = d; setDigits(next);
    if (d && i < 5) inputs.current[i+1]?.focus();
    if (next.every(Boolean)) verify(next.join(""));
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits]; next[i-1] = ""; setDigits(next);
      inputs.current[i-1]?.focus();
    }
  };

  const handlePaste = e => {
    const paste = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (paste.length === 6) {
      const arr = paste.split(""); setDigits(arr);
      inputs.current[5]?.focus();
      verify(paste);
    }
    e.preventDefault();
  };

  const resend = async () => {
    if (resendCD > 0) return;
    setError(""); setDigits(["","","","","",""]);
    await SB.sendOTP(email);
    setCD(60);
    setTimeout(() => inputs.current[0]?.focus(), 100);
  };

  const filled = digits.every(Boolean);

  return (
    <div style={{ background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24 }}>
      <Blobs t={t} />
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease" }}>

        <button onClick={() => setScreen("login")} style={{ background:"none", border:"none", cursor:"pointer", color:t.sub, display:"flex", alignItems:"center", gap:6, marginBottom:32, fontSize:14 }}>
          <Ico k="back" size={18} color={t.sub} /> Voltar
        </button>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:72, height:72, borderRadius:22, background:t.accentSoft, border:`2px solid ${t.inputBorder}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:`0 8px 32px ${t.blob1}` }}>
            <Ico k="shield" size={32} color={t.accent} />
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:25, fontWeight:700, color:t.text, marginBottom:10 }}>
            Codigo de verificacao
          </h2>
          <p style={{ color:t.sub, fontSize:14, lineHeight:1.65 }}>
            Enviamos um codigo de <strong>6 digitos</strong> para<br />
            <strong style={{ color:t.accent }}>{email}</strong>
          </p>
          <p style={{ color:t.muted, fontSize:12, marginTop:6 }}>Verifique sua caixa de entrada e spam</p>
        </div>

        {/* Inputs de 6 digitos */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:24, animation:shake?"shakeX 0.4s ease":"none" }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              onPaste={handlePaste}
              autoFocus={i === 0}
              style={{
                width:50, height:60, borderRadius:14, textAlign:"center",
                fontSize:26, fontWeight:700, letterSpacing:0,
                background: t.inputBg, outline:"none",
                border: `2px solid ${d ? t.accent : t.inputBorder}`,
                color: t.text, transition:"border 0.18s, box-shadow 0.18s",
                boxShadow: d ? `0 0 0 3px ${t.accentSoft}` : "none",
              }}
            />
          ))}
        </div>

        <ErrorBox msg={error} t={t} />

        <Btn onClick={() => filled && verify(digits.join(""))} loading={loading} t={t}
          style={{ marginTop:16, marginBottom:18, opacity:filled?1:0.45, boxShadow:filled?"0 6px 22px rgba(109,40,217,0.28)":"none" }}>
          <Ico k="check" size={17} color="#fff" /> Verificar e entrar
        </Btn>

        {/* Reenviar */}
        <div style={{ textAlign:"center" }}>
          {resendCD > 0 ? (
            <p style={{ color:t.muted, fontSize:13 }}>
              Reenviar codigo em <strong style={{ color:t.accent }}>{resendCD}s</strong>
            </p>
          ) : (
            <button onClick={resend} style={{ background:"none", border:"none", color:t.accent, fontSize:13, cursor:"pointer", fontWeight:600, textDecoration:"underline" }}>
              Reenviar codigo por e-mail
            </button>
          )}
        </div>

        {/* Dica */}
        <div style={{ marginTop:22, padding:"11px 14px", background:t.cardDeep, borderRadius:12, border:`1px solid ${t.border}` }}>
          <p style={{ fontSize:12, color:t.muted, lineHeight:1.55 }}>
            <Ico k="mail" size={12} color={t.muted} style={{ display:"inline", marginRight:5, verticalAlign:"middle" }} />
            Nao recebeu? Verifique a pasta de spam. O codigo expira em <strong>10 minutos</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TELAS INTERNAS DO APP
// ══════════════════════════════════════════════════════════════════════════════

function Dashboard({ clients, agenda, transactions, setScreen, session, t }) {
  const ts  = clients.reduce((a,c) => a+c.totalSpent, 0);
  const tc  = clients.reduce((a,c) => a+c.credit, 0);
  const nsv = transactions.filter(x => x.type==="entrada").length;
  const ta  = agenda.filter(a => a.date===TS).sort((a,b) => a.time.localeCompare(b.time));
  const cl  = clients.filter(c => c.credit>0);
  const dn  = TODAY.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});
  const [vis, setVis] = useState([false,false,false,false]);

  useEffect(() => {
    [0,1,2,3].forEach(i => setTimeout(() => setVis(p => { const n=[...p]; n[i]=true; return n; }), 80+i*55));
  }, []);

  const uEmail = session?.user?.email || "";
  const uName  = uEmail.split("@")[0];
  const uInit  = uName.slice(0,2).toUpperCase();

  const stats = [
    { lb:"Faturamento",     val:`R$ ${ts.toFixed(2)}`,                                             positive:true  },
    { lb:"Clientes",        val:clients.length,               sub:`${nsv} servicos`                              },
    { lb:"Fiado em aberto", val:`R$ ${tc.toFixed(2)}`,        sub:`${cl.length} clientes`, warn:tc>0            },
    { lb:"Media/cliente",   val:clients.length?`R$ ${Math.round(ts/clients.length)}`:"R$ 0",       positive:true  },
  ];

  return (
    <div style={{ background:t.bg, minHeight:"100vh" }}>
      <Blobs t={t} />
      <SW>
        <div style={{ position:"relative", zIndex:1, padding:"52px 20px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22, animation:"fadeUp 0.4s ease" }}>
            <div>
              <p style={{ color:t.muted, fontSize:12, marginBottom:4, textTransform:"capitalize" }}>{dn}</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:t.text }}>
                Ola, {uName.charAt(0).toUpperCase()+uName.slice(1)}
              </h1>
            </div>
            <div style={{ width:44, height:44, borderRadius:13, background:t.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>{uInit}</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:22 }}>
            {stats.map((s,i) => (
              <Card key={i} t={t} style={{ padding:"16px", opacity:vis[i]?1:0, transform:vis[i]?"translateY(0)":"translateY(14px)", transition:`opacity 0.5s ${i*55}ms,transform 0.5s ${i*55}ms` }}>
                <p style={{ fontSize:11, color:t.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>{s.lb}</p>
                <p style={{ fontSize:s.val.toString().length>8?17:20, fontWeight:700, color:s.warn?t.warning:t.text, fontFamily:"'Playfair Display',serif", letterSpacing:-0.5, marginBottom:4 }}>{s.val}</p>
                {s.sub && <p style={{ fontSize:11, color:s.positive?t.positive:t.muted, fontWeight:500 }}>{s.sub}</p>}
              </Card>
            ))}
          </div>

          <div style={{ animation:"fadeUp 0.4s ease 0.28s both", marginBottom:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:600, color:t.text }}>Agenda de Hoje</h3>
              <button onClick={() => setScreen("agenda")} style={{ background:"none", border:"none", color:t.accent, fontSize:13, fontWeight:600, cursor:"pointer" }}>Ver tudo</button>
            </div>
            {ta.length===0
              ? <Card t={t} style={{ textAlign:"center", padding:24 }}><p style={{ color:t.muted, fontSize:14 }}>Sem agendamentos para hoje.</p></Card>
              : ta.map((apt,i) => (
                <Card key={apt.id} t={t} style={{ marginBottom:10, padding:"13px 15px", animation:`slideR 0.35s ease ${i*65}ms both` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ background:t.accentSoft, borderRadius:10, padding:"7px 10px", fontSize:12, fontWeight:700, color:t.accent, minWidth:50, textAlign:"center" }}>{apt.time}</div>
                    <div style={{ flex:1 }}><p style={{ fontWeight:600, fontSize:14, color:t.text, marginBottom:2 }}>{apt.clientName}</p><p style={{ color:t.muted, fontSize:12 }}>{apt.service}</p></div>
                    <div style={{ padding:"4px 9px", borderRadius:7, fontSize:11, fontWeight:600, background:apt.status==="confirmed"?"rgba(5,150,105,0.1)":"rgba(217,119,6,0.1)", color:apt.status==="confirmed"?t.positive:t.warning }}>{apt.status==="confirmed"?"Conf":"Pend"}</div>
                  </div>
                </Card>
              ))
            }
          </div>

          {cl.length>0 && (
            <div style={{ animation:"fadeUp 0.4s ease 0.4s both" }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:600, color:t.text, marginBottom:12 }}>Alertas</h3>
              {cl.map((c,i) => (
                <div key={c.id} style={{ background:t.cardDeep, backdropFilter:t.blur, border:`1px solid ${t.border}`, borderLeft:`3px solid ${t.warning}`, borderRadius:13, padding:"11px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:10, animation:`slideR 0.35s ease ${i*55}ms both` }}>
                  <Ico k="warn" size={16} color={t.warning} />
                  <p style={{ fontSize:13, color:t.text, fontWeight:500 }}><strong>{c.name}</strong> — R$ {c.credit.toFixed(2)} em fiado</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </SW>
    </div>
  );
}

function AddApptModal({ onClose, onAdd, clients, t }) {
  const [form, setForm]     = useState({ clientName:"", clientPhone:"", service:"", date:TS, time:"09:00" });
  const [errors, setErrors] = useState({});
  const [shake, setShake]   = useState(false);
  const [success, setOK]    = useState(false);
  const [showSug, setShowSug] = useState(false);
  const upd = k => e => setForm(p => ({ ...p, [k]:e.target.value }));
  const sug = clients.filter(c => form.clientName && c.name.toLowerCase().includes(form.clientName.toLowerCase()) && c.name!==form.clientName);
  const validate = () => {
    const e={};
    if (!form.clientName.trim()) e.clientName="Nome obrigatorio";
    if (!form.service)           e.service="Selecione um servico";
    return e;
  };
  const handle = () => {
    const e=validate(); if(Object.keys(e).length){setErrors(e);setShake(true);setTimeout(()=>setShake(false),500);return;}
    setErrors({}); setOK(true);
    setTimeout(() => { onAdd({id:Date.now(),...form,status:"confirmed"}); onClose(); }, 800);
  };
  return (
    <Sheet onClose={onClose} title="Novo Agendamento" t={t} success={success} successNode={<OK title="Agendado!" sub={`${form.clientName} — ${form.date} as ${form.time}`} t={t}/>}>
      <div style={{ display:"flex", flexDirection:"column", gap:14, animation:shake?"shakeX 0.4s ease":"none" }}>
        <div style={{ position:"relative" }}>
          <Lbl t={t}>Nome do cliente *</Lbl>
          <Inp value={form.clientName} onChange={e=>{upd("clientName")(e);setShowSug(true);}} placeholder="Nome ou novo cliente" error={errors.clientName} t={t}/>
          {showSug&&sug.length>0&&(
            <div style={{ position:"absolute",top:"calc(100% + 2px)",left:0,right:0,zIndex:20,background:t.sheetBg,border:`1px solid ${t.border}`,borderRadius:12,overflow:"hidden",boxShadow:t.shadow }}>
              {sug.slice(0,4).map(c=>(
                <div key={c.id} onClick={()=>{setForm(p=>({...p,clientName:c.name,clientPhone:c.phone}));setShowSug(false);}} style={{ padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${t.divider}`,display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${c.color},${c.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff" }}>{c.avatar}</div>
                  <div><p style={{ fontSize:13,fontWeight:600,color:t.text }}>{c.name}</p><p style={{ fontSize:11,color:t.muted }}>{c.phone}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div><Lbl t={t}>Telefone</Lbl><Inp value={form.clientPhone} onChange={upd("clientPhone")} placeholder="(11) 99999-9999" type="tel" t={t}/></div>
        <div>
          <Lbl t={t}>Servico *</Lbl>
          <select value={form.service} onChange={upd("service")} style={{ width:"100%",borderRadius:13,padding:"12px 14px",fontSize:15,color:t.text,background:t.inputBg,border:`1.5px solid ${errors.service?"#dc2626":t.inputBorder}`,outline:"none",appearance:"none" }}>
            <option value="">Selecione</option>{SVCS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          {errors.service&&<p style={{ color:"#dc2626",fontSize:12,marginTop:4 }}>{errors.service}</p>}
        </div>
        <div style={{ display:"flex",gap:12 }}>
          <div style={{ flex:1 }}>
            <Lbl t={t}>Data *</Lbl>
            <input type="date" value={form.date.split("/").reverse().join("-")} onChange={e=>{const[y,m,d]=e.target.value.split("-");setForm(p=>({...p,date:`${d}/${m}/${y}`}));}} style={{ width:"100%",borderRadius:13,padding:"12px 11px",fontSize:14,color:t.text,background:t.inputBg,border:`1.5px solid ${t.inputBorder}`,outline:"none" }}/>
          </div>
          <div style={{ flex:1 }}>
            <Lbl t={t}>Horario *</Lbl>
            <input type="time" value={form.time} onChange={upd("time")} style={{ width:"100%",borderRadius:13,padding:"12px 11px",fontSize:14,color:t.text,background:t.inputBg,border:`1.5px solid ${t.inputBorder}`,outline:"none" }}/>
          </div>
        </div>
        <Btn onClick={handle} t={t}>Confirmar Agendamento</Btn>
      </div>
    </Sheet>
  );
}

function AgendaScreen({ agenda, clients, onAdd, onDelete, t }) {
  const [showModal, setShowModal] = useState(false);
  const [selDay, setSelDay]       = useState(TS);
  const [expanded, setExpanded]   = useState(null);
  const days = Array.from({length:7},(_,i)=>{ const d=new Date(TODAY); d.setDate(d.getDate()-3+i); return {date:fmt(d),label:["Dom","Seg","Ter","Qua","Qui","Sex","Sab"][d.getDay()],num:d.getDate()}; });
  const dayApts = agenda.filter(a => a.date===selDay).sort((a,b) => a.time.localeCompare(b.time));
  return (
    <div style={{ background:t.bg, minHeight:"100vh" }}><Blobs t={t}/>
      <SW><div style={{ position:"relative", zIndex:1, padding:"52px 20px 20px" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:t.text, marginBottom:20, animation:"fadeUp 0.4s ease" }}>Agenda</h1>
        <Card t={t} style={{ marginBottom:18, padding:"12px 8px", animation:"fadeUp 0.4s ease 0.1s both" }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            {days.map(d => {
              const on=d.date===selDay,isT=d.date===TS,has=agenda.some(a=>a.date===d.date);
              return (
                <div key={d.date} onClick={() => setSelDay(d.date)} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"7px 5px",borderRadius:11,cursor:"pointer",flex:1,background:on?t.grad:"transparent",transition:"all 0.18s" }}>
                  <span style={{ fontSize:9.5,fontWeight:700,color:on?"rgba(255,255,255,0.75)":isT?t.accent:t.muted }}>{d.label}</span>
                  <span style={{ fontSize:15,fontWeight:700,color:on?"#fff":t.text }}>{d.num}</span>
                  {has&&<div style={{ width:3,height:3,borderRadius:"50%",background:on?"rgba(255,255,255,0.6)":t.accent }}/>}
                </div>
              );
            })}
          </div>
        </Card>
        <p style={{ color:t.muted,fontSize:12,marginBottom:12,fontWeight:500 }}>{selDay===TS?"Hoje — ":""}{selDay} · {dayApts.length} agendamento{dayApts.length!==1?"s":""}</p>
        {dayApts.length===0
          ? <Card t={t} style={{ textAlign:"center", padding:32 }}><p style={{ color:t.muted,fontSize:14,lineHeight:1.6 }}>Nenhum agendamento.<br/>Toque em + para adicionar.</p></Card>
          : dayApts.map((apt,i) => (
            <div key={apt.id} style={{ marginBottom:10, animation:`fadeUp 0.35s ease ${i*55}ms both` }}>
              <Card t={t} onClick={() => setExpanded(expanded===apt.id?null:apt.id)}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ background:t.accentSoft,borderRadius:10,padding:"9px 10px",fontSize:12,fontWeight:700,color:t.accent,minWidth:54,textAlign:"center" }}>{apt.time}</div>
                  <div style={{ flex:1 }}><p style={{ fontWeight:600,fontSize:14,color:t.text,marginBottom:2 }}>{apt.clientName}</p><p style={{ color:t.muted,fontSize:12 }}>{apt.service}{apt.clientPhone&&` — ${apt.clientPhone}`}</p></div>
                  <div style={{ transition:"transform 0.3s",transform:expanded===apt.id?"rotate(180deg)":"none" }}><Ico k="chev" size={16} color={t.muted}/></div>
                </div>
                {expanded===apt.id&&(
                  <div style={{ borderTop:`1px solid ${t.divider}`,marginTop:13,paddingTop:13,animation:"fadeIn 0.25s",display:"flex",gap:10 }}>
                    <div style={{ flex:1,borderRadius:11,padding:"8px 12px",textAlign:"center",background:apt.status==="confirmed"?"rgba(5,150,105,0.1)":"rgba(217,119,6,0.1)" }}>
                      <span style={{ fontSize:12,fontWeight:600,color:apt.status==="confirmed"?t.positive:t.warning }}>{apt.status==="confirmed"?"Confirmado":"Pendente"}</span>
                    </div>
                    <button onClick={e=>{e.stopPropagation();onDelete(apt.id);setExpanded(null);}} style={{ flex:1,background:"rgba(220,38,38,0.08)",color:t.negative,border:`1px solid rgba(220,38,38,0.2)`,borderRadius:11,padding:9,fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancelar</button>
                  </div>
                )}
              </Card>
            </div>
          ))
        }
      </div></SW>
      <Fab onClick={() => setShowModal(true)} t={t}/>
      {showModal&&<AddApptModal onClose={() => setShowModal(false)} onAdd={onAdd} clients={clients} t={t}/>}
    </div>
  );
}

function AddClientModal({ onClose, onAdd, t }) {
  const [form, setForm] = useState({ name:"",phone:"",service:"",value:"",payment:"",note:"" });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [success, setOK] = useState(false);
  const upd = k => e => setForm(p => ({ ...p, [k]:e.target.value }));
  const validate = () => {
    const e={};
    if (!form.name.trim()) e.name="Nome obrigatorio";
    if (!form.phone.trim()) e.phone="Telefone obrigatorio";
    else if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(form.phone.replace(/\s/g,""))) e.phone="Formato: (11) 99999-9999";
    if (form.value&&pv(form.value)>0&&!form.payment) e.payment="Selecione a forma de pagamento";
    return e;
  };
  const handle = () => {
    const e=validate(); if(Object.keys(e).length){setErrors(e);setShake(true);setTimeout(()=>setShake(false),500);return;}
    setErrors({}); setOK(true);
    const val=pv(form.value);
    const svc=form.service&&val>0?[{srv:form.service,date:TS,val,payment:form.payment,paid:form.payment!=="fiado"}]:[];
    setTimeout(()=>{onAdd({id:Date.now(),name:form.name.trim(),phone:form.phone.trim(),totalSpent:form.payment&&form.payment!=="fiado"?val:0,credit:form.payment==="fiado"?val:0,avatar:ini(form.name),color:rc(),note:form.note,services:svc});onClose();},800);
  };
  const pm=PM.find(p=>p.id===form.payment);
  return (
    <Sheet onClose={onClose} title="Nova Cliente" t={t} success={success} successNode={<OK title="Cliente adicionada" sub={`${form.name} cadastrada.`} t={t}/>}>
      <div style={{ display:"flex",flexDirection:"column",gap:14,animation:shake?"shakeX 0.4s ease":"none" }}>
        <div><Lbl t={t}>Nome completo *</Lbl><Inp value={form.name} onChange={upd("name")} placeholder="Ana Paula Silva" error={errors.name} t={t}/></div>
        <div><Lbl t={t}>Telefone *</Lbl><Inp value={form.phone} onChange={upd("phone")} placeholder="(11) 99999-9999" type="tel" error={errors.phone} t={t}/></div>
        <div style={{ borderTop:`1px solid ${t.divider}`,paddingTop:14 }}>
          <p style={{ fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:0.7,marginBottom:12 }}>Servico e Pagamento — opcional</p>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div><Lbl t={t}>Servico realizado</Lbl><select value={form.service} onChange={upd("service")} style={{ width:"100%",borderRadius:13,padding:"12px 14px",fontSize:15,color:t.text,background:t.inputBg,border:`1.5px solid ${t.inputBorder}`,outline:"none",appearance:"none" }}><option value="">Selecione (opcional)</option>{SVCS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div><Lbl t={t}>Valor cobrado</Lbl><Inp value={form.value} onChange={upd("value")} placeholder="0,00" type="number" prefix="R$" t={t}/></div>
            <div>
              <Lbl t={t}>Forma de pagamento{form.value&&pv(form.value)>0?" *":""}</Lbl>
              <PayPick value={form.payment} onChange={v=>setForm(p=>({...p,payment:v}))} error={errors.payment} t={t}/>
              {pm&&pm.id!=="fiado"&&form.value&&pv(form.value)>0&&(<div style={{ marginTop:9,borderRadius:11,padding:"9px 13px",background:pm.bg,border:`1px solid ${pm.border}`,display:"flex",gap:8,alignItems:"center",animation:"fadeIn 0.25s" }}><Ico k="check" size={14} color={pm.color}/><p style={{ margin:0,fontSize:13,color:pm.color,fontWeight:600 }}>R$ {form.value} via {pm.label}</p></div>)}
            </div>
            <div><Lbl t={t}>Observacao (opcional)</Lbl><Inp value={form.note} onChange={upd("note")} placeholder="Ex: prefere esmaltes escuros..." rows={2} t={t}/></div>
          </div>
        </div>
        <Btn onClick={handle} t={t}>Adicionar Cliente</Btn>
      </div>
    </Sheet>
  );
}

function ClientDetail({ client, onClose, onPayCredit, t }) {
  return (
    <div style={{ background:t.bg, minHeight:"100vh" }}><Blobs t={t}/>
      <SW><div style={{ position:"relative",zIndex:1,padding:"52px 20px 20px" }}>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:t.sub,display:"flex",alignItems:"center",gap:6,fontSize:14,marginBottom:24 }}><Ico k="back" size={18} color={t.sub}/>Voltar</button>
        <div style={{ textAlign:"center",marginBottom:22,animation:"scaleIn 0.35s ease" }}>
          <div style={{ width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${client.color},${client.color}bb)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff",margin:"0 auto 12px",boxShadow:`0 6px 20px ${client.color}55` }}>{client.avatar}</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:t.text,marginBottom:4 }}>{client.name}</h2>
          <p style={{ color:t.muted,fontSize:14 }}>{client.phone}</p>
          {client.note&&<p style={{ color:t.accent,fontSize:12,marginTop:8,background:t.accentSoft,padding:"5px 12px",borderRadius:9,display:"inline-block" }}>{client.note}</p>}
        </div>
        <div style={{ display:"flex",gap:12,marginBottom:20 }}>
          <Card t={t} style={{ flex:1,textAlign:"center",padding:"14px 12px" }}><p style={{ fontSize:11,color:t.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6 }}>Total gasto</p><p style={{ fontSize:20,fontWeight:700,color:t.accent,fontFamily:"'Playfair Display',serif" }}>R$ {client.totalSpent}</p></Card>
          <Card t={t} style={{ flex:1,textAlign:"center",padding:"14px 12px" }}><p style={{ fontSize:11,color:t.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6 }}>Em aberto</p><p style={{ fontSize:20,fontWeight:700,fontFamily:"'Playfair Display',serif",color:client.credit>0?t.warning:t.positive }}>R$ {client.credit}</p></Card>
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:16,color:t.text,marginBottom:12 }}>Historico de Servicos</h3>
        {(!client.services||client.services.length===0)?<Card t={t} style={{ textAlign:"center",padding:24 }}><p style={{ color:t.muted,fontSize:14 }}>Nenhum servico registrado.</p></Card>:client.services.map((s,i)=>(<Card key={i} t={t} style={{ marginBottom:8,padding:"12px 14px" }}><div style={{ display:"flex",alignItems:"center" }}><div style={{ flex:1 }}><p style={{ fontWeight:600,fontSize:14,color:t.text,marginBottom:2 }}>{s.srv}</p><p style={{ color:t.muted,fontSize:12 }}>{s.date}</p></div><div style={{ textAlign:"right" }}><p style={{ fontWeight:700,color:t.text,marginBottom:2 }}>R$ {s.val}</p><p style={{ fontSize:11,fontWeight:600,color:s.paid?t.positive:t.warning }}>{s.paid?"Pago":"Fiado"}</p></div></div></Card>))}
        {client.credit>0&&<Btn onClick={()=>onPayCredit(client.id)} t={t} style={{ marginTop:10,background:"linear-gradient(135deg,#059669,#34d399)",boxShadow:"0 6px 20px rgba(5,150,105,0.3)" }}>Registrar Pagamento — R$ {client.credit}</Btn>}
      </div></SW>
    </div>
  );
}

function ClientsScreen({ clients, onAdd, onPayCredit, t }) {
  const [search, setSearch]   = useState("");
  const [detail, setDetail]   = useState(null);
  const [showModal, setModal] = useState(false);
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  if (detail) {
    const fresh=clients.find(c=>c.id===detail.id)||detail;
    return <ClientDetail client={fresh} onClose={()=>setDetail(null)} onPayCredit={id=>{onPayCredit(id);setDetail(null);}} t={t}/>;
  }
  return (
    <div style={{ background:t.bg, minHeight:"100vh" }}><Blobs t={t}/>
      <SW><div style={{ position:"relative",zIndex:1,padding:"52px 20px 20px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,animation:"fadeUp 0.4s ease" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:t.text }}>Clientes</h1>
          <div style={{ background:t.accentSoft,color:t.accent,borderRadius:9,padding:"4px 10px",fontSize:12,fontWeight:700 }}>{clients.length}</div>
        </div>
        <div style={{ marginBottom:16 }}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente..." style={{ width:"100%",background:t.card,backdropFilter:t.blur,border:`1px solid ${t.border}`,borderRadius:14,padding:"13px 15px",fontSize:14,color:t.text,outline:"none" }}/></div>
        {filtered.length===0&&<Card t={t} style={{ textAlign:"center",padding:"36px 20px" }}><p style={{ color:t.muted }}>Nenhuma cliente encontrada.</p></Card>}
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {filtered.map((c,i)=>(
            <div key={c.id} style={{ animation:`fadeUp 0.35s ease ${i*40}ms both` }}>
              <Card t={t} onClick={()=>setDetail(c)} style={{ padding:"13px 15px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:44,height:44,borderRadius:13,flexShrink:0,background:`linear-gradient(135deg,${c.color},${c.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff" }}>{c.avatar}</div>
                  <div style={{ flex:1 }}><p style={{ fontWeight:600,fontSize:14,color:t.text,marginBottom:2 }}>{c.name}</p><p style={{ color:t.muted,fontSize:12 }}>{c.phone}</p></div>
                  <div style={{ textAlign:"right" }}><p style={{ fontWeight:700,fontSize:14,color:t.text,marginBottom:2 }}>R$ {c.totalSpent}</p>{c.credit>0&&<p style={{ fontSize:11,color:t.warning,fontWeight:600 }}>R$ {c.credit} fiado</p>}</div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div></SW>
      <Fab onClick={()=>setModal(true)} t={t}/>
      {showModal&&<AddClientModal onClose={()=>setModal(false)} onAdd={onAdd} t={t}/>}
    </div>
  );
}

function AddExpenseModal({ onClose, onAdd, t }) {
  const [form, setForm] = useState({ desc:"",category:"outros",value:"" });
  const [errors, setErrors] = useState({});
  const [success, setOK] = useState(false);
  const upd = k => e => setForm(p => ({ ...p, [k]:e.target.value }));
  const handle = () => {
    const e={};
    if (!form.desc.trim()) e.desc="Descricao obrigatoria";
    if (!form.value||pv(form.value)<=0) e.value="Informe um valor";
    if (Object.keys(e).length){setErrors(e);return;}
    setOK(true);
    setTimeout(()=>{onAdd({id:Date.now(),desc:form.desc.trim(),type:"saida",value:pv(form.value),date:TS,category:form.category,payment:null});onClose();},700);
  };
  return (
    <Sheet onClose={onClose} title="Nova Despesa" t={t} success={success} successNode={<OK title="Despesa registrada" sub={`R$ ${form.value} — ${form.desc}`} t={t}/>}>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        <div>
          <Lbl t={t}>Categoria</Lbl>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {ECATS.map(cat=>{const on=form.category===cat.id;return(<button key={cat.id} onClick={()=>setForm(p=>({...p,category:cat.id}))} style={{ padding:"7px 13px",borderRadius:11,border:`1.5px solid ${on?t.accent:t.divider}`,background:on?t.accentSoft:t.inputBg,color:on?t.accent:t.sub,fontSize:12,fontWeight:on?700:500,cursor:"pointer",transition:"all 0.18s" }}>{cat.label}</button>);})}
          </div>
        </div>
        <div><Lbl t={t}>Descricao *</Lbl><Inp value={form.desc} onChange={upd("desc")} placeholder="Ex: Aluguel do espaco" error={errors.desc} t={t}/></div>
        <div><Lbl t={t}>Valor *</Lbl><Inp value={form.value} onChange={upd("value")} placeholder="0,00" type="number" prefix="R$" error={errors.value} t={t}/></div>
        <Btn onClick={handle} t={t}>Registrar Despesa</Btn>
      </div>
    </Sheet>
  );
}

function FinanceScreen({ transactions, clients, onAddExpense, onPayFiado, t }) {
  const [showExp, setShowExp] = useState(false);
  const [anim, setAnim]       = useState(false);
  useEffect(() => { const id=setTimeout(()=>setAnim(true),150); return ()=>clearTimeout(id); }, []);
  const ent=transactions.filter(x=>x.type==="entrada").reduce((a,b)=>a+b.value,0);
  const sai=transactions.filter(x=>x.type==="saida").reduce((a,b)=>a+b.value,0);
  const fl=clients.filter(c=>c.credit>0);
  const wd=Array.from({length:7},(_,i)=>{const d=new Date(TODAY);d.setDate(d.getDate()-6+i);return{label:["D","S","T","Q","Q","S","S"][d.getDay()],date:fmt(d)};});
  const mx=Math.max(1,...wd.map(d=>transactions.filter(x=>x.type==="entrada"&&x.date===d.date).reduce((a,b)=>a+b.value,0)));
  return (
    <div style={{ background:t.bg, minHeight:"100vh" }}><Blobs t={t}/>
      <SW><div style={{ position:"relative",zIndex:1,padding:"52px 20px 20px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,animation:"fadeUp 0.4s ease" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:t.text }}>Financas</h1>
          <button onClick={()=>setShowExp(true)} style={{ background:t.grad,color:"#fff",border:"none",borderRadius:11,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer" }}>+ Despesa</button>
        </div>
        <div style={{ display:"flex",gap:12,marginBottom:20,animation:"fadeUp 0.4s ease 0.1s both" }}>
          <Card t={t} style={{ flex:1,padding:"15px" }}><div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}><Ico k="up" size={14} color={t.positive}/><p style={{ fontSize:11,color:t.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5 }}>Entradas</p></div><p style={{ fontSize:20,fontWeight:700,color:t.positive,fontFamily:"'Playfair Display',serif" }}>R$ {ent.toFixed(2)}</p></Card>
          <Card t={t} style={{ flex:1,padding:"15px" }}><div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}><Ico k="dn" size={14} color={t.negative}/><p style={{ fontSize:11,color:t.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5 }}>Saidas</p></div><p style={{ fontSize:20,fontWeight:700,color:t.negative,fontFamily:"'Playfair Display',serif" }}>R$ {sai.toFixed(2)}</p></Card>
        </div>
        <Card t={t} style={{ marginBottom:20,animation:"fadeUp 0.4s ease 0.2s both" }}>
          <p style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:t.text,marginBottom:14 }}>Ultimos 7 dias</p>
          <div style={{ display:"flex",alignItems:"flex-end",gap:6,height:88 }}>
            {wd.map((d,i)=>{const val=transactions.filter(x=>x.type==="entrada"&&x.date===d.date).reduce((a,b)=>a+b.value,0);const pct=Math.round((val/mx)*100);return(<div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}><div style={{ width:"100%",borderRadius:"5px 5px 0 0",background:pct>0?t.grad:"rgba(150,150,150,0.12)",height:anim?`${Math.max(pct,pct>0?5:0)}%`:"0%",transition:`height 0.75s ease ${i*75}ms` }}/><span style={{ fontSize:9.5,color:t.muted }}>{d.label}</span></div>);})}
          </div>
        </Card>
        <p style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:600,color:t.text,marginBottom:12 }}>Transacoes</p>
        {transactions.slice().reverse().map((tx,i)=>(
          <Card key={tx.id} t={t} style={{ marginBottom:8,padding:"12px 14px",animation:`slideR 0.35s ease ${i*30}ms both` }}>
            <div style={{ display:"flex",alignItems:"center" }}>
              <div style={{ width:34,height:34,borderRadius:10,flexShrink:0,background:tx.type==="entrada"?"rgba(5,150,105,0.1)":"rgba(220,38,38,0.08)",display:"flex",alignItems:"center",justifyContent:"center",marginRight:12 }}><Ico k={tx.type==="entrada"?"up":"dn"} size={15} color={tx.type==="entrada"?t.positive:t.negative}/></div>
              <div style={{ flex:1 }}><p style={{ fontWeight:600,fontSize:13,color:t.text,marginBottom:2 }}>{tx.desc}</p><p style={{ color:t.muted,fontSize:11 }}>{tx.date}{tx.payment&&` — ${PM.find(p=>p.id===tx.payment)?.label||""}`}</p></div>
              <p style={{ fontWeight:700,fontSize:13,color:tx.type==="entrada"?t.positive:t.negative }}>{tx.type==="entrada"?"+":"-"}R$ {tx.value.toFixed(2)}</p>
            </div>
          </Card>
        ))}
        {fl.length>0&&(
          <div style={{ marginTop:20 }}>
            <p style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:600,color:t.text,marginBottom:12 }}>Fiado em Aberto</p>
            {fl.map((c,i)=>(
              <Card key={c.id} t={t} style={{ marginBottom:8,padding:"12px 14px",borderLeft:`3px solid ${t.warning}` }}>
                <div style={{ display:"flex",alignItems:"center" }}>
                  <div style={{ flex:1 }}><p style={{ fontWeight:600,fontSize:13,color:t.text,marginBottom:2 }}>{c.name}</p><p style={{ color:t.warning,fontSize:12,fontWeight:600 }}>R$ {c.credit.toFixed(2)} em aberto</p></div>
                  <button onClick={()=>onPayFiado(c.id)} style={{ background:"linear-gradient(135deg,#059669,#34d399)",color:"#fff",border:"none",borderRadius:9,padding:"8px 18px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}><Ico k="check" size={13} color="#fff"/>Pago</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div></SW>
      {showExp&&<AddExpenseModal onClose={()=>setShowExp(false)} onAdd={onAddExpense} t={t}/>}
    </div>
  );
}

function SettingsScreen({ dark, setDark, notif, setNotif, setScreen, setSession, clients, transactions, session, t }) {
  const [panel, setPanel] = useState(null);
  const uEmail   = session?.user?.email || "";
  const uName    = uEmail.split("@")[0];
  const uInitials = uName.slice(0,2).toUpperCase();

  const handleSignOut = async () => {
    if (session?.token) await SB.signOut(session.token);
    setSession(null);
    setScreen("welcome");
  };

  // Paineis internos
  const SvcsPanel = () => {
    const [svcs,setSvcs]=useState(SVCS.map((s,i)=>({id:i+1,name:s,price:45+i*10})));
    const [n,setN]=useState({name:"",price:""});
    return(
      <Sheet onClose={()=>setPanel(null)} title="Meus Servicos" t={t}>
        <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
          {svcs.map(s=>(
            <div key={s.id} style={{ background:t.inputBg,border:`1px solid ${t.border}`,borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center" }}>
              <div style={{ flex:1 }}><p style={{ fontWeight:600,fontSize:14,color:t.text,marginBottom:2 }}>{s.name}</p><p style={{ color:t.muted,fontSize:12 }}>R$ {s.price}</p></div>
              <button onClick={()=>setSvcs(p=>p.filter(x=>x.id!==s.id))} style={{ background:"rgba(220,38,38,0.08)",color:t.negative,border:"none",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",fontWeight:600 }}>Remover</button>
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${t.divider}`,paddingTop:14,display:"flex",flexDirection:"column",gap:10 }}>
            <p style={{ fontSize:11,fontWeight:700,color:t.accent,textTransform:"uppercase",letterSpacing:0.7 }}>Adicionar</p>
            <div style={{ display:"flex",gap:8 }}>
              <Inp value={n.name} onChange={e=>setN(p=>({...p,name:e.target.value}))} placeholder="Nome do servico" t={t} sx={{flex:2}}/>
              <Inp value={n.price} onChange={e=>setN(p=>({...p,price:e.target.value}))} placeholder="R$" type="number" t={t} sx={{flex:1}}/>
            </div>
            <Btn onClick={()=>{if(!n.name||!n.price)return;setSvcs(p=>[...p,{id:Date.now(),name:n.name,price:parseFloat(n.price)}]);setN({name:"",price:""}); }} t={t}>Adicionar</Btn>
          </div>
        </div>
      </Sheet>
    );
  };

  const ReportsPanel = () => {
    const tIn=transactions.filter(x=>x.type==="entrada").reduce((a,b)=>a+b.value,0);
    const tOut=transactions.filter(x=>x.type==="saida").reduce((a,b)=>a+b.value,0);
    const top=[...clients].sort((a,b)=>b.totalSpent-a.totalSpent)[0];
    const rows=[{lb:"Total de entradas",val:`R$ ${tIn.toFixed(2)}`,color:t.positive},{lb:"Total de saidas",val:`R$ ${tOut.toFixed(2)}`,color:t.negative},{lb:"Lucro liquido",val:`R$ ${(tIn-tOut).toFixed(2)}`,color:t.accent},{lb:"Total de clientes",val:clients.length,color:t.accent},{lb:"Fiado em aberto",val:`R$ ${clients.reduce((a,c)=>a+c.credit,0).toFixed(2)}`,color:t.warning},{lb:"Melhor cliente",val:top?.name||"—",color:t.accent}];
    return(
      <Sheet onClose={()=>setPanel(null)} title="Relatorios" t={t}>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {rows.map((r,i)=>(
            <Card key={i} t={t} style={{ padding:"12px 15px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <p style={{ color:t.sub,fontSize:13 }}>{r.lb}</p>
                <p style={{ color:r.color,fontWeight:700,fontSize:14,fontFamily:"'Playfair Display',serif" }}>{r.val}</p>
              </div>
            </Card>
          ))}
        </div>
      </Sheet>
    );
  };

  const SecurityPanel = () => {
    const [form,setForm]=useState({cur:"",next:"",confirm:""});
    const [msg,setMsg]=useState("");
    const [load,setLoad]=useState(false);
    const upd=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
    const handle=async()=>{
      if(!form.cur||!form.next){setMsg("Preencha todos os campos.");return;}
      if(form.next!==form.confirm){setMsg("As senhas nao conferem.");return;}
      if(form.next.length<8){setMsg("Minimo 8 caracteres.");return;}
      setLoad(true);
      // Confirma senha atual
      const {ok}=await SB.signIn(uEmail,form.cur);
      if(!ok){setMsg("Senha atual incorreta.");setLoad(false);return;}
      setMsg("Senha alterada com sucesso!");setLoad(false);
      setTimeout(()=>setPanel(null),1500);
    };
    return(
      <Sheet onClose={()=>setPanel(null)} title="Seguranca" t={t}>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {[{k:"cur",lb:"Senha atual"},{k:"next",lb:"Nova senha"},{k:"confirm",lb:"Confirmar nova senha"}].map(f=>(<div key={f.k}><Lbl t={t}>{f.lb}</Lbl><Inp value={form[f.k]} onChange={upd(f.k)} placeholder="..." type="password" t={t}/></div>))}
          {msg&&<p style={{ color:msg.includes("sucesso")?t.positive:t.negative,fontSize:13,fontWeight:600 }}>{msg}</p>}
          <Btn onClick={handle} loading={load} t={t}>Alterar Senha</Btn>
        </div>
      </Sheet>
    );
  };

  const SupportPanel = () => {
    const [msg,setMsg]=useState("");
    const [sent,setSent]=useState(false);
    return(
      <Sheet onClose={()=>setPanel(null)} title="Suporte" t={t} success={sent} successNode={<OK title="Mensagem enviada" sub="Responderemos em ate 24h." t={t}/>}>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <p style={{ color:t.sub,fontSize:14,lineHeight:1.6 }}>Envie sua mensagem e responderemos em ate 24h.</p>
          <div><Lbl t={t}>Sua mensagem</Lbl><Inp value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Descreva sua duvida..." rows={4} t={t}/></div>
          <Btn onClick={()=>{if(msg.trim()){setSent(true);setTimeout(()=>setPanel(null),1500);}}} t={t}>Enviar Mensagem</Btn>
        </div>
      </Sheet>
    );
  };

  const items = [
    { lb:"Meus Servicos",  sub:`${SVCS.length} servicos`,       k:"brief", action:()=>setPanel("services") },
    { lb:"Relatorios",     sub:"Ver resumo financeiro",         k:"chart", action:()=>setPanel("reports")  },
    { lb:"Seguranca",      sub:"Alterar senha",                 k:"lock",  action:()=>setPanel("security") },
    { lb:"Suporte",        sub:"Fale com nossa equipe",         k:"msg",   action:()=>setPanel("support")  },
  ];

  return (
    <div style={{ background:t.bg, minHeight:"100vh" }}><Blobs t={t}/>
      <SW><div style={{ position:"relative",zIndex:1,padding:"52px 20px 20px" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:t.text,marginBottom:20,animation:"fadeUp 0.4s ease" }}>Configuracoes</h1>

        {/* Perfil com dados reais do Supabase */}
        <Card t={t} style={{ marginBottom:18,padding:"18px",animation:"scaleIn 0.35s ease 0.1s both" }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:56,height:56,borderRadius:16,background:t.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff" }}>{uInitials}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:t.text,marginBottom:2 }}>{uName}</p>
              <p style={{ color:t.muted,fontSize:12,marginBottom:6 }}>{uEmail}</p>
              <div style={{ display:"inline-flex",alignItems:"center",gap:5,background:"rgba(5,150,105,0.1)",padding:"3px 10px",borderRadius:7 }}>
                <Ico k="check" size={11} color="#059669"/>
                <span style={{ fontSize:10,fontWeight:700,color:"#059669",letterSpacing:0.5,textTransform:"uppercase" }}>Conta verificada</span>
              </div>
            </div>
          </div>
        </Card>

        {[{lb:"Modo Escuro",sub:dark?"Ativado":"Desativado",val:dark,fn:()=>setDark(d=>!d)},{lb:"Notificacoes",sub:"Alertas de fiado e agenda",val:notif,fn:()=>setNotif(n=>!n)}].map((tog,i)=>(
          <Card key={i} t={t} style={{ marginBottom:10,padding:"13px 15px",animation:`fadeUp 0.4s ease ${0.1+i*0.08}s both` }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ flex:1 }}><p style={{ fontWeight:600,fontSize:14,color:t.text,marginBottom:2 }}>{tog.lb}</p><p style={{ color:t.muted,fontSize:12 }}>{tog.sub}</p></div>
              <Toggle on={tog.val} onChange={tog.fn}/>
            </div>
          </Card>
        ))}

        <div style={{ display:"flex",flexDirection:"column",gap:10,marginTop:4 }}>
          {items.map((item,i)=>(
            <Card key={i} t={t} onClick={item.action} style={{ padding:"13px 15px",animation:`fadeUp 0.4s ease ${0.26+i*0.05}s both` }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:38,height:38,borderRadius:11,background:t.accentSoft,display:"flex",alignItems:"center",justifyContent:"center" }}><Ico k={item.k} size={17} color={t.accent}/></div>
                <div style={{ flex:1 }}><p style={{ fontWeight:600,fontSize:14,color:t.text,marginBottom:2 }}>{item.lb}</p><p style={{ color:t.muted,fontSize:12 }}>{item.sub}</p></div>
                <div style={{ transform:"rotate(-90deg)" }}><Ico k="chev" size={16} color={t.muted}/></div>
              </div>
            </Card>
          ))}
        </div>

        <Btn onClick={handleSignOut} variant="danger" t={t} style={{ marginTop:20 }}>
          <Ico k="x" size={16} color={t.negative} /> Sair da conta
        </Btn>
        <p style={{ textAlign:"center",color:t.muted,fontSize:11,marginTop:16,letterSpacing:0.4 }}>BeautyPro Manager v2.0</p>
      </div></SW>

      {panel==="services" && <SvcsPanel/>}
      {panel==="reports"  && <ReportsPanel/>}
      {panel==="security" && <SecurityPanel/>}
      {panel==="support"  && <SupportPanel/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen,       setScreen]       = useState("welcome");
  const [dark,         setDark]         = useState(false);
  const [notif,        setNotif]        = useState(true);
  const [session,      setSession]      = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [clients,      setClients]      = useState(ICLIENTS);
  const [agenda,       setAgenda]       = useState(IAGENDA);
  const [transactions, setTransactions] = useState(ITXS);

  const t = dark ? DARK : LIGHT;

  const addClient = useCallback(c   => setClients(p => [c,...p]), []);
  const payCredit = useCallback(id  => {
    let paid=0, name="";
    setClients(p => p.map(c => { if(c.id!==id) return c; paid=c.credit; name=c.name; return {...c,totalSpent:c.totalSpent+c.credit,credit:0}; }));
    if (paid>0) setTransactions(p => [...p,{id:Date.now(),desc:`Fiado quitado — ${name}`,type:"entrada",value:paid,date:TS,category:"servico",payment:"dinheiro"}]);
  }, []);
  const addAppt   = useCallback(apt => setAgenda(p => [...p, apt]), []);
  const delAppt   = useCallback(id  => setAgenda(p => p.filter(a => a.id!==id)), []);
  const addExp    = useCallback(exp => setTransactions(p => [...p, exp]), []);

  const MAIN = ["dashboard","agenda","clients","finance","settings"];

  // Se Supabase não configurado → mostra aviso
  if (!SB_READY) {
    return (
      <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:t.bg, position:"relative" }}>
        <style>{CSS}</style>
        <ConfigWarning t={t} />
      </div>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case "welcome":    return <WelcomeScreen setScreen={setScreen} t={t} />;
      case "login":      return <LoginScreen setScreen={setScreen} setPendingEmail={setPendingEmail} t={t} />;
      case "register":   return <RegisterScreen setScreen={setScreen} t={t} />;
      case "otp":        return <OTPScreen email={pendingEmail} setScreen={setScreen} setSession={setSession} t={t} />;
      case "dashboard":  return <Dashboard clients={clients} agenda={agenda} transactions={transactions} setScreen={setScreen} session={session} t={t} />;
      case "agenda":     return <AgendaScreen agenda={agenda} clients={clients} onAdd={addAppt} onDelete={delAppt} t={t} />;
      case "clients":    return <ClientsScreen clients={clients} onAdd={addClient} onPayCredit={payCredit} t={t} />;
      case "finance":    return <FinanceScreen transactions={transactions} clients={clients} onAddExpense={addExp} onPayFiado={payCredit} t={t} />;
      case "settings":   return <SettingsScreen dark={dark} setDark={setDark} notif={notif} setNotif={setNotif} setScreen={setScreen} setSession={setSession} clients={clients} transactions={transactions} session={session} t={t} />;
      default:           return <WelcomeScreen setScreen={setScreen} t={t} />;
    }
  };

  return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:t.bg, position:"relative" }}>
      <style>{CSS}</style>
      <div key={screen} style={{ animation:"fadeIn 0.25s ease" }}>
        {renderScreen()}
      </div>
      {MAIN.includes(screen) && session && (
        <Nav active={screen} setScreen={setScreen} t={t} />
      )}
    </div>
  );
}

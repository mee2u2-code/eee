// ============================================================
// 지우고 본인의 파이어베이스 설정을 붙여넣으세요
const firebaseConfig = {
  apiKey: "AIzaSyADPxg5Ak1HxGAr72Fn9YiTg7nvrpyIBl0",
  authDomain: "ireland777.firebaseapp.com",
  databaseURL: "https://ireland777-default-rtdb.firebaseio.com",
  projectId: "ireland777",
  storageBucket: "ireland777.firebasestorage.app",
  messagingSenderId: "766086165454",
  appId: "1:766086165454:web:1eac146fafdb536065319f"
};
// ============================================================

import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase, ref, set, get, push, onValue, remove, serverTimestamp,
} from "firebase/database";

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

const isMafia       = (name) => name?.trim() === "김도환";
const LS_NAME_KEY   = "fx_mafia_player_name";
const LS_PLAYER_ID_KEY = "fx_mafia_player_id";
const BASE_RATE     = 1300; // 기준환율

// ── 전역 스타일 ───────────────────────────────────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family:'Noto Sans KR',sans-serif; background:#0a0a0f; color:#e8e0d0; min-height:100vh; }

  .bg-layer {
    position:fixed; inset:0; z-index:0; overflow:hidden;
    background:radial-gradient(ellipse 80% 60% at 50% 0%,#1a0505 0%,#0a0a0f 60%);
  }
  .float-symbol {
    position:absolute; font-size:5rem; opacity:0.04; color:#c9a84c;
    animation:floatUp linear infinite; user-select:none; pointer-events:none;
  }
  @keyframes floatUp {
    0%   { transform:translateY(110vh) rotate(0deg);  opacity:0; }
    10%  { opacity:0.04; }
    90%  { opacity:0.04; }
    100% { transform:translateY(-10vh) rotate(25deg); opacity:0; }
  }
  .vignette {
    position:fixed; inset:0; z-index:1; pointer-events:none;
    background:radial-gradient(ellipse 100% 100% at 50% 50%,transparent 40%,rgba(80,0,0,0.45) 100%);
  }
  .scanline {
    position:absolute; inset:0; pointer-events:none;
    background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px);
  }

  /* 글래스 */
  .glass      { background:rgba(15,8,8,0.72);  border:1px solid rgba(180,80,60,0.25);   border-radius:16px; backdrop-filter:blur(12px); position:relative; overflow:hidden; }
  .glass::before      { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(220,120,80,0.6),transparent); }
  .glass-gold { background:rgba(12,9,2,0.75);  border:1px solid rgba(201,168,76,0.35);  border-radius:16px; backdrop-filter:blur(12px); position:relative; overflow:hidden; }
  .glass-gold::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,0.8),transparent); }
  .glass-dark { background:rgba(8,8,20,0.82);  border:1px solid rgba(100,120,220,0.2);  border-radius:16px; backdrop-filter:blur(14px); position:relative; overflow:hidden; }
  .glass-dark::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(130,150,255,0.5),transparent); }
  .glass-green { background:rgba(4,14,8,0.80); border:1px solid rgba(60,180,100,0.25);  border-radius:16px; backdrop-filter:blur(12px); position:relative; overflow:hidden; }
  .glass-green::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(80,220,120,0.5),transparent); }

  /* 섹션 타이틀 */
  .section-title { display:flex; align-items:center; gap:8px; font-size:0.75rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:rgba(180,100,80,0.9); margin-bottom:14px; }
  .section-title::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(180,80,60,0.4),transparent); }
  .section-title-blue   { color:rgba(100,140,255,0.9); }
  .section-title-blue::after   { background:linear-gradient(90deg,rgba(100,140,255,0.3),transparent); }
  .section-title-gold   { color:rgba(201,168,76,0.9); }
  .section-title-gold::after   { background:linear-gradient(90deg,rgba(201,168,76,0.3),transparent); }
  .section-title-green  { color:rgba(60,200,110,0.9); }
  .section-title-green::after  { background:linear-gradient(90deg,rgba(60,200,110,0.3),transparent); }

  /* 펄스 */
  @keyframes pulse-red  { 0%,100%{box-shadow:0 0 0 0 rgba(200,50,50,0.6)}  50%{box-shadow:0 0 0 6px rgba(200,50,50,0)} }
  @keyframes pulse-gold { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0.6)} 50%{box-shadow:0 0 0 6px rgba(201,168,76,0)} }
  @keyframes pulse-blue { 0%,100%{box-shadow:0 0 0 0 rgba(80,120,255,0.6)} 50%{box-shadow:0 0 0 6px rgba(80,120,255,0)} }
  .pulse-dot-red  { width:8px; height:8px; border-radius:50%; background:#e03030; animation:pulse-red  1.4s ease-in-out infinite; }
  .pulse-dot-gold { width:8px; height:8px; border-radius:50%; background:#c9a84c; animation:pulse-gold 1.6s ease-in-out infinite; }
  .pulse-dot-blue { width:8px; height:8px; border-radius:50%; background:#5080ff; animation:pulse-blue 1.4s ease-in-out infinite; }

  /* 버튼 */
  .btn { border:none; cursor:pointer; font-family:inherit; font-weight:700; border-radius:10px; transition:transform 0.1s,opacity 0.15s,filter 0.15s; }
  .btn:active { transform:scale(0.96); }
  .btn:disabled { opacity:0.4; cursor:not-allowed; }
  .btn-red    { background:linear-gradient(135deg,#8b1a1a,#c0392b); color:#fff; border:1px solid rgba(255,100,80,0.3); box-shadow:0 2px 12px rgba(180,30,30,0.4); }
  .btn-red:hover:not(:disabled)    { filter:brightness(1.15); }
  .btn-gold   { background:linear-gradient(135deg,#7a5c10,#c9a84c); color:#1a1000; border:1px solid rgba(255,210,100,0.3); box-shadow:0 2px 12px rgba(180,130,30,0.35); }
  .btn-gold:hover:not(:disabled)   { filter:brightness(1.12); }
  .btn-blue   { background:linear-gradient(135deg,#1a2a6b,#3050c0); color:#c8d8ff; border:1px solid rgba(100,140,255,0.3); box-shadow:0 2px 12px rgba(50,80,200,0.35); }
  .btn-blue:hover:not(:disabled)   { filter:brightness(1.15); }
  .btn-purple { background:linear-gradient(135deg,#2d1060,#6030b0); color:#dbc8ff; border:1px solid rgba(160,100,255,0.3); box-shadow:0 2px 12px rgba(100,50,200,0.35); }
  .btn-purple:hover:not(:disabled) { filter:brightness(1.15); }
  .btn-green  { background:linear-gradient(135deg,#0a3020,#1a8050); color:#c0ffd8; border:1px solid rgba(60,200,120,0.3); box-shadow:0 2px 12px rgba(20,140,80,0.3); }
  .btn-green:hover:not(:disabled)  { filter:brightness(1.15); }
  .btn-ghost  { background:rgba(255,255,255,0.05); color:rgba(200,190,180,0.7); border:1px solid rgba(255,255,255,0.1); }
  .btn-ghost:hover:not(:disabled)  { background:rgba(255,255,255,0.09); color:#e0d8d0; }
  .btn-danger { background:linear-gradient(135deg,#4a0808,#901818); color:#ffb8b8; border:1px solid rgba(255,80,80,0.25); }
  .btn-danger:hover:not(:disabled) { filter:brightness(1.2); }

  /* 인풋 */
  .inp { width:100%; background:rgba(0,0,0,0.45); border:1px solid rgba(180,80,60,0.3); border-radius:10px; padding:10px 14px; color:#e8e0d0; font-family:inherit; font-size:0.9rem; outline:none; transition:border-color 0.2s; }
  .inp:focus { border-color:rgba(200,120,80,0.7); }
  .inp::placeholder { color:rgba(180,150,130,0.4); }
  .inp-blue { border-color:rgba(80,120,255,0.3); }
  .inp-blue:focus { border-color:rgba(100,160,255,0.7); }
  .inp-gold { border-color:rgba(201,168,76,0.3); }
  .inp-gold:focus { border-color:rgba(220,190,80,0.7); }

  /* 타이머 */
  .timer-display { font-family:'Courier New',monospace; font-size:3.5rem; font-weight:900; letter-spacing:0.08em; color:#c9a84c; text-shadow:0 0 20px rgba(201,168,76,0.5),0 0 40px rgba(201,168,76,0.2); }
  .timer-display.urgent { color:#e03030; text-shadow:0 0 20px rgba(220,50,50,0.6),0 0 40px rgba(220,50,50,0.3); animation:timerFlash 0.5s ease-in-out infinite alternate; }
  @keyframes timerFlash { from{opacity:1} to{opacity:0.6} }

  /* 투표 바 */
  .vote-track { width:100%; height:10px; border-radius:99px; background:rgba(255,255,255,0.07); overflow:hidden; margin-top:6px; }
  .vote-fill-blue   { height:100%; background:linear-gradient(90deg,#1a2a6b,#5080ff); border-radius:99px; transition:width 0.6s ease; }
  .vote-fill-purple { height:100%; background:linear-gradient(90deg,#2d1060,#9060e0); border-radius:99px; transition:width 0.6s ease; }

  /* 랭킹 */
  .rank-item { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); }

  /* 모드 버튼 */
  .mode-btn { display:flex; flex-direction:column; align-items:center; gap:6px; padding:14px 8px; border-radius:12px; cursor:pointer; transition:all 0.2s; font-family:inherit; font-weight:700; font-size:0.8rem; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:rgba(200,190,180,0.6); }
  .mode-btn:hover { background:rgba(255,255,255,0.08); color:#e0d8d0; }
  .mode-btn.active-slate  { background:rgba(100,100,120,0.35); border-color:rgba(160,160,200,0.4); color:#c8c8e0; box-shadow:inset 0 1px 0 rgba(255,255,255,0.1); }
  .mode-btn.active-blue   { background:rgba(30,60,160,0.45); border-color:rgba(80,130,255,0.5); color:#90b8ff; box-shadow:inset 0 1px 0 rgba(100,160,255,0.2),0 0 16px rgba(50,100,255,0.2); }
  .mode-btn.active-purple { background:rgba(60,20,130,0.45); border-color:rgba(150,80,255,0.5); color:#c090ff; box-shadow:inset 0 1px 0 rgba(180,100,255,0.2),0 0 16px rgba(100,50,220,0.2); }

  /* 모드 배너 */
  .mode-banner { padding:10px 16px; border-radius:12px; display:flex; align-items:center; gap:10px; font-size:0.85rem; font-weight:700; letter-spacing:0.05em; }
  .mode-banner.waiting    { background:rgba(60,60,80,0.4);   border:1px solid rgba(120,120,160,0.25); color:rgba(180,180,210,0.8); }
  .mode-banner.day_vote   { background:rgba(20,40,120,0.5);  border:1px solid rgba(80,120,255,0.35);  color:#90b8ff;  box-shadow:0 0 20px rgba(50,100,255,0.1); }
  .mode-banner.night_vote { background:rgba(40,10,100,0.5);  border:1px solid rgba(140,80,255,0.35);  color:#c090ff;  box-shadow:0 0 20px rgba(100,50,220,0.1); }

  /* 환율 바 */
  .rate-bar-track { width:100%; height:14px; border-radius:99px; background:rgba(0,0,0,0.5); border:1px solid rgba(201,168,76,0.2); overflow:hidden; position:relative; }
  .rate-bar-fill  { height:100%; border-radius:99px; transition:width 0.5s ease, background 0.5s ease; }
  @keyframes rateFlash { 0%{opacity:1} 50%{opacity:0.5} 100%{opacity:1} }
  .rate-changed { animation:rateFlash 0.4s ease; }

  /* 비밀번호 박스 */
  .pw-box { background:rgba(10,5,5,0.85); border:1px solid rgba(180,80,60,0.3); border-radius:20px; padding:40px 32px; max-width:360px; width:100%; text-align:center; backdrop-filter:blur(16px); box-shadow:0 8px 40px rgba(150,20,20,0.2); }

  /* 리셋 탭 */
  .reset-tab-btn { padding:8px 14px; border-radius:8px; font-size:0.78rem; font-weight:700; letter-spacing:0.05em; cursor:pointer; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:rgba(200,190,180,0.6); font-family:inherit; transition:all 0.2s; }
  .reset-tab-btn:hover { background:rgba(255,255,255,0.09); color:#e0d8d0; }
  .reset-tab-btn.active { background:rgba(180,40,40,0.35); border-color:rgba(220,80,60,0.4); color:#ffb0a0; }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(180,80,60,0.4); border-radius:2px; }
  .avatar { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#8b1a1a,#c0392b); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1rem; color:#ffccc0; border:2px solid rgba(220,100,80,0.4); flex-shrink:0; }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
`;

function GlobalStyle() { return <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLE }} />; }

const SYMBOLS = ["$","€","¥","£","₩","₿","¢","₽"];
function FloatingBg({isDayMode}) {
  const items = Array.from({length:14},(_,i)=>({
    id:i, sym:SYMBOLS[i%SYMBOLS.length],
    left:`${(i*7.3+2)%100}%`,
    duration:`${14+(i*3.1)%18}s`,
    delay:`-${(i*2.7)%16}s`,
    size:`${3+(i*0.4)%4}rem`,
  }));
  return (
    <div style={{position:"absolute",inset:0}}>
      {items.map(it=>(
        <span key={it.id} style={{
          position:"absolute",
          fontSize:it.size,
          opacity: isDayMode ? 0.09 : 0.04,
          color: isDayMode ? "#8b5e1a" : "#c9a84c",
          animation:"floatUp linear infinite",
          userSelect:"none",
          pointerEvents:"none",
          left:it.left,
          animationDuration:it.duration,
          animationDelay:it.delay,
          transition:"opacity 0.8s, color 0.8s",
        }}>
          {it.sym}
        </span>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 메인 App
// ════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("student");
  const [teacherUnlocked, setTeacherUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [pwShake, setPwShake] = useState(false);
  // 전역 gameMode 구독 → 배경/테마 전환
  const [globalMode, setGlobalMode] = useState("waiting");
  useEffect(()=>onValue(ref(db,"game/mode"),s=>setGlobalMode(s.val()||"waiting")),[]);

  const isDayMode   = globalMode === "day_vote";
  const isNightMode = globalMode === "night_vote";

  const handleTeacherLogin = () => {
    if (pwInput === "1020") { setTeacherUnlocked(true); setPwError(false); }
    else { setPwError(true); setPwShake(true); setTimeout(()=>setPwShake(false),500); }
  };

  // 테마별 CSS 변수
  const themeStyle = isDayMode ? {
    "--bg-main"    : "#f5f0e8",
    "--bg-grad"    : "radial-gradient(ellipse 100% 70% at 50% 0%, #ede4ce 0%, #f5f0e8 55%, #e8e0d0 100%)",
    "--text-main"  : "#2a1a0a",
    "--header-bg"  : "rgba(240,232,210,0.94)",
    "--header-bd"  : "rgba(160,120,60,0.3)",
    "--tab-student": "linear-gradient(135deg,#8b5e1a,#c89040)",
    "--tab-teacher": "linear-gradient(135deg,#1a3a6b,#2a60b0)",
    "--vignette"   : "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(120,80,20,0.18) 100%)",
  } : {
    "--bg-main"    : "#0a0a0f",
    "--bg-grad"    : "radial-gradient(ellipse 80% 60% at 50% 0%, #1a0505 0%, #0a0a0f 60%)",
    "--text-main"  : "#e8e0d0",
    "--header-bg"  : "rgba(8,4,4,0.88)",
    "--header-bd"  : "rgba(180,60,40,0.2)",
    "--tab-student": "linear-gradient(135deg,#6b1a1a,#a03030)",
    "--tab-teacher": "linear-gradient(135deg,#1a1a6b,#3050b0)",
    "--vignette"   : "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(80,0,0,0.45) 100%)",
  };

  return (
    <>
      <GlobalStyle />
      <style>{`
        body { background: ${isDayMode?"#f5f0e8":"#0a0a0f"}; color:${isDayMode?"#2a1a0a":"#e8e0d0"}; transition: background 0.8s, color 0.8s; }
        @keyframes bgTransition { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* 배경 레이어 */}
      <div style={{
        position:"fixed",inset:0,zIndex:0,overflow:"hidden",
        background: isDayMode
          ? "radial-gradient(ellipse 100% 70% at 50% 0%, #ede4ce 0%, #f5f0e8 55%, #e8e0d0 100%)"
          : "radial-gradient(ellipse 80% 60% at 50% 0%, #1a0505 0%, #0a0a0f 60%)",
        transition:"background 0.8s ease",
      }}>
        <FloatingBg isDayMode={isDayMode}/>
      </div>

      {/* 비네트 */}
      <div style={{
        position:"fixed",inset:0,zIndex:1,pointerEvents:"none",
        background: isDayMode
          ? "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(120,80,20,0.15) 100%)"
          : "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(80,0,0,0.45) 100%)",
        transition:"background 0.8s ease",
      }}/>

      <div style={{position:"relative",zIndex:2,minHeight:"100vh",transition:"color 0.8s"}}>

        {/* 타이틀 배너 — 이미지 참고 스타일 */}
        <div style={{
          background: isDayMode
            ? "linear-gradient(180deg,rgba(200,160,60,0.12) 0%,transparent 100%)"
            : "linear-gradient(180deg,rgba(30,10,10,0.8) 0%,transparent 100%)",
          padding:"18px 0 10px",
          textAlign:"center",
          position:"relative",
          overflow:"hidden",
          transition:"background 0.8s",
        }}>
          {/* 흩날리는 지폐 장식 */}
          <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
            {["💴","💵","💶","💷","💴","💵"].map((bill,i)=>(
              <span key={i} style={{
                position:"absolute",
                fontSize:`${1.1+(i%3)*0.4}rem`,
                opacity: isDayMode ? 0.25 : 0.18,
                top:`${8+(i*13)%55}%`,
                left:`${(i*17+5)%90}%`,
                transform:`rotate(${-30+(i*22)%70}deg)`,
                filter: isDayMode?"none":"sepia(1) hue-rotate(10deg)",
                transition:"opacity 0.8s",
              }}>{bill}</span>
            ))}
          </div>
          {/* 부제 */}
          <p style={{
            fontSize:"0.65rem",letterSpacing:"0.18em",fontWeight:600,
            color: isDayMode ? "rgba(140,90,20,0.75)" : "rgba(200,180,140,0.6)",
            marginBottom:"6px",textTransform:"uppercase",
            transition:"color 0.8s",
          }}>하루하루 달라지는 마피아 첫 뱅킹 이벤트</p>
          {/* 메인 타이틀 */}
          <div style={{display:"inline-flex",alignItems:"center",gap:"0",position:"relative"}}>
            {"마피아 게임".split("").map((ch,i)=>(
              <span key={i} style={{
                fontSize: ch===" "?"0.8rem":"2.1rem",
                fontWeight:900,
                letterSpacing:"-0.02em",
                color: isDayMode
                  ? (i%3===1?"#c0392b":"#2a1a0a")
                  : (i%3===1?"#e03060":"#f0e8d8"),
                textShadow: isDayMode
                  ? "2px 2px 0 rgba(180,120,40,0.2)"
                  : "2px 2px 0 rgba(0,0,0,0.6), 0 0 20px rgba(200,50,50,0.3)",
                display:"inline-block",
                transform:`rotate(${[-2,1,-1,0,2,-1,0,1,-2][i%9]}deg)`,
                transition:"color 0.8s, text-shadow 0.8s",
                padding:"0 1px",
              }}>{ch}</span>
            ))}
          </div>
          {/* 모드 상태 표시 */}
          {globalMode!=="waiting"&&(
            <div style={{marginTop:"6px"}}>
              <span style={{
                fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.12em",
                padding:"3px 12px",borderRadius:"99px",
                background: isDayMode?"rgba(200,140,40,0.15)":"rgba(200,50,50,0.15)",
                border: isDayMode?"1px solid rgba(180,120,30,0.3)":"1px solid rgba(200,60,60,0.3)",
                color: isDayMode?"rgba(140,80,10,0.9)":"rgba(220,150,130,0.9)",
              }}>
                {isDayMode?"☀ 낮 투표 진행 중":"🌙 밤 투표 진행 중"}
              </span>
            </div>
          )}
        </div>

        {/* 헤더 */}
        <header style={{
          position:"sticky",top:0,zIndex:50,
          background: isDayMode?"rgba(240,232,210,0.95)":"rgba(8,4,4,0.88)",
          borderBottom: isDayMode?"1px solid rgba(160,120,60,0.3)":"1px solid rgba(180,60,40,0.2)",
          backdropFilter:"blur(16px)",
          padding:"0 16px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          height:"52px",
          transition:"background 0.8s, border-color 0.8s",
        }}>
          <div className="scanline"/>
          <div style={{display:"flex",alignItems:"center",gap:"10px",zIndex:1}}>
            <span style={{fontSize:"1.3rem"}}>🏦</span>
            <span style={{fontWeight:900,fontSize:"1.05rem",letterSpacing:"0.06em",
              color:isDayMode?"#3a2010":"#e8d8c0",transition:"color 0.8s"}}>외환 마피아</span>
            <span style={{fontSize:"0.6rem",letterSpacing:"0.15em",
              color:isDayMode?"rgba(160,100,30,0.8)":"rgba(180,80,60,0.7)",
              fontWeight:700,textTransform:"uppercase",transition:"color 0.8s"}}>게임</span>
          </div>
          <div style={{display:"flex",gap:"6px",zIndex:1}}>
            <button onClick={()=>setTab("student")} className="btn" style={{
              padding:"7px 14px",fontSize:"0.82rem",
              ...(tab==="student"
                ?{background:isDayMode?"linear-gradient(135deg,#8b5e1a,#c89040)":"linear-gradient(135deg,#6b1a1a,#a03030)",
                  color:isDayMode?"#fff8e8":"#ffd8c8",border:`1px solid ${isDayMode?"rgba(200,150,50,0.5)":"rgba(220,100,80,0.4)"}`}
                :{background:"transparent",
                  color:isDayMode?"rgba(120,80,30,0.7)":"rgba(200,180,170,0.6)",
                  border:`1px solid ${isDayMode?"rgba(160,110,40,0.2)":"rgba(180,80,60,0.15)"}`}),
            }}>학생 화면</button>
            <button onClick={()=>setTab("teacher")} className="btn" style={{
              padding:"7px 14px",fontSize:"0.82rem",
              ...(tab==="teacher"
                ?{background:"linear-gradient(135deg,#1a3a6b,#2a60b0)",color:"#c8d8ff",border:"1px solid rgba(80,140,255,0.4)"}
                :{background:"transparent",
                  color:isDayMode?"rgba(40,80,160,0.7)":"rgba(180,190,220,0.6)",
                  border:`1px solid ${isDayMode?"rgba(60,100,200,0.2)":"rgba(80,120,200,0.15)"}`}),
            }}>교사 화면</button>
          </div>
        </header>

        <main style={{maxWidth:"640px",margin:"0 auto",padding:"16px 16px 24px"}}>
          {tab==="student" ? <StudentView isDayMode={isDayMode} isNightMode={isNightMode}/> : teacherUnlocked ? <TeacherView /> : (
            <div style={{marginTop:"60px",display:"flex",justifyContent:"center"}}>
              <div className="pw-box" style={{
                animation:pwShake?"shake 0.4s ease":"none",
                background: isDayMode?"rgba(245,235,210,0.95)":"rgba(10,5,5,0.85)",
                border: isDayMode?"1px solid rgba(180,130,60,0.4)":"1px solid rgba(180,80,60,0.3)",
              }}>
                <div style={{fontSize:"2.8rem",marginBottom:"16px"}}>🔐</div>
                <p style={{fontWeight:900,fontSize:"1.2rem",color:isDayMode?"#2a1a0a":"#e8d8c0",marginBottom:"4px"}}>교사 전용 구역</p>
                <p style={{fontSize:"0.8rem",color:isDayMode?"rgba(120,80,30,0.7)":"rgba(180,150,130,0.6)",marginBottom:"24px",letterSpacing:"0.05em"}}>승인된 교사만 접근 가능합니다</p>
                <input type="password" value={pwInput} onChange={e=>setPwInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleTeacherLogin()}
                  placeholder="비밀번호 입력" className="inp"
                  style={{textAlign:"center",fontSize:"1.1rem",letterSpacing:"0.3em",marginBottom:"10px",
                    background:isDayMode?"rgba(255,248,235,0.8)":"rgba(0,0,0,0.45)",
                    borderColor:isDayMode?"rgba(180,130,60,0.4)":"rgba(180,80,60,0.3)",
                    color:isDayMode?"#2a1a0a":"#e8e0d0",
                  }}/>
                {pwError&&<p style={{color:"#e05050",fontSize:"0.78rem",marginBottom:"10px"}}>✕ 비밀번호가 올바르지 않습니다</p>}
                <button onClick={handleTeacherLogin} className="btn btn-blue" style={{width:"100%",padding:"12px",fontSize:"0.9rem",marginTop:"4px"}}>입장</button>
              </div>
            </div>
          )}
        </main>

        {/* Copyright 푸터 */}
        <footer style={{
          textAlign:"center",padding:"20px 16px 32px",
          borderTop: isDayMode?"1px solid rgba(160,120,60,0.15)":"1px solid rgba(180,80,60,0.1)",
          transition:"border-color 0.8s",
        }}>
          <p style={{
            fontSize:"0.75rem",fontWeight:600,letterSpacing:"0.08em",
            color: isDayMode?"rgba(120,80,30,0.55)":"rgba(180,150,120,0.45)",
            transition:"color 0.8s",
          }}>© 이한상T  ·  외환 마피아 게임</p>
        </footer>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// 환율 바 컴포넌트 (학생/교사 공용)
// ════════════════════════════════════════════════════════════
function ExchangeRateBar({ rate, compact }) {
  const prev = useRef(rate);
  const [flash, setFlash] = useState(false);

  useEffect(()=>{
    if(prev.current !== rate){ setFlash(true); setTimeout(()=>setFlash(false),500); }
    prev.current = rate;
  },[rate]);

  // 바 너비: 900~1700 범위 기준 (기준 1300 = 50%)
  const MIN_RATE = 900, MAX_RATE = 1700;
  const pct = Math.min(100, Math.max(0, ((rate - MIN_RATE)/(MAX_RATE - MIN_RATE))*100));

  // 색상: 1300 기준 낮으면 파랑, 높으면 빨강
  const diff = rate - BASE_RATE;
  const barColor = diff > 0
    ? `linear-gradient(90deg,#5c1010,#e03030)`
    : diff < 0
    ? `linear-gradient(90deg,#102050,#3060d0)`
    : `linear-gradient(90deg,#4a4a10,#c0a030)`;

  const diffText = diff === 0 ? "기준" : diff > 0 ? `▲ +${diff}원` : `▼ ${diff}원`;
  const diffColor = diff > 0 ? "#ff8080" : diff < 0 ? "#80b0ff" : "#c9a84c";

  return (
    <div className={flash?"rate-changed":""} style={{width:"100%"}}>
      {/* 헤더 라인 */}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:"10px"}}>
        <div>
          <span style={{fontSize:"0.68rem",letterSpacing:"0.12em",color:"rgba(201,168,76,0.6)",fontWeight:700,textTransform:"uppercase"}}>USD / KRW</span>
          <div style={{display:"flex",alignItems:"baseline",gap:"8px",marginTop:"2px"}}>
            <span style={{
              fontFamily:"'Courier New',monospace",
              fontSize: compact?"1.6rem":"2.2rem",
              fontWeight:900,
              color:"#e8d08a",
              textShadow:"0 0 16px rgba(201,168,76,0.4)",
              letterSpacing:"0.04em",
            }}>
              ₩{rate.toLocaleString()}
            </span>
            <span style={{fontSize:"0.75rem",color:"rgba(180,150,120,0.6)"}}>/1$</span>
          </div>
        </div>
        <span style={{
          fontSize:"0.8rem",fontWeight:700,color:diffColor,
          padding:"4px 10px",borderRadius:"99px",
          background:"rgba(0,0,0,0.3)",
          border:`1px solid ${diffColor}40`,
        }}>{diffText}</span>
      </div>

      {/* 바 */}
      <div className="rate-bar-track">
        <div className="rate-bar-fill" style={{width:`${pct}%`,background:barColor}}/>
        {/* 기준선 마커 */}
        <div style={{
          position:"absolute",top:0,bottom:0,
          left:`${((BASE_RATE-MIN_RATE)/(MAX_RATE-MIN_RATE))*100}%`,
          width:"2px",background:"rgba(201,168,76,0.6)",
        }}/>
      </div>

      {/* 눈금 레이블 */}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:"5px"}}>
        <span style={{fontSize:"0.62rem",color:"rgba(140,120,100,0.5)"}}>₩{MIN_RATE}</span>
        <span style={{fontSize:"0.62rem",color:"rgba(201,168,76,0.5)"}}>기준 ₩{BASE_RATE}</span>
        <span style={{fontSize:"0.62rem",color:"rgba(140,120,100,0.5)"}}>₩{MAX_RATE}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 학생 화면
// ════════════════════════════════════════════════════════════
function StudentView({isDayMode, isNightMode}) {
  const [playerName, setPlayerName] = useState("");
  const [nameInput,  setNameInput]  = useState("");
  const [playerId,   setPlayerId]   = useState("");
  const [nameSubmitting, setNameSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");
  const [gameMode,  setGameMode]  = useState("waiting");
  const [timerDisplay, setTimerDisplay] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(BASE_RATE);
  const [myVote,     setMyVote]     = useState(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [suspectInput, setSuspectInput] = useState("");
  // 색출·추측 제출 여부: DB에서 내 제출 기록 개수로 판단 (라운드 리셋 시 자동 해제)
  const [mySuspectCount,    setMySuspectCount]    = useState(0);
  const [mySupervisorCount, setMySupervisorCount] = useState(0);
  const [supervisorInput, setSupervisorInput] = useState("");
  // 이름 재입력 허용 여부 (교사가 DB로 제어)
  const [nameResetAllowed, setNameResetAllowed] = useState(false);

  const role = isMafia(playerName) ? "mafia" : "citizen";

  useEffect(()=>{
    const n = localStorage.getItem(LS_NAME_KEY);
    const i = localStorage.getItem(LS_PLAYER_ID_KEY);
    if(n&&i){ setPlayerName(n); setPlayerId(i); }
  },[]);
  useEffect(()=>onValue(ref(db,"game/mode"),s=>setGameMode(s.val()||"waiting")),[]);
  useEffect(()=>onValue(ref(db,"game/timerEnd"),s=>setTimerDisplay(s.val())),[]);
  useEffect(()=>onValue(ref(db,"game/exchangeRate"),s=>setExchangeRate(s.val()||BASE_RATE)),[]);
  useEffect(()=>onValue(ref(db,"game/nameResetFlag"),s=>setNameResetActive(!!s.val())),[]);
  // 교사가 이름 재입력 허용 버튼 누르면 DB 플래그 감지 → localStorage 초기화
  useEffect(()=>{
    return onValue(ref(db,"game/nameResetFlag"),s=>{
      const flag = s.val();
      setNameResetAllowed(!!flag);
      if(flag){
        // 각 기기가 플래그를 감지하면 자신의 localStorage를 지우고 이름 초기화
        localStorage.removeItem(LS_NAME_KEY);
        localStorage.removeItem(LS_PLAYER_ID_KEY);
        setPlayerName(""); setPlayerId("");
        setSuspectInput(""); setMySuspectCount(0);
        setSupervisorInput(""); setMySupervisorCount(0);
        setMyVote(null); setVoteSubmitted(false);
      }
    });
  },[]);
  useEffect(()=>{
    if(!playerId) return;
    return onValue(ref(db,`votes/${playerId}`),s=>{
      if(s.exists()){ setMyVote(s.val().choice); setVoteSubmitted(true); }
      else { setMyVote(null); setVoteSubmitted(false); }
    });
  },[playerId]);
  // 내 색출 제출 횟수 구독 (낮/밤 통틀어 누적)
  useEffect(()=>{
    if(!playerName) return;
    return onValue(ref(db,"suspects"),s=>{
      const raw = s.val();
      if(!raw){ setMySuspectCount(0); return; }
      const cnt = Object.values(raw).filter(v=>v.by===playerName).length;
      setMySuspectCount(cnt);
    });
  },[playerName]);
  // 내 추측 제출 횟수 구독
  useEffect(()=>{
    if(!playerName) return;
    return onValue(ref(db,"supervisorGuesses"),s=>{
      const raw = s.val();
      if(!raw){ setMySupervisorCount(0); return; }
      const cnt = Object.values(raw).filter(v=>v.by===playerName).length;
      setMySupervisorCount(cnt);
    });
  },[playerName]);

  const handleSubmitName = async()=>{
    if(!nameInput.trim()){ setNameError("이름을 입력해 주세요."); return; }
    setNameSubmitting(true); setNameError("");
    try {
      const pRef = ref(db,`players/${nameInput.trim()}`);
      const snap = await get(pRef);
      if(snap.exists()){ setNameError("이미 사용 중인 이름입니다."); setNameSubmitting(false); return; }
      const id = `${nameInput.trim()}_${Date.now()}`;
      await set(pRef,{id,name:nameInput.trim(),joinedAt:serverTimestamp()});
      localStorage.setItem(LS_NAME_KEY,nameInput.trim());
      localStorage.setItem(LS_PLAYER_ID_KEY,id);
      setPlayerName(nameInput.trim()); setPlayerId(id);
    } catch{ setNameError("저장 오류. 다시 시도하세요."); }
    setNameSubmitting(false);
  };

  const handleVote = async(choice)=>{
    if(voteSubmitted||!playerId) return;
    await set(ref(db,`votes/${playerId}`),{name:playerName,choice,at:serverTimestamp()});
    setMyVote(choice); setVoteSubmitted(true);
  };
  const handleSuspect = async()=>{
    if(!suspectInput.trim()||mySuspectCount>0||!playerId) return;
    await push(ref(db,"suspects"),{by:playerName,target:suspectInput.trim(),at:serverTimestamp()});
    setSuspectInput("");
  };
  const handleSupervisor = async()=>{
    if(!supervisorInput.trim()||mySupervisorCount>0||!playerId) return;
    await push(ref(db,"supervisorGuesses"),{by:playerName,guess:supervisorInput.trim(),at:serverTimestamp()});
    setSupervisorInput("");
  };

  // ✅ 낮 투표일 때만 정책 결정 투표 활성화
  const voteActive = gameMode === "day_vote";

  const TimerBlock = ()=>{
    const [rem,setRem] = useState(null);
    useEffect(()=>{
      if(!timerDisplay){ setRem(null); return; }
      const tick=()=>{ const l=Math.max(0,Math.floor((timerDisplay-Date.now())/1000)); setRem(l); };
      tick(); const iv=setInterval(tick,1000); return()=>clearInterval(iv);
    },[timerDisplay]);
    if(!rem||rem<=0) return null;
    const m=Math.floor(rem/60).toString().padStart(2,"0");
    const s=(rem%60).toString().padStart(2,"0");
    const urgent=rem<=30;
    return(
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 0",marginBottom:"4px"}}>
        <div className={`timer-display${urgent?" urgent":""}`}>{m}:{s}</div>
        <p style={{fontSize:"0.72rem",color:urgent?"rgba(220,80,80,0.6)":"rgba(180,150,120,0.6)",letterSpacing:"0.1em",marginTop:"4px"}}>{urgent?"⚠ 곧 종료":"남은 시간"}</p>
      </div>
    );
  };

  // 낮 테마용 카드 스타일
  const cardDay = isDayMode ? {
    background:"rgba(255,250,238,0.88)",
    border:"1px solid rgba(180,130,50,0.25)",
  } : {};
  const cardDayGold = isDayMode ? {
    background:"rgba(255,248,220,0.9)",
    border:"1px solid rgba(180,140,40,0.35)",
  } : {};
  const textDay  = isDayMode ? {color:"#2a1a0a"} : {};
  const subDay   = isDayMode ? {color:"rgba(100,60,10,0.65)"} : {};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"14px",paddingTop:"8px"}}>
      <ModeBanner mode={gameMode}/>
      <TimerBlock/>

      {/* 실시간 환율 */}
      <div className="glass-gold" style={{padding:"18px 20px",...cardDayGold}}>
        <div className="section-title section-title-gold"><span>실시간 환율</span></div>
        <ExchangeRateBar rate={exchangeRate}/>
      </div>

      {/* 신원 등록 */}
      <div className="glass" style={{padding:"18px 20px",...cardDay}}>
        <div className="section-title"><span>01</span> 신원 등록</div>
        {playerName?(
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div className="avatar">{playerName[0]}</div>
            <div>
              <p style={{fontWeight:700,color:"#e8d8c0",fontSize:"0.95rem"}}>{playerName}</p>
              <p style={{fontSize:"0.73rem",color:"rgba(180,120,100,0.7)",marginTop:"2px"}}>참가 완료 — 이름 변경 불가</p>
            </div>
            <div style={{marginLeft:"auto"}}><div className="pulse-dot-red"/></div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <input type="text" value={nameInput} onChange={e=>setNameInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSubmitName()}
              placeholder="본인 이름 입력" className="inp"/>
            {nameError&&<p style={{color:"#e05050",fontSize:"0.78rem"}}>{nameError}</p>}
            <button onClick={handleSubmitName} disabled={nameSubmitting} className="btn btn-red"
              style={{padding:"11px",fontSize:"0.9rem"}}>
              {nameSubmitting?"등록 중…":"게임 참가"}
            </button>
          </div>
        )}
      </div>

      {/* 정책 결정 투표 - ✅ 낮 투표에서만 */}
      <div className="glass" style={{padding:"18px 20px",...cardDay}}>
        <div className="section-title"><span>02</span> 정책 결정 투표</div>
        {!playerName?(<Locked msg="먼저 신원을 등록하세요"/>)
        : gameMode==="night_vote"?(<Standby msg="밤 투표 시간입니다. 정책 결정 투표를 진행하지 않습니다."/>)
        : !voteActive?(<Standby msg={gameMode==="waiting"?"교사가 낮 투표를 시작하면 활성화됩니다":"현재 투표 기간이 아닙니다"}/>)
        : voteSubmitted?(
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontSize:"2rem"}}>{myVote==="A"?"🅰️":"🅱️"}</span>
            <div>
              <p style={{color:"#80e080",fontWeight:700}}>정책 {myVote} 선택 완료</p>
              <p style={{fontSize:"0.73rem",color:"rgba(120,200,120,0.6)",marginTop:"2px"}}>투표가 집계되었습니다</p>
            </div>
          </div>
        ):(
          <>
            <p style={{fontSize:"0.82rem",color:"rgba(200,180,160,0.7)",marginBottom:"14px"}}>지지할 정책을 선택하세요</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <button onClick={()=>handleVote("A")} className="btn btn-blue" style={{padding:"18px 8px",fontSize:"1.1rem"}}>정책 A</button>
              <button onClick={()=>handleVote("B")} className="btn btn-purple" style={{padding:"18px 8px",fontSize:"1.1rem"}}>정책 B</button>
            </div>
          </>
        )}
      </div>

      {/* 외환투기꾼 색출 — 낮 투표에서만, 라운드당 1회 */}
      <div className="glass" style={{padding:"18px 20px",...cardDay}}>
        <div className="section-title"><span>03</span> 외환투기꾼 색출</div>
        {!playerName?(<Locked msg="먼저 신원을 등록하세요"/>)
        : gameMode==="night_vote"?(<Standby msg="밤 투표 시간입니다. 외환투기꾼 색출은 낮에 진행합니다."/>)
        : gameMode==="waiting"?(<Standby msg="교사가 낮 투표를 시작하면 활성화됩니다"/>)
        : mySuspectCount>0?(<SuccessMsg msg="이번 라운드 지목을 완료했습니다. 다음 라운드까지 대기하세요."/>)
        :(
          <div style={{display:"flex",gap:"8px"}}>
            <input type="text" value={suspectInput} onChange={e=>setSuspectInput(e.target.value)}
              placeholder="의심되는 학생 이름" className="inp" style={{flex:1}}/>
            <button onClick={handleSuspect} className="btn btn-red"
              style={{padding:"10px 16px",fontSize:"0.85rem",whiteSpace:"nowrap",flexShrink:0}}>지목</button>
          </div>
        )}
      </div>

      {/* 금융감독관 추측 — 낮 투표에서만, 라운드당 1회, 마피아 전용 */}
      <div className={role==="mafia"?"glass-gold":"glass"} style={{padding:"18px 20px"}}>
        <div className={`section-title${role==="mafia"?" section-title-gold":""}`}>
          <span>04</span> 금융감독관 추측
          {role==="mafia"&&(
            <span style={{marginLeft:"auto",fontSize:"0.65rem",fontWeight:700,padding:"2px 8px",borderRadius:"99px",background:"rgba(201,168,76,0.15)",color:"#c9a84c",border:"1px solid rgba(201,168,76,0.3)",letterSpacing:"0.1em"}}>특수 권한</span>
          )}
        </div>
        {!playerName?(<Locked msg="먼저 신원을 등록하세요"/>)
        : role!=="mafia"?(
          <div style={{display:"flex",alignItems:"center",gap:"8px",opacity:0.45}}>
            <span>🔒</span>
            <p style={{fontSize:"0.82rem",color:"rgba(180,150,130,0.8)"}}>접근 권한이 없습니다</p>
          </div>
        ): gameMode==="night_vote"?(<Standby msg="밤 투표 시간입니다. 금융감독관 추측은 낮에 진행합니다." gold/>)
        : gameMode==="waiting"?(<Standby msg="교사가 낮 투표를 시작하면 활성화됩니다" gold/>)
        : mySupervisorCount>0?(<SuccessMsg msg="이번 라운드 추측을 완료했습니다. 다음 라운드까지 대기하세요." gold/>)
        :(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <p style={{fontSize:"0.75rem",color:"rgba(201,168,76,0.7)"}}>금융감독관으로 의심되는 인물과 근거를 작성하세요</p>
            <textarea value={supervisorInput} onChange={e=>setSupervisorInput(e.target.value)}
              placeholder="예: 홍길동 — 정책 A 반대 패턴, 발언 수상"
              rows={3} className="inp inp-gold" style={{resize:"none"}}/>
            <button onClick={handleSupervisor} className="btn btn-gold" style={{padding:"11px",fontSize:"0.9rem"}}>제출</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 교사 화면
// ════════════════════════════════════════════════════════════
function TeacherView() {
  const [gameMode, setGameMode] = useState("waiting");
  const [votes,    setVotes]    = useState({});
  const [suspects, setSuspects] = useState([]);
  const [supervisorGuesses, setSupervisorGuesses] = useState([]);
  const [timerEnd, setTimerEnd] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(BASE_RATE);
  const [activeTab, setActiveTab] = useState("control"); // control | reset
  const [resetConfirm, setResetConfirm] = useState(false);
  const [nameResetActive, setNameResetActive] = useState(false);
  const [nameResetConfirm, setNameResetConfirm] = useState(false);
  const timerRef = useRef(null);

  useEffect(()=>onValue(ref(db,"game/mode"),s=>setGameMode(s.val()||"waiting")),[]);
  useEffect(()=>onValue(ref(db,"votes"),s=>setVotes(s.val()||{})),[]);
  useEffect(()=>onValue(ref(db,"suspects"),s=>{ const r=s.val(); setSuspects(r?Object.values(r):[]); }),[]);
  useEffect(()=>onValue(ref(db,"supervisorGuesses"),s=>{ const r=s.val(); setSupervisorGuesses(r?Object.values(r):[]); }),[]);
  useEffect(()=>onValue(ref(db,"game/timerEnd"),s=>setTimerEnd(s.val())),[]);
  useEffect(()=>onValue(ref(db,"game/exchangeRate"),s=>setExchangeRate(s.val()||BASE_RATE)),[]);
  useEffect(()=>onValue(ref(db,"game/nameResetFlag"),s=>setNameResetActive(!!s.val())),[]);

  useEffect(()=>{
    if(timerRef.current) clearInterval(timerRef.current);
    if(!timerEnd){ setRemaining(null); return; }
    const tick=()=>{ const l=Math.max(0,Math.floor((timerEnd-Date.now())/1000)); setRemaining(l); if(l===0)clearInterval(timerRef.current); };
    tick(); timerRef.current=setInterval(tick,1000);
    return()=>clearInterval(timerRef.current);
  },[timerEnd]);

  const changeMode   = async(mode)=>{ await set(ref(db,"game/mode"),mode); if(mode==="day_vote"||mode==="night_vote") await set(ref(db,"votes"),null); };
  const startTimer   = async(m)=>await set(ref(db,"game/timerEnd"),Date.now()+m*60000);
  const stopTimer    = async()=>await set(ref(db,"game/timerEnd"),null);

  // 환율 조정
  const adjustRate = async(delta)=>{
    const next = Math.max(900, Math.min(1700, exchangeRate+delta));
    await set(ref(db,"game/exchangeRate"),next);
  };
  const resetRate = async()=>await set(ref(db,"game/exchangeRate"),BASE_RATE);

  // ✅ 라운드 리셋
  const handleRoundReset = async()=>{
    await set(ref(db,"votes"),null);
    await set(ref(db,"suspects"),null);
    await set(ref(db,"supervisorGuesses"),null);
    await set(ref(db,"game/mode"),"waiting");
    await set(ref(db,"game/timerEnd"),null);
    // 이름 재입력 플래그도 함께 해제
    await set(ref(db,"game/nameResetFlag"),null);
    await set(ref(db,"players"),null);
    setResetConfirm(false);
  };

  // 이름 재입력 허용 (학생 화면 localStorage 초기화 트리거)
  const handleNameReset = async()=>{
    await set(ref(db,"game/nameResetFlag"),true);
    await set(ref(db,"players"),null);
    setNameResetConfirm(false);
  };
  // 이름 재입력 잠금 (이름 다시 고정)
  const handleNameLock = async()=>{
    await set(ref(db,"game/nameResetFlag"),null);
  };

  const voteValues = Object.values(votes);
  const countA = voteValues.filter(v=>v.choice==="A").length;
  const countB = voteValues.filter(v=>v.choice==="B").length;
  const total  = countA+countB;
  const pctA   = total>0?Math.round((countA/total)*100):0;
  const pctB   = total>0?Math.round((countB/total)*100):0;

  const suspectCount = {};
  suspects.forEach(s=>{ suspectCount[s.target]=(suspectCount[s.target]||0)+1; });
  const suspectRanking = Object.entries(suspectCount).sort((a,b)=>b[1]-a[1]);

  const urgent   = remaining!==null&&remaining<=30;
  const timerFmt = remaining!==null
    ?`${Math.floor(remaining/60).toString().padStart(2,"0")}:${(remaining%60).toString().padStart(2,"0")}`
    :null;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"14px",paddingTop:"8px"}}>

      {/* 상태 헤더 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div className="pulse-dot-blue"/>
          <span style={{fontWeight:900,color:"#8ab0ff",fontSize:"0.85rem",letterSpacing:"0.1em"}}>TEACHER DASHBOARD</span>
        </div>
        <ModeBanner mode={gameMode} compact/>
      </div>

      {/* 내부 탭 */}
      <div style={{display:"flex",gap:"8px"}}>
        <button className={`reset-tab-btn${activeTab==="control"?" active":""}`} onClick={()=>setActiveTab("control")}>🎛 게임 제어</button>
        <button className={`reset-tab-btn${activeTab==="data"?" active":""}`} onClick={()=>setActiveTab("data")}>📊 실시간 현황</button>
        <button className={`reset-tab-btn${activeTab==="reset"?" active":""}`} onClick={()=>setActiveTab("reset")}>🔄 라운드 리셋</button>
      </div>

      {/* ── 게임 제어 탭 ── */}
      {activeTab==="control"&&(<>

        {/* 환율 제어 */}
        <div className="glass-gold" style={{padding:"18px 20px"}}>
          <div className="section-title section-title-gold"><span>실시간 환율 조정</span></div>
          <ExchangeRateBar rate={exchangeRate} compact/>
          <div style={{display:"flex",gap:"8px",marginTop:"16px",alignItems:"center"}}>
            <button onClick={()=>adjustRate(-100)} className="btn btn-blue"
              style={{flex:1,padding:"12px",fontSize:"1rem",fontWeight:900,letterSpacing:"0.05em"}}>
              ▼ -100원
            </button>
            <button onClick={resetRate} className="btn btn-ghost"
              style={{padding:"12px 14px",fontSize:"0.8rem",whiteSpace:"nowrap"}}>
              기준<br/>복원
            </button>
            <button onClick={()=>adjustRate(+100)} className="btn btn-red"
              style={{flex:1,padding:"12px",fontSize:"1rem",fontWeight:900,letterSpacing:"0.05em"}}>
              ▲ +100원
            </button>
          </div>
          <p style={{fontSize:"0.68rem",color:"rgba(180,140,60,0.5)",textAlign:"center",marginTop:"8px"}}>
            조정 범위 ₩900 ~ ₩1,700 · 기준 ₩1,300
          </p>
        </div>

        {/* 타이머 */}
        <div className="glass-dark" style={{padding:"18px 20px"}}>
          <div className="section-title section-title-blue"><span>타이머</span></div>
          {timerFmt&&remaining>0&&(
            <div style={{textAlign:"center",marginBottom:"16px"}}>
              <div className={`timer-display${urgent?" urgent":""}`}>{timerFmt}</div>
              <p style={{fontSize:"0.7rem",color:urgent?"rgba(220,80,80,0.6)":"rgba(140,160,255,0.5)",marginTop:"4px",letterSpacing:"0.08em"}}>
                {urgent?"⚠ 30초 이하":"남은 시간"}
              </p>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"8px"}}>
            {[1,3,5,7].map(m=>(
              <button key={m} onClick={()=>startTimer(m)} className="btn btn-ghost"
                style={{padding:"10px 4px",fontSize:"0.85rem",fontWeight:700}}>{m}분</button>
            ))}
          </div>
          <button onClick={stopTimer} className="btn btn-ghost"
            style={{width:"100%",padding:"9px",fontSize:"0.8rem"}}>■ 타이머 중지</button>
        </div>

        {/* 게임 모드 */}
        <div className="glass-dark" style={{padding:"18px 20px"}}>
          <div className="section-title section-title-blue"><span>게임 모드</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>
            {[
              {key:"waiting",    label:"대기",    icon:"⏸",cls:"active-slate"},
              {key:"day_vote",   label:"낮 투표", icon:"☀",cls:"active-blue"},
              {key:"night_vote", label:"밤 투표", icon:"🌙",cls:"active-purple"},
            ].map(m=>(
              <button key={m.key} onClick={()=>changeMode(m.key)}
                className={`mode-btn${gameMode===m.key?" "+m.cls:""}`}>
                <span style={{fontSize:"1.5rem"}}>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
        </div>
      </>)}

      {/* ── 실시간 현황 탭 ── */}
      {activeTab==="data"&&(<>

        {/* 투표 현황 - ✅ 낮 투표일 때만 표시 */}
        <div className="glass-dark" style={{padding:"18px 20px"}}>
          <div className="section-title section-title-blue">
            <span>정책 결정 투표 현황</span>
            {total>0&&<span style={{fontSize:"0.72rem",color:"rgba(120,160,255,0.6)",marginLeft:"auto"}}>총 {total}명 참여</span>}
          </div>
          {gameMode==="night_vote"?(
            <Standby msg="밤 투표 시간에는 정책 결정 투표를 진행하지 않습니다." blue/>
          ):total===0?(
            <Standby msg="아직 투표가 없습니다" blue/>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              {[
                {label:"정책 A",count:countA,pct:pctA,cls:"vote-fill-blue"},
                {label:"정책 B",count:countB,pct:pctB,cls:"vote-fill-purple"},
              ].map(v=>(
                <div key={v.label}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                    <span style={{fontSize:"0.85rem",color:"#c8d8ff",fontWeight:700}}>{v.label}</span>
                    <span style={{fontSize:"0.85rem",color:"#e0e8ff",fontWeight:900}}>
                      {v.count}명 <span style={{color:"rgba(180,200,255,0.5)",fontWeight:400}}>({v.pct}%)</span>
                    </span>
                  </div>
                  <div className="vote-track"><div className={v.cls} style={{width:`${v.pct}%`}}/></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 외환투기꾼 순위 */}
        <div className="glass-dark" style={{padding:"18px 20px"}}>
          <div className="section-title section-title-blue"><span>외환투기꾼 색출 순위</span></div>
          {suspectRanking.length===0?(
            <Standby msg="아직 지목된 학생이 없습니다" blue/>
          ):(
            <ol style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              {suspectRanking.map(([name,count],i)=>{
                const rc=["#f0c040","#c0c8d8","#c07030","rgba(180,150,130,0.6)"][Math.min(i,3)];
                return(
                  <li key={name} className="rank-item">
                    <span style={{fontWeight:900,fontSize:"1rem",color:rc,minWidth:"24px",textAlign:"center"}}>{i+1}</span>
                    <span style={{flex:1,fontWeight:700,color:"#e0d0c0"}}>{name}</span>
                    <span style={{fontWeight:900,color:"#e06060",fontSize:"0.9rem"}}>{count}표</span>
                    <div style={{width:"48px",height:"4px",borderRadius:"2px",background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:"2px",background:"linear-gradient(90deg,#8b1a1a,#e03030)",width:`${Math.round((count/suspects.length)*100)}%`}}/>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* 금융감독관 추측 - ✅ 작성자 이름 숨김 */}
        <div className="glass-gold" style={{padding:"18px 20px"}}>
          <div className="section-title section-title-gold"><span>금융감독관 추측 현황</span></div>
          {supervisorGuesses.length===0?(
            <Standby msg="제출된 추측이 없습니다" gold/>
          ):(
            <ul style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {supervisorGuesses.map((g,i)=>(
                <li key={i} style={{padding:"12px 14px",borderRadius:"10px",background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.2)"}}>
                  <p style={{color:"#e8d08a",fontSize:"0.88rem",lineHeight:1.5}}>{g.guess}</p>
                  {/* ✅ 작성자 이름 표시 안 함 — 익명 처리 */}
                  <p style={{color:"rgba(180,140,60,0.4)",fontSize:"0.7rem",marginTop:"6px"}}>익명 제출 #{i+1}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </>)}

      {/* ── 라운드 리셋 탭 ── */}
      {activeTab==="reset"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>

          {/* 이름 재입력 허용 */}
          <div className="glass-dark" style={{padding:"20px 20px"}}>
            <div className="section-title section-title-blue"><span>학생 이름 재입력</span></div>
            <div style={{background:"rgba(30,60,20,0.25)",border:"1px solid rgba(60,180,100,0.2)",borderRadius:"12px",padding:"14px",marginBottom:"16px"}}>
              <p style={{fontSize:"0.8rem",color:"rgba(140,220,160,0.85)",fontWeight:700,marginBottom:"6px"}}>
                {nameResetActive ? "🟢 현재 학생 이름 재입력 허용 중" : "🔴 현재 이름 고정 상태"}
              </p>
              <p style={{fontSize:"0.75rem",color:"rgba(160,200,170,0.6)",lineHeight:1.7}}>
                허용 버튼을 누르면 모든 학생의 이름이 초기화되어 다시 입력할 수 있습니다.<br/>
                학생들이 이름을 입력한 후 잠금 버튼으로 고정하세요.
              </p>
            </div>
            {nameResetActive ? (
              <button onClick={handleNameLock} className="btn btn-green"
                style={{width:"100%",padding:"13px",fontSize:"0.9rem",fontWeight:900}}>
                🔒 이름 입력 잠금 (고정)
              </button>
            ) : !nameResetConfirm ? (
              <button onClick={()=>setNameResetConfirm(true)} className="btn btn-ghost"
                style={{width:"100%",padding:"13px",fontSize:"0.9rem",border:"1px solid rgba(60,200,100,0.3)",color:"#80e0a0"}}>
                ✏️ 학생 이름 재입력 허용
              </button>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <p style={{fontSize:"0.82rem",color:"#a0e8b0",textAlign:"center",fontWeight:700}}>모든 학생 이름이 초기화됩니다. 진행할까요?</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <button onClick={()=>setNameResetConfirm(false)} className="btn btn-ghost"
                    style={{padding:"11px",fontSize:"0.88rem"}}>취소</button>
                  <button onClick={handleNameReset} className="btn btn-green"
                    style={{padding:"11px",fontSize:"0.88rem",fontWeight:900}}>확인 · 허용</button>
                </div>
              </div>
            )}
          </div>

          {/* 라운드 데이터 리셋 */}
          <div className="glass-dark" style={{padding:"20px 20px"}}>
            <div className="section-title section-title-blue"><span>라운드 데이터 리셋</span></div>
            <div style={{
              background:"rgba(180,30,30,0.1)",border:"1px solid rgba(200,60,60,0.25)",
              borderRadius:"12px",padding:"16px",marginBottom:"16px",
            }}>
              <p style={{fontSize:"0.82rem",color:"rgba(255,160,140,0.9)",fontWeight:700,marginBottom:"8px"}}>⚠ 리셋 시 삭제되는 데이터</p>
              <ul style={{fontSize:"0.78rem",color:"rgba(220,180,160,0.7)",lineHeight:2,paddingLeft:"4px"}}>
                <li>✕ 정책 결정 투표 전체</li>
                <li>✕ 외환투기꾼 색출 지목 전체</li>
                <li>✕ 금융감독관 추측 전체</li>
                <li>✕ 게임 모드 → 대기 중으로 초기화</li>
                <li>✕ 타이머 초기화</li>
                <li>✕ 학생 이름 등록 정보 전체 초기화</li>
              </ul>
              <p style={{fontSize:"0.72rem",color:"rgba(180,120,100,0.6)",marginTop:"10px"}}>※ 환율만 유지됩니다</p>
            </div>
            {!resetConfirm?(
              <button onClick={()=>setResetConfirm(true)} className="btn btn-danger"
                style={{width:"100%",padding:"14px",fontSize:"0.95rem"}}>
                🔄 라운드 리셋 실행
              </button>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <p style={{fontSize:"0.85rem",color:"#ffb0a0",textAlign:"center",fontWeight:700}}>정말로 리셋하시겠습니까?</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                  <button onClick={()=>setResetConfirm(false)} className="btn btn-ghost"
                    style={{padding:"12px",fontSize:"0.9rem"}}>취소</button>
                  <button onClick={handleRoundReset} className="btn btn-danger"
                    style={{padding:"12px",fontSize:"0.9rem",fontWeight:900}}>확인 · 리셋</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 공용 컴포넌트
// ════════════════════════════════════════════════════════════
function ModeBanner({mode,compact}){
  const cfg={
    waiting:    {label:"대기 중",          icon:"⏸", cls:"waiting"},
    day_vote:   {label:"낮 투표 진행 중",  icon:"☀️", cls:"day_vote"},
    night_vote: {label:"밤 투표 진행 중",  icon:"🌙", cls:"night_vote"},
  };
  const c=cfg[mode]||cfg.waiting;
  if(compact) return(
    <span className={`mode-banner ${c.cls}`} style={{padding:"6px 12px",fontSize:"0.75rem"}}>
      {c.icon} {c.label}
    </span>
  );
  return(
    <div className={`mode-banner ${c.cls}`}>
      <span style={{fontSize:"1.1rem"}}>{c.icon}</span>
      <span>{c.label}</span>
      {mode!=="waiting"&&<div className={mode==="day_vote"?"pulse-dot-blue":"pulse-dot-gold"} style={{marginLeft:"auto"}}/>}
    </div>
  );
}

function Locked({msg}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:"8px",opacity:0.5}}>
      <span style={{fontSize:"0.9rem"}}>🔒</span>
      <p style={{fontSize:"0.82rem",color:"rgba(180,150,130,0.8)"}}>{msg}</p>
    </div>
  );
}
function Standby({msg,blue,gold}){
  const color=blue?"rgba(120,160,255,0.5)":gold?"rgba(180,140,60,0.5)":"rgba(180,120,100,0.5)";
  return <p style={{fontSize:"0.82rem",color}}>{msg}</p>;
}
function SuccessMsg({msg,gold}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
      <span style={{fontSize:"1.1rem"}}>{gold?"✦":"✓"}</span>
      <p style={{fontSize:"0.85rem",fontWeight:700,color:gold?"#c9a84c":"#70d070"}}>{msg}</p>
    </div>
  );
}

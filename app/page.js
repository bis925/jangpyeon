"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Search, MapPin, Plus, User, Check, ChevronRight,
    Accessibility, DoorOpen, Baby, MoveVertical, Sparkles, X, Star, LogOut, Mail, Camera, Pencil, Megaphone, ShieldCheck, Paperclip, Bold, MessageCircle, Headset, Italic, Underline, Highlighter, Link2, Locate, LocateFixed, Trash2, Clipboard, ZoomIn, ZoomOut, Type, Navigation, Flag, Bell, Gift,
} from "lucide-react";

/* ===================== 글자 크기 훅 ===================== */
const FONT_SCALES = { small: 0.9, normal: 1, large: 1.15, xlarge: 1.3 };
const FONT_SCALE_LABELS = { small: "작게", normal: "보통", large: "크게", xlarge: "매우 크게" };
function useFontScale() {
  const [scale, setScale] = useState("normal");
  useEffect(() => {
    const saved = localStorage.getItem("jangpyeon_font_scale");
    if (saved && FONT_SCALES[saved]) setScale(saved);
  }, []);
  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * FONT_SCALES[scale]}px`;
    localStorage.setItem("jangpyeon_font_scale", scale);
  }, [scale]);
  return [scale, setScale];
}

/* ===================== 다크모드 훅 ===================== */
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("jangpyeon_theme");
    if (saved === "dark") setIsDark(true);
  }, []);
  useEffect(() => {
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem("jangpyeon_theme", isDark ? "dark" : "light");
  }, [isDark]);
  return [isDark, setIsDark];
}
/* ===================== 디자인 토큰 (장편 브랜드) ===================== */
const LIGHT_THEME = {
  TEAL: "#0F6E62", TEAL_DARK: "#0A4F46", TEAL_TINT: "#E3F0EC",
  CORAL: "#F0603D", CORAL_TINT: "#FDE7E0", YELLOW: "#FFC13B",
  INK: "#1C2420", INK_SOFT: "#66716A", PAPER: "#FAF7F1", CARD: "#FFFFFF", LINE: "#E4DFD1",
};
const DARK_THEME = {
  TEAL: "#3DA394", TEAL_DARK: "#7CC4B8", TEAL_TINT: "#163832",
  CORAL: "#F4805F", CORAL_TINT: "#3D2620", YELLOW: "#FFC13B",
  INK: "#F0EDE4", INK_SOFT: "#A5ADA5", PAPER: "#15181A", CARD: "#1F2426", LINE: "#333937",
};
let TEAL = LIGHT_THEME.TEAL, TEAL_DARK = LIGHT_THEME.TEAL_DARK, TEAL_TINT = LIGHT_THEME.TEAL_TINT;
let CORAL = LIGHT_THEME.CORAL, CORAL_TINT = LIGHT_THEME.CORAL_TINT, YELLOW = LIGHT_THEME.YELLOW;
let INK = LIGHT_THEME.INK, INK_SOFT = LIGHT_THEME.INK_SOFT, PAPER = LIGHT_THEME.PAPER, CARD = LIGHT_THEME.CARD, LINE = LIGHT_THEME.LINE;
function applyTheme(isDark) {
  const t = isDark ? DARK_THEME : LIGHT_THEME;
  TEAL = t.TEAL; TEAL_DARK = t.TEAL_DARK; TEAL_TINT = t.TEAL_TINT;
  CORAL = t.CORAL; CORAL_TINT = t.CORAL_TINT; YELLOW = t.YELLOW;
  INK = t.INK; INK_SOFT = t.INK_SOFT; PAPER = t.PAPER; CARD = t.CARD; LINE = t.LINE;
}

const DISPLAY_FONT = "'Black Han Sans', sans-serif";
const BODY_FONT = "'Nanum Gothic', sans-serif";
const MONO_FONT = "'JetBrains Mono', monospace";

const BADGE_META = {
  ramp: { label: "휠체어 출입", icon: Accessibility, field: "has_ramp" },
  door: { label: "장애인 화장실", icon: DoorOpen, field: "has_restroom" },
  stroller: { label: "유모차 가능", icon: Baby, field: "has_stroller_access" },
  lift: { label: "엘리베이터", icon: MoveVertical, field: "has_elevator" },
};

const TIERS = [
  { label: "새싹 기록가", min: 0 },
  { label: "브론즈 기록가", min: 500 },
  { label: "실버 기록가", min: 1500 },
  { label: "골드 기록가", min: 3000 },
  { label: "플래티넘 기록가", min: 4000 },
  { label: "포인트 사용 가능", min: 5000 },
];
function currentTier(points) {
  let tier = TIERS[0];
  for (const t of TIERS) if (points >= t.min) tier = t;
  return tier;
}
function nextTier(points) {
  return TIERS.find((t) => t.min > points) || null;
}
function getBadges(place) {
  return Object.entries(BADGE_META)
    .filter(([, meta]) => place[meta.field])
    .map(([key]) => key);
}

function renderRichText(text) {
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|==(.+?)==|\[(.+?)\]\((.+?)\)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) nodes.push(<strong key={key++}>{match[1]}</strong>);
    else if (match[2] !== undefined) nodes.push(<em key={key++}>{match[2]}</em>);
    else if (match[3] !== undefined) nodes.push(<u key={key++}>{match[3]}</u>);
    else if (match[4] !== undefined) nodes.push(<mark key={key++} style={{ background: YELLOW, padding: "0 2px" }}>{match[4]}</mark>);
    else if (match[5] !== undefined) nodes.push(<a key={key++} href={match[6]} target="_blank" rel="noopener noreferrer" style={{ color: TEAL, textDecoration: "underline" }}>{match[5]}</a>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

const CATEGORIES = ["공공기관", "음식점", "카페", "문화시설", "쇼핑"];
const ADMIN_EMAIL = "bis925@naver.com";

/* ===================== 작은 컴포넌트 ===================== */
function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <rect width="64" height="64" rx="18" fill={TEAL} />
      <path d="M14 46c8 0 13-1 20-10 5-6 6-10 13-13" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="47" cy="23" r="5.5" fill={CORAL} />
    </svg>
  );
}

function Badge({ badgeKey }) {
  const meta = BADGE_META[badgeKey];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold" style={{ background: TEAL_TINT, color: TEAL_DARK }}>
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

function PlaceCard({ place, onHelpful, isFavorite, onToggleFavorite, onEdit, isOwner, onImageClick, onShare, onDirections, onReport, onDelete }) {
  const badges = getBadges(place);
  return (
        <div className="relative rounded-2xl p-4 transition-all duration-200 hover:shadow-md" style={{ background: CARD, border: `1px solid ${LINE}` }}>
      <button onClick={() => onToggleFavorite(place.id)} className="absolute top-3 right-3 rounded-full p-1.5 z-10 transition-all duration-150 active:scale-90" style={{ background: isFavorite ? "#FFF3D6" : PAPER }} aria-label="즐겨찾기">
        <Star size={18} color={isFavorite ? "#E8A800" : INK_SOFT} fill={isFavorite ? "#E8A800" : "none"} />
      </button>
      <div className="mb-3 min-w-0">
        {place.photo_urls && place.photo_urls.length > 0 ? (
          <div className="flex gap-1.5 overflow-x-auto min-w-0">
            {place.photo_urls.map((url, i) => (
 <button key={i} type="button" onClick={(e) => { e.stopPropagation(); onImageClick(place.photo_urls, i); }} className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden relative">
                <img src={url} alt={`${place.name} ${i + 1}`} className="w-full h-full object-cover" />
                {place.photo_urls.length > 1 && i === 0 && (
                  <div className="absolute bottom-0.5 right-0.5 rounded-full px-1.5 py-0.5" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{place.photo_urls.length}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl" style={{ background: `linear-gradient(135deg, ${TEAL_TINT}, ${YELLOW})` }} />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <div className="font-extrabold" style={{ color: INK, fontFamily: BODY_FONT }}>{place.name}</div>
          {isOwner && (
            <>
              <button onClick={() => onEdit(place)} className="flex items-center gap-1 rounded-full pl-1.5 pr-2 py-1 transition-all duration-150 active:scale-90 hover:bg-black/5" aria-label="수정하기">
                <Pencil size={13} color={INK_SOFT} />
                <span style={{ fontSize: 10, fontWeight: 700, color: INK_SOFT }}>수정</span>
              </button>
              <button onClick={() => onDelete(place)} className="flex items-center gap-1 rounded-full pl-1.5 pr-2 py-1 transition-all duration-150 active:scale-90 hover:bg-black/5" aria-label="삭제하기">
                <Trash2 size={13} color={CORAL} />
                <span style={{ fontSize: 10, fontWeight: 700, color: CORAL }}>삭제</span>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="text-xs mb-2" style={{ color: INK_SOFT }}>{place.category} · {place.address}</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {badges.map((b) => <Badge key={b} badgeKey={b} />)}
      </div>
      <div className="flex items-center gap-1 mb-3">
        <button onClick={() => onShare(place)} className="flex items-center gap-1 rounded-full pl-2 pr-2.5 py-1.5 transition-all duration-150 active:scale-90" style={{ background: "#FEE500" }} aria-label="카카오톡으로 공유하기">
          <MessageCircle size={14} color="#3C1E1E" fill="#3C1E1E" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#3C1E1E" }}>공유</span>
        </button>
        <button onClick={() => onDirections(place)} className="flex items-center gap-1 rounded-full pl-2 pr-2.5 py-1.5 transition-all duration-150 active:scale-90" style={{ background: TEAL }} aria-label="길찾기">
          <Navigation size={14} color="#fff" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>길찾기</span>
        </button>
        {!isOwner && (
          <button onClick={() => onReport(place)} className="flex items-center gap-1 rounded-full pl-2 pr-2.5 py-1.5 transition-all duration-150 active:scale-90" style={{ background: CORAL_TINT }} aria-label="정보가 달라졌어요 신고">
            <Flag size={14} color={CORAL} />
            <span style={{ fontSize: 10, fontWeight: 700, color: CORAL }}>신고</span>
          </button>
        )}
      </div>
      <button onClick={() => onHelpful(place.id)} className="text-xs font-bold transition-all duration-150 active:scale-95 hover:opacity-75" style={{ color: CORAL }}>
        도움이 됐어요 {place.helpful_count} · 눌러서 응원하기
      </button>
    </div>
  );
}

function TierBar({ points }) {
  const pct = Math.min(100, (points / 5000) * 100);
  return (
    <div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: LINE }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${TEAL}, ${CORAL})` }} />
      </div>
      <div className="flex justify-between mt-2 text-[10px]" style={{ color: INK_SOFT }}>
        {TIERS.map((t) => <span key={t.label} style={{ fontFamily: MONO_FONT }}>{t.min}</span>)}
      </div>
    </div>
  );
}

/* ===================== 로그인 화면 ===================== */
function LoginScreen({ onSent }) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("jangpyeon_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg("");
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    localStorage.setItem("jangpyeon_email", email.trim());
    setSent(true);
  }

  async function pasteOtp() {
    try {
      let text = "";
      if (typeof window !== "undefined" && window.Capacitor) {
        const { Clipboard } = await import("@capacitor/clipboard");
        const result = await Clipboard.read();
        text = result.value || "";
      } else {
        text = await navigator.clipboard.readText();
      }
      const digits = text.replace(/[^0-9]/g, "").slice(0, 8);
      if (digits) {
        setOtp(digits);
      } else {
        showToast("클립보드에 숫자가 없어요");
      }
    } catch (err) {
      showToast("붙여넣기에 실패했어요, 클립보드 권한을 확인해주세요");
    }
  }
  async function handleVerify(e) {
    e.preventDefault();
    if (!otp.trim()) return;
    setVerifying(true);
    setErrorMsg("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp.trim(), type: "email" });
    setVerifying(false);
    if (error) { setErrorMsg("코드가 올바르지 않아요, 다시 확인해주세요"); return; }
  }

  return (
    <div style={{ background: PAPER, fontFamily: BODY_FONT, minHeight: "100vh" }}>
      <div className="px-6 pt-16 pb-10">
        <div className="w-full max-w-sm mx-auto text-center">
          <div className="flex justify-center">
            <LogoMark size={84} />
          </div>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 32, color: INK, margin: "16px 0 6px" }}>장편</div>
          <p className="text-sm mb-1" style={{ color: INK_SOFT }}>장애물 없는 편의, 함께 기록해요</p>
          <p className="text-xs mb-8" style={{ color: '#9A9484' }}>휠체어 접근성 · 장애인 화장실 · 유모차 정보를 지도에서 찾아보세요</p>

                {sent ? (
            <div className="rounded-2xl p-6" style={{ background: TEAL_TINT }}>
              <Mail size={22} color={TEAL} className="mx-auto mb-2" />
              <div className="font-bold text-sm mb-1" style={{ color: TEAL_DARK }}>메일함을 확인해주세요</div>
              <div className="text-xs mb-4" style={{ color: INK_SOFT }}>{email}로 인증코드 8자리를 보냈어요</div>
              <form onSubmit={handleVerify}>
                  <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="인증코드 8자리"
                  className="w-full rounded-xl px-4 py-3 mb-2 text-sm text-center outline-none"
                  style={{ border: `1.4px solid ${LINE}`, color: INK, letterSpacing: 4, fontFamily: MONO_FONT }}
                />
                <button type="button" onClick={pasteOtp} className="w-full flex items-center justify-center gap-1.5 rounded-xl py-3 mb-3 transition-all duration-200 active:scale-95" style={{ background: TEAL_TINT, color: TEAL_DARK }}>
                  <Clipboard size={16} />
                  <span className="text-sm font-bold">붙여넣기</span>
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full rounded-full py-3.5 font-extrabold text-white transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                  style={{ background: TEAL }}
                >
                  {verifying ? "확인 중..." : "인증코드 확인하고 로그인"}
                </button>
                {errorMsg && <p className="text-xs mt-3" style={{ color: CORAL }}>{errorMsg}</p>}
                <button type="button" onClick={() => { setSent(false); setOtp(""); setErrorMsg(""); }} className="text-xs mt-3" style={{ color: INK_SOFT }}>
                  다른 이메일로 다시 시도
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                className="w-full rounded-xl px-4 py-3 mb-3 text-sm outline-none"
                style={{ border: `1.4px solid ${LINE}`, color: INK }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3.5 font-extrabold text-white transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                style={{ background: CORAL }}
              >
                {loading ? "보내는 중..." : "이메일로 로그인 링크 받기"}
              </button>
              {errorMsg && <p className="text-xs mt-3" style={{ color: CORAL }}>{errorMsg}</p>}
            </form>
          )}
                  <p className="text-xs mt-6 mb-4" style={{ color: INK_SOFT }}>
            비밀번호 없이, 메일로 온 링크만 누르면 로그인돼요.
          </p>
                    <a href="http://pf.kakao.com/_xkuexaX/chat" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full py-3.5 font-extrabold mt-8 mb-8 transition-all duration-200 active:scale-[0.98]"
              style={{ background: "#FEE500", color: "#3C1E1E" }}>
              <Headset size={18} />
              카카오톡으로 상담하기
            </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="text-center mb-8">
          <div className="font-extrabold text-lg" style={{ color: INK, fontFamily: DISPLAY_FONT }}>장편으로 할 수 있는 일</div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${LINE}` }}>
            <MapPin size={20} color={TEAL} className="mb-2" />
            <div className="font-extrabold text-sm mb-1" style={{ color: INK }}>지도에서 찾기</div>
            <div className="text-xs" style={{ color: INK_SOFT }}>휠체어 출입, 장애인 화장실, 유모차 접근성 정보를 지도에서 한눈에 확인해요.</div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${LINE}` }}>
            <Plus size={20} color={TEAL} className="mb-2" />
            <div className="font-extrabold text-sm mb-1" style={{ color: INK }}>함께 등록하기</div>
            <div className="text-xs" style={{ color: INK_SOFT }}>직접 방문한 장소의 접근성 정보를 등록하고 포인트를 받아요.</div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${LINE}` }}>
            <Megaphone size={20} color={TEAL} className="mb-2" />
            <div className="font-extrabold text-sm mb-1" style={{ color: INK }}>공지사항</div>
            <div className="text-xs" style={{ color: INK_SOFT }}>이벤트와 서비스 소식을 공지사항에서 확인할 수 있어요.</div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${LINE}` }}>
            <Sparkles size={20} color={TEAL} className="mb-2" />
            <div className="font-extrabold text-sm mb-1" style={{ color: INK }}>포인트 적립</div>
            <div className="text-xs" style={{ color: INK_SOFT }}>등록, 응원 등 활동할수록 포인트가 쌓이고 등급이 올라가요.</div>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="font-extrabold text-lg" style={{ color: INK, fontFamily: DISPLAY_FONT }}>이런 곳을 확인할 수 있어요</div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <span key={c} className="rounded-full px-4 py-2 text-xs font-bold" style={{ background: TEAL_TINT, color: TEAL_DARK }}>{c}</span>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs" style={{ color: '#B8B1A0' }}>제작 · 코드람쥐</p>
        </div>
      </div>
    </div>
  );
}


/* ===================== 온보딩 ===================== */
const ONBOARDING_SLIDES = [
  { color: TEAL, bubble: "안녕! 나는 장편이야 👋", title: "지도에서 한눈에 확인", desc: "휠체어 출입, 장애인 화장실, 유모차 접근성 정보를 지도 위에서 바로 찾아볼 수 있어." },
  { color: CORAL, bubble: "같이 등록해볼까? ✍️", title: "함께 등록해요", desc: "직접 방문한 장소의 접근성 정보를 등록하면 포인트가 쌓여! 사진도 여러 장 남길 수 있어." },
  { color: "#E8A800", bubble: "포인트 모으는 재미! 🎉", title: "포인트로 등급 UP", desc: "등록하고, 응원받을 때마다 포인트가 쌓이고 등급이 올라가." },
  { color: TEAL_DARK, bubble: "이벤트도 알려줄게! 📢", title: "이벤트도 놓치지 마세요", desc: "공지사항과 이벤트 소식을 확인하고, 카카오톡으로 편하게 문의해." },
];

function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const slide = ONBOARDING_SLIDES[step];
  const isLast = step === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden" style={{ background: PAPER }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        {/* 떠다니는 배경 점들 */}
        <div className="absolute onboard-dot" style={{ top: "18%", left: "15%", width: 10, height: 10, borderRadius: 999, background: slide.color }} />
        <div className="absolute onboard-dot" style={{ top: "28%", right: "18%", width: 14, height: 14, borderRadius: 999, background: YELLOW, animationDelay: "0.6s" }} />
        <div className="absolute onboard-dot" style={{ bottom: "26%", left: "20%", width: 8, height: 8, borderRadius: 999, background: CORAL, animationDelay: "1.2s" }} />

        <div key={step} className="flex flex-col items-center">
          <div className="mb-1">
            <Mascot mood={step} />
          </div>

          <div className="onboard-bubble relative rounded-2xl px-4 py-2.5 mb-8" style={{ background: "#fff", border: `1.5px solid ${LINE}`, maxWidth: 240 }}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45" style={{ background: "#fff", borderLeft: `1.5px solid ${LINE}`, borderTop: `1.5px solid ${LINE}` }} />
            <span className="text-sm font-bold" style={{ color: INK }}>{slide.bubble}</span>
          </div>

          <div className="onboard-slide text-center">
            <div className="font-extrabold text-xl mb-3" style={{ color: INK, fontFamily: DISPLAY_FONT }}>{slide.title}</div>
            <div className="text-sm leading-relaxed max-w-xs" style={{ color: INK_SOFT }}>{slide.desc}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {ONBOARDING_SLIDES.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300" style={{ width: i === step ? 20 : 6, height: 6, background: i === step ? TEAL : LINE }} />
        ))}
      </div>

      <div className="px-8 pb-10">
        <button
          onClick={() => { if (isLast) onFinish(); else setStep(step + 1); }}
          className="w-full rounded-full py-3.5 font-extrabold text-white transition-all duration-200 active:scale-[0.98]"
          style={{ background: TEAL }}
        >
          {isLast ? "시작하기" : "다음"}
        </button>
        {!isLast && (
          <button onClick={onFinish} className="w-full text-center text-xs mt-3" style={{ color: INK_SOFT }}>
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
/* ===================== 메인 앱 ===================== */
export default function Page() {
    const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isDark, setIsDark] = useDarkMode();
  applyTheme(isDark);
  const [fontScale, setFontScale] = useFontScale();
  const scaleKeys = Object.keys(FONT_SCALES);
  function stepFontScale(dir) {
    const idx = scaleKeys.indexOf(fontScale);
    const next = dir === "up" ? Math.min(idx + 1, scaleKeys.length - 1) : Math.max(idx - 1, 0);
    setFontScale(scaleKeys[next]);
  }
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [places, setPlaces] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [history, setHistory] = useState([]);

  const [tab, setTab] = useState("home");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [mapCategory, setMapCategory] = useState(null);
    const [pendingFocusId, setPendingFocusId] = useState(null);
  const [toast, setToast] = useState(null);
  const [justRegistered, setJustRegistered] = useState(null);
  const [form, setForm] = useState({
    name: "", address: "", addressDetail: "", category: "공공기관", keywords: "",
    badges: { ramp: false, door: false, stroller: false, lift: false },
  });
    const [isSubmittingPlace, setIsSubmittingPlace] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
    const [editingPlaceId, setEditingPlaceId] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
      const [selectedNoticeId, setSelectedNoticeId] = useState(null);
      const [expandedNoticeId, setExpandedNoticeId] = useState(null);
    const [notices, setNotices] = useState([]);
  const noticesInitialized = useRef(false);
  const [inquiries, setInquiries] = useState([]);
  const [allInquiries, setAllInquiries] = useState([]);
  const [inquiryForm, setInquiryForm] = useState({ title: "", content: "" });
  const [showInquiryForm, setShowInquiryForm] = useState(false);
   const [noticeForm, setNoticeForm] = useState({ title: "", content: "", link_url: "" });
    const [noticeImageFile, setNoticeImageFile] = useState(null);
  const [noticeImagePreview, setNoticeImagePreview] = useState(null);
  const [noticeAttachedFile, setNoticeAttachedFile] = useState(null);
  const noticeContentRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
    const [campaigns, setCampaigns] = useState([]);
  const [campaignIndex, setCampaignIndex] = useState(0);
  const [campaignForm, setCampaignForm] = useState({ title: "", link_url: "", notice_id: "" });
  const [campaignFile, setCampaignFile] = useState(null);
  const [campaignPreview, setCampaignPreview] = useState(null);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
    const [allProfiles, setAllProfiles] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [adjustDrafts, setAdjustDrafts] = useState({});
    const [adjustLog, setAdjustLog] = useState([]);
    const [allReports, setAllReports] = useState([]);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [individualNotifDrafts, setIndividualNotifDrafts] = useState({});
  const [notifTarget, setNotifTarget] = useState("notice");
  const [notifNoticeId, setNotifNoticeId] = useState("");
  const [adminNoteDrafts, setAdminNoteDrafts] = useState({});
  const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [kakaoLoaded, setKakaoLoaded] = useState(false);
    const [myLocation, setMyLocation] = useState(null);
  const myMarkerRef = useRef(null);
  const [locatingAddress, setLocatingAddress] = useState(false);
    const [showAddressSearch, setShowAddressSearch] = useState(false);
  const addressSearchRef = useRef(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [reportingPlace, setReportingPlace] = useState(null);
    const [deletingPlace, setDeletingPlace] = useState(null);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [myCoupons, setMyCoupons] = useState([]);
  const [viewingCoupon, setViewingCoupon] = useState(null);
   const [confirmingUseCoupon, setConfirmingUseCoupon] = useState(null);
  const [allCoupons, setAllCoupons] = useState([]);
  const [expandedMemberId, setExpandedMemberId] = useState(null);
   const [isAdminEditingPlace, setIsAdminEditingPlace] = useState(false);
  const [navbarOffset, setNavbarOffset] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [tabsHeight, setTabsHeight] = useState(0);
  const navbarRef = useRef(null);
  const tabsRef = useRef(null);
  const pendingCouponAnnounce = useRef(false);
  const [couponDrafts, setCouponDrafts] = useState({});
  const [couponImageFile, setCouponImageFile] = useState(null);
  const [couponImagePreview, setCouponImagePreview] = useState(null);
  const [showCouponList, setShowCouponList] = useState(false);
  const swipeStartX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const didSwipe = useRef(false);
  const [reportReason, setReportReason] = useState("");
    const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);

    useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.Capacitor || !session) return;
    import("@capacitor/push-notifications").then(({ PushNotifications }) => {
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === "granted") {
          PushNotifications.register();
        }
      });
      PushNotifications.addListener("registration", async (token) => {
        await supabase.from("push_tokens").upsert(
          { user_id: session.user.id, token: token.value },
          { onConflict: "token" }
        );
      });
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const target = action.notification?.data?.target;
        const noticeId = action.notification?.data?.noticeId;
        if (target === "home") setTab("home");
        else if (target === "map") setTab("map");
        else if (target === "mypage") setTab("my");
        else {
          setTab("notice");
          if (noticeId) {
            setSelectedNoticeId(noticeId);
            setExpandedNoticeId(noticeId);
            setTimeout(() => {
              document.getElementById(`notice-${noticeId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
          }
        }
      });
    });
  }, [session]);
  
  useEffect(() => {
    if (typeof window === "undefined" || !window.Capacitor) return;
    let subPromise;
    import("@capacitor/app").then(({ App }) => {
          subPromise = App.addListener("backButton", () => {
        if (tab !== "home") {
          setTab("home");
        } else {
          setShowExitConfirm(true);
        }
      });
    });
    return () => { if (subPromise) subPromise.then((s) => s.remove()); };
  }, [tab]);
  useEffect(() => {
    if (window.kakao && window.kakao.maps) { setKakaoLoaded(true); return; }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => { window.kakao.maps.load(() => setKakaoLoaded(true)); };
    document.head.appendChild(script);
  }, []);
  
  useEffect(() => {
    const daumScript = document.createElement("script");
    daumScript.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    daumScript.async = true;
    document.head.appendChild(daumScript);
  }, []);

  useEffect(() => {
    const shareScript = document.createElement("script");
    shareScript.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    shareScript.async = true;
    shareScript.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);
      }
    };
    document.head.appendChild(shareScript);
  }, []);
  useEffect(() => {
    if (tab !== "map" || !kakaoLoaded || !mapContainerRef.current) return;
    const kakao = window.kakao;
    const center = myLocation ? new kakao.maps.LatLng(myLocation.lat, myLocation.lng) : new kakao.maps.LatLng(37.5665, 126.9780);
    const map = new kakao.maps.Map(mapContainerRef.current, { center, level: myLocation ? 4 : 6 });
    mapInstanceRef.current = map;
    markersRef.current = {};
    const geocoder = new kakao.maps.services.Geocoder();
    const filtered = mapCategory ? places.filter((p) => p.category === mapCategory) : places;

       function addMarker(placeId, lat, lng, name) {
      const position = new kakao.maps.LatLng(lat, lng);
      const marker = new kakao.maps.Marker({ position, map });
      const infowindow = new kakao.maps.InfoWindow({ content: `<div style="padding:6px 10px;font-size:12px;">${name}</div>` });
      kakao.maps.event.addListener(marker, "click", () => infowindow.open(map, marker));
      markersRef.current[placeId] = { marker, infowindow, position };
      if (placeId === pendingFocusId) {
        map.setCenter(position);
        map.setLevel(3);
        infowindow.open(map, marker);
        setPendingFocusId(null);
      }
    }

    filtered.forEach((place) => {
      if (place.lat && place.lng) {
        addMarker(place.id, place.lat, place.lng, place.name);
      } else if (place.address) {
        geocoder.addressSearch(place.address, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            addMarker(place.id, parseFloat(result[0].y), parseFloat(result[0].x), place.name);
          }
        });
      }
    });
  }, [tab, kakaoLoaded, mapCategory, places]);

  useEffect(() => {
    if (campaigns.length <= 1) return;
    const timer = setInterval(() => {
      setCampaignIndex((i) => (i + 1) % campaigns.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [campaigns]);

   function handleSwipeStart(e) {
    swipeStartX.current = e.touches[0].clientX;
    didSwipe.current = false;
  }
  function handleSwipeEnd(e) {
    const diff = e.changedTouches[0].clientX - swipeStartX.current;
    if (Math.abs(diff) < 50) return;
    didSwipe.current = true;
    if (diff < 0 && previewIndex < previewImages.length - 1) {
      setPreviewIndex(previewIndex + 1);
    } else if (diff > 0 && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    }
  }
  function handleMouseDown(e) {
    swipeStartX.current = e.clientX;
    setIsDragging(true);
    didSwipe.current = false;
  }
  function handleMouseUp(e) {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = e.clientX - swipeStartX.current;
    if (Math.abs(diff) < 50) return;
    didSwipe.current = true;
    if (diff < 0 && previewIndex < previewImages.length - 1) {
      setPreviewIndex(previewIndex + 1);
    } else if (diff > 0 && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    }
  }
  
  function reportPlace(place) {
    setReportingPlace(place);
    setReportReason("");
  }
  async function submitReport() {
    if (!reportReason.trim()) { showToast("어떤 정보가 달라졌는지 입력해주세요"); return; }
    const { error } = await supabase.from("reports").insert({ place_id: reportingPlace.id, reporter_id: session.user.id, reason: reportReason.trim() });
    if (error) { showToast("신고 접수 실패: " + error.message); return; }
    setReportingPlace(null);
    showToast("신고가 접수됐어요, 확인 후 반영할게요");
  }
  
  function openDirections(place) {
    const query = (place.address || place.name).trim();
    const url = `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  }
  async function shareToKakao(place) {
    if (typeof window !== "undefined" && window.Capacitor) {
      // 앱 환경: 안드로이드 표준 공유창 사용 (카카오톡, 문자 등 선택 가능)
      try {
        const { Share } = await import("@capacitor/share");
        await Share.share({
          title: place.name,
          text: `${place.name} (${place.category})\n${place.address}\n장편에서 확인해보세요!`,
          url: "https://jangpyeon.kr",
          dialogTitle: "공유하기",
        });
      } catch (err) {
        // 사용자가 공유창을 취소한 경우도 여기로 오니, 에러 표시는 생략
      }
      return;
    }
    if (!window.Kakao) { showToast("공유 기능을 불러오는 중이에요"); return; }
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: place.name,
        description: `${place.category} · ${place.address}`,
        imageUrl: place.photo_url || "https://jangpyeon.kr/icon.png",
        link: { mobileWebUrl: "https://jangpyeon.kr", webUrl: "https://jangpyeon.kr" },
      },
      buttons: [
        { title: "장편에서 보기", link: { mobileWebUrl: "https://jangpyeon.kr", webUrl: "https://jangpyeon.kr" } },
      ],
    });
  }
    async function saveNickname() {
    if (!nicknameDraft.trim()) { showToast("닉네임을 입력해주세요"); return; }
    const { error } = await supabase.from("profiles").update({ nickname: nicknameDraft.trim() }).eq("id", session.user.id);
    if (error) { showToast("저장 실패: " + error.message); return; }
    setProfile((prev) => ({ ...prev, nickname: nicknameDraft.trim() }));
    setEditingNickname(false);
    showToast("닉네임이 변경됐어요!");
  }
    async function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const fileExt = file.name.split(".").pop();
    const filePath = `${session.user.id}/avatar.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { showToast("업로드 실패: " + uploadError.message); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const newUrl = urlData.publicUrl + "?t=" + Date.now();
    await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", session.user.id);
    setAvatarUrl(newUrl);
    showToast("프로필 사진이 변경됐어요!");
  }
    function locateMe() {
    if (!navigator.geolocation) { showToast("이 기기에서는 위치 확인이 안 돼요"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(coords);
        if (mapInstanceRef.current && window.kakao) {
          const position = new window.kakao.maps.LatLng(coords.lat, coords.lng);
          mapInstanceRef.current.setCenter(position);
          mapInstanceRef.current.setLevel(4);
          if (myMarkerRef.current) myMarkerRef.current.setMap(null);
          myMarkerRef.current = new window.kakao.maps.Marker({
            position,
            map: mapInstanceRef.current,
            image: new window.kakao.maps.MarkerImage(
              "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/></svg>'),
              new window.kakao.maps.Size(24, 24)
            ),
          });
        }
      },
      () => { showToast("위치 정보를 가져올 수 없어요, 위치 권한을 확인해주세요"); },
      { enableHighAccuracy: true }
    );
  }
  function locateMeForRegister() {
    if (!navigator.geolocation) { showToast("이 기기에서는 위치 확인이 안 돼요"); return; }
    setLocatingAddress(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!window.kakao) { setLocatingAddress(false); return; }
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(longitude, latitude, (result, status) => {
          setLocatingAddress(false);
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            const addr = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
            setForm((prev) => ({ ...prev, address: addr }));
            showToast("현재 위치로 주소를 찾았어요");
          } else {
            showToast("주소를 찾을 수 없어요");
          }
        });
      },
      () => { setLocatingAddress(false); showToast("위치 정보를 가져올 수 없어요, 위치 권한을 확인해주세요"); },
      { enableHighAccuracy: true }
    );
  }
  function focusOnPlace(placeId) {
    const entry = markersRef.current[placeId];
    if (!entry || !mapInstanceRef.current) return;
    mapInstanceRef.current.setCenter(entry.position);
    mapInstanceRef.current.setLevel(3);
    entry.infowindow.open(mapInstanceRef.current, entry.marker);
  }
    useEffect(() => {
    function handleTouchStart(e) {
      if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
    }
    function handleTouchMove(e) {
      if (window.scrollY === 0 && touchStartY.current > 0) {
        const distance = e.touches[0].clientY - touchStartY.current;
        if (distance > 0) {
          setIsPulling(true);
          setPullDistance(Math.min(distance, 80));
        }
      }
    }
    function handleTouchEnd() {
      if (pullDistance > 60) {
        window.location.reload();
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
      touchStartY.current = 0;
    }
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance]);

    useEffect(() => {
    function handleGlobalClick(e) {
      if (!pendingCouponAnnounce.current) return;
      // 쿠폰함/쿠폰 관련 버튼을 눌렀을 때는 소리 안 냄
      if (e.target.closest('[aria-label="쿠폰함"]') || e.target.closest("#coupon-section")) return;
          const count = pendingCouponAnnounce.current;
      pendingCouponAnnounce.current = false;
      const text = `사용하실 수 있는 쿠폰이 ${count}개 있습니다. 쿠폰함을 확인해보세요.`;
               if (typeof window !== "undefined" && window.Capacitor) {
        import("@capacitor-community/text-to-speech").then(({ TextToSpeech }) => {
          TextToSpeech.speak({ text, lang: "ko-KR", rate: 0.95, pitch: 1.15, volume: 1.0, category: "ambient" });
        });
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "ko-KR";
        utter.rate = 0.95;
        utter.pitch = 1.15;
        utter.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const koreanVoice = voices.find((v) => v.lang === "ko-KR" && /female|여성|유나|Yuna|Sora|소라/i.test(v.name))
          || voices.find((v) => v.lang === "ko-KR");
        if (koreanVoice) utter.voice = koreanVoice;
        window.speechSynthesis.speak(utter);
      }
    }
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

   useEffect(() => {
    function handleScroll() {
      setNavbarOffset(window.scrollY || document.documentElement.scrollTop || 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    function measure() {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
      if (tabsRef.current) setTabsHeight(tabsRef.current.offsetHeight);
    }
    measure();
    window.addEventListener("resize", measure);
    const timer = setTimeout(measure, 300);
    return () => { window.removeEventListener("resize", measure); clearTimeout(timer); };
  }, [session]);
  
  /* --- 인증 상태 감지 --- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);



  /* --- 로그인 후 데이터 불러오기 --- */
  useEffect(() => {
    if (session) {
      fetchProfile();
      fetchPlaces();
      fetchFavorites();
      fetchHistory();
      fetchNotices();
      fetchInquiries();
      fetchAllInquiries();
      fetchCampaigns();
      fetchAllProfiles();
          fetchAdjustLog();
      fetchReports();
      fetchMyCoupons();
      fetchAllCoupons();
    }
  }, [session]);

  async function fetchProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    setProfile(data);
    setAvatarUrl(data?.avatar_url || null);

  }
  async function fetchPlaces() {
    const { data } = await supabase.from("places").select("*, place_photos(photo_url)").eq("status", "approved").order("created_at", { ascending: false });
    const withPhoto = (data || []).map((p) => ({ ...p, photo_urls: (p.place_photos || []).map((ph) => ph.photo_url), photo_url: p.place_photos?.[0]?.photo_url || null }));
    setPlaces(withPhoto);
  }
  async function fetchMyCoupons() {
    const { data } = await supabase.from("coupons").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    const unusedCount = (data || []).filter((c) => c.status === "unused").length;
    const hadUnusedBefore = myCoupons.some((c) => c.status === "unused");
    setMyCoupons(data || []);
    if (unusedCount > 0 && !hadUnusedBefore) {
      pendingCouponAnnounce.current = unusedCount;
    }
  }
    async function fetchAllCoupons() {
    if (session.user.email !== ADMIN_EMAIL) return;
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setAllCoupons(data || []);
  }
  async function deleteCoupon(couponId) {
    if (!window.confirm("이 쿠폰을 삭제하시겠어요?")) return;
    const { error } = await supabase.rpc("admin_delete_coupon", { p_coupon_id: couponId });
    if (error) { showToast("삭제 실패: " + error.message); return; }
    fetchAllCoupons();
    showToast("쿠폰이 삭제됐어요");
  }
    function openUseCouponConfirm(couponId) {
    setViewingCoupon(null);
    setConfirmingUseCoupon(couponId);
  }
  async function confirmUseCoupon() {
    const couponId = confirmingUseCoupon;
    setConfirmingUseCoupon(null);
    const { error } = await supabase.rpc("use_coupon", { p_coupon_id: couponId });
    if (error) { showToast("처리 실패: " + error.message); return; }
    await fetchMyCoupons();
    setViewingCoupon(null);
    showToast("쿠폰을 사용 처리했어요");
  }
  async function fetchFavorites() {
    const { data } = await supabase.from("favorites").select("place_id").eq("user_id", session.user.id);
    setFavorites(new Set((data || []).map((f) => f.place_id)));
  }
     async function fetchNotices() {
    const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
    setNotices(data || []);
    if (!noticesInitialized.current && data && data.length > 0) {
      noticesInitialized.current = true;
      setExpandedNoticeId((prev) => prev !== null ? prev : data[0].id);
    }
  }
  async function fetchInquiries() {
    const { data } = await supabase.from("inquiries").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setInquiries(data || []);
  }
  async function fetchAllInquiries() {
    if (session.user.email !== ADMIN_EMAIL) return;
    const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    setAllInquiries(data || []);
  }
    async function fetchAllProfiles() {
    if (session.user.email !== ADMIN_EMAIL) return;
    const { data } = await supabase.from("profiles").select("*").order("points", { ascending: false });
    setAllProfiles(data || []);
  }
    async function fetchAdjustLog() {
    if (session.user.email !== ADMIN_EMAIL) return;
    const { data } = await supabase.from("point_history").select("*, profiles(email, nickname)").eq("activity_type", "admin_adjust").order("created_at", { ascending: false }).limit(50);
    setAdjustLog(data || []);
  }
    async function fetchReports() {
    if (session.user.email !== ADMIN_EMAIL) return;
    const { data } = await supabase.from("reports").select("*, places(name, address)").order("created_at", { ascending: false }).limit(50);
    setAllReports(data || []);
  }
  async function resolveReport(reportId) {
    const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
    if (error) { showToast("처리 실패: " + error.message); return; }
    fetchReports();
    showToast("처리 완료로 표시했어요");
  }
    async function fetchCampaigns() {
    const { data } = await supabase.from("campaigns").select("*").order("sort_order", { ascending: true });
    setCampaigns(data || []);
  }
  async function fetchHistory() {
    const { data } = await supabase.from("point_history").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(30);
    setHistory(data || []);
  }
    function handleNoticeImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setNoticeImageFile(file);
      setNoticeImagePreview(URL.createObjectURL(file));
    }
  }
  function handleNoticeFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) setNoticeAttachedFile(file);
  }
   function wrapSelection(before, after, placeholder) {
    const textarea = noticeContentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = noticeForm.content;
    const selected = text.slice(start, end) || placeholder;
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    setNoticeForm({ ...noticeForm, content: newText });
  }
  function insertLink() {
    const textarea = noticeContentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = noticeForm.content;
    const selected = text.slice(start, end) || "링크 글자";
    const url = window.prompt("연결할 주소를 입력해주세요 (예: https://...)");
    if (!url) return;
    const newText = text.slice(0, start) + `[${selected}](${url})` + text.slice(end);
    setNoticeForm({ ...noticeForm, content: newText });
  }
  function insertEmoji(emoji) {
    setNoticeForm({ ...noticeForm, content: noticeForm.content + emoji });
    setShowEmojiPicker(false);
  }
    function startEditNotice(n) {
    setEditingNoticeId(n.id);
    setNoticeForm({ title: n.title, content: n.content, link_url: n.link_url || "" });
    setNoticeImagePreview(n.image_url || null);
    setNoticeImageFile(null);
    setNoticeAttachedFile(null);
  }

  async function deleteNotice(id) {
    await supabase.from("notices").delete().eq("id", id);
    fetchNotices();
  }
  async function submitNotice(e) {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;

    let imageUrl = editingNoticeId ? noticeImagePreview : null;
    if (noticeImageFile) {
      const fileExt = noticeImageFile.name.split(".").pop();
      const filePath = `images/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("notice-attachments").upload(filePath, noticeImageFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("notice-attachments").getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }
    }

    let fileUrl = null;
    let fileName = null;
    if (noticeAttachedFile) {
      const fileExt = noticeAttachedFile.name.split(".").pop();
      const filePath = `files/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("notice-attachments").upload(filePath, noticeAttachedFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("notice-attachments").getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;
        fileName = noticeAttachedFile.name;
      }
    }

    const noticeData = {
      title: noticeForm.title.trim(),
      content: noticeForm.content.trim(),
      link_url: noticeForm.link_url.trim() || null,
      image_url: imageUrl,
    };
    if (fileUrl) { noticeData.file_url = fileUrl; noticeData.file_name = fileName; }

    let error;
    if (editingNoticeId) {
      ({ error } = await supabase.from("notices").update(noticeData).eq("id", editingNoticeId));
    } else {
      ({ error } = await supabase.from("notices").insert(noticeData));
    }
    if (error) { showToast("저장 실패: " + error.message); return; }

    setNoticeForm({ title: "", content: "", link_url: "" });
    setNoticeImageFile(null);
    setNoticeImagePreview(null);
    setNoticeAttachedFile(null);
    setEditingNoticeId(null);
    fetchNotices();
    showToast(editingNoticeId ? "공지사항이 수정됐어요" : "공지사항이 등록됐어요");
  }
    function handleCampaignPhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setCampaignFile(file);
      setCampaignPreview(URL.createObjectURL(file));
    }
  }
    async function submitInquiry(e) {
    e.preventDefault();
    if (!inquiryForm.title.trim() || !inquiryForm.content.trim()) return;
    const { error } = await supabase.from("inquiries").insert({
      user_id: session.user.id,
      title: inquiryForm.title.trim(),
      content: inquiryForm.content.trim(),
    });
    if (error) { showToast("문의 등록 실패: " + error.message); return; }
    setInquiryForm({ title: "", content: "" });
    setShowInquiryForm(false);
    fetchInquiries();
    showToast("문의가 접수됐어요");
  }
  async function submitReply(id) {
    const answer = replyDrafts[id];
    if (!answer || !answer.trim()) return;
    const { error } = await supabase.from("inquiries").update({
      answer: answer.trim(),
      status: "answered",
      answered_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { showToast("답변 실패: " + error.message); return; }
    fetchAllInquiries();
    showToast("답변이 등록됐어요");
  }
    async function submitCampaign(e) {
    e.preventDefault();
    if (!editingCampaignId && !campaignFile) { showToast("이미지를 선택해주세요"); return; }

    let imageUrl = null;
    if (campaignFile) {
      const fileExt = campaignFile.name.split(".").pop();
      const filePath = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("campaign-images").upload(filePath, campaignFile);
      if (uploadError) { showToast("이미지 업로드 실패: " + uploadError.message); return; }
      const { data: urlData } = supabase.storage.from("campaign-images").getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    if (editingCampaignId) {
      const updateData = { title: campaignForm.title.trim() || null, link_url: campaignForm.link_url.trim() || null, notice_id: campaignForm.notice_id || null };
      if (imageUrl) updateData.image_url = imageUrl;
      const { error } = await supabase.from("campaigns").update(updateData).eq("id", editingCampaignId);
      if (error) { showToast("수정 실패: " + error.message); return; }
      showToast("캠페인이 수정됐어요");
    } else {
      const { error } = await supabase.from("campaigns").insert({ title: campaignForm.title.trim() || null, link_url: campaignForm.link_url.trim() || null, notice_id: campaignForm.notice_id || null, image_url: imageUrl, sort_order: campaigns.length });
      if (error) { showToast("등록 실패: " + error.message); return; }
      showToast("캠페인이 등록됐어요");
    }

    setCampaignForm({ title: "", link_url: "", notice_id: "" });
    setCampaignFile(null);
    setCampaignPreview(null);
    setEditingCampaignId(null);
    fetchCampaigns();
  }
  function startEditCampaign(c) {
    setEditingCampaignId(c.id);
    setCampaignForm({ title: c.title || "", link_url: c.link_url || "", notice_id: c.notice_id || "" });
    setCampaignPreview(c.image_url);
    setCampaignFile(null);
  }
  async function deleteCampaign(id) {
    await supabase.from("campaigns").delete().eq("id", id);
    fetchCampaigns();
  }
  async function sendPushNotification(title, body, userId, target, noticeId) {
    if (!title.trim() || !body.trim()) { showToast("제목과 내용을 입력해주세요"); return; }
    const { data, error } = await supabase.functions.invoke("swift-endpoint", {
      body: { title: title.trim(), body: body.trim(), userId: userId || null, target: target || "notice", noticeId: noticeId || null },
    });
    if (error) { showToast("발송 실패: " + error.message); return; }
    showToast(data?.message || "발송 완료!");
  }
     async function saveAdminNote(userId) {
    const note = adminNoteDrafts[userId];
    const { error } = await supabase.rpc("admin_set_note", { p_user_id: userId, p_note: note });
    if (error) { showToast("저장 실패: " + error.message); return; }
    fetchAllProfiles();
    showToast("별명이 저장됐어요");
  }
    function handleCouponImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setCouponImageFile(file);
      setCouponImagePreview(URL.createObjectURL(file));
    }
  }
  async function issueCoupon(userId) {
    const draft = couponDrafts[userId];
    if (!draft?.title?.trim()) { showToast("쿠폰 제목을 입력해주세요"); return; }

    let imageUrl = null;
    if (couponImageFile) {
      const fileExt = couponImageFile.name.split(".").pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("coupon-images").upload(filePath, couponImageFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("coupon-images").getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.rpc("admin_issue_coupon", {
      p_user_id: userId,
      p_title: draft.title.trim(),
      p_description: draft.description?.trim() || null,
      p_expires_at: draft.expiresAt ? new Date(draft.expiresAt).toISOString() : null,
    });
    if (error) { showToast("발급 실패: " + error.message); return; }

    if (imageUrl) {
      const { data: latestCoupon } = await supabase.from("coupons").select("id").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
      if (latestCoupon) await supabase.from("coupons").update({ image_url: imageUrl }).eq("id", latestCoupon.id);
    }

    setCouponDrafts({ ...couponDrafts, [userId]: { title: "", description: "", expiresAt: "" } });
    setCouponImageFile(null);
    setCouponImagePreview(null);
    showToast("쿠폰이 발급됐어요!");
  }
    async function deleteUser(userId, userEmail) {
    if (!window.confirm(`정말 "${userEmail}" 회원을 삭제하시겠어요? 이 작업은 되돌릴 수 없어요.`)) return;
    const { error } = await supabase.rpc("admin_delete_user", { p_user_id: userId });
    if (error) { showToast("삭제 실패: " + error.message); return; }
    fetchAllProfiles();
    showToast("회원이 삭제됐어요");
  }
    async function submitAdjustPoints(userId) {
    const draft = adjustDrafts[userId];
    if (!draft || !draft.amount || !draft.note?.trim()) { showToast("포인트와 사유를 모두 입력해주세요"); return; }
    const amount = parseInt(draft.amount, 10);
    if (isNaN(amount) || amount === 0) { showToast("올바른 숫자를 입력해주세요"); return; }
    const { error } = await supabase.rpc("admin_adjust_points", { p_user_id: userId, p_amount: amount, p_note: draft.note.trim() });
    if (error) { showToast("조정 실패: " + error.message); return; }
        setAdjustDrafts({ ...adjustDrafts, [userId]: { amount: "", note: "" } });
    fetchAllProfiles();
    fetchAdjustLog();
    showToast("포인트가 조정됐어요");
  }
  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast((cur) => (cur === message ? null : cur)), 2200);
  }

  function toggleFilter(key) {
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchesQuery = query.trim() === "" || p.name.includes(query) || p.address.includes(query) || (p.keywords && p.keywords.includes(query));
      const matchesFilter = activeFilters.length === 0 || activeFilters.every((f) => p[BADGE_META[f].field]);
      return matchesQuery && matchesFilter;
    });
  }, [places, query, activeFilters]);

  async function toggleFavorite(id) {
    if (favorites.has(id)) {
      await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("place_id", id);
    } else {
      await supabase.from("favorites").insert({ user_id: session.user.id, place_id: id });
    }
    fetchFavorites();
  }

  async function markHelpful(id) {
    const place = places.find((p) => p.id === id);
    const { error } = await supabase.rpc("mark_helpful", { p_place_id: id });
    if (error) { showToast("오류가 발생했어요: " + error.message); return; }
    showToast(`💚 "${place?.name}" 응원 완료`);
    fetchPlaces();
    fetchProfile();
    fetchHistory();
  }
  function openAddressSearch() {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 기능을 불러오는 중이에요. 잠시 후 다시 시도해주세요.");
      return;
    }
    setShowAddressSearch(true);
  }

  useEffect(() => {
    if (!showAddressSearch || !window.daum || !window.daum.Postcode) return;
    if (addressSearchRef.current) addressSearchRef.current.innerHTML = "";
    new window.daum.Postcode({
      oncomplete: function (data) {
        const addr = data.roadAddress || data.jibunAddress;
        setForm((prev) => ({ ...prev, address: addr }));
        setShowAddressSearch(false);
      },
      width: "100%",
      height: "100%",
    }).embed(addressSearchRef.current);
  }, [showAddressSearch]);
    function handlePhotoChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const combined = [...photoFiles, ...files].slice(0, 5);
    setPhotoFiles(combined);
    setPhotoPreviews(combined.map((f) => URL.createObjectURL(f)));
  }
  function removePhotoAt(index) {
    const newFiles = photoFiles.filter((_, i) => i !== index);
    setPhotoFiles(newFiles);
    setPhotoPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }
  function deletePlace(place) {
    setDeletingPlace(place);
  }
   async function confirmDeletePlace() {
    const { error } = await supabase.rpc("delete_own_place", { p_place_id: deletingPlace.id });
    if (error) { showToast("삭제 실패: " + error.message); return; }
    setDeletingPlace(null);
    fetchPlaces();
    fetchProfile();
    fetchHistory();
    showToast("장소가 삭제됐어요 (포인트 2P 회수)");
  }
  function startEdit(place) {
    setEditingPlaceId(place.id);
    setForm({
      name: place.name,
      address: place.address,
      addressDetail: "",
      category: place.category,
      keywords: place.keywords || "",
      badges: {
        ramp: place.has_ramp,
        door: place.has_restroom,
        stroller: place.has_stroller_access,
        lift: place.has_elevator,
      },
    });
    setTab("register");
  }
   async function submitEdit() {
    if (!form.name.trim()) return;
    const fullAddress = form.address.trim() || "주소 정보 없음";
    let error;
    if (isAdminEditingPlace) {
      ({ error } = await supabase.rpc("admin_update_place", {
        p_place_id: editingPlaceId,
        p_name: form.name.trim(),
        p_address: fullAddress,
        p_category: form.category,
        p_has_ramp: form.badges.ramp,
        p_has_restroom: form.badges.door,
        p_has_stroller_access: form.badges.stroller,
        p_has_elevator: form.badges.lift,
        p_keywords: form.keywords.trim() || null,
      }));
    } else {
      ({ error } = await supabase
        .from("places")
        .update({
          name: form.name.trim(),
          address: fullAddress,
          category: form.category,
          has_ramp: form.badges.ramp,
          has_restroom: form.badges.door,
          has_stroller_access: form.badges.stroller,
          has_elevator: form.badges.lift,
          keywords: form.keywords.trim() || null,
        })
        .eq("id", editingPlaceId));
    }
    if (error) { showToast("수정 실패: " + error.message); return; }
    for (const file of photoFiles) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${editingPlaceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("place-photos").upload(filePath, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("place-photos").getPublicUrl(filePath);
        await supabase.from("place_photos").insert({ place_id: editingPlaceId, photo_url: urlData.publicUrl, uploaded_by: session.user.id });
      }
    }
    showToast("수정 완료!");
    setEditingPlaceId(null);
    setForm({ name: "", address: "", addressDetail: "", category: "공공기관", keywords: "", badges: { ramp: false, door: false, stroller: false, lift: false } });
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setTab(isAdminEditingPlace ? "admin" : "home");
    setIsAdminEditingPlace(false);
    fetchPlaces();
  }

  async function submitRegister(e) {
    e.preventDefault();
    if (!form.name.trim() || isSubmittingPlace) return;
    setIsSubmittingPlace(true);
    if (editingPlaceId) { await submitEdit(); setIsSubmittingPlace(false); return; }
    const fullAddress = form.addressDetail.trim()
      ? `${form.address.trim() || "주소 정보 없음"} ${form.addressDetail.trim()}`
      : (form.address.trim() || "주소 정보 없음");
    const { data, error } = await supabase.rpc("register_place", {
      p_name: form.name.trim(),
      p_address: fullAddress,
      p_category: form.category,
      p_has_ramp: form.badges.ramp,
      p_has_restroom: form.badges.door,
      p_has_stroller_access: form.badges.stroller,
      p_has_elevator: form.badges.lift,
      p_keywords: form.keywords.trim() || null,
    });
       if (error) {
      setIsSubmittingPlace(false);
      if (error.message.includes("하루에 등록할 수 있는")) {
        setShowLimitReached(true);
      } else {
        showToast("등록 실패: " + error.message);
      }
      return;
    }
    for (const file of photoFiles) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${data.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("place-photos").upload(filePath, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("place-photos").getPublicUrl(filePath);
        await supabase.from("place_photos").insert({ place_id: data.id, photo_url: urlData.publicUrl, uploaded_by: session.user.id });
      }
    }
    setJustRegistered(data);
    setForm({ name: "", address: "", addressDetail: "", category: "공공기관", keywords: "", badges: { ramp: false, door: false, stroller: false, lift: false } });
    setPhotoFiles([]);
    setPhotoPreviews([]);
    fetchPlaces();
    fetchProfile();
    fetchHistory();
    setIsSubmittingPlace(false);
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: PAPER }}><LogoMark size={40} /></div>;
  }
  if (!session) {
    return <LoginScreen />;
  }

  const points = profile?.points ?? 0;
  const tier = currentTier(points);
  const next = nextTier(points);
  const registerCount = history.filter((h) => h.activity_type === "register_place").length;
  const helpfulCount = history.filter((h) => h.activity_type === "helpful_received").length;
  const isAdmin = session.user.email === ADMIN_EMAIL;
  const favoriteCount = favorites.size;

  const NAV = [
    { id: "home", label: "홈", icon: Search },
    { id: "map", label: "지도·검색", icon: MapPin },
    { id: "register", label: "등록", icon: Plus },
    { id: "notice", label: "공지사항", icon: Megaphone },
    { id: "my", label: "마이페이지", icon: User },
    ...(isAdmin ? [{ id: "admin", label: "관리자", icon: ShieldCheck }] : []),
  ];

  return (
    <div style={{ fontFamily: BODY_FONT, background: PAPER, minHeight: "100vh" }}>
          {/* ===== NAVBAR ===== */}
<div ref={navbarRef} className="z-10 flex" style={{ background: CARD, borderBottom: `1px solid ${LINE}`, position: "absolute", top: navbarOffset, left: 0, right: 0 }}>
        <div className="flex items-center pl-5 sm:pl-8 flex-shrink-0">
          <LogoMark size={40} />
          <span style={{ fontFamily: DISPLAY_FONT, fontSize: 24, color: INK, lineHeight: 1 }} className="ml-2.5">장편</span>
        </div>
        <div className="flex-1">
        <div className="flex items-center justify-end px-5 sm:px-8 py-3.5 relative">
          <button onClick={() => setShowFavoritesOnly(true)} className="flex sm:hidden rounded-full p-2 flex-shrink-0 mr-2 transition-all duration-200 active:scale-90" style={{ background: PAPER }} aria-label="즐겨찾기 목록">
            <Star size={16} color={INK_SOFT} />
          </button>
          <div className="flex sm:hidden items-center gap-0.5 rounded-full pl-2.5 pr-1 py-1" style={{ background: PAPER }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: INK_SOFT }} className="mr-0.5">글자크기</span>
            <button onClick={() => stepFontScale("down")} disabled={fontScale === "small"} className="rounded-full p-1.5 transition-all duration-150 active:scale-90" style={{ opacity: fontScale === "small" ? 0.35 : 1 }} aria-label="글자 작게">
              <ZoomOut size={15} color={INK_SOFT} />
            </button>
            <button onClick={() => stepFontScale("up")} disabled={fontScale === "xlarge"} className="rounded-full p-1.5 transition-all duration-150 active:scale-90" style={{ opacity: fontScale === "xlarge" ? 0.35 : 1 }} aria-label="글자 크게">
              <ZoomIn size={15} color={INK_SOFT} />
            </button>
          </div>
               <div className="hidden sm:flex items-center gap-1 rounded-full p-1 sm:absolute sm:left-1/2 sm:-translate-x-1/2" style={{ background: PAPER }}>
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = tab === n.id;
              return (
                <button key={n.id} onClick={() => setTab(n.id)} className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-200 active:scale-95 hover:opacity-90"
                  style={{ background: active ? TEAL : "transparent", color: active ? "#fff" : INK_SOFT }}>
                  <Icon size={15} />{n.label}
                </button>
              );
            })}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full pl-3 pr-1 py-1" style={{ background: PAPER }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: INK_SOFT }} className="mr-1">글자크기</span>
              <button onClick={() => stepFontScale("down")} disabled={fontScale === "small"} className="rounded-full p-1.5 transition-all duration-150 active:scale-90" style={{ opacity: fontScale === "small" ? 0.35 : 1 }} aria-label="글자 작게">
                <ZoomOut size={15} color={INK_SOFT} />
              </button>
              <button onClick={() => stepFontScale("up")} disabled={fontScale === "xlarge"} className="rounded-full p-1.5 transition-all duration-150 active:scale-90" style={{ opacity: fontScale === "xlarge" ? 0.35 : 1 }} aria-label="글자 크게">
                <ZoomIn size={15} color={INK_SOFT} />
              </button>
            </div>
            <button onClick={() => { setTab("my"); setTimeout(() => { document.getElementById("point-history-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className="flex items-center gap-1 rounded-full pl-2 pr-3 py-1.5 flex-shrink-0 transition-all duration-200 active:scale-90" style={{ background: CORAL_TINT }}>
              <span style={{ fontSize: 14 }}>🪙</span>
              <span style={{ fontFamily: MONO_FONT, color: CORAL, fontWeight: 700, fontSize: 12 }} className="whitespace-nowrap">{points.toLocaleString()}P</span>
            </button>
            <button onClick={() => { setTab("my"); setTimeout(() => { document.getElementById("coupon-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className={`relative flex items-center gap-1 rounded-full pl-2 pr-2.5 py-1.5 flex-shrink-0 transition-all duration-200 active:scale-90 ${myCoupons.some(c => c.status === "unused") ? "coupon-badge-glow" : ""}`} style={{ background: myCoupons.some(c => c.status === "unused") ? YELLOW : PAPER }} aria-label="쿠폰함">
            <Gift size={16} color={myCoupons.some(c => c.status === "unused") ? "#fff" : INK_SOFT} />
            <span style={{ fontSize: 11, fontWeight: 700, color: myCoupons.some(c => c.status === "unused") ? "#fff" : INK_SOFT }}>쿠폰</span>
          </button>
            <button onClick={() => setShowFavoritesOnly(true)} className="rounded-full p-2 flex-shrink-0 transition-all duration-200 active:scale-90" style={{ background: PAPER }} aria-label="즐겨찾기 목록">
              <Star size={16} color={INK_SOFT} />
            </button>
                                    <button onClick={async () => {
              await supabase.auth.signOut({ scope: "local" });
              Object.keys(localStorage).forEach((key) => {
                if (key.startsWith("sb-") || key.includes("supabase")) localStorage.removeItem(key);
              });
              window.location.href = "/";
            }} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95" style={{ border: `1.4px solid ${LINE}`, color: INK_SOFT }}>
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </div>
             <div className="flex sm:hidden items-center justify-end gap-2 px-5 pb-3">
                           <button onClick={() => { setTab("my"); setTimeout(() => { document.getElementById("coupon-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className={`relative flex items-center gap-1 rounded-full pl-2 pr-2.5 py-1.5 flex-shrink-0 transition-all duration-200 active:scale-90 ${myCoupons.some(c => c.status === "unused") ? "coupon-badge-glow" : ""}`} style={{ background: myCoupons.some(c => c.status === "unused") ? YELLOW : PAPER }} aria-label="쿠폰함">
            <Gift size={16} color={myCoupons.some(c => c.status === "unused") ? "#fff" : INK_SOFT} />
            <span style={{ fontSize: 11, fontWeight: 700, color: myCoupons.some(c => c.status === "unused") ? "#fff" : INK_SOFT }}>쿠폰</span>
          </button>
                   <button onClick={() => { setTab("my"); setTimeout(() => { document.getElementById("point-history-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className="flex items-center gap-1 rounded-full pl-2 pr-3 py-1.5 flex-shrink-0 transition-all duration-200 active:scale-90" style={{ background: CORAL_TINT }}>
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{ fontFamily: MONO_FONT, color: CORAL, fontWeight: 700, fontSize: 12 }} className="whitespace-nowrap">{points.toLocaleString()}P</span>
          </button>
                                  <button onClick={async () => {
              await supabase.auth.signOut({ scope: "local" });
              Object.keys(localStorage).forEach((key) => {
                if (key.startsWith("sb-") || key.includes("supabase")) localStorage.removeItem(key);
              });
              window.location.href = "/";
            }} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95" style={{ border: `1.4px solid ${LINE}`, color: INK_SOFT }}>
              <LogOut size={14} />
              로그아웃
            </button>
        </div>
        </div>
      </div>
           {/* ===== MOBILE TABS ===== */}
      <div ref={tabsRef} className="flex sm:hidden justify-between px-2 py-2" style={{ background: "#fff", borderBottom: `1px solid ${LINE}`, position: "absolute", top: navbarOffset + navbarHeight, left: 0, right: 0, zIndex: 9 }}>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-all duration-200 active:scale-95"
              style={{ color: active ? TEAL : INK_SOFT }}>
              <Icon size={17} />
              <span style={{ fontSize: 10, fontWeight: 700 }}>{n.label}</span>
            </button>
          );
        })}
      </div>
      {/* ===== ADDRESS SEARCH POPUP ===== */}
      {showAddressSearch && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-t-2xl overflow-hidden" style={{ width: "100vw", height: "85vh", maxWidth: "100vw" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
              <span className="font-extrabold text-sm" style={{ color: INK }}>주소 검색</span>
              <button onClick={() => setShowAddressSearch(false)} className="rounded-full p-1.5 hover:bg-black/5" aria-label="닫기">
                <X size={20} color={INK_SOFT} />
              </button>
            </div>
            <div ref={addressSearchRef} style={{ width: "100vw", height: "calc(85vh - 49px)" }} />
          </div>
        </div>
      )}
      {/* ===== REPORT POPUP ===== */}
      {reportingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: CARD }}>
            <div className="flex items-center gap-2 mb-1">
              <Flag size={18} color={CORAL} />
              <div className="font-extrabold text-base" style={{ color: INK }}>정보 신고하기</div>
            </div>
            <div className="text-xs mb-4" style={{ color: INK_SOFT }}>"{reportingPlace.name}"의 어떤 정보가 달라졌나요?</div>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="예: 지금은 휠체어 출입이 안돼요"
              rows={3}
              autoFocus
              className="w-full rounded-xl px-4 py-3 mb-4 text-sm outline-none resize-none"
              style={{ border: `1.4px solid ${LINE}`, color: INK }}
            />
            <div className="flex gap-2">
              <button onClick={() => setReportingPlace(null)} className="flex-1 rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: PAPER, color: INK }}>
                취소
              </button>
              <button onClick={submitReport} className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: CORAL }}>
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== FAVORITES POPUP ===== */}
      {showFavoritesOnly && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: PAPER }}>
          <div className="sticky top-0 flex items-center justify-between px-5 py-4" style={{ background: CARD, borderBottom: `1px solid ${LINE}` }}>
            <div className="flex items-center gap-2">
              <Star size={18} color={"#E8A800"} fill={"#E8A800"} />
              <span className="font-extrabold text-base" style={{ color: INK }}>즐겨찾기</span>
            </div>
            <button onClick={() => setShowFavoritesOnly(false)} className="rounded-full p-1.5 hover:bg-black/5" aria-label="닫기">
              <X size={20} color={INK_SOFT} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {places.filter((p) => favorites.has(p.id)).length === 0 ? (
              <div className="text-center py-16 text-sm" style={{ color: INK_SOFT }}>
                아직 즐겨찾기한 장소가 없어요.<br />장소 카드의 별 아이콘을 눌러 저장해보세요!
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {places.filter((p) => favorites.has(p.id)).map((p) => (
                  <div key={p.id} onClick={() => { setShowFavoritesOnly(false); setPendingFocusId(p.id); setTab("map"); }} className="cursor-pointer">
                <PlaceCard place={p} onHelpful={markHelpful} isFavorite={favorites.has(p.id)} onToggleFavorite={toggleFavorite} onEdit={startEdit} isOwner={p.created_by === session.user.id} onImageClick={(urls, idx) => { setPreviewImages(urls); setPreviewIndex(idx); }} onShare={shareToKakao} onDirections={openDirections} onReport={reportPlace} onDelete={deletePlace} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ===== COUPON DETAIL POPUP ===== */}
      {viewingCoupon && (
        <div onClick={() => setViewingCoupon(null)} className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: CARD }}>
            <div className="flex items-center justify-center" style={{ background: PAPER, height: 180 }}>
              {viewingCoupon.image_url ? (
                <img src={viewingCoupon.image_url} alt={viewingCoupon.title} className="w-full h-full object-cover" />
              ) : (
                <Gift size={48} color={TEAL} />
              )}
            </div>
            <div className="p-6">
              <div className="inline-block text-[11px] font-bold rounded-full px-2.5 py-1 mb-2" style={{ background: viewingCoupon.status === "used" ? PAPER : TEAL_TINT, color: viewingCoupon.status === "used" ? INK_SOFT : TEAL_DARK }}>
                {viewingCoupon.status === "used" ? "사용완료" : "사용가능"}
              </div>
              <div className="font-extrabold text-lg mb-2" style={{ color: INK }}>{viewingCoupon.title}</div>
              {viewingCoupon.description && (
                <div className="text-sm mb-3 whitespace-pre-wrap" style={{ color: INK_SOFT }}>{viewingCoupon.description}</div>
              )}
              {viewingCoupon.expires_at && (
                <div className="text-xs mb-4" style={{ color: INK_SOFT }}>유효기간: {new Date(viewingCoupon.expires_at).toLocaleDateString("ko-KR")}까지</div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setViewingCoupon(null)} className="flex-1 rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: PAPER, color: INK }}>
                  닫기
                </button>
                {viewingCoupon.status === "unused" && (
                                  <button onClick={() => openUseCouponConfirm(viewingCoupon.id)} className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: TEAL }}>
                    사용하기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ===== USE COUPON CONFIRM POPUP ===== */}
      {confirmingUseCoupon && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: CARD }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: TEAL_TINT }}>
              <Gift size={22} color={TEAL} />
            </div>
            <div className="font-extrabold text-base mb-1" style={{ color: INK }}>쿠폰을 사용 처리하시겠어요?</div>
            <div className="text-sm mb-6" style={{ color: INK_SOFT }}>사용 처리하면 되돌릴 수 없어요.</div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmingUseCoupon(null)} className="flex-1 rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: PAPER, color: INK }}>
                취소
              </button>
              <button onClick={confirmUseCoupon} className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: TEAL }}>
                사용하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== DAILY LIMIT REACHED POPUP ===== */}
      {showLimitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: CARD }}>
            <div className="text-5xl mb-3">🌙</div>
            <div className="font-extrabold text-base mb-1" style={{ color: INK }}>오늘 등록 횟수를 다 쓰셨어요</div>
            <div className="text-sm mb-6" style={{ color: INK_SOFT }}>하루에 최대 5곳까지 등록할 수 있어요.<br />내일 다시 새로운 장소를 등록해보세요!</div>
            <button onClick={() => setShowLimitReached(false)} className="w-full rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: TEAL }}>
              확인했어요
            </button>
          </div>
        </div>
      )}
      {/* ===== DELETE PLACE CONFIRM POPUP ===== */}
      {deletingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: CARD }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: CORAL_TINT }}>
              <Trash2 size={22} color={CORAL} />
            </div>
            <div className="font-extrabold text-base mb-1" style={{ color: INK }}>장소를 삭제하시겠어요?</div>
            <div className="text-sm mb-6" style={{ color: INK_SOFT }}>"{deletingPlace.name}"이(가) 삭제돼요.<br />이 작업은 되돌릴 수 없어요.</div>
            <div className="flex gap-2">
              <button onClick={() => setDeletingPlace(null)} className="flex-1 rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: PAPER, color: INK }}>
                취소
              </button>
              <button onClick={confirmDeletePlace} className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: CORAL }}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== EXIT CONFIRM POPUP ===== */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-xs rounded-2xl p-6 text-center" style={{ background: CARD }}>
            <div className="font-extrabold text-base mb-2" style={{ color: INK }}>장편 앱을 종료하시겠습니까?</div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: PAPER, color: INK }}>
                취소
              </button>
              <button
                onClick={async () => {
                  const { App } = await import("@capacitor/app");
                  App.exitApp();
                }}
                className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: CORAL }}>
                종료
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== PULL TO REFRESH ===== */}
      {isPulling && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-100" style={{ height: pullDistance, background: PAPER, overflow: "hidden" }}>
          <div className="rounded-full p-2" style={{ background: "#fff", border: `1px solid ${LINE}`, transform: `rotate(${pullDistance * 4}deg)`, transition: "transform 0.1s" }}>
            <LogoMark size={20} />
          </div>
        </div>
      )}
        {/* ===== IMAGE PREVIEW ===== */}
      {previewImages.length > 0 && (
        <div
          onClick={() => { if (!didSwipe.current) setPreviewImages([]); }}
          onTouchStart={handleSwipeStart}
          onTouchEnd={handleSwipeEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", cursor: "grab" }}
        >
          <img src={previewImages[previewIndex]} alt="확대 이미지" className="max-w-full max-h-full rounded-2xl" />
               {previewImages.length > 1 && (
            <>
              {previewIndex > 0 && (
                <button onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex - 1); }} className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 items-center justify-center transition-all duration-200 hover:opacity-100" style={{ background: "rgba(255,255,255,0.15)", opacity: 0.8 }} aria-label="이전 사진">
                  <ChevronRight size={24} color="#fff" style={{ transform: "rotate(180deg)" }} />
                </button>
              )}
              {previewIndex < previewImages.length - 1 && (
                <button onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex + 1); }} className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 items-center justify-center transition-all duration-200 hover:opacity-100" style={{ background: "rgba(255,255,255,0.15)", opacity: 0.8 }} aria-label="다음 사진">
                  <ChevronRight size={24} color="#fff" />
                </button>
              )}
              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-1.5">
                {previewImages.map((_, i) => (
                  <div key={i} className="rounded-full transition-all duration-200" style={{ width: i === previewIndex ? 16 : 6, height: 6, background: i === previewIndex ? "#fff" : "rgba(255,255,255,0.4)" }} />
                ))}
              </div>
            </>
          )}
          <button onClick={() => setPreviewImages([])} className="absolute top-5 right-5 rounded-full p-3" style={{ background: "rgba(255,255,255,0.15)" }} aria-label="닫기">
            <X size={22} color="#fff" />
          </button>
        </div>
      )}
      {/* ===== TOAST ===== */}
      <div className="fixed left-1/2 z-50 pointer-events-none transition-all duration-300"
        style={{ bottom: toast ? 24 : 0, opacity: toast ? 1 : 0, transform: `translateX(-50%) translateY(${toast ? 0 : 10}px)` }}>
        {toast && <div className="rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg" style={{ background: INK }}>{toast}</div>}
      </div>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8" key={tab} style={{ animation: "fadeIn 0.25s ease", paddingTop: (navbarHeight + tabsHeight + 32) }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }`}</style>

        {/* ===================== 홈 ===================== */}
        {tab === "home" && (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 rounded-full px-4 py-3 mb-3" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                <Search size={16} color={INK_SOFT} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="장소, 주소로 검색" className="flex-1 outline-none text-sm bg-transparent" style={{ color: INK }} />
              </div>
                         <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {Object.entries(BADGE_META).map(([key, meta]) => {
                  const Icon = meta.icon;
                  const active = activeFilters.includes(key);
                  return (
                    <button key={key} onClick={() => toggleFilter(key)} className="flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border transition-all duration-200 active:scale-95 hover:shadow-sm"
                      style={{ borderColor: TEAL, background: active ? TEAL : "#fff", color: active ? "#fff" : TEAL }}>
                      <Icon size={13} />{meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
                       {notices.length > 0 && (
               <button
                onClick={() => {
                  setSelectedNoticeId(notices[0].id);
                  setExpandedNoticeId(notices[0].id);
                  setTab("notice");
                  setTimeout(() => {
                    document.getElementById(`notice-${notices[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
                className="w-full text-left rounded-2xl p-4 mb-4 flex items-start gap-3 transition-all duration-200 active:scale-[0.98]"
                style={{ background: TEAL_TINT }}
              >
                <Megaphone size={18} color={TEAL_DARK} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-sm mb-0.5" style={{ color: TEAL_DARK }}>{notices[0].title}</div>
                              <div className="text-xs" style={{ color: INK_SOFT }}>
                    {renderRichText(notices[0].content.length > 20 ? notices[0].content.slice(0, 20) + "..." : notices[0].content)}
                  </div>
                </div>
              </button>
            )}
                 {campaigns.length > 0 ? (
                                         <div
                onClick={() => {
                  const c = campaigns[campaignIndex];
                  if (c.notice_id) {
                    setSelectedNoticeId(c.notice_id);
                    setExpandedNoticeId(c.notice_id);
                    setTab("notice");
                    setTimeout(() => {
                      document.getElementById(`notice-${c.notice_id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 100);
                  } else if (c.link_url) {
                    window.open(c.link_url, "_blank");
                  }
                }}
                className="relative rounded-2xl overflow-hidden mb-6"
                style={{ aspectRatio: "3 / 1", background: PAPER, cursor: (campaigns[campaignIndex].notice_id || campaigns[campaignIndex].link_url) ? "pointer" : "default" }}
              >
                <img src={campaigns[campaignIndex].image_url} alt={campaigns[campaignIndex].title || "캠페인"} className="w-full h-full object-cover" />
                {campaigns[campaignIndex].title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}>
                    <div className="text-white font-extrabold text-sm">{campaigns[campaignIndex].title}</div>
                  </div>
                )}
                {campaigns.length > 1 && (
                  <div className="absolute bottom-2 right-3 flex gap-1.5">
                    {campaigns.map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === campaignIndex ? "#fff" : "rgba(255,255,255,0.4)" }} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl p-5 mb-6 text-white" style={{ background: `linear-gradient(120deg, ${CORAL}, #F58152)` }}>
                <div className="text-xs font-bold opacity-85 mb-1">이번 달 캠페인</div>
                <div className="font-extrabold text-lg leading-snug">신규 장소 등록하고 2P 받아가세요</div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm" style={{ color: INK }}>등록된 장소 {filteredPlaces.length}곳</span>
              {activeFilters.length > 0 && (
                <button onClick={() => setActiveFilters([])} className="text-xs font-bold flex items-center gap-1" style={{ color: INK_SOFT }}><X size={12} /> 필터 초기화</button>
              )}
            </div>

               <div className="grid sm:grid-cols-2 gap-3">
              {filteredPlaces.map((p) => (
                <div key={p.id} onClick={() => { setPendingFocusId(p.id); setTab("map"); }} className="cursor-pointer">
                            <PlaceCard place={p} onHelpful={markHelpful} isFavorite={favorites.has(p.id)} onToggleFavorite={toggleFavorite} onEdit={startEdit} isOwner={p.created_by === session.user.id} onImageClick={(urls, idx) => { setPreviewImages(urls); setPreviewIndex(idx); }} onShare={shareToKakao} onDirections={openDirections}  onReport={reportPlace} onDelete={deletePlace} />
                </div>
              ))}
              {filteredPlaces.length === 0 && (
                <div className="col-span-2 text-center py-14 text-sm" style={{ color: INK_SOFT }}>
                  아직 등록된 장소가 없어요. 직접 첫 장소를 등록해보시겠어요?
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== 지도·검색 ===================== */}
        {tab === "map" && (
          <div>
            <div className="relative mb-6">
              <div ref={mapContainerRef} className="w-full h-72 rounded-2xl overflow-hidden" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
              <button onClick={locateMe} className="absolute bottom-3 right-3 rounded-full p-2.5 shadow-md transition-all duration-200 active:scale-90" style={{ background: "#fff", border: `1px solid ${LINE}` }} aria-label="내 위치 찾기">
                <LocateFixed size={18} color={TEAL} />
              </button>
            </div>
            <select value={mapCategory || ""} onChange={(e) => setMapCategory(e.target.value || null)} className="w-full rounded-xl px-4 py-3 mb-5 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }}>
              <option value="">전체 카테고리</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
                    <div className="grid sm:grid-cols-2 gap-3">
              {(mapCategory ? places.filter((p) => p.category === mapCategory) : places).map((p) => (
                <div key={p.id} onClick={() => focusOnPlace(p.id)} className="cursor-pointer">
                                                         <PlaceCard place={p} onHelpful={markHelpful} isFavorite={favorites.has(p.id)} onToggleFavorite={toggleFavorite} onEdit={startEdit} isOwner={p.created_by === session.user.id} onImageClick={(urls, idx) => { setPreviewImages(urls); setPreviewIndex(idx); }} onShare={shareToKakao} onDirections={openDirections}  onReport={reportPlace} onDelete={deletePlace} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== 등록 ===================== */}
        {tab === "register" && (
          <div className="max-w-lg mx-auto">
            {justRegistered ? (
              <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: TEAL_TINT }}>
                  <Check size={28} color={TEAL} />
                </div>
                <div className="font-extrabold text-lg mb-1" style={{ color: INK }}>등록 완료! +2P 적립되었습니다</div>
                <div className="text-sm mb-6" style={{ color: INK_SOFT }}>"{justRegistered.name}"이(가) 목록에 추가됐어요</div>
                <button onClick={() => { setJustRegistered(null); setTab("home"); }} className="rounded-full px-6 py-3 font-bold text-white transition-all duration-200 active:scale-95 hover:opacity-90" style={{ background: CORAL }}>
                  홈에서 확인하기
                </button>
              </div>
            ) : (
<form onSubmit={submitRegister}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-2xl p-3 flex items-center justify-center" style={{ background: TEAL_TINT }}>
                    <Plus size={22} color={TEAL} />
                  </div>
                  <div>
                                   <h2 className="font-extrabold text-xl" style={{ color: INK, fontFamily: DISPLAY_FONT }}>{editingPlaceId ? "장소 수정" : "장소 등록"}</h2>
                    <div className="text-xs" style={{ color: INK_SOFT }}>{isAdminEditingPlace ? "🛠️ 관리자 권한으로 신고된 정보를 수정하고 있어요" : editingPlaceId ? "정보를 최신으로 업데이트해주세요" : "접근성 정보를 등록하고 포인트를 받으세요"}</div>
                  </div>
                </div>

                <div className="rounded-2xl p-4 mb-4" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                  <div className="text-xs font-bold mb-3" style={{ color: TEAL }}>📍 기본 정보</div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>장소명</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예) 행복나눔 도서관"
                    className="w-full rounded-xl px-4 py-3 mb-4 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />

                                                                                                              <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>주소</label>
                  <input value={form.address} readOnly placeholder="주소 검색 버튼을 눌러주세요"
                    className="w-full rounded-xl px-4 py-3 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, background: PAPER }} />
                  <input value={form.addressDetail} onChange={(e) => setForm({ ...form, addressDetail: e.target.value })} placeholder="상세주소 (동/호수, 층수 등, 선택)"
                    className="w-full rounded-xl px-4 py-3 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                  <button type="button" onClick={openAddressSearch} className="w-full rounded-xl px-4 py-3 mb-2 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: TEAL, color: "#fff" }}>
                    주소 검색
                  </button>
                  <button type="button" onClick={locateMeForRegister} disabled={locatingAddress} className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold w-full transition-all duration-200 active:scale-95" style={{ border: `1.4px solid ${LINE}`, color: TEAL, background: TEAL_TINT }}>
                    <Locate size={14} />
                    {locatingAddress ? "위치 확인 중..." : "현재 위치로 주소 찾기"}
                  </button>
                </div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>검색 키워드 (선택)</label>
                <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="예: 족발, 갈비, 한식 (쉼표로 구분)"
                  className="w-full rounded-xl px-4 py-3 mb-4 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>카테고리</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl px-4 py-3 mb-5 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <label className="block text-xs font-bold mb-2" style={{ color: INK_SOFT }}>접근성 체크리스트</label>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {Object.entries(BADGE_META).map(([key, meta]) => {
                    const Icon = meta.icon;
                    const checked = form.badges[key];
                    return (
                      <button type="button" key={key} onClick={() => setForm({ ...form, badges: { ...form.badges, [key]: !checked } })}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold border transition-all duration-200 active:scale-95"
                        style={{ borderColor: checked ? TEAL : LINE, background: checked ? TEAL_TINT : "#fff", color: checked ? TEAL_DARK : INK_SOFT }}>
                        <Icon size={14} />{meta.label}
                      </button>
                    );
                  })}
                </div>
                <label className="block text-xs font-bold mb-2" style={{ color: INK_SOFT }}>사진 (선택)</label>
                                       {photoPreviews.length > 0 && (
                  <div className="flex gap-2 mb-2 overflow-x-auto">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative flex-shrink-0">
                        <img src={src} alt={`미리보기 ${i + 1}`} className="w-20 h-20 object-cover rounded-xl" />
                        <button type="button" onClick={() => removePhotoAt(i)} className="absolute -top-1.5 -right-1.5 rounded-full p-1" style={{ background: CORAL }}>
                          <X size={12} color="#fff" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs mb-2" style={{ color: INK_SOFT }}>사진 {photoPreviews.length}/5장</div>
                <div className="flex gap-2 mb-6">
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" id="photo-camera" />
                  <label htmlFor="photo-camera" className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-3 cursor-pointer text-xs font-bold transition-all duration-200 active:scale-95" style={{ border: `1.4px solid ${LINE}`, color: INK_SOFT }}>
                    <Camera size={16} />
                    카메라로 촬영
                  </label>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" id="photo-gallery" />
                  <label htmlFor="photo-gallery" className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-3 cursor-pointer text-xs font-bold transition-all duration-200 active:scale-95" style={{ border: `1.4px solid ${LINE}`, color: INK_SOFT }}>
                    <Camera size={16} />
                    갤러리에서 선택
                  </label>
                </div>
                <button type="submit" disabled={!form.name.trim()}
                  className="w-full rounded-full py-3.5 font-extrabold text-white flex items-center justify-center gap-1 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                                style={{ background: (form.name.trim() && !isSubmittingPlace) ? CORAL : LINE, cursor: (form.name.trim() && !isSubmittingPlace) ? "pointer" : "not-allowed" }}
                  disabled={!form.name.trim() || isSubmittingPlace}>
                  {isSubmittingPlace ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span> 등록 중...
                    </>
                  ) : (
                    <>{editingPlaceId ? "수정 완료" : "등록하고 2P 받기"} <ChevronRight size={16} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
        {/* ===================== 공지사항 ===================== */}
        {tab === "notice" && (
          <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl p-3 flex items-center justify-center" style={{ background: TEAL_TINT }}>
                <Megaphone size={22} color={TEAL} />
              </div>
              <div>
                <h2 className="font-extrabold text-xl" style={{ color: INK }}>공지사항</h2>
                <div className="text-xs" style={{ color: INK_SOFT }}>서비스 소식과 이벤트를 확인하세요</div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {notices.length === 0 && (
                <div className="text-center py-14 text-sm" style={{ color: INK_SOFT }}>등록된 공지사항이 없어요</div>
              )}
                                                     {notices.map((n) => {
                const isExpanded = expandedNoticeId === n.id;
                return (
                               <div key={n.id} id={`notice-${n.id}`} className="px-5 py-4" style={{ borderBottom: `1px solid ${LINE}`, background: n.id === selectedNoticeId ? TEAL_TINT : (isExpanded ? "#F5F5F3" : "transparent") }}>
                  <button onClick={() => setExpandedNoticeId(isExpanded ? null : n.id)} className="w-full flex items-center justify-between text-left">
                    <div className="font-extrabold text-sm mb-1" style={{ color: INK }}>{n.title}</div>
                    <ChevronRight size={16} color={INK_SOFT} style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                  <div className="text-xs mb-2" style={{ color: INK_SOFT }}>{new Date(n.created_at).toLocaleDateString("ko-KR")}</div>
                  {isExpanded && (
                    <>
                      {n.image_url && (
                        <img src={n.image_url} alt={n.title} className="w-full rounded-xl mb-3" />
                      )}
                      <div className="text-sm mb-2 whitespace-pre-wrap" style={{ color: INK }}>
                        {renderRichText(n.content)}
                      </div>
                      {n.file_url && (
                        <a href={n.file_url} target="_blank" rel="noopener noreferrer" download className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 mb-2 text-xs font-bold" style={{ background: PAPER, color: INK }}>
                          <Paperclip size={13} /> {n.file_name || "첨부파일"}
                        </a>
                      )}
                      {n.link_url && (
                        <div>
                          <a href={n.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: TEAL }}>
                            자세히 보기 <ChevronRight size={13} />
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
                      );
              })}
            </div>
          </div>
        )}
        {/* ===================== 마이페이지 ===================== */}
        {tab === "my" && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl p-6 mb-5 text-white" style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` }}>
                        <div className="flex flex-col items-center text-center mb-5">
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
                              <label htmlFor="avatar-upload" className="w-24 h-24 rounded-3xl flex items-center justify-center font-extrabold cursor-pointer overflow-hidden relative flex-shrink-0 mb-3" style={{ background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.3)" }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="프로필 사진" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)", opacity: 0 }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <Camera size={20} color="#fff" />
                  </div>
                </label>
                {editingNickname ? (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <input
                      value={nicknameDraft}
                      onChange={(e) => setNicknameDraft(e.target.value)}
                      autoFocus
                      maxLength={12}
                      className="rounded-lg px-2.5 py-1 text-sm font-extrabold text-center outline-none"
                      style={{ background: "rgba(255,255,255,0.2)", color: "#fff", width: 140 }}
                    />
                    <button onClick={saveNickname} className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.25)" }} aria-label="닉네임 저장">
                      <Check size={14} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setNicknameDraft(profile?.nickname || ""); setEditingNickname(true); }}
                    className="flex items-center gap-1.5 mb-1.5"
                  >
                    <span className="font-extrabold text-base">{profile?.nickname || "닉네임 설정하기"}</span>
                    <Pencil size={13} color="rgba(255,255,255,0.7)" />
                  </button>
                )}
                <div className="text-xs opacity-70 mb-2">{session.user.email}</div>
                <div className="inline-block text-[11px] rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,0.18)" }}>{tier.label}</div>
              </div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 34, fontWeight: 700 }}>{points.toLocaleString()}P</div>
              <div className="text-xs opacity-80 mb-4">{next ? `다음 등급(${next.label})까지 ${next.min - points}P 남았어요` : "최고 등급 달성!"}</div>
              <TierBar points={points} />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl p-3 text-center transition-all duration-200 hover:shadow-sm" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                <div className="font-extrabold text-lg" style={{ color: INK }}>{registerCount}</div>
                <div className="text-[11px]" style={{ color: INK_SOFT }}>등록</div>
              </div>
              <div className="rounded-xl p-3 text-center transition-all duration-200 hover:shadow-sm" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                <div className="font-extrabold text-lg" style={{ color: INK }}>{favoriteCount}</div>
                <div className="text-[11px]" style={{ color: INK_SOFT }}>즐겨찾기</div>
              </div>
              <div className="rounded-xl p-3 text-center transition-all duration-200 hover:shadow-sm" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                <div className="font-extrabold text-lg" style={{ color: INK }}>{helpfulCount}</div>
                <div className="text-[11px]" style={{ color: INK_SOFT }}>도움이 됐어요</div>
              </div>
            </div>

           <div id="point-history-section" className="font-extrabold text-sm mb-3" style={{ color: INK }}>포인트 내역</div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {history.length === 0 && (
                <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>아직 내역이 없어요</div>
              )}
              {history.map((h, i) => (
                <div key={h.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i !== history.length - 1 ? `1px solid ${LINE}` : "none" }}>
                  <div>
                    <div className="text-sm font-bold" style={{ color: INK }}>{h.note}</div>
                    <div className="text-[11px]" style={{ color: INK_SOFT }}>{new Date(h.created_at).toLocaleDateString("ko-KR")}</div>
                  </div>
                  <div style={{ fontFamily: MONO_FONT, color: CORAL, fontWeight: 700, fontSize: 13 }}>+{h.points}P</div>
                </div>
              ))}
            </div>
                                                <div className="flex items-center justify-between rounded-2xl px-4 py-3.5 mt-8 mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              <span className="text-sm font-bold" style={{ color: INK }}>다크 모드</span>
              <button onClick={() => setIsDark(!isDark)} className="relative rounded-full transition-all duration-200" style={{ width: 46, height: 26, background: isDark ? TEAL : LINE }}>
                <div className="absolute rounded-full transition-all duration-200" style={{ width: 20, height: 20, top: 3, left: isDark ? 23 : 3, background: "#fff" }} />
              </button>
            </div>
                        <div id="coupon-section" className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm" style={{ color: INK }}>내 쿠폰함 ({myCoupons.filter(c => c.status === "unused").length}개 사용가능)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {myCoupons.length === 0 && (
                <div className="col-span-2 text-center py-8 text-sm rounded-2xl" style={{ color: INK_SOFT, border: `1px dashed ${LINE}` }}>아직 받은 쿠폰이 없어요</div>
              )}
              {myCoupons.map((c) => (
                <button key={c.id} onClick={() => setViewingCoupon(c)} className="rounded-2xl p-3 text-left transition-all duration-200 active:scale-95" style={{ background: c.status === "used" ? PAPER : TEAL_TINT, border: `1px solid ${c.status === "used" ? LINE : TEAL}`, opacity: c.status === "used" ? 0.55 : 1 }}>
                  <div className="flex items-center justify-center rounded-xl mb-2 overflow-hidden" style={{ background: "#fff", height: 60 }}>
                    {c.image_url ? <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" /> : <Gift size={24} color={TEAL} />}
                  </div>
                  <div className="text-xs font-bold truncate" style={{ color: INK }}>{c.title}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: c.status === "used" ? INK_SOFT : TEAL_DARK }}>{c.status === "used" ? "사용완료" : "사용가능"}</div>
                </button>
              ))}
            </div>
            <div className="rounded-2xl px-4 py-3.5 mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              <div className="flex items-center gap-2 mb-3">
                <Type size={15} color={INK} />
                <span className="text-sm font-bold" style={{ color: INK }}>글자 크기</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.keys(FONT_SCALES).map((key) => (
                  <button key={key} onClick={() => setFontScale(key)} className="rounded-xl py-2 text-xs font-bold transition-all duration-200 active:scale-95"
                    style={{ background: fontScale === key ? TEAL : PAPER, color: fontScale === key ? "#fff" : INK_SOFT }}>
                    {FONT_SCALE_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
                               <a href="http://pf.kakao.com/_xkuexaX/chat" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full py-3.5 font-extrabold mt-8 mb-8 transition-all duration-200 active:scale-[0.98]"
              style={{ background: "#FEE500", color: "#3C1E1E" }}>
              <Headset size={18} />
              카카오톡으로 상담하기
            </a>
            <div className="flex items-center justify-between mb-3 mt-8">
              <span className="font-extrabold text-sm" style={{ color: INK }}>1:1 문의</span>
              <button onClick={() => setShowInquiryForm(!showInquiryForm)} className="text-xs font-bold" style={{ color: TEAL }}>
                {showInquiryForm ? "닫기" : "+ 문의하기"}
              </button>
            </div>

            {showInquiryForm && (
              <form onSubmit={submitInquiry} className="rounded-2xl p-4 mb-4" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                <input value={inquiryForm.title} onChange={(e) => setInquiryForm({ ...inquiryForm, title: e.target.value })} placeholder="제목"
                  className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                <textarea value={inquiryForm.content} onChange={(e) => setInquiryForm({ ...inquiryForm, content: e.target.value })} placeholder="문의 내용을 입력해주세요" rows={4}
                  className="w-full rounded-xl px-4 py-2.5 mb-3 text-sm outline-none resize-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                <button type="submit" className="w-full rounded-full py-2.5 text-sm font-bold text-white" style={{ background: TEAL }}>문의 등록</button>
              </form>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {inquiries.length === 0 && (
                <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>문의 내역이 없어요</div>
              )}
              {inquiries.map((q) => (
                <div key={q.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold" style={{ color: INK }}>{q.title}</div>
                    <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: q.status === "answered" ? TEAL_TINT : CORAL_TINT, color: q.status === "answered" ? TEAL_DARK : CORAL }}>
                      {q.status === "answered" ? "답변완료" : "답변대기"}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: INK_SOFT }}>{q.content}</div>
                  {q.answer && (
                    <div className="mt-2 rounded-xl p-3 text-xs" style={{ background: PAPER, color: INK }}>
                      <span className="font-bold" style={{ color: TEAL }}>답변: </span>{q.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
    <div className="text-center mt-6 mb-8">
              <a href="/privacy" className="text-xs" style={{ color: INK_SOFT, textDecoration: "underline" }}>
                개인정보처리방침
              </a>
            </div>
          </div>
        )}
          
        {/* ===================== 관리자 ===================== */}
        {tab === "admin" && isAdmin && (
          <div className="max-w-2xl mx-auto">
     <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl p-3 flex items-center justify-center" style={{ background: TEAL_TINT }}>
                <ShieldCheck size={22} color={TEAL} />
              </div>
              <div>
                <h2 className="font-extrabold text-xl" style={{ color: INK }}>관리자</h2>
                <div className="text-xs" style={{ color: INK_SOFT }}>회원, 알림, 공지사항을 관리하세요</div>
              </div>
            </div>
                      <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>알림 보내기</div>
            <div className="rounded-2xl p-4 mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              <input value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} placeholder="알림 제목 (예: 12월 이벤트 시작!)"
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                          <textarea value={notifBody} onChange={(e) => setNotifBody(e.target.value)} placeholder="알림 내용" rows={2}
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none resize-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                          <select value={notifTarget} onChange={(e) => setNotifTarget(e.target.value)} className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }}>
                <option value="notice">누르면 → 공지사항으로 이동</option>
                <option value="home">누르면 → 홈으로 이동</option>
                <option value="map">누르면 → 지도로 이동</option>
                <option value="mypage">누르면 → 마이페이지로 이동</option>
              </select>
              {notifTarget === "notice" && (
                <select value={notifNoticeId} onChange={(e) => setNotifNoticeId(e.target.value)} className="w-full rounded-xl px-4 py-2.5 mb-3 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }}>
                  <option value="">특정 글 지정 안함 (목록만 보여줌)</option>
                  {notices.map((n) => (
                    <option key={n.id} value={n.id}>{n.title}</option>
                  ))}
                </select>
              )}
              <button
                onClick={async () => {
                  await sendPushNotification(notifTitle, notifBody, null, notifTarget, notifNoticeId);
                  setNotifTitle("");
                  setNotifBody("");
                  setNotifNoticeId("");
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold text-white"
                style={{ background: TEAL }}>
                <Bell size={15} />
                모든 사용자에게 발송
              </button>
            </div>
            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>회원 관리 ({allProfiles.length}명)</div>
            <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="이메일 또는 닉네임으로 검색"
              className="w-full rounded-xl px-4 py-2.5 mb-3 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
            <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {allProfiles.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>회원이 없어요</div>}
              {allProfiles
                .filter((p) => (p.email || "").includes(memberSearch) || (p.nickname || "").includes(memberSearch))
                .map((p) => (
                               <div key={p.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <button onClick={() => setExpandedMemberId(expandedMemberId === p.id ? null : p.id)} className="w-full flex items-center justify-between">
                    <div className="text-left min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: INK }}>{p.email || "(이메일 없음)"}</div>
                      <div className="text-xs truncate" style={{ color: INK_SOFT }}>{p.admin_note ? `📌 ${p.admin_note} · ` : ""}{p.nickname} · {currentTier(p.points).label}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <div style={{ fontFamily: MONO_FONT, color: CORAL, fontWeight: 700, fontSize: 15 }}>{p.points.toLocaleString()}P</div>
                      <ChevronRight size={16} color={INK_SOFT} style={{ transform: expandedMemberId === p.id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                    </div>
                  </button>
                  {expandedMemberId === p.id && (
                  <div className="mt-3">
                  <div className="flex gap-2 mt-2">
                    <input value={adminNoteDrafts[p.id] !== undefined ? adminNoteDrafts[p.id] : (p.admin_note || "")} onChange={(e) => setAdminNoteDrafts({ ...adminNoteDrafts, [p.id]: e.target.value })} placeholder="별명/메모 (예: 카페 사장님, 아파트 경비아저씨)"
                      className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                    <button onClick={() => saveAdminNote(p.id)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-white flex-shrink-0" style={{ background: INK_SOFT }}>저장</button>
                  </div>
                             <div className="flex flex-wrap gap-2 mt-2">
                    <input type="number" value={adjustDrafts[p.id]?.amount || ""} onChange={(e) => setAdjustDrafts({ ...adjustDrafts, [p.id]: { ...adjustDrafts[p.id], amount: e.target.value } })} placeholder="±숫자"
                      className="w-20 rounded-lg px-2 py-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, minWidth: 0 }} />
                    <input value={adjustDrafts[p.id]?.note || ""} onChange={(e) => setAdjustDrafts({ ...adjustDrafts, [p.id]: { ...adjustDrafts[p.id], note: e.target.value } })} placeholder="사유 (예: 2월 이벤트 당첨)"
                      className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, minWidth: 100 }} />
                    <button onClick={() => submitAdjustPoints(p.id)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-white flex-shrink-0" style={{ background: TEAL }}>적용</button>
                    <button onClick={() => deleteUser(p.id, p.email)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold flex-shrink-0" style={{ background: CORAL_TINT, color: CORAL }} aria-label="회원 삭제">
                      <Trash2 size={14} />
                    </button>
                  </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <input value={individualNotifDrafts[p.id]?.title || ""} onChange={(e) => setIndividualNotifDrafts({ ...individualNotifDrafts, [p.id]: { ...individualNotifDrafts[p.id], title: e.target.value } })} placeholder="알림 제목"
                      className="w-full sm:w-24 rounded-lg px-2 py-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                    <input value={individualNotifDrafts[p.id]?.body || ""} onChange={(e) => setIndividualNotifDrafts({ ...individualNotifDrafts, [p.id]: { ...individualNotifDrafts[p.id], body: e.target.value } })} placeholder="알림 내용"
                      className="w-full sm:flex-1 rounded-lg px-2 py-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                                      <button
                      onClick={async () => {
                        const draft = individualNotifDrafts[p.id];
                        if (!draft?.title || !draft?.body) { showToast("제목과 내용을 입력해주세요"); return; }
                        await sendPushNotification(draft.title, draft.body, p.id, "notice");
                        setIndividualNotifDrafts({ ...individualNotifDrafts, [p.id]: { title: "", body: "" } });
                      }}
                      className="w-full sm:w-auto rounded-lg px-2.5 py-1.5 text-xs font-bold text-white flex items-center justify-center gap-1 flex-shrink-0" style={{ background: CORAL }}>
                      <Bell size={14} /> <span className="sm:hidden">알림 발송</span>
                    </button>
                  </div>
                                          <div className="mt-2 pt-2" style={{ borderTop: `1px dashed ${LINE}` }}>
                    <div className="flex items-center gap-1 mb-1.5">
                      <Gift size={12} color={TEAL} />
                      <span className="text-[10px] font-bold" style={{ color: TEAL }}>쿠폰 발급</span>
                    </div>
                    <input value={couponDrafts[p.id]?.title || ""} onChange={(e) => setCouponDrafts({ ...couponDrafts, [p.id]: { ...couponDrafts[p.id], title: e.target.value } })} placeholder="쿠폰 제목 (예: 치킨 쿠폰)"
                      className="w-full rounded-lg px-2 py-1.5 mb-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                    <input value={couponDrafts[p.id]?.description || ""} onChange={(e) => setCouponDrafts({ ...couponDrafts, [p.id]: { ...couponDrafts[p.id], description: e.target.value } })} placeholder="설명 (예: ○○치킨 후라이드 1마리 무료)"
                      className="w-full rounded-lg px-2 py-1.5 mb-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                                        <div className="flex flex-col sm:flex-row gap-2 mb-1.5">
                      <input type="date" value={couponDrafts[p.id]?.expiresAt || ""} onChange={(e) => setCouponDrafts({ ...couponDrafts, [p.id]: { ...couponDrafts[p.id], expiresAt: e.target.value } })}
                        className="w-full sm:flex-1 rounded-lg px-2 py-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, minWidth: 0 }} />
                      <input type="file" accept="image/*" onChange={handleCouponImageChange} className="hidden" id={`coupon-image-${p.id}`} />
                      <label htmlFor={`coupon-image-${p.id}`} className="w-full sm:w-auto rounded-lg px-2.5 py-1.5 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer flex-shrink-0" style={{ border: `1.4px solid ${LINE}`, color: INK_SOFT }}>
                        <Camera size={12} /> 사진 첨부
                      </label>
                    </div>
                           {couponImagePreview && <img src={couponImagePreview} alt="미리보기" className="w-16 h-16 object-cover rounded-lg mb-1.5" />}
                    <button onClick={() => issueCoupon(p.id)} className="w-full rounded-lg py-1.5 text-xs font-bold text-white flex items-center justify-center gap-1" style={{ background: TEAL }}>
                      <Gift size={13} /> 쿠폰 발급하기
                    </button>
                    {allCoupons.filter((c) => c.user_id === p.id).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {allCoupons.filter((c) => c.user_id === p.id).map((c) => (
                          <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-1.5" style={{ background: PAPER }}>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate" style={{ color: INK }}>{c.title}</div>
                                                          <div className="text-[10px]" style={{ color: c.status === "used" ? INK_SOFT : TEAL }}>{c.status === "used" ? "사용완료" : "사용가능"}</div>
                            </div>
                            <button onClick={() => deleteCoupon(c.id)} className="rounded-full p-1 flex-shrink-0" aria-label="쿠폰 삭제">
                              <Trash2 size={12} color={CORAL} />
                            </button>
                                       </div>
                        ))}
                      </div>
                    )}
                  </div>
                  </div>
                  )}
                </div>
                 ))}
            </div>

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>포인트 조정 기록</div>
            <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {adjustLog.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>조정 기록이 없어요</div>}
              {adjustLog.map((h) => (
                <div key={h.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <div>
                    <div className="text-sm font-bold" style={{ color: INK }}>{h.profiles?.email || "(알 수 없음)"}</div>
                    <div className="text-xs" style={{ color: INK_SOFT }}>{h.note} · {new Date(h.created_at).toLocaleDateString("ko-KR")}</div>
                  </div>
                  <div style={{ fontFamily: MONO_FONT, color: h.points >= 0 ? TEAL : CORAL, fontWeight: 700, fontSize: 13 }}>
                    {h.points >= 0 ? "+" : ""}{h.points}P
                  </div>
                </div>
              ))}
            </div>

                            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>장소 정보 신고 ({allReports.filter(r => r.status !== "resolved").length}건 대기중)</div>
            <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {allReports.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>신고 내역이 없어요</div>}
              {allReports.map((r) => (
                <div key={r.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}`, opacity: r.status === "resolved" ? 0.5 : 1 }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold" style={{ color: INK }}>{r.places?.name || "(삭제된 장소)"}</div>
                      <div className="text-xs mb-1" style={{ color: INK_SOFT }}>{r.places?.address}</div>
                      <div className="text-xs" style={{ color: INK }}>{r.reason}</div>
                      <div className="text-xs mt-1" style={{ color: INK_SOFT }}>{new Date(r.created_at).toLocaleDateString("ko-KR")}</div>
                    </div>
                                                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {r.status !== "resolved" ? (
                        <button onClick={() => resolveReport(r.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-white" style={{ background: TEAL }}>처리 완료로 표시</button>
                      ) : (
                        <span className="text-[10px] font-bold rounded-full px-2 py-1 text-center" style={{ background: PAPER, color: INK_SOFT }}>처리완료됨</span>
                      )}
                      {r.place_id && (
                        <button
                          onClick={() => {
                            const place = places.find((pl) => pl.id === r.place_id);
                            if (!place) { showToast("장소를 찾을 수 없어요 (삭제됐을 수 있어요)"); return; }
                            setIsAdminEditingPlace(true);
                            startEdit(place);
                            setTab("register");
                          }}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-bold"
                          style={{ border: `1.4px solid ${LINE}`, color: INK_SOFT }}
                        >
                          수정하기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>캠페인 배너 관리</div>
            <form onSubmit={submitCampaign} className="rounded-2xl p-4 mb-8" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                     <input value={campaignForm.title} onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })} placeholder="배너 제목 (선택)"
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
              <input value={campaignForm.link_url} onChange={(e) => setCampaignForm({ ...campaignForm, link_url: e.target.value })} placeholder="누르면 이동할 링크 (선택, 예: https://...)"
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                                <select value={campaignForm.notice_id} onChange={(e) => setCampaignForm({ ...campaignForm, notice_id: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }}>
                <option value="">연결할 공지 없음 (링크만 사용)</option>
                {notices.map((n) => (
                  <option key={n.id} value={n.id}>{n.title}</option>
                ))}
              </select>
              <input type="file" accept="image/*" onChange={handleCampaignPhotoChange} className="hidden" id="campaign-upload" />
              <label htmlFor="campaign-upload" className="flex items-center justify-center rounded-xl mb-3 cursor-pointer transition-all duration-200 hover:opacity-80" style={{ border: `1.5px dashed ${LINE}`, height: campaignPreview ? "auto" : 96 }}>
                {campaignPreview ? (
                  <img src={campaignPreview} alt="미리보기" className="w-full h-32 object-cover rounded-xl" />
                ) : (
                  <div className="text-center py-4">
                    <Camera size={20} color={INK_SOFT} className="mx-auto mb-1" />
                    <div className="text-xs font-bold" style={{ color: INK_SOFT }}>배너 이미지 선택</div>
                  </div>
                )}
              </label>
              <button type="submit" className="w-full rounded-full py-2.5 text-sm font-bold text-white" style={{ background: TEAL }}>
                {editingCampaignId ? "수정 완료" : "배너 등록"}
              </button>
              {editingCampaignId && (
         <button type="button" onClick={() => { setEditingCampaignId(null); setCampaignForm({ title: "", link_url: "", notice_id: "" }); setCampaignFile(null); setCampaignPreview(null); }} className="w-full text-xs font-bold mt-2" style={{ color: INK_SOFT }}>
                  취소
                </button>
              )}
            </form>

            <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {campaigns.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>등록된 배너가 없어요</div>}
              {campaigns.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <img src={c.image_url} alt={c.title || "배너"} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-sm font-bold truncate" style={{ color: INK }}>{c.title || "(제목 없음)"}</div>
                  <button onClick={() => startEditCampaign(c)} className="text-xs font-bold flex-shrink-0" style={{ color: TEAL }}>수정</button>
                  <button onClick={() => deleteCampaign(c.id)} className="text-xs font-bold flex-shrink-0" style={{ color: CORAL }}>삭제</button>
                </div>
              ))}
            </div>
                      <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>{editingNoticeId ? "공지사항 수정" : "공지사항 작성"}</div>
            <form onSubmit={submitNotice} className="rounded-2xl p-4 mb-8" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                           <input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} placeholder="공지 제목"
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />

                            <div className="flex flex-wrap gap-1.5 mb-1.5 relative">
                <button type="button" onClick={() => wrapSelection("**", "**", "굵은 글씨")} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ background: PAPER, color: INK_SOFT }}>
                  <Bold size={12} /> 굵게
                </button>
                <button type="button" onClick={() => wrapSelection("*", "*", "기울임 글씨")} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ background: PAPER, color: INK_SOFT }}>
                  <Italic size={12} /> 기울임
                </button>
                <button type="button" onClick={() => wrapSelection("__", "__", "밑줄 글씨")} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ background: PAPER, color: INK_SOFT }}>
                  <Underline size={12} /> 밑줄
                </button>
                <button type="button" onClick={() => wrapSelection("==", "==", "강조 글씨")} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ background: PAPER, color: INK_SOFT }}>
                  <Highlighter size={12} /> 강조색
                </button>
                <button type="button" onClick={insertLink} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ background: PAPER, color: INK_SOFT }}>
                  <Link2 size={12} /> 링크
                </button>
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ background: PAPER, color: INK_SOFT }}>
                  😀 이모티콘
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 z-10 rounded-xl p-2 grid grid-cols-8 gap-1" style={{ background: CARD, border: `1px solid ${LINE}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {["😀","😊","👍","🎉","❤️","⭐","📢","✅","🎁","📌","🚨","💡","🙏","👏","🔥","😍"].map((e) => (
                      <button type="button" key={e} onClick={() => insertEmoji(e)} className="text-lg hover:bg-black/5 rounded p-1">{e}</button>
                    ))}
                  </div>
                )}
              </div>
                            <textarea ref={noticeContentRef} value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} placeholder="공지 내용 (글자를 선택하고 위 버튼을 눌러서 꾸며보세요)" rows={4}
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none resize-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />

              <input value={noticeForm.link_url} onChange={(e) => setNoticeForm({ ...noticeForm, link_url: e.target.value })} placeholder="이벤트 링크 (선택, 예: https://...)"
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />

              <input type="file" accept="image/*" onChange={handleNoticeImageChange} className="hidden" id="notice-image-upload" />
              <label htmlFor="notice-image-upload" className="flex items-center justify-center rounded-xl mb-2 cursor-pointer transition-all duration-200 hover:opacity-80" style={{ border: `1.5px dashed ${LINE}`, height: noticeImagePreview ? "auto" : 80 }}>
                {noticeImagePreview ? (
                  <img src={noticeImagePreview} alt="미리보기" className="w-full h-28 object-cover rounded-xl" />
                ) : (
                  <div className="text-center py-3">
                    <Camera size={18} color={INK_SOFT} className="mx-auto mb-1" />
                    <div className="text-xs font-bold" style={{ color: INK_SOFT }}>사진 첨부 (선택)</div>
                  </div>
                )}
              </label>

              <input type="file" onChange={handleNoticeFileChange} className="hidden" id="notice-file-upload" />
              <label htmlFor="notice-file-upload" className="flex items-center gap-2 rounded-xl px-4 py-2.5 mb-3 cursor-pointer text-xs font-bold" style={{ border: `1.4px dashed ${LINE}`, color: INK_SOFT }}>
                <Paperclip size={14} />
                {noticeAttachedFile ? noticeAttachedFile.name : "파일 첨부 (선택)"}
              </label>

                          <button type="submit" className="w-full rounded-full py-2.5 text-sm font-bold text-white" style={{ background: TEAL }}>
                {editingNoticeId ? "수정 완료" : "공지 등록"}
              </button>
              {editingNoticeId && (
                <button type="button" onClick={() => { setEditingNoticeId(null); setNoticeForm({ title: "", content: "", link_url: "" }); setNoticeImageFile(null); setNoticeImagePreview(null); setNoticeAttachedFile(null); }} className="w-full text-xs font-bold mt-2" style={{ color: INK_SOFT }}>
                  취소
                </button>
              )}
            </form>

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>등록된 공지 목록</div>
            <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {notices.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>공지사항이 없어요</div>}
              {notices.map((n) => (
                <div key={n.id} className="flex items-start justify-between px-4 py-3 gap-2" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <div>
                    <div className="text-sm font-bold" style={{ color: INK }}>{n.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: INK_SOFT }}>{n.content}</div>
                  </div>
                               <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEditNotice(n)} className="text-xs font-bold" style={{ color: TEAL }}>수정</button>
                    <button onClick={() => deleteNotice(n.id)} className="text-xs font-bold" style={{ color: CORAL }}>삭제</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>1:1 문의 관리</div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {allInquiries.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>문의가 없어요</div>}
              {allInquiries.map((q) => (
                <div key={q.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold" style={{ color: INK }}>{q.title}</div>
                    <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: q.status === "answered" ? TEAL_TINT : CORAL_TINT, color: q.status === "answered" ? TEAL_DARK : CORAL }}>
                      {q.status === "answered" ? "답변완료" : "답변대기"}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: INK_SOFT }}>{q.content}</div>
                  {q.answer ? (
                    <div className="mt-2 rounded-xl p-3 text-xs" style={{ background: PAPER, color: INK }}>
                      <span className="font-bold" style={{ color: TEAL }}>답변: </span>{q.answer}
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <input value={replyDrafts[q.id] || ""} onChange={(e) => setReplyDrafts({ ...replyDrafts, [q.id]: e.target.value })} placeholder="답변 입력"
                        className="flex-1 rounded-xl px-3 py-2 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                      <button onClick={() => submitReply(q.id)} className="rounded-xl px-3 py-2 text-xs font-bold text-white flex-shrink-0" style={{ background: TEAL }}>답변</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
</main>

      <footer className="text-center py-6 text-xs" style={{ color: INK_SOFT }}>
        장편 · 코드람쥐
      </footer>
    </div>
  );
}

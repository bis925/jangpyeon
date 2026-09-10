"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { supabase } from "../lib/supabaseClient";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import {
  Search, MapPin, Plus, User, Check, ChevronRight,
    Accessibility, DoorOpen, Baby, MoveVertical, Sparkles, X, Star, LogOut, Mail, Camera, Pencil, Megaphone, ShieldCheck, Paperclip, Bold, MessageCircle, Headset, Italic, Underline, Highlighter, Link2, Locate, LocateFixed, Trash2, Clipboard, ZoomIn, ZoomOut, Type, Navigation, Flag, Bell, Gift, Phone, MessageSquare, Heart, CheckCircle, Palette, Mic,
} from "lucide-react";

/* ===================== 글자 크기 훅 ===================== */
const FONT_SCALES = { xsmall: 0.8, small: 0.9, normal: 1, large: 1.15, xlarge: 1.3 };
const FONT_SCALE_LABELS = { xsmall: "매우 작게", small: "작게", normal: "보통", large: "크게", xlarge: "매우 크게" };
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
  ramp: { label: "휠체어 출입", icon: Accessibility, field: "entrance_step", matchValue: "ramp" },
  door: { label: "장애인 화장실", icon: DoorOpen, field: "accessible_toilet", matchValue: "yes" },
  stroller: { label: "유모차 가능", icon: Baby, field: "has_stroller_access", matchValue: true },
  lift: { label: "엘리베이터", icon: MoveVertical, field: "elevator", matchValue: "yes" },
};

const CARD_THEMES = {
  default: { label: "기본", gradient: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` },
  sunset: { label: "노을", gradient: "linear-gradient(135deg, #FF7E5F, #FEB47B)" },
  ocean: { label: "바다", gradient: "linear-gradient(135deg, #2193B0, #6DD5ED)" },
  berry: { label: "베리", gradient: "linear-gradient(135deg, #C33764, #1D2671)" },
  forest: { label: "숲", gradient: "linear-gradient(135deg, #134E5E, #71B280)" },
  peach: { label: "복숭아", gradient: "linear-gradient(135deg, #FFAFBD, #FFC3A0)" },
  lavender: { label: "라벤더", gradient: "linear-gradient(135deg, #834D9B, #D04ED6)" },
  gold: { label: "골드", gradient: "linear-gradient(135deg, #F7971E, #FFD200)" },
  mint: { label: "민트", gradient: "linear-gradient(135deg, #00B09B, #96C93D)" },
  night: { label: "밤하늘", gradient: "linear-gradient(135deg, #0F2027, #2C5364)" },
  cherry: { label: "체리", gradient: "linear-gradient(135deg, #EB3349, #F45C43)" },
  sky: { label: "하늘", gradient: "linear-gradient(135deg, #4B79A1, #283E51)" },
};

const TIERS = [
  { label: "아기병아리", emoji: "🐤", min: 0, ringColor: null, glow: false },
  { label: "아기토끼", emoji: "🐰", min: 500, ringColor: "#C0C0C0", glow: false },
  { label: "아기여우", emoji: "🦊", min: 1500, ringColor: "#CD7F32", glow: false },
  { label: "아기사자", emoji: "🦁", min: 3000, ringColor: "#4A90D9", glow: true },
  { label: "날개곰", emoji: "🐻", min: 4000, ringColor: "#9B59B6", glow: true },
  { label: "황금독수리", emoji: "🦅", min: 5000, ringColor: "#FFD700", glow: true },
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

function renderRichText(html) {
  return <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

const CATEGORIES = ["공공기관", "음식점", "카페", "문화시설", "쇼핑", "병원"];
const CATEGORY_MARKERS = {
  공공기관: { emoji: "🏛️", color: "#4A90D9" },
  음식점: { emoji: "🍽️", color: "#F0603D" },
  카페: { emoji: "☕", color: "#B08A5A" },
  문화시설: { emoji: "🎭", color: "#9B59B6" },
  쇼핑: { emoji: "🛍️", color: "#E8A800" },
  병원: { emoji: "🏥", color: "#00A896" },
};
const WEEKDAYS = [
  { key: "mon", label: "월" }, { key: "tue", label: "화" }, { key: "wed", label: "수" },
  { key: "thu", label: "목" }, { key: "fri", label: "금" }, { key: "sat", label: "토" }, { key: "sun", label: "일" },
];
const DEFAULT_HOURS = WEEKDAYS.reduce((acc, d) => ({ ...acc, [d.key]: { open: "09:00", close: "18:00", closed: false } }), {});

function useKoreanHolidays() {
  const [holidays, setHolidays] = useState(null);
  useEffect(() => {
    fetch("https://holidays.hyunbin.page/basic.json")
      .then((res) => res.json())
      .then((data) => {
        const flat = {};
        for (const key in data) {
          const val = data[key];
          if (Array.isArray(val)) {
            flat[key] = val;
          } else if (val && typeof val === "object") {
            Object.assign(flat, val);
          } else if (typeof val === "string") {
            flat[key] = [val];
          }
        }
        setHolidays(flat);
      })
      .catch(() => setHolidays({}));
  }, []);
  return holidays;
}

const FAQ_LIST = [
  { q: "장편은 어떤 서비스인가요?", a: "장편은 휠체어 이용자, 유모차를 끄는 부모님, 지팡이를 짚는 어르신 등 이동에 불편을 느끼는 분들을 위한 접근성 정보 지도 서비스예요. 휠체어 출입 가능 여부, 장애인 화장실 유무 등을 지도에서 확인하고 함께 기록해나가요." },
  { q: "포인트는 어떻게 모으나요?", a: "새로운 장소를 등록하면 포인트를 받아요. 내가 등록한 장소가 도움이 됐어요를 받으면 추가 포인트를 받고, 오래된 정보를 방문해서 정보 확인했어요를 눌러도 포인트를 받을 수 있어요." },
  { q: "닉네임은 어떻게 바꾸나요?", a: "마이페이지에서 닉네임 옆의 연필 아이콘을 눌러 언제든지 바꾸실 수 있어요." },
  { q: "이달의 포인트 랭킹은 무엇인가요?", a: "매달 1일부터 그 달 마지막 날까지 모은 포인트를 기준으로 순위를 매기는 기능이에요. 매달 1일에 자동으로 초기화되며, 1등부터 3등까지는 치킨 쿠폰, 4등부터 5등까지는 커피 쿠폰을 받으실 수 있어요." },
  { q: "쿠폰을 받으면 포인트가 줄어드나요?", a: "네, 순위 보상 쿠폰을 받으시면 해당 월에 모으신 포인트가 차감돼요. 쿠폰이 필요 없으시다면 거부하실 수 있고, 거부하시면 포인트는 그대로 유지돼요." },
  { q: "영업중, 영업종료는 어떻게 표시되나요?", a: "장소를 등록할 때 영업시간을 함께 등록하시면, 지도와 목록에서 그 장소가 지금 영업중인지 영업이 끝났는지 자동으로 표시돼요." },
  { q: "즐겨찾기한 장소를 친구에게 공유할 수 있나요?", a: "네, 즐겨찾기 화면에서 공유 버튼을 누르면 링크가 만들어져요. 이 링크를 받은 친구는 로그인 없이도 바로 지도를 볼 수 있어요." },
  { q: "근처에 새 장소가 등록되면 알림이 오나요?", a: "마이페이지에서 내 동네를 설정하시면, 반경 3킬로미터 이내에 새 장소가 등록될 때 자동으로 알림을 받으실 수 있어요. 알림이 필요 없으시면 언제든지 꺼두실 수 있어요." },
  { q: "정보가 오래됐는지 어떻게 알 수 있나요?", a: "각 장소 카드에 등록일이나 최근 확인일이 색깔과 함께 표시돼요. 초록색은 최근 정보, 노란색은 조금 지난 정보, 빨간색은 오래된 정보를 의미해요." },
  { q: "글자 크기나 다크모드를 바꿀 수 있나요?", a: "마이페이지에서 다크모드를 켜고 끌 수 있고, 상단의 글자 크기 버튼으로 다섯 단계로 조절하실 수 있어요." },
];

function getTodaySpecialEvent() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  if (month === 12 && date === 25) return { type: "christmas", emoji: "🎅", message: null };
  if (month === 1 && date === 1) return { type: "newyear", emoji: "🎉", message: "새해 복 많이 받으세요!" };
  if (month === 10 && date === 9) return { type: "hangeul", emoji: "🇰🇷", message: "한글날이에요!" };
  return null;
}

function maskEmail(email) {
  if (!email) return "익명";
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return email.slice(0, 3) + "***";
  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  const visible = localPart.slice(0, 3);
  return visible + "***" + domain;
}

function getRecencyInfo(createdAt, lastConfirmedAt) {
  const baseDate = lastConfirmedAt || createdAt;
  const days = Math.floor((Date.now() - new Date(baseDate).getTime()) / (1000 * 60 * 60 * 24));
  const suffix = lastConfirmedAt ? "확인됨" : "등록됨";
  if (days < 90) return { label: days < 1 ? `오늘 ${suffix}` : `${days}일 전 ${suffix}`, color: "#3E8E6E", bg: "#E8F3ED" };
  if (days < 365) return { label: `${Math.floor(days / 30)}개월 전 ${suffix}`, color: "#B08A3E", bg: "#F5EEE0" };
  return { label: `${Math.floor(days / 365)}년 전 ${suffix}, 확인 권장`, color: "#C56B5C", bg: "#F5E6E3" };
}

function isOpenNow(businessHours, holidays) {
  if (!businessHours) return null;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const isHolidayToday = holidays && holidays[todayStr];
  const openOnThisHoliday = businessHours.openHolidays && businessHours.openHolidays.includes(todayStr);
  if (isHolidayToday && !openOnThisHoliday) {
    return false;
  }

  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const today = dayKeys[now.getDay()];
  const todayHours = businessHours[today];
  if (!todayHours || todayHours.closed) return false;
  if (!todayHours.open || !todayHours.close) return null;
  const [openH, openM] = todayHours.open.split(":").map(Number);
  const [closeH, closeM] = todayHours.close.split(":").map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}
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

const ACCESS_INFO_META = {
  entrance_step: {
    label: "입구 진입",
    values: { none: { text: "턱 없이 진입 가능", ok: true }, ramp: { text: "경사로 있음", ok: true }, steps: { text: "계단만 있음", ok: false }, unknown: { text: "확인된 정보 없음", ok: null } },
  },
  door_type: {
    label: "출입문",
    values: { auto: { text: "자동문", ok: true }, swing: { text: "여닫이문", ok: null }, slide: { text: "미닫이문", ok: true }, unknown: { text: "확인된 정보 없음", ok: null } },
  },
  accessible_toilet: {
    label: "장애인 화장실",
    values: { yes: { text: "있음", ok: true }, no: { text: "없음", ok: false }, unknown: { text: "확인된 정보 없음", ok: null } },
  },
  elevator: {
    label: "엘리베이터",
    values: { yes: { text: "있음", ok: true }, no: { text: "없음", ok: false }, none_needed: { text: "1층뿐이라 필요 없음", ok: true }, unknown: { text: "확인된 정보 없음", ok: null } },
  },
parking_disabled: {
    label: "장애인 주차구역",
    values: { yes: { text: "있음", ok: true }, no: { text: "없음", ok: false }, unknown: { text: "확인된 정보 없음", ok: null } },
  },
  turning_space: {
    label: "내부 회전 공간",
    values: { yes: { text: "여유 있음", ok: true }, no: { text: "비좁음", ok: false }, unknown: { text: "확인된 정보 없음", ok: null } },
  },
};

function getOverallAccessSummary(place) {
  const critical = ["entrance_step", "accessible_toilet"];
  const values = critical.map((k) => place[k]);
  if (values.includes("steps") || place.entrance_step === "steps") return { text: "휠체어 진입 불가", color: "#C0392B", bg: "#FBEAE8" };
  const hasUnknown = critical.some((k) => !place[k] || place[k] === "unknown");
  const hasNo = place.accessible_toilet === "no";
  if (hasUnknown) return { text: "확인 필요", color: "#8A6D1F", bg: "#FBF3DC" };
  if (place.entrance_step === "ramp" && !hasNo) return { text: "휠체어 진입 가능", color: "#1F7A4D", bg: "#E5F4EC" };
  return { text: "조건부 가능", color: "#B4620F", bg: "#FCEEDD" };
}

function PlaceDetailModal({ place, onClose, holidays, onShare, onDirections, onGoToMap, onImageClick, onConfirmInfo, onShowRecencyHelp }) {
  const [showSummaryHelp, setShowSummaryHelp] = useState(false);
  if (!place) return null;
  const openStatus = isOpenNow(place.business_hours, holidays);
  const summary = getOverallAccessSummary(place);
  const recency = place.created_at ? getRecencyInfo(place.created_at, place.last_confirmed_at) : null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
<div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden relative" style={{ background: CARD, maxHeight: "88vh", display: "flex", flexDirection: "column", border: `3px solid ${CATEGORY_MARKERS[place.category]?.color || TEAL}` }}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "rgba(0,0,0,0.4)" }} aria-label="닫기">
          <X size={18} color="#fff" />
        </button>
        <div className="overflow-y-auto">

{place.photo_urls && place.photo_urls.length > 0 ? (
            <div className="grid gap-1.5 p-4 pb-0" style={{ gridTemplateColumns: `repeat(${place.photo_urls.length}, 1fr)` }}>
              {place.photo_urls.map((url, i) => (
                <button key={i} type="button" onClick={() => onImageClick(place.photo_urls, i)} className="aspect-square rounded-xl overflow-hidden min-w-0">
                  <img src={url} alt={`${place.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="p-5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {openStatus === true && (
                <div className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: "#E5F4EC" }}>
                  <div className="rounded-full" style={{ width: 7, height: 7, background: "#22C55E" }} />
                  <span style={{ color: "#16A34A", fontSize: 11, fontWeight: 800 }}>영업중</span>
                </div>
              )}
              {openStatus === false && (
                <div className="rounded-full px-2.5 py-1" style={{ background: "#F1F1F1" }}>
                  <span style={{ color: "#888", fontSize: 11, fontWeight: 800 }}>영업종료</span>
                </div>
              )}
           <button onClick={() => setShowSummaryHelp(true)} className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: summary.bg }}>
                <span style={{ color: summary.color, fontSize: 11, fontWeight: 800 }}>{summary.text}</span>
                <span className="flex items-center justify-center rounded-full text-[9px] font-extrabold flex-shrink-0" style={{ width: 14, height: 14, background: summary.color, color: "#fff" }}>?</span>
              </button>
            </div>

<div className="font-extrabold text-lg mb-1" style={{ color: INK, fontFamily: BODY_FONT }}>{place.name}</div>
            <div className="text-sm mb-2" style={{ color: INK_SOFT }}>{place.category} · {place.address}</div>
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              {recency && (
                <button onClick={() => onShowRecencyHelp()} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: recency.bg }}>
                  <div className="rounded-full" style={{ width: 6, height: 6, background: recency.color }} />
                  <span className="text-[10px] font-bold" style={{ color: recency.color }}>{recency.label}</span>
                </button>
              )}
              <button onClick={() => onConfirmInfo(place.id)} className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: "#E5F0FB" }}>
                <CheckCircle size={11} color="#2563EB" />
                <span className="text-[10px] font-bold" style={{ color: "#2563EB" }}>정보 확인했어요</span>
              </button>
              <button onClick={() => onShowRecencyHelp()} className="rounded-full flex-shrink-0" aria-label="정보 최신성 안내">
                <span className="flex items-center justify-center rounded-full text-[9px] font-extrabold" style={{ width: 15, height: 15, background: TEAL, color: "#fff" }}>?</span>
              </button>
            </div>


<div className="rounded-2xl p-4 mb-4" style={{ background: PAPER }}>
              <div className="text-sm font-extrabold mb-3" style={{ color: INK }}>♿ 접근성 정보</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ACCESS_INFO_META).map(([key, meta]) => {
                  const val = place[key] || "unknown";
                  const info = meta.values[val] || meta.values.unknown;
const bgColor = info.ok === true ? "#C0392B" : "#F1F1F1";
                  const textColor = info.ok === true ? "#fff" : "#888";
                  return (
                    <div key={key} className="rounded-xl p-2.5" style={{ background: bgColor }}>
                      <div className="text-[10px] font-bold mb-0.5" style={{ color: textColor, opacity: 0.85 }}>{meta.label}</div>
                      <div className="text-sm font-extrabold" style={{ color: textColor }}>{info.text}</div>
                    </div>
                  );
                })}
{place.threshold_cm != null && (
                  <div className="rounded-xl p-2.5" style={{ background: "#F1F1F1" }}>
                    <div className="text-[10px] font-bold mb-0.5" style={{ color: "#888", opacity: 0.85 }}>문턱 높이</div>
                    <div className="text-sm font-extrabold" style={{ color: "#888" }}>{place.threshold_cm}cm</div>
                  </div>
                )}
                {place.door_width_cm != null && (
                  <div className="rounded-xl p-2.5" style={{ background: "#F1F1F1" }}>
                    <div className="text-[10px] font-bold mb-0.5" style={{ color: "#888", opacity: 0.85 }}>출입문 유효폭</div>
                    <div className="text-sm font-extrabold" style={{ color: "#888" }}>{place.door_width_cm}cm</div>
                  </div>
                )}
                {place.toilet_floor != null && place.accessible_toilet === "yes" && (
                  <div className="rounded-xl p-2.5" style={{ background: "#F1F1F1" }}>
                    <div className="text-[10px] font-bold mb-0.5" style={{ color: "#888", opacity: 0.85 }}>화장실 위치</div>
                    <div className="text-sm font-extrabold" style={{ color: "#888" }}>{place.toilet_floor}층</div>
                  </div>
                )}
                <div className="rounded-xl p-2.5" style={{ background: place.has_stroller_access ? "#FCE4EC" : "#F1F1F1" }}>
                  <div className="text-[10px] font-bold mb-0.5" style={{ color: place.has_stroller_access ? "#D6336C" : "#888", opacity: 0.85 }}>유모차</div>
                  <div className="text-sm font-extrabold" style={{ color: place.has_stroller_access ? "#D6336C" : "#888" }}>{place.has_stroller_access ? "가능" : "정보 없음"}</div>
                </div>
              </div>
            </div>

            {place.business_hours && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: PAPER }}>
                <div className="text-xs font-extrabold mb-3" style={{ color: INK }}>영업시간</div>
                <div className="flex flex-col gap-1.5">
                  {WEEKDAYS.map((d) => {
                    const h = place.business_hours[d.key];
                    return (
                      <div key={d.key} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: INK_SOFT }}>{d.label}요일</span>
                        <span className="text-xs font-bold" style={{ color: h?.closed ? "#C0392B" : INK }}>
                          {h?.closed ? "휴무" : h?.open && h?.close ? `${h.open} ~ ${h.close}` : "정보 없음"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex items-center gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${LINE}` }}>
          {place.phone && (
            <a href={`tel:${place.phone}`} className="flex items-center justify-center rounded-full p-3" style={{ background: TEAL_TINT }} aria-label="전화 걸기">
              <Phone size={18} color={TEAL_DARK} />
            </a>
          )}
          <button onClick={() => onShare(place)} className="flex items-center justify-center rounded-full p-3" style={{ background: "#FEE500" }} aria-label="카카오톡으로 공유하기">
            <MessageCircle size={18} color="#3C1E1E" fill="#3C1E1E" />
          </button>
  <button onClick={() => { onGoToMap(place); onClose(); }} className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-3 text-sm font-bold text-white" style={{ background: TEAL }}>
            <MapPin size={16} />
            지도로 보기
          </button>
        </div>
      </div>
      {showSummaryHelp && (
        <div onClick={(e) => { e.stopPropagation(); setShowSummaryHelp(false); }} className="fixed inset-0 z-[60] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5" style={{ background: CARD }}>
            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>이 표시는 무슨 뜻인가요?</div>
            <div className="flex flex-col gap-2.5 text-xs" style={{ color: INK_SOFT, lineHeight: 1.6 }}>
              <div><b style={{ color: "#1F7A4D" }}>휠체어 진입 가능</b> — 경사로가 있고, 화장실도 문제없이 이용할 수 있어요</div>
              <div><b style={{ color: "#B4620F" }}>조건부 가능</b> — 진입은 가능하지만, 일부 시설이 불편할 수 있어요</div>
              <div><b style={{ color: "#C0392B" }}>휠체어 진입 불가</b> — 계단만 있어 진입이 어려워요</div>
              <div><b style={{ color: "#8A6D1F" }}>확인 필요</b> — 아직 정보가 등록되지 않았어요. 방문하신 적 있다면 정보를 등록해주세요!</div>
            </div>
            <button onClick={() => setShowSummaryHelp(false)} className="w-full rounded-full py-2.5 mt-4 text-sm font-bold text-white" style={{ background: TEAL }}>
              확인했어요
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceCard({ place, onHelpful, isFavorite, onToggleFavorite, onEdit, isOwner, onImageClick, onShare, onDirections, onReport, onDelete, isAdminUser, onAdminEdit, onAdminDelete, holidays, onViewReviews, onConfirmInfo, onShowRecencyHelp, onOpenMenu, onOpenDetail, onGoToMap }) {  const badges = getBadges(place);
  const openStatus = isOpenNow(place.business_hours, holidays);
  const longPressTimer = useRef(null);
  const didLongPress = useRef(false);

  function handlePressStart() {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(30);
      onOpenMenu(place);
    }, 500);
  }
  function handlePressEnd() {
    clearTimeout(longPressTimer.current);
  }
  function handleContextMenu(e) {
    e.preventDefault();
    onOpenMenu(place);
  }
  function handleCardClick() {
    if (didLongPress.current) return;
    onOpenDetail(place);
  }
return (
         <div
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchMove={handlePressEnd}
        onContextMenu={handleContextMenu}
        onClick={handleCardClick}
        className="relative rounded-2xl p-4 min-w-0 transition-all duration-200 hover:shadow-md active:scale-[0.98] select-none cursor-pointer"
        style={{ background: CARD, border: `1px solid ${LINE}`, opacity: openStatus === false ? 0.55 : 1, filter: openStatus === false ? "grayscale(0.6)" : "none" }}
      >

      {openStatus === false && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-20 pointer-events-none">
          <span className="rounded-full px-4 py-1.5 text-sm font-extrabold" style={{ background: "rgba(0,0,0,0.65)", color: "#fff" }}>영업 종료</span>
        </div>
      )}
 
<div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {openStatus === true && (
            <div className="flex items-center gap-1 rounded-full px-2 py-1 flex-shrink-0" style={{ background: "#fff", border: "1.4px solid #22C55E" }}>
              <div className="rounded-full" style={{ width: 7, height: 7, background: "#22C55E" }} />
              <span style={{ color: "#16A34A", fontSize: 10, fontWeight: 800 }}>영업중</span>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); onViewReviews(place); }} className="flex items-center gap-1 rounded-full px-2 py-1.5 flex-shrink-0" style={{ background: TEAL_TINT }}>
            <MessageSquare size={14} color={TEAL_DARK} />
            <span style={{ fontSize: 10, fontWeight: 700, color: TEAL_DARK }}>리뷰</span>
          </button>
        </div>
<button onClick={(e) => { e.stopPropagation(); onOpenDetail(place); }} className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-extrabold flex-shrink-0 transition-all duration-200 active:scale-95" style={{ background: "#FCE4EC", color: "#D6336C" }}>
          상세보기
          <ChevronRight size={14} />
        </button>
      </div>
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
      <div className="flex items-center gap-1.5 min-w-0">
          <div className="font-extrabold truncate" style={{ color: INK, fontFamily: BODY_FONT }}>{place.name}</div>
        </div>
      </div>
<div className="text-xs mb-2 truncate" style={{ color: INK_SOFT }}>{place.category} · {place.address}</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {badges.map((b) => <Badge key={b} badgeKey={b} />)}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onHelpful(place.id); }} className="flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold w-full transition-all duration-200 active:scale-95" style={{ background: CORAL_TINT, color: CORAL }}>
        <Heart size={14} fill={CORAL} />
        도움이 됐어요 {place.helpful_count}
      </button>
</div>
  );
}

function TierBar({ points }) {
  const pct = Math.min(100, (points / 5000) * 100);
  return (
    <div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.3)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#fff" }} />
      </div>
      <div className="flex justify-between mt-2.5">
        {TIERS.map((t) => {
          const reached = points >= t.min;
          return (
            <span
              key={t.label}
              className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
              style={{
                fontFamily: MONO_FONT,
                background: reached ? "#fff" : "rgba(255,255,255,0.25)",
                color: reached ? TEAL_DARK : "#fff",
              }}
            >
              {t.min}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== 로그인 화면 ===================== */
function LoginScreen({ onSent, signInWithGoogle, signInWithKakao, showToast, kakaoLoggingIn }) {
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
    const { data: canSignup } = await supabase.rpc("can_signup", { p_email: email.trim() });
    if (canSignup === false) {
      setLoading(false);
      setErrorMsg("탈퇴 후 7일간은 같은 이메일로 다시 가입하실 수 없어요.");
      return;
    }
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
              <p className="text-xs mt-3" style={{ color: INK_SOFT }}>
                비밀번호 없이, 메일로 온 코드만 입력하면 로그인돼요.
              </p>
            </form>
          )}
                                     {!sent && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: LINE }} />
                <span className="text-xs" style={{ color: INK_SOFT }}>또는</span>
                <div className="flex-1 h-px" style={{ background: LINE }} />
              </div>
                       <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 active:scale-[0.98] py-3.5 sm:py-3.5 mb-2.5"
                style={{ background: "#fff", border: `2px solid ${TEAL}`, color: INK, boxShadow: "0 2px 10px rgba(15,110,98,0.15)" }}
              >
                <svg width="20" height="20" viewBox="0 0 18 18" className="flex-shrink-0">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
                </svg>
                <span className="text-base sm:text-sm">구글로 계속하기</span>
              </button>
                 <button
                onClick={signInWithKakao}
                disabled={kakaoLoggingIn}
                className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 font-bold transition-all duration-200 active:scale-[0.98]"
                style={{ background: "#FEE500", color: "#3C1E1E", opacity: kakaoLoggingIn ? 0.7 : 1 }}
              >
                {kakaoLoggingIn ? (
                  <>
                    <div className="rounded-full animate-spin" style={{ width: 16, height: 16, border: "2px solid rgba(60,30,30,0.3)", borderTopColor: "#3C1E1E" }} />
                    <span className="text-base sm:text-sm">로그인 중이에요, 잠시만 기다려주세요...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
                      <path fill="#3C1E1E" d="M10 1C4.9 1 0.7 4.4 0.7 8.6c0 2.7 1.7 5.1 4.3 6.5-0.2 0.7-0.7 2.6-0.8 3-0.1 0.5 0.2 0.5 0.4 0.4 0.2-0.1 2.7-1.8 3.8-2.6 0.5 0.1 1.1 0.1 1.6 0.1 5.1 0 9.3-3.4 9.3-7.6C19.3 4.4 15.1 1 10 1z"/>
                    </svg>
                    <span className="text-base sm:text-sm">카카오로 계속하기</span>
                  </>
                )}
              </button>
              <p className="text-xs mt-3 font-bold" style={{ color: TEAL_DARK }}>
                📱 구글·카카오 계정으로 비밀번호 없이 바로 로그인할 수 있어요
              </p>
            </>
                  )}
                    <div className="flex items-center gap-3 mt-6 mb-6">
            <div className="flex-1 h-px" style={{ background: LINE }} />
          </div>
                    <a href="http://pf.kakao.com/_xkuexaX/chat" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full py-3.5 font-extrabold transition-all duration-200 active:scale-[0.98]"
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

 <div className="text-center">
          <p className="text-xs" style={{ color: '#B8B1A0' }}>제작 · 코드람쥐</p>
          <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: '#C9C2B2' }}>
            상호: 코드람쥐 · 대표: 조은찬 · 사업자등록번호: 303-18-93738<br />
            사업장 소재지: 경기도 평택시 산단로16번길 26, A동 14층 1408호<br />
            (모곡동, 엠에스원타워 지식산업센터)
          </p>
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
    const holidays = useKoreanHolidays();
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
  async function speakNotice(noticeId, title, htmlContent) {
    if (speakingNoticeId === noticeId) {
      if (typeof window !== "undefined" && window.Capacitor) {
        const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
        TextToSpeech.stop();
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingNoticeId(null);
      return;
    }

    const plainText = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const rawText = `${title}. ${plainText}`;
    const text = rawText.replace(/[^\uAC00-\uD7A3\s.,!?0-9]/g, "").replace(/\s+/g, " ").trim();
    setSpeakingNoticeId(noticeId);
    if (typeof window !== "undefined" && window.Capacitor) {
      const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
      await TextToSpeech.speak({ text, lang: "ko-KR", rate: 0.72, pitch: 1.0, volume: 1.0, category: "ambient" });
      setSpeakingNoticeId(null);
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ko-KR";
      utter.rate = 0.72;
      utter.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find((v) => v.lang === "ko-KR" && /female|여성|유나|Yuna|Sora|소라/i.test(v.name)) || voices.find((v) => v.lang === "ko-KR");
      if (koreanVoice) utter.voice = koreanVoice;
      utter.onend = () => setSpeakingNoticeId(null);
      window.speechSynthesis.speak(utter);
    }
  }

  async function speakFaqAnswer(faqId, text) {
    if (speakingFaqId === faqId) {
      if (typeof window !== "undefined" && window.Capacitor) {
        const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
        TextToSpeech.stop();
      } else if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingFaqId(null);
      return;
    }
      setSpeakingFaqId(faqId);
    if (typeof window !== "undefined" && window.Capacitor) {
      const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
      await TextToSpeech.speak({ text, lang: "ko-KR", rate: 0.72, pitch: 1.0, volume: 1.0, category: "ambient" });
      setSpeakingFaqId(null);
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ko-KR";
      utter.rate = 0.72;
      utter.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find((v) => v.lang === "ko-KR" && /female|여성|유나|Yuna|Sora|소라/i.test(v.name)) || voices.find((v) => v.lang === "ko-KR");
      if (koreanVoice) utter.voice = koreanVoice;
      utter.onend = () => setSpeakingFaqId(null);
      window.speechSynthesis.speak(utter);
    }
  }

    async function fetchFaqs() {
    const { data } = await supabase.from("faqs").select("*").order("display_order", { ascending: true });
    setFaqs(data || []);
  }

async function addFaq() {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) { showToast("질문과 답변을 모두 입력해주세요"); return; }
    const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.display_order)) : 0;
    const { error } = await supabase.from("faqs").insert({
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      display_order: maxOrder + 1,
    });
    if (error) { showToast("추가 실패: " + error.message); return; }
    setNewFaqQuestion("");
    setNewFaqAnswer("");
    fetchFaqs();
    showToast("FAQ가 추가됐어요!");
  }

  async function deleteFaq(id) {
    if (!window.confirm("이 질문을 삭제하시겠어요?")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) { showToast("삭제 실패: " + error.message); return; }
    fetchFaqs();
    showToast("삭제됐어요");
  }



    const [isTranslating, setIsTranslating] = useState(false);

  async function translatePlaceName() {
    if (!form.name || !form.name.trim()) {
      showToast("먼저 장소명을 입력해주세요");
      return;
    }
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("smooth-endpoint", {
        body: { text: form.name },
      });
      if (error || !data?.translated) {
        showToast("번역에 실패했어요");
        return;
      }
      setForm({ ...form, name: data.translated });
      showToast("번역됐어요!");
    } catch (err) {
      showToast("번역 중 오류가 발생했어요");
    } finally {
      setIsTranslating(false);
    }
  }

  async function fetchSplashImage() {
    const { data } = await supabase.from("app_settings").select("value").eq("key", "splash_image_url").single();
    setSplashImageUrl(data?.value || null);
  }

  async function handleSplashImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSplashUploading(true);
    const compressed = await compressImage(file, 1200, 0.85);
    const filePath = `splash_${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("app-assets").upload(filePath, compressed, { upsert: true });
    if (uploadError) { showToast("업로드 실패: " + uploadError.message); setSplashUploading(false); return; }
    const { data: urlData } = supabase.storage.from("app-assets").getPublicUrl(filePath);
    const newUrl = urlData.publicUrl;
    await supabase.from("app_settings").update({ value: newUrl }).eq("key", "splash_image_url");
    setSplashImageUrl(newUrl);
    setSplashUploading(false);
    showToast("시작 화면 이미지가 변경됐어요!");
  }

  async function removeSplashImage() {
    if (!window.confirm("시작 화면 이미지를 제거하시겠어요?")) return;
    await supabase.from("app_settings").update({ value: null }).eq("key", "splash_image_url");
    setSplashImageUrl(null);
    showToast("시작 화면 이미지가 제거됐어요");
  }

    async function captureAndRecognizeText() {
    setShowNameInputChoice(false);
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
      if (!photo?.base64String) return;
      setIsOcrProcessing(true);
const { data, error } = await supabase.functions.invoke("ocr-place-name", {
        body: { image: photo.base64String },
      });
      if (error || !data?.text) {
        alert("에러 상세: " + JSON.stringify(error) + " / data: " + JSON.stringify(data));
        showToast("글자를 인식하지 못했어요, 다시 시도해주세요");
        return;
      }
      const firstLine = data.text.split("\n")[0].trim();
      setForm((prev) => ({ ...prev, name: firstLine }));
      showToast("장소명이 입력됐어요! 확인해주세요");
    } catch (err) {
      showToast("사진 촬영에 실패했어요");
    } finally {
      setIsOcrProcessing(false);
    }
  }

 const [showVoiceHint, setShowVoiceHint] = useState(false);
const [showVoiceListeningUI, setShowVoiceListeningUI] = useState(false);
const [isSearchVoice, setIsSearchVoice] = useState(false);
const [voiceFaqAnswer, setVoiceFaqAnswer] = useState(null);
const [unrecognizedCommands, setUnrecognizedCommands] = useState([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceImageUrl, setMaintenanceImageUrl] = useState(null);
const [maintenanceUploading, setMaintenanceUploading] = useState(false);
  const [voiceCommandPage, setVoiceCommandPage] = useState(1);

async function startVoiceCommand() {
    try {
      if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
        const { SpeechRecognition } = await import("@capgo/capacitor-speech-recognition");
        const { available } = await SpeechRecognition.available();
        if (!available) { showToast("이 기기에서는 음성 명령을 지원하지 않아요"); return; }
        const permission = await SpeechRecognition.requestPermissions();
        if (permission.speechRecognition !== "granted") {
          showToast("마이크 권한을 허용해주세요");
          return;
        }
        setIsVoiceCommandListening(true);
        setIsSearchVoice(false);
        setShowVoiceListeningUI(true);
const result = await SpeechRecognition.start({ language: "ko-KR", popup: false });
        setIsVoiceCommandListening(false);
        setShowVoiceListeningUI(false);
const text = (result?.matches?.[0] || "").trim();
        processVoiceCommand(text);
      } else {
        showToast("음성 명령은 모바일 앱에서 사용 가능해요");
        setShowVoiceHint(false);
      }
} catch (err) {
      setIsVoiceCommandListening(false);
      setShowVoiceHint(false);
      setShowVoiceListeningUI(false);
    }
  }

function processVoiceCommand(text) {
    if (!text) { showToast("아무 말도 들리지 않았어요"); return; }
    if (text.includes("로그아웃")) {
      handleLogout();
    } else if (text.includes("마이페이지") || text.includes("내 페이지")) {
      setTab("my");
      showToast("마이페이지로 이동할게요");
    } else if (text.includes("홈")) {
      setTab("home");
      showToast("홈으로 이동할게요");
    } else if (text.includes("지도")) {
      setTab("map");
      showToast("지도로 이동할게요");
    } else if (text.includes("등록")) {
      setTab("register");
      showToast("등록 화면으로 이동할게요");
} else if ((text.includes("지워줘") || text.includes("지워") || text.includes("초기화")) && !text.includes("검색해줘")) {
      setQuery("");
      showToast("검색어를 지웠어요");
} else if (text.includes("안내문") || text.includes("안내 문") || text.includes("매장 안내") || text.includes("설명 카드")) {
      setShowShopExplainCard(true);
      showToast("안내문을 보여드릴게요");
} else if (text.replace(/\s/g, "").includes("앱종료") || text.replace(/\s/g, "").includes("어플종료") || text.replace(/\s/g, "").includes("어플꺼") || text.replace(/\s/g, "").includes("앱꺼") || text.replace(/\s/g, "").includes("종료해") || text.replace(/\s/g, "").includes("웹꺼")) {
      showToast("앱을 종료할게요");
      setTimeout(async () => {
        if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
          const { App } = await import("@capacitor/app");
          App.exitApp();
        }
      }, 800);
} else if (text.includes("날씨")) {
      announceTodayWeather();
    } else if (text.includes("공지")) {
      setTab("notice");
      showToast("공지사항으로 이동할게요");
} else if (voiceQaList && voiceQaList.length > 0 && voiceQaList.some((qa) => qa.keywords.some((k) => text.includes(k)))) {
      searchFaqByVoice(text);
} else if (places.some((p) => p.name === text || p.name.includes(text) || (p.name.length >= 2 && text.includes(p.name)))) {
      const matchedPlace = places.find((p) => p.name === text) || places.find((p) => p.name.includes(text)) || places.find((p) => p.name.length >= 2 && text.includes(p.name));
      setTab("map");
      setTimeout(() => focusOnPlace(matchedPlace.id), 300);
      showToast(`"${matchedPlace.name}"으로 이동할게요`);
} else if (text.includes("가까운") || text.includes("근처") || text.includes("주변")) {
      const keyword = text.replace(/가까운|근처|주변|검색해줘|찾아줘|검색|해줘|줘/g, "").trim();
      if (keyword) {
        setQuery(keyword);
        setTab("home");
        showToast(`가까운 "${keyword}"을 찾아드릴게요`);
      } else {
        showToast("무엇을 찾으시는지 말씀해주세요");
      }
    } else if (text.includes("검색해줘") || text.includes("찾아줘") || (text.length <= 6 && !text.includes(" "))) {
      const keyword = text.replace(/찾아줘|검색해줘|검색|해줘|줘/g, "").trim();
      if (keyword) {
        setQuery(keyword);
        setTab("home");
        showToast(`"${keyword}" 검색결과를 보여드릴게요`);
      } else {
        showToast("무엇을 찾으시는지 말씀해주세요");
      }
    } else {
      searchFaqByVoice(text);
    }
  }

  function tryFaqThenSearch(text) {
    if (faqs && faqs.length > 0) {
      const stopwords = ["어떻게", "하나요", "해요", "인가요", "무엇", "뭐", "좀", "요", "은", "는", "이", "가", "을", "를", "에", "의", "고", "싶어요", "싶어", "해줘", "알려줘", "찾아줘", "검색해줘", "검색"];
      function extractKeywords(str) {
        let cleaned = str.replace(/[?!.,]/g, "");
        stopwords.forEach((w) => { cleaned = cleaned.split(w).join(" "); });
        return cleaned.split(/\s+/).filter((w) => w.length >= 2);
      }
      const inputKeywords = extractKeywords(text);
      let bestMatch = null;
      let bestScore = 0;
      faqs.forEach((f) => {
        const faqKeywords = extractKeywords(f.question);
        const score = inputKeywords.filter((k) => faqKeywords.some((fk) => fk.includes(k) || k.includes(fk))).length;
        if (score > bestScore) { bestScore = score; bestMatch = f; }
      });
      if (bestScore > 0) {
        setVoiceFaqAnswer(bestMatch);
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(`${bestMatch.question.replace(/[?!.]+$/, "")}. ${bestMatch.answer}`);
          utterance.lang = "ko-KR";
          window.speechSynthesis.speak(utterance);
        }
        return;
      }
    }
    const keyword = text.replace(/찾아줘|검색해줘|검색|해줘|줘/g, "").trim();
    if (keyword) {
      setQuery(keyword);
      setTab("home");
      showToast(`"${keyword}" 검색결과를 보여드릴게요`);
    } else {
      showToast("무엇을 찾으시는지 말씀해주세요");
    }
  }

async function speakVoiceAnswer(text) {
    if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
      const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
      await TextToSpeech.speak({ text, lang: "ko-KR", rate: 1.0, pitch: 1.0, volume: 1.0, category: "ambient" });
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      window.speechSynthesis.speak(utterance);
    }
  }

  
function searchFaqByVoice(text) {
    const stopwords0 = ["어떻게", "하나요", "해요", "인가요", "무엇", "뭐", "좀", "요", "은", "는", "이", "가", "을", "를", "에", "의", "고"];
    function cleanForVoiceQa(str) {
      let c = str;
      stopwords0.forEach((w) => { c = c.split(w).join(""); });
      return c;
    }
    const cleanedText = cleanForVoiceQa(text);
    if (voiceQaList && voiceQaList.length > 0) {
      const qaMatch = voiceQaList.find((qa) => qa.keywords.some((k) => text.includes(k) || cleanedText.includes(k)));
if (qaMatch) {
        setVoiceFaqAnswer({ question: text, answer: qaMatch.answer });
        speakVoiceAnswer(qaMatch.answer);
        return;
      }
    }
    searchFaqByVoiceOriginal(text);
  }

  function searchFaqByVoiceOriginal(text) {
    if (!faqs || faqs.length === 0) {
      showToast(`"${text}"는 알 수 없는 명령이에요`);
      return;
    }
const stopwords = ["어떻게", "하나요", "해요", "인가요", "무엇", "뭐", "좀", "요", "은", "는", "이", "가", "을", "를", "에", "의", "고", "싶어요", "싶어", "해줘", "알려줘"];
    function extractKeywords(str) {
      let cleaned = str.replace(/[?!.,]/g, "");
      stopwords.forEach((w) => { cleaned = cleaned.split(w).join(" "); });
      return cleaned.split(/\s+/).filter((w) => w.length >= 2);
    }
    const inputKeywords = extractKeywords(text);
    let bestMatch = null;
    let bestScore = 0;
    faqs.forEach((f) => {
      const faqKeywords = extractKeywords(f.question);
      const score = inputKeywords.filter((k) => faqKeywords.some((fk) => fk.includes(k) || k.includes(fk))).length;
      if (score > bestScore) { bestScore = score; bestMatch = f; }
    });
const matched = bestScore > 0 ? bestMatch : null;
if (matched) {
      setVoiceFaqAnswer(matched);
      speakVoiceAnswer(`${matched.question.replace(/[?!.]+$/, "")}. ${matched.answer}`);
} else {
      setVoiceFaqAnswer({ question: text, answer: "__NOT_FOUND__" });
if (session?.user?.id) {
        supabase.from("unrecognized_voice_commands").insert({ user_id: session.user.id, spoken_text: text }).then(({ error }) => {
          if (error) console.error("저장 실패:", error.message);
        });
      }
    }
  }

    async function fetchMaintenanceMode() {
    const { data } = await supabase.from("app_settings").select("key, value").in("key", ["maintenance_mode", "maintenance_image_url"]);
    const map = {};
    (data || []).forEach((d) => { map[d.key] = d.value; });
    setMaintenanceMode(map.maintenance_mode === "true");
    setMaintenanceImageUrl(map.maintenance_image_url || null);
  }

  async function toggleMaintenanceMode() {
    const newValue = !maintenanceMode;
    setMaintenanceMode(newValue);
    await supabase.from("app_settings").update({ value: newValue ? "true" : "false" }).eq("key", "maintenance_mode");
    showToast(newValue ? "점검 모드가 켜졌어요" : "점검 모드가 꺼졌어요");
  }

  async function handleMaintenanceImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setMaintenanceUploading(true);
    const compressed = await compressImage(file, 1200, 0.85);
    const filePath = `maintenance_${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("app-assets").upload(filePath, compressed, { upsert: true });
    if (uploadError) { showToast("업로드 실패: " + uploadError.message); setMaintenanceUploading(false); return; }
    const { data: urlData } = supabase.storage.from("app-assets").getPublicUrl(filePath);
    const newUrl = urlData.publicUrl;
    await supabase.from("app_settings").update({ value: newUrl }).eq("key", "maintenance_image_url");
    setMaintenanceImageUrl(newUrl);
    setMaintenanceUploading(false);
    showToast("점검 안내 이미지가 변경됐어요!");
  }
  
  async function fetchVoiceQaList() {
    const { data } = await supabase.from("voice_qa").select("*").order("created_at", { ascending: false });
    setVoiceQaList(data || []);
  }

async function addVoiceQa() {
    if (!newVoiceQaKeywords.trim() || !newVoiceQaAnswer.trim()) { showToast("키워드와 답변을 모두 입력해주세요"); return; }
    const keywords = newVoiceQaKeywords.split(",").map((k) => k.trim()).filter((k) => k);
    if (editingVoiceQaId) {
      const { error } = await supabase.from("voice_qa").update({ keywords, answer: newVoiceQaAnswer.trim() }).eq("id", editingVoiceQaId);
      if (error) { showToast("수정 실패: " + error.message); return; }
      showToast("수정됐어요!");
      setEditingVoiceQaId(null);
    } else {
      const { error } = await supabase.from("voice_qa").insert({ keywords, answer: newVoiceQaAnswer.trim() });
      if (error) { showToast("등록 실패: " + error.message); return; }
      showToast("음성 질문-답변이 등록됐어요!");
    }
    setNewVoiceQaKeywords("");
    setNewVoiceQaAnswer("");
    fetchVoiceQaList();
  }

  function startEditVoiceQa(qa) {
    setEditingVoiceQaId(qa.id);
    setNewVoiceQaKeywords(qa.keywords.join(", "));
    setNewVoiceQaAnswer(qa.answer);
    document.getElementById("admin-voice-qa")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function deleteVoiceQa(id) {
    if (!window.confirm("삭제하시겠어요?")) return;
    await supabase.from("voice_qa").delete().eq("id", id);
    fetchVoiceQaList();
  }

    function calcDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function fetchMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }

    const micLongPressTimer = useRef(null);
  function handleMicPressStart() {
    micLongPressTimer.current = setTimeout(() => {
      setIsMicDragMode(true);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 600);
  }
  function handleMicPressEnd() {
    clearTimeout(micLongPressTimer.current);
  }
  function handleMicDrag(e) {
    if (!isMicDragMode) return;
    const touch = e.touches ? e.touches[0] : e;
    const percent = (touch.clientX / window.innerWidth) * 100;
    const clamped = Math.max(10, Math.min(90, percent));
    setMicPositionPercent(clamped);
  }
function handleMicDragEnd() {
    if (!isMicDragMode) return;
    setIsMicDragMode(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("mic_position_percent", micPositionPercent.toString());
    }
    setShowMicSavedBadge(true);
    setTimeout(() => setShowMicSavedBadge(false), 1500);
  }

    async function fetchMyPageWeather() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,is_day`);
          const data = await res.json();
          if (data.current) {
            setMyPageWeather({ code: data.current.weather_code, isDay: data.current.is_day === 1 });
          }
        } catch (e) {}
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

function getWeatherEffect(weather) {
    if (!weather) return null;
    const { code, isDay } = weather;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return "rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
    if ([1, 2, 3, 45, 48].includes(code)) return isDay ? "cloudy_day" : "cloudy_night";
    return isDay ? "sunny" : "clear_night";
  }

  function getWeatherDescription(code) {
    if ([0].includes(code)) return "맑아요";
    if ([1, 2, 3].includes(code)) return "구름이 있어요";
    if ([45, 48].includes(code)) return "안개가 꼈어요";
    if ([51, 53, 55].includes(code)) return "이슬비가 내려요";
    if ([61, 63, 65].includes(code)) return "비가 내려요";
    if ([80, 81, 82].includes(code)) return "소나기가 내려요";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "눈이 내려요";
    if ([95, 96, 99].includes(code)) return "천둥번개가 쳐요";
    return "날씨 정보를 확인했어요";
  }

  async function announceTodayWeather() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      showToast("위치 정보를 사용할 수 없어요");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,temperature_2m,is_day`);
          const data = await res.json();
          if (data.current) {
            const desc = getWeatherDescription(data.current.weather_code);
            const temp = Math.round(data.current.temperature_2m);
            const text = `오늘 날씨는 ${temp}도, ${desc}`;
            setVoiceFaqAnswer({ question: "오늘 날씨", answer: text });
            speakVoiceAnswer(text);
          }
        } catch (e) {
          showToast("날씨 정보를 가져오지 못했어요");
        }
      },
      () => showToast("위치 권한을 확인해주세요"),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }
  
  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 10000);
  }
  const [justRegistered, setJustRegistered] = useState(null);
  const [form, setForm] = useState({
    name: "", address: "", addressDetail: "", category: "공공기관", keywords: "", phone: "",
    badges: { ramp: false, door: false, stroller: false, lift: false },
    businessHours: DEFAULT_HOURS,
    useHours: false,
    openHolidays: [],
    hoursMode: "custom",
    sameOpen: "09:00",
    sameClose: "18:00",
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
  const [adjustLogPage, setAdjustLogPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [showCouponPop, setShowCouponPop] = useState(false);
    const [allReports, setAllReports] = useState([]);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [individualNotifDrafts, setIndividualNotifDrafts] = useState({});
  const [notifTarget, setNotifTarget] = useState("notice");
  const [notifNoticeId, setNotifNoticeId] = useState("");
  const [adminNoteDrafts, setAdminNoteDrafts] = useState({});
  const mapContainerRef = useRef(null);
  const fullscreenMapContainerRef = useRef(null);
  const fullscreenMapInstanceRef = useRef(null);
  const fullscreenMarkersRef = useRef({});
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
  const [showDuplicatePlace, setShowDuplicatePlace] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [myCoupons, setMyCoupons] = useState([]);
  const [viewingCoupon, setViewingCoupon] = useState(null);
   const [confirmingUseCoupon, setConfirmingUseCoupon] = useState(null);
  const [allCoupons, setAllCoupons] = useState([]);
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [viewingReviewsPlace, setViewingReviewsPlace] = useState(null);
  const [placeReviews, setPlaceReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [showRecencyHelp, setShowRecencyHelp] = useState(false);
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false);
  const [speakingNoticeId, setSpeakingNoticeId] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [showRankingPolicy, setShowRankingPolicy] = useState(false);
  const [monthlyWinners, setMonthlyWinners] = useState(null);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [rankingCouponResponses, setRankingCouponResponses] = useState(null);
    const [showFAQ, setShowFAQ] = useState(false);
  const [faqVoiceOn, setFaqVoiceOn] = useState(false);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [speakingFaqId, setSpeakingFaqId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [faqAdminPage, setFaqAdminPage] = useState(1);
  const [noticeAdminPage, setNoticeAdminPage] = useState(1);
  const [campaignAdminPage, setCampaignAdminPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
    const [sessionConflict, setSessionConflict] = useState(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [guardians, setGuardians] = useState([]);
  const [newGuardianEmail, setNewGuardianEmail] = useState("");
  const [sendingSOS, setSendingSOS] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [placeContextMenu, setPlaceContextMenu] = useState(null);
  const [splashImageUrl, setSplashImageUrl] = useState(null);
  const [splashUploading, setSplashUploading] = useState(false);
  const [showBrandSplash, setShowBrandSplash] = useState(false);

useEffect(() => {
    let cancelled = false;
    async function checkSplash() {
      if (typeof window === "undefined" || !window.Capacitor || !window.Capacitor.isNativePlatform()) return;
      const { data } = await supabase.from("app_settings").select("value").eq("key", "splash_image_url").single();
      if (cancelled) return;
      setSplashImageUrl(data?.value || null);
      if (data?.value) {
        setShowBrandSplash(true);
        setTimeout(() => { if (!cancelled) setShowBrandSplash(false); }, 3000);
      }
    }
    checkSplash();
    return () => { cancelled = true; };
  }, []);
  const [showBizInfo, setShowBizInfo] = useState(false);
  const [memberSort, setMemberSort] = useState("points_desc");
  const [memberFilter, setMemberFilter] = useState("all");
  const [memberPage, setMemberPage] = useState(1);
  const [newInquiryCount, setNewInquiryCount] = useState(0);
  const [newRankingResponseCount, setNewRankingResponseCount] = useState(0);
  const [fullscreenCenter, setFullscreenCenter] = useState(null);
const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const showDeleteAccountRef = useRef(false);
  useEffect(() => { showDeleteAccountRef.current = showDeleteAccount; }, [showDeleteAccount]);
  const [logoWeather, setLogoWeather] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [mySessionToken, setMySessionToken] = useState(null);
  const mySessionTokenRef = useRef(null);
  
  const [responseMonthFilter, setResponseMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const audioRefs = useRef({});
  const [nicknamePromptDraft, setNicknamePromptDraft] = useState("");
  const [pointRanking, setPointRanking] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const scrollSentinelRef = useRef(null);
  const [compressionProgress, setCompressionProgress] = useState(null);
  const [shareLink, setShareLink] = useState(null);
  const [expandedNoticeAdminId, setExpandedNoticeAdminId] = useState(null);
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [expandedInquiryAdminId, setExpandedInquiryAdminId] = useState(null);
   const [isAdminEditingPlace, setIsAdminEditingPlace] = useState(false);
  const [navbarOffset, setNavbarOffset] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [tabsHeight, setTabsHeight] = useState(0);
  const navbarRef = useRef(null);
  const tabsRef = useRef(null);
  const logoAreaRef = useRef(null);
  const rightAreaRef = useRef(null);
  const [menuOffset, setMenuOffset] = useState(0);
  const pendingCouponAnnounce = useRef(false);
  const [couponDrafts, setCouponDrafts] = useState({});
  const [couponImageFile, setCouponImageFile] = useState(null);
  const [couponImagePreview, setCouponImagePreview] = useState(null);
  const [showCouponList, setShowCouponList] = useState(false);
  const swipeStartX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const pinchStartDistance = useRef(null);
  const pinchStartScale = useRef(1);
  const previewImagesRef = useRef([]);
  const tabRef = useRef("home");
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  useEffect(() => { previewImagesRef.current = previewImages; }, [previewImages]);
  useEffect(() => { tabRef.current = tab; }, [tab]);
const viewingReviewsPlaceRef = useRef(null);
  useEffect(() => { viewingReviewsPlaceRef.current = viewingReviewsPlace; }, [viewingReviewsPlace]);
const showFAQRef = useRef(false);
  
useEffect(() => { showFAQRef.current = showFAQ; }, [showFAQ]);
  useEffect(() => {
    let scrollTimer;
    function handleScroll() {
      setShowVoiceButton(false);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setShowVoiceButton(true), 400);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { window.removeEventListener("scroll", handleScroll); clearTimeout(scrollTimer); };
  }, []);
const showRankingPolicyRef = useRef(false);
const voiceFaqAnswerRef = useRef(null);
useEffect(() => { showRankingPolicyRef.current = showRankingPolicy; }, [showRankingPolicy]);
useEffect(() => { voiceFaqAnswerRef.current = voiceFaqAnswer; }, [voiceFaqAnswer]);
const showFavoritesOnlyRef = useRef(false);
  useEffect(() => { showFavoritesOnlyRef.current = showFavoritesOnly; }, [showFavoritesOnly]);
  const isMapFullscreenRef = useRef(false);
  useEffect(() => { isMapFullscreenRef.current = isMapFullscreen; }, [isMapFullscreen]);
  const placeContextMenuRef = useRef(null);
  useEffect(() => { placeContextMenuRef.current = placeContextMenu; }, [placeContextMenu]);
  const showCouponPopRef = useRef(false);
  useEffect(() => { showCouponPopRef.current = showCouponPop; }, [showCouponPop]);
  const sessionRef = useRef(null);
  useEffect(() => { sessionRef.current = session; }, [session]);
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
    let stateSubPromise;
    import("@capacitor/app").then(({ App }) => {
      stateSubPromise = App.addListener("appStateChange", ({ isActive }) => {
        if (!isActive) {
          import("@capacitor-community/text-to-speech").then(({ TextToSpeech }) => {
            TextToSpeech.stop();
          });
          setSpeakingNoticeId(null);
          setSpeakingFaqId(null);
        }
      });
    });
    return () => { if (stateSubPromise) stateSubPromise.then((s) => s.remove()); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.Capacitor) return;
    let subPromise;
    import("@capacitor/app").then(({ App }) => {
      subPromise = App.addListener("backButton", () => {
        if (previewImagesRef.current.length > 0) {
          setPreviewImages([]);
          setImageScale(1);
        } else if (placeContextMenuRef.current) {
          setPlaceContextMenu(null);
        } else if (showCouponPopRef.current) {
          setShowCouponPop(false);
        } else if (isMapFullscreenRef.current) {
          setIsMapFullscreen(false);
        } else if (showFavoritesOnlyRef.current) {
          setShowFavoritesOnly(false);
        } else if (showFAQRef.current) {
          setShowFAQ(false);
          if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
          setSpeakingFaqId(null);
} else if (showDoorTypeHelpRef.current) {
          setShowDoorTypeHelp(false);
        } else if (showTurningHelpRef.current) {
          setShowTurningHelp(false);
        } else if (showElevatorHelpRef.current) {
          setShowElevatorHelp(false);
        } else if (showShopExplainCardRef.current) {
          setShowShopExplainCard(false);
} else if (showDeleteAccountRef.current) {
          setShowDeleteAccount(false);
        } else if (viewingDetailPlaceRef.current) {
          setViewingDetailPlace(null);
        } else if (voiceFaqAnswerRef.current) {
          setVoiceFaqAnswer(null);
          if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
        } else if (showRankingPolicyRef.current) {
          setShowRankingPolicy(false);
        } else if (viewingReviewsPlaceRef.current) {
          setViewingReviewsPlace(null);
        } else if (!sessionRef.current) {
          setShowExitConfirm(true);
        } else if (tabRef.current !== "home") {
          setTab("home");
        } else {
          setShowExitConfirm(true);
        }
      });
    });
    return () => { if (subPromise) subPromise.then((s) => s.remove()); };
  }, []);
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

              function addMarker(placeId, lat, lng, name, category) {
      const position = new kakao.maps.LatLng(lat, lng);
      const marker = new kakao.maps.Marker({ position, map, image: createCategoryMarkerImage(kakao, category) });
      const infowindow = new kakao.maps.InfoWindow({ content: `<div style="padding:6px 10px;font-size:12px;">${name}</div>` });
      kakao.maps.event.addListener(marker, "click", () => infowindow.open(map, marker));
      markersRef.current[placeId] = { marker, infowindow, position };
      if (placeId === pendingFocusId) {
        map.setCenter(position);
        map.setLevel(3);
        infowindow.open(map, marker);
        setPendingFocusId(null);
        setTimeout(() => {
          mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }

    filtered.forEach((place) => {
      if (place.lat && place.lng) {
        addMarker(place.id, place.lat, place.lng, place.name, place.category);
      } else if (place.address) {
        geocoder.addressSearch(place.address, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            addMarker(place.id, parseFloat(result[0].y), parseFloat(result[0].x), place.name, place.category);
          }
        });
      }
    });
  }, [tab, kakaoLoaded, mapCategory, places]);

  useEffect(() => {
    if (!isMapFullscreen || !kakaoLoaded || !fullscreenMapContainerRef.current) return;
    const kakao = window.kakao;
    const center = fullscreenCenter
      ? new kakao.maps.LatLng(fullscreenCenter.lat, fullscreenCenter.lng)
      : (myLocation ? new kakao.maps.LatLng(myLocation.lat, myLocation.lng) : new kakao.maps.LatLng(37.5665, 126.9780));
    const map = new kakao.maps.Map(fullscreenMapContainerRef.current, { center, level: fullscreenCenter?.level || (myLocation ? 4 : 6) });
    fullscreenMapInstanceRef.current = map;
    fullscreenMarkersRef.current = {};
    const geocoder = new kakao.maps.services.Geocoder();
    const filtered = mapCategory ? places.filter((p) => p.category === mapCategory) : places;

    function addMarker(placeId, lat, lng, name, category) {
      const position = new kakao.maps.LatLng(lat, lng);
      const marker = new kakao.maps.Marker({ position, map, image: createCategoryMarkerImage(kakao, category) });
      const infowindow = new kakao.maps.InfoWindow({ content: `<div style="padding:6px 10px;font-size:12px;">${name}</div>` });
      kakao.maps.event.addListener(marker, "click", () => infowindow.open(map, marker));
      fullscreenMarkersRef.current[placeId] = { marker, infowindow, position };
    }

    filtered.forEach((place) => {
      if (place.lat && place.lng) {
        addMarker(place.id, place.lat, place.lng, place.name, place.category);
      } else if (place.address) {
        geocoder.addressSearch(place.address, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            addMarker(place.id, parseFloat(result[0].y), parseFloat(result[0].x), place.name, place.category);
          }
        });
      }
    });
  }, [isMapFullscreen, kakaoLoaded, mapCategory, places, myLocation]);
  
  useEffect(() => {
    if (campaigns.length <= 1) return;
    const timer = setInterval(() => {
      setCampaignIndex((i) => (i + 1) % campaigns.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [campaigns]);

  function handleSwipeStart(e) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistance.current = Math.sqrt(dx * dx + dy * dy);
      pinchStartScale.current = imageScale;
      return;
    }
    swipeStartX.current = e.touches[0].clientX;
    didSwipe.current = false;
  }
  function handlePinchMove(e) {
    if (e.touches.length === 2 && pinchStartDistance.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scale = Math.min(Math.max(pinchStartScale.current * (distance / pinchStartDistance.current), 1), 4);
      setImageScale(scale);
    }
  }
  function handleSwipeEnd(e) {
    if (pinchStartDistance.current) {
      pinchStartDistance.current = null;
      return;
    }
    const diff = e.changedTouches[0].clientX - swipeStartX.current;
    if (Math.abs(diff) < 50) return;
    didSwipe.current = true;
    if (diff < 0 && previewIndex < previewImages.length - 1) {
      setPreviewIndex(previewIndex + 1);
      setImageScale(1);
    } else if (diff > 0 && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
      setImageScale(1);
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

  async function fetchReviews(placeId) {
    const { data: reviews } = await supabase.from("place_reviews").select("*").eq("place_id", placeId).order("created_at", { ascending: false });
    if (!reviews || reviews.length === 0) { setPlaceReviews([]); return; }
    const userIds = [...new Set(reviews.map((r) => r.user_id))];
    const { data: profilesData } = await supabase.from("profiles").select("id, nickname").in("id", userIds);
    const nicknameMap = {};
    (profilesData || []).forEach((p) => { nicknameMap[p.id] = p.nickname; });
    const merged = reviews.map((r) => ({ ...r, profiles: { nickname: nicknameMap[r.user_id] } }));
    setPlaceReviews(merged);
  }
  async function submitReview() {
    if (!newReviewText.trim()) return;
    const { error } = await supabase.from("place_reviews").insert({ place_id: viewingReviewsPlace.id, user_id: session.user.id, content: newReviewText.trim() });
    if (error) { showToast("리뷰 등록 실패: " + error.message); return; }
    setNewReviewText("");
    fetchReviews(viewingReviewsPlace.id);
    showToast("리뷰가 등록됐어요");
  }
  async function deleteReview(reviewId) {
    if (!window.confirm("이 리뷰를 삭제하시겠어요?")) return;
    const { error } = await supabase.from("place_reviews").delete().eq("id", reviewId);
    if (error) { showToast("삭제 실패: " + error.message); return; }
    fetchReviews(viewingReviewsPlace.id);
    showToast("리뷰가 삭제됐어요");
  }

    async function confirmPlaceInfo(placeId) {
    const { error } = await supabase.rpc("confirm_place_info", { p_place_id: placeId });
    if (error) { showToast("처리 실패: " + error.message); return; }
    fetchPlaces();
    showToast("확인해주셔서 감사해요! 다른 분들에게 도움이 돼요");
  }

  async function createFavoriteShareLink() {
    const { data, error } = await supabase.rpc("create_favorite_share");
    if (error) { showToast(error.message.includes("없어요") ? "즐겨찾기한 장소가 없어요" : "공유 링크 생성 실패: " + error.message); return; }
    const url = `https://jangpyeon.kr/share/${data}`;
    setShareLink(url);
  }
  
    async function runBulkCompression() {
    if (!window.confirm("기존에 올라간 모든 사진을 압축합니다. 되돌릴 수 없어요. 계속할까요?")) return;

    const buckets = [
      { name: "place-photos", table: "place_photos", column: "photo_url", maxWidth: 1200 },
      { name: "notice-attachments", table: "notices", column: "image_url", maxWidth: 1200 },
      { name: "coupon-images", table: "coupons", column: "image_url", maxWidth: 1200 },
      { name: "avatars", table: "profiles", column: "avatar_url", maxWidth: 600 },
    ];

    let totalDone = 0;
    let totalFailed = 0;

    for (const bucket of buckets) {
      const { data: rows } = await supabase.from(bucket.table).select(`id, ${bucket.column}`).not(bucket.column, "is", null);
      if (!rows) continue;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const url = row[bucket.column];
        if (!url) continue;

        setCompressionProgress({ bucket: bucket.name, current: i + 1, total: rows.length });

        try {
          const cleanUrl = url.split("?")[0];
          const pathParts = cleanUrl.split(`/${bucket.name}/`);
          if (pathParts.length < 2) continue;
          const filePath = pathParts[1];

          const originalFile = await urlToFile(url, filePath.split("/").pop());
          const compressedFile = await compressImage(originalFile, bucket.maxWidth, 0.85);

                    const jpgFilePath = filePath.replace(/\.[^.]+$/, ".jpg");
          const { error: uploadError } = await supabase.storage.from(bucket.name).upload(jpgFilePath, compressedFile, { upsert: true, contentType: "image/jpeg" });
          if (uploadError) { totalFailed++; continue; }

          if (jpgFilePath !== filePath) {
            const { data: urlData } = supabase.storage.from(bucket.name).getPublicUrl(jpgFilePath);
            await supabase.from(bucket.table).update({ [bucket.column]: urlData.publicUrl }).eq("id", row.id);
          }
           totalDone++;
          
        } catch (err) {
          totalFailed++;
        }
      }
    }

    setCompressionProgress(null);
    showToast(`압축 완료! 성공 ${totalDone}장, 실패 ${totalFailed}장`);
  }

  async function setHomeLocation() {
    if (!navigator.geolocation) { showToast("이 기기에서는 위치 확인이 안 돼요"); return; }
    showToast("위치를 확인하고 있어요...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let addr = "내 동네";
        if (window.kakao) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          await new Promise((resolve) => {
            geocoder.coord2Address(longitude, latitude, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK && result[0]) {
                addr = result[0].address?.region_2depth_name + " " + (result[0].address?.region_3depth_name || "");
              }
              resolve();
            });
          });
        }
        const { error } = await supabase.from("profiles").update({ home_lat: latitude, home_lng: longitude, home_address: addr }).eq("id", session.user.id);
        if (error) { showToast("설정 실패: " + error.message); return; }
        setProfile((prev) => ({ ...prev, home_lat: latitude, home_lng: longitude, home_address: addr }));
        showToast(`내 동네가 "${addr}"(으)로 설정됐어요!`);
      },
      () => showToast("위치 정보를 가져올 수 없어요, 위치 권한을 확인해주세요"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
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

  async function saveNicknameFromPrompt() {
    if (nicknamePromptDraft.trim()) {
      const { error } = await supabase.from("profiles").update({ nickname: nicknamePromptDraft.trim() }).eq("id", session.user.id);
      if (!error) {
        setProfile((prev) => ({ ...prev, nickname: nicknamePromptDraft.trim() }));
        showToast("닉네임이 설정됐어요!");
      }
    }
    localStorage.setItem("jangpyeon_nickname_prompt_dismissed", "true");
    setShowNicknamePrompt(false);
  }
  function dismissNicknamePrompt() {
    localStorage.setItem(`jangpyeon_nickname_prompt_dismissed_${session.user.id}`, "true");
    setShowNicknamePrompt(false);
  }

  async function uploadCardBackground(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!window.confirm("이 사진은 본인에게만 보여요. 부적절하거나 타인의 저작권을 침해하는 사진은 삼가주세요. 계속하시겠어요?")) {
      e.target.value = "";
      return;
    }
    const compressed = await compressImage(file, 800, 0.85);
    const filePath = `${session.user.id}/card-bg-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, compressed, { upsert: true });
    if (uploadError) { showToast("업로드 실패: " + uploadError.message); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const newUrl = urlData.publicUrl + "?t=" + Date.now();
    const { error } = await supabase.from("profiles").update({ card_background_url: newUrl, card_theme: "photo" }).eq("id", session.user.id);
    if (error) { showToast("저장 실패: " + error.message); return; }
    setProfile((prev) => ({ ...prev, card_background_url: newUrl, card_theme: "photo" }));
    showToast("배경 사진이 변경됐어요!");
  }

const [kakaoLoggingIn, setKakaoLoggingIn] = useState(false);
const [showKakaoEmailInfo, setShowKakaoEmailInfo] = useState(false);
  const [showNameInputChoice, setShowNameInputChoice] = useState(false);
const [isOcrProcessing, setIsOcrProcessing] = useState(false);
const [isNameInputManual, setIsNameInputManual] = useState(false);
const [showFullEmail, setShowFullEmail] = useState(false);
const [noticePage, setNoticePage] = useState(1);
const [isVoiceCommandListening, setIsVoiceCommandListening] = useState(false);
  const [voiceQaList, setVoiceQaList] = useState([]);
  const [newVoiceQaKeywords, setNewVoiceQaKeywords] = useState("");
const [newVoiceQaAnswer, setNewVoiceQaAnswer] = useState("");
const [voiceQaPage, setVoiceQaPage] = useState(1);
const [openFilterActive, setOpenFilterActive] = useState(false);
const [showShopExplainCard, setShowShopExplainCard] = useState(false);
const [mapAccessFilter, setMapAccessFilter] = useState(null);
const [showAccessPicker, setShowAccessPicker] = useState(false);
const [faqPage, setFaqPage] = useState(1);
  const [showElevatorHelp, setShowElevatorHelp] = useState(false);
const [myPageWeather, setMyPageWeather] = useState(null);
  const [weatherEffectOn, setWeatherEffectOn] = useState(true);
  const showElevatorHelpRef = useRef(false);
  useEffect(() => { showElevatorHelpRef.current = showElevatorHelp; }, [showElevatorHelp]);
const [showTurningHelp, setShowTurningHelp] = useState(false);
  const showTurningHelpRef = useRef(false);
  useEffect(() => { showTurningHelpRef.current = showTurningHelp; }, [showTurningHelp]);
  const [showDoorTypeHelp, setShowDoorTypeHelp] = useState(false);
  const showDoorTypeHelpRef = useRef(false);
  useEffect(() => { showDoorTypeHelpRef.current = showDoorTypeHelp; }, [showDoorTypeHelp]);
const [viewingDetailPlace, setViewingDetailPlace] = useState(null);
  const viewingDetailPlaceRef = useRef(null);
  useEffect(() => { viewingDetailPlaceRef.current = viewingDetailPlace; }, [viewingDetailPlace]);
  const [micPositionPercent, setMicPositionPercent] = useState(50);
const [isMicDragMode, setIsMicDragMode] = useState(false);
  const [showMicSavedBadge, setShowMicSavedBadge] = useState(false);
  const showShopExplainCardRef = useRef(false);
  useEffect(() => { showShopExplainCardRef.current = showShopExplainCard; }, [showShopExplainCard]);
  const [distanceFilter, setDistanceFilter] = useState(null);
  const [showDistancePicker, setShowDistancePicker] = useState(false);
  const [editingVoiceQaId, setEditingVoiceQaId] = useState(null);
  const [showVoiceButton, setShowVoiceButton] = useState(true);
const [myRank, setMyRank] = useState(0);
  const [showRankToggle, setShowRankToggle] = useState(false);
  async function signInWithKakao() {
    if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
      setKakaoLoggingIn(true);
      try {
        const { KakaoLoginPlugin } = await import("@kichunsung/capacitor-kakao-login-plugin");
        const loginResult = await KakaoLoginPlugin.goLogin();
        if (!loginResult?.success || !loginResult?.idToken) {
          showToast("카카오 로그인에 실패했어요, 다시 시도해주세요");
          return;
        }
        const base64Payload = loginResult.idToken.split(".")[1];
        const decodedPayload = decodeURIComponent(
          atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"))
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
const payload = JSON.parse(decodedPayload);
        if (payload.email) {
          const { data: canSignup } = await supabase.rpc("can_signup", { p_email: payload.email });
          if (canSignup === false) {
            showToast("탈퇴 후 7일간은 같은 계정으로 다시 가입하실 수 없어요");
            return;
          }
        }
        const { data, error } = await supabase.functions.invoke("kakao-auth", {
          body: {
            kakaoId: payload.sub,
            email: payload.email,
            emailVerified: !!payload.email,
            nickname: payload.nickname || payload.name,
            picture: payload.picture,
          },
        });
        if (error || !data?.token_hash) {
          showToast("카카오 로그인 실패, 다시 시도해주세요");
          return;
        }
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: "magiclink",
          token_hash: data.token_hash,
        });
        if (verifyError) { showToast("카카오 로그인 실패: " + verifyError.message); }
      } catch (err) {
        alert("에러 상세: " + err?.message + " / 전체: " + JSON.stringify(err));
      } finally {
        setKakaoLoggingIn(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: "https://jangpyeon.kr/" },
      });
      if (error) { showToast("카카오 로그인 실패: " + error.message); }
    }
  }
  async function signInWithGoogle() {
    if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
            try {
        const { SocialLogin } = await import("@capgo/capacitor-social-login");
        await SocialLogin.initialize({
          google: {
            webClientId: "578266178904-s7jkmgoqvbvanv7t45nlmmgar91ejcuo.apps.googleusercontent.com",
          },
        });
          const res = await SocialLogin.login({
          provider: "google",
          options: { scopes: ["email", "profile"], style: "standard", filterByAuthorizedAccounts: false },
        });
const idToken = res.result.idToken;
        const emailPayload = JSON.parse(atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (emailPayload.email) {
          const { data: canSignup } = await supabase.rpc("can_signup", { p_email: emailPayload.email });
          if (canSignup === false) {
            showToast("탈퇴 후 7일간은 같은 계정으로 다시 가입하실 수 없어요");
            return;
          }
        }
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });
        if (error) { showToast("구글 로그인 실패: " + error.message); }
             } catch (err) {
        if (err?.code === "USER_CANCELLED" || err?.message?.includes("cancelled")) {
          showToast("구글 로그인이 취소됐어요");
        } else if (err?.message?.includes("access_denied") || err?.message?.includes("not authorized") || err?.message?.includes("reauth")) {
          showToast("죄송해요, 지금은 베타 테스트 기간이라 등록된 분만 구글 로그인이 가능해요");
        } else {
          showToast("구글 로그인에 실패했어요, 다시 시도해주세요");
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "https://jangpyeon.kr/" },
      });
      if (error) { showToast("구글 로그인 실패: " + error.message); }
    }
  }
  async function deleteMyAccount() {
    const { error } = await supabase.rpc("delete_my_account");
    if (error) { showToast("탈퇴 실패: " + error.message); return; }
    localStorage.clear();
    window.location.href = "/";
  }
  
    function getMyInviteLink() {
    return `https://jangpyeon.kr/?invite=${session.user.id}`;
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(getMyInviteLink());
    showToast("초대 링크가 복사됐어요!");
  }

    async function fetchGuardians() {
    const { data, error } = await supabase.rpc("get_my_guardians");
    if (!error) setGuardians(data || []);
  }

  async function addGuardian() {
    if (!newGuardianEmail.trim()) { showToast("이메일을 입력해주세요"); return; }
    const { error } = await supabase.rpc("add_guardian", { p_guardian_email: newGuardianEmail.trim() });
    if (error) { showToast("등록 실패: " + error.message); return; }
    setNewGuardianEmail("");
    fetchGuardians();
    showToast("보호자가 등록됐어요!");
  }

  async function removeGuardianFn(id) {
    if (!window.confirm("이 보호자를 삭제하시겠어요?")) return;
    const { error } = await supabase.rpc("remove_guardian", { p_guardian_id: id });
    if (error) { showToast("삭제 실패: " + error.message); return; }
    fetchGuardians();
    showToast("삭제됐어요");
  }

  async function sendSOSAlert() {
    if (!navigator.geolocation) { showToast("이 기기에서는 위치 확인이 안 돼요"); return; }
    if (!window.confirm("등록된 보호자에게 현재 위치와 함께 도움 요청 알림을 보낼까요?")) return;
    setSendingSOS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { data: guardianList } = await supabase.rpc("get_my_guardian_user_ids");
        if (!guardianList || guardianList.length === 0) {
          setSendingSOS(false);
          showToast("등록된 보호자가 없어요. 마이페이지에서 먼저 보호자를 등록해주세요");
          return;
        }
        const userIds = guardianList.map((g) => g.guardian_user_id);
        const mapLink = `https://map.kakao.com/link/map/${latitude},${longitude}`;
        const nickname = profile?.nickname || session.user.email;
        try {
          await fetch("https://xyyewfqfurtrzfonplat.supabase.co/functions/v1/swift-endpoint", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              title: "🆘 긴급 도움 요청",
              body: `${nickname}님이 도움이 필요해요. 위치: ${mapLink}`,
              userIds,
              target: "home",
            }),
          });
          showToast("보호자에게 위치를 전송했어요!");
        } catch (err) {
          showToast("전송에 실패했어요, 다시 시도해주세요");
        }
        setSendingSOS(false);
      },
      () => { setSendingSOS(false); showToast("위치 정보를 가져올 수 없어요, 위치 권한을 확인해주세요"); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }
  
   async function changeCardTheme(themeKey) {
    const { error } = await supabase.from("profiles").update({ card_theme: themeKey }).eq("id", session.user.id);
    if (error) { showToast("변경 실패: " + error.message); return; }
    setProfile((prev) => ({ ...prev, card_theme: themeKey }));
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
    const compressed = await compressImage(file, 600, 0.85);
    setAvatarFile(compressed);
    const filePath = `${session.user.id}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, compressed, { upsert: true });
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function createCategoryMarkerImage(kakao, category) {
    const meta = CATEGORY_MARKERS[category] || { emoji: "📍", color: "#0F6E62" };
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
        <path d="M20 0C9 0 0 9 0 20c0 15 20 32 20 32s20-17 20-32C40 9 31 0 20 0z" fill="${meta.color}" stroke="#fff" stroke-width="2"/>
        <circle cx="20" cy="19" r="14" fill="#fff"/>
        <text x="20" y="25" font-size="16" text-anchor="middle">${meta.emoji}</text>
      </svg>
    `;
    return new kakao.maps.MarkerImage(
      "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg))),
      new kakao.maps.Size(40, 52),
      { offset: new kakao.maps.Point(20, 52) }
    );
  }
  
  function focusOnPlace(placeId) {
    const entry = markersRef.current[placeId];
    if (!entry || !mapInstanceRef.current) return;
    mapInstanceRef.current.setCenter(entry.position);
    mapInstanceRef.current.setLevel(3);
    entry.infowindow.open(mapInstanceRef.current, entry.marker);
    mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    function updateMenuOffset() {
      if (logoAreaRef.current && rightAreaRef.current) {
        const logoWidth = logoAreaRef.current.offsetWidth;
        const rightWidth = rightAreaRef.current.offsetWidth;
        setMenuOffset((logoWidth - rightWidth) / 2);
      }
    }
    updateMenuOffset();
    window.addEventListener("resize", updateMenuOffset);
    return () => window.removeEventListener("resize", updateMenuOffset);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!session || (session.user.email !== ADMIN_EMAIL && profile?.role !== "staff")) return;
    fetchAllInquiries();
    fetchNewRankingResponseCount();
    const interval = setInterval(() => { fetchAllInquiries(); fetchNewRankingResponseCount(); }, 30000);
    return () => clearInterval(interval);
  }, [session, profile?.role]);

useEffect(() => {
    fetchMaintenanceMode();
    const interval = setInterval(fetchMaintenanceMode, 15000);
    return () => clearInterval(interval);
  }, []);

useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("mic_position_percent");
    if (saved) setMicPositionPercent(parseFloat(saved));
    const savedWeather = localStorage.getItem("weather_effect_on");
    if (savedWeather === "false") setWeatherEffectOn(false);
  }, []);

useEffect(() => {
    if (session && tab === "my" && !myPageWeather) fetchMyPageWeather();
  }, [session, tab]);

  useEffect(() => {
    if (session && tab === "home" && !myLocation) locateMe();
  }, [session, tab]);

  useEffect(() => {
    if (!session || !mySessionToken) return;
    const interval = setInterval(async () => {
      if (sessionConflict) return;
      const { data } = await supabase.rpc("validate_session", { p_session_token: mySessionToken });
      if (data === false) {
        window.speechSynthesis?.cancel();
        alert("다른 기기에서 로그인되어 자동으로 로그아웃됩니다.");
        localStorage.removeItem("jangpyeon_session_token");
        await supabase.auth.signOut({ scope: "local" });
        window.location.href = "/";
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [session, mySessionToken, sessionConflict]);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get("invite");
    if (inviteId) {
      localStorage.setItem("jangpyeon_invite_from", inviteId);
    }
  }, []);

    useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code`);
          const data = await res.json();
          const code = data?.current?.weather_code;
          if (code >= 71 && code <= 77) setLogoWeather("snow");
          else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) setLogoWeather("rain");
          else setLogoWeather(null);
        } catch (err) {
          setLogoWeather(null);
        }
      },
      () => setLogoWeather(null),
      { timeout: 5000 }
    );
  }, []);

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
      checkDeviceSession();
      fetchProfile();
      fetchPlaces();
      fetchFavorites();
      fetchHistory();
      fetchNotices();
      fetchInquiries();
      fetchCampaigns();
      fetchMyCoupons();
      fetchPointRanking();
      fetchFaqs();
      fetchGuardians();
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel("point-ranking-changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => {
        fetchPointRanking();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session]);

  /* --- 프로필(직급) 로드 후, 관리자/직원 전용 데이터 불러오기 --- */
  useEffect(() => {
    if (session && tab === "my") {
      fetchMyRank();
    }
  }, [session, tab]);

useEffect(() => {
    if (session && profile) {
      fetchAllInquiries();
      fetchAllProfiles();
      fetchAdjustLog();
      fetchReports();
      fetchAllCoupons();
      fetchSplashImage();
fetchUnrecognizedVoiceCommands();
    }
    fetchVoiceQaList();
  }, [session, profile]);

  async function fetchRankingCouponResponses(monthStr) {
    const targetMonth = monthStr || responseMonthFilter;
    const [year, month] = targetMonth.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 1).toISOString();
    const { data, error } = await supabase.from("coupons").select("id, title, response_status, created_at").eq("is_ranking_coupon", true).gte("created_at", startDate).lt("created_at", endDate).order("created_at", { ascending: false });
    if (error) { showToast("불러오기 실패: " + error.message); return; }
    setRankingCouponResponses(data || []);
  }
  
    async function loadMonthlyWinners() {
    setLoadingWinners(true);
    const { data, error } = await supabase.rpc("get_last_month_top5");
    setLoadingWinners(false);
    if (error) { showToast("불러오기 실패: " + error.message); return; }
    setMonthlyWinners(data || []);
  }

  async function issueRankingCoupon(userId, rank, pointsEarned) {
    const isChicken = rank <= 3;
    const title = isChicken ? `🏆 ${rank}등 축하 치킨 쿠폰` : `🏆 ${rank}등 축하 커피 쿠폰`;
    const description = `지난달 이달의 포인트 랭킹 ${rank}등을 축하드려요! 받으시려면 아래 "받을게요" 버튼을 눌러주세요 (해당 월 포인트 ${pointsEarned}P가 차감돼요). 원하지 않으시면 "괜찮아요"를 눌러주셔도 포인트는 그대로 유지돼요.`;
    const { error } = await supabase.rpc("admin_issue_coupon", {
      p_user_id: userId,
      p_title: title,
      p_description: description,
      p_expires_at: null,
    });
    if (error) { showToast("발급 실패: " + error.message); return; }

    const { data: latestCoupon } = await supabase.from("coupons").select("id").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
    if (latestCoupon) await supabase.from("coupons").update({ is_ranking_coupon: true, points_at_stake: pointsEarned }).eq("id", latestCoupon.id);

    showToast(`${rank}등에게 쿠폰을 발급했어요!`);
  }

    async function toggleShowRank() {
    const newValue = !showRankToggle;
    setShowRankToggle(newValue);
    await supabase.from("profiles").update({ show_rank: newValue }).eq("id", session.user.id);
    showToast(newValue ? "내 순위가 보여요" : "내 순위를 숨겼어요");
  }

    async function fetchMyRank() {
    if (!session?.user?.id) return;
    const { data, error } = await supabase.rpc("get_my_monthly_rank", { p_user_id: session.user.id });
    if (!error && data) setMyRank(data);
  }

  
  async function fetchPointRanking() {
    const { data, error } = await supabase.rpc("get_monthly_point_ranking");
    if (error) { console.error("랭킹 불러오기 실패:", error); return; }
    const emails = (data || []).map((r) => r.email);
    const { data: providerData } = await supabase.from("profiles").select("email, login_provider").in("email", emails);
    const providerMap = {};
    (providerData || []).forEach((p) => { providerMap[p.email] = p.login_provider; });
    const mapped = (data || []).map((r) => ({ email: r.email, points: r.total_points, login_provider: providerMap[r.email] }));
    setPointRanking(mapped);
  }

async function handleLogout() {
    const token = localStorage.getItem("jangpyeon_session_token");
    if (token) {
      await supabase.from("active_sessions").delete().eq("session_token", token);
    }
    if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
          try {
        const { KakaoLoginPlugin } = await import("@kichunsung/capacitor-kakao-login-plugin");
        await KakaoLoginPlugin.unlink();
      } catch (err) {}
    }
    await supabase.auth.signOut({ scope: "local" });
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.includes("supabase") || key === "jangpyeon_session_token") localStorage.removeItem(key);
    });
    window.location.href = "/";
  }
   async function checkDeviceSession() {
    if (mySessionTokenRef.current) return;
    const deviceType = (typeof window !== "undefined" && window.Capacitor) ? "mobile" : "pc";
    const deviceLabel = deviceType === "mobile" ? "모바일 앱" : "PC 브라우저";
    let token = localStorage.getItem("jangpyeon_session_token");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("jangpyeon_session_token", token);
    }
    setMySessionToken(token);
    mySessionTokenRef.current = token;

    const isValid = await supabase.rpc("validate_session", { p_session_token: token });
    if (isValid.data) return;

    const { data, error } = await supabase.rpc("check_and_register_session", {
      p_device_type: deviceType,
      p_device_label: deviceLabel,
      p_session_token: token,
    });
    if (error) return;
    const result = data?.[0];
    if (result?.needs_confirmation) {
      setSessionConflict({ deviceType, deviceLabel, existingSessionId: result.existing_session_id, existingLabel: result.existing_device_label, token });
    }
  }

  async function confirmReplaceSession() {
    if (!sessionConflict) return;
    const { error } = await supabase.rpc("force_replace_session", {
      p_old_session_id: sessionConflict.existingSessionId,
      p_device_type: sessionConflict.deviceType,
      p_device_label: sessionConflict.deviceLabel,
      p_session_token: sessionConflict.token,
    });
    if (!error) {
      setMySessionToken(sessionConflict.token);
      setSessionConflict(null);
      showToast("이 기기로 로그인됐어요");
    }
  }

  async function cancelReplaceSession() {
    setSessionConflict(null);
    localStorage.removeItem("jangpyeon_session_token");
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = "/";
  }
  
  async function fetchProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();

    if (data && !data.login_provider_set) {
      const provider = session.user.app_metadata?.provider || "email";
      const meta = session.user.user_metadata || {};
      const updates = { login_provider: provider, login_provider_set: true };
      if (!data.nickname) {
        updates.nickname = meta.full_name || meta.name || meta.user_name || null;
      }
      if (!data.avatar_url) {
        updates.avatar_url = meta.avatar_url || meta.picture || null;
      }
      await supabase.from("profiles").update(updates).eq("id", session.user.id);
      Object.assign(data, updates);
    }

    setProfile(data);
    setAvatarUrl(data?.avatar_url || null);
    setShowRankToggle(data?.show_rank || false);
    if (data && !data.nickname && !localStorage.getItem(`jangpyeon_nickname_prompt_dismissed_${session.user.id}`)) {
      setShowNicknamePrompt(true);
    }

      const inviteFrom = localStorage.getItem("jangpyeon_invite_from");
    if (inviteFrom && data && !data.invited_by) {
      const { error } = await supabase.rpc("reward_invite", { p_new_user_id: session.user.id, p_inviter_id: inviteFrom });
      localStorage.removeItem("jangpyeon_invite_from");
      if (!error) {
        setTimeout(() => showToast("친구 초대로 가입해서 +5P를 받았어요!"), 3500);
        setTimeout(() => fetchProfile(), 500);
      }
    }
  }
  async function fetchPlaces() {
    const { data } = await supabase.from("places").select("*, place_photos(photo_url)").eq("status", "approved").order("created_at", { ascending: false });
    const withPhoto = (data || []).map((p) => ({ ...p, photo_urls: (p.place_photos || []).map((ph) => ph.photo_url), photo_url: p.place_photos?.[0]?.photo_url || null }));
    setPlaces(withPhoto);
  }
      async function respondToRankingCoupon(couponId, response) {
    if (response === "accepted") {
      const { error } = await supabase.rpc("accept_ranking_coupon", { p_coupon_id: couponId });
      if (error) { showToast("처리 실패: " + error.message); return; }
      showToast("감사해요! 곧 쿠폰을 보내드릴게요");
      fetchProfile();
    } else {
      const { error } = await supabase.from("coupons").update({ response_status: response }).eq("id", couponId);
      if (error) { showToast("처리 실패: " + error.message); return; }
      showToast("알겠어요, 포인트는 그대로 유지돼요");
    }
    fetchMyCoupons();
    setViewingCoupon(null);
  }
  async function fetchMyCoupons() {
    const { data } = await supabase.from("coupons").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    const unusedCount = (data || []).filter((c) => c.status === "unused").length;
    const hadUnusedBefore = myCoupons.some((c) => c.status === "unused");
    setMyCoupons(data || []);
    if (unusedCount > 0 && !hadUnusedBefore) {
      pendingCouponAnnounce.current = unusedCount;
      setShowCouponPop(true);
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

async function fetchUnrecognizedVoiceCommands() {
    if (session.user.email !== ADMIN_EMAIL && profile?.role !== "staff") return;
    const { data } = await supabase.from("unrecognized_voice_commands").select("*").order("created_at", { ascending: false }).limit(50);
    if (!data) { setUnrecognizedCommands([]); return; }
    const userIds = [...new Set(data.map((c) => c.user_id))];
    const { data: profilesData } = await supabase.from("profiles").select("id, nickname, email").in("id", userIds);
    const profileMap = {};
    (profilesData || []).forEach((p) => { profileMap[p.id] = p; });
    setUnrecognizedCommands(data.map((c) => ({ ...c, profiles: profileMap[c.user_id] })));
  }

  
  async function fetchAllInquiries() {
    if (session.user.email !== ADMIN_EMAIL && profile?.role !== "staff") return;
    const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    setAllInquiries(data || []);
    setNewInquiryCount((data || []).filter((i) => i.status !== "answered").length);
  }
  
  async function fetchNewRankingResponseCount() {
    if (session.user.email !== ADMIN_EMAIL && profile?.role !== "staff") return;
    const { data } = await supabase.from("coupons").select("id").eq("is_ranking_coupon", true).eq("response_status", "accepted").is("admin_checked", null);
    setNewRankingResponseCount((data || []).length);
  }
    async function fetchAllProfiles() {
    if (session.user.email !== ADMIN_EMAIL) return;
    const { data } = await supabase.from("profiles").select("*").order("points", { ascending: false });
    if (data) {
      const inviterIds = [...new Set(data.filter((p) => p.invited_by).map((p) => p.invited_by))];
      if (inviterIds.length > 0) {
        const { data: inviters } = await supabase.from("profiles").select("id, email, nickname").in("id", inviterIds);
        const inviterMap = {};
        (inviters || []).forEach((i) => { inviterMap[i.id] = i; });
        data.forEach((p) => { p.inviter = p.invited_by ? inviterMap[p.invited_by] : null; });
      }
    }
    setAllProfiles(data || []);
  }
    async function fetchAdjustLog() {
    if (session.user.email !== ADMIN_EMAIL) return;
    const { data } = await supabase.from("point_history").select("*, profiles(email, nickname)").eq("activity_type", "admin_adjust").order("created_at", { ascending: false }).limit(50);
    setAdjustLog(data || []);
  }
  async function fetchReports() {
    if (session.user.email !== ADMIN_EMAIL && profile?.role !== "staff") return;
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
async function handleNoticeImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      setNoticeImageFile(compressed);
      setNoticeImagePreview(URL.createObjectURL(compressed));
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
    let savedNotice;
    if (editingNoticeId) {
      ({ error, data: savedNotice } = await supabase.from("notices").update(noticeData).eq("id", editingNoticeId).select().single());
    } else {
      ({ error, data: savedNotice } = await supabase.from("notices").insert(noticeData).select().single());
    }
    if (error) { showToast("저장 실패: " + error.message); return; }

    if (savedNotice) {
      const noHtmlEntities = noticeData.content.replace(/&nbsp;/g, " ").replace(/&amp;/g, "그리고").replace(/&[a-zA-Z]+;/g, " ");
      const rawPlainText = noHtmlEntities.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const rawSpeechText = `${noticeData.title}. ${rawPlainText}`;
      const speechText = rawSpeechText.replace(/[^\uAC00-\uD7A3\s.,!?0-9]/g, "").replace(/\s+/g, " ").trim();
      supabase.functions.invoke("text-to-speech", {
        body: { text: speechText, noticeId: savedNotice.id },
      }).then(async ({ data: ttsData, error: ttsError }) => {
        if (ttsError) {
          console.error("TTS 생성 실패 (조용히 무시):", ttsError, ttsData);
        }
        if (!ttsError && ttsData?.audioUrl) {
          await supabase.from("notices").update({ audio_url: ttsData.audioUrl }).eq("id", savedNotice.id);
          fetchNotices();
        }
      });
    }

    setNoticeForm({ title: "", content: "", link_url: "" });
    setNoticeImageFile(null);
    setNoticeImagePreview(null);
    setNoticeAttachedFile(null);
    setEditingNoticeId(null);
    fetchNotices();
    showToast(editingNoticeId ? "공지사항이 수정됐어요" : "공지사항이 등록됐어요");
  }
   async function handleCampaignPhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      setCampaignFile(compressed);
      setCampaignPreview(URL.createObjectURL(compressed));
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
  async function handleCouponImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      setCouponImageFile(compressed);
      setCouponImagePreview(URL.createObjectURL(compressed));
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
    async function toggleStaff(userId, isCurrentlyStaff) {
    const { error } = await supabase.rpc("admin_set_staff", { p_user_id: userId, p_is_staff: !isCurrentlyStaff });
    if (error) { showToast("변경 실패: " + error.message); return; }
    fetchAllProfiles();
    showToast(isCurrentlyStaff ? "직원 권한이 해제됐어요" : "직원으로 지정했어요");
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
function toggleFilter(key) {
  setActiveFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
}
const filteredPlaces = useMemo(() => {
  return places.filter((p) => {
    const matchesQuery = query.trim() === "" || p.name.includes(query) || p.address.includes(query) || (p.keywords && p.keywords.includes(query));
    const matchesFilter = activeFilters.length === 0 || activeFilters.every((f) => p[BADGE_META[f].field]);
const matchesOpen = !openFilterActive || isOpenNow(p.business_hours, holidays) !== false;
    const matchesDistance = !distanceFilter || !myLocation || (p.lat && p.lng && calcDistanceKm(myLocation.lat, myLocation.lng, p.lat, p.lng) <= distanceFilter);
    return matchesQuery && matchesFilter && matchesOpen && matchesDistance;
  }).sort((a, b) => {
    if (!myLocation) return 0;
    if (!a.lat || !a.lng) return 1;
    if (!b.lat || !b.lng) return -1;
    return calcDistanceKm(myLocation.lat, myLocation.lng, a.lat, a.lng) - calcDistanceKm(myLocation.lat, myLocation.lng, b.lat, b.lng);
  });
}, [places, query, activeFilters, openFilterActive, holidays, distanceFilter, myLocation]);
const visiblePlaces = useMemo(() => filteredPlaces.slice(0, visibleCount), [filteredPlaces, visibleCount]);

// 무한 스크롤 이펙트는 여기로 이동
useEffect(() => {
  if (!scrollSentinelRef.current) return;
  const observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) setVisibleCount((prev) => prev + 20); },
    { rootMargin: "200px" }
  );
  observer.observe(scrollSentinelRef.current);
  return () => observer.disconnect();
}, [tab, filteredPlaces.length]);

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

  async function urlToFile(url, filename) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }
  
    function compressImage(file, maxWidth = 1200, quality = 0.85) {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
            },
            "image/jpeg",
            quality
          );
        };
      };
      reader.readAsDataURL(file);
    });
  }
    async function handlePhotoChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    showToast("사진을 준비하고 있어요...");
    const compressed = await Promise.all(files.map((f) => compressImage(f)));
    const combined = [...photoFiles, ...compressed].slice(0, 5);
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
    async function confirmAdminDeletePlace() {
    const { error } = await supabase.rpc("admin_delete_place", { p_place_id: deletingPlace.id });
    if (error) { showToast("삭제 실패: " + error.message); return; }
    setDeletingPlace(null);
    fetchPlaces();
    showToast("장소가 삭제됐어요 (관리자 권한)");
  }
  function adminEditPlace(place) {
    setIsAdminEditingPlace(true);
    startEdit(place);
    setTab("register");
  }
  function startEdit(place) {
    setEditingPlaceId(place.id);
    setForm({
      name: place.name,
      address: place.address,
      addressDetail: "",
      category: place.category,
      keywords: place.keywords || "",
      phone: place.phone || "",
      businessHours: place.business_hours || DEFAULT_HOURS,
      useHours: !!place.business_hours,
      openHolidays: place.business_hours?.openHolidays || [],
     entrance_step: place.entrance_step || "unknown",
      door_type: place.door_type || "unknown",
      threshold_cm: place.threshold_cm ?? "",
      accessible_toilet: place.accessible_toilet || "unknown",
      toilet_floor: place.toilet_floor ?? "",
elevator: place.elevator || "unknown",
      parking_disabled: place.parking_disabled || "unknown",
      door_width_cm: place.door_width_cm ?? "",
      turning_space: place.turning_space || "unknown",
      badges: {
        stroller: place.has_stroller_access,
      },
    });
    setTab("register");
  }
  async function submitEdit() {
    if (!form.name.trim()) return;
    const fullAddress = form.address.trim() || "주소 정보 없음";
    let finalBusinessHours = null;
    if (form.useHours) {
      if (form.hoursMode === "24h") {
        finalBusinessHours = WEEKDAYS.reduce((acc, d) => ({ ...acc, [d.key]: { open: "00:00", close: "23:59", closed: false } }), {});
      } else if (form.hoursMode === "same") {
        finalBusinessHours = WEEKDAYS.reduce((acc, d) => ({ ...acc, [d.key]: { open: form.sameOpen, close: form.sameClose, closed: false } }), {});
      } else {
        finalBusinessHours = form.businessHours;
      }
      finalBusinessHours.openHolidays = form.openHolidays;
    }
       let error;
    if (isAdminEditingPlace) {
({ error } = await supabase.rpc("admin_update_place", {
        p_place_id: editingPlaceId,
        p_name: form.name.trim(),
        p_address: fullAddress,
        p_category: form.category,
        p_entrance_step: form.entrance_step,
        p_door_type: form.door_type,
        p_threshold_cm: form.threshold_cm === "" ? null : parseInt(form.threshold_cm),
        p_accessible_toilet: form.accessible_toilet,
        p_toilet_floor: form.toilet_floor === "" ? null : parseInt(form.toilet_floor),
p_elevator: form.elevator,
        p_parking_disabled: form.parking_disabled,
        p_door_width_cm: form.door_width_cm === "" ? null : parseInt(form.door_width_cm),
        p_turning_space: form.turning_space,
        p_has_stroller_access: form.badges.stroller,
        p_keywords: form.keywords.trim() || null,
        p_phone: form.phone.trim() || null,
        p_business_hours: finalBusinessHours,
      }));
    } else {
({ error } = await supabase
        .from("places")
        .update({
          name: form.name.trim(),
          address: fullAddress,
          category: form.category,
          entrance_step: form.entrance_step,
          door_type: form.door_type,
          threshold_cm: form.threshold_cm === "" ? null : parseInt(form.threshold_cm),
          accessible_toilet: form.accessible_toilet,
          toilet_floor: form.toilet_floor === "" ? null : parseInt(form.toilet_floor),
elevator: form.elevator,
          parking_disabled: form.parking_disabled,
          door_width_cm: form.door_width_cm === "" ? null : parseInt(form.door_width_cm),
          turning_space: form.turning_space,
          has_stroller_access: form.badges.stroller,
          keywords: form.keywords.trim() || null,
                 phone: form.phone.trim() || null,
          business_hours: finalBusinessHours,
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
setForm({ name: "", address: "", addressDetail: "", category: "공공기관", keywords: "", phone: "", businessHours: DEFAULT_HOURS, useHours: false, badges: { ramp: false, door: false, stroller: false, lift: false } });
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
        let finalBusinessHours = null;
    if (form.useHours) {
      if (form.hoursMode === "24h") {
        finalBusinessHours = WEEKDAYS.reduce((acc, d) => ({ ...acc, [d.key]: { open: "00:00", close: "23:59", closed: false } }), {});
      } else if (form.hoursMode === "same") {
        finalBusinessHours = WEEKDAYS.reduce((acc, d) => ({ ...acc, [d.key]: { open: form.sameOpen, close: form.sameClose, closed: false } }), {});
      } else {
        finalBusinessHours = form.businessHours;
      }
      finalBusinessHours.openHolidays = form.openHolidays;
    }

    let placeLat = null, placeLng = null;
    if (window.kakao) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      await new Promise((resolve) => {
        geocoder.addressSearch(fullAddress, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            placeLat = parseFloat(result[0].y);
            placeLng = parseFloat(result[0].x);
          }
          resolve();
        });
      });
    }

const { data, error } = await supabase.rpc("register_place", {
      p_name: form.name.trim(),
      p_address: fullAddress,
      p_category: form.category,
      p_entrance_step: form.entrance_step,
      p_door_type: form.door_type,
      p_threshold_cm: form.threshold_cm === "" ? null : parseInt(form.threshold_cm),
      p_accessible_toilet: form.accessible_toilet,
      p_toilet_floor: form.toilet_floor === "" ? null : parseInt(form.toilet_floor),
p_elevator: form.elevator,
      p_parking_disabled: form.parking_disabled,
      p_door_width_cm: form.door_width_cm === "" ? null : parseInt(form.door_width_cm),
      p_turning_space: form.turning_space,
      p_has_stroller_access: form.badges.stroller,
      p_keywords: form.keywords.trim() || null,
      p_phone: form.phone.trim() || null,
      p_business_hours: finalBusinessHours,
      p_lat: placeLat,
      p_lng: placeLng,
    });
    if (error) {
      setIsSubmittingPlace(false);
      if (error.message.includes("하루에 등록할 수 있는")) {
        setShowLimitReached(true);
      } else if (error.message.includes("이미 등록된 장소")) {
        setShowDuplicatePlace(true);
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
    setForm({ name: "", address: "", addressDetail: "", category: "공공기관", keywords: "", phone: "", businessHours: DEFAULT_HOURS, useHours: false, badges: { ramp: false, door: false, stroller: false, lift: false } });
    setPhotoFiles([]);
    setPhotoPreviews([]);
    fetchPlaces();
    fetchProfile();
    fetchHistory();
    setIsSubmittingPlace(false);

    if (placeLat && placeLng) {
      try {
        const { data: nearbyUsers } = await supabase.rpc("get_nearby_users", { p_lat: placeLat, p_lng: placeLng, p_radius_km: 3, p_exclude_user: session.user.id });
        if (nearbyUsers && nearbyUsers.length > 0) {
          const userIds = nearbyUsers.map((u) => u.user_id);
          await fetch("https://xyyewfqfurtrzfonplat.supabase.co/functions/v1/swift-endpoint", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              title: "📍 근처에 새 장소가 등록됐어요!",
              body: `"${data.name}"이(가) 우리 동네에 새로 등록됐어요`,
              userIds,
              target: "map",
            }),
          });
        }
      } catch (err) {
        // 알림 실패는 조용히 무시 (등록 자체는 이미 성공했으니까요)
      }
    }
  }

if (maintenanceMode && session && session?.user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: maintenanceImageUrl ? "#000" : PAPER }}>
{maintenanceImageUrl ? (
          <img src={maintenanceImageUrl} alt="점검 안내" className="w-full h-full object-contain absolute inset-0" />
        ) : (
          <div className="text-center">
            <LogoMark size={56} />
            <div className="font-extrabold text-lg mt-4" style={{ color: INK }}>서비스 점검 중이에요</div>
            <div className="text-sm mt-2" style={{ color: INK_SOFT }}>더 나은 서비스를 위해 잠시 점검하고 있어요<br />조금만 기다려주세요 💚</div>
          </div>
        )}
      </div>
    );
  }

  if (authLoading || showBrandSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: splashImageUrl ? "#000" : PAPER }}>
        {splashImageUrl ? (
          <img src={splashImageUrl} alt="장편" className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <LogoMark size={40} />
        )}
      </div>
    );
  }
  if (!session) {
    return (
      <>
              <LoginScreen signInWithGoogle={signInWithGoogle} signInWithKakao={signInWithKakao} showToast={showToast} kakaoLoggingIn={kakaoLoggingIn} />
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
        {toast && (
          <div className="fixed left-1/2 bottom-6 z-50 -translate-x-1/2 pointer-events-none">
            <div className="rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg" style={{ background: INK }}>{toast}</div>
          </div>
        )}
      </>
    );
  }

  const points = profile?.points ?? 0;
  const tier = currentTier(points);
  const next = nextTier(points);
  const registerCount = places.filter((p) => p.created_by === session.user.id).length;
  const helpfulCount = history.filter((h) => h.activity_type === "helpful_received").length;
   const isAdmin = session.user.email === ADMIN_EMAIL;
  const isStaff = profile?.role === "staff";
  const favoriteCount = favorites.size;
  const NAV = [
    { id: "home", label: "홈", icon: Search },
    { id: "map", label: "지도·검색", icon: MapPin },
    { id: "register", label: "등록", icon: Plus },
    { id: "notice", label: "공지사항", icon: Megaphone },
         { id: "my", label: "마이페이지", icon: User, badge: (session.user.email === ADMIN_EMAIL || profile?.role === "staff") ? (newInquiryCount + newRankingResponseCount) : 0 },
    ...(isAdmin ? [{ id: "admin", label: "관리자", icon: ShieldCheck }] : []),
    ...(isStaff && !isAdmin ? [{ id: "staff", label: "업무", icon: ShieldCheck }] : []),
  ];

  return (
    <div style={{ fontFamily: BODY_FONT, background: PAPER, minHeight: "100vh" }}>

{/* ===== NAVBAR ===== */}
<div className="z-10 flex relative" style={{ background: CARD, borderBottom: `1px solid ${LINE}`, fontSize: `${16 * FONT_SCALES[fontScale] * 0.7}px` }}>
  <div ref={logoAreaRef} className="flex-1 flex items-center pl-5 sm:pl-8 relative" style={{ overflow: "visible" }}>
          <div className="relative" style={{ overflow: "visible" }}>
            <LogoMark size={40} />
            {getTodaySpecialEvent()?.type === "christmas" && (
              <span style={{ position: "absolute", top: -10, left: -4, fontSize: 18 }}>🎅</span>
            )}
            {logoWeather === "snow" && (
              <div style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="logo-snowflake" style={{ left: `${i * 10}px`, animationDelay: `${i * 0.7}s` }}>❄️</span>
                ))}
              </div>
            )}
            {logoWeather === "rain" && (
              <div style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="logo-raindrop" style={{ left: `${i * 10}px`, animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            )}
          </div>
          <span style={{ fontFamily: DISPLAY_FONT, fontSize: `${24 * FONT_SCALES[fontScale] * (fontScale === "xsmall" ? 0.55 : 1)}px`, color: INK, lineHeight: 1 }} className="ml-2.5">장편</span>
          {getTodaySpecialEvent()?.message && (
            <span className="hidden sm:inline-block ml-3 text-xs font-bold rounded-full px-3 py-1" style={{ background: CORAL_TINT, color: CORAL }}>
              {getTodaySpecialEvent().emoji} {getTodaySpecialEvent().message}
            </span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-1 rounded-full p-1 flex-shrink-0 my-3.5 sm:absolute sm:left-1/2 sm:-translate-x-1/2" style={{ background: PAPER }}>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
                     <button key={n.id} onClick={() => setTab(n.id)} className="relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-200 active:scale-95 hover:opacity-90"
                style={{ background: active ? TEAL : "transparent", color: active ? "#fff" : INK_SOFT }}>
                <Icon size={15} />{n.label}
                {n.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full font-extrabold coupon-badge-glow" style={{ width: 18, height: 18, background: CORAL, color: "#fff", fontSize: 10 }}>
                    {n.badge > 9 ? "9+" : n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex-1">
        <div className="flex items-center justify-end px-5 sm:px-8 py-3.5">
          <button onClick={() => { setTab("my"); setTimeout(() => { document.getElementById("coupon-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className={`flex sm:hidden items-center gap-1 rounded-full pl-2 pr-2.5 py-1.5 flex-shrink-0 mr-2 transition-all duration-200 active:scale-90 ${myCoupons.some(c => c.status === "unused") ? "coupon-badge-glow" : ""}`} style={{ background: myCoupons.some(c => c.status === "unused") ? YELLOW : PAPER }} aria-label="쿠폰함">
            <Gift size={16} color={myCoupons.some(c => c.status === "unused") ? "#fff" : INK_SOFT} />
            <span style={{ fontSize: `${11 * FONT_SCALES[fontScale] * (fontScale === "xsmall" ? 0.55 : 1)}px`, fontWeight: 700, color: myCoupons.some(c => c.status === "unused") ? "#fff" : INK_SOFT }}>쿠폰</span>
          </button>
                   <div className="flex sm:hidden items-center gap-0.5 rounded-full pl-2.5 pr-1 py-1" style={{ background: PAPER }}>
            <span style={{ fontSize: `${10 * FONT_SCALES[fontScale] * (fontScale === "xsmall" ? 0.6 : 1)}px`, fontWeight: 700, color: INK_SOFT }} className="mr-0.5">글자크기</span>
            <button onClick={() => stepFontScale("down")} disabled={fontScale === "xsmall"} className="rounded-full p-1.5 transition-all duration-150 active:scale-90" style={{ opacity: fontScale === "xsmall" ? 0.35 : 1 }} aria-label="글자 작게">
              <ZoomOut size={15} color={INK_SOFT} />
            </button>
            <button onClick={() => stepFontScale("up")} disabled={fontScale === "xlarge"} className="rounded-full p-1.5 transition-all duration-150 active:scale-90" style={{ opacity: fontScale === "xlarge" ? 0.35 : 1 }} aria-label="글자 크게">
              <ZoomIn size={15} color={INK_SOFT} />
            </button>
          </div>
          <div ref={rightAreaRef} className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full pl-3 pr-1 py-1" style={{ background: PAPER }}>
          <span style={{ fontSize: `${11 * FONT_SCALES[fontScale] * 0.7}px`, fontWeight: 700, color: INK_SOFT }} className="mr-1">글자크기</span>
        <button onClick={() => stepFontScale("down")} disabled={fontScale === "xsmall"} className="rounded-full p-1.5 transition-all duration-150 active:scale-90" style={{ opacity: fontScale === "xsmall" ? 0.35 : 1 }} aria-label="글자 작게">
                <ZoomOut size={15} color={INK_SOFT} />
              </button>
              <button onClick={() => stepFontScale("up")} disabled={fontScale === "xlarge"} className="rounded-full p-1.5 transition-all duration-150 active:scale-90" style={{ opacity: fontScale === "xlarge" ? 0.35 : 1 }} aria-label="글자 크게">
                <ZoomIn size={15} color={INK_SOFT} />
              </button>
            </div>
                               <button onClick={() => { setTab("my"); setTimeout(() => { document.getElementById("point-history-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className="flex items-center gap-1 rounded-full pl-2 pr-3 py-1.5 flex-shrink-0 transition-all duration-200 active:scale-90" style={{ background: CORAL_TINT }}>
                        <span style={{ fontSize: `${14 * FONT_SCALES[fontScale] * 0.7}px` }}>🪙</span>
              <span style={{ fontFamily: MONO_FONT, color: CORAL, fontWeight: 700, fontSize: `${12 * FONT_SCALES[fontScale] * 0.7}px` }} className="whitespace-nowrap">{points.toLocaleString()}P</span>
            </button>
            <button onClick={() => { setTab("my"); setTimeout(() => { document.getElementById("coupon-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className={`relative flex items-center gap-1 rounded-full pl-2 pr-2.5 py-1.5 flex-shrink-0 transition-all duration-200 active:scale-90 ${myCoupons.some(c => c.status === "unused") ? "coupon-badge-glow" : ""}`} style={{ background: myCoupons.some(c => c.status === "unused") ? YELLOW : PAPER }} aria-label="쿠폰함">
              <Gift size={16} color={myCoupons.some(c => c.status === "unused") ? "#fff" : INK_SOFT} />
              <span style={{ fontSize: `${11 * FONT_SCALES[fontScale] * 0.7}px`, fontWeight: 700, color: myCoupons.some(c => c.status === "unused") ? "#fff" : INK_SOFT }}>쿠폰</span>
            </button>
            <button onClick={() => setShowFavoritesOnly(true)} className="rounded-full p-2 flex-shrink-0 transition-all duration-200 active:scale-90" style={{ background: PAPER }} aria-label="즐겨찾기 목록">
              <Star size={16} color={INK_SOFT} />
            </button>
                                    <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95" style={{ border: `1.4px solid ${LINE}`, color: INK_SOFT }}>
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </div>
    <div className="flex sm:hidden items-center justify-end gap-2 px-5 pb-3">
                             <button onClick={() => setShowFavoritesOnly(true)} className="rounded-full p-2 flex-shrink-0 transition-all duration-200 active:scale-90" style={{ background: PAPER }} aria-label="즐겨찾기 목록">
            <Star size={16} color={INK_SOFT} />
          </button>
          <button onClick={() => { setTab("my"); setTimeout(() => { document.getElementById("point-history-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className="flex items-center gap-1 rounded-full pl-2 pr-3 py-1.5 flex-shrink-0 transition-all duration-200 active:scale-90" style={{ background: CORAL_TINT }}>
            <span style={{ fontSize: `${14 * FONT_SCALES[fontScale] * 0.7}px` }}>🪙</span>
            <span style={{ fontFamily: MONO_FONT, color: CORAL, fontWeight: 700, fontSize: `${12 * FONT_SCALES[fontScale] * 0.7}px` }} className="whitespace-nowrap">{points.toLocaleString()}P</span>
          </button>
                                  <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 flex-shrink-0 whitespace-nowrap" style={{ border: `1.4px solid ${LINE}`, color: INK_SOFT }}>
              <LogOut size={14} />
              로그아웃
            </button>
        </div>
        </div>
</div>

      {/* ===== VOICE COMMAND FLOATING BUTTON ===== */}
{session && typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform() && (
<div
          onTouchMove={handleMicDrag}
          onTouchEnd={handleMicDragEnd}
          onMouseMove={handleMicDrag}
          onMouseUp={handleMicDragEnd}
          className="fixed z-40 flex flex-col items-center"
          style={{ bottom: 55, left: `${micPositionPercent}%`, transform: "translateX(-50%)", transition: isMicDragMode ? "none" : "all 0.3s", opacity: showVoiceButton ? 1 : 0, pointerEvents: showVoiceButton ? "auto" : "none" }}
        >
    <div className="rounded-full px-2.5 py-1 mb-1.5 voice-hint-float" style={{ background: "rgba(0,0,0,0.6)", whiteSpace: "nowrap" }}>
 <span className="text-white" style={{ fontSize: 10, fontWeight: 700 }}>눌러서 말해보세요</span>
          </div>
          {showMicSavedBadge && (
            <div className="rounded-full px-3 py-1.5 mb-2 flex items-center gap-1.5 mic-saved-pop" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              <Check size={14} color={TEAL} />
              <span className="text-xs font-extrabold" style={{ color: TEAL_DARK }}>여기에 저장됐어요!</span>
            </div>
          )}
<button
            onClick={() => { if (!isMicDragMode) startVoiceCommand(); }}
            onTouchStart={handleMicPressStart}
            onTouchEnd={handleMicPressEnd}
            onMouseDown={handleMicPressStart}
            onMouseUp={handleMicPressEnd}
            className="rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 voice-btn-glow"
            style={{ width: 64, height: 64, background: isVoiceCommandListening ? CORAL : TEAL, border: isMicDragMode ? "3px solid #fff" : "3px solid #FFC13B", animation: isMicDragMode ? "mic-shake 0.3s infinite" : undefined }}
            aria-label="음성 명령"
          >
            {isVoiceCommandListening ? (
              <div className="rounded-full animate-pulse" style={{ width: 16, height: 16, background: "#fff" }} />
            ) : (
              <Mic size={28} color="#fff" />
            )}
          </button>
        </div>
      )}

{viewingDetailPlace && (
        <PlaceDetailModal
          place={viewingDetailPlace}
          onClose={() => setViewingDetailPlace(null)}
          holidays={holidays}
          onShare={shareToKakao}
          onDirections={openDirections}
          onGoToMap={(p) => { setPendingFocusId(p.id); setTab("map"); setTimeout(() => focusOnPlace(p.id), 100); }}
          onImageClick={(urls, idx) => { setPreviewImages(urls); setPreviewIndex(idx); setShowSwipeHint(urls.length > 1); }}
          onConfirmInfo={confirmPlaceInfo}
          onShowRecencyHelp={() => setShowRecencyHelp(true)}
        />
      )}


{voiceFaqAnswer && (
        <div onClick={() => { setVoiceFaqAnswer(null); if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); }} className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-6" style={{ background: CARD }}>
            <div className="flex items-center gap-2 mb-3">
              <Mic size={18} color={TEAL} />
              <span className="text-xs font-bold" style={{ color: TEAL_DARK }}>음성 질문 답변</span>
            </div>
{voiceFaqAnswer.answer === "__NOT_FOUND__" ? (
              <>
                <div className="text-4xl text-center mb-3">🙏</div>
                <div className="font-extrabold text-base mb-2 text-center" style={{ color: INK }}>죄송해요, 아직 잘 모르겠어요</div>
                <div className="text-sm mb-5 text-center" style={{ color: INK_SOFT, lineHeight: 1.6 }}>
                  "{voiceFaqAnswer.question}"라고 말씀해주셨는데,<br />제가 아직 그 답을 모르고 있어요.<br />더 열심히 배워서 다음엔 꼭 답해드릴게요!
                </div>
              </>
            ) : (
              <>
                <div className="font-extrabold text-base mb-3" style={{ color: INK }}>{voiceFaqAnswer.question}</div>
                <div className="text-sm mb-5" style={{ color: INK_SOFT, lineHeight: 1.6 }}>{voiceFaqAnswer.answer}</div>
              </>
            )}
            <button onClick={() => { setVoiceFaqAnswer(null); if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); }} className="w-full rounded-full py-3 text-sm font-bold text-white" style={{ background: TEAL }}>
              확인했어요
            </button>
          </div>
        </div>
      )}

{showDoorTypeHelp && (
        <div onClick={() => setShowDoorTypeHelp(false)} className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5" style={{ background: CARD }}>
            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>출입문 종류가 뭔가요?</div>
            <div className="flex flex-col gap-2.5 text-xs" style={{ color: INK_SOFT, lineHeight: 1.6 }}>
              <div><b style={{ color: TEAL_DARK }}>자동문</b> — 센서로 저절로 열리는 문이에요. 손댈 필요가 없어요</div>
              <div><b style={{ color: TEAL_DARK }}>여닫이</b> — 손잡이를 밀거나 당겨서 여는 문이에요. 문이 앞이나 뒤로 열려요</div>
              <div><b style={{ color: TEAL_DARK }}>미닫이</b> — 옆으로 밀어서 여는 문이에요. 문이 좌우로 스르륵 움직여요</div>
              <div><b style={{ color: INK_SOFT }}>미확인</b> — 아직 확인된 정보가 없어요</div>
            </div>
            <button onClick={() => setShowDoorTypeHelp(false)} className="w-full rounded-full py-2.5 mt-4 text-sm font-bold text-white" style={{ background: TEAL }}>
              확인했어요
            </button>
          </div>
        </div>
      )}


{showTurningHelp && (
        <div onClick={() => setShowTurningHelp(false)} className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5" style={{ background: CARD }}>
            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>"내부 휠체어 회전 공간"은 뭔가요?</div>
            <div className="text-xs mb-3" style={{ color: INK_SOFT, lineHeight: 1.6 }}>
              문을 통과해서 <b>들어간 이후에도</b>, 휠체어가 자유롭게 움직이고 방향을 바꿀 수 있는 공간이 있는지를 말해요.
            </div>
            <div className="flex flex-col gap-2.5 text-xs" style={{ color: INK_SOFT, lineHeight: 1.6 }}>
              <div><b style={{ color: TEAL_DARK }}>여유 있음</b> — 테이블, 진열대 등에 부딪히지 않고 방향을 바꿀 수 있는 공간이 있어요</div>
              <div><b style={{ color: CORAL }}>비좁음</b> — 통로가 좁거나 짐이 많아서, 휠체어가 움직이기 어려워요</div>
              <div><b style={{ color: INK_SOFT }}>미확인</b> — 아직 확인된 정보가 없어요</div>
            </div>
            <button onClick={() => setShowTurningHelp(false)} className="w-full rounded-full py-2.5 mt-4 text-sm font-bold text-white" style={{ background: TEAL }}>
              확인했어요
            </button>
          </div>
        </div>
      )}


{showElevatorHelp && (
        <div onClick={() => setShowElevatorHelp(false)} className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5" style={{ background: CARD }}>
            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>"1층뿐"은 무슨 뜻인가요?</div>
            <div className="flex flex-col gap-2.5 text-xs" style={{ color: INK_SOFT, lineHeight: 1.6 }}>
              <div><b style={{ color: TEAL_DARK }}>있음</b> — 이 건물에 엘리베이터가 있어요</div>
              <div><b style={{ color: CORAL }}>없음</b> — 여러 층 건물인데 엘리베이터가 없어요. 계단으로만 올라갈 수 있어요</div>
              <div><b style={{ color: TEAL_DARK }}>1층뿐</b> — 건물 자체가 1층짜리라서, 엘리베이터가 필요 없어요</div>
              <div><b style={{ color: INK_SOFT }}>미확인</b> — 아직 확인된 정보가 없어요</div>
            </div>
            <button onClick={() => setShowElevatorHelp(false)} className="w-full rounded-full py-2.5 mt-4 text-sm font-bold text-white" style={{ background: TEAL }}>
              확인했어요
            </button>
          </div>
        </div>
      )}

{showShopExplainCard && (
        <div onClick={() => setShowShopExplainCard(false)} className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "#000" }}>
<img src="https://xyyewfqfurtrzfonplat.supabase.co/storage/v1/object/public/app-assets/3.png" alt="장편 캐릭터" style={{ width: 110, height: 110, objectFit: "contain" }} />
          <button onClick={(e) => { e.stopPropagation(); setShowShopExplainCard(false); }} className="absolute top-4 right-4 rounded-full flex items-center justify-center" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)" }} aria-label="닫기">
            <X size={22} color="#fff" />
          </button>
        </div>
      )}
{showVoiceListeningUI && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8" style={{ background: "rgba(15,110,98,0.95)" }}>
          <div className="relative flex items-center justify-center mb-6" style={{ width: 140, height: 140 }}>
            <div className="absolute rounded-full voice-pulse-ring" style={{ width: 140, height: 140, border: "3px solid rgba(255,255,255,0.4)" }} />
            <div className="absolute rounded-full voice-pulse-ring" style={{ width: 140, height: 140, border: "3px solid rgba(255,255,255,0.4)", animationDelay: "0.5s" }} />
<img src="https://xyyewfqfurtrzfonplat.supabase.co/storage/v1/object/public/app-assets/19b259a9-47c8-44a6-926e-2c393f9650fb.png" alt="장편 캐릭터" style={{ width: 110, height: 110, objectFit: "contain" }} />
          </div>
<div className="text-white text-xs font-bold mb-1" style={{ opacity: 0.8 }}>편이</div>
          <div className="text-white font-extrabold text-xl mb-1">무엇이든 물어보세요</div>
          <div className="text-white text-sm mb-8" style={{ opacity: 0.85 }}>듣고 있어요, 말씀해주세요</div>
          <div className="rounded-2xl p-4 w-full" style={{ background: "rgba(255,255,255,0.15)", maxWidth: 280 }}>
            <div className="text-white text-xs font-bold mb-2 text-center" style={{ opacity: 0.9 }}>이렇게 말해보세요</div>
           {isSearchVoice ? (
              <div className="text-white text-xs leading-loose text-center">
                "한식" · "카페" · "강남역" "상호명"<br />
                찾고 싶은 장소나 지역을 말씀해주세요
              </div>
            ) : (
              <div className="text-white text-xs leading-loose text-center">
                가고 싶은 장소 이름<br />
                "홈으로 가기" · "지도로 가기"<br />
                "등록하기" · "마이페이지로 가기"<br />
                "공지사항으로 가기" · "로그아웃"
              </div>
            )}
          </div>
        </div>
      )}

             {/* ===== MOBILE TABS ===== */}
      <div className="flex sm:hidden justify-between px-2 py-2" style={{ background: "#fff", borderBottom: `1px solid ${LINE}` }}>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all duration-200 active:scale-95"
              style={{ color: active ? TEAL : INK_SOFT, background: active ? TEAL_TINT : "transparent" }}>
              <Icon size={17} />
              <span style={{ fontSize: `${9 * FONT_SCALES[fontScale] * 1.2}px`, fontWeight: active ? 900 : 700, whiteSpace: "nowrap" }}>{n.label}</span>
              {active && (
                <div className="absolute rounded-full" style={{ bottom: 0, width: 20, height: 3, background: TEAL }} />
              )}
              {n.badge > 0 && (
                <span className="absolute top-0 right-2 flex items-center justify-center rounded-full font-extrabold coupon-badge-glow" style={{ width: 16, height: 16, background: CORAL, color: "#fff", fontSize: 9 }}>
                  {n.badge > 9 ? "9+" : n.badge}
                </span>
              )}
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
            <div className="flex items-center gap-2">
              <button onClick={createFavoriteShareLink} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: TEAL_TINT, color: TEAL_DARK }}>
                <MessageCircle size={13} /> 공유
              </button>
              <button onClick={() => setShowFavoritesOnly(false)} className="rounded-full p-1.5 hover:bg-black/5" aria-label="닫기">
                <X size={20} color={INK_SOFT} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {places.filter((p) => favorites.has(p.id)).length === 0 ? (
              <div className="text-center py-16 text-sm" style={{ color: INK_SOFT }}>
                아직 즐겨찾기한 장소가 없어요.<br />장소 카드의 별 아이콘을 눌러 저장해보세요!
              </div>
                    ) : (
              <div className="grid sm:grid-cols-2 gap-3 min-w-0">
                {places.filter((p) => favorites.has(p.id)).map((p) => (
                  <div key={p.id} onClick={() => { setPendingFocusId(p.id); setTab("map"); }} className="cursor-pointer min-w-0">
<PlaceCard place={p} onHelpful={markHelpful} isFavorite={favorites.has(p.id)} onToggleFavorite={toggleFavorite} onEdit={startEdit} isOwner={p.created_by === session.user.id} onImageClick={(urls, idx) => { setPreviewImages(urls); setPreviewIndex(idx); setShowSwipeHint(urls.length > 1); }} onShare={shareToKakao} onDirections={openDirections} onReport={reportPlace} onDelete={deletePlace} isAdminUser={isAdmin} onAdminEdit={adminEditPlace} onAdminDelete={(p) => setDeletingPlace({ ...p, isAdminAction: true })} holidays={holidays} onViewReviews={(p) => { setViewingReviewsPlace(p); fetchReviews(p.id); }} onConfirmInfo={confirmPlaceInfo} onShowRecencyHelp={() => setShowRecencyHelp(true)} onOpenMenu={setPlaceContextMenu} />
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
                    {viewingCoupon.is_ranking_coupon && !viewingCoupon.response_status ? (
                <div className="flex gap-2">
                  <button onClick={() => respondToRankingCoupon(viewingCoupon.id, "declined")} className="flex-1 rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: PAPER, color: INK }}>
                    괜찮아요
                  </button>
                  <button onClick={() => respondToRankingCoupon(viewingCoupon.id, "accepted")} className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: TEAL }}>
                    받을게요
                  </button>
                </div>
              ) : (
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
              )}
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

      {/* ===== DUPLICATE PLACE POPUP ===== */}
      {showDuplicatePlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: CARD }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: CORAL_TINT }}>
              <MapPin size={22} color={CORAL} />
            </div>
            <div className="font-extrabold text-base mb-1" style={{ color: INK }}>이미 등록된 장소예요</div>
            <div className="text-sm mb-6" style={{ color: INK_SOFT }}>같은 이름과 주소의 장소가 이미 등록되어 있어요.<br />지도에서 검색해보시겠어요?</div>
            <button onClick={() => setShowDuplicatePlace(false)} className="w-full rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: TEAL }}>
              확인했어요
            </button>
          </div>
        </div>
      )}

      {/* ===== NICKNAME PROMPT POPUP ===== */}
      {showNicknamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: CARD }}>
            <div className="text-4xl mb-3">👋</div>
            <div className="font-extrabold text-base mb-1" style={{ color: INK }}>닉네임을 설정해보세요</div>
            <div className="text-sm mb-4" style={{ color: INK_SOFT }}>다른 분들에게 어떤 이름으로 보이고 싶으세요?<br />나중에 마이페이지에서 언제든 바꿀 수 있어요</div>
            <input
              value={nicknamePromptDraft}
              onChange={(e) => setNicknamePromptDraft(e.target.value)}
              placeholder="닉네임 입력 (선택)"
              maxLength={12}
              autoFocus
              className="w-full rounded-xl px-4 py-3 mb-4 text-sm text-center outline-none"
              style={{ border: `1.4px solid ${LINE}`, color: INK }}
            />
            <div className="flex gap-2">
              <button onClick={dismissNicknamePrompt} className="flex-1 rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: PAPER, color: INK }}>
                나중에 할게요
              </button>
              <button onClick={saveNicknameFromPrompt} className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: TEAL }}>
                설정하기
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
                           <button onClick={() => { deletingPlace?.isAdminAction ? confirmAdminDeletePlace() : confirmDeletePlace(); }} className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: CORAL }}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
        {/* ===================== 직원 업무 ===================== */}
        {tab === "staff" && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl p-3 flex items-center justify-center" style={{ background: TEAL_TINT }}>
                <ShieldCheck size={22} color={TEAL} />
              </div>
              <div>
                <h2 className="font-extrabold text-xl" style={{ color: INK }}>업무</h2>
                <div className="text-xs" style={{ color: INK_SOFT }}>신고 확인, 1:1 문의 답변을 할 수 있어요</div>
              </div>
            </div>

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>장소 정보 신고 ({allReports.filter(r => r.status !== "resolved").length}건 대기중)</div>
                       <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {allReports.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>신고 내역이 없어요</div>}
              {allReports.map((r) => {
                const isExpandedReport = expandedReportId === r.id;
                return (
                <div key={r.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}`, opacity: r.status === "resolved" ? 0.5 : 1 }}>
                  <button onClick={() => setExpandedReportId(isExpandedReport ? null : r.id)} className="w-full flex items-center justify-between gap-2 text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold truncate" style={{ color: INK }}>{r.places?.name || "(삭제된 장소)"}</span>
                      {r.status !== "resolved" ? (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ background: CORAL_TINT, color: CORAL }}>대기중</span>
                      ) : (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ background: PAPER, color: INK_SOFT }}>완료</span>
                      )}
                    </div>
                    <ChevronRight size={16} color={INK_SOFT} className="flex-shrink-0" style={{ transform: isExpandedReport ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                  {isExpandedReport && (
                    <div className="mt-2">
                      <div className="text-xs mb-1" style={{ color: INK_SOFT }}>{r.places?.address}</div>
                      <div className="text-xs mb-1" style={{ color: INK }}>{r.reason}</div>
                      <div className="text-xs mb-2" style={{ color: INK_SOFT }}>{new Date(r.created_at).toLocaleDateString("ko-KR")}</div>
                      <div className="flex gap-2">
                        {r.status !== "resolved" ? (
                          <button onClick={() => resolveReport(r.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-white" style={{ background: TEAL }}>처리 완료로 표시</button>
                        ) : (
                          <span className="text-[10px] font-bold rounded-full px-2 py-1.5 flex items-center" style={{ background: PAPER, color: INK_SOFT }}>처리완료됨</span>
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
                  )}
                </div>
                );
              })}
            </div>

                    <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>1:1 문의 관리</div>
            <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {allInquiries.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>문의가 없어요</div>}
              {allInquiries.map((q) => {
                const isExpandedInquiry = expandedInquiryAdminId === q.id;
                return (
                <div key={q.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <button onClick={() => setExpandedInquiryAdminId(isExpandedInquiry ? null : q.id)} className="w-full flex items-center justify-between gap-2 text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold truncate" style={{ color: INK }}>{q.title}</span>
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ background: q.status === "answered" ? TEAL_TINT : CORAL_TINT, color: q.status === "answered" ? TEAL_DARK : CORAL }}>
                        {q.status === "answered" ? "답변완료" : "답변대기"}
                      </span>
                    </div>
                    <ChevronRight size={16} color={INK_SOFT} className="flex-shrink-0" style={{ transform: isExpandedInquiry ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                  {isExpandedInquiry && (
                    <div className="mt-2">
                      <div className="text-xs mb-2" style={{ color: INK_SOFT }}>{q.content}</div>
                      {q.answer ? (
                        <div className="rounded-xl p-3 text-xs" style={{ background: PAPER, color: INK }}>
                          <span className="font-bold" style={{ color: TEAL }}>답변: </span>{q.answer}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input value={replyDrafts[q.id] || ""} onChange={(e) => setReplyDrafts({ ...replyDrafts, [q.id]: e.target.value })} placeholder="답변 입력"
                            className="flex-1 rounded-xl px-3 py-2 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                          <button onClick={() => submitReply(q.id)} className="rounded-xl px-3 py-2 text-xs font-bold text-white flex-shrink-0" style={{ background: TEAL }}>답변</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}
      {/* ===== REVIEWS POPUP ===== */}
      {viewingReviewsPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full sm:max-w-md rounded-2xl overflow-hidden flex flex-col" style={{ background: CARD, height: "80vh", maxHeight: 600 }}>
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${LINE}` }}>
              <div>
                <div className="font-extrabold text-sm" style={{ color: INK }}>{viewingReviewsPlace.name}</div>
                <div className="text-xs" style={{ color: INK_SOFT }}>리뷰 {placeReviews.length}개</div>
              </div>
              <button onClick={() => setViewingReviewsPlace(null)} className="rounded-full p-1.5 hover:bg-black/5" aria-label="닫기">
                <X size={20} color={INK_SOFT} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {placeReviews.length === 0 ? (
                <div className="text-center py-10 text-sm" style={{ color: INK_SOFT }}>
                  아직 리뷰가 없어요.<br />첫 리뷰를 남겨보세요!
                </div>
              ) : (
                <div className="space-y-3">
                  {placeReviews.map((r) => (
                    <div key={r.id} className="rounded-xl p-3" style={{ background: PAPER }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold" style={{ color: INK }}>{currentTier(r.profiles?.points ?? 0).emoji} {r.profiles?.nickname || "익명"}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px]" style={{ color: INK_SOFT }}>{new Date(r.created_at).toLocaleDateString("ko-KR")}</span>
                          {(r.user_id === session.user.id || session.user.email === ADMIN_EMAIL) && (
                            <button onClick={() => deleteReview(r.id)} className="rounded-full p-1" aria-label="리뷰 삭제">
                              <Trash2 size={12} color={CORAL} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm" style={{ color: INK }}>{r.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
                  <div className="flex flex-col sm:flex-row gap-2 px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${LINE}` }}>
              <input value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="이 장소에 대한 한줄평을 남겨주세요"
                className="w-full sm:flex-1 rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, minWidth: 0 }} />
              <button onClick={submitReview} className="w-full sm:w-auto rounded-xl px-4 py-2.5 text-sm font-bold text-white flex-shrink-0" style={{ background: TEAL }}>
                등록
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== RECENCY HELP POPUP ===== */}
      {showRecencyHelp && (
        <div onClick={() => setShowRecencyHelp(false)} className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-6" style={{ background: CARD }}>
            <div className="font-extrabold text-base mb-4" style={{ color: INK }}>정보 등록 시기 안내</div>
            <div className="flex items-start gap-2 mb-3">
              <div className="rounded-full mt-1 flex-shrink-0" style={{ width: 8, height: 8, background: "#22C55E" }} />
              <div>
                <div className="text-sm font-bold" style={{ color: INK }}>최근 정보 (3개월 이내)</div>
                <div className="text-xs" style={{ color: INK_SOFT }}>믿고 참고하셔도 좋아요</div>
              </div>
            </div>
            <div className="flex items-start gap-2 mb-3">
              <div className="rounded-full mt-1 flex-shrink-0" style={{ width: 8, height: 8, background: "#CA8A04" }} />
              <div>
                <div className="text-sm font-bold" style={{ color: INK }}>조금 지난 정보 (3개월~1년)</div>
                <div className="text-xs" style={{ color: INK_SOFT }}>큰 변화는 없을 가능성이 높지만, 참고해주세요</div>
              </div>
            </div>
            <div className="flex items-start gap-2 mb-5">
              <div className="rounded-full mt-1 flex-shrink-0" style={{ width: 8, height: 8, background: "#DC2626" }} />
              <div>
                <div className="text-sm font-bold" style={{ color: INK }}>오래된 정보 (1년 이상)</div>
                <div className="text-xs" style={{ color: INK_SOFT }}>시설이 바뀌었을 수 있어요, 방문 전 확인을 권장해요</div>
              </div>
            </div>
            <div className="rounded-xl p-3 mb-5" style={{ background: TEAL_TINT }}>
              <div className="text-xs font-bold" style={{ color: TEAL_DARK }}>💡 "정보 확인했어요" 버튼이 뭔가요?</div>
              <div className="text-xs mt-1" style={{ color: INK_SOFT }}>직접 방문해서 정보가 여전히 맞다고 느끼셨다면 눌러주세요. 다른 분들에게 "최근에 확인된 정보"라고 알려주는 역할을 해요.</div>
            </div>
            <button onClick={() => setShowRecencyHelp(false)} className="w-full rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: TEAL }}>
              확인했어요
            </button>
          </div>
        </div>
      )}
      {/* ===== SHARE LINK POPUP ===== */}
      {shareLink && (
        <div onClick={() => setShareLink(null)} className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: CARD }}>
            <div className="text-4xl mb-3">🗺️</div>
            <div className="font-extrabold text-base mb-1" style={{ color: INK }}>즐겨찾기 지도가 만들어졌어요!</div>
            <div className="text-sm mb-4" style={{ color: INK_SOFT }}>이 링크를 보내면, 로그인 없이도 바로 볼 수 있어요</div>
            <div className="rounded-xl p-3 mb-4 text-xs break-all" style={{ background: PAPER, color: INK_SOFT }}>{shareLink}</div>
            <div className="flex gap-2">
              <button onClick={() => setShareLink(null)} className="flex-1 rounded-full py-3 text-sm font-bold" style={{ background: PAPER, color: INK }}>
                닫기
              </button>
                  <button onClick={() => { navigator.clipboard.writeText(shareLink); showToast("링크가 복사됐어요!"); setShareLink(null); }} className="flex-1 rounded-full py-3 text-sm font-bold text-white" style={{ background: TEAL }}>
                링크 복사
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RANKING POLICY POPUP ===== */}
      {showRankingPolicy && (
        <div onClick={() => setShowRankingPolicy(false)} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col" style={{ background: CARD, maxHeight: "80vh" }}>
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${LINE}` }}>
              <span className="font-extrabold text-base" style={{ color: INK }}>🏆 이달의 포인트 랭킹 이용 안내</span>
              <button onClick={() => setShowRankingPolicy(false)} className="rounded-full p-1.5 hover:bg-black/5" aria-label="닫기">
                <X size={20} color={INK_SOFT} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 text-sm" style={{ color: INK }}>
              <div className="font-extrabold mb-1.5" style={{ color: TEAL_DARK }}>1. 집계 기준</div>
              <div className="mb-4" style={{ color: INK_SOFT }}>
                매월 1일 00:00부터 해당 월 말일까지, 그 달에 새로 적립된 포인트만을 기준으로 순위를 산정해요. 이전 달까지 누적된 포인트는 반영되지 않으며, 매달 1일에 자동으로 초기화돼요.
              </div>
              <div className="font-extrabold mb-1.5" style={{ color: TEAL_DARK }}>2. 순위 결정 방식</div>
              <div className="mb-4" style={{ color: INK_SOFT }}>
                해당 월 적립 포인트가 많은 순서대로 상위 5명을 표시해요. 포인트가 같다면, 그 달에 먼저 그 포인트에 도달한 분이 상위로 표시돼요.
              </div>
                           <div className="font-extrabold mb-1.5" style={{ color: TEAL_DARK }}>3. 포인트 적립 및 관리 원칙</div>
              <div className="mb-4" style={{ color: INK_SOFT }}>
                포인트는 정상적인 서비스 이용(장소 등록, 정보 확인, 도움이 됐어요 응답 등)을 통해서만 적립돼요. 중복 계정, 허위 정보 등록, 자동화 프로그램 등 비정상적인 방법으로 포인트를 취득한 사실이 확인되면, 사전 통지 없이 포인트 및 순위가 조정되거나 삭제될 수 있어요.
              </div>

              <div className="rounded-xl p-4 mb-4" style={{ background: CORAL_TINT, border: `1.5px solid ${CORAL}` }}>
                <div className="font-extrabold mb-2 flex items-center gap-1.5" style={{ color: CORAL }}>
                  🎁 순위 보상(쿠폰) 안내
                </div>
                          <div style={{ color: INK }}>
                  매달 1~3등에게는 <b>치킨 쿠폰</b>, 4~5등에게는 <b>커피 쿠폰</b>이 지급돼요.
                  <br /><br />
                  <b>쿠폰을 받으시면, 해당 월에 모으신 포인트가 차감</b>돼요.
                  <br /><br />
                  <b>쿠폰을 원하지 않으시면 거부하실 수 있어요.</b> 거부하시면 <b>포인트는 차감되지 않고 그대로 유지</b>돼요.
                </div>
              </div>
              <div className="font-extrabold mb-1.5" style={{ color: TEAL_DARK }}>4. 개인정보 표시</div>
              <div className="mb-4" style={{ color: INK_SOFT }}>
                랭킹에는 이메일 주소 일부(앞 3자리)만 마스킹되어 표시되며, 전체 이메일은 공개되지 않아요. 랭킹 노출을 원하지 않으시면 1:1 문의로 제외를 요청하실 수 있어요.
              </div>
              <div className="font-extrabold mb-1.5" style={{ color: TEAL_DARK }}>5. 기타</div>
              <div style={{ color: INK_SOFT }}>
                본 기준은 서비스 개선을 위해 사전 공지 후 변경될 수 있어요. 궁금하신 점은 1:1 문의 또는 카카오톡 채널로 언제든 문의해주세요.
              </div>
            </div>
            <div className="p-4 flex-shrink-0" style={{ borderTop: `1px solid ${LINE}` }}>
              <button onClick={() => setShowRankingPolicy(false)} className="w-full rounded-full py-3 text-sm font-bold text-white" style={{ background: TEAL }}>
                확인했어요
    </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== FAQ POPUP ===== */}
      {showFAQ && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: PAPER }}>
          <div className="sticky top-0 flex items-center justify-between px-5 py-4" style={{ background: CARD, borderBottom: `1px solid ${LINE}` }}>
            <div className="flex items-center gap-2">
              <Headset size={18} color={TEAL_DARK} />
              <span className="font-extrabold text-base" style={{ color: INK }}>자주 묻는 질문</span>
            </div>
            <button onClick={() => { setShowFAQ(false); setExpandedFaqId(null); if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); setSpeakingFaqId(null); }} className="rounded-full p-1.5 hover:bg-black/5" aria-label="닫기">
              <X size={20} color={INK_SOFT} />
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-3" style={{ background: TEAL_TINT }}>
            <div>
              <div className="text-sm font-extrabold" style={{ color: TEAL_DARK }}>🔊 음성으로 답변 듣기</div>
              <div className="text-xs" style={{ color: INK_SOFT }}>켜두시면 질문을 누를 때 자동으로 답변을 읽어드려요</div>
            </div>
            <button
              onClick={() => setFaqVoiceOn(!faqVoiceOn)}
              className="relative rounded-full transition-all duration-200 flex-shrink-0"
              style={{ width: 48, height: 28, background: faqVoiceOn ? TEAL : LINE }}
            >
              <div className="absolute rounded-full bg-white transition-all duration-200" style={{ width: 22, height: 22, top: 3, left: faqVoiceOn ? 23 : 3 }} />
            </button>
          </div>

<div className="flex-1 overflow-y-auto px-5 py-5">
            {faqs.length === 0 && (
              <div className="text-center py-12 text-sm" style={{ color: INK_SOFT }}>아직 등록된 질문이 없어요</div>
            )}
            {faqs.slice((faqPage - 1) * 5, faqPage * 5).map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const isSpeaking = speakingFaqId === faq.id;
              return (
                <div key={faq.id} className="rounded-2xl mb-3 overflow-hidden" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                  <button
                                      onClick={() => {
                      const nowExpanded = !isExpanded;
                      setExpandedFaqId(nowExpanded ? faq.id : null);
                      if (nowExpanded && faqVoiceOn) {
                             speakFaqAnswer(faq.id, `${faq.question.replace(/[?!.]+$/, "")}. ${faq.answer}`);
                      }
                    }}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-left"
                  >
<div className="flex items-center gap-2 min-w-0">
                      <span className="flex items-center justify-center rounded-full text-[11px] font-extrabold flex-shrink-0" style={{ width: 20, height: 20, background: TEAL, color: "#fff" }}>Q</span>
                      <span className="text-sm font-bold truncate" style={{ color: INK }}>{faq.question}</span>
                    </div>
                    <ChevronRight size={16} color={INK_SOFT} className="flex-shrink-0" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                          {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="flex items-center justify-center rounded-full text-[11px] font-extrabold flex-shrink-0 mt-0.5" style={{ width: 20, height: 20, background: CORAL, color: "#fff" }}>A</span>
                        <div className="text-sm" style={{ color: INK_SOFT, lineHeight: 1.6 }}>{faq.answer}</div>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: TEAL_TINT }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Headset size={14} color={TEAL_DARK} />
                          <span className="text-xs font-bold" style={{ color: TEAL_DARK }}>음성으로 들어보세요</span>
                        </div>
                        <button
                          onClick={() => speakFaqAnswer(faq.id, `${faq.question.replace(/[?!.]+$/, "")}. ${faq.answer}`)}
                          className="flex items-center justify-center gap-2 w-full rounded-full py-2.5 font-extrabold text-white transition-all duration-200 active:scale-95"
                          style={{ background: isSpeaking ? CORAL : TEAL }}
                        >
                          {isSpeaking ? (
                            <>⏸️ 음성 멈추기</>
                          ) : (
                            <>▶️ 음성으로 듣기</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
</div>
              );
            })}
            {faqs.length > 5 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <button onClick={() => setFaqPage((p) => Math.max(1, p - 1))} disabled={faqPage === 1} className="rounded-full p-2" style={{ background: PAPER, opacity: faqPage === 1 ? 0.4 : 1 }} aria-label="이전 페이지">
                  <ChevronRight size={16} color={INK_SOFT} style={{ transform: "rotate(180deg)" }} />
                </button>
                <span className="text-xs font-bold" style={{ color: INK_SOFT }}>{faqPage} / {Math.max(1, Math.ceil(faqs.length / 5))}</span>
                <button onClick={() => setFaqPage((p) => Math.min(Math.ceil(faqs.length / 5), p + 1))} disabled={faqPage >= Math.ceil(faqs.length / 5)} className="rounded-full p-2" style={{ background: PAPER, opacity: faqPage >= Math.ceil(faqs.length / 5) ? 0.4 : 1 }} aria-label="다음 페이지">
                  <ChevronRight size={16} color={INK_SOFT} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== SESSION CONFLICT POPUP ===== */}
      {sessionConflict && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: CARD }}>
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: CORAL_TINT }}>
              <ShieldCheck size={26} color={CORAL} />
            </div>
            <div className="font-extrabold text-base mb-2" style={{ color: INK }}>이미 다른 기기에서 로그인되어 있어요</div>
            <div className="text-sm mb-6" style={{ color: INK_SOFT }}>
              현재 <b>{sessionConflict.existingLabel}</b>에서 로그인 중이에요.<br />
              이 기기({sessionConflict.deviceLabel})로 계속하시면, 기존 기기는 자동으로 로그아웃돼요.
            </div>
            <div className="flex gap-2">
              <button onClick={cancelReplaceSession} className="flex-1 rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: PAPER, color: INK }}>
                취소
              </button>
              <button onClick={confirmReplaceSession} className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: CORAL }}>
                이 기기로 계속하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FULLSCREEN MAP ===== */}
      {isMapFullscreen && (
        <div className="fixed inset-0 z-[70] flex flex-col" style={{ background: "#fff" }}>
          <div className="sticky top-0 flex items-center justify-between px-5 py-3.5" style={{ background: CARD, borderBottom: `1px solid ${LINE}` }}>
            <span className="font-extrabold text-sm" style={{ color: INK }}>지도 크게 보기</span>
            <button onClick={() => setIsMapFullscreen(false)} className="rounded-full p-1.5 hover:bg-black/5" aria-label="닫기">
              <X size={20} color={INK_SOFT} />
            </button>
          </div>
          <div ref={fullscreenMapContainerRef} className="flex-1 w-full" />
          <button onClick={locateMe} className="absolute bottom-6 right-5 rounded-full p-3 shadow-md transition-all duration-200 active:scale-90" style={{ background: "#fff", border: `1px solid ${LINE}` }} aria-label="내 위치 찾기">
            <LocateFixed size={20} color={TEAL} />
          </button>
        </div>
      )}

      {/* ===== DELETE ACCOUNT POPUP ===== */}
      {showDeleteAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: CARD }}>
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: CORAL_TINT }}>
              <Trash2 size={26} color={CORAL} />
            </div>
<div className="font-extrabold text-base mb-2" style={{ color: INK }}>정말 탈퇴하시겠어요?</div>
            <div className="text-sm mb-6" style={{ color: INK_SOFT }}>
              탈퇴하시면 포인트, 등록한 장소, 즐겨찾기 등<br />모든 정보가 삭제되며 되돌릴 수 없어요.<br /><br />
              <b style={{ color: CORAL }}>탈퇴 후 7일간은 같은 이메일로 다시 가입하실 수 없어요.</b>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteAccount(false)} className="flex-1 rounded-full py-3 text-sm font-bold transition-all duration-200 active:scale-95" style={{ background: PAPER, color: INK }}>
                취소
              </button>
              <button onClick={deleteMyAccount} className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95" style={{ background: CORAL }}>
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PLACE CONTEXT MENU ===== */}
      {placeContextMenu && (
        <div onClick={() => setPlaceContextMenu(null)} className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-xs rounded-t-3xl sm:rounded-3xl overflow-hidden" style={{ background: CARD, boxShadow: "0 -8px 30px rgba(0,0,0,0.15)" }}>
            <div className="px-5 pt-5 pb-3 text-center" style={{ borderBottom: `1px solid ${LINE}` }}>
              <div className="font-extrabold text-sm truncate" style={{ color: INK }}>{placeContextMenu.name}</div>
              <div className="text-xs mt-0.5 truncate" style={{ color: INK_SOFT }}>{placeContextMenu.address}</div>
            </div>
            <div className="py-2">
              {(isAdmin || placeContextMenu.created_by === session.user.id) && (
                <>
                  <button
                    onClick={() => { const p = placeContextMenu; setPlaceContextMenu(null); if (isAdmin && placeContextMenu.created_by !== session.user.id) adminEditPlace(p); else startEdit(p); }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-150 active:bg-black/5"
                  >
                    <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 34, height: 34, background: TEAL_TINT }}>
                      <Pencil size={16} color={TEAL_DARK} />
                    </span>
                    <span className="text-sm font-bold" style={{ color: INK }}>수정하기</span>
                  </button>
                  <button
                    onClick={() => { const p = placeContextMenu; setPlaceContextMenu(null); if (isAdmin && placeContextMenu.created_by !== session.user.id) setDeletingPlace({ ...p, isAdminAction: true }); else deletePlace(p); }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-150 active:bg-black/5"
                  >
                    <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 34, height: 34, background: CORAL_TINT }}>
                      <Trash2 size={16} color={CORAL} />
                    </span>
                    <span className="text-sm font-bold" style={{ color: CORAL }}>삭제하기</span>
                  </button>
                  <div className="mx-5 my-1" style={{ borderTop: `1px solid ${LINE}` }} />
                </>
              )}
              <button
                onClick={() => { toggleFavorite(placeContextMenu.id); setPlaceContextMenu(null); }}
                className="w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-150 active:bg-black/5"
              >
                <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 34, height: 34, background: favorites.has(placeContextMenu.id) ? "#FFF3D6" : PAPER }}>
                  <Star size={16} color={favorites.has(placeContextMenu.id) ? "#E8A800" : INK_SOFT} fill={favorites.has(placeContextMenu.id) ? "#E8A800" : "none"} />
                </span>
                <span className="text-sm font-bold" style={{ color: INK }}>{favorites.has(placeContextMenu.id) ? "즐겨찾기 해제하기" : "즐겨찾기하기"}</span>
              </button>
              <button
                onClick={() => { shareToKakao(placeContextMenu); setPlaceContextMenu(null); }}
                className="w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-150 active:bg-black/5"
              >
                <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 34, height: 34, background: "#FEE500" }}>
                  <MessageCircle size={16} color="#3C1E1E" fill="#3C1E1E" />
                </span>
                <span className="text-sm font-bold" style={{ color: INK }}>친구에게 공유하기</span>
              </button>
              {placeContextMenu.created_by !== session.user.id && (
                <button
                  onClick={() => { reportPlace(placeContextMenu); setPlaceContextMenu(null); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-150 active:bg-black/5"
                >
                  <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 34, height: 34, background: CORAL_TINT }}>
                    <Flag size={16} color={CORAL} />
                  </span>
                  <span className="text-sm font-bold" style={{ color: CORAL }}>신고하기</span>
                </button>
              )}
            </div>
            <div className="p-3" style={{ borderTop: `1px solid ${LINE}` }}>
              <button onClick={() => setPlaceContextMenu(null)} className="w-full rounded-full py-3 text-sm font-bold" style={{ background: PAPER, color: INK }}>
                취소
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
          onClick={() => { if (!didSwipe.current && imageScale === 1) setPreviewImages([]); }}
          onTouchStart={handleSwipeStart}
          onTouchMove={handlePinchMove}
          onTouchEnd={handleSwipeEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
          style={{ background: "rgba(0,0,0,0.85)", cursor: "grab" }}
        >
          <img src={previewImages[previewIndex]} alt="확대 이미지" className="max-w-full max-h-full rounded-2xl transition-transform duration-100" style={{ transform: `scale(${imageScale})` }} />
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
              {showSwipeHint && (
                <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center px-6 pointer-events-none">
                  <span className="rounded-full px-4 py-2 text-xs font-bold" style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>
                    ← 밀어서 사진을 넘겨보세요 →
                  </span>
                </div>
              )}
            </>
          )}
          <button onClick={() => { setPreviewImages([]); setImageScale(1); }} className="absolute top-5 right-5 rounded-full p-3" style={{ background: "rgba(255,255,255,0.15)" }} aria-label="닫기">
            <X size={22} color="#fff" />
          </button>
        </div>
      )}

    {/* ===== COUPON POP (SIMPLE) ===== */}
        {showCouponPop && (
        <div onClick={() => setShowCouponPop(false)} className="fixed inset-0 z-[70] flex items-center justify-center px-8" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xs rounded-3xl p-6 text-center relative" style={{ background: CARD }}>
            <button onClick={() => setShowCouponPop(false)} className="absolute top-4 right-4 rounded-full p-1.5 transition-all duration-150 active:scale-90" style={{ background: PAPER }} aria-label="닫기">
              <X size={16} color={INK_SOFT} />
            </button>
            <div className="text-5xl mb-3 mt-2">🎁</div>
            <div className="font-extrabold text-lg mb-6" style={{ color: INK }}>쿠폰이 도착했어요!</div>
            <button
              onClick={() => { setShowCouponPop(false); setTab("my"); setTimeout(() => { document.getElementById("coupon-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }}
              className="w-full rounded-full py-3.5 font-extrabold text-white transition-all duration-200 active:scale-[0.98]"
              style={{ background: TEAL }}
            >
              쿠폰 확인하기
            </button>
          </div>
        </div>
      )}

      {/* ===== SCROLL TO TOP ===== */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed sm:hidden z-40 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{ bottom: 148, right: 16, width: 58, height: 58, background: TEAL, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
          aria-label="맨 위로"
        >
          <ChevronRight size={28} color="#fff" style={{ transform: "rotate(-90deg)" }} />
        </button>
      )}

      {showScrollTop && (
        
          <a href="http://pf.kakao.com/_xkuexaX/chat"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed sm:hidden z-40 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{ bottom: 84, right: 16, width: 58, height: 58, background: "#FEE500", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
          aria-label="카카오톡 상담"
        >
          <Headset size={26} color="#3C1E1E" />
        </a>
      )}

      {/* ===== TOAST ===== */}
      <div className="fixed left-1/2 z-50 pointer-events-none transition-all duration-300"
        style={{ bottom: toast ? 24 : 0, opacity: toast ? 1 : 0, transform: `translateX(-50%) translateY(${toast ? 0 : 10}px)` }}>
        {toast && <div className="rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg" style={{ background: INK }}>{toast}</div>}
      </div>

       <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8" key={tab} style={{ animation: "fadeIn 0.25s ease" }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }`}</style>

        {/* ===================== 홈 ===================== */}
        {tab === "home" && (
          <div>
            <div className="mb-6">
        <div className="flex items-center gap-1.5 rounded-full px-3 py-2.5 mb-3" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                         <Search size={16} color={INK_SOFT} className="ml-1" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="예) 한식, 카페, 강남역" className="flex-1 min-w-0 outline-none text-sm bg-transparent" style={{ color: INK }} />
                           <button
                  onClick={() => {}}
                  className="flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 active:scale-90"
                  style={{ width: 36, height: 36, minWidth: 36, background: TEAL }}
                  aria-label="검색하기"
                >
                  <Search size={16} color="#fff" />
                </button>
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
                  <>
                    <div className="hidden sm:flex absolute top-3 right-3 flex-col gap-2" style={{ width: 56 }}>
                      {campaigns.slice(0, 4).map((c, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setCampaignIndex(i); }}
                          className="rounded-lg overflow-hidden transition-all duration-200"
                          style={{ height: 40, border: i === campaignIndex ? `2.5px solid #fff` : "2.5px solid rgba(255,255,255,0.5)", boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }}
                        >
                          <img src={c.image_url} alt="" className="w-full h-full object-cover" style={{ opacity: i === campaignIndex ? 1 : 0.6 }} />
                        </button>
                      ))}
                    </div>
                    <div className="flex sm:hidden absolute bottom-2 right-3 gap-1.5">
                      {campaigns.map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === campaignIndex ? "#fff" : "rgba(255,255,255,0.4)" }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-2xl p-5 mb-6 text-white" style={{ background: `linear-gradient(120deg, ${CORAL}, #F58152)` }}>
                <div className="text-xs font-bold opacity-85 mb-1">이번 달 캠페인</div>
                <div className="font-extrabold text-lg leading-snug">신규 장소 등록하고 2P 받아가세요</div>
              </div>
            )}

                         {guardians.some((g) => g.status === "accepted") && (
                <button
              onClick={sendSOSAlert}
              disabled={sendingSOS}
              className="w-full flex items-center justify-center gap-3 rounded-2xl py-5 mb-4 font-extrabold text-white transition-all duration-200 active:scale-[0.98] sos-button-pulse"
              style={{ background: `linear-gradient(120deg, ${CORAL}, #E8442A)`, opacity: sendingSOS ? 0.7 : 1, boxShadow: "0 4px 16px rgba(240,96,61,0.4)" }}
            >
              <span style={{ fontSize: 26 }}>🆘</span>
                <div className="text-left">
                <div style={{ fontSize: 16 }}>{sendingSOS ? "위치 전송 중..." : "도움이 필요해요"}</div>
                <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>보호자에게 즉시 위치를 알려드려요</div>
              </div>
            </button>
                )}
<div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-extrabold text-sm truncate" style={{ color: INK }}>등록된 장소 {filteredPlaces.length}곳</span>
                              <button onClick={() => setShowRecencyHelp(true)} className="rounded-full p-0.5 flex-shrink-0" aria-label="정보 최신성 안내">
                  <span className="flex items-center justify-center rounded-full text-xs font-extrabold flex-shrink-0" style={{ width: 20, height: 20, background: TEAL, color: "#fff" }}>?</span>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
       <button onClick={() => setOpenFilterActive(!openFilterActive)} className="text-xs font-bold flex items-center gap-1 rounded-full px-3 py-1.5 border transition-all duration-200 flex-shrink-0" style={{ borderColor: TEAL, background: openFilterActive ? TEAL : "#fff", color: openFilterActive ? "#fff" : TEAL }}>
                  🟢 영업중만
                </button>
                <div className="relative flex-shrink-0">
                  <button onClick={() => setShowDistancePicker(!showDistancePicker)} className="text-xs font-bold flex items-center gap-1 rounded-full px-3 py-1.5 border transition-all duration-200" style={{ borderColor: TEAL, background: distanceFilter ? TEAL : "#fff", color: distanceFilter ? "#fff" : TEAL }}>
                    📍 {distanceFilter ? `${distanceFilter}km 이내` : "거리"}
                  </button>
                  {showDistancePicker && (
                    <div className="absolute top-full right-0 mt-1.5 rounded-xl overflow-hidden z-10" style={{ background: CARD, border: `1px solid ${LINE}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
     {[3, 5, 10].map((km) => (
                        <button key={km} onClick={() => {
                          setDistanceFilter(distanceFilter === km ? null : km);
                          setShowDistancePicker(false);
                          if (!myLocation) locateMe();
                        }} className="block w-full px-4 py-2.5 text-xs font-bold text-left whitespace-nowrap" style={{ color: distanceFilter === km ? TEAL : INK, background: distanceFilter === km ? TEAL_TINT : "transparent" }}>
                          {km}km 이내
                        </button>
                      ))}
                      <button onClick={() => { setDistanceFilter(null); setShowDistancePicker(false); }} className="block w-full px-4 py-2.5 text-xs font-bold text-left whitespace-nowrap" style={{ color: !distanceFilter ? TEAL : INK, background: !distanceFilter ? TEAL_TINT : "transparent", borderTop: `1px solid ${LINE}` }}>
                        전체보기
                      </button>
                    </div>
                  )}
                </div>
                {activeFilters.length > 0 && (
                  <button onClick={() => setActiveFilters([])} className="text-xs font-bold flex items-center gap-1 flex-shrink-0" style={{ color: INK_SOFT }}><X size={12} /> 필터 초기화</button>
                )}
              </div>
            </div>

                   <div className="grid sm:grid-cols-2 gap-3 min-w-0">
              {visiblePlaces.map((p) => (
                     <div key={p.id} onClick={() => { setPendingFocusId(p.id); setTab("map"); }} className="cursor-pointer min-w-0">
<PlaceCard place={p} onHelpful={markHelpful} isFavorite={favorites.has(p.id)} onToggleFavorite={toggleFavorite} onEdit={startEdit} isOwner={p.created_by === session.user.id} onImageClick={(urls, idx) => { setPreviewImages(urls); setPreviewIndex(idx); setShowSwipeHint(urls.length > 1); }} onShare={shareToKakao} onDirections={openDirections} onReport={reportPlace} onDelete={deletePlace} isAdminUser={isAdmin} onAdminEdit={adminEditPlace} onAdminDelete={(p) => setDeletingPlace({ ...p, isAdminAction: true })} holidays={holidays} onViewReviews={(p) => { setViewingReviewsPlace(p); fetchReviews(p.id); }} onConfirmInfo={confirmPlaceInfo} onShowRecencyHelp={() => setShowRecencyHelp(true)} onOpenMenu={setPlaceContextMenu} onOpenDetail={setViewingDetailPlace} onGoToMap={(p) => { setPendingFocusId(p.id); setTab("map"); }} />
                             </div>
                         ))}
              {filteredPlaces.length === 0 && (
                <div className="col-span-2 text-center py-14">
                  <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: TEAL_TINT }}>
                    <MapPin size={26} color={TEAL} />
                  </div>
                  <div className="text-sm font-bold mb-1" style={{ color: INK }}>
                    {query.trim() || activeFilters.length > 0 ? "검색 결과가 없어요" : "아직 등록된 장소가 없어요"}
                  </div>
                  <div className="text-xs mb-4" style={{ color: INK_SOFT }}>
                    {query.trim() || activeFilters.length > 0 ? "이 장소를 알고 계신가요? 직접 등록해보세요!" : "첫 번째 장소를 등록하고 포인트를 받아보세요"}
                  </div>
                  <button onClick={() => setTab("register")} className="rounded-full px-5 py-2.5 text-xs font-bold text-white transition-all duration-200 active:scale-95" style={{ background: TEAL }}>
                    장소 등록하러 가기
                  </button>
                </div>
                      )}
            </div>
        
           </div>
        )}
        {/* ===================== 지도·검색 ===================== */}
        {tab === "map" && (
          <div>
                       <div className="relative mb-6">
                        <div ref={mapContainerRef} onClick={() => {
                if (mapInstanceRef.current) {
                  const center = mapInstanceRef.current.getCenter();
                  setFullscreenCenter({ lat: center.getLat(), lng: center.getLng(), level: mapInstanceRef.current.getLevel() });
                }
                setIsMapFullscreen(true);
              }} className="w-full h-72 rounded-2xl overflow-hidden cursor-pointer" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
              <button onClick={(e) => { e.stopPropagation(); locateMe(); }} className="absolute bottom-3 right-3 rounded-full p-2.5 shadow-md transition-all duration-200 active:scale-90" style={{ background: "#fff", border: `1px solid ${LINE}` }} aria-label="내 위치 찾기">
                <LocateFixed size={18} color={TEAL} />
              </button>
              <div className="absolute top-3 left-3 rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 pointer-events-none" style={{ background: "rgba(255,255,255,0.9)", color: INK }}>
                <ZoomIn size={13} /> 탭하여 크게 보기
              </div>
            </div>
<select value={mapCategory || ""} onChange={(e) => setMapCategory(e.target.value || null)} className="w-full rounded-xl px-4 py-3 mb-3 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }}>
              <option value="">전체 카테고리</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
   <div className="flex items-center gap-2 mb-5 flex-wrap">
              <div className="relative">
                <button onClick={() => setShowDistancePicker(!showDistancePicker)} className="text-xs font-bold flex items-center gap-1 rounded-full px-3.5 py-2 border transition-all duration-200" style={{ borderColor: TEAL, background: distanceFilter ? TEAL : "#fff", color: distanceFilter ? "#fff" : TEAL }}>
                  📍 {distanceFilter ? `${distanceFilter}km 이내` : "거리"}
                </button>
                {showDistancePicker && (
                  <div className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-10" style={{ background: CARD, border: `1px solid ${LINE}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <button onClick={() => { setDistanceFilter(null); setShowDistancePicker(false); }} className="block w-full px-4 py-2.5 text-xs font-bold text-left whitespace-nowrap" style={{ color: !distanceFilter ? TEAL : INK, background: !distanceFilter ? TEAL_TINT : "transparent" }}>전체보기</button>
                    {[3, 5, 10].map((km) => (
                      <button key={km} onClick={() => {
                        setDistanceFilter(distanceFilter === km ? null : km);
                        setShowDistancePicker(false);
                        if (!myLocation) locateMe();
                      }} className="block w-full px-4 py-2.5 text-xs font-bold text-left whitespace-nowrap" style={{ color: distanceFilter === km ? TEAL : INK, background: distanceFilter === km ? TEAL_TINT : "transparent" }}>{km}km 이내</button>
                    ))}
                  </div>
                )}
              </div>
            <div className="relative">
<button onClick={() => setShowAccessPicker(!showAccessPicker)} className="text-xs font-bold flex items-center gap-1.5 rounded-full px-3.5 py-2 border transition-all duration-200" style={{ borderColor: TEAL, background: mapAccessFilter ? TEAL : "#fff", color: mapAccessFilter ? "#fff" : TEAL }}>
                  {mapAccessFilter === "stroller" ? <Baby size={13} /> : <Accessibility size={13} />}
                  {mapAccessFilter ? { wheelchair: "휠체어 출입", stroller: "유모차 가능", toilet: "장애인 화장실", parking: "장애인 주차" }[mapAccessFilter] : "접근성"}
                </button>
                {showAccessPicker && (
                  <div className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-10" style={{ background: CARD, border: `1px solid ${LINE}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <button onClick={() => { setMapAccessFilter(null); setShowAccessPicker(false); }} className="block w-full px-4 py-2.5 text-xs font-bold text-left whitespace-nowrap" style={{ color: !mapAccessFilter ? TEAL : INK, background: !mapAccessFilter ? TEAL_TINT : "transparent" }}>전체보기</button>
               {[{ key: "wheelchair", label: "휠체어 출입", icon: Accessibility }, { key: "stroller", label: "유모차 가능", icon: Baby }, { key: "toilet", label: "장애인 화장실", icon: Accessibility }, { key: "parking", label: "장애인 주차", icon: Accessibility }].map((opt) => {
                      const OptIcon = opt.icon;
                      return (
                        <button key={opt.key} onClick={() => { setMapAccessFilter(mapAccessFilter === opt.key ? null : opt.key); setShowAccessPicker(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-left whitespace-nowrap" style={{ color: mapAccessFilter === opt.key ? TEAL : INK, background: mapAccessFilter === opt.key ? TEAL_TINT : "transparent" }}>
                          <OptIcon size={14} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
                    <div className="grid sm:grid-cols-2 gap-3 min-w-0">
{(mapCategory ? places.filter((p) => p.category === mapCategory) : places).filter((p) => {
                if (!distanceFilter || !myLocation) return true;
                return p.lat && p.lng && calcDistanceKm(myLocation.lat, myLocation.lng, p.lat, p.lng) <= distanceFilter;
              }).filter((p) => {
                if (!mapAccessFilter) return true;
                if (mapAccessFilter === "wheelchair") return p.entrance_step === "ramp" || p.entrance_step === "none";
                if (mapAccessFilter === "stroller") return p.has_stroller_access;
                if (mapAccessFilter === "toilet") return p.accessible_toilet === "yes";
                return true;
              }).slice().sort((a, b) => {
                if (!myLocation) return 0;
                if (!a.lat || !a.lng) return 1;
                if (!b.lat || !b.lng) return -1;
                return calcDistanceKm(myLocation.lat, myLocation.lng, a.lat, a.lng) - calcDistanceKm(myLocation.lat, myLocation.lng, b.lat, b.lng);
              }).map((p) => (
    <div key={p.id} className="min-w-0">
              <PlaceCard place={p} onHelpful={markHelpful} isFavorite={favorites.has(p.id)} onToggleFavorite={toggleFavorite} onEdit={startEdit} isOwner={p.created_by === session.user.id} onImageClick={(urls, idx) => { setPreviewImages(urls); setPreviewIndex(idx); setShowSwipeHint(urls.length > 1); }} onShare={shareToKakao} onDirections={openDirections} onReport={reportPlace} onDelete={deletePlace} isAdminUser={isAdmin} onAdminEdit={adminEditPlace} onAdminDelete={(p) => setDeletingPlace({ ...p, isAdminAction: true })} holidays={holidays} onViewReviews={(p) => { setViewingReviewsPlace(p); fetchReviews(p.id); }} onConfirmInfo={confirmPlaceInfo} onShowRecencyHelp={() => setShowRecencyHelp(true)} onOpenMenu={setPlaceContextMenu} onOpenDetail={setViewingDetailPlace} onGoToMap={(p) => focusOnPlace(p.id)} />
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
              <h2 className="font-extrabold text-xl" style={{ color: INK }}>{editingPlaceId ? "장소 수정" : "장소 등록"}</h2>
                    <div className="text-xs" style={{ color: INK_SOFT }}>{isAdminEditingPlace ? "🛠️ 관리자 권한으로 신고된 정보를 수정하고 있어요" : editingPlaceId ? "정보를 최신으로 업데이트해주세요" : "접근성 정보를 등록하고 포인트를 받으세요"}</div>
                  </div>
                </div>
        {!editingPlaceId && (
                  <button type="button" onClick={() => setShowShopExplainCard(true)} className="w-full flex items-center justify-center gap-2 rounded-xl py-3 mb-5 text-sm font-bold transition-all duration-200 active:scale-95 shop-explain-blink" style={{ background: TEAL_TINT, color: TEAL_DARK }}>
                    <Camera size={16} />
                    촬영 전, 매장에 이 화면 보여주기
                  </button>
                )}

                <div className="rounded-2xl p-4 mb-4" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                  <div className="text-xs font-bold mb-3" style={{ color: TEAL }}>📍 기본 정보</div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>장소명</label>
<div className="flex items-center gap-2 mb-1">
 <input id="place-name-input" value={form.name} onClick={() => setShowNameInputChoice(true)} readOnly={!isNameInputManual} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예) 행복나눔 도서관"
                    className="flex-1 min-w-0 rounded-xl px-4 py-3 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                                                   <button
                    type="button"
                    onClick={translatePlaceName}
                    disabled={isTranslating}
                    className="flex flex-col items-center justify-center gap-0.5 rounded-xl flex-shrink-0 transition-all duration-200 active:scale-90"
                    style={{ width: 56, height: 56, minWidth: 56, background: TEAL, boxShadow: "0 2px 8px rgba(15,110,98,0.25)", opacity: isTranslating ? 0.7 : 1 }}
                    aria-label="영어를 한글로 번역하기"
                  >
                                 {isTranslating ? (
                      <>
                        <div className="rounded-full animate-spin" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff" }} />
                        <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>번역중</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 16 }}>🌐</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>번역</span>
                      </>
                    )}
                        </button>
                </div>
                     {isTranslating && (
                  <p className="text-xs mb-3 font-bold" style={{ color: TEAL_DARK }}>
                    🌐 번역하고 있어요, 잠시만 기다려주세요...
                  </p>
                )}
                {isOcrProcessing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-full animate-spin mb-3" style={{ width: 40, height: 40, border: "4px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
          <div className="text-white font-bold text-sm">글자를 읽고 있어요...</div>
        </div>
      )}
      {showNameInputChoice && (
        <div onClick={() => setShowNameInputChoice(false)} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5" style={{ background: CARD }}>
            <div className="font-extrabold text-base mb-4 text-center" style={{ color: INK }}>장소명을 어떻게 입력할까요?</div>
            <button onClick={captureAndRecognizeText} className="w-full flex items-center gap-3 rounded-2xl p-4 mb-2.5 transition-all duration-200 active:scale-[0.98]" style={{ background: TEAL_TINT }}>
              <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 44, height: 44, background: TEAL }}>
                <Camera size={22} color="#fff" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm" style={{ color: TEAL_DARK }}>카메라로 찍기</div>
                <div className="text-xs" style={{ color: INK_SOFT }}>간판을 촬영하면 자동으로 입력돼요</div>
              </div>
            </button>
          <button onClick={() => { setIsNameInputManual(true); setShowNameInputChoice(false); setTimeout(() => document.getElementById("place-name-input")?.focus(), 100); }} className="w-full flex items-center gap-3 rounded-2xl p-4 transition-all duration-200 active:scale-[0.98]" style={{ background: PAPER }}>
              <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 44, height: 44, background: "#fff", border: `1.4px solid ${LINE}` }}>
                <Pencil size={20} color={INK_SOFT} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm" style={{ color: INK }}>직접 입력하기</div>
                <div className="text-xs" style={{ color: INK_SOFT }}>키보드로 타이핑해서 입력해요</div>
              </div>
            </button>
          </div>
        </div>
      )}

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

                <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>전화번호 (선택)</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="예: 02-1234-5678"
                  className="w-full rounded-xl px-4 py-3 mb-4 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />

                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold" style={{ color: INK_SOFT }}>영업시간 설정 (선택)</label>
                  <button type="button" onClick={() => setForm({ ...form, useHours: !form.useHours })} className="relative rounded-full transition-all duration-200" style={{ width: 40, height: 22, background: form.useHours ? TEAL : LINE }}>
                    <div className="absolute rounded-full bg-white transition-all duration-200" style={{ width: 16, height: 16, top: 3, left: form.useHours ? 21 : 3 }} />
                  </button>
                </div>
                                                    {form.useHours && (
                  <div className="rounded-xl p-3 mb-4" style={{ border: `1.4px solid ${LINE}` }}>
                    <div className="flex gap-2 mb-3">
                      <button type="button" onClick={() => setForm({ ...form, hoursMode: "24h" })} className="flex-1 rounded-lg py-2 text-xs font-bold" style={{ background: form.hoursMode === "24h" ? TEAL : PAPER, color: form.hoursMode === "24h" ? "#fff" : INK_SOFT }}>
                        24시간 영업
                      </button>
                      <button type="button" onClick={() => setForm({ ...form, hoursMode: "same" })} className="flex-1 rounded-lg py-2 text-xs font-bold" style={{ background: form.hoursMode === "same" ? TEAL : PAPER, color: form.hoursMode === "same" ? "#fff" : INK_SOFT }}>
                        매일 동일하게
                      </button>
                      <button type="button" onClick={() => setForm({ ...form, hoursMode: "custom" })} className="flex-1 rounded-lg py-2 text-xs font-bold" style={{ background: form.hoursMode === "custom" ? TEAL : PAPER, color: form.hoursMode === "custom" ? "#fff" : INK_SOFT }}>
                        요일별로
                      </button>
                    </div>

                    {form.hoursMode === "24h" && (
                      <div className="text-center py-4 text-xs font-bold" style={{ color: TEAL }}>연중무휴 24시간 영업이에요</div>
                    )}

                    {form.hoursMode === "same" && (
                      <div className="flex items-center gap-2 py-2">
                        <input type="time" value={form.sameOpen} onChange={(e) => setForm({ ...form, sameOpen: e.target.value })}
                          className="flex-1 rounded-lg px-2 py-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, minWidth: 0 }} />
                        <span className="text-xs" style={{ color: INK_SOFT }}>~</span>
                        <input type="time" value={form.sameClose} onChange={(e) => setForm({ ...form, sameClose: e.target.value })}
                          className="flex-1 rounded-lg px-2 py-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, minWidth: 0 }} />
                      </div>
                    )}

                                {form.hoursMode === "custom" && (
                      <div>
                      {holidays && (
                      <div className="mb-3 pb-3" style={{ borderBottom: `1px dashed ${LINE}` }}>
                        <div className="text-xs font-bold mb-2" style={{ color: INK_SOFT }}>다가오는 공휴일에도 영업하시나요? (선택)</div>
                        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                          {Object.entries(holidays)
                            .filter(([date]) => new Date(date) >= new Date(new Date().toDateString()))
                            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                            .slice(0, 8)
                            .map(([date, names]) => {
                              const checked = form.openHolidays.includes(date);
                              return (
                                <label key={date} className="flex items-center gap-2 text-xs cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const next = e.target.checked
                                        ? [...form.openHolidays, date]
                                        : form.openHolidays.filter((d) => d !== date);
                                      setForm({ ...form, openHolidays: next });
                                    }}
                                  />
 <span style={{ color: INK }}>{date} ({Array.isArray(names) ? names.join(", ") : (typeof names === "string" ? names : JSON.stringify(names))})</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}
                    {WEEKDAYS.map((d) => {
                      const dayData = form.businessHours[d.key];
                      return (
                        <div key={d.key} className="flex items-center gap-2 mb-2 last:mb-0">
                          <span className="text-xs font-bold w-5 flex-shrink-0" style={{ color: INK }}>{d.label}</span>
                          <button type="button" onClick={() => setForm({ ...form, businessHours: { ...form.businessHours, [d.key]: { ...dayData, closed: !dayData.closed } } })}
                            className="text-[10px] font-bold rounded-lg px-2 py-1.5 flex-shrink-0" style={{ background: dayData.closed ? CORAL_TINT : TEAL_TINT, color: dayData.closed ? CORAL : TEAL_DARK }}>
                            {dayData.closed ? "휴무" : "영업"}
                          </button>
                          {!dayData.closed && (
                            <>
                              <input type="time" value={dayData.open} onChange={(e) => setForm({ ...form, businessHours: { ...form.businessHours, [d.key]: { ...dayData, open: e.target.value } } })}
                                className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, minWidth: 0 }} />
                              <span className="text-xs" style={{ color: INK_SOFT }}>~</span>
                              <input type="time" value={dayData.close} onChange={(e) => setForm({ ...form, businessHours: { ...form.businessHours, [d.key]: { ...dayData, close: e.target.value } } })}
                                className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, minWidth: 0 }} />
                            </>
                          )}
                                                                                 </div>
                      );
                                                         })}
                  </div>
                )}
                  </div>
                )}
                <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>카테고리</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl px-4 py-3 mb-5 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

               <label className="block text-xs font-bold mb-3" style={{ color: INK_SOFT }}>접근성 정보 (모르면 "미확인"으로 두셔도 괜찮아요)</label>

                <div className="mb-4">
                  <div className="text-xs font-bold mb-1.5" style={{ color: INK }}>입구 진입</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[{ v: "none", l: "턱 없음" }, { v: "ramp", l: "경사로" }, { v: "steps", l: "계단만" }, { v: "unknown", l: "미확인" }].map((o) => (
                      <button type="button" key={o.v} onClick={() => setForm({ ...form, entrance_step: o.v })} className="rounded-lg py-2 text-[11px] font-bold border transition-all duration-200" style={{ borderColor: form.entrance_step === o.v ? TEAL : LINE, background: form.entrance_step === o.v ? TEAL_TINT : "#fff", color: form.entrance_step === o.v ? TEAL_DARK : INK_SOFT }}>{o.l}</button>
                    ))}
                  </div>
                </div>

 <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="text-xs font-bold" style={{ color: INK }}>출입문 종류</div>
                    <button type="button" onClick={() => setShowDoorTypeHelp(true)} className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 15, height: 15, background: TEAL }} aria-label="출입문 종류 안내">
                      <span className="text-[9px] font-extrabold" style={{ color: "#fff" }}>?</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[{ v: "auto", l: "자동문" }, { v: "swing", l: "여닫이" }, { v: "slide", l: "미닫이" }, { v: "unknown", l: "미확인" }].map((o) => (
                      <button type="button" key={o.v} onClick={() => setForm({ ...form, door_type: o.v })} className="rounded-lg py-2 text-[11px] font-bold border transition-all duration-200" style={{ borderColor: form.door_type === o.v ? TEAL : LINE, background: form.door_type === o.v ? TEAL_TINT : "#fff", color: form.door_type === o.v ? TEAL_DARK : INK_SOFT }}>{o.l}</button>
                    ))}
                  </div>
                </div>

     <div className="mb-4">
                  <div className="text-xs font-bold mb-1.5" style={{ color: INK }}>문턱 높이 (cm, 모르면 비워두세요)</div>
                  <input type="number" value={form.threshold_cm} onChange={(e) => setForm({ ...form, threshold_cm: e.target.value })} placeholder="예: 3" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                </div>

                <div className="mb-4">
                  <div className="text-xs font-bold mb-1.5" style={{ color: INK }}>출입문 유효폭 (cm, 모르면 비워두세요)</div>
                  <input type="number" value={form.door_width_cm} onChange={(e) => setForm({ ...form, door_width_cm: e.target.value })} placeholder="예: 80" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                </div>

<div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="text-xs font-bold" style={{ color: INK }}>내부 휠체어 회전 공간</div>
                    <button type="button" onClick={() => setShowTurningHelp(true)} className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 15, height: 15, background: TEAL }} aria-label="내부 회전 공간 안내">
                      <span className="text-[9px] font-extrabold" style={{ color: "#fff" }}>?</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[{ v: "yes", l: "여유 있음" }, { v: "no", l: "비좁음" }, { v: "unknown", l: "미확인" }].map((o) => (
                      <button type="button" key={o.v} onClick={() => setForm({ ...form, turning_space: o.v })} className="rounded-lg py-2 text-[11px] font-bold border transition-all duration-200" style={{ borderColor: form.turning_space === o.v ? TEAL : LINE, background: form.turning_space === o.v ? TEAL_TINT : "#fff", color: form.turning_space === o.v ? TEAL_DARK : INK_SOFT }}>{o.l}</button>
                    ))}
                  </div>
                </div>

      <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="text-xs font-bold" style={{ color: INK }}>엘리베이터</div>
                    <button type="button" onClick={() => setShowElevatorHelp(true)} className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 15, height: 15, background: TEAL }} aria-label="엘리베이터 안내">
                      <span className="text-[9px] font-extrabold" style={{ color: "#fff" }}>?</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[{ v: "yes", l: "있음" }, { v: "no", l: "없음" }, { v: "none_needed", l: "1층뿐" }, { v: "unknown", l: "미확인" }].map((o) => (
                      <button type="button" key={o.v} onClick={() => setForm({ ...form, accessible_toilet: o.v })} className="rounded-lg py-2 text-[11px] font-bold border transition-all duration-200" style={{ borderColor: form.accessible_toilet === o.v ? TEAL : LINE, background: form.accessible_toilet === o.v ? TEAL_TINT : "#fff", color: form.accessible_toilet === o.v ? TEAL_DARK : INK_SOFT }}>{o.l}</button>
                    ))}
                  </div>
                </div>

                {form.accessible_toilet === "yes" && (
                  <div className="mb-4">
                    <div className="text-xs font-bold mb-1.5" style={{ color: INK }}>장애인 화장실 위치 (층수)</div>
                    <input type="number" value={form.toilet_floor} onChange={(e) => setForm({ ...form, toilet_floor: e.target.value })} placeholder="예: 1" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-xs font-bold mb-1.5" style={{ color: INK }}>엘리베이터</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[{ v: "yes", l: "있음" }, { v: "no", l: "없음" }, { v: "none_needed", l: "1층뿐" }, { v: "unknown", l: "미확인" }].map((o) => (
                      <button type="button" key={o.v} onClick={() => setForm({ ...form, elevator: o.v })} className="rounded-lg py-2 text-[11px] font-bold border transition-all duration-200" style={{ borderColor: form.elevator === o.v ? TEAL : LINE, background: form.elevator === o.v ? TEAL_TINT : "#fff", color: form.elevator === o.v ? TEAL_DARK : INK_SOFT }}>{o.l}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-bold mb-1.5" style={{ color: INK }}>장애인 주차구역</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[{ v: "yes", l: "있음" }, { v: "no", l: "없음" }, { v: "unknown", l: "미확인" }].map((o) => (
                      <button type="button" key={o.v} onClick={() => setForm({ ...form, parking_disabled: o.v })} className="rounded-lg py-2 text-[11px] font-bold border transition-all duration-200" style={{ borderColor: form.parking_disabled === o.v ? TEAL : LINE, background: form.parking_disabled === o.v ? TEAL_TINT : "#fff", color: form.parking_disabled === o.v ? TEAL_DARK : INK_SOFT }}>{o.l}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <button type="button" onClick={() => setForm({ ...form, badges: { ...form.badges, stroller: !form.badges.stroller } })}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold border transition-all duration-200 active:scale-95"
                    style={{ borderColor: form.badges.stroller ? TEAL : LINE, background: form.badges.stroller ? TEAL_TINT : "#fff", color: form.badges.stroller ? TEAL_DARK : INK_SOFT }}>
                    <Baby size={14} />유모차 가능
                  </button>
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
                          <button type="submit"
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
                                             {notices.slice((noticePage - 1) * 5, noticePage * 5).map((n) => {
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
                                                  {n.audio_url ? (
                        <div className="rounded-xl p-4 mb-3" style={{ background: TEAL_TINT }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Headset size={16} color={TEAL_DARK} />
                            <span className="text-sm font-bold" style={{ color: TEAL_DARK }}>🔊 음성으로 읽어드려요</span>
                          </div>
                          <audio
                            ref={(el) => { audioRefs.current[n.id] = el; }}
                            src={n.audio_url}
                            onEnded={() => setPlayingAudioId(null)}
                            className="hidden"
                          />
                          <button
                            onClick={() => {
                              const audioEl = audioRefs.current[n.id];
                              if (!audioEl) return;
                              if (playingAudioId === n.id) {
                                audioEl.pause();
                                setPlayingAudioId(null);
                              } else {
                                Object.values(audioRefs.current).forEach((a) => a?.pause());
                                audioEl.currentTime = 0;
                                audioEl.play();
                                setPlayingAudioId(n.id);
                              }
                            }}
                            className="flex items-center justify-center gap-2 w-full rounded-full py-3 font-extrabold text-white transition-all duration-200 active:scale-95"
                            style={{ background: playingAudioId === n.id ? CORAL : TEAL }}
                          >
                            {playingAudioId === n.id ? (
                              <>⏸️ 음성 멈추기</>
                            ) : (
                              <>▶️ 음성으로 듣기</>
                            )}
                          </button>
                        </div>
                      ) : (
                                            <div className="rounded-xl p-4 mb-3" style={{ background: TEAL_TINT }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Headset size={16} color={TEAL_DARK} />
                            <span className="text-sm font-bold" style={{ color: TEAL_DARK }}>음성으로 들어보세요</span>
                          </div>
                          <button
                            onClick={() => speakNotice(n.id, n.title, n.content)}
                            className="flex items-center justify-center gap-2 w-full rounded-full py-3 font-extrabold text-white transition-all duration-200 active:scale-95"
                            style={{ background: speakingNoticeId === n.id ? CORAL : TEAL }}
                          >
                            {speakingNoticeId === n.id ? (
                              <>⏸️ 음성 멈추기</>
                            ) : (
                              <>▶️ 음성으로 듣기</>
                            )}
                          </button>
                        </div>
                      )}
                      {n.image_url && (
                        <img src={n.image_url} alt={n.title} className="w-full rounded-xl mb-3" />
                      )}
                                                  <div className="text-sm mb-2" style={{ color: INK }} onClick={(e) => {
                        const link = e.target.closest("a");
                        if (link && link.getAttribute("href") === "#ranking") {
                          e.preventDefault();
                          setTab("my");
                          setTimeout(() => {
                            document.getElementById("point-ranking-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 100);
                        }
                      }}>
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
            {notices.length > 5 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button onClick={() => setNoticePage((p) => Math.max(1, p - 1))} disabled={noticePage === 1} className="rounded-full p-2" style={{ background: PAPER, opacity: noticePage === 1 ? 0.4 : 1 }} aria-label="이전 페이지">
                  <ChevronRight size={16} color={INK_SOFT} style={{ transform: "rotate(180deg)" }} />
                </button>
                <span className="text-xs font-bold" style={{ color: INK_SOFT }}>{noticePage} / {Math.max(1, Math.ceil(notices.length / 5))}</span>
                <button onClick={() => setNoticePage((p) => Math.min(Math.ceil(notices.length / 5), p + 1))} disabled={noticePage >= Math.ceil(notices.length / 5)} className="rounded-full p-2" style={{ background: PAPER, opacity: noticePage >= Math.ceil(notices.length / 5) ? 0.4 : 1 }} aria-label="다음 페이지">
                  <ChevronRight size={16} color={INK_SOFT} />
                </button>
              </div>
            )}
          </div>
        )}
        {/* ===================== 마이페이지 ===================== */}
        {tab === "my" && (
          <div className="max-w-2xl mx-auto">
<div
              onClick={() => { if (showThemePicker) setShowThemePicker(false); }}
              className="rounded-2xl p-6 mb-5 text-white relative overflow-hidden"
              style={{
                background: profile?.card_theme === "photo" && profile?.card_background_url
                  ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${profile.card_background_url}) center/cover`
                  : CARD_THEMES[profile?.card_theme || "default"].gradient,
              }}
            >
        {(() => {
                const effect = weatherEffectOn ? getWeatherEffect(myPageWeather) : null;
                if (!effect) return null;
                return (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                    {effect === "sunny" && (
                      <div className="absolute rounded-full" style={{ top: 14, right: 18, width: 36, height: 36, background: "radial-gradient(circle, #FFE99A, #FFC13B)", boxShadow: "0 0 20px 8px rgba(255,193,59,0.5)" }} />
                    )}
                    {effect === "clear_night" && (
                      <>
                        <div className="absolute rounded-full" style={{ top: 16, right: 22, width: 26, height: 26, background: "#F4F1D3", boxShadow: "0 0 14px 4px rgba(244,241,211,0.5)" }} />
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="absolute rounded-full weather-twinkle" style={{ top: `${10 + (i * 11) % 40}%`, left: `${(i * 37) % 90}%`, width: 3, height: 3, background: "#fff", animationDelay: `${i * 0.4}s` }} />
                        ))}
                      </>
                    )}
                    {(effect === "cloudy_day" || effect === "cloudy_night") && (
                      <>
                        {effect === "cloudy_night" && <div className="absolute rounded-full" style={{ top: 18, right: 30, width: 20, height: 20, background: "#F4F1D3", opacity: 0.7 }} />}
                        <div className="absolute" style={{ top: 14, right: 10, width: 60, height: 26, background: "rgba(255,255,255,0.55)", borderRadius: 999 }} />
                        <div className="absolute" style={{ top: 28, right: 40, width: 44, height: 20, background: "rgba(255,255,255,0.4)", borderRadius: 999 }} />
                      </>
                    )}
                    {effect === "rain" && (
                      <>
                        <div className="absolute" style={{ top: 10, right: 20, width: 56, height: 22, background: "rgba(255,255,255,0.35)", borderRadius: 999 }} />
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="absolute weather-rain" style={{ top: -10, left: `${(i * 10) % 100}%`, width: 2, height: 14, background: "rgba(255,255,255,0.6)", borderRadius: 2, animationDelay: `${(i % 5) * 0.25}s`, animationDuration: `${0.8 + (i % 3) * 0.2}s` }} />
                        ))}
                      </>
                    )}
                    {effect === "snow" && (
                      <>
                        <div className="absolute" style={{ top: 10, right: 20, width: 56, height: 22, background: "rgba(255,255,255,0.35)", borderRadius: 999 }} />
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="absolute rounded-full weather-snow" style={{ top: -10, left: `${(i * 10) % 100}%`, width: 5, height: 5, background: "#fff", animationDelay: `${(i % 5) * 0.4}s`, animationDuration: `${2.5 + (i % 3) * 0.5}s` }} />
                        ))}
                      </>
                    )}
                  </div>
                );
              })()}
                              <div onClick={(e) => e.stopPropagation()} className="absolute top-4 right-4 flex items-center gap-1.5 z-10" style={{ maxWidth: showThemePicker ? "calc(100% - 32px)" : "70%", overflowX: showThemePicker ? "auto" : "visible", background: showThemePicker ? "rgba(0,0,0,0.25)" : "transparent", borderRadius: 999, padding: showThemePicker ? "4px 6px" : 0 }}>
                  <button
                  onClick={() => {
                    const newVal = !weatherEffectOn;
                    setWeatherEffectOn(newVal);
                    if (typeof window !== "undefined") localStorage.setItem("weather_effect_on", newVal.toString());
                    showToast(newVal ? "날씨 효과를 켰어요" : "날씨 효과를 껐어요");
                  }}
                  className="flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-150 active:scale-90"
                  style={{ width: 44, height: 44, background: "rgba(255,255,255,0.3)" }}
                  aria-label="날씨 효과 켜고 끄기"
                >
                  {weatherEffectOn ? <Sparkles size={20} color="#fff" /> : <X size={20} color="#fff" />}
                </button>
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-150 active:scale-90"
                  style={{ width: 44, height: 44, background: "rgba(255,255,255,0.3)" }}
                  aria-label="배경 꾸미기"
                >
                  <Palette size={20} color="#fff" />
                </button>
                           {showThemePicker && (
                  <>
                    <input type="file" accept="image/*" onChange={uploadCardBackground} className="hidden" id="card-bg-upload" />
                    <label htmlFor="card-bg-upload" className="flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer transition-all duration-150 active:scale-90" style={{ width: 44, height: 44, background: "rgba(255,255,255,0.3)" }} aria-label="사진으로 꾸미기">
                      <Camera size={20} color="#fff" />
                    </label>
                    {Object.entries(CARD_THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => changeCardTheme(key)}
                        className="rounded-full flex-shrink-0 transition-all duration-150 active:scale-90"
                        style={{
                          width: 40, height: 40,
                          background: theme.gradient,
                          border: (profile?.card_theme || "default") === key ? "3px solid #fff" : "2px solid rgba(255,255,255,0.5)",
                        }}
                        aria-label={theme.label}
                      />
                    ))}
                  </>
                )}
              </div>
                                            <div className="flex flex-col items-center text-center mb-5">
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
                              <div className="relative mb-4" style={{ width: 112, height: 112 }}>
                  {tier.ringColor && (
                    <div
                      className={tier.glow ? "avatar-ring-glow" : ""}
                      style={{
                        position: "absolute", inset: -6, borderRadius: "9999px",
                        background: `conic-gradient(${tier.ringColor}, ${tier.ringColor}88, ${tier.ringColor})`,
                        padding: 4,
                      }}
                    />
                  )}
                  <label htmlFor="avatar-upload" className="w-28 h-28 rounded-full flex items-center justify-center font-extrabold cursor-pointer overflow-hidden relative flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)", border: "3.5px solid rgba(255,255,255,0.5)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                          {avatarUrl ? (
                    <img src={avatarUrl.replace(/^http:\/\//i, "https://")} alt="프로필 사진" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <User size={36} />
                  )}
                           <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-1.5" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <Camera size={14} color="#fff" />
                  </div>
                </label>
                </div>
                        <div className="flex flex-col items-center w-full">
                {editingNickname ? (
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
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
                    className="flex items-center justify-center gap-1.5 mb-1.5"
                  >
                    <span className="font-extrabold text-lg">{profile?.nickname || "닉네임 설정하기"}</span>
                    <Pencil size={14} color="rgba(255,255,255,0.7)" />
                  </button>
                )}
                              <div className="flex items-center justify-center gap-1.5 mb-3 flex-wrap" style={{ opacity: 0.85 }}>
                              {profile?.login_provider === "kakao" ? (
                    <svg width="12" height="12" viewBox="0 0 20 20" className="flex-shrink-0">
                      <path fill="#FEE500" d="M10 1C4.9 1 0.7 4.4 0.7 8.6c0 2.7 1.7 5.1 4.3 6.5-0.2 0.7-0.7 2.6-0.8 3-0.1 0.5 0.2 0.5 0.4 0.4 0.2-0.1 2.7-1.8 3.8-2.6 0.5 0.1 1.1 0.1 1.6 0.1 5.1 0 9.3-3.4 9.3-7.6C19.3 4.4 15.1 1 10 1z"/>
                    </svg>
                  ) : profile?.login_provider === "google" ? (
                    <svg width="12" height="12" viewBox="0 0 18 18" className="flex-shrink-0">
                      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
                      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
                      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
                    </svg>
                  ) : (
                    <Mail size={12} className="flex-shrink-0" />
                  )}
  {session.user.email?.endsWith("@jangpyeon.kr") ? (
                    <>
                      <span className="text-xs">{session.user.email.split("@")[0].slice(0, 3)}{"*".repeat(Math.max(0, session.user.email.split("@")[0].length - 3))}</span>
                      <button onClick={() => setShowKakaoEmailInfo(true)} className="flex items-center justify-center flex-shrink-0 active:scale-90 transition-all duration-150">
                        <span className="rounded-full flex items-center justify-center kakao-email-blink" style={{ width: 20, height: 20, background: "#FFC13B", color: "#3C1E1E", fontSize: 13, fontWeight: 900 }}>!</span>
                      </button>
                    </>
                  ) : (
                    <>
             <span className="text-xs">{showFullEmail ? session.user.email : `${session.user.email.split("@")[0].slice(0, 3)}${"*".repeat(Math.max(3, session.user.email.length - 3))}`}</span>
                      <button onClick={() => setShowFullEmail(!showFullEmail)} className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ background: "rgba(255,255,255,0.25)" }}>
                        {showFullEmail ? "가리기" : "보기"}
                      </button>
                    </>
                  )}
                </div>
            
                          {showKakaoEmailInfo && (
                  <div className="fixed inset-0 z-50" onClick={(e) => { e.stopPropagation(); setShowKakaoEmailInfo(false); }}>
                    <div onClick={(e) => e.stopPropagation()} className="absolute left-1/2 rounded-2xl px-4 py-3" style={{ top: "35%", transform: "translateX(-50%)", background: INK, color: "#fff", fontSize: 12, lineHeight: 1.7, width: 260, boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
                      카카오톡 → 설정 → 카카오계정에서 이메일 인증 후, 로그아웃하고 다시 로그인하면 이메일이 표시돼요
                    </div>
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <span className="flex items-center justify-center rounded-full" style={{ width: 20, height: 20, background: "rgba(255,255,255,0.25)", fontSize: 12 }}>{tier.emoji}</span>
                  <span className="text-xs font-extrabold">{tier.label}</span>
                </div>
                </div>
              </div>
                          <div className="flex flex-col items-center text-center pt-5 mb-4 relative w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                                     {myRank > 0 && showRankToggle && (
                  <div className="flex flex-col items-center justify-center rounded-2xl absolute" style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.5)", padding: "6px 14px", left: 20, top: 20 }}>
                    <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 700 }}>이번 달</span>
                    <span style={{ fontSize: 20, fontWeight: 900, fontFamily: MONO_FONT }}>{myRank}위</span>
                  </div>
                )}
                                      <div className="flex items-center gap-2">
                  <span className="flex sm:hidden coin-spin" style={{ fontSize: 24 }}>🪙</span>
                  <div className="hidden sm:flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 26, height: 26, background: "rgba(255,255,255,0.25)", border: "1.5px solid rgba(255,255,255,0.5)" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, fontFamily: MONO_FONT }}>P</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span style={{ fontFamily: MONO_FONT, fontSize: 36, fontWeight: 800, textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{points.toLocaleString()}</span>
                    <span style={{ fontFamily: MONO_FONT, fontSize: 18, fontWeight: 700, opacity: 0.85 }}>P</span>
                  </div>
                </div>
                <div className="text-[11px] mt-0.5" style={{ opacity: 0.7 }}>보유 포인트</div>
              </div>

              {next ? (
                <div className="rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(255,255,255,0.18)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 22 }}>{next.emoji}</span>
                      <div>
                        <div className="text-xs opacity-80">다음 등급</div>
                        <div className="text-sm font-extrabold">{next.label}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">남은 포인트</div>
                      <div className="font-extrabold" style={{ fontFamily: MONO_FONT, fontSize: 17 }}>{next.min - points}P</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl px-4 py-3 mb-4 text-center font-extrabold" style={{ background: "rgba(255,255,255,0.18)" }}>
                  🎉 최고 등급 달성!
                </div>
              )}
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
<div className="rounded-2xl p-4 mb-3" style={{ background: TEAL_TINT }}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold mb-0.5" style={{ color: TEAL_DARK }}>내 순위 공개하기</div>
                  <div className="text-xs" style={{ color: INK_SOFT }}>켜두시면 아래 랭킹에 내 순위가 보여요</div>
                </div>
                <button
                  onClick={toggleShowRank}
                  className="relative rounded-full transition-all duration-200 flex-shrink-0"
                  style={{ width: 48, height: 28, background: showRankToggle ? TEAL : LINE }}
                >
                  <div className="absolute rounded-full bg-white transition-all duration-200" style={{ width: 22, height: 22, top: 3, left: showRankToggle ? 23 : 3 }} />
                </button>
              </div>
            </div>
            <div id="point-ranking-section" className="flex items-center gap-1.5 mb-1">
              <span className="font-extrabold text-sm" style={{ color: INK }}>🏆 이달의 포인트 랭킹</span>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white" style={{ background: CORAL }}>● LIVE</span>
            </div>
                <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-[11px]" style={{ color: INK_SOFT }}>
                * {new Date().getMonth() + 1}월 한 달간 모은 포인트 기준, 매달 1일 초기화
              </div>
              <button onClick={() => setShowRankingPolicy(true)} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold flex-shrink-0" style={{ background: TEAL_TINT, color: TEAL_DARK }}>
                <ShieldCheck size={12} /> 이용 안내
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden mb-6" style={{ border: `1px solid ${LINE}`, background: CARD, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {pointRanking.length === 0 && (
                <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>아직 랭킹 정보가 없어요</div>
              )}
                         {pointRanking.map((p, i) => {
                const medalGradients = [
                  "linear-gradient(135deg, #FFD700, #FFA500)",
                  "linear-gradient(135deg, #E8E8E8, #B0B0B0)",
                  "linear-gradient(135deg, #D9924A, #A85F2A)",
                ];
                const isTop3 = i < 3;
                const isFirst = i === 0;
                return (
                  <div key={i} className="flex items-center justify-between px-4 transition-all duration-200" style={{ paddingTop: isFirst ? 20 : 14, paddingBottom: isFirst ? 20 : 14, borderBottom: i !== pointRanking.length - 1 ? `1px solid ${LINE}` : "none", background: isFirst ? "linear-gradient(90deg, #FFF9E6, transparent)" : "transparent" }}>
                    <div className="flex items-center gap-3 min-w-0">
                             {isFirst ? (
                        <div className="flex items-center justify-center flex-shrink-0 relative" style={{ width: 48, height: 48 }}>
                          <div style={{ fontSize: 40, lineHeight: 1, filter: "drop-shadow(0 3px 4px rgba(255,180,0,0.4))" }}>👑</div>
                          <div className="absolute flex items-center justify-center rounded-full font-extrabold" style={{ bottom: -4, right: -4, width: 20, height: 20, background: "#FFD700", color: "#fff", fontSize: 11, boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>1</div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center rounded-full font-extrabold flex-shrink-0" style={{ width: isTop3 ? 32 : 26, height: isTop3 ? 32 : 26, background: isTop3 ? medalGradients[i] : PAPER, color: isTop3 ? "#fff" : INK_SOFT, fontSize: isTop3 ? 15 : 12, boxShadow: isTop3 ? "0 2px 6px rgba(0,0,0,0.2)" : "none" }}>
                          {i + 1}
                        </div>
                      )}
                                      <span className="flex items-center gap-1 min-w-0">
                        {p.login_provider === "kakao" && (
                          <svg width={isFirst ? 15 : 13} height={isFirst ? 15 : 13} viewBox="0 0 20 20" className="flex-shrink-0">
                            <path fill="#FEE500" d="M10 1C4.9 1 0.7 4.4 0.7 8.6c0 2.7 1.7 5.1 4.3 6.5-0.2 0.7-0.7 2.6-0.8 3-0.1 0.5 0.2 0.5 0.4 0.4 0.2-0.1 2.7-1.8 3.8-2.6 0.5 0.1 1.1 0.1 1.6 0.1 5.1 0 9.3-3.4 9.3-7.6C19.3 4.4 15.1 1 10 1z"/>
                          </svg>
                        )}
                        {p.login_provider === "google" && (
                          <svg width={isFirst ? 15 : 13} height={isFirst ? 15 : 13} viewBox="0 0 18 18" className="flex-shrink-0">
                            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
                            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
                            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
                          </svg>
                        )}
                                <span className={isFirst ? "font-extrabold truncate" : "text-sm font-bold truncate"} style={{ color: INK, fontSize: isFirst ? 16 : undefined }}>{maskEmail(p.email)}</span>
                      </span>
                    </div>
                    <span className="flex-shrink-0" style={{ fontFamily: MONO_FONT, color: isTop3 ? CORAL : INK_SOFT, fontWeight: 800, fontSize: isFirst ? 18 : (isTop3 ? 15 : 13) }}>{p.points.toLocaleString()}P</span>
                  </div>
                );
              })}
            </div>

                         <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>👫 친구 초대하기</div>
            <div className="rounded-2xl p-4 mb-6" style={{ border: `1px solid ${LINE}`, background: TEAL_TINT }}>
              <div className="text-xs mb-3" style={{ color: TEAL_DARK }}>
                친구가 내 초대 링크로 가입하면, <b>나는 +10P</b>, <b>친구는 +5P</b>를 받아요!
              </div>
              <button onClick={copyInviteLink} className="w-full flex items-center justify-center gap-2 rounded-full py-3 font-extrabold text-white transition-all duration-200 active:scale-95" style={{ background: TEAL }}>
                <MessageCircle size={16} /> 초대 링크 복사하기
              </button>
            </div>

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>🆘 보호자 관리</div>
            <div className="rounded-2xl p-4 mb-6" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              <div className="text-xs mb-3" style={{ color: INK_SOFT }}>도움이 필요할 때, 아래 등록한 분들께 현재 위치를 알려드려요</div>
              <div className="flex gap-2 mb-3">
                <input value={newGuardianEmail} onChange={(e) => setNewGuardianEmail(e.target.value)} placeholder="보호자 이메일 입력"
                  className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, minWidth: 0 }} />
                <button onClick={addGuardian} className="rounded-xl px-4 py-2.5 text-sm font-bold text-white flex-shrink-0" style={{ background: TEAL }}>추가</button>
              </div>
              {guardians.length === 0 ? (
                <div className="text-center py-4 text-xs" style={{ color: INK_SOFT }}>등록된 보호자가 없어요</div>
              ) : (
                <div>
                  {guardians.map((g) => (
                    <div key={g.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${LINE}` }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm truncate" style={{ color: INK }}>{g.guardian_email}</span>
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ background: g.status === "accepted" ? TEAL_TINT : PAPER, color: g.status === "accepted" ? TEAL_DARK : INK_SOFT }}>
                          {g.status === "accepted" ? "연결됨" : "가입 대기중"}
                        </span>
                      </div>
                      <button onClick={() => removeGuardianFn(g.id)} className="text-xs font-bold flex-shrink-0 ml-2" style={{ color: CORAL }}>삭제</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>내 동네 설정</div>
            <div className="rounded-2xl p-4 mb-6" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {profile?.home_address ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs mb-0.5" style={{ color: INK_SOFT }}>현재 설정된 동네</div>
                      <div className="text-sm font-bold" style={{ color: INK }}>📍 {profile.home_address}</div>
                    </div>
                    <button onClick={setHomeLocation} className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: TEAL_TINT, color: TEAL_DARK }}>변경</button>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${LINE}` }}>
                    <div>
                      <div className="text-sm font-bold" style={{ color: INK }}>근처 새 장소 알림</div>
                      <div className="text-xs" style={{ color: INK_SOFT }}>{profile?.nearby_alerts_enabled === false ? "꺼짐" : "켜짐"}</div>
                    </div>
                    <button
                      onClick={async () => {
                        const newValue = !(profile?.nearby_alerts_enabled !== false);
                        const { error } = await supabase.from("profiles").update({ nearby_alerts_enabled: newValue }).eq("id", session.user.id);
                        if (!error) setProfile((prev) => ({ ...prev, nearby_alerts_enabled: newValue }));
                      }}
                      className="relative rounded-full transition-all duration-200"
                      style={{ width: 44, height: 26, background: profile?.nearby_alerts_enabled !== false ? TEAL : LINE }}
                    >
                      <div className="absolute rounded-full bg-white transition-all duration-200" style={{ width: 20, height: 20, top: 3, left: profile?.nearby_alerts_enabled !== false ? 21 : 3 }} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs mb-3" style={{ color: INK_SOFT }}>내 동네를 설정하면, 근처에 새 장소가 등록될 때 알림을 받을 수 있어요</div>
                  <button onClick={setHomeLocation} className="w-full rounded-xl py-3 text-sm font-bold text-white" style={{ background: TEAL }}>현재 위치로 설정하기</button>
                </div>
              )}
            </div>
              
             <div id="point-history-section" className="font-extrabold text-sm mb-3" style={{ color: INK }}>포인트 내역</div>
            <div className="rounded-2xl overflow-hidden mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {history.length === 0 && (
                <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>아직 내역이 없어요</div>
              )}
              {history.slice((historyPage - 1) * 5, historyPage * 5).map((h, i, arr) => (
                <div key={h.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i !== arr.length - 1 ? `1px solid ${LINE}` : "none" }}>
                  <div>
                    <div className="text-sm font-bold" style={{ color: INK }}>{h.note}</div>
                    <div className="text-[11px]" style={{ color: INK_SOFT }}>{new Date(h.created_at).toLocaleDateString("ko-KR")}</div>
                  </div>
                                 <div style={{ fontFamily: MONO_FONT, color: h.points >= 0 ? TEAL : CORAL, fontWeight: 700, fontSize: 13 }}>{h.points >= 0 ? "+" : ""}{h.points}P</div>
                </div>
              ))}
            </div>
            {history.length > 5 && (
              <div className="flex items-center justify-center gap-1.5 mb-8">
                {Array.from({ length: Math.ceil(history.length / 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setHistoryPage(p)}
                    className="rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150"
                    style={{ width: 30, height: 30, background: p === historyPage ? TEAL : PAPER, color: p === historyPage ? "#fff" : INK_SOFT }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
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
             <div className="grid grid-cols-5 gap-1.5">
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
     <button onClick={() => setShowFAQ(true)} className="w-full flex items-center justify-between rounded-2xl p-5 mb-3 mt-8 transition-all duration-200 active:scale-[0.98]" style={{ background: TEAL_TINT, border: `2px solid ${TEAL}` }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 40, height: 40, background: TEAL }}>
                  <Headset size={20} color="#fff" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-base" style={{ color: TEAL_DARK }}>자주 묻는 질문 (FAQ)</div>
                  <div className="text-xs" style={{ color: INK_SOFT }}>궁금한 점을 빠르게 찾아보세요</div>
                </div>
              </div>
              <ChevronRight size={20} color={TEAL_DARK} />
            </button>
            <div className="flex items-center justify-between mb-3">
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
              <div className="mt-3">
                <button onClick={() => setShowDeleteAccount(true)} className="text-xs" style={{ color: INK_SOFT, textDecoration: "underline" }}>
                  회원 탈퇴
                </button>
              </div>
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

                               <div className="hidden sm:flex flex-col gap-2 fixed z-30" style={{ top: 100, right: 24, width: 130 }}>
              {[
                { id: "admin-ranking", label: "순위 보상", icon: ShieldCheck, color: "#E8A800", bg: "#FFF3D6" },
                { id: "admin-members", label: "회원 관리", icon: User, color: TEAL_DARK, bg: TEAL_TINT },
                          { id: "admin-notif", label: "알림 보내기", icon: Bell, color: CORAL, bg: CORAL_TINT },
                { id: "admin-inquiries", label: "1:1 문의", icon: MessageSquare, color: newInquiryCount > 0 ? CORAL : TEAL_DARK, bg: newInquiryCount > 0 ? CORAL_TINT : TEAL_TINT },
                { id: "admin-campaign", label: "캠페인 배너", icon: Camera, color: TEAL_DARK, bg: TEAL_TINT },
                { id: "admin-notice-write", label: "공지사항", icon: Megaphone, color: CORAL, bg: CORAL_TINT },
                { id: "admin-faq", label: "FAQ 관리", icon: Headset, color: TEAL_DARK, bg: TEAL_TINT },
              ].map((item) => {
                const Icon = item.icon;
                return (
                       <button
                    key={item.id}
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center gap-2.5 rounded-2xl py-3 px-3 transition-all duration-200 active:scale-95 hover:shadow-md"
                    style={{ background: CARD, border: `1px solid ${LINE}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 34, height: 34, background: item.bg }}>
                      <Icon size={16} color={item.color} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: INK }}>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center gap-2.5 rounded-2xl py-3 px-3 transition-all duration-200 active:scale-95 hover:shadow-md"
                style={{ background: TEAL, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              >
                <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 34, height: 34, background: "rgba(255,255,255,0.2)" }}>
                  <ChevronRight size={16} color="#fff" style={{ transform: "rotate(-90deg)" }} />
                </div>
                <span className="text-xs font-bold text-white">맨 위로</span>
              </button>
            </div>

            <div className="rounded-2xl p-4 mb-8" style={{ background: CARD, border: `1px solid ${LINE}` }}>
           <div id="admin-ranking" className="font-extrabold text-sm mb-1" style={{ color: INK }}>🏆 이달의 순위 보상</div>
              <div className="text-xs mb-3" style={{ color: INK_SOFT }}>지난달 TOP5를 확인하고, 각 순위에 맞는 쿠폰을 발급하세요 (1~3등: 치킨 쿠폰, 4~5등: 커피 쿠폰)</div>
              {!monthlyWinners ? (
                <button onClick={loadMonthlyWinners} disabled={loadingWinners} className="rounded-xl px-4 py-2.5 text-xs font-bold text-white" style={{ background: TEAL, opacity: loadingWinners ? 0.6 : 1 }}>
                  {loadingWinners ? "불러오는 중..." : "지난달 TOP5 확인하기"}
                </button>
              ) : monthlyWinners.length === 0 ? (
                <div className="text-xs" style={{ color: INK_SOFT }}>지난달에는 포인트를 모은 분이 없어요</div>
              ) : (
                <div>
                  {monthlyWinners.map((w, i) => {
                    const rank = i + 1;
                    const isChicken = rank <= 3;
                    return (
                      <div key={w.user_id} className="flex items-center justify-between py-2.5" style={{ borderBottom: i !== monthlyWinners.length - 1 ? `1px solid ${LINE}` : "none" }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex items-center justify-center rounded-full font-extrabold text-xs flex-shrink-0" style={{ width: 24, height: 24, background: isChicken ? "#FFF3D6" : TEAL_TINT, color: isChicken ? "#B8860B" : TEAL_DARK }}>{rank}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate" style={{ color: INK }}>{w.email}</div>
                            <div className="text-[10px]" style={{ color: INK_SOFT }}>{w.total_points.toLocaleString()}P · {isChicken ? "치킨 쿠폰" : "커피 쿠폰"}</div>
                          </div>
                        </div>
                                               <button onClick={() => issueRankingCoupon(w.user_id, rank, w.total_points)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-white flex-shrink-0" style={{ background: CORAL }}>
                          발급
                        </button>
                      </div>
                    );
                  })}
                                    <button onClick={() => setMonthlyWinners(null)} className="text-xs font-bold mt-3" style={{ color: INK_SOFT }}>다시 불러오기</button>
                </div>
              )}
                           <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${LINE}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={async () => { await fetchRankingCouponResponses(); await supabase.from("coupons").update({ admin_checked: true }).eq("is_ranking_coupon", true).eq("response_status", "accepted").is("admin_checked", null); setNewRankingResponseCount(0); }} className="text-xs font-bold" style={{ color: TEAL }}>발급된 쿠폰 응답 현황 보기</button>
                  {rankingCouponResponses && (
                    <select
                      value={responseMonthFilter}
                      onChange={(e) => { setResponseMonthFilter(e.target.value); fetchRankingCouponResponses(e.target.value); }}
                      className="rounded-lg px-2 py-1 text-xs outline-none"
                      style={{ border: `1.4px solid ${LINE}`, color: INK }}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const d = new Date();
                        d.setDate(1);
                        d.setMonth(d.getMonth() - i);
                        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                        const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
                        return <option key={value} value={value}>{label}</option>;
                      })}
                    </select>
                  )}
                </div>
                {rankingCouponResponses && (
                  <div className="mt-3">
                    {rankingCouponResponses.length === 0 ? (
                      <div className="text-xs" style={{ color: INK_SOFT }}>아직 발급된 순위 보상 쿠폰이 없어요</div>
                    ) : (
                      rankingCouponResponses.map((c) => (
                        <div key={c.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${LINE}` }}>
                          <div className="text-xs truncate" style={{ color: INK }}>{c.title}</div>
                          <span
                            className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0 ml-2"
                            style={{
                              background: c.response_status === "accepted" ? TEAL_TINT : c.response_status === "declined" ? CORAL_TINT : PAPER,
                              color: c.response_status === "accepted" ? TEAL_DARK : c.response_status === "declined" ? CORAL : INK_SOFT,
                            }}
                          >
                            {c.response_status === "accepted" ? "✅ 받겠다고 함" : c.response_status === "declined" ? "❌ 거부함" : "⏳ 응답 대기중"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>


                    <div id="admin-notif" className="font-extrabold text-sm mb-3" style={{ color: INK }}>알림 보내기</div>
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

<div id="admin-voice-qa" className="font-extrabold text-sm mb-3" style={{ color: INK }}>💬 음성 질문-답변 등록</div>
            <div className="rounded-2xl p-4 mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              <div className="text-xs mb-3" style={{ color: INK_SOFT }}>여러 표현을 쉼표(,)로 구분해서 등록하면, 그중 하나라도 말하면 답변이 나와요</div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>트리거 키워드 (쉼표로 구분)</label>
              <input
                value={newVoiceQaKeywords}
                onChange={(e) => setNewVoiceQaKeywords(e.target.value)}
                placeholder="예) 탈퇴, 회원 나가기, 계정 지우기"
                className="w-full rounded-xl px-3 py-2.5 mb-3 text-sm outline-none"
                style={{ border: `1.4px solid ${LINE}`, color: INK }}
              />
              <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>답변</label>
              <textarea
                value={newVoiceQaAnswer}
                onChange={(e) => setNewVoiceQaAnswer(e.target.value)}
                placeholder="예) 마이페이지 하단에서 회원 탈퇴를 하실 수 있어요"
                rows={3}
                className="w-full rounded-xl px-3 py-2.5 mb-3 text-sm outline-none resize-none"
                style={{ border: `1.4px solid ${LINE}`, color: INK }}
              />
      <div className="flex gap-2">
                <button onClick={addVoiceQa} className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white" style={{ background: TEAL }}>
                  {editingVoiceQaId ? "수정하기" : "등록하기"}
                </button>
                {editingVoiceQaId && (
                  <button onClick={() => { setEditingVoiceQaId(null); setNewVoiceQaKeywords(""); setNewVoiceQaAnswer(""); }} className="rounded-xl px-4 py-2.5 text-sm font-bold" style={{ background: PAPER, color: INK }}>
                    취소
                  </button>
                )}
              </div>
            </div>
        <div className="rounded-2xl overflow-hidden mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {voiceQaList.length === 0 && (
                <div className="text-center py-6 text-sm" style={{ color: INK_SOFT }}>등록된 음성 질문-답변이 없어요</div>
              )}
              {voiceQaList.slice((voiceQaPage - 1) * 5, voiceQaPage * 5).map((qa) => (
    <div key={qa.id} className="px-4 py-3 flex items-start justify-between gap-2" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <div onClick={() => startEditVoiceQa(qa)} className="min-w-0 flex-1 cursor-pointer">
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {qa.keywords.map((k, i) => (
                        <span key={i} className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: TEAL_TINT, color: TEAL_DARK }}>{k}</span>
                      ))}
                    </div>
                    <div className="text-xs" style={{ color: INK_SOFT }}>{qa.answer}</div>
                  </div>
                  <button onClick={() => deleteVoiceQa(qa.id)} className="flex-shrink-0" aria-label="삭제">
                    <X size={16} color={INK_SOFT} />
                  </button>
                </div>
              ))}
            </div>
            {voiceQaList.length > 5 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <button onClick={() => setVoiceQaPage((p) => Math.max(1, p - 1))} disabled={voiceQaPage === 1} className="rounded-full p-2" style={{ background: PAPER, opacity: voiceQaPage === 1 ? 0.4 : 1 }} aria-label="이전 페이지">
                  <ChevronRight size={16} color={INK_SOFT} style={{ transform: "rotate(180deg)" }} />
                </button>
                <span className="text-xs font-bold" style={{ color: INK_SOFT }}>{voiceQaPage} / {Math.max(1, Math.ceil(voiceQaList.length / 5))}</span>
                <button onClick={() => setVoiceQaPage((p) => Math.min(Math.ceil(voiceQaList.length / 5), p + 1))} disabled={voiceQaPage >= Math.ceil(voiceQaList.length / 5)} className="rounded-full p-2" style={{ background: PAPER, opacity: voiceQaPage >= Math.ceil(voiceQaList.length / 5) ? 0.4 : 1 }} aria-label="다음 페이지">
                  <ChevronRight size={16} color={INK_SOFT} />
                </button>
              </div>
            )}
                  
     <div id="admin-voice-commands" className="font-extrabold text-sm mb-3" style={{ color: INK }}>🎤 답변 못한 음성 질문 ({unrecognizedCommands.length})</div>
            <div className="rounded-2xl overflow-hidden mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {unrecognizedCommands.length === 0 && (
                <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>아직 답변 못한 질문이 없어요</div>
              )}
              {unrecognizedCommands.slice((voiceCommandPage - 1) * 5, voiceCommandPage * 5).map((c) => (
                <div key={c.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <div className="text-sm font-bold mb-1" style={{ color: INK }}>"{c.spoken_text}"</div>
                  <div className="text-xs" style={{ color: INK_SOFT }}>
                    {c.profiles?.nickname || c.profiles?.email || "알 수 없음"} · {new Date(c.created_at).toLocaleString("ko-KR")}
                  </div>
                </div>
              ))}
            </div>
            {unrecognizedCommands.length > 5 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <button onClick={() => setVoiceCommandPage((p) => Math.max(1, p - 1))} disabled={voiceCommandPage === 1} className="rounded-full p-2" style={{ background: PAPER, opacity: voiceCommandPage === 1 ? 0.4 : 1 }} aria-label="이전 페이지">
                  <ChevronRight size={16} color={INK_SOFT} style={{ transform: "rotate(180deg)" }} />
                </button>
                <span className="text-xs font-bold" style={{ color: INK_SOFT }}>{voiceCommandPage} / {Math.max(1, Math.ceil(unrecognizedCommands.length / 5))}</span>
                <button onClick={() => setVoiceCommandPage((p) => Math.min(Math.ceil(unrecognizedCommands.length / 5), p + 1))} disabled={voiceCommandPage >= Math.ceil(unrecognizedCommands.length / 5)} className="rounded-full p-2" style={{ background: PAPER, opacity: voiceCommandPage >= Math.ceil(unrecognizedCommands.length / 5) ? 0.4 : 1 }} aria-label="다음 페이지">
                  <ChevronRight size={16} color={INK_SOFT} />
                </button>
              </div>
            )}

<div id="admin-maintenance" className="font-extrabold text-sm mb-3" style={{ color: INK }}>🚧 서비스 점검 모드</div>
            <div className="rounded-2xl p-4 mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="text-xs" style={{ color: INK_SOFT }}>켜면 모든 사용자 화면이 점검 안내로 뒤덮여요</div>
                <button
                  onClick={toggleMaintenanceMode}
                  className="relative rounded-full transition-all duration-200 flex-shrink-0"
                  style={{ width: 48, height: 28, background: maintenanceMode ? CORAL : LINE }}
                >
                  <div className="absolute rounded-full bg-white transition-all duration-200" style={{ width: 22, height: 22, top: 3, left: maintenanceMode ? 23 : 3 }} />
                </button>
              </div>
              {maintenanceImageUrl ? (
                <div className="mb-3">
                  <img src={maintenanceImageUrl} alt="점검 안내 미리보기" className="w-full rounded-xl mb-2" style={{ maxHeight: 200, objectFit: "cover" }} />
                  <button onClick={async () => { await supabase.from("app_settings").update({ value: null }).eq("key", "maintenance_image_url"); setMaintenanceImageUrl(null); showToast("이미지가 제거됐어요"); }} className="text-xs font-bold" style={{ color: CORAL }}>이미지 제거하기</button>
                </div>
              ) : (
                <div className="text-xs mb-3 rounded-xl p-4 text-center" style={{ background: PAPER, color: INK_SOFT }}>
                  이미지가 없으면 기본 점검 안내 문구가 보여요
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleMaintenanceImageUpload} className="hidden" id="maintenance-image-upload" disabled={maintenanceUploading} />
              <label htmlFor="maintenance-image-upload" className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold cursor-pointer transition-all duration-200 active:scale-95" style={{ background: maintenanceUploading ? PAPER : TEAL, color: maintenanceUploading ? INK_SOFT : "#fff" }}>
                <Camera size={16} />
                {maintenanceUploading ? "업로드 중..." : "점검 안내 이미지 올리기"}
              </label>
              {maintenanceMode && (
                <div className="mt-3 text-xs font-bold text-center rounded-xl py-2" style={{ background: CORAL_TINT, color: CORAL }}>
                  ⚠️ 지금 점검 모드가 켜져 있어요!
                </div>
              )}
            </div>

                
                  <div id="admin-splash" className="font-extrabold text-sm mb-3" style={{ color: INK }}>🎨 앱 시작 화면</div>
            <div className="rounded-2xl p-4 mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              <div className="text-xs mb-3" style={{ color: INK_SOFT }}>
                앱을 실행하면 2.5초간 보여지는 시작 화면 이미지예요. 크리스마스, 명절 등 이벤트 때 바꿔보세요!
              </div>
              {splashImageUrl ? (
                <div className="mb-3">
                  <img src={splashImageUrl} alt="현재 시작화면" className="w-full rounded-xl mb-2" style={{ maxHeight: 200, objectFit: "cover" }} />
                  <button onClick={removeSplashImage} className="text-xs font-bold" style={{ color: CORAL }}>이미지 제거하기</button>
                </div>
              ) : (
                <div className="text-xs mb-3 rounded-xl p-4 text-center" style={{ background: PAPER, color: INK_SOFT }}>
                  현재 설정된 이미지가 없어요 (기본 로고만 표시됨)
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleSplashImageUpload} className="hidden" id="splash-image-upload" disabled={splashUploading} />
              <label htmlFor="splash-image-upload" className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold cursor-pointer transition-all duration-200 active:scale-95" style={{ background: splashUploading ? PAPER : TEAL, color: splashUploading ? INK_SOFT : "#fff" }}>
                <Camera size={16} />
                {splashUploading ? "업로드 중..." : "새 이미지 올리기"}
              </label>
            </div>
           <div id="admin-members" className="font-extrabold text-sm mb-3" style={{ color: INK }}>회원 관리 ({allProfiles.length}명)</div>
           <input value={memberSearch} onChange={(e) => { setMemberSearch(e.target.value); setMemberPage(1); }} placeholder="이메일 또는 닉네임으로 검색"
              className="w-full rounded-xl px-4 py-2.5 mb-3 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
            <div className="flex gap-2 mb-3">
<select value={memberSort} onChange={(e) => { setMemberSort(e.target.value); setMemberPage(1); }} className="flex-1 rounded-xl px-3 py-2 text-xs font-bold outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, background: "#fff" }}>
                <option value="points_desc">포인트 높은순</option>
                <option value="points_asc">포인트 낮은순</option>
                <option value="created_desc">가입일 최신순</option>
                <option value="created_asc">가입일 오래된순</option>
              </select>
<select value={memberFilter} onChange={(e) => { setMemberFilter(e.target.value); setMemberPage(1); }} className="flex-1 rounded-xl px-3 py-2 text-xs font-bold outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, background: "#fff" }}>
                <option value="all">전체 회원</option>
                <option value="invited">초대가입만</option>
                <option value="아기병아리">아기병아리</option>
                <option value="아기토끼">아기토끼</option>
                <option value="아기여우">아기여우</option>
                <option value="아기사자">아기사자</option>
                <option value="날개곰">날개곰</option>
                <option value="황금독수리">황금독수리</option>
              </select>
            </div>
            <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {allProfiles.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>회원이 없어요</div>}
              {(() => {
                const filtered = allProfiles
                  .filter((p) => (p.email || "").includes(memberSearch) || (p.nickname || "").includes(memberSearch))
                  .filter((p) => memberFilter === "all" ? true : memberFilter === "invited" ? !!p.invited_by : currentTier(p.points).label === memberFilter)
                  .sort((a, b) => {
                    if (memberSort === "points_desc") return b.points - a.points;
                    if (memberSort === "points_asc") return a.points - b.points;
                    if (memberSort === "created_desc") return new Date(b.created_at) - new Date(a.created_at);
                    if (memberSort === "created_asc") return new Date(a.created_at) - new Date(b.created_at);
                    return 0;
                  });
                const totalPages = Math.max(1, Math.ceil(filtered.length / 5));
                const pageItems = filtered.slice((memberPage - 1) * 5, memberPage * 5);
                return pageItems.map((p) => (
                               <div key={p.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                                   <button onClick={() => setExpandedMemberId(expandedMemberId === p.id ? null : p.id)} className="w-full flex items-center justify-between">
                    <div className="text-left min-w-0">
                                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <div className="text-sm font-bold truncate" style={{ color: INK }}>{p.email || "(이메일 없음)"}</div>
                        {p.login_provider === "google" && (
                          <span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0" style={{ background: "#E8F0FE", color: "#4285F4" }}>
                            G 구글
                          </span>
                        )}
                        {p.login_provider === "kakao" && (
                          <span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0" style={{ background: "#FEE500", color: "#3C1E1E" }}>
                            K 카카오
                          </span>
                        )}
                        {p.invited_by && (
                          <span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0" style={{ background: TEAL_TINT, color: TEAL_DARK }}>
                            👫 초대가입
                          </span>
                        )}
                      </div>
                      <div className="text-xs truncate" style={{ color: INK_SOFT }}>{p.admin_note ? `📌 ${p.admin_note} · ` : ""}{p.nickname} · {currentTier(p.points).label}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <div style={{ fontFamily: MONO_FONT, color: CORAL, fontWeight: 700, fontSize: 15 }}>{p.points.toLocaleString()}P</div>
                      <ChevronRight size={16} color={INK_SOFT} style={{ transform: expandedMemberId === p.id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                    </div>
                  </button>
                                  {expandedMemberId === p.id && (
                  <div className="mt-3">
                  {p.inviter && (
                    <div className="text-xs mb-2 rounded-lg px-2.5 py-1.5" style={{ background: TEAL_TINT, color: TEAL_DARK }}>
                      👫 초대자: {p.inviter.nickname || p.inviter.email}
                    </div>
                  )}
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
                    <button onClick={() => toggleStaff(p.id, p.role === "staff")} className="rounded-lg px-2.5 py-1.5 text-xs font-bold flex-shrink-0" style={{ background: p.role === "staff" ? TEAL_TINT : PAPER, color: p.role === "staff" ? TEAL_DARK : INK_SOFT }}>
                      {p.role === "staff" ? "직원 해제" : "직원 지정"}
                    </button>
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
                 ));
              })()}
            </div>
            {(() => {
              const filtered = allProfiles
                .filter((p) => (p.email || "").includes(memberSearch) || (p.nickname || "").includes(memberSearch))
                .filter((p) => memberFilter === "all" ? true : memberFilter === "invited" ? !!p.invited_by : currentTier(p.points).label === memberFilter);
              const totalPages = Math.max(1, Math.ceil(filtered.length / 5));
              if (totalPages <= 1) return null;
              return (
                <div className="flex items-center justify-center gap-2 mb-8" style={{ marginTop: -24 }}>
                  <button onClick={() => setMemberPage((p) => Math.max(1, p - 1))} disabled={memberPage === 1} className="rounded-full p-2" style={{ background: PAPER, opacity: memberPage === 1 ? 0.4 : 1 }} aria-label="이전 페이지">
                    <ChevronRight size={16} color={INK_SOFT} style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <span className="text-xs font-bold" style={{ color: INK_SOFT }}>{memberPage} / {totalPages}</span>
                  <button onClick={() => setMemberPage((p) => Math.min(totalPages, p + 1))} disabled={memberPage === totalPages} className="rounded-full p-2" style={{ background: PAPER, opacity: memberPage === totalPages ? 0.4 : 1 }} aria-label="다음 페이지">
                    <ChevronRight size={16} color={INK_SOFT} />
                  </button>
                </div>
              );
            })()}

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>포인트 조정 기록</div>
            <div className="rounded-2xl overflow-hidden mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {adjustLog.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>조정 기록이 없어요</div>}
              {adjustLog.slice((adjustLogPage - 1) * 5, adjustLogPage * 5).map((h) => (
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
            {adjustLog.length > 5 && (
              <div className="flex items-center justify-center gap-1.5 mb-8">
                {Array.from({ length: Math.ceil(adjustLog.length / 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAdjustLogPage(p)}
                    className="rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150"
                    style={{ width: 30, height: 30, background: p === adjustLogPage ? TEAL : PAPER, color: p === adjustLogPage ? "#fff" : INK_SOFT }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

                            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>장소 정보 신고 ({allReports.filter(r => r.status !== "resolved").length}건 대기중)</div>
                       <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {allReports.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>신고 내역이 없어요</div>}
              {allReports.map((r) => {
                const isExpandedReport = expandedReportId === r.id;
                return (
                <div key={r.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}`, opacity: r.status === "resolved" ? 0.5 : 1 }}>
                  <button onClick={() => setExpandedReportId(isExpandedReport ? null : r.id)} className="w-full flex items-center justify-between gap-2 text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold truncate" style={{ color: INK }}>{r.places?.name || "(삭제된 장소)"}</span>
                      {r.status !== "resolved" ? (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ background: CORAL_TINT, color: CORAL }}>대기중</span>
                      ) : (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ background: PAPER, color: INK_SOFT }}>완료</span>
                      )}
                    </div>
                    <ChevronRight size={16} color={INK_SOFT} className="flex-shrink-0" style={{ transform: isExpandedReport ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                  {isExpandedReport && (
                    <div className="mt-2">
                      <div className="text-xs mb-1" style={{ color: INK_SOFT }}>{r.places?.address}</div>
                      <div className="text-xs mb-1" style={{ color: INK }}>{r.reason}</div>
                      <div className="text-xs mb-2" style={{ color: INK_SOFT }}>{new Date(r.created_at).toLocaleDateString("ko-KR")}</div>
                      <div className="flex gap-2">
                        {r.status !== "resolved" ? (
                          <button onClick={() => resolveReport(r.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-white" style={{ background: TEAL }}>처리 완료로 표시</button>
                        ) : (
                          <span className="text-[10px] font-bold rounded-full px-2 py-1.5 flex items-center" style={{ background: PAPER, color: INK_SOFT }}>처리완료됨</span>
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
                  )}
                </div>
                );
              })}
            </div>

       <div id="admin-campaign" className="font-extrabold text-sm mb-3" style={{ color: INK }}>캠페인 배너 관리</div>
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

            <div className="rounded-2xl overflow-hidden mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {campaigns.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>등록된 배너가 없어요</div>}
              {campaigns.filter((_, idx) => idx >= (campaignAdminPage - 1) * 5 && idx < campaignAdminPage * 5).map((c, i, arr) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i !== arr.length - 1 ? `1px solid ${LINE}` : "none" }}>
                  <img src={c.image_url} alt={c.title || "배너"} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-sm font-bold truncate" style={{ color: INK }}>{c.title || "(제목 없음)"}</div>
                  <button onClick={() => startEditCampaign(c)} className="text-xs font-bold flex-shrink-0" style={{ color: TEAL }}>수정</button>
                  <button onClick={() => deleteCampaign(c.id)} className="text-xs font-bold flex-shrink-0" style={{ color: CORAL }}>삭제</button>
                </div>
              ))}
            </div>
            {campaigns.length > 5 && (
              <div className="flex items-center justify-center gap-1.5 mb-8">
                {Array.from({ length: Math.ceil(campaigns.length / 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCampaignAdminPage(p)}
                    className="rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150"
                    style={{ width: 30, height: 30, background: p === campaignAdminPage ? TEAL : PAPER, color: p === campaignAdminPage ? "#fff" : INK_SOFT }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
                  <div id="admin-notice-write" className="font-extrabold text-sm mb-3" style={{ color: INK }}>{editingNoticeId ? "공지사항 수정" : "공지사항 작성"}</div>
            <form onSubmit={submitNotice} className="rounded-2xl p-4 mb-8" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                           <input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} placeholder="공지 제목"
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />

            
        <div className="mb-2 rounded-xl overflow-hidden" style={{ border: `1.4px solid ${LINE}` }}>
                <ReactQuill
                  theme="snow"
                  value={noticeForm.content}
                  onChange={(value) => setNoticeForm({ ...noticeForm, content: value })}
                  placeholder="공지 내용을 입력해주세요"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ color: [] }, { background: [] }],
                      [{ list: "ordered" }, { list: "bullet" }],
                      [{ align: [] }],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                />
              </div>

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
            <div className="rounded-2xl overflow-hidden mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {notices.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>공지사항이 없어요</div>}
              {notices.filter((_, idx) => idx >= (noticeAdminPage - 1) * 5 && idx < noticeAdminPage * 5).map((n, i, arr) => {
                const isExpandedAdmin = expandedNoticeAdminId === n.id;
                return (
                <div key={n.id} className="px-4 py-3" style={{ borderBottom: i !== arr.length - 1 ? `1px solid ${LINE}` : "none" }}>
                  <button onClick={() => setExpandedNoticeAdminId(isExpandedAdmin ? null : n.id)} className="w-full flex items-center justify-between gap-2 text-left">
                    <div className="text-sm font-bold truncate" style={{ color: INK }}>{n.title}</div>
                    <ChevronRight size={16} color={INK_SOFT} className="flex-shrink-0" style={{ transform: isExpandedAdmin ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                  {isExpandedAdmin && (
                    <>
                      <div className="text-xs mt-1.5 mb-2" style={{ color: INK_SOFT }}>{n.content.replace(/<[^>]*>/g, "").slice(0, 100)}</div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditNotice(n)} className="text-xs font-bold" style={{ color: TEAL }}>수정</button>
                        <button onClick={() => deleteNotice(n.id)} className="text-xs font-bold" style={{ color: CORAL }}>삭제</button>
                      </div>
                    </>
                  )}
                </div>
                );
              })}
            </div>
            {notices.length > 5 && (
              <div className="flex items-center justify-center gap-1.5 mb-8">
                {Array.from({ length: Math.ceil(notices.length / 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNoticeAdminPage(p)}
                    className="rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150"
                    style={{ width: 30, height: 30, background: p === noticeAdminPage ? TEAL : PAPER, color: p === noticeAdminPage ? "#fff" : INK_SOFT }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

    <div id="admin-inquiries" className="font-extrabold text-sm mb-3" style={{ color: INK }}>1:1 문의 관리</div>
            <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {allInquiries.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>문의가 없어요</div>}
              {allInquiries.map((q) => {
                const isExpandedInquiry = expandedInquiryAdminId === q.id;
                return (
                <div key={q.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <button onClick={() => setExpandedInquiryAdminId(isExpandedInquiry ? null : q.id)} className="w-full flex items-center justify-between gap-2 text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold truncate" style={{ color: INK }}>{q.title}</span>
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ background: q.status === "answered" ? TEAL_TINT : CORAL_TINT, color: q.status === "answered" ? TEAL_DARK : CORAL }}>
                        {q.status === "answered" ? "답변완료" : "답변대기"}
                      </span>
                    </div>
                    <ChevronRight size={16} color={INK_SOFT} className="flex-shrink-0" style={{ transform: isExpandedInquiry ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                  {isExpandedInquiry && (
                    <div className="mt-2">
                      <div className="text-xs mb-2" style={{ color: INK_SOFT }}>{q.content}</div>
                      {q.answer ? (
                        <div className="rounded-xl p-3 text-xs" style={{ background: PAPER, color: INK }}>
                          <span className="font-bold" style={{ color: TEAL }}>답변: </span>{q.answer}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input value={replyDrafts[q.id] || ""} onChange={(e) => setReplyDrafts({ ...replyDrafts, [q.id]: e.target.value })} placeholder="답변 입력"
                            className="flex-1 rounded-xl px-3 py-2 text-xs outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
                          <button onClick={() => submitReply(q.id)} className="rounded-xl px-3 py-2 text-xs font-bold text-white flex-shrink-0" style={{ background: TEAL }}>답변</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>

           <div id="admin-faq" className="font-extrabold text-sm mb-3" style={{ color: INK }}>자주 묻는 질문(FAQ) 관리</div>
            <div className="rounded-2xl p-4 mb-4" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              <input value={newFaqQuestion} onChange={(e) => setNewFaqQuestion(e.target.value)} placeholder="질문 입력"
                className="w-full rounded-xl px-3 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
              <textarea value={newFaqAnswer} onChange={(e) => setNewFaqAnswer(e.target.value)} placeholder="답변 입력" rows={3}
                className="w-full rounded-xl px-3 py-2.5 mb-2 text-sm outline-none resize-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
              <button onClick={addFaq} className="w-full rounded-xl py-2.5 text-sm font-bold text-white" style={{ background: TEAL }}>+ 질문 추가하기</button>
            </div>
                                           <div className="rounded-2xl overflow-hidden mb-3" style={{ border: `1px solid ${LINE}`, background: CARD }}>
              {faqs.length === 0 && <div className="text-center py-8 text-sm" style={{ color: INK_SOFT }}>등록된 질문이 없어요</div>}
              {faqs.filter((_, idx) => idx >= (faqAdminPage - 1) * 5 && idx < faqAdminPage * 5).map((faq, i, arr) => (
                <div key={faq.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i !== arr.length - 1 ? `1px solid ${LINE}` : "none" }}>
                  <span className="text-sm truncate" style={{ color: INK }}>{faq.question}</span>
                  <button onClick={() => deleteFaq(faq.id)} className="text-xs font-bold flex-shrink-0 ml-2" style={{ color: CORAL }}>삭제</button>
                </div>
              ))}
            </div>
            {faqs.length > 5 && (
              <div className="flex items-center justify-center gap-1.5 mb-8">
                {Array.from({ length: Math.ceil(faqs.length / 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFaqAdminPage(p)}
                    className="rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150"
                    style={{ width: 30, height: 30, background: p === faqAdminPage ? TEAL : PAPER, color: p === faqAdminPage ? "#fff" : INK_SOFT }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
</main>

      <footer className="text-center py-6 text-xs relative" style={{ color: INK_SOFT }}>
        <button onClick={() => setShowBizInfo(!showBizInfo)} className="inline-flex items-center gap-1">
          제작 : 코드람쥐
          <span className="flex items-center justify-center rounded-full" style={{ width: 13, height: 13, border: `1px solid ${INK_SOFT}`, fontSize: 9, fontWeight: 700 }}>i</span>
        </button>
        {showBizInfo && (
          <div className="fixed inset-0 z-50" onClick={() => setShowBizInfo(false)}>
            <div className="absolute left-1/2 rounded-2xl px-4 py-3" style={{ bottom: 60, transform: "translateX(-50%)", background: INK, color: "#fff", fontSize: 11, lineHeight: 1.8, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
              코드람쥐 · 사업자등록번호 303-18-93738<br />
              경기 평택시 산단로16번길 26 A동 14층 1408호<br />
              전화 0507-1328-0925
              <div className="absolute left-1/2" style={{ bottom: -6, transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `6px solid ${INK}` }} />
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

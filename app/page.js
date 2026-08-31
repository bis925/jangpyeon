"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Search, MapPin, Plus, User, Check, ChevronRight,
    Accessibility, DoorOpen, Baby, MoveVertical, Sparkles, X, Star, LogOut, Mail, Camera, Pencil, Megaphone, ShieldCheck,
} from "lucide-react";

/* ===================== 디자인 토큰 (장편 브랜드) ===================== */
const TEAL = "#0F6E62";
const TEAL_DARK = "#0A4F46";
const TEAL_TINT = "#E3F0EC";
const CORAL = "#F0603D";
const CORAL_TINT = "#FDE7E0";
const YELLOW = "#FFC13B";
const INK = "#1C2420";
const INK_SOFT = "#66716A";
const PAPER = "#FAF7F1";
const CARD = "#FFFFFF";
const LINE = "#E4DFD1";

const DISPLAY_FONT = "'Black Han Sans', sans-serif";
const BODY_FONT = "'Gothic A1', sans-serif";
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

const CATEGORIES = ["공공기관", "음식점", "카페", "문화시설"];
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

function PlaceCard({ place, onHelpful, isFavorite, onToggleFavorite, onEdit, isOwner }) {
  const badges = getBadges(place);
  return (
    <div className="flex gap-4 rounded-2xl p-4 transition-all duration-200 hover:shadow-md" style={{ background: CARD, border: `1px solid ${LINE}` }}>
      <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${TEAL_TINT}, ${YELLOW})` }}>
        {place.photo_url && <img src={place.photo_url} alt={place.name} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-extrabold" style={{ color: INK, fontFamily: BODY_FONT }}>{place.name}</div>
            <div className="text-xs mb-2" style={{ color: INK_SOFT }}>{place.category} · {place.address}</div>
          </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
            {isOwner && (
              <button onClick={() => onEdit(place)} className="rounded-full p-1.5 transition-all duration-150 active:scale-90 hover:bg-black/5" aria-label="수정">
                <Pencil size={15} color={INK_SOFT} />
              </button>
            )}
            <button onClick={() => onToggleFavorite(place.id)} className="rounded-full p-1.5 transition-all duration-150 active:scale-90 hover:bg-black/5" aria-label="즐겨찾기">
              <Star size={16} color={isFavorite ? YELLOW : LINE} fill={isFavorite ? YELLOW : "none"} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {badges.map((b) => <Badge key={b} badgeKey={b} />)}
        </div>
        <button onClick={() => onHelpful(place.id)} className="text-xs font-bold transition-all duration-150 active:scale-95 hover:opacity-75" style={{ color: CORAL }}>
          도움이 됐어요 {place.helpful_count} · 눌러서 응원하기
        </button>
      </div>
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
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: PAPER, fontFamily: BODY_FONT }}>
      <div className="w-full max-w-sm text-center">
     <div className="flex justify-center">
          <LogoMark size={84} />
        </div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 32, color: INK, margin: "16px 0 6px" }}>장편</div>
<p className="text-sm mb-1" style={{ color: INK_SOFT }}>장애물 없는 편의, 함께 기록해요</p> 
  <p className="text-xs mb-8" style={{ color: '#9A9484' }}>휠체어 접근성 · 장애인 화장실 · 유모차 정보를 지도에서 찾아보세요</p>

        {sent ? (
          <div className="rounded-2xl p-6" style={{ background: TEAL_TINT }}>
            <Mail size={22} color={TEAL} className="mx-auto mb-2" />
            <div className="font-bold text-sm" style={{ color: TEAL_DARK }}>메일함을 확인해주세요</div>
            <div className="text-xs mt-1" style={{ color: INK_SOFT }}>{email}로 로그인 링크를 보냈어요</div>
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
        <p className="text-xs mt-6" style={{ color: INK_SOFT }}>
          비밀번호 없이, 메일로 온 링크만 누르면 로그인돼요.
        </p>
          <p className="text-xs mt-8" style={{ color: '#B8B1A0' }}>
          제작 · 코드람쥐
        </p>
      </div>
    </div>
  );
}

/* ===================== 메인 앱 ===================== */
export default function Page() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [places, setPlaces] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [history, setHistory] = useState([]);

  const [tab, setTab] = useState("home");
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [mapCategory, setMapCategory] = useState(null);
    const [pendingFocusId, setPendingFocusId] = useState(null);
  const [toast, setToast] = useState(null);
  const [justRegistered, setJustRegistered] = useState(null);
  const [form, setForm] = useState({
    name: "", address: "", category: "공공기관",
    badges: { ramp: false, door: false, stroller: false, lift: false },
  });
    const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
    const [editingPlaceId, setEditingPlaceId] = useState(null);
    const [notices, setNotices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [allInquiries, setAllInquiries] = useState([]);
  const [inquiryForm, setInquiryForm] = useState({ title: "", content: "" });
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "" });
  const [replyDrafts, setReplyDrafts] = useState({});
  const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [kakaoLoaded, setKakaoLoaded] = useState(false);

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
    if (tab !== "map" || !kakaoLoaded || !mapContainerRef.current) return;
    const kakao = window.kakao;
    const center = new kakao.maps.LatLng(37.5665, 126.9780);
    const map = new kakao.maps.Map(mapContainerRef.current, { center, level: 6 });
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


  function focusOnPlace(placeId) {
    const entry = markersRef.current[placeId];
    if (!entry || !mapInstanceRef.current) return;
    mapInstanceRef.current.setCenter(entry.position);
    mapInstanceRef.current.setLevel(3);
    entry.infowindow.open(mapInstanceRef.current, entry.marker);
  }
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
    }
  }, [session]);

  async function fetchProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    setProfile(data);
  }
  async function fetchPlaces() {
    const { data } = await supabase.from("places").select("*, place_photos(photo_url)").eq("status", "approved").order("created_at", { ascending: false });
    const withPhoto = (data || []).map((p) => ({ ...p, photo_url: p.place_photos?.[0]?.photo_url || null }));
    setPlaces(withPhoto);
  }
  async function fetchFavorites() {
    const { data } = await supabase.from("favorites").select("place_id").eq("user_id", session.user.id);
    setFavorites(new Set((data || []).map((f) => f.place_id)));
  }
    async function fetchNotices() {
    const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
    setNotices(data || []);
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
  async function fetchHistory() {
    const { data } = await supabase.from("point_history").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(30);
    setHistory(data || []);
  }
  async function submitNotice(e) {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;
    const { error } = await supabase.from("notices").insert({ title: noticeForm.title.trim(), content: noticeForm.content.trim() });
    if (error) { showToast("공지 등록 실패: " + error.message); return; }
    setNoticeForm({ title: "", content: "" });
    fetchNotices();
    showToast("공지사항이 등록됐어요");
  }
  async function deleteNotice(id) {
    await supabase.from("notices").delete().eq("id", id);
    fetchNotices();
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
  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast((cur) => (cur === message ? null : cur)), 2200);
  }

  function toggleFilter(key) {
    setActiveFilters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchesQuery = query.trim() === "" || p.name.includes(query) || p.address.includes(query);
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
    new window.daum.Postcode({
      oncomplete: function (data) {
        const addr = data.roadAddress || data.jibunAddress;
        setForm((prev) => ({ ...prev, address: addr }));
      },
    }).open();
  }
    function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }
    function startEdit(place) {
    setEditingPlaceId(place.id);
    setForm({
      name: place.name,
      address: place.address,
      category: place.category,
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
    const { error } = await supabase
      .from("places")
      .update({
        name: form.name.trim(),
        address: form.address.trim() || "주소 정보 없음",
        category: form.category,
        has_ramp: form.badges.ramp,
        has_restroom: form.badges.door,
        has_stroller_access: form.badges.stroller,
        has_elevator: form.badges.lift,
      })
      .eq("id", editingPlaceId);
    if (error) { showToast("수정 실패: " + error.message); return; }

    if (photoFile) {
      const fileExt = photoFile.name.split(".").pop();
      const filePath = `${editingPlaceId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("place-photos").upload(filePath, photoFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("place-photos").getPublicUrl(filePath);
        await supabase.from("place_photos").insert({ place_id: editingPlaceId, photo_url: urlData.publicUrl, uploaded_by: session.user.id });
      }
    }

    showToast("수정 완료!");
    setEditingPlaceId(null);
    setForm({ name: "", address: "", category: "공공기관", badges: { ramp: false, door: false, stroller: false, lift: false } });
    setPhotoFile(null);
    setPhotoPreview(null);
    setTab("home");
    fetchPlaces();
  }

  async function submitRegister(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingPlaceId) { await submitEdit(); return; }
    const { data, error } = await supabase.rpc("register_place", {
      p_name: form.name.trim(),
      p_address: form.address.trim() || "주소 정보 없음",
      p_category: form.category,
      p_has_ramp: form.badges.ramp,
      p_has_restroom: form.badges.door,
      p_has_stroller_access: form.badges.stroller,
      p_has_elevator: form.badges.lift,
    });
    if (error) { showToast("등록 실패: " + error.message); return; }

    if (photoFile) {
      const fileExt = photoFile.name.split(".").pop();
      const filePath = `${data.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("place-photos").upload(filePath, photoFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("place-photos").getPublicUrl(filePath);
        await supabase.from("place_photos").insert({ place_id: data.id, photo_url: urlData.publicUrl, uploaded_by: session.user.id });
      }
    }

    setJustRegistered(data);
    setForm({ name: "", address: "", category: "공공기관", badges: { ramp: false, door: false, stroller: false, lift: false } });
    setPhotoFile(null);
    setPhotoPreview(null);
    fetchPlaces();
    fetchProfile();
    fetchHistory();
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
    { id: "my", label: "마이페이지", icon: User },
    ...(isAdmin ? [{ id: "admin", label: "관리자", icon: ShieldCheck }] : []),
  ];

  return (
    <div style={{ fontFamily: BODY_FONT, background: PAPER, minHeight: "100vh" }}>
      {/* ===== NAVBAR ===== */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 py-3.5" style={{ background: "#fff", borderBottom: `1px solid ${LINE}` }}>
        <div className="flex items-center gap-2">
          <LogoMark size={30} />
          <span style={{ fontFamily: DISPLAY_FONT, fontSize: 20, color: INK }}>장편</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 rounded-full p-1" style={{ background: PAPER }}>
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: CORAL_TINT }}>
            <Sparkles size={14} color={CORAL} />
            <span style={{ fontFamily: MONO_FONT, color: CORAL, fontWeight: 700, fontSize: 13 }}>{points.toLocaleString()}P</span>
          </div>
                  <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95" style={{ border: `1.4px solid ${LINE}`, color: INK_SOFT }}>
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </div>

      {/* ===== MOBILE TABS ===== */}
      <div className="flex sm:hidden overflow-x-auto gap-2 px-5 py-3" style={{ background: "#fff", borderBottom: `1px solid ${LINE}` }}>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95"
              style={{ background: active ? TEAL : PAPER, color: active ? "#fff" : INK_SOFT }}>
              <Icon size={13} />{n.label}
            </button>
          );
        })}
      </div>

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
              <div className="flex items-center gap-2 rounded-full px-4 py-3 mb-3" style={{ background: CARD, border: `1px solid ${LINE}` }}>
                <Search size={16} color={INK_SOFT} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="장소, 주소로 검색" className="flex-1 outline-none text-sm bg-transparent" style={{ color: INK }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(BADGE_META).map(([key, meta]) => {
                  const Icon = meta.icon;
                  const active = activeFilters.includes(key);
                  return (
                    <button key={key} onClick={() => toggleFilter(key)} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border transition-all duration-200 active:scale-95 hover:shadow-sm"
                      style={{ borderColor: TEAL, background: active ? TEAL : "#fff", color: active ? "#fff" : TEAL }}>
                      <Icon size={13} />{meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {notices.length > 0 && (
              <div className="rounded-2xl p-4 mb-4 flex items-start gap-3" style={{ background: TEAL_TINT }}>
                <Megaphone size={18} color={TEAL_DARK} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-sm mb-0.5" style={{ color: TEAL_DARK }}>{notices[0].title}</div>
                  <div className="text-xs" style={{ color: INK_SOFT }}>{notices[0].content}</div>
                </div>
              </div>
            )}
            <div className="rounded-2xl p-5 mb-6 text-white" style={{ background: `linear-gradient(120deg, ${CORAL}, #F58152)` }}>
              <div className="text-xs font-bold opacity-85 mb-1">이번 달 캠페인</div>
              <div className="font-extrabold text-lg leading-snug">신규 장소 등록하고 2P 받아가세요</div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm" style={{ color: INK }}>등록된 장소 {filteredPlaces.length}곳</span>
              {activeFilters.length > 0 && (
                <button onClick={() => setActiveFilters([])} className="text-xs font-bold flex items-center gap-1" style={{ color: INK_SOFT }}><X size={12} /> 필터 초기화</button>
              )}
            </div>

               <div className="grid sm:grid-cols-2 gap-3">
              {filteredPlaces.map((p) => (
                <div key={p.id} onClick={() => { setPendingFocusId(p.id); setTab("map"); }} className="cursor-pointer">
                  <PlaceCard place={p} onHelpful={markHelpful} isFavorite={favorites.has(p.id)} onToggleFavorite={toggleFavorite} onEdit={startEdit} isOwner={p.created_by === session.user.id} />
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
            <div ref={mapContainerRef} className="w-full h-72 rounded-2xl mb-6 overflow-hidden" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((c) => {
                const active = mapCategory === c;
                return (
                  <button key={c} onClick={() => setMapCategory(active ? null : c)} className="rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all duration-200 active:scale-95"
                    style={{ border: `1.4px solid ${active ? TEAL : LINE}`, background: active ? TEAL_TINT : "#fff", color: active ? TEAL_DARK : INK_SOFT }}>
                    {c}
                  </button>
                );
              })}
            </div>
                    <div className="grid sm:grid-cols-2 gap-3">
              {(mapCategory ? places.filter((p) => p.category === mapCategory) : places).map((p) => (
                <div key={p.id} onClick={() => focusOnPlace(p.id)} className="cursor-pointer">
                  <PlaceCard place={p} onHelpful={markHelpful} isFavorite={favorites.has(p.id)} onToggleFavorite={toggleFavorite} onEdit={startEdit} isOwner={p.created_by === session.user.id} />
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
                              <h2 className="font-extrabold text-xl mb-5" style={{ color: INK, fontFamily: DISPLAY_FONT }}>{editingPlaceId ? "장소 수정" : "장소 등록"}</h2>

                <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>장소명</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예) 행복나눔 도서관"
                  className="w-full rounded-xl px-4 py-3 mb-4 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />

                  <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>주소</label>
                <div className="flex gap-2 mb-4">
                  <input value={form.address} readOnly placeholder="주소 검색 버튼을 눌러주세요"
                    className="flex-1 rounded-xl px-4 py-3 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK, background: PAPER }} />
                  <button type="button" onClick={openAddressSearch} className="rounded-xl px-4 py-3 text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95" style={{ background: TEAL, color: "#fff" }}>
                    주소 검색
                  </button>
                </div>

                <label className="block text-xs font-bold mb-1.5" style={{ color: INK_SOFT }}>카테고리</label>
                <div className="flex flex-wrap gap-2 mb-5">
                  {CATEGORIES.map((c) => (
                    <button type="button" key={c} onClick={() => setForm({ ...form, category: c })} className="rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all duration-200 active:scale-95"
                      style={{ borderColor: form.category === c ? TEAL : LINE, background: form.category === c ? TEAL_TINT : "#fff", color: form.category === c ? TEAL_DARK : INK_SOFT }}>
                      {c}
                    </button>
                  ))}
                </div>

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
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="flex items-center justify-center rounded-xl mb-6 cursor-pointer transition-all duration-200 hover:opacity-80" style={{ border: `1.5px dashed ${LINE}`, height: photoPreview ? "auto" : 96 }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="미리보기" className="w-full h-40 object-cover rounded-xl" />
                  ) : (
                    <div className="text-center py-4">
                      <Camera size={20} color={INK_SOFT} className="mx-auto mb-1" />
                      <div className="text-xs font-bold" style={{ color: INK_SOFT }}>사진 추가하기</div>
                    </div>
                  )}
                </label>
                <button type="submit" disabled={!form.name.trim()}
                  className="w-full rounded-full py-3.5 font-extrabold text-white flex items-center justify-center gap-1 transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                  style={{ background: form.name.trim() ? CORAL : LINE, cursor: form.name.trim() ? "pointer" : "not-allowed" }}>
                                    {editingPlaceId ? "수정 완료" : "등록하고 2P 받기"} <ChevronRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ===================== 마이페이지 ===================== */}
        {tab === "my" && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl p-6 mb-5 text-white" style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <User size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-sm">{session.user.email}</div>
                  <div className="inline-block text-[11px] rounded-full px-2 py-0.5 mt-0.5" style={{ background: "rgba(255,255,255,0.18)" }}>{tier.label}</div>
                </div>
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

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>포인트 내역</div>
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
          </div>
        )}
          
        {/* ===================== 관리자 ===================== */}
        {tab === "admin" && isAdmin && (
          <div className="max-w-2xl mx-auto">
            <h2 className="font-extrabold text-xl mb-5" style={{ color: INK, fontFamily: DISPLAY_FONT }}>관리자</h2>

            <div className="font-extrabold text-sm mb-3" style={{ color: INK }}>공지사항 작성</div>
            <form onSubmit={submitNotice} className="rounded-2xl p-4 mb-8" style={{ background: CARD, border: `1px solid ${LINE}` }}>
              <input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} placeholder="공지 제목"
                className="w-full rounded-xl px-4 py-2.5 mb-2 text-sm outline-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
              <textarea value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} placeholder="공지 내용" rows={3}
                className="w-full rounded-xl px-4 py-2.5 mb-3 text-sm outline-none resize-none" style={{ border: `1.4px solid ${LINE}`, color: INK }} />
              <button type="submit" className="w-full rounded-full py-2.5 text-sm font-bold text-white" style={{ background: TEAL }}>공지 등록</button>
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
                  <button onClick={() => deleteNotice(n.id)} className="text-xs font-bold flex-shrink-0" style={{ color: CORAL }}>삭제</button>
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

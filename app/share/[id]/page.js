"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const TEAL = "#0F6E62";
const TEAL_DARK = "#0A4F46";
const TEAL_TINT = "#E3F0EC";
const CORAL = "#F0603D";
const PAPER = "#FAF7F1";
const CARD = "#FFFFFF";
const INK = "#1C2420";
const INK_SOFT = "#66716A";
const LINE = "#E4DFD1";

export default function SharedFavoritesPage({ params }) {
  const [places, setPlaces] = useState([]);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.rpc("get_shared_favorites", { p_share_id: params.id });
      if (error || !data || data.length === 0) {
        setNotFound(true);
      } else {
        setPlaces(data);
        setNickname(data[0]?.owner_nickname || "친구");
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  const badgeMeta = {
    has_ramp: { label: "휠체어 출입" },
    has_restroom: { label: "장애인 화장실" },
    has_stroller_access: { label: "유모차 접근" },
    has_elevator: { label: "엘리베이터" },
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", color: INK_SOFT, fontFamily: "'Nanum Gothic', sans-serif" }}>
        불러오는 중...
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: PAPER, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", fontFamily: "'Nanum Gothic', sans-serif" }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🗺️</div>
        <div style={{ fontWeight: 800, color: INK, marginBottom: 10, fontSize: 16 }}>공유 링크를 찾을 수 없어요</div>
        <a href="https://jangpyeon.kr" style={{ color: TEAL, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>장편 홈으로 가기</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "'Nanum Gothic', sans-serif" }}>
      <div style={{ background: TEAL, padding: "40px 24px 32px" }}>
        <div style={{ fontSize: 13, opacity: 0.85, color: "#fff", marginBottom: 6 }}>{nickname}님이 공유한</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
          🗺️ 즐겨찾기 지도
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>{places.length}곳의 접근성 정보</div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>
        {places.map((p) => (
          <div key={p.id} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            {p.photo_url && (
              <img src={p.photo_url} alt={p.name} style={{ width: "100%", height: 170, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} />
            )}
            <div style={{ fontWeight: 800, color: INK, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: INK_SOFT, marginBottom: 12 }}>{p.category} · {p.address}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(badgeMeta).map(([key, meta]) => p[key] && (
                <span key={key} style={{ fontSize: 11, fontWeight: 700, background: TEAL_TINT, color: TEAL_DARK, padding: "5px 12px", borderRadius: 999 }}>
                  {meta.label}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", padding: "28px 0 12px" }}>
          <div style={{ fontSize: 13, color: INK_SOFT, marginBottom: 14 }}>
            장애물 없는 편의, 함께 기록해요
          </div>
          <a href="https://jangpyeon.kr" style={{ display: "inline-block", background: CORAL, color: "#fff", fontWeight: 800, fontSize: 14, padding: "13px 28px", borderRadius: 999, textDecoration: "none" }}>
            장편에서 더 많은 장소 보기
          </a>
        </div>
      </div>
    </div>
  );
}

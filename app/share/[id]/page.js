"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const TEAL = "#0F6E62";
const TEAL_TINT = "#E3F0EC";
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

  if (loading) {
    return <div style={{ minHeight: "100vh", background: PAPER, display: "flex", alignItems: "center", justifyContent: "center", color: INK_SOFT }}>불러오는 중...</div>;
  }

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: PAPER, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
        <div style={{ fontWeight: 800, color: INK, marginBottom: 8 }}>공유 링크를 찾을 수 없어요</div>
        <a href="https://jangpyeon.kr" style={{ color: TEAL, fontSize: 14, fontWeight: 700 }}>장편 홈으로 가기</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "sans-serif" }}>
      <div style={{ background: TEAL, padding: "32px 20px", color: "#fff" }}>
        <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 4 }}>{nickname}님이 공유한</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>🗺️ 즐겨찾기 지도</div>
      </div>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
        {places.map((p) => (
          <div key={p.id} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            {p.photo_url && (
              <img src={p.photo_url} alt={p.name} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} />
            )}
            <div style={{ fontWeight: 800, color: INK, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: INK_SOFT, marginBottom: 10 }}>{p.category} · {p.address}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {p.has_ramp && <span style={{ fontSize: 11, background: TEAL_TINT, color: TEAL, padding: "4px 10px", borderRadius: 999 }}>휠체어 출입</span>}
              {p.has_restroom && <span style={{ fontSize: 11, background: TEAL_TINT, color: TEAL, padding: "4px 10px", borderRadius: 999 }}>장애인 화장실</span>}
              {p.has_stroller_access && <span style={{ fontSize: 11, background: TEAL_TINT, color: TEAL, padding: "4px 10px", borderRadius: 999 }}>유모차 접근</span>}
              {p.has_elevator && <span style={{ fontSize: 11, background: TEAL_TINT, color: TEAL, padding: "4px 10px", borderRadius: 999 }}>엘리베이터</span>}
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <a href="https://jangpyeon.kr" style={{ display: "inline-block", background: TEAL, color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 999, textDecoration: "none" }}>
            장편에서 더 많은 장소 보기
          </a>
        </div>
      </div>
    </div>
  );
}

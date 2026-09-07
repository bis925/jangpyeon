export const metadata = {
  title: "이용약관 — 장편",
};

const TEAL = "#0F6E62";
const TEAL_TINT = "#E3F0EC";
const INK = "#1C2420";
const INK_SOFT = "#66716A";
const PAPER = "#FAF7F1";
const LINE = "#E4DFD1";

export default function TermsPage() {
  return (
    <div style={{ background: PAPER, minHeight: "100vh", fontFamily: "'Nanum Gothic', sans-serif" }}>
      <div style={{ background: TEAL, padding: "48px 24px 36px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 6 }}>장편(障便)</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>이용약관</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 10 }}>시행일자: 2026년 1월 1일</p>
        </div>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px 60px", lineHeight: 1.8, color: INK }}>

        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>1</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>목적</h2>
          </div>
          <p style={{ margin: 0, color: INK_SOFT, fontSize: 14 }}>본 약관은 장편(이하 "서비스")이 제공하는 접근성 정보 지도 서비스의 이용과 관련하여, 서비스와 이용자 간의 권리, 의무 및 책임사항을 정하는 것을 목적으로 합니다.</p>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>2</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>서비스의 내용</h2>
          </div>
          <p style={{ margin: 0, color: INK_SOFT, fontSize: 14 }}>서비스는 휠체어 이용자, 유모차 이용자, 어르신 등 이동에 불편이 있는 이용자를 위해, 접근성 정보(휠체어 출입 가능 여부, 장애인 화장실 유무 등)를 지도에서 확인하고 이용자가 직접 등록·공유할 수 있는 기능을 제공합니다.</p>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>3</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>회원가입 및 계정</h2>
          </div>
          <p style={{ margin: "0 0 8px", color: INK_SOFT, fontSize: 14 }}>이용자는 이메일 인증 또는 구글 계정 연동을 통해 회원가입을 할 수 있습니다. 이용자는 본인의 계정 정보를 안전하게 관리할 책임이 있으며, 계정을 타인에게 양도하거나 대여할 수 없습니다.</p>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>4</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>이용자의 의무</h2>
          </div>
          <p style={{ margin: "0 0 8px", color: INK_SOFT, fontSize: 14 }}>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul style={{ margin: 0, paddingLeft: 20, color: INK_SOFT, fontSize: 14 }}>
            <li>허위 정보를 등록하거나 타인에게 피해를 주는 행위</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
            <li>타인의 개인정보를 무단으로 수집하거나 공개하는 행위</li>
            <li>자동화된 수단(매크로 등)을 이용해 부정하게 포인트를 취득하는 행위</li>
            <li>관련 법령 및 공서양속에 반하는 행위</li>
          </ul>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>5</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>포인트 및 쿠폰</h2>
          </div>
          <p style={{ margin: 0, color: INK_SOFT, fontSize: 14 }}>서비스는 이용자의 활동(장소 등록, 정보 확인 등)에 따라 포인트를 지급할 수 있으며, 포인트는 서비스 내 이벤트나 쿠폰 발급 등에 활용될 수 있습니다. 부정한 방법으로 취득한 포인트는 사전 통지 없이 조정되거나 회수될 수 있습니다. 포인트는 현금으로 환전되지 않습니다.</p>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>6</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>서비스의 변경 및 중단</h2>
          </div>
          <p style={{ margin: 0, color: INK_SOFT, fontSize: 14 }}>서비스는 운영상, 기술상의 필요에 따라 제공하는 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우 사전에 공지사항을 통해 안내합니다.</p>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>7</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>면책조항</h2>
          </div>
          <p style={{ margin: 0, color: INK_SOFT, fontSize: 14 }}>서비스에 등록된 접근성 정보는 이용자들이 직접 등록한 정보로, 실제 현장 상황과 다를 수 있습니다. 서비스는 등록된 정보의 정확성을 보장하지 않으며, 이용자는 방문 전 사전 확인을 권장합니다.</p>
        </div>

        <div style={{ background: TEAL_TINT, borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: "#fff", color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>8</span>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>문의처</h2>
          </div>
          <p style={{ margin: 0, color: INK, fontSize: 14 }}>서비스명: 장편<br />문의: 카카오톡 채널 "장편" 또는 앱 내 1:1 문의</p>
        </div>

      </div>
    </div>
  );
}

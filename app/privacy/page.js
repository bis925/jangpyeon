export const metadata = {
  title: "개인정보처리방침 — 장편",
};

const TEAL = "#0F6E62";
const TEAL_TINT = "#E3F0EC";
const INK = "#1C2420";
const INK_SOFT = "#66716A";
const PAPER = "#FAF7F1";
const LINE = "#E4DFD1";

export default function PrivacyPage() {
  return (
    <div style={{ background: PAPER, minHeight: "100vh", fontFamily: "'Nanum Gothic', sans-serif" }}>
      <div style={{ background: TEAL, padding: "48px 24px 36px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 6 }}>장편(障便)</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>개인정보처리방침</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 10 }}>시행일자: 2026년 1월 1일</p>
        </div>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px 60px", lineHeight: 1.8, color: INK }}>

      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>1</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>수집하는 개인정보 항목</h2>
        </div>
        <p style={{ margin: "0 0 8px", color: INK_SOFT, fontSize: 14 }}>장편(이하 "서비스")은 회원가입 및 로그인을 위해 아래 정보를 수집합니다.</p>
        <ul style={{ margin: 0, paddingLeft: 20, color: INK_SOFT, fontSize: 14 }}>
          <li>이메일 주소 (로그인 및 본인 확인용)</li>
          <li>서비스 이용 과정에서 등록하는 장소 정보, 사진, 닉네임 등 이용자가 직접 입력한 정보</li>
        </ul>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>2</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>개인정보의 수집 방법</h2>
        </div>
        <p style={{ margin: 0, color: INK_SOFT, fontSize: 14 }}>이메일 로그인(매직링크) 절차 중 이용자가 직접 입력함으로써 수집됩니다.</p>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>3</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>개인정보의 이용 목적</h2>
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, color: INK_SOFT, fontSize: 14 }}>
          <li>회원 식별 및 로그인 처리</li>
          <li>포인트 적립 및 등급 관리</li>
          <li>공지사항, 이벤트 안내</li>
          <li>1:1 문의 응대</li>
        </ul>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>4</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>프로필 배경 사진 등 이용자 업로드 콘텐츠</h2>
        </div>
        <p style={{ margin: "0 0 8px", color: INK_SOFT, fontSize: 14 }}>이용자는 마이페이지 프로필 카드의 배경으로 본인이 소유하거나 이용 권한이 있는 사진만 업로드해야 합니다. 해당 사진은 본인 계정에서만 확인 가능하며 다른 이용자에게 공개되지 않습니다. 다만 다음에 해당하는 콘텐츠는 업로드할 수 없으며, 확인 시 사전 통지 없이 삭제될 수 있습니다.</p>
        <ul style={{ margin: 0, paddingLeft: 20, color: INK_SOFT, fontSize: 14 }}>
          <li>타인의 저작권, 초상권 등을 침해하는 사진</li>
          <li>음란물, 폭력적이거나 혐오스러운 내용을 포함한 사진</li>
          <li>불법적인 내용을 포함하거나 관련 법령에 위반되는 사진</li>
        </ul>
      </div>
       <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>5</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>개인정보의 보유 및 이용 기간</h2>
        </div>
        <p style={{ margin: 0, color: INK_SOFT, fontSize: 14 }}>회원 탈퇴 시 또는 법령에 따른 보관 기간이 경과할 때까지 보유하며, 이후 지체 없이 파기합니다.</p>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>6</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>개인정보 처리 위탁</h2>
        </div>
        <p style={{ margin: "0 0 8px", color: INK_SOFT, fontSize: 14 }}>서비스 운영을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.</p>
        <ul style={{ margin: 0, paddingLeft: 20, color: INK_SOFT, fontSize: 14 }}>
          <li>Supabase (데이터베이스 및 인증 서비스 운영)</li>
          <li>카카오 (지도 표시, 카카오톡 공유 및 상담 기능)</li>
          <li>Daum (주소 검색 기능)</li>
        </ul>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: TEAL_TINT, color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>7</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>이용자의 권리</h2>
        </div>
        <p style={{ margin: 0, color: INK_SOFT, fontSize: 14 }}>이용자는 언제든지 본인의 개인정보를 조회, 수정, 삭제할 수 있으며, 회원 탈퇴를 통해 개인정보 이용에 대한 동의를 철회할 수 있습니다.</p>
      </div>

      <div style={{ background: TEAL_TINT, borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 999, background: "#fff", color: TEAL, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>8</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: INK }}>개인정보 보호책임자</h2>
        </div>
        <p style={{ margin: 0, color: INK, fontSize: 14 }}>서비스명: 장편<br />문의: 카카오톡 채널 "장편" 또는 앱 내 1:1 문의</p>
      </div>
      </div>
    </div>
  );
}

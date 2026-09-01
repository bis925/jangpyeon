export const metadata = {
  title: "개인정보처리방침 — 장편",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", lineHeight: 1.7, color: "#1C2420", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>장편 개인정보처리방침</h1>
      <p style={{ color: "#66716A", fontSize: 14, marginBottom: 32 }}>시행일자: 2026년 1월 1일</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>1. 수집하는 개인정보 항목</h2>
      <p>장편(이하 "서비스")은 회원가입 및 로그인을 위해 아래 정보를 수집합니다.</p>
      <ul>
        <li>이메일 주소 (로그인 및 본인 확인용)</li>
        <li>서비스 이용 과정에서 등록하는 장소 정보, 사진, 닉네임 등 이용자가 직접 입력한 정보</li>
      </ul>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>2. 개인정보의 수집 방법</h2>
      <p>이메일 로그인(매직링크) 절차 중 이용자가 직접 입력함으로써 수집됩니다.</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>3. 개인정보의 이용 목적</h2>
      <ul>
        <li>회원 식별 및 로그인 처리</li>
        <li>포인트 적립 및 등급 관리</li>
        <li>공지사항, 이벤트 안내</li>
        <li>1:1 문의 응대</li>
      </ul>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>4. 개인정보의 보유 및 이용 기간</h2>
      <p>회원 탈퇴 시 또는 법령에 따른 보관 기간이 경과할 때까지 보유하며, 이후 지체 없이 파기합니다.</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>5. 개인정보 처리 위탁</h2>
      <p>서비스 운영을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.</p>
      <ul>
        <li>Supabase (데이터베이스 및 인증 서비스 운영)</li>
        <li>카카오 (지도 표시, 카카오톡 공유 및 상담 기능)</li>
        <li>Daum (주소 검색 기능)</li>
      </ul>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>6. 이용자의 권리</h2>
      <p>이용자는 언제든지 본인의 개인정보를 조회, 수정, 삭제할 수 있으며, 회원 탈퇴를 통해 개인정보 이용에 대한 동의를 철회할 수 있습니다.</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>7. 개인정보 보호책임자</h2>
      <p>서비스명: 장편<br />문의: 카카오톡 채널 "장편" 또는 앱 내 1:1 문의</p>
    </div>
  );
}

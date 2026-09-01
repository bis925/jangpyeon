export const metadata = {
  title: "계정 삭제 안내 — 장편",
};

export default function DeleteAccountPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px", lineHeight: 1.7, color: "#1C2420", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>장편 계정 삭제 안내</h1>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>계정 삭제 요청 방법</h2>
      <p>장편 앱을 삭제하시려면 아래 방법 중 하나로 요청해주세요.</p>
      <ul>
        <li>앱 내 "마이페이지" → "1:1 문의"에서 "계정 삭제 요청"이라고 남겨주세요.</li>
        <li>카카오톡 채널 "장편"으로 계정 삭제를 요청해주세요.</li>
      </ul>
      <p>요청하실 때 가입하신 이메일 주소를 함께 알려주시면 빠르게 처리해드립니다.</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>삭제되는 데이터</h2>
      <p>계정 삭제를 요청하시면 아래 정보가 삭제됩니다.</p>
      <ul>
        <li>이메일 주소, 닉네임 등 회원 정보</li>
        <li>포인트 및 등급 정보</li>
        <li>즐겨찾기, 도움이 됐어요 등 활동 기록</li>
      </ul>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>보관되는 데이터</h2>
      <p>이용자가 등록한 장소 정보(접근성 정보)는 다른 이용자에게 도움이 되는 공익 정보이므로, 계정 삭제 후에도 작성자 정보만 익명 처리되어 남을 수 있습니다.</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>처리 기간</h2>
      <p>요청 접수 후 최대 7일 이내에 처리됩니다.</p>

      <p style={{ marginTop: 32, color: "#66716A" }}>장편 · 코드람쥐</p>
    </div>
  );
}

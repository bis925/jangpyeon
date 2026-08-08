import "./globals.css";

export const metadata = {
  title: "장편 — 장애물 없는 편의",
  description: "휠체어·유모차 접근성, 장애인 화장실 정보를 함께 기록하는 서비스",
  other: {
    "naver-site-verification": "e53320c92097dc0b07b53181135a5269acb724e4",
    "google-site-verification": "lbr7goiG8RIJz87vb4T3RSeIV5rkh4F3gWmXXdA1tUw",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

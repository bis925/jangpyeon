import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://jangpyeon.kr"),
  title: "장편 — 휠체어 접근성 지도 · 장애인 화장실 찾기",
  description: "휠체어 출입, 장애인 화장실, 유모차 접근성 정보를 지도에서 확인하고 함께 기록하는 서비스, 장편입니다. 누구나 등록하고 포인트를 받아요.",
  openGraph: {
    title: "장편 — 휠체어 접근성 지도 · 장애인 화장실 찾기",
    description: "휠체어 출입, 장애인 화장실, 유모차 접근성 정보를 지도에서 확인하고 함께 기록하는 서비스, 장편입니다. 누구나 등록하고 포인트를 받아요.",
    url: "https://jangpyeon.kr",
    siteName: "장편",
    images: [
      {
        url: "https://jangpyeon.kr/logo.png",
        width: 1600,
        height: 1600,
        alt: "장편 로고",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
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

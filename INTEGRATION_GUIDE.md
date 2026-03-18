# 🔗 Integration Guide
## Build compatibility analysis web service MVP → 사주역학연구소 블로그 이식 가이드

> 이 문서는 현재 운영 중인 사주역학연구소 블로그에 **궁합 분석 웹서비스 MVP**를 이식·통합하기 위한 기술 가이드입니다.

---

## 📌 현재 블로그 인프라 정보

| 항목 | 내용 |
|------|------|
| **서비스 URL** | https://saju-blog-two.vercel.app |
| **GitHub 레포** | https://github.com/hangugeo-go/saju-blog |
| **브랜치** | `main` (push 시 자동 배포) |
| **배포 플랫폼** | Vercel (Hobby) |
| **수익화** | Google AdSense 신청 예정 |
| **연락처** | maisondesisy@gmail.com |

---

## 🛠 기술 스택

| 항목 | 버전/내용 |
|------|-----------|
| **Framework** | Next.js 16.1.7 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS |
| **UI Font** | Noto Sans KR (Google Fonts) |
| **런타임** | Node.js |
| **빌드** | `npm run build` |
| **배포** | Vercel 자동 CI/CD (main 브랜치 push → 자동 배포) |

---

## 📁 프로젝트 구조

```
saju-blog/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 공통 레이아웃 (Header/Footer/AdSense)
│   │   ├── page.tsx            # 홈페이지
│   │   ├── blog/
│   │   │   ├── page.tsx        # 블로그 목록
│   │   │   └── [slug]/page.tsx # 블로그 상세
│   │   ├── about/page.tsx      # 소개 페이지
│   │   ├── contact/page.tsx    # 문의 페이지
│   │   ├── privacy/page.tsx    # 개인정보처리방침
│   │   ├── sitemap.ts          # 자동 sitemap 생성
│   │   └── robots.ts           # robots.txt
│   ├── components/
│   │   ├── Header.tsx          # 공통 헤더 (네비게이션)
│   │   ├── Footer.tsx          # 공통 푸터
│   │   ├── AdSense.tsx         # 광고 컴포넌트 (승인 후 활성화)
│   │   └── BlogCard.tsx        # 블로그 카드 컴포넌트
│   └── lib/
│       ├── posts.ts            # Markdown 포스트 파싱 로직
│       └── markdownToHtml.ts   # Markdown → HTML 변환
├── content/
│   └── posts/                  # Markdown 블로그 포스트 (23개)
├── public/                     # 정적 파일
├── next.config.ts              # Next.js 설정
└── vercel.json                 # Vercel 배포 설정
```

---

## 🚀 MVP 이식 방법

### 방법 1: 새 라우트 추가 (권장)

궁합 분석 서비스를 `/compatibility` 경로로 추가하는 방법입니다.

```
src/app/
├── compatibility/
│   ├── page.tsx        # 궁합 분석 메인 페이지
│   └── result/
│       └── page.tsx    # 분석 결과 페이지
```

**Header에 메뉴 추가 필요** (`src/components/Header.tsx`):
```tsx
<Link href="/compatibility">궁합분석</Link>
```

**Sitemap에 URL 추가** (`src/app/sitemap.ts`):
```ts
{
  url: `${BASE_URL}/compatibility`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.9,
}
```

### 방법 2: 독립 컴포넌트로 임베드

기존 페이지 내에 궁합 분석 위젯을 컴포넌트로 삽입하는 방법입니다.

```tsx
// src/components/CompatibilityWidget.tsx 생성 후
// 원하는 페이지에서 import하여 사용
import CompatibilityWidget from '@/components/CompatibilityWidget'
```

---

## ⚙️ 로컬 개발 환경 세팅

```bash
# 1. 레포 클론
git clone https://github.com/hangugeo-go/saju-blog.git
cd saju-blog

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000 접속

# 4. 빌드 테스트
npm run build
```

---

## 🔄 배포 프로세스

```bash
# main 브랜치에 push하면 Vercel 자동 배포
git add .
git commit -m "feat: add compatibility analysis MVP"
git push origin main
# → 약 1~2분 후 https://saju-blog-two.vercel.app 에 자동 반영
```

---

## 💰 AdSense 연동 현황

`src/app/layout.tsx`에 AdSense 스크립트 슬롯이 준비되어 있습니다.

```tsx
{/* Google AdSense - 승인 후 아래 주석 해제 및 ca-pub-XXXXXXXX 교체 */}
{/* <script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossOrigin="anonymous"
/> */}
```

광고 컴포넌트(`src/components/AdSense.tsx`)도 준비되어 있으며, AdSense 승인 후 활성화하면 됩니다.

---

## 🔍 SEO 현황

| 항목 | 상태 |
|------|------|
| Google Search Console | ✅ 등록 완료 |
| Sitemap 제출 | ✅ `/sitemap.xml` 제출 완료 |
| robots.txt | ✅ 설정 완료 |
| OG 태그 | ✅ 설정 완료 |
| 보안 헤더 | ✅ 설정 완료 |

---

## 📝 주의사항

1. **BASE_URL 변경**: 현재 `https://saju-blog-two.vercel.app` 으로 설정되어 있음. 커스텀 도메인 연결 시 `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx` 3곳 수정 필요.

2. **AdSense 미활성**: 현재 광고 코드는 주석 처리 상태. 승인 후 `ca-pub-XXXXXXXX` 를 실제 ID로 교체 후 주석 해제.

3. **환경 변수**: 외부 API 연동 시 Vercel 대시보드 → Settings → Environment Variables에서 추가.

4. **브랜치 전략**: `main` 브랜치가 프로덕션. 개발은 별도 브랜치에서 작업 후 PR 권장.

---

## 📞 문의

- **이메일**: maisondesisy@gmail.com
- **GitHub**: https://github.com/hangugeo-go

---

*Last updated: 2026-03-19*

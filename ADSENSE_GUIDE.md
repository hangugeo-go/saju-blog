# Google AdSense 적용 가이드

## 1단계: 사이트 배포 (Vercel)

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
cd saju-blog
vercel --prod
```

또는 GitHub에 push 후 vercel.com에서 Import Project.

---

## 2단계: 도메인 연결

1. 도메인 구매 (Namecheap, GoDaddy, Gabia 등)
2. Vercel 대시보드 → Settings → Domains → 도메인 추가
3. DNS 설정 (A레코드 또는 CNAME)

**`src/app/layout.tsx`와 `src/app/sitemap.ts`의 `https://sajulab.com` 부분을 실제 도메인으로 교체**

---

## 3단계: Google Search Console 등록

1. https://search.google.com/search-console 접속
2. 도메인 추가 → 소유권 인증 (HTML 파일 or DNS TXT 레코드)
3. 사이트맵 제출: `https://[도메인]/sitemap.xml`

---

## 4단계: AdSense 신청

### 신청 조건 체크리스트
- [ ] 도메인 연결 완료
- [ ] 콘텐츠 10개 이상 (현재 10개 완료)
- [ ] About 페이지 존재
- [ ] Privacy Policy 페이지 존재
- [ ] Contact 페이지 존재
- [ ] 모바일 반응형 확인
- [ ] 로딩 속도 양호 (Core Web Vitals)
- [ ] Google Search Console 등록 완료
- [ ] 사이트맵 제출 완료

### 신청 방법
1. https://www.google.com/adsense 접속
2. 사이트 URL 입력
3. ads.txt 파일 설치

### ads.txt 파일 생성
`public/ads.txt` 파일 생성:
```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```
(XXXXXXXXXXXXXXXX 자리에 발급된 Publisher ID 입력)

---

## 5단계: AdSense 승인 후 광고 코드 적용

### layout.tsx에 AdSense 스크립트 추가

`src/app/layout.tsx`에서 주석 해제:
```tsx
<head>
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
    crossOrigin="anonymous"
  />
</head>
```

### 광고 슬롯 ID 교체

`src/components/AdSense.tsx`에서:
- `ADSENSE_CLIENT`: `ca-pub-XXXXXXXXXXXXXXXX` → 실제 Publisher ID
- `AdBanner` slot: `XXXXXXXXXX` → 실제 슬롯 ID
- `AdInContent` slot: `YYYYYYYYYY` → 실제 슬롯 ID
- `AdSidebar` slot: `ZZZZZZZZZZ` → 실제 슬롯 ID

### 블로그 포스트 페이지 광고 활성화

`src/app/blog/[slug]/page.tsx`에서 주석 해제:
```tsx
{/* Top Ad */}
<AdInContent />

{/* Mid Ad */}
<AdInContent />
```

---

## AdSense 빠른 승인 팁

1. **콘텐츠 품질**: 800~1500자 이상의 오리지널 글 (현재 완료)
2. **정기 업데이트**: 주 2~3회 이상 새 글 발행
3. **트래픽 확보**: Google Search Console에서 인덱싱 요청
4. **소셜 공유**: 초기 트래픽 확보를 위해 각 포스트를 카카오·네이버 블로그·트위터 등에 공유
5. **사이트 완성도**: 모든 링크 정상 작동 확인
6. **신청 시점**: 사이트 오픈 후 2~4주 이후 신청 권장

---

## 향후 SaaS 이식 계획

1. 현재 블로그 구조 유지 (블로그 섹션 유지)
2. `/app` 라우트에 SaaS 기능 추가 (`/app/dashboard`, `/app/analyze` 등)
3. 헤더에 "서비스 이용하기" 버튼 추가
4. 블로그 포스트 하단에 SaaS 서비스 CTA 추가
5. AdSense와 SaaS 구독료 동시 수익화

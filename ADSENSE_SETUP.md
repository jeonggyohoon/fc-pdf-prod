# Google AdSense 설정 가이드

## 1. Google AdSense 계정 생성 및 승인

### 1-1. AdSense 가입
1. [Google AdSense](https://www.google.com/adsense) 접속
2. "시작하기" 클릭
3. Google 계정으로 로그인
4. 웹사이트 URL 입력: `your-domain.com`
5. 이메일 설정 및 약관 동의

### 1-2. 사이트 연결
1. AdSense에서 제공하는 코드 복사
2. `app/layout.tsx`의 `<head>` 태그에 추가
3. 사이트 배포 (Vercel/Netlify 등)
4. AdSense에서 "사이트 연결됨" 확인

### 1-3. 승인 대기
- **심사 기간**: 보통 1-2주 소요
- **승인 조건**:
  - 충분한 콘텐츠
  - 정상 작동하는 웹사이트
  - 트래픽 (최소 요구사항 없음, 하지만 권장)
  - AdSense 정책 준수

## 2. 전면 광고 단위 생성

### 2-1. 광고 단위 만들기
1. AdSense 대시보드 → "광고" → "광고 단위 기준"
2. "전면 광고" 선택
3. 광고 단위 이름 입력: "PDF Download Interstitial"
4. 광고 설정:
   - **빈도 설정**: 사용자당 1시간에 1회 (권장)
   - **표시 위치**: 모든 페이지 또는 특정 이벤트
5. "만들기" 클릭

### 2-2. 광고 코드 복사
```html
<!-- Google AdSense 전면 광고 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-format="interstitial"
     data-ad-client="ca-pub-XXXXXXXXXX"
     data-ad-slot="YYYYYYYYYY"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## 3. 환경 변수 설정

### 3-1. `.env.local` 파일 생성
```env
# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_INTERSTITIAL_SLOT=YYYYYYYYYY
```

### 3-2. `.env.example` 파일 생성
```env
# Google AdSense (Replace with your actual values)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_INTERSTITIAL_SLOT=YYYYYYYYYY
```

## 4. 코드 구현 (이미 완료)

### 4-1. AdSense 스크립트 추가
`app/layout.tsx`에 AdSense 스크립트 추가됨

### 4-2. AdService 유틸리티
`lib/adsense/AdService.ts` 생성됨

### 4-3. 다운로드 버튼 통합
- `components/ResultView.tsx` - Download All 버튼
- `components/PagePreview.tsx` - 개별 Download 버튼

## 5. 테스트 방법

### 5-1. 로컬 테스트
```bash
npm run dev
```
- AdSense는 로컬에서 작동하지 않을 수 있음
- 실제 배포 후 테스트 필요

### 5-2. 프로덕션 배포
```bash
npm run build
npm start
# 또는 Vercel/Netlify에 배포
```

### 5-3. AdSense 테스트 모드
- AdSense 승인 전에는 **테스트 광고**가 표시됨
- 승인 후 실제 광고가 표시됨

## 6. 승인 후 최적화

### 6-1. 광고 빈도 조정
```typescript
// lib/adsense/AdService.ts에서 수정
private shouldShowAd(): boolean {
  const lastShown = localStorage.getItem('lastAdShown')
  if (!lastShown) return true

  const timeSinceLastAd = Date.now() - parseInt(lastShown)
  return timeSinceLastAd > 60 * 60 * 1000 // 1시간
}
```

### 6-2. A/B 테스트
- 광고 표시 비율 조정
- 다운로드 전환율 모니터링
- 사용자 이탈률 확인

### 6-3. 광고 수익 모니터링
- AdSense 대시보드에서 확인
- RPM (천 번 노출당 수익) 추적
- CTR (클릭률) 최적화

## 7. 문제 해결

### 7-1. 광고가 표시되지 않음
- **원인**: AdSense 승인 대기 중
- **해결**: 승인 완료까지 대기

### 7-2. 광고가 너무 자주 표시됨
- **원인**: localStorage가 작동하지 않음
- **해결**: 쿠키 사용 또는 빈도 설정 조정

### 7-3. 광고 승인 거부됨
- **원인**: 정책 위반 (콘텐츠 부족, 중복 콘텐츠 등)
- **해결**:
  - 고유한 콘텐츠 추가
  - 정책 준수 확인
  - 재신청

## 8. 대안 광고 네트워크

AdSense 승인이 어려운 경우 대안:

### 8-1. Media.net
- Bing/Yahoo 광고 네트워크
- AdSense 다음으로 수익성 높음

### 8-2. PropellerAds
- 승인 쉬움
- Pop-under, Native Ads 제공

### 8-3. Adsterra
- 즉시 승인
- CPM 기반 광고

## 9. 다음 단계

1. ✅ 코드 구현 완료
2. ⏳ AdSense 계정 생성
3. ⏳ 사이트 연결 및 승인 대기
4. ⏳ 환경 변수 설정 (.env.local)
5. ⏳ 배포 및 테스트
6. ⏳ 수익 모니터링 및 최적화

---

**참고**: AdSense 정책을 반드시 준수해야 하며, 클릭 유도나 부정한 방법으로 광고 수익을 얻으려는 시도는 계정 정지로 이어질 수 있습니다.

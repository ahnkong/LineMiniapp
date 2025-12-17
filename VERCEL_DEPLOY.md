# Vercel 배포 가이드

## 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

### 필수 환경 변수

1. **NEXT_PUBLIC_TEMPLATE_CLIENT_ID**
   - Thirdweb Client ID
   - [Thirdweb Dashboard](https://thirdweb.com/dashboard)에서 발급받으세요

### 선택적 환경 변수

2. **NEXT_PUBLIC_TEMPLATE_LINE_LIFF** (선택사항)
   - LINE LIFF ID
   - LINE Developer Console에서 발급받으세요
   - 없어도 앱은 작동합니다

3. **NEXT_PUBLIC_TOKEN_CONTRACT** (선택사항)
   - ERC20 토큰 컨트랙트 주소
   - 없어도 게임은 작동합니다 (토큰 기능만 비활성화)

## Vercel에 환경 변수 설정하는 방법

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭
4. 각 환경 변수 추가:
   - **Name**: `NEXT_PUBLIC_TEMPLATE_CLIENT_ID`
   - **Value**: (Thirdweb Client ID)
   - **Environment**: Production, Preview, Development 모두 선택
5. **Save** 클릭
6. **Deployments** 탭에서 새로 배포

## 문제 해결

### 빌드 실패 시
- 환경 변수가 제대로 설정되었는지 확인
- Vercel 로그에서 에러 메시지 확인
- 환경 변수 이름이 정확한지 확인 (대소문자 구분)

### 런타임 에러 시
- 브라우저 콘솔에서 에러 확인
- `NEXT_PUBLIC_` 접두사가 있는 환경 변수만 클라이언트에서 접근 가능
- 환경 변수 변경 후 재배포 필요


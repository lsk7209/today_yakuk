# Gemini API 문제 해결 가이드

## 현재 상황

API 호출 시 404 오류가 발생하고 있습니다. 이는 모델 이름이나 엔드포인트가 잘못되었을 가능성이 있습니다.

## 해결 방법

### 1. API 키 확인

현재 사용 중인 API 키는 Google AI Studio에서 발급받은 것으로 보입니다:
- 형식: `AIzaSy...`
- 발급처: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. 올바른 엔드포인트 확인

Google AI Studio API 키를 사용하는 경우, 다음 엔드포인트 중 하나를 사용해야 합니다:

**옵션 1: v1 엔드포인트 (일반적인 경우)**
```
https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_API_KEY
```

**옵션 2: v1beta 엔드포인트 (최신 모델)**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY
```

### 3. 사용 가능한 모델 확인

다음 명령어로 사용 가능한 모델 목록을 확인할 수 있습니다:

```bash
curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY"
```

또는 브라우저에서:
```
https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY
```

### 4. API 키 권한 확인

Google AI Studio에서 API 키가 올바르게 설정되어 있는지 확인하세요:
- API 키가 활성화되어 있는지
- Gemini API가 활성화되어 있는지
- 사용량 제한이 초과되지 않았는지

### 5. 대안: Vertex AI 사용

Google AI Studio API 대신 Vertex AI를 사용하는 경우, 다른 엔드포인트와 인증 방식을 사용해야 합니다.

## 다음 단계

1. 위의 curl 명령어로 사용 가능한 모델 목록 확인
2. 확인된 모델 이름으로 코드 수정
3. 또는 Google AI Studio 대시보드에서 API 키 설정 확인

## 참고 자료

- [Google AI Studio 문서](https://ai.google.dev/docs)
- [Gemini API 가이드](https://ai.google.dev/tutorials/rest_quickstart)


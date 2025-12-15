# Gemini API 엔드포인트 수정 가이드

## 문제 상황

현재 API 호출 시 404 오류가 발생하고 있습니다. 이는 모델 이름이나 API 버전이 잘못되었을 가능성이 높습니다.

## 해결 방법

Google AI Studio에서 발급받은 API 키(`AIzaSy...` 형식)를 사용하는 경우, 다음 중 하나를 시도해보세요:

### 방법 1: 사용 가능한 모델 목록 확인

브라우저나 curl로 다음 URL을 확인하세요:
```
https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY
```

이렇게 하면 사용 가능한 모델 목록을 확인할 수 있습니다.

### 방법 2: 올바른 엔드포인트 사용

Google AI Studio API 키의 경우, 다음 엔드포인트를 사용해야 할 수 있습니다:

**옵션 A: v1 엔드포인트 (일반)**
```
https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_API_KEY
```

**옵션 B: v1beta 엔드포인트 (최신)**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY
```

**옵션 C: 모델 이름 없이 (자동 선택)**
일부 API 키는 모델 이름을 생략하고 사용할 수 있습니다.

### 방법 3: API 키 재발급

Google AI Studio에서 새로운 API 키를 발급받아 시도해보세요.

## 임시 해결책

API 키 문제가 해결될 때까지, 수동으로 컨텐츠를 생성하거나 다른 AI 서비스를 사용할 수 있습니다.


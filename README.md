# Price Alert Service

상품 가격을 추적하고 원하는 조건에 맞춰 알림을 제공하는 서비스입니다.

## 기술 스택

- 프론트엔드: React Native, Expo Router, TypeScript
- 백엔드: Spring Boot, Spring Web, Spring Data JPA
- 데이터베이스: MySQL 8.4
- 인프라: Docker Compose

## 프로젝트 구조

```text
price-alert-service/
├── backend/            # Spring Boot API 서버
├── frontend/           # Expo React Native 앱
└── docker-compose.yml  # 로컬 MySQL
```

## 개발 실행

### 환경 변수

```bash
cp .env.example .env
```

`.env` 파일에 로컬 개발에 사용할 데이터베이스 계정 정보를 입력합니다.

### 데이터베이스

```bash
docker compose up -d
```

로컬 MySQL은 `.env`에 설정한 데이터베이스 이름과 계정 정보를 사용합니다.

### 백엔드

```bash
cd backend
./gradlew bootRun
```

백엔드는 `http://localhost:8080`에서 실행됩니다.

### 프론트엔드

```bash
cd frontend
npm install
npm start
```

Expo 개발 서버를 실행한 뒤 에뮬레이터, 시뮬레이터 또는 Expo Go에서 앱을 확인합니다.

## API 설정

프론트엔드는 실행 플랫폼에 따라 개발용 API 주소를 자동으로 선택합니다.

| 플랫폼 | API 주소 |
| --- | --- |
| Web | `http://localhost:8080` |
| iOS 시뮬레이터 | `http://localhost:8080` |
| Android 에뮬레이터 | `http://10.0.2.2:8080` |
| 실제 기기 | Expo 개발 서버 호스트 IP와 `8080` 포트 |

필요한 경우 API 주소를 직접 지정할 수 있습니다.

```bash
EXPO_PUBLIC_API_URL=http://your-host:8080 npm start
```

## 검증

백엔드 테스트:

```bash
cd backend
./gradlew test
```

프론트엔드 타입 검사:

```bash
cd frontend
npx tsc --noEmit
```

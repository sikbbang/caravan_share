# Caravan Project

## 소개

[미리보기](http://caravansikbbang.shop:8080/)

이 프로젝트는 caravan(캠핑카)을 전시하고, 사용자가 예약 및 구매를 관리할 수 있는 포괄적인 웹 플랫폼입니다. 사용자는 다양한 caravan 목록을 탐색하고, 상세 정보를 확인하며, 마음에 드는 caravan을 장바구니에 담을 수 있습니다. 또한, Google 계정을 이용한 간편 로그인 및 사용자 인증 기능을 제공하여 개인화된 경험을 지원합니다.

프론트엔드는 순수 HTML, CSS, JavaScript로 구현되어 모든 최신 웹 브라우저에서 가볍고 빠르게 동작합니다. 백엔드는 Python 기반의 강력한 FastAPI 프레임워크를 사용하여 구축되었으며, 안정적인 데이터 관리와 신속한 API 응답을 보장합니다. 이 프로젝트는 caravan 호스트(관리자)와 일반 사용자 모두를 위한 기능을 갖춘 풀스택 애플리케이션의 좋은 예시입니다.

## 사용된 기술

### 백엔드
- Python 3.8+
- FastAPI
- SQLAlchemy (with SQLite)
- Uvicorn
- Authlib (for Google OAuth)
- JWT (for token-based authentication)

### 프론트엔드
- HTML
- CSS
- JavaScript

## 폴더 구조

```
/home/ubuntu/test/caravan_share/
├───README.md
├───start.py
├───backend/
│   ├───main.py
│   ├───requirements.txt
│   ├───seed.py
│   ├───app/
│   │   ├───__init__.py
│   │   ├───core/       # 설정, 보안
│   │   ├───crud/       # 데이터베이스 CRUD 작업
│   │   ├───db/         # 데이터베이스 세션 관리
│   │   ├───models/     # SQLAlchemy 모델
│   │   ├───routers/    # API 엔드포인트
│   │   └───schemas/    # Pydantic 스키마
│   └───static/
└───frontend/
    ├───app.js
    ├───index.html
    └───style.css
```

## 설정

**전제 조건:** Python 3.8 이상이 설치되어 있어야 합니다.

1.  **리포지토리 클론:**
    ```bash
    git clone <repository-url>
    cd caravan_share
    ```

2.  **백엔드 설정:**

    a. **종속성 설치:**
    ```bash
    pip install -r backend/requirements.txt
    ```

    b. **환경 변수 설정:**
    `backend/` 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가합니다.
    ```
    # Google OAuth 2.0 자격 증명
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    ```

## 실행 방법

프로젝트 루트 디렉토리 (`caravan_share/`)에서 다음 명령어를 실행하여 애플리케이션을 시작합니다:

```bash
python3 start.py
```

## API 엔드포인트

API는 `/api/v1` 접두사 아래에 마운트됩니다. 주요 라우터는 다음과 같습니다.

- **`/api/v1/caravans/`**: 모든 caravan을 가져오거나 새 caravan을 생성합니다.
- **`/api/v1/caravans/{caravan_id}`**: 특정 caravan의 세부 정보를 가져오거나, 업데이트하거나, 삭제합니다.
- **`/api/v1/users/`**: 사용자 관련 엔드포인트.
- **`/api/v1/cart/`**: 장바구니 관련 엔드포인트.
- **`/api/v1/host/`**: 호스트(관리자) 관련 엔드포인트.

전체 API 문서는 서버 실행 후 `http://localhost:8080/docs`에서 확인할 수 있습니다.

## 데이터베이스

애플리케이션은 **SQLite** 데이터베이스 (`caravan.db`)를 사용합니다. 데이터베이스 모델은 `backend/app/models/` 디렉토리에 정의되어 있으며, 주요 모델은 다음과 같습니다:
- `Caravan`: caravan의 세부 정보.
- `User`: 사용자 정보.
- `Cart`: 사용자의 장바구니 정보.

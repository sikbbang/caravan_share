# Caravan 프로젝트

## 소개

이것은 caravan을 관리하기 위한 웹 애플리케이션입니다. HTML, CSS, JavaScript로 구축된 프론트엔드와 FastAPI로 구축된 백엔드를 포함합니다.

## 기능

- caravan 생성, 읽기, 업데이트 및 삭제.
- 사용자 인증.
- caravan을 관리하기 위한 대화형 프론트엔드.

## 사용된 기술

### 백엔드

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Uvicorn

### 프론트엔드

- HTML
- CSS
- JavaScript

## 설정

### 백엔드

1.  `backend` 디렉토리로 이동합니다:
    ```bash
    cd backend
    ```
2.  필요한 종속성을 설치합니다:
    ```bash
    pip install -r requirements.txt
    ```

### 프론트엔드

프론트엔드에 대한 특별한 설정 단계는 없습니다. 브라우저에서 `index.html` 파일을 열기만 하면 됩니다.

## 사용법

1.  `backend` 디렉토리에서 백엔드 서버를 시작합니다:
    ```bash
    uvicorn main:app --reload
    ```
2.  웹 브라우저에서 `frontend/index.html` 파일을 엽니다.

## API 엔드포인트

다음 API 엔드포인트를 사용할 수 있습니다:

- `GET /api/caravans/`: 모든 caravan 목록을 가져옵니다.
- `GET /api/caravans/{caravan_id}`: ID로 특정 caravan을 가져옵니다.
- `POST /api/caravans/`: 새 caravan을 생성합니다.
- `PUT /api/caravans/{caravan_id}`: caravan을 업데이트합니다.
- `DELETE /api/caravans/{caravan_id}`: caravan을 삭제합니다.

## 데이터베이스 스키마

데이터베이스 스키마는 `backend/app/models/caravan.py`에 정의되어 있습니다. `caravans`라는 단일 테이블로 구성되며 다음 열을 포함합니다:

- `id`: 정수, 기본 키
- `name`: 문자열
- `description`: 문자열
- `price`: 정수
- `year`: 정수
- `is_available`: 불리언

## 폴더 구조

```
/
├───README.md
├───backend/
│   ├───caravan.db
│   ├───main.py
│   ├───requirements.txt
│   └───app/
│       ├───core/
│       ├───crud/
│       ├───db/
│       ├───models/
│       ├───routers/
│       └───schemas/
└───frontend/
    ├───app.js
    ├───index.html
    └───style.css
```

## 기여

풀 리퀘스트를 환영합니다. 주요 변경 사항에 대해서는 먼저 이슈를 열어 변경하고자 하는 내용에 대해 논의해 주시기 바랍니다.

## 라이선스

[MIT](https://choosealicense.com/licenses/mit/)
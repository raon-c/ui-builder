# 현재 진행 중인 작업

## 🎯 Current Sprint
**Sprint 4**: 속성 편집 & 화면 관리 (Week 7-8)

## 🏃 Active Tasks

### 🎯 현재 진행 중
- [ ] **화면 관리 기능 구현** (복잡도 5)
  - 화면 추가/삭제/이름 변경 UI
  - 화면 순서 변경 (드래그 앤 드롭)
  - 화면 간 네비게이션 개선
  - 화면 복사 기능

### 🔨 Next Up
- [ ] **프로젝트 Import/Export 기능** (복잡도 4)
  - JSON 내보내기 기능
  - JSON 가져오기 및 스키마 검증
  - 버전 호환성 관리
  - 내보내기/가져오기 UI

## 🚧 Blockers
- 없음

## 📝 Notes
- AIDEV-NOTE 주석 규칙 준수
- 커밋은 기능 단위로 작게
- 300 LOC 이상 변경 시 확인 요청
- **"use client" 지시자 필수** - 모든 React 컴포넌트와 클라이언트 로직

## 🔗 References
- [Sprint 4 상세 작업](../sprint-4/README.md)
- [MVP 로드맵](../MVP_ROADMAP.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md#5-빌더-데이터-구조)

---

## 📊 Progress

### Sprint 4 Status
- **Story Points**: 6/15 completed (40%)
- **User Stories**: 1/3 completed (33.3%)
- **Current Sprint**: 🟡 SPRINT 4 IN PROGRESS

### Sprint 3 Status ✅
- **Story Points**: 26/30 completed (86.7% ✅ NEARLY COMPLETED!)
- **User Stories**: 3/3 completed (100%)

### Sprint 2 Status ✅
- **Story Points**: 32/32 completed (100% ✅ COMPLETED!)
- **User Stories**: 3/3 completed (100%)

### Sprint 1 Status ✅
- **Story Points**: 26/26 completed (100% ✅ COMPLETED!)
- **User Stories**: 4/4 completed (100%)

### Completed Tasks (Sprint 4)
- [x] **Zod 스키마 기반 동적 속성 편집기 고도화** (복잡도 6) - 속성 그룹화, 실시간 검증, 에러 표시, 변경사항 추적, 되돌리기/재설정 기능, 향상된 UX 구현

### Completed Tasks (Sprint 3)
- [x] **빌더 레이아웃 구현** (복잡도 5) - 4-패널 레이아웃, react-resizable-panels, 프로젝트 라우팅, 컴포넌트 팔레트, 구조 트리 기본 구현
- [x] **드래그 앤 드롭 기능 구현** (복잡도 6) - @dnd-kit 통합, 팔레트→캔버스 드래그, 캔버스 내 재배치, 시각적 피드백, 빌더 스토어 상태 관리
- [x] **속성 편집기 구현** (복잡도 8) - 동적 폼 생성, 실시간 속성 편집, Structure/Property 탭 전환, 컴포넌트별 속성 정의, 자동 탭 전환
- [x] **실시간 미리보기 구현** (복잡도 7) - 전체 화면 미리보기 모달, 반응형 디바이스 시뮬레이션, 편집 UI 제거된 순수 렌더링, 데스크톱/태블릿/모바일 뷰

### Completed Tasks (Sprint 2)
- [x] **shadcn/ui 기본 컴포넌트 설치** (복잡도 2) - Input, Card, Select, Checkbox, Switch, Badge, Avatar 설치 및 테스트 (96cf61f)
- [x] **shadcn/ui 어댑터 스키마 확장** (복잡도 3) - 7개 컴포넌트 Zod 스키마, 필드 메타데이터, 컴포넌트 래퍼 구현 (8c80cf8)
- [x] **컴포넌트 카탈로그 UI** (복잡도 4) - 검색, 필터링, 그리드/리스트 뷰, 실시간 미리보기, 반응형 디자인 구현 (b83bcbd)
- [x] **ComponentRegistry 확장** (복잡도 3) - 이벤트 시스템, 벌크 작업, 컴포넌트 검증, 의존성 관리, 성능 최적화 기능 구현

### Completed Tasks (Sprint 1)
- [x] **필수 패키지 설치** (30분) - Zustand, @dnd-kit, Zod, Lucide React 등 핵심 패키지 설치
- [x] **TypeScript 설정** (20분) - strict 모드 및 path alias 확인 완료
- [x] **디렉터리 구조 생성** (10분) - 컴포넌트, 어댑터, 스토어 등 폴더 구조 생성
- [x] **shadcn/ui 초기화** (30분) - UI 라이브러리 설정, components.json 및 utils.ts 생성
- [x] **Project 관련 타입 정의** (복잡도 3) - `Project`, `Screen`, `CanvasNode`, `ProjectSettings` 타입 및 Zod 스키마 정의 (70634a4)
- [x] **유틸리티 함수** (30분) - `/src/lib/nanoid.ts` ID 생성 유틸리티 완료 (70634a4)
- [x] **Component 시스템 타입** (복잡도 2) - `ComponentMetadata`, `ComponentRegistry`, `StyleVariant` 어댑터 패턴 타입 완료 (bb595fb)
- [x] **Screen & Canvas 타입 정의** (복잡도 3) - `Screen`, `CanvasNode` 타입이 project.ts에서 완료됨
- [x] **Button 컴포넌트 테스트** (30분) - shadcn/ui Button 설치 및 동작 확인 (795c11c)
- [x] **shadcn 어댑터 패턴 구현** (복잡도 4) - ComponentRegistry, ShadcnAdapter 클래스, 스키마 정의 (df6357c)
- [x] **"use client" 지시자 적용** - static export 호환성 확보 (076e7ef)
- [x] **스토리지 추상화 구현** (복잡도 5) - StorageAdapter, LocalStorageAdapter, ProjectStorageImpl, 에러 처리 및 백업 기능 (b4ca067)
- [x] **프로젝트 대시보드 UI** (복잡도 8) - Zustand 스토어, 프로젝트 카드, 생성/삭제 모달, 반응형 디자인 완료 (bba9ff1)
- [x] **프로젝트 생성 에러 수정** - ID 생성 로직 수정으로 "Failed to save project new" 에러 해결 (16b8a44) 
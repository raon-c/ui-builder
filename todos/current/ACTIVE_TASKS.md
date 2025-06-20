# 현재 진행 중인 작업

## 🎯 Current Sprint
**Sprint 2**: 어댑터 패턴 & 컴포넌트 시스템 (Week 3-4)

## 🏃 Active Tasks

### 🎯 현재 진행 중
- [ ] **shadcn/ui 어댑터 스키마 확장** (복잡도 3)
  - 새로 설치한 컴포넌트들의 Zod 스키마 정의
  - Input, Card, Select, Checkbox, Switch, Badge, Avatar 스키마 추가
  - 각 컴포넌트의 props와 variants 매핑
  - shadcn/components.ts 및 schema.ts 업데이트

### 🔨 Next Up
- [ ] **컴포넌트 카탈로그 UI** (복잡도 4)
- [ ] **ComponentRegistry 확장** (복잡도 3)

## 🚧 Blockers
- 없음

## 📝 Notes
- AIDEV-NOTE 주석 규칙 준수
- 커밋은 기능 단위로 작게
- 300 LOC 이상 변경 시 확인 요청
- **"use client" 지시자 필수** - 모든 React 컴포넌트와 클라이언트 로직

## 🔗 References
- [Sprint 2 상세 작업](../sprint-2/README.md)
- [MVP 로드맵](../MVP_ROADMAP.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md#5-빌더-데이터-구조)

---

## 📊 Progress

### Sprint 2 Status
- **Story Points**: 2/32 completed (6.3%)
- **User Stories**: 0/3 completed (0%)
- **Current Sprint**: 🟡 SPRINT 2 IN PROGRESS

### Sprint 1 - Completed ✅
- **Story Points**: 26/26 completed (100% ✅ COMPLETED!)
- **User Stories**: 4/4 completed (100%)

### Completed Tasks (Sprint 2)
- [x] **shadcn/ui 기본 컴포넌트 설치** (복잡도 2) - Input, Card, Select, Checkbox, Switch, Badge, Avatar 설치 및 테스트 (96cf61f)

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
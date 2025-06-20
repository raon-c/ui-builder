# 현재 진행 중인 작업

## 🎯 Current Sprint
**Sprint 1**: 기초 설정 및 프로젝트 관리 (Week 1-2)

## 🏃 Active Tasks
- [x] **Project 관련 타입 정의** (복잡도 3)
  - `Project`, `ProjectSettings`, `PublishingInfo`

### 🔨 Next Up
- [ ] **기본 타입 정의** (복잡도 7)
  - [ ] **Screen & Canvas 타입 정의** (복잡도 3)
    - `Screen`, `Canvas`, `Viewport`, `ElementNode`
  - [ ] **Component 시스템 타입** (복잡도 2)
    - `ComponentMetadata`, `ComponentProps`, `StyleVariant`
  
- [ ] **유틸리티 함수** (30분)
  - `/src/lib/utils.ts` - cn 함수
  - `/src/lib/nanoid.ts` - ID 생성
  
- [ ] **Button 컴포넌트 테스트** (30분)
  ```bash
  pnpm dlx shadcn@latest add button
  ```
  - 메인 페이지에 추가하여 작동 확인

## 🚧 Blockers
- 없음

## 📝 Notes
- AIDEV-NOTE 주석 규칙 준수
- 커밋은 기능 단위로 작게
- 300 LOC 이상 변경 시 확인 요청

## 🔗 References
- [Sprint 1 상세 작업](../sprint-1/README.md)
- [MVP 로드맵](../MVP_ROADMAP.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md#5-빌더-데이터-구조)

---

## 📊 Progress

### Sprint 1 Status
- **Story Points**: 4/26 completed (15.4%)
- **User Stories**: 1/4 completed (25%)
- **Current Story**: 1️⃣ 개발 환경 설정 (8 points) - ✅ COMPLETED

### Completed Tasks
- [x] **필수 패키지 설치** (30분) - Zustand, @dnd-kit, Zod, Lucide React 등 핵심 패키지 설치
- [x] **TypeScript 설정** (20분) - strict 모드 및 path alias 확인 완료
- [x] **디렉터리 구조 생성** (10분) - 컴포넌트, 어댑터, 스토어 등 폴더 구조 생성
- [x] **shadcn/ui 초기화** (30분) - UI 라이브러리 설정, components.json 및 utils.ts 생성 
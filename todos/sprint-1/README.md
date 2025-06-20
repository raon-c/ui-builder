# Sprint 1: 기초 설정 및 프로젝트 관리

**기간**: Week 1-2 (2025.01.XX - 2025.01.XX)  
**상태**: 🟡 진행중  
**Sprint Goal**: 프로젝트 인프라를 구축하고 기본적인 프로젝트 관리 기능을 구현한다.

## Sprint Planning

### Capacity
- 개발 가능 시간: 80시간 (2주 × 40시간)
- Story Points: 26

### Team
- 개발자: 1명
- 리뷰어: TBD

---

## User Stories

### 1️⃣ 개발 환경 설정 (8 points)
**As a** 개발자  
**I want** 프로젝트 개발 환경을 설정  
**So that** 일관된 개발 환경에서 작업할 수 있다

#### Tasks
- [ ] 필수 패키지 설치
  ```bash
  pnpm add zustand immer @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities zod lucide-react nanoid clsx tailwind-merge
  ```
- [ ] TypeScript strict 모드 설정
- [ ] Path alias 설정 (@/*)
- [ ] Biome 린터 설정
- [ ] 디렉터리 구조 생성
- [ ] shadcn/ui 초기화 및 기본 컴포넌트 설치

#### Acceptance Criteria
- `pnpm typecheck` 에러 없음
- `pnpm lint` 에러 없음
- shadcn/ui Button 컴포넌트 테스트 렌더링 성공

---

### 2️⃣ 타입 시스템 정의 (5 points)
**As a** 개발자  
**I want** 프로젝트 전체에서 사용할 타입 시스템을 정의  
**So that** 타입 안정성을 보장할 수 있다

#### Tasks
- [ ] `/src/types/project.ts`
  - [ ] Project, Screen, CanvasNode 인터페이스
  - [ ] NodeStyle, NodeMeta 타입
  - [ ] Collaborator, ProjectSettings 인터페이스
- [ ] `/src/types/component.ts`
  - [ ] ComponentType, ComponentCategory enum
  - [ ] ComponentMetadata 인터페이스
- [ ] `/src/types/storage.ts`
  - [ ] StorageAdapter 인터페이스
  - [ ] StorageError 클래스

#### Acceptance Criteria
- 모든 타입이 strict 모드에서 컴파일
- JSDoc 주석으로 각 타입 설명 포함

---

### 3️⃣ 스토리지 추상화 구현 (5 points)
**As a** 시스템  
**I want** 스토리지를 추상화  
**So that** 향후 다른 스토리지로 쉽게 전환할 수 있다

#### Tasks
- [ ] `/src/lib/storage/adapter.ts` - StorageAdapter 인터페이스
- [ ] `/src/lib/storage/localStorage.ts` - LocalStorageAdapter 구현
- [ ] `/src/lib/storage/projectStorage.ts` - 프로젝트 CRUD
- [ ] 에러 처리 (quota exceeded, JSON parse error)
- [ ] 유닛 테스트 작성

#### Acceptance Criteria
- 프로젝트 저장/불러오기 작동
- 5MB 이상 데이터 저장 시 에러 처리
- 잘못된 JSON 데이터 처리

---

### 4️⃣ 프로젝트 대시보드 UI (8 points)
**As a** 기획자  
**I want** 내 프로젝트들을 한눈에 볼 수 있는 대시보드  
**So that** 프로젝트를 쉽게 관리할 수 있다

#### Tasks
- [ ] `/app/projects/page.tsx` - 프로젝트 목록 페이지
- [ ] 프로젝트 카드 컴포넌트
  - [ ] 프로젝트 이름, 수정일 표시
  - [ ] 호버 효과 및 클릭 이벤트
- [ ] 프로젝트 생성 모달
  - [ ] 이름 입력 폼
  - [ ] 유효성 검사
- [ ] 프로젝트 삭제 확인 다이얼로그
- [ ] 빈 상태 UI (프로젝트가 없을 때)
- [ ] Zustand 스토어 구현

#### Acceptance Criteria
- 프로젝트 CRUD 모든 기능 작동
- 반응형 디자인 (모바일/데스크톱)
- 로딩 및 에러 상태 처리

---

## Progress Tracking

### 📋 작업 진행 상황
현재 활성 작업은 `current/ACTIVE_TASKS.md`에서 관리합니다.

### 🚧 Known Issues
- 

### ✅ Completed Items
- 

---

## Sprint Review Checklist

### Demo Items
- [ ] 프로젝트 생성 및 목록 표시
- [ ] 프로젝트 삭제
- [ ] localStorage 저장 확인
- [ ] TypeScript 타입 체크

### Metrics
- [ ] 완료된 Story Points: X/26
- [ ] 테스트 커버리지: X%
- [ ] 기술 부채: 

### Feedback
- 

---

## Sprint Retrospective

### What went well?
- 

### What didn't go well?
- 

### Action items
- 
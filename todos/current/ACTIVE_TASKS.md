# 현재 진행 중인 작업

## 🎯 Current Sprint
**Sprint 1**: 기초 설정 및 프로젝트 관리 (Week 1-2)

## 🏃 Active Tasks
- [ ] **필수 패키지 설치** (30분)
  ```bash
  pnpm add zustand immer @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities zod lucide-react nanoid clsx tailwind-merge
  ```
- [ ] **TypeScript 설정** (20분)
  - tsconfig.json strict 모드 활성화
  - Path alias 설정
- [ ] **디렉터리 구조 생성** (10분)
  ```bash
  mkdir -p src/components/shadcn src/components/ui src/features/builder src/features/projects src/adapters/shadcn src/store src/lib src/types src/hooks
  ```
  - [ ] **shadcn/ui 초기화** (30분)
  ```bash
  pnpm dlx shadcn@latest init
  ```

### 🔨 Next Up
- [ ] **기본 타입 정의** (2시간)
  - `/src/types/project.ts` 작성
  - ARCHITECTURE.md 5.2절 참고
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
- **Story Points**: 0/26 completed
- **User Stories**: 0/4 completed
- **Current Story**: 1️⃣ 개발 환경 설정 (8 points)

### Completed Tasks
_작업 완료 시 여기로 이동_ 
# AGENTS.md – ui-builder 프로젝트 핸드북
*Last updated 2025-06-20*

> **문서 목적** – 본 파일은 모든 AI 어시스턴트(Claude, Cursor, GPT 등)와 인간 개발자를 위한 온보딩 매뉴얼입니다.  
> 프로젝트의 코딩 규칙, 가드레일, 워크플로우 노하우를 정의하여 **아키텍처·테스트·도메인 판단**과 같은 *휴먼 30 %* 영역을 보호합니다.
> 
> **작업 관리** – 모든 작업은 `todos/` 디렉터리의 Sprint 기반 작업 목록을 따릅니다. AI는 반드시 `todos/current/ACTIVE_TASKS.md`에서 작업을 1개씩 선택하여 진행해야 합니다.

---

## 0. 프로젝트 개요

**ui-builder** 저장소는 제품 기획자가 실제 디자인-라이브러리 컴포넌트를 조립해 실물에 가까운 화면 기획서를 작성할 수 있는 **MVP 노코드 빌더**를 제공합니다.

* **Tech Stack**: Next.js 15 (static export), React 19, TypeScript 5, Zustand 5, Tailwind CSS 4, dnd-kit, Zod, shadcn/ui (default DS)
* **Architecture**: 순수 프론트엔드. `StorageAdapter` 뒤에 `localStorage`로 데이터 영속화  
  어댑터 패턴으로 빌더 코어를 디자인 라이브러리(`shadcn`, `mui` 등)로부터 분리
* **Docs**: 상위 아키텍처는 `ARCHITECTURE.md`, 제품 요구사항은 `PRD.md` 참조

> **Golden Rule** – 구현 세부나 요구사항이 불분명할 경우, **추측하지 말고 반드시 개발자에게 확인**합니다.

---

## 1. 반드시 지켜야 할 골든 규칙

| # | AI가 **해도 되는 것** | AI가 **절대 하면 안 되는 것** |
|---|----------------------|--------------------------------|
| G-0 | 프로젝트 관련 내용이 불명확하면 질문하기 | ❌ 요구사항이 모호한 상태로 코드 작성 또는 커밋 |
| G-1 | `src/`, `src/adapters/`, `src/store/` 등 **관련 디렉터리 안에서만** 코드 생성 | ❌ 영역밖의 코드 및 파일 수정 |
| G-2 | 복잡한 로직 근처에 **`AIDEV-NOTE:`** 주석 추가·업데이트 | ❌ 기존 `AIDEV-*` 주석 삭제·훼손 |
| G-3 | `biome.json`, `tailwind.config.ts` 등 린트/스타일 규칙 준수 (`pnpm lint` 사용) | ❌ 설정과 다른 스타일로 무단 포매팅 |
| G-4 | 300 LOC↑ 또는 3파일↑ 변경 시 **사전 확인 요청** | ❌ 대규모 리팩터를 독단적으로 추진 |
| G-5 | 현재 태스크 범위 내에서 작업. 필요 시 새 세션 제안 | ❌ "New task" 이후 이전 컨텍스트 끌고 가기 |
| G-6 | `todos/current/ACTIVE_TASKS.md`에서 **작업 1개씩만** 진행 | ❌ 여러 작업을 동시에 진행하거나 작업 목록 무시 |

---

## 2. 빌드·테스트·유틸리티 명령

모든 스크립트는 **pnpm** 으로 실행해 락파일 일관성을 유지합니다.

```bash
# 로컬 개발
pnpm dev                # Next.js dev server (http://localhost:3000)

# Lint & Format (biome)
pnpm lint               # biome check + format

# 타입 체크
pnpm typecheck          # tsc --noEmit

# 단위 / 컴포넌트 테스트
pnpm test               # vitest run --coverage

# Build  (CI)
pnpm build  # out/ 디렉터리에 정적 파일 출력

```

CI 파이프라인: `pnpm lint` → `pnpm test` → `pnpm build` → GitHub Pages 배포(`actions/deploy-pages`).

---

## 3. 코딩 표준 (Coding Standards)

* **Language**: TypeScript *strict mode* (`"strict": true`)
* **Framework**: React 19 + Hooks (함수형 컴포넌트)
* **Static Export**: Next.js static export 모드 - **모든 React 컴포넌트와 클라이언트 사이드 로직에 `"use client"` 지시자 필수**
* **Styling**: Tailwind 유틸리티 클래스 (프로토타입 제외한 인라인 스타일 금지)
* **State**: Zustand
* **Schema Validation**: Zod (런타임·컴파일타임 동시 보장)
* **Naming**: `PascalCase`(컴포넌트), `camelCase`(변수·함수), `SCREAMING_SNAKE`(상수)
* **File Organization**: 기능 폴더 내부에 컴포넌트·스타일·테스트를 **co-locate**
* **Error Handling**: Fail-fast – 명시적 오류 throw 후 `ErrorBoundary`로 표면화

### 3.1. "use client" 지시자 규칙

Next.js static export 모드 호환성을 위해 다음 파일들에는 **반드시** `"use client"` 지시자를 파일 최상단에 추가해야 합니다:

* **React 컴포넌트**: `.tsx` 파일의 모든 컴포넌트
* **클라이언트 로직**: 브라우저 API 사용하는 모든 `.ts/.tsx` 파일
* **어댑터 파일**: `src/adapters/` 하위의 모든 파일 (React 컴포넌트 참조)
* **Zustand 스토어**: 클라이언트 상태 관리 파일
* **이벤트 핸들러**: `onClick`, `onChange` 등 사용하는 파일

```typescript
"use client";

import React from "react";
// ... 나머지 imports

export function MyComponent() {
  // 컴포넌트 구현
}
```

**예외 사항**:
- 순수 타입 정의 파일 (`src/types/`)
- 유틸리티 함수만 있는 파일 (단, 브라우저 API 미사용)
- `layout.tsx` (metadata 포함으로 서버 컴포넌트 유지)

---

## 4. 디렉터리 구조 & 핵심 컴포넌트

| Directory | 설명 |
|-----------|-------|
| `src/app/` | Next.js App Router 엔트리포인트 및 페이지 |
| `src/components/` | **실제 디자인-라이브러리 컴포넌트** (`shadcn/`, 필요 시 `company-ds/`) |
| `src/adapters/` | 빌더 추상 타입 → 실제 컴포넌트·Zod 스키마 매핑 계층 |
| `src/features/` | 도메인 로직 (`builder/`, `projects/` 등) |
| `src/store/` | Zustand 스토어 |
| `src/lib/` | 전역 유틸리티 (`storage.ts` 등) |
| `src/types/` | 글로벌 TypeScript 타입 |
| `out/` | GitHub Pages용 정적 결과물 (CI 자동 생성) |
| `todos/` | **Sprint 기반 작업 관리** (current/ACTIVE_TASKS.md 필수 확인) |

**주요 도메인 모델**: `Project`, `Screen`, `CanvasNode`, `StorageAdapter` (상세는 `ARCHITECTURE.md §5` 참조).

---

## 5. 앵커 주석 (Anchor Comments)

AI 후임이 맥락을 쉽게 찾도록 `AIDEV-*` 주석을 사용합니다.

```typescript
// AIDEV-NOTE: perf-critical; props 증가 시 memoization 고려
export const Canvas = memo(function Canvas(props: CanvasProps) { ... })
```

* **Prefix**: `AIDEV-NOTE:`, `AIDEV-TODO:`, `AIDEV-QUESTION:`
* 120자 이하로 간결히
* 승인 없이 기존 앵커 삭제 금지
* 주변 로직 변경 시 주석도 업데이트

---

## 6. 커밋 규율 (Commit Discipline)

* **작은 단위 커밋**: 한 가지 논리 변경만 포함
* **AI 커밋 태깅**: 예) `feat: add badge component [AI]`
* **메시지**: *왜* 변경했는지 설명, PRD/Architecture 섹션 링크
* **커밋 내역 문서화**: 작업 내역 옆에 커밋 로그 작성
* **언어**: 커밋 메시지들은 한글로 작성합니다.

```markdown
- [x] **MUI 어댑터 스키마구현** ( {commit-hash} )
```

---

## 7. 버전 관리 규칙 (Versioning)

* **문서**: 제품 버전은 `PRD.md` (`v1.x`)
* **코드**: `package.json` SemVer(`MAJOR.MINOR.PATCH`)
* **아키텍처**: 구조 변경은 `ARCHITECTURE.md` Revision History에 기록

---

## 8. 브라우저 & 디바이스 지원

Chrome, Edge, Firefox, Safari **최신 2버전**(데스크탑) 지원  
IE 미지원, 모바일 대응 빌더는 MVP 범위 외

---

## 9. **수정 금지** 파일/디렉터리

* `.agentignore`, `.agentindexignore` – AI 인덱싱 범위 제어
* `out/` – CI가 생성하는 정적 파일
* `package-lock.json`, `pnpm-lock.yaml` – 의존성 업데이트 시 인간이 재생성
* `public/` 하위 이미지·미디어 자산
* `todos/` – 작업 목록 구조 변경 금지 (단, 체크박스 업데이트는 허용)

---

## 10. AI 어시스턴트 작업 절차

> 이하 절차는 **AI 어시스턴트·인간 개발자 공통**으로 따르는 *최소 단계 체크리스트*입니다.

1. **작업 선택**
   - `todos/current/ACTIVE_TASKS.md`에서 **단일 작업**을 선택하고 선언한다.

2. **작업 분석·계획**
   - 요구사항이 모호하면 즉시 질문한다.
   - 복잡도 4 이상이면 작업을 분해하고 `ACTIVE_TASKS.md`에 서브태스크를 추가한다.

3. **집중 실행**
   - 선택한 작업 범위 내에서만 코드를 수정한다.
   - 관련 문서(AGENTS / ARCHITECTURE / PRD)를 준수한다.

4. **품질 검증**
   - `pnpm lint && pnpm typecheck && pnpm test`가 **모두 통과**해야 한다.

5. **작업 완료 & 커밋**
   - `ACTIVE_TASKS.md`의 체크박스를 ✅ 로 변경한다.
   - **즉시 단일 커밋**을 만든다.
     - 메시지 형식: `feat|fix|chore: summary [AI]`
     - 메시지 본문: *변경 이유*와 **관련 문서 섹션 링크**를 포함한다.

6. **진행 보고**
   - 완료 보고 템플릿(§6 커밋 규율 예시)을 기반으로 커밋 후 커밋 해시를 작성한다.
   - 다음 추천 작업 1~2개를 제안한다.

7. **예외·블로커 처리**
   - 문제 발생 시 즉시 보고하고 대안을 제시한다.

---

## 11. 작업 분해 예시 (Task Decomposition Examples)

### 예시 1: "프로젝트 대시보드 UI 구현" (복잡도 8)
```markdown
## 원본 작업
- [ ] **프로젝트 대시보드 UI** (복잡도 8)

## 분해된 세부 작업
- [ ] **프로젝트 대시보드 UI** (복잡도 8)
  - [x] **라우트 설정** (복잡도 1)
    - `/app/projects/page.tsx` 생성
    - 레이아웃 컴포넌트 설정
  - [ ] **프로젝트 카드 컴포넌트** (복잡도 3)
    - [ ] `ProjectCard.tsx` 컴포넌트 생성
    - [ ] 호버 효과 및 스타일링
    - [ ] 타입 정의 및 props 인터페이스
  - [ ] **프로젝트 목록 컨테이너** (복잡도 2)
    - [ ] 그리드 레이아웃 구현
    - [ ] 빈 상태 UI
    - [ ] 로딩 스켈레톤
  - [ ] **생성/삭제 모달** (복잡도 3)
    - [ ] `CreateProjectModal.tsx`
    - [ ] `DeleteConfirmDialog.tsx`
    - [ ] 폼 유효성 검사
  - [ ] **Zustand 통합** (복잡도 2)
    - [ ] 프로젝트 스토어 연결
    - [ ] 액션 핸들러 구현
```

### 작업 분해 원칙
1. **복잡도 4 이상 규칙**: 복잡도 4 이상으로 평가된 작업은 분해 검토
2. **독립성**: 각 서브태스크는 독립적으로 완료 가능해야 함
3. **검증 가능**: 각 서브태스크는 명확한 완료 기준 필요
4. **의존성 명시**: 서브태스크 간 의존성 명확히 표시

---

끝
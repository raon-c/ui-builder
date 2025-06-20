# AGENTS.md – ui-builder 프로젝트 핸드북
*Last updated 2025-06-22*

> **문서 목적** – 본 파일은 모든 AI 어시스턴트(Claude, Cursor, GPT 등)와 인간 개발자를 위한 온보딩 매뉴얼입니다.  
> 프로젝트의 코딩 규칙, 가드레일, 워크플로우 노하우를 정의하여 **아키텍처·테스트·도메인 판단**과 같은 *휴먼 30 %* 영역을 보호합니다.

---

## 0. 프로젝트 개요

**ui-builder** 저장소는 제품 기획자가 실제 디자인-라이브러리 컴포넌트를 조립해 실물에 가까운 화면 기획서를 작성할 수 있는 **MVP 노코드 빌더**를 제공합니다.

* **Tech Stack**: Next.js 15 (static export), React 18, TypeScript 5, Zustand 5, Tailwind CSS 4, dnd-kit, Zod, shadcn/ui (default DS)
* **Architecture**: 순수 프론트엔드. `StorageAdapter` 뒤에 `localStorage`로 데이터 영속화  
  어댑터 패턴으로 빌더 코어를 디자인 라이브러리(`shadcn`, `mui` 등)로부터 분리
* **Docs**: 상위 아키텍처는 `ARCHITECTURE.md`, 제품 요구사항은 `PRD.md` 참조

> **Golden Rule** – 구현 세부나 요구사항이 불분명할 경우, **추측하지 말고 반드시 개발자에게 확인**합니다.

---

## 1. 반드시 지켜야 할 골든 규칙

| # | AI가 **해도 되는 것** | AI가 **절대 하면 안 되는 것** |
|---|----------------------|--------------------------------|
| G-0 | 프로젝트 관련 내용이 불명확하면 질문하기 | ❌ 요구사항이 모호한 상태로 코드 작성 또는 커밋 |
| G-1 | `src/`, `adapters/`, `store/` 등 **관련 디렉터리 안에서만** 코드 생성 | ❌ `tests/`, `cypress/`, `*.spec.ts(x)` 파일 수정·생성 (테스트는 사람이 담당) |
| G-2 | 복잡한 로직 근처에 **`AIDEV-NOTE:`** 주석 추가·업데이트 | ❌ 기존 `AIDEV-*` 주석 삭제·훼손 |
| G-3 | `biome.json`, `tailwind.config.ts` 등 린트/스타일 규칙 준수 (`pnpm lint` 사용) | ❌ 설정과 다른 스타일로 무단 포매팅 |
| G-4 | 300 LOC↑ 또는 3파일↑ 변경 시 **사전 확인 요청** | ❌ 대규모 리팩터를 독단적으로 추진 |
| G-5 | 현재 태스크 범위 내에서 작업. 필요 시 새 세션 제안 | ❌ "New task" 이후 이전 컨텍스트 끌고 가기 |

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

# Storybook (시각화 문서)
pnpm storybook          # http://localhost:6006/

# Build & Static export (CI)
pnpm build && pnpm export  # out/ 디렉터리에 정적 파일 출력
```

CI 파이프라인: `pnpm lint` → `pnpm test` → `pnpm build && pnpm export` → GitHub Pages 배포(`actions/deploy-pages`).

---

## 3. 코딩 표준 (Coding Standards)

* **Language**: TypeScript *strict mode* (`"strict": true`)
* **Framework**: React 18 + Hooks (함수형 컴포넌트)
* **Styling**: Tailwind 유틸리티 클래스 (프로토타입 제외한 인라인 스타일 금지)
* **State**: Zustand + 불변 업데이트(`immer` 미들웨어 권장)
* **Schema Validation**: Zod (런타임·컴파일타임 동시 보장)
* **Naming**: `PascalCase`(컴포넌트), `camelCase`(변수·함수), `SCREAMING_SNAKE`(상수)
* **File Organization**: 기능 폴더 내부에 컴포넌트·스타일·테스트를 **co-locate**
* **Error Handling**: Fail-fast – 명시적 오류 throw 후 `ErrorBoundary`로 표면화
* **Docs**: 공용 함수·컴포넌트 JSDoc/TSDoc 작성

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
| `stories/` | Storybook 스토리 (시각 회귀) |
| `docs/` | GitHub Pages용 정적 결과물 (CI 자동 생성) |

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
* **Branches**: 장기 AI 작업은 `git worktree` 활용 (`wip-widget-refactor` 등)
* **Review**: AI 코드 머지 전 반드시 인간 리뷰 필요

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
* `docs/` – CI가 생성하는 정적 파일
* `package-lock.json`, `pnpm-lock.yaml` – 의존성 업데이트 시 인간이 재생성
* `public/` 하위 이미지·미디어 자산

---

## 10. AI 어시스턴트 작업 절차

1. `ARCHITECTURE.md`, `PRD.md`, 본 `AGENTS.md`에서 **관련 가이드 확인**
2. 필요한 경우 **불명확한 점을 질문**
3. **작업 분해 & 계획** 수립 (프로젝트 규칙 반영)
4. **단순 작업** → 즉시 실행
5. **복잡 작업** → 계획 제시 후 피드백 반영
6. 진행 상황 체크리스트 또는 임시 `TODO.md`로 **트래킹** (완료 후 삭제)
7. **막히면 재계획**(3단계로 돌아가기)
8. 코드 수정 시 **문서·앵커 주석 업데이트**
9. **작업 완료 후 리뷰 요청**
10. 이후 요청이 무관할 경우 **새 세션** 제안

---

즐거운 빌딩 되세요! 🚀 
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
* **Styling**: Tailwind 유틸리티 클래스 (프로토타입 제외한 인라인 스타일 금지)
* **State**: Zustand
* **Schema Validation**: Zod (런타임·컴파일타임 동시 보장)
* **Naming**: `PascalCase`(컴포넌트), `camelCase`(변수·함수), `SCREAMING_SNAKE`(상수)
* **File Organization**: 기능 폴더 내부에 컴포넌트·스타일·테스트를 **co-locate**
* **Error Handling**: Fail-fast – 명시적 오류 throw 후 `ErrorBoundary`로 표면화

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

### 10.1. 작업 선택 (Task Selection)
1. **`todos/current/ACTIVE_TASKS.md` 확인**
   - 현재 Sprint 목표 파악
   - Active Tasks 목록 검토
   - 완료된 작업과 남은 작업 확인

2. **작업 1개 선택**
   - 우선순위와 의존성 고려
   - 선택한 작업 명시: "다음 작업을 진행합니다: [작업명]"

### 10.2. 작업 분석 (Task Analysis)
3. **작업 복잡도 평가**
   - **단순 작업** (복잡도 1-3): 파일 1-2개 수정, 명확한 구현
   - **중간 작업** (복잡도 4-6): 파일 3-5개 수정, 일부 설계 필요
   - **복잡 작업** (복잡도 7+): 다수 파일, 아키텍처 영향, 불명확한 요구사항

4. **관련 문서 확인**
   - 작업 유형에 따른 문서 우선순위:
     - 타입/스키마: `ARCHITECTURE.md` → `types/` 파일
     - UI 컴포넌트: `PRD.md` → 어댑터 패턴 섹션
     - 스토리지: 스토리지 추상화 섹션
   - 불명확한 점 목록 작성

### 10.3. 작업 계획 (Task Planning)
5. **단순 작업 처리**
   ```
   - 즉시 실행
   - 진행 상황 간단히 보고
   ```

6. **복잡 작업 분해** ⭐ NEW
   ```markdown
   ## 작업 분해 계획
   
   **원본 작업**: [복잡한 작업명] (복잡도 8)
   
   ### 세부 작업 (Sub-tasks):
   1. [ ] **서브태스크 1** (복잡도 3)
      - 구체적인 작업 내용
      - 예상 결과물
   
   2. [ ] **서브태스크 2** (복잡도 4)
      - 구체적인 작업 내용
      - 의존성: 서브태스크 1 완료 필요
   
   3. [ ] **서브태스크 3** (복잡도 2)
      - 구체적인 작업 내용
      - 예상 결과물
   ```

7. **작업 목록 업데이트** ⭐ NEW
   - 복잡한 작업인 경우:
     - `ACTIVE_TASKS.md`에 세부 작업 추가
     - 원본 작업 아래 들여쓰기로 서브태스크 나열
     - 각 서브태스크에 복잡도 명시
     - 사용자에게 분해 계획 승인 요청

### 10.4. 작업 실행 (Task Execution)
8. **집중 실행**
   - 선택한 작업(또는 서브태스크)에만 집중
   - 범위 확대 유혹 저항
   - 발견한 추가 작업은 메모만 하고 진행하지 않음

9. **진행 상황 추적**
   - 서브태스크 완료 시마다 체크박스 업데이트
   - 예상보다 복잡해지면 추가 분해 제안
   - 블로커 발생 시 즉시 보고

### 10.5. 품질 보증 (Quality Assurance)
10. **코드 품질 체크**
    - `pnpm lint` 실행
    - TypeScript 타입 체크
    - 복잡한 로직에 `AIDEV-NOTE:` 추가
    - 관련 문서 업데이트 확인

11. **작업 완료 처리**
    - 체크박스 업데이트 (✅)
    - 커밋 해시 기록 (해당 시)
    - 완료된 작업을 Completed Tasks 섹션으로 이동

### 10.6. 다음 단계 (Next Steps)
12. **진행 상황 보고**
    ```markdown
    ## 작업 완료 보고
    
    ✅ **완료된 작업**: [작업명]
    - 수정된 파일: X개
    - 주요 변경사항: [요약]
    - 커밋: [해시] (있는 경우)
    
    📊 **Sprint 진행률**
    - Story Points: X/26 완료
    - 남은 작업: Y개
    
    🎯 **다음 추천 작업**
    1. [작업명] - 현재 작업과 연관성 높음
    2. [작업명] - 우선순위 높음
    ```

13. **세션 전환 판단**
    - 현재 컨텍스트가 다음 작업과 무관하면 새 세션 권장
    - 큰 작업 완료 후 휴식 제안
    - Sprint 전환 시점에서 전체 리뷰 제안

### 10.7. 예외 처리 (Exception Handling)
14. **문제 발생 시**
    - 블로커를 `ACTIVE_TASKS.md`에 기록
    - 대안 작업 제시
    - 필요시 다른 작업으로 전환 제안

15. **스코프 변경 필요 시**
    - 작업 범위 조정 이유 설명
    - 사용자 승인 요청
    - 승인 후 작업 목록 업데이트

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
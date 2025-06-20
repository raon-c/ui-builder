# UI Builder 작업 관리

Sprint 기반 애자일 개발 방법론으로 UI Builder 프로젝트를 관리합니다.

## 📁 디렉터리 구조

```
todos/
├── MVP_ROADMAP.md          # 전체 MVP 로드맵 (5 Sprints)
├── sprint-1/               # Sprint 1: 기초 설정 & 프로젝트 관리
│   └── README.md          # Sprint 백로그, User Stories, Tasks
├── sprint-2/               # Sprint 2: 어댑터 패턴 & 컴포넌트
├── sprint-3/               # Sprint 3: 빌더 레이아웃 & DnD
├── sprint-4/               # Sprint 4: 속성 편집 & 화면 관리
├── sprint-5/               # Sprint 5: 공유 기능 & 품질 개선
├── backlog/                # Post-MVP 기능들
│   └── ideas.md           # 향후 구현 아이디어
└── current/                # 현재 진행 작업
    └── ACTIVE_TASKS.md    # 현재 활성 작업 목록

## 🏷️ 상태 표시

- 🔴 **미시작**: 아직 시작하지 않은 작업
- 🟡 **진행중**: 현재 작업 중
- 🟢 **완료**: 완료된 작업
- ⏸️ **보류**: 일시적으로 중단된 작업
- ❌ **취소**: 범위에서 제외된 작업

## ✅ 체크리스트 사용법

```markdown
- [ ] 미완료 작업
- [x] 완료된 작업
```

## 🏃 Sprint 운영 방식

### Sprint 주기
- **기간**: 2주 (10 영업일)
- **구성**: 
  - Sprint Planning (Day 1)
  - Daily Standup (매일)
  - Sprint Review (Day 10 오전)
  - Sprint Retrospective (Day 10 오후)

### 작업 관리
1. **Sprint 시작**: 해당 sprint 폴더의 README.md에서 User Stories 확인
2. **현재 작업**: current/ACTIVE_TASKS.md에서 활성 작업 추적
3. **진행 상황**: Task 체크박스와 Story Points 업데이트
4. **블로커**: 작업 중 발견된 이슈 기록

## 📝 문서 작성 가이드

### Sprint 폴더 (sprint-X/)
- **README.md**: Sprint 백로그, User Stories, Tasks
- **DAILY_LOG.md**: 일일 스탠드업 기록 (선택사항)
- **RETROSPECTIVE.md**: Sprint 회고 내용

### User Story 형식
```
**As a** [사용자 유형]
**I want** [원하는 기능]
**So that** [비즈니스 가치]
```

### Task 추정
- Story Points: 피보나치 수열 (1, 2, 3, 5, 8, 13)
- 시간 추정: 작업별 예상 시간 명시

## 🔄 워크플로우

1. **Sprint Planning**
   - MVP_ROADMAP.md에서 Sprint 목표 확인
   - User Stories를 Tasks로 분해
   - Story Points 할당

2. **Work Execution**
   - current/ACTIVE_TASKS.md에서 활성 작업 확인
   - 완료한 Task 체크 및 다음 작업 시작
   - 진행 상황 및 이슈 업데이트

3. **Sprint End**
   - Demo 준비
   - Metrics 수집
   - Retrospective 진행

---

> 📌 **Note**: 이 디렉터리의 파일들은 프로젝트 진행에 따라 지속적으로 업데이트됩니다. 
> 최신 상태는 항상 git을 통해 확인하세요. 
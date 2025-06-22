# ui-builder

[![CI](https://github.com/raon-c/ui-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/raon-c/ui-builder/actions/workflows/ci.yml)
[![Security](https://github.com/raon-c/ui-builder/actions/workflows/security.yml/badge.svg)](https://github.com/raon-c/ui-builder/actions/workflows/security.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.10-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> **기획자를 위한 노코드 UI 빌더** - 실제 디자인 라이브러리 컴포넌트를 조립해 실물에 가까운 화면 기획서를 작성할 수 있는 MVP 빌더

## 🚀 주요 기능

- **🎨 드래그 앤 드롭 빌더**: 직관적인 컴포넌트 배치 및 편집
- **📱 반응형 프리뷰**: 데스크톱, 태블릿, 모바일 뷰 지원
- **🔧 실시간 속성 편집**: Zod 스키마 기반 동적 속성 폼
- **📋 프로젝트 관리**: 여러 화면을 포함한 프로젝트 생성 및 관리
- **🔗 공유 기능**: 읽기 전용 링크로 기획서 공유
- **💾 로컬 저장**: 브라우저 localStorage 기반 데이터 영속화
- **🎯 어댑터 패턴**: shadcn/ui, Material-UI 등 다양한 디자인 시스템 지원

## 🛠️ 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **프레임워크** | Next.js | 15.3.4 | Static Export, App Router |
| **언어** | TypeScript | 5.8.3 | 타입 안정성 |
| **UI 라이브러리** | React | 19.1.0 | 컴포넌트 기반 UI |
| **상태 관리** | Zustand | 5.0.5 | 가벼운 상태 관리 |
| **스타일링** | Tailwind CSS | 4.1.10 | 유틸리티 퍼스트 CSS |
| **드래그 앤 드롭** | @dnd-kit | 6.3.1 | 접근성 우수한 DnD |
| **스키마 검증** | Zod | 3.25.67 | 런타임 타입 검증 |
| **디자인 시스템** | shadcn/ui | latest | 기본 컴포넌트 라이브러리 |
| **린터/포매터** | Biome | 2.0.0 | 빠른 코드 품질 도구 |
| **테스트** | Vitest | 1.5.1 | 단위 테스트 |

## 🏃‍♂️ 빠른 시작

### 전제 조건

- Node.js 20+ 
- pnpm 9+ (권장 패키지 매니저)

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/raon-c/ui-builder.git
cd ui-builder

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 📜 사용 가능한 스크립트

### 개발 및 빌드

```bash
pnpm dev          # 개발 서버 시작 (Turbopack)
pnpm build        # 프로덕션 빌드
pnpm start        # 빌드된 앱 실행
```

### 코드 품질 관리

```bash
pnpm check        # 전체 검증 (타입체크 + 린트 + 테스트)
pnpm check:fix    # 자동 수정 (린트 + 포맷)

pnpm typecheck    # TypeScript 타입 체크
pnpm lint         # Biome 린트 검사
pnpm lint:fix     # Biome 린트 자동 수정
pnpm format       # Biome 코드 포맷팅
```

### 테스트

```bash
pnpm test         # 단위 테스트 실행
pnpm test:watch   # 테스트 watch 모드
pnpm test:coverage # 커버리지 포함 테스트
```

> 💡 **커밋 전 필수**: `pnpm check` 명령으로 모든 검증을 통과해야 합니다.

## 📁 프로젝트 구조

```
ui-builder/
├── .github/workflows/    # GitHub Actions CI/CD
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── builder/     # 빌더 페이지
│   │   ├── components-catalog/ # 컴포넌트 카탈로그 페이지
│   │   ├── projects/    # 프로젝트 관리 페이지
│   │   └── viewer/      # 공유 뷰어 페이지
│   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── builder/     # 빌더 관련 컴포넌트
│   │   ├── catalog/     # 컴포넌트 카탈로그
│   │   ├── projects/    # 프로젝트 관리
│   │   └── ui/          # shadcn/ui 컴포넌트
│   ├── adapters/        # 디자인 시스템 어댑터
│   │   └── shadcn/      # shadcn/ui 어댑터
│   ├── lib/             # 유틸리티 함수
│   │   ├── storage/     # 스토리지 추상화
│   │   └── ...
│   ├── store/           # Zustand 상태 관리
│   ├── types/           # TypeScript 타입 정의
│   │   ├── component-base.ts      # 기본 컴포넌트 타입
│   │   ├── component-registry.ts  # 레지스트리 타입
│   │   ├── component-variants.ts  # 표준 변형 정의
│   │   └── ...
│   └── hooks/           # 커스텀 React 훅
├── todos/               # Sprint 기반 작업 관리
└── docs/                # 프로젝트 문서
```

## 📚 문서

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 기술 아키텍처 및 설계 원칙
- **[AGENTS.md](./AGENTS.md)** - 개발 가이드라인 및 코딩 표준
- **[PRD.md](./PRD.md)** - 제품 요구사항 명세서
- **[todos/](./todos/)** - Sprint 기반 개발 로드맵

## 🔄 CI/CD 파이프라인

프로젝트는 4개의 GitHub Actions 워크플로우를 통해 포괄적인 CI/CD를 제공합니다:

| 워크플로우 | 상태 | 용도 |
|-----------|------|------|
| **CI** | [![CI](https://github.com/raon-c/ui-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/raon-c/ui-builder/actions/workflows/ci.yml) | 린트, 타입체크, 테스트, 빌드 |
| **Security** | [![Security](https://github.com/raon-c/ui-builder/actions/workflows/security.yml/badge.svg)](https://github.com/raon-c/ui-builder/actions/workflows/security.yml) | 의존성 감사, CodeQL 분석 |
| **PR Check** | ![PR Check](https://img.shields.io/badge/PR%20Check-Active-green) | 커버리지, 변경파일 분석 |
| **Validate** | ![Validate](https://img.shields.io/badge/Validate-Active-green) | 워크플로우 검증 |

## 🏗️ 아키텍처 하이라이트

### 어댑터 패턴

UI 빌더 코어는 특정 디자인 라이브러리에 종속되지 않습니다. 어댑터 패턴을 통해 shadcn/ui, Material-UI 등 다양한 디자인 시스템을 지원합니다.

```typescript
// 빌더 코어는 추상 타입만 인식
type BuilderComponentType = 'Button' | 'Input' | 'Card';

// 어댑터가 실제 컴포넌트와 매핑
const shadcnAdapter: DesignLibraryAdapter = {
  Button: ShadcnButton,
  Input: ShadcnInput,
  // ...
};
```

### 타입 시스템 모듈화

타입 정의를 논리적 단위로 분할하여 유지보수성을 향상시켰습니다:

- `component-base.ts`: 핵심 컴포넌트 타입
- `component-registry.ts`: 레지스트리 시스템 타입
- `component-variants.ts`: PRD 표준 변형 정의

## 🤝 기여하기

1. **작업 선택**: `todos/current/ACTIVE_TASKS.md`에서 작업을 선택
2. **브랜치 생성**: `git checkout -b feature/your-feature`
3. **개발**: 코딩 표준 ([AGENTS.md](./AGENTS.md)) 준수
4. **검증**: `pnpm check` 통과 확인
5. **커밋**: 의미있는 커밋 메시지 작성
6. **PR 생성**: 상세한 설명과 함께 Pull Request 생성

### 개발 환경 설정

```bash
# 개발 의존성 확인
pnpm check

# 실시간 개발
pnpm dev

# 빌더 페이지 접근
# http://localhost:3000/builder
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙋‍♂️ 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/raon-c/ui-builder/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/raon-c/ui-builder/discussions)
- **문서**: [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENTS.md](./AGENTS.md)

---

**Made with ❤️ for Product Planners**

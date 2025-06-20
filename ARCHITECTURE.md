# 프로젝트 아키텍처 (ARCHITECTURE.md)

**문서 목적**: 이 문서는 '기획자를 위한 노코드 빌더' 프로젝트의 기술 아키텍처, 주요 결정 사항, 코드베이스 구조를 정의합니다. 모든 개발자는 이 문서를 통해 프로젝트의 기술적 방향성에 대한 공통된 이해를 갖습니다.

**MVP 범위**: MVP 단계에서는 백엔드 및 데이터베이스 없이, 프론트엔드 단독으로 동작하는 애플리케이션을 목표로 합니다. 모든 데이터는 브라우저의 `localStorage`에 저장됩니다.

---

## 1. 핵심 아키텍처 원칙 (Guiding Principles)

- **모듈성 (Modularity)**: 기능(Epic)별로 코드를 분리하여 유지보수성과 재사용성을 높입니다. '빌더 엔진', '프로젝트 관리', '공유' 등 각 도메인은 독립적으로 개발 및 테스트가 가능해야 합니다.
- **컴포넌트 기반 (Component-Driven)**: 프론트엔드는 재사용 가능한 컴포넌트의 조합으로 구성됩니다. 이는 PRD의 핵심 사상과 일치하며, 일관된 UI와 개발 효율을 보장합니다.
- **관심사의 분리 (Separation of Concerns)**: UI 빌더의 핵심 로직은 특정 디자인 라이브러리에 종속되지 않아야 합니다. 어댑터 패턴을 통해 UI 렌더링 계층을 분리하여 디자인 시스템을 유연하게 교체할 수 있도록 합니다.
- **타입 안정성 (Type Safety)**: 전체 코드베이스에 TypeScript를 적용하여 컴파일 타임에 에러를 감지하고, 코드의 안정성과 가독성을 높입니다.

---

## 2. 최상위 아키텍처 (High-Level Architecture - MVP)

MVP 단계에서는 클라이언트 측 렌더링과 로컬 저장을 사용하는 순수 프론트엔드 아키텍처를 따릅니다.

```mermaid
graph TD
    A[User (Planner)] --> B{Browser};
    subgraph B
        C[Frontend (Next.js)]
    end
    subgraph C
        D[- Builder UI & Logic]
        E[- State Management (Zustand)]
        F[- Data Persistence (localStorage)]
    end
```

---

## 3. 프론트엔드 아키텍처 (Frontend Architecture)

- **프레임워크**: Next.js (React)
- **상태 관리**: Zustand
- **Drag & Drop**: dnd-kit
- **데이터 영속성 (MVP)**: `localStorage`

### 3.1. 디자인 시스템 아키텍처: 어댑터 패턴

특정 UI 라이브러리(예: `shadcn/ui`, `Material-UI`)에 종속되지 않는 유연한 구조를 위해 **어댑터 패턴**을 도입합니다.

```mermaid
graph LR
    subgraph BuilderCore[UI 빌더 코어]
        direction LR
        A["- 캔버스 렌더링 로직"]
        B["- 속성 편집기 UI"]
        C["- 상태 관리 로직"]
    end

    subgraph Adapter[어댑터]
        direction LR
        D["- 컴포넌트 매핑"]
        E["- 속성 정의(Schema)"]
        F["- 기본 props 제공"]
    end

    subgraph DesignLibrary[디자인 라이브러리 (e.g., shadcn/ui)]
        direction LR
        G["- 실제 React 컴포넌트 (Button, Input...)"]
        H["- 스타일 (CSS)"]
    end

    BuilderCore <--> Adapter <--> DesignLibrary
```

- **UI 빌더 코어**: 빌더의 핵심 로직입니다. 'Button'이라는 추상적인 타입만 알 뿐, 그것이 어떻게 생겼는지는 관심 없습니다. 캔버스에 `Node` 데이터를 렌더링하고, 속성 편집기를 통해 Node의 `props`를 수정하는 역할만 합니다.
- **디자인 라이브러리**: `shadcn/ui`, `Material-UI` 등 실제 UI를 구성하는 React 컴포넌트들의 집합입니다.
- **어댑터**: 가장 중요한 연결고리입니다. UI 빌더와 특정 디자인 라이브러리를 연결합니다.
    - **역할 1 (컴포넌트 등록)**: 빌더가 아는 추상 타입('Button')과 실제 React 컴포넌트(`shadcn/ui`의 Button)를 매핑하는 `ComponentRegistry`를 제공합니다.
    - **역할 2 (속성 스키마 정의)**: 각 컴포넌트가 편집 가능한 속성(`props`)이 무엇인지 정의합니다. (예: 'Button'은 `variant`라는 속성을 가지며, 선택지는 'primary', 'secondary'이다). 이 스키마를 기반으로 속성 편집기가 동적으로 렌더링됩니다.

> **장점**: `Material-UI`용 어댑터를 새로 만들어 갈아 끼우기만 하면, 빌더 코어 로직 수정 없이 전체 UI의 룩앤필(Look-and-Feel)을 변경할 수 있습니다.

### 3.2. 디렉토리 구조 (Feature-based)

어댑터 패턴을 반영하여 디렉토리 구조를 다음과 같이 정의합니다.

```
/src
├── /app                 # Next.js App Router (라우팅)
├── /components          # 1. 빌더의 UI를 구성하는 전역 컴포넌트
│   └── /ui              #    - shadcn/ui 기반 컴포넌트
├── /features            # 2. 도메인/기능별 로직
│   ├── /builder         #    - 빌더 코어 로직 (캔버스, 속성편집기 등)
│   └── /projects        #    - 프로젝트 대시보드
├── /adapters            # 3. 디자인 시스템 어댑터
│   └── /shadcn          #    - shadcn/ui 어댑터
│       ├── components.ts  #      - 컴포넌트 등록 및 매핑
│       └── schema.ts      #      - 속성 편집 스키마 정의
├── /lib                 # 전역 유틸리티 함수
├── /store               # Zustand 스토어 (상태 관리)
└── /types               # 전역 타입 정의
```

---

## 4. 빌더 데이터 구조 (Builder Data Structure)

모든 프로젝트와 화면 데이터는 타입스크립트 인터페이스로 명확하게 정의하며, `localStorage`에 JSON 형태로 저장됩니다.

### 4.1. 최상위 데이터 구조

`localStorage`에는 `projects`라는 key로 아래 `Project[]` 타입의 배열이 저장됩니다.

```typescript
// /types/project.ts

/** 캔버스에 렌더링되는 최소 단위 */
export interface CanvasNode {
  id: string; // UUID
  type: string; // 어댑터에 등록된 컴포넌트 타입 (e.g., 'Button', 'Container')
  props: {
    [key: string]: any; // 컴포넌트에 전달될 props (e.g., { text: '안녕하세요' })
  };
  children: CanvasNode[]; // 자식 노드 배열
}

/** 하나의 화면(페이지) */
export interface Screen {
  id: string; // UUID
  name: string;
  order: number;
  content: CanvasNode; // 화면의 최상위 루트 노드 (항상 존재)
}

/** 하나의 기획 문서 프로젝트 */
export interface Project {
  id: string; // UUID
  name: string;
  screens: Screen[];
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}
```

### 4.2. 데이터 예시 (Example)

아래는 `localStorage`에 저장될 데이터의 예시입니다.

```json
[
  {
    "id": "proj_1",
    "name": "신규 회원가입 플로우",
    "createdAt": "2025-06-20T14:15:00Z",
    "updatedAt": "2025-06-20T14:15:00Z",
    "screens": [
      {
        "id": "scr_1",
        "name": "시작 화면",
        "order": 1,
        "content": {
          "id": "node_root_1",
          "type": "Container",
          "props": { "padding": "lg" },
          "children": [
            {
              "id": "node_child_1",
              "type": "Heading",
              "props": { "level": 1, "text": "환영합니다!" },
              "children": []
            },
            {
              "id": "node_child_2",
              "type": "Button",
              "props": { "variant": "primary", "text": "시작하기" },
              "children": []
            }
          ]
        }
      }
    ]
  }
]
```

---

## 5. 백엔드 아키텍처 (Post-MVP)

> **[안내]** MVP 단계에서는 백엔드 서버를 구축하지 않습니다.
> 아래 내용은 MVP 이후 확장성을 고려한 설계안입니다.
> (이전 버전과 동일)

---

## 6. 데이터베이스 스키마 (Post-MVP)

> **[안내]** MVP 단계에서는 데이터베이스를 사용하지 않습니다.
> 아래 내용은 향후 데이터베이스 도입 시 참고할 스키마입니다.
> (이전 버전과 동일)

---

## 7. DevOps 및 배포 (Deployment & CI/CD)

- **프론트엔드 배포**: Vercel
- **CI/CD**: GitHub Actions
(이전 버전과 동일)
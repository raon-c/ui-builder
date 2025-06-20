// AIDEV-NOTE: Component 시스템 타입 정의 - 어댑터 패턴 기반
// 빌더 코어와 디자인 라이브러리 간의 추상화 계층

import type { ComponentType } from "react";
import type { z } from "zod";

/**
 * 빌더에서 지원하는 컴포넌트 타입 목록
 * 새로운 컴포넌트 추가 시 이 타입에 추가해야 함
 */
export type BuilderComponentType =
  // Layout
  | "Container"
  | "Grid"
  | "Flex"
  | "Card"
  | "Modal"
  | "Drawer"
  | "Tabs"
  // Basic
  | "Text"
  | "Heading"
  | "Button"
  | "Link"
  | "Divider"
  | "Icon"
  // Form
  | "Input"
  | "Textarea"
  | "Select"
  | "Radio"
  | "Checkbox"
  | "Switch"
  | "NumberInput"
  | "DatePicker"
  | "Label"
  // Data Display
  | "Table"
  | "Tag"
  | "Badge"
  | "Avatar"
  // Feedback
  | "Alert"
  | "Toast"
  | "Spinner"
  | "Progress";

/**
 * 컴포넌트 카테고리 분류
 */
export type ComponentCategory =
  | "Layout"
  | "Basic"
  | "Form"
  | "DataDisplay"
  | "Feedback";

/**
 * 컴포넌트 메타데이터
 * 빌더 UI에서 컴포넌트를 표시하고 관리하기 위한 정보
 */
export interface ComponentMetadata {
  /** 컴포넌트 타입 식별자 */
  type: BuilderComponentType;
  /** 사용자에게 표시되는 이름 */
  displayName: string;
  /** 컴포넌트 설명 */
  description: string;
  /** 카테고리 분류 */
  category: ComponentCategory;
  /** 아이콘 이름 (Lucide React 아이콘) */
  icon: string;
  /** 기본 props 값 */
  defaultProps: Record<string, unknown>;
  /** 자식 노드를 가질 수 있는지 여부 */
  canHaveChildren: boolean;
  /** 드래그 가능 여부 */
  draggable: boolean;
  /** 삭제 가능 여부 */
  deletable: boolean;
}

/**
 * 컴포넌트 속성 스키마
 * Zod 스키마를 기반으로 동적 폼 생성 및 런타임 검증
 */
export interface ComponentPropsSchema {
  /** 컴포넌트 타입 */
  type: BuilderComponentType;
  /** 속성 검증 스키마 (Zod) */
  schema: z.ZodSchema;
  /** UI 폼 생성을 위한 필드 메타데이터 */
  fields: ComponentFieldMetadata[];
}

/**
 * 폼 필드 메타데이터
 * 속성 편집기에서 각 필드를 어떻게 렌더링할지 정의
 */
export interface ComponentFieldMetadata {
  /** 필드 키 (props의 키와 일치) */
  key: string;
  /** 사용자에게 표시되는 라벨 */
  label: string;
  /** 필드 설명 (툴팁) */
  description?: string;
  /** 입력 타입 */
  inputType:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "select"
    | "color"
    | "slider";
  /** select 타입일 경우 선택 옵션 */
  options?: Array<{ label: string; value: string | number | boolean }>;
  /** 필드 그룹 (탭 분리용) */
  group?: "content" | "style" | "behavior" | "advanced";
  /** 필드 순서 */
  order?: number;
}

/**
 * 스타일 변형 정의
 * PRD의 Variant & State 표준을 반영
 */
export interface StyleVariant {
  /** 변형 이름 (예: variant, size, color) */
  name: string;
  /** 사용자에게 표시되는 라벨 */
  label: string;
  /** 기본값 */
  defaultValue: string | number | boolean;
  /** 가능한 값들 */
  options: Array<{
    label: string;
    value: string | number | boolean;
    description?: string;
  }>;
}

/**
 * 컴포넌트 상태 정의
 * 동적 상태 (hover, active, disabled, error 등)
 */
export interface ComponentState {
  /** 상태 이름 */
  name: string;
  /** 사용자에게 표시되는 라벨 */
  label: string;
  /** 상태 타입 */
  type: "boolean" | "string" | "number";
  /** 기본값 */
  defaultValue: boolean | string | number;
  /** 설명 */
  description?: string;
}

/**
 * React 컴포넌트 래퍼
 * 실제 디자인 라이브러리 컴포넌트를 감싸는 인터페이스
 */
export interface ComponentWrapper {
  /** 컴포넌트 타입 */
  type: BuilderComponentType;
  /** 실제 React 컴포넌트 */
  component: ComponentType<Record<string, unknown>>;
  /** 메타데이터 */
  metadata: ComponentMetadata;
  /** 속성 스키마 */
  propsSchema: ComponentPropsSchema;
  /** 스타일 변형 정의 */
  variants?: StyleVariant[];
  /** 상태 정의 */
  states?: ComponentState[];
}

/**
 * 컴포넌트 레지스트리 이벤트 타입
 */
export type ComponentRegistryEventType =
  | "component-registered"
  | "component-unregistered"
  | "component-updated"
  | "registry-cleared";

/**
 * 컴포넌트 레지스트리 이벤트
 */
export interface ComponentRegistryEvent {
  type: ComponentRegistryEventType;
  component?: ComponentWrapper;
  components?: ComponentWrapper[];
  timestamp: number;
}

/**
 * 컴포넌트 의존성 정보
 */
export interface ComponentDependency {
  /** 의존하는 컴포넌트 타입 */
  dependsOn: BuilderComponentType[];
  /** 이 컴포넌트에 의존하는 컴포넌트들 */
  dependents: BuilderComponentType[];
  /** 의존성 로드 우선순위 */
  priority: number;
}

/**
 * 컴포넌트 검증 결과
 */
export interface ComponentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 컴포넌트 통계 정보
 */
export interface ComponentRegistryStats {
  totalComponents: number;
  componentsByCategory: Record<ComponentCategory, number>;
  registrationOrder: BuilderComponentType[];
  lastModified: number;
}

/**
 * 레지스트리 이벤트 리스너
 */
export type ComponentRegistryEventListener = (
  event: ComponentRegistryEvent,
) => void;

/**
 * 컴포넌트 레지스트리 (확장된 인터페이스)
 * 어댑터에서 컴포넌트를 등록하고 관리하는 중앙 저장소
 */
export interface ComponentRegistry {
  /** 등록된 모든 컴포넌트 */
  components: Map<BuilderComponentType, ComponentWrapper>;

  // === 기본 CRUD 작업 ===
  /** 컴포넌트 등록 */
  register(wrapper: ComponentWrapper): void;

  /** 컴포넌트 조회 */
  get(type: BuilderComponentType): ComponentWrapper | undefined;

  /** 모든 컴포넌트 조회 */
  getAll(): ComponentWrapper[];

  /** 카테고리별 컴포넌트 조회 */
  getByCategory(category: ComponentCategory): ComponentWrapper[];

  /** 컴포넌트 존재 여부 확인 */
  has(type: BuilderComponentType): boolean;

  /** 컴포넌트 제거 */
  unregister(type: BuilderComponentType): boolean;

  // === 확장된 기능 ===
  /** 여러 컴포넌트 일괄 등록 */
  registerMany(wrappers: ComponentWrapper[]): void;

  /** 여러 컴포넌트 일괄 제거 */
  unregisterMany(types: BuilderComponentType[]): boolean[];

  /** 컴포넌트 검증 */
  validateComponent(wrapper: ComponentWrapper): ComponentValidationResult;

  /** 의존성 정보 조회 */
  getDependencies(type: BuilderComponentType): ComponentDependency | undefined;

  /** 의존성 순서로 컴포넌트 정렬 */
  resolveDependencyOrder(): BuilderComponentType[];

  /** 레지스트리 통계 조회 */
  getStats(): ComponentRegistryStats;

  // === 이벤트 시스템 ===
  /** 이벤트 리스너 추가 */
  addEventListener(
    type: ComponentRegistryEventType,
    listener: ComponentRegistryEventListener,
  ): void;

  /** 이벤트 리스너 제거 */
  removeEventListener(
    type: ComponentRegistryEventType,
    listener: ComponentRegistryEventListener,
  ): void;

  // === 성능 최적화 ===
  /** 카테고리별 인덱스 재구성 */
  rebuildCategoryIndex(): void;

  /** 컴포넌트 사전 로드 */
  preloadComponents(types: BuilderComponentType[]): Promise<void>;
}

/**
 * 어댑터 인터페이스
 * 각 디자인 라이브러리(shadcn, mui 등)가 구현해야 하는 인터페이스
 */
export interface DesignLibraryAdapter {
  /** 어댑터 이름 */
  name: string;
  /** 어댑터 버전 */
  version: string;
  /** 설명 */
  description: string;
  /** 컴포넌트 레지스트리 */
  registry: ComponentRegistry;
  /** 초기화 함수 */
  initialize(): void;
  /** 정리 함수 */
  cleanup(): void;
}

// AIDEV-NOTE: PRD 표준 Variant & State 정의
// PRD.md §4의 "컴포넌트 Variant & State 표준" 테이블 반영

/**
 * Button 컴포넌트 표준 변형
 */
export const BUTTON_VARIANTS: StyleVariant[] = [
  {
    name: "variant",
    label: "버튼 스타일",
    defaultValue: "primary",
    options: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Ghost", value: "ghost" },
    ],
  },
  {
    name: "size",
    label: "크기",
    defaultValue: "md",
    options: [
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
    ],
  },
];

/**
 * Button 컴포넌트 표준 상태
 */
export const BUTTON_STATES: ComponentState[] = [
  {
    name: "hover",
    label: "호버 상태",
    type: "boolean",
    defaultValue: false,
    description: "마우스 오버 시 상태",
  },
  {
    name: "active",
    label: "활성 상태",
    type: "boolean",
    defaultValue: false,
    description: "클릭 시 상태",
  },
  {
    name: "disabled",
    label: "비활성화",
    type: "boolean",
    defaultValue: false,
    description: "버튼 비활성화 상태",
  },
  {
    name: "loading",
    label: "로딩 상태",
    type: "boolean",
    defaultValue: false,
    description: "로딩 중 상태",
  },
];

/**
 * Input/Textarea 컴포넌트 표준 변형
 */
export const INPUT_VARIANTS: StyleVariant[] = [
  {
    name: "size",
    label: "크기",
    defaultValue: "md",
    options: [
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
    ],
  },
];

/**
 * Input/Textarea 컴포넌트 표준 상태
 */
export const INPUT_STATES: ComponentState[] = [
  {
    name: "focus",
    label: "포커스 상태",
    type: "boolean",
    defaultValue: false,
    description: "입력 필드 포커스 상태",
  },
  {
    name: "disabled",
    label: "비활성화",
    type: "boolean",
    defaultValue: false,
    description: "입력 필드 비활성화 상태",
  },
  {
    name: "error",
    label: "오류 상태",
    type: "boolean",
    defaultValue: false,
    description: "유효성 검사 오류 상태",
  },
];

// AIDEV-NOTE: Component 시스템 타입 정의 - 통합 export 파일
// 빌더 코어와 디자인 라이브러리 간의 추상화 계층

// 기본 컴포넌트 타입들
export type {
  BuilderComponentType,
  ComponentCategory,
  ComponentFieldMetadata,
  ComponentMetadata,
  ComponentPropsSchema,
  ComponentState,
  ComponentWrapper,
  StyleVariant,
} from "./component-base";

// 컴포넌트 레지스트리 관련 타입들
export type {
  ComponentDependency,
  ComponentRegistry,
  ComponentRegistryEvent,
  ComponentRegistryEventListener,
  ComponentRegistryEventType,
  ComponentRegistryStats,
  ComponentValidationResult,
  DesignLibraryAdapter,
} from "./component-registry";

// PRD 표준 변형 및 상태 정의
export {
  BUTTON_STATES,
  BUTTON_VARIANTS,
  INPUT_STATES,
  INPUT_VARIANTS,
} from "./component-variants";

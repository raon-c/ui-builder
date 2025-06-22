// AIDEV-NOTE: Component Registry 관련 타입 정의
// 컴포넌트 등록 및 관리를 위한 레지스트리 시스템

import type { BuilderComponentType, ComponentCategory, ComponentWrapper } from "./component-base";

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
export type ComponentRegistryEventListener = (event: ComponentRegistryEvent) => void;

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
  addEventListener(type: ComponentRegistryEventType, listener: ComponentRegistryEventListener): void;

  /** 이벤트 리스너 제거 */
  removeEventListener(type: ComponentRegistryEventType, listener: ComponentRegistryEventListener): void;

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

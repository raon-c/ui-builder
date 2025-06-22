// AIDEV-NOTE: 다중 라이브러리 지원 타입 정의 - 여러 디자인 라이브러리 동시 사용
// 네임스페이스, 우선순위, 충돌 해결, 테마 격리 등의 고급 기능 타입

import type { DesignLibraryAdapter } from "./adapter";
import type { BuilderComponentType, ComponentCategory, ComponentWrapper } from "./component";

/**
 * 라이브러리 네임스페이스 정의
 */
export type LibraryNamespace =
  | "shadcn" // shadcn/ui
  | "mui" // Material-UI
  | "antd" // Ant Design
  | "chakra" // Chakra UI
  | "mantine" // Mantine
  | "custom" // 커스텀 컴포넌트
  | "native"; // HTML 네이티브

/**
 * 네임스페이스가 포함된 컴포넌트 ID
 */
export interface NamespacedComponentId {
  /** 라이브러리 네임스페이스 */
  namespace: LibraryNamespace;
  /** 컴포넌트 타입 */
  componentType: BuilderComponentType;
  /** 전체 ID (namespace:componentType) */
  fullId: string;
}

/**
 * 어댑터 우선순위 설정
 */
export interface AdapterPriority {
  /** 네임스페이스 */
  namespace: LibraryNamespace;
  /** 우선순위 (높을수록 우선) */
  priority: number;
  /** 활성화 여부 */
  enabled: boolean;
  /** 자동 로드 여부 */
  autoLoad: boolean;
}

/**
 * 컴포넌트 충돌 해결 전략
 */
export type ConflictResolutionStrategy =
  | "priority" // 우선순위 기반
  | "namespace" // 네임스페이스 명시적 선택
  | "user-choice" // 사용자 선택
  | "merge" // 속성 병합
  | "fallback"; // 폴백 체인

/**
 * 컴포넌트 충돌 정보
 */
export interface ComponentConflict {
  /** 충돌하는 컴포넌트 타입 */
  componentType: BuilderComponentType;
  /** 충돌하는 어댑터들 */
  conflictingAdapters: Array<{
    namespace: LibraryNamespace;
    adapter: DesignLibraryAdapter;
    priority: number;
  }>;
  /** 해결 전략 */
  resolutionStrategy: ConflictResolutionStrategy;
  /** 선택된 어댑터 */
  resolvedAdapter?: DesignLibraryAdapter;
}

/**
 * 라이브러리별 테마 설정
 */
export interface LibraryTheme {
  /** 네임스페이스 */
  namespace: LibraryNamespace;
  /** 테마 이름 */
  themeName: string;
  /** CSS 변수 */
  cssVariables: Record<string, string>;
  /** 커스텀 CSS */
  customCss?: string;
  /** 다크 모드 지원 */
  supportsDarkMode: boolean;
}

/**
 * 다중 라이브러리 설정
 */
export interface MultiLibraryConfig {
  /** 어댑터 우선순위 목록 */
  adapterPriorities: AdapterPriority[];
  /** 기본 충돌 해결 전략 */
  defaultConflictResolution: ConflictResolutionStrategy;
  /** 라이브러리별 테마 설정 */
  themes: LibraryTheme[];
  /** 네임스페이스 표시 여부 */
  showNamespaces: boolean;
  /** 자동 충돌 해결 여부 */
  autoResolveConflicts: boolean;
  /** 폴백 체인 */
  fallbackChain: LibraryNamespace[];
}

/**
 * 어댑터 로딩 상태
 */
export type AdapterLoadingState =
  | "idle" // 대기 중
  | "loading" // 로딩 중
  | "loaded" // 로드 완료
  | "error" // 로딩 오류
  | "unloading"; // 언로딩 중

/**
 * 어댑터 로딩 결과 (다중 라이브러리용)
 */
export interface MultiLibraryAdapterLoadResult {
  /** 네임스페이스 */
  namespace: LibraryNamespace;
  /** 로딩 성공 여부 */
  success: boolean;
  /** 로드된 어댑터 */
  adapter?: DesignLibraryAdapter;
  /** 오류 정보 */
  error?: Error;
  /** 로딩 시간 (ms) */
  loadTime?: number;
  /** 등록된 컴포넌트 수 */
  componentCount?: number;
}

/**
 * 다중 라이브러리 통계
 */
export interface MultiLibraryStats {
  /** 로드된 어댑터 수 */
  loadedAdapters: number;
  /** 총 컴포넌트 수 */
  totalComponents: number;
  /** 네임스페이스별 컴포넌트 수 */
  componentsByNamespace: Record<LibraryNamespace, number>;
  /** 충돌하는 컴포넌트 수 */
  conflictingComponents: number;
  /** 활성 테마 수 */
  activeThemes: number;
  /** 메모리 사용량 (추정) */
  estimatedMemoryUsage: number;
}

/**
 * 네임스페이스 필터
 */
export interface NamespaceFilter {
  /** 포함할 네임스페이스 */
  include?: LibraryNamespace[];
  /** 제외할 네임스페이스 */
  exclude?: LibraryNamespace[];
  /** 카테고리별 필터 */
  categoryFilter?: Record<ComponentCategory, LibraryNamespace[]>;
}

/**
 * 컴포넌트 검색 결과 (네임스페이스 포함)
 */
export interface NamespacedComponentResult {
  /** 네임스페이스가 포함된 ID */
  id: NamespacedComponentId;
  /** 컴포넌트 래퍼 */
  wrapper: ComponentWrapper;
  /** 소속 어댑터 */
  adapter: DesignLibraryAdapter;
  /** 우선순위 점수 */
  priorityScore: number;
  /** 충돌 여부 */
  hasConflict: boolean;
}

/**
 * 다중 라이브러리 이벤트
 */
export interface MultiLibraryEvent {
  type:
    | "adapter-loaded"
    | "adapter-unloaded"
    | "conflict-detected"
    | "conflict-resolved"
    | "priority-changed"
    | "theme-changed";
  namespace: LibraryNamespace;
  timestamp: number;
  data?: unknown;
  error?: Error;
}

/**
 * 다중 라이브러리 이벤트 리스너
 */
export type MultiLibraryEventListener = (event: MultiLibraryEvent) => void;

/**
 * 어댑터 의존성 정보 (다중 라이브러리용)
 */
export interface MultiLibraryAdapterDependency {
  /** 네임스페이스 */
  namespace: LibraryNamespace;
  /** 의존하는 라이브러리들 */
  dependencies: LibraryNamespace[];
  /** 충돌하는 라이브러리들 */
  conflicts: LibraryNamespace[];
  /** 권장 로딩 순서 */
  loadOrder: number;
}

/**
 * 동적 로딩 옵션
 */
export interface DynamicLoadOptions {
  /** 지연 로딩 여부 */
  lazy: boolean;
  /** 청크 분할 여부 */
  splitChunks: boolean;
  /** 프리로딩 여부 */
  preload: boolean;
  /** 캐시 전략 */
  cacheStrategy: "memory" | "disk" | "none";
  /** 타임아웃 (ms) */
  timeout: number;
}

/**
 * 네임스페이스 유틸리티 함수들
 */
export interface NamespaceUtils {
  /** 전체 ID 생성 */
  createFullId(namespace: LibraryNamespace, componentType: BuilderComponentType): string;
  /** 전체 ID 파싱 */
  parseFullId(fullId: string): NamespacedComponentId | null;
  /** 네임스페이스 검증 */
  validateNamespace(namespace: string): namespace is LibraryNamespace;
  /** 충돌 감지 */
  detectConflicts(adapters: DesignLibraryAdapter[]): ComponentConflict[];
  /** 우선순위 정렬 */
  sortByPriority(adapters: DesignLibraryAdapter[], priorities: AdapterPriority[]): DesignLibraryAdapter[];
} 
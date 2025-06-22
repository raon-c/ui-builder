// AIDEV-NOTE: 확장된 어댑터 시스템 타입 정의
// 다중 어댑터 지원, 동적 로딩, 호환성 관리를 위한 고급 어댑터 인터페이스

import type { ComponentRegistry } from "./component-registry";

/**
 * 어댑터 상태
 */
export type AdapterStatus =
  | "unloaded" // 로드되지 않음
  | "loading" // 로딩 중
  | "loaded" // 로드 완료
  | "active" // 활성 상태
  | "error" // 에러 상태
  | "disabled"; // 비활성화됨

/**
 * 어댑터 라이센스 정보
 */
export interface AdapterLicense {
  type: "MIT" | "Apache-2.0" | "GPL-3.0" | "BSD-3-Clause" | "Custom";
  url?: string;
  text?: string;
}

/**
 * 어댑터 의존성
 */
export interface AdapterDependency {
  name: string;
  version: string;
  optional?: boolean;
}

/**
 * 어댑터 호환성 정보
 */
export interface AdapterCompatibility {
  /** 최소 Node.js 버전 */
  nodeVersion?: string;
  /** 최소 React 버전 */
  reactVersion?: string;
  /** 최소 TypeScript 버전 */
  typescriptVersion?: string;
  /** 지원하는 빌더 버전 범위 */
  builderVersion: string;
  /** 브라우저 지원 */
  browsers?: string[];
}

/**
 * 어댑터 메타데이터 (확장됨)
 */
export interface AdapterMetadata {
  /** 어댑터 고유 ID */
  id: string;
  /** 표시 이름 */
  name: string;
  /** 버전 */
  version: string;
  /** 설명 */
  description: string;
  /** 제작자/조직 */
  author?: string;
  /** 홈페이지 URL */
  homepage?: string;
  /** 저장소 URL */
  repository?: string;
  /** 라이센스 정보 */
  license?: AdapterLicense;
  /** 태그 (검색용) */
  tags?: string[];
  /** 아이콘 URL 또는 이모지 */
  icon?: string;
  /** 스크린샷 URLs */
  screenshots?: string[];
  /** 의존성 */
  dependencies?: AdapterDependency[];
  /** 호환성 정보 */
  compatibility: AdapterCompatibility;
  /** 실험적 기능 여부 */
  experimental?: boolean;
  /** 최소 요구 권한 */
  permissions?: string[];
}

/**
 * 어댑터 설정
 */
export interface AdapterConfig {
  /** 테마 설정 */
  theme?: Record<string, unknown>;
  /** 커스텀 CSS 변수 */
  cssVariables?: Record<string, string>;
  /** 기본 props 오버라이드 */
  defaultProps?: Record<string, unknown>;
  /** 기능 플래그 */
  features?: Record<string, boolean>;
}

/**
 * 어댑터 이벤트 타입
 */
export type AdapterEventType =
  | "status-changed"
  | "config-updated"
  | "component-registered"
  | "component-unregistered"
  | "error"
  | "warning";

/**
 * 어댑터 이벤트
 */
export interface AdapterEvent {
  type: AdapterEventType;
  adapterId: string;
  timestamp: number;
  data?: unknown;
  error?: Error;
}

/**
 * 어댑터 이벤트 리스너
 */
export type AdapterEventListener = (event: AdapterEvent) => void;

/**
 * 어댑터 로딩 결과
 */
export interface AdapterLoadResult {
  success: boolean;
  adapter?: DesignLibraryAdapter;
  error?: Error;
  warnings?: string[];
}

/**
 * 확장된 디자인 라이브러리 어댑터 인터페이스
 */
export interface DesignLibraryAdapter {
  /** 어댑터 메타데이터 */
  readonly metadata: AdapterMetadata;

  /** 현재 상태 */
  readonly status: AdapterStatus;

  /** 컴포넌트 레지스트리 */
  readonly registry: ComponentRegistry;

  /** 현재 설정 */
  config: AdapterConfig;

  // === 라이프사이클 메서드 ===
  /** 어댑터 로드 */
  load(): Promise<void>;

  /** 어댑터 언로드 */
  unload(): Promise<void>;

  /** 어댑터 활성화 */
  activate(): Promise<void>;

  /** 어댑터 비활성화 */
  deactivate(): Promise<void>;

  // === 설정 관리 ===
  /** 설정 업데이트 */
  updateConfig(config: Partial<AdapterConfig>): void;

  /** 설정 초기화 */
  resetConfig(): void;

  // === 이벤트 시스템 ===
  /** 이벤트 리스너 등록 */
  addEventListener(type: AdapterEventType, listener: AdapterEventListener): void;

  /** 이벤트 리스너 제거 */
  removeEventListener(type: AdapterEventType, listener: AdapterEventListener): void;

  /** 이벤트 발생 */
  emit(event: AdapterEvent): void;

  // === 호환성 검사 ===
  /** 호환성 검사 */
  checkCompatibility(): Promise<boolean>;

  /** 의존성 검사 */
  checkDependencies(): Promise<boolean>;

  // === 유틸리티 ===
  /** CSS 스타일 주입 */
  injectStyles?(): void;

  /** CSS 스타일 제거 */
  removeStyles?(): void;

  /** 어댑터별 커스텀 설정 UI */
  getConfigComponent?(): React.ComponentType<any> | undefined;
}

/**
 * 어댑터 팩토리 함수 타입
 */
export type AdapterFactory = () => Promise<DesignLibraryAdapter>;

/**
 * 어댑터 등록 정보
 */
export interface AdapterRegistration {
  metadata: AdapterMetadata;
  factory: AdapterFactory;
  isBuiltIn?: boolean;
}

/**
 * 어댑터 매니저 이벤트
 */
export interface AdapterManagerEvent {
  type: "adapter-registered" | "adapter-unregistered" | "active-adapter-changed";
  adapterId?: string;
  previousAdapterId?: string;
  timestamp: number;
}

/**
 * 어댑터 매니저 이벤트 리스너
 */
export type AdapterManagerEventListener = (event: AdapterManagerEvent) => void;

/**
 * 어댑터 매니저 인터페이스
 */
export interface AdapterManager {
  /** 등록된 모든 어댑터 */
  readonly registrations: Map<string, AdapterRegistration>;

  /** 로드된 어댑터 인스턴스들 */
  readonly instances: Map<string, DesignLibraryAdapter>;

  /** 현재 활성 어댑터 ID */
  readonly activeAdapterId: string | null;

  // === 어댑터 등록/해제 ===
  /** 어댑터 등록 */
  register(registration: AdapterRegistration): void;

  /** 어댑터 등록 해제 */
  unregister(adapterId: string): void;

  /** 등록된 어댑터 목록 조회 */
  getRegistered(): AdapterRegistration[];

  // === 어댑터 로딩/관리 ===
  /** 어댑터 로드 */
  load(adapterId: string): Promise<AdapterLoadResult>;

  /** 어댑터 언로드 */
  unload(adapterId: string): Promise<void>;

  /** 활성 어댑터 변경 */
  setActive(adapterId: string): Promise<void>;

  /** 활성 어댑터 조회 */
  getActive(): DesignLibraryAdapter | null;

  // === 이벤트 시스템 ===
  /** 이벤트 리스너 등록 */
  addEventListener(
    type: "adapter-registered" | "adapter-unregistered" | "active-adapter-changed",
    listener: AdapterManagerEventListener,
  ): void;

  /** 이벤트 리스너 제거 */
  removeEventListener(
    type: "adapter-registered" | "adapter-unregistered" | "active-adapter-changed",
    listener: AdapterManagerEventListener,
  ): void;

  // === 유틸리티 ===
  /** 호환성 검사 */
  checkCompatibility(adapterId: string): Promise<boolean>;

  /** 모든 어댑터 정리 */
  cleanup(): Promise<void>;
}

/**
 * 어댑터 검색 필터
 */
export interface AdapterSearchFilter {
  query?: string;
  tags?: string[];
  author?: string;
  experimental?: boolean;
  status?: AdapterStatus[];
}

/**
 * 어댑터 정렬 옵션
 */
export type AdapterSortOption = "name" | "version" | "author" | "status" | "registrationDate";

/**
 * 어댑터 검색 결과
 */
export interface AdapterSearchResult {
  adapters: AdapterRegistration[];
  total: number;
  page: number;
  pageSize: number;
} 
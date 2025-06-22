// AIDEV-NOTE: 커스텀 컴포넌트 타입 정의 - 사용자 정의 컴포넌트 시스템
// 사용자가 자신만의 컴포넌트를 등록하고 관리하기 위한 타입 시스템

import type { z } from "zod";
import type { ComponentCategory, ComponentWrapper } from "./component";

/**
 * 커스텀 컴포넌트 소스 타입
 */
export type CustomComponentSourceType =
  | "code" // 직접 코드 작성
  | "url" // 외부 URL에서 로드
  | "npm" // NPM 패키지
  | "github"; // GitHub 저장소

/**
 * 커스텀 컴포넌트 상태
 */
export type CustomComponentStatus =
  | "draft" // 작성 중
  | "validating" // 검증 중
  | "valid" // 검증 완료
  | "invalid" // 검증 실패
  | "published" // 게시됨
  | "deprecated"; // 사용 중단

/**
 * 커스텀 컴포넌트 코드 정의
 */
export interface CustomComponentCode {
  /** TypeScript/JavaScript 코드 */
  source: string;
  /** CSS 스타일 (선택적) */
  styles?: string;
  /** 의존성 목록 */
  dependencies?: Record<string, string>;
  /** 컴파일 타겟 */
  target?: "es5" | "es2015" | "es2020" | "esnext";
}

/**
 * 커스텀 컴포넌트 메타데이터
 */
export interface CustomComponentMetadata {
  /** 고유 ID */
  id: string;
  /** 컴포넌트 이름 */
  name: string;
  /** 표시 이름 */
  displayName: string;
  /** 설명 */
  description: string;
  /** 버전 */
  version: string;
  /** 작성자 정보 */
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  /** 카테고리 */
  category: ComponentCategory | "Custom";
  /** 태그 */
  tags: string[];
  /** 아이콘 (이모지 또는 URL) */
  icon?: string;
  /** 스크린샷 URLs */
  screenshots?: string[];
  /** 문서 URL */
  documentation?: string;
  /** 라이센스 */
  license?: string;
  /** 생성 일시 */
  createdAt: string;
  /** 수정 일시 */
  updatedAt: string;
  /** 공개 여부 */
  isPublic?: boolean;
  /** 실험적 기능 여부 */
  experimental?: boolean;
}

/**
 * 커스텀 컴포넌트 Props 정의
 */
export interface CustomComponentProps {
  /** Props 스키마 (Zod 스키마 문자열) */
  schema: string;
  /** 기본값 */
  defaults?: Record<string, unknown>;
  /** Props 예제 */
  examples?: Array<{
    name: string;
    props: Record<string, unknown>;
  }>;
}

/**
 * 커스텀 컴포넌트 검증 결과
 */
export interface CustomComponentValidation {
  /** 검증 통과 여부 */
  isValid: boolean;
  /** 오류 목록 */
  errors: Array<{
    type: "syntax" | "runtime" | "type" | "dependency";
    message: string;
    line?: number;
    column?: number;
  }>;
  /** 경고 목록 */
  warnings: Array<{
    type: string;
    message: string;
  }>;
  /** 검증 일시 */
  validatedAt: string;
}

/**
 * 커스텀 컴포넌트 정의
 */
export interface CustomComponentDefinition {
  /** 메타데이터 */
  metadata: CustomComponentMetadata;
  /** 소스 타입 */
  sourceType: CustomComponentSourceType;
  /** 컴포넌트 코드 */
  code: CustomComponentCode;
  /** Props 정의 */
  props: CustomComponentProps;
  /** 현재 상태 */
  status: CustomComponentStatus;
  /** 검증 결과 */
  validation?: CustomComponentValidation;
  /** 컴파일된 코드 (캐시) */
  compiled?: string;
  /** 사용 통계 */
  usage?: {
    count: number;
    lastUsed?: string;
    projects?: string[];
  };
}

/**
 * 커스텀 컴포넌트 등록 요청
 */
export interface CustomComponentRegistrationRequest {
  /** 기본 정보 */
  name: string;
  displayName: string;
  description: string;
  category: ComponentCategory | "Custom";
  icon?: string;

  /** 코드 정보 */
  sourceType: CustomComponentSourceType;
  code: string;
  styles?: string;
  dependencies?: Record<string, string>;

  /** Props 스키마 */
  propsSchema?: string;
  defaultProps?: Record<string, unknown>;

  /** 추가 정보 */
  tags?: string[];
  isPublic?: boolean;
  experimental?: boolean;
}

/**
 * 커스텀 컴포넌트 검색 필터
 */
export interface CustomComponentFilter {
  /** 검색어 */
  query?: string;
  /** 카테고리 필터 */
  categories?: Array<ComponentCategory | "Custom">;
  /** 태그 필터 */
  tags?: string[];
  /** 작성자 필터 */
  author?: string;
  /** 상태 필터 */
  status?: CustomComponentStatus[];
  /** 공개 여부 */
  isPublic?: boolean;
  /** 정렬 옵션 */
  sortBy?: "name" | "createdAt" | "updatedAt" | "usage";
  /** 정렬 방향 */
  sortOrder?: "asc" | "desc";
}

/**
 * 커스텀 컴포넌트 업데이트 요청
 */
export interface CustomComponentUpdateRequest {
  /** 메타데이터 업데이트 */
  metadata?: Partial<Omit<CustomComponentMetadata, "id" | "createdAt">>;
  /** 코드 업데이트 */
  code?: Partial<CustomComponentCode>;
  /** Props 업데이트 */
  props?: Partial<CustomComponentProps>;
  /** 상태 변경 */
  status?: CustomComponentStatus;
}

/**
 * 커스텀 컴포넌트 컴파일 옵션
 */
export interface CustomComponentCompileOptions {
  /** TypeScript 사용 여부 */
  typescript?: boolean;
  /** JSX 사용 여부 */
  jsx?: boolean;
  /** 소스맵 생성 */
  sourceMaps?: boolean;
  /** 최적화 수준 */
  optimization?: "none" | "basic" | "advanced";
  /** 외부 라이브러리 */
  externals?: string[];
}

/**
 * 커스텀 컴포넌트 런타임 컨텍스트
 */
export interface CustomComponentContext {
  /** React */
  React: any;
  /** 사용 가능한 hooks */
  hooks?: Record<string, any>;
  /** 사용 가능한 유틸리티 */
  utils?: Record<string, any>;
  /** 사용 가능한 아이콘 */
  icons?: Record<string, any>;
  /** 테마 정보 */
  theme?: Record<string, any>;
}

/**
 * 커스텀 컴포넌트 로더 결과
 */
export interface CustomComponentLoadResult {
  /** 성공 여부 */
  success: boolean;
  /** 컴포넌트 래퍼 */
  wrapper?: ComponentWrapper;
  /** 오류 정보 */
  error?: Error;
  /** 경고 메시지 */
  warnings?: string[];
}

/**
 * 커스텀 컴포넌트 익스포트 형식
 */
export interface CustomComponentExport {
  /** 메타데이터 */
  metadata: CustomComponentMetadata;
  /** 전체 정의 */
  definition: CustomComponentDefinition;
  /** 익스포트 날짜 */
  exportedAt: string;
  /** 익스포트 버전 */
  exportVersion: string;
}

/**
 * 커스텀 컴포넌트 매니저 이벤트
 */
export interface CustomComponentEvent {
  type: "registered" | "updated" | "deleted" | "validated" | "compiled" | "published";
  componentId: string;
  timestamp: number;
  data?: unknown;
  error?: Error;
}

/**
 * 커스텀 컴포넌트 매니저 이벤트 리스너
 */
export type CustomComponentEventListener = (event: CustomComponentEvent) => void;

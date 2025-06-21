// AIDEV-NOTE: 스토리지 추상화 타입 정의 - StorageAdapter 패턴
// MVP는 localStorage 기반, 향후 IndexedDB/REST API 확장 가능

import type { Project } from "./project";

/**
 * 스토리지 어댑터 인터페이스
 * 다양한 스토리지 백엔드(localStorage, IndexedDB, REST API)를 추상화
 */
export interface StorageAdapter {
  /** 아이템 조회 */
  getItem<T = unknown>(key: string): Promise<T | null>;

  /** 아이템 저장 */
  setItem<T = unknown>(key: string, value: T): Promise<void>;

  /** 아이템 삭제 */
  removeItem(key: string): Promise<void>;

  /** 모든 키 조회 */
  getAllKeys(): Promise<string[]>;

  /** 스토리지 초기화 */
  clear(): Promise<void>;

  /** 사용 가능한 용량 확인 (바이트) */
  getAvailableSpace?(): Promise<number>;
}

/**
 * 스토리지 에러 클래스
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: StorageErrorCode,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

/**
 * 스토리지 에러 코드
 */
export type StorageErrorCode =
  | "QUOTA_EXCEEDED" // 저장 공간 부족
  | "PARSE_ERROR" // JSON 파싱 오류
  | "NOT_FOUND" // 키를 찾을 수 없음
  | "ACCESS_DENIED" // 접근 권한 없음
  | "NETWORK_ERROR" // 네트워크 오류 (원격 스토리지)
  | "INVALID_DATA" // 잘못된 데이터 형식
  | "STORAGE_UNAVAILABLE" // 스토리지 사용 불가
  | "UNKNOWN"; // 알 수 없는 오류

/**
 * 프로젝트 스토리지 인터페이스
 * 프로젝트 관련 CRUD 작업을 추상화
 */
export interface ProjectStorage {
  /** 모든 프로젝트 조회 */
  getAllProjects(): Promise<Project[]>;

  /** 프로젝트 ID로 조회 */
  getProject(id: string): Promise<Project | null>;

  /** 프로젝트 저장 (생성/수정) */
  saveProject(project: Project): Promise<void>;

  /** 프로젝트 삭제 */
  deleteProject(id: string): Promise<void>;

  /** 최근 프로젝트 ID 저장/조회 */
  getRecentProjectId(): Promise<string | null>;
  setRecentProjectId(id: string): Promise<void>;

  /** 스토리지 사용량 조회 */
  getStorageUsage(): Promise<StorageUsage>;
}

/**
 * 스토리지 사용량 정보
 */
export interface StorageUsage {
  /** 사용된 용량 (바이트) */
  used: number;

  /** 전체 가용 용량 (바이트) */
  total: number;

  /** 사용률 (0-1) */
  usage: number;

  /** 프로젝트별 사용량 */
  projects: Array<{
    id: string;
    name: string;
    size: number;
  }>;
}

/**
 * 스토리지 설정
 */
export interface StorageConfig {
  /** 스토리지 키 접두사 */
  keyPrefix: string;

  /** 최대 프로젝트 수 */
  maxProjects?: number;

  /** 압축 사용 여부 */
  compression?: boolean;

  /** 자동 백업 여부 */
  autoBackup?: boolean;

  /** 디버그 모드 */
  debug?: boolean;
}

/**
 * 기본 스토리지 설정
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  keyPrefix: "ui-builder",
  maxProjects: 100,
  compression: false,
  autoBackup: true,
  debug: false,
};

/**
 * 스토리지 키 상수
 */
export const STORAGE_KEYS = {
  PROJECTS: "projects",
  RECENT_PROJECT_ID: "recentProjectId",
  USER_PREFERENCES: "preferences",
  TEMP_DATA: "temp",
} as const;

/**
 * 스토리지 이벤트 타입
 */
export type StorageEventType =
  | "project:created"
  | "project:updated"
  | "project:deleted"
  | "storage:quota_warning"
  | "storage:error";

/**
 * 스토리지 이벤트 데이터
 */
export interface StorageEvent {
  type: StorageEventType;
  projectId?: string;
  error?: StorageError;
  data?: unknown;
  timestamp: number;
}

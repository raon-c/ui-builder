// AIDEV-NOTE: 키보드 단축키 시스템 타입 정의
// 포괄적인 단축키 지원을 위한 타입 시스템과 설정 구조

/**
 * 키보드 단축키 정의
 */
export interface KeyboardShortcut {
  /** 고유 식별자 */
  id: string;

  /** 단축키 이름 */
  name: string;

  /** 단축키 설명 */
  description: string;

  /** 키 조합 */
  keys: KeyCombination;

  /** 실행할 액션 */
  action: () => void;

  /** 카테고리 */
  category: ShortcutCategory;

  /** 활성화 조건 */
  condition?: () => boolean;

  /** 기본 동작 방지 여부 */
  preventDefault?: boolean;

  /** 이벤트 전파 중단 여부 */
  stopPropagation?: boolean;

  /** 우선순위 (높을수록 먼저 처리) */
  priority?: number;
}

/**
 * 키 조합 정의
 */
export interface KeyCombination {
  /** 메인 키 */
  key: string;

  /** Ctrl 키 필요 여부 */
  ctrl?: boolean;

  /** Shift 키 필요 여부 */
  shift?: boolean;

  /** Alt 키 필요 여부 */
  alt?: boolean;

  /** Meta 키 (Cmd on Mac) 필요 여부 */
  meta?: boolean;
}

/**
 * 단축키 카테고리
 */
export type ShortcutCategory =
  | "editing" // 편집 관련
  | "navigation" // 탐색 관련
  | "selection" // 선택 관련
  | "view" // 보기 관련
  | "file" // 파일 관련
  | "help" // 도움말 관련
  | "custom"; // 사용자 정의

/**
 * 단축키 컨텍스트
 */
export type ShortcutContext =
  | "global" // 전역
  | "builder" // 빌더 페이지
  | "catalog" // 컴포넌트 카탈로그
  | "properties" // 속성 편집기
  | "structure" // 구조 트리
  | "canvas" // 캔버스
  | "modal"; // 모달

/**
 * 단축키 이벤트 핸들러
 */
export interface ShortcutHandler {
  /** 단축키 등록 */
  register(shortcut: KeyboardShortcut, context?: ShortcutContext): () => void;

  /** 단축키 해제 */
  unregister(shortcutId: string, context?: ShortcutContext): void;

  /** 모든 단축키 해제 */
  unregisterAll(context?: ShortcutContext): void;

  /** 단축키 목록 조회 */
  getShortcuts(context?: ShortcutContext): KeyboardShortcut[];

  /** 단축키 검색 */
  findShortcut(keys: KeyCombination, context?: ShortcutContext): KeyboardShortcut | null;

  /** 활성화/비활성화 */
  setEnabled(enabled: boolean): void;

  /** 컨텍스트 변경 */
  setContext(context: ShortcutContext): void;
}

/**
 * 단축키 설정
 */
export interface ShortcutConfig {
  /** 전역 활성화 여부 */
  enabled: boolean;

  /** 현재 컨텍스트 */
  context: ShortcutContext;

  /** 사용자 정의 단축키 */
  customShortcuts: Record<string, KeyCombination>;

  /** 비활성화된 단축키 목록 */
  disabledShortcuts: string[];

  /** 도움말 표시 여부 */
  showHelp: boolean;
}

/**
 * 키 이벤트 매칭 결과
 */
export interface KeyMatchResult {
  /** 매칭된 단축키 */
  shortcut: KeyboardShortcut;

  /** 매칭된 컨텍스트 */
  context: ShortcutContext;

  /** 실행 가능 여부 */
  canExecute: boolean;

  /** 실행 불가 이유 */
  reason?: string;
}

/**
 * 단축키 그룹 (도움말 UI용)
 */
export interface ShortcutGroup {
  /** 그룹 이름 */
  name: string;

  /** 그룹 설명 */
  description: string;

  /** 카테고리 */
  category: ShortcutCategory;

  /** 단축키 목록 */
  shortcuts: KeyboardShortcut[];
}

/**
 * 키 조합을 문자열로 변환하는 유틸리티 타입
 */
export type KeyCombinationString = string; // 예: "Ctrl+C", "Shift+Delete" 
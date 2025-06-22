// AIDEV-NOTE: Command Pattern 타입 정의 - Undo/Redo 시스템의 기반
// 모든 편집 작업을 Command로 추상화하여 실행 취소 가능하게 함

import type { BuilderComponentType } from "@/types/component";
import type { CanvasNode, Screen } from "@/types/project";

/**
 * Command 인터페이스 - 모든 편집 작업의 기본 구조
 */
export interface Command {
  /** 고유 식별자 */
  id: string;

  /** 명령 타입 (디버깅 및 로깅용) */
  type: CommandType;

  /** 명령 실행 시간 */
  timestamp: number;

  /** 명령 설명 (히스토리 UI용) */
  description: string;

  /** 명령 실행 */
  execute(): void;

  /** 명령 취소 (undo) */
  undo(): void;
}

/**
 * 지원하는 명령 타입들
 */
export type CommandType =
  | "ADD_NODE"
  | "REMOVE_NODE"
  | "MOVE_NODE"
  | "UPDATE_PROPS"
  | "REORDER_NODES"
  | "SET_SCREEN"
  | "BATCH_COMMANDS";

/**
 * 노드 추가 명령 데이터
 */
export interface AddNodeCommandData {
  parentId: string;
  componentType: BuilderComponentType;
  index: number;
  nodeId: string; // 미리 생성된 ID
  props: Record<string, unknown>;
}

/**
 * 노드 제거 명령 데이터
 */
export interface RemoveNodeCommandData {
  nodeId: string;
  parentId: string;
  index: number;
  nodeData: CanvasNode; // 복원을 위한 전체 노드 데이터
}

/**
 * 노드 이동 명령 데이터
 */
export interface MoveNodeCommandData {
  nodeId: string;
  oldParentId: string;
  oldIndex: number;
  newParentId: string;
  newIndex: number;
}

/**
 * 속성 업데이트 명령 데이터
 */
export interface UpdatePropsCommandData {
  nodeId: string;
  oldProps: Record<string, unknown>;
  newProps: Record<string, unknown>;
}

/**
 * 노드 순서 변경 명령 데이터
 */
export interface ReorderNodesCommandData {
  parentId: string;
  nodeId: string;
  oldIndex: number;
  newIndex: number;
}

/**
 * 화면 설정 명령 데이터
 */
export interface SetScreenCommandData {
  oldScreen: Screen | null;
  newScreen: Screen | null;
}

/**
 * 배치 명령 데이터
 */
export interface BatchCommandsData {
  commands: Command[];
  description: string;
}

/**
 * 명령 히스토리 관리자 인터페이스
 */
export interface CommandHistory {
  /** 실행된 명령들 (undo 스택) */
  undoStack: Command[];

  /** 취소된 명령들 (redo 스택) */
  redoStack: Command[];

  /** 최대 히스토리 크기 */
  maxHistorySize: number;

  /** 명령 실행 */
  execute(command: Command): void;

  /** 실행 취소 */
  undo(): boolean;

  /** 다시 실행 */
  redo(): boolean;

  /** 히스토리 초기화 */
  clear(): void;

  /** 실행 취소 가능 여부 */
  canUndo(): boolean;

  /** 다시 실행 가능 여부 */
  canRedo(): boolean;

  /** 히스토리 상태 */
  getHistoryState(): {
    undoCount: number;
    redoCount: number;
    currentPosition: number;
    totalCommands: number;
  };
}

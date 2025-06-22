// AIDEV-NOTE: Command 시스템 진입점 - 모든 Command 관련 exports 통합
// Undo/Redo 시스템의 공개 API 제공

// Command 구현체들
export {
  AddNodeCommand,
  BatchCommand,
  MoveNodeCommand,
  RemoveNodeCommand,
  ReorderNodesCommand,
  SetScreenCommand,
  UpdatePropsCommand,
} from "./builderCommands";
// Command Factory 함수들
export {
  createAddNodeAtDropPositionCommand,
  createAddNodeCommand,
  createBatchCommand,
  createMoveNodeAtDropPositionCommand,
  createMoveNodeCommand,
  createRemoveNodeCommand,
  createReorderNodesCommand,
  createSetScreenCommand,
  createUpdatePropsCommand,
} from "./commandFactory";

// Command History 관리자
export { CommandHistoryImpl, commandHistory } from "./commandHistory";
// 타입 정의
export type {
  AddNodeCommandData,
  BatchCommandsData,
  Command,
  CommandHistory,
  CommandType,
  MoveNodeCommandData,
  RemoveNodeCommandData,
  ReorderNodesCommandData,
  SetScreenCommandData,
  UpdatePropsCommandData,
} from "./types";

// 내부 imports (편의 함수용)
import { commandHistory } from "./commandHistory";
import type { Command } from "./types";

// 편의 함수들
export const Commands = {
  // 히스토리 관련
  undo: () => commandHistory.undo(),
  redo: () => commandHistory.redo(),
  canUndo: () => commandHistory.canUndo(),
  canRedo: () => commandHistory.canRedo(),
  clear: () => commandHistory.clear(),

  // 상태 조회
  getHistoryState: () => commandHistory.getHistoryState(),
  getRecentCommands: (count?: number) => commandHistory.getRecentCommands(count),
  getMemoryInfo: () => commandHistory.getMemoryInfo(),

  // 히스토리 리스너
  addListener: (listener: () => void) => commandHistory.addListener(listener),

  // 명령 실행
  execute: (command: Command) => commandHistory.execute(command),

  // 특정 위치로 이동
  goToPosition: (position: number) => commandHistory.goToPosition(position),
} as const;

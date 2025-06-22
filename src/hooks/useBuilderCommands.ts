// AIDEV-NOTE: 빌더 Command 통합 Hook - 기존 빌더 API를 Command로 래핑
// Undo/Redo 지원을 위해 모든 편집 작업을 Command Pattern으로 처리

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Commands,
  createAddNodeAtDropPositionCommand,
  createAddNodeCommand,
  createMoveNodeAtDropPositionCommand,
  createMoveNodeCommand,
  createRemoveNodeCommand,
  createReorderNodesCommand,
  createSetScreenCommand,
  createUpdatePropsCommand,
} from "@/lib/commands";
import { useBuilderStore } from "@/store/builderStore";
import type { BuilderComponentType } from "@/types/component";
import type { Screen } from "@/types/project";

/**
 * Command 기반 빌더 작업을 위한 Hook
 */
export function useBuilderCommands() {
  const [historyState, setHistoryState] = useState(Commands.getHistoryState());

  // 히스토리 상태 변경 리스너 등록
  useEffect(() => {
    const unsubscribe = Commands.addListener(() => {
      setHistoryState(Commands.getHistoryState());
    });

    return unsubscribe;
  }, []);

  // 노드 추가 (Command 버전)
  const addNode = useCallback(
    (parentId: string, componentType: BuilderComponentType, index: number, props?: Record<string, unknown>) => {
      const command = createAddNodeCommand(parentId, componentType, index, props);
      Commands.execute(command);
    },
    [],
  );

  // 노드 제거 (Command 버전)
  const removeNode = useCallback((nodeId: string) => {
    const command = createRemoveNodeCommand(nodeId);
    if (command) {
      Commands.execute(command);
    }
  }, []);

  // 노드 이동 (Command 버전)
  const moveNode = useCallback((nodeId: string, newParentId: string, newIndex: number) => {
    const command = createMoveNodeCommand(nodeId, newParentId, newIndex);
    if (command) {
      Commands.execute(command);
    }
  }, []);

  // 노드 속성 업데이트 (Command 버전)
  const updateNodeProps = useCallback((nodeId: string, newProps: Record<string, unknown>) => {
    const command = createUpdatePropsCommand(nodeId, newProps);
    if (command) {
      Commands.execute(command);
    }
  }, []);

  // 노드 순서 변경 (Command 버전)
  const reorderNodes = useCallback((nodeId: string, newIndex: number) => {
    const command = createReorderNodesCommand(nodeId, newIndex);
    if (command) {
      Commands.execute(command);
    }
  }, []);

  // 화면 설정 (Command 버전)
  const setCurrentScreen = useCallback((screen: Screen | null) => {
    const command = createSetScreenCommand(screen);
    Commands.execute(command);
  }, []);

  // 드롭 위치에 노드 추가 (Command 버전)
  const addNodeAtDropPosition = useCallback((componentType: BuilderComponentType) => {
    const command = createAddNodeAtDropPositionCommand(componentType);
    if (command) {
      Commands.execute(command);
    }
  }, []);

  // 드롭 위치로 노드 이동 (Command 버전)
  const moveNodeAtDropPosition = useCallback((nodeId: string) => {
    const command = createMoveNodeAtDropPositionCommand(nodeId);
    if (command) {
      Commands.execute(command);
    }
  }, []);

  // Undo/Redo 작업
  const undo = useCallback(() => {
    Commands.undo();
  }, []);

  const redo = useCallback(() => {
    Commands.redo();
  }, []);

  // 히스토리 초기화
  const clearHistory = useCallback(() => {
    Commands.clear();
  }, []);

  // 특정 위치로 이동
  const goToHistoryPosition = useCallback((position: number) => {
    Commands.goToPosition(position);
  }, []);

  // 최근 명령들 가져오기
  const getRecentCommands = useCallback((count?: number) => {
    return Commands.getRecentCommands(count);
  }, []);

  // 메모리 정보 가져오기
  const getMemoryInfo = useCallback(() => {
    return Commands.getMemoryInfo();
  }, []);

  return {
    // Command 기반 편집 작업
    addNode,
    removeNode,
    moveNode,
    updateNodeProps,
    reorderNodes,
    setCurrentScreen,
    addNodeAtDropPosition,
    moveNodeAtDropPosition,

    // Undo/Redo 기능
    undo,
    redo,
    canUndo: historyState.undoCount > 0,
    canRedo: historyState.redoCount > 0,

    // 히스토리 관리
    clearHistory,
    goToHistoryPosition,
    historyState,

    // 유틸리티
    getRecentCommands,
    getMemoryInfo,

    // 기존 빌더 스토어 API (Command로 래핑되지 않은 읽기 전용)
    ...useBuilderStore((state) => ({
      currentScreen: state.currentScreen,
      selectedNodeId: state.selectedNodeId,
      draggedComponentType: state.draggedComponentType,
      dragOverNodeId: state.dragOverNodeId,
      dropPosition: state.dropPosition,

      // 읽기 전용 메서드들
      setSelectedNode: state.setSelectedNode,
      setDraggedComponentType: state.setDraggedComponentType,
      setDragOverNode: state.setDragOverNode,
      setDropPosition: state.setDropPosition,
      calculateDropPosition: state.calculateDropPosition,
      findNode: state.findNode,
      getNodePath: state.getNodePath,
    })),
  };
}

/**
 * 키보드 단축키를 위한 Hook
 */
export function useBuilderKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useBuilderCommands();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z (Undo)
      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        if (canUndo) {
          undo();
        }
      }

      // Ctrl+Y 또는 Ctrl+Shift+Z (Redo)
      if ((event.ctrlKey && event.key === "y") || (event.ctrlKey && event.shiftKey && event.key === "z")) {
        event.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

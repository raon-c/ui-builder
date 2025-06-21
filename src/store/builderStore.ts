"use client";

// AIDEV-NOTE: 빌더 상태 관리 스토어 - 캔버스, 선택된 노드, 드래그 앤 드롭 상태 관리
// Zustand + immer로 불변성 보장하면서 중첩 객체 업데이트 간소화

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { generateNodeId } from "@/lib/nanoid";
import { isContainerComponent } from "@/lib/utils";
import type { BuilderComponentType } from "@/types/component";
import type { CanvasNode, Screen } from "@/types/project";

interface BuilderState {
  // 현재 편집 중인 화면
  currentScreen: Screen | null;

  // 선택된 노드 ID
  selectedNodeId: string | null;

  // 드래그 중인 컴포넌트 타입 (팔레트에서 드래그 시)
  draggedComponentType: BuilderComponentType | null;

  // 드래그 오버 상태 (드롭 존 하이라이트용)
  dragOverNodeId: string | null;

  // 드롭 위치 정보
  dropPosition: {
    parentId: string | null;
    index: number;
    position: "top" | "bottom" | "inside";
  } | null;

  // 액션들
  setCurrentScreen: (screen: Screen) => void;
  setSelectedNode: (nodeId: string | null) => void;

  // 노드 조작
  addNode: (
    parentId: string,
    componentType: BuilderComponentType,
    index?: number,
  ) => void;
  addNodeAtDropPosition: (componentType: BuilderComponentType) => void;
  removeNode: (nodeId: string) => void;
  moveNode: (nodeId: string, newParentId: string, newIndex: number) => void;
  moveNodeAtDropPosition: (nodeId: string) => void;
  reorderNodes: (nodeId: string, newIndex: number) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;

  // 드래그 앤 드롭 상태
  setDraggedComponentType: (type: BuilderComponentType | null) => void;
  setDragOverNode: (nodeId: string | null) => void;
  setDropPosition: (
    position: {
      parentId: string | null;
      index: number;
      position: "top" | "bottom" | "inside";
    } | null,
  ) => void;
  calculateDropPosition: (
    activeId: string,
    overId: string,
    clientY: number,
  ) => void;

  // 유틸리티
  findNode: (nodeId: string) => CanvasNode | null;
  getNodePath: (nodeId: string) => string[];
}

export const useBuilderStore = create<BuilderState>()(
  immer((set, get) => ({
    // 초기 상태
    currentScreen: null,
    selectedNodeId: null,
    draggedComponentType: null,
    dragOverNodeId: null,
    dropPosition: null,

    // 현재 화면 설정
    setCurrentScreen: (screen: Screen) => {
      set((state) => {
        state.currentScreen = screen;
        state.selectedNodeId = null; // 화면 변경 시 선택 해제
      });
    },

    // 노드 선택
    setSelectedNode: (nodeId: string | null) => {
      set((state) => {
        state.selectedNodeId = nodeId;
      });
    },

    // 새 노드 추가
    addNode: (
      parentId: string,
      componentType: BuilderComponentType,
      index?: number,
    ) => {
      set((state) => {
        if (!state.currentScreen) return;

        const parent = findNodeInTree(state.currentScreen.content, parentId);
        if (!parent) return;

        if (!isContainerComponent(parent.type)) {
          // 부모가 컨테이너 타입이 아니면 자식 추가 불가
          console.warn(`${parent.type} 컴포넌트는 자식을 가질 수 없습니다.`);
          return;
        }

        const newNode: CanvasNode = {
          id: generateNodeId(),
          type: componentType,
          props: getDefaultProps(componentType),
          children: [],
        };

        if (index !== undefined) {
          parent.children.splice(index, 0, newNode);
        } else {
          parent.children.push(newNode);
        }

        // 새로 추가된 노드를 선택
        state.selectedNodeId = newNode.id;
      });
    },

    // dropPosition을 사용해서 정확한 위치에 노드 추가
    addNodeAtDropPosition: (componentType: BuilderComponentType) => {
      set((state) => {
        if (!state.currentScreen || !state.dropPosition) return;

        const { parentId, index } = state.dropPosition;
        if (!parentId) return;

        const parent = findNodeInTree(state.currentScreen.content, parentId);
        if (!parent || !isContainerComponent(parent.type)) {
          console.warn(
            `${parent?.type || "Unknown"} 컴포넌트는 자식을 가질 수 없습니다.`,
          );
          return;
        }

        const newNode: CanvasNode = {
          id: generateNodeId(),
          type: componentType,
          props: getDefaultProps(componentType),
          children: [],
        };

        parent.children.splice(index, 0, newNode);
        state.selectedNodeId = newNode.id;
        state.dropPosition = null; // 드롭 완료 후 리셋
      });
    },

    // 노드 제거
    removeNode: (nodeId: string) => {
      set((state) => {
        if (!state.currentScreen) return;

        const removed = removeNodeFromTree(state.currentScreen.content, nodeId);
        if (removed && state.selectedNodeId === nodeId) {
          state.selectedNodeId = null;
        }
      });
    },

    // 노드 이동 (다른 부모로)
    moveNode: (nodeId: string, newParentId: string, newIndex: number) => {
      set((state) => {
        if (!state.currentScreen) return;

        const newParent = findNodeInTree(
          state.currentScreen.content,
          newParentId,
        );
        if (!newParent || !isContainerComponent(newParent.type)) {
          console.warn(
            `${newParent?.type || "Unknown"} 컴포넌트는 자식을 가질 수 없습니다.`,
          );
          return;
        }

        // 기존 위치에서 노드 제거
        const node = removeNodeFromTree(state.currentScreen.content, nodeId);
        if (!node) return;

        // 새 위치에 노드 추가
        newParent.children.splice(newIndex, 0, node);
      });
    },

    // dropPosition을 사용해서 정확한 위치로 노드 이동
    moveNodeAtDropPosition: (nodeId: string) => {
      set((state) => {
        if (!state.currentScreen || !state.dropPosition) return;

        const { parentId, index } = state.dropPosition;
        if (!parentId) return;

        const newParent = findNodeInTree(state.currentScreen.content, parentId);
        if (!newParent || !isContainerComponent(newParent.type)) {
          console.warn(
            `${newParent?.type || "Unknown"} 컴포넌트는 자식을 가질 수 없습니다.`,
          );
          return;
        }

        // 기존 위치에서 노드 제거
        const node = removeNodeFromTree(state.currentScreen.content, nodeId);
        if (!node) return;

        // 새 위치에 노드 추가
        newParent.children.splice(index, 0, node);
        state.dropPosition = null; // 드롭 완료 후 리셋
      });
    },

    // 같은 부모 내에서 순서 변경
    reorderNodes: (nodeId: string, newIndex: number) => {
      set((state) => {
        if (!state.currentScreen) return;

        const parent = findParentOfNode(state.currentScreen.content, nodeId);
        if (!parent) return;

        const currentIndex = parent.children.findIndex(
          (child: CanvasNode) => child.id === nodeId,
        );
        if (currentIndex === -1 || currentIndex === newIndex) return;

        // 노드를 새 위치로 이동
        const [movedNode] = parent.children.splice(currentIndex, 1);
        parent.children.splice(newIndex, 0, movedNode);
      });
    },

    // 노드 속성 업데이트
    updateNodeProps: (nodeId: string, props: Record<string, unknown>) => {
      set((state) => {
        if (!state.currentScreen) return;

        const node = findNodeInTree(state.currentScreen.content, nodeId);
        if (node) {
          node.props = { ...node.props, ...props };
        }
      });
    },

    // 드래그 상태 관리
    setDraggedComponentType: (type: BuilderComponentType | null) => {
      set((state) => {
        state.draggedComponentType = type;
      });
    },

    setDragOverNode: (nodeId: string | null) => {
      set((state) => {
        state.dragOverNodeId = nodeId;
      });
    },

    setDropPosition: (position) => {
      set((state) => {
        state.dropPosition = position;
      });
    },

    calculateDropPosition: (
      activeId: string,
      overId: string,
      clientY: number,
    ) => {
      set((state) => {
        if (!state.currentScreen) return;

        const overNode = findNodeInTree(state.currentScreen.content, overId);
        if (!overNode) return;

        // 컨테이너인 경우 내부 드롭, 아닌 경우 형제로 드롭
        if (isContainerComponent(overNode.type)) {
          state.dropPosition = {
            parentId: overId,
            index: overNode.children.length, // 마지막 위치
            position: "inside",
          };
        } else {
          // 형제 노드로 드롭 - 부모를 찾아서 인덱스 계산
          const parent = findParentOfNode(state.currentScreen.content, overId);
          if (parent) {
            const siblingIndex = parent.children.findIndex(
              (child: CanvasNode) => child.id === overId,
            );
            state.dropPosition = {
              parentId: parent.id,
              index: siblingIndex + 1, // 다음 위치에 삽입
              position: "bottom",
            };
          }
        }
      });
    },

    // 노드 찾기
    findNode: (nodeId: string) => {
      const state = get();
      if (!state.currentScreen) return null;
      return findNodeInTree(state.currentScreen.content, nodeId);
    },

    // 노드 경로 가져오기 (브레드크럼용)
    getNodePath: (nodeId: string) => {
      const state = get();
      if (!state.currentScreen) return [];
      return getNodePathInTree(state.currentScreen.content, nodeId);
    },
  })),
);

// 헬퍼 함수들

/**
 * 트리에서 노드 찾기
 */
function findNodeInTree(root: CanvasNode, targetId: string): CanvasNode | null {
  if (root.id === targetId) return root;

  for (const child of root.children) {
    const found = findNodeInTree(child, targetId);
    if (found) return found;
  }

  return null;
}

/**
 * 트리에서 노드 제거하고 반환
 */
function removeNodeFromTree(
  root: CanvasNode,
  targetId: string,
): CanvasNode | null {
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].id === targetId) {
      return root.children.splice(i, 1)[0];
    }

    const found = removeNodeFromTree(root.children[i], targetId);
    if (found) return found;
  }

  return null;
}

/**
 * 노드의 부모 찾기
 */
function findParentOfNode(
  root: CanvasNode,
  targetId: string,
): CanvasNode | null {
  for (const child of root.children) {
    if (child.id === targetId) {
      return root;
    }
    const found = findParentOfNode(child, targetId);
    if (found) return found;
  }
  return null;
}

/**
 * 노드 경로 가져오기
 */
function getNodePathInTree(
  root: CanvasNode,
  targetId: string,
  path: string[] = [],
): string[] {
  if (root.id === targetId) {
    return [...path, root.id];
  }

  for (const child of root.children) {
    const found = getNodePathInTree(child, targetId, [...path, root.id]);
    if (found.length > 0) return found;
  }

  return [];
}

/**
 * 컴포넌트 타입별 기본 props
 */
function getDefaultProps(
  componentType: BuilderComponentType,
): Record<string, unknown> {
  const defaultProps: Record<BuilderComponentType, Record<string, unknown>> = {
    // Layout
    Container: { className: "p-2" },
    Grid: { cols: 2, gap: 4, className: "grid" },
    Flex: { direction: "row", gap: 2, className: "flex" },
    Card: { className: "p-3" },
    Modal: { title: "모달 제목", className: "" },
    Drawer: { title: "드로어 제목", className: "" },
    Tabs: { defaultValue: "tab1", className: "" },

    // Basic
    Text: { text: "텍스트를 입력하세요", className: "" },
    Heading: { level: 2, text: "제목을 입력하세요", className: "" },
    Button: { text: "버튼", variant: "default", size: "md" },
    Link: { text: "링크", href: "#", className: "" },
    Divider: { className: "my-4" },
    Icon: { name: "star", size: 24 },

    // Form
    Input: { placeholder: "입력하세요", type: "text" },
    Textarea: { placeholder: "내용을 입력하세요", rows: 3 },
    Select: { placeholder: "선택하세요", options: [] },
    Radio: { name: "radio-group", value: "", label: "라디오" },
    Checkbox: { label: "체크박스", checked: false },
    Switch: { label: "스위치", checked: false },
    NumberInput: { placeholder: "숫자를 입력하세요", min: 0 },
    DatePicker: { placeholder: "날짜를 선택하세요" },
    Label: { text: "라벨", htmlFor: "" },

    // Data Display
    Table: { columns: [], data: [] },
    Tag: { text: "태그", variant: "default" },
    Badge: { text: "배지", variant: "default" },
    Avatar: { src: "", alt: "아바타", fallback: "A" },

    // Feedback
    Alert: { title: "알림", description: "알림 내용", variant: "default" },
    Toast: { title: "토스트", description: "토스트 내용" },
    Spinner: { size: "md" },
    Progress: { value: 50, max: 100 },
  };

  return defaultProps[componentType] || {};
}

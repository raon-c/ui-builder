// AIDEV-NOTE: Command Factory - 빌더 작업을 Command로 변환하는 팩토리 함수들
// 기존 빌더 스토어 API를 Command Pattern으로 래핑하여 Undo/Redo 지원

import { generateNodeId } from "@/lib/nanoid";
import { useBuilderStore } from "@/store/builderStore";
import type { BuilderComponentType } from "@/types/component";
import type { CanvasNode, Screen } from "@/types/project";
import {
  AddNodeCommand,
  BatchCommand,
  MoveNodeCommand,
  RemoveNodeCommand,
  ReorderNodesCommand,
  SetScreenCommand,
  UpdatePropsCommand,
} from "./builderCommands";
import type {
  AddNodeCommandData,
  BatchCommandsData,
  Command,
  MoveNodeCommandData,
  RemoveNodeCommandData,
  ReorderNodesCommandData,
  SetScreenCommandData,
  UpdatePropsCommandData,
} from "./types";

/**
 * 노드 추가 Command 생성
 */
export function createAddNodeCommand(
  parentId: string,
  componentType: BuilderComponentType,
  index: number,
  props?: Record<string, unknown>,
): AddNodeCommand {
  const data: AddNodeCommandData = {
    parentId,
    componentType,
    index,
    nodeId: generateNodeId(),
    props: props || getDefaultProps(componentType),
  };

  return new AddNodeCommand(data);
}

/**
 * 노드 제거 Command 생성
 */
export function createRemoveNodeCommand(nodeId: string): RemoveNodeCommand | null {
  const store = useBuilderStore.getState();

  if (!store.currentScreen) {
    console.warn("No current screen for remove command");
    return null;
  }

  // 제거할 노드와 부모 정보 수집
  const nodeData = findNodeInTree(store.currentScreen.content, nodeId);
  const parent = findParentOfNode(store.currentScreen.content, nodeId);

  if (!nodeData || !parent) {
    console.warn("Node or parent not found for remove command");
    return null;
  }

  const index = parent.children.findIndex((child) => child.id === nodeId);

  const data: RemoveNodeCommandData = {
    nodeId,
    parentId: parent.id,
    index,
    nodeData: JSON.parse(JSON.stringify(nodeData)), // 깊은 복사
  };

  return new RemoveNodeCommand(data);
}

/**
 * 노드 이동 Command 생성
 */
export function createMoveNodeCommand(nodeId: string, newParentId: string, newIndex: number): MoveNodeCommand | null {
  const store = useBuilderStore.getState();

  if (!store.currentScreen) {
    console.warn("No current screen for move command");
    return null;
  }

  // 현재 위치 정보 수집
  const oldParent = findParentOfNode(store.currentScreen.content, nodeId);

  if (!oldParent) {
    console.warn("Old parent not found for move command");
    return null;
  }

  const oldIndex = oldParent.children.findIndex((child) => child.id === nodeId);

  const data: MoveNodeCommandData = {
    nodeId,
    oldParentId: oldParent.id,
    oldIndex,
    newParentId,
    newIndex,
  };

  return new MoveNodeCommand(data);
}

/**
 * 속성 업데이트 Command 생성
 */
export function createUpdatePropsCommand(nodeId: string, newProps: Record<string, unknown>): UpdatePropsCommand | null {
  const store = useBuilderStore.getState();

  if (!store.currentScreen) {
    console.warn("No current screen for update props command");
    return null;
  }

  const node = findNodeInTree(store.currentScreen.content, nodeId);

  if (!node) {
    console.warn("Node not found for update props command");
    return null;
  }

  const data: UpdatePropsCommandData = {
    nodeId,
    oldProps: JSON.parse(JSON.stringify(node.props)), // 깊은 복사
    newProps,
  };

  return new UpdatePropsCommand(data);
}

/**
 * 노드 순서 변경 Command 생성
 */
export function createReorderNodesCommand(nodeId: string, newIndex: number): ReorderNodesCommand | null {
  const store = useBuilderStore.getState();

  if (!store.currentScreen) {
    console.warn("No current screen for reorder command");
    return null;
  }

  const parent = findParentOfNode(store.currentScreen.content, nodeId);

  if (!parent) {
    console.warn("Parent not found for reorder command");
    return null;
  }

  const oldIndex = parent.children.findIndex((child) => child.id === nodeId);

  const data: ReorderNodesCommandData = {
    parentId: parent.id,
    nodeId,
    oldIndex,
    newIndex,
  };

  return new ReorderNodesCommand(data);
}

/**
 * 화면 설정 Command 생성
 */
export function createSetScreenCommand(newScreen: Screen | null): SetScreenCommand {
  const store = useBuilderStore.getState();

  const data: SetScreenCommandData = {
    oldScreen: store.currentScreen,
    newScreen,
  };

  return new SetScreenCommand(data);
}

/**
 * 배치 Command 생성 (여러 명령을 하나로 묶기)
 */
export function createBatchCommand(commands: Command[], description: string): BatchCommand {
  const data: BatchCommandsData = {
    commands,
    description,
  };

  return new BatchCommand(data);
}

/**
 * 드롭 위치에 노드 추가하는 Command 생성
 */
export function createAddNodeAtDropPositionCommand(componentType: BuilderComponentType): AddNodeCommand | null {
  const store = useBuilderStore.getState();

  if (!store.dropPosition) {
    console.warn("No drop position for add node command");
    return null;
  }

  const { parentId, index } = store.dropPosition;

  if (!parentId) {
    console.warn("No parent ID in drop position");
    return null;
  }

  return createAddNodeCommand(parentId, componentType, index);
}

/**
 * 드롭 위치로 노드 이동하는 Command 생성
 */
export function createMoveNodeAtDropPositionCommand(nodeId: string): MoveNodeCommand | null {
  const store = useBuilderStore.getState();

  if (!store.dropPosition) {
    console.warn("No drop position for move node command");
    return null;
  }

  const { parentId, index } = store.dropPosition;

  if (!parentId) {
    console.warn("No parent ID in drop position");
    return null;
  }

  return createMoveNodeCommand(nodeId, parentId, index);
}

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
 * 노드의 부모 찾기
 */
function findParentOfNode(root: CanvasNode, targetId: string): CanvasNode | null {
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
 * 컴포넌트 타입별 기본 props
 */
function getDefaultProps(componentType: BuilderComponentType): Record<string, unknown> {
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

// AIDEV-NOTE: 빌더 관련 Command 구현체들 - 각 편집 작업에 대한 실행/취소 로직
// 빌더 스토어와 연동하여 실제 상태 변경과 복원을 처리

import { generateNodeId } from "@/lib/nanoid";
import { useBuilderStore } from "@/store/builderStore";
import type { CanvasNode } from "@/types/project";
import type {
  AddNodeCommandData,
  BatchCommandsData,
  Command,
  CommandType,
  MoveNodeCommandData,
  RemoveNodeCommandData,
  ReorderNodesCommandData,
  SetScreenCommandData,
  UpdatePropsCommandData,
} from "./types";

/**
 * 기본 Command 클래스
 */
abstract class BaseCommand implements Command {
  public readonly id: string;
  public readonly type: CommandType;
  public readonly timestamp: number;
  public readonly description: string;

  constructor(type: CommandType, description: string) {
    this.id = generateNodeId();
    this.type = type;
    this.timestamp = Date.now();
    this.description = description;
  }

  abstract execute(): void;
  abstract undo(): void;
}

/**
 * 노드 추가 명령
 */
export class AddNodeCommand extends BaseCommand {
  private data: AddNodeCommandData;

  constructor(data: AddNodeCommandData) {
    super("ADD_NODE", `Add ${data.componentType} component`);
    this.data = data;
  }

  execute(): void {
    const store = useBuilderStore.getState();

    // 새 노드 생성
    const newNode: CanvasNode = {
      id: this.data.nodeId,
      type: this.data.componentType,
      props: { ...this.data.props },
      children: [],
    };

    // 빌더 스토어의 저수준 API 사용하여 노드 추가
    if (store.currentScreen) {
      const parent = this.findNode(store.currentScreen.content, this.data.parentId);
      if (parent) {
        parent.children.splice(this.data.index, 0, newNode);
        store.setSelectedNode(newNode.id);
      }
    }
  }

  undo(): void {
    const store = useBuilderStore.getState();

    if (store.currentScreen) {
      const parent = this.findNode(store.currentScreen.content, this.data.parentId);
      if (parent) {
        const nodeIndex = parent.children.findIndex((child) => child.id === this.data.nodeId);
        if (nodeIndex !== -1) {
          parent.children.splice(nodeIndex, 1);

          // 선택된 노드가 제거된 노드라면 선택 해제
          if (store.selectedNodeId === this.data.nodeId) {
            store.setSelectedNode(null);
          }
        }
      }
    }
  }

  private findNode(root: CanvasNode, targetId: string): CanvasNode | null {
    if (root.id === targetId) return root;

    for (const child of root.children) {
      const found = this.findNode(child, targetId);
      if (found) return found;
    }

    return null;
  }
}

/**
 * 노드 제거 명령
 */
export class RemoveNodeCommand extends BaseCommand {
  private data: RemoveNodeCommandData;

  constructor(data: RemoveNodeCommandData) {
    super("REMOVE_NODE", `Remove ${data.nodeData.type} component`);
    this.data = data;
  }

  execute(): void {
    const store = useBuilderStore.getState();

    if (store.currentScreen) {
      const parent = this.findNode(store.currentScreen.content, this.data.parentId);
      if (parent) {
        const nodeIndex = parent.children.findIndex((child) => child.id === this.data.nodeId);
        if (nodeIndex !== -1) {
          parent.children.splice(nodeIndex, 1);

          // 선택된 노드가 제거된 노드라면 선택 해제
          if (store.selectedNodeId === this.data.nodeId) {
            store.setSelectedNode(null);
          }
        }
      }
    }
  }

  undo(): void {
    const store = useBuilderStore.getState();

    if (store.currentScreen) {
      const parent = this.findNode(store.currentScreen.content, this.data.parentId);
      if (parent) {
        // 원래 위치에 노드 복원
        parent.children.splice(this.data.index, 0, this.data.nodeData);
        store.setSelectedNode(this.data.nodeId);
      }
    }
  }

  private findNode(root: CanvasNode, targetId: string): CanvasNode | null {
    if (root.id === targetId) return root;

    for (const child of root.children) {
      const found = this.findNode(child, targetId);
      if (found) return found;
    }

    return null;
  }
}

/**
 * 노드 이동 명령
 */
export class MoveNodeCommand extends BaseCommand {
  private data: MoveNodeCommandData;

  constructor(data: MoveNodeCommandData) {
    super("MOVE_NODE", "Move component");
    this.data = data;
  }

  execute(): void {
    const store = useBuilderStore.getState();

    if (store.currentScreen) {
      // 기존 위치에서 노드 제거
      const oldParent = this.findNode(store.currentScreen.content, this.data.oldParentId);
      const newParent = this.findNode(store.currentScreen.content, this.data.newParentId);

      if (oldParent && newParent) {
        const nodeIndex = oldParent.children.findIndex((child) => child.id === this.data.nodeId);
        if (nodeIndex !== -1) {
          const [node] = oldParent.children.splice(nodeIndex, 1);
          newParent.children.splice(this.data.newIndex, 0, node);
        }
      }
    }
  }

  undo(): void {
    const store = useBuilderStore.getState();

    if (store.currentScreen) {
      // 원래 위치로 노드 복원
      const oldParent = this.findNode(store.currentScreen.content, this.data.oldParentId);
      const newParent = this.findNode(store.currentScreen.content, this.data.newParentId);

      if (oldParent && newParent) {
        const nodeIndex = newParent.children.findIndex((child) => child.id === this.data.nodeId);
        if (nodeIndex !== -1) {
          const [node] = newParent.children.splice(nodeIndex, 1);
          oldParent.children.splice(this.data.oldIndex, 0, node);
        }
      }
    }
  }

  private findNode(root: CanvasNode, targetId: string): CanvasNode | null {
    if (root.id === targetId) return root;

    for (const child of root.children) {
      const found = this.findNode(child, targetId);
      if (found) return found;
    }

    return null;
  }
}

/**
 * 속성 업데이트 명령
 */
export class UpdatePropsCommand extends BaseCommand {
  private data: UpdatePropsCommandData;

  constructor(data: UpdatePropsCommandData) {
    super("UPDATE_PROPS", "Update component properties");
    this.data = data;
  }

  execute(): void {
    const store = useBuilderStore.getState();

    if (store.currentScreen) {
      const node = this.findNode(store.currentScreen.content, this.data.nodeId);
      if (node) {
        node.props = { ...node.props, ...this.data.newProps };
      }
    }
  }

  undo(): void {
    const store = useBuilderStore.getState();

    if (store.currentScreen) {
      const node = this.findNode(store.currentScreen.content, this.data.nodeId);
      if (node) {
        node.props = { ...this.data.oldProps };
      }
    }
  }

  private findNode(root: CanvasNode, targetId: string): CanvasNode | null {
    if (root.id === targetId) return root;

    for (const child of root.children) {
      const found = this.findNode(child, targetId);
      if (found) return found;
    }

    return null;
  }
}

/**
 * 노드 순서 변경 명령
 */
export class ReorderNodesCommand extends BaseCommand {
  private data: ReorderNodesCommandData;

  constructor(data: ReorderNodesCommandData) {
    super("REORDER_NODES", "Reorder components");
    this.data = data;
  }

  execute(): void {
    const store = useBuilderStore.getState();

    if (store.currentScreen) {
      const parent = this.findNode(store.currentScreen.content, this.data.parentId);
      if (parent) {
        const currentIndex = parent.children.findIndex((child) => child.id === this.data.nodeId);
        if (currentIndex !== -1 && currentIndex !== this.data.newIndex) {
          const [node] = parent.children.splice(currentIndex, 1);
          parent.children.splice(this.data.newIndex, 0, node);
        }
      }
    }
  }

  undo(): void {
    const store = useBuilderStore.getState();

    if (store.currentScreen) {
      const parent = this.findNode(store.currentScreen.content, this.data.parentId);
      if (parent) {
        const currentIndex = parent.children.findIndex((child) => child.id === this.data.nodeId);
        if (currentIndex !== -1 && currentIndex !== this.data.oldIndex) {
          const [node] = parent.children.splice(currentIndex, 1);
          parent.children.splice(this.data.oldIndex, 0, node);
        }
      }
    }
  }

  private findNode(root: CanvasNode, targetId: string): CanvasNode | null {
    if (root.id === targetId) return root;

    for (const child of root.children) {
      const found = this.findNode(child, targetId);
      if (found) return found;
    }

    return null;
  }
}

/**
 * 화면 설정 명령
 */
export class SetScreenCommand extends BaseCommand {
  private data: SetScreenCommandData;

  constructor(data: SetScreenCommandData) {
    super("SET_SCREEN", `Switch to ${data.newScreen?.name || "no screen"}`);
    this.data = data;
  }

  execute(): void {
    const store = useBuilderStore.getState();
    store.setCurrentScreen(this.data.newScreen);
  }

  undo(): void {
    const store = useBuilderStore.getState();
    store.setCurrentScreen(this.data.oldScreen);
  }
}

/**
 * 배치 명령 (여러 명령을 하나로 묶어서 처리)
 */
export class BatchCommand extends BaseCommand {
  private data: BatchCommandsData;

  constructor(data: BatchCommandsData) {
    super("BATCH_COMMANDS", data.description);
    this.data = data;
  }

  execute(): void {
    // 순서대로 모든 명령 실행
    for (const command of this.data.commands) {
      command.execute();
    }
  }

  undo(): void {
    // 역순으로 모든 명령 취소
    for (let i = this.data.commands.length - 1; i >= 0; i--) {
      this.data.commands[i].undo();
    }
  }
}
